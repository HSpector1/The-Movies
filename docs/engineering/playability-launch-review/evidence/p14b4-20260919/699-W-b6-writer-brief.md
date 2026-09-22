# 699-W — parent brief: the P14B.6 read-model implementation (sim-core, ONE writer)

Authority: the P14 plan's P14B.6 expansion (Owner ruling 4 of record 683; full scope record 687).
You are the ONLY production writer on this branch. The RED that defines the requirement is written
and released by the parent: see `698-T1-report.md`. T0 is DONE and published — the
`genuine-projection48-runtime` fixture exists, so you are now permitted to move `PROJECTION_VERSION`.

## FOUR PARENT DECISIONS, made after the RED (698-T1) and binding on you

**D1 (BLOCKING — this brief's first draft was WRONG). The profile block's DTO key is
`collaborators`, NOT `relationships`.** The landed leak law forbids the literal `"relationships":`
on every serialized DTO and it stringifies `peopleProjection(...)` itself
(`tests/bridge-p14b5-relationships.test.ts:403-408`), so a profile field named `relationships` turns
that test RED. The schema `$def` may keep the name `StudioRelationshipBlock` — a `$def` name never
appears as a DTO key. The RED already keys it `collaborators` (its `BLOCK_KEY`, line 89). The public
vocabulary is deliberately distinct from the engine root's name.

**D2. The casting chemistry rows AND the warning hang on `BridgeCastingQuoteSnapshot`, not on the
board project snapshot.** A Ready screenplay's `StudioCastingProjectSnapshot` carries
`activeSlate: null`, so no seating exists there and the six `seatPairs` are undefined. The quote
snapshot is the only casting surface that receives the PROPOSED seating, and it is what ruling
3 (iii) and companion §5.6 row 2 mean by "the casting confirmation". The in-flight production's
`activeSlate` is a second lawful carrier and is EXCLUDED from B.6 on purpose: B.6 serves the decision
point, and an informational readout on an already-committed picture is a later slice's call.

**D3. The block carries NO `scope` field.** 687 and this brief's first draft both named one, but no
authority defines a `scope` vocabulary for a tie (`StudioTrustBlock`'s `'person' | 'studio'` does not
transfer), and inventing one would be an unsupported product decision. The block is a `line` plus
rows. Do not add a field nothing consumes.

**D4. A rootless state must not throw.** `pairChemistry` calls `requireRelationshipsRoot`, which
THROWS on a missing root by design. Putting it inside `peopleProjection` / `castingProjection` puts
that throw on every existing consumer of those projections. Do NOT add a silent fallback and do NOT
weaken `requireRelationshipsRoot`. Instead: when the root is absent, emit the COUNTS-ONLY form with
no tier rows — which is exactly ruling 3 (ii)'s specified display for a campaign that predates the
feature — and never call `pairChemistry` on that state. Separately, REPORT to me whether any live
projection path can actually deliver a rootless state (check the legacy-v28 and founding-draft
routes); if none can, say so and the branch is defensive only.

## What you implement

1. **Schema.** A `StudioRelationshipBlock` `$def` on the `StudioTrustBlock` pattern
   (`bridge/schema/bridge-schema.ts:2534-2539`): a `line` plus rows of
   `{counterpartId, counterpartName, tierLabel, sign, drivers, sharedPictures}` — no `scope` (D3).
   Hang it on `StudioPersonProfileSnapshot` beside `trust` under the DTO key `collaborators` (D1).
   Add the casting chemistry rows and the warning to `StudioCastingQuoteSnapshot` (D2). Every new
   field is a LABEL, a SENTENCE or an INTEGER COUNT.
2. **Projector.** Model on `bridge/trust.ts`; hang the block at `bridge/people.ts:216` beside
   `trust`; casting rows in `bridge/casting.ts`. Read through `pairChemistry`, `currentTier` and
   `tiersOnRoster` from `src/core/relationships.ts`. **Do not modify `relationships.ts`.**
3. **Wire.** `PROJECTION_VERSION` 48 → 49; register the outgoing
   `sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec` as `projection-v48` in
   `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` (`bridge/runtime-checkpoint.ts`); run the generator once.
   `LIVE_SAVE_VERSION` stays 31.

## The rules that decide whether this is correct

- **DISCLOSURE.** A tie is published only when its counterpart is independently visible to the
  player: on the PLAYER's roster at W under the landed predicate
  `terms.startWeek < W && (endedWeek === null || W < endedWeek)`, subject excluded — the SAME helper
  `talentMarket.ts` uses for D5, not a new one. A rival-internal pair must appear on NO DTO. Records
  679/682 measured that nearly every edge on the standard seeds is rival-internal, so getting this
  wrong publishes the entire rival industry graph. When undisclosed ties exist, emit an honest line
  carrying NO count and NO identity, on the `presence.withheld` precedent (`bridge/people.ts:351-356`).
- **LEAK LAW.** `tests/bridge-p14b5-relationships.test.ts:404-408` must stay GREEN and UNAMENDED. No
  `"closeness":`, `"edgeId":`, `"recent":`, `"relationships":`, `"lastEventWeek":`, `"peakTier":`,
  no `relationship-edge-` prefix on any serialized DTO.
- **NO DELTA MAGNITUDE, EVER** (694-C Q2). A resumed campaign's `recent` can hold both `-4` and `-5`
  `sharedFailure` rows on one edge, so rendering a magnitude would show two numbers for one event
  class. Driver text comes from `pairChemistry(...).reasons`, which carries no digit. Keep it that way.
- **NO QUALITY MODIFIER** (ruling 4). B.6 publishes a chemistry READOUT. It does not compute,
  consume or expose any effect on a production result. That formula, its bound and its seam belong to
  the production-result owner and are a different slice.
- **WARNING, NOT REFUSAL** (ruling 3 (iii)). One sentence when a proposed seating holds a pair whose
  `pairChemistry(...).sign` is −1. It never refuses, never blocks, and never changes a quote, a cost
  or a forecast. Assert that yourself before handing back.
- **COUNTS ARE FACTS, NOT FRIENDSHIP** (ruling 3 (ii)). Shared-picture counts derive from
  `state.firstTakes` and released credits, are published for pairs with no edge exactly as readily as
  for pairs with one, and never imply a tier. A pre-V31-migrated campaign shows counts and no tiers.

## Not touched

`src/core/relationships.ts`; `talentMarket.ts` D5 and the reservation; `promises.ts`; every existing
reason, drop and tie sentence; the settlement order; `rngState`; `TUNING`; the 200,000 cap; every
historical fixture and frozen validator; the evaluator-5 designated case; 628 R5 / G-1(A) / G-2; the
waiver; the 45/46/47/48 fixtures. No new driver kind, constant, policy, refusal, save state or RNG.

## Landing

Hand back ONE CUMULATIVE PATCH PER STEP (`git diff HEAD --binary` after each step) and make NO git
change yourself. The parent lands them as bisectable commits through a temp index. Suggested steps:
S1 schema, S2 people projector, S3 casting rows + warning, S4 wire (projection 49 + registry +
generator). The frozen working tree is never touched by you.

## Known limitation to carry, not to fix

The RED's casting warning is reached through a STAGED Strained edge, and its report says so. The
natural route is untested because no fixture in this repository releases a player picture:
`retentionFixture().outcomes` holds `prod-0052` active at week 61 and still active at week 121 with
`releasedFilms.length === 0`, so no player pair reaches even one `sharedFailure`. Rival pairs do, but
they are rival-internal and therefore undisclosed by D1's own rule. Do not invent a fixture to close
this; record it and move on.

## Verify before handing back, one at a time

0. `npx vitest run tests/bridge-p14b6-relationship-read-models.test.ts --reporter=verbose` — this is
   the RED; every family must go green. Family 0 is a green control that must STAY green.
1. the B.6 RED files — every family green
2. `npx vitest run tests/bridge-p14b5-relationships.test.ts tests/p14b5-relationships.test.ts tests/p14b5-t-failure-tuning.test.ts --reporter=basic` — the landed B.5 and B.5-T suites, expected untouched
3. `npm run typecheck` and `npm run typecheck:bridge`
4. `npm run check:bridge-contract` and `npm run check:bridge-contract:fixtures`

Do not run the full core; the parent owns it on fixed source. If an existing assertion moves, report
it with file, line, expected and actual, and do NOT repair it.

## Handback

`699-W-report.md`: the per-step patches, all command outputs, every file you changed, anything that
moved unexpectedly, and a plain statement that you changed no test and made no commit.
