# Local source assets

Large source captures, production video masters, repair trials, and generated
previews are excluded from Git. They remain on the development machine; this
policy does **not** delete them or constitute a remote backup.

The app's web-ready files under `public/`, source code, generation scripts,
Overpass queries, and provenance documentation remain committed.

For a fresh checkout, retrieve building data with
`assets/columbus-buildings-query.overpass` from an Overpass endpoint, saving the
response as `assets/columbus-buildings-osm-v1.json`. Run the audit and building
layer scripts documented in `columbus-buildings.md` and
`columbus-building-layer.md` to regenerate the local derived data.
Retrieval later may return a newer dataset; use an external archive if an exact
historical capture is required.

For team sharing or durable preservation of exact video masters/source captures,
use an asset bucket, release archive, or explicitly configured Git LFS. Do not
push the local backup ref or all refs indiscriminately.
