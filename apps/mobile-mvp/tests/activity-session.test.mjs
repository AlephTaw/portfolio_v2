import assert from "node:assert/strict";
import test from "node:test";
import { activitySessionReducer as reduce, createActivitySession } from "../app/components/actions/activity-session.ts";
import { getPanelLaunchMode } from "../app/components/actions/workspace-state.ts";

for (const visorOpen of [false, true]) {
  test(`visor ${visorOpen ? "open" : "closed"}: all nav destinations toggle and switch without changing the visor`, () => {
    const destinations = ["build", "inventory", "chat", "activity", "admin", "command"];
    function activate(state, destination) {
      return reduce(state, destination === "command"
        ? { type: state.composing ? "close-composer" : "begin-command" }
        : { type: "select-panel", view: destination });
    }
    function assertActive(state, destination) {
      assert.equal(state.visorOpen, visorOpen);
      assert.equal(state.composing, destination === "command");
      assert.deepEqual(state.workspace, destination === "command"
        ? { kind: "command" }
        : { kind: "panel", view: destination, mode: getPanelLaunchMode(destination, visorOpen) });
    }
    for (const from of destinations) {
      const start = { ...createActivitySession(null), visorOpen };
      const active = activate(start, from);
      assertActive(active, from);
      const inactive = activate(active, from);
      assert.deepEqual(inactive.workspace, { kind: "command" });
      assert.equal(inactive.composing, false);
      assert.equal(inactive.visorOpen, visorOpen);
      assertActive(activate(inactive, from), from);
      for (const to of destinations.filter((to) => to !== from)) {
        const switched = activate(active, to);
        assertActive(switched, to);
        assert.deepEqual(switched.history.filter((entry) => entry.kind === "view").map((entry) => entry.view), from === "command" ? [] : [from]);
      }
    }
  });
}

test("restoring a timeline view closes the prompt and respects the current visor's launch size", () => {
  for (const visorOpen of [false, true]) {
    let state = { ...createActivitySession("chat"), visorOpen };
    state = reduce(state, { type: "begin-command" });
    state = reduce(state, { type: "restore-view", id: 1 });
    assert.equal(state.composing, false);
    assert.equal(state.visorOpen, visorOpen);
    assert.deepEqual(state.workspace, { kind: "panel", view: "chat", mode: getPanelLaunchMode("chat", visorOpen) });
    assert.equal(state.history.filter((entry) => entry.kind === "view").length, 0);
  }
});

test("closing and reopening the visor keeps the active terminal prompt open", () => {
  let state = { ...createActivitySession(null), visorOpen: true };
  state = reduce(state, { type: "begin-command" });
  state = reduce(state, { type: "toggle-hud" });
  assert.equal(state.visorOpen, false);
  assert.equal(state.composing, true);
  assert.deepEqual(state.workspace, { kind: "command" });
  state = reduce(state, { type: "toggle-hud" });
  assert.equal(state.visorOpen, true);
  assert.equal(state.composing, true);
  assert.deepEqual(state.workspace, { kind: "command" });
});

test("command submission logs trimmed text with explicit preview status in both visor modes", () => {
  for (const visorOpen of [false, true]) {
    const start = { ...createActivitySession(null), composing: true, visorOpen };
    const submitted = reduce(start, { type: "submit-command", text: "  Review priorities\nthen choose an action  " });
    assert.deepEqual(submitted.history, [{ id: 1, kind: "command", text: "Review priorities\nthen choose an action", status: "execution-preview" }]);
    assert.equal(submitted.nextId, 2);
    assert.equal(submitted.composing, true);
    assert.equal(submitted.visorOpen, visorOpen);
    assert.deepEqual(submitted.workspace, start.workspace);
  }
});

test("empty commands do not create timeline entries", () => {
  const start = createActivitySession(null);
  assert.equal(reduce(start, { type: "submit-command", text: " \n " }), start);
});

test("submitting from an active navbar app docks it and returns to the command feed in either visor mode", () => {
  for (const visorOpen of [false, true]) {
    const start = { ...createActivitySession("inventory"), visorOpen };
    const submitted = reduce(start, { type: "submit-command", text: "Review priorities" });
    assert.deepEqual(submitted.workspace, { kind: "command" });
    assert.equal(submitted.composing, true);
    assert.equal(submitted.visorOpen, visorOpen);
    assert.deepEqual(submitted.history, [
      { id: 1, kind: "view", view: "inventory" },
      { id: 2, kind: "command", text: "Review priorities", status: "execution-preview" },
    ]);
  }
});

test("each submitted command gets a unique timeline entry", () => {
  let state = createActivitySession(null);
  state = reduce(state, { type: "submit-command", text: "First" });
  state = reduce(state, { type: "submit-command", text: "Second" });
  assert.deepEqual(state.history.map(({ id, text }) => [id, text]), [[1, "First"], [2, "Second"]]);
});

test("begin command preserves the open visor, archives the window, and opens terminal input", () => {
  const start = { ...createActivitySession("inventory"), visorOpen: true };
  const ready = reduce(start, { type: "begin-command" });
  assert.equal(ready.visorOpen, true);
  assert.equal(ready.composing, true);
  assert.deepEqual(ready.workspace, { kind: "command" });
  assert.equal(ready.history.filter((entry) => entry.kind === "view" && entry.view === "inventory").length, 1);
  assert.equal(reduce(ready, { type: "begin-command" }), ready);
});

test("begin command returns to the terminal when the visor is closed", () => {
  const ready = reduce(createActivitySession("chat"), { type: "begin-command" });
  assert.equal(ready.visorOpen, false);
  assert.equal(ready.composing, true);
  assert.deepEqual(ready.workspace, { kind: "command" });
  assert.equal(ready.history[0].view, "chat");
  const switched = reduce({ ...ready, visorOpen: true }, { type: "select-panel", view: "inventory" });
  assert.equal(switched.composing, false);
  assert.equal(switched.visorOpen, true);
  assert.deepEqual(switched.workspace, { kind: "panel", view: "inventory", mode: "third" });
});

for (const view of ["build", "inventory", "chat", "activity"]) {
  test(`${view}: hiding the active view preserves the visor and archives only once`, () => {
    for (const visorOpen of [false, true]) {
      const start = { ...createActivitySession(view), visorOpen };
      assert.equal(reduce(start, { type: "hide-panel", view: view === "chat" ? "build" : "chat" }), start);
      const hidden = reduce(start, { type: "hide-panel", view });
      assert.deepEqual(hidden.workspace, { kind: "command" });
      assert.equal(hidden.visorOpen, visorOpen);
      assert.equal(hidden.history.length, 1);
      assert.equal(reduce(hidden, { type: "hide-panel", view }), hidden);
    }
  });
  test(`${view}: navigation closes the terminal composer`, () => {
    const open = reduce(createActivitySession(null), { type: "toggle-composer" });
    const selected = reduce(open, { type: "select-panel", view });
    assert.equal(selected.composing, false);
    assert.deepEqual(selected.workspace, { kind: "panel", view, mode: getPanelLaunchMode(view, false) });
    assert.equal(reduce(selected, { type: "close-composer" }), selected);
    assert.equal(reduce(open, { type: "expand-panel", view }).composing, false);
  });
  test(`${view}: minimize creates one entry; restore removes it and uses the launch default`, () => {
    const minimized = reduce(createActivitySession(view), { type: "minimize-panel" });
    assert.deepEqual(minimized.workspace, { kind: "command" });
    assert.deepEqual(minimized.history, [{ id: 1, kind: "view", view }]);
    const restored = reduce(minimized, { type: "restore-view", id: 1 });
    assert.deepEqual(restored.workspace, { kind: "panel", view, mode: getPanelLaunchMode(view, false) });
    assert.equal(restored.history.length, 0);
  });
}

test("Next Action toggles closed on its second click", () => {
  const original = createActivitySession("inventory");
  const open = reduce(original, { type: "toggle-composer" });
  const closed = reduce(open, { type: "toggle-composer" });
  assert.equal(open.composing, true);
  assert.equal(closed.composing, false);
  assert.deepEqual(closed.workspace, original.workspace);
});

test("two rapid activations close the view and archive it exactly once", () => {
  let state = createActivitySession(null);
  for (const type of ["select-panel", "select-panel"]) state = reduce(state, { type, view: "build" });
  assert.deepEqual(state.workspace, { kind: "command" });
  assert.deepEqual(state.history, [{ id: 1, kind: "view", view: "build" }]);
});

test("switching with another icon preserves the previous view", () => {
  const state = reduce(createActivitySession("chat"), { type: "select-panel", view: "inventory" });
  assert.deepEqual(state.workspace, { kind: "panel", view: "inventory", mode: "full" });
  assert.equal(state.history[0].view, "chat");
});

test("restoring saves any active view, even another instance of the same view", () => {
  let state = reduce(createActivitySession("inventory"), { type: "minimize-panel" });
  state = reduce(state, { type: "select-panel", view: "inventory" });
  state = reduce(state, { type: "restore-view", id: 1 });
  assert.deepEqual(state.history, [{ id: 2, kind: "view", view: "inventory" }]);
});

test("full view can resize back to a split without creating a history entry", () => {
  let state = reduce(createActivitySession("build"), { type: "expand-panel", view: "build" });
  state = reduce(state, { type: "resize-panel" });
  assert.deepEqual(state.workspace, { kind: "panel", view: "build", mode: "split" });
  assert.equal(state.history.length, 0);
});

test("HUD preserves the active pane; Advance logs engagement without closing it", () => {
  const active = createActivitySession("chat");
  const composed = reduce(active, { type: "toggle-composer" });
  assert.deepEqual(composed.workspace, active.workspace);
  assert.equal(composed.composing, true);
  const hud = reduce(composed, { type: "toggle-hud" });
  assert.deepEqual(hud.workspace, active.workspace);
  assert.equal(hud.visorOpen, true);
  assert.equal(hud.history.filter((entry) => entry.kind === "view").length, 0);
});

for (const view of ["build", "inventory", "chat", "activity"]) {
  test(`${view}: shared window transitions preserve the visor, with a smaller launch default when open`, () => {
    let closed = createActivitySession(null);
    let open = { ...closed, visorOpen: true };
    for (const action of [
      { type: "select-panel", view },
      { type: "select-panel", view },
      { type: "expand-panel", view },
      { type: "resize-panel" },
      { type: "toggle-composer" },
      { type: "select-panel", view },
      { type: "minimize-panel" },
      { type: "restore-view", id: 3 },
    ]) {
      closed = reduce(closed, action);
      open = reduce(open, action);
      assert.deepEqual({ ...open, workspace: closed.workspace }, { ...closed, visorOpen: true });
      assert.equal(open.workspace.kind, closed.workspace.kind);
      if (action.type === "select-panel" && open.workspace.kind === "panel") {
        assert.deepEqual(open.workspace, { kind: "panel", view, mode: "third" });
        assert.deepEqual(closed.workspace, { kind: "panel", view, mode: getPanelLaunchMode(view, false) });
      }
    }
  });
}

test("visor toggle preserves the shared window, and minimize/restore work over the desert", () => {
  let state = reduce(createActivitySession(null), { type: "toggle-hud" });
  state = reduce(state, { type: "select-panel", view: "build" });
  const window = state.workspace;
  state = reduce(state, { type: "toggle-hud" });
  assert.deepEqual(state.workspace, window);
  state = reduce(state, { type: "toggle-hud" });
  assert.deepEqual(state.workspace, window);
  state = reduce(state, { type: "select-panel", view: "chat" });
  assert.deepEqual(state.workspace, { kind: "panel", view: "chat", mode: "third" });
  state = reduce(state, { type: "select-panel", view: "chat" });
  assert.deepEqual(state.workspace, { kind: "command" });
  state = reduce(state, { type: "toggle-composer" });
  assert.equal(state.composing, true);
  assert.equal(state.visorOpen, true);
  assert.deepEqual(state.workspace, { kind: "command" });
  state = reduce(state, { type: "select-panel", view: "build" });
  assert.equal(state.composing, false);
  assert.deepEqual(state.workspace, { kind: "panel", view: "build", mode: "third" });
  const entry = state.history.find((item) => item.kind === "view" && item.view === "chat");
  state = reduce(state, { type: "restore-view", id: entry.id });
  assert.equal(state.workspace.view, "chat");
  state = reduce(state, { type: "minimize-panel" });
  assert.deepEqual(state.workspace, { kind: "command" });
  assert.equal(state.visorOpen, true);
  state = reduce(state, { type: "toggle-hud" });
  assert.equal(state.visorOpen, false);
});

test("minimizing again cannot add duplicate entries; unknown restore IDs are ignored", () => {
  const state = reduce(createActivitySession("chat"), { type: "minimize-panel" });
  assert.deepEqual(reduce(state, { type: "minimize-panel" }).history, state.history);
  assert.equal(reduce(state, { type: "restore-view", id: 999 }), state);
});

test("terminal navigation closes the visor without activating command entry", () => {
  const start = { ...createActivitySession("chat"), visorOpen: true };
  const terminal = reduce(start, { type: "return-terminal" });
  assert.deepEqual(terminal.workspace, { kind: "command" });
  assert.equal(terminal.visorOpen, false);
  assert.equal(terminal.composing, false);
  assert.equal(terminal.history[0].view, "chat");
  const typing = reduce(terminal, { type: "begin-command" });
  assert.equal(typing.composing, true);
  assert.deepEqual(typing.workspace, { kind: "command" });
});
