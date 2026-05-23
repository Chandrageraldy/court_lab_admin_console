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

const Products = () => {
  // ===== Loading States =====
  const [isLoading, setIsLoading] = useState(false);

  // ===== Search & Filter States =====
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("");

  // ===== Table States =====
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // ===== Data States =====
  const [products, setProducts] = useState<Product[]>([]);

  // ===== Service Hooks =====
  const productService = useProductService();

  // ===== Data Fetching =====
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts();
      setProducts(response);
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

  // ===== Action Handler =====
  const handleSearch = () => {
    setGlobalFilter(searchText);
    table.setGlobalFilter(String(searchText));
  };

  const handleEdit = (product: Product) => {
    console.log("Edit product:", product);
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
    onSortingChange: setSorting, // Update sorting
    onRowSelectionChange: setRowSelection, // Update selection
    onGlobalFilterChange: setGlobalFilter, // Update search
    onColumnFiltersChange: setColumnFilters, // Update column filter
    getCoreRowModel: getCoreRowModel(), // Rendering Purpose
    getPaginationRowModel: getPaginationRowModel(), // Paging Purpose
    getSortedRowModel: getSortedRowModel(), // Sorting Purpose
    getFilteredRowModel: getFilteredRowModel(), // Column and Global Filtering Purpose
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

  // Calculate low stock and out of stock counts for stats cards
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
    sorting.length > 0;

  const handleResetFilters = () => {
    setSelectedCategoryFilter("");
    setSelectedBrandFilter("");
    setSearchText("");
    setGlobalFilter("");
    setSorting([]);
    table.resetColumnFilters();
    table.setGlobalFilter("");
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-[#d93f1d]/30 border-t-[#d93f1d] animate-spin" />
            <span className="text-sm text-slate-400 tracking-wide">
              Loading…
            </span>
          </div>
        </div>
      ) : (
        <div className="">
          {/* ── Page Header ─────────────────────────────── */}
          <div className="flex items-start justify-between mb-8">
            {/* Left Side - Header Title */}
            <div>
              <h2 className="text-2xl font-bold">Products</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your product catalogue and stock levels
              </p>
            </div>
            {/* Right Side - Action Buttons */}
            <div className="flex gap-3">
              {/* Add Product Button */}
              <DefaultButton variant="primary" handleClick={() => {}}>
                <Plus className="h-4 w-4" />
                Add Product
              </DefaultButton>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-3">
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

          {/* ── Page Content ────────────────────────────── */}
          <div className="p-5 bg-white rounded-lg shadow">
            <div className="flex items-start justify-between mb-5">
              {/* Left Side - Search Field & Selected Row Count + Bulk Action */}
              <div className="flex items-center gap-3">
                {/* Search Field */}
                <DefaultSearchField
                  searchValue={searchText}
                  setSearchValue={setSearchText}
                  handleSearch={handleSearch}
                />
                {/* Selected Row Count + Bulk Delete */}
                {selectedRowCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#FFF1ED] text-[#F14B27] whitespace-nowrap">
                      {selectedRowCount} Selected
                    </div>
                    <DefaultButton
                      variant="danger"
                      handleClick={handleBulkDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </DefaultButton>
                  </div>
                )}
              </div>
              {/* Right Side - Filters */}
              <div className="flex gap-3">
                {/* Category Filter */}
                <DefaultDropdown
                  value={selectedCategoryFilter}
                  onChange={(value) => {
                    setSelectedCategoryFilter(value);

                    // If value == "" (All Categories) => undefined, or else set to value
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
                    ).map((name) => ({
                      label: name,
                      value: name,
                    })),
                  ]}
                />
                {/* Brand Filter */}
                <DefaultDropdown
                  value={selectedBrandFilter}
                  onChange={(value) => {
                    setSelectedBrandFilter(value);

                    // If value == "" (All Brands) => undefined, or else set to value
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
                    ).map((name) => ({
                      label: name,
                      value: name,
                    })),
                  ]}
                />
                {hasActiveFilters && (
                  <DefaultButton
                    variant="ghost"
                    handleClick={handleResetFilters}
                  >
                    <X className="w-3 h-3" />
                    Reset Filters
                  </DefaultButton>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className=" rounded-lg overflow-hidden">
                {/* Table */}
                <table className="min-w-full bg-white">
                  {/* Table Header */}
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
                  {/* Table Body */}
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
      )}
    </>
  );
};

export default Products;
