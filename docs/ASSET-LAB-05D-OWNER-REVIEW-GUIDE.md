# Asset Lab 05D — Owner Review Guide (for Howard's M3 real-GPU pass)

05D is a **professionalization** loop (13 iterations) on the 05C crew. All 05B/05C technical
corrections are locked and unchanged; this took the crew from "good stylized prototype" to a
cohesive professional cast.

## 60-second look (neutral-lit Blender proof — `proof/lab05d/`)
1. `final/roles-front.png` / `allroles-front.png` — the cast: distinct roles by **silhouette +
   prop + value**, greyscale-separable (PA clipboard · Grip flatcap+belt · Electric hard-hat+hi-vis
   +coil · Maintenance beanie+dark coveralls+bib · Office satchel+bun · Director coat+fedora+goatee
   · Carpenter apron+beard).
2. `final/population-front.png` — 6 same-role crew as **distinct people** (face/build/skin/hair vary).
3. `final/proportions-front.png` — slim / average / wide as **ratio-different builds**.
4. `final/Grip/base-face-front.png` — sculpted charming face (lidded almond eyes, brow/cheek/chin
   planes, two-lip smile).
5. `iteration-13/Grip/base-hand.png` — **individual-finger hand** (palm + 4 fingers + knuckles +
   thumb) from an above-3q angle.
6. `final/Grip/base-left.png` — athletic S-curve torso + shaped limbs (no tubes/armor).

## Before → after
- 05C (before): `proof/lab05d/baseline/`. 05D (after): `proof/lab05d/final/`.
- Progression: `iteration-01` (anatomy) → `-06` (hands) → `-11` (role differentiation) → `final`.

## Runtime (diagnostic)
`proof/lab05d/runtime/01-crew-front.png`, `04-human-scale.png` — refined crew in Scene G, faces on
the front, all roles + props, **console-error-free**. Headless **SwiftShader** (software; flat, ~2
fps) — NOT a performance or final-look test.

## What only you can decide (Apple M3)
Run Scene G on your M3: confirm the crew read as a charming, professional, cohesive cast at
management + medium distance; roles read without labels; faces/hands hold at medium shots; 60 fps+.

## Known remaining notes (documented, non-blocking)
Grip/Maintenance separation now uses a value-block (robust) but both are still cap+mid-torso — watch
at tiny sizes; face warmth is competent-not-radiant (a smile/cheek-highlight lift is possible);
per-role garment silhouettes could go further (tool loadouts); PA's clipboard can occlude in rear/
pickup poses; 9 material slots/char (atlasable — see performance doc justification); runtime lighting
is the app's own (flatter than the Blender review). Full detail: `ASSET-LAB-05D-ITERATION-LOG.md`.
