"use client";
export type Category = "Wealth" | "Health" | "Skills" | "Sentience" | "Connections" | "Journey";
const categories: Category[] = ["Wealth", "Health", "Skills", "Sentience", "Connections", "Journey"];
const colors: Record<Category, string> = { Wealth: "text-green-400", Health: "text-red-400", Skills: "text-yellow-400", Sentience: "text-blue-400", Connections: "text-orange-400", Journey: "text-fuchsia-400" };

export function BottomNavigation({ activeCategory, onSelect }: { activeCategory: Category | null; onSelect: (category: Category) => void }) {
  return <nav aria-label="Main navigation" className="actions-icon-dock grid grid-cols-6 items-center px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 sm:mx-auto sm:mb-3 sm:w-[360px] sm:rounded-xl">
    {categories.map((category) => <button key={category} type="button" aria-label={category} aria-pressed={activeCategory === category} onClick={() => onSelect(category)}
      className={"flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg transition-colors " + (activeCategory === category ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5")}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className={"h-5 w-5 " + colors[category]} fill="none" stroke="currentColor" strokeWidth={category === "Wealth" ? "2.5" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
        {category === "Wealth" && <path d="M17.5 6.5C15.5 3.5 6 3 6 8c0 5 12 3 12 8 0 5-9.5 4.5-12 1.5M12 2.5v19" />}
        {category === "Health" && <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" fill="currentColor" stroke="none" />}
        {category === "Skills" && <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" fill="currentColor" stroke="none" />}
        {category === "Sentience" && <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="12" cy="18" r="3" /><path d="M9 6h6M7.5 8.6l3 6.8m3 0 3-6.8" /></>}
        {category === "Connections" && <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" /></>}
        {category === "Journey" && <><circle cx="5" cy="20" r="2" /><path d="M5 18v-1c0-4 13-1 13-6S6 10 6 6V2l5 2-5 2" /></>}
      </svg>
      <span className="text-[9px]">{category}</span>
    </button>)}
  </nav>;
}
