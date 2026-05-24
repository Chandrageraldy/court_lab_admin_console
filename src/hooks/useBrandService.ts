import { supabase } from "../services/supabase";
import type { Brand } from "../types/Brand";
import { handleSupabaseError } from "../utils/ErrorHandlers";

export const useBrandService = () => {
  /**
   * Fetch all brands from the "Brands" table.
   * Returns an array of Brand objects, or throws on error.
   */
  const getBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("Brands")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw handleSupabaseError(error);
      return data as Brand[];
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  };

  return { getBrands };
};
