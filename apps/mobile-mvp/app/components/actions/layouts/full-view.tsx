import type { ReactNode } from "react";

export function FullView({ label, children }: { label: string; children?: ReactNode }) {
  return <section aria-label={label} className="actions-full-view mx-auto min-h-0 w-full max-w-[629.8px] flex-1 overflow-y-auto overscroll-contain">
    {children}
  </section>;
}
