# Central Columbus street layout

Retrieved October 6, 2026 through https://overpass.private.coffee/api/interpreter.
Source database timestamp returned by server: **2026-06-01T08:52:28Z**. This is not a live navigation dataset or a guarantee of completeness.

Extent (WGS84 west, south, east, north): `[-83.064, 39.929, -82.977, 39.989]`. Includes German Village, Arena District, downtown Civic Center, Brewery District, and Franklinton, plus surrounding streets. District labels from OSM are representative place points, not authoritative boundary polygons. Civic Center is covered but has no matching place label in this extract.

## Deliverables

- `osm-source.json`: original Overpass response, including IDs, tags, way node IDs and geometries.
- `columbus-central.geojson`: editable WGS84 street/path, river, simple water/park polygon and place-point features. 17,012 features.
- `columbus-central.svg`: north-up vector street-layout rendering in Web Mercator.
- `columbus-central.png`: visual preview.

These use actual mapped coordinates, not AI-invented streets. Rendering is deliberately simplified; waterways/parks modeled as multipolygon relations are not assembled in this pass. Lines may continue outside the bounding box in GeoJSON; the preview clips them. Footpaths include sidewalks and crossings. Access, one-way and other original way tags are preserved, but no routing graph or access validation was built. Do not assume every displayed path is publicly walkable or road drivable.

## License / reuse

Map data © OpenStreetMap contributors, under ODbL 1.0:
https://www.openstreetmap.org/copyright
https://opendatacommons.org/licenses/odbl/1-0/

Commercial use and custom styling are permitted, but this is **not public-domain or unrestricted data**. Credit OSM and identify its license when publishing maps. Public use/distribution of derivative databases carries ODbL share-alike / availability obligations. Rendered images may have their own license, subject to the underlying data requirements:
https://osmfoundation.org/wiki/Licence/Community_Guidelines/Produced_Work_-_Guideline

No OSM tile service is required to use these local files. No application code or backgrounds were changed.

## Reproduce

From apps/mobile-mvp: `node scripts/render-columbus-map.mjs`

Overpass query:
```
[out:json][timeout:60];
(
way[highway](39.929,-83.064,39.989,-82.977);
way[waterway=river](39.929,-83.064,39.989,-82.977);
way[natural=water](39.929,-83.064,39.989,-82.977);
way[leisure=park](39.929,-83.064,39.989,-82.977);
nwr[place][name](39.929,-83.064,39.989,-82.977);
);
out geom;
```

Neighborhood/name reference: https://www.franklincountyengineer.org/Assets/FranklinEngineer/pdf/Map-files/DowntownMap.pdf
Civic Center reference: https://www.columbus.gov/files/sharedassets/city/v/1/building-and-zoning/bzs-boards-and-commissions/planning-document-library/columbus-1908-plan_compressed.pdf
