"use client";

import type { PointerEvent, ReactNode, WheelEvent } from "react";
import { useRef } from "react";

type DragScrollPaneProps = {
  children: ReactNode;
  className?: string;
};

export function DragScrollPane({
  children,
  className = "",
}: DragScrollPaneProps) {
  const paneRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({
    dragging: false,
    pressed: false,
    pointerId: -1,
    startScrollTop: 0,
    startY: 0,
  });

  function endDrag(pointerId: number) {
    const pane = paneRef.current;
    if (!pane) {
      return;
    }

    dragState.current.dragging = false;
    dragState.current.pressed = false;
    dragState.current.pointerId = -1;
    pane.style.cursor = "";
    pane.style.userSelect = "";

    if (pane.hasPointerCapture(pointerId)) {
      pane.releasePointerCapture(pointerId);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        'button, a, input, textarea, select, [role="button"], [data-no-drag-scroll="true"]',
      )
    ) {
      return;
    }

    const pane = paneRef.current;
    if (!pane) {
      return;
    }

    dragState.current = {
      dragging: false,
      pressed: true,
      pointerId: event.pointerId,
      startScrollTop: pane.scrollTop,
      startY: event.clientY,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const pane = paneRef.current;
    const state = dragState.current;

    if (!pane || state.pointerId !== event.pointerId || !state.pressed) {
      return;
    }

    const deltaY = event.clientY - state.startY;

    if (!state.dragging) {
      if (Math.abs(deltaY) < 6) {
        return;
      }

      state.dragging = true;
      pane.setPointerCapture(event.pointerId);
      pane.style.cursor = "grabbing";
      pane.style.userSelect = "none";
    }

    pane.scrollTop = state.startScrollTop - deltaY;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragState.current.pointerId !== event.pointerId) {
      return;
    }

    endDrag(event.pointerId);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const pane = paneRef.current;
    if (!pane) {
      return;
    }

    event.preventDefault();
    pane.scrollTop += event.deltaY;
  }

  return (
    <div
      className={`pane-scroll overflow-y-auto overscroll-contain touch-pan-y ${className}`.trim()}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      ref={paneRef}
    >
      {children}
    </div>
  );
}
