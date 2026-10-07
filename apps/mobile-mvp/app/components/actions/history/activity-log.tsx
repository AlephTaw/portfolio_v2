"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import type { HistoryEntry } from "../activity-session";
import type { PanelView } from "../workspace-state";
import { ViewThumbnail } from "./view-thumbnail";
import { ComponentSystems } from "../settings/component-systems";
import type { TerminalCategory } from "../terminal-categories";
import { CategoryAppView } from "../../systems/utilities/category-app-view";
import { useScrollToDock } from "./use-scroll-to-dock";
import { useAppScrollBoundary } from "./use-app-scroll-boundary";

export type LogMarker = { id: string; offset: number };

export function ActivityLog({ entries, activeView, visorOpen = false, activeCategory = null, completed = [], onToggle = () => {}, onRestore, onDockApp, onMarkersChange, renderPreview, renderActiveView, scrollRef, composer, composerVisible = true, historyVisible = true, composerDocked = false, composerHeight = 36, activeCategoryVisible = historyVisible }: {
  entries: HistoryEntry[];
  activeView: PanelView | null;
  visorOpen?: boolean;
  activeCategory?: TerminalCategory | null;
  activeCategoryVisible?: boolean;
  completed?: readonly string[];
  onToggle?: (id: string) => void;
  onRestore: (id: number) => void;
  onDockApp: () => void;
  onMarkersChange: (markers: LogMarker[]) => void;
  renderPreview: (view: PanelView) => ReactNode;
  renderActiveView: (view: PanelView) => ReactNode;
  scrollRef?: RefObject<HTMLDivElement | null>;
  composer?: ReactNode;
  composerVisible?: boolean;
  historyVisible?: boolean;
  composerDocked?: boolean;
  composerHeight?: number;
}) {
  const internalViewport = useRef<HTMLDivElement>(null);
  const viewport = scrollRef ?? internalViewport;
  const list = useRef<HTMLDivElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const dockingSlot = useRef<HTMLDivElement>(null);
  const categoryApp = useRef<HTMLDivElement>(null);
  const categoryVisual = useRef<HTMLDivElement>(null);
  const dockingHint = useRef<HTMLDivElement>(null);
  const activeApp = activeCategory ? `category:${activeCategory}` : activeView ? `view:${activeView}` : null;
  const previousApp = useRef<string | null>(null);
  const previousEntries = useRef(entries);
  const scrollTarget = useRef<"app" | "bottom">("bottom");
  useScrollToDock({ viewport, app: categoryApp, visual: categoryVisual, hint: dockingHint, history, slot: dockingSlot,
    enabled: activeCategoryVisible && historyVisible, category: activeApp,
    clearance: composerDocked ? composerHeight + 30 : 0, onDock: onDockApp });
  useAppScrollBoundary({ viewport, app: categoryApp, content: list, activeApp, enabled: activeCategoryVisible && historyVisible });

  useLayoutEffect(() => {
    const root = viewport.current;
    const content = list.current;
    if (!root || !content) return;
    let frame = 0;
    let followEnd = false;
    const measure = () => {
      // Short apps need enough feed space to align their top with the viewport.
      const app = categoryApp.current;
      if (app) {
        const minHeight = `${Math.max(0, root.clientHeight - (composerDocked ? composerHeight + 30 : 0))}px`;
        if (app.style.minHeight !== minHeight) app.style.minHeight = minHeight;
        app.style.setProperty("--feed-app-height", minHeight);
      }
      if (followEnd && scrollTarget.current === "bottom") root.scrollTo({ top: root.scrollHeight });
      followEnd = false;
      const bounds = root.getBoundingClientRect();
      const markers = Array.from(content.querySelectorAll<HTMLElement>("[data-log-anchor]")).flatMap((element) => {
        if (!element.getClientRects().length) return [];
        const view = element === app || element.dataset.logAnchor === "docking-destination" || !!element.querySelector('button[aria-label^="Restore "]');
        const rect = element.getBoundingClientRect();
        const offset = rect.top + (view ? 0 : rect.height / 2) - bounds.top;
        return offset >= 0 && offset < bounds.height - 4 ? [{ id: element.dataset.logAnchor!, offset }] : [];
      });
      onMarkersChange(markers);
    };
    const schedule = (follow = false) => { followEnd ||= follow; cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const onScroll = () => schedule();
    const observer = new ResizeObserver(() => schedule(true));
    observer.observe(root);
    observer.observe(content);
    root.addEventListener("scroll", onScroll, { passive: true });
    schedule(true);
    return () => { observer.disconnect(); root.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [entries, activeView, activeCategory, visorOpen, composerDocked, composerHeight, onMarkersChange, viewport]);

  useLayoutEffect(() => {
    const root = viewport.current;
    const launchingApp = activeApp !== null && activeApp !== previousApp.current;
    const latest = entries.at(-1);
    const switchingSurface = latest?.kind === "action" && (latest.label === "Visor opened" || latest.label === "Visor closed");
    // Journey retains its existing Field Report bottom-opening exception.
    if (launchingApp) scrollTarget.current = activeView === "activity" ? "bottom" : "app";
    else if ((entries !== previousEntries.current && !switchingSurface) || activeApp === null) scrollTarget.current = "bottom";
    previousApp.current = activeApp;
    previousEntries.current = entries;
    if (!root) return;
    const app = categoryApp.current;
    if (launchingApp && scrollTarget.current === "app" && app && activeCategoryVisible) {
      app.style.minHeight = `${Math.max(0, root.clientHeight - (composerDocked ? composerHeight + 30 : 0))}px`;
      app.style.setProperty("--feed-app-height", app.style.minHeight);
      root.scrollTo({ top: root.scrollTop + app.getBoundingClientRect().top - root.getBoundingClientRect().top });
    } else if (scrollTarget.current === "bottom") root.scrollTo({ top: root.scrollHeight });
  }, [entries, activeApp, activeView, activeCategoryVisible, composerDocked, composerHeight, historyVisible, viewport]);

  return <div ref={viewport} aria-label="Running activity log" className="split-pane-scroll h-full overflow-x-hidden overflow-y-auto overscroll-contain">
    <div ref={list} className="flex min-h-full flex-col pb-4 pt-10" style={composerDocked ? { paddingBottom: composerHeight + 30 } : undefined}>
      {/* Both surfaces share the same history and live app instance. */}
      <div ref={history} data-terminal-history className={entries.some((entry) => entry.kind === "category" || entry.kind === "view") ? "mt-auto" : undefined} aria-hidden={!historyVisible} inert={!historyVisible} style={{ visibility: historyVisible ? "visible" : "hidden" }}>
        <ComponentSystems target="terminal" />
        {entries.map((entry) => <article key={entry.id} className="relative flex items-center gap-3 py-3">
          {entry.kind === "category" ? <>
            <div data-log-anchor={`history-${entry.id}`}><ViewThumbnail label={entry.category} onRestore={() => onRestore(entry.id)}><CategoryAppView category={entry.category} completed={completed} onToggle={onToggle} /></ViewThumbnail></div>
            <div className="min-w-0 text-white/70"><p className="text-xs">{entry.category}</p><p className="mt-1 text-[10px] text-white/40">Minimized · tap to restore</p></div>
          </> : entry.kind === "view" ? <>
            <div data-log-anchor={`history-${entry.id}`}><ViewThumbnail label={entry.view === "activity" ? "Journey" : entry.view} onRestore={() => onRestore(entry.id)}>{renderPreview(entry.view)}</ViewThumbnail></div>
            <div className="min-w-0 text-white/70"><p className="text-xs capitalize">{entry.view === "activity" ? "Journey" : entry.view}</p><p className="mt-1 text-[10px] text-white/40">Minimized · tap to restore</p></div>
          </> : entry.kind === "command" ? <div data-log-anchor={`history-${entry.id}`} className="min-w-0 text-xs text-white/55">
            <p className="whitespace-pre-wrap break-words">{entry.text}</p>
            <p className="mt-1 text-[10px] text-white/40">{entry.status === "category-note" ? `${entry.category} · note` : "Executing · preview only (command runner not connected)"}</p>
          </div> : <p data-log-anchor={`history-${entry.id}`} className="text-xs text-white/55">{entry.label}</p>}
        </article>)}
        <div ref={dockingSlot} data-docking-slot aria-hidden="true" className="hidden items-center gap-3 py-3">
          <div data-log-anchor="docking-destination" className="h-[69.5px] w-8 shrink-0 rounded-md border border-dashed border-white/25" />
          <div className="min-w-0 text-white/70"><p className="text-xs capitalize">{activeView === "activity" ? "Journey" : activeCategory ?? activeView}</p><p className="mt-1 text-[10px] text-white/40">Docking here</p></div>
        </div>
        <article className="py-3">
          <p data-log-anchor={activeView ? undefined : "current"} className="text-[10px] uppercase tracking-widest text-white/45">Current activity</p>
          <p className="mt-1 text-xs capitalize text-white/70">{activeView === "activity" ? "Journey" : activeView ?? activeCategory ?? "Commands"}</p>
        </article>
      </div>
      {activeApp && <div ref={categoryApp} hidden={!activeCategoryVisible} data-log-anchor={activeCategory ? "current-category" : "current-view"} className="pb-3"><div ref={categoryVisual} className={`origin-top-left ${activeView ? "overflow-hidden" : "rounded-md"}`}>
        {activeCategory ? <CategoryAppView key={activeApp} category={activeCategory} completed={completed} onToggle={onToggle} /> : activeView && <div key={activeApp}>{renderActiveView(activeView)}</div>}
      </div></div>}
      {composer && <div hidden={!composerVisible} className={composerDocked ? "terminal-prompt-anchor" : "mt-auto shrink-0 pt-3"}>{composer}</div>}
    </div>
    <div className="pointer-events-none sticky bottom-32 z-10 h-0"><div ref={dockingHint} role="status" aria-live="polite" className="absolute bottom-0 left-1/2 w-max max-w-full -translate-x-1/2 rounded-full bg-black/85 px-3 py-2 text-[10px] text-white/70 opacity-0" /></div>
  </div>;
}
