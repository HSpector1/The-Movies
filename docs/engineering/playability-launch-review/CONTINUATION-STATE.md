# CONTINUATION STATE — three-week autonomous window (Owner directive 2026-09-15)

**Purpose.** The one file a fresh coordinator (or Howard on return) reads first. It is rewritten at every recovery point and pushed on
`wip/playability-interaction-01-ts` (The-Movies). Everything else it names is pinned by commit. Nothing that matters lives only in a session.

## LOGIC-FIRST WINDOW — S1 closeout (2026-09-16 ≈16:05 CEST; this paragraph controls)
- **P13B-S1 full named research staffing: LOGIC VERIFIED · UNITY NOT VERIFIED** (not P13B completion, not Owner acceptance). Production
  source of record `d74426a` (engine unchanged since); T9 commit adds only eight test-expectation fixes (V22/V21 unknown-version sentinel,
  one V21 message), the records and the evidence. Live save version is **V21**; V22 is S2's planned change. Full row, commands, counts and
  attribution in `HEADLESS-PROGRESS.md` (S1 row) and `evidence/p13b-s1-20260916/00–13`; the pin baseline logs are committed under
  `evidence/headless-baseline-20260916/` (core 213/220, bridge 50/54, all failures inherited: fixtures/Pillow/digests/host-speed timeouts).
- **Open, recorded, not S1's:** `bridge-p12-campaign-library` (per-test 5/20 s budgets) and `bridge-p13-campaign-isolation` (60 s budget
  vs ≈72–76 s body) exceed budgets calibrated on the old M3 Max on this Air in BOTH trees — never raised or disabled; `p13a-scientist-foundation`
  golden digests fail at the pin (inherited product drift, disposition owed to the P13A owner); r3n1 fixtures and Pillow are environment.
- **Specialists actually used:** test-author (tests 3–10, 29/29), contract-auditor (read-only, 3 findings), sim-core (fixes) — ≤ 2 concurrent.
- **S1b closed (≈16:45): LOGIC VERIFIED · UNITY NOT VERIFIED** — bridge projection 33, schemaId `sha256:9ee4bcff04e06d47fa672f6091d3f9eac98c3a19829260fd9587ab22d06d55f6`,
  `StudioLaboratoryPage.seats/receipts/weekly`; C# DTO change recorded in the backlog; Save stays V21.
- **S2-T1…T3 landed (≈17:10):** catalogue/labs green, cooperation RED by design (T4 contract); three law-driven test amendments recorded in the
  progress row; two-Lab fixture repaired (sequenced installs, late department, solvent at 780). Test-author findings carried forward: document 03's
  residual fixture (52 units at 780) is unlawful in the real timeline (lighting opens 780) → tests 5 reproduce it with the lawful nine-week prehistory
  (residual dates +9 weeks, differences unchanged) and record the finding.
- **S2 in flight (earlier record, kept):** tests 1–4 authored RED by test-author (`tests/p13b-s2-catalogue|labs|cooperation.test.ts`, harness `p13bTwoLabWorld`; S1 tests
  carry `technologyId` — these files are NOT in the S1b commit); sim-core dispatched on S2-T1…T3 (catalogue two entries, blueprints, technologyId
  routing with the P13A-preserving default, per-technology module law at begin/resume, Lab-level seat slots across projects, two Labs per project);
  T4 (cooperation scheduler, per-Lab receipts, **V22** ×8 numerator rebase) follows as a separate sim-core increment, then tests 5–8.
- **S2-T4 + tests 5–8 in flight (≈17:40):** three genuine V21 fixtures minted at the last V21 writer `e68de38` and committed as `e24c860`
  (`tests/fixtures/p13b/legacy-v21-*.json.gz`, provenance with sha256 beside them) BEFORE the writer moves to V22. sim-core owns T4 (per-Lab
  funding split, `units = 8·raw_a + 5·raw_b` over 1/160,000, receipt `labs` rows, technology root v3 with `cooperationFromWeek`, frozen
  `validateTechnologyV2`, `liftTechnologyV2`, Save V22 + downgrade guards, consumer and existing-test sweep). test-author owns NEW files only
  (`tests/p13b-s2-doc03|expiry|validation|save-v22.test.ts`, additive harness builders). Honest-lift rule: a V21 receipt whose seats spanned two
  Labs (only the e68de38–e24c860 writer could write one) lifts with `labs: null`, valid only before `cooperationFromWeek`; single-Lab receipts
  get their one derived row (all facts known). T6 bumps the projection (receipt `units` semantics change on the wire; assign intents carry
  `technologyId`); T5/T7 follow.
- **Next after S2:** S3 queues → S4 → S5 → S6 → S7 → S8 per the plan order; production consumer of R07 stays DESIGN BLOCKED (Future Ops R2 recipe).
- Everything below remains true as history.

## LOGIC-FIRST WINDOW — S1 recovery point 2 (2026-09-16 ≈14:00 CEST; superseded by the closeout above, kept as history)
- **Tree at this commit:** `npm run typecheck:bridge` PASS; `npm run typecheck` (root + ui) PASS — the inherited 138 × TS5097 are cleared by
  the recorded disposition (the four `tests/r3n1-*.test.ts` moved into `tsconfig.bridge.json` and excluded from the root program; nothing
  disabled). `tests/p13b-s1-staffing.test.ts` **5/5 GREEN** (RED observed 13:02 before implementation, preserved in HEADLESS-PROGRESS).
  The 36 bridge type errors at the WIP commit (`evidence/p13b-s1-20260916/00`) are fixed; V21 sweep: every test that exercises the LIVE
  writer moved from the V20 path to V21 (47 test files + 5 ui test files), the V19→V20 fixture proof (`tests/p13a-save-v20.test.ts`)
  stays on V20 by design; bridge/session, adapter and runtime-checkpoint treat V21 as current; the four evidence generators stamp
  `makeSave(state).saveVersion` instead of a literal 20. Bridge contract + fixture checks PASS (schema unchanged, projection 32).
- **P13A + bridge-P13 suites after the sweep: 77/82** (`evidence/p13b-s1-20260916/01`): (a) `bridge-p13-campaign-isolation` timed out at
  60 s (78.5 s in the run, 82.5 s solo) while the pin baseline core run and the test author's runs shared the 2-core host — NOT attributed;
  a quiet solo rerun is required; (b) `p13a-technology-validation` 'rejects duplicate researcher-week charges' expects /repeated research
  charge/ but the v2 validator reports the receipt/expenditure reconciliation first — validator ordering fix assigned to sim-core;
  (c) `p13a-scientist-foundation` 3 golden-digest mismatches — **INHERITED** at the unmodified pin (identical failure reproduced in the
  baseline worktree `/Users/zacheryspector/The-Movies-baseline`).
- **In flight (not in this commit):** `test-author` is authoring plan §S1 tests 3–10 as `tests/p13b-s1-scheduler.test.ts`,
  `tests/p13b-s1-save-v21.test.ts`, `tests/p13b-s1-validation.test.ts` (+ optional `src/harness/p13b/fixtures.ts`).
- **Next:** test-author report → sim-core brief (validator ordering + any production defects) → GREEN → contract-auditor read-only review →
  T8 affected suites + bounded full core pass (quiet host) → T9 records, commit, push.

## LOGIC-FIRST WINDOW — restart record (2026-09-16 13:11 CEST; superseded by the recovery point above, kept as history)
- **Why this record exists:** the Owner ordered a stop on delegation until the project subagents (`.claude/agents/*.md`, six roles)
  are registered. Diagnosis (HEADLESS-PROGRESS §Environment): the files exist and are authoritative, but this session started in
  `/Users/zacheryspector` (not a repository) before the engine worktree existed, so the Agent tool never registered them. A fresh
  session is required for discovery.
- **Replacement session must start from:** directory `/Users/zacheryspector/The-Movies-headless-program` (git toplevel of the engine
  worktree), branch `wip/headless-program-20260916-ts`. First actions: `/agents` → confirm `contract-auditor`, `instrumentation`,
  `sim-core`, `test-author`, `uiux-designer`, `unity-ui` are listed; read this file, `HEADLESS-PROGRESS.md`, `plans/P13B-HEADLESS-PLAN.md`;
  read the clean baseline logs under `evidence/headless-baseline-20260916/` (a detached run was started 13:10 in the sibling worktree
  `/Users/zacheryspector/The-Movies-baseline` at the unmodified pin; it may still be running — `cat RUN.txt` shows start/end).
- **State of the tree at the WIP commit (does NOT typecheck; no S1 test is green yet):** technology root v2 (`seats`/`weeks`/`legacy`),
  `researchCandidates`, seat commands (`assignResearchScientist` multi-seat, `releaseResearchSeat`), seat-aware scheduler with per-week
  receipts, v2 validator + frozen `validateTechnologyV1`, Save V21 (`validateSaveV21`, `convertV20ToV21`, `migrateToV21`, downgrade
  refusals), seat-aware `busyTalentIds`/occupancy/presence/adapter, laboratory bridge read model (schema unchanged, projection 32),
  bridge/UI call sites moved to `migrateToV21`, `tests/p13b-s1-staffing.test.ts` (RED observed before implementation).
  Remaining `npx tsc --noEmit -p tsconfig.bridge.json` errors (14, all mechanical): `src/core/index.ts` must export `migrateToV21`,
  `SaveFileV21`, `validateSaveV21`, `convertV20ToV21` (3 bridge import errors); `save.ts:7416` pass the V1 root to
  `validateSaveV19WithPolicy` (widen its `technology` parameter to `Pick<StudioTechnology,'access'|'adoptions'>`);
  `technology.ts:351` `technologyAccess` parameter type must accept the V1 root (`{technology?: {access: TechnologyAccess[]}}`);
  `technology.ts:501–544` narrow `p.legacy`/`p.startedWeek`/`p` after the null checks (use locals);
  `src/harness/d16/run-d17b-continuation.ts:193`, `run-d17b-week86.ts:125`, `tests/bridge-p07a-w6-result-continuity.test.ts:224/230/277`
  build a `GameStateV20` where `GameState` is now V21 — retype those fixtures as `GameState` (they carry an empty technology root; use
  `initialTechnology`). Then: run `tests/p13b-s1-staffing.test.ts`, the P13A suites (`tests/p13a-*.test.ts`, `tests/bridge-p13-*.test.ts`)
  and update the P13A call sites that must move from `migrateToV20`/`validateSaveV20` to V21 for freshly generated states (the V19→V20
  fixture test stays on V20 by design).
- **Delegation once agents are registered:** `test-author` gets the S1 requirement-test brief (scheduler table, conservation, expiry/rehire,
  same-name identity, determinism/replay, validator refusals, campaign isolation — plan §S1 tests 3–10); `contract-auditor` reviews the
  slice read-only at the checkpoint; at most two specialists concurrently unless the Owner's later chat amendment (parallel subagents
  permitted, 2026-09-16) is applied — record which rule is in force.
- Everything below remains true as history.

## LOGIC-FIRST WINDOW — first record (2026-09-16 ≈12:50 CEST)
- **Owner directive `OWNER-HEADLESS-PROGRAM-20260916-01`** (published verbatim at
  `docs/operations/fable-team/OWNER-DIRECTIVE-LOGIC-FIRST-20260916.md`): the previous laptop is unavailable; the UI/UX overhaul and all
  Unity/native work are **paused, not accepted**; headless P13B → P14 → P15 → P16 → supported P17/P18 engine work proceeds now.
- **Live engine entry point:** branch `wip/headless-program-20260916-ts` (this file, on that branch), created from the paused TS source
  `wip/playability-interaction-01-ts` @ `e2e409e80eccb6a7fd49fa16aa0f750faeb51253` (remote tip re-read 2026-09-16). The paused UI branch and
  Unity branch `wip/playability-interaction-01-client` @ `08c32c47` are preserved untouched. IMPL-29 / TEST-27 local work from the old
  laptop is **not recoverable** from published state.
- **Records for this window:** `HEADLESS-PROGRESS.md` (environment, baseline, slice ledger, budget), `UNITY-INTEGRATION-BACKLOG.md`
  (everything reserved for the replacement laptop), `plans/P13B-HEADLESS-PLAN.md` (phase plan; S1 expanded into TDD tasks).
- **Baseline on this host (Early 2015 Air, Node 20.20.2):** `typecheck:bridge` PASS; root `typecheck` FAIL inherited at the pin (138 ×
  TS5097 from the r3n1 bridge-class tests; disposition in HEADLESS-PROGRESS); core/bridge suites running at low concurrency.
- **Exact next actions:** P13B-S1 (full named research staffing) T1 → T9 per the plan; then S2 multiple Labs / second brief.
- Everything below this section is the paused UI record and remains true as history; its "running" claims are superseded by the pause.

## Where everything is documented (if the session closes, start here)
| What | Where (GitHub, private) |
|---|---|
| Governing authority for the window | `docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md` (this repo, `wip/playability-interaction-01-ts`) |
| Running handoff (decisions, failures, evidence, remaining work, next actions) | `docs/engineering/playability-launch-review/06-FABLE-ADOPTION-AND-FRESH-SESSION-HANDOFF.md` — newest record on top (K8 → K1, then C, R, S) |
| This state file | `docs/engineering/playability-launch-review/CONTINUATION-STATE.md` |
| Phase plans published before each phase | `docs/engineering/playability-launch-review/plans/<phase>-PLAN.md` (created per phase) |
| Unity source candidate | HSpector1/project-studio-unity-visual-spike `wip/playability-interaction-01-client` (currently 288c4ddb; Build56) |
| TS source candidate | HSpector1/The-Movies `wip/playability-interaction-01-ts` (currently 70a8c3ec + this record; production TS at projection 31 since d02230a8) |
| Private review evidence (reports, xml, captures, native attempts, manifests) | HSpector1/project-studio-unity-visual-spike `docs/playability-delivery-review-20260913-01` → `docs/evidence/r3n1-native-correction-20260915-01/00-START-HERE.md` (c80743db) and `docs/evidence/playability-delivery-20260913-01/` |
| Budget ledger (git-ignored evidence, local) and private stamps | TS `evidence/Playability-Interaction-01/entry/budget-ledger.json`; git-private `fable-local-transfer-20260914-01/r3n1-ledger-local.json`; totals are restated in every handoff record |
| Full local-evidence mirror (nothing stays local): text-class evidence in Git; captures/movies/large payloads as release assets | private Unity repo, branch `docs/playability-delivery-review-20260913-01` → `docs/evidence/local-mirror-20260915/` and GitHub Release tag `evidence-mirror-20260915` (assets listed in its notes) |
| Owner playtest list for Howard's return | `docs/engineering/playability-launch-review/OWNER-PLAYTEST-LIST.md` (grows with each phase) |

## Current position (2026-09-16 07:40Z)
- **Build56** bound and admitted: Unity 288c4ddb / TS 70a8c3ec, exe 84f1a896…, seal 51 PASS (DTO blob 253e345a, projection 31), **admission 46
  PASS** (admission script now contract-driven). Correction: Build55 was sealed (50) but never admitted — the earlier "admission 46" claim
  for it was wrong; 46 is Build56's. **N3 delivered** (record K11 in the handoff): stage art 8/8, C2 font law + probe (F25 refuted), C1
  portrait cache/slots (0 captures until N5's BodyResolver, declared), TS read-model deltas at projection 31 with every fixture family
  regenerated; EditMode 1916/1916; rendered PlayMode 219/221 + 2 NativeOnly; native chains 55 + 56 clean except **F26**.
- **F26 (product, native):** at 1280×720 @ 100 % on the dense-02p31 route the Development card's `development-review-open` publishes above the
  viewport (y = −82) under `inspector-fallback` ("lane not composed") after a workspace closes → review route unreachable; the UX-STALE
  mid-display invalidation step stays NOT EXERCISED. Assigned to N4 IMPL-26 item 3a.
- **Independent review AUDIT-01 (N3): REFINE** — §5.1–§5.4 font tests against the real face and the §5.5 proof set missing → TEST-24
  (running); stale C8 comment blocks → IMPL-26 item 0; portrait invalidation bookkeeping → N5.
- **IMPL-26 landed** (Unity 6de4d41d…e360b608, pushed; EditMode 1926/1926 ×2): shared measured bottom (`StudioResponsiveChromeContracts.Surface*`
  + `StudioSurfaceFooter`), F2 footer (reason pinned beside execute, context height derived), F1 card scrolls/clips at every text size
  (**F26 root cause**: the Development card only scrolled and clipped at text ≠ 100 %, so at 100 % its bottom band was published off-screen),
  W3 hit heights, 4B attention word, F3/F5 retained, F4 casting cluster under More-actions. Declared: the 4-action review footer is not under
  More-actions (the card has no pinned footer); Escape rung 2 for the new disclosures is the host input owner's. Rendered full suite on
  e360b608 (`r3n4-03/playmode-rendered-n4-01.xml`): 223 total / 218 passed / 3 failed — two N1/N2-proven viewport floors regressed
  (Production decision context 0 px at 1280×720 @ 100 %; Profile renew explanation 74 px at 1280×720 @ 200 %) → **IMPL-27** (writer, running);
  one TEST-24 sparse-control expectation contradicts the empty-roster rail law → TEST-25 item 0.
- **IMPL-27 landed** (Unity f391d20b, e3597859, caec24ef; EditMode 1926/1926): F2 context block measured (a ScrollView has no intrinsic
  height, so "auto" was 0); Profile mid-decision floor `ApplyContractReviewFloor` (the W3 control floor had eaten the explanation at 200 %);
  `CompactInspectionRouteFor` names the fallback's real reason. Rendered confirmation pending.
- **Projection 32 adopted in Unity** (DATA-08 DTO blob f84700be, DATA-09 P11 fixtures, DATA-11 embedded wire; TS DATA-10 generator
  idempotence): whole-platform EditMode then showed 293 failures, all "Cannot write a null value for property 'operationsEvents'" from
  hand-built test snapshots → **TEST-26** (test-author, running) adds the member via the shared builder. TEST-25 (N4 contracts, F26 rendered
  regression, DATA-07 p32 fixtures) running concurrently.
- **TEST-25 items 1–2 + TEST-26 landed** (Unity e5915b5b, 67f040a4, 3edb969b; EditMode 1942/1942). Rendered full suite on 3edb969b
  (`r3n4-04/playmode-rendered-n4-02.xml`): 229 / 220 passed / 7 failed / 2 NativeOnly — the two IMPL-27 viewport fixes did not take effect
  in a GameView, the pinned strip still nests a ScrollView (sheet W4, now tested), the Production clamp fails for J1 at 1280×720 @ 200 %,
  the card's 100 % body-scroll is not observable as tested, and two F26 tests crash on the board fixture's missing Required.Always fields
  (TEST-23 precedent) → **IMPL-28** (writer, running) + TEST-25 fixture fix (queued to the test owner after its items 3–4).
- **07:40Z:** TEST-25 complete (Unity 0b6c401f fixture fix; TS 71ce3aa7 p32 refusal proof, cc53e1a8 p31 proof kept as a migration proof;
  `npm test` 5298 passed / 0 failed). DATA-07 p32 fixtures minted (dense-01p32 ccaba83f…, dense-02p32 a16839b7…); **dense-03p32 (genuine
  3-action record) is a NAMED DATA DEPENDENCY** — lawful play from dense-02 cannot reach it (the bridge stops publishing week advance after
  auditions start); the 3-action footer is proved by rendered per-state tests instead. IMPL-28 (Unity 08c32c47): pinned strip has no nested
  scroll; the two old `Q<ScrollView>` test sites → TEST-27. Rendered on 08c32c47 (`r3n4-04/playmode-rendered-n4-03.xml`): 229 / 220 / 7 —
  **F26 still not fixed** (the review control is now withheld instead of off-screen; it must live inside the card's scrolled body), the
  card's scroll rect overruns the card by 76 px, the 100 % body scroll not observable, Production clamp false for J1 at 1280×720 @ 200 %,
  Profile explanation 74 px (needs More-actions on `profile-chrome`) → **IMPL-29** (writer, running) + **TEST-27** (test owner, running).
- **N4 in progress:** IMPL-26 (writer, `r3n4/IMPL-N4-brief.md`: shared bottom clamp, F2 footer redesign, F1 card refine + `attention`
  cue, F3/F5 retain, F4 casting refine, F6 route geometry, F26) running concurrently with TEST-24. Next: SIM-N7-01 (TS
  `operationsEventsProjection`, projection 31 → 32) once IMPL-26's Runtime edits are built, then fixture regeneration, DTO adoption, TEST,
  rendered, Build57, seal 52 / admission 47, native on the changed routes, K12.
- TEST-24 landed (Unity d859de9e / 4e5e3a36, EditMode 1926/1926): 188 drawn glyphs all resolve in the tier-0 face, atlas rebuild re-measures,
  XAG ladder measured → **C8 amended** (TS c581287f: ink-basis deviation declared for all five faces; title anchor holds on the box basis
  only). Its PlayMode §5.5 class still needs the rendered Editor slot (after IMPL-26 commits). SIM-N7-01 (sim-core, TS) dispatched 05:49Z.
- Design ahead: N7 sheet (C12 adopted), N8 sheet (C13: four routes ratified). Budget: capability remaining ≈ 38.3 h; reserve ≈ 5.9 h —
  the unprotected reserve is exhausted, 0.08 h drawn past the 6-h protection line; all further verification is reported as overrun.

## Program order for the window
1. R3-N1 native close-out (preflight, A, B; native defect fixes if found) → 2. remaining selected R3 UI/UX overhaul phases (plan to be
published: `plans/R3-OVERHAUL-PLAN.md`) → 3. P13B eight obligations → 4. P14 → 5. P15 → 6. P16. Merges to main are the coordinator's call (Owner addendum) after independent review + gates; otherwise working branches.

## Exact next actions
1. IMPL-26 report → TEST-25 (N4 per-state contracts + the F26 rendered regression + the 3-action fixture) → rendered full suite → Build57.
2. SIM-N7-01 (`r3n7/SIM-N7-01-brief.md`) → regenerate P11 EditMode fixtures, PlayMode embedded wire, native p32 fixtures (memory rule) → adopt
   the DTO in a paired Unity commit → seal 52 / admission 47 → guarded native on the N4 routes incl. F26 and the mid-display invalidation step
   → K12 (N4) + evidence publish + playtest list.
3. N5 → N6 → N7 (help owner + attention store + History rows) → N8 (four ratified drag routes) → N9 → P13B → P14 → P15 → P16.
