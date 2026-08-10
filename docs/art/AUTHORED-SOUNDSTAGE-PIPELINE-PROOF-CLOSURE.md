# Authored Soundstage Pipeline Proof — Closure

**Proof:** Authored Soundstage Pipeline Proof
**Production baseline:** `6d08bb055ac51804402cf342e269f472b4b6b6d0`
**Final accepted proof authority:** `81497b4229fe42d5362241c129eec33b2ef982c7`
**Final production adoption commit:** *this commit* — the one that adds this closure, flips the
authored gate to default ON and updates the handoff. Its SHA is recorded in the adoption return;
it is not written here because a commit cannot contain its own hash.

| | |
|---|---|
| Authored environment pipeline | **PROVEN VIABLE** |
| Authored Stage B | **PRODUCTION ADOPTED** |
| Authored Stage B | **DEFAULT** |
| Procedural Stage B | **RETAINED — failure fallback and explicit rollback** |

## What was proven

Offline authoring in Blender → a controlled 2D render → loaded through Phaser → preserving the
existing building identity, state and interaction → with a procedural fallback → at unchanged
runtime cost → with no Engine authority change.

Measured in the real runtime: `displayObjects` **143 → 143** (delta 0), FPS unchanged, scene-ready
unchanged, at 1920/1366/1280 and 125% zoom. Runtime payload **19,286 B** for both variants.

## Scope actually shipped

- **One building.** Stage B only. `BuildingId` stays `stage-b`; footprint 4×4, grid position,
  anchor (246/374), canvas 512×374 and depth key all unchanged.
- **One sprite.** No segmentation was built.
- **No Engine, GameState, SaveFile or StudioLotSnapshot change.** No stage-assignment change.
- **No runtime 3D, no GLB, no renderer rewrite, no generalized asset manifest or loader.** The
  preload path fetches exactly two files, and only when the gate is on.
- Dynamic signage, hover, selection, the companion navigation and the active-stage door glow all
  remain runtime-owned and external to the image.

## Provenance

**No external donor art was incorporated.** Three Poly Haven assets were considered, cleared and
hashed; they were never opened into the authoring scene and contributed nothing to the shipped
pixels. Three ambientCG materials were authorised but never acquired — the required browser
verification could not be performed. Blender audit of the final source scene: 0 image datablocks,
0 linked libraries, 0 texture nodes. Detail:
[`AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-PROVENANCE.md`](AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-PROVENANCE.md).

## Accepted observational limitation — recorded, not overstated

**One-sprite occlusion passed with no observed defect, but no legitimate gameplay route produced a
true behind-body character or vehicle crossing case.** The sorting contract is unchanged *by
construction* — depth derives only from grid coordinates and the footprint, never from the texture —
and front-side crew, equipment and vehicles were verified correct. But across a 14-frame burst at
two cameras and a test-only forced-vignette capture over all four vignette kinds, no ambient route
crosses Stage B's silhouette; the moving pixels inside its rect resolved to the building's own door
glow. A behind-case was not manufactured, and segmentation was not built.

## Governed metrics at adoption

| | authored | procedural | governed |
|---|---|---|---|
| front-to-side displayed luma ratio, normal | **0.8687** | 0.8737 | 0.859–0.876 |
| front-to-side displayed luma ratio, worn | **0.8614** | 0.8746 | 0.859–0.876 |
| distinct colours | 36 | 230 | — |
| true soft edge (alpha 1–249) | 1.72% | 2.73% | — |

Measurement authority is the **final optimized/quantised PNG**, not a Blender light value. That
distinction is itself a lesson: the governed ratio was first applied as linear irradiance and the
shipped asset measured 0.949 for several checkpoints before it was caught. See **AU**.

**The definitions behind those numbers**, added by the pipeline-standard hardening so the figures
can never again be quoted bare. *Displayed luma* = Rec.601 (`0.299/0.587/0.114`) over 8-bit
**encoded** sRGB — never linearised. *Ratio* = modal shadow-face tone ÷ modal lit-face tone inside
the wall band (lit `x 0–232`, shadow `x 280–512`, band `y 280–360`, alpha floor 200, luma floor 140).
*Distinct colours* = distinct RGB triples over pixels with **alpha > 200**, normal finish.
*True soft edge* = pixels with alpha 1–249 as a share of **non-zero-alpha** pixels. Every figure in
this table reproduces from the committed assets via
`scripts/art/authored-asset-pipeline.py measure`. One correction: the soft-edge figure was recorded
as 1.71%, which is the value on the immediately-preceding candidate; the asset that shipped measures
**1.7228% → 1.72%**. The `0.859–0.876` band is Stage B's own historical acceptance band and is **not**
a universal constant — future authored buildings derive their target from their own colour family per
[`AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md`](AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md). Stage B is
**not** re-graded: under the now-canonical formula its figures are numerically unchanged, and it
would also pass the new family-derived rule.

## Non-blocking notes carried forward

- The west cornice stop is a softer 2 px value step than the fully modelled corner termination.
  Classified by the acceptance reviewer as a polish item, not an acceptance failure.
- The worn variant's bottom edge measures 2.5 px max / 5 px run / 1 column >2 px against the
  normal variant's 2.0 / 5 / 0. Raw normal/worn geometry delta is **0 px**; this is sub-pixel
  quantisation behaviour.
- Stage A is unchanged and carries lower detail density than the adopted Stage B. Lot-wide
  hero/detail-density direction is a separate future Art-direction question.

## Still not authorized

D1-B remains **closed** and is not rewritten by this work. No Stage A replacement, no
Administration, Gate, Theater or Water Tower conversion, no full-lot conversion, no Art Factory, no
render automation, no runtime 3D. **Broader authored-building rollout requires separate Art
Director authorization.** No `D1-C` milestone is claimed or implied.
