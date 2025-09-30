import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import RootStore from "./store/rootStore";
import { StoreProvider } from "./store/StoreProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";

const store = new RootStore();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StoreProvider store={store}>
        <App />
      </StoreProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
