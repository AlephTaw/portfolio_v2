"use client";
import { useId, useLayoutEffect, useRef, type RefObject } from "react";

export function ActionComposer({ inputRef, onSubmit, value, onChange }: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onSubmit: (text: string) => void;
  value: string;
  onChange: (text: string) => void;
}) {
  const id = useId();
  const composing = useRef(false);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const fit = () => {
      input.style.height = "auto";
      input.style.height = Math.max(44, Math.min(input.scrollHeight, window.innerHeight * 0.35)) + "px";
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [value, inputRef]);
  function submit() {
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    onChange("");
    inputRef.current?.focus({ preventScroll: true });
  }
  return <form className="shrink-0 px-4 pb-3 pt-2" onSubmit={(event) => { event.preventDefault(); submit(); }}>
    <label htmlFor={id} className="sr-only">Next action</label>
    <div className="relative">
      <textarea id={id} ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || composing.current || event.keyCode === 229) return;
          event.preventDefault();
          if (!event.repeat) submit();
        }}
        placeholder="...next action" rows={1} enterKeyHint="send"
        className="terminal-input block max-h-[35dvh] min-h-11 w-full resize-none rounded-xl border border-transparent py-3 pl-4 pr-12 text-sm leading-5 text-white/85 placeholder:text-white/35" />
      <button type="button" disabled aria-label="Microphone — voice input not connected yet" title="Voice input is not connected yet"
        className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-gray-400/30 text-white/80 backdrop-blur-md">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6" /></svg>
      </button>
    </div>
  </form>;
}
