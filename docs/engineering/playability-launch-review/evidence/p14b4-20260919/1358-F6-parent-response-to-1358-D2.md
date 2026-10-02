# 1358-F6: parent response to 1358-D2

[1358-D2](1358-D2-rel-sliceB-red-r6-confirmation.md) CONFIRMED slice B RED r6 with eight non-blocking findings. Its
verdict rests on the parent's run 1358-X4 (script `run-1358-X3b.sh`), queued behind the 1348 recorded gates. That run
must match D2's table, leaf by leaf.

## Rulings

1. **Finding 1: 1358-F5 ruling 1's first bound is withdrawn.**
   - F5 said a valid state keeps `endedWeek` at or below `lastEventWeek`. The charter says otherwise. An ending is
     written at the next write that touches the edge "or either person's formation check" (1347-A:56). That write
     moves no driver (:57), and dormancy resumes from `max(lastEventWeek, endedWeek)` (:58).
   - So a third party's recorded ending can lie after its edge's `lastEventWeek`. Romance :626-631 stages that state
     as lawful.
   - The lawful bounds are these: `endedWeek` lies at or after its bond's `formedWeek` and at or below the save
     week, inside the recording interval.
   - Week 101 satisfies both readings, so the leaf stands. Its comment at save-v44 :270-272 states the withdrawn
     bound as law, and r7 corrects it.
   - The production (1358-E decision D4) enforces no edge-relative bound, which is correct.
2. **Finding 2: the two Mentor gates no leaf closes go to the GREEN review.** 1358-J checks the production's gate
   against 1347-A:105 and §6 item 8 as a named item:
   - a released rival picture shows Mentor and is cited by its public title;
   - an announced but unreleased rival picture withholds Mentor;
   - ownership alone never withholds it.

   1358-E step 4 describes this gate: `citePicture` cites a rival picture only once `hollywood.films` holds it.
3. **Finding 3: r7 corrects the stale text.**
   - The own-picture row's `note` and `requirement` describe r6's restaged leaf.
   - The re-formation row's note reads `formedWeek: 100`.
   - The Bridge comment at :328 says the charter allows Mentor for the viewer's own unreleased picture.
4. **Finding 4: settled by the parent's read.**
   - Edge 0 of the pinned week-130 save reads `lastEventWeek` 101, `firstSharedWeek` 8 and `sharedCompetitions` 0,
     at `saveVersion` 42 and tick 130. The read used
     `tests/fixtures/p14/genuine-v42-pre-shelving/genuine-v42-rival-stall-week-130.json.gz`: gzip 121,262 bytes,
     sha256 af45c8a0…; decoded 1,096,270 bytes, sha256 f0bf1f76…. These equal the pins at
     `tests/p14d1-rival-shelving-fixtures.ts:55-59`.
   - The bytes are pinned, so the hardcoded weeks cannot drift, and they stay.
5. **Finding 5:** 1358-X4 reports the first Mentor leaf's duration against X3's 49,182 ms.
6. **Finding 6:** noted. `vitest.config.ts` and `vitest.workspace.ts` keep the default per-file isolation.
7. **Finding 7: r7 adds one assertion.** The own-picture leaf also expects the first two titles in the evidence.
   - At the RED commit the leaf still throws at :371, before the new line, so no RED outcome changes.
   - At GREEN, the production cites every picture of the viewer's own by its concept title.
8. **Finding 8: the pin sweep moves the `acceptedEvidence` pin** (`tests/helpers/p14c3-genuine-evidence-fixtures.ts:17-18`)
   before the recorded GREEN. 1358-E lists it first.

## r7

r7 is r6 plus four changes: the corrected comment of item 1, the stale text of item 3, the assertion of item 7, and
classification text. No RED outcome or first message changes.

The parent checks r7 in two steps:
- the r6-to-r7 diff touches only comments, classification text and the one assertion placed after :373;
- 1358-X4's measurement of r6 then stands for r7.

No new confirmation review is needed for a diff of that shape. If r7 changes anything else, it goes back to review.
