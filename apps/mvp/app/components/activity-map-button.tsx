"use client";

import { AttentionCountBadge, mapPlanNotifications } from "./attention-notifications";
import { useActivityWorkspace } from "./activity-workspace-context";
import { PlanningIcon } from "./planning-icon";

export function ActivityMapButton() {
  const { activityOpen, activityMapOpen, requestActivityMap } = useActivityWorkspace();
  const selected = activityOpen && activityMapOpen;
  return <button type="button" aria-label="Planning" title="Planning" aria-pressed={selected} onClick={requestActivityMap} className="relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-[4px] bg-black text-white/55 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">
    <PlanningIcon className={`size-7 ${selected ? "brightness-0 invert" : ""}`} />
    <AttentionCountBadge count={mapPlanNotifications.length} />
  </button>;
}
