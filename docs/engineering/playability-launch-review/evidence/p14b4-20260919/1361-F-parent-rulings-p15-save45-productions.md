# 1361-F: parent rulings for the three P15 Wave 2 productions at the shared Save45 step

Amended by [1361-F2](1361-F2-parent-rulings-on-the-probes.md): its ruling 3 corrects rulings 11 and 13 on a G2 Retune. P15A.1 then takes its declared later step, because (a) and (b) cannot land without (c)'s batch.

[1361-R](1361-R-p15-save45-production-protocol.md) compiled the production protocol from the records at a63c7de8 and
left sixteen questions open. These rulings settle them and fix how the work proceeds. The productions are:
- P15A.2 slice 2a, the Power Ranking archive (1356);
- P15A.1 Wave 2, the shared market (1355);
- P15C Wave 2, the Campaign Legacy integration (1359).

These rulings sit under three earlier records:
- **[1360-F](1360-F-parent-rulings-p15-wave2-red-landings.md) ruling 1:** one step, Save45.
- **[1360-F2](1360-F2-parent-response-to-1360-D.md) ruling 2:** Save45 reserved; no production commit before it; the
  bound.
- **[1360-F3](1360-F3-parent-response-to-1360-D2.md) ruling 5:** a production commit is one that changes `src/`.

## Rulings

1. **The writer and the tree.**
   - **Who writes.** One production writer at a time, an agent, works in a scratch git repository the parent builds
     from an archive of HEAD (`/Users/zacheryspector/studio-scratch/1361-prod/tree`), on the 1358-E model.
   - **The base** is the source and tests of a63c7de8, whose `src` tree equals 1706d844's.
   - **The writer runs no node, vitest, tsc, npm or vite-node** (1358-E's practice). The parent measures each
     candidate in that tree under the heavy lane and returns the results as a revision brief.
   - **Links.** In the tree, `tests/fixtures` and the E directory are real directories of per-entry links, and
     `bridge-contract-union-fixtures.ts` is a real copy (memory `scratch-tree-fixture-links`). The writer writes nothing
     under a link and nothing in the repository.
   - **Staging.** Each production is staged as cumulative patches beside a handback record.
2. **The references are guides, not patches** (Q2).
   - The writer writes the Save45 step by hand on HEAD from each charter, its rulings and its landed RED, using the
     reference for shape.
   - Every name a reference calls V44 or Save44 becomes V45 or Save45 above slice B's V44.
   - 1361-R Part 2.4 lists what the merged step holds.
3. **One step, built in commits** (Q1).
   - **Slice 2a's commit creates the Save45 step,** with `powerRanking` and `p15Sequence`.
   - **The later commits add their roots to that step,** in 1355-F4's order: P15A.1's (a), (b) and (c), then P15C's
     (a), (b) and (c).
   - **Type gates.** Every production commit leaves the type gates clean on `src/`. Test files may carry type errors
     until the sweep, and the landed HEAD passes every type gate.
   - **One push.** The productions, the sibling test (ruling 10) and the sweep land together, so no intermediate commit
     is ever played.
4. **The merged downgrade refusal** (Q3).
   - **One refusal.** The step validates first, then refuses once, naming every non-empty root in one message:
     `sharedMarket`, then `powerRanking`, then `campaignLegacy`. That is r3's order with the Legacy appended
     (1355-F4:26-28).
   - **Every RED's pattern matches.** Each RED's pattern names only its own root (A:181; T:90;
     `tests/helpers/p15c2-legacy.ts:283`), so the one message satisfies all three.
   - **A conflict is a finding.** If a 1359 leaf needs the Legacy's refusal before validation, as r4 has it, the dry run
     shows it and the writer reports it. The order does not change silently.
5. **One allocator check** (Q7; 1355-F2 item 4).
   - **What it checks.** One exported function checks `p15Sequence.next` against every `p15DomainSequence` in every
     root that carries one, and the step's validation calls it once.
   - **Who extends it.** Slice 2a writes it over `powerRanking`. P15A.1 and P15C add their roots, and P15B's production
     adds `corporateCondition`.
   - **No private copy.** No root validator keeps its own.
6. **The phase lookup** (1355-F5 ruling 1).
   - `src/core/p15Phases.ts` lands in 1355 r3's form. Every validator reads `P15_PHASE_TABLES[row.phaseOrderVersion]`
     through the export.
   - P15C's production drops r4's second copy of the module and its `p15PhaseMatches` call.
7. **The two `src` type-error sites** (Q8). Slice 2a's commit fixes both:
   - `src/core/save.ts:10487`;
   - `src/harness/roster-wall/historical-control.ts:33`.

   The fix uses types, with no `@ts-ignore`, no `@ts-expect-error` and no cast to `any`. The implementation review checks
   it.
8. **The public index.** Slice 2a's commit exports the Save45 names from `src/core/index.ts`, and the V44 names stay
   beside them. Tests reach the step functions through that index (1361-R Part 2.5).
9. **The tick order** (1355-F2 item 2).
   - P15A.1's batch runs at step 2.5.
   - At the end of the tick, the ranking record runs, and P15C's freeze wraps it as the tick's last step
     (1359-A:110-113).
   - P15B's condition steps later sit between the two (1357-A:167-171).
10. **The sibling test** (Q10).
    - `1359-p15c-wave2-sibling-r2.patch` lands with the Save45 landing, as a tests-only commit after P15C's
      production.
    - Before that, a test author classifies its five leaves, and the parent dry-runs them on the merged candidate.
    - C3b joins P15C's fallback (1360-F3 ruling 1).
11. **G2** (Q4, Q5).
    - **The probe.** An agent writes the G2 probe in scratch, with the G1 probe (`E/1355-stage/g1/`) as its model, and
      an independent reviewer checks it before any run.
    - **What it computes:**
      - 1355-A §5's G2 table and K1 to K5;
      - on seed `p13a-core-causal-01` (`p13aGeneratedStudio`) and seed-b (`p13aGeneratedStudio('seed-b')`,
        1355-X4:20-21);
      - to week 6240, with read-outs at 520, 1560, 3120, 4680 and 6240.

      K3 migrates a Save44 save. The charter's "Save43" predates slice B (1361-R Q16).
    - **What runs.** The control is an archive of e4be3e5c (1360-F2 ruling 6), and the candidate is P15A.1's frozen
      (c) on slice 2a's production. The parent runs both, one heavy process at a time.
    - **Proceed or Flag:** (c) stays in the shared step.
    - **Retune:** this adopts 1360-D's reading.
      - Commits (a) and (b) keep `sharedMarket` at Save45 with the seam at 1.
      - (c) waits for its retune and a new G2 (1355-A §5 routing).
      - The parent then rules from a measurement on which 1355 leaves stay red until (c) lands. Commit (c) changes no
        save shape, so it needs no save step of its own.
12. **G-P** (Q6).
    - **The branch.** An agent writes the probe's branch for the sibling roots, which
      `E/1359-stage/gp/1359-GP-probe.ts:50-57` refuses today. It includes the §3.1 row maps and the law's record-id rule
      (probe :48-49). An independent reviewer checks it (1353-F7:66-68).
    - **The gating tree** is the writer's candidate after P15A.1, with (c) only if G2 passed. It carries the v2 values
      in the way 1353-X4 added them (1353-X4:12-19). The parent runs the probe.
    - **A trigger** routes the retune (1353-F7:20-26; 1359-F5:19-23), and P15C's fallback applies (1360-F2 ruling 1;
      1360-F3 ruling 1).
13. **The bound is the first gate failure** (amends 1360-F2 ruling 2's bound).
    - **The rule.** At a G2 Retune or a G-P trigger, the parent lands what has passed at Save45. The failed part
      takes its declared path.
    - **A G2 Retune** lands slice 2a, P15A.1's (a) and (b), and P15C if its G-P passed on that tree. (c) lands later,
      after its retune and a new G2, and then G-P and G-L run again on its tree (1353-F6:76-77).
    - **A G-P trigger** lands slice 2a and P15A.1. P15C takes its fallback at its own later step.
    - **Otherwise** the three land together, as 1360-F ruling 1 intends.
14. **Four recorded GREENs** (Q13), at the landed HEAD, each comparable with its recorded RED:

    | Stem | Files |
    |---|---|
    | `1361-p15a2-green-recorded` | 1356's archive and isolation files |
    | `1361-p15a2-harness-recorded` | the 1356 harness, alone (1356-F2:40) |
    | `1361-p15a1-green-recorded` | 1355's three files |
    | `1361-p15c-green-recorded` | 1359's three files and the sibling test |

15. **The harness on the merged tick** (Q11). The parent runs the 1356 harness alone on the merged candidate, after
    P15C's production and before the sweep. A run past its 300,000 ms ceiling is a finding.
16. **P15A.1's integrated 6,240-week harness** (Q12).
    - A test author writes it from 1355-A's annex, with normal and hostile routes, after G2 returns.
    - Its ceiling is about five times its first measured run, the rule 1356-F3 used for the 1356 harness.
    - It closes P15A.1 and does not gate the landing.
17. **P15B does not join Save45** (Q14). No P15B RED is staged, and 1357-Q1 is open. P15B takes the next free step after
    Save45.
18. **`corporateCondition`** (Q9). P15C's production keeps r4's untyped read. P15B's landing re-pins A3, A5, A7, A8 and
    B4.
19. **The ref resolver** (Q15). P15C's production exports it (1359-A:212). Its first leaf arrives with the Wave 3 RED
    that consumes it.
20. **The Save45 sweep** (1361-R Part 3).
    - **The fallout.** Once the merged candidate exists, the parent measures the fallout by the 1358-M2 method: the full
      core suite with no test edit, plus the type gate.
    - **The plan.** The parent then plans the sweep by 1358-N's method as `1361-N`.
    - **The certain classes** (S1 to S4, and UI) may be authored once slice 2a's candidate fixes the Save45 names. The
      measured classes (S5, S8, S9, S10) wait for the merged candidate.
    - **What the sweep leaves alone:** the P15 RED files, `BASE_LIVE_SAVE_VERSION`, and F10 and F11, unless a
      production edits the Bridge schema.
21. **Records.**
    - **Per production:**
      - the writer's handback, `1361-E` (slice 2a), `1361-E2` (P15A.1) and `1361-E3` (P15C), with later revisions
        suffixed;
      - the parent's dry run, `1361-X*`;
      - an independent implementation review, `1361-D*`;
      - the parent's rulings, `1361-F*`.
    - **The probes:** `1361-G2-*` and `1361-GP-*`.
    - **The landing and the gates:** the landing record is `1361-L`, and the broad gates are `1361-M`.
22. **The low items** of 1361-R Q16 go to the closure as listed.

## The order of work

| # | Step | Who |
|---|---|---|
| 1 | Build the writer's tree; start the slice 2a writer | parent; writer |
| 2 | In parallel: the G2 probe and the G-P sibling branch, then their reviews | probe authors; reviewers |
| 3 | Slice 2a: handback, dry run on the landed REDs and the `src` type gate, review, rulings | writer; parent; reviewer |
| 4 | P15A.1 (a), (b) and (c) on slice 2a's candidate; dry run; review; freeze (c) | writer; parent; reviewer |
| 5 | G2 on the control and the frozen candidate | parent |
| 6 | G-P on the gating tree | parent |
| 7 | P15C (a), (b) and (c); the sibling test's classification; dry run; review | writer; test author; parent; reviewer |
| 8 | The 1356 harness alone on the merged candidate; the fallout; the sweep plan `1361-N`; its units, dry runs and reviews | parent; authors; reviewers |
| 9 | The landing in one push; four recorded GREENs; recorded broad gates; type gates and generator checks; `1361-L` | parent |
| 10 | The closures: P15A.1's integrated harness, G-L, implementation reviews | parent; authors |

Ruling 13 cuts this short at the first gate failure.
