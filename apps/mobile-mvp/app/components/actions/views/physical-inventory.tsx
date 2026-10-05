"use client";

import { useId, useState } from "react";
import { useWatcher } from "../../watcher/watcher";
import { InventoryGrid } from "./inventory-grid";
import { InventoryFloorPlan } from "./inventory-floor-plan";
import { physicalCategories, type PhysicalCategory } from "./physical-inventory-data";

export function PhysicalInventory({ items, onAddItem }: { items: string[]; onAddItem: (name: string, category?: PhysicalCategory) => void }) {
  const { physicalLocations } = useWatcher();
  const [expanded, setExpanded] = useState(false);
  const [floorPlan, setFloorPlan] = useState(true);
  const [selected, setSelected] = useState<PhysicalCategory | null>(null);
  const contentId = useId();
  const categories: PhysicalCategory[] = [...physicalCategories];
  const inCategory = (category: PhysicalCategory) => items.filter((name) => (physicalLocations[name] ?? "Miscellaneous") === category);
  if (inCategory("Miscellaneous").length) categories.push("Miscellaneous");
  const counts = Object.fromEntries(categories.map((category) => [category, inCategory(category).length]));
  const renderGrid = (category: PhysicalCategory) => <InventoryGrid label={`${category} possessions`} entryLabel={`${category.toLowerCase()} item`} items={inCategory(category)} onAddItem={(name) => onAddItem(name, category)} />;
  return <section aria-label="Physical items" className="space-y-2">
    <div className="flex items-center justify-between gap-2">
      <button type="button" aria-expanded={expanded} aria-controls={contentId} onClick={() => { if (expanded) setSelected(null); setExpanded(!expanded); }} className="flex min-h-11 min-w-0 items-center gap-2 text-left text-sm font-medium text-white/85">
        <span>Physical items</span><span aria-label={`${items.length} items`} className="text-xs tabular-nums text-white/50">{items.length}</span><svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-4 w-4 shrink-0 text-white/50 ${expanded ? "rotate-180" : ""}`}><path d="m4 6 4 4 4-4" /></svg>
      </button>
      <button type="button" aria-pressed={floorPlan} onClick={() => setFloorPlan(!floorPlan)} className="min-h-11 shrink-0 rounded-full bg-white/5 px-3 text-[10px] text-white/65 hover:bg-white/10">{floorPlan ? "Hide floor plan" : "Show floor plan"}</button>
    </div>
    <div id={contentId} hidden={!expanded && !floorPlan} className="space-y-4">
      {floorPlan && <InventoryFloorPlan counts={counts} selected={selected} allSelected={expanded} onSelect={(category) => { setSelected(category); setExpanded(false); }} />}
      {expanded ? categories.map((category) => <section key={category} aria-label={`${category} items`}>
        <h3 className="flex min-h-11 items-center justify-between gap-2 text-xs text-white/75"><span>{category}</span><span className="tabular-nums text-white/45">{counts[category]}</span></h3>
        <div className="pt-2">{renderGrid(category)}</div>
      </section>) : floorPlan && selected && <section aria-label={`${selected} items`}><h3 className="mb-3 text-xs font-medium text-white/75">{selected}<span className="ml-2 tabular-nums text-white/40">{counts[selected] ?? 0}</span></h3>{renderGrid(selected)}</section>}
    </div>
  </section>;
}
