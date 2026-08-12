"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PortfolioView = "traditional" | "character-sheet";

type PortfolioViewContextValue = {
  view: PortfolioView;
  toggleView: () => void;
};

const PortfolioViewContext = createContext<PortfolioViewContextValue | null>(null);

function usePortfolioView() {
  const context = useContext(PortfolioViewContext);

  if (!context) {
    throw new Error("Portfolio view controls must be used within their provider.");
  }

  return context;
}

export function PortfolioViewProvider({
  children,
  initialView = "traditional",
}: {
  children: ReactNode;
  initialView?: PortfolioView;
}) {
  const [view, setView] = useState<PortfolioView>(initialView);
  const value = useMemo(
    () => ({
      view,
      toggleView: () =>
        setView((current) =>
          current === "traditional" ? "character-sheet" : "traditional",
        ),
    }),
    [view],
  );

  return (
    <PortfolioViewContext.Provider value={value}>
      {children}
    </PortfolioViewContext.Provider>
  );
}

export function PortfolioViewButton() {
  const { toggleView, view } = usePortfolioView();
  const showingCharacterSheet = view === "character-sheet";

  return (
    <button
      aria-pressed={showingCharacterSheet}
      className={`rounded-full border border-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition focus:outline-none focus-visible:underline focus-visible:underline-offset-4 ${
        showingCharacterSheet
          ? "bg-black text-[#FEFCF1]"
          : "bg-transparent text-black hover:bg-black hover:text-[#FEFCF1]"
      }`}
      onClick={toggleView}
      type="button"
    >
      {showingCharacterSheet ? "Portfolio" : "Live Stats"}
    </button>
  );
}

export function PortfolioViewPane({
  characterSheet,
  children,
}: {
  characterSheet: ReactNode;
  children: ReactNode;
}) {
  const { view } = usePortfolioView();

  return (
    <div className="py-10 lg:py-10">
      {view === "character-sheet" ? characterSheet : children}
    </div>
  );
}
