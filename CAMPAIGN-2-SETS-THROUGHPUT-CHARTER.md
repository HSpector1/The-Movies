# CAMPAIGN 2 — SETS, STAGES & PRODUCTION THROUGHPUT + THE FOUNDING FLIP
## CAMPAIGN CHARTER (r2 — FROZEN FOR OWNER GO)

> Status: **IMPLEMENTATION-READY, awaiting the Owner's explicit GO.** Prepared by the
> Fable C2 Architect session of 2026-08-18 under the Owner launch order
> ("PROJECT: STUDIO — C2 ADVANCE PLANNING") while PF1 is in flight elsewhere.
> Branch **`c2-sets-throughput-plan`**, worktree `/Users/bruce/The Movies - C2 Planning`,
> base = sealed C1 `main` @ `f294077`. Nothing in the PF1 worktree or branches was touched.
>
> Evidence: twelve dedicated Opus recon lanes over the engine, the UI, the governing docs,
> and the original-game corpus (`docs/c2-planning/01..12-*.md`, ~11,500 lines, claims
> tagged [CODE]/[CORPUS]/[DOC]/[PROPOSAL]); PF1 clauses C2 depends on vendored verbatim in
> `docs/c2-planning/13-PF1-CHARTER-EXCERPTS-APPENDIX.md` (PF1 charter @ `1e6b422`); the
> Owner's mid-planning time-model ruling recorded verbatim in
> `docs/c2-planning/00A-OWNER-RULING-TIME-MODEL-2026-08-18.md` and reconciled in
> `docs/c2-planning/08A-TIME-MODEL-DOCKET-ADDENDUM.md`; the Owner-accepted
> architecture guardrails recorded in
> `docs/c2-planning/00B-OWNER-GUARDRAILS-2026-08-18.md` and bound in §8.2.
>
> **r2 provenance:** r1 (`f0bc21a`) was put through an independent five-lens adversarial
> review (completeness, contradictions, citation audit, engine implementability,
> product/scope) — 21 BLOCKER / 46 MAJOR / 20 MINOR findings, all adjudicated into this
> revision. The full findings live in the review run record; the design deltas r2 makes
> are listed in §0. Six load-bearing engine claims were independently re-verified by the
> architect against the tree; the review's citation lens verified ~55 more.

---

## 0. What r2 changed (the review's verdict, adjudicated)

For the Owner's orientation — the material design deltas from r1, each forced by a
verified finding:

1. **Crew-as-capacity is CUT from C2a** (was: a hard 1-crew-slot-per-shooting-week
   requirement). It had no founding supply, no grandfather, and would have deadlocked
   every fresh and migrated studio. Stages + Sets are C2a's physical constraints; crew
   and talent-as-capacity are explicit, Owner-acknowledged deferrals (§18.1c, §19).
2. **Exterior/backlot sets are CUT from V1** (was: 2–3 exemplars). They were a second
   admission path with different reservation semantics that no milestone, gate, or
   TUNING entry covered. Mounted sets alone carry owner law 3 in V1 (§19).
3. **The founding endowment is TWO generic house sets** (one per founding stage), minted
   at `activateStudioOperations` — not worldgen, which cannot reference facilities that
   don't exist yet — and synthesized by the V14 migrator for managed-mode saves. This
   makes the endowed studio's capacity exactly today's (2 stages, 2 sets), so every
   sealed two-production spec and the FMJ run unmodified; contention begins with the
   third picture (§3.1).
4. **Set binding is fully specified**: not a `FacilityReservation`; acquired atomically
   with the stage at rehearsal entry; genre fit is advisory (a quality lever, never a
   gate); quality/fit/novelty are WIRED to bounded outcome terms, not decorative;
   condition wear has its repair loop in the same milestone (§3.1, §3.2).
5. **Living Turn's auto-pause ladder is partitioned** (PAUSE-class vs NOTIFY-class
   stops) — without it the loop paused every week or two and defeated the Owner's proof
   sentence. The hands-off gate now binds N (≥12 unpaused weeks) (§4.1).
6. **The weekly sweep is a fixed-point allocation pass**, not the circular "two-pass"
   r1 described (§3.3).
7. **V14 is one complete schema landing at M1** with field-level type literals (§8.1);
   the sealed tests the cap deletion invalidates are enumerated for retirement with
   named successors (§11.8); the supersession registry is now complete and every
   clause is quoted at a verified line (§11).
8. **C2a gets its own bounded ground amendment** (road frontage to `north-back-lot`) —
   the review proved no existing road-served parcel can hold a stage plus clearance,
   so C2a's stage construction had nowhere to stand. Soundstage (Large) is deferred
   with `bakeStage`'s honest parameterization status recorded (§3.4, §19).
9. **The queue got its player surface** (Lot Call Board + Production Board queue panel,
   with a defined `Remedy` union and a four-facts gate), an OPUS-SCREENS dispatch lane,
   and per-milestone legibility gates — the review showed C2 could previously go
   all-green while delivering plumbing with a veneer (§3.3, §12, §13, §14).
10. **The owner playtest was rewritten** — as scripted in r1 it built relief capacity
    before contention and could never produce the queue moment it demanded (§16).
11. Citation and figure corrections throughout (runway overstatement ~19%, not 16.1%;
    Flip burn stated all-in; the Cinema corpus row downgraded to its actual LOW
    confidence; the amplifier pin split into corpus fact + charter ruling; the
    autoplay-refusal inventory enumerated at verified lines; ~27 cadence-feedback
    sites, not 20; physical throughput ceiling 0.40–0.50, not 0.40–0.67; and more).

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

**Owner laws governing this campaign (2026-08-18 launch order + time-model ruling):**

1. Concurrency comes from physical capacity; the two-production ceiling is transitional.
   Throughput must emerge from real resources: development/casting capacity, writers,
   stars, crew, stages, Sets, support, layout/travel. *(C2a delivers stages, Sets,
   dev/casting, and layout-via-load-in; crew and talent-as-capacity are explicit
   deferrals the Owner signs — §18.1c.)*
2. When capacity is unavailable: QUEUE, DON'T MAGICALLY FORBID — the player knows what
   waits, what it needs, what occupies it, and how to relieve it.
3. Sets are real production resources: buildable, placeable, reservable, occupiable,
   genre-weighted, physically used for rehearsal and shooting.
4. Stages are player-built production capacity.
5. Engine state owns reservations and outcomes; animation is evidence only.
6. The Founding Flip is ratified; C2 performs it once every required first-movie
   facility has a legitimate build path (split into C2b — recommended, §2).
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
    terminal year. (`BlueprintRequirement`'s `date` kind is already week-indexed —
    `types.ts:837` — so unlock gating is calendar-safe by construction; §14 G15 makes
    era-cleanliness a gate.)

**Honesty note (lane 3):** two of these laws are deliberate divergences from the
original, not parity. The Movies (2005) had *no* soundstage building type (its "Stage"
is a pre-built generic Set — `set_catalog.csv` SET_STAGE_GENERIC; Bible §4:691) and
*no* queue (occupied sets hard-blocked in red — Bible :1069). Laws 2 and 4 are
modernizations we choose on their merits; the corpus supplies shapes and legibility
patterns, never authority for these two.

---

## 2. C2a / C2b — the split is RECOMMENDED, on evidence

**Recommendation: split.** C2a = Sets, Stages, Throughput & the Living Studio
(SaveFileV14). C2b = the Founding Flip (SaveFileV15), immediately after, before C3.
One charter (this document) governs both; C2b needs no new planning pass, only its GO.

Why (lanes 4, 5): the Flip breaks **three sealed engine invariants that the save
validator itself runs** — the four-capability managed invariant
(`operations.ts:364-371`, architect-verified), the positional `placement-v12` facility
policy (`operations.ts:413-437`), and the single-arm `activateStudioOperations`
(`actions.ts:1273-1279`) — so a Gate+Admin studio is today *unloadable*, not merely
unbuildable. It is additionally a property re-authoring job (vacated footprints belong
to no parcel — `lot.ts:91-94`; the post-Flip map is a world/art pass of its own) and a
UI campaign (hard-coded founding BuildingId references measured at a raw-grep upper
bound of 386 non-test lines — a type-aware re-count is C2b-M3's first task, §7.5 —
plus frozen journey shapes with a closed validator). C2a meanwhile delivers every
blueprint the Flip needs. Two bounded seals beat one unboundable one; the master plan
§6 (:256-257) pre-authorized exactly this contingency.

*(C2a's own ground problem is NOT deferred to C2b: §3.4 ships a bounded C2a ground
amendment, because the review proved no existing road-served parcel holds a 4×4 stage
plus its clearance ring.)*

---

## 3. Domain model — Stage, Set, reservation, queue

### 3.1 Stage and Set (the fork, ruled)

**A Soundstage is a buildable FACILITY; a Set is a first-class ENTITY; shooting
requires both.** This is the hybrid the code already leans toward (`shooting` requires
`soundstage` + `set-scenery`, `operations.ts:87`, architect-verified), the corpus
supports (facilities and sets share one blueprint/finance/maintenance schema —
`schema_fields.csv`; sets carry per-genre float weights + a priority genre —
`set_definition_schema.csv` TECH-SET-008), and owner laws 3 and 4 both name.

**Soundstage.**
- A `FacilityBlueprint` with capability `soundstage`, capacity 1
  (`simultaneousProductions: 1` — every capacity field names its unit; the original
  dataset's twenty-year units ambiguity is not reproduced).
- **One stage class in C2a (Standard, 4×4).** Soundstage (Large) is deferred (§19):
  the review verified `bakeStage()` (`ui/src/lot/tycoon/assets.ts:872-892`) is
  parameterised by texture key ONLY — footprint/height/rise are hard-coded — so a
  second footprint is named art+code work, and no road-served parcel holds a larger
  footprint. When Large returns, `bakeStage` gains a spec argument (the
  `bakeStageFromSpec` shape already used by the legacy renderer).
- **Stage bodies are procedural in BOTH worlds via the shared snapshot path** (the
  C1-M4/M5 placed-blueprint precedent: placements compose bodies in both origins).
  What law 27a forbids is new *authored plate cells* butted against the Stage 7
  painting — not snapshot-composed bodies. The M2 both-origins render gate therefore
  stands, and the plate world's placed-stage bodies are honest massing, never hero art.
- **Each stage has two slots of different kinds**: one **production slot**
  (`stage:<facilityId>:0` — the capacity the allocator grants) and one **mount slot**
  (`mount:<facilityId>` — held by the currently mounted Set). A mounted Set NEVER
  consumes the production slot; "occupied" on a stage sign means a production is
  shooting, not that a set is standing. (This ruling is what keeps the endowed studio's
  Stage 7 production slot free at week 0 — asserted by a named FMJ regression.)

**Set.**
- A new state root `state.sets` (schema §8.1). Stat block, with **V1 semantics wired,
  not decorative** (r1 shipped shown-but-inert numbers; the review killed that):
  - **quality** (0–100, SHOWN): with genre fit, feeds ONE bounded additive uplift to
    the bound picture's strength — `SET_QUALITY_UPLIFT_MAX`, `SET_GENRE_FIT_UPLIFT_MAX`
    — locked at bind, applied through the facility-effects uplift seam whose exactness
    the C1 economy snapshot §3a already proved ("the uplift lands EXACTLY as
    authored"). Bounded-term tests per G3; drivers shown at the package surface
    (master plan's RCT3-DIAGNOSTICS-001 law).
  - **novelty** (0–1, SHOWN; per-INSTANCE; locked at bind; depleted per release by
    `SET_NOVELTY_DEPLETION_PER_RELEASE`): multiplies the release's success/box-office
    draw within named bounds (`SET_NOVELTY_RECEPTION_FACTOR_MIN..1`) — the corpus's
    stage-4 "audience boredom with repeated sets" shape with our numbers. Per-instance
    is an explicit ruling (a duplicate stage+set is simultaneously a concurrency AND a
    freshness purchase); the original's novelty-lock claim is single-source and we
    adopt the lock as our own decision, not recovered parity. A canceled production
    burns no novelty (corpus: decay happens at release) — asserted by test.
  - **condition** (0–100, SHOWN): wears by `SET_CONDITION_WEAR_PER_PRODUCTION` at each
    wrap (per-use, not per-idle-week — deterministic and no idle-decay chore); below
    `SET_CONDITION_UNUSABLE_THRESHOLD` the set **gates use only** (the
    manual-corroborated reading; the corpus contradicts itself on a quality penalty —
    Bible §7.1:1052 vs `movie_rating_pipeline.json` stage 2 — so the penalty is
    deferred, recorded). **The repair loop ships in the SAME milestone (M2):** repair
    is a player action through the Scenery Workshop (`SET_REPAIR_COST`,
    `SET_REPAIR_WEEKS`, occupying one `set-scenery` slot), and "Repair this set" is a
    `Remedy` (§3.3). Shipping decay without repair would manufacture a permanently
    unrelievable queue reason — owner law 2 forbids exactly that.
  - **weighted genre affinity + priority genre**: produces the fit component of the
    quality uplift. **Genre fit is ADVISORY, never a gate** — any set can shoot any
    picture; a poor fit costs uplift and is warned at the package surface. This is the
    ruling that makes the generic house sets universal (a low-quality, low-fit floor)
    and keeps set *availability*, not matching, as the queue constraint.
- **A Set is REQUIRED to shoot; WHICH set is a quality choice.** The requirement binds
  only productions greenlit in managed mode at V14+ (a `requiresSetBinding` marker set
  at greenlight — §8.1). The legacy/headless path is untouched (same scoping as the
  event ledger, §5 pin 5), migrated in-flight productions are grandfathered (§8), and
  directly-constructed test states without the marker are untouched.
- **Mounting and striking.** A Set is commissioned AT a named stage (interior mount)
  and its construction occupies a Scenery Workshop `set-scenery` slot for its build
  weeks plus the target stage's MOUNT slot — never a production slot, so set
  construction can never cycle with productions (lane 2's X3 closed by construction).
  **Strike** is a player action (instant in V1, `SET_STRIKE_WEEKS = 0`, a named zero),
  refused while a production binds the set (blocked-state grammar names the holder).
  Demolishing a stage with a mounted set is refused ("Strike the set first"); a struck
  set is retired (Tier-D `setRetired` event, `setDemolitionRefund` ledger row at the
  depreciated fraction). Cycle dispositions, recorded: X1 (set↔stage) — impossible,
  stage+set acquisition is atomic (§3.2); X2 (set↔set) — multi-set films are OUT of
  V1; X3 — closed above; X4 (post↔stage via reshoots) — reshoots are out (§19);
  X5 (crew) — crew-as-capacity deferred (§19).
- **Set demand**: a screenplay derives a *preferred set category* from its shape/genre
  (pure function, no new authored taxonomy beyond the set families); the package and
  greenlight surfaces show the demand, the best-fit candidate, and the projected
  uplift. Advisory in V1 (above). The corpus's scene→set table was never recovered
  (lane 3) — this derivation is ours, and says so.
- **The founding endowment: TWO generic house sets** — "Stage 7 House Set" and
  "Stage 12 House Set" (modest quality, neutral genre weights; the corpus's own
  SET_STAGE_GENERIC precedent, one per stage). Minted by `activateStudioOperations`
  alongside `INITIAL_STUDIO_FACILITIES` (worldgen cannot mint them — it produces
  legacy operations with zero facilities, `worldgen.ts:665`), and synthesized by
  `migrateToV14` for saves already in managed mode (a founding-plant fact — the same
  reasoning `convertV12ToV13` used to synthesize INITIAL_PROPERTY). Consequence:
  **the endowed studio's founding capacity is exactly today's** (2 stages, 2 sets,
  scenery 2, dev/casting 2, post 2) — every sealed spec including the two-production
  paths runs unmodified, the FMJ golden path auto-binds a free house set, and a
  migrated save can reach its next greenlight (gate in §12-M2). Auto-bind fires when
  exactly one candidate set is free; otherwise the package surface asks.
- Set unlock gating reuses `BlueprintRequirement` verbatim (TECH-SET-007: the original
  used the identical mechanism for sets and facilities; the kind switch at
  `blueprintRequirements.ts:104-118`, aggregator at `:170-190`).
- **Display-name authority, ruled at M2 before any queue copy:** the engine facility
  name ("Soundstage 7", "Soundstage 12" — `operations.ts:30-31`) is the single spoken
  authority; the world signs STAGE 7 / STAGE 12 remain signage. Specimen queue copy,
  against real names: *"Waiting on SOUNDSTAGE 12 — occupied by RAVINE until Week 14."*

### 3.2 The reservation model

The engine's existing primitive is kept and generalised, not replaced (lane 1: the
per-owner `facilityId:slot` reservation with atomic all-or-nothing phase allocation is
correct, fail-closed, and leak-free today).

- **One named union producer.** `occupiedResourceSlots(state)` lands at C2a-M0 as a
  standalone refactor replacing the six independent hand-walks lane 1 enumerated
  (its §2 register: two copies each of two private helpers, `studioCalendar`
  facilityViews, three invariant walks, `facilityEngagements`). Billing, corrected by
  the review: the existing allocation paths are already cross-owner aware
  (`castingSessions.ts:234-237`, `tick.ts:206-213`), so the new fail-closed invariant
  is **defense-in-depth plus the extension point Sets need**, not a live-bug fix.
  M0 discipline: behaviour-identical on every legal state (replay + save
  byte-identity on the sealed fixture corpus); the new cross-owner refusal proven
  non-vacuous on a forged fixture. If any existing save trips it, that is discovered
  at M0, not shipped.
- **Kind-qualified keys** before Sets exist: `stage:<facilityId>:<slot>`,
  `set:<setId>`, `mount:<facilityId>`, plus the existing facility keys — no flat
  namespace collisions.
- **Bindings are NOT reservations.** `workflow.bindings = { stageFacilityId, setId,
  lockedNovelty, lockedUplift, heldSinceWeek, requiresSetBinding }` (§8.1) is the sole
  record of set occupancy; `requirementsForPhase` is UNCHANGED (soundstage +
  set-scenery stay exactly as shipped); set exclusivity is enforced through
  `occupiedResourceSlots` keyed `set:<setId>`; the exact-capability-multiset invariant
  (`operations.ts:463-468`) is untouched. (r1 stated two incompatible models here;
  this is the ruling.)
- **The acquisition gate: stage + set atomically at REHEARSAL ENTRY** — the phase gate
  that already acquires the soundstage. The greenlight surface shows an advisory
  match; the binding becomes authoritative at rehearsal entry; if the planned set is
  taken by then, the production holds at the rehearsal gate and the queue names it.
  Stage AND set are retained together across rehearsal→shooting (extending the
  existing retention rule, `operations.ts:133-143`). `heldSinceWeek` is stamped at
  acquisition and **preserved across phase entry for retained resources** (the sealed
  whole-object reservation comparison in `tests/construction-core.test.ts:442-471`
  constrains this — the field lives on `bindings`, not on the reservation objects,
  precisely so those assertions stand).
- **Acquisition rank (deadlock-freedom by construction):** every waitable resource
  kind carries an explicit integer rank — `development-casting(1) <
  stage+set-composite(2) < set-scenery(3) < post(4)` — with an invariant asserting no
  workflow ever waits on a resource ranked ≤ anything it holds. The stage+set
  composite is one atomic rank-2 acquisition (all-or-nothing), which is what makes
  rank 2 a single node and X1 impossible. `set-scenery` is ranked (r1 omitted it —
  the review caught that the one hold-and-wait edge shipping today, retained-stage-
  waiting-on-scenery at `remainingTicks 6`, was unrankable). **No preemption, ever.**
- **A production blocked entering post KEEPS its stage and set** (forward-rank waits
  cannot cycle — this is starvation-risk, not deadlock-risk). The relief is buildable
  post capacity plus the joined surface: "Post is full — that is why Soundstage 7 is
  still busy." This hold-vs-release choice is a **Tier-1 Owner decision** (§18.1f)
  with the trade stated, because at the recommended 3–4-picture target the founding
  post capacity of 2 makes head-of-line pressure a designed experience, and the
  red team explicitly hunts it (§15).
- **Sticky reservations.** Lane 2's R-1 finding: non-soundstage reservations silently
  migrate to a lower-id facility across phase entry, violating the Annex contract's
  "no reservation migration" clause (`DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:500`)
  and teleporting people between buildings. C2a-M0 makes retention sticky for ALL
  capabilities — a contract-conformance repair, named as such.

### 3.3 The concurrency model and the queue

**`MAX_CONCURRENT_PRODUCTIONS` is DELETED, not raised** (a bigger magic number is
still a magic forbid). Admission model: **Phase-Gate Admission** (lane 2 candidate B)
— the atomic hold/retry mechanism already running at phase transitions becomes the ONE
mechanism everywhere:

- **The four front-door refusals become queued intents** (greenlight cap
  `actions.ts:333`; greenlight dev-slot `operations.ts:217-221`; commission
  `scriptDevelopment.ts:270-274`; casting start `castingSessions.ts:302-304`).
  A queued intent is a **discriminated union row carrying the full action payload**
  (§8.1) — commission and casting-start today mint their entity and reservation in one
  call, so the waiting intent must persist everything needed to mint later. **At
  dequeue the payload is revalidated**; an intent no longer legal (writer signed away,
  concept gone, cash below the lump) is dropped with a Tier-W `queueIntentExpired`
  event and a stated reason. **Nothing is held while queued.** Intents upstream of
  greenlight name **script projects** (never minting a production id before
  greenlight — lane 5's identity rule). Greenlight commitment semantics are unchanged:
  cash debits and talent locks at greenlight, after which the production waits at
  phase gates, not before.
- **Queue state is persisted** (V14): explicit integer `queueOrdinal` at admission,
  `queuedWeek`, and per-gate ordering **longest-waiting-first, ordinal tie-break** —
  deterministic (integers in state, law 23), replacing bare ascending-productionId
  whose one-week unfairness a committed test demonstrates
  (`tests/operations.test.ts:433-541`) and whose `prod-0012-10 < prod-0012-2`
  string-sort bug becomes reachable at N>2. **That test's assertions are inverted by
  this design on purpose** — its retirement/rewrite is enumerated in §11.8; it is not
  a silent casualty. Guardrail (`00B`.2): the fairness fix is the ORDINAL — existing
  production-id format and values are permanent and are never re-minted or
  reformatted to sort better.
- **The weekly sweep is a fixed-point allocation pass** (replacing r1's circular
  "two-pass"): each week, transition attempts run in queue-priority order; any
  successful transition releases its predecessor resources into the pool immediately;
  the sweep **iterates to a fixed point** (bounded by the workflow count) so capacity
  freed by anyone this week is visible to every still-waiting production this same
  week. "Due for release" needs no oracle: releases happen only through successful
  transitions, terminal completion, cancellation, and demolition/strike refusal paths —
  a blocked production releases nothing (§3.2). Queue admission for front-door intents
  runs as a **new inserted tick step** (after production allocation, before
  construction completion) under D-12 §9's ratified insertion mechanism ("inserted,
  not reordered" — the tick pipeline's own documented extension rule), so the frozen
  ordering law is satisfied, not superseded.
- **The blocker becomes legible** (owner law 2): `ProductionBlocker` widens to name
  the full unmet requirement set — primary reason first, `alsoMissing` for the rest —
  including the new `set-unavailable` kind (a Set is not a `FacilityCapability`; the
  union gains the arm), plus `occupiedBy: [{resourceId, ownerId, title, activity,
  freesInWeeks}]` (computable from `studioCalendar`'s occupant views plus
  `remainingTicks`) **and `remedies: readonly Remedy[]`**, where `Remedy` is a defined
  union: `{kind:'build-blueprint', blueprintId, cost, weeks}` /
  `{kind:'wait-for-holder', resourceId, ownerId, freesInWeeks}` /
  `{kind:'repair-set', setId, cost, weeks}` / `{kind:'strike-and-mount', stageId,
  setId}` / `{kind:'cancel-queued-intent', intentId}`. Its producer is a core read
  model whose inputs are the catalog (`FACILITY_BLUEPRINTS`/`SET_BLUEPRINTS`),
  `evaluateBlueprintRequirements`, and the occupancy union — the r1 claim that
  remedies were "already computable from studioCalendar" was false and is withdrawn.
- **The queue has a player surface, owned and gated** (r1's biggest product hole):
  world-native, the **Call Board** at the blocked site (§4.2); deep, a **queue panel
  on the Production Board/Calendar** rendering all four law-2 facts — what waits /
  what it needs / who occupies it / actionable remedies (remedy rows route into the
  build catalog) — for BOTH production waiters and pre-greenlight script-project
  intents. One core read model `studioQueueView(state)` (beside `studioCalendar()` in
  `src/core/studioCalendar.ts`) feeds Dashboard, Calendar, and Lot; OPUS-SCREENS owns
  the React surfaces (§13); gate G16 asserts the four facts are rendered non-empty for
  every waiter in a seeded contended run.
- The rewrite of the reachable-blocker invariant (`operations.ts:531-549`, waiting
  outside remainingTicks 7/6/4) is **audited-invariant surgery under law 28** — this
  charter at Owner GO is the explicit instruction law 28 requires.

**Throughput honesty:** the cap is currently the ONLY binding constraint — hand-derived
0.25 films/wk against a physical binding ceiling of **~0.40–0.50** (development-
casting; soundstage sits at 0.67, set-scenery and post at 1.00 — lane 6's own
conclusion; r1's "0.40–0.67" fused independent ceilings and overstated the headroom).
Figures are harness-measured at M3 before any is quoted as a result. Deleting the cap
without a second real constraint hands players a free ~1.6–2.0× jump, so deletion
lands in the same milestone as buildable stages, with mandatory Sets already live —
sets and stages are the physical constraints that replace it. **G10.1 is the
campaign's real acceptance test**: the C1 economy snapshot proved purchased slots are
inert at the ceiling ("4 of 5 seeds byte-identical … the extra capacity converted
entirely into idle slot-weeks"); after C2a the same measurement must show them no
longer inert on ≥4 of 5 seeds.

**Consumers of the deleted constant, dispositioned** (regenerated by
`grep -rn MAX_CONCURRENT_PRODUCTIONS src ui tests scripts` at HEAD — 26 files, not
r1's "nine"; the audit list in §9 is command-generated, split into denominators /
policy gates / player-facing copy / pinned assertions):
- `src/core/agents.ts:62`: agents gain a named **`AGENT_MAX_SLATE = 2`** policy
  constant decoupled from the deleted engine cap — the sealed M0A acceptance corpus
  (100 seeds × 2 agents × 52 ticks) stays byte-identical because agent behavior is
  unchanged.
- `src/core/scriptReadModel.ts:624-632`: the `production-capacity` blocker kind and
  its "N of 2 productions active" copy are re-based by M3 (a closed-union schema
  change with its hostile-input guards, named in §8).
- `ui/src/screens/Assembly.tsx:1325,1336` + `economyView.ts:205-210` +
  `adapter.ts:2179`: the D-17A break-even's hard-coded `concurrency: 2` second line
  ("if a second film shares those weeks") becomes derived from live capacity — in the
  §10 fix table because the literal `2` is invisible to a constant-symbol audit.
- `scripts/measure-c1-economy.mts`: C1 sections freeze the literal 2 as historical
  context so they keep reproducing; C2 sections parameterize.

### 3.4 Required buildable facilities (the build-path gap, closed)

`FACILITY_BLUEPRINTS` today: five entries, zero soundstage, zero post, zero effective
set-scenery (architect-verified: `tuning.ts:748-754`; the Craft Annex's `set-scenery`
is capacity 0). C2a authors:

| Blueprint | Capability | Notes |
|---|---|---|
| Soundstage (Standard) | `soundstage` ×1 | The headline; one class in C2a (§3.1) |
| Post Building | `post` ×N | Relieves the head-of-line hold honestly |
| Scenery Workshop | `set-scenery` ×N | Set construction, repair, and load-in supply |
| Baseline Development & Casting Office | `development-casting` | From-scratch path (Flip prerequisite). ONE baseline blueprint — r1's separate "Baseline Casting Office" with the identical capability is cut: the engine deliberately refuses same-effect fictions (`lot.ts:230-238`'s honest empty list), and whether `casting` becomes its own capability is folded into the Owner's concurrency ruling (§18.1a) |

Deferred from this table with reasons: **Crew Quarters** (crew-as-capacity deferred —
§0.1, §19; when it returns it arrives with founding supply and a grandfather, the
lesson this review taught); **Soundstage (Large)** (§3.1). The corpus note r1
over-claimed is corrected: the original's crew model shares the auto-filled-quota
shape (Bible :970, :1599, :1603) but its crew carry per-person experience feeding
Production Quality (Bible :1597; `movie_rating_pipeline.json` stage 2) — our
anonymous-slot model, when it ships, is a deliberate simplification, and the corpus
no-mood claim is INFERRED per its own source.

**The C2a ground amendment (new in r2, review-forced):** road-served buildable ground
today is 107 cells across six disjoint parcels, the largest 6×4 — no existing parcel
holds a 4×4 stage plus its clearance ring (lane 4's arithmetic, verified against
`lot.ts:96-167`). C2a-M2 therefore ships a bounded property amendment: **road
frontage to `north-back-lot`** (7×6, the one parcel that fits a stage plus ring,
deliberately road-less today — `lot.ts:87-89`) and its re-parceling as buildable —
authored under laws 25/27a with its own re-pin, sized ONLY for C2a's slate (the full
post-Flip parcel map remains C2b-M2). The M2 gate's 4-stage studio and the playtest's
stage-building are placeable because this item exists.

Founding facility capacities move from object literals (`operations.ts:26-31`) into
TUNING (the project's own convention, currently violated).

---

## 4. The Living Studio — time model + simulation theater

### 4.1 Time model: Living Turn V1 (ruled; full spec in `08A`)

The engine's discrete week stays the only authoritative clock; the UI gains a
presentation scheduler: **while unpaused — play week N as witnessed time (the shipped
10-beat playback, widened to the manufacturing loop), commit the identical
authoritative advance a manual press commits, consult the stop ladder, repeat.**

- **The auto-pause ladder is PARTITIONED** (r2; the Owner ratifies the partition at
  §18.1e): **PAUSE-class** — `release` (the Premiere), `scriptReview`,
  `castingReview`, `productionDecision`, `cashNegative` — the loop pauses with the
  stop surfaced exactly as today. **NOTIFY-class** — `wrap`, `runCompleted`,
  `constructionCompleted`, `contractExpired`, `renewalWindow` — surfaced through the
  existing attention/badge channel and the played week's beats; the loop continues.
  Unpartitioned, a busy studio pauses every week or two and the proof sentence is
  defeated by the spec itself (the review's arithmetic against the ladder at
  `adapter.ts:2367-2437`).
- **Pause and speed are player controls**: ladder **1× / 2× / 4×** (4× the ceiling) on
  `PLAYBACK_BEAT_MS` (today 1,150ms → ~11.5s/week at 1×, ~2.9s at 4×). Above 2×,
  Class-B witnessed beats collapse to final positions via the existing reduced-motion
  path while Class-A state stays continuous — speed never yields half-played
  ceremonies. Reduced motion = instant final positions, cadence continues.
- **Living time runs on the Lot only** (stated here because the Owner ratifies the
  shape): Dashboard and other screens keep explicit advance verbs; the ruling's "the
  world lives while unpaused" is delivered where the world IS. The queue is consultable
  without leaving living time via the world-native Call Board; the deep queue panel is
  a paused/overlay surface (§16's script reflects this).
- **"Advance to next event" survives as fast-forward** with its FULL unpartitioned
  stop ladder and unchanged batch semantics (law 3: one stop, one summary, never
  narrated weeks).
- **The mandatory engineering rule** (LL EX): the scheduler consumes an **extracted,
  exported per-tick stop predicate** — `simStopFor(before, after): SimStopReason |
  null` pulled out of the inline batch loop (`adapter.ts:2349-2440`; today the
  single-week path returns no stop reason at all). This extraction is named M4 work,
  owned by OPUS-ENGINE-CORE and landed BEFORE OPUS-TIME's scheduler consumes it (§13).
  The ten-reason priority ladder is never re-implemented in React.
- **The scheduler pauses with the renderer** (hidden tab = paused studio; PF1 §0.7,
  appendix) — living time never advances a studio nobody is watching.
- **Determinism proof obligation:** byte-identical exported saves across
  hand-advanced / living-loop-at-any-speed / paused-resumed / batch-skipped twins of
  the same seeded action script. The loop emits actions; it never becomes an
  authority. Guardrail (`00B`.6): `market.tick` remains the authoritative integer
  week — **Living Turn V1 persists NO intra-week position** (playback progress is
  transient presentation); any future variant needing one adds new V-next state
  rather than redefining week semantics.
- **The release-week playback hole closes FIRST** (`App.tsx:2525` gates week playback
  on `released.length === 0 && resolvedReturnContext.kind === 'lot'` — both conditions
  matter): the week a movie ships is the one week the lot never plays. Prerequisite
  for both living time and Premiere Night.
- The ten-plus frozen refusals of autoplay/pause/speed are superseded by the Owner's
  ruling — enumerated at verified lines in §11.3. Model C stays refuted; B3
  (beats-in-tick) stays a C3+ paper spike; BEATS_PER_WEEK authority resolved for C2 in
  favor of `presence.ts` (presentation canon, not outcome law).

### 4.2 Simulation theater (owner laws 5 + 8)

Every theater element is classified **Class A — state projection** (true of the
settled week; renders identically on load, after a batch, mid-playback) or **Class B —
witnessed time** (plays only inside the played week, inheriting the existing law-3
gate at `StudioLotScreen.tsx:4382-4406`). C2's throughput legibility lives in Class A;
Class B carries arrival/wrap/premiere moments.

Shipped machinery is widened, not reinvented: presence beats/routes/playback (law-
clean, pinned), occupancy captions, stage lamps/chips, the scenery yard→dock line, the
shared queue-chevron layer. The Stage-7-hardcoded surfaces generalise to N facilities
(the enumerated list and count are fixed by command at M2, cited per lane 7 — r1's
"four surfaces" was an unverified count). New subjects: stages hot/dark, sets
mounted/striking, crates accumulating for queued work, wrap clearing the stage.

- **Queue physicality — the committed deliverable is Option B, "the Backed-Up Lot"**
  (procedural crates/flats/truck massing on the apron of the contended stage, one
  element per waited week, capped, cleared by wrap — corpus-faithful, pure Class A,
  draw-call budget named at re-pin). **Option A, the Call Board** (placard at the
  blocked site naming picture / need / occupant / free-in-N / REMEDY — the remedy line
  added in r2), ships as the floor *and* as the queue's world-native reading either
  way. The de-scope decision — "if the campaign runs long, a placard is what ships" —
  is the Owner's to make knowingly at §18.1g, not a silent gate-invisible fallback
  (r1 left it silent; the review refused that). Option C ("the queue is a place")
  stays deferred.
- **The eight ambient patrol actors are GROUNDED**: each becomes conditional on an
  authoritative fact (grip patrol only under a live set-scenery reservation; publicity
  walker only during an active campaign). Converts a live owner-law-8 violation into
  an exemplar with zero new art.
- **"Layout visibly affects cost/schedule" is delivered narrowly and the Owner signs
  the narrowing** (§18.2): scenery load-in gains real duration derived from
  engine-owned grid distance between the supplying Scenery Workshop and the bound
  stage (`SCENERY_LOAD_IN_WEEKS_BASE` + `_PER_DISTANCE`; pure function). General
  travel-time-as-outcome stays out of C2. Budget line: this moves the accepted
  Scenery Load-In V1 UI contract, its save biconditional, presence ruling, and four
  SHA-256-pinned fixtures together — the V1 Keep gate is re-proven inside the
  milestone, and the contract's own exclusion list is superseded in §11.6.
- **Re-pin discipline** (five rules, C1-M6 template): once per milestone; measured
  three-part reasons; actor-count moves argued as changes of KIND; both worlds re-pin
  together; plate re-pins labelled rollback-world maintenance. C2's theater moves
  actors, so the C1-M6 control inverts: actors move, authored object counts hold.
  No committed canvas digests exist — human visual review remains a mandatory gate.

### 4.3 Wrap (defined)

**Wrap is the authoritative completion of shooting — automatic, not a player
command.** Split across the campaign correctly (r1 tangled the engine and UI halves):

- **M1 (engine, PF1-independent):** the shooting→post reallocation (the silent
  `remainingTicks 4→3` boundary) emits a Tier-D `wrapped` event in `studioEvents` at
  the moment stage and set are released. The fixed-point sweep makes the freed
  capacity allocatable the same week. This is the event-model's worked example.
- **M4 (UI, post-PF1-seal):** `SimStopReason` gains its eleventh member `wrap` —
  **inserted immediately after `productionDecision` and before
  `constructionCompleted`** (exact position pinned; r1's "above runCompleted" band
  contained `constructionCompleted` ambiguously). Wrap is **NOTIFY-class** in the
  living loop (a witnessed beat, not a pause — §4.1) and a normal stop in the batch
  verb. Named required work with owners, from the review: a `wrap` arm in
  `simStopMessage` (today's `default:` would print the 520-week-guard sentence — a
  G12 violation), a `wrap` entry in `EXACT_STOP_REASONS`
  (`nextEvent.ts:169-178`), a `targetFor` arm (`nextEvent.ts:688-689`), and
  compile-time `never`-exhaustiveness guards on both switches so a twelfth member can
  never fail silently. PF1's cue-grammar exhaustiveness test fails on the new member
  by design (appendix — PF1 reserved the wrap tier slot); the tier-table update lands
  with this milestone.

Explicitly excluded: reshoots, partial wrap, strike duration, wrap-party anything.

---

## 5. The event model (docket adjudicated)

**Ruling recommended: Option A — a persisted, engine-appended `studioEvents` ledger at
a new V14 root.** (Lane 11's docket; lane 5 independently recommended transient
emission + a durable wrap witness — the adjudication is recorded: lane 11's
blast-radius measurement inverts the intuition that transience is cheap — ~1,046
`tick`/`applyActions` call sites vs ~26 files with zero signature changes — and 6 of
12 C2 consumers need history, which transience cannot serve. Lane 5's determinism and
classifier-pollution concerns are answered inside Option A: engine-only append inside
the pure closure; its own root, never a cash-ledger `kind`.)

Pins:

1. `studioEvents` is appended **only by `src/core`** ("the engine" in this charter
   means `src/core` alone; `ui/src/engine/adapter.ts` is the boundary layer). No
   `seen`/`consumed`/`acknowledged` field may ever enter the schema — byte-parity
   (PF1 §2, quoted in the appendix) holds because the ledger is a pure function of
   (seed, actions, ticks).
2. **Witness, never input.** No sim step, legality check, read model, or invariant
   branches on it — single recorded exception: `persistedProductionIds` identity
   reservation walks it (law 20), enforced by an invariant test that no other
   src/core module reads it.
3. **Two-tier retention; Tier D is the identity-bearing tier.** Tier D permanent:
   `premiere`, `wrapped`, `constructionCompleted`, `setBuilt`, `setRetired`,
   `queueIntentExpired-with-production-consequence` — **every kind whose row carries a
   production id that must outlive the window is Tier D** (law 20 demands the
   longest-lived authority; a compacted row cannot be one — r2 closes r1's
   contradiction). Tier W windowed by `STUDIO_EVENT_WINDOW_WEEKS` (reservation
   grants/releases, queue admissions/promotions, phaseEntered, sceneryArrived),
   compacted as a pure function of `market.tick`; `nextSeq` never rewinds.
   **Windowing applies to `studioEvents` ONLY: the cash `state.ledger` is permanent
   history and is never pruned or windowed (`00B`.5).**
4. **Exact-once = idempotent-above-a-cursor:** monotonic `seq`; presentation holds
   `lastConsumedSeq` outside GameState; on cursor loss, REPLAY. This retires the ~27
   manual `setLotCadenceFeedback(null)` sites (36 call sites total —
   `grep -c "setLotCadenceFeedback" ui/src/App.tsx` at HEAD; r1's "20" was stale) and
   survives reload.
5. **The M0A gate is preserved:** the ledger is EMPTY on the legacy/headless path
   (gated on `operations.mode === 'managed'`); `tests/acceptance-corpus.test.ts`
   byte-identity holds without re-baselining (its comparison is two in-run replays,
   so an empty root is byte-neutral there — verified by the review).
6. **Migration is five phases and never goes red** (root lands writing nothing →
   engine writes, nobody reads → dual-run equality vs all 17 diff-detectors on their
   own fixtures → detectors flip to log projections preserving exported signatures →
   detectors retire after a full green seal cycle). New C2 consumers are log readers
   from day one.
7. A one-off save-size measurement (`exportSaveJson` length at weeks 52/208/520) runs
   BEFORE the retention window is fixed.

---

## 6. Premiere Night V1 + Theater disposition

**Theater: PERMANENT LANDMARK (T1), recommended for ratification.** The strong legs
(lane 9): no exhibition capability exists in the four-member `FacilityCapability`
union; the C1 F2 seam proves capacity-0 buildables are structurally unengageable; the
original released from the Production Office, not a cinema. The corpus leg, stated at
its actual confidence (r2 downgrade — r1 said "verified debug content"): the only
cinema artifact recovered is a **LOW-confidence, mod-archive-sourced** `facility_
cinema.ini` (given=0, debug mesh) that the register itself marks DORMANT OR
UNCONFIRMED with the instruction "Do not conclude a Cinema facility was ever
player-accessible" — supportive, not probative; the landmark ruling is a design
decision on merits, presented as such. Consequence ratified with it: **the Flip's
minimum starting lot includes the Theater** (Gate + Admin + Theater + road + parcels)
— amending the master plan §6 minimum-lot sentence and closing its self-contradiction.

**Premiere Night V1: Option A — "The marquee lights and the company comes."** On a
lot-origin release week the player is NOT teleported off the lot: the Theater marquee
takes the film's title (the named-title marquee exists on the legacy renderer only —
`signage.ts:151-233`, imported solely by `LotScene` — **the port into TycoonScene is
required work**), the frozen `FilmResult.participants` walk the existing authored
paths to the Theater, a crowd sized by a bounded deterministic function of opening
gross forms, and the Gazette opens from a world receipt on the Theater into the
untouched NewspaperReveal → ReleaseResult → Autopsy chain. **Option B ("marquee only")
is the de-scope floor the Owner pre-approves or refuses at §18.1g.**

Pins:
- **Zero-cash ceremony** (`PREMIERE_NIGHT_COST` a named zero; on the GO sheet at
  §18.2 — lane 10 escalated pricing as an Owner decision and r1 left it off the
  sheet). If ever priced, lane 10 §5.5's measurement protocol applies.
- **The amplifier pin, split correctly (r2):** the *corpus* invariant is about
  artistic quality only — "none may make a poorly developed and poorly produced film
  artistically good … A weak movie may still become profitable"
  (PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md:87, which explicitly contemplates
  amplifiers moving revenue). The **zero-engine-delta rule — a V1 premiere changes no
  reception, box office, standing, awareness, prestige, or cash — is a CHARTER
  RULING**, made so Premiere Night cannot become a second degenerate awareness
  purchase beside the publicity ladder (lane 10's evidence). G7 gates the ruling.
- **The attendance question, ruled** (lane 9's G3, which r1 silently skipped):
  premiere attendees are read from the frozen `FilmResult.participants` and framed as
  *attending an event*, not working a reservation; the anonymous crowd is a **Class-A
  projection of an authoritative number** (opening gross; named constants
  `PREMIERE_CROWD_PER_GROSS`, `PREMIERE_CROWD_CAP`, living UI-side per §9). §15's
  "single unexplained mover" criterion carries an explicit carve-out naming both.
- Premiere is **PAUSE-class** under Living Turn (§4.1); plays once, on the stopping
  tick, never narrating skipped weeks; falls through to today's exact setScreen path
  on any staging failure; multi-release weeks stage ONE sequence naming both pictures.
- **Prerequisite: the week-authority fix.** `releaseTick` is stamped pre-increment and
  printed as the Gazette's date while the player stands in releaseTick+1 — behaviour,
  not just copy: the real chain is `adapter.ts:6476` deriving
  `weeksAgo = week − releaseTick`, consumed by `vignettes.ts:289-290` (world
  reactions) and `buildingInspector.ts:640` ("released this week"), beside the direct
  prints at `adapter.ts:5268`/`newspaper.ts:647`. One convention is ruled
  (recommendation: present the release week as the week the player stands in; stamp
  unchanged, presentation derives uniformly) and applied across **the enumerated
  surface list — marquee, Gazette masthead/week field, `weeksAgo` consumers (vignettes,
  building inspector), ReleaseResult, the release stop message, Chronicle/clippings —
  regenerated by command at M5** (r1's "seven printing surfaces" was an unverifiable
  count; the enumeration-by-command is the gate).

If PF1's cue grammar shipped, its tier-1 release sting becomes the premiere's downbeat
(one-owner law, no double-announce); if PF1-M2 was KILLED, the premiere is silent but
complete — no hard dependency on `eventGrammar.ts`.

---

## 7. The Founding Flip (C2b)

**Definition:** a NEW fresh studio begins with Gate + Administration + Theater (per
§6) + frontage road + vacant parcels, and builds the filmmaking operation. A flipped
studio is a new game; **migrated saves never experience the Flip retroactively** —
they keep their founding plant forever.

1. **`foundingRegime: 'endowed' | 'bare-lot'`** — one durable monotonic top-level V15
   root (the `economyEngagedEver` pattern), written once at worldgen, never
   re-derived. Every migrated save becomes `'endowed'` unconditionally.
2. **Invariant surgery, explicitly authorized:** the four-capability invariant, the
   positional `placement-v12` facility policy, and `activateStudioOperations` each
   gain a bare-lot regime arm (this charter at GO = law 28's explicit instruction).
   The regime is a validation-policy discriminant threaded like
   `LiveStateValidationPolicy`.
3. **Representation ruling (A):** at the Flip, founding bodies become first-class
   placements and only Gate/Admin/Theater remain PropertyStructures. (The master plan
   §6's "founding placements" phrasing describes what C1 was *expected* to ship; C1
   actually shipped PropertyStructures on a separate root — named, not inherited.)
   Vocabulary ruled: *eight authored structures + one reserved parcel = nine
   addressable places.* Guardrail (`00B`.1): the bare-lot world is defined by a
   **new** constant (e.g. `BARE_LOT_INITIAL_PROPERTY`); **`INITIAL_PROPERTY` is
   immutable V12→V13 migration data and is never edited** — the frozen-builder
   deep-equality anchor and every migrated save depend on it byte-for-byte.
4. **Property re-authoring:** the post-Flip parcel map is authored world work
   (vacated ground re-parceled; buildable parcels sized for 4×4 stages + clearance —
   and for any deferred larger class if it has returned by then), bound by laws
   25/27a; the `lotParcelInspectorContext` reservation-awareness seam (deferred by C1
   to "the campaign that next touches that surface") is C2b's.
5. **Journey upstream:** construction stages extend the FMJ projection ahead of
   "Commission a screenplay." The journey file holds **four** closed vocabularies
   (r1 named one): `JOURNEY_STAGES`, `JOURNEY_TARGET_KINDS` (which gains a `build`
   member — no build verb exists today), `JOURNEY_SITES` (needs no new member), and
   `JOURNEY_STAGE_BUILDING_IDS` — the last is a two-stage hardcode with a silent
   first-element fallback that the **C2a-M2 N-stage sweep** already owns (it cannot
   wait for C2b). `JOURNEY_SITE_BUILDING` becomes a live lookup with an honest "not
   built yet" arm; the hard-coded founding-BuildingId references are swept as their
   own milestone, sized by a **type-aware re-count** (compiler-assisted, command
   published in the milestone; the raw-grep 386 is a labelled upper bound that
   includes `kind`/`owner`/`JourneySite` string coincidences). Blueprint `requires`
   audit: no post-Flip blueprint may require a founding structure; `maxInstances`
   counts structures + placements.
6. **The opening act is an OVERLAP, not a waiting room:** commissioning and
   greenlighting during construction is legitimate (a picture needs no stage until
   6 weeks from release). Fresh-start runway is measured (E3) **all-in** (r2): ~$94k/
   week payroll+overhead **plus $13.5k–22k/week facility opex accruing as the core
   completes** (lane 4's own table, whose opex column r1 dropped); estimated core
   build-out $3.4–5.1M capital. The pessimistic branch is potentially unwinnable at
   $20M — INITIAL_CASH / build-weeks / overlap tuning is C2b-M4 subject matter,
   parameterised by the all-in number.
7. **Compatibility gates:** all 21 pre-Flip test files run UNMODIFIED against the
   permanent `preFlipFoundedStudio(seed)` fixture; both sealed e2e journeys run
   unmodified against a MIGRATED save; a new e2e proves bare lot → build core →
   FIRST FILM GREENLIT → wrap. The D-16 corpus SHA-256 neutrality is handled
   deliberately: pre-Flip fixture pinned as permanent regression + formal re-base
   with a recorded ruling.

---

## 8. Save/schema requirements

**C2a = SaveFileV14 — the COMPLETE shape lands at M1** (all roots present, empty,
with migrator and T-suite); **M2/M3 populate roots and add no schema members** (r2
ruling — r1 left the schema accreting across three milestones under one version).
**C2b = SaveFileV15** (`foundingRegime`). Roughly 45 mechanical boundary-guard/
projection/migrator edits per bump; the five hand-enumerated `migrateToVn` downgrade
refusals are parameterized by a test over every migrator × every higher version.

### 8.1 V14 row schemas (the field-level pin r1 lacked — OPUS-TESTS codes from this)

```ts
type StudioSet = {
  id: string                    // 'set-' + monotonic counter (nextSetId, never rolled back)
  name: string
  blueprintId: string           // SET_BLUEPRINTS entry
  mountedOn: string             // facilityId of its stage (interior-only in V1)
  status: 'under-construction' | 'standing' | 'retired'
  completesWeek: number | null
  quality: number               // 0..100, authored by blueprint, SHOWN
  novelty: number               // 0..1, SET_NOVELTY_INITIAL at completion, SHOWN
  condition: number             // 0..100, wears per production, SHOWN
  genreWeights: Readonly<Record<GenreId, number>>  // 0..1 each
  priorityGenre: GenreId
}

type WorkflowBindings = {
  requiresSetBinding: boolean   // true iff greenlit in managed mode at V14+
  stageFacilityId: string | null // from the live soundstage reservation when held
  setId: string | null           // bound at rehearsal entry (atomic with stage)
  lockedNovelty: number | null   // snapshot at bind; ABSENT (null) for migrated in-flight
  lockedUplift: number | null    // quality+fit uplift, locked at bind
  heldSinceWeek: number | null   // stamped at acquisition; preserved across retention
}

type ProductionQueueEntry =
  | { kind: 'commission';    ordinal: number; queuedWeek: number; payload: CommissionActionPayload }
  | { kind: 'castingStart';  ordinal: number; queuedWeek: number; payload: CastingStartActionPayload }
  | { kind: 'greenlight';    ordinal: number; queuedWeek: number; scriptProjectId: string; payload: GreenlightActionPayload }
  // payloads are the FULL action payloads; revalidated at dequeue; nothing held while queued;
  // entries reference script projects — no production id exists before greenlight.

type StudioEvent =
  | { seq: number; week: number; kind: 'wrapped';               productionId: string; stageFacilityId: string; setId: string | null }         // Tier D
  | { seq: number; week: number; kind: 'premiere';              filmId: string }                                                              // Tier D
  | { seq: number; week: number; kind: 'constructionCompleted'; placementId: string }                                                         // Tier D
  | { seq: number; week: number; kind: 'setBuilt';              setId: string }                                                               // Tier D
  | { seq: number; week: number; kind: 'setRetired';            setId: string; refund: number }                                               // Tier D
  | { seq: number; week: number; kind: 'reservationGranted';    ownerId: string; resourceKey: string }                                        // Tier W
  | { seq: number; week: number; kind: 'reservationReleased';   ownerId: string; resourceKey: string }                                        // Tier W
  | { seq: number; week: number; kind: 'phaseEntered';          productionId: string; phase: ProductionPhase }                                // Tier W
  | { seq: number; week: number; kind: 'sceneryArrived';        productionId: string }                                                        // Tier W
  | { seq: number; week: number; kind: 'queueAdmitted';         entryKind: string; ordinal: number }                                          // Tier W
  | { seq: number; week: number; kind: 'queueIntentExpired';    entryKind: string; ordinal: number; reason: string }                          // Tier W

type StudioEventLog = { nextSeq: number; rows: readonly StudioEvent[] }
// state additions: sets: readonly StudioSet[]; nextSetId: number;
// productionQueue: readonly ProductionQueueEntry[]; studioEvents: StudioEventLog;
// operations.workflows[*].bindings: WorkflowBindings
```

Bounded ranges above are asserted by G3 tests. Exact payload types reference the
existing action-argument types; the validator gets literal key lists per root
(the `v12ExactKeys` idiom).

### 8.2 Architecture guardrails (Owner-accepted 2026-08-18 — `00B`, binding)

Ten future-proofing guardrails from the accepted architecture audit bind every C2
schema and engine decision; r2 complies by construction and the specific bindings
are stated where they land: the Flip's bare lot is a **new** bare-start constant —
`INITIAL_PROPERTY` is immutable V12→V13 migration data and is never edited (§7.1);
production-id format is permanent — queue ordering authority is the persisted
ordinal, never a re-minted or reformatted id (§3.3); every new root carrying
production ids joins `persistedProductionIds` both directions (§8.3); **no frozen
save leaf shape is widened** (`EraConfig`, `Standing`, `CulturalForce`, `SegmentId`
— V14 adds new roots only); the cash `state.ledger` is permanent history, never
windowed — Tier-W compaction applies to `studioEvents` alone (§5.3); `market.tick`
stays the authoritative integer week — Living Turn V1 persists no intra-week
position, and any future variant that needs one adds V-next state rather than
redefining week semantics (§4.1); `state.talent` stays an append-only census (C2
touches it not at all); no studio-relative fact is written onto shared-world
entities — set demand is a derived read model over the screenplay, never a field on
`FilmConcept`; set/stage/queue occupancy extends the ONE existing
occupancy/reservation representation, no second ownership layer (§3.2); the
1920→2040+ timeline law (§1.10, G15). **Rival-studio functionality is explicitly
NOT added by C2** (§19).

### 8.3 Migration rules

Copy the **V12** three-legged historical-boundary guard, not V13's two-legged one
(C2's roots leak identities into other roots); new ledger kinds (`setCapex`/
`setMaintenance`/`setDemolitionRefund`) get boundary legs; `persistedProductionIds`
walks `studioEvents` Tier D and `productionQueue` — and those roots' production ids
are checked back against it (both directions). Derivations are facts, not guesses
(r2 completes r1's rule): `bindings.stageFacilityId` := the workflow's live
`soundstage` reservation **when present (rehearsal AND shooting — a rehearsal-phase
save has no shootingTask, which r1's shootingTask-only rule missed)**, else null;
`lockedNovelty`/`lockedUplift` := null (ABSENT, not 1.0); `heldSinceWeek` := the
migration week, recorded as a migration fact; `requiresSetBinding` := false for every
migrated workflow (the grandfather: in-flight productions keep their
`facility-scenery-shop` reservation byte-for-byte and never acquire a set);
`state.sets` := the two endowed house sets for managed-mode saves (§3.1), empty for
legacy; queue := empty; zero RNG, `rngState` byte-identical. **T9 (the headline
migration test) covers EVERY phase that holds a reservation** — development through
post — not only mid-shoot (r2 widening), each × blocker kinds, migrated then played
byte-identically vs its V13 twin ≥30 weeks. A migrated managed save must reach a NEW
greenlight (gate in §12-M2). The session key is not bumped.

---

## 9. Economy — measure, don't fix

C2 raises throughput at the exact moment the D-17B residuals (cash runaway, top-studio
immortality) are open and C6 owns closure. Stance (lane 10): **instrument five things,
fix none** — with two bounded interim guards the master plan §7 permits.

- **Guards:** G-A every C2 economy artifact reports runaway/distress rates with the
  threshold in force printed beside them; G-B the **weeklyBurn truth repair** — fold
  `facilityOpex` into the player-facing burn/runway. Stated exactly (r2): facilityOpex
  is 16.1% of weekly outflow on a built-out C1 lot and is invisible to
  `weeklyBurn`/runway, **overstating runway by ~19%** ($111,983 true vs $93,983
  shown); the C2 snapshot regenerates both numbers rather than quoting either.
  Changes no cash flow, only what the player is told. Explicitly NOT permitted: any
  sink sized to suppress the tail; financing/loans/bailouts; touching
  RUNAWAY_MULTIPLE or the publicity/box-office scales.
- **The C6 handoff, stated with its own caveat (r2):** C2 hands C6 a bounded
  DERIVATION — absorbing a doubled ceiling on stage/set opex alone would take 12–30×
  the entire C1 estate's weekly opex — **together with lane 10's recorded
  counterweight** that the snapshot's measured arms lost $132k/week all-in while its
  controlled single picture earned +$1.43M, i.e. *no single defensible net-per-film
  number exists today*; producing one (figure 12, fixed/variable separated) is part
  of the protocol below. C6 inherits the derivation AND the disclaimer, not a
  conclusion its own source disowns.
- **Remeasurement protocol:** gates E0 (re-pin the C1 script unchanged at C2's HEAD;
  verify sealed main contains the accepted D-17B engine state — unverified to date)
  → E1 post-catalog → E2 post-throughput → E3 post-Flip → E4 seal; runs R1–R5
  (slate-per-blueprint, estate arms, `runFacilitiesCorpus` 104/208wk, `run-d16-corpus`
  208wk per ceiling, Flip fresh-start weekly); artifact
  `docs/economy/C2-ECONOMY-SNAPSHOT.md` generated by `scripts/measure-c2-economy.mts`
  EXTENDING the C1 script (C1 sections keep reproducing; the literal 2 in C1 prose is
  frozen as historical); the 18 named figures incl. binding-constraint histogram,
  marginal cost of the Nth production, queue-idle payroll, and the all-in Flip runway
  trough.
- **Queue idle:** status quo (full payroll accrues while queued) — measured, not
  redesigned. Promoted to the Tier-1 GO sheet (§18.1f) because it is the single
  largest determinant of whether the queue feels like a queue or a disguised refusal.
- **Consumer audit:** the `MAX_CONCURRENT_PRODUCTIONS` audit list is **generated by
  command at HEAD** (26 files across src/ui/tests/scripts — r1's "nine" was lane 10's
  subset), split into denominators / policy gates / player-facing copy / pinned
  assertions, with the §3.3 dispositions; pre-C2 corpus numbers freeze as historical.
- **TUNING inventory** (names and intent; values are implementation's to tune):
  `STAGE_STANDARD_{CAPEX,BUILD_WEEKS,WEEKLY_OPERATING_COST,SIMULTANEOUS_PRODUCTIONS,FOOTPRINT,CLEARANCE}`,
  `STAGE_BLUEPRINTS`; `SET_<id>_CAPEX`, `SET_BUILD_WEEKS_BAND_*`,
  `SET_WEEKLY_MAINTENANCE_COST` (labelled an invention — the original charged sets no
  recurring cash), `SET_CONDITION_WEAR_PER_PRODUCTION`,
  `SET_CONDITION_UNUSABLE_THRESHOLD`, `SET_REPAIR_{COST,WEEKS}`, `SET_STRIKE_WEEKS`
  (named zero), `SET_NOVELTY_{INITIAL,DEPLETION_PER_RELEASE}`,
  `SET_NOVELTY_RECEPTION_FACTOR_MIN`, `SET_QUALITY_UPLIFT_MAX`,
  `SET_GENRE_FIT_UPLIFT_MAX`, `SET_GENRE_WEIGHT_*`, `SET_BLUEPRINTS`;
  `SCENERY_LOAD_IN_WEEKS_BASE`, `SCENERY_LOAD_IN_WEEKS_PER_DISTANCE`,
  `SCENERY_LOAD_IN_COST` (named zero); `REHEARSAL_COST` (named zero);
  `AGENT_MAX_SLATE`; `QUEUE_PRIORITY_POLICY`, `STUDIO_EVENT_WINDOW_WEEKS`;
  `PREMIERE_NIGHT_COST` (named zero); C2b: `FLIP_INITIAL_CASH` (if divergent),
  per-baseline blueprint constants. Named zeros follow the proven
  `FACILITY_MOVE_COST = 0` pattern. **Presentation-only constants**
  (`PREMIERE_CROWD_PER_GROSS`, `PREMIERE_CROWD_CAP`, `PLAYBACK_SPEED_LADDER`) live in
  a UI-side named-constant module with the same no-magic-numbers discipline — TUNING
  is engine law and presentation numbers do not enter it.
- Set `attractiveness` is authored as data, wired to NOTHING (C3's prestige lane).

---

## 10. Fix-in-passing: the inherited seams (each with its C2 acceptance)

| Seam | Ruling recommended | Acceptance |
|---|---|---|
| **F2** — capacity-0 effect buildings unengageable → timed build→consume→demolish at 50% | Effect buildings become HOLDERS: an uplift binds at commission and the office is engaged until the draft completes | A mid-consumption demolition refuses with a named reason; the churn exploit's price re-derived in the C2 snapshot |
| **F3** — requirements bind at quote time only (Office II demolishable at III's groundbreak) | Prerequisites become holders (or re-check at completion) | Named refusal; the red team re-derives the recorded "+$330,000" (lane 12 W7: $300k refund + $30k unexplained — likely avoided opex; the composition is stated, not assumed) |
| **F4** — commission verb demands the whole board idle | The world commission predicate becomes a function of FREE SLOTS (`availableDevelopmentCastingSlots`) — the same truth the queue uses | Continuous e2e on the 5179 origin: commission from the world while other work is in flight |
| **releaseTick off-by-one** | One week authority (§6) | Proven across the §6 enumerated surface list, regenerated by command |
| **DSF2 / 480×270 below-fold** | **An explicit Owner-signed narrowing of operational law 26** (§11.7 — r1 called this a simple scope-out; it is a supersession): law 26's 480×270/DSF2 leg narrows to DOM/workspace reachability; world-canvas visibility at that viewport is out of support; the three live 480×270 e2e specs are KEPT for the DOM surfaces they prove (nothing deleted) | The narrowing is signed and recorded; the third silent carry ends |
| **Assembly break-even literal 2** | The "if a second film shares those weeks" line derives from live capacity (the two-value law at `economyView.ts:205-210` is retired with the cap) | G12 extended to cover pre-existing sentences the cap deletion falsifies |
| **R-1 reservation migration** | Sticky reservations (§3.2) | The Annex contract's clause holds; nobody teleports |
| **Stale docs** | C2a-M0 repairs the laws-doc trailer (V11→V13/V14 as it lands), law 19's drifted pointers (or rules symbol-name resolution), the "travel is greenfield" note (presentation travel is SHIPPED; outcome-travel is greenfield), and `TYCOON-WORLD-CONVERSION-LOG` queue-note supersession cross-reference | Doc-only commit, diff-verified |

---

## 11. Governance: explicit supersessions (the Owner's signature covers this section at GO)

1. `docs/FACILITIES-CONSTRUCTION-RESEARCH-CONTRACT.md:252` (excludes "raising
   MAX_CONCURRENT_PRODUCTIONS or changing phase durations/allocation order") —
   **superseded** by owner law 1.
2. `docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:538` ("Explicitly open after V1":
   ceiling/scheduling/priority/queues) — **CLOSED by C2** (the correct verb — it was
   an open list, not a prohibition); its :500 no-migration clause is *honored* via
   sticky reservations.
3. **The autoplay/pause/speed/second-clock refusals — enumerated and superseded by
   the Owner's 2026-08-18 living-time ruling** (r2: each verified at its line this
   session; r1's "the ten" was unenumerated):
   `WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:309`;
   `WORLD-FIRST-LOT-NATIVE-NEXT-EVENT-CADENCE-REACTION-V1-CONTRACT.md:100` and `:1024`;
   `WORLD-FIRST-ANNEX-CONSTRUCTION-INTERACTION-V1-CONTRACT.md:540` (and its
   CLOSURE.md:149 restatement);
   `WORLD-FIRST-STUDIO-HOME-V1-CONTRACT.md:606`;
   `WORLD-FIRST-GREENLIGHT-PRODUCTION-FORMATION-FRESH-LOT-RETURN-V1-CONTRACT.md:597`
   and CLOSURE.md:118;
   `WORLD-FIRST-LOT-RETAINED-PACKAGE-GREENLIGHT-WORKSPACE-V1-CONTRACT.md:509`;
   `WORLD-FIRST-LOT-RETAINED-AUDITION-PLANNING-WORKSPACE-V1-CONTRACT.md:501`;
   `WORLD-FIRST-LOT-RETAINED-SCREENPLAY-COMMISSION-WORKSPACE-V1-CONTRACT.md:409`;
   `docs/HANDOFF.md:450`. Descriptive log restatements (`MARATHON-LOG.md:441,468`,
   `PROGRESS.md:144`, `CURRENT-BEST.md:149`, `NEXT-HIGHEST-LEVERAGE.md:41`) are noted
   as historical, requiring no supersession.
4. `TYCOON-WORLD-CONVERSION-LOG.md:407` ("Facility-capacity queues remain latent in
   shipped config (recorded Owner decision)") — **superseded** by owner law 2.
5. The company-presence contract's world-scope exclusion, **quoted in full** (r2 —
   r1 read one word of it):
   `WORLD-FIRST-ACTIVE-PRODUCTION-COMPANY-PRESENCE-PICTURE-SWITCHING-V1-CONTRACT.md:385`
   excludes "a company office, callboard building, stage, set, holding area,
   rehearsal room, Post room, or new physical production place" (V1-scoped). C2
   TAKES: the Call Board placard, buildable stages, mounted sets — **superseded for
   those members**; C2 KEEPS REFUSED: the holding area / marshalling yard (queue
   Option C stays deferred).
6. `docs/WORLD-FIRST-SCENERY-LOAD-IN-V1-CONTRACT.md:621-634` ("Explicitly outside
   V1": travel time, ETA, queue, set ownership/wear/quality, a new Scenery
   Shop/service-yard facility/slot/reservation/clock, production-time effects, a
   generalized queue framework) — **superseded**: C2 delivers precisely these, and
   §4.2 re-proves the V1 Keep gate as it moves the contract's fixtures.
   `docs/PRODUCTION-OPERATIONS-V1-CONTRACT.md:137-146` (defers manual scheduling/
   priority, facility purchase/operating cost, differentiated sets/rehearsals) —
   **C2 is the campaign that picks this deferred list up**; recorded.
7. **Operational law 26, narrowed** (the DSF2 ruling, §10) — Owner-signed narrowing
   of the 480×270/DSF2 verification leg to DOM/workspace reachability.
8. **Sealed tests whose SUBJECT owner law 1 deletes** (r2 — the "no test deleted or
   weakened" law gains its enumerated, owner-signed exception; nothing else is
   exempt): `tests/tuning.test.ts:52-54` (the cap in `expectedScalars`),
   `tests/actions.test.ts:448-472` (greenlight-throws-at-cap),
   `tests/agents.test.ts:157-214` (agents-stop-at-cap → rewritten against
   `AGENT_MAX_SLATE`), `tests/operations.test.ts:433-541` (the one-week-deferral
   ordering the fixed-point sweep + aging replace). Each is retired or rewritten
   **with a named successor assertion** listed in the M3 gate; the M0A corpus stays
   byte-identical throughout (§3.3).
9. The D-16 harness suite (10 test files outside the sealed 241) — ruled INTO the C2
   regression floor with a re-baselined count and named reason.
10. **Opex precedent:** Placement Core V12's positive facility opex RATIFIED as
    having superseded the older $0-opex contract clauses; C2 prices stage/set opex on
    the V12 precedent.

---

## 12. Milestones

### C2a — SETS, STAGES & THE LIVING STUDIO (SaveFileV14)

- **M0 — Baseline, hygiene, and the union.** Reproduce the C1 floors at HEAD
  (241/3,318 vitest; 211/207/4/0 Playwright; both tsc); E0 economy re-pin + the
  D-17B-on-main verification; doc repairs (§10); capacities → TUNING;
  the phase→capability duplicate tables single-sourced with an agreement test
  (**a scaffold pinning the V13 table** — M2 replaces it with the bindings-aware
  form; stated so it is not mistaken for a floor); `occupiedResourceSlots(state)` +
  kind-qualified keys + sticky retention (the R-1 repair). **Gate:
  behaviour-identical on every legal state — replay and save byte-identity on the
  sealed fixture corpus; the new cross-owner refusal proven non-vacuous on a forged
  fixture; all floors green.**
- **M1 — The event ledger + engine wrap (V14 complete).** The FULL V14 schema (§8.1,
  all roots, empty) + migrator + T-suites (T9 across all held phases); save-size
  measurement; `studioEvents` phases 0–2 (§5.6); the Tier-D `wrapped` engine event.
  **Gate: M0A corpus byte-identity (ledger empty on legacy); dual-run equality vs
  all 17 detectors; the presentation-parity assertion (saves byte-identical with the
  ledger on vs off — the PF1 §2 obligation if PF1-M2 shipped, the charter-owned
  equivalent regardless).** *PF1-independent: no UI file is touched in M1; the
  SimStopReason member is M4.*
- **M2 — Buildable capacity + Sets.** The §3.4 blueprint slate; the C2a ground
  amendment (north-back-lot frontage, own re-pin); `state.sets` populated: set
  construction/repair/strike via Scenery Workshop, the wired stat block (§3.1), the
  two endowed house sets at `activateStudioOperations` + migrator synthesis;
  `requiresSetBinding` at greenlight (managed V14+ only); atomic stage+set
  acquisition at rehearsal entry; set demand + package/greenlight surfaces
  (OPUS-SCREENS); display-name authority ruling; dynamic N-stage world identity —
  the closed adapter maps/vocabularies become derived (the UI currently THROWS on a
  third stage), including `JOURNEY_STAGE_BUILDING_IDS`; stage bodies procedural in
  both worlds. **Gate: bounded-term tests per TUNING family; a 4-stage studio
  renders and plays without a throw on both origins; FMJ specs pass unmodified; a
  migrated managed V13 save reaches a NEW greenlight; LEGIBILITY — the package/
  greenlight surface names the bound set and shows quality/novelty/condition/fit
  with the projected uplift (rendered-surface test).**
- **M3 — Throughput.** Delete `MAX_CONCURRENT_PRODUCTIONS` (§11.8 test retirements
  with named successors; `AGENT_MAX_SLATE`; `scriptReadModel` blocker re-base;
  audit-list dispositions §3.3); Phase-Gate Admission at all four front doors
  (payload-carrying intents, dequeue revalidation, the inserted tick step); queue
  state + aging + ordinal; acquisition ranks + acyclic invariant; the fixed-point
  weekly sweep; blocker widening + `Remedy` union + `studioQueueView`; **the queue
  panel on the Production Board/Calendar and the Call Board floor on the Lot**
  (OPUS-SCREENS/OPUS-WORLD). **Gate: G10.1 (purchased slots no longer inert on ≥4
  of 5 seeds); N-way contention property test (acyclic wait-graph, bounded wait,
  rank monotonicity) over seeded runs; determinism under contention; E2 economy
  gate; LEGIBILITY (G16) — every blocked waiter in a seeded contended run renders
  all four law-2 facts non-empty, remedies actionable.**
- **M4 — The Living Studio.** The release-week playback hole closed (both
  conditions, `App.tsx:2525`); `simStopFor` extracted and exported
  (OPUS-ENGINE-CORE, before OPUS-TIME); the `wrap` SimStopReason member + its three
  named UI surfaces + `never`-guards + tier-table/cue coordination (§4.3); the
  Living Turn V1 scheduler (pause / speed ladder / partitioned auto-pause /
  fast-forward); `studioWeekTheater` projection + N-facility generalisation; queue
  physicality (Call Board floor → Backed-Up Lot committed target); grounded ambient
  actors; load-in duration from layout (+ Scenery Load-In V1 re-proof). **Gate: the
  hands-off proof — a seeded save with two pictures in flight runs ≥12 consecutive
  unpaused weeks with zero input, state advances exactly those weeks, the queue
  visibly drains into freed capacity, and the loop auto-pauses on the first
  PAUSE-class stop (the run length is asserted, not just the pause); four-way
  time-parity byte-identity; theater on/off byte-parity with the enabled arm proven
  non-vacuous; LEGIBILITY — the played week renders the named theater subjects
  (stage hot, crates massing, wrap clearing) for a contended studio; re-pins per
  the five-rule discipline.**
- **M5 — Premiere Night V1.** Week-authority fix across the §6 enumerated surfaces;
  marquee port; Option A staging (B floor per §18.1g); PAUSE-class integration;
  multi-release arbitration. **Gate: premiere e2e on 5179; no double-announce;
  zero-engine-delta test (premiere changes no engine number); release never
  swallowed on staging failure; LEGIBILITY — the marquee carries the title and the
  participants arrive (rendered-surface test).**
- **M6 — Economy remeasure + polish.** C2-ECONOMY-SNAPSHOT (18 figures, E-gates);
  weeklyBurn truth repair; the §10 seam fixes not owned by earlier milestones
  (Assembly literal-2; F2/F3 if not landed with M2 catalog work); DSF2 narrowing
  recorded. **Gate: snapshot reproduces byte-identically twice; C1 sections still
  reproduce; G15 era-cleanliness scan green.**
- **M7 — SEAL → STOP FOR OWNER REVIEW.** PM playtest (§16a), independent red team
  (§15) with a HELD LIST in the C1-M8 format, bounded fix wave (sole-writer,
  ruled findings only), KEEP/KILL per milestone, gates regenerated at the named
  seal HEAD.

### C2b — THE FOUNDING FLIP (SaveFileV15)

- **M1 — Regimes + invariant surgery.** `foundingRegime` root; the three
  invariant/policy/activation arms; V15 migration ('endowed' unconditionally);
  `preFlipFoundedStudio(seed)` frozen. **Gate: every V14 suite green under both
  regimes; a bare-lot save validates, loads, and refuses nothing it shouldn't.**
- **M2 — The bare lot.** Post-Flip parcel map authored; vacated-ground rules;
  parcel projection reservation-aware. **Gate: placement property tests on the new
  map; structural re-pins with named reasons.**
- **M3 — The journey upstream + UI sweep.** Construction stages (`build` target
  kind); `JOURNEY_SITE_BUILDING` honest lookup; the type-aware BuildingId re-count
  and sweep; blueprint `requires` audit + maxInstances counts structures. **Gate:
  both sealed e2e journeys unmodified against a migrated save; the closed UI
  validator widened additively.**
- **M4 — The opening act.** Overlap design tuned with the all-in E3 measurement;
  Flip golden path e2e (bare lot → build core → FIRST FILM GREENLIT → wrap); D-16
  fixture pinned + corpus re-based with a recorded ruling. **Gate: the Flip is
  winnable and measured; pre-Flip fixture regression permanent.**
- **M5 — SEAL → STOP.** Owner plays the Flip (§16b); red team (Flip family +
  migration); fix wave; KEEP/KILL.

---

## 13. Opus dispatch plan (single production writer per surface; the PM grades)

| Role | Milestones | Owns |
|---|---|---|
| OPUS-ENGINE-CORE | C2a M0–M1, M4 | `src/core` union/keys/TUNING hoists; `studioEvents`; the wrap event; V14 in `save.ts`; **`ui/src/engine/adapter.ts`** (the M4 `wrap` member, the `simStopFor` extraction, the M2 vocabulary derivation — the adapter now has a named owner; r1 left the most contended file unassigned) |
| OPUS-ENGINE-CAPACITY | C2a M2–M3 | Blueprints, `state.sets`, queue/admission/rank/sweep, sticky reservations; sole `src/core/operations.ts` writer during M2–M3 |
| OPUS-TESTS | all | Contract-first suites from THIS charter (§8.1 is their schema source), in `tests/contracts/` + `ui/src/test/contracts/` |
| OPUS-WORLD | C2a M2, M4 | Stage/set bakes, ground-amendment world work, theater projection wiring, queue physicality; sole writer of `TycoonScene.ts`/`world.ts`/`assets.ts` |
| OPUS-SCREENS | C2a M2–M5 | **The React screens r1 orphaned**: `Dashboard.tsx`, `StudioCalendar.tsx`, `Assembly.tsx`, `LotPackageWorkspace.tsx`, and the set/stage/queue surfaces inside `StudioLotScreen.tsx` (one-writer serialization with OPUS-TIME per milestone) |
| OPUS-TIME | C2a M4 | The Living Turn scheduler module; call-sites-only in `App.tsx`/`StudioLotScreen.tsx`; consumes `simStopFor` — never extracts it |
| OPUS-PREMIERE | C2a M5 | Marquee port, staging, week-authority sweep |
| OPUS-ECONOMY | C2a M0/M3/M6 | `measure-c2-economy.mts`, the command-generated audit, snapshot |
| OPUS-FLIP-ENGINE | C2b M1, M4 | Regimes, invariant arms, V15 |
| OPUS-FLIP-WORLD | C2b M2–M3 | Parcel map, journey/UI sweep |
| OPUS-REDTEAM | M7 / C2b-M5 | Independent; findings only; HELD LIST mandatory |
| OPUS-FIX | M7 / C2b-M5 | Sole writer during fix waves; scope = ruled findings only |

Rules carried from PF1: no force-push; `App.tsx`/`StudioLotScreen.tsx`/`adapter.ts`
serialized one-writer surfaces per milestone; every gate figure regenerated from a
command at a named HEAD; the PM reruns decisive gates at each KEEP/KILL. **C2 UI work
starts only after PF1 seals** (PF1's M1–M3 write the same files); M0–M1 and all
`src/core` work in M2–M3 are PF1-independent — **M4 is not** (the SimStopReason union
is adapter-owned; sequenced accordingly).

---

## 14. Test gates (the G-list; full specs in lane 12)

G1 reservation lifecycle (fail-closed cross-owner overbooking; release proven on
EVERY termination path — wrap, release, cancel, strike-refusal, demolition-refusal;
`facilityEngagements`/union exhaustiveness as a test). G2 queue determinism
(identical seed+script → identical queue order; the tie-break pinned against a
genuine tie). G3 bounded-term unit tests for every new TUNING constant AND every
§8.1 range. G4 V13→V14(→V15) migration matrix per §8.2 incl. the every-held-phase
T9. G5 Flip golden path + permanent pre-Flip fixture + migrated-save journeys.
G6 phase-table agreement (M0 scaffold → M2 bindings-aware form); the blocked-at-gate
rule pinned. G7 Premiere (incl. the zero-engine-delta ruling test). G8 theater/time
byte-parity (on/off and four-way pacing; enabled arm non-vacuous; `rngState` pinned;
the Math.random hygiene scan extended to `ui/e2e/`). G9 structural re-pins per the
five-rule discipline. G10 ceiling-removal proof (G10.1 slots-no-longer-inert).
G11 economy snapshot reproducibility. G12 quote-grammar — every new sentence
literally true at its state, **extended to pre-existing sentences the cap deletion
falsifies**. G13 D-16 suite in the floor. G14 flake watch (serialized Playwright,
both origins, no retries). **G15 era-cleanliness** (new TUNING families, blueprints,
requirement date arms, and player-facing copy scanned for hard-coded years/eras;
timeline law §1.10). **G16 queue legibility** (all four law-2 facts rendered
non-empty for every waiter in a seeded contended run). Standing law: no test deleted
or weakened **except the four enumerated in §11.8, each replaced by a named
successor**; FMJ specs unmodified; every figure names its HEAD.

---

## 15. Red-team targets (R-list; full 34 in lane 12)

Reservation exploits (reserve-and-cancel churn — priced first: cancel already
forfeits the full greenlight lump; demolish/strike-under-binding; the indefinite
player-controlled soundstage hold via never-scheduling the take — a self-inflicted
denial-of-service under contention; queue-jumping via cancel/resubmit; intent-payload
staleness abuse at dequeue). Deadlock/starvation (rank-order violations; head-of-line
post bottleneck; aging starvation; fixed-point sweep termination). Economy
(queue-parking; premiere farming; churned F2/F3 prices re-derived; runaway
acceleration measured, not hidden). Flip (regime forgery; migrated-save double-builds;
requires-gates on absent structures; new-parcel exploits). Determinism
(contended-reservation ordering; living-turn pacing divergence; cursor loss/replay;
speed-ladder parity). Theater/truth divergence — any motion not traceable to
authoritative work is a campaign failure under laws 5/8, **with two named carve-outs**
(r2): the premiere crowd (a declared Class-A projection of opening gross) and the
premiere participants (frozen `FilmResult.participants` attending an event); both are
in-scope for the *sizing/determinism* attack, out-of-scope for the unexplained-mover
criterion. Deliverable format: findings + the C1-M8-style HELD LIST.

---

## 16. Owner playtest scripts

**(a) C2a seal (~25 min; the time budget is stated with the speeds — at 2× a week
plays in ~5.8s, so 40 in-game weeks of living time cost ~4 minutes plus pauses):**
found a fresh studio; see the two house sets standing on Soundstages 7 and 12;
commission and greenlight THREE pictures — watch the third **queue** with a readable
reason naming the set it waits for, its occupant, the free week, and a remedy
("Build a set — Scenery Workshop required"); unpause and *stop touching the
controls* — watch two pictures shoot simultaneously, scenery travel, a wrap clear
Soundstage 7, and the queued third picture take the freed stage without your help;
get auto-paused by a genuine decision; use fast-forward once; build a THIRD stage and
a new set on the amended back-lot ground and watch a fourth picture join the slate;
reach a release and attend Premiere Night at the Theater; open the queue panel and
relieve a named bottleneck by building what the remedy row names. PASS = "I watched
my studio manufacture multiple movies at once, I always knew what was waiting and
why, and it ran without me pushing it." FAIL = a stalled queue with no stated reason,
motion I couldn't attribute, or reaching for Advance Week out of necessity.
*(r1's script built relief before contention and could never produce the queue — the
review caught it; this order forces the queue first, then relieves it.)*

**(b) C2b seal (~20 min):** start a NEW studio; arrive at Gate + Administration +
Theater and empty land; follow the journey's construction guidance; commission
during construction (the overlap); reach FIRST FILM GREENLIT → wrap → release on a
lot you built; load a pre-Flip save and confirm it is exactly the studio it always
was. PASS = "I started with almost nothing. I built this studio."

---

## 17. PF1 interlock and robustness

Assumed baseline: PF1 as chartered (audio service, cue grammar, prefs, shell;
ui-only; no V14). The load-bearing PF1 clauses are vendored verbatim in
`docs/c2-planning/13-PF1-CHARTER-EXCERPTS-APPENDIX.md` (@ `1e6b422`) so every PF1
reference resolves from this branch. Robustness: M0–M1 and the `src/core` halves of
M2–M3 are independent of every PF1 outcome; **M4 is PF1-sequenced** (the adapter and
the two big UI files are PF1's one-writer surfaces; the SimStopReason union is
adapter-owned — r1's blanket independence claim was wrong and is withdrawn); M5
degrades gracefully (no cue grammar → silent but complete premiere). If PF1-M2's
laws-doc correction was KILLED, C2a-M0 performs it. The M1 parity gate binds
regardless of PF1's fate: the charter owns its own presentation-parity assertion
(§12-M1), which is also the PF1 §2 obligation when PF1 shipped.

---

## 18. Owner decisions — the GO sheet

**Tier 1 — genuine choices that block implementation:**

1. **Concurrency targets and law-1 coverage** (master plan §10.1, still open):
   a. the target concurrent-production range at mature C2a build-out —
      *recommendation: 3–4*;
   b. which constraint binds first — *recommendation, corrected by the endowment
      arithmetic (r2): SETS bind first at founding (2 stages + 2 sets, one set per
      stage), then stages; dev/casting binds only when under-built* — note lane 6
      measures dev/casting as today's tightest physical ceiling, so the recommended
      experience requires set/stage pricing to keep them scarcer than slots;
   c. **is `casting` its own capability in C2a or does it stay merged with
      development-casting?** (folded in per the review — r1 deferred this to a ruling
      that never asked it); *recommendation: merged in V1, one baseline blueprint;*
   d. **acknowledge the law-1 deferrals**: crew-as-capacity and talent-as-capacity
      (whole-film exclusivity stays a package-decision refusal, lane 2's D-3) ship
      in a later campaign, with reasons recorded (§0.1, §19).
2. **Ratify the C2a/C2b split** (§2).
3. **Living Turn V1** (§4.1/08A) — ratify the shape INCLUDING the auto-pause
   partition (PAUSE vs NOTIFY class lists) and the Lot-only scope, AND sign the
   supersession of the enumerated refusal clauses (§11.3).
4. **Event model** (§5) — ratify persisted `studioEvents` (Option A) over transient
   emission; both lanes' cases are on the record.
5. **Theater = permanent landmark**, including the amended minimum starting lot
   (Gate + Admin + Theater) (§6).
6. **Sets are mandatory for new managed greenlights + the two-set founding
   endowment** (§3.1) — the FMJ-preservation device. (Declining set-mandatory
   weakens owner law 3 to a quality lever; the charter is written for YES.)
7. **The two queue-feel rulings, promoted from r1's Tier 2** (the review showed both
   are the decisions most likely to make the queue feel bad, and the charter
   red-teams both): **(f-i)** blocked-entering-post HOLDS its stage (safe, can
   congest the lot; relief = buildable post + the joined surface) vs RELEASES it
   (livelier, needs a re-acquisition story) — *charter is written for HOLD*;
   **(f-ii)** queue-idle payroll: full freight accrues while queued (queueing is a
   real cost; measured) vs a reduced idle rate (a new unmeasured cash lever D-17B
   forbids) — *charter is written for FULL FREIGHT, measured*.
8. **The de-scope floors, pre-decided** (r2 — previously silent): if C2a runs long,
   the Owner either pre-approves shipping the Call Board placard without the
   Backed-Up Lot, and the marquee without the staged premiere — or refuses, making
   Option B and Premiere Option A hard gates. *Charter is written with B/Option-A as
   the committed deliverables and the floors as Owner-approved contingency.*

**Tier 2 — ratifications of recorded recommendations (one signature covers the
sheet):** sticky reservations as contract conformance (§3.2); wrap automatic + its
NOTIFY-class placement and exact ladder position (§4.3); weeklyBurn truth repair in
scope (§9); F2/F3/F4/releaseTick rulings as tabled (§10); **the law-26/DSF2
narrowing** (§10/§11.7); the §11.8 test retirements with named successors; opex
precedent (§11.10); D-16 suite into the floor (§11.9); corpus re-base policy (§7.7);
novelty per-instance, condition gates-only with the M2 repair loop, set numbers SHOWN
and WIRED (§3.1); genre fit advisory, never a gate (§3.1); **one bound Set per
production in V1 — multi-set films deferred (the X2 cycle)**; no footprint rotation
in V1; no per-shooting-week stage/set fees in V1 (opex only — a per-week fee is a new
cash path, deferred with the reason recorded); **Premiere Night zero-cash +
zero-engine-delta as a charter ruling** (§6); **the layout narrowing** — load-in
distance only, general travel-as-outcome deferred, the Scenery Load-In V1 contract
moved and re-proven (§4.2/§11.6); presentation constants live UI-side (§9);
`AGENT_MAX_SLATE` preserving the M0A corpus (§3.3).

---

## 19. Explicit non-goals (deferred, with owners)

**Crew-as-capacity and Crew Quarters** (deferred from C2a by r2 — returns with
founding supply + grandfather designed in; owner law 1 acknowledgment at §18.1d);
**talent-as-capacity** (whole-film exclusivity stays; lane 2 D-3, same
acknowledgment); **exterior/backlot sets** (r2 cut — a second admission path with
distinct reservation semantics; returns with backlot content); **Soundstage (Large)**
(no ground, `bakeStage` not spec-parameterised; returns with the post-Flip map or a
sizing pass); multi-set productions (the X2 cycle); reshoots (X4); partial wrap;
stage-strike duration; set-quality → production-quality *penalty* (V1 gates use only;
the uplift IS wired); genre practice on vacant sets (C3+ — a talent feature wearing a
Sets costume); relationships/chemistry of any kind (the REHEARSE/FILM/CASTING schema
evidence is recorded and is NOT a license — Do-Not-Build list stands);
travel/pathfinding as outcome law beyond load-in distance (C3+ docket); queue Option
C "the queue is a place"; B3 beats-inside-tick (C3+ paper spike); era/research
content and the 1920 start (C4 — C2 keeps schema era-clean, G15); prestige/
attractiveness wiring, landscaping, awards, ranks (C3); star needs/amenities (C5);
economy closure (C6); archive/library; buildable Theater (a design ruling on merits —
§6; revisit only via C3 prestige); plate-world authored stage cells (law 27a stands);
authored hero-art stages (procedural classes only); any movie footage (later
ruling); machinima (unchanged owner reservation); financing/loans/bankruptcy (D-17B
standing instruction); multi-slot saves, UI scale (unowned, per PF1);
**rival-studio / Hollywood-ecosystem functionality of any kind** (`00B` audit
headline: safely deferable, explicitly NOT added by C2 — and no C2 root may write
studio-relative facts onto shared-world entities in preparation for it).

---

## 20. Definition of DONE

C2a is DONE when, at a named HEAD on the production branch: the Owner's C2a playtest
passes as scripted (§16a — including the ≥12-week hands-off segment); all byte-parity
and determinism gates hold; G10.1 shows purchased capacity is no longer inert; every
G-gate including the four legibility gates is green with figures regenerated at that
HEAD; no test was deleted or weakened beyond the §11.8 enumerated retirements with
their named successors; the FMJ specs pass unmodified; the C2 economy snapshot exists
and reproduces; and the seal STOPS for Owner review. C2b is DONE when the Flip
playtest passes, the pre-Flip fixture and migrated-save journeys prove the old world
unchanged, the Flip golden path is green, and the seal STOPS. **No successor campaign
is automatic.**

---

*r2, frozen 2026-08-18 by the Fable C2 Architect after five-lens adversarial review.
Planning artifacts: `docs/c2-planning/00–13` on this branch. No production code was
written or modified. PF1's worktree and branches were never touched.*
