

export type Species = 'Bream' | 'Bass' | 'Carp';
export type LureFamily = 'Live' | 'Crank/Swim' | 'Spinner' | 'Soft';

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

export interface HourlyForecastData {
  time: string;
  temperature: number;
  condition: string;
  success: number;
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
    daily: DayContext[];
    recent: RecentWindow;
}

export interface ScoredHour {
    time: string; // Can be ISO string or formatted time like '3pm'
    score: number;
    condition: string;
    temperature: number;
}

export type ScoreStatus = "Prime" | "Very Good" | "Good" | "Fair" | "Fair-Slow" | "Poor" | "Very Poor";

export interface ThreeHourIntervalScore {
    label: string;
    score: number;
    status: ScoreStatus;
    condition: string;
    isCurrent: boolean;
}

export interface OverallDayScore {
    dayAvgScore: number;
    dayStatus: ScoreStatus;
}

export interface RecommendedWindow {
    start: string;
    end: string;
    avgScore: number;
}

export interface UserSpot {
    id: string;
    name: string;
    region: string;
    waterbody_type: string;
    nearest_town: string;
    coordinates: { lat: number, lon: number };
    representative_species: string[];
    notes: string;
    image_url: string;
    isFavorite?: boolean;
    isRecent?: boolean;
}

// --- Casting Advisor Types ---

export type SpotKey = 
  | 'windward_bank' | 'windward_point' | 'shade_cover' | 'flats_weeds'
  | 'inflow_creek' | 'transition_line' | 'current_seam' | 'behind_structure'
  | 'drop_off' | 'thermocline';

export interface CastingConditions {
  windKph: number;
  windDirDeg: number;
  cloudPct: number;
  pressureTrendHpaPer3h: number;
  rainMm24h: number;
  waterLevel: "rising" | "falling" | "stable";
  body: "lake" | "river";
  season: "cool" | "hot";
  daypart: "morning" | "midday" | "afternoon" | "evening" | "night";
  stability72h: "low" | "medium" | "high";
}

export interface RankedSpot {
    spotKey: SpotKey;
    label: string;
    score: number;
    band: ScoreStatus;
    primaryLure: LureFamily;
    altLure?: LureFamily;
    reasons: string[];
}

export interface RankingOutput {
    topPicks: RankedSpot[];
    confidenceScore: number;
    topPick: {
        spotKey: SpotKey;
        label: string;
        primaryLure: LureFamily;
    };
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
  { time: 'Now', temperature: 22, condition: 'Partly Cloudy', success: 75 },
  { time: '3 PM', temperature: 23, condition: 'Partly Cloudy', success: 80 },
  { time: '4 PM', temperature: 22, condition: 'Cloudy', success: 70 },
  { time: '5 PM', temperature: 21, condition: 'Showers', success: 65 },
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
