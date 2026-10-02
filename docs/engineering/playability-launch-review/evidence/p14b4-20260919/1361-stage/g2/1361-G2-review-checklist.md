# 1361-G2: review checklist for the G2 probe

1361-F ruling 11 asks for an independent review of the G2 probe before any run. Review the files in
`/Users/zacheryspector/studio-scratch/1361-g2/` against:
- 1355-A §4-§5 (E/1355-A:161-197);
- 1361-F rulings 11 and 13;
- 1361-R Part 1.2 and Q4, Q5 and Q16.

`1361-G2-notes.md` explains the design and the choices. Its "Files" table gives each file's sha256, so you can confirm
you reviewed the same bytes.

E means `docs/engineering/playability-launch-review/evidence/p14b4-20260919/` in the repository, and T means
`tests/p15a1-market-integration.test.ts`. P is `1361-G2-probe.test.ts`, R is `1361-G2-report.test.ts`, and line
numbers refer to the bytes 1361-G2-D reviewed. The notes' section "Edits after 1361-G2-D" lists every later change. Run nothing that the parent's lane owns. Return each item as **pass**,
**fail** (with the line and the reason) or **question**.

## A. Scope

- [ ] **A1. Every row.** The notes' table "The §5 rows and K1-K5 in code" maps each G2 report item (E/1355-A:181-185)
  and each threshold row (:187-197) to code. Confirm that each named location computes the stated quantity, and that
  no row is missing.
- [ ] **A2. Routes.**
  - `p13aGeneratedStudio('p13a-core-causal-01')` and `p13aGeneratedStudio('seed-b')`, as 1355-X4:20-21 and 1361-F
    ruling 11 require;
  - one `tick` a week to 6240;
  - read-outs at 520, 1560, 3120, 4680 and 6240 (P:123, :269, :287, :488; `SEEDS` in `1361-G2-run.sh`).
- [ ] **A3. Trees.** `1361-G2-trees.sh` builds:
  - the control from e4be3e5c in the repository;
  - the candidate from the frozen tag in `S/1361-prod/tree`;
  - K4 as the candidate plus one tuning line.

  Does any path in the archive list differ from what the probe imports?
- [ ] **A4. K3's save.** K3 migrates the control's Save44 save, not a Save43 one (E/1361-R:808).
- [ ] **A5. Writes.** Nothing writes outside `S/1361-g2/run/`. Both test files write only under `PROBE_OUT`.
- [ ] **A6. Fixtures.** No G2 file reads `tests/fixtures`. Confirm that the era-guard leaf (T:688-707) and the module
  scope of T (T:47-160) read no fixture either, since the K4 tree has none.

## B. The probe's measurements

- [ ] **B1. Week labels.**
  - W is `pre.market.tick` (P:289), and a read-out at R covers W < R (P:295, :387).
  - Receipts and releases carry W; the probe throws on any other week (P:308, :353).
  - First takes carry W + 1 (tick.ts:1134-1142); the probe stores W (P:343-347).

  Is this consistent with G1's `r.week < week` (E/1355-stage/g1/1355-G1-probe.ts)?
- [ ] **B2. Releases** (P:350-366).
  - Player releases: `productionId`, the concept's genre, `releaseTick` and `boxOffice.total`.
  - Rival releases: `simulation/v1` films with `filmId`, `genre`, `result.releaseTick` and `result.boxOffice.total`.

  Compare with `releaseHistory` (tests/helpers/p15a1-market-route.ts:101-115) and E/1355-A:118-120.
- [ ] **B3. Assessments** (P:367-383). The week's new root rows must match its releases one to one by id, studio and
  genre. Check the field names against `PERSISTED_ROW_KEYS` (route helper :42-45).
- [ ] **B4. Stall** (P:332-336). A stall week has three conditions:
  - a `ready` screenplay in `activeScriptOrdinals` at week start;
  - no production at week start;
  - no `filmAnnounced` that week.

  Is the active-index reading right for E/1355-A:183 (notes, choice 3)? Shelved screenplays stay `ready` outside the
  index (hollywoodTypes.ts:140-145).
- [ ] **B5. Reserve and zero** (P:337-340).
  - Cash: end-of-week `account.cash`.
  - Reserve: `rivalWeeklyOperatingCost(end, after, W + 1) × policy.reserveWeeks`.

  Compare with hollywoodTick.ts:60-62 and E/1357-P-condition-probe.ts:65-71 and :161.
- [ ] **B6. Greenlights and shelvings** (P:303-314) come only from new `filmAnnounced` and `screenplayShelved` receipts
  (hollywoodTick.ts:257, :281). The grep shows no other writer.
- [ ] **B7. decide() outcomes** (P:185-236, :316-330).
  1. The three spies call the originals with the same arguments and return their results unchanged.
  2. `follow()` encodes the order of hollywoodTick.ts:213-237: masks, then the locked chooser, then the search, only
     after a null choice.
  3. The commission search (:324, `lockScreenplay: false`) is excluded.
  4. A retry is an evaluation of a screenplay in `shelvedScriptIds(before, studio)`. That matches the retry branch
     (:286-299), whose due screenplay sits outside the index when the week begins.
  5. Viable evaluations equal `filmAnnounced` receipts per studio-week. A viable evaluation always reaches
     `greenlight()` (:265, :292-296).
  6. Can anything else in a tick call `promisedCastMasks` with a `scriptProjectId`? `1361-G2-trees.sh` stops on any
     `src/core` caller outside hollywoodTick.ts's four sites; check that its grep (trees :39-46) is sound.
- [ ] **B8. Read-outs** (P:252-265).
  - `exportCurrentState` runs the live validator (save.ts:6571-6576, :6594).
  - Root bytes are `stableStringify(sharedMarket)`.
  - Player cash and Standing come from `state.studio`.
- [ ] **B9. Digests** (P:150-183).
  - `token()` must reproduce `stableStringify`'s rules (save.ts:685-713) for every value a state holds:
    - `undefined` and functions in arrays become `null`;
    - object keys with `undefined` or function values drop out;
    - non-finite numbers become `null`;
    - `-0` prints as `0`.
  - The memo is safe only if no tick edits an object it already returned. The industry copies on write
    (hollywoodTick.ts:351-352). Each read-out audits the memo against a fresh one (P:256-258).
- [ ] **B10. Memory.**
  - The spies' call history clears after every tick (P:232).
  - The WeakMap memo holds no state alive.
  - Nothing else grows per week beyond the row arrays.

## C. K1 to K5

- [ ] **C1. K1 and K2** (R:228-237). The report needs four leaves to pass (T:417, :430, :455, :467) in a vitest JSON
  from the frozen tag. Is re-reading the RED's leaves, not recomputing the pins, what E/1355-A:165-166 and the
  MANIFEST at 601ea709 intend?
- [ ] **C2. K3** (P:391-394, :416-474; R:239-271).
  1. The control's save at week 520 is migrated by `importSave` and `migrateToLive`. Its stripped digests compare
     with the control's in-memory route. `makeSave` copies the state through JSON (save.ts:6571-6576). Does anything
     else make a round-tripped state's canonical text differ?
  2. The first pressured week is the first week whose new rows hold a factor below 1.
  3. The factor-1 twin forces `competitionFactor` to 1 at the `resolveReception` export. Does that reproduce the
     control's no-factor result bit for bit (E/1355-A:80-85; K2)? Does it leave the root law-exact?
  4. `diffPaths` and `k1AllowedPaths` run on `stripP15` states (route helper :428-475). Do they test "first differs
     there, in that film" (E/1355-A:167)?
  5. Check the pass clauses in the notes ("K3 passes when"), and the rule that K3 needs one exercised seed.
- [ ] **C3. K4** (R:273-296; run.sh `eraguard`).
  - The K4 digests must equal the control's every week from 0 to 6240.
  - Every K4 factor must be exactly 1.
  - The era-guard leaf must fail with a message naming `SHARED_MARKET_FACTOR_MAX_PENALTY`. T:705 compares `canon`
    strings, and `canon` sorts keys, so the constant comes first in the message.

  Is an incomplete K4 run correctly a K4 failure ("defect or setup") and not a report failure (R:336-348)? After
  1361-G2-F, a K4 failure reads Defect, and an absent K4 directory reads notRun.
- [ ] **C4. K5** (R:298-318). Two separate processes must produce identical digest files, identical K3 files,
  identical read-out save hashes and identical rows apart from the four timing fields.

## D. Bands and the verdict

- [ ] **D1. Band edges** (R:147-184) against E/1355-A:187-196:

  | Row | Code reads |
  |---|---|
  | Median factor | ≥ 0.95 P; ≥ 0.90 F; else R |
  | p10 factor | ≥ 0.85 P; ≥ 0.80 F; else R |
  | Lowest genre mean factor | ≥ 0.90 P; ≥ 0.85 F; else R |
  | Releases with f ≤ 0.95 | ≥ 10% P; else F; no R |
  | Industry gross, candidate / control | ≥ 0.95 P; ≥ 0.90 F; else R |
  | Rival stall weeks | ≤ 0 P; ≤ +10% with no new streak and no stop F; else R |
  | Rival weeks below zero | ≤ +10% P; ≤ +25% F; else R |
  | Root bytes / save bytes | ≤ 2% P; else R |

  The charter writes Flag as "0.90-0.95", so exactly 0.95 and exactly 0.90 sit on shared edges. The code puts 0.95 in
  Proceed and 0.90 in Flag. Agree?
- [ ] **D2. The verdict** (R:374-381) is the worst gated band. "No releases" gates nothing, and notRun makes the
  verdict "incomplete".
- [ ] **D3. The estimators** use d16's type-7 `quantile` (src/harness/d16/stats.ts:41). The lowest genre mean takes
  every genre in `GENRE_ORDER` with at least one release.
- [ ] **D4. "Stops for good"** (R:163-179) has a year reading (gated) and a literal reading (printed). See notes
  choice 5.

## E. Scripts

- [ ] **E1. `1361-G2-trees.sh`.**
  - the archive pathspecs, with fixtures excluded;
  - the `node_modules` link;
  - the K4 edit and the one-line diff check;
  - the call-site guard;
  - refusal of an existing `run/`;
  - `set -o pipefail`, so a failed `git archive` stops the script.
- [ ] **E2. `1361-G2-run.sh`.**
  - one vitest process per probe stage;
  - environment per stage;
  - the Node v20.20.2 pin;
  - refusal of existing outputs;
  - the smoke stage;
  - the era-guard stage accepting vitest's exit 1;
  - `RED_JSON` passed through `lane-run.sh`.
- [ ] **E3. Compatibility.** Both scripts run under macOS `/bin/bash` 3.2: no arrays and no `${var,,}`.
- [ ] **E4. Estimates.** The notes give runtime and memory estimates. Are they plausible against G1's progress file,
  1357-X:132 and 1356-X3:32-33?

## F. Determinism and side effects

- [ ] **F1. No unmeasured randomness.** No `Math.random` or `Date` enters a recorded value. `performance.now` feeds
  only `elapsedMs`, `tickMs`, `k3Ms` and `saveMs`.
- [ ] **F2. No feedback.** No spy changes the route.
  - The decide spies pass through.
  - The factor-1 twin's state is compared and dropped. Its spy is restored in `finally` (P:468-473).
  - `vi.restoreAllMocks()` runs at the end (P:521).
- [ ] **F3. Failures write.** A failed run writes `error.txt` (P:516-519). The report quotes it (R:33-42).

## G. Type-check by reading

- [ ] **G1. Imports.** Each import exists at e4be3e5c and in the writer's tree (notes, "Type-check by reading").
- [ ] **G2. Compiler flags.** Check the code under `strict`, `exactOptionalPropertyTypes`, `noUnusedLocals`,
  `noUnusedParameters` and `noImplicitReturns`. vitest strips types, so an error here would not stop a run, but it
  would fail the landing's type gate if the files were ever kept.
- [ ] **G3. Type-only import.** R imports only types from P, so the report never loads the probe.

## H. Before the run, once the frozen candidate exists

- [ ] **H1. The week-0 root.** `generateWorld` creates `sharedMarket` at week 0 (E/1355-A:137). Slice 2a's
  `initialP15Roots(0)` is the expected place.
- [ ] **H2. Save versions.** `LIVE_SAVE_VERSION` is 45, and `migrateToLive` lifts a Save44 save to an empty root at its
  tick.
- [ ] **H3. The seam.** Both release sites pass `competitionFactor` to the exported `resolveReception` (tick.ts:625,
  hollywoodTick.ts:388 at HEAD). No forecast passes one. A forecast that did would move under the K3 twin and read as
  paths outside the chain.
- [ ] **H4. decide().** `decide()` is unchanged. The trees script and the spies both stop the run otherwise.
- [ ] **H5. The tuning line.** `src/core/tuning.ts` holds `SHARED_MARKET_FACTOR_MAX_PENALTY: 0.25,` exactly once.
- [ ] **H6. The root list.** The candidate's `tests/helpers/p15-roots.ts` lists every new top-level root.
- [ ] **H7. RED_JSON.** It comes from the parent's dry run on the frozen tag (`S/1361-prod/x/<label>/p15a1.json`).

## I. Choices the parent may rule on before the run

1. **"Stops for good":** the year reading gates, and the literal reading prints (notes, choice 5). On p13a the literal
   reading reads Retune on any shift in the collapse.
2. **Stall:** by the active index (choice 3).
3. **Gating scope:** cumulative scopes at every read-out gate; windows only print (choice 11).
4. **Increase from zero:** an increase over a control of zero reads Retune (choice 10).
5. **K3's start:** one save per seed at week 520 (choice 14).
6. **Failed controls:** a failed K row, and an incomplete K4 run, read **Defect**, never Retune, with "defect" or
   "defect or setup" in the evidence (choice 17; 1361-F2 ruling 4.4). The route is a production fix and a new G2.
