# 705-W — writer brief: stop the withheld line asserting an employment fact it cannot know

You implement production. You do NOT touch `tests/`. The RED for this change is authored
independently (record 704-T) and is already failing when you start; your job is to make it pass
without weakening it, and without breaking its companion control case.

## The defect

`bridge/relationships.ts:49`

    const WITHHELD_LINE = 'Other working ties here are with people you do not employ.'

is emitted by `relationshipBlockFor` (:149-152) whenever a subject holds an edge whose
counterpart is absent from `rosterAt(...)`. `rosterAt` (:77-84) derives the roster from
`state.hollywood?.employment ?? []`, and `state.hollywood` is nullable —
`src/core/types.ts:1906` types it `HollywoodState | null`.

On a world with NO `hollywood` root, `disclosed` is empty, every counterpart falls to
`withheld`, `rows` is empty, and that sentence becomes the block's entire line. It asserts a
positive fact about who the player employs, computed from a state where employment is not
readable at all — and the player may in fact employ those very people through `state.contracts`.

## Scope of this defect, settled before you start (read this, it bounds the fix)

The independent test author authored the RED and then reported that Case A's shape is NOT
reachable through native campaign creation. The parent verified that independently and it
is correct:

- `beginFounding` (`src/core/employment.ts:539-541`) is
  `initializeHollywood(beginFoundingDraft(state), ...)`, so `state.hollywood` and
  `state.founding` become non-null together, in one transition.
- `beginFoundingHistoricalControl` (`:544`) carries its own comment: "Explicit historical
  analysis control; native campaign creation never calls this."
- An edge is minted only by `advanceRelationshipsWeek` or `recordCancelledAfterFirstTake`
  (`src/core/relationships.ts:271`, `:320`), both driven by production events, and a
  production needs a founded studio.

So "no hollywood root" and "at least one edge" cannot coexist on a live campaign.

That does NOT retire the defect, for two reasons the parent checked:

1. The V31 validator ADMITS the shape. The RED's world round-trips through `makeSave`
   and `validateSaveV31` without complaint, and the author asserts the premise survives
   that round-trip.
2. The migrations PRESERVE it rather than repairing it: `save.ts:8191` and `:8481` both
   carry `hollywood: oldState.hollywood === null ? null : {…}`.

The accurate statement, and the one the record will make: the projector asserts an
employment fact it cannot compute, for a save shape the format accepts, which today's
native founding sequence does not produce. It is a robustness correction, not a bug a
live player currently hits. Do not inflate it and do not use it to justify a larger change.

Fix ONLY the line selection. Do not add a repair, a migration, a validator rule, a refusal
or a warning anywhere else. If you find yourself touching a second file, stop and report.

## The change

Distinguish "the roster is readable and this counterpart is not on it" from "the roster is not
readable at all". The condition is the PRESENCE OF THE ROOT, not the emptiness of the roster.

When `state.hollywood` is null or undefined, the block must not speak to employment. Emit
instead, exactly:

    'No studio roster on record, so working ties are not shown.'

Everything else in the block is unchanged: rows still come from `[...disclosed].sort()` (empty
in this case), the quiet line still covers a subject with no ties and nothing withheld, and the
`ROSTER_LINE` / `WITHHELD_LINE` combination still covers the ordinary case.

Keep it as a named copy constant beside the other five (:47-51), not an inline string. No digit,
no identity, no tier name — the 694-C forward constraint binds every string this feature emits.

## What must NOT change

- **`WITHHELD_LINE` itself, and the case that emits it.** When the `hollywood` root IS present
  and the viewer's employment list is simply empty, the sentence is TRUE and informative, and the
  RED's control case pins it. Do not collapse "no root" and "empty roster" into one branch.
- **The strict-`<` roster predicate.** A hire whose `terms.startWeek === W` is not on the roster
  at W by the engine's own law (`src/core/talentMarket.ts:794-801`). The bridge mirrors that
  deliberately. Leave it.
- **`rosterAt`'s signature or its mirrored predicate.** Fix the line, not the predicate.
- **`requireRelationshipsRoot`, `pairChemistry`, and the D4 `chemistryOf` guard.** Unrelated root,
  unrelated guard. Do not add a second silent fallback next to the first.
- **Anything in `src/core/`, any save state, any DTO shape, any schema `$def`.** The block's shape
  is unchanged — only which of its copy strings is selected. `PROJECTION_VERSION` stays 49 and
  `LIVE_SAVE_VERSION` stays 31.
- **The casting rows.** Separate carrier, separate disclosure basis, not this defect.

## Note on a hash, already settled

A comment-only correction to `bridge/schema/bridge-schema.ts` (record 704) landed at commit
`324f2b0c`, together with the contract-manifest regeneration it forces. It moved
`generatorSourceSha256` from `122a6052…` to `5e255789…`, because `GENERATOR_SOURCE_PATHS` hashes
the schema MODULE SOURCE from disk, not just the generator's output. Both
`npm run check:bridge-contract` and `check:bridge-contract:fixtures` verify as of that commit.

Your change touches `bridge/relationships.ts`, which is NOT in `GENERATOR_SOURCE_PATHS`, so it
moves no manifest hash. If a contract check fails after your edit, that is a real finding: report
it, do not restamp anything.

## Report

Return a cumulative patch per step, the exact lines changed, and the verbatim result of the RED
after your change. Do not run the full suite; the parent owns runtime. State plainly if you think
the copy above is wrong.
