# P14B.1 T4 — full-pass attribution and qualified closeout

Status: **P14B.1 T4 CLOSED — LOGIC VERIFIED · UNITY NOT VERIFIED**, qualified by
the inherited failures and explicit coverage limits below. Not Owner acceptance.
Final test-correction source: `a93bf7776a41df3702c78ae5225a2e7c303ec9da`.

## Fixed-source full pass

Production and test source: `ee91913e41b9baa30bcda8eef8c8195da7bfd1cc`, published
on `wip/headless-program-20260916-ts` and verified by remote SHA readback.
The recovered `d19c45b` chain and T3 `e78dbc0` remain ancestors. The runner and
complete metadata are preserved in `../p14b1-20260919-t4/run-fixed-source.mjs`
and `00-run.json`. Source/tests stayed frozen; `fixedSource: true`, unchanged
HEAD and empty source diff at both ends. Documentation changed only.

Host: Darwin 21.6.0 x64, Node v20.20.2, 8 GiB RAM, four logical CPUs.
Checks ran serially, 2026-09-19 11:22:39.535Z–12:51:55.545Z; full suites used
the historical `--minWorkers=1 --maxWorkers=2 --reporter=dot` flags. No overlapping
heavy suite, timeout increase, disabled test or validator relaxation.

| Check | Actual full-run result |
|---|---|
| Root/UI typecheck | Exit 2: one test-only TS2339; root failed before UI half |
| Bridge typecheck | Exit 0 |
| Contract + contract-fixture checks | Both exit 0 |
| Full core | Exit 1; 288 passed / 13 failed files (301); 3253 passed / 29 failed / 7 todo tests (3289) |
| Full bridge | Exit 1; 67 passed / 2 failed files (69); 717 passed / 12 failed / 2 todo tests (731) |

Core ran 11:24:04.665Z–12:22:13.360Z (Vitest 3486.64 s); bridge then ran
12:22:13.363Z–12:51:55.545Z (1780.96 s). The bridge files are also selected by
the core project: these counts must not be summed as unique tests.

## Exact failure attribution

`13-core-comparison.json` and `15-bridge-comparison.json` compare complete test
identifiers AND diagnostics/trace origins to the published P14A.3 `f32d56c` logs.
They include raw-log and per-diagnostic SHA-256 values. Only ANSI and the scenery
exporter's generated temporary-directory suffix are normalized. All 22 historical
core failures and all 12 historical bridge failures recur; none disappears.

- Both suites: campaign-library, nine 5000 ms and two 20000 ms timeouts;
  campaign-isolation, one 60000 ms timeout. Matching signatures do not establish
  successful campaign behavior or prove identical performance causes.
- Core only: scientist-foundation, three identical golden-digest mismatches
  (genuine inherited product drift, not an environment waiver).
- Core only: six identical ENOENT failures in the three r3n1 fixture-dependent
  files; original private checkpoints are unavailable on this host.
- Core only: scenery exporter, Python `No module named PIL` (undeclared local
  dependency). No installation campaign was started.

No failed-suite or unhandled-error diagnostic appears in either completed log.
All seven B.1 files pass their executed assertions, including 34 new T4 regressions;
the three existing chooser todos remain explicit gaps, not verification.

Seven NEW core failures across six files are B.1-introduced historical-test
compatibility issues, not inherited failures. The separate root type error is a
partial test-adapter type. Prescriptions and provenance are recorded in
`../p14b1-20260919-t4/15-queued-test-corrections.md`; independent attribution and
review of their assertion-preserving scope is `14-core-review.md`.

## Corrective verification — GREEN on the final test candidate

Independent test-author applied only the seven approved amendments after the
full run ended. Commit `a93bf7776a41df3702c78ae5225a2e7c303ec9da` changes exactly
seven tests, 33 insertions / 19 deletions. Production, configuration, harnesses,
generated artifacts and genuine historical fixtures are byte-identical to
`ee91913`; parent diff check and bounded independent KEEP review `18` confirm
the scope. No assertion or validator was weakened.

Fresh records under `../p14b1-20260919-t4/`:

- `16-corrective-targeted`: **13 files / 170 passed / three unchanged todos**,
  exit 0, 12:56:11.065Z–12:57:38.340Z. Every amended file and all B.1 files ran.
- `17-typecheck-final`: root AND UI exit 0, 12:57:50.359Z–12:59:20.247Z.
- `18-typecheck-bridge-final`: exit 0, 12:59:32.776Z–13:00:10.850Z.
- `19-contract-final` and `20-contract-fixtures-final`: both exit 0.

Each record preserves command, log, exact tested patch and unchanged before/after
patch SHA `1d9b8130ff35666e67098e2d6dddf440e99766a918f889505896c2ce064d13d4`
over `ee91913`. That patch is precisely the seven-test correction commit.
Original failing logs remain intact. This is full core/bridge evidence on the
unchanged production source plus separately GREEN corrections/typechecks, NOT
an all-green full-suite rerun on `a93bf77`.

The full runner took approximately 89 minutes versus the historical 75-minute
planning observation (about 14 minutes over); no new resource allowance is
implied. Corrective targeted/typechecking time is additionally recorded above.

## Remaining scope

Save V29 / projection 45 unchanged. Thin B.1 quote previews do not yet attach a
promise at consumer submit; that integration gap stays explicit for B.3. B.2
read models are the next authorized implementation task. Other
deferred requirements and Unity consumer work remain in the plan and backlog;
this slice's verification is not full P14 completion or Owner acceptance.
