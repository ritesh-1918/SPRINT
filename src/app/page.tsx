
"use client";

import { useState, useEffect } from 'react';
import AppHeader from '@/components/layout/app-header';
import GlobeView from '@/components/weather/globe-view';
import SearchBar from '@/components/weather/search-bar';
import WeatherDisplay from '@/components/weather/weather-display';
import SavedLocations from '@/components/weather/saved-locations';
import ReportGenerator from '@/components/weather/report-generator';
import TravelAssistant from '@/components/weather/travel-assistant';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { WeatherData, CurrentWeather, HourlyForecast, DailyForecast } from '@/types/weather';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface GeocodedLocation {
  lat: number;
  lng: number;
  altitude?: number;
  timezoneName: string; 
}

const windDegToDirection = (deg: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.floor((deg + 11.25) / 22.5) % 16];
};

const mapOwmIconToAppIcon = (owmIconCode: string): string => {
  const mapping: { [key: string]: string } = {
    '01d': 'Sun', 
    '01n': 'Moon',
    '02d': 'CloudSun',
    '02n': 'CloudMoon',
    '03d': 'Cloud',
    '03n': 'Cloud', 
    '04d': 'Cloudy', 
    '04n': 'Cloudy',
    '09d': 'CloudDrizzle',
    '09n': 'CloudDrizzle', 
    '10d': 'CloudRain',
    '10n': 'CloudRain',   
    '11d': 'CloudLightning',
    '11n': 'CloudLightning',
    '13d': 'CloudSnow',
    '13n': 'CloudSnow',   
    '50d': 'CloudFog', 
    '50n': 'CloudFog',   
  };
  return mapping[owmIconCode] || 'CloudSun'; 
};

export default function WeatherDashboardPage() {
  const [currentLocationName, setCurrentLocationName] = useState<string | null>(null);
  const [currentCoordinates, setCurrentCoordinates] = useState<GeocodedLocation | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const geocodeLocation = async (locationName: string): Promise<GeocodedLocation | null> => {
    toast({ title: "Geocoding...", description: `Finding coordinates for ${locationName}` });
    const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
    if (!apiKey) {
      console.error("OpenCage API key is missing.");
      toast({ title: "API Key Error", description: "OpenCage API key is not configured. Please add NEXT_PUBLIC_OPENCAGE_API_KEY to your .env file.", variant: "destructive" });
      return null;
    }
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationName)}&key=${apiKey}&limit=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status?.message || `Geocoding failed: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        const timezoneName = data.results[0].annotations?.timezone?.name || 'UTC'; 
        return { lat, lng, altitude: 1.5, timezoneName };
      } else {
        toast({ title: "Geocoding Failed", description: `Could not find coordinates for ${locationName}.`, variant: "destructive" });
        return null;
      }
    } catch (error) {
      console.error("Geocoding API error:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred during geocoding.";
      toast({ title: "Geocoding Error", description: message, variant: "destructive" });
      return null;
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    toast({ title: "Locating Point...", description: `Getting location name for coordinates ${lat.toFixed(2)}, ${lng.toFixed(2)}` });
    const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
    if (!apiKey) {
      console.error("OpenCage API key is missing.");
      toast({ title: "API Key Error", description: "OpenCage API key for reverse geocoding is not configured.", variant: "destructive" });
      return null;
    }
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&limit=1&no_annotations=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Reverse geocoding failed: ${errorData.status?.message || response.statusText}`);
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const locationName = data.results[0].formatted;
        if (!locationName) {
           toast({ title: "Reverse Geocoding", description: `Could not determine name for clicked location.`, variant: "destructive" });
           return null;
        }
        return locationName;
      } else {
        toast({ title: "Reverse Geocoding Failed", description: `Could not find location name for the clicked point.`, variant: "destructive" });
        return null;
      }
    } catch (error) {
      console.error("Reverse geocoding API error:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred during reverse geocoding.";
      toast({ title: "Reverse Geocoding Error", description: message, variant: "destructive" });
      return null;
    }
  };
  
  const fetchWeatherData = async (lat: number, lng: number, locationName: string, locationTimezoneName: string): Promise<WeatherData | null> => {
    toast({ title: "Fetching Weather...", description: `Getting weather data for ${locationName}` });
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      console.error("OpenWeatherMap API key is missing.");
      toast({ title: "API Key Error", description: "OpenWeatherMap API key is not configured. Please add NEXT_PUBLIC_OPENWEATHERMAP_API_KEY to .env file.", variant: "destructive" });
      return null;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`; 

    try {
      const [currentWeatherResponse, forecastResponse] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl)
      ]);

      if (!currentWeatherResponse.ok) {
        const errorData = await currentWeatherResponse.json();
        throw new Error(`Current Weather: ${errorData.message || currentWeatherResponse.statusText}`);
      }
      if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json();
        throw new Error(`Forecast: ${errorData.message || forecastResponse.statusText}`);
      }

      const currentData = await currentWeatherResponse.json();
      const forecastData = await forecastResponse.json();

      if (!currentData || !forecastData || !forecastData.list) {
        throw new Error("Incomplete weather data received from API.");
      }
      
      const current: CurrentWeather = {
        locationName: locationName,
        temperature: Math.round(currentData.main.temp),
        description: currentData.weather[0].description.replace(/\b\w/g, (l:string) => l.toUpperCase()),
        humidity: currentData.main.humidity,
        precipitationChance: forecastData.list[0].pop ? Math.round(forecastData.list[0].pop * 100) : 0, 
        windSpeed: currentData.wind.speed,
        windDirection: windDegToDirection(currentData.wind.deg),
        pressure: currentData.main.pressure,
        visibility: currentData.visibility / 1000,
        icon: mapOwmIconToAppIcon(currentData.weather[0].icon),
        timestamp: currentData.dt * 1000, 
        timezoneOffsetSeconds: currentData.timezone, 
        locationTimezoneName: locationTimezoneName, 
      };
      
      const hourly: HourlyForecast[] = forecastData.list.slice(0, 8).map((hour: any) => ({
        time: hour.dt * 1000, 
        temperature: Math.round(hour.main.temp),
        description: hour.weather[0].description.replace(/\b\w/g, (l:string) => l.toUpperCase()),
        icon: mapOwmIconToAppIcon(hour.weather[0].icon),
        precipitationChance: Math.round(hour.pop * 100),
      }));

      const dailyDataAggregated: { [key: string]: { temps: number[], pops: number[], icons: string[], descs: string[], dts: number[] } } = {};
      
      forecastData.list.forEach((item: any) => {
        const itemDate = new Date(item.dt * 1000);
        const dateKey = itemDate.toLocaleDateString('en-CA', { timeZone: locationTimezoneName, year: 'numeric', month: '2-digit', day: '2-digit' }); 

        if (!dailyDataAggregated[dateKey]) {
          dailyDataAggregated[dateKey] = { temps: [], pops: [], icons: [], descs: [], dts: [] };
        }
        dailyDataAggregated[dateKey].temps.push(item.main.temp);
        dailyDataAggregated[dateKey].pops.push(item.pop);
        dailyDataAggregated[dateKey].dts.push(item.dt * 1000); 

        const itemHourLocal = parseInt(itemDate.toLocaleTimeString('en-US', { timeZone: locationTimezoneName, hour: '2-digit', hour12: false }), 10);
        
        if (itemHourLocal >= 10 && itemHourLocal <= 15) { 
            dailyDataAggregated[dateKey].icons.push(item.weather[0].icon);
            dailyDataAggregated[dateKey].descs.push(item.weather[0].description);
        }
      });
      
      const daily: DailyForecast[] = Object.keys(dailyDataAggregated).slice(0, 7).map(dateKey => {
        const dayData = dailyDataAggregated[dateKey];
        
        const firstDtOfDay = Math.min(...dayData.dts);
        const firstRelevantForecastItem = forecastData.list.find((i:any) => i.dt * 1000 === firstDtOfDay);

        const representativeIcon = dayData.icons.length > 0 
          ? dayData.icons[Math.floor(dayData.icons.length / 2)] 
          : firstRelevantForecastItem?.weather[0].icon || '01d';
        const representativeDesc = dayData.descs.length > 0 
          ? dayData.descs[Math.floor(dayData.descs.length / 2)] 
          : firstRelevantForecastItem?.weather[0].description || 'Clear sky';
        
        const dailyDate = parseISO(dateKey + "T00:00:00"); 

        return {
          date: dailyDate.toISOString(), 
          dayName: format(dailyDate, "EEE"),
          minTemp: Math.round(Math.min(...dayData.temps)),
          maxTemp: Math.round(Math.max(...dayData.temps)),
          description: representativeDesc.replace(/\b\w/g, (l:string) => l.toUpperCase()),
          icon: mapOwmIconToAppIcon(representativeIcon),
          precipitationChance: Math.round(dayData.pops.reduce((a, b) => Math.max(a, b), 0) * 100), 
        };
      });

      return { current, hourly, daily };

    } catch (error) {
      console.error("Weather API error:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred while fetching weather data.";
      toast({ title: "Weather Data Error", description: message, variant: "destructive" });
      return null;
    }
  };

  useEffect(() => {
    const initializeDefaultLocation = async () => {
      if (!weatherData && !currentLocationName) { 
         await handleSearch("Visakhapatnam, India", true);
      }
    };
    initializeDefaultLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSearch = async (query: string, isInitialLoad = false) => {
    setIsLoading(true);
    setWeatherData(null); 
    setCurrentLocationName(query);

    if (!isInitialLoad) {
        toast({ title: "Searching...", description: `Fetching weather and coordinates for ${query}` });
    }
    
    const geocodedResult = await geocodeLocation(query);
    
    if (geocodedResult) { 
      setCurrentCoordinates(geocodedResult); 
      if (!isInitialLoad) toast({ title: "Location Found", description: `Globe focused on ${query}.` });
      
      const newWeatherData = await fetchWeatherData(geocodedResult.lat, geocodedResult.lng, query, geocodedResult.timezoneName);
      if (newWeatherData) {
        setWeatherData(newWeatherData);
        if (!isInitialLoad) toast({ title: "Weather Updated", description: `Displaying weather for ${query}` });
      } else {
        if (!isInitialLoad) toast({ title: "Update Failed", description: `Could not fetch weather for ${query}.`, variant: "destructive" });
      }
    } else {
      setCurrentCoordinates(null);
      if (!isInitialLoad) toast({ title: "Search Failed", description: `Could not find ${query}. Globe showing default view.`, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleGlobeCoordinatesClick = async (lat: number, lng: number) => {
    setIsLoading(true); // For reverse geocoding & subsequent search
    const locationNameFromClick = await reverseGeocode(lat, lng);
    
    if (locationNameFromClick) {
      await handleSearch(locationNameFromClick); // handleSearch will manage its own isLoading for weather fetching
    } else {
      // Toast for failure is already handled in reverseGeocode
      setIsLoading(false); // Ensure loading is false if reverse geocoding fails and search doesn't run
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 grid gap-6 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        
        <section className="lg:col-span-2 xl:col-span-3 space-y-6">
          <GlobeView 
            searchedLocationName={currentLocationName} 
            coordinates={currentCoordinates ? {lat: currentCoordinates.lat, lng: currentCoordinates.lng, altitude: currentCoordinates.altitude} : null}
            onGlobeCoordinatesClick={handleGlobeCoordinatesClick} 
          />
          
          <Card>
            <CardHeader>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </CardHeader>
            <CardContent>
              {isLoading && !weatherData && (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Loading weather data for {currentLocationName || "selected location"}...</p>
                </div>
              )}
              <WeatherDisplay weatherData={weatherData} />
            </CardContent>
          </Card>
        </section>

        <aside className="lg:col-span-1 xl:col-span-1 space-y-6">
          <SavedLocations 
            onSelectLocation={(location) => handleSearch(location)} 
            currentLocation={currentLocationName}
          />
          <ReportGenerator weatherData={weatherData} />
          <TravelAssistant />
        </aside>
      </main>
    </div>
  );
}
