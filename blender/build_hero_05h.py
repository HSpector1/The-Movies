"""Asset Lab 05H — build the authored base hero and render neutral review shots.
  blender --background --factory-startup --python blender/build_hero_05h.py -- <outdir> [raiseDeg]
"""
import bpy, sys, math
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))
from studio_pipeline import config, core, rig, render, authored05h
from mathutils import Matrix

argv = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
OUT = config.ROOT / (argv[0] if argv else "proof/lab05h/iteration-01")
RAISE = float(argv[1]) if len(argv) > 1 else 84.0

core.reset_scene()
arm = rig.load_canonical_rig(keep_actions=True)
base = authored05h.build_authored_base(arm, raise_deg=RAISE)
mn, mx, sz = core.world_bounds([base])
print(f"BUILD05H tris={core.triangle_count(base)} height={sz.z:.3f} verts={len(base.data.vertices)}")

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
shot("base-front.png", (0, -5.5, 1.1), (0, 0, 0.95))
shot("base-side.png", (5.5, 0, 1.1), (0, 0, 0.95))
shot("base-3q.png", (3.8, -4.0, 1.25), (0, 0, 0.95))
shot("base-back.png", (0, 5.5, 1.1), (0, 0, 0.95))
play("Walk_Loop", 12); shot("base-walk.png", (3.8, -4.0, 1.15), (0, 0, 0.9))
play("Idle_Talking_Loop", 30); shot("base-talk.png", (3.4, -3.8, 1.2), (0, 0, 0.95))
play("Sitting_Idle_Loop", 20); shot("base-sit.png", (3.4, -3.6, 1.05), (-0.1, 0, 0.7))
play("Fixing_Kneeling", 20); shot("base-kneel.png", (3.4, -3.6, 1.0), (-0.1, 0, 0.65))
play("PickUp_Table", 20); shot("base-pickup.png", (3.4, -3.8, 1.1), (0, 0, 0.85))
print("BUILD05H_END ok")
