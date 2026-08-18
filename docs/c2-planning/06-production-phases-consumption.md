# Lane 6 — Production Phases & Resource Consumption

> C2 advance planning, 2026-08-18. Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> **Planning evidence only.** Nothing outside this file was created or modified.
>
> Claim tags: **[CODE]** observed in this worktree's source at the cited `file:line`;
> **[CORPUS]** the read-only evidence corpus at `/Users/bruce/Desktop/Big Swing Art`;
> **[DOC]** a governing document in this repo or the shared brief; **[PROPOSAL]** my
> recommendation, not an observation.

## 0. Verification limits (read this before trusting a number)

**[CODE]** Every code claim below is a *static read* with a `file:line` anchor. I could
**not** execute the test suite: this planning worktree has no `node_modules`, and
`npx vitest run --project core tests/operations.test.ts` fails at config load with
`Cannot find package 'vitest'`. Installing dependencies would write outside my assigned
report file, which the brief forbids (planning-agent rule 1). Where a behavioural claim
is also *asserted by a committed test*, I cite the test line as corroborating evidence —
the assertion text is itself frozen evidence of intended behaviour even unexecuted.

Arithmetic in §4.1 (throughput ceilings) is derived by hand from the phase/capacity
tables, not measured. It is labelled **[PROPOSAL]**-adjacent analysis and should be
re-measured by a harness run before it becomes a charter number.

---

## 1. The production pipeline, traced end to end

### 1.1 The two regimes

**[CODE]** `StudioOperations.mode` is `'legacy' | 'managed'` (`src/core/types.ts:523`,
`src/core/types.ts:581-585`). Legacy mode has no facilities and no workflows
(`src/core/operations.ts:44-46`, invariant at `src/core/operations.ts:345-349`) and
production is a bare countdown: `advanceManagedProductions` decrements
`remainingTicks` and does nothing else (`src/core/operations.ts:615-624`). The M0A
headless corpus and migrated pre-V8 saves live here.

**Everything below describes MANAGED mode**, which is the only regime C2 changes.
Activation is legal only for a founded, economy-engaged studio with an empty slate
(**[DOC]** `docs/PRODUCTION-OPERATIONS-V1-CONTRACT.md:28-31`).

### 1.2 The phase clock

**[CODE]** There is exactly one clock: `Production.remainingTicks`
(`src/core/types.ts:225-239`), initialised to `TUNING.PRODUCTION_TICKS = 8`
(`src/core/tuning.ts:49`, set at `src/core/actions.ts:443`). Phase is a **pure function
of the clock**, not independent state:

```
src/core/operations.ts:56-77   productionPhaseForRemainingTicks(remainingTicks)
  8 → development
  7 → preProduction
  6 → rehearsal
  5,4 → shooting
  3,2 → postProduction
  1 → releaseReady
  anything else → throw
```

`ProductionWorkflow.phase` (`src/core/types.ts:573-579`) is therefore a **denormalised
cache** of `remainingTicks`, and the invariant enforces agreement
(`src/core/operations.ts:458-461`; also re-checked at the save boundary,
`src/core/save.ts:2141-2151`).

> **Structural pin [CODE]:** the phase table exists **twice** — `src/core/operations.ts:56-93`
> and a hand-copied duplicate inside the save validator at `src/core/save.ts:2141-2171`
> (`phaseForRemainingTicks`, `REQUIRED_CAPABILITIES`, `NEXT_PHASE`). Any C2 change to the
> phase set, its durations, or its requirements must land in **both** or saves fail
> validation. This is the single highest-risk mechanical edit in the lane.

### 1.3 Per-phase table — state, termination, consumption (TODAY)

| # | Phase | State representation | Duration / termination | Occupies (engine reservation) | People projected there | Cash consumed this phase |
|---|---|---|---|---|---|---|
| A | **Script development** (`ScriptProject`, pre-production) | `state.scriptDevelopment.projects[]`, `status: 'drafting'`, `reservation: ScriptReservation` (`src/core/types.ts:612-639`) | `dueWeek = commissionedWeek + 1` → 1 week; resolved by `completeDueScriptWork` at tick step 0.5 (`src/core/scriptDevelopment.ts:284`, `:408-453`) | **1 `development-casting` slot** (`src/core/scriptDevelopment.ts:264-274`; refuses if none) | writer (`src/core/presence.ts` engagement `'script'`) | none directly; writer payroll only |
| A′ | **Script review / rewrite** | `status: 'review'` then `'rewriting'` | Review holds **no** reservation (`src/core/scriptDevelopment.ts:449-451`); rewrite re-reserves for 1 week (`src/core/scriptDevelopment.ts:491-507`), max `rewriteCount: 0|1` (`src/core/types.ts:602`) | 1 `development-casting` slot **only while rewriting** | writer | none |
| B | **Casting session** | `state.castingSessions.sessions[]`, `status: 'auditioning'` (`src/core/types.ts:708-722`) | `dueWeek = currentWeek + CASTING_SESSION_WEEKS` = **1 week** (`src/core/tuning.ts:837`, `src/core/castingSessions.ts:311`); resolved at tick step 0.6 (`src/core/tick.ts:187-200`) | **1 `development-casting` slot** (`src/core/castingSessions.ts:301-304`; refuses if none) | the six slate candidates (`src/core/presence.ts:34-37` — no casting staff is modelled) | none |
| C | **Package + greenlight / formation** | `applyGreenlight` → new `Production` + new `ProductionWorkflow` (`src/core/actions.ts:574-612`) | Instantaneous (an action, not a phase) | Creates the **development** reservation immediately (`src/core/operations.ts:188-223`) | — | **the entire film budget, once**: `negative + marketing` (+ freelancer fees when engaged) debited at greenlight (`src/core/actions.ts:495-558`) |
| D | **Development** (`remainingTicks 8`) | `workflow.phase = 'development'` | Exactly 1 advancing tick, but a **first** production skips its greenlight tick (`src/core/tick.ts:202-214`, `src/core/operations.ts:632`), so the slot is held across 3 tick evaluations | **1 `development-casting`** (`src/core/operations.ts:81-83`) | writer + director (`src/core/presence.ts:179-183`) | none |
| E | **Pre-production** (`7`) | `phase = 'preProduction'` | 1 tick | **1 `development-casting`** | writer + director | none |
| F | **Rehearsal** (`6`) | `phase = 'rehearsal'` | 1 tick | **1 `soundstage`** (`src/core/operations.ts:84-85`) | director + lead + antagonist + support (`src/core/presence.ts:184-187`) | none |
| G | **Shooting** (`5`, then `4`) | `phase = 'shooting'` + `ShootingTask` (`src/core/types.ts:553-560`) | 2 ticks, but the **first** shooting week only advances once the take is `scheduled` (`src/core/operations.ts:649-661`) — an unlimited player-gated hold | **the retained `soundstage` + 1 `set-scenery`** (`src/core/operations.ts:86-87`; retention at `:133-143`) | director + 3 cast at the stage; craft at the scenery slot (`src/core/presence.ts:188-192`) | none |
| H | **Post-production** (`3`, then `2`) | `phase = 'postProduction'` | 2 ticks | **1 `post`** (`src/core/operations.ts:88-89`) | director + craft (`src/core/presence.ts:193-196`) | none |
| I | **Release Ready** (`1`) | `phase = 'releaseReady'` | 1 tick | **nothing** (`src/core/operations.ts:90-91`; asserted `reservations === []` at `tests/operations.test.ts:370`) | nobody (`src/core/presence.ts:38-40`) | none |
| J | **Release** (`0`) | Production leaves `activeProductions`; `FilmResult` appended | The tick that decrements 1 → 0 removes the workflow (`src/core/operations.ts:664-667`) and step 2 collects it (`src/core/tick.ts:243-249`) | **nothing** — the `theater` structure provides no facility (`src/core/lot.ts:214-220`) | — | credits revenue |
| K | **Theatrical run** | `TheatricalRun` (`src/core/types.ts:303-316`) | `THEATRICAL_WEEKS = 6` (`src/core/tuning.ts:395`); schedule locked at open (`src/core/economy.ts:28-73`); paid weekly at tick step 3.5 (`src/core/tick.ts:457-480`); `status → 'completed'` at `weekIndex >= totalWeeks` (`src/core/tick.ts:471`) | **nothing** | — | credits `weeklyGross × STUDIO_RENTAL_BLENDED (0.52)` (`src/core/tuning.ts:394`) |
| L | **Archive** | **DOES NOT EXIST** | — | — | — | — |

**[CODE]** Confirming L: a repo-wide grep for `archive`/`Archive` across `src/core`,
`ui/src/lot/snapshot`, and `ui/src/engine` returns **nothing**. `releasedFilms` and
`theatricalRuns` both grow unbounded; a completed run stays in the collection with
`status: 'completed'` forever. There is no retirement, no library, no pruning.
**[CORPUS]** The original *did* have an archive beat — the movie card "archived in the
Production Office once it stops earning" (`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md`
§7.2, line 1063). That is a C2-or-later gap, recorded, not filled.

### 1.4 What weekly money actually depends on

**[CODE]** Phases D–I consume **no cash of their own**. The only weekly debits are
payroll (`src/core/tick.ts:631-641`), studio overhead
`OVERHEAD_BASE 15,000 + OVERHEAD_PER_EMPLOYEE 1,500 × contracts.length`
(`src/core/tick.ts:649-653`, `src/core/tuning.ts:400-401`), and placed-facility opex
(`src/core/tick.ts:656-665`). This is why a capacity hold is expensive: the film's
budget was already sunk at greenlight, and every held week burns payroll + overhead
with no offsetting progress. The UI says exactly this
(`ui/src/engine/adapter.ts:774` → `PRODUCTION_HOLD_CONSEQUENCE`).

**Consequence for C2 [PROPOSAL]:** because production cost is a lump at greenlight,
*there is no per-week production burn to attach a Set rental, stage day-rate, or crew
day-rate to today*. Any C2 model that makes stages/Sets/crew cost money **per shooting
week** is introducing a new cash path, not tuning one. That is a real scope item, not a
constant change.

### 1.5 The shooting command chain (the only place the player is required)

**[CODE]** Entering `shooting` mints one `ShootingTask` with `status: 'unassigned'`
(`src/core/operations.ts:577-588`). The chain is:

1. `assignShootingDirector` → `status: 'blocked'` + `blocker: {kind:'scenery-load-in'}` (`src/core/operations.ts:253-280`)
2. `clearSceneryLoadIn` → `status: 'ready'`, blocker cleared (`src/core/operations.ts:282-304`)
3. `scheduleShootingTake` → `status: 'scheduled'` (`src/core/operations.ts:306-326`)
4. next tick → `status: 'completed'`, `remainingTicks 5 → 4` (`src/core/operations.ts:649-661`)

Until step 3 the production **does not advance at all** — `continue` at
`src/core/operations.ts:653` — while holding both the soundstage and the scenery slot
indefinitely. Corroborated by `tests/operations.test.ts:353-360`.

**This asymmetry is the heart of §2:** entering shooting takes three authoritative player
commands; **leaving shooting takes none.**

### 1.6 The de-facto queue that exists today

**[CODE]** When a phase transition cannot allocate, `enterPhase` writes
`blocker: {kind:'facility-capacity', capability, targetPhase}` and the production keeps
its *current* reservations (`src/core/operations.ts:569-575`) — an atomic hold, retried
every tick. Only three capacity blockers are reachable
(`src/core/operations.ts:531-549`):

| Held at | Waiting for | To enter |
|---|---|---|
| `remainingTicks 7` (preProduction) | `soundstage` | rehearsal |
| `remainingTicks 6` (rehearsal) | `set-scenery` | shooting |
| `remainingTicks 4` (2nd shooting week) | `post` | postProduction |

Note row 3: **a production waiting for post capacity keeps occupying its soundstage and
scenery slot.** That is head-of-line blocking on the studio's scarcest resource.

**[CODE]** The queue has **no object, no priority, no ETA, and no fairness rule beyond
allocation order**. Ordering is ascending `productionId` string compare
(`src/core/operations.ts:629`, `:95-97`), and release happens in the *same* pass, so a
waiter processed before the holder misses the slot the holder frees this very tick and
retries next week. `tests/operations.test.ts:433-538` asserts exactly this: identical
world, holder-first → waiter enters rehearsal immediately; waiter-first → waiter is held
one extra week. **A lower id is a throughput penalty.**

**[CODE]** Facility-capacity blockers deliberately **never** become a decision stop
(`src/core/scriptReadModel.ts:1037-1042`, `ui/src/engine/adapter.ts:2388-2390`) — they
are warnings only. The player is told *"Rehearsal held for Soundstage … It will retry
next week"* (`ui/src/engine/adapter.ts:767-776`) and `presence` shows the company as
`waiting` at the site it still holds with `blockedReason = "awaiting soundstage capacity
to enter rehearsal"` (`src/core/presence.ts:281-283`, `:448-458`).

### 1.7 Where the model *forbids* instead of queueing (owner law 2 violations, today)

**[CODE]** Three entry points hard-refuse rather than queue:

| Refusal | Site | Message |
|---|---|---|
| Greenlight over the artificial cap | `src/core/actions.ts:332-337` | `activeProductions at capacity (n/2)` |
| Greenlight with no dev/casting slot | `src/core/operations.ts:217-221` (throw), pre-flighted at `src/core/scriptReadModel.ts:634-642` | `Development & Casting is full` |
| Commission a screenplay with no slot | `src/core/scriptDevelopment.ts:270-274` | `no Development & Casting slot is available` |
| Start a casting session with no slot | `src/core/castingSessions.ts:302-304` | `start rejected — no Development & Casting slot is available` |

**[DOC]** Owner law 2 (brief lines 24-26): *"When capacity is unavailable: QUEUE, DON'T
MAGICALLY FORBID."* The **in-flight** path already queues (§1.6); the **entry** path does
not. C2's queue work is therefore mostly at the front door, not the middle.

### 1.8 The occupancy union already exists

**[CODE]** `facilityEngagements(state, facilityId)` (`src/core/placement.ts:806-860`) is
the single exported predicate for "who is holding this building", walking five persisted
holders in fixed order: production reservations, the shooting task's denormalised
`soundstageFacilityId`, screenplays, casting sessions, legacy construction. Its header
states the law: *"anything that can hold a facility must be added to both"*
(`src/core/placement.ts:801-804`). This satisfies **[DOC]** operational law 22
(capacity/occupancy is ONE union) and is the correct — and only — extension point for
Sets and stage reservations in C2.

---

## 2. The absent wrap transition — CONFIRMED and characterised

### 2.1 Confirmation

**[CODE]** `SimStopReason` is declared at `ui/src/engine/adapter.ts:2213-2223` with
exactly ten members: `release`, `scriptReview`, `castingReview`, `productionDecision`,
`constructionCompleted`, `runCompleted`, `contractExpired`, `renewalWindow`,
`cashNegative`, `limit`. **There is no `wrap` member.** PF1 charter §4's finding is
verified.

**[CODE]** The stop-detection loop (`ui/src/engine/adapter.ts:2349-2442`) diffs
`releasedFilms.length`, `studioDecision(after)`, active theatrical runs, cash sign,
`contracts.length`, renewal windows, and construction completion. **It never inspects
`workflow.phase`.** A repo-wide grep for `wrap`/`Wrap` in `src/core` and `ui/src`
returns only CSS `flex-wrap`/`overflow-wrap` and a `lot-stage-wrap` div class — zero
domain hits.

### 2.2 What actually moves a production from shooting to post

**[CODE]** One arithmetic decrement inside the weekly loop. In
`advanceManagedProductions`:

```
src/core/operations.ts:663   const nextRemaining = production.remainingTicks - 1   // 4 → 3
src/core/operations.ts:670   const targetPhase = productionPhaseForRemainingTicks(nextRemaining)  // 'postProduction'
src/core/operations.ts:671   if (targetPhase === workflow.phase) { ... }           // false
src/core/operations.ts:676   const result = enterPhase(..., 'postProduction', ...)
```

Inside `enterPhase` (`src/core/operations.ts:556-602`):

* `allocateForPhase` is called for `requirementsForPhase('postProduction') = ['post']`
  (`src/core/operations.ts:88-89`). The soundstage-retention branch
  (`src/core/operations.ts:135-138`) only fires for capability `'soundstage'`, which is
  **not** in the post requirement list — so the soundstage and set-scenery reservations
  are simply **not carried into the replacement workflow** (`src/core/operations.ts:590-596`).
* `shootingTask` is set to `null` because `targetPhase !== 'shooting'`
  (`src/core/operations.ts:577-588`).

**That is the entire wrap.** The stage empties, the crew's scenery slot empties, and the
cast is released from the presence projection (`src/core/presence.ts:193-196` drops the
cast rows), as a *silent side effect of a subtraction*. Nothing is emitted, nothing is
persisted, nothing stops the sim, no ledger row, no broadcast item.

**Corroborating test [CODE]:** `tests/operations.test.ts:363-365` asserts precisely this
transition — `phase === 'postProduction'`, `shootingTask === null`,
`reservations[0].capability === 'post'` — with **no assertion of any event**, because
there is none to assert.

### 2.3 Why this matters more than it looks

1. **Asymmetry.** Three player commands to start shooting (§1.5); zero to finish it.
   The most cinematically loaded moment in a studio game — *"that's a wrap"* — is the
   one moment the engine performs invisibly.
2. **Resource release is invisible.** Owner law 8 (**[DOC]** brief line 42) requires
   *"wrap releases resources"* to be visible. Today the stage frees during a tick the
   player may have skipped past via `advanceToNextEvent`, which will not stop for it.
3. **It can silently fail.** If `post` has no free slot, `enterPhase` returns
   `advanced: false` and writes a capacity blocker (`src/core/operations.ts:569-575`) —
   the film **stays in shooting, still holding the soundstage**. The player sees "Post-
   production held for Post Building" (`ui/src/engine/adapter.ts:772`) but is never told
   *"your stage is still occupied because post is full"*. The two facts are never joined.
4. **Nothing can hang off it.** Wrap is the natural anchor for: releasing cast contracts
   back to the roster, striking a Set, freeing crew, a wrap-party/morale beat, stage
   turnaround/cleanup time, and the Premiere-Night pipeline. None of these can be
   attached to a transition that does not exist as an event.

### 2.4 What an authoritative wrap event requires [PROPOSAL]

Minimum viable, in dependency order:

1. **A named engine transition.** Today the shooting→post move is expressed only as
   *"the phase differs from last tick"*. C2 needs `enterPhase` to return which phase it
   left, or a small `PhaseTransition {productionId, from, to, week, releasedReservations[]}`
   value produced by `advanceManagedProductions` (it already builds the replacement
   workflow and therefore already knows every reservation it dropped —
   `src/core/operations.ts:590-596`).
2. **A decision on the event model.** **[DOC]** The brief (line 63) routes *"the
   event-model docket (engine emits no events today — UI diffs state; C2 decides ONE
   model: persisted ledger vs transient emission)"* to C2. Wrap is the **first concrete
   consumer** of that ruling and should be the worked example that decides it. A
   transient `TickReport` returned alongside the new state is the cheapest option and
   costs no save version; a persisted ledger costs a save bump and an append-only
   invariant, but survives reload and lets Premiere Night and the recap reconstruct.
   *Do not decide this inside Lane 6 — flag it.*
3. **A `SimStopReason` member** (`'wrap'`) plus its priority slot in the stop ladder
   (`ui/src/engine/adapter.ts:2362-2441`). Recommended priority: **below** `release` and
   the three decision stops, **above** `runCompleted`, since wrap has no command
   attached and must never steal a decision's turn.
4. **A cue.** PF1's cue grammar is keyed on `SimStopReason` (**[DOC]** brief lines 56-58),
   so adding a member is the whole integration if PF1's M-milestone ships. **Robustness
   note:** if PF1's audio milestone is KILLED, wrap must still work as a visual/stop
   event — it must not be *defined* in terms of a cue.
5. **A dual-write to `src/core/save.ts`** if wrap changes the phase table (it need not).

**Explicitly out of scope for wrap V1 [PROPOSAL]:** reshoots, partial wrap (some scenes
done), stage turnaround/strike duration, wrap-party morale. Wrap V1 = *the engine says
which stage just emptied, and the world can show it.*

---

## 3. Where REHEARSAL attaches

### 3.1 Rehearsal already exists — and already occupies a soundstage

**[CODE]** This is the single most important finding of this section, and it inverts the
question. `'rehearsal'` is a **first-class, shipped `ProductionPhase`**
(`src/core/types.ts:537-543`), occupying `remainingTicks 6` for exactly one week
(`src/core/operations.ts:62-63`), and **its required capability is already
`['soundstage']`** (`src/core/operations.ts:84-85`).

Full existing support:

| Surface | Evidence |
|---|---|
| Phase enum | `src/core/types.ts:540` |
| Clock mapping | `src/core/operations.ts:62-63` |
| Requirement | `src/core/operations.ts:84-85` |
| Stage retention rehearsal→shooting | `src/core/operations.ts:133-143` (comment: *"Rehearsal → Shooting retains the physical soundstage"*) |
| Reachable blocker | `src/core/operations.ts:534` (`soundstage` for `rehearsal`) |
| Attendance canon | `src/core/presence.ts:124`, `:137-138`, `:184-187` — director + three cast, at the stage |
| Save validator (duplicate) | `src/core/save.ts:2146`, `:2158`, `:2167-2168`, and the phase literal list at `:722` |
| Calendar label | `src/core/studioCalendar.ts:184` (`'Rehearsal'`) |
| Journey copy | `src/core/firstFilmJourney.ts:135` (`'In rehearsal'`), `:144` (`'Rehearsals continue'`) |
| Lot presence line | `ui/src/lot/snapshot/presenceLines.ts:26` (`'Rehearsing'`) |
| Lot snapshot phase | `ui/src/lot/snapshot/StudioLotSnapshot.ts:235`, stage-7 gating at `ui/src/lot/snapshot/stage7Production.ts:111` |
| Contract law | **[DOC]** `docs/PRODUCTION-OPERATIONS-V1-CONTRACT.md:42`, `:67`, `:73` |

**So the pre-shooting seam is not missing. It is already built, already reserves the
stage, and already puts the director and the cast on it.** What rehearsal has **no**
relationship to today is a **Set** — because Sets do not exist in the engine at all.

### 3.2 What the original did — corpus

**[CORPUS]** The corpus distinguishes **two systems that share the word** — and the Bible
warns explicitly against conflating them
(`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` §"Rehearsal vs. practice", lines 1858-1864):

1. **"Rehearsing Script" — a mandatory pipeline stage.** *"an automatic, non-optional
   stage of the production pipeline that every film passes through after casting and
   before shooting"*, with its own progress bar on the movie card and per-star bubbles
   reading *"[Name] – Rehearsing the script"* [DIRECTLY OBSERVED: Screenshots
   11.38.00 AM, 11.40.24 AM] (Bible lines 1858-1864, 506, 900, 1051). The Bible's §7.1
   stage table row (line 1051) states it is *"not separately blockable once casting is
   complete — it is an automatic buffer phase"*, whose delay causes are *"distance
   between Casting Office and the target set"* and *"understaffed Crew/Extras quotas"*,
   and whose exit condition is *"Crew and Extras quotas reach the levels required"*.
   The Bible also records this stage *"does not appear to raise a star's persistent
   genre-experience stat"* — it is a timeline gate, not training (line 1864).
2. **"Rehearse"/practice on a vacant Set — a discretionary action.** *"Even when not
   being used for filming, sets can be used by your Stars to improve their experience in
   the genre associated with the set… drop them on the Rehearse icon on the set"*
   [OFFICIAL manual p.20] (Bible line 1242; also lines 695, 712, 1129, 1459). The set
   record carries a `practice_genre` field
   (**[CORPUS]** `THE-MOVIES-2005-ORIGINAL-DATA/set_catalog.csv`, header column
   `practice_genre`; e.g. row `Sci-Fi: Alien World` → `Sci-Fi`), and Prima names the
   field explicitly (Bible line 756). Directors train the same way and *only* this way
   (Bible line 1459).

**[CORPUS] REHEARSE as a relationship context.** The `socialmod.zip` / `social.ini`
technical artifact exposes the engine's relationship schema as
`3 gender-pairings (MM/FF/MIX) × 9 contexts × 6 fields
(minscenerange,maxscenerange,mineffect,maxeffect,requiredlevel,degrade)`, and the nine
contexts are `LOT, BARNORMAL, BARVIP, CANTEENNORMAL, CANTEENVIP, TRAILER, **REHEARSE**,
**FILM**, **CASTING**`
(`THE-MOVIES-2005-TECHNICAL-ARTIFACTS/social_relationship_schema.csv`, row `TECH-SOC-004`;
`package_register.csv`, row `TECH-PKG-006`). Schema confidence **VERY HIGH**;
vanilla-value confidence **NOT APPLICABLE** (the file's numbers are cheat-modified and
must not be read as balance). The register calls it *"plausibly the actual mechanism
behind… 'actor-director relationship counts double in production quality'"* (Bible line
1703).

> **Scope guard [DOC]:** chemistry/relationships are on the project's explicit *Do not
> build* list (`CLAUDE.md`, §"Do not build": *chemistry*). The REHEARSE context is
> recorded here as **schema evidence that rehearsal is a real place where things happen**
> — not as a licence to build a relationship system in C2. If C2 wants rehearsal to *do*
> anything beyond occupying a stage/Set, that is an Owner decision (§7).

### 3.3 The seam, precisely located

**[CODE]** The pre-shooting seam is the boundary
`preProduction (remainingTicks 7) → rehearsal (6) → shooting (5)`. Concretely:

* the transition into rehearsal is the **first** moment a production touches a physical
  stage (`src/core/operations.ts:84-85`);
* the stage identity chosen there is **retained** into shooting
  (`src/core/operations.ts:133-143`), so whatever Set is bound at rehearsal is
  automatically the Set that gets shot on — the owner law *"Sets physically used for
  rehearsal AND shooting"* has a **ready-made mechanical home**;
* the transition is *not* gated by any player command today (unlike shooting).

### 3.4 Two bounded options

#### Option R1 — **Rehearsal keeps its phase; binding a Set becomes its requirement** (recommended)

**[PROPOSAL]** Do not add a phase. Extend `requirementsForPhase('rehearsal')` from
`['soundstage']` to `['soundstage', 'set']` (or, if a Set is modelled as *occupying* a
stage rather than as a parallel capability, extend the allocator to resolve
*stage + dressed Set* as one composite claim). The retention rule at
`src/core/operations.ts:133-143` is generalised from "retain soundstage" to "retain the
stage **and** the Set" so shooting inherits both.

*Engine cost:*
- `requirementsForPhase` + the duplicate at `src/core/save.ts:2153-2162` — 2 tables.
- `allocateForPhase` retention branch generalised (`src/core/operations.ts:133-143`).
- `ProductionBlocker` gains a `capability` value (or a new kind) so *"held for a Set"* is
  expressible; the reachable-blocker table at `src/core/operations.ts:531-549` gains a row.
- `FacilityCapability` gains a member (`src/core/types.ts:524-528`) → touches
  `CAPABILITY_LABEL` (`src/core/studioCalendar.ts:190-195`), `presence` attendance
  (`src/core/presence.ts:157-200`), the save capability validator
  (`src/core/save.ts:2153-2162`), and `facilityEngagements` (`src/core/placement.ts:806-860`).
- **Save version bump** (V13 → V14) for the Set collection itself.
- **No new phase**, so `productionPhaseForRemainingTicks`, `PRODUCTION_TICKS = 8`, the
  8-week law, every phase label map, every `Record<ProductionPhase, …>` (there are at
  least six: `src/core/studioCalendar.ts:181-188`, `src/core/firstFilmJourney.ts:135`/`:144`,
  `ui/src/lot/snapshot/presenceLines.ts:26`, `ui/src/engine/adapter.ts:615`
  (`PRODUCTION_PHASE_LABEL`), `src/core/presence.ts:202-209`,
  `ui/src/lot/snapshot/productionFormation.ts:27-34`)
  and **the entire release-timing baseline** are untouched.
- **Risk:** if a Set cannot be allocated, rehearsal holds — which is correct queue
  behaviour, but it makes Sets a *hard gate on every film*. Needs a "no Set at all →
  what happens?" ruling (see §7).

#### Option R2 — **Rehearsal becomes an optional player action on a vacant Set** (the original's *practice*)

**[PROPOSAL]** Leave the `rehearsal` **phase** exactly as it is (stage-only), and add a
separate, discretionary action: assign an idle contracted talent to a vacant, built Set
for N weeks; the Set's `practice_genre` raises that person's genre-relevant skill.
**[CORPUS]** This is the original's *"Rehearse icon on the set"* (manual p.20; Bible
lines 1242, 712, 1459) and the *only* documented director-training loop.

*Engine cost:*
- A new persisted collection (`setPractice[]` or similar) with its own reservation on the
  Set, joined into `facilityEngagements` and `busyTalentIds`
  (`src/core/employment.ts:104-121`) so a rehearsing actor cannot also be cast.
- Touches **talent development**, which is a *harness-gated* tick step: default **OFF**
  for the headless M0A corpus (`src/core/tick.ts:20`, `:28-33`, `src/core/development.ts`)
  but **ON in normal play** — the adapter calls `tick(state, { develop: true })`
  (`ui/src/engine/adapter.ts:2137` *"RULING A: development ON in normal play"*, and
  `:2356` in the sim loop). Practice-driven growth would therefore be a **second, out-of-
  band growth source** alongside D-9.8's release-driven growth, which needs its own
  balance ruling. Bigger blast radius than it looks.
- **Save version bump.**
- **Risk:** this is the classic idle-optimisation trap ("park everyone on Sets forever").
  Needs a cost, a cap, or a boredom counter — **[CORPUS]** the original had exactly that:
  a per-set `boredom_factor` field (`set_catalog.csv` column `boredom_factor`;
  `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/set_definition_schema.csv` row `TECH-SET-002`,
  field `boredom`, a real 0–1 engine field). Adding boredom is adding a mood system.

#### Recommendation

**[PROPOSAL] Take R1 for C2. Defer R2 entirely.** R1 delivers the owner law *"Sets…
physically used for rehearsal and shooting"* with zero new phases, zero release-timing
movement, and reuses a retention rule that already exists and is already tested. R2 is a
*talent* feature wearing a *Sets* costume: its real dependency is the development gate
and a boredom/mood model, neither of which is C2 scope. Record R2 as the natural C3+
follow-on that makes owning many Sets pay off between pictures.

---

## 4. Phase-level resource requirements matrix for C2 [PROPOSAL]

### 4.1 First, the arithmetic that should drive the design

**[CODE]** Resource-weeks demanded per film, from §1.3:

| Capability | Phase-weeks per film | Total slots today | Ceiling (films/week) | Buildable today? |
|---|---|---|---|---|
| `development-casting` | 2 (dev + preProd) **+** 1 draft **+** 1 casting session (**+**1 if rewritten) = **4–5** | 2 (`facility-development-casting`, cap 2 — `src/core/operations.ts:22-27`) | **0.40 – 0.50** | **YES** — Annex +1 (`src/core/tuning.ts:598-623`), Hall +2 (`:701-718`) |
| `soundstage` | 3 (rehearsal + 2 shooting) | 2 (`facility-soundstage-07` cap 1, `facility-soundstage-12` cap 1 — `src/core/operations.ts:30-31`) | **0.67** | **NO** |
| `set-scenery` | 2 (shooting) | 2 (`facility-scenery-shop`, cap 2 — `src/core/operations.ts:29`) | **1.00** | **NO** (Craft Annex is `capacity: 0` — `src/core/tuning.ts:728-746`) |
| `post` | 2 (postProduction) | 2 (`facility-post-building`, cap 2 — `src/core/operations.ts:28`) | **1.00** | **NO** |
| — artificial cap — | 8-week pipeline × 2 concurrent | `MAX_CONCURRENT_PRODUCTIONS: 2` (`src/core/tuning.ts:50`) | **0.25** | n/a |

Three conclusions the architect should act on:

1. **[CODE]+analysis] The artificial cap is ~1.6–2.7× tighter than the tightest physical
   constraint.** Deleting `MAX_CONCURRENT_PRODUCTIONS` alone — building nothing — raises
   the ceiling from 0.25 to ~0.40–0.50 films/week. The cap is not merely "transitional",
   it is *currently the only binding constraint*.
2. **[CODE] Soundstage, set-scenery and post capacity are unreachable by any player
   action.** `FACILITY_BLUEPRINTS` (`src/core/tuning.ts:748-754`) contains exactly five
   entries, and **every capacity-providing one is `development-casting`**: Annex
   (`capability: 'development-casting'`, `capacity: 1`), Hall (`…`, `capacity: 2`),
   Development Office II/III (`capacity: 0`), Craft Services Annex
   (`capability: 'set-scenery'`, **`capacity: 0`**). **There is no soundstage blueprint
   and no post blueprint anywhere in the repo.** Owner law 4 ("Stages are player-built
   production capacity") has **zero** implementation today, and so does the Founding Flip
   (owner law 6): a fresh studio with no Stage A/Stage B could never make a film, because
   it could never build one.
3. **The order of C2's work follows from this.** Buildable **Soundstage** is not one C2
   feature among several — it is the *precondition* for both the throughput law and the
   Flip. Buildable **Post** and **Scenery** are second-order (their ceilings are already
   1.0 films/week), and can honestly be deferred.

### 4.2 The proposed matrix

Legend: **REQ** = must be reserved to enter/continue; **OCC** = occupied for the phase's
duration; **—** = no claim. "C2" / "C2b" / "later" is scope.

| Phase | Dev/Casting slot | Stage (soundstage) | Set (dressed, genre-weighted) | Crew | Star/cast time | Post | Cash | Scope |
|---|---|---|---|---|---|---|---|---|
| Script development | REQ+OCC (writer) | — | — | — | — | — | — | today |
| Casting session | REQ+OCC | — | — | — | slate candidates OCC | — | — | today |
| Greenlight | REQ (dev slot) | — | — | — | exclusivity lock (`src/core/actions.ts:408-436`) | — | full budget debited | today |
| Development | OCC | — | — | — | writer+director OCC | — | — | today |
| Pre-production | OCC | **REQ (reserve-ahead)** | **REQ (reserve-ahead)** | — | writer+director OCC | — | — | **C2** |
| **Rehearsal** | — | **REQ+OCC** | **REQ+OCC** (same Set as shooting) | — | director + 3 cast OCC | — | — | **C2** (stage part exists) |
| **Shooting** | — | **REQ+OCC** (retained) | **REQ+OCC** (retained) | **REQ+OCC (crew quota)** | director + 3 cast OCC | — | — | **C2** |
| **Wrap** (new instant) | — | **RELEASE** | **RELEASE** (+ strike/turnaround?) | **RELEASE** | cast released | — | — | **C2** |
| Post-production | — | — | — | — | director + craft OCC | REQ+OCC | — | today |
| Release Ready | — | — | — | — | — | — | — | today |
| **Premiere Night** | — | — | — | — | cast attend? | — | marketing already sunk | **C2** (owner law 7) |
| Theatrical run (6 wks) | — | — | — | — | — | — | credits weekly | today |
| Archive | — | — | — | — | — | — | — | **later** |

Notes on specific cells:

* **Pre-production reserve-ahead [PROPOSAL].** Today the stage is claimed only at the
  *instant* of entering rehearsal, which is why the queue is a same-tick race
  (§1.6). Making pre-production *reserve* the stage/Set for the following week converts
  the race into a **booking**: the player can see "Stage 7 is booked for *The Violet
  Hour* from week 14" instead of discovering a hold after the fact. This is the single
  cheapest change that makes the queue legible per owner law 2. Cost: `requirementsForPhase`
  gains a forward-looking notion, or (cheaper, recommended) a separate
  `reservations[].phase` value of `'rehearsal'` allocated while `phase === 'preProduction'`
  — note the invariant at `src/core/operations.ts:480` currently *requires*
  `reservation.phase === workflow.phase` and would have to be relaxed deliberately.
* **Set genre weighting [CORPUS].** `set_catalog.csv` carries per-set
  `hidden_quality_1_100`, `attractiveness_effect`, `practice_genre`, `unlock_condition`,
  `boredom_factor`; the technical schema confirms the engine fields `quality` (0–1 float,
  `set_definition_schema.csv` row `TECH-SET-003`), `boredom` (`TECH-SET-002`), `dated`
  (`TECH-SET-001`), and **per-genre numeric weights plus a `priority1` genre**
  (`TECH-SET-008`: `genre_action=0.7, priority1=genre_action`) — i.e. the original's sets
  were **weighted across all genres, not bound to one**. **[DOC]** Master plan §11:
  original numeric values are evidence, not spec — the *shape* (per-genre weight vector +
  priority genre + a 0–1 quality) is the recoverable truth.
* **Crew.** See §5.
* **Premiere Night.** **[CODE]** The `theater` structure provides no facility
  (`src/core/lot.ts:214-220`) and `releaseReady` reserves nothing
  (`src/core/operations.ts:90-91`). Premiere Night therefore has **no engine claim to
  attach to today** — it is a pure addition, and Lane 6's only advice is: if Premiere
  Night should *occupy* the Theater, it needs a capability, and if it should not, keep it
  a pure presentation beat over the existing release tick.

### 4.3 Queue semantics per owner law 2 [PROPOSAL]

For every REQ cell above, the answer to "what happens when it is missing" must be one of
exactly three, and **never a refusal**:

| Situation | Rule | Player is told |
|---|---|---|
| Resource exists but is busy | **QUEUE** — production holds its current reservations, blocker names the capability, target phase, **the specific holder**, and **the week it frees** | *"Rehearsal held: Stage 7 is shooting* The Violet Hour *until week 22."* |
| Resource does not exist at all | **QUEUE, with a build remedy** — same hold, but the blocker's remedy names the blueprint | *"No soundstage exists. Build one ($X, N weeks)."* |
| Resource exists, is free, but is unusable (future: disrepair) | out of C2 scope — **do not model** | — |

**[CODE] Three concrete upgrades this needs over today's blocker:**
1. `ProductionBlocker` carries only `{capability, targetPhase}`
   (`src/core/types.ts:562-571`) — it **names no holder**. `src/core/presence.ts:26-33`
   records this as a known truth gap and *deliberately downgraded* the waiting rule
   because of it. C2 should add the holder id + expected free week.
2. Allocation order is bare ascending `productionId` (`src/core/operations.ts:629`), which
   `tests/operations.test.ts:433-538` proves can cost a lower-id film a week. C2 needs an
   explicit fairness rule — recommended: **longest-waiting first**, tie-broken by
   ascending id, with the tie-break preserved for determinism (law 23).
3. The **entry-point refusals** in §1.7 must become queue entries, or the front door will
   keep contradicting the law the middle of the pipeline obeys.

### 4.4 C2 scope vs later

**In C2 [PROPOSAL]:** buildable Soundstage blueprint(s); Sets as a placed, genre-weighted,
reservable resource; Set bound at pre-production and held through rehearsal + shooting;
an authoritative **wrap** that releases stage + Set + crew; a real queue object with
holder + ETA; deletion of `MAX_CONCURRENT_PRODUCTIONS`; a minimal crew capacity (§5);
Premiere Night V1; simulation theater keyed to the above.

**C2b / later [PROPOSAL]:** buildable Post and Scenery capacity (their ceilings are not
binding); Set disrepair/decay and repair crews; Set novelty decay across films; stage
turnaround/strike duration; travel-distance soft delays; reshoots; optional-vs-mandatory
post-production; genre practice on vacant Sets (§3.4 R2); archive.

**Never (per `CLAUDE.md` "Do not build"):** chemistry, production incidents, contract
negotiation, rival studios, awards, scene composition, screenplay generation.

---

## 5. Freelancers and crew

### 5.1 How crew is modelled today — [CODE]

There is **no crew**. There is a **craft discipline** and a **single named Production/Craft
Lead per film**:

* `CreativeRole = 'writer' | 'director' | 'actor' | 'craft'` (`src/core/types.ts:18`);
  `Discipline` mirrors it (`src/core/types.ts:45`).
* `Production.craftIds: string[]` (`src/core/types.ts:232`), and when the economy is
  engaged the greenlight **requires exactly one**:
  *"a film requires exactly one Production/Craft Lead (got n) (D-11.13)"*
  (`src/core/actions.ts:500-505`).
* The founding draft offers `HIRING_DRAFT_CRAFT: 3` candidates and requires
  `HIRING_MIN_CRAFT: 1` (`src/core/tuning.ts:347`, `:351`).
* A craft lead is a full `Talent`: salary, skills, fame, potential, work ethic — priced by
  the same `salaryCurve` as a star (`src/core/employment.ts:184-207`).
* Engagement is **all-or-nothing per person**: contracted (payroll,
  `src/core/employment.ts:140-146`) or an available freelancer paid a one-film fee
  `round(salaryCurve × FREELANCER_FEE_PREMIUM 1.5 × craftAnnexMultiplier)`
  (`src/core/employment.ts:244-248`, `src/core/tuning.ts:375`).
* Exclusivity is **binary and per-person**: `busyTalentIds` (`src/core/employment.ts:104-121`)
  and the greenlight exclusivity check (`src/core/actions.ts:408-436`) forbid any id
  already engaged in an active production or an active screenplay task.
* The craft lead's only *physical* claim is the `set-scenery` reservation during shooting,
  and even that is a **presence canon**, not a rule:
  `src/core/presence.ts:140-145` states craft is projected there *"rather than leaving an
  owned slot unattended"* — the engine never checks that a craft person is available for
  a shooting week.

**So: crew is not a countable capacity today. It is one named individual, bound at
greenlight, with no per-week availability semantics at all.**

### 5.2 What the original did — [CORPUS]

* **A dedicated facility with a headcount.** Crew Facility, **$4,000**, 1920 (Bible lines
  611, 1591); its `.ini` declares `subfacilities/crew/staff: crew=30`
  (`THE-MOVIES-2005-TECHNICAL-ARTIFACTS/facility_candidates.csv`, row `TECH-FAC-016`).
  The same pattern governs Script Office (`writer=15`), Stage School (`wannabe=30`) and
  Staff Office (`staff=40`) — **buildings hold a headcount of staff** (rows `TECH-FAC-009`,
  `TECH-FAC-027`, `TECH-FAC-028`).
* **A per-film quota, auto-filled.** Every production shows `Crew n/m` on its radial;
  observed values 2/2, 2/3, 3/3 (Bible lines 970, 1599; Screenshots 11.37.40, 11.38.00,
  11.40.24). The in-game tutorial states *"Available Crew will fill any required Crew
  positions, so you don't need to assign them"* (Bible line 1599).
* **A flat, tiny salary.** $1,000/yr — the same flat rate as Builders, Janitors,
  Scientists (Bible lines 1552-1558, Prima-sourced).
* **Not individually managed.** *"a lot less demanding"* than stars; no mood/stress system
  (manual p.18, Bible line 1593). Not trainable: *"You can't train your crew so they have
  to be crew in movies before their experience rises"* (Bible line 1597).
* **A shared pool that bottlenecks under concurrency.** *"running several productions
  simultaneously… causes the studio to 'start to run into difficulties' because
  Builders/Janitors/Crew/Extras are drawn from 'the same, limited pool'"*
  (Bible line 1603).
* **Swapping crew mid-shoot does not restart the shoot** (Bible line 1605), unlike
  swapping the director or lead actor, which is stated to restart it (Bible line 1474).

**[CORPUS]** *Also:* the original had **no separate "Soundstage" building type distinct
from Sets** — *"each Set in The Movies is its own placeable, fully modeled lot
structure/environment — there is no separate 'Soundstage' building type distinct from
Sets"* (Bible line 691). Flagged loudly in §6 because it collides with owner laws 3+4.

### 5.3 The minimal crew-capacity model [PROPOSAL]

The design goal is precise: **make stages contend without building a staffing sim.**
Crew must be a *number*, not a roster of people.

**Model: "Crew is a pool of anonymous slots, produced by a building, consumed by shooting
weeks."**

1. **Supply.** A buildable **Crew Facility** blueprint contributes `crewCapacity: N`
   (small, e.g. 3). Its capacity is aggregated exactly the way
   `development-casting` capacity already aggregates
   (`src/core/placement.ts:1912-1914` shows the existing per-capability sum). *No named
   crew people are generated.* Weekly opex per the existing
   `weeklyOperatingCost` field (`src/core/tuning.ts:612`), and no payroll — crew cost is
   the facility's opex, which is honest to the corpus's flat $1,000/yr triviality.
2. **Demand.** A production requires **1 crew slot for each week it is in `shooting`**
   (and, if R1's Set binding lands, optionally 1 during rehearsal — recommend **not**,
   to keep it tight). Requirement expressed by adding `'crew'` to
   `requirementsForPhase('shooting')` (`src/core/operations.ts:86-87`) and the save
   duplicate (`src/core/save.ts:2159`).
3. **Contention.** Because crew is required only during shooting, and stages are also
   required only during rehearsal+shooting, the two constraints multiply exactly where
   the player can see them: *"Stage 12 is free but you have no crew"* becomes a
   first-class queue reason. This is the mechanism that makes building a second stage a
   **real decision** rather than an automatic win — which is the whole point of owner
   law 1.
4. **Legibility.** Crew occupancy joins `facilityEngagements`
   (`src/core/placement.ts:806-860`) and the calendar's occupancy view
   (`src/core/studioCalendar.ts:156-179`), so "what is my crew doing" is one query.

**Deliberately excluded [PROPOSAL]:** crew names, crew skill/experience, crew mood, crew
hiring UI, crew contracts, extras, per-crew salary, crew development. The corpus says
crew experience matters to quality (Bible lines 1148, 1597, 1134) — **record that as a C3+
follow-on**, not C2. Adding a quality term would drag reception (`src/core/reception.ts`)
into C2's blast radius for a marginal gain.

**Relationship to the existing craft lead [PROPOSAL]:** keep them. The Production/Craft
Lead stays a **named, cast, quality-affecting individual** (D-11.13, and it already feeds
`FilmParticipants` at `src/core/types.ts:217-222`); the crew pool is **anonymous
throughput capacity**. Two different things, two different words, no overlap. Do **not**
attempt to make `craftIds` a variable-length crew quota — that would break the
exactly-one invariant at `src/core/actions.ts:500-505`, the participants record, and the
autopsy.

**Engine cost of the crew model:** one new `FacilityCapability` member
(`src/core/types.ts:524-528`) + label maps; one requirement-table row in two places; one
blueprint in `FACILITY_BLUEPRINTS` (`src/core/tuning.ts:748-754`); no new persisted
collection; no save-shape change beyond what the placement/blueprint work already needs.
**This is the cheapest real constraint available to C2**, and it should be considered
mandatory if `MAX_CONCURRENT_PRODUCTIONS` is deleted.

---

## 6. Risks, gaps, and contradictions (loud)

**R1 — [CORPUS] vs [DOC] owner laws: the original had no soundstages, only Sets.**
Bible line 691 states flatly there is *"no separate 'Soundstage' building type distinct
from Sets"*; the parity matrix records our engine as *"Production just reserves two fixed
soundstages — the original's genre-linked, decaying, throughput-constraining Sets
mechanic is entirely missing"* (Bible line 82) and marks Sets/locations **MISSING**, with
the ruling to *"build as a genuine content layer on the already-proven placement engine,
rather than permanently folded into two fixed soundstages"* (Bible line 794). Owner laws
3 **and** 4 (brief lines 27-30) name **both** Sets *and* Stages as separate resources.
**These can be reconciled — Stage = the reservable container/capacity, Set = the dressed,
genre-weighted, reservable content placed inside it — but that reconciliation is a
DESIGN DECISION the architect must make explicitly.** It is not implied by either source.
Do not let it be settled by whoever writes the first blueprint.

**R2 — [CODE] There is no build path to any shooting capacity.** `FACILITY_BLUEPRINTS`
(`src/core/tuning.ts:748-754`) has no `soundstage` and no `post` entry, and its only
`set-scenery` entry has `capacity: 0`. Owner law 4 and the Founding Flip (law 6) are
**both** blocked on this. The master plan already scheduled it —
*"`stage-a`/`stage-b` (Stages 7/12) → CONVERT → buildable Soundstage class… Conversion
lands in **Campaign 2**"* (`THE-MOVIES-PARITY-MASTER-PLAN.md:229`) — but nothing exists
yet. **This is C2's critical path, and the Flip cannot ship without it.**

**R3 — [CODE] The phase machine is duplicated.** `src/core/operations.ts:56-93` and
`src/core/save.ts:2141-2171`. Every phase/requirement change is a two-site edit or saves
break. There is no test I can point to that pins them together; if one exists it was not
findable by name. **Recommend C2 add exactly one test asserting the two tables agree**,
before touching either.

**R4 — [CODE] The queue is order-dependent and provably unfair.**
`tests/operations.test.ts:433-538` asserts that the *same* world gives the waiter
immediate entry or a one-week penalty purely based on which production id sorts first.
Under owner law 1 (concurrency from physical capacity) this becomes a *visible*
unfairness the moment there are more than two productions.

**R5 — [CODE] Post-capacity holds keep the stage occupied.** A film at `remainingTicks 4`
blocked on `post` retains its soundstage and scenery reservations
(`src/core/operations.ts:569-575`, blocker table `:536-539`). With buildable post deferred
(§4.4) this is the most likely deadlock-feeling state in a scaled-up studio, and the two
facts (*"post is full"* / *"which is why your stage is still busy"*) are never joined in
any surface.

**R6 — [CODE]+[DOC] The front door forbids where the law says queue.** Four hard
refusals (§1.7) contradict owner law 2. `MAX_CONCURRENT_PRODUCTIONS` is acknowledged as
transitional, but the three **facility-slot** refusals are not — they are current design.

**R7 — [DOC] The event model is undecided and wrap is blocked on it.** The brief routes
the event-model docket to C2 (line 63). Wrap (§2.4) cannot be specified without it. Lane 6
does **not** resolve it.

**R8 — [CODE] No archive, no library.** Released films and completed runs accumulate
without bound (`src/core/tick.ts:351`, `:471`). The corpus records an archive beat (Bible
line 1063). Not a C2 blocker; recorded so it is not "discovered" later.

**R9 — Verification gap.** No test in this lane was executed (§0). Every behavioural claim
is a static read. The throughput arithmetic in §4.1 is hand-derived and **must** be
harness-measured before it becomes a charter number.

**R10 — [CODE] Making Sets a hard requirement of rehearsal makes every film depend on
owning at least one Set.** Under R1 (§3.4), a studio with zero Sets cannot rehearse and
therefore cannot shoot. Combined with the Founding Flip (bare lot), the **first** film
becomes gated on building a Set as well as a Stage. That may be exactly right — it is
also exactly the kind of change that breaks the sealed First Movie Journey specs
(`FIRST-MOVIE-JOURNEY-LOG.md`, and the FMJ survival strategy at master plan §6). **Flagged
as a cross-lane collision with the Founding-Flip lane.**

**R11 — [CORPUS] confidence caveat.** The REHEARSE/FILM/CASTING relationship contexts come
from a **cheat-modified** mod file. `social_relationship_schema.csv` row `TECH-SOC-004`
rates schema confidence VERY HIGH but vanilla-value confidence **NOT APPLICABLE**. Use the
*existence of the context*, never its numbers.

---

## 7. Owner decisions this lane needs

1. **Stage vs Set — what is the unit of shooting capacity?** (R1) Stage = reservable
   container and Set = dressed genre-weighted content placed in it, or Sets are themselves
   the venues and "Soundstage" retires? Everything in §3 and §4 hangs off this.
2. **Is a Set mandatory to shoot?** If yes (R1 recommended), a studio with no Set cannot
   make a film — which changes the Founding Flip's opening act and the FMJ golden path
   (R10). If no, Sets are a quality/variety lever, not a throughput lever, and owner law 3
   is weaker than its wording.
3. **The event model** — persisted ledger vs transient emission (R7). Wrap is the first
   consumer and should be the worked example.
4. **Does wrap need a player command, or is it automatic?** Automatic (with a stop + cue)
   is recommended; a "call the wrap" command would be a fourth shooting-chain step and
   more micromanagement.
5. **Delete `MAX_CONCURRENT_PRODUCTIONS` in C2, or raise it?** Deleting it is the honest
   reading of owner law 1, but §4.1 shows it is *currently the only binding constraint* —
   deleting it without shipping crew capacity (§5.3) hands the player a free ~1.6–2.7×
   throughput increase.
6. **Is rehearsal allowed to be a *decision*, or does it stay automatic?** The corpus says
   the original's Rehearsing Script stage was *"not separately blockable… an automatic
   buffer phase"* (Bible line 1051). Recommend keeping it automatic; making it a decision
   adds a fourth mandatory click per film.
7. **Genre practice on vacant Sets (§3.4 R2) — in or out of C2?** Recommended OUT: its real
   dependency is a second talent-growth source alongside D-9.8, not Sets.
8. **Do stage and Set carry a per-shooting-week cost?** Today production cost is a single
   lump at greenlight (§1.4); a per-week cost is a new cash path, not a constant.
9. **Queue fairness rule** — longest-waiting-first (recommended) vs ascending-id (today,
   provably unfair, R4).

---

*End of Lane 6.*
