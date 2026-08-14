# World-First Annex Construction Interaction V1 Contract

Status: **FROZEN AUTONOMOUS-MARATHON IMPLEMENTATION CONTRACT**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract parent: `a9be11676f2e3d96a6bc9dc6c5f03744fff62c4b`

Authority base:

- Owner world-first product-direction ruling and canonical Lesson DB;
- accepted D-17B bounded-repair ruling `35d4268` and all still-open macroeconomy residuals;
- Facilities & Construction research contract `4b9bd90`, reviewed observatories `76ac00a` and
  `ccb243f`, evidence, and closure `8712b79`;
- Development & Casting Annex V1 contract `8712b79`, clarification `035e3c4`, implementation
  `babfb87`, compatibility authority `8b7e95e`, and amended closure `7dc042f`;
- Operation Hollywood bridge `623b8b2`, current Role Atlas implementation `66f856c`, and closure
  `5146490`;
- World-First Soundstage Intervention V1 contract `001c692`, implementation `c48f8ac`, and closure
  `6419452`; and
- World-First Live Week Advance V1 contract `3391528`, implementation `621e7e1`, and closure
  `a9be116`.

## Purpose and bounded ruling

Close the next observed break in the Owner's critical world-first experience. The already-visible
Development & Casting Annex parcel truthfully paints Vacant, Building, progress, and Operational
states, but its physical hit and semantic companion currently eject the player to a standalone
screen before the player can inspect or start the project. The building is still a menu launcher at
the decision that matters.

This contract makes the already-authorized fixed parcel a complete same-lot inspect/build/progress
interaction:

```text
VISIBLE FIXED ANNEX PARCEL
→ SELECT PHYSICAL PARCEL / STATUS OR SEMANTIC COMPANION
→ EXACT SAME-LOT CONSTRUCTION CONTEXT
→ INSPECT PRICE / CLOCK / CASH / CAPACITY / START AVAILABILITY
→ START THE EXISTING ANNEX
→ SAME MOUNTED LOT REPAINTS VACANT → BUILDING
→ ADVANCE THE EXISTING ENGINE CLOCK IN WORLD
→ WATCH EXACT PROGRESS → OPERATIONAL
```

This is not a new construction mechanic, facility candidate, economic sink, or generalized
city-builder layer. It is a presentation/interaction repair around the accepted optional project:

| Fact | Retained authority |
| --- | --- |
| Parcel | fixed `expansion` parcel |
| Project | `construction-development-casting-annex` |
| Facility | `facility-development-casting-annex` |
| Capex | **$780,000**, committed atomically at start |
| Clock | **13 real weekly advances** |
| Result | **+1 shared Development & Casting slot** |
| Marginal opex | **$0/week** |

The research justification remains bounded. A Week-13 third slot removed 66 later retry attempts,
produced 62 added-slot weeks, and was used in 26 of 50 development-policy runs. A direct-package
studio may rationally keep the parcel vacant. The world must present that real choice without
pretending construction guarantees profit, releases, throughput, or macroeconomic balance.

## Prospective supersession — presentation ownership only

Historical Annex contract and closure records remain accurate evidence of the behavior accepted at
their commits. This contract does not rewrite them. It prospectively supersedes only the following
presentation-ownership clauses:

1. `DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md` lines 414–415 made the dedicated Studio Development
   screen “the one player owner” of the action. There remains one parameter-free Engine action and
   one authoritative core transition, but two player surfaces may now dispatch it: the complete
   standalone deep surface and this bounded same-lot Annex context.
2. The old contract's lines 456–458 required physical/keyboard parcel activation to navigate away
   and classified the lot as navigation-only. Parcel activation now selects an in-world context and
   does not navigate. Phaser still never applies the command or mutates GameState.
3. Lines 461–463 mapped `view-expansion` to Studio Development as the parcel's default activation.
   That route remains a deep-management compatibility mapping, but is no longer the default
   physical-parcel or companion behavior. The rejected `expansion-info` placeholder is not revived.
4. The Annex closure's “sole construction command” and direct-route statements remain historical
   closure evidence. They are superseded only for player-surface ownership from this contract
   forward. Its live result that the old parcel opened Studio Development remains true of that
   checkpoint, not a current acceptance gate.

The following Annex laws remain binding without qualification:

- `studioConstructionView(state)` is the one pure core read authority;
- every Vacant, Building, Operational, and legacy fact;
- one parameter-free start action and one atomic state transition;
- exact price, affordability, ledger, parcel, project, facility, timing, ordering, capacity, and
  non-stackability law;
- SaveFileV11 and the conditional historical cash/ledger checkpoint;
- Dashboard, Calendar, Finance, recap, weekly/release summary, and standalone Studio Development
  behavior;
- fixed parcel identity/footprint, persisted lifecycle, reload truth, and non-authoritative
  animation; and
- accessibility, focus, textual status, progress, reduced-motion, and responsive obligations.

No old frozen document is edited to make the supersession appear retroactive.

## Exact world identity and selection law

The Hollywood physical selector is canonical only when both identities match:

```ts
place.id === 'annex-parcel' && place.buildingId === 'expansion'
```

The existing scene event remains identity/presentation-only:

```ts
{
  type: 'place',
  place: {
    id: 'annex-parcel',
    buildingId: 'expansion',
    label: 'Development & Casting Annex',
    affordances: ['develop-studio', 'construct-annex']
  }
}
```

It carries no GameState, project, price, affordability, action, clock, capacity, facility mutation,
or result. Required selection behavior is:

- the parcel polygon and visible parcel/status label enter one exact selection method;
- the `expansion` semantic companion enters the same host context;
- React validates the exact two-ID scene event, then independently revalidates the latest
  `expansion` building in `StudioLotSnapshot` and the latest `studioDevelopment(state)` projection
  before exposing construction information or an action; the snapshot does not invent or mirror a
  Hollywood place ID;
- a wrong event place ID, wrong event building ID, absent/mismatched `expansion` visual projection,
  stale identity, or malformed scene input fails closed; an absent canonical Hollywood manifest
  place blocks only Hollywood physical selection and its outline, never the snapshot/read-model-backed
  semantic or renderer-failure DOM context;
- canonical Legacy selection remains inspect-only even though its authoritative `parcelId` is null;
  “missing parcel” never means that this truthful legacy field is an identity failure;
- when a live Hollywood renderer and canonical manifest place are available, host-driven semantic
  selection paints the exact parcel outline without re-emitting a scene event or opening a feedback
  loop; fallback retains the same context without inventing an outline;
- selection clears named-person context and hides unrelated production/publicity commands from the
  inspector, while the active production card and living studio remain visible behind it;
- selecting another person, production, or place exits Annex context without stale command leakage;
  and
- selection itself routes nowhere, spends nothing, advances no time, changes no state, and consumes
  no RNG.

The procedural/renderer-failure DOM path must expose equivalent Annex truth and action. It may not
claim Hollywood physical identity when the district is absent, but it cannot require Phaser to
construct or start the project.

## One authoritative construction read model

React calls the existing adapter boundary:

```ts
studioDevelopment(state): StudioConstructionView
```

That adapter returns the core's exact `studioConstructionView(state)` projection. The same-lot
context formats only its existing fields:

- `mode` and `status`;
- `parcelId`, `projectId`, and `facilityId`;
- `name`, `capex`, and `durationWeeks`;
- `currentWeek`, `cash`, and `cashAfter`;
- `affordability` and `canStart`;
- `startedWeek`, `dueWeek`, and `completedWeek`;
- `completedAdvances` and `remainingAdvances`;
- `currentDevelopmentCastingCapacity` and `completedCapacityGain`; and
- `consequence`.

No price, clock, progress, capacity, affordability, project identity, or consequence may be
recomputed from `StudioLotSnapshot`, Phaser state, CSS, ledger note text, copied constants, or
presentation inference. The scene continues receiving only the existing coarse lifecycle facts it
needs to paint the parcel.

Reading or selecting the context mutates no input, consumes no RNG, creates no session gameplay
authority, and cannot make an invalid current state render as valid.

## Start-action authority

App owns one narrow callback from the lot and invokes only the current adapter action against its
latest current GameState:

```ts
startDevelopmentCastingAnnexAction(currentState)
```

The interaction law is:

- the lot supplies no caller-controlled parcel, project, facility, price, date, duration, capacity,
  or action kind;
- App invokes the parameter-free action at most once for one accepted activation;
- success replaces App GameState exactly once and returns the accepted `ActionOutcome` to the host
  only for focus/announcement handling;
- rejection returns the exact adapter/core error, replaces no state, and produces no alert or second
  error owner;
- canvas/scene code imports neither the adapter nor core action;
- standalone Studio Development continues calling the same action and remains behaviorally
  unchanged; and
- from an identical pre-state, lot and standalone surfaces produce byte-identical GameState, RNG,
  ledger, and SaveFileV11 output.

The lot action is not `onStateChange(next)` with UI-authored state. It is a single intent to the App
owner, which remains the only source allowed to accept the transition.

## Exact accepted-state law

At visible Week `S`, an accepted start retains the existing Annex V1 transition exactly:

1. debit cash by exactly $780,000;
2. append one exact Week-`S` `constructionCapex` row for `-$780,000`, correlated only by canonical
   `constructionProjectId`;
3. claim parcel `expansion` with the canonical project ID;
4. create the canonical Building project with `startedWeek = S`, `dueWeek = S + 13`, and
   `completedWeek = null`;
5. add no facility;
6. advance no week and consume no RNG; and
7. change no subsystem-owned production, reservation, task, person, publicity campaign/spend,
   release, theatrical, or staffing records.

Derived views must react to the accepted cash/project truth: the Calendar gains its exact completion
commitment, Finance and cash projections include the debit, publicity affordability may change, and
lot attention may change. Those reactions are projections of the accepted construction transition,
not additional subsystem mutations.

The same `StudioLotScreen` and `StudioLotView` instances remain mounted. The current camera, pan,
zoom, active production, and selected parcel remain. One fresh App-owned snapshot repaints:

- topbar cash;
- parcel Vacant → Building;
- the existing scaffold/building depiction;
- exact `0 of 13 weekly advances complete` truth;
- attention/state copy; and
- the semantic companion.

No renderer destroy/recreate, route change, camera preset, Dashboard transition, Studio Development
transition, or empty ReleaseResult is permitted.

## Exact lifecycle presentation

### Vacant

The selected context exposes:

- exact Annex name and Vacant status;
- $780,000 capital cost;
- 13 weekly advances;
- cash now and cash after;
- current shared Development & Casting capacity and exact +1 consequence;
- the complete authoritative affordability reason; and
- one native `Build Development & Casting Annex · $780,000` button, enabled if and only if
  `view.canStart` is true.

Exactly $780,000 remains affordable and $779,999 remains unavailable under the existing core law.
When `view.affordability.ok` is false, the disabled state displays its exact reason and cannot
dispatch. If affordability is true but `view.canStart` is false for another valid authoritative
boundary, the UI must not reverse-engineer or invent a more specific rule: it states only that the
current studio state does not permit the project. The existing read model is not widened merely to
make a presentation claim more specific.

### Building

The context exposes:

- Building status;
- exact `N of 13 weekly advances complete` text and an equivalent named progressbar;
- started Week `S`;
- committed completion Week `S + 13`;
- exact remaining advances;
- $780,000 capital already committed; and
- no duplicate Build, second-payment, acceleration, cancellation, or other command.

### Operational

The context exposes:

- Operational status;
- exact completion week;
- permanent Annex identity;
- exact `+1 slot` gain and current shared capacity; and
- no repeat, upgrade, demolition, relocation, or other command.

### Legacy

Legacy truth remains exact and inspect-only: no owned parcel, project, facility, or managed
construction ability is inferred. The context shows the core consequence and invents no activation
or migration ceremony.

The shipped lot week control remains the only way this surface advances construction. Selected Annex
context survives an ordinary same-mounted tick and repaints exact progress. The existing completion
notice retains its sole focus and single-announcement precedence on the thirteenth advance.

## Focus, pending, success, and rejection law

On physical or semantic Annex selection:

- focus the Build button when Vacant and actionable;
- otherwise focus the persistent Annex status/progress region; and
- keep the visible parcel outline selected when a live Hollywood renderer and canonical manifest
  place are available; fallback retains context without inventing an outline.

On activation, the host sets a synchronous presentation-only pending guard before dispatch. A rapid
double pointer/keyboard gesture cannot invoke two owner calls while React is waiting for fresh state.
The guard is not GameState, is never serialized, and owns no legality.

On accepted start:

- fresh Building truth removes the action before another deliberate activation;
- focus moves to the same Annex Building status/progress region; and
- one polite atomic live region announces exactly:

```text
$780,000 committed to Development & Casting Annex. Completion is due in Week <dueWeek>.
```

The existing whole-inspector polite live ownership must be narrowed or removed so this atomic region
does not duplicate the lifecycle/success announcement.

On rejection:

- the owner is called once;
- pending state clears;
- Annex remains selected;
- focus remains on the owning Annex region or surviving command;
- the exact unmodified core error is announced once; and
- GameState, SaveFileV11, RNG, week, cash, ledger, project, parcel, operations, renderer snapshot,
  production, and person truth remain byte-identical.

Only a stale post-render activation may enter this rejection path. Mismatched identity, current
unaffordability, legacy, and non-Vacant Building/Operational states expose no enabled command,
invoke no owner, and never fall through to a route or another action.

## Renderer, input, and accessibility law

- Canvas remains the primary visual pointer surface and stays `aria-hidden`.
- Native DOM controls remain the complete keyboard, reduced-motion, delayed-import, and
  renderer-failure path.
- Every changed over-canvas Annex surface contains `pointerdown`, `mousedown`, and `touchstart`;
  Phaser independently rejects any pointer whose native target is not its canvas.
- The parcel polygon and visible status label may emit identity only.
- A delayed renderer that becomes ready after accepted construction initializes from the latest
  Building snapshot, never the stale Vacant mount-time snapshot.
- Renderer construction/import rejection cannot remove, disable, or change the semantic start path.
- Reduced motion changes no state, command, clock, focus priority, availability, or announcement.
- Status uses text and shape as well as colour.
- Price, cash, capacity, progress, consequence, affordability, and action/reason remain reachable at
  every governed viewport and actual maximum in-world camera zoom.
- No new Phaser display object, dynamic actor, texture, route, draw, or decoded-byte allocation is
  needed or authorized.

The same native Build control must support pointer, `Enter`, and `Space` activation exactly once.
The semantic companion must be fully operable without a renderer. A canvas-only construction
command fails this contract even if mouse play works.

## Deep-surface compatibility

The following remain unchanged and fully supported:

- Dashboard Studio Development preview and route;
- Calendar Studio Development section, completion event, and route;
- standalone Studio Development Vacant/Building/Operational workflow and action;
- Finance, period/weekly/release summaries, cash chart, and Studio Run Recap;
- save/export/import/migration and exact reload truth;
- facility-board and capacity projection;
- procedural/feature-rollback lot truth; and
- explicit `view-expansion → studioDevelopment` resolution as a deep-management compatibility
  mapping.

V1 does not add an `Open full Studio Development` action from the lot context. If a later milestone
adds that deep route, it must receive an explicit lot-origin return contract; the current
Dashboard-return behavior may not be mislabeled as same-world continuity.

## Required automated proof

At minimum, tests must prove:

1. the physical Annex polygon emits the exact canonical place identity only;
2. the visible parcel/status label reaches the same exact physical selection method;
3. a wrong event place ID, wrong event building ID, absent/mismatched `expansion` visual projection,
   or stale identity cannot enter Annex context; an absent canonical Hollywood manifest place blocks
   only physical Hollywood selection/outline, never the semantic fallback, while a canonical Legacy
   projection remains inspect-only;
4. physical selection produces no route, mutation, tick, save change, or RNG change;
5. the semantic `expansion` companion enters the identical context by pointer, `Enter`, and `Space`;
6. host-driven semantic selection paints the same parcel outline without scene-event recursion when
   a live Hollywood renderer and canonical manifest place are available; fallback retains context
   without inventing an outline;
7. Annex selection clears person context and hides unrelated production/publicity commands while
   retaining the live production card;
8. selecting another person, production, or place clears Annex context without stale action
   leakage;
9. every Vacant fact and action availability is field-exact to `studioDevelopment(state)`; a failed
   affordability check displays its exact reason, while `affordability.ok === true && !canStart`
   displays only the generic copy governed above;
10. Building, Operational, and legacy fields are field-exact to the same view;
11. projection/selection mutates no state and consumes no RNG;
12. pointer Build invokes the App owner exactly once with no payload;
13. `Enter` and `Space` Build activation each invoke the same owner exactly once;
14. lot and standalone Studio Development yield byte-identical successor GameState, RNG, ledger,
    and SaveFileV11 from one pre-state;
15. accepted start produces exactly one debit, capex row, parcel claim, and Building project, with no
    facility, tick, or unrelated change;
16. the same screen/view instances survive with no destroy, recreate, route, or camera-preset call;
17. one fresh scene snapshot repaints exact Building status and topbar cash;
18. accepted focus and success announcement follow the exact law;
19. exact $779,999 disables start, displays the core reason, and calls no owner;
20. a stale post-render action race calls App once, announces the exact returned error, and preserves
    all authoritative bytes; mismatched identity, Building, Operational, and legacy states expose no
    enabled action and call no owner;
21. rapid double activation invokes the owner once and cannot duplicate capex/project state;
22. Building exposes exact progress and no start action;
23. one lot-origin week advance preserves selected Annex context and increments progress exactly
    once;
24. the thirteenth advance shows Operational, exact current shared capacity, and the existing
    completion notice once;
25. completion focus suppresses generic duplicate Operational and ordinary week announcements;
26. after each SaveFileV11 reload/import at Vacant, Building, and Operational, reopening the lot and
    reselecting Annex reconstructs exact context facts without replaying success/completion ceremony;
27. renderer import pending followed by construction initializes its first paint from the latest
    post-action state;
28. renderer construction/import rejection retains the complete semantic inspect/start path;
29. reduced motion produces byte-identical state, RNG, focus priority, and availability;
30. procedural/non-Hollywood rollback retains an equivalent DOM inspect/start path and no default
    route-away behavior;
31. Dashboard, Calendar, standalone Studio Development, Finance, recap, and still-applicable historic
    Annex tests remain green; superseded route-away and placeholder assertions are deliberately
    revised under this contract, not falsely preserved unchanged;
32. an active Stage 7 production, director route, task, reservation, and people state remain
    unchanged across construction start;
33. every changed overlay contains all down-event families and cannot trigger an underlying world
    selection;
34. 1280×720, 1366×768, 1440×900, 1920×1080, and 1536×864 as the 125%-equivalent compact viewport
    retain all facts/actions with no overlap, clipping, unreachable tail, or horizontal page
    overflow; 960×540 is an additional responsive stress case, not a camera-zoom substitute;
35. actual maximum in-world camera zoom retains human-story parcel selection, exact context, and
    both topbar actions;
36. Hollywood retains average FPS ≥50, 1%-low FPS ≥30, p99/worst sampled frame ≤33.4 ms, one draw,
    33 display objects, 15 actors, and exactly 11,096,896 decoded texture bytes; and
37. focused tests, complete repository suite, both TypeScript projects, production build, governed
    D-16/D-17 harness, deterministic fixture replay, `git diff --check`, and protected-branch checks
    pass.

No implementation or closure checkpoint is permitted with an unresolved P1–P3 authority,
interaction, accessibility, save, accounting, or player-experience finding.

## Deterministic live fixtures

Reuse the committed public-authority SaveFileV11 generator and fixtures from Live Week Advance V1;
do not copy or hand-edit them:

- Week-30 *Nights of Watchtower* Stage 7 scheduled, Annex Vacant and affordable:
  `e922f9b7e957388bed7c7674be8c17596245823200e478371dc7ff970458f46b`;
- Week-11 Annex Building at 11/13:
  `ffc443f9fb3a75ec9f79be967600bb94933c9dacdd0b4f0bee878c37cdbd03ac`; and
- Week-12 Annex Building with completion next:
  `63669586ad8f0256ac165a5141b8dd770dadc68840c3e69a31f9abc8b72ab712`.

The generator command remains:

```text
node_modules/.bin/vite-node scripts/gen-live-week-advance-fixtures.mts
```

Its manifest SHA-256 is
`3f06eb81957c5f49fa5be3b8b0d3239e9c3305426b266be19ac5bf224b24905e`.
Every replay used for acceptance must first report all outputs unchanged. Exact unaffordable,
stale, legacy, and rapid-duplicate boundaries may remain deterministic automated fixtures. If live
implementation discovers an exact pre-state not covered here, commit a public-authority generator
and byte-identical fixture before using it as resettable browser evidence.

## Required live acceptance

Use ordinary-player browser sessions and the exact committed fixtures:

1. rerun the generator and prove every fixture/manifest byte unchanged;
2. import the Week-30 managed Vacant fixture and open the Hollywood lot;
3. record the lot mount, camera, cash, Vacant parcel, active film, Stage 7 task, and named people;
4. click the physical Annex parcel/status and verify the same lot remains mounted with exact Vacant
   price, duration, cash-after, capacity, consequence, and affordability;
5. activate Build by pointer and verify the exact $780,000 debit, Building depiction, `0 of 13`, due
   week, focus, and one announcement in the same camera;
6. restore the byte-identical Week-30 fixture and repeat selection/start by keyboard through the
   semantic companion and native Build button;
7. verify *Nights of Watchtower*, Estelle Delgado, the Stage 7 scheduled task, reservations, people,
   and camera remain unchanged across the accepted start;
8. import the Week-11 fixture, open the lot, select Annex, first verify the exact `11 of 13` Building
   repaint, then advance to Week 12 and verify exact 12/13 progress in the same inspector;
9. advance to Week 13 and verify exact Operational status, three shared slots, sole completion
   focus, and no duplicate announcement;
10. treat the Week-11 import in step 8 as the Building reload proof; from the exact Operational
    successor reached in step 9, export SaveFileV11, record its SHA-256 and two-advance derivation,
    and immediately reimport those same bytes once. Reopen the lot, reselect Annex, and verify
    truthful repaint with no start or exact completion-notice replay. This same-session successor is
    not a separately reset/replayed fixture and may not be reused as one; the existing generic
    persisted-Operational orientation law remains allowed;
11. repeat the Vacant inspect/start path in an isolated renderer-import rejection session, then
    remove its temporary rule;
12. repeat under reduced motion;
13. inspect 1280×720, 1366×768, 1440×900, 1920×1080, 1536×864, the additional 960×540 responsive
    stress case, and actual maximum in-world camera zoom with zero product warnings, errors, failed
    requests, unreachable actions, overlap, clipping, or page-level horizontal overflow; and
14. at 1920×1080, remeasure the governed performance and exact asset/object/actor/draw budgets.

Live keyboard evidence must be labelled honestly. A controller that focuses but does not synthesize
activation is not a physical keyboard pass and may not be replaced by a relabelled click. Automated
native-button keyboard parity remains necessary but distinct.

## Keep / kill gate

Keep only if a player can click the visible parcel, understand and start the exact existing Annex,
see authoritative cash and lifecycle truth repaint immediately, and continue advancing construction
on the same living lot.

Kill or revise if:

- parcel activation still ejects the player to a standalone screen;
- Phaser receives or owns a construction command/result;
- UI duplicates price, timing, affordability, capacity, or lifecycle law;
- a stale or rapid action can double-commit;
- construction start resets the renderer/camera or disturbs production truth;
- renderer failure removes the action;
- the deep fallback is deleted, weakened, or made behaviorally different; or
- the slice introduces unsupported facility, construction, people, or economy behavior.

## Explicitly outside V1

- additional parcels or facilities;
- a second Annex or fourth shared slot;
- placement, rotation, land purchase, roads, paths, demolition, relocation, or construction queues;
- cancellation, pausing, acceleration, refunds, deposits, installments, debt, or financing;
- builders, worker assignment, construction-labor simulation, utilities, maintenance, repairs,
  decay, condition, attractiveness, prestige, or research;
- new opex or any arbitrary cash sink;
- soundstage, scenery, or post expansion;
- production-ceiling changes;
- autoplay, speed controls, second clocks, or offline progress;
- persistent lot mounting or exact camera restoration across all deep screens;
- default startup/load routing;
- new people autonomy, workload, stress, fatigue, relationships, pathfinding, or needs; and
- any repair or reclassification of a D-17B macroeconomic residual.

The governing economic status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal G12
timing remain open. No financing, loan, bailout, restructuring, failure ladder, arbitrary cash sink,
or macroeconomic certification is authorized by this contract.
