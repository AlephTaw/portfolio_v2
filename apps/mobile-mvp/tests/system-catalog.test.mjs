import assert from "node:assert/strict";
import test from "node:test";
import { appSystems } from "../app/components/actions/game-design/system-catalog.ts";
import { mvdChecklist } from "../app/components/actions/field-report/mvd-checklist-data.ts";

test("system catalog has unique IDs and covers every defined MVD protocol", () => {
  assert.equal(new Set(appSystems.map((system) => system.id)).size, appSystems.length);
  for (const group of mvdChecklist) {
    assert.ok(appSystems.some((system) => system.groups?.includes(group)));
  }
});

test("catalog includes the agent components, app interfaces, and complete MVD system", () => {
  for (const name of ["Telemetry", "Experiment", "Axiom of Choice", "Techniques", "World Model"]) {
    assert.ok(appSystems.some((system) => system.category === "MVSOS" && system.name === name));
  }
  for (const name of ["Build", "Inventory", "Chat", "Terminal", "HUD", "Field report", "Game progression", "Timeline", "Configuration"]) {
    assert.ok(appSystems.some((system) => system.category === "App" && system.name === name));
  }
  assert.deepEqual(appSystems.find((system) => system.id === "quests-mvd").groups, mvdChecklist);
});
