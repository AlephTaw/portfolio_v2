import assert from "node:assert/strict";
import test from "node:test";
import { createComponentConfigs, normalizeComponentConfig, resolveSettingsTarget } from "../app/components/actions/settings/component-config.ts";

test("component settings target the active view, terminal prompt, or bare HUD", () => {
  for (const view of ["build", "inventory", "chat", "activity", "admin"]) assert.equal(resolveSettingsTarget(view, true, false, "terminal"), view);
  assert.equal(resolveSettingsTarget(null, false, false, "build"), "terminal");
  assert.equal(resolveSettingsTarget(null, true, false, "build"), "hud");
  assert.equal(resolveSettingsTarget(null, true, true, "build"), "terminal");
});

test("opening settings and navigating within them preserve the captured component", () => {
  for (const view of ["settings", "component-settings"]) assert.equal(resolveSettingsTarget(view, false, false, "inventory"), "inventory");
});

test("defaults are independent, and saved configs trim text without mutating drafts", () => {
  const configs = createComponentConfigs();
  assert.notEqual(configs.chat.systems, configs.inventory.systems);
  const draft = { displayName: "  Toolkit  ", systems: [{ id: "one", name: " Morning prep ", protocol: " Pack water\nCheck keys ", enabled: true }, { id: "empty", name: " ", protocol: "", enabled: false }] };
  const normalized = normalizeComponentConfig(draft, "inventory");
  assert.deepEqual(normalized, { displayName: "Toolkit", systems: [{ id: "one", name: "Morning prep", protocol: "Pack water\nCheck keys", enabled: true }] });
  assert.equal(draft.systems.length, 2);
  assert.equal(draft.displayName, "  Toolkit  ");
  assert.equal(normalizeComponentConfig({ displayName: " ", systems: [] }, "chat").displayName, "Chat");
});
