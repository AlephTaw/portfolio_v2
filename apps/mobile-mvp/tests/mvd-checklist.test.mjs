import assert from "node:assert/strict";
import test from "node:test";
import { mvdBills, mvdChecklist, mvdItemId } from "../app/components/actions/field-report/mvd-checklist-data.ts";
import * as source from "../../mvp/app/components/mvd-protocol-data.ts";

test("field report includes every MVP health checklist item and nutrition note", () => {
  for (const protocol of source.minimumViableDay) {
    const copy = mvdChecklist.find((group) => group.category === "Health" && group.title === protocol.category);
    assert.ok(copy, protocol.category);
    assert.deepEqual(copy.items.map((item) => item.label), protocol.items);
    assert.equal(copy.note, protocol.note);
  }
});

test("field report preserves all MVP point criteria and bills", () => {
  const items = mvdChecklist.flatMap((group) => group.items);
  for (const key of ["connectionCriteria", "sentienceCriteria", "skillsCriteria", "buildsCriteria", "wealthCriteria", "specialQuestCriteria", "telemetryCriteria", "firefightingActions"]) {
    for (const criterion of source[key]) assert.ok(items.some((item) => item.label === criterion.label && item.points === criterion.points), criterion.label);
  }
  assert.deepEqual(mvdBills, source.monthlyBills.map(({ name, amount }) => ({ name, amount })));
});

test("checklist IDs are unique; focus flags are limited to nutrition, sleep, and earning", () => {
  const ids = mvdChecklist.flatMap((group) => group.items.map((_, index) => mvdItemId(group, index)));
  assert.equal(ids.length, new Set(ids).size);
  assert.deepEqual(mvdChecklist.filter((group) => group.focus).map((group) => group.id), ["sleep", "meal-prep", "nutrition", "earning"]);
  assert.equal(mvdChecklist.find((group) => group.id === "system-call").items.length, 6);
  assert.ok(mvdChecklist.flatMap((group) => group.items).some((item) => item.label.startsWith("Check emails once")));
});
