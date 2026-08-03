"""Asset Lab 05I — build the corrected hero and render review shots (iteration-fast, no export).
  blender --background --factory-startup --python blender/build_hero_05i_render.py -- <outdir>
"""
import bpy, sys
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))
from studio_pipeline import config, core, rig, render, authored05i
from mathutils import Matrix

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = config.ROOT / (argv[0] if argv else "proof/lab05i/iteration-01")

core.reset_scene()
arm = rig.load_canonical_rig(keep_actions=True)
base = authored05i.build_authored_base_05i(arm)
pieces = authored05i.build_workwear_05i(base, arm)
allobj = [base] + pieces
print(f"BUILD05I pieces={len(pieces)} total_tris={sum(core.triangle_count(o) for o in allobj)}")

arm.hide_render = True
render.neutral_world(); render.sun(); render.fill(); render.ground()
render.setup(res=(1200, 1500), samples=48); OUT.mkdir(parents=True, exist_ok=True)


def play(clip, frame):
    if clip is None:
        arm.animation_data_clear()
        for pb in arm.pose.bones:
            pb.matrix_basis = Matrix()
    else:
        if not arm.animation_data:
            arm.animation_data_create()
        arm.animation_data.action = bpy.data.actions[clip]
        bpy.context.scene.frame_set(frame)
    bpy.context.view_layer.update()


def shot(n, cam, tgt, lens=55):
    render.camera(cam, tgt, lens=lens); render.render_to(str(OUT / n))


play(None, 0)
shot("front.png", (0, -5.5, 1.1), (0, 0, 0.95))
shot("side.png", (5.5, 0, 1.1), (0, 0, 0.95))
shot("back.png", (0, 5.5, 1.1), (0, 0, 0.95))
shot("3q.png", (3.8, -4.0, 1.25), (0, 0, 0.95))
shot("face.png", (0.8, -2.0, 1.62), (0, 0, 1.55), lens=85)
shot("boots.png", (2.0, -2.6, 0.35), (0, 0, 0.18), lens=70)
shot("vest.png", (0.9, -2.4, 1.28), (0, 0, 1.2), lens=80)
shot("hat.png", (1.6, -2.2, 1.9), (0, 0, 1.66), lens=80)
play("Walk_Loop", 12); shot("walk.png", (3.8, -4.0, 1.15), (0, 0, 0.9))
play("Sitting_Idle_Loop", 20); shot("sit.png", (3.4, -3.6, 1.05), (-0.1, 0, 0.7))
play("Fixing_Kneeling", 20); shot("kneel.png", (3.4, -3.6, 1.0), (-0.1, 0, 0.65))
play("PickUp_Table", 20); shot("pickup.png", (3.4, -3.8, 1.1), (0, 0, 0.85))
print("BUILD05I_RENDER_END ok")
