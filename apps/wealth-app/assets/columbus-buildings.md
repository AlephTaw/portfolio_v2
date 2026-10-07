# Columbus building footprint and height audit

Retrieved October 7, 2026 from https://overpass.private.coffee/api/interpreter,
using `columbus-buildings-query.overpass`. Bounding box matches the existing
street map: west −83.064, south 39.929, east −82.977, north 39.989.
The provider reported a database timestamp of **2026-06-01T08:52:28Z**; this
download must not be described as a verified October-current OSM snapshot.

## Files

- `columbus-buildings-osm-v1.json`: original OSM ways/relations and geometry,
  unaltered, including building parts and multipolygon members.
- `columbus-building-heights-v1.json`: height/tag index and audit summary.
- `../scripts/audit-building-heights.mjs`: repeatable normalization/audit.

## Coverage

| Tagged feature | Total | Explicit height | Floor-count estimate | Unknown |
| --- | ---: | ---: | ---: | ---: |
| Building outlines | 29,831 | 16 | 1,289 | 28,526 |
| Building parts | 3,767 | 70 | 3,171 | 526 |

There are 67 tagged relations. These are feature counts, not counts of distinct
physical buildings. Parts overlap their parent outlines; do not blindly render
both volumes or add their counts as unique buildings. Relations need proper
outer/inner-ring assembly (including courtyards) before mesh extrusion. The
original geometry remains intact and has not been clipped to the desert circle.

## Height handling

`height` is converted from metres, feet, or feet/inches. Ambiguous ranges and
multiple values are not guessed. Positive explicit heights take priority and
are tagged `osm-height-tag`—not claimed to be measured or independently verified.
Original tags, `source:height`, and `height:accuracy` are retained when available.

For missing height, a positive `building:levels` can produce a **heuristic** of
3 metres per above-ground floor plus separately tagged roof height. These values
are stored in `estimated_height_m`, never presented as recorded OSM heights.
For pitched roofs this only approximates a flat-top first-pass extrusion; roof
floor counts, use-specific floor heights and complex vertical parts need later
handling. Unknown heights remain null; no arbitrary defaults have been baked in.
`min_height` is kept separately for elevated volumes, not added to total height.

## Scope and license

This prepares data only; it does not modify the existing world view, install a
3D renderer, or claim the dataset is a complete 3D city. Supplementary height
data or explicit visual defaults will be needed for most outlines.

© OpenStreetMap contributors, ODbL:
https://www.openstreetmap.org/copyright
Tag references:
https://wiki.openstreetmap.org/wiki/Key:height
https://wiki.openstreetmap.org/wiki/Key:building:levels
https://wiki.openstreetmap.org/wiki/Simple_3D_Buildings
