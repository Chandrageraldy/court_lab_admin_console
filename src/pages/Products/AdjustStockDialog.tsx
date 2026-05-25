// components/ui/AdjustStockDialog.tsx
import { useEffect, useState } from "react";
import {
  DefaultDialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/DefaultDialog";
import DefaultButton from "../../components/ui/DefaultButton";
import DefaultTextField from "../../components/ui/DefaultTextField";
import { PackagePlus, PackageMinus } from "lucide-react";
import type { Product } from "../../types/Product";

interface AdjustStockDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (product: Product, newQuantity: number) => void;
}

const AdjustStockDialog = ({
  product,
  open,
  onOpenChange,
  onConfirm,
}: AdjustStockDialogProps) => {
  const [quantity, setQuantity] = useState("");

  // ===== Lifecycle =====
  useEffect(() => {
    if (!open) setQuantity("");
  }, [open]);

  if (!product) return null;

  const qty = Math.max(0, Number(quantity) || 0);
  const afterAdd = product.stock_quantity + qty;
  const afterRemove = Math.max(0, product.stock_quantity - qty);

  // ===== Action Handlers =====
  const handleQuantityChange = (value: string) => {
    const raw = value.replace(/\D/g, "");
    setQuantity(raw);
  };

  const handleClose = () => {
    setQuantity("");
    onOpenChange(false);
  };

  return (
    <DefaultDialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      <DialogContent className="max-w-md bg-white">
        {/* ── Header ── */}
        <div className="mb-2">
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription className="mt-2">
            Update the stock quantity for this product.
          </DialogDescription>
        </div>

        {/* ── Product Info ── */}
        <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Product</span>
            <span className="font-semibold text-gray-900 capitalize">
              {product.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Current Stock</span>
            <span className="font-semibold text-gray-900">
              {product.stock_quantity}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Threshold</span>
            <span className="font-semibold text-gray-900">
              {product.low_stock_threshold}
            </span>
          </div>
        </div>

        {/* ── Quantity Field ── */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
            Quantity
          </label>
          <DefaultTextField
            value={quantity}
            onChange={handleQuantityChange}
            type="text"
          />
        </div>

        {/* ── Add / Remove Buttons ── */}
        <div className="grid grid-cols-2 gap-3">
          <DefaultButton
            variant="danger"
            handleClick={() => onConfirm(product, afterRemove)}
          >
            <PackageMinus className="w-4 h-4" />
            Remove Stock
          </DefaultButton>
          <DefaultButton
            variant="success"
            handleClick={() => onConfirm(product, afterAdd)}
          >
            <PackagePlus className="w-4 h-4" />
            Add Stock
          </DefaultButton>
        </div>

        {/* ── Preview ── */}
        <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2 text-xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Preview
          </p>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">New stock (add)</span>
            <span className="font-semibold text-green-600">
              {product.stock_quantity} → {afterAdd}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">
              New stock (remove)
            </span>
            <span className="font-semibold text-red-500">
              {product.stock_quantity} → {afterRemove}
            </span>
          </div>
        </div>
      </DialogContent>
    </DefaultDialog>
  );
};

export default AdjustStockDialog;
