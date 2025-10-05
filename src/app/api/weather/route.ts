import { NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/weather';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  try {
    const weatherData = await fetchWeather(parseFloat(lat), parseFloat(lng));
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Error in weather API route:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}