import test from "node:test";
import assert from "node:assert/strict";
import { analyzePlan, defaultPlan, validatePlan, isPlan } from "../app/components/systems/utilities/wealth/planner.ts";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.00001, actual + " != " + expected);
function entry(id, kind, amount, date = "") { return { id, name: id, kind, amount, date, confirmed: true, paid: false, note: "" }; }
function simple(entries, values = {}) { return { ...defaultPlan(), start: "2026-10-05", end: "2026-10-10", entries, ...values }; }

test("complete corrected manifest, window sums, and balances", () => {
  const result = analyzePlan(defaultPlan());
  close(result.expenseTotal, 6575); close(result.required, 6575);
  close(result.hours, 263); assert.equal(result.days.length, 27);
  close(result.days.reduce((sum, d) => sum + d.expense, 0), 6575);
  assert.ok(result.days.every((day) => day.balance >= 0));
  close(result.windows.find((w) => w.end === "2026-10-09").bills, 1000);
  close(result.windows.find((w) => w.end === "2026-10-14").bills, 1100);
  close(result.windows.find((w) => w.end === "2026-10-29").bills, 2350);
  assert.ok(result.warnings.some((w) => w.includes("24")));
});
test("cash and timely income reduce work without negative earnings", () => {
  const result = analyzePlan(simple([entry("bill", "expense", 100, "2026-10-10"), entry("gift", "income", 30, "2026-10-06")], { cash: 20 }));
  close(result.required, 50);
  const funded = analyzePlan(simple([entry("bill", "expense", 100, "2026-10-10")], { cash: 150 }));
  close(funded.required, 0); close(funded.endingBalance, 50);
});
test("income on the deadline cannot fund a bill due that day", () => {
  const result = analyzePlan(simple([entry("bill", "expense", 100, "2026-10-10"), entry("gift", "income", 100, "2026-10-10")]));
  close(result.required, 100); close(result.endingBalance, 100);
});
test("late income cannot cover preceding daily reserves", () => {
  const result = analyzePlan(simple([entry("groceries", "expense", 60), entry("gift", "income", 60, "2026-10-10")]));
  assert.ok(result.required > 0); assert.ok(result.days.every((d) => d.balance >= 0));
});
test("prior income, paid bills, and future bills are handled explicitly", () => {
  const paid = { ...entry("paid", "expense", 100, "2026-10-07"), paid: true };
  const result = analyzePlan(simple([paid, entry("future", "expense", 100, "2026-10-11"), entry("bill", "expense", 50, "2026-10-06"), entry("prior", "income", 30, "2026-10-04")]));
  close(result.expenseTotal, 50); close(result.required, 20); assert.equal(result.excluded.length, 2);
});
test("invalid parameters and storage schemas are rejected", () => {
  assert.ok(validatePlan({ ...defaultPlan(), hourlyRate: 0 }).length);
  assert.ok(validatePlan({ ...defaultPlan(), end: "2026-11-01" }).length);
  assert.ok(validatePlan({ ...defaultPlan(), start: "2026-02-30" }).length);
  assert.ok(validatePlan(simple([entry("income", "income", 50)])).length);
  assert.ok(!isPlan({ version: 1 })); assert.ok(isPlan(defaultPlan()));
});
test("planned daily earnings are comparison only, never double counted", () => {
  close(analyzePlan({ ...defaultPlan(), dailyIncome: 300 }).required, 6575);
});
