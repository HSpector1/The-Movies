# CAMPAIGN 2 — SETS, STAGES, SCREENPLAYS & PRODUCTION THROUGHPUT + THE FOUNDING FLIP
## CAMPAIGN CHARTER (r3.2 — FROZEN; ALL OWNER DECISIONS RULED; WAITING FOR PF1 SEAL + GO)

> Status: **IMPLEMENTATION-READY, awaiting the Owner's explicit GO.** Prepared by the
> Fable C2 Architect session of 2026-08-18 under the Owner launch order
> ("PROJECT: STUDIO — C2 ADVANCE PLANNING") while PF1 is in flight elsewhere.
> Branch **`c2-sets-throughput-plan`**, worktree `/Users/bruce/The Movies - C2 Planning`,
> base = sealed C1 `main` @ `f294077`. Nothing in the PF1 worktree or branches was touched.
>
> Evidence: thirteen dedicated Opus recon lanes (`docs/c2-planning/01..12, 14`) over the
> engine, the UI, the governing docs, and the original-game corpus; PF1 clauses vendored
> verbatim in `docs/c2-planning/13-PF1-CHARTER-EXCERPTS-APPENDIX.md` (PF1 @ `1e6b422`);
> four Owner ruling sets recorded verbatim as they arrived:
> `00A` (living time), `00B` (architecture guardrails), `00C` (consolidated rulings —
> Renewable Screenplay Generation into C2; the Theater ruling), `00D` (screenplay
> research direction + source pointer), reconciled in `08A` (time-model addendum).
>
> **Revision provenance:** r1 failed a five-lens adversarial review (21 BLOCKER /
> 46 MAJOR / 20 MINOR); r2 adjudicated all of them and was verified by a
> three-lens pass that confirmed every r1 BLOCKER resolved and filed 6/21/23
> residuals — refuting two r2 claims outright. r3 adjudicated all residuals AND
> incorporated the `00C`/`00D` rulings; a final two-lens check (which confirmed
> 46 of 50 r3 resolutions and every renumbered reference) filed 2 BLOCKER /
> 9 MAJOR / 8 MINOR on the NEW content, all adjudicated into **r3.1** (the
> original-commission queue arm with mint-at-COMMIT; the release anchors moved
> into C2a-M6; the `SET_TYPES` vocabulary authored at M2; RSG stripped of any
> new strength lever; the seven-parcel sweep; the staffing/citation repairs).
> Architect re-verifications are tagged "architect-verified" in place; the
> verify passes re-checked ~130 citations (their held-lists are the audit trail).

---

## 0. What r3 changed (for the Owner's orientation)

**From the `00C`/`00D` rulings (new scope and one reversal):**

1. **Renewable Screenplay Generation V1 is IN** (§3.5, milestone M3): the smallest
   deterministic "my writers keep creating new movies" — a durable **Movie
   Blueprint**, generated renamable titles, genre beat skeletons from the recovered
   Hollywood templates, and beat-driven Set demand feeding the reservation queue.
   Lane 14 found the 30-concept pool is consumed permanently with a TERMINAL
   "no-concepts" blocker recorded in no document — a hard 30-film lifetime ceiling
   RSG removes.
2. **The Theater ruling reverses r2's recommendation** (`00C`.7): the Theater is NOT
   release authority, is NOT required for Movie #1, and the Flip does NOT seed one.
   Premiere Night V1 is venue-independent (§6 — staged as the send-off at the Studio
   Gate, which exists in both founding regimes); the Flip minimum lot reverts to
   Gate + Administration + road + parcels (the master plan §6 sentence stands as
   written); an optional buildable Screening Theater routes to C3 prestige; the
   Theater concept is not deleted.

**From the r2 verification (the load-bearing corrections):**

3. Two r2 claims were refuted and are withdrawn: the plate/legacy renderer composes
   NO placed bodies (its building list is a static authored nine — `layout.ts:83`),
   so stage world-coverage is ruled per-origin honestly (§3.1, §4.2); and the
   clearance ring is a between-placements rule only (`placement.ts:19-27`), so the
   C2a ground amendment is now EVIDENCE-GATED — a placement sweep is M2's first
   task, with the north-back-lot road spur pre-authorized as contingent headroom
   rather than asserted necessity (§3.4).
4. The persisted `ProductionBlocker` widening is now specified honestly: one new
   persisted arm (`set-unavailable`), everything legibility-rich (`occupiedBy`,
   `remedies`, `alsoMissing`) is READ-MODEL-ONLY and never enters GameState (§3.3,
   §8.1) — keeping byte-parity catalog-insensitive.
5. The playtest's first queue moment is corrected to the reason the founding plant
   actually produces (Development & Casting saturates first — making the C1
   capacity buildings the first relief, which is G10.1's whole story), with the
   set/stage wall following (§16a); the binding-order recommendation is restated
   for the mature build-out (§18).
6. The front doors are three, not four (the cap check is deleted, not queued); the
   fifth UI-side cap gate (`canGreenlightMore` + Dashboard copy) is dispositioned;
   §11's registry gains the five remaining ceiling-as-law documents and the missed
   closure restatement; §11.8 gains the two re-based (not retired) test files and
   the four named successor assertions; every §18 pointer resolves after the
   renumbering sweep; the ~40 remaining citation/count/naming corrections are
   applied in place (playback is 9 beats/10.35s; `Genre` not `GenreId`; real
   payload type names; `Scenery Shop` naming unified; the §8.2/§8.3 and §18
   cross-references repaired).

---

## 1. Mission

**The north-star acceptance statement (`00E`.21, binding on every milestone):**

> *"I built this movie studio, it operates while I watch, my writers create
> pictures, and I can physically watch multiple films compete for real
> production resources."*

Technical completion without this player-facing experience is insufficient —
with the chain increasingly resembling:

build a development office → assign a writer → **the writer develops a NEW
screenplay over time → a new movie identity and title emerge → rename it** →
review/rewrite/accept → casting → rehearsal → Set/Stage reservation → visible
production → queues when resources conflict → shooting → wrap → resources release
→ Premiere → results → the next picture already moving — and crucially:
**the world continues operating unless I pause it.**

**Owner laws governing this campaign (00A + 00B + 00C + 00D, restated):**

1. Concurrency comes from physical capacity; the two-production ceiling is
   transitional; throughput emerges from real constrained resources — screenplay
   development capacity, writers, casting capacity, directors, stars, crew, stages,
   Sets, support, layout where mechanically applicable. **3–4 concurrent
   productions is a mature balance TARGET, never a maximum (`00E`.3): capacity
   and reservations limit throughput; a global movie counter does not; a player
   who legitimately builds enough capacity may exceed four.** **No arbitrary global cap
   replaces the deleted one.** *(C2a delivers screenplay/dev capacity, stages, Sets,
   and layout-via-load-in; crew, directors and stars as exclusive countable
   capacity are explicit deferrals the Owner signs — §18 item 1d.)*
2. When capacity is unavailable: QUEUE, DON'T FORBID — the player knows what waits,
   which resource it needs, what occupies it, how long or under what condition it
   frees, and what to build/hire/change to relieve it.
3. Sets are real production resources: buildable, placeable, occupiable,
   reservable, production-relevant, physically visited, constrained, visible.
4. Stages are real player-built production capacity.
5. Engine state owns availability, reservations, occupancy, production progress;
   presentation shows that truth; animation is evidence, not authority.
6. The Founding Flip is ratified (§7); `INITIAL_PROPERTY` is never edited (§7.3).
7. **The Theater is not core release authority** (`00C`.7 — ruled, §6).
8. Premiere Night V1 belongs to C2; no movie footage; presentation reacting to
   authoritative release truth.
9. Simulation theater: **EVERYTHING BELONGS TO A SYSTEM** — visible activity
   answers "why is that person/object there?"; no decorative population.
10. **Living time:** simulation time flows while unpaused; pause and speeds;
    advance-to-event demoted to convenience; deterministic Engine authority
    preserved; C2 ships the smallest implementation proving *"I can stop touching
    the controls and my movie studio keeps operating visibly and meaningfully."*
11. **Screenplay supply (`00C`.3):** the 30-concept pool is not the long-term
    model; C2 establishes Renewable Screenplay Generation V1 (§3.5); C4 owns the
    deep generative version.
12. **Timeline law:** campaign begins 1920, no hard calendar game-over, authored
    progression through ≥2040, alternate-future permitted; no C2 system hard-codes
    a year (the engine currently contains none — lane 14 verified zero matches for
    any calendar year in src/ and ui/src; `BlueprintRequirement.date` is
    week-indexed, `types.ts:837`; G15 keeps it that way).

**Honesty note (lanes 3, 14):** laws 2 and 4 are deliberate modernizations — the
original had no soundstage building type (its "Stage" is a pre-built generic Set)
and no queue (occupied sets hard-blocked in red). And one **discovered
contradiction is on the record, not resolved silently**: the corpus law says writer
experience affects SPEED only, never quality (Prima, developer-reviewed; master
plan §5 cites it as engine-corroborated), while shipped C1 does the inverse —
writer skill is 40% of draft quality and 0% of speed
(`scriptDevelopment.ts:352-362`, `:284`), recorded in no repo doc until now.
§18 item 9a carries the ruling.

---

## 2. C2a / C2b — the split is RECOMMENDED, on evidence

**Recommendation: split.** C2a = Sets, Stages, Screenplays, Throughput & the Living
Studio (SaveFileV14). C2b = the Founding Flip (SaveFileV15), immediately after,
before C3. One charter governs both; C2b needs no new planning pass, only its GO.
RSG lands in **C2a** (M3): it needs nothing from the Flip, the Flip's §12-chain
("build Script Office → writer hands me a new movie") needs IT, and its substrate
(commission/draft/occupancy) is the same machinery M4's queues cover — `00C`.3's
"determine placement" is answered *unified-inside-C2a*, not dropped and not C2b.

Why the split (lanes 4, 5): the Flip breaks **three sealed engine invariants the
save validator itself runs** — the four-capability managed invariant
(`operations.ts:364-371`, architect-verified), the positional `placement-v12`
facility policy (`operations.ts:413-437`), and the single-arm
`activateStudioOperations` (`actions.ts:1273-1279`) — so a Gate+Admin studio is
today *unloadable*. It is additionally a property re-authoring job (vacated
footprints belong to no parcel — `lot.ts:91-94`) and a UI campaign (hard-coded
founding BuildingId references at a raw-grep upper bound of 386 non-test lines —
type-aware re-count is C2b-M3's first task; plus frozen journey shapes with a
closed validator). C2a delivers every blueprint the Flip needs. The master plan
§6 (:256-257) pre-authorized exactly this contingency.

---

## 3. Domain model — Stage, Set, Screenplay, reservation, queue

### 3.1 Stage and Set (the fork, ruled)

**A Soundstage is a buildable FACILITY; a Set is a first-class ENTITY; shooting
requires both.** This is the hybrid the code leans toward (`shooting` requires
`soundstage` + `set-scenery`, `operations.ts:87`, architect-verified), the corpus
supports (facilities and sets share one blueprint/finance/maintenance schema —
`schema_fields.csv`; sets carry per-genre float weights + a priority genre —
TECH-SET-008), and owner laws 3/4 both name.

**Soundstage.**
- A `FacilityBlueprint` with capability `soundstage`, capacity 1
  (`simultaneousProductions: 1` — every capacity field names its unit).
- **One stage class in C2a (Standard, 4×4).** Soundstage (Large) is deferred (§19):
  `bakeStage()` (`ui/src/lot/tycoon/assets.ts:872-892`) is parameterised by texture
  key ONLY — footprint/height/rise hard-coded — so a second footprint is named
  art+code work (the `bakeStageFromSpec` shape exists on the legacy renderer at
  `ui/src/lot/scene/assets.ts:420`).
- **World coverage per origin, ruled honestly (r3 — the r2 "both worlds" claim was
  refuted):** the GRID origin (5179, shipped default) composes placed-stage bodies
  procedurally (the C1-M4/M5 `bakeBlueprintTexture` path). The PLATE origin (5178,
  rollback) composes NO placed bodies — its building list is a static authored
  nine (`ui/src/lot/scene/layout.ts:83-220`, geometry never read from the
  snapshot). Disposition: the plate origin renders founding stages only and
  carries an **honest semantic fallback** for player-built facilities (law 12),
  with a named test asserting the fallback rather than silence, recorded as
  rollback-world maintenance. The M2 render gate is grid-origin; the plate gate is
  the fallback test. Laws 27a/27b (no authored plate cells against the Stage 7
  painting; district-manifest exporter frozen) stand untouched.
- **Each stage has two slots of different KINDS**: one **production slot**
  (`stage:<facilityId>:0` — what the allocator grants) and one **mount slot**
  (`mount:<facilityId>` — held by the mounted Set). A mounted Set NEVER consumes
  the production slot; the endowed studio's Stage 7 production slot is free at
  week 0 (named FMJ regression).

**Set.**
- A new state root `state.sets` (schema §8.1). Stat block, wired, SHOWN:
  - **quality** (0–100): with genre fit, feeds ONE bounded additive uplift to the
    bound picture's strength — `SET_QUALITY_UPLIFT_MAX`, `SET_GENRE_FIT_UPLIFT_MAX`
    — locked at bind, through the facility-effects uplift seam whose exactness the
    C1 economy snapshot §3a proved ("the uplift lands EXACTLY as authored").
  - **novelty** (0–1; per-INSTANCE; locked at bind; depleted per release):
    multiplies the release's success/box-office draw within named bounds
    (`SET_NOVELTY_RECEPTION_FACTOR_MIN..1`) — the corpus's stage-4 "audience
    boredom" shape, our numbers. Per-instance is an explicit ruling (a duplicate
    stage+set is a concurrency AND freshness purchase); the novelty-lock is
    adopted as our decision, not recovered parity; a canceled production burns no
    novelty (asserted by test). **Economy reconciliation (r3):** these two wired
    terms are a deliberate, Owner-ratified exception to §9's "instrument, don't
    fix" stance — bounded by G3, isolated by a dedicated snapshot figure (the
    19th: set-uplift/novelty effect measured on a byte-identical-rngState A/B,
    separate from the ceiling change) so C6 inherits the lever's measured size,
    not a confound.
  - **condition** (0–100): wears by `SET_CONDITION_WEAR_PER_PRODUCTION` at wrap
    (per-use, deterministic); below `SET_CONDITION_UNUSABLE_THRESHOLD` it **gates
    use only** in V1 (the manual-corroborated reading; the corpus self-contradicts
    on a quality penalty — deferred, recorded). **Repair ships in the SAME
    milestone:** a player action through any operational `set-scenery` facility
    (`SET_REPAIR_COST`, `SET_REPAIR_WEEKS`, occupying one slot); "Repair this set"
    is a `Remedy` arm. Decay without repair would manufacture an unrelievable
    queue reason — owner law 2 forbids that.
  - **weighted genre affinity + priority genre**: the fit component. **Fit is
    ADVISORY, never a gate** — any set can shoot any picture; poor fit costs
    uplift, warned at the package surface. Demand and fit are defined on the
    fields the schema actually carries (r3): demand = the screenplay's `Genre`
    (per-beat set types refine it, §3.5); fit = `genreWeights[genre]` plus a named
    bonus when `priorityGenre === genre`; uplift =
    `SET_QUALITY_UPLIFT_MAX × quality/100 + SET_GENRE_FIT_UPLIFT_MAX × fit`.
- **A Set is REQUIRED to shoot; WHICH set is a quality choice.** The requirement
  binds only productions greenlit in managed mode at V14+ (`requiresSetBinding`
  marker at greenlight); legacy/headless untouched; migrated in-flight
  grandfathered; directly-constructed test states untouched.
- **Mounting and striking.** A Set is commissioned AT a named stage. Commission
  **atomically acquires** the `set-scenery` slot AND the target `mount` slot, or
  refuses up front holding nothing — the placement-refusal pattern (reason +
  `Remedy`, like C1's twelve rejection codes; a build-verb legality refusal, not a
  production-flow forbid). Because mount is only ever acquired instantly at
  commission-commit and **nothing ever waits on it**, it needs no rank and closes
  lane 2's X3 cycle properly (r3 — the r2 "never a production slot" argument
  addressed the wrong slot): set construction holds `set-scenery` + `mount` and
  waits on nothing; productions wait only on standing sets and stage production
  slots. **Strike** is instant (`SET_STRIKE_WEEKS = 0`, named zero), refused while
  a production binds the set; demolishing a stage with a mounted set refuses
  ("Strike the set first"); a struck set retires (Tier-D `setRetired`,
  `setDemolitionRefund` at the depreciated fraction). Cycle dispositions: X1
  impossible (atomic stage+set, §3.2); X2 multi-set OUT of V1; X3 closed above;
  X4 reshoots out; X5 crew deferred.
- **The founding endowment: TWO generic house sets** ("Stage 7 House Set",
  "Stage 12 House Set" — modest quality, neutral weights; the corpus's
  SET_STAGE_GENERIC precedent). Minted by `activateStudioOperations` alongside
  `INITIAL_STUDIO_FACILITIES` (worldgen yields legacy operations with zero
  facilities — `worldgen.ts:665`) and synthesized by `migrateToV14` for
  managed-mode saves (the `convertV12ToV13`/INITIAL_PROPERTY precedent). **Both
  land in M1** so the V14 migrator is complete in one milestone (r3 — r2 had
  split migrator content across M1/M2). Founding capacity is therefore exactly
  today's (2 stages, 2 sets, scenery 2, dev/casting 2, post 2): every sealed spec
  runs unmodified; contention begins with the third picture. Auto-bind fires when
  exactly one candidate set is free. **The endowment is a COMPATIBILITY DEVICE,
  not permanent founding law (`00E`.12):** it exists for migrated saves, the
  sealed FMJ fixtures, pre-Flip C2a, and bounded harnesses — once the bare-start
  experience lands (C2b), fresh games start bare and build their sets, and
  **test fixtures adapt rather than weakening the product law** ("START SMALL.
  BUILD THE FILMMAKING OPERATION YOURSELF.").
- Set unlock gating reuses `BlueprintRequirement` verbatim (TECH-SET-007; kind
  switch `blueprintRequirements.ts:104-118`, aggregator `:170-190`).
- **Display-name authority (ruled at M2, before any queue copy):** the engine
  facility name is the single spoken authority — "Soundstage 7", "Soundstage 12",
  **"Scenery Shop"** (`operations.ts:29-31`). The buildable set-scenery blueprint
  is named **Scenery Shop** too (a second instance of the same class, the Post
  Building pattern) — r2's "Scenery Workshop" naming is unified away (r3), and
  repair/load-in are supplied by ANY operational set-scenery facility including
  the founding one. Specimen queue copy: *"Waiting on SOUNDSTAGE 12 — occupied by
  RAVINE until Week 14."*

### 3.2 The reservation model

The engine's existing primitive is kept and generalised (lane 1: the per-owner
`facilityId:slot` reservation with atomic all-or-nothing phase allocation is
correct, fail-closed, leak-free).

- **One named union producer.** `occupiedResourceSlots(state)` lands at M0,
  subsuming the enumerated traversals (r3 — the count is the list, not a number):
  `productionOccupiedFacilitySlots` ×2 (`scriptDevelopment.ts:75-85`,
  `castingSessions.ts:166-174`), `scriptOccupiedFacilitySlots` ×2
  (`scriptDevelopment.ts:88-99`, `castingSessions.ts:176-183`),
  `studioCalendar.facilityViews` (`studioCalendar.ts:257-388`), the three
  invariant walks (`operations.ts:485-487`, `scriptDevelopment.ts:818-820/:865`,
  `castingSessions.ts:501-525`), and `facilityEngagements`
  (`placement.ts:806-869`) — nine call sites; the M0 gate
  asserts every one is gone. Billing: the allocation paths are already
  cross-owner aware (`castingSessions.ts:234-237`, `tick.ts:206-213`), so the new
  fail-closed invariant is **defense-in-depth plus the extension point Sets
  need**. M0 discipline: behaviour-identical on every legal state (replay + save
  byte-identity on the sealed fixture corpus); the new cross-owner refusal proven
  non-vacuous on a forged fixture.
- **Kind-qualified keys**: `stage:<facilityId>:<slot>`, `set:<setId>`,
  `mount:<facilityId>` (acquired-instantly-only, §3.1), plus existing facility
  keys.
- **Bindings are NOT reservations.** `workflow.bindings` (§8.1) is the sole record
  of set occupancy; `requirementsForPhase` is UNCHANGED; set exclusivity is
  enforced through `occupiedResourceSlots` keyed `set:<setId>`; the
  exact-capability-multiset invariant (`operations.ts:463-468`) is untouched.
- **The acquisition gate: stage + set atomically at REHEARSAL ENTRY** (the gate
  that already acquires the soundstage). Greenlight shows an advisory match;
  binding becomes authoritative at rehearsal entry; both retained together
  through shooting (extending `operations.ts:133-143`). `heldSinceWeek` lives on
  `bindings` (never on reservation objects — the sealed whole-object comparisons
  in `tests/construction-core.test.ts:442-471` stand), stamped at acquisition,
  preserved across retention.
- **Acquisition rank:** `development-casting(1) < stage+set-composite(2) <
  set-scenery(3) < post(4)`, with the invariant that no workflow waits on a
  resource ranked ≤ anything it holds. The composite is one atomic rank-2 node
  (X1 impossible). `mount` is unranked because it is never waited on (§3.1).
  **No preemption, ever.**
- **THE RESOURCE-RELEASE LAW (`00E`.5 — the Owner REVERSED r3.1's HOLD
  recommendation):** *a scarce resource is held only while the current phase
  genuinely requires it; when a phase's work COMPLETES, that phase's resources
  RELEASE, even if the next phase's resource is unavailable.* Shooting completes
  → stage and set release (wrap, §4.3, fires unconditionally at that moment) →
  the production queues for Post **holding nothing** → the freed stage is
  available to the next shoot. Completed work never hostages an old resource.
  Mechanically this splits the currently-atomic phase transition
  (release-on-completion, then acquire-next inside the fixed-point sweep — a
  designed M4 change) and *simplifies* the deadlock story: a post-waiter holds
  nothing, so hold-and-wait vanishes on that edge; the acquisition ranks now
  govern only the in-phase retention edges (rehearsal→shooting stage+set, which
  the next phase genuinely requires, stands). The joined queue surface reads
  "Wrapped — waiting for Post," and the r3.1 head-of-line congestion analysis is
  superseded: the failure mode to watch becomes re-acquisition fairness, which
  the ordinal/aging order already governs and §15 attacks.
- **Sticky reservations** (lane 2's R-1): retention becomes sticky for ALL
  capabilities — a contract-conformance repair
  (`DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:500` "no reservation migration").

### 3.3 The concurrency model and the queue

**`MAX_CONCURRENT_PRODUCTIONS` is DELETED, not raised.** Admission model:
**Phase-Gate Admission** (lane 2 candidate B) — the atomic hold/retry mechanism
already at phase transitions becomes the ONE mechanism everywhere:

- **THREE front-door refusals become queued intents** (r3 — the cap check is
  deleted, not queued): greenlight-on-dev-slot (`operations.ts:217-221`),
  commission (`scriptDevelopment.ts:270-274` — original-screenplay commissions
  included via their own intent arm, §3.5/§8.1), casting start
  (`castingSessions.ts:302-304`). A queued intent is a discriminated union row
  carrying the FULL action payload (§8.1 — FOUR arms: the original-commission
  arm carries writer/genre/shape and NO conceptId, because **the mint happens at
  commission-COMMIT**, the moment the slot is actually granted; a queued
  original intent has minted nothing, so an expired intent orphans no concept
  and burns no ordinal); **at dequeue the payload is revalidated** — an intent
  no longer legal drops with a Tier-W `queueIntentExpired` event and a stated
  reason; **nothing is held while queued**; pre-greenlight intents name script
  projects (no production id exists before greenlight). Greenlight commitment
  semantics unchanged (cash + talent at greenlight).
- **The deleted cap's other consumers, dispositioned** (audit list generated by
  `grep -rn MAX_CONCURRENT_PRODUCTIONS src ui tests scripts` at HEAD — 26 files):
  `actions.ts:333` cap throw — DELETED with the constant; `agents.ts:62` — a named
  `AGENT_MAX_SLATE = 2` policy constant, behavior-identical, so the sealed M0A
  corpus stays byte-identical; `scriptReadModel.ts:624-632` `production-capacity`
  blocker kind + copy — re-based at M4 as a **read-model union change** (not save
  state — exempt from the M1 schema freeze; owned by OPUS-ENGINE-CAPACITY), with
  its guard sites named: the closed kind-sets at
  `ui/src/lot/snapshot/scriptReview.ts:176` and `castingReview.ts:191/:202`, and
  `castingReview.ts:392`'s `productionSlotAvailable` agreement check, which needs
  a **successor semantic**, not just a key edit; the two pinning tests
  (`LotCastingReviewPanel.test.tsx:159`, `castingReview.test.ts:439`) re-based
  per §11.8's category; **`adapter.ts:1286` `canGreenlightMore` +
  its `Dashboard.tsx:113/231-235/271-275` consumers** (r3 — the fifth cap gate the
  verify pass found): derived from live capacity/queue admission, F4-style, owner
  OPUS-SCREENS; the Dashboard's "At the production cap" sentence joins G12's
  falsified-sentence list; `Assembly.tsx:1325/:1336` + `economyView.ts:205-210` +
  `adapter.ts:2179` break-even `concurrency: 2` line — derived from live capacity
  (§10); `scripts/measure-c1-economy.mts` C1 sections freeze the literal as
  historical; harness/test consumers per §11.8.
- **Queue state is persisted** (V14): integer `queueOrdinal` at admission,
  `queuedWeek`, per-gate ordering **longest-waiting-first, ordinal tie-break**
  (deterministic; replaces ascending-productionId whose one-week unfairness a
  committed test proves — `tests/operations.test.ts:433-541`, retired-with-
  successor per §11.8). Guardrail (`00B`.2): the fairness fix is the ORDINAL —
  production-id format and values are permanent, never re-minted or reformatted.
- **The weekly sweep is a fixed-point allocation pass**: transition attempts run
  in queue-priority order; each success releases predecessor resources into the
  pool immediately; the sweep iterates to a fixed point (bounded by workflow
  count) so capacity freed by anyone is visible to every waiter the same week.
  Releases happen only through successful transitions, terminal completion,
  cancellation, and strike/demolition paths — a blocked production releases
  nothing. Front-door queue admission runs as a **new inserted tick step** (after
  production allocation, before construction completion) under D-12 §9's ratified
  insertion rule ("inserted, not reordered" — `tick.ts:18`).
- **The blocker becomes legible — split honestly (r3):** the PERSISTED
  `ProductionBlocker` gains exactly ONE new arm, `set-unavailable`
  `{targetPhase}` (typed in §8.1; the `save.ts:2486-2489` capability cross-check
  gains a per-arm rule — the new arm carries no capability and is validated by
  its own exact-key list). Everything legibility-rich — the full unmet list,
  `occupiedBy: [{resourceId, ownerId, title, activity, freesInWeeks}]`, and
  `remedies: readonly Remedy[]` — lives on the DERIVED `studioQueueView(state)`
  row, computed from the blocker + the occupancy union + `remainingTicks` + the
  catalogs, and **never enters GameState** (catalog-derived values never touch
  byte-parity). `Remedy` is the defined union: `build-blueprint` /
  `wait-for-holder` / `repair-set` / `strike-and-mount` / `cancel-queued-intent`.
- **The queue has owned player surfaces**: world-native, the **Call Board** at the
  blocked site (§4.2); deep, a **queue panel on the Production Board/Calendar**
  rendering all four law-2 facts for production waiters AND pre-greenlight
  intents, remedy rows routing into the build catalog. One core read model
  `studioQueueView(state)` (beside `studioCalendar()` in
  `src/core/studioCalendar.ts`) feeds Dashboard, Calendar, Lot. G16 gates the
  four facts rendered non-empty in a seeded contended run.
- The rewrite of the reachable-blocker invariant (`operations.ts:531-549`) is
  audited-invariant surgery under law 28 — this charter at GO is the explicit
  instruction.

**Throughput honesty:** the cap is the only binding constraint today — 0.25
films/wk vs a physical binding ceiling of ~0.40–0.50 (development-casting;
soundstage 0.67; set-scenery and post 1.00 — lane 6; harness-measured at M4
before quoting). Deletion lands with buildable stages and mandatory Sets live.
**G10.1 is the campaign's real acceptance test**: the C1 snapshot proved purchased
slots inert at the ceiling; post-C2a the same measurement must show them no
longer inert on ≥4 of 5 seeds.

### 3.4 Required buildable facilities (the build-path gap, closed)

`FACILITY_BLUEPRINTS` today: five entries, zero soundstage, zero post, zero
effective set-scenery (architect-verified). C2a authors:

| Blueprint | Capability | Notes |
|---|---|---|
| Soundstage (Standard) | `soundstage` ×1 | One class in C2a (§3.1) |
| Post Building | `post` ×N | Relieves the head-of-line hold honestly |
| Scenery Shop | `set-scenery` ×N | Second instance of the founding class; set construction, repair, load-in |
| Baseline Development & Casting Office | `development-casting` | From-scratch path (Flip prerequisite); ONE baseline blueprint — the same-capability duplicate was cut (`lot.ts:230-238`'s honest-empty-list precedent); whether `casting` splits into its own capability is §18 item 1c |

Deferred with reasons: **Crew Quarters** (crew-as-capacity deferred — when it
returns it arrives with founding supply and a grandfather); **Soundstage (Large)**
(§3.1). Corpus note, stated exactly: the original's crew shares the
auto-filled-quota shape (Bible :970/:1599/:1603) but its crew carry per-person
experience feeding Production Quality (Bible :1597; `movie_rating_pipeline.json`
stage 2) — the eventual anonymous-slot model is a deliberate simplification, and
the no-mood claim is INFERRED per its source.

**The C2a ground question, evidence-gated (r3 — the r2 necessity claim was
refuted):** the clearance ring is a separation rule BETWEEN PLACEMENTS only
(`placement.ts:19-27`, `:587-593` — ring cells need not be owned or in-parcel;
the founding studio has zero placements so the rule starts vacuous), so
`south-lawn` (6×4) and `backlot-apron` (4×5) — both road-served — already admit
4×4 footprints. **M2's first task is the placement sweep**: run `queryPlacement`
for the Soundstage blueprint at every origin on the **seven** road-served
buildable parcels (123 cells total — r3.1: the legacy `expansion` parcel, 4×4/16
cells, IS road-served via its boulevard frontage strip, `lot.ts:82-85`, and is
one of only three road-served parcels that admit a 4×4 footprint at all; it is
reserved to the Annex contract via `groundReserved`, so the sweep reports its
verdict with the reservation noted rather than silently dropping it) together
with the Post/Scenery/office slate, and publish the arithmetic. **If** the sweep shows the C2a slate does not fit, the
bounded **north-back-lot road spur** (7×6, deliberately road-less — `lot.ts:87-89`
— the one parcel holding a stage plus full ring) is pre-authorized as headroom
(§18 item 8 covers it), authored under laws 25/27a with its own re-pin; **else it
is dropped**. The M2 gate's stage count and §16a's third-stage beat are stated
against the sweep's output, not assumed.

Founding facility capacities move from object literals (`operations.ts:26-31`)
into TUNING (named `FOUNDING_*_CAPACITY` constants — added to §9's inventory).

### 3.5 Renewable Screenplay Generation V1 — the Movie Blueprint (`00C`.3, `00D`; lane 14)

**The fantasy:** *a writer goes to work and eventually hands me a new movie.*
**The cliff it removes:** concepts are seeded per-world (exactly 30), claimed
permanently at commission (no second project per concept, ever — projects are
append-only with no delete path), and exhaustion is a TERMINAL `no-concepts`
blocker whose remedy is "Continue with an existing project"
(`scriptReadModel.ts:548-555`) — a hard 30-film lifetime ceiling recorded in no
document until lane 14.

**Design (smallest deterministic V1; historical model as floor, modernized):**

- **Commission an Original Screenplay** — a new action beside pool commission:
  the player picks the creative direction (genre + the existing FilmShape values;
  the shipped 3-beat FilmShape IS the Owner's "FilmShape bends the expression" —
  `shape.ts`, 36 combinations); the existing draft machinery runs unchanged
  (writer + one dev/casting slot occupied — **already true on four layers and
  already player-visible copy**: "One week passes while the writer and one
  Development & Casting slot are occupied," `scriptReadModel.ts:213`); the
  concept and its blueprint are **minted at COMMISSION-COMMIT** — the moment the
  dev slot is actually granted (forced by the frozen V9 `ScriptProject.conceptId`
  non-null shape; there is no abandon verb after commit, and a QUEUED
  original-commission intent carries writer/genre/shape only, §8.1 — it has
  minted nothing, so intent expiry orphans no concept and burns no ordinal; no
  cancellation hole either side of the gate). **Concept-id minting reserves
  against `persistedConceptIds(state)`** — modelled on `persistedProductionIds`,
  walking the four conceptId-bearing roots (`Production`, `FilmResult`,
  `TheatricalRun`, `ScriptProject`) plus `state.concepts` — ids never re-minted
  or reformatted (guardrail `00B`.2's concept analogue; invariant in G17).
- **The mint appends a new `FilmConcept` to `state.concepts`** with namespaced id
  `concept-orig-NNNN` (monotonic `nextOrdinal`, lexicographically after `c-29`;
  save validation has no count assertion; zero code hard-codes `c-NN` — lane 14
  verified both). The appended concept carries ONLY world-shaped fields (the
  frozen 8-field FilmConcept is **never widened** — guardrail `00B`.4; the
  verifier's empty optional-key list at `save.ts:1379-1395` makes the violation
  mechanical to detect). All new facts live in the **Movie Blueprint** (V14 root,
  §8.1): stable conceptId, ordinal, mintedWeek, projectId, **writer attribution**,
  **generatedTitle** (immutable) + renamedWeek, **beats[]**, officeTierAtMint.
- **Titles:** generated at mint from the existing authored word lists (48 leads ×
  60 nouns — 2,880 combinations) via `stream(seed, 'screenplay-v1',
  '<conceptId>:title')` — the `presence-v1` purpose-keyed precedent (guardrail
  `00C`.10.G), derived-only, never advancing the sim stream; a genre-keyed
  lead-word subset gives genre flavor without new authored vocabulary (full
  per-genre vocabularies → C4). **Rename** is a new action writing
  `FilmConcept.title` in place — the title has exactly ONE storage location, 21
  surfaces resolve it live, and exactly 2 freeze history (`TalentCareerEvent.
  filmTitle`, `BroadcastItem.template`) — stated in the contract so frozen press
  clippings keeping the old title is a documented behavior, not a playtest bug.
  Rename never touches identity. V1 scope: generated concepts only.
  **Evidence distinction preserved verbatim (`00D`):** genre-influenced random
  titles are directly confirmed for the Advanced Movie-Maker only (Prima); the
  word "rename" appears nowhere in the corpus; the standard-pipeline
  generated+renamable title is an **Owner ruling with the AMM control as
  precedent, not recovered fact** — and M3 adds the corresponding row to
  `ACTIVE-UNRESOLVED-QUESTIONS.csv`.
- **Beats — genre supplies the skeleton:** each blueprint carries a 7-beat
  structure from its genre's template. Recovered verbatim for the original five;
  our vocabulary keeps SIX genres (untouched — 6-vs-5 is C4's question, master
  plan §10.5): comedy/romance/horror use the recovered templates; **drama, crime,
  adventure get authored templates labelled authored-not-recovered**; the
  original's Action/Sci-Fi templates are recorded as unused reference shapes; the
  simplified 4-stage variant is unrecovered (Q036) and not built. FilmShape bends
  expression (beat flavor text keys off shape slots); **beats carry
  `requiredSetType: SetTypeId`**, resolving against a standing `StudioSet`'s
  `setType` (both from the closed `SET_TYPES` vocabulary AUTHORED AT M2, §8.1/§9
  — the lane-14 interface dependency, joined) — the beat structure IS the set
  demand (`00D`'s hypothesis,
  corpus-confirmed at the highest tier: Prima — "If you design a scene on a set
  that your studio doesn't own, you won't be able to shoot the movie until the
  set is constructed"). Required sets are a DERIVED read model (never written
  onto FilmConcept — guardrail 8); the package surface publishes owned/unowned;
  the queue turns unbuilt/occupied into named, actionable waiting. V1 grain: one
  BOUND set per production stands (X2); the beats' distinct set-type count feeds
  the fit/variety surface, not multi-set reservations.
- **Quality — office tier is the ceiling lever, writers are people, and V1 adds
  NO new strength lever (r3.1):** a minted concept draws `baselineStrength` from
  the SAME distribution worldgen's pool concepts use (bounded purpose-keyed
  draw), and its `baseNegativeCost` derives from strength per the pool's own
  cost↔strength correlation rule (never an independent draw — lane 14 §8.9). The
  office's shipped EST uplift, applied at draft (`tuning.ts:790-792`, additive —
  a recorded deliberate divergence from the original's hard ceiling), remains
  the ONLY office lever; `officeTierAtMint` is an audit-trail record in V1, not
  a strength term — so RSG introduces zero new economy levers and needs no §9
  exception. The corpus four-tier ladder
  (Basic→Intermediate→Proficient→First-Class) is the C4 deepening target; C1's
  three office tiers are V1's ladder. The writer-experience contradiction (§1)
  is RULED at `00E`.9 (§18 item 9a): C2 implements the SOURCE behavior — the
  writer-speed/pooling bullet below carries the design.
- **Pool concepts become blueprints on first commission** (ONE production path —
  lane 14's recommendation): commissioning a pool concept derives its blueprint
  (beats from its genre template, officeTierAtMint, no generatedTitle). The 30
  remain a finite founding premium the player can exhaust; **the `no-concepts`
  blocker stops being terminal** — its remedy becomes "Commission an original
  screenplay," which is the whole point.
- **Provenance is visible** (the fantasy must land, not be plumbing): the script
  board and package surfaces mark originals — *"An Original Screenplay by
  ‹writer›"* — vs the world pool.
- **Two traps, closed by contract (lane 14):** `correlateConceptCost`
  (`employment.ts:385-401`) is a whole-pool rank permutation run once at
  founding — **it is NEVER re-run after appends** (contract prohibition + a
  regression test; re-running would re-price in-flight productions);
  `candidates.ts:236` draws `Math.floor(rng.next() * concepts.length)` from the
  persisted sim stream, so agent draws are NECESSARILY a function of pool size —
  the guard therefore asserts what CAN hold (r3.1): the headless/M0A corpus never
  founds and therefore never mints, so `concepts.length` is invariant across the
  corpus and agent draws are unchanged; the guard fails loudly if a corpus run
  ever mints. The lot commission workspace's exact-key check
  (`ui/src/lot/snapshot/scriptCommission.ts:537-545`) is updated with the
  provenance field in the same commit that adds it.
- **Writer speed and bounded pooling (`00E`.9 — the Owner REVERSED r3.1's
  keep-shipped recommendation and its pooling deferral):** binding successor
  behavior, implemented in M3: *writer experience affects WRITING SPEED, not
  script quality; the office tier owns the achievable quality ceiling.* The
  shipped writer-quality term (40% of draft strength,
  `scriptDevelopment.ts:352-362`) is re-based out with no compensating bonus
  invented; **draft duration becomes a bounded deterministic function of
  blueprint richness, writer experience, and pool size** (minimum 1 week; named
  TUNING — `SCRIPT_DRAFT_WEEKS_*`), relaxing the one-week invariant
  (`scriptDevelopment.ts:900-916`) under law 28 with this charter as the
  explicit instruction; `ScriptProject` gains a bounded writers list (≤5, the
  corpus bound) as a persisted-leaf widening under the §8.3 version-aware
  boundary rule; the affected sealed invariants and assessments join §11.8's
  re-based category with named successors. The causal chain is the law
  (`00E`.10): *Genre → Story Structure → FilmShape → Screenplay Blueprint →
  Roles/Sets → Physical Production → Movie Quality* — RSG is never
  random-title + random-number.
- **Fenced OUT of V1** (→ §19): the 8-factor Script Quality model (cited with
  its own inconsistencies — ~117% totals — never cloned); genre-room buildings;
  era-sensitive premises, evolving genre interest, research coupling, richer
  content pools (C4); Advanced Movie-Maker anything. Variable SHOOTING length
  stays out (the eight-week production clock is untouched; richer-script demand
  lands as beat/role/cost richness there).

---

## 4. The Living Studio — time model + simulation theater

### 4.1 Time model: Living Turn V1 (ruled; full spec in `08A`)

The engine's discrete week stays the only authoritative clock; the UI gains a
presentation scheduler: **while unpaused — play week N as witnessed time (the
shipped 9-beat playback, `PLAYBACK_LAST_BEAT = 8`, 10.35s at 1×; the engine's
BEATS_PER_WEEK = 10 is the projection's count, not the playback's), commit the
identical authoritative advance a manual press commits, consult the stop ladder,
repeat.**

- **The auto-pause partition** (Owner ratifies at §18 item 3): **PAUSE-class** —
  `release` (the Premiere), `scriptReview`, `castingReview`, `productionDecision`,
  `cashNegative`. **NOTIFY-class** — `wrap`, `runCompleted`,
  `constructionCompleted`, `contractExpired`, `renewalWindow` — attention/badge
  channel + the played week's beats; the loop continues. **`limit`** (the
  520-week batch guard) is batch-verb-only — the living loop commits one tick at
  a time and can never raise it; stated so the partition is total (ten members
  today, eleven once `wrap` lands). A studio stalled only on NOTIFY facts keeps
  running with reasons continuously stated on the Class-A queue surfaces;
  `cashNegative` is PAUSE-class, so a failing studio always pauses with a stated
  reason.
- **Pause and speed**: ladder **1× / 2× / 4×** (ceiling 4×) on
  `PLAYBACK_BEAT_MS` — 10.35s → ~5.2s → ~2.6s per week. Above 2×, Class-B beats
  collapse to final positions via the reduced-motion path; Class-A stays
  continuous; speed never yields half-played ceremonies.
- **Living time runs on the Lot only**: other screens keep explicit advance
  verbs; the Call Board keeps the queue readable without leaving living time; the
  deep queue panel is a paused/overlay surface (§16a matches).
- **"Advance to next event" survives as fast-forward** with the FULL unpartitioned
  ladder and unchanged batch semantics (law 3).
- **The mandatory engineering rule (LL EX):** the scheduler consumes an
  **extracted, exported `simStopFor(before, after): SimStopReason | null`**
  pulled from the inline batch loop (`adapter.ts:2349-2440`; the single-week path
  returns no stop reason today) — named M5 work, owned by OPUS-ENGINE-CORE,
  landed before OPUS-TIME consumes it. The ladder is never re-implemented in
  React.
- **The scheduler pauses with the renderer** (hidden tab = paused studio; PF1
  §0.7, appendix).
- **Determinism proof obligation:** byte-identical exported saves across
  hand-advanced / living-loop-at-any-speed / paused-resumed / batch-skipped twins.
  Guardrail (`00B`.6): `market.tick` remains the authoritative integer week —
  Living Turn V1 persists NO intra-week position; any future variant needing one
  adds new V-next state.
- **The release-week playback hole closes FIRST** (`App.tsx:2525` gates week
  playback on `released.length === 0 && resolvedReturnContext.kind === 'lot'` —
  both conditions): prerequisite for living time and the Premiere.
- The enumerated refusal clauses are superseded (§11.3); Model C stays refuted;
  B3 stays a C3+ paper spike; BEATS_PER_WEEK authority resolved for C2 in favor
  of `presence.ts`.

### 4.2 Simulation theater (owner laws 5 + 9)

Class-A (state projection — true of the settled week, renders identically on
load/after a batch/mid-playback) vs Class-B (witnessed time, inside the played
week, inheriting the `StudioLotScreen.tsx:4382-4406` law-3 gate). Throughput
legibility lives in Class A; arrival/wrap/premiere moments are Class B.
**EVERYTHING BELONGS TO A SYSTEM** (`00C`.6): visible activity answers "why is
that person/object there?"

Shipped machinery is widened, not reinvented: presence beats/routes/playback,
occupancy captions, stage lamps/chips, the scenery yard→dock line, the shared
queue-chevron layer. The Stage-7-hardcoded surfaces generalise to N facilities
(the enumerated list fixed by command at M2). New subjects: stages hot/dark, sets
mounted/striking, crates for queued work, wrap clearing the stage, **writers at
work in Development while an original screenplay drafts** (already-projected
presence — the RSG fantasy made visible).

- **Queue physicality — committed deliverable: Option B "the Backed-Up Lot"**
  (procedural crates/flats/truck massing on the contended stage's apron, one
  element per waited week, capped, cleared by wrap; draw-call budget named at
  re-pin). **Option A "the Call Board"** (placard: picture / need / occupant /
  free-in-N / REMEDY) ships as the floor and the queue's world-native reading
  either way; the de-scope call is the Owner's, made knowingly (§18 item 8).
  Option C stays deferred.
- **The eight ambient patrol actors are GROUNDED** (each conditional on an
  authoritative fact) — a live law-9 violation becomes an exemplar, zero new art.
- **Layout, delivered narrowly and Owner-signed (§18 item 8):** scenery load-in
  gains real duration from engine-owned grid distance between the supplying
  set-scenery facility and the bound stage (`SCENERY_LOAD_IN_WEEKS_BASE` +
  `_PER_DISTANCE`); general travel-as-outcome stays out. Moving load-in moves the
  accepted Scenery Load-In V1 contract + four SHA-256-pinned fixtures — the V1
  Keep gate is re-proven inside the milestone (§11.6 supersedes the contract's
  exclusion list).
- **Re-pin discipline** (five rules, C1-M6 template; C2's control inverts: actors
  move, authored object counts hold; plate re-pins labelled rollback-world
  maintenance). No committed canvas digests exist — human visual review remains a
  mandatory gate.

### 4.3 Wrap (defined)

**Wrap is the authoritative completion of shooting — automatic, not a player
command.** Split correctly across the campaign:

- **M1 (engine, PF1-independent):** the shooting-completion boundary (the
  silent `remainingTicks 4→3` transition) emits a Tier-D `wrapped` event at the
  moment stage and set release — which under the RESOURCE-RELEASE LAW
  (`00E`.5, §3.2) is **unconditional**: wrap fires when shooting completes,
  whether or not Post is available, and the freed capacity is allocatable the
  same week via the fixed-point sweep. The event-model's worked example.
  (The release-on-completion split of the currently-atomic transition is M4's
  designed engine change; M1's event lands on the boundary as it exists.)
- **M5 (UI, post-PF1-seal):** `SimStopReason` gains `wrap` — **inserted
  immediately after `productionDecision`, before `constructionCompleted`**.
  NOTIFY-class in the living loop; a normal stop in the batch verb. Named
  required work: a `wrap` arm in `simStopMessage` (today's `default:` prints the
  520-week-guard sentence — a G12 violation), a `wrap` entry in
  `EXACT_STOP_REASONS` (`ui/src/lot/snapshot/nextEvent.ts:177-186`), a
  `targetFor` arm (`ui/src/lot/snapshot/nextEvent.ts:688-689`), and compile-time
  `never`-exhaustiveness guards on both switches. PF1's cue-grammar
  exhaustiveness test fails on the new member by design (appendix — the wrap
  tier slot is reserved); the tier-table update lands with this milestone.

Excluded: reshoots, partial wrap, strike duration, wrap-party anything.

---

## 5. The event model (docket adjudicated)

**Ruling recommended: Option A — a persisted, engine-appended `studioEvents`
ledger at a new V14 root.** (Lane 11's docket; lane 5's transient-emission case
and the adjudication are on the record: ~1,046 call sites vs ~26 files; 6 of 12
consumers need history; determinism and classifier-pollution concerns answered —
engine-only append inside the pure closure, its own root.)

Pins:

1. Appended **only by `src/core`** ("the engine" = `src/core`; the adapter is the
   boundary layer). No `seen`/`consumed` field ever (byte-parity, PF1 §2 —
   appendix). **Domain history ONLY (`00E`.15, binding):** the ledger records
   meaningful authoritative/domain facts — never toasts, animation cues, sound
   triggers, hover chatter, or any presentation event; a 120-year save is not
   a presentation archive. Persistence must be justified by historical/domain
   meaning.
2. **Witness, never input** — single exception: `persistedProductionIds` walks it
   (law 20), enforced by an invariant test that nothing else in src/core reads it.
3. **Two-tier retention; Tier D is the identity-bearing tier.** Tier D permanent:
   `premiere`, `wrapped`, `constructionCompleted`, `setBuilt`, `setRetired`.
   Tier W windowed by `STUDIO_EVENT_WINDOW_WEEKS` (reservation grants/releases,
   queue admissions, `queueIntentExpired`, `phaseEntered`, `sceneryArrived`),
   compacted as a pure function of `market.tick`; `nextSeq` never rewinds.
   Queue-intent rows carry NO production id ever (intents reference script
   projects — r3 closes the r2 tier conflict by construction). **Windowing
   applies to `studioEvents` ONLY: the cash `state.ledger` is permanent history,
   never pruned (`00B`.5).**
4. **Exact-once = idempotent-above-a-cursor** (`lastConsumedSeq` outside
   GameState; on loss, REPLAY). Retires the ~27 `setLotCadenceFeedback(null)`
   sites (36 `setLotCadenceFeedback` occurrences total — command-verified) and
   survives reload.
5. **The M0A gate is preserved:** the ledger is EMPTY on the legacy/headless path
   (`operations.mode === 'managed'` gate); `tests/acceptance-corpus.test.ts`
   byte-identity holds without re-baselining (verified: it compares two in-run
   replays).
6. **Migration is five phases and never goes red** (root lands writing nothing →
   engine writes/nobody reads → dual-run equality vs all 17 diff-detectors →
   detectors flip to log projections preserving exported signatures → retire
   after a full green seal cycle). New consumers are log readers from day one.
7. A one-off save-size measurement (weeks 52/208/520) runs before the retention
   window is fixed.

---

## 6. Premiere Night V1 + the Theater (ruled by `00C`.7–8)

**The Theater is NOT core release authority** — release authority belongs to the
production/distribution workflow, which is already true mechanically: the theater
structure provides no facility (`lot.ts:213-219`, role 'landmark',
`providesFacilityIds: []`), `releaseReady` reserves nothing, and release resolves
entirely in the tick. What C2 removes is the *presentational* anchoring of
release semantics to a building that may not exist post-Flip.

- **The Flip does NOT seed a Theater.** The minimum starting lot is Gate +
  Administration + road + parcels — the master plan §6 sentence stands as
  written, and its r2-era "amend the minimum lot" recommendation is withdrawn
  (lane 9's G2 self-contradiction resolves the other way). On ENDOWED lots the
  existing Theater structure remains a historical landmark, untouched.
- **An optional buildable Screening Theater / Premiere House** (prestige,
  test-screening, festival infrastructure) routes to **C3** — the Theater concept
  is not deleted, only de-required.
- The release-semantic anchors become regime-aware **at C2a-M6** (r3.1 — they
  gate M6's theater-less premiere fixture, so they cannot wait for C2b):
  `managedWorkflowLocation`'s releaseReady → 'theater' (`adapter.ts:5550-5551`),
  `nextEvent`'s run-completed anchor and its hostile-input check
  (`ui/src/lot/snapshot/nextEvent.ts:49/:649/:780` — the check currently REFUSES
  any value but 'theater') fall back to the Gate on theater-less lots (an honest
  semantic fallback, law 12). C2b-M3 only extends them to the bare-lot regime.

**Premiere Night V1: "The send-off at the Gate."** Venue-independent by
construction — staged at the **Studio Gate**, which exists in BOTH founding
regimes and is already the studio's identity/arrival stage. On a lot-origin
release week the player is NOT teleported away: a premiere hoarding at the Gate
carries the film's title; the frozen `FilmResult.participants` assemble and
depart through the Gate for the city premiere (photographers, a crowd sized by a
bounded deterministic function of opening gross, searchlight beams beyond the
gate skyline where era-appropriate); the Gazette opens from a world receipt into
the untouched NewspaperReveal → ReleaseResult → Autopsy chain. **On endowed lots
the Theater marquee ALSO lights with the title** — pure flavor, explicitly not a
dependency (the named-title marquee exists on the legacy renderer only,
`signage.ts:151-233`, imported solely by `LotScene` — **the TycoonScene port is
required work**, kept in scope as endowed-lot flavor). **Option B floor** =
hoarding + marquee only, no arrivals (Owner pre-decision, §18 item 8).

Pins:
- **Zero-cash ceremony** (`PREMIERE_NIGHT_COST` named zero; §18 item 8 covers
  it). **The amplifier pin, split correctly:** the corpus invariant covers
  artistic quality only (register :87 — quoted, including "A weak movie may still
  become profitable"); the **zero-engine-delta rule — a V1 premiere changes no
  reception, box office, standing, awareness, prestige, or cash — is a CHARTER
  RULING** so Premiere Night cannot become a second degenerate awareness
  purchase. G7 gates the ruling.
- **The attendance question, ruled** (lane 9's G3): participants are framed as
  *attending an event* read from frozen `FilmResult.participants`; the anonymous
  crowd is a declared Class-A projection of an authoritative number (opening
  gross; UI-side named constants). §15 carries the two carve-outs.
- Premiere is **PAUSE-class**; plays once, on the stopping tick; never narrates
  skipped weeks; falls through to today's exact setScreen path on staging
  failure; multi-release weeks stage ONE sequence naming both pictures.
- **Prerequisite: the week-authority fix.** `releaseTick` is stamped
  pre-increment and printed while the player stands in releaseTick+1; behaviour,
  not copy — the chain runs `adapter.ts:6476` (`weeksAgo = week − releaseTick`) →
  `vignettes.ts:289-290`, `buildingInspector.ts:640`, plus direct prints
  (`adapter.ts:5268`, `newspaper.ts:647`) **and the `releaseWeek` hop** (r3 —
  minted at `adapter.ts:2944` and `careerImpact.ts:99`, printed by Dashboard,
  Autopsy, StudioRunRecap, FilmPoster, CareerImpact). One convention is ruled
  (present the release week as the week the player stands in; stamp unchanged;
  presentation derives uniformly) and **the gate is the command's output at M6
  HEAD** — `grep -rn "releaseTick\|releaseWeek\|weeksAgo" src ui/src` — with the
  list above illustrative, all named surfaces in M6 scope.

If PF1's cue grammar shipped, its tier-1 release sting (appendix) is the
premiere's downbeat; if KILLED, the premiere is silent but complete.

---

## 7. The Founding Flip (C2b)

**Definition:** a NEW fresh studio begins with Gate + Administration + road +
vacant parcels (§6 — no Theater), and builds the filmmaking operation. A flipped
studio is a new game; **migrated saves never experience the Flip retroactively.**

1. **`foundingRegime: 'endowed' | 'bare-lot'`** — one durable monotonic V15 root
   (the `economyEngagedEver` pattern), written once at worldgen, never re-derived;
   every migrated save becomes `'endowed'`.
2. **Invariant surgery, explicitly authorized** (law 28): the four-capability
   invariant, the positional `placement-v12` policy, and `activateStudioOperations`
   gain bare-lot regime arms; the regime threads like `LiveStateValidationPolicy`.
3. **Representation ruling (A):** founding bodies become first-class placements;
   Gate/Admin remain PropertyStructures (Theater remains a structure on endowed
   lots only). Vocabulary: *eight authored structures + one reserved parcel =
   nine addressable places.* Guardrail (`00B`.1/`00C`.9): the bare-lot world is a
   **new** constant (e.g. `BARE_LOT_INITIAL_PROPERTY`); **`INITIAL_PROPERTY` is
   immutable V12→V13 migration authority and is never edited** — historical saves
   keep reconstructing against the original anchor, byte-for-byte.
4. **Property re-authoring:** the post-Flip parcel map is authored world work
   (stages fit; laws 25/27a); the `lotParcelInspectorContext`
   reservation-awareness seam (deferred by C1 to "the campaign that next touches
   that surface") is C2b's.
5. **Journey upstream:** construction stages extend the FMJ projection. The
   journey file holds FOUR closed vocabularies: `JOURNEY_STAGES`,
   `JOURNEY_TARGET_KINDS` (gains a `build` member), `JOURNEY_SITES` (no new
   member), `JOURNEY_STAGE_BUILDING_IDS` (owned by the C2a-M2 N-stage sweep —
   cannot wait for C2b). `JOURNEY_SITE_BUILDING` becomes a live lookup with an
   honest "not built yet" arm; the BuildingId sweep is sized by a type-aware
   re-count (command published in the milestone; the raw-grep 386 is a labelled
   upper bound). Blueprint `requires` audit: no post-Flip blueprint requires a
   founding structure; `maxInstances` counts structures + placements. Release
   anchors become regime-aware (§6).
6. **The opening act is an OVERLAP**: commission/greenlight during construction
   is legitimate (no stage needed until 6 weeks from release) — and with RSG the
   opening act begins with WRITING (§3.5), exactly the `00C`.12 chain. Fresh-start
   runway is measured (E3) **all-in**: ~$94k/week payroll+overhead PLUS
   $13.5k–22k/week facility opex accruing as the core completes; core build-out
   $3.4–5.1M capital. The pessimistic branch is potentially unwinnable at $20M —
   `FLIP_INITIAL_CASH`/build-weeks/overlap tuning is C2b-M4 subject matter,
   parameterised by the all-in number.
7. **Compatibility gates:** all 21 pre-Flip test files run UNMODIFIED against the
   permanent `preFlipFoundedStudio(seed)` fixture; both sealed e2e journeys run
   unmodified against a MIGRATED save; a new e2e proves bare lot → build core →
   FIRST FILM GREENLIT → wrap. The D-16 corpus SHA-256 neutrality is handled
   deliberately (fixture pinned + formal re-base with a recorded ruling).

---

## 8. Save/schema requirements

**C2a = SaveFileV14 — the COMPLETE schema AND the complete migrator land at M1**
(all roots present; endowed house-sets synthesis included — r3; M2+ populate via
actions and add no schema members). **C2b = SaveFileV15** (`foundingRegime`).
~45 mechanical boundary-guard/projection/migrator edits per bump; the five
hand-enumerated `migrateToVn` downgrade refusals get a parameterized
every-migrator × every-higher-version test.

### 8.1 V14 row schemas (OPUS-TESTS codes from this)

```ts
type StudioSet = {
  id: string                     // 'set-' + monotonic nextSetId (never rolled back)
  name: string
  blueprintId: string            // SET_BLUEPRINTS entry (catalog carries attractiveness
                                 // as DATA — a blueprint field, never persisted state)
  mountedOn: string              // facilityId of its stage (interior-only in V1)
  setType: SetTypeId             // from its blueprint; what a BlueprintBeat's
                                 // requiredSetType resolves against (§3.5)
  status: 'under-construction' | 'standing' | 'retired'
  completesWeek: number | null
  quality: number                // 0..100, SHOWN
  novelty: number                // 0..1, SET_NOVELTY_INITIAL at completion, SHOWN
  condition: number              // 0..100, wears per production, SHOWN
  genreWeights: Readonly<Record<Genre, number>>   // Genre per types.ts:9 — six members
  priorityGenre: Genre
}

type WorkflowBindings = {        // WIDENS the persisted ProductionWorkflow leaf (see §8.2 note)
  requiresSetBinding: boolean    // true iff greenlit in managed mode at V14+
  stageFacilityId: string | null // from the live soundstage reservation when held
  setId: string | null           // bound atomically with the stage at rehearsal entry
  lockedNovelty: number | null   // snapshot at bind; null for migrated in-flight
  lockedUplift: number | null
  heldSinceWeek: number | null   // stamped at acquisition; preserved across retention
}

type SetUnavailableBlocker =     // the ONE new persisted ProductionBlocker arm
  { kind: 'set-unavailable'; targetPhase: ProductionPhase }
  // carries NO capability; validated by its own exact-key list; the
  // save.ts:2486-2489 capability∈REQUIRED_CAPABILITIES cross-check is scoped to
  // the 'facility-capacity' arm. occupiedBy/remedies/alsoMissing are DERIVED
  // studioQueueView fields and NEVER persisted.

type CommissionOriginalScreenplayPayload =   // NEW action payload (§3.5) — NO conceptId:
  { writerId: string; genre: Genre; shape: FilmShape; promise: Promise }  // mint at COMMIT

type ProductionQueueEntry =      // discriminants match the real Action arms
  | { kind: 'commissionScript';       ordinal: number; queuedWeek: number; payload: CommissionScriptPayload }
  | { kind: 'commissionOriginalScreenplay'; ordinal: number; queuedWeek: number; payload: CommissionOriginalScreenplayPayload }
  | { kind: 'startCastingSession';    ordinal: number; queuedWeek: number; payload: StartCastingSessionPayload }
  | { kind: 'greenlightScriptProject'; ordinal: number; queuedWeek: number; scriptProjectId: string; payload: GreenlightScriptProjectPayload }
  // (types at src/core/types.ts:641/:724/:650; the legacy bare 'greenlight' arm
  //  is out of scope — §3.1's managed-mode scoping. Full payloads persisted;
  //  revalidated at dequeue; nothing held while queued; no production id exists
  //  before greenlight.)

type SetTypeId = string        // the CLOSED authored location vocabulary SET_TYPES (§9),
                               // authored at M2 (sets) because M3's beats consume it —
                               // the lane-14 interface dependency, joined here
type BlueprintBeat = { name: string; requiredSetType: SetTypeId }  // 7 per blueprint (§3.5)

type MovieBlueprint = {
  conceptId: string              // 'concept-orig-NNNN' (generated) or 'c-NN' (pool, on first commission)
  ordinal: number | null         // mint ordinal for generated; null for pool
  mintedWeek: number
  projectId: string              // the commissioning ScriptProject (script-NNNN)
  writerId: string               // writer attribution
  generatedTitle: string | null  // immutable; null for pool concepts
  renamedWeek: number | null
  beats: readonly BlueprintBeat[]
  officeTierAtMint: string       // the ceiling lever record (§3.5)
}

type StudioEvent =
  | { seq: number; week: number; kind: 'wrapped';               productionId: string; stageFacilityId: string; setId: string | null } // Tier D
  | { seq: number; week: number; kind: 'premiere';              filmId: string }                                                      // Tier D
  | { seq: number; week: number; kind: 'constructionCompleted'; placementId: string }                                                 // Tier D
  | { seq: number; week: number; kind: 'setBuilt';              setId: string }                                                       // Tier D
  | { seq: number; week: number; kind: 'setRetired';            setId: string; refund: number }                                       // Tier D
  | { seq: number; week: number; kind: 'reservationGranted';    ownerId: string; resourceKey: string }                                // Tier W
  | { seq: number; week: number; kind: 'reservationReleased';   ownerId: string; resourceKey: string }                                // Tier W
  | { seq: number; week: number; kind: 'phaseEntered';          productionId: string; phase: ProductionPhase }                        // Tier W
  | { seq: number; week: number; kind: 'sceneryArrived';        productionId: string }                                                // Tier W
  | { seq: number; week: number; kind: 'queueAdmitted';         entryKind: string; ordinal: number }                                  // Tier W
  | { seq: number; week: number; kind: 'queueIntentExpired';    entryKind: string; ordinal: number; reason: string }                  // Tier W — never a production id

type StudioEventLog = { nextSeq: number; rows: readonly StudioEvent[] }

// V14 state additions:
//   sets: readonly StudioSet[]; nextSetId: number
//   productionQueue: readonly ProductionQueueEntry[]
//   originalScreenplays: { nextOrdinal: number; blueprints: readonly MovieBlueprint[] }
//   studioEvents: StudioEventLog
//   operations.workflows[*].bindings: WorkflowBindings          (leaf widening — §8.2 note)
//   ProductionBlocker gains the SetUnavailableBlocker arm       (leaf widening — §8.2 note)
//   ScriptProject gains writerIds: readonly string[] (≤5, 00E.9 pooling) beside
//   the frozen writerId (kept for compatibility; leaf widening — §8.2 note),
//   and draft dueWeek varies by SCRIPT_DRAFT_WEEKS_* (min 1)
// Generated FilmConcepts APPEND to the existing state.concepts (world-shaped fields
// only; the frozen 8-field FilmConcept shape is never widened).
```

Bounded ranges asserted by G3; the validator gets literal key lists per root
(the `v12ExactKeys` idiom).

### 8.2 Architecture guardrails (Owner-accepted — `00B`/`00C`.10, binding)

The guardrails bind every C2 schema and engine decision; the specific bindings
are stated where they land: the Flip's bare lot is a NEW constant beside an
untouched `INITIAL_PROPERTY` (§7.3); production-id format is permanent — ordering
authority is the ordinal (§3.3); every new root carrying production ids joins
`persistedProductionIds` both directions (§8.3); **no frozen save leaf is
widened** (`EraConfig`, `Standing`, `CulturalForce`, `SegmentId`, `FilmConcept` —
lane 14's mechanical check: the empty optional-key list at `save.ts:1379-1395`).
**Stated honestly (r3, widened r3.2): V14 adds four new roots PLUS three widened
persisted leaves** — `ProductionWorkflow.bindings`, the `ProductionBlocker`
`set-unavailable` arm, and `ScriptProject.writerIds` (`00E`.9 pooling) — none of
which is a frozen leaf; §8.3 carries their version-aware boundary rule. The cash `state.ledger` is never windowed (§5.3);
`market.tick` stays the authoritative week with no persisted intra-week position
(§4.1); `state.talent` stays an append-only census (untouched by C2); no
studio-relative fact is written onto shared-world entities (set demand and
required-set lists are derived read models; blueprint provenance lives in the
blueprint root, never on FilmConcept); set/stage/queue occupancy extends the ONE
existing representation (§3.2); **RNG discipline (`00C`.10.G):** new systems
never consume the persisted sim stream because it is available — purpose-keyed
derived streams only (`screenplay-v1` per `presence-v1`; the RngPurpose union
widens additively). **Long-campaign performance awareness (`00C`.11):** no new
whole-history scans (the eleven O(n) concept lookups are recorded, not optimized;
`correlateConceptCost` is contractually never re-run); no unbounded per-frame
work; deterministic engine processing stays separate from frame rate; history is
never deleted for speed. The 1920→2040+ timeline law is G15's subject.
**Rival-studio functionality is explicitly NOT added by C2** (§19).

### 8.3 Migration rules

Copy the **V12** three-legged historical-boundary guard (C2's roots leak
identities); new ledger kinds (`setCapex`/`setMaintenance`/`setDemolitionRefund`)
get boundary legs; `persistedProductionIds` walks `studioEvents` Tier D and —
as defense-in-depth only, since queue rows carry no production id by
construction (§5.3) —
`productionQueue`, both directions. **The widened-leaf boundary rule (r3):** the
workflow exact-key list (`save.ts:2287-2292`) and the blocker validator become
version-aware — pre-V14 boundaries still REFUSE `bindings` and the
`set-unavailable` arm; V14 requires them ("the historical boundary is real
rather than nominal," `save.ts:831`). §12-M1's PF1-independence claim is scoped
accordingly: no PF1-contended UI file is touched in M1; two UI test fixtures
that literal-construct workflows are mechanically widened.

Derivations are facts, not guesses: `bindings.stageFacilityId` := the workflow's
live `soundstage` reservation when present (**rehearsal AND shooting** — a
rehearsal-phase save has no shootingTask), else null; `lockedNovelty`/
`lockedUplift` := null; `heldSinceWeek` := the migration week (a recorded
migration fact); `requiresSetBinding` := false for every migrated workflow (the
grandfather: in-flight productions keep `facility-scenery-shop` byte-for-byte
and never acquire a set); `state.sets` := the two endowed house sets for
managed-mode saves, empty for legacy; **`nextSetId` := 2 for managed-mode saves
(the two synthesised house sets consume ordinals 0 and 1), 0 for legacy — never
rolled back (monotonicity asserted in G4/T9)**; `originalScreenplays` := empty
(`nextOrdinal: 0`); queue := empty; zero RNG; `rngState` byte-identical. **T9
covers EVERY phase that holds a reservation** (development through post ×
blocker kinds), migrated then played byte-identically vs its V13 twin ≥30 weeks.
A migrated managed save reaches a NEW greenlight (M2 gate). The session key is
not bumped.

---

## 9. Economy — measure, don't fix

C2 raises throughput while the D-17B residuals (cash runaway, top-studio
immortality) are open and C6 owns closure. Stance: **instrument five things, fix
none** — with two bounded interim guards the master plan §7 permits, and **one
ratified exception**: the set quality/fit uplift and novelty terms (§3.1), which
are C2's owner-law-3 teeth, bounded by G3 and isolated by their own snapshot
figure so C6 inherits a measured lever, not a confound.

- **Guards:** G-A every economy artifact reports runaway/distress rates with the
  threshold printed beside them; G-B the **weeklyBurn truth repair** — facilityOpex
  is 16.1% of weekly outflow on a built-out C1 lot and invisible to
  `weeklyBurn`/runway, **overstating runway by ~19%** ($111,983 true vs $93,983
  shown); the C2 snapshot regenerates both figures. NOT permitted: sinks sized to
  suppress the tail; financing/loans/bailouts; touching RUNAWAY_MULTIPLE or the
  publicity/box-office scales (the novelty factor is the §3.1 ratified exception,
  measured separately).
- **The C6 handoff, with its own caveat:** the 12–30× derivation (stage/set opex
  cannot absorb a doubled ceiling at any defensible price) is handed over
  **together with lane 10's counterweight** — the measured arms lost $132k/week
  all-in while the controlled picture earned +$1.43M; no single defensible
  net-per-film number exists until figure 12 produces one.
- **Remeasurement protocol:** E0 (re-pin the C1 script unchanged; verify sealed
  main contains the accepted D-17B engine state — unverified to date) → E1
  post-catalog → E2 post-throughput → E3 post-Flip → E4 seal; runs R1–R5;
  artifact `docs/economy/C2-ECONOMY-SNAPSHOT.md` via `measure-c2-economy.mts`
  EXTENDING the C1 script; the **19** named figures (18 + the set-lever A/B).
- **Queue idle:** status quo — full payroll accrues while queued — measured, not
  redesigned (RULED, §18 item 7-ii), **with the release-law nuance (`00E`.16):**
  the freight is the resources/contracts GENUINELY still committed during the
  wait (payroll, locked talent); a production is never charged for a physical
  resource it has released (our model already complies — there are no
  production-level stage/set fees, only facility opex); balance measures, the
  initial numbers are not sacred.
- **TUNING inventory** (names + intent; values are implementation's):
  `STAGE_STANDARD_{CAPEX,BUILD_WEEKS,WEEKLY_OPERATING_COST,SIMULTANEOUS_PRODUCTIONS,FOOTPRINT,CLEARANCE}`,
  `STAGE_BLUEPRINTS`; `SET_<id>_CAPEX`, `SET_BUILD_WEEKS_BAND_*`,
  `SET_WEEKLY_MAINTENANCE_COST` (labelled an invention),
  `SET_CONDITION_WEAR_PER_PRODUCTION`, `SET_CONDITION_UNUSABLE_THRESHOLD`,
  `SET_REPAIR_{COST,WEEKS}`, `SET_STRIKE_WEEKS` (named zero),
  `SET_NOVELTY_{INITIAL,DEPLETION_PER_RELEASE}`,
  `SET_NOVELTY_RECEPTION_FACTOR_MIN`, `SET_QUALITY_UPLIFT_MAX`,
  `SET_GENRE_FIT_UPLIFT_MAX`, `SET_GENRE_WEIGHT_*`, `SET_BLUEPRINTS`,
  **`SET_TYPES`** (the closed location vocabulary, authored at M2 — §3.5's beats
  resolve against it);
  `SCENERY_LOAD_IN_WEEKS_BASE`, `SCENERY_LOAD_IN_WEEKS_PER_DISTANCE`,
  `SCENERY_LOAD_IN_COST` (named zero); `FOUNDING_DEVELOPMENT_CASTING_CAPACITY`,
  `FOUNDING_POST_CAPACITY`, `FOUNDING_SCENERY_CAPACITY`,
  `FOUNDING_SOUNDSTAGE_CAPACITY` (the §3.4 hoist); `AGENT_MAX_SLATE`;
  `STUDIO_EVENT_WINDOW_WEEKS`; `SCREENPLAY_BLUEPRINT_*` (the strength-draw
  bounds, beat tables), `SCREENPLAY_TITLE_*` (genre lead-word subsets);
  `PREMIERE_NIGHT_COST` (named zero); C2b: `FLIP_INITIAL_CASH`, baseline
  blueprint constants. Named zeros follow `FACILITY_MOVE_COST = 0`.
  **Presentation-only constants** (`PREMIERE_CROWD_PER_GROSS`,
  `PREMIERE_CROWD_CAP`, `PLAYBACK_SPEED_LADDER`) live in a UI-side
  named-constant module — TUNING is engine law.
- Set `attractiveness` is a `SET_BLUEPRINTS` catalog field (data, wired to
  NOTHING — C3's prestige lane; never persisted state).

---

## 10. Fix-in-passing: the inherited seams

| Seam | Ruling | Acceptance |
|---|---|---|
| **F2** — capacity-0 effect buildings unengageable | Effect buildings become HOLDERS (uplift binds at commission; engaged until draft completes) | Mid-consumption demolition refuses with a named reason; churn price re-derived in the snapshot |
| **F3** — requirements bind at quote time only | Prerequisites become holders (or re-check at completion) | Named refusal; the red team re-derives the recorded "+$330,000" (lane 12: $300k refund + $30k unexplained — composition stated, not assumed) |
| **F4** — commission verb demands the whole board idle | The world commission predicate becomes a function of FREE SLOTS (`availableDevelopmentCastingSlots`, `scriptDevelopment.ts:158`) — the queue's own truth | **Owned by M4** (r3); continuous e2e on the 5179 origin in the M4 gate |
| **`canGreenlightMore` cap gate** (r3) | Derived from live capacity/queue admission (§3.3) | Dashboard's cap sentence in G12's falsified list |
| **releaseTick off-by-one** | One week authority (§6) | The three-hop command output at M6 HEAD is the gate |
| **DSF2 / 480×270 below-fold** | **An explicit Owner-signed narrowing of operational law 26** (§11.7): the 480×270/DSF2 leg narrows to DOM/workspace reachability; world-canvas visibility out of support; the three 480×270 e2e specs KEPT for the DOM surfaces they prove | The narrowing is signed; the third silent carry ends |
| **Assembly break-even literal 2** | Derived from live capacity (the two-value law retires with the cap) | G12 extended to pre-existing falsified sentences |
| **R-1 reservation migration** | Sticky reservations (§3.2) | The Annex contract clause holds; nobody teleports |
| **Stale docs** | M0 repairs the laws-doc trailer, law 19's drifted pointers (or rules symbol-name resolution), the travel-greenfield note, the TYCOON-log queue-note cross-reference, **and annotates the master plan's Theater row (`THE-MOVIES-PARITY-MASTER-PLAN.md:225`) with the `00C`.7 ruling — its "final call pending" clause is closed with a citation to charter §6** (r3.1); **M3 records the writer-experience contradiction and the 30-film ceiling** (both previously undocumented) | Doc-only commits, diff-verified |

---

## 11. Governance: explicit supersessions (the Owner's signature covers this section at GO)

1. `docs/FACILITIES-CONSTRUCTION-RESEARCH-CONTRACT.md:252` — **superseded** by
   owner law 1.
2. `docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:538` — **CLOSED by C2** (an
   open list, not a prohibition); its :500 no-migration clause *honored* via
   sticky reservations.
3. **The autoplay/pause/speed/second-clock refusals — enumerated, each verified
   at its line, superseded by the Owner's living-time ruling:**
   `WORLD-FIRST-LIVE-WEEK-ADVANCE-V1-CONTRACT.md:309`;
   `WORLD-FIRST-LOT-NATIVE-NEXT-EVENT-CADENCE-REACTION-V1-CONTRACT.md:100`,
   `:1024`, **and its CLOSURE.md:80** (r3);
   `WORLD-FIRST-ANNEX-CONSTRUCTION-INTERACTION-V1-CONTRACT.md:540` +
   CLOSURE.md:149; `WORLD-FIRST-STUDIO-HOME-V1-CONTRACT.md:606`;
   `WORLD-FIRST-GREENLIGHT-PRODUCTION-FORMATION-FRESH-LOT-RETURN-V1-CONTRACT.md:597`
   + CLOSURE.md:118;
   `WORLD-FIRST-LOT-RETAINED-PACKAGE-GREENLIGHT-WORKSPACE-V1-CONTRACT.md:509`;
   `WORLD-FIRST-LOT-RETAINED-AUDITION-PLANNING-WORKSPACE-V1-CONTRACT.md:501`;
   `WORLD-FIRST-LOT-RETAINED-SCREENPLAY-COMMISSION-WORKSPACE-V1-CONTRACT.md:409`;
   `docs/HANDOFF.md:450`. Historical log restatements noted, not superseded
   (`MARATHON-LOG.md:441,468` refuse autoplay; `PROGRESS.md:144`,
   `CURRENT-BEST.md:149`, `NEXT-HIGHEST-LEVERAGE.md:41` refuse only "a second
   clock" — r3 wording).
4. `TYCOON-WORLD-CONVERSION-LOG.md:407` (latent-queues Owner decision) —
   **superseded** by owner law 2.
5. The company-presence world-scope exclusion, quoted in full
   (`…PRESENCE-PICTURE-SWITCHING-V1-CONTRACT.md:385`: "a company office,
   callboard building, stage, set, holding area, rehearsal room, Post room, or
   new physical production place" — V1-scoped): C2 TAKES the Call Board placard,
   buildable stages, mounted sets — **superseded for those members**; the holding
   area / queue Option C stays refused.
6. `docs/WORLD-FIRST-SCENERY-LOAD-IN-V1-CONTRACT.md:621-634` (excludes travel
   time, ETA, queue, set ownership/wear/quality, new scenery facilities/clocks,
   production-time effects, a generalized queue framework) — **superseded**; the
   V1 Keep gate is re-proven as its fixtures move (§4.2).
   `docs/PRODUCTION-OPERATIONS-V1-CONTRACT.md:137-146` (defers manual
   scheduling/priority, facility purchase/opex, differentiated sets/rehearsals) —
   **C2 picks this deferred list up**; recorded.
7. **Operational law 26, narrowed** (`docs/SHIFT-OPERATIONAL-LAWS.md:81-82` —
   "Verify 960×540, 1280×720, 480×270/DSF2…"): the 480×270/DSF2 leg narrows per
   §10's DSF2 row. Owner-signed.
8. **Sealed tests whose SUBJECT owner law 1 deletes — retired WITH their named
   successors (r3):**
   - `tests/tuning.test.ts:54` (cap in `expectedScalars`) → successor: the
     scalars assertion proves `MAX_CONCURRENT_PRODUCTIONS` ABSENT and
     `AGENT_MAX_SLATE: 2` present.
   - `tests/actions.test.ts:448-485` (greenlight-throws-at-cap) → successor: the
     Nth greenlight ADMITS and queues on dev-slot exhaustion, with the queue row
     asserted.
   - `tests/agents.test.ts:157-218` (agents stop at the cap) → successor: both
     agents return [] at `AGENT_MAX_SLATE`, same fixture.
   - `tests/operations.test.ts:433-541` (one-week deferral by id order) →
     successor: capacity freed mid-week is granted the SAME week,
     longest-waiting-first with ordinal tie-break, asserted against a genuine tie.
   **Plus a re-based-not-retired category** (r3, widened r3.1):
   `tests/d12-p2-calibration.test.ts:159`, `tests/tick.test.ts:282,:327`, and
   **`tests/agents.test.ts:145`** (a live precondition inside the SURVIVING
   shared-candidate-grid describe at :135-156 — outside the :157-218 retirement)
   consume the constant in live guards — re-based onto a test-local slate bound
   (or `AGENT_MAX_SLATE`) with assertions unchanged; the two read-model pinning
   tests (`ui/src/lot/LotCastingReviewPanel.test.tsx:159`,
   `ui/src/lot/snapshot/castingReview.test.ts:439`) and
   **`ui/src/screens/d12-owner-ux.test.tsx:369-374`** (pins the FoundingScreen
   "two productions" prose) re-base with named successors — the founding copy's
   successor teaches capacity-derived throughput, not a fixed number. Nothing
   else is exempt; `rev4-open-questions.md:297/:663` (the source
   `tests/tuning.test.ts` cites) is ruled together with this item — annotated
   historical, superseded by owner law 1.
9. **The five remaining ceiling-as-law documents (r3):**
   `docs/D-16-ENGINE-ECONOMY-SOURCE-MATRIX.md:43`,
   `docs/FACILITIES-CONSTRUCTION-RESEARCH-EVIDENCE.md:58`,
   `docs/WORLD-FIRST-SOUNDSTAGE-12-WORLD-PRESENCE-V1-CONTRACT.md:121`,
   `docs/HANDOFF.md:1475`, `docs/rev4-open-questions.md:297,:663` — each marked
   superseded-by-owner-law-1 (as statements of the transitional cap) or
   honored-as-historical (corpus-description contexts). With items 1/2/6 this
   completes lane 2 §1.6's list of eight.
10. The D-16 harness suite (10 test files outside the sealed 241) — ruled INTO
    the C2 regression floor with a re-baselined count and named reason.
11. **Opex precedent:** Placement Core V12's positive facility opex RATIFIED as
    superseding the older $0-opex clauses; C2 prices stage/set opex on it.

---

## 12. Milestones

### C2a — SETS, STAGES, SCREENPLAYS & THE LIVING STUDIO (SaveFileV14)

- **M0 — Baseline, hygiene, and the union.** Floors reproduced at HEAD (241/3,318
  vitest; 211/207/4/0 Playwright; both tsc); E0 economy re-pin + D-17B-on-main
  verification; doc repairs (§10); capacity hoists to TUNING; the
  phase→capability duplicate tables single-sourced with an agreement test (a
  scaffold pinning the V13 table — M2 replaces it with the bindings-aware form);
  `occupiedResourceSlots(state)` per the §3.2 list + kind-qualified keys + sticky
  retention. **Gate: behaviour-identical on every legal state (replay + save
  byte-identity on the sealed fixture corpus); the cross-owner refusal proven
  non-vacuous on a forged fixture; every §3.2-listed traversal gone.**
- **M1 — The event ledger + complete V14 + engine wrap.** The FULL §8.1 schema,
  validator, and the COMPLETE migrator (incl. endowed house-set synthesis and the
  `activateStudioOperations` mint) + T-suites (T9 across all held phases);
  save-size measurement; `studioEvents` phases 0–2; the Tier-D `wrapped` engine
  event. **Gate: M0A corpus byte-identity (ledger + roots empty on legacy);
  dual-run equality vs all 17 detectors; the presentation-parity assertion
  (charter-owned; also PF1 §2's obligation when PF1 shipped). PF1-independence:
  no PF1-contended UI file touched; two UI test fixtures mechanically widened
  (§8.3).**
- **M2 — Buildable capacity + Sets.** **First task: the placement sweep** (§3.4)
  — publish the arithmetic; exercise or drop the pre-authorized north-back-lot
  spur. The §3.4 blueprint slate; set construction/repair/strike via any
  set-scenery facility; the wired stat block; `requiresSetBinding` at greenlight;
  atomic stage+set acquisition at rehearsal entry; set demand + package/
  greenlight surfaces (OPUS-SCREENS); display-name ruling; dynamic N-stage world
  identity (the closed adapter maps/vocabularies become derived — the UI throws
  on a third stage today — incl. `JOURNEY_STAGE_BUILDING_IDS`); grid stage bodies
  + the plate honest-fallback test (§3.1). **Gate: bounded-term tests per TUNING
  family; an N-stage studio (N per the sweep) renders and plays without a throw
  on the grid origin + the plate fallback test green; FMJ specs pass unmodified;
  a migrated managed V13 save reaches a NEW greenlight; LEGIBILITY — the
  package/greenlight surface names the bound set and shows
  quality/novelty/condition/fit with the projected uplift.**
- **M3 — Renewable Screenplay Generation V1 (§3.5).** Commission-original action;
  concept append + blueprint mint; title generation + rename; the six beat
  templates (three labelled authored-not-recovered); pool-concept blueprint
  derivation; provenance surfaces; the `no-concepts` blocker's remedy re-pointed;
  the two contract traps closed (correlateConceptCost prohibition + regression;
  the agent-stream guard test); the corpus question row added; the
  writer-experience divergence and 30-film ceiling recorded in docs. **Gate:
  determinism — same seed + action script → byte-identical blueprints and titles;
  rename changes zero identities and all 21 live surfaces (2 frozen-history
  surfaces asserted frozen); append-only proofs; G15 era-clean titles; M0A corpus
  byte-identity; LEGIBILITY — the board shows "An Original Screenplay by
  ‹writer›" and the generated title before and after rename.**
- **M4 — Throughput.** Delete `MAX_CONCURRENT_PRODUCTIONS` (§11.8 retirements +
  successors + re-bases; §3.3 consumer dispositions incl. `canGreenlightMore` and
  F4); Phase-Gate Admission at the three front doors (payload intents, dequeue
  revalidation, the inserted tick step); queue state + aging + ordinal;
  acquisition ranks + acyclic invariant; the fixed-point sweep; the persisted
  `set-unavailable` arm + derived `studioQueueView` with `Remedy`; the queue
  panel (OPUS-SCREENS — the world-native Call Board is M5's floor, r3.1, so
  OPUS-WORLD is not staffed out-of-milestone). **Gate: G10.1 (slots no longer inert on ≥4 of 5
  seeds); N-way contention property test (acyclic wait-graph, bounded wait, rank
  monotonicity); determinism under contention; F4 e2e on 5179; E2 economy gate;
  G16 — all four law-2 facts rendered non-empty for every waiter, remedies
  actionable.**
- **M5 — The Living Studio.** Release-week playback hole closed (both
  conditions); `simStopFor` extracted (OPUS-ENGINE-CORE, before OPUS-TIME); the
  `wrap` stop member + its three named surfaces + `never`-guards + tier/cue
  coordination; the Living Turn V1 scheduler (pause / 1×-2×-4× / partitioned
  auto-pause / fast-forward); `studioWeekTheater` projection + N-facility
  generalisation; queue physicality (Call Board floor → Backed-Up Lot committed
  target); grounded ambient actors; load-in duration from layout (+ Scenery
  Load-In V1 re-proof). **Gate: the hands-off proof — a seeded save with two
  pictures in flight runs ≥12 consecutive unpaused weeks with zero input, state
  advances exactly those weeks, the queue visibly drains, auto-pause on the
  first PAUSE-class stop (run length asserted); four-way time-parity
  byte-identity; theater on/off byte-parity, enabled arm non-vacuous;
  LEGIBILITY — the played week renders the named theater subjects for a
  contended studio; re-pins per the five-rule discipline.**
- **M6 — Premiere Night V1.** Week-authority fix (the three-hop command is the
  gate; all §6-named surfaces in scope); **release-anchor regime-awareness**
  (`adapter.ts:5550-5551`, `nextEvent.ts:49/:649/:780` — §6, r3.1: the
  theater-less gate's own prerequisite lands here, not C2b); the Gate send-off
  staging (marquee port as endowed-lot flavor; Option B floor per §18 item 8);
  PAUSE-class integration; multi-release arbitration. **Gate: premiere e2e on 5179 on BOTH
  an endowed lot and a theater-less fixture; no double-announce;
  zero-engine-delta test; release never swallowed; LEGIBILITY — the Gate
  hoarding carries the title and the participants depart.**
- **M7 — Economy remeasure + polish.** C2-ECONOMY-SNAPSHOT (19 figures,
  E-gates); weeklyBurn truth repair (OPUS-ENGINE-CORE); remaining §10 seams
  (Assembly literal-2 — OPUS-SCREENS; F2/F3 if not landed with M2); DSF2
  narrowing recorded; **event-migration phases 3–4 land here and at M8** (the 17
  diff-detectors flip to log projections preserving exported signatures, then
  retire after the full green seal cycle — §5.6's tail, r3.1). **Gate: snapshot
  reproduces byte-identically twice; C1 sections still reproduce; G15 scan
  green; detector-flip dual-run equality green.**
- **M8 — SEAL → STOP FOR OWNER REVIEW.** PM playtest (§16a); independent red
  team (§15) with a HELD LIST in the C1-M8 format; bounded fix wave
  (sole-writer, ruled findings only); KEEP/KILL per milestone; gates regenerated
  at the named seal HEAD.

### C2b — THE FOUNDING FLIP (SaveFileV15)

- **M1 — Regimes + invariant surgery.** `foundingRegime`; the three bare-lot
  arms; `BARE_LOT_INITIAL_PROPERTY` (INITIAL_PROPERTY untouched); V15 migration
  ('endowed' unconditionally); `preFlipFoundedStudio(seed)` frozen. **Gate:
  every V14 suite green under both regimes; a bare-lot save validates and
  loads.**
- **M2 — The bare lot.** Post-Flip parcel map authored (stages fit; laws
  25/27a); vacated-ground rules; parcel projection reservation-aware. **Gate:
  placement property tests on the new map; re-pins with named reasons.**
- **M3 — The journey upstream + UI sweep.** Construction stages (`build` target
  kind); `JOURNEY_SITE_BUILDING` honest lookup; the type-aware BuildingId
  re-count + sweep; blueprint `requires` audit + maxInstances counts structures;
  release anchors regime-aware (§6). **Gate: both sealed e2e journeys unmodified
  against a migrated save; the closed UI validator widened additively.**
- **M4 — The opening act.** Overlap design tuned with the all-in E3 measurement;
  Flip golden path e2e (bare lot → **write** → build core → FIRST FILM
  GREENLIT → wrap); D-16 fixture pinned + corpus re-based with a recorded
  ruling. **Gate: the Flip is winnable and measured; pre-Flip regression
  permanent.**
- **M5 — SEAL → STOP.** Owner plays the Flip (§16b); red team; fix wave;
  KEEP/KILL.

---

## 13. Opus dispatch plan (single production writer per surface; the PM grades)

| Role | Milestones | Owns |
|---|---|---|
| OPUS-ENGINE-CORE | C2a M0–M2, M4–M7 | `src/core` union/keys/TUNING hoists; `studioEvents`; the wrap event; V14 in `save.ts`; `src/core/economyView.ts` (M4 `concurrency:2` retirement; M7 weeklyBurn truth repair); **`ui/src/engine/adapter.ts`** (M2 vocabulary derivation; **M4 `canGreenlightMore` derivation + the `:2179` passthrough** — OPUS-SCREENS specifies the Dashboard copy, ENGINE-CORE lands the adapter edits; M5 `wrap` member + `simStopFor` extraction) and **`ui/src/lot/snapshot/nextEvent.ts`** (M5 stop-ladder surfaces; M6 release-anchor regime-awareness) |
| OPUS-ENGINE-CAPACITY | C2a M2, M4 | Blueprints, `state.sets`, queue/admission/rank/sweep, sticky reservations; sole `src/core/operations.ts` writer during M2/M4 |
| OPUS-SCREENPLAY | C2a M3 | `src/core/scriptDevelopment.ts` (sole writer during M3), the new screenplay module + word-list additions, the mint/rename actions, blueprint derivation, `ui/src/lot/snapshot/scriptCommission.ts` exact-key update |
| OPUS-TESTS | all | Contract-first suites from THIS charter (§8.1 is the schema source), in `tests/contracts/` + `ui/src/test/contracts/` |
| OPUS-WORLD | C2a M2, M5, **M6 (writer token holder for `TycoonScene.ts` during the marquee port — OPUS-PREMIERE specifies, OPUS-WORLD lands canvas-side work)** | Stage/set bakes, plate fallback, theater projection wiring, queue physicality; sole writer of `TycoonScene.ts`/`world.ts`/`assets.ts` |
| OPUS-SCREENS | C2a M2–M7 | `Dashboard.tsx`, `StudioCalendar.tsx`, `Assembly.tsx` (M7 literal-2 line), `LotPackageWorkspace.tsx`, `WritersRoom.tsx` (M3 DOM commission/rename parity with the Lot surfaces), and the set/stage/queue/screenplay surfaces inside `StudioLotScreen.tsx` (one-writer serialization with OPUS-TIME per milestone) |
| OPUS-TIME | C2a M5 | The Living Turn scheduler module; call-sites-only in `App.tsx`/`StudioLotScreen.tsx`; consumes `simStopFor`, never extracts it |
| OPUS-PREMIERE | C2a M6 | Send-off staging spec + week-authority sweep + DOM-side premiere surfaces |
| OPUS-ECONOMY | C2a M0/M4/M7 | `measure-c2-economy.mts`, the command-generated audit, snapshot |
| OPUS-FLIP-ENGINE | C2b M1, M4 | Regimes, invariant arms, V15 |
| OPUS-FLIP-WORLD | C2b M2–M3 | Parcel map, journey/UI sweep |
| OPUS-REDTEAM | M8 / C2b-M5 | Independent; findings only; HELD LIST mandatory |
| OPUS-FIX | M8 / C2b-M5 | Sole writer during fix waves; ruled findings only |

**The two development laws (`00E`.19/.20, binding on every lane):**
**SOURCE-FIRST DESIGN** — before modifying an original-game-derived mechanic,
consult the reconstructed evidence (primary:
`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md`; supporting:
`THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md`); newer explicit Owner rulings
govern intentional successor changes; mechanics we reconstructed are never
casually reinvented. **RESEARCH FIRST, REUSE FIRST, INVENT LAST** — inspect
existing Project: Studio code, then recovered schemas/patterns, then mature
license-compatible implementations; adapt proven work when it cleanly fits;
write bespoke when reuse would harm determinism, architecture, security,
licensing, maintainability, or fit. *Reuse before reinventing, not reuse at all
costs* — bounded investigations, never open-ended archaeology; for any
substantial new subsystem the implementation notes state what was inspected
before from-scratch was chosen.

Rules carried from PF1 (appendix): no force-push; `App.tsx` and
`StudioLotScreen.tsx` are the PF1-vendored one-writer surfaces, and
**`adapter.ts` joins them as this charter's own addition** (r3.1 — not
attributed to PF1); serialized per milestone; every gate figure
regenerated from a command at a named HEAD; the PM reruns decisive gates at each
KEEP/KILL. **PF1 sequencing (r3, stated exactly):** M0–M1 are fully
PF1-independent; the `src/core` halves of M2–M4 are independent, **their gates
are not** — the UI halves of M2/M3/M4 and all of M5/M6 UI work start only after
PF1 seals.

---

## 14. Test gates (the G-list; full specs in lane 12)

G1 reservation lifecycle (fail-closed cross-owner overbooking; release proven on
EVERY termination path; union exhaustiveness as a test). G2 queue determinism
(the tie-break pinned against a genuine tie). G3 bounded-term tests for every
new TUNING constant AND every §8.1 range. G4 the §8.3 migration matrix incl.
every-held-phase T9. G5 Flip golden path + permanent pre-Flip fixture +
migrated-save journeys. G6 phase-table agreement (M0 scaffold → M2
bindings-aware). G7 Premiere (zero-engine-delta; theater-less fixture). G8
theater/time byte-parity (on/off; four-way pacing; enabled arm non-vacuous;
`rngState` pinned; Math.random hygiene extended to `ui/e2e/`). G9 structural
re-pins per the five-rule discipline. G10 ceiling-removal proof (G10.1). G11
economy snapshot reproducibility. G12 quote-grammar, extended to THREE pre-existing
sentences the cap deletion falsifies (Dashboard cap copy; Assembly second-film
line; **the FoundingScreen "up to two productions" prose,
`FoundingScreen.tsx:145-156`, whose pinning test re-bases per §11.8** — r3.1).
G13 D-16 suite in the floor. G14 flake watch. G15 era-cleanliness (TUNING
families, blueprints, requirement date arms, titles, player copy — no hard-coded
years). G16 queue legibility (four law-2 facts, non-empty, rendered). **G17 RSG
integrity (r3): blueprint/title determinism; rename identity-stability with the
two frozen-history surfaces asserted; append-only concepts; the
`persistedConceptIds` reservation invariant; the correlateConceptCost
never-re-run regression; the agent-stream guard.** Standing
law: no test deleted or weakened except §11.8's enumerated retirements (each
with its named successor) and re-bases; FMJ specs unmodified; every figure names
its HEAD. §20 references the four milestone LEGIBILITY assertions (§12-M2/M3/
M5/M6) by that name.

---

## 15. Red-team targets (R-list; full set in lane 12 + r3 additions)

Reservation exploits (reserve-and-cancel churn — priced first: cancel already
forfeits the greenlight lump; demolish/strike-under-binding; the indefinite
player-controlled soundstage hold via never-scheduling the take; queue-jumping
via cancel/resubmit; intent-payload staleness abuse). Deadlock/starvation
(rank-order violations; **release-law conformance — no completed phase's
resource survives its wrap; re-acquisition fairness after release** (`00E`.5
replaced the old head-of-line target); aging starvation;
fixed-point sweep termination). Economy (queue-parking; premiere farming; F2/F3
churn prices re-derived; runaway acceleration measured, not hidden; **set-uplift
stacking/farming against the G3 bounds**). **Screenplays (r3):** title-stream
mining for outlier blueprints; rename abuse against frozen-history surfaces;
pool-vs-original arbitrage; mint-ordinal manipulation across save/load; the
`no-concepts` remedy path on a fully-exhausted pool. Flip (regime forgery;
migrated double-builds; requires-gates on absent structures; new-parcel
exploits). Determinism (contended ordering; living-turn pacing divergence;
cursor loss/replay; speed-ladder parity). Theater/truth divergence — any motion
not traceable to authoritative work is a campaign failure under laws 5/9, with
two named carve-outs (the premiere crowd as a declared Class-A projection of
opening gross; the participants attending an event) — both in-scope for the
sizing/determinism attack. Deliverable format: findings + the C1-M8-style HELD
LIST.

---

## 16. Owner playtest scripts

**(a) C2a seal (~30 min; at 2× a week plays in ~5.2s, so 40 in-game weeks of
living time cost ~3.5 minutes plus pauses and building):** found a fresh studio;
see the two house sets standing on Soundstages 7 and 12. **Commission an
ORIGINAL screenplay** — pick the genre, watch the writer and a Development slot
go busy, receive the generated title, **rename it**; see "An Original Screenplay
by ‹writer›" on the board. Commission a second (pool) picture and push both
toward greenlight; start a third — **watch it QUEUE with a readable reason
naming Development & Casting, its occupant, the free week, and the remedy row
naming the Hall** (the building C1's own measurement proved inert at the old cap
is now the first relief — G10.1's story made playable). Unpause and *stop
touching the controls* for the hands-off stretch: two pictures shoot on the two
stages, scenery travels, a wrap clears Soundstage 7, the queued picture takes
the freed capacity without your help; get auto-paused by a genuine decision; use
fast-forward once. As the slate grows, meet the **set/stage wall**: a picture
waits on a Set — build a third stage and a new set where the placement sweep
allows, and watch the queue drain into it. Reach a release: attend the **Premiere
send-off at the Gate** (title on the hoarding, the company departs, the crowd
gathers — and on this endowed lot, the Theater marquee lights as flavor); read
the Gazette. Open the queue panel once and relieve a named bottleneck by
building what the remedy names. PASS = the north-star sentence lived (`00E`.21):
"I built this movie studio, it operates while I watch, my writers create
pictures, and I can physically watch multiple films compete for real production
resources" — concretely: "my writers keep handing me new movies, I
watched my studio manufacture several at once, I always knew what was waiting
and why, and it ran without me pushing it." FAIL = a stalled queue with no
stated reason, motion I couldn't attribute, a title I couldn't change, or
reaching for Advance Week out of necessity.

**(b) C2b seal (~20 min):** start a NEW studio; arrive at Gate + Administration
and empty land; follow the journey's construction guidance; **commission an
original screenplay while the first buildings rise** (the overlap — writing is
the opening act); reach FIRST FILM GREENLIT → wrap → release on a lot you
built; attend the Gate send-off with no theater anywhere; load a pre-Flip save
and confirm it is exactly the studio it always was. PASS = "I started with
almost nothing. I built this studio."

---

## 17. PF1 interlock and robustness

Assumed baseline: PF1 as chartered (ui-only; no V14). Load-bearing PF1 clauses
are vendored in `docs/c2-planning/13-PF1-CHARTER-EXCERPTS-APPENDIX.md`
(@ `1e6b422`). Sequencing per §13 (r3 wording — the r2 blanket claim is
withdrawn): M0–M1 fully independent; `src/core` halves of M2–M4 independent;
their gates and all M5/M6 UI work PF1-sequenced. M6 degrades gracefully (no cue
grammar → silent but complete premiere). If PF1-M2's laws-doc correction was
KILLED (the appendix quotes the clause), C2a-M0 performs it. The M1 parity gate
binds regardless of PF1's fate.

---

## 18. Owner decisions — the GO sheet (ALL RULED at `00E`, 2026-08-18)

**Every Tier-1 item below is now RULED** — the sheet is a record of the rulings,
not open decisions. **The only thing that blocks implementation is the GO itself
(after the PF1 seal).** Citations "§18 item N" throughout the body resolve here.

1. **Concurrency targets and law-1 coverage** — RULED (`00E`.3):
   **1a** 3–4 concurrent productions is a **mature balance/throughput TARGET,
   NOT a maximum** — there is no ordinary global film cap; a player who
   legitimately builds, hires, and organizes enough capacity may exceed four.
   Binding law: *CAPACITY AND RESERVATIONS LIMIT THROUGHPUT; A GLOBAL MOVIE
   COUNTER DOES NOT* (`AGENT_MAX_SLATE` bounds harness agents' policy, never the
   player); **1b** dev/casting binding first at founding and the stage+set
   composite binding at maturity is **desirable emergent behavior**, ruled;
   **1c** `casting` stays MERGED in V1, one baseline blueprint — RULED
   (`00E`.14); **1d** crew/director/star capacity deferrals ACKNOWLEDGED —
   RULED.
2. **The C2a/C2b split, RSG inside C2a-M3** — RULED ACCEPTED (`00E`.1; never
   moved out for milestone size).
3. **Living Turn V1** (§4.1/08A) — RULED (`00E`.2): the pillar is
   **C2-authorized / IN PROGRESS**, not an open product decision; the
   enumerated refusal clauses (§11.3) are superseded as required.
4. **Event model** — RULED (`00E`.15): persisted `studioEvents` for meaningful
   authoritative/domain history ONLY (§5's clarification).
5. **Renewable Screenplay Generation V1 as chartered** — RULED (`00E`.6/.7/.8):
   mint at commission-COMMIT accepted with the identity invariants; the title
   evidence distinction stands; the M3 corpus-question row files without
   blocking.
6. **Sets mandatory + the two-set endowment** — RULED (`00E`.11/.12), with the
   binding nuance: the endowment is a **compatibility device** (migrated saves,
   FMJ fixtures, pre-Flip C2a), NOT permanent founding law — post-Flip fresh
   games start bare and fixtures adapt rather than weakening the product law.
7. **The two queue-feel rulings** — RULED: **7-i** the r3.1 HOLD recommendation
   is **REVERSED** (`00E`.5) — the RESOURCE-RELEASE LAW governs (§3.2): a
   completed phase's resources release even when the next resource is
   unavailable; completed work never hostages an old resource; **7-ii** FULL
   FREIGHT accepted with the release-law nuance (`00E`.16): waiting carries the
   cost of resources/contracts GENUINELY still committed (payroll, locked
   talent); a production is never charged for a released physical resource
   merely because it is blocked elsewhere; measured at balance, initial numbers
   not sacred.
8. **The de-scope floors and conditional world work** — RULED ACCEPTED
   (`00E`.18): Call Board treatment as chartered; marquee-only floor where
   specified; the evidence-gated north-back-lot spur; the layout narrowing —
   which **satisfies the Success Blueprint's option A** (a bounded
   deterministic spatial consequence on TIME via load-in distance), with the
   remaining general distance/travel consequence recorded as a **NAMED PARITY
   RESIDUAL owned by the C3+ travel docket** (`00E`.13 — it may not disappear
   silently); premiere zero-cash with **no direct Premiere cash reward in V1**
   (`00E`.17); and the full non-goal fence — the Success Blueprint may not
   expand C2 into later pillars.
9. **The screenplay rulings bundle** — RULED: **9a** the keep-shipped
   recommendation is **REVERSED** (`00E`.9) — C2 implements the source
   behavior: *writer experience affects WRITING SPEED, not script quality;
   office tier owns the achievable ceiling; bounded pooling (≤5 writers)
   accelerates completion* (§3.5 carries the design; §11.8 the test re-bases;
   SOURCE-FIRST DESIGN is the governing law); **9b** office tier as additive
   uplift STANDS — with the writer-quality term removed it is the ONLY quality
   lever, which is "office tier owns the achievable ceiling" in our economy's
   vocabulary; **9c** rename scope as recommended — RULED.

**Tier 2 — ratifications of recorded recommendations (one signature covers the
sheet):** sticky reservations as contract conformance (§3.2); wrap automatic +
NOTIFY-class + exact ladder position (§4.3); weeklyBurn truth repair in scope
(§9); the set-uplift/novelty terms as the ratified economy exception with their
own measured figure (§3.1/§9); F2/F3/F4/`canGreenlightMore`/releaseTick rulings
as tabled (§10); the law-26/DSF2 narrowing (§10/§11.7); §11.8's retirements/
successors/re-bases; §11.9's completed ceiling-doc registry; opex precedent
(§11.11); D-16 suite into the floor (§11.10); corpus re-base policy (§7.7);
novelty per-instance, condition gates-only with the M2 repair loop, set numbers
SHOWN and WIRED, fit advisory (§3.1); one bound Set per production (X2); no
footprint rotation in V1; no per-shooting-week stage/set fees in V1;
**bounded writer pooling (≤5) and richness/experience-scaled draft duration IN
V1 per `00E`.9** (the r3.1 deferrals are superseded — §3.5); genre-keyed title
subsets in V1, full per-genre vocabularies → C4; `AGENT_MAX_SLATE` preserving
the M0A corpus (§3.3); presentation constants UI-side (§9); **the two
development laws** — SOURCE-FIRST DESIGN and RESEARCH-FIRST/REUSE-FIRST/
INVENT-LAST (`00E`.19/.20; §13).

---

## 19. Explicit non-goals (deferred, with owners)

**Crew-as-capacity and Crew Quarters**; **talent/directors/stars as exclusive
countable capacity** (whole-film exclusivity stays a package decision — §18
item 1d); **exterior/backlot sets**; **Soundstage (Large)**; multi-set
productions (X2); reshoots (X4); partial wrap; stage-strike duration;
set-condition quality *penalty* (V1 gates only); **variable SHOOTING length**
(the eight-week production clock is untouched; richer scripts express as
beat/role/cost richness there — note: writer pooling and variable DRAFT
duration are IN V1 per `00E`.9, §3.5); **the 8-factor Script Quality model**
(cited with its own ~117% inconsistencies, never cloned); **genre-room
buildings**; **era-sensitive premises, evolving genre interests,
research-coupled generation, richer content pools, the four-tier office ladder,
full per-genre title vocabularies — all C4's deep RSG** (`00C`.3); the
unrecovered 4-stage structure (Q036); genre practice on vacant sets (C3+);
relationships/chemistry (the REHEARSE/FILM/CASTING schema evidence is NOT a
license); travel/pathfinding as outcome law beyond load-in distance; queue
Option C; B3 beats-inside-tick (C3+ paper spike); era/research content and the
1920 start (C4 — C2 keeps schema era-clean, G15); prestige/attractiveness
wiring, landscaping, awards, ranks (C3); **the optional buildable Screening
Theater / Premiere House (C3 prestige — `00C`.7)**; star life (C5); economy
closure (C6); archive/library; plate-world authored stage cells (law 27a);
authored hero-art stages; any movie footage; **machinima / Advanced Movie-Maker
anything** (unchanged owner reservation); financing/loans/bankruptcy; multi-slot
saves, UI scale (unowned, per PF1); **rival studios, acquisitions, subsidiaries,
studio bankruptcy, full Awards Season, film-library economics,
sequels/franchises/remakes, full Era progression, the 1920–2040 content
catalog, cultural drift, deep relationships, final portrait/art campaign, final
soundtrack, full economy rebalance** (`00C`.13 — architectural room is enough).

---

## 20. Definition of DONE

C2a is DONE when, at a named HEAD on the production branch: the Owner's C2a
playtest passes as scripted (§16a, including the ≥12-week hands-off segment and
the rename beat); all byte-parity and determinism gates hold; G10.1 shows
purchased capacity no longer inert; every G-gate (G1–G17) plus the four
milestone LEGIBILITY assertions (§12-M2/M3/M5/M6) is green with figures
regenerated at that HEAD; no test deleted or weakened beyond §11.8's enumerated
retirements-with-successors and re-bases; the FMJ specs pass unmodified; the C2
economy snapshot exists and reproduces; and the seal STOPS for Owner review.
C2b is DONE when the Flip playtest passes, the pre-Flip fixture and
migrated-save journeys prove the old world unchanged, the Flip golden path is
green, and the seal STOPS. **No successor campaign is automatic.**

---

## 21. The fourteen answers (`00C`.14 index)

1. *How does living time work?* — §4.1 + `08A` (Living Turn V1; partition;
   speeds; lot-only; determinism).
2. *How does renewable screenplay generation V1 work?* — §3.5 (Movie Blueprint;
   mint at commission; titles + rename; beat skeletons; provenance).
3. *How do Writer/Script-Office capacity and queues work?* — §3.5 + §3.3 (the
   existing writer+slot occupancy, verified already-true; commission as a queued
   intent; offices = parallel scripts).
4. *How do Casting capacity and queues work?* — §3.3 (casting-start as a queued
   intent; the shared dev/casting pool; §18 item 1c for the split question).
5. *How do Sets and Stages become authoritative production resources?* — §3.1 +
   §3.4 (entities + blueprints; the endowment; condition/repair; the wired stat
   block).
6. *How are reservations allocated and released?* — §3.2 + §3.3 (atomic phase
   gates; ranks; the fixed-point sweep; wrap releases; §4.3).
7. *How does visible simulation theater correspond to truth?* — §4.2 (Class
   A/B; everything belongs to a system; grounded actors; queue physicality).
8. *How does concurrency emerge without a global film cap?* — §3.3 (Phase-Gate
   Admission; capacity-derived; no replacement cap — `AGENT_MAX_SLATE` bounds
   agents, not the studio).
9. *How does the Founding Flip preserve historical saves?* — §7 + §8.3
   (`foundingRegime`; `BARE_LOT_INITIAL_PROPERTY`; the untouched anchor; the
   pre-Flip fixture).
10. *What happens to the Theater?* — §6 (not release authority; endowed-lot
    landmark; not seeded at the Flip; buildable Screening Theater → C3).
11. *How does Premiere Night work without a Theater?* — §6 (the send-off at the
    Gate; venue-independent; theater-less fixture gated).
12. *One campaign or slices?* — §2 (C2a + C2b, RSG inside C2a-M3).
13. *Which Opus lanes start immediately after authorization?* — §13 (M0 lanes
    are PF1-independent and start at GO).
14. *The Owner's acceptance playtest?* — §16 (a: ~30 min; b: ~20 min).

---

*r3.2, FROZEN 2026-08-18 by the Fable C2 Architect after three adversarial
review cycles (five-lens, three-lens, two-lens final check — every finding
adjudicated on the record) and FIVE Owner ruling sets (`00A`–`00E`). r3.2 is
the bounded docs-only amendment encoding the Owner's final pre-GO adjudication
(`00E`): every GO-sheet decision is RULED — the resource-release law replaces
HOLD; writer experience → speed with bounded pooling replaces the keep-shipped
recommendation; the two development laws (SOURCE-FIRST; REUSE-FIRST) bind every
lane; the north-star statement governs acceptance. Status: **FROZEN — WAITING
FOR PF1 SEAL + EXPLICIT OWNER GO** (at GO: M0 baseline reproduction first).
Planning artifacts: `docs/c2-planning/00–14` on this branch. No production code
was written or modified. PF1's worktree and branches were never touched.*
