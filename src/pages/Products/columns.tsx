import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "../../types/Product";
import Checkbox from "../../components/ui/Checkbox";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { formatIDR, truncate } from "../../utils/Helpers";
import Badge from "../../components/ui/Badge";
import ActionMenu from "../../components/ui/ActionMenu";

const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
  if (sorted === "asc") return <ArrowUp className="w-3 h-3" />;
  if (sorted === "desc") return <ArrowDown className="w-3 h-3" />;
  return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
};

export const createProductColumns = (
  handleEdit: (product: Product) => void,
  handleDelete: (id: number) => void,
  handleAdjustStock: (product: Product) => void,
): ColumnDef<Product>[] => [
  {
    id: "product",
    header: ({ table }) => (
      <div className="flex items-center gap-5">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          isIndeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(value)
          }
          aria-label="Select all"
          className="rounded bg-white w-4 h-4 border-0"
        />
        <span>Product Name</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-5">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(value)}
          aria-label="Select row"
          className="rounded w-4 h-4"
        />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {row.original.image_url ? (
              <img
                src={row.original.image_url}
                alt={row.original.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                N/A
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold capitalize">{row.original.name}</span>
            <span className="text-xs text-gray-400">
              {truncate(row.original.description, 40) || "—"}
            </span>
          </div>
        </div>
      </div>
    ),
    size: 200,
  },
  {
    id: "brand",
    accessorFn: (row) => row.brand?.name,
    header: "Brand",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? <Badge label={value} variant="blue" /> : <span>-</span>;
    },
  },
  {
    id: "category",
    accessorFn: (row) => row.category?.name,
    header: "Category",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? <Badge label={value} variant="gray" /> : <span>-</span>;
    },
  },
  {
    accessorKey: "stock_quantity",
    filterFn: (row, _columnId, filterValue) => {
      const qty = row.original.stock_quantity;
      const threshold = row.original.low_stock_threshold;
      if (filterValue === "out_of_stock") return qty === 0;
      if (filterValue === "low_stock") return qty > 0 && qty <= threshold;
      return true;
    },
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-900"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Stock Quantity
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => {
      const { stock_quantity, low_stock_threshold } = row.original;

      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span>{stock_quantity}</span>
            {stock_quantity === 0 ? (
              <Badge label="Out of Stock" variant="red" />
            ) : stock_quantity <= low_stock_threshold ? (
              <Badge label="Low Stock" variant="yellow" />
            ) : null}
          </div>
          <span className="text-xs text-gray-400">
            Threshold: {low_stock_threshold}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "selling_price",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-900"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800">
        {formatIDR(row.getValue<number>("selling_price"))}
      </span>
    ),
  },
  {
    id: "action",
    header: () => <div className="flex justify-center">Actions</div>,
    cell: ({ row }) => (
      <ActionMenu
        product={row.original}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleAdjustStock={handleAdjustStock}
      />
    ),
    size: 100,
  },
];
