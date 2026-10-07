"use client";

import { useContext, useEffect, useId, useRef, useState } from "react";
import { TimelineInteractionContext } from "../layouts/timeline-visibility";
import { visorResizeDelta } from "./visor-resize-gesture";

export function VisorControl({ open, visiblePercent, onToggle, onResize }: {
  open: boolean;
  visiblePercent: number;
  onToggle: () => void;
  onResize: (delta: number) => void;
}) {
  const [sizing, setSizing] = useState(false);
  const press = useRef<{ id: number; lastY: number; held: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClick = useRef(false);
  const interact = useContext(TimelineInteractionContext);
  const id = useId();
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    interact(id, false);
  }, [id, interact]);

  function finish() {
    if (timer.current) clearTimeout(timer.current);
    if (press.current?.held) suppressClick.current = true;
    press.current = null;
    setSizing(false);
    interact(id, false);
  }

  return <button type="button" aria-label={open ? "Close visor — show activity view" : "Open visor — show desert world"} aria-pressed={open}
    title={open ? "Tap to close visor. Hold and glide up/down to resize — 64px covers the full range; arrow keys also resize." : "Open visor"}
    className={`relative grid h-12 w-12 touch-none select-none place-items-center rounded-xl bg-transparent ${open ? "text-white" : "text-white/60 hover:text-white"}`}
    onContextMenu={(event) => event.preventDefault()}
    onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } onToggle(); }}
    onPointerDown={(event) => {
      suppressClick.current = false;
      if (!open || !event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      press.current = { id: event.pointerId, lastY: event.clientY, held: false };
      timer.current = setTimeout(() => {
        if (!press.current) return;
        press.current.held = true;
        suppressClick.current = true;
        setSizing(true);
        interact(id, true);
      }, 350);
    }}
    onPointerMove={(event) => {
      const current = press.current;
      if (!current || current.id !== event.pointerId) return;
      const delta = event.clientY - current.lastY;
      current.lastY = event.clientY;
      if (Math.abs(delta) > 2) suppressClick.current = true;
      if (current.held) {
        const height = event.currentTarget.closest(".actions-page")?.getBoundingClientRect().height ?? window.innerHeight;
        onResize(visorResizeDelta(delta, height));
      }
    }}
    onPointerUp={(event) => {
      if (press.current?.id !== event.pointerId) return;
      finish();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onPointerCancel={finish}
    onLostPointerCapture={() => { if (press.current) finish(); }}
    onKeyDown={(event) => {
      if (!open || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
      event.preventDefault();
      setSizing(true);
      interact(id, true);
      onResize(event.key === "ArrowUp" ? -24 : 24);
    }}
    onKeyUp={(event) => { if (event.key === "ArrowUp" || event.key === "ArrowDown") finish(); }}
    onBlur={() => { if (sizing && !press.current) finish(); }}>
    <span aria-hidden="true" className={`absolute h-9 w-9 bg-current transition-[opacity,transform] duration-150 motion-reduce:transition-none ${sizing && open ? "scale-75 opacity-0" : "scale-100 opacity-100"}`} style={{ mask: `url('/icons/${open ? "helmet" : "helmet-visor-closed"}.svg?v=2') center / contain no-repeat`, WebkitMask: `url('/icons/${open ? "helmet" : "helmet-visor-closed"}.svg?v=2') center / contain no-repeat` }} />
    <span role="progressbar" aria-label="Terminal visible height" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(visiblePercent)} aria-hidden={!sizing || !open}
      className={`absolute h-9 w-3.5 overflow-hidden border border-current bg-black/30 transition-[opacity,transform] duration-150 motion-reduce:transition-none ${sizing && open ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
      <span className="absolute inset-x-0.5 bottom-0.5 bg-current transition-[height] duration-100 motion-reduce:transition-none" style={{ height: `calc((100% - 4px) * ${visiblePercent / 100})` }} />
    </span>
  </button>;
}
