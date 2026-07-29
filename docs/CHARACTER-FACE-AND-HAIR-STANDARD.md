# Character Face & Hair Standard (Asset Lab 05C)

## Face: appealing simplicity, not realism-attempted-and-missed

All features are modeled geometry on the measured **−Y front**, weighted 100% to `Head`, symmetric
by construction (a `for sgn in (-1,1)` loop). The 05B "googly white eyeball + dot pupil" read as
startled/wall-eyed; 05C replaces it with a **clean dark almond eye** + a small **white catch-light**
(Two Point / Mii idiom) → focused, calm, charming.

| Feature | Geometry | Material |
|---------|----------|----------|
| Eye | dark almond ellipsoid (wider than tall) sitting on the face | dark (fixed) |
| Catch-light | small white sphere, upper-inner corner | white |
| Eyebrow | soft rounded bar just above the eye | **hair colour** (harmonises) |
| Nose | small soft skin bump (not a wedge/lump) | skin |
| Mouth | gentle wide+thin closed line (friendly-neutral) | dark |
| Ears | flattened spheres at ±X | skin |

No realistic eyeballs, teeth, tongue, or facial rig. Expression is static: friendly-neutral.
Enforced front-only by `charvalidate` (mean feature-Y must be < −0.02) and `test_character_gate`
(a face-on-back build is REJECTED).

## Hair: designed silhouettes, never bald

- **Bare heads** get a designed hairstyle (`_add_hair`): a base cap plus a style delta. ≥4 distinct
  silhouettes: **short · sidepart · bun · ponytail · curly · quiff**. Hair covers top/back/sides;
  the −Y face stays skin. Assigned per-role (`hair_style`) or per-instance via `overrides`.
- **Hatted heads** get a **fringe** (`_add_hair_fringe`): a lower back/side hair band + temple
  sideburns that show under the hat brim, so a hatted (esp. hard-hat) head is **never bald**.

## Headwear: worn, not balanced

Hats seat on the crown, not floating: the hard-hat dome hugs the crown (radius ≈ 0.124, Z-flattened)
with a modest brim at forehead height (was a wide bowl balanced high). Types: hard hat · soft cap ·
flat cap · fedora, each weighted 100% to `Head` (follow head translation + rotation; verified
attached through the deep-kneel pose in 05B).

## Evidence
`proof/lab05c/iteration-02/`: hero face close-ups (Grip/Electric), `hairstyles-front.png` (6 styles),
`headwear-front.png`, role lineup. Before: `proof/lab05c/iteration-01/Grip/base-face-front.png`.
