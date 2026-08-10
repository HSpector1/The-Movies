# Stage A — authored preflight REFRESH, against current production

**Status: PREFLIGHT DELTA / CONCEPT DEFINITION ONLY. No Stage A Art is authorized.**
Branch `art-authored-stage-a-preflight-refresh`, cut from current production authority
`36670a3fb882166b42b42a32f18eef5a6ede929d`.

This is a **delta**. The original preflight
([`STAGE-A-AUTHORED-PREFLIGHT.md`](STAGE-A-AUTHORED-PREFLIGHT.md), frozen at `918015c`) remains
the authority for everything production did not change. Nothing here models, renders, exports or
integrates anything.

---

## 1. What production changed

`4a3025e` → `36670a3`, three commits, 7 files, +529/−10:

```
fdfdfea  feat(lot): adopt Candidate A authored Stage B art (Option D)
d7dbd03  docs: capture authored environment pipeline lessons
36670a3  test: update accepted Stage B measurements
```

**No runtime source file changed.** The delta is image bytes, tests, and documentation.

| changed | what it means |
|---|---|
| `ui/public/lot/b-stage-b{,-ud}.png` | Stage B replaced by "Candidate A — Ridge-Monitor Stage". 10,254 → 54,659 B and 9,032 → 61,392 B |
| `docs/art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md` (+16) | two supersession notes: production Stage B is **no longer PNG-8** |
| `docs/LESSONS-LEARNED.md` (+173) | new lessons **AW, AX, AY, AZ, BA, BB** |
| `ui/src/lot/authored-stage.test.ts` (+228) | on-disk IHDR guard, height-invariant anchor, real negative alpha probe, **registration lock** |
| `ui/src/lot/scene/authoredValueStandard.test.ts` | Stage B accepted figures 0.8687/0.8614 → **0.8763/0.8732**, both inside cream ±0.015 |
| `ui/e2e/authored-stage-proof.spec.ts` (+105) | adoption e2e |

---

## 2. What the original Stage A contract keeps — verified, not assumed

Every file below is **byte-identical** between `4a3025e` and `36670a3`
(`git diff --quiet 4a3025e 36670a3 -- <path>` for each):

`ui/src/lot/scene/palette.ts` · `stageSpec.ts` · `assets.ts` · `LotScene.ts` · `layout.ts` ·
`iso.ts` · `ui/src/lot/flags.ts` · `scripts/art/authored-asset-pipeline.py`

Therefore, carried forward unchanged: `BuildingId stage-a` · footprint 4 × 4 · canvas
**512 × 368** · `originY 0.6521739130434783` · ground centre (256, 240) · grid origin `gx 15,
gy 2` · depth 404 · selection · navigation · overlays and the baked/runtime-owned split ·
`underDressed` semantics · the Engine / SaveFile / `StudioLotSnapshot` boundary · the **buff**
family and its target · camera, projection and `CAMERA-CONTRACT.json`.

The source-authority repository strategy is **proven workable** and is retained.

---

## 3. Why Concept C is closed

Concept C is frozen permanently: application proof `997e46d`, source
`8b0e28b670003e7b6599a6eb07b146aa7f2ee4e0`. Not amended, not re-rendered, not re-exported, not
re-graded, not corrected, not deleted.

**It was NOT rejected for copy-paste similarity.** A blind reviewer, told nothing, called it and
current Stage B *"two different buildings"* at **92 %** and explicitly **not** derivative. The
roof-axis repetition is real but was never the problem.

It is closed because:

- **A.** Current-production Stage B changed the class and finish comparison entirely.
- **B.** It no longer reads as a peer-quality filming stage. *"Building 2 reads as a warehouse,
  hangar, or agricultural shed. Told they were both filming stages, I would not have guessed it
  from Building 2."*
- **C.** Its deliberately sparse art now reads unfinished. *"Building 2 reads as Building 1 with
  everything removed… a greybox proxy or an unfinished blockout sitting next to a finished
  asset, not as a peer design."*
- **D.** Its only intrinsic numerical defect — buff face ratio 0.8918 / 0.8878 against
  0.858894 ± 0.015 — was caused by 128-colour FASTOCTREE PNG-8 merging authored roof tones with
  wall tones. **Production has since abandoned that export path for exactly that class of
  damage.** Correcting it would have been tuning an asset to survive a pipeline production no
  longer uses.

### Reusable evidence Concept C did establish

Twin-vault construction is geometrically sound · roof eave→crown ramp monotonic
(181.45 → 202.01 → 216.22) · valley reads as a valley, not a crack · roof bands survive the
management camera · ground/anchor passes (max +1.0 px, 0 columns off by >1) · raw normal/worn
geometry delta 0 px · **clickable-mask delta 0 px** · deterministic source authority worked
(3-run byte-identical) · the generator-as-source-of-truth pattern worked.

---

## 4. The current production export contract — reproduced from the bytes

Derived from the shipped assets, `authored-stage.test.ts`, and `fdfdfea`'s provenance. **Not
inferred from the phrase "colour-quantised".**

| | current production Stage B | frozen Concept C (PNG-8) |
|---|---|---|
| PNG colour type | **6 — truecolour RGBA** | 3 — palette |
| Bit depth / interlace | 8 / none (asserted by test) | 8 / none |
| Chunks | `IHDR IDAT IEND` — **no PLTE, no tRNS** | `IHDR PLTE tRNS IDAT IEND` |
| Distinct RGB, alpha > 0 | **128** | 49 |
| Distinct RGB, alpha > 200 | **128** | **26** |
| Distinct alpha values | **229** | 47 |
| Fully opaque (α = 255) px | **103,021** | 889 |
| Soft edge (α 1–249) | 2.63 % | 1.85 % |
| Pair bytes | 116,051 | 8,053 |

**Operationally:** the RGB channel is colour-reduced to a 128-colour set; the result is written
as full 8-bit RGBA truecolour, so **alpha is never forced through a shared palette** and survives
losslessly. That is the whole difference. PNG-8 must encode RGB *and* alpha jointly in 128
entries, which is why Concept C retained only 26 distinct wall/roof colours and almost no
exactly-opaque pixels.

- **Colour handling:** 128-colour reduction, stored truecolour. No dithering evidence in the
  bytes (flat fields are flat).
- **Alpha handling:** lossless, 229 distinct values, per-pixel. **Bit-exact between normal and
  worn (0 differing pixels)** — a deliberate fix, because `LotScene` swaps the under-dressed
  texture without re-running `setInteractive`, so a differing alpha map silently changed the
  hit area. The superseded pair differed in 8,652 alpha pixels.
- **Command / path:** the shipped files were **copied verbatim** from the strike-team
  adoption-pack `opt/` exports. **There is no in-repo runnable command for the current export
  path.**
- **Determinism:** the standard's `verify --runs 3` baseline still refers to the *superseded*
  PNG-8 pair. Re-baselining is explicitly deferred in the standard's own text.
- **`scripts/art/authored-asset-pipeline.py`:** unchanged, and still production for
  **`measure`** — `fdfdfea` graded Stage B with it. Its **`quantize` / `verify` (PNG-8 export)
  is now historical/diagnostic only**, not the production export path.

> **Open risk, inherited, flagged not fixed.** The current production export has recorded
> hashes but no reproducible in-repo command — the exact failure lesson **AU** already names
> ("a recorded hash is not a reproducible process"). The PNG-8 path had one; the path that
> replaced it does not. **This should be closed before the next Stage A export**, or Stage A
> will be the second building whose bytes cannot be regenerated from the application repo.

---

## 5. Current Stage B — reference grammar, not a template

Measured at the management camera (zoom 0.3261) and at 1:1.

| tier | forms |
|---|---|
| **PRIMARY** | one broad glazed barrel vault on the `+gy` axis · raised clerestory monitor along the ridge · stepped Deco front block · oxblood elephant door · lower flanking office/loading wing |
| **SECONDARY** | mullion rhythm across the vault glazing · stepped cornice and parapet · rosette medallion over the entrance · brass/gold banding courses · wing glazing band · base course |
| **TERTIARY** | door leaf panels · small side door · dock/crate at the base · fine trim reveals |

- **Roof grammar:** curved, glazed, *and* topped by a second raised volume — a compound roof
  that breaks the skyline 4–5 times and gives the building a clear front.
- **Entrance grammar:** ceremonial. Accent-coloured door, framed, medallion above, cornice over,
  with a human-scale door nearby for scale contrast.
- **Glazing grammar:** the roof glazing is the building's signature; wall glazing is confined to
  the subordinate wing.
- **Deco/trim grammar:** brass-tone banding, stepped cornices, one circular motif. Restrained but
  everywhere.
- **Value hierarchy:** cool pale green-grey roof against warm cream walls, plus one saturated
  accent (oxblood). Three-way separation.
- **Management-camera density:** roughly **7 readable elements**. Frozen Concept C shows **4**.
- **Class signals:** door ceremony + scale contrast + glazed clear-span roof + production apron.
- **Registration:** it does **not** fill its footprint diamond. Left inset **18 px**, right inset
  **31 px**, lowest opaque row **364** (9 px above the near apex), locked by test 15. Frozen
  Concept C measured left inset **0**, right inset **0**, lowest opaque row **367** — it filled
  the tile edge to edge, which is part of why it reads as bulk rather than as a designed object.

---

## 6. Revised Stage A requirements

### 6.1 Class-legibility gate (HARD)

> **With all stage labels and signage removed, the architecture alone must read as a film
> soundstage.**

A candidate that reads primarily as a warehouse, storage shed, generic hangar, office or
background scenery **fails**, even with correct geometry, palette and projection. This is not a
new idea — lesson **AX** already records that a masked stage which read as "factory/depot" was
rejected on exactly this basis. Concept C failed a test the project had already learned.

### 6.2 Peer-finish gate (HARD)

> **Stage A may be calmer than Stage B. It may not look less finished.**

Different density is allowed; prototype-vs-production disparity is not. Judged at the primary
management camera, the question is *"do these look like two intentionally different
production-asset soundstages?"* — never *"do they have the same number of details?"*

Operationally: **≥ 6 readable elements at the management camera**, at least two of which do
class/finish work rather than massing work; a deliberate registration (inset + forecourt) rather
than filling the tile; and at least one accent or trim hierarchy that is not the wall tone.

### 6.3 What Concept C proved was missing

no convincing front hierarchy · almost no entrance ceremony · no accent/trim hierarchy · no
glazing identity · insufficient secondary architecture · a rectangular extrusion that reads the
same from too many sides · no peer-level authored finish.

So the next Stage A **must** have: **A** a clear front · **B** an architectural hierarchy ·
**C** an entrance that reads as a working film stage · **D** secondary forms that survive
management scale · **E** enough authored finish to sit beside current Stage B.

And must **not** copy Stage B's barrel vault, clerestory monitor, stepped front, oxblood/brass
treatment, office wing, rosette, or facade layout.

---

## 7. Three new hypotheses — WRITTEN ONLY, NOT RENDERED

All three: keep `4 × 4 / 512 × 368 / originY 0.6521739…`, hold the buff family at
`0.858894 ± 0.015` on the current export representation, reserve the runtime signage zone at the
near corner and the door opening, contain no concentric shrinking rhombi and no non-monotonic
roof ramp, and adopt a deliberate inset registration with a forecourt rather than filling the
diamond.

### H1 — "Northlight Row" — a newly authored sawtooth stage

- **Primary silhouette:** four shallow sawtooth teeth running along **`+gy`** — *perpendicular*
  to Stage B's vault axis — behind a full-height blank screen wall on the lit face whose stepped
  top hides the roof from the primary approach.
- **Roof system:** north-light sawtooth with the glazed faces turned toward **`+gx`** (shadow),
  so glazing reads as dark recessed slots, not bright bands — the inverse of the superseded
  Stage B's read.
- **Visible front:** the screen wall. Flat, tall, with a stepped parapet.
- **Elephant door:** wide, centred, deep recessed reveal, projecting canopy on exposed brackets.
- **Entrance hierarchy:** screen wall → canopy → door → personnel door.
- **Glazing:** roof only; no wall glazing.
- **Secondary:** external fire stair on the shadow flank, loading-dock lip, banded base course.
- **Deco:** flat pilaster strips on the screen wall, one horizontal banding course.
- **Lit/shadow:** a large flat lit screen against a serrated shadow flank — a strong two-part read.
- **Class signal:** north-light sawtooth is unambiguous industrial-workshop grammar; the door
  ceremony supplies the film-stage half.
- **Differentiation:** perpendicular roof axis, angular vs curved, hidden roof vs displayed roof.
- **Density:** medium-high.
- **Risk:** the *superseded* Stage B was sawtooth. Even though production no longer owns that
  grammar, it may read as regression to a retired design; and four teeth risk busyness at the
  management camera.

### H2 — "Stage Front" — a clear-span mass whose identity is its entrance

- **Primary silhouette:** one tall clear-span box under a flat deck behind a low parapet, with a
  **monumental frontispiece** that projects and rises above the parapet, framing the elephant
  door. The skyline is flat except for the frontispiece.
- **Roof system:** deliberately quiet — a flat deck, visible only as a sliver. **Stage B's
  identity is its roof; Stage A's is its front.** Complementary rather than competing.
- **Visible front:** unmistakable. The frontispiece is the building.
- **Elephant door:** the tallest opening on the lot, in a deep reveal, flanked by two blunt
  pylons; a human-scale personnel door immediately beside it. **The scale contrast between the
  two doors is the class signal.**
- **Entrance hierarchy:** frontispiece → pylons → canopy → elephant door → personnel door.
- **Glazing:** almost none — a sealed stage. One narrow clerestory band high on the shadow flank.
- **Secondary:** loading-dock lip and apron, banded base course, fire stair on the shadow flank,
  a horizontal accent band across the frontispiece.
- **Deco:** restrained vertical fluting on the pylons; one accent-tone band. **Not** Stage B's
  brass-and-rosette vocabulary.
- **Lit/shadow:** the frontispiece projects, so it throws a real value step onto the lit face —
  a strong corner and a strong front in one move.
- **Class signal:** windowless clear-span bulk + a door big enough to admit built scenery +
  human door for scale + apron. This is what a Golden Age soundstage actually is.
- **Differentiation:** roof-led vs front-led. Cannot be confused at any distance.
- **Density:** concentrated — high investment in one place, calm elsewhere. Legitimately calmer
  than Stage B without being less finished.
- **Risk:** a flat-roofed box can drift toward office/warehouse — the original Concept B failure
  mode. Mitigated by door scale, sealed walls and the apron, but it must be **proven at the
  management camera with signage masked**, not assumed.

### H3 — "Twin-Gable Stage" — the angular sibling of Concept C

- **Primary silhouette:** two steep parallel **gables** along `+gy` with a deep central valley —
  keeps the twin-mass read that measurably survived the management camera, but replaces curvature
  with hard angular planes so it cannot be read as Stage B's barrel.
- **Roof system:** two real ridged gables; monotonic eave→ridge ramp per slope by construction.
- **Visible front:** the twin gable ends form a bold **W** on the lit face.
- **Elephant door:** offset under the near gable, projecting canopy; a tall louvred panel under
  the far gable so the two bays differ.
- **Entrance hierarchy:** gable end → canopy → door.
- **Glazing:** a glazed lunette in each gable end.
- **Secondary:** raked verge boards on the gable ends, eave band, base course, fire stair.
- **Deco:** angular verge treatment, one banding course.
- **Class signal:** moderate — carried mostly by the door and the twin bays.
- **Differentiation:** angular vs curved; W-profile vs compound vault-and-monitor.
- **Density:** medium.
- **Risk:** the gable is already the lot's most common roof (Writers, Casting, Theater). At
  management scale a twin gable may read as an oversized cottage or barn — the original Concept
  A risk, and adjacent to the failure Concept C just suffered.

### §17 family test, answered per hypothesis

| | H1 Northlight Row | H2 Stage Front | H3 Twin-Gable |
|---|---|---|---|
| **A** why it reads as a stage | industrial north-light workshop + door ceremony | sealed clear-span bulk + elephant/personnel door scale contrast + apron | twin bays + door, weakest of the three |
| **B** why Stage B reads as a stage | glazed clear-span vault + ceremonial oxblood door + apron | same | same |
| **C** what makes them family | buff/cream stucco family, 2:1 dimetric, orientation shading, elephant-door grammar, apron, restrained Deco | same | same |
| **D** primary silhouette difference | perpendicular serration vs longitudinal curve | flat front-led skyline vs compound roof-led skyline | angular W vs curved compound |
| **E** what stops it reading as an unfinished version of Stage B | it invests in a screen wall + canopy + fire stair Stage B does not have | **it invests equally, in a different place** — the frontispiece is authored density Stage B has no counterpart for | weakest — a twin gable with lunettes is close to "Stage B with the ornament removed" |

**H3 cannot answer E convincingly and is rejected on that basis**, per §17.

---

## 8. Recommended concept

**H2 — "Stage Front".**

- It fixes the **actual** failure. Concept C died on class legibility and finish parity, not on
  roof geometry. H2 attacks both directly and puts its authored investment where the class signal
  lives.
- It is **complementary, not competing**: Stage B's identity is its roof, H2's is its front. That
  is a real architectural family relationship, not a variation on one idea.
- The **elephant-door / personnel-door scale contrast** is the single strongest unlabelled
  soundstage signal available, and it is exactly what Concept C lacked.
- It is the only one of the three that can answer §17.E convincingly — its density is equal to
  Stage B's and placed somewhere Stage B has nothing.
- Its risk (office/warehouse drift) is **measurable at the management camera with signage
  masked**, which is a gate we already run, rather than a matter of taste.

H1 is the fallback: honest, distinct, and it now owns a grammar production has vacated — but it
carries a real regression-optics risk. H3 is rejected.

---

## 9. Source-authority continuation plan

`HSpector1/project-studio-art-source` (**private**) is retained and **not modified by this
refresh**. Concept C stays frozen at `8b0e28b`.

Proposed continuation, for authorization with the next Art build (**not created now**):

- Keep `stage-a/` as Concept C's frozen record. Do **not** overwrite it.
- The next concept lands as **`stage-a-h2/`** (or the authorized concept's slug) in a **new
  normal commit** on `main`, so history is additive and both candidates remain diffable.
- `MANIFEST.json` in the new directory cross-references Concept C's commit as its predecessor,
  with the closure rationale, so the lineage is legible without reading this document.
- No force push, no rewrite, no deletion. Private throughout.

---

## 10. Updated Art / evidence gate

Changes from the original preflight §11:

- **Final-output authority is the CURRENT production export representation** (8-bit RGBA
  truecolour, colour-reduced RGB, lossless alpha) — **not** a PNG-8 intermediate.
- **Do not design around 128-colour FASTOCTREE.** Author the correct art; evaluate the
  production-safe export afterwards (lesson **AY**). Tone separation must not be chosen to dodge
  a retired constraint.
- **Rec.601 luma over 8-bit encoded sRGB remains canonical** — the standard's §1 is unchanged at
  `36670a3`. Buff target **0.858894**, tolerance **±0.015**, window **0.843894 – 0.873894**,
  recomputed from `palette.ts` at build time.
- **Alpha standard (revised):** require **raw geometry identical**, **clickable mask identical**
  (`alpha > 0`, exactly what `alphaTolerance: 1` selects), and **silhouette identical**. Encoded
  alpha values may differ if the production export legitimately does so and interaction is
  unchanged. Note that current Stage B achieves full bit-exactness, which the RGBA path makes
  *easier* than PNG-8 did; bit-exactness is preferred but not the governing requirement.
- **Registration is now gated.** Declare and measure inset, lowest opaque row and centroid, as
  `authored-stage.test.ts` test 15 does for Stage B. Filling the footprint diamond edge-to-edge
  is a design decision that must be made deliberately, not by default.
- **Blind-review protocol (revised):** management camera first, closest legitimate framing
  second, signage masked in canvas *and* companion nav, no dev chrome, one independent reviewer
  who is not told which building is which. Ask class legibility (*"what kind of building is
  this?"*, unprompted, before any comparison) **before** differentiation. Concept C passed
  differentiation and failed class — asking in that order would have caught it earlier.
- Wheel zoom remains **out of scope** and must not be fixed; use the existing framing presets.

---

## 11. Stop conditions

| condition | state |
|---|---|
| Current production authority unverified | **CLEAR** — local = tracking = live remote = `36670a3`, clean |
| Stage A runtime contract changed | **CLEAR** — no runtime source file changed; all contract files byte-identical |
| Buff target not reproducible | **CLEAR** — `palette.ts` unchanged, 0.858894 stands |
| Measurement space changed | **CLEAR** — Rec.601 encoded sRGB still canonical |
| Export representation unresolved | **CLEAR** — derived from the shipped bytes, §4 |
| Export **command** reproducible | **NOT CLEAR — open risk.** No in-repo runnable command for the current path (§4). Should be closed before the next Stage A export |
| Concept set re-derived against current Stage B | **CLEAR** — §7 |
| Concept requires Engine/save/schema change | **CLEAR** — none of H1/H2/H3 does |
| External art | **CLEAR** — none used or consulted; no quarantine art directory opened |

---

## 12. Recommendation

**Authorize a new Stage A offline art concept on H2 — "Stage Front"**, with H1 as the fallback
and H3 rejected.

Before the first render, close or explicitly accept the one open risk in §11: the current
production export path has no reproducible in-repo command.
