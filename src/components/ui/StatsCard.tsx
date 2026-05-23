import type { LucideIcon } from "lucide-react";

type StatsCardVariant = "orange" | "red" | "yellow" | "green" | "blue" | "gray";

const variantStyles: Record<StatsCardVariant, { bg: string; icon: string }> = {
  orange: { bg: "bg-[#FFF1ED]", icon: "text-[#F14B27]" },
  red: { bg: "bg-red-100", icon: "text-red-600" },
  yellow: { bg: "bg-yellow-100", icon: "text-yellow-600" },
  green: { bg: "bg-green-100", icon: "text-green-600" },
  blue: { bg: "bg-blue-100", icon: "text-blue-600" },
  gray: { bg: "bg-gray-100", icon: "text-gray-500" },
};

interface StatsCardProps {
  title: string;
  stat: string | number;
  icon: LucideIcon;
  variant?: StatsCardVariant;
}

const StatsCard = ({
  title,
  stat,
  icon: Icon,
  variant = "gray",
}: StatsCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-lg ${styles.bg} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${styles.icon}`} />
        </div>
        <span className="text-xs font-bold text-black uppercase tracking-wider">
          {title}
        </span>
      </div>

      {/* Stat */}
      <div className="px-3 py-2 bg-gray-100 rounded-lg w-full">
        <span className="text-2xl font-bold text-gray-900">
          {typeof stat === "number" ? stat.toLocaleString() : stat}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;
