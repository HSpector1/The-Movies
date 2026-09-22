# 687 — P14B.6 Relationship Read Models: task expansion (DRAFT, for the plan)

Authority: Owner ruling 4 of record 683 — "Implement P14B.6 next AFTER the small tuning step, as a
separate read-model slice. Include the planned profile relationship block, readable drivers, casting
chemistry information, factual shared-credit counts and warnings. This is TypeScript/bridge work now,
not native Unity screens. Keep its own scope free of new relationship drivers, policy and tuning."
Rulings 3 (ii) and 3 (iii) of the same record decide two of its contents. Nothing here is an
execution order or a measured result. Written at source `63688a79` + the P14B.5-T candidate.

## Why this slice, and what it is not

B.5 landed a behavioural model with ZERO player visibility: it changed which studio wins a contested
contract and added one sentence to a settlement receipt, and shows the player nothing else (record
675 "Owner-visible behaviour"). B.5-T then made the negative half of the ladder reachable. B.6 is the
slice that lets a player see any of it. It adds NO engine law: no driver kind, no constant, no
policy, no refusal, no save state, no RNG. Every value it publishes is DERIVED at projection time
from facts the engine already owns.

**It is explicitly NOT** the production-quality modifier. Companion §5.6's first row (a bounded
modifier from the director–lead and co-lead tiers) belongs to the PRODUCTION RESULT OWNER, whose
bound, formula and seam are its own slice (R17; §5.6 "P14 never writes a quality number"). Ruling 4
says B.6 "must not invent a quality modifier", and a chemistry READOUT is not evidence that any
result law consumes chemistry. It is also NOT the reservation refusal (ruling 3 (iii): warnings, not
a new hard seating refusal), NOT the retention attention row (§5.6 row 4, its own owner), NOT romance
or Partners, NOT a conflict driver, and NOT the waiver.

## Scope

**(1) `pairChemistry` gets its first consumers.** It is exported and consumer-less today
(`relationships.ts:357`). B.6 reads it. Its shape, its sign rule and its reason copy are unchanged;
if a reason string must change, that is a finding to report, not a B.6 edit.

**(2) The profile relationship block**, on the `BridgeTrustBlock` pattern exactly
(`bridge/schema/bridge-schema.ts:2534-2539`, projected in `bridge/trust.ts`, hung off
`BridgePersonProfileSnapshot` beside `trust` at `bridge/people.ts:216`). A new
`StudioRelationshipBlock` with a `scope`, a `line`, and rows of
`{ counterpartId, counterpartName, tierLabel, sign, drivers: string[], sharedPictures: number }`.

**(3) DISCLOSURE, the decision this slice turns on.** The landed leak law is "no relationship ROOT or
RECORD on a DTO" (`tests/bridge-p14b5-relationships.test.ts:404-408` forbids `"closeness":`,
`"edgeId":`, `"recent":`, `"relationships":`, `"lastEventWeek":`, `"peakTier":` and the
`relationship-edge-` prefix on every serialized DTO). B.6 keeps that test GREEN UNAMENDED: it
publishes tier LABELS, driver COPY and integer COUNTS, never a closeness, an edge id or a stored
driver row.

Separately from the leak law, the Owner requires private rival relationship data to stay private.
The measurement is what makes this load-bearing: on all four standard seeds nearly every edge is
RIVAL-INTERNAL (`…-r02` with `…-r02`, `…-r03-4` with `…-r04-1`; records 679/682), so a block that
simply listed a person's edges would publish the entire rival industry graph. **The rule: a tie is
disclosed only when its COUNTERPART is visible to the player in their own right** — on the player's
roster under the landed roster-at-W predicate (`talentMarket.ts`, the (5) predicate: `startWeek < W
&& (endedWeek === null || W < endedWeek)`), or the viewer's own studio. A rival-internal pair is
never disclosed on any DTO, on any person's profile, including that person's own. The undisclosed
remainder is not silently dropped: the block carries a count-free honest line when ties exist that
the player cannot see, on the `presence.withheld` precedent already in `bridge/people.ts:351-356`.

**(4) Casting chemistry information.** For the seats of a casting draft or an in-flight production,
the pairwise readout among `{directorId, lead, antagonist, support}` — the same six pairs
`seatPairs` uses — each row carrying the tier label, the sign and the driver copy. No number, no
modifier, no forecast delta. Rows for pairs with no edge read as "no shared work yet", never as a
neutral score.

**(5) The casting warning (ruling 3 (iii), companion §5.6 row 2).** When a proposed seating contains
a pair whose `pairChemistry(...).sign` is −1, the casting confirmation carries ONE warning sentence.
It never refuses, never blocks, and never changes a quote, a cost or a forecast. Before B.5-T this
branch was unreachable; the tuning is what gives it a producer, and the B.6 tests must exercise it
through the real write path rather than a staged edge wherever that is possible.

**(6) Factual shared-credit counts (ruling 3 (ii), companion §5.7).** "Worked together on N pictures"
derived from `state.firstTakes` and released film credits — FACTS, never friendship. They are
published for pairs with NO edge as readily as for pairs with one, they are clearly distinguished in
copy from the relationship tier, and they are NOT a migration backfill: nothing reconstructs a tier,
a chemistry or a trust driver from an old credit. A pre-V31 campaign therefore shows counts and no
tiers, which is exactly Q3's ruled behaviour.

**(7) Wire.** `PROJECTION_VERSION` 48 → **49** (checked, not assumed: `bridge-schema.ts:240` reads 48
today and `LIVE_SAVE_VERSION` reads 31). The outgoing schema id registers as `projection-v48` in
`bridge/runtime-checkpoint.ts`, taking the prior-id roster from 36 to 37, with the exact-count pin in
`tests/bridge-p14b4-runtime47-compatibility.test.ts:162` moved by the test owner. **No save step**:
`LIVE_SAVE_VERSION` stays 31, no new root, no validator change, no migration. B.6 has no new save
state at all.

**(7a) T0 — MINT BEFORE THE WRITER MOVES.** Every prior projection bump minted a genuine runtime
checkpoint at the OUTGOING version first: `tests/fixtures/p14/genuine-projection45-runtime`,
`genuine-projection46-runtime`, `genuine-projection47-runtime`. B.6 therefore owes a
`genuine-projection48-runtime` fixture minted on source where `PROJECTION_VERSION` is still 48 —
which is the source as it stands after P14B.5-T and before any B.6 writer edit. Minting it after the
bump would produce a projection-49 artifact wearing a 48 label, and the compatibility test
(`tests/bridge-p14b4-runtime47-compatibility.test.ts`, which consumes the 47 fixture) would have no
genuine 48 predecessor to migrate. Mint it, record its sha256 in a MANIFEST and PROVENANCE beside
the existing three, and only then let the writer touch `PROJECTION_VERSION`. This is a hard ordering
constraint, not a preference.

**(8) Not touched.** `src/core/relationships.ts` (no new driver, no constant, no rule version);
`talentMarket.ts` D5 and the reservation; `promises.ts`; every existing reason, drop and tie
sentence; the settlement order; `rngState`; the 200,000 cap; `TUNING`; every historical fixture and
frozen validator; the evaluator-5 designated case; 628 R5 / G-1(A) / G-2; the waiver.

## Acceptance

Full core equals the 636 baseline set EXACTLY (same nine files, same per-file counts) plus whatever
P14B.5-T's checkpoint establishes as the then-current baseline; full UI at or below the 643 baseline
with the same failure family; `npm run test:bridge` failing on exactly the two inherited files;
`typecheck`, `typecheck:bridge`, `check:bridge-contract` and the fixture check EXIT 0; the landed
leak test green UNAMENDED. Failure identities AND causes are compared, not counts.

## Risks to name before code

1. The disclosure rule is the whole slice. Getting it wrong leaks the rival graph, which is a privacy
   defect, not a cosmetic one. It gets its own test family and its own reviewer question.
2. A profile can show at most `RELATIONSHIP_RECENT_CAP` (8) recent drivers per edge, because the
   older ones folded into counters at write time (measured: 480 to 1,206 drivers folded per seed).
   The block must present that honestly rather than implying a complete history.
3. Only one of four standard seeds exercises drift at all, and none completes a return (record 679).
   A read model tested only on the busy seeds never sees a drifted tier.
