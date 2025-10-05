
import { useState, useEffect } from 'react';
import type { WeatherData, CurrentWeather, HourlyForecast, DailyForecast } from '@/types/weather';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Thermometer, Droplets, Wind, Gauge, Eye, CloudSun, Sun, Cloud, CloudRain, CloudDrizzle, CalendarDays, Clock, Moon, CloudMoon, Cloudy, CloudLightning, CloudSnow, CloudFog } from 'lucide-react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const WeatherIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const iconProps = { className: cn("h-5 w-5", className) };
  switch (iconName?.toLowerCase()) {
    case 'sun': return <Sun {...iconProps} />;
    case 'moon': return <Moon {...iconProps} />;
    case 'cloudsun': return <CloudSun {...iconProps} />;
    case 'cloudmoon': return <CloudMoon {...iconProps} />;
    case 'cloud': return <Cloud {...iconProps} />;
    case 'cloudy': return <Cloudy {...iconProps} />; 
    case 'clouddrizzle': return <CloudDrizzle {...iconProps} />;
    case 'cloudrain': return <CloudRain {...iconProps} />;
    case 'cloudlightning': return <CloudLightning {...iconProps} />;
    case 'cloudsnow': return <CloudSnow {...iconProps} />;
    case 'cloudfog': return <CloudFog {...iconProps} />;
    default: return <CloudSun {...iconProps} />; 
  }
};

interface WeatherDisplayProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: Error | null;
  locationName: string | null;
}

export default function WeatherDisplay({ weatherData }: WeatherDisplayProps) {
  if (!weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Weather Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Search for a location to see weather details.</p>
           <Image src="https://placehold.co/400x200.png" alt="Weather placeholder" width={400} height={200} className="mt-4 rounded-md" data-ai-hint="weather forecast" />
        </CardContent>
      </Card>
    );
  }

  const { current, hourly, daily } = weatherData;

  return (
    <div className="space-y-6">
      <CurrentWeatherDetails current={current} />
      <HourlyForecastDetails hourly={hourly} locationTimezoneName={current.locationTimezoneName} />
      <DailyForecastDetails daily={daily} />
    </div>
  );
}

function CurrentWeatherDetails({ current }: { current: CurrentWeather }) {
  const [currentTimeAtLocation, setCurrentTimeAtLocation] = useState('');
  const [formattedObservationDateTime, setFormattedObservationDateTime] = useState('');

  useEffect(() => {
    // Format observation time
    if (current.timestamp && current.locationTimezoneName) {
      try {
        const observationDate = new Date(current.timestamp);
        const obsTime = observationDate.toLocaleTimeString('en-US', {
          timeZone: current.locationTimezoneName,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        const obsDate = observationDate.toLocaleDateString('en-US', {
          timeZone: current.locationTimezoneName,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        setFormattedObservationDateTime(`${obsTime} on ${obsDate}`);
      } catch (e) {
        console.warn("Error formatting observation time for timezone:", current.locationTimezoneName, e);
        const fallbackDate = new Date(current.timestamp); // Show in user's local or UTC
        setFormattedObservationDateTime(format(fallbackDate, "p, EEE, MMM d, yyyy") + " (Local/UTC)");
      }
    }

    // Update live time
    if (current.locationTimezoneName) {
      const updateLiveTime = () => {
        try {
          const now = new Date();
          const timeString = now.toLocaleTimeString('en-US', {
            timeZone: current.locationTimezoneName,
            hour: '2-digit',
            minute: '2-digit',
          });
          const dateString = now.toLocaleDateString(undefined, {
            timeZone: current.locationTimezoneName,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          setCurrentTimeAtLocation(`${timeString}, ${dateString}`);
        } catch (error) {
          console.warn("Error formatting live time for timezone:", current.locationTimezoneName, error);
           const fallbackDate = new Date(Date.now() + current.timezoneOffsetSeconds * 1000); // Offset from UTC
           setCurrentTimeAtLocation(formatInTimeZone(fallbackDate, 'UTC', "p, EEE, MMM d") + " (Offset based)");
        }
      };
      updateLiveTime();
      const intervalId = setInterval(updateLiveTime, 1000 * 30); // Update every 30 seconds
      return () => clearInterval(intervalId);
    }
  }, [current.timestamp, current.locationTimezoneName, current.timezoneOffsetSeconds]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Current Weather: {current.locationName}</CardTitle>
        {formattedObservationDateTime && (
          <CardDescription>
            Weather data as of: {formattedObservationDateTime} (Local Time)
          </CardDescription>
        )}
         {currentTimeAtLocation && (
          <CardDescription className="pt-1">
            Current time in {current.locationName}: <span className="font-semibold">{currentTimeAtLocation}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-5xl font-bold">{current.temperature}°C</div>
          <WeatherIcon iconName={current.icon} className="h-16 w-16 text-yellow-400" />
        </div>
        <p className="text-lg">{current.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <InfoItem icon={<Droplets />} label="Humidity" value={`${current.humidity}%`} />
          <InfoItem icon={<CloudRain />} label="Precip. Chance" value={`${current.precipitationChance}%`} />
          <InfoItem icon={<Wind />} label="Wind" value={`${current.windSpeed} m/s ${current.windDirection}`} />
          <InfoItem icon={<Gauge />} label="Pressure" value={`${current.pressure} hPa`} />
          <InfoItem icon={<Eye />} label="Visibility" value={`${current.visibility} km`} />
        </div>
      </CardContent>
    </Card>
  );
}

function HourlyForecastDetails({ hourly, locationTimezoneName }: { hourly: HourlyForecast[]; locationTimezoneName: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><Clock className="mr-2 h-6 w-6" />Hourly Forecast (Local Time)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {hourly.map((hour, index) => {
            let formattedTime = "N/A";
            try {
              const hourlyDate = new Date(hour.time);
              formattedTime = hourlyDate.toLocaleTimeString('en-US', {
                timeZone: locationTimezoneName,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
            } catch (e) {
                console.warn("Error formatting hourly time for timezone:", locationTimezoneName, e);
                const fallbackDate = new Date(hour.time);
                formattedTime = format(fallbackDate, "HH:mm") + " (Local/UTC)";
            }
            return (
              <div key={index} className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg min-w-[90px] shadow">
                <div className="text-sm font-medium">{formattedTime}</div>
                <WeatherIcon iconName={hour.icon} className="h-8 w-8 my-2" />
                <div className="text-lg font-semibold">{hour.temperature}°C</div>
                <div className="text-xs text-muted-foreground mt-1">{hour.precipitationChance}% <CloudRain className="inline h-3 w-3" /></div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function DailyForecastDetails({ daily }: { daily: DailyForecast[] }) {
  const highestRainChanceDay = daily.reduce((prev, current) => {
    return (prev.precipitationChance > current.precipitationChance) ? prev : current;
  }, daily[0]);

  const getRainRiskLevel = (chance: number) => {
    if (chance >= 70) {
      return "High";
    } else if (chance >= 30) {
      return "Medium";
    } else {
      return "Low";
    }
  };

  const rainRiskLevel = highestRainChanceDay ? getRainRiskLevel(highestRainChanceDay.precipitationChance) : "N/A";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><CalendarDays className="mr-2 h-6 w-6" />7-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Parade Rain Risk Outlook */}
        {highestRainChanceDay && (
          <Card className="bg-blue-900 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Parade Rain Risk Outlook</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Highest chance of rain: <span className="font-semibold">{highestRainChanceDay.dayName} ({format(parseISO(highestRainChanceDay.date), "MMM d")})</span>
              </p>
              <p className="text-sm">
                Precipitation chance: <span className="font-semibold">{highestRainChanceDay.precipitationChance}% ({rainRiskLevel} Risk)</span>
              </p>
            </CardContent>
          </Card>
        )}

        {daily.map((day, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg shadow-sm">
            <div className="w-1/4 font-medium">{day.dayName} <span className="text-xs text-muted-foreground">({format(parseISO(day.date), "MMM d")})</span></div>
            <div className="w-1/4 flex items-center justify-center">
              <WeatherIcon iconName={day.icon} className="h-6 w-6 mr-2" />
            </div>
            <div className="w-1/4 text-center text-sm text-muted-foreground">{day.precipitationChance}% <CloudRain className="inline h-3 w-3" /></div>
            <div className="w-1/4 text-right">{day.minTemp}° / {day.maxTemp}°C</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-md">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
