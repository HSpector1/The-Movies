# Asset Lab 05H — Final Owner Review (Question A: human-scale character foundation)

**What this is.** The visual, evidence-based owner review of the 05H authored-base "Electric" worker at human
scale. It answers **Question A** — is 05H an acceptable authored human-character foundation? Question B (does
live 3D earn its cost at the management camera) is answered separately in
`ASSET-LAB-05H-MANAGEMENT-CAMERA-ASSESSMENT.md`. The two are kept apart.

**How to read the evidence.** All PNGs/WebMs are under `proof/lab05h/final-owner-review/`. In every 05G-vs-05H
comparison, **05G is on the LEFT, 05H on the RIGHT**. Both are the same "Electric" worker; 05H was meant to be
an *improved* authored base over 05G. Start with the owner index (`index.html`).

## Headline finding — the shipped 05H artifact is not acceptable and regresses from 05G

This corrects the prior 05H verdict ("PATH A PROVEN; PASS WITH NOTES"). Ground truth was taken from the
**current shipped GLB** (`electric_hero_05h.glb`, sha256 `86971e47…`; the committed runtime PNGs are **not**
stale), verified on the **real M3 Max GPU** (`root-cause/front.png`, Metal renderer — not software), and
cross-checked against the **GLB material data** (`root-cause/materials.json`). As shipped, 05H reads clearly
**worse than 05G** at human scale.

## ⚠️ A false lead, corrected mid-review (kept visible for honesty)

Early in this review, 05H's torso/arms/face all read *blue*, and I initially concluded "blue skin material
bug." **Root-cause analysis retracts that.** The GLB material data is authoritative:

- `mat_authored_skin` base color = **#e8b58f (warm tan)** — the skin material is **correct**, not blue.
- `mat_h_shirt` = **#475c75 (blue-grey)**, assigned to **3540 verts = torso + arms** — the "blue torso/arms"
  is a **fitted work shirt**, not skin.
- The **face's** cool cast is the review harness's cool fill **lighting** shifting tan skin grey-blue (the
  prior doc's "blue tint = lighting" was right for the face); the **hands** are the same tan skin overexposed
  to near-white.

The earlier skin-tint isolation test (`blender-stills/skin-tint-*`) was **flawed** — it changed the fill light
but kept a blue-grey world, so it did not isolate the material. That test's "material blue" conclusion, and the
review panel's reliance on it, are **withdrawn**. Evidence: `root-cause/materials.json`, `root-cause/front.png`.

## What genuinely works (do not discard)

- **Body sculpt is a real upgrade over 05G.** Defined pectorals, deltoids, quads and calves replace 05G's
  "balloon" limbs; hands have individually articulated fingers; feet are fully modeled with separated toes.
  *(matched-comparison/front.png, root-cause/front.png)*
- **The rig is good.** Clean deformation across all six demanding clips — deep one-knee kneel, 90° seated
  hip-crease, hip-hinge pickup, walk stride, two-handed talk — no mesh collapse, no candy-wrapper joints,
  volume held, tool belt/pouches/radio anchored through every pose, walk actually cycles.
  *(animation/*/front-3q.png, animation/walk/motion.webm)*
- **The skin material is correct** (warm tan) and **the pipeline is sound**: 65-joint skeleton, 3-step LOD,
  retargets the CC0 clip library, runs console-error-free.

## What fails — as shipped (corrected root causes)

| # | Defect | Root cause | Severity | Evidence |
|---|---|---|---|---|
| 1 | **Broken hi-vis vest.** Renders as torn olive/yellow scraps clipping the torso, leaving the shirt exposed. | Vest is ~510 verts (`mat_h_vest`+`mat_h_hiviz`) — far too low-poly; fails as a garment. | blocker | `human-scale/closeup-vest-front.png`, `root-cause/vest.png` |
| 2 | **Bare feet — worker renders barefoot.** | `mat_h_boots` exists (1492 verts) but the boot geometry does not cover the foot; the tan skin foot shows. | blocker | `root-cause/boot.png`, `human-scale/closeup-boot.png` |
| 3 | **Skin-tight shirt reads as a bare "blue" torso.** The blue-grey work shirt is painted-on tight over a heavy torso and, with the vest broken over it, reads as nude blue skin rather than clothing. | Garment fit + layering (not a skin-material bug). | major | `root-cause/front.png` |
| 4 | **Minimal / broken hard hat, open scalp.** A band with the crown left open, vs 05G's clean helmet. | `mat_h_hat` is only 112 verts. | major | `matched-comparison/rear.png` |
| 5 | **Over-muscled "bodybuilder" proportions + heavy, ogre-ish face** (protruding brow, bulbous nose, pointed ears). Pushes the "believable studio worker" read toward fantasy. | Inherited from the CC0 stylized base mesh. | major | `human-scale/pose-neutral-idle.png`, `matched-comparison/front-three-quarter.png` |
| 6 | **Skin reads cool/grey; hands over-exposed.** | Review-harness cool fill lighting on correct tan skin — a *presentation* issue, fixable in the harness, not the asset. | minor | `root-cause/front.png` |

Minor: soft undefined crotch (non-bifurcated single-tube pants), paddle-flat feet with no toe roll, a low
wide bent-knee walk stance (retarget-style), tool-belt clipping at the hip.

## Why this matters

The failures are **garment (vest, shirt fit, boots, hat), base-mesh proportion/face, and harness lighting** —
sitting *on top of* a **good mesh, a good rig, and a correct skin material.** The *foundation* (topology +
skeleton + deformation + skin material) is validated and superior to 05G; the *finished character as exported*
is not acceptable and must not be called "PASS." Two independent renderers plus the GLB material data agree on
the facts.

## Owner call (Question A)

At human scale, **05H as shipped is not an acceptable go-forward character** and regresses from 05G in finished
appearance. The authored-base **approach** produced a better sculpt, a working rig, and a correct skin material,
and is worth keeping. The corrective work is concentrated in the **garment system**, **base proportions/face**,
and **harness lighting** — see `ASSET-LAB-05H-FINAL-ART-PM-RECOMMENDATION.md`.
