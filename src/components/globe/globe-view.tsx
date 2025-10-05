import React, { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
});

interface GlobeViewProps {
  currentLocation: { lat: number; lng: number; timezoneName: string } | null;
  onLocationChange: (lat: number, lng: number, name: string) => void;
}

export function GlobeView({ currentLocation, onLocationChange }: GlobeViewProps) {
  const globeEl = useRef<any>();
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.3;
      globeEl.current.pointOfView({ altitude: 2 }, 0);
      setGlobeReady(true);
    }
  }, []);

  useEffect(() => {
    if (globeReady && currentLocation) {
      globeEl.current.pointOfView({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        altitude: 1.5,
      }, 1000);
    }
  }, [globeReady, currentLocation]);

  const handleGlobeClick = useCallback(async ({ lat, lng }: { lat: number; lng: number }) => {
    // Reverse geocode to get location name
    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      if (data && data.name) {
        onLocationChange(lat, lng, data.name);
      } else {
        onLocationChange(lat, lng, `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`);
      }
    } catch (error) {
      console.error("Error during reverse geocoding on globe click:", error);
      onLocationChange(lat, lng, `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`);
    }
  }, [onLocationChange]);

  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSize({ width: window.innerWidth, height: window.innerHeight });

      const handleResize = () => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (size.width === 0 || size.height === 0) {
    return null; // Render nothing until dimensions are available
  }

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      onGlobeClick={handleGlobeClick}
      width={size.width}
      height={size.height}
    />
  );
}