import type { Location, HourPoint, DayContext, WeatherApiResponse, RecentWindow } from "@/lib/types";
import { format, subDays } from "date-fns";

const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_API_URL = "https://archive-api.open-meteo.com/v1/archive";

const HOURLY_FORECAST_VARS = [
    "temperature_2m", "relative_humidity_2m", "precipitation",
    "cloud_cover", "pressure_msl", "wind_speed_10m", "wind_direction_10m",
    "dew_point_2m", "uv_index", "shortwave_radiation"
].join(",");

const DAILY_FORECAST_VARS = [
    "sunrise", "sunset", "uv_index_max"
].join(",");

const HOURLY_ARCHIVE_VARS = [
    "temperature_2m", "pressure_msl"
].join(",");

function calculateEMA(data: number[], span: number): number {
    if (data.length === 0) return 0;
    const k = 2 / (span + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
    }
    return ema;
}

function calculateStdDev(data: number[]): number {
    const n = data.length;
    if (n === 0) return 0;
    const mean = data.reduce((a, b) => a + b) / n;
    return Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

export async function fetchWeatherData(location: Location): Promise<WeatherApiResponse> {
    const { latitude, longitude } = location;
    const today = new Date();
    
    // Fetch forecast data
    const forecastParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        hourly: HOURLY_FORECAST_VARS,
        daily: DAILY_FORECAST_VARS,
        timezone: "auto",
        forecast_days: "7"
    });
    const forecastUrl = `${FORECAST_API_URL}?${forecastParams.toString()}`;
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json();
        throw new Error(`Failed to fetch forecast data: ${errorData.reason}`);
    }
    const forecastData = await forecastResponse.json();

    // Fetch archive data for trends
    const endDate = subDays(today, 1);
    const startDate = subDays(endDate, 3);
    const archiveParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        hourly: HOURLY_ARCHIVE_VARS,
        timezone: "auto",
    });
    const archiveUrl = `${ARCHIVE_API_URL}?${archiveParams.toString()}`;
    const archiveResponse = await fetch(archiveUrl);
     if (!archiveResponse.ok) {
        const errorData = await archiveResponse.json();
        throw new Error(`Failed to fetch archive data: ${errorData.reason}`);
    }
    const archiveData = await archiveResponse.json();

    // Combine and normalize data
    const fullHourlyData = [
        ...(archiveData.hourly?.time?.map((t: string, i: number) => ({
            t,
            tempC: archiveData.hourly.temperature_2m[i],
            pressureHpa: archiveData.hourly.pressure_msl[i],
        })) || []),
        ...forecastData.hourly.time.map((t: string, i: number) => ({
            t,
            tempC: forecastData.hourly.temperature_2m[i],
            rh: forecastData.hourly.relative_humidity_2m[i],
            precipMm: forecastData.hourly.precipitation[i],
            cloudPct: forecastData.hourly.cloud_cover[i],
            pressureHpa: forecastData.hourly.pressure_msl[i],
            windKph: forecastData.hourly.wind_speed_10m[i],
            windDeg: forecastData.hourly.wind_direction_10m[i],
            uv: forecastData.hourly.uv_index[i],
            shortwave: forecastData.hourly.shortwave_radiation[i],
        }))
    ];
    
    const hourly: HourPoint[] = forecastData.hourly.time.map((t: string, i: number): HourPoint => {
        const fullIndex = fullHourlyData.findIndex(h => h.t === t);
        const pressure3hAgo = fullIndex > 2 ? fullHourlyData[fullIndex - 3]?.pressureHpa : null;
        const currentPressure = forecastData.hourly.pressure_msl[i];
        const pressureTrend3h = (pressure3hAgo !== null && currentPressure !== null) ? currentPressure - pressure3hAgo : 0;
        
        return {
            t,
            tempC: forecastData.hourly.temperature_2m[i],
            rh: forecastData.hourly.relative_humidity_2m[i],
            precipMm: forecastData.hourly.precipitation[i],
            cloudPct: forecastData.hourly.cloud_cover[i],
            pressureHpa: currentPressure,
            windKph: forecastData.hourly.wind_speed_10m[i],
            windDeg: forecastData.hourly.wind_direction_10m[i],
            uv: forecastData.hourly.uv_index[i],
            shortwave: forecastData.hourly.shortwave_radiation[i],
            derived: {
                pressureTrend3h,
                light: forecastData.hourly.shortwave_radiation[i] > 0 ? Math.min(forecastData.hourly.shortwave_radiation[i] / 800, 1) : 0, // Approximation
                windBeaufort: Math.round(Math.pow(forecastData.hourly.wind_speed_10m[i] / 3.6 / 0.836, 2/3)), // m/s to beaufort
            },
        };
    });

    const daily: DayContext = {
        sunrise: forecastData.daily.sunrise[0],
        sunset: forecastData.daily.sunset[0],
        moonPhase: 0.5, // Default value as API does not provide it in daily forecast
        uvMax: forecastData.daily.uv_index_max[0],
    };
    
    // Calculate recent window values from archive data
    const recentTemperatures = (archiveData.hourly?.temperature_2m.filter((temp: number | null) => temp !== null) as number[]) || [];
    const recentPressures = (archiveData.hourly?.pressure_msl.filter((p: number | null) => p !== null) as number[]) || [];

    const waterTempC = recentTemperatures.length > 0 
        ? calculateEMA(recentTemperatures, 72) * 0.8 + calculateEMA(recentTemperatures.slice(-12), 12) * 0.2
        : 15; // fallback
    const stdTempPressure = recentTemperatures.length > 0 && recentPressures.length > 0 
        ? calculateStdDev([...recentTemperatures, ...recentPressures]) 
        : 1; // fallback
    
    const recent: RecentWindow = {
        waterTempC,
        stdTempPressure,
    };

    return { hourly, daily, recent };
}
