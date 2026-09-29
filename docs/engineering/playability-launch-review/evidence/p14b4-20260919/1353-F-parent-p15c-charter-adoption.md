# 1353-F: parent adoption of the P15C charter with amendments

[1353-B](1353-B-p15c-charter-review.md) returned REFINE. It spot-checked about 30 citations, and all held. The four
blocking defects sit in the archetype predicates of 1353-A §5.3, where the arithmetic was left implicit. The parent
adopts [1353-A](1353-A-p15c-finale-legacy-charter.md) with the amendments below. Where they differ, the amendments
govern.

## Amendments to §5.3

1. **`audience-institution`, the liked half.** A decade is an audience decade when it holds at least
   `LEGACY_DECADE_MIN_RELEASES` scored releases and `2 × liked ≥ scored`. Here `liked` counts that decade's scored
   releases with audience score ≥ `LEGACY_AUDIENCE_LIKED_MIN`, and exactly half qualifies.
2. **`genre-specialist`, the majority.** The archetype holds when `n ≥ LEGACY_GENRE_MIN_FILMS` and one genre has
   `2 × genreCount > n`. Exactly half does not qualify.
3. **The decade partition.** Decades are calendar blocks. A release's decade is `floor(year / 10)`, where
   `year = campaignDate(releaseWeek).year = 1920 + floor(releaseWeek / 52)` (`calendar.ts:17`). The blocks run from
   1920-1929 to 2030-2039, twelve decades before B. The partition is the same for every studio. A studio that enters
   mid-decade counts only its own releases in that block, so a late entrant can still reach four audience decades if
   its releases fill them.
4. **`technology-pioneer`, the contrary side.** For each technology commercial while S was entered, "first
   operational" means S's own earliest operational, non-cancelled adoption of that technology. It never means the
   industry's first adoption. The contrary ref is that adoption's ID when it is later than
   `commercialWeek + LEGACY_TECH_LATE_WEEKS`. It is the technology's ID when S has no operational adoption before B.

## Rulings on 1353-A §11 (the review's, adopted)

- **Q1.** B = 6240, the start of 2040. The end of 2040 would add a year the rulings do not authorize.
- **Q2.** The dossier uses the frozen at-release audience score, labelled "Audience score at release". A live score
  would let a frozen manifest drift.
- **Q3.** A save migrated at or past week 6240 gets no official Legacy and reads `legacyEvidenceIncomplete`. The
  release notes must say so, because it is a one-time cost of shipping after the fact.
- **Q4.** No Standing trend lens in v1, and no recording starts for it. Rival Standing drift never had a receipt, so
  deferring loses nothing new.

## Notes adopted

- §5.3's authored-film citation becomes 1351-F: the exclusion covers every lane.
- RED 9 adds a 13th lens summary that the law refuses.
- A new RED leaf, `legacy-closed-before-boundary`: a studio closed before B stays in the roll call in registry order,
  with its pre-closure facts, its closure week and the archetypes it held.
- **§7's dependency.** The closure week `C` comes from P15B Wave 4, whose closure semantics are proposed in 1352-A §7
  and not yet adopted. Wave 5 of this charter stays gated behind the P15B Wave 4 charter, which must adopt `C`
  explicitly.
- **Ceremony presentation.** A bare pause could let a player advance without seeing the ceremony. The Wave 4 charter
  must present the ceremony content at the stop the first time, not only offer the dossier later. It still asks for no
  decision.
- The annex bounds (16, 8, 12 + 12, 12) are confirmed by the parent at the source with `git show 2a7ff0d9:` on the
  builder annex, D.6 and E.6. The annex gives: "maximum 16 domains", "complete authored set; hard maximum 8",
  "qualifyingEvidenceLinks[] / contraryEvidenceLinks[] // maximum 12 each", and "lensSummaries[] ... hard maximum
  12".

## Next

A light confirmatory pass by the same reviewer (1353-B2). Then Wave R and Wave 1 RED staging (1353-C) go to a test
author.
