# CAMPAIGN 2 — IMPLEMENTATION LOG & LIVE HANDOFF

> Standing purpose: any session (or any successor PM) can resume C2 from this file
> alone. Updated at every milestone checkpoint and every accomplishment once Owner
> usage nears its cap (Owner directive, 2026-08-18). Keep entries compact:
> state → evidence → next action.

## Authority chain (read in this order on resume)

1. `CAMPAIGN-2-SETS-THROUGHPUT-CHARTER.md` (r3.2, root of this branch) — the frozen law.
2. `docs/c2-planning/00A..00F-*.md` — Owner rulings (00E = all GO-sheet decisions RULED;
   00F = GO order: Movie #2 gate, professional tycoon floor, Builders directive).
3. `docs/c2-planning/01..16-*.md` — evidence lanes (15 = multi-role audit, 16 = placement sweep).
4. This log — what actually happened.

Branch: `c2a-implementation` (from canonical main `c0c9561`; PF1 sealed KEEP).
Worktree: `/Users/bruce/The Movies - C2 Planning` = planning (frozen);
`/Users/bruce/The Movies - C2 Implementation` = live implementation.
Owner acceptance (north-star): *"I built this movie studio, it operates while I
watch, my writers create pictures, and I can physically watch multiple films
compete for real production resources."* P0 seal gate: **Movie #2 without
guessing** (WHAT HAPPENED / WHY IT MATTERS / WHAT DO I DO NEXT at every stage).

## Operating lessons (bind future dispatches)

- **API burst failures are real**: three incidents on 2026-08-18 killed agents in
  same-second clusters (at spawn AND mid-run). Detection: transcript stops growing
  / ends on a malformed no-model-id message. Response: adopt-and-recover — attribute
  the dead lane's dirty files, spawn a recovery agent with the original scope + the
  adoption instruction + hard do-not-touch lists for live lanes' files.
- **Git discipline**: lanes stage explicit pathspecs ONLY (an M0 lane's `git add -A`
  swept three other lanes' files into its commits — content intact, packaging wrong).
- **Full vitest must run alone, unpiped, redirected to a file** (concurrent load
  produced 28 phantom failures at M0 integration).
- One writer per shared surface, serialized per milestone
  (`App.tsx`/`StudioLotScreen.tsx`/`adapter.ts` + whatever the wave assigns).

## M0 — ACCEPTED (Owner, 2026-08-18)

HEAD `f7e426b`. Landed: FOUNDING_* TUNING hoists; `src/core/productionPhases.ts`
(phase machinery single-sourced, blocker table derived); `src/core/occupancy.ts`
(`occupiedResourceSlots` union producer, all nine §3.2 traversals subsumed,
fail-closed cross-owner invariant, kind-qualified runtime keys); sticky
reservations for every capability (R-1 repair). Five contract suites (23 tests)
in `tests/contracts/`. E0 baseline: C1 economy figures reproduced byte-identically;
**D-17B verdict CONTAINED**. Doc repairs landed. Multi-role audit (00F): verdict
**NO duplication possible**, fifteen seat pairings pinned; residuals routed
(R3 audition payoff → M2 SCREENS; R4 refusal voice → pulled forward into M2a).
Floors at baseline: tsc×2 clean; vitest 269f/3,802+5; Playwright 209/4/0 (16.4m).
Final M0 vitest at `f7e426b`: expected 275f/3,852+5 — the last clean solo run's
log is `/tmp/c2a-m0-vitest-final.log`.

## M1+M2 — LANDED (wave `wf_66f46b6d-0b2` + two recovery agents); checkpoint 2026-08-19

Wave design: Phase 1 parallel [ENGINE-M1 complete V14+studioEvents+wrap event;
WORLD-M2a dynamic N-stage identity + stage bakes + plate fallback; SCREENS-M2a
audition payoff + refusal voice seam; TESTS-M1 T9 matrix + event pins; SWEEP-M2
placement sweep] → Phase 2 ENGINE-M2 (blueprint slate, SET_TYPES, sets machinery,
binding, wired stat block, ground per sweep) → Phase 3 [SCREENS-M2b package/
greenlight set surfaces; WORLD-M2b set world presence] → Phase 4 integrator
(floors solo, FMJ unmodified, migrated-save-greenlight gate, new legibility
Playwright spec, full Playwright kicked in background).
INCIDENT: tests-m1 + screens-m2a died 19:54 (burst); recovery agents adopted
their partial work (tests: `tests/contracts/_v14Contract.ts`,
`tests/v14-migration.contract.test.ts`; screens: TalentPicker/common/
LotCastingReviewPanel/Assembly + `ui/src/presentation/auditionEvidence.ts`,
`refusalVoice.ts`) on the original ownership sets.

CHECKPOINT (integrator INTEGRATE-M1M2, HEAD `4ef9297`): root tsc 0 · ui tsc 0 ·
FULL vitest **296 files / 4,126 passed + 5 skipped / 0 failed** (solo, unpiped —
/tmp/c2a-m1m2-vitest.log). M1 gate green by name (M0A corpus byte-identical and
untouched since Phase 4; dual-run equality; parity; T9 30/30 + frozen-builder
corroboration adjudicated). M2 gate green except the human visual review (open,
Owner's) — incl. the in-browser legibility spec (0341df5): package names the
bound set with quality/novelty/condition/fit + projected uplift and priced
remedies; a THIRD SOUNDSTAGE built end-to-end in a real browser renders,
inspects, and speaks. Sweep verdict: north-back-lot spur DROPPED; ceiling = two
additional 4×4 stages on existing ground; support buildings ≤3 cells wide.
Playwright FLOOR CONFIRMED: full serialized rerun 202 passed / 4 skipped, plus
the 2 'did not run' entries diagnosed as real V13-era pin failures and fixed
tightening-not-weakening (writerIds asserted exactly = [writerId] in
studio-home-v1; CATALOG_IDS widened to the nine the engine publishes in
tycoon-build-catalog-v1) — both green in isolation; floor = 204+4 green/215. CARRIED ITEMS: (1) OWNER RULING NEEDED — scenery load-in + shooting-take
affordances are sealed to Soundstage 7 by accepted D1-B specs; a third stage gets
neither; suggested landing: M4's queue/intervention surface. (2) next-event
rail's two-value location vocabulary (LotNextEventRail.tsx:295 / App.tsx:3118) —
G12 landmine once a built stage must be named; fix spec recorded by WORLD-M2a;
needs the App writer token (M4/M5). (3) Human visual review of the new bodies/
badges (no canvas digests exist — mandatory gate, Owner's eyes). (4) Stale V13
literals in ui/src/engine/film-chronicle-adapter.test.ts:279 +
d17-save-migration.test.ts (2 sites) — one-line V14 re-tags, engine-test owner.
(5) E2/figure-19 must A/B the set uplift on byte-identical rngState (endowed
house set = +4.70 craft neutral-fit; factor 1.00 first use).

CHECKPOINT (UI-M3, HEAD `38a29f8`): **M3's fantasy is on the screen.** The
commission form has two supplies — adapt a market premise, or COMMISSION AN
ORIGINAL (genre + creative shape + one of the studio's own writers) — and it
states the writing weeks from `scriptDraftWeeks` BEFORE the commitment
(`00E`.9). The exhaustion story is inverted: the Writers Room door stays open on
a bought-out market and the blocker's remedy is a button beside the sentence
that offers it. The title moment lands twice — "‹Writer› is writing ‘T’" on the
board while the draft is out, "‹Writer› delivers ‘T’" at the Lot review when it
comes in — and RENAME is one field and one button, with "Written as ‘T’" kept
beside the new title because two frozen-history surfaces keep the old one
forever by design. Provenance ("An Original Screenplay by ‹writer›") is on the
board, the review, the package and the Chronicle; the package's M2 set panel
gains "The script calls for ‹Location›" from the blueprint's beats, advisory and
never a blocker. Pooling ships (the engine shipped `assignScreenplayWriter`) and
offers only writers the engine actually accepts, each labelled with the week
that successor carries. root tsc 0 · ui tsc 0 · FULL vitest **305 files / 4,205
passed + 5 skipped / 0 failed**. Playwright FLOOR: **207 passed / 4 skipped / 2
did not run / 4 failed of 217** — the four red are exactly the four carried
pre-existing failures (lot.spec.ts:500 + publicity-campaign-v1.spec.ts:296
viewport geometry; recap.spec.ts:80 + stage7-production-detail-handoff-v1.spec
.ts:198 stale V13 literals). ZERO new failures; the new legibility spec
(`c2a-m3-renewable-screenplay-v1`) is green in the floor and in isolation.
CARRIED: (6) `canStart` is one answer to two questions — the read model should
publish `canStartOriginal` and scope the `no-concepts` blocker to the market
path (engine, M4/M7; the UI scopes it in one shared predicate meanwhile).
(7) an ORIGINAL commission has no Lot witness card: that card is keyed to a
market payload it cannot have — additive follow-up, no engine work. Both are
written up in `docs/c2-planning/17-m3-records.md` §8.

## M5 — IN PROGRESS (lane ENGINE-M5; started 2026-08-19)

Lane ENGINE-M5 owns `src/core/**`, `ui/src/engine/adapter.ts`,
`ui/src/lot/snapshot/nextEvent.ts`, `ui/src/presentation/**`, `tests/**`.

- **`simStopFor` EXTRACTED + the `wrap` member LANDED** (§4.1 LL EX, §4.3-M5).
  The per-tick ladder left the inline batch loop and became
  `simStopDetailWith` / `simStopDetailFor` / `simStopFor(before, after)` in
  `adapter.ts`; `advanceWeek` now returns `stopReason` + `stop` (the single-week
  path returned NO stop reason before, which is why the scheduler had nothing to
  consult); `advanceToNextEvent` consumes the SAME function — the ladder exists
  once. `SimStopReason` gained `wrap` at the charter's exact position (after
  `productionDecision`, before `constructionCompleted`), detected from the
  engine's own Tier-D `wrapped` row by sequence (`seq >= before.nextSeq`) so the
  legacy/headless path is silent by construction. Named required work all
  landed: the `simStopMessage` wrap arm ("Stopped at Week N: principal
  photography wraps on ‹TITLE›." — the G12 `default:` guard sentence is gone),
  the `EXACT_STOP_REASONS` entry, the `targetFor` arm (target = the stage the
  picture wrapped on, body derived from `lotStageIdentities`), and COMPILE-TIME
  never-guards on BOTH switches plus a totality proof on the exact-reason list.
  PF1's two cue-grammar teeth fired exactly as the appendix predicted; the
  reserved wrap tier slot is filled: **tier 2, `completion`, `emphasis`** (tier 1
  is "reserved and small" and wrap is NOTIFY-class under §4.1 — a held beat would
  stop a loop the charter says must keep running). New suite:
  `ui/src/test/contracts/sim-stop-ladder.contract.test.ts` (9 tests).
  Evidence: root tsc 0 · ui tsc 0 · ui project **183 files / 2,484 passed + 5
  skipped / 0 failed**; `tests/acceptance-corpus.test.ts` green (M0A corpus
  byte-identity untouched).

- **LOAD-IN HAS A DISTANCE** (§4.2, Owner-signed §18 item 8). New pure module
  `src/core/sceneryLoadIn.ts`: `facilityBodyCentre` (authored structures, then
  placements; law-12 silence for a facility no body stands for), `gridDistance`
  (Manhattan), `sceneryLoadInWeeksForDistance` (`BASE + floor(d × PER_DISTANCE)`,
  clamped to `[BASE, MAX]`), and `sceneryLoadInFor(state, workflow, week)` which
  returns a derived load-in or a STATED withholding. TUNING gained
  `SCENERY_LOAD_IN_WEEKS_BASE 1 / _PER_DISTANCE 0.1 / _MAX 5`, each with the
  measurement behind it written at the constant. New tick step **0.7 THE SCENERY
  REACHES THE STAGE** (`arriveDueScenery`) ends a load-in with no player input;
  `clearSceneryLoadIn` is REFUSED while the trucks are on the road.
  **Nothing is persisted — V14 gains no field** (the anchor is the already-
  persisted `bindings.heldSinceWeek`).
  MEASURED at this HEAD: shop body (19,18), Stage A (18,3), Stage B (18,10) →
  16 and 9 cells → 2 and 1 weeks, against a **two-week head start** (rehearsal +
  the entry advance, since the scenery is called when the STAGE is taken). Both
  founding stages therefore arrive on time and **nothing already measured moves**.
  A shop on the West Lawn is 25 cells from Stage A → 3 weeks → one week of a
  company standing on a bare stage. Widest trip on this lot ≈43 cells → 5 weeks.
  **THE RE-PROOF BUDGET IS ANSWERED BY A RULING, NOT A RE-PIN** (report this to
  the Owner): the grandfather line is `bindings.requiresSetBinding === false`,
  which the V14 migrator ALREADY mints for every in-flight workflow with its
  reason stated in `save.ts`. Every migrated save is therefore grandfathered by
  construction — **the four SHA-256-pinned Scenery Load-In V1 fixtures do not
  move, `WorldFirstSceneryLoadIn.test.tsx` is unmodified, and the T9 matrix is
  untouched.** New suite `tests/c2a-m5-scenery-load-in-layout.test.ts` (18 tests)
  incl. bounded terms, monotonicity, purity, save-neutrality, the non-vacuous
  arm (a distant stage genuinely stalls and the ENGINE ends the wait), and the
  three grandfather arms. Evidence: root tsc 0 · ui tsc 0 · core **131 files /
  1,799 passed / 0 failed** · ui **183 files / 2,484 passed + 5 skipped / 0
  failed**.

- **`studioWeekTheater(state)` — THE PLANT, AS BEAT TRACKS** (§4.2). New pure,
  save-neutral, zero-RNG projection `src/core/studioWeekTheater.ts`, built to
  `presence.ts`'s header law (quoted in its own header). Presence answers WHO is
  where; this answers WHAT THE PLANT IS DOING, over the engine's own ten-beat
  week. Nine subjects, each with exactly one authority behind it:
  `scenery-in-transit` (the §4.2 load-in, with weeksRemaining + distance),
  `stage-hot` / `stage-dark` (soundstage reservations, or their total absence),
  `set-mounting` (a set's own status + clock), `set-struck`, `wrap-clearing`
  (the Tier-D rows), `company-waiting` (the blocker's own words),
  `queue-waiting` (names no picture — §5 pin 3 forbids it), and
  `construction-progressing`. Beat vocabulary `idle|travel|working|waiting|
  clearing`; the track is BEATS, never milliseconds, so the renderer plays the
  same track at 1×/2×/4× without the track changing.
  **THE LEDGER WINDOW IS PER KIND, and this is a real finding**: `tick` stamps a
  row with `currentTick` and THEN increments the clock, so an ENGINE-written row
  (`wrapped`) carries `market.tick - 1` once the week settles, while a
  COMMAND-written row (`setRetired`) carries the settled week itself. Reading
  both with one rule shows a wrap a week late or a strike twice. → CARRY: the
  shipped `lotWeekEvents` (adapter ~6510) filters `row.week !== state.market.tick`
  for `wrapped` rows, so its wrap events appear to be unreachable in a settled
  state. Not touched by this lane (a shipped M1/M2 surface); recorded for the
  surface owner.
  Plumbing: `studioWeekTheaterView(state)` in the adapter (copies field for
  field, joins ONE display string — the picture's title — and carries the
  withholdings verbatim), `LotWeekTheater`/`LotTheaterSubject` types beside
  `LotPresenceProjection`, and an additive `weekTheater?` on the lot snapshot,
  populated in managed mode and absent in legacy on exactly presence's terms. It
  shares presence's `staticBeat`, so the people and the work they are inside of
  can never describe two different instants.
  Suites: `tests/c2a-m5-studio-week-theater.test.ts` (17) +
  `ui/src/test/contracts/week-theater-mirror.contract.test.ts` (5).
  FULL vitest at this point: **316 files / 4,305 passed + 5 skipped / 0 failed**
  (`/tmp/c2a-m5-full-2.log`), root tsc 0, ui tsc 0.

- **DETERMINISM, PROVEN** (§4.1 / `08A`).
  `ui/src/test/contracts/m5-determinism.contract.test.ts` (7 tests): same seed +
  same action script → identical stop sequences, identical theater tracks week
  for week, and byte-identical exported saves; **hand-advanced vs batch-skipped
  twins export BYTE-IDENTICAL saves at the same week**, with the batch arm
  asserted NON-VACUOUS (≥2 genuine multi-week skips). The remaining two arms of
  08A's four-way parity (the living loop at any speed, paused/resumed) are
  OPUS-TIME's and reduce to this one, because the scheduler commits the identical
  `advanceWeek` a manual press commits. LEGACY SILENCE pinned directly: over 40
  weeks a legacy world produces no theater subjects, no wrap stops, an absent
  `weekTheater`, and `studioEvents.nextSeq === 0`; the batch verb never mints a
  wrap there either. `tests/acceptance-corpus.test.ts` (M0A byte-identity) green
  throughout.
  **LANE TOTAL at this point: root tsc 0 · ui tsc 0 · FULL vitest 317 files /
  4,312 passed + 5 skipped / 0 failed** (M4 floor was 312 / 4,256 + 5).

### ENGINE-M5 handoff — what the next lane needs (2026-08-19)

**Everything ENGINE-M5 owed is landed and pushed.** Branch `c2a-implementation`,
seven commits: `6f2eff4` (ladder + wrap), `33fe1e5` (load-in distance), `d132c20`
(theater), `df00239` (determinism), `d80af53` (this handoff), `087a9e9` (one
operations root per tick step), `e1cbdef` (the wrap receipt proven end to end).
Resumable from Git alone.

**FLOORS AT THE LANE'S HEAD.** root tsc 0 · ui tsc 0 · FULL vitest **317 files /
4,313 passed + 5 skipped / 0 failed** (solo, unpiped — `/tmp/c2a-m5-full-final
.log`; M4's floor was 312 / 4,256 + 5). FULL Playwright, whole floor, serialized,
measured at `d80af53`: **215 passed / 4 skipped / 0 FAILED of 219 (18.4m)** —
`/tmp/c2a-m5-pw-full.log`. Identical to the M4 floor: **zero new failures, zero
regressions**, including the whole `lot-native-next-event-v1` spec (the stop
ladder's own browser surface, 20 tests) and both golden paths. The two commits
after that measurement are a provable no-op inside one tick step and a new test.

**FOR OPUS-TIME (the scheduler).** `simStopFor(before, after): SimStopReason |
null` and `simStopDetailFor` are exported from `ui/src/engine/adapter.ts`;
`advanceWeek(state)` now returns `{ ..., stopReason, stop }`. Consume THOSE. The
ladder is never re-implemented in React (§4.1 LL EX), and `simStopFor` never
returns `limit` — the 520-week guard is the batch verb's alone. The PAUSE/NOTIFY
partition is the scheduler's to apply over these values; `wrap` is NOTIFY-class.

**FOR OPUS-WORLD (the renderer).** `studioLotSnapshot(state).weekTheater` carries
the whole projection: nine subject kinds, each with `beats` (exactly
`beatsPerWeek` entries from `idle|travel|working|waiting|clearing`), the facility
and its ENGINE name, the picture and its TITLE, `weeksRemaining`, `distance`, and
the engine's own `reason`. `staticBeat` is shared with `presence`. Withholdings
carry their reason. `studioWeekTheaterView(state)` is the same value without the
snapshot.

**FINDINGS AND CARRIES (M5):**
1. **LADDER RANK — `wrap` outranks `cashNegative`.** §4.3-M5 places `wrap`
   immediately after `productionDecision`, so on a tick where a picture wraps AND
   cash crosses below zero, the reported stop is `wrap`. `cashNegative` fires only
   on the CROSSING, so it is not reported again. This hazard is NOT new — the
   shipped ladder already put `runCompleted` above `cashNegative` — but the living
   loop makes it matter, because `wrap` is NOTIFY (keep running) and `cashNegative`
   is PAUSE. Implemented as the charter states it; **the Owner/PM should rule**
   whether PAUSE-class stops should outrank NOTIFY-class ones inside one tick.
2. **`lotWeekEvents` may never see a wrap.** `studioEvents` stamps ENGINE-written
   rows with `market.tick - 1` (the sink is built with `currentTick` and the clock
   then increments) and COMMAND-written rows with the settled week. The shipped
   `lotWeekEvents` (adapter, `row.week !== state.market.tick`) uses one rule, so
   its `wrapped` branch looks unreachable in a settled state. `studioWeekTheater`
   uses two rules, each naming its producer. Not touched here (a shipped M1/M2
   surface, and not this lane's named work) — routed to its owner.
3. **`SCENERY_LOAD_IN_WEEKS_PER_DISTANCE` is a BALANCE dial, deliberately set so
   nothing already measured moves.** At 0.1 the founding lot's two stages are
   supplied on time (2 and 1 weeks against a 2-week head start). Raising it makes
   the founding lot itself feel distance and re-prices C1/C2 figures → an Owner
   decision with M7's remeasure behind it.
4. **Four UI arms were landed cross-boundary** as the forced consequence of
   widening a closed union (`App.tsx` deep hop, `LotNextEventRail` identity line +
   target key, `StudioLotScreen` reason detail + deep label). Minimal and in
   filmmaking voice; richer staging is OPUS-SCREENS'/OPUS-TIME's.
5. **Human visual review is still open** (no canvas digests exist) — the theater's
   tracks have never been drawn.

### Lane UI-M5 — THE LIVING TURN SCHEDULER + THE LIVING LOT (started 2026-08-19)

Lane UI-M5 owns `ui/src/**` (except `adapter.ts` / `nextEvent.ts`, ENGINE-M5's and
finished) + `ui/e2e/` additions.

- **THE PARTITION, THE SPEEDS AND THE VOICE — `ui/src/lot/livingTurn.ts`** (`f1c9a05`).
  The scheduler stated as a value before anything consumes it. The PAUSE/NOTIFY
  partition is a TOTAL switch over `SimStopReason` with a compile-time `never`
  guard (a future engine member is a compile error, not a silent default); `limit`
  belongs to neither published class and is named separately. The speeds derive
  from the SHIPPED playback constants and are never re-declared — 1× IS
  `PLAYBACK_DURATION_MS` (10.35s, nine beats), 2× and 4× divide it. The attention
  channel's copy is built only from the engine's own stop payload and deliberately
  never says "Stopped at Week N": under NOTIFY nothing stopped. The week clock
  retains a FRACTION, so 1× → 4× half way through a week leaves half a week at the
  new pace. 28 tests.

- **THE LOOP, WIRED END TO END** (`65e4e70`). While unpaused on the Lot: play week
  N as witnessed time → commit **the identical `handleAdvance` a manual press
  commits** → consult `advanceWeek(...).stopReason` → repeat. ONE clock, owned by
  the surface that draws the week (`StudioLotScreen`), freezing with the renderer
  (`document.hidden`, PF1 §0.7) and while a decision surface holds the world.
  **THE RELEASE-WEEK PLAYBACK HOLE IS CLOSED**: `App.tsx`'s gate read
  `released.length === 0 && lot` — both conditions — so the shipping week never
  played; the lot arm is now unconditional and the release surfaces take over when
  the played week settles. A week that could not be played reports so AT ONCE, so
  reduced-motion / canvas-less studios keep today's behaviour exactly.
  Transport in the topbar (Hold/Roll + 1× / 2× / 4×), compacting to its marks below
  the governed breakpoint on the PF1-M4 addendum-2 pattern. `TycoonScene` gained
  `setPlaybackSpeed`; above `PLAYBACK_WITNESSED_BEAT_SPEED_CEILING` (2) the Class-B
  beats collapse through the existing reduced-motion path.
  11 App-seam tests, EVERY expectation measured off a hand-advanced twin: twelve
  hands-off weeks byte-identical, four weeks at 4× inside one 1× week
  byte-identical, auto-pause at exactly the hand-advanced PAUSE-class week, a
  hidden tab that advances nothing, the release week witnessed first.
  Floors: root tsc 0 · ui tsc 0 · ui **187 files / 2,536 + 5 skipped / 0** · core
  **132 files / 1,816 / 0** (319 / 4,352 + 5 together; ENGINE-M5 left 317 / 4,313 + 5).

- **THE PLANT, ON THE GROUND + EVERYONE HAS A REASON TO BE THERE** (`8238b62`).
  `ui/src/lot/snapshot/weekTheater.ts` answers the last question before
  `studioWeekTheater` can be DRAWN — where on the property each fact stands —
  through the same authorities every other lot surface uses (derived stage
  identities, the frozen founding scenery vocabulary, the placement projection).
  **Law 12 kept**: a fact about a facility no body stands for is dropped, never
  painted onto a convenient building. The scene gained ONE ground layer
  (`tier:week-theater`): working light from a hot stage, the ring a wrap is
  clearing out of, flats stacked mounting-left / struck-right, and freight.
  **FREIGHT TRAVELS, IT DOES NOT TELEPORT** — a haul's position is the ENGINE's
  own `weeksRemaining` against the trip the engine sized, and across a played week
  it eases from LAST week's authoritative position to this one (law 2:
  interpolation between two engine facts, deciding nothing).
  **THE QUEUE, WORLD-NATIVE, BOTH OPTIONS (r3.1)**: Option A the floor — a Call
  Board placard per contended body carrying the picture and the engine's own
  Remedy sentence VERBATIM (never re-worded, never an id); Option B the committed
  §18-item-8 target — the BACKED-UP LOT, one freight element per waited week on
  the apron, capped at 6 so the pile stays a signal, under a named 24-element
  draw budget.
  **GROUNDED AMBIENT ACTORS** (§4.2, `00C`.6): the eight patrols each claim an
  authoritative fact and may only stand on the property when it is true (freight /
  a hot stage ×3 / a running campaign / the studio operating / a company standing
  by / a build progressing). Zero new art, zero new actors, zero new routes — a
  live law-9 violation became an exemplar. Where there is NO authority (legacy, no
  `weekTheater`) nothing is claimed and all eight keep shipped behaviour: a
  withheld projection is not evidence a studio is idle.
  13 tests over real engine state, two of them non-vacuity proofs.

- **THE BROWSER PROOF + THE RE-PIN** (`bdb43ae`). `ui/e2e/c2a-m5-living-turn-v1
  .spec.ts`, on the shipped grid origin, reduced-motion, all telemetry
  (`data-week` / `data-mode` / `data-paused-by`) and no stopwatch. Two fixtures,
  both built through public actions and proven to replay byte-identically first:
  (1) a picture in theatres with TWELVE weeks proven quiet by a hand-advanced twin
  — one press, then 4× covers four weeks in one 1× week, then Hold holds through
  six 4× weeks; (2) a picture in flight run at 4× lands on exactly the week the
  twin says it owes a PAUSE-class stop, BY ITSELF, with the engine's own reason,
  and stays stopped. **2 passed (1.0m).**
  **RE-PIN (five rules).** The four grid structural tuples move **231 → 232**
  display objects and nothing else, measured at HEAD: +1 is `tier:week-theater`,
  one shared VECTOR layer created with the other overlays exactly as
  `tier:presence-queue` and `tier:guidance-marker` were; decoded bytes and draw
  calls do not move (no texture, existing pipeline); and **dynamic actors do not
  move at 14 — the load-bearing NON-movement**, because grounding the patrols
  changes what is VISIBLE and this counter counts what EXISTS. Both worlds keep
  their own numbers: the plate tuples are a different world and did not move.

## M4 — LANDED (lanes ENGINE-M4 + SURFACES-M4); integration checkpoint 2026-08-19

CHECKPOINT (INTEGRATE-M4, HEAD `b600ca2`): **the two-film cap is gone, and
throughput is what the player physically built.** `MAX_CONCURRENT_PRODUCTIONS` is
DELETED, never raised (owner law 1). The three front doors — greenlight,
commission, casting start — ADMIT what they used to refuse and queue it holding
nothing; a completed phase RELEASES even when the next resource is unavailable
(`00E`.5); the weekly sweep is a fixed-point pass, so a room freed by anyone is
visible to every waiter the same week. root tsc 0 · ui tsc 0 · FULL vitest
**312 files / 4,256 passed + 5 skipped / 0 failed** (solo, unpiped —
`/tmp/c2a-m4-vitest.log`). FULL Playwright floor, re-measured whole (18.0m, `/tmp/c2a-m4-playwright.log`):
**215 passed / 4 skipped / 0 FAILED of 219** — the floor law met, and the FIRST
whole-floor certification since M3 deferred it to M4 integration (M3 measured
207/4/2-did-not-run/4-failed). Both golden paths green; the M4 browser gate
(`c2a-m4-throughput-queue-v1`, F4 + G16 on the 5179 grid origin) green.

**G10.1 — THE CAMPAIGN'S REAL ACCEPTANCE TEST: PASS, 5 of 5 seeds** (bar: 4 of 5).
Recorded in `docs/economy/C2-E2-THROUGHPUT.md`, generated by
`scripts/measure-c2-throughput.mts` (two runs at one HEAD diff clean), enforced by
`tests/c2a-m4-g101-throughput.test.ts`. It was NOT runnable when the two build
lanes handed over, and the reason was the instrument, not the engine: every
facilities-observatory policy wanted at most two pictures and
`targetActiveProductions` was TYPED `1 | 2` — the deleted cap wearing a type's
clothes. Measured through it, a purchased slot stays inert BY POLICY whatever the
engine does. The type is widened and `scaled-four-team` authored as
`scaled-two-team` DOUBLED (4 directors / 4 craft / 12 actors / pipeline 8), which
is the only change that answers the question G10.1 actually asks.

| Policy | Seeds where a purchased D&C slot moved releases or cash | Verdict |
| --- | --- | --- |
| `scaled-two-team` (C1's policy) | 2 of 5 | FAIL |
| `scaled-four-team` (M4's arm) | **5 of 5** | **PASS** |

**Peak simultaneous productions: 4**, measured — a number that could not have
exceeded 2 on any seed or horizon while a global counter existed. THE PAIR IS THE
FINDING: at `scaled-two-team` the same engine still leaves the slot inert on 3 of
5, because that policy declines to spend it. The ceiling was never the only thing
that had to move; something had to WANT the pictures. What the slot buys, stated
honestly: 20.8 fewer D&C refusals per two-year run, and cash swings in BOTH
directions (3 of 5 seeds richer with +1, 2 of 5 with +2) — C1's "more throughput
is not more money" lesson, now across the corpus instead of on one seed. A PM
finding; no tuning value proposed or changed. The three pre-C2 policies are
byte-unchanged, so every C1/E0 figure still reproduces (facilities + roster-wall,
80 tests).

**DECLARED, because it would otherwise be discovered later: THE E0 BASELINE NO
LONGER REPRODUCES.** Same policy, seeds, horizon and arms as `C2-E0-BASELINE.md`
§2.5: releases 18.8 → 15.6, final cash $6,247,907 → $9,969,357, idle slot-weeks
89.6 → 103.2. Not M4's doing — E0's pass condition was "no figure moves BEFORE C2
has intentionally changed anything", and M2 (Sets mandatory at greenlight) and M3
(the `00E`.9 writer-SPEED law) have since intentionally changed what this study
measures through. Fewer, better-funded releases is the shape those changes
predict. The ATTRIBUTION is deliberately not claimed here and is routed to **M7's
economy remeasure**, which owns the E-gates; G10.1's verdict does not depend on it
(it compares three arms at one HEAD against each other).

**M4 GATE (§12-M4) — green, by name.** Release-law conformance (5): a wrap with
Post full puts the stage AND the set back and a waiter takes the stage the SAME
week; rehearsal→shooting retention still stands; Pre-production's slot goes to a
waiter rather than being held for a stage. N-way contention property (5 seeded
arms): acyclic wait-graph, rank monotonicity and bounded wait asserted EVERY week.
Determinism under contention, in three places (release law, admission, property).
`00E`.16 idle freight: waiting is charged nothing for a released physical
resource. G16 at the read-model level (4): all four law-2 facts non-empty for
every waiter in a seeded contended run, the HOLDER named on the blocker detail,
and only remedies the engine can actually perform. Queue admission (9): all three
front doors, dequeue revalidation with a stated reason, a queued ORIGINAL mints
nothing until granted, longest-waiting-first with an ordinal tie-break against a
GENUINE tie, and a legacy studio still refuses rather than queues. F4 + G16 in a
browser on the 5179 grid origin (`c2a-m4-throughput-queue-v1`). M0A corpus
byte-identity and both golden paths green in the whole-suite run.

**§11.8 AUDIT — four retirements, each with its named successor LANDED and the
charter item cited at the site; every re-base cited; ZERO uncited assertion
changes.** RETIRED→SUCCESSOR: `tuning.test.ts:54` → the scalars assertion proves
`MAX_CONCURRENT_PRODUCTIONS` ABSENT and `AGENT_MAX_SLATE: 2` present;
`actions.test.ts:448-485` → the third greenlight is ADMITTED (and the managed-
studio queue-row half lives in `c2a-m4-queue-admission.test.ts`);
`agents.test.ts:157-218` → both agents return [] at `AGENT_MAX_SLATE`, same
fixture; `operations.test.ts:433-541` → capacity freed mid-week is granted the
SAME week, both sweep orders now converging (that they agree IS the successor).
RE-BASED with reasons at the site: `d12-p2-calibration`, `tick`, `agents:145`,
`LotCastingReviewPanel`, `castingReview`, `d12-owner-ux` (the FoundingScreen prose
now teaches capacity-derived throughput and asserts the retired sentence cannot
return), plus `casting-sessions-actions`, `presence-scenario`, `v14-dual-run`,
`d17a-fixed-cost-allocation` and the F4 (§10) UI re-bases. Verified by diffing
every test directory across `7007363..HEAD`: no test deleted, no assertion
weakened without its charter citation.

**THE LAST TWO BROWSER REDS WERE ONE BUG, AND IT WAS A PRODUCT DEFECT, NOT A
STALE PIN.** `c1-golden-path-v1` Act 6 and `tycoon-build-catalog-v1` §3 both
clicked the Development building and hit `section[annex-completion-summary]`
instead — diagnosed with `elementFromPoint` at the exact click coordinate, not
guessed. `.lot-event-notice` is `position: absolute; z-index: 18; top: 16px; left:
50%`, dead centre over the lot, and it deliberately swallows world input so that
reading it never moves the world. Both correct; together, with no way to close it,
not: the announcement of the building you just finished covers the buildings you
want to click next, and the only escape was to advance another week. That is the
Movie #2 gate's own loop. FIXED with a close control on the OVERLAY (the shared
`ConstructionCompletionNotice` is untouched — Weekly Summary, Release Result and
the Newspaper render it inline, where it covers nothing), dismissal keyed by
`projectId:completedWeek` so putting down one building's card can never silence
the next building's. Both specs TIGHTEN: the new helper requires the card and
asserts it CLEARS, a claim neither journey could make before.

CARRIED to M5+:
(1) **CHARTER §3.3 lines 400-402 STILL CONTRADICT `00E`.5** — "a blocked
production releases nothing" against the release law §3.2 already carries. Text
repair only; the implementation on both sides follows `00E`.5. The charter is
FROZEN and this is the PM/Owner's amendment to make, not an implementation lane's.
(2) **THE WORLD-NATIVE CALL BOARD IS NOT BUILT — correctly.** Per r3.1 it is M5's
floor and §12-M4 explicitly does not staff OPUS-WORLD out of milestone.
`studioQueueView` has two consumers today (the Calendar's `StudioQueuePanel` and
the Dashboard summary); the blocked SITE still says nothing in the world itself.
(3) **THE E2 ECONOMY GATE proper is not run** — §9's E-gate ladder puts the
19-figure C2 snapshot at M7. What M4 owed was the throughput measurement, and that
is `C2-E2-THROUGHPUT.md`.
(4) Longer-horizon throughput: releases are near-flat across the arms at 104 weeks
because the binding limits there are the production pipeline and the payroll a
bigger slate carries, not the room that admits a screenplay. → M7.
(5) The four-picture arm makes some studios POORER at +2. Whether the Annex and
Hall relieve capacity PROFITABLY at their catalog prices is a balance question →
M7, with the rest of the C2 economy snapshot.

## M3 — LANDED (lanes ENGINE-M3 + UI-M3); integration checkpoint 2026-08-19

CHECKPOINT (INTEGRATE-M3, HEAD `5c1b2b8`): **a writer goes to work and hands the
studio a new movie — and the thirty-film ceiling is gone.** The player picks a
genre, a creative shape and one of their own contracted writers; the form states
the writing weeks BEFORE the commitment; the concept, its title and its
seven-beat blueprint are minted at commission-commit; the board says "‹Writer›
is writing ‘T’" while the draft is out and "‹Writer› delivers ‘T’" when it lands;
and the studio may retitle the picture without ceremony, with "Written as ‘T’"
kept beside the new name. root tsc 0 · ui tsc 0 · FULL vitest **305 files /
4,205 passed + 5 skipped / 0 failed** (solo, unpiped — `/tmp/c2a-m3-vitest.log`).

**M3 GATE (§12-M3 / G17) — green, by name.** Determinism: same seed + same
action script → byte-identical blueprints and titles; different worlds differ;
the mint advances no sim RNG (purpose key `screenplay-v1` only, derived-only).
Rename identity-stability: the display title is the only thing that moves, the
generated title survives NOWHERE in live state after a rename (which is the
proof that no surface cached a copy), and the TWO frozen-history surfaces the
charter names — `TalentCareerEvent.filmTitle` and `BroadcastItem.template` — are
asserted frozen. Append-only concepts; the `persistedConceptIds` reservation
across all six identity-bearing roots (the blueprint root joins in both
directions); the `correlateConceptCost` never-re-run regression — exactly ONE
production call site remains (`employment.ts:415`, the founding boundary) and the
regression proves re-running it WOULD move existing prices; the agent-stream
guard (a headless corpus run mints nothing — both agents × two seeds × 26 weeks,
`concepts.length` invariant). G15 era-clean beats and title leads. M0A corpus
byte-identity: `acceptance-corpus`, `replay`, `save`, `migration`,
`v14-migration.contract`, `v14-dual-run`, `roster-wall-corpus`,
`presence-determinism` and `frozen-save-builder-projection` are all green AND all
UNMODIFIED since `a0ac922` — no corpus fixture was touched by M3. LEGIBILITY,
proven in a real browser: the board carries "An Original Screenplay by ‹writer›"
and the generated title BEFORE the rename and the player's title AFTER; the
package carries the credit plus "The script calls for ‹Location›" derived from
the beats. SOURCE-FIRST spot-check against the Bible: the three recovered beat
templates are transcribed VERBATIM from §5.5 (comedy/romance/horror); Action and
Sci-Fi are recorded as unused reference shapes and consumed nowhere.

**`00E`.9 RE-BASE AUDIT — FIVE pins moved, ALL FIVE cited, ZERO silent moves.**
`tests/script-development.test.ts` (the assessment blend);
`ui/src/engine/script-assessment-parity.test.ts` (the assessment pin + four
downstream marketing/discovery figures); `tests/script-projects-save-v9.test.ts`
(a fixture helper — a tightening); `ui/e2e/c1-golden-path-v1.spec.ts` (the office
counterfactual); and `ui/e2e/lot-native-next-event-v1/manifest.json` (exactly ONE
of twelve pinned save digests). Each carries the ruling in a comment at the site
AND in its commit message (`2907c00`, `de73000`). No test file was deleted; the
four re-based test files hold the SAME test count before and after (10 / 8 / 2 /
1); every other test file touched in the range is additive-only (zero deletions).
The sealed one-week draft invariant's re-base is likewise named in place at
`scriptDevelopment.ts:1005-1019`, and the successor is STRICTER than its
predecessor in one respect — it adds `Number.isInteger`.

PLAYWRIGHT FLOOR, re-measured whole (16.7m, `/tmp/c2a-m3-playwright.log`):
**207 passed / 4 skipped / 2 did not run / 4 failed of 217** — identical to the
UI-M3 measurement, and the four red are exactly the four carried pre-existing
failures (`lot.spec.ts:500` + `publicity-campaign-v1.spec.ts:296` viewport
geometry; `recap.spec.ts:80` + `stage7-production-detail-handoff-v1.spec.ts:198`
stale V13 literals). ZERO new failures. Run by name and green in isolation:
`c2a-m3-renewable-screenplay-v1` (2), `c2a-m2-set-and-stage-legibility-v1` (2),
`c1-golden-path-v1` (1), `first-movie-golden-path-v1` (1).

CARRIED (M3): (8) THE CORPUS QUESTION ROW IS THE ONE §12-M3 SCOPE ITEM NOT
DELIVERED, and it is not merely unwritten — the row as drafted cannot be pasted
in. The file is at `THE-MOVIES-2005-ORIGINAL-DATA/ACTIVE-UNRESOLVED-QUESTIONS
.csv`, NOT the corpus-root path both M3 lanes recorded, and its real schema is
TEN columns (`question_id,system,question,status,current_best_answer,
remaining_unknown,implementation_impact,verification_method,priority,
last_updated`) against the six fields `17-m3-records.md` §5 drafted. Verified in
place: Q001–Q070, no title-generation or rename row, so the successor is `Q071`,
and `system` should reuse the file's existing `Script System` value rather than
invent one. Needs a session with write access to the corpus.
(9) FIRST-DRAFT EST UNCERTAINTY — an OWNER decision, routed, not blocking.
Removing the writer term removed the only source of actual-vs-perceived
divergence at first draft, so an EST now equals its truth. M3 may not invent a
replacement (that is precisely the compensating bonus `00E`.9 forbids), and a
rewrite still diverges them. → M7's economy remeasure or C4, with its own ruling.
(10) A RICHER DEVELOPMENT OFFICE NOW WRITES SLOWER. `officeTierAtMint` feeds
`developmentOfficeRichnessTier` into `scriptDraftWeeks`. That is `00E`.9's
"blueprint richness" term and it is NOT a strength term — verified: the only
consumers of `officeTierAtMint` are the audit record and the duration function —
so the charter's "zero new economy levers" holds on QUALITY. But a longer draft
holds a writer and a Development & Casting slot longer, which is a real
THROUGHPUT cost the office did not previously carry. Bounded to originals (a pool
concept drafts in one week unconditionally). Flagged for M7's remeasure.
CLOSED against the ENGINE-M3 handoff: its blocker 1 (the board card cannot show
provenance without a SCREENS lane) and blocker 2 (set demand not joined to M2's
package set panel) were BOTH delivered by UI-M3 — provenance resolves at the
adapter layer (`ui/src/engine/screenplay.ts`) with `ScriptProjectCardView` and
`scriptReview.ts:CARD_KEYS` untouched, and demand renders inside the M2 set
panel's own G12 guard. Neither is carried forward.

NEXT after M3: M4 (throughput: cap deletion, queues, release law), M5 (Living
Turn V1 + theater),
M6 (Premiere at the Gate), M7 (economy remeasure), M8 (seal + Owner playtest).
Budget posture: consolidate later milestones into fewer, larger sequential lanes;
gates are the verification (no separate verify workflows during implementation).

## M2 — the ENGINE half, landed (lane ENGINE-M2)

Six commits: the two authored catalogs; the life of a Set; the stage+set
composite and the wired stat block; the sets authority at the V14 save boundary;
and their test suites.

**GROUND (§3.4, the milestone's stated first task) — the spur is DROPPED, and no
ground is authored.** SWEEP-M2 published the arithmetic at
`docs/c2-planning/16-placement-sweep.md` (HEAD `f3d4313`); this lane consumed the
verdict rather than re-litigating it, and recorded its two binding findings AS
CONSTRAINTS where the blueprints land, so a later price or size edit cannot
silently invalidate the sweep:

* **at most TWO additional 4×4 soundstages** can ever stand on today's
  road-served parcels — §16a's third-stage beat and the M2 gate's stage count are
  stated against 2;
* **no support building may exceed THREE cells of WIDTH.** Only three parcels are
  four wide and the two stages take the only two available. Depth is cheap
  (`west-lawn` is 3×6); width is what runs out. A bigger support building grows
  in gy, never gx.

### Four decisions a later lane will need, and why

1. **`SET_WEEKLY_MAINTENANCE_COST` is a NAMED ZERO, on evidence, not on
   convenience.** Lane 3 §11 (TECH-SCHEMA-001) records that the original's shared
   facility/set schema carries `[finance] annualcost` and `dailyrate` and that
   **both are 0 in every example recovered**: a set costs capital once and labour
   forever, never a visible recurring cash charge. It is named, charged through
   the ordinary weekly path, and invariant-checked, so a real standing charge is a
   one-line tuning change whose path is already proven. It also happens to be what
   keeps every sealed spec byte-identical — but the reason is the corpus.

2. **Two facts about a Set are DERIVED, because V14 is the complete schema and M2
   adds no member (§8).**
   * *Which scenery slot* a set under work holds — derived in `occupancy.ts` from
     the claims every other owner is already making, then fed back to production
     allocation through `setOccupiedFacilitySlots`. The circularity breaks on
     ordering: sets read the reservations productions already hold; productions
     are then told what the sets took.
   * *Build vs repair* — `condition === 0` means, and can only mean, "this set has
     never stood". A standing set's condition can never reach 0 because
     `SET_CONDITION_UNUSABLE_THRESHOLD > SET_CONDITION_WEAR_PER_PRODUCTION` (a set
     below the threshold cannot be bound, so it cannot be worn again). That
     inequality is a bounded-term test. It is what lets a repair record **no**
     `setBuilt` row: the set was built once, and the studio's history is not
     editable.

3. **`requiresSetBinding` is scoped by `state.nextSetId > 0`.** §3.1 names four
   exclusions; three are true by construction (legacy and headless never reach the
   greenlight call; migrated in-flight workflows keep the migrator's `false`). The
   fourth — "directly-constructed test states untouched" — needs a fact, and
   `nextSetId` is it: it counts the sets a world has EVER minted, and it is 2 for
   every studio founded through `activateStudioOperations` and 2 for every managed
   save the V14 migrator lifts. Zero means no set has ever existed there, and a
   picture cannot be required to stand on a kind of thing its world has never had.
   The moment such a world commissions its first set, the counter moves and every
   greenlight after it binds. **C2b must revisit this** when the bare-lot founding
   regime lands: a bare studio starts with `nextSetId === 0` by design, so the
   regime — not the counter — becomes the authority.

4. **The soundstage blueprint's `facilityIdBase` is `facility-stage`, NOT
   `facility-soundstage`.** The frozen historical-boundary guards detect a placed
   facility by the prefix `${facilityIdBase}-`; the obvious base would have made
   the FOUNDING `facility-soundstage-07` and `-12` read as V12 placements to every
   one of them. Caught by a V11 boundary test during authoring; now asserted in
   both directions in `tests/c2a-m2-blueprint-slate.test.ts`.

### What this lane did NOT touch

`ui/**` — WORLD-M2a and SCREENS-M2 are live there. One engine change needs two
lines in files they own; it is stated as a blocker in this lane's handoff rather
than edited across a lane boundary.

## M3 — LANDED (checkpoint 2026-08-19, HEAD after closeout `b403d97`)

Renewable Screenplay Generation V1 complete: mint-at-commit ('concept-orig-NNNN' +
MovieBlueprint), generated titles (genre-keyed lead subsets, 'screenplay-v1'
stream), rename (identity-stable, proven the strong way), six 7-beat templates
(3 recovered verbatim, 3 authored-labelled), beat→set demand on the package,
pool-blueprint derivation (one path), the 30-film ceiling REMOVED (terminal
blocker → 'Commission an original screenplay'), writer-speed law per 00E.9
(quality term out, renormalised — see 17-m3-records.md §2 for the renormalisation
reading; pool drafts keep the 1-week clock, originals scale with office richness,
pooling ≤5 buys time only). Gate green by name; FULL vitest 305f/4,205+5/0.
00E.9 re-base audit: five pins, all cited. Q071 filed in the corpus register.
CLOSEOUT: the four pre-existing e2e reds fixed (recap V13→V14 re-tag; Stage 7
live-format equality with the one legitimate sceneryArrived row named; lot +
publicity = the migrated-save banner's 92.5px, dismissed via the new shared
helper which itself asserts the banner appears and clears). Checkpoint item 4's
vitest literals were ALREADY green — that entry was stale, corrected here.
FULL Playwright floor certification deferred to M4 integration (each fixed spec
green in isolation + the four together: 33 passed).
CARRIED to M4: canStartOriginal read-model split (one boolean answers two
questions); the original-commission Lot witness card (additive);
17-m3-records.md's three design questions (EST=truth at first draft → M7/C4;
price-signals-potential → future ruling; renormalisation reading → Owner FYI).
PM RULING for M4 (recorded under the Owner's delegated authority): the
Soundstage-7-sealed scenery/take affordances WIDEN to N stages in M4 with the
D1-B spec re-pins done additively (Stage-7 assertions preserved) — the Movie #2
gate demands production blocking be legible on every stage the player builds.
