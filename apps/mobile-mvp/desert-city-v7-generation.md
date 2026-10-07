# Desert city v7 — original exterior, v5 city

- Built-in image generation: two compositing attempts; selected the second, with v5 as the primary edit target.
- Primary target: `public/landing-desert-city-v5.png` (approved city and black cube).
- Exterior reference: `public/landing-desert-city-v1.png` (approved illustrated desert and sky).
- Final: `public/landing-desert-city-v7.png`, 1448 × 1086.
- User clarified that v5 has the best city and original v1 has the desired stylized exterior. Earlier desaturation/cloud experiments are not the visual target.
- Selected result restores the original-like golden cel-shaded desert and turquoise sky while using v5 as the city/cube basis.
- This is a generated composite, not pixel-exact transplantation. City details and exterior may drift; v5 is preserved separately as the approved city reference.
- Live app background and existing flight-video endpoint unchanged.

## First attempt prompt (not selected)

Use case: compositing.
Input roles: IMAGE 1 (landing-desert-city-v1) is the PRIMARY EDIT TARGET and authoritative background plate. IMAGE 2 (landing-desert-city-v5) supplies ONLY the improved circular city interior, softened city perimeter treatment, and black void cube.
User correction: the stylized exterior in IMAGE 1 is practically perfect and must be practically identical in the output. Restore the ORIGINAL IMAGE 1 exterior instead of trying another global desaturation or redesign.

Start from IMAGE 1. Leave ALL its illustrated desert and sky intact: same terrain contours/positions, same crisp simple flat cel-colored sand planes, same delicate lines, same golden sand/pale yellow/light apricot palette, same muted mauve mesa shadows, same turquoise-to-pale-mint sky gradient, SAME cloud shapes and locations, same sun location/size and original gentle sunlight quality. Copy those areas as faithfully as possible, not a stylistic reinterpretation. No painterly smoothing, no dusty grey beige wash, no deeper saturated blue sky, no boosted orange, no HDR contrast. Do NOT use Image 2's exterior or cloud distribution.
ONLY replace the circular city interior in Image 1 with the improved city from Image 2: photographic-looking buildings, detailed real water and foliage, sparse downtown trees, open riverbank lawns and walkways. Preserve original camera, circular footprint and all skyline/river/bridge anchor positions. Integrate the perimeter with the gentle narrow transition from Image 2 while retaining Image 1's original surrounding sand. Infrastructure and river must be contained inside the circle; remove the roads extending outside the circle in Image 1 at the right edge, replacing just those outward road segments with matching original illustrated sand.
ONLY replace the floating cube's surface with Image 2's nearly pure pitch-black light-absorbing void appearance: identical cube outline, size and position as Image 1, no reflection, no light glow or rim, no discernible material texture.
Final result = ORIGINAL Image 1 illustrated exterior/sky + refined Image 2 city interior + black void cube. Keep the established photographic-city/illustrated-exterior contrast. Do not redraw the whole scene or recolor everything. Exterior fidelity to IMAGE 1 is the highest priority. Original aspect ratio, no cropping, highest available detail. No text, logos, or watermark.

## Selected attempt prompt

Use case: compositing, localized exterior replacement.
IMAGE 1 (v5) is the PRIMARY EDIT TARGET. Its entire circular CITY is approved and must be preserved unchanged: photographic-looking detail, buildings, tree canopy variety/density, open lawns, paths, textured river reflections, bridges, skyline geometry and lighting. Do not re-render, simplify or stylize ANY part of this city. Image 1's black void cube is also approved and must stay unchanged.
IMAGE 2 (original v1) is a reference ONLY for the STYLIZED EXTERIOR: desert terrain, sky, clouds, sun. Restore Image 2's exterior around the unchanged Image 1 city/cube.
The latest attempted composite regressed city detail by using the original city's more stylized look. DO NOT DO THAT. Absolutely do not use Image 2's city or landscaping. The CITY MUST be Image 1/v5's best photographic city.
Change ONLY the non-city, non-cube areas of Image 1 to faithfully match Image 2: same original crisp cel-colored desert shapes, contours, mesa linework and positions, golden/pale apricot sand, mauve rock shadows, original turquoise-to-pale-mint sky gradient, original thin cream cloud shapes and distribution, original soft sun halo and location. Practically identical original stylized exterior, not a new interpretation, not washed-out dusty greys, not vivid blue HDR sky, not painterly terrain.
Keep Image 1's softened narrow city boundary integration, blending only its outermost edge into the restored original desert. No infrastructure extends outside the circle. Do not restore original Image 2's roads going into the desert; those areas remain uninterrupted matching illustrated sand.
Output = unchanged v5 CITY and unchanged v5 BLACK CUBE, surrounded by original v1 DESERT and SKY. No global grading of the city. No extra objects. Exact composition and aspect ratio; preserve detailed city textures at highest available fidelity. No text/watermarks.

