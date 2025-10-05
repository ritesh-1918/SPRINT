"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, ButtonProps, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Ensure the imported types match the latest schema in the flow file
import { suggestOptimumEventTime, type SuggestOptimumEventTimeInput, type SuggestOptimumEventTimeOutput } from '@/ai/flows/optimum-travel-time'; 
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// --- Location Data (Omitted for brevity) ---
const detailedAndhraPradeshLocations = ["Visakhapatnam", "Vijayawada", "Tirupati"];
const detailedTelanganaLocations = ["Hyderabad", "Warangal", "Karimnagar"];
const otherIndianCities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];
const topGlobalLocations = ["New York", "London", "Tokyo", "Paris", "Dubai"];

const CITIES_RECOMMENDATIONS = [
  ...new Set([
    ...detailedAndhraPradeshLocations,
    ...detailedTelanganaLocations,
    ...otherIndianCities,
    ...topGlobalLocations
  ])
];

// -----------------------------------------------------------
// 1. ZOD SCHEMA: Renamed to EventFormValues for clarity
// -----------------------------------------------------------
const formSchema = z.object({
  location: z.string().min(1, "Location is required."),
  startDate: z.date({ required_error: "Start date is required." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  endDate: z.date({ required_error: "End date is required." }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  // Renamed to eventDurationMinutes for theme consistency, but kept for form validation
  eventDurationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute.").max(720, "Duration cannot exceed 12 hours."), 
}).refine(data => {
  const startDateTime = setMilliseconds(setSeconds(setMinutes(setHours(data.startDate, parseInt(data.startTime.split(':')[0])), parseInt(data.startTime.split(':')[1])),0),0);
  const endDateTime = setMilliseconds(setSeconds(setMinutes(setHours(data.endDate, parseInt(data.endTime.split(':')[0])), parseInt(data.endTime.split(':')[1])),0),0);
  return endDateTime > startDateTime;
}, {
  message: "End date and time must be after start date and time.",
  path: ["endDate"], 
});

type EventFormValues = z.infer<typeof formSchema>;

export default function RiskAssessorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestOptimumEventTimeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLDivElement>(null);

  const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] = useState(false);
  const [isEndDatePopoverOpen, setIsEndDatePopoverOpen] = useState(false);


  const form = useForm<EventFormValues>({ // Use EventFormValues
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      startDate: new Date(),
      startTime: format(new Date(), "HH:mm"),
      endDate: new Date(),
      endTime: format(addMinutes(new Date(), 60), "HH:mm"),
      eventDurationMinutes: 30, // Use new name
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationQuery(value);
    form.setValue("location", value, { shouldValidate: true }); 

    if (value.trim()) {
      const filteredSuggestions = CITIES_RECOMMENDATIONS.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      console.log('Input:', value, 'Suggestions Found:', filteredSuggestions.length);
      setLocationSuggestions(filteredSuggestions.slice(0, 5)); 
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const handleLocationSuggestionClick = (suggestionText: string) => {
    setLocationQuery(suggestionText);
    form.setValue("location", suggestionText, { shouldValidate: true });
    setShowLocationSuggestions(false);
  };


  const onSubmit = async (values: EventFormValues) => {
    setIsLoading(true);
    setSuggestion(null);
    setError(null);

    const startDateTime = setMilliseconds(setSeconds(setMinutes(setHours(values.startDate, parseInt(values.startTime.split(':')[0])), parseInt(values.startTime.split(':')[1])),0),0);
    const endDateTime = setMilliseconds(setSeconds(setMinutes(setHours(values.endDate, parseInt(values.endTime.split(':')[0])), parseInt(values.endTime.split(':')[1])),0),0);
    
    // -----------------------------------------------------------
    // 2. AI INPUT FIX: Use correct field names and add placeholder for weatherData
    // -----------------------------------------------------------
    const input: SuggestOptimumEventTimeInput = {
      location: values.location,
      earliestTime: startDateTime.toISOString(), // Renamed to earliestTime
      latestTime: endDateTime.toISOString(),   // Renamed to latestTime
      // This is a placeholder. In a real app, you would fetch the hourly forecast data here
      weatherData: `Hourly Forecast for ${values.location} between ${format(startDateTime, 'ha')} and ${format(endDateTime, 'ha')}: (Example: 10AM: 32C, 10% Rain. 12PM: 35C, 5% Rain. 2PM: 34C, 20% Rain.)`, 
    };

    try {
      toast({ title: "AI Thinking... ", description: "The SPRINT AI Risk Assessor is analyzing weather data for an optimum event time."});
      const result = await suggestOptimumEventTime(input);
      setSuggestion(result);
      toast({
        title: "Suggestion Ready!",
        description: "AI has suggested an optimum event time and risk summary.",
      });
    } catch (e) {
      console.error("Error fetching event suggestion:", e);
      const errorMessage = e instanceof Error ? e.message : "Failed to get suggestion. Check your network and Genkit flow status.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Sparkles className="mr-2 h-6 w-6 text-accent" />SPRINT AI Risk Assessor</CardTitle>
          <CardDescription>Get AI-powered suggestions for the best time to hold your public event, considering weather risks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => ( 
                  <FormItem ref={locationInputRef}>
                    <FormLabel>Location (e.g., City, State)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter parade location" 
                          value={locationQuery} 
                          onChange={handleLocationInputChange}
                          onFocus={() => locationQuery.trim() && setShowLocationSuggestions(true)}
                          autoComplete="off"
                        />
                        {showLocationSuggestions && locationSuggestions.length > 0 && (
                          <Card className="absolute z-10 mt-1 w-full border bg-background shadow-lg max-h-60 overflow-y-auto">
                            <ul className="py-1">
                              {locationSuggestions.map((suggestionTextFromList, index) => (
                                <li
                                  key={index}
                                  className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                                  onClick={() => handleLocationSuggestionClick(suggestionTextFromList)}
                                >
                                  {suggestionTextFromList}
                                </li>
                              ))}
                            </ul>
                          </Card>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date/Time Fields (start/end) are correctly structured */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Earliest Date</FormLabel> {/* Simplified Label */}
                      <Popover open={isStartDatePopoverOpen} onOpenChange={setIsStartDatePopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <span>
                              {/* @ts-ignore */}
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </span>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              if (date) setIsStartDatePopoverOpen(false);
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                     <FormItem className="flex flex-col">
                      <FormLabel>Latest Date</FormLabel> {/* Simplified Label */}
                      <Popover open={isEndDatePopoverOpen} onOpenChange={setIsEndDatePopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <span>
                              {/* @ts-ignore */}
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </span>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                              onSelect={(date) => {
                              field.onChange(date);
                              if (date) setIsEndDatePopoverOpen(false);
                            }}
                              disabled={(date) => date < form.getValues("startDate") || date < new Date(new Date().setHours(0,0,0,0)) }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-2" /> {/* Spacer for visual break */}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Earliest Time</FormLabel> {/* Simplified Label */}
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latest Time</FormLabel> {/* Simplified Label */}
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="eventDurationMinutes" // Changed name here to reflect theme
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Event Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 180" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Getting Suggestion...' : 'Get Optimum Event Time'}
              </Button>
            </form>
          </Form>

          {suggestion && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-lg">
              <h4 className="font-semibold text-lg flex items-center text-foreground"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" />Suggested Start Time:</h4>
              <p className="text-foreground/90">{new Date(suggestion.suggestedStartTime).toLocaleString()}</p>
              {/* ----------------------------------------------------------- */}
              {/* 3. AI OUTPUT FIX: Used riskSummary instead of reason */}
              {/* ----------------------------------------------------------- */}
              <h4 className="font-semibold text-lg mt-2 text-foreground">Risk Summary & Safety Precaution:</h4>
              <p className="text-foreground/90">{suggestion.riskSummary}</p>
            </div>
          )}
          {error && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
              <h4 className="font-semibold text-lg flex items-center"><AlertTriangle className="mr-2 h-5 w-5" />Error:</h4>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}