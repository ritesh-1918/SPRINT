"use client";

import { Sun, Moon } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
// Imported SearchBar

export default function AppHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); 

  // State for search input (passed to SearchBar)
  const [locationInput, setLocationInput] = useState<string | null>(null);

  const navItems = [
    { name: "Dashboard", href: "/" }, // Root path is Dashboard
    { name: "Risk Assessor", href: "/risk-assessor" },
    { name: "Saved & Reports", href: "/saved" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Handle Search function, called when user hits Enter or clicks Search button
  const handleSearch = (query: string) => {
    if (query) {
      // Logic: Navigate to dashboard or push to a search results page.
      // For SPRINT, we assume searching a new location updates the dashboard.
      // In a full implementation, this should trigger a state update in a global context.
      console.log("Searching for:", query); 
      // For MVP, simply refresh the dashboard view and push the search query to state management if needed.
      router.push(`/?location=${encodeURIComponent(query)}`); 
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left side: Brand Logo and Title */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            {/* SPRINT Logo Icon (Stylized Storm/Radar) */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              <path d="M22 10a2 2 0 0 0-2-2h-1"/>
              <path d="M2.6 10.5a2 2 0 0 1 2-2h1"/>
              <path d="M17 19l-2.5-2.5"/>
              <path d="M14.5 21.5L12 19"/>
              <path d="M6.5 17.5L9 15"/>
              <path d="M9 12l-1.82-1.82a.5.5 0 0 0-.707 0L2.56 14.09a.5.5 0 0 0 0 .707L4.4 16.63a.5.5 0 0 0 .707 0L7 14.8"/>
            </svg>
            <span className="font-bold font-headline text-base sm:text-xl whitespace-nowrap"> 
              SPRINT - Storm Perception Risk Intelligence Network Tool
            </span>
          </Link>
          
          {/* Main Navigation Links (Hidden on small screens for mobile responsiveness) */}
          <nav className="hidden md:flex space-x-4 ml-8">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Right side: Search Bar and Theme Toggle */}
        <div className="flex items-center space-x-2">
            {/* Search Bar Component */}
            <div className="hidden md:block">
              
            </div>

            {/* Theme Toggle */}
            {mounted && (
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
            )}
        </div>
      </div>
    </header>
  );
}
