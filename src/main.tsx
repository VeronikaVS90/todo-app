import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import RootStore from "./store/rootStore";
import { StoreProvider } from "./store/StoreProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// TEMPORARY: Clear localStorage once after Zod integration
// Remove this code after localStorage is cleared
if (import.meta.env.DEV && !localStorage.getItem("zod_migration_done")) {
  console.log("🧹 Clearing localStorage due to Zod schema migration...");
  const keysToRemove: string[] = [];

  // Find all keys to remove
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.startsWith("boards") ||
        key.startsWith("columns:") ||
        key.startsWith("tasks:"))
    ) {
      keysToRemove.push(key);
    }
  }

  // Remove found keys
  keysToRemove.forEach((key) => localStorage.removeItem(key));

  // Mark migration as done
  localStorage.setItem("zod_migration_done", "true");
  console.log("✅ LocalStorage cleared successfully!");
}

const store = new RootStore();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StoreProvider store={store}>
        <App />
        <ReactQueryDevtools initialIsOpen={true} />
      </StoreProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
