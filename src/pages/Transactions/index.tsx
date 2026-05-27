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

const Transactions = () => {
  // ===== Loading States =====
  const [isLoading, setIsLoading] = useState(false);

  // ===== Search & Filter States =====
  const [searchText, setSearchText] = useState("");
  const [selectedPaymentMethodFilter, setSelectedPaymentMethodFilter] =
    useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    "all" | "completed" | "voided"
  >("all");

  // ===== Table States =====
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // ===== Data States =====
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // ===== Service Hooks =====
  const transactionService = useTransactionService();

  // ===== Dialog States =====

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

  const handleView = () => {};

  const handleVoid = () => {};

  const handlePrint = () => {};

  const handleBulkVoid = () => {};

  // ===== Table Columns =====
  const columns = React.useMemo(
    () => createTransactionColumns(handleVoid, handleView, handlePrint),
    [],
  );

  const table = useReactTable({
    data: transactions,
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
    selectedStatusFilter !== "all";

  const handleResetFilters = () => {
    setSelectedPaymentMethodFilter("");
    setSelectedStatusFilter("all");
    setSearchText("");
    setGlobalFilter("");
    setSorting([]);

    table.resetColumnFilters();
    table.setGlobalFilter("");
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
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedStatusFilter === option.value
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
                      className={`border-b border-gray-200 last:border-b-0 ${
                        row.getIsSelected()
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
            <DefaultButton variant="danger" handleClick={handleBulkVoid}>
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
    </>
  );
};

export default Transactions;
