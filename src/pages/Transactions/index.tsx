import React, { useEffect, useState } from "react";
import { createTransactionColumns } from "./columns";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import type { Transaction } from "../../types/Transaction";
import { useSnackbar } from "../../context/SnackbarContext";
import { useTransactionService } from "../../hooks/useTransactionService";
import DefaultPaginator from "../../components/ui/DefaultPaginator";
import DefaultButton from "../../components/ui/DefaultButton";
import { Ban, X } from "lucide-react";
import DefaultSearchField from "../../components/ui/DefaultSearchField";
import DefaultDropdown from "../../components/ui/DefaultDropdown";
import { pdf } from "@react-pdf/renderer";
import Receipt from "../../components/ui/Receipt";
import TransactionDetailDialog from "./TransactionDetailDialog";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DefaultDateRangePicker from "../../components/ui/DefaultDateRangePicker";

const Transactions = () => {
  // ===== Loading States =====
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);

  // ===== Search & Filter States =====
  const [searchText, setSearchText] = useState("");
  const [selectedPaymentMethodFilter, setSelectedPaymentMethodFilter] =
    useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    "all" | "completed" | "voided"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ===== Table States =====
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // ===== Data States =====
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactionItems, setTransactionItems] = useState<any[]>([]);

  // ===== Service Hooks =====
  const transactionService = useTransactionService();

  // ===== Dialog States =====
  const [viewOpen, setViewOpen] = useState(false);
  const [voidConfirmOpen, setVoidConfirmOpen] = useState(false);

  // ===== Snackbar =====
  const { showSnackbar } = useSnackbar();

  // ===== Data Fetching =====
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await transactionService.getTransactions();
      setTransactions(response);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showSnackbar("Unable to load transactions. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Lifecycle =====
  useEffect(() => {
    fetchTransactions();
  }, []);

  // ===== Action Handlers =====
  const handleSearch = () => {
    setGlobalFilter(searchText);
    table.setGlobalFilter(String(searchText));
  };

  const handleView = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewOpen(true);
    setIsLoadingItems(true);
    try {
      const items = await transactionService.getTransactionItems(
        transaction.transaction_id,
      );
      setTransactionItems(items);
    } catch (error) {
      console.error("Error fetching transaction items:", error);
      showSnackbar("Unable to load transaction items.", "error");
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleVoid = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setVoidConfirmOpen(true);
  };

  const handleConfirmVoid = async () => {
    if (!selectedTransaction) return;
    setIsVoiding(true);
    try {
      await transactionService.voidTransaction(
        selectedTransaction.transaction_id,
      );
      setVoidConfirmOpen(false);
      fetchTransactions();
      showSnackbar("Transaction voided successfully.", "success");
    } catch (error) {
      console.error("Error voiding transaction:", error);
      showSnackbar("Unable to void transaction. Please try again.", "error");
    } finally {
      setIsVoiding(false);
    }
  };

  const handlePrint = async (transaction: Transaction) => {
    setIsLoadingItems(true);
    try {
      const items = await transactionService.getTransactionItems(
        transaction.transaction_id,
      );
      const blob = await pdf(
        <Receipt
          transactionId={transaction.transaction_id}
          items={items.map((i: any) => ({
            ...i,
            product_id: i.product_id,
          }))}
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

  const handleBulkVoid = () => { };

  // ===== Date Filtered Transactions =====
  const dateFilteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      if (!startDate && !endDate) return true;

      const date = new Date(t.created_at);
      const start = startDate ? new Date(startDate + "T00:00:00") : null;
      const end = endDate ? new Date(endDate + "T23:59:59") : null;

      if (start && date < start) return false;
      if (end && date > end) return false;

      return true;
    });
  }, [transactions, startDate, endDate]);

  // ===== Table Columns =====
  const columns = React.useMemo(
    () => createTransactionColumns(handleVoid, handleView, handlePrint),
    [],
  );

  const table = useReactTable({
    data: dateFilteredTransactions,
    columns,
    enableMultiSort: false,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // ===== Reset Filters =====
  const hasActiveFilters =
    selectedPaymentMethodFilter !== "" ||
    searchText !== "" ||
    sorting.length > 0 ||
    selectedStatusFilter !== "all" ||
    startDate !== "" ||
    endDate !== "";

  const handleResetFilters = () => {
    setSelectedPaymentMethodFilter("");
    setSelectedStatusFilter("all");
    setSearchText("");
    setGlobalFilter("");
    setSorting([]);
    table.resetColumnFilters();
    table.setGlobalFilter("");
    setStartDate("");
    setEndDate("");
  };

  const selectedRowCount = table.getSelectedRowModel().rows.length;

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
      <div>
        {/* ── Page Header ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all transactions in one place
            </p>
          </div>
        </div>
        {/* ── Filters Section ──────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          {/* Left - Status Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
            {[
              { label: "All", value: "all" },
              { label: "Completed", value: "completed" },
              { label: "Voided", value: "voided" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedStatusFilter(
                    option.value as typeof selectedStatusFilter,
                  );

                  table
                    .getColumn("is_voided")
                    ?.setFilterValue(
                      option.value === "all"
                        ? undefined
                        : option.value === "voided",
                    );
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${selectedStatusFilter === option.value
                  ? "bg-[#F14B27] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {/* Right - Search, Dropdowns, Reset */}
          <div className="flex items-center gap-2">
            <DefaultSearchField
              searchValue={searchText}
              setSearchValue={(value) => {
                setSearchText(value);
                if (value === "") {
                  setGlobalFilter("");
                  table.setGlobalFilter("");
                }
              }}
              handleSearch={handleSearch}
            />

            <DefaultDateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />

            <DefaultDropdown
              value={selectedPaymentMethodFilter}
              onChange={(value) => {
                setSelectedPaymentMethodFilter(value);
                table
                  .getColumn("payment_method")
                  ?.setFilterValue(value === "" ? undefined : value);
              }}
              options={[
                { label: "All Payment Methods", value: "" },

                ...Array.from(
                  new Set(
                    transactions
                      .map((m) => m.payment_method)
                      .filter(
                        (name): name is "cash" | "card" | "transfer" | "qris" =>
                          !!name,
                      ),
                  ),
                ).map((name) => ({
                  label: name.charAt(0).toUpperCase() + name.slice(1),
                  value: name,
                })),
              ]}
            />
            {hasActiveFilters && (
              <DefaultButton variant="ghost" handleClick={handleResetFilters}>
                <X className="w-3 h-3" />
                Reset
              </DefaultButton>
            )}
          </div>
        </div>
        {/* ── Page Content ─────────────────────────────── */}
        <div className="p-2 bg-white rounded-lg shadow">
          {/* Table */}
          <div className="overflow-x-auto">
            <div className="rounded-lg overflow-hidden">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left font-bold text-gray-600 text-[13px]"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => handleView(row.original)}
                      className={`border-b border-gray-200 last:border-b-0 cursor-pointer transition-colors ${row.getIsSelected()
                        ? "bg-[#FFF1ED] hover:bg-[#FFF1ED]/80"
                        : "hover:bg-gray-50"
                        }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 text-sm text-gray-700"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginator */}
          <DefaultPaginator table={table} pageSizeOptions={[10, 20, 50]} />
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedRowCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-4 bg-white text-gray-900 px-5 py-2 rounded-lg shadow-2xl border border-gray-200">
            <span className="text-sm font-medium">
              {selectedRowCount} Selected
            </span>

            <DefaultButton
              variant="danger"
              handleClick={handleBulkVoid}
              disabled={table
                .getSelectedRowModel()
                .rows.some((row) => row.original.is_voided)}
            >
              <Ban className="w-4 h-4" />
              Void
            </DefaultButton>

            <button
              onClick={() => table.resetRowSelection()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* View Dialog */}
      <TransactionDetailDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        transaction={selectedTransaction}
        items={transactionItems}
        isLoading={isLoadingItems}
        onPrint={handlePrint}
      />

      {/* Void Confirm Dialog */}
      <ConfirmDialog
        open={voidConfirmOpen}
        onOpenChange={setVoidConfirmOpen}
        title="Void Transaction"
        description={`This will void #TXN-${selectedTransaction?.transaction_id} and revert all stock. This cannot be undone.`}
        confirmLabel="Void"
        variant="danger"
        icon={<Ban className="w-5 h-5 text-red-500" />}
        onConfirm={handleConfirmVoid}
        isLoading={isVoiding}
      />
    </>
  );
};

export default Transactions;
