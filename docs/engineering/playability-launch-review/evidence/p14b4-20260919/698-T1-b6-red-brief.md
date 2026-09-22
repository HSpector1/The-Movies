# 698-T1 — parent brief: the P14B.6 read-model RED (test-author, RED FIRST)

Authority: the P14 plan's P14B.6 expansion (Owner ruling 4 of record 683; full scope in record 687).
You write the tests. A separate writer implements afterwards. You touch no production file.

## The slice in one sentence

B.5 landed a behavioural model the player cannot see, and B.5-T made its negative half reachable;
B.6 publishes what the player is entitled to see, as labels, copy and counts, and nothing else.

## RED technique (the landed precedent)

Import from the ABSENT module so the RED is module resolution, not a spuriously-passing binding.
B.1/B.5 precedent and the standing memory rule: a missing NAMED export binds `undefined` and passes
by accident, so the whole module must be absent and every binding must be CALLED in every group.
Where a family can only be RED BY VALUE (a version literal, a registry count), say so explicitly in
the test's own comment rather than pretending it is a resolution failure.

## Families

**1 PROFILE BLOCK.** A `relationships` block on `BridgePersonProfileSnapshot`, beside `trust`, on the
landed `BridgeTrustBlock` shape (`bridge/schema/bridge-schema.ts:2534-2539`; projector modelled on
`bridge/trust.ts`; hung at `bridge/people.ts:216`). Rows carry
`{counterpartId, counterpartName, tierLabel, sign, drivers, sharedPictures}` plus a block `line`.
Pin: the block is PRESENT on every profile (empty rows, not absent, when there is nothing to show);
row order is deterministic and not Map/insertion dependent; `tierLabel` is the ladder label, never a
number; `sign` is exactly −1/0/+1 and agrees with `pairChemistry(...).sign` at the same week.

**2 DISCLOSURE — the family that matters most.** Records 679/682 measured that nearly every edge on
the standard seeds is RIVAL-INTERNAL. The rule: a tie is disclosed only when its counterpart is
independently visible to the player, i.e. on the PLAYER's roster at W under the landed roster-at-W
predicate (`terms.startWeek < W && (endedWeek === null || W < endedWeek)`, subject excluded). Pin
every boundary the predicate has, exactly as B.5's family 6 pinned them: a row committed AT W is OFF;
a row closed AT W is OFF; a row spanning W is ON. Pin that a rival-internal pair appears on NO DTO
anywhere — profile, roster, casting, industry — on a world built from a standard seed where such
edges demonstrably exist (build it through the engine, not by staging an edge). Pin that when
undisclosed ties exist the block carries an honest line with NO count and NO identity, on the
`presence.withheld` precedent (`bridge/people.ts:351-356`).

**3 DRIVERS TEXT.** Sourced from `pairChemistry(...).reasons`. Pin: no digit appears in any driver
string; no delta magnitude is rendered anywhere. This is the 694-C Q2 FORWARD CONSTRAINT and it is
load-bearing — a resumed campaign's `recent` can now hold both `-4` and `-5` `sharedFailure` rows on
one edge, so rendering a magnitude without an era signal would show two different numbers for the
same event class. Build a root that actually holds both values through the real write path and pin
that the rendered text is identical for both.

**4 CASTING CHEMISTRY ROWS.** For a casting draft or in-flight production, the six `seatPairs` of
`{directorId, lead, antagonist, support}`, each row with tier label, sign and driver copy. Pin: a
pair with no edge reads as "no shared work yet" and NOT as a neutral score; the six pairs are the
same six `seatPairs` produces, in its seat order; no number, no modifier, no forecast delta appears.

**5 CASTING WARNING (Owner ruling 3 (iii)).** Exactly one sentence when a proposed seating holds a
pair whose `pairChemistry(...).sign` is −1. Pin: it fires on such a seating; it does NOT fire
otherwise; it NEVER refuses, blocks, or changes a quote, cost or forecast (assert the quote bytes are
identical with and without the warning); it is one sentence carrying no digit, no person id and no
tier name. **Reach the −1 through the real write path** — B.5-T made that possible — rather than by
staging an edge; if a lawful natural route is not constructible inside this slice, stage it, LABEL
the staging loudly, and say in your report that the natural route is untested.

**6 SHARED-CREDIT COUNTS (Owner ruling 3 (ii)).** "Worked together on N pictures", derived from
`state.firstTakes` and released film credits. Pin: published for pairs with NO edge exactly as
readily as for pairs with one; never presented as friendship, chemistry or trust; a campaign migrated
from a pre-V31 save shows COUNTS and NO tiers (that is Q3's ruled behaviour and the proof that
nothing is backfilled).

**7 LEAK LAW.** The landed test `tests/bridge-p14b5-relationships.test.ts:404-408` stays GREEN
UNAMENDED — do not touch it. Add the same probe class over the NEW DTOs: no `"closeness":`,
`"edgeId":`, `"recent":`, `"relationships":`, `"lastEventWeek":`, `"peakTier":`, no
`relationship-edge-` prefix, and no rendered delta.

**8 WIRE.** `PROJECTION_VERSION` 49; the schema `$id` is projection-49; `LIVE_SAVE_VERSION` stays 31;
`priorityOrder` keeps its seven members and its `line` is unchanged; the outgoing schema id
`sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec` registers as
`projection-v48` in `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`; `EXPECTED_PRIOR_IDS` goes 36 → 37 in
sorted position (`tests/bridge-p14b4-runtime47-compatibility.test.ts:40-80`, and the exact-count pin
at `:162`); the generator `--check` is clean. These are RED BY VALUE; say so.

**9 COMPATIBILITY.** The T0 fixture `tests/fixtures/p14/genuine-projection48-runtime/` (minted at
projection 48, save V31, checkpoint sha `7412ec78…`) migrates through the registry as `projection-v48`
and loads. The 45/46/47 fixtures keep migrating exactly as they do today.

## Hard boundaries

- No production file: nothing under `src/`, `bridge/`, `generated/`, `ui/`, `scripts/`, no config.
- No new engine law: B.6 adds no driver kind, no constant, no policy, no refusal, no save state, no
  RNG. If a test would require one, that is a scope finding to report, not to implement.
- **B.6 must not invent a quality modifier.** A chemistry READOUT is not evidence any result law
  consumes chemistry (ruling 4; companion §5.6 row 1 belongs to the production-result owner).
- Do not modify any existing test, fixture or helper. If one must change, list it for me instead.
- Do not weaken a validator, enlarge a timeout, or rewrite a historical fixture.

## Your handback

`698-T1-report.md`: the files, line counts, sha256s, the exact command, the ACTUAL red/green result
per family (run it; do not predict), which families are RED by resolution and which RED by value,
every staged input named, anything you believe the writer cannot implement without new engine law,
and what the RED cannot establish.
