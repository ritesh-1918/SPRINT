"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Trash2, MapPin } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface SavedLocationsProps {
  onSelectLocation: (location: string) => void;
  currentLocation?: string | null;
}

const MAX_SAVED_LOCATIONS = 5;

export default function SavedLocations({ onSelectLocation, currentLocation }: SavedLocationsProps) {
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSavedLocations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('saved_locations')
          .select('name')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching saved locations:', error);
          toast({
            title: "Error",
            description: "Failed to load saved locations.",
            variant: "destructive",
          });
        } else if (data) {
          setSavedLocations(data.map(item => item.name));
        }
      }
    };

    fetchSavedLocations();
  }, [toast]);

  const handleAddLocation = async () => {
    if (!currentLocation) {
      toast({ title: "No Location", description: "Search for a location to save it." });
      return;
    }

    if (savedLocations.includes(currentLocation)) {
      toast({ title: "Already Saved", description: `${currentLocation} is already in your saved locations.` });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to save locations.", variant: "destructive" });
      return;
    }

    if (savedLocations.length >= MAX_SAVED_LOCATIONS) {
      toast({
        title: "Limit Reached",
        description: `You can save a maximum of ${MAX_SAVED_LOCATIONS} locations.`,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('saved_locations')
      .insert({ user_id: user.id, name: currentLocation });

    if (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: "Failed to save location.",
        variant: "destructive",
      });
    } else {
      const newLocations = [...savedLocations, currentLocation];
      setSavedLocations(newLocations);
      toast({ title: "Location Saved", description: `${currentLocation} has been added to your saved locations.` });
    }
  };

  const handleRemoveLocation = async (locationToRemove: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to remove locations.", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('saved_locations')
      .delete()
      .eq('user_id', user.id)
      .eq('name', locationToRemove);

    if (error) {
      console.error('Error removing location:', error);
      toast({
        title: "Error",
        description: "Failed to remove location.",
        variant: "destructive",
      });
    } else {
      const newLocations = savedLocations.filter(loc => loc !== locationToRemove);
      setSavedLocations(newLocations);
      toast({ title: "Location Removed", description: `${locationToRemove} has been removed.` });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><Bookmark className="mr-2 h-6 w-6" />Saved Locations</CardTitle>
        <CardDescription>Quickly access weather for your favorite places.</CardDescription>
      </CardHeader>
      <CardContent>
        {currentLocation && (
          <Button onClick={handleAddLocation} className="w-full mb-4" variant="outline">
            <Bookmark className="mr-2 h-4 w-4" /> Save current location: {currentLocation}
          </Button>
        )}
        {savedLocations.length === 0 && !currentLocation && (
          <p className="text-sm text-muted-foreground">No locations saved yet. Search for a location and save it.</p>
        )}
        <ul className="space-y-2">
          {savedLocations.map(location => (
            <li key={location} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg shadow-sm hover:bg-secondary/50 transition-colors">
              <Button variant="link" onClick={() => onSelectLocation(location)} className="p-0 h-auto text-foreground hover:text-primary text-left flex-grow truncate">
                <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveLocation(location)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove {location}</span>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
