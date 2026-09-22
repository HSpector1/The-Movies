# 707 — D2: the independently authored RED, and what the defect actually is

Record 702-C demonstrated that `bridge/relationships.ts` asserts an employment fact on a
state where it cannot read employment. This record holds the RED that proves it, and the
reachability question the test author raised, which materially changes how the defect
should be described.

## The RED, authored independently

File `tests/bridge-p14b6-d2-withheld-employment-claim.test.ts`, 175 lines, sha256
`002aeba1177363d683f1e9f5ce30a31a64a4d674f802f08c1ee044408f62e631`, captured BEFORE the
writer was dispatched. The author owns these bytes. Brief: `704-T-d2-red-brief.md`.

The author declined to add the cases to the 839-line B.6 suite, on the ground that its
dynamic-import RED machinery is obsolete now that `bridge/relationships.ts` has landed, and
used a plain static import in a sibling file. That was theirs to decide and the reasoning
holds.

CASE A, red on the candidate. World from `richFoundedStudio`, which opens founding through
`beginFoundingHistoricalControl`, so `hollywood` stays null while `state.contracts` is
populated through real `signContract` actions. One edge staged between a contracted
director and a contracted actor, then round-tripped through `makeSave` and
`validateSaveV31`. Every premise is read from engine state rather than assumed, including
that the counterpart's contract row is LIVE at `week` and that both premises SURVIVE the
save round-trip.

    AssertionError: expected 'Other working ties here are with peop…' not to contain 'you do not employ'
    Expected: "you do not employ"
    Received: "Other working ties here are with people you do not employ."
     ❯ tests/bridge-p14b6-d2-withheld-employment-claim.test.ts:128:28

The failure is the assertion on the emitted `line`. It is not an import error, a missing
export or a throwing helper: `collaboratorsOf` resolved, called `peopleProjection`, and read
`profile.collaborators`, the same carrier `bridge/people.ts:530` populates. That distinction
is the difference between a demonstration and a spurious red.

CASE B, green on the candidate and required to stay green. Native
`beginFounding(generateWorld(...))`, so the root is present. The author found that
`hollywood.employment` is NOT empty at founding, because `initializeHollywood` seeds rival
businesses, and replaced a first-draft `toEqual([])` with a check that no row belongs to the
PLAYER studio. They reported that as a fixture bug of their own rather than a defect, which
is the correct call. This case pins the sentence in the state where it is TRUE, and exists
to stop the fix being over-broadened to "any empty roster".

`npm run typecheck:bridge` clean. No full-suite run was made by the author.

## The reachability finding, and why it changes the description but not the fix

The author reported, unprompted by the brief, that Case A's shape cannot arise in native
play. The parent verified this independently and it is correct:

- `beginFounding` (`src/core/employment.ts:539-541`) is
  `initializeHollywood(beginFoundingDraft(state), …)`, so `state.hollywood` and
  `state.founding` become non-null together, atomically.
- `beginFoundingHistoricalControl` (`:544`) states in its own comment: "Explicit historical
  analysis control; native campaign creation never calls this."
- An edge is minted only by `advanceRelationshipsWeek` (`src/core/relationships.ts:271`) or
  `recordCancelledAfterFirstTake` (`:320`), both driven by production events, and a
  production requires a founded studio.

So "no hollywood root" and "at least one edge" cannot coexist on a live campaign. The
author asked whether some non-native path reaches it and said plainly they had not checked.
The parent checked:

- The V31 validator ADMITS the shape. The RED's world round-trips through `makeSave` and
  `validateSaveV31` without complaint, asserted after the round-trip rather than before.
- The migrations PRESERVE it rather than repairing it: `save.ts:8191` and `:8481` both read
  `hollywood: oldState.hollywood === null ? null : {…}`.
- The forward migration does NOT create it: `convertV18ToV19` (`save.ts:7733`) calls
  `initializeHollywood(save.state, 'migration')`.

THE ACCURATE STATEMENT. The projector asserts an employment fact it cannot compute, for a
save shape the format accepts, which today's native founding sequence does not produce. It
is a correction to what the bridge CAN emit, not a bug a live player currently hits. The
earlier framing in 702-C and in the 704-T brief, that the player "may in fact employ those
very people", is true of the constructed world and overstated as a live-play risk. Recorded
here rather than quietly left standing.

The fix proceeds anyway, on the narrow ground that a projector must not assert what it
cannot compute. `bridge/trust.ts:24` already set that precedent by degrading to
`'No record yet'`. The fix is one file, one condition and one named constant, and Case B
bounds it.

## Not done here, deliberately

- The strict-`<` boundary. 702-C offered a hire with `terms.startWeek === W` as a second
  instance. It is not one: `src/core/talentMarket.ts:794-801` defines that person as not on
  the roster at W, so the line agrees with the engine. Excluded from the brief with that
  reasoning, and not pinned either way.
- The casting rows, which apply no roster predicate by design. Separate carrier, separate
  disclosure basis, an Owner-facing product question and not this defect.
- Anything in `src/core/`.

## The fix, and a sibling defect the writer found while making it

THE FIX. One file, `bridge/relationships.ts`, 12 insertions and 1 deletion. A named constant
`NO_ROSTER_ROOT_LINE` beside the existing five, and one selection conditioned on the
PRESENCE OF THE ROOT rather than on the roster being empty:

    const withheldLine = (state.hollywood ?? null) === null ? NO_ROSTER_ROOT_LINE : WITHHELD_LINE

`(x ?? null) === null` is this codebase's own null-or-undefined idiom
(`src/core/technology.ts:602`, `technologyAdoption.ts:271`).

One deliberate decision worth keeping. The `rows.length > 0` arm still names `WITHHELD_LINE`
literally rather than the new variable. Without the root, `disclosed` is empty, so `rows` is
empty and that arm is unreachable in the no-root case. Keeping the literal means the
self-contradicting composite "Working ties with people on your roster. No studio roster on
record…" cannot be constructed at all, rather than merely not occurring.

Parent verification, run independently of the writer's own: the D2 file and the 24-case B.6
suite together, 26 passed. `PROJECTION_VERSION` stays 49, `LIVE_SAVE_VERSION` stays 31.
`bridge/relationships.ts` appears in neither `GENERATOR_SOURCE_PATHS` nor
`VERIFIER_SOURCE_PATHS`, so this edit moves no manifest hash, and
`StudioRelationshipBlock.line` is `nonEmptyText()` rather than an enumeration, so new copy
needs no `$def` change.

SIBLING DEFECT, FOUND BY THE WRITER, RECORDED AND NOT FIXED. `withheld` is set only while
iterating EDGES (`bridge/relationships.ts:129-134`). But an edge is minted only for the four
seats of `seatPairs` (`src/core/relationships.ts:213-222`: director, lead, antagonist,
support), while `sharedPictureCount` also counts `participants.writer.talentId` and every
`participants.craft` member. So a writer or a craft member who shared a released film with an
OFF-ROSTER counterpart has `sharedPictureCount > 0`, holds no edge, leaves `withheld` false,
contributes no row, and the block reads `QUIET_LINE`, 'No shared work recorded yet.' That
sentence is false, and it is false by the projector's own data.

The parent verified the asymmetry at both sites rather than accepting the report. This is the
SAME CLASS as D2, a line asserting something the projector can already contradict, with a
different trigger and a different fix. It is pre-existing in the accepted B.6 design, present
identically before and after this change, and NOT introduced here. It is not fixed in this
slice, because the Owner disposition is explicit that this work is not to be broadened. It is
recorded as a candidate bounded slice for triage, not as an open defect in the D2 fix.
