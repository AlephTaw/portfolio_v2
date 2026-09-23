"use client";

import { createContext, useContext } from "react";

type RightRailVisibility = {
  hidden: boolean;
  reveal: () => void;
};

const RightRailVisibilityContext = createContext<RightRailVisibility | null>(null);

export const RightRailVisibilityProvider = RightRailVisibilityContext.Provider;

export function useRightRailVisibility() {
  const context = useContext(RightRailVisibilityContext);
  if (!context) throw new Error("useRightRailVisibility must be used within RightRailVisibilityProvider");
  return context;
}
