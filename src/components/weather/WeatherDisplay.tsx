"use client";

import React, { useEffect, useState } from "react";

interface WeatherData {
  currentConditions: {
    temp: number;
    conditions: string;
    precipprob: number;
  };
  address: string;
}

export default function WeatherDisplay() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_VISUAL_CROSSING_API_KEY;
        if (!apiKey) {
          throw new Error("Visual Crossing API key is not defined");
        }

        const response = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?unitGroup=metric&key=${apiKey}&contentType=json`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: WeatherData = await response.json();
        setWeatherData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError(`Geolocation error: ${err.code} ${err.message}`);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md">Loading weather...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-800 text-white rounded-lg shadow-md">Error: {error}</div>;
  }

  if (!weatherData) {
    return <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md">No weather data available.</div>;
  }

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-2">Weather in {weatherData.address}</h3>
      <p>Temperature: {weatherData.currentConditions.temp}°C</p>
      <p>Conditions: {weatherData.currentConditions.conditions}</p>
      <p>Rain Probability: {weatherData.currentConditions.precipprob}%</p>
    </div>
  );
}