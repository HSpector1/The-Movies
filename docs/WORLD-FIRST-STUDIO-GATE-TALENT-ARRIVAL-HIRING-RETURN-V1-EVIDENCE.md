# World-First Studio Gate Talent Arrival & Hiring Return V1 Evidence

Status: **IMPLEMENTED, VALIDATED, AND RETAINED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract authority: `712c31180629396e33107e22826e73fbffffd9c2`

Implementation authority: `ca8279cfb91990ef1904e36fa1d92d762811d180`

## Keep ruling

World-First Studio Gate Talent Arrival & Hiring Return V1 passes its bounded Keep gate.

The retained player loop is:

```text
SELECT THE PHYSICAL OR SEMANTIC STUDIO GATE
→ REVIEW THE CURRENT ELIGIBLE ARRIVAL SLATE
→ EXPLICITLY SELECT ONE EXACT NAMED CANDIDATE
→ SEE AND INSPECT THAT VISITOR IN THE LIVING LOT
→ OPTIONAL CANONICAL TALENT PROFILE OVER THE SAME LOT
→ OPTIONAL OPEN HIRING TERMS · <EXACT NAME>
→ REVIEW COMPLETE EXISTING TERMS AND SIGN OR RETURN
→ FRESH EXACT VISITOR OR NEUTRAL GATE
```

The Gate and person are the discovery and inspection surfaces. Hiring remains supporting deep
management because salary, bonus, term length, obligations, and runway are too important to hide
inside a world popup. No candidate is selected by default, and no Gate action signs a contract.

## Existing market law and shared eligibility

The existing Engine/App hiring market remains the sole authority for market membership, generated
offers, prices, terms, legality, cash rejection, and signing. A single adapter-owned eligibility
helper now defines the bounded Gate subset: one current market member with one exact underlying
talent identity, `unemployed` employment truth, no active studio contract, and one or more complete
current contract offers.

The Lot snapshot projects only the identity and complete term facts needed to render that existing
truth. Pure Gate selectors reject duplicate talent IDs, duplicate slate IDs, missing underlying
talent, employed/freelancer-only/no-offer candidates, invalid profession or terms, mismatched
content seed/week, and malformed market data. Snapshot order and the first Hiring card never confer
selection or consent.

`StudioLotScreen`, App, and `HiringMarket` independently revalidate current state through the same
eligibility boundary. The Lot passes identity, not cached prices or commands. The focused Hiring
surface rebuilds its canonical cards, accepts only one exact eligible match, and otherwise focuses
the stable Contract market heading rather than another candidate.

## Physical Gate and explicit visitor selection

The accepted runtime Hollywood manifest remains the only physical Gate authority. The renderer
requires the exact `1586 × 992` canvas, one canonical `studio-gate` record, its accepted polygon,
`gate` building ID, label, guard and arrival anchors, ordered affordances, and one exact foreground
occluder record. Missing, duplicate, conflicting, source-polygon, malformed, reordered, or wrong-
foreground truth suppresses only the physical Gate/visitor seam; unrelated Hollywood places remain
available and the native semantic Gate remains complete.

Physical Gate, Gate status, and native `lot-nav-gate` selection open the same current candidate
chooser. Status reports the exact number of candidates with current terms or explicitly reports
none. The player must activate one named candidate. Until then there is no visitor, profile, Hiring
handoff, or implicit first-card selection.

One selected candidate becomes one distinct presentation-only Gate visitor at the accepted arrival
anchor `[1227,844]`. The visitor is not appended to the production/studio `people` collection and
therefore cannot be mistaken for staff, assigned work, a queue member, or an authoritative worker
location. It reuses only the accepted Role Atlas presentation category: Director remains Director;
Actor, Writer, and Craft use the neutral talent figure while their exact profession stays textual.

The stationary visitor has no route, tween, arrival clock, ceremony, autonomy, pathfinding, job,
workload, destination, or nameplate. Its exact name, profession, `Free agent` status, and available
term lengths appear in the world inspector. Snapshot replacement reconciles the same candidate or
removes changed, missing, invalid, signed, or duplicate truth without ever substituting another
person.

## Canonical profile, Hiring handoff, and fresh return

`Open talent profile` compares the complete rendered candidate token to the latest snapshot; App
then rebuilds latest Engine truth and requires one exact underlying identity before opening the
existing canonical Talent Profile drawer. The drawer stays above the same mounted, visibly live
Lot while world input is inert. Closing restores the connected Gate opener. Identity loss closes
the Gate-origin profile once and cannot auto-reopen if that raw ID later returns.

`Open Hiring terms · <exact name>` performs the same Lot check and a separate latest App check.
Hiring focuses the exact unique candidate heading, never a term/sign button. Full existing term
cards remain visible and signing still follows only:

```text
HiringMarket
→ exact existing term button
→ signContractAction(state, talentId, termWeeks)
→ Core applyActions signContract
```

Direct Back carries the old exact candidate owner token, rebuilds fresh Gate truth, and restores
that visitor only while ID, name, profession, content seed, eligibility, and complete term identity
still agree. A market rotation that retains the exact candidate and terms remains valid. Removal,
signing, renamed or re-role'd truth, offer drift, duplication, malformed state, or accepted whole-
studio replacement returns to a neutral Gate/Lot without selecting a successor.

## Input, lifecycle, accessibility, and layout

Pointer and touch activation latch the rendered candidate identity at the first accepted down
boundary and consume it at most once. Compatibility mouse events cannot retarget the gesture after
React repaint. Enter and Space are owned on keydown, reject repeat and cross-key tails, and suppress
their compatibility click without suppressing a later fresh virtual-AT `click(detail=0)`. Stale
identity, callback rejection, cancellation, modal entry, hidden visibility, renderer loss, delayed
import/readiness, and accepted studio replacement cancel in-flight activation.

The candidate chooser and inspector use native buttons, visible focus, forced-color treatment,
textual identity/status, and stable headings. Real Chromium retained reachability at governed
desktop sizes, 960×540, maximum camera zoom, CSS magnification, 480×270 at device scale factor 2,
and an effective browser-zoom 200% path. Renderer rejection retained the complete semantic Gate,
candidate, profile, and Hiring path.

Eight final screenshots under `out/world-first-studio-gate-talent-arrival-v1/` were visually
reviewed. They cover physical selection, live-Lot profile, retained fresh return, signed neutral
return, renderer rejection, responsive maximum zoom/CSS 200%, structural headless evidence, and
effective browser zoom.

## Deterministic evidence and assets

Both native evidence generators replayed without modifying their public-action-derived saves or
manifests:

| Evidence | SHA-256 |
| --- | --- |
| Stage 7 blocked | `7534518e4db3970bb4ca988b0b0fa78975f5053ee67fd42377f69b80ebe711dc` |
| Stage 7 ready | `6760b72739608e930da84726067685c515d87817cb3793f9d9d37fa9f2063f92` |
| Stage 7 scheduled | `e922f9b7e957388bed7c7674be8c17596245823200e478371dc7ff970458f46b` |
| Stage 7 unassigned in-memory proof | `2b352e3ef1be5ab9d5e0ba0abfbeb6c0a717f5334afe7d6a60ff5a81cef584ca` |
| scenery manifest | `eee8dd476f3117dccc3c48985797e4a248827fb19b5a15d5c8a125b6c04780e4` |
| Annex Available | `4026c51603afe35605a9d5a71391764cd6dfea3972ef3a8d20ef3b3987dc4652` |
| Annex script Working | `cb49f61ac81d239b14db744fdc7b37b91ccd507e8f0e4a8fda56e802bd96bdc4` |
| Annex production Working | `d7213ae7c064ad59ac685a777042b0b237d9ce1c367a9af3b9d754cb25b8044e` |
| Annex manifest | `43c40208b58f365c726eb1ddba88359e8ba9be3890b400ab92db9b2c47dba8cf` |

Navigation, profile inspection, candidate selection, and return leave serialized GameState bytes
unchanged. The signing journey changes state only through the existing Engine-accepted action and
returns to neutral Gate truth when that candidate ceases to be eligible.

Every frozen presentation asset remains byte-identical:

| Asset | SHA-256 |
| --- | --- |
| runtime district manifest | `23bf9451b3a62099ed724b0f3a4082839b8246862ac5e61f3b72233dc5430d92` |
| source district manifest | `5af27d7a97739724990ec08ef1fe5888eeb069bccc8e81b351271c2268914889` |
| exporter | `405cb831d7d0cf4daaefe2259b0b27160157cbd65cb86c056814059c37b488fe` |
| concept plate | `a6279762ab7db8b5a16ea71627e63ae918b74c2db8e0874731c34c09947e7c34` |
| Gate foreground occluder | `c91b9b831efd9a58ad6047013f300228663dc5ddd410d94188436327c054179a` |
| Role Atlas JSON | `641e007a87e4702641246cf7e36e43e012acdf1fb72a9dbbe0ac868f9d4af89c` |
| Role Atlas PNG | `2790bf72909f0a8b76d2f6d2ca387f68499776ef7db44d847ed03ff28979712b` |

## Performance and behavior boundary

The frozen one-production no-visitor reference remains:

```text
display objects:         34
dynamic actors:          15
decoded texture bytes:   11,096,896
renderer draws:          1
```

The explicitly selected visitor measures exactly 35 objects / 16 actors / 11,096,896 decoded
bytes / one draw. The complete feature delta is therefore one existing-atlas sprite and one actor,
with zero texture bytes, routes, animations, simulations, or draws added. The 120-frame warm-up and
240-frame sustained structural window passed.

No new absolute GPU wall-clock pass is claimed: the GPU-only browser test was intentionally skipped
because `PROJECT_STUDIO_PERFORMANCE_EVIDENCE=1` was not set. The existing thresholds were not run,
relaxed, or inferred from structural parity.

No Core, GameState, SaveFileV11, schema, migration, adapter business law, market generation,
rotation, offer/pricing/signing law, production task/clock, facility/allocation, economy/publicity
tuning, RNG, ledger, manifest, exporter, art, authored atlas, worker location, pathfinding, queue,
autonomy, or renderer-draw behavior changed.

## Final verification

- complete repository suite: **177/177 files, 2,383/2,383 tests passed**;
- focused Gate selector/Scene/Lot/App/Hiring set: **149/149 passed**;
- governed D-16/D-17 harness: **10/10 files, 176/176 tests passed**;
- Chromium Gate specification: **6 passed, 1 GPU-only test intentionally skipped**;
- both TypeScript projects: **passed**;
- production build: **passed, 139 modules transformed**;
- deterministic native SaveFileV11 replay: **byte-identical**;
- structural renderer proof: **34/15 → 35/16 at 11,096,896 bytes and one draw**;
- `git diff --check`, asset provenance, protected-path, and protected-ref checks: **passed**; and
- independent strict contract/implementation audit: **no remaining findings**.

The existing non-fatal large-chunk build advisory remains visible. No extra economy, facility,
construction, or Week-208 corpus is proportional to this UI/world embodiment slice.

## Governing boundary

This milestone creates no candidate, offer, preferred term, negotiation, decline action, arrival
clock, queue, worker location, assignment, reroute, workload, facility, simulation, save field, art,
or one-click contract path. Engine/GameState remains the sole authority; the Gate makes an existing
person and existing decision physically discoverable before the complete Hiring surface supports
it.

The governing status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open. No financing, loan, bailout, restructuring, failure ladder,
arbitrary cash sink, facility tuning, or macroeconomic certification follows.
