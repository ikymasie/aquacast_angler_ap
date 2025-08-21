
import type { Location, HourPoint, DayContext, WeatherApiResponse, RecentWindow } from "@/lib/types";
import { format, subDays } from "date-fns";

const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";

const HOURLY_FORECAST_VARS = [
    "temperature_2m", "relative_humidity_2m", "precipitation",
    "cloud_cover", "pressure_msl", "wind_speed_10m", "wind_direction_10m",
    "dew_point_2m", "uv_index", "shortwave_radiation"
].join(",");

const DAILY_FORECAST_VARS = [
    "sunrise", "sunset", "uv_index_max"
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
    if (n < 2) return 0;
    const mean = data.reduce((a, b) => a + b) / n;
    return Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1));
}

export async function fetchWeatherData(location: Location): Promise<WeatherApiResponse> {
    const { latitude, longitude } = location;
    
    // Fetch 7-day forecast data. Open-Meteo defaults to starting from the current day.
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
        throw new Error(`Failed to fetch forecast data: ${errorData.reason || 'Unknown API error'}`);
    }
    const forecastData = await forecastResponse.json();

    if (!forecastData.hourly || !forecastData.hourly.time || forecastData.hourly.time.length === 0) {
        throw new Error("Received incomplete hourly forecast data from API.");
    }
    
    const hourlyData = forecastData.hourly;

    const hourly: HourPoint[] = hourlyData.time.map((t: string, i: number): HourPoint => {
        const currentPressure = hourlyData.pressure_msl[i];
        const pressure3hAgo = i >= 3 ? hourlyData.pressure_msl[i-3] : null;
        const pressureTrend3h = (pressure3hAgo !== null && currentPressure !== null) ? currentPressure - pressure3hAgo : 0;
        
        return {
            t,
            tempC: hourlyData.temperature_2m[i],
            rh: hourlyData.relative_humidity_2m[i],
            precipMm: hourlyData.precipitation[i],
            cloudPct: hourlyData.cloud_cover[i],
            pressureHpa: currentPressure,
            windKph: hourlyData.wind_speed_10m[i],
            windDeg: hourlyData.wind_direction_10m[i],
            uv: hourlyData.uv_index[i],
            shortwave: hourlyData.shortwave_radiation[i],
            derived: {
                pressureTrend3h,
                light: hourlyData.shortwave_radiation[i] > 0 ? Math.min(hourlyData.shortwave_radiation[i] / 800, 1) : 0,
                windBeaufort: Math.round(Math.pow(hourlyData.wind_speed_10m[i] / 3.6 / 0.836, 2/3)),
            },
        };
    });

    const daily: DayContext[] = forecastData.daily.time.map((t:string, i:number): DayContext => ({
        sunrise: forecastData.daily.sunrise[i],
        sunset: forecastData.daily.sunset[i],
        moonPhase: 0.5, // Placeholder, as moon phase is not in free tier
        uvMax: forecastData.daily.uv_index_max[i],
    }));
    
    // Calculate recent window values from the first 24-48 hours of the forecast
    const recentTemperatures = hourly.slice(0, 48).map(h => h.tempC).filter(t => t !== null) as number[];
    const recentPressures = hourly.slice(0, 48).map(h => h.pressureHpa).filter(p => p !== null) as number[];

    const waterTempC = recentTemperatures.length > 0 
        ? calculateEMA(recentTemperatures, 72) * 0.8 + calculateEMA(recentTemperatures.slice(0, 12), 12) * 0.2
        : 15; // fallback
        
    const stdTemp = calculateStdDev(recentTemperatures);
    const stdPressure = calculateStdDev(recentPressures);
    const stdTempPressure = Math.sqrt(stdTemp*stdTemp + stdPressure*stdPressure); 

    const recent: RecentWindow = {
        waterTempC,
        stdTempPressure,
    };

    return { hourly, daily, recent };
}
