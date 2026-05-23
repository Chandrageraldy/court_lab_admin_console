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

import { supabase } from "../services/supabase";
import type { Product } from "../types/Product";
import { handleSupabaseError } from "../utils/ErrorHandlers";

export const useProductService = () => {
  /**
   * Fetch all non-deleted products from the "Products" table.
   * Returns an array of Product objects, or null on error.
   */
  const getProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("Products")
        .select(
          `
        *,
        category:Categories(*),
        brand:Brands(*)
      `,
        )
        .eq("is_deleted", false);
      if (error) throw handleSupabaseError(error);
      console.log("Fetched products:", data);
      return data as Product[];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

  return { getProducts };
};
