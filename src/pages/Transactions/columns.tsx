import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CreditCard,
  Landmark,
  ScanQrCode,
  Wallet,
} from "lucide-react";

import type { Transaction } from "../../types/Transaction";

import Checkbox from "../../components/ui/Checkbox";
import Badge from "../../components/ui/Badge";

import { formatIDR } from "../../utils/Helpers";
import TransactionActionMenu from "../../components/ui/TransactionActionMenu";

const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
  if (sorted === "asc") return <ArrowUp className="w-3 h-3" />;

  if (sorted === "desc") return <ArrowDown className="w-3 h-3" />;

  return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
};

export const createTransactionColumns = (
  handleVoid: (transaction: Transaction) => void,
  handleView: (transaction: Transaction) => void,
  handlePrint: (transaction: Transaction) => void,
): ColumnDef<Transaction>[] => [
  {
    id: "transaction_id",
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

        <span>Transaction ID</span>
      </div>
    ),

    cell: ({ row }) => (
      <div
        className="flex items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(value)}
          aria-label="Select row"
          className="rounded w-4 h-4"
        />

        <div className="flex flex-col">
          <span className="font-bold">#TXN-{row.original.transaction_id}</span>
        </div>
      </div>
    ),

    size: 180,
  },

  {
    accessorKey: "payment_method",

    header: "Payment Method",

    cell: ({ row }) => {
      const paymentMethod = row.original.payment_method;

      const paymentStyles = {
        cash: {
          container: "bg-green-50",
          iconBg: "bg-green-100",
          text: "text-green-700",
          icon: Wallet,
        },
        card: {
          container: "bg-blue-50",
          iconBg: "bg-blue-100",
          text: "text-blue-700",
          icon: CreditCard,
        },
        transfer: {
          container: "bg-purple-50",
          iconBg: "bg-purple-100",
          text: "text-purple-700",
          icon: Landmark,
        },
        qris: {
          container: "bg-orange-50",
          iconBg: "bg-orange-100",
          text: "text-orange-700",
          icon: ScanQrCode,
        },
      };

      const style = paymentStyles[paymentMethod];

      const Icon = style.icon;

      return (
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.container}`}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center ${style.iconBg}`}
            >
              <Icon className={`w-3.5 h-3.5 ${style.text}`} />
            </div>
          </div>

          <span className={`text-xs font-semibold capitalize ${style.text}`}>
            {paymentMethod}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "total_amount",

    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-900"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Amount
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),

    cell: ({ row }) => (
      <span className="font-semibold text-[#F14B27]">
        {formatIDR(row.original.total_amount)}
      </span>
    ),
  },

  {
    accessorKey: "created_at",

    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-gray-900"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),

    cell: ({ row }) => {
      const date = new Date(row.original.created_at);

      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {date.toLocaleDateString("id-ID")}
          </span>

          <span className="text-xs text-gray-400">
            {date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "is_voided",

    filterFn: (row, _columnId, filterValue) => {
      if (filterValue === undefined) return true;

      return row.original.is_voided === filterValue;
    },

    header: "Status",

    cell: ({ row }) => {
      const isVoided = row.original.is_voided;

      return isVoided ? (
        <Badge label="Voided" variant="red" />
      ) : (
        <Badge label="Completed" variant="green" />
      );
    },
  },

  {
    id: "action",

    header: () => <div className="flex justify-center"></div>,

    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <TransactionActionMenu
          transaction={row.original}
          handleVoid={handleVoid}
          handleView={handleView}
          handlePrint={handlePrint}
        />
      </div>
    ),

    size: 100,
  },
];
