import type { ReactNode } from "react";
export function SecondaryColumn({ content, navigation }: { content: ReactNode; navigation: ReactNode }) {
  return <div className="grid h-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto]">{content}{navigation}</div>;
}
