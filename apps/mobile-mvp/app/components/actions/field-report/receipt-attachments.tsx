"use client";

import { useRef } from "react";

export type ReceiptAttachment = { id: string; file: File };

export function ReceiptAttachments({ receipts, onAdd, onRemove }: { receipts: readonly ReceiptAttachment[]; onAdd: (files: File[]) => void; onRemove: (id: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return <section aria-label="Completion receipts" className="px-4 pb-5 pt-4">
    <h2 className="mb-2 text-xs font-medium text-white/75">Receipts</h2>
    <input ref={input} type="file" multiple accept="image/*,video/*,.pdf" aria-label="Upload completion receipts" className="sr-only" onChange={(event) => {
      onAdd(Array.from(event.currentTarget.files ?? []));
      event.currentTarget.value = "";
    }} />
    <button type="button" onClick={() => input.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onAdd(Array.from(event.dataTransfer.files)); }} className="flex min-h-20 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 bg-black/15 text-xs text-white/65 hover:bg-black/25 hover:text-white">
      <span aria-hidden="true" className="text-2xl font-light">+</span> Add completion receipts
    </button>
    <ul className="mt-2 space-y-1">{receipts.map((receipt) => <li key={receipt.id} className="flex min-h-11 items-center justify-between gap-2 rounded-lg bg-black/20 pl-3">
      <span className="min-w-0 truncate text-xs text-white/75">{receipt.file.name}</span>
      <button type="button" aria-label={`Remove ${receipt.file.name}`} onClick={() => onRemove(receipt.id)} className="grid h-11 w-11 shrink-0 place-items-center text-white/50 hover:text-white">×</button>
    </li>)}</ul>
    <p className="mt-2 text-[10px] leading-4 text-white/40">Files stay in this session; they are not uploaded to a server.</p>
  </section>;
}
