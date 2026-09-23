# 718 — P14B.6 RELATIONSHIP READ MODELS: QUALIFIED CHECKPOINT

Source at close `211f1c18`, clean tree, verified on the remote by readback of the fetched
object. Slice span `ab405dbe..211f1c18` (15 commits). LOGIC VERIFIED · UNITY NOT VERIFIED.

## 1. Delivered against NEXT696, item by item

| NEXT696 required | landed at | state |
| --- | --- | --- |
| profile relationship block on the landed `trust` pattern | `78eadd07` S2 | done |
| readable drivers | `78eadd07` S2 | done, sentences only, no magnitude |
| casting chemistry rows | `0e0c8a75` S3 | done, on the quote snapshot |
| factual shared-credit counts | `78eadd07` S2 | done, integer counts as facts |
| the Q4 casting warning | `0e0c8a75` S3 | done, one sentence, never refuses |
| projection 48 → 49, NO save step | `ad49031f` S4 | done, `LIVE_SAVE_VERSION` 31 unmoved |
| mint `genuine-projection48-runtime` BEFORE the writer touches `PROJECTION_VERSION` | `43817117` T0, record 697 | ordering constraint honoured; T0 precedes S4 by five commits |
| DISCLOSURE decided, leak law green UNAMENDED | S2 plus records 710, 714, 715 | done, see §5 |

## 2. Production surface

`git diff --stat ab405dbe..211f1c18 -- src` is EMPTY. B.6 changed no engine law, no root, no
validator, no migration and no constant. The whole slice is bridge and generated output:

| file | lines |
| --- | --- |
| `bridge/relationships.ts` | +263 (new) |
| `bridge/schema/bridge-schema.ts` | +89/−… |
| `bridge/schema/project-studio-bridge.schema.json` | +203/−… |
| `bridge/casting.ts` | +16 |
| `bridge/people.ts` | +10/−… |
| `bridge/runtime-checkpoint.ts` | +6 |
| `generated/unity/StudioBridgeDtos.Generated.cs` | +348/−… (regenerated, not hand-edited) |
| `generated/unity/project-studio-bridge.contract-manifest.json` | +10/−… |

## 3. Identities

| identity | before | after |
| --- | --- | --- |
| `LIVE_SAVE_VERSION` | 31 | **31, unmoved** |
| `protocolVersion` | 4 | **4, unmoved** |
| `projectionVersion` | 48 | **49** |
| `schemaId` | `sha256:00c0075b…` | `sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b` |
| generated C# | `370568f3…` | `c84b5f955ba57ac246cf2fc011a329abcbed385317c9e6a5e1ead9800aa54c48` |
| generator source | `04c23b76…` | `5e255789…` |

The outgoing projection-48 schema is registered as a supported prior id at `ad49031f`. The
generator ran exactly once.

## 4. Independently owned tests

Three files, authored by the test-author before each writer, 33 cases:

| file | cases |
| --- | --- |
| `tests/bridge-p14b6-relationship-read-models.test.ts` | 24 |
| `tests/bridge-p14b6-d2-withheld-employment-claim.test.ts` | 2 |
| `tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts` | 7 |

Plus the T2 values-only sweep (`68fe5985`, record 700) across 30 existing test files, which
moved projection pins and nothing else, and which correctly refused to bend two non-version
regressions it met on the way.

## 5. The disclosure decision, which was the slice's real content

The two carriers disclose on DIFFERENT bases, and the difference is deliberate.

**Profile block.** A tie publishes only when its counterpart is independently visible to the
player in their own right: on the player roster at W under `terms.startWeek < W &&
(endedWeek === null || W < endedWeek)`, subject excluded, strict at both ends. A pair internal
to a rival reaches no profile. Records 679 and 682 measured that nearly every edge on the
standard seeds is rival-internal, so this predicate is load-bearing rather than cosmetic.

**Casting rows.** No roster predicate, by design. The player proposed both people for the same
picture and both ids sit inside their own request, so the seating is self-disclosing, and
ruling 3 (iii) asks for the readout at exactly that moment.

Record 710 found the fact that bounds this: `sharedPictureCount` scans `state.firstTakes` with
no studio filter, and rival receipts land in that table by design (`FirstTakeReceipt`'s own
comment says the receipt is written for a player production and a rival one alike). So a count
alone can see work the viewer never commissioned. The E714 correction is scoped by that
finding, and its fourth case proves the unfiltered count genuinely sees the rival pair before
pinning the copy, so the check is not vacuous.

## 6. Closing evidence

| record | run | result |
| --- | --- | --- |
| 695 | full core, B.5-T final bytes | 9 files / 24 failed / 3944 passed / 8 todo (3976) |
| 712 | full core at `fc37bd27`, `fixedSource: true` | 9 files failed / 343 passed (352); 24 failed / 3971 passed / 8 todo (4003) |
| 717 | full core at `5ba2b8d6`, `fixedSource: true` | 9 files failed / 344 passed (353); **24 failed / 3978 passed / 8 todo (4010)** |

Record 716 pre-registered every cell of 717 before the run started, and every cell matched.
The 712 → 717 comparison was made on CAUSES, not counts: each `FAIL` header paired with its own
next `Error:` line, one known ephemeral `mkdtempSync` suffix normalised, and the diff is EMPTY.
Same 24 failures, same files, same cause strings. Those 24 are the inherited baseline set and
B.6 neither added to it nor cleared any of it.

Both sibling B.6 suites ran green inside that full run (read-models 24/24 at line 31,
D2 2/2 at line 1942), which discharged the one evidence limit the writer had named for D2.

## 7. What this checkpoint does NOT claim

- **UI: NOT RERUN; THE RELIABILITY ISSUE REMAINS OPEN.** Record 713 measured the UI project at
  its own unchanged baseline source `df693294` and got 32 failed / 2653 passed against the 26
  that same source recorded as 673, with `livingTurn.scheduler` swinging 1 → 6 → 1. Fourteen
  cases are intermittent. Aggregate pass counts from that project are therefore not usable as a
  regression signal today, so no UI run was made on the E714 correction and none is reported.
  Individual UI failures remain real evidence; only the aggregate is unreliable. Follow-up
  assigned in record 719. No UI-affecting acceptance claim may lean on that project until 719
  returns.
- **UNITY NOT VERIFIED.** The manifest records the same sha for the Unity-side generated
  contract path as for the TypeScript one. That is a RECORDED PAIRING written by the generator,
  not a verified one: no Unity checkout was read, nothing was compiled, nothing was rendered.
  Build56 (projection 31) and the paused Unity branch (32) remain unpaired with 49, and that
  standing gap is now one wider.
- **The 24 inherited core failures are untouched.** B.6 closed none of them and was not asked to.
- **The natural casting-warning route is UNTESTED.** No fixture in this repo releases a player
  picture, so the route that mints a negative tie from real play has never run. The covered
  route is staged. This is an honest coverage limit, not a defect.
- **No balance claim.** The tier bands, the proximity weights and `RELATIONSHIP_FAILURE_DELTA`
  (4 → 5, record 683) are provisional candidate tuning. They move every `tierLabel` and `sign`
  this projection publishes.

## 8. Corrections that landed inside the slice, each with its own evidence

| id | defect | fix | record |
| --- | --- | --- | --- |
| D1 | a disclosure comment in `bridge-schema.ts` claimed the profile roster rule held on every DTO anywhere, which is false of the casting rows | comment corrected; one published hash legitimately moved | 704, `324f2b0c` |
| D2 | `WITHHELD_LINE` asserted a POSITIVE employment fact the projector cannot compute when `state.hollywood` is absent | `NO_ROSTER_ROOT_LINE` on root absence only; an empty roster under a present root still reads `WITHHELD_LINE` | 704-T, 705-W, 707, 712, `e63d6143` |
| E714 | both absence sentences denied shared work on the absence of an EDGE, which is a different fact | `QUIET_LINE` rescoped to the viewer's own pictures; `SHARED_NO_TIE_LINE` and `SHARED_NO_RECORD_LINE` added | 710, 714-T, 715-W, 716, 717, `5ba2b8d6` |

One hazard was closed before publication rather than after. The casting sentence first specified
for E714 was `'They have worked together before. Nothing is recorded about how it went.'`, which
is a strict prefix of `CHEMISTRY_LINE[0]` and diverges only at word 5. Truncated in any readout,
"no record at all" would render as "a recorded, neutral tie": a false-neutral planted in place of
the false-empty the slice removes. The writer caught it, a prefix check confirmed it, and the
sentence was amended to `'They share a credit. Nothing is recorded about how it went.'`, which
diverges at word 1. No test exploited the prefix, so nothing was weakened to accommodate it.

Two predictions in the slice FAILED and are recorded as failures, not reinterpreted:
record 709's UI prediction (30 observed against 26 predicted, attributed in 713 to the unstable
suite and NOT to the candidate), and the parent's own 3-failed/4-passed forecast for the
disclosure pin, where the actual 4/3 was correct and the forecast was not.

## 9. Carried, record-only, not acted on

Positive-saturation; the 6,240-week endurance obligation; 628 R5 / G-1(A) / G-2; 637 cancel
attribution; the waiver (now the next slice, §10); evaluator 5; 702-C REFINE 3-6; the B.6
per-talent projection cost and the new `sharesViewerPicture` O(talent × pictures) scan;
`rosterAt` and `SEAT_PAIRS` restated in `bridge/relationships.ts` from private `src/core/`
helpers, which will drift silently if the engine's move; the deliberate cross-surface asymmetry,
whose honesty rides on the phrase "on your pictures" and which must not be trimmed.

## 10. Next

P14B.7, the promise waiver. The plan has named it "the slice after B.5" since 645-A §2, it was
not bundled into B.5's V31 step, and OPEN 15 records that it therefore needs its own governed
save change. Scope and completion condition are in record 720.
