# World-First Studio Gate Talent Arrival & Hiring Return V1 Contract

Status: **FROZEN BEFORE IMPLEMENTATION**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Parent authority: `9ed7fc8d7fa7240b8cdc478a0a1b84f5ba769e8b`

Implementation baseline: `6a3f85f2c991b850f065b4fd81ef60a5974a256a`

## 1. Authority base

This contract is governed by:

- the Owner's world-first product ruling: **THE STUDIO LOT IS THE PRIMARY GAME SURFACE.
  MANAGEMENT UI SUPPORTS THE WORLD**;
- the critical-experience rule
  `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME FRESH LIVE WORLD`;
- accepted D-17B and every still-open macroeconomy residual recorded in section 22;
- the accepted Operation Hollywood bridge
  `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21` and marathon integration
  `4432a9befef578ac3549896c2796bf0a22950ec0`;
- World-First Studio Home V1, Named Person Work & Career Inspector V1, Operational Annex Work
  Presence V1, and Selected Stage 7 Production Detail Handoff V1;
- the existing D-11/D-17A Hiring Market, employment card, offer truth, Talent Profile and
  `signContractAction` authority; and
- the Soundstage 12 art no-go at `e9a80cd`, which remains binding and is not reopened here.

This is a frozen forward implementation contract. It preserves every completed milestone and does
not rewrite any earlier evidence result.

## 2. Purpose and measured gap

The accepted Studio Lot already embodies production, publicity, the operational Annex, scenery
load-in, named production people, and exact supporting-panel returns. The accepted physical
`studio-gate` is the only canonical Hollywood place not yet operationalized. It already has a
distinct studio identity, a bounded arrival anchor, and security/arrival affordances, but selecting
it currently falls through to generic Dashboard navigation.

Existing Engine/App authority already provides a deterministic current Hiring Market, exact
public profile facts, current contract terms, complete obligation/runway truth and the only legal
signing action. V1 connects those facts to the physical Gate without creating a second hiring
system or making Hiring a screen-first discovery path.

## 3. Binding world-first loop

The accepted loop is:

```text
PHYSICAL STUDIO GATE OR NATIVE STUDIO GATE
→ FRESH CURRENT CONTRACT-VISITOR SLATE IN THE LIVE LOT
→ EXPLICITLY CHOOSE ONE EXACT NAMED CANDIDATE
→ ONE VISIBLE STATIONARY VISITOR AT THE ACCEPTED ARRIVAL ANCHOR
→ INSPECT EXACT NAME / PROFESSION / FREE-AGENT AVAILABILITY IN THE WORLD
→ OPTIONAL CANONICAL TALENT PROFILE OVER THE SAME MOUNTED LIVE LOT
→ OPTIONAL OPEN HIRING TERMS · <EXACT NAME>
→ FOCUS THE EXACT UNIQUE CURRENT CONTRACT CARD HEADING
→ REVIEW FULL TERMS AND EITHER SIGN AN ENGINE-ACCEPTED OFFER OR RETURN WITHOUT SIGNING
→ BACK TO STUDIO LOT
→ FRESH EXACT GATE VISITOR OR NEUTRAL GATE / LOT WITHOUT SUBSTITUTION
```

No candidate is selected merely because the Gate, Hiring screen, or studio opens. The world first
establishes the person and the need; Hiring remains the deep owner of salary, bonus, guaranteed
obligation, runway and term choice.

The direct deep return may remount the Lot under the current architecture. V1 does not promise the
same Phaser instance, camera transform, animation frame, sprite object or zoom across the Hiring
screen. The Talent Profile is different: it remains the existing App-owned modal over the same
mounted and visibly living Lot.

## 4. Existing market law and the corrected eligibility boundary

The source is `hiringMarketCards(state)`, not raw `hiringMarketIds`, array index zero, the
freelancer market, a new random sample, or a Lot-owned reconstruction.

The current Hiring and freelancer samples can overlap. In that existing edge, a Hiring row may
have `employment.status === 'availableFreelancer'` and zero offer options even though the raw Core
membership check could accept a manually fabricated term. This is an existing UI/Core seam and is
not repaired or exploited here.

One Gate candidate is projected only when the canonical current Hiring card has:

1. exactly one underlying current `state.talent` identity with a non-empty exact profile ID and
   name;
2. a creative role in `actor | director | writer | craft`;
3. `employment.status === 'freeAgent'`;
4. `employment.contract === null`;
5. `employment.freelancerFee === null`;
6. at least one current `offerOption`;
7. every offer's `talentId` exactly equal to the profile ID; and
8. unique positive safe-integer term lengths already in strict ascending order.

Known freelancer-overlap/no-offer rows remain visible on the canonical Hiring screen but are not
misrepresented as actionable Gate contract visitors. V1 adds no manual-term or one-click signing
bypass.

The list may exceed eight. The existing size constant caps only the newly sampled suffix; all
stored free agents are prepended. No V1 layout, selector, test or copy may assume exactly or at
most eight candidates.

## 5. Narrow `StudioLotSnapshot` projection

The Lot continues to see only `StudioLotSnapshot`. Add this optional legacy-fixture-compatible
presentation projection; `studioLotSnapshot(state)` always emits it for an operating studio:

```ts
export type LotGateHiringCandidate = {
  talentId: string
  name: string
  creativeRole: 'actor' | 'director' | 'writer' | 'craft'
  employmentStatus: 'freeAgent'
  offerTermWeeks: number[]
}

export type LotGateHiringMarket = {
  candidates: LotGateHiringCandidate[]
}

type StudioLotSnapshotBase = {
  // existing fields
  gateHiringMarket?: LotGateHiringMarket
}
```

The snapshot's existing `sceneSeed` and `week` carry exact content-seed and market-time context;
they are not duplicated inside every candidate. A seed is not a unique studio/session identity:
the same seed may be used again. Cross-studio isolation therefore also requires the accepted-state-
replacement reset in section 14. The projection copies current read-model facts. It does not expose
an `EmploymentCard`, Core `Talent`, full profile, persona, hidden ability, salary, bonus, obligation,
runway, freelancer fee, RNG state or action.

The adapter skips only known non-eligible Hiring rows. A purported eligible row with duplicate ID,
mismatched offer identity or malformed/nonascending term identity is an adapter invariant failure;
it must not be silently dropped so that another row becomes the apparent replacement.

Projection, selection and return must preserve `GameState`, SaveFile bytes, week, cash, ledger,
market state and RNG byte-for-byte.

## 6. Shared strict Gate hiring selectors

Add one pure shared module with:

```ts
export type GateCandidateOwnerIntent = {
  talentId: string
  studioSeed: string
  name: string
  creativeRole: LotGateHiringCandidate['creativeRole']
}

export type GateHiringMarketContext = {
  studioSeed: string
  marketWeek: number
  candidates: LotGateHiringCandidate[]
}

export type GateHiringCandidateContext = {
  marketWeek: number
  candidate: LotGateHiringCandidate
  ownerIntent: GateCandidateOwnerIntent
}

gateHiringMarketContext(snapshot): GateHiringMarketContext | null
gateHiringCandidateContext(snapshot, talentId): GateHiringCandidateContext | null
sameGateHiringCandidateContext(a, b): boolean
```

`gateHiringMarketContext` returns an empty but valid context when the exact market has no eligible
candidate. It returns `null` rather than a partial list when any of these are true:

- the projection is missing or not an object/array;
- `sceneSeed` is not a string or `week` is not a non-negative safe integer; an empty string is a
  valid SaveFileV11 seed and must remain valid here;
- the snapshot has zero or more than one `gate` building row, or that row is unavailable;
- a candidate record is malformed, has an empty ID/name, invalid role/status or unexpected field;
- term identities are empty, duplicated, non-positive, unsafe or not strictly ascending;
- candidate IDs repeat; or
- a candidate ID collides with a current `snapshot.people` identity.

The one Gate building row must also agree exactly with the accepted candidate slate:

- a positive count requires `attention === 'active'` and the exact reason
  `1 candidate with current contract terms` or `<N> candidates with current contract terms`; and
- zero requires `attention === 'empty'` and the exact reason
  `No candidates with current contract terms`.

Duplicate display names are legal and remain separate exact-ID rows. Array order never grants
identity or consent.

`gateHiringCandidateContext` accepts exactly one ID match. `sameGateHiringCandidateContext`
compares every own projected field, including studio seed, market week, name, creative role,
employment status and complete term sequence. Neither selector calls Core, derives the private
13-week rotation epoch, mutates input, consumes RNG, chooses a candidate or repairs malformed data.

## 7. Explicit candidate selection and transient provenance

Opening the Gate creates a chooser, not a selection. It shows:

- `Studio Gate`;
- the exact current week;
- the exact number of candidates with current contract terms;
- one native button per exact candidate, labelled by exact name and profession; and
- `No candidates with current contract terms` when the valid list is empty.

Only activating one exact candidate button may own a candidate context. The selected ID is
transient React/UI session state, not `GameState`, a save field, a queue, a destination, a job, an
arrival clock or proof that the person physically travelled.

Selecting another candidate replaces only the transient visitor after validating the requested
exact ID. Selecting a production person, production, building, publicity, Annex, service yard,
generic place, or deep navigation clears the candidate and removes the visitor. No code may select
the first remaining candidate as a fallback.

## 8. Exact accepted runtime Gate authority

The consumed runtime manifest is the only physical authority for this slice:

```text
canvas       1586 × 992
id           studio-gate
buildingId   gate
label        Studio Gate
polygon      [[930,570],[1586,529],[1586,992],[900,992],[820,900],[835,720]]
guard        [853,720]
arrival      [1227,844]
affordances  [gate-security,arrival]
foreground   gate-foreground-occluder / occluder / depth 90
             output gate-foreground-occluder.png / x 568 / y 504 / width 1019 / height 489
```

Frozen SHA-256 evidence:

- runtime manifest: `23bf9451b3a62099ed724b0f3a4082839b8246862ac5e61f3b72233dc5430d92`;
- source manifest: `5af27d7a97739724990ec08ef1fe5888eeb069bccc8e81b351271c2268914889`;
- exporter: `405cb831d7d0cf4daaefe2259b0b27160157cbd65cb86c056814059c37b488fe`;
- concept plate: `a6279762ab7db8b5a16ea71627e63ae918b74c2db8e0874731c34c09947e7c34`;
- Gate foreground occluder:
  `c91b9b831efd9a58ad6047013f300228663dc5ddd410d94188436327c054179a`;
- Role Atlas JSON: `641e007a87e4702641246cf7e36e43e012acdf1fb72a9dbbe0ac868f9d4af89c`; and
- Role Atlas PNG: `2790bf72909f0a8b76d2f6d2ca387f68499776ef7db44d847ed03ff28979712b`.

The stale source polygon
`[[593,548],[1586,529],[1586,992],[574,992]]` is not accepted runtime geometry. V1 must not run
the exporter, edit source/runtime manifests, change the plate or occluder, or reconcile this
deliberate divergence.

The scene accepts exactly one complete canonical Gate record, exact `1586 × 992` manifest canvas,
and exactly one complete foreground layer with the frozen identity, kind, depth, output and bounds
above. Missing, duplicate, Gate-like conflicting, malformed, non-finite, self-intersecting,
wrong-key, wrong-anchor, reordered-affordance, source-polygon, wrong-canvas or wrong-foreground
records receive no Gate zone or visitor. This local fail-closed result must not disable unrelated
Hollywood places.

## 9. Physical, status and native Gate parity

The physical Gate polygon and the native `lot-nav-gate` companion both enter the same React-owned
Gate chooser. The scene emits only exact Gate identity. The host reruns the market selector before
showing any candidate.

The Gate's existing snapshot `BuildingState` becomes an exact visible status: `active` with
`<N> candidates with current contract terms` when the eligible count is positive, otherwise
`empty` with `No candidates with current contract terms`. This is derived once at the adapter
boundary from the same projected slate and adds no Lot-side market rule.

The native path remains complete while Phaser is loading or unavailable. When a live validated
renderer exists, native Gate entry also paints the exact Gate outline and may focus the Gate. A
false renderer selection result changes only physical availability; it cannot reroute to Dashboard
or remove semantic candidate controls.

The old generic `BUILDING_ACTION.gate → Dashboard` mapping remains a compatibility fallback outside
the Hollywood operational seam. It is not deleted or treated as the new primary Gate behavior.

## 10. Dedicated one-visitor renderer seam

The visitor must not be appended to `snapshot.people`. That collection represents production or
studio-roster people and feeds a work selector that intentionally rejects `district-managed`
provenance. Reusing it would also place the candidate at a production-person home coordinate and
mislabel them as studio staff.

Use a distinct, presentation-only shape equivalent to:

```ts
export type HollywoodGateVisitorPresentation = {
  talentId: string
  name: string
  marketRole: 'actor' | 'director' | 'writer' | 'craft'
  presentationRole: 'director' | 'talent'
  employmentStatus: 'freeAgent'
  studioSeed: string
  marketWeek: number
  offerTermWeeks: number[]
  placeId: 'studio-gate'
}
```

The host maps `director → director` and `actor | writer | craft → talent` solely as an existing
atlas presentation category. Exact profession remains visible in the DOM. It is forbidden to imply
Writer → Stagehand, Craft → Grip, employment, production assignment or an invented occupation.

`StudioLotView` retains the latest complete requested visitor across delayed scene readiness and
exposes a nullable set/reconcile seam, a host Gate selection seam and a distinct visitor-selection
callback. The scene independently validates the current snapshot candidate, studio seed, market
week, complete term identity and canonical Gate before creating one sprite. A canvas visitor click
emits identity only; React reruns the shared selector.

The visitor is stationary at the exact arrival anchor `[1227,844]`, south-facing, origin
`0.5 / 0.92`, existing actor scale and depth `97`. The accepted Gate foreground is depth `90`; the
existing moving car is depth `96`. The visitor has no route, tween, arrival ceremony, update-loop
movement or Phaser nameplate. Exact name/profession/availability live in the inspector.

Snapshot replacement reconciles same, changed, removed and invalid truth. Missing or invalid
truth removes the sprite and selection; a different candidate is never substituted. Reduced
motion does not alter its position or truth.

## 11. Gate inspector and canonical profile

An explicitly selected candidate owns one in-world Gate inspector with:

- `SELECTED GATE VISITOR`;
- exact name;
- exact profession label;
- exact `Free agent` availability;
- exact count/list of current term lengths, without prices;
- `Open talent profile`; and
- `Open Hiring terms · <exact name>`.

The inspector must not say employed, arrived, queued, waiting, travelling, assigned, hired or
declined. It must not show a guessed location, workload, relationship, fatigue or career status.

Profile opening uses a dedicated Gate callback. Lot first compares the exact rendered context to a
fresh context from `latestSnapshotRef.current`. App then independently regenerates the latest Lot
snapshot from `latestStateRef.current`, requires exactly one underlying `state.talent` identity
with the same exact owner ID/name/profession, and only then opens the existing canonical Talent
Profile drawer.

The existing drawer remains the sole detailed profile owner. It opens above the same mounted Lot;
the world stays visibly alive and all world/native input becomes inert. Close restores focus to the
connected Gate opener. If the candidate becomes invalid while the profile is open, Lot closes only
that raw profile ID once, removes the visitor, does not auto-reopen if the ID later returns, and
focuses fresh Gate truth after the inert state clears.

## 12. Exact Hiring handoff and focus

`Open Hiring terms · <name>` is a secondary supporting action. The same rendered/latest Lot check
and independent latest App check apply. Navigation carries identity only; no offer, command,
salary or cached card is passed into Hiring.

`HiringMarket` gains optional `focusTalentId`. It independently builds its current canonical
contract cards and accepts focus only when exactly one card has that ID, exactly one underlying
`state.talent` identity exists, and the complete section 4 Gate eligibility predicate still holds.
Snapshot projection, App revalidation and focused Hiring validation must share one adapter-owned
eligibility helper so this predicate cannot drift.

The stable `Contract market` heading is programmatically focusable. Each contract card has one
stable programmatically focusable heading. Exact unique entry focuses the candidate heading, never
a term/sign button. Missing, duplicate, no-offer, freelancer-only or malformed focus falls to the
stable market heading, never another card.

Initial focus is consumed once. Sorting cannot steal or repeat it. An accepted signing that removes
the focused card moves focus to the stable Contract market heading/status after fresh render; it
does not focus the next card. A rejected signing stays loud, byte-identical and on the initiating
control.

## 13. Existing signing law remains sole authority

All monetary and legal action remains:

```text
HiringMarket
→ exact existing term button
→ signContractAction(state, talentId, termWeeks)
→ Core applyActions signContract
```

V1 does not add a Gate sign button, preferred/default term, negotiation, decline/leave action,
reservation, hold, countdown, AI choice, affordability gate or alternate signing path. A signing
can be rejected when the current cash cannot cover its bonus. The truthful choice is to review
terms and either sign an Engine-accepted offer or return without signing.

## 14. Typed candidate return and fresh fallback

Add transient typed navigation arms equivalent to:

```ts
type OrdinaryLotEntryFocus =
  | /* existing */
  | 'gate-arrivals'

type StudioReturnContext =
  | /* existing */
  | {
      kind: 'lot'
      focus: 'gate-candidate'
      candidate: GateCandidateOwnerIntent
      suppressOperationalAnnouncement: boolean
    }

type Screen =
  | /* existing */
  | {
      kind: 'hiring'
      returnContext: StudioReturnContext
      focusTalentId?: string
    }
  | {
      kind: 'lot'
      entryFocus: 'gate-candidate'
      entryGateCandidate: GateCandidateOwnerIntent
    }
```

The owner intent is UI session state, not persisted state. It includes exact ID, content seed,
selected name and selected profession to reject ordinary stale, renamed or re-role'd truth. The
content seed is supplementary provenance, not a globally unique studio identifier.

Every accepted New Studio, loaded-save or equivalent whole-studio state-replacement path must
unconditionally clear Gate selection, visitor presentation, held activation, open Gate-origin
profile and Gate return intent before the replacement can render. This reset is required even when
the replacement has the same seed and deterministic same candidate ID/name/profession. Initial
session recovery starts with no Gate return intent. This lifecycle reset, rather than seed
uniqueness, owns cross-studio isolation.

Direct Hiring **Back** remounts one Lot from current App state and reruns the selectors. When the
same exact owner identity remains one current eligible candidate, return restores that visitor
from fresh fields, paints the Gate when possible, and focuses the stable visitor inspector heading.
It does not replay an arrival.

Signing, removal, offer loss, contracted/busy/freelancer-only transition, duplicate identity,
rename, profession change, different content seed, accepted whole-studio replacement, or a
rotation that removes the exact candidate returns to a neutral Gate chooser with no visitor and
focuses its heading. If the Gate market context itself is unavailable, return focuses the stable
Studio Lot heading.

A market rotation that retains the same exact eligible candidate does not manufacture a
disappearance. V1 reads fresh `week` and market cards but never derives `floor(week / 13)` or
reimplements rotation law.

Opening Create Custom Talent or unrelated deep navigation demotes `gate-candidate` to
`gate-arrivals`. It may return to a fresh Gate slate, never the old selected person by implication.
The shared transient-context demotion helper must cover both Stage 7 and Gate rather than leaving a
Stage-7-only special case.

## 15. Rendered-token and independent latest-state checks

Both candidate actions latch the complete rendered `GateHiringCandidateContext` and action kind at
activation start. On activation, Lot recomputes a context from `latestSnapshotRef.current` and
requires field-exact equality through `sameGateHiringCandidateContext`.

If any rendered field changed, no callback fires. Lot clears the stale visitor as necessary,
announces that current Gate details changed, and focuses the fresh same candidate heading when
still valid or the Gate heading when not. It never promotes another candidate.

After the Lot check passes, App independently snapshots `latestStateRef.current`, reruns the same
selector and requires the full owner intent. A failed App check returns `false`; Lot stays mounted,
announces unavailability and focuses fresh world truth. A callback may never trust a cached
`GameState`, prior profile, Hiring card, array position or scene event.

## 16. Exact-once input contract

Candidate selection itself and both stale-sensitive actions support pointer, touch, keyboard and
virtual assistive-technology activation exactly once.

For profile/Hiring actions:

- latch `{ action, context }` on pointer/mouse/touch start only when no token is in flight;
- cancel on `pointercancel`;
- Enter and Space activate on keydown with `preventDefault`, repeat/held-key protection and one
  suppressed later compatibility click;
- preserve virtual-AT `click(detail === 0)`;
- ignore multi-click and a second activation while navigation is pending;
- suppress only the one delayed pointer compatibility click whose gesture was canceled; and
- clear every token/held key/pending state on modal onset, document hiding, renderer failure,
  renderer readiness/recreation, dynamic-import failure, context clear and unmount.

An action may not fire after its candidate, Gate, modal, renderer or visibility context changed.
Phaser document-level pointer listeners must not receive a DOM inspector or candidate-list gesture.

## 17. Renderer, modal, visibility and lifecycle failure

Renderer loading/failure never removes the semantic Gate chooser, visitor inspector, profile or
Hiring path. A malformed runtime Gate disables only physical Gate selection/visitor rendering;
semantic controls continue from the strict snapshot context and state their physical unavailability.

When the current live renderer becomes ready or is recreated, latest transient truth wins:

- current valid candidate → one sprite and Gate outline;
- neutral Gate → Gate outline and no sprite;
- cleared/stale candidate → no sprite and no resurrection.

Hidden tabs pause the existing renderer policy. Resume, reduced-motion toggles, modal close and
context restoration do not create a second sprite, replay selection, fire navigation or move the
visitor. Context loss clears physical state once while semantic state remains complete.

## 18. Accessibility, responsive layout and camera

The Gate chooser and inspector are semantic DOM, not canvas-only. They provide stable headings,
button names with exact person/profession, visible focus, `aria-pressed` candidate selection,
live status for stale/rejected handoffs, and text in addition to tint/outline.

The candidate list supports zero, ordinary and greater-than-eight counts without overlapping the
camera controls, companion navigation, inspector actions or viewport edge. It remains usable at:

- fit and maximum Hollywood zoom;
- reduced motion;
- 960 × 540 compact viewport;
- narrow/mobile layout; and
- effective 200% text/layout scale.

Zoom changes the visual story noticed; it does not remove the native Gate or the ability to inspect
and hand off the candidate.

## 19. Frozen structural and performance boundary

The sprite-only selected visitor has this exact expected delta:

```text
preselection frozen one-production reference   34 objects / 15 actors
selected visitor reference                     35 objects / 16 actors
delta                                           +1 object / +1 actor
decoded asset bytes                            11,096,896 unchanged
encoded asset bytes                            +0
draws                                           1 required
routes / tweens / per-frame visitor work       +0
```

The decoded total remains
`9,164,360 + 1,769,472 + 143,856 + 19,208 = 11,096,896` bytes. The atlas PNG remains 287,917
encoded bytes and 1,769,472 decoded bytes.

No Phaser nameplate, Graphics object, text object, zone, texture, atlas frame, image, route, tween,
timer or update-loop actor is authorized for the visitor. The existing Gate polygon zone is reused.

Fresh 120-frame warm-up plus 240-frame sustained telemetry must retain the existing absolute
thresholds: at least 50 FPS average, at least 30 FPS 1% low, at most 33.4 ms p99 and worst frame,
average update at most 1.0 ms, worst update at most 5.0 ms, exactly one draw, and the exact
object/actor/byte counts above. The dedicated visitor must be included explicitly in
`dynamicActors`; being outside `snapshot.people` cannot exclude it from telemetry. Default
headless wall-clock results must be labelled honestly; structural proof is not a fabricated device
GPU result.

## 20. Required automated and browser proof

Focused tests must cover at least:

1. normal, valid empty-string-seed, empty, duplicate-name and greater-than-eight market
   projections;
2. a known freelancer-overlap first card with zero offers;
3. duplicate/malformed candidate, mismatched offer ID and invalid/nonascending term identity;
4. missing/duplicate/unavailable Gate building projection, candidate/person collision, and every
   Gate attention/reason/count mismatch;
5. explicit selection only, array reordering and no first-candidate fallback;
6. canonical runtime Gate plus every canvas/layer/identity/anchor/affordance/polygon mutation,
   Gate-like duplicate and stale-source polygon;
7. one visitor same/change/remove/invalid/latest-wins reconciliation, exact anchor/depth/facing,
   atlas/fallback and zero movement;
8. physical/native Gate and canvas/native visitor parity;
9. profile over one mounted live world, stale invalidation and focus restoration;
10. exact Hiring heading focus, duplicate underlying `state.talent` identity, missing/duplicate
    fallback, sort stability, accepted-sign successor focus and rejected-sign retention;
11. affordable signing, cash-gate rejection, successful removal and neutral return;
12. removed/retained rotation identity, signed/busy/freelancer/contracted transition,
    rename/re-role, duplicate, different-seed replacement and same-seed accepted whole-studio
    replacement;
13. stale pointerdown → snapshot replacement → click, pointer cancel, keyboard repeat,
    virtual-AT, modal, hidden tab, delayed ready, recreation and renderer failure;
14. byte-identical state/save/RNG before and after projection, selection, profile and navigation;
15. exact 34/15 preselection and 35/16 selected structural references at 11,096,896 bytes and
    one draw; and
16. compact, narrow, effective-200%, reduced-motion, fit and maximum-zoom layouts.

Final verification is proportional but complete for the touched authority: TypeScript, focused
Vitest, full repository Vitest, governed D-16/D-17 suites, production build, deterministic native
evidence replay, structural/performance evidence, and real Chromium world-first journeys.

## 21. Keep / Kill gate

KEEP only when an ordinary player can enter the physical or native Gate, understand the exact
current slate, deliberately choose one person, see that one person in the world, inspect a canonical
profile without leaving the live Lot, open exact complete Hiring terms, act through existing
Engine law, and return to fresh Gate truth without substitution.

KILL or revise before closure if any implementation:

- selects or focuses a first/default candidate;
- calls a freelancer/no-offer row a contract visitor;
- signs from the Lot or hides complete obligations;
- describes a decline/leave action that does not exist;
- turns the visitor into a persisted arrival, employee, job, queue or pathfinding result;
- appends the visitor to production/roster people;
- accepts stale/source Gate geometry or edits/runs the exporter;
- substitutes another candidate after signing/removal or a rotation that removes the exact
  candidate;
- makes Hiring the primary discovery surface;
- loses semantic operation under renderer failure; or
- exceeds the frozen structural/performance boundary without a new reviewed contract.

## 22. Explicit non-goals and open residuals

V1 does not add or tune:

- candidate generation, market size, market rotation or freelancer sampling;
- employment priority, offer formulas, terms, salary, bonus, runway or signing legality;
- negotiation, rejection, decline, reservation, rival hiring or candidate AI;
- authoritative location, arrival/departure clock, pathfinding, autonomous needs or relationships;
- facility, construction, maintenance, workload or queue law;
- manifest, exporter, plate, occluder, Role Atlas or new character art;
- SaveFile/schema fields, Core actions or economy tuning;
- Soundstage 12 presentation or service-yard-to-Post relabelling; or
- financing, loans, bailouts, restructuring, hard bankruptcy, failure ladder or arbitrary cash sink.

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Open residuals remain cash runaway, top-studio economic immortality, the week-208 synchronized
roster wall, P5 dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining
menu breadth and formal G12 timing. This world-first presentation/handoff slice does not conceal,
reclassify or certify any of them.

## 23. Closure record requirement

If implementation passes the Keep gate, close it with a dedicated evidence record and closure
record, exact implementation commit, final test counts, deterministic hashes, structural delta,
renderer limitations and next world-first critical-experience audit. Update `CURRENT-BEST.md`,
`NEXT-HIGHEST-LEVERAGE.md`, `PROGRESS.md`, `MARATHON-LOG.md`, `HANDOFF.md` and canonical Lessons
Learned as appropriate.

Do not merge, push or tag from this marathon branch unless separately and explicitly authorized.
