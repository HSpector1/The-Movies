# Authored Stage A — H2 "Stage Front" — production-adoption candidate

**Status: ADOPTION CANDIDATE. PASSES. NOT MERGED.
ART DIRECTOR FAST-FORWARD PRODUCTION DECISION REQUIRED.**

This document records the **production-adoption** checkpoint: can the accepted authored art
become the *normal* presentation of Stage A without regressing gameplay truth, fallback,
state, interaction, accessibility, performance, Stage B or production architecture?

The art is **not** under design review here. It was accepted at Bounded Correction 1 and is
shipped byte-for-byte unchanged.

> **Prior checkpoints are historical and are not rewritten.**
> [`…OFFLINE-ART-PROOF.md`](AUTHORED-STAGE-A-H2-OFFLINE-ART-PROOF.md) — offline art acceptance.
> [`…RUNTIME-PROOF.md`](AUTHORED-STAGE-A-H2-RUNTIME-PROOF.md) — runtime proof (Candidate 1
> failed the art gate; Bounded Correction 1 passed it). This document governs the later state.

---

## 1. Lineage

| Link | Value |
|---|---|
| Production authority (peer) | `5e19b25eb67e5c689ca60248dc7cf5efbda95f6d` |
| Production worktree | `/Users/bruce/The Movies - Packet Hardening Propagation` |
| Offline art proof | `b5bcdfc2a385fc2d7e85c65f94023bffbadca117` |
| Runtime proof, Candidate 1 | `7758cb9df25163f00eb7fba354750dd0120c18ab` |
| **Runtime proof, accepted** | `1fba98e010cf09106ae9f76b118e0bf1c14cb285` — pushed to `hspector-github`, frozen |
| Art source, Candidate 1 | `c0b630622b5cabb4310e6058836e8cb5cab21e0f` |
| **Art source, accepted** | `3e7e4f7e772398312b3262689bf2f97eb1623334` — `stage-a-h2-stage-front`, private remote, frozen |
| Adoption branch | `art-adopt-stage-a-h2`, based on `1fba98e` |

`5e19b25` is an ancestor of `1fba98e` (verified), so the adoption branch is a fast-forward
candidate for `main`.

## 2. The adopted assets — exact accepted bytes

| Asset | SHA-256 | Bytes |
|---|---|---|
| NORMAL `ui/public/lot/b-stage-a-h2.png` | `98d4191c04a6a08fb3b252f508215e88649b4c7693e8a9375174a2f1d47ca0b9` | 73,067 |
| WORN `ui/public/lot/b-stage-a-h2-ud.png` | `2ed088351b6a60c0a06f6b86cd4100e339e33a8df3d6c8172dc3fca03a85f5d4` | 69,326 |

Byte-identical to `MANIFEST.json → candidate_final_assets` at source `3e7e4f7`. **Nothing was
regenerated, re-exported or re-encoded during adoption.** 512×368, PNG **colour type 6**,
8-bit truecolour RGBA, no `PLTE`, no `tRNS`, alpha lossless, 128 distinct RGB.

Production Stage B, read from `main` and unchanged: `aa375a00…e7b` / `1d6ac5e5…c795d`, also
colour type 6.

The filenames keep the `-h2` stem deliberately: it records *which* authored concept shipped,
and the accepted source authority sits behind exactly that name.

## 3. Production semantics — the gate is inverted

The proof shipped a **default-OFF** switch. Production ships adopted content, so the flag was
**replaced, not re-polarised** — a flag whose name says "H2 proof enabled" while its absence
*also* loads H2 is precisely the ambiguity this project does not keep.

| | proof (`1fba98e`) | **adoption** |
|---|---|---|
| function | `studioLotStageAH2Enabled()` | `studioLotAuthoredStageAEnabled()` |
| key | `…flags.studio-lot-stage-a-h2` | `…flags.studio-lot-authored-stage-a` |
| env | `VITE_STUDIO_LOT_STAGE_A_H2` | `VITE_STUDIO_LOT_AUTHORED_STAGE_A` |
| helper | `setStudioLotStageAH2Override(on)` | `setStudioLotAuthoredStageARollback(rollback)` |
| absent | procedural | **authored** |
| explicit | `'1'` → authored | `'0'` → procedural |

This is character-for-character the shape `studioLotAuthoredStageEnabled()` has shipped since
Stage B's adoption, including the `catch` that keeps a private-mode player on the authored
default rather than silently rolling them back. No new abstraction, no multi-building
framework: two buildings, two sibling functions, exactly as production already did it.

| Condition | Result |
|---|---|
| No override | **authored H2 Stage A** |
| No override + `underDressed` | **authored H2 worn** |
| Explicit rollback `'0'` | procedural Stage A, **and no authored fetch at all** |
| Explicit rollback + `underDressed` | procedural worn |
| Authored **normal** unavailable | procedural Stage A |
| Authored **worn** unavailable | procedural Stage A — the whole building, never a half-authored state |

The re-point guard is `authoredStageA && distinctStages && textures.exists(NORMAL) &&
textures.exists(WORN)` — gated on the textures **arriving**, not on the flag. That is why a
failed fetch cannot leave a hole, and why a worn-only failure cannot leave the normal authored
texture standing in for an under-dressed stage.

**The procedural Stage A is retained in full** as the safety fallback and the developer
rollback. It is not dead code: two of the twelve matrix cases render it.

## 4. Gameplay identity — unchanged

`pointStageAAtAuthored()` overrides **only** the texture `key`. Footprint, anchor, grid, plinth,
depth key, hit polygon and every overlay position carry over from the procedural registry entry.

| Invariant | Status |
|---|---|
| `BuildingId` remains `stage-a` | **UNCHANGED** — no `stage-a-h2` / `stage-front` gameplay identity |
| Grid, footprint, origin, depth | **UNCHANGED** |
| `StudioLotSnapshot`, save, schema, Engine | **UNTOUCHED — 0 paths** |
| Selection, hover | **UNCHANGED** — pixel-perfect, `alphaTolerance: 1` |
| Navigation, accessibility, View Production | **UNCHANGED** — canvas stays `aria-hidden`, companion nav is the accessible truth |
| Active-production / idle / closed / `underDressed` truth | **UNCHANGED** |
| Runtime-owned presentation | **UNCHANGED** — STAGE A text, plaque, attention, recording light, production tag, door glow, title board, gear, cart, crates, lights, cones, van, characters, ground shadow, plinth, apron, state tint, closed alpha are all still drawn by the runtime; **nothing is baked into the art** |

## 5. Fetch behaviour, measured

| Configuration | Stage A requests |
|---|---|
| Production default | exactly `b-stage-a-h2.png`, `b-stage-a-h2-ud.png` |
| Explicit rollback | **none** — `preload()` returns before queueing, so a rolled-back building costs nothing |
| Normal aborted | the failed request, then procedural stands |

The rollback guard is the pre-existing production `preload()` shape; no preload architecture was
redesigned to save requests.

**One narrow diagnostic change.** `FILE_LOAD_ERROR` previously set a single Stage-B-named
`authoredStageLoadFailed` for either building. With two authored buildings both shipping by
default that would report a Stage A failure as a Stage B failure, so failure is now attributed
per building (`authoredStageALoadFailed`) and surfaced on the dev panel. Diagnostics only — the
fallback itself is driven by `textures.exists()` and never by these fields — and it is asserted
by adoption test 5.

## 6. Release evidence

`out/stage-a-adoption-evidence/` — 11 frames + 6 JSON, captured at **production semantics**
(no override), **0 dev-chrome-contaminated frames**.

| Frame | Item |
|---|---|
| `A/B/C-management-{1280,1440,1920}.png` | management, three viewports |
| `D-closest-framing.png` | closest legitimate framing |
| `E-normal.png` · `F-worn.png` | state pair |
| `G-selected.png` · `H-active-production.png` | interaction / active state |
| `I-stage-a-and-stage-b.png` | whole frame with current Stage B |
| `J-explicit-rollback.png` | the developer rollback |
| `K-fallback-missing-normal.png` | missing-asset fallback |

Candidate 1 and the correction packages are preserved unmodified as
`out/stage-a-h2-evidence-candidate-1/` and `out/stage-a-h2-evidence/`.

## 7. Independent release review

One reviewer, all ten release frames, asked for blockers rather than a wish list.

| # | Question | Answer |
|---|---|---|
| 1 | Production-ready at the management frame | **Yes** — clean silhouette at 1280/1440/1920, reads at a glance, no scaling artefacts |
| 2 | Belongs beside the shipped centre building | **Yes** — "two buildings from one lot, not two art styles" |
| 3 | Reads as a working soundstage without its sign | **Yes** — "the sign confirms which stage it is; it is not what makes it a stage" |
| 4 | Normal or worn incorrect | **No** — worn matches the treatment shipped Stage B receives in the same frame |
| 5 | Overlays sit correctly | **Yes** — active marker, production card and STAGE A pin all anchored as Stage B's are; card edge-clamping at 1920 happens to Stage B too, so it is the HUD, not the art |
| 6 | Misaligned / clipped / pasted-on / unfinished | **No** — iso axes track at all sizes, base meets the apron, z-order correct against road and props, no seams or halo |
| 7 | **Blocker** | **No.** "The safety net holds… no pink texture, no hole, no gap. Ship it as default." |

### A claimed blocker, investigated and refuted

The reviewer flagged the `G-selected` capture as an evidence gap — correctly: `shot()` was
closing the details panel before the screenshot, and closing it also calls `clearSelection()`,
so the frame showed neither the panel nor any selection state. **That was a harness bug, and it
was fixed** (`keepPanel`), and the frame re-captured; it now differs from the unselected frame
by 10.4 %.

A second, narrower reviewer then examined the corrected frame and returned a **blocker**: "the
selected state applies no highlight to Stage A, while a brightening appears on Stage B."
**Measurement refutes both halves:**

- Differencing the selected and unselected frames and localising the result: **99.1 %** of the
  changed pixels lie in `x 0–479` — the semi-transparent details panel, which overlays that
  part of the canvas. The "brightening on Stage B" is that panel, not a mis-targeted highlight.
- Amplifying the difference in Stage A's own neighbourhood (predicted from the lot's camera
  maths at screen ≈ (730, 314)) resolves a clean **V-shaped footprint outline** on Stage A —
  448 differing pixels, peak channel delta 128. The selection treatment **is** rendering.
- It is faint by product design: `refreshHighlights()` draws it at **alpha 0.05**, and it is
  drawn from `view.spec` — the **footprint**, not the texture — inside a loop over *every*
  building. It is therefore provably identical for Stage B, procedural Stage A and authored
  Stage A, and **cannot** be affected by an art swap.

**Disposition: not a blocker and not an adoption regression.** That the selection outline is
hard to see at management zoom is a pre-existing product decision affecting every building
equally; it is recorded here for the Director and is out of scope for an art adoption.

## 8. One-sprite / depth — PASS WITH OBSERVATIONAL LIMITATION

Carried forward unchanged, and no new evidence was manufactured. One sprite, existing container
depth, no segmentation. The reviewer found no clipping, floating or sort error. The limitation
stands and is not overclaimed: Stage A's ambient routes are authored **in front of** the
building, so no legitimate route produces a true behind-body crossing to exercise.

## 9. Performance — production main vs adoption candidate

| Metric | Result |
|---|---|
| `displayObjects` | **143 → 143, delta 0** (hard guard +10) |
| FPS @ 1280 / 1440 / 1920 | authored **57 / 55 / 49** · procedural **57 / 55 / 49** — no change |
| Scene-ready median | procedural 825 ms · authored 837 ms (**+12 ms**, inside run-to-run spread) |
| Texture count | **+2** vs procedural Stage A |
| Texture memory | **+1,507,328 B** (1.44 MiB — 512×368×4×2) |
| Asset payload | **142,393 B** (73,067 + 69,326) |
| Build output | JS **+1.02 kB** raw / **+0.24 kB** gzip vs `5e19b25`; CSS byte-identical |

## 10. Second-building reviews

### Value tolerance — **KEEP ±0.015**, now confirmed rather than conditional

Stage A is the promised second authored-building evidence point. Every finish measured against
its **own** family target, never across families:

| building | family | target | measured | deviation |
|---|---|---|---|---|
| Stage B, normal (Option D) | cream | 0.8737 | 0.8763 | **0.0026** |
| Stage B, worn | cream | 0.8737 | 0.8732 | **0.0005** |
| Stage A, normal | buff | 0.8589 | 0.8655 | **0.0066** |
| Stage A, worn | buff | 0.8589 | 0.8638 | **0.0049** |

Worst current-path deviation **0.0066** — 44 % of the bound. Not widened (two buildings is not
a licence to relax) and not tightened: the bound is not binding, tightening below `0.0123`
would retroactively invalidate the standard's own derivation datapoint (pinned by test 7 of
`authoredValueStandard.test.ts`), ±0.015 is ≈1.5 % of displayed luma and invisible at the
management camera, and both authored buildings so far are soundstages in adjacent warm
families — taupe and slate remain unauthored. A concrete re-review trigger is now recorded in
the standard. Full reasoning: `AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md` §2.

### Source workflow — **ADOPT AS CANONICAL**

The private Art Source repository convention becomes canonical for authored hero buildings.
The deciding evidence is a contrast, not a preference: **Stage B has no durable authored source
anywhere**, so its art cannot be re-derived or corrected — while Stage A's bounded correction
was a re-run of a frozen deterministic generator against a named source commit, landing as a
6-file additive commit with the value contract returning bit-identical. Recorded narrowly in
the standard as new **§5A**, scoped to authored hero buildings only. **Stage B is not
migrated** — re-opening closed work for no product benefit; it is the counter-example instead.

### Export path — second building, no building-specific handling

| Question | Evidence |
|---|---|
| Was default `rgba-export` sufficient? | **Yes** |
| Was `--protect` used? | **No** — `protect_list_used: NONE` |
| Did protected repair fire? | **No** — 0 protected fields, 0 pins |
| Did the 128-RGB output preserve the art? | **Yes** — colour error mean **0.067**, max **7.35**; exactly 128 distinct RGB; alpha bit-exact; deterministic over 3 runs |

Two buildings, two families, zero building-specific protection: useful evidence that the
recovered §3A path is generic rather than tuned to Stage B.

## 11. Validation

| Gate | Result |
|---|---|
| Stage A adoption e2e matrix | **13 / 13 PASS** |
| Stage A unit (`authored-stage-a.test.ts`) | **17 / 17 PASS** |
| Stage A wiring (`authored-stage-a-wiring.test.tsx`) | **3 / 3 PASS** |
| Stage B authored tests | **PASS** |
| RGBA export tests | **PASS** |
| Authored value-standard tests | **PASS** |
| Full unit suite | **1125 / 1125 PASS**, 88 files |
| Core typecheck · UI typecheck | **PASS** (exit 0) |
| Production build | **PASS** (exit 0) |
| Full Playwright / e2e | **103 passed, 0 failed, 0 flaky** |
| `git diff --check` | clean |

No test was weakened. The gate assertions were **inverted to match the inverted gate** — that is
the point of the adoption — and one test was **added** (private-mode storage failure must not
silently roll a player back to procedural). The stub loader in the wiring test gained the `on`
handler the production code now uses, so a new loader call surfaces as a failure rather than
being silently absorbed.

## 12. Recommendation

**The adoption candidate passes.** Authored default works, explicit rollback works, both
load-failure paths fall back to a complete procedural building, Stage B is untouched, identity
and state are unchanged, accessibility is unchanged, performance is unchanged, the art bytes are
the exact accepted authority, and the independent release review found **no blocker**.

**Production merge remains unauthorised and is the Director's call.** The branch is a
fast-forward candidate: `5e19b25` is an ancestor of the adoption tip. No merge, no PR, no tag.
