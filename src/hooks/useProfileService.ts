// ─────────────────────────────────────────────────────────
// useProfileService — Fetches the logged-in user's profile
//
// ✏️ HOW IT WORKS:
//   Queries the "Profiles" Supabase table by user_id.
//   The result is used in MainLayout to display the user's
//   name in the top-right header dropdown.
//
// ✏️ HOW TO EXTEND:
//   Add updateProfile, deleteProfile etc. as new async
//   functions and include them in the return object.
//
// ✏️ TABLE NAME:
//   The table is named "Profiles" (capital P). If you rename
//   your table, update the .from("Profiles") call below.
// ─────────────────────────────────────────────────────────

import { supabase } from '../services/supabase';
import type { Profile } from '../types/Profile';

export const useProfileService = () => {
  /**
   * Fetch a single Profile row by Supabase auth user ID.
   * Returns null if not found or on error.
   */
  const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('Profiles')  // ✏️ Rename if your table has a different name
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .single();

      // PGRST116 = "no rows found" — not a real error, just no profile yet
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  return { getProfileByUserId };
};
