# 1349-A: UI repair U3, the identity-review fake view (plan and scratch dry run)

A demonstrated defect: gate [1343](1343-I-broad-ui-attribution.md) recorded one unhandled error, the first in any
recorded UI gate ([1343-J](1343-J-u2-gate-attribution-review.md) checked eight earlier gates):

```text
TypeError: viewRef.current?.hollywoodPerformance is not a function
 ❯ Timeout._onTimeout ui/src/lot/StudioLotScreen.tsx:4854:37
This error originated in "ui/src/lot/StudioLotIdentityReview.test.tsx" test file.
```

## Cause (measured)

- `StudioLotScreen.tsx:4849-4858` polls `viewRef.current?.hollywoodPerformance()` every 500 ms while `hollywood`,
  `identityProof` and `canvasReady` hold.
- The file's fake view (`StudioLotIdentityReview.test.tsx:22-47`) lacks the method. 21 other fake views in `ui/src`
  define `hollywoodPerformance() { return null }` ([1343-F](1343-F-parent-response-to-1343-J.md)).
- **Reproduction:** in a scratch tree at f5b2ab92, a scratch-only leaf turns the dev identity flag on, waits for
  the review control, and keeps the Lot mounted 1.2 s ([before](1349-X-repro-before.txt)). The leaf passes, and
  Vitest reports "Unhandled Errors" with the same `TypeError` twice, one per 500 ms tick. It exits 1.

## Repair (test file only)

[1349-u3.patch](1349-stage/1349-u3.patch), sha256 ca72f857…: three lines added to the fake view. The first two are a
comment; the third is `hollywoodPerformance() { return null }`, the form the other fakes use. There is no production,
config or assertion change, and no existing leaf changes.

## Dry run (scratch)

- The same probe with the repair: passes, no unhandled error, exit 0 ([after](1349-X-repro-after.txt)). The probe then
  came out of the scratch file; it is not part of the patch.
- The whole file with the repair: 10 of 10 pass, no error, exit 0 ([run](1349-X-file-run.txt)).
- Type gates on the scratch tree with `tests/` present: root `tsc --noEmit` and `tsc -p ui/tsconfig.json --noEmit`
  both exit 0 ([root](1349-X-root-tsc.txt), [ui](1349-X-ui-tsc.txt), both empty). An earlier UI type run failed
  because the scratch tree lacked `tests/`; that was the scratch setup, not the change.

## Order

One independent review of this plan and dry run (1349-D). Then application with a `cmp` against the scratch tree. The
next recorded UI gate is the confirmation, and it runs with the scoped Pillow `PATH` of 1345-E.
