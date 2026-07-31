"""Asset Lab 05G — render the CORRECTED HERO (05G) solo + a side-by-side vs the accepted 05F hero.

  blender --background --factory-startup --python blender/build_hero_05g.py -- [OUTDIR] [--region R] [--res N]

Regions (fast iteration): shoulder | vest | pelvis | poses | all (default all).
Left column of every side-by-side is the ACCEPTED 05F hero (character_hero.build_hero); the right is
the 05G surgical correction (character_hero_05g.build_hero). Same neutral review lighting as the 05E/05F
character reviews (mid-grey world, AgX, slightly under-exposed) so the before/after read is honest and
neither character is favoured.
"""
import sys
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from mathutils import Vector
from studio_pipeline import config, core, rig, character_hero, character_hero_05g, render, anim

ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
REGION = "all"
RES = 768
positional = []
i = 0
while i < len(ARGV):
    a = ARGV[i]
    if a == "--region":
        i += 1; REGION = ARGV[i]
    elif a == "--res":
        i += 1; RES = int(ARGV[i])
    else:
        positional.append(a)
    i += 1
OUT = Path(positional[0]) if positional else (config.ROOT / "proof" / "lab05g" / "iteration-01")
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


SIX = [("Idle_Loop", 24, "idle"), ("Walk_Loop", 8, "walk"), ("Idle_Talking_Loop", 30, "talk"),
       ("Sitting_Idle_Loop", 30, "sit"), ("PickUp_Table", 20, "pickup"), ("Fixing_Kneeling", 40, "kneel")]

# region -> which solo close-ups + which side-by-side cmp views + which posed clips to render
REGIONS = {
    "shoulder": dict(solo=["shoulder", "front", "back", "3q"], cmp=["shoulder-front", "shoulder-back",
                     "shoulder-side", "front", "back", "3q"], poses=["pickup", "kneel"]),
    "vest":     dict(solo=["vest", "front", "back", "3q"], cmp=["vest-front", "vest-back", "vest-side",
                     "front", "back", "3q"], poses=["kneel", "sit"]),
    "pelvis":   dict(solo=["pelvis-front", "pelvis-back", "pelvis-side", "lowerbody", "back", "3q-rear"],
                     cmp=["pelvis-front", "pelvis-back", "pelvis-side", "lowerbody", "back", "3q-rear"],
                     poses=["walk", "kneel", "sit", "pickup"]),
    "poses":    dict(solo=["front"], cmp=["front"], poses=["idle", "walk", "talk", "sit", "pickup", "kneel"]),
    "all":      dict(solo="ALL", cmp="ALL", poses=["idle", "walk", "talk", "sit", "pickup", "kneel"]),
}
R = REGIONS.get(REGION, REGIONS["all"])

# ============================================================ 1) 05G SOLO (grid + region close-ups + poses)
sc = scene()
sc.render.resolution_x = sc.render.resolution_y = RES
arm = rig.load_canonical_rig(keep_actions=True)
hero = character_hero_05g.build_hero(arm, tag="ElectricHero05G")
tris = core.triangle_count(hero)
mn, mx, size = core.world_bounds([hero])
print(f"[05G] tris={tris}  height={size.z:.3f}m  bounds X={size.x:.2f} Y={size.y:.2f}")

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


# solo close-up catalogue
SOLO = {
    "front": (("front", (0, -1, 0)),),
    "back": (("back", (0, 1, 0)),),
    "left": (("left", (-1, 0, 0)),),
    "right": (("right", (1, 0, 0)),),
    "3q": (("3q", (-0.8, -1, 0)),),
    "3q-rear": (("3q-rear", (0.8, 1, 0)),),
    "shoulder": (("shoulder", (-0.55, -1, 0.18), dict(tgt=(0.17, 0, 1.42), dist=0.9)),
                 ("shoulder-back", (0.5, 1, 0.18), dict(tgt=(0.17, 0, 1.42), dist=0.9)),
                 ("shoulder-side", (-1, -0.1, 0.12), dict(tgt=(0.17, 0, 1.42), dist=0.9))),
    "vest": (("vest-front", (0, -1, 0.05), dict(tgt=(0, 0, 1.2), dist=1.6)),
             ("vest-side", (-1, -0.15, 0.05), dict(tgt=(0, 0, 1.2), dist=1.6)),
             ("vest-back", (0, 1, 0.05), dict(tgt=(0, 0, 1.2), dist=1.6))),
    "pelvis-front": (("pelvis-front", (0, -1, 0.05), dict(tgt=(0, 0, 0.62), dist=1.7)),),
    "pelvis-back": (("pelvis-back", (0, 1, 0.05), dict(tgt=(0, 0, 0.62), dist=1.7)),),
    "pelvis-side": (("pelvis-side", (-1, -0.15, 0.05), dict(tgt=(0, 0, 0.62), dist=1.7)),),
    "lowerbody": (("lowerbody", (0, -1, 0.12), dict(tgt=(0, 0, 0.5), dist=1.9)),),
    "face": (("face", (0, -1, 0.03), dict(tgt=(0, 0, size.z * 0.92), dist=0.7)),),
}
ALL_SOLO = ["front", "back", "left", "right", "3q", "3q-rear", "shoulder", "vest",
            "pelvis-front", "pelvis-back", "pelvis-side", "lowerbody", "face"]
solo_keys = ALL_SOLO if R["solo"] == "ALL" else R["solo"]
for key in solo_keys:
    for entry in SOLO.get(key, ()):
        nm, dirv = entry[0], entry[1]
        kw = entry[2] if len(entry) > 2 else {}
        shoot(f"05g-{nm}", dirv, **kw)

# posed under the required clips (deformation check on 05G solo)
POSE_WANT = set(R["poses"])
for action, frame, tagn in SIX:
    if tagn in POSE_WANT and bpy.data.actions.get(action):
        anim.apply_action(arm, action); sc.frame_set(int(frame)); bpy.context.view_layer.update()
        zmin, zmax = eval_minmax_z(hero)
        print(f"  [{tagn}] deformed z-range {zmin:+.3f}..{zmax:+.3f}")
        shoot(f"05g-pose-{tagn}-front", (0, -1, 0))
        shoot(f"05g-pose-{tagn}-3q", (-0.8, -1, 0.14))
        if tagn in ("kneel", "pickup", "sit", "walk"):
            shoot(f"05g-pose-{tagn}-3q-rear", (0.7, 1, 0.14))


# ============================================================ 2) SIDE-BY-SIDE  05F (left) | 05G (right)
sc = scene()
sc.render.resolution_x, sc.render.resolution_y = int(RES * 1.6), int(RES * 1.02)
base = rig.load_canonical_rig(keep_actions=True)
a_5f = dup_rig(base); a_5g = dup_rig(base)
old = character_hero.build_hero(a_5f, tag="ElectricHero05Fcmp")        # accepted 05F (left)
new = character_hero_05g.build_hero(a_5g, tag="ElectricHero05Gcmp")     # 05G correction (right)
a_5f.location.x = -0.50; a_5g.location.x = 0.50
bpy.context.view_layer.update()
cc = Vector((0, 0, 0.95)); CD = 3.0
cam = render.camera((0, -CD, cc.z), cc, lens=50)


def cmp_shot(name, dirv, elev=0.08, tgt=(0, 0, 0.95), dist=CD, frame=None, action=None):
    if action:
        for a in (a_5f, a_5g):
            anim.apply_action(a, action)
        sc.frame_set(int(frame)); bpy.context.view_layer.update()
    ctr = Vector(tgt); d = Vector(dirv).normalized()
    cam.location = ctr + d * dist + Vector((0, 0, elev * dist))
    cam.rotation_euler = (ctr - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = str(OUT / f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("  cmp", name, "(05F left | 05G right)")


CMP = {
    "front": (("cmp-front", (0, -1, 0)),),
    "back": (("cmp-back", (0, 1, 0)),),
    "3q": (("cmp-3q", (-0.7, -1, 0.06)),),
    "3q-rear": (("cmp-3q-rear", (0.7, 1, 0.10)),),
    "shoulder-front": (("cmp-shoulder-front", (0, -1, 0.10), dict(tgt=(0, 0, 1.42), dist=2.4)),),
    "shoulder-back": (("cmp-shoulder-back", (0, 1, 0.10), dict(tgt=(0, 0, 1.42), dist=2.4)),),
    "shoulder-side": (("cmp-shoulder-side", (-1, -0.12, 0.08), dict(tgt=(0, 0, 1.42), dist=2.6)),),
    "vest-front": (("cmp-vest-front", (0, -1, 0.04), dict(tgt=(0, 0, 1.2), dist=2.4)),),
    "vest-back": (("cmp-vest-back", (0, 1, 0.04), dict(tgt=(0, 0, 1.2), dist=2.4)),),
    "vest-side": (("cmp-vest-side", (-1, -0.12, 0.04), dict(tgt=(0, 0, 1.2), dist=2.6)),),
    "pelvis-front": (("cmp-pelvis-front", (0, -1, 0.03), dict(tgt=(0, 0, 0.66), dist=2.6)),),
    "pelvis-back": (("cmp-pelvis-back", (0, 1, 0.03), dict(tgt=(0, 0, 0.66), dist=2.6)),),
    "pelvis-side": (("cmp-pelvis-side", (-1, -0.12, 0.03), dict(tgt=(0, 0, 0.66), dist=2.8)),),
    "lowerbody": (("cmp-lowerbody", (0, -1, 0.1), dict(tgt=(0, 0, 0.55), dist=2.9)),),
}
ALL_CMP = ["front", "back", "3q", "3q-rear", "shoulder-front", "shoulder-back", "shoulder-side",
           "vest-front", "vest-back", "vest-side", "pelvis-front", "pelvis-back", "pelvis-side", "lowerbody"]
cmp_keys = ALL_CMP if R["cmp"] == "ALL" else R["cmp"]
for key in cmp_keys:
    for entry in CMP.get(key, ()):
        nm, dirv = entry[0], entry[1]
        kw = entry[2] if len(entry) > 2 else {}
        cmp_shot(nm, dirv, **kw)

# posed side-by-side comparisons (deformation of both, identical clip/frame)
POSE_CMP = {"walk": ("Walk_Loop", 8, (-0.7, -1, 0.10), (0, 0, 0.95), 3.0),
            "kneel": ("Fixing_Kneeling", 40, (-0.7, -1, 0.14), (0, 0, 0.7), 3.0),
            "sit": ("Sitting_Idle_Loop", 30, (-0.7, -1, 0.12), (0, 0, 0.7), 3.2),
            "pickup": ("PickUp_Table", 20, (-0.7, -1, 0.12), (0, 0, 0.85), 3.0),
            "talk": ("Idle_Talking_Loop", 30, (-0.5, -1, 0.08), (0, 0, 0.95), 3.0)}
for tagn in R["poses"]:
    if tagn in POSE_CMP:
        action, frame, dirv, tgt, dist = POSE_CMP[tagn]
        if bpy.data.actions.get(action):
            cmp_shot(f"cmp-{tagn}-3q", dirv, tgt=tgt, dist=dist, frame=frame, action=action)

print("HERO_05G_BUILD_OK")
