# 1359-F: parent adoption of the P15C Wave 2 charter

[1359-A](1359-A-p15c-wave2-charter.md) stays byte-frozen. Review [1359-B](1359-B-p15c-wave2-charter-review.md) had the
P15 annex and returned REFINE with one blocking item. The parent adopts 1359-A with the amendments below, which
govern where they differ.

## Amendment 1: the validator replays the official manifest (1359-B blocking)

§5.1 says the validator never re-runs archetypes because Standing at B is gone after the freeze tick. No archetype or
lens predicate reads Standing (1353-A §5.3). Standing appears only as `standingAtBoundary`. As written, a manifest
claiming `commercial-engine` held, with fabricated counts over real film ids, would validate.

- **Replay at validation.** `validateSaveVN` rebuilds `legacyFactsFromState(state, B)` from the saved state and runs
  the evaluator that the manifest's `definitionVersion` names. Every field must match the stored manifest except
  `standingAtBoundary`, which is range-checked only. This is the pattern 1356-A §5 item 5 already uses, where `band`
  is the only exempt field.
- **Why the rebuild is exact.**
  - The adapter cuts every domain by effective week (1359-A §4.1). A gross enters only when `settledWeek < B`.
  - Rows appended after the freeze all carry effective week ≥ B.
  - The inputs sit in roots that P15C Wave R pins as retained, and in `state.concepts`, which gains a retention guard
    (Amendment 2).
- **Versioned by era.** `campaign-legacy/v1` stays reachable by the validator after any retune. A v2 law ships with an
  old-law fixture whose v1 manifest still validates, as the other P15 roots already do.
- **Cost.** The full save validator runs at save and load, not every tick: the per-tick asserts are a fixed subset
  (`tick.ts:203-227`). The replay costs one pass over films and events, linear in the campaign. The Wave 2 harness leaf
  reports its time at week 8,791.
- **RED.** 1359-A's validation leaves gain `legacy-validate-replay`. A tampered `outcome`, count, ref list or lens
  value refuses by name. A tampered `standingAtBoundary` inside its range passes, and one outside it refuses.

## Amendment 2: a retention guard for `state.concepts`

The adapter's genre fallback reads `state.concepts` (1359-A §3.1), which is not one of Wave R's five roots. No
writer prunes it today. Wave 2's RED adds one retention leaf in the Wave R style: a concept that a pre-B film reads
survives to the end of the memoized campaign, byte-equal.

## Amendment 3: wording and the Wave 1 fold-in

- §5's "only this module reads `postFinaleMode`" also exempts `save.ts`, which holds `validateSaveVN`, as the RED 16
  guard already does (patch :2142-2157).
- A1-A3 are folded into P15C Wave 1 by [1353-F4](1353-F4-parent-rulings-on-1353-E.md). The RED r4 now in staging
  (1353-C4) carries them. 1359-A's D1-D3 leaves leave the Wave 2 list.

## Answers to the review questions

R1-R8 are adopted as 1359-B answered them. R3 is replaced by Amendment 1.

## Status and order

Charter adopted. Wave 2 RED staging follows the Wave 1 landing (1353-C4, then step 3, then 1353-X3, then 1353-J).
Production shares a save step with its siblings where they are ready together (1355-F Amendment 4), and must land
before any campaign reaches 2040, since each root's `recordedFromWeek` limits the Legacy. Owner questions: none.
