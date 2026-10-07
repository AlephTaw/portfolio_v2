"use client";

import { useLayoutEffect, type RefObject } from "react";

/** The live app is the beginning of the readable feed until it is docked. */
export function useAppScrollBoundary({ viewport, app, content, activeApp, enabled }: {
  viewport: RefObject<HTMLDivElement | null>;
  app: RefObject<HTMLDivElement | null>;
  content: RefObject<HTMLDivElement | null>;
  activeApp: string | null;
  enabled: boolean;
}) {
  useLayoutEffect(() => {
    const root = viewport.current;
    const frame = app.current;
    if (!enabled || !activeApp || !root || !frame) return;

    const minimum = () => {
      if (frame.hidden || frame.hasAttribute("data-docking-progress")) return null;
      return Math.max(0, root.scrollTop + frame.getBoundingClientRect().top - root.getBoundingClientRect().top - root.clientTop);
    };
    const clamp = () => {
      const top = minimum();
      if (top !== null && root.scrollTop < top - 0.5) root.scrollTo({ top, behavior: "instant" });
    };
    const atTop = () => {
      const top = minimum();
      return top !== null && root.scrollTop <= top + 1;
    };
    // Let nested text areas and scrollable app sections consume their own scroll.
    const canScrollInside = (target: EventTarget | null) => {
      let element = target instanceof Element ? target : null;
      while (element && element !== root) {
        if (element instanceof HTMLElement && element.scrollTop > 0 && element.scrollHeight > element.clientHeight && /auto|scroll/.test(getComputedStyle(element).overflowY)) return true;
        element = element.parentElement;
      }
      return false;
    };
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && event.deltaY < 0 && Math.abs(event.deltaY) > Math.abs(event.deltaX) && atTop() && !canScrollInside(event.target) && event.cancelable) event.preventDefault();
    };
    let touch: { x: number; y: number } | null = null;
    const start = (event: TouchEvent) => {
      touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    };
    const move = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return;
      const point = event.touches[0];
      const dx = point.clientX - touch.x, dy = point.clientY - touch.y;
      touch = { x: point.clientX, y: point.clientY };
      if (dy > 0 && dy > Math.abs(dx) && atTop() && !canScrollInside(event.target) && event.cancelable) event.preventDefault();
    };
    const end = () => { touch = null; };
    const observer = new ResizeObserver(clamp);
    observer.observe(root);
    if (content.current) observer.observe(content.current);
    root.addEventListener("scroll", clamp, { passive: true });
    root.addEventListener("wheel", wheel, { passive: false });
    root.addEventListener("touchstart", start, { passive: true });
    root.addEventListener("touchmove", move, { passive: false });
    root.addEventListener("touchend", end);
    root.addEventListener("touchcancel", end);
    clamp();
    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", clamp);
      root.removeEventListener("wheel", wheel);
      root.removeEventListener("touchstart", start);
      root.removeEventListener("touchmove", move);
      root.removeEventListener("touchend", end);
      root.removeEventListener("touchcancel", end);
    };
  }, [viewport, app, content, activeApp, enabled]);
}
