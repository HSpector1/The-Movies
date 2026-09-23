# 713 — the UI suite on the D2 candidate: the prediction FAILED, and what the measurement found

Record 709 predicted the UI baseline would reproduce exactly. It did not. This record holds
the falsification, the investigation the Owner's standing rule requires, and the attribution.

## The run

| field | at start | at end |
| --- | --- | --- |
| `sourceSha` | `fc37bd27efd43fdd171374a1f44aedf525b050db` | same |
| `testedDiffSha256` | `e3b0c442…` (empty diff) | same |

`"fixedSource": true`, `exitCode` 1, start `2026-09-22T23:12:05.653Z`, end `23:27:20.340Z`,
912.25s. Command `npm run test:ui`, matching baseline 673 exactly.

| | 673 (predicted to repeat) | 713 (observed) |
| --- | --- | --- |
| test files | 8 failed / 193 passed (201) | 8 failed / 193 passed (201) |
| cases | 26 failed / 2659 passed / 5 skipped (2690) | 30 failed / 2655 passed / 5 skipped (2690) |

Four more failures. The identities move further than that net suggests: SIX failures are new
and TWO baseline failures went green. Four of the six new ones read
`Test timed out in 5000ms.`; two are assertions.

## The prediction was wrong, and wrong in the way the Owner named

Record 709's basis was: `git diff df693294 HEAD -- ui/` is EMPTY, so no UI source moved. That
diff is still empty at `fc37bd27`, re-verified. The inference from it was the error.

The Owner's standing correction, issued before this run: "Unchanged `ui/` files do not alone
prove unchanged behavior across dependencies." That is exactly the inference 709 made. The UI
baseline `df693294` predates the B.5-T tuning, and `git diff df693294 fc37bd27` over non-test
source shows the engine DID move:

    src/core/relationships.ts | 10 +-      RELATIONSHIP_FAILURE_DELTA 4 → 5

709 checked the wrong directory and called it proof. The prediction is recorded as failed
rather than reinterpreted.

## Investigation, per the rule that neither default may be applied

The Owner's rule for a returning timeout governs here too: identify what failed to finish and
whether the source change caused it. Neither "engine defect" nor "environmental noise" is
applied by default. Four measurements were taken.

### 1. Reachability of the changed constant

`RELATIONSHIP_FAILURE_DELTA` is read at exactly ONE site, `src/core/relationships.ts:307`,
inside `driveTake`, applying a closeness delta for a `sharedFailure`. It is re-exported at
`src/core/index.ts:1462` and read nowhere else in `src/`, `bridge/` or `ui/`.

Nothing under `ui/src` reads relationship state at all. Grepping `relationships`, `closeness`,
`pairChemistry` and `RelationshipTier` across non-test UI source returns ONE hit, a prose
comment in `ui/src/lot/snapshot/stage7Production.ts:109` about identity relationships, which
is unrelated. The constant moves a stored number no UI surface renders. It also consumes no
RNG, so the seeded stream is unchanged.

### 2. Targeted repetition at both revisions, same machine

The three files carrying the new failures, run with one command against HEAD and against a
throwaway worktree at `df693294`. Same physical volume (`/dev/disk1s1` both), and
`vitest.config.ts`, `vitest.workspace.ts` and `package.json` are byte-identical between the
revisions, so the only difference is the constant. Raw in `713-X-targeted-repetitions.txt`.

| revision | failures across four runs, of 74 cases |
| --- | --- |
| HEAD (`delta = 5`) | 16, 13, 14, 15 |
| `df693294` (`delta = 4`) | 15, 13, 11, 16 |

The UNCHANGED source ranges from 11 to 16 by itself. The ranges overlap; the baseline produced
both the lowest and the joint-highest value.

### 3. Per-case rates across ten runs

Nine cases failed in all ten. THIRTEEN are intermittent. HEAD's mean was 15.0 against the
baseline's 13.6, which is a lean rather than a separation, and is not relied on either way.

### 4. The decisive run: the full UI suite at the BASELINE source, today

Measurement 2 compares targeted runs, which are not the shape 673 and 713 were taken in. So
the full suite was run in the baseline worktree, same command, same machine.
Raw in `713-X-ui-baseline-source-rerun.txt`.

| run | source | failures | files |
| --- | --- | --- | --- |
| 673, recorded earlier | `df693294` | 26 | 8 |
| baseline source, TODAY | `df693294` | **32** | 9 |
| 713, today | `fc37bd27` | 30 | 8 |

The unchanged baseline source returns 32 today against the 26 it recorded as 673. It is WORSE
than the candidate, which returns 30. Across the three full runs, 24 cases fail in all three
and 38 fail in at least one, so 14 are intermittent.

Per file, with the stable files shown for contrast:

| file | 673 | baseline today | HEAD today |
| --- | --- | --- | --- |
| `lot/authored-rgba-export.test.ts` | 6 | 6 | 6 |
| `lot/authored-stage-a.test.ts` | 4 | 4 | 4 |
| `test/contracts/p05a-w2-closed-production.contract.test.ts` | 2 | 2 | 2 |
| `lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx` | 1 | 1 | 1 |
| `lot/WorldFirstWorldInspectorDefault.test.tsx` | 10 | 9 | 12 |
| `lot/WorldFirstLotNativeNextEventApp.test.tsx` | 1 | 2 | 2 |
| `lot/WorldFirstLotNativeCastingReviewApp.test.tsx` | 1 | 1 | 2 |
| `lot/livingTurn.parity.test.tsx` | 0 | 1 | 0 |
| `lot/livingTurn.scheduler.test.tsx` | 1 | **6** | 1 |

The `livingTurn.scheduler` row settles it. The largest swing in the whole comparison, 1 to 6
and back to 1, happens at the source that did NOT change, and HEAD sits at the same value 673
did. Seven cases fail at the baseline today that do not fail at HEAD, including a cluster in
`livingTurn.scheduler` and one in `livingTurn.parity` that 673 did not record either.

## Attribution

The source change did NOT cause the movement. The candidate cannot reach these tests: the one
engine constant that moved is read at a single site and no UI surface reads its output. The
unchanged baseline source, measured directly, moves by more than the candidate did, in both
directions, and lands worse than the candidate on the like-for-like full run.

673's 26 and 713's 30 are both single samples from an unstable distribution. 673 was treated
as a fixed baseline. It is not one.

## What this does NOT establish, and what it leaves open

1. **The mechanism.** Why these files are unstable is NOT established here. Four of the six
   new failures are 5000ms timeouts, and `WorldFirstWorldInspectorDefault` shows both
   timeouts and DOM-query assertion failures, which is the shape of an async or shared-state
   race. That is a hypothesis, not a finding, and no test was touched.
2. **That the candidate is harmless to the UI.** It establishes that the observed movement is
   not attributable to it. Those are different claims and the weaker one is the one made.
3. **Any repair.** Nothing was changed. No timeout was widened and no test was quarantined.
   Turning a red test green by raising its limit is the bending this program refuses.

## Carried finding, for the Owner

**The UI suite cannot currently serve as a regression baseline.** Fourteen of its cases are
intermittent, concentrated in `ui/src/lot/WorldFirstWorldInspectorDefault.test.tsx`,
`livingTurn.scheduler.test.tsx` and two Lot-native App integration files. Until that is
addressed, a UI count difference between two runs carries no signal about a source change, and
every future UI comparison in this program has to be read that way. This is recorded, not
acted on: it is outside the authorized B.6 slice and is not a licence to touch those tests.
