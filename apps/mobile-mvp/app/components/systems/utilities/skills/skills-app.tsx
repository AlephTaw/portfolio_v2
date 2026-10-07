import { CategoryDashboard, type CategoryProgressProps } from "../shared/category-dashboard";

export function SkillsApp(props: CategoryProgressProps) {
  return <CategoryDashboard category="Skills" {...props} />;
}
