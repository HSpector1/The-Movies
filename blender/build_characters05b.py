"""Asset Lab 05B iteration 5 — build ALL crew roles and export corrected GLBs into Scene G,
REPLACING the rejected Lab-05 characters (same filenames so studioSlice.tsx loads them unchanged).

HARD VALIDATION GATE: the build exits non-zero if ANY character's face is not on the -Y front,
a visible body part is disconnected (stray island), the height is wrong, or the feet float — i.e.
the exact defects the owner rejected. The armature is exported at IDENTITY (no (0,0,pi) hack) so
runtime facing is correct.

  blender --background --factory-startup --python blender/build_characters05b.py
"""
import sys, json
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from studio_pipeline import config, core, rig, character2, exporter, lod
from studio_pipeline.charvalidate import validate

OUT = config.STUDIO_OUT / "characters"
OUT.mkdir(parents=True, exist_ok=True)

ROLES = ["PA", "Grip", "Electric", "Maintenance", "Office", "CameraDP", "Director", "Carpenter"]


manifest = {"tool": "build_characters05b", "milestone": "asset-lab-05b",
            "note": "corrected crew; validation gate fails on face-on-back/disconnected/floating.",
            "characters": [], "pass": 0, "fail": 0}
any_fail = False
for role in ROLES:
    core.reset_scene()
    arm = rig.load_canonical_rig(keep_actions=False)   # identity armature, no pi hack
    obj = character2.build_character2(role, arm, seed=1)
    ok, issues, stats = validate(obj)
    size_name = character2.ROLES[role]["size"].capitalize()
    stem = f"Char_{role}_{size_name}"
    lods = lod.generate_lods(obj, ratios=[1.0, 0.6, 0.35])
    col = lod.collision_proxy(lods[0], "character")
    exporter.export_glb(OUT / f"{stem}.glb", [arm, lods[0]], with_animations=False)
    exporter.export_glb(OUT / f"{stem}_LOD1.glb", [arm, lods[1]], with_animations=False)
    exporter.export_glb(OUT / f"{stem}_LOD2.glb", [arm, lods[2]], with_animations=False)
    exporter.export_glb(OUT / f"{stem}_COL.glb", [col])
    manifest["characters"].append(dict(role=role, file=f"assets/studio/characters/{stem}.glb",
                                        ok=ok, issues=issues, **stats,
                                        lod1_tris=core.triangle_count(lods[1]),
                                        lod2_tris=core.triangle_count(lods[2])))
    manifest["pass" if ok else "fail"] += 1
    any_fail = any_fail or not ok
    print(f"  {stem:26s} tris={stats['tris']:5d} h={stats['height']} isl={stats['islands']} "
          f"{'OK' if ok else 'FAIL ' + str(issues)}")

config.MANIFESTS.mkdir(parents=True, exist_ok=True)
(config.MANIFESTS / "characters-05b.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"\nCHAR BUILD: {manifest['pass']} pass / {manifest['fail']} fail -> {OUT}")
if any_fail:
    print("CHAR_VALIDATION_FAILED")
    sys.exit(1)
print("CHARACTERS05B_OK")
