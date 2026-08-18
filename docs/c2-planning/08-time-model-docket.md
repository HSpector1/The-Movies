# 08 — TIME MODEL RULING DOCKET (A vs B vs C)

> **Lane 8, C2 advance planning.** Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> This is the written docket the Owner rules on. It is not itself a ruling.
>
> **Tag legend.** `[CODE]` = observed in the sealed C1 tree at this worktree, with
> `file:line`. `[CORPUS]` = read-only evidence corpus at `/Users/bruce/Desktop/Big Swing Art`,
> cited by file + line/section. `[DOC]` = a governing document in this repo (or the shared
> brief), cited by file + line/section. `[PROPOSAL]` = my design invention, which no source
> states and no Owner has ratified. Sections 2 and 3 are dense with `[PROPOSAL]` by
> construction — there is no prior spec for Model B or Model C.

---

## 0. Executive finding, stated before the argument

**The Owner's preferred hypothesis B (Living Turn) is not speculative, and it is not
greenfield. A working, tested, law-compliant instance of it already shipped in C1.** `[CODE]`

`ui/src/lot/tycoon/playback.ts` plays exactly one authoritative week as ~10.35 seconds of
witnessed, skippable presentation time, interpolated over the *engine's own* ten-beat
timeline, settling exactly onto the static truth, consuming zero RNG and advancing nothing
(`ui/src/lot/tycoon/playback.ts:1-35`; `src/core/presence.ts:57-61`). The renderer refuses to
play a batch (`ui/src/lot/tycoon/TycoonScene.ts:2600-2605`), refuses a stale week
(`TycoonScene.ts:3175-3180`), and any pointer / `Esc` / `Space` skips it
(`TycoonScene.ts:3359-3363`, `3425-3438`).

That changes the shape of the docket. The real question in front of the Owner is **not**
"discrete vs. living turn." It is:

> **How much of the studio's manufacturing work joins the ten-beat week that people already
> walk through — and does any of it belong inside `tick()`?**

My recommendation, argued in §5: **ship Model B1-extended in C2** (presentation-time week
playback widened from people-only to the whole manufacturing loop), **explicitly reject
Model C**, and **defer Model B3 (engine-internal beats) behind a bounded, killable spike**
that C2 does not depend on. Evidence supports the Owner's hypothesis. It does not support
the maximal reading of it.

---

## 1. MODEL A — the current discrete model, characterized from code

### 1.1 One clock. It is the week, it is an integer, and it lives in one field.

`[CODE]` `tick(state, options?): GameState` (`src/core/tick.ts:147`) is the single simulation
step. It reads `const currentTick = state.market.tick` (`tick.ts:149`) and, as its **final**
step, returns `market: { ...state.market, tick: currentTick + 1 }` (`tick.ts:703`).

`[DOC]` The canonical statement: "tick = week; `TICKS_PER_YEAR` 52; `PRODUCTION_TICKS` 8;
`MAX_CONCURRENT_PRODUCTIONS` 2; at most one greenlight per tick … `market.tick` increments as
the **final** step of `tick()`" (`docs/HANDOFF.md:1474-1481`).

`[CODE]` The constants: `TICKS_PER_YEAR: 52` (`src/core/tuning.ts:48`), `PRODUCTION_TICKS: 8`
(`tuning.ts:49`), `MAX_CONCURRENT_PRODUCTIONS: 2` (`tuning.ts:50`), `THEATRICAL_WEEKS: 6`
(`tuning.ts:395`). The concurrency ceiling is enforced at `src/core/actions.ts:333`.

`[CODE]` **There is no other clock anywhere below the harness boundary.** A scan of
`src/core/` for `Date.now`, `performance.now`, `requestAnimationFrame`, `setTimeout`,
`setInterval`, `new Date(` returns zero matches; a scan for `Math.random` returns zero
matches. The engine cannot observe wall time even by accident.

### 1.2 The tick pipeline is a fixed, documented, insertion-only order

`[CODE]` `src/core/tick.ts:1-31` states the order as contract: 0.5 SCRIPT DEVELOPMENT →
0.6 CASTING SESSIONS → 1 PRODUCTION → 1.5 CONSTRUCTION COMPLETION → 1.6 PLACEMENT COMPLETION
→ 2 RELEASE → 3 RECEPTION → 4 STANDING → 5 BROADCAST → 5.5 AWARENESS DRIFT → 6 DEVELOPMENT
(gated off by default) → 7 PAYROLL / 7.5 OVERHEAD / 7.6 PLACED-FACILITY OPEX → 8 CONTRACT
EXPIRATION → finalize.

Two properties matter for this docket:

1. **Steps may be inserted, never reordered.** `tick.ts:16-17` records step 5.5 as "inserted,
   not reordered; D-12 §9 permits insertions — docs/D-12-economy-contract.md:129". Steps 1.6
   and 7.6 carry the same note (`tick.ts:9-11`, `tick.ts:21-22`). This is the single most
   important structural fact for C2: **the pipeline has a ratified extension mechanism, and
   it is insertion at a named position — not subdivision of the step.**
2. **Exactly one RNG draw enters the sim stream per tick, and only on a release.**
   `tick.ts:23-25`: "The ONLY randomness consumed FROM THE SIM STREAM (`state.rngState`) is in
   RECEPTION (the single §5.3 critic gaussian per release)." Everything else uses derived
   streams keyed by domain, which never advance `state.rngState` (`tick.ts:30-32`).

`[CODE]` Phase identity is a pure function of the integer countdown:
`productionPhaseForRemainingTicks(remainingTicks)` (`src/core/operations.ts:56-77`) maps
8→development, 7→preProduction, 6→rehearsal, 5|4→shooting, 3|2→postProduction,
1→releaseReady, and **throws outside [1,8]**. There is no sub-week position within a phase,
and no wrap event: shooting becomes post because a counter hit 3.

### 1.3 The batch: `advanceToNextEvent`, and the `SimStopReason` union

`[CODE]` `ui/src/engine/adapter.ts:2250` — `advanceToNextEvent(state): SimResult` loops the
**real** core tick up to `SIM_CAP = 520` times (`adapter.ts:2247`, ~10 years), stopping AFTER
the tick in which a governed event occurs. It never edits the week number.

`[CODE]` `SimStopReason` (`adapter.ts:2213-2223`) is the closed union, in the priority order
the loop applies it:

| # | Reason | Detection (post-tick) |
|---|---|---|
| 1 | `release` | `after.studio.releasedFilms` grew |
| 2 | `scriptReview` | `studioDecision(after).kind` |
| 3 | `castingReview` | `studioDecision(after).kind` |
| 4 | `productionDecision` | `studioDecision(after).kind` |
| 5 | `runCompleted` | active-before run no longer active after |
| 6 | `cashNegative` | crossed `< 0` this tick |
| 7 | `contractExpired` | `contracts.length` shrank |
| 8 | `renewalWindow` | renewal-open count grew |
| 9 | `constructionCompleted` | orthogonal co-event; only stops when alone |
| 10 | `limit` | `SIM_CAP` exhausted (`guardHit: true`, diagnostic) |

`[CODE]` Three pre-loop early returns exist so an *already pending* decision never charges a
hidden week: `scriptReview` (`adapter.ts:2255-2286`), `castingReview` (`2287-2311`),
`productionDecision` (`2312-2340`), each returning `weeks: 0` with a zero-movement summary.

`[CODE]` The result carries `preTick` (state immediately before the **stopping** tick) so a
stop-on-release hands off to the identical autopsy path as a single Advance
(`adapter.ts:2225-2245`), plus `stopMessage`, an engine-derived string built at
`adapter.ts:2477+` and displayed verbatim — because "a completed run leaves no active-run
trace to read after the fact" (`adapter.ts:2473-2475`).

`[CODE]` The single-week arm is `advanceWeek(state)` (`adapter.ts:2135-2147`): one `tick(state,
{develop: true})`, returning `{preTick, next, released, constructionCompletion}`.

### 1.4 `studioCalendar` is a projection, and says so

`[CODE]` `src/core/studioCalendar.ts:1-3`: "One deterministic, read-only projection over
authoritative studio state. **This module creates no schedule, reservation, command, or
second clock.**" It publishes facility slots with occupants (`studioCalendar.ts:33-49`),
committed future events with a `certainty: 'committed'` discriminator (`:51-57`), production
outlook, staffing horizon, and a summary (`:156-179`).

`[CODE]` It is also where the queue-legibility vocabulary already lives:
`CONDITIONAL_RELEASE_ASSUMPTION` (`studioCalendar.ts:206`) and
`PRODUCTION_HOLD_CONSEQUENCE` — "The production countdown will hold while payroll and studio
overhead continue each week" (`studioCalendar.ts:209`). **Owner law 2 ("queue, don't magically
forbid") already has an engine-owned copy surface.** It is the concurrency *cap* at
`actions.ts:333` that forbids magically, not the operations layer.

### 1.5 Operational laws 1–3 are the boundary every model must clear

`[DOC]` `docs/SHIFT-OPERATIONAL-LAWS.md:5-11`:

1. "Engine owns law; the world emits intent and renders fresh truth. Placement, travel,
   queueing, occupancy are projections of GameState."
2. "**Animation may acknowledge a command, never complete one.** No route timer, arrival,
   tween, or update() tick advances tasks/work/queues."
3. "**Never present a synchronous Engine batch as witnessed time.**"

`[DOC]` Law 3's source entry, verbatim: "wrapping `advanceToNextEvent` in progress animation
or intermediate Lot snapshots tells the player that skipped travel, work, queues, or occupancy
were observed when the Engine returned only one deterministic final state… **Pattern:**
truthful start → one authoritative batch → truthful finish. **Anti-pattern:** staged spectacle
that implies simulation evidence the batch never exposed."
(`docs/LESSONS-LEARNED.md`, entry EW, ≈L3222-3232.)

`[DOC]` Law 2's source: "a route timer, sprite arrival, or render-loop callback can become a
second simulation clock and make a shooting task depend on frame timing, tab visibility, or
reload position" (`docs/LESSONS-LEARNED.md`, entry BN, ≈L1934-1946).

`[DOC]` Note the exact scope. **Law 3 forbids animating a *batch*. It does not forbid animating
a *week*.** That distinction is not my reading — it is the distinction the C1 implementation
itself drew, and shipped (§1.8).

### 1.6 What FMJ built on Model A

`[CODE]` `firstFilmJourney(state)` (`src/core/firstFilmJourney.ts:1-48`) is a pure, save-neutral,
zero-RNG projection: "changes zero outcomes and persists nothing, alters no tick step and is
called by none". It is explicitly **not a second workflow state machine** (`:23`) — every stage
is read off `scriptDevelopment.projects[].status`, `castingSessions.sessions[].status`,
`nextStudioDecision`, and `activeProductions` + `operations.workflows[].phase` (`:24-38`).

The FMJ pattern is the reusable one: **when a new legibility need appears, C1 answered it with a
pure projection over existing truth, never with a new state field and never with a new clock.**
Presence (§1.8) and `studioCalendar` (§1.4) are the same move.

### 1.7 What PF1 builds on it — **stated only from the brief; I did not read PF1**

`[DOC]` Per `docs/c2-planning/00-C2-PLANNING-BRIEF.md:55-60`, PF1 is ui-only: AudioService, a
**cue grammar over `SimStopReason`**, prefs, settings, save presentation, dialog replacement,
with `src/core` untouched and no V14. Per `:61-68`, PF1 §9/§10 routes to C2: Premiere Night V1,
simulation theater, this docket, the event-model docket, the authoritative wrap transition, and
the recorded C1 seams.

`[GAP]` The PF1 charter itself lives in the forbidden worktree/branch. Per the hard rules I did
not open it. **Every PF1 claim in this docket is second-hand through the brief and must be
re-verified against the charter before the Owner rules.** In particular I cannot confirm the
cue grammar's exact key set, whether it keys on `SimStopReason` alone or also on
`constructionCompletion`, or what §11.2 actually says about defeating hypothesis B — the brief
cites it (`:46`) but does not quote it.

### 1.8 THE PIVOT: Model A already contains a living turn, and it is people-shaped

This is the evidence that reframes the whole docket.

**(a) The engine already decomposes a week into beats — as a projection, not as a tick.** `[CODE]`
`src/core/presence.ts:1-17`: `studioPresence(state)` "decomposes the CURRENT week into
`BEATS_PER_WEEK` integer beats per named person… changes zero outcomes and persists nothing,
alters no tick step and is called by none, consumes ZERO simulation RNG."
`BEATS_PER_WEEK = 10` (`presence.ts:58`), `PRESENCE_DEPARTURE_WINDOW = 3` (`:60`),
`PRESENCE_LAST_WORK_BEAT = 8` (`:61`), `PresenceBeat = 'home' | 'travel' | 'at-site' | 'waiting'`
(`:64`). The timeline canon: "home… → travel (1 beat) → at-site | waiting (through
`PRESENCE_LAST_WORK_BEAT`) → home (beat 9)" (`presence.ts:211-215`).

`[CODE]` And it is explicitly fenced: "Everything below the 'attendance canon' heading is
PRESENTATION CANON… It is NOT outcome law. **No attendance rule here feeds a decision, a cost, a
duration, or a tick.**" (`presence.ts:18-24`). Its known truth gaps are *recorded, not filled*
(`presence.ts:26-42`) — including gap 1, that a `facility-capacity` blocker names no specific
full facility, so the waiting rule was downgraded to "the company waits AT THE SITE IT ACTUALLY
HOLDS."

**(b) The renderer already plays one week as witnessed time.** `[CODE]`
`ui/src/lot/tycoon/playback.ts:1-6`: "LAW 1/2/3, restated as code. Everything here is a function
of (a) the engine's beat array for one person, (b) an authored presentation path, and (c) a wall
clock. **It advances nothing, decides nothing, and consumes no RNG. Stop the clock at any instant
and the world still says exactly what `studioPresence` said; that is the whole point.**"

- `PLAYBACK_BEAT_MS = 1_150` (`playback.ts:29`)
- `PLAYBACK_LAST_BEAT = 8` (`playback.ts:32`)
- `PLAYBACK_DURATION_MS = 9 × 1150 = 10_350` — "inside the 8–12s target" (`playback.ts:35`)
- `personPositionAt(beats, path, elapsedMs)` reads the engine's beat array **literally**
  (`playback.ts:127-167`); `pointAlongPath` interpolates by **arc length** so a long avenue leg
  and a short forecourt leg run at the same speed (`playback.ts:71-97`).

`[CODE]` The playback file also **records a contradiction rather than papering it over**
(`playback.ts:8-23`): the frozen brief asked both that the resting frame show everyone at their
site AND that playback "return at beat 9"; those cannot both be true of one settled frame, so the
played window is beats 0…8 and beat 9's walk home is implemented and tested but not played. `[DOC]`
The Owner accepted that resolution: "The writer's beat-0–8 resolution of the frozen-target
contradiction (settled frame = static truth; walk-home implemented but not the played window) is
ACCEPTED" (`TYCOON-WORLD-CONVERSION-LOG.md:396-398`).

**(c) The law-3 fence is enforced in three places.** `[CODE]`
- Scene: "Law 3: a batch of weeks is not witnessed time. A playback belongs to ONE week's beat
  timeline, so any snapshot that moves the studio off that week ends it — the skipped weeks are
  never replayed" (`TycoonScene.ts:2600-2605`).
- Scene: `playPresenceWeek(week)` refuses when the projection is absent, when `week` is not the
  snapshot's week, or under reduced motion (`TycoonScene.ts:3167-3189`).
- React: "`advanceToNextEvent` may cross forty weeks in one call; none of those weeks was ever a
  moment the player was present for, so none of them is animated… **Only the single
  Advance-one-week arm — the one week the player asked for, one at a time — plays its beat
  timeline**, and only when the App's own feedback for that advance names the exact week the
  renderer is now showing" (`ui/src/lot/StudioLotScreen.tsx:4382-4406`).

**(d) Skip, reduced motion, and idempotence are all already solved.** `[CODE]` First pointer press
anywhere on the canvas ends playback (`TycoonScene.ts:3359-3363`); `Esc` and `Space` skip behind
the suspension latch (`TycoonScene.ts:3425-3438`); reduced motion is instant final positions, not
a shorter walk (`TycoonScene.ts:3574-3576`, `3181-3187`); `skipPresencePlayback()` is idempotent
and "touches presentation only" (`TycoonScene.ts:3191-3200`); one playback per accepted advance,
keyed on App minting a fresh feedback object (`StudioLotScreen.tsx:4398-4400`).

**(e) It was verified by hand and kept.** `[DOC]` "On Advance-one-week the playback is real —
Buster Underwood was caught mid-commute on the avenue with his nameplate, settling at the building.
Two weeks later the phase moved to Rehearsal · Soundstage 7 and the company physically relocated…
Development empty again." (`TYCOON-WORLD-CONVERSION-LOG.md:388-396`). Red team: "VERIFIED WITH
CAVEATS. Zero P0, zero P1… Determinism proven to the byte (presence interleaving, export/import
round-trips, identical replays, identical localStorage after identical in-world sequences)"
(`:407-419`).

**(f) And here is the hole that matters most to C2.** `[CODE]` `ui/src/App.tsx:2524-2534`: the
`{kind: 'week'}` cadence feedback that triggers playback is set **only** inside
`if (released.length === 0 && resolvedReturnContext.kind === 'lot')`. A lot-origin week that
*ships a movie* routes straight to Newspaper/ReleaseResult and **never plays**. The one week the
player most wants to witness — the week the picture is finished — is precisely the week C1's
living turn is silent for. That is a direct, code-level argument for Premiere Night V1 belonging
to the same milestone as any Model B work (Owner law 7, brief `:38`).

**(g) What C1 explicitly refused to build.** `[DOC]`
`docs/WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:307-311` — "Explicitly outside V1: autoplay,
pause/speed controls, Sim to next event from the lot, or a second game clock." (The second of
those, Sim-to-next-event from the lot, was later delivered by the Next-Event Cadence contract —
`docs/WORLD-FIRST-LOT-NATIVE-NEXT-EVENT-CADENCE-REACTION-V1-CONTRACT.md:96-104` — which
re-affirmed the rest: "does not introduce pause, speed, autoplay, a second clock, a renderer
clock, or a background simulation.") `[DOC]` The prohibition on autoplay/second-clock is repeated
in at least ten frozen contracts and closures (grep: `WORLD-FIRST-*-CONTRACT.md`,
`docs/HANDOFF.md:450`, `NEXT-HIGHEST-LEVERAGE.md:41`, `MARATHON-LOG.md:441,468`,
`PROGRESS.md:144`, `CURRENT-BEST.md:149`).

**Model A, then, is not "discrete and dead." It is: an integer weekly engine; a batch loop with a
ten-reason stop union; a family of pure projections that make the week legible; and one
already-shipped ten-beat presentation playback of a single week, fenced by three explicit law-3
guards.**

---

## 2. MODEL B — LIVING TURN (candidate definition) `[PROPOSAL]`

There is no prior spec. What follows is my candidate definition, offered for the Owner to rule
on, amend, or reject.

### 2.0 Definition

> **LIVING TURN.** The week remains the sole authoritative discrete substrate and the sole
> save/reporting boundary. Between player commitments, the lot plays the committed week's work
> out as *witnessed, interruptible time*: the engine's own sub-week beat decomposition, rendered
> at an authored pace, pausable and skippable, settling exactly onto the week's static truth.
> Playback is evidence, never authority (Owner law 5, brief `:31`). Stop-on-event is preserved
> unchanged; the batch remains a batch and is still never animated.

Five invariants I propose the Owner treat as the acceptance floor for **any** B variant:

- **B-I1 — One authority.** `market.tick` remains the only clock. No presentation state
  serializes. Pause/resume/skip changes zero bytes of `GameState` or the save.
- **B-I2 — Settle-onto-truth.** Stopping the presentation clock at *any* instant leaves the world
  saying exactly what the pure projection says for that week. (This is already the shipped
  standard — `playback.ts:1-6`.)
- **B-I3 — Batches stay unwitnessed.** Law 3 is untouched: a multi-week batch lands on final
  truth and may play at most the *new current* week's timeline.
- **B-I4 — Interruption is free.** Any pointer press, `Esc`, `Space`, reduced motion, or an
  arriving snapshot for a different week ends playback instantly and idempotently.
- **B-I5 — Beats never gain authority without a version.** If beats ever move inside `tick()`,
  that is a save-format event (V14) and a determinism-corpus event, and it is a different
  milestone from anything presentational.

### 2.1 Variant B1 — WITNESSED WEEK PLAYBACK (extended) `[PROPOSAL]`

**Shape.** Keep the existing model exactly: engine outcome for the week is computed first, in
full, by one `tick()`. The renderer then plays that already-decided week as a short scene.
**Extend the played content from people-only to the manufacturing loop**: scenery leaving the
Scenery Shop for the stage it was requisitioned for; a stage's lamp going hot when shooting
begins that week; a set being struck and its slot released at wrap; a queued company visibly
waiting at the site it holds while a `facility-capacity` blocker is live; and — the missing
week — a release week playing as Premiere Night rather than skipping playback entirely
(`App.tsx:2524-2534`).

**What changes in the engine.** **Nothing structural.** The work is to *extend the pure
projection*, in the documented `presence.ts`/`firstFilmJourney.ts` discipline: either widen
`studioPresence` beyond named people to *things* (sets, scenery, stage state), or add a sibling
`studioWeekTheater(state)` projection. Both are save-neutral, zero-RNG, call no tick step, and
are called by none. `[CODE]` The precedent is explicit and doubly established
(`presence.ts:1-17`, `firstFilmJourney.ts:5-22`).

*Caveat, and it is the honest cost:* B1 can only show what state already distinguishes. `[CODE]`
Presence gap 1 (`presence.ts:26-33`) records that a capacity blocker names no specific full
facility. `[CODE]` `ProductionBlocker` (`src/core/types.ts:562-571`) carries only
`{capability, targetPhase}` or `{taskId}` — there is no queue position, no expected-clear week, no
"who is ahead of you." `[DOC]` And the Owner's own note: "Facility-capacity queues remain latent
in shipped config (recorded Owner decision)" (`TYCOON-WORLD-CONVERSION-LOG.md:404`). **C2's Sets/
Stages work will create the real contention (Owner laws 1–4), and *that* work is what gives B1
something worth watching. B1 is a consumer of C2's throughput lane, not a substitute for it.**

**What changes in the adapter.** `advanceWeek` and `advanceToNextEvent` are untouched. The
snapshot boundary grows: `StudioLotSnapshot` already mirrors presence field-for-field and carries
`beatsPerWeek` "so the renderer never assumes it"
(`ui/src/lot/snapshot/StudioLotSnapshot.ts:429`, `:485`; mirrored at
`ui/src/engine/adapter.ts:5555-5640`). The same mirroring pattern extends to the new theater
projection. One new App-owned cadence-feedback arm is needed so a **release** week can also mint a
`{kind:'week'}` playback before the Newspaper/ReleaseResult chain (today it cannot —
`App.tsx:2524`).

**What changes in the renderer.** `playback.ts` gains object/prop tracks alongside person tracks;
`TycoonScene.playPresenceWeek` becomes `playWeek` with more subjects; the three law-3 guards and
the skip paths are reused verbatim. Pause is the one genuinely new control (see B-I4 → §5's
"pause/resume" note): it is a presentation boolean that stops accumulating `delta`, nothing more.

**Determinism story.** Unchanged and strong. Playback reads immutable arrays and a wall clock;
it writes nothing. `[CODE]` `tests/presence-determinism.test.ts:1-6` already pins the shape:
"same state ⇒ same bytes, calling it leaves the state (and its save) untouched, and a tick is
byte-identical whether or not presence was projected first." `[CODE]`
`ui/src/lot/tycoon/playback.test.ts` proves the wall-clock state machine without a renderer.

**PF1 cue grammar.** `[PROPOSAL]` Additive and low-risk. PF1 cues fire on the *stop*; B1 cues
fire on *beats within a played week*. The two never collide because a played week only exists on
the single-advance arm, and a batch stop is exactly where PF1's cue already lives. The one
required rule: **a played week must not re-fire a stop cue.** If C2 wants stage/scenery beat
audio, it should be a distinct cue family layered under the same AudioService, with the stop cue
retaining priority. `[GAP]` This must be checked against PF1's actual charter (§1.7).

**Save compatibility.** None required. No V14.

### 2.2 Variant B2 — CONTINUOUS-UNTIL-EVENT (the batch made ambient) `[PROPOSAL]`

**Shape.** The player presses "Run" instead of "Advance one week." The lot auto-advances weeks —
one real `tick()` per played week, on a presentation cadence — with inter-week theater between
them, halting at the first governed `SimStopReason`. This turns `advanceToNextEvent`'s *stop
semantics* into an ambient mode while replacing its *batch execution* with a sequence of witnessed
single weeks.

**What changes in the engine.** Nothing. Each played week is one ordinary `tick`.

**What changes in the adapter.** Substantial and subtle. `advanceToNextEvent` currently owns stop
detection *inside* its loop (`adapter.ts:2343-2440`). B2 needs that detection factored out into a
per-tick predicate the App can call after each played week, without duplicating the priority
order. **Duplicating the ten-reason priority ladder in React is the single highest-risk mistake
available in this whole docket** — `[DOC]` the codebase already names it: "preserve the adapter's
primary order exactly — release, screenplay, casting, production, run, cash, expiry, renewal,
construction, limit" (`docs/LESSONS-LEARNED.md`, entry EX, ≈L3234-3240). The correct move is to
export the existing predicate, not to re-implement it.

**What changes in the renderer.** Beyond B1: an inter-week transition that does not lie, and a
run/pause/stop control cluster.

**Determinism story.** Intact *in state*, degraded *in experience*. Every tick is a real tick, so
saves and replays stay byte-identical. But the number of weeks between the player's press and the
player's next input is now a function of when they pressed pause — so "the same session" is no
longer a reproducible phrase, and bug reports get harder. `[CODE]` The existing determinism suites
(`ui/src/determinism.test.tsx:126,151` — "a fixed sequence of UI actions → identical visible
results across runs") would need an explicit rule that a run-mode session is pinned by *week
count*, not by wall time.

**Law 2/3 posture.** Compatible in principle — each animated week *is* a witnessed week, so law 3
is honoured better than by a batch. But it directly contradicts a decision repeated across ten
frozen contracts: "no autoplay, no speed control, no second clock"
(`docs/WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:309`,
`docs/WORLD-FIRST-LOT-NATIVE-NEXT-EVENT-CADENCE-REACTION-V1-CONTRACT.md:1024`,
`docs/WORLD-FIRST-ANNEX-CONSTRUCTION-INTERACTION-V1-CONTRACT.md:540`, and seven more). **B2
requires an explicit Owner overrule of a standing, repeatedly re-affirmed prohibition.** That is a
ruling to make deliberately, not a design detail to slip in.

**Cost note.** At the shipped pace (`PLAYBACK_DURATION_MS = 10.35s`), a 40-week batch becomes a
seven-minute cutscene. B2 is unusable without a speed dial, and a speed dial is precisely the
thing every prior contract refused. B2 is not "B1 plus a button"; it is a different product.

**Save compatibility.** None required if run-mode state is not persisted (recommended). If the
Owner wants "resume running on load," that is a V14.

### 2.3 Variant B3 — ENGINE-INTERNAL BEATS (the mined shape) `[PROPOSAL / DOC]`

This variant is **not my invention** — it is already recorded in this repo as a mined design, and
the Owner should see it as a live option because it is the only B variant that could make queues
and travel *authoritative* rather than depicted.

`[DOC]` `CODE-MINING-LEDGER.md:79-95`, "PROJECT: STUDIO APPLICATION":

> "Keep week as the only authoritative outer tick; add fixed integer `BEATS_PER_WEEK = 10` inner
> loop inside `tick()` (mirrors `World:onTick`). Beats are engine-internal; the week remains the
> save/reporting boundary. The tick emits a deterministic beat timeline the renderer plays back
> over wall time — travel/work become watchable **without a second clock**."

Plus: one `beatsRemaining` timer per person; a `Task`/`Step` union (SEEK/TRAVEL/QUEUE/WORK/IDLE/
CHECKPOINT/LEAVE) with verification/priority/execute as **pure functions switched on `kind`, never
closures in state**; facility with `requiredCrew/maxCrew/maxSubjects/occupants/enroute/admitting/
queue`; travel by authored node graph + Floyd–Warshall all-pairs matrix, **no A\***; and ten named
invariants to unit-test verbatim.

`[DOC]` Provenance and licence are already cleared: donor CorsixTH, MIT confirmed on disk, ruling
**CLEAN-ROOM REIMPLEMENT** with a third-party notice as cheap insurance
(`CODE-MINING-LEDGER.md:17-77`).

**What changes in the engine.** A lot. `tick()` gains an inner loop; per-person step state becomes
`GameState`; facility occupancy gains `enroute`/`admitting`/`queue`; the fixed pipeline order at
`tick.ts:1-31` must accommodate a sub-step that runs *between* existing steps or *within* step 1.
Every existing step that reads "the week's" occupancy union (operational law 22 — "Capacity/
occupancy is ONE union at every boundary", `docs/SHIFT-OPERATIONAL-LAWS.md:62-64`) has to be
re-derived against a mid-week occupancy that now varies.

**Determinism story.** Preservable — integer beats, fixed iteration order, no wall clock, derived
streams — but **the byte-identity corpus moves**. `[CODE]` `tests/replay.test.ts:1-18` pins "Same
seed + same actions → byte-identical state and Broadcast copy" against the full serialized save;
`[DOC]` `HANDOFF.md:1474-1481` pins the exact release schedule that falls out of the current
model ("releases at ticks 8, 9, 17, 18 … 44, 45 — 10 per run"). If beat-level queueing can delay a
phase, **that schedule changes and every downstream economy calibration re-baselines.**

**Save compatibility.** **V14, mandatory.** `[CODE]` Twelve converters exist today
(`src/core/save.ts:4638,4680,4724,4746,4805,4843,4912,4941,4961,4978,5011,5076`) inside a
5,266-line module. A thirteenth is not the hard part; the hard part is `[DOC]` operational law 19,
"Copy the historical-boundary guard pattern verbatim for new roots", and law 18's "positive
projection (enumerate owned roots, no clone-then-delete)"
(`docs/SHIFT-OPERATIONAL-LAWS.md:52-57`).

**Verdict on B3 for C2.** It is the *right long-term shape* and the *wrong C2 commitment*. It is
the only variant that makes Owner law 2's queue authoritative rather than depicted — but it lands
on the same milestone that is already rebuilding Sets, Stages, capacity, contention, and the
Founding Flip. Two authoritative-model rewrites in one campaign is how a campaign fails.

### 2.4 An internal contradiction the Owner should know about

`[DOC vs CODE]` The ledger says beats belong **inside `tick()`** and are **engine-internal**
(`CODE-MINING-LEDGER.md:80-83`). The shipped C1 implementation put beats **outside the tick**, as
presentation canon that "is NOT outcome law. No attendance rule here feeds a decision, a cost, a
duration, or a tick" (`src/core/presence.ts:18-24`). **Same constant name, same value 10, opposite
authority.** Nothing in the repo reconciles these. Whichever way the Owner rules, that ambiguity
should be closed in the C2 charter, because a future agent reading `BEATS_PER_WEEK` cannot today
tell which contract it is under.

---

## 3. MODEL C — continuous simulation

### 3.1 What it would mean

`[PROPOSAL]` True continuous time = the engine advances on a sub-week quantum (day, hour, or
real-valued dt), with production progress, payroll accrual, facility occupancy, travel, theatrical
receipts, and contract boundaries all resolving on that quantum. The week survives only as a
reporting bucket.

### 3.2 What the corpus says the original did — and why that matters

`[CORPUS]` The Movies (2005) **was** Model C, and the fantasy the Owner is chasing came from it:

- Pause/speed cluster: "Date/Pause/Play/Fast-Forward cluster, top-left, always visible over the
  lot; P key toggles pause without opening a menu. While paused, browsing/info remains available
  but drag/drop of Stars, staff, movies, or scripts is disabled [OFFICIAL p.5, p.10]"
  (`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:2649`).
- Shooting was continuous and physical: "Cast and crew travel between sets and shoot each scene
  **in real time**, with breaks between scenes." (Bible `:2753`, pipeline stage 3.)
- The clock could be *skipped*, and that toggle existed at New Game: "**'Instant Movie-making'** —
  films are shot instantly rather than progressing through real timeline days, though the manual
  is explicit that 'these movies still need to be cast and staffed properly,' i.e. only the
  time-passage of shooting is skipped, not the casting/crew gating. [OFFICIAL: manual p.5]"
  (Bible `:1043`).
- Players used continuity as a *verb*: "the player can deliberately halt an in-progress movie by
  dragging its script out of the 'Begin Rehearsing'/casting room and setting it down outside — cast
  and crew resume normal free-time behavior until the player resumes it — used by players
  specifically to let a stressed cast 'cool down' without losing the pipeline position" (Bible
  `:1071`).
- Timeline HUD: "the line along the top of the screen [that] shows the passage of time from
  present day into the future, with each segment representing a year" (Bible `:2488` region,
  OFFICIAL manual p.5).
- One unbroken arc: "just one continuous 1920-onward timeline" (Bible `:132`).

`[CORPUS]` Two of those rows are load-bearing **for B, not for C**. The "Instant Movie-making"
toggle (`:1043`) proves the original's own designers treated *watching the shoot* as separable
from *the shoot's outcome* — the exact separation B1 makes structural. And the pause row (`:2649`)
shows the original's pause was a *browsing* pause, not a decision pause: information stays live,
manipulation stops. That is a good model for B1's pause.

`[CORPUS]` The register's own transferable principle points the same way: "creative timing kept
separate from the running production simulation's own clock"
(`PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md:168`).

### 3.3 Cost against the current core

| Cost axis | Assessment |
|---|---|
| Purity `(state,actions)=>state` | **Survivable but expensive.** Continuous time does not by itself break purity — a `dt` parameter is just another argument. What breaks is the *fixed pipeline order* (`tick.ts:1-31`): every step currently assumes "once per week, in this order." Payroll (`step 7`), overhead (`7.5`), facility opex (`7.6`), contract expiry (`8`) all key off `currentTick` as an integer week (`tick.ts:682`, `tick.ts:703`). `[CODE]` |
| RNG / determinism | **Directly threatened.** Today exactly one sim-stream draw exists per release (`tick.ts:23-25`). Under continuous time, "how many draws happened" becomes a function of quantum size. Any float dt makes replay a floating-point-reproducibility problem across engines. `[CODE]` operational law 23 (`SHIFT-OPERATIONAL-LAWS.md:65-69`) demands byte-identical replays. |
| Save / replay | **V14 with a semantic break.** `tests/replay.test.ts:1-18` compares the *full serialized save* after the same seed + actions. Sub-week state means every historical save's meaning ("week 30") must be reinterpreted, and twelve existing converters (`save.ts:4638…5076`) each need a defensible sub-week default for states that never had one. |
| 3,318-test regression floor | **The decisive cost.** `[DOC]` Seal gates at `9d8b0b4`: "full vitest 241 files / 3,318 tests exit 0" (`LOT-CONTENT-EXPANSION-LOG.md:578`), plus "211 collected / 207 passed / 4 env-gated skips" Playwright (`:579-583`). `[CODE]` 106 core test files under `tests/` and 148 `*.test.ts(x)` under `src/`+`ui/src`. A large fraction assert *week-indexed* facts: `tests/tick.test.ts`, `tests/replay.test.ts`, `tests/operations.test.ts`, `tests/studio-calendar.test.ts`, `tests/construction-accounting-calendar.test.ts`, the entire `d11`/`d12`/`d17a`/`d17b` economy families, all seven `roster-wall-*` suites, and every `*-save-v*.test.ts`. **These are not tests you "update" — they are the calibration record.** `[DOC]` Operational law 28: "never weaken/delete a failing test to go green" (`SHIFT-OPERATIONAL-LAWS.md:92-96`). |
| Batch laws 2–3 | **Law 3 becomes meaningless** (there is no batch), which sounds like a win, but **law 2 becomes far harder to hold**: with a live clock running, the temptation for a renderer arrival to complete a task is structural rather than occasional. That is exactly the failure LL BN describes (`LESSONS-LEARNED.md`≈1934-1946). |
| Economy calibration | **Re-baselines from zero.** `[DOC]` D-12/D-16/D-17A/D-17B are week-quantised throughout (e.g. the R7 cycle-inclusive break-even is defined as "`PRODUCTION_TICKS + THEATRICAL_WEEKS` = 14 weeks at the current weekly burn", `ui/src/engine/adapter.ts:2172-2175`). Every one of those rulings would need re-derivation. |

### 3.4 Verdict on C

**Model C is refuted on cost, not on desirability.** It is what the original did, it is what
"watch it manufacture movies" most literally implies, and it is unaffordable inside C2. C2 already
carries Sets, Stages, throughput, queue legibility, Premiere Night V1, simulation theater, and the
Founding Flip capstone. Adding a foundational time-quantum rewrite that re-baselines the entire
economy calibration and the 3,318-test floor is not a milestone, it is a new project.

**And the corpus itself argues C is unnecessary for the feeling.** `[CORPUS]` The original shipped
a toggle that removed continuous shooting time entirely while keeping the gating intact (Bible
`:1043`) — its own designers separated *witnessing* from *resolving*. B1 makes that separation the
architecture rather than an option.

---

## 4. JUDGMENT TABLE

Scored ✅ (clean) / ⚠️ (real cost, manageable) / ❌ (fails or requires overruling a standing law).

| Criterion | A (discrete, today) | B1 (witnessed week, extended) | B2 (continuous-until-event) | B3 (engine-internal beats) | C (continuous sim) |
|---|---|---|---|---|---|
| **Determinism / purity preserved** | ✅ Zero wall clock, zero `Math.random` in `src/core`; one sim draw per release (`tick.ts:23-25`) | ✅ Playback writes nothing (`playback.ts:1-6`); pinned by `tests/presence-determinism.test.ts` | ⚠️ State stays byte-identical; *session* reproducibility degrades (week count, not wall time, must pin) | ⚠️ Preservable with integer beats + fixed order, but release schedule and calibration re-baseline (`HANDOFF.md:1474-1481`) | ❌ Draw count becomes quantum-dependent; float dt threatens byte-identical replay (law 23) |
| **Law 2 compatible** (animation never completes) | ✅ | ✅ Already enforced 3× (`TycoonScene.ts:2600-2605,3175-3189`; `StudioLotScreen.tsx:4382-4406`) | ⚠️ Holds, but a live clock makes the violation structurally tempting | ✅ Beats are engine truth, so animation acknowledges real law | ❌ Hardest case: LL BN's exact failure mode |
| **Law 3 compatible** (batch ≠ witnessed) | ✅ | ✅ Batch still unanimated by construction | ✅ Better than A — every played week *is* witnessed | ✅ | n/a (no batch) |
| **Queue / bottleneck legibility** (Owner laws 1–2) | ⚠️ Vocabulary exists (`studioCalendar.ts:206,209`) but blockers carry no queue position (`types.ts:562-571`) and queues are latent in shipped config (`TYCOON-WORLD-CONVERSION-LOG.md:404`) | ⚠️ Can *show* only what C2's throughput lane makes real; presence gap 1 stands (`presence.ts:26-33`) | ⚠️ Same ceiling as B1 | ✅ **Best.** `enroute`/`admitting`/`queue` with priority tiers and `reportedCount` is authoritative queue truth (`CODE-MINING-LEDGER.md:56-62,88-92`) | ✅ Also strong, at ruinous cost |
| **Simulation theater** ("watch it manufacture movies") | ⚠️ People-only, one week, non-release weeks only (`App.tsx:2524`) | ✅ **Strong.** Extends a proven, hand-verified vehicle (`TYCOON-WORLD-CONVERSION-LOG.md:388-396`) | ✅ Strongest *ambience*, but 10.35s/week makes long runs unwatchable without a speed dial | ✅ Deepest, once built | ✅ Maximal |
| **Premiere Night V1 staging** (Owner law 7) | ❌ Release week never plays; routes straight to Newspaper (`App.tsx:2524-2534`) | ✅ **B1's most valuable single fix** — mint a `{kind:'week'}` playback on the release arm and Premiere Night has a stage | ✅ Same fix, inherited | ✅ Same fix, inherited | ✅ |
| **Implementation risk / blast radius** | ✅ Zero | ✅ **Lowest of all change options.** UI + one new pure projection; `src/core` structurally untouched | ⚠️ Adapter refactor (stop predicate must be *exported*, never duplicated — LL EX) + overrules a 10×-repeated prohibition | ❌ `tick()`, `GameState`, occupancy union (law 22), save V14, economy re-baseline — concurrent with C2's own Sets/Stages rewrite | ❌ Foundational rewrite |
| **Save compatibility** | ✅ V13 | ✅ No V14 | ✅ No V14 (if run-state unpersisted) | ❌ V14 required; 13th converter + law 18/19 discipline | ❌ V14 + semantic reinterpretation of every historical save |
| **Test-infrastructure impact** | ✅ None | ✅ Additive: new projection suite + extended `playback.test.ts` | ⚠️ `ui/src/determinism.test.tsx` needs a week-count pinning rule; new e2e for run/pause | ❌ Every week-indexed core suite re-baselines (`tick`, `replay`, `operations`, `studio-calendar`, all `d1x`, all `roster-wall-*`, all `*-save-v*`) | ❌ Worst case of the same |
| **Reversibility if wrong** | ✅ | ✅ **Fully reversible** — it is presentation; a flag turns it off, exactly as `ui/src/flags.ts` already does for five prior systems | ⚠️ Reversible (drop the mode), but any economy tuned around it is not | ❌ A shipped V14 is not reversible; downgrade is refused by design (`save.ts` migrate-downgrade refusal, law 19) | ❌ Irreversible |
| **Owner-law overrule required?** | — | **No** | **YES** — "no autoplay / speed / second clock", re-affirmed in ≥10 frozen contracts | **Yes, implicitly** — beats gain authority, contradicting `presence.ts:18-24` | **Yes, comprehensively** |

---

## 5. RECOMMENDATION

### 5.1 What C2 ships: **Model B1-extended** — "the week you can watch"

`[PROPOSAL]` C2 ships the Living Turn as *witnessed week playback over the whole manufacturing
loop*, not as autoplay and not as a new time quantum. Concretely, four deliverables:

1. **Extend the beat projection from people to production.** One new pure, save-neutral, zero-RNG
   projection (`studioWeekTheater(state)` or a widening of `studioPresence`) in the documented
   `presence.ts`/`firstFilmJourney.ts` discipline (`presence.ts:1-17`, `firstFilmJourney.ts:5-22`).
   Subjects: scenery in transit to a named stage, stage occupancy going hot/dark, set strike and
   slot release at wrap, and companies **queued** at the site they hold.
2. **Close the release-week hole.** Mint cadence feedback on the lot-origin *release* arm too, so
   the week a picture finishes plays before the Newspaper chain (`App.tsx:2524-2534`). **This is
   the load-bearing prerequisite for Premiere Night V1** (Owner law 7) and it is a handful of lines
   in App, not an architecture.
3. **Add pause/resume to the existing playback** (not to the game). A presentation boolean gating
   `delta` accumulation in `TycoonScene.updatePresencePlayback` (`TycoonScene.ts:3223-3232`),
   alongside the skip paths that already exist. Modelled on the original's browsing-pause, which
   kept information live and manipulation frozen (`[CORPUS]` Bible `:2649`).
4. **Reconcile the `BEATS_PER_WEEK` authority ambiguity in writing** (§2.4) — the C2 charter states
   plainly that beats are presentation canon under C2 and that any move inside `tick()` is a
   separate, versioned milestone.

**Why this and not more.** B1 is the only option that increases theater without spending the two
currencies C2 cannot afford: engine blast radius and the 3,318-test calibration floor. It rides a
vehicle that is already built, already hand-verified by the Owner
(`TYCOON-WORLD-CONVERSION-LOG.md:388-396`), already red-teamed
(`:407-419`), and already flag-reversible. And the substance the Owner actually asked for —
"physically watch it manufacture *multiple* movies" — is **not** blocked by the time model. It is
blocked by `MAX_CONCURRENT_PRODUCTIONS: 2` (`tuning.ts:50`, enforced `actions.ts:333`) and by the
absence of real Sets/Stages contention. **C2's throughput lane, not C2's time lane, is what makes
the week worth watching.** B1 is the window; the throughput lane is the factory.

### 5.2 Does B need a bounded spike first? **Yes — one, and it is small.**

`[PROPOSAL]` **Spike B-S1 — "the week has more than people in it" (bounded, killable, ≤1
milestone).** Before the C2 charter commits copy or acceptance to week theater, prove on a real
save that (a) a scenery load-in, a stage going hot, and a wrap can each be *derived* from existing
authoritative state as a beat track, and (b) at least one of them cannot, and name exactly which
state field is missing. Kill criterion: if fewer than two of the three tracks are derivable without
new `GameState`, B1-extended reduces to "people plus lamps" and the charter should say so honestly
rather than promise a factory.

**Spike B-S2 — B3 feasibility, explicitly NOT a C2 dependency.** `[PROPOSAL]` If the Owner wants
authoritative queues rather than depicted ones, commission a *paper* spike against
`CODE-MINING-LEDGER.md:79-95` that answers three questions and no others: what does the occupancy
union (law 22) mean mid-week; what happens to the pinned release schedule
(`HANDOFF.md:1474-1481`); and what is the V14 migration's default sub-week position for twelve
historical save versions. **C2 must not block on it.** B3 is a C3-or-later campaign.

### 5.3 What is deliberately deferred `[PROPOSAL]`

- **Model C in every form.** Not "later" — *refuted for C2* on the grounds in §3.3, with the
  corpus's own Instant-Movie-making toggle as evidence the feeling survives the refusal.
- **Model B2 (autoplay / run-until-event / speed control).** Requires overruling a prohibition
  re-affirmed in ≥10 frozen contracts, and is unusable at the shipped 10.35s/week pace without the
  speed dial those same contracts refuse. If the Owner wants it, it should be its own ruling with
  its own milestone — not a C2 line item.
- **Model B3 (beats inside `tick()`), and with it authoritative travel time, authoritative queue
  position, and expected-clear-week estimates.** C2's queues remain *depicted from real blockers*,
  not *resolved beat by beat*.
- **Animating any batch week.** Law 3 stands untouched. `advanceToNextEvent` keeps landing on final
  truth and playing at most the new current week.
- **Persisting any playback state.** No V14 from this lane. If some other C2 lane needs V14 for
  Sets/Stages, this lane still contributes nothing to it.

### 5.4 Honest statement on the Owner's hypothesis

The brief instructs me to say plainly if evidence defeats B. **It does not defeat B — it
substantially confirms it, and it defeats the maximal reading of it.** The Living Turn as
*witnessed, interruptible, engine-derived week playback* is already real, already lawful, and
already loved (`TYCOON-WORLD-CONVERSION-LOG.md:388-398`). The Living Turn as *the lot running
itself between commitments* (B2) and as *sub-week engine authority* (B3) are both defensible
designs that C2 cannot absorb alongside Sets, Stages, throughput, Premiere Night, and the Founding
Flip. The recommendation is to ship the confirmed part and docket the rest.

---

## 6. RISKS, GAPS, AND CONTRADICTIONS (reported loudly, not resolved)

**R1 — PF1's charter is unread, and three claims depend on it.** `[GAP]` Per the hard rules I did
not open the PF1 worktree or any professional-floor branch. So the cue-grammar analysis (§2.1),
the §11.2 "evidence may defeat B" framing (brief `:46`), and the §9/§10 routing list (brief
`:61-68`) are all **second-hand through the brief**. Before the Owner rules, someone with
authority to read PF1 must confirm: the cue key set; whether cues key on `SimStopReason` alone;
and whether PF1 introduced any presentation clock of its own that would collide with playback.

**R2 — The brief's own citations drift from the tree in two places.** `[CODE vs DOC]`
(a) Brief `:22` cites the concurrency cap "enforced `src/core/actions.ts:332`"; the enforcement is
at **`src/core/actions.ts:333`** (line 332 is its comment). (b) Brief `:102-103` places the
adapter at "`ui/src/adapter.ts`"; **no such file exists** — it is `ui/src/engine/adapter.ts`
(6,784 lines). Both are minor, but this docket's entire method is `file:line`, so drift in the
governing brief is worth fixing at source rather than silently absorbing.

**R3 — `BEATS_PER_WEEK` has two contradictory authorities in-repo.** `[DOC vs CODE]`
`CODE-MINING-LEDGER.md:80-83` specifies beats **inside `tick()`, engine-internal**;
`src/core/presence.ts:18-24` ships beats **outside the tick, explicitly not outcome law**. Same
name, same value, opposite contracts, no reconciling document. **Unresolved. C2's charter must
close it.**

**R4 — `SHIFT-OPERATIONAL-LAWS.md`'s own trailer is stale, as the brief warns.** `[DOC]`
`SHIFT-OPERATIONAL-LAWS.md:99-101` says "Current save = V11 (`save.ts:218`, `makeSave` → V11 at
`save.ts:3516`)"; the tree is **V13** (`src/core/save.ts:261-288`, twelve converters through
`convertV12ToV13` at `save.ts:5076`). The brief flags this (`:78-79`) and assigns the fix to PF1-M2.
Recorded so this docket's law citations are not read as endorsing the stale trailer.

**R5 — The played week can only be as legible as `GameState` is.** `[CODE]` Presence gap 1
(`presence.ts:26-33`) and `ProductionBlocker` (`types.ts:562-571`) mean the world can honestly show
*that* a company is waiting and *for what capability*, but not *behind whom* or *for how long*. If
C2's acceptance copy promises "the player knows what it needs and what occupies it" (Owner law 2,
brief `:23-25`), **the throughput lane owes this lane new authoritative fields** — otherwise B1
ships a beautiful window onto a blocker that still cannot name its occupant. This is a
cross-lane dependency, not a time-model problem, and it should be stated as one in the charter.

**R6 — "Queues are latent in shipped config" is a recorded Owner decision that C2 reverses.**
`[DOC]` `TYCOON-WORLD-CONVERSION-LOG.md:404`: "Facility-capacity queues remain latent in shipped
config (recorded Owner decision)." Owner laws 1–2 (brief `:21-27`) make them *the point* of C2.
Not a contradiction in force — a decision the new laws supersede — but the charter should say so
explicitly so nobody later cites the old note as authority.

**R7 — The playback pace is pinned by an accepted 8–12s target with no stated source.** `[CODE]`
`playback.ts:33-35` and `playback.test.ts:39-41` assert `8_000 ≤ PLAYBACK_DURATION_MS ≤ 12_000`. I
found the target restated in the frozen M3-UI brief (`TYCOON-WORLD-CONVERSION-LOG.md:214-216`) but
**no derivation**. If C2 extends the played content (more subjects, more tracks), that window is
the first thing that will feel wrong, and there is no recorded rationale to argue against.

**R8 — The 3,318 figure is a seal-time measurement, not a live one.** `[DOC]`
`LOT-CONTENT-EXPANSION-LOG.md:578` records "241 files / 3,318 tests exit 0" at `9d8b0b4`, with
"commits after `9d8b0b4` are documentation only" (`:583-584`). `[CODE]` I counted 148
`*.test.ts(x)` under `src/`+`ui/src` and 106 files in `tests/` = 254 candidate files, which does not
match 241 — the discrepancy is almost certainly Playwright `e2e/*.spec.ts` and non-vitest files
being counted differently, but **I did not run the suite** (read-only lane, and a full run is
~minutes plus a 16-minute serialized Playwright pass). The regression floor should be
**re-measured at C2 kickoff**, not quoted from the seal. `[DOC]` Operational law 28: "regenerate
every reported number from a command" (`SHIFT-OPERATIONAL-LAWS.md:92`).

**R9 — B2 would require overruling a prohibition, and the docket should not soften that.**
`[DOC]` "no autoplay, pause/speed controls, … or a second game clock" appears as an explicit
out-of-scope or refusal clause in at least ten frozen contracts and closures
(`WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:309`;
`WORLD-FIRST-LOT-NATIVE-NEXT-EVENT-CADENCE-REACTION-V1-CONTRACT.md:100,1024`;
`WORLD-FIRST-ANNEX-CONSTRUCTION-INTERACTION-V1-CONTRACT.md:540`;
`WORLD-FIRST-STUDIO-HOME-V1-CONTRACT.md:606`;
`WORLD-FIRST-GREENLIGHT-PRODUCTION-FORMATION-FRESH-LOT-RETURN-V1-CONTRACT.md:597`, `-CLOSURE.md:118`;
`WORLD-FIRST-LOT-RETAINED-PACKAGE-GREENLIGHT-WORKSPACE-V1-CONTRACT.md:509`;
`WORLD-FIRST-LOT-RETAINED-AUDITION-PLANNING-WORKSPACE-V1-CONTRACT.md:501`;
`WORLD-FIRST-LOT-RETAINED-SCREENPLAY-COMMISSION-WORKSPACE-V1-CONTRACT.md:409`;
`docs/HANDOFF.md:450`). **Note the one thing my recommendation does add: a pause control on
playback.** I judge that *not* a violation — it pauses a presentation animation, not a game clock,
and changes no state — but the phrase "pause/speed controls" appears in those refusals verbatim,
so **the Owner should rule on it explicitly rather than let this docket assume it.**

**R10 — Nothing in this docket was executed.** No test was run, no build performed, no code
changed. Every claim is a read. The `file:line` anchors are from the tree at
`c2-sets-throughput-plan` @ `0599a02` (base `f294077`) and will drift as C2 lands.

---

## 7. EVIDENCE INDEX

**Code (this worktree).**
`src/core/tick.ts:1-31` (pipeline order + insertion law), `:23-25` (single sim draw), `:147-149`
(tick entry), `:682` (`newTick`), `:703` (week increments last) ·
`src/core/tuning.ts:48-50`, `:395` ·
`src/core/actions.ts:333` (concurrency cap enforced) ·
`src/core/operations.ts:56-77` (phase from countdown), `:20-42` (initial facilities) ·
`src/core/presence.ts:1-42` (projection authority + truth gaps), `:57-61` (beat constants),
`:64` (`PresenceBeat`), `:211-215` (timeline canon) ·
`src/core/firstFilmJourney.ts:1-48` (projection discipline) ·
`src/core/studioCalendar.ts:1-3` (no second clock), `:206`, `:209` (queue/hold copy) ·
`src/core/types.ts:562-585` (`ProductionBlocker`, `ProductionWorkflow`) ·
`src/core/save.ts:261-288` (V13 envelope), `:4638-5076` (twelve converters) ·
`ui/src/engine/adapter.ts:2135-2147` (`advanceWeek`), `:2192-2212` (batch doctrine),
`:2213-2223` (`SimStopReason`), `:2225-2246` (`SimResult`), `:2247` (`SIM_CAP`),
`:2250-2470` (loop + priority), `:2473-2520` (`simStopMessage`), `:5555-5640` (presence mirror) ·
`ui/src/App.tsx:2476-2545` (`handleAdvance`; release-week playback hole at `:2524`),
`:2608` (`handleSimToEvent`) ·
`ui/src/lot/tycoon/playback.ts:1-35` (law-as-code + constants), `:71-97` (arc-length),
`:127-167` (`personPositionAt`) ·
`ui/src/lot/tycoon/playback.test.ts:37-141` ·
`ui/src/lot/tycoon/TycoonScene.ts:344-346` (`PresencePlayback` type), `:2600-2605` (law-3 guard),
`:3164-3232` (play/skip/update), `:3359-3363`, `:3425-3438` (skip inputs), `:3574-3576` (reduced
motion), `:3630` (update wiring) ·
`ui/src/lot/StudioLotScreen.tsx:4382-4406` (one playback per advance) ·
`ui/src/lot/StudioLotView.ts:603-612` ·
`ui/src/lot/snapshot/StudioLotSnapshot.ts:429`, `:485` (presence mirror + `beatsPerWeek`) ·
`ui/src/lot/snapshot/nextEvent.ts:24` (`Exclude<SimStopReason,'release'|'limit'>`) ·
`ui/src/determinism.test.tsx:126,151` · `tests/replay.test.ts:1-18` ·
`tests/presence-determinism.test.ts:1-6` · `ui/src/flags.ts:1-52` (five reversible gates).

**Docs (this worktree).**
`docs/c2-planning/00-C2-PLANNING-BRIEF.md` (binding brief) ·
`docs/SHIFT-OPERATIONAL-LAWS.md:5-11` (laws 1-3), `:52-57` (18-19), `:62-64` (22), `:65-69` (23),
`:92-96` (28), `:99-101` (stale V11 trailer) ·
`docs/LESSONS-LEARNED.md` entries BN (≈1934-1946), DB (≈2478-2486), EW (≈3222-3232), EX (≈3234-3240) ·
`docs/WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md` (whole; `:307-311` out-of-scope) ·
`docs/WORLD-FIRST-LOT-NATIVE-NEXT-EVENT-CADENCE-REACTION-V1-CONTRACT.md:1-104`, `:918`, `:1013`,
`:1024` · `docs/HANDOFF.md:450`, `:1474-1481` (canonical time model) ·
`CODE-MINING-LEDGER.md:17-95` (CorsixTH donor, MIT, clean-room ruling, beats-inside-tick proposal) ·
`TYCOON-WORLD-CONVERSION-LOG.md:203-232` (M3-UI frozen target), `:388-419` (keep record + red team),
`:404` (queues latent) ·
`LOT-CONTENT-EXPANSION-LOG.md:578-584` (seal gates, 241 files / 3,318 tests) ·
`THE-MOVIES-PARITY-MASTER-PLAN.md:276-296` (§7.2 C2 scope, "shooting-week theater"), `:350-364`
(§8.2 headline acceptance), `:130-160` (§4 systems below parity).

**Corpus (`/Users/bruce/Desktop/Big Swing Art`, read-only).**
`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:132` (one continuous timeline), `:1043` (Instant
Movie-making toggle), `:1071` (player-controlled production pause), `:2470` (1920 start, 5-year
cycle), `:2488` region (Timeline HUD, manual p.5), `:2649` (Date/Pause/Play/Fast-Forward, P key,
manual p.5/p.10), `:2753` (shooting in real time, pipeline stage 3), `:3357` (core-loop parity row) ·
`PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md:168` (creative timing separate from the sim clock).

---

*End of docket. The Owner rules; this document does not.*
