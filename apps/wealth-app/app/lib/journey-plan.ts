export type Objective = { id: string; title: string; minutes: number; status: "queued" | "active" | "waiting" | "done" };
export type JourneyPlan = { version: 1; start: string; showLoop: boolean; objectives: Objective[] };
export type ScheduledObjective = Objective & { begins: number; ends: number };
export function validStart(value: string) {
  return Number.isFinite(easternStart(value));
}
function easternStart(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return NaN;
  const [year, month, day, hour, minute] = value.split(/\D/).map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  let guess = target;
  for (let step = 0; step < 4; step++) {
    const parts = formatter.formatToParts(new Date(guess));
    const n = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const rendered = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"));
    if (rendered === target) {
      const normalized = new Date(target).toISOString().slice(0, 16);
      return normalized === value ? guess : NaN;
    }
    guess += target - rendered;
  }
  return NaN;
}
export function isJourneyPlan(value: unknown): value is JourneyPlan {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<JourneyPlan>;
  if (p.version !== 1 || typeof p.start !== "string" || !validStart(p.start) || typeof p.showLoop !== "boolean" || !Array.isArray(p.objectives)) return false;
  const ids = new Set<string>();
  return p.objectives.every((value: unknown) => {
    if (!value || typeof value !== "object") return false;
    const row = value as Objective;
    if (typeof row.id !== "string" || ids.has(row.id) || typeof row.title !== "string" || !row.title.trim() ||
      !Number.isInteger(row.minutes) || row.minutes < 1 || row.minutes > 1440 || !["queued", "active", "waiting", "done"].includes(row.status)) return false;
    ids.add(row.id); return true;
  }) && p.objectives.filter((row) => row.status === "active").length <= 1;
}
export function gameplaySchedule(plan: JourneyPlan): ScheduledObjective[] {
  if (!validStart(plan.start)) return [];
  let cursor = easternStart(plan.start);
  const playable = [...plan.objectives.filter((row) => row.status === "active"), ...plan.objectives.filter((row) => row.status === "queued")];
  return playable.map((row) => {
    const begins = cursor; cursor += row.minutes * 60000;
    return { ...row, begins, ends: cursor };
  });
}
export function moveObjective(rows: Objective[], id: string, direction: -1 | 1) {
  const movable = rows.filter((row) => row.status === "queued");
  const index = movable.findIndex((row) => row.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= movable.length) return rows;
  const a = rows.findIndex((row) => row.id === movable[index].id);
  const b = rows.findIndex((row) => row.id === movable[next].id);
  const result = [...rows]; [result[a], result[b]] = [result[b], result[a]];
  return result;
}
export function advanceObjective(rows: Objective[]) {
  const settled = rows.map((row) => row.status === "active" ? { ...row, status: "done" as const } : row);
  const next = settled.find((row) => row.status === "queued");
  return next ? settled.map((row) => row.id === next.id ? { ...row, status: "active" as const } : row) : settled;
}
