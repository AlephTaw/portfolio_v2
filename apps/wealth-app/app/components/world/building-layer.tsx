import { MAP_HEIGHT, MAP_WIDTH } from "./map-camera";

// Precomputed vector prisms avoid thousands of live React/DOM building nodes.
// This shares the street-map transform, including its pan, zoom, and circular mask.
export function BuildingLayer({ includeEstimates }: { includeEstimates: boolean }) {
  if (!includeEstimates) return <image href="/maps/columbus-buildings-recorded-v1.svg" aria-label="Buildings with recorded heights only" x={-MAP_WIDTH / 2} y={-MAP_HEIGHT / 2} width={MAP_WIDTH} height={MAP_HEIGHT} pointerEvents="none" />;
  return <g aria-label="Building extrusions including estimated heights" pointerEvents="none">
    {Array.from({ length: 16 }, (_, index) => {
      const col = index % 4, row = Math.floor(index / 4);
      return <image key={index} href={`/maps/buildings-v1/${col}-${row}.svg`} x={-MAP_WIDTH / 2 + col * MAP_WIDTH / 4} y={-MAP_HEIGHT / 2 + row * MAP_HEIGHT / 4} width={MAP_WIDTH / 4} height={MAP_HEIGHT / 4} />;
    })}
  </g>;
}
