import React from "react";
import { StoreContext } from "./storeContext";
import RootStore from "./rootStore";

export const useStore = (): RootStore => {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return store;
};
