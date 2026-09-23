# 715-W — writer brief: the absence sentences must speak to shared work, not to edges

You implement production. You do NOT touch `tests/`. The RED is authored independently
(brief 714-T) and is already failing when you start. Make it pass without weakening it and
without breaking its controls.

## The defect

`bridge/relationships.ts` publishes two absence sentences that fire on the absence of an
EDGE while asserting the absence of SHARED WORK:

    :50   const QUIET_LINE = 'No shared work recorded yet.'
    :58   const NO_SHARED_WORK_LINE = 'No shared work yet.'

Edges are minted over `seatPairs` only (director, lead, antagonist, support —
`src/core/relationships.ts:213-222`), so a writer or a craft contributor shares a released
picture and never gets one. Separately, ruling 3 (ii) forbids backfill, so a campaign
predating the V31 root holds `firstTakes` with an empty `relationships` root. Either way a
pair can share pictures and hold no edge, and both sentences then lie.

## The disclosure constraint that bounds the fix

Record 710, already verified: `sharedPictureCount` (:100-117) scans `state.firstTakes` with
no studio filter, and that array holds rival receipts by design (`FirstTakeReceipt.studioId`,
`src/core/types.ts:2131-2142`). A sentence firing on "any shared work exists" would publish
rival industry activity. "No name, no count" does not fix that; the Owner's ruling is that
the EXISTENCE must be permitted too.

Permitted basis, and the ONLY one you may use in `relationshipBlockFor`: work the viewer
commissioned. A `state.firstTakes` receipt with `studioId === viewerStudioId`, or an entry of
`state.studio.releasedFilms` (`state.studio` is the player's own studio, `types.ts:524`).

## The change, site 1 — `relationshipBlockFor` (:126-165)

Only the final branch of the `line` expression changes. Today:

    const line = rows.length > 0
      ? (withheld ? `${ROSTER_LINE} ${WITHHELD_LINE}` : ROSTER_LINE)
      : withheld ? withheldLine : QUIET_LINE

Split the last arm three ways instead of two. Note the branch's own guarantee, which you may
rely on: `rows.length === 0 && !withheld` implies the subject holds ZERO edges, because an
edge with an on-roster counterpart would have produced a row and an edge with an off-roster
one would have set `withheld`. So "no working relationship on record" is strictly true there.

- Viewer-commissioned shared work exists with at least one OTHER person — emit exactly:

      'Shared credits on your pictures. No working relationship on record.'

- Otherwise — emit exactly:

      'No shared work on your pictures yet.'

  This replaces `QUIET_LINE`'s text. The old sentence denies shared work anywhere, which the
  projector cannot know and which is false when the only shared work is rival-internal. The
  replacement reports what the block may speak to. Keep the constant, change its value.

Add one helper beside `sharedPictureCount`, in the same file, that answers "does this person
appear with any other person on a picture this viewer commissioned". Require a DISTINCT other
id: a subject credited twice on one picture is not shared work. Filter takes by
`take.studioId === viewerStudioId`; `state.studio.releasedFilms` needs no filter because it is
already the player's own. When `state.hollywood` is null, `viewerStudioId` arrives as `''`
(`bridge/people.ts:489`) and no receipt matches, which fails closed — leave that behaviour.

## The change, site 2 — `castingChemistryRows` (:173-190)

Same defect, second site. Today:

    line: chemistry.tier === null ? NO_SHARED_WORK_LINE : CHEMISTRY_LINE[chemistry.sign],

When the tier is null but the pair shares a picture, emit exactly:

    'They have worked together before. Nothing is recorded about how it went.'

`NO_SHARED_WORK_LINE` stays as-is for a pair with neither. Use `sharedPictureCount` directly
here with NO roster filter and do not add one: a seating the player proposes is
self-disclosing, which is this function's existing design and the basis record 710 relied on.

## What must NOT change

- **`WITHHELD_LINE`, `ROSTER_LINE`, `NO_ROSTER_ROOT_LINE`, the composite, and every branch
  that selects them.** The Owner directed the off-roster tie sentence be preserved, and the
  D2 correction landed at `e63d6143` is not to be disturbed.
- **`rosterAt` and its strict-`<` predicate.** Settled in 704-T.
- **`sharedPictureCount`'s existing behaviour and its use in the ROW path.** Rows are gated on
  the counterpart being on the viewer's roster; the count is ruling 3 (ii)'s published fact.
  Add your helper alongside it; do not re-scope it.
- **`pairChemistry`, `chemistryOf`, the D4 no-root guard, `requireRelationshipsRoot`.** No
  second silent fallback next to the first.
- **Anything in `src/core/`, any save state, any DTO shape, any schema `$def`.** The block's
  SHAPE is unchanged — only which copy string is selected. `PROJECTION_VERSION` stays 49 and
  `LIVE_SAVE_VERSION` stays 31.
- **Row contents.** No new field, no count in any sentence.

## Copy constraints

Every string keeps the 694-C forward constraint: no digit, no identity, no tier name. The
tier names are `Nemeses`, `Enemies`, `Strained`, `Acquaintances`, `Colleagues`, `Friends`,
`CloseFriends`, `Inseparable`. Keep each as a named constant beside the others at :47-58,
never an inline string. No sentence may imply friendship; the two new ones state the work and
then deny the record, in that order, deliberately.

## Note on hashes

`bridge/relationships.ts` is in neither `GENERATOR_SOURCE_PATHS`
(`scripts/generate-bridge-contract.ts:21-31`) nor `VERIFIER_SOURCE_PATHS`, so your change
moves no manifest hash. If a contract check fails after your edit, that is a real finding:
report it, do not restamp anything.

## Report

A cumulative patch per step, the exact lines changed, and the verbatim result of the RED
after your change. Do not run the full suite; the parent owns runtime. State plainly if you
think any of the copy above is wrong — you are the last reader before it is published.
