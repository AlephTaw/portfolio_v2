import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const assets = fileURLToPath(new URL('../assets/', import.meta.url));
export function meters(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  const feetInches = text.match(/^(\d+(?:\.\d+)?)'\s*(?:(\d+(?:\.\d+)?)")?$/);
  if (feetInches) return Number(feetInches[1]) * 0.3048 + Number(feetInches[2] ?? 0) * 0.0254;
  const number = text.match(/^(\d+(?:\.\d+)?)\s*(m|ft|feet)?$/i);
  if (!number) return null;
  return Number(number[1]) * (/^(ft|feet)$/i.test(number[2] ?? '') ? 0.3048 : 1);
}

export function heightRecord(element) {
  const tags = element.tags ?? {};
  const parsedHeight = meters(tags.height);
  const explicit = parsedHeight > 0 ? parsedHeight : null;
  const levels = /^\d+(?:\.\d+)?$/.test(tags['building:levels'] ?? '') ? Number(tags['building:levels']) : null;
  const roof = meters(tags['roof:height']);
  const base = meters(tags.min_height);
  return {
    osm_id: `${element.type}/${element.id}`,
    name: tags.name ?? null,
    kind: tags['building:part'] && tags['building:part'] !== 'no' ? 'part' : 'outline',
    explicit_height_m: explicit,
    levels,
    // Deliberately labeled heuristic, not a measurement or validated true height.
    estimated_height_m: explicit === null && levels > 0 ? levels * 3 + (roof ?? 0) : null,
    height_source: explicit !== null ? 'osm-height-tag' : levels > 0 ? 'estimated-from-levels' : 'unknown',
    min_height_m: base,
    source_height: tags['source:height'] ?? null,
    height_accuracy: tags['height:accuracy'] ?? null,
    tags,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const raw = JSON.parse(readFileSync(`${assets}columbus-buildings-osm-v1.json`, 'utf8'));
  if (raw.remark || !raw.elements?.length) throw new Error(raw.remark ?? 'Empty building extract');
  const buildings = raw.elements.filter((e) => {
    const t = e.tags ?? {};
    return (t.building && t.building !== 'no') || (t['building:part'] && t['building:part'] !== 'no');
  });
  const records = buildings.map(heightRecord);
  const summarize = (items) => ({ total: items.length, explicitHeight: items.filter((r) => r.height_source === 'osm-height-tag').length, levelsEstimate: items.filter((r) => r.height_source === 'estimated-from-levels').length, unknown: items.filter((r) => r.height_source === 'unknown').length });
  const report = {
    bbox: [-83.064, 39.929, -82.977, 39.989],
    source_timestamp: raw.osm3s?.timestamp_osm_base,
    attribution: '© OpenStreetMap contributors',
    license: 'https://opendatacommons.org/licenses/odbl/1-0/',
    outlines: summarize(records.filter((r) => r.kind === 'outline')),
    parts: summarize(records.filter((r) => r.kind === 'part')),
    relations: buildings.filter((e) => e.type === 'relation').length,
    estimate_rule: '3 metres per above-ground floor plus tagged roof height; heuristic only',
    records,
  };
  writeFileSync(`${assets}columbus-building-heights-v1.json`, JSON.stringify(report));
  console.log(JSON.stringify({ ...report, records: undefined }, null, 2));
}
