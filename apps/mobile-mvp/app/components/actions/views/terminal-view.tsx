import type { ReactNode } from "react";

export function TerminalView({ children, floating = true }: { children: ReactNode; floating?: boolean }) {
  return <div role="region" aria-label="Terminal feed" className={`relative flex h-full min-h-0 min-w-0 w-full flex-col text-white ${floating ? "view-glass" : ""}`}>
    <div className="min-h-0 flex-1">{children}</div>
  </div>;
}
