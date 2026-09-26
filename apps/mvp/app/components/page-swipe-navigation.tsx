"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { pageTransitionEvent, WORLD_ORIGIN_KEY, type PageTransitionDetail } from "./page-transition-events";

const routes: Record<string, { left?: string; right?: string }> = {
  "/stats": { left: "/terminal" },
  "/terminal": { left: "/chat", right: "/stats" },
  "/chat": { right: "/terminal" },
  "/world": { left: "/stats" },
};
const excluded = "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='dialog'], [role='slider'], [role='separator'], [data-rail-gesture-ignore], [data-page-swipe-ignore]";

// A single gesture owner survives route animations and split-pane changes.
export function PageSwipeNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const path = useRef(pathname);
  const pending = useRef(false);
  useEffect(() => { path.current = pathname; pending.current = false; }, [pathname]);

  useEffect(() => {
    let touch: { x: number; y: number; axis: "x" | "y" | null } | null = null;
    let wheelDistance = 0;
    let wheelNavigated = false;
    let suppressClickUntil = 0;
    let wheelReset: ReturnType<typeof setTimeout> | undefined;
    let navigationReset: ReturnType<typeof setTimeout> | undefined;

    const eligible = (target: EventTarget | null) => {
      if (!(target instanceof Element) || target.closest(excluded)) return false;
      const surface = target.closest("[data-page-swipe-surface]");
      if (!surface || surface.closest("[aria-hidden='true'], [inert]")) return false;
      for (let node: Element | null = target; node && node !== surface; node = node.parentElement) {
        const overflow = getComputedStyle(node).overflowX;
        if ((overflow === "auto" || overflow === "scroll") && node.scrollWidth > node.clientWidth + 1) return false;
      }
      return true;
    };
    const destinationFor = (distance: number) => {
      const direction = distance > 0 ? "right" : "left";
      let destination = routes[path.current]?.[direction];
      if (path.current === "/world" && direction === "left") {
        const stored = window.sessionStorage.getItem(WORLD_ORIGIN_KEY);
        if (stored?.startsWith("/") && !stored.startsWith("//")) destination = stored;
      }
      return destination;
    };
    const navigate = (distance: number) => {
      const destination = destinationFor(distance);
      if (pending.current || !destination || destination === path.current) return false;
      pending.current = true;
      suppressClickUntil = Date.now() + 400;
      window.dispatchEvent(new CustomEvent<PageTransitionDetail>(pageTransitionEvent, {
        detail: { direction: distance > 0 ? 1 : -1, from: path.current, to: new URL(destination, window.location.origin).pathname },
      }));
      router.push(destination);
      clearTimeout(navigationReset);
      navigationReset = setTimeout(() => { pending.current = false; }, 1000);
      return true;
    };
    const onTouchStart = (event: TouchEvent) => {
      touch = event.touches.length === 1 && eligible(event.target)
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY, axis: null } : null;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!touch) return;
      if (event.defaultPrevented || event.touches.length !== 1) { touch = null; return; }
      const x = event.touches[0].clientX - touch.x;
      const y = event.touches[0].clientY - touch.y;
      if (!touch.axis && Math.max(Math.abs(x), Math.abs(y)) >= 10) {
        if (Math.abs(x) > Math.abs(y) * 1.25) touch.axis = "x";
        else if (Math.abs(y) > Math.abs(x) * 1.25) touch.axis = "y";
      }
      if (touch.axis === "x" && destinationFor(x) && event.cancelable) event.preventDefault();
    };
    const onTouchEnd = (event: TouchEvent) => {
      const start = touch;
      touch = null;
      if (!start || start.axis === "y" || event.changedTouches.length !== 1) return;
      const x = event.changedTouches[0].clientX - start.x;
      const y = event.changedTouches[0].clientY - start.y;
      if (Math.abs(x) >= 64 && Math.abs(x) > Math.abs(y) * 1.25) navigate(x);
    };
    const onTouchCancel = () => { touch = null; };
    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || !eligible(event.target)) return;
      clearTimeout(wheelReset);
      wheelReset = setTimeout(() => { wheelDistance = 0; wheelNavigated = false; }, 250);
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.25) { wheelDistance = 0; return; }
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerWidth : 1;
      const distance = -event.deltaX * scale;
      if (!destinationFor(distance)) return;
      if (event.cancelable) event.preventDefault();
      if (wheelNavigated) return;
      if (Math.sign(wheelDistance) !== Math.sign(distance)) wheelDistance = 0;
      wheelDistance += distance;
      if (Math.abs(wheelDistance) >= 64) wheelNavigated = navigate(wheelDistance);
    };
    const onClick = (event: MouseEvent) => {
      if (Date.now() < suppressClickUntil && event.detail > 0) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("click", onClick, true);
      clearTimeout(wheelReset);
      clearTimeout(navigationReset);
    };
  }, [router]);
  return null;
}
