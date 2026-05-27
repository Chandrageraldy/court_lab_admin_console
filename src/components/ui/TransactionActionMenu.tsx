import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { MoreVertical, Eye, Ban, Printer } from "lucide-react";

import type { Transaction } from "../../types/Transaction";

const TransactionActionMenu = ({
  transaction,
  handleVoid,
  handleView,
  handlePrint,
}: {
  transaction: Transaction;
  handleVoid: (transaction: Transaction) => void;
  handleView: (transaction: Transaction) => void;
  handlePrint: (transaction: Transaction) => void;
}) => {
  const [open, setOpen] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate position based on button location
  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 176,
      });
    }

    setOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-center">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="p-1.5 rounded hover:bg-gray-100"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
            className="fixed z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm"
          >
            <button
              onClick={() => {
                handleView(transaction);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
            >
              <Eye className="w-4 h-4 text-blue-500" />
              View Details
            </button>

            <button
              onClick={() => {
                handlePrint(transaction);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
            >
              <Printer className="w-4 h-4 text-purple-500" />
              Print Receipt
            </button>

            {!transaction.is_voided && (
              <>
                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={() => {
                    handleVoid(transaction);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600"
                >
                  <Ban className="w-4 h-4" />
                  Void
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default TransactionActionMenu;
