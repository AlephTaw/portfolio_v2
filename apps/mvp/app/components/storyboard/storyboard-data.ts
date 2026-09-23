export type StoryboardStep = {
  id: number;
  label: string;
  option: string;
  frameLabel: string;
};

export const storyboardSteps: StoryboardStep[] = [
  { id: 1, label: "Accept request", option: "Pickup route", frameLabel: "Request" },
  { id: 2, label: "Reach pickup", option: "Primary approach", frameLabel: "Arrival" },
  { id: 3, label: "Confirm passenger", option: "Identity check", frameLabel: "Pickup" },
  { id: 4, label: "Complete route", option: "Best path", frameLabel: "Outcome" },
];
