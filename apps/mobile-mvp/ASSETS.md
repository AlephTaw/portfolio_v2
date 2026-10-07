# Landing page assets

All generated variants are saved locally in this app; no asset depends on a Codex-only output path.

The background/flare layer pair and prompts are documented in `earth-flare-layers.md`.

| Asset | Description |
| --- | --- |
| `public/landing-earth.png` | Original user-provided Earth reference |
| `public/landing-earth-generated-v1.png` | Original AI-generated photorealistic Earth sunrise; current live background |
| `public/landing-earth-clean-v1.png` | Separate clean background plate for animation |
| `public/landing-earth-flare-v1.png` | Transparent, full-canvas lens flare overlay |
| `public/landing-earth-toon-v1.png` | First toon-shaded Earth variant |
| `public/landing-earth-toon-v2.png` | Simplified, reference-guided illustrated Earth variant |
| `public/landing-desert-planet-v1.png` | Illustrated desert surface variant preserving the sky and orbital composition |
| `public/landing-desert-planet-v2.png` | Desert planet with restored cloud formations and smaller, distributed terrain features |
| `public/landing-desert-planet-v3.png` | Reference-guided natural basins, winding escarpments and clustered mountains, retaining clouds |
| `public/landing-desert-city-v1.png` | Original illustrated desert city background and existing flight-video endpoint |
| `public/landing-desert-city-v2.png` | New photographic city-cutout edit preserving the illustrated surroundings; saved separately, not yet wired into the landing sequence. Prompt in `desert-city-v2-generation.md`. |
| `public/landing-desert-city-v3.png` | Further generative detail refinement of the city foliage and river; 1448×1086, saved separately without changing live assets. Prompts in `desert-city-v3-generation.md`. |
| `public/landing-desert-city-v4.png` | Photo-informed landscaping pass: less canopy in commercial blocks, open riverfront lawns/paths and varied planting density. Generated rendering, 1448×1086; saved separately, live assets unchanged. Reference classifications and prompt in `desert-city-v4-generation.md`. |
| `public/landing-desert-city-v5.png` | Final lighting/boundary polish: near-black void cube without glow, softer city/desert integration and no outward-running infrastructure. Generated rendering, 1448×1086; saved separately, live assets unchanged. Prompt in `desert-city-v5-generation.md`. |
| `public/landing-desert-city-v6.png` | Muted sky/desert palette, mellow lighting and more naturally distributed illustrated clouds. Generated rendering, 1448×1086; live assets unchanged. Built-in generation prompts in `desert-city-v6-generation.md`. |
| `public/landing-desert-city-v7.png` | Composite using v5 as approved city/cube basis and v1 as original illustrated exterior reference; 1448×1086, not pixel-exact. Live assets unchanged. Prompts in `desert-city-v7-generation.md`. |
| `public/landing-desert-city-selected.png` | Exact user-selected upload from October 6, 2026, preserved without regeneration. |
| `public/landing-desert-city-selected-no-cube.png` | Cube removed from the exact selected upload using built-in image generation; 1448×1086. Prompt in `desert-city-selected-generation.md`. Live assets unchanged. |
| `public/sulek-car-short-clip.mp4` | User-provided final landing clip, converted from MOV to muted H.264 MP4; fixed focal point at normalized (0.27, 0.50) keeps the subject centered in responsive crops |
| `public/meal-prep-nutrition-clip.mp4` | User-provided `nutrition clip - sulek.mov`, used in the bottom frame of the third landing animation beneath the existing character status glass panel, before the first background transition. First 6 seconds trimmed, retaining the remaining approximately 5.93 seconds. Muted H.264, scaled to 1280px wide; focal point (0.40, 0.43) centers the subject in responsive crops. |
| `public/build-hero-toon-v3.png` | Previous desert-only toon character hero |
| `public/build-toon-covers-v3.png` | Previous toon character covers |
| `public/build-hero-toon-v4.png` | Current restrained, less glamorous desert character hero |
| `public/build-toon-covers-v4.png` | Current understated desert character covers |
| `public/build-space-covers-v2.png` | Character-free realistic Earth and space covers |
| `public/landing-desert-city-ranger-v1.png` | Generated grey Ranger bridge scene using the MVP bald NPC portrait; prompt/provenance in `desert-city-ranger-generation.md` |
| `public/landing-desert-city-ranger-v2.png` | First-generation composition with Cactus Gray paint and corrected driver seating; prompt in `desert-city-ranger-v2-generation.md` |
| `public/landing-desert-city-ranger-v3.png` | NPC face refined toward first-generation likeness, retaining Cactus Gray paint and driver seating; prompt in `desert-city-ranger-v3-generation.md` |
| `public/landing-desert-city-ranger-v4.png` | Neutral NPC expression and closed windows; prompt in `desert-city-ranger-v4-generation.md` |
| `public/landing-desert-city-ranger-v5.png` | Camera and truck relocated onto background-right bridge, heading toward city ahead; prompt in `desert-city-ranger-v5-generation.md` |
| `public/landing-desert-city-ranger-v6.png` | Rear-following viewpoint driving into city; prompt in `desert-city-ranger-v7-generation.md` |
| `public/landing-desert-city-ranger-v7.png` | Rear-following truck in right lane beyond dotted white divider; prompt in `desert-city-ranger-v7-generation.md` |
| `public/landing-desert-city-ranger-v8.png` | Right passenger-side orbit, NPC in far driver seat and central skyline out of frame; prompts in `desert-city-ranger-v8-generation.md` |
| `public/landing-desert-city-ranger-v9.png` | First passenger-window image with truck and occupant facing right; prompt in `desert-city-ranger-v9-generation.md` |
| `public/landing-desert-city-ranger-v10.png` | Four-seat cabin, two per row; NPC in driver seat, other seats empty; prompt in `desert-city-ranger-v10-generation.md` |
| `public/landing-desert-city-ranger-v11.png` | Front passenger seat moved farther backward toward B pillar; prompt in `desert-city-ranger-v11-generation.md` |
| `public/landing-desert-city-ranger-v12.png` | All-black side mirror without white indicator strip; prompt in `desert-city-ranger-v12-generation.md` |
| `public/landing-desert-city-ranger-v13.png` | Zoomed-out complete truck side view; prompt in `desert-city-ranger-v13-generation.md` |
| `public/landing-desert-city-ranger-v14.png` | Intermediate rear-right quarter angle, city ahead; prompt in `desert-city-ranger-v14-generation.md` |
| `public/landing-desert-city-ranger-v15.png` | Intermediate angle with NPC moved into front driver position; prompt in `desert-city-ranger-v15-generation.md` |
| `public/landing-desert-city-flight-final-no-cube-v1.png` | Cube removed from the extracted final frame of the desert-city flight; provenance in `assets/desert-city-no-cube-video-v1.md` |
| `public/landing-desert-city-no-cube-v1.mp4` | New five-second cube-free city establishing shot; separate asset, not yet wired into landing sequence |
| `public/landing-planet-to-city-flight-v2-no-cube.mp4` | Regenerated five-second cube-free orbit-to-city flight; verified pixel-exact endpoint master in assets; live references unchanged |
| `public/landing-planet-to-city-flight-v1-local-repair-v6.mp4` | Active landing flight; local tracked cube removal, original motion retained; original video preserved; see assets/local-cube-repair.md |
| `public/landing-desert-city-local-repair-v6.png` | Active landing city scene; exact final frame of the local repair master, preventing cube reappearance after flight |
| `public/line1.svg` | Speedrun IRL wordmark with the background rectangle removed |
| `public/icons/app.svg` | App icon source |
| `public/icons/app-192.png` | 192px PWA icon |
| `public/icons/app-512.png` | 512px PWA icon |
| `public/icons/apple-touch-icon.png` | 180px Apple touch icon |

Generation prompts and provenance are preserved in `earth-image-generation.md`, `earth-toon-generation.md`, `earth-toon-v2-generation.md`, `desert-planet-generation.md`, `desert-planet-v2-generation.md`, and `desert-planet-v3-generation.md`. External reference images were used as guidance only; they are not redistributed as application assets. AI generation is not a copyright-clearance guarantee.
