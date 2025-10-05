import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Geoapify API key not configured' }, { status: 500 });
  }

  try {
    const geoapifyUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&limit=1&apiKey=${apiKey}`;
    const response = await fetch(geoapifyUrl);
    const data = await response.json();

    if (response.ok && data && data.features && data.features.length > 0) {
      const properties = data.features[0].properties;
      const lat = properties.lat;
      const lng = properties.lon;
      const name = properties.formatted;
      const timezoneName = properties.timezone?.name || 'Unknown';
      return NextResponse.json({ lat, lng, name, timezoneName });
    } else {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Geoapify Forward Geocoding API error:', error);
    return NextResponse.json({ error: 'Failed to fetch forward geocoding data' }, { status: 500 });
  }
}