"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { pageTransitionEvent, type PageTransitionDetail } from "./page-transition-events";

const SWIPE_THRESHOLD = 64;
const WHEEL_RESET_MS = 180;
const INTERACTIVE_SELECTOR =
  "input, textarea, select, button, a, [contenteditable='true'], [role='dialog']";

export function PageSwipeNavigation({
  direction,
  href,
  hrefStorageKey,
  transitionDirection,
  allowInteractiveTargets = false,
  captureHorizontalGesture = false,
  scopeSelector,
}: {
  direction: "left" | "right";
  href: string;
  hrefStorageKey?: string;
  transitionDirection?: -1 | 1;
  allowInteractiveTargets?: boolean;
  captureHorizontalGesture?: boolean;
  scopeSelector?: string;
}) {
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wheelDistance = useRef({ x: 0, y: 0 });
  const wheelReset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigating = useRef(false);

  useEffect(() => {
    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));

    const navigate = () => {
      if (navigating.current) return;
      navigating.current = true;
      const storedHref = hrefStorageKey
        ? window.sessionStorage.getItem(hrefStorageKey)
        : null;
      const destination = storedHref?.startsWith("/") ? storedHref : href;
      const destinationPath = new URL(destination, window.location.origin).pathname;
      window.dispatchEvent(
        new CustomEvent<PageTransitionDetail>(pageTransitionEvent, {
          detail: {
            direction: transitionDirection ?? (direction === "right" ? 1 : -1),
            from: window.location.pathname,
            to: destinationPath,
          },
        }),
      );
      router.push(destination);
    };

    const matchesDirection = (distance: number) =>
      direction === "right" ? distance > SWIPE_THRESHOLD : distance < -SWIPE_THRESHOLD;

    const onTouchStart = (event: TouchEvent) => {
      if (scopeSelector && !(event.target instanceof Element && event.target.closest(scopeSelector))) {
        touchStart.current = null;
        return;
      }
      if (event.touches.length !== 1 || (!allowInteractiveTargets && isInteractive(event.target))) {
        touchStart.current = null;
        return;
      }

      touchStart.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    };

    const onTouchEnd = (event: TouchEvent) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start || event.changedTouches.length !== 1) return;

      const deltaX = event.changedTouches[0].clientX - start.x;
      const deltaY = event.changedTouches[0].clientY - start.y;
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.25 && matchesDirection(deltaX)) {
        navigate();
      }
    };

    const resetWheel = () => {
      wheelDistance.current = { x: 0, y: 0 };
    };

    const onWheel = (event: WheelEvent) => {
      if (scopeSelector && !(event.target instanceof Element && event.target.closest(scopeSelector))) return;
      if (
        (!allowInteractiveTargets && isInteractive(event.target)) ||
        Math.abs(event.deltaX) <= Math.abs(event.deltaY)
      ) return;
      if (captureHorizontalGesture) event.preventDefault();

      wheelDistance.current.x += event.deltaX;
      wheelDistance.current.y += event.deltaY;

      if (wheelReset.current) clearTimeout(wheelReset.current);
      wheelReset.current = setTimeout(resetWheel, WHEEL_RESET_MS);

      // Trackpad deltas describe content movement, which is opposite the finger gesture.
      const fingerDistance = -wheelDistance.current.x;
      if (
        Math.abs(wheelDistance.current.x) > Math.abs(wheelDistance.current.y) * 1.25 &&
        matchesDirection(fingerDistance)
      ) {
        resetWheel();
        navigate();
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: !captureHorizontalGesture });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      if (wheelReset.current) clearTimeout(wheelReset.current);
    };
  }, [allowInteractiveTargets, captureHorizontalGesture, direction, href, hrefStorageKey, router, scopeSelector, transitionDirection]);

  return null;
}
