"use client";

import { useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { LayoutGroup, motion } from "framer-motion";
import { FiChevronDown, FiEdit2, FiGrid, FiList, FiPlus } from "react-icons/fi";
import { CampaignActivitySummary, CampaignDetailsContent } from "../state/state-display";
import { ComposerDockContext } from "./composer-dock-context";
import { ActivityCategoryIcon } from "./activity-category-icon";
import { HudCategoryApp, type HudCategory } from "./hud";
import { QuestHud } from "./hud/quest-hud";
import { QuestCommandHistory } from "./quest-terminal";
import { activityCategories, readActiveActivity, type ActivityCategory, useActiveActivity } from "./quest-terminal/use-active-activity";
import { useQuestCommands } from "./quest-terminal/use-quest-commands";
import { useActivityWorkspace } from "./activity-workspace-context";
import { openWorkshopEvent, WORLD_VIEW_STATE_KEY } from "./page-transition-events";
import { PinScrollArea } from "./pin-scroll-area";
import { subjectMasteryQuest, type SubjectMasteryCategory } from "./quest-context";
import { useSplitView } from "./split-view-context";
import { ActionsSelectedView } from "./actions-selected-view";
import { useActionsView } from "./actions-view-context";
import { activityTasksChangedEvent, readTasks, starterTasks, writeTasks, type ActivityTask } from "./activity-task-data";
import { protocolsForTask } from "./mvd-protocols";
import { MvdProtocolContent } from "./mvd-protocol-content";

type ActivityView = "current" | "tasks";
const competenceCategories = subjectMasteryQuest.workingSystemModel.taskOntology.categories;
type CompetenceCategory = SubjectMasteryCategory;
type CompetenceView = "recent" | "created" | "categories";

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

function ActivityTaskListItem({ task, onSelect, expanded }: { task: ActivityTask; onSelect: (task: ActivityTask) => void; expanded: boolean }) {
  const titleId = useId();
  const protocols = protocolsForTask(task);
  return (
    <li>
      <div className={`flex items-center gap-1 rounded-lg transition-colors ${expanded ? "bg-white/[0.04]" : ""}`}>
        <button type="button" id={titleId} onClick={() => onSelect(task)} className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/85 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">
          <span className="min-w-0 flex-1 break-words">{task.name}</span>
          <span className="shrink-0 text-xs text-white/45">{task.completed ? "Completed" : "Ready"}</span>
        </button>
        <button type="button" aria-label={`Open ${task.name} activity`} onClick={() => onSelect(task)} className="min-h-11 shrink-0 cursor-pointer rounded-lg px-3 py-2 text-xs text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">Open</button>
      </div>
      {expanded && protocols.length > 0 && <div aria-labelledby={titleId} className="px-3 pb-4"><MvdProtocolContent protocols={protocols} /></div>}
    </li>
  );
}

function ActivityTaskCollection({ createLabel, emptyMessage, onCreate, onSelect, tasks, list = false, expanded = false }: {
  createLabel: string;
  emptyMessage?: string;
  onCreate: () => void;
  onSelect: (task: ActivityTask) => void;
  tasks: ActivityTask[];
  list?: boolean;
  expanded?: boolean;
}) {
  if (list) return (
    <div aria-label={`${createLabel} task list`} className="py-4">
      {tasks.length === 0 && emptyMessage && <p className="py-6 text-sm text-white/45">{emptyMessage}</p>}
      <ul className="space-y-1">
        {tasks.map((task) => <ActivityTaskListItem key={task.id} task={task} onSelect={onSelect} expanded={expanded} />)}
      </ul>
      <button type="button" aria-label={`Create ${createLabel.toLowerCase()} task`} onClick={onCreate} className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"><FiPlus aria-hidden="true" className="size-4" />{createLabel === "Quests" ? "Create quest" : "Create task"}</button>
    </div>
  );
  return (
    <div aria-label={`${createLabel} tasks`} className="grid grid-cols-3 gap-3 py-4 sm:grid-cols-4 md:grid-cols-6">
      {tasks.length === 0 && emptyMessage && <p className="col-span-full py-6 text-sm text-white/45">{emptyMessage}</p>}
      {tasks.map((task) => (
        <button key={task.id} type="button" onClick={() => onSelect(task)} className="flex aspect-square min-w-0 cursor-pointer flex-col items-start justify-end rounded-2xl border border-white/15 bg-white/[0.04] p-2 text-left text-white/85 transition-colors hover:border-white/45 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white">
          <span className="w-full break-words text-[0.6875rem] font-medium leading-4 sm:text-xs">{task.name}</span>
        </button>
      ))}
      <button aria-label={`Create ${createLabel.toLowerCase()} task`} title="Create task" type="button" onClick={onCreate} className="grid aspect-square cursor-pointer place-items-center rounded-2xl border border-dashed border-white/25 text-white/55 transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white"><FiPlus aria-hidden="true" className="size-6" /></button>
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
  const { activeActivity, startActivity, startTaskActivity, updateActivityName } = useActiveActivity();
  const { setActivityProgress } = useActivityWorkspace();
  const router = useRouter();
  const { setLeftPane, splitViewOpen } = useSplitView();
  const { addCommand } = useQuestCommands();
  const [tasks, setTasks] = useState<ActivityTask[]>(() => typeof window === "undefined" ? starterTasks : readTasks());
  useEffect(() => {
    const refresh = () => setTasks(readTasks());
    window.addEventListener(activityTasksChangedEvent, refresh);
    return () => window.removeEventListener(activityTasksChangedEvent, refresh);
  }, []);
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [editingTaskName, setEditingTaskName] = useState(false);
  const [draftTaskName, setDraftTaskName] = useState("");
  const [competenceView, setCompetenceView] = useState<CompetenceView>("created");
  const [hudVisible, setHudVisible] = useState(false);
  const [categoryLists, setCategoryLists] = useState<Partial<Record<ActivityCategory, boolean>>>({});
  const [categoryExpanded, setCategoryExpanded] = useState<Partial<Record<ActivityCategory, boolean>>>({});
  const [draftSkillCategory, setDraftSkillCategory] = useState<CompetenceCategory>("Engineering");
  const [recentCompetenceIds, setRecentCompetenceIds] = useState<string[]>(() => typeof window === "undefined" ? [] : readRecentCompetenceIds());
  const category = activeActivity?.category;
  const taskListVisible = category ? categoryLists[category] ?? false : false;
  const taskListExpanded = category ? categoryExpanded[category] ?? false : false;
  const hudCategory = category ? hudCategoryForActivity[category] : undefined;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const taskGridVisible = Boolean(category && !choosingCategory && (showingTaskGrid || (!selectedTask && !creatingTask)));
  const competenceTasks = tasks.filter((task) => task.category === "Competence");
  const recentCompetenceTasks = recentCompetenceIds.map((id) => competenceTasks.find((task) => task.id === id)).filter((task): task is ActivityTask => Boolean(task));
  const createdCompetenceTasks = [...competenceTasks].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  useEffect(() => {
    const categoryTasks = category ? tasks.filter((task) => task.category === category) : [];
    const next = category ? { category, completed: categoryTasks.filter((task) => task.completed).length, total: categoryTasks.length } : null;
    setActivityProgress((current) => current?.category === next?.category && current?.completed === next?.completed && current?.total === next?.total ? current : next);
  }, [category, setActivityProgress, tasks]);

  useEffect(() => {
    if (!selectedTaskId && !creatingTask) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (editingTaskName) { setEditingTaskName(false); return; }
        setSelectedTaskId(null);
        setCreatingTask(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedTaskId, creatingTask, editingTaskName, setSelectedTaskId]);

  const saveTasks = (next: ActivityTask[]) => {
    setTasks(next);
    writeTasks(next);
  };
  const recordRecentCompetenceTask = (taskId: string) => {
    const next = [taskId, ...recentCompetenceIds.filter((id) => id !== taskId)].slice(0, 12);
    setRecentCompetenceIds(next);
    window.localStorage.setItem(recentCompetenceKey, JSON.stringify(next));
  };
  const chooseCategory = (nextCategory: ActivityCategory) => {
    setEditingTaskName(false);
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
    setEditingTaskName(false);
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
  const saveTaskName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTask) return;
    const name = draftTaskName.trim();
    if (!name) return;
    saveTasks(tasks.map((task) => task.id === selectedTask.id ? { ...task, name } : task));
    if (activeActivity?.taskId === selectedTask.id) updateActivityName(name);
    setEditingTaskName(false);
  };

  return (
    <div id={`activity-${activityView}-panel`} role="tabpanel" aria-labelledby={`activity-${activityView}-tab`} className={`${activityView === "tasks" ? "" : "pt-6"} font-sans`}>
      {activityView === "current" ? (
        <>
        {taskGridVisible && (
          <div className="mb-3 flex w-full items-center justify-between gap-3">
            <button type="button" title="Focus composer" onClick={() => document.getElementById("terminal-command-input")?.focus()} className="min-w-0 cursor-pointer rounded-full border border-white/25 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">Quest: {category === "Health" || category === "Quests" ? "Minimum Viable Day (MVD)" : category === "Competence" ? subjectMasteryQuest.name : "Unassigned"}</button>
            <div className="flex shrink-0 items-center gap-2">
            {category === "Competence" && <label className="relative inline-flex items-center">
              <span className="sr-only">Competence view</span>
              <select value={competenceView} onChange={(event) => changeCompetenceView(event.target.value as CompetenceView)} className="cursor-pointer appearance-none rounded-full border border-white/25 bg-black py-1.5 pl-4 pr-9 text-xs font-medium text-white/80 outline-none hover:border-white/60 focus-visible:border-white">
                <option value="recent">Recent</option>
                <option value="created">Created</option>
                <option value="categories">Categories</option>
              </select>
              <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-3 text-white/65" />
            </label>}
            <button type="button" aria-pressed={hudVisible} onClick={() => setHudVisible((visible) => !visible)} className={`cursor-pointer rounded-full border px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${hudVisible ? "border-white bg-white text-black" : "border-white/40 bg-transparent text-white/65 hover:border-white hover:text-white"}`}>HUD</button>
            </div>
          </div>
        )}
        {taskGridVisible && category && (
          <div className="mb-3 flex items-center justify-end gap-2">
            {taskListVisible && <button type="button" aria-expanded={taskListExpanded} onClick={() => setCategoryExpanded((current) => ({ ...current, [category]: !current[category] }))} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/40 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white/65 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white">
              <FiChevronDown aria-hidden="true" className={`size-3 transition-transform ${taskListExpanded ? "rotate-180" : ""}`} />
              {taskListExpanded ? "Collapse all" : "Expand all"}
            </button>}
            <button type="button" aria-label={`Show ${category} tasks as a ${taskListVisible ? "grid" : "list"}`} aria-pressed={taskListVisible} onClick={() => setCategoryLists((current) => ({ ...current, [category]: !current[category] }))} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${taskListVisible ? "border-white bg-white text-black" : "border-white/40 text-white/65 hover:border-white hover:text-white"}`}>
              {taskListVisible ? <FiGrid aria-hidden="true" className="size-3" /> : <FiList aria-hidden="true" className="size-3" />}
              {taskListVisible ? "Grid" : "List"}
            </button>
          </div>
        )}
        {taskGridVisible && hudVisible && (
          hudCategory ? <HudCategoryApp category={hudCategory} className="mt-0" /> : <QuestHud />
        )}
        {!category || choosingCategory ? (
          <div aria-label="Activity categories" className="grid w-full gap-y-3 py-4">
            {activityCategoryRows.map((row) => (
              <div key={row[0]} className="grid w-full grid-cols-1">
                {row.map((item, index) => {
                  const position = row.length === 3 ? [0, 50, 100][index] : row.length === 2 ? [25, 75][index] : 50;
                  return (
                    <div key={item} className="relative col-start-1 row-start-1 aspect-square" style={{ width: "min(6rem, calc((100% - 1.5rem) / 3))", left: `${position}%`, transform: `translateX(-${position}%)` }}>
                      <motion.button layoutId={`activity-category-${item}`} transition={{ layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }} type="button" onClick={() => chooseCategory(item)} aria-pressed={category === item} className={`group flex size-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border bg-white/[0.04] p-1 text-center text-white/85 transition-colors hover:border-white/45 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white ${category === item ? "border-white/60" : "border-transparent"}`}>
                        <motion.span layoutId={`activity-category-icon-${item}`} className="grid size-12 shrink-0 place-items-center rounded-full"><ActivityCategoryIcon category={item} className="size-9" /></motion.span>
                        <span className="w-full break-words text-[0.65rem] font-medium leading-4">{item}</span>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : creatingTask && !showingTaskGrid ? (
          <form onSubmit={createTask} className="grid max-w-md gap-4 py-4 text-white">
            <label className="grid gap-2 text-xs font-medium text-white/60">Task name<input autoFocus value={taskName} onChange={(event) => setTaskName(event.target.value)} className="rounded-2xl border border-white/20 bg-white/[0.04] p-3 font-sans text-sm text-white outline-none focus:border-white/60" /></label>
            {category === "Competence" && <label className="grid gap-2 text-xs font-medium text-white/60">Skill category<select value={draftSkillCategory} onChange={(event) => setDraftSkillCategory(event.target.value as CompetenceCategory)} className="rounded-2xl border border-white/20 bg-black p-3 font-sans text-sm text-white outline-none focus:border-white/60">{competenceCategories.map((skillCategory) => <option key={skillCategory} value={skillCategory}>{skillCategory}</option>)}</select></label>}
            <div className="flex flex-wrap gap-3"><button disabled={!taskName.trim()} type="submit" value="task" className="cursor-pointer rounded-full bg-white px-4 py-2.5 text-xs font-medium text-black disabled:cursor-not-allowed disabled:opacity-40">Create task</button><button disabled={!taskName.trim()} type="submit" value="workshop" className="cursor-pointer rounded-full border border-white/25 px-4 py-2.5 text-xs font-medium text-white/70 hover:border-white/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Create &amp; open in Workshop</button><button type="button" onClick={() => { setCreatingTask(false); setShowingTaskGrid(true); }} className="cursor-pointer px-4 py-2.5 text-xs text-white/60 hover:text-white">Cancel</button></div>
          </form>
        ) : selectedTask && !showingTaskGrid ? (
          <section aria-label={`${selectedTask.name} activity`} className="min-h-72 py-4 text-white">
            <div className="flex flex-wrap items-center gap-3">
              {editingTaskName ? (
                <form className="flex min-w-0 items-center gap-2" onSubmit={saveTaskName}>
                  <input aria-label="Task name" autoFocus className="min-w-0 rounded-lg border border-white/40 bg-white/[0.06] px-2 py-1 text-base text-white outline-none focus:border-white" onChange={(event) => setDraftTaskName(event.target.value)} value={draftTaskName} />
                  <button className="cursor-pointer rounded-lg px-2 py-1 text-xs text-white hover:bg-white/10" type="submit">Save</button>
                  <button className="cursor-pointer rounded-lg px-2 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white" onClick={() => setEditingTaskName(false)} type="button">Cancel</button>
                </form>
              ) : (
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="min-w-0 text-base font-medium">{selectedTask.name}</h2>
                  <button aria-label={`Edit ${selectedTask.name}`} className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={() => { setDraftTaskName(selectedTask.name); setEditingTaskName(true); }} type="button"><FiEdit2 aria-hidden="true" className="size-3.5" /></button>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-white/50">{selectedTask.category === "Competence" ? competenceCategoryFor(selectedTask) : selectedTask.category} · {selectedTask.completed ? "Completed" : "Ready"}</p>
            <MvdProtocolContent protocols={protocolsForTask(selectedTask)} />
            <button type="button" onClick={() => saveTasks(tasks.map((task) => task.id === selectedTask.id ? { ...task, completed: !task.completed, status: task.completed ? "todo" : "done" } : task))} className="mt-6 cursor-pointer rounded-full bg-white px-4 py-2.5 text-xs font-medium text-black">{selectedTask.completed ? "Mark incomplete" : "Complete task"}</button>
          </section>
        ) : category === "Competence" ? (
          competenceView === "categories" ? (
            <div aria-label="Competence categories" className="mt-8 divide-y divide-white/20">
              {competenceCategories.map((skillCategory) => (
                <section key={skillCategory} aria-labelledby={`competence-${skillCategory.toLowerCase().replaceAll(" ", "-")}`} className="px-4 py-6 sm:px-6">
                  <h3 id={`competence-${skillCategory.toLowerCase().replaceAll(" ", "-")}`} className="text-sm font-medium text-white/70">{skillCategory}</h3>
                  <ActivityTaskCollection list={taskListVisible} expanded={taskListExpanded} createLabel={skillCategory} emptyMessage="No skills in this category yet" tasks={competenceTasks.filter((task) => competenceCategoryFor(task) === skillCategory)} onSelect={selectTask} onCreate={() => beginCreateTask(skillCategory)} />
                </section>
              ))}
            </div>
          ) : (
            <ActivityTaskCollection list={taskListVisible} expanded={taskListExpanded} createLabel="Competence" emptyMessage={competenceView === "recent" ? "No recently opened skills" : undefined} tasks={competenceView === "recent" ? recentCompetenceTasks : createdCompetenceTasks} onSelect={selectTask} onCreate={() => beginCreateTask()} />
          )
        ) : (
          <ActivityTaskCollection list={taskListVisible} expanded={taskListExpanded} createLabel={category} tasks={tasks.filter((task) => task.category === category)} onSelect={selectTask} onCreate={() => beginCreateTask()} />
        )}
        </>
      ) : (
        <CampaignDetailsContent compact className="mt-0" id="map-campaign-view" onSelectTask={selectTask} />
      )}

    </div>
  );
}

export function ActionsWorkspace({ workshop = false, showSummary = true }: { workshop?: boolean; showSummary?: boolean }) {
  const { activityOpen, navigationRequest, setActivityOpen, setDetailTaskId, setActivityMapOpen } = useActivityWorkspace();
  const { view, chatVisible } = useActionsView();
  const { startActivity, startTaskActivity } = useActiveActivity();
  const { addCommand } = useQuestCommands();
  // Workshop history uses the shared rail's notes visibility control.
  const displayedView = workshop ? "notes" : view;
  const fullWidthTerminal = !activityOpen && (workshop || ["code", "notes", "notes-hidden", "code-preview", "minimap", "world-tree"].includes(displayedView));
  const composerDock = useContext(ComposerDockContext);
  const [activityView, setActivityView] = useState<ActivityView>("current");
  const [choosingCategory, setChoosingCategory] = useState(false);
  const [showingTaskGrid, setShowingTaskGrid] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [categorySelectionId, setCategorySelectionId] = useState(0);
  const handledNavigationRequest = useRef(0);
  useEffect(() => {
    if (!workshop) setActivityMapOpen(activityOpen && activityView === "tasks");
  }, [activityOpen, activityView, setActivityMapOpen, workshop]);
  useEffect(() => {
    if (!workshop) setDetailTaskId(activityOpen && activityView === "current" && !choosingCategory && !showingTaskGrid ? selectedTaskId : null);
  }, [activityOpen, activityView, choosingCategory, selectedTaskId, setDetailTaskId, showingTaskGrid, workshop]);
  useEffect(() => () => {
    if (!workshop) setDetailTaskId(null);
  }, [setDetailTaskId, workshop]);
  const openCurrentActivity = useCallback(() => {
    const activeActivity = readActiveActivity();
    const tasks = readTasks();
    const selectedTask = tasks.find((task) => task.id === activeActivity?.taskId)
      ?? tasks.find((task) => task.category === activeActivity?.category && task.name === activeActivity?.name);
    setSelectedTaskId(selectedTask?.id ?? null);
    setShowingTaskGrid(false);
    setChoosingCategory(false);
    setActivityView("current");
    setActivityOpen(true);
  }, [setActivityOpen]);

  useEffect(() => {
    if (workshop || !navigationRequest || handledNavigationRequest.current === navigationRequest.id) return;
    handledNavigationRequest.current = navigationRequest.id;
    const frame = window.requestAnimationFrame(() => {
      if (navigationRequest.action === "tasks") {
        setActivityView("tasks");
        setChoosingCategory(false);
        setShowingTaskGrid(false);
        setActivityOpen(true);
      } else if (navigationRequest.action === "task") {
        const task = readTasks().find((entry) => entry.id === navigationRequest.taskId);
        if (!task) return;
        startTaskActivity(task.name, task.category, task.id);
        openCurrentActivity();
      } else if (navigationRequest.action === "current") {
        openCurrentActivity();
      } else if (navigationRequest.action === "task-grid") {
        setActivityView("current");
        setChoosingCategory(false);
        setShowingTaskGrid(true);
        setSelectedTaskId(null);
        setActivityOpen(true);
      } else if (navigationRequest.action === "categories") {
        setActivityView("current");
        setChoosingCategory(true);
        setShowingTaskGrid(false);
        setSelectedTaskId(null);
      } else if (navigationRequest.action === "category") {
        const category = navigationRequest.category;
        if (readActiveActivity()?.category !== category) addCommand({ type: "custom-activity", item: category });
        startActivity("Current activity", category);
        setCategorySelectionId(navigationRequest.id);
        setActivityView("current");
        setChoosingCategory(false);
        setShowingTaskGrid(true);
        setSelectedTaskId(null);
        setActivityOpen(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [navigationRequest, openCurrentActivity, workshop, addCommand, startActivity, startTaskActivity, setActivityOpen]);
  return (
    <LayoutGroup id={workshop ? "workshop-activity-category-grid" : "activity-category-grid"}><div className={`mx-auto flex min-h-0 w-full max-w-[var(--composer-max-width,72rem)] flex-1 flex-col ${workshop ? "relative h-full" : ""} ${fullWidthTerminal ? (workshop ? "" : "pl-1 pr-[var(--composer-gutter,1.5rem)]") : "pl-[var(--composer-gutter,1.5rem)] pr-[calc(var(--composer-gutter,1.5rem)+2rem)]"}`}>
      {showSummary && composerDock && createPortal(<div className="w-fit max-w-full [&>section]:mb-0" id={workshop ? "workshop-campaign-activity-summary" : "terminal-campaign-activity-summary"}>
        <CampaignActivitySummary expanded={activityOpen} summary="activity" activityView={activityView} onCurrentActivityClick={openCurrentActivity} onActivityViewChange={(view) => { setChoosingCategory(false); setShowingTaskGrid(false); setActivityView(view); setActivityOpen(true); }} />
      </div>, composerDock)}
      <div className="relative flex min-h-0 flex-1 flex-col" id={workshop ? "workshop-terminal-main-content" : "terminal-main-content"}>
        {activityOpen && (
          <PinScrollArea className="pb-[calc(var(--composer-height)+1rem)]" wrapperClassName="flex-1">
            <ActivityWorkspaceContent key={categorySelectionId} activityView={activityView} choosingCategory={choosingCategory} setChoosingCategory={setChoosingCategory} showingTaskGrid={showingTaskGrid} setShowingTaskGrid={setShowingTaskGrid} selectedTaskId={selectedTaskId} setSelectedTaskId={setSelectedTaskId} onActivityViewChange={setActivityView} />
          </PinScrollArea>
        )}
        <div aria-hidden={activityOpen} className={`relative min-h-0 flex-1 flex-col ${activityOpen ? "hidden" : "flex"}`} inert={activityOpen}>
          {displayedView === "code" || displayedView === "notes" || displayedView === "notes-hidden" ? (
            chatVisible ?
            <div aria-label="Command history" className="relative flex min-h-0 flex-1 flex-col"><QuestCommandHistory scrollable /></div>
            : <div aria-label="Terminal with dialogue history hidden" className="min-h-0 flex-1" />
          ) : <ActionsSelectedView key={displayedView} view={displayedView} />}
        </div>
      </div>
    </div></LayoutGroup>
  );
}
