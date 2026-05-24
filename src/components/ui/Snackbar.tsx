// components/ui/Snackbar.tsx
import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type SnackbarVariant = "success" | "error";

interface SnackbarProps {
  message: string;
  variant?: SnackbarVariant;
  onClose: () => void;
  duration?: number;
}

const Snackbar = ({
  message,
  variant = "success",
  onClose,
  duration = 3000,
}: SnackbarProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: "bg-white border-green-200 text-green-700",
    error: "bg-white border-red-200 text-red-700",
  };

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium ${styles[variant]}`}
      >
        {icons[variant]}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
