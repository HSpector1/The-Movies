# LANE 11 — EVENT-MODEL DOCKET

**Persisted ledger vs transient emission — one model, decided.**

> C2 advance planning, 2026-08-18. Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> Planning only. Every claim below is tagged `[CODE]` (verified at this tree),
> `[DOC]` (governing document in this tree), `[CORPUS]` (read-only evidence corpus),
> or `[PROPOSAL]` (this lane's design work, not observation).
>
> Routed here by PF1 charter §10.1 per the shared brief
> (`docs/c2-planning/00-C2-PLANNING-BRIEF.md:58-68`): *"the event-model docket (engine
> emits no events today — UI diffs state; C2 decides ONE model: persisted ledger vs
> transient emission)"*. `[DOC]`

---

## 0. Verdict up front

**RECOMMENDATION: Option A — a persisted, engine-appended event ledger at a new V14
root — with a hard "witness, never input" law, a two-tier retention policy, and a
session-local consumption cursor.** `[PROPOSAL]`

The decisive findings, in order of weight:

1. **The repo already runs three persisted, engine-appended event ledgers.** `ledger`
   (financial), `careerEvents` (append-only, stable `eventId`), `broadcastItems`
   (aired-only, tick-stamped). Option A is the *fourth instance of a proven house
   pattern*, not new architecture. `[CODE]` §1.2
2. **Option B degenerates into Option A's data structure without its durability.**
   `advanceToNextEvent` runs up to 520 synchronous ticks
   (`ui/src/engine/adapter.ts:2247`). Any "transient emission" model must accumulate
   every tick's events into an in-memory array to hand back one result — i.e. an
   unpersisted ledger — and then throws it away on reload. `[CODE]` §4.3
3. **Blast radius is inverted from the intuition.** Option A is additive (one root, the
   twelve-times-walked save path). Option B changes the signatures of `tick()` and
   `applyActions()`, which appear 358 and 688 times respectively across `src/`, `ui/`,
   `tests/`. `[CODE]` §5.6
4. **The byte-parity gate survives Option A and is *strengthened* by it** — provided
   the charter pins "only `src/core` may append, and no acknowledgement/consumption
   field ever enters the schema." §5.3
5. **PF1's exact-once law is better served, not threatened.** Today exact-once is
   twenty `setLotCadenceFeedback(null)` call sites plus a state-sniffing suppression
   heuristic (`ui/src/App.tsx:725-732`). A monotonic sequence number replaces all of it
   with one rule. `[CODE]` §1.6, §6.3

The single real cost is **save size**, which is why retention is a first-class part of
the recommendation and not an afterthought (§6.4).

---

## 1. INVENTORY — the current observation machinery, precisely

### 1.1 The engine emits nothing. Confirmed.

Both engine entry points return a bare successor state:

- `export function tick(state: GameState, options?: TickOptions): GameState`
  — `src/core/tick.ts:147` `[CODE]`
- `export function applyActions(state: GameState, actions: Action[]): GameState`
  — `src/core/actions.ts:1982` `[CODE]`

There is no event channel, no emitter, no callback, no returned delta. Every
"something happened" fact consumed anywhere in the product is reconstructed **after the
fact by comparing two `GameState` objects.**

One correction to the brief's shorthand, and it is load-bearing: the layer that does
the diffing is **not** `src/core`. It is `ui/src/engine/adapter.ts`, which its own
header calls *"the ONE boundary crossing … the ONLY module in the UI that imports the
simulation core"* (`ui/src/engine/adapter.ts:1-5`) `[CODE]`. So the diff-detection is
already **centralised at a boundary layer** — it is not scattered folklore. The C2
question is therefore narrower and more tractable than "the UI guesses": it is
*"should that boundary layer's derived knowledge move into the engine and become
durable?"*

### 1.2 What IS already persisted: three engine-appended ledgers

This is the most important inventory finding and it reframes the whole docket.

| Root | Type | Appended by | Retention | Stamped | Dedupe identity |
|---|---|---|---|---|---|
| `ledger: LedgerEntry[]` | `src/core/types.ts:406-450` | `tick` (`src/core/tick.ts:637,647`), `applyActions` | **unbounded** | `week` | correlation via `productionId` / `constructionProjectId` |
| `careerEvents: TalentCareerEvent[]` | `src/core/types.ts:483-485`, `1230-1258` | `tick` (`src/core/tick.ts:628-629`) | **unbounded** | `releaseWeek` | `eventId` = `` `${filmId}:${talentId}` `` |
| `broadcastItems: BroadcastItem[]` | `src/core/types.ts:459`, `1424-1431` | `tick` (`src/core/tick.ts:500-506`) | **unbounded** (aired items only) | `tick` | `subjectId` + `tick` |

`[CODE]` for every cell.

Three details matter for C2:

- **The dedupe pattern already exists and is documented as such.**
  `src/core/types.ts:1217`: *"eventId is stable so a reload/re-render cannot duplicate
  it."* `[CODE]` That sentence is, verbatim, the exact-once problem this docket is
  asked to solve — already solved once, by identity rather than by bookkeeping.
- **The "witness, never input" discipline already exists.**
  `src/core/studioRunRecap.ts:9`: *"The sim never reads this."* `[CODE]`
  With one deliberate exception (below), `careerEvents` is read only by the recap
  aggregator (`src/core/studioRunRecap.ts:727-729`).
- **The one exception is identity reservation, and it is a law.**
  `src/core/productionIdentity.ts:8-38` walks `activeProductions`, `releasedFilms`,
  `theatricalRuns`, `ledger`, **`careerEvents`**, `broadcastItems`, `coverageContexts`,
  `operations.workflows`, `scriptDevelopment.projects` to compute
  `persistedProductionIds`. `[CODE]` This implements operational law 20: *"New IDs
  reserve against the longest-lived identity authority (productions, ledger, careers,
  tasks, reservations, canceled traces)."* (`docs/SHIFT-OPERATIONAL-LAWS.md:46-48`)
  `[DOC]`

  **Consequence for C2, non-optional:** any new persisted event root that carries a
  production id MUST be added to `persistedProductionIds`, or it becomes a silent
  identity-collision hole. This is a concrete migration line item (§7, §8).

- **A bounded-window constant already exists as precedent.** `BROADCAST_WINDOW: 6`
  (`src/core/tuning.ts:45`), used as a relevance window in
  `src/core/broadcast.ts:191-197,245`. `[CODE]` It is a *relevance* window, not
  compaction — `broadcastItems` itself is never pruned — but it establishes the
  house shape for "a named tuning constant governs how far back a surface looks."

### 1.3 `SimResult` / `SimStopReason` — the transient event carrier that exists today

`ui/src/engine/adapter.ts:2213-2223` `[CODE]`:

```
export type SimStopReason =
  | 'release' | 'scriptReview' | 'castingReview' | 'productionDecision'
  | 'constructionCompleted' | 'runCompleted' | 'contractExpired'
  | 'renewalWindow' | 'cashNegative' | 'limit'
```

`SimResult` (`ui/src/engine/adapter.ts:2224-2246`) carries: `preTick`, `next`,
`released[]`, `completedRuns[]`, `fromWeek`/`toWeek`/`weeks`, `stopReason`, three
decision payloads, `constructionCompletion`, `stopMessage`, `guardHit`, `summary`.
`[CODE]`

Two comments in that type are the current, informal event-model law:

- `:2241-2242` — *"the engine-derived stop explanation the UI must display verbatim.
  React must NOT infer the reason from current state (a completed run leaves no
  active-run trace to read after the fact)."* `[CODE]`
  → **This is already an admission that state-diffing is insufficient.** The reason a
  run ended cannot be recovered from the post-state at all; it exists only because a
  string was manufactured at the moment of transition and handed forward.
- `:2236-2240` — *"If Annex completion shares a tick with a release, decision, run
  ending, cash crossing, or contract boundary, that primary event keeps its established
  priority while the completion is still carried to the first post-tick player surface
  **exactly once**."* `[CODE]`
  → This is PF1's exact-once obligation, written down in C1 code, for exactly one
  co-event. C2 adds at least six more concurrent event families (§2); the single-slot
  `constructionCompletion: ... | null` field does not generalise.

The stop reason is chosen by a **first-wins priority ladder inside a 520-iteration
diff loop** (`ui/src/engine/adapter.ts:2349-2442`, cap at `:2247`). `[CODE]` Note what
that means: when a Sim-to-Next-Event call crosses 15 weeks, **fourteen weeks of
transitions are silently discarded** and only the stopping week's single reason
survives. Everything that happened in between is visible only as an aggregate
`PeriodSummary`.

### 1.4 The diff-detector register — complete, at this tree

PF1 recon said they exist. They do. Here is the full set, classified.

**Tier 1 — true before/after state diffs (the machinery a ledger would replace):**

| # | Detector | Location | Infers |
|---|---|---|---|
| D1 | `constructionCompletionsBetween(before, after)` | `ui/src/engine/adapter.ts:2070-2114` | placement `underConstruction` → `operational`, per placement id |
| D2 | `constructionCompletionBetween` | `:2116-2133` | collapses D1's ordered list to ONE receipt + a "N further builds also completed" sentence |
| D3 | release detection | `:2351`, `:2365-2372` | `after.studio.releasedFilms.slice(beforeReleases)` — array-length diff |
| D4 | run-end detection | `:2354-2355`, `:2404-2415` | runs active before ∧ not active after (status change **or** removal) |
| D5 | cash-crossing detection | `:2416-2421` | `after.cash < 0 && before.cash >= 0` |
| D6 | contract-expiry detection | `:2422-2427` | `after.contracts.length < beforeContracts` |
| D7 | renewal-window detection | `:2428-2433` | count of `renewalWindowOpen` rose |
| D8 | `acceptedGreenlightFormationReceipt(before, after)` | `ui/src/lot/snapshot/productionFormation.ts:196-361` | **165 lines** proving one greenlight happened |
| D9 | `linkedScriptProjectId(before, after, productionId)` | `productionFormation.ts:145-189` | which screenplay went `ready`→`inProduction` |
| D10 | `acceptedScreenplayCommissionReceipt(before, after, payload)` | `ui/src/lot/snapshot/scriptCommission.ts:653-744` | one commission's exact footprint |
| D11 | `acceptedLotAuditionPlanningReceipt(before, after, payload)` | `ui/src/lot/snapshot/auditionPlanning.ts:901-990` | one casting session started |
| D12 | `sameStateExceptCastingReviewStatus(before, next, target)` | `ui/src/lot/snapshot/castingReview.ts:788+` | one casting acknowledgement, everything-else-unchanged |
| D13 | `acceptedLotCastingReviewSuccess(...)` | `castingReview.ts:879-...` | the successor after that acknowledgement |
| D14 | `acceptedLotScriptReviewSuccess(...)` | `ui/src/lot/snapshot/scriptReview.ts:649-...` | the successor after a screenplay verdict |
| D15 | `acceptedLotNextEventReceipt(renderedBefore, result)` | `ui/src/lot/snapshot/nextEvent.ts:693-756` | re-validates the whole `SimResult` from scratch |
| D16 | `acceptedLotNextEventConstructionCompletion` | `nextEvent.ts:332-393` | independently re-proves the completion co-event from `preTick`/`next` |
| D17 | `lotNextEventNeutralFeedback` / `acceptedLotNextEventGuardNeutral` | `nextEvent.ts:925-1013` | the reduced arms when D15 fails |

`[CODE]` for all seventeen.

**Tier 2 — pure current-state selectors (NOT diffs; they read one snapshot):**
`sceneryLoadInContext(snapshot)` (`ui/src/lot/snapshot/sceneryLoadIn.ts:26-62`),
`stage7ProductionDetailContext`, `stageAssignment`, `annexWork`, `presenceLines`,
`productionCompany`, `gateHiring`, `firstFilmJourney`. `[CODE]`
These are **not** affected by the docket. They infer *standing* facts, not transitions,
and stay exactly as they are under either option.

**Tier 3 — "receipts" that are actually pure copy functions, not observations:**
`buildReceiptText(quote, blueprintName)` (`ui/src/lot/buildMode.ts:330-332`),
`demolishReceiptText(name, refund)` (`ui/src/lot/facilityMutation.ts:195-199`),
`moveReceiptText(name, parcelLabel)` (`:201-206`). `[CODE]`
These take already-known values and format a sentence. **The brief's phrase
"construction/build/move/demolish receipts" refers to these** — they are not event
provenance and must not be confused with D1/D2. They also stay as they are.

**Evidence that Tier 1 is genuinely fragile, in the code's own words.**
`ui/src/engine/adapter.ts:2047-2069` documents a shipped V12 regression: the completion
detector read a legacy projection, so *"a facility completing anywhere else left
`status` at `vacant` on both sides of the tick and reported NOTHING: `advanceWeek`
returned a null completion and, worse, `advanceToNextEvent` ran straight THROUGH the
completion week — the accepted V11 `constructionCompleted` stop had **silently stopped
existing** for every non-legacy placement."* `[CODE]`

That is the canonical failure mode of the diff model: **when the engine widens what it
can do, a detector that was reading the wrong projection fails silently and reports
nothing.** No test caught it; a PM playtest did. C2 widens the engine enormously (Sets,
Stages, queues, wrap, premiere). The same failure will recur, and it will recur in the
system whose whole point is "the player must know what is waiting and why."

### 1.5 Action receipts and the App-side cross-check

The App does not trust a screen's receipt. On greenlight it independently recomputes
one and compares:

```
appReceipt = acceptedGreenlightFormationReceipt(current, next)   // ui/src/App.tsx:2210, 2279
… sameGreenlightFormationReceipt(appReceipt, assemblyReceipt)     // :2219, :2288
```

`[CODE]` So the same 165-line forensic diff runs **twice per greenlight** (once in the
workspace, once in App), purely to establish a fact the engine knew for certain at the
moment it created the production.

`ui/src/App.tsx:2270-2273` is honest about why: *"A receipt problem demotes presentation
only; the already Engine-accepted successor keeps the existing generic return."* `[CODE]`
That is a correct and well-built failure mode — and it is also a permanent, structural
acceptance that **the presentation layer can fail to know what the engine just did.**

### 1.6 How exact-once is implemented today — and where it breaks

- The carrier is one React state slot:
  `const [lotCadenceFeedback, setLotCadenceFeedback] = useState<LotCadenceFeedback | null>(null)`
  — `ui/src/App.tsx:1039`, commented at `:1036-1038` as *"One mutually-exclusive Lot
  cadence channel. Week and next-event feedback are **UI-session only**."* `[CODE]`
- Exact-once is enforced by **manual clearing at 20 call sites**:
  `ui/src/App.tsx:1092, 1116, 1560, 1566, 1572, 1611, 1620, 1625, 1862, 1981, 2122,
  2251, 2296, 2382, 2397, 2500, 2526, 2622, 2797` (+ the declaration at `1039`).
  `[CODE]`
- The Annex completion's exact-once is enforced by a **state-sniffing proxy**:
  ```
  function operationalAnnexAnnouncementAlreadyOwned(state: GameState): boolean {
    try { return studioDevelopment(state).status === 'operational' } catch { return false }
  }                                             // ui/src/App.tsx:725-732
  ```
  used at `ui/src/App.tsx:2717`. `[CODE]` This asks the *state* whether the player has
  probably already been told — it does not know. It is a heuristic standing in for a
  consumed flag, and it is the honest best available under a transient model.
- **Nothing survives a reload.** `saveActiveSession(state)` writes
  `exportSaveJson(state)` and nothing else (`ui/src/engine/session.ts:35-43`) `[CODE]`.
  A reload, an HMR cycle, or a dev-server restart discards every pending receipt and
  every cadence beat. `ui/src/engine/session.ts:1-5` explicitly frames this module as
  the recovery of *state*, not of presentation.

**The break, stated plainly:** exact-once today means *at-most-once, in one browser
session, if nothing reloads.* That is adequate for C1's single co-event. It is not
adequate for a premiere night, a wrap beat, or a paced simulation-theater sequence.

---

## 2. C2's CONSUMER LIST — history, or only the live transition?

For each consumer routed to C2, the question is: *does it need the durable record, or
only the fact that a transition just occurred?* "History" here means **the consumer is
wrong or unavailable if the fact does not survive a reload.**

| # | Consumer | Needs | Why | Today's mechanism |
|---|---|---|---|---|
| C1 | **The wrap beat** (shooting → post) | **HISTORY** | The transition releases a soundstage + a Set and acquires post capacity. The player must be able to ask later "when did *Nightfall* wrap, and what did that free?" A run's end already proves the point: `adapter.ts:2242` — a completed transition "leaves no … trace to read after the fact." | **Does not exist.** `enterPhase` (`src/core/operations.ts:556-600`) silently swaps reservations at `remainingTicks` 4→3 (`operations.ts:56-77`). No stop reason, no receipt, no detector. `[CODE]` |
| C2 | **Reservation grants** | **HISTORY** | Owner law 5: "Engine state owns reservations and outcomes." A grant is the causal answer to "why is this stage occupied?" and to queue fairness disputes. | Silent inside `enterPhase` / `addManagedProductionWorkflow` (`operations.ts:188-222, 556-600`). `[CODE]` |
| C3 | **Reservation releases** | **HISTORY** | The release is what relieves a bottleneck. Owner law 8: "wrap releases resources." Also the only evidence for "your Stage 3 was idle six weeks." | Silent — `removeManagedProductionWorkflow` filters the workflow out (`operations.ts:225-233`) and its reservations vanish with it. `[CODE]` |
| C4 | **Queue admissions** | **HISTORY** | Owner law 2: "The player must know what is waiting, what it needs, what occupies it." Admission order is a fairness contract; a player who is told "you're third" must be able to verify they were not overtaken. | **No queue exists.** Only a per-workflow `blocker` field (`src/core/types.ts:562-572`). `presence.ts:26-33` records this as a *known truth gap*: a `facility-capacity` blocker "names NO specific full facility … That is the honest queue truth available today." `[CODE]` |
| C5 | **Queue promotions** | **HISTORY** | Same as C4, plus: a promotion is precisely the moment a bottleneck relieved. Losing it loses the teaching moment. | Does not exist. `[CODE]` |
| C6 | **Scenery arrival** | **LIVE transition** (+ optional history) | Today it is a *standing* condition, read from current state, and that is sufficient for the affordance. History is nice-to-have for "why was this shoot late." | `sceneryLoadInContext(snapshot)` (`ui/src/lot/snapshot/sceneryLoadIn.ts:26-62`) — a Tier-2 state selector, correctly. `[CODE]` |
| C7 | **Rehearsal start** | **LIVE transition** | Phase entry is recoverable from `workflow.phase` + `remainingTicks`. Only the *moment* is lost. | Derivable from state; no event. `[CODE]` |
| C8 | **Shooting start** | **LIVE transition** | Already stops the sim as `productionDecision` (`adapter.ts:2393-2399`) because it needs a command. | `SimStopReason='productionDecision'`. `[CODE]` |
| C9 | **Premiere night** | **HISTORY — hard requirement** | It is a ceremony. If a reload eats it, the player permanently loses a headline moment of the campaign. Precedent: `LESSONS-LEARNED.md:2394-2404` (CV) ruled that the **Clipping/Chronicle rebuild from persisted authority while the Autopsy is session-only** — a premiere is Chronicle-class, not Autopsy-class. | **Does not exist** — no `premiere` anywhere in `src/core` or `ui/src` outside decorative banner art (`ui/src/lot/scene/assets.ts:990`, `layout.ts:259-264`). `[CODE]` |
| C10 | **Simulation theater pacing** | **HISTORY — hard requirement** | See §5.5. A paced replay of a week (or of a 15-week skip) must be *resumable*, *pausable*, and *reload-survivable*, and it must never present a synchronous batch as witnessed time (law 3, `SHIFT-OPERATIONAL-LAWS.md:10`). A cursor over durable rows gives all three; a function return gives none. | Does not exist. `[CODE]` |
| C11 | **PF1 cue grammar** | **LIVE transition, exactly once** | PF1 §10.1 per the brief: cues fire off `SimStopReason`. A cue must not re-fire on reload. | `SimStopReason` + `lotCadenceFeedback` + 20 manual clears (§1.6). `[CODE]` |
| C12 | **Construction completion** (C1 legacy, must keep working) | **LIVE transition, exactly once** + weak history | Already carried "exactly once" (`adapter.ts:2236-2240`). Its history is separately recoverable from `placement.facilities[].completesWeek`. | D1/D2/D16. `[CODE]` |

**Tally: 6 of 12 consumers need history; 5 need only the live transition; 1 (C12) is
already both.** The six that need history are precisely C2's headline systems — wrap,
reservations, queues, premiere, theater. That distribution is the answer to the docket:
a model that only supports the live transition fails the majority of C2's own consumer
list.

**Corpus check on the original's model.** `[CORPUS]` The Movies (2005) ran *both*
channels and drew the same line:
- Transient/ambient: *"**PA system announcements** and colored information 'pips' (green
  = positive change, red = negative) provide ambient, passive notification of
  rating-relevant status changes without the player needing to open a panel."*
  — Bible §8.4 (`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:1165`, [OFFICIAL: manual
  pp.8-9]).
- Standing state on a persistent HUD: *"**Movie card status bar/icon** on the persistent
  HUD shows pipeline stage (script → ready-for-casting → ready-to-shoot → filming →
  ready-for-release → released/earning)"* — same section, `:1161` [OFFICIAL: manual
  pp.6-7].
- Durable history: the awards-requirements screen tracked cumulative counters
  ("Movies released above a 4-star quality rating: 10"), and per-Star/per-movie award
  history was *"retained and queryable long-term"* — Bible §8.4 `:1166` and §10.18
  `:1409-1411` [DIRECTLY OBSERVED IN GAMEPLAY: `Screenshot 2026-08-17 at 11.38.09 AM.png`].

The original's durable layer was **aggregate counters**, not a raw event log — a
retention data point, not a schema one. It is evidence that the durable tier can be
small (§6.4), and it is explicitly *evidence, not spec* (master plan §11 per the brief).

---

## 3. OPTION A — persisted event ledger inside `GameState` `[PROPOSAL]`

### 3.1 Shape

A new V14 root, following the twelve-times-walked pattern
(`src/core/types.ts:451-1212` shows V2→V13; `GameState = GameStateV13` at `:1212`) `[CODE]`:

```
export type GameStateV14 = GameStateV13 & {
  studioEvents: StudioEventLog
}

export type StudioEventLog = {
  nextSeq: number            // monotonic allocator; never reused, never reset
  events: StudioEvent[]      // ascending seq; append-only within a retention window
}

export type StudioEvent = {
  seq: number                // total order across the whole run
  week: number               // the tick the fact became true (pre-increment, per tick.ts:114/437)
  kind: StudioEventKind      // closed union
  subjectId: string          // the one entity the event is ABOUT
  facts: StudioEventFacts    // discriminated on `kind`; primitives + ids only
}
```

`StudioEventKind` for C2 `[PROPOSAL]`, sized to the §2 consumer list:
`'reservationGranted' | 'reservationReleased' | 'queueAdmitted' | 'queuePromoted' |
'queueWithdrawn' | 'phaseEntered' | 'wrapped' | 'sceneryArrived' | 'premiere' |
'constructionCompleted' | 'setBuilt' | 'setRetired'`.

Hard schema rules `[PROPOSAL]`:
- `facts` carries **ids and primitives only** — never a nested entity snapshot, never
  a rendered sentence, never money. (Money already has an authority: `ledger`.)
- **No `consumed`, `seen`, `acknowledged`, or `dismissed` field. Ever.** That is the
  byte-parity tripwire (§5.3).
- No `timestamp` — only `week`. Law CM: *"state transition time is proved by its
  immutable event record"* / anti-pattern *"treating one editable timestamp as
  causality"* (`docs/LESSONS-LEARNED.md:2265-2276`) `[DOC]`.

### 3.2 Determinism

The log is **derived state**: a pure function of `(seed, action sequence, tick count)`,
exactly as `careerEvents` and `broadcastItems` are today. It consumes zero RNG (nothing
about it is sampled). Replay from the same seed and actions reproduces it row-for-row
and byte-for-byte, which is what §15.7 already asserts for the whole save
(`tests/acceptance-corpus.test.ts:15-17`: *"replay WITH broadcast: full-year exportSave
byte-identical"*) `[CODE]`. Law 23 (`SHIFT-OPERATIONAL-LAWS.md:54-56`) `[DOC]` is
satisfied by construction, and the log *adds* a much sharper replay assertion than
exists today: any divergence surfaces as a differing event row instead of as a differing
aggregate number twenty weeks later.

### 3.3 Retention / compaction `[PROPOSAL]`

Two tiers, because the consumer list has two shapes:

- **Tier D (durable, permanent, small).** `premiere`, `wrapped`, `constructionCompleted`,
  `setBuilt`, `setRetired`. Chronicle-class facts. Never compacted. Estimated
  ≲ 6 rows per film + ~1 per build.
- **Tier W (windowed, bounded).** `reservationGranted/Released`, `queue*`,
  `phaseEntered`, `sceneryArrived`. Operational transitions. Retained for
  `STUDIO_EVENT_WINDOW_WEEKS` (a named TUNING constant, following `BROADCAST_WINDOW`
  at `src/core/tuning.ts:45` `[CODE]`); rows older than `market.tick −
  STUDIO_EVENT_WINDOW_WEEKS` are dropped by `tick` in one deterministic pass.

Compaction is a pure function of `market.tick`, so a save exported at week 100 and a
replay arriving at week 100 hold **identical** windows. `nextSeq` is never rewound, so
dropped rows never have their ids reused (law 20).

**Named cost, stated honestly:** Tier-W compaction is *lossy*. Once a window closes,
"why was Stage 3 idle in week 12" is unanswerable at week 60 — unless it also produced a
Tier-D row. The charter must therefore choose the window with the *debugging* horizon in
mind, not only the presentation horizon. A candidate starting value is 26 weeks (half a
studio year), but it is a tuning question and this lane does not pretend to settle it.

### 3.4 Replay / save-size

Save-size arithmetic `[PROPOSAL]` — **estimate, not measurement** (see §9, gap G3):

- A `StudioEvent` row stringifies at roughly 120-200 bytes under `stableStringify`
  (`src/core/save.ts:290-296`).
- A mature C2 studio running ~4 concurrent productions plausibly generates ~8-12 Tier-W
  rows/week and ~1.5 Tier-D rows/week.
- **Unbounded** (no retention): 208 weeks × ~11 rows × ~160 B ≈ **370 KB**;
  520 weeks (the `SIM_CAP` horizon, `adapter.ts:2247`) ≈ **920 KB**.
- **With a 26-week Tier-W window:** Tier-W stays flat at ≈ 46 KB; Tier-D grows at
  ≈ 240 B/week → 208 weeks ≈ **96 KB total**, 520 weeks ≈ **245 KB total**.

Context: the active session is autosaved into `localStorage`
(`ui/src/engine/session.ts:19,35-43`) `[CODE]`, whose per-origin quota is
conventionally ~5 MB, and the save *already* carries three unbounded ledgers (§1.2).
**Retention is not optional.** Unbounded is survivable at 208 weeks and reckless at 520.

### 3.5 The Chronicle / clippings precedent — read carefully, it cuts both ways

- `buildFilmChronicle(input)` (`src/core/newspaper.ts:253`, types at `:69-149`) is a
  **pure derivation over already-persisted state** — it is not a stored artifact.
  `[CODE]`
- The governing ruling is CV (`docs/LESSONS-LEARNED.md:2394-2404`) `[DOC]`:
  *"Chronicle and Clipping rebuild from persisted authority; Autopsy is enabled only
  while its exact pre-release snapshot survives. … **Pattern: one label, one evidence
  basis, one destination.**"*
- And CU (`:2384-2392`) `[DOC]`: *"**Pattern: immutable event witness + exact
  cross-domain ID + honest absence.** Anti-pattern: reconstructing a past creative
  decision from current state or visual similarity."*

**What this precedent actually says:** the house has already ruled that durable
player-visible history must rebuild from **persisted authority** and must be reached by
an **immutable event witness**, never reconstructed from current state. Today's Tier-1
diff-detectors are exactly the anti-pattern CU names — they reconstruct a past decision
from a pair of current states. The Chronicle survives only because release outcomes were
*already* frozen into `releasedFilms` / `careerEvents` / `ledger`. **C2's wrap,
reservation, queue and premiere facts have no such frozen home.** Option A gives them
one; Option B does not.

The counter-reading is also real and must be recorded: CV equally establishes that
**session-only is a legitimate, shipped product decision** for the Autopsy, and that the
right response to "this evidence basis is gone" is *honest unavailability*, not
manufacturing durability. That is the strongest thing that can be said for Option B, and
it is said properly in §4.

---

## 4. OPTION B — transient authoritative emission `[PROPOSAL]`

### 4.1 Shape

`tick` and `applyActions` return `{ state, events }` (or accept an out-parameter /
collector). Nothing is stored. The adapter accumulates events across a Sim call and
hands them to React; React consumes them once and drops them.

```
export function tick(state: GameState, options?: TickOptions): TickOutcome
export type TickOutcome = { state: GameState; events: readonly StudioEvent[] }
```

### 4.2 What it gets right

- **Determinism is trivial and unarguable.** Events are a pure function of inputs and
  touch no persisted byte. Law 23 satisfied with zero analysis.
- **Zero save cost.** No V14, no validator, no migration, no positive-projection
  builder, no historical-boundary guard, no save-size growth. The entire
  `src/core/save.ts` (5,266 lines, 12 `convertVnToVn+1` + 10 `migrateToVn` +
  13 `validateSaveVn`) `[CODE]` is untouched.
- **Byte-parity is unconditional.** Presentation on/off cannot differ because there is
  nothing to differ in.
- **It matches C1's shipped grammar exactly.** `SimResult` already *is* this model,
  and it works. PF1's cue grammar is built on it.
- **It matches the original's ambient channel.** `[CORPUS]` PA announcements and pips
  were transient (Bible §8.4 `:1165`).
- **It has an honest fallback story.** CV (`LESSONS-LEARNED.md:2394-2404`) `[DOC]`
  legitimises "this is session-only; when the session ends the surface says so."

### 4.3 What it gets wrong — and this is decisive

1. **It cannot survive its own primary caller.** `advanceToNextEvent` loops up to
   `SIM_CAP = 520` ticks synchronously (`ui/src/engine/adapter.ts:2247-2249, 2349`)
   `[CODE]`. Emitting per-tick means the adapter must concatenate up to 520 ticks × N
   events into one in-memory array. **That array is a ledger.** Option B therefore does
   not avoid the data structure; it avoids only its durability — and then hands the
   result to a React state slot that a reload erases.
2. **Signature blast radius.** `tick(` appears **358** times and `applyActions(`
   appears **688** times across `src/`, `ui/`, `tests/` (99 distinct files call `tick`)
   `[CODE]`. Changing either return type is the single largest mechanical change
   available in this repo. The mitigation — a parallel `tickWithEvents` — creates two
   tick paths, which is the exact "second authority" shape operational law 22 forbids
   for capacity (`SHIFT-OPERATIONAL-LAWS.md:51-53`) `[DOC]` and which law 1
   (`:6-7`) `[DOC]` forbids in spirit.
3. **It cannot serve 6 of 12 C2 consumers** (§2): wrap, reservation grants, reservation
   releases, queue admissions, queue promotions, premiere. Each becomes "we told you
   once, in that session; if you reloaded, that fact never happened."
4. **Simulation theater becomes unimplementable as specified.** See §5.5.
5. **Exact-once stays a bookkeeping problem, and it scales badly.** Twenty
   `setLotCadenceFeedback(null)` sites today for *one* co-event channel
   (`ui/src/App.tsx`, §1.6) `[CODE]`. C2 adds at least six concurrent event families;
   the mutually-exclusive single-slot channel (`nextEvent.ts:91-98`) has to become a
   queue, at which point it is — again — an unpersisted ledger.
6. **Owner law 8 is at risk.** *"Visible activity must correspond to authoritative
   work … No decorative screensaver population"* (brief `:39-43`) `[DOC]`. If the
   authoritative record of a wrap exists only in a discarded function return, the wrap
   animation that plays after a reload is, by definition, not corresponding to a record
   of authoritative work. It is animation with nothing behind it.

---

## 5. JUDGMENT against the six required criteria

### 5.1 Determinism (law 23)

**Tie.** `SHIFT-OPERATIONAL-LAWS.md:54-56` `[DOC]` requires: zero `Math.random`,
fixed-order iteration, derived RNG streams keyed by domain, **presentation consumes zero
RNG**, byte-identical state/save after rejection/repaint.

- Option A: the log is derived state, appended only by `src/core`, consuming no RNG.
  Deterministic by construction — and it makes replay divergence *easier to localise*
  (a differing row names the week and the subject).
- Option B: deterministic trivially.

The only determinism risk in A is a schema mistake — a wall-clock timestamp, an
insertion-order-dependent id, or a presentation-supplied field. All three are
foreclosed by the schema rules in §3.1 and pinned in §8.

### 5.2 Save compatibility / migration cost

**Option B wins on cost. Option A wins on precedent.**

Option A's bill, itemised against the observed V13 pattern `[CODE]`:
- `SaveFileV14` type (`src/core/save.ts:267-273` shows the V13 shape to copy),
  extend the `SaveFile` union (`:275-288`)
- `validateSaveV14` (compare `validateSaveV13` at `:3648`)
- `convertV13ToV14` (compare `convertV12ToV13` at `:5076`)
- `migrateToV14` (compare `migrateToV13` at `:5263`)
- freeze `GameStateV13` as V13's anchor (the pattern is stated at
  `src/core/types.ts:463-465, 479-482, 493-495`)
- historical-boundary guard copied **verbatim**, per operational law 19
  (`SHIFT-OPERATIONAL-LAWS.md:43-45`) `[DOC]`, citing `save.ts:351-378` and
  `save.ts:4240-4253`
- positive-projection builders updated (law 18, `:42-43`) — enumerate owned roots, never
  clone-then-delete
- **add the new root to `persistedProductionIds`** (`src/core/productionIdentity.ts:8-38`)
  or leak identity (law 20)
- one new save suite, sized like `tests/placement-save-v12.test.ts` /
  `tests/construction-save-v11.test.ts`

This is real work — roughly one milestone-week of a C2 campaign — and it is **entirely
routine**. The repo has executed it twelve times without a single migration regression
reaching a seal.

### 5.3 The byte-parity gate (PF1 §2 proof obligation) — analysed carefully

The obligation as the brief states it: **presentation on/off, saves must be
byte-identical.** `[DOC]` (`00-C2-PLANNING-BRIEF.md:56-60` establishes PF1 as ui-only
with `src/core` untouched; the §2 proof obligation itself is quoted in the lane brief.)

The formal argument:

```
save            = makeSave(GameState)                        [src/core/save.ts:3735-3960]
GameState_{n+1} = tick(GameState_n, opts)                    [src/core/tick.ts:147]
                | applyActions(GameState_n, actions)         [src/core/actions.ts:1982]
```

`[CODE]` Therefore `save` is a function of `(seed, action sequence, tick count)` alone.

- **A ledger appended only by `src/core` is inside that closure.** Toggling presentation
  changes neither the action sequence nor the tick count, so the ledger — and hence the
  save — is byte-identical. **Byte-parity holds.** ✔
- **A ledger any presentation code can append to is outside that closure.** Byte-parity
  breaks immediately, and so does operational law 1 (*"Engine owns law; the world emits
  intent and renders fresh truth"*, `SHIFT-OPERATIONAL-LAWS.md:6-7`) `[DOC]`. ✘

So the architect's framing is confirmed **and it has a second, sharper edge that must be
pinned or the gate fails subtly:**

> **A field is presentation-written even if the engine writes it, whenever its value
> depends on what the player looked at.**

Concretely: a `consumed: boolean`, `seenAtWeek`, or `dismissed` field on an event row is
written by the engine only in the trivial sense that an action carries it in. Its
*value* is a function of the player's viewing history, which presentation-off does not
have. **Any such field breaks byte-parity.** This is why §3.1 forbids them absolutely,
and why the consumption cursor lives outside `GameState` (§6.3).

**Second byte-parity surface, distinct and equally binding — the M0A acceptance corpus.**
Every prior root was gated so the headless corpus stays byte-identical:
`src/core/tick.ts:461` (*"No sim stream. Empty (and no ledger entries) when not engaged →
byte-identical"*), `:635`, `:647`, `:663`; `src/core/tuning.ts:393, 406`. `[CODE]` And
`tests/acceptance-corpus.test.ts:15-17` asserts *"full-year `exportSave`
byte-identical"* `[CODE]`.

**Pin:** the C2 event log must be **empty on the M0A / headless / legacy path**. The
natural gate already exists — `operations.mode === 'legacy'` for headless
(`emptyStudioOperations()` at `src/core/operations.ts:44-46`) `[CODE]` — so every C2
event kind, all of which are managed-operations facts, is naturally absent. `[PROPOSAL]`
But `phaseEntered`/`wrapped` could be tempted to record legacy productions too
(`advanceManagedProductions` has a legacy branch at `operations.ts:614-622`). **That
temptation must be refused explicitly in the charter**, or the corpus re-baselines and
the M0A gate stops meaning what it means.

### 5.4 Replay / debugging value

**Option A wins decisively, and this is the criterion the code complains about loudest.**

- `adapter.ts:2242` `[CODE]`: *"a completed run leaves no active-run trace to read after
  the fact."* Today the *only* reason the UI can name it is a string built at the
  moment. Under A, the reason is a row.
- `adapter.ts:2047-2069` `[CODE]`: a detector reading the wrong projection made an
  entire stop reason *silently stop existing* across V12. Under A, the engine writes the
  row at the site of the transition; there is no projection to read wrong.
- C2's headline acceptance (master plan §8.2, `THE-MOVIES-PARITY-MASTER-PLAN.md:352-358`)
  `[DOC]` includes *"two productions contend for one desirable set."* Debugging a
  contention bug without a durable admission/grant order means re-running from seed and
  hoping the repro is deterministic in the same window. With a ledger, the save **is**
  the repro.
- Sim-to-Next-Event currently discards every non-stopping week's transitions
  (§1.3). Under A they are all on the record, which is what makes a 15-week skip
  explainable to the player at all.

### 5.5 Theater pacing needs — the second decisive criterion

Owner law 8 (brief `:39-43`) `[DOC]`: *"Visible activity must correspond to
authoritative work: people travel because work exists; scenery arrives because a
production needs it; stages become occupied because filming occurs; queues are
physically meaningful; wrap releases resources."*

Operational law 3 (`SHIFT-OPERATIONAL-LAWS.md:10`) `[DOC]`: *"**Never present a
synchronous Engine batch as witnessed time.**"*
Operational law 2 (`:8-9`) `[DOC]`: *"Animation may acknowledge a command, never
complete one."*

These two laws together define the theater problem exactly. The engine resolves a week
(or 15 weeks) synchronously and instantaneously. The theater must then *narrate* that
resolution over wall-clock seconds, without the narration being mistaken for the
simulation. That requires a **script to narrate from**, ordered, addressable, and
resumable.

- Under **A**, the theater is a *reader with a cursor over durable rows* — architecturally
  identical to `studioPresence(state)` (`src/core/presence.ts:1-19`: *"PURE, SAVE-NEUTRAL
  projection … changes zero outcomes and persists nothing … alters no tick step and is
  called by none"*) `[CODE]`. Pause, resume, rewind, and reload-mid-sequence all work,
  because the script outlives the render. This is a *proven* shape in this codebase.
- Under **B**, the script exists only inside one function return. A reload mid-sequence
  loses the remaining beats permanently; a pause that outlives an HMR loses them; and the
  Living Turn hypothesis (brief `:44-46`, Owner's preferred model to investigate first)
  `[DOC]` — which by its nature stretches one authoritative resolution across many
  wall-clock seconds — has the largest possible window in which to lose them.

**Note for the Time Model docket (Lane on time):** this lane's finding is that
**Living Turn raises the cost of Option B specifically**, because the gap between
"engine resolved it" and "player has witnessed it" is longest under Living Turn. The two
dockets are coupled; the event-model choice should not be re-opened by the time-model
ruling, but the time-model ruling should know that A is robust to all three time models
and B is progressively worse from (A) discrete → (C) continuous → (B) Living Turn.

### 5.6 Blast radius on the 3,318-test floor

Measured at this tree: **251 test files** (106 in `tests/`, the remainder under `ui/`)
`[CODE]`.

**Option A — additive, bounded:**
- Files touching the diff-detectors that would migrate: **26**, of which 12 are tests
  (`ui/src/App.tsx`, `ui/src/screens/Assembly.tsx`, `ui/src/lot/StudioLotScreen.tsx`,
  `ui/src/engine/adapter.ts`, the six `ui/src/lot/snapshot/*.ts` detectors, and their
  suites). `[CODE]`
- New save suite (~1 file, sized like `tests/placement-save-v12.test.ts`).
- Existing byte-identity assertions see one new field that is **empty on the M0A path**
  (§5.3) — so `tests/acceptance-corpus.test.ts` should be unaffected if the gate is
  right, which is itself the test that the gate is right.
- **Zero signature changes.** No test that calls `tick()` or `applyActions()` changes.

**Option B — mechanical, unbounded:**
- `tick(` : **358** occurrences. `applyActions(` : **688** occurrences. `[CODE]`
- Every one is a potential edit unless a parallel API is introduced, and a parallel API
  is itself a governance violation (§4.3 item 2).

**This is the single most counter-intuitive finding in the lane and it should be stated
to the Owner in exactly these terms: the "cheap, no-migration" option is the one that
touches a thousand call sites, and the "expensive, needs-a-V14" option touches none of
them.**

### 5.7 Scorecard

| Criterion | Option A (persisted ledger) | Option B (transient emission) |
|---|---|---|
| Determinism (law 23) | ✔ derived state, zero RNG | ✔ trivially |
| Save compat / migration cost | ✘ one V14 root, ~1 milestone-week, 12× precedent | ✔ zero |
| Byte-parity gate (PF1 §2) | ✔ **iff** engine-only append + no consumption field + M0A-empty | ✔ unconditional |
| Replay / debugging | ✔✔ the save is the repro | ✘ nothing survives the call |
| Theater pacing | ✔✔ cursor over durable rows; survives reload/pause | ✘ script dies with the function return |
| Blast radius (251 test files) | ✔ 26 files, additive, no signature change | ✘✘ 1,046 call sites |
| Serves §2 consumer list | ✔ 12/12 | ✘ 5/12 (+1 partial) |
| Save size | ✘ needs retention policy (§3.3, §3.4) | ✔ zero |
| Exact-once at C2 scale | ✔ seq + cursor, one rule | ✘ manual bookkeeping × 6 families |

---

## 6. RECOMMENDATION `[PROPOSAL]`

### 6.1 The ruling

**Adopt Option A. One model: a persisted, engine-appended `studioEvents` log at the V14
root, which is the sole authority for "what happened."**

To be unambiguous about "ONE model": the return-path receipts are **not** a second
event model under this recommendation. `SimResult`/`LotNextEventReceipt` are demoted to
a **derived projection of the log delta produced by that call** — a convenience view,
computed from `events` with `seq > seqBefore`, carrying no fact the log does not carry.
There remains exactly one place a fact is born and exactly one place it lives.

This preserves PF1's live-arrival shape (a cue still receives its event on the call that
produced it, synchronously, in the same object it does today) while making the same fact
durable. **PF1's cue grammar does not have to change to keep working.**

### 6.2 Why not the honest alternative

Option B is a defensible engineering position and CV (`LESSONS-LEARNED.md:2394-2404`)
`[DOC]` gives it real cover. It loses on two things that are not engineering
preferences but Owner law:

- Law 8 (visible activity must correspond to authoritative work) cannot hold when the
  authoritative record of a wrap is a discarded local variable.
- Law 2 (queue, don't magically forbid; "the player must know what is waiting … and how
  to relieve the bottleneck") cannot hold when the admission order that produced the
  wait is unrecorded.

And it loses on one thing that is arithmetic: 1,046 call sites versus 26 files.

### 6.3 Exact-once, restated as a law that survives reload

**Replace "consume exactly once" with "consume idempotently, above a cursor."**
`[PROPOSAL]`

- Every event has a total-order `seq`.
- The presentation layer holds `lastConsumedSeq`, **stored outside `GameState`** — in the
  session store next to (never inside) `ACTIVE_SESSION_KEY`
  (`ui/src/engine/session.ts:19`) `[CODE]`, under its own key.
- Cue rule: fire every event with `seq > lastConsumedSeq`, in `seq` order; then set
  `lastConsumedSeq` to the maximum fired.
- A reload restores the cursor, so nothing re-fires and nothing is lost. A cursor loss
  degrades to *replaying recent beats*, never to *silently swallowing them* — and the
  charter should state which of those two failure directions is preferred (this lane
  recommends replay-on-cursor-loss, because a duplicated cue is a cosmetic annoyance and
  a swallowed premiere is a lost campaign moment).
- This retires all twenty `setLotCadenceFeedback(null)` sites and the
  `operationalAnnexAnnouncementAlreadyOwned` heuristic (`ui/src/App.tsx:725-732`)
  `[CODE]`, replacing them with one comparison.
- Precedent: `TalentCareerEvent.eventId` exists for precisely this reason —
  `src/core/types.ts:1217` `[CODE]`.

**Byte-parity note:** the cursor is presentation state and lives outside `GameState`.
That is not a workaround; it is the correct boundary, and it is what keeps §5.3 true.

### 6.4 Retention ruling

Two tiers as in §3.3. Tier D permanent, Tier W windowed by a named TUNING constant.
Compaction runs inside `tick`, is a pure function of `market.tick`, and never rewinds
`nextSeq`.

### 6.5 Robustness if a PF1 milestone is KILLED

The brief requires this note (`00-C2-PLANNING-BRIEF.md:60-62`) `[DOC]`. If PF1's cue
grammar is killed, Option A is **unaffected**: the log is engine-side and its consumers
(theater, queue board, wrap beat, premiere, Chronicle-class history) do not depend on
audio cues. If PF1's cue grammar ships as planned, it gains reload survivability for
free. **Option A is the choice that is robust in both branches**; Option B's exact-once
design is entangled with PF1's live-session assumption and would need rework in either
direction.

---

## 7. MIGRATION PATH for the existing diff-detectors `[PROPOSAL]`

Sequenced so the 3,318-test floor never goes red, and so no detector is deleted before
its replacement is proven equal.

**Phase 0 — land the root, write nothing.**
V14 root + validator + `convertV13ToV14` + `migrateToV14` + historical-boundary guard
(law 19) + add to `persistedProductionIds` (`src/core/productionIdentity.ts:8-38`).
`studioEvents` is `{ nextSeq: 0, events: [] }` everywhere. M0A corpus byte-identical by
construction (nothing is appended yet) — **this is the checkpoint that proves the gate
before any behavior rides on it.**

**Phase 1 — engine writes, nobody reads.**
`tick`/`applyActions` append rows at the transition sites: `enterPhase`
(`src/core/operations.ts:556-600`), `addManagedProductionWorkflow` (`:188-222`),
`removeManagedProductionWorkflow` (`:225-233`), and the C2-new queue/wrap/premiere
sites. Gated on `operations.mode === 'managed'`. The only new test obligation is
determinism + corpus parity. **Every existing detector still runs, unchanged.**

**Phase 2 — dual-run equality, the safety net.**
For each detector D1-D17, assert in test that the ledger delta and the detector agree,
on the same fixtures the detector's own suite already uses
(`ui/src/lot/snapshot/*.test.ts`, `ui/src/engine/placement-completion-stop.test.ts`,
`ui/src/engine/completion-receipt-copy.test.ts`). This is where a divergence — of the
kind `adapter.ts:2047-2069` describes — gets caught by a test instead of a playtest.

**Phase 3 — flip the source, keep the shape.**
Rewrite each detector as a *projection of the log delta*, preserving its exported
signature and return shape byte-for-byte, so consumers do not move:

| Detector | Becomes |
|---|---|
| D1/D2 `constructionCompletion*Between` | filter `kind==='constructionCompleted'` in the delta; the multi-completion collapse rule (`adapter.ts:2123-2132`) moves to a presentation helper, unchanged |
| D3 release | `kind==='premiere'`/release row (release already has `releasedFilms`; keep both, assert equal) |
| D4 run-end | a `runCompleted` row (this is the case `adapter.ts:2242` says is unreadable from state — the biggest single win) |
| D5/D6/D7 cash / contract / renewal | rows; these are cheap and remove three subtle count-diffs |
| D8/D9 formation receipt (165 lines) | read `productionId`, `directorId`, `leadId`, `greenlightWeek`, `scriptProjectId` off one row. **Net deletion of ~200 lines of forensic diffing, ×2 because App re-runs it (`ui/src/App.tsx:2210, 2279`).** |
| D10/D11 commission / audition receipts | one row each |
| D12/D13/D14 review-success proofs | one row each |
| D15/D16/D17 next-event receipts | projections of the delta for the call |

**Phase 4 — retire the diffs.** Delete only after Phase 2's equality assertions have
been green across a full seal cycle. Tier-2 selectors (§1.4) and Tier-3 copy functions
(§1.4) are **never touched** at any phase.

**Phase 5 — the new C2 consumers** (queue board, wrap beat, premiere night, simulation
theater) are built as log readers from day one and never grow a diff-detector.

---

## 8. WHAT THE CHARTER MUST PIN `[PROPOSAL]`

Non-negotiable, in charter language:

**Schema**
1. One root: `studioEvents: { nextSeq: number; events: StudioEvent[] }` at V14.
2. `StudioEvent = { seq, week, kind, subjectId, facts }`. `kind` is a **closed union**;
   `facts` is discriminated on `kind` and holds **ids and primitives only**.
3. **Forbidden fields, absolutely:** wall-clock timestamps; rendered sentences; money
   amounts (the `ledger` owns money); entity snapshots; and **any** `consumed` / `seen`
   / `acknowledged` / `dismissed` field.
4. `week` is the pre-increment tick, matching the existing ledger/`releaseTick`
   convention (`ui/src/engine/adapter.ts:2444-2445` cites `tick.ts:114/437`) `[CODE]`.

**Who may append**
5. **Only `src/core`.** No adapter, no React, no Phaser scene, no test helper. This is
   the byte-parity gate (§5.3) and operational law 1.
6. Rows are appended at the transition site, inside the same pure function that makes
   the transition true — never reconstructed afterwards by a diff.
7. `nextSeq` is monotonic, never reused, never rewound — including across compaction
   (law 20, `SHIFT-OPERATIONAL-LAWS.md:46-48`).

**Retention**
8. Tier D (permanent): `premiere`, `wrapped`, `constructionCompleted`, `setBuilt`,
   `setRetired`.
9. Tier W (windowed): everything else, retained `STUDIO_EVENT_WINDOW_WEEKS`, a named
   `TUNING` constant. Compaction is a pure function of `market.tick`, runs in `tick`,
   and is asserted byte-identical under replay.
10. The charter must **name the initial window value** and state the debugging horizon
    it is chosen against, not only the presentation horizon.

**Determinism / parity**
11. The log is **empty on the M0A / headless / legacy path**, gated on
    `operations.mode === 'managed'`. Legacy productions produce **no** `phaseEntered` /
    `wrapped` rows. `tests/acceptance-corpus.test.ts` must stay green **unmodified**.
12. Replay assertion: same seed + same actions ⇒ row-for-row identical log, asserted
    alongside the existing §15.7 `exportSave` byte-identity.
13. Presentation-on/off byte-parity is asserted directly as a test, not argued.

**Consumption**
14. Exact-once is **idempotent-above-a-cursor** (§6.3). `lastConsumedSeq` lives in the
    session store, **never in `GameState`**.
15. On cursor loss the system **replays** recent beats rather than swallowing them, and
    the charter says so explicitly.

**Authority**
16. **The log is a witness, never an input.** No sim step, no action-legality check, no
    read model, and no invariant may branch on its contents — with the single, explicit
    exception of `persistedProductionIds` identity reservation
    (`src/core/productionIdentity.ts:8-38`), which the charter must both permit and
    require. Precedent: `src/core/studioRunRecap.ts:9` *"The sim never reads this."*
17. Capacity and occupancy remain **one union** computed from reservations
    (law 22, `SHIFT-OPERATIONAL-LAWS.md:51-53`). The log records that a reservation was
    granted; it is never consulted to decide whether one may be.

---

## 9. RISKS, GAPS, AND CONTRADICTIONS

**R1 — The log becoming a second authority. HIGH, and it is the failure mode that would
justify killing this recommendation.** A persisted event log is a standing temptation to
answer "is the stage free?" by scanning events instead of reservations. That would
violate law 22 and reintroduce exactly the dual-authority bug class C1 spent milestones
eliminating. Mitigation: charter pin 16-17, plus an invariant test that no
`src/core` module other than `productionIdentity.ts` reads `state.studioEvents`.

**R2 — Save size. MEDIUM.** Quantified in §3.4 as an estimate. Unbounded at 520 weeks
is ~920 KB *on top of* three already-unbounded ledgers, inside a ~5 MB `localStorage`
budget (`ui/src/engine/session.ts:19,35-43`) `[CODE]`. Retention (§3.3) reduces it to
~245 KB. **This is the one criterion on which Option A is genuinely worse and the
mitigation is genuinely lossy.**

**R3 — Lossy compaction erases debugging history. MEDIUM.** Tier-W compaction means a
week-12 contention question is unanswerable at week 60. Accepted deliberately; the
charter must set the window with eyes open (pin 10).

**R4 — Migration regression. LOW-MEDIUM.** Twelve prior migrations, zero seal-reaching
regressions, and law 19 requires copying the boundary guard *verbatim*. But V14 is the
first migration performed under C2's much larger surface, and Phase 0 (§7) exists
specifically so the migration lands with nothing riding on it.

**R5 — Coupling to the Time Model docket. MEDIUM.** §5.5 shows Option B degrades under
Living Turn. This lane's ruling should be treated as **robust to all three time models**;
if the time docket rules for Living Turn, that *strengthens* A rather than reopening the
question. Flagged so the architect does not sequence them as independent.

---

### GAPS (things this lane could not verify and did not guess)

**G1 — The PF1 charter is not readable from this worktree.** `docs/` at
`c2-sets-throughput-plan` (base `f294077`, pre-PF1) contains no
`*PROFESSIONAL*`/`*FLOOR*` document, and the hard rule forbids touching
`/Users/bruce/The Movies - Professional Floor`. **Every claim in this report about PF1
§2 (byte-parity), §9/§10 (routing), and §10.1 (this docket) is therefore sourced to the
shared brief (`00-C2-PLANNING-BRIEF.md:56-68`), not to the charter itself.** The
architect must confirm §5.3's reading of the byte-parity obligation against the charter
text before freezing pins 5, 11, 13.

**G2 — PF1's cue grammar shape is unverified.** §6.1 asserts that demoting receipts to
log projections keeps the cue grammar working *because the delivered object shape is
unchanged*. That is verified against C1's `SimResult`/`LotNextEventReceipt`
(`ui/src/engine/adapter.ts:2224-2246`, `ui/src/lot/snapshot/nextEvent.ts:70-81`) `[CODE]`
but **not** against PF1's actual consumer code, which does not exist at this tree.
Re-verify at PF1 seal.

**G3 — No save-size measurement exists.** §3.4 is structural arithmetic, not
observation; a repo-wide search for save-size/quota instrumentation found none
(only texture-byte budgets in `docs/HOLLYWOOD-DYNAMIC-PEOPLE-ROLE-ATLAS-V1-*`). `[CODE]`
**Recommend the architect commission a one-off measurement of `exportSaveJson` length at
weeks 52 / 208 / 520 on the current build before fixing `STUDIO_EVENT_WINDOW_WEEKS`.**

**G4 — Event volume per week is an estimate.** The 8-12 Tier-W rows/week figure in §3.4
is derived from the phase machinery (`src/core/operations.ts:56-77` gives 6 phases over
8 ticks) `[CODE]` extrapolated to ~4 concurrent productions. C2's actual concurrency
ceiling is exactly what C2 is deciding, so this figure will move.

**G5 — Wrap semantics are undefined, not merely unimplemented.** Today `shooting`
occupies `remainingTicks` 5 and 4 and `postProduction` occupies 3 and 2
(`src/core/operations.ts:64-70`) `[CODE]`. Whether "wrap" is the 4→3 boundary, or a
distinct authoritative act the player performs, is a C2 design decision this lane cannot
make. The event kind `'wrapped'` is proposed on the assumption it is a *transition*; if
C2 makes wrap a *player command*, the row is still correct but the queue/reservation
release timing changes.

---

### CONTRADICTIONS FOUND (reported, not resolved)

**X1 — "The engine emits no events" is true of `src/core` and false of the adapter.**
The brief and PF1 §10.1 say the engine emits no events and the UI diffs state. Verified
for `src/core` (`tick.ts:147`, `actions.ts:1982`) `[CODE]`. But
`ui/src/engine/adapter.ts:2241-2243` says the opposite of the UI: *"the **engine-derived**
stop explanation the UI must display verbatim. **React must NOT infer the reason from
current state.**"* `[CODE]` So there is already a layer that behaves as an emitter and is
already forbidden from being second-guessed — it just lives in `ui/` and forgets
everything on reload. **This is a naming contradiction, not a factual one, but it
matters: the charter should say "`src/core` emits no events" and stop calling the
adapter "the engine," or the pins in §8 will be read as applying to the wrong module.**

**X2 — `SHIFT-OPERATIONAL-LAWS.md` trailer says "Current save = V11"; the code is V13.**
Already flagged by the brief (`00-C2-PLANNING-BRIEF.md:78-79`, noting PF1-M2 corrects
it). Confirmed independently: `SaveFileV13` at `src/core/save.ts:267` and
`GameState = GameStateV13` at `src/core/types.ts:1212` `[CODE]`. **Restating it here
because a V14 charter written against a doc that says V11 will produce a wrong migration
chain.** Whoever writes the C2 charter must read the version chain from
`src/core/types.ts:451-1212`, not from the laws doc.

**X3 — Operational law 15 says "receipts explain, never veto"; the code lets a receipt
demote presentation.** `SHIFT-OPERATIONAL-LAWS.md:35-36` `[DOC]` vs
`ui/src/App.tsx:2270-2273` `[CODE]` (*"A receipt problem demotes presentation only"*).
These are **compatible** — demoting a ceremony is not vetoing an engine action — but the
wording is close enough that a C2 implementer could read "receipt failure changes what
the player sees" as a veto. Under the recommendation this softens considerably (the row
either exists or does not; there is no "receipt failed to prove itself" state), which is
a secondary benefit worth naming in the charter.

**X4 — CV's session-only ruling and this recommendation point opposite ways for one
case.** `LESSONS-LEARNED.md:2394-2404` `[DOC]` ruled the Autopsy session-only on
principle. A naive reading extends that to "cadence feedback is session-only, therefore
transient emission." **That reading is wrong and the distinction must be stated
explicitly in the charter or it will be relitigated:** the Autopsy is session-only
because its evidence basis (a pre-release *snapshot*) is genuinely unreproducible, not
because transience is preferred. Wrap, reservations, queues and premiere have a
reproducible evidence basis — they are Chronicle-class, and CU
(`LESSONS-LEARNED.md:2384-2392`) `[DOC]` requires Chronicle-class facts to rest on an
*immutable event witness*. **The two lessons agree with each other; they disagree with
the naive extension.**

---

*End of Lane 11 report.*
