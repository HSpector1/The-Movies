# Authored Stage A — H2 "Stage Front" — runtime integration proof

**Status: BOUNDED CORRECTION 1 APPLIED AND PASSED. NOT ADOPTED.
ART DIRECTOR PRODUCTION-ADOPTION REVIEW REQUIRED.**

> **Reading order.** §1–§11 below are the **Candidate 1** record and are preserved
> unedited: runtime pipeline PASS, glazing FAIL, management class-legibility weakness.
> **§12 is the Bounded Correction 1 checkpoint** and supersedes §9's watch-item rulings
> and §11's recommendation. Candidate 1 is not rewritten as though it never failed —
> it failed, the failure was the point, and the correction is a separate, later gate.

---

## Candidate 1 — the record, preserved

**Status at the time: RUNTIME PIPELINE PASSES. MATERIAL ART DEFECT FOUND — BOUNDED
CORRECTION REQUIRED. NOT ADOPTED.**

This document records the **runtime-integration** checkpoint. It is a *separate gate* from the
offline-art checkpoint recorded in
[`AUTHORED-STAGE-A-H2-OFFLINE-ART-PROOF.md`](AUTHORED-STAGE-A-H2-OFFLINE-ART-PROOF.md), which
remains unamended and still governs offline **art acceptance**. This document governs the later
state; where the two differ in inventory, this one is current.

> **Offline art acceptance ≠ runtime integration acceptance.** The offline gate asked whether the
> authored candidate was a valid piece of art. This gate asks whether the *exact frozen* candidate
> survives the real Phaser lot. It did, technically. It did not, artistically, on one item.

---

## 1. Authorities

| Authority | Value |
|---|---|
| Production authority (peer) | `5e19b25eb67e5c689ca60248dc7cf5efbda95f6d` |
| Production worktree | `/Users/bruce/The Movies - Packet Hardening Propagation` |
| Verified at resume **and** before grading | local `main` = tracking `main` = live remote = `5e19b25`, worktree clean |
| Application proof branch | `art-authored-stage-a-h2-offline-proof` |
| Pre-runtime committed base | `b5bcdfc2a385fc2d7e85c65f94023bffbadca117` (documentation only) |
| Art source repository | `HSpector1/project-studio-art-source` (**private**) |
| Art source branch | `stage-a-h2-stage-front` |
| **Frozen** Art source authority | `c0b630622b5cabb4310e6058836e8cb5cab21e0f` — unchanged, clean, **0** commits after |
| Concept C | frozen at `8b0e28b` / proof `997e46d`, untouched |

**No Art was authored, re-rendered or corrected during this checkpoint.** No generator, `.blend`,
raw render, final export, roof, glazing slot, facade, door, palette, MANIFEST or PROVENANCE was
touched. The exact frozen candidate entered the runtime.

## 2. The runtime assets

Copied verbatim from the frozen source; re-verified against the source MANIFEST immediately before
commit.

| Asset | Path | SHA-256 | Bytes |
|---|---|---|---|
| NORMAL | `ui/public/lot/b-stage-a-h2.png` | `eefad8ad5239c663c55c61c0ae8ac64485476188957be75bacbed37beeeaae5c` | 72,415 |
| WORN | `ui/public/lot/b-stage-a-h2-ud.png` | `cdfe79115b51cd21f568da13af23eec26acc784ef8d9edf185f2fac7a9ea6aba` | 72,264 |

Both **EXACT MATCH** to `stage-a-h2-stage-front/MANIFEST.json` → `candidate_final_assets`
(`b-stage-a.png` / `b-stage-a-ud.png`) at source `c0b6306`. 512×368, PNG **colour type 6**, bit
depth 8, non-interlaced, no `PLTE`, no `tRNS` — the current production RGBA path (standard §3A),
not the historical PNG-8 path.

The runtime filenames carry an `-h2` stem so the proof can never overwrite the production
`b-stage-a` identity. The *bytes* are identical to the accepted export.

Production Stage B re-verified **unchanged**: `aa375a00…e7b` / `1d6ac5e5…c795d`.

## 3. Proof flag semantics

`ui/src/flags.ts` — `studioLotStageAH2Enabled()`; key
`project-studio.flags.studio-lot-stage-a-h2`; env `VITE_STUDIO_LOT_STAGE_A_H2`.

Deliberately the **opposite polarity** to the adopted Stage B gate. Stage B's authored art is
player content, so absence means ON and `'0'` rolls back. H2 is a **proof**, so absence means OFF
and an explicit `'1'` turns it on.

| Condition | Behaviour | Status |
|---|---|---|
| No override (default) | procedural Stage A; **no H2 image requested at all** | **COMPLETE** |
| Explicit ON | authored H2 Stage A | **COMPLETE** |
| Explicit OFF | procedural Stage A, no authored fetch | **COMPLETE** |
| Asset load failure | procedural Stage A fallback, lot fully functional | **COMPLETE** |
| `underDressed` | H2 **worn** via the existing `${key}-ud` convention, no special case | **COMPLETE** |

The activation guard is `stageAH2 && distinctStages && textures.exists(NORMAL) &&
textures.exists(WORN)` — gated on the textures actually arriving, **not** on the flag, which is
why a failed fetch cannot leave a hole. It mirrors the Stage B guard exactly.

## 4. Preservation — this is the same building

`pointStageAAtAuthored()` spreads the procedural registry entry and overrides **only** `key`.
Footprint (`fw`/`fd`), anchor (`originX`/`originY`), grid position, plinth, depth key, hit polygon
and every overlay position carry over untouched.

| Invariant | Status |
|---|---|
| `BuildingId` remains `stage-a` | **PRESERVED** |
| Grid position / footprint / origin | **PRESERVED** |
| Runtime-owned signage (external, not baked into the art) | **PRESERVED** |
| Selection (pixel-perfect, `alphaTolerance: 1`) | **PRESERVED** |
| Hover | **PRESERVED** |
| Companion navigation / accessibility | **PRESERVED** |
| Door glow, production overlays, ground shadow | **PRESERVED** |
| Stage B | **UNAFFECTED** — `b-stage-b-authored` still active with H2 on |
| Engine / `GameState` / `SaveFile` / `StudioLotSnapshot` / schema | **UNTOUCHED — 0 paths** |

## 5. Tests

| Suite | Result |
|---|---|
| H2 runtime unit tests (`ui/src/lot/stage-a-h2.test.ts`) | **16 / 16 PASS** |
| **Flag → scene wiring** (`ui/src/lot/stage-a-h2-wiring.test.tsx`) | **3 / 3 PASS** |
| RGBA export tests (`ui/src/lot/authored-rgba-export.test.ts`) | **8 / 8 PASS** |
| Authored value-standard / accepted-measurement tests | **PASS** (in full suite) |
| Full unit suite | **1124 / 1124 PASS**, 88 files |
| Core typecheck + UI typecheck | **PASS** (exit 0) |
| Production build | **PASS** (exit 0) |
| Full Playwright/e2e (all 17 specs) | **105 passed, 0 failed, 0 flaky**, 7.8m |
| `git diff --check` | clean |

### The wiring gap this checkpoint closed

The first pass proved both *endpoints* — the flag (default-OFF, only a literal `'1'`) and the
registry re-point (identity/placement preserved) — while the four plain assignments **between**
them had no unit coverage. A dropped or renamed prop anywhere in that span would have left every
endpoint test green while the proof did nothing in the real product.

`stage-a-h2-wiring.test.tsx` runs the whole span for real — `flags` → `StudioLotScreen` →
`StudioLotView` → `LotScene.init` → `preload()` — stubbing only Phaser at its module boundary, and
asserts **behaviour at the far end** (which image URLs the real scene requests), not a private
field. It was **mutation-tested**: deleting the prop at the view hop fails 3/3, at the host hop
2/3. Both files were restored byte-exact afterwards (hash-verified).

## 6. Performance

Measured, not estimated (`out/stage-a-h2-evidence/performance.json`).

| Metric | Value |
|---|---|
| H2 normal / worn | 72,415 B / 72,264 B |
| **Total added payload** | **144,679 B** |
| Texture-count delta | **+2** |
| Texture-memory delta | **+1,507,328 B** (1.44 MiB — 512×368×4×2) |
| Scene-ready median | procedural **840 ms** vs H2 **835 ms** → **−5 ms** (inside noise) |
| FPS @ 1280 / 1440 / 1920 | procedural **57 / 55 / 49** · H2 **57 / 55 / 49** — identical |
| `displayObjects` | 143 → 143, **delta 0** (hard guard +10) |
| Fetch, proof OFF | `[]` — nothing requested |
| Fetch, proof ON | exactly `b-stage-a-h2.png`, `b-stage-a-h2-ud.png` |
| Build output delta | JS **+1.02 kB** raw / **+0.24 kB** gzip; CSS **byte-identical** (same content hashes); `dist` 2.2M → 2.4M |

Baseline measured by building the production worktree at `5e19b25` (identical UI code to
`b5bcdfc`, which added documentation only). **The proof is free at runtime.**

## 7. Runtime evidence

`out/stage-a-h2-evidence/` — **29 artifacts** (24 PNG + 5 JSON), matched procedural/H2 legs.

| Required item | Artifact |
|---|---|
| management 1280 / 1440 / 1920 | `A-management-{1280,1440,1920}-{proc,h2}.png` |
| closest framing | `B-closer-{proc,h2}.png`, `C-masked-closer-{proc,h2}.png` |
| Stage A + Stage B in frame | every management frame, `J-overlap-*` |
| normal / worn | `E-normal-*`, `F-worn-*` |
| selected | `I-stage-a-selected-h2.png` |
| active production | `H-active-production-*` |
| proof OFF | full 11-frame `-proc` leg + `flag-off.json` |
| missing-asset fallback | `M-load-failure-fallback.png` + `load-failure.json` |
| alpha / interaction | pixel-perfect selection + transparent-margin negative click (e2e), `I-…` frame |
| overlap / depth | `J-overlap-{proc,h2}.png` |
| performance | `performance.json` |

### Evidence contamination — found, fixed, preserved

The first capture leaked the dev-only **`Identity review ▸`** pill into **7 of 24** frames,
including **all four masked frames whose only purpose is blind review**. `.lot-review-show` is
`position:absolute` over the canvas, so an element screenshot captures it; clicking
`lot-review-hide` hides the *bar* and creates the *pill*.

Detected by sampling a fixed top-right crop across the package — contaminated frames separated
cleanly (stddev ≈ 13.55 vs ≈ 0.5). **Corrected in the capture harness only** (`openLot()` injects
`.lot-review-show{display:none!important}`); no product code, no UI behaviour and no Art pixel was
changed. All 7 were re-captured; the re-captured package verifies **0 contaminated frames**.

The originals are preserved, not overwritten, at
`out/stage-a-h2-evidence-superseded-review-chrome/` and labelled
**SUPERSEDED — REVIEW CHROME CONTAMINATION**. They are **not** valid blind-review authority.

## 8. Blind runtime review — fresh, on clean frames

One independent reviewer, no prior context, run **sequentially** so the building-type answer could
not be primed by the later questions. Signage masked. Versions labelled A/B, with the assignment
derived from the frames' own SHA-256 rather than chosen by the operator. The reviewer was never
told which version was authored, and the roof/glazing concerns were never mentioned before the
answers were given. The contaminated first-pass verdict was **discarded, not reused**.

**Version A = procedural Stage A · Version B = authored H2.**

| # | Question | Answer |
|---|---|---|
| 1 | Building type, unprompted | **procedural: "sound stage / large production shed"** · **H2: "ambiguous — plain warehouse or mid-rise office/administration block"** |
| 2 | Confidence | **procedural 72%** · **H2 38%** |
| 3 | Strongest class signal | procedural: the full-height, near-full-width cargo door · H2: the flat parapet with corner pilasters — "points at no specific function, which is why confidence drops" |
| 4 | More production-ready | **H2**, narrowly — "B's facade actually has architecture on it" |
| 5 | Same class/family as current Stage B | **procedural: NO** — "palette matches, construction doesn't… looks like it came from a different tool" · **H2: YES, mostly** — "same Deco vocabulary… the plain cousin, not a stranger" |
| 6 | Calmer vs less finished | **procedural: materially less finished** ("the banded roof reads as a bevel filter, not a roof") · **H2: intentionally calmer**, with two genuinely unfinished spots |
| 7 | Flat roof | **"unfinished"** — the Production/Post block in the same lot has the same flat roof *and* carries rooftop HVAC; H2's roof is the largest single surface and carries nothing. "The parapet lip is intentional; the emptiness inside it isn't." |
| 8 | Shadow-side glazing slot | **"a stray highlight or a sliver of another sprite bleeding through. Not a designed feature."** No frame, no sill, no mullion, and a gleam on the shadow elevation |
| 9 | Selection / active-production coherence | **coherent, both** — same pad, same ground shadow, aligned to the road grid |
| 10 | Clipping / float / sort | **clean in both.** "The only pasted-on element is B's blue streak." Observation: H2's mass runs closer to the perimeter road than the procedural — *tight, not overlapping* |
| 11 | Continue toward adoption | **"Keep B and keep going."** Punch list: dress the roof; commit the streak to a framed clerestory or delete it; give the right elevation one detail |

### Reading the split result honestly

H2 **wins** peer finish, architectural family membership and production-readiness against the
procedural building it would replace — and the procedural Stage A fails the family test outright.
That is the result the runtime proof was built to obtain, and it is favourable.

But **class legibility at the management camera regressed**: unprompted, the reviewer read the
*procedural* building as a sound stage at 72% and the *authored* one as a warehouse or office at
38%. The offline gate recorded class legibility as PASS; that was judged on the render. Through
the real lot, at the camera players actually use, the front-led entry bay does not read as an
elephant door. This is exactly the failure mode a runtime blind review exists to find, and it
would not have been found any other way.

**The offline and runtime blind reviews are near-mirror images of each other**, on the same
question, asked the same way:

| Blind review | Authored H2 | Procedural control |
|---|---|---|
| **Offline** (`b5bcdfc`, judged on the render) | **"a sound stage" — 80%** | "warehouse / storage or scenery shed" — 35% |
| **Runtime** (this gate, judged in the lot) | "warehouse / office block" — **38%** | **"sound stage / production shed" — 72%** |

Same concept, same pixels, opposite verdicts. The variable is not the art — it is the **viewing
condition**: the offline gate judges a 512×368 sprite in isolation, the runtime gate judges it at
management distance, at lot scale, next to its neighbours, with the elephant-door bay reduced to a
few pixels of recessed shadow. The offline review named that bay as the class signal; at the
management camera it stops carrying.

**Consequence for the pipeline, not just for H2:** an offline class-legibility PASS does not
predict a runtime class-legibility PASS, and this is the first case where the two have been
measured against each other. The offline gate should not be treated as having settled the
question. (Recorded against Lesson **AI** — the management camera concealing what human-scale
review revealed — as its converse: here the management camera *revealed* what the isolated render
concealed.)

## 9. Watch-item rulings — from runtime evidence only

Neither ruling is inherited from the offline document; both are taken from the clean runtime
frames and the fresh blind review.

### Flat roof — **NOTE**

- **Management read:** neutral. Described only as "taller and flat-topped, with an unbroken
  single-plane roof and a light parapet edge." No complaint raised at management distance.
- **Close read:** "unfinished" — largest single surface in the frame, carrying nothing, beside a
  same-scene peer (Production/Post) that has an identical flat roof *with* rooftop HVAC.
- **Ruling: NOTE, not FAIL.** The governing rule is that a request for roof clutter alongside an
  acceptable peer-finish verdict is not by itself a FAIL, and peer finish did **not** break: Q5
  placed H2 in the same architectural family as Stage B, Q4 rated it the more production-ready of
  the two, Q6 read its restraint as intentional. The demonstrated defect is an internal-consistency
  gap, not prototype-grade finish.
- **Flagged for the Director:** the reviewer's own word was *"unfinished"*, and the argument was
  evidential (a same-scene peer), not preferential. If the Director weights the in-lot
  inconsistency above the peer-finish verdict, this becomes a FAIL. Recorded so that call is the
  Director's, not this document's. **No correction was made.**

### Shadow-side glazing slot — **FAIL**

- **Management read:** already visible and already unexplained — "a faint diagonal light streak on
  the right-hand elevation," not identified as glazing.
- **Close read:** "a thin pale-blue diagonal… no frame, no sill, no mullion, and it sits on the
  *shadow* elevation where a gleam shouldn't be. It reads as a stray highlight or a sliver of
  another sprite bleeding through. **Not a designed feature.**" It was also the single element the
  reviewer named as pasted-on in the whole frame.
- **Ruling: FAIL.** This is the FAIL definition verbatim — it reads materially as stray pixels /
  a rendering artifact. It is not ambiguous-but-harmless: it was noticed at management distance
  *and* misread at close distance. **No correction was made** — a FAIL moves the recommendation to
  bounded Art correction, which is the Director's to authorise.

## 10. One-sprite / depth — **PASS WITH OBSERVATIONAL LIMITATION**

One sprite, existing container depth, no depth slicing needed or added. The reviewer found no
clipping, floating or sort defect in either version, and the H2 building sits on the same pad with
the same ground-shadow treatment as its neighbours.

**Limitation, stated precisely:** Stage A's crew, gear and vehicle waypoints are authored on the
`+gy` door face, *in front of* the building. No legitimate route puts an ambient body **behind**
the H2 silhouette, so a true behind-body occlusion crossing was **not** exercised at runtime for
this building. None was manufactured. The `J-overlap-*` frames therefore evidence in-front
crossings and correct sorting against them — not the behind case. Behind-case occlusion remains
proved for Stage B, on the same single-sprite mechanism, from the adopted Stage B proof.

## 11. Recommendation

**The runtime pipeline passes. The Art does not, on one bounded item.**

Every technical gate cleared: default-OFF, explicit ON/OFF, missing-asset fallback, normal/worn,
`BuildingId`, footprint/origin, signage, selection, hover, navigation, accessibility, Stage B
non-regression, Engine/save/schema boundary, 105/105 e2e, 1124/1124 unit, typecheck, build — and
performance is free (0 displayObjects delta, identical FPS, −5 ms scene-ready).

**Production adoption is NOT recommended in this state.** Two items stand between H2 and an
adoption decision:

1. **Glazing slot — FAIL.** Must be either committed as a properly framed clerestory strip or
   deleted. Bounded, single-feature Art correction.
2. **Class legibility at the management camera.** The authored building reads *less* like a sound
   stage than the procedural one it replaces (38% vs 72%). The entry bay does not carry the
   elephant-door read at management distance. This is the more consequential of the two and is not
   a finish problem — it is a silhouette/opening problem.

The roof is a **NOTE**, and the Director may reasonably escalate it; if a correction pass is
authorised for the glazing anyway, dressing the roof in the Production/Post vocabulary is the
cheap adjacent win the reviewer explicitly asked for.

**What this proof did establish, and it is worth keeping:** the exact frozen authored candidate
survives the real Phaser lot with zero runtime cost, zero identity drift and a working fallback —
and it beats the procedural Stage A on peer finish and architectural family. The direction is
sound. The execution needs one bounded correction and one legibility decision.

**No production merge, PR, tag or push was performed. `main` is untouched at `5e19b25`.**

---

# 12. BOUNDED CORRECTION 1 — the runtime read

**Status: PASSES. Ready for production-adoption review.**

Authorised scope: facade/presentation only, to close the two demonstrated defects —
the shadow-side glazing slot (FAIL) and management-camera class legibility. Roof
explicitly **NOTE only, not authorised for redesign or prop dressing**.

| Authority | Value |
|---|---|
| Production peer | `5e19b25eb67e5c689ca60248dc7cf5efbda95f6d` — re-verified local = tracking = live remote, clean |
| Candidate 1 application proof | `7758cb9df25163f00eb7fba354750dd0120c18ab` — **preserved, not amended** |
| Candidate 1 source | `c0b630622b5cabb4310e6058836e8cb5cab21e0f` — **preserved, not rewritten** |
| **Corrected source** | **`3e7e4f7e772398312b3262689bf2f97eb1623334`** on `stage-a-h2-stage-front`, pushed to the private remote |

## 12.1 The corrected assets

| Asset | SHA-256 | Bytes |
|---|---|---|
| NORMAL `b-stage-a-h2.png` | `98d4191c04a6a08fb3b252f508215e88649b4c7693e8a9375174a2f1d47ca0b9` | 73,067 |
| WORN `b-stage-a-h2-ud.png` | `2ed088351b6a60c0a06f6b86cd4100e339e33a8df3d6c8172dc3fca03a85f5d4` | 69,326 |

Exported through the current production RGBA path. Deterministic over 3 runs, alpha
bit-exact vs source, 128 distinct RGB, colour type 6, no PLTE/tRNS. Superseded pair:
`eefad8ad…` / `cdfe7911…`.

## 12.2 What changed — and what provably did not

| Measure | Candidate 1 | Corrected |
|---|---|---|
| Elephant door | 197 × 80 px | **253 × 89 px** (+43 % area) |
| Door field vs lit wall | 0.67 — a shaded panel | **0.392** — a void |
| Door jamb vs lit wall | — | **0.292** |
| Door seams | 4 | 2 |
| Personnel door | **never rendered** | **28 × 27 px, visible** |
| Buff ratio normal / worn | 0.8655 / 0.8638 | **0.8655 / 0.8638 — identical, both PASS** |
| Registration lock | 15 / 15 / 358 | **15 / 15 / 358 — unchanged** |
| Raw normal↔worn geometry delta | 0 px | **0 px** |
| Final alpha delta / clickable mask | 0 / 0 | **0 / 0** |
| Alpha islands | 1 | **1** |

The buff contract is identical **by construction**: the door and glazing corrections are
finish depths on the `stageDoor` / `stageDoorSeam` / glass vocabulary applied with the
lot's own `dull()`, so the buff wall family was never touched. The pylons narrowed
**inward** specifically so their outer faces stayed fixed — `PA0 = 0.70` pins the lit
measurement window at screen x 20–52, `PB1 = 3.40` keeps clear of the runtime sign zone —
and the glazing was kept clear of screen x ≥ 470 so the shadow window samples the same
bare wall. Every move is inside the mass, which is why the registration lock, footprint,
anchor, placement and depth are provably untouched and the registration guard passed
**unrewritten**.

**Runtime code: unchanged.** No new flag, no changed flag semantics, no fallback
redesign, no `BuildingId`/grid/footprint/origin/depth/navigation/accessibility change, no
Engine/`SaveFile`/`StudioLotSnapshot` change. Asset bytes plus two hash assertions plus
documentation. The built JS and CSS bundles are byte-identical to Candidate 1's.

## 12.3 A latent defect found while correcting

**The personnel door never rendered — not in Candidate 1, not before it.** Its leaf front
face sat at `PY_FACE - 0.002`, i.e. 0.002 BU *behind* the pylon it is set into, and +X is
toward the camera, so the pylon occluded it completely. Verified on the shipped Candidate
1 asset: pylon B's front panel is unbroken buff, and the panel's dark-pixel count trebles
after the fix.

This is more consequential than its 28 × 27 px suggests. The concept names the **scale
contrast between the two doors** as its class signal, and `MANIFEST.json` reported
`personnel_door_px` all along — computed from *generator parameters*, never measured on
the rendered output. The human-scale half of the class signal was absent from every frame
either blind reviewer was ever shown. Fixed by bringing it 0.006 BU proud; nothing else
changed.

**This is a second structural change beyond the two named defects.** It is reported
rather than folded in silently: it was fixed because shipping a correction whose stated
class signal is invisible would be knowingly delivering a defect, but the decision to
accept it is the Director's.

## 12.4 Blind runtime review — fresh reviewer, corrected frames

New reviewer, no prior context, no knowledge of Candidate 1, sequential so the
building-type answer could not be primed, management camera first, A/B assignment derived
from the frames' own SHA-256. Version A = procedural control, Version B = corrected H2.

**The same unprompted question, three times:**

| | authored H2 | procedural control |
|---|---|---|
| Offline (on the render) | "a sound stage" — 80 % | "warehouse / scenery shed" — 35 % |
| Runtime, **Candidate 1** | "warehouse / office block" — **38 %** | "sound stage" — 72 % |
| Runtime, **corrected** | **"sound stage / production stage" — 75 %** | "warehouse / storage or utility shed" — 35 % |

| # | Question | Answer |
|---|---|---|
| 1–2 | Building type / confidence | **"Sound stage / production stage (or aircraft-hangar type)" — 75 %** |
| 3 | Strongest class signal | **"the tall dark recessed opening flanked by the two projecting pilasters… it reads specifically as an oversized vehicle/set door"** — the production-scale opening itself |
| 4 | More production-ready | **corrected H2, decisively** — "three separated values (light parapet, mid wall, near-black opening) plus one accent, so it reads instantly" |
| 5 | Same class/family as Stage B | **YES** — "the same vocabulary and the same palette as the centre building… the plainer working-shed cousin, which is correct" |
| 6 | Calmer vs less finished | **intentionally calmer** — "Fewer beats than the centre hero, but each one is detailed… Deliberate" |
| 7 | Shadow-side slot | **"the long blue band reads as a clerestory window strip"** |
| 8 | Flat roof | **"intentional"** — "the parapet lip is drawn as a separate lighter plane and the piers pierce it, which only makes sense as a deliberate flat-roof detail" |
| 9 | Clipping / float / sort | **none in either**; both seat correctly on their apron |
| 10 | Advance it | **"Yes — keep and ship B."** |

The procedural control, judged in the same frame, was rated *not* the same family as
Stage B — "a placeholder block borrowed from another game" — and "materially less
finished". The class-legibility result is therefore a genuine reversal, not a scoring
drift: the two buildings swapped places on every axis.

## 12.5 Watch-item rulings — from the corrected runtime evidence only

### Shadow-side glazing slot — **PASS**

- **Management read:** "one long narrow pale-blue horizontal window band high under the
  eave"; volunteered as a positive class cue — "the ribbon window on the flank confirms
  an occupied working building rather than a storage hulk."
- **Close read:** "reads as a clerestory window strip."
- **Ruling: PASS.** The §22 FAIL language is gone entirely — no "stray highlight", no
  "sprite bleed", no "not a designed feature". It is now named as architectural glazing,
  which is the PASS definition.
- **Observation, not a defect:** the reviewer noted it "is painted flat onto the wall
  with no reveal or sill, so it sits slightly *on* rather than *in* the surface, and it
  is the most saturated hue on the building." Recorded for the Director; **not
  corrected** — the first-pass stop rule was observed.

### Flat roof — **PASS** (was NOTE)

- **Management read:** "single flat dark-olive roof plane with a defined lighter parapet
  lip"; neutral-positive, no complaint.
- **Close read:** **"intentional"**, with the reason given: the parapet lip is a separate
  lighter plane and the piers pierce it.
- **Ruling: PASS.** **The roof geometry is byte-identical to Candidate 1** — not one
  vertex changed, and no vents, HVAC, skylights or rooftop props were added. The improved
  read is contextual: against a near-black opening and narrower piers that break the
  roofline, the same parapet now reads as a deliberate detail rather than an empty field.
  A different reviewer is also a variable, and is stated as one.
- **Standing wish-list item, unchanged:** this reviewer again asked for two or three roof
  props, noting the centre building has a rooftop antenna and lamp. Per the standing rule
  a roof-clutter request alongside an acceptable peer-finish verdict is not a FAIL, and
  roof dressing was not authorised. Untouched.

## 12.6 One-sprite / depth — **PASS WITH OBSERVATIONAL LIMITATION**

Unchanged from §10 and re-confirmed: no clipping, floating or sort defect in either
version; both seat correctly on their apron. The same limitation still stands and is not
overclaimed — Stage A's ambient routes are authored in front of the building, so no true
behind-body occlusion crossing exists to exercise, and none was manufactured.

## 12.7 Validation — corrected run

| Gate | Result |
|---|---|
| Focused H2 tests | **16 / 16 PASS** — registration, alpha bit-identity and the 128-colour contract all passed **unchanged**; only the two hashes moved |
| Flag → scene wiring test | **3 / 3 PASS** |
| RGBA export tests | **8 / 8 PASS** |
| Value-standard tests | **PASS** |
| Full unit suite | **1124 / 1124 PASS**, 88 files |
| Core + UI typecheck | **PASS** (exit 0) |
| Production build | **PASS** (exit 0) |
| Full Playwright / e2e | **105 passed, 0 failed, 0 flaky**, 7.8m |
| `git diff --check` | clean |
| `rgba-verify` | **PASS** — 3 runs identical, alpha bit-exact |
| Buff family | **PASS** both finishes — 0.8655 / 0.8638, deviation 0.0066 / 0.0049 |

**No test was weakened.** Every tolerance, threshold, registration figure and colour
contract is unchanged; the only edited assertion is the two accepted hashes, which is the
assertion whose whole purpose is to move when the art is deliberately re-cut.

## 12.8 Performance — an art correction, and it costs nothing

| Metric | Candidate 1 | Corrected |
|---|---|---|
| Payload | 144,679 B | **142,393 B** (−2,286 B) |
| Texture count / memory delta | +2 / +1.44 MiB | **+2 / +1.44 MiB** |
| `displayObjects` | 143 → 143, delta 0 | **143 → 143, delta 0** |
| FPS @ 1280 / 1440 / 1920 | 57 / 55 / 49 | **57 / 55 / 49** (procedural 57 / 54 / 49) |
| Scene-ready median | 840 / 835 ms | **827 ms procedural vs 827 ms H2** |
| Fetch OFF / ON | `[]` / exactly the pair | **`[]` / exactly the pair** |
| Build output | — | **JS and CSS byte-identical to Candidate 1** |

## 12.9 Evidence

`out/stage-a-h2-evidence/` — 29 artifacts (24 PNG + 5 JSON), matched procedural/H2 legs,
**0 contaminated frames** (corner-crop stddev uniform at the clean baseline). Candidate 1's
package is preserved unmodified as `out/stage-a-h2-evidence-candidate-1/`, and the
first-pass chrome-contaminated frames remain at
`out/stage-a-h2-evidence-superseded-review-chrome/`.

## 12.10 Recommendation

**H2 BOUNDED CORRECTION PASSES — Stage A H2 is ready for production-adoption review.**

Class legibility moved from 38 % "warehouse / office block" to **75 % "sound stage /
production stage"**, with the production-scale opening named as the signal — the criterion
the standard sets. The glazing is PASS. Peer finish, same-class cohesion and Stage B
differentiation all hold, and the front-led / roof-led contrast with Stage B is intact —
the correction put its investment into the opening, not the skyline. Every technical gate
passes, no test was weakened, and the correction is byte-free at runtime.

Two items are recorded for the Director rather than actioned: the glazing band sits *on*
rather than *in* the wall, and the roof remains undressed by standing policy. Neither is a
defect against the current standard. **Production adoption remains unauthorised and is
the Director's call.**
