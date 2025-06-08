
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestOptimumTravelTime, type SuggestOptimumTravelTimeInput, type SuggestOptimumTravelTimeOutput } from '@/ai/flows/optimum-travel-time';
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const detailedAndhraPradeshLocations = [
  "Adoni, India", "Allagadda, India", "Alur, India", "Amalapuram, India", "Amudalavalasa, India", "Anakapalli, India", "Anantapur, India", "Atmakur (Anantapur), India", "Atmakur (Nellore), India", "Banganapalle, India", "Bapatla, India", "Betamcherla, India", "Bhimavaram, India", "Bhimunipatnam, India", "Bobbili, India", "Challapalli, India", "Cheepurupalli, India", "Chilakaluripet, India", "Chinnachowk, India", "Chirala, India", "Chittoor, India", "Chodavaram, India", "Cuddapah, India", "Darsi, India", "Dharmavaram, India", "Dhone, India", "Donakonda, India", "Eluru, India", "Gajuwaka, India", "Gannavaram, India", "Giddalur, India", "Gooty, India", "Gudivada, India", "Gudur, India", "Guntakal, India", "Guntur, India", "Hindupur, India", "Ichchapuram, India", "Jaggayyapeta, India", "Jammalamadugu, India", "Kadiri, India", "Kaikalur, India", "Kakinada, India", "Kalyandurg, India", "Kandukur, India", "Kanigiri, India", "Kavali, India", "Kovvur, India", "Krishna, India", "Kuppam, India", "Kurnool, India", "Machilipatnam, India", "Madanapalle, India", "Madugula, India", "Markapur, India", "Nagari, India", "Naidupet, India", "Nandyal, India", "Narasannapeta, India", "Narasapur, India", "Narasaraopet, India", "Nellore, India", "Nidadavole, India", "Nuzvid, India", "Ongole, India", "Palakollu, India", "Palasa Kasibugga, India", "Palamaner, India", "Pamur, India", "Parvathipuram, India", "Pathapatnam, India", "Pedana, India", "Peddapuram, India", "Penukonda, India", "Pileru, India", "Pithapuram, India", "Polavaram, India", "Ponnur, India", "Proddatur, India", "Pulivendla, India", "Punganur, India", "Puttur, India", "Rajahmundry, India", "Rajampet, India", "Ramachandrapuram, India", "Rapur, India", "Rayachoti, India", "Rayadurg, India", "Repalle, India", "Salur, India", "Samalkota, India", "Sattenapalle, India", "Singarayakonda, India", "Sompeta, India", "Srikakulam, India", "Srikalahasti, India", "Sullurpeta, India", "Tadepalligudem, India", "Tadipatri, India", "Tanuku, India", "Tekkali, India", "Tenali, India", "Tirupati, India", "Tiruvuru, India", "Tuni, India", "Uravakonda, India", "Venkatagiri, India", "Vijayawada, India", "Vinukonda, India", "Visakhapatnam, India", "Vizianagaram, India", "Yeleswaram, India", "Yerragondapalem, India",
  "Alluri Sitharama Raju District, India", "Anakapalli District, India", "Anantapur District, India", "Annamayya District, India", "Bapatla District, India", "Chittoor District, India", "East Godavari District, India", "Eluru District, India", "Guntur District, India", "Kadapa District, India", "Kakinada District, India", "Konaseema District, India", "Krishna District, India", "Kurnool District, India", "Manyam District, India", "NTR District, India", "Nandyal District, India", "Nellore District, India", "Palnadu District, India", "Prakasam District, India", "Sri Balaji District, India", "Sri Sathya Sai District, India", "Srikakulam District, India", "Visakhapatnam District, India", "Vizianagaram District, India", "West Godavari District, India", "YSR District, India"
];

const detailedTelanganaLocations = [
  "Adilabad, India", "Alampur, India", "Andole, India", "Armoor, India", "Asifabad, India", "Banswada, India", "Bellampalli, India", "Bhadrachalam, India", "Bhadradri Kothagudem, India", "Bhainsa, India", "Bhongir, India", "Bhupalpally, India", "Bodhan, India", "Chandur, India", "Chennur, India", "Chevella, India", "Devarkonda, India", "Dornakal, India", "Gadwal, India", "Gajwel, India", "Ghanpur (Station), India", "Hanamkonda, India", "Husnabad, India", "Huzurabad, India", "Huzurnagar, India", "Hyderabad, India", "Ibrahimpatnam, India", "Jagtial, India", "Jangaon, India", "Jukkal, India", "Kagaznagar, India", "Kalwakurthy, India", "Kamareddy, India", "Karimnagar, India", "Khammam, India", "Khanapur, India", "Kodad, India", "Koratla, India", "Kothagudem, India", "Kyathampalle, India", "Madhira, India", "Mahabubabad, India", "Mahbubnagar, India", "Makthal, India", "Mancherial, India", "Mandamarri, India", "Manthani, India", "Medak, India", "Medchal, India", "Medchal-Malkajgiri, India", "Miryalaguda, India", "Mulugu, India", "Nagarkurnool, India", "Nakrekal, India", "Nalgonda, India", "Narayanpet, India", "Narayankhed, India", "Narsampet, India", "Nirmal, India", "Nizamabad, India", "Palakurthi, India", "Palwancha, India", "Parkal, India", "Patancheru, India", "Peddapalli, India", "Ramagundam, India", "Rangareddy, India", "Sadashivpet, India", "Sangareddy, India", "Sarapaka, India", "Sathupalli, India", "Secunderabad, India", "Siddipet, India", "Singareni, India", "Sircilla, India", "Suryapet, India", "Tandur, India", "Vemulawada, India", "Vikarabad, India", "Wanaparthy, India", "Warangal, India", "Yellandu, India", "Yellareddy, India", "Zaheerabad, India",
  "Adilabad District, India", "Bhadradri Kothagudem District, India", "Hanumakonda District, India", "Hyderabad District, India", "Jagtial District, India", "Jangaon District, India", "Jayashankar Bhupalpally District, India", "Jogulamba Gadwal District, India", "Kamareddy District, India", "Karimnagar District, India", "Khammam District, India", "Komaram Bheem Asifabad District, India", "Mahabubabad District, India", "Mahbubnagar District, India", "Mancherial District, India", "Medak District, India", "Medchal-Malkajgiri District, India", "Mulugu District, India", "Nagarkurnool District, India", "Nalgonda District, India", "Narayanpet District, India", "Nirmal District, India", "Nizamabad District, India", "Peddapalli District, India", "Rajanna Sircilla District, India", "Rangareddy District, India", "Sangareddy District, India", "Siddipet District, India", "Suryapet District, India", "Vikarabad District, India", "Wanaparthy District, India", "Warangal District, India", "Yadadri Bhuvanagiri District, India"
];

const otherIndianCities = [
  "Mumbai, India", "Delhi, India", "Bengaluru, India",
  "Ahmedabad, India", "Chennai, India", "Kolkata, India", "Surat, India", "Pune, India", "Jaipur, India",
  "Lucknow, India", "Kanpur, India", "Nagpur, India", "Indore, India", "Thane, India",
  "Bhopal, India", "Patna, India", "Vadodara, India", "Ghaziabad, India",
  "Ludhiana, India", "Agra, India", "Nashik, India", "Faridabad, India", "Meerut, India",
  "Rajkot, India", "Varanasi, India", "Srinagar, India", "Aurangabad, India", "Dhanbad, India",
  "Amritsar, India", "Navi Mumbai, India", "Prayagraj, India", "Ranchi, India", "Coimbatore, India",
  "Jabalpur, India", "Gwalior, India", "Jodhpur, India", "Madurai, India",
  "Raipur, India", "Kota, India", "Guwahati, India", "Chandigarh, India", "Thiruvananthapuram, India",
  "Noida, India", "Jamshedpur, India", "Kochi, India", "Dehradun, India", "Udaipur, India",
  "Bhubaneswar, India", "Mysuru, India", "Shimla, India", "Gangtok, India", "Itanagar, India",
  "Dispur, India", "Aizawl, India", "Imphal, India", "Shillong, India", "Kohima, India", "Agartala, India"
];

const topGlobalLocations = [
  "New York, USA", "Los Angeles, USA", "Chicago, USA", "Miami, USA", "San Francisco, USA", "Washington D.C., USA", "Boston, USA", "Las Vegas, USA", "Seattle, USA", "New Orleans, USA", "Orlando, USA", "Denver, USA", "Houston, USA", "Dallas, USA", "Philadelphia, USA", "Atlanta, USA", "San Diego, USA", "Austin, USA", "Nashville, USA", "Portland, USA", "Honolulu, USA",
  "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada", "Calgary, Canada", "Ottawa, Canada", "Quebec City, Canada", "Edmonton, Canada",
  "Mexico City, Mexico", "Cancun, Mexico", "Guadalajara, Mexico", "Monterrey, Mexico",
  "Sao Paulo, Brazil", "Rio de Janeiro, Brazil", "Salvador, Brazil", "Brasilia, Brazil", "Manaus, Brazil",
  "Buenos Aires, Argentina", "Mendoza, Argentina", "Ushuaia, Argentina",
  "Lima, Peru", "Cusco, Peru", "Machu Picchu, Peru",
  "Bogota, Colombia", "Medellin, Colombia", "Cartagena, Colombia",
  "Santiago, Chile", "Valparaiso, Chile",
  "Quito, Ecuador", "Galapagos Islands, Ecuador",
  "Montevideo, Uruguay", "La Paz, Bolivia", "Caracas, Venezuela",
  "London, UK", "Edinburgh, UK", "Manchester, UK", "Liverpool, UK",
  "Paris, France", "Nice, France", "Lyon, France", "Marseille, France",
  "Berlin, Germany", "Munich, Germany", "Hamburg, Germany", "Frankfurt, Germany",
  "Rome, Italy", "Venice, Italy", "Florence, Italy", "Milan, Italy", "Naples, Italy",
  "Madrid, Spain", "Barcelona, Spain", "Seville, Spain", "Valencia, Spain",
  "Lisbon, Portugal", "Porto, Portugal",
  "Amsterdam, Netherlands", "Rotterdam, Netherlands",
  "Brussels, Belgium", "Bruges, Belgium",
  "Zurich, Switzerland", "Geneva, Switzerland", "Lucerne, Switzerland", "Interlaken, Switzerland",
  "Vienna, Austria", "Salzburg, Austria",
  "Dublin, Ireland", "Prague, Czech Republic", "Budapest, Hungary",
  "Krakow, Poland", "Warsaw, Poland",
  "Athens, Greece", "Santorini, Greece", "Mykonos, Greece",
  "Copenhagen, Denmark", "Stockholm, Sweden", "Oslo, Norway", "Helsinki, Finland", "Reykjavik, Iceland",
  "Moscow, Russia", "St. Petersburg, Russia",
  "Tokyo, Japan", "Kyoto, Japan", "Osaka, Japan",
  "Beijing, China", "Shanghai, China", "Hong Kong, China", "Xi'an, China", "Guangzhou, China",
  "Seoul, South Korea", "Busan, South Korea",
  "Singapore, Singapore",
  "Bangkok, Thailand", "Phuket, Thailand", "Chiang Mai, Thailand",
  "Kuala Lumpur, Malaysia", "Penang, Malaysia",
  "Ho Chi Minh City, Vietnam", "Hanoi, Vietnam", "Ha Long Bay, Vietnam",
  "Manila, Philippines", "Bali, Indonesia", "Jakarta, Indonesia",
  "Taipei, Taiwan",
  "Kathmandu, Nepal", "Colombo, Sri Lanka", "Dhaka, Bangladesh", "Male, Maldives",
  "Dubai, UAE", "Abu Dhabi, UAE", "Istanbul, Turkey", "Jerusalem, Israel", "Tel Aviv, Israel", "Petra, Jordan", "Doha, Qatar", "Muscat, Oman", "Riyadh, Saudi Arabia", "Mecca, Saudi Arabia", "Tehran, Iran",
  "Cairo, Egypt", "Luxor, Egypt", "Giza, Egypt",
  "Marrakech, Morocco", "Fes, Morocco", "Casablanca, Morocco",
  "Cape Town, South Africa", "Johannesburg, South Africa", "Kruger National Park, South Africa",
  "Nairobi, Kenya", "Maasai Mara, Kenya",
  "Dar es Salaam, Tanzania", "Zanzibar City, Tanzania", "Serengeti National Park, Tanzania",
  "Addis Ababa, Ethiopia", "Accra, Ghana", "Lagos, Nigeria",
  "Sydney, Australia", "Melbourne, Australia", "Brisbane, Australia", "Perth, Australia", "Adelaide, Australia", "Cairns, Australia", "Gold Coast, Australia", "Uluru, Australia",
  "Auckland, New Zealand", "Queenstown, New Zealand", "Wellington, New Zealand", "Christchurch, New Zealand",
  "Nadi, Fiji", "Bora Bora, French Polynesia",
];

const CITIES_RECOMMENDATIONS = [
  ...new Set([
    ...detailedAndhraPradeshLocations,
    ...detailedTelanganaLocations,
    ...otherIndianCities,
    ...topGlobalLocations
  ])
];

const formSchema = z.object({
  location: z.string().min(1, "Location is required."),
  startDate: z.date({ required_error: "Start date is required." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  endDate: z.date({ required_error: "End date is required." }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  commuteDurationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute.").max(720, "Duration cannot exceed 12 hours."),
}).refine(data => {
  const startDateTime = setMilliseconds(setSeconds(setMinutes(setHours(data.startDate, parseInt(data.startTime.split(':')[0])), parseInt(data.startTime.split(':')[1])),0),0);
  const endDateTime = setMilliseconds(setSeconds(setMinutes(setHours(data.endDate, parseInt(data.endTime.split(':')[0])), parseInt(data.endTime.split(':')[1])),0),0);
  return endDateTime > startDateTime;
}, {
  message: "End date and time must be after start date and time.",
  path: ["endDate"], 
});

type TravelFormValues = z.infer<typeof formSchema>;

export default function TravelAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestOptimumTravelTimeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLDivElement>(null);

  const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] = useState(false);
  const [isEndDatePopoverOpen, setIsEndDatePopoverOpen] = useState(false);


  const form = useForm<TravelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      startDate: new Date(),
      startTime: format(new Date(), "HH:mm"),
      endDate: new Date(),
      endTime: format(addMinutes(new Date(), 60), "HH:mm"),
      commuteDurationMinutes: 30,
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


  const onSubmit = async (values: TravelFormValues) => {
    setIsLoading(true);
    setSuggestion(null);
    setError(null);

    const startDateTime = setMilliseconds(setSeconds(setMinutes(setHours(values.startDate, parseInt(values.startTime.split(':')[0])), parseInt(values.startTime.split(':')[1])),0),0);
    const endDateTime = setMilliseconds(setSeconds(setMinutes(setHours(values.endDate, parseInt(values.endTime.split(':')[0])), parseInt(values.endTime.split(':')[1])),0),0);
    
    const input: SuggestOptimumTravelTimeInput = {
      location: values.location,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      commuteDurationMinutes: values.commuteDurationMinutes,
    };

    try {
      toast({ title: "AI Thinking...", description: "The AI assistant is working on your travel suggestion."});
      const result = await suggestOptimumTravelTime(input);
      setSuggestion(result);
      toast({
        title: "Suggestion Ready!",
        description: "AI has suggested an optimum travel time.",
      });
    } catch (e) {
      console.error("Error fetching travel suggestion:", e);
      const errorMessage = e instanceof Error ? e.message : "Failed to get suggestion.";
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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><Sparkles className="mr-2 h-6 w-6 text-accent" />AI Travel Assistant</CardTitle>
        <CardDescription>Get AI-powered suggestions for the best time to start your commute, considering weather.</CardDescription>
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
                        placeholder="Enter commute location" 
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Earliest Start Date</FormLabel>
                    <Popover open={isStartDatePopoverOpen} onOpenChange={setIsStartDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
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
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Earliest Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                   <FormItem className="flex flex-col">
                    <FormLabel>Latest Start Date</FormLabel>
                    <Popover open={isEndDatePopoverOpen} onOpenChange={setIsEndDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
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
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latest Start Time</FormLabel>
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
              name="commuteDurationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commute Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Getting Suggestion...' : 'Get Optimum Travel Time'}
            </Button>
          </form>
        </Form>

        {suggestion && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-lg">
            <h4 className="font-semibold text-lg flex items-center text-primary-foreground"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" />Suggested Start Time:</h4>
            <p className="text-primary-foreground/90">{new Date(suggestion.suggestedStartTime).toLocaleString()}</p>
            <h4 className="font-semibold text-lg mt-2 text-primary-foreground">Reason:</h4>
            <p className="text-primary-foreground/90">{suggestion.reason}</p>
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
  );
}
