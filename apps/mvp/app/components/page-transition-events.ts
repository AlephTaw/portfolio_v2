export const pageTransitionEvent = "speedrun-irl:page-transition";
export const toggleCommunicationsEvent = "speedrun-irl:toggle-communications";
export const toggleMinimapEvent = "speedrun-irl:toggle-minimap";
export const communicationsStateEvent = "speedrun-irl:communications-state";
export const WORLD_ORIGIN_KEY = "speedrun-irl:world-origin";
export const WORLD_VIEW_STATE_KEY = "speedrun-irl:world-view";
export const openWorkshopEvent = "speedrun-irl:open-workshop";

export type PageTransitionDetail = {
  direction: -1 | 0 | 1;
  from: string;
  to: string;
};

export type CommunicationsStateDetail = {
  open: boolean;
};
