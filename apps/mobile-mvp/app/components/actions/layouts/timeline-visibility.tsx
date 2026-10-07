"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type FocusEvent, type PointerEvent } from "react";

export const TimelineInteractionContext = createContext<(source: string, active: boolean, persist?: boolean) => void>(() => {});
export const TimelineVisibilityContext = createContext(false);

export function useTimelineVisibility() {
  const [visible, setVisible] = useState(false);
  const sources = useRef(new Set<string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinned = useRef(false);
  const interact = useCallback((source: string, active: boolean, persist = false) => {
    if (timer.current) clearTimeout(timer.current);
    if (active && persist) pinned.current = true;
    if (active) {
      sources.current.add(source);
      setVisible(true);
    } else {
      sources.current.delete(source);
      if (!sources.current.size && !pinned.current) timer.current = setTimeout(() => { if (!pinned.current) setVisible(false); }, 650);
    }
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const reveal = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    pinned.current = true;
    setVisible(true);
  }, []);
  const conceal = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    pinned.current = false;
    sources.current.clear();
    setVisible(false);
  }, []);
  return { visible, interact, reveal, conceal };
}

// Separate hover, captured gesture and keyboard focus: leaving a control while
// dragging must not hide the timeline until that gesture actually finishes.
export function useTimelineInteraction() {
  const interact = useContext(TimelineInteractionContext);
  const id = useId();
  useEffect(() => () => {
    for (const kind of ["hover", "gesture", "focus"]) interact(`${id}:${kind}`, false);
  }, [id, interact]);
  return {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => { if (event.pointerType !== "touch") interact(`${id}:hover`, true); },
    onPointerLeave: () => interact(`${id}:hover`, false),
    onPointerDownCapture: (event: PointerEvent<HTMLElement>) => {
      if (!event.isPrimary || event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      interact(`${id}:gesture`, true);
    },
    onPointerUpCapture: () => interact(`${id}:gesture`, false),
    onPointerCancelCapture: () => interact(`${id}:gesture`, false),
    onLostPointerCaptureCapture: () => interact(`${id}:gesture`, false),
    onFocus: (event: FocusEvent<HTMLElement>) => { if (event.target.matches(":focus-visible")) interact(`${id}:focus`, true); },
    onKeyDownCapture: () => interact(`${id}:focus`, true),
    onBlur: () => interact(`${id}:focus`, false),
  };
}

export function TimelineRevealTarget() {
  const interaction = useTimelineInteraction();
  return <button type="button" aria-label="Reveal activity timeline" {...interaction} className="timeline-reveal-target absolute -left-6 top-0 z-30 h-[calc(100%-68px-env(safe-area-inset-bottom))] w-6 touch-pan-y bg-transparent outline-none sm:h-full" />;
}
