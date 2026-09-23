# 714-T — RED brief: "no recorded relationship" must stop being published as "never worked together"

You are the independent test author. You own these test bytes. Nothing below is a
production instruction. If the requirement as written is wrong, say so and do not bend the
test to match current behaviour.

## The defect the Owner scoped

The Owner's words: "no recorded relationship" is not the same as "never worked together."
The reported writer/craft case demonstrates that mismatch in the projector's data.

`bridge/relationships.ts` publishes two absence sentences, and each fires on the absence of
a RELATIONSHIP EDGE while claiming the absence of SHARED WORK:

    :50   const QUIET_LINE = 'No shared work recorded yet.'          // relationshipBlockFor
    :58   const NO_SHARED_WORK_LINE = 'No shared work yet.'          // castingChemistryRows

Edges are minted only by `advanceRelationshipsWeek` and `recordCancelledAfterFirstTake`
(`src/core/relationships.ts:271`, `:320`), over `seatPairs` (`:213-222`), which covers only
director, lead, antagonist and support. A WRITER or a CRAFT contributor shares a released
picture and never receives an edge. Ruling 3 (ii) adds a second route: a campaign predating
the V31 root carries `firstTakes` entries with an empty `relationships` root, because
nothing is backfilled. Both routes produce a pair with shared pictures and no edge.

## The disclosure constraint, already settled — read it before you design Case B

Record 710 verified this and it CHANGES the design. `sharedPictureCount`
(`bridge/relationships.ts:100-117`) iterates `state.firstTakes` with NO studio filter.
`FirstTakeReceipt` carries `studioId` and its own type comment says the receipt is written
"for a player production and a rival one alike" (`src/core/types.ts:2131-2142`). The B.6
suite's measured premise records 30 edges at week 61 on the standard seed, 24 of them
rival-internal.

So a sentence firing on "any shared work exists" would publish the existence of rival
industry activity. "No name and no count" does not rescue it: the Owner's clarification is
that THE EXISTENCE of shared work must itself be permitted.

The permitted basis, and the only one you may build Case B on: work the viewer already
commissioned. A `state.firstTakes` receipt whose `studioId` equals the viewer's studio id,
or a `state.studio.releasedFilms` entry (`state.studio` is the player's own studio;
`src/core/types.ts:524`). The player can already see who worked on their own pictures.

## What to author

A sibling file of your choosing, or an extension of your D2 file. Your call, you own the
layout. FOUR cases. Cases 1-3 are the Owner's three and are required; case 4 is the sibling
site and is required too, because the same false sentence is emitted from it.

**Case 1 — AN EXISTING RELATIONSHIP (CONTROL, green before and after).** A subject holding
an edge with an OFF-ROSTER counterpart. Assert the line is still exactly
`'Other working ties here are with people you do not employ.'` The Owner directed this
sentence be preserved; this case is what stops the correction from swallowing it. Do not
weaken it.

**Case 2 — SHARED WORK, NO RECORDED RELATIONSHIP (RED, must fail today).** A subject who
appears with at least one OTHER person on a picture the VIEWER commissioned, holding NO
edge with anyone, and with no disclosable counterpart on the viewer's roster at the week —
so `rows` is empty and `withheld` is false. Today this reads `'No shared work recorded yet.'`,
which is false. Assert the line:
  - is NOT `'No shared work recorded yet.'`, and
  - equals exactly `'Shared credits on your pictures. No working relationship on record.'`

**Case 3 — NEITHER (RED on copy).** A subject with no edge and no viewer-commissioned
shared work. Assert the line equals exactly `'No shared work on your pictures yet.'` The
existing `'No shared work recorded yet.'` overclaims: where the only shared work is
rival-internal the projector may not report it, but it also may not deny it. The corrected
sentence reports what the block may speak to.

**Case 4 — THE SIBLING SITE, `castingChemistryRows`.** A proposed seating where two of the
four seats share a picture and hold NO edge (the pre-V31 route is the clean one: `firstTakes`
populated, `relationships` an empty root). That row today reads `'No shared work yet.'`
Assert it equals exactly `'They have worked together before. Nothing is recorded about how
it went.'`, and that a pair with neither still reads `'No shared work yet.'` in the same
seating. No roster filter applies here and none is to be added: a seating the player proposes
is self-disclosing, which is the existing design of this function.

## A route hint for case 2, offered not mandated

Reaching case 2 needs three things at once: viewer-commissioned shared work, ZERO edges, and
no disclosable counterpart on the viewer's roster at the week. The last two fight each other
on a naturally advanced world, so note the asymmetry that makes it reachable.

A `firstTakes` receipt exists because the first shooting week COMPLETED, and that same event
mints edges over `seatPairs`. So a subject seated on a player take normally HAS edges. The
clean route is the one the defect is named for: `state.studio.releasedFilms` carries the
captured `participants`, including the WRITER and the CRAFT contributors, and `seatPairs`
never covers those seats. A writer credited on the player's own released film therefore has
viewer-commissioned shared work and no edge, by the engine's own law rather than by
construction.

For the third condition, `rosterAt` requires `terms.startWeek < week` and
`endedWeek === null || week < endedWeek`, so a counterpart whose contract has ENDED is off
the roster at that week while the credit survives in `releasedFilms`. That is a fact about
the engine, not a hand-shaped state.

If this route does not work, use whichever does and say what you used. Do not hand-mint a
state the engine cannot produce, and do not weaken the case to reach it — report the
obstruction instead, the way the D2 reachability finding was reported.

## COPY AMENDMENT, after the writer landed and before the slice is sealed

`CASE4_LINE` / `SHARED_NO_RECORD_LINE` changes from

    'They have worked together before. Nothing is recorded about how it went.'

to

    'They share a credit. Nothing is recorded about how it went.'

REASON, raised by the writer and verified by the parent. The original is a STRICT PREFIX of
`CHEMISTRY_LINE[0]`'s `'They have worked together before.'`, which is the RECORDED neutral-tier
sentence. Measured: the two strings do not diverge until word 5, where the neutral line ends.
Both can appear as adjacent rows of one six-row casting readout.

That collapses in the WRONG DIRECTION. Any truncation, ellipsis or narrow row drops exactly the
clause that denies the record, and a pair with NO tie then reads as a pair with a recorded
neutral one. This whole correction exists to stop an absence being published as a stronger
claim than the data supports; a sentence whose truncation asserts a record that does not exist
reintroduces that failure at a second site. The information gradient also inverts, with the
state carrying LESS data rendering as the longer and more authoritative string.

The replacement diverges at word 1. No existing test exploited the prefix, so nothing was
broken today; this is a hazard closed before publication, not a bug fixed. Every constraint
still holds: no digit, no identity, no tier name, no friendship implication, and the work is
stated before the record is denied.

## Constraints on every string you pin

The 694-C forward constraint binds all of them: no digit, no identity, no tier name. The
eight tier names are `Nemeses`, `Enemies`, `Strained`, `Acquaintances`, `Colleagues`,
`Friends`, `CloseFriends`, `Inseparable` (`src/core/relationships.ts:45-46`).

None of the four sentences may imply friendship. Case 2's and case 4's both state the work
and then deny the record, which is the distinction the Owner asked for, in that order.

The accepted B.6 suite asserts at `tests/bridge-p14b6-relationship-read-models.test.ts:525`
that a withheld block's line differs from a quiet block's line. Your new sentences must
differ from every existing one. Check that, do not assume it.

## Also verify, inside this same regression

That case 2's basis really is viewer-entitled. Assert positively that a subject whose ONLY
shared work is on a picture belonging to ANOTHER studio does NOT get case 2's sentence. That
is the disclosure check the Owner asked to be carried inside this regression rather than by a
broad audit. If you cannot build that world through the engine's own helpers, say so plainly
rather than hand-minting one.

## Out of scope — do NOT test these as defects

- The strict-`<` roster predicate. Settled in 704-T and unchanged.
- `sharedPictureCount`'s lack of a studio filter in the ROW path. Rows are gated on the
  counterpart being on the viewer's roster, which is the landed disclosure basis; the count
  itself is ruling 3 (ii)'s published fact. Not this defect.
- Relationship mechanics, tiers, closeness, seating, tuning, any constant.
- Anything in `src/core/`.

## How to run

ONE heavy process at a time, and only when the parent tells you the machine is free. Run
your new cases targeted, never the whole project. Report the verbatim failure of each RED
and the verbatim pass of each control.

## Report

The file and line ranges you wrote, the verbatim RED failures, the verbatim control passes,
and any point where you think the requirement above is wrong — especially the copy.
