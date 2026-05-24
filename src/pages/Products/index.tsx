import React, { useEffect, useState } from "react";
import DefaultButton from "../../components/ui/DefaultButton";
import {
  AlertTriangle,
  Package,
  PackageX,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import DefaultSearchField from "../../components/ui/DefaultSearchField";
import { createProductColumns } from "./columns";
import type { Product } from "../../types/Product";
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
import DefaultDropdown from "../../components/ui/DefaultDropdown";
import { useProductService } from "../../hooks/useProductService";
import DefaultPaginator from "../../components/ui/DefaultPaginator";
import StatsCard from "../../components/ui/StatsCard";
import { useNavigate } from "react-router";
import { useSnackbar } from "../../context/SnackbarContext";

const Products = () => {
  const navigate = useNavigate();

  // ===== Loading States =====
  const [isLoading, setIsLoading] = useState(false);

  // ===== Search & Filter States =====
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    "all" | "low_stock" | "out_of_stock"
  >("all");

  // ===== Table States =====
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // ===== Data States =====
  const [products, setProducts] = useState<Product[]>([]);

  // ===== Service Hooks =====
  const productService = useProductService();

  // ===== Snackbar =====
  const { showSnackbar } = useSnackbar();

  // ===== Data Fetching =====
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts();
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
      showSnackbar("Unable to load products. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Lifecycle =====
  useEffect(() => {
    fetchProducts();
  }, []);

  // ===== Action Handlers =====
  const handleSearch = () => {
    setGlobalFilter(searchText);
    table.setGlobalFilter(String(searchText));
  };

  const handleAdd = () => {
    navigate("/products/add");
  };

  const handleEdit = (product: Product) => {
    navigate(`/products/edit/${product.product_id}`);
  };

  const handleDelete = async (id: number) => {
    console.log("Delete product with ID:", id);
  };

  const handleAdjustStock = (product: Product) => {
    console.log("Adjust stock for product:", product);
  };

  const handleBulkDelete = async () => {};

  // ===== Table Columns =====
  const columns = React.useMemo(
    () => createProductColumns(handleEdit, handleDelete, handleAdjustStock),
    [],
  );

  const table = useReactTable({
    data: products,
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

  const selectedRowCount = table.getSelectedRowModel().rows.length;

  // ===== Derived Stats =====
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold,
  ).length;
  const outOfStockProducts = products.filter(
    (p) => p.stock_quantity === 0,
  ).length;

  // ===== Reset Filters =====
  const hasActiveFilters =
    selectedCategoryFilter !== "" ||
    selectedBrandFilter !== "" ||
    searchText !== "" ||
    sorting.length > 0 ||
    selectedStatusFilter !== "all";

  const handleResetFilters = () => {
    setSelectedCategoryFilter("");
    setSelectedBrandFilter("");
    setSearchText("");
    setGlobalFilter("");
    setSorting([]);
    setSelectedStatusFilter("all");
    table.resetColumnFilters();
    table.setGlobalFilter("");
  };

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
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product catalogue and stock levels
            </p>
          </div>
          <DefaultButton variant="primary" handleClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Product
          </DefaultButton>
        </div>

        {/* ── Stats Cards ──────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatsCard
            title="Total Products"
            stat={products.length}
            icon={Package}
            variant="blue"
          />
          <StatsCard
            title="Low Stock"
            stat={lowStockProducts}
            icon={AlertTriangle}
            variant="yellow"
          />
          <StatsCard
            title="Out of Stock"
            stat={outOfStockProducts}
            icon={PackageX}
            variant="red"
          />
        </div>

        {/* ── Filters Section ──────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          {/* Left - Status Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
            {[
              { label: "All", value: "all" },
              { label: "Low Stock", value: "low_stock" },
              { label: "Out of Stock", value: "out_of_stock" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedStatusFilter(
                    option.value as typeof selectedStatusFilter,
                  );
                  table
                    .getColumn("stock_quantity")
                    ?.setFilterValue(
                      option.value === "all" ? undefined : option.value,
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
              value={selectedCategoryFilter}
              onChange={(value) => {
                setSelectedCategoryFilter(value);
                table
                  .getColumn("category")
                  ?.setFilterValue(value === "" ? undefined : value);
              }}
              options={[
                { label: "All Categories", value: "" },
                ...Array.from(
                  new Set(
                    products
                      .map((m) => m.category?.name)
                      .filter((name): name is string => !!name),
                  ),
                ).map((name) => ({ label: name, value: name })),
              ]}
            />
            <DefaultDropdown
              value={selectedBrandFilter}
              onChange={(value) => {
                setSelectedBrandFilter(value);
                table
                  .getColumn("brand")
                  ?.setFilterValue(value === "" ? undefined : value);
              }}
              options={[
                { label: "All Brands", value: "" },
                ...Array.from(
                  new Set(
                    products
                      .map((m) => m.brand?.name)
                      .filter((name): name is string => !!name),
                  ),
                ).map((name) => ({ label: name, value: name })),
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
        <div className="p-5 bg-white rounded-lg shadow">
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
            <DefaultButton variant="ghost" handleClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4" />
              Delete
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

export default Products;
