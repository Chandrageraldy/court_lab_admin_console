export interface TransactionItem {
  transaction_item_id: number;
  transaction_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  notes: string | null;
  subtotal: number;
}
