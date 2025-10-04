// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button"; // Assuming you have this component

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session when the page loads
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    // Listen for changes in authentication state (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Clean up the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null); // Instantly update the UI
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-white">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white sm:text-6xl">
          Expense Management
        </h1>
        <p className="mt-4 text-lg text-gray-400">A Hackathon Project</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        {session ? (
          <>
            <Link
              href="/dashboard"
              className="rounded-md bg-teal-600 px-6 py-3 text-center font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              Go to Your Dashboard
            </Link>
            <Button
              onClick={handleLogout}
              className="bg-red-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-red-500"
            >
              Logout
            </Button>
          </>
        ) : (
          <Link
            href="/login" // This should match the path to your AuthPage, e.g., app/(auth)/login/page.tsx
            className="rounded-md bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Login or Register
          </Link>
        )}
      </div>
    </main>
  );
}
