# CAMPAIGN 2 — SETS, STAGES & PRODUCTION THROUGHPUT + THE FOUNDING FLIP
## CAMPAIGN CHARTER (FROZEN FOR OWNER GO)

> Status: **IMPLEMENTATION-READY, awaiting the Owner's explicit GO.** Prepared by the
> Fable C2 Architect session of 2026-08-18 under the Owner launch order
> ("PROJECT: STUDIO — C2 ADVANCE PLANNING") while PF1 is in flight elsewhere.
> Branch **`c2-sets-throughput-plan`**, worktree `/Users/bruce/The Movies - C2 Planning`,
> base = sealed C1 `main` @ `f294077`. Nothing in the PF1 worktree or branches was touched.
>
> Evidence: twelve dedicated Opus recon lanes over the engine, the UI, the governing docs,
> and the original-game corpus, committed as `docs/c2-planning/01..12-*.md` (~11,500 lines,
> every load-bearing claim carrying file:line or corpus citations, tagged
> [CODE]/[CORPUS]/[DOC]/[PROPOSAL]). Six of the most load-bearing engine claims were
> independently re-verified by the architect against the tree before freezing. The Owner's
> mid-planning time-model ruling is recorded verbatim in
> `docs/c2-planning/00A-OWNER-RULING-TIME-MODEL-2026-08-18.md` and reconciled in
> `docs/c2-planning/08A-TIME-MODEL-DOCKET-ADDENDUM.md`.
>
> **PF1 interlock:** this charter assumes the canonical PF1 charter as the delivered
> baseline (read by the architect this session) and states robustness per milestone if a
> PF1 milestone is KILLED (§17). C2 does not start until PF1 seals and the Owner says GO.

---

## 1. Mission

**Player feeling:** *"I built this movie studio, and I can physically watch it
manufacture multiple movies."*

C2 makes production throughput physical and visible: Stages the player builds, Sets the
player builds and dresses them with, a real reservation economy over them, queues that
wait honestly where refusals used to lie, an authoritative wrap that releases capacity,
a living lot that runs while the player watches, Premiere Night at the Theater — and
then, as its own sub-campaign, the Founding Flip: a fresh studio that starts from
Gate + Administration and builds the filmmaking operation itself.

**Owner laws governing this campaign (2026-08-18 launch order + time-model ruling),
restated as the charter's constitution:**

1. Concurrency comes from physical capacity; the two-production ceiling is transitional.
2. When capacity is unavailable: QUEUE, DON'T MAGICALLY FORBID — the player knows what
   waits, what it needs, what occupies it, and how to relieve it.
3. Sets are real production resources: buildable, placeable, reservable, occupiable,
   genre-weighted, physically used for rehearsal and shooting.
4. Stages are player-built production capacity.
5. Engine state owns reservations and outcomes; animation is evidence only.
6. The Founding Flip is ratified; C2 performs it once every required first-movie
   facility has a legitimate build path (split into C2b if safety requires — it does, §2).
7. Premiere Night V1 belongs to C2; no movie footage.
8. Simulation theater belongs to C2; no decorative screensaver population.
9. **Living time (2026-08-18 ruling):** the final game must not depend on pressing
   "Advance Week"; simulation time flows while unpaused with pause and speed control;
   "advance to next event" survives only as convenience; deterministic Engine authority
   is preserved; C2 ships the smallest implementation proving *"I can stop touching the
   controls and my movie studio keeps operating visibly and meaningfully."*
10. **Timeline law (recorded for C4, binding on C2 schema):** campaign begins 1920, no
    hard calendar game-over, authored progression through at least 2040, plausible
    alternate-future permitted. No C2 system may hard-code the 1948 founding era or any
    terminal year.

**Honesty note the charter owes the record (lane 3):** two of these laws are deliberate
divergences from the original, not parity. The Movies (2005) had *no* soundstage building
type (its "Stage" is a pre-built generic Set — `set_catalog.csv` SET_STAGE_GENERIC;
Bible §4:691) and *no* queue (occupied sets hard-blocked in red — Bible :1069). Laws 2
and 4 are modernizations we choose on their merits; the corpus supplies shapes and
legibility patterns, never authority for these two.

---

## 2. C2a / C2b — the split is RECOMMENDED, on evidence

**Recommendation: split.** C2a = Sets, Stages, Throughput & the Living Studio
(SaveFileV14). C2b = the Founding Flip (SaveFileV15), immediately after, before C3.
One charter (this document) governs both; C2b needs no new planning pass, only its GO.

Why (lanes 4, 5): the Flip is not "worldgen minus buildings." It breaks **three sealed
engine invariants that the save validator itself runs** — the four-capability managed
invariant (`operations.ts:364-371`, architect-verified), the positional `placement-v12`
facility policy (`operations.ts:413-437`), and the single-arm
`activateStudioOperations` (`actions.ts:1273-1279`) — so a Gate+Admin studio is today
*unloadable*, not merely unbuildable. It is additionally a property re-authoring job
(vacated footprints belong to no parcel — `lot.ts:91-94`; no existing buildable parcel
holds a 4×4 stage plus clearance) and a UI campaign (386 non-test hard-coded founding
BuildingId references; frozen journey shapes with a closed validator). C2a meanwhile
delivers every blueprint the Flip needs anyway. Two bounded seals beat one unboundable
one; the master plan §6 already pre-authorized exactly this contingency.

---

## 3. Domain model — Stage, Set, reservation, queue

### 3.1 Stage and Set (the fork, ruled)

**A Soundstage is a buildable FACILITY; a Set is a first-class ENTITY; shooting requires
both.** This is the hybrid the code already leans toward (`shooting` requires
`soundstage` + `set-scenery`, `operations.ts:87`, architect-verified), the corpus
supports (facilities and sets share one blueprint/finance/maintenance schema —
`schema_fields.csv`; sets carry per-genre float weights + a priority genre —
`set_definition_schema.csv` TECH-SET-008), and both owner laws 3 and 4 name.

- **Soundstage** — a `FacilityBlueprint` with capability `soundstage`, capacity 1
  (`simultaneousProductions: 1` — every capacity field names its unit, lane 3 D4;
  the original dataset's twenty-year units ambiguity is not reproduced here). Two or
  three stage **classes** (Standard / Large), procedurally baked in the grid world
  (`bakeStage()` already exists parameterised, `assets.ts:871-894`), N instances per
  class costing one sprite each. **Never in the plate world** (laws 27a/27b).
- **Set** — a new state root `state.sets`. Stat block (corpus shape, our numbers):
  **quality** (SHOWN to the player — the original hid it and its own corpus names that
  opacity a core complaint, lane 3 D7), **novelty** (per-INSTANCE, locked at production
  bind, depleted per release — an explicit ruling, not recovered parity: the lock claim
  is single-source, and per-instance is chosen so a duplicate stage+set is simultaneously
  a concurrency and a freshness purchase), **condition** (decays; **gates use only** in
  V1 — the corpus contradicts itself on a quality penalty, Bible §7.1:1052 vs
  `movie_rating_pipeline.json` stage 2, so V1 takes the manual-corroborated gate and
  the penalty is deferred), and **weighted genre affinity + priority genre**.
- A Set is either **mounted** (interior — built onto a named stage, occupying it while
  mounted) or **exterior** (backlot — placed on parcels; it is its own venue and
  satisfies both the stage and set requirements for productions bound to it). V1 ships
  the mounted form as the core and 2–3 exterior exemplars on the same machinery.
- Set construction requires an operational `set-scenery` facility and charges
  capex + build weeks; unlock gating reuses `BlueprintRequirement` verbatim
  (TECH-SET-007 proves the original used the identical mechanism for sets and
  facilities; `blueprintRequirements.ts:170-190` already evaluates date/facility/
  structure kinds).
- **Scripts demand sets** (authored from scratch — the corpus's scene→set table was
  never recovered, lane 3): a screenplay carries a set demand (category derived from
  shape/genre); the package/greenlight surfaces show the demand, the match, and the
  named set; a missing or occupied set is a queue reason in the standing blocked-state
  grammar ("Waiting on STAGE 3 — occupied by RAVINE until Week 14").
- **One bound Set per production in V1.** Multi-set films are OUT (they are the
  dining-philosophers cycle X2, lane 2; deferred with the reason recorded).
- **The founding endowment gains one generic House Set** mounted on Stage 7, modest
  quality — the corpus's own SET_STAGE_GENERIC precedent. This is the device that
  keeps every sealed FMJ spec passing while Sets become mandatory for NEW greenlights:
  a fresh (endowed) studio can still walk commission→greenlight untouched, auto-binding
  the sole candidate set. (Set-mandatory + House Set is an Owner ratification, §18.)

### 3.2 The reservation model

The engine's existing primitive is kept and generalised, not replaced (lane 1: the
per-owner `facilityId:slot` reservation with atomic all-or-nothing phase allocation is
correct, fail-closed, and leak-free today).

- **One named union producer.** The law-22 union currently exists as six independent
  hand-walks with duplicated private helpers. C2a-M0 lands `occupiedResourceSlots(state)`
  as a standalone, behaviour-neutral, invariant-guarded refactor BEFORE Sets multiply
  the owner kinds — the highest-leverage risk reduction in the campaign. Cross-owner
  double-booking becomes FAIL-CLOSED at applyActions/tick/validateSave (today it only
  withholds a person from the presence projection — `presence.ts:389-396`).
- **Kind-qualified keys** (`stage:<facilityId>:<slot>`, `set:<setId>`) before Sets
  exist, so sets and facilities never share a flat collision-prone namespace.
- **Reservations gain `heldSinceWeek` and a derivable `freesInWeeks`** (from
  `productionPhaseForRemainingTicks`) so every read model can answer owner law 2's
  "what occupies it and until when."
- **Acquisition discipline (deadlock-freedom by construction, lane 2):** a declared
  integer `acquisitionRank` per resource kind — development-casting < soundstage <
  set < crew < post — with an invariant asserting no workflow ever waits on a resource
  ranked ≤ anything it holds. Acquisition stays atomic per gate (complete set or
  nothing); **no preemption, ever** (a revoked reservation would make the world lie);
  the existing soundstage retention across rehearsal→shooting extends to the bound Set
  under the same rank test. A production blocked entering post KEEPS its stage (holding
  forward-rank waits cannot cycle) — the relief is buildable post capacity plus the
  joined surface: "Post is full — that is why Stage 7 is still busy."
- **Sticky reservations.** The R-1 finding (lane 2): non-soundstage reservations
  silently migrate to a lower-id facility across phase entry, violating the Annex
  contract's "no reservation migration" clause and teleporting people between
  buildings. C2a fixes retention to be sticky for ALL capabilities (contract-compliant),
  with the fix named as a contract-conformance repair.

### 3.3 The concurrency model and the queue

**`MAX_CONCURRENT_PRODUCTIONS` is DELETED, not raised** (a bigger magic number is still
a magic forbid). Admission model: **Phase-Gate Admission** (lane 2 candidate B) — the
atomic hold/retry mechanism that already runs at phase transitions becomes the ONE
mechanism everywhere:

- The four front-door hard refusals (greenlight cap `actions.ts:333`; greenlight
  dev-slot `operations.ts:217-221`; commission `scriptDevelopment.ts:270-274`; casting
  start `castingSessions.ts:302-304`) become queued intents with the same blocker
  grammar the pipeline already uses. Commitment semantics unchanged: greenlight still
  debits cash and binds talent at greenlight (queued-intent entries upstream of
  greenlight name **script projects**, never minting a production id before greenlight —
  lane 5's identity recommendation, killing the canceled-queue-entry identity problem).
- **Queue state is persisted** (V14): explicit integer `queueOrdinal` at admission,
  `queuedWeek`, and per-gate ordering **longest-waiting-first, ordinal tie-break** —
  aging bounds worst-case wait and is fully deterministic (integers in state; no
  timestamps, law 23). This replaces bare ascending-productionId, whose one-week
  unfairness penalty is already asserted by a committed test
  (`tests/operations.test.ts:433-538`) and whose `prod-0012-10` < `prod-0012-2`
  string-sort bug becomes reachable at N>2.
- **Two-pass weekly sweep:** pass 1 releases everything due (including wrap), pass 2
  allocates — so capacity freed in a week is visible to every waiter that week, not
  only to higher-id productions.
- **The blocker becomes legible** (owner law 2 completed): `ProductionBlocker` gains
  `occupiedBy: [{facilityOrSetId, ownerId, title, activity, freesInWeeks}]` and
  `remedies` — every field already computable from `studioCalendar.ts:257-385` plus
  `remainingTicks`. One `studioQueueView(state)` in core beside `studioCalendarView`
  is the single queue reading for Dashboard, Calendar, and Lot.
- The waiting-outside-ticks-7/6/4 rewrite of `operations.ts:531-549` is acknowledged
  as **audited-invariant surgery under law 28** — this charter, at Owner GO, is the
  explicit instruction law 28 requires.

**Throughput honesty:** the cap is currently the ONLY binding constraint (hand-derived
0.25 films/wk vs physical 0.40–0.67 — lane 6; harness-measured before any charter
number is quoted). Deleting it without a second real constraint hands players a free
~2× throughput jump, so deletion lands in the same milestone as buildable stages and
minimal crew capacity (§3.4), and G10.1 (§14) is the campaign's real acceptance test:
the C1 economy snapshot proved purchased slots are inert at the ceiling — after C2a,
the same measurement must show them no longer inert.

### 3.4 Required buildable facilities (the build-path gap, closed)

`FACILITY_BLUEPRINTS` today: five entries, zero soundstage, zero post, zero
effective set-scenery (architect-verified). C2a authors:

| Blueprint | Capability | Notes |
|---|---|---|
| Soundstage (Standard) | `soundstage` ×1 | The headline; stage classes per §3.1 |
| Soundstage (Large) | `soundstage` ×1 | Larger footprint; premium capex/opex |
| Post Building | `post` ×N | Relieves the head-of-line hold honestly |
| Scenery Workshop | `set-scenery` ×N | Set construction + load-in supply |
| Crew Quarters | `crew` ×N | New capability; see below |
| Baseline Development Office | `development-casting` | From-scratch path (Flip prerequisite) |
| Baseline Casting Office | `development-casting` | Cosmetic split of the shared capability in V1 — a distinct `casting` capability is a throughput change deferred to the Owner's concurrency ruling |

**Minimal crew model** (lane 6): anonymous `crew` capacity slots from Crew Quarters;
a production requires 1 crew slot per shooting week; crew joins the union and the
calendar. The named Production/Craft Lead stays exactly as is (quality-affecting
individual; the exactly-one invariant, FilmParticipants, and the autopsy are untouched).
The corpus's own crew model (auto-filled quota from a shared limited pool, no mood, no
training — Bible :970/:1593-1603) is precisely this shape.

Founding facility capacities move from object literals (`operations.ts:26-31`) into
TUNING (the project's own convention, currently violated).

---

## 4. The Living Studio — time model + simulation theater

### 4.1 Time model: Living Turn V1 (ruled; full spec in `08A`)

The engine's discrete week stays the only authoritative clock; the UI gains a
presentation scheduler: **while unpaused — play week N as witnessed time (the shipped
10-beat playback, widened to the manufacturing loop), commit the identical authoritative
advance a manual press commits, auto-pause on the engine-derived stop ladder, repeat.**
Pause and speed (playback pacing multipliers, named constants) are player controls.
"Advance to next event" survives as explicit fast-forward under unchanged law 3.
The scheduler consumes the adapter's exported stop predicate — the priority ladder is
never re-implemented in React (LL EX). The scheduler pauses with the renderer
(hidden tab = paused studio). Determinism gate: byte-identical saves across
hand-advanced / living-loop-at-any-speed / paused-resumed / batch-skipped twins.

The ten frozen-contract refusals of autoplay/pause/speed are **superseded by the
Owner's 2026-08-18 ruling** — recorded in §11. Model C (continuous engine time) is
**refuted for C2** with reasons on the record (08A §3); B3 (beats inside tick) is a
C3+ paper spike; the BEATS_PER_WEEK authority contradiction is resolved for C2 in
favor of `presence.ts` (beats are presentation canon, not outcome law).

**The release-week playback hole closes FIRST** (`App.tsx:2524` gates week playback on
`released.length === 0`, architect-verified): the week a movie ships is currently the
one week the lot never plays. Closing it is the load-bearing prerequisite for both
living time and Premiere Night.

### 4.2 Simulation theater (owner laws 5 + 8)

The central discipline (lane 7): every theater element is classified **Class A —
state projection** (true of the settled week; renders identically on load, after a
batch, mid-playback) or **Class B — witnessed time** (plays only inside the played
week, inheriting the existing law-3 gate). C2's throughput legibility lives in
Class A; Class B carries arrival/wrap/premiere moments.

Shipped, engine-backed machinery is widened, not reinvented: presence beats/routes/
playback (all law-clean, pinned), occupancy captions, stage lamps/chips, the scenery
yard→dock line, the shared queue-chevron layer. Four Stage-7-hardcoded surfaces
generalise to N facilities at zero new display-object cost. New subjects: stages
hot/dark, sets mounted/striking, crates accumulating for queued work, wrap clearing
the stage.

- **Queue physicality:** Option A "Call Board" as the floor (placard at the blocked
  facility naming picture / need / occupant / free-in-N — +1 text object per waiting
  site), Option B "Backed-Up Lot" as the target (procedural crates/truck massing on
  the apron of the contended stage, one element per waited week, cleared by wrap —
  corpus-faithful, pure Class A, draw-call budget named). Option C "queue as a place"
  is deferred (needs multi-claim weeks and lifts a frozen prohibition).
- **The eight ambient patrol actors are GROUNDED** (lane 7 recommendation b): each
  becomes conditional on an authoritative fact (grip patrol only under a live
  set-scenery reservation; publicity walker only during an active campaign). Converts
  a live owner-law-8 violation into an exemplar with zero new art.
- **"Layout visibly affects cost/schedule" is delivered narrowly:** scenery load-in
  gains real duration derived from engine-owned grid distance between the supplying
  Scenery Workshop and the bound stage/set (pure function, TUNING constants). This
  converts C1's zero-duration load-in click into schedule truth without building a
  travel/pathfinding system; general travel-time-as-outcome stays out of C2 (the
  master-plan headline is met by this narrow reading, stated openly). Budget line:
  moving load-in moves the accepted Scenery Load-In V1 UI contract, its save
  biconditional, presence ruling, and four SHA-256-pinned fixtures together — the V1
  Keep gate is re-proven as part of the milestone, not discovered.
- **Re-pin discipline** (five rules, C1-M6 template): once per milestone; measured
  three-part reasons; actor-count moves argued as changes of KIND; both worlds re-pin
  together; plate re-pins labelled rollback-world maintenance. No committed canvas
  digests exist — human visual review remains a mandatory gate.

### 4.3 Wrap (defined)

**Wrap is the authoritative completion of shooting — automatic, not a player command.**
Mechanically: the existing shooting→post reallocation (the silent `remainingTicks 4→3`
boundary, architect-verified) becomes a *named, witnessed* transition: (1) the engine
appends a Tier-D `wrapped` event (§5) at the moment it releases the stage and set;
(2) `SimStopReason` gains an eleventh member `wrap`, priced below release and the three
decision stops, above `runCompleted` — **coordination note:** PF1's cue-grammar
exhaustiveness test over the union will fail on the new member by design; the tier
table adds the reserved wrap beat (PF1 §10.2 reserved the slot); (3) the two-pass sweep
makes the released capacity allocatable the same week; (4) the theater clears the stage
(Class B beat inside the played week; Class A cleared state afterward). Explicitly
excluded: reshoots, partial wrap, strike duration, wrap-party anything.

---

## 5. The event model (docket adjudicated)

**Ruling recommended: Option A — a persisted, engine-appended `studioEvents` ledger at
a new V14 root.** (Lane 11's full docket; lane 5 independently recommended transient
emission + a durable wrap witness — the adjudication is recorded here so the
disagreement is not lost: lane 11's blast-radius measurement inverts the intuition
that transience is cheap — the "no-migration" option touches ~1,046 tick/applyActions
call sites, the "needs-V14" option touches ~26 files with zero signature changes —
and 6 of 12 C2 consumers need history, which transience cannot serve. Lane 5's
determinism and classifier-pollution concerns are answered inside Option A: the ledger
is engine-only-append inside the pure closure, and it is its own root, never a cash
ledger `kind`.)

Pins (the charter's contract for implementation):

1. `studioEvents` is appended **only by `src/core`** ("the engine" in this charter
   means `src/core` alone; `ui/src/engine/adapter.ts` is the boundary layer — naming
   contradiction X1 closed). No `seen`/`consumed`/`acknowledged` field may ever enter
   the schema (byte-parity: PF1 §2's proof obligation — read directly by the
   architect — holds because the ledger is a pure function of (seed, actions, ticks)).
2. **Witness, never input.** No sim step, legality check, read model, or invariant
   branches on it — single recorded exception: `persistedProductionIds` identity
   reservation MUST walk it (law 20), enforced by an invariant test that no other
   src/core module reads it.
3. **Two-tier retention:** Tier D permanent (premiere, wrapped, constructionCompleted,
   setBuilt, setRetired); Tier W windowed by `STUDIO_EVENT_WINDOW_WEEKS` (reservation
   grants/releases, queue admissions/promotions, phaseEntered, sceneryArrived),
   compacted as a pure function of `market.tick`; `nextSeq` never rewinds.
4. **Exact-once = idempotent-above-a-cursor:** monotonic `seq`; presentation holds
   `lastConsumedSeq` outside GameState (its own session key); on cursor loss, REPLAY
   (a duplicate cue is cosmetic; a swallowed premiere is a lost campaign moment).
   This retires the 20 manual `setLotCadenceFeedback(null)` sites and survives reload.
5. **The M0A gate is preserved:** the ledger is EMPTY on the legacy/headless path
   (gated on `operations.mode === 'managed'`); the legacy branch of
   `advanceManagedProductions` writes nothing. `tests/acceptance-corpus.test.ts`
   byte-identity must hold without re-baselining.
6. **Migration is five phases and never goes red** (root lands writing nothing →
   engine writes, nobody reads → dual-run equality vs all 17 existing diff-detectors
   on their own fixtures → detectors flip to log projections preserving exported
   signatures → detectors retire after a full green seal cycle). New C2 consumers are
   log readers from day one.
7. A one-off save-size measurement (exportSaveJson at weeks 52/208/520) runs BEFORE
   the retention window is fixed (no size measurement exists anywhere in the repo).

---

## 6. Premiere Night V1 + Theater disposition

**Theater: PERMANENT LANDMARK (T1), recommended for ratification.** Evidence is
one-directional (lane 9): no exhibition capability exists; the C1 F2 seam proves
capacity-0 buildables are structurally unengageable; the original's Cinema is verified
debug content (`facility_cinema.ini`, given=0, TECH-DORMANT-001: "Do not conclude a
Cinema facility was ever player-accessible"); the original released from the Production
Office. Consequence the Owner must ratify with it: **the Flip's minimum starting lot
includes the Theater** (Gate + Admin + Theater + road + parcels) — this amends the
master plan §6 minimum-lot sentence and closes its self-contradiction (G2).

**Premiere Night V1: Option A — "The marquee lights and the company comes."** On a
lot-origin release week the player is NOT teleported off the lot: the Theater marquee
takes the film's title (the named-title marquee already exists on the legacy renderer
only — `signage.ts:151-233`; **the port into TycoonScene is required work**, stated so
nobody reads "already works" and ships nothing), the frozen `FilmResult.participants`
walk the existing authored paths to the Theater, a crowd sized by a bounded
deterministic function of opening gross forms (named constants; no RNG), and the
Gazette opens from a world receipt on the Theater into the untouched
NewspaperReveal → ReleaseResult → Autopsy chain. **Option B ("marquee only") is the
named de-scope floor.** Option C (booked/paid/reserved premiere) is deferred to C3
with reasons recorded.

Pins: **zero-cash ceremony** (lane 10 — it must not become a second degenerate
awareness purchase; if ever priced, the minimum measurement protocol in lane 10 §5.5
applies); **the amplifier invariant is recorded now** — a premiere may amplify
perception but never changes reception, box office, standing, awareness, prestige, or
cash (PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md:87); premiere is a **pause point**
under Living Turn; plays once, on the stopping tick, never narrating skipped weeks;
falls through to today's exact setScreen path on any staging failure (a release is
never swallowed by presentation); multi-release weeks stage ONE sequence naming both
pictures. **Prerequisite: the week-authority fix** — `releaseTick` is stamped
pre-increment and printed as the Gazette's date while the player stands in
releaseTick+1; behaviour, not just copy (`vignettes.ts:289-290` consumes it). One week
convention is ruled (recommendation: present release week = the week the player stands
in; stamp unchanged, presentation derives +1 uniformly across all seven printing
surfaces) and applied everywhere before any premiere copy is written.

If PF1's cue grammar shipped, its tier-1 release sting becomes the premiere's downbeat
(one-owner law, no double-announce); if PF1-M2 was KILLED, the premiere is simply
silent — no hard dependency on `eventGrammar.ts`.

---

## 7. The Founding Flip (C2b)

**Definition:** a NEW fresh studio begins with Gate + Administration + Theater
(per §6) + frontage road + vacant parcels, and builds the filmmaking operation.
A flipped studio is a new game; **migrated saves never experience the Flip
retroactively** — they keep their founding plant forever.

1. **`foundingRegime: 'endowed' | 'bare-lot'`** — one durable monotonic top-level V15
   root (the `economyEngagedEver` pattern), written once at worldgen, never re-derived
   (deriving from `property.structures` breaks the moment demolition reaches founding
   bodies). Every migrated save becomes `'endowed'` unconditionally.
2. **Invariant surgery, explicitly authorized:** the four-capability invariant, the
   positional `placement-v12` facility policy, and `activateStudioOperations` each gain
   a bare-lot regime arm (this charter at GO = law 28's explicit instruction). The
   regime is a validation-policy discriminant threaded like `LiveStateValidationPolicy`.
3. **Representation ruling (A):** at the Flip, founding bodies become first-class
   placements and only Gate/Admin/Theater remain PropertyStructures. The master plan
   §6's "founding placements" phrasing describes what C1 was *expected* to ship; C1
   actually shipped PropertyStructures on a separate root (`placement.ts:85-88`) — the
   charter names this divergence rather than inheriting the stale phrasing. Vocabulary
   ruled: *eight authored structures + one reserved parcel = nine addressable places.*
4. **Property re-authoring:** a post-Flip parcel map is authored world work (vacated
   ground re-parceled; new buildable parcels sized for 4×4 stages + clearance), bound
   by laws 25/27a; the `lotParcelInspectorContext` reservation-awareness seam (deferred
   by C1 to "the campaign that next touches that surface") is C2b's.
5. **Journey upstream:** construction stages extend the FMJ projection ahead of
   "Commission a screenplay" ("The studio has no development office — build one").
   `JourneySite` needs no new member; the frozen `FirstFilmJourneyStage` union and its
   closed UI validator widen additively; `JOURNEY_SITE_BUILDING` becomes a live lookup
   with an honest "not built yet" arm; the 386 hard-coded founding-BuildingId references
   are swept as their own milestone. Blueprint `requires` audit: no post-Flip blueprint
   may require a founding structure; `maxInstances` counts structures + placements
   (closing the migrated-save double-build hole).
6. **The opening act is an OVERLAP, not a waiting room:** the schedule already permits
   commissioning and greenlighting while the stage is under construction (a picture
   needs no stage until 6 weeks from release). Fresh-start runway is measured (E3):
   estimated core build-out $3.4–5.1M capital + ~$3.76M dead burn at measured
   ~$94k/week over a sequential build — the pessimistic branch is potentially
   unwinnable at $20M, so INITIAL_CASH / build-weeks / overlap tuning is an explicit
   C2b-M4 subject with measured evidence, not a guess.
7. **Compatibility gates:** all 21 existing test files run UNMODIFIED against the
   permanent pre-Flip fixture; both sealed e2e journeys run unmodified against a
   MIGRATED save; a new e2e proves bare lot → build core → FIRST FILM GREENLIT → wrap.
   The D-16 corpus SHA-256 neutrality is handled deliberately: pre-Flip fixture pinned
   as permanent regression + formal re-base with a recorded ruling (never silent drift).

---

## 8. Save/schema requirements

**C2a = SaveFileV14:** `state.sets` (starts EMPTY on migration — no synthesized
defaults except the endowed House Set at *worldgen*, not migration); `state.productionQueue`
(queueOrdinal/queuedWeek; empty on migration — nothing was ever waiting); a long-lived
per-production `bindings` sibling on workflows (bound stage, bound set, locked novelty —
NOT inside `reservations`, which is phase-scoped and replaced wholesale);
`state.studioEvents` (§5); reservation `heldSinceWeek`. **C2b = SaveFileV15:**
`foundingRegime`. Roughly 45 mechanical boundary-guard/projection/migrator edits per
version bump; the five hand-enumerated `migrateToVn` downgrade refusals are
parameterized by a test over every migrator × every higher version (a forgotten case
is today a silent downgrade).

Non-negotiables (lane 5): copy the **V12** three-legged historical-boundary guard, not
V13's two-legged one (C2's roots DO leak identities into other roots); new ledger kinds
(`setCapex`/`setMaintenance`/`setDemolitionRefund`) get boundary legs;
`persistedProductionIds` extends to walk every new root carrying production ids, both
directions; **grandfathering rule M2** — in-flight migrated productions keep their
`facility-scenery-shop` reservation byte-for-byte; Sets gate NEW greenlights only
(without this, every migrated mid-shoot save fails the exact-capability invariant at
load); migration derivations are facts, not guesses (boundStage from
`shootingTask.soundstageFacilityId`; lockedNovelty ABSENT, not 1.0); zero RNG,
`rngState` byte-identical; T1–T20 invariant suites as specified in lane 5, headlined by
T9: a V13 mid-shoot save (five ShootingTaskStatus × both blocker kinds) migrates and
plays byte-identically vs its V13 twin for ≥30 weeks. The session key
`project-studio.active-session.v4` is NOT bumped.

---

## 9. Economy — measure, don't fix

C2 raises throughput at the exact moment the D-17B residuals (cash runaway, top-studio
immortality) are open and C6 owns closure. The charter's stance (lane 10): **instrument
five things, fix none** — with two bounded interim guards the master plan §7 permits.

- **Guards:** G-A every C2 economy artifact reports runaway/distress rates with the
  threshold in force printed beside them; G-B the **weeklyBurn truth repair** — fold
  `facilityOpex` into the player-facing burn/runway (today's runway overstates survival
  by 16.1% on a built-out C1 lot and C2 multiplies the error with every stage and set;
  changes no cash flow, only what the player is told). Explicitly NOT permitted: any
  sink sized to suppress the tail; financing/loans/bailouts; touching RUNAWAY_MULTIPLE
  or the publicity/box-office scales.
- **The negative result recorded for C6:** stage/set opex cannot absorb a doubled
  ceiling at any defensible price (it would need 12–30× the entire C1 estate's weekly
  opex). C2 hands C6 that measurement instead of inventing a sink.
- **Remeasurement protocol:** gates E0 (re-pin the C1 script unchanged at C2's HEAD;
  also settle R9 — verify sealed main actually contains the accepted D-17B engine
  state) → E1 post-catalog → E2 post-throughput → E3 post-Flip → E4 seal; runs R1–R5
  (slate-per-blueprint, estate arms, `runFacilitiesCorpus` 104/208wk, `run-d16-corpus`
  208wk per ceiling, Flip fresh-start weekly); artifact
  `docs/economy/C2-ECONOMY-SNAPSHOT.md` generated by `scripts/measure-c2-economy.mts`
  EXTENDING the C1 script so C1 sections keep reproducing; the 18 named figures incl.
  binding-constraint histogram, marginal cost of the Nth production, queue-idle
  payroll, and the Flip runway trough.
- **Queue idle:** status quo (full payroll accrues while queued) — measured, not
  redesigned; a reduced idle rate is exactly the unmeasured lever D-17B forbids.
- **Harness audit:** nine files use `MAX_CONCURRENT_PRODUCTIONS` as denominator or
  policy gate; each is audited and re-based with named reasons; pre-C2 corpus numbers
  are frozen as historical.
- **TUNING inventory** (names and intent; values are implementation's to tune):
  `STAGE_{STANDARD,LARGE}_{CAPEX,BUILD_WEEKS,WEEKLY_OPERATING_COST,SIMULTANEOUS_PRODUCTIONS,FOOTPRINT,CLEARANCE}`,
  `STAGE_BLUEPRINTS`; `SET_<id>_CAPEX`, `SET_BUILD_WEEKS_BAND_*`,
  `SET_WEEKLY_MAINTENANCE_COST` (labelled an invention — the original charged sets no
  recurring cash), `SET_CONDITION_DECAY_PER_WEEK`, `SET_CONDITION_UNUSABLE_THRESHOLD`,
  `SET_REPAIR_{COST,WEEKS}`, `SET_NOVELTY_{INITIAL,DEPLETION_PER_RELEASE}`,
  `SET_GENRE_WEIGHT_*`, `SET_BLUEPRINTS`; `SCENERY_LOAD_IN_WEEKS_BASE`,
  `SCENERY_LOAD_IN_WEEKS_PER_DISTANCE`, `SCENERY_LOAD_IN_COST` (named zero);
  `REHEARSAL_COST` (named zero); `CREW_QUARTERS_*`, `CREW_SLOTS_PER_SHOOTING_WEEK`;
  `QUEUE_PRIORITY_POLICY`, `STUDIO_EVENT_WINDOW_WEEKS`; `PREMIERE_NIGHT_COST` (named
  zero); C2b: `FLIP_INITIAL_CASH` (if it diverges from INITIAL_CASH), per-baseline
  blueprint constants. Named zeros follow the proven `FACILITY_MOVE_COST = 0` pattern —
  invariant-checked, ledger-routed, one-line to price later. Presentation-only scale
  constants (crowd size per gross, playback speeds) live in a UI-side named-constant
  module, NOT in engine TUNING (G7 answered: TUNING is engine law; presentation
  constants get the same no-magic-numbers discipline in `ui/src`).
- Set `attractiveness` is authored as data, wired to NOTHING (C3's prestige lane).

---

## 10. Fix-in-passing: the inherited seams (each with its C2 acceptance)

| Seam | Ruling recommended | Acceptance |
|---|---|---|
| **F2** — capacity-0 effect buildings unengageable → timed build→consume→demolish at 50% | Effect buildings become HOLDERS: an uplift binds at commission and the office is engaged until the draft completes | A mid-consumption demolition refuses with a named reason; the churn exploit's price is re-derived in the C2 snapshot |
| **F3** — requirements bind at quote time only (Office II demolishable at III's groundbreak, +$330k) | Prerequisites become holders (or re-check at completion) | Named refusal; the red team re-derives the +$330k composition (the $30k gap vs 0.5×capex is unexplained in the C1 record — W7) |
| **F4** — commission verb demands the whole board idle; Annex/Hall slots unrealizable from the world | The world commission predicate becomes a function of FREE SLOTS (`availableDevelopmentCastingSlots`), the same truth the queue uses | Continuous e2e on the 5179 origin: commission from the world while other work is in flight |
| **releaseTick off-by-one** | One week authority (§6) | Proven across all seven printing surfaces |
| **DSF2 / 480×270 below-fold** | SCOPE OUT explicitly, recorded — supported floor is 960×540; revisit with the unowned UI-scale pass | The scope-out is written; the third silent carry ends either way |
| **R-1 reservation migration** | Sticky reservations (§3.2) | The Annex contract's clause holds; nobody teleports |
| **Stale docs** | C2a-M0 repairs the laws-doc trailer (V13→V14 as it lands), law 19's drifted line pointers (or rules symbol-name resolution), and the "travel is greenfield" planning note (presentation travel is SHIPPED; pathfinding/outcome-travel is greenfield) | Doc-only commit, diff-verified |

---

## 11. Governance: explicit supersessions (owner signature covers these at GO)

1. `docs/FACILITIES-CONSTRUCTION-RESEARCH-CONTRACT.md:252` ("raising
   MAX_CONCURRENT_PRODUCTIONS or changing phase durations/allocation order" excluded)
   — **superseded** for C2 by owner law 1.
2. `docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:538` (ceiling/scheduling/priority/
   queues listed as open) — **superseded**; its §494-500 no-migration clause is
   *honored* via sticky reservations.
3. The **ten** frozen refusals of "autoplay/pause/speed/second clock" (inventory in
   lane 8, incl. WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:309, HANDOFF.md:450) —
   **superseded by the Owner's 2026-08-18 living-time ruling.**
4. `TYCOON-WORLD-CONVERSION-LOG.md:404` ("facility-capacity queues remain latent…
   recorded Owner decision") — **superseded** by owner law 2.
5. The company-presence contract's holding-area prohibition — **NOT lifted** (queue
   Option C stays deferred; recorded so its future lift is deliberate).
6. **Opex precedent (R4):** Placement Core V12's positive facility opex is RATIFIED as
   having superseded the older $0-opex contract clauses; C2 prices stage/set opex on
   the V12 precedent. (Ratification item — the alternative reading is that shipped C1
   violates a frozen contract, which nobody believes but the record must say so.)
7. The D-16 harness suite (10 test files outside the sealed 241) — ruled INTO the C2
   regression floor: the workspace adds `src/harness/**/*.test.ts` with a re-baselined
   count and a named reason (the campaign that moves the economy runs the economy suite).

---

## 12. Milestones

### C2a — SETS, STAGES & THE LIVING STUDIO (SaveFileV14)

- **M0 — Baseline, hygiene, and the union.** Reproduce the C1 floors at HEAD (241/3,318
  vitest; 211/207/4/0 Playwright; both tsc — law 27d, no stale certifications); E0
  economy re-pin + the D-17B-on-main verification (R9); doc repairs (§10); capacities →
  TUNING; the phase→capability three-copy table single-sourced with an agreement test;
  `occupiedResourceSlots(state)` named union producer + fail-closed cross-owner
  invariant; kind-qualified reservation keys. **Gate: zero behavior change — replay and
  save byte-identity; all floors green.**
- **M1 — The event ledger + wrap (V14 root).** `studioEvents` phases 0–2 (§5.6);
  save-size measurement; V14 migration + T-suites; wrap as first consumer:
  Tier-D `wrapped` event + `SimStopReason` 'wrap' + cue-grammar/tier-table coordination.
  **Gate: M0A corpus byte-identity (ledger empty on legacy); dual-run equality vs all
  17 detectors; PF1 parity proof green with the ledger on.**
- **M2 — Buildable capacity + Sets.** The §3.4 blueprint slate; `crew` capability;
  `state.sets` + set construction via Scenery Workshop + the stat block + shown
  quality/novelty/condition; script set-demand + package/greenlight surfaces; the
  endowed House Set at worldgen; auto-bind-when-sole-candidate; dynamic N-stage world
  identity (the closed adapter maps/vocabularies become derived — the UI currently
  THROWS on a third stage); stage classes procedurally baked (grid only). **Gate:
  bounded-term tests per TUNING family; a 4-stage studio renders and plays without a
  throw on both origins; FMJ specs pass unmodified.**
- **M3 — Throughput.** Delete `MAX_CONCURRENT_PRODUCTIONS`; Phase-Gate Admission at all
  four front doors; queue state + aging + ordinal; `acquisitionRank` + acyclic
  invariant; two-pass sweep; sticky reservations; blocker `occupiedBy`/`remedies`;
  `studioQueueView`; harness audit + re-base; F4 fix. **Gate: G10.1 (purchased slots no
  longer inert on ≥4 of 5 seeds); N-way contention property test (acyclic wait-graph,
  bounded wait, rank monotonicity) over seeded runs; determinism under contention;
  E2 economy gate.**
- **M4 — The Living Studio.** Release-week playback hole closed; the Living Turn V1
  scheduler (pause/speed/auto-pause ladder/fast-forward); `studioWeekTheater`
  projection + N-facility generalisation of the four surfaces; queue physicality
  (Call Board floor → Backed-Up Lot target); grounded ambient actors; load-in duration
  from layout (+ Scenery Load-In V1 re-proof); F2/F3 fixes. **Gate: the hands-off proof
  (scripted e2e: unpaused, untouched, N weeks advance, queue drains, auto-pause on
  first decision) + four-way time-parity byte-identity; theater on/off byte-parity
  with the enabled arm proven non-vacuous; re-pins per the five-rule discipline.**
- **M5 — Premiere Night V1.** Week-authority fix across seven surfaces; marquee port;
  Option A staging (B floor named); pause-point integration; multi-release
  arbitration. **Gate: premiere e2e on 5179; no double-announce; amplifier invariant
  test (premiere changes zero engine numbers); release never swallowed on staging
  failure.**
- **M6 — Economy remeasure + polish.** C2-ECONOMY-SNAPSHOT (18 figures, E-gates);
  weeklyBurn truth repair; DSF2 scope-out recorded. **Gate: snapshot reproduces
  byte-identically twice; C1 sections still reproduce.**
- **M7 — SEAL → STOP FOR OWNER REVIEW.** PM playtest (§16), independent red team
  (§15) with a HELD LIST in the M8 format, bounded fix wave (sole-writer, findings
  only), KEEP/KILL per milestone, gates regenerated at the named seal HEAD.

### C2b — THE FOUNDING FLIP (SaveFileV15)

- **M1 — Regimes + invariant surgery.** `foundingRegime` root; the three invariant/
  policy/activation arms; V15 migration ('endowed' unconditionally); pre-Flip fixture
  frozen as `preFlipFoundedStudio(seed)`. **Gate: every V14 suite green under both
  regimes; a bare-lot save validates, loads, and refuses nothing it shouldn't.**
- **M2 — The bare lot.** Post-Flip parcel map authored (stages fit; law 25/27a);
  vacated-ground rules; parcel projection reservation-aware (the C1-deferred seam).
  **Gate: placement property tests on the new map; structural re-pins with named
  reasons.**
- **M3 — The journey upstream + UI sweep.** Construction stages; `JOURNEY_SITE_BUILDING`
  honest lookup; the 386-reference sweep; blueprint `requires` audit + maxInstances
  counts structures. **Gate: both sealed e2e journeys unmodified against a migrated
  save; the closed UI validator widened additively.**
- **M4 — The opening act.** Overlap design tuned with E3 measurement (runway trough
  figure); Flip golden path e2e (bare lot → build core → FIRST FILM GREENLIT → wrap);
  D-16 fixture pinned + corpus re-based with a recorded ruling. **Gate: the Flip is
  winnable and measured; pre-Flip fixture regression permanent.**
- **M5 — SEAL → STOP.** Owner plays the Flip (§16b); red team (Flip family R24–R27 +
  migration); fix wave; KEEP/KILL.

---

## 13. Opus dispatch plan (single production writer per surface; the PM grades)

| Role | Milestones | Owns |
|---|---|---|
| OPUS-ENGINE-CORE | C2a M0–M1 | `src/core` union/keys/TUNING hoists; `studioEvents`; wrap; V14 in `save.ts` |
| OPUS-ENGINE-CAPACITY | C2a M2–M3 | Blueprints, `state.sets`, queue/admission/rank, sticky reservations; sole `src/core/operations.ts` writer during M2–M3 |
| OPUS-TESTS | all | Contract-first suites from THIS charter, in `tests/contracts/` + `ui/src/test/contracts/` — written from the charter, never the implementation |
| OPUS-WORLD | C2a M2, M4 | N-stage world identity, stage/set bakes, theater projection wiring, queue physicality; sole writer of `TycoonScene.ts`/`world.ts`/`assets.ts` |
| OPUS-TIME | C2a M4 | The Living Turn scheduler + playback widening; sole writer of the scheduler module; call-sites-only in `App.tsx`/`StudioLotScreen.tsx` (PF1's one-writer-at-a-time law continues) |
| OPUS-PREMIERE | C2a M5 | Marquee port, staging, week-authority sweep |
| OPUS-ECONOMY | C2a M0/M3/M6 | `measure-c2-economy.mts`, harness audit, snapshot |
| OPUS-FLIP-ENGINE | C2b M1, M4 | Regimes, invariant arms, V15 |
| OPUS-FLIP-WORLD | C2b M2–M3 | Parcel map, journey/UI sweep |
| OPUS-REDTEAM | M7 / C2b-M5 | Independent; findings only, HELD LIST mandatory |
| OPUS-FIX | M7 / C2b-M5 | Sole writer during fix waves; scope = ruled findings only |

Rules carried from PF1: no force-push by any role; `App.tsx`/`StudioLotScreen.tsx`/
`adapter.ts` are serialized one-writer surfaces; every gate figure regenerated from a
command at a named HEAD; the PM reruns decisive gates personally at each KEEP/KILL.
C2 UI work starts only after PF1 seals (its M1–M3 write the same files).

---

## 14. Test gates (the G-list; full specs in lane 12)

G1 reservation lifecycle (fail-closed cross-owner overbooking at all three boundaries;
release proven on EVERY termination path — wrap, release, cancel, demolish-refusal;
`facilityEngagements` exhaustiveness as a test). G2 queue determinism (identical
seed+script → identical queue order; the tie-break pinned against a genuine tie).
G3 bounded-term unit tests for every new TUNING constant (project convention).
G4 V13→V14(→V15) migration matrix incl. all five ShootingTaskStatus × blocker kinds ×
mid-production states; T9 thirty-week byte-parity twin. G5 Flip golden path + permanent
pre-Flip fixture + migrated-save journeys. G6 phase-table single-source agreement test;
the blocked-at-gate rule pinned. G7 Premiere (incl. amplifier-invariant zero-delta).
G8 theater/time byte-parity (on/off and four-way pacing parity; enabled arm proven
non-vacuous; `rngState` pinned; the Math.random hygiene scan extended to `ui/e2e/`).
G9 structural re-pins per the five-rule discipline. G10 ceiling-removal proof (G10.1
slots-no-longer-inert — the campaign's headline measurement). G11 economy snapshot
reproducibility. G12 quote-grammar (every new sentence literally true at its state).
G13 D-16 suite into the floor (ruled, §11.7). G14 flake watch (serialized Playwright,
both origins, no retries). Standing law: no test deleted or weakened; FMJ specs
unmodified; every figure names its HEAD.

---

## 15. Red-team targets (R-list; full 34 in lane 12)

Reservation exploits (reserve-and-cancel churn; demolish-under-reservation; the
indefinite player-controlled soundstage hold via never-scheduling the take — W8, a
self-inflicted denial-of-service under contention; queue-jumping via cancel/resubmit —
note cancel already forfeits the full greenlight lump, so the team prices the exploit
before claiming it). Deadlock/starvation (rank-order violations; head-of-line post
bottleneck freezing every stage; aging starvation; the same-week free/allocate race).
Economy (queue-parking; premiere farming; churned F2/F3 prices re-derived; runaway
acceleration measured not hidden). Flip (regime forgery in saves; migrated-save
double-builds; requires-gates on absent structures; parcel exploits on the new map).
Determinism (contended-reservation ordering; living-turn pacing divergence; cursor
loss/replay). Theater/truth divergence (any motion not traceable to authoritative
work — a single unexplained mover is a campaign failure under laws 5/8; hidden-tab and
reduced-motion equivalence). Deliverable format: findings + the M8-style HELD LIST.

---

## 16. Owner playtest scripts

**(a) C2a seal (~20 min):** found a fresh studio; see the House Set; build a second
stage and a set; commission two pictures; watch the second QUEUE with a readable reason
naming the occupant and the free week; unpause and *stop touching the controls* — watch
scenery travel, stages light, a wrap clear a stage, the queue drain into it; get
auto-paused by a decision; use fast-forward once; reach a release and attend Premiere
Night at the Theater; open the queue view and relieve a bottleneck by building what it
names. PASS = "I watched my studio manufacture two movies at once, I always knew what
was waiting and why, and it ran without me pushing it." FAIL = a stalled queue with no
stated reason, motion I couldn't attribute, or reaching for Advance Week out of
necessity.

**(b) C2b seal (~20 min):** start a NEW studio; arrive at Gate + Administration +
Theater and empty land; follow the journey's construction guidance; commission during
construction (the overlap); reach FIRST FILM GREENLIT → wrap → release on a lot you
built; load a pre-Flip save and confirm it is exactly the studio it always was.
PASS = "I started with almost nothing. I built this studio."

---

## 17. PF1 interlock and robustness

Assumed baseline: PF1 as chartered (audio service, cue grammar, prefs, shell; ui-only;
no V14). Verified by the architect against the PF1 charter directly: the §2 byte-parity
obligation (compatible with the engine-side ledger, §5); the M2 world-emphasis fence
(binds PF1, expires into C2's theater — G12 in lane 9); §9/§10 routing (Premiere,
theater, time docket, event docket, wrap, F2/F3/F4/DSF2/releaseTick all C2's, confirmed).
Robustness: every engine milestone (M0–M3, C2b) is independent of every PF1 outcome;
M4/M5 degrade gracefully (no cue grammar → silent but complete beats; the scheduler
does not require audio); C2 UI work sequences after the PF1 seal to avoid one-writer
conflicts. If PF1-M2's laws-doc correction was KILLED, C2a-M0 performs it instead.

---

## 18. Owner decisions — the GO sheet

**Tier 1 — genuine choices that block implementation:**

1. **Concurrency targets** (master plan §10.1, still open): the target concurrent-
   production range at mature C2a build-out, and which constraint binds first.
   *Recommendation: 3–4 pictures at full C2a build-out; stages bind first, then sets;
   dev/casting and crew bind only when under-built.* Every tuning number in M2–M3 and
   the whole measurement protocol is parameterised by this.
2. **Ratify the C2a/C2b split** (§2) — or order unified C2 accepting the risk record.
3. **Living Turn V1** (§4.1/08A) — ratify the shape AND sign the supersession of the
   ten frozen refusals (§11.3). Includes the pause-point ruling for Premiere Night.
4. **Event model** (§5) — ratify persisted `studioEvents` (Option A) over transient
   emission; both lanes' cases are on the record.
5. **Theater = permanent landmark**, including the amended minimum starting lot
   (Gate + Admin + Theater) (§6).
6. **Sets are mandatory for new greenlights + the endowed House Set** (§3.1) — the
   FMJ-preservation device. (Declining set-mandatory weakens owner law 3 to a
   quality lever; the charter is written for YES.)

**Tier 2 — ratifications of recorded recommendations (one signature covers the sheet):**
sticky reservations as contract conformance (§3.2); hold-while-blocked + buildable
post as the head-of-line answer (§3.2); queue aging longest-waiting-first (§3.3);
wrap automatic, not a command (§4.3); queue-idle payroll status quo, measured (§9);
weeklyBurn truth repair in scope (§9); F2/F3/F4/releaseTick/DSF2 rulings as tabled
(§10); opex-precedent ratification (§11.6); D-16 suite into the floor (§11.7); corpus
re-base policy (§7.7); novelty per-instance, condition gates-only, set quality SHOWN
(§3.1); no rotation of footprints in V1; per-week stage/set costs NOT charged in V1
(opex only — a per-shooting-week fee is a new cash path, deferred with the reason
recorded); crowd/presentation constants live UI-side (§9).

---

## 19. Explicit non-goals (deferred, with owners)

Multi-set productions; reshoots; partial wrap; stage-strike duration; set-quality →
production-quality penalty (V1 gates only); genre practice on vacant sets (C3+ — a
talent feature wearing a Sets costume); relationships/chemistry of any kind (the
REHEARSE/FILM/CASTING schema evidence is recorded, and it is NOT a license —
Do-Not-Build list stands); travel/pathfinding as outcome law beyond load-in distance
(C3+ docket); queue Option C "the queue is a place"; B3 beats-inside-tick (C3+ paper
spike); era/research content and the 1920 start (C4 — C2 only keeps schema era-clean);
prestige/attractiveness wiring, landscaping, awards, ranks (C3); star needs/amenities
(C5); economy closure (C6); archive/library; a per-film crew quota UI; buildable
Theater (refuted by corpus; revisit only via C3 prestige); plate-world stage cells
(law 27a stands); authored hero-art stages (procedural classes only); any movie
footage (later ruling); machinima (unchanged owner reservation); financing/loans/
bankruptcy (D-17B standing instruction); multi-slot saves, UI scale (unowned, per PF1).

---

## 20. Definition of DONE

C2a is DONE when, at a named HEAD on `c2-sets-throughput-plan`'s successor production
branch: the Owner's C2a playtest passes as scripted; the hands-off proof and all
byte-parity gates hold; G10.1 shows purchased capacity is no longer inert; every G-gate
is green with figures regenerated at that HEAD; no test was deleted or weakened; the
FMJ specs pass unmodified; the C2 economy snapshot exists and reproduces; and the seal
STOPS for Owner review. C2b is DONE when the Flip playtest passes, the pre-Flip fixture
and migrated-save journeys prove the old world unchanged, the Flip golden path is green,
and the seal STOPS. **No successor campaign is automatic.**

---

*Frozen 2026-08-18 by the Fable C2 Architect. Planning artifacts: `docs/c2-planning/00–12`
on this branch. No production code was written or modified. PF1's worktree and branches
were never touched.*
