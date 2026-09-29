# 1347-F: parent adoption of the relationship rulings charter, with amendments

[1347-B](1347-B-relationship-charter-review.md) returned REFINE with two blocking defects. The parent adopts
[1347-A](1347-A-p14b-relationship-rulings-charter.md) with the amendments below; 1347-A stays byte-frozen and this
record governs where they differ. The rulings themselves are the Owner's (1340-O, and 1342-O item 8). Each amendment
is an implementation decision inside them.

## Amendment 1: Mentor completeness rests on the cohort receipt, stated as a decision (blocking 1)

HIS-014 says "where authoritative history establishes those first three" and "Do not infer missing early-career
history from an incomplete record". 1347-B is right that cohort entrants go through the same generator as genesis
people, genre experience included (`careerLifecycle.ts:377`, `worldgen.ts:394-421`). The parent's decision:

- A person's career in the film world starts at the earliest point the authoritative record fixes. For a cohort
  entrant, that point is the `CohortReceipt` week (`careerLifecycle.ts:360-390`). The receipt creates the person's
  id. No release, first take, contract or credit can name that id before it exists, so the recorded pictures from
  the receipt week on are that person's complete picture history.
- Genre experience (`types.ts:112`, "per-(discipline,genre) experience … (D-9.9)") is a craft value on a 0-100 scale.
  It names no picture, no director and no date. Reading it as unrecorded prior pictures would itself infer history the
  record does not hold, the error HIS-014 forbids. It is not read either way.
- Genesis people and authored-start people are excluded for a different reason. They exist at the campaign's first
  week with adult ages in a world that already has a history (authored-start films before the campaign,
  `hollywood.ts:235`, `:262-266`). Their first pictures lie before any record the game holds.
- Residual limit, recorded rather than hidden: if a later package gives cohort entrants authored prior credits, this
  decision must be revisited, and Mentor is withheld for such a person.

## Amendment 2: D5 keeps its shipped order; ruling 8 is implemented in the tier law only (blocking 2)

Ruling 8 reads "One pair has one current friendship tier … Current hostility governs current consequences even where
historical friendship exists" and ends "Implement these distinctions in the existing tier law, not a new duplicate
precedence system". Its sentences concern one pair's current tier against that pair's history. D5
(`talentMarket.ts:911-917`) ranks a studio across different counterparts on its roster. The shipped order is: close
ties (2) when any counterpart reads CloseFriends or Inseparable; else enemies (0) when any reads Enemies or Nemeses;
else none (1).

The parent's decision is to change nothing in D5. The tier gate becomes reachable (1347-A §2.2), and D5 applies its
existing order to the reachable tiers. The comment "precedence when both: OPEN 11, unreachable in B.5" is updated to
say the order is the shipped one and that Enemies is now reachable. The `enemies here wins` candidate of OPEN 11
(647-A2:39) is not selected, and no Owner question is raised. The Owner asked for the tier law and no new precedence
rule, and keeping the shipped order adds none. The 1347-A §5 test "with a close tie and an enemy on the roster, D5
ranks `enemies here`" is replaced by: with both on the roster, D5 reads `close ties here` (2), for a player issuer
and a rival issuer; with only an enemy, `enemies here` (0).

## Non-blocking notes adopted

- **"Qualifying pictures."** This is the parent's reading of HIS-014, not a settled C3 rule. A qualifying picture is
  a distinct production whose recorded first take seats the actor in any cast slot. Ordering and de-duplication follow
  `retainedTransitionEvidence` (`professionTransitions.ts:54-66`). 942-C3's lead-only count serves a different law.
- **The romance track's eligibility.** Growth and formation both require that the pair is at Friends or above and
  that neither person has an open bond with anyone (companion §5.4a). The formation check remains the one point that
  appends a bond.
- **Projection split.** Projection 57 (slice A) adds `labels: {label: 'Mentor', evidence}[]` only. Projection 58
  (slice B) widens the label union to `'Professional Rivals'` and adds `romance`. No closed-enum member is published
  before a writer can emit it.

## Order

Slice A (rules version 2, the D5 comment, Mentor, projection 57) needs no save step and can be staged now. RED goes to
test-author, and production is queued behind the rival-shelving writer. Slice B (the `competitions` log, romance,
Rivals, Save44, projection 58) follows shelving's Save43.

## Addendum (same day, before any RED): one projection step, in slice B

Every `PROJECTION_VERSION` step needs its own value sweep of the tests (the 49→50 sweep found 42 pins in 27 files). So
slice A publishes nothing new. Rules version 2, the D5 comment and the core Mentor derivation land without a
projection change. Tier values already travel in the existing tier field, so Enemies and Nemeses become visible
through it with no schema change. Slice B takes projection 57 once, for `labels` (`'Mentor' | 'Professional
Rivals'`) and `romance` together. This supersedes the projection split above.
