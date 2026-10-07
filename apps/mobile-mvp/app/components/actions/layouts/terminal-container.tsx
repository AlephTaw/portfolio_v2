"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { PrimaryColumn } from "./primary-column";
import type { LogMarker } from "../history/activity-log";
import { TerminalView } from "../views/terminal-view";
import { terminalVisiblePercent } from "../navigation/terminal-visible-percent";

/** One terminal layout and timeline context; visor mode changes presentation
 * only. Keep this mounted so drafts, app state, and gestures survive toggles. */
export function TerminalContainer({ containerRef, visorOpen, position, children, navigation, markers, minimizedCount, historyVisible, settingsActive, onToggleSettings, onResize, onMinimize, onVisiblePercentChange }: {
  containerRef: RefObject<HTMLDivElement | null>;
  visorOpen: boolean;
  position: number | null;
  children: ReactNode;
  navigation: ReactNode;
  markers: LogMarker[];
  minimizedCount: number;
  historyVisible: boolean;
  settingsActive: boolean;
  onToggleSettings: () => void;
  onResize: (delta: number) => void;
  onMinimize: () => void;
  onVisiblePercentChange: (percent: number) => void;
}) {
  const dock = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = containerRef.current;
    const nav = dock.current;
    if (!root || !nav) return;
    let frame = 0;
    const measure = () => {
      const navHeight = nav.getBoundingClientRect().height;
      const value = `${navHeight}px`;
      if (root.style.getPropertyValue("--terminal-nav-height") !== value) root.style.setProperty("--terminal-nav-height", value);
      onVisiblePercentChange(terminalVisiblePercent(root.getBoundingClientRect().height, navHeight, window.innerHeight));
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(nav);
    observer.observe(root);
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [containerRef, onVisiblePercentChange]);

  return <div ref={containerRef} role="region" aria-label="Terminal container" data-terminal-container className={`terminal-container activity-overlay-surface liquid-glass-surface fixed inset-x-0 bottom-0 z-10 ${visorOpen ? "terminal-container-world" : ""}`} style={{ height: !visorOpen ? "100dvh" : position === null ? "calc((100dvh - var(--terminal-nav-height, 60px)) * 0.3 + var(--terminal-nav-height, 60px))" : `${100 - position}%`, paddingTop: !visorOpen || position === 0 ? "env(safe-area-inset-top)" : undefined }}>
    <PrimaryColumn settingsActive={settingsActive} onToggleSettings={onToggleSettings} historyVisible={historyVisible} splitOffset={visorOpen ? 0 : null} markers={markers} minimizedCount={minimizedCount} onResize={onResize} onMinimize={onMinimize}
      content={<TerminalView floating={visorOpen}>{children}</TerminalView>}
      navigation={<div ref={dock}>{navigation}</div>} />
  </div>;
}
