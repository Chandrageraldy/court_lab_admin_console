import { supabase } from "../services/supabase";
import { handleSupabaseError } from "../utils/ErrorHandlers";

export interface TransactionItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface TransactionInput {
  total_amount: number;
  payment_method: "cash" | "card" | "transfer" | "qris";
  notes?: string;
  items: TransactionItemInput[];
}

export const useTransactionService = () => {
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

  return { createTransaction };
};
