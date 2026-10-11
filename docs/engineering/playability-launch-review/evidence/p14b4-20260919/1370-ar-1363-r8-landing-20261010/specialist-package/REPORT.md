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
3. Postflight at apply time: all **1,589** pinned code paths re-hashed in the clone and equal to their R8 pins. At finalization 1,288 remain present and equal; the other 301 are the `ui/e2e/**` pins I deliberately removed because they sit outside my sparse cone and are byte-identical to HEAD (not part of the delta).

Counts: kit-replace 10, kit-add 4, whole-file replace 153, new 21, identical 1,401. Procedural note: the first pass also wrote 356 files under `ui/e2e` and `ui/public`, which exist at HEAD but sit outside my sparse cone; each was verified byte-identical to its HEAD blob and removed again (counted as identical; not in the patch).

The scratch `tests/fixtures/p14` and `p15` directory representations (absolute symlinks) were never traversed or copied, as the kit README requires; only the four regular fixture files were added, into ordinary directories. The 29 `FIXTURE-PINS.json` fixtures the swept tests read were verified present in the clone with matching SHA-256 before any test ran.

## 3. Adaptations

**None.** Every file is `applied-clean`; no line differs from the frozen R8 tree (`KIT-INVENTORY.json` legend: `adapted: none`, `could-not-apply: none`).

Observations that are not adaptations:
- `src/core/employment.ts`: the reviewed R6 source widens `terminationCost`'s parameter to `Pick<Contract, 'annualSalary' | 'endWeekExclusive'>` so `rivalCostCuttingReleaseAllowed` can pass a facts record. Compiles against HEAD unchanged.
- Gates ran on Node v20.20.2 (the formal runner's pinned Node, selected via PATH); the machine default is v22.23.2. vitest 2.1.9, TypeScript 5.9.3 from the production `node_modules` (symlinked, read-only use; `--no-cache` so vitest wrote nothing there).

## 4. Gates on this HEAD (`gates/results.jsonl`, logs beside it)

| Gate | Command | Exit | Seconds | Note |
|---|---|---:|---:|---|
| `tsc-root` | `npx tsc --noEmit -p tsconfig.json` | 0 | 125 | empty log; the one root `tsc` run of the two allowed |
| `tsc-ui` | `npx tsc -p ui/tsconfig.json --noEmit` | 2 | 151 | r1: one TS2307, `ui/public/lot/hollywood/role-atlas-v1.json` outside my sparse cone (file identical at HEAD) |
| `tsc-bridge` | `npx tsc -p tsconfig.bridge.json` | 0 | 151 | empty log |
| `gen-contract` | `node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract.ts --check` | 0 | 4 | `verified` ×3 generated artifacts |
| `gen-contract-fixtures` | `node node_modules/vite-node/vite-node.mjs scripts/generate-bridge-contract-fixtures.ts --check` | 0 | 4 | `verified` ×1 |
| `tsc-ui-r2` | `npx tsc -p ui/tsconfig.json --noEmit` | 0 | 241 | after `git sparse-checkout add ui/public`; empty log |

All gates ran on Node v20.20.2 (the formal runner's pin) inside the clone with `node_modules` symlinked to production (read-only use). The generator checks printed `verified` for `bridge/schema/project-studio-bridge.schema.json`, `generated/unity/StudioBridgeDtos.Generated.cs`, `generated/unity/project-studio-bridge.contract-manifest.json` and `generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs`: the patch changes none of them. **Result: root types 0, UI types 0, bridge types 0, both generators 0**, matching the formal R8 `types-r1`/`types-r2` on the frozen tree.

## 5. Tests on this HEAD (`tests/*.vitest.json`, `tests/*.log`, `tests/comparison.json`)

| Batch (`--project core --no-file-parallelism --no-cache`) | Files | Tests | Pass | Fail | Skipped | Todo | Exit | Seconds | Content | Formal comparison |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| `b1-modified10` | 10 | 147 | 140 | 7 | 0 | 0 | 1 | 616 | the ten R8 kit files | formal modified10-r1 147/0 |
| `b2-recovery-own` | 9 | 215 | 210 | 1 | 2 | 2 | 1 | 627 | writing 2, release 1, trust 1, `p14d2-rival-cost-cutting`, the 4 recovery files not in any formal selection (`p14d2-*adapter`, `*facility-disposal`, `*save46-migration`, `p13b-s8-old-era-period`) | formal R5 trust-r1 10 pass/1 fail/2 todo; release-r1 5 pass/2 skipped; 1368-D/E focused B52, adapter 2, C24, migration 111, period 2 |
| `b3-p15` | 3 | 96 | 35 | 61 | 0 | 0 | 1 | 150 | formal `p15` minus `p15a2` (ran in b1) | formal p15-r1 125/40 over 4 files (p15a1 holds the 40) |
| `b4-helper-consumers` | 35 | 436 | 405 | 25 | 1 | 5 | 1 | 2184 | formal `helper-consumers` minus overlaps | formal helper-consumers-r1 492/25/1 skipped/5 todo |
| `b5-backward` | 16 | 285 | 283 | 2 | 0 | 0 | 1 | 1380 | formal `backward` ∪ `backward-residual` minus overlaps | no formal JSON in my inputs; attributed against the HEAD baseline only |
| `b6-current` | 94 | 1395 | 1349 | 45 | 0 | 1 | 1 | 2473 | formal `current` minus overlaps | formal current-r1 1396/45/1 todo |
| `b7-rerun-docs-fixed` | 12 | 189 | 189 | 0 | 0 | 0 | 0 | 722 | re-run of the 12 files whose r1 failures were all `docs/` ENOENT (the ten kit files + 2 p15c2 files), after the evidence captures were materialised | supersedes b1 and the two p15c2 files of b3 |

Batches b1 and b3 (r1) contain 7 + 21 failures that were all `ENOENT` on genuine captures under `docs/engineering/playability-launch-review/evidence/p14b4-20260919/` (`1171-p3-current45-capture`, `1221-p4p5-outgoing-capture`, `1052-c3-endurance-A-observer-fixed`): `docs/` is outside my sparse cone, while the frozen tree symlinks `docs` to production. After copying the 83 evidence entries the tests reference by literal name (22 MB, hash-checked), b7 re-ran those 12 files: **189/189**. The r1 logs and JSON are kept beside b7 and are superseded by it.

**Final environment (latest run per file, counted by occurrence): 167 files, 2,574 test occurrences: 2,450 passed, 113 failed, 3 skipped, 8 todo.** (An earlier draft said 2,445 passed; it keyed tests by full name and so collapsed five duplicate parameterised titles in `p14b4-owner-adapter-first-slice` and `p14b4-owner-enumerator-slice`, all passing. Codex's independent pairing, §5(d), counts by occurrence and is the figure of record.)

### 5(a) The ten R8 kit files on this HEAD (b7; identical to the formal modified10-r1 147/147)

| File | Tests | Result |
|---|---:|---|
| `tests/bridge-p14c2rm-runtime.test.ts` | 8 | 8 passed, 0 failed |
| `tests/bridge-p14c2s-scientist-runtime.test.ts` | 10 | 10 passed, 0 failed |
| `tests/bridge-p14c3-promise-digest-continuity.test.ts` | 2 | 2 passed, 0 failed |
| `tests/bridge-p14p3-directing-promises.test.ts` | 3 | 3 passed, 0 failed |
| `tests/bridge-p14p4p5-opportunities.test.ts` | 3 | 3 passed, 0 failed |
| `tests/bridge-p14r2r3-prior55.test.ts` | 1 | 1 passed, 0 failed |
| `tests/p14c2s-scientist-retirement.test.ts` | 15 | 15 passed, 0 failed |
| `tests/p14c3-transitions.test.ts` | 35 | 35 passed, 0 failed |
| `tests/p14p4p5-cross-owner.test.ts` | 1 | 1 passed, 0 failed |
| `tests/p15a2-power-ranking-archive.test.ts` | 69 | 69 passed, 0 failed |

Every test in these ten files passes; the only r1 failures (D15–D17 in `bridge-p14p3-directing-promises`, B55-1..3 in `bridge-p14p4p5-opportunities`, Q17 in `p14p4p5-cross-owner`) were the capture `ENOENT`s above and pass in b7.

### 5(b) The recovery's own tests (b2, all pass)

`p14d2-rival-cost-cutting` 52/52, `p14d2-rival-cost-cutting-adapter` 2/2, `p14d2-rival-facility-disposal` 24/24, `p14d2-save46-migration` 111/111, `p13b-s8-old-era-period` 2/2, `1368-rival-writing-term` 2/2, `1368-writing-completion-boundary` 2/2 — the same B52 / adapter 2 / C24 / migration 111 / period 2 counts 1368-E records for the focused GREEN.

### 5(c) Attribution of every failing test (final environment, 113 failures)

Two baselines: (i) the formal recovery-source runs on the frozen tree (R8 `current-r1`, `helper-consumers-r1`, `p15-r1`, `modified10-r1`; R5 `trust-r1`, `release-r1`), matched by file + full test name; (ii) the parent's full core baseline at `6510c971` (`scratchpad/baseline/core-6510c971.json`, 5412 tests, 159 failed), matched by file + full test name with path-normalised messages (SAME = same message, CHANGED = different message, NEW = passing at HEAD, GONE = failing at HEAD and passing here).

| Baseline | SAME | CHANGED | NEW | GONE | Unbaselined |
|---|---:|---:|---:|---:|---:|
| (i) formal recovery-source runs | 111 | — (message not compared) | **0** | 0 | 2 (`b5` has no formal JSON) |
| (ii) HEAD `6510c971` | 109 | 4 | **0** | 0 | 0 |

**No test that passes at HEAD fails on the rebased source, and no formal failure is gone.** The 113 failures by file (every one also fails at HEAD): `tests/bridge-p14b2-trust.test.ts` ×8, `tests/bridge-p14b5-relationships.test.ts` ×5, `tests/bridge-p14c2rm-retirement.test.ts` ×2, `tests/bridge-p14c3-runtime.test.ts` ×1, `tests/p14b1-t4-regressions.test.ts` ×15, `tests/p14b1-trust-chooser.test.ts` ×1, `tests/p14b2-fixture-preconditions.test.ts` ×2, `tests/p14b4-cast-class-capacity-evaluator5.test.ts` ×1, `tests/p14b4-cast-class-outcomes.test.ts` ×9, `tests/p14b4-rival-seating-preference.test.ts` ×17, `tests/p14b5-relationships.test.ts` ×3, `tests/p14c2c-rival-promises.test.ts` ×3, `tests/p14c3-admission-boundaries.test.ts` ×1, `tests/p14c3-canonical-rival-history.test.ts` ×2, `tests/p14c3-save-v38.test.ts` ×1, `tests/p14p3-directing-promises.test.ts` ×2, `tests/p15a1-market-integration.test.ts` ×40.

The two formal-unbaselined failures (b5, `tests/p14p3-directing-promises.test.ts` D07 and D18) fail at HEAD with the identical message `fixture premise: the same fixed rival really wins the later focus case`; they are pre-existing and SAME against HEAD.

**The four CHANGED-vs-HEAD leaves are unexplained failures.** Each already fails at HEAD and fails identically to the formal R8 run; the recovery source changes the diagnostic. No cause is established here; the pointers are record locations, not explanations.

| File | Test | HEAD diagnostic | Rebased diagnostic | Status |
|---|---|---|---|---|
| `tests/bridge-p14b5-relationships.test.ts` | family 12 — the R-D5 natural-chain LEDGER (measured; the frozen controls MUST NOT move at T2; after T2 every settlement is checked against the D5 receipt facts) p13a-core-caus (occurrence 1) | `AssertionError: expected '8a4df62fdd64ba26fc6e00e438c47c2574992…' to be '706e54c6ec9728df1664025982ebbafeb0fc3…' // Object.is equality` | `AssertionError: expected [ { week: 208, …(11) }, …(17) ] to have a length of 40 but got 18` | Unexplained. 1368-Q lists this protected relationship-ledger natural-chain row (40→18) as CHANGED against M3 and requires event/ledger causal reconciliation before any disposition. |
| `tests/bridge-p14b5-relationships.test.ts` | family 12 — the R-D5 natural-chain LEDGER (measured; the frozen controls MUST NOT move at T2; after T2 every settlement is checked against the D5 receipt facts) p13-public-com (occurrence 1) | `AssertionError: expected '62c9fd5d2d7887b1b6263a38f9545f2ad77cd…' to be 'c034f2fb5a8e5f454a475020cec9de1ac764d…' // Object.is equality` | `AssertionError: expected [ { week: 208, …(11) }, …(41) ] to have a length of 48 but got 42` | Unexplained. 1368-Q lists this protected relationship-ledger natural-chain row (48→42) as CHANGED against M3; the same reconciliation is owed. |
| `tests/p14b4-rival-seating-preference.test.ts` | P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) a met promise never counts (control, r02 chain): after r02's w211 picture satisfies its three  (occurrence 1) | `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: ok(s.witness)` | `AssertionError [ERR_ASSERTION]: The expression evaluated to a falsy value: expect(first.cast).toEqual({ lead: WITNESS.a2, antagonist: WITNESS.a4, support: WITNESS.a3 })` | Unexplained. Both diagnostics are falsy-assertion failures at different lines (`ok(s.witness)` at HEAD, `expect(first.cast)…` here); SAME against the formal R8 run and 1368-Q's M3 pairing. Needs source/premise examination. |
| `tests/p14c3-save-v38.test.ts` | C.3 A01/A02 exact Save38 opening exposes matching strict38 conversion, validation and current migration over a genuine37 save (occurrence 1) | `AssertionError: expected '{"broadcastCache":[],"saveVersion":45…' to be '{"broadcastCache":[],"saveVersion":38…' // Object.is equality` | `AssertionError: expected '{"broadcastCache":[],"saveVersion":46…' to be '{"broadcastCache":[],"saveVersion":38…' // Object.is equality` | Unexplained pending exact predicate attribution. The serialized current era moves 45→46 with `LIVE_SAVE_VERSION = 46`; 1368-Q records the same message change. Not admitted here. |

Skipped/todo in the final environment: 3 skipped (`p14r3-rival-release` R3 conditions (c) and (d) — as in the formal release-r1; `p14b9-casting-competition` null-hollywood route not found) and 8 `todo` (`bridge-p14a3-world` 1, `p14b1-trust-chooser` 2, `p14b4-cast-class-capacity-evaluator5` 1, `p14b4-rival-seating-preference` 1, `p14c2b-extension` 2, `p14c4-cohorts` 1), all identical to the formal runs.


### 5(d) Reconciliation with Codex's retained-result review

Codex paired the same retained JSON/logs against the same HEAD baseline while this session was rate-limited: `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-as-claude-review-and-draft-backup/reviews/r8-results/REPORT.md` (SHA-256 `321d1d083a6b4e74fbcea47e5ba3c75d63e6d135e23f791ea7ffd3e76cb41e46`) with `RESULTS-REVIEW.json` (`192b0979cd5365b5e047b961dda9d99da8485d3cd14667090bdc8f320efebb32`); its pairing method is exact repository-relative path + exact Vitest `fullName` + 1-based occurrence. I re-derived my attribution against that file by identity and occurrence instead of duplicating it:

- Per-batch PASS/FAIL/SKIP/TODO: **identical** for all seven batches.
- Latest per-file union: **identical** once counted by occurrence (167 files; 2,450 / 113 / 3 / 8).
- b7 resolving 28 docs-ENOENT occurrences (7 from b1, 21 from b3) by exact identity: **identical**.
- b4/b5/b6 against the HEAD predecessor: Codex 68 SAME / 0 NEW / 4 CHANGED / 0 GONE / 0 UNPAIRED over 72 failed occurrences; mine 68 SAME / 4 CHANGED / 0 NEW / 0 GONE over the same 72 identities, with the **same four CHANGED identities and the same previous/current primary diagnostics** (equal after whitespace and path-prefix normalisation). My 109 SAME total adds b2's 1 and b3's 40, paired against the formal recovery-source runs; those 41 also fail at HEAD with identical messages.
- Set equality of the 113 failing identities (latest run per file): **identical**; class disagreements: **none**.

Codex's four bounded corrections are applied in this report: the results replace the placeholders with b7 recorded as an observation replacement; the four CHANGED diagnostics are carried as unexplained failures; every SAME failure stays a failure; and this package authorizes no source landing and reconciles no Save46 allocation (parent scope, §7).

## 6. Gaps

1. **UI project not run here.** The formal `ui` selection (7 files, including the 5 swept `ui/src` tests in this patch) needs `vitest --project ui`; my instructions allowed only `--project core`. 1368-L verified these on R6, whose `ui/src` is byte-identical to R8; the parent should run them on the landed source.
2. **Broad gates not run.** Only the formal recovery selections (167 files, 2,569 tests) ran; the recorded core/UI/d16 broad gates, contracts, migration and save/replay routes of plan item 2 remain for the parent.
3. **`b5-backward` has no formal JSON baseline in my inputs** (1368-K/L recorded R6's backward results in prose only); its two failures are attributed as SAME against HEAD by identical message, not against a formal recovery-source JSON.
4. **The seating-preference CHANGED-vs-HEAD leaf is undiagnosed.** `p14b4-rival-seating-preference.test.ts` "a met promise never counts (control, r02 chain)" fails at HEAD at `ok(s.witness)` and on the rebased source at `expect(first.cast)…`; it is SAME against the formal R8 run and 1368-Q's M3 comparison, but the cause of the HEAD-vs-M3 drift was not traced here.
5. **Environment artifacts, not source facts.** My sparse clone needed `ui/public` added and 83 evidence entries copied under `docs/…/evidence/p14b4-20260919/` (90 MB) before tests could read genuine captures; the production tree has these natively. b1 r1 and b3 r1 numbers are superseded by b7.
6. **Formal recorder not used.** No `run-bounded-source-c2.mjs` recording, pre/post source guards or `landing.py --apply --after-gates`; I used equivalent pin/preimage/postimage checks in my clone. The parent can still run `landing.py` read-only against production (the ten preimages still match at HEAD).
7. **Node v22.23.2 (machine default) not exercised**; all gates ran on the formal pin v20.20.2.
8. **The O6 loan-principal exit is not in this source** (`costCutting.since` clears only on a real greenlight); it belongs to P15B's principal mutation (A2 case L1).
9. The archive `evidence.tar.gz` was only listed, not extracted, because every byte it preserves for the kit is present in the frozen tree and the kit payload and was hash-verified there.

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

1. Prove the base before copying. `git diff --stat <formal baseHead> HEAD -- src tests …` plus a blob-hash search of production history for the frozen tree's file versions settled "near-clean" as "clean" in minutes and made a pin-verified whole-file copy the exact rebase; no hunks were applied or fuzzed.
2. Verify with pins, not patches. 1,589 R8 source pins + the kit's 10 preimage hashes gave a zero-adaptation transplant and an objective postflight; `git apply` would have given the same bytes with weaker evidence.
3. Mirror the frozen tree's `docs` dependency before the first vitest run. Tests read genuine captures under `docs/…/evidence`; a sparse cone without `docs/` yields `ENOENT` failures that look like regressions. Enumerate references by literal evidence entry name (grep -F over the directory listing), not by `new URL(` patterns, which miss table-driven paths.
4. Check sparse-cone side effects after bulk writes. Pinned files written outside the cone (`ui/e2e`, `ui/public`) become invisible skip-worktree files; verify them against HEAD blobs and remove or add them to the cone deliberately (`ui/public` was needed by the UI typecheck).
5. Carry the formal runner's environment. The witness helpers refuse without `P1368_*`, `RIVAL_WRITING_*` and `TRUST_AUTHORING_*`; run on the formal Node pin and with `--no-cache` so a symlinked production `node_modules` is never written.
6. Attribute against two baselines. The formal recovery-source run answers "same as reviewed?"; the pre-change HEAD run answers "regression?"; only the second exposes CHANGED messages and GONE entries.
7. Re-run only environment-caused failures, and keep both runs. Files whose failures were all `ENOENT` were re-run once the environment was fixed; r1 evidence stays beside the superseding run instead of being overwritten.
8. Budget sequential batches on a shared 4-CPU box at roughly 2× the formal timings (b4 2,184 s, b6 2,473 s under load ~11) and run them as one background chain with a line-per-batch log that a monitor can tail.
