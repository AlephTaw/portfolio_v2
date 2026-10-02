"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CustomActionSequence } from "./action-space-state";

export function CustomActionSequences({ sequences, selectedId, onSave, onSelect, onClose }: {
  sequences: CustomActionSequence[];
  selectedId: string | null;
  onSave: (name: string, labels: string[], existingId?: string) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [steps, setSteps] = useState("");
  const labels = steps.split("\n").map((label) => label.trim()).filter(Boolean);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const reset = () => { setEditingId(undefined); setName(""); setSteps(""); };

  return createPortal(
    <dialog ref={dialogRef} aria-labelledby="custom-action-sequences-title" className="m-auto max-h-[80dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-white/25 bg-[#111] p-5 text-white backdrop:bg-black/65" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="custom-action-sequences-title" className="text-base font-medium">Custom action sequences</h2>
        <button type="button" autoFocus aria-label="Close custom action sequences" onClick={onClose} className="cursor-pointer px-2 py-1 text-white/65 hover:text-white">×</button>
      </div>
      {sequences.length > 0 && <section aria-label="Saved custom sequences" className="mt-4">
        <ul className="space-y-2">{sequences.map((sequence) => <li key={sequence.id} className="flex items-center gap-2">
          <button type="button" aria-pressed={selectedId === sequence.id} className={`min-w-0 flex-1 cursor-pointer rounded-lg border px-3 py-2 text-left text-sm ${selectedId === sequence.id ? "border-white bg-white/10" : "border-white/20 hover:border-white/60"}`} onClick={() => { onSelect(sequence.id); onClose(); }}>
            <span className="block break-words">{sequence.name}</span><span className="text-xs text-white/45">{sequence.actions.length} actions{selectedId === sequence.id ? " · Selected" : ""}</span>
          </button>
          <button type="button" aria-label={`Edit ${sequence.name}`} className="cursor-pointer px-2 text-xs text-white/65 hover:text-white" onClick={() => { setEditingId(sequence.id); setName(sequence.name); setSteps(sequence.actions.map((action) => action.label).join("\n")); }}>Edit</button>
        </li>)}</ul>
      </section>}
      <form className="mt-5 border-t border-white/15 pt-4" onSubmit={(event) => { event.preventDefault(); onSave(name, labels, editingId); onClose(); }}>
        <div className="flex items-center justify-between gap-2"><h3 className="text-sm">{editingId ? "Edit sequence" : "Define a sequence"}</h3>{editingId && <button type="button" onClick={reset} className="cursor-pointer text-xs text-white/65">New sequence</button>}</div>
        <label className="mt-3 block text-xs text-white/65">Sequence name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 block w-full rounded-lg border border-white/25 bg-black p-3 text-sm text-white" /></label>
        <label className="mt-4 block text-xs text-white/65">Actions in order — one per line<textarea required rows={6} value={steps} onChange={(event) => setSteps(event.target.value)} placeholder={"Observe the situation\nChoose an approach\nTake action\nReview the result"} className="mt-2 block w-full resize-y rounded-lg border border-white/25 bg-black p-3 text-sm text-white" /></label>
        <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-white/45">{labels.length} actions</span><button type="submit" disabled={!name.trim() || !labels.length} className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm text-black disabled:opacity-40">Save & select</button></div>
      </form>
    </dialog>, document.body,
  );
}
