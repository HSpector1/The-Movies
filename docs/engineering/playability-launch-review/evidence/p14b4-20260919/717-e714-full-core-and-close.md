# 717 — the E714 full core: prediction met, the 695 failure set unchanged, correction closed

Run `717-e714-full-core` discharges the verification the false-empty correction owed. Record
716 pre-registered its outcome before it started.

## Identity and qualification

| field | at start | at end |
| --- | --- | --- |
| `sourceSha` | `5ba2b8d653c3d7e2f98dbcffe6eb08dbca1c3418` | same |
| `testedDiffSha256` | `e3b0c442…` (empty diff) | same |
| `untrackedSource` | `[]` | `[]` |

`"fixedSource": true`, `exitCode` 1, complete end metadata. Start
`2026-09-23T00:34:35.833Z`, end `01:25:11.461Z`, 3034.03s.

## The prediction, and what returned

| cell | predicted (716) | observed (717) |
| --- | --- | --- |
| test files | 9 failed / 344 passed (353) | 9 failed / 344 passed (353) |
| cases | 24 failed / 3978 passed / 8 todo (4010) | 24 failed / 3978 passed / 8 todo (4010) |
| `exitCode` | 1 | 1 |
| `fixedSource` | true | true |
| failure identities | the 695/712 set exactly | the 695/712 set exactly |

Counts reconcile to the case against 712: one further FILE
(`tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts`, 352 to 353) and SEVEN further
cases, its own (4003 to 4010). Passed rises by the same 7. Failed and todo do not move.

## Failure identities AND causes: byte-identical to 712

Each `FAIL` header was paired with its own next `Error:` line and the two sets diffed, with
the one known `mkdtempSync` random suffix normalised. The diff is EMPTY: the same 24
failures, in the same files, with the same cause strings. Nothing new, nothing vanished,
nothing silently turned green.

Failing files, the 695 set exactly: `bridge-p12-campaign-library` (11),
`bridge-p13-campaign-isolation` (1), `p13a-scientist-foundation` (3),
`p14b4-cast-class-capacity-evaluator5` (1), `p14b4-ready-replay-stale-target` (1),
`r3n1-stale-schedule-take-02` / `-02p31` / `-02p32` (2 each),
`world-first-scenery-load-in-provenance` (1).

## What each falsification would have meant, and that none fired

1. **A B.6 sibling failing** would have meant the copy change reached an assertion the
   targeted runs never exercised, and that the writer's static clearance of `:525`, `:613`
   and `:603-605` was wrong. Both siblings are GREEN IN THE FULL SUITE:
   `bridge-p14b6-relationship-read-models` 24/24, `bridge-p14b6-d2-withheld-employment-claim`
   2/2. That is what turns the writer's reasoning into evidence, and it was the one
   outstanding limit they named in their own report.
2. **Any other new failure** would have meant the change is not as bounded as +64/−3 in one
   projector suggests. None appeared.
3. **The prepared-reuse timeout returning** would have required the investigation record 706
   specifies. `bridge-runtime-checkpoint-prepared-reuse` passed 21/21 in 176,619ms. The case
   remains heavy and its margin is still the unwidened one recorded in 711.
4. **Counts matching while an identity moved** would have meant the counts were coincidence.
   The identity-and-cause diff is empty, so they were not.

The E714 file itself ran 7/7 in 6,989ms inside the full suite.

## What this closes, and what it does not

CLOSES: the Owner's bounded follow-up. The three named cases are distinguished — an existing
relationship, shared work without a recorded relationship, and neither — the off-roster tie
sentence is preserved and pinned by a control, and the disclosure question was answered
inside this same regression rather than by a wider audit: a subject whose only shared work is
rival-internal is pinned to the "neither" copy, with the test first proving the unfiltered
count really does see that pair.

DOES NOT CLOSE:
1. **The 24 inherited failures.** They are the carried baseline, untouched by this slice.
2. **The UI suite.** Not re-run here, and record 713 established that its counts carry no
   signal about a source change until its 14 intermittent cases are addressed. Re-running it
   would have produced a number, not evidence.
3. **The two carried findings**, both recorded and neither acted on: the deliberate
   cross-surface asymmetry, where the phrase "on your pictures" carries the honesty and must
   not be trimmed later; and `sharesViewerPicture`'s O(talent × pictures) addition to the
   projection, invisible at current scale, with a known collapse if a measurement justifies it.
