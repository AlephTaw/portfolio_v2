"use client";

import { useRef } from "react";
import type { ActionChoice } from "./action-space-state";

export function ScenarioActionItem({ action, index, dragEnabled, onSelect, onDrag, onDrop }: {
  action: ActionChoice;
  index: number;
  dragEnabled: boolean;
  onSelect: () => void;
  onDrag: (action: ActionChoice | null, x: number, y: number) => void;
  onDrop: (action: ActionChoice, x: number, y: number) => void;
}) {
  const gesture = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  return <button type="button" className={`h-full w-full border-l border-white bg-white/10 px-1.5 py-1.5 text-left text-[0.6rem] leading-snug text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-white sm:text-xs ${dragEnabled ? "touch-none cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
    onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } onSelect(); }}
    onPointerDown={(event) => {
      if (!dragEnabled || event.button !== 0) return;
      suppressClick.current = false;
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={(event) => {
      const current = gesture.current;
      if (!current || current.id !== event.pointerId) return;
      if (!current.dragging && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6) return;
      current.dragging = true;
      suppressClick.current = true;
      onDrag(action, event.clientX, event.clientY);
    }}
    onPointerUp={(event) => {
      const current = gesture.current;
      if (!current || current.id !== event.pointerId) return;
      gesture.current = null;
      if (current.dragging) onDrop(action, event.clientX, event.clientY);
      onDrag(null, 0, 0);
    }}
    onPointerCancel={() => { gesture.current = null; onDrag(null, 0, 0); }}
    onLostPointerCapture={() => { if (gesture.current) { gesture.current = null; onDrag(null, 0, 0); } }}
  >
    <span className="mb-1 block text-[0.5rem] text-white/50">{String(index + 1).padStart(2, "0")}</span>
    <span className="break-words">{action.label}</span>
  </button>;
}
