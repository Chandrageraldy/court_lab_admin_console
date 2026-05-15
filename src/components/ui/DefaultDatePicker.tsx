// ─────────────────────────────────────────────────────────
// DefaultDatePicker — Styled Date Picker
//
// Wraps react-datepicker with consistent styling that
// matches the rest of the UI components (DefaultTextField,
// DefaultDropdown, etc.).
//
// ✏️ PROPS:
//   selected       → currently selected Date | null
//   onChange       → callback with the new Date | null
//   dateFormat     → display format (default: "yyyy-MM-dd")
//   placeholderText→ placeholder when no date selected
//   disabled       → grays out and disables the picker
//   error          → red border + message below
//
// ✏️ USAGE:
//   const [date, setDate] = useState<Date | null>(null);
//
//   <DefaultDatePicker
//     selected={date}
//     onChange={(d) => setDate(d)}
//     error={errors.date}
//   />
//
// ✏️ NOTE:
//   Uses portalId="datepicker-portal" so the calendar popup
//   renders above modals (avoids z-index clipping issues).
// ─────────────────────────────────────────────────────────

import { AlertCircle } from 'lucide-react';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DefaultDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  dateFormat?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

const DefaultDatePicker: React.FC<DefaultDatePickerProps> = ({
  selected,
  onChange,
  placeholderText = 'Select date',
  dateFormat = 'yyyy-MM-dd',
  disabled = false,
  className = '',
  error,
}) => {
  const baseStyle =
    'w-full px-4 py-2 rounded-lg text-sm font-medium transition border appearance-none focus:outline-none focus:ring-2';

  const getInputStyle = () => {
    if (disabled) return 'bg-gray-100 border-gray-300 cursor-not-allowed';
    if (error) return 'bg-white text-black border-red-500 focus:ring-red-200';
    return 'bg-white text-black border-gray-300 focus:ring-blue-200';
  };

  return (
    <div className="w-full">
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        disabled={disabled}
        className={`${baseStyle} ${getInputStyle()} ${className}`}
        wrapperClassName="w-full"
        // portalId ensures the popup renders above dialogs
        portalId="datepicker-portal"
        popperProps={{ strategy: 'fixed' }}
        popperClassName="!z-[99999]"
        onCalendarOpen={() => {
          document
            .getElementById('datepicker-portal')
            ?.setAttribute('style', 'position: relative; z-index: 99999; pointer-events: auto;');
        }}
        onCalendarClose={() => {
          document.getElementById('datepicker-portal')?.removeAttribute('style');
        }}
      />

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

export default DefaultDatePicker;
