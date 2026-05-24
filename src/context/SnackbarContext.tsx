import { createContext, useCallback, useContext, useState } from "react";

import Snackbar from "../components/ui/Snackbar";

type SnackbarVariant = "success" | "error";

interface SnackbarState {
  visible: boolean;
  message: string;
  variant: SnackbarVariant;
}

interface SnackbarContextType {
  showSnackbar: (message: string, variant?: SnackbarVariant) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: "",
    variant: "success",
  });

  const showSnackbar = useCallback(
    (message: string, variant: SnackbarVariant = "success") => {
      setSnackbar({
        visible: true,
        message,
        variant,
      });
    },
    [],
  );

  const handleClose = () => {
    setSnackbar((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {snackbar.visible && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          onClose={handleClose}
        />
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }

  return context;
};
