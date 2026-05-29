import { useEffect, useState } from "react";
import {
  Package,
  PackageX,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  ReceiptText,
  Ban,
} from "lucide-react";
import { useProductService } from "../../hooks/useProductService";
import { useTransactionService } from "../../hooks/useTransactionService";
import type { Product } from "../../types/Product";
import type { Transaction } from "../../types/Transaction";
import StatsCard from "../../components/ui/StatsCard";
import Badge from "../../components/ui/Badge";
import { formatIDR } from "../../utils/Helpers";
import { useSnackbar } from "../../context/SnackbarContext";
import TransactionDetailDialog from "../Transactions/TransactionDetailDialog";
import { pdf } from "@react-pdf/renderer";
import Receipt from "../../components/ui/Receipt";
import AdjustStockDialog from "../Products/AdjustStockDialog";

type Period = "daily" | "weekly" | "monthly";

const Dashboard = () => {
  // ===== Loading States =====
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // ===== Data States =====
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<Period>("monthly");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionItems, setTransactionItems] = useState<any[]>([]);
  const [adjustStockProduct, setAdjustStockProduct] = useState<Product | null>(null);
  const [allTransactionItems, setAllTransactionItems] = useState<any[]>([]);

  // ===== Category & Brand Breakdown =====
  type BreakdownView = "category" | "brand";
  const [breakdownView, setBreakdownView] = useState<BreakdownView>("category");

  // ===== Service Hooks =====
  const productService = useProductService();
  const transactionService = useTransactionService();

  // ===== Snackbar =====
  const { showSnackbar } = useSnackbar();

  // ===== Dialog States =====
  const [detailOpen, setDetailOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);

  // ===== Data Fetching =====
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, transactionsRes] = await Promise.all([
        productService.getProducts(),
        transactionService.getTransactions(),
      ]);
      setProducts(productsRes);
      setTransactions(transactionsRes);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showSnackbar("Unable to load dashboard data. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTransactionItems = async () => {
    try {
      const itemPromises = completedTransactions.map((t) =>
        transactionService.getTransactionItems(t.transaction_id),
      );
      const results = await Promise.all(itemPromises);
      setAllTransactionItems(results.flat());
    } catch (error) {
      console.error("Error fetching transaction items:", error);
    }
  };

  // ===== Lifecycle =====
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (completedTransactions.length > 0) {
      fetchAllTransactionItems();
    }
  }, [transactions]);

  // ===== Action Handlers =====
  const handleViewTransaction = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailOpen(true);
    setIsLoadingItems(true);
    try {
      const items = await transactionService.getTransactionItems(transaction.transaction_id);
      setTransactionItems(items);
    } catch (error) {
      console.error("Error fetching transaction items:", error);
      showSnackbar("Unable to load transaction details.", "error");
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handlePrint = async (transaction: Transaction) => {
    setIsLoadingItems(true);
    try {
      const items = await transactionService.getTransactionItems(transaction.transaction_id);
      const blob = await pdf(
        <Receipt
          transactionId={transaction.transaction_id}
          items={items.map((i: any) => ({ ...i, product_id: i.product_id }))}
          totalAmount={transaction.total_amount}
          paymentMethod={transaction.payment_method}
          notes={transaction.notes ?? undefined}
          createdAt={transaction.created_at}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error printing receipt:", error);
      showSnackbar("Unable to print receipt. Please try again.", "error");
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleAdjustStock = (product: Product) => {
    setAdjustStockProduct(product);
    setIsAdjustStockOpen(true);
  };

  const handleConfirmAdjustStock = async (product: Product, newQuantity: number) => {
    if (newQuantity === product.stock_quantity) {
      setIsAdjustStockOpen(false);
      return;
    }
    try {
      await productService.updateProduct(product.product_id, { stock_quantity: newQuantity });
      setIsAdjustStockOpen(false);
      fetchData();
      showSnackbar("Stock adjusted successfully.", "success");
    } catch (error) {
      console.error("Error adjusting stock:", error);
      showSnackbar("Unable to adjust stock. Please try again.", "error");
    }
  };

  // ===== Derived Data =====
  const completedTransactions = transactions.filter((t) => !t.is_voided);
  const voidedTransactions = transactions.filter((t) => t.is_voided);

  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  const avgOrderValue = completedTransactions.length > 0 ? totalRevenue / completedTransactions.length : 0;

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold,
  );
  const outOfStockProducts = products.filter((p) => p.stock_quantity === 0);

  const getCategoryBreakdown = () => {
    const map: Record<string, { revenue: number; units: number }> = {};
    allTransactionItems.forEach((item) => {
      const product = products.find((p) => p.product_id === item.product_id);
      const key = !product?.category && !product?.brand ? "Service" : (product?.brand?.name ?? "Unknown");
      if (!map[key]) map[key] = { revenue: 0, units: 0 };
      map[key].revenue += item.subtotal;
      map[key].units += item.quantity;
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const getBrandBreakdown = () => {
    const map: Record<string, { revenue: number; units: number }> = {};
    allTransactionItems.forEach((item) => {
      const product = products.find((p) => p.product_id === item.product_id);
      const key = !product?.category && !product?.brand ? "Service" : (product?.brand?.name ?? "Unknown");
      if (!map[key]) map[key] = { revenue: 0, units: 0 };
      map[key].revenue += item.subtotal;
      map[key].units += item.quantity;
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const breakdownData = breakdownView === "category" ? getCategoryBreakdown() : getBrandBreakdown();
  const breakdownMax = Math.max(...breakdownData.map((d) => d.revenue), 1);

  // ===== Period Filtering =====
  const now = new Date();
  const getFilteredTransactions = () => {
    return completedTransactions.filter((t) => {
      const date = new Date(t.created_at);
      if (period === "daily") {
        return date.toDateString() === now.toDateString();
      } else if (period === "weekly") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      } else {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
    });
  };

  const periodTransactions = getFilteredTransactions();
  const periodRevenue = periodTransactions.reduce((sum, t) => sum + t.total_amount, 0);

  // ===== Revenue Chart Data =====
  const getChartData = () => {
    if (period === "daily") {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        value: periodTransactions
          .filter((t) => new Date(t.created_at).getHours() === i)
          .reduce((sum, t) => sum + t.total_amount, 0),
      }));
    } else if (period === "weekly") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map((day, i) => {
        const jsDay = i === 6 ? 0 : i + 1;
        return {
          label: day,
          value: periodTransactions
            .filter((t) => new Date(t.created_at).getDay() === jsDay)
            .reduce((sum, t) => sum + t.total_amount, 0),
        };
      });
    } else {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => ({
        label: `${i + 1}`,
        value: periodTransactions
          .filter((t) => new Date(t.created_at).getDate() === i + 1)
          .reduce((sum, t) => sum + t.total_amount, 0),
      }));
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  // ===== Payment Method Breakdown =====
  const paymentBreakdown = ["cash", "card", "transfer", "qris"]
    .map((method) => {
      const methodTransactions = completedTransactions.filter((t) => t.payment_method === method);
      const total = methodTransactions.reduce((sum, t) => sum + t.total_amount, 0);
      return { method, total, count: methodTransactions.length };
    })
    .filter((p) => p.count > 0);

  const paymentTotal = paymentBreakdown.reduce((sum, p) => sum + p.total, 0);

  const paymentColors: Record<string, string> = {
    cash: "bg-green-400",
    card: "bg-blue-400",
    transfer: "bg-purple-400",
    qris: "bg-orange-400",
  };

  const paymentTextColors: Record<string, string> = {
    cash: "text-green-700",
    card: "text-blue-700",
    transfer: "text-purple-700",
    qris: "text-orange-700",
  };

  // ===== Recent Transactions =====
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#d93f1d]/30 border-t-[#d93f1d] animate-spin" />
          <span className="text-sm text-slate-400 tracking-wide">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* ── Page Header ─────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor sales, inventory, and business performance at a glance
          </p>
        </div>

        {/* ── Stats Cards ──────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          <StatsCard title="Total Revenue" stat={formatIDR(totalRevenue)} icon={TrendingUp} variant="orange" />
          <StatsCard title="Completed Orders" stat={completedTransactions.length} icon={ReceiptText} variant="blue" />
          <StatsCard title="Avg Order Value" stat={formatIDR(avgOrderValue)} icon={ShoppingCart} variant="green" />
          <StatsCard title="Voided Orders" stat={voidedTransactions.length} icon={Ban} variant="red" />
        </div>

        {/* ── Revenue Chart (full width) ───────────────── */}
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatIDR(periodRevenue)} revenue for{" "}
                {period === "daily" ? "today" : period === "weekly" ? "this week" : "this month"}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
              {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${period === p ? "bg-[#F14B27] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1 h-40">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex flex-col justify-end h-32 relative">
                  <div
                    className="w-full bg-[#F14B27]/20 hover:bg-[#F14B27]/40 rounded-t transition-all relative group"
                    style={{ height: `${(d.value / maxValue) * 100}%`, minHeight: d.value > 0 ? "4px" : "0" }}
                  >
                    {d.value > 0 && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {formatIDR(d.value)}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Payment Methods + Category/Brand Performance ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Payment Breakdown */}
          <div className="bg-white rounded-lg shadow p-3">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Payment Methods</h3>
            <p className="text-xs text-gray-400 mb-5">Revenue by payment type</p>
            {paymentBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-300 text-xs">
                No transactions yet
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {paymentBreakdown.map((p) => (
                  <div key={p.method}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold capitalize ${paymentTextColors[p.method]}`}>
                        {p.method}
                      </span>
                      <span className="text-xs text-gray-500">
                        {paymentTotal > 0 ? Math.round((p.total / paymentTotal) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${paymentColors[p.method]}`}
                        style={{ width: `${paymentTotal > 0 ? (p.total / paymentTotal) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatIDR(p.total)} · {p.count} orders
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category & Brand Breakdown */}
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {breakdownView === "category" ? "Category" : "Brand"} Performance
                </h3>
                <p className="text-xs text-gray-400">Revenue and units sold by {breakdownView}</p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                {(["category", "brand"] as BreakdownView[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setBreakdownView(v)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${breakdownView === v ? "bg-[#F14B27] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {breakdownData.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-gray-300 text-xs">No data yet</div>
            ) : (
              <div className="flex flex-col gap-3">
                {breakdownData.map((d) => (
                  <div key={d.name} className="flex items-center gap-4">
                    <div className="w-24 shrink-0">
                      <p className="text-xs font-semibold text-gray-700 truncate capitalize">{d.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {d.name === "Service" ? `${d.units} sessions` : `${d.units} units`}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-[#F14B27]/70 transition-all"
                          style={{ width: `${(d.revenue / breakdownMax) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-28 text-right shrink-0">
                        {formatIDR(d.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Inventory Alerts + Recent Transactions ─── */}
        <div className="grid grid-cols-3 gap-4 items-stretch h-[320px]">
          {/* Inventory Alerts */}
          <div className="bg-white rounded-lg shadow p-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Inventory Alerts</h3>
              <div className="flex items-center gap-1.5">
                {outOfStockProducts.length > 0 && (
                  <Badge label={`${outOfStockProducts.length} out of stock`} variant="red" />
                )}
                {lowStockProducts.length > 0 && (
                  <Badge label={`${lowStockProducts.length} low stock`} variant="yellow" />
                )}
              </div>
            </div>
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-300 gap-1">
                <Package className="w-6 h-6" />
                <p className="text-xs">All stock levels healthy</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-1">
                {outOfStockProducts.map((p) => (
                  <button
                    key={p.product_id}
                    onClick={() => handleAdjustStock(p)}
                    className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg shrink-0 hover:bg-red-100 transition-colors text-left w-full"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <PackageX className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="text-xs font-medium text-gray-800 capitalize truncate">{p.name}</span>
                    </div>
                    <Badge label="Out of Stock" variant="red" />
                  </button>
                ))}
                {lowStockProducts.map((p) => (
                  <button
                    key={p.product_id}
                    onClick={() => handleAdjustStock(p)}
                    className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-lg shrink-0 hover:bg-yellow-100 transition-colors text-left w-full"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      <span className="text-xs font-medium text-gray-800 capitalize truncate">{p.name}</span>
                    </div>
                    <Badge label="Low Stock" variant="yellow" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="col-span-2 bg-white rounded-lg shadow p-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Recent Transactions</h3>
              <span className="text-xs text-gray-400">Last {recentTransactions.length} orders</span>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-300 gap-1">
                <ReceiptText className="w-6 h-6" />
                <p className="text-xs">No transactions yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0">
                {recentTransactions.map((t) => {
                  const date = new Date(t.created_at);
                  return (
                    <div
                      key={t.transaction_id}
                      onClick={() => handleViewTransaction(t)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF1ED] flex items-center justify-center shrink-0">
                          <ReceiptText className="w-3.5 h-3.5 text-[#F14B27]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">#TXN-{t.transaction_id}</p>
                          <p className="text-[10px] text-gray-400">
                            {date.toLocaleDateString("id-ID")} ·{" "}
                            {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold capitalize text-gray-500">{t.payment_method}</span>
                        <span className="text-xs font-bold text-gray-900">{formatIDR(t.total_amount)}</span>
                        {t.is_voided ? (
                          <Badge label="Voided" variant="red" />
                        ) : (
                          <Badge label="Completed" variant="green" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <TransactionDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        transaction={selectedTransaction}
        items={transactionItems}
        isLoading={isLoadingItems}
        onPrint={handlePrint}
      />
      {/* Adjust Stock Dialog */}
      <AdjustStockDialog
        product={adjustStockProduct}
        open={isAdjustStockOpen}
        onOpenChange={setIsAdjustStockOpen}
        onConfirm={handleConfirmAdjustStock}
      />
    </>
  );
};

export default Dashboard;