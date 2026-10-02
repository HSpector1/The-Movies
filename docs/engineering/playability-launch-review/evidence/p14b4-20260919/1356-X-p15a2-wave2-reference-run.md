# 1356-X: parent reference run of the P15A.2 slice 2a RED r2

## How it ran

- **Script.** `/Users/zacheryspector/studio-scratch/1356-x/run-1356-X.sh`, step 3 of the heavy queue after dry run x3
  ([1344-X11](1344-X11-row6-and-promise-probe-results.md) has the queue log), alone in the heavy lane.
- **Tree.** A fresh scratch tree from repo HEAD f90a2def. On it, the staged patches only:
  - RED r2 [1356-p15a2-wave2-red-r2.patch](1356-stage/1356-p15a2-wave2-red-r2.patch), sha256 5a507ed2…;
  - the reference [1356-p15a2-wave2-reference.patch](1356-stage/1356-p15a2-wave2-reference.patch), sha256 83cb2a59….
- **Files.** `tests/p15a2-power-ranking-archive.test.ts` and `-isolation.test.ts`, at RED and at the reference; then
  `tests/p15a2-power-ranking-archive-harness.test.ts` alone. Outputs stay in scratch (`x-red.txt`, `x-ref.txt`,
  `x-harness.txt`, `x-ref-tsc.txt`).

## Results

| Run | Result | Expected (1356-C2) |
|---|---|---|
| RED, 2 files | 69 failed, 2 passed (71); 16.1 s | 69 RED, 2 controls pass |
| Reference, 2 files | 69 passed, **2 failed** (71); 34.3 s | 70 pass, 1 capture leaf fails |
| Harness alone, reference | 1 passed; leaf 62.3 s | passes; its time sets the budget |
| Type gate, root, reference | exit 2, 35 errors | not stated |

**The harness proof line:** 6,240 weeks, 480 records, archive 725,757 bytes in a 6,163,996-byte save (11.77%),
`campaignMs` 61,020, `makeSaveMs` 585, `validateSaveMs` 348.

## The two reference failures

1. `rank-root-migration-genuine-below-step-capture`: "no genuine capture below the P15 save step". This is the
   expected one. The capture mints at the last Save43 writer (1356-A §9).
2. `rank-validate-cadence-boundary`, case (a), was not expected. The leaf runs `beginFounding` at week 26, ticks to 66
   and validates `makeSave` at the step. The step's validator refuses at the frozen V24 technology rule: "unfounded or
   non-player corpus cannot hold technology authority" (`src/core/technology.ts:897`).

## Probes (scratch-only test files, removed after each run)

- **The reference's 1356 tree, live version 44.** The case (a) world validates at weeks 26-33 and refuses from week
  34 to 66, with the same message.
- **The same tree with the base `src` and `generated` (live version 43).** It gives the same result: weeks 26-33
  validate, and every week from 34 refuses. The reference does not cause the refusal; the repo's own law does.
- **The cause.** `beginFounding` opens a founding draft, and the leaf never closes it (`foundStudio`,
  `src/core/actions.ts:1199-1210`). At week 34 four rows enter `technology.productions`. Each is a rival production's
  method lock, written when the production enters shooting (`src/core/technologyProduction.ts:85-93`; the first is
  `studio-71355261-r04:film:0`, method `silent`, locked week 33). The writer runs once the economy is engaged, and
  an open draft engages it (`src/core/employment.ts:55-58`). The validator refuses any corpus row while a draft is
  open.
- **Control.** In the same world left headless, no row exists at week 40 and the state validates. A `beginFounding`
  at week 40 also validates.

## Findings

- **F-1, the RED's premise.** Case (a) ticks 40 weeks with an open founding draft. That world is not a founded studio,
  and any lawful production refuses it from week 34. The revision founds the studio at week 26: it hires the minimum
  roster and applies `foundStudio`, then ticks.
- **F-2, a conflict in the repo's law, for the Owner.** The method-lock writer and the technology validator disagree
  about an open founding draft. A world whose draft stays open while any rival enters shooting holds a state the live
  validator refuses, so saving it throws. Whether the shipped UI advances weeks during a draft is UNVERIFIED. The
  bridge computes next-advance charges for an open draft (`bridge/finance.ts:34`, `:44`), which suggests it can.
- **F-3, type gates.** The reference has 35 root errors: 33 in tests are the Save44 bump's pins, which the
  production's own sweep moves. 2 are in `src`: `src/core/save.ts:10498` and
  `src/harness/roster-wall/historical-control.ts:33`. The production must not carry them.
- **Harness budget.** `campaignMs` 61,020 alone. The parent sets the ceiling to 300,000 ms, about five times the
  measured run, in place of the PROVISIONAL two hours.

[1356-F3](1356-F3-parent-response-to-1356-X.md) rules on these.
