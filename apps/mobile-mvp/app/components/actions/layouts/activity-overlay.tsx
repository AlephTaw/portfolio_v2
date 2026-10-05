"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
export function ActivityOverlay({ label, children, position, onTopOffsetChange, roundedTop = false, scrollToBottomOnOpen = false, presentation = "window", dockToViewportTop = false }: {
  label: string;
  children: ReactNode;
  position: number | "viewport-third" | "viewport-prompt";
  onTopOffsetChange: (offset: number) => void;
  roundedTop?: boolean;
  scrollToBottomOnOpen?: boolean;
  presentation?: "window" | "fullscreen" | "hidden";
  dockToViewportTop?: boolean;
}) {
  const layer = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const scrollPane = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Initialize only on opening this view, not on resize or user scrolling.
    if (scrollToBottomOnOpen && scrollPane.current) {
      scrollPane.current.scrollTop = scrollPane.current.scrollHeight;
    }
  }, [scrollToBottomOnOpen]);

  useLayoutEffect(() => {
    if (presentation !== "window") return;
    const container = layer.current;
    const panel = panelRef.current;
    if (!container || !panel) return;
    let frame = 0;
    const measure = () => {
      onTopOffsetChange(panel.getBoundingClientRect().top - container.getBoundingClientRect().top);
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    measure();
    observer.observe(container);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [position, onTopOffsetChange, presentation]);

  // The layer does not occupy a layout row or intercept the exposed log.
  // Only the actual window receives pointer events. The rail dot owns resizing.
  return <div ref={layer} hidden={presentation === "hidden"} data-rounded-top={roundedTop} data-viewport-top={dockToViewportTop && presentation === "window" && position === 0} className={presentation === "window" ? "activity-overlay pointer-events-none absolute inset-y-0 z-10" : "pointer-events-none absolute inset-0"}>
    <section ref={panelRef} role={presentation === "window" ? "dialog" : "region"} aria-modal={presentation === "window" ? false : undefined} aria-label={label} className="pointer-events-auto absolute inset-x-0 bottom-0 flex min-h-0 flex-col" style={{ height: presentation !== "window" ? "100%" : position === "viewport-prompt" ? "30dvh" : position === "viewport-third" ? "calc(100dvh / 3)" : `${100 - position}%` }}>
      <div ref={scrollPane} className={`activity-overlay-surface split-pane-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain ${presentation === "window" ? "liquid-glass-surface" : ""}`}>{children}</div>
    </section>
  </div>;
}
