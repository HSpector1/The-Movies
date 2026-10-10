# 1370-ar — 1363 "R8" rival-recovery source + 14-file kit rebased onto 6510c971 (r1)

Date: 2026-10-10. Integration specialist, bounded slice. Working copy: `/Users/zacheryspector/studio-specialists/r8` (shared clone of `wip/headless-program-20260916-ts`, HEAD `6510c971bed8079f7ca02e528b224988de092c87`, `src` tree `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`). No write touched the production worktree, its common Git dir, or any frozen `1368-*` scratch directory.

## 0. What was transplanted, and from where

| Component | Origin | Identity |
|---|---|---|
| Reviewed recovery source (R6 == R8 for `src/`, `bridge/`, `ui/`) | `/Users/zacheryspector/studio-scratch/1368-save46-swept-proposal-r8/tree` (scratch HEAD `a59301c631531d9189aef5ee1827d6886db78f45`) | `SOURCE-PINS.json` SHA-256 `0c89540f6bb05e7a49c53100f9f4e0b203d4bc500439938b4f8334b8c0147edc`; `ASSEMBLY.json` SHA-256 `878f5615318d0d1fc1f76c07b1bd507cb9f820a59a18efe58587ae035c7d39ad` |
| Guarded 14-file R8 test/fixture kit | `/Users/zacheryspector/studio-scratch/1368-r8-explicit-landing-kit-20261005-a/payload` | kit `MANIFEST.json` SHA-256 `3f4728874de78a8eaa8a9fa24c19c9ef3d57a5ae0056884261a6963d5590484b` (recorded in its REVIEW.md; re-hashed here, see KIT-INVENTORY.json) |
| Formal R8 runner and selections | `/Users/zacheryspector/studio-scratch/1368-r8-integration-prep-r1` | `MANIFEST.json` SHA-256 `0b37a671ed357d7faf4cb0a89e2b7995c574c6a2f12ccad7aa1b67cfad0ad163`; `run.py` `d2ee4736…65d` |
| Fourteenth-verification archive | `…/1368-stage/fourteenth-verification/evidence.tar.gz` | SHA-256 `4611e2eef52fa0080dee6440d7b82603e35199a9b93c237b7465d93c0cb11e6d`, 49 members listed with `tar -tzf`; not extracted, because every byte the kit needs is already present in the frozen tree and the kit payload, each verified against the R8 pins |

Delta on top of 6510c971 (`PATCH.diff`, `git diff --binary` from `6510c971`, new files intent-added first): **188 files, +4386 / −917** (two `.json.gz` fixtures as binary patches).

| Area | Files | Content |
|---|---:|---|
| `src/core` | 13 | Part A opt-in `unaffordableViable` re-search (`hollywoodPolicy.ts`, `hollywoodTick.ts`); Part B `costCutting` episode: entry facts, no new commitments, R3 releases with the payback rule, exit on greenlight (`hollywoodTick.ts`, `hollywoodPolicy.ts`, `rivalResearch.ts`, `technologyRival.ts`, `talentMarket.ts`); Part C laboratory disposal with the `facilityDemolitionRefund` money kind, `facilityDisposed` tombstone receipt, eligibility/dependency refusals and the two-way validator (`rivalResearch.ts`, `hollywood.ts`, `hollywoodTypes.ts`, `hollywoodValidation.ts`, `productionIdentity.ts`); Save46 era (`save.ts`: `validateSaveV46`, `convertV45ToV46`, `convertV46ToV45`, `migrateToV46`, `LIVE_SAVE_VERSION = 46`, era flags threaded through every frozen reader, recovery-aware frozen-builder guard, `validatedLiveProfessionContext` strip + disposal proof; `types.ts`: `GameStateV46`, `GameState = GameStateV46`; `index.ts` exports); the 1368 writing-term guard in the rival commission path (`hollywoodTick.ts`); `terminationCost` takes `Pick<Contract, 'annualSalary' \| 'endWeekExclusive'>` (`employment.ts`) |
| `tests` | 170 | 129 Save46-swept whole files (the R6 sweep: 45→46 pins, recovery initialisers, era expectations), 10 R8-corrected whole files (the kit), 21 new files (4 `p14d2-*` recovery tests, `p13b-s8-old-era-period`, two `1368-*` writing tests, `p14d1-week77-fixture.ts`, 13 helpers), 4 genuine historical fixture files (the kit) |
| `ui/src` | 5 | Save46-swept UI tests (`d17-save-migration`, `film-chronicle-adapter`, `v14SetHolderBoundary`, `saves`, `session`) |

`bridge/`, `generated/`, `scripts/` and the root configs (`package.json`, `package-lock.json`, `tsconfig*.json`, `vitest.*.ts`, `ui/tsconfig.json`) are byte-identical between the frozen tree and HEAD; nothing to apply.

## 1. The pinned predecessor and the delta to 6510c971

- The formal R8 runs (`run-types-r1`, `run-modified10-r1`) bound `baseHead 38ad3c41f53f866a8c7e5341af8eebfae22bb10c` (2026-10-05 17:01); 1368-Q's formal `types-r2` / `current-r1` / `helper-consumers-r1` / `p15-r1` bound `af16f53feb1edcb51d7e9dff109d43c7be2ec804`; the explicit kit pinned its ten live preimages at `af16f53f`. Both are ancestors of `6510c971`.
- `git diff --stat 38ad3c41 6510c971 -- src tests bridge ui/src generated scripts` is **empty**. The `src` tree is `13880d9b` at `38ad3c41`, `af16f53f` and `6510c971`. The 60 commits in between are docs/handoff commits (plus `8cb704e2 fix(verification)` outside these paths).
- The R6 snapshot was cut on 2026-10-05 09:56 from production content as of 2026-10-04 ≈23:54 (file mtimes). Of the 139 R6-modified test files, every one was last touched in production at or before `57aa8eec` (2026-10-04 19:33: 6 files; `c094206c`: 1; `951ef926`: 1; the Save45 sweep `95ddf564` 16:02: 125). No R6-modified file was touched after `1e0a8f9d` (23:08). The only later production commits touching `src|tests|ui/src` (`f5cba8b7`, `ee7f700f`) add fixture files that the frozen tree carries byte-identically (symlinked). A blob-hash search found no production commit ever carrying an R6 version of a modified test: every difference is R6's own sweep edit (sample: `tests/bridge-p13b-r07-setup.test.ts` differs only by `toBe(45)` → `toBe(46)`).
- Conclusion: the reviewed source was built on content identical to `6510c971` for every path it modifies, so whole-file copy from the frozen tree is the exact rebase; no three-way merge and no hunk relocation was needed. The handoff's "near-clean apply" expectation held as **clean**.

## 2. How the apply was done and verified (`KIT-INVENTORY.json`)

`apply_r8.py` (scratchpad, run with `python3 -I`, paths as arguments):
1. For each of the 14 kit entries: payload read from the kit `payload/`; `sha256` + `bytes` checked against the kit manifest postimage **and** the R8 `SOURCE-PINS.json`; for the 10 replacements the live preimage at HEAD checked against the manifest preimage (all 10 matched exactly); for the 4 additions the destination checked absent; symlink-ancestor refusal as `landing.py` does; then written.
2. For every other regular file the R8 `SOURCE-PINS.json` pins under `src/ tests/ ui/ bridge/ generated/ scripts/`: read from the frozen tree, hash checked against its pin, copied only where the clone differed or lacked the file.
3. Postflight: all **1,589** pinned code paths re-hashed in the clone and equal to their R8 pins.

Counts: kit-replace 10, kit-add 4, whole-file replace 153, new 21, identical 1,401. Procedural note: the first pass also wrote 356 files under `ui/e2e` and `ui/public`, which exist at HEAD but sit outside my sparse cone; each was verified byte-identical to its HEAD blob and removed again (counted as identical; not in the patch).

The scratch `tests/fixtures/p14` and `p15` directory representations (absolute symlinks) were never traversed or copied, as the kit README requires; only the four regular fixture files were added, into ordinary directories. The 29 `FIXTURE-PINS.json` fixtures the swept tests read were verified present in the clone with matching SHA-256 before any test ran.

## 3. Adaptations

**None.** Every file is `applied-clean`; no line differs from the frozen R8 tree (`KIT-INVENTORY.json` legend: `adapted: none`, `could-not-apply: none`).

Observations that are not adaptations:
- `src/core/employment.ts`: the reviewed R6 source widens `terminationCost`'s parameter to `Pick<Contract, 'annualSalary' | 'endWeekExclusive'>` so `rivalCostCuttingReleaseAllowed` can pass a facts record. Compiles against HEAD unchanged.
- Gates ran on Node v20.20.2 (the formal runner's pinned Node, selected via PATH); the machine default is v22.23.2. vitest 2.1.9, TypeScript 5.9.3 from the production `node_modules` (symlinked, read-only use; `--no-cache` so vitest wrote nothing there).

## 4. Gates on this HEAD (`gates/results.jsonl`, logs beside it)

RESULTS-GATES

## 5. Tests on this HEAD (`tests/*.vitest.json`, `tests/*.log`, `tests/comparison.json`)

RESULTS-TESTS

## 6. Gaps

RESULTS-GAPS

## 7. What the parent must still do for "1363 closure" (plan item 2; named here, not in this slice)

1. Land this patch as a history-preserving commit from `6510c971` (one production writer) and republish the HANDOFF checkpoint with the source identity; re-run the type gates and both generators on the landed HEAD.
2. Run the broad selections plan item 2 names that this slice did not: the recorded core/UI/d16 broad gates (1363-M), the `ui` project selection (7 files; 1368-L verified them on R6, whose `ui/src` is byte-identical to R8), contracts, migration and save/replay routes on the landed source, attributing every selected failure against the exact prior source (SAME/NEW/CHANGED/GONE against 1361-M3 and 1368-Q).
3. Close the 1363 ledger items plan item 1 still holds open (the four C0 protected digests, the two protected relationship-ledger row-count changes 1368-Q names, B causality). This rebase does not touch them.
4. Adopt the independently reviewed 1363-V 105-process role matrix and run its matched processes and separate long routes (1363-A §6.1–§6.4, A2 §7, IMPLEMENTATION-MAP §§2–5): natural recovery arms (control / A / A+B / A+B+C) to week 520 on the five seeds including `p15a1-w2-market-01`, condition re-probe 1 (1357-P arms a/b to 6240), player-only identity, the Row 6 and promise-148 chains, the low-market table, dormant-survivor counts and the false-positive-entry stop condition.
5. The equal-basis 154 promise-movement comparison (469a9547 vs ff803032; Part A on 469a9547 vs ff803032; candidate vs control; candidate vs ff803032 as confounded totals only), every row explained or flagged (`explained + flagged = 154`).
6. Same-candidate G-P / G-L with K3 on the landed recovery candidate (1363-F ruling 7; IMPLEMENTATION-MAP §6), with the Save45 G-L comparison as prerequisite, the F6 ruling-3 save-cost samples (6240, 8791, post-2040 release) and the retune-trigger disposition.
7. Deferred re-probes that stay named obligations: shared-market pressure once the P15A.1 owner is enabled (K4 method), and the real P15B loan-principal exit of cost-cutting (1366-O O6) once P15B Wave 3 owns the principal mutation (A2 case L1). The O6 clearing is not in this source; `costCutting.since` clears only on a real greenlight.
8. Close 1363 only if no new or changed failure and no unresolved recovery trigger remains; then the conditional 1367-O2 promotion (plan item 3), never before.

## 8. Lessons learned

RESULTS-LESSONS
