# 704-T — RED brief: the withheld line must not assert an employment fact it cannot know

You are the independent test author. You own these test bytes. Nothing below is a
production instruction: if the requirement as written is wrong, say so and do not bend the
test to match current behaviour.

## The defect (demonstrated by review 702-C, item DEMONSTRATED 2, confirmed by the parent)

`bridge/relationships.ts:49` publishes

    const WITHHELD_LINE = 'Other working ties here are with people you do not employ.'

whenever a subject holds an edge whose counterpart is not in `rosterAt(...)`.
`rosterAt` (`bridge/relationships.ts:77-84`) derives the roster from
`state.hollywood?.employment ?? []`, and `state.hollywood` is genuinely nullable —
`src/core/types.ts:1906` types it `HollywoodState | null`.

So on a world with **no `hollywood` root**, `disclosed` is empty, EVERY counterpart falls to
`withheld`, `rows` is empty, and the block emits that sentence as its whole line. The
sentence states a positive fact about who the player employs, on a state where the
projector cannot read employment at all — and the player may in fact employ those very
people through `state.contracts`. That is a false statement on the wire.

The landed precedent for this shape is `bridge/trust.ts:24`, which degrades to a neutral
`'No record yet'` rather than asserting anything.

## What to author

Add cases to the B.6 read-model suite (`tests/bridge-p14b6-relationship-read-models.test.ts`)
or a sibling file of your choosing — your call, you own the layout. Two cases, and the
second matters as much as the first:

**Case A (RED — must fail on the current candidate).** Build a world through the existing
engine helpers where `state.hollywood === null`, the V31 `relationships` root EXISTS, the
subject holds at least one edge, and the player holds at least one LIVE contract in
`state.contracts` covering a person the subject is tied to — so the false claim is not
merely unfounded but demonstrably wrong. Assert the emitted `line`:
  - does NOT contain the substring `you do not employ`, and
  - equals the honest degraded copy the writer will land:
        'No studio roster on record, so working ties are not shown.'
Pin the copy exactly. It carries no digit, no identity and no tier name, per the 694-C
forward constraint.

**Case B (CONTROL — must be GREEN both before and after the fix).** Build a world where the
`hollywood` root IS present but its `employment` list is empty for the viewer, and the
subject holds an edge. Assert the line is still exactly the existing
`'Other working ties here are with people you do not employ.'` Here the claim is TRUE and
informative — the player really employs nobody — and the fix must not swallow it. This case
is what stops the fix from being over-broadened to "any empty roster".

If `beginFoundingHistoricalControl` (`tests/contracts/_contractFixtures.ts`) is the cleanest
route to a hollywood-null world with live contracts, use it; the B.6 RED already reaches
that shape at `tests/bridge-p14b6-relationship-read-models.test.ts:233-235`. Do not hand-mint
a state shape the engine cannot produce.

## Out of scope — do NOT test these as defects

- The strict-`<` boundary (a hire whose `terms.startWeek === W`). 702-C raised it as a second
  instance of the same falsehood. It is NOT one: the engine's own roster predicate
  (`src/core/talentMarket.ts:794-801`) defines that person as not on the roster at W, so the
  line agrees with the engine's own definition of employed-at-W. Changing it would make the
  bridge disagree with the engine. Leave it alone and do not pin it either way.
- The casting rows. They apply no roster predicate by design (see the corrected note above
  `PROJECTION_VERSION`); that is a separate, Owner-facing question, not this defect.
- Anything in `src/core/`. This slice does not touch the engine.

## How to run

ONE heavy process at a time, and only when the parent tells you the machine is free — a full
core run is in flight as this brief is written. Run your new cases targeted (`-t` or the file
path), not the whole project. Report the exact failure text of Case A and the exact pass of
Case B, both verbatim.

## Report

Return: the file and line ranges you wrote, the verbatim RED failure, the verbatim control
pass, and any point where you think the requirement above is wrong.
