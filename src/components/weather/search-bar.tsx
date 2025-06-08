
"use client";

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card'; // For styling the suggestions dropdown

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const detailedAndhraPradeshLocations = [
  "Paderu, India", "Alluri Sitharama Raju District, India", "Anakapalli, India", "Anantapur, India", "Rayachoti, India",
  "Annamayya District, India", "Bapatla, India", "Chittoor, India", "Rajahmundry, India", "East Godavari District, India",
  "Eluru, India", "Guntur, India", "Kadapa, India", "Kakinada, India", "Amalapuram, India", "Konaseema District, India",
  "Machilipatnam, India", "Krishna District, India", "Kurnool, India", "Parvathipuram, India", "Manyam District, India",
  "Vijayawada, India", "NTR District, India", "Nandyal, India", "Nellore, India", "Narasaraopet, India",
  "Palnadu District, India", "Ongole, India", "Prakasam District, India", "Tirupati, India", "Sri Balaji District, India",
  "Puttaparthi, India", "Sri Sathya Sai District, India", "Srikakulam, India", "Visakhapatnam, India",
  "Vizianagaram, India", "Bhimavaram, India", "West Godavari District, India", "Adoni, India", "Tenali, India",
  "Hindupur, India", "Proddatur, India", "Madanapalle, India", "Guntakal, India", "Dharmavaram, India",
  "Gudivada, India", "Tadpatri, India", "Mangalagiri, India", "Tadepalligudem, India", "Amaravati, India",
  "Chilakaluripet, India", "Repalle, India", "Sattenapalle, India", "Markapur, India", "Bobbili, India",
  "Salur, India", "Samalkota, India", "Pithapuram, India", "Peddapuram, India", "Palakollu, India",
  "Narasapuram, India", "Tanuku, India", "Kavali, India", "Gudur, India", "Sullurpeta, India",
  "Venkatagiri, India", "Punganur, India", "Srikalahasti, India"
];

const detailedTelanganaLocations = [
  "Adilabad, India", "Kothagudem, India", "Bhadradri Kothagudem District, India", "Hanumakonda, India",
  "Hyderabad, India", "Jagitial, India", "Jangaon, India", "Bhupalpally, India", "Jayashankar Bhupalpally District, India",
  "Gadwal, India", "Jogulamba Gadwal District, India", "Kamareddy, India", "Karimnagar, India", "Khammam, India",
  "Asifabad, India", "Komaram Bheem Asifabad District, India", "Mahabubabad, India", "Mahbubnagar, India",
  "Mancherial, India", "Medak, India", "Medchal, India", "Malkajgiri, India", "Medchal-Malkajgiri District, India",
  "Mulugu, India", "Nagarkurnool, India", "Nalgonda, India", "Narayanpet, India", "Nirmal, India", "Nizamabad, India",
  "Peddapalli, India", "Sircilla, India", "Rajanna Sircilla District, India", "Shamshabad, India",
  "Rangareddy District, India", "Sangareddy, India", "Siddipet, India", "Suryapet, India", "Vikarabad, India",
  "Wanaparthy, India", "Warangal, India", "Bhuvanagiri, India", "Yadadri Bhuvanagiri District, India",
  "Ramagundam, India", "Miryalaguda, India", "Bodhan, India", "Armoor, India", "Korutla, India", "Palwancha, India",
  "Tandur, India", "Zaheerabad, India", "Patancheru, India", "Bhadrachalam, India", "Sathupalli, India",
  "Yellandu, India", "Kodad, India", "Devarakonda, India", "Bellampalli, India", "Mandamarri, India",
  "Metpally, India", "Vemulawada, India", "Sirpur Kaghaznagar, India"
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
  // North America
  "New York, USA", "Los Angeles, USA", "Chicago, USA", "Miami, USA", "San Francisco, USA", "Washington D.C., USA", "Boston, USA", "Las Vegas, USA", "Seattle, USA", "New Orleans, USA", "Orlando, USA", "Denver, USA", "Houston, USA", "Dallas, USA", "Philadelphia, USA", "Atlanta, USA", "San Diego, USA", "Austin, USA", "Nashville, USA", "Portland, USA", "Honolulu, USA",
  "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada", "Calgary, Canada", "Ottawa, Canada", "Quebec City, Canada", "Edmonton, Canada",
  "Mexico City, Mexico", "Cancun, Mexico", "Guadalajara, Mexico", "Monterrey, Mexico",
  // South America
  "Sao Paulo, Brazil", "Rio de Janeiro, Brazil", "Salvador, Brazil", "Brasilia, Brazil", "Manaus, Brazil",
  "Buenos Aires, Argentina", "Mendoza, Argentina", "Ushuaia, Argentina",
  "Lima, Peru", "Cusco, Peru", "Machu Picchu, Peru",
  "Bogota, Colombia", "Medellin, Colombia", "Cartagena, Colombia",
  "Santiago, Chile", "Valparaiso, Chile",
  "Quito, Ecuador", "Galapagos Islands, Ecuador",
  "Montevideo, Uruguay", "La Paz, Bolivia", "Caracas, Venezuela",
  // Europe
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
  // Asia
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
  // Africa
  "Cairo, Egypt", "Luxor, Egypt", "Giza, Egypt",
  "Marrakech, Morocco", "Fes, Morocco", "Casablanca, Morocco",
  "Cape Town, South Africa", "Johannesburg, South Africa", "Kruger National Park, South Africa",
  "Nairobi, Kenya", "Maasai Mara, Kenya",
  "Dar es Salaam, Tanzania", "Zanzibar City, Tanzania", "Serengeti National Park, Tanzania",
  "Addis Ababa, Ethiopia", "Accra, Ghana", "Lagos, Nigeria",
  // Oceania
  "Sydney, Australia", "Melbourne, Australia", "Brisbane, Australia", "Perth, Australia", "Adelaide, Australia", "Cairns, Australia", "Gold Coast, Australia", "Uluru, Australia",
  "Auckland, New Zealand", "Queenstown, New Zealand", "Wellington, New Zealand", "Christchurch, New Zealand",
  "Nadi, Fiji", "Bora Bora, French Polynesia",
];


// Combine, ensuring no duplicates and prioritizing regional lists
const CITIES_RECOMMENDATIONS = [
  ...new Set([
    ...detailedAndhraPradeshLocations,
    ...detailedTelanganaLocations,
    ...otherIndianCities,
    ...topGlobalLocations
  ])
];


export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      const filteredSuggestions = CITIES_RECOMMENDATIONS.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5)); // Show top 5
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="Search city (e.g., Visakhapatnam, India)..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          className="flex-grow"
          aria-label="Search location"
          disabled={isLoading}
          autoComplete="off"
        />
        <Button type="submit" disabled={isLoading || !query.trim()}>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-10 mt-1 w-full border bg-background shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
