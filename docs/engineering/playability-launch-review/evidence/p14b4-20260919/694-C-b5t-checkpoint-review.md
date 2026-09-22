# 694-C — contract-auditor review of the P14B.5-T tuning checkpoint (READ-ONLY, nothing executed)

**VERDICT: QUALIFIED WITH RECORD-ONLY ITEMS** — conditional on run 695. Nothing I found touches the
production change, the test, or the no-version decision. Every defect below is in record 693's prose.
If 695 does not read **9 files / 24 failed / 3944 passed / 8 todo** with
`tests/p14b5-t-failure-tuning.test.ts` green at 12, this verdict does not carry (derivation under Q1).

### Answers in brief order

**Q1 — smallest and complete: MET WITH EVIDENCE.** `692-b5t-full-core.patch` and
`695-b5t-full-core-final.patch` each contain exactly two `diff --git` headers: `src/core/relationships.ts`
(one hunk, `@@ -69,7 +69,15 @@`) and the new `tests/p14b5-t-failure-tuning.test.ts` (`@@ -0,0 +1,466 @@`).
Nothing else in `src/`, `bridge/`, `generated/`, `ui/`, `scripts/`. The constant has one call site
(`src/core/relationships.ts:307`). Versions unmoved and verified at source: `RELATIONSHIP_RULES_VERSION = 1`
(`relationships.ts:37`), `LIVE_SAVE_VERSION = 31` (`src/core/save.ts:6409`), `PROJECTION_VERSION = 48`
(`bridge/schema/bridge-schema.ts:240`).
692 arithmetic reconciles exactly: 669 baseline 3964 tests → 692 3976 (+12 new), 3932+12−1 = 3943 passed,
24+1 = 25 failed, the +1 being hygiene. Hence the 695 prediction above.

**Q2 — no-version decision: MET WITH EVIDENCE.** I attacked it and could not break it.
- `validateRelationshipsRoot` validates the delta at `relationships.ts:476` with `integer(driver.delta, …)`
  only (`Number.isSafeInteger`, `:417-420`) — no value pin, no sign pin. A stored `-4` stays valid.
- `RELATIONSHIP_RULES_VERSION`'s own doc (`relationships.ts:33-36`) is the tier-rule revision; `tierOf`
  (`:139-142`) and the floors (`:51-53`) are untouched.
- No repository fixture stores a relationship driver: zero `"delta":` matches under `tests/`; the legacy
  `.json.gz` fixtures are ≤ V28 (`src/harness/p14/legacy-v28-fixtures.ts`) and carry no root.
- No reader reads a delta as a magnitude: `pairChemistry` (`:365-375`) reads kinds only, `DRIVER_COPY`
  (`:350-356`) carries no number, `tiersOnRoster` reads closeness, and the wire is closed by
  `bridge/schema/bridge-schema.ts:239` ("no closeness, edge or driver ever appears on any serialized DTO").
- `projectRelationshipsPreV31` (`:487-493`) REFUSES a non-empty root rather than flattening it, so no
  downgrade path can silently mix eras.
No version signal is required today. **Forward condition to record:** a resumed campaign's `recent` can
now hold `-4` and `-5` `sharedFailure` rows on the SAME edge. That is lawful and invisible while nothing
renders a delta; P14B.6's "readable drivers" must keep the B.2 no-number pattern, or it needs an era signal.

**Q3 — attribution: verified line by line, two gaps (D2, R1).** Confirmed from `682:5-79` vs `689:5-79`:
min closeness 48→47 at the SAME week and SAME edge on all three (`edge-20`@13, `edge-8`@13, `edge-32`@220);
adoption 52@9 unchanged and it is indeed a mint (50 + `RELATIONSHIP_PROXIMITY_LOW`, `firstEdgeWeek` 9);
first Inseparable read 40→44 and 45→54 (bridge 36 and adoption 45 unchanged); p13a stored Ins24 → Ins23+CF1,
drifted Ins11/CF12/Fri1 → Ins10/CF13/Fri1, peak Ins24 → Ins23+CF1 (Acq 3 constant on both sides);
root 24900→24901 on p13a and byte-identical on the other three. `edges / driversRetained / derived /
observed / distinct keys / folded / every counter incl. sharedProductions` identical on all four seeds.
`strainedEverRead false` and `Strained=0` on all four, both rows. The named edge checks out: `689`'s
`peakTierFirstWeeks` for p13a contains `[5,"CloseFriends",77]`, and since peaks can only fall under a
larger penalty and the pre row had zero CF peaks, `relationship-edge-5` must have been Inseparable pre.
The record states the one-byte growth as an undecomposed net (`693:49`, "NOT decomposed … the parent
withdrew an earlier single-field attribution") and does **not** sneak the `peakTier`-string explanation
back in. That instruction is honoured.

**Q4 — settlement receipts: sound, but 693 omits the whole argument.** Verified independently and more
strongly than 683 states: `src/core/talentMarket.ts:842-844` bands `CloseFriends`/`Inseparable` at 2,
`Enemies`/`Nemeses` at 0 (dead by rule — `tierOf` collapses both bands to `Strained`), everything else 1,
so a newly reachable Strained is indistinguishable from Acquaintances. The frozen chain digests are over
`settlementDigest(state)`, `talentMarket.receipts`, `hollywood.employment`, `firstTakes`, `rngState`
(`tests/bridge-p14b5-relationships.test.ts:450-454`) — the relationships root is in none of them.
The ONE open channel is an edge crossing the `CloseFriends` floor (71) downward, flipping band 2→1.
It cannot fire on these fixtures: every survivor's `sharedTakeCounterparts` is `[]` and every
`r.exposed` row is empty (`:443`, `:446`), and `:448` pins every survivor's band at 1. The evidence shows
it firing nowhere. It remains live in a player campaign, and `684-T-report.md:176-178` says so; record 693
says nothing about D5 at all. Also: 683:67-68's "ZERO receipts through week 416" is loose — the measured
fact is zero EXPOSED rows (`:446`); settled/declined/expired rows do exist (`:434-436`). Do not inherit
that phrasing into 693.

**Q5 — requirement test: honest.** Group 1 (`tests/p14b5-t-failure-tuning.test.ts:206-233`) drives the real
path only: `shoot` → `appendFirstTakes` + `advanceRelationshipsWeek` (`:106-112`), `release` →
`advanceRelationshipsWeek` with a real `FilmResult` (`:113-118`), `validateRelationshipsRoot` after every
write. No forged negative edge anywhere. Constructed vs natural arms are labelled in the header (`:20-43`),
in every `describe` name, and in the limits section of `684-T-report.md:158-179`. No existing test, fixture
or helper is touched (Q1 patch evidence); no timeout option appears in the file; group 6's one staged value
(`:394-420`) is an in-memory relabel of an already-written root, disclosed at `:42-43` and `:395-399`.
Nothing is trivially true: `lowest ≤ 44` lands exactly on 44 at F=5; the constant-only assertion at `:229-231`
is the guard that catches a silent re-tune. Minor: the drift "independent oracle" (`:84-88`) restates the
same formula as `currentCloseness`, so its independence is textual, not logical — disclosed, acceptable.

**Q6 — frozen witness: right disposition, wrong lines (see D1).** Freezing is correct: the core project's
include glob is `tests/**/*.test.ts` only (`vitest.workspace.ts:20`), so a `docs/` probe cannot enter any
suite. 693:75-84 pins the sha256, states plainly it is NOT a current-law test, gives the reproduction
commit and command and names its successor. A future reader cannot mistake it for a live check.

**Q7 — overclaim sweep: clean.** I found nothing claiming settled balance, a fixed model, a completed
ladder, a saturation fix, conflict/Enemies/Nemeses evidence, performance, century scale, native/Unity work
or Owner acceptance. The honesty the brief asked about is present and correctly framed: `693:51` and
`693:59-64` state the four standard seeds still never read Strained at either value and that this
establishes nothing about balance or variety; `693:66-69` demotes the player-encounter-frequency remark to
a HYPOTHESIS for later playtesting. `693:3-5` and `:71-73` carry the PROVISIONAL CANDIDATE TUNING status,
the LOGIC-VERIFIED/UNITY-NOT-VERIFIED split, the retained saturation finding and the outstanding
6,240-week obligation. The hygiene fix is comment-only and no assertion was weakened (see limits).

### DEMONSTRATED defects (all record-only, in 693)

**D1 — `693:77` cites lines that do not assert the old law.** It says the witness "asserts the F=4 law at
its lines 91, 96 and 143-158". `681-b5-closeness-floor-witness.ts:91` is
`assert.equal(row.closeness, RELATIONSHIP_BASELINE - RELATIONSHIP_FAILURE_DELTA)` — derived BY NAME, so at
F=5 it computes 45 and reads 45 and PASSES; `:96` is the same shape; `:145-158` are a sensitivity array and
`console.log`, containing no assertion. The lines that actually break are `:102`
(`assert.equal(currentTier(low(), week), 'Acquaintances')`, which reads `Strained` at 43), `:103`, `:104`,
`:113` and `:144` — exactly the set `684-T-report.md:141-145` already published. The conclusion ("will fail
if re-run") is TRUE; the record repeated the writer's loose citation (`685-W-report.md:142`) instead of the
test-author's correct one. Fix: replace with 102, 103, 104, 113, 144.

**D2 — `693:39` "One cause explains every movement" leaves two measured movements off the table.**
`682:21` → `689:21`: p13a `saveGzip9Bytes` 126359 → 126365 and `rootMarginalGzip9Bytes` 985 → 991.
`682:40` → `689:40`: seed-b `saveGzip9Bytes` 185492 → 185493 and `rootMarginalGzip9Bytes` 957 → 958 while
`relationshipsRootBytes` is identical at 25080. The table row "root grows by exactly one byte on seed 1 and
not at all on the others" invites the reading that seed-b's encoded row is unchanged; it is not. The cause
is trivial (same byte length, different content compresses differently) — state it, do not omit it under a
heading that says "fully attributed".

**D3 — `693:24-25` cites the wrong mechanism for the digest claim.**
`src/harness/roster-wall/historical-control.ts:23-26` is the V18 lift's empty-root literal plus the
`historicalHashState` signature; the discard lives at `:31-33` (which THROWS unless
`relationships.length === 0`) and `:46-47`. So that file does not "exclude the relationships key" — it
refuses any state holding an edge. It is also the wrong file for the natural-chain digests, which are
pinned at `tests/bridge-p14b5-relationships.test.ts:450-454`, and for
`tests/p13a-scientist-foundation.test.ts:31`, which hashes an explicit allowlist
`{talent, concepts, market, era, rngState}`. The conclusion (no archived digest moves) is TRUE and I
verified it three independent ways, including that the three RECEIVED digests in `692:2755/2769/2780`
(`4a4b2e78…`, `de6e49d8…`, `0b8e2184…`) are byte-identical to the same three in `669-b5-full-core-final.txt`
and in runs predating B.5 (`636`, `627`, `610`, `608`). Cite the real reasons.

### REFINE (not defects)

R1 — The PRE row 682 ran on `ddf58e87`; the POST row 689 ran on `63688a79` plus the candidate. 693 never
states that the two intervening commits touched no engine source. One line — `git diff --stat
ddf58e87..63688a79 -- src/ bridge/ generated/` is empty — converts the whole 682→689 comparison from
"assumed same engine" to "proven same engine". No rerun needed.
R2 — 693's evidence table row for 692 still reads "FILLED BELOW" and no section below fills it. Fill it
with 695 and keep 692 as the superseded pre-hygiene-fix row, with its cause named.
R3 — Runs 688–692 all carry `testedDiffSha256 702667b6…` (the pre-reword bytes); only 695 tests the final
bytes. Record both shas and pin the test file's FINAL sha256 `bc02cfcf…` (the published RED was
`cc8c3645…`). When 695 lands, confirm the per-file line `✓ tests/p14b5-t-failure-tuning.test.ts (12 tests)`,
not only the totals — that is what proves the requirement on the shipped bytes under the record-check runner.
R4 — Add the D5 paragraph from Q4 to 693, including the live forward consequence (an edge crossing the
CloseFriends floor downward can still move a settlement in a player campaign) and the corrected
"zero EXPOSED rows", not "zero receipts".
R5 — `684-T-report.md:189` calls the full-core run that failed hygiene "run 688"; it was run 692.
`684-T-report.md:148` gives the core include globs as `src/**/*.test.ts, tests/**/*.test.ts`; the actual
core include is `tests/**/*.test.ts` alone (`vitest.workspace.ts:20`). Neither changes a conclusion.
R6 — 693:44's "distance above the Strained ceiling 4 → 3" applies to three seeds; adoption is 8 → 8. Say so.

### What I could not check, and why

- **Run 695 — not available to me.** I never saw its `.txt`/`.json`; only `695-b5t-full-core-final.patch`
  exists on disk, and I used it solely to confirm the final tested diff is still two files and that
  patch line 68 carries the reworded comment. Every 695 statement above is a prediction from 669/692
  arithmetic, not a result. Send me the 695 totals and the tuning file's per-file line if you want the
  conditional removed.
- **Byte-exact equality of the two 466-line test bodies.** Both patches declare `@@ -0,0 +1,466 @@` and
  differ at the one comment line I located in each (`692…patch:68` vs `695…patch:68`). I have no shell, so
  I could not run `diff`; the "exactly `41c41`" claim rests on `684-T-report.md:197-199`. The changed line
  is a comment in both versions, which is what matters for "no executable line changed".
- **The 682 JSON's per-edge `peakTierFirstWeeks`.** I read the 689 JSON but derived edge-5's pre-state by
  monotonicity rather than reading the pre array; the two histograms make the conclusion forced.
- **Whether `ddf58e87..63688a79` touched engine source** (R1) — no shell.
- **Anything native, visual or playtested.** Nothing in this candidate is a UI or Unity artifact; no screen
  family, capture or input path was in scope, and none was reviewed. A green suite here is not usability
  and this checkpoint is not Owner acceptance.
- I executed nothing. Every number above was read from the committed/untracked artifacts named inline.

---

## Parent disposition (added by the parent; not the auditor's text)

ACCEPTED IN FULL. D1, D2, D3 and R1–R6 are applied to record 693. Two items the auditor could not check
are closed by the parent with a shell:

- **R1 / "whether `ddf58e87..63688a79` touched engine source" — CLOSED, PROVEN EMPTY.**
  `git diff --stat ddf58e87..63688a79 -- src/ bridge/ generated/ ui/ scripts/` returns nothing. The two
  intervening commits are records, evidence and the plan only (23 files, all under `docs/`). The 682 → 689
  comparison is therefore same-engine by proof, not by assumption.
- **D1 — CONFIRMED at source.** `681-b5-closeness-floor-witness.ts:102` is
  `assert.equal(currentTier(low(), week), 'Acquaintances')`, `:103` and `:104` pin the floor against
  `RELATIONSHIP_TIER_FLOOR.Acquaintances` and `STRAINED_CEILING + 1`, `:113` pins the running minimum and
  `:144` pins the hypothetical model against the measured floor. The auditor's set is right and record 693
  is corrected to it.

The 695 conditional is resolved in record 693's evidence table and in the addendum below it.

---

## 694-C addendum — conditional discharged (the auditor's own text, after run 695)

**(a) Verdict stands: QUALIFIED WITH RECORD-ONLY ITEMS.** Nothing in 695 changes it.

695 matches my predicted numbers exactly: 9 failed files / 341 passed (350), 24 failed / 3944 passed /
8 todo (3976), and `✓ tests/p14b5-t-failure-tuning.test.ts (12 tests)`. The nine per-file counts are the
669 and 692 inherited set unchanged (11+1+1+2+2+2+1+3+1 = 24), `tests/hygiene.test.ts` is back in the
passing 341, and `testedDiffSha256 4c138264…` differs from the 688–692 `702667b6…` exactly as the
comment-only reword requires. The requirement is now proven on the shipped bytes under the record-check
runner, so R3 is closed. `exitCode 1` is the 24 inherited failures, not this candidate — say that in the
record so no later reader reads a non-zero exit as a defect of the tuning.

**(b) Three things I would not put my name to as written.**

1. **I have not read the rewritten 693.** My verdict covers the artifacts I actually read and the ten items
   as I described them, not the new wording. Do not publish it as "auditor-verified text". If you want the
   rewritten record certified byte-for-byte, that is a second, much smaller pass.

2. **The two shell facts are yours, not mine.** I did not run `git diff --stat ddf58e87..63688a79` and I did
   not extract or diff the Expected/Received/Error sets. As reported they discharge R1 and strengthen the
   failure-cause identity beyond what I could reach read-only — but attribute them to the parent in the
   record, not to this review. I will not sign a result I did not observe.

3. **"Identical but for one character run" needs its qualifier in the text.** The
   `world-first-scenery-load-in-provenance` line quotes an ephemeral `mkdtemp` path
   (`studio-scenery-export-FePSaE` vs `…-hB9RM1`), which is expected per-run noise, not a moved failure.
   State it as such, or a future reader who re-derives the comparison will find a mismatch and mistrust the
   whole row.

**Unchanged and still open regardless of 695** (keep these visible in the published record): the four
standard seeds still never read Strained in 260 weeks at either value; the CloseFriends-floor channel
remains live in a player campaign even though it fires nowhere in these fixtures; the Q2 forward condition
binds B.6 (a root can now hold `-4` and `-5` `sharedFailure` rows on one edge, so nothing may render a
delta as a magnitude without an era signal); the 6,240-week endurance obligation is untouched.

This is an engineering assessment on TypeScript source and logs. It is not Owner acceptance, not a native
or visual result, and not authorization to merge or publish.

---

## Parent disposition on the addendum

All three accepted and applied to record 693. The two shell results (the empty
`git diff ddf58e87..63688a79` over engine paths, and the 669-vs-695 Expected/Received/Error set
comparison) are attributed to the PARENT throughout and never to this review. The `mkdtemp` difference
is published with its "expected per-run noise" qualifier. `exitCode 1` is named as the 24 inherited
failures. Record 693 is the parent's text: 694-C certifies the artifacts it read, not 693's wording.
