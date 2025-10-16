"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/db";
import type { User } from "@supabase/supabase-js";
import {
  setUser as setSentryUser,
  clearUser as clearSentryUser,
} from "@/services/sentry";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setSentryUser(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setSentryUser(session.user.id, session.user.email);
      } else {
        clearSentryUser();
      }
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    clearSentryUser();
    if (error) throw error;
    router.push("/");
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
};
