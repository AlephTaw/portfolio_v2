# Local cube-removal experiment

No Runway calls, image-generation calls, media uploads, or generation credits used for this repair. OpenCV/NumPy downloaded into an isolated temporary environment. Uses the previously created cube-free endpoint as a reusable clean plate; that still was AI edited in an earlier task, not generated again here.

## Selected preview

- `../public/landing-planet-to-city-flight-v1-local-repair-v6.mp4`
- Lossless master: `landing-planet-to-city-flight-v1-local-repair-v6.mkv`
- Per-frame masks/registration report: `landing-planet-to-city-flight-v1-local-repair-v6.json`
- Sampled contact sheet: `landing-planet-to-city-flight-v1-local-repair-v6-contact.png`
- Reproducible script: `../scripts/repair-flight-cube.py` (numpy/opencv required; refuses overwrite).

Source: `landing-planet-to-city-flight-v1-exact.mkv`. Output remains 1448×1086, 24 fps, 120 frames, exactly five seconds, no audio. Original source and original public MP4 retained unchanged.

## Landing integration

The landing flight now uses the selected v6 MP4. The city scene uses `../public/landing-desert-city-local-repair-v6.png`, extracted from frame 119 of its lossless master, to avoid restoring the cube after playback. Playback controls, timing, crops and other animation behavior unchanged. Original `../public/landing-planet-to-city-flight-v1.mp4` and all original masters are preserved for later use.

## Method

Frames 0–38 untouched. Frames 39–59 use manually interpolated small mask bounds and same-frame scanline background interpolation. Frames 60–119 use cube color segmentation/convex mask, ORB background registration with RANSAC similarity transforms, short temporal smoothing, warped cube-free endpoint plate, perimeter color matching and Poisson blending. OpenCV mutates its clone input mask, so copies must be supplied. Wider repair margins prevent cube-edge color bleeding into the blend.

This is a local compositing approximation, not a temporally trained video-inpainting model or a full 3D background reconstruction. Hidden scenery is reconstructed plausibly, not recovered exactly. Cloud/horizon patches can still differ from the surrounding source and a local-fill-to-plate transition occurs around frame 60; playback review is needed before production adoption.

## Validation

Decoded source/master compared across all 120 frames: no changed pixels outside each recorded repair rectangle. The first 39 frames are identical. Contact-sheet inspection of all affected frames in trial v5 and sampled v6 frames shows no visible cube; v6 replaces early cloud-edge fill to avoid pointed blobs. Fullscreen playback temporal quality is not automatically certified. Browser MP4 is lossy and thus does not preserve untouched pixels exactly as the lossless master does.

Closer inspection found a tiny cube sliver already at zero-based frame 39, so this experiment repairs 81 frames rather than the earlier approximate count of 80.

Earlier unsuccessful trial renders retained in `cube-repair-trials/`; no originals deleted.
