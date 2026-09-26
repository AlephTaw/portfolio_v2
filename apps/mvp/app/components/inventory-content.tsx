"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { FiBox, FiShoppingBag, FiX } from "react-icons/fi";
import { StoreContent } from "./bounty-board";

const inventoryRooms = ["Kitchen", "Bathroom", "Bedroom", "Closet", "Pantry", "Office"] as const;
type InventoryRoom = (typeof inventoryRooms)[number];
type InventorySection = "inventory" | "store";
type MockInventoryItem = { name: string; description: string };

const mockInventoryItems: Record<InventoryRoom, readonly MockInventoryItem[]> = {
  Kitchen: [
    { name: "Water Bottle", description: "A reusable bottle reserved for daily route hydration." },
    { name: "Meal Kit", description: "A compact prepared meal for an active shift." },
  ],
  Bathroom: [
    { name: "First Aid Kit", description: "Basic supplies for minor injuries and roadside treatment." },
    { name: "Hygiene Kit", description: "Travel-size personal care essentials packed for quick access." },
  ],
  Bedroom: [
    { name: "Field Blanket", description: "A lightweight insulated blanket for rest between routes." },
    { name: "Sleep Mask", description: "A blackout mask used to protect recovery time." },
  ],
  Closet: [
    { name: "Rain Jacket", description: "A weatherproof outer layer for wet driving conditions." },
    { name: "Work Boots", description: "Durable boots with reinforced grip and toe protection." },
  ],
  Pantry: [
    { name: "Protein Bars", description: "Shelf-stable fuel for long sessions away from base." },
    { name: "Electrolytes", description: "Single-serve hydration mix for sustained activity." },
  ],
  Office: [
    { name: "Route Atlas", description: "A marked reference of primary and alternate travel routes." },
    { name: "Field Notes", description: "Operational notes, observations, and route adjustments." },
  ],
};

export function InventoryContent() {
  const [inventorySection, setInventorySection] = useState<InventorySection>("inventory");
  const [selectedItem, setSelectedItem] = useState<{ item: MockInventoryItem; room: InventoryRoom; slot: number } | null>(null);
  const layoutId = useId();

  useEffect(() => {
    if (!selectedItem) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedItem]);

  return (
    <section aria-label="Inventory" className="w-full">
      <div className="flex w-full items-center justify-end gap-3">
        <h2 className="sr-only">{inventorySection}</h2>
        <span className="grid size-5 shrink-0 place-items-center text-white/55">
          {inventorySection === "inventory" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" aria-hidden="true" className="h-5 w-auto shrink-0" src="/shelf.svg" />
          ) : <FiShoppingBag aria-hidden="true" className="size-5 shrink-0" />}
        </span>
        <div aria-label="Inventory views" className="flex shrink-0 items-center rounded-full border border-white/35 p-0.5" role="group">
          {(["inventory", "store"] as const).map((section) => (
            <button
              aria-pressed={inventorySection === section}
              className={`relative cursor-pointer rounded-full px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.1em] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${inventorySection === section ? "text-black" : "text-white/55 hover:text-white"}`}
              key={section}
              onClick={() => setInventorySection(section)}
              type="button"
            >
              {inventorySection === section && <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-white" layoutId={`${layoutId}-inventory-section-fill`} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} />}
              <span className="relative z-10">{section === "inventory" ? "Items" : "Store"}</span>
            </button>
          ))}
        </div>
      </div>

      {inventorySection === "inventory" ? (
        <div aria-label="Inventory items" role="region">
          <div className="mt-4 grid min-h-64 w-full grid-cols-6 grid-rows-4 border border-white/30 bg-white/[0.02] text-center text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/55">
            <div className="col-span-4 row-span-2 grid place-items-center border-b border-r border-white/25">Kitchen</div>
            <div className="col-span-2 grid place-items-center border-b border-white/25">Pantry</div>
            <div className="col-span-2 grid place-items-center border-b border-white/25">Bathroom</div>
            <div className="col-span-3 row-span-2 grid place-items-center border-r border-white/25">Bedroom</div>
            <div className="row-span-2 grid place-items-center border-r border-white/25">Closet</div>
            <div className="col-span-2 row-span-2 grid place-items-center">Office</div>
          </div>
          <div className="mt-8 divide-y divide-white/20 border-x border-white/20">
            {inventoryRooms.map((room) => (
              <section aria-labelledby={`inventory-${room.toLowerCase()}`} className="px-4 py-6 sm:px-6" key={room}>
                <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/55" id={`inventory-${room.toLowerCase()}`}>{room}</h3>
                <div className="mt-3 grid w-full grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {Array.from({ length: 6 }, (_, index) => {
                    const item = mockInventoryItems[room][index];
                    if (!item) return <div aria-label={`Empty ${room.toLowerCase()} inventory slot ${index + 1}`} className="aspect-square w-3/4 justify-self-center border border-white/25 bg-white/[0.02]" key={index} role="img" />;
                    return (
                      <button
                        aria-label={`Open ${item.name} details`}
                        className="grid aspect-square w-3/4 min-w-0 cursor-pointer justify-self-center place-items-center border border-white/55 bg-white/[0.08] p-2 text-center transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white"
                        key={index}
                        onClick={() => setSelectedItem({ item, room, slot: index + 1 })}
                        type="button"
                      >
                        <span>
                          <FiBox aria-hidden="true" className="mx-auto size-4 opacity-65" />
                          <span className="mt-2 block break-words text-[0.5rem] font-semibold uppercase leading-4 tracking-[0.1em] opacity-75">{item.name}</span>
                          <span className="mt-1 block text-[0.4rem] uppercase tracking-[0.12em] opacity-35">Mock</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : <div className="mt-6"><StoreContent /></div>}

      {selectedItem && (
        <div aria-labelledby="inventory-item-details-title" aria-modal="true" className="fixed inset-0 z-[140] grid place-items-center bg-black/85 p-5" onClick={() => setSelectedItem(null)} role="dialog">
          <article className="w-full max-w-md border border-white/45 bg-black p-6 text-white sm:p-8" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between gap-6 border-b border-white/20 pb-5">
              <div>
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/40">Inventory Item</p>
                <h2 className="mt-2 text-lg font-semibold uppercase tracking-[0.14em]" id="inventory-item-details-title">{selectedItem.item.name}</h2>
              </div>
              <button aria-label="Close item details" autoFocus className="grid size-8 shrink-0 cursor-pointer place-items-center text-white/50 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={() => setSelectedItem(null)} type="button"><FiX aria-hidden="true" className="size-5" /></button>
            </header>
            <div className="mt-6 grid grid-cols-2 gap-4 border-b border-white/20 pb-6 font-mono text-[0.6rem] uppercase tracking-[0.14em]">
              <div><p className="text-white/35">Category</p><p className="mt-2 text-white/80">{selectedItem.room}</p></div>
              <div><p className="text-white/35">Slot</p><p className="mt-2 text-white/80">{String(selectedItem.slot).padStart(2, "0")}</p></div>
              <div><p className="text-white/35">Status</p><p className="mt-2 text-white/80">Stored</p></div>
              <div><p className="text-white/35">Record</p><p className="mt-2 text-white/80">Mock Data</p></div>
            </div>
            <section aria-labelledby="inventory-item-description-title" className="mt-6">
              <h3 className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/40" id="inventory-item-description-title">Description</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">{selectedItem.item.description}</p>
            </section>
          </article>
        </div>
      )}
    </section>
  );
}
