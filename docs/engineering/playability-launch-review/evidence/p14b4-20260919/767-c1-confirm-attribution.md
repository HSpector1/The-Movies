# 767 — the confirming run, and a methodology error in record 766

Run `767-c1-full-core-confirm`, source `2b85da00`. **`fixedSource: true`**, `testedDiffSha256` the
empty-tree hash at BOTH ends, `untrackedSource` empty at both ends. 51 minutes.

## The counts

| | baseline 755 | run 766 | predicted | **run 767** |
| --- | --- | --- | --- | --- |
| files | 10 f / 347 p (357) | 45 f / 313 p (358) | 358 | **33 f / 325 p (358)** |
| cases | 25 f / 4060 p / 8 t (4093) | 159 f / 3955 p / 8 t (4122) | **4139** | **104 f / 4027 p / 8 t (4139)** |

**4139 exactly.** The second prediction correction named the arithmetic — 4093 baseline, +46 for the
RED, both collection deaths restored — and it held to the case.

## The two systemic causes are closed, measured at full-suite scale

- **Cause 1 (my §12 F4 defect): `Historical hash cannot discard talent provenance authority` appears
  ZERO times.** 30 failure lines cleared and both collection deaths reversed, restoring the 16 cases.
- **Cause 2 (the missing strip line): `v14-migration.contract` goes 25 failed → 9.**
- **The A13 fix cleared `bridge-p14b4-cast-class` entirely.**
- **The four "moved hashes" of run 766 were my broken guard throwing**, not hashes moving. Every
  roster-wall and facilities file passes and nothing was re-pinned. The F4 falsifier fired on my own
  defect, which is now confirmed rather than provisional.

## THE METHODOLOGY ERROR IN RECORD 766, and it invalidated a "falsifiable claim"

766 reported "7 timeouts and 6 `ENOENT`" among "the 134 new failure lines, by CAUSE", called them
"plausibly cascades of cause 1", and I then wrote a prediction whose falsifier was their survival.

**They are not new and never were.** Measured against baseline 755's own failing-file list:

| file | 755 | 767 | verdict |
| --- | --- | --- | --- |
| `bridge-p12-campaign-library` | 11 | 2 | **inherited** (timeouts) |
| `bridge-p13-campaign-isolation` | 1 | 1 | **inherited** (timeout) |
| `r3n1-stale-schedule-take-02{,p31,p32}` | 2+2+2 | 2+2+2 | **inherited** (ENOENT) |
| `p13a-scientist-foundation` | 3 | 3 | **inherited** (hash pins) |

**The cause.** My message histogram at 766 ran over EVERY failure in the run rather than over the
NEW-minus-baseline set, so inherited failures were tabulated as though they were consequences of
C.1. The failure-NAME set comparison in the same record was correct and showed these files were not
new; I did not reconcile the two instruments against each other, and published the wrong one's
grouping.

So the claim "they should clear if they were cause-1 cascades" was **ill-founded rather than
falsified**: they could never have cleared, because nothing about them changed. The lesson is the
one the programme already holds about failure-NAME sets being the robust instrument — a histogram is
not, unless it is taken over the difference.

**One baseline failure DID vanish: `bridge-runtime-checkpoint-prepared-reuse`.** That is FU-2, the
prepared-reuse timeout, whose disposition is open and whose threshold has deliberately not been
moved. Tally across recent full runs is now **failed in 739, passed in 737, failed in 755, passed in
767** — two of four. Flakiness, not a C.1 fix, and it strengthens rather than weakens the recorded
recommendation.

## The 80 remaining new-vs-baseline failure lines, by attributed cause

| cause | lines | files |
| --- | --- | --- |
| natural-chain repricing (derived premises no longer reached) | ~28 | `p14b4-rival-seating-preference` 18, `p14b4-cast-class-outcomes` 9, `p14b4-cast-class-policy` 1 |
| **birthday PHASE loss in a projected twin** | 9 | `v14-migration.contract` |
| A13 hand-written age, THREE more files | 4 | `d17b-publicity` 2, `bridge-p05a1-owner-greenlight` 1, `bridge-p05a3-roster-liveness` 1 |
| hash / byte-identical pins on states whose ages moved | 7 | `bridge-p14b5-relationships` 4, `p14b4-rival-seating-preference` 2, `p14b5-relationships` 1 |
| not yet attributed | ~32 | `bridge-p05a1-owner-greenlight`, `bridge-p05a3-roster-liveness`, `bridge-p14b2-trust`, `bridge-owner-ux-projection20-migration`, `ruling-a-development-in-play`, and eleven files with one or two each |

**The A13 count keeps growing under examination**: the audit named one instance, the writer found a
second, the test author found four, and this run shows three more files. That is now a strong signal
that condition 2 is a LAW the test corpus has been quietly violating for a long time, and that the
validator is doing its job by surfacing it.

**Nothing in the ~32 unattributed is being called repricing.** Per 765 §3 an unrelated test can depend
transitively on aging and an age-related test can still expose a real defect, and classification by
filename is forbidden. They are attributed individually before anything changes.

## Standing qualifications

No economic expectation has been re-pinned anywhere, by anyone, in either run. The `ui` project was
not run and FU-1 is still unreturned. Unity/native unchanged and deferred. C.1's own suite is
**46 of 46**.

---

## CORRECTION — A13 is a NEWLY ENFORCED invariant, not a long-standing violation

This record says the growing A13 count is "a strong signal that condition 2 is a LAW the test corpus
has been quietly violating for a long time". **That framing is wrong and it blames the wrong party.**

Before C.1 there was no provenance root. Writing `{ ...person, age: 29 }` onto a test person created
no disagreement with anything, because there was nothing for it to disagree with. Those fixtures were
valid under the law that existed when they were written. C.1 introduces the invariant, and the
fixtures now need internally consistent setup under it.

The count growing under examination — one named by the audit, two by the writer, four by the test
author, three more files in this run — is therefore a measure of **how widely the old idiom was
used**, which is ordinary, not of how long a rule was broken.

What follows for the work is unchanged in substance and changed in method: update the current test
builders so the LAW derives the wanted age, without weakening validation and without rewriting a
genuine historical save. The test author's `withSyntheticAge` helper is exactly that shape.

## The birthday-phase group is NOT classified until one question is answered

This record grouped the nine `v14-migration` failures as "birthday PHASE loss in a projected twin" and
asserted real saves are unaffected because a genuine pre-C2 file holds fractional ages. **That
reasoning is published and it is not yet verified.**

The question to settle before anything in that group is touched: **is the phase loss confined to a
test-only projected twin, or does it also occur in an actual supported conversion?** A rounded age
alone cannot reconstruct the original birthday timing, so if any supported path hands the migration
an already-integer age, that path loses phase for real players, and treating the group as ordinary
repricing would hide the wrong problem.

Two things already known and neither sufficient: worldgen wrote raw gaussians in the pre-C2 era, so
most stored ages in a genuine old save are fractional; and `hollywood.ts:221` manufactures exact
integers on the authored-template path, so *some* stored ages in a genuine old save are integers
whose phase is genuinely unrecoverable. Whether that second set is a disclosed inherent limit or a
defect depends on whether the conversion is supported, which is what has to be established.

## What matching case counts does and does not prove

4139 matched the prediction to the case. **That proves collection completeness — every file was
collected and every case registered — and nothing whatever about whether the remaining behaviour is
correct.** Recorded because a matching count is the kind of number that reads like a pass.

## The four categories every unresolved case is sorted into before any expectation moves

1. a **production defect**
2. a **now-inconsistent test fixture** (the A13 shape, under the newly enforced invariant)
3. an **approved behavioural change** (the intended repricing)
4. an **inherited failure** (present in baseline 755, nothing to do with C.1)

Category 3 is the dangerous one, because it is the label under which a real defect travels unnoticed.
It requires the first changed age, the legitimate consumer it reaches, and the downstream effect,
per 765 §3 — never a filename.
