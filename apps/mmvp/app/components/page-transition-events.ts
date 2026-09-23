export const pageTransitionEvent = "speedrun-irl:page-transition";

export type PageTransitionDetail = {
  direction: -1 | 0 | 1;
  from: string;
  to: string;
};
