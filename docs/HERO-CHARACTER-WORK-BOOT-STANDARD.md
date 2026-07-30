# Hero Character — Work Boot Standard (Asset Lab 05F)

05E defect F: the boots read as rounded blocks / wedges on a flat rectangular sole slab (no toe box,
weak heel/vamp, ragged trouser break, no left/right read).

## Rule
A defined stylized **work boot** = one clean upper mass + a distinct toe cap + an ankle collar + a dark
sole with a heel — NOT a pile of rounded lumps on a plate.

## Construction (`character_hero`)
- **Upper = ONE smooth leather mass** covering ankle→instep→arch, so the boot reads as a single form
  (multiple similar leather ellipsoids read as lumps — use one main mass + accents).
- **Ankle collar** (leather) — TALL + WIDE so the trouser tucks INTO the boot (a clean break; hides the
  cuff, no jagged crenellation).
- **Toe cap** (leather) — a defined, slightly squarer/flatter rounded toe box, with a small **outward
  splay** for a left/right read.
- **Sole** (dark) — a defined sole plate pulled IN toward the upper footprint (not an overhanging slab),
  + a dark **heel block** raising the back (a heel, not a flat slab). The dark sole gives the boot a
  value break against the leather upper.

## Must-not
No rounded-lump-on-a-slab · no wedge shoe · no flat overhanging sole · no ragged trouser cuff · no
missing toe/heel/collar · no floating heel.

## Verified (Iteration 4 + certified Iteration 5)
Garment Artist 4/5 + Rigging 3.5/5 PASS-WITH-NOTES: "believable stylized work boot… every named
component present… the lump is gone… idle/sit/walk ground cleanly, boot-to-leg join solid."

## Known limitation (documented, out of scope)
The `Fixing_Kneeling` clip's down-foot toe contact (min-z −0.044) is CLIP-inherited — identical for the
05E Electric and the hero. A per-pose toe-plant would require an IK/animation change, which is outside
the LOCKED foundation (no clip/rig changes). Not a hero geometry regression.
