import type { ReactNode } from "react";
export function TerminalView({ children, title = "Wealth", hideHeader = false }: { children: ReactNode; title?: string; hideHeader?: boolean }) {
  return <section aria-label={title + " terminal"} className="view-glass flex h-full min-h-0 flex-col text-white sm:rounded-t-3xl">
    <header className={hideHeader ? "hidden" : "flex h-14 shrink-0 items-center justify-between px-5"}>
      <h1 className="text-sm font-medium tracking-wide">{title.toLowerCase()}<span className="text-white/35"> / terminal</span></h1>
      <span className="text-[11px] text-white/40">Local session</span>
    </header>
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  </section>;
}
