# Record 693 — P14B.5-T: `RELATIONSHIP_FAILURE_DELTA` 4 → 5, tuning checkpoint

Status: engineering checkpoint for the Owner's activated ruling 1 (record 683), qualified by the
independent review `694-C-b5t-checkpoint-review.md` (QUALIFIED WITH RECORD-ONLY ITEMS, conditional on
run 695, discharged in that file's addendum; D1–D3 and R1–R6 applied below). **Certification scope:**
694-C certifies the artifacts it read. It has NOT read this record's rewritten wording, and this
record is the parent's text, not auditor-verified prose. LOGIC VERIFIED · UNITY NOT VERIFIED: nothing native, nothing visual, no
playtest. **PROVISIONAL CANDIDATE TUNING, not settled balance**, in the ruling's own words. Not Owner
acceptance.

## Identity

- Base: `63688a79` (the verified remote at activation).
- Production: `src/core/relationships.ts` — `RELATIONSHIP_FAILURE_DELTA` 4 → 5 plus its doc comment.
  ONE file, one hunk `@@ -69,7 +69,15 @@`, +9/−1, one call site (`:307`). No other production line
  in `src/`, `bridge/`, `generated/`, `ui/` or `scripts/`; 694-C confirmed this from the tested
  diffs of runs 692 and 695, each of which carries exactly two `diff --git` headers.
- Test, independently owned and written BEFORE the change: `tests/p14b5-t-failure-tuning.test.ts`,
  466 lines. Published RED sha256 `cc8c3645…`; FINAL sha256
  `bc02cfcf342c7a975c0ddf8b38198ad4a18d7793aafa39fd73a35d60ee4f6012` after the hygiene fix below.
  Group 1 RED at 4 (`expected 47 to be less than or equal to 44`), groups 2–7 GREEN at 4.
- Tested-diff identities: runs 688–692 carry `testedDiffSha256 702667b6…` (the pre-reword bytes);
  run 695 carries `4c138264…`, the FINAL bytes. Only 695 tests what ships.
- **No version step, no migration.** `RELATIONSHIP_RULES_VERSION` stays 1 (`relationships.ts:37`),
  `LIVE_SAVE_VERSION` 31 (`save.ts:6409`), `PROJECTION_VERSION` 48 (`bridge-schema.ts:240`).
  694-C Q2 attacked the reasoning and could not break it: `validateRelationshipsRoot` validates
  `driver.delta` at `relationships.ts:476` through `integer(...)` (`Number.isSafeInteger`, `:417-420`)
  with no value or sign pin, so a stored `-4` stays valid; no repository fixture stores a
  relationship driver at all (zero `"delta":` matches under `tests/`; the legacy `.json.gz` set is
  ≤ V28 and carries no root); no reader treats a delta as a magnitude (`pairChemistry:365-375` reads
  kinds, `DRIVER_COPY:350-356` carries no number); and `projectRelationshipsPreV31:487-493` REFUSES a
  non-empty root rather than flattening it, so no downgrade can mix eras.
- Migration implication, documented rather than hidden: a campaign RESUMED FROM A SAVE continues
  consistently, because closeness is stored. A campaign REPLAYED FROM ITS SEED from week 0 diverges
  from any archived pre-change relationship value at its first shared failure. No archived digest in
  the suite moves, for three independently verified reasons (694-C D3): the natural-chain digests are
  over `settlementDigest`, `talentMarket.receipts`, `hollywood.employment`, `firstTakes` and
  `rngState` (`tests/bridge-p14b5-relationships.test.ts:450-454`), none of which is the relationship
  root; `tests/p13a-scientist-foundation.test.ts:31` hashes the explicit allowlist
  `{talent, concepts, market, era, rngState}`; and `src/harness/roster-wall/historical-control.ts`
  does not strip the root but REFUSES any state holding an edge (`:31-33`, `:46-47`).
- **FORWARD CONDITION for B.6 (694-C Q2).** A resumed campaign's `recent` window can now hold both
  `-4` and `-5` `sharedFailure` rows on the SAME edge. That is lawful and invisible while nothing
  renders a delta. P14B.6's "readable drivers" must keep the B.2 no-number pattern, or it needs an
  era signal. This is a binding constraint on the next slice, not a note.

## Evidence (record-check, serialized, `fixedSource: true` throughout)

| # | what | result |
|---|---|---|
| 688 | `tests/p14b5-t-failure-tuning.test.ts` | **12 passed / 0 failed**, EXIT 0 — group 1 green, the requirement met |
| 689 | `676-b5-week260-probe.ts` re-run as the POST row | EXIT 0; the 682 → 689 diff is below |
| 690 | the 24 natural-chain controls | **24 files / 324 passed / 4 todo — IDENTICAL to the 671 pre row** |
| 691 | typecheck + typecheck:bridge + check:bridge-contract + fixtures | EXIT 0 |
| 692 | full core, SUPERSEDED (pre-hygiene-fix bytes `702667b6…`) | 10 files / 25 failed / 3943 passed / 8 todo — the baseline nine PLUS `tests/hygiene.test.ts`, cause below |
| 695 | full core on the FINAL bytes `4c138264…` | **9 files / 24 failed / 3944 passed / 8 todo — the 636 baseline set EXACTLY**, with `✓ tests/p14b5-t-failure-tuning.test.ts (12 tests)` |

Run 695 is the authoritative full core: it is the only run over the bytes that ship. It matches the
636 / 669 baseline set exactly — the same nine files with the same per-file counts (11, 1, 1, 2, 2, 2,
1, 3, 1) — and the requirement file passes all 12 on those bytes, which is what proves the
requirement under the record-check runner rather than only under a focused run. The passing delta
over the 669 baseline is **+12** (3932 → 3944), exactly the twelve tests the new file adds; no test
was added, removed, skipped or silenced elsewhere.

695's `exitCode 1` is the 24 INHERITED failures, not a defect of this candidate; no later reader
should read the non-zero exit as one.

**Failure causes compared, not merely counts (the Owner's requirement). PARENT RESULT, not the
auditor's:** 694-C is read-only and did not run this. The parent extracted every `Expected:` /
`Received:` / `Error:` line from 669 and 695, sorted them and diffed. The two sets are IDENTICAL
except for one character run: the `world-first-scenery-load-in-provenance` failure quotes an
ephemeral `mkdtemp` directory (`studio-scenery-export-FePSaE` in 669, `…-hB9RM1` in 695). That is
EXPECTED PER-RUN NOISE from `mkdtemp`, not a moved failure — a reader re-deriving the comparison will
see that one line differ and should not mistrust the row for it. Every digest pair, every ENOENT
fixture path, every string mismatch and the single 60 s timeout are byte-identical across the two
runs. No inherited failure changed identity or cause.

## The one genuinely new failure, and its fix

Run 692 surfaced a tenth failing file, `tests/hygiene.test.ts`, which is not in the 636 baseline set.
Cause: `hygiene.test.ts:32-46` reads every `.ts` file under `src/` and `tests/` (excluding only
itself) and fails if the CONTENTS contain the literal substring `Math.random`, comments included. The
new test file's line 41 was a comment restating its own constraints, and it spelled that literal out.

The TEST-AUTHOR fixed it, not the parent and not the writer: line 41 now reads "no unseeded entropy
of any kind". Restoring only that line reproduces the published `cc8c3645…` byte for byte and `diff`
reports exactly `41c41` — no assertion, group, import, helper, staged world or constant reference
moved, and `hygiene.test.ts` itself was not touched. Verified by its author: hygiene 1 passed, the
tuning file 12 passed.

## The measured natural-world consequence (682 pre → 689 post), attributed

**Same engine, proven not assumed. PARENT RESULT, not the auditor's:** 694-C raised this as R1 and
could not check it without a shell. The parent ran it: the pre row ran on `ddf58e87` and the post row
on `63688a79` plus the candidate, and `git diff --stat ddf58e87..63688a79 -- src/ bridge/ generated/
ui/ scripts/` is EMPTY — the two intervening commits touch 23 files, all under `docs/`. The sole
engine difference between the rows is the tuning.

One cause explains every value movement: a `sharedFailure` driver now stores `delta: -5`, not `-4`.

| | pre (F=4) | post (F=5) | attribution |
|---|---|---|---|
| min closeness ever, p13a / seed-b / bridge | 48 / 48 / 48 | **47 / 47 / 47** | same week, same edge on each (`edge-20`@13, `edge-8`@13, `edge-32`@220), exactly one point lower |
| distance above the Strained ceiling (44), those three seeds | 4 | **3** | arithmetic |
| min closeness ever, adoption seed | 52 @ w9 | 52 @ w9 (distance 8 → 8) | unchanged: that minimum is a MINT value (`BASELINE + PROXIMITY_LOW`) at `firstEdgeWeek` 9, before any flop |
| first `Inseparable` read, p13a / seed-b | w40 / w45 | **w44 / w54** | each flop costs one more point, so the climb to the floor of 81 takes longer. Bridge (w36) and adoption (w45) unchanged |
| p13a peak tiers | 24 Inseparable, 3 Acquaintances | **23 Inseparable, 1 CloseFriends, 3 Acquaintances** | `relationship-edge-5` peaks at CloseFriends in w77 and never reaches 81 |
| p13a stored / drifted histograms | Ins 24 / Ins 11 + CF 12 + Fri 1 | **Ins 23 + CF 1 / Ins 10 + CF 13 + Fri 1** | follows the peak change above |
| p13a `relationships` root bytes | 24,900 | 24,901 | **net +1, NOT decomposed.** The `peakTier` label widens by one character while closeness and week digit-widths also move; an earlier single-field attribution was withdrawn rather than published unsupported |
| p13a gzip-9 save / root marginal | 126,359 / 985 | 126,365 / 991 | compressed sizes move even where raw sizes barely do: same-length content compresses differently (694-C D2) |
| seed-b root bytes, gzip-9 save / root marginal | 25,080 · 185,492 / 957 | 25,080 (identical) · **185,493 / 958** | raw root byte-identical, compressed +1. The encoded row is NOT unchanged on seed-b, and this record does not claim it is |
| edges / drivers derived / observed / distinct keys / retained / folded / every counter incl. `sharedProductions` | — | **all unchanged on all four seeds** | no structural change |
| **Strained ever read** | **false on all four seeds** | **false on all four seeds** | see below |

## Why no settlement receipt moved, and what stays live (694-C Q4)

Two independent reasons, both verified at source rather than assumed:

1. `src/core/talentMarket.ts:842-844` bands `CloseFriends`/`Inseparable` at 2, `Enemies`/`Nemeses` at
   0 — and those two are dead by rule, since `tierOf` collapses both bands to `Strained` — and
   everything else at 1. A newly reachable Strained is therefore INDISTINGUISHABLE from
   Acquaintances to the chooser. The tuning cannot move a band by making Strained reachable.
2. The one channel that remains open is an edge crossing the `CloseFriends` floor (71) DOWNWARD,
   flipping a band from 2 to 1. It cannot fire on these fixtures: every survivor's
   `sharedTakeCounterparts` is empty and every `exposed` row is empty
   (`tests/bridge-p14b5-relationships.test.ts:443,:446`), and `:448` pins every survivor's band at 1.
   The 24 controls (run 690) show it firing nowhere.

**It stays live in a player campaign.** An edge that accumulates enough failures to fall below 71
would move a D5 band and could move a settlement. Nothing in this evidence exercises that, and no
claim here covers it.

Correcting record 683's phrasing: the measured fact on the four seeds is ZERO EXPOSED ROWS, not
"zero receipts through week 416". Settled, declined and expired rows do exist; none is D5-exposed.

## What this does and does not establish

**Does:** repeated failure is now CAPABLE of producing Strained on the applicable low-proximity path,
demonstrated through the real write path — `appendFirstTakes` + `advanceRelationshipsWeek` with a
real `FilmResult`, `validateRelationshipsRoot` after every write, no forged negative edge anywhere
(694-C Q5). That is exactly the capability ruling 1 asked for.

**Does not:** the four standard campaigns still never read Strained within 260 weeks, at either
value. Ordinary rival play on these seeds is dominated by the positive drivers, so the closest any
natural pair comes is 47 against a ceiling of 44. Per the Owner's disposition of 2026-09-22 this is
accepted as satisfying the intended capability and is NOT a reason to adjust the penalty again:
"We should not keep adjusting the penalty merely to force those four campaigns to produce a negative
result." It establishes nothing about balance or variety.

**Also not:** how often a player will meet a strained relationship. That is a later PLAYTESTING
question, not a tuning one. The earlier parent remark that warnings "will matter mostly for player
casting" is recorded as a HYPOTHESIS, not a finding: these runs establish what happened in these
campaigns, nothing about player encounter frequency.

Carried forward unchanged: the positive-saturation finding (record 679 finding 4) and the outstanding
long-campaign obligation (the 6,240-week endurance scenario; four seeds to week 260 is not it).

## The frozen old-law witness

`681-b5-closeness-floor-witness.ts` (sha256 `1cc77f71a9886c9d37d3a5965bf0383e454c8da52333aec534ccf72599448a9c`)
asserts the F=4 law and **will fail if re-run against this source**. The assertions that break are at
**lines 102, 103, 104, 113 and 144** (694-C D1 corrected an earlier loose citation: `:91` and `:96`
derive their expectations BY NAME and still pass at F=5, and `:145-158` are a sensitivity array and a
`console.log` containing no assertion). It is NOT a current-law test and must never be treated as
one. It is preserved unchanged, and its published output `681-closeness-floor-witness.txt` remains
valid as the F=4 measurement.

**To reproduce it you need the pre-tuning source: commit `63688a79`** (or any source where
`RELATIONSHIP_FAILURE_DELTA` is 4), node v20.20.2, command
`node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/681-b5-closeness-floor-witness.ts`.
Its current-law successor is run 688 group 1, which asserts the requirement rather than the floor.
It cannot enter any suite: the core project's include glob is `tests/**/*.test.ts` alone
(`vitest.workspace.ts:20`).

## Record-only items carried from 694-C

- `684-T-report.md:189` calls the full-core run that failed hygiene "run 688"; it was run 692.
  `:148` gives the core include globs as `src/**/*.test.ts, tests/**/*.test.ts`; the actual core
  include is `tests/**/*.test.ts` alone. Neither changes a conclusion; the report is the
  test-author's and is left unrewritten.
- The requirement test's drift "independent oracle" (`:84-88`) restates `currentCloseness`'s formula,
  so its independence is textual rather than logical. Disclosed in the file; acceptable.
