"use client";

import { createContext, useContext, useEffect, useEffectEvent, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { StateAppView } from "./state-view-toolbar";
import { useActionSpaceState } from "../../components/storyboard/action-space-state";

export type ArcView = "worldline" | "logs" | "storyboard" | "storyboard-v2";

type StateViewContextValue = {
  actionSpace: ReturnType<typeof useActionSpaceState>;
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
  arcView: ArcView;
  campaignSelected: boolean;
  selectedCampaign: "all" | "current";
  selectAppView: (view: StateAppView) => void;
  setNavigationHome: (home: boolean) => void;
  setArcView: Dispatch<SetStateAction<ArcView>>;
  setCampaignSelected: Dispatch<SetStateAction<boolean>>;
  setSelectedCampaign: Dispatch<SetStateAction<"all" | "current">>;
  setPreviewAppView: (view: StateAppView | null) => void;
  toggleSummaryView: (view: "guild" | "connections") => void;
  toolbarActiveView: StateAppView;
  toolbarDisplayedView: StateAppView;
};

const StateViewContext = createContext<StateViewContextValue | null>(null);

export function StateViewProvider({ children }: { children: ReactNode }) {
  const actionSpace = useActionSpaceState();
  const [quests, setQuests] = useState<string[]>([]);
  const [notesVisible, setNotesVisible] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [appView, setAppView] = useState<StateAppView>("arc");
  const [lastIconAppView, setLastIconAppView] = useState<StateAppView>("arc");
  const [previewAppView, setPreviewAppView] = useState<StateAppView | null>(null);
  const [navigationHome, setNavigationHome] = useState(false);
  const [arcView, updateArcView] = useState<ArcView>("worldline");
  const [campaignSelected, setCampaignSelected] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<"all" | "current">("current");
  const actionSpaceReady = actionSpace.state !== null;
  const restoreArcView = useEffectEvent(() => {
    if (actionSpace.state?.view.open) updateArcView("storyboard-v2");
  });
  useEffect(() => {
    if (actionSpaceReady) restoreArcView();
  }, [actionSpaceReady]);

  const setArcView: Dispatch<SetStateAction<ArcView>> = (update) => {
    const next = typeof update === "function" ? update(arcView) : update;
    updateArcView(next);
    actionSpace.updateView((current) => ({ ...current, open: next === "storyboard-v2" }));
  };

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
      actionSpace,
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
