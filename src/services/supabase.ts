import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────
// Supabase Client
//
// ✏️ STEP 2: Make sure your .env file has these two values:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
//
// You can find them in your Supabase project:
//   Project Settings → API → Project URL & Publishable key
// ─────────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    '[base-kit] Supabase URL or Publishable Key is missing.\n' +
    'Create a .env file from .env.example and fill in your credentials.'
  );
}

// This singleton client is imported throughout the app via:
//   import { supabase } from '../services/supabase';
export const supabase = createClient(supabaseUrl || '', supabasePublishableKey || '');
