"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Assuming correct import path
import GlobalNav from "@/components/layout/GlobalNav";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import Loading from "./loading";
import "./globals.css";

// --- 1. Client Component Wrapper for Authentication Logic ---
function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<any>(null);
  
  // 1a. Effect for initial session fetching and redirection
  useEffect(() => {
    const getInitialSession = async () => {
      // NOTE: Using getSession in a Client Component is generally okay for initial checks,
      // but proper Next.js authentication often uses Server Components for the initial check.
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        // Redirect from auth pages to dashboard if logged in
        if (pathname === "/login" || pathname === "/signup") {
          router.replace("/"); // Use replace to avoid history build-up
        }
      } else {
        setUser(null);
        // Redirect from protected pages to login if logged out
        if (pathname !== "/login" && pathname !== "/signup" && pathname !== "/") { // Assuming root is public/landing for now
          router.replace("/login");
        }
      }
      setLoading(false);
      setCurrentSession(session);
    };

    getInitialSession();

    // Listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentSession(session);
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        } else if (event === 'SIGNED_IN') {
          router.push('/');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [pathname, router]); 


  if (loading) {
    return <Loading />;
  }

  return (
    // Wrap children in layout components
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {/* Only show navigation if the user is authenticated */}
        {(user || pathname === '/' || pathname === '/risk-assessor' || pathname === '/saved') && <GlobalNav />} 
        <main className={user ? "pt-16" : ""}>
          {children}
        </main>
        <Toaster />
      </ThemeProvider>
    </QueryProvider>
  );
}

// --- 2. Root Layout (MUST contain <html> and <body>) ---

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-gray-900 text-white">
        {/* All client-side logic is delegated to the wrapper component */}
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
