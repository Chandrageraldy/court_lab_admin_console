// components/ui/DefaultDateRangePicker.tsx
import { Calendar } from "lucide-react";

interface DefaultDateRangePickerProps {
	startDate: string;
	endDate: string;
	onStartDateChange: (value: string) => void;
	onEndDateChange: (value: string) => void;
}

const DefaultDateRangePicker = ({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
}: DefaultDateRangePickerProps) => {
	const inputStyle =
		"bg-white text-black border border-gray-300 hover:bg-gray-100 cursor-pointer focus:border-[#F14B27] focus:ring-[#F14B27]/30 rounded-lg text-[13px] px-3 py-1.5 transition focus:outline-none focus:ring-2 appearance-none";

	return (
		<div className="flex items-center gap-1.5">
			<div className="relative flex items-center">
				<Calendar className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
				<input
					type="date"
					value={startDate}
					onChange={(e) => onStartDateChange(e.target.value)}
					className={`${inputStyle} pl-8`}
				/>
			</div>
			<span className="text-xs text-gray-400">to</span>
			<div className="relative flex items-center">
				<Calendar className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
				<input
					type="date"
					value={endDate}
					onChange={(e) => onEndDateChange(e.target.value)}
					className={`${inputStyle} pl-8`}
				/>
			</div>
		</div>
	);
};

export default DefaultDateRangePicker;