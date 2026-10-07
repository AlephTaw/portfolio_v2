"use client";

import { useEffect, useRef } from "react";
import { SignupForm } from "./signup-form";

export function BetaSignupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return <dialog
    ref={dialogRef}
    id="beta-signup"
    aria-labelledby="beta-signup-heading"
    onClose={onClose}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        event.currentTarget.close();
      }
    }}
    className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto border-0 bg-black p-6 text-foreground backdrop:bg-black/80 sm:p-8"
  >
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">Beta Program</p>
    <button type="button" aria-label="Close beta signup" onClick={() => dialogRef.current?.close()} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
    </button>
    <h2 id="beta-signup-heading" className="mt-5 text-[clamp(2.5rem,8vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.055em]">Become a Beta Tester!</h2>
    <p className="mb-10 mt-6 max-w-md text-base leading-7 text-white/60">Be among the first to speedrun IRL and help shape the game before launch.</p>
    <SignupForm />
  </dialog>;
}
