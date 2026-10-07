"use client";

import { CategoryStatus, type AchievementApps } from "./category-status";
import { categories, categoryTasks } from "./dashboard-data";
import { ConnectionsGrid } from "../connection/connections-grid";

export type CategoryProgressProps = { completed: readonly string[]; onToggle: (id: string) => void };
type DashboardCategory = "Health" | "Wealth" | "Sentience" | "Skills" | "Connections";

export function CategoryDashboard({ category, completed, onToggle, apps }: CategoryProgressProps & { category: DashboardCategory; apps?: AchievementApps }) {
  const dashboard = categories.find((item) => item.name === (category === "Connections" ? "Connection" : category))!;
  const provisional = categoryTasks(dashboard.name).some((task) => task.provisional);
  return <section aria-label={`${category} app`} className="view-glass rounded-2xl px-4 py-3">
    <CategoryStatus category={dashboard} displayName={category} completedMvd={completed} toggleMvd={onToggle} apps={apps} />
    {category === "Connections" && <ConnectionsGrid />}
    <p className="text-[11px] leading-5 text-white/35">Starter checklist · session progress{provisional ? " · unassigned point values are provisional" : ""}</p>
  </section>;
}
