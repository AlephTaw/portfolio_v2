"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
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

function getViewFromUrl(): PortfolioView {
  return new URLSearchParams(window.location.search).get("view") ===
    "character-sheet"
    ? "character-sheet"
    : "traditional";
}

function updateUrlForView(view: PortfolioView) {
  const url = new URL(window.location.href);

  if (view === "character-sheet") {
    url.searchParams.set("view", "character-sheet");
  } else {
    url.searchParams.delete("view");
  }

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

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
  const toggleView = useCallback(() => {
    const nextView =
      getViewFromUrl() === "traditional" ? "character-sheet" : "traditional";

    updateUrlForView(nextView);
    setView(nextView);
  }, []);

  useEffect(() => {
    const syncViewFromUrl = () => {
      setView(getViewFromUrl());
    };

    syncViewFromUrl();
    window.addEventListener("popstate", syncViewFromUrl);

    return () => {
      window.removeEventListener("popstate", syncViewFromUrl);
    };
  }, []);

  const value = useMemo(
    () => ({
      view,
      toggleView,
    }),
    [toggleView, view],
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

  useEffect(() => {
    window.dispatchEvent(new Event("portfolio-view-change"));
  }, [view]);

  return (
    <div className="py-10 lg:py-10">
      {view === "character-sheet" ? characterSheet : children}
    </div>
  );
}
