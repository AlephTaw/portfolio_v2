"use client";
import { useLayoutEffect, useRef } from "react";
import type { Category } from "../navigation/bottom-navigation";
export type TerminalEntry = { id: number; text: string };

export function TerminalLog({ entries, category = null, header }: { entries: TerminalEntry[]; category?: Category | null; header?: React.ReactNode }) {
  const scroll = useRef<HTMLDivElement>(null);
  const followBottom = useRef(true);
  useLayoutEffect(() => {
    const element = scroll.current;
    if (element && followBottom.current) element.scrollTop = element.scrollHeight;
  }, [entries, category]);
  return <div ref={scroll} onScroll={() => {
    const element = scroll.current;
    if (element) followBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
  }} className="terminal-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3">
    {header ? <div className="mb-6">{header}</div> : <div className="mb-8 space-y-2 pt-5">
      <p className="font-mono text-xs text-white/65">{category ? category + " workspace ready." : "Wealth workspace ready."}</p>
      <p className="max-w-sm text-xs leading-5 text-white/40">{category ? "Add your next action below. This category is ready for future features." : "A place for your bills, deadlines, and daily earning plan."}</p>
      <p className="max-w-sm text-xs leading-5 text-white/30">{category ? "Actions and drafts are separate for each category and stay in this session." : "Select a category below to open its workspace. Terminal actions stay in this session."}</p>
    </div>}
    <ol aria-label={category ? category + " session actions" : "Session actions"} aria-live="polite" aria-relevant="additions" className="space-y-5">
      {entries.map((entry) => <li key={entry.id} className="flex gap-3 font-mono text-xs leading-5"><span aria-hidden="true" className="text-white/30">›</span><p className="min-w-0 whitespace-pre-wrap break-words text-white/75">{entry.text}</p></li>)}
    </ol>
  </div>;
}
