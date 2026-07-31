"""Asset Lab 05G — build the CORRECTED HERO Electric + export LOD0/1/2 + collision GLBs (ADDITIVE).

Exports to public/assets/studio/characters/ under DISTINCT filenames (electric_hero_05g*.glb) so the
05F hero GLBs (electric_hero_05f*.glb) and the 05E Electric GLBs (Char_Electric_Heavy*.glb) are never
overwritten. Runs the same character validation gate (face -Y, 65 joints, height, grounded, no stray
island) + records a manifest (manifests/hero-05g.json).

  blender --background --factory-startup --python blender/build_hero_export_05g.py
"""
import sys, json
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from studio_pipeline import config, core, rig, character_hero_05g, exporter, lod
from studio_pipeline.charvalidate import validate

OUT = config.STUDIO_OUT / "characters"
OUT.mkdir(parents=True, exist_ok=True)
STEM = "electric_hero_05g"

core.reset_scene()
arm = rig.load_canonical_rig(keep_actions=False)   # identity armature, no pi hack
obj = character_hero_05g.build_hero(arm, tag="ElectricHero05G")
ok, issues, stats = validate(obj)

lods = lod.generate_lods(obj, ratios=[1.0, 0.55, 0.30])
col = lod.collision_proxy(lods[0], "character")
exporter.export_glb(OUT / f"{STEM}.glb", [arm, lods[0]], with_animations=False)
exporter.export_glb(OUT / f"{STEM}_LOD1.glb", [arm, lods[1]], with_animations=False)
exporter.export_glb(OUT / f"{STEM}_LOD2.glb", [arm, lods[2]], with_animations=False)
exporter.export_glb(OUT / f"{STEM}_COL.glb", [col])

manifest = {
    "tool": "build_hero_export_05g", "milestone": "asset-lab-05g", "role": "ElectricHero",
    "note": "additive 05G surgical-correction hero; 05F + 05E GLBs untouched.",
    "ok": ok, "issues": issues, **stats,
    "lod0_tris": core.triangle_count(lods[0]),
    "lod1_tris": core.triangle_count(lods[1]),
    "lod2_tris": core.triangle_count(lods[2]),
    "files": [f"assets/studio/characters/{STEM}.glb", f"assets/studio/characters/{STEM}_LOD1.glb",
              f"assets/studio/characters/{STEM}_LOD2.glb", f"assets/studio/characters/{STEM}_COL.glb"],
}
config.MANIFESTS.mkdir(parents=True, exist_ok=True)
(config.MANIFESTS / "hero-05g.json").write_text(json.dumps(manifest, indent=2) + "\n")

print(f"  {STEM:26s} tris={stats['tris']:5d} h={stats['height']} isl={stats['islands']} "
      f"LOD {manifest['lod0_tris']}/{manifest['lod1_tris']}/{manifest['lod2_tris']} "
      f"{'OK' if ok else 'FAIL ' + str(issues)}")
if not ok:
    print("HERO_VALIDATION_FAILED")
    sys.exit(1)
print("HERO_EXPORT_OK")
