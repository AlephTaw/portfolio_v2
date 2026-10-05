import assert from "node:assert/strict";
import test from "node:test";
import { activitySessionReducer as reduce, createActivitySession } from "../app/components/actions/activity-session.ts";

test("category stays active through commands and repeated selection", () => {
  const active = reduce(createActivitySession(null), { type: "select-category", category: "Health" });
  assert.equal(active.activeCategory, "Health");
  assert.equal(active.composing, true);
  assert.deepEqual(active.workspace, { kind: "command" });
  assert.equal(reduce(active, { type: "select-category", category: "Health" }), active);
  const submitted = reduce(active, { type: "submit-command", text: "Start walking" });
  assert.equal(submitted.activeCategory, "Health");
  assert.equal(submitted.history.filter((entry) => entry.kind === "category").length, 0);
});

test("switching categories minimizes only the previous app", () => {
  let state = reduce(createActivitySession(null), { type: "select-category", category: "Health" });
  state = reduce(state, { type: "select-category", category: "Wealth" });
  assert.equal(state.activeCategory, "Wealth");
  assert.deepEqual(state.history, [{ id: 1, kind: "category", category: "Health" }]);
});

test("Journey participates in category activation, history, and restoration", () => {
  let state = reduce(createActivitySession(null), { type: "select-category", category: "Journey" });
  assert.equal(state.activeCategory, "Journey");
  state = reduce(state, { type: "select-category", category: "Health" });
  assert.deepEqual(state.history, [{ id: 1, kind: "category", category: "Journey" }]);
  state = reduce(state, { type: "restore-view", id: 1 });
  assert.equal(state.activeCategory, "Journey");
});

test("navbar views archive category apps in either visor mode", () => {
  for (const visorOpen of [false, true]) {
    for (const view of ["build", "inventory", "chat", "activity"]) {
      const active = reduce({ ...createActivitySession(null), visorOpen }, { type: "select-category", category: "Skills" });
      const next = reduce(active, { type: "select-panel", view });
      assert.equal(next.activeCategory, null);
      assert.equal(next.workspace.view, view);
      assert.equal(next.visorOpen, visorOpen);
      assert.deepEqual(next.history.filter((entry) => entry.kind === "category"), [{ id: 1, kind: "category", category: "Skills" }]);
    }
  }
});

test("restoring a category swaps the active feed app and removes its thumbnail", () => {
  let state = reduce(createActivitySession(null), { type: "select-category", category: "Health" });
  state = reduce(state, { type: "select-category", category: "Sentience" });
  state = reduce(state, { type: "restore-view", id: 1 });
  assert.equal(state.activeCategory, "Health");
  assert.deepEqual(state.history, [{ id: 2, kind: "category", category: "Sentience" }]);
});
