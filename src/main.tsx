import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SnackbarProvider } from "./context/SnackbarContext.tsx";

// ─────────────────────────────────────────────────────────
// Entry point — no changes needed here usually.
// ─────────────────────────────────────────────────────────
createRoot(document.getElementById("root")!).render(
  <SnackbarProvider>
    <App />
  </SnackbarProvider>,
);
