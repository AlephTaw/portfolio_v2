"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";
import { FiCheck, FiChevronDown, FiCode, FiPlus } from "react-icons/fi";
import { PiSpeedometer } from "react-icons/pi";
import { CampaignActivitySummary, StatsLevelsContent } from "../stats/stats-display";
import { ActivityCategoryIcon } from "./activity-category-icon";
import { HudCategoryApp, type HudCategory } from "./hud";
import { QuestCommandHistory } from "./quest-terminal";
import { activityCategories, type ActivityCategory, useActiveActivity } from "./quest-terminal/use-active-activity";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";
import { useActivityWorkspace } from "./activity-workspace-context";
import { openWorkshopEvent, WORLD_VIEW_STATE_KEY } from "./page-transition-events";
import { PinScrollArea } from "./pin-scroll-area";
import { subjectMasteryQuest, type SubjectMasteryCategory } from "./quest-context";
import { useSplitView } from "./split-view-context";

type ActivityView = "current" | "tasks";
type TaskView = "plan" | "levels" | "kanban";
const competenceCategories = subjectMasteryQuest.workingSystemModel.taskOntology.categories;
type CompetenceCategory = SubjectMasteryCategory;
type CompetenceView = "recent" | "created" | "categories";
type ActivityTask = { id: string; category: ActivityCategory; name: string; completed: boolean; skillCategory?: CompetenceCategory; createdAt?: number };
type SavedActivityTask = Omit<ActivityTask, "category"> & { category: ActivityCategory | "Love" | "Interactions" | "Quest" };

const taskStorageKey = "speedrun-irl:activity-tasks";
const recentCompetenceKey = "speedrun-irl:recent-competence-tasks";
const activityCategoryRows = Array.from({ length: Math.ceil(activityCategories.length / 3) }, (_, index) =>
  activityCategories.slice(index * 3, index * 3 + 3),
);
const hudCategoryForActivity: Partial<Record<ActivityCategory, HudCategory>> = {
  Health: "health",
  Wealth: "wealth",
  Connection: "interactions",
  Sentience: "sentience",
  Competence: "skills",
  Experience: "experience",
};
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
const connectionTaskNames = ["100 dates"] as const;
const connectionStarterTasks: ActivityTask[] = connectionTaskNames.map((name) => ({
  id: "Connection-100-dates",
  category: "Connection",
  name,
  completed: false,
}));
const sentienceStarterTasks: ActivityTask[] = [{
  id: "Sentience-mvsos",
  category: "Sentience",
  name: "MVSOS",
  completed: false,
}];
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
  id: subjectMasteryQuest.id,
  category: "Quests",
  name: subjectMasteryQuest.name,
  completed: false,
}];
const specifiedStarterTasks = [...healthStarterTasks, ...wealthStarterTasks, ...connectionStarterTasks, ...sentienceStarterTasks, ...competenceStarterTasks, ...experienceStarterTasks, ...questStarterTasks];
const starterTasks: ActivityTask[] = specifiedStarterTasks;
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

function readTasks(): ActivityTask[] {
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
        : task.name,
    })).filter((task) => legacyPlaceholders[task.id] !== task.name);
    const orderedSpecifiedTasks = specifiedStarterTasks.map((starter) => {
      const savedTask = savedTasks.find((task) => task.category === starter.category && (
        task.id === starter.id || task.name.toLowerCase() === starter.name.toLowerCase()
      ));
      return savedTask ? { ...starter, ...savedTask, skillCategory: savedTask.skillCategory ?? starter.skillCategory } : starter;
    });
    const orderedIds = new Set(orderedSpecifiedTasks.map((task) => task.id));
    return [...orderedSpecifiedTasks, ...savedTasks.filter((task) => !orderedIds.has(task.id))];
  } catch {
    return starterTasks;
  }
}

function readRecentCompetenceIds(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(recentCompetenceKey) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function competenceCategoryFor(task: ActivityTask): CompetenceCategory {
  return task.skillCategory && competenceCategories.includes(task.skillCategory) ? task.skillCategory : "Engineering";
}

function ActivityTaskGrid({ createLabel, emptyMessage, onCreate, onSelect, tasks }: {
  createLabel: string;
  emptyMessage?: string;
  onCreate: () => void;
  onSelect: (task: ActivityTask) => void;
  tasks: ActivityTask[];
}) {
  return (
    <div aria-label={`${createLabel} tasks`} className="grid grid-cols-3 gap-3 py-4 sm:grid-cols-4 md:grid-cols-6">
      {tasks.length === 0 && emptyMessage && <p className="col-span-full py-6 text-xs uppercase tracking-[0.12em] text-white/45">{emptyMessage}</p>}
      {tasks.map((task) => (
        <button key={task.id} type="button" onClick={() => onSelect(task)} className="flex aspect-square min-w-0 cursor-pointer flex-col items-start justify-between border border-white/50 bg-white/[0.05] p-2 text-left text-white transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white">
          <span className="grid size-6 place-items-center rounded-full border border-current"><FiCheck aria-hidden="true" className={`size-3 ${task.completed ? "opacity-100" : "opacity-35"}`} /></span>
          <span className="w-full break-words text-[0.55rem] font-semibold uppercase leading-4 tracking-[0.08em]">{task.name}</span>
        </button>
      ))}
      <button aria-label={`Create ${createLabel.toLowerCase()} task`} title="Create task" type="button" onClick={onCreate} className="grid aspect-square cursor-pointer place-items-center border border-dashed border-white/45 text-white/65 hover:border-white hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white"><FiPlus aria-hidden="true" className="size-6" /></button>
    </div>
  );
}

function ActivityWorkspaceContent({
  activityView,
  choosingCategory,
  setChoosingCategory,
  showingTaskGrid,
  setShowingTaskGrid,
  selectedTaskId,
  setSelectedTaskId,
  onActivityViewChange,
}: {
  activityView: ActivityView;
  choosingCategory: boolean;
  setChoosingCategory: (choosing: boolean) => void;
  showingTaskGrid: boolean;
  setShowingTaskGrid: (showing: boolean) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (taskId: string | null) => void;
  onActivityViewChange: (view: ActivityView) => void;
}) {
  const { activeActivity, startActivity, startTaskActivity } = useActiveActivity();
  const router = useRouter();
  const { setLeftPane, splitViewOpen } = useSplitView();
  const { addCommand } = useQuestCommands();
  const [tasks, setTasks] = useState<ActivityTask[]>(() => typeof window === "undefined" ? starterTasks : readTasks());
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskView, setTaskView] = useState<TaskView>("plan");
  const [competenceView, setCompetenceView] = useState<CompetenceView>("created");
  const [hudVisible, setHudVisible] = useState(false);
  const [draftSkillCategory, setDraftSkillCategory] = useState<CompetenceCategory>("Engineering");
  const [recentCompetenceIds, setRecentCompetenceIds] = useState<string[]>(() => typeof window === "undefined" ? [] : readRecentCompetenceIds());
  const category = activeActivity?.category;
  const hudCategory = category ? hudCategoryForActivity[category] : undefined;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const taskGridVisible = Boolean(category && !choosingCategory && (showingTaskGrid || (!selectedTask && !creatingTask)));
  const competenceTasks = tasks.filter((task) => task.category === "Competence");
  const recentCompetenceTasks = recentCompetenceIds.map((id) => competenceTasks.find((task) => task.id === id)).filter((task): task is ActivityTask => Boolean(task));
  const createdCompetenceTasks = [...competenceTasks].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  useEffect(() => {
    if (!selectedTaskId && !creatingTask) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSelectedTaskId(null); setCreatingTask(false); }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedTaskId, creatingTask, setSelectedTaskId]);

  const saveTasks = (next: ActivityTask[]) => {
    setTasks(next);
    window.localStorage.setItem(taskStorageKey, JSON.stringify(next));
  };
  const recordRecentCompetenceTask = (taskId: string) => {
    const next = [taskId, ...recentCompetenceIds.filter((id) => id !== taskId)].slice(0, 12);
    setRecentCompetenceIds(next);
    window.localStorage.setItem(recentCompetenceKey, JSON.stringify(next));
  };
  const chooseCategory = (nextCategory: ActivityCategory) => {
    setSelectedTaskId(null);
    setCreatingTask(false);
    setShowingTaskGrid(true);
    setHudVisible(false);
    if (nextCategory !== category) addCommand({ type: "custom-activity", item: nextCategory });
    startActivity("Current activity", nextCategory);
    setChoosingCategory(false);
  };
  const openWorkshop = () => {
    if (splitViewOpen) {
      window.sessionStorage.setItem(WORLD_VIEW_STATE_KEY, JSON.stringify({ returnLocation: "Workshop", selectedLocation: "Workshop", workshopApplication: null, worldTreeFocused: false }));
      window.dispatchEvent(new Event(openWorkshopEvent));
      setLeftPane("world");
    } else {
      router.push("/world?domain=workshop");
    }
  };
  const createTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const openInWorkshop = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "workshop";
    const name = taskName.trim();
    if (!category || !name) return;
    const task: ActivityTask = { id: crypto.randomUUID(), category, name, completed: false, createdAt: Date.now(), ...(category === "Competence" ? { skillCategory: draftSkillCategory } : {}) };
    saveTasks([...tasks, task]);
    if (category === "Competence") recordRecentCompetenceTask(task.id);
    startTaskActivity(name, category, task.id);
    setSelectedTaskId(task.id);
    setShowingTaskGrid(false);
    setTaskName("");
    setCreatingTask(false);
    if (openInWorkshop) openWorkshop();
  };
  const selectTask = (task: ActivityTask) => {
    if (task.category === "Competence") recordRecentCompetenceTask(task.id);
    startTaskActivity(task.name, task.category, task.id);
    setSelectedTaskId(task.id);
    setCreatingTask(false);
    setShowingTaskGrid(false);
    onActivityViewChange("current");
  };
  const beginCreateTask = (skillCategory?: CompetenceCategory) => {
    if (category === "Competence") setDraftSkillCategory(skillCategory ?? "Engineering");
    setShowingTaskGrid(false);
    setCreatingTask(true);
  };
  const changeCompetenceView = (view: CompetenceView) => {
    setCompetenceView(view);
    setCreatingTask(false);
    setShowingTaskGrid(true);
  };

  return (
    <div id={`activity-${activityView}-panel`} role="tabpanel" aria-labelledby={`activity-${activityView}-tab`} className="pt-6">
      {activityView === "current" ? (
        <>
        {taskGridVisible && (
          <div className="mb-3 flex w-full items-center justify-between gap-3">
            <button type="button" title="Focus composer" onClick={() => document.getElementById("terminal-command-input")?.focus()} className="min-w-0 cursor-pointer rounded-full border border-white/40 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">Quest: {category === "Competence" || category === "Quests" ? subjectMasteryQuest.name : "Unassigned"}</button>
            <div className="flex shrink-0 items-center gap-2">
            {category === "Competence" && <label className="relative inline-flex items-center">
              <span className="sr-only">Competence view</span>
              <select value={competenceView} onChange={(event) => changeCompetenceView(event.target.value as CompetenceView)} className="cursor-pointer appearance-none rounded-full border border-white/40 bg-black py-1.5 pl-4 pr-9 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white outline-none hover:border-white focus-visible:border-white">
                <option value="recent">Recent</option>
                <option value="created">Created</option>
                <option value="categories">Categories</option>
              </select>
              <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-3 text-white/65" />
            </label>}
            <button type="button" aria-pressed={hudVisible} onClick={() => setHudVisible((visible) => !visible)} className="cursor-pointer rounded-full border border-white/40 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">{hudVisible ? "Hide HUD" : "Show HUD"}</button>
            </div>
          </div>
        )}
        {taskGridVisible && hudVisible && (
          hudCategory ? <HudCategoryApp category={hudCategory} className="mt-0" /> : <section aria-label="Quests HUD" className="border-t border-white/20 py-6 text-xs uppercase tracking-[0.12em] text-white/45">No HUD configured for Quests yet.</section>
        )}
        {!category || choosingCategory ? (
          <div aria-label="Activity categories" className="grid w-full gap-y-3 py-4">
            {activityCategoryRows.map((row) => (
              <div key={row[0]} className="grid w-full grid-cols-1">
                {row.map((item, index) => {
                  const position = row.length === 3 ? [0, 50, 100][index] : row.length === 2 ? [25, 75][index] : 50;
                  return (
                    <div key={item} className="relative col-start-1 row-start-1 aspect-square" style={{ width: "min(6rem, calc((100% - 1.5rem) / 3))", left: `${position}%`, transform: `translateX(-${position}%)` }}>
                      <motion.button layoutId={`activity-category-${item}`} transition={{ layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }} type="button" onClick={() => chooseCategory(item)} className="group flex size-full cursor-pointer flex-col items-center justify-center gap-1 bg-white/[0.05] p-1 text-center text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white">
                        <motion.span layoutId={`activity-category-icon-${item}`} className="grid size-12 shrink-0 place-items-center rounded-full"><ActivityCategoryIcon category={item} className="size-9" /></motion.span>
                        <span className="w-full break-words text-[0.55rem] font-semibold uppercase leading-4 tracking-[0.08em]">{item}</span>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : creatingTask && !showingTaskGrid ? (
          <form onSubmit={createTask} className="grid max-w-md gap-4 py-4 text-white">
            <label className="grid gap-2 text-xs uppercase tracking-[0.12em] text-white/60">Task name<input autoFocus value={taskName} onChange={(event) => setTaskName(event.target.value)} className="border border-white/40 bg-black p-3 text-sm text-white outline-none focus:border-white" /></label>
            {category === "Competence" && <label className="grid gap-2 text-xs uppercase tracking-[0.12em] text-white/60">Skill category<select value={draftSkillCategory} onChange={(event) => setDraftSkillCategory(event.target.value as CompetenceCategory)} className="border border-white/40 bg-black p-3 text-sm text-white outline-none focus:border-white">{competenceCategories.map((skillCategory) => <option key={skillCategory} value={skillCategory}>{skillCategory}</option>)}</select></label>}
            <div className="flex flex-wrap gap-3"><button disabled={!taskName.trim()} type="submit" value="task" className="cursor-pointer bg-white px-4 py-3 text-xs font-semibold uppercase text-black disabled:cursor-not-allowed disabled:opacity-40">Create task</button><button disabled={!taskName.trim()} type="submit" value="workshop" className="cursor-pointer rounded-full border border-white/45 px-4 py-3 text-xs font-semibold uppercase text-white/70 hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Create &amp; open in Workshop</button><button type="button" onClick={() => { setCreatingTask(false); setShowingTaskGrid(true); }} className="cursor-pointer px-4 py-3 text-xs uppercase text-white/60 hover:text-white">Cancel</button></div>
          </form>
        ) : selectedTask && !showingTaskGrid ? (
          <section aria-label={`${selectedTask.name} activity`} className="min-h-72 py-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">{selectedTask.name}</h2>
              <button type="button" onClick={openWorkshop} className="cursor-pointer rounded-full border border-white/45 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">Open in Workshop</button>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-white/50">{selectedTask.category === "Competence" ? competenceCategoryFor(selectedTask) : selectedTask.category} · {selectedTask.completed ? "Completed" : "Ready"}</p>
            <button type="button" onClick={() => saveTasks(tasks.map((task) => task.id === selectedTask.id ? { ...task, completed: !task.completed } : task))} className="mt-6 cursor-pointer bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-black">{selectedTask.completed ? "Mark incomplete" : "Complete task"}</button>
          </section>
        ) : category === "Competence" ? (
          competenceView === "categories" ? (
            <div aria-label="Competence categories" className="mt-8 divide-y divide-white/20">
              {competenceCategories.map((skillCategory) => (
                <section key={skillCategory} aria-labelledby={`competence-${skillCategory.toLowerCase().replaceAll(" ", "-")}`} className="px-4 py-6 sm:px-6">
                  <h3 id={`competence-${skillCategory.toLowerCase().replaceAll(" ", "-")}`} className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/55">{skillCategory}</h3>
                  <ActivityTaskGrid createLabel={skillCategory} emptyMessage="No skills in this category yet" tasks={competenceTasks.filter((task) => competenceCategoryFor(task) === skillCategory)} onSelect={selectTask} onCreate={() => beginCreateTask(skillCategory)} />
                </section>
              ))}
            </div>
          ) : (
            <ActivityTaskGrid createLabel="Competence" emptyMessage={competenceView === "recent" ? "No recently opened skills" : undefined} tasks={competenceView === "recent" ? recentCompetenceTasks : createdCompetenceTasks} onSelect={selectTask} onCreate={() => beginCreateTask()} />
          )
        ) : (
          <ActivityTaskGrid createLabel={category} tasks={tasks.filter((task) => task.category === category)} onSelect={selectTask} onCreate={() => beginCreateTask()} />
        )}
        </>
      ) : (
        <div>
          <div aria-label="Task views" className="flex flex-wrap gap-2">
            {(["plan", "levels", "kanban"] as const).map((view) => (
              <button key={view} type="button" aria-pressed={taskView === view} onClick={() => setTaskView(view)} className={`cursor-pointer rounded-full border px-4 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] transition-colors ${taskView === view ? "border-white bg-white text-black" : "border-white/40 text-white/60 hover:border-white hover:text-white"}`}>{view}</button>
            ))}
          </div>
          {taskView === "levels" ? <div className="mt-6"><StatsLevelsContent className="border-y-0" /></div> : taskView === "plan" ? (
            <div className="mt-6 grid min-h-72 place-items-center text-sm uppercase tracking-[0.18em] text-white/35">Planning view</div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {([false, true] as const).map((completed) => (
                <section key={String(completed)} className="min-h-52 border border-white/25 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{completed ? "Done" : "To do"}</h3>
                  <div className="mt-4 grid gap-2">{tasks.filter((task) => task.completed === completed).map((task) => <button key={task.id} type="button" onClick={() => selectTask(task)} className="cursor-pointer border border-white/25 p-3 text-left text-xs uppercase tracking-[0.08em] hover:border-white">{task.name}<span className="ml-2 text-white/40">· {task.category}</span></button>)}</div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function TerminalSectionToggle({
  controls,
  kind,
  onToggle,
  visible,
}: {
  controls: string;
  kind: "summary" | "code";
  onToggle: () => void;
  visible: boolean;
}) {
  const label = kind === "summary" ? "campaign and activity summary" : "terminal content";
  const Icon = kind === "summary" ? PiSpeedometer : FiCode;

  return (
    <button
      aria-controls={controls}
      aria-expanded={visible}
      aria-label={`${visible ? "Hide" : "Show"} ${label}`}
      className="relative flex size-8 shrink-0 cursor-pointer items-center justify-start text-white/55 transition-colors hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
      onClick={onToggle}
      title={`${visible ? "Hide" : "Show"} ${label}`}
      type="button"
    >
      <span className="relative size-4">
        <Icon aria-hidden="true" className="size-4" />
        {!visible && <svg aria-hidden="true" className="absolute inset-0 size-4" fill="none" viewBox="0 0 16 16"><path d="M2 14 14 2" stroke="currentColor" strokeWidth="1.5" /></svg>}
      </span>
    </button>
  );
}

export function TerminalActivityWorkspace() {
  const { activityOpen, setActivityOpen } = useActivityWorkspace();
  const { splitMode, splitViewOpen } = useSplitView();
  const { activeActivity } = useActiveActivity();
  const [summaryVisible, setSummaryVisible] = useState(true);
  const [terminalContentVisible, setTerminalContentVisible] = useState(true);
  const [activityView, setActivityView] = useState<ActivityView>("current");
  const [choosingCategory, setChoosingCategory] = useState(false);
  const [showingTaskGrid, setShowingTaskGrid] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const openCurrentActivity = () => {
    const tasks = readTasks();
    const selectedTask = tasks.find((task) => task.id === activeActivity?.taskId)
      ?? tasks.find((task) => task.category === activeActivity?.category && task.name === activeActivity?.name);
    setSelectedTaskId(selectedTask?.id ?? null);
    setShowingTaskGrid(false);
    setChoosingCategory(false);
    setActivityView("current");
    setActivityOpen(true);
  };
  return (
    <LayoutGroup id="activity-category-grid"><div className="terminal-left-rail-layout flex min-h-0 flex-1 flex-col" data-vertical-split={splitViewOpen && splitMode === "vertical"}>
      <div className="terminal-summary-rail-row sticky top-0 z-20 grid min-h-10 shrink-0 grid-cols-[1.5rem_minmax(0,1fr)] gap-1 bg-black">
        <div className="mt-1">
          <TerminalSectionToggle controls="terminal-campaign-activity-summary" kind="summary" onToggle={() => setSummaryVisible((visible) => !visible)} visible={summaryVisible} />
        </div>
        <div id="terminal-campaign-activity-summary" className="[&>section]:mb-0">
          {summaryVisible && <CampaignActivitySummary expanded={activityOpen} interactive={false} onToggle={() => { if (activityOpen) setChoosingCategory(false); setActivityOpen(!activityOpen); }} summary="activity" activityView={activityView} categoryPickerOpen={activityOpen && choosingCategory} onArcClick={() => { setActivityView("current"); setActivityOpen(true); setChoosingCategory(true); }} onCategoryClick={() => { setActivityView("current"); setActivityOpen(true); setChoosingCategory(false); setShowingTaskGrid(true); }} onCurrentActivityClick={openCurrentActivity} onActivityViewChange={(view) => { setChoosingCategory(false); setShowingTaskGrid(false); setActivityView(view); setActivityOpen(true); }} />}
        </div>
      </div>
      {activityOpen ? (
        <PinScrollArea className="pb-24" id="terminal-activity-workspace" wrapperClassName="flex-1">
          <ActivityWorkspaceContent activityView={activityView} choosingCategory={choosingCategory} setChoosingCategory={setChoosingCategory} showingTaskGrid={showingTaskGrid} setShowingTaskGrid={setShowingTaskGrid} selectedTaskId={selectedTaskId} setSelectedTaskId={setSelectedTaskId} onActivityViewChange={setActivityView} />
        </PinScrollArea>
      ) : <div id="terminal-activity-workspace" />}
      {!activityOpen && <section aria-label="Terminal" className="flex min-h-0 flex-1 flex-col">
        <div className="terminal-code-rail-row sticky top-0 z-10 shrink-0 bg-black py-1">
          <TerminalSectionToggle controls="terminal-code-content" kind="code" onToggle={() => setTerminalContentVisible((visible) => !visible)} visible={terminalContentVisible} />
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col" id="terminal-code-content">
          {terminalContentVisible && <div aria-label="Terminal ready" className="relative flex min-h-0 flex-1 flex-col font-mono"><QuestCommandHistory scrollable showPrompt /></div>}
        </div>
      </section>}
    </div></LayoutGroup>
  );
}
