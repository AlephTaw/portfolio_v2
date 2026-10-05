"use client";

import { useEffect, useId, useRef, useState } from "react";

export function InventoryGrid({ items, onAddItem, label = "Inventory items", entryLabel = "inventory item" }: { items: string[]; onAddItem: (name: string) => void; label?: string; entryLabel?: string }) {
  const [columns, setColumns] = useState(8);
  const grid = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const nameId = useId();

  useEffect(() => {
    const element = grid.current;
    if (!element) return;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = entry.contentRect.width;
        // Collapsed sections have zero width; keep their last valid grid layout.
        if (width <= 0) return;
        // Retain the larger tiles, with comfortable text and spacing on phones.
        const tileSize = Math.max(56, ((width - 22) / 12) * 1.5);
        const gap = 12;
        setColumns(Math.max(1, Math.floor((width + gap) / (tileSize + gap))));
      });
    });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  const slots = Math.ceil((items.length + 1) / columns) * columns;

  return <>
    <section ref={grid} aria-label={label} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {items.map((name, index) => <article key={`${name}-${index}`} className="inventory-glass-slot flex aspect-square min-w-0 items-center justify-center rounded-xl border border-white/30 px-2 text-center text-[11px] leading-4 text-white/85">
        <span lang="en" className="min-w-0 max-w-full hyphens-auto [overflow-wrap:anywhere]">{name}</span>
      </article>)}
      {Array.from({ length: slots - items.length }, (_, index) => index === 0
        ? <button key="add" type="button" aria-label={`Add ${entryLabel}`} onClick={() => dialog.current?.showModal()} className="inventory-glass-slot grid aspect-square min-h-14 min-w-0 place-items-center rounded-xl border border-dotted border-white/30 text-2xl font-light text-white/70 hover:text-white">+</button>
        : <div key={index} aria-hidden="true" className="inventory-glass-slot aspect-square rounded-xl border border-dotted border-white/20" />)}
    </section>
    <dialog ref={dialog} aria-label={`Add ${entryLabel}`} className="view-glass m-auto w-[calc(100%-2rem)] max-w-xs rounded-xl p-5 text-white backdrop:bg-black/70">
      <form onSubmit={(event) => {
        event.preventDefault();
        const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
        if (!name) return;
        onAddItem(name);
        event.currentTarget.reset();
        dialog.current?.close();
      }}>
        <label htmlFor={nameId} className="text-sm">New {entryLabel}</label>
        <input id={nameId} name="name" required maxLength={40} autoFocus className="mt-3 min-h-11 w-full rounded-lg bg-white/5 px-3 text-sm" />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => dialog.current?.close()} className="min-h-11 px-3 text-sm text-white/60">Cancel</button>
          <button type="submit" className="min-h-11 rounded-lg bg-white/10 px-4 text-sm">Add</button>
        </div>
      </form>
    </dialog>
  </>;
}
