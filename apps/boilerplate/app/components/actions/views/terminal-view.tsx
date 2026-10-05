import type { ReactNode } from "react";
export function TerminalView({ children }: { children: ReactNode }) {
  return <section aria-label="App terminal" className="view-glass flex h-full min-h-0 flex-col text-white sm:rounded-t-3xl">
    <header className="flex h-14 shrink-0 items-center justify-between px-5">
      <h1 className="text-sm font-medium tracking-wide">app<span className="text-white/35"> / terminal</span></h1>
      <span className="text-[11px] text-white/40">Local session</span>
    </header>
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  </section>;
}
