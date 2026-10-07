# Desert planet to city flight

Generated with the connected Runway video tool. Task: `fce0280a-a4f5-4f6e-b770-99f8433b84cf`. One five-second generation, approximately 200 credits. No audio.

## Assets

- Original generation: `landing-planet-to-city-flight-v1-runway.mp4` (1664 × 1248, 24 fps, 121 frames).
- Endpoint-locked master: `landing-planet-to-city-flight-v1-exact.mkv` (1448 × 1086, lossless FFV1 RGB, 24 fps, 120 frames, exactly 5 seconds).
- Browser playback copy: `../public/landing-planet-to-city-flight-v1.mp4` (H.264, 1448 × 1086, 24 fps, exactly 5 seconds). This is compressed and is not pixel-identical to the PNGs; use the master when exact endpoint pixels matter.

## Endpoint verification

The first and last master frames are replaced with the unmodified original PNG pixels. The intervening generated footage is scaled to their original dimensions. One extra generated frame is omitted to keep the delivery at exactly five seconds.

Decoded RGB SHA-256 hashes match the original images:

- First frame, `landing-desert-planet-v3.png`: `098a093d8dda5bd5b1040339fc55bec8645bf9936830c9961aa19096b6608325`.
- Last frame, `landing-desert-city-v1.png`: `6a7035b0879f8f7d259bc9179dc417125df4bc1486fb6583a8633e0efa59c61d`.

Reproduce using `node scripts/build-flight-master.mjs /absolute/path/to/landing-planet-to-city-flight-v1-runway.mp4`. The script refuses to overwrite existing deliverables and verifies both endpoint hashes before producing the MP4.

## Landing integration

Only the desert-planet → desert-city transition uses this video. Earth → desert planet and desert city → Earth retain their randomized grid transitions. The video stays preloaded and uses centered `object-fit: cover`, matching the surrounding background crops. Pause/resume and the 1×–6× speed selector control playback without resetting its position. Video completion, rather than a separate timer, triggers the city frame sequence, so buffering cannot cut the flight short. Loading or playback failure advances directly to the city without stalling the tour.

## Generation prompt

A five-second single uninterrupted cinematic camera flight from orbit to the desert city, using the provided starting and ending images as strict composition anchors. Begin exactly on the supplied orbital desert-planet view, with its curved diagonal horizon, black space, thin cyan atmosphere, cream clouds and warm golden sunlight. The camera gently orbits along the curvature while banking to level the horizon, then smoothly accelerates forward and downward through the atmosphere toward one point on this same planet. Let the terrain gain convincing scale and parallax as altitude decreases; distant dunes, mesas and mountain ranges become readable. Clouds pass naturally as the black sky gradually becomes the supplied turquoise daylight sky. Reveal the circular Columbus-inspired city and its river in the immense desert, with the single featureless pitch-black cube already hovering motionless above its center. Decelerate and settle precisely into the supplied final city's camera angle, framing and object positions, including the sun, cube, circular city footprint, river and foreground dunes. Preserve the existing clean simplified cel-shaded illustrated aesthetic, muted cream, ochre and turquoise palette, coherent planetary geography and lighting throughout. This is actual continuous camera orbit and descent, not a crossfade, image morph, slideshow, cut, teleport or dissolve. No text, UI, added objects, people or watermark. First frame must match the starting reference exactly and final frame must match the ending reference exactly.
