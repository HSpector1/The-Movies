# Joint-trace kernel — qualified implementation checkpoint

2026-09-20. Detached solver implementation only; B4 remains IN PROGRESS.
Published base `956a17fe391892d65a8ae10bf9ce1403750bbd34` plus exactly one
production change, `src/core/promiseCapacityKernel.ts`, SHA-256
`1faa6fcac443dac046bd97fa3e27c61bada80c7297f8e69ea4ebcff76d899332`.
Canonical protected patch for every check below:
`5a6b74901273485dadf7eb3d711280eeaf7e014d81d4f972f0b90180d2a3df50`.
No untracked protected source, live test change, configuration or timeout change.

## Executed evidence

- 115: **86 PASS / 4 files**, 40 independent joint-trace cases plus all46
  original optional-kernel cases. Vitest2.1.9, one worker, 2.47s total /633ms
  test bodies; recorder00:41:00.604Z–00:41:04.281Z, exit0.
  The prior104 actual40-case RED is preserved. These are now reached solver
  assertions, not merely entry-presence checks or newly weakened expectations.
- 116: root AND UI strict no-emit typechecks PASS, exit0;
  00:41:21.281Z–00:42:33.809Z. Includes the three newly installed95/100/106
  tests that were not yet present in the earlier102 typing run.
- 117: bridge strict no-emit typecheck exit2;
  00:42:53.481Z–00:43:20.673Z. Exactly ONE diagnostic remains:
  `tests/bridge-p14b4-cast-class.test.ts(364,20): error TS2353`, property `kind`
  absent from `{ count: number; }`. This is the unchanged pending P2 attachment
  type boundary already recorded in103, not a new kernel diagnostic. Bridge
  typing is NOT green; no suppression or test alteration was applied.

All three checks are CLOSED with `fixedSource:true`, equal beginning/end HEAD
and protected patch. Parent read complete raw outputs and terminal metadata.
There were no failed suites, unhandled diagnostics, skipped cases or todo items
in115. Tests/typechecks ran serially on the Mac; no source writer overlapped.
Source-scoped `git diff --check` also passed. Native source handback112 records
the exact implementation; parent independently read all1047 source lines.
Independent114 source review is complete: KEEP, no concrete contract/proof defect.
The read-only reviewer independently checked full source, protected patch and all
three raw/metadata records. Parent persisted the returned review unchanged.

## Qualified scope

Frozen91/94/96 add explicit compulsory owner traces to the existing module,
reusing normalization, one budget, actual-seat matching, global prior cuts and
the prior/X/B/unoptimized orchestration. Every trace's whole ledger and unknown
release occupancy are validated before a positive certificate. Execution proof
retains uncredited/background paths and holds separately from credited pictures.
Original49 optional behavior and its46 independent regressions are preserved.

The lower solver checks supplied certificates, not that an engine emitted them.
No live caller, truthful owner-domain producer, ordinary offer performance,
complete staffing/calendar enumeration, P2 attachment, rival policy, billing,
save/projection version or schema was activated by this patch. The isolated
targeted green result does not close B4/T4 or erase the remaining policy/bridge
RED recorded in110. Existing live29/rules3/projection46 stays in force.

## Next concrete work

With114 KEEP complete, publish this qualified source/evidence checkpoint
and separately verify exact remote SHA. Then the next sole production writer
continues shared actual staffing/admission owners and the actual joint-trace
producer. Inert113 identifies honest real-action versus controlled fixture
routes; inert118 proposes the minimal staffing extraction, not a second action
pipeline. Independent tests precede the corresponding implementation.

Continue coherent P2 integration and remaining settled P14/P15/P16/sufficiently
specified P17/P18 work. Unity/rendering/native verification and Owner acceptance
remain deferred; retain the Unity integration backlog. No routine approval pause.
