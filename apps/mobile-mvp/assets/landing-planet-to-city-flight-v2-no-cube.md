# Cube-free orbit-to-city flight

Runway task: `3af8afc1-ec51-4c55-90de-900a8dcd1073`. Seedance 2.0, 5 seconds, 4:3, 1080p, no audio; approximately 200 credits. New generation, not a surgical edit of the original motion.

Uses the original prompt in `landing-planet-to-city-flight-v1.md`, with only these cube references removed: `, with the single featureless pitch-black cube already hovering motionless above its center` and `cube, ` in the final framing list. All other wording unchanged.

Start: `../public/landing-desert-planet-v3.png`, the original master’s first frame. End: `../public/landing-desert-city-flight-final-no-cube-v1.png`, the edited final frame. The user's uploaded cube-free city PNG has identical decoded pixels. The uploaded planet reference is a resized copy; the original endpoint resolution is retained.

## Deliverables and verification

- Generated source: `landing-planet-to-city-flight-v2-no-cube-runway.mp4`.
- Lossless FFV1 RGB master: `landing-planet-to-city-flight-v2-no-cube-exact.mkv`.
- Browser playback: `../public/landing-planet-to-city-flight-v2-no-cube.mp4` (lossy H.264, not pixel-exact).
- Contact sheet: `landing-planet-to-city-flight-v2-no-cube-contact.png`; ten sampled frames inspected, no cube visible, orbit/bank/descent into city present.

Master: 1448×1086, 24 fps, 120 frames, exactly 5 seconds. First and last frames replaced with unmodified endpoint pixels and verified by decoded RGB SHA-256:

- First: `098a093d8dda5bd5b1040339fc55bec8645bf9936830c9961aa19096b6608325`.
- Last: `44c89913c3b4aaa5e9fcd63d11b64bfd56aafc1032f6b5ae6d0bad08519827b8`.

Generated intermediate motion differs from the previous generation; identical prompting cannot guarantee identical motion. Original assets and live landing references unchanged.

Reproduce master assembly with `node scripts/build-flight-master.mjs /absolute/path/to/landing-planet-to-city-flight-v2-no-cube-runway.mp4 /absolute/path/to/landing-desert-planet-v3.png /absolute/path/to/landing-desert-city-flight-final-no-cube-v1.png landing-planet-to-city-flight-v2-no-cube`. Existing outputs are never overwritten.
