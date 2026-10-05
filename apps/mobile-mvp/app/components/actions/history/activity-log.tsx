"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import type { HistoryEntry } from "../activity-session";
import type { PanelView } from "../workspace-state";
import { ViewThumbnail } from "./view-thumbnail";
import { ComponentSystems } from "../settings/component-systems";
import type { TerminalCategory } from "../terminal-categories";
import { CategoryAppView } from "../../systems/utilities/category-app-view";

export type LogMarker = { id: string; offset: number };

export function ActivityLog({ entries, activeView, activeCategory = null, onRestore, onMarkersChange, renderPreview, scrollRef, composer, composerVisible = true, historyVisible = true, composerDocked = false, composerHeight = 36 }: {
  entries: HistoryEntry[];
  activeView: PanelView | null;
  activeCategory?: TerminalCategory | null;
  onRestore: (id: number) => void;
  onMarkersChange: (markers: LogMarker[]) => void;
  renderPreview: (view: PanelView) => ReactNode;
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
  const followingEnd = useRef(true);

  useLayoutEffect(() => {
    const root = viewport.current;
    const content = list.current;
    if (!root || !content) return;
    let frame = 0;
    const measure = () => {
      if (followingEnd.current) root.scrollTo({ top: root.scrollHeight });
      const bounds = root.getBoundingClientRect();
      const markers = Array.from(content.querySelectorAll<HTMLElement>("[data-log-anchor]")).flatMap((element) => {
        const rect = element.getBoundingClientRect();
        const offset = rect.top + rect.height / 2 - bounds.top;
        return offset > 32 && offset < bounds.height - 4 ? [{ id: element.dataset.logAnchor!, offset }] : [];
      });
      onMarkersChange(markers);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const onScroll = () => {
      followingEnd.current = root.scrollHeight - root.clientHeight - root.scrollTop < 24;
      schedule();
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    observer.observe(content);
    root.addEventListener("scroll", onScroll, { passive: true });
    schedule();
    return () => { observer.disconnect(); root.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [entries, activeView, activeCategory, onMarkersChange, viewport]);

  useLayoutEffect(() => {
    const root = viewport.current;
    if (root && followingEnd.current) root.scrollTo({ top: root.scrollHeight });
  }, [entries, activeCategory, viewport]);

  return <div ref={viewport} aria-label="Running activity log" className="split-pane-scroll h-full overflow-y-auto overscroll-contain">
    <div ref={list} className="flex min-h-full flex-col pb-4 pt-10" style={composerDocked ? { paddingBottom: composerHeight + 30 } : undefined}>
      {/* Keep history geometry and the single prompt instance intact while the
          visor moves; only settled visor-down mode exposes history. */}
      <div data-terminal-history aria-hidden={!historyVisible} inert={!historyVisible} style={{ visibility: historyVisible ? "visible" : "hidden" }}>
        <ComponentSystems target="terminal" />
        {entries.map((entry) => <article key={entry.id} className="relative flex items-center gap-3 py-3">
          {entry.kind === "category" ? <>
            <div data-log-anchor={`history-${entry.id}`}><ViewThumbnail label={entry.category} onRestore={() => onRestore(entry.id)}><CategoryAppView category={entry.category} /></ViewThumbnail></div>
            <div className="min-w-0 text-white/70"><p className="text-xs">{entry.category}</p><p className="mt-1 text-[10px] text-white/40">Minimized · tap to restore</p></div>
          </> : entry.kind === "view" ? <>
            <div data-log-anchor={`history-${entry.id}`}><ViewThumbnail label={entry.view} onRestore={() => onRestore(entry.id)}>{renderPreview(entry.view)}</ViewThumbnail></div>
            <div className="min-w-0 text-white/70"><p className="text-xs capitalize">{entry.view}</p><p className="mt-1 text-[10px] text-white/40">Minimized · tap to restore</p></div>
          </> : entry.kind === "command" ? <div data-log-anchor={`history-${entry.id}`} className="min-w-0 text-xs text-white/55">
            <p className="whitespace-pre-wrap break-words">{entry.text}</p>
            <p className="mt-1 text-[10px] text-white/40">Executing · preview only (command runner not connected)</p>
          </div> : <p data-log-anchor={`history-${entry.id}`} className="text-xs text-white/55">{entry.label}</p>}
        </article>)}
        <article className="py-3">
          <p data-log-anchor={activeView ? undefined : "current"} className="text-[10px] uppercase tracking-widest text-white/45">Current activity</p>
          <p className="mt-1 text-xs capitalize text-white/70">{activeView ?? activeCategory ?? "Commands"}</p>
        </article>
        {activeCategory && <div data-log-anchor="current-category" className="pb-3"><CategoryAppView key={activeCategory} category={activeCategory} /></div>}
      </div>
      {composer && <div hidden={!composerVisible} className={composerDocked ? "terminal-prompt-anchor" : "mt-auto shrink-0 pt-3"}>{composer}</div>}
    </div>
  </div>;
}
