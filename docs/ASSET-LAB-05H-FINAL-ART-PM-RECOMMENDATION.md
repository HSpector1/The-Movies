# Asset Lab 05H — Final Art-PM Recommendation

One primary recommendation, per the review directive. It authorizes **nothing beyond itself**: no integration,
no merge, no propagation to other roles, no renderer adoption, no D1-A work.

---

## PRIMARY RECOMMENDATION: **B — ACCEPT FOUNDATION WITH FURTHER ASSET-LAB REFINEMENT**

**In plain terms:** keep the authored-base *foundation* (it is real progress), **reject the current 05H
character build** (it is not shippable and regresses from 05G), and require a corrective Asset Lab iteration
that fixes the garment system, base proportions/face, and harness lighting before any go-forward-character or
propagation claim. Keep **05G** as the interim human-scale base.

This is a *revise-and-resubmit*, not a pass and not an abandonment. It is the point at which all five review
lanes converge once mapped to the directive's option set (see "On the review panel" below).

### Strongest evidence for B
- **The foundation is sound and better than 05G:** higher-information body sculpt (real muscle groups,
  articulated fingers, modeled feet), a **65-joint rig that deforms cleanly through a demanding six-clip
  gauntlet** (deep kneel, 90° sit, hip-hinge pickup, walk, talk) with no collapses and anchored accessories, a
  correct 3-step LOD chain, and a **correct warm-tan skin material** (`root-cause/materials.json`). The Blender
  pipeline that produced all this works.
- **The current build is not shippable:** as shipped it regresses from 05G at human scale (see
  `ASSET-LAB-05H-FINAL-OWNER-REVIEW.md`).

### Remaining defects to fix before re-review (corrected root causes)
1. **Rebuild the hi-vis vest** — currently ~510 verts, renders as torn scraps (blocker).
2. **Fix boot coverage** — boots material exists but the foot renders bare (blocker).
3. **Re-layer / re-fit the work shirt** — the skin-tight blue-grey shirt + broken vest read as a nude blue
   torso; it is a garment fit/layering problem, **not** a skin-material bug (major).
4. **Rebuild the hard hat** — 112 verts, open scalp (major).
5. **Reconsider base proportions and face** — over-muscled bodybuilder silhouette + heavy, ogre-ish face with
   pointed ears push it out of "believable studio worker" (major; inherited from the CC0 base).
6. **Fix the review-harness lighting** so the exposed tan skin does not read cool/grey and hands do not
   over-expose (minor; presentation, not the asset).

### What is reusable if work continues (do not rebuild)
The base-mesh topology, the 65-joint skeleton and skin weights, the six retargeted clips, the LOD pipeline, and
the correct skin material. The corrective iteration is a **finishing pass on garments/proportions/lighting**,
not a from-scratch rebuild.

### What is discarded if work stops here
The authored-base sculpt + rig advantage over 05G. Stopping would fall back to 05G's procedural-primitive
character, which the panel judged anatomically inferior. The pipeline learnings and tooling remain.

---

## Why not the neighbours
- **Not A (reject the authored foundation):** the rig, sculpt, and skin material are genuine gains; the defects
  are fixable garment/lighting/finishing issues, not a dead direction. Rejecting the foundation throws away the
  best part.
- **Not C (accept human-scale foundation, reject live-3D value):** the first clause is false — the character
  fails at human scale. C would ship a defective asset.
- **Not F (defer):** evidence is sufficient to conclude reject-the-build / keep-the-foundation.
- **D / E are relevant but secondary**, not the primary — see the mandatory Question-B note below.

---

## Mandatory secondary note — Question B (renderer value) is separate and unresolved

Even a *fixed* 05H would not, on this evidence, clearly justify live skinned 3D at the fixed-isometric
management camera (`ASSET-LAB-05H-MANAGEMENT-CAMERA-ASSESSMENT.md`):
- 05H-vs-05G quality is **imperceptible at default management framing**; 05G's brighter hats actually read
  **better** at distance; the "Electric" identity does not register.
- The **management camera flatters** the defective asset — the framing that makes 05H "read as a crew" is
  exactly the one that hides every close-range defect. Do not let the management view stand in for a
  human-scale verdict.
- **Cost** is cheap on the M3 Max (120 FPS at 4 workers) but carries a **texture-disposal leak** that any
  integration must fix (`ASSET-LAB-05H-REAL-GPU-PERFORMANCE.md`).

**Therefore:** before investing in perfecting the live character for the lot, the owner should decide the
renderer question — does live 3D belong at a fixed-iso management camera at all, versus a **pre-rendered /
sprite worker** (which could be baked from the good rig, sidesteps the disposal leak, and looks the same at
that distance)? That is directive option **D**, raised here as a discussion item, not authorized. This is
conditioned on the **real D1 camera**, whose parameters do not exist in this repo — the #1 owner-verification
item. If the real lot camera lets players **zoom to human scale**, character quality (Question A) becomes the
binding constraint and B is clearly right.

---

## Technical & visual risks
- **Technical:** the disposal leak (~84 textures per view round-trip) is a real integration risk; VRAM in bytes
  was not measured (owner step provided); FPS is vsync-capped and only best-case M3 Max hardware was measured,
  so lower-spec headroom is unproven.
- **Visual:** the base-mesh proportions/face may resist correction without deeper mesh work; the non-bifurcated
  single-tube pants limit crotch/leg definition regardless of garment work.

## Effect on D1-A
**None.** D1-A was not started, not designed, not scaffolded. This recommendation does not begin it. The
management rig here is a representative review-only approximation, not a D1 camera.

---

## On the review panel (honesty note)
Five independent reviewers (Character Art, Rigging/Animation, Management Readability, Runtime/Performance, and an
Adversarial synthesizer) assessed the rendered evidence. Their enum "lean" letters were cast against paraphrased
questions (the exact A–F option text was not supplied to them), so their **reasoning**, not their letters, is
what this recommendation synthesizes; their reasoning converges on revise-and-resubmit = directive **B**. The
adversarial pass also (a) correctly rejected the Management reviewer's "the asset is fine" as an artifact of the
flattering camera, and (b) flagged that the sprite value-comparison framing is imperfect — both incorporated.
Separately, this review **retracted its own earlier "blue skin material" finding** after a GLB material dump and
a real-GPU close-up showed the skin material is correct warm tan and the blue is a shirt plus harness lighting
(`ASSET-LAB-05H-FINAL-OWNER-REVIEW.md`, "A false lead, corrected mid-review").

**Recommendation: B — accept the foundation, reject this build, refine and resubmit. Owner visual and
renderer-value decision required.**
