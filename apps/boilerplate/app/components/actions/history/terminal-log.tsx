"use client";
import { useLayoutEffect, useRef } from "react";
export type TerminalEntry = { id: number; text: string };

export function TerminalLog({ entries }: { entries: TerminalEntry[] }) {
  const scroll = useRef<HTMLDivElement>(null);
  const followBottom = useRef(true);
  useLayoutEffect(() => {
    const element = scroll.current;
    if (element && followBottom.current) element.scrollTop = element.scrollHeight;
  }, [entries]);
  return <div ref={scroll} onScroll={() => {
    const element = scroll.current;
    if (element) followBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
  }} className="terminal-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-8">
    <div className="mb-8 space-y-2">
      <p className="font-mono text-xs text-white/65">Workspace ready.</p>
      <p className="max-w-sm text-xs leading-5 text-white/40">A clean starting point for your next app.</p>
      <p className="max-w-sm text-xs leading-5 text-white/30">Actions stay in this session. Connect your own features here.</p>
    </div>
    <ol aria-label="Session notes" aria-live="polite" aria-relevant="additions" className="space-y-5">
      {entries.map((entry) => <li key={entry.id} className="flex gap-3 font-mono text-xs leading-5"><span aria-hidden="true" className="text-white/30">›</span><p className="min-w-0 whitespace-pre-wrap break-words text-white/75">{entry.text}</p></li>)}
    </ol>
  </div>;
}
