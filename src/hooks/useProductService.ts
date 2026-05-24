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

  /**
   * Fetch a single product by its ID from the "Products" table.
   * Includes related category and brand data.
   * Returns a single Product object, or throws on error.
   */
  const getProductById = async (id: number) => {
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
        .eq("product_id", id)
        .eq("is_deleted", false)
        .single();
      if (error) throw handleSupabaseError(error);
      return data as Product;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  };

  return { getProducts, getProductById };
};
