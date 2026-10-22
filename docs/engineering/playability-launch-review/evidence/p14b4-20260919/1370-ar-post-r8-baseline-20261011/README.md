# 1370-AR: core test baseline after the R8 landing (predecessor for Save47)

Parent: Claude (Fable 5.1), 2026-10-11. Full `core` project run on the R8-landed HEAD so the founding (Save47) landing and every later slice attribute failures against an exact predecessor. Parent measurement, not a recorded heavy-lane run.

## Identity

| Item | Value |
| --- | --- |
| HEAD | `db3fc57242669d5c752d87a49ce0a87938324b6b` (R8 landed; `LIVE_SAVE_VERSION = 46`) |
| `HEAD:src` | `cf7d20cd585f72fd178e06c3cd2a8821bbc0c26f` |
| Command | `nice -n 15 npx vitest run --project core --reporter=json` in the production worktree, three workers |
| Environment | Node v20.20.2 (formal runner pin via PATH), `GIT_OPTIONAL_LOCKS=0`, the eight R8 capture env vars from `../1370-ar-1363-r8-landing-20261010/specialist-package/run-gates.sh` pointed at the production fixtures |
| Start / end (UTC) | 2026-10-11T01:57:44Z / 2026-10-11T03:56:35Z (1 h 58 min, shared with three implementation specialists; load average 9 to 17) |
| Exit | 1 (failures present) |

## Result

| Metric | Count |
| --- | --- |
| Test suites | 1,839 (80 with failures) |
| Tests | 5,607 |
| Passed | 5,443 |
| Failed | 150 |
| Skipped | 3 |
| Todo | 11 |

Files: `core-db3fc572-vitest.json` (SHA-256 `8376836ddf7ce2cbe32eeaa898ec6db4e15ae1c0dc802a2382d25bb97e5a58ec`, 2,686,660 bytes), `core-db3fc572-failures.txt` (`aaf5a8a8b9a506353bdb2d1797291c94ccb18abf1aebb0226f7f259670ad8a01`, 150 identities as `file :: full name`), `attribution-vs-6510c971.json` (`426172da354456de93ad8812ae6379c474c3f49967e8a74566d2283c77a52c88`).

## Attribution against the pre-R8 baseline (`../1370-ar-claude-takeover-baseline-20261010/`, 159 identities)

| Class | Count | Content |
| --- | --- | --- |
| SAME | 148 | pre-existing identities, including the 40 declared P15A.1(c) market failures and the R8-era changed diagnostics named in the R8 landing README |
| GONE | 11 | nine 1363 Part A tests that the landed R8 recovery makes pass (`p14d2-binding-cash` A1, A2, A3, A4, A6, A9; `p14d2-a8-binding-cash` A8; `p14d1-rival-shelving` two counts-contract leaves) and two `bridge-supervisor` leaves that passed on this run (timing class, see 1361-M3) |
| NEW | 2 | both timing failures under load, not assertion failures: `bridge-p13b-s7-disclosure.test.ts` P13B-S7-T3 item 5 (Save As identical) hit the 30 s test timeout; `p15c2-campaign-legacy-integration.test.ts` `legacy-root-downgrade` reported `elapsed 259215 ms against the 120000 ms budget` |

## Isolated rerun of the two NEW identities (`isolated-2files.vitest.json`, `isolated-2files.log`)

Both files rerun alone, single worker, same Node 20 environment, 2026-10-11T06:14:24Z to 06:20:03Z while three specialists were still active (load average about 7): **2 files, 59 / 59 passed**. Item 5 took 14.7 s (30 s timeout); `legacy-root-downgrade` took 105.3 s against its 120 s budget. Both are therefore attributed as environment/timing failures of the loaded broad run, the class 1361-M3 already recorded for supervisor and Save As leaves.

Caveat kept visible: the pre-R8 broad run on 6510c971 ran under heavier load (18 to 27) and `legacy-root-downgrade` stayed inside its budget there; after R8 it needed 259 s loaded and 105 s nearly idle. The R8 landing most likely increased the cost of the downgrade/migration path this test times (one more save step and the swept test corpus). Measure it in isolation on an idle machine before the next save step lands; do not relabel the budget.

## Claim limits

No recorded lane, no lane lock, no source guards; timing values are not isolated performance evidence. The 148 SAME failures remain failures. The 1363 Part A tests passing is a focused observation of the landed recovery source, not causal ledger admission (1363-V matrix, G-P/G-L/K3 and the 416-week routes remain unrun).
