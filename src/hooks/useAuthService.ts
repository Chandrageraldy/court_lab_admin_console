// ─────────────────────────────────────────────────────────
// useAuthService — Supabase Auth Hook
//
// Provides session state, the current user, and auth actions
// (signIn, signOut) consumed across the entire app.
//
// ✏️ HOW IT WORKS:
//   1. On mount it calls supabase.auth.getSession() to restore
//      any existing session from localStorage.
//   2. supabase.auth.onAuthStateChange() keeps the state in
//      sync whenever the user logs in or out.
//   3. isLoading stays true until the initial session check
//      is complete — used by ProtectedRoute to avoid flickers.
//
// ✏️ HOW TO ADD MORE AUTH METHODS:
//   - Magic link: await supabase.auth.signInWithOtp({ email })
//   - OAuth:      await supabase.auth.signInWithOAuth({ provider: 'google' })
//   Just add them as new functions and include them in the
//   return object below.
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export const useAuthService = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Keep state in sync with Supabase auth events (login / logout / token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, []);

  /** Sign in with email + password (Supabase Email Auth must be enabled) */
  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  /** Sign out the current user and clear the session */
  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  return {
    session,  // Full Supabase session object (includes access_token, etc.)
    user,     // Supabase User object (id, email, metadata, etc.)
    isLoading,// true while resolving the initial session
    signIn,
    signOut,
  };
};
