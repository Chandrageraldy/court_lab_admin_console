import { supabase } from "../services/supabase";
import type { Category } from "../types/Category";
import { handleSupabaseError } from "../utils/ErrorHandlers";

export const useCategoryService = () => {
  /**
   * Fetch all categories from the "Categories" table.
   * Returns an array of Category objects, or throws on error.
   */
  const getCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("Categories")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw handleSupabaseError(error);
      return data as Category[];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };

  return { getCategories };
};
