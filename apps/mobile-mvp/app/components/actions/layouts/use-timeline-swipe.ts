"use client";

import { useEffect, type RefObject } from "react";
import { getTimelineSwipeDirection } from "./swipe-gesture";

type Gesture = { id: number; x: number; y: number; horizontal: boolean; completed: boolean };
const editingOrResizing = (target: EventTarget | null) => target instanceof Element && !!target.closest('input, textarea, select, [contenteditable="true"], button[aria-label^="Drag to resize"]');

export function useTimelineSwipe(root: RefObject<HTMLDivElement | null>, reveal: () => void, conceal: () => void) {
  useEffect(() => {
    const page = root.current?.closest(".actions-page");
    if (!page) return;
    let pointer: Gesture | null = null;
    let touch: Gesture | null = null;
    let wheel = { x: 0, y: 0, last: 0, completed: false };
    const apply = (dx: number, dy: number) => {
      const direction = getTimelineSwipeDirection(dx, dy);
      if (direction === "reveal") reveal();
      if (direction === "hide") conceal();
      return direction !== null;
    };
    const down = (event: Event) => {
      const input = event as PointerEvent;
      if (input.pointerType === "touch" || !input.isPrimary || input.button !== 0 || editingOrResizing(input.target)) return;
      pointer = { id: input.pointerId, x: input.clientX, y: input.clientY, horizontal: false, completed: false };
    };
    const move = (event: Event) => {
      const input = event as PointerEvent;
      if (input.pointerType !== "touch" && input.buttons !== 1) { pointer = null; return; }
      if (!pointer || pointer.completed || pointer.id !== input.pointerId) return;
      pointer.completed = apply(input.clientX - pointer.x, input.clientY - pointer.y);
    };
    const end = () => { pointer = null; };
    // Touch events remain available on mobile browsers that hand pointer events
    // to native scrolling. Cancel only a clearly horizontal gesture; leave
    // vertical scrolling, multi-touch zoom, editing and resize dots untouched.
    const touchStart = (event: Event) => {
      const input = event as TouchEvent;
      touch = null;
      if (input.touches.length !== 1 || editingOrResizing(input.target)) return;
      const finger = input.touches[0];
      touch = { id: finger.identifier, x: finger.clientX, y: finger.clientY, horizontal: false, completed: false };
    };
    const touchMove = (event: Event) => {
      const input = event as TouchEvent;
      if (!touch || input.touches.length !== 1) return;
      const finger = Array.from(input.touches).find((item) => item.identifier === touch!.id);
      if (!finger) return;
      const dx = finger.clientX - touch.x;
      const dy = finger.clientY - touch.y;
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) touch.horizontal = true;
      if (touch.horizontal && input.cancelable) input.preventDefault();
      if (!touch.completed) touch.completed = apply(dx, dy);
    };
    const touchEnd = () => { touch = null; };
    // Trackpad swipes arrive as horizontal wheel events, not pointer drags.
    // Negative scroll deltas mean the content/fingers move right (reveal).
    const wheelMove = (event: Event) => {
      const input = event as WheelEvent;
      if (input.ctrlKey || editingOrResizing(input.target) || Math.abs(input.deltaX) <= Math.abs(input.deltaY)) return;
      if (input.cancelable) input.preventDefault();
      const now = performance.now();
      if (now - wheel.last > 180 || (wheel.x !== 0 && Math.sign(-input.deltaX) !== Math.sign(wheel.x))) wheel = { x: 0, y: 0, last: now, completed: false };
      wheel.last = now;
      if (wheel.completed) return;
      const unit = input.deltaMode === 1 ? 16 : input.deltaMode === 2 ? window.innerWidth : 1;
      wheel.x -= input.deltaX * unit;
      wheel.y -= input.deltaY * unit;
      wheel.completed = apply(wheel.x, wheel.y);
    };
    const handlers = [["pointerdown", down], ["pointermove", move], ["pointerup", end], ["pointercancel", end], ["touchstart", touchStart], ["touchmove", touchMove], ["touchend", touchEnd], ["touchcancel", touchEnd], ["wheel", wheelMove]] as const;
    for (const [name, handler] of handlers) page.addEventListener(name, handler, { capture: true, passive: name !== "touchmove" && name !== "wheel" });
    return () => { for (const [name, handler] of handlers) page.removeEventListener(name, handler, true); };
  }, [root, reveal, conceal]);
}
