import assert from "node:assert/strict";
import test from "node:test";
import { createWorkspaceState, getPanelLaunchMode, workspaceReducer } from "../app/components/actions/workspace-state.ts";

const views = ["build", "inventory", "chat", "activity", "admin"];

for (const view of views) {
  test(`${view}: one activation opens, the next closes, and the third reopens`, () => {
    const action = { type: "select-panel", view };
    const opened = workspaceReducer(createWorkspaceState(null), action);
    assert.deepEqual(opened, { kind: "panel", view, mode: getPanelLaunchMode(view, false) });
    const closed = workspaceReducer(opened, action);
    assert.deepEqual(closed, { kind: "command" });
    assert.deepEqual(workspaceReducer(closed, action), opened);
  });

  test(`${view}: selecting the active icon closes any resized window`, () => {
    for (const mode of ["split", "full", "third"]) {
      assert.deepEqual(workspaceReducer({ kind: "panel", view, mode }, { type: "select-panel", view }), { kind: "command" });
    }
  });
}

test("every different icon switches directly to its requested launch size", () => {
  for (const from of views) {
    for (const view of views.filter((view) => view !== from)) {
      for (const mode of ["split", "full", "third"]) {
        assert.deepEqual(workspaceReducer(createWorkspaceState(from), { type: "select-panel", view, mode }), { kind: "panel", view, mode });
      }
    }
  }
});

test("launch sizing is centralized: closed Chat partial, other closed panels full, open panels third", () => {
  for (const view of views) {
    assert.equal(getPanelLaunchMode(view, false), view === "chat" ? "split" : "full");
    assert.equal(getPanelLaunchMode(view, true), "third");
    assert.deepEqual(createWorkspaceState(view), { kind: "panel", view, mode: getPanelLaunchMode(view, false) });
  }
});

test("explicit expansion remains idempotent and is separate from icon activation", () => {
  const action = { type: "expand-panel", view: "chat" };
  const expanded = workspaceReducer(createWorkspaceState("chat"), action);
  assert.deepEqual(expanded, { kind: "panel", view: "chat", mode: "full" });
  assert.equal(workspaceReducer(expanded, action), expanded);
});

test("settings menu and component editor open full-height over either visor background", () => {
  for (const view of ["settings", "component-settings"]) {
    assert.equal(getPanelLaunchMode(view, false), "full");
    assert.equal(getPanelLaunchMode(view, true), "full");
    const opened = workspaceReducer(createWorkspaceState("chat"), { type: "select-panel", view });
    assert.deepEqual(opened, { kind: "panel", view, mode: "full" });
    assert.deepEqual(workspaceReducer(opened, { type: "select-panel", view }), { kind: "command" });
  }
});
