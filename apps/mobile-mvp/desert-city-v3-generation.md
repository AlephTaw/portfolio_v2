# Desert city v3 — photographic detail pass

- Tool: built-in image generation, two targeted edit passes.
- Source: `public/landing-desert-city-v2.png`.
- Final asset: `public/landing-desert-city-v3.png`.
- Focus: irregular natural foliage, more textured river water, reflected highlights, and urban surface detail.
- Output dimensions: 1448 × 1086. The tool retained the source dimensions despite the higher-resolution request; this is a generative detail enhancement, not a pixel-resolution upscale.
- Original variants and the live app/flight endpoint remain unchanged.
- Surrounding illustrated scene is visually retained, not guaranteed pixel-identical; the generated city may have minor geometry drift.

## Initial prompt

Use case: precise-object-edit, localized photographic detail enhancement.
Image 1 is the edit target. Enhance ONLY the circular city cutout in the lower middle. The existing city still resembles a video game render: replace that synthetic rendering with genuinely convincing documentary aerial-photograph realism, with substantially higher resolved natural detail. Do not just sharpen or add noise to the existing CGI textures.
Highest priority TREES: replace smooth identical green blobs with distinct, irregular real deciduous trees, varied species and canopy size, intricately branching crown silhouettes, uneven clusters of leaves, gaps exposing limbs, leaf-scale mottled highlights, fine self-shadowing, varied greens and natural unsaturated color. Detail must be appropriate to this distant aerial scale, not oversized leaves or bushes.
Highest priority WATER: real river surface, finely broken sun reflections, small wind-driven ripples at plausible scale, nonuniform currents, muted silvery blue-green/brown variations, irregular realistic reflections of trees/buildings/bridges, darker shaded water under bridges and near banks. No flat teal fill, no perfectly smooth CG mirror, no stylized paint. Keep the river course and exact bridge locations unchanged.
Buildings and ground: resolve varied brick/concrete/glass materials, windows and believable rooftop HVAC/vents, tiny natural wear and subtle dirt, roads with fine asphalt texture and correctly scaled markings. Restrained photographic exposure, realistic microcontrast and slight aerial atmospheric depth. No toy-city geometry, no waxy plastics, no excessive HDR, no oversharpening, no uniform procedural textures. This city's interior should read as an actual high-quality aerial photograph of a real Columbus Ohio urban district, not Unreal/Unity/game graphics or concept art.
Preserve all geometry and composition: camera, framing, city footprint and perimeter, skyline, roads, bridges, river, building locations and scale. Keep the circular city's boundary exactly where it is.
ABSOLUTE INVARIANTS OUTSIDE THE CITY: preserve the surrounding illustrated desert and every dune/mesa/mountain, bright cyan sky and cloud formations, sun, huge floating black cube and its shape/size/position, and the original lighting direction and image aspect ratio. Do not photorealize the desert or cube. Deliberate contrast between photographic city and illustrated surroundings.
Output at high resolution, ideally 2896 x 2172 or higher with the same 4:3-like source framing; prioritize newly resolved city detail rather than mere pixel interpolation. No added objects, labels, text, watermark or logos.

## Final refinement prompt

Edit target: the supplied desert city image. Replace the entire rendering INSIDE the circular city boundary with real photographic-looking urban landscape textures. Be much more aggressive about removing the CGI appearance than the previous pass. The city must resemble a high-resolution raw drone photograph composited into the illustrated scene, not a miniature city, not a computer game, not an architectural visualization.
Trees are the key failure to correct: do NOT draw round spherical smooth green canopy blobs. At this aerial distance, render densely textured overlapping foliage with ragged edges, many small uneven leaf clusters and contrasting gaps, irregular crowns, nonuniform natural tones and subtle branch structure. Eliminate procedural identical tree shapes and polished artificial gradients. Include realistic fine canopy texture across all tree-covered areas, especially the foreground riverbank.
River is the other key failure: replace smooth dark-blue shaded glass with real visibly textured river water. Fine wind ripples, irregular choppy reflections, rippled fragmented building/tree reflections, streaks of sun sparkle, bank-dependent color variation and subtle murky sediment tones. Not noisy paint; physically plausible real water photographed from an elevated camera.
Add truthful photographic microdetail to city roofs, brick buildings, windows, asphalt streets and bridge surfaces. Use restrained natural exposure and imperfect real-world surfaces instead of pristine model materials. Maintain existing geography and scale; the city is far below the camera, not oversized.
Keep the original composition, skyline positions, city circular footprint, river route, bridge locations, camera and daylight direction. Everything outside the circular city MUST remain the original stylized illustration: sky, clouds, sun, desert terrain, distant mountains, huge black cube. Do not change them. No extra objects or text. Preserve the original image aspect ratio and framing. Resolve as much fine photographic city texture as possible at the highest available output resolution. This is a photographic city insert with a stylized environment, NOT an overall photorealistic image.

