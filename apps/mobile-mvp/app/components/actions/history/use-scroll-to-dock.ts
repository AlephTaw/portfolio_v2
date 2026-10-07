"use client";

import { useContext, useId, useLayoutEffect, useRef, type RefObject } from "react";
import { TimelineInteractionContext, TimelineVisibilityContext } from "../layouts/timeline-visibility";
import { advanceDockIntent, emptyDockIntent, isDockDirection, WHEEL_GESTURE_IDLE_MS } from "./scroll-dock-gesture";
import { dockPreviewGeometry } from "./dock-preview-geometry";

/** Horizontal docking is deliberately separate from feed scrolling: reversing cancels
 * the preview, and only a completed gesture archives the live app. */
export function useScrollToDock({ viewport, app, visual, hint, history, slot, enabled, category, clearance, onDock }: {
  viewport: RefObject<HTMLDivElement | null>;
  app: RefObject<HTMLDivElement | null>;
  visual: RefObject<HTMLDivElement | null>;
  hint: RefObject<HTMLDivElement | null>;
  history: RefObject<HTMLDivElement | null>;
  slot: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  category: string | null;
  clearance: number;
  onDock: () => void;
}) {
  const timelineVisible = useContext(TimelineVisibilityContext);
  const interact = useContext(TimelineInteractionContext);
  const interactionId = useId();
  const ownsPreview = useRef(false);
  const visibility = useRef(timelineVisible);
  const cancelPreview = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    visibility.current = timelineVisible;
    // Our own reveal belongs to the docking gesture. An explicit hide cancels
    // it, while a separately revealed timeline still blocks new docking.
    if ((timelineVisible && !ownsPreview.current) || (!timelineVisible && ownsPreview.current)) cancelPreview.current?.();
  }, [timelineVisible]);
  const callback = useRef(onDock);
  useLayoutEffect(() => { callback.current = onDock; }, [onDock]);
  const clearanceRef = useRef(clearance);
  useLayoutEffect(() => { clearanceRef.current = clearance; }, [clearance]);

  useLayoutEffect(() => {
    const root = viewport.current;
    const frame = app.current;
    const screen = visual.current;
    const label = hint.current;
    const log = history.current;
    const destination = slot.current;
    if (!enabled || !category || !root || !frame || !screen || !label || !log || !destination) return;
    let distance = 0;
    let started = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let touchY: number | null = null;
    let touchX = 0;
    let touchAllowed = false;
    let pointer: { id: number; x: number; y: number; allowed: boolean } | null = null;
    let wheelLast = -Infinity;
    let wheelAllowed = false;
    let suppressClick = false;
    let intent = emptyDockIntent();
    let verticalTravel = 0;
    let sourceTop = 0;
    let sourceHeight = 0;
    let sourceWidth = 0;
    let destinationTop = 0;
    let renderFrame = 0;
    let displayed = 0;
    let lastRender = 0;
    let travel = 0;
    let originalScroll: number | null = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reset = (restoreScroll = true) => {
      clearTimeout(timer);
      cancelAnimationFrame(renderFrame);
      renderFrame = 0;
      distance = 0;
      displayed = 0;
      intent = emptyDockIntent();
      verticalTravel = 0;
      screen.style.transform = "";
      screen.style.maxHeight = "";
      screen.style.height = "";
      screen.style.overflow = "";
      screen.style.pointerEvents = "";
      screen.style.width = "";
      screen.style.willChange = "";
      frame.style.height = "";
      frame.style.position = "";
      frame.style.zIndex = "";
      destination.style.display = "";
      log.style.transform = "";
      log.style.opacity = "";
      log.style.pointerEvents = "";
      if (restoreScroll && originalScroll !== null) root.scrollTop = originalScroll;
      originalScroll = null;
      label.style.opacity = "0";
      label.textContent = "";
      frame.removeAttribute("data-docking-progress");
      ownsPreview.current = false;
      interact(interactionId, false);
    };
    cancelPreview.current = reset;
    const render = (now: number) => {
      renderFrame = 0;
      const elapsed = lastRender ? Math.min(64, now - lastRender) : 16;
      lastRender = now;
      displayed += (distance - displayed) * (1 - Math.exp(-elapsed / 35));
      if (Math.abs(distance - displayed) < 0.1) displayed = distance;
      const progress = displayed / travel;
      const geometry = dockPreviewGeometry(progress, sourceWidth, sourceHeight, sourceTop, destinationTop);
      // Keep the existing history readable alongside the shrinking screen,
      // then converge onto the slot's shared left edge (zero X at either end).
      screen.style.transform = reducedMotion ? "" : `translate(${geometry.x}px, ${geometry.y}px) scale(${geometry.scale})`;
      screen.style.maxHeight = reducedMotion ? "" : `${geometry.height}px`;
      screen.style.height = reducedMotion ? "" : `${geometry.height}px`;
      log.style.opacity = `${Math.min(1, progress * 5)}`;
      frame.dataset.dockingProgress = progress.toFixed(3);
      label.style.opacity = "1";
      label.textContent = distance === travel ? "Docking… reverse to cancel" : `Minimizing ${Math.round(progress * 100)}% · reverse to keep open`;
      if (displayed !== distance) renderFrame = requestAnimationFrame(render);
    };
    const move = (delta: number) => {
      if (!distance && delta <= 0) return false;
      clearTimeout(timer);
      if (!distance) {
        started = performance.now();
        frame.dataset.dockingProgress = "0";
        sourceTop = screen.getBoundingClientRect().top - root.getBoundingClientRect().top;
        sourceHeight = screen.scrollHeight;
        sourceWidth = frame.clientWidth;
        travel = Math.max(120, Math.min(240, root.clientWidth * 0.55));
        frame.style.height = `${frame.getBoundingClientRect().height}px`;
        frame.style.position = "relative";
        frame.style.zIndex = "1";
        originalScroll = root.scrollTop;
        const appTop = frame.getBoundingClientRect().top;
        destination.style.display = "flex";
        // Keep the live app still while reserving its final history row.
        root.scrollTop += frame.getBoundingClientRect().top - appTop;
        const bounds = root.getBoundingClientRect();
        const shift = bounds.top + root.clientHeight - clearanceRef.current - log.getBoundingClientRect().bottom;
        log.style.transform = `translateY(${shift}px)`;
        log.style.opacity = "0";
        log.style.pointerEvents = "none";
        destinationTop = destination.getBoundingClientRect().top + 12 - bounds.top;
        screen.style.width = `${sourceWidth}px`;
        screen.style.overflow = "hidden";
        screen.style.pointerEvents = "none";
        screen.style.willChange = "transform";
        ownsPreview.current = true;
        interact(interactionId, true);
        lastRender = 0;
      }
      // Reachable on mobile, yet long enough to preview and reverse the swipe.
      distance = Math.max(0, Math.min(travel, distance + delta));
      if (!distance) { reset(); return true; }
      if (!renderFrame) renderFrame = requestAnimationFrame(render);
      if (distance === travel && touchY === null && pointer === null) {
        // A brief reversible hold also prevents an accidental fast flick from
        // committing before the user has seen the destination.
        timer = setTimeout(() => {
          // Keep the completed history visible until an explicit hide swipe;
          // collapsing its gutter here would move the newly landed thumbnail.
          interact(interactionId, true, true);
          reset(false);
          callback.current();
        }, Math.max(450, 900 - (performance.now() - started)));
      }
      return true;
    };
    const horizontal = (x: number, y: number, allowed: boolean) => {
      if (!allowed) { if (distance) reset(); return false; }
      // Once armed, tiny/noisy packets must not repeatedly reset the preview.
      if (distance) {
        if (x !== 0 && Math.abs(x) >= Math.abs(y) * 0.5) {
          verticalTravel = 0;
          return move(-x);
        }
        verticalTravel += Math.abs(y);
        if (verticalTravel < 28) return true;
        reset();
        return false;
      }
      intent = advanceDockIntent(intent, x, y, performance.now(), allowed);
      if (!isDockDirection(x, y)) {
        // Switching to ordinary vertical scrolling cancels any pending commit.
        if (distance) reset();
        return false;
      }
      if (intent.armed) return move(-x);
      // Reserve only clearly horizontal travel while intent builds.
      return true;
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) { reset(); return; }
      const now = performance.now();
      if (now - wheelLast > WHEEL_GESTURE_IDLE_MS) wheelAllowed = !visibility.current;
      wheelLast = now;
      if (!distance && editing(event.target)) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? root.clientWidth : 1;
      // Browser scroll deltas oppose finger motion, matching timeline swipes.
      if (horizontal(-event.deltaX * unit, -event.deltaY * unit, wheelAllowed) && event.cancelable) event.preventDefault();
    };
    const start = (event: TouchEvent) => {
      clearTimeout(timer);
      intent = emptyDockIntent();
      touchAllowed = !visibility.current && !editing(event.target);
      if (event.touches.length !== 1) { touchY = null; reset(); return; }
      touchY = event.touches[0].clientY;
      touchX = event.touches[0].clientX;
    };
    const touch = (event: TouchEvent) => {
      if (touchY === null || event.touches.length !== 1) return;
      const point = event.touches[0];
      const delta = point.clientY - touchY;
      const left = point.clientX - touchX;
      touchY = point.clientY;
      touchX = point.clientX;
      if (!event.cancelable) { reset(); return; }
      if (horizontal(left, delta, touchAllowed)) event.preventDefault();
    };
    const end = () => { touchY = null; if (distance) move(0); };
    const cancel = () => { touchY = null; reset(); };
    const down = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !event.isPrimary || event.button !== 0 || editing(event.target)) return;
      // Mouse swipes manipulate the app surface, not text/image selection.
      event.preventDefault();
      clearTimeout(timer);
      intent = emptyDockIntent();
      suppressClick = false;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, allowed: !visibility.current };
    };
    const drag = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId || event.buttons !== 1) return;
      const x = event.clientX - pointer.x, y = event.clientY - pointer.y;
      pointer.x = event.clientX; pointer.y = event.clientY;
      if (horizontal(x, y, pointer.allowed)) {
        suppressClick = true;
        event.preventDefault();
        root.setPointerCapture(event.pointerId);
      }
    };
    const release = () => { pointer = null; if (distance) move(0); };
    const pointerCancel = () => { pointer = null; reset(); };
    const click = (event: MouseEvent) => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; } };
    const nativeDrag = (event: DragEvent) => { if (pointer) event.preventDefault(); };
    root.addEventListener("wheel", wheel, { passive: false });
    root.addEventListener("touchstart", start, { passive: true });
    root.addEventListener("touchmove", touch, { passive: false });
    root.addEventListener("touchend", end);
    root.addEventListener("touchcancel", cancel);
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", drag);
    root.addEventListener("pointerup", release);
    root.addEventListener("pointercancel", pointerCancel);
    root.addEventListener("click", click, true);
    root.addEventListener("dragstart", nativeDrag);
    return () => {
      reset();
      cancelPreview.current = null;
      root.removeEventListener("wheel", wheel);
      root.removeEventListener("touchstart", start);
      root.removeEventListener("touchmove", touch);
      root.removeEventListener("touchend", end);
      root.removeEventListener("touchcancel", cancel);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", drag);
      root.removeEventListener("pointerup", release);
      root.removeEventListener("pointercancel", pointerCancel);
      root.removeEventListener("click", click, true);
      root.removeEventListener("dragstart", nativeDrag);
    };
  }, [viewport, app, visual, hint, history, slot, enabled, category, interact, interactionId]);
}

const editing = (target: EventTarget | null) => target instanceof Element && !!target.closest('input, textarea, select, [contenteditable="true"], button');
