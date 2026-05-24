interface RadioOption<T> {
  label: string;
  description?: string;
  value: T;
}

interface RadioGroupProps<T> {
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const RadioGroup = <T,>({ options, value, onChange }: RadioGroupProps<T>) => {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <label
          key={String(option.value)}
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            value === option.value
              ? "border-[#F14B27] bg-[#FFF1ED]"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <input
            type="radio"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-0.5 accent-[#F14B27]"
          />
          <div>
            <p
              className={`text-xs font-semibold ${
                value === option.value ? "text-[#F14B27]" : "text-gray-700"
              }`}
            >
              {option.label}
            </p>
            {option.description && (
              <p className="text-xs text-gray-400 mt-0.5">
                {option.description}
              </p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;
