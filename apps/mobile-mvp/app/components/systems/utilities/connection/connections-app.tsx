import { CategoryDashboard, type CategoryProgressProps } from "../shared/category-dashboard";

export function ConnectionsApp(props: CategoryProgressProps) {
  return <CategoryDashboard category="Connections" {...props} />;
}
