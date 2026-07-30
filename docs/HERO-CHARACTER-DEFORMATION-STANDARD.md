# Hero Character — Deformation Standard (Asset Lab 05F)

The hero must survive the six accepted CC0 clips (Idle_Loop, Walk_Loop, Idle_Talking_Loop,
Sitting_Idle_Loop, PickUp_Table, Fixing_Kneeling) on the LOCKED 65-bone UAL skeleton WITHOUT any of the
prohibited failure modes.

## Rules
- **No** collapsed pelvis · vest torso-piercing / armhole delamination / hem poke-through · shoulder
  spike · trouser-seat separation · hand detachment / broken wrist · boot penetration / float · garment
  separation · mesh shards.
- Every rebuilt region is skinned to REAL UAL bones (no renamed groups), 0 unweighted verts / 0 bad
  weight-sums, and feet grounded (rest-pose min-z near 0).

## Techniques that made deformation clean
- **Continuous surfaces** (loft / tube / arc-loft) deform as ONE form — no butt-jointed segment rings.
- **Progressive weighting** along the bone chain (`_spine_w`, per-ring blends) so a torso/pelvis/limb
  bends smoothly across its joints.
- **Garment edges anchored to the moving bone:** the vest armhole + shoulder yoke blend a little
  `clavicle` so the edge tracks the deltoid (not a static spine weight that delaminates on abduction).
- **Stretchy fills:** the crotch inseam gusset is weighted `pelvis + both thighs` so a wide stance does
  not open an inseam notch.
- **Rigid attachments where safe:** the hand is rigid to the `hand` bone (deformation-safe volume).
- **No exposed caps on straps** (`cap=False`) — a floating capped segment reads as a stray shard.

## Verified
Iteration-5 Rigging certification = **full PASS (4.5/5, no must_fix):** "survives all six accepted clips
with no disqualifying deformation defect; every rebuilt weak region holds… no mesh shards or garment
separation in any of the six clips." The one flagged shard (a floating yoke-strap cap) was removed.

## Documented limitation (out of scope — LOCKED clips/rig)
The `Fixing_Kneeling` down-foot toe contact (min-z −0.044) is clip-inherited (identical for the 05E
Electric). A per-pose toe-plant needs an IK/animation change, outside the locked foundation. Not a hero
geometry regression.
