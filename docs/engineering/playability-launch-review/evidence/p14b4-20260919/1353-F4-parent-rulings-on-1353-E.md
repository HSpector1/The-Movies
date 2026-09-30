# 1353-F4: parent rulings on the P15C Wave 1 production handback (1353-E)

[1353-E](1353-E-p15c1-production-handback.md) returned BLOCKED. The module implements 1353-A §5 as amended, and the
final RED r3 cannot pass against any law that follows the charter: 54 leaves fail, 12 pass. With `baseMarketValue`
supplied, 59 pass. With the writer's §8 corrections, 66 of 66 pass. A reference check written apart from `src/`
agrees on every captured manifest.

The RED review 1353-D2 and the parent's dry run 1353-X2 missed all four defects. Every leaf failed at RED on the
missing module, so no expectation was ever evaluated. See the lesson below.

## Rulings on the blocking findings

- **D1, `baseMarketValue`.** Adopted: a required top-level `LegacyFacts.baseMarketValue`, finite and positive, as
  `RankingInput.baseMarketValue` (`powerRanking.ts:53`). The adapter supplies `market.baseMarketValue`, a constant after
  world generation (1350-F). A per-film copy is rejected.
- **D2, the second technology.** The RED is wrong. Every `enteredWeek: 0` studio in `baseFacts` was entered when
  Lighting control became commercial (week 936), so a studio without that adoption carries its contrary ref. The §8
  expectations are adopted and compare sorted ids. The charter states no order for these refs, and 1353-A says order
  never decides an outcome.
- **D3.** `F-TOO-EARLY` carries `domainId: 'playerFilms'`.
- **D4.** The 20,000-film fixture keeps every release below B: `10 + (i % 6230)`.

## Rulings on the open points (1353-E §9)

Points 1-8, 10, 11, 13-16, 18, 20 and 21 are ratified as implemented. The others:

- **OPEN-9 and A1 (from the P15C Wave 2 charter, [1359-A](1359-A-p15c-wave2-charter.md) §3.3).** A ranking ref must
  cite the archive record, which annex D.7 forbids to be week-derived; its id is `power-ranking-<p15DomainSequence>`
  (1355-F2 item 5). `LegacyRankingSnapshotFact` gains `recordId`, and the ref's `id` is that `recordId`. The fixtures
  use ids such as `PR-6240`, so the r3 leaf at patch :715 keeps its meaning. One new leaf pins `ref.id === recordId`.
  `bestRank` stays omitted when no quarter is ranked.
- **OPEN-17 and A2.** `LegacyMarketAssessmentFact` gains `week`, and the law cuts market rows at B like every other
  domain. One leaf puts an assessment at B, outside, and one at B − 1, inside.
- **OPEN-7 and A3.** A closure counts only when its event is dated before B, or when `closedWeek < B`. A
  `closedWeek ≥ B` reads open: no closure contrary and no closure in the survivor predicate. The freeze tick's
  condition step can stamp a closure at 6240 (1359-A §4.1). One leaf covers `closedWeek = B`.
- **OPEN-12, changed.** "For each technology commercial while S was entered" (1353-F amendment 4) means a technology
  that became commercial during S's span: `enteredWeek ≤ commercialWeek` and `commercialWeek` before the end of S's
  span (its closure, else B). A studio that entered after a technology became commercial cannot pioneer it and is not
  cited as late to it. Held-or-not is unchanged: it never read the contrary list. This does not need an Owner
  question. It is the charter author's own meaning, and it only narrows the evidence the dossier cites. Two new
  leaves: an entrant after `commercialWeek` has no contrary ref for that technology, adopted or not; an entrant one
  week before it keeps the ref.
- **OPEN-19, changed.** `settledWeek < releaseWeek` refuses (fail loud: no real run settles before it opens). RED r4
  derives `filmFact`'s default `settledWeek` from its `releaseWeek` (for example `releaseWeek + 10`), and one leaf pins
  the refusal.

## Next

1. **Test author: RED r4.** It applies the §8 delta, the fixture default of OPEN-19, and the new leaves for A1, A2, A3,
   OPEN-12 and OPEN-19. Each leaf's expectation is hand-derived and then checked by running the writer's
   step-2 module from its scratch tree (1353-prod) against r4. Any leaf that module fails is either a planned change
   (A1, A2, A3, OPEN-12, OPEN-19), listed as such, or a RED defect to fix before handback.
2. **Writer: step 3.** The five changed rules, against r4, with the reference check rerun.
3. **Parent dry run 1353-X3.** r4 over step 3, and Part A (Wave R) once the machine is free.
4. **Implementation review 1353-J.** It covers D1, the §9 ratifications and this record.

## Lesson

A RED whose every leaf fails on a missing module shows nothing about its expectations. From now on, the author of a
new-module RED runs a throwaway reference implementation against the RED before handback and reports which leaves
that reference passes. Reviews read that report. The P15C Wave 1 defects surfaced only when production ran.
