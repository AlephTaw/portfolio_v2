// Muted category semantics shared by apps, dock, context chips and achievements.
export const pointColors = {
  Health: "#d78c8c",
  Wealth: "#83c6a3",
  Sentience: "#a99ed7",
  Skills: "#d7cf7c",
  Connection: "#d7a07c",
} as const;

export const journeyColor = "#e879f9";

// Intentional exception: preserve the existing Points earned element only.
export const pointsEarnedColors = {
  Health: "#83c6a3",
  Wealth: "#d7bd7c",
  Sentience: "#a99ed7",
  Skills: "#88b8d8",
  Connection: "#d7a0ad",
} as const;
