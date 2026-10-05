import test from "node:test";
import assert from "node:assert/strict";
import { essentialPossessions, physicalCategories, initialPhysicalLocations } from "../app/components/actions/views/physical-inventory-data.ts";

test("essential possessions are uniquely named and cover all requested locations", () => {
  assert.equal(new Set(essentialPossessions.map((item) => item.name)).size, essentialPossessions.length);
  for (const category of physicalCategories) assert.ok(essentialPossessions.some((item) => item.category === category));
  for (const item of essentialPossessions) assert.equal(initialPhysicalLocations[item.name], item.category);
  assert.ok(!essentialPossessions.some((item) => ["Explorer", "Earth", "Sunrise"].includes(item.name)));
});
