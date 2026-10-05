"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { usePathname } from "next/navigation";
import { activitySessionReducer, createActivitySession, type ActivitySession, type SessionAction } from "../actions/activity-session";
import { mockInventoryItems, initialInventoryApps, initialInventorySystems } from "../actions/views/inventory-data";
import type { PanelView } from "../actions/workspace-state";
import type { ReceiptAttachment } from "../actions/field-report/receipt-attachments";
import { createComponentConfigs, type ComponentConfigs, type SettingsTarget } from "../actions/settings/component-config";
import { initialStory, type StoryScene } from "../actions/game-design/dashboard-data";
import { defaultGlassTint, type GlassTintConfig } from "../actions/design-system/glass-tint";
import { initialPhysicalLocations, type PhysicalCategory } from "../actions/views/physical-inventory-data";

type WatcherState = {
  session: ActivitySession;
  dispatch: Dispatch<SessionAction>;
  items: string[];
  onAddItem: (name: string, category?: PhysicalCategory) => void;
  physicalLocations: Record<string, PhysicalCategory>;
  inventorySections: { apps: string[]; systems: string[] };
  onAddInventoryEntry: (section: "apps" | "systems", name: string) => void;
  splits: Record<PanelView, number>;
  setSplits: Dispatch<SetStateAction<Record<PanelView, number>>>;
  completedMvd: string[];
  toggleMvd: (id: string) => void;
  reportDraft: string;
  setReportDraft: Dispatch<SetStateAction<string>>;
  receipts: ReceiptAttachment[];
  addReceipts: (files: File[]) => void;
  removeReceipt: (id: string) => void;
  adminProfile: Record<string, string>;
  setAdminProfile: Dispatch<SetStateAction<Record<string, string>>>;
  panelTheme: "dark" | "light";
  setPanelTheme: Dispatch<SetStateAction<"dark" | "light">>;
  glassTint: GlassTintConfig;
  setGlassTint: Dispatch<SetStateAction<GlassTintConfig>>;
  settingsTarget: SettingsTarget;
  setSettingsTarget: Dispatch<SetStateAction<SettingsTarget>>;
  componentConfigs: ComponentConfigs;
  setComponentConfigs: Dispatch<SetStateAction<ComponentConfigs>>;
  gameDesignOpen: boolean;
  setGameDesignOpen: Dispatch<SetStateAction<boolean>>;
  storyScenes: StoryScene[];
  setStoryScenes: Dispatch<SetStateAction<StoryScene[]>>;
  storyScript: string;
  setStoryScript: Dispatch<SetStateAction<string>>;
  narration: File | null;
  setNarration: Dispatch<SetStateAction<File | null>>;
};

const WatcherContext = createContext<WatcherState | null>(null);

export function Watcher({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(activitySessionReducer, null, createActivitySession);
  const [items, setItems] = useState(mockInventoryItems);
  const [physicalLocations, setPhysicalLocations] = useState(initialPhysicalLocations);
  const [inventorySections, setInventorySections] = useState({ apps: initialInventoryApps, systems: initialInventorySystems });
  const onAddInventoryEntry = useCallback((section: "apps" | "systems", name: string) => {
    setInventorySections((previous) => ({ ...previous, [section]: [...previous[section], name] }));
    dispatch({ type: "record-action", label: `Added inventory ${section === "apps" ? "app" : "system"}: ${name}` });
  }, []);
  const [splits, setSplits] = useState<Record<PanelView, number>>({ build: 50, inventory: 50, chat: 50, activity: 50, admin: 50, settings: 50, "component-settings": 50, harness: 50 });
  const [settingsTarget, setSettingsTarget] = useState<SettingsTarget>("terminal");
  const [componentConfigs, setComponentConfigs] = useState(createComponentConfigs);
  const [gameDesignOpen, setGameDesignOpen] = useState(false);
  const [storyScenes, setStoryScenes] = useState<StoryScene[]>(() => initialStory.map((scene) => ({ ...scene })));
  const [storyScript, setStoryScript] = useState("");
  const [narration, setNarration] = useState<File | null>(null);
  const [adminProfile, setAdminProfile] = useState<Record<string, string>>({ Username: "Alex Morgan", Email: "alex@example.com", Age: "", Sex: "Male", "Subscription Type": "Pro", Interests: "Game design, artificial intelligence, systems thinking" });
  const [panelTheme, setPanelTheme] = useState<"dark" | "light">("dark");
  const [glassTint, setGlassTint] = useState<GlassTintConfig>(defaultGlassTint);
  const [completedMvd, setCompletedMvd] = useState<string[]>([]);
  const [reportDraft, setReportDraft] = useState("");
  const [receipts, setReceipts] = useState<ReceiptAttachment[]>([]);
  const receiptId = useRef(0);
  const toggleMvd = useCallback((id: string) => setCompletedMvd((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]), []);
  const addReceipts = useCallback((files: File[]) => {
    const additions = files.map((file) => ({ id: `receipt-${++receiptId.current}`, file }));
    setReceipts((previous) => [...previous, ...additions]);
  }, []);
  const removeReceipt = useCallback((id: string) => setReceipts((previous) => previous.filter((receipt) => receipt.id !== id)), []);
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (previousPath.current && previousPath.current !== pathname) dispatch({ type: "record-action", label: `Opened ${pathname === "/" ? "landing page" : pathname.slice(1)}` });
    previousPath.current = pathname;
  }, [pathname]);

  const onAddItem = useCallback((name: string, category: PhysicalCategory = "Miscellaneous") => {
    setItems((previous) => [...previous, name]);
    setPhysicalLocations((previous) => ({ ...previous, [name]: category }));
    dispatch({ type: "record-action", label: `Added inventory item: ${name}` });
  }, []);

  const value = useMemo(() => ({ session, dispatch, items, onAddItem, splits, setSplits, completedMvd, toggleMvd, reportDraft, setReportDraft, receipts, addReceipts, removeReceipt, adminProfile, setAdminProfile, panelTheme, setPanelTheme, settingsTarget, setSettingsTarget, componentConfigs, setComponentConfigs, gameDesignOpen, setGameDesignOpen, storyScenes, setStoryScenes, storyScript, setStoryScript, narration, setNarration }), [session, items, onAddItem, splits, completedMvd, toggleMvd, reportDraft, receipts, addReceipts, removeReceipt, adminProfile, panelTheme, settingsTarget, componentConfigs, gameDesignOpen, storyScenes, storyScript, narration]);
  return <WatcherContext.Provider value={{ ...value, glassTint, setGlassTint, inventorySections, onAddInventoryEntry, physicalLocations }}>{children}</WatcherContext.Provider>;
}

export function useWatcher() {
  const watcher = useContext(WatcherContext);
  if (!watcher) throw new Error("useWatcher must be used within the app Watcher");
  return watcher;
}
