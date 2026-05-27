import { supabase } from "../services/supabase";
import type { Transaction } from "../types/Transaction";
import { handleSupabaseError } from "../utils/ErrorHandlers";

export interface TransactionItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
  is_service?: boolean;
}

export interface TransactionInput {
  total_amount: number;
  payment_method: "cash" | "card" | "transfer" | "qris";
  notes?: string;
  items: TransactionItemInput[];
}

export const useTransactionService = () => {
  /**
   * Fetch all non-deleted transactions from the "Transactions" table.
   * Returns an array of Transaction objects, or null on error.
   */
  const getTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("Transactions")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw handleSupabaseError(error);
      console.log("Fetched transactions:", data);
      return data as Transaction[];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  };

  /**
   * Fetch all items for a specific transaction.
   * Includes related product data.
   * Returns an array of TransactionItem objects, or throws on error.
   */
  const getTransactionItems = async (transactionId: number) => {
    try {
      const { data, error } = await supabase
        .from("TransactionItems")
        .select(`*, product:Products(*)`)
        .eq("transaction_id", transactionId);
      if (error) throw handleSupabaseError(error);
      return data;
    } catch (error) {
      console.error("Error fetching transaction items:", error);
      throw error;
    }
  };

  /**
   * Create a new transaction with its items.
   * Also deducts stock from the Products table.
   */
  const createTransaction = async (input: TransactionInput) => {
    try {
      // 1. Insert transaction
      const { data: transaction, error: txError } = await supabase
        .from("Transactions")
        .insert({
          total_amount: input.total_amount,
          payment_method: input.payment_method,
          notes: input.notes,
        })
        .select()
        .single();

      if (txError) throw handleSupabaseError(txError);

      // 2. Insert transaction items
      const { error: itemsError } = await supabase
        .from("TransactionItems")
        .insert(
          input.items.map((item) => ({
            transaction_id: transaction.transaction_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes,
            subtotal: item.quantity * item.unit_price,
          })),
        );

      if (itemsError) throw handleSupabaseError(itemsError);

      // 3. Deduct stock for each item
      for (const item of input.items) {
        if (item.is_service) continue; // Skip stock deduction for services

        const { data: product, error: fetchError } = await supabase
          .from("Products")
          .select("stock_quantity")
          .eq("product_id", item.product_id)
          .single();

        if (fetchError) throw handleSupabaseError(fetchError);

        const { error: stockError } = await supabase
          .from("Products")
          .update({ stock_quantity: product.stock_quantity - item.quantity })
          .eq("product_id", item.product_id);

        if (stockError) throw handleSupabaseError(stockError);
      }

      return transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  };

  /**
   * Void a transaction by setting is_voided to true.
   * Also reverts stock for all non-service items.
   * Returns the updated Transaction object, or throws on error.
   */
  const voidTransaction = async (transactionId: number) => {
    try {
      // 1. Fetch transaction items
      const items = await getTransactionItems(transactionId);

      // 2. Revert stock for each non-service item
      for (const item of items) {
        if (item.product?.is_service) continue;

        const { data: product, error: fetchError } = await supabase
          .from("Products")
          .select("stock_quantity")
          .eq("product_id", item.product_id)
          .single();

        if (fetchError) throw handleSupabaseError(fetchError);

        const { error: stockError } = await supabase
          .from("Products")
          .update({ stock_quantity: product.stock_quantity + item.quantity })
          .eq("product_id", item.product_id);

        if (stockError) throw handleSupabaseError(stockError);
      }

      // 3. Mark transaction as voided
      const { data, error } = await supabase
        .from("Transactions")
        .update({ is_voided: true })
        .eq("transaction_id", transactionId)
        .select()
        .single();

      if (error) throw handleSupabaseError(error);
      return data as Transaction;
    } catch (error) {
      console.error("Error voiding transaction:", error);
      throw error;
    }
  };

  return {
    getTransactions,
    getTransactionItems,
    createTransaction,
    voidTransaction,
  };
};
