"use client";

import { useEffect, useState, useCallback } from 'react';
import SavedLocations from '@/components/weather/saved-locations';
import ReportGenerator from '@/components/weather/report-generator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { WeatherData } from '@/types/weather';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { fetchWeather } from '@/lib/weather';
import { geocode } from '@/lib/location';
import { supabase } from '@/lib/supabase'; // Import supabase here
import { Button } from "@/components/ui/button";

interface GeocodedLocation {
  lat: number;
  lng: number;
  altitude?: number;
  timezoneName: string; 
}

export default function SavedLocationsPage() {
  const [currentLocationName, setCurrentLocationName] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const { toast } = useToast();

  // FIX 2: Define handleSearch using useCallback to prevent infinite loops 
  const handleSearch = useCallback(async (query: string) => {
    toast({ title: "Search initiated", description: `Searching for ${query} from saved locations.` });
    setCurrentLocationName(query);
    setWeatherData(null); // Clear previous data

    try {
      const geocoded = await geocode(query);
      if (!geocoded) {
        toast({ title: "Location Not Found", description: `Could not find coordinates for ${query}.`, variant: "destructive" });
        return;
      }

      const weather = await fetchWeather(geocoded.lat, geocoded.lng);
      setWeatherData(weather);
      toast({ title: "Weather Loaded", description: `Weather data for ${query} loaded.` });
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast({ title: "Error", description: "Failed to fetch weather data.", variant: "destructive" });
    }
  }, [toast]);

  // FIX 1 & 3: Correctly handle asynchronous Supabase call in useEffect
  useEffect(() => {
    const fetchAndSearchInitialLocation = async () => {
      // FIX: Correctly awaiting Supabase API call inside the async function
      const { data: { user } } = await supabase.auth.getUser(); 
      let initialLocation = null;

      if (user) {
        const { data, error } = await supabase
          .from('saved_locations')
          .select('name')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error fetching initial saved location:', error);
        } else if (data && data.length > 0) {
          initialLocation = data[0].name;
        }
      }

      if (initialLocation) {
        handleSearch(initialLocation);
      } else {
        // Fallback to a default location if no saved locations or not logged in
        handleSearch("London"); // You can change this default as needed
      }
    };

    fetchAndSearchInitialLocation();
    // FIX: handleSearch is now a stable dependency due to useCallback
  }, [handleSearch]); 

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">SPRINT: Saved Locations & Safety Reports</CardTitle>
          <CardDescription>Manage your saved locations and generate detailed safety reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SavedLocations 
            onSelectLocation={(location) => handleSearch(location)} 
            currentLocation={currentLocationName}
          />
          <ReportGenerator weatherData={weatherData} />
          <div className="mt-6 space-y-4">
            <Button className="w-full" disabled={!weatherData}>
            Download Safety Report
          </Button>
          </div>
          <div className="pt-8 flex justify-center">
            <Link href="/" className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all text-lg">
              Return to Interactive Map 🌍
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}