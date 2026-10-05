"use client";

import { useLayoutEffect, useRef } from "react";
import { observeVisorClosure } from "./visor-transition";

export function ActionsBackground({ visorOpen, onVisorClosed }: { visorOpen: boolean; onVisorClosed: () => void }) {
  const surface = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (visorOpen || !surface.current) return;
    return observeVisorClosure(surface.current, onVisorClosed);
  }, [visorOpen, onVisorClosed]);

  return <div aria-hidden="true" className="actions-background pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="actions-desert-background absolute inset-0" />
    {/* A single sliding surface makes closing the exact reverse of opening,
        including when the toggle is pressed again mid-transition. */}
    <div ref={surface} className="actions-visor-background absolute inset-0" style={{ transform: visorOpen ? "translateY(-100%)" : "translateY(0)" }} />
  </div>;
}
