import type { ReactNode } from "react";

export function ViewThumbnail({ label, onRestore, children }: { label: string; onRestore: () => void; children: ReactNode }) {
  return <div className="relative h-[69.5px] w-8 shrink-0 overflow-hidden rounded-md bg-white/5 shadow-lg">
    <div inert className="pointer-events-none absolute left-0 top-0 h-[695px] w-[320px] origin-top-left scale-[0.1] overflow-hidden" aria-hidden="true">{children}</div>
    <button type="button" aria-label={`Restore ${label}`} onClick={onRestore} className="absolute inset-0 rounded-md hover:bg-white/5 focus-visible:outline-offset-[-2px]" />
  </div>;
}
