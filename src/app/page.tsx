
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { geocode, reverseGeocode } from '@/lib/location';
import GlobeView from '@/components/weather/globe-view';
import WeatherDisplay from '@/components/weather/weather-display';
import type { WeatherData } from '@/types/weather';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { LocationSearchBar } from '@/components/common/location-search-bar';

interface GeocodedLocation {
  lat: number;
  lng: number;
  altitude?: number;
  timezoneName: string;
}

export default function WeatherDashboardPage() {
  const [locationInput, setLocationInput] = useState<string | null>('');
  const [debouncedLocationInput] = useDebounce(locationInput, 500);
  const [currentLocation, setCurrentLocation] = useState<GeocodedLocation | null>({ lat: 17.686815, lng: 83.218483, timezoneName: 'Asia/Kolkata' });
  const [currentLocationName, setCurrentLocationName] = useState<string | null>('Visakhapatnam, India');
  const { toast } = useToast();

  const { data: weatherData, isLoading: isWeatherLoading, error: weatherError } = useQuery<WeatherData, Error>({
    queryKey: ['weather', currentLocation?.lat, currentLocation?.lng],
    queryFn: async () => {
      if (currentLocation?.lat === undefined || currentLocation?.lng === undefined) {
        return Promise.reject(new Error('Location not defined'));
      }
      const apiUrl = `/api/weather?lat=${currentLocation.lat}&lng=${currentLocation.lng}`;
      console.log("Client-side fetching from:", apiUrl);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch weather data');
      }
      return response.json();
    },
    enabled: !!currentLocation,
    staleTime: 5 * 60 * 1000,
  });

  const handleLocationSelected = useCallback(
    (name: string, lat: number, lng: number, timezoneName: string) => {
      setCurrentLocation({ lat, lng, timezoneName });
      setCurrentLocationName(name);
      toast({
        title: 'Location Selected',
        description: `Displaying weather for ${name}.`,
      });
    },
    [toast]
  );

  useEffect(() => {
    // Get user's current location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const reverseGeocoded = await reverseGeocode(latitude, longitude);
            if (reverseGeocoded) {
              setCurrentLocation(reverseGeocoded);
              setCurrentLocationName(reverseGeocoded.name ?? null);
              setLocationInput(reverseGeocoded.name ?? null);
            }
          } catch (error) {
            console.error("Error during reverse geocoding:", error);
            toast({
              title: "Geolocation Error",
              description: "Could not determine your location. Please ensure location services are enabled and permissions are granted.",
              variant: "destructive",
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error.code, error.message);
          let errorMessage = "Could not retrieve your location.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = "Location information is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            errorMessage = "The request to get user location timed out.";
          }
          toast({
            title: "Geolocation Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation. Please use a different browser or manually enter your location.",
        variant: "destructive",
      });
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <main className="flex flex-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 p-4">
          <div className="md:col-span-2 relative">
            
            <GlobeView
              searchedLocationName={currentLocationName || undefined}
              coordinates={currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng, altitude: 2.5 } : undefined}
              onGlobeCoordinatesClick={async (lat: number, lng: number) => { // Explicitly type lat and lng
                const reverseGeocoded = await reverseGeocode(lat, lng);
                if (reverseGeocoded) {
                  setCurrentLocation(reverseGeocoded);
                  setCurrentLocationName(reverseGeocoded.name ?? null);
                } else {
                  setCurrentLocation({ lat, lng, timezoneName: 'Unknown' });
                  setCurrentLocationName('Unknown Location');
                }
              }}
            />
          </div>
          <div className="md:col-span-1 overflow-y-auto p-4">
            <LocationSearchBar
              onLocationSelected={handleLocationSelected}
              initialLocationName={currentLocationName}
              isLoading={isWeatherLoading}
            />
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="text-sm text-gray-500 mb-4">
                  Data Fusion Engine Active: Live Weather (OpenWeatherMap API) + NASA Earth Observation (GOES Satellite Layer Planned).
                </div>
                <WeatherDisplay
                  weatherData={weatherData ?? null}
                  isLoading={isWeatherLoading}
                  error={weatherError}
                  locationName={currentLocationName}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
