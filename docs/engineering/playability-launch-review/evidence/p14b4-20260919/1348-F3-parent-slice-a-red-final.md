# 1348-F3: slice A RED is final (r4); notes carried to production

[1348-D3](1348-D3-rel-sliceA-red-r4-review.md) returned ACCEPT with no blocking defect. The final RED for relationship
slice A is [1348-rel-sliceA-red-r4.patch](1348-stage/1348-rel-sliceA-red-r4.patch): 36 leaves, 26 fail and 10
control-passes. The dry run is [1348-X4](1348-X4-rel-sliceA-red-r4-dry-run.md).

Correction to 1348-C4's prose (the measured conclusion stands):
- the escape it quotes from the rival surplus loop is at `hollywoodTick.ts:186`, not `:187`;
- `:187` is a second escape: an open promise from the issuing studio to that person. The fixture holds no such
  promise, and the measured termination in the tick week is direct evidence.

Carried to the slice A production brief:
- `chooseProposal` takes the relationships reason from `relationshipsReasonSentence(band)` keyed by the winner's band,
  not from an inline copy. The implementation review checks the call.
- The accessor returns the close-ties sentence for band 2 and the at-odds sentence for band 1. Band 0 can never be a
  decisive winner's band, because it is the floor of {0, 1, 2}. It returns the band-1 sentence and carries a comment
  saying the value is unreachable through `chooseProposal`, so no third sentence is invented.

Slice A production queues behind the shelving writer (1344-E).
