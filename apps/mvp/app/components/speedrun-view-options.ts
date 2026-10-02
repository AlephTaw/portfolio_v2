import { FiCode, FiFileText, FiLayout } from "react-icons/fi";
import type { ActionsView } from "./actions-view-context";

export const speedrunViews = [
  { view: "notes-hidden", label: "No notes", actionLabel: "Default view", icon: FiLayout },
  { view: "notes", label: "Notes", actionLabel: "Notes view", icon: FiFileText },
  { view: "code-preview", label: "Code view", actionLabel: "Code view", icon: FiCode },
] as const satisfies ReadonlyArray<{
  view: ActionsView;
  label: string;
  actionLabel: string;
  icon: typeof FiCode;
}>;

export function findSpeedrunViewAction(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();
  return speedrunViews.find(({ actionLabel }) => actionLabel.toLowerCase() === normalized) ?? null;
}
