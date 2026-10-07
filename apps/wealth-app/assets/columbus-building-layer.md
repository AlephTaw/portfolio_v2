# Separate Columbus building layer

`WorldMapView` adds `BuildingLayer` above the unchanged street image, under the
existing circular mask. Both use exactly the same coordinates and camera, so
resizing, panning and zooming cannot separate the buildings from the streets.
Neighborhood labels are repeated above the buildings to remain legible.

## Rendering approach

This is a first-pass **2.5D cartographic vector extrusion**, not a freely rotatable
3D scene. Real footprint rings form prism roofs and walls, projected with a fixed
vertical direction (roof offset +0.25x, −1y per projected height unit). Ground
footprints retain their original north-up Mercator alignment. Vertical dimensions
use the map's approximate local metres-to-pixels scale, not arbitrary zoom-based
height changes. Full 3D camera tilt, shadows, pitched roofs and gameplay collision
meshes are not implemented in this pass.

Sixteen small transparent SVG image tiles are generated offline and composited
as one separate layer. Roof bounds are included when selecting neighboring tiles
to preserve buildings across tile seams. This avoids the browser failing to load
a single large 19 MB SVG, and avoids adding 30,000 live React/DOM building nodes.
The recorded-only subset uses one small SVG. Visibility and estimate controls
are independent of map pan/zoom and remain mounted across visor toggles.

## Data and defaults

After assembling multipolygons and suppressing overlapping parent outlines:

- 30,798 footprint/part features rendered (not unique physical building count).
- 73 use explicit OSM height tags.
- 4,114 use floor-count estimates from the height audit.
- 26,611 use a **visual default of 6 metres** because height information is absent.

The default is not a claim about actual building height. "Include estimates"
off hides both floor estimates and defaults, leaving explicit-height features.
Roofs use subtly different neutral shades for recorded, floor-derived and default
height classes. This is a schematic, not a validated Columbus skyline.

Multipolygon holes/courtyards are kept; fragmented relation rings are joined.
Parent building outlines containing mapped parts are omitted per OSM's simple
3D convention to avoid duplicate volumes. Incomplete mapped parts can therefore
leave omissions; no synthetic missing parts are silently invented. One unclosed
way is rejected and one `type=building` grouping relation is not itself rendered;
its independently tagged child ways remain available. IDs and summary are in
`columbus-building-layer-v1.json`.

## Rebuild

From the repository root:

```sh
node apps/wealth-app/scripts/build-building-layer.mjs
```

Inputs: raw OSM extract and prepared `public/maps/columbus-world.svg`.
Outputs: `public/maps/buildings-v1/*.svg`, recorded-only and label SVGs,
and the audit report. The initial full SVG master is retained in assets for
inspection but is not loaded by the application.

Source snapshot timestamp: 2026-06-01T08:52:28Z (provider-reported), retrieved
October 7, 2026. © OpenStreetMap contributors, ODbL; see the height audit notes
and https://www.openstreetmap.org/copyright. No new map renderer dependency,
third-party service or API call was required to add this layer.
