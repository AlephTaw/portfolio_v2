"use client";
import { useId, useLayoutEffect, useRef, useState, type RefObject } from "react";

export function ActionComposer({ inputRef, onSubmit }: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onSubmit: (text: string) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const composing = useRef(false);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = Math.max(44, Math.min(input.scrollHeight, window.innerHeight * 0.35)) + "px";
  }, [draft, inputRef]);
  function submit() {
    const text = draft.trim();
    if (!text) return;
    onSubmit(text);
    setDraft("");
    inputRef.current?.focus();
  }
  return <form className="shrink-0 px-4 pb-3 pt-2" onSubmit={(event) => { event.preventDefault(); submit(); }}>
    <label htmlFor={id} className="sr-only">Next action</label>
    <div className="relative">
      <textarea id={id} ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || composing.current || event.keyCode === 229) return;
          event.preventDefault();
          if (!event.repeat) submit();
        }}
        placeholder="...next action" rows={1} enterKeyHint="send"
        className="terminal-input block max-h-[35dvh] min-h-11 w-full resize-none rounded-xl border border-transparent py-3 pl-4 pr-12 text-sm leading-5 text-white/85 placeholder:text-white/35" />
      <button type="submit" disabled={!draft.trim()} aria-label="Add action"
        className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/10 disabled:opacity-30">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5m-6 6 6-6 6 6" /></svg>
      </button>
    </div>
  </form>;
}
