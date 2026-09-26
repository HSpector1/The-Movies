# 817 — C.2b attribution: run 816 against run 805, by full test identity and cause

Run 816: `node_modules/.bin/vitest run --project core` under `run-fixed-source-c2.mjs`, 2026-09-26
05:58:27–06:49:53 CEST, on `1b244006` (production source identical to `8599f5f7`). Recorder: **`fixedSource:
true`**, the tested diff is the empty-tree hash at both ends, no untracked source at either end. No commit was
made during the run. Result: **366 files (19 failed / 347 passed), 4287 cases (59 failed / 4217 passed / 11
todo)**. Comparison `compare-failures-c2.mjs 805 816` → `816-c2b-vs-805-comparison.json`: **NEW 3, VANISHED 7,
RETAINED_SAME_CAUSE 55, RETAINED_CHANGED_CAUSE 1**.

## 1. Against the falsifiers published in 814

| # | predicted | measured | verdict |
| --- | --- | --- | --- |
| 1 | 366 files | 366 | CLEAN |
| 2 | 4287 cases, 11 todo | 4287, 11 todo | CLEAN |
| 3 | every C.2b RED case passes | `p14c2b-extension` 29 + 2 todo, `p14c2b-save-v36` 14, `bridge-p14c2b-extension` 6; none failed | CLEAN |
| 4 | the 55 inherited retained; 809's 8 vanish | 55 RETAINED_SAME_CAUSE, including FU-2 (now 7 of 9 full runs); 7 of the 8 VANISHED; the eighth is seed-b, line 5 | CLEAN |
| 5 | seed-b moves 47 → 48 with r02-3's extension at 416, `takes` and `rng` unmoved | exactly that; see §2 | CLEAN, with one refinement |
| 6 | any other new failure lies in 812 §4's class | 3 NEW, each an industry world reaching an announced employee's `E − 12`; see §3 | CLEAN |
| 7 | `generated/` empty, identities unmoved | empty before and after; projection 50 | CLEAN |

## 2. seed-b, measured (the one RETAINED_CHANGED_CAUSE)

A disposable copy of `bridge-p14b5-relationships.test.ts` printed the measured controls, and a second copy dumped
the settlement rows in this tree and in a `git archive` of `8e84bb59` (the pre-implementation commit, verified
byte-identical on the four relevant files). Both dumps are persisted as `817-seedb-settlement-rows-at-*.json`,
and the copies were deleted after use.

- Rows 48, settled 48, declined 0, expired 0. The added row is `person-studio-bc14baf6-r02-3`, settled at 416 by
  `studio-bc14baf6-r02`, reason "they accepted the one final extension before retiring", no dropped issuer.
- The person's cases are `[196, expiry, settled, 208]` and `[404, retirementExtension, settled, 416]`. The
  record moves E 416 → 468, with `extendedFromWeek` 416 and `extensionUsed` true.
- `takes` and `rngState` are byte-identical to the pins. `settlement`, `receipts` and `employment` move.
- **Refinement to 814 #5.** All 47 earlier rows keep kind, week, person, winner, reasons and dropped. Every
  week-416 event id shifts by +2, because the extension's discovery and proposal receipts at week 404 draw from
  the shared event counter. The extension sentence is also a reason outside the file's `FROZEN_REASONS`, so the
  file's no-new-sentence check fails next once the row count is re-pinned. Both follow from the same one
  extension, and 814 named neither.

## 3. The 3 NEW failures, each traced by probe

1. **`p14c2a-consumers` C2** ("an announced person under an active contract never opens a market case, through
   its own real renewal window"). The only case is `[196, retirementExtension, expired, 208]`, subject the
   player's studio: the player's employee reaches `E − 12 = 196`, and the player makes no offer. No expiry case
   opens, so C.2a's own requirement holds. The literal "no case ever" predates 780's single carve-out.
   **Class (b), approved C.2b law (806 §4).**
2. **`p14c2a-consumers` B4a** ("r01's only director, announced with E = its own contract end, is never re-hired
   past E"). The contract is shortened to end at 13, so `E − 12 = 1`. The case `[1, retirementExtension, settled,
   13]` names r01; the record moves E 13 → 65; the new row runs `[13, 65)`. A `staff()` fresh hire would run to
   221, so this is the rival incumbent's one extension (806 §5, §8.1), not the fresh-hire trap C.2a guards
   against. The row carries `reason: 'replacement'`, the label `commitRivalWinner` has always written
   (`talentMarket.ts:1040, :1047`, the same at `8e84bb59`). **Class (b).**
3. **`p14c4-save-v35` D3** ("with two receipts, the downgrade refusal names the FIRST one's week"). The world
   `genuine-v34-c4-cohort-week`, ticked to 208, now holds a settled extension for
   `person-studio-67adeee5-r01-2`, so `liveEnvelope`'s V36 → V35 step refuses first: "cannot downgrade SaveFileV36
   or discard the retirement extension — it holds 1 retirementExtension case(s) and 1 used extension(s)". That is
   806 §2's refusal, working. The test's C.4 premise (a V35 state with two receipts) is now masked. **Class (b).**

No implementation defect. No expectation moved in this record.

## 4. Coverage debt carried from this run, each with its lawful return path

| case | return path |
| --- | --- |
| seed-b ledger | re-pin as an `approved_behavioral_change` citing 817 (rows/settled 48, the three digests, the extension sentence admitted), `takes` and `rng` unmoved, as 809 did for C.2a |
| C2 | restate: no EXPIRY case ever opens for an announced person; the one extension case is asserted by variant |
| B4a | restate: never re-hired by `staff()`'s fresh hire; the one settled extension `[E, E + 52)` is asserted as C.2b's |
| D3 | rebuild the two-receipt V35 state at a week before the first extension settles, or from a world with none |

## 5. Process findings

- **The sweep's residual list missed two failures.** 813 lists one class (b) case. Its author's hand-back named
  D3 as a second, and 813 calls D3 "unaffected". Neither mentions C2 or B4a. All three were failing when the
  sweep finished: the sweep gave C2's and B4a's synthetic records the V36 keys, which let the extension open.
  Before that, the missing key made discovery skip them silently at `8cf6bed2`, which is why the writer measured
  that file green. The full run caught all three.
- **The writer's green `p14c2a-consumers` at `8cf6bed2` was the silent skip** that the fail-loud follow-up
  (`readExtensionUsed`) closed.
