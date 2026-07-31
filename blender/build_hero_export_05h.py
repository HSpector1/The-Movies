"""Asset Lab 05H — build the AUTHORED-BASE hero + export LOD0/1/2 + collision GLBs (ADDITIVE).

Distinct filenames (electric_hero_05h*.glb) so 05E/05F/05G GLBs are never touched. Validates
65 joints, face -Y, height, grounded, no stray island. Records manifests/hero-05h.json.

  blender --background --factory-startup --python blender/build_hero_export_05h.py -- [raiseDeg]
"""
import sys, json
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))
import bpy
from studio_pipeline import config, core, rig, authored05h, exporter, lod

argv = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
RAISE = float(argv[0]) if argv else 86.0
OUT = config.STUDIO_OUT / "characters"; OUT.mkdir(parents=True, exist_ok=True)
STEM = "electric_hero_05h"


def validate_05h(obj, arm):
    issues = []
    mn, mx, size = core.world_bounds([obj])
    if len(arm.data.bones) != config.RIG_BONE_COUNT:
        issues.append(f"bone count {len(arm.data.bones)} != {config.RIG_BONE_COUNT}")
    if not (1.70 <= size.z <= 1.95):
        issues.append(f"height {size.z:.3f} out of [1.70,1.95]")
    if mn.z < -0.06 or mn.z > 0.15:
        issues.append(f"feet-not-grounded (min z={mn.z:.3f})")
    # face on -Y front: the head-front verts (z>1.55) should average to -Y
    ys = [(obj.matrix_world @ v.co).y for v in obj.data.vertices if (obj.matrix_world @ v.co).z > 1.55]
    if ys and sum(ys)/len(ys) > 0.06:
        issues.append(f"head mean y={sum(ys)/len(ys):.3f} (face not clearly on -Y)")
    # stray islands
    import bmesh
    bm = bmesh.new(); bm.from_mesh(obj.data); bm.verts.ensure_lookup_table()
    seen = set(); small = 0
    for v in bm.verts:
        if v.index in seen: continue
        stack=[v]; seen.add(v.index); cnt=0
        while stack:
            c=stack.pop(); cnt+=1
            for e in c.link_edges:
                o=e.other_vert(c)
                if o.index not in seen: seen.add(o.index); stack.append(o)
        if cnt < 6: small += 1
    bm.free()
    if small: issues.append(f"{small} stray island(s)")
    return (len(issues)==0, issues,
            dict(tris=core.triangle_count(obj), height=round(size.z,3)))


core.reset_scene()
arm = rig.load_canonical_rig(keep_actions=False)
obj = authored05h.build_authored_base(arm, raise_deg=RAISE)
ok, issues, stats = validate_05h(obj, arm)

lods = lod.generate_lods(obj, ratios=[1.0, 0.4, 0.18])
col = lod.collision_proxy(lods[0], "character")
exporter.export_glb(OUT / f"{STEM}.glb", [arm, lods[0]], with_animations=False)
exporter.export_glb(OUT / f"{STEM}_LOD1.glb", [arm, lods[1]], with_animations=False)
exporter.export_glb(OUT / f"{STEM}_LOD2.glb", [arm, lods[2]], with_animations=False)
exporter.export_glb(OUT / f"{STEM}_COL.glb", [col])

manifest = {
    "tool": "build_hero_export_05h", "milestone": "asset-lab-05h", "role": "ElectricHero05H",
    "workflow": "Path A — CC0 authored base (Blender Studio Human Base Meshes v1.0.0, CC0 1.0)",
    "base_asset": "GEO-body_male_stylized", "note": "additive authored-base hero; 05E/05F/05G untouched.",
    "ok": ok, "issues": issues, **stats,
    "lod0_tris": core.triangle_count(lods[0]), "lod1_tris": core.triangle_count(lods[1]),
    "lod2_tris": core.triangle_count(lods[2]), "bones": len(arm.data.bones),
    "files": [f"assets/studio/characters/{STEM}.glb", f"assets/studio/characters/{STEM}_LOD1.glb",
              f"assets/studio/characters/{STEM}_LOD2.glb", f"assets/studio/characters/{STEM}_COL.glb"],
}
config.MANIFESTS.mkdir(parents=True, exist_ok=True)
(config.MANIFESTS / "hero-05h.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"  {STEM} tris={stats['tris']} h={stats['height']} bones={len(arm.data.bones)} "
      f"LOD {manifest['lod0_tris']}/{manifest['lod1_tris']}/{manifest['lod2_tris']} "
      f"{'OK' if ok else 'FAIL '+str(issues)}")
print("HERO05H_EXPORT_OK" if ok else "HERO05H_VALIDATION_FAILED")
