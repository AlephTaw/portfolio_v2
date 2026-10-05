import type { ReactNode } from "react";
export function PrimaryColumn({ children }: { children: ReactNode }) {
  return <div className="mx-auto h-full min-h-0 w-full max-w-[629.8px] sm:w-[calc(100%-1rem)]">{children}</div>;
}
