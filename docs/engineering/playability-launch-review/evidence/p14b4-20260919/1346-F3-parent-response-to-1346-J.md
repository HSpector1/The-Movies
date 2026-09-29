# 1346-F3: parent response to the P15A.1 implementation review 1346-J

[1346-J](1346-J-p15a1-implementation-review.md) returned KEEP with no blocking defect. Nothing has landed yet, so the
parent takes three of its notes now: revision 1346-C4 for the tests, then a production revision by the same writer.

1. **F1 reversed: the plain formula.** The review is right. `1 − 0.25 · (1 − e^(−P/2))` equals exactly 0.75 in
   float64 once P exceeds about 72. That is correct rounding of an asymptote, not an error. Returning the next double
   above 0.75 manufactures a value the Owner's formula never produces. Production computes the formula as written
   and removes `nextDoubleAbove`. The tests assert:
   - `f(P) > 0.75` for every P up to 20, beyond any pressure the charter describes (P = 4 gives about 0.78);
   - `f(P) >= 0.75` for extreme P such as 1000;
   - `f(0) === 1`, and that f never increases.
   This supersedes the F1 ruling of 1346-X4.
2. **The contribution seam.** 1323-A §3 reads "the scaling seam is one named function returning 1 in v1". Production
   exports `releaseContribution(release: MarketRelease): number`, returning 1, and every weight is multiplied through
   it. A test pins the value 1 for a player and a rival release of any genre.
3. **One reason per code.** A leaf puts two same-week peers from two different studios against one subject. It
   asserts exactly one `SAME_WEEK_RELEASES` reason, `sourceReleaseIds` holding both ids heaviest-first, and `value`
   equal to their summed weight.

Kept as ruled: F2 (the clamp value) waits for Wave 2; F3 (no index export) stands. The writer's bit-level permutation
claim stays marked NOT VERIFIED. The accepted tests pin symmetry at 1e-9, and that is the evidence.
