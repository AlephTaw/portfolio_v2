export const pageTransitionEvent = "speedrun-irl:page-transition";
export const WORLD_ORIGIN_KEY = "speedrun-irl:world-origin";
export const WORLD_VIEW_STATE_KEY = "speedrun-irl:world-view";
export const openWorkshopEvent = "speedrun-irl:open-workshop";

export type PageTransitionDetail = {
  direction: -1 | 0 | 1;
  from: string;
  to: string;
};
