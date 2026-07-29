# Character Hands & Feet Standard (Asset Lab 05C)

## Hands: rounded palm + grouped fingers + thumb (not a cube mitten)

The 05B hand was a flattened box + a thumb box — a mitten/cube. 05C rebuilds it from rounded
ellipsoids, weighted 100% to `hand_l`/`hand_r`:
- **Palm** — a flattened rounded ellipsoid at the wrist end.
- **Grouped fingers** — a second rounded, slightly smaller flattened ellipsoid extending outward
  (a deliberate 4-finger group, not individual fingers — right for the stylized tier and safe to
  deform).
- **Thumb** — a small rounded ellipsoid protruding forward (−Y), angled off the palm.
- **Wrist** — the existing blended wrist sphere gives a clean forearm→hand transition.

No individually modeled fingers (kept simple for deformation + performance). Reads clearly as a
hand at human scale; a mitt at management distance — appropriate for the target.

## Feet: rounded work boots + a sole (not angular boxes)

The 05B boot was two angular boxes. 05C:
- **Instep/heel** — a rounded ellipsoid at the ankle (blended `foot`/`ball`).
- **Rounded toe** — a rounded ellipsoid extending forward (−Y = the measured facing), weighted
  `ball` so the toe flexes.
- **Sole** — a thin dark box under the boot that grounds it visually.

Toe direction is the character forward (−Y). Left/right are mirror instances (the `for s in
(l,r)` loop), so L/R read sensibly. Boots stay connected to the ankle/calf and grounded (min z ≈ 0,
enforced by `charvalidate`).

## Deformation touch-ups
Knee joint sphere enlarged so the knee keeps volume in the deep kneel/crouch; the rolled-sleeve
cuff + elbow joint keep the elbow from thinning at full flex.

## Evidence
`proof/lab05c/iteration-04/`: `Grip/base-hand.png` (hand), `Grip/base-lowerbody.png` +
`Electric/base-lowerbody.png` (boots), pose set (kneel/pickup deformation). Before:
`proof/lab05c/iteration-03/`.
