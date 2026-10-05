"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useWatcher } from "../watcher/watcher";
import { ActionComposer } from "./action-composer";
import { ActionsBackground } from "./actions-background";
import { ActivityLog, type LogMarker } from "./history/activity-log";
import { FullView } from "./layouts/full-view";
import { PrimaryColumn } from "./layouts/primary-column";
import { ActivityOverlay } from "./layouts/activity-overlay";
import { BottomNavigation } from "./navigation/bottom-navigation";
import { RightSideRail } from "./navigation/right-side-rail";
import { BuildView } from "./views/build-view";
import { ChatView } from "./views/chat-view";
import { HudView } from "./views/hud-view";
import { InventoryView } from "./views/inventory-view";
import { FieldReportView } from "./views/field-report-view";
import { TerminalView } from "./views/terminal-view";
import { AdminView } from "./views/admin-view";
import { SettingsMenuView } from "./views/settings-menu-view";
import { ComponentSettingsView } from "./views/component-settings-view";
import { HarnessView } from "./views/harness-view";
import { resolveSettingsTarget } from "./settings/component-config";
import type { PanelView } from "./workspace-state";
import { useAdaptiveGlass } from "./design-system/use-adaptive-glass";
import type { PhysicalCategory } from "./views/physical-inventory-data";

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
  const { session, dispatch, items, onAddItem, splits, setSplits, panelTheme, glassTint, settingsTarget, setSettingsTarget, gameDesignOpen } = useWatcher();
  const page = useRef<HTMLElement>(null);
  const state = session.workspace;
  const content = useRef<HTMLDivElement>(null);
  const terminal = useRef<HTMLDivElement>(null);
  const commandInput = useRef<HTMLTextAreaElement>(null);
  const [promptPosition, setPromptPosition] = useState<number | null>(null);
  const [splitOffset, setSplitOffset] = useState<number | null>(null);
  const [markers, setMarkers] = useState<LogMarker[]>([]);
  const [visorClosing, setVisorClosing] = useState(false);
  useAdaptiveGlass(page, session.visorOpen || visorClosing, panelTheme, glassTint);
  const [promptHeight, setPromptHeight] = useState(36);
  const onVisorClosed = useCallback(() => setVisorClosing(false), []);
  const logVisible = !session.visorOpen && !visorClosing;
  const activeView = state.kind === "panel" ? state.view : null;
  const promptWindowOpen = session.visorOpen && session.composing && state.kind === "command";
  const hasWindow = activeView !== null || promptWindowOpen;
  const splitPosition = activeView ? splits[activeView] : 50;
  const commandPromptActive = session.composing && state.kind === "command";
  const promptDocked = !session.visorOpen && !visorClosing && activeView === null;
  const promptVisible = session.visorOpen ? commandPromptActive : logVisible && (activeView === null || commandPromptActive);

  useEffect(() => {
    if (initialView) dispatch({ type: "open-panel", view: initialView });
  }, [initialView, dispatch]);

  function setSplitPosition(position: number) {
    if (activeView) setSplits((previous) => ({ ...previous, [activeView]: Math.min(85, Math.max(0, position)) }));
  }

  function resizeFromDot(delta: number) {
    if (!hasWindow) return;
    const height = Math.max(1, content.current?.getBoundingClientRect().height ?? 0);
    const panelHeight = content.current?.querySelector('[role="dialog"]')?.getBoundingClientRect().height ?? height;
    if (promptWindowOpen) {
      const startPosition = promptPosition ?? 100 - panelHeight / height * 100;
      setPromptPosition(Math.min(85, Math.max(0, startPosition + delta / height * 100)));
      return;
    }
    if (state.kind !== "panel") return;
    const startPosition = state.mode === "split" ? splitPosition : state.mode === "full" ? 0 : 100 - panelHeight / height * 100;
    setSplitPosition(startPosition + (delta / height) * 100);
    dispatch({ type: "resize-panel" });
  }

  function beginCommand() {
    // Commit and focus inside the tap handler, retaining mobile Safari's user
    // activation so the software keyboard can open without a second tap.
    flushSync(() => {
      if (!promptWindowOpen) setPromptPosition(null);
      dispatch({ type: "begin-command" });
    });
    if (terminal.current) terminal.current.scrollTop = terminal.current.scrollHeight;
    commandInput.current?.focus({ preventScroll: true });
  }

  function submitCommand(text: string) {
    flushSync(() => {
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
    if (session.composing && state.kind === "command") {
      terminal.current?.scrollTo({ top: terminal.current.scrollHeight });
      commandInput.current?.focus({ preventScroll: true });
    }
  }

  function toggleSettings() {
    setSettingsTarget(resolveSettingsTarget(activeView, session.visorOpen, promptWindowOpen, settingsTarget));
    dispatch({ type: "select-panel", view: "settings" });
  }

  const log = <ActivityLog scrollRef={terminal} historyVisible={logVisible} composerVisible={promptVisible} composerDocked={promptDocked} composerHeight={promptHeight} composer={<ActionComposer terminal docked={promptDocked} showCategoryDock={commandPromptActive} selectedCategory={session.activeCategory} onSelectCategory={(category) => dispatch({ type: "select-category", category })} onHeightChange={setPromptHeight} onActivate={() => { if (!session.composing) dispatch({ type: "begin-command" }); }} inputRef={commandInput} onSubmit={submitCommand} />} entries={session.history} activeView={activeView} activeCategory={session.activeCategory} onRestore={(id) => dispatch({ type: "restore-view", id })} onMarkersChange={setMarkers} renderPreview={(view) => <PanelContent view={view} items={items} onAddItem={previewOnly} preview />} />;
  const minimizeWindow = () => dispatch({ type: promptWindowOpen ? "close-composer" : "minimize-panel" });

  return <main ref={page} data-panel-theme={panelTheme} data-visor-open={session.visorOpen} className="actions-page app-shell relative isolate h-dvh overflow-hidden">
    <ActionsBackground visorOpen={session.visorOpen} onVisorClosed={onVisorClosed} />
    <PrimaryColumn settingsActive={activeView === "settings"} onToggleSettings={toggleSettings} historyVisible={logVisible} splitOffset={hasWindow ? splitOffset : null} markers={logVisible ? markers : []} minimizedCount={session.history.filter((entry) => entry.kind === "view" || entry.kind === "category").length} onResize={resizeFromDot} onMinimize={minimizeWindow} content={
      <div ref={content} className="relative flex min-h-0 flex-1 flex-col">
        {session.visorOpen && <FullView label="HUD full view"><HudView /></FullView>}
        <ActivityOverlay label={session.visorOpen ? "Terminal" : "Command view"} presentation={session.visorOpen ? promptWindowOpen ? "window" : "hidden" : "fullscreen"} roundedTop position={promptPosition ?? "viewport-prompt"} onTopOffsetChange={setSplitOffset}>
          <TerminalView floating={session.visorOpen}>{log}</TerminalView>
        </ActivityOverlay>
        {state.kind === "panel" && <ActivityOverlay key={state.view === "build" ? `${state.view}-${gameDesignOpen ? "game-design" : "panels"}` : state.view} label={state.view === "activity" ? "Field report" : `${state.view} activity window`} dockToViewportTop={!session.visorOpen} roundedTop={state.view !== "build"} scrollToBottomOnOpen={state.view === "activity"} position={state.mode === "third" ? "viewport-third" : state.mode === "full" ? 0 : splitPosition} onTopOffsetChange={setSplitOffset}>
          <PanelContent view={state.view} items={items} onAddItem={onAddItem} />
        </ActivityOverlay>}
      </div>
      } navigation={
      <footer className="relative z-20 shrink-0 sm:pt-3">
        {/* Reserve the mobile dock's height even though it is viewport-fixed. */}
        <div className="relative h-[calc(60px+env(safe-area-inset-bottom))] sm:h-auto">
          <BottomNavigation activeView={activeView} onViewChange={(view) => dispatch({ type: "select-panel", view })} composing={session.composing} onBeginCommand={beginCommand} onHideCommand={session.visorOpen ? () => dispatch({ type: "close-composer" }) : beginCommand} />
          <RightSideRail buildActive={activeView === "build"} hasActiveView={hasWindow} onResize={resizeFromDot} onMinimize={minimizeWindow} hudActive={session.visorOpen} onToggleHud={toggleVisor} />
        </div>
      </footer>
      } />
  </main>;
}
