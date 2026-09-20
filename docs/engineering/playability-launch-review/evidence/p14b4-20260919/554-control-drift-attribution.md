# 554 — Attribution of the pre-existing B1/B2 control drift (bounded bisect)

2026-09-20. Claude Code parent. Records 541/553 found two natural-chain control pins failing on
clean HEAD, not caused by the owner-adapter slice: `tests/p14b1-trust-chooser.test.ts:439`
("test 6 … opportunity changes the winner of an otherwise compensation-versus-incumbency 1-1
tie": expected `studio-5a47d054-r04`, received `studio-5a47d054-player`) and
`tests/p14b2-fixture-preconditions.test.ts:22` via `tests/helpers/p14b2-fixtures.ts:42` ("wins a
real rival-owned case…": `expected null not to be null`, the poaching fixture is unbound). This
record attributes both by evidence. No source, test, fixture or header file changed here.

## Method

The two test files last changed at `957d2de` (2026-09-19 20:41, `p14b1-trust-chooser`) and
`425170e` (`tests/helpers/p14b2-fixtures.ts`). A temporary LINKED git worktree (detached, in the
session scratchpad, `node_modules` symlinked, removed and pruned afterwards; this worktree's HEAD
`4b88394c` untouched throughout) ran the two files at `957d2de`: 16 PASS / 2 todo. `git bisect`
over `957d2de..4b88394c` limited to `src bridge tests` (48 commits) with the two-file run as the
oracle converged in five steps:

```text
# good: c04f4af500c37c726fc7b292db7fac2050ee04d9  Expose shared managed production clock with verified type preservation
# first bad commit: 956a17fe391892d65a8ae10bf9ce1403750bbd34  P14B4: match D3 preference and preserve joint-trace RED
```

Evidence runs under `record-check.mjs` (outputs in this folder), all fixedSource:true, empty patch:
- `554-control-drift-first-bad-956a17f` (cwd = the temp worktree at `956a17f`): 20:17:32.634–20:18:05.013Z, exit 1, `2 failed | 14 passed | 2 todo`, the same two reasons.
- `554-control-drift-last-good-c04f4af` (at `c04f4af`): 20:18:05.461–20:18:32.492Z, exit 0, `16 passed | 2 todo`.
- `554-control-drift-bridge-p14b2-trust-head` (this worktree, HEAD `4b88394c`): 20:19:54.182–20:20:22.166Z, exit 1, `3 failed | 19 passed (22)`: the three "group5 — independent promise attention after cases close" cases, each `expected null not to be null` through the same `poachingFixture()`.
Plus 552 (HEAD `e790b5c7`, empty patch) from record 541.

## Attribution

`956a17f` changed `src/core/talentMarket.ts` (27 lines: the D3 public cast-opportunity preference
matching, the accepted B4 law reviewed KEEP in record 108) and installed three B4 test files; it
did not touch either control file. Under D3 an unproven person's P1 no longer loses to an
incumbent's compensation-vs-incumbency tie, and the poaching fixture's player-wins-a-rival-owned-
case premise no longer holds, so the fixture stays unbound. Both failures are MOVED PREMISES of
an accepted later law, not defects in the slice, the producers, the kernel or the adapter.

- `p14b1-trust-chooser` test 6 was DESIGNATED at the D3 checkpoint: record 110 ("The sole failure
  is the old B2 unproven-P1 opportunity-bonus expectation at tests/p14b1-trust-chooser.test.ts:439:
  player now wins instead of incumbent. This expectation conflicts with the adopted B4
  significant-role preference; it is not silently called a historical baseline failure or removed.
  Preserve the actual result and independently migrate this designated D3 proof to real tagged P2
  at coordinated activation.") and record 108 ("This is the intended policy change, not a
  historical baseline failure to relabel as inherited"). Its migration is deferred to the
  coordinated activation, which is D1-gated (537 §3). Disposition unchanged; the header's expected
  failing set is amended to name it (it was missing).
- `p14b2-fixture-preconditions` "wins a real rival-owned case" and the three `bridge-p14b2-trust`
  group5 cases were NOT noticed at the D3 checkpoint: run 101 executed only
  `p14a1-f1-priority-order` and `p14b1-trust-chooser`. This is a new finding: B2's qualified
  bridge evidence has been RED on every commit since `956a17f` through the shared fixture helper.
  Under plan T2 ("Any legitimate moved current-law premise gets independent explicit
  reconciliation, never weakened validators/assertions/timeouts or silent fixture rewriting") the
  poaching fixture gets an independent test-author reconciliation NOW: re-derive the fixture under
  the accepted D3 law so the player lawfully wins a rival-owned case (from receipts, not magic
  weeks or first-row selectors), preserving every group5 assertion's intent; no assertion loosened,
  no production change. Record 556.

## Limits

The bisect oracle was the two files' exit code (deterministic natural chains; 552/554-a/554-b
agree). The 48-commit range was path-limited; docs-only commits were not tested. No claim about
other suites not run here; the whole-suite failing set is not re-established by this record.

## Verbatim `git bisect log`

```text
# bad: [4b88394c8611c60223ea516ef481f37d7735ff0e] Headers: 553 qualified owner-adapter slice, NEXT554 control-drift attribution then enumerator design; Unity backlog note
# good: [957d2de13cef957cf97ee8e3dd746b51d0e9d200] test(p14bf2): preserve independent acting-discipline RED
git bisect start '4b88394c8611c60223ea516ef481f37d7735ff0e' '957d2de' '--' 'src' 'bridge' 'tests'
# bad: [40d0665d99f49d0e35c7bfffabff17968a5c01b6] test(core): verify lawful replay backgrounds and preserve cost review
git bisect bad 40d0665d99f49d0e35c7bfffabff17968a5c01b6
# good: [0ece527bb26c55a60be6abe137708489656f1b70] Record independent managed clock runtime baseline and type RED
git bisect good 0ece527bb26c55a60be6abe137708489656f1b70
# bad: [41bfeebc69b5255be40e9169b76097c82c08c60c] Preserve independent narrow owner fact tests and actual type RED
git bisect bad 41bfeebc69b5255be40e9169b76097c82c08c60c
# bad: [5cae2da841d6d50d2c460dc87aba3b603435d00e] feat(studio): certify capacity across whole owner traces
git bisect bad 5cae2da841d6d50d2c460dc87aba3b603435d00e
# bad: [956a17fe391892d65a8ae10bf9ce1403750bbd34] P14B4: match D3 preference and preserve joint-trace RED
git bisect bad 956a17fe391892d65a8ae10bf9ce1403750bbd34
# good: [c04f4af500c37c726fc7b292db7fac2050ee04d9] Expose shared managed production clock with verified type preservation
git bisect good c04f4af500c37c726fc7b292db7fac2050ee04d9
# first bad commit: [956a17fe391892d65a8ae10bf9ce1403750bbd34] P14B4: match D3 preference and preserve joint-trace RED
```
