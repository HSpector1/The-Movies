"""Asset Lab 05B iteration 3 — role variants, skin tones, outfit palettes, headwear lineups.

Builds multiple characters in ONE scene by duplicating the armature (rig imported once), poses
them to a natural idle, and renders side-by-side proof sheets. Skin tone is assigned per-instance
(deterministic, NOT tied to job).

  blender --background --factory-startup --python blender/build_roles.py -- [OUTDIR]
"""
import sys
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from mathutils import Vector
from studio_pipeline import config, core, rig, character2, render, anim

ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = Path(ARGV[0]) if ARGV else (config.ROOT / "proof" / "lab05b" / "iteration-03")
OUT.mkdir(parents=True, exist_ok=True)
SPACING = 0.98


def setup_scene():
    core.reset_scene()
    render.warm_world(strength=0.55)
    render.sun(strength=2.6)
    render.fill(strength=0.6)
    render.ground(size=40)
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y = 1680, 760
    sc.render.image_settings.file_format = "PNG"
    render.set_look(sc, exposure=-0.35)
    return sc


def dup_arm(base):
    a = base.copy(); a.data = base.data.copy()
    bpy.context.scene.collection.objects.link(a)
    return a


def render_lineup(items, stem, pose_action="Idle_Loop", pose_frame=22, threeq=False):
    sc = setup_scene()
    base = rig.load_canonical_rig(keep_actions=True)
    n = len(items)
    tris = 0
    for i, it in enumerate(items):
        a = dup_arm(base)
        obj = character2.build_character2(it["role"], a, seed=i + 1,
                                          overrides=it.get("overrides"), tag=it.get("tag", f"{stem}{i}"))
        tris += core.triangle_count(obj)
        if bpy.data.actions.get(pose_action):
            anim.apply_action(a, pose_action)
        a.location.x = (i - (n - 1) / 2) * SPACING
    if bpy.data.actions.get(pose_action):
        sc.frame_set(pose_frame)
    bpy.context.view_layer.update()

    width = n * SPACING
    dist = max(width * 1.55, 6.5)
    cam = render.camera((0, -dist, 1.0), (0, 0, 0.95), lens=50)

    def shoot(name, camloc, target):
        cam.location = Vector(camloc)
        cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = str(OUT / name)
        bpy.ops.render.render(write_still=True)
        print("  shot", name)

    shoot(f"{stem}-front.png", (0, -dist, 1.0), (0, 0, 0.95))
    if threeq:
        shoot(f"{stem}-3q.png", (-dist * 0.5, -dist * 0.82, 1.35), (0, 0, 0.9))
    print(f"  [{stem}] {n} chars, {tris} tris total ({tris // n} avg)")


# 1) required + extra role lineup (PA, Grip, Electric, Maintenance, Office)
render_lineup([dict(role=r) for r in ("PA", "Grip", "Electric", "Maintenance", "Office")],
              "roles", threeq=True)

# 2) all eight roles
render_lineup([dict(role=r) for r in
               ("PA", "Grip", "Electric", "Maintenance", "Office", "CameraDP", "Director", "Carpenter")],
              "allroles")

# 3) five skin tones (role PA) — deterministic, NOT tied to job
TONES = [(0.94, 0.82, 0.70), (0.86, 0.66, 0.53), (0.74, 0.52, 0.40), (0.58, 0.40, 0.29), (0.43, 0.29, 0.21)]
render_lineup([dict(role="PA", overrides={"skin": TONES[i]}, tag=f"skin{i}") for i in range(5)], "skintones")

# 4) five outfit palettes (silhouette held constant on Grip)
COMBOS = [
    {"shirt": "work_shirt_blue", "trousers": "trousers_grey"},
    {"shirt": "work_shirt_tan",  "trousers": "trousers_brown"},
    {"shirt": (0.30, 0.46, 0.34), "trousers": "trousers_grey"},     # forest green
    {"shirt": (0.50, 0.22, 0.24), "trousers": (0.20, 0.20, 0.23)},  # maroon / charcoal
    {"shirt": (0.22, 0.42, 0.47), "trousers": "trousers_brown"},    # teal
]
render_lineup([dict(role="Grip", overrides=COMBOS[i], tag=f"pal{i}") for i in range(5)], "palettes")

# 5) headwear / hair variety
HW = [
    dict(role="PA", overrides={"hat": None, "hair": "hair_brown"}, tag="hw0"),
    dict(role="PA", overrides={"hat": None, "hair": "hair_grey"},  tag="hw1"),
    dict(role="PA", overrides={"hat": "flatcap", "hat_col": (0.24, 0.24, 0.26)}, tag="hw2"),
    dict(role="PA", overrides={"hat": "softcap", "hat_col": (0.18, 0.24, 0.34)}, tag="hw3"),
    dict(role="PA", overrides={"hat": "hardhat", "hat_col": (0.92, 0.56, 0.08)}, tag="hw4"),
    dict(role="PA", overrides={"hat": "fedora",  "hat_col": (0.26, 0.19, 0.14)}, tag="hw5"),
]
render_lineup(HW, "headwear")

print("ROLES_BUILD_OK")
