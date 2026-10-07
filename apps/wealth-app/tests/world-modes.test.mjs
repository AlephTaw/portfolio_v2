import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
// Source wiring checks guard the tab boundary; browser verification covers
// rendering and camera persistence without introducing a second bundler.
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const map = read('../app/components/world/world-map-view.tsx');
const alt = read('../app/components/world/alt-world-view.tsx');
const workspace = read('../app/components/actions/wealth-workspace.tsx');

test('default world has no building layer or building controls', () => {
  assert.match(map, /buildingLayer = false/);
  assert.match(map, /buildingLayer && buildingsVisible && <g[^>]*aria-label="World assets"/);
  assert.match(map, /buildingLayer && <div role="group" aria-label="Building layer controls"/);
  assert.match(workspace, /<WorldMapView \/>/);
});

test('buildings off removes the complete asset group, including labels, leaving the base map', () => {
  const group = map.match(/\{buildingLayer && buildingsVisible && <g[\s\S]*?<\/g>\}/)?.[0];
  assert.ok(group, 'Every asset must share the visibility gate');
  assert.match(group, /<BuildingLayer includeEstimates=\{includeEstimates\}/);
  assert.match(group, /columbus-building-labels-v1\.svg/);
  assert.equal(map.match(/<BuildingLayer /g)?.length, 1);
  assert.equal(map.match(/columbus-building-labels-v1\.svg/g)?.length, 1);
  assert.match(map, /<image href="\/maps\/columbus-world\.svg"/);
  assert.match(map, /disabled=\{!buildingsVisible\}/);
  assert.match(map, /Map only · all assets hidden/);
});

test('alt uses fixed 2D framing and is mounted only after first visit', () => {
  assert.match(alt, /<WorldMapView fixedFraming \/>/);
  assert.doesNotMatch(alt, /<WorldMapView[^>]*buildingLayer/);
  assert.match(map, /!fixedFraming && <div role="group" aria-label="Map controls"/);
  assert.match(map, /if \(fixedFraming\) return;/);
  assert.match(workspace, /altWorldVisited && <AltWorldView \/>/);
  assert.match(workspace, /if \(mode === "alt"\) setAltWorldVisited\(true\)/);
  assert.doesNotMatch(workspace, /reserved for a future app/);
});
