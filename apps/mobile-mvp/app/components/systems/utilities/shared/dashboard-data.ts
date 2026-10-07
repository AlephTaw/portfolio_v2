import { mvdChecklist, mvdItemId } from "./mvd-checklist-data.ts";
import { pointColors } from "../../../actions/game-design/point-colors.ts";

export const skillSections = ["Software skills", "Health", "Math", "Engineering Projects"] as const;

export const categories = [
  { name: "Health", unit: "Hp", color: pointColors.Health },
  { name: "Wealth", unit: "Wp", color: pointColors.Wealth },
  { name: "Sentience", unit: "Mp", color: pointColors.Sentience },
  { name: "Skills", unit: "Sp", color: pointColors.Skills },
  { name: "Connection", unit: "Ip", color: pointColors.Connection },
] as const;

export function categoryTasks(name: string) {
  return mvdChecklist.filter((group) => group.category === name).flatMap((group) => group.items.map((item, index) => ({
    id: mvdItemId(group, index), label: item.label, group: group.title,
    points: item.points === "Action" ? 0 : Number(item.points?.match(/\d+/)?.[0] ?? 1),
    provisional: !item.points,
  })));
}
export function categoryProgress(name: string, completed: readonly string[]) {
  // Shared actions can appear in both achievements but earn points only once.
  const tasks = [...new Map(categoryTasks(name).map((task) => [task.id, task])).values()];
  const earned = tasks.filter((task) => completed.includes(task.id)).reduce((sum, task) => sum + task.points, 0);
  const total = name === "Connection" ? 100 : tasks.reduce((sum, task) => sum + task.points, 0);
  return { earned, total, percent: total ? earned / total * 100 : 0, level: 1 + Math.floor(earned / 10) };
}
export function categoryAchievements(name: string, completed: readonly string[]) {
  const achievements = mvdChecklist.filter((group) => group.category === name).map((group) => ({
    id: group.id, title: group.id === "connection" ? "Minimum daily connection" : group.title,
    groupTitle: group.title, requirements: group.items.map((item) => item.label),
    subcategory: group.subcategory,
    rewardPoints: group.id === "100-new-friends-irl" ? 100 : undefined,
    achieved: group.items.length > 0 && group.id !== "100-new-friends-irl" && group.items.every((_, index) => completed.includes(mvdItemId(group, index))),
  }));
  return achievements;
}
