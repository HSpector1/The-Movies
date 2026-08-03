# Asset Lab 05I — Final Report

**Final recommendation: REJECT CURRENT 05I — HUMAN ARTIST REQUIRED.**

This closes the two authorized 05I corrective iterations. The specialist + adversarial panel is **unanimous**:
the current 05I is not ready for owner human-scale approval, and the two remaining blockers — the **face** and the
**hands** — are beyond what the procedural pipeline can reach on this CC0 base.

## What the two iterations established

**The procedural authored-base pipeline reliably produces a viable worker BODY:**
- 65-joint skeleton intact; all six clips deform cleanly; garments and belt stay anchored (no explosion/detach).
- Complete hi-vis safety vest, closed hard hat (no exposed scalp), boots that cover the feet and stay attached in
  motion (Iteration-2 offset-shell), tool belt, correct warm-tan skin material, working 3-step LOD, console-error-free
  runtime. The Electric/safety-worker role reads unambiguously — a real, retained gain over 05H.
- Proportions were slimmed from 05H's bodybuilder build toward an ordinary working adult.

**It cannot finish the FACE or the HANDS:**
- **Face (owner target A):** every procedural push — feature reshaping plus smoothing — either left the face heavy
  and lumpy or, when pushed harder, produced a melting-fold "monster" that read *worse* than 05H. A
  production-appealing stylized face is not reachable by vertex smoothing on this realistic CC0 head.
- **Hands:** in the posed, decimated, exported GLB the forearms/fingers collapse into dripping "wax-drip" tendrils
  in the idle and animation clips. This is a **base-mesh hand-skinning failure** (05H exhibits a milder version) that
  is independent of the muscularity settings — reverting them to a gentle level did not fix it — so it is not a tuning
  problem but a limit of the deterministic inverse-distance skinning on this hand topology under animation.

## Honest note on Iteration 2

Iteration 2 landed targets **B (proportions)**, **C (bare-arm read — via short sleeves + bare tan forearms)** in the
rest pose, and **D (boot detach/split — via a weight-inheriting offset shell)**, and preserved all Iteration-1
wardrobe fixes. But it did **not** land **A (face)**, and the arm-clothing/animation interaction exposed the
hand-skinning collapse in motion. Two self-introduced missteps during the pass were caught by the panel and are
recorded honestly in the iteration log (an over-sized "balloon" hat; an over-aggressive face smooth that melted the
face; a `[foot,calf]` boot weighting that floated) — the first two were corrected, but the underlying face/hand
ceilings remain.

## Recommendation to the owner

**Adopt the authored-base BODY pipeline** (rig, garments, proportions, LODs, materials, runtime — all viable) and
**hand the FACE and HANDS to a human artist** (a dedicated sculpt for the face; a hand retopo + manual skin-weight
pass for the fingers). Those two are the isolated blockers; everything else the procedural pipeline produced is
production-directionally sound. The character as a whole is **not** approved for human-scale production.

Nothing was integrated, propagated, named, or wired to a renderer/D1/D1-A/Engine. 05G and 05H remain byte-unchanged.
The isolated branch is pushed to `backup` only (no PR, no merge). Per the ruling, **no further 05I iteration** is
undertaken.
