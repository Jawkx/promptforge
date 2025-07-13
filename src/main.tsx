import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { scan } from "react-scan";
import { LiveStoresProvider } from "./store/LiveStoreProvider.tsx";

scan({ enabled: import.meta.env.VITE_REACT_SCAN === "true" });

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <LiveStoresProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </LiveStoresProvider>
    </ClerkProvider>
  </StrictMode>,
);
