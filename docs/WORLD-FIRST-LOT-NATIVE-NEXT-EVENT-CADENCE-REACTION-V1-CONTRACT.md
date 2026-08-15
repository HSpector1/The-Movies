# World-First Lot-Native Next-Event Cadence & Reaction V1 Contract

Status: **FROZEN — BINDING IMPLEMENTATION AUTHORITY**

Date: 2026-08-15

Branch: `operation-hollywood-autonomous-marathon`

Formation contract authority: `6ec10a6e4801dc7d1cd60932fb53a76160c57bb4`

Formation implementation authority: `345a89281ad1e89ac32f07082d4eb34ac664f280`

Formation closure authority and implementation parent:
`7966603ae8cc85702e10e10e8850f9481dd322b2`

Scope state: **BOUNDED IMPLEMENTATION FREEZE**

## 1. Authority and implementation boundary

This binding contract follows:

- the Owner's binding ruling that **THE STUDIO LOT IS THE PRIMARY GAME SURFACE. MANAGEMENT UI
  SUPPORTS THE WORLD**;
- the world-first interaction grammar
  `WORLD → INSPECT / ACT → DEEP PANEL IF NEEDED → RETURN TO THE SAME FRESH LIVE WORLD`;
- accepted D-17B and every still-open macroeconomy residual preserved in section 28;
- D-12 `advanceToNextEvent`, `SimResult`, `WeeklySummary`, release-development, session Autopsy,
  theatrical-run, employment, and Engine-derived stop-message authority;
- World-First Live Week Advance V1 contract `3391528d7dedc45e24166599cf145a4358574a12`,
  implementation `621e7e139456ae21dd0dd420bf8fcaf16af1f454`, and closure
  `a9be11676f2e3d96a6bc9dc6c5f03744fff62c4b`;
- the accepted world-first Studio Home, Named Person, Soundstage, Annex, Scenery, Publicity,
  Stage 7 detail, and Gate contracts and closures;
- the frozen Greenlight Production Formation contract
  `6ec10a6e4801dc7d1cd60932fb53a76160c57bb4`; and
- the current App-owned `handleSimToEvent`, typed `StudioReturnContext`,
  `StudioLotScreen`, `studioLotSnapshot`, and renderer-failure semantic companion at the Formation
  implementation parent.

The product and technical scope below is deliberately specific and is now the frozen implementation
authority. Greenlight Production Formation has a clean implementation authority and accepted
closure authority, recorded above with the exact implementation parent. Production implementation
must conform to this bounded contract; no scope beyond it is implied.

Protected authority remains:

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`;
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`; and
- accepted Gate implementation: `ca8279cfb91990ef1904e36fa1d92d762811d180`.

No merge, push, tag, or protected-ref movement is authorized by this document.

## 2. Purpose and measured world-first break

The accepted Lot already owns a real one-week Engine action. It can expose and resolve a Stage 7
blockage, move a named Director through the accepted cosmetic route, clear scenery, schedule a
take, advance one authoritative week, and repaint fresh truth in the same mounted world.

The next cadence break is that the larger existing **Sim to next event** action is still discovered
and initiated only through Dashboard. A player who wants to let ordinary studio work advance until
something requires attention must leave the primary game surface before the simulation even
starts. When the event is not a release, the current App then opens a full-screen Weekly Summary,
so the player sees the reason and numbers without seeing which part of the studio now needs them.

V1 closes only that break. It adds one Lot-native semantic cadence action, calls the existing
adapter exactly once, and turns a non-release stop into a bounded event/reaction rail attached to
the same mounted living Lot. The rail orients the player toward current world truth and offers the
existing deep owner only when the decision needs it.

This is not intermediate-time animation. `advanceToNextEvent` remains a synchronous deterministic
batch of existing weekly ticks. The player sees the truthful starting Lot and the truthful final
event state; V1 must not claim that skipped weeks, travel, work, queues, or facility occupancy were
watched as they happened.

## 3. Binding world-first loop

The binding ordinary-player loop is:

```text
LIVING STUDIO LOT / CURRENT WORK
→ NATIVE SIM TO NEXT EVENT
→ ONE APP CALL TO THE EXISTING ADVANCE-TO-NEXT-EVENT ADAPTER
→ EXACT FINAL ENGINE STATE AND ENGINE-DERIVED STOP REASON
→ SAME MOUNTED LOT FOR EVERY NON-RELEASE STOP
→ EXACT WORLD ORIENTATION + BOUNDED EVENT/REACTION RAIL
→ ACT IN WORLD OR OPEN THE EXACT SUPPORTING SURFACE
→ RETURN TO FRESH EXACT EVENT CONTEXT OR A NEUTRAL LIVE LOT
```

A release remains a legitimate interruption:

```text
LOT-NATIVE SIM
→ RELEASE ON THE GOVERNED STOPPING TICK
→ EXISTING NEWSPAPER / RELEASE RESULT / AUTOPSY CHAIN
→ RETURN TO THE STUDIO LOT THAT INITIATED THE SIM
```

The action does not introduce pause, speed, autoplay, a second clock, a renderer clock, or a
background simulation. It does not replace `Advance one week`; both controls remain distinct:

- `Advance one week` advances exactly one existing tick even when a decision is waiting, under the
  closed Live Week contract; and
- `Sim to next event` advances unattended only while no unified player decision is already
  waiting, then stops at the first governed boundary.

## 4. Existing Engine and adapter authority

`ui/src/engine/adapter.ts::advanceToNextEvent(state)` remains the only next-event authority. It
iterates the real Core tick with `{ develop: true }`, never edits the market week, and returns the
existing `SimResult`:

```ts
type SimResult = {
  preTick: GameState
  next: GameState
  released: FilmResult[]
  completedRuns: { productionId: string; title: string }[]
  fromWeek: number
  toWeek: number
  weeks: number
  stopReason: SimStopReason
  productionDecision: ProductionBoardCardView | null
  scriptDecision: ScriptProjectsReadModel['nextDecision']
  castingDecision: CastingReviewDecisionView | null
  constructionCompletion: ConstructionCompletionSummary | null
  stopMessage: string
  guardHit: boolean
  summary: PeriodSummary
}
```

The existing 520-week `SIM_CAP` remains only a safety guard. The App and Lot must not copy the
loop, call `advanceWeek` repeatedly, derive a stop from snapshots, invent an earlier stop, reorder
Core effects, or rerun the adapter to verify it. For every governed stop, `preTick` is the state
immediately before the stopping tick, not the initial state. Guard exhaustion has no stopping tick;
for `limit`, the current adapter therefore retains the rendered initial state as `preTick`. The
final period remains the adapter's exact ledger-derived interval `[fromWeek, toWeek - 1]`.

One accepted Lot gesture must produce state, RNG, ledger, development, theatrical, contract,
construction, workflow, reservation, release, and SaveFileV11 bytes identical to one direct
`advanceToNextEvent` call on the same exact pre-state.

## 5. Exact stop priority and co-event law

The current adapter's order is binding and must not be reconstructed in React. After each completed
tick, the first primary stop below wins:

| Priority | `stopReason` | Binding meaning |
| ---: | --- | --- |
| 1 | `release` | One or more films were appended on the stopping tick. |
| 2 | `scriptReview` | The unified studio selector exposes an actionable screenplay review. |
| 3 | `castingReview` | The unified selector exposes an actionable casting review. |
| 4 | `productionDecision` | The unified selector exposes an actionable managed Production Operations command. |
| 5 | `runCompleted` | One or more active theatrical runs ended on the stopping tick. |
| 6 | `cashNegative` | Studio cash crossed from non-negative to below zero. |
| 7 | `contractExpired` | The contract collection shrank on the stopping tick. |
| 8 | `renewalWindow` | At least one additional contract entered its renewal window. |
| 9 | `constructionCompleted` | The committed Annex completed and no higher-priority event owned the tick. |
| 10 | `limit` | The 520-week guard was reached with no governed event. |

The preflight unified decision priority is exactly:

```text
scriptReview → castingReview → productionDecision
```

An already-waiting unified decision returns the current state with zero weeks under existing
adapter law. The Lot UI prevents that no-op path under section 6; the adapter behavior remains a
defensive compatibility boundary and test oracle, not a second player-visible ceremony.

`constructionCompletion` is orthogonal to the primary reason. When Annex completion shares a tick
with release, screenplay, casting, production, run, cash, expiry, or renewal, the higher reason
keeps the stop priority and world/deep routing. The exact completion is still carried once to the
first post-sim player surface. React must not promote construction over the primary reason or infer
completion from an already-Operational snapshot.

## 6. Exact Lot eligibility

The native Lot action is available only when all are true:

1. an operating Studio Lot is mounted through the already-enabled Studio Home path;
2. App has one current non-null `GameState` and the control was rendered from that exact object;
3. `studioDecision(currentState) === null` at render and again at activation;
4. no next-event activation is already held or accepted for that rendered state;
5. no App-owned Talent Profile or other modal has made the world inert; and
6. the control itself is connected, visible, and enabled.

When `studioDecision` is non-null, use a real disabled button and visible reason naming the existing
owner:

- screenplay review → Writers' Room;
- casting review → Casting Room; or
- production decision → the exact production/world problem.

Do not call the adapter and then use its zero-week result merely to discover what
`studioDecision(state)` already authoritatively exposes. Do not disable the one-week action: the
closed Live Week law deliberately permits a week to pass while a decision waits.

Cash below zero, a capacity hold without a player command, active theatrical runs, Annex
construction, renderer failure, reduced motion, and Legacy Operations are not new UI-only
ineligibility rules. The existing adapter owns what event follows from those states.

The control is present on every adopted Studio Lot path on which `Advance one week` is already
present. Operation Hollywood may add physical orientation, but Hollywood presentation is not a
legality requirement. Classic/semantic Lot rollback retains the authoritative action and truthful
event rail without making Hollywood claims. If Studio Home itself is disabled, Dashboard remains
the only next-event origin exactly as before.

## 7. App-owned exact state and one-gesture law

The Lot host receives an intent callback. Phaser receives no Engine function, `GameState`, clock
callback, stop selector, route owner, or mutation authority.

App binds each displayed action to the exact `GameState` object rendered into that Lot. On
activation it must:

1. synchronously contain pointer, mouse, and touch down event families in the React overlay;
2. reject repeat/cross-key/compatibility tails already held for that control;
3. read `latestStateRef.current`;
4. require object identity with the rendered pre-state;
5. independently require `studioDecision(current) === null`;
6. synchronously claim the gesture before calling the adapter;
7. call `advanceToNextEvent(current)` exactly once;
8. validate/build the transient receipt in section 8 without rerunning simulation;
9. synchronously move `latestStateRef.current` to `result.next` before publishing React state;
10. replace App `GameState` exactly once with `result.next`; and
11. route from the exact result under sections 11–14.

The native button's ordinary `click` activation owns Enter, Space, pointer, touch, virtual-AT, and
switch input. Do not also dispatch the action from a keydown handler. Double click, key repeat,
pointer→mouse compatibility sequences, touch→click compatibility, cross-key tails, focus changes,
rerenders, effects, StrictMode, renderer readiness, and receipt presentation must never call the
adapter again for the same rendered pre-state.

If the rendered pre-state is stale, App performs no simulation, no state replacement, no route,
and no event ceremony. If `advanceToNextEvent` throws, App keeps the current state and world,
releases the held gesture safely, and exposes one concise semantic failure alert; it does not retry
automatically or accept a partial state.

## 8. Strict transient next-event receipt

Add one pure App-side constructor and one complete comparator equivalent to:

```ts
type LotNextEventStopReason = Exclude<SimStopReason, 'release' | 'limit'>

type LotNextEventWorldTarget =
  | { kind: 'script'; projectId: string; title: string; buildingId: 'writers' }
  | {
      kind: 'casting'
      sessionId: string
      projectId: string
      title: string
      buildingId: 'casting'
    }
  | {
      kind: 'production'
      productionId: string
      title: string
      location: 'stage-7' | 'stage-12-semantic'
    }
  | {
      kind: 'run-completed'
      runs: { productionId: string; title: string }[]
      buildingId: 'theater'
    }
  | { kind: 'cash'; buildingId: 'admin' }
  | { kind: 'contracts'; change: 'expired' | 'renewal'; buildingId: null }
  | {
      kind: 'construction'
      projectId: string
      facilityId: string
      name: string
      buildingId: 'expansion'
    }

type LotNextEventReceipt = {
  fromWeek: number
  toWeek: number
  weeks: number
  stopReason: LotNextEventStopReason
  stopMessage: string
  summary: PeriodSummary
  cashNow: number
  completedRuns: { productionId: string; title: string }[]
  constructionCompletion: ConstructionCompletionSummary | null
  target: LotNextEventWorldTarget
}

acceptedLotNextEventReceipt(
  renderedBefore: GameState,
  result: SimResult,
): LotNextEventReceipt | null

sameLotNextEventReceipt(
  left: LotNextEventReceipt,
  right: LotNextEventReceipt,
): boolean
```

Names may change only to fit existing module conventions; the closed shape and semantics may not.
The receipt is UI-session provenance derived from the one exact adapter result. It is not an
Engine event, action, save field, event log, analytics record, or alternate summary calculation.

The constructor accepts only when all common invariants hold:

- `renderedBefore !== result.next` and all three state seeds agree exactly. Immediately before the
  sole adapter call, App must already have proven `latestStateRef.current === renderedBefore`; that
  exact synchronous object check plus the direct call/result is the session-lineage proof the pure
  constructor cannot infer. Seed equality is necessary transition provenance, never a claim that a
  seed is a globally unique studio identity;
- `result.fromWeek`, `result.toWeek`, and `result.weeks` are safe integers,
  `result.fromWeek >= 0`, `result.fromWeek === renderedBefore.market.tick`,
  `result.toWeek === result.next.market.tick`, and
  `result.weeks === result.toWeek - result.fromWeek`;
- `weeks` is positive for the exact-receipt Lot-visible path, and
  `result.preTick.market.tick === result.toWeek - 1`; `preTick` is the exact state before the
  stopping tick and may equal `renderedBefore` only for a one-week result;
- reason is neither `release` nor `limit`, `released` is empty, and `guardHit === false`;
- `stopMessage` is a non-empty exact adapter string;
- the complete `summary` has exactly the own keys `fromWeek`, `toWeekInclusive`, `weeks`, `payroll`,
  `overhead`, `studioRevenue`, `boxOfficeLump`, `production`, `publicity`, `construction`,
  `otherCash`, `netCash`, `releases`, and `completedRuns`; its range/count fields `fromWeek`,
  `toWeekInclusive`, `weeks`, `releases`, and `completedRuns` are finite safe integers, while every
  monetary field is a finite number retained exactly without rounding or tolerance;
  `releases >= 0`, `completedRuns >= 0`, and its range is exactly `fromWeek`, `toWeek - 1`, and
  `weeks`;
- `result.next.studio.cash` is a finite number and is retained exactly as `cashNow` without rounding
  or tolerance;
- decision payloads are mutually exclusive and agree with the reason;
- completed-run identities are present only for `runCompleted`; the array is non-empty, every
  production ID/title is non-empty, production IDs are unique, and order/fields are exact with the
  adapter result;
- `constructionCompletion` has exactly the existing completion keys, non-empty identity/name/message,
  a safe-integer `completedWeek === result.toWeek`, and an exact join to the one current governed
  Annex when present; it is required when the primary reason is `constructionCompleted`; and
- a reason-specific target can be proven from the exact result and current post-state without
  selecting by array position, title, first/last item, or guessed ID.

Every reason target is likewise a complete closed record: no extra own key is accepted, every
required ID/title/name is non-empty, arrays have exact order and length, and nested records reject
missing or additional fields. A receipt `buildingId` names the semantic Lot companion. It does not
by itself prove that Operation Hollywood has a physical place for that building.

Reason-specific strictness is binding:

- `scriptReview`: exactly one current unified decision with the same project ID, title, kind, and
  complete legal-action projection;
- `castingReview`: exactly one current unified decision with the same session ID, project ID,
  title, and kind;
- `productionDecision`: exactly one current managed decision card with the same production ID and
  every current card/command/blocker field; its exact Lot operation has `locationBuildingId ===
  'stage-a'` for Stage 7 or `locationBuildingId === 'stage-b'` for the truthful Stage 12 semantic
  fallback; every other facility/location fails neutral;
- `runCompleted`: every adapter-reported production ID/title is unique and joins current released/
  theatrical truth without another run substituting;
- `cashNegative`: `result.preTick.studio.cash >= 0` and `result.next.studio.cash < 0`;
- `contractExpired`: the stopping pre-state has more contracts than the post-state, but the receipt
  retains only the generic change kind because `SimResult` carries no exact talent ID;
- `renewalWindow`: the existing employment helper proves that the post-state has more open renewal
  windows than the stopping pre-state, but the receipt retains no talent identity;
- `constructionCompleted`: the exact completion identity and completed week map to the one governed
  Annex parcel/current Operational projection.

`limit` deliberately has no exact receipt or world target. The adapter has no governed stopping
tick to orient, so a valid guard result goes directly to the primitive-only neutral arm in section
18. Its adapter-level proof still requires `guardHit === true`, `weeks === 520`, the original
rendered state as `preTick`, and no decision, release, completed run, or completion target.

The constructor validates a decision's complete current projection against the exact adapter result,
but the receipt deliberately does not cache a mutable screenplay/casting/Production Board card.
Later actions use the accepted-successor object identity plus the receipt-owned IDs and rerun the
latest authoritative selector under section 16.

The comparator rejects extra own keys and checks every required own field, nested summary number,
run entry, completion field, target field, and array order/length. A malformed or mismatched receipt
never blocks acceptance of the already valid Engine successor; it removes special orientation and
deep actions and yields the typed neutral final-week fallback in sections 10 and 18. An independently
valid construction co-event may survive that primary-receipt failure under section 10; no other
receipt field may. App and React must never guess an event target from the post-state when receipt
construction fails.

## 9. App-owned session lifetime and typed return

App retains the accepted receipt together with the exact accepted successor object in a private,
non-serialized session value. Only the presentation receipt reaches `StudioLotScreen`; Phaser
receives at most existing identity/highlight intents.

Add bounded UI navigation arms equivalent to:

```ts
type StudioReturnContext =
  | /* existing */
  | {
      kind: 'lot'
      focus: 'next-event-control'
      suppressOperationalAnnouncement: boolean
    }
  | {
      kind: 'lot'
      focus: 'next-event-reaction'
      receipt: LotNextEventReceipt
      suppressOperationalAnnouncement: boolean
    }

type Screen =
  | /* existing */
  | {
      kind: 'lot'
      entryFocus: 'next-event-control'
    }
  | {
      kind: 'lot'
      entryFocus: 'next-event-reaction'
      entryNextEventReceipt: LotNextEventReceipt
    }
```

`next-event-control` carries origin/focus only. It is the release-chain return arm and can never
carry or fabricate a non-release receipt. `next-event-reaction` is only for an exact unchanged
non-release deep return and requires the receipt. The exact shape may keep the private accepted-state
reference outside these public unions. A deep event action may carry the receipt through its
existing screen's `returnContext`; it may not carry `GameState`, SaveFile bytes, or renderer objects.

The receipt remains current only while App's latest state is the exact accepted successor object.
Any later accepted Engine action, one-week advance, second next-event action, publicity campaign,
production command, Annex start, greenlight, hiring/signing, contract action, save load, New
Studio, founding completion, or equivalent full-state replacement invalidates it synchronously.
Ordinary repaint, focus, profile open/close, renderer readiness, reduced-motion change, and
presentation-only selection do not.

Accepted same-seed whole-studio replacement clears the receipt, target, event rail, pending
gesture, focus intent, completion suppression state, and renderer highlight. Seed, studio name,
week, production ID, project ID, and receipt field equality are not a studio/session identity.
Rejected or declined replacement preserves the current session.

The receipt is never restored from SaveFileV1–V11, browser refresh, autosave, history, Chronicle,
or current post-state inference.

## 10. One transient cadence surface

The Lot must never show ordinary week feedback and next-event feedback simultaneously. Use one
discriminated App-owned cadence channel or enforce equivalent mutual exclusion:

```ts
type LotCadenceFeedback =
  | { kind: 'week'; week: number; constructionCompletion: ConstructionCompletionSummary | null }
  | { kind: 'next-event-exact'; receipt: LotNextEventReceipt }
  | {
      kind: 'next-event-neutral'
      toWeek: number
      cashNow: number
      stopMessage: string | null
      constructionCompletion: ConstructionCompletionSummary | null
    }
```

The neutral arm exists either as the deliberate successful presentation for one valid guard result,
or after one valid adapter successor when exact receipt construction or semantic target validation
fails. It carries independently validated safe primitives, no primary summary, target, entity
identity, or deep action. App validates `result.constructionCompletion` independently from the
primary receipt using the exact closed completion shape, completed week, and current governed Annex
join from section 8. One independently valid co-event survives as `constructionCompletion`; an
absent or invalid co-event is `null`. A deliberate guard result requires `stopReason === 'limit'`,
`guardHit === true`, `weeks === 520`, exact safe-integer from/to/next-week arithmetic,
`preTick === renderedBefore`, empty release/completed-run arrays, null decision payloads, and null
construction completion. If a stop message is not independently a non-empty string it is `null`;
the finite final week and cash still come from the accepted final state.

Starting Lot-native next-event clears prior one-week, Formation, Gate, publicity, scenery,
construction-action, and other one-shot acknowledgement that would compete for the same event
moment. It does not erase authoritative selection or current work facts. Starting a later one-week
advance or next-event action consumes/replaces the current exact or neutral next-event feedback.

Formation integration is deliberate: a freshly formed picture remains exact until the player
chooses a cadence action. Activating `Sim to next event` consumes the one-shot `PICTURE FORMED`
witness, preserves the same renderer mount, and replaces its transient framing with the exact
event target. It does not replay Formation during skipped ticks or after the event.

## 11. Same-mounted-Lot non-release continuity

For every non-release stop from the mounted Lot, App must not call `setScreen`. It publishes the
exact final `GameState` and exact-or-neutral cadence feedback while `screen.kind === 'lot'` remains
unchanged.

The existing `StudioLotScreen` and `StudioLotView` instances remain mounted. The renderer receives
one final fresh `studioLotSnapshot(result.next)` through the existing state effect. It receives no
intermediate snapshots for skipped weeks, no synthetic progress frames, no camera reset, no scene
recreation, and no extra Engine call.

Continuity preserves:

- the current renderer instance and camera transform;
- pan, zoom, reduced-motion, renderer-failure, and review modes;
- valid current building, production, person, place, and profile context until the deliberate
  event orientation supersedes it; and
- exact final week, cash, facility, construction, operation, person, task, reservation, theatrical,
  and attention truth from the post-state.

One accepted exact target becomes the sole event orientation. It clears unrelated transient person,
production, building, and place selection emphasis—including an old Hollywood person nameplate or
place outline—without erasing current authoritative work facts. It does not move the camera to a
preset or fabricate a person selection. An invalid or unavailable semantic target clears event
orientation and uses the typed neutral feedback. It never borrows another building, production,
project, session, run, or person.

## 12. Exact world orientation and reaction matrix

The primary stop reason owns orientation. Construction remains a separately presented co-event.

| Stop | Same-Lot world orientation | Event rail identity | Supporting action |
| --- | --- | --- | --- |
| `scriptReview` | Hollywood: Development semantic companion only; Classic Lot: its existing Development building | Exact project ID and title | `Open Writers' Room · <title>` focused to the exact project |
| `castingReview` | Hollywood: Casting semantic companion only; Classic Lot: its existing Casting building | Exact session ID, project ID, and title | `Open Casting Room · <title>` focused by the exact project/session token |
| `productionDecision` | Exact Stage 7 production when physically allocated; exact Stage 12 semantic fallback otherwise | Exact production title, phase, status, blocker, and command | Existing world command remains first; exact `Open Production Board details · <title>` remains secondary |
| `runCompleted` | Hollywood: Theater semantic companion only; Classic Lot: its existing Theater building | Every exact completed title in adapter order | `Open Dashboard releases` as a generic supporting destination |
| `cashNegative` | Exact accepted Administration place when physically available; semantic Administration always | Exact Engine stop message and current cash | `Open Dashboard finances` |
| `contractExpired` | Neutral Lot; no person selected | Generic contract-ended event only | `Open Studio Roster` without a talent focus |
| `renewalWindow` | Neutral Lot; no person selected | Generic renewal-window event only | `Open Studio Roster` without a talent focus |
| `constructionCompleted` | Development & Casting Annex parcel | Exact completion identity and message | Existing `Open Studio Development` supporting action |
| `limit` | Neutral Lot | Independently validated final week, cash, and guard message only | No deep action |
| `release` | No event rail; route immediately under section 14 | Existing exact release identities | Existing Newspaper / ReleaseResult / Autopsy actions |

The accepted Operation Hollywood runtime manifest owns physical places only for Stage 7
(`stage-a`), Administration & Publicity (`admin`), Scenery & Service (`post`), the Annex parcel
(`expansion`), and the Studio Gate (`gate`). It owns no physical base Development/Writers, Casting,
or Theater place. Those three event orientations therefore select only their existing native
semantic companion in Hollywood: no Phaser polygon, outline, camera focus, room occupancy, or
facility-activity claim is permitted. The Classic Lot may select its already-existing generic
Development, Casting, or Theater building without turning that rollback geometry into Hollywood
authority. Script/casting copy names current decision truth but does not claim a writer or audition
is visibly occupying a canonical room.

For a production decision, use the existing strict Stage 7 selector and accepted physical
production inspector when exact. A Stage 12 operation remains visible through the existing
truthful semantic production fallback. V1 must not force it onto Stage 7, borrow Stage 7 art, or
invent Soundstage 12 geometry.

For contract expiry/renewal, the adapter does not provide a talent identity. Even if a pre/post
diff appears obvious, V1 may not name, select, focus, or route to one person. Generic Roster is the
only authorized deep destination.

For `runCompleted`, exact titles remain historical event facts even though an ended run is no
longer an active Theater card. Hollywood may mark only the Theater semantic companion; Classic may
select its existing generic Theater building. Neither path may relabel a completed run as active,
focus another active run, or invent a Hollywood Theater place.

## 13. Event/reaction rail

Every exact-receipt non-release stop appears as one native semantic region attached to the Lot,
not a replacement screen. It must include:

- a stable `NEXT EVENT` heading;
- the adapter's `stopMessage` verbatim;
- exact `fromWeek`, `toWeek`, and `weeks` advanced;
- exact current cash;
- exact reason-specific identity from section 12 where authorized;
- exactly one existing `ConstructionCompletionNotice` embedded in or immediately adjacent to this
  event region when completion is present; the rail must not repeat the same completion as a second
  visible card, sentence, or live announcement;
- the appropriate current world/deep action; and
- an accessible period-summary disclosure containing every authoritative `PeriodSummary` field:
  Studio Revenue, Legacy box-office lump, Payroll, Overhead, Production spend, Publicity, Studio
  construction, Other cash, Net this period, Releases, Runs completed, and Cash now. `Other cash`
  is labelled as signing bonuses, freelancer fees, and termination; `Legacy box-office lump` is
  explicitly disengaged compatibility truth and is never relabelled as engaged Studio Revenue.

Every number comes directly from `result.summary` or `result.next.studio.cash`. React may format
currency and singular/plural labels but may not recompute net cash, omit a summary category,
substitute box office for Studio Revenue, fold `otherCash` into production spend, or infer why the
sim stopped. Zero rows may be visually compact, but their label/value remain available in the
disclosure and accessible text.

The rail is a bounded current-event receipt, not a scrolling feed. V1 retains at most one event,
has no unread count, filter, history, queue, toast stack, notification economy, or save persistence.
The player may explicitly dismiss it; dismissal clears only transient presentation and keeps the
same authoritative final state/world.

The existing world command appears before any deep detail action in visual, DOM, and keyboard
order. A deep screen is supporting infrastructure, not a prerequisite for an already-authorized
Lot command.

## 14. Release compatibility and exact routing

Any `result.released.length > 0` bypasses the non-release rail. `released.length`, not Newspaper
eligibility or `stopReason` copy, owns this branch.

The current release path remains binding:

1. use the exact `result.preTick`, `result.next`, and ordered `result.released`;
2. derive development once by diffing those immutable snapshots;
3. retain one exact session snapshot per released production;
4. derive Gazette eligibility from the post-state;
5. route Gazette-eligible releases through Newspaper then ReleaseResult;
6. route a real non-Gazette release directly to ReleaseResult;
7. retain exact session Autopsy and durable Chronicle behavior;
8. carry Lot origin through every release surface; and
9. return through the receipt-free `next-event-control` arm to a fresh Studio Lot with
   `Sim to next event` focus, not to Dashboard.

If Annex completion shares the release tick, the first deep release surface owns the completion
exactly once. Newspaper passes `null` to ReleaseResult after displaying it; a direct ReleaseResult
owns it when no Newspaper is eligible. Autopsy and returned Lot never repeat it. The immediate
returned Lot suppresses the generic already-Operational announcement under the closed Live Week
law.

Historic clippings remain their original root-context artifacts. V1 does not convert an old
clipping into a next-event receipt or a Lot-origin release.

## 15. Dashboard and WeeklySummary compatibility

Dashboard retains its existing `Sim to next event` control, eligibility, exact adapter call,
release routing, and non-release `WeeklySummary` screen. V1 must not route a Dashboard-origin
non-release result through the Lot rail merely because the Dashboard itself was opened from some
older context.

The compatibility matrix is binding:

| Origin | Non-release result | Release result | Continue / Back |
| --- | --- | --- | --- |
| Mounted Lot-native action | Same mounted Lot + event rail | Existing release chain | Lot |
| Dashboard root | Existing WeeklySummary | Existing release chain | Dashboard |
| Dashboard supporting a Lot-rooted deep visit | Existing WeeklySummary | Existing release chain | Existing typed Lot return |
| Studio Home disabled / rollback | Existing Dashboard behavior | Existing release chain | Existing destination |

`WeeklySummary` remains the existing standalone compatibility report for Dashboard flows. Its stop
message, currently rendered categories, period arithmetic, construction notice, focus, and Continue
routing remain compatible. The Lot rail owns the complete section 13 disclosure and may reuse
presentation components, but it may not silently change `WeeklySummary` semantics to force visual
parity.

## 16. Strict deep-action revalidation

Every event-rail action is stale-sensitive. The Lot captures the exact rendered receipt and, on
activation, compares it completely with the latest receipt/session value before asking App to
navigate or act. App independently requires:

- the event session's accepted successor is `latestStateRef.current` by object identity;
- the rendered receipt equals the current App receipt field for field; and
- the latest authoritative selector still supports the requested destination.

Exact destination checks are:

- Writers' Room: the exact accepted successor remains current, the receipt target is the same
  non-empty project ID/title, and `studioDecision(latest)` is one unique current screenplay decision
  with that identity. The screen receives `focusProjectId` only after this check.
- Casting Room: the exact accepted successor remains current and `studioDecision(latest)` is one
  unique current casting decision with the same session ID, project ID, and title. Navigation carries
  a typed `{ sessionId, projectId }` focus token (or an equivalent discriminated arm), and the Casting
  screen independently requires both before focusing; project ID alone is insufficient.
- Production Board: the exact accepted successor remains current; the latest unique managed
  decision card has the receipt production ID/title and current complete command/blocker projection;
  and the exact operation still resolves to `stage-a` or `stage-b` as recorded by the receipt
  location. The Board receives only the exact production ID and rebuilds the current card.
- Studio Development: the exact completion/project/facility/completed-week tuple remains the one
  governed Annex, then the existing Studio Development heading owns focus.
- Dashboard releases/finances: navigation carries an explicit typed section focus such as
  `focusSection: 'releases' | 'finances'`; generic Dashboard carries no section/entity focus. In all
  three cases the receipt must remain current and no film, run, or finance explanation is invented.
- Roster: the receipt remains current, navigation carries no `focusTalentId`, and the stable Roster
  heading owns focus.

No deep route compares a current card to fields the receipt does not contain. Exact accepted-state
object identity proves that no authoritative successor has replaced the event; the rerun current
selector proves current legality; and the receipt contributes only its closed identity/final-event
fields. If an implementation wants field-for-field comparison after dropping the object-identity
law, it must first add and govern a complete immutable decision fingerprint—this V1 does not.

If revalidation fails, remain on the mounted Lot, replace exact presentation with the typed neutral
arm, clear stale target ownership and pending activation, announce
`Studio event details changed. Review the current lot.`, and focus the stable Lot heading. Do not
navigate using a matching title, stale ID, array position, cached command, or another entity.

After an exact deep action, the existing supporting surface owns current legality. Back/Continue
returns through the typed `next-event-reaction` context. If no authoritative state changed and the
exact event session remains current, restore the exact event rail/orientation. If the player
resolved the decision or any state changed, return to a fresh neutral Lot with no replay or
substitution.

## 17. Focus and live-region ownership

Focus and announcement order is binding:

- Initial Lot entry does not fabricate or focus a next-event rail.
- While eligible, `Sim to next event` is a native semantic button with a visible focus indicator.
- A non-release result without construction completion focuses the connected `NEXT EVENT` heading
  once after final state and conditional content commit.
- That result emits one polite atomic announcement containing the exact stop message and final
  week; the visible heading/rail carries the full facts.
- When exact construction completion is present, `ConstructionCompletionNotice` keeps its existing
  focus and live-region ownership as the one rendered completion instance required by section 13.
  The primary event remains visibly first-class, but its rail neither repeats the completion copy
  nor emits a simultaneous second live announcement.
- A release retains existing Newspaper/ReleaseResult focus priority.
- A deep action focuses the exact destination owner established by section 16: project,
  session/project, production card, typed Finance heading, typed Releases heading, Roster heading,
  Studio Development heading, or generic Dashboard heading as mapped in section 12.
- Exact unchanged Back focuses the event heading; changed/invalid Back focuses the stable Lot
  heading.
- Dismissal returns focus to the still-connected Lot-native Sim button when possible, otherwise to
  the Lot heading.

Disabled eligibility copy is connected by `aria-describedby`. Do not rely on color, canvas tint,
camera framing, animation, sound, or a transient toast as the only notice. Intermediate skipped
weeks are not announced one by one.

## 18. Exact-or-neutral failure law

The final Engine state is accepted independently of special presentation. A valid `limit` result
under section 10 always uses the `next-event-neutral` arm because the guard has no governed stopping
tick or exact world target. This is a deliberate neutral success, not receipt-construction failure.
Any other receipt-construction, semantic-target-selector, or later deep-action identity failure
after a valid adapter result uses the same arm. The same mounted Lot must show only:

```text
Week <N>. The studio advanced to the next event.
```

plus the exact adapter stop message only when independently validated as a non-empty string, the
exact finite final week/cash, no primary summary, targeted identity, or deep action, and at most the
one independently validated `ConstructionCompletionNotice` from section 10. With no completion,
focus goes to the stable Lot heading; with one, the existing notice keeps completion focus/live
ownership. The neutral primary event must not select a first building, production, project, session,
run, or person to make the result look richer. A later render cannot upgrade this neutral arm by
inspecting the post-state.

Renderer import rejection, manifest rejection, scene failure, WebGL loss, recreation, or a false
physical selection/highlight response is different: when the receipt and semantic target remain
valid, renderer failure removes only physical emphasis. The complete semantic action, receipt,
summary, reason-specific text, and revalidated deep route remain usable. A failed physical outline
must not demote a valid Hollywood semantic companion or fabricate a physical fallback.

If renderer readiness is delayed beyond the sim, hold only the latest accepted final snapshot and
latest exact receipt, or the latest neutral feedback—never both. On readiness, revalidate an exact
receipt before applying one currently authorized building/production highlight. Neutral feedback
never gains one. Do not paint the pre-sim snapshot, replay the announcement, reset the camera, or
animate through skipped weeks.

Hidden tabs, modal entry, full-state replacement, unmount, and context loss clear held gestures.
No delayed keyup, compatibility click, import resolution, or focus restore may activate a newly
rendered control.

## 19. Input, modal, and selection lifecycle

The Lot-native button and every event action are React semantic controls. They contain
`pointerdown`, `mousedown`, and `touchstart` so the same physical gesture cannot fall through to
Phaser selection. Native keyboard/virtual activation remains available.

While the canonical Talent Profile is open over the Lot, world controls and cadence controls are
inert. Renderer animation may remain alive. Closing the profile restores its exact opener under
the existing profile contract and does not replay the event.

Selecting an unrelated building, production, person, place, Gate visitor, Publicity office,
Scenery context, or Annex context may dismiss event orientation while leaving the rail available
until an authoritative state change or explicit dismissal. It must not rewrite the historical
stop target. Invoking any state-changing action consumes presentation ownership synchronously before
the action can produce a successor. An accepted successor invalidates the event permanently. If the
owner rejects without a successor, App may restore the event only after the exact accepted-state
object and complete receipt still pass section 16; drift or ambiguity remains neutral.

## 20. Accessibility and responsive law

The complete feature must work without canvas and must satisfy:

- native buttons for Sim, dismiss, world commands, and deep actions;
- minimum 44 CSS-pixel action targets;
- stable heading structure and a labelled semantic event region;
- full stop reason, event identity, period range, cash, complete section 13 summary, one completion,
  disabled reason, and destination copy in text for exact receipts; the deliberately reduced
  section 18 facts and no invented target for neutral feedback;
- `aria-pressed` parity for any semantic building/production selection;
- visible focus and forced-colors treatment;
- no simultaneous ordinary-week, Formation, event, and completion live announcements;
- no focus to a hidden, inert, disconnected, canvas-only, or substituted target;
- no horizontal loss of pan/zoom, cadence actions, world, event rail, production/person inspectors,
  or summary disclosure; and
- reduced motion changing no eligibility, adapter result, state, RNG, route, selection identity,
  focus priority, or information.

Prove at minimum 1920×1080, 1366×768, 1024×768, 960×540, a 480×270 CSS viewport at device scale
factor 2, maximum world camera zoom, CSS text magnification, and an effective browser-zoom 200%
path. At compact sizes the event rail may stack below/above the world, but it may not replace or
make the world unreachable.

## 21. Renderer and structural performance boundary

V1 adds no texture, atlas frame, authored art, sprite, display object, dynamic actor, route, tween,
particle, animation, camera preset, per-frame selector, renderer simulation, or persistent draw.
Only an existing, independently authorized physical place may receive an existing outline; otherwise
the existing semantic companion owns orientation. Writers, Casting, Theater, Stage 12, and every
neutral target add no Hollywood physical place by implication.

Measure the same exact post-event snapshot with neutral entry and with exact event orientation.
The required feature delta is:

```text
display objects:        +0
dynamic actors:         +0
decoded texture bytes:  +0
renderer draws:         +0 persistent draws
```

The renderer receives one final snapshot, not one per simulated week. Receipt construction and
comparison are bounded to one adapter result/current event; they do not run per frame.

Record adapter wall time for ordinary one-digit, longer governed, and 520-week guard fixtures. V1
adds no second simulation pass and no per-week DOM/renderer work. Do not invent a loading animation
that implies asynchronous progress, and do not claim responsiveness without measured browser
evidence.

Use 120 warm-up frames and a fresh 240-frame sustained window for the unchanged live renderer.
Existing opt-in absolute thresholds remain at least 50 average FPS, at least 30 FPS 1%-low, and no
more than 33.4 ms p99/worst sampled frame. GPU wall-clock claims require the opt-in evidence run;
structural parity is not a substitute.

Frozen runtime/source manifest, exporter, concept plate, Gate foreground/occluder, and Role Atlas
hashes must remain unchanged. Do not run the exporter.

## 22. Save, determinism, and compatibility boundary

V1 changes no:

- Core tick, decision selector, stop priority, SIM cap, release, theatrical, contract,
  construction, facility, production, screenplay, casting, task, command, capacity, payroll,
  overhead, ledger, development, standing, RNG, or economy law;
- `advanceToNextEvent`, `SimResult`, `PeriodSummary`, `stopMessage`, or `WeeklySummary` authority;
- GameState or SaveFileV1–V11 schema, serialization, validation, migration, or autosave rule;
- StudioLotSnapshot authority beyond any bounded optional presentation field proven necessary for
  exact orientation;
- Dashboard destination or result semantics;
- Operation Hollywood manifest, place, stage, person, building, art, or camera authority; or
- D-17B publicity, awareness/reach, marketing, discoverability, reception, or economy result.

The receipt, accepted-state reference, gesture latch, event rail, target selection, focus intent,
and return context are UI-session only and consume no RNG. Save/reload imports only the final
authoritative state and opens ordinary Studio Home truth with no reconstructed next-event event.

## 23. Required automated proof

At minimum, prove:

1. `Sim to next event` is one native Lot button with pointer/mouse/touch containment and native
   Enter/Space/virtual activation;
2. unified script, casting, and production decisions disable it with exact owner copy and make zero
   adapter calls, while `Advance one week` remains available;
3. capacity holds without a command, reduced motion, renderer failure, Classic Lot, active runs,
   and construction do not create unauthorized ineligibility;
4. one pointer, touch, Enter, Space, and virtual activation each call the adapter exactly once;
5. double click, key repeat, cross-key, pointer/mouse/touch compatibility tails, focus churn,
   rerender, StrictMode, and delayed renderer readiness cannot call it twice;
6. stale rendered-state callbacks and same-stack successor collisions cannot overwrite latest
   state or navigate;
7. accepted final GameState, RNG and SaveFileV11 bytes equal one direct adapter call for every
   governed stop fixture;
8. the exact preflight and post-tick priority order in section 5, including deliberately colliding
   events;
9. construction remains an orthogonal one-time co-event, never steals primary priority, and survives
   an unrelated primary-target/receipt failure only when independently exact;
10. every non-limit receipt's state/seed/successor provenance,
    `preTick.market.tick === toWeek - 1`, safe-integer range/count arithmetic, finite exact monetary
    fields and cash, every exact `PeriodSummary` field, reason payload, completion, completed-run
    arrays, and target unions accept only exact closed shapes with no extra keys;
11. zero/multiple/malformed/duplicate IDs, invalid numbers, wrong pre-tick/week range, wrong seed,
    stale names, array-order traps, mismatched decisions, mismatched stop reasons, mismatched
    completion week, and extra/missing fields fail to the typed neutral arm; an invalid completion
    becomes null without erasing a separately valid neutral successor, while an independently valid
    completion survives an unrelated primary-receipt failure exactly once;
12. a non-release result keeps the same React host and renderer instance, makes no destroy/reset/
    camera-preset call, and delivers one final fresh snapshot;
13. no intermediate week snapshot, announcement, world activity, or renderer draw is fabricated;
14. script review uses the Hollywood semantic Writers/Development companion, uses a physical
    Development building only where already independently authorized, and opens/focuses only the
    exact current project;
15. casting review uses the Hollywood semantic Casting companion, creates no Hollywood Casting
    place, and opens/focuses only the exact current session/project through a typed token carrying
    both IDs;
16. production decision selects the exact Stage 7 operation and keeps its world command first;
17. a same-title Stage 12 decision uses only semantic fallback and never borrows Stage 7;
18. run completion uses the Hollywood semantic Theater companion and lists every exact title
    without presenting another active run or fabricating a Hollywood Theater place;
19. cash crossing uses Administration physically only when the exact accepted Hollywood place is
    authorized, otherwise remains semantic, and opens/focuses exact current Dashboard finance
    truth;
20. contract expiry/renewal uses an exact generic receipt with complete summary, keeps Lot
    orientation neutral, and opens generic Roster with no inferred person;
21. construction-only completion orients Annex, renders exactly one
    `ConstructionCompletionNotice`, and retains existing Studio Development truth;
22. the guard result retains the rendered initial state as `preTick`, stores only the typed neutral
    finite week/cash/validated-message facts, remains bounded to 520 weeks, invents no target or
    summary, and offers no deep action;
23. reason-specific deep actions revalidate in both Lot and App, while stale/changed/removed/
    replaced identity stays mounted and fails neutral;
24. exact unchanged Back restores one `next-event-reaction` context; release returns through the
    receipt-free `next-event-control` context, while a resolved decision or any state successor
    returns to neutral Lot without replay;
25. ordinary selection, profile open/close, renderer recreation, and focus do not replay receipt or
    announcement;
26. one-week feedback, Formation witness, next-event rail, and completion never announce
    simultaneously;
27. accepted same-seed whole-studio replacement clears all transient event/gesture/selection state;
28. release with Gazette follows Newspaper → ReleaseResult → Lot; release without Gazette follows
    ReleaseResult → Lot; Autopsy retains exact session evidence; both return through the
    receipt-free `next-event-control` arm and never fabricate a non-release receipt;
29. release plus construction completion shows completion on only the first deep surface and never
    on returned Lot;
30. Dashboard-root and Dashboard-supporting-Lot next-event flows remain WeeklySummary- and
    destination-compatible;
31. renderer import/construction failure removes only physical emphasis from a still-valid exact
    semantic receipt, while receipt/identity failure stores only neutral primary feedback plus at
    most one independently valid completion co-event; delayed
    readiness retains exactly one latest exact-or-neutral arm and never upgrades neutral;
32. hidden-tab, modal, unmount, and full replacement clear held activation without delayed action;
33. complete exact disclosure and deliberately reduced neutral disclosure both pass every governed
    viewport, 200%, forced-color, renderer-failure, reduced-motion, and focus/live path;
34. same-snapshot structural delta remains exactly zero; and
35. no test observes a Core/save/tuning change, a second clock, presentation-owned stop, duplicate
    adapter call, or persistent event history.

Run focused tests, the complete UI suite, complete repository suite, governed D-16/D-17 harness,
both TypeScript projects, production build, deterministic native evidence replay, frozen asset
hashes, protected paths, and `git diff --check` before closure.

## 24. Hostile deterministic corpus

Commit reproducible SaveFileV11 fixtures or deterministic public-authority generators for the
smallest corpus that covers:

- screenplay review;
- casting review;
- physical Stage 7 production decision;
- semantic Stage 12 production decision;
- multiple simultaneous completed runs;
- cash crossing;
- contract expiry;
- renewal-window opening;
- construction-only completion;
- a higher-priority stop sharing Annex completion;
- Gazette and non-Gazette release paths; and
- the 520-week guard or a direct deterministic adapter-level construction of that boundary.

Every stored fixture must record seed, public action recipe, SaveFile version, byte length, SHA-256,
expected start/end weeks, expected stop reason, and either the expected exact target or the expected
neutral arm. Generator replay must be byte-identical. Do not hand-edit GameState JSON to manufacture
ordinary-player acceptance evidence.
Unit-level hostile malformed projections may use bounded fixtures when public actions cannot
construct invalid states by definition.

## 25. Required real-browser acceptance

At minimum, real Chromium must prove:

1. from the living Lot after the accepted Formation journey, activate `Sim to next event` and reach
   the exact next non-release event without Dashboard or WeeklySummary;
2. preserve the same canvas/view and camera while final week, cash, work, people, facility, and
   event truth repaint once;
3. a screenplay review uses the Hollywood semantic Writers/Development companion (or only an
   already-authorized physical Development building in Classic), shows exact title/range/summary,
   opens the exact Writers' Room project, and returns through `next-event-reaction` only while the
   accepted state remains unchanged;
4. a casting review uses the Hollywood semantic Casting companion without creating a Casting
   place and reaches only the exact session/project through the typed two-ID focus token;
5. a Stage 7 production decision frames the exact physical production, leaves its existing world
   command first, accepts the command once, and consumes stale event context;
6. a Stage 12 decision remains truthful in semantic fallback with no Stage 7 substitution;
7. multiple completed runs use the Hollywood semantic Theater companion and show every exact title
   without creating a Theater place;
8. a cash crossing uses the accepted Administration place physically only when exact, otherwise
   remains semantic, and reaches the existing Finance truth;
9. Annex completion alone and Annex completion sharing a higher-priority event display one exact
   completion with correct focus/live ownership;
10. a real release follows Newspaper/ReleaseResult/Autopsy as eligible and returns to the Lot
    through receipt-free `next-event-control` with no fabricated non-release receipt;
11. generic contract changes render an exact generic rail and Roster route without naming a person;
    the guard path renders only primitive-neutral facts and makes no target, person, summary,
    completion, or deep-action claim;
12. pointer and physical keyboard paths are exercised honestly; any browser-controller limitation
    is recorded as a tooling exception rather than relabelled;
13. renderer rejection retains the full semantic action/event/deep-return path only for a valid
    exact receipt, while a hostile malformed receipt remains neutral;
14. delayed renderer readiness after the sim paints only latest final truth, preserving exactly
    one exact-or-neutral arm and never adding a highlight to neutral;
15. reduced motion, forced colors, maximum world zoom, CSS/effective 200%, and every governed
    viewport keep world and rail readable/reachable; and
16. structural and warmed sustained performance meet section 21 with zero unexpected console
    warnings, errors, failed requests, or extra renderer draws.

Capture and visually inspect the minimum screenshots needed to prove physical Stage 7, semantic
Stage 12, semantic Hollywood screenplay/casting/Theater orientation, exact-or-semantic
cash/Administration, Annex co-event, renderer fallback, compact/zoom/200%, and receipt-free release
return. DOM assertions without visual review do not prove a professional world-first result.

## 26. Keep / Kill gate

Keep V1 only if an ordinary player can remain on the living Studio Lot, deliberately advance to
the next authoritative interruption, immediately understand which part of the studio needs
attention, react there or enter the exact supporting owner, and return to fresh world truth.

Kill or narrow if the implementation:

- opens WeeklySummary or Dashboard for an ordinary non-release Lot stop;
- calls the adapter twice, simulates from a stale state, or reproduces the Engine loop in React;
- changes stop priority, skips a release, hides a construction co-event, loses release/autopsy
  evidence, or changes Dashboard behavior;
- treats skipped weeks as watched travel/work or invents intermediate renderer activity;
- selects targets by title, array position, first/last item, guessed contract diff, or borrowed
  Stage 7 identity;
- allows a waiting unified decision to create a zero-week player-facing ceremony;
- lets a deep action navigate after current state/receipt drift;
- remounts/resets the Lot or camera for an ordinary non-release stop;
- makes Phaser authoritative or loses semantic fallback;
- creates an event feed/history, autoplay, speed control, second clock, or persistent notification
  system;
- changes Engine, GameState, SaveFile, RNG, economy, production, construction, employment, or
  release law; or
- breaks focus, live-region ownership, compact layout, reduced motion, forced colors, renderer
  failure, structural parity, or measured performance.

## 27. Explicit no-go boundary

V1 does not authorize:

- autoplay, pause, speed levels, continuous background ticking, wall-clock time, or a second game
  clock;
- showing, interpolating, or narrating unobserved intermediate weekly people movement, queues,
  facility occupancy, construction labor, rehearsal, shooting, Post, publicity, or theatrical work;
- new Core events, stop reasons, decision priority, SIM cap, period arithmetic, production tasks,
  contract decisions, construction rules, or release behavior;
- a persistent event history, inbox, queue, alert economy, event settings, or SaveFileV12;
- personal contract-expiry/renewal identity when the adapter supplies none;
- unrestricted person autonomy, personal destinations, workload, stress, fatigue, relationships,
  needs, pathfinding, or character control;
- new Development, Casting, or Theater geometry; Soundstage 12 art; any physical place not already
  accepted by current Hollywood authority; facility occupancy claims; routes; props; actors;
  animations; textures; or camera systems;
- keeping Phaser mounted behind current non-modal Writers, Casting, Dashboard, Roster, Newspaper,
  ReleaseResult, Autopsy, or Studio Development screens;
- making the Lot the renderer authority or changing deterministic simulation to improve visual
  cadence;
- facility catalogues, free placement, upgrades, demolition, maintenance, a second Annex, a fourth
  production slot, or an arbitrary size-scaling cash sink; or
- financing, loans, bailouts, restructuring, hard bankruptcy, or a failure ladder.

## 28. Economic residuals remain open

The governing status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

The following remain explicitly open and must not be concealed, relabelled, or claimed as repaired
by a cadence/navigation milestone:

- cash runaway;
- top-studio economic immortality;
- the week-208 synchronized roster wall;
- P5 dominance;
- world-led variance;
- cheap-film purpose;
- premium-film purpose;
- remaining menu breadth; and
- formal G12 timing.

The Lot-native cash-negative reaction is an honest surface for existing truth, not a bankruptcy
repair or certification of believable failure pressure.

## 29. Closure record requirement

This frozen contract, its exact Formation prerequisite authorities, and its implementation parent
must be recorded in a dedicated clean governance commit before production implementation begins.

If V1 passes Keep:

- create dedicated evidence and closure documents;
- update `CURRENT-BEST.md`, `NEXT-HIGHEST-LEVERAGE.md`, `PROGRESS.md`, `MARATHON-LOG.md`,
  `docs/HANDOFF.md`, and canonical Lessons Learned;
- record exact contract, implementation, evidence, deterministic corpus, browser, accessibility,
  performance, asset, protected-ref, and publication boundaries;
- preserve every D-17B residual exactly; and
- run the Owner's several-minutes-on-Lot test again before promoting another milestone.

If V1 fails Keep, record the Kill result and restore only the Formation-closed world behavior. Do
not weaken simulation authority, exact identity, same-mounted-world, semantic fallback,
accessibility, or performance gates merely to force a next-event feature to exist.
