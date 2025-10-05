import type { WeatherData, CurrentWeather, HourlyForecast, DailyForecast } from '@/types/weather';

// Helper function to map Visual Crossing icons to application icons
const mapOpenWeatherMapIcon = (owmIcon: string): string => {
  if (owmIcon.startsWith('01')) return 'Sun'; // clear sky
  if (owmIcon.startsWith('02')) return 'CloudSun'; // few clouds
  if (owmIcon.startsWith('03')) return 'Cloud'; // scattered clouds
  if (owmIcon.startsWith('04')) return 'Cloudy'; // broken clouds
  if (owmIcon.startsWith('09')) return 'CloudRain'; // shower rain
  if (owmIcon.startsWith('10')) return 'CloudRain'; // rain
  if (owmIcon.startsWith('11')) return 'CloudLightning'; // thunderstorm
  if (owmIcon.startsWith('13')) return 'CloudSnow'; // snow
  if (owmIcon.startsWith('50')) return 'CloudFog'; // mist
  return 'Cloud'; // Default icon
};

export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not defined.');
    }
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
    console.log("Fetching current weather from:", currentWeatherUrl);
    const currentResponse = await fetch(currentWeatherUrl);
    console.log("Current weather response status:", currentResponse.status);
    if (!currentResponse.ok) {
      throw new Error(`HTTP error! status: ${currentResponse.status} from current weather API`);
    }
    const currentData = await currentResponse.json();

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
    console.log("Fetching 5-day/3-hour forecast from:", forecastUrl);
    const forecastResponse = await fetch(forecastUrl);
    console.log("5-day/3-hour forecast response status:", forecastResponse.status);
    if (!forecastResponse.ok) {
      throw new Error(`HTTP error! status: ${forecastResponse.status} from 5-day/3-hour forecast API`);
    }
    const forecastData = await forecastResponse.json();


    const current: CurrentWeather = {
      locationName: currentData.name,
      temperature: currentData.main.temp,
      description: currentData.weather[0].description,
      humidity: currentData.main.humidity,
      precipitationChance: 0, // Not directly available in current weather for OWM 2.5
      windSpeed: currentData.wind.speed,
      windDirection: currentData.wind.deg ? currentData.wind.deg.toString() : 'N/A',
      pressure: currentData.main.pressure,
      visibility: currentData.visibility / 1000, // Convert meters to kilometers
      icon: mapOpenWeatherMapIcon(currentData.weather[0].icon),
      timestamp: currentData.dt * 1000,
      timezoneOffsetSeconds: currentData.timezone,
      locationTimezoneName: currentData.name, // Placeholder, will be updated with timezone API
      uvIndex: 0, // Not available in OWM 2.5 current weather
    };

    const hourly: HourlyForecast[] = forecastData.list.slice(0, 8).map((hour: any) => ({
      time: hour.dt * 1000,
      temperature: hour.main.temp,
      description: hour.weather[0].description,
      icon: mapOpenWeatherMapIcon(hour.weather[0].icon),
      precipitationChance: hour.pop * 100 || 0,
    }));

    const daily: DailyForecast[] = [];
    const dailyMap = new Map<string, { minTemp: number; maxTemp: number; description: string; icon: string; pop: number; }>();

    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, {
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          pop: item.pop,
        });
      } else {
        const existing = dailyMap.get(dayKey)!;
        existing.minTemp = Math.min(existing.minTemp, item.main.temp_min);
        existing.maxTemp = Math.max(existing.maxTemp, item.main.temp_max);
        // Update description and icon if the current item's pop is higher, or if it's a more significant weather event
        // For simplicity, let's take the description/icon of the item with the highest pop for the day.
        if (item.pop > existing.pop) {
          existing.description = item.weather[0].description;
          existing.icon = item.weather[0].icon;
        }
        existing.pop = Math.max(existing.pop, item.pop); // Keep max pop for the day
      }
    });

    // Sort keys to ensure daily forecasts are in chronological order and limit to 7 days
    const sortedDayKeys = Array.from(dailyMap.keys()).sort().slice(0, 7);

    sortedDayKeys.forEach((dayKey) => {
      const value = dailyMap.get(dayKey)!;
      const date = new Date(dayKey); // Recreate date object for dayName
      daily.push({
        date: dayKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minTemp: value.minTemp,
        maxTemp: value.maxTemp,
        description: value.description,
        icon: mapOpenWeatherMapIcon(value.icon), // Apply icon mapping
        precipitationChance: value.pop * 100 || 0, // Convert pop to percentage
      });
    });

    return {
      current,
      hourly,
      daily,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};