import { TelemetryApp } from "@/src/apps/telemetry/TelemetryApp";
import { AgentViewRail } from "./AgentViewRail";
import { ComposerDock } from "./ComposerDock";

export function GlobalNavigation() {
  return (
    <>
      <TelemetryApp />
      <AgentViewRail fixed />
      <ComposerDock />
    </>
  );
}
