// ─────────────────────────────────────────────────────────
// DefaultButton — Reusable Button Component
//
// ✏️ VARIANTS:
//   primary   → filled brand-color button (default action)
//   secondary → white/outlined button (cancel / secondary action)
//
// ✏️ USAGE:
//   <DefaultButton variant="primary" handleClick={myFn}>
//     Save
//   </DefaultButton>
//
// ✏️ TO CHANGE BRAND COLOR:
//   Update the hex values in the `styles` object below.
//   Primary color is currently #353ee1 (indigo).
// ─────────────────────────────────────────────────────────

import type React from "react";

interface ButtonProps {
  children: React.ReactNode;
  handleClick: () => void;
  variant: "primary" | "secondary" | "danger" | "success" | "ghost";
  disabled?: boolean;
}

const DefaultButton = ({
  children,
  handleClick,
  variant = "primary",
  disabled = false,
}: ButtonProps) => {
  const baseStyle =
    "flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition";

  const styles = {
    primary: "bg-[#F14B27] text-white hover:bg-[#d93f1d]",
    secondary: "bg-white text-black border border-gray-300 hover:bg-gray-100",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    success:
      "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
    disabled: "bg-gray-100 text-gray-600 cursor-not-allowed",
    ghost: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  };

  const appliedStyle = disabled ? styles.disabled : styles[variant];

  return (
    <button
      onClick={handleClick}
      className={`${baseStyle} ${appliedStyle}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default DefaultButton;
