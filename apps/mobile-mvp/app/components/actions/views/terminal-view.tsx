import type { ReactNode } from "react";
import { ComponentHeading } from "../settings/component-systems";

export function TerminalView({ children, floating = true }: { children: ReactNode; floating?: boolean }) {
  return <div className={`flex h-full min-h-0 flex-col text-white ${floating ? "view-glass rounded-t-3xl" : ""}`}>
    <header hidden={!floating} className={floating ? "flex h-11 shrink-0 items-center px-4" : "hidden"}><ComponentHeading target="terminal" /></header>
    <div className="min-h-0 flex-1">{children}</div>
  </div>;
}
