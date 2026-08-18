# Campaign 1 — Lot Content Expansion ("A Studio You Actually Build") — Log

Branch: `lot-content-expansion-v1` off `main` @ `24fb87b` (accepted Master Plan v1.1).
Authorized by Owner 2026-08-17. Fable = Game Director/PM (play, diagnose, dispatch,
review, KEEP/KILL, integrate, final playtest). Opus agents implement. One production
writer per overlapping mutable surface. Small commits. Push accepted milestones.

Governing docs: `THE-MOVIES-PARITY-MASTER-PLAN.md` §9 (scope, non-goals),
Owner authorization order (M1–M8), `docs/SHIFT-OPERATIONAL-LAWS.md`,
`FIRST-MOVIE-JOURNEY-HANDOFF.md` (regression law).

## Binding campaign laws (from the authorization)

- FMJ is load-bearing: existing FMJ tests pass **without weakening**.
- Attack the twice-found defect family: overly strict closed-world predicates,
  duplicate-name assumptions, one-shot-per-studio workflows, re-entry after
  cancellation, stale identity assumptions, orphaned guidance references after
  building mutation. **Unit-green but browser-broken is not DONE.**
- Identity must not depend on coordinates; fixed coordinates are not business logic.
- 28×26 is the starting property; architecture must not cap lifetime buildings at
  eight or assume one immutable boundary.
- Two-production concurrency is transitional: don't raise it, don't hard-code
  around it being permanent.
- No decorative blueprints; every C1 facility changes a real existing number.
- Founding placements excluded from move/demolish until the Flip (C2).
- Out of scope: Sets, Founding Flip, concurrency overhaul, Awards, Rank,
  landscaping *scoring*, research, era, genre rewrite, Star needs, relationships,
  addiction, sandbox, machinima, macroeconomy closure.

## PM recon (pre-dispatch, personally read)

- `src/core/lot.ts` (296): authored constants LOT_WIDTH/DEPTH=28/26, LOT_ROADS (5
  rects), LOT_PARCELS (10; 8 buildable, 2 blocked; `expansion` id preserved from
  V11), pure helpers close over the constants; alignment with renderer world is BY
  HAND + tests. Severance walk, road frontage per parcel.
- `src/core/placement.ts` (1013): StudioPlacement {mode, nextPlacementId,
  facilities: PlacedFacility[]}; queryPlacement evaluates every cell, 9 rejection
  codes, money last; commitPlacement re-queries, byte-neutral on refuse; identity
  via `deriveIdentity(base, id, taken)` — **the annex grandfathering pattern**;
  completion pass appends `placedStudioFacility` to operations.facilities;
  invariants assert operations.facilities == INITIAL_STUDIO_FACILITIES ⧺
  operational placements (ascending completesWeek, id).
- `src/core/operations.ts`: INITIAL_STUDIO_FACILITIES = 5 capacity facilities
  (development-casting, post-building, scenery-shop, soundstage-07, soundstage-12).
  Gate/Admin/Theater are NOT engine capacity facilities — renderer places +
  semantic sites only.
- `ui/src/lot/snapshot/StudioLotSnapshot.ts` (597): BuildingId = closed 9-union;
  BUILDING_ACTION/BUILDING_LABELS as Record<BuildingId,…>;
  LotPlacementProjection already carries lotWidth/lotDepth/parcels/placements/
  catalog as data. Placed facilities are painted from the projection but are NOT
  first-class buildings (known accepted gap).
- `ui/src/lot/tycoon/world.ts` (926): WORLD_PLACES = authored 9 places
  (texKey/gx/gy/fw/fd/anchors) keyed by BuildingId; ROADS/PLAZA/APRONS/PATHS/
  EXPANSION_PADS/landscaping authored here. Geometry duplicated with lot.ts.

## Frozen M1 design (PM architectural decision)

Split: **M1a engine** then **M1b UI/renderer** (different mutable surfaces,
sequential on the seam).

M1a (engine):
1. `PropertyState` on GameState: bounds {width,depth}, roads, parcels, landmarks —
   initialized from today's exact authored data. `INITIAL_PROPERTY` constant;
   lot.ts logic parameterized by property (constants remain only as the initial
   authored data). Landmarks = gate/admin/theater with engine-owned footprint
   geometry (numbers lifted from today's world.ts; engine owns geometry as pure
   data, renderer keeps only presentation metadata).
2. Founding placements: the 5 capacity facilities become PlacedFacility entries
   (kind 'founding', verbatim facilityIds, geometry = today's world.ts footprints,
   status operational, week 0, **no capex ledger, zero opex** — representation
   change must be economy-byte-neutral). INITIAL_STUDIO_FACILITIES becomes derived
   from founding placements (same order); invariants updated, not weakened.
3. SaveFileV13: property + founding entries persisted; V12→V13 migration
   synthesizes them; historical-boundary guards; round-trip determinism.
4. Proofs: (a) representation-neutrality — a migrated V12 world simulated N weeks
   equals the V13 world on all cash/ledger/production outputs; (b) scalability —
   12+ placements fixture passes every invariant; (c) full vitest green.

M1b (UI/renderer):
1. Snapshot building list becomes dynamic: landmarks + founding + placed
   facilities, each id/label/position/footprint; BuildingId widens to string with
   founding ids preserved verbatim; label/action lookups become functions with
   per-blueprint defaults (Record types retired without breaking founding paths).
2. world.ts geometry authority retired: scene consumes positions/footprints from
   snapshot; renderer keeps presentation tables (texKey/anchors) keyed by founding
   id + per-blueprint anchor templates for placed facilities.
3. Placed facilities become first-class: selectable, standard inspector hierarchy,
   presence anchors, receipts — closing the accepted "no first-class BuildingId"
   gap.
4. Render-parity gate: Week-0 world identical to pre-M1 (structural tuple: objects/
   actors/decoded bytes/draws unchanged; law 25 re-pin only with named reasons).
5. FMJ specs pass unmodified.

## Dispatch record

(appended per milestone)

## M1a — RULING: KEEP (2026-08-17)

Engine agent delivered property-as-state on 6 commits (`c057fc0..d616180`).
PM verification: 227 files / 3,135 tests green (rerun personally), both tsc clean,
diff reviewed. UI touches limited to the exact V11→V12 precedent (makeSaveV13 in two
canonical-state guards, adapter migration chain, engine-migrated fixtures — nothing
hand-edited). Judgment calls accepted and documented in code: clearance ring does
NOT see authored structures (including them would newly reject 311 origins =
behavior change; grandfathered like founding move/demolish exclusion); structure-
overlap invariant runs last (can only add, never reorder, a verdict).

**Design reconciliation:** M1a implements `PropertyStructure` entries in
`state.property.structures` (8 bodies, roles landmark/founding,
`providesFacilityIds` links) with INITIAL_STUDIO_FACILITIES untouched — this
supersedes the log's earlier "founding facilities become PlacedFacility entries"
phrasing. Simpler, byte-neutral, invariant-safe.

Notes for later milestones: `propertyOf(state)` fallback seam (property-less state
silently gets INITIAL_PROPERTY — correct only for V12 semantics; watch);
`casting` body provides no engine facility (bodies stand at Development, accepted
M1.5 behavior — inspector copy must stay truthful); initial property's real
placement capacity ≈ 12 (3×2+ring) — the parcel map, not code, is now the binding
constraint, as intended. Neutrality proof includes 34-week byte-identity
(incl. rngState) of migrated-V12 vs native-V13 worlds.

## M1b + evidence-chain repair — RULING: KEEP (M1 complete, 2026-08-17)

M1b (11 commits, `2ef2b5b..8abfc69`): BuildingId opened (string alias; FoundingBuildingId
preserved verbatim); snapshot carries LotPropertyProjection (bounds + composed building
list); new `ui/src/lot/tycoon/buildings.ts` — one join of engine geometry ×
presentation, fail-neutral, duplicate-ids-drop-both; world.ts retired to presentation;
placed facilities first-class (`placed-<id>`: selectable, standard inspector hierarchy,
presence via blueprint anchor templates, completion receipts name the facility); legacy
`expansion` contract preserved exactly (parcel body owns its ground; a placement ON the
legacy parcel IS the Annex — one owner per ground). Structural pins UNTOUCHED.

Evidence-chain repair (`f196887`, PM-authored): M1a advanced the committed fixture
corpus to V13 but three generators (scenery-load-in, live-week-advance,
lot-native-next-event) + four Playwright twins still pinned V12 → beforeAll gates threw,
35 tests "did not run" in the first full run. Same class/repair as 628d8ad. All three
generators advanced to the V13 boundary; every committed fixture reproduces
byte-identically EXCEPT two that were legitimately generator-stale since the FMJ seal
(casting-review, script-review carried the killed actor-as-writer trap `t-act-02`;
regenerated bytes carry `t-wri-04` per sealed FMJ law). Spec pins re-measured at
identical strength with provenance comments; recap version pin follows the boundary.

**M1 gates (PM-rerun, final tree):** vitest 228 files / 3,145 tests, 0 failed ·
root+ui tsc clean · Playwright FULL 195 passed / 4 env-gated GPU skips / 0 failed /
0 did-not-run (14.8m, exit 0; +1 = new first-class-facility spec) · structural tuple
pins unchanged · FMJ specs unmodified and green.

## M2 — RULING: KEEP (2026-08-17)

Engine agent (continued from M1a) delivered the declarative blueprint/unlock schema
on 4 commits (`5951b81..d9c5be3`). 8-kind typed `requires` union (date/facility/
structure live; rank/certificate/award/research/landZone declared, honestly
evaluatable as not-yet-attainable — C3/C4 activate each with one case + one
LIVE_REQUIREMENT_KINDS entry); pure evaluator with player-safe locked-reason
vocabulary (pinned by shape tests: full sentences, no code names); two new rejection
codes `requirementsUnmet` → `instanceLimit` ranked after geometry, before money;
maxInstances binds the NEXT build only (history never invalidated by catalog
corrections — standing law); `quoteForBlueprint` split keeps the runner invariant
(only catalog blueprints are ever charged; verified at queryPlacement personally).
Accepted addition: `UnmetRequirement.notYetAttainable` so M5 can style "work toward
this" vs "not in the game yet" without string-sniffing. Annex behavior unchanged.

PM gates: root+ui tsc clean; vitest full: one flake in StudioLotScreen.test.tsx on
first pass (1/3,170), isolated rerun 60/60 and full rerun 229 files / 3,170 tests
all green — same unreproduced-under-contention class as the FMJ-era flake; WATCH
ITEM, not cleared silently. No Playwright surfaces touched beyond compile-forced
rejection sentences (two new player sentences in buildMode).

## M3a — RULING: KEEP (2026-08-17)

Engine agent delivered Move & Demolish V1 engine half on 4 commits
(`5d44468..d89684c`). Fail-closed engagement guard over all five persisted holder
sources (workflow reservations, denormalized shootingTask soundstage id — walked
independently so divergence can't dangle, script reservations, casting reservations,
retired V11 construction root); identity-preserving move through the single legality
authority (`movingPlacementId` threaded, never caller-supplied occupancy);
strictly-lossy demolition (flat 0.5 fraction, TUNING; fraction<1 invariant);
`facilityDemolitionRefund` ledger kind V13-only with two-way capex↔refund
correlation by projectId; nextPlacementId never reused. PM gates rerun: 230 files /
3,199 tests green, both tsc clean; boundary refusal + forged-refund tests verified.

Three deviations accepted with reasons on record: (a) expectedWeeklyOperatingCostAt
reconstructs demolished facilities from the ledger pair (capex→birth, refund→death)
— removal makes the live array insufficient history; ledger-note uniqueness added to
the catalog invariant as a consequence; (b) move priced at FACILITY_MOVE_COST (0)
for insufficientFunds — a move is not a re-purchase, one charging rule for both
verbs; (c) facility-id reuse after demolition allowed (project ids still suffix;
nothing persisted references a facilityId across demolition; engagement guard proves
no survivor) — "no duplication" read as no duplication EXPLOITS, which are guarded.
Note for M4/M5: TWO files enforce ledger shape (placement.ts + construction.ts,
now policy-scoped) — a genuine second authority, know it exists.

## M3b — RULING: KEEP (M3 complete, 2026-08-18)

UI agent delivered the world half on 7 commits (`d4f6b72..e541caf`). Move = the
placement ghost carrying the building (roaming the whole property — where an owned
building may stand is the quote's question, not a parcel's), standing body dimmed
with hazard outline "Moving <name>", explicit keyboard-reachable commit, Escape
byte-neutral. Demolish = in-world confirm with exact refund, receipt on the parcel
that survived, selection never dangles (orphan-safety effect as second line of
defence, stale-guarded). Engaged facilities: verbs disabled WITH the bound reason
sentence; caller-error states render no verb. Holder titles resolved at the adapter
boundary. Two defects found and fixed at proof time (thrown refusal message replaced
by re-probe + studio sentence; receipt no longer rendered inside the panel the
demolition closes). Week-0 pins preserved by making the carried-body layer lazy —
the agent caught its own would-be +1 re-pin and designed it away.

PM gates: both tsc clean; full vitest ×3 → green / 1 flake (WorldFirstAnnex
Construction, annexHostSelections 2≠1) / green; flaky test green in isolation ×2.
Agent-run Playwright: move-demolish 3/3, build-mode 7/7, FMJ golden path 1/1,
operational-annex 7/7, presence 5/5. Deviations accepted: explicit commit button
(keyboard law), property-roaming move, demolition lands on the parcel.

**FLAKE WATCH — UPGRADED.** Two distinct contention-only flakes in four full runs
(StudioLotScreen at M2, WorldFirstAnnexConstruction at M3b), both React-boundary
selection counters, both green in isolation; class predates C1 (recorded at the FMJ
seal). HARD TRIGGER: one more contention flake in ANY file, or any repeat, forces a
dedicated diagnosis pass before the M8 seal. PM playtest of move/demolish feel is
consolidated into the M5 review checkpoint (mechanics proven on canvas by spec).

## M4 — RULING: KEEP (2026-08-18) — 4 of 6 shipped, 2 stopped on evidence

Shipped (commits `e31a7d1..b56c60c`): catalog 1→5. Development Office II (+4 EST on
first drafts, $600K/8wk/$2.5K, maxInstances 1) and III (+9 replacing II, $1.2M/12wk/
$4K, requires operational office-2 — M2's facility gate live, maxInstances 1);
Development & Casting Hall (+2 shared slots, $1.4M/20wk/$6K, stacks); Craft Services
Annex (−15% freelancer fees, $400K/6wk/$2K, maxInstances 1). One effects authority
(`facilityEffects.ts`): operational-only, pure, neutral-when-absent — baseline
byte-unchanged. Capacity registry made precise (capacity-providing placements only)
so effect-only buildings exist honestly. Uplift read at DRAFT time (stored
assessments; screenplays never un-written by demolition; rewrites don't recompound).
`freelancerFee(state, talent)` param required, not optional — no silent
undiscounted-quote trap. effectSummary (player copy) required on every blueprint.

**STOPPED — publicity-wing: verified authority conflict, Owner ruling required.**
Master Plan §9 contemplates Administration/Theater upgrades; but D-17B authorization
("NOT: PUBLICITY OFFICE FACILITY"), D-16 R9, the sealed Publicity Campaign V1
contract (§9 forbids a Publicity facility; §17 kill boundary names cooldowns), and
the Facilities/Construction research contract non-goals all forbid exactly this
entry's mechanism space. Quoted verbatim by the implementer, verified. → Owner
decision item for the seal report. C1 ships without it.

**STOPPED — scenery-annex: fails the no-decorative-blueprint law on merits.** The
load-in blocker is player-created, deterministic, costs zero weeks/dollars in normal
play, has no quality effect, extra set-scenery capacity is provably a no-op at the
two-production ceiling (frozen research closure agrees), and removing the blocker
would delete the sealed Scenery Load-In V1 content. Master Plan §9's explicit OR
branch (freelancer craft fees) shipped instead. Family satisfied.

Economy flags recorded for M7/M8 (NOT gut-tuned now): Office III value weakest in
slate; Hall's 20-week payback may exceed a run's horizon. PM gates: 232 files /
3,227 tests green (no flake this run), both tsc clean.

## M5 — RULING: KEEP (2026-08-18) — catalog UX + world presentation, and the flake class closed

UI agent delivered on 5 commits (`d5b43d6..58791c1`): the build catalog as a real
tycoon list (`buildCatalog.ts` word module + `lot-build-catalog` in the parcel
panel), four distinguishable presentation bodies for the placed blueprints, and the
effectSummary sentences surfaced at every decision point. Locked precedence
locked > at-limit > unaffordable; ghost legality and the quote grammar preserved
verbatim. The agent found and fixed three of its own defects at proof time (catalog
scroll box, guidance-fold infinite wait, spec `.click()` timeout) and avoided a
Week-0 pin bump (174→175) by baking the blueprint texture lazily.

Flake class CLOSED product-side (commits `703ede2..328b2a2`, my ruling, Option B):
the repaint-reconciliation effect re-asserted selection unconditionally and strict
doubles counted every invocation. Now the scene exposes `worldSelection()` renderer
truth, the effect re-asserts ONLY when the renderer actually lost the selection, and
the three doubles faithfully report what they hold (they had reported holding
nothing, which would have made the guard inert and the fix vacuous). New
non-vacuous property test; 5×148 clean contention loops; full suite green.

PM gates: both tsc clean; full vitest 234 files / 3,239 tests green; full Playwright
serialized 195 passed / 4 skipped, exit 0 (PIPESTATUS-verified).

PM personal playtest (fresh studio, seed studio-001, Chrome, by eye): founded with
six signings; South Lawn catalog read cleanly — parcel facts "6 × 4 cells · 24
free", road frontage sentence, state badges, Office III LOCKED with the verbatim
bound reason "Requires an operational Development Office II.", Craft Annex's 15%
sentence; Office II ghost world-first (green 3×2 footprint, floating "$600,000 · 8
weeks" tag, origin nudge pad); commit debited exactly $600K with receipt +
construction body + "8 WEEKS LEFT" sign; 8 advances → completion toast, sign flipped
to OPERATIONAL, parcel facts "Operational since Week 8 · $2,500/week", overheads
flowing; **Office III's lock cleared same-session by data** and Office II showed the
at-limit copy ("The studio builds only one of these, and it already has it."); the
commission form carried the uplift line verbatim — "Development Office II will add 4
points of estimated strength to this draft."; canvas-clicking the office opened its
own first-class inspector with Move and "Demolish this building — refund $300,000",
confirm grammar exact ("THE STUDIO RECOVERS $300,000." / "This cannot be undone."),
cancel clean. Hybrid interaction law holds: building is world-first, commissioning
stays a retained overlay with the live lot behind it.

Blemish logged for M6 polish (not a defect): the completion toast appends the
slot-delta template to every facility — "0 shared Development & Casting slots are
now available" on a facility that adds none is true but noisy. Suppress the
sentence when the delta is zero.

Owner acceptance trajectory: the South Lawn now holds a building I chose, paid for,
watched go up, and could point to. "I built this place" is starting to be literally
true on screen.

## PM CORRECTION (2026-08-18) — the M5 ruling cited a stale Playwright figure

The M5 KEEP entry records "full Playwright serialized 195 passed / 4 skipped, exit 0".
That run collected 199 tests — which is the M1a-repair-era corpus. The M3b spec
(`tycoon-move-demolish-v1`, 3 tests) and the M5 spec (`tycoon-build-catalog-v1`,
3 tests) had landed by then, and the tree at `328b2a2` collects 205. The full-suite
run I credited to the M5 gate was in fact executed on a pre-M3b tree; the M5-tree
full Playwright run never happened under that ruling. Found while chasing a
collection-count discrepancy flagged by the M6 checkpoint-2 implementer.

Material impact: none — the M6 checkpoint-2 full run at `ceb55ef` (which contains
the entire M5 corpus plus the warmth pass) collected 205, passed 201, skipped the 4
env-gated evidence tests, failed 0, exit 0 verified without pipes. Both new spec
files pass in full runs. The M5 KEEP ruling stands on that superseding evidence.

Process lesson, binding for the rest of the campaign: a gate figure cited in a
ruling must name the HEAD it was executed at, and a full-suite run older than the
newest spec file is not a gate. (Also recorded: this zsh expands `${PIPESTATUS[0]}`
as empty — it is bash-only; use `$?` after redirection, never a pipe.)

## M6 — RULING: KEEP (2026-08-18) — the lot warms up, and the property proves it can grow

Two halves, three implementers, one art review.

**M6b — visual warmth (commits `2c4dfcd..2255062`, follow-through `7054f18..ceb55ef`).**
Ochre rotation with the scorch inversion (lighter gold = dry, not darker green =
damp), 57 authored backlot dressing props on non-buildable ground with a runtime
yield closing the legacy-landscaping legality lie, six buildings now tellable at a
glance (green-slate hip on Casting is the lot's only cool roof; saw-tooth
north-light on Scenery & Post; chimneys/cupola/monitor split the office tiers), and
readability defended by haloed strokes under every ring and outline. PM ART REVIEW:
APPROVED AS-IS — corpus-faithful mood at tutorial-era density; the legality ghost
and the construction scaffold both read unambiguously over the warm ground.
Checkpoint-1 implementer caught two of its own defects (gridHash origin fixed-point;
wall signs drifting onto roofs) and STOPPED correctly on the toast fix when it found
the copy authority in `ui/src/engine/adapter.ts` — surface granted, fixed by the
checkpoint-2 implementer with the zero-capacity seam pinned. Structural re-pins per
law 25 with MEASURED reasons (231/14/8,806,568/6 and the presence variants; +57
objects verified by running `backlotDressing()`, byte delta identical across two
different-seed studios proving world-art-not-people, draws 4→6 verified in Phaser's
batch source). Evidence chain: all seven generators re-run, every save byte-
identical. Finding accepted: THE SUITE HAS NO COMMITTED CANVAS DIGESTS — canvas is
pinned structurally and relationally by design; the digest constants are save/asset
digests. PM rulings recorded: legacy landscaping stays (runtime yield is the C1
mechanism; the north-back-lot water tower vanishing if a player builds there is an
accepted consequence, revisit with C3 landscaping).

**M6a — expandability proof (commits `590aac8..c61030d`).** All three claims proven
with ZERO engine or renderer changes — nine files, all new, all test/fixture.
(1) SECOND ZONE BY DATA: the South Yard fixture (depth 26→34, four parcels carrying
the full rule surface — road-served, unserved, blocked) accepts a build, completes
it, joins shared capacity, round-trips byte-identically; the 11-code rejection
vocabulary answers word-for-word on new ground; in the browser the zone gets
hotspots and companion rows, refuses without road frontage, and composes the placed
body through the standard catalog→ghost→commit path. (2) NO LIFETIME CAP: 60×60 /
22 parcels / 24 structures / 36 placements — placement, move, demolish, opex, save
round-trip all hold; ids never reused; capital strictly lossy. (3) IDENTITY NOT
COORDINATES: a move changes ground and nothing else; an engaged building refuses
identically at two destinations in two zones; a successor on the same cells gets new
ids and inherits no history. Fixtures claim SAVE boundary only, no canvas anchors,
`shipsToPlayers: false`; the property root is authored data and the manifest says so.

**Findings recorded (not defects; named for C3):** the renderer's ground zoning
(roads/plazas/aprons) is still authored presentation inside 28×26 — a data-grown
zone's roads are rule-live but invisible; `presence.ts` clamps people to founding
LOT_W/LOT_D. Both are the presentation seam land acquisition must convert before a
second zone is SHIPPABLE rather than provable. The V13 validator accepting any
well-formed property is a deliberate open door, now stated. The world join draws
only bodies it has presentation for, asserted (8 drawable / 16 not in the far
fixture) rather than silent.

**PM gates, independently re-run at HEAD `c61030d`:** root tsc 0; ui tsc 0; full
vitest 240 files / 3,296 tests, exit 0; generator reproduction `unchanged` ×3 with
digests matching claims, tree clean; new e2e spec 3/3 in isolation, exit 0. Full
serialized Playwright at this tree: 208 collected / 204 passed / 4 env-gated skips /
0 failed, exit 0 (checkpoint-2 ran 205-corpus at `ceb55ef`, M6a ran 208-corpus at
`c61030d`; collection arithmetic exact: 205 + 3 new).

## M7 — RULING: KEEP (2026-08-18) — the whole loop holds, and the economy is now a measured fact

**Golden path (`bd6c4ba`):** one spec, one continuous browser session on shipped
defaults, no reload — found → catalog compared (effect sentences asserted against
the engine's own effectSummary; the lock bound to its control by aria-describedby)
→ a real refusal, byte-neutral → Office II bought with the exact debit → eight
weeks counted down on the canvas → the zero-slot completion toast carries NO slot
sentence (the C1-M6 adapter fix's first golden-path exercise) → the commission
uplift proven as ENGINE TRUTH (+4 on both strengths vs the engine's own
counterfactual assessor, not copy) → moved for $0 with the ledger byte-identical →
demolished AFTER the commission for exactly half the capital, the stored assessment
surviving byte-identically → picture #1 carried to PICTURE FORMED and picture #2
commissioned in the same session, with the uplift sentence correctly GONE (effects
read live) and a cancel-and-re-enter in the middle. No product change needed, no
assertion weakened. 18 seconds.

**Economy snapshot (`c1e7cb0`, `73c8611`):** scripts/measure-c1-economy.mts →
docs/economy/C1-ECONOMY-SNAPSHOT.md, deterministic and byte-reproducible (PM
re-ran: identical numbers, only the provenance HEAD line moves). Headlines:
built-out = $4,380,000 capital / $18,000-wk opex (16.1% of weekly outflow; payroll
59.8%); every refund exactly 50.0%; uplift A/B with rngState byte-identical across
arms — Office II +$137,931 revenue per picture, II+III +$312,491, tiers replace and
never stack; shared slots at the 2-production ceiling are MEASURABLY INERT (4 of 5
seeds byte-identical outcomes with +1/+2 slots; mean marginal slot −$323,532 before
the building is paid for; 35 of 48 capacity refusals fall before Week 13, earlier
than any bought slot can stand); paybacks — Office II 26.7 wks, Office III 43.5 wks
marginal, Annex and Hall NEVER at today's ceiling, Craft Annex 13.1 freelancer
hires and $0 for a roster-staffed studio. THE TWO STANDING FLAGS ANSWERED WITH
DATA: (a) Office III is not the slate's weakest but is the worst-value OFFICE
(4.17 EST pts/$1M vs II's 6.67, 37.5% less per dollar) — the weakest entries are
the Annex and the Hall; (b) the Hall cannot pay back at the current ceiling, and
the clock is the second problem — the constraint it relieves is not the constraint
the studio is under. Counterweight recorded: slots buy optionality a scripted
policy never exercises. NOTHING TUNED — this is C2/C6 evidence, exactly as the
Master Plan intends (concurrency-from-capacity will move these numbers; tune after
that ruling, not before).

**PM gates, independently re-run at HEAD `73c8611`:** root tsc 0; ui tsc 0; full
vitest 240 files / 3,296 tests exit 0; golden-path spec 1/1 (19.6s) exit 0;
economy script reproduction byte-identical. Implementer's full serialized
Playwright at this HEAD: 209 collected / 205 passed / 4 env-gated skips / 0 failed,
exit 0 (arithmetic exact: 208 + 1 new). Its FIRST full run failed once on the
pre-existing zoom-leg flake in tycoon-build-mode-v1.spec.ts — see below.

**FLAKE WATCH — HARD TRIGGER FIRED (third distinct file).**
`tycoon-build-mode-v1.spec.ts:606`, the effective-200%-zoom leg, ~1-in-4,
reproduced in a clean worktree at the untouched branch tip — NOT caused by M7
(additive files, spec not even collected in the failing repro). Implementer's
diagnosis, verified readable in the source: `reframes()` measures immediately after
`setViewportSize` + `documentElement.style.zoom = '2'` with no wait for Phaser's
Scale Manager to settle, so the first capture can read the stale canvas box
(expected 0.32001948 = pre-resize fit vs received 0.37037037 = post-resize fit —
the numbers match the mechanism exactly). The sibling test in the same file waits
for precisely this with the comment "Waiting for it matters". This is a DIFFERENT
mechanism from the M2/M3b selection-counter class (already closed product-side at
M5): a measurement race in the spec, not a product defect. Dedicated pass follows
this ruling, before any M8 seal.

**Handoff item recorded (C2):** the in-world commissioning workspace opens only
when lotAttention is idle, so a second screenplay cannot be commissioned FROM THE
WORLD while the first sits readyToPackage — the player is ejected to the
full-screen Writers Room. Not a defect against any accepted contract (the engine's
shared slots allow it; the world UI gates it), but under the hybrid interaction law
it is a casual eject for a core action, and it is the same SHAPE as the twice-found
family. Belongs to C2's concurrency ruling; queued for the seal report.

## FLAKE WATCH — RESOLVED (2026-08-18) — the zoom-leg measurement race is closed

Dedicated pass, PM-executed (one-line class, diagnosis already verified by the M7
implementer). REPRODUCED first: 4 of 6 repeats failed pre-fix, every failure the
exact diagnosed pair (expected 0.32001948 = whole-property fit against the STALE
canvas box, received 0.37037037 = the settled fit). FIX: `canvasBoxSettled()` in
the camera-grammar test — capture zoom, apply the viewport/CSS-zoom change, poll
until the projection answers a NEW zoom (the sibling guidance test's own idiom,
"Waiting for it matters"), then measure. Applied at all three `reframes()` call
sites. PROOF: 12/12 repeats clean post-fix; the file 7/7; ui tsc clean; FULL
serialized Playwright at the fixed tree 209 collected / 205 passed / 4 env-gated
skips / 0 failed, exit 0. No assertion weakened — the test now measures what it
always meant to measure.

Class accounting for the seal: the M2/M3b selection-counter class was closed
product-side at M5 (worldSelection guard); this was a spec-side measurement race,
different mechanism, now closed at the source. No open flakes on the watch.

## M8 (part 1) — PM PLAYTEST: PASS against the Owner acceptance test (2026-08-18)

Fresh studio in Chrome at HEAD `c351086`, virgin seed `ochre-gate-08`, dev server,
by hand and by eye. Founded with a seven-person roster; built the Craft Services
Annex on the West Lawn ($400,000 exact) and Development Office II on the South Lawn
($600,000 exact); watched both complete — the Annex's Week-6 toast reads
"Craft Services Annex is Operational in Week 6." with NO phantom slot sentence
(the C1-M6 adapter fix, confirmed live); commissioned "The Forgotten Foundling"
under the office's verbatim +4 line and drafted to EST 82.1 · Strong; accepted;
planned auditions in the retained overlay with the live lot behind it (the slate
refused my lazy two-people-everywhere picks with "complete slate needs at least
three different people" — honest, and right); reviewed camera tests; then the C1
loop again: Office III showed AVAILABLE the moment II stood operational, and
placing it on the South Lawn met a REAL refusal — "This site is too close to
another building — leave a cell of clearance." The parcel I had built was FULL for
a 3×2 under the clearance ring, so the bigger office went to the North Lawn
($1,200,000 exact) — genuine parcel pressure, discovered by play, felt like a
tycoon decision. Moved the Craft Annex two cells for $0: instant, identity intact
("Operational since Week 6" survived the move).

THE SEAM, felt: with a screenplay readyToPackage, the Development inspector does
NOT dangle a dead commission verb — it says "Commissioning opens here again once it
moves on," a reason and a reopening promise in the blocked-state grammar. The
parallel-development limit stands (C2 concurrency scope, already queued), but it is
honestly communicated in-world; no silent eject on this surface.

OWNER ACCEPTANCE TEST — the look: three structures on three lawns that exist
because I chose them, one counting down its construction, one standing where I
moved it, the founding nine anchoring it all, a picture in camera tests behind.
"This is just a menu of sprites" does not describe this screen. "I built this
place" does. PASS.

ONE FINDING (fixed same-day, `6671054`): the move flow's quote panel reused the
build template verbatim — "CONSTRUCTION CLOCK 6 weeks · completes Week 16" and
"once operational" for a move that is instant and changes nothing. Behavior was
honest; the copy was not (quote-grammar law). `quoteFacts` is context-aware now: a
move quotes Move cost / Downtime "None — the building moves standing." / weekly
cost "unchanged by the move", and no capacity row. Unit-pinned both contexts;
e2e proof folds into the seal-time full run. The red-team was pointed at this
finding's FAMILY (template lines promising wrong facts in other flows) before the
fix landed.
