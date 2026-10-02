# 1356-C3: P15A.2 Wave 2 slice 2a RED, revision r3 (answers 1356-F3)

**Status: DONE, with one deviation for the parent to rule on.** The ruling's founding method fails the live validator, so the mid-game founded worlds use another lawful route (see "Founding route"). On `main`, `rank-validate-cadence-boundary` fails for its RED reason. On `main` plus the reference r2 patch, it passes. In the scratch tree `tree/`, `main` moves from adeee94 (r2) to a5bd03c in three commits, tests only. Branch `ref` stays at 61f13b2, and the reference patch is unchanged (sha256 83cb2a59…). The real HEAD af315499 has no `src` or `tests` change since ff05430d, and the r3 patch passes `git apply --check --cached` there under a temporary index.

## Changes

| Item | Change | Commit |
|---|---|---|
| 1 | New helper `foundMidGame` (archive file :220-242). Case (a) calls it at week 26, asserts origin week 26 and `founding === null` at every week from 26 to 66, and keeps its facts: records 39, 52 and 65, `lowerEndRefuses`, `firstRequired`. Header tagged r3. | aee6a72 |
| 2 | Harness ceiling `CEILING_MS = 300_000`, citing 1356-X (`campaignMs` 61,020, run alone) and 1356-F3 item 2. The BUDGET note drops PROVISIONAL. "Run it alone" stays at header :8 and in the note. Header tagged r3. | 5275150 |
| 3 | Case (d), `foundedAt` (used by `rank-adapter-pre-origin`) and `rank-step-cadence-founded-midgame-none-at-origin-plus-one` found through `foundMidGame` before ticking. `rank-fixed-cost-player-zero-while-founding` opens its draft at week 70 with `beginFounding` and reads it there with no tick. | a5bd03c |

`agrees` derives its expected weeks from `max(recordedFromWeek, originWeek)`. Founding moves neither field: the leaf asserts origin 26, and the reference keeps worldgen's `recordedFromWeek` 0. The literal weeks therefore stand, and the reference run confirms them.

## Founding route (outside the literal ruling)

I first wrote F3 item 1 literally: `beginFounding` at 26, `signContract` for the minimum roster from the draft, `foundStudio`, then tick to 66 (commits 27b1896 and 7256891, now superseded). The reference run refused that world in case (a), at `agrees` (archive file :1153 in that version). The refusal came through the frozen chain to `validateSaveV25: frozen V24 state is invalid`:

```
Hollywood save: employment start lacks its actual player signing payment
```

The cause, by reading:
- `beginFounding` opens the industry before any signing, so `recordPlayerEmployment` (actions.ts:3080) mirrors each draft signing as a `player-contract` employment row (industryEmployment.ts:29).
- `hollywoodValidation.ts:568-569` requires a ledger `signingBonus` row for each such row. It exempts only a fresh origin's contracts that start at week 0.
- The recruitment fund pays draft bonuses off the ledger (actions.ts:2560-2580).

After week 0, a `beginFounding` world is refused either way. An open draft fails `technology.ts:897` from the first rival shooting week, and a closed one fails the signing-payment rule. The shipped UI opens a draft only at week 0 (`ui/src/engine/adapter.ts:608-610`).

`foundMidGame` takes a different route:
1. `beginFoundingHistoricalControl` opens the draft on the headless world, with no industry.
2. `signContract` hires the first `FOUNDING_MINIMUMS[role]` applicants of each required role, on 208-week terms.
3. `foundStudio` closes the draft.
4. `initializeHollywood(state, 'migration')` opens the industry at the same week and records the contracts as `existing-player-contract` rows (hollywood.ts:185). The signing-payment rule exempts those rows.

A legacy save of a founded studio takes this shape when the industry arrives. F3's stated facts hold: the minimum roster and `foundStudio` at 26, a closed draft from 26 on, origin week 26, and records 39, 52 and 65. If the parent requires `beginFounding` itself, case (a) cannot validate under today's law.

No exported helper fit the job:
- `foundedStudio` (tests/_presenceFixtures.ts:53) and `foundRosterWallStudio` build a new week-0 world from a seed.
- `foundStudioFor` (src/harness/d16/driver.ts:551) takes a draft, but it swallows refused signings in a `try/catch`.
- The bridge tests' `foundMinimum` copies are private to `.test.ts` files.

## Runs

All runs used `tree/`, one vitest process at a time, and `pgrep -f vitest` came back empty before each.

RED on `main` at a5bd03c:

```
 ❯ |core| tests/p15a2-power-ranking-archive.test.ts (69 tests | 1 failed | 68 skipped) 19ms
   × p15a2 archive: validation, §5 items 1-4 (RED 14; 1356-F Amendments 1-2) > rank-validate-cadence-boundary 17ms
     → Failed to load url ../src/core/powerRankingArchive.js (resolved id: ../src/core/powerRankingArchive.js) in /Users/zacheryspector/studio-scratch/1356-red/tree/tests/p15a2-power-ranking-archive.test.ts. Does the file exist?
 Test Files  1 failed (1)
      Tests  1 failed | 68 skipped (69)
```

The failure reason is the missing archive module, the leaf's declared RED reason.

Reference on `tmp-1356-c3-ref` at 8b47db6 (a5bd03c plus `git apply reference/1356-reference-r2.patch`, committed):

```
 ✓ |core| tests/p15a2-power-ranking-archive.test.ts (69 tests | 68 skipped) 3820ms
   ✓ p15a2 archive: validation, §5 items 1-4 (RED 14; 1356-F Amendments 1-2) > rank-validate-cadence-boundary 3817ms
 Test Files  1 passed (1)
      Tests  1 passed | 68 skipped (69)
```

Cases (a) to (d) all ran. At r2, cases (b) to (d) never ran, because case (a) failed first. I deleted the temporary branch, and `main` is checked out with a clean tree.

## Item 3: leaves that tick under an open founding draft

| Leaf | At r2 | r3 |
|---|---|---|
| `rank-validate-cadence-boundary` (b) | No. The genuine Save42 week-130 capture follows `p13aGeneratedStudio('p13a-core-causal-01')` with natural ticks (tests/p14d1-rival-shelving-fixtures.ts:8-9). `generateWorld` sets `founding: null` (worldgen.ts:744), and only `beginFounding` and `beginFoundingHistoricalControl` open a draft. | unchanged |
| `rank-validate-cadence-boundary` (c) | No, by inference. I did not open the genuine Save37 week-103 save. It passes `migrateToLive` at 103, and in the reference run it validates at 104 under `technology.ts:897`. | unchanged |
| `rank-validate-cadence-boundary` (d) | Yes, 25 to 27. | `foundMidGame` at 25; premise `founding === null` |
| `rank-adapter-pre-origin` | Yes, 60 to 70, through `foundedAt`. | `foundedAt` calls `foundMidGame` |
| `rank-step-cadence-founded-midgame-none-at-origin-plus-one` | Yes, 27 to 40. | `foundMidGame` at 27 |
| `rank-fixed-cost-player-zero-while-founding` | Yes, 60 to 70, through `foundedAt`. Its premise is the open draft, so founding would void the leaf. | draft opened at 70, read at 70, no tick |
| every other leaf in the archive, isolation and harness files | No. The memo campaign, the genuine captures, `researchRoute` and `rivalResearchWindow` start from `p13aGeneratedStudio`. The headless leaves start from `generateWorld`. | unchanged |

The three changed leaves outside the boundary leaf did not run, because the brief lent no run for them. By reading:
- `rank-adapter-pre-origin` and `rank-fixed-cost-player-zero-while-founding` fail at `archiveFn` before any founding, as at r2.
- `rank-step-cadence-founded-midgame-none-at-origin-plus-one` runs `foundMidGame` at 27, the code the boundary run executed at 25 and 26. It then fails with its RED message for week 28.
- At the reference, the two founded leaves never save. The open-draft leaf reads a week-70 draft that holds no technology row, and its closed copy pays overhead of 15,000 a week.

## Hashes

- `1356-p15a2-wave2-red-r3.patch` (`git diff 45b2782..main`, 4 files under `tests/`): sha256 `95ac460576837873234f7fe5ec1adb0f3177647900d644a67ad27e3025f8ad93`
- `1356-p15a2-wave2-red-r3-classification.json` (72 rows, 2 controls; 5 rows updated, each citing 1356-F3): sha256 `a662712a6ebee548c501c67304c103d34a7467c6341e4f508c665ca651d92628`
- `reference/1356-reference-r2.patch`, unchanged: sha256 `83cb2a59d207f8f9b1da12a90bc3b712d40fdf1943c222b4ac73cf56dd700884`

## Outside the brief

1. The founding route above.
2. I rebuilt `main`. After the failing reference run I reset it to adeee94 and recommitted the three items. The superseded commits 27b1896, c51c6fa and 7256891 stay in the reflog.
3. I made four vitest runs, not two, each with the brief's command:
   - RED at 7256891: the RED reason.
   - Reference at 010d12b: the signing-payment refusal.
   - Reference at 8b47db6: pass.
   - RED at a5bd03c: the RED reason.

   Both temporary branches were named `tmp-1356-c3-ref`, and I deleted both.
4. Each run rewrote `node_modules/.vite/vitest/results.json` in the real repo through the tree's `node_modules` link. The file is vitest's results cache. Vitest 2.1.9 never reads it back, because `resolveConfig.rBxzbVsl.js:4235` compares the minor version with 30. The parent's own runs write the same file.
5. The archive and harness headers gain "r3 1356-C3", inside the item 1 and item 2 commits.
6. Scripts and run logs stayed in my session scratchpad, outside `S/`.

## For the Owner (adds to 1356-X F-2)

By reading, and not executed: a contract signed through the founding draft after week 0 never validates (`hollywoodValidation.ts:568-569`), because the fund writes no ledger payment. If the shipped UI can advance weeks during a draft (F-2, UNVERIFIED), a player who signs after week 0 also holds an unsaveable state.

## Not decided

1. Whether the parent accepts `foundMidGame` in place of `beginFounding` for the mid-game founded worlds.
2. Case (c)'s `founding` value, inferred above.
3. r3 has not been compiled. Vitest's esbuild transform does not type-check, and the brief allows no tsc. The new imports are `beginFoundingHistoricalControl` and `FOUNDING_MINIMUMS` (employment.ts:573, :46) and `initializeHollywood` (hollywood.ts:158). `p13aGeneratedStudio` already passes a live `GameState` to `initializeHollywood` (src/harness/p13a/fixtures.ts:11).
