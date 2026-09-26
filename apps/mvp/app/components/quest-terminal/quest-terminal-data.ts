export type SystemType =
  | "technique"
  | "telemetry"
  | "world-seed"
  | "experiment"
  | "game-loop"
  | "interaction"
  | "world-model-narrative"
  | "sentience"
  | "inventory-item";

export type CommandType = SystemType | "custom-activity" | "custom-activity-stop" | "terminal-command" | "chat-message";

export type QuestCommand = {
  type: CommandType;
  item: string;
  executedAt?: string;
  conversationId?: "recent" | "activity" | "guild" | "world";
};

export type CommandOption = Omit<QuestCommand, "type"> & {
  type: SystemType;
  categoryLabel: string;
  typeLabel: "System" | "Item";
  locked?: boolean;
};

export const defaultQuestCommands: QuestCommand[] = [
  { type: "experiment", item: "Pickup zone A/B test", executedAt: "2026-09-22T18:28:00.000Z" },
  { type: "technique", item: "Route selection", executedAt: "2026-09-22T18:28:00.000Z" },
  { type: "telemetry", item: "Route duration", executedAt: "2026-09-22T18:28:00.000Z" },
  { type: "world-seed", item: "Axiom of Choice", executedAt: "2026-09-22T18:28:00.000Z" },
  { type: "game-loop", item: "Core game loop", executedAt: "2026-09-22T18:28:00.000Z" },
  { type: "interaction", item: "Issue-specific chat", executedAt: "2026-09-22T18:28:00.000Z" },
];

export const techniqueGroups = [
  { category: "Environment", techniques: ["Zone mapping", "Demand tracking", "Landmark indexing"] },
  { category: "Perception", techniques: ["Traffic scan", "Hazard detection", "Passenger cues"] },
  { category: "Action", techniques: ["Route selection", "Smooth control", "Pickup positioning"] },
];

export const systemTypes: {
  type: SystemType;
  label: string;
  pickerLabel: string;
  typeLabel: "System" | "Item";
}[] = [
  { type: "technique", label: "Technique", pickerLabel: "technique", typeLabel: "System" },
  { type: "telemetry", label: "Telemetry", pickerLabel: "telemetry item", typeLabel: "System" },
  { type: "world-seed", label: "World Seed", pickerLabel: "world model", typeLabel: "System" },
  { type: "experiment", label: "Experiment", pickerLabel: "experiment", typeLabel: "System" },
  { type: "game-loop", label: "Game Loop", pickerLabel: "game loop", typeLabel: "System" },
  { type: "interaction", label: "Interaction", pickerLabel: "interaction", typeLabel: "System" },
  {
    type: "world-model-narrative",
    label: "World Model (Narrative)",
    pickerLabel: "narrative world model",
    typeLabel: "System",
  },
  { type: "sentience", label: "Sentience", pickerLabel: "sentience system", typeLabel: "System" },
  { type: "inventory-item", label: "Inventory Item", pickerLabel: "inventory item", typeLabel: "Item" },
];

export const systemItems: Record<SystemType, string[]> = {
  technique: techniqueGroups.flatMap((group) => group.techniques),
  telemetry: ["Route duration", "Idle time", "Miles driven", "Acceptance rate"],
  "world-seed": ["Axiom of Choice", "Downtown grid", "Airport corridor", "Night shift demand", "Event surge"],
  experiment: ["Pickup zone A/B test", "Route timing trial", "Demand window test"],
  "game-loop": ["Core game loop"],
  interaction: ["Issue-specific chat"],
  "world-model-narrative": ["ARC"],
  sentience: ["Critic"],
  "inventory-item": ["Emergency kit", "Fuel card", "Phone mount", "Water bottle"],
};

export const commandOptions: CommandOption[] = systemTypes.flatMap((system) =>
  systemItems[system.type].map((item) => ({
    type: system.type,
    item,
    categoryLabel: system.label,
    typeLabel: system.typeLabel,
    locked: system.type === "sentience" && item === "Critic",
  })),
);

export function getSystemLabel(type: CommandType) {
  if (type === "terminal-command" || type === "chat-message") return "";
  if (type === "custom-activity") return "Start custom activity";
  if (type === "custom-activity-stop") return "Stop custom activity";
  return systemTypes.find((system) => system.type === type)?.label ?? type;
}

export function getCommandText(command: Pick<QuestCommand, "type" | "item">) {
  return `${getSystemLabel(command.type)} / ${command.item}`;
}
