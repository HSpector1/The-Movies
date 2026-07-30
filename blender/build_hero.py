"""Asset Lab 05F — render the HERO Electric character + a side-by-side vs the 05E Electric.

  blender --background --factory-startup --python blender/build_hero.py -- [OUTDIR]

Neutral review lighting (same honest look as the 05E character review: mid-grey world, AgX, slightly
under-exposed — no overexposure, no distance-hiding). The 05E Electric is built from the UNCHANGED
character2 pipeline so the comparison is fair.
"""
import sys
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from mathutils import Vector
from studio_pipeline import config, core, rig, character2, character_hero, render, anim

ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = Path(ARGV[0]) if ARGV else (config.ROOT / "proof" / "lab05f" / "iteration-01")
OUT.mkdir(parents=True, exist_ok=True)


def scene():
    core.reset_scene()
    render.neutral_world(strength=0.6)
    render.sun(strength=2.1)
    render.fill(strength=0.5)
    render.rim(strength=1.3)
    render.backdrop()
    render.ground(size=40, color=(0.42, 0.43, 0.46))
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.image_settings.file_format = "PNG"
    render.set_look(sc, exposure=-0.55)
    return sc


def dup_rig(base):
    a = base.copy(); a.data = base.data.copy()
    bpy.context.scene.collection.objects.link(a)
    return a


def eval_minmax_z(o):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = o.evaluated_get(dg); me = ev.to_mesh()
    zs = [(o.matrix_world @ v.co).z for v in me.vertices]
    ev.to_mesh_clear()
    return (min(zs), max(zs)) if zs else (0, 0)


# ============================================================ 1) HERO SOLO (base grid + 6 poses)
sc = scene()
sc.render.resolution_x = sc.render.resolution_y = 768
arm = rig.load_canonical_rig(keep_actions=True)
hero = character_hero.build_hero(arm, tag="ElectricHero")
tris = core.triangle_count(hero)
mn, mx, size = core.world_bounds([hero])
print(f"[hero] tris={tris}  height={size.z:.3f}m  bounds X={size.x:.2f} Y={size.y:.2f}")

center = Vector((0, 0, 0.92)); DIST = 4.6
cam = render.camera((0, -DIST, center.z), center, lens=50)


def shoot(name, dirv, elev=0.10, tgt=None, dist=DIST):
    ctr = center if tgt is None else Vector(tgt)
    d = Vector(dirv).normalized()
    cam.location = ctr + d * dist + Vector((0, 0, elev * dist))
    cam.rotation_euler = (ctr - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = str(OUT / f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("  shot", name)


shoot("hero-front", (0, -1, 0)); shoot("hero-back", (0, 1, 0))
shoot("hero-left", (-1, 0, 0)); shoot("hero-right", (1, 0, 0))
shoot("hero-3q", (-0.8, -1, 0)); shoot("hero-3q-rear", (0.8, 1, 0))
# region close-ups
shoot("hero-pelvis-front", (0, -1, 0.05), tgt=(0, 0, 0.62), dist=1.7)
shoot("hero-pelvis-back", (0, 1, 0.05), tgt=(0, 0, 0.62), dist=1.7)
shoot("hero-pelvis-side", (-1, -0.15, 0.05), tgt=(0, 0, 0.62), dist=1.7)
shoot("hero-lowerbody", (0, -1, 0.12), tgt=(0, 0, 0.5), dist=1.9)
shoot("hero-face", (0, -1, 0.03), tgt=(0, 0, size.z * 0.92), dist=0.7)

# posed under the six required clips
SIX = [("Idle_Loop", 24, "idle"), ("Walk_Loop", 8, "walk"), ("Idle_Talking_Loop", 30, "talk"),
       ("Sitting_Idle_Loop", 30, "sit"), ("PickUp_Table", 20, "pickup"), ("Fixing_Kneeling", 40, "kneel")]
for action, frame, tagn in SIX:
    if bpy.data.actions.get(action):
        anim.apply_action(arm, action); sc.frame_set(int(frame)); bpy.context.view_layer.update()
        zmin, zmax = eval_minmax_z(hero)
        print(f"  [{tagn}] deformed z-range {zmin:+.3f}..{zmax:+.3f}")
        shoot(f"hero-pose-{tagn}-front", (0, -1, 0))
        shoot(f"hero-pose-{tagn}-3q", (-0.8, -1, 0.14))
        shoot(f"hero-pose-{tagn}-3q-rear", (0.7, 1, 0.14))


# ============================================================ 2) SIDE-BY-SIDE 05E Electric vs 05F hero
sc = scene()
sc.render.resolution_x, sc.render.resolution_y = 1200, 760
base = rig.load_canonical_rig(keep_actions=True)
a_old = dup_rig(base); a_new = dup_rig(base)
old = character2.build_character2("Electric", a_old, seed=1)   # UNCHANGED 05E pipeline
new = character_hero.build_hero(a_new, tag="ElectricHeroCmp")
a_old.location.x = -0.46; a_new.location.x = 0.46
bpy.context.view_layer.update()
cc = Vector((0, 0, 0.95)); CD = 3.0
cam = render.camera((0, -CD, cc.z), cc, lens=50)


def cmp_shot(name, dirv, elev=0.08, tgt=(0, 0, 0.95), dist=CD, frame=None, action=None):
    if action:
        for a in (a_old, a_new):
            anim.apply_action(a, action)
        sc.frame_set(int(frame)); bpy.context.view_layer.update()
    ctr = Vector(tgt); d = Vector(dirv).normalized()
    cam.location = ctr + d * dist + Vector((0, 0, elev * dist))
    cam.rotation_euler = (ctr - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = str(OUT / f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("  cmp", name, "(05E left | 05F right)")


cmp_shot("cmp-front", (0, -1, 0))
cmp_shot("cmp-back", (0, 1, 0))
cmp_shot("cmp-3q", (-0.7, -1, 0.06))
cmp_shot("cmp-pelvis-front", (0, -1, 0.03), tgt=(0, 0, 0.66), dist=2.6)
cmp_shot("cmp-pelvis-back", (0, 1, 0.03), tgt=(0, 0, 0.66), dist=2.6)
cmp_shot("cmp-lowerbody", (0, -1, 0.1), tgt=(0, 0, 0.55), dist=2.9)
cmp_shot("cmp-kneel-3q", (-0.7, -1, 0.14), tgt=(0, 0, 0.7), dist=3.0, frame=40, action="Fixing_Kneeling")
cmp_shot("cmp-sit-3q", (-0.7, -1, 0.12), tgt=(0, 0, 0.7), dist=3.2, frame=30, action="Sitting_Idle_Loop")

print("HERO_BUILD_OK")
