"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ExecuteCommandControl } from "./quest-terminal";

export function PrivateComposer({ onDockElementChange, onHeightChange, onSuggestionsOpenChange, onChatPreviewExpandedChange }: { onDockElementChange: (element: HTMLElement | null) => void; onHeightChange: (height: number) => void; onSuggestionsOpenChange: (open: boolean) => void; onChatPreviewExpandedChange: (expanded: boolean) => void }) {
  const pathname = usePathname();
  const composerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    const measure = () => onHeightChange(composer.getBoundingClientRect().height);
    const observer = new ResizeObserver(measure);
    observer.observe(composer);
    measure();
    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <div
      aria-label="Command composer"
      className="fixed inset-x-0 bottom-0 z-[150] bg-black pt-1"
      ref={composerRef}
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="relative z-50 mx-auto flex min-h-10 w-full max-w-[var(--composer-max-width)] items-end gap-3 px-[var(--composer-gutter)] text-xs text-white/55">
        <div className="min-w-0 flex-1">
          <ExecuteCommandControl key={pathname} onDockElementChange={onDockElementChange} onSuggestionsOpenChange={onSuggestionsOpenChange} onChatPreviewExpandedChange={onChatPreviewExpandedChange} variant="command-line" />
        </div>
      </div>
    </div>
  );
}
