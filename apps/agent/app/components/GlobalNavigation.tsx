"use client";

import { usePathname } from "next/navigation";
import { TelemetryApp } from "@/src/apps/telemetry/TelemetryApp";
import { AgentViewRail } from "./AgentViewRail";
import { ComposerDock } from "./ComposerDock";

export function GlobalNavigation() {
  const pathname = usePathname();

  return (
    <>
      <TelemetryApp />
      <AgentViewRail direction={pathname === "/" ? "left" : "right"} fixed />
      <ComposerDock />
    </>
  );
}
