import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parse } from "yaml";

const root = process.cwd();
const sourcePath = path.join(root, "curriculum", "mlphd.yaml");
const generatedPath = path.join(root, "app", "generated", "curriculum-catalog.json");
const publicPath = path.join(root, "public", "bootcamp", "catalog.json");
const difficulties = new Set(["easy", "medium", "hard"]);

function fail(message) {
  throw new Error(`Curriculum validation failed: ${message}`);
}

function requireArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value;
}

function requireString(value, label) {
  if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`);
  return value;
}

function assertUnique(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) fail(`duplicate ${label} id "${item.id}"`);
    seen.add(item.id);
  }
}

function validateConceptGraph(concepts) {
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const state = new Map();

  for (const concept of concepts) {
    for (const requirement of requireArray(concept.requires, `concept ${concept.id}.requires`)) {
      if (!conceptIds.has(requirement)) {
        fail(`concept "${concept.id}" requires unknown concept "${requirement}"`);
      }
    }
  }

  function visit(id, trail = []) {
    if (state.get(id) === "visiting") fail(`concept dependency cycle: ${[...trail, id].join(" -> ")}`);
    if (state.get(id) === "visited") return;
    state.set(id, "visiting");
    const concept = concepts.find((candidate) => candidate.id === id);
    for (const requirement of concept.requires) visit(requirement, [...trail, id]);
    state.set(id, "visited");
  }

  for (const concept of concepts) visit(concept.id);
  return conceptIds;
}

function conceptClosure(conceptId, conceptsById, result = new Set()) {
  for (const requirement of conceptsById.get(conceptId).requires) {
    if (!result.has(requirement)) {
      result.add(requirement);
      conceptClosure(requirement, conceptsById, result);
    }
  }
  return result;
}

function flattenView(items, unitIds, ancestors = [], result = []) {
  const siblingOrders = new Set();

  for (const item of [...items].sort((a, b) => a.order - b.order)) {
    if (!Number.isFinite(item.order)) fail(`view item under "${ancestors.at(-1) ?? "root"}" needs a numeric order`);
    if (siblingOrders.has(item.order)) fail(`duplicate sibling order ${item.order} under "${ancestors.at(-1) ?? "root"}"`);
    siblingOrders.add(item.order);

    if (item.type === "section") {
      requireString(item.id, "section.id");
      requireString(item.title, `section ${item.id}.title`);
      const children = requireArray(item.children, `section ${item.id}.children`);
      result.push({ type: "section", id: item.id, title: item.title, order: item.order, depth: ancestors.length + 1 });
      flattenView(children, unitIds, [...ancestors, item.id], result);
      continue;
    }

    if (item.type === "unit") {
      requireString(item.unit, "view unit reference");
      if (!unitIds.has(item.unit)) fail(`view references unknown unit "${item.unit}"`);
      result.push({ type: "unit", unit: item.unit, order: item.order, depth: ancestors.length + 1 });
      continue;
    }

    fail(`unknown view item type "${item.type}"`);
  }

  return result;
}

async function main() {
  const source = parse(await readFile(sourcePath, "utf8"));
  if (source.schemaVersion !== 1) fail("schemaVersion must be 1");

  const concepts = requireArray(source.concepts, "concepts");
  const units = requireArray(source.units, "units");
  assertUnique(concepts, "concept");
  assertUnique(units, "unit");

  for (const concept of concepts) {
    requireString(concept.id, "concept.id");
    requireString(concept.title, `concept ${concept.id}.title`);
  }

  const conceptIds = validateConceptGraph(concepts);
  const unitIds = new Set(units.map((unit) => unit.id));
  const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]));

  for (const unit of units) {
    requireString(unit.id, "unit.id");
    requireString(unit.title, `unit ${unit.id}.title`);
    requireString(unit.notebook, `unit ${unit.id}.notebook`);
    requireString(unit.outputPath, `unit ${unit.id}.outputPath`);
    if (!difficulties.has(unit.difficulty)) fail(`unit "${unit.id}" has invalid difficulty "${unit.difficulty}"`);
    await access(path.join(root, unit.notebook)).catch(() => fail(`unit "${unit.id}" notebook does not exist: ${unit.notebook}`));

    for (const field of ["teaches", "assesses", "topics", "roles", "goals"]) {
      for (const value of requireArray(unit[field], `unit ${unit.id}.${field}`)) {
        requireString(value, `unit ${unit.id}.${field} entry`);
        if ((field === "teaches" || field === "assesses") && !conceptIds.has(value)) {
          fail(`unit "${unit.id}" references unknown concept "${value}" in ${field}`);
        }
      }
    }
  }

  const views = {};
  for (const [viewId, view] of Object.entries(source.views ?? {})) {
    requireString(view.title, `view ${viewId}.title`);
    const items = requireArray(view.items, `view ${viewId}.items`);
    const flattened = flattenView(items, unitIds);
    const displayedUnitIds = flattened.filter((item) => item.type === "unit").map((item) => item.unit);
    const seenUnits = new Set();
    const learnedConcepts = new Set();

    for (const unitId of displayedUnitIds) {
      if (seenUnits.has(unitId)) fail(`view "${viewId}" contains unit "${unitId}" more than once`);
      seenUnits.add(unitId);
      const unit = units.find((candidate) => candidate.id === unitId);
      const unitConcepts = new Set([...unit.teaches, ...unit.assesses]);
      const requiredConcepts = new Set();
      for (const conceptId of unitConcepts) {
        for (const requirement of conceptClosure(conceptId, conceptsById)) {
          if (!unitConcepts.has(requirement)) requiredConcepts.add(requirement);
        }
      }
      const missing = [...requiredConcepts].filter((conceptId) => !learnedConcepts.has(conceptId));
      if (missing.length) fail(`view "${viewId}" places unit "${unitId}" before prerequisites: ${missing.join(", ")}`);
      for (const conceptId of unit.teaches) learnedConcepts.add(conceptId);
    }

    views[viewId] = { ...view, items, flattened };
  }

  if (!views.default) fail('a view named "default" is required');

  const catalog = {
    schemaVersion: source.schemaVersion,
    concepts,
    units,
    views,
  };

  await mkdir(path.dirname(generatedPath), { recursive: true });
  await mkdir(path.dirname(publicPath), { recursive: true });
  const output = `${JSON.stringify(catalog, null, 2)}\n`;
  await Promise.all([writeFile(generatedPath, output), writeFile(publicPath, output)]);
  process.stdout.write(`Validated ${concepts.length} concepts, ${units.length} units, and ${Object.keys(views).length} view.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
