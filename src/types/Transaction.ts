export interface Transaction {
  transaction_id: number;
  total_amount: number;
  payment_method: "cash" | "card" | "transfer" | "qris";
  notes: string | null;
  created_at: string;
  is_voided: boolean;
}
