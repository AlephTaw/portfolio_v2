import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const app = fileURLToPath(new URL('../', import.meta.url));
const source = readFileSync(`${app}../mobile-mvp/assets/maps/columbus-central/columbus-central.svg`, 'utf8');
const bounds = source.match(/<clipPath id="map"><rect x="50" y="50" width="1500" height="([\d.]+)"/);
const content = source.match(/(<defs>[\s\S]*?<\/defs><g clip-path="url\(#map\)"[\s\S]*?<\/g>)/);
if (!bounds || !content) throw new Error('Unexpected Columbus map layout; refusing to crop map content.');
mkdirSync(`${app}public/maps`, { recursive: true });
const map = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="${bounds[1]}" viewBox="50 50 1500 ${bounds[1]}"><title>Central Columbus street and path layout</title><desc>© OpenStreetMap contributors. ODbL. https://www.openstreetmap.org/copyright</desc><rect x="50" y="50" width="1500" height="${bounds[1]}" fill="#f6f4ee"/>${content[1]}</svg>`;
writeFileSync(`${app}public/maps/columbus-world.svg`, map);
// Preview uses exactly the same scene coordinates and map size as WorldMapView.
const desert = readFileSync(`${app}public/world-desert-overhead-v1.png`).toString('base64');
const mapData = Buffer.from(map).toString('base64');
mkdirSync(`${app}assets`, { recursive: true });
writeFileSync(`${app}assets/world-map-preview.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941"><image width="1672" height="941" href="data:image/png;base64,${desert}"/><defs><clipPath id="world-circle"><circle cx="836" cy="470.5" r="445"/></clipPath></defs><g clip-path="url(#world-circle)"><image x="336" y="20.63" width="1000" height="899.74" href="data:image/svg+xml;base64,${mapData}"/></g></svg>`);
console.log('Prepared complete map without title/legend margins and circular world preview.');
