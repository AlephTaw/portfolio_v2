"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useWatcher } from "../watcher/watcher";
import { ActionComposer } from "./action-composer";
import { ActionsBackground } from "./actions-background";
import { ActivityLog, type LogMarker } from "./history/activity-log";
import { FullView } from "./layouts/full-view";
import { TerminalContainer } from "./layouts/terminal-container";
import { BottomNavigation } from "./navigation/bottom-navigation";
import { RightSideRail } from "./navigation/right-side-rail";
import { BuildView } from "./views/build-view";
import { ChatView } from "./views/chat-view";
import { HudView } from "./views/hud-view";
import { InventoryView } from "./views/inventory-view";
import { FieldReportView } from "./views/field-report-view";
import { AdminView } from "./views/admin-view";
import { SettingsMenuView } from "./views/settings-menu-view";
import { ComponentSettingsView } from "./views/component-settings-view";
import { HarnessView } from "./views/harness-view";
import { resolveSettingsTarget } from "./settings/component-config";
import type { PanelView } from "./workspace-state";
import { useAdaptiveGlass } from "./design-system/use-adaptive-glass";
import type { PhysicalCategory } from "./views/physical-inventory-data";
import { addJourneyObjective } from "../systems/utilities/journey/use-journey";

function PanelContent({ view, items, onAddItem, preview = false }: { view: PanelView; items: string[]; onAddItem: (name: string, category?: PhysicalCategory) => void; preview?: boolean }) {
  switch (view) {
    case "build": return <BuildView preview={preview} />;
    case "chat": return <ChatView />;
    case "inventory": return <InventoryView items={items} onAddItem={onAddItem} />;
    case "activity": return <FieldReportView preview={preview} />;
    case "admin": return <AdminView />;
    case "settings": return <SettingsMenuView />;
    case "component-settings": return <ComponentSettingsView />;
    case "harness": return <HarnessView />;
  }
}

const previewOnly = () => {};

export function ActionsWorkspace({ initialView = null }: { initialView?: PanelView | null }) {
  const { session, dispatch, items, onAddItem, completedMvd, toggleMvd, panelTheme, glassTint, settingsTarget, setSettingsTarget } = useWatcher();
  const page = useRef<HTMLElement>(null);
  const state = session.workspace;
  const content = useRef<HTMLDivElement>(null);
  const terminal = useRef<HTMLDivElement>(null);
  const commandInput = useRef<HTMLTextAreaElement>(null);
  const [feedPosition, setFeedPosition] = useState<number | null>(null);
  const [terminalPercent, setTerminalPercent] = useState(30);
  const [markers, setMarkers] = useState<LogMarker[]>([]);
  const [visorClosing, setVisorClosing] = useState(false);
  useAdaptiveGlass(page, session.visorOpen || visorClosing, panelTheme, glassTint);
  const [promptHeight, setPromptHeight] = useState(36);
  const onVisorClosed = useCallback(() => setVisorClosing(false), []);
  const logVisible = !visorClosing;
  const activeView = state.kind === "panel" ? state.view : null;
  const commandPromptActive = session.composing;

  useEffect(() => {
    if (initialView) dispatch({ type: "open-panel", view: initialView });
  }, [initialView, dispatch]);

  function resizeFromDot(delta: number) {
    if (!session.visorOpen) return;
    const height = Math.max(1, page.current?.getBoundingClientRect().height ?? 0);
    const containerHeight = content.current?.getBoundingClientRect().height ?? height;
    setFeedPosition((previous) => {
      const startPosition = previous ?? 100 - containerHeight / height * 100;
      return Math.min(85, Math.max(0, startPosition + delta / height * 100));
    });
  }

  function beginCommand() {
    // Commit and focus inside the tap handler, retaining mobile Safari's user
    // activation so the software keyboard can open without a second tap.
    flushSync(() => {
      dispatch({ type: "begin-command" });
    });
    if (terminal.current) terminal.current.scrollTop = terminal.current.scrollHeight;
    commandInput.current?.focus({ preventScroll: true });
  }

  function submitCommand(text: string) {
    flushSync(() => {
      if (session.activeCategory === "Journey") {
        addJourneyObjective(text);
      }
      dispatch({ type: "submit-command", text });
    });
    terminal.current?.scrollTo({ top: terminal.current.scrollHeight });
    commandInput.current?.focus({ preventScroll: true });
  }

  function toggleVisor() {
    // Re-style the existing terminal rather than replacing its input instance.
    // Restore focus synchronously after the helmet takes it on pointer down.
    flushSync(() => {
      setVisorClosing(session.visorOpen);
      dispatch({ type: "toggle-hud" });
    });
    if (session.composing) {
      commandInput.current?.focus({ preventScroll: true });
    }
  }

  function toggleSettings() {
    setSettingsTarget(resolveSettingsTarget(activeView, session.visorOpen, session.composing, settingsTarget));
    dispatch({ type: "select-panel", view: "settings" });
  }

  const updateMarkers = useCallback((next: LogMarker[]) => {
    const columnTop = content.current?.querySelector(".actions-primary-column")?.getBoundingClientRect().top ?? 0;
    const offset = (terminal.current?.getBoundingClientRect().top ?? 0) - columnTop;
    setMarkers(next.map((marker) => ({ ...marker, offset: marker.offset + offset })));
  }, []);
  const minimizeApp = () => dispatch({ type: session.activeCategory ? "clear-category" : "minimize-panel" });
  const log = <ActivityLog visorOpen={session.visorOpen} scrollRef={terminal} historyVisible={logVisible} composerVisible={logVisible} composerDocked composerHeight={promptHeight} composer={<ActionComposer terminal docked showCategoryDock={commandPromptActive} selectedCategory={session.activeCategory} onSelectCategory={(category) => dispatch({ type: "select-category", category })} onClearCategory={() => dispatch({ type: "clear-category" })} onHeightChange={setPromptHeight} onActivate={() => { if (!session.composing) dispatch({ type: "activate-composer" }); }} inputRef={commandInput} onSubmit={submitCommand} />} entries={session.history} activeView={activeView} activeCategory={session.activeCategory} activeCategoryVisible={logVisible} completed={completedMvd} onToggle={toggleMvd} onRestore={(id) => dispatch({ type: "restore-view", id })} onDockApp={minimizeApp} onMarkersChange={updateMarkers} renderActiveView={(view) => <PanelContent view={view} items={items} onAddItem={onAddItem} />} renderPreview={(view) => <PanelContent view={view} items={items} onAddItem={previewOnly} preview />} />;

  return <main ref={page} data-panel-theme={panelTheme} data-visor-open={session.visorOpen} className="actions-page app-shell relative isolate h-dvh overflow-hidden">
    <ActionsBackground visorOpen={session.visorOpen} onVisorClosed={onVisorClosed} />
    {session.visorOpen && <div className="absolute inset-0 flex"><FullView label="HUD full view"><HudView /></FullView></div>}
    <TerminalContainer onVisiblePercentChange={setTerminalPercent} containerRef={content} visorOpen={session.visorOpen} position={feedPosition} settingsActive={activeView === "settings"} onToggleSettings={toggleSettings} historyVisible={logVisible} markers={logVisible ? markers : []} minimizedCount={session.history.filter((entry) => entry.kind === "view" || entry.kind === "category").length} onResize={resizeFromDot} onMinimize={minimizeApp} navigation={
      <footer className="relative z-20 shrink-0 sm:pb-4 sm:pt-3">
        {/* Reserve the mobile dock's height even though it is viewport-fixed. */}
        <div className="relative h-[calc(60px+env(safe-area-inset-bottom))] sm:h-auto">
          <BottomNavigation activeView={activeView} onViewChange={(view) => dispatch({ type: "select-panel", view })} composing={session.composing} onBeginCommand={beginCommand} onHideCommand={() => dispatch({ type: "close-composer" })} />
          <RightSideRail buildActive={activeView === "build"} visiblePercent={terminalPercent} onResize={resizeFromDot} hudActive={session.visorOpen} onToggleHud={toggleVisor} />
        </div>
      </footer>
      }>{log}</TerminalContainer>
  </main>;
}
