import React from "react";
import RootStore from "./rootStore";

export const StoreContext = React.createContext<RootStore | null>(null);
