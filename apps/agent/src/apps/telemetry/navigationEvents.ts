export const ACTIVITY_NAVIGATION_EVENT = "agent:activity-navigation";
export const ACTIVITY_FOCUS_EVENT = "agent:activity-focus";
export const ACTIVITY_TIMER_TOGGLE_EVENT = "agent:activity-timer-toggle";
export const ACTIVITY_VISIBILITY_TOGGLE_EVENT =
  "agent:activity-visibility-toggle";

export type ActivityNavigationMode = "quests" | "timeline" | "kanban";

export function requestActivityNavigation(mode: ActivityNavigationMode) {
  window.dispatchEvent(
    new CustomEvent<ActivityNavigationMode>(ACTIVITY_NAVIGATION_EVENT, {
      detail: mode,
    }),
  );
}

export function requestActivityVisibilityToggle() {
  window.dispatchEvent(new Event(ACTIVITY_VISIBILITY_TOGGLE_EVENT));
}

export function requestActivityFocus() {
  window.dispatchEvent(new Event(ACTIVITY_FOCUS_EVENT));
}

export function requestActivityTimerToggle() {
  window.dispatchEvent(new Event(ACTIVITY_TIMER_TOGGLE_EVENT));
}
