
export type Species = 'Bream' | 'Bass' | 'Carp';

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

// Simplified weather data from the original mock
export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  pressure: number;
  pressureTrend: 'rising' | 'falling' | 'steady';
  cloudCover: number;
  condition: string;
}

export interface HourlyForecastData extends WeatherData {
  time: string;
}

// New detailed types for Open-Meteo data and scoring
export type HourPoint = {
  t: string; // ISO
  tempC: number;
  rh: number;
  windKph: number;
  windDeg: number;
  pressureHpa: number;
  cloudPct: number;
  precipMm: number;
  uv: number;
  shortwave: number;
  derived: {
    pressureTrend3h: number;
    light: number;
    windBeaufort: number;
  };
};

export type DayContext = {
  sunrise: string;
  sunset: string;
  moonPhase: number;
  uvMax: number;
};

export interface RecentWindow {
    waterTempC: number;
    stdTempPressure: number;
}

export interface WeatherApiResponse {
    hourly: HourPoint[];
    daily: DayContext;
    recent: RecentWindow;
}

export interface ScoredHour {
    time: string; // Can be ISO string or formatted time like '3pm'
    score: number;
}

export type DaypartName = 'Morning' | 'Midday' | 'Afternoon' | 'Evening' | 'Night';
export type ScoreStatus = "Poor" | "Fair" | "Good" | "Excellent";

export interface DaypartScore {
    name: DaypartName;
    score: number;
    status: ScoreStatus;
    hasWindow: boolean;
    isCurrent: boolean;
}

export interface OverallDayScore {
    dayAvgScore: number;
    dayStatus: ScoreStatus;
    bestWindow: {
        start: string;
        end: string;
        status: ScoreStatus;
    } | null;
}


// Mock data for fallback or initial state
export const MOCK_LOCATION: Location = {
  name: "Lake Harmony, PA",
  latitude: 41.05,
  longitude: -75.65,
};

export const MOCK_CURRENT_CONDITIONS: WeatherData = {
  temperature: 22,
  windSpeed: 10,
  windDirection: 'SW',
  humidity: 65,
  pressure: 1012,
  pressureTrend: 'falling',
  cloudCover: 75,
  condition: 'Partly Cloudy'
};

export const MOCK_HOURLY_FORECAST: HourlyForecastData[] = [
  { time: 'Now', temperature: 22, condition: 'Partly Cloudy', windSpeed: 10, windDirection: 'SW', humidity: 65, pressure: 1012, pressureTrend: 'falling', cloudCover: 75 },
  { time: '3 PM', temperature: 23, condition: 'Partly Cloudy', windSpeed: 12, windDirection: 'SW', humidity: 63, pressure: 1011, pressureTrend: 'falling', cloudCover: 70 },
  { time: '4 PM', temperature: 22, condition: 'Cloudy', windSpeed: 15, windDirection: 'S', humidity: 68, pressure: 1010, pressureTrend: 'falling', cloudCover: 85 },
  { time: '5 PM', temperature: 21, condition: 'Showers', windSpeed: 13, windDirection: 'S', humidity: 75, pressure: 1010, pressureTrend: 'steady', cloudCover: 95 },
];

export const MOCK_FORECAST_GRAPHS = {
  hourly: [
    { time: '2pm', success: 75 },
    { time: '3pm', success: 78 },
    { time: '4pm', success: 70 },
    { time: '5pm', success: 65 },
    { time: '6pm', success: 85 },
    { time: '7pm', success: 90 },
    { time: '8pm', success: 82 },
    { time: '9pm', success: 76 },
    { time: '10pm', success: 68 },
    { time: '11pm', success: 60 },
    { time: '12am', success: 55 },
    { time: '1am', success: 58 },
  ],
  daily: [
    { day: 'Mon', success: 75, uv: 5 },
    { day: 'Tue', success: 82, uv: 7 },
    { day: 'Wed', success: 65, uv: 3 },
    { day: 'Thu', success: 88, uv: 8 },
    { day: 'Fri', success: 92, uv: 9 },
    { day: 'Sat', success: 70, uv: 6 },
    { day: 'Sun', success: 78, uv: 7 },
  ]
};
