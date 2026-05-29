import { formatIDR } from "../../utils/Helpers";
import type { Transaction } from "../../types/Transaction";
import {
  DefaultDialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/DefaultDialog";
import Badge from "../../components/ui/Badge";
import DefaultButton from "../../components/ui/DefaultButton";
import { Printer } from "lucide-react";

interface TransactionItem {
  transaction_item_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  notes: string | null;
  subtotal: number;
  product: { name: string };
}

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  items: TransactionItem[];
  isLoading?: boolean;
  onPrint?: (transaction: Transaction) => void;
}

const TransactionDetailDialog = ({
  open,
  onOpenChange,
  transaction,
  items,
  isLoading = false,
  onPrint,
}: TransactionDetailDialogProps) => {
  if (!transaction) return null;

  const date = new Date(transaction.created_at);

  return (
    <DefaultDialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white">
        {/* ── Header ── */}
        <div className="mb-2">
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription className="mt-2">
            View the details of this transaction.
          </DialogDescription>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 rounded-full border-4 border-[#d93f1d]/30 border-t-[#d93f1d] animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Transaction ID</p>
                  <p className="font-bold text-gray-900 text-xs">
                    #TXN-{transaction.transaction_id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                  <p className="font-bold text-[#F14B27] text-xs">
                    {formatIDR(transaction.total_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Payment Method</p>
                  <p className="font-semibold text-gray-900 capitalize text-xs">
                    {transaction.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  {transaction.is_voided ? (
                    <Badge label="Voided" variant="red" />
                  ) : (
                    <Badge label="Completed" variant="green" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date</p>
                  <p className="font-semibold text-gray-900 text-xs">
                    {date.toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Time</p>
                  <p className="font-semibold text-gray-900 text-xs">
                    {date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {transaction.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                  <p className="text-xs text-gray-700">{transaction.notes}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="col-span-5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Item
                </p>

                <p className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">
                  Qty
                </p>

                <p className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">
                  Price
                </p>

                <p className="col-span-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">
                  Subtotal
                </p>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.transaction_item_id}
                    className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50 transition-colors"
                  >
                    {/* Product */}
                    <div className="col-span-5 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate capitalize">
                        {item.product?.name ?? `Product #${item.product_id}`}
                      </p>

                      {item.notes && (
                        <p className="text-xs text-gray-400 italic mt-0.5 truncate">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {item.quantity}
                      </span>
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-xs text-gray-600">
                        {formatIDR(item.unit_price)}
                      </span>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-3 flex items-center justify-end">
                      <span className="text-xs font-bold text-gray-900">
                        {formatIDR(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Total */}
              <div className="border-t border-gray-200 bg-[#FFF7F5] p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Total Amount</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#F14B27]">
                    {formatIDR(transaction.total_amount)}
                  </span>
                  {onPrint && (
                    <DefaultButton variant="primary" handleClick={() => onPrint(transaction)}>
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </DefaultButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </DefaultDialog>
  );
};

export default TransactionDetailDialog;
