"use client";

import { useEffect, useRef, useState } from "react";
import type { ActionChoice } from "./action-space-state";

export function SceneActionChips({ actions, onRemove }: { actions: ActionChoice[]; onRemove: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(1);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisibleCount(Math.min(4, Math.max(1, Math.floor((entry.contentRect.width - 42) / 112)))));
    });
    observer.observe(container);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  const chip = (action: ActionChoice) => <span key={action.id} className="flex w-[6.75rem] min-w-0 items-center gap-1 rounded-full bg-white/10 pl-2 text-[0.65rem] text-white/75">
    <span title={action.label} className="min-w-0 flex-1 truncate">{action.label}</span>
    <button type="button" aria-label={`Remove highlighted action ${action.label}`} onClick={() => onRemove(action.id)} className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-white">×</button>
  </span>;
  const hidden = actions.slice(visibleCount);
  return <div aria-label="Highlighted scene actions" data-hidden-count={hidden.length} ref={containerRef} className="relative mt-2 flex min-w-0 items-center gap-1">
    <div className="flex min-w-0 items-center gap-1">{actions.slice(0, visibleCount).map(chip)}</div>
    {hidden.length > 0 && <details className="relative shrink-0">
      <summary aria-label={`Show ${hidden.length} more highlighted actions`} title={`${hidden.length} hidden ${hidden.length === 1 ? "action" : "actions"}`} className="flex h-6 min-w-7 cursor-pointer list-none items-center justify-center rounded-full bg-white/15 px-2 text-[0.65rem] text-white/80 focus-visible:outline focus-visible:outline-white"><span aria-live="polite" aria-atomic="true">+{hidden.length}</span></summary>
      <div className="absolute right-0 top-full z-50 mt-1 flex max-h-40 w-36 flex-col gap-1 overflow-y-auto rounded-lg border border-white/20 bg-black p-2 shadow-xl">{hidden.map(chip)}</div>
    </details>}
  </div>;
}
