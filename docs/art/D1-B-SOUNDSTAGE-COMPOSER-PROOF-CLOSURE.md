# D1-B Soundstage Composer Proof — Closure

**Two independent hypotheses were tested. They did not get the same answer.**

| Hypothesis | Verdict |
|---|---|
| **VISUAL** — can the existing procedural Phaser architecture produce two coherent, genuinely distinct soundstages through a shared composer? | **PASS** |
| **ECONOMIC** — did the second soundstage cost materially less to author once the composer existed? | **FAIL** |

The composer enabled useful architectural variation, but **Stage #2 did not demonstrate reduced
marginal authoring cost**. **No productivity multiplier is claimed.** Components below are adopted
because each has individual production value — **not** because the composer proved a multiplier.

This is **not** an "Art Factory". That framing was rejected as too broad after direct inspection of
the production architecture; the canonical name is the **D1-B Soundstage Composer Proof**, and the
useful result is a *selective soundstage/presentation improvement*.

## Provenance

| | |
|---|---|
| Repository | `The Movies` (production) |
| Branch | `art-d1b-soundstage-composer-proof` |
| Base SHA | `aadbd63d4e32f27b0b09ddeac1d64f07ed1d98ea` |
| Checkpoint A (assignment fix + composer foundation) | `d851ad6` |
| Checkpoint B (first Stage A/B visual proof) | `e8c3574` |
| Checkpoint C (corrective pass #1) | `ed2bdf7` |
| Adoption promotion commit (historical) | `a7e4847` |
| Initial closure / status commit | `9c4d060` |
| Review correction — session-lifecycle reset | `35ace76` |
| Final reviewed / merged production tip | `00dfbe036a622d582f365ce0ce2218ce490e61ab` |
| Production `main` | **MERGED / PRODUCTION** at `00dfbe0` (fast-forward from `aadbd63d`) |

**Eleven** linear commits from the base through the initial closure commit — no merges, no
amends to reviewed checkpoints, no tag, no PR. Independent focused review of that eleven-commit
candidate returned **REVISE** with 0 BLOCKERs and 2 MAJORs; a **bounded review correction**
(session-lifecycle reset + status propagation + the truth-only wording fixes recorded here)
followed those eleven as further linear commits on the same branch: `9c4d060` → `35ace76` →
`00dfbe0`. That corrected branch was **independently reviewed and merged to production `main` by
fast-forward at `00dfbe0`** — still no merge commit, no tag and no PR. `00dfbe0` is the production
authority a future operator should read; `a7e4847` promoted the adoption *before* the review
correction and is **not** the candidate to review or cherry-pick. The milestone SHAs above are
immutable. Production `main` had already reached `00dfbe0` before the later docs-only governance
cleanup that finalized this wording.

## Visual result — PASS

Judged at the governed management camera first, then with stage signage masked, then closer.

- **Distinctiveness (signage-masked) — PASS.** An independent reviewer, given only the two masked
  buildings and no knowledge of the task, returned *"Genuinely different buildings. Confidence: very
  high, ~98%"*, and ranked the discriminators in the order the ruling prioritised: roof system,
  then massing, then facade articulation. Of the roof: *"survives everything — at half size it is
  still the first thing you see."*
- **Coherence — PASS.** Same reviewer, unprompted: *"Same game, essentially certain (~97%)"*, backed
  by matching front-to-side lighting ratios (0.859 Stage A vs 0.876 Stage B), identical ground
  palette and identical projection — *"Same hand, same engine."*
- **Management vs closer — they agreed on acceptance and disagreed on defect detail.** Both passed;
  closer range exposed Stage B's fascia defect (corrected) and made Stage A's pre-existing roof
  weakness conspicuous (deliberately not fixed — see below). That disagreement is recorded, not hidden.

**Stage A** — the lot's original barrel-vault hangar, unchanged: buff stucco, vaulted roof, one wide
five-leaf elephant door. **Stage B** — a later steel-framed stage: sawtooth north-light roof, taller
walls under a shallower roof, three buttress pilasters, pale cream stucco with slate roof and blue
glazing, a narrower three-leaf door under a brass header. Same 4×4 footprint, same door grammar,
same lot palette.

**Signage-masked testing was load-bearing.** It also proved the mask had to reach further than the
facade letters: `Soundstage A/B` is additionally printed by vignette markers, activity toasts,
character cards, the hover label, the selection panel and the companion navigation. A distinctiveness
test that leaves any of those visible is not testing architecture.

## Corrective pass #1 — the Stage B fascia

One bounded pass, and it closed its target. The defect was a **lighting-convention error, not a taste
call**: the fascia closing each sawtooth tooth sits on the `+gy` elevation, which `drawWalls` treats
as the **lit** face, but it was painted with a shadow tone — making it the darkest element on that
elevation (63 luma below the wall it meets, 22 below the slope, 30 below the glazing). It read as an
unresolved black opening. The field was **renamed rather than added** (`solidDark` → `fascia`) so the
roof union gained no vocabulary, and the value moved to a lit lot-palette tone.

Blind re-review of the corrected result: *"there is not one dark pixel on the roof itself"*, and the
roof resolves as coherent structure — verified by measuring the fascia band stepping 9→23→38px per
tooth, *"the triangular ramp cross-section of each tooth repeating."*

**Corrective pass #2 was not authorized and was not run.**

## Performance

`displayObjects` **143 → 143 → 143** (baseline / proof / post-correction), against a +10 hard stop.
Transient 144 while a vignette marker is live. **FPS 57**, steady. Distinct art and both under-dressed
finishes are baked textures, so nothing new reaches the display list.

## The stage-assignment defect — found, fixed, and promoted

**Pre-existing, presentation-side, and previously hidden by the stages looking identical.** The engine
has no `stage` field, so `studioLotSnapshot()` assigns stages by array position
(`adapter.ts:3697`, documented at `adapter.ts:3618`). When the Stage A production released, core
spliced it out, the array compacted, and the surviving Stage B production silently became the Stage A
production — its card, apron dressing, crew vignettes and ACTIVE badge all migrating. Distinct stage
art would have made this obvious to players.

Fixed with a presentation-owned resolver holding a stage slot per production id for as long as that
production is on the lot. It lives above **both** the Phaser scene and the DOM companion navigation so
the two cannot disagree. It is **session-scoped, not per-mount** — the way a player advances a week is
to leave the lot, tick, and come back, so a per-mount instance would forget every held stage on the
way out and the defect would reappear on re-entry.

**Adopted and ungated.** Which building a production appears on is presentation *correctness*, not art
direction, so it is not tied to the visual content flag: a player using the visual rollback must not
get the migration defect back with it.

## underDressed

An existing snapshot signal that was **dead** — computed by the adapter from
`standing === 'struggling'`, spread onto all nine buildings, and consumed nowhere. It is now surfaced
as a bounded finish: duller large fields, desaturated glazing, no decorative trim, baked as its own
texture (zero display objects). Measured: Stage A luma −16.7% / chroma −18.5%; Stage B −18.9% / −18.4%.

Geometry, texture size, massing, roof form and the door opening itself are **identical** between
finishes — asserted in test. The one element the worn finish removes is **decorative trim**: Stage B's
brass header beam over the door (`doors.lintel`), which is the first thing a struggling studio stops
repainting. That is a finish decision, not a structural one — the opening keeps its size, position and
leaf count, and the beam sits well inside the wall face, so dropping it reveals stucco rather than a
void. It is a finish, never an architectural change, and it must not imply damage, closure,
construction, abandonment or unavailability.

**Caveat, recorded honestly:** no existing fixture reached the band. A founded studio starts at 43.3
and standing moves only on release, so `standing < 35` appears **uncommon in normal play** and players
may see this state infrequently. That is **not** a reason to invent a stronger trigger.

## Camera resize-refit — an independent latent bug

Invoking a closer preset exposed that Phaser's `RESIZE` scale mode polls the parent and emits
`resize`, and the handler called `resetCamera()` unconditionally — so any framing other than
`'overview'` was snapped back within half a second. Invisible while `'overview'` was the only preset
ever applied (the other four had no caller) and it silently defeated the first one that did. A resize
now re-fits the **active** preset; the R key still resets. Adopted as an independent correctness fix.

## Authoring cost — the evidence, without repair

| Segment | Measured |
|---|---|
| Composer parameterization (Checkpoint A) | ≈ 7 min |
| Stage A re-expression | ≈ 0 incremental — it reproduced existing art |
| **Stage B initial incremental authoring (Checkpoint B)** | **≈ 14 min** |
| Corrective pass #1 | ≈ 3 min active authoring · 2 min 06 s to first proof · 16 min 27 s whole pass incl. review, validation, commit |

**Stage B was roughly 2× the measured composer-foundation effort, against a target of clearly less
than half.** The corrective pass is recorded separately and is **not** used to alter either side of
that comparison.

These are **agent wall-clock**, not human labour, and segments overlapped because tool calls ran in
parallel. Do not aggregate them into a false-precision metric or a project-wide productivity
percentage. A hypothetical Stage C may be cheaper; **that was not tested and must not be extrapolated.**

One reporting correction is preserved deliberately: the Checkpoint B return stated *"stop conditions:
none triggered."* **That was wrong** — the authorization treats "Stage B is not materially cheaper
after the composer foundation" as a negative/kill condition, and it had fired.

## Production disposition

| Component | Ruling |
|---|---|
| Stable stage assignment | **Adopt, ungated.** Correctness, independent of the art. |
| StageSpec composer | **Adopt** for clearer representation, preserved Stage A draw-program equivalence and testable baking — **not** for productivity. Do not expand. |
| Stage B art | **Adopt.** The corrected sawtooth fascia is the accepted presentation. |
| underDressed treatment | **Adopt** in its current bounded interpretation. |
| Camera resize-refit | **Adopt** as an independent correctness fix. |
| Review/proof tooling | **Retain, dev-only, default OFF.** Never player-facing review chrome. |

**Flag states now governed and test-protected:** accepted soundstage content **default ON** (with an
explicit `'0'` rollback retained for A/B regression comparison); review/proof tooling **default OFF**;
stable stage assignment **gated by neither**.

## Engine / Art boundary

Completed with **no cross-workstream blocker**. No change to `src/core/`, `ui/src/engine/adapter.ts`,
the `StudioLotSnapshot` schema, or `SaveFile`; no GameState field, no simulation change, no Engine
implementation. Stage geometry is **not** authoritative for facility existence, capacity, rooms, doors,
occupancy, production progress, availability or gameplay topology. Stable stage assignment remains a
presentation mapping over snapshot truth the adapter already emits.

## Known defects

**Pre-existing — deliberately not fixed here:**

> **PRE-EXISTING ART DEFECT — STAGE A BARREL ROOF READS TOO FLAT / BULLSEYE-LIKE AT CLOSER RANGE.**

Independently confirmed twice (the second reviewer measuring the ring sequence as 202→173→187→201→215:
*"non-monotonic and perfectly radially symmetric, with no riser faces… No light direction produces
that sequence… it reads as a decal, not as form"*), and proven present in the pre-D1-B baseline by the
content-rollback capture. It is not caused by StageSpec or by Stage B, and it is not an adoption
blocker.

**Stage B — non-blocking notes, not reopened:** its roof planes read somewhat heavier than its own
shaded wall; the pilaster reveals terminate inconsistently against the door lintel.

**Scene-wide pre-existing, observed and out of scope** (recorded so they are not mistaken for D1-B
regressions; this closure is *not* a Studio Lot cleanup list): a screen-horizontal boom prop that is
also cloned across frames, repeating grass-tile ellipses, an aliased asphalt/grass boundary with no
kerb, the water-tower cap ignoring the corner its body respects, and flat non-isometric props (truck,
pedestrians) against a strict 2:1 scene.

## Still unauthorized

No Stage C. No generalized Art Factory, Building Recipe system or data-driven parts kit. No Lot Stamp
serialization, JSON runtime content, asset browser, placement/editor tooling or decal tooling. No
EraProfile or generalized ConditionProfile. No asset-file loader, GLB, Blender, three.js or renderer
migration. No facility simulation, player construction, GameState fields, SaveFile changes,
StudioLotSnapshot schema changes or Engine adapter changes. No Asset Lab change, no character work,
no Concept B/C. **No new abstraction is authorized merely because the proof produced useful
components.**

## Evidence

Playwright matrix (7 specs) writing to the gitignored `out/d1b-soundstage-evidence/`: matched
rollback-vs-default management capture with a control for ambient noise, normal and signage-masked
Stage A/B, closer review, underDressed OFF/ON at matched seed and week, stable-assignment before/after
on both flag paths, the 1920/1366/1280 viewport classes, 125% zoom, and `display-objects.json`.
**No screenshot payload is committed.**
