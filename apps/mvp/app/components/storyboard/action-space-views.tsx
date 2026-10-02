"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStateView } from "../../state/components/state-view-context";
import { ActionSpaceConfirmation } from "./action-space-confirmation";

const buttonClass = "cursor-pointer rounded-full border border-white/30 px-3 py-1.5 text-xs hover:border-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default disabled:opacity-40";

export function ActionSpaceViews({ onClose }: { onClose: () => void }) {
  const { actionSpace } = useStateView();
  const { state, saveView, renameView, selectView, deleteView, updateView } = actionSpace;
  const active = state?.savedViews.find((saved) => saved.id === state.activeViewId);
  const [name, setName] = useState(active?.name ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [pending, setPending] = useState<{ type: "select" | "delete"; id: string; name: string } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  if (!state) return null;
  const hiddenNodes = state.nodes.filter((node) => state.view.hidden.includes(node.id));

  return <>
    {createPortal(
      <dialog aria-labelledby="action-space-views-title" className="m-auto max-h-[80dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-white/25 bg-[#111] p-5 text-white shadow-2xl backdrop:bg-black/65" onCancel={(event) => { event.preventDefault(); onClose(); }} ref={dialogRef}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-medium" id="action-space-views-title">Action space views</h2>
          <button aria-label="Close views" className={buttonClass} onClick={onClose} type="button">Close</button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/60">Your working view is kept automatically. Save a named view to revisit its nodes, paths, and camera position.</p>
        <p className="mt-2 text-xs text-white/50">Graph: {state.nodes.length} nodes · {state.edges.length} edges</p>
        <form className="mt-5 flex flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); saveView(name); }}>
          <label className="min-w-40 flex-1 text-xs text-white/65">View name
            <input className="mt-2 w-full rounded-lg border border-white/25 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none" maxLength={80} onChange={(event) => setName(event.target.value)} placeholder="Name this view" required value={name} />
          </label>
          <button className={buttonClass} disabled={!name.trim()} type="submit">{active ? "Save changes" : "Save view"}</button>
          {active && <button className={buttonClass} disabled={!name.trim()} onClick={() => saveView(name, true)} type="button">Save as new</button>}
        </form>
        <ul aria-label="Saved action space views" className="mt-5 space-y-3">
          {state.savedViews.map((saved) => <li className="rounded-lg bg-white/5 p-3" key={saved.id}>
            {editingId === saved.id ? <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); renameView(saved.id, editedName); if (saved.id === state.activeViewId) setName(editedName.trim()); setEditingId(null); }}>
              <input aria-label={`New name for ${saved.name}`} className="min-w-0 flex-1 rounded border border-white/30 bg-black p-2 text-sm" maxLength={80} onChange={(event) => setEditedName(event.target.value)} required value={editedName} />
              <button className={buttonClass} disabled={!editedName.trim()} type="submit">Save name</button>
              <button className={buttonClass} onClick={() => setEditingId(null)} type="button">Cancel</button>
            </form> : <>
              <div className="flex items-center justify-between gap-2"><span className="text-sm">{saved.name}</span>{state.activeViewId === saved.id && <span className="text-xs text-white/55">Selected</span>}</div>
              <p className="mt-1 text-xs text-white/50">{saved.view.included.length} included nodes · {saved.view.hidden.length} hidden nodes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className={buttonClass} onClick={() => setPending({ type: "select", id: saved.id, name: saved.name })} type="button">{state.activeViewId === saved.id ? "Reload saved view" : "Select"}</button>
                <button className={buttonClass} onClick={() => { setEditingId(saved.id); setEditedName(saved.name); }} type="button">Edit name</button>
                <button className={buttonClass} onClick={() => setPending({ type: "delete", id: saved.id, name: saved.name })} type="button">Delete</button>
              </div>
            </>}
          </li>)}
        </ul>
        {state.savedViews.length === 0 && <p className="mt-5 text-sm text-white/50">No saved views yet.</p>}
        {hiddenNodes.length > 0 && <section aria-label="Hidden nodes" className="mt-6">
          <h3 className="text-sm font-medium">Hidden nodes</h3>
          <ul className="mt-3 space-y-2">{hiddenNodes.map((node) => <li className="flex items-center justify-between gap-3 text-sm" key={node.id}>
            <span>{node.label} <span className="text-xs text-white/40">{node.id}</span></span>
            <button aria-label={`Add ${node.label} back to view`} className={buttonClass} onClick={() => {
              const parts = node.id.split("/");
              const path = parts.map((_, index) => parts.slice(0, index + 1).join("/"));
              updateView((current) => ({ ...current, included: [...new Set([...current.included, ...path])], hidden: current.hidden.filter((id) => !path.includes(id)), active: node.id }));
            }} type="button">Add back</button>
          </li>)}</ul>
        </section>}
      </dialog>, document.body,
    )}
    {pending && <ActionSpaceConfirmation
      title={pending.type === "select" ? `Select “${pending.name}”?` : `Delete “${pending.name}”?`}
      description={pending.type === "select" ? "This will clear the current working layout and load this saved view. Save your current view first if you want to keep its latest changes. The graph itself will stay the same." : "This removes the saved view. Your graph and current working layout will remain available."}
      confirmLabel={pending.type === "select" ? "Select view" : "Delete view"}
      onCancel={() => setPending(null)}
      onConfirm={() => {
        if (pending.type === "select") { selectView(pending.id); onClose(); }
        else deleteView(pending.id);
        setPending(null);
      }}
    />}
  </>;
}
