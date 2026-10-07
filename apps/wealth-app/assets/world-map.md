# Circular Columbus world map

The user-supplied overhead desert image is retained unchanged in
`public/world-desert-overhead-v1.png`. The circle is a viewport mask centered at
(836, 470.5), radius 445 in its 1672 × 941 image coordinate space.

`scripts/prepare-world-map.mjs` derives `public/maps/columbus-world.svg` from
`../mobile-mvp/assets/maps/columbus-central/columbus-central.svg`. It removes
only the original title/legend/attribution presentation margins. All original
map layers and neighborhood labels within the source map extent are retained.
The script refuses unexpected source markup rather than guessing a crop.
The original SVG, data extract, and original world image remain untouched.

The circular mask is applied at display time, not destructively baked into the
map. Dragging moves the map within the fixed desert circle. Wheel, pinch, scale
slider, and +/− controls zoom it; Reset restores the initial central framing.
At minimum zoom the entire rectangular map fits within the circle. Pan bounds
permit every map corner to reach the viewport center. Camera state survives
visor toggles because the component stays mounted while hidden.

The world now occupies a fixed full-viewport layer beneath the existing header
and navbar. The terminal remains in its existing maximum-width column. A single
unrotated `viewBox="0 0 1672 941"` and `preserveAspectRatio="xMidYMid slice"`
provide cover cropping around the circle center on every screen size, with no
breakpoint rotation or letterboxing. Desert, mask, and map share this transform.
On portrait screens the circle's sides may be cropped intentionally; map pan
and zoom remain independent and preserve their state across resizing.

Pointer/wheel coordinates are converted through SVG screen transforms, keeping
gestures aligned with responsive scaling and any scene transforms. A local
non-passive wheel listener prevents zoom gestures from scrolling the page.

Map credit stays visible outside the mask: © OpenStreetMap contributors, ODbL,
https://www.openstreetmap.org/copyright. Data provenance/limitations are in the
mobile-mvp source map README; this is a static vector extract, not a live map or
GPS/routing integration.

`world-map-preview.svg` and `world-map-preview.png` show the initial circular
composition. Subsequent styling edits in another session can differ from this
initial preview; they were preserved rather than overwritten.
