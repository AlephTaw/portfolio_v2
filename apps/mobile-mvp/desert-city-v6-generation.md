# Desert city v6 — muted palette and natural clouds

- Tool: built-in image generation, two targeted edit passes.
- Source: `public/landing-desert-city-v5.png`.
- Final: `public/landing-desert-city-v6.png`, 1448 × 1086.
- More irregular illustrated clouds with less sweeping/fisheye-like banding; softened desert lighting and a clearly less saturated sky/sand palette.
- First cloud/palette pass was still too saturated; the final pass explicitly pulled back chroma.
- Visual preservation only, not pixel-identical. Generated rendering, not a photograph.
- Prior variants and the live background/flight-video endpoint unchanged.

## Initial prompt

Use case: lighting-weather.
Image 1 is the edit target, the approved desert city artwork. Make a subtle finishing edit only to the illustrated desert colors/lighting and the cloud distribution.
DESERT: gently soften the strong orange saturation into muted warm sand, ochre, pale apricot and soft terracotta. Lower harsh lighting contrast a little, retain readable cel-shaded terrain shapes, thin illustration linework and the existing desert texture. It should remain a bright sunlit desert, not washed out, grey, foggy or photorealistic. Preserve consistent directional light from the existing sun upper-right, just make highlights/shadows more mellow and refined.
CLOUDS: replace the exaggerated symmetric sweeping curved horizontal cloud ribbons with an organically uneven, naturally distributed sky. Retain simplified illustrated cream/white cloud forms and the beautiful blue sky. Different cloud group sizes, irregular spacing, some isolated small wisps and modest cloud clusters with believable atmospheric perspective. No mirrored cloud banks, no concentric arcs, no radial patterns, no fisheye lens curvature, no panoramic stretching. Normal rectilinear camera perspective, straight distant horizon. Keep open sky surrounding the cube and sun. Keep sun at its existing position and soften excessive sun halo slightly, without changing time of day.
ABSOLUTE INVARIANTS: preserve exact overall composition, framing and aspect ratio; the city circle size and location, skyline, streets and bridges, river detail, sparse downtown trees and open lawns; photographic-looking CITY must not be recolored into cartoon desert hues or lose fine detail. Keep the gradual city/desert boundary and all infrastructure contained inside that footprint, with no roads escaping. Floating cube must stay same silhouette, scale and position, essentially pitch-black light-absorbing void with no reflection, glow, rim highlight, texture or discernible shaded faces. Preserve surrounding desert landform positions and distant mountains; do not redesign or add objects. Retain the deliberate photographic city versus illustrated exterior distinction. No text, logos or watermark. Highest available detail.

## Final color refinement prompt

Use case: lighting-weather. Image 1 is the edit target. Perform ONLY a restrained color-grading edit. The user says this image STILL looks oversaturated: the change must be clearly noticeable, not another nearly identical saturated result.
Reduce overall chroma by about 35–40 percent relative to this input, strongest in the blue/cyan sky and orange/coral desert. Aim for a sophisticated muted illustrated palette: subdued dusty pale blue sky, warm pale sand/beige, muted ochre, soft dusty peach, subdued grey-lavender terrain shadows; natural restrained olive foliage and river blue. No vivid azure, electric cyan, intense orange, fluorescent yellow or punchy HDR colors. Maintain existing brightness and scene clarity; don't veil everything in white fog or flatten textures. Mellow excessive high contrast highlights and sun bloom a little while preserving consistent directional sunlight. This is a gently colored sunlit illustration, not monochrome, sepia or grey weather.
Keep EVERYTHING geometrically and stylistically unchanged: natural irregular cloud shapes/distribution, straight horizon and rectilinear perspective with no fisheye distortion, city footprint/buildings/landscaping/river/bridges and fine photographic-looking city detail, the illustrated desert features and thin linework, gentle city/desert seam, no roads outside the city boundary. Keep the cube essentially pure black without any glow or reflection; preserve its exact shape/size/position. Sun location unchanged. Do not redraw/add objects, shift the camera or crop. Same aspect ratio and highest available detail. No text or watermark.

