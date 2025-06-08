
export interface CurrentWeather {
  locationName: string;
  temperature: number; // Celsius
  description: string;
  humidity: number; // %
  precipitationChance: number; // %
  windSpeed: number; // m/s
  windDirection: string;
  pressure: number; // hPa
  visibility: number; // km
  icon: string;
  timestamp: number; // UTC milliseconds epoch (time of weather observation)
  timezoneOffsetSeconds: number; // Timezone offset from UTC in seconds for the location
  locationTimezoneName: string; // IANA timezone name for the location (e.g., "America/New_York")
  uvIndex?: number; // Optional UV Index
}

export interface HourlyForecast {
  time: number; // UTC milliseconds epoch for the start of the hour
  temperature: number;
  description: string;
  icon: string;
  precipitationChance: number; // %
}

export interface DailyForecast {
  date: string; // ISO string (representing the day, e.g., "2024-08-01T00:00:00.000Z")
  dayName: string;
  minTemp: number;
  maxTemp: number;
  description:string;
  icon: string;
  precipitationChance: number; // %
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

// Example: London, UK
export const mockWeatherData: WeatherData = {
  current: {
    locationName: "London, UK",
    temperature: 15,
    description: "Partly Cloudy",
    humidity: 70,
    precipitationChance: 10,
    windSpeed: 5,
    windDirection: "SW",
    pressure: 1012,
    visibility: 10,
    icon: "CloudSun",
    timestamp: new Date().getTime(), // UTC ms epoch
    timezoneOffsetSeconds: 0, 
    locationTimezoneName: "Europe/London",
    uvIndex: 5, // Example UV Index
  },
  hourly: [
    { time: new Date().setHours(14,0,0,0), temperature: 16, description: "Partly Cloudy", icon: "CloudSun", precipitationChance: 10 },
    { time: new Date().setHours(15,0,0,0), temperature: 16, description: "Cloudy", icon: "Cloud", precipitationChance: 15 },
    { time: new Date().setHours(16,0,0,0), temperature: 15, description: "Light Rain", icon: "CloudRain", precipitationChance: 40 },
    { time: new Date().setHours(17,0,0,0), temperature: 14, description: "Cloudy", icon: "Cloud", precipitationChance: 20 },
  ],
  daily: [
    { date: "2024-08-01T00:00:00.000Z", dayName: "Today", minTemp: 12, maxTemp: 18, description: "Showers", icon: "CloudDrizzle", precipitationChance: 60 },
    { date: "2024-08-02T00:00:00.000Z", dayName: "Tomorrow", minTemp: 13, maxTemp: 20, description: "Sunny", icon: "Sun", precipitationChance: 5 },
    { date: "2024-08-03T00:00:00.000Z", dayName: "Sat", minTemp: 14, maxTemp: 21, description: "Partly Cloudy", icon: "CloudSun", precipitationChance: 10 },
  ],
};
