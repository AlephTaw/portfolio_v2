import { CategoryDashboard, type CategoryProgressProps } from "../shared/category-dashboard";

export function HealthApp(props: CategoryProgressProps) {
  return <CategoryDashboard category="Health" {...props} />;
}
