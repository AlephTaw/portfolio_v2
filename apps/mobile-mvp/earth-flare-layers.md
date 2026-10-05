# Earth background / flare layer pair

Created with the built-in image-generation tool from `public/landing-earth-generated-v1.png`.

- `public/landing-earth-clean-v1.png`: clean background plate; physical sunrise and atmospheric light remain.
- `public/landing-earth-flare-v1.png`: transparent RGBA optical flare overlay.
- Both canvases are 1448 × 1086. Position and size both identically when layering, with identical object-fit and object-position.
- Original asset and live background unchanged.
- AI-reconstructed layers, not a pixel-exact separation. Tune flare opacity when animated.

## Background prompt

Edit the supplied orbital Earth image into a clean background plate for layered animation. Keep the exact framing, planet curvature, cloud formations, surface detail, atmospheric blue-to-golden transition, physical sunrise illumination, black sky, and image dimensions. Remove only optical lens-flare artifacts: the long horizontal light streak, starburst rays extending into space, and green/purple/blue flare ghosts trailing diagonally toward the lower left. Preserve the bright physical sun on the horizon and natural atmospheric glow. Seamlessly reconstruct the obscured background. Do not add text or any new objects. This is the background plate of a two-layer decomposition; preserve all non-flare pixels as closely as possible.

## Transparent overlay prompt

Extract/recreate ONLY the optical lens flare from the supplied Earth sunrise image as an animation overlay on a genuinely transparent background. Output full original canvas 1448 by 1086, preserving exact original positions, scale and alignment. The flare origin is at approximately x=880 y=400 (61% width, 37% height). Include warm white/gold starburst rays and bloom, long fine horizontal light streak extending right, and the faint green, violet and blue optical ghost chain running diagonally from the sun toward the lower left. Preserve the source's delicate realistic translucent optical appearance, soft alpha gradients and sparse flare colors. Everything except these lens flare artifacts must be fully transparent: NO Earth, clouds, horizon, atmospheric rim, sky, dark backing, checkerboard drawing, text, or new objects. Do not crop or recenter the flare; keep the full original 4:3 canvas so this PNG overlays the clean background with both images using identical positioning.

