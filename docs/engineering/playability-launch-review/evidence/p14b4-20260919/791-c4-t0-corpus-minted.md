# 791 — P14C.4-T0 corpus minted

Source `ff7b9ac1d334709f1c907e6f7e6d918b935ee9a5` (published; `src/` is the FINAL V34 writer — the live
C.2a retirement engine, 773/777 — before any C.4 source change). Minter archived at
`791-mint-v34-c4-corpus-minter.test.ts` and removed from `tests/` after use, so no suite collects it.
Built on the 774/775 T0 pattern: six worlds, each built and PROVED by `expect()` before any byte was
written, round-tripped in memory, written with `wx`, then re-read from disk and re-validated through
`validateSaveV34`.

## Commands and outcomes

```
node_modules/.bin/vitest run tests/p14c4-mint-v34-corpus.test.ts --minWorkers=1 --maxWorkers=1
```
Run without `STUDIO_MINT_V34_C4_CORPUS_APPROVED` set: 1 test **skipped**, exit 0, 2.86s (2026-09-25
22:30:10 CEST) — confirms the minter is inert by default.

```
STUDIO_MINT_V34_C4_CORPUS_APPROVED=$(git rev-parse HEAD) \
  node_modules/.bin/vitest run tests/p14c4-mint-v34-corpus.test.ts --minWorkers=1 --maxWorkers=1
```
Two approved attempts, both PASSED on the first try (no failed approved attempt this time — unlike
775's own history, no import-path or missing-file error was hit):
1. First attempt (2026-09-25 22:33:13 CEST start): PASSED, exit 0, 39.41s (tests 36.22s). All six
   worlds built, proved, written, re-read and re-validated. `publishedRecoverySha` resolved to the
   same sha as `headSha` (`git ls-remote origin wip/headless-program-20260916-ts` returned the minting
   head), so `publicationState` reads `PUBLISHED`.
2. Between attempt 1 and the final one, this record's own text (790) was corrected (a "not
   independently demonstrated" claim about stale retired ids in `state.freeAgents` was replaced with
   the concrete measurement attempt 1 itself had just produced: 40 such ids in the deep-deficit
   world). Since every fixture's provenance embeds `measurementSha256` (a hash of 790's OWN bytes at
   mint time), correcting 790 after minting would leave that hash pointing at a superseded version of
   the record it cites. The output directory was removed (`rm -rf
   tests/fixtures/p14/genuine-v34-c4-corpus`) and the approved minter re-run in full.
3. Final attempt (2026-09-25 22:34:58 CEST start): PASSED, exit 0, 39.34s (tests 36.16s). Every
   fixture's compressed sha256 is BYTE-IDENTICAL to attempt 1 (the underlying save bytes never
   depended on 790's prose, only `measurementSha256` inside each `.provenance.json` changed, and now
   matches the finalized 790 exactly — independently re-verified below).

Gate checks (run immediately before each approved attempt): `git status --porcelain` over
`src/ bridge/ generated/ ui/ scripts/ tests/helpers/ tests/fixtures/ package.json package-lock.json`
was empty every time; `git rev-parse HEAD` stayed `ff7b9ac1d334709f1c907e6f7e6d918b935ee9a5` throughout
this record's whole session; `git ls-remote origin wip/headless-program-20260916-ts` returned the same
sha every time it was checked.

## Files written, with sha256 (verified by re-reading every file from disk after the mint and comparing
`shasum -a 256` against each fixture's own `compressedSha256`; all six matched)

| file | sha256 (compressed) | bytes | save week |
| --- | --- | --- | --- |
| `genuine-v34-c4-mid-year.json.gz` | `6d1e8373b242b2320fb3b6391fcb509156fef04c9834df5cb8da24ff7a0d1ca9` | 125871 | 105 |
| `genuine-v34-c4-cohort-week.json.gz` | `b18eee654b57ae7040c6cddfb878f3e358ee735c757adf481fe88ffa97a91b02` | 125597 | 104 |
| `genuine-v34-c4-all-statuses.json.gz` | `d042e74ab468afe8a43754378caf2301050436679ad8a394c0b5a7da055e21ca` | 200779 | 227 |
| `genuine-v34-c4-null-hollywood.json.gz` | `a6d3bc7878076ed8cdc0c65e92897c8793fb3380b4450a17f6cc2473d4e0b279` | 35452 | 208 |
| `genuine-v34-c4-migrated-chain.json.gz` | `8638591e467b91f22e19f3c6123c6264f2c899dcd6d139cef8474e6e41a59dc3` | 205503 | 988 |
| `genuine-v34-c4-deep-deficit.json.gz` | `314b8152c0e108f51b0abb3885b7ec06dee520f29deef3bdb0845ed514c1ab5a` | 101447 | 2600 |

Each has a sibling `.provenance.json` (headSha, publishedRecoverySha, saveVersion 34, minter sha256,
minter archived path, node version, `startedAt`/`endedAt`, command, seed/recipe, `acceptedGenesisSizes`,
the "V34-engine continuation facts" at the next two 52k weeks, and all core provenance-required facts:
tick, hollywood non-null, records by status × profession, `talent.length`, `freeAgents.length`,
`retiredIdsInFreeAgents`, `hiringMarketIds` length, `careerLifecycle.boundaryWeek`), plus one
`MANIFEST.json` covering all six. Minter bytes archived at `791-mint-v34-c4-corpus-minter.test.ts`; its
own sha256 (`0cb343fd08a2c2114e5b451783e3616b429e495e7d3b6490dfa8c1d9a5e54d43`) is recorded inside every
fixture's provenance file (`minterSha256`) and matches the archived copy exactly.

## Axes minted, by world

**1. `genuine-v34-c4-mid-year`** (seed `p14c4-corpus-01-y1y2`, week 105)
- Y1: `state.market.tick = 105` (`105 % 52 = 1`, not a cohort week). One retirement (an actor) with
  `retiredWeek` in `(52,105]` — the current, INCOMPLETE year window as of the save week; the exact
  shape 782's brief names ("a naturally ticked world... holds at least one retired record... in the
  current partial year, so its first post-migration cohort counts pre-save retirements").
- Continuation to week 156 (the next cohort week): 2 more retirements land in `(104,156]` (writer 1,
  craft 1), both discovered ONLY by continuing (0 of them were already in the week-105 save).
  Continuation to week 208: 2 more retirements in `(156,208]` (actor 2), again both post-save.
  `talent.length` stays 87 at both checkpoints (append-only, no entrant — no C.4 code exists).

**2. `genuine-v34-c4-cohort-week`** (same seed, one tick EARLIER: week 104)
- Y2: `state.market.tick = 104 = 52·2`, exactly a cohort week. One retirement (a different actor) with
  `retiredWeek` in `(52,104]`. Its own cohort week (104) has already passed by the time any future C.4
  cohort could act on it — 782's own R3/R7 text (a clipped or un-replenished remainder is NEVER carried
  forward) means this specific retirement's "replacement slot," if C.4 existed, would already be gone.
  Measured, not judged. Continuation facts identical in shape to world 1's (same underlying population,
  one week earlier): week 156 and 208 continuations show the same 2-then-2 pattern.

**3. `genuine-v34-c4-all-statuses`** (seed `p14c4-corpus-01-y3`, week 227)
- Y3: one record in EACH of `announced` (writer), `finishing_commitments` (actor ×2, craft ×1),
  `retired` (actor ×1) simultaneously, across 3 professions (writer, actor, craft). Reached through two
  authored people seated on separate, deliberately held-unreleased productions (a director on a 400-week
  contract, a lead actor on a 208-week contract — this harness's own greenlit productions do not wrap on
  their own within hundreds of weeks, confirmed independently of `tests/p14c2a-save-and-settlement.test.ts`'s
  own E2 case) plus an unseated hard-boundary trio that retires cleanly and quickly. `retiredIdsInFreeAgents`
  is `[]` in this specific world (its one retired person was never signed, so never entered
  `freeAgents`) — contrast with world 6 below.

**4. `genuine-v34-c4-null-hollywood`** (`generateWorld('p14c4-corpus-01-y4')`, week 208)
- Y4: `hollywood === null` from genesis (pre-founding — no `activateStudioOperations`, no
  `initializeHollywood`), and STAYS null through 208 real ticks. Zero `careerLifecycle` records at
  every checkpoint (52, 104, 156, 208) — 773 D6 / 782 R8 hold exactly as stated: the lifecycle step
  never engages, so no cohort will ever fire here. Continuation to weeks 260/312 (below) likewise
  shows zero everything, forever, by construction.

**5. `genuine-v34-c4-migrated-chain`** (the held V33 fixture
`tests/fixtures/p14/genuine-v33-c2-corpus/genuine-v33-c2-hard-boundary-and-idle-window.json.gz`, week
780, migrated live via `convertV33ToV34`, ticked to week 988)
- Y5: `careerLifecycle.boundaryWeek = 780 > 0`. 26 records at the save week, 100% with
  `announcedWeek >= 780` (none dated before the migration boundary — 773 D13 exactly). Mixed statuses
  present (announced: director 3/writer 2/actor 1; the remainder retired).

**6. `genuine-v34-c4-deep-deficit`** (`p13aGeneratedStudio('p14c4-demo-01')`, NO player action, NO
`fund()` call, week 2600 — coordinator addendum 2 / axis Y8)
- Y8: build took 18,360.2ms (well under the addendum's 90s gate). 6 people active (not retired) total
  across all four film professions (actor 3, director 1, writer 1, craft 1; every one `activeUnder30:
  0`) against the accepted genesis composition (actor 40, director 14, writer 16, craft 14 — 84 total).
  `hiringMarketIds(state, 2600)` is empty. **40 stale retired ids sit in `state.freeAgents`** (43 total
  free agents; see "measured contradiction," below) — people signed at some point, then retired without
  ever being pruned from the raw array. Continuation to weeks 2652/2704: zero further retirements, the
  SAME 6-person composition holds at both, `state.talent` stayed append-only (93 ids, same order, 0 new)
  across the whole continuation — this specific world's rival economy has stopped minting new supply by
  this point. Under the amended R3 sizing rule (782 §7: `request_p = max(accepted_p − active_p, young_p
  ? 0 : 1)`), this world's implied requests are actor 37 / director 13 / writer 15 / craft 13 = 78
  total, before the 32 clip — the natural clip fixture for the AMENDED rule (a deficit overflow, not a
  retirement-count overflow).

## "V34-engine continuation facts," committed for every world (record 790's method note, verbatim in
every provenance's `authority.predictionMethodNote`)

Every world's provenance carries, at the next TWO 52k weeks after its own save week, computed by
literally continuing the SAVED state under the real, unmodified V34/C.2a engine (real `advanceTo()` /
`tick()` calls — no cohort code exists anywhere in this file or in `src/`):
- per-profession and total retired-in-window counts (`(W−52, W]`), split into retirements already
  present in the save vs. discovered only by continuing;
- the 782 R3 32-clip applied to that count, profession-ordered (actor, director, writer, craft);
- (coordinator addendum 1) per-profession `activeCount` (not-retired) and `activeUnder30`, the exact
  inputs the AMENDED sizing rule (782 §7) consumes;
- (coordinator addendum 1) whether `state.talent` stayed append-only across the whole continuation
  (same ids, same order, new ids only at the end) — TRUE in every one of the six worlds, at every
  checkpoint, with ZERO new ids appended anywhere. No world in this corpus exhibited natural
  rival-restaffing growth of `state.talent` within its own two-cohort-week continuation window; C.2a's
  restaffing loop (774's own earlier finding) reuses existing free agents before minting new ones, and
  none of these six specific continuations happened to exhaust a role's pool within just two years.

These are measured predictions under 782 R3 (as amended) and 773 D3/D5/D13, never an implementation
output — nothing in this corpus's save bytes or provenance JSON knows what a `cohorts` receipt is.

## Measured contradiction against 782's assumptions, confirmed by this mint (not merely theorized in 790)

The deep-deficit world (world 6) independently confirms 790's "contradictions observed" item 3: 40 of
its 43 `state.freeAgents` entries are people who have since retired. Nothing in `careerLifecycle.ts`
prunes `freeAgents` on retirement; only the sign/renew/proposal-commit call sites do. `hiringMarketIds`
correctly filters these back out of the player-facing listing (confirmed empty, above), so this is
invisible at the surface the player sees — but the raw array itself carries the stale ids permanently.
Flagged for whoever writes the C.4 (or C.2-RM) RED that reads `freeAgents` directly.

## What was NOT reached, and why

- **Y6 (measurement only): 32-in-one-year via ORGANIC population churn.** Natural max across 5
  independent seeds to week 1600 was 9 (seed `-y6e`, week 1404). The deliberate 40-authored-person
  fallback reached 30-in-one-window (week 156) — close to, not over, 32 — within the five checkpoints
  tried (104/156/208/260/312); not pursued further once the underlying primitive (many authored people,
  one clustered retirement window, all through real `createTalent`/`applyActions`) was already
  confirmed lawful and cheap. No fixture corresponds to Y6 — it is measurement-only per the task.
- **Y6/Y7 fixtures**: none minted; both axes are explicitly measurement-only in the task and are
  reported in 790, not here.
- **A mixed-kind `state.talent` growth inside a two-cohort-week continuation window**: not observed in
  any of the six worlds (see "append-only" above) — not pursued further since it was not asked for by
  any axis; recorded as an honest absence, not a search failure.

## Verification performed

`git status --porcelain` after this record's work shows only: the two intended new test files (now
both deleted after archiving), the new `tests/fixtures/p14/genuine-v34-c4-corpus/` directory, and the
new evidence files this task was assigned to write (`790-c4-t0-measurement.md`,
`790-c4-t0-probe.test.ts.txt`, `791-c4-t0-corpus-minted.md`, `791-mint-v34-c4-corpus-minter.test.ts`),
plus the pre-existing, other-owned concurrent changes under this same evidence directory (782's own
amendment, and new 792/793/794 files) that this record did not touch and takes no action on. No
existing fixture, test, or `src/`/`bridge/`/`ui/`/`scripts/`/`tests/helpers/` file was touched by this
record. Every fixture's on-disk sha256 was independently recomputed with `shasum -a 256` and compared
against its provenance's `compressedSha256`; all six matched (see table above). Every fixture was
additionally re-read from disk and re-validated through `validateSaveV34` (never trusting the
in-memory value) inside the minter itself, plus three further post-write checks against the re-read
state directly (world 4: `hollywood === null` and zero records; world 5: `boundaryWeek` unchanged;
world 6: `hiringMarketIds` still empty).

## Next action for the parent

Commit the listed paths (this record's role is test-author/measurement only; it does not commit).
