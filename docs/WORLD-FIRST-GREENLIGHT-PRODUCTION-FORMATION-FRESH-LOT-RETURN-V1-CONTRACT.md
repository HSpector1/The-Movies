# World-First Greenlight Production Formation & Fresh Lot Return V1 Contract

Status: **FROZEN — IMPLEMENT ONLY THIS BOUNDED MANAGED-WORLD SLICE**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Gate closure authority: `79be27e`

Person-flow maintenance authority: `ff0e0fc36628d248cedbec25fdbbfef01ebe8655`

## 1. Authority base

This contract follows:

- the Owner's binding world-first doctrine in `CURRENT-BEST.md`;
- accepted D-17B bounded economy truth;
- Managed Production Operations and SaveFileV11;
- World-First Studio Home V1;
- World-First Named Person Work & Career Inspector V1;
- World-First Soundstage Intervention, Live Week Advance, Scenery Load-In, Operational Annex, and
  selected Stage 7 detail continuity;
- World-First Studio Gate Talent Arrival & Hiring Return V1; and
- the proportional Director-call/nameplate maintenance at `ff0e0fc`.

The binding product law remains:

> **THE STUDIO LOT IS THE PRIMARY GAME SURFACE. MANAGEMENT UI SUPPORTS THE WORLD.**

Engine/GameState remains sole authority for greenlight legality, identity allocation, money,
ledger, Production facts, screenplay linkage, workflows, reservations, phases, countdown, people,
facility allocation, tasks, commands, time, RNG, saves, and outcomes. This milestone creates one
strict accepted-action receipt and a transient world-return seam. It creates no simulation.

Protected authority remains:

- `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B: `35d42687a410a621becf1df35c75986657f8c44e`;
- Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`; and
- accepted Gate implementation: `ca8279cfb91990ef1904e36fa1d92d762811d180`.

No merge, push, tag, or protected-ref movement is authorized.

## 2. Purpose and measured gap

The movie-production lifecycle currently loses exact world continuity at its beginning.

`Assembly.handleGreenlight` calls the existing Engine adapter and, on success, emits only the next
`GameState`. App replaces state and performs the old generic return. The exact production accepted
by the player is discarded as navigation provenance.

The Lot already projects the new picture's exact title, phase, countdown, facility reservation,
Director, Lead, status, blocker, and command. The exact Director and Lead already become visible
Role Atlas inhabitants. However:

- Development and Pre-production deliberately do not create physical stage dressing;
- generic desk auto-orientation is not world provenance;
- the production rail is supporting UI rather than physical continuity; and
- two or more managed operations with no exact Stage 7 selection can leave the Hollywood desk
  saying `No active production` while real pictures are active.

The truthful current experience is therefore:

```text
DEEP ASSEMBLY
→ ACCEPTED GREENLIGHT
→ GENERIC LOT / DASHBOARD RETURN
→ RESULT EXISTS IN READ MODELS
→ THE WORLD DOES NOT ESTABLISH WHICH PICTURE JUST FORMED
```

V1 closes only that break. It does not invent physical base Development/Casting rooms.

## 3. Binding world-first loop

The retained ordinary managed-player loop must be:

```text
LIVE LOT
→ WRITERS / CASTING SUPPORTING SURFACE
→ ASSEMBLE ONE READY SCREENPLAY PACKAGE
→ ACCEPT GREENLIGHT THROUGH EXISTING ENGINE LAW
→ FRESH LOT REMOUNT AGAINST THE ACCEPTED STATE
→ EXACT NEW PICTURE AND EXACT DIRECTOR SELECTED
→ SEE DIRECTOR AND LEAD AS THAT PICTURE'S INHABITANTS
→ INSPECT EXACT DEVELOPMENT PHASE / RESERVATION / STATUS / COUNTDOWN
→ ADVANCE ONE EXISTING ENGINE WEEK IN THE MOUNTED LOT
→ SEE THE GOVERNED GREENLIGHT-TICK SKIP
→ ADVANCE AND SEE FRESH PRE-PRODUCTION TRUTH
→ ADVANCE AND SEE FRESH REHEARSAL / EXACT SOUNDSTAGE TRUTH
```

When the Rehearsal allocation is Soundstage 7, its existing physical stage embodiment becomes
visible. When the allocation is Soundstage 12, the existing truthful Stage 12 fallback remains;
this milestone must not force allocation or claim rejected physical Stage 12 art.

The selected new production stays exact through mounted no-release advances. If it ceases to be
valid, the Lot becomes neutral. Another production is never substituted.

## 4. Hard scope narrowing

The contracted primary path is:

```text
managed Studio Operations
+ managed Script Development
+ one Ready screenplay
+ greenlightScriptProject
+ Lot-origin return context
```

A managed Operations state with legacy Script Development may use the same strict direct-
greenlight receipt as compatibility evidence, without claiming a screenplay link.

Pure legacy Operations retains its existing generic greenlight and return behavior. Legacy owns no
authoritative Development/Pre-production workflow or facility reservation, so it cannot be
presented as this managed formation loop.

When Studio Lot overview is explicitly rolled back, Dashboard return remains authoritative. When
Operation Hollywood is rolled back, the classic Lot compatibility path remains; V1 makes no claim
that the Hollywood person-selected presentation is available there.

## 5. Existing Core greenlight authority

No greenlight behavior changes.

Core already owns:

- collision-safe `predictProductionId(state)` allocation, including same-week suffixes;
- exactly one appended `Production` with `startTick === state.market.tick`;
- the governed `TUNING.PRODUCTION_TICKS` eight-tick countdown;
- immutable forecast and participant truth;
- the exact production debit and variable freelancer-fee ledger rows;
- unchanged simulation RNG state at greenlight;
- one managed `ProductionWorkflow` created by `addManagedProductionWorkflow`;
- deterministic Development & Casting slot allocation or loud rejection;
- exact Ready screenplay → In Production linkage for `greenlightScriptProject`; and
- all affordability, employment, exclusivity, package, facility, and save invariants.

The existing greenlight action remains the sole mutation. V1 must never call
`predictProductionId`, rebuild ledger/cash, allocate a facility, infer a workflow, or apply another
action to discover what happened.

## 6. Pure accepted-greenlight receipt

Add one pure strict helper at the world/adapter boundary equivalent to:

```ts
export type GreenlightFormationReceipt = {
  productionId: string
  directorId: string
  leadId: string
  greenlightWeek: number
  scriptProjectId: string | null
}

export function acceptedGreenlightFormationReceipt(
  before: GameState,
  after: GameState,
): GreenlightFormationReceipt | null
```

The receipt carries identity/event provenance only. It carries no title, phase label, facility
label, status, countdown, command, cash, ledger row, mutable state, scene object, or cached person.

The helper returns non-null only when every condition below is exact:

1. `before !== after`, both states are managed Operations, and their seeds, market ticks, and
   `rngState` are unchanged;
2. active-production IDs are individually unique in both states;
3. every prior production ID remains, no prior production disappears, `after` has exactly one
   additional production, and its total count is exactly prior count plus one;
4. the new production appears exactly once, owns a non-empty ID, starts at the prior market week,
   owns exactly the governed eight-tick countdown, and has distinct Director and Lead IDs;
5. the underlying Director and Lead identities each occur exactly once in current talent truth;
6. prior workflow IDs are unique and preserved, and exactly one new workflow names the new ID;
7. that workflow is exact Development, has no Shooting task/blocker, and owns exactly one
   Development & Casting reservation whose production/phase/capability/facility/slot truth agrees
   with one exact current facility;
8. appended ledger rows include exactly one `production` row naming the new ID; any additional
   appended rows are existing freelancer-fee rows for that same ID; prior ledger rows are not
   changed or removed;
9. no prior screenplay project changes unexpectedly; and
10. either exactly one Ready managed screenplay becomes In Production and links to the new ID, or
    the compatible legacy Script Development mode changes no screenplay link.

Do not accept `.at(-1)`, title, concept, array position, largest ID, predicted ID, first workflow,
first ledger row, or first changed object as identity. Same-title and same-week pictures must remain
distinct.

The helper is a receipt validator, not a second greenlight validator. It does not recompute price,
forecast, talent eligibility, facility allocation, or legality.

## 7. Assembly exact-once owner

`Assembly` continues to call only the existing `greenlight` or `greenlightScriptProject` adapter.
After success it computes the strict receipt from its exact current `state` and `result.next`, then
calls App with next state plus the nullable receipt.

Add a synchronous accepted-gesture latch:

- action remains on the native button's `click` path;
- pointer, touch, Enter, and Space must produce at most one Engine call and one callback;
- do not add a second pointer-down or keydown mutation;
- double-click, held-key repeat, Enter→Space tails, and compatibility click cannot apply again;
- Engine rejection clears the latch and leaves the existing loud error/focus path usable; and
- a receipt failure does not undo an Engine-accepted state—it demotes only special formation
  navigation to the existing generic return.

The button may show a bounded pending label/disabled state, but no async clock, progress claim, or
second action owner is permitted.

## 8. App independent latest-state check

App must not trust the Assembly receipt by itself.

At callback time App requires that the exact `state` object rendered into Assembly is still
`latestStateRef.current`. A stale callback must not overwrite newer state. When the before-state is
still exact, App independently recomputes the receipt from that latest before-state and the
proposed next-state and compares every receipt field.

If exact:

1. App accepts the next `GameState` once;
2. existing autosave observes only that accepted state;
3. a Lot-origin root receives a typed transient formation entry; and
4. Dashboard/rollback origins retain their existing root behavior.

If the captured before-state is stale, App keeps the latest state/screen, accepts no successor, and
exposes no formation navigation. If the before-state is exact but the nullable receipt is absent or
does not match App's recomputation, App may accept the Engine successor through the existing generic
return but exposes no formation ceremony or selected identity. It must never guess a production
from the successor state.

## 9. Studio-session and replacement boundary

`GameState` has no persisted unique studio ID. `state.seed`, `snapshot.sceneSeed`, production ID,
and studio name are not sufficient—another same-seed studio can reuse all of them.

V1 therefore relies only on the immediate accepted callback plus existing App-owned whole-state
replacement law:

- confirmed New Studio;
- accepted Saves load;
- accepted Start/import; and
- any equivalent full GameState replacement

must unconditionally overwrite the screen and clear the formation receipt, selected production,
selected person, pending renderer selection, held activation, focus intent, and one-shot
announcement. Rejected/declined replacement preserves current context.

Do not add a SaveFile field or claim `seed` is a unique studio identity. Refresh/reload starts from
ordinary saved Studio Home truth and never reconstructs “Picture formed.”

## 10. Typed transient navigation

Add bounded UI-session arms equivalent to:

```ts
type Screen =
  | /* existing */
  | {
      kind: 'lot'
      entryFocus: 'production-formation'
      entryProductionFormation: GreenlightFormationReceipt
    }
```

The existing Assembly screen keeps its typed `returnContext`. Only a validated accepted callback
may replace a Lot-origin return focus with `production-formation`. Ordinary Assembly cancel, Engine
rejection, Dashboard origin, legacy Operations, receipt mismatch, and unrelated navigation retain
their existing behavior.

The transient receipt is never persisted, serialized, exposed to Core, or restored from a save.

## 11. Strict latest formation context

Add one pure snapshot selector equivalent to:

```ts
export type ProductionFormationContext = {
  operation: ProductionOperationsState
  director: LotPersonState
  lead: LotPersonState
  receipt: GreenlightFormationReceipt
}

export function productionFormationContext(
  snapshot: StudioLotSnapshot,
  receipt: GreenlightFormationReceipt,
): ProductionFormationContext | null
```

It accepts only:

- `operationsMode === 'managed'`;
- `stageAssignmentAuthority === 'engine'`;
- exactly one complete operation with the receipt production ID;
- exact operation Director/Lead IDs equal to the receipt and distinct;
- non-empty operation title and closed phase/status/facility/countdown/progress shapes;
- exactly one current Director person and one current Lead person;
- both people with `authority: 'active-production'`, the exact ID/title, and correct Role Atlas
  role; and
- exact strict `lotPersonWorkContext` joins for both people to this one operation.

The initial entry additionally requires current Development at the accepted week with the governed
eight-tick countdown. Once entry is owned, mounted continuity may accept fresh later managed phases
for the same exact production and people.

Zero/multiple operations, duplicate IDs, legacy/presentation authority, same-ID cross-production
people, same person in both roles, changed identity, malformed fields, disappearance, release, or
wrong initial phase returns `null`. Array order and another valid operation cannot substitute.

## 12. Explicit-empty entry and fresh focus

For `entryFocus === 'production-formation'`, initial Lot production/person state must be explicit
empty. It must not briefly auto-orient to Stage 7, the only operation, the first production, or a
previous selected person before the entry selector runs.

On exact entry:

- set the exact new production ID;
- select the exact Director in React;
- paint/tint/select that same existing Director sprite if a validated renderer is ready;
- leave the exact Lead visible and selectable;
- show fresh current operation/person facts only; and
- focus the connected Director inspector/status after its conditional render commits.

On invalid entry, focus the stable Studio Lot heading with no selected production/person and no
formation acknowledgement. Never fall back to another production, current Stage 7 occupant,
selected building, or first named person.

## 13. World presentation and truthful copy

The fresh Lot must make the formed picture immediately understandable without opening another
screen:

- `PICTURE FORMED` as one bounded transient acceptance witness;
- exact current title;
- exact phase;
- `Production facilities`, using the existing production-level facility label;
- exact production status and countdown;
- exact Director and Lead names;
- selected Director nameplate/tint and inspector; and
- a visible/selectable exact Lead inhabitant.

The existing production panel may add the exact Lead alongside Director. The exact person
inspector remains the detailed work/career owner; the canonical Talent Profile may still open over
the mounted Lot.

The formation witness is UI-session acceptance feedback. It may be consumed by the first week
advance or explicit unrelated world selection. It must not replay on greenlight-tick skip,
ordinary repaint, renderer recreation, profile close, deep return, save load, or refresh.

Do not say either person arrived, travelled, entered a room, is seated, queued, rehearsing, working
at a desk, or physically occupies the production reservation.

## 14. Governing phase continuity

V1 freezes the existing greenlight-tick behavior exactly:

| Player state | Market week | Phase | Remaining production ticks |
| --- | ---: | --- | ---: |
| accepted greenlight | `t` | Development | 8 |
| first Lot advance | `t + 1` | Development | 8 |
| second Lot advance | `t + 2` | Pre-production | 7 |
| third Lot advance | `t + 3` | Rehearsal | 6 |

The first advance must not fake progress. Each step is one existing App/Engine week and each Lot
repaint reads the fresh snapshot.

Mounted no-release advances retain the same `StudioLotScreen`, Phaser view where available, camera,
exact production ID, selected Director, and selectable Lead while current truth remains exact.
Phase, facility, status, countdown, and any physical stage presence repaint from Engine truth.

Release/Newspaper/Autopsy chains and explicit non-modal deep navigation still unmount the Lot under
the current Studio Home architecture. V1 does not claim selection/camera continuity through those
chains. Existing typed roots remain authoritative.

## 15. Physical place and motion boundary

The accepted Hollywood manifest owns canonical physical places for Stage 7, Administration &
Publicity, Scenery & Service, the Annex, and the Studio Gate. It owns no canonical base Development
or Casting place.

The projection's `writers`, `casting`, and `expansion` locations are production/facility read-model
truth. They are not personal coordinates.

V1 may show:

- the exact production reservation label;
- existing visible Director and Lead inhabitants;
- selected-person tint/nameplate;
- exact person/production inspectors; and
- later existing soundstage state/fallback.

V1 may not add or imply:

- Development or Pre-production person travel;
- room occupation, huddles, meetings, desk work, rehearsal, or call status in those phases;
- personal destination, ETA, position, workload, queue, needs, or autonomy;
- new Hollywood place geometry, art, route, prop, actor, or animation; or
- relabelling Publicity, Service, Annex, Gate, Stage 7, or an unspecified background building.

The only authorized person travel remains the existing Shooting Director dispatch. Maintenance
`ff0e0fc` ensures a Lead cannot issue that Director-only call and the selected Director's existing
nameplate follows the governed cosmetic route.

## 16. Renderer readiness, failure, and reconciliation

Semantic formation selection is complete without Phaser.

If the renderer is delayed:

- keep the latest receipt and latest complete snapshot request;
- allow mounted Engine week advances;
- revalidate current formation context at `onReady`; and
- select the exact current Director sprite only when that latest context remains exact.

Do not replay mount-time Development truth after current state has advanced. Do not replay the
formation announcement at renderer readiness.

Renderer import rejection, manifest rejection, scene failure, recreation, WebGL loss, or a false
person-selection result changes only physical highlight availability. Exact semantic production,
Director, Lead, phase, facility, status, countdown, profile, and week controls remain usable.

Snapshot reconciliation must update the selected person's current exact work facts. Missing,
changed, duplicate, released, or malformed production/person truth clears selection and pending
focus without choosing another person.

## 17. Modal, visibility, and input lifecycle

The canonical Talent Profile remains modal above the same mounted Lot. World and semantic controls
become inert; renderer animation may remain alive. Close restores the connected exact opener or a
stable Lot fallback under the existing profile contract.

Hidden tabs, modal entry, renderer failure, and whole-state replacement clear any held formation/
greenlight activation. No key or compatibility-click tail may complete against a newly rendered
control.

Formation entry itself performs no Engine action. Week advance, profile, and all existing
production commands retain their current App-owned exact-once law.

## 18. Accessibility and responsive layout

The complete path must remain usable through native semantic controls when the renderer is absent.

Required:

- visible `PICTURE FORMED`, title, phase, facility, status, countdown, Director, and Lead text;
- stable programmatic focus on the exact Director inspector after return;
- `aria-pressed` parity for exact semantic person selection;
- no information conveyed only by tint, outline, stage lamp, motion, or camera;
- at least 44 CSS-pixel action targets where actions exist;
- visible focus and forced-color treatment;
- live announcement exactly once without stealing focus; and
- no horizontal loss of the world, production panel, person inspector, named-people controls, or
  Advance action at governed compact layouts.

Prove 1366×768, 1024×768, 960×540, maximum world zoom, CSS magnification, a 480×270 CSS viewport at
device scale factor 2, and an effective browser-zoom 200% path. Reduced motion changes no identity,
selection, facts, action, or phase progression.

## 19. Frozen structural and performance boundary

V1 adds no art, texture, atlas frame, display object, actor, route, tween, animation, particle,
simulation, or renderer draw. The post-greenlight Director, Lead, sprites, labels, operation, and
building attention already exist in the same authoritative snapshot.

Measure the same post-greenlight snapshot twice:

```text
formation entry absent / neutral
formation entry exact / Director selected
```

The required feature delta is:

```text
display objects:        +0
dynamic actors:         +0
decoded texture bytes:  +0
renderer draws:         +0 persistent draws
```

The selected existing nameplate may become visible; it is not a new object. Record the exact
fixture population separately rather than pretending the earlier 34/15 one-production Shooting
tuple is a universal maximum.

Use 120 warm-up frames and a fresh 240-frame sustained window. Existing opt-in absolute thresholds
remain at least 50 average FPS, at least 30 FPS 1%-low, and no more than 33.4 ms p99/worst. A GPU
wall-clock result may be claimed only when the opt-in evidence run actually executes. Structural
parity is not wall-clock certification.

Frozen runtime/source manifest, exporter, concept plate, Gate occluder, and Role Atlas hashes must
remain unchanged. Do not run the exporter.

## 20. Required automated proof

At minimum, prove:

1. a real managed Ready-screenplay action returns one exact receipt;
2. managed direct-greenlight compatibility returns a receipt with no screenplay link;
3. pure legacy greenlight retains generic behavior and makes no managed claim;
4. before/after production/workflow/ledger/script arrays reject zero, duplicate, removed, changed,
   or multiple additions without guessing;
5. same-week collision-safe suffix and same-title pictures remain ID-exact;
6. one existing picture plus the new non-Stage-7 picture selects the new one and never reads idle;
7. two or more non-Stage-7 operations cannot substitute array-first identity;
8. exact current Director and Lead joins pass; duplicate, same-person, stale name/role/title,
   missing, legacy, or malformed joins fail neutral;
9. initial entry is explicit-empty before exact selection;
10. exact return focuses the Director inspector and selects the same physical sprite when ready;
11. delayed renderer readiness uses the latest advanced snapshot;
12. renderer rejection preserves the full semantic path;
13. accepted greenlight, presentation, profile, navigation, and return produce exact expected
    GameState/SaveFile bytes with no second action;
14. double-click, touch compatibility, Enter/Space repeat, and cross-key tails produce one accepted
    action/receipt/navigation;
15. stale App callback cannot overwrite latest state or navigate, while an exact-before receipt
    mismatch may accept only the generic return and cannot select from the successor state;
16. accepted same-seed whole-studio replacement clears all transient context without treating seed
    as identity;
17. the exact week `t / t+1 / t+2 / t+3` Development/Development/Pre-production/Rehearsal sequence;
18. selection and current facts persist through mounted no-release advances;
19. exact Stage 7 allocation gains existing physical presence while exact Stage 12 allocation
    retains its truthful fallback;
20. removal, cancellation, release, changed people, duplicate operation, and malformed state clear
    neutrally without another picture/person;
21. Lead never inherits Director-only dispatch and selected Director nameplate remains exact through
    the existing cosmetic Shooting route;
22. profile open/close and invalidation preserve existing inert/focus law;
23. no formation announcement replays on skip tick, ordinary repaint, renderer recreation, deep
    return, save load, or refresh;
24. all governed viewport, zoom, forced-color, renderer-failure, and reduced-motion paths; and
25. exact zero structural feature delta on the same post-greenlight snapshot.

Run the complete UI suite, full repository suite, D-16/D-17 governed harness, both TypeScript
projects, production build, deterministic native evidence replay, asset hashes, protected paths,
and `git diff --check` before closure.

## 21. Required real-browser acceptance

At minimum, real Chromium must prove:

1. Lot → exact Ready screenplay supporting path → Assembly → accepted greenlight → fresh Lot with
   the exact new picture and Director selected;
2. exact title, Development, facility reservation, status, eight-tick countdown, Director, and Lead
   are visible without another screen;
3. the exact Lead is visible/selectable and cannot issue the Director-only call;
4. first Advance retains Development/8 and the same mounted canvas/camera/selection;
5. second Advance repaints Pre-production/7 without replaying formation;
6. third Advance repaints Rehearsal/6 and exact Soundstage 7 physical state in the governed fixture;
7. a multiple-non-Stage-7 fixture selects the new picture rather than showing idle or another one;
8. renderer rejection retains the complete semantic journey;
9. delayed readiness after an advance selects latest truth rather than mount-time truth;
10. profile open/close keeps the Lot mounted and returns exact focus;
11. compact, maximum-zoom, CSS/effective-200%, forced-color, and reduced-motion journeys; and
12. exact structural parity after warm-up and sustained sampling.

Capture and visually review the minimum screenshots needed to prove formation framing, first-week
skip, Pre-production repaint, Rehearsal physical Stage 7, multiple-production identity, renderer
fallback, profile-over-world, responsive/zoom, and structural evidence.

## 22. Keep / Kill gate

Keep V1 only if an ordinary managed player can greenlight through the existing supporting surface,
return to the Lot knowing exactly which picture formed and who inhabits it, advance through fresh
early-phase truth, and reach existing soundstage embodiment/fallback without another abstract
production screen.

Kill or narrow the implementation if it:

- selects by first/last/title/predicted ID or substitutes another picture/person;
- relies on seed or studio name as persisted studio identity;
- labels legacy Operations as managed Development/Pre-production;
- shows a menu-only receipt without exact person/world framing;
- invents physical Development/Casting geometry, person occupancy, travel, huddle, workload, queue,
  staffing, pathfinding, or autonomy;
- changes greenlight, money, ledger, workflow, reservation, phase, countdown, time, RNG, save, or
  outcome law;
- replays formation from persisted state;
- forces Stage 7 allocation or borrows/relabels Stage 7/Service/Publicity/Gate/Annex art;
- introduces a new persistent renderer object/draw without separate authorization and evidence;
- breaks native semantic fallback, focus, compact layout, or reduced motion; or
- hides a failed GPU gate behind structural parity.

## 23. Explicit non-goals and open residuals

V1 does not authorize:

- new package, greenlight, cancellation, replacement, staffing, or assignment choices;
- personal destinations, positions, workload, stress, fatigue, relationships, or needs;
- base Development/Casting physical places or Stage 12 art;
- rehearsal, shooting, loading, Post, release, or publicity simulation beyond existing law;
- a queue, schedule, second clock, autoplay, speed control, next-event action, or event feed;
- persistent same-Phaser/camera/person selection across existing unmounted deep/release chains;
- facility catalogue, placement, upgrade, demolition, maintenance, second Annex, or fourth slot;
- any SaveFileV12 or schema/migration change;
- market/economy tuning, operating cost, or arbitrary cash sink; or
- financing, loans, bailouts, restructuring, hard bankruptcy, or a failure ladder.

The governing status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open.

Lot-native Run to Next Event remains a separately ranked future cadence seam. This contract does
not pre-authorize it.

## 24. Closure record requirement

If V1 passes Keep:

- create dedicated evidence and closure documents;
- update `CURRENT-BEST.md`, `NEXT-HIGHEST-LEVERAGE.md`, `PROGRESS.md`, `MARATHON-LOG.md`,
  `docs/HANDOFF.md`, and canonical Lessons Learned;
- record exact contract, implementation, maintenance, evidence, test, browser, structural, asset,
  protected-ref, and publication boundaries;
- preserve every D-17B residual exactly; and
- promote the next world-first priority only after a fresh several-minutes-on-Lot audit.

If V1 fails Keep, record the Kill result and restore only the prior accepted world behavior. Do not
weaken identity, world, semantic, performance, or simulation-authority gates to force closure.
