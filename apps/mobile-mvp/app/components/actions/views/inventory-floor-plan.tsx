import { physicalCategories, type PhysicalCategory } from "./physical-inventory-data";

export function InventoryFloorPlan({ counts, selected, allSelected = false, onSelect }: { counts: Record<string, number>; selected: PhysicalCategory | null; allSelected?: boolean; onSelect: (category: PhysicalCategory) => void }) {
  const isSelected = (category: PhysicalCategory) => allSelected || selected === category;
  return <section aria-label="Inventory floor plan" className="space-y-3">
    <p className="text-[11px] leading-5 text-white/45">Illustrative layout · not to scale. Select an area to see its items. Groceries is grouped within Kitchen as pantry and food storage.</p>
    <div className="grid gap-1 bg-black/20" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridTemplateAreas: '"office kitchen kitchen" "bathroom kitchen kitchen" "bedroom closet storage" "garage garage garage"' }}>
      <section aria-label="Kitchen area" style={{ gridArea: "kitchen" }} className={`flex min-w-0 flex-col border p-2 ${isSelected("Kitchen") || isSelected("Groceries") ? "border-white/60" : "border-white/20"}`}>
        <button type="button" aria-pressed={isSelected("Kitchen")} onClick={() => onSelect("Kitchen")} className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${isSelected("Kitchen") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`}>
          <span>Kitchen</span><span className="text-[10px] tabular-nums text-white/40">{counts.Kitchen ?? 0} items</span>
        </button>
        <button type="button" aria-pressed={isSelected("Groceries")} onClick={() => onSelect("Groceries")} className={`mt-2 flex min-h-16 flex-col items-center justify-center gap-1 border px-2 py-2 text-[11px] transition-colors ${isSelected("Groceries") ? "border-white/60 bg-white/10 text-white" : "border-white/25 text-white/70 hover:bg-white/5"}`}>
          <span>Groceries</span><span className="text-[10px] tabular-nums text-white/40">{counts.Groceries ?? 0} items</span>
        </button>
      </section>
      {physicalCategories.filter((category) => category !== "Kitchen" && category !== "Groceries").map((category) => <button key={category} type="button" aria-pressed={isSelected(category)} onClick={() => onSelect(category)} style={{ gridArea: category.toLowerCase() }} className={`flex min-h-20 min-w-0 flex-col items-center justify-center gap-1 border px-1 py-3 text-center text-[11px] transition-colors ${isSelected(category) ? "border-white/60 bg-white/10 text-white" : "border-white/20 text-white/70 hover:bg-white/5"}`}>
        <span>{category}</span><span className="text-[10px] tabular-nums text-white/40">{counts[category] ?? 0} items</span>
      </button>)}
    </div>
    {!!counts.Miscellaneous && <button type="button" aria-pressed={isSelected("Miscellaneous")} onClick={() => onSelect("Miscellaneous")} className={`min-h-11 rounded-lg px-2 text-xs ${isSelected("Miscellaneous") ? "bg-white/10 text-white" : "text-white/65"}`}>Miscellaneous · {counts.Miscellaneous}</button>}
  </section>;
}
