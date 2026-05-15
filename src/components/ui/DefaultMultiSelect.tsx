// ─────────────────────────────────────────────────────────
// DefaultMultiSelect — Multi-option Select with react-select
//
// Supports search, loading state, and a custom "Remove all"
// button. Tags (selected chips) are hidden by default — only
// a summary count is shown to keep the field compact.
//
// ✏️ PROPS:
//   options    → array of { label, value } options
//   value      → array of currently selected value strings
//   onChange   → callback with updated string[] of values
//   placeholder→ text shown when nothing is selected
//   disabled   → grays out and disables interaction
//   error      → red border + message below
//   isLoading  → shows loading indicator while options load
//
// ✏️ USAGE:
//   const [selected, setSelected] = useState<string[]>([]);
//
//   <DefaultMultiSelect
//     options={[
//       { label: 'Option A', value: 'a' },
//       { label: 'Option B', value: 'b' },
//     ]}
//     value={selected}
//     onChange={setSelected}
//     placeholder="Select items"
//   />
//
// ✏️ TO SHOW TAGS (chips) instead of hiding them:
//   In the styles object below, swap the "HIDE TAGS" block
//   with the "SHOW TAGS" block (commented out).
// ─────────────────────────────────────────────────────────

import React from 'react';
import Select, { components } from 'react-select';
import { AlertCircle, Trash2 } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface DefaultMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  isLoading?: boolean;
}

const DefaultMultiSelect: React.FC<DefaultMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  disabled = false,
  error,
  isLoading = false,
}) => {
  const fontWeight = 500;
  const shouldHideIndicator = isLoading || options.length === 0;

  return (
    <div className="w-full">
      <Select
        controlShouldRenderValue={false}
        isMulti
        options={options}
        placeholder={placeholder}
        isDisabled={disabled || isLoading}
        isSearchable={!disabled}
        value={options.filter((o) => value.includes(o.value))}
        onChange={(selected) =>
          onChange(selected ? selected.map((s) => s.value) : [])
        }
        isLoading={isLoading}
        loadingMessage={() => 'Loading options...'}
        noOptionsMessage={() => (isLoading ? 'Loading options...' : 'No options found')}
        // Render menu above dialogs/modals
        menuPortalTarget={document.body}
        menuPosition="fixed"
        menuShouldBlockScroll={true}
        components={{
          DropdownIndicator: shouldHideIndicator ? () => null : components.DropdownIndicator,
          IndicatorSeparator: shouldHideIndicator ? () => null : components.IndicatorSeparator,
          MultiValueRemove: () => null,
          // Custom "Remove all" clear button
          ClearIndicator: ({ innerProps }) => (
            <div
              {...innerProps}
              style={{
                cursor: 'pointer',
                padding: '0 8px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.color = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.color = '#ef4444';
              }}
            >
              <Trash2 size={12} />
              Remove all
            </div>
          ),
          // Custom value container: shows only the placeholder text (not individual chips)
          ValueContainer: ({ children, ...props }) => (
            <components.ValueContainer {...props}>
              {!props.selectProps.menuIsOpen && (
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight,
                    color: props.isDisabled ? '#4b5563' : '#6b7280',
                    position: 'absolute',
                    paddingLeft: '16px',
                  }}
                >
                  {placeholder}
                </span>
              )}
              {React.Children.map(children, (child: any) =>
                child?.type?.name === 'Input' || child?.props?.id ? child : null
              )}
            </components.ValueContainer>
          ),
        }}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: '40px',
            borderRadius: '0.5rem',
            fontSize: '14px',
            fontWeight,
            backgroundColor: state.isDisabled || isLoading ? '#d1d5db' : 'white',
            borderColor: state.isDisabled
              ? '#d1d5db'
              : error
                ? '#ef4444'
                : state.isFocused
                  ? '#d1d5db'
                  : base.borderColor,
            cursor: state.isDisabled || isLoading ? 'not-allowed' : 'pointer',
            boxShadow: state.isFocused
              ? error
                ? '0 0 0 2px rgba(239,68,68,0.2)'
                : '0 0 0 2px rgba(0,0,0,0.1)'
              : 'none',
            '&:hover': {
              backgroundColor: state.isDisabled ? '#d1d5db' : '#f3f4f6',
              borderColor: state.isDisabled ? '#d1d5db' : error ? '#ef4444' : '#d1d5db',
            },
          }),
          input: (base, state) => ({
            ...base,
            fontSize: '14px',
            fontWeight,
            color: state.isDisabled ? '#4b5563' : '#000',
          }),
          placeholder: () => ({ display: 'none' }), // Hidden: placeholder rendered in ValueContainer
          multiValueLabel: (base, state) => ({
            ...base,
            fontSize: '14px',
            fontWeight,
            color: state.isDisabled ? '#4b5563' : '#1d4ed8',
            padding: '2px 8px',
          }),
          // HIDE TAGS (current default) ✏️ swap with SHOW TAGS block if you want chips
          multiValue: () => ({ display: 'none', height: 0, margin: 0, padding: 0 }),
          // SHOW TAGS (uncomment to show chips):
          // multiValue: (base, state) => ({
          //   ...base,
          //   backgroundColor: state.isDisabled ? '#e5e7eb' : '#dbeafe',
          // }),
          option: (base, state) => ({
            ...base,
            fontSize: '14px',
            fontWeight,
            backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
            color: '#111827',
            cursor: 'pointer',
          }),
          menu: (base) => ({ ...base, fontSize: '14px', fontWeight, zIndex: 50 }),
          menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
          singleValue: (base) => ({ ...base, fontSize: '14px', fontWeight, color: '#000' }),
        }}
      />

      {/* Inline error message */}
      {error && (
        <div className="mt-2 flex items-center gap-1 text-red-500 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DefaultMultiSelect;
