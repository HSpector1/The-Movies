# Asset Lab 05E — Owner Review Guide

This is the final cleanup loop on the crew characters. It targets the *visible* imperfections that
kept 05D at CONDITIONAL PASS. Nothing here is integrated into the game.

## The one thing that matters
Load the crew on your **real M3** and judge whether they now read as a clean, charming, cohesive,
premium stylized crew — at management-camera distance AND at the closer human-scale framing. 05E is a
lab result; your M3 pass is the acceptance gate.

## Fastest before/after (open these side by side)
Baseline (05D) → cleanup (05E), same neutral lighting:

| Look at | 05D (before) | 05E (after) |
|---|---|---|
| Role lineup | `proof/lab05d/final/roles-front.png` | `proof/lab05e/final/roles-front.png` |
| Three builds | `proof/lab05d/final/proportions-front.png` | `proof/lab05e/final/proportions-front.png` |
| Body/limbs (3q) | `proof/lab05d/final/Grip/base-3q.png` | `proof/lab05e/final/Grip/base-3q.png` |
| Lower body | `proof/lab05d/final/Grip/base-lowerbody.png` | `proof/lab05e/final/Grip/base-lowerbody.png` |
| Hand | `proof/lab05d/final/Grip/base-hand.png` | `proof/lab05e/final/Grip/base-hand.png` |
| Face | `proof/lab05d/final/Grip/base-face-front.png` | `proof/lab05e/final/Grip/base-face-front.png` |
| **In-engine** | `proof/lab05d/runtime/04-human-scale.png` | `proof/lab05e/runtime/04-human-scale.png` |

## What changed (what to verify held up on your GPU)
- Torso is now one **fitted** shirt (no musclebound bulge, no black sternum stripe).
- Arms and legs are **continuous** — the old knee/elbow/shoulder seam rings are gone.
- Hand reads as a hand (four fingers + an opposable thumb); boots read as balanced work boots.
- `slim / standard / heavy` read as three distinct builds; heavy is stocky, not a balloon.
- Face reads friendly (warmer mouth, cap off the brow).
- Deformation across the six clips is clean (check the `pose-*` renders in each role folder).

## Two decisions this loop leaves to you (NOT bugs — scope)
1. **Shared body mesh.** Every role uses the same body + face, differentiated by costume/palette/hat/
   props (+ the SIZE builds and the population face-variation system). The reviewers flag this as the
   last thing that reads "one base recoloured." Giving roles unique bodies/faces/idle-pose variety is
   a larger authoring effort and touches the contract's section-11 non-goals. **Say the word if you
   want it; otherwise it stays as designed.**
2. **Detail ceiling.** Finger knuckles, boot toe-vamp/heel, belt loops, garment folds are simple
   (fine at management distance). Push further only if a near-camera moment needs it.

## Gate
- **Pass** → the crew art is accepted at this fidelity; you decide separately on the two items above.
- **Continue** → name the specific still-visible defect and it becomes the next loop's target.

Do NOT expect this merged or integrated. Branch `asset-lab-05e-character-art-cleanup-loop` is pushed to
the `backup` remote only. Gate D / phase 5 not started.
