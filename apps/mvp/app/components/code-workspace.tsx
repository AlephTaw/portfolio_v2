"use client";

import { useEffect, useState } from "react";

const storageKey = "speedrun-irl:code-draft";
const updateEvent = "speedrun-irl:code-draft-updated";

function getDraft() {
  try {
    return window.localStorage.getItem(storageKey) ?? "";
  } catch {
    return "";
  }
}

export function CodeWorkspace() {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const sync = () => setDraft(getDraft());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(updateEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(updateEvent, sync);
    };
  }, []);

  const updateDraft = (value: string) => {
    setDraft(value);
    try {
      window.localStorage.setItem(storageKey, value);
      window.dispatchEvent(new Event(updateEvent));
    } catch {
      // The in-memory draft remains editable when local storage is unavailable.
    }
  };

  return (
    <section aria-label="Code editor" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 font-sans text-xs text-white/50">
        <span>Code</span>
        <span>Local draft</span>
      </div>
      <textarea
        aria-label="Code draft"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className="pin-scrollbar min-h-0 w-full flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-6 text-white/85 outline-none placeholder:text-white/30"
        onChange={(event) => updateDraft(event.target.value)}
        placeholder="Write code here…"
        spellCheck={false}
        value={draft}
      />
    </section>
  );
}
