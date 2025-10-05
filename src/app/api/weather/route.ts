import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude parameters are required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Visual Crossing API key not configured' }, { status: 500 });
  }

  try {
    // Visual Crossing Weather API
    const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&exclude=minutely,alerts&units=metric&appid=${apiKey}`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('OpenWeatherMap API error:', data);
      return NextResponse.json({ error: data.message || 'Failed to fetch weather data from OpenWeatherMap' }, { status: response.status });
    }

    // For simplicity, we're using mock data for locationName for now.
    // In a real application, you would get this from a geocoding service or pass it from the client.
    const locationName = 'Unknown Location'; // OpenWeatherMap One Call API does not directly provide location name
    const timezoneName = data.timezone; // OpenWeatherMap provides timezone name

    const currentConditions = data.current;
    const weatherData = {
      current: {
        locationName: locationName,
        temperature: currentConditions.temp,
        description: currentConditions.weather[0].description,
        humidity: currentConditions.humidity,
        precipitationChance: data.hourly[0].pop * 100 || 0, // Using hourly pop for current precipitation chance
        windSpeed: currentConditions.wind_speed,
        windDirection: currentConditions.wind_deg ? `${currentConditions.wind_deg}°` : 'N/A',
        pressure: currentConditions.pressure,
        visibility: currentConditions.visibility,
        icon: currentConditions.weather[0].icon,
        timestamp: currentConditions.dt * 1000,
        timezoneOffsetSeconds: data.timezone_offset,
        locationTimezoneName: timezoneName,
        uvIndex: currentConditions.uvi,
      },
      hourly: data.hourly.map((hour: any) => ({
        time: hour.dt * 1000,
        temperature: hour.temp,
        description: hour.weather[0].description,
        icon: hour.weather[0].icon,
        precipitationChance: hour.pop * 100 || 0,
      })),
      daily: data.daily.map((day: any) => ({
        date: new Date(day.dt * 1000).toISOString(),
        dayName: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        minTemp: day.temp.min,
        maxTemp: day.temp.max,
        description: day.weather[0].description,
        icon: day.weather[0].icon,
        precipitationChance: day.pop * 100 || 0,
      })),
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}