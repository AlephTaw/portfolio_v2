"use client";

import { terminalCategories, type TerminalCategory } from "../terminal-categories";

export function TerminalCategoryDock({ selected, onSelect }: { selected: TerminalCategory | null; onSelect: (category: TerminalCategory) => void }) {
  return <div role="group" aria-label="Terminal categories" className="split-pane-scroll mb-2 flex justify-start gap-1 overflow-x-auto py-1 min-[400px]:justify-center min-[400px]:gap-2">
    {terminalCategories.map((category, index) => <button key={category.name} type="button" aria-label={category.name} title={category.name} aria-pressed={selected === category.name} onClick={() => onSelect(category.name)} className="group grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60">
      <span className="terminal-category-pulse" style={{ animationDelay: `${index * 90}ms` }}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 transition-transform duration-150 ease-out group-hover:scale-125 group-aria-pressed:scale-110 group-aria-pressed:group-hover:scale-125 group-focus-visible:scale-125 motion-reduce:transition-none" style={{ color: category.color }} fill="none" stroke="currentColor" strokeWidth={category.name === "Wealth" ? "2.5" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
        {category.name === "Health" && <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" fill="currentColor" stroke="none" />}
        {category.name === "Wealth" && <path d="M17.5 6.5C15.5 3.5 6 3 6 8c0 5 12 3 12 8 0 5-9.5 4.5-12 1.5M12 2.5v19" />}
        {category.name === "Sentience" && <g transform="rotate(30 12 12)"><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="12" cy="18" r="3" /><path d="M9 6h6M7.5 8.6l3 6.8m3 0 3-6.8" /></g>}
        {category.name === "Connections" && <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" /></>}
        {category.name === "Skills" && <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" fill="currentColor" stroke="none" />}
        {category.name === "Journey" && <><circle cx="5" cy="20" r="2" /><path d="M5 18v-1c0-4 13-1 13-6S6 10 6 6V2l5 2-5 2" /></>}
      </svg>
      </span>
    </button>)}
  </div>;
}
