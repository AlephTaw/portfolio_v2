"use client";

import { useRef } from "react";
import { useTimelineInteraction } from "../layouts/timeline-visibility";

export function ViewAnchor({ offset, background = false, onResize, onMinimize }: { offset?: number; background?: boolean; onResize: (delta: number) => void; onMinimize: () => void }) {
  const gesture = useRef<{ id: number; x: number; y: number; lastY: number; axis: "x" | "y" | null } | null>(null);
  const interaction = useTimelineInteraction();
  return <button type="button" aria-label="Drag to resize view; swipe left to minimize" title="Drag up/down to resize. Swipe left to minimize." className={`pointer-events-auto z-30 grid h-11 w-11 cursor-row-resize touch-none select-none place-items-center ${offset === undefined ? "relative" : "absolute left-0 -translate-x-1/2 -translate-y-1/2"}`} style={offset === undefined ? undefined : { top: offset }}
    {...interaction}
    onPointerDown={(event) => {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, lastY: event.clientY, axis: null };
    }}
    onPointerMove={(event) => {
      const current = gesture.current;
      if (!current || current.id !== event.pointerId) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (current.axis === "y") { onResize(event.clientY - current.lastY); current.lastY = event.clientY; }
    }}
    onPointerUp={(event) => {
      const current = gesture.current;
      const minimize = current?.id === event.pointerId && current.axis === "x" && event.clientX - current.x < -20;
      gesture.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      if (minimize) onMinimize();
    }}
    onPointerCancel={() => { gesture.current = null; }}
    onLostPointerCapture={() => { gesture.current = null; }}
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); onMinimize(); }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); onResize(event.key === "ArrowUp" ? -24 : 24); }
    }}>
    <span aria-hidden="true" className={background ? "grid h-[18px] w-[18px] place-items-center rounded-full bg-gray-400/30 backdrop-blur-md" : undefined}><span className="block h-1.5 w-1.5 rounded-full bg-[var(--timeline-gold)]" /></span>
  </button>;
}
