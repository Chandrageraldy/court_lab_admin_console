// components/ui/Badge.tsx
type BadgeVariant = "red" | "yellow" | "green" | "blue" | "gray";

const variantStyles: Record<BadgeVariant, string> = {
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-600",
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  gray: "bg-gray-100 text-gray-600",
};

type BadgeProps = {
  label: string;
  variant: BadgeVariant;
};

const Badge = ({ label, variant }: BadgeProps) => {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}
    >
      {label}
    </span>
  );
};

export default Badge;
