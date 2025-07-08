import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { scan } from "react-scan";
import { LiveStoresProvider } from "./store/LiveStoreProvider.tsx";

scan({ enabled: import.meta.env.VITE_REACT_SCAN === "true" });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LiveStoresProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </LiveStoresProvider>
  </StrictMode>,
);
