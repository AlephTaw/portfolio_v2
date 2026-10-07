import assert from "node:assert/strict";
import test from "node:test";
import { activitySessionReducer as reduce, createActivitySession } from "../app/components/actions/activity-session.ts";
import { terminalCategories } from "../app/components/actions/terminal-categories.ts";
import { categories } from "../app/components/actions/game-design/dashboard-data.ts";
import { categories as appCategories } from "../app/components/systems/utilities/shared/dashboard-data.ts";
import { pointColors, pointsEarnedColors } from "../app/components/actions/game-design/point-colors.ts";

test("terminal dock uses the shared category palette", () => {
  for (const category of categories) {
    const name = category.name === "Connection" ? "Connections" : category.name;
    assert.equal(terminalCategories.find((item) => item.name === name).color, category.color);
  }
  assert.equal(terminalCategories.at(-1).name, "Journey");
});

test("category correspondence is red, green, purple, orange, yellow, magenta", () => {
  assert.deepEqual(terminalCategories.map((category) => category.color), ["#d78c8c", "#83c6a3", "#a99ed7", "#d7a07c", "#d7cf7c", "#e879f9"]);
});

test("Points earned keeps its original palette independently of categories", () => {
  assert.deepEqual(pointsEarnedColors, { Health: "#83c6a3", Wealth: "#d7bd7c", Sentience: "#a99ed7", Skills: "#88b8d8", Connection: "#d7a0ad" });
  assert.notEqual(pointColors.Health, pointsEarnedColors.Health);
  assert.notEqual(pointColors.Wealth, pointsEarnedColors.Wealth);
});

test("category app accents share the dock and achievements palette", () => {
  for (const category of appCategories) {
    assert.equal(category.color, categories.find((item) => item.name === category.name).color);
    const name = category.name === "Connection" ? "Connections" : category.name;
    assert.equal(category.color, terminalCategories.find((item) => item.name === name).color);
  }
});

test("focusing the persistent composer keeps the active app and history intact", () => {
  for (const visorOpen of [false, true]) {
    for (const view of ["build", "inventory", "chat", "activity", "settings", "harness"]) {
      const state = reduce({ ...createActivitySession(null), visorOpen }, { type: "select-panel", view });
      const next = reduce(state, { type: "activate-composer" });
      assert.equal(next.composing, true);
      assert.deepEqual(next.workspace, state.workspace);
      assert.deepEqual(next.history, state.history);
      assert.equal(next.visorOpen, visorOpen);
      assert.equal(reduce(next, { type: "activate-composer" }), next);
      const closed = reduce(next, { type: "close-composer" });
      assert.deepEqual(closed.workspace, state.workspace);
    }
  }
});

test("repeated category selection preserves the app; submitting docks it and keeps command context", () => {
  const active = reduce(createActivitySession(null), { type: "select-category", category: "Health" });
  assert.equal(active.activeCategory, "Health");
  assert.equal(active.composing, true);
  assert.deepEqual(active.workspace, { kind: "command" });
  assert.equal(reduce(active, { type: "select-category", category: "Health" }), active);
  const submitted = reduce(active, { type: "submit-command", text: "Start walking" });
  assert.equal(submitted.activeCategory, null);
  assert.deepEqual(submitted.history.at(-1), { id: 2, kind: "command", text: "Start walking", status: "category-note", category: "Health" });
  assert.deepEqual(submitted.history.filter((entry) => entry.kind === "category"), [{ id: 1, kind: "category", category: "Health" }]);
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

test("clearing category context minimizes its app once and keeps the prompt and visor active", () => {
  for (const visorOpen of [false, true]) {
    const selected = reduce({ ...createActivitySession(null), visorOpen }, { type: "select-category", category: "Wealth" });
    const cleared = reduce(selected, { type: "clear-category" });
    assert.equal(cleared.activeCategory, null);
    assert.equal(cleared.composing, true);
    assert.equal(cleared.visorOpen, visorOpen);
    assert.deepEqual(cleared.workspace, { kind: "command" });
    assert.deepEqual(cleared.history, [{ id: 1, kind: "category", category: "Wealth" }]);
    assert.equal(reduce(cleared, { type: "clear-category" }), cleared);
    const restored = reduce(cleared, { type: "restore-view", id: 1 });
    assert.equal(restored.activeCategory, "Wealth");
    assert.deepEqual(restored.history, []);
  }
});
