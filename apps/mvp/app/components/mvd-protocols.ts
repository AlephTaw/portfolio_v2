import { minimumViableDay, monthlyBills, connectionCriteria, sentienceCriteria, skillsCriteria, buildsCriteria, wealthCriteria, specialQuestCriteria, telemetryCriteria, firefightingActions } from "./mvd-protocol-data";
import type { ActivityTask } from "./activity-task-data";
import type { ActivityCategory } from "./quest-terminal/use-active-activity";

type ProtocolItem = { label: string; points?: string };
export type MvdProtocol = {
  id: string;
  category: ActivityCategory;
  title: string;
  taskIds: readonly string[];
  items: readonly ProtocolItem[];
  note?: string;
  focus?: boolean;
  stageRisk?: boolean;
};

const healthProtocol = (name: string, taskIds: string[]): MvdProtocol => {
  const entry = minimumViableDay.find((protocol) => protocol.category === name)!;
  const focus = ["Sleep", "Meal Prep", "Nutrition"].includes(name);
  return { id: `health-${name.toLowerCase().replaceAll(" ", "-")}`, category: "Health", title: entry.category, taskIds, items: entry.items.map((label) => ({ label })), note: entry.note, focus, stageRisk: focus };
};
export const systemCallSequence = [
  "Nothing wrong with my life",
  "Think emotionally and notice three things",
  "Accept and embrace feelings",
  "Let go of feelings and thoughts (mindfulness)",
  "Address the matter of priority",
  "Run towards where possible",
];

export const mvdProtocols: readonly MvdProtocol[] = [
  healthProtocol("Sleep", ["Health-sleep"]),
  healthProtocol("Meal Prep", ["Health-meal-prep"]),
  healthProtocol("Nutrition", ["Health-meals"]),
  healthProtocol("Fitness", ["Health-fitness"]),
  { id: "health-strength", category: "Health", title: "Strength", taskIds: ["Health-strength"], items: minimumViableDay[0].items.slice(1, 4).map((label) => ({ label })) },
  { id: "health-conditioning", category: "Health", title: "Conditioning", taskIds: ["Health-conditioning"], items: [{ label: minimumViableDay[0].items[4] }] },
  { id: "health-mobility", category: "Health", title: "Mobility", taskIds: ["Health-mobility"], items: [{ label: minimumViableDay[0].items[0] }] },
  healthProtocol("Skin", ["Health-skin"]),
  healthProtocol("Mouth", ["Health-mouth"]),
  healthProtocol("Hair", ["Health-hair"]),
  { id: "wealth-earning", category: "Wealth", title: "Daily earning quota", taskIds: ["Wealth-daily-earning-requirement"], items: wealthCriteria, focus: true, stageRisk: true },
  { id: "wealth-expenses", category: "Wealth", title: "Bills and solvency", taskIds: ["Wealth-expense-planning"], items: [...monthlyBills.map((bill) => ({ label: `${bill.name}: $${bill.amount.toLocaleString("en-US")} monthly` })), ...firefightingActions], note: "Due dates, daily earning target, and monthly/long-term solvency estimates are not configured. September 2026 credit card payment: $450." },
  { id: "connection-family", category: "Connection", title: "Family check-in", taskIds: ["Connection-family"], items: [connectionCriteria[0]] },
  { id: "connection-friendship", category: "Connection", title: "Social connection", taskIds: ["Connection-friendship"], items: connectionCriteria.slice(1, 3) },
  { id: "connection-dating", category: "Connection", title: "Dating", taskIds: ["Connection-100-dates"], items: [connectionCriteria[3]] },
  { id: "sentience-mvsos", category: "Sentience", title: "System call sequence", taskIds: ["Sentience-mvsos"], items: [...systemCallSequence.map((label) => ({ label })), sentienceCriteria[1]] },
  { id: "sentience-noting", category: "Sentience", title: "Noting", taskIds: ["Sentience-noting"], items: [sentienceCriteria[0]] },
  { id: "sentience-observability", category: "Sentience", title: "Observability", taskIds: ["Sentience-perception"], items: [{ label: "Use a calendar and time tracking" }, sentienceCriteria[2]] },
  { id: "sentience-accountability", category: "Sentience", title: "Feedback and accountability", taskIds: ["Sentience-accountability"], items: sentienceCriteria.slice(3, 5) },
  { id: "sentience-email", category: "Sentience", title: "Email", taskIds: ["Sentience-email"], items: [{ label: "Check emails once in the morning, once at night, and as little as necessary in between" }] },
  { id: "sentience-resilience", category: "Sentience", title: "Resilience", taskIds: ["Sentience-resilience"], items: [sentienceCriteria[5]] },
  { id: "skills-mathematics", category: "Competence", title: "Mathematics", taskIds: ["Competence-mathematics"], items: [skillsCriteria[0]] },
  { id: "skills-ml", category: "Competence", title: "ML Engineering", taskIds: ["Competence-ml-engineering"], items: [skillsCriteria[1]] },
  { id: "experience-enjoyment", category: "Experience", title: "Enjoyment", taskIds: ["Experience-enjoyment"], items: [specialQuestCriteria[0]], note: "Special XP rewards are not configured yet." },
  { id: "experience-fear", category: "Experience", title: "Confront a fear", taskIds: ["Experience-confront-a-fear"], items: [specialQuestCriteria[1]], note: "Special XP rewards are not configured yet." },
  { id: "experience-telemetry", category: "Experience", title: "Telemetry", taskIds: ["Experience-telemetry", "Builds-telemetry"], items: telemetryCriteria },
  { id: "builds-feature", category: "Builds", title: "Daily feature", taskIds: ["Builds-daily-feature"], items: buildsCriteria },
];

export function protocolsForTask(task: Pick<ActivityTask, "id" | "category" | "name" | "protocolIds">): readonly MvdProtocol[] {
  if (task.id === "Quest-minimum-viable-day") return mvdProtocols;
  return mvdProtocols.filter((protocol) => protocol.taskIds.includes(task.id) || task.protocolIds?.includes(protocol.id));
}

const systemProtocolIds: Record<string, readonly string[]> = {
  recovery: ["health-sleep", "health-nutrition", "health-mobility"],
  "health-sleep": ["health-sleep"], "health-hair": ["health-hair"], "health-skin": ["health-skin"],
  "health-strength": ["health-strength"], "health-conditioning": ["health-conditioning"], "health-mobility": ["health-mobility"],
  "health-nutrition": ["health-nutrition", "health-meal-prep"], "health-mouth": ["health-mouth"],
  "health-connection": ["connection-family", "connection-friendship"],
  learning: ["skills-mathematics", "skills-ml"], earning: ["wealth-earning", "wealth-expenses"],
  connection: ["connection-family", "connection-friendship", "connection-dating"], family: ["connection-family"],
  "sentience-mvsos": ["sentience-mvsos", "sentience-noting", "sentience-observability", "sentience-accountability", "sentience-email", "sentience-resilience"],
  "experience-enjoyment": ["experience-enjoyment"],
  "experience-telemetry": ["experience-telemetry"], "builds-game-of-life": ["builds-feature"], "builds-developer-game": ["builds-feature"],
};
export function protocolsForSystem(id: string): readonly MvdProtocol[] {
  if (id === "quests-minimum-viable-day") return mvdProtocols;
  const ids = systemProtocolIds[id] ?? [];
  return mvdProtocols.filter((protocol) => ids.includes(protocol.id));
}
