"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { StatsAppView } from "./stats-view-toolbar";

type StatsViewContextValue = {
  appView: StatsAppView;
  displayedAppView: StatsAppView;
  previewAppView: StatsAppView | null;
  navigationHome: boolean;
  arcView: "worldline" | "logs" | "storyboard";
  campaignSelected: boolean;
  selectedCampaign: "all" | "current";
  selectAppView: (view: StatsAppView) => void;
  setNavigationHome: (home: boolean) => void;
  setArcView: Dispatch<SetStateAction<"worldline" | "logs" | "storyboard">>;
  setCampaignSelected: Dispatch<SetStateAction<boolean>>;
  setSelectedCampaign: Dispatch<SetStateAction<"all" | "current">>;
  setPreviewAppView: (view: StatsAppView | null) => void;
  toggleSummaryView: (view: "guild" | "connections") => void;
  toolbarActiveView: StatsAppView;
  toolbarDisplayedView: StatsAppView;
};

const StatsViewContext = createContext<StatsViewContextValue | null>(null);

export function StatsViewProvider({ children }: { children: ReactNode }) {
  const [appView, setAppView] = useState<StatsAppView>("arc");
  const [lastIconAppView, setLastIconAppView] = useState<StatsAppView>("arc");
  const [previewAppView, setPreviewAppView] = useState<StatsAppView | null>(null);
  const [navigationHome, setNavigationHome] = useState(false);
  const [arcView, setArcView] = useState<"worldline" | "logs" | "storyboard">("worldline");
  const [campaignSelected, setCampaignSelected] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<"all" | "current">("current");

  const selectAppView = (view: StatsAppView) => {
    setAppView(view);
    if (view !== "guild" && view !== "connections") setLastIconAppView(view);
    setPreviewAppView(null);
  };

  const toggleSummaryView = (view: "guild" | "connections") => {
    selectAppView(appView === view ? lastIconAppView : view);
  };

  const toolbarActiveView = appView === "guild" || appView === "connections" ? lastIconAppView : appView;

  return (
    <StatsViewContext.Provider value={{
      appView,
      displayedAppView: previewAppView ?? appView,
      previewAppView,
      navigationHome,
      arcView,
      campaignSelected,
      selectedCampaign,
      selectAppView,
      setNavigationHome,
      setArcView,
      setCampaignSelected,
      setSelectedCampaign,
      setPreviewAppView,
      toggleSummaryView,
      toolbarActiveView,
      toolbarDisplayedView: previewAppView ?? toolbarActiveView,
    }}>
      {children}
    </StatsViewContext.Provider>
  );
}

export function useStatsView() {
  const context = useContext(StatsViewContext);
  if (!context) throw new Error("useStatsView must be used within StatsViewProvider");
  return context;
}
