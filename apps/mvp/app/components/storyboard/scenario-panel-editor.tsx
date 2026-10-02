"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ScenarioPanel } from "./action-space-state";
import { MediaAttachments, MediaUpload, type SupportingMedia } from "./scenario-media";

export function ScenarioPanelEditor({ panel, assets, onAttachFiles, onRemoveAsset, onSave, onClose }: {
  panel: ScenarioPanel;
  assets: SupportingMedia[];
  onAttachFiles: (files: File[]) => void;
  onRemoveAsset: (asset: SupportingMedia) => void;
  onSave: (panel: ScenarioPanel) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(panel.title);
  const [description, setDescription] = useState(panel.description);
  const [actions, setActions] = useState(panel.highlightedActions ?? []);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return createPortal(
    <dialog ref={dialogRef} aria-labelledby="scenario-panel-editor-title" className="m-auto max-h-[80dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-white/25 bg-[#111] p-5 text-white backdrop:bg-black/65" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <form onSubmit={(event) => { event.preventDefault(); onSave({ ...panel, title: title.trim(), description, highlightedActions: actions }); onClose(); }}>
        <h2 id="scenario-panel-editor-title" className="text-base font-medium">Edit storyboard panel</h2>
        <label className="mt-5 block text-xs text-white/65">Title
          <input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 block w-full rounded-lg border border-white/25 bg-black p-3 text-sm text-white" />
        </label>
        <label className="mt-4 block text-xs text-white/65">Scene / notes
          <textarea rows={5} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 block w-full resize-y rounded-lg border border-white/25 bg-black p-3 text-sm text-white" />
        </label>
        <section aria-labelledby="panel-actions-heading" className="mt-4">
          <h3 id="panel-actions-heading" className="text-xs font-medium uppercase tracking-wider text-white/65">Actions</h3>
          {actions.length ? <ul className="mt-2 flex flex-wrap gap-1.5">
            {actions.map((action) => <li key={action.id} className="flex max-w-full items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
              <span className="min-w-0 break-words">{action.label}</span>
              <button type="button" aria-label={`Remove action ${action.label}`} onClick={() => setActions((current) => current.filter((item) => item.id !== action.id))} className="shrink-0 cursor-pointer text-white/50 hover:text-white">×</button>
            </li>)}
          </ul> : <p className="mt-2 text-xs text-white/40">No actions assigned.</p>}
        </section>
        <section aria-labelledby="panel-assets-heading" className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 id="panel-assets-heading" className="text-xs font-medium uppercase tracking-wider text-white/65">Assets</h3>
            <MediaUpload compact text="Attach assets" label="Attach assets to storyboard panel" onUpload={onAttachFiles} />
          </div>
          {assets.length ? <MediaAttachments media={assets} onRemove={onRemoveAsset} /> : <p className="mt-2 text-xs text-white/40">No assets attached.</p>}
        </section>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-full border border-white/30 px-4 py-2 text-sm hover:border-white">Cancel</button>
          <button type="submit" disabled={!title.trim()} className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm text-black disabled:opacity-40">Save panel</button>
        </div>
      </form>
    </dialog>, document.body,
  );
}
