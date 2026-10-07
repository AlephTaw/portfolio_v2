import { CategoryDashboard, type CategoryProgressProps } from "../shared/category-dashboard";

export function SentienceApp(props: CategoryProgressProps) {
  return <CategoryDashboard category="Sentience" {...props} />;
}
