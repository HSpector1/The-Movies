# Hero Character — Fitted Safety Vest Standard (Asset Lab 05F)

The 05E hi-vis vest was rejected as three inflated rings / flotation equipment / padded armor with two
rigid white rails, floating off the torso, no opening, no armhole/shoulder fit.

## Rule
The safety vest is a **fitted, open-front shell that follows the torso** and hangs from the shoulders —
NOT a stack of inflated rings.

## Construction (`character_hero` + `meshgen.add_arc_loft` / `skinning.arc_loft`)
- **Open-arc-loft shell:** an OPEN (uncapped) lofted surface following the torso loft's chest/waist/yoke
  rings ~1.5 cm proud, spine-weighted. The arc leaves a **front gap** (~40°, the open zip line) so the
  shirt shows between two front panels. It ends **below the shoulder yoke** (natural armholes) and
  **below the neck** (natural neck opening).
- **Over-shoulder yoke straps:** a hi-vis strap over each trapezius connecting the front panels to the
  back, anchored ON the vest corners with NO exposed end caps (a floating capped segment read as a stray
  shard). Weighted to the **clavicle** so (a) the vest reads shoulder-hung and (b) the armhole edge
  tracks the deltoid on shoulder abduction instead of delaminating.
- **Upper vest rings** blend a little clavicle (symmetric) so the armhole follows the shoulder; the
  **hem** stands slightly proud for lumbar clearance in deep flexion.
- **Reflective bands = two THIN white arc-strips** wrapping the sides/back (restrained) — never rigid
  full-ring rails.

## Must-not
No inflated rings · no rigid tube rails · no large off-body float · no closed barrel · no missing
armhole/shoulder fit · no stray shard at the yoke.

## Verified (Iteration 2 + certified Iteration 5)
Garment Artist + Rigging PASS-WITH-NOTES (fit 4/5): "resolves every reason the owner rejected 05E… a
constructed shoulder-anchored safety vest." Both must_fix items (shoulder yoke + armhole clavicle
weighting) resolved. Rigging final PASS: no torso-piercing, no armhole delamination, no hem poke-through
across all six clips.
