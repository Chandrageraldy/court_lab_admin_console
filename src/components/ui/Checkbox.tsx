// ─────────────────────────────────────────────────────────
// Checkbox — Accessible Checkbox with Indeterminate Support
//
// ✏️ PROPS:
//   checked          → boolean checked state
//   isIndeterminate  → shows "−" state (used in select-all rows)
//   onCheckedChange  → callback with the new boolean value
//
// ✏️ USAGE (basic):
//   <Checkbox checked={isSelected} onCheckedChange={(v) => setIsSelected(v)} />
//
// ✏️ USAGE (TanStack Table select-all):
//   <Checkbox
//     checked={table.getIsAllRowsSelected()}
//     isIndeterminate={table.getIsSomeRowsSelected()}
//     onCheckedChange={table.getToggleAllRowsSelectedHandler()}
//   />
//
// ✏️ BRAND COLOR:
//   The checkbox uses accent-[#353ee1]. Change this hex to
//   update the checkmark fill color.
// ─────────────────────────────────────────────────────────

import React, { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked'> {
  checked?: boolean;
  isIndeterminate?: boolean;
  onCheckedChange?: (value: boolean) => void;
  className?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked = false, isIndeterminate = false, onCheckedChange, className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={(el) => {
          if (el) el.indeterminate = isIndeterminate;
          if (!ref) return;
          if (typeof ref === 'function') {
            ref(el);
          } else {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
          }
        }}
        checked={checked}
        className={`w-5 h-5 rounded border border-[#353ee1] accent-[#353ee1] ${className || ''}`}
        {...props}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
