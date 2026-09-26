"use client";

import { usePathname, useRouter } from "next/navigation";
import { type SplitMode, useSplitView } from "./split-view-context";

export const splitScreenActions = [
  { mode: "horizontal", actionLabel: "Split screen horizontally" },
  { mode: "vertical", actionLabel: "Split screen vertically" },
  { mode: "none", actionLabel: "Unsplit screen" },
] as const satisfies ReadonlyArray<{ mode: SplitMode; actionLabel: string }>;

export function findSplitScreenAction(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();
  return splitScreenActions.find(({ actionLabel }) => actionLabel.toLowerCase() === normalized) ?? null;
}

export function SplitModeIcon({ mode }: { mode: SplitMode }) {
  if (mode === "none") return <span aria-hidden="true" className="h-4 w-6 border-2 border-current" />;

  return (
    <span aria-hidden="true" className="relative h-4 w-6 border-2 border-current">
      <span className={mode === "vertical"
        ? "absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-current"
        : "absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-current"} />
    </span>
  );
}

export function useApplySplitMode() {
  const pathname = usePathname();
  const router = useRouter();
  const { setLeftPane, setSplitMode, splitMode } = useSplitView();

  return (mode: SplitMode) => {
    if (mode === "none") {
      setSplitMode("none");
      router.push("/terminal");
      return;
    }
    if (splitMode === "none") setLeftPane(pathname === "/world" ? "world" : "stats");
    setSplitMode(mode);
  };
}
