// Admin's compact diagram has its own label positions, independent of the
// full-size character navigation and docked menu.
export const adminCharacterDiagramDestinations = [
  { view: "stats", label: "Stats", position: "left-[65%] top-[6%] -translate-y-1/2" },
  { view: "storyboard", label: "Surrogate", position: "left-[67%] top-[24%] -translate-y-1/2" },
  { view: "os", label: "Systems", position: "left-[71%] top-[42%] -translate-y-1/2" },
  { view: "arc", label: "Arc", position: "left-[-15%] top-[calc(34%+1.75rem)] w-[45%]" },
  { view: "inventory", label: "Inventory", position: "left-[-15%] top-[34%] w-[45%]" },
  { view: "admin", label: "Admin", position: "left-[69%] top-[77%]" },
] as const;
