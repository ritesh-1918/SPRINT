"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { geocode } from '@/lib/location';

interface LocationSearchBarProps {
  onLocationSelected: (name: string, lat: number, lng: number, timezoneName: string) => void;
  initialLocationName?: string | null;
  isLoading?: boolean;
}

export function LocationSearchBar({
  onLocationSelected,
  initialLocationName,
  isLoading = false,
}: LocationSearchBarProps) {
  const [locationQuery, setLocationQuery] = useState(initialLocationName || '');
  const [debouncedLocationQuery] = useDebounce(locationQuery, 500);
  const [suggestions, setSuggestions] = useState<{
    name: string;
    lat: number;
    lng: number;
    timezoneName: string;
  }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialLocationName) {
      setLocationQuery(initialLocationName);
    }
  }, [initialLocationName]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedLocationQuery.length > 2) {
        try {
          const result = await geocode(debouncedLocationQuery, true); // Request suggestions
          if (result && Array.isArray(result)) {
            setSuggestions(result);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Error fetching location suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedLocationQuery]);

  const handleSelectSuggestion = useCallback(
    (name: string, lat: number, lng: number, timezoneName: string) => {
      setLocationQuery(name);
      onLocationSelected(name, lat, lng, timezoneName);
      setShowSuggestions(false);
      setSuggestions([]);
    },
    [onLocationSelected]
  );

  const handleSearchButtonClick = useCallback(() => {
    if (suggestions.length > 0) {
      const topSuggestion = suggestions[0];
      handleSelectSuggestion(
        topSuggestion.name,
        topSuggestion.lat,
        topSuggestion.lng,
        topSuggestion.timezoneName
      );
    } else if (locationQuery) {
      // If no suggestions, try to geocode the raw query
      geocode(locationQuery).then(result => {
        if (result && !Array.isArray(result)) {
          handleSelectSuggestion(result.name || locationQuery, result.lat, result.lng, result.timezoneName);
        }
      }).catch(error => {
        console.error("Error geocoding raw query:", error);
      });
    }
  }, [locationQuery, suggestions, handleSelectSuggestion]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={searchBarRef}>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search for a city, village, or location..."
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          onFocus={() => locationQuery.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchButtonClick();
            }
          }}
          className="flex-grow"
        />
        <Button onClick={handleSearchButtonClick} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only">Search</span>
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-10 mt-2 w-full border bg-background shadow-lg max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-center px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                  onClick={() =>
                    handleSelectSuggestion(
                      suggestion.name,
                      suggestion.lat,
                      suggestion.lng,
                      suggestion.timezoneName
                    )
                  }
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  {suggestion.name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}