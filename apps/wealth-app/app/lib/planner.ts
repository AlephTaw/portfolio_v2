import { initialBills, planningPeriod } from "./bills.ts";

export type Entry = {
  id: string;
  name: string;
  kind: "expense" | "income";
  amount: number;
  date: string;
  confirmed: boolean;
  paid: boolean;
  note: string;
};
export type Plan = {
  version: 1;
  start: string;
  end: string;
  hourlyRate: number;
  dailyIncome: number;
  cash: number;
  entries: Entry[];
};
export type Day = {
  date: string;
  target: number;
  hours: number;
  reserve: number;
  income: number;
  expense: number;
  balance: number;
  due: Entry[];
  window: number;
};
export type FundingWindow = {
  start: string;
  end: string;
  deadline: string;
  names: string[];
  bills: number;
  reserve: number;
  income: number;
  openingCash: number;
  required: number;
  daily: number;
  hours: number;
};
export type Analysis = {
  expenseTotal: number;
  incidentalIncome: number;
  required: number;
  hours: number;
  average: number;
  days: Day[];
  windows: FundingWindow[];
  warnings: string[];
  excluded: Entry[];
  endingBalance: number;
};

const DAY = 86400000;
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}
export function shiftDate(value: string, offset: number) {
  return new Date(Date.parse(value + "T00:00:00Z") + offset * DAY).toISOString().slice(0, 10);
}
export function datesBetween(start: string, end: string) {
  const count = Math.round((Date.parse(end + "T00:00:00Z") - Date.parse(start + "T00:00:00Z")) / DAY);
  return Array.from({ length: Math.max(0, count + 1) }, (_, index) => shiftDate(start, index));
}
export function defaultPlan(): Plan {
  return {
    version: 1, start: planningPeriod.start, end: planningPeriod.end,
    hourlyRate: planningPeriod.hourlyRate, dailyIncome: 0, cash: 0,
    entries: initialBills.map((bill) => ({
      id: bill.id, name: bill.name, kind: "expense", amount: bill.amount,
      date: bill.dueDate ?? "", confirmed: bill.deadlineConfirmed, paid: false, note: bill.note ?? "",
    })),
  };
}
export function validatePlan(plan: Plan): string[] {
  const errors: string[] = [];
  if (!validDate(plan.start) || !validDate(plan.end)) errors.push("Choose valid start and end dates.");
  else if (plan.end < plan.start || plan.start.slice(0, 7) !== plan.end.slice(0, 7)) errors.push("Choose a start and end within the same month, in chronological order.");
  if (!Number.isFinite(plan.hourlyRate) || plan.hourlyRate <= 0) errors.push("Hourly earning rate must be greater than zero.");
  if (!Number.isFinite(plan.dailyIncome) || plan.dailyIncome < 0) errors.push("Planned daily earnings must be zero or more.");
  if (!Number.isFinite(plan.cash) || plan.cash < 0) errors.push("Available cash must be zero or more.");
  const ids = new Set<string>();
  for (const row of plan.entries) {
    if (ids.has(row.id)) errors.push("Each entry must have a unique ID.");
    ids.add(row.id);
    if (!row.name.trim()) errors.push("Every entry needs a name.");
    if (!Number.isFinite(row.amount) || row.amount < 0 || row.amount > 1e9) errors.push((row.name || "Entry") + ": enter an amount between $0 and $1 billion.");
    if (row.date && !validDate(row.date)) errors.push(row.name + ": choose a valid date.");
    if (row.kind === "income" && !row.date) errors.push(row.name + ": income needs an availability date.");
  }
  return [...new Set(errors)];
}
export function isPlan(value: unknown): value is Plan {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Plan>;
  if (p.version !== 1 || typeof p.start !== "string" || typeof p.end !== "string" ||
      typeof p.hourlyRate !== "number" || typeof p.dailyIncome !== "number" || typeof p.cash !== "number" || !Array.isArray(p.entries)) return false;
  return p.entries.every((entry: unknown) => {
    if (!entry || typeof entry !== "object") return false;
    const e = entry as Partial<Entry>;
    return typeof e.id === "string" && typeof e.name === "string" && (e.kind === "expense" || e.kind === "income") &&
      typeof e.amount === "number" && typeof e.date === "string" && typeof e.confirmed === "boolean" && typeof e.paid === "boolean" && typeof e.note === "string";
  }) && validatePlan(p as Plan).length === 0;
}
const cents = (amount: number) => Math.round(amount * 100);
export function analyzePlan(plan: Plan): Analysis {
  const errors = validatePlan(plan);
  if (errors.length) throw new Error(errors.join(" "));
  const dates = datesBetween(plan.start, plan.end);
  const active = plan.entries.filter((row) => !row.paid && (!row.date || row.date <= plan.end));
  const excluded = plan.entries.filter((row) => row.paid || (row.date && row.date > plan.end));
  const expenses = active.filter((row) => row.kind === "expense");
  const incomes = active.filter((row) => row.kind === "income");
  const reserves = expenses.filter((row) => !row.date);
  const reserveTotal = reserves.reduce((sum, row) => sum + cents(row.amount), 0);
  const warnings: string[] = [];
  if (reserves.length) warnings.push("Unknown-date expenses are reserved evenly through month-end. Confirm their actual deadlines.");
  if (expenses.some((row) => row.date && !row.confirmed)) warnings.push("Unconfirmed dates are used provisionally.");
  if (expenses.some((row) => row.date && row.date < plan.start)) warnings.push("Past-due expenses are included on the first earning day.");
  const fundingDate = (row: Entry) => row.date <= plan.start ? plan.start : shiftDate(row.date, -1);
  const dated = expenses.filter((row) => row.date);
  const endpoints = [...new Set([...dated.map(fundingDate), plan.end])].sort();
  const days: Day[] = [];
  const windows: FundingWindow[] = [];
  let cursor = 0;
  let cash = cents(plan.cash) + incomes.filter((row) => row.date < plan.start).reduce((sum, row) => sum + cents(row.amount), 0);
  for (const endpoint of endpoints) {
    const last = dates.indexOf(endpoint);
    if (last < cursor) continue;
    const span = dates.slice(cursor, last + 1);
    const dueBills = dated.filter((row) => fundingDate(row) === endpoint);
    const openingCash = cash;
    const costs = span.map((date, offset) => {
      const index = cursor + offset;
      const reserve = Math.floor(reserveTotal / dates.length) + (index < reserveTotal % dates.length ? 1 : 0);
      const bills = dated.filter((row) => fundingDate(row) === date).reduce((sum, row) => sum + cents(row.amount), 0);
      const income = incomes.filter((row) => row.date === date).reduce((sum, row) => sum + cents(row.amount), 0);
      return { date, reserve, bills, income };
    });
    // A late income cannot pay an earlier obligation. Every prefix must be funded.
    let deficit = -openingCash;
    let daily = 0;
    costs.forEach((day, index) => {
      deficit += day.reserve + day.bills - day.income;
      daily = Math.max(daily, deficit / (index + 1), 0);
    });
    costs.forEach((day) => {
      cash += daily + day.income - day.reserve - day.bills;
      days.push({
        date: day.date, target: daily / 100, hours: daily / 100 / plan.hourlyRate,
        reserve: day.reserve / 100, expense: (day.reserve + day.bills) / 100,
        income: day.income / 100, balance: Math.max(0, cash / 100),
        due: expenses.filter((row) => row.date === day.date), window: windows.length,
      });
    });
    windows.push({
      start: span[0], end: span[span.length - 1],
      deadline: dueBills.length ? dueBills.map((row) => row.date).sort()[0] : plan.end,
      names: dueBills.map((row) => row.name),
      bills: costs.reduce((sum, day) => sum + day.bills, 0) / 100,
      reserve: costs.reduce((sum, day) => sum + day.reserve, 0) / 100,
      income: costs.reduce((sum, day) => sum + day.income, 0) / 100,
      openingCash: openingCash / 100, required: daily * span.length / 100,
      daily: daily / 100, hours: daily / 100 / plan.hourlyRate,
    });
    cursor = last + 1;
  }
  if (days.some((day) => day.hours > 24)) warnings.push("At least one funding window requires more than 24 driving hours per day. Fund it earlier with available cash, add income, or revise the payment plan.");
  if (plan.dailyIncome > 0 && days.some((day) => day.target > plan.dailyIncome)) warnings.push("Some daily targets exceed your planned daily earnings.");
  const required = days.reduce((sum, day) => sum + day.target, 0);
  return {
    expenseTotal: expenses.reduce((sum, row) => sum + cents(row.amount), 0) / 100,
    incidentalIncome: incomes.reduce((sum, row) => sum + cents(row.amount), 0) / 100,
    required, average: required / dates.length, hours: required / plan.hourlyRate,
    days, windows, warnings, excluded, endingBalance: Math.max(0, cash / 100),
  };
}
