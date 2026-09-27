# 1124-A — Bounded investigation of the new NextEvent UI failure

The original failure remains unresolved. No production or test correction is
retained. One unmodified isolated execution reproduced it; one instrumented
execution passed. The latter is not an unmodified pass, a fix, a reliability
clearance or evidence identifying the guard that rejected either earlier click.

The original1101 full UI run fails the exact leaf `preserves the exact live-world
reaction after a rejected import or declined restart` in
`ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx`. It cannot find
`dashboard-releases-heading` at1929, called at1971. This is the second call to
`openSavesFromExactReaction`, after the initial event, first deep route, rejected
import and restored exact reaction/focus/session-byte assertions have succeeded.
It is a NEW identity against713, not a blanket inherited FU1 allowance.

## Actual diagnostic executions

Both used published `bc2492be0c6b4a0e32c1496c5bdff1344fb0c9d2`, whose consumed
source is identical to1101. The exact command in both records is:

```text
node_modules/.bin/vitest run --project ui ui/src/lot/WorldFirstLotNativeNextEventApp.test.tsx -t "preserves the exact live-world reaction after a rejected import or declined restart"
```

Neither invocation changes the existing timeout. The35 skipped cases in each
are explicitly excluded by this diagnostic selector, not new test skips.

| Record | UTC interval, 2026-09-27 | Wrapper seconds | Actual source/result |
| --- | --- | ---: | --- |
| 1102-c3-ui-reaction-isolation | 10:01:01.122–10:01:12.652 | 11.530 | Empty consumed diff; child1/fixedSource:true; 1 FAIL/35 filtered |
| 1103-c3-ui-reaction-trace | 10:05:03.231–10:05:14.308 | 11.077 | Exact temporary four-log diff; child0/fixedSource:true; 1 PASS/35 filtered |

Both have null signal/error and no untracked consumed source at either end.
Author/reviewer independently found1102's complete primary diagnostic and full
tail literally equal to1101, including1929/1971 and the visible restored Lot.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| 1102-c3-ui-reaction-isolation.txt | 30,483 | `db3ccb7d8445fa1aacb5f1cc789cb4b4891b7edfb4279e59da900c1e10d94b01` |
| 1102-c3-ui-reaction-isolation.json | 788 | `cb1ef026520ef0c1fefe482757431c929234e82e485677e667b877088b317d6b` |
| 1103-c3-ui-reaction-trace.txt | 2,723 | `5b54e8118de1e473cd4b59e79c3c23983cbdbbe689910cb31af7713e145b0e04` |
| 1103-c3-ui-reaction-trace.json | 788 | `4a74507582616ff4eb9bb47f82c58338d28c5af32a551bb2f85e95312d5a20b3` |
| 1103-c3-ui-reaction-trace.patch | 2,196 | `f5f843afc211c9abf246982c553b21756f3acc9dd071db07d62cbaffac4771df` |

1102's patch is empty.1103's recorder diff includes Git headers; the separately
reviewed application patch uses unified headers and is1,852 bytes, SHA256
`e096196a907e3dfc6d6b81852f4d90e74c807e11f42511876d985d61edd34066`.
Its835-byte manifest is
`16ffa272cc48e7eb1fdf45473898b15dcb7e48fd674ed43fd0afb3936fb5357d`.

## Instrumentation, observation and exact restoration

The independent reviewer reconstructed both declared postimages from the patch
and approved one bounded diagnostic. It adds only four console.info calls:
Rail reset, pre-guard click flags, post-claim activation, and App pre-guard owner/
state/session/receipt comparisons. The added comparisons are pure reads. No
branch, timer, ref, receipt, test assertion, simulation input or timeout changes.
Logging can still perturb timing, which limits what this run establishes.

In the observed instrumented run, both deep clicks have detail0, no suspension,
hidden document, disabled action, prior claim, captured token, held key or sealed
virtual tail. Both reach activation. Both App callbacks have the correct owner,
rendered/accepted state, session and matching `run-completed` receipt. Restored
renderer input-reset0→1 is observed. Thus this trace observes two accepted paths;
it does not observe the rejecting path from1101/1102. The source's short-lived
input seals suggest a timing hypothesis, not an established failure cause.

The relevant Rail, StudioLotScreen and test bytes are unchanged since the713
baseline. App's intervening delta adds the unrelated profile route; adapter
imports now migrate to the live save version. Unchanged local routing code is
not sufficient to relabel this newly observed failure as inherited or harmless.

After actual1103 closure, the parent reversed only the exact diagnostic patch,
after checking both instrumented postimages. Both original preimages then matched:

- Rail35,569 bytes / `8ed9f372c14aeb359782ca4bc9b0405c43566c938c4cd4634c3c1b6c04195379`.
- App208,747 bytes / `f33655b5af305834052e5dc092c2dbad96bb85e77d0dab538a0fc733e207d940`.

`1124-next-event-diagnostic-applied.json` and
`1124-next-event-diagnostic-restored.json` retain actual application/restoration
times and the closed diagnostic record. Full consumed diff and untracked-source
checks are empty after restoration. No instrumentation is retained in production,
and no reset, checkout or cleanup of unrelated work occurred.

Keep the unresolved new navigation behavior separately in final qualification
limits. Do not infer a C.3 simulation defect, certify UI reliability, or perform
automatic retries from this evidence.1123's independently reviewed fixture
maintenance leaves this test and its routing source unchanged.
