# 1323-F: parent adoption of the P15A.1 charter, and the stop it requires

The parent read [1323-A](1323-A-p15a1-wave0-and-wave1-charter.md) and the independent review
[1323-B](1323-B-p15a1-charter-review.md) (REFINE, three required changes) in full. 1323-A stays byte-frozen; the
amendments below govern where they differ.

## Amendment 1: the authority chain, stated plainly (required change 1)

1323-A §1 called Direction A "later relayed" authority without saying how thin that chain is. The facts:

- RECONCILIATION-02 labels itself "DOCUMENTATION ONLY · NO PRODUCTION AUTHORIZATION · RESEARCH, NOT OWNER AUTHORITY ·
  NOT implementation-ready preparation" (its status line). Its `[OWNER DIRECTION]` labels relay a direction; the
  document is not a ruling.
- `CODEX-P13-P15-OWNER-RULINGS.md` carries dated Owner-direction amendments for P13 (§2.4) and P14 (§3.4) and none for
  P15; §4.3 still lists "the exact shared-market formula" as OWNER DECISION OPEN.
- RECONCILIATION-02's own supersession table (§2.4) supersedes other clauses of that §4.3 line and does not close the
  formula clause.
- The rulings' governance rule (§8): later exploratory prose does not override "the approved boundaries, deferrals,
  open decisions, and implementation prohibition here … unless the Owner issues a newer explicit ruling." The P15
  package §23 agrees: "P15A.1 is blocked until the Owner … selects the exact bounded shared-market formula/envelope."

1323-A's stop condition is therefore the operative rule, not a contingency. **P15A.1 Wave 1 stops at this record.**
No RED, test or code is written until the Owner selects the formula (decision D-1323-1 below) or issues a ruling that
delegates the curve and constants to tuning.

## Amendment 2: fact 7's source (required change 2)

The drama/crime ≈40% figure comes from `src/core/hollywoodStartingData.ts:11-36` (nine rival templates and their
anchors), `src/core/hollywood.ts:206` (`affinities[g] = anchors.includes(g) ? 5 : 1`) and
`src/core/hollywoodTick.ts:259-260` (genre drawn in proportion to affinity); 1323-B reproduced it as 41.3%. The
"P15 market-window analysis" is `docs/research/p15-independent-verification-01/analysis/phase2/market-window.md` at
c5b52b4d, in history only.

## Amendment 3: the harness assertions (required change 3)

When Wave 1 proceeds, the pure 6,240-week harness asserts in operational form:

- **Bounded active set:** after every week, the active exposure count is at most the number of releases in the
  trailing 26 weeks (the retirement boundary), checked by recount from the release log; a released week's exposures
  are all retired by `R+26`.
- **Work per week:** per annex C.1 the batch builds its (studio, genre) window aggregates and genre stock sums once,
  then derives each subject by subtracting its own contribution and re-clamping its studio's aggregate. The assessment
  is instrumented with a pure step counter; for a whole batch it is at most (active exposures) + 2 × (batch members),
  asserted for the 512-member hostile batch, so work is O(active + due) rather than O(batch²). Per annex L.5, the scaling
  comparison runs the 32- and 512-release fixtures and asserts the per-assessment record size is the same at both
  sizes (no co-batch list), with no wall-clock threshold.
- **Determinism:** two runs with the same inputs produce byte-identical canonical JSON of every assessment and the
  final exposure set.

## Note adopted

The eligibility paragraph is restated: a subject's pressure counts only exposures and other batch members of the
subject's own genre; a member of another genre contributes nothing to that subject and yields the
`market-different-genre` ineligibility reason.

## Decision put to the Owner

**D-1323-1 — the exact P15A.1 shared-market formula.** Recommended (1323-A §3 with these amendments): genre plus
release window; window weights 1.00/0.55/0.55/0.20 over four weeks, then a genre-saturation stock at 0.20 halving every
13 weeks and retired at 26 weeks; one unit per release (reach scaling later); a per-studio cap of one release's worth
in the window; box-office factor `1 − 0.25 · (1 − e^(−P/2))`, so no competition changes nothing, one same-window
rival costs about 10% of the opening, two about 16%, and the worst case 25%. Alternatives: the same shape with
different strength (maximum penalty 15% or 35%); window-only with no saturation stock; or delegate the curve and
constants to tuning with an Owner playtest KEEP/REVISE/REJECT at Wave 4.

Until the decision arrives, P15A.1 is blocked; P15A.2 (ranking), P15B (corporate fate) and P16 depend on P15A.1 or
on their own open Owner decisions (rulings §4.3). The handoff carries D-1323-1 with D-1312-1, D-1312-2 and the
Mentor/Rivals label definitions.
