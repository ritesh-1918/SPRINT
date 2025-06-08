
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import type { WeatherData } from '@/types/weather';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface ReportGeneratorProps {
  weatherData: WeatherData | null;
}

export default function ReportGenerator({ weatherData }: ReportGeneratorProps) {
  const { toast } = useToast();

  const handleGenerateReport = () => {
    if (!weatherData) {
      toast({
        title: "No Data Available",
        description: "Please search for a location to generate a report.",
        variant: "destructive",
      });
      return;
    }

    const { current, hourly, daily } = weatherData;
    const doc = new jsPDF();
    const now = new Date();
    const generationTimestamp = now.toLocaleString(); // User's local time for report generation

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`Weather Report: ${current.locationName}`, 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${generationTimestamp}`, 14, 28);

    let yPos = 40;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Current Conditions", 14, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    let currentObsTime = "N/A";
    try {
      currentObsTime = new Date(current.timestamp).toLocaleTimeString('en-US', {
        timeZone: current.locationTimezoneName,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
      });
    } catch (e) {
      currentObsTime = format(new Date(current.timestamp), "PPpp") + " (Local/UTC)";
      console.warn("Error formatting current observation time for PDF:", e);
    }

    doc.text(`Time: ${currentObsTime} (${current.locationTimezoneName})`, 14, yPos); yPos += 5;
    doc.text(`Temperature: ${current.temperature}°C`, 14, yPos); yPos += 5;
    doc.text(`Description: ${current.description}`, 14, yPos); yPos += 5;
    doc.text(`Humidity: ${current.humidity}%`, 14, yPos); yPos += 5;
    doc.text(`Precipitation Chance: ${current.precipitationChance}%`, 14, yPos); yPos += 5;
    doc.text(`Wind: ${current.windSpeed} m/s ${current.windDirection}`, 14, yPos); yPos += 5;
    doc.text(`Pressure: ${current.pressure} hPa`, 14, yPos); yPos += 5;
    if (current.uvIndex !== undefined) {
      doc.text(`UV Index: ${current.uvIndex}`, 14, yPos); yPos += 5;
    }
    doc.text(`Visibility: ${current.visibility} km`, 14, yPos); yPos += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Hourly Forecast (Next 4 Hours)", 14, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    hourly.slice(0, 4).forEach(hour => {
      const hourDate = new Date(hour.time);
      let formattedHourTime = "N/A";
      try {
        const timeInLocationTimezone = hourDate.toLocaleTimeString('en-US', {
          timeZone: current.locationTimezoneName,
          hour: '2-digit',
          hour12: false, 
        });
        formattedHourTime = `${timeInLocationTimezone.split(':')[0]}:00`;
      } catch (e) {
        console.warn(`Failed to format PDF hourly time for timezone ${current.locationTimezoneName}. Falling back.`, e);
        const utcHour = String(hourDate.getUTCHours()).padStart(2, '0');
        formattedHourTime = `${utcHour}:00 (UTC)`;
      }
      doc.text(`${formattedHourTime} - ${hour.temperature}°C, ${hour.description}, ${hour.precipitationChance}% precip.`, 14, yPos);
      yPos += 5;
    });
    yPos += 5;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Daily Forecast (Next 3 Days)", 14, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    daily.slice(0, 3).forEach(day => {
      // Date is already a string like "2024-08-01T00:00:00.000Z"
      // Formatting to a simpler date string for the report
      let formattedDayDate = "N/A";
      try {
        formattedDayDate = format(new Date(day.date), "MMM d");
      } catch (e) {
        console.warn("Error formatting daily date for PDF:", e)
      }
      doc.text(`${day.dayName} (${formattedDayDate}) - ${day.minTemp}°/${day.maxTemp}°C, ${day.description}, ${day.precipitationChance}% precip.`, 14, yPos);
      yPos += 5;
    });

    doc.save(`Weather_Report_${current.locationName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`);
    toast({ title: "Report Generated", description: "Your PDF report has been downloaded." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-6 w-6" />Generate Report</CardTitle>
        <CardDescription>Download a PDF weather report for the current location.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerateReport} className="w-full" disabled={!weatherData}>
          <Download className="mr-2 h-4 w-4" /> Download PDF Report
        </Button>
      </CardContent>
    </Card>
  );
}
