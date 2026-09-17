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
- [x] **S2-T8 Access identity (disposition §5; RED `cfa6f71` 7 failed | 1 passed → GREEN `c8ef3b2` 8/8; negative cases `20-t8-access-identity-negative` 14/14 — four forged states refused with `completed research without its access grant`, purchase-row control accepted):** test-author adds `tests/p13b-s2-access-identity.test.ts` RED on the unchanged candidate (sound→
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

- [x] **S3-T0 Genuine V22 fixtures (2026-09-16, `e27f4af`):** `legacy-v22-staffed-4-seats-263`, `legacy-v22-two-labs-cooperating-782` minted at the
      final V22 writer (`d597e94`, engine `c8ef3b2`); provenance with sha256 beside them.
- [x] **S3 tests 1–8 RED (test-author, 2026-09-16 ≈22:30):** `tests/p13b-s3-admission|dependencies|save-v23|validation.test.ts` +
      `tests/bridge-p13b-s3-save-as.test.ts`, harness `src/harness/p13b/s3-fixtures.ts`; RED for one cause each (`evidence/p13b-s3-20260916/21-red-*`:
      four at module resolution of `src/core/physicalPlans.js`, the bridge one at `applyActions: unknown action kind queuePhysicalPlan`).
      Methodological finding recorded: vite binds a MISSING named export from an EXISTING module to `undefined` instead of failing the import, so a
      RED-first file must import from a not-yet-existing module (or call the missing binding) — the validation file's first run had one spurious
      pass from an unrelated "unknown field" message matching `/unknown/`; fixed before reporting. Contract gaps resolved as delegated decisions
      (in the sim-core brief): types in `src/core/types.ts`; `target:{planId}` implies the dependency (normalized into `dependsOn`); queue-time
      cycle refusal covers self-edges and unknown ids, the validator defends forged cycles; reasons use `money()`; cancel blocks dependents
      synchronously; admission is tick step 1.06 after the production-queue admission (1.05) and stamps the ARRIVED week (`currentTick + 1`)
      exactly as that precedent; `physicalPlans` is threaded through the exact-key validator chain as `technology` was.
- [x] **S3-T1/T2/T3 engine increment (sim-core, 2026-09-16 ≈23:10; committed ≈23:30 with the five S3 files 54/54 after the test amendments, `23-amended-*`, coordinator fresh run `25-*`):** `src/core/physicalPlans.ts`
      (root, quote snapshots, admission view, admission, validator, five action handlers), fingerprints in `placement.ts` (FNV-1a-64 over canonical
      JSON, no dependency), tick step 1.06 after the production-queue admission with the arrived-week stamp, history rows (five kinds, not on the
      wire until T4), Save V23 (`SaveFileV23`, `validateSaveV23`, `convertV22ToV23`, `migrateToV23`, ten downgrade guards, "1 through 23"),
      consumers to V23, live-version sweep 22 → 23 (57 test/ui files + 4 consumers; sentinel 24), `physicalPlans` threaded through the exact-key
      chain as `technology` was. Results: validation 12/12, save-v23 13/13, dependencies 11/11, admission 13/17, save-as 0/1 → the five failures
      adjudicated as test premises (`22-engine-conflict-probes`): a fixture's pre-existing capex row; the second plan on one target starts the
      boundary AFTER the first completes (admission before completions, plan law); direct `studio.cash` edits break the ledger invariant and the
      electrical module cannot target a Lab with active research; the Save As test ignored a refused `load` (`requireClean`); a baseline
      `statusWeek` ahead of its world. Test-author amends its own files (evidence `23-amended-*`); the engine law stands.
      **Delegated decisions resolved by sim-core (recorded, accepted):** no persisted `resolvedTargetFacilityId` (derived helper, 16-key row);
      `earliestStartWeek` strict against the arrived week (= the plan's `≤ currentTick`); held plans are re-evaluated every boundary and start
      without review only when the live quote again equals the approved quote and every condition holds (only reading under which a
      `targetEngaged` hold can ever clear); admission is player-only until S8 supplies rival physical-commit authority (rival rows validated by the
      same law); campaign isolation enforced at the plan identity (no per-studio facility root exists to check a target against — limitation);
      `migrateToV23` accepts a parsed envelope. **Coordinator correction:** sim-core had loosened `statusWeek`/`commitReceipt.week` to `≤ tick + 1`
      to accept the unlawful baseline; reverted to `≤ tick` (the validator runs at the save boundary, where the arrived-week stamp is `≤ tick`).
      Sweeps (`22-engine-*`): S2 87/87, S1 + bridge-P13B 52/52, P13A 62/65 (+3 inherited digests), bridge-P13 16/16, campaign-isolation solo 72.3 s,
      save sweep 78 + 180 + 83 + 109, placement/queue 153/153, owners 66/66, corpus/frozen 115/115 (M0A corpus byte-identical), bridge checkpoint
      91/91, projections 32/32, contract checks verified, consumer lock 77/77; coordinator recheck (`24-*`): S2 + save boundary 90/90, tsc root/ui clean.
- [x] **S3-T4 Bridge projection 35 (2026-09-17 ≈00:10):** `view: 'plans'` (request and response), `StudioPlansPage`/`StudioPlanRow`/`StudioPlanQuote`/
      `StudioPlanQuoteComponent`/`StudioPlanNext`/`StudioPlanCommitReceipt`, plan actions (`plan-cancel|review|admission|move-up|move-down-<planId>`),
      Laboratory `plan-queue-acoustic|electrical-<lab>` companions with a visibility rule (hidden once that module has a committed placement on
      the Lab in any status or a queued/held/started plan already targets it — coordinator addition after the bridge test's case 2), five
      history kinds on the wire, intent kind `physicalPlanAction` (honest wire kind; `researchAction` precedent). schemaId `sha256:889c83c6…`,
      contract sha `4ea3b9d0…`, checks verified. `tests/bridge-p13b-s3-plans.test.ts` RED 11/11 at 30836b0 (`28`) → 11/11 (`26-t4-*`, coordinator
      fresh `29`: plans + laboratory + s2-labs 28/28, tsc bridge/root clean); pins moved 34 → 35 in thirteen files; `bridge-p13-laboratory` case 1
      widened its page size by exactly the two new rows. Body-placement queueing has no bridge affordance yet (needs the lot/placement quote
      surface; recorded as future work, not S3's).
- [x] **S3-T5 Matched pass, records, commit, push (2026-09-17 ≈01:15):** matched full pass on `c18abe8` (`evidence/p13b-s3-20260916/30-RUN`,
      `30-test-core-c18abe8`: core 229/241 files · 2765/2805 tests, 32.8 min; `31-test-bridge-c18abe8`: 57/59 · 573/585, 19.9 min; contract checks
      verified). Failing set = the inherited set (campaign-library 11 × 5/20 s budgets, campaign-isolation 60 s inline budget, `p13a-scientist-
      foundation` 3 digests byte-identical to the pin, r3n1 ENOENT 6, scenery Pillow 1; `bridge-founding` green this time — random seed) **plus
      one S3-caused harness failure**: five `roster-wall-*` files (18 tests + 1 file-level) failed "SaveFileV18 replay changed entry state" because
      `historicalHashState` (the V18 observatory's hash projection) strips the `hollywood`/`technology` roots that later versions add but had not
      been taught the new `physicalPlans` root. Harness fix (guard + strip, mirroring the technology guard) on top of c18abe8; targeted rerun on
      the fixed source `32-*`: roster-wall 5 files 36/36, root tsc clean (S1 precedent: post-pass edits reverified by their affected suites). No
      engine law changed after the pass. Backlog S3 entry written; S3 row closed.

## S3 — original scope record (superseded by the expansion above; kept verbatim)

## S3 — Persistent queues/dependencies/admission (Ready row 3) — scope record

Ordered plans with exact ids, dependency graph, approved maximum debit, admission mode default "review
changed quote", no reservation before start, cycle/unknown/impossible refusals, cancelled-predecessor
blocking, save/reload and Save As independence. Requires S1 and the P09 quote fingerprint. Allowance: 8 h
capability, 3 h verification.

## S4 — Direct gap-aware Office conversion (Ready row 4) — task expansion (amendment 2026-09-17)

**Authoritative sources.** Companion `02-P13B-DECISIONS-AND-ACCEPTANCE.md` §6 (Office scope follows catalogue §8 without charging obsolete II
as a hidden component; one body has independent work capacity and development standard; I→II $500k/4 w, II→III $850k/8 w, I→III $1.25m/16 w
as candidate O1; placed body retains its baseline Opex while offline; standard increments $2.5k at II / $4k at III only while operational; old
separately purchased II/III bodies remain real with their charges and zero extra capacity; highest operational standard is the producer rule,
not a cumulative bonus; already assessed scripts do not change; ENG-2: new-III-without-II prerequisite removal and the 4/8/16 durations still
require disposition; the Hall extension stays a separate real body; a true in-place extension is unimplemented and must be labelled
unavailable), §5 row 4 + acceptance **A5** (never-owned-II I→III, II→III, new III, old purchased bodies, only high-standard body offline: no
obsolete charge, direct 16 vs 8 weeks, no invented capacity, plot/downtime disclosed, no historical screenplay change), D4, REF-F/REF-N;
`03-PAPER-ECONOMICS.md` "Office gap conversion, 52-week matched horizon" (direct $1,250,000 + 36×$4,000 + baseline $286,000 = $1,680,000;
staged $1,350,000 + 40×$4,000 + $286,000 = $1,796,000; new III on another plot $1,200,000 + $160,000 + old $286,000 = $1,646,000; direct
saves $116,000 and delays III four weeks). All at `673f49835404e262ea651b4fcb8fda5e259d80a6`.

**Engine today.** `development-office-2` ($600k/8 w/$2.5k, `maxInstances: 1`) and `development-office-3` ($1.2m/12 w/$4k, requires II
owned, `maxInstances: 1`) are effect-only bodies (`capacity: 0`); the founding `development-casting-office` ($1.5m/14 w/$5.5k, capacity 2)
is a real work body; `facilityEffects.ts` picks the highest OPERATIONAL tier (`developmentOfficeEstUplift`, `officeTierAtMint` audit trail on
minted screenplays). No conversion exists.

**Scope.** In-place conversion of an existing development body's STANDARD through P09's installation arm ("office source-target work",
REF-F): the body keeps its identity, plot, footprint, capacity and baseline Opex; the conversion is a P09 installation on that body that takes
the body OFFLINE for its build (downtime), charges the standard increment only once operational, and makes the body count in the
highest-operational-standard ladder. Nothing else in the estate changes.

**Delegated implementation decisions (recorded, not Owner product choices).**
- Two installation blueprints in `tuning.ts`, target capability `development-casting`, no cells: `office-conversion-ii` ($500,000 / 4 weeks /
  +$2,500 weekly; requires the target body's current standard to be I) and `office-conversion-iii` (source-dependent quote: from I $1,250,000 /
  16 weeks, from II $850,000 / 8 weeks; +$4,000 weekly; requires standard I or II). Candidate O1 tuning, flagged not Owner-approved.
- **Standard is derived, not persisted:** `developmentStandard(state, facilityId): 'I'|'II'|'III'` = III if an operational
  `office-conversion-iii` targets the body, II if an operational `office-conversion-ii` does, else the body's own tier (standalone II/III
  bodies are II/III; the founding office and annex are I). `highestOperationalDevelopmentStandard(state)` replaces the two
  `hasOperationalBlueprint` reads in `facilityEffects.ts` (standalone bodies still count; nothing stacks); `officeTierAtMint` keeps its
  vocabulary (`'development-office-3'` for III, `'development-office-2'` for II) so historical screenplays and their audit trail are unchanged.
  No new save fields ⇒ **Save V23 stays** (new blueprint ids only; the placement-core order pin moves 15 → 17). If any persisted fact turns out
  to be needed, mint V23 fixtures first (S<n>-T0 rule) and allocate V24 — never reuse.
- **Offline while converting (new P09 fact, blueprint-declared `takesTargetOffline: true`):** while a conversion placement on the body is under
  construction, the body's slots are removed from the allocatable capacity (its `StudioFacility.capacity` contributes 0 to the operations
  registry; work already occupying the body is not evicted — a conversion is refused while any slot is occupied, exactly as `targetEngaged`
  refuses today), its effect does not count in the standard ladder ("taking the sole high-standard provider offline" — the quote discloses
  `standardDuringWork`), its baseline Opex continues (weeklyPlacementOperatingCost unchanged), and the conversion's own weekly cost starts at
  completion (existing first-charge-on-next-advance law). Lab modules keep their existing online behaviour (`takesTargetOffline` false).
- Quotes never include an obsolete II purchase (`components` list the conversion only); a never-owned-II studio quotes I→III directly;
  standalone new III keeps its `requires: development-office-2` (ENG-2 removal is an OPEN product choice — not coded; refusal unchanged);
  Hall unchanged; "in-place extension" is not offered anywhere (no fake quote).
- Commands: no new action kind — conversions go through the existing installation quote/commit pair (`queryFacilityInstallation` /
  `commitFacilityInstallation`) and through S3 plans (`work: {kind:'installation', blueprintId:'office-conversion-iii', target:{facilityId}}`),
  including chained I→II→III plans with `dependsOn`. Cancellation/restoration of a running conversion is S6 (Option B), not S4.
- Bridge (projection 36, text only): conversion quote rows on the surface that publishes a building's installation decisions (the Laboratory
  page publishes `instruments-<lab>`; the T-bridge brief first locates the equivalent surface for an office body — if none exists, add
  `view: 'office'` mirroring the Laboratory page: `convert-<placementId>-ii|iii` rows with cost, weeks, downtime, `standardDuringWork` and
  `standardAfter`, plus `plan-queue-convert-<placementId>-ii|iii` companions; a read member `developmentStandard` and `offline` on the body's
  row; player-safe).

**Tests (requirement-derived; each fails before its implementation).**
1. Quotes: I→II $500,000/4 w; I→III $1,250,000/16 w on a never-owned-II studio with components naming the conversion only; II→III
   $850,000/8 w on a converted-II body; staged sum $1,350,000 vs direct $1,250,000; refusals: target not a development body (`incompatibleTarget`),
   standard already at/above (`alreadyInstalled`-class refusal named for conversions), occupied slots (`targetEngaged`), insufficient funds;
   standalone III still refused without II (unchanged wording).
2. Downtime and money (document 03, 52-week horizon through the real ledger): direct I→III — 16 weeks offline (capacity 0 for the body, a
   script/casting request that needs the slot waits in the production queue and resumes after completion), baseline $5,500 continues every
   week, no increment until operational, then $4,000 × 36 = $144,000; total $1,680,000; staged I→II→III $1,796,000 with no interim II
   operation when the second conversion is committed at the first's completion; new III on another plot $1,646,000 with no old-office downtime.
3. Standard law: highest operational standard wins and nothing stacks (converted III + purchased II → III; both charged); old purchased bodies
   keep charges and zero capacity; converting the sole II-standard body to III drops the ladder to I during the work and the quote says so;
   screenplays minted before, during and after keep their `officeTierAtMint` and estimated strength (no retroactive change).
4. P09/S3 integration: the conversion is a normal placement record (fingerprint, commit, completion, `constructionCapex` row, facility history);
   S3 plans queue a conversion, hold it on `targetEngaged` while a slot is occupied, and admit it at the next boundary once free; chained I→II
   then II→III plans via `dependsOn`; occupancy/presence unchanged (no cells).
5. Conservation, determinism, save/reload (V23 unchanged: a save mid-conversion reloads and completes identically), validator refusals for
   forged conversion facts (a conversion on a non-office body; two operational conversions of the same standard on one body; a conversion whose
   target has no body), campaign isolation.
6. Bridge (projection 36): conversion rows with the disclosed downtime and standards, plan companions, `developmentStandard`/`offline` members,
   stale-revision refusal, player-safe.

**Allowance (plan):** 6 h capability, 2 h verification.

### S4 tasks

- [x] **S4-T0 (confirmed 2026-09-17 ≈01:20):** no persisted fact is added by the contract (standard and offline state are derived from ordinary placement records; the two conversion blueprints are installation blueprints), so Save V23 stays and no fixtures are minted. If sim-core finds a persisted fact unavoidable it must stop, mint V23 fixtures at `731b2d5` first, and allocate V24. Test-author dispatched for tests 1–5 RED (`evidence/p13b-s4-20260917/00-red-*`).
- [~] **S4 tests 1–5 RED (test-author, 2026-09-17 ≈01:45, `066ae6d`; `evidence/p13b-s4-20260917/00-red-*`):** all four files fail at module resolution of
      `src/core/officeConversion.js`; harness `src/harness/p13b/s4-fixtures.ts` (`s4BareOfficeStudio`: a bare-lot studio with a genuinely PLACED
      `development-casting-office`, because the endowed founding office is a property structure that pays no weekly opex — companion §6's "no
      invented base placement charge"; document 03's $5,500 baseline is therefore reachable only on a placed office). Adjudicated gaps (delegated
      decisions, in the sim-core brief): (a) standard increments are charged only while the body is online and only for its CURRENT standard, so
      the staged route lands exactly $1,796,000 (no II increment during the II→III work, none after III supersedes it); (b) document 03's standalone
      "new III on another plot" $1,646,000 presumes ENG-2 (new III without owning II), an OPEN product choice the plan does not code — the lawful
      engine route needs an operational II whose $2,500/week is real, so the test asserts $1,776,000 with the +$130,000 delta named as the ENG-2
      consequence; (c) `office-conversion-iii` carries one constant component label with source-dependent cost/weeks, so a chained I→II→III plan
      admits under `automatic` within its ceiling and holds under `reviewChangedQuote` for review; (d) refusal member `standardAlreadyMet`.
- [x] **S4-T1/T2 engine increment (sim-core, 2026-09-17 ≈02:15, commit `dba78d0`):** `src/core/officeConversion.ts` (derived standard, offline,
      `conversionQuote`), the two conversion blueprints (O1-candidate constants, constant component label, `takesTargetOffline`), source-dependent
      quotes in `queryFacilityInstallation`, `standardAlreadyMet`, offline registry capacity, increment law (only while online, only the current
      standard — a superseded II charges nothing), conversion validator invariants, historical reconciliation; Save V23 unchanged. Results:
      quotes 8/9, downtime 7/7, plans 3/4, validation 7/7 — document 03's direct $1,680,000 and staged $1,796,000 exact through the ledger; the two
      reds are fixture premises (an origin finder that only returns lawful placements; a base world with no player studio id) proved in
      `02-engine-conflict-probes` and returned to the test-author. Coordinator addition: `standardAlreadyMet` joined the plans module's queue-time
      permanent refusals (S3 plan files 40/40 after, `04`). Sweeps `02-engine-*`: placement 84/84, facility/construction 83/83, S3 53/53, P09/queue
      46/46, screenplay office tier 24/24, save boundary 68/68, d12 29/29, operations/calendar 45/45, catalogue/P13A 76/76 + 16/16, bridge 18/18,
      corpus/replay 50/50, campaign-isolation solo 79.0 s (inherited budget), P13A 3 inherited digests, contract checks verified, tsc clean.
      Recorded law generalizations: conversion spans/capex pairs must be authored pairs; registry capacity 0 allowed only for offline bodies;
      `checkOperationsContext` floor `>= 0` only under the placement-aware policy (frozen projections unchanged). Rivals have no P09 lot, so no
      rival conversion exists until S8.
      **Fixture fixes landed `95a6811` (28/28).** **Gap found by the test-author (2026-09-17 ≈02:40), open:** an offline body has registry capacity 0,
      and `occupancy.ts`'s installation claims iterate `0..capacity`, so a RUNNING conversion no longer engages its own body — a second conversion
      on the same body is not refused `targetEngaged` (both admitted in one tick). Law: a `takesTargetOffline` installation under construction
      engages its body for its whole span independent of capacity. RED cases pinned at `0b836a8` (`07-red-engagement-*`: quotes 9/10 — a live II quote on the converting body returned `ok:true`; plans 5/6 — the second plan `started` in the same tick), fixed in `src/core/occupancy.ts` (one body-level claim for an under-construction `takesTargetOffline` installation, keyed on the blueprint flag not on capacity; `facilityEngagements` folds it into the one named engagement; `08-engagement-fix-*` 222/222 across S4 30/30, S3 + placement 64/64, claim consumers 44/44, presence + demolish 51/51, c2a-m4 33/33, tsc clean; coordinator fresh `09` 26/26).
- [~] **S4-T3 findings (test-author, `tests/bridge-p13b-s4-office.test.ts` 7/9 against the in-flight page; ≈03:10):** (A) the running conversion's own
      row read `alreadyInstalled` where the contract said `targetEngaged` — adjudicated: the row carries the ENGINE's primary rejection
      (`rejections[0]`) plus a new full `rejections` list; the contract was over-specified. (B) plan-companion hiding was scoped to one blueprint —
      adjudicated to a reachable-standard rule: hide a companion whose own blueprint is committed/planned on the body OR whose target standard is
      ≤ max(current standard, every committed-in-any-status conversion's and every queued/held/started plan's target) — ii hidden while iii runs,
      iii still offered while ii runs (chaining is lawful). (C) immediate `office-convert-*` rows publish the honest intent kind `installationAction`
      (the Laboratory instruments row keeps `researchAction`: its engine action is a TechnologyAction). Additions sent to sim-core; test amendments
      to the test-author; RED baseline for test 6 captured from the pre-T3 commit `c2d27d1` after the amendments.
- [x] **S4-T3 Bridge projection 36 (2026-09-17 ≈03:40):** `bridge/office.ts` (new), `view: 'office'` on request and response keyed by facility id,
      `StudioOfficePage` (nullable `blueprintId` — the endowed founding office is a property structure, publishing a purchased blueprint there would
      claim a building never bought; `offlineUntilWeek` nullable; live registry `capacity`), `StudioOfficeConversionRow` (both rows always
      published; `rejections` = the engine's list, `refusal` = its primary with one presentation rule: a COMPLETED record's own row yields to
      `standardAlreadyMet`, a running one keeps `alreadyInstalled` — finding D), rows `office-convert-<facilityId>-ii|iii` (intent kind
      `installationAction`, bridge-local descriptor composed of P09's own quote/commit, refusal raised not swallowed) and
      `plan-queue-office-convert-*` under the reachable-standard visibility rule; schemaId `sha256:c2247716…`, contract sha `e0d44f46…`, checks
      verified; pins 35 → 36 in fourteen files. Test 6 RED 11/11 at `c2d27d1` (`10`) → 11/11 (`05-t3-bridge-s4-office`, `06-t3-*`; coordinator
      fresh `11`: office + s3-plans + laboratory 29/29, tsc bridge/root clean, contract checks verified). Sweeps `05-t3-*`: generator/lock 108/108,
      bridge 18/18, P13 group 16/16, P13B S1/S2/S3 20/20, p10a/p11/owner-ux/r3n4/operations/history 85/85, core S3 + S4 83/83, campaign-isolation
      solo 70–74 s bodies (inherited 60 s budget; the office rows cost ≈0.1 s of it). Unproven: the `conversionStandards` fallback for an
      effect-only standalone II/III body (no registry row) — disclosed via `available:false` + the engine refusal.
- [ ] **S4-T4 Matched pass, records (backlog entry), commit, push.**

## S4 — original scope record (superseded by the expansion above; kept verbatim)

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
