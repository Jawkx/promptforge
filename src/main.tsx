import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { unstable_batchedUpdates as batchUpdates } from 'react-dom'
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { LiveStoreProvider } from '@livestore/react'
import LiveStoreWorker from './livestore/livestore.worker.ts?worker'
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { makePersistedAdapter } from '@livestore/adapter-web'
import { schema } from "./livestore/schema.ts";

const adapter = makePersistedAdapter({
  storage: { type: 'opfs' },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      batchUpdates={batchUpdates}
    >
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </ThemeProvider>
    </LiveStoreProvider>
  </StrictMode>,
);
