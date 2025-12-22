"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
        } else {
          // No session - sign in anonymously
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error("Anonymous sign-in failed:", error);
          } else {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check if migration has been done
  useEffect(() => {
    const claimed = localStorage.getItem("gif-stash-claimed");
    setHasClaimed(claimed === "true");
  }, []);

  const markAsClaimed = () => {
    localStorage.setItem("gif-stash-claimed", "true");
    setHasClaimed(true);
  };

  return { user, isLoading, hasClaimed, markAsClaimed };
}
