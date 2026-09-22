# 694-C — parent brief: the P14B.5-T consequential checkpoint review (contract-auditor)

Authority: the Owner's activated instruction — "Have sim-core make the smallest correct production
change with tests independently owned; use contract-auditor at the consequential checkpoint" and
"Attribute any moved natural-chain outcome to the exact new relationship events and chooser
consequences. No unexplained failures, broad expectation sweeps, loosened validators, enlarged
timeouts or rewritten old fixtures."

You are READ-ONLY. One bounded pass. Do not re-audit P14B.5, its RED, its sweep or its regression
evidence. Hand your review back as text; I write the file.

## The candidate

- Production: `src/core/relationships.ts` — `RELATIONSHIP_FAILURE_DELTA` 4 → 5 plus its doc comment.
  One file, +9/−1. That is the ENTIRE production change.
- Test, independently owned: `tests/p14b5-t-failure-tuning.test.ts` (new, 466 lines), written by
  test-author under `684-T-tuning-red-brief.md` BEFORE the change, with group 1 RED at 4 and groups
  2–7 GREEN at 4. Report: `684-T-report.md`. Writer report: `685-W-report.md`.
- Ruling and scope: `683-owner-rulings-activated-and-tuning-scope.md`.

## Evidence on fixed source (all `fixedSource: true`)

| run | what | result |
|---|---|---|
| 688 | the requirement regression | read the file |
| 689 | `676-b5-week260-probe.ts` re-run as the POST row | read the file |
| 690 | the 24 natural-chain controls | 24 files / 324 passed / 4 todo — IDENTICAL to the 671 pre row |
| 691 | typecheck + typecheck:bridge + check:bridge-contract + fixtures | EXIT 0 |
| 692 | full core, PRE-hygiene-fix | 10 files / 25 failed / 3943 passed / 8 todo |
| 695 | full core on the FINAL source, after the hygiene fix | read the file; this is the authoritative one |

**A genuinely new failure occurred and was fixed; audit that too.** Run 692 surfaced
`tests/hygiene.test.ts` failing — a tenth file, not in the 636 baseline set. Cause:
`hygiene.test.ts:32-46` reads every `.ts` file under `src/` and `tests/` (excluding only itself) and
fails if the CONTENTS contain the literal substring `Math.random`, comments included; the new test
file's line 41 was a comment restating its own constraints that spelled the literal out. The
test-author (not the parent, not the writer) reworded that one comment line; the test file's sha256
moved to `bc02cfcf342c7a975c0ddf8b38198ad4a18d7793aafa39fd73a35d60ee4f6012`. Verify from run 695 and
the `684-T-report.md` appendix that no executable line of the test changed, that no assertion was
weakened to achieve it, and that `hygiene.test.ts` itself was not touched.

**Failure-cause comparison already performed by the parent, for you to check rather than trust.**
Across runs 669 (the published baseline) and 692, every inherited failure matches on IDENTITY and on
CAUSE: the same nine files with the same per-file counts, and byte-identical expected/received
digests (`4a4b2e78…` against `16857a26…`, `de6e49d8…` against `d71583f6…`, `0b8e2184…` against
`7517c0d0…`), the same three ENOENT fixture paths, the same `workLimit`/`commandRefused` and
`FRAGILE`/`IMPOSSIBLE` string mismatches, and the same single 60 s timeout. Confirm that, and confirm
specifically that the `p13a-scientist-foundation` RECEIVED digest is unchanged by the tuning, which
is the evidence that that digest does not read the relationship root.

The PRE row is the published run 682. Its diff against 689 is reproduced in the checkpoint record.

## The questions

Q1 **Is the production change the smallest correct one, and is it complete?** One constant and a
comment, nothing else in `src/`, `bridge/`, `generated/`, `ui/`, `scripts/`. Confirm from `692`'s
`.patch` (it captures the exact tested diff over those paths) that no other production line moved and
that the only other source change is the new test file.

Q2 **Is the no-version decision right?** Record 683 argues no `RELATIONSHIP_RULES_VERSION`, no
`LIVE_SAVE_VERSION`, no `PROJECTION_VERSION` bump and no migration, because the rules version is the
TIER RULE revision (`relationships.ts:31-36`), the delta is a driver constant, the receipt carries no
rules version, and `validateRelationshipsRoot` pins no delta value. Verify each clause against source.
Then attack it: find any reader, validator, fixture, digest or frozen path that would now reconcile a
historical `delta: -4` against the new constant, or any place the old and new laws could be confused.
If one exists, that is a DEMONSTRATED defect and the change needs a version signal.

Q3 **Is the natural-chain movement fully attributed?** The 682 → 689 diff shows, and the record
claims: `minClosenessEver` 48 → 47 on three seeds at the SAME week and the SAME edge; the first
`Inseparable` read later (seed 1 w40 → w44, seed-b w45 → w54); on seed 1 exactly one edge no longer
reaches Inseparable (`peakTier` Inseparable 24 → 23, CloseFriends 0 → 1) and the stored histogram
follows; and the root grows by exactly one byte on seed 1 and not at all on the
others. NOTE: the parent's first draft attributed that byte to the `peakTier` string "Inseparable"
(11 chars) becoming "CloseFriends" (12), and then withdrew it — the same edge's `closeness` may drop
from three digits to two, and `peakTierWeek` widths also move, so +1 is a NET of several effects that
the parent did NOT decompose. Check that the record states it as an undecomposed net rather than
attributing it to one field, and check every other movement above.
Then check what did NOT move and must not have: edge counts, driver counts, retained/folded counts,
`sharedProductions`, and Strained still ZERO on all four seeds. Name anything the record leaves
unattributed.

Q4 **Could any settlement receipt move?** The record gives two independent reasons it cannot: D5 is
gated on EXPOSURE, which 654-T measured as zero receipts through week 416 on all four seeds and which
reads employment intervals and take seats, never closeness; and `talentMarket.ts:842-844` maps
Strained to band 1, identical to Acquaintances, so a newly reachable Strained moves no band at all.
Verify both, and identify the ONE channel that remains open (an edge crossing the CloseFriends floor
downward), then say whether the evidence shows it firing anywhere.

Q5 **Is the requirement test honest?** Does group 1 assert the requirement through the REAL write
path (`advanceRelationshipsWeek`), or does it force a negative edge into a root? Are constructed and
natural-world arms labelled and never conflated? Does anything in it freeze a historical test to the
new law, loosen a validator, enlarge a timeout or rewrite a fixture? Is any group trivially true?

Q6 **The frozen old-law probe.** `681-b5-closeness-floor-witness.ts` asserts the OLD law and would now
fail if re-run; it sits under `docs/`, outside the vitest globs, so no suite depends on it. The parent
is FREEZING it as the old-law witness and recording that, rather than amending published evidence or
deleting it. Is that the right disposition, and is it recorded plainly enough that a future reader
cannot mistake it for a live check?

Q7 **Overclaim sweep.** Does anything claim this is settled balance, a fixed relationship model, a
completed ladder, a saturation fix, conflict/Enemies/Nemeses evidence, a performance result, a
century-scale result, native or Unity work, or Owner acceptance? The ruling calls it PROVISIONAL
CANDIDATE TUNING; quote anything that reads stronger. Note specifically whether the record is honest
that the four standard seeds STILL never reach Strained in 260 weeks after the change.

## Verdict

QUALIFIED / QUALIFIED WITH RECORD-ONLY ITEMS / NOT QUALIFIED, then DEMONSTRATED defects (file, line,
the exact fact that contradicts the claim), then REFINE, then what you could not check. If a finding
needs a rerun, name the smallest one. Under 120 lines.
