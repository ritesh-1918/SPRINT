interface GeocodedLocation {
  lat: number;
  lng: number;
  altitude?: number;
  timezoneName: string;
  name?: string;
}

export const geocode = async (address: string): Promise<GeocodedLocation | null> => {
  try {
    const response = await fetch(`/api/forward-geocode?address=${encodeURIComponent(address)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.lat && data.lng) {
      return {
        lat: data.lat,
        lng: data.lng,
        timezoneName: data.timezoneName || 'Unknown',
      };
    }
    return null;
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodedLocation | null> => {
  try {
    const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.name && data.lat && data.lng) {
      return {
        lat: data.lat,
        lng: data.lng,
        name: data.name,
        timezoneName: data.timezoneName || 'Unknown',
      };
    }
    return null;
  } catch (error) {
    console.error('Error during reverse geocoding:', error);
    return null;
  }
};