import { journeyColor, pointColors } from "./game-design/point-colors.ts";

export const terminalCategories = [
  { name: "Health", color: pointColors.Health },
  { name: "Wealth", color: pointColors.Wealth },
  { name: "Sentience", color: pointColors.Sentience },
  { name: "Connections", color: pointColors.Connection },
  { name: "Skills", color: pointColors.Skills },
  { name: "Journey", color: journeyColor },
] as const;

export type TerminalCategory = typeof terminalCategories[number]["name"];
