import { subjectMasteryQuest, type SubjectMasteryCategory } from "./quest-context";
import type { ActivityCategory } from "./quest-terminal/use-active-activity";
import { mvdProtocols } from "./mvd-protocols";

type CompetenceCategory = SubjectMasteryCategory;
export type ActivityTask = { id: string; category: ActivityCategory; name: string; completed: boolean; status?: "todo" | "in-progress" | "done"; skillCategory?: CompetenceCategory; createdAt?: number; protocolIds?: readonly string[] };
type SavedActivityTask = Omit<ActivityTask, "category"> & { category: ActivityCategory | "Love" | "Interactions" | "Quest" };

export const taskStorageKey = "speedrun-irl:activity-tasks";
const healthTaskNames = [
  "Sleep", "Meals", "Meal Prep", "Strength", "Conditioning", "Mobility",
  "Posture", "Skin", "Hair", "Hygiene", "Mouth",
] as const;
const healthStarterTasks: ActivityTask[] = healthTaskNames.map((name) => ({
  id: `Health-${name.toLowerCase().replaceAll(" ", "-")}`,
  category: "Health",
  name,
  completed: false,
}));
const wealthTaskNames = [
  "Daily Earning Requirement", "Expense planning", "Job interviews", "Entrepreneurship",
] as const;
const wealthStarterTasks: ActivityTask[] = wealthTaskNames.map((name) => ({
  id: `Wealth-${name.toLowerCase().replaceAll(" ", "-")}`,
  category: "Wealth",
  name,
  completed: false,
}));
const connectionTaskNames = ["Dating", "Family", "Friendship", "Professional"] as const;
const connectionStarterTasks: ActivityTask[] = connectionTaskNames.map((name) => ({
  id: name === "Dating" ? "Connection-100-dates" : `Connection-${name.toLowerCase()}`,
  category: "Connection",
  name,
  completed: false,
}));
const sentienceTaskNames = ["MVSOS", "Vision", "Personality", "Values", "World model", "Perception"] as const;
const sentienceStarterTasks: ActivityTask[] = sentienceTaskNames.map((name) => ({
  id: `Sentience-${name.toLowerCase().replaceAll(" ", "-")}`,
  category: "Sentience",
  name,
  completed: false,
}));
const competenceStarterTasks: ActivityTask[] = subjectMasteryQuest.workingSystemModel.taskOntology.skills.map((skill) => ({
  id: `Competence-${skill.name.toLowerCase().replace("&", "and").replaceAll(" ", "-")}`,
  category: "Competence",
  name: skill.name,
  completed: false,
  skillCategory: skill.category,
}));
const experienceTaskNames = ["Vision (Board and Mini Milestone/Goals)"] as const;
const experienceStarterTasks: ActivityTask[] = experienceTaskNames.map((name) => ({
  id: `Experience-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  category: "Experience",
  name,
  completed: false,
}));
const questStarterTasks: ActivityTask[] = [{
  id: "Quest-minimum-viable-day",
  category: "Quests",
  name: "Minimum Viable Day (MVD)",
  completed: false,
}];
const originalStarterTasks = [...healthStarterTasks, ...wealthStarterTasks, ...connectionStarterTasks, ...sentienceStarterTasks, ...competenceStarterTasks, ...experienceStarterTasks, ...questStarterTasks];
const originalIds = new Set(originalStarterTasks.map((task) => task.id));
const additionalMvdTasks: ActivityTask[] = mvdProtocols.flatMap((protocol) => protocol.taskIds.filter((id) => !originalIds.has(id)).map((id) => ({
  id,
  category: id.startsWith("Builds-") ? "Builds" as const : protocol.category,
  name: id === "Sentience-accountability" ? "Accountability" : protocol.title,
  completed: false,
  ...(id === "Competence-mathematics" ? { skillCategory: "Mathematics" as const } : {}),
})));
const specifiedStarterTasks = [...originalStarterTasks, ...additionalMvdTasks].map((task) => ({
  ...task,
  protocolIds: task.id === "Quest-minimum-viable-day" ? mvdProtocols.map((protocol) => protocol.id) : mvdProtocols.filter((protocol) => protocol.taskIds.includes(task.id)).map((protocol) => protocol.id),
}));
export const starterTasks: ActivityTask[] = specifiedStarterTasks;
const legacyPlaceholders: Record<string, string> = {
  "Health-01": "Review health goals",
  "Health-02": "Practice health",
  "Health-03": "Record health progress",
  "Wealth-01": "Review wealth goals",
  "Wealth-02": "Practice wealth",
  "Wealth-03": "Record wealth progress",
  "Connection-01": "Review connection goals",
  "Connection-02": "Practice connection",
  "Connection-03": "Record connection progress",
  "Interactions-01": "Review connection goals",
  "Interactions-02": "Practice connection",
  "Interactions-03": "Record connection progress",
  "Love-01": "Review connection goals",
  "Love-02": "Practice connection",
  "Love-03": "Record connection progress",
  "Sentience-01": "Review sentience goals",
  "Sentience-02": "Practice sentience",
  "Sentience-03": "Record sentience progress",
  "Competence-01": "Review competence goals",
  "Competence-02": "Practice competence",
  "Competence-03": "Record competence progress",
  "Experience-01": "Review experience goals",
  "Experience-02": "Practice experience",
  "Experience-03": "Record experience progress",
};

export function readTasks(): ActivityTask[] {
  try {
    const saved = window.localStorage.getItem(taskStorageKey);
    if (!saved) return starterTasks;
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return starterTasks;
    const savedTasks = (parsed as SavedActivityTask[]).map((task): ActivityTask => ({
      ...task,
      category: task.category === "Love" || task.category === "Interactions" ? "Connection" : task.category === "Quest" ? "Quests" : task.category,
      name: task.category === "Love" || task.category === "Interactions"
        ? task.name.replace(/^((?:Review|Practice|Record) )(?:love|interactions)(?=\b)/i, "$1connection")
        : task.category === "Connection" && task.name.toLowerCase() === "100 dates" ? "Dating" : task.name,
    })).filter((task) => legacyPlaceholders[task.id] !== task.name && !(task.category === "Quests" && (task.id === subjectMasteryQuest.id || task.name === subjectMasteryQuest.name)));
    const orderedSpecifiedTasks = specifiedStarterTasks.map((starter) => {
      const savedTask = savedTasks.find((task) => task.category === starter.category && (
        task.id === starter.id || task.name.toLowerCase() === starter.name.toLowerCase()
      ));
      return savedTask ? { ...starter, ...savedTask, skillCategory: savedTask.skillCategory ?? starter.skillCategory, protocolIds: starter.protocolIds } : starter;
    });
    const orderedIds = new Set(orderedSpecifiedTasks.map((task) => task.id));
    return [...orderedSpecifiedTasks, ...savedTasks.filter((task) => !orderedIds.has(task.id))];
  } catch {
    return starterTasks;
  }
}


export const activityTasksChangedEvent = "mvp:activity-tasks-changed";
export function writeTasks(tasks: ActivityTask[]) {
  window.localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
  window.dispatchEvent(new Event(activityTasksChangedEvent));
}
