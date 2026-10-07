import test from "node:test";
import assert from "node:assert/strict";
import { initial, isTrackers, totalReceipts, wealthApps } from "../app/components/systems/utilities/wealth/use-wealth-trackers.ts";
import { categoryAchievements } from "../app/components/systems/utilities/shared/dashboard-data.ts";
import { analyzePlan, defaultPlan } from "../app/components/systems/utilities/wealth/planner.ts";

const receipt = (amount, date = "2026-10-05") => ({ id: String(amount), date, amount, note: "Recorded" });

test("Wealth achievements match the three tools in display order", () => {
  assert.deepEqual(categoryAchievements("Wealth", []).map(({ id, title }) => ({ id, title })), wealthApps);
  assert.deepEqual(initial.visible, ["earning", "solvency", "monthly-expenses"]);
  assert.equal(initial.debt, 50000);
  assert.ok(isTrackers(initial));
});

test("earning, quota, repayments and visibility can round-trip independently", () => {
  const data = { ...initial, visible: ["earning"], quotas: { "2026-10-05": 250 }, earnings: [receipt(123.45)], repayments: [receipt(500)] };
  assert.ok(isTrackers(JSON.parse(JSON.stringify(data))));
  assert.equal(totalReceipts(data.earnings), 123.45);
  assert.equal(data.debt - totalReceipts(data.repayments), 49500);
  assert.equal(totalReceipts([receipt(0.1), receipt(0.2)]), 0.3);
  assert.equal(totalReceipts([]), 0);
});

test("malformed saved trackers and invalid financial values are rejected", () => {
  for (const data of [null, {}, { ...initial, version: 2 }, { ...initial, visible: ["unknown"] },
    { ...initial, debt: -1 }, { ...initial, debt: Infinity },
    { ...initial, quotas: { "2026-02-30": 100 } }, { ...initial, quotas: { "2026-10-05": -5 } },
    { ...initial, earnings: [receipt(-10)] }, { ...initial, repayments: [receipt(100, "invalid")] }]) {
    assert.equal(isTrackers(data), false);
  }
});

test("tracker receipts do not mutate or double-count monthly funding", () => {
  const plan = defaultPlan();
  const before = analyzePlan(plan);
  const data = { ...initial, earnings: [receipt(500)], repayments: [receipt(1000)] };
  assert.ok(isTrackers(data));
  assert.deepEqual(analyzePlan(plan), before);
});
