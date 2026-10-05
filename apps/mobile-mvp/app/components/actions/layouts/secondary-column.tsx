import type { ReactNode } from "react";

export function SecondaryColumn({ content, navigation }: { content: ReactNode; navigation: ReactNode }) {
  // Only the content row may scroll. Navigation always has its own reserved row.
  return <div className="relative grid h-full min-h-0 min-w-0 w-full grid-rows-[minmax(0,1fr)_auto]">
    {content}
    {navigation}
  </div>;
}
