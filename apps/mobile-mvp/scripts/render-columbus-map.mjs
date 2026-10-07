import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../assets/maps/columbus-central/', import.meta.url));
const raw = JSON.parse(readFileSync(`${dir}osm-source.json`, 'utf8'));
if (raw.remark || !raw.elements?.length) throw new Error(raw.remark || 'Empty extract');
const bbox = [-83.064, 39.929, -82.977, 39.989];
const features = raw.elements.flatMap((e) => {
  const properties = { osm_type: e.type, osm_id: e.id, ...e.tags };
  if (e.type === 'node') return [{ type: 'Feature', properties, geometry: { type: 'Point', coordinates: [e.lon, e.lat] } }];
  if (e.type !== 'way' || !e.geometry?.length) return [];
  const coords = e.geometry.map((p) => [p.lon, p.lat]);
  const closed = coords.length > 3 && coords[0][0] === coords.at(-1)[0] && coords[0][1] === coords.at(-1)[1];
  const polygon = closed && !e.tags?.highway && !e.tags?.waterway;
  return [{ type: 'Feature', properties, geometry: { type: polygon ? 'Polygon' : 'LineString', coordinates: polygon ? [coords] : coords } }];
});
const collection = { type: 'FeatureCollection', bbox, attribution: '© OpenStreetMap contributors', license: 'https://opendatacommons.org/licenses/odbl/1-0/', source_timestamp: raw.osm3s?.timestamp_osm_base, features };
writeFileSync(`${dir}columbus-central.geojson`, JSON.stringify(collection));
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
const width = 1600, pad = 50, mapWidth = width - 2 * pad;
const scale = mapWidth / ((bbox[2] - bbox[0]) * Math.PI / 180);
const mapHeight = (mercY(bbox[3]) - mercY(bbox[1])) * scale;
const height = Math.ceil(mapHeight + 150);
const xy = ([lon, lat]) => [pad + (lon - bbox[0]) * Math.PI / 180 * scale, pad + (mercY(bbox[3]) - mercY(lat)) * scale];
const path = (coords) => coords.map((c, i) => `${i ? 'L' : 'M'}${xy(c).map((v) => v.toFixed(2)).join(',')}`).join(' ');
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const layers = [];
for (const f of features.filter((f) => f.geometry.type === 'Polygon' && (f.properties.natural === 'water' || f.properties.leisure === 'park'))) {
  const color = f.properties.natural === 'water' ? '#99cddc' : '#c7d9ba';
  layers.push(`<path d="${path(f.geometry.coordinates[0])}Z" fill="${color}"/>`);
}
for (const f of features.filter((f) => f.geometry.type === 'LineString')) {
  const t = f.properties;
  const pedestrian = /^(footway|path|cycleway|steps|pedestrian|bridleway)$/.test(t.highway);
  const major = /^(motorway|trunk|primary|secondary)(_link)?$/.test(t.highway);
  const river = t.waterway === 'river';
  const stroke = river ? '#99cddc' : pedestrian ? '#99aa91' : major ? '#c99c65' : '#75828b';
  const weight = river ? 12 : pedestrian ? 0.9 : major ? 3 : t.highway === 'service' ? 0.8 : 1.7;
  layers.push(`<path d="${path(f.geometry.coordinates)}" fill="none" stroke="${stroke}" stroke-width="${weight}" ${pedestrian ? 'stroke-dasharray="3 2"' : ''}/>`);
}
const names = new Set(['German Village', 'Arena District', 'Brewery District', 'Franklinton', 'Columbus Civic Center']);
const labels = features.filter((f) => f.geometry.type === 'Point' && names.has(f.properties.name));
for (const f of labels) {
  const [x, y] = xy(f.geometry.coordinates);
  layers.push(`<text x="${x}" y="${y}" text-anchor="middle" font-family="sans-serif" font-size="19" font-weight="bold" fill="#253746" stroke="#f6f4ee" stroke-width="5" paint-order="stroke">${escape(f.properties.name)}</text>`);
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f6f4ee"/><defs><clipPath id="map"><rect x="${pad}" y="${pad}" width="${mapWidth}" height="${mapHeight}"/></clipPath></defs><g clip-path="url(#map)" stroke-linejoin="round" stroke-linecap="round">${layers.join('')}</g><text x="50" y="30" font-family="sans-serif" font-size="20" fill="#253746">Central Columbus — north-up street and path layout</text><text x="50" y="${height - 55}" font-family="sans-serif" font-size="15" fill="#253746">Grey: local streets · ochre: major roads · dashed green: pedestrian/cycle paths · blue: water</text><text x="50" y="${height - 28}" font-family="sans-serif" font-size="14" fill="#253746">© OpenStreetMap contributors · ODbL · openstreetmap.org/copyright · data ${raw.osm3s?.timestamp_osm_base}</text></svg>`;
writeFileSync(`${dir}columbus-central.svg`, svg);
console.log(JSON.stringify({ features: features.length, sourceTimestamp: collection.source_timestamp, neighborhoodLabels: labels.map((f) => ({ name: f.properties.name, coordinates: f.geometry.coordinates })), files: ['osm-source.json', 'columbus-central.geojson', 'columbus-central.svg'] }, null, 2));
