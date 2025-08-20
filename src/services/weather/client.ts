'use client';

import type { Location, WeatherApiResponse } from "@/lib/types";
import { format, subDays, isAfter } from "date-fns";

const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_KEY_PREFIX = 'weather-cache-';
const CACHE_EXPIRATION_HOURS = 1; // Cache for 1 hour

// Re-using parts of the server-side fetcher for consistency
const HOURLY_FORECAST_VARS = [
    "temperature_2m", "relative_humidity_2m", "precipitation",
    "cloud_cover", "pressure_msl", "wind_speed_10m", "wind_direction_10m",
    "dew_point_2m", "uv_index", "shortwave_radiation"
].join(",");

const DAILY_FORECAST_VARS = [
    "sunrise", "sunset", "uv_index_max"
].join(",");


interface CachedWeatherData {
    timestamp: string; // ISO string
    data: WeatherApiResponse;
}

/**
 * Generates a unique cache key for a given location.
 * @param location The location object.
 * @returns A string to be used as a local storage key.
 */
function getCacheKey(location: Location): string {
    return `${CACHE_KEY_PREFIX}${location.latitude.toFixed(3)}-${location.longitude.toFixed(3)}`;
}

/**
 * Fetches weather data from the Open-Meteo API.
 * This is the core fetching logic without caching.
 * @param location The location for which to fetch weather data.
 * @returns A promise that resolves to the weather data.
 */
async function fetchWeatherDataFromServer(location: Location): Promise<WeatherApiResponse> {
    const { latitude, longitude } = location;
    
    const forecastParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        hourly: HOURLY_FORECAST_VARS,
        daily: DAILY_FORECAST_VARS,
        timezone: "auto",
        forecast_days: "7"
    });
    const forecastUrl = `${FORECAST_API_URL}?${forecastParams.toString()}`;
    
    const response = await fetch(forecastUrl);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch forecast data: ${errorData.reason || 'Unknown error'}`);
    }
    
    const forecastData = await response.json();

    // The client service does not fetch historical data to keep it simple.
    // We will return a simplified version of the WeatherApiResponse.
    // The complex server-side calculations will be handled by the server action.
    // This client service is primarily for fetching and caching raw forecast data.
    return {
        hourly: forecastData.hourly.time.map((t: string, i: number) => ({
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
             derived: { // These will be calculated more accurately on the server
                pressureTrend3h: 0,
                light: 0,
                windBeaufort: 0,
            },
        })),
        daily: {
            sunrise: forecastData.daily.sunrise[0],
            sunset: forecastData.daily.sunset[0],
            moonPhase: 0.5, // Placeholder
            uvMax: forecastData.daily.uv_index_max[0],
        },
        recent: { // Placeholder, server action will provide real values
            waterTempC: 15,
            stdTempPressure: 1,
        }
    };
}

/**
 * Fetches weather data for a location, using local storage for caching.
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to the weather data.
 */
export async function getCachedWeatherData(location: Location): Promise<WeatherApiResponse> {
    if (typeof window === 'undefined') {
        // If called on the server, just fetch without caching
        return fetchWeatherDataFromServer(location);
    }

    const cacheKey = getCacheKey(location);
    const cachedItem = localStorage.getItem(cacheKey);

    if (cachedItem) {
        try {
            const { timestamp, data } = JSON.parse(cachedItem) as CachedWeatherData;
            const cacheDate = new Date(timestamp);
            const expirationDate = new Date(cacheDate.getTime() + CACHE_EXPIRATION_HOURS * 60 * 60 * 1000);

            if (isAfter(new Date(), expirationDate)) {
                // Cache is expired, fetch new data in the background
                console.log("Cache expired, fetching new data for", location.name);
                fetchAndCache(location); 
                return data; // Return stale data for immediate UI response
            }

            console.log("Returning cached data for", location.name);
            return data;
        } catch (error) {
            console.error("Failed to parse cached weather data:", error);
            localStorage.removeItem(cacheKey);
        }
    }

    // No valid cache, fetch fresh data
    return fetchAndCache(location);
}

/**
 * Fetches data from the server and caches it in local storage.
 * @param location The location to fetch and cache.
 * @returns The newly fetched weather data.
 */
async function fetchAndCache(location: Location): Promise<WeatherApiResponse> {
    console.log("Fetching and caching new weather data for", location.name);
    const data = await fetchWeatherDataFromServer(location);
    const cacheKey = getCacheKey(location);
    
    const cacheEntry: CachedWeatherData = {
        timestamp: new Date().toISOString(),
        data: data,
    };

    try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (error) {
        console.error("Failed to cache weather data in localStorage:", error);
    }
    
    return data;
}
