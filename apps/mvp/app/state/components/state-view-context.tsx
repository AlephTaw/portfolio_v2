"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { StateAppView } from "./state-view-toolbar";

type StateViewContextValue = {
  quests: string[];
  setQuests: Dispatch<SetStateAction<string[]>>;
  notesVisible: boolean;
  setNotesVisible: Dispatch<SetStateAction<boolean>>;
  editorOpen: boolean;
  setEditorOpen: Dispatch<SetStateAction<boolean>>;
  appView: StateAppView;
  displayedAppView: StateAppView;
  previewAppView: StateAppView | null;
  navigationHome: boolean;
  arcView: "worldline" | "logs" | "storyboard";
  campaignSelected: boolean;
  selectedCampaign: "all" | "current";
  selectAppView: (view: StateAppView) => void;
  setNavigationHome: (home: boolean) => void;
  setArcView: Dispatch<SetStateAction<"worldline" | "logs" | "storyboard">>;
  setCampaignSelected: Dispatch<SetStateAction<boolean>>;
  setSelectedCampaign: Dispatch<SetStateAction<"all" | "current">>;
  setPreviewAppView: (view: StateAppView | null) => void;
  toggleSummaryView: (view: "guild" | "connections") => void;
  toolbarActiveView: StateAppView;
  toolbarDisplayedView: StateAppView;
};

const StateViewContext = createContext<StateViewContextValue | null>(null);

export function StateViewProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<string[]>([]);
  const [notesVisible, setNotesVisible] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [appView, setAppView] = useState<StateAppView>("arc");
  const [lastIconAppView, setLastIconAppView] = useState<StateAppView>("arc");
  const [previewAppView, setPreviewAppView] = useState<StateAppView | null>(null);
  const [navigationHome, setNavigationHome] = useState(false);
  const [arcView, setArcView] = useState<"worldline" | "logs" | "storyboard">("worldline");
  const [campaignSelected, setCampaignSelected] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<"all" | "current">("current");

  const selectAppView = (view: StateAppView) => {
    setAppView(view);
    if (view !== "guild" && view !== "connections") setLastIconAppView(view);
    setPreviewAppView(null);
  };

  const toggleSummaryView = (view: "guild" | "connections") => {
    selectAppView(appView === view ? lastIconAppView : view);
  };

  const toolbarActiveView = appView === "guild" || appView === "connections" ? lastIconAppView : appView;

  return (
    <StateViewContext.Provider value={{
      quests, setQuests,
      notesVisible, setNotesVisible, editorOpen, setEditorOpen,
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
    </StateViewContext.Provider>
  );
}

export function useStateView() {
  const context = useContext(StateViewContext);
  if (!context) throw new Error("useStateView must be used within StateViewProvider");
  return context;
}
