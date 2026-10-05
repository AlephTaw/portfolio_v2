import test from "node:test";
import assert from "node:assert/strict";
import { advanceObjective, gameplaySchedule, isJourneyPlan, moveObjective } from "../app/components/systems/utilities/journey/journey-plan.ts";
const rows = [{ id: "a", title: "A", minutes: 30, status: "queued" }, { id: "wait", title: "Waiting", minutes: 15, status: "waiting" }, { id: "b", title: "B", minutes: 45, status: "queued" }];
const plan = { version: 1, start: "2026-10-05T09:00", showLoop: false, objectives: rows };
test("queue priority determines contiguous gameplay slots", () => {
  const moved = moveObjective(rows, "b", -1);
  const schedule = gameplaySchedule({ ...plan, objectives: moved });
  assert.deepEqual(schedule.map(row => row.id), ["b", "a"]);
  assert.equal(schedule[0].ends, schedule[1].begins);
  assert.equal(schedule[1].ends - schedule[0].begins, 75 * 60000);
  assert.equal(new Date(schedule[0].begins).toISOString(), "2026-10-05T13:00:00.000Z");
  assert.equal(rows[0].id, "a");
});
test("complete and next skips waiting and never activates two objectives", () => {
  const started = advanceObjective(rows);
  assert.equal(started[0].status, "active");
  const next = advanceObjective(started);
  assert.equal(next[0].status, "done"); assert.equal(next[2].status, "active");
  assert.equal(next.filter(row => row.status === "active").length, 1);
  assert.deepEqual(gameplaySchedule({ ...plan, objectives: next }).map(row => row.id), ["b"]);
});
test("invalid dates, durations and duplicate active objectives are rejected", () => {
  assert.ok(isJourneyPlan(plan));
  assert.ok(!isJourneyPlan({ ...plan, start: "" }));
  assert.ok(!isJourneyPlan({ ...plan, objectives: [{ ...rows[0], minutes: 0 }] }));
  assert.ok(!isJourneyPlan({ ...plan, objectives: rows.map(row => ({ ...row, status: "active" })) }));
  assert.deepEqual(gameplaySchedule({ ...plan, start: "" }), []);
});
