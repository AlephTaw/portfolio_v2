import { mvdChecklist, mvdItemId } from "../field-report/mvd-checklist-data.ts";

export const categories = [
  { name: "Health", unit: "Hp", color: "#83c6a3" },
  { name: "Wealth", unit: "Wp", color: "#d7bd7c" },
  { name: "Sentience", unit: "Mp", color: "#a99ed7" },
  { name: "Skills", unit: "Sp", color: "#88b8d8" },
  { name: "Connection", unit: "Ip", color: "#d7a0ad" },
] as const;

export function categoryTasks(name: string) {
  return mvdChecklist.filter((group) => group.category === name).flatMap((group) => group.items.map((item, index) => ({
    id: mvdItemId(group, index), label: item.label, group: group.title,
    points: item.points === "Action" ? 0 : Number(item.points?.match(/\d+/)?.[0] ?? 1),
    provisional: !item.points,
  })));
}

export function categoryProgress(name: string, completed: readonly string[]) {
  const tasks = categoryTasks(name);
  const earned = tasks.filter((task) => completed.includes(task.id)).reduce((sum, task) => sum + task.points, 0);
  const total = tasks.reduce((sum, task) => sum + task.points, 0);
  return { earned, total, percent: total ? earned / total * 100 : 0, level: 1 + Math.floor(earned / 10) };
}

export function categoryAchievements(name: string, completed: readonly string[]) {
  return mvdChecklist.filter((group) => group.category === name).map((group) => ({
    id: group.id, title: group.title, requirements: group.items.map((item) => item.label),
    achieved: group.items.every((_, index) => completed.includes(mvdItemId(group, index))),
  }));
}

export const systemHealth = [
  { name: "Telemetry", value: 82 }, { name: "Experiment", value: 68 },
  { name: "Axiom of Choice", value: 91 }, { name: "Techniques", value: 76 },
] as const;

export type StoryScene = { id: string; title: string; text: string; image: string };
export const initialStory: StoryScene[] = [
  { id: "observe", title: "Observe", text: "Take stock of the day. Notice what matters before choosing a direction.", image: "/build-hero-toon-v4.png" },
  { id: "choose", title: "Choose", text: "Choose one useful action that moves the current chapter forward.", image: "/build-toon-covers-v4.png" },
  { id: "reflect", title: "Reflect", text: "Leave evidence of the action, then reflect on what changed.", image: "/build-space-covers-v2.png" },
];
