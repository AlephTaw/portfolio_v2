import { mvdChecklist, type MvdGroup } from "../field-report/mvd-checklist-data.ts";

export type AppSystem = { id: string; name: string; category: string; description?: string; groups?: readonly MvdGroup[] };
const groups = (...ids: string[]) => mvdChecklist.filter((group) => ids.includes(group.id));

// Mobile-owned catalog: authored systems plus the protocols already used by Field Report.
export const appSystems: AppSystem[] = [
  { id: "agent-telemetry", name: "Telemetry", category: "MVSOS", description: "Observe activity and mental state to inform the next action.", groups: groups("telemetry") },
  { id: "agent-experiment", name: "Experiment", category: "MVSOS", description: "Try an action and use the field report to inspect its outcome." },
  { id: "agent-choice", name: "Axiom of Choice", category: "MVSOS", description: "Choose the matter of priority and the next action.", groups: groups("system-call") },
  { id: "agent-techniques", name: "Techniques", category: "MVSOS", description: "Apply the defined daily protocols and practices." },
  { id: "agent-world-model", name: "World Model", category: "MVSOS", description: "Maintain a model of the world: beliefs, assumptions, and relationships that inform predictions and choices." },
  { id: "app-build", name: "Build", category: "App", description: "Panels, game design, character progression, and storyboard." },
  { id: "app-inventory", name: "Inventory", category: "App", description: "Items and available inventory slots." },
  { id: "app-chat", name: "Chat", category: "App", description: "Conversations and interaction activity." },
  { id: "app-terminal", name: "Terminal", category: "App", description: "Command drafts and the running activity history." },
  { id: "app-hud", name: "HUD", category: "App", description: "Visor display and its background presentation." },
  { id: "app-report", name: "Field report", category: "App", description: "Daily checklist, receipts, authorship, and next action." },
  { id: "app-progression", name: "Game progression", category: "App", description: "Category points, levels, achievements, and pending rewards." },
  { id: "app-timeline", name: "Timeline", category: "App", description: "Activity history, minimized views, and window anchors." },
  { id: "app-configuration", name: "Configuration", category: "App", description: "Component systems, Harness, and Profile Admin." },
  ...mvdChecklist.map((group) => ({ id: `protocol-${group.id}`, name: group.title, category: group.category, groups: [group] })),
  { id: "health-recovery", name: "Recovery", category: "Health", groups: groups("sleep", "meal-prep", "fitness") },
  { id: "health-strength", name: "Strength", category: "Health", groups: groups("fitness") },
  { id: "health-conditioning", name: "Conditioning", category: "Health", groups: groups("fitness") },
  { id: "health-mobility", name: "Mobility", category: "Health", groups: groups("fitness") },
  { id: "health-connection", name: "Connection", category: "Health" },
  { id: "connection-pipelines", name: "Pipelines", category: "Connection" },
  { id: "connection-kinosaki", name: "Operation Kinosaki", category: "Connection" },
  { id: "connection-family", name: "Family", category: "Connection" },
  { id: "connection-guild", name: "Guild", category: "Connection" },
  { id: "sentience-mvsos", name: "MVSOS", category: "Sentience", groups: groups("system-call", "sentience") },
  { id: "skills-mastery", name: "Subject Mastery", category: "Skills", groups: groups("skills") },
  { id: "experience-enjoyment", name: "Enjoyment", category: "Experience", groups: groups("experience") },
  { id: "experience-explore", name: "Exploration – exploitation", category: "Experience" },
  { id: "builds-life", name: "Game of Life", category: "Builds" },
  { id: "builds-developer", name: "Developer Game", category: "Builds", groups: groups("builds") },
  { id: "quests-mvd", name: "Minimum Viable Day", category: "Quests", groups: mvdChecklist },
];
