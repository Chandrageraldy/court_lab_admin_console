import {
  DefaultDialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./DefaultDialog";
import DefaultButton from "./DefaultButton";
import type { ReactNode } from "react";

type ConfirmDialogVariant = "danger" | "primary";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  icon?: ReactNode;
  onConfirm: () => void;
  isLoading?: boolean;
  loadingLabel?: string;
}

const variantStyles: Record<
  ConfirmDialogVariant,
  {
    iconBg: string;
    confirmVariant: "danger" | "primary";
  }
> = {
  danger: {
    iconBg: "bg-red-50",
    confirmVariant: "danger",
  },
  primary: {
    iconBg: "bg-[#F14B27]/10",
    confirmVariant: "primary",
  },
};

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon,
  onConfirm,
  isLoading = false,
  loadingLabel = "Loading...",
}: ConfirmDialogProps) => {
  const styles = variantStyles[variant];

  return (
    <DefaultDialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white">
        <div className="flex flex-col text-center gap-4">
          {/* Icon */}
          {icon && (
            <div
              className={`w-10 h-10 ${styles.iconBg} flex items-center justify-center rounded-lg`}
            >
              {icon}
            </div>
          )}

          {/* Title & Description */}
          <div>
            <DialogTitle className="text-[14px] text-left">{title}</DialogTitle>

            {description && (
              <DialogDescription className="mt-1.5 text-sm text-gray-500 text-left">
                {description}
              </DialogDescription>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-2 justify-end">
          <DefaultButton
            variant="secondary"
            handleClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </DefaultButton>

          <DefaultButton
            variant={styles.confirmVariant}
            handleClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingLabel : confirmLabel}
          </DefaultButton>
        </div>
      </DialogContent>
    </DefaultDialog>
  );
};

export default ConfirmDialog;
