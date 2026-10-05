import { FiActivity, FiAward, FiBookOpen, FiCompass, FiFlag, FiTarget, FiTool, FiTrendingUp, FiUsers } from "react-icons/fi";
import type { ActivityCategory } from "./quest-terminal/use-active-activity";

const categoryIcons = {
  Health: FiActivity,
  Wealth: FiTrendingUp,
  Connection: FiUsers,
  Sentience: FiBookOpen,
  Competence: FiTarget,
  Purpose: FiCompass,
  Experience: FiAward,
  Builds: FiTool,
  Quests: FiFlag,
};

export function ActivityCategoryIcon({ category, className }: { category: ActivityCategory; className?: string }) {
  const Icon = categoryIcons[category];
  return <Icon aria-hidden="true" className={className} />;
}
