export const terminalCategories = [
  { name: "Journey", color: "text-fuchsia-400", chip: "bg-fuchsia-400/20 text-fuchsia-300" },
  { name: "Health", color: "text-red-400", chip: "bg-red-400/20 text-red-300" },
  { name: "Wealth", color: "text-green-400", chip: "bg-green-400/20 text-green-300" },
  { name: "Sentience", color: "text-blue-400", chip: "bg-blue-400/20 text-blue-300" },
  { name: "Connections", color: "text-orange-400", chip: "bg-orange-400/20 text-orange-300" },
  { name: "Skills", color: "text-yellow-400", chip: "bg-yellow-400/20 text-yellow-300" },
] as const;

export type TerminalCategory = typeof terminalCategories[number]["name"];
