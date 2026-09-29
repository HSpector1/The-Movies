# 1343-F: parent response to the U2 gate attribution review 1343-J

[1343-J](1343-J-u2-gate-attribution-review.md) returned REFINE with one blocking defect. [1343-I](1343-I-broad-ui-attribution.md)
was pushed and stays byte-frozen; this record governs where they differ.

## Blocking defect 1: the number of fake views that define `hollywoodPerformance` (corrected)

1343-I says "Eight other fake views in `ui/src` define `hollywoodPerformance() { return null }`". The count is **21
files**. `grep -rl "hollywoodPerformance() { return null }" ui/src | wc -l` returns 21 at f5b2ab92, and 1343-J lists
them. The parent's count came from a search whose output was cut at ten lines by `head`. The diagnosis is unchanged:
`StudioLotIdentityReview.test.tsx`'s fake view is the one Lot fake without the method.

## Note adopted

1339's primary for 1124-A was "Test timed out in 5000ms." (1339-I-failures.json row 2), after the `findBy` failures
of 1336 and the dry run. 1343-I's count "4 gone" includes the row. Its cause remains uninvestigated: U2 claims
nothing for it, and it stays an open intermittent.

## The reproduction 1343-I had not made

1343-I said "The parent has not reproduced the throw." The parent reproduced it afterwards in scratch
([1349-A](1349-A-u3-identity-fake-view.md)). With the dev identity flag on, a scratch-only leaf that keeps the Lot
mounted for 1.2 s produces the same `TypeError` twice, once per 500 ms tick. The throw is therefore deterministic once
a mount outlives a tick. Load decides only whether an ordinary leaf of that file lives that long.
