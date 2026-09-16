# P13B headless engine plan — logic-first window (2026-09-16)

> **For agentic workers:** execute task-by-task with `superpowers:test-driven-development`; verify with
> `superpowers:verification-before-completion` before any status claim. Steps use `- [ ]` checkboxes.
> Project law outranks skill defaults: tests here are real scheduler/command/save tests (Owner task), not
> smoke checks; plans live in this `plans/` directory (execution boundaries), not `docs/superpowers/`.

**Goal:** implement and test the eight P13B Ready obligations as headless engine logic on
`wip/headless-program-20260916-ts`, in dependency order, without Unity changes.

**Architecture:** the technology root moves from the P13A single-Scientist shape (v1, Save V20) to a
seat/receipt shape (v2, Save V21) so named staffing, multi-Lab allocation, queues and rival capacity can be
recorded per week and reconciled. Every slice keeps `(state, actions) => state` purity, exact-key
validation, fixed-point work accounting and ledger reconciliation. Bridge read models are enriched without
changing the wire schema until a slice needs new fields; each schema change bumps the projection and is
recorded for the future Unity consumer in `UNITY-INTEGRATION-BACKLOG.md`.

**Tech stack:** TypeScript strict, vitest 2.1.9 (`--minWorkers=1 --maxWorkers=2` on this host), existing
generators (`scripts/generate-bridge-contract*.ts`). No new dependencies.

**Budget carried forward (Owner: caps are planning checkpoints, not a fresh clock):** whole-program
ledger at the paused record: capability remaining ≈ 38.3 h, reserve ≈ 5.9 h with the 6 h protection line
already crossed by 0.08 h. P13B planning allowance (companion §9, not accepted tuning): 84 h capability +
36 h reserve for all eight rows. This window charges actuals per slice in `HEADLESS-PROGRESS.md`; any hour
beyond the carried 38.3 h is reported as overrun, never hidden.

**Decision classes used below:** Owner selected / delegated implementation decision / provisional tuning /
proposed product choice (not coded).

---

## Slice order (dependency order from companion §3)

| Slice | Ready row | Scope | Prerequisite |
|---|---|---|---|
| S1 | 1 | Full named staffing on one Laboratory: candidate pool, seats, weekly allocation, receipts, V21 | none |
| S1b | 1 | Bridge read model for seats (projection bump) | S1 |
| S2 | 2 | Second technology entry (R07 lighting-control-01), multiple Labs, cooperation/splitting factor, module claims | S1 |
| S3 | 3 | Persistent queues/dependencies/admission | S1 (P09 quote envelope) |
| S4 | 4 | Office gap-aware conversion/direct purchase | P09 placement |
| S5 | 7 | Component inventor pricing/prototypes per technology | S2 |
| S6 | 6 | Option-B installation cancellation with component receipts/restoration | S5 |
| S7 | 5 | Forecast/replacement disclosure (public milestone facts) | S2 |
| S8 | 8 | Symmetric rival research with governed capacity and typed finance | S2, S5, S6 |

S2–S8 are recorded here at scope level and expanded into TDD tasks when their turn comes; each expansion is
a plan amendment on this file, not a new hierarchy.

---

## S1 — Full named research staffing (Ready row 1)

**Scope.** Replace the one-Scientist programme with named seats on one Laboratory: a deterministic
eight-person candidate pool per studio, up to four occupied seats per Lab, per-seat eligibility (employed
Scientist, unreleased seat), weekly spend `min(ceiling, 10,000 × n)` and output `n + spend/20,000`, per-week
receipts, retained work through expiry/rehire/pause/cancel, V20→V21 migration with a frozen legacy prefix.
Multi-Lab cooperation and the second brief stay in S2; S1 refuses seats on a second Lab explicitly.

**Authoritative choices.**
- Owner selected (P13A receipt, P13B index): research is real named work; payroll is separate from R&D;
  verified work is retained through pause/cancel/expiry; filming-phase lock unchanged; all eight rows retained.
- Delegated implementation decisions: technology root v2 (`seats`, `weeks`, `legacy`), Save V21 through the
  existing save owner, `releaseResearchSeat` command, auto-pause when no seat remains eligible (retains the
  P13A law), candidate pool via the existing `generateScientist(seed, id)` on ids `t-sci-00`…`t-sci-07`
  (Otto stays `t-sci-00`), one project per (studio, technology) with the unchanged id law.
- Provisional tuning (companion S1-A/B candidate, not Owner-approved balance): $10k usable per seat, 4 seats
  per Lab (`TUNING.RESEARCH_LABORATORY_CAPACITY`), 8 employed Scientists per studio, ceiling $0..$1m.
- Proposed product choices left uncoded: "exactly one restart after cancel" (companion §2 journey table);
  **Resolved 2026-09-16 (OPS-P13B-R07-DISPOSITION-20260916-01 §4):** "exactly one restart" means one resumed instance of the same project, not a lifetime quota; repeated cancel → restart cycles are lawful (identities, work, spend and receipts retained; eligibility rechecked; no cloned work, refunded research or repeated entitlement). Not a product choice any more; S2-T8/S3 acceptance performs two cycles with save/reload.
  P13A restart law (retained work, repeatable) is preserved and the choice is recorded in the progress file.

**Current producer contracts consumed.** P10 employment (`contractOffer`, `applySignContract`, hiring market,
`activeContract`), P09 placement (Lab facility capacity, instrument installation, occupancy claims), P11 ledger
kinds (`researchSpend`, `researchPayroll`, `technologyAdoption`), P12 employment intervals
(`hollywood.employment`) for payroll reconciliation, P13A technology validator as the V20 frozen boundary.

**Tests (requirement-derived; each fails before its implementation).**
1. Candidate pool: eight distinct ids/names per seed, deterministic, no RNG advance; ninth recruit refused;
   recruit by explicit id; Otto remains first.
2. Seats: four distinct people on one Lab; fifth refused with the seat-cap reason; assigning a person
   already seated refused; seat on a second Lab refused in S1; release then re-seat keeps history.
3. Scheduler: 4 seats × $40k → spend 40,000 / output 6 / 11 funded weeks (paper table); 1 seat × $40k → 10,000
   / 1.5 / 43 weeks (P13A); 0 ceiling × 4 seats → 4 units/week, 16 weeks; 2 seats × $25k → 20,000 / 3.
4. Expiry: one of four contracts ends mid-project → that seat earns/charges nothing, n drops to 3, seat
   retained; rehire same id resumes it; all seats expired → project pauses; payroll/overhead continue while
   idle; a released (early) last seat pauses immediately.
5. Conservation: Σ receipt spend = expenditure = Σ ledger `researchSpend` rows; Σ receipt units = verified
   work × 20,000; cash delta reconciles across a funded interval.
6. Identity: two Scientists with the same name and different ids are seated, charged and reported by id.
7. Determinism/replay/interleaving: same seed + same actions → byte-identical export; seating mid-project
   changes n from the next boundary only; save/reload byte-identical at every state.
8. V20→V21: the three legacy fixtures (`tests/fixtures/p13b/*.json.gz`, minted at
   `e2e409e80eccb6a7fd49fa16aa0f750faeb51253`) migrate with the scientist mapped to one seat at the migration
   week, a legacy prefix carrying exact prior work/spend, empty receipts, byte-identical remaining roots;
   `migrateToV20` refuses V21; the V19 accepted fixture still migrates through V20 to V21.
9. Validator refusals on V21: forged receipt units, receipt for an unemployed seat, fifth seat, duplicate
   unreleased seat for one person, receipt/ledger mismatch, receipt count beyond the bounded growth limit.
10. Campaign isolation: two migrated copies are independent objects and a tick on one leaves the other exact.

**Capability/verification budget (planning allowance):** 6 h capability, 2.5 h verification. Actuals are
charged in `HEADLESS-PROGRESS.md`.

### File map

- Modify `src/core/technologyTypes.ts` — v2 root types (`ResearchSeat`, `ResearchWeekReceipt`,
  `ResearchLegacyPrefix`), `recruitScientist.scientistId?`, `releaseResearchSeat`.
- Modify `src/core/technology.ts` — candidate pool, seat law, quote/advance with receipts, v2 validator;
  keep the P13A validator as `validateTechnologyV1` (frozen V20 boundary).
- Modify `src/core/actions.ts` — recruit bound and explicit id; `releaseTalent` seat-aware pause.
- Modify `src/core/employment.ts` — `busyTalentIds` over eligible seats.
- Modify `src/core/occupancy.ts`, `src/core/presence.ts`, `ui/src/engine/adapter.ts` — seat-aware claims.
- Modify `src/core/save.ts` — `SaveFileV21`, `validateSaveV21`, `convertV20ToV21`, `migrateToV21`,
  `makeSave` → V21, downgrade guards.
- Modify `bridge/laboratory.ts` — seat-aware page and actions, schema unchanged (projection 32).
- Create `src/harness/p13b/fixtures.ts` — staffed-Lab generated fixtures.
- Create `tests/p13b-s1-staffing.test.ts`, `tests/p13b-s1-scheduler.test.ts`,
  `tests/p13b-s1-save-v21.test.ts`, `tests/p13b-s1-validation.test.ts`.
- Update existing P13A/bridge tests only where the shape or version changed (record each).

### Tasks

- [x] **T1 Types + candidate pool (RED→GREEN):** test 1; add `researchCandidates(state)` in
      `technology.ts`; extend `recruitScientist`.
- [x] **T2 Seat commands:** test 2; `assignResearchScientist` creates/extends the project with a seat;
      `releaseResearchSeat`; refusals.
- [x] **T3 Scheduler + receipts:** tests 3, 5, 7; `researchWeekQuote` over eligible seats;
      `advanceResearchWeek` writes receipts and caps the final week.
- [x] **T4 Expiry/rehire/pause:** test 4; eligibility, auto-pause, `releaseTalent` seat-aware pause,
      `busyTalentIds`.
- [x] **T5 Validator v2:** test 9; rewrite `validateTechnology`; keep `validateTechnologyV1` for V20.
- [x] **T6 Save V21 + migration:** test 8, 10; save owner changes; legacy fixtures; downgrade refusals.
- [x] **T7 Consumers:** occupancy/presence/adapter/bridge seat-aware; bridge P13 tests updated; test 6.
- [x] **T8 Affected suites (2026-09-16 14:55–15:44, quiet host, `d74426a`, baseline-matched flags; evidence 06–13: core 217/225 files, bridge 53/55, failing set = inherited + one stale expectation fixed and re-proved):** `p13a-*`, `bridge-p13-*`, `tick`, `save`, `replay`, occupancy tests; then a
      bounded full core pass; record results and inherited failures.
- [x] **T9 Checkpoint (2026-09-16 ≈16:05; S1 LOGIC VERIFIED · UNITY NOT VERIFIED):** progress/backlog/continuation records, commit, push.

Task evidence (2026-09-16): T1/T2 `tests/p13b-s1-staffing.test.ts` 5/5 (RED 13:02 → GREEN 13:50); T3/T4/T7 `tests/p13b-s1-scheduler.test.ts` 13/13 + `tests/bridge-p13b-s1-identity.test.ts` 1/1; T5 `tests/p13b-s1-validation.test.ts` 7/7 (+ P13A validation 9/9 after the duplicate-charge pre-pass); T6 `tests/p13b-s1-save-v21.test.ts` 8/8 on the three frozen V20 fixtures + accepted V19; commits `b5b2412`, `5a52e1e`, `d74426a`; read-only audit at b5b2412 (no false refusals; 3 findings fixed in d74426a). Each task ends with a commit on this branch. Commands: `npx vitest run --project core --minWorkers=1
--maxWorkers=2 <files>`; `npx tsc --noEmit -p tsconfig.bridge.json`.

---

## S1b — Bridge read model for seats (projection 33) — task expansion (amendment 2026-09-16)

**Scope.** Publish the S1 facts the Unity consumer will need as data, not labels: `StudioLaboratoryPage.seats[]`
(`talentId`, `name`, `assignedWeek`, `releasedWeek`, `employed`), `receipts` (the last eight
`{week, seatTalentIds, spend, units}`), and numeric `weekly` (`ceiling`, `usable`, `seats`, `output`)
beside the existing labels (labels stay for the paused client). Projection 32 → 33; protocol 4 unchanged.
Delegated implementation decision: additive fields only; nothing existing renamed. Allowance: 2 h / 1 h.

- [x] **S1b-T1 Schema + generator (RED→GREEN; RED 8/8 at aa0ccce, GREEN 8/8; new schemaId `sha256:9ee4bcff04e06d47fa672f6091d3f9eac98c3a19829260fd9587ab22d06d55f6`):** bridge schema test asserts the new members and projection 33;
      `npm run generate:bridge-contract` + `generate:bridge-contract:fixtures`; manifest hash recorded here and in the backlog.
- [x] **S1b-T2 Page (`tests/bridge-p13b-s1b-seats.test.ts`, test-author; scenarios a–f + player-safe):** `bridge/laboratory.ts` fills the members from `occupiedSeats`/`project.weeks`/`researchWeekQuote`;
      `tests/bridge-p13b-s1b-seats.test.ts` proves seats by id (same-name pair), receipts order, and no private rival data.
- [x] **S1b-T3 Records (2026-09-16 ≈16:40):** backlog (C# binding change: `StudioLaboratoryPage` DTO + fixture regeneration + paired Unity adoption), progress row, commit, push.

## S2 — Multiple Labs, cooperation and splitting (Ready row 2) — task expansion (amendment 2026-09-16)

**Authoritative sources.** Companion `02-P13B-DECISIONS-AND-ACCEPTANCE.md` §4 (candidate briefs, multiple-Labs
recommendation, unequal-team rule), `03-PAPER-ECONOMICS.md` (formula/clock, 64-unit staffing table, [780,832)
allocation fixtures) and `06-CURRENT-OPS-CORRECTION-AND-DISPOSITION.md` (Post-onset correction; +$12,000 rows), all at
`673f49835404e262ea651b4fcb8fda5e259d80a6` (SHA-verified copies in the Owner packet materialization).

**Scope.** Research side only: the second catalogue entry, Lab discipline modules and bench claims, seats across two
Labs per project, the cooperation output rule and proportional funding, per-Lab receipts, document 03 dates reproduced
through the real scheduler. Lighting **deployment** (access/equipment/site/installation components, +$1k weekly) is S5;
its cancellation is S6. The **production consumer** of R07 (demanding lighting setup 4→2 setup units, Set size classes)
stays DESIGN BLOCKED on the named pre-execution clarification (Future Ops R2 exact recipe) and is not coded here.

**Authoritative choices.**
- Owner selected: all eight rows retained; direct conversion selected (S4); money scale OPEN-5 stays the Owner's.
- Delegated implementation decisions: catalogue entry `lighting-control-01` (researchable 780, commercial 936, 64 units,
  P2) on a Lab `electrical-control-instruments` module ($350k / 5 weeks / +$2k weekly, P09 installation on a Laboratory);
  `stageInstallationId` for lighting is a P09 installation blueprint `lighting-control-stage` recorded at the whole-package
  quote ($100k / 4 weeks / +$1k weekly) so catalogue reachability holds — S5 decomposes it into site $50k/2w + install
  $50k/2w components; `postInstallationId` becomes nullable (lighting has no Post component); **work numerator rebased to
  1/160,000 (WORK_UNIT × 8) in Save V22** so `a + 0.625·b` is exact in integers (V21→V22 multiplies every stored numerator
  by 8, byte-identical otherwise); per-Lab receipt rows `{laboratoryFacilityId, seatTalentIds, spend, rawUnits}` under each
  week receipt with the project credit `units`; project `laboratoryFacilityId` stays the home Lab (first seat), seats carry
  their own Lab; a person holds one seat across all projects; two operational Labs per studio, third refused.
- Provisional tuning (companion §4, not Owner-approved balance): 0.625 second-Lab factor (equal full Labs → 13/16 → 9.75),
  proportional per-Lab funding with whole-dollar remainder to the lowest stable Lab id, $10k usable per seat, 4 seats/Lab.
- Proposed product choices left uncoded: exact R07 production/Set recipe (Future Ops R2); large-stage body (K4); R02.
  **Amended 2026-09-16:** the R07 recipe is ADOPTED by Current Ops (OPS-P13B-R07-DISPOSITION-20260916-01, adopting Future Ops `P13B-R07-PRODUCTION-CLARIFICATION.md` at `e529c10f`, blob `77cf8211`) as the bounded **S5-R07 consumer task** below; the large-stage body (K4), CAT-011 oversized Sets and companion A12 stay OPEN with their own owners; R02 unchanged.

**Tests (requirement-derived; each fails before its implementation).**
1. Catalogue: two entries, stable order, acyclic prerequisites, reachable physical targets (module blueprint on a Lab,
   stage installation, nullable Post); `knownTechnology` accepts both; one project per (studio, technology).
2. Module/bench law: lighting research refused in a Lab without an operational electrical/control module (and while its
   installation runs); sound and lighting active in one Lab on different benches within four seats total; the bench claim
   is released on pause/cancel and rechecked on resume. Seating itself does NOT require the module (retained P13A law,
   `tests/p13a-research-identity.test.ts`: seats may be assigned before instruments exist; the project stays paused);
   begin/resume/weekly eligibility do. Seat slots are numbered per Lab across ALL active projects (stable project-id
   order), so two technologies in one Lab never double-book a slot and the four-seat cap counts every project's seats.
3. Two Labs per project: seats on a second operational Lab accepted (S1's refusal retired), third Lab refused, four per
   Lab, one seat per person across projects; per-seat Lab identity on the wire of the receipt.
4. Cooperation arithmetic: equal full Labs at $80k → 9.75/week, 7 funded weeks, R&D 560,000; $40k over 8 seats → spend
   40,000 split 20,000/20,000 → 8.125/week; 4 + 2 seats at $60k → spend 60,000 split 40,000/20,000, output 6 + 0.625·3;
   remainder by stable Lab id for an odd split; fixed-point exactness at every receipt (no float drift).
5. Document 03 [780,832): two Labs with both modules operational at 780, eight people on 208-week contracts hired at
   780 — cooperate sound then light (knowledge 787 / 794, R&D 1,120,000), split (791 / 791, 880,000), residual light
   (52 units done) cooperate (787 / 789, 720,000) and split (791 / 782, 520,000); idle person-weeks as stated; payroll,
   employment overhead and Lab/instrument operating charges reconcile to the ledger by kind.
6. Expiry/rehire across Labs: a lapsed seat on the second Lab drops b only; the home Lab is unaffected.
7. Conservation, determinism, save/reload, campaign isolation and validator refusals for the new facts (forged per-Lab
   split, receipt naming a Lab without the module, third Lab, fifth seat on one Lab, units not matching `a + 0.625·b`).
8. V21→V22: every S1 fixture and the three legacy V20 fixtures migrate (×8 numerators, empty per-Lab rows for legacy
   receipts is NOT allowed — S1 receipts gain their single-Lab row from the seat's Lab); `migrateToV21` refuses V22.

**Allowance (plan):** 10 h capability, 3 h verification.

**Corrections and additions (Current Ops R07 disposition, 2026-09-16 — `OPS-P13B-R07-DISPOSITION-20260916-01`, packet SHA256-verified; adopts Future Ops clarification §§2–6).**
- Residual comparison horizon is **[789,841)**: lawful prehistory eight funded four-person weeks (48 units, $320,000) plus one zero-ceiling week
  (4 units) = 52 verified at 789; residual knowledge sound/light **796/798** (cooperate then lighting) and **800/791** (split); within-horizon
  R&D **$720,000 / $520,000**, difference $200,000 preserved; prior signing and prehistory costs are sunk and never charged in that window.
  Full-project horizon stays [780,832); the Post-onset +$12,000 correction stays separate; the $209,000 / $253,000 all-in figures remain
  conditional paper results (S5 deployment assumptions), not runtime totals proved by S2. `tests/p13b-s2-doc03.test.ts` already asserts the
  corrected dates and spends (finding recorded at T5).
- **Material S2 finding — access identity (disposition §5):** `advanceResearchWeek`'s completion guard `access.some(a => a.studioId === p.studioId
  && a.acquiredWeek !== null)` and pending selector `access.findIndex(a => a.studioId === p.studioId)` omit `technologyId` (source-confirmed at
  877aad5; unchanged by T4–T6). Acquired access to one technology suppresses the other's grant and can remove an unrelated pending row. S2 is
  **not** labelled verified while this defect stands; the matched pass on 877aad5 keeps its applicability as evidence of everything else.
- **Repeated cancel/restart** is lawful (one resumed instance, no lifetime quota) — see the S1 note above.
- S5 must generalize `finishTechnologyWeek` and the shared adoption validation per technology (target identity, prototype accounting); lighting
  never satisfies synchronized-sound requirements and needs no Post; not S2's.

### S2 tasks

- [x] **S2-T1 Catalogue + parameters:** test 1; `TECHNOLOGY_CATALOGUE` two entries; per-technology work/dates/costs read
      from the entry (retire hard-coded `SYNCHRONIZED_SOUND.*` reads in the scheduler/validator where the project's
      technology decides); new blueprints in `tuning.ts`.
- [x] **S2-T2 Modules/benches:** test 2; `laboratoryRefusal` per discipline; bench claims in occupancy/presence.
- [x] **S2-T3 Two-Lab seats:** test 3; command + validator bounds.
- [x] **S2-T4 Cooperation scheduler + V22 (2026-09-16 ≈18:40, commit `5564542`):** tests 4, 6, 7, 8 GREEN (5/5, 3/3, 15/15, 12/12); per-Lab
      funding split (floor, remainder to the lowest stable Lab id), `units = 8·raw_a + 5·raw_b` over 1/160,000 with one code path shared by
      scheduler and validator, receipt `labs` rows, technology root v3 + `cooperationFromWeek`, frozen `validateTechnologyV2`, honest
      `liftTechnologyV2` (single-Lab receipts derive their one row; a two-Lab single-pool receipt lifts to `labs: null`, valid only before
      `cooperationFromWeek`), Save V22 + downgrade guards; three genuine V21 fixtures minted at the last V21 writer `e68de38` (`e24c860`).
      RED evidence: cooperation `evidence/p13b-s2-20260916/04-t4-red-confirm`; tests 5–8 at e24c860 before T4 `09` (35 failed | 12 passed of 47 —
      the 12 are determinism / isolation-by-construction / provenance checks that hold under either law). Law detail resolved in-contract:
      `cooperationFromWeek` bounded `[0, market.tick]`, decoupled from `recordingStartedWeek` so each forgery keeps its own refusal.
- [x] **S2-T5 Document 03 fixtures (delivered inside tests 5–8, same commit):** test 5 `tests/p13b-s2-doc03.test.ts` 17/17 through the
      existing `p13bTwoLabWorld()` plus the additive `p13bTwoLabWorldWithEarlyHire(earlyWeek)`. Test-author findings recorded in the file and
      here: (a) the residual fixture runs its lawful nine-week prehistory from 780 (lighting opens 780), every date = document + 9, every
      route-to-route difference unchanged (R&D deltas 240,000 full / 200,000 residual; idle person-weeks 304/328/344/364 exact); (b)
      `overhead` and `facilityOpex` are whole-studio ledger rows (`src/core/tick.ts`) and the generated world carries other staff and
      facilities, so 624,000 / 728,000 are proved as paper arithmetic against the real TUNING/blueprint constants plus a lower bound on the
      ledger, not as an isolated ledger sum; (c) test 6 case B: a lapsed seat on a still-active multi-seat project rehires under S1's
      existing law (no new seat row, no resume needed) — only a sole-seat lapse auto-pauses; the brief's wording was corrected to the tested
      law; (d) `weeklyResearchPayroll(state, pastWeek)` cannot answer once the expired contract row is gone — tests read the permanent
      `researchPayroll` ledger row instead (finding, not a defect); (e) no public action creates a rival research project, so isolation is
      proved by construction plus a structurally injected rival row (same technique as `p13b-s2-labs`).
- [x] **S2-T6 Bridge (projection 34; 2026-09-16 ≈19:40):** `StudioLaboratoryPage.projects[]` (`StudioLaboratoryProject` with per-project seats
      carrying `laboratoryFacilityId`, receipts with `labs` rows or honest `null`, weekly quote with per-Lab shares and `units`,
      `cooperationLabel`), assign rows `assign-<lab>-<person>-<technologyId>` with `technologyId` in the intent, per-project
      begin/resume/pause/cancel/budget rows with catalogue names, budget presets extended to 60,000 / 80,000 (gap found by the bridge test:
      no published row could fund a two-Lab project at its usable ceiling), top-level S1b members retained (superseded for the binding).
      schemaId `sha256:eeebeede…`, contract sha `9ef5d064…`, checks verified. Coordinator correction to its own T6 contract: the
      researchable-week gate on assign rows broke the retained P13A law (`bridge-p13-laboratory` seats at week 12 for sound, opening 260);
      the engine has no such gate (only `researchPrerequisiteRefusal` on begin/weekly), so the page now publishes every open brief, enabled as
      the engine's dry run decides, and dates the wait on the row ("Research opens <date>; the seat waits until then."). Test
      `tests/bridge-p13b-s2-labs.test.ts` 10/10 (RED baseline not capturable for this file — T6 landed mid-authoring; its earlier two failures
      were the author's regex formatting), `bridge-p13b-s1b-seats` 8/8 with real values for the new members, `bridge-p13-laboratory` 7/7 after
      the gate removal; projection pins moved 33 → 34 in eleven files. Evidence `10-t6-*`, `11-t6-*`, `12-*`, `13-*`.
- [x] **S2-T7 Affected suites, records, commit, push (closed 2026-09-16 ≈21:20 with T8):** matched full pass on `877aad5` (`evidence/p13b-s2-20260916/14-RUN`, `14-test-core-877aad5`
      core 227/234 files · 2716/2738 tests, 42.5 min; `15-test-bridge-877aad5` 54/57 · 560/573, 20.2 min; contract checks verified). Failing
      set = the inherited set (campaign-library 11 × 5/20 s budgets, campaign-isolation 60 s inline budget vs 72.1 s body, `p13a-scientist-
      foundation` 3 digests byte-identical to the pin, r3n1 ENOENT 6, scenery Pillow 1) **plus one pre-existing nondeterministic test**:
      `bridge-founding` "emits the exact founding action at Core coverage" asserts a fixed role sequence on a runtime created with a random seed
      (`BridgeSession.createRuntime()` defaults to `randomUUID()`), received 'actor' for 'director' once; 6/6 solo on the identical source and
      green in both earlier matched runs — disposition owed to the bridge test owner (seed it), not S2's. Closeout label withheld pending S2-T8.
- [x] **S2-T8 Access identity (disposition §5; RED `cfa6f71` 7 failed | 1 passed → GREEN `c8ef3b2` 8/8; negative cases for the new refusal being added by the test-author):** test-author adds `tests/p13b-s2-access-identity.test.ts` RED on the unchanged candidate (sound→
      lighting, lighting→sound, simultaneous completion order-independent, unrelated pending/completed access survives, save/reload and later
      ticks, idempotence, retained same-technology rules, exact provenance); sim-core fixes the shared identity to the exact `(studioId,
      technologyId)` pair and checks related consumers; targeted verification = S2/access/save/P13A boundary suites + the bridge Laboratory
      files; before/fix/after evidence; then the S2 closeout label and the records.

## S2 — original scope record (superseded by the expansion above; kept verbatim)

Add the second catalogue entry `lighting-control-01` (researchable 780, commercial 936, 64 units, P2,
electrical/control module blueprint $350k/5 weeks/+$2k weekly, provisional tuning), Lab module claims (one
active project per discipline bench per Lab), seats across two Labs per project, the unequal-team output
rule `a + 0.625·b` (equal full Labs → 9.75), proportional per-Lab funding with whole-dollar remainder by
stable Lab id, document 03 allocation fixtures reproduced through the real scheduler. Requires S1.
Allowance: 10 h capability, 3 h verification. Product choice recorded, not coded: the exact R07 demanding
lighting-setup production recipe (Current Ops named pre-execution clarification).

## S3 — Persistent physical plans, dependencies and admission (Ready row 3) — task expansion (amendment 2026-09-16)

**Authoritative sources.** Companion `02-P13B-DECISIONS-AND-ACCEPTANCE.md` §6 (queue policy: persistent ordered plans with exact
campaign/studio/target/project ids, dependencies, approved maximum debit, scope/components, earliest start, admission mode; default
**review changed quote**; a queued plan reserves nothing; cycles / missing targets / impossible prerequisites refuse admission; a cancelled
prerequisite blocks dependents and never counts as completion; reordering revalidates; Save As preserves plan/entity ids inside its own
independent authority; exact quote fingerprint/revision and at-most-once commit receipt survive retry; no global cache keyed only by entity
id), §5 row 3 + acceptance A4/A11, REF-F/REF-W/REF-B, and the weekly ordering "commit reviewed actions → admit queues in stable order while
decrementing the actual cash/resource envelope → accrue research/recurring → complete P09 work on arrival → capability → receipts; newly
completed research may enable a queue only at the next admission boundary, never spend twice within the prior tick" (all at
`673f49835404e262ea651b4fcb8fda5e259d80a6`). Precedent in this engine: the C2a-M4 production queue (`src/core/queueAdmission.ts`,
`actions.ts` `queueAdmitted`/`queueIntentExpired`): a queued intent is revalidated at dequeue, nothing is held while queued.

**Scope.** P09 physical work only: body placements (`quoteForBlueprint`/`commitPlacement`) and facility installations
(`queryFacilityInstallation`/`commitFacilityInstallation`) — Laboratory bodies, `acoustic-instruments`, `electrical-control-instruments`,
`synchronized-sound-stage`/`-post`, `lighting-control-stage`. Research projects are never queued (S1/S2 explicit-action law). Office
conversion routes are S4; component receipts/restoration are S5/S6. Plans are per studio and symmetric (rivals get the same root; S8 uses it).

**Delegated implementation decisions (recorded here, not Owner product choices).**
- New root `state.physicalPlans = {version: 1, nextPlanId, plans: PhysicalPlan[]}` in **Save V23** (V22→V23 adds the empty root; nothing
  invented; `migrateToV≤22` refuse V23; `validateSaveV22` frozen as the V21 pattern). Genuine V22 fixtures are minted at the last V22 writer
  BEFORE any S3 source change (S2 lesson).
- `PhysicalPlan = {id: '<studioId>:plan:<n>', studioId, ordinal, queuedWeek, work, dependsOn: string[], approvedMaximumDebit, earliestStartWeek,
  admission: 'reviewChangedQuote' | 'automatic', approvedQuote: PlanQuoteSnapshot, pendingQuote: PlanQuoteSnapshot | null, status: 'queued' |
  'held' | 'blocked' | 'started' | 'cancelled', statusWeek, reason: string | null, startedPlacementId: number | null, commitReceipt: {week,
  fingerprint, cost} | null}` with `work = {kind:'placement', blueprintId, origin: LotCell} | {kind:'installation', blueprintId, target:
  {facilityId} | {planId}}` (an installation on a queued body names the body's PLAN id; the facility id is resolved and recorded at start).
- `PlanQuoteSnapshot = {fingerprint, cost, buildWeeks, weeklyOperatingCost, components: {label, cost, weeks}[]}`; the **quote fingerprint** is a
  pure deterministic digest (existing core digest helper, no new dependency) over blueprint id, exact target, cost, buildWeeks,
  weeklyOperatingCost and the component list — the completion week is excluded (it moves every week and is not a scope or price change).
  Exported from `placement.ts` as the P09 quote fingerprint the Ready row names.
- Admission runs once per tick at the admission boundary: after the week's reviewed actions, BEFORE `advanceResearchWeek` and before P09
  completions of that tick, in stable (ordinal) order, against a running cash envelope decremented by every admitted commit. A plan is admitted
  when: status `queued`, `earliestStartWeek ≤ tick`, every `dependsOn` plan is `started` with an operational placement, the fresh P09 quote
  has no rejection, cost ≤ `approvedMaximumDebit`, cash covers it, and — `reviewChangedQuote`: fresh fingerprint equals `approvedQuote.fingerprint`;
  `automatic`: blueprint, target and component labels unchanged and cost ≤ ceiling. Admission calls the SAME P09 commit the front door uses
  (identical placement record and ledger row as a hand commit that week) and writes `commitReceipt` exactly once. A changed quote under
  `reviewChangedQuote`, or a quote above the ceiling / with a live rejection under either mode, sets `held` with `pendingQuote` and a reason;
  insufficient cash leaves the plan `queued` (retried next boundary; the reason is a derived view, not persisted). A cancelled predecessor sets
  each dependent `blocked` naming it. Nothing is reserved before start: a queued plan changes no cash, burn, capacity, engagement or slot.
- Actions: `queuePhysicalPlan {work, dependsOn, approvedMaximumDebit, earliestStartWeek?, admission?}` (refuses unknown blueprint/target/plan
  ids, self/cyclic dependencies, dependencies on cancelled/blocked plans, incompatible target capability, negative or non-integer ceiling;
  snapshots the current quote as `approvedQuote` — a quote with a live but changeable rejection, e.g. `targetEngaged`, is still queueable);
  `reorderPhysicalPlans {planIds}` (full permutation of the studio's non-terminal plans; refused if any plan would precede one it depends on);
  `cancelPhysicalPlan {planId}` (queued/held/blocked only; dependents → blocked); `reviewPhysicalPlan {planId, approvedMaximumDebit}` (held →
  queued with `pendingQuote` promoted to `approvedQuote`); `setPhysicalPlanAdmission {planId, admission}`. History rows (studio history, existing
  mechanism): planQueued / planStarted / planHeld / planBlocked / planCancelled with week and reason.
- Validator: ids monotonic under `nextPlanId`, ordinals unique per studio, `dependsOn` in-studio and acyclic, lawful statuses and weeks, started
  plans reference an existing placement with the same blueprint and resolved target, one plan per started placement, `commitReceipt` present
  exactly for started plans, fingerprints well-formed, campaign isolation (a plan never names another studio's target or plan).
- Bridge (projection 35, text only): `view: 'plans'` industry page (`StudioPlansPage`: rows with status, reason, approved vs pending quote,
  dependencies, ordinal; intents queue/cancel/review/reorder/setAdmission; a "Review changed plan" row shows the old and new quote side by
  side) and `queue-<row>` companions beside the Laboratory page's immediate `instruments-<lab>` row and the electrical module route; Back
  preserves order (read model only; no reservation). Player-safe.

**Tests (requirement-derived; each fails before its implementation).**
1. Admission law: a queued acoustic installation starts at the next boundary through the existing P09 commit — placement record, cost,
   completesWeek and ledger row identical to a hand commit that week; `commitReceipt` once; `earliestStartWeek` in the future waits; cost above
   the ceiling holds with a reason naming both numbers; `automatic` within the ceiling starts.
2. No reservation: a queued plan changes no cash, `weeklyBurn`, capacity or engagement; two plans on one target/plot — the second starts only
   when the first no longer engages the target; cancelling a queued plan leaves the state byte-identical except the plan row and history.
3. Dependencies: an installation on a queued body resolves the facility id at start and waits for the body to be operational; self/cyclic/unknown
   dependency refused at queue time; dependency on a cancelled plan refused; cancelling a predecessor blocks dependents with an explanation and
   never counts as completion; reorder placing a dependent before its dependency refused; lawful reorder persists ordinals.
4. Changed quote: identical quotes give identical fingerprints across weeks (completion week excluded); a persisted `approvedQuote` that no longer
   matches the live quote (fixture with a forged snapshot — the honest way to produce drift in a constant-tuning engine, recorded as such) holds
   under `reviewChangedQuote` and starts under `automatic` only when scope is unchanged and cost ≤ ceiling; `reviewPhysicalPlan` re-approves.
5. Ordering and envelope: two plans with cash for one — the first starts, the second stays queued with no partial debit; research accrual in the
   same tick sees the post-admission cash (its "insufficient cash" bottleneck fires when the admission consumed the margin); a dependency
   completing in week w enables its dependent at w+1's boundary, never within w.
6. Conservation, determinism, replay, history: admitted commits reconcile to the ledger exactly as hand commits; same actions → same bytes;
   history rows with weeks and reasons; rival symmetry (a rival studio's plan list is validated by the same law).
7. Save V23 + Save As: genuine V22 fixtures migrate with an empty root (byte-identical otherwise); `migrateToV22` refuses V23; save/reload
   mid-queue continues identically; a campaign-library Save As copy keeps the same plan ids and advances independently (A11).
8. Validator refusals: forged cycle, unknown dependency, ordinal collision, started plan without placement, duplicate commit receipt, a plan
   naming another studio's target, non-integer ceiling.
9. Bridge (projection 35): plans page rows and intents through the session, "Review changed plan" old-vs-new quote, `queue-` companions on the
   Laboratory page, stale-revision refusal, player-safe.

**Allowance (plan):** 8 h capability, 3 h verification.

### S3 tasks

- [ ] **S3-T0 Genuine V22 fixtures** minted at the last V22 writer before any S3 source change (coordinator; provenance beside them).
- [ ] **S3-T1 Types, fingerprint, actions, validator:** tests 3, 8 and the queue-time parts of 1/4 (sim-core; test-author writes 1–8 RED first).
- [ ] **S3-T2 Admission in `tick`:** tests 1, 2, 4, 5, 6 (ordering boundary, envelope, history).
- [ ] **S3-T3 Save V23 + migration + Save As:** test 7.
- [ ] **S3-T4 Bridge projection 35:** test 9 (`tests/bridge-p13b-s3-plans.test.ts`).
- [ ] **S3-T5 Affected suites, records (backlog entry), commit, push.**

## S3 — original scope record (superseded by the expansion above; kept verbatim)

## S3 — Persistent queues/dependencies/admission (Ready row 3) — scope record

Ordered plans with exact ids, dependency graph, approved maximum debit, admission mode default "review
changed quote", no reservation before start, cycle/unknown/impossible refusals, cancelled-predecessor
blocking, save/reload and Save As independence. Requires S1 and the P09 quote fingerprint. Allowance: 8 h
capability, 3 h verification.

## S4 — Direct gap-aware conversion/purchase (Ready row 4) — scope record

Office I→III direct ($1.25m/16 weeks), II→III ($850k/8), I→II ($500k/4) as candidate O1 tuning; new III
without II prerequisite is a proposed product choice for disposition and is not coded until disposed;
retained body Opex, standard increments only while operational, existing assessments unchanged.
Allowance: 6 h capability, 2 h verification.

## S5 — Component inventor pricing/prototypes (Ready row 7) — scope record

Access/equipment/site/installation/capture/Post components per technology; first prototype covers one
equipment set; later inventor equipment at the 25% concession (sound $225k, lighting $150k); no negative
line; entitlement scoped by campaign/studio/technology/project. Requires S2. Allowance: 6 h / 2 h.

**S5-R07 consumer task (named 2026-09-16 by `OPS-P13B-R07-DISPOSITION-20260916-01`; sequenced AFTER S5 supplies the real per-technology
access/equipment/site/installation/operational chain; full task expansion — touched producer/consumer paths, migration/projection plan,
requirement tests, effort forecast, Unity backlog — is written before it begins, as the existing delegated expansion, not a new gate).**
- Adopted recipe (candidate tuning, not final balance): production-plan recipe `ballroom-reveal-lighting-01` ("Ballroom reveal — foreground,
  entrance and background lighting cues") selected through a reviewed production-plan action (semantic name `setProductionSetupRecipe`; final
  naming delegated) bound to an exact production and plan revision; requires a usable standing `grand-ballroom` Set mounted on the reserved
  operational soundstage with valid size fit. Setup units: Ballroom reveal **4 conventional / 2 with operational R07 on the exact bound stage**;
  ordinary single-zone interior (`generic-interior` / `apartment-interior`) **1 / 1**; legacy productions without a setup-plan record keep their
  existing schedule. One setup unit = one eligible production-work week (provisional). The same recipe cannot skip its preparation by being
  called ordinary; a simpler scene is a different, revalidated plan; no quality/appeal reward.
- Work owner: extend production operations (`advanceManagedProductions`, phase admission, exact stage/Set bindings) with a bounded setup subtask
  after normal rehearsal and before Shooting for new explicitly planned productions; `remainingTicks = 6` / rehearsal retained while the gate is
  open; the shared phase/validation owner recognizes the substate; at most one unit per eligible `[w,w+1)`, none on selection/queue/load/retry/
  second sweep visit; admission at w earns its first unit at w+1; preserve sweep order, stage-release law and the 8-tick table; no second job
  scheduler, surcharge, duplicate payroll, universal refund, global multiplier or instant retrofit discount on partly worked setup.
- Gate for the 2-unit route: the same studio's lawful `lighting-control-01` access + supplied equipment + completed non-cancelled P09
  `lighting-control-stage` fit-out on the exact bound stage + operational adoption. Knowledge alone, the Lab module, a different stage, unfinished
  installation and cancelled/restoring equipment do not qualify. Lighting needs neither synchronized sound nor Post. Recipe/workload/equipment
  provenance fixed at setup admission; the sound lock stays at actual Shooting entry; setup completes no take and satisfies no P14 promise;
  same-binding continuation retains work; a changed stage/Set/recipe needs a new physical setup with prior work preserved in history.
- Evidence and tests: bounded live + terminal witnesses through the production/history owner (production/recipe/version/stage/Set ids,
  adoption reference or explicit conventional route, work week, credited/cumulative units); matched example at setup-ready 820: completion
  **824 vs 822** (ordinary 821 both routes); controls: legacy timeline unchanged, wrong Set type/size refused, knowledge-only / Lab-only /
  wrong-stage / active-retrofit / cancelled-installation no discount, occupied-stage competition, changed pre-Shooting sound choice, save/reload,
  different-binding restart without recycled work, same-week retries, completed-task idempotence, Save As worlds, no filming/quality/research
  change; a forged operational flag is not proof. Versions: the next governed save/projection versions at execution — never S3's V23/35 or a
  reused number with different semantics; genuine earlier fixtures minted before the writer moves.
- Retained separately, OPEN with owners and return conditions: CAT-011 oversized Sets, the K4 large-stage body/footprint/pricing, companion A12
  refusal/acceptance; legacy bodies receive the neutral standard classification without invented setup history. S6 must exercise cancellation/
  restoration eligibility against this consumer; S8 must bind comparable rival behaviour through real rival producers before claiming symmetry.
  A standard-stage R07 pass cannot close A12 or all of P13B. Future recipe-review → setup → Shooting → take → result journey, client bindings,
  readable waits and art stay in `UNITY-INTEGRATION-BACKLOG.md`.

## S6 — Option-B installation cancellation (Ready row 6) — scope record

Component quantity/progress/cost receipts; completed work paid, unstarted refundable once, delivered
equipment retained, restoration job ($25k/2 weeks sound, $10k/1 week lighting, candidate), same-tick
completion ordering, cross-year refund bucket. Requires S5. Allowance: 8 h / 3 h.

## S7 — Forecast/replacement disclosure (Ready row 5) — scope record

Public milestone facts only; R07 distant window 884..988 narrowing on public announcement at 884 to 936;
no private rival research exposure; replacement descriptors on purchase. Requires S2. Allowance: 4 h / 2 h.

## S8 — Symmetric rival research and finance (Ready row 8) — scope record

Receipt-backed rival Lab construction/instruments (≤2 Labs × 4 seats), same law as players, reserveWeeks
policy, typed rival ledger kinds (`researchSpend`, `researchCapacity`, `technologyRestoration`,
`technologyRefund`), interval Opex, migration basis frozen at the migration week, legacy zero-Opex
grandfathered. Requires S2, S5, S6. Allowance: 12 h / 4 h.
