import assert from "node:assert/strict";
import test from "node:test";
import { observeVisorClosure } from "../app/components/actions/visor-transition.ts";

const flush = () => new Promise((resolve) => setImmediate(resolve));

test("history reveal waits for the sliding surface to finish closing", async () => {
  let finish;
  let reveals = 0;
  const finished = new Promise((resolve) => { finish = resolve; });
  observeVisorClosure({ getAnimations: () => [{ finished }] }, () => { reveals++; });
  await flush();
  assert.equal(reveals, 0);
  finish();
  await flush();
  assert.equal(reveals, 1);
});

test("reversing the visor cancels stale history reveal callbacks", async () => {
  let finish;
  let reveals = 0;
  const finished = new Promise((resolve) => { finish = resolve; });
  const cancel = observeVisorClosure({ getAnimations: () => [{ finished }] }, () => { reveals++; });
  cancel();
  finish();
  await flush();
  assert.equal(reveals, 0);
});

test("initial closed visor and reduced-motion mode reveal without waiting for a nonexistent transition", async () => {
  let reveals = 0;
  observeVisorClosure({ getAnimations: () => [] }, () => { reveals++; });
  await flush();
  assert.equal(reveals, 1);
});

test("disabling motion during closure settles without an unhandled animation rejection", async () => {
  let reject;
  let reveals = 0;
  const finished = new Promise((_, failure) => { reject = failure; });
  observeVisorClosure({ getAnimations: () => [{ finished }] }, () => { reveals++; });
  reject(new Error("Transition cancelled"));
  await flush();
  assert.equal(reveals, 1);
});
