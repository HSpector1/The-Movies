# World-First Operational Annex Work Presence V1 Contract

Status: **FROZEN BEFORE IMPLEMENTATION**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Pre-contract HEAD: `04932d27ed5dd3d512866dfe373f3fca1931134f`

## 1. Product ruling

The Studio Lot is the primary game surface. The accepted Development & Casting Annex therefore
cannot stop being playable when its construction label changes from Building to Operational.

Today the physical Annex truthfully shows its fixed parcel and construction lifecycle, but an
operational building remains a permanent capacity trophy even when its exact one slot is performing
real screenplay, casting, or production work. The Engine already owns that work. V1 makes it
visible, inspectable, and connected to its existing deep owner:

```text
PHYSICAL DEVELOPMENT & CASTING ANNEX
→ SEE AVAILABLE OR WORKING
→ SELECT THE BUILDING IN THE LIVING LOT
→ INSPECT EXACT 0/1 OR 1/1 SLOT TRUTH
→ INSPECT EXACT OWNER / TITLE / ACTIVITY
→ OPEN THE EXISTING DEEP OWNER IF NEEDED
→ RETURN TO FRESH ANNEX CONTEXT ON THE STUDIO LOT
```

A changed label or status lamp alone is **display-only** and fails this contract. The physical
building must expose the exact current work and a meaningful inspection/handoff path.

This is not a second Annex, generalized facility system, placement tool, queue, worker simulation,
facility-choice action, or economic change. It is a world-presence repair around the one already
authorized facility.

## 2. Observed critical-experience result

The post-publicity several-minutes-on-Lot audit found:

- Stage 7 selection, blocker inspection, exact Director dispatch, travel acknowledgement, scenery
  clearance, take scheduling, and next-week work progression already operate in world;
- the named Director/Lead inspector and Talent Profile handoff already operate over the living Lot;
- Annex Vacant → Building → Operational construction already operates in world;
- physical Administration publicity now supplies another exact studio event; and
- the largest remaining parallel-production gap is physical Soundstage 12, but its mandatory art
  preflight was killed and no runtime integration is authorized.

The strongest legal next repair is therefore the existing Annex's real work presence. Core already
proves idle and occupied operational states. No new art or simulation law is needed.

An exact selected-production deep handoff remains a useful lower-ranked supporting repair. It does
not outrank making an existing physical capital asset visibly perform real studio work.

## 3. Frozen Engine and construction authority

The complete read authority already exists in `studioCalendar(state)`:

```ts
type StudioCalendarFacilityView = {
  facilityId: string
  facilityName: string
  capability: FacilityCapability
  capacity: number
  occupied: number
  available: number
  slots: StudioCalendarSlotView[]
}

type StudioCalendarSlotView = {
  facilityId: string
  facilityName: string
  capability: FacilityCapability
  slot: number
  occupant: {
    owner: 'production' | 'script' | 'casting'
    ownerId: string
    title: string
    activity: ProductionPhase | 'drafting' | 'rewriting' | 'auditioning'
  } | null
}
```

The exact canonical facility remains:

```text
id          == facility-development-casting-annex
name        == Development & Casting Annex
capability  == development-casting
capacity    == 1
slot        == 0
```

Construction authority remains unchanged:

- the fixed parcel is `expansion`;
- the project is `construction-development-casting-annex`;
- the Annex costs exactly `$780,000` and completes after 13 real weekly advances;
- the facility is appended only by authoritative completion;
- completion itself does not migrate an existing reservation into the Annex;
- the completed Annex can be honestly idle; and
- later ordinary Engine allocation may place a screenplay, casting session, or production in its
  one slot.

`studioCalendar` already validates facility identity, capability, slot range, unique occupancy,
reservation ownership, owner existence, production phase, screenplay status, and casting-session
status. Calling it mutates no input, consumes no RNG, and applies no action.

V1 must not reimplement those joins from raw arrays in React or Phaser.

## 4. Exact Lot projection

`StudioLotSnapshot` receives one narrow leaf:

```ts
type LotAnnexWorkOccupant = {
  owner: 'production' | 'script' | 'casting'
  ownerId: string
  title: string
  activity: 'development' | 'preProduction' | 'drafting' | 'rewriting' | 'auditioning'
  workState: 'working' | 'held'
  statusLabel: string | null
  blocker: {
    kind: 'facility-capacity'
    headline: string
    detail: string
  } | null
}

type LotAnnexWork = {
  facilityId: 'facility-development-casting-annex'
  facilityName: 'Development & Casting Annex'
  capability: 'development-casting'
  capacity: 1
  occupied: 0 | 1
  available: 0 | 1
  slot: 0
  occupant: LotAnnexWorkOccupant | null
}

annexWork: LotAnnexWork | null
```

`studioLotSnapshot(state)` must call the existing Calendar adapter once, select the exact unique
facility ID, and copy the exact row/slot/occupant fields. It may narrow the production activity
union to `development | preProduction` because no other production phase can legally occupy a
Development & Casting slot.

For a production occupant, the adapter must also join the exact unique Calendar production outlook
by `ownerId`, require its phase to equal the occupant activity, and copy current status truth:

- `on-schedule` → `workState: working`, exact non-empty `statusLabel`, `blocker: null`;
- `held` → `workState: held`, exact non-empty `statusLabel`, and the exact existing
  `facility-capacity` blocker headline/detail; and
- `decision-required` or `legacy-countdown` in an Annex Development/Pre-production slot fails
  closed as contradictory authority.

Script drafting/rewriting and casting auditioning occupants use `workState: working` with
`statusLabel: null` and `blocker: null`. This is not inference that a person is moving or present;
their active reservation and activity are the exact current work.

Under the current native SaveFileV11 game, at most two productions share two soundstages, so an
Annex-reserved Pre-production cannot ordinarily fail its soundstage transition. A retained-reservation
Held state is reachable only under the existing configured-capacity research/test seam (for example,
with Soundstage 12 deliberately absent). V1 supports that exact state so the configured read model
never lies, but does not claim it is an ordinary-player event, require a native held fixture, or use
it to justify new capacity law.

The field is `null` for Legacy, Vacant, and Building Annex states. It is non-null only when:

1. construction truth is Operational;
2. operations mode is managed;
3. the exact unique canonical Annex facility exists;
4. its capability, name, capacity, occupied, available, slot count, and slot identity are exact;
5. `occupied + available === 1`;
6. `occupied === 0` if and only if the exact slot occupant is null; and
7. `occupied === 1` if and only if the exact slot occupant is non-null.

Operational truth with a malformed, absent, duplicate, or contradictory row/outlook fails closed
rather than fabricating Available, Working, or Held. The adapter may surface the existing invariant
error; it may not silently select the first lookalike facility or production.

No projected field becomes a new save field or gameplay authority.

## 5. Pure Annex work selector

One pure `operationalAnnexWorkContext(snapshot)` selector keeps host validation out of Phaser. It
must require:

- exactly one `expansion` building fact;
- `constructionStatus === 'operational'` and exact completed progress truth;
- one non-null `annexWork` record with the exact canonical facility identity;
- exact capacity `1`, slot `0`, and internally consistent occupied/available counts;
- for Available: `occupied === 0`, `available === 1`, and `occupant === null`;
- for Working/Held: `occupied === 1`, `available === 0`, and one exact occupant;
- non-empty owner ID and title;
- activity `development | preProduction` only for `production`;
- activity `drafting | rewriting` only for `script`; and
- activity `auditioning` only for `casting`;
- non-production occupants to be Working with null status/blocker;
- a Working production to have one non-empty status label and null blocker; and
- a Held production to have one non-empty status label and an exact non-empty facility-capacity
  blocker.

It returns a canonical Available, Working, or Held context, or null. It does not call Calendar/Core,
find a person, infer a queue, choose a facility, mutate state, navigate, or recommend an action.

Input array order, same-title work, and unrelated facility rows must never affect identity.

## 6. Annex-reserved production location correction

The current UI adapter maps every managed Development production to `writers` and every managed
Pre-production production to `casting`, even when the exact current reservation names the physical
Annex. That makes `facilityLabel === Development & Casting Annex` disagree with
`locationBuildingId`.

V1 authorizes one presentation/read-model correction inside `managedWorkflowLocation`:

- for `development` or `preProduction`, inspect the authoritative current reservations;
- when the exact `facility-development-casting-annex` reservation is present, return
  `locationBuildingId === 'expansion'`;
- otherwise preserve the existing `writers` / `casting` mapping byte-for-byte; and
- do not change soundstage, scenery, post, theater, Legacy, configured-research, or allocation law.

This does not move a production, choose the Annex, alter a reservation, or create a route. It makes
the Lot point to the physical place already named by Engine truth.

The location correction must reject contradictory duplicate canonical Annex reservations through
existing invariants. It may not use facility label text, title, phase alone, or array position as
Annex identity.

## 7. Physical and semantic building state

The accepted runtime `annex-parcel` / `expansion` place remains the sole physical identity. V1
changes no manifest, polygon, anchor, exporter, plate, or authored/generated art.

Vacant, Building, Operational construction geometry remains exactly as accepted. When Operational:

- an Available slot paints **DEVELOPMENT & CASTING ANNEX · AVAILABLE**;
- a Working occupant paints **DEVELOPMENT & CASTING ANNEX · WORKING**;
- a configured-evidence Held production paints **DEVELOPMENT & CASTING ANNEX · PRODUCTION HELD**;
  and
- the existing operational Graphics/label may add a bounded work-light/window treatment from the
  same exact record.

The treatment must reuse existing display objects. It may not add a texture, atlas frame, actor,
route, worker, smoke loop, vehicle, queue marker, or second renderer draw.

Physical parcel selection, its visible label/status, and the native `expansion` semantic companion
enter the same existing Annex context. Selection itself changes no Engine byte and consumes no RNG.
Renderer/manifest failure retains the complete semantic inspection and deep-owner path without
claiming a physical outline.

## 8. In-world Annex inspector

The existing Operational Annex section remains the context owner. It retains completion week,
capacity gained, current shared capacity, permanent-project copy, and no repeat/upgrade/relocation/
demolition action.

Its current blanket sentence that the additional slot “is available now” must be replaced with
occupancy-aware or neutral exact copy. The stable operational summary is:

```text
Completed in Week <exact completed week>. Current Annex slot use: <occupied> of 1.
```

No 1/1 state may simultaneously claim that the slot is available.

V1 adds one exact **Current work** section.

Available state exposes:

```text
Slot use: 0 / 1
Status: Available
No current screenplay, casting session, or production occupies the Annex.
```

Occupied state exposes:

```text
Slot use: 1 / 1
Occupancy: Occupied
Work status: Working | Production held
Owner kind: Production | Screenplay | Casting session
Title: exact Calendar title
Activity: Development | Pre-production | Drafting | Rewriting | Auditioning
```

A Held production additionally exposes the exact Calendar status label and exact capacity-blocker
headline/detail. That blocker names the target capability/phase that stopped progression; it does
not relabel the Annex itself as blocked. A Working production exposes its exact on-schedule label
without a blocker. Script and casting work expose no invented production status.

Copy may say the slot is occupied/reserved by the exact current work. It may not say a named person
is inside, traveling, assigned to the building, queued, waiting, stressed, fatigued, or working
there unless a separate authoritative system later proves that fact.

A facility itself is not `blocked`. A production is described as Held only through the exact joined
Calendar outlook required by section 4.

The occupied Working/Held section supplies one native **Open details** action when a host owner
exists. The action label names the exact destination and title. It is supporting infrastructure
after world inspection, not the primary way to discover the work.

## 9. Exact deep-owner handoff and return

The Lot emits only the selected occupant identity:

```ts
type LotAnnexWorkOwnerIntent =
  | { owner: 'production'; ownerId: string }
  | { owner: 'script'; ownerId: string }
  | { owner: 'casting'; ownerId: string }
```

Immediately before navigation, React/App must rebuild the latest snapshot/context and require every
identity field to match the rendered occupant. A changed, released, completed, missing, duplicate,
or replaced occupant fails closed in the Annex context. Never route by title or substitute the next
occupant.

Exact destinations are:

- production → existing Dashboard Production Board with `focusProductionId`;
- script → existing Writers Room with `focusProjectId`; and
- casting → existing Casting Room focused through the exact active session's project identity.

For casting, App may resolve the project ID only by revalidating the exact current session ID against
the latest authoritative state/read model. A same-title project is not sufficient.

The direct owner handoff carries one typed, consume-on-return `annex-work` Lot focus. Direct Back
returns to the physical/semantic Annex context, rebuilds fresh occupancy, and focuses the stable
Current work heading. It does not preserve or replay the old occupant.

If deep work completes/releases the slot, return truthfully shows Available. If another exact owner
now occupies it, return truthfully shows that new Working/Held state without auto-opening its deep
screen.

Dashboard navigation unrelated to the exact production handoff demotes `annex-work` to ordinary
selected-building return. Writers/Casting child actions tied to the exact selected work may retain
Annex return through their governed completion chain. Unrelated navigation, starting/loading/
replacing a studio, ordinary deep entry, or Lot unmount outside this handoff clears the intent.

No navigation changes GameState, SaveFileV11, RNG, week, money, reservations, or work progression.

## 10. Latest truth, replacement, and input law

- Selecting another person, production, place, publicity office, scenery yard, or building closes
  the Annex context and any pending deep-owner identity.
- A same-mounted week advance keeps Annex selection and repaints current slot truth.
- Construction completion may enter Operational Available without ceremony beyond the existing
  sole completion announcement.
- Loaded native Operational Available/Working truth—and separately mounted configured Held
  evidence—paints directly and never replays construction or work-start ceremony.
- A stale button activation after occupant replacement calls no navigation owner.
- Double-click, repeated Enter/Space, and held-key generation produce at most one navigation call.
- The person-profile modal suspends physical, semantic, and Annex controls; no held activation may
  cross the modal boundary.
- Delayed renderer readiness, hidden-tab resume, context loss, recreation, and renderer rejection
  cannot restore a stale occupant or open a deep screen.
- A new/load/replaced studio cannot inherit Annex selection or return intent from the prior studio.

There is no state-changing Annex work command in V1, so no pending gameplay latch, ActionOutcome,
or renderer-to-Engine action seam is authorized.

## 11. Explicit truth boundary

V1 does **not** create or imply:

- a queue, queue position, request time, waiter, desired facility, or ETA;
- a player facility-choice, assignment, redirect, relocation, prioritization, or free-slot command;
- future reservation separate from the current occupied slot;
- a facility blocker or capacity failure persisted on the building;
- a named worker, writer, actor, publicist, crew member, destination, path, arrival, or workload;
- needs, stress, fatigue, relationships, autonomy, or character control;
- a new production/script/casting task, duration, clock, completion, or cancellation rule;
- another Annex, upgrade, maintenance cost, marginal opex, depreciation, demolition, or refund;
- a construction catalogue, placement grid, free build, or unrestricted lot editing;
- Soundstage 12 geometry or revival of its killed art candidate; or
- a cash sink, financing, loan, bailout, restructuring, or failure ladder.

Engine allocation remains deterministic and automatic. The UI may describe a current exact
reservation; it may not promise or control the next one.

## 12. Accessibility, layout, and focus

- Available/Working/Production held and 0/1 or 1/1 are visible text, not color-only state.
- Owner kind, title, and activity are exposed in a semantic definition list.
- The deep-owner action is a native button with an exact accessible name and at least a 44×44 CSS
  pixel target.
- Physical label, semantic companion, and inspector use consistent Available/Working/Held
  vocabulary.
- On selection, focus enters the stable Annex status/current-work region.
- Direct deep return focuses Current work; hostile/unavailable return falls back to Annex status or
  the Lot heading without selecting another owner.
- Pointer/keyboard activation is exact-once, world down-events are contained, and focus indicators
  remain unclipped.
- Forced colors, grayscale, keyboard-only use, 200% page zoom, and screen-reader order retain state,
  title, activity, action, and reason.
- The existing live Lot stays visible around the panel at governed wide layouts. Compact layouts may
  scroll the Annex panel but may not replace the world or hide all current work.

## 13. Performance and asset boundary

No image, texture, atlas frame, actor, route, display object, dynamic simulation, or draw loop is
authorized. The Operational paint reuses `expansionGraphics` and `expansionLabel`.

Frozen maximums remain:

```text
renderer draws:          exactly 1 total
display objects:         exactly 34
dynamic actors:          exactly 15
decoded texture bytes:   exactly 11,096,896
encoded texture bytes:   +0
routes:                  +0
```

The governed 1920×1080 wall-clock gates remain unchanged: average FPS `>= 50`, 1%-low FPS `>= 30`,
p99 `<= 33.4 ms`, and worst sampled raw frame `<= 33.4 ms` over one fresh 240-frame window. No
test may relax or smooth those thresholds.

The complete Annex inspector/handoff must remain usable at 1920×1080, 1366×768, 1024×768, 960×540
stress, actual maximum world zoom, and 200% page zoom.

## 14. Deterministic evidence

Idle and occupied evidence must be built only through public Engine actions and validated as native
SaveFileV11 with byte-identical import/export. Reuse existing Week-12 Annex completion authority
where practical; do not hand-edit a save into Operational or inject a reservation.

At minimum prove:

- Week-12 → Week-13 authoritative completion produces the exact Operational idle row
  `capacity=1 / occupied=0 / available=1 / slot 0 null`;
- later ordinary allocation produces an exact Annex occupant without moving or forging a
  reservation;
- script, casting, and production occupant selectors are covered in-memory from public actions;
- at least one native occupied SaveFileV11 supports browser acceptance; and
- fixture generation is deterministic, timestamp-free, and non-mutating to existing governed
  scenery/live-week fixtures.

Separately, configured-capacity read-model evidence must prove that an Annex-reserved
Pre-production which cannot acquire a soundstage retains 1/1 occupancy while exact Calendar status
changes from Working to Held. That state is not a native SaveFileV11/browser fixture and must be
labelled configured evidence everywhere it appears.

A dedicated generator/output directory is authorized only if the existing public-action fixtures
cannot express both states cleanly. Generated evidence is not a new game feature or save schema.

## 15. Required automated proof

At minimum prove:

1. exact Operational Available projection;
2. exact script drafting and rewriting occupants;
3. exact casting auditioning occupant;
4. exact production Development and Pre-production Working occupants;
5. exact configured-capacity occupied Pre-production → Held transition with retained Annex
   reservation and unchanged countdown, never represented as native V11 play;
6. unique exact facility identity independent of array order;
7. missing, duplicate, wrong-name/capability/capacity/slot/count and contradictory-null rejection;
8. missing/duplicate/mismatched production outlook and invalid Working/Held/blocker rejection;
9. Legacy/Vacant/Building return null and preserve construction presentation;
10. pure selector hostile owner/activity/title/ID/status rejection;
11. exact Annex reservation changes only UI `locationBuildingId` to `expansion`;
12. base D&C and every non-Annex location mapping remain unchanged;
13. physical label/paint Available, Working, and Held parity with the semantic companion;
14. existing Graphics/label reuse with exact 34/15/bytes/one-draw budgets;
15. physical, label, and semantic entry reach one inspector;
16. exact 0/1 and 1/1 inspector copy for all owner kinds/activities/statuses;
17. no contradictory operational “available now” copy at 1/1;
18. no worker, queue, ETA, reroute, facility-blocked, or future-reservation claim;
19. production, script, and casting deep destinations receive exact current identities;
20. casting session resolves its exact project without title matching;
21. direct return rebuilds fresh Available, same occupant, replaced occupant, and Held truth;
22. stale/disappeared/completed/released occupant activation fails closed;
23. unrelated navigation and studio replacement clear the typed return intent;
24. renderer/manifest failure retains complete semantic inspection/handoff;
25. delayed ready, hidden tab, recreation, context loss, reduced motion, and modal suspension;
26. pointer, Enter, Space, double-click, held-key, focus, live-region, and input containment;
27. governed viewport, maximum world zoom, 200% browser zoom, forced-color, and contrast boundaries;
28. exact deterministic SaveFileV11 idle/occupied replay plus separately labelled configured Held
    read-model proof; and
29. no core, schema, migration, action, tuning, economy, manifest, exporter, art, or RNG change.

## 16. Ordinary-player browser acceptance

Against deterministic native authority:

1. load or reach the operational idle Annex and enter the default Studio Lot;
2. observe **AVAILABLE** physically and exact 0/1 truth in its inspector;
3. reach an ordinary Engine-allocated occupied Annex without hand-editing state;
4. observe **WORKING** physically and exact 1/1 owner/title/activity truth;
5. open that exact existing deep owner;
6. use direct Back and recover fresh Annex context on the Lot;
7. where the deep action releases the slot, observe fresh Available rather than stale Working;
8. prove one Annex-reserved production points to the physical Annex rather than Writers/Casting;
9. repeat proportional keyboard, reduced-motion, renderer-failure, 960×540, maximum-world-zoom, and
   200%-browser-zoom checks; and
10. confirm clean diagnostics and unchanged frozen performance/asset budgets.

The world inspection must precede the deep screen. A test that opens Calendar first and merely
returns to a changed label does not satisfy the product loop.

## 17. Proportional final verification

- both TypeScript projects;
- focused Calendar projection, Annex selector, adapter location, Scene/View, React/App, routing,
  persistence, and existing Annex construction tests;
- complete repository Vitest suite;
- governed D-16/D-17 suite;
- production build;
- focused and full Lot Chromium;
- deterministic native SaveFileV11 replay;
- exact manifest/exporter/art non-change hashes;
- live ordinary-player responsive/performance evidence; and
- independent strict authority and visual review.

No new full economy or facilities corpus is proportional. This is a read/presentation/navigation
slice over already accepted behavior.

## 18. Keep / Kill boundary

Keep only if the ordinary player can select the physical operational Annex, distinguish Available
from Working, inspect exact current work, optionally visit its exact deep owner, and return to fresh
Annex truth without any invented facility or worker claim. Configured Held truth must also remain
honest, but it is robustness evidence rather than an ordinary-player Keep requirement.

Kill or narrow if implementation requires:

- a status-only visual with no exact inspector/handoff;
- new Core/GameState/SaveFile/tuning/allocation behavior;
- a queue, reroute, facility choice, named worker, destination, ETA, or workload fiction;
- title-based owner routing or first-match facility acceptance;
- changing the accepted Annex capex, duration, capacity, opex, or construction law;
- new manifest geometry, exporter output, authored/generated art, texture, object, actor, or draw;
- reviving physical Stage 12 without new lawful art authority;
- keeping a stale occupant or return intent across state/studio replacement;
- making a deep screen the primary discovery surface; or
- relaxing accessibility, responsive, performance, or exact-once gates.

## 19. Governing residuals

This world-presence repair changes no economic classification. The governing status remains:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open.

No financing, loans, bailouts, restructuring, failure ladder, arbitrary cash sink, facility tuning,
construction tuning, new facility candidate, or macroeconomic certification follows.
