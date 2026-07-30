# Asset Lab 05E — Owner Review Guide

The crew characters now have a complete in-engine **review harness** in Scene G. This guide matches
the controls that actually exist. Nothing here is integrated into the game; it is a review-only
presentation.

## Open it
Run the lab (`npx vite --port 4321 --strictPort`, open `http://localhost:4321/`) and pick scene
**G · Character Art Review (Lab05E)**. It opens on **Full Scene Overview** (the real production Scene G
— composition unchanged). The left panel shows a **Review status** block and the review cameras,
grouped. All cameras are buttons — no hidden keyboard commands. Orbit/zoom with the mouse to inspect
closer or to see a rear angle of any pose.

## Camera groups (25 cameras + Reset)
- **Lineups** (whole crew, neutral area, static idle): Crew Lineup Front · Back · Left · Right ·
  Three-Quarter Front · Three-Quarter Back · Role Comparison.
- **Close Review** (centred on the vest/shirt roles — pan along the row for the others): Faces and
  Hair · Hands · Feet and Shoes · Torso and Vest · Pelvis and Hips — Front · Pelvis and Hips — Back.
- **Animation** (every role performs ONE clip, front three-quarter): Walk · Idle Talking · Kneeling ·
  Pickup · Sitting.
- **LOD** (same role, same pose/scale/lighting, all three side by side with live tri/material/joint
  counts): LOD0 Comparison · LOD1 Comparison · LOD2 Comparison.
- **Context** (the REAL production Scene G, unchanged): Management Distance · Human Scale · Refined
  Lot Scale Reference · Full Scene Overview.
- **Reset** → returns to Full Scene Overview.

The review lineups/close-ups/animation/LOD are shown in a **dedicated neutral review area** (mid-value
floor, controlled neutral lighting, no overexposure, no set clutter). The production Scene G set/crew
are shown only by the four Context cameras and are never altered by the review presentation.

## Role inventory (authoritative — 8 roles)
Production Assistant · Grip · Electric · Maintenance · Office / Admin · Camera / DP · Director ·
Carpenter. (Each is labelled in the lineup.) "Grip/Electric" is two distinct roles here.

## 60-second review path
1. **Crew Lineup Front** — read the cast at a glance; consistent framing, same scale.
2. **Crew Lineup Back** — hair/headwear/back silhouettes; same scale as front.
3. **Faces and Hair** — pan the row: eyes/brow/nose/mouth/cap seat.
4. **Hands** — fingers, thumb, wrist.
5. **Feet and Shoes** — boot form, grounding, ankle.
6. **Torso and Vest** — fitted shirt read + the hi-vis vest.
7. **Pelvis and Hips — Back** — the rear pelvis/seat that was hardest in 05D.
8. **Walk** — continuous limbs in stride.
9. **Kneeling** — hips/knees/ankles/feet through a deep bend.
10. **Pickup** — reach + hand.
11. **Sitting** — hip/torso bend.
12. **LOD0/1/2 Comparison** — honest detail drop-off + the triangle/material/joint counts.
13. **Management Distance** — how they read at the in-game camera distance.
14. **Full Scene Overview** — the whole production Scene G in context.
15. **Review status panel** (left) — confirm FPS / draw calls / triangles / assets / console-error
    status settle.

## Review status panel
Shows milestone (Asset Lab 05E), active camera, active animation, active LOD, character/role counts,
live FPS, draw calls & triangles per frame, scene-tri inventory, loaded assets, and console-error
status. Live values update on your GPU — read sustained FPS here.

## Performance
Read **sustained** FPS in the status panel over ~20 s per camera (Full Scene Overview, a lineup, an
animation, and LOD) — do not judge from one transient frame. The bundled headless capture runs a 20 s
probe per camera, but under SwiftShader (software raster) its FPS is **diagnostic only**; your Apple M3
is the acceptance measure. Draw-call and triangle counts in the panel are hardware-independent and
meaningful.

## What changed in the characters (05E cleanup — for the M3 pass)
Continuous lofted torso + swept-tube limbs (no joint seams), fitted clothing (no black sternum stripe),
opposable-thumb hands, balanced work boots, distinct builds (heavy = stocky, not a balloon), warmer
face. Independently gated: 2 MAJOR_IMPROVEMENT + 3 IMPROVED, zero substantive regressions. Compare
against 05D with the matching files in `proof/lab05d/final/*` (same filenames as `proof/lab05e/final/*`).

## Two decisions this loop leaves to you (scope, not bugs)
1. **Shared body mesh** — all roles use one body + face, differentiated by costume/palette/hat/props
   (+ the build and population systems). Unique per-role bodies/faces/idle-pose variety is a larger
   authoring change touching the contract's section-11 non-goals. Your call.
2. **Detail ceiling** — finger knuckles, boot toe-vamp, belt loops, garment folds are simple (fine at
   management distance).

## Gate
- **Pass** → the crew art + review harness are accepted at this fidelity.
- **Continue** → name the specific still-visible defect; it becomes the next loop's target.

Not merged, not integrated. Branch `asset-lab-05e-character-art-cleanup-loop` on the `backup` remote
only. Gate D / phase 5 not started.
