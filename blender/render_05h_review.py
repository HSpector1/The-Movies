"""Asset Lab 05H FINAL OWNER REVIEW — supplementary Blender renders.

Builds the authored base + fitted workwear (same as build_hero_05h_dressed.py) and produces:
  1) a transparent, iso-angle PRE-RENDERED SPRITE of 05H -> public/assets/studio/review/05h_sprite.png
     (the 2.5D "pre-rendered card" alternative the management-camera value test compares against live 3D)
  2) a compact supplementary still set under a SECOND neutral-lighting environment (Blender EEVEE / AgX),
     including a skin-tint ISOLATION test (neutral-white fill vs the cool blue fill) so the known
     "blue tint on upward-facing skin" note can be attributed to lighting vs material with matched evidence.

Run:  node tools/blender-run.mjs blender/render_05h_review.py -- proof/lab05h/final-owner-review/blender-stills
Primary "what ships" evidence is the runtime capture of the exported GLB; this is the second, independent
lighting environment. Isolated, additive, evidence-only — no GLBs are overwritten by this script.
"""
import bpy, sys, math
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))
from studio_pipeline import config, core, rig, render, authored05h
from mathutils import Matrix

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = config.ROOT / (argv[0] if argv else "proof/lab05h/final-owner-review/blender-stills")
SPRITE = config.ROOT / "public/assets/studio/review/05h_sprite.png"

core.reset_scene()
arm = rig.load_canonical_rig(keep_actions=True)
base = authored05h.build_authored_base(arm, raise_deg=86.0)
pieces = authored05h.build_workwear(base, arm)
allobj = [base] + pieces
print(f"RENDER05H_REVIEW pieces={len(pieces)} tris={sum(core.triangle_count(o) for o in allobj)}")
arm.hide_render = True


def play(clip, frame):
    if clip is None or clip not in bpy.data.actions:
        arm.animation_data_clear()
        for pb in arm.pose.bones:
            pb.matrix_basis = Matrix()
    else:
        if not arm.animation_data:
            arm.animation_data_create()
        arm.animation_data.action = bpy.data.actions[clip]
        bpy.context.scene.frame_set(frame)
    bpy.context.view_layer.update()


def clear_lights():
    for o in list(bpy.data.objects):
        if o.type in {"LIGHT", "CAMERA"}:
            bpy.data.objects.remove(o, do_unlink=True)


def white_fill(strength=0.8):
    d = bpy.data.lights.new("WhiteFill", "SUN")
    d.energy = strength
    d.color = (1.0, 1.0, 1.0)
    o = bpy.data.objects.new("WhiteFill", d)
    o.rotation_euler = tuple(math.radians(a) for a in (60, 0, -120))
    bpy.context.scene.collection.objects.link(o)
    return o


# ---------- 1) transparent iso-angle sprite ----------
SPRITE.parent.mkdir(parents=True, exist_ok=True)
clear_lights()
render.neutral_world(); render.sun(); render.fill()
render.setup(res=(760, 1200), samples=96, transparent=True)
play("Idle_Loop", 24)
render.camera((3.0, -3.0, 3.6), (0, 0, 0.98), lens=60)
render.render_to(str(SPRITE))
print(f"SPRITE -> {SPRITE}")

# ---------- 2) supplementary neutral-AgX stills (second lighting env) ----------
OUT.mkdir(parents=True, exist_ok=True)
clear_lights()
render.ground()
render.sun(); render.fill()
render.setup(res=(1200, 1500), samples=64, transparent=False)


def shot(n, cam, tgt, lens=55):
    render.camera(cam, tgt, lens=lens)
    render.render_to(str(OUT / n))


play("Idle_Loop", 24)
shot("blender-front.png", (0, -5.5, 1.1), (0, 0, 0.95))
shot("blender-3q.png", (3.8, -4.0, 1.25), (0, 0, 0.95))
shot("blender-back.png", (0, 5.5, 1.1), (0, 0, 0.95))
shot("blender-side.png", (5.5, 0, 1.1), (0, 0, 0.95))
# skin-tint isolation: same face/shoulder framing, cool blue fill (harness-like) vs neutral white fill
shot("skin-tint-A-blue-fill.png", (1.6, -2.2, 1.62), (0, 0, 1.5), lens=80)
clear_lights()
render.sun(); white_fill()
shot("skin-tint-B-white-fill.png", (1.6, -2.2, 1.62), (0, 0, 1.5), lens=80)
print("RENDER05H_REVIEW_END ok")
