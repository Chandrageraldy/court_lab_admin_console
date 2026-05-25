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
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
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

  /**
   * Create a new product in the "Products" table.
   * Returns the created Product object, or throws on error.
   */
  const createProduct = async (product: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from("Products")
        .insert({ ...product, is_deleted: false })
        .select()
        .single();
      if (error) throw handleSupabaseError(error);
      return data as Product;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  };

  /**
   * Update an existing product by its ID in the "Products" table.
   * Returns the updated Product object, or throws on error.
   */
  const updateProduct = async (id: number, product: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from("Products")
        .update(product)
        .eq("product_id", id)
        .select()
        .single();
      if (error) throw handleSupabaseError(error);
      return data as Product;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  /**
   * Soft delete a product by setting is_deleted to true.
   * Returns the updated Product object, or throws on error.
   */
  const deleteProduct = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("Products")
        .update({ is_deleted: true })
        .eq("product_id", id)
        .select()
        .single();
      if (error) throw handleSupabaseError(error);
      return data as Product;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  /**
   * Soft delete products by setting is_deleted to true.
   * Returns list of updated Product object, or throws on error.
   */
  const deleteProducts = async (ids: number[]) => {
    try {
      const { data, error } = await supabase
        .from("Products")
        .update({ is_deleted: true })
        .in("product_id", ids)
        .select();

      if (error) throw handleSupabaseError(error);
      return data as Product[];
    } catch (error) {
      console.error("Error bulk deleting products:", error);
      throw error;
    }
  };

  return {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
  };
};
