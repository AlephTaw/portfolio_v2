"use client";

import { useTimelineInteraction } from "../layouts/timeline-visibility";

export function SettingsButton({ active, onClick, hidden = false, className = "", timeline = false }: { active: boolean; onClick: () => void; hidden?: boolean; className?: string; timeline?: boolean }) {
  const interaction = useTimelineInteraction();
  return <button hidden={hidden} {...interaction} type="button" aria-label="Settings" aria-pressed={active} onClick={onClick} className={`pointer-events-auto grid h-12 w-12 place-items-center ${active ? "text-white" : "text-white/60 hover:text-white"} ${className}`}>
    <span className={timeline ? "timeline-settings-surface grid h-9 w-9 place-items-center rounded-full bg-gray-400/30 backdrop-blur-md" : "contents"}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className={timeline ? "h-5 w-5" : "h-9 w-9"} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-.7 2.3-2 .9L5 5.6 3 9l1.6 1.7v2.6L3 15l2 3.4 2.3-.6 2 .9L10 21h4l.7-2.3 2-.9 2.3.6 2-3.4-1.6-1.7v-2.6L21 9l-2-3.4-2.3.6-2-.9L14 3Z" /><circle cx="12" cy="12" r="3" /></svg>
    </span>
  </button>;
}
