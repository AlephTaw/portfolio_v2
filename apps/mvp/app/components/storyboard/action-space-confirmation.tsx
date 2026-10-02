"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function ActionSpaceConfirmation({ title, description, confirmLabel, onCancel, onConfirm }: {
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return createPortal(
    <dialog aria-labelledby="action-space-confirm-title" aria-describedby="action-space-confirm-description" className="m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-2xl border border-white/25 bg-[#111] p-5 text-white shadow-2xl backdrop:bg-black/65" onCancel={(event) => { event.preventDefault(); onCancel(); }} ref={dialogRef}>
      <h2 className="text-base font-medium" id="action-space-confirm-title">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-white/65" id="action-space-confirm-description">{description}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button autoFocus className="cursor-pointer rounded-full border border-white/30 px-4 py-2 text-sm hover:border-white focus-visible:outline focus-visible:outline-white" onClick={onCancel} type="button">Cancel</button>
        <button className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm text-black hover:bg-white/85 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white" onClick={onConfirm} type="button">{confirmLabel}</button>
      </div>
    </dialog>, document.body,
  );
}
