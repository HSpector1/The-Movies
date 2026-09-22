# 711 — run 708 `test:bridge` on fixed source, and the returning timeout, measured

## The run

`708-d2-bridge`, `npm run test:bridge`, source `e63d6143`, **`fixedSource: true`** with the
empty-tree diff hash at BOTH ends and no untracked source. Start `2026-09-22T21:43:47.161Z`,
end `22:12:18.477Z`, 1706.88s, exit 1.

    Test Files  3 failed | 74 passed (77)
         Tests  13 failed | 838 passed | 2 todo (853)

Failures, all three files: `bridge-p12-campaign-library` (11),
`bridge-p13-campaign-isolation` (1), `bridge-runtime-checkpoint-prepared-reuse` (1). The
first two are the long-standing baseline set and both fail by timeout, not assertion.

CF-09 IS GONE. `bridge-contract-consumer-lock` passes, so the manifest regeneration settled
the one real new failure run 703 produced. Record 709 predicted that and it held.

## The returning timeout, investigated rather than defaulted

`bridge-runtime-checkpoint-prepared-reuse.test.ts` > "preserves live authority on failed Save
and replays the exact successful receipt after later changes and restart" timed out at
20000ms again, with no assertion failure. Record 706 first called this environmental, then
over-corrected to "a defect, not weather". Both were premature. Measured:

| revision | what it contains | elapsed, idle machine |
| --- | --- | --- |
| `43817117` | pre-B.6: `bridge/relationships.ts` does not exist | **14278 ms** |
| `e63d6143` | B.6 complete, D1 and D2 landed | **13328 ms**, and 13710 ms on a repeat |

Measured in a throwaway git worktree at `43817117` with `node_modules` symlinked, same
command, same idle machine, the main tree untouched.

THE SOURCE CHANGE DID NOT CAUSE IT. The test is marginally FASTER at HEAD than before B.6
existed. It consumes roughly 68% of its 20000ms budget with zero contention at BOTH
revisions, so any concurrent load pushes it over. That is why it passes when run alone and
fails inside a full suite.

Supporting facts, each checked rather than assumed:
- The test file is UNCHANGED since the 695 baseline source (`git diff 63688a79 HEAD --` on
  it is empty), and its last commit is `592e926b`.
- It names no projector: `grep -c 'people|profiles'` on the file is 0.
- It is the file's ONLY async case, and the only one carrying a raised timeout (`:367`,
  `20000`, against vitest's 5000 default). Whoever wrote it already knew it ran long.
- The timeout first appeared in run 703, whose source was `68fe5985`. D2 did not exist then,
  so D2 cannot be its cause on the evidence's own timeline.

A COST PATH WAS EXAMINED AND CLEARED. B.6 does make people projection more expensive:
`bridge/people.ts:530` builds `collaborators` PER TALENT, and each
`relationshipBlockFor` call rebuilds a names Map over all talent and runs
`sharedPictureCount` (a scan of every take and every released film) once per disclosed
counterpart. `bridge/snapshot-build-context.ts:155` does reach `peopleProjection` from the
runtime path this test uses. That was a live hypothesis for a real regression. The
measurement refutes it for this test: the pre-B.6 revision, which has none of that cost, is
slower. The projection cost is noted for its own sake and is NOT pursued here, because the
disposition forbids broadening and no evidence ties it to a failure.

ATTRIBUTION: a pre-existing test with insufficient timeout headroom, roughly 6.3s of margin
on an idle machine, which concurrent load consumes. Not introduced by B.6, D1 or D2.

NOT ACTED ON. The headroom is not widened and the timeout constant is not touched. Raising a
limit to turn a red test green is exactly the bending this program refuses, and it is the
Owner's call whether that test's margin is a defect worth its own slice. Recorded as a
candidate, alongside the `sharedPictureCount` projection cost above.

## What 708 does not establish

The full core and the UI suite. Both still owe a fixed-source run at `e63d6143`.
