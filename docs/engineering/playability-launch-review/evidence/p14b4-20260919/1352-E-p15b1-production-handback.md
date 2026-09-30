# 1352-E: P15B Wave 1 production handback (corporate condition and loan law)

**Verdict: DONE.** The final RED r3 (52 leaves) passes 52/52 without any test edit. The type gates add no error. The
patch applies cleanly on the current HEAD and stacks with the pending slice A patch.

Writer: sim-core production writer, the single writer for this record. Patch:
[1352-stage/1352-p15b1-production.patch](1352-stage/1352-p15b1-production.patch), sha256
`4d7115803848e282ee788842597e847778fb6700a2aa5825c2aec07e1a6d433b`, 324 lines, 17,841 bytes. It adds 301 lines in
three files and deletes none.

## 1. Base check

| When | HEAD | Non-docs change since abfcd580 |
|---|---|---|
| Start (brief base) | `abfcd58058526005b43f5f72c3d589e153fbfa64` | none |
| First apply check | `00d727c2acc8b989bed70fba9caab5407d03f515` | none (records only) |
| Final checks | `c614b7e9ed62dcb889118ba1eadb8a2bafa7934a` | 17 files: shelving landed (b6fcf948..a988108b, 1344-L) |

Shelving changed `src/core/tuning.ts` and 16 other files, so I rebuilt the scratch tree at c614b7e9 and re-ran every check
there (§4). The published patch is the diff at c614b7e9. The first cut, against abfcd580 (sha256 `0c2abab…31b65c`),
differs only in the `tuning.ts` index line and hunk header (`@@ -1008` against `@@ -1014`). Module bytes are identical in
both trees: `corporateCondition.ts` sha256 `428f2e59…` and `studioLoan.ts` sha256 `def5bd5b…`.

## 2. Method (1327-C scratch method)

- Tree 1: `…/scratchpad/1352-prod/tree`, archived from abfcd580 (src bridge ui generated scripts package.json
  package-lock.json tsconfig*.json vitest.config.ts vitest.workspace.ts AUDIO-PROVENANCE.md, plus tests without
  fixtures). docs, node_modules, art, tools and tests/fixtures are symlinks. Commits: `base` df222fd, `red-r3` 2730eac,
  `1352-E production` e48ddb7.
- Tree 2: `…/scratchpad/1352-prod/tree2`, the same recipe at c614b7e9. Commits: `base` e07c2bd, `red-r3` 6228783,
  `1352-E production` 0d3ebcc.
- RED r3 patch sha256 `6a48ddd3…b7dc740e43`. The test blobs stayed `210caa6` (corporate condition) and `b2109ea` (loan)
  in both trees from the red-r3 commit onward: no test was edited.
- The real repository received only this record and the patch. I made no stash, checkout or index change there; the
  apply checks used scratch `GIT_INDEX_FILE`s.

## 3. What changed (file:line at c614b7e9)

**`src/core/corporateCondition.ts`** (new, 197 lines), law `corporate-condition/v1`:

| Lines | Content | Authority |
|---|---|---|
| 1-42 | Header: authority, purity, the counter and transition steps, the first evaluation, the causes table | 1352-A §4, 1352-F, 1352-F2 |
| 44-67 | `CORPORATE_CONDITION_VERSION` and the pinned types | parent API decisions |
| 71-94 | Fact, stage and prev validation. Messages carry weeks and stage names, never money | brief |
| 97-102 | `coverWeeks`: cash / O, ±∞ by the sign of cash at O = 0 | 1352-A §4.1 |
| 110-119 | First evaluation from the zero condition (since = week, week = week − 1); refusal of a closed prev; the sequential-week rule | 1352-F2 ruling 1, 1352-A §4.2 |
| 121-126 | Counter step: low, negative, lowRun, negativeRun, clearRun, distressWeeks | 1352-F Amendment 1 |
| 128-152 | Transition step: at most one row per week, in table order, with the exact cause list per row | 1352-A §4.2, Amendment 2, 1352-F2 ruling 3 |
| 154-165 | `next`: since moves on a transition; distressWeeks is 1 on entry, the counter value in distress and 0 elsewhere, closed included | Amendment 1, 1352-F2 ruling 2 |
| 176-192 | `remedies`: fixed order LOAN, REDUCE_OBLIGATIONS, RELEASE. LOAN goes through `loanEligible`. Only LOAN reads the stage | 1352-A §4.3, Amendment 4 |
| 195-197 | `publicCondition`: stage and since only | 1122-A, 1352-A §4.2 |

**`src/core/studioLoan.ts`** (new, 86 lines), law `studio-loan/v1`:

| Lines | Content | Authority |
|---|---|---|
| 1-22 | Header: eligibility, principal, flat interest, schedule, no refinancing | 1352-A §4.4 |
| 24 | `import type` only from corporateCondition: no runtime import cycle | n/a |
| 37-43 | `loanMaxPrincipal` = floor(26 · wfc / 1000) · 1000; rejects negative or non-finite wfc | 1352-A §4.4 |
| 45-56 | `loanEligible`: warning or distress, no outstanding loan, not founding, max ≥ step | 1352-A §4.4, Amendment 4 |
| 63-79 | `contractLoan`: principal law, total = p + p · 12 / 100, installments floor plus remainder | 1352-A §4.4 |
| 82-86 | `loanInstallmentDue`: installment i due in week contractedWeek + 1 + i, 0 outside | 1352-A §4.4 |

**`src/core/tuning.ts:1018-1034`**: the ten keys at the end of `TUNING`, after the shared-market block. The block comment
names Owner ruling 3 of 1342-O and the delegated authoring of 1352-A §4.5 as amended by 1352-F. It states the range
the bounded-term test asserts (every key an integer > 0) and says which definition version a change must bump. Per-key
comments carry the two cross-key facts the test pins: CLOSURE_DISTRESS_WEEKS equals LOAN_MAX_FIXED_COST_WEEKS, and
LOAN_TERM_WEEKS is at most the smallest total, 1,120.

Not changed: GameState, save, projection, tick, Bridge, UI, Unity, `src/core/index.ts` and every test. The Wave 1 laws
sharedMarket and powerRanking are not exported from the barrel either. Wave 2 decides the export.

## 4. Checks run

### Tests (the two RED files only)

`node_modules/.bin/vitest run --project core tests/p15b1-corporate-condition.test.ts tests/p15b1-studio-loan.test.ts`

| Tree | Result | Duration | Slowest leaf |
|---|---|---|---|
| Tree 1 at red-r3, no production (RED baseline) | 52 failed / 52 | 1.89 s | n/a |
| Tree 1 with production | 52 passed / 52 (41 + 11) | 1.40 s (tests 362 ms) | 170.5 ms, `condition-definition-version-export` (first dynamic import) |
| Tree 2 (c614b7e9) with production | 52 passed / 52 | 3.09 s (tests 625 ms) | 196.0 ms, the same leaf |

On tree 1, the corporate-condition file summed 326.8 ms over 41 leaves and the loan file 26.1 ms over 11. Every leaf ran
far inside the core default of 5 s.

### Type gates

| Gate | Tree 1 (abfcd580) | Tree 2 (c614b7e9) with production | c614b7e9 alone |
|---|---|---|---|
| `tsc --noEmit -p tsconfig.json` | exit 0, empty | exit 2, 19 errors | exit 2, the same 19 errors, byte-identical output |
| `tsc -p ui/tsconfig.json --noEmit` | exit 0, empty | exit 2, 2 errors | byte-identical |
| `tsc -p tsconfig.bridge.json` | exit 0, empty | exit 2, 2 errors | byte-identical |

The c614b7e9 errors are all `SaveFileV43` passed where tests and helpers type `SaveFileV42` (for example
`tests/helpers/p14c2b-fixtures.ts:69`, `tests/save.test.ts:370`). They are the Save43 sweep fallout that 1344-L names as
the next measurement. None names a P15B file, and my patch adds none. At RED, tree 1's root gate showed exactly the two
expected TS2307 errors: the missing `corporateCondition.js` and `studioLoan.js`.

### Apply checks (scratch index on the real repo)

| HEAD | Stack | Result |
|---|---|---|
| 00d727c2 | r3 + production | OK, tree 091d1fe4 |
| 00d727c2 | slice A step 3 + r3 + production | OK, tree bc8360fd |
| 00d727c2 | shelving step 5 + r3 + production; shelving + slice A in both orders + r3 + production | OK; both orders give tree c5fcf771 |
| c614b7e9 | r3 + production (the published patch) | OK, tree 5f656d68, 0 offsets |
| c614b7e9 | slice A step 3 + r3 + production | OK, tree 55c3cb1a, 0 offsets on this patch |
| c614b7e9 | r3 + production + slice A step 3 | OK, the same tree 55c3cb1a |

Shelving step 5 no longer applies at c614b7e9 because it has landed. Slice A is now the only pending production patch,
and it touches no file this patch touches.

## 5. Independent reference check (outside the patch)

Script `…/scratchpad/1352-prod/refcheck/refcheck.ts` (sha256 `0eafe420…6fab236d4`), run with
`node_modules/.bin/vite-node` from tree 1. Output: `refcheck/refcheck-run.txt` (sha256 `05a8ff73…106507e9`), exit 0,
`REFCHECK PASS`.

The reference transcribes 1352-A §4 as amended by 1352-F and 1352-F2 into a seven-row table. It picks the first matching
row for the prior stage, and it takes `low` from the exact integer form `cash < 4·O` (or `cash < 0` at O = 0), not from
the division the production code uses. It runs over seeded random sequences built from regimes: clear, low positive
(including 0), negative, straddling the cover boundary at 4O − 1, 4O and 4O + 1, zero or −1, and mixed. It uses random
fixed costs (8% zero) and random installments. Every input is deep-frozen, so any mutation throws.

| Part | Scale | Checks |
|---|---|---|
| Implementation against reference at the charter values | 20,000 sequences, 1,964,769 steps | `next` and `transition` equal (canonical JSON); the step run twice gives the same output; JSON round-trip; `coverWeeks` agrees with the integer `low`; `publicCondition`; a closed prev throws `/closed/`; the worked example fires 4, 8 and 33 |
| Law invariants on the reference | every step | Lemma A (negative implies low; lowRun ≥ negativeRun; lowRun > 0 exactly when clearRun = 0); no two rows match (every step); distressWeeks > 0 exactly in distress; causes are integers ≥ 1, at most 2 |
| Lemma B, parametrized | cover threshold ∈ {1, 2, 4, 13, 50}, 2,355,106 steps | distress entry fires exactly when negativeRun reaches 8 while the prior stage is not distress; the implementation still matches the reference. `TUNING` is restored and checked afterwards |
| `remedies` and `loanEligible` | 50,000 random cases | exact family lists; `remedies` on a closed condition throws |
| Loan law | 20,000 cases, 16,424 contracted | legality of every principal; total; 52 installments of q or q + 1 with the remainder first; exact sum; `loanInstallmentDue` from contractedWeek − 2 to contractedWeek + 55 |

Every transition row fired: stable→warning 39,141; warning→stable 22,061; warning→distress 16,839; distress→recovery
10,954; recovery→warning 8,061; recovery→stable 1,544; distress→closed 3,743.

I also injected two defects, one at a time, at REFCHECK_SCALE 0.1, then restored the file (sha256 `428f2e59…` before and
after, byte-identical):
1. Closure without the negative-cash guard: FAIL at week 1745, where the implementation closed on `negativeRun` 0 and
   the reference stayed in distress. Exit 1 (`inject1.txt`).
2. Warning→distress causes swapped: 3,708 failures, the first at week 1131. Exit 1 (`inject2.txt`).

Limit: I wrote both the reference and the production code. The reference follows a different code path (a row table,
integer cover), but it is not an independent author's reading.

## 6. Findings and routine decisions

1. **`remedies` refuses a closed condition** (`corporateCondition.ts:178`). 1352-A §4.3 and the API decisions do not
   say what a closed studio's list is. I chose a throw, mirroring the step's refusal. The alternative is to return
   `[]`. I recommend the throw: Wave 2 never evaluates a closed studio, and Wave 4 owns closure. No RED leaf covers
   this case.
2. **`contractLoan` checks only the principal law.** The pinned signature carries no stage, loan or founding state,
   so eligibility stays with the caller. Wave 2's `takeLoan` and the rival policy must call `loanEligible` first, and
   Wave 2 RED should pin that.
3. **Cover uses division, as the charter writes it.** `low = cash / O < 4` equals the integer `cash < 4·O` for
   integer money below 2^51, because `4 − cash/O ≥ 1/O` is far above one ulp. The reference check found no
   disagreement over about 4.3 M steps, boundary straddles included. If Wave 2 ever feeds fractional cash, the two
   forms could differ only within one ulp of the boundary.
4. **Validation beyond the pinned throw list**, all fail-loud and money-free:
   - `stepCondition` checks a non-null prev: known stage, integer fields, non-negative counters;
   - `remedies` validates facts and capability: a non-negative integer `terminableContracts` and boolean flags;
   - `loanMaxPrincipal` rejects a negative or non-finite fixed cost;
   - `contractLoan` and `loanInstallmentDue` reject non-integer weeks;
   - `contractLoan` throws if a future tuning makes the total non-integer.
5. **1352-B2 non-blocking note (Lemma B never parametrized in RED):** §5's parametrized run covers it as evidence
   only. The suite still has no such leaf.
6. No conflict with the authority found. Negative cash alone never warns before four low weeks. Distress comes only
   from warning, at the eighth negative week. Recovery declines only through warning. Closure is at the 33rd negative
   week at the earliest. The rival projection carries no number. The loan is explicit, flat-interest, one law for both
   studios, and never automatic.

## 7. Evidence limits

- I ran no broad suite, as the brief directs. The stack with slice A was apply-checked only: it was neither
  type-checked nor tested.
- The c614b7e9 type gates are red before my patch too, so at that HEAD they prove only that the patch adds no error.
  Tree 1 shows the clean-base result: exit 0 on all three gates.
- The scratch evidence (trees, reference script, outputs, JSON reporter files) sits under
  `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1352-prod/`,
  which the system does not keep. Archive the reference script if you want it kept.

## 8. Next action

Parent: commit the r3 tests, then land this patch through the index (`git apply --cached`) as one commit; optionally,
dispatch an independent implementation review. Wave 2 still waits for the §6 natural-route measurement of 1352-A.
