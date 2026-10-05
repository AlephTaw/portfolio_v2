import { mvdChecklist, mvdItemId } from "./mvd-checklist-data.ts";

export const categories = [
  { name: "Health", unit: "Hp", color: "#f87171" },
  { name: "Wealth", unit: "Wp", color: "#4ade80" },
  { name: "Sentience", unit: "Mp", color: "#60a5fa" },
  { name: "Skills", unit: "Sp", color: "#facc15" },
  { name: "Connection", unit: "Ip", color: "#fb923c" },
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
