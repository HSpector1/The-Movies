"""Asset Lab 05 build orchestrator — the production factory, one headless command.

  blender --background --factory-startup --python blender/build_all.py -- [--only all|characters|architecture|props] [--no-render]

For every asset it: builds geometry -> generates LOD0/1/2 + a collision proxy -> exports a
self-contained GLB (+ _COL.glb) -> validates structurally -> renders a thumbnail. Finally it
writes manifests/studio-assets.json (+ public/studio-assets.json). Deterministic: seeded only.
"""
import sys, os, json, math
from pathlib import Path

BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from studio_pipeline import config, core, rig, character, architecture, props, lod, validate, exporter, render

ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ONLY = "all"
RENDER = True
for i, a in enumerate(ARGV):
    if a == "--only" and i + 1 < len(ARGV):
        ONLY = ARGV[i + 1]
    if a == "--no-render":
        RENDER = False

STUDIO = config.STUDIO_OUT
THUMBS = config.PROOF / "thumbnails"
STUDIO.mkdir(parents=True, exist_ok=True)
THUMBS.mkdir(parents=True, exist_ok=True)

MANIFEST = {"tool": "build_all", "scale": {"unit": "meter", "adultHeight": config.ADULT_HEIGHT_M},
            "rig": {"armature": config.RIG_ARMATURE_OBJ, "bones": config.RIG_BONE_COUNT,
                    "clips_source": "assets/animation/UAL1_Standard.glb", "clip_count": 43},
            "families": {}, "assets": [], "validation": {"pass": 0, "fail": 0}}


def _rel(p):
    return "assets/studio/" + str(Path(p).relative_to(STUDIO)).replace(os.sep, "/")


def _thumb(objs, name):
    if not RENDER:
        return None
    targets = {o.name for o in objs}
    hidden = []
    for o in bpy.data.objects:                        # isolate the asset (others overlap at origin)
        if o.type == "MESH" and o.name not in targets and not o.name.startswith("Ground") and not o.hide_render:
            o.hide_render = True
            hidden.append(o)
    cam = bpy.context.scene.camera or render.camera((3, -4, 2), (0, 0, 1))
    render.frame_objects([o for o in objs if o.type == "MESH"], cam, margin=1.25)
    out = THUMBS / f"{name}.png"
    render.render_to(out)
    for o in hidden:
        o.hide_render = False
    return "proof/lab05/thumbnails/" + out.name


def _setup_render_scene():
    render.warm_world(strength=0.5)
    render.sun(strength=2.6)
    render.fill(strength=0.5)
    render.ground(size=60)
    render.setup(engine="BLENDER_EEVEE", res=(512, 512), samples=24)
    render.set_look(bpy.context.scene, exposure=-0.5)   # keep region colours readable
    render.camera((3, -4, 2), (0, 0, 1))


def _process(primary, cls, family, role, tri_budget, expect_bones=False, extra=None, arm=None):
    """LOD + collision + export + validate for one asset. `primary` is the LOD0 mesh object."""
    base = primary.name
    lods = lod.generate_lods(primary)
    lod0 = lods[0]
    col = lod.collision_proxy(lod0, "character" if expect_bones else (cls))
    # export: LOD0 (+ armature for characters) and the collision proxy
    fam_dir = STUDIO / family
    fam_dir.mkdir(parents=True, exist_ok=True)
    stem = base.replace(config.LOD_SUFFIX[0], "")
    export_objs = ([arm] if arm else []) + [lod0]
    glb = exporter.export_glb(fam_dir / f"{stem}.glb", export_objs, with_animations=False)
    col_glb = exporter.export_glb(fam_dir / f"{stem}_COL.glb", [col])
    # Ship LOD1/LOD2 as real GLBs too (skinned tiers carry the SAME 65 bone-named groups, so one
    # animation instance drives any tier). The manifest must never advertise geometry not on disk.
    lod_rec = {"lod0_tris": core.triangle_count(lods[0])}
    for tier in (1, 2):
        if tier in lods:
            lf = exporter.export_glb(fam_dir / f"{stem}{config.LOD_SUFFIX[tier]}.glb",
                                     ([arm] if arm else []) + [lods[tier]], with_animations=False)
            lod_rec[f"lod{tier}_tris"] = core.triangle_count(lods[tier])
            lod_rec[f"lod{tier}_file"] = _rel(lf)
    rec = validate.check_asset(lod0, cls, tri_budget=tri_budget, expect_bones=expect_bones)
    rec.update({
        "id": f"studio/{family}/{stem}", "family": family, "role": role,
        "file": _rel(glb), "thumbnail": _thumb(export_objs, stem),
        "lod": lod_rec,
        "collision": {"file": _rel(col_glb), "tris": core.triangle_count(col),
                      "shape": "capsule" if expect_bones else ("box" if cls in config.COLLISION_BOX_CLASSES else "convex")},
        "provenance": config.PROVENANCE,
    })
    if extra:
        rec.update(extra)
    MANIFEST["assets"].append(rec)
    MANIFEST["validation"]["pass" if rec["ok"] else "fail"] += 1
    print(f"  {stem:34s} tris={rec['tris']:5d} lod=({rec['lod']['lod1_tris']},{rec['lod']['lod2_tris']}) col={rec['collision']['tris']} {'OK' if rec['ok'] else 'FAIL '+str(rec['issues'])}")
    return rec


def do_characters():
    print("[characters]")
    n = 0
    for role in character.ROLES:
        core.reset_scene()
        _setup_render_scene()
        arm = rig.load_canonical_rig(keep_actions=False)
        body = character.build_character(role, arm, seed=n + 1)
        arm.rotation_euler = (0, 0, math.pi)     # face -Y (toward the standard camera)
        _process(body, "character", "characters", role,
                 config.TRI_BUDGET["character_lod0"], expect_bones=True, arm=arm,
                 extra={"attach": None})
        n += 1
    MANIFEST["families"]["characters"] = n


def do_architecture():
    print("[architecture]")
    core.reset_scene()
    _setup_render_scene()
    mats, maps = architecture.kit_materials()
    builders = [
        ("stage_wall", lambda: architecture.stage_wall(mats, maps), config.TRI_BUDGET["architecture_module"], "architecture_module"),
        ("elephant_door", lambda: architecture.elephant_door(mats), 600, "architecture_module"),
        ("barrel_roof", lambda: architecture.barrel_roof(mats), config.TRI_BUDGET["architecture_module"], "architecture_module"),
        ("stage_corner", lambda: architecture.stage_corner(mats), config.TRI_BUDGET["architecture_module"], "architecture_module"),
        ("ground_tile", lambda: architecture.ground_tile(mats), 100, "architecture_ground"),
        ("boundary_wall", lambda: architecture.boundary_wall(mats), config.TRI_BUDGET["architecture_module"], "architecture_module"),
        ("marquee_gate", lambda: architecture.marquee_gate(mats), 800, "architecture_module"),
        ("water_tower", lambda: architecture.water_tower(mats), 1200, "architecture_landmark"),
    ]
    for role, fn, budget, cls in builders:
        obj = fn()
        _process(obj, cls, "architecture", role, budget)
    MANIFEST["families"]["architecture"] = len(builders)


def do_props():
    print("[props]")
    core.reset_scene()
    _setup_render_scene()
    lib = __import__("studio_pipeline.materials", fromlist=["library"]).library()
    items = props.build_all_props()
    for obj in items:
        attach = obj.get("studio_attach", None)
        _process(obj, "prop", "props", obj.get("studio_role", "prop"),
                 config.TRI_BUDGET["prop"], extra={"attach": attach})
    MANIFEST["families"]["props"] = len(items)


if ONLY in ("all", "characters"):
    do_characters()
if ONLY in ("all", "architecture"):
    do_architecture()
if ONLY in ("all", "props"):
    do_props()

MANIFEST["counts"] = {"assets": len(MANIFEST["assets"]),
                      "reusable": len(MANIFEST["assets"]),  # 100% original / owner-owned
                      "families": MANIFEST["families"]}
config.MANIFESTS.mkdir(parents=True, exist_ok=True)
(config.MANIFESTS / "studio-assets.json").write_text(json.dumps(MANIFEST, indent=2) + "\n")
(config.ROOT / "public" / "studio-assets.json").write_text(json.dumps(MANIFEST, indent=2) + "\n")
print(f"\nSTUDIO BUILD: {len(MANIFEST['assets'])} assets, "
      f"validation {MANIFEST['validation']['pass']} pass / {MANIFEST['validation']['fail']} fail")
print("wrote manifests/studio-assets.json + public/studio-assets.json")
print("BUILD_ALL_OK")
