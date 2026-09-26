"use client";

import { useRef, useState, type PointerEvent, type RefObject } from "react";

type SplitResizeHandleProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  direction: "horizontal" | "vertical";
  label: string;
  maxRatio?: number;
  minRatio?: number;
  onRatioChange: (ratio: number) => void;
  ratio: number;
};

export function SplitResizeHandle({
  containerRef,
  direction,
  label,
  maxRatio = 75,
  minRatio = 25,
  onRatioChange,
  ratio,
}: SplitResizeHandleProps) {
  const [visible, setVisible] = useState(false);
  const dragging = useRef(false);
  const horizontal = direction === "horizontal";

  const updateFromPointer = (event: PointerEvent<HTMLButtonElement>) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const nextRatio = horizontal
      ? ((event.clientY - bounds.top) / bounds.height) * 100
      : ((event.clientX - bounds.left) / bounds.width) * 100;
    onRatioChange(Math.max(minRatio, Math.min(maxRatio, nextRatio)));
  };

  return (
    <button
      aria-label={label}
      aria-orientation={horizontal ? "horizontal" : "vertical"}
      aria-valuemax={maxRatio}
      aria-valuemin={minRatio}
      aria-valuenow={Math.round(ratio)}
      className={`absolute z-30 touch-none bg-transparent focus-visible:outline-none ${horizontal
        ? "inset-x-0 h-3 -translate-y-1/2 cursor-row-resize"
        : "inset-y-0 w-3 -translate-x-1/2 cursor-col-resize"} ${visible ? "bg-white/10" : "hover:bg-white/10"}`}
      onBlur={() => setVisible(false)}
      onClick={() => setVisible(true)}
      onKeyDown={(event) => {
        const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 5
          : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -5 : 0;
        if (!delta) return;
        event.preventDefault();
        onRatioChange(Math.max(minRatio, Math.min(maxRatio, ratio + delta)));
        setVisible(true);
      }}
      onPointerCancel={() => { dragging.current = false; setVisible(false); }}
      onPointerDown={(event) => {
        event.preventDefault();
        dragging.current = true;
        setVisible(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => { if (dragging.current) updateFromPointer(event); }}
      onPointerUp={(event) => {
        dragging.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      role="separator"
      style={horizontal ? { top: `${ratio}%` } : { left: `${ratio}%` }}
      type="button"
    >
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-opacity ${horizontal ? "h-1 w-16" : "h-16 w-1"} ${visible ? "opacity-100" : "opacity-0"}`}
      />
    </button>
  );
}
