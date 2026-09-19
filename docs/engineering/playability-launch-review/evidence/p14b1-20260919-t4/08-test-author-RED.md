# Independent T4 regression authoring / RED

Role: native Codex test-author, applying `.claude/agents/test-author.md`.
Authority: Owner continuation; logic-first directive; coordinator assignment;
bounded review `05-review.md`. No Claude, production edits, installs, commits,
publication, full suite, fixture overwrites or validator changes by this author.

Production source for both runs:
`d19c45b2d873653b4cd4488608e4e411f15a2c34`.
Before first run and immediately after terminal run, the diff of
`src/core/promises.ts src/core/talentMarket.ts src/core/save.ts` was empty,
SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
Parent documentation edits were present and preserved. No source writer started
until these RED checks completed and ownership was returned.

## Executed

1. `node_modules/.bin/vitest run tests/p14b1-t4-regressions.test.ts tests/bridge-p14b1-promises.test.ts --minWorkers=1 --maxWorkers=1 -t 'lawful contract windows|owns every proposal promise leaf|T4 lower-edge regression'`

   Raw output: `06-targeted-initial-RED.txt`. Start 12:57:18 local, 2026-09-19;
   duration 9.22s; real process exit **1**. **15 failed / 24 deliberately unselected**.
   Failures: lower window accepted by engine and bridge; changed reservation at
   same week has identical digest; winner keeps submission receipt week45 at
   decision52; seven malformed proposal leaves accepted; wrong issuer's referenced
   promise accepted; missing/wrong/previous employment contract accepted.

2. `node_modules/.bin/vitest run tests/p14b1-t4-regressions.test.ts --minWorkers=1 --maxWorkers=1 -t 'terminal V29 promise reference integrity'`

   Raw output: `07-terminal-references-RED.txt`. Start 12:59:02 local, 2026-09-19;
   duration 9.54s; real process exit **1**. **13 failed / 1 passed / 14 deliberately
   unselected**. The positive naturally generated multi-beneficiary shared-take
   fixture PASSED, including distinct actual promiseOutcome receipts and a
   populated V29 byte-stable roundtrip. Missing/null/unknown/wrong-kind/swapped
   beneficiary outcome IDs and missing/non-take/unrelated/empty/duplicate/outside-
   window evidence, wrong progress, and an unbound outcome were all wrongly accepted.

The 'skipped' counts above are the CLI name-filter's unselected cases, not new
`it.skip` or todo entries. No assertions were removed to obtain a result.

## Fixture and test-side corrections

- New `tests/p14b1-t4-regressions.test.ts` owns focused engine/save regressions.
  It has no bridge imports, preserving the root and bridge TypeScript programmes.
- The bridge's lower-window quote regression lives in existing
  `tests/bridge-p14b1-promises.test.ts`. Its valid exact-contract-start control is
  offerable; moving only its start one week earlier must be IMPOSSIBLE / not offered.
- In `p14b1-promises`, attachment/revision/removal windows now start at the actual
  proposal start. Original digest change/restoration and at-most-one assertions
  remain. The upper-window rejection now uses a lawful lower edge so it continues
  to test the UPPER edge independently. Drift/freeze and bound/unbound due-week
  fixtures use the actual proposal start; their original due weeks are retained.
- The former freeze-drop test's claimed seven-week slack erosion depended on an
  invalid [45,59) window for [52,104). Its replacement preserves the required
  feasible-at-offer / changed-pipeline / FRAGILE-at-freeze / named-drop behavior:
  distinct lawful crews greenlight two actual pictures after submission, occupying
  both existing stages without the beneficiary. No facility row, receipt, employment
  or outcome is forged. This revised recipe remains UNEXECUTED at this handoff.
- The SATISFIED fixture's guessed `player:contract:<actor>` is replaced with the
  existing real employment-row helper; explicit person/studio pair assertions added.
- The rival attachment fixture in `p14b1-trust-chooser` starts at its real proposal
  start. All three existing chooser todos are retained. No D3 work started.
- `attachPromise` remains draft staging; no test now demands it throw merely for
  FRAGILE/IMPOSSIBLE classification. Quotes and freeze enforce offerability.

## Amendments and exact identity limits

After run 1, coordinator correctly noted that post-settlement state is not the
pre-commit freeze input. The freeze regression was amended to a transparent
pass-through spy: every call executes the actual engine feasibility service,
captures only this promise's decision-week calls BEFORE winner employment is
written, and requires the persisted receipt to equal an actual captured receipt.
The week/class/digest assertions remain. This observer version was present in run2
but excluded by that run's terminal-only name filter; it still requires execution.
Run1's raw output remains untouched; it records the initial receipt-week failure.

SHA256 of the NEW untracked test at run2 completion:
`29e2aa4fa87f80c6b91a0ffffe58e2efa097f56a02bb6d56c79f24b7c9612617`.
The pre-run1 untracked-file checksum was not captured; do not infer it from the
tracked git diff, which excludes newly untracked files.

After run2, four additional exact-reference rows were added, UNEXECUTED: missing
bound contract field, wrong beneficiary independently, wrong issuer independently,
and mismatched outcome week. At the coordinator's request, a fifth unexecuted case
pins compatibility using an explicitly SYNTHETIC old-writer variant of a valid
bound/BROKEN generated state. It changes only windowStartWeek and feasibilityReceipt
to a rules-v1 submission-time receipt whose digest reproduces d19's exact nine
draft inputs. Actual employment binding and outcome receipt stay intact; validation
must return the same bytes without fabricating replacement history. This is not
claimed as genuine old-writer fixture provenance. Final test-file identities:

```
4b4548ce01e1054e4e31ce6a42b7417645e893c40933a26fc2c8b776a3cf81bc  tests/p14b1-t4-regressions.test.ts
44d4e48796c47207c4aa1c4a484d88b5e4158c484c0399be0af1ac0b62c3b9e4  tests/bridge-p14b1-promises.test.ts
3f14a0b9d2f8a0e0c6659cb884f96a1cceef5c9e85ac2ba4b894286a62556b8f  tests/p14b1-promises.test.ts
1f33a2c3d813bbf4d86bf91a3c116b86e3dcf0b728bc4b5ff931edff1a954744  tests/p14b1-trust-chooser.test.ts
```

Tracked test diff before the five new rows (all five are in the untracked file):
SHA256 `59e02667337e7c8a49cc220c649ad8eef62c73962ee335648597509449b3d4dd`.
`git diff --check` passed after the final static edits. No typecheck or further
test was run after source/test-runtime ownership returned to the coordinator.

## Compatibility boundary and next actions

Coordinator ruling: preserve genuine recovered V29 submission-week receipts and
historically exported early-start windows without fabricating repaired history.
NEW offers/freeze enforce whole-window legality. These tests reject forged shape,
identity and backing-event references; they do not require every old saved receipt
week to equal contract start, nor demand retrospective rewrite of old promises.
No genuine historical-bound-window snapshot was newly minted by this task; do not
claim such migration coverage from these tests alone.

Next authorized verification, after production source is stable: run the new
33-case engine/save file, the 11-case bridge promises file, and the two modified
engine siblings serially with one worker. Specifically confirm the amended spy
and two-greenlight fixture before treating their assertions as proof. Parent owns
the heavy slot and full matched pass; T4 is not closed by these targeted results.

B.2 preparation remains aside at
`/tmp/studio-b2-tests-fCvmA5/P14B2-TEST-FIXTURE-BRIEF.md`; no B.2 implementation ran.
