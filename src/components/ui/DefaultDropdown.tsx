// ─────────────────────────────────────────────────────────
// DefaultDropdown — Reusable Select / Dropdown Component
//
// ✏️ PROPS:
//   value    → currently selected value string
//   options  → array of { label: string; value: string }
//   onChange → callback with the new selected value
//   disabled → grays out and disables the select
//   error    → shows a red border + error message below
//   maxWidth → optional CSS max-width string (e.g. "200px")
//
// ✏️ USAGE:
//   <DefaultDropdown
//     value={status}
//     options={[
//       { label: 'Active',   value: 'active'   },
//       { label: 'Inactive', value: 'inactive' },
//     ]}
//     onChange={(val) => setStatus(val)}
//   />
// ─────────────────────────────────────────────────────────

import { AlertCircle, ChevronDown } from 'lucide-react';

interface DropdownProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  maxWidth?: string;
}

const DefaultDropdown = ({
  value,
  options,
  onChange,
  disabled = false,
  error,
  maxWidth,
}: DropdownProps) => {
  const baseStyle =
    'flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium transition border appearance-none pr-10';

  const getDropdownStyle = () => {
    if (disabled)
      return 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed';
    if (error)
      return 'bg-white text-black border-red-500 focus:border-red-500 focus:ring-red-200';
    return 'bg-white text-black border-gray-300 hover:bg-gray-100 cursor-pointer focus:border-blue-500 focus:ring-blue-200';
  };

  return (
    <div className="w-full" style={maxWidth ? { maxWidth } : undefined}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${baseStyle} ${getDropdownStyle()} w-full`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron icon (native select arrow is hidden via appearance-none) */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Inline error message */}
      {error && (
        <div className="mt-2 flex items-center gap-1 text-red-500 text-xs leading-none">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DefaultDropdown;
