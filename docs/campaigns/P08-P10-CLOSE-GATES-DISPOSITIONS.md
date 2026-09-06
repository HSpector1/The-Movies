# P08–P10 CLOSE-GATES-01 — gate table, HID classification, requirement dispositions

**Authorization:** `OPS-P08P10-CLOSE-GATES-01` (continuing `OPS-P08P10-20260905-01`).
**Status line (this document is appended, never rewritten; the newest block wins):** see §0.

## 0. Current status

`<<STATUS — filled at the end of the run>>`

## 1. Correction of the prior readiness claim

The morning report of 2026-09-06 called the P10 person route "TECHNICAL KEEP / combined candidate
READY". Current Ops rejected that claim: the required interaction gates (world-body real click,
Locate real outcome, post-Load behaviour), the Profile contract actions, the career/result and
facility-history routes, the P09 real-input regression on the final pair, and the Owner-profile
copy migration were incomplete or unproven. That intermediate candidate
(`~/Desktop/P10-Person-Route-Candidate-af8c19c-fcfcbb8`, player `a8f4390c…`, engine `3b9e3432…`,
projection 18) and its failed/partial proof (`evidence/P10-real-input-journey`, 25/33) are
PRESERVED unchanged. Everything below is the correction.

## 2. The eight non-passing real-input steps — exact classification

Retained report `hid-20260905T223535Z` (candidate `af8c19c-fcfcbb8`), 33 steps, 8 non-passing.

| Step | Action (retained report) | Classification | Cause (from evidence) | Resolution |
|---|---|---|---|---|
| 7 | inspector card after 4 world-body clicks | `<<PENDING PROBE>>` | the four real clicks at the published AABB's upper 40 % landed on the Production/Post building (screenshots 002–005: two on the roof, one on the left UI card, one on the wall); the lot selection read "Production / Post" | see §2.1 |
| 8 | click `person-inspector-profile` | cascade of 7 (OBSERVATION: the card never stood) | — | — |
| 9 | wait `profile-open` | cascade of 7 | — | — |
| 10 | OPEN PROFILE reached the exact person | cascade of 7 | — | — |
| 11 | click `profile-back` | cascade of 7 | — | — |
| 24 | wait `located` (`m.selectionStableId === bodyId`) | **OBSERVATION / ASSERTION (driver)** | the driver read a top-level `selectionStableId`; the host publishes it inside `diag`. Screenshot 022 shows the product DID locate: Roster hidden, Miriam selected with the ring, camera inspecting, "◀ BACK TO STUDIO" offered | driver reads `diag.selectionStableId` + `diag.suspendedForLocate`, then presses the real BACK TO STUDIO and asserts the Roster REOPENS with its filter + selection — **PASS on the final pair** (`hid-20260906T081123Z` steps 26–28) |
| 25 | LOCATE selected the exact body | cascade of 24 (same assertion) | — | PASS (as above) |
| 32 | click `studio-menu-resume` after Load | **PRECONDITION (driver sequencing)** | after a Load the Studio Menu stays OPEN reporting "Studio loaded." with Resume offered (the P04A.1 menu law; screenshot 029). The driver's post-Load predicate ignored the open menu, then clicked MENU again — toggling it CLOSED — and looked for Resume | driver waits for "Studio loaded." then presses the real Resume and asserts the menu closed + world live — **PASS on the final pair** (steps 34–36) |

### 2.1 World person-body click (steps 3–7) — classified from the pick probe

Evidence: `Tools/p10-run-body-probe.sh` → `Evidence/P10-Body-Probe-CloseGates/hid-20260906T084618Z`
(`p10-body-probe.json`, four samples; the host publishes `diag.seatedPersonBodyProbe`: the body's
renderer bounds, the pick camera's projection of feet/chest/head, and the stable id the EXACT
pointer pick — `StudioSelectionManager.PickAtScreenPoint` — resolves at the chest, head and AABB
centre; observation only, nothing is selected).

Facts observed (the seated craft person `t-cra-04`, walking its authored marks around the
Production/Post building at management zoom, 1440×900):

| Sample | Published AABB (Unity px) | Renderer bounds (m) | Pick at chest / head / centre | Where the person stood |
|---|---|---|---|---|
| 0 | 21.6 × 23.7 | 1.62 × 1.48 × 1.69 | `t-cra-04` / `t-cra-04` / `t-cra-04` | beside the building, in the clear |
| 1 | 19.7 × 21.5 | 1.68 × 1.43 × 1.65 | `t-cra-04` × 3 | in the clear |
| 2 | 20.4 × 21.4 | 1.72 × 1.49 × 1.78 | **`post` × 3** | on the building's doorstep, drawn in front of the facade |
| 3 | 21.1 × 21.6 | 1.62 × 1.47 × 1.69 | `facility-scenery-shop` × 3 | **under the left HUD card** (the framing parked the person beneath it) |

So:

- **Actual rendered body and selectable collider / world-to-screen mapping / logical-vs-pixel
  coordinates: CORRECT.** The published rect is the body's own tight AABB (~20×22 px ≈ 10×11
  points at the retina scale); the driver's aim point and the host's own chest projection agree
  within 2 px; the pick camera resolves the person at the published points whenever the person
  stands clear. No coordinate-transform defect exists (the retained run's clicks at (245–276,
  198–274) are exactly where the rect projected at those instants).
- **Step 7 (and its cascade 8–11) — PRIMARY: PRODUCT INTERACTION (selection ergonomics), LAYOUT /
  OCCLUSION class.** The person's authored marks include the Post building's doorstep. The
  building carries a coarse box collider that encloses its porch; a person standing there is drawn
  in front of the facade yet sits inside the box, and the pick's sight-line test
  (`SightLineBlocked`) counted the building as an occluder — every real click on a visible person
  at that mark resolved `post` (sample 2; the retained run's screenshots 002/005 show exactly that
  doorstep). **Fixed at the owning seam** (`StudioSelectionManager.SightLineBlocked`, the doorstep
  rule): a collider whose volume contains the person's feet or chest is the ground they stand on,
  not something between the camera and them; anything else ahead on the ray still blocks
  (EditMode `ResolvePick_APersonOnABuildingDoorstep_IsNotOccludedByTheBuildingsOwnEnvelope` +
  the wall control case). No collider was moved, no person relocated, no proof-only advantage.
- **SECONDARY: HARNESS AIM (UI pointer interception).** One framing parked the person under the
  left studio card (sample 3): a real click there lands on the card. The driver's framing now treats
  an aim point covered by any visible published UI element as "not framed" and pans away from the
  card's side before clicking (`Tools/p10-proof-people.mjs`), which is what a player does.
- **Deterministic overlap / selection priority: not implicated.** Person-over-Place ranking already
  holds; the doorstep case was the occlusion test, not the ranking.
- **Walking target:** the person moves between marks; the driver waits for the rect to settle and
  retries across the walk cycle (six attempts) — a stale rect on a moving body is not a defect.

### 2.2 Second-order findings from the reruns on the final pair

- **Run `hid-20260906T085950Z` (people, pair `d531df53…`)**: three of six world clicks were aimed
  where the probe said the person was pickable, yet the real click selected the building behind
  (`selectionAfter` = `post` / `casting`), and the Locate that followed selected Miriam but no
  BACK TO STUDIO control appeared while the camera kept moving between two screenshots eight
  seconds apart with no driver input. Cause: **FOCUS / INPUT (harness)** — a framing burst's
  arrow `keyup` was lost (the window's focus flickers under the 3-second activation cadence),
  leaving an arrow HELD: the tycoon camera pans continuously, clears every navigation origin each
  frame (`TycoonCameraController`: "the player just took the camera into their own hands"), so
  the Locate's Back promise cannot exist, and every published rect drifts between the map read
  and the click. Fix (driver): release all four arrows after every burst and before any
  camera-dependent step; click only inside a measured still window (rect steady < 1 px for
  300 ms, move+click within ~90 ms); assert a building rect holds still before the Locate.
- **PRODUCT INTERACTION (selection ergonomics), second fix at the pick seam:** a person at
  management zoom is a ~10-point target that walks between marks. `Pick` now asks the exact ray
  first and, only when it resolves no Person, an 8-px ring of rays; the nearest Person in the
  ring wins; a click on a building with no person nearby still selects the building
  (EditMode `PickWithPeopleTolerance_ANearMissOnASmallPerson_StillSelectsThePerson`). Applies to
  every player; no collider moved; no proof-only advantage.

Resolution proof: the real-input people journey rerun on the FINAL pair (§3).

## 3. Gate table (PASS / FAIL / BLOCKED / NOT RUN — never converted across evidence classes)

`<<FILLED AT THE END OF THE RUN>>`

## 4. Requirement dispositions — the READY-extension rows (traceability matrix)

Classes: **IMPLEMENTED AND PROVEN** (code + automated proof in the packaged player and/or real
input on the final pair) · **IMPLEMENTED BUT UNPROVEN** · **AUTHORIZED READY WORK REMAINING** ·
**GENUINELY DEPENDENCY-BLOCKED** · **OWNER-BLOCKED** · **ORIGINALLY DEFERRED**. Evidence paths are
under the final candidate's `evidence/` unless stated.

### P08 (Standing & Studio History)
| Row / extension | Disposition | Evidence |
|---|---|---|
| P08-R1 long-save navigation + non-blocking attention (REQ-018/019) | IMPLEMENTED AND PROVEN at P08 core (tabs, filters, retained scroll; attention non-pausing) — unchanged here | P08 checkpoint §; P08 oracles rerun on the final pair (`P10-Oracle-Sweep/p08`, 8 scenarios) |
| P08-R2 facility-history adapter (REQ-013, P09-REQ-040) | **IMPLEMENTED AND PROVEN (this run).** Producer: `facilityCommitted/Completed/Demolished/Moved` rows at the one mutation site of each (`src/core/actions.ts` commit/move/demolish, `src/core/tick.ts` completion), exact placement identity, same recording law. Adapter: TS timeline rows current/historical with `buildingId`; Unity History facility rows carry the state line + LOCATE gated on a resolvable body; the P09 subject (a placed building's LOT SELECTION) offers STUDIO HISTORY ▸ to its latest row; unknown/stale ids open the timeline unselected | `tests/bridge-p09a-r2-facility-history-rows.test.ts` (5); oracle `p10-facility-history` (3 steps: from-building current, demolished historical, unknown building) |
| P08-R3 person-history adapter (REQ-012, P10-REQ-025/031) | IMPLEMENTED AND PROVEN (P10A cross-stack; both directions) | oracle `p10-person-history`; EditMode `StudioP08AHistoryWorkspaceTests` |
| P08-R4 fact-backed records (REQ-021) | IMPLEMENTED at core (records only from complete facts; partial provenance labelled) — unchanged | P08 checkpoint; `p10-career-linked` shows a recorded row vs the partial-provenance case on the older fixture |
| REQ-032 / REQ-033 (Legacy inputs; Wire/Radio never dependencies) | IMPLEMENTED (contract review; no runtime dependency) — unchanged | static audit in the P08 checkpoint |

### P09 (Founding Flip & construction)
| Row / extension | Disposition | Evidence |
|---|---|---|
| P09-R1 Build Here (REQ-010) + all blueprints | PARTIAL, unchanged: "Build here" from the parcel chooser is built; world-native parcel selection is AUTHORIZED READY WORK REMAINING | P09 checkpoint §8 |
| P09-R2 N-site + grouped completion (REQ-020) | core built and proven; the portfolio/attention surface is AUTHORIZED READY WORK REMAINING | P09 checkpoint §8 |
| P09-R3 Stage/Set lifecycle (REQ-027) | Set commission BUILT + proven (pulled into core); repair/strike AUTHORIZED READY WORK REMAINING | P09 checkpoint §3.1.3 |
| P09-R4 move + demolish (REQ-029/030) | core actions exist and now RECORD HISTORY (this run); the Unity consequence-sheet routes are AUTHORIZED READY WORK REMAINING | `bridge-p09a-r2-facility-history-rows` (move/demolish rows) |
| P09-REQ-040 construction milestones for P08 | **IMPLEMENTED AND PROVEN (this run)** — see P08-R2 | as above |
| P09-REQ-039 REAL BUILDER SYSTEM | **GENUINELY DEPENDENCY-BLOCKED** (worker taxonomy / capacity / P10 people authority; Owner/system decision) — see §5 | execution order §5.4 |
| Real-input BUILD FLOW on the FINAL pair (§3 of this order) | see gate table §3 | `P09-Journey-CloseGates` |

### P10 (People, Profile, Roster)
| Row / extension | Disposition | Evidence |
|---|---|---|
| P10-R1 contract consequence (REQ-018) | **IMPLEMENTED (this run)**: `quoteContract` family → `StudioContractQuoteSnapshot`; Profile REVIEW RENEWAL / REVIEW EARLY RELEASE → consequence sheet → CONFIRM (only a fresh legal quote on the live revision) / CANCEL; receipt; refusals verbatim; the engine prices and decides everything. PROVEN: bridge tests (legal renew/release, closed window, stale revision, missing/changed contract, duplicate command, engine refusals, once-only debit, credit retention, cancel neutral); EditMode sheet tests; oracle `p10-contract-actions` (sheets + cancel neutral); the real-input contract journey (see §3) | `tests/bridge-p10a-r1-contract-quote.test.ts` (8); `StudioP10AR1ContractSheetTests` (5); `P10-Contract-Journey-CloseGates` |
| P10-R1 grouped attention (REQ-019) | IMPLEMENTED AND PROVEN (Roster attention filter / attention-first sort / horizon cycle; attention cohorts on the wire) | oracle `p10-person-inspector`; real-input contract journey enters through the attention filter |
| P10-R2 shortage → prefiltered Roster (REQ-027) | **IMPLEMENTED AND PROVEN (this run)**: the CASTING SHORTAGE banner offers VIEW ROSTER — <the EXACT profession the package's own pools are short of> beside FIND AN ACTOR; the Roster opens prefiltered; Back returns to the same casting context | oracle `p10-shortage-roster`; `StudioP10AR2ShortageRosterTests` |
| P10-R2 existing market reuse (REQ-026) | IMPLEMENTED (the one market; released people re-enter it as free agents) | `bridge-p10a-r1-contract-quote` R2 |
| P10-R2 ability percentile as market context (REQ-024) | AUTHORIZED READY WORK REMAINING (not entered; never a rank) | — |
| P10-R3 facility-native recruitment (REQ-028) | **IMPLEMENTED AND PROVEN (this run)**: the Casting building card offers FIND TALENT → the same market lane (presentation-only; gated like OPEN CASTING) | oracle `p10-shortage-roster` step 2 |
| P10-R4 career records + P08 links (REQ-029, REQ-020/025) | **IMPLEMENTED AND PROVEN (this run)**: a frozen career row → the EXACT P07 result → Back to the same person; legacy partial-provenance kept as its own case | oracle `p10-career-linked` (fixture from the bridge's own intents) + `p10-person-history` |
| Star badge/threshold (REQ-016) | OWNER-BLOCKED (value + definition shown; no badge) | — |
| REQ-032..036 (morale, relationships, training, aging, retirement) | GENUINELY DEPENDENCY-BLOCKED / ORIGINALLY DEFERRED — not entered | visibility table |
| REQ-038/039 (rankings, momentum) | ORIGINALLY DEFERRED TO A NAMED PACKAGE — not entered | matrix |

## 5. Corrected Real-Builder disposition (execution order §5.4)

RETRACTED: the earlier sentence "Real-Builder obligation — satisfied in P09 (real-HID Build 30/30 …)".
That evidence proves the **REAL-INPUT BUILD FLOW** (a human-like input path commits construction).
It does not touch the **REAL BUILDER SYSTEM** (authoritative worker identity / capacity /
productivity affecting construction under approved gameplay rules), which the execution order §5.4
preserves as **P09-REQ-039 — DEPENDENCY-BLOCKED** (worker taxonomy / TypeScript capacity /
P10-compatible people authority; Owner/system decision). No Builder formula or worker taxonomy was
implemented in this stack; decorative site workers are not Builders. This broader deferred
requirement does not block technical KEEP for the narrower authorized stack.

## 6. Compatibility boundary (observed on the real engines, `scripts/p10-compat-boundary-probe.sh`)

| Engine | Checkpoint | Result |
|---|---|---|
| projection-17 (`5185e3a2…`, the P09 CORE candidate) | projection-17 (`18de162d…`) | serves; session preserved |
| projection-17 | projection-18 (`ea5d645f…`) | **refused at startup**: `checkpoint.schemaId: does not match the running TypeScript bridge schema` (fatal; nothing is served, nothing is loaded) |
| projection-17 | projection-19 (`6a2c01fe…`) | **refused at startup** (same reason) |
| projection-19 (`189326b6…`, this candidate) | projection-17 | accepted: migrated + re-projected; served schema projection-19; **fresh session id**; week preserved |
| projection-19 | projection-18 | accepted the same way |
| projection-19 | projection-19 | serves; session preserved |

Layers, distinguished: **durable save version** V18 (inside every checkpoint above, identical across
projection 18 and 19 — a save version alone never decides compatibility); **bridge protocol** 4
(unchanged); **projection/schema identity** (the checkpoint envelope's `schemaId`) — the ONE
boundary: an engine serves only its own schema and every LISTED prior identity
(`SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`, nineteen literals), migrating prior ones forward with a
fresh session; it refuses an unknown (newer) identity outright. **Runtime-checkpoint envelope**
v1 (unchanged). **Engine/player pair**: the player refuses a mismatched contract
(`RequireProtocolCompatible`), so a player only ever pairs with an engine of its own schema. Older
candidates are NOT patched; each keeps its own compatible profile copy.
