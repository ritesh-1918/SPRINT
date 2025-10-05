
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { GlobeMethods } from 'react-globe.gl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Dynamically import react-globe.gl to ensure it's client-side only
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-2">Loading Globe...</p>
    </div>
  ),
});

interface GlobeViewProps {
  searchedLocationName?: string | null;
  coordinates?: { lat: number; lng: number; altitude?: number } | null;
  onGlobeCoordinatesClick?: (lat: number, lng: number) => void;
}

export default function GlobeView({ searchedLocationName, coordinates, onGlobeCoordinatesClick }: GlobeViewProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [globeReady, setGlobeReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = Math.max(width * (10 / 16), 400); // Maintain 16:10 aspect ratio with minimum height
      setDimensions({
        width: width,
        height: height
      });
      console.log('Globe dimensions:', { width, height }); // Add this line
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (globeRef.current && globeReady) {
      globeRef.current.pointOfView(
        coordinates || { lat: 20, lng: 0, altitude: 2.5 }, // Default view if no coords
        1000 // Transition duration
      );
    }
  }, [coordinates, globeReady]);

  const onGlobeReadyHandler = () => {
    setGlobeReady(true);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.2;
      globeRef.current.controls().enableZoom = true;
    }
  };
  
  const globeImageUrl = "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

  const handleInternalGlobeClick = ({ lat, lng }: { lat: number; lng: number }) => {
    if (onGlobeCoordinatesClick) {
      onGlobeCoordinatesClick(lat, lng);
    }
  };

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="font-headline">Global Weather Visualization</CardTitle>
        {searchedLocationName ? (
          <CardDescription>Currently visualizing: <span className="font-semibold text-primary">{searchedLocationName}</span>. Click on the globe to explore other locations.</CardDescription>
        ) : (
          <CardDescription>Explore weather patterns. Click on the globe or search for a location to focus the view.</CardDescription>
        )}
      </CardHeader>
      <CardContent ref={containerRef} className="w-full h-full aspect-[16/10] p-0 overflow-hidden relative min-h-[400px]">
        {dimensions.width > 0 && dimensions.height > 0 ? (
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl={globeImageUrl}
            onGlobeReady={onGlobeReadyHandler}
            onGlobeClick={handleInternalGlobeClick}
            pointsData={coordinates ? [{ lat: coordinates.lat, lng: coordinates.lng, size: 0.5, color: 'red' }] : []}
            pointAltitude="size"
            pointColor="color"
            backgroundColor="#000000" // Explicitly set background color to black
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Initializing map...</p>
          </div>
        )}
         {globeReady && (
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/50 p-1 rounded">
             {searchedLocationName ? `Focused on ${searchedLocationName}` : "Globe is interactive. Drag to rotate, scroll to zoom, click to select."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
