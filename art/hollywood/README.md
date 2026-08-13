# Hollywood district source

- `source/moonshot-studio-chronicle-concept.png` is the immutable Phase I visual north star.
- `district-manifest.source.json` owns semantic layers, interaction polygons, anchors, routes,
  affordances, and activity definitions.
- Runtime output is committed under `ui/public/lot/hollywood/` so production builds do not need
  Pillow. Regenerate with:

```bash
python3 tools/hollywood/export_district.py \
  --source art/hollywood/source/moonshot-studio-chronicle-concept.png \
  --manifest art/hollywood/district-manifest.source.json \
  --output ui/public/lot/hollywood
```
