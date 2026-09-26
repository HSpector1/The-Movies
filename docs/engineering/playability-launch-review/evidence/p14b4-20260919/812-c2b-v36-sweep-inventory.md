# 812 — the V35 → V36 sweep inventory, keyed on the VALUE

Measured by the parent at `8cf6bed2` plus the writer's uncommitted follow-up (2026-09-26 04:20 CEST), with
`tests/p14c2b-*` and `tests/helpers/p14c2b-fixtures.ts` excluded (the RED author owns them). The rules of 763,
776 and 794 carry over: grep the value, decide frozen versus live per LINE, and count the sweep finished only
when every test touching the bumped surface has RUN. The test author takes `tests/`; the writer took `src/`,
`bridge/`, `ui/` and `scripts/` (811).

## 1. What the writer already measured (811 §5)

- 37 test-side type errors: 27 root errors in 19 files, 10 bridge errors in 5 files. Kinds: `SaveFileV36` meeting a
  `SaveFileV35` annotation (7); a V35 state or root where `GameState` is required (21); a hand-built
  `TalentMarketCase` without `variant` (8, four sites); one `RetirementRecord` literal without the V36 keys.
- 14 class (a) suite failures in `p14c2a-save-and-settlement`, `p14c4-save-v35`, `p14a1-save-v28`,
  `d11-employment`, `bridge-p14a1-market`, `bridge-p14a2-market` and `p14b1-promises`. Each passes at HEAD in a
  `git archive` extract. `p14b1-trust-chooser` fails identically at HEAD and is not a sweep item.
- The writer names four helpers: `c4LiveFixture`, `liveEnvelope`, `syntheticRecord`, `withSyntheticCareerLifecycle`.

## 2. The classes

| | class | where | count | rule |
| --- | --- | --- | --- | --- |
| T1 | live-version literals: `toBe(35)`, `saveVersion: 35`, `=== 35`, `!== 35` | `tests/` | 79 lines / 46 files | per line. An assertion that the LIVE writer stamps 35 moves to `LIVE_SAVE_VERSION`; a genuine V35 fixture validated as V35 stays, with its reason. 794's grep missed the `!== 34` form; this one includes `!== 35` |
| T2 | unknown-version sentinels: a forged `saveVersion: 36` expected to be refused as unknown | 30 lines / 16 files | 36 is now known. The sentinel moves to `LIVE_SAVE_VERSION + 1` so the next bump does not repeat this |
| T3 | the refusal message `versions 1 through 35 only` | 20 lines / 13 files | the source says `through 36`. Match the live number (derive from `LIVE_SAVE_VERSION` where the test already imports it) |
| T4 | `validateSaveV35` | 176 lines / 43 files | per line. A check of what the live writer emits moves to `validateSaveV36` (or `validateSave`); a check of a genuine V35 fixture stays |
| T5 | `GameStateV35` / `SaveFileV35` annotations | 12 files | per line, the same split |
| T6 | **the silent class: `LIVE_SAVE_VERSION` beside a V35 type** | 21 files co-use `LIVE_SAVE_VERSION` with `validateSaveV35`, `SaveFileV35`, `GameStateV35` or `convertV34ToV35` | 21 files | a value grep cannot find these. An envelope stamped `LIVE_SAVE_VERSION` around a state validated as V35 (811's `liveEnvelope`) now claims 36 while carrying a V35 shape. Read each file; state per site which version it means |
| T7 | hand-built V36 shapes | records: `p14c2a-consumers` 17, `p14c2a-save-and-settlement` 14, `p14c2a-core-lifecycle` 7, `helpers/p14c2a-fixtures.ts`, `bridge-p14a2-market`, `bridge-p14b4-cast-class` 1 each (lines with `effectiveWeek:`); cases: `bridge-p14b5-relationships`, `p14b1-trust-chooser`, `p14b4-cast-class-policy`, `p14b5-relationships` (lines with `openedWeek:`) | ~41 record lines, 4 case sites | a live record gains `extensionUsed: false, extendedFromWeek: null`; a live case gains `variant: 'expiry'`. A V35 envelope stays V35. The writer is making a V36 record without `extensionUsed` throw at discovery, so a record that silently skipped before may now throw: attribute each such change, do not suppress it |
| T8 | the four named helpers | `c4LiveFixture`, `liveEnvelope` (`p14c4-save-v35` / `helpers/p14c4-fixtures.ts`), `syntheticRecord`, `withSyntheticCareerLifecycle` | 4 | each states whether it builds a live state (route through `migrateToLive`, as 810's F1 repair does) or a frozen V35 one |

## 3. The enumerated strip lists (a value grep does not find these)

Each site deletes a whole `careerLifecycle` or `talentMarket` root. V36 puts a moved retirement in the record
and an open extension in the market. A helper that deletes the root silently drops both. Each site must ALSO
assert, before deleting, that no record has `extensionUsed` and no case is a `retirementExtension`.

| site | deletes |
| --- | --- |
| `tests/contracts/_v14Contract.ts:410`, `:446` | `talentMarket`, `careerLifecycle` |
| `tests/facility-move-demolish.test.ts:828`, `:857` | `talentMarket`, `careerLifecycle` |
| `tests/p13b-r07-save-v25.test.ts:165`, `:193` | `talentMarket`, `careerLifecycle` |
| `tests/p14c1-materialized-aging.test.ts:409` | `careerLifecycle` (destructured away) |
| `tests/p14b5-relationships.test.ts:237` | `careerLifecycle` (destructured away) |
| `tests/p14a1-save-v28.test.ts:161`, `tests/p14b1-save-v29.test.ts:139-141` | `talentMarket` (destructured away for a comparison; check the comparison still means what it says) |

## 4. Behavioural blast radius, stated BEFORE the sweep runs

C.2b changes behaviour in every industry world where an employee who announced retirement is still employed
at `E − 12` and the employer bids. The rival branch bids whenever the bonus clears its reserve (806 §5), so
this is common in long rival worlds. From that week, `effectiveWeek`, `state.contracts`,
`hollywood.employment`, rival rosters and every later hiring sample may move. A changed result is admissible
only in a test whose industry world reaches an announced employee's `E − 12` and reads retirement, contracts,
employment, rosters, listings or a digest of them after that week. Everything else is a defect until traced.

## 5. Not sweep sites

`generated/` must stay EMPTY (811 measured it clean). Evidence records under `docs/` are history and never
move. The RED's own files (`tests/p14c2b-*`, `tests/bridge-p14c2b-*`, `tests/helpers/p14c2b-fixtures.ts`) are
the RED author's.
