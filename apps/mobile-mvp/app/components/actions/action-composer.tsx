"use client";

import { useId, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import { TerminalCategoryDock } from "./navigation/terminal-category-dock";
import { terminalCategories, type TerminalCategory } from "./terminal-categories";

export function ActionComposer({ value, onChange, inputRef, onSubmit, terminal = false, docked = false, showCategoryDock = false, selectedCategory = null, onSelectCategory, onClearCategory, onHeightChange, onActivate }: { value?: string; onChange?: (value: string) => void; inputRef?: Ref<HTMLTextAreaElement>; onSubmit?: (command: string) => void; terminal?: boolean; docked?: boolean; showCategoryDock?: boolean; selectedCategory?: TerminalCategory | null; onSelectCategory?: (category: TerminalCategory) => void; onClearCategory?: () => void; onHeightChange?: (height: number) => void; onActivate?: () => void } = {}) {
  const [draft, setDraft] = useState("");
  const id = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const container = useRef<HTMLDivElement>(null);
  useImperativeHandle(inputRef, () => textarea.current!, []);
  const text = value ?? draft;
  useLayoutEffect(() => {
    const input = textarea.current;
    if (!input || !terminal || !selectedCategory || !onClearCategory) return;
    // Software keyboards can send beforeinput without a Backspace keydown.
    const onDelete = (event: InputEvent) => {
      if (event.inputType !== "deleteContentBackward" || event.isComposing || input.selectionStart !== 0 || input.selectionEnd !== 0) return;
      event.preventDefault();
      onClearCategory();
    };
    input.addEventListener("beforeinput", onDelete);
    return () => input.removeEventListener("beforeinput", onDelete);
  }, [terminal, selectedCategory, onClearCategory]);
  useLayoutEffect(() => {
    const input = textarea.current;
    const root = container.current;
    if (!input || !root || !docked) return;
    const fit = () => {
      input.style.height = "auto";
      input.style.height = `${Math.max(36, Math.min(input.scrollHeight, window.innerHeight * 0.4))}px`;
      onHeightChange?.(root.getBoundingClientRect().height);
    };
    fit();
    let frame = 0;
    let width = root.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const nextWidth = root.getBoundingClientRect().width;
      if (nextWidth === width) return;
      width = nextWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    observer.observe(root);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); input.style.height = ""; };
  }, [text, docked, showCategoryDock, selectedCategory, onHeightChange]);
  const category = terminalCategories.find((item) => item.name === selectedCategory);

  return (
    <div ref={container} className={docked ? "terminal-docked-composer" : "p-3 pt-0"}>
      {terminal && showCategoryDock && <TerminalCategoryDock selected={selectedCategory} onSelect={(category) => { onSelectCategory?.(category); textarea.current?.focus({ preventScroll: true }); }} />}
      <label htmlFor={id} className="sr-only">Next action</label>
      <div className={`relative ${terminal ? "terminal-input terminal-composer-input flex min-w-0 items-start overflow-hidden rounded-xl border border-white/10" : ""}`}>
        {terminal && category && <span className={`ml-3 max-w-[40%] shrink-0 truncate rounded-full px-2 py-0.5 text-[10px] font-medium leading-4 ${docked ? "mt-2" : "mt-3"}`} style={{ color: category.color, backgroundColor: `${category.color}33` }}>{category.name}</span>}
        <textarea ref={textarea} id={id} value={text} onFocus={onActivate} onChange={(event) => (onChange ?? setDraft)(event.target.value)} placeholder="Next action" rows={docked ? 1 : 2} enterKeyHint={onSubmit ? "send" : undefined}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229) return;
            if (event.key === "Backspace" && terminal && selectedCategory && onClearCategory && event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === 0) {
              event.preventDefault();
              onClearCategory();
              return;
            }
            if (!onSubmit || event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || event.keyCode === 229) return;
            event.preventDefault();
            const command = (value ?? draft).trim();
            if (!event.repeat && command) {
              onSubmit(command);
              (onChange ?? setDraft)("");
            }
          }}
          className={`actions-input block w-full rounded-xl border border-transparent placeholder:text-white/35 ${terminal ? "min-w-0 flex-1" : ""} ${docked ? "max-h-[40dvh] min-h-9 resize-none py-[9px] pl-3 pr-10" : `max-h-[50dvh] min-h-20 resize-y py-3 ${terminal ? "pl-4 pr-12" : "pl-4 pr-14"}`} ${terminal ? "font-normal text-xs leading-4 text-white/55" : "text-base leading-6 text-white"}`} />
        <button type="button" aria-label="Microphone — voice input not connected yet" title="Voice input is not connected yet" disabled className={terminal ? "absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-gray-400/30 text-white/80 backdrop-blur-md" : "absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-white/80"}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={terminal ? "1.5" : "2.5"} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6" /></svg>
        </button>
      </div>
    </div>
  );
}
