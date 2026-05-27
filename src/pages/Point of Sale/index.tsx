// pages/PointOfSale/PointOfSale.tsx
import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus, X, Printer } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import type { Product } from "../../types/Product";
import { useProductService } from "../../hooks/useProductService";
import { useTransactionService } from "../../hooks/useTransactionService";
import { formatIDR } from "../../utils/Helpers";
import DefaultDropdown from "../../components/ui/DefaultDropdown";
import DefaultButton from "../../components/ui/DefaultButton";
import Receipt from "../../components/ui/Receipt";
import DefaultSearchField from "../../components/ui/DefaultSearchField";
import { useSnackbar } from "../../context/SnackbarContext";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Badge from "../../components/ui/Badge";

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  notes: string;
}

const PointOfSale = () => {
  // ===== Loading States =====
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // ===== Search & Filter States =====
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // ===== Data States =====
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingReceipt, setPendingReceipt] = useState<{
    transaction: any;
    items: CartItem[];
  } | null>(null);

  // ===== Field States =====
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "transfer" | "qris"
  >("qris");
  const [orderNotes, setOrderNotes] = useState("");

  // ===== Service Hooks =====
  const productService = useProductService();
  const transactionService = useTransactionService();

  // ===== Dialog States =====
  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);

  // ===== Snackbar =====
  const { showSnackbar } = useSnackbar();

  // ===== Data Fetching =====
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts();
      // Only show active, non-deleted products with stock
      setProducts(
        response
          .filter((p) => p.is_active)
          .sort((a, b) => {
            const aOutOfStock = a.stock_quantity <= 0;
            const bOutOfStock = b.stock_quantity <= 0;

            if (aOutOfStock === bOutOfStock) return 0;

            return aOutOfStock ? 1 : -1;
          }),
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Lifecycle =====
  useEffect(() => {
    fetchProducts();
  }, []);

  // ===== Action Handlers =====
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product.product_id === product.product_id,
      );
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map((i) =>
          i.product.product_id === product.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [
        ...prev,
        { product, quantity: 1, unit_price: product.selling_price, notes: "" },
      ];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.product_id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.product_id === productId
          ? { ...i, quantity: Math.min(quantity, i.product.stock_quantity) }
          : i,
      ),
    );
  };

  const updatePrice = (productId: number, price: string) => {
    const raw = price.replace(/\D/g, "");
    setCart((prev) =>
      prev.map((i) =>
        i.product.product_id === productId
          ? { ...i, unit_price: Number(raw) }
          : i,
      ),
    );
  };

  const updateNotes = (productId: number, notes: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product.product_id === productId ? { ...i, notes } : i,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
    setOrderNotes("");
    setPaymentMethod("qris");
  };

  // ===== Checkout =====
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsCheckingOut(true);

    try {
      const transaction = await transactionService.createTransaction({
        total_amount: totalAmount,
        payment_method: paymentMethod,
        notes: orderNotes,
        items: cart.map((i) => ({
          product_id: i.product.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          notes: i.notes,
          is_service: i.product.is_service,
        })),
      });

      showSnackbar("Transaction created successfully", "success");

      setPendingReceipt({
        transaction,
        items: [...cart],
      });

      setPrintConfirmOpen(true);

      clearCart();
      fetchProducts();
    } catch (error) {
      console.error("Error creating transaction:", error);
      showSnackbar("Unable to create transaction. Please try again.", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ===== Print Receipt =====
  const handlePrintReceipt = async (transaction: any, items: CartItem[]) => {
    setIsPrinting(true);

    try {
      const blob = await pdf(
        <Receipt
          transactionId={transaction.transaction_id}
          items={items.map((i) => ({
            ...i,
            product_id: i.product.product_id,
          }))}
          totalAmount={transaction.total_amount}
          paymentMethod={transaction.payment_method}
          notes={transaction.notes}
          createdAt={transaction.created_at}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Optional cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setIsPrinting(false);
    }
  };

  // ===== Totals =====
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, i) => sum + i.unit_price * i.quantity,
    0,
  );

  // ===== Filtered Products =====
  const filteredProducts = products.filter((p) => {
    const search = searchText.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(search) ||
      p.brand?.name?.toLowerCase().includes(search) ||
      p.category?.name?.toLowerCase().includes(search);
    const matchesCategory =
      selectedCategory === "" || p.category?.name === selectedCategory;
    const matchesBrand =
      selectedBrand === "" || p.brand?.name === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  // ===== Derived filter options =====
  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...Array.from(
      new Set(
        products.map((p) => p.category?.name).filter((n): n is string => !!n),
      ),
    ).map((name) => ({ label: name, value: name })),
  ];

  const brandOptions = [
    { label: "All Brands", value: "" },
    ...Array.from(
      new Set(
        products.map((p) => p.brand?.name).filter((n): n is string => !!n),
      ),
    ).map((name) => ({ label: name, value: name })),
  ];

  // ===== Reset Filters =====
  const hasActiveFilters =
    searchText !== "" || selectedCategory !== "" || selectedBrand !== "";

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedCategory("");
    setSelectedBrand("");
  };

  return (
    <>
      <div className="flex gap-5" style={{ height: "calc(100vh - 120px)" }}>
        {/* ── Left: Product Grid ─────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h2 className="text-2xl font-bold">Point of Sale</h2>
              <p className="text-sm text-gray-500 mt-1">
                {products.length} products available
              </p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <div className="relative flex-1">
              <DefaultSearchField
                searchValue={searchText}
                setSearchValue={setSearchText}
                handleSearch={() => {}}
                fullWidth
                placeholder="Search by name, brand, category..."
              />
            </div>

            <DefaultDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
            />

            <DefaultDropdown
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={brandOptions}
            />

            {hasActiveFilters && (
              <DefaultButton variant="ghost" handleClick={handleResetFilters}>
                <X className="w-3 h-3" />
                Reset
              </DefaultButton>
            )}
          </div>

          {/* Product Grid — scrollable */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-[#d93f1d]/30 border-t-[#d93f1d] animate-spin" />
                <span className="text-sm text-gray-400">
                  Loading products...
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 pb-4">
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock_quantity <= 0;
                    const inCart = cart.find(
                      (i) => i.product.product_id === product.product_id,
                    );
                    return (
                      <button
                        key={product.product_id}
                        onClick={() => !isOutOfStock && addToCart(product)}
                        disabled={isOutOfStock}
                        className={`relative bg-white rounded-lg border transition-all text-left p-3 ${
                          isOutOfStock
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:shadow-md hover:border-[#F14B27]/30 active:scale-[0.98]"
                        } ${
                          inCart
                            ? "border-[#F14B27]/40 shadow-sm"
                            : "border-gray-100"
                        }`}
                      >
                        {/* Image */}
                        <div className="relative w-full h-28 rounded-lg overflow-hidden bg-gray-50 mb-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                              No image
                            </div>
                          )}

                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                              <span className="text-white text-xs font-bold tracking-wide uppercase">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <p className="text-xs font-bold text-gray-800 capitalize truncate">
                          {product.name}
                        </p>
                        {/* Brand, Category & Service */}
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {product.is_service && (
                            <Badge label="Service" variant="green" />
                          )}

                          {product.brand?.name && (
                            <Badge label={product.brand.name} variant="blue" />
                          )}

                          {product.category?.name && (
                            <Badge
                              label={product.category.name}
                              variant="gray"
                            />
                          )}
                        </div>
                        <p className="text-xs text-[#F14B27] font-semibold mt-1.5">
                          {formatIDR(product.selling_price)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Stock:{" "}
                          {product.is_service
                            ? "Unlimited"
                            : product.stock_quantity}
                        </p>

                        {/* In cart badge */}
                        {inCart && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#F14B27] rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">
                              {inCart.quantity}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Cart & Order Summary ────────────── */}
        <div className="w-80 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm shrink-0 overflow-hidden">
          {/* Cart Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#F14B27]" />
              <span className="text-sm font-bold text-gray-900">
                Order Summary
              </span>
              {totalItems > 0 && (
                <span className="bg-[#FFF1ED] text-[#F14B27] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                <ShoppingCart className="w-10 h-10 opacity-30" />
                <p className="text-xs">Cart is empty</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {cart.map((item) => (
                  <div
                    key={item.product.product_id}
                    className="bg-gray-50 rounded-lg p-3"
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 shrink-0">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-800 capitalize truncate">
                          {item.product.name}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.product_id)}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price (editable) */}
                    <div className="mb-2">
                      <label className="text-[10px] text-gray-400 mb-1 block">
                        Price (IDR)
                      </label>
                      <input
                        type="text"
                        value={Number(item.unit_price).toLocaleString("id-ID")}
                        onChange={(e) =>
                          updatePrice(item.product.product_id, e.target.value)
                        }
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#F14B27]/30 focus:border-[#F14B27]"
                      />
                    </div>

                    {/* Notes */}
                    <div className="mb-2">
                      <label className="text-[10px] text-gray-400 mb-1 block">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) =>
                          updateNotes(item.product.product_id, e.target.value)
                        }
                        placeholder="Optional note..."
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#F14B27]/30 focus:border-[#F14B27]"
                      />
                    </div>

                    {/* Quantity + Subtotal */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.product_id,
                              item.quantity - 1,
                            )
                          }
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3 text-gray-500" />
                        </button>
                        <span className="text-xs font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.product_id,
                              item.quantity + 1,
                            )
                          }
                          disabled={
                            item.quantity >= item.product.stock_quantity
                          }
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-[#F14B27]">
                        {formatIDR(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
            {/* Payment Method */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                Payment Method
              </label>
              <DefaultDropdown
                fullWidth
                value={paymentMethod}
                onChange={(val) =>
                  setPaymentMethod(val as typeof paymentMethod)
                }
                options={[
                  { label: "Qris", value: "qris" },
                  { label: "Card", value: "card" },
                  { label: "Cash", value: "cash" },
                  { label: "Transfer", value: "transfer" },
                ]}
              />
            </div>

            {/* Order Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                Order Notes
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F14B27]/30 focus:border-[#F14B27] resize-none"
              />
            </div>

            {/* Total */}
            <div className="bg-[#FFF1ED] rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Total</span>
              <span className="text-base font-bold text-[#F14B27] text-xs">
                {formatIDR(totalAmount)}
              </span>
            </div>

            {/* Checkout Button */}
            <DefaultButton
              variant="primary"
              handleClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
            >
              {isCheckingOut
                ? "Processing..."
                : `Checkout · ${formatIDR(totalAmount)}`}
            </DefaultButton>
          </div>
        </div>
      </div>
      {/* Confirm Print Dialog */}
      <ConfirmDialog
        open={printConfirmOpen}
        onOpenChange={(open) => {
          setPrintConfirmOpen(open);

          if (!open) {
            setPendingReceipt(null);
          }
        }}
        title="Print receipt?"
        description="Do you want to print the receipt for this transaction?"
        confirmLabel="Print"
        cancelLabel="Cancel"
        variant="primary"
        icon={<Printer className="w-5 h-5 text-[#F14B27]" />}
        onConfirm={async () => {
          if (!pendingReceipt) return;

          await handlePrintReceipt(
            pendingReceipt.transaction,
            pendingReceipt.items,
          );

          setPrintConfirmOpen(false);
          setPendingReceipt(null);
        }}
        isLoading={isPrinting}
        loadingLabel="Printing..."
      />
    </>
  );
};

export default PointOfSale;
