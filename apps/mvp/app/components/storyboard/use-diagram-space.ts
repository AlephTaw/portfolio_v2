"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Measure the actual pane, not the viewport breakpoint. Scroll offset is added
// back so scrolling does not repeatedly resize the graphics.
export function useDiagramSpace(revision: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const viewportHeightRef = useRef<number | null>(null);
  const [space, setSpace] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const scroller = element.closest<HTMLElement>(".pin-scrollbar");
    const composer = document.querySelector<HTMLElement>('[aria-label="Command composer"]');
    let frame = 0;
    const measure = () => {
      const bounds = element.getBoundingClientRect();
      const top = bounds.top + (scroller?.scrollTop ?? 0);
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const viewportChanged = viewportHeightRef.current !== null && Math.abs(viewportHeightRef.current - viewportHeight) > 1;
      const bottom = Math.min(viewportHeight, scroller?.getBoundingClientRect().bottom ?? Infinity, composer?.getBoundingClientRect().top ?? Infinity);
      const measuredHeight = Math.max(160, bottom - top - 12);
      setSpace(previous => {
        // The expanded stats readout may push the diagrams down, but must not
        // resize them. A viewport or pane-width change still recomputes space.
        const height = revision && previous.height > 0 && Math.abs(previous.width - bounds.width) < 1 && !viewportChanged ? previous.height : measuredHeight;
        return Math.abs(previous.width - bounds.width) < 1 && Math.abs(previous.height - height) < 1 ? previous : { width: bounds.width, height };
      });
      viewportHeightRef.current = viewportHeight;
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    // Ancestors account for summary changes, split-pane resizing and previews.
    for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) observer.observe(parent);
    if (composer) observer.observe(composer);
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
    };
  }, [revision]);

  return { ref, ...space };
}
