import type { CategoryProgressProps } from "../shared/category-dashboard";
import { WealthApps } from "./wealth-apps";

export function WealthApp(props: CategoryProgressProps) {
  return <WealthApps {...props} />;
}
