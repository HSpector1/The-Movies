"""Asset Lab 05H — build the authored base + fitted workwear and render review shots.
  blender --background --factory-startup --python blender/build_hero_05h_dressed.py -- <outdir>
"""
import bpy, sys
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))
from studio_pipeline import config, core, rig, render, authored05h
from mathutils import Matrix

argv = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
OUT = config.ROOT / (argv[0] if argv else "proof/lab05h/iteration-02")

core.reset_scene()
arm = rig.load_canonical_rig(keep_actions=True)
base = authored05h.build_authored_base(arm, raise_deg=86.0)
pieces = authored05h.build_workwear(base, arm)
allobj = [base] + pieces
tris = sum(core.triangle_count(o) for o in allobj)
print(f"BUILD05H_DRESS pieces={len(pieces)} total_tris={tris}")

arm.hide_render = True
render.neutral_world(); render.sun(); render.fill(); render.ground()
render.setup(res=(1200, 1200), samples=48); OUT.mkdir(parents=True, exist_ok=True)

def play(clip, frame):
    if clip is None:
        arm.animation_data_clear()
        for pb in arm.pose.bones: pb.matrix_basis = Matrix()
    else:
        if not arm.animation_data: arm.animation_data_create()
        arm.animation_data.action = bpy.data.actions[clip]; bpy.context.scene.frame_set(frame)
    bpy.context.view_layer.update()
def shot(n, cam, tgt): render.camera(cam, tgt, lens=55); render.render_to(str(OUT/n))

play(None, 0)
shot("dressed-front.png", (0, -5.5, 1.1), (0, 0, 0.95))
shot("dressed-side.png", (5.5, 0, 1.1), (0, 0, 0.95))
shot("dressed-back.png", (0, 5.5, 1.1), (0, 0, 0.95))
shot("dressed-3q.png", (3.8, -4.0, 1.25), (0, 0, 0.95))
play("Walk_Loop", 12); shot("dressed-walk.png", (3.8, -4.0, 1.15), (0, 0, 0.9))
play("Sitting_Idle_Loop", 20); shot("dressed-sit.png", (3.4, -3.6, 1.05), (-0.1, 0, 0.7))
play("Fixing_Kneeling", 20); shot("dressed-kneel.png", (3.4, -3.6, 1.0), (-0.1, 0, 0.65))
play("PickUp_Table", 20); shot("dressed-pickup.png", (3.4, -3.8, 1.1), (0, 0, 0.85))
print("BUILD05H_DRESS_END ok")
