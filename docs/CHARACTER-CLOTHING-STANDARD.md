# Character Clothing Standard (Asset Lab 05B)

## Clothing is MODELED geometry with distinct materials — not paint

Lab-05 "clothing" was vertex-paint by nearest-bone on a fused blob (reads naked/painted). Replaced
with **real garment shells** as distinct material slots with visible silhouette boundaries:

- **Upper garment (shirt/coat):** stacked torso boxes (belly→chest→upper-chest, tapered) + a
  collar ring so the neck emerges from a clear neckline; short sleeves over the upper arms, skin
  forearm below the cuff → a visible **sleeve boundary**.
- **Lower garment (trousers/coveralls):** skinned leg segments in the trousers material + a
  pelvis-weighted **trouser-seat** bridging the thighs (closes the crotch gap) → a clear **waist
  boundary** where the shirt hem meets the trousers.
- **Boots:** dark heel block + toe box → clear ankle break, boots read as footwear (never bare
  feet).
- **Layers:** hi-vis vest (proud of the shirt), long coat (tapered skirt), tool belt + pouch — all
  distinct materials/silhouettes.

Contrast matters: garment values are chosen distinct from skin (the base render exposure was also
lowered from 0.0 to −0.35 because 0.0 washed clothing toward skin tone).

## Clipping (tested across arms-down / forward / walk / talk / kneel / sit / pickup)

Because garments are separate shells over the body and everything deforms with the same segmented
weights, there is **no severe clipping** in the six required clips + stress poses — the vest and
belt hold through the deep kneel; sleeves/trousers track the limbs. Minor prototype-level overlap
at deep joint flex is acceptable and does not dominate the silhouette.

## Evidence
`proof/lab05b/final/`: base-front, base-lowerbody (trousers+boots break), base-3q, the pose set,
and the role/palette lineups (shirt/coat/vest/coverall silhouettes).
