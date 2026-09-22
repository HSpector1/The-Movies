# 710 — the false-empty follow-up: why "just say work exists" is not obviously lawful

The Owner's clarification on the neighbouring defect: "no name or count" is necessary, but
THE EXISTENCE OF SHARED WORK MUST ALSO BE PERMITTED BY THE DISCLOSURE RULES, verified inside
the same narrow regression rather than by another audit. This record holds that verification,
done before the fix is designed, because it changes the design.

## The finding

`sharedPictureCount` (`bridge/relationships.ts:93-110`) iterates `state.firstTakes` with NO
studio filter:

    for (const take of state.firstTakes) {
      const seats = [take.directorId, take.cast.lead, take.cast.antagonist, take.cast.support]
      if (seats.includes(a) && seats.includes(b)) pictures.add(take.productionId)
    }

`FirstTakeReceipt` carries a `studioId` (`src/core/types.ts:2135-2142`), so the array is not
player-only, and rival takes genuinely land in it: the B.6 suite's own measured premise (W1,
`tests/bridge-p14b6-relationship-read-models.test.ts:224`, `:290`) records 30 edges at week 61
on the standard seed, 24 of them RIVAL-INTERNAL, and edges are minted from take events.

So some shared work this function can count happened at a RIVAL studio, between two people the
player does not employ. That is precisely the class the disclosure law exists to withhold, and
it is why records 679/682 mattered.

## What this rules out, and what it leaves

RULED OUT: a sentence that fires on "any off-roster shared work exists". On a rival-internal
pair that sentence would publish the existence of rival industry activity from a profile the
player is browsing, which is the leak the B.6 disclosure rule was written to prevent. "No name
and no count" does not rescue it, because the disclosure question is about EXISTENCE, exactly
as the Owner said.

STILL OPEN AND LIKELY CORRECT: a sentence conditioned on shared work the viewer is already
entitled to see. `state.studio.releasedFilms` is the player's own studio's history, and a take
with `studioId === viewerStudioId` is the player's own production. The player commissioned
those pictures and can already see who worked on them, so reporting that such work exists
discloses nothing new. This is the same reasoning that made the casting rows lawful without a
roster filter: a seating the player proposes is self-disclosing.

CONSEQUENCE FOR THE QUIET LINE. Where the only shared work is rival-internal, the block should
keep withholding. But 'No shared work recorded yet.' is then still a false sentence, so the
honest form is one that does not assert absence either. The three cases the Owner named map to
copy as: an off-roster TIE keeps the existing sentence; viewer-entitled shared work with no
recorded tie gets the new sentence; neither gets a line that does not claim more than the
projector may say.

## Scope

This is a finding, not a fix. Nothing is changed by this record. The regression and the
correction follow the D2 push, per the Owner's ordering, and stay inside the three cases named:
an existing relationship, shared work without a recorded relationship, and neither. No
relationship mechanics, no tuning, no re-audit of the disclosure law itself.
