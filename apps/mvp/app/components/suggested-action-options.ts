import { FiActivity, FiFilm, FiLayers, FiLayout, FiMonitor, FiPlayCircle, FiSettings, FiTerminal, FiUser } from "react-icons/fi";
import { GiKnapsack } from "react-icons/gi";
import { PlanningIcon } from "./planning-icon";

export const suggestedActionCategories = [
  { id: "activities", label: "Activities", Icon: FiActivity },
  { id: "admin", label: "Admin", Icon: FiSettings },
  { id: "arc", label: "Arc", Icon: FiFilm },
  { id: "current-activity", label: "Current activity", Icon: FiPlayCircle },
  { id: "inventory", label: "Inventory", Icon: GiKnapsack },
  { id: "planning", label: "Planning", Icon: PlanningIcon },
  { id: "profile", label: "Character", Icon: FiUser },
  { id: "layout", label: "Screen layout", Icon: FiLayout },
  { id: "systems", label: "Systems", Icon: FiLayers },
  { id: "terminal", label: "Terminal", Icon: FiTerminal },
  { id: "views", label: "Views", Icon: FiMonitor },
] as const;
export type SuggestedActionDestination = Exclude<(typeof suggestedActionCategories)[number]["id"], "layout" | "views">;
