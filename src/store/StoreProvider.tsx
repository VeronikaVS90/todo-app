import React from "react";
import RootStore from "./rootStore";
import { StoreContext } from "./storeContext";

export const StoreProvider = ({
  children,
  store,
}: {
  children: React.ReactNode;
  store: RootStore;
}) => <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
