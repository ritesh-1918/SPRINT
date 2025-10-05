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
    const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&exclude=minutely,alerts&units=metric&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const current: CurrentWeather = {
      locationName: data.timezone,
      temperature: data.current.temp,
      description: data.current.weather[0].description,
      humidity: data.current.humidity,
      precipitationChance: data.current.pop !== undefined ? data.current.pop * 100 : 0,
      windSpeed: data.current.wind_speed,
      windDirection: data.current.wind_deg ? data.current.wind_deg.toString() : 'N/A',
      pressure: data.current.pressure,
      visibility: data.current.visibility / 1000, // Convert meters to kilometers
      icon: mapOpenWeatherMapIcon(data.current.weather[0].icon),
      timestamp: data.current.dt * 1000,
      timezoneOffsetSeconds: data.timezone_offset,
      locationTimezoneName: data.timezone,
      uvIndex: data.current.uvi,
    };

    const hourly: HourlyForecast[] = data.hourly.slice(0, 24).map((hour: any) => ({
      time: hour.dt * 1000,
      temperature: hour.temp,
      description: hour.weather[0].description,
      icon: mapOpenWeatherMapIcon(hour.weather[0].icon),
      precipitationChance: hour.pop * 100,
    }));

    const daily: DailyForecast[] = data.daily.slice(0, 7).map((day: any) => ({
      date: new Date(day.dt * 1000).toISOString(),
      dayName: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      minTemp: day.temp.min,
      maxTemp: day.temp.max,
      description: day.weather[0].description,
      icon: mapOpenWeatherMapIcon(day.weather[0].icon),
      precipitationChance: day.pop * 100,
    }));

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