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

import type React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  handleClick: () => void;
  variant: 'primary' | 'secondary';
  disabled?: boolean;
}

const DefaultButton = ({
  children,
  handleClick,
  variant = 'primary',
  disabled = false,
}: ButtonProps) => {
  const baseStyle = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition';

  const styles = {
    primary:   'bg-[#353ee1] text-white hover:bg-[#2c33b5]',    // ✏️ Brand color
    secondary: 'bg-white text-black border border-gray-300 hover:bg-gray-100',
    disabled:  'bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300',
  };

  const appliedStyle = disabled ? styles.disabled : styles[variant];

  return (
    <button onClick={handleClick} className={`${baseStyle} ${appliedStyle}`} disabled={disabled}>
      {children}
    </button>
  );
};

export default DefaultButton;
