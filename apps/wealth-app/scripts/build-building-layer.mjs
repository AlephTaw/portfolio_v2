import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { heightRecord } from './audit-building-heights.mjs';

const BBOX = [-83.064, 39.929, -82.977, 39.989];
const WIDTH = 1500;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
const scale = WIDTH / ((BBOX[2] - BBOX[0]) * Math.PI / 180);
const HEIGHT = (mercY(BBOX[3]) - mercY(BBOX[1])) * scale;
const unitsPerMeter = scale / (6378137 * Math.cos((BBOX[1] + BBOX[3]) / 2 * Math.PI / 180));
const project = ([lon, lat]) => [50 + (lon - BBOX[0]) * Math.PI / 180 * scale, 50 + (mercY(BBOX[3]) - mercY(lat)) * scale];
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const coordinates = (geometry) => geometry?.map((p) => [p.lon, p.lat]) ?? [];

// Join split multipolygon boundary ways without inventing missing segments.
export function assembleRings(segments) {
  const remaining = segments.map((s) => s.slice());
  const rings = [];
  while (remaining.length) {
    const ring = remaining.shift();
    if (ring.length < 2) return null;
    while (!same(ring[0], ring.at(-1))) {
      const index = remaining.findIndex((s) => same(s[0], ring.at(-1)) || same(s.at(-1), ring.at(-1)));
      if (index < 0) return null;
      const next = remaining.splice(index, 1)[0];
      if (!same(next[0], ring.at(-1))) next.reverse();
      ring.push(...next.slice(1));
    }
    if (ring.length < 4) return null;
    rings.push(ring);
  }
  return rings;
}

export function inRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > point[1]) !== (yj > point[1]) && point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function extractFootprints(raw) {
  const rejected = [];
  const members = new Set();
  const shapes = [];
  for (const element of raw.elements.filter((e) => e.type === 'relation' && e.tags?.type === 'multipolygon')) {
    const outer = assembleRings(element.members.filter((m) => m.type === 'way' && (m.role === 'outer' || m.role === '')).map((m) => coordinates(m.geometry)));
    const inner = assembleRings(element.members.filter((m) => m.type === 'way' && m.role === 'inner').map((m) => coordinates(m.geometry)));
    if (!outer?.length || !inner) { rejected.push(`relation/${element.id}`); continue; }
    const rings = outer.map((ring) => ({ outer: ring, holes: inner.filter((hole) => inRing(hole[0], ring)) }));
    shapes.push({ ...heightRecord(element), polygons: rings });
    for (const member of element.members) if (member.type === 'way') members.add(member.ref);
  }
  for (const element of raw.elements.filter((e) => e.type === 'way' && !members.has(e.id))) {
    if ((!element.tags?.building || element.tags.building === 'no') && (!element.tags?.['building:part'] || element.tags['building:part'] === 'no')) continue;
    const ring = coordinates(element.geometry);
    if (ring.length < 4 || !same(ring[0], ring.at(-1))) { rejected.push(`way/${element.id}`); continue; }
    shapes.push({ ...heightRecord(element), polygons: [{ outer: ring, holes: [] }] });
  }
  return { shapes, rejected };
}

export function contains(shape, point) {
  return shape.polygons.some((p) => inRing(point, p.outer) && !p.holes.some((hole) => inRing(point, hole)));
}

function bounds(shape) {
  const points = shape.polygons.flatMap((p) => p.outer);
  return [Math.min(...points.map((p) => p[0])), Math.min(...points.map((p) => p[1])), Math.max(...points.map((p) => p[0])), Math.max(...points.map((p) => p[1]))];
}

// OSM 3D convention: use building parts instead of extruding the parent outline twice.
export function suppressParentOutlines(shapes) {
  const grid = new Map();
  const cell = 0.001;
  for (const shape of shapes.filter((s) => s.kind === 'outline')) {
    const box = bounds(shape);
    for (let x = Math.floor(box[0] / cell); x <= Math.floor(box[2] / cell); x++) {
      for (let y = Math.floor(box[1] / cell); y <= Math.floor(box[3] / cell); y++) {
        const key = `${x},${y}`;
        const bucket = grid.get(key) ?? [];
        bucket.push(shape);
        grid.set(key, bucket);
      }
    }
  }
  const suppressed = new Set();
  for (const part of shapes.filter((s) => s.kind === 'part')) {
    // Sample vertices, not a centroid that could fall outside a concave footprint.
    const samples = part.polygons.flatMap((p) => p.outer.slice(0, -1));
    for (const point of samples) {
      const candidates = grid.get(`${Math.floor(point[0] / cell)},${Math.floor(point[1] / cell)}`) ?? [];
      for (const parent of candidates) if (contains(parent, point)) suppressed.add(parent.osm_id);
    }
  }
  return { shapes: shapes.filter((s) => !suppressed.has(s.osm_id)), suppressed: [...suppressed] };
}

export function renderHeight(shape) {
  if (shape.explicit_height_m !== null) return { meters: shape.explicit_height_m, source: 'recorded' };
  if (shape.estimated_height_m !== null) return { meters: shape.estimated_height_m, source: 'floors' };
  return { meters: 6, source: 'default' };
}

const n = (value) => value.toFixed(2);
const path = (ring, dx = 0, dy = 0) => ring.map(([x, y], index) => `${index ? 'L' : 'M'}${n(x + dx)},${n(y + dy)}`).join('') + 'Z';

function prism(shape) {
  const height = renderHeight(shape);
  const top = height.meters * unitsPerMeter;
  const bottom = Math.max(0, Math.min(shape.min_height_m ?? 0, height.meters)) * unitsPerMeter;
  const dx = top * 0.25, dy = -top;
  const roof = shape.polygons.map((p) => path(p.outer, dx, dy) + p.holes.map((h) => path(h, dx, dy)).join('')).join('');
  const faces = [[], []];
  for (const polygon of shape.polygons) {
    for (const ring of [polygon.outer, ...polygon.holes]) {
      for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1], b = ring[i];
        const face = `M${n(a[0] + bottom * 0.25)},${n(a[1] - bottom)}L${n(b[0] + bottom * 0.25)},${n(b[1] - bottom)}L${n(b[0] + dx)},${n(b[1] + dy)}L${n(a[0] + dx)},${n(a[1] + dy)}Z`;
        faces[Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]) ? 0 : 1].push(face);
      }
    }
  }
  const color = height.source === 'recorded' ? '#b5c3ce' : height.source === 'floors' ? '#c5cdd3' : '#dddcd5';
  return `<path d="${faces[0].join('')}" fill="#8d979e"/><path d="${faces[1].join('')}" fill="#a9b1b4"/><path d="${roof}" fill="${color}" fill-rule="evenodd" stroke="#727e86" stroke-width="0.28"/>`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = fileURLToPath(new URL('../', import.meta.url));
  const raw = JSON.parse(readFileSync(`${app}assets/columbus-buildings-osm-v1.json`, 'utf8'));
  if (raw.remark || !raw.elements?.length) throw new Error(raw.remark ?? 'Empty building extract');
  const extracted = extractFootprints(raw);
  const selected = suppressParentOutlines(extracted.shapes);
  const shapes = selected.shapes.map((shape) => ({ ...shape, polygons: shape.polygons.map((p) => ({ outer: p.outer.map(project), holes: p.holes.map((h) => h.map(project)) })) })).sort((a, b) => bounds(a)[3] - bounds(b)[3]);
  mkdirSync(`${app}public/maps`, { recursive: true });
  const streetMap = readFileSync(`${app}public/maps/columbus-world.svg`, 'utf8');
  const labels = streetMap.match(/<text\b[^>]*>[\s\S]*?<\/text>/g) ?? [];
  writeFileSync(`${app}public/maps/columbus-building-labels-v1.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="50 50 ${WIDTH} ${HEIGHT}">${labels.join('')}</svg>`);
  for (const [name, items] of [['recorded', shapes.filter((s) => s.explicit_height_m !== null)]]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="50 50 ${WIDTH} ${HEIGHT}"><title>Columbus building footprint extrusions</title><desc>© OpenStreetMap contributors, ODbL. Static orthographic cartographic extrusion; estimates are not measured heights.</desc><g stroke-linejoin="round">${items.map(prism).join('')}</g></svg>`;
    writeFileSync(`${app}public/maps/columbus-buildings-${name}-v1.svg`, svg);
  }
  // Small independent SVG tiles avoid browser limits on a single 19 MB image.
  // Extruded bounds include rooftops, so tall buildings span tile seams intact.
  const tileDir = `${app}public/maps/buildings-v1`;
  mkdirSync(tileDir, { recursive: true });
  const prepared = shapes.map((shape) => {
    const box = bounds(shape);
    const rise = renderHeight(shape).meters * unitsPerMeter;
    return { markup: prism(shape), box: [box[0], box[1] - rise, box[2] + rise * 0.25, box[3]] };
  });
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 50 + col * WIDTH / 4, y = 50 + row * HEIGHT / 4;
      const items = prepared.filter(({ box }) => box[0] < x + WIDTH / 4 && box[2] > x && box[1] < y + HEIGHT / 4 && box[3] > y);
      writeFileSync(`${tileDir}/${col}-${row}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH / 4}" height="${HEIGHT / 4}" viewBox="${x} ${y} ${WIDTH / 4} ${HEIGHT / 4}"><desc>© OpenStreetMap contributors, ODbL. Estimated heights included.</desc><g stroke-linejoin="round">${items.map((item) => item.markup).join('')}</g></svg>`);
    }
  }
  const report = {
    source_timestamp: raw.osm3s?.timestamp_osm_base,
    rendered_features: shapes.length,
    recorded: shapes.filter((s) => renderHeight(s).source === 'recorded').length,
    floor_estimates: shapes.filter((s) => renderHeight(s).source === 'floors').length,
    default_6m: shapes.filter((s) => renderHeight(s).source === 'default').length,
    suppressed_parent_outlines: selected.suppressed.length,
    rejected_geometry: extracted.rejected,
    unsupported_building_relations: raw.elements.filter((e) => e.type === 'relation' && e.tags?.type !== 'multipolygon').map((e) => `relation/${e.id}`),
    unitsPerMeter,
  };
  writeFileSync(`${app}assets/columbus-building-layer-v1.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
