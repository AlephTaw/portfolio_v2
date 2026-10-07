"use client";

import { WorldMapView } from "./world-map-view";

// Separate entry point for the location-based gameplay experience. Reuse the
// existing world for now without coupling future gameplay to the default map.
export function AltWorldView() {
  return <WorldMapView fixedFraming />;
}
