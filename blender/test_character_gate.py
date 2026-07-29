"""Automated test (Asset Lab 05B): the character validation gate must PASS a correct build AND
FAIL a face-on-back build. Proves the pipeline genuinely rejects the rejected defect, not just
that it accepts good input.

  blender --background --factory-startup --python blender/test_character_gate.py
"""
import sys, math
from pathlib import Path
BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

from mathutils import Matrix
from studio_pipeline import core, rig, character2
from studio_pipeline.charvalidate import validate

fails = 0

# 1) a correct build must PASS
core.reset_scene()
arm = rig.load_canonical_rig(keep_actions=False)
obj = character2.build_character2("PA", arm, seed=1)
ok, issues, _ = validate(obj)
print("  correct PA :", "PASS" if ok else "FAIL " + str(issues))
if not ok:
    fails += 1

# 2) a face-on-back build must FAIL (rotate geometry 180 about Z -> features land on +Y/back)
core.reset_scene()
arm = rig.load_canonical_rig(keep_actions=False)
obj = character2.build_character2("PA", arm, seed=1)
Rz = Matrix.Rotation(math.pi, 4, "Z")
for v in obj.data.vertices:
    v.co = Rz @ v.co
obj.data.update()
ok2, issues2, _ = validate(obj)
caught = (not ok2) and any("FACE-NOT-ON-FRONT" in i for i in issues2)
print("  flipped PA :", "correctly REJECTED" if caught else "WRONGLY PASSED", issues2)
if not caught:
    fails += 1

print("GATE_TEST_OK" if fails == 0 else f"GATE_TEST_FAILED ({fails})")
sys.exit(1 if fails else 0)
