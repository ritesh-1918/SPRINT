"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/risk-assessor", label: "Risk Assessor" },
  { href: "/saved", label: "Saved & Reports" },
];

export default function GlobalNav() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Initial check for user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="w-full bg-gray-900 border-b shadow-sm py-2 px-4 flex items-center justify-between z-[9999] text-white fixed top-0">
      {user && (
        <ul className="flex gap-8 text-lg font-medium text-white">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-blue-600 transition-colors text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div>
        {user ? (
          <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded-md">
            Logout
          </button>
        ) : (
          <div className="flex gap-4">
            <Link href="/login">
              <button className="p-2 bg-blue-500 text-white rounded-md">
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className="p-2 bg-green-500 text-white rounded-md">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}