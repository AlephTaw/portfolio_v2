"use client";

import { InventoryGrid } from "./inventory-grid";
import { ComponentHeading, ComponentSystems } from "../settings/component-systems";
import { useWatcher } from "../../watcher/watcher";
import { PhysicalInventory } from "./physical-inventory";
import type { PhysicalCategory } from "./physical-inventory-data";

export function InventoryView({ items, onAddItem }: { items: string[]; onAddItem: (name: string, category?: PhysicalCategory) => void }) {
  const { inventorySections, onAddInventoryEntry, componentConfigs } = useWatcher();
  const systems = [...new Set([...inventorySections.systems, ...Object.values(componentConfigs).flatMap((config) => config.systems.map((system) => system.name))])];
  const sections = [
    { name: "Apps", items: inventorySections.apps, entryLabel: "app", onAdd: (name: string) => onAddInventoryEntry("apps", name) },
    { name: "Systems", items: systems, entryLabel: "system", onAdd: (name: string) => onAddInventoryEntry("systems", name) },
  ];
  return <div className="view-glass min-h-full pb-6">
    <header className="flex h-11 items-center px-4"><ComponentHeading target="inventory" /></header>
    <ComponentSystems target="inventory" />
    <div className="space-y-4 pl-4 pr-12 pt-2 min-[768px]:px-4">{sections.map((section) => <details key={section.name} open={section.name === "Apps"} className="group/inventory-section">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white/85 [&::-webkit-details-marker]:hidden">
        <span>{section.name}</span>
        <span className="flex items-center gap-2"><span aria-label={`${section.items.length} items`} className="text-xs tabular-nums text-white/50">{section.items.length}</span><svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-white/50 group-open/inventory-section:rotate-180"><path d="m4 6 4 4 4-4" /></svg></span>
      </summary>
      <div className="pt-2"><InventoryGrid label={`${section.name} inventory`} entryLabel={section.entryLabel} items={section.items} onAddItem={section.onAdd} /></div>
    </details>)}<PhysicalInventory items={items} onAddItem={onAddItem} /></div>
  </div>;
}
