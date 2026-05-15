// ─────────────────────────────────────────────────────────
// DefaultTextField — Reusable Text Input / Textarea
//
// ✏️ PROPS:
//   value       → controlled value (string or number)
//   onChange    → callback with the new string value
//   type        → HTML input type (text, email, password, number…)
//   placeholder → placeholder text
//   disabled    → grays out and disables the field
//   isTextArea  → renders a <textarea> instead of <input>
//   rows        → number of rows when isTextArea is true
//   error       → shows a red border + error message below
//   endIcon     → JSX node rendered inside the right side (e.g. eye icon)
//
// ✏️ USAGE:
//   <DefaultTextField
//     value={name}
//     onChange={(val) => setName(val)}
//     placeholder="Enter name"
//     error={errors.name}
//   />
// ─────────────────────────────────────────────────────────

import { AlertCircle } from 'lucide-react';
import React from 'react';

interface DefaultTextFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
  disabled?: boolean;
  isTextArea?: boolean;
  rows?: number;
  className?: string;
  error?: string;
  endIcon?: React.ReactNode;
}

const DefaultTextField: React.FC<DefaultTextFieldProps> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  min,
  disabled = false,
  isTextArea = false,
  rows = 2,
  className = '',
  error,
  endIcon,
}) => {
  const baseStyle =
    'w-full px-4 py-2 rounded-lg text-sm font-medium transition border appearance-none focus:outline-none focus:ring-2';

  const getInputStyle = () => {
    if (disabled) return 'bg-gray-100 border-gray-300 cursor-not-allowed';
    if (error) return 'bg-white text-black border-red-500 focus:ring-red-200';
    return 'bg-white text-black border-gray-300 focus:ring-blue-200';
  };

  return (
    <div className="w-full relative">
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`${baseStyle} ${getInputStyle()} ${className}`}
        />
      ) : (
        <div className="relative w-full">
          <input
            type={type}
            value={value}
            min={min}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`${baseStyle} ${getInputStyle()} ${endIcon ? 'pr-10' : ''} ${className}`}
          />
          {/* Right-side icon slot (e.g. eye toggle for password fields) */}
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500">
              {endIcon}
            </div>
          )}
        </div>
      )}

      {/* Inline error message */}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-red-500 text-xs leading-none">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DefaultTextField;
