# 684-T — the P14B.5-T requirement regression, authored and run RED

Authority: record 683 (the Owner's activated ruling 1) and the parent brief `684-T-tuning-red-brief.md`.
Not a checkpoint, not Owner acceptance, not a writer handback.

**No production file changed.** `RELATIONSHIP_FAILURE_DELTA` still reads 4 at `src/core/relationships.ts:72`
in this worktree. Nothing under `src/`, `bridge/`, `generated/`, `ui/`, `scripts/`, `package.json` or any
config was edited, and no existing test, fixture, helper, snapshot or timeout was touched. The only file
added to the repository by this work, besides this report, is the new test file below. Nothing was committed
and the evidence runner was not invoked.

## The deliverable

| fact | value |
| --- | --- |
| path | `tests/p14b5-t-failure-tuning.test.ts` (new) |
| lines | 466 |
| sha256 | `cc8c3645fce417ab80acdd28b919ae3c3ac68c365eace112ce46aa61ecbc5591` |
| cases | 12, in 7 `describe` groups (1-6 labelled `CONSTRUCTED`, 7 labelled `NATURAL WORLD`) |
| source at authoring | `63688a79` plus the parent's untracked 683/684/685 records |

Exact command, run from the worktree root:

```
npx vitest run tests/p14b5-t-failure-tuning.test.ts --reporter=basic
```

Run environment: vitest 2.1.9, node v20.20.2, darwin-x64, project `core`, `environment: node`.

## What the real run did (not a prediction)

`Tests 1 failed | 11 passed (12)`, process exit 1, duration 3.90s.

| group | verdict at the current constant | cases |
| --- | --- | --- |
| 1 CONSTRUCTED, the requirement | **RED** | 1 failed |
| 2 CONSTRUCTED, positive control | GREEN | 2 passed |
| 3 CONSTRUCTED, neutral control | GREEN | 2 passed |
| 4 CONSTRUCTED, drift read-only | GREEN | 2 passed |
| 5 CONSTRUCTED, replay and idempotency | GREEN | 2 passed |
| 6 CONSTRUCTED, save and load | GREEN | 2 passed |
| 7 NATURAL WORLD, one standard seed | GREEN | 1 passed |

The one failure, verbatim:

```
FAIL tests/p14b5-t-failure-tuning.test.ts > CONSTRUCTED group 1 — THE REQUIREMENT: repeated shared
failure must reach Strained (record 683 ruling 1) > a low-proximity pair whose shared pictures
repeatedly flop reaches the negative band
AssertionError: the repeated-flop chain must reach the Strained band: take-1@10=52 release-1@11=48
take-2@12=51 release-2@13=47 take-3@14=51 release-3@15=47 take-4@16=52 release-4@17=48 take-5@18=53
release-5@19=49 take-6@20=54 release-6@21=50 | lowest=47 strainedCeiling=44 finalTier=Acquaintances
sign=0 cappedCycleNet=1: expected 47 to be less than or equal to 44
 ❯ tests/p14b5-t-failure-tuning.test.ts:226:88
```

Group 1 carries the whole observation in its failure message, so a RED run reads as a measurement rather
than a bare mismatch. Three further requirement assertions sit behind that first one and did not execute:
the tier must read `Strained`, `pairChemistry(...).sign` must read `-1`, and the capped cycle must not net
positive. All four are stated against the adopted law.

`npx tsc --noEmit` exits 0 with the new file in the tree. The repository has no eslint configuration.

## The requirement trajectory and its arithmetic

The constructed chain: six pictures by one staged quartet, each taken in week `w` and released in week
`w + 1` with a critic score one point below `RELATIONSHIP_FAILURE_CRITIC_SCORE`, no dormancy anywhere, so
the whole chain sits inside `RELATIONSHIP_DRIFT_GRACE_WEEKS` and drift contributes nothing. The measured
pair is the low-proximity seat pair, director and support.

Per repeat picture the write path applies three drivers to that pair:

```
sharedProduction        + RELATIONSHIP_PROXIMITY_LOW          (2)
repeatedCollaboration   + min(sharedProductions - 1, CAP)     (1, 2, 3, 3, 3 ...)
sharedFailure           - RELATIONSHIP_FAILURE_DELTA
```

Once the accelerator caps, one whole cycle nets `LOW + CAP - FAILURE`, which is `2 + 3 - F`.

Measured at the shipped `F = 4` (the run above): 52, 48, 51, 47, 51, 47, 52, 48, 53, 49, 54, 50. The cycle
nets `+1`, the chain climbs, the lowest value reached is 47, and the pair ends at `Acquaintances` with
chemistry sign 0. The Strained ceiling is `RELATIONSHIP_TIER_FLOOR.Acquaintances - 1 = 44`. No number of
cycles reaches it, which is why the requirement is RED and why record 681 measured a constructed floor of
exactly 45 on its own staged variant.

At the adopted `F = 5` the same arithmetic gives 52, 47, 50, 45, 49, 44, 49, 44, 49, 44, 49, 44: the cycle
nets 0, the third flop crosses the band floor, and the pair settles at 44, inside Strained. The three later
cycles show it stays there. That row is paper arithmetic replayed through the real `currentTier` in a
calibration script held outside the repository, never a source edit; it agrees with the already published
sensitivity row in `681-closeness-floor-witness.txt` (`failureDelta=5 min 42 tier Strained entersStrained
true`, on 681's dormancy variant rather than this one). The engine matched the constant-derived model
step for step at the shipped value in the run above, which is the strongest evidence available before the
writer moves.

The trajectory assertion itself (`rows` against `expectedTrail(...)`) is derived from the exported constants
and passed at the shipped value. No delta literal appears anywhere in the test file; `4` and `5` are never
typed as a delta.

## What each green group pins

- **2, positive control.** All six seat pairs, driven with a hit score, follow the constant-derived
  trajectory for their own proximity weight, and each tops the ladder on exactly the picture the constants
  predict. The prediction contains no failure term, so the claim that the success driver, the proximity
  weights and the repeat accelerator are untouched is proved rather than assumed. Driver rows are asserted
  by name: the mint weight, `repeatedCollaboration` at `min(1, CAP)` on the second take, and every
  `sharedSuccess` at `RELATIONSHIP_SUCCESS_DELTA`.
- **3, neutral control.** A release at `RELATIONSHIP_FAILURE_CRITIC_SCORE` and one at
  `RELATIONSHIP_SUCCESS_CRITIC_SCORE - 1` return the same state object by reference, the single-effect
  check that nothing was minted. A four-picture chain of neutral releases follows the zero-delta
  trajectory, and every edge ends with `sharedFailures` 0.
- **4, drift.** A flopped low edge sits below the baseline (guaranteed by the pinned relation
  `FAILURE > PROXIMITY_LOW`), reads unchanged at exactly the grace boundary, then rises toward the baseline
  in step with an independent oracle written from the plan formula, lands exactly on the baseline at
  `GRACE + RETURN`, and never passes it, including a read a further 260 weeks out. Reads change no stored
  byte: the edge JSON and the whole root are byte-equal after `currentCloseness`, `currentTier` and
  `pairChemistry`, and the counters, `firstSharedWeek` and `peakTier` are asserted unmoved.
- **5, replay and idempotency.** Two advances from the same pre-state write byte-identical roots. A third
  advance over the same production id returns the same reference, for the take path and for the release
  path. `rngState` is byte-equal before and after every write of the whole chain.
- **6, save and load.** A root written by the real path round-trips `makeSave` to `validateSaveV31` to
  `migrateToV31` with every driver delta verbatim and the root byte-identical. The second case relabels the
  stored `sharedFailure` deltas to a value the current constant does not produce (one point smaller in
  magnitude, derived from the constant, never typed), and shows the validator admits it, the save carries
  it, the migration returns it unchanged, and the stored `closeness` beside it is carried too. That is the
  prospectivity claim of record 683 in executable form: the format pins no value, a historical stamp is not
  restamped, and a resumed campaign continues from its stored value.
- **7, natural world.** The standard seed `p13a-core-causal-01` with no player action, advanced one week at
  a time by the live `tick` until the engine records its own shared failure. Measured: the first edge mints
  at week 8, the first natural flop lands at week 13, and it moves exactly the six pairs of one rival
  picture. Each stores `delta = -RELATIONSHIP_FAILURE_DELTA`, each has that flop as its only movement that
  week, and each lands on the pre-flop value minus the constant: 56 to 52, 54 to 50, 52 to 48 (the 48 is the
  `minClosenessEver` row that record 682 reports at week 13 on `relationship-edge-20`, independent
  corroboration that this arm is looking at the same event). The group asserts the driver and the
  arithmetic. It does **not** assert that a natural campaign reaches Strained, at either value.

## Existing assertions that the constant change will break

Listed, not touched.

1. `docs/engineering/playability-launch-review/evidence/p14b4-20260919/681-b5-closeness-floor-witness.ts`,
   lines **102, 103, 104, 113** and the cross-check at **144**. The 681 witness measures a constructed
   floor and then asserts it equals `RELATIONSHIP_TIER_FLOOR.Acquaintances` and sits exactly one point above
   the Strained ceiling. At the adopted value its step-4 measurement becomes 43, its later cycles reach 42,
   and the first failure is `assert.equal(currentTier(low(), week), 'Acquaintances')` at :102, which will
   read `Strained`. Its published output `681-closeness-floor-witness.txt` is a measurement at the old
   value and stays true as a historical record; only a re-run breaks. It is a `vite-node` evidence probe
   under `docs/`, outside the vitest include globs (`src/**/*.test.ts`, `tests/**/*.test.ts`), so the test
   suite does not run it and no suite result depends on it. Whether 681 is re-run, amended with a dated
   note, or left as a closed old-law record is the parent's call, not mine.
2. Nothing else found. Every reference to the constant in `tests/p14b5-relationships.test.ts` is by name
   (:403, :407, :420, :663, :665, :680, :705, :735), no test in the repository pins a literal closeness
   value (grep for closeness equality assertions returns only my own group 6 line), the pinned relation
   `FAILURE > PROXIMITY_LOW` still holds at 5 > 2, the family-4 staged pair at the Acquaintances floor still
   reads Strained (45 - 5 = 40, band 31 to 44), and `676-b5-week260-probe.ts` contains no assertion at all.
   This confirms record 683's second prediction by inspection.

## Limits: what this test cannot establish

- It cannot show that the writer's edit is correct. It shows what the adopted law requires; a green group 1
  after the change proves reachability on this path, not that 5 is the right balance value. Record 683 calls
  the value provisional candidate tuning, and this file makes no balance claim.
- The `F = 5` trajectory above is arithmetic, not a measurement of the shipped constant. Only the writer's
  landed candidate can produce the measured row.
- Groups 1 to 4 run over a partial object cast to `GameState`. Every populated field is named in the file
  header. The relationship write path and the real root validator are exercised in full; no other root is.
- Groups 5 and 6 use a real generated campaign as a carrier (`p13a-core-causal-01` at week 6, before that
  seed mints its first natural edge at week 8, asserted as a premise), but the pictures, the seats and the
  takes over it are constructed. This is not natural play and no number from it describes a campaign.
- Group 7 observes one seed to week 13. It says nothing about the other three standard seeds, nothing about
  week 260 or 416, and nothing about whether any natural campaign reaches Strained at either value. That
  remains the parent's post-row re-run of `676-b5-week260-probe.ts` against record 682.
- No D5 settlement receipt is exercised here. For the record, the only live consumer of the tiers is
  `src/core/talentMarket.ts:842-844`, which bands `CloseFriends`/`Inseparable` at 2 and `Enemies`/`Nemeses`
  at 0. Enemies and Nemeses are unreachable by rule, so a newly reachable `Strained` moves no band; it reads
  1, exactly as `Acquaintances` does. The one channel by which the change could move a settlement is an edge
  with accumulated failures crossing the `CloseFriends` floor downward, which is worth watching in the post
  row and is not something a constructed test should assert.
- No native build, no Unity player, no UI, no input slot, no Owner campaign was involved at any point.

## Next concrete action

Release this RED to the writer for the one-line change at `src/core/relationships.ts:72` with its doc
comment, then re-run the exact command above and expect 12 passed. If group 1 goes green while any of
groups 2 to 7 turns red, that is a defect in the change, not in the requirement.

## Addendum: the hygiene violation this file caused, and its comment-only fix

The full core run on the landed candidate (run 688, `RELATIONSHIP_FAILURE_DELTA = 5` at
`src/core/relationships.ts:80`) failed `tests/hygiene.test.ts`, which reads every `.ts` file under `src/`
and `tests/` and refuses the literal substring anywhere in the contents, comments included. My line 41
spelled it out while restating the brief's constraints. Reworded, comment only:

- old: ``//     no validator is loosened, no RNG, no wall clock, no `Math.random`.``
- new: `//     no validator is loosened, no RNG, no wall clock, no unseeded entropy of any kind.`

New sha256 `bc02cfcf342c7a975c0ddf8b38198ad4a18d7793aafa39fd73a35d60ee4f6012`, still 466 lines. Restoring
that one line reproduces the published `cc8c3645...` byte for byte, and `diff` reports exactly `41c41`:
no assertion, group, import, staged world or any other executable line changed.

Verified one at a time: `npx vitest run tests/hygiene.test.ts --reporter=basic` gives 1 passed (775ms);
`npx vitest run tests/p14b5-t-failure-tuning.test.ts --reporter=basic` gives **12 passed** (4.50s), group 1
now green on the landed constant. Not committed.
