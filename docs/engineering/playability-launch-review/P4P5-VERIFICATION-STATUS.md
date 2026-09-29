# P4/P5 verification coverage

## CURRENT — UI repair U1 closed LOGIC VERIFIED (1335-K); UI gate down to 13 (10 PIL)

U1 (1335-A, six UI test files) is closed. Test-only fixes for four clusters:
- C5: the contract test read a Save16 oracle fixture with loadSave, which validates
  without migrating; it now uses the app's migrateToLive path;
- C2: the World Inspector sweep gets a 30 s budget, which ends its duplicate-element
  cascade;
- C1: the named slow leaves get 30 s budgets, and three mount helpers wait up to 10 s
  for the cold lazy Lot chunk;
- C6 needed no edit.
Staging and review:
- plan review 1335-B ACCEPT;
- staged 1335-C/C2 (the Authority file's M1 edit dropped, 1335-F);
- implementation review 1335-D REFINE (documentation, 1335-F2);
- dry run 1335-X: PIL only; applied 88eb90d9.
Recorded UI gate 1336: 13 failed / 2679 passed. None of the 24 U1 targets fails, and the
seven budgeted leaves ran 5.6-24.8 s, each above the old 5 s default. Remaining: 10 PIL
(environment) plus 3 recorded intermittents outside U1's edits:
- livingTurn.parity's first-mount wait (passes alone 3/3; mechanism inferred, 1336-F);
- 1124-A's NextEvent dashboard wait;
- StudioLotScreen:930 focus.
Review 1336-J REFINE, answered in 1336-F. Core unchanged by U1: 80 at 1333.

Next without Owner input: a small timing bundle (parity first-mount wait, D17's 60 s
budget, NextEvent "orients" margin). Everything else waits on the Owner decisions below.
Owner decisions open: D-1329-1 (recommended: charter a rival shelving rule), D-1323-1,
D-1312-1, D-1312-2, HIS-014.

## CURRENT — repair R3 closed LOGIC VERIFIED (1332-K); UI repair U1 in staging

1332-A attributed the ten UNRESOLVED core rows. Scratch bisect: HEAD test bytes over each
commit's src/generated. Ledger (4) and seating preference (3) move at 969fb459 with C8 and
wait on D-1329-1. The other three were repaired test-only (R3):
- promise-digest continuity: the week-208 settlement ranking moved at 969fb459; derived
  from the tick's own receipts, with promise-3/26 pinned;
- checkpoint :65: the expected shape now names the Save40 firstTakeSubjects root and the
  Save41 zero termination movement;
- relationships :546: the counterfactual strip reproduces the frozen digest; the stripped
  root is guarded by validateFirstTakeSubjects.
Reviews 1332-B/D REFINE, both resolved (1332-F/F2/F3); applied 59e2666a. Core gate 1333:
80 failed / 4601 passed, 3 gone. One new row: bridge-p14p3 D17, a load-dependent 60 s
timeout (it runs 97-100 s alone and passes). UI gate 1334: 26 failed on unchanged UI
source. Review 1333-J KEEP. Closure 1332-K: LOGIC VERIFIED · UNITY NOT VERIFIED; not GREEN.

IN PROGRESS: UI repair U1 (1335-A, review 1335-B ACCEPT), in test-author staging:
- C5: the contract test read a Save16 fixture with loadSave (validate only); it now uses
  the app's migrateToLive path;
- C2: a 27-mount World Inspector sweep outruns 5 s, and its still-running body causes the
  duplicate-element rows;
- C1: cold lazy-Lot mounts race findBy's 1000 ms default, and slow leaves exceed 5 s.

Lessons recorded this session (procedures):
- bisect with HEAD tests over old src;
- migrate fixtures before live readers;
- a timed-out Vitest body keeps running, so run the file alone and budget the slow leaf;
- name the baseline of every attribution count;
- re-check additive-schema digest pins by down-projection or counterfactual strip.

Owner decisions open: D-1329-1 (rival stall; recommended: charter a shelving rule),
D-1323-1, D-1312-1, D-1312-2, HIS-014.

## CURRENT — repair R2 closed LOGIC VERIFIED (1327-K); UNRESOLVED rows attributed; repair R3 next

Retained-defect repair R2 (1327-A, tests only, 7 files) is closed: C12 pins from the
recorded projection-56 producer 1328, C15 guard-and-strip reconstructions, C3 by
down-projecting the week-0 save to Save38 against the unchanged CANONICAL_INITIAL_SHA,
and K4 on the live validator (1327-F). Staged 1327-C/C2, dry run 1327-X, review 1327-D
ACCEPT, applied 350f9db5. Recorded core gate 1330: 82 failed / 4599 passed, 11 gone
against 1325, 0 new; L1/L2 now reach their masked cause (noCatalogue, week 607).
Recorded UI gate 1331: 34 failed / 2658 passed on unchanged UI source; 33 in the
1317/1322 sets, the Casting Review first leaf attributed to the C1 cold-mount timing
(it fails alone too). Reviews 1330-J KEEP, 1331-J REFINE applied. Type gates 0/0/0 at
089431d8. Closure 1327-K: LOGIC VERIFIED · UNITY NOT VERIFIED; not GREEN.

Attribution of the 10 UNRESOLVED core rows (scratch bisect, HEAD tests over old src):
- ledger family 12 (4) and seating preference (3) move at 969fb459 (P3 candidate
  order / director preference): week-208 winners reshuffle with frozen settlement
  sentences only (no D5 sentence); long natural runs, so they wait on D-1329-1 with C8.
- promise-digest-continuity :194 moves at 969fb459 on a one-tick genuine207 world:
  promise-3's subject declines on a tie, promise-26's stays with its current employer,
  so their receipts keep week 196. bridge-p14b2-checkpoint :65 and p14b5-relationships
  :546 miss the additive Save40 firstTakeSubjects root and Save41 zero termination
  movement (counterfactual strip reproduces the frozen digest exactly). These three are
  repair R3 (test-only), next.
C16b (P3 D07/D18) stays the frozen failed fixed-rival attempt of 1169-A/B (no rescue
authorized). Owner decisions open: D-1323-1, D-1312-1, D-1312-2, D-1329-1, HIS-014.

## CURRENT — repair R1 closed LOGIC VERIFIED (1324-K); C8 cause measured (D-1329-1); repair R2 in review

Retained-defect repair R1 (1324-A, tests only, 7 files) is closed: staged 1324-C, dry run
1324-X, review 1324-D ACCEPT, applied 57b7bee9. Recorded core gate 1325: 93 failed / 4588
passed, all retained from 1316 (85 same, 8 changed primary with recorded causes), 58 gone
(the 56 C6/C7/C20 targets plus two c2a-m2 leaves with the same v13TwinOf cause), 0 new.
Recorded UI gate 1326: 32 failed / 2660 passed on UI source byte-identical to 1322; every
identity is in the 1317 or 1322 set (C1 timing). Review 1325-J KEEP; type gates pass at
6458955e. Closure 1324-K: LOGIC VERIFIED · UNITY NOT VERIFIED; not GREEN (93 core / 32 UI
open). The p14c3-save-v38 :93 leaf stays retained by design (1324-A rule 4).

C8 (1329-A): 21 of its 42 rows search p13a-core-causal-01 for a satisfied rival promise.
Bisect puts the move at 969fb459 (the accepted P3 candidate order): r01 no longer wins the
week-208 cases whose cast made a held screenplay viable. Underneath, a pre-existing rival
stall: two ready screenplays with no viable package (hollywoodPolicy.ts:67) fill the ready
inventory (hollywoodTick.ts:254), so a rival neither films nor commissions; on this seed all
four rivals stop filming by week 140. No test-only repair; Owner decision D-1329-1 (keep the
law and re-derive fixtures as new fixtures, or charter a shelving rule).

IN PROGRESS: repair R2 (1327-A): C15 (7), C3 (6; the Save38 down-projection of the week-0
save reproduces CANONICAL_INITIAL_SHA exactly), C12 (2; pins from the staged 1328
projection-56 producer after a recorded run). Review 1327-B running.

Owner decisions open: D-1323-1 (P15A.1 formula), D-1312-1, D-1312-2, D-1329-1 (rival
unviable screenplays), Mentor/Rivals labels (HIS-014).

## CURRENT — P15A.1 stopped for Owner decision D-1323-1; retained-defect repair R1 IN PROGRESS

Save42 casting drivers are closed (1319-K; see the block below). The P15A.1 charter (1323-A,
Wave 0 reconnaissance plus a Wave 1 pure-law proposal) was reviewed REFINE (1323-B) and
adopted with amendments (1323-F). The review established that no P15 Owner-ruling
amendment exists: CODEX-P13-P15-OWNER-RULINGS.md §4.3 still lists "the exact shared-market
formula" as an open Owner decision, RECONCILIATION-02 labels itself research not Owner
authority and does not close that line, and the rulings' governance rule (§8) keeps the
open decision until a newer explicit ruling. P15A.1 therefore stops before any RED or code.
P15A.2/P15B/P16 depend on P15A.1 or their own open §4.3 decisions; P18 waits on P16/P17
producers (P18-HEADLESS-CHARTER). The P15 presentation choices D2/D3/D4a were answered on
2026-09-27 (1122-A) and need no further decision.

Owner decisions open (with options in the cited records):
- D-1323-1 exact P15A.1 shared-market formula (1323-F: recommended genre + four-week window
  1.00/0.55/0.55/0.20, saturation stock 0.20 halving every 13 weeks to week 26, one unit per
  release, per-studio window cap, factor 1 − 0.25(1 − e^(−P/2)); or other strengths, window
  only, or delegate to tuning with a Wave 4 playtest).
- D-1312-1 conflict-record source (Enemies/Nemeses), D-1312-2 romance ending rule (romance
  formation waits with it) — 1312-A/1312-F.
- Mentor/Rivals evidence-label definitions (companion §5.3, register HIS-014).

IN PROGRESS: retained-defect repair R1 (1324-A): clusters C6 (v13TwinOf, 25), C7
(firstTakeSubjects fixtures, 23), C20 (migration purity, 9); test-author stages 1324-C, then
parent dry run, review, application, recorded gates. Two specialists, parent writer, one
heavy process; Unity/native deferred.

## CURRENT — Save42 casting drivers closed LOGIC VERIFIED (1319-K); P15A.1 charter next

Production 1b675f75 (castingCompetitionLost/repeatedCompetition, the Inseparable expiry
note, Save42) is closed with its test sweep: RED 1318 (21/13/1), GREEN 1319 (34/1),
contract check 1319b, implementation review 1319-J KEEP; Save42 sweep 1320 (measured
1320-M/M2, 131 files, 500 rows, 1320-D ACCEPT, applied 25501835). Recorded core gate
1321: 151 failed / 4530 passed, exactly 1316's identities (0 new, 0 gone). Recorded UI
gate 1322: 25 failed / 2667 passed; one intermittent focus leaf that predates Save42.
1321-J KEEP; type gates pass at HEAD. Closure 1319-K: LOGIC VERIFIED · UNITY NOT
VERIFIED; not GREEN (151 core / 25 UI retained failures stay open with their causes).

P14B relationship scope left: D-1312-1 (conflict record) and D-1312-2 (romance ending,
romance formation waits with it) for the Owner; Mentor/Rivals labels need authored
definitions (HIS-014); shared awards wait on P08; compaction waits on PERF-010.
Next: the P15A.1 charter (launch-time market pressure over one actual release batch,
RECONCILIATION-02 §7.1-7.3 at c5b52b4d; P15A1-RELEASE-SEAM-NOTES/REVIEW and
P15A1-ORDERING-INVENTORY): batch identity and order, the chronology change and its
controls, reach metric, clamps, coefficients (class C), storage, cold start, previews.
P15A.2 Owner choices D2/D3/D4a do not block it. Two specialists, parent writer, one
heavy process; Unity/native deferred.

## CURRENT — Save42 casting drivers landed (1b675f75); GREEN 34/1; review KEEP; Save42 pin sweep IN PROGRESS

R2/R3 is closed (1311-K, LOGIC VERIFIED, not GREEN; see the block below). The casting RED
(1315-stage5) was applied and recorded on unchanged production: 21 failed, 13 passed, 1
skipped (1318-R). Two RED files that import bridge/*.ts were renamed to tests/bridge-p14b9-*
(10790fa6, content unchanged) so the root type gate stays valid. Production 1b675f75 lands
the reviewed draft: castingCompetitionLost/repeatedCompetition drivers minted once per pair
per admitted player greenlight, the Inseparable contract-expiry note, Save42
(RelationshipEdge.sharedCompetitions; 42->41 refuses to discard a competition). GREEN 1319:
34 passed, 1 skipped (the hollywood === null clause, review-only). Contract --check passes
(projection 56 unchanged). 1319-J: KEEP, no required changes; the queue path is traced.

IN PROGRESS: the Save42 test pin sweep. Measured at the production (1320-M, 1320-M2): 855
core failures (705 new against 1316: 335 live-version literals, 333 live V41 validator
selections, 15 future-version sentinels, 12 hand-built edges without sharedCompetitions,
others) and 12 new UI rows. Plan 1320-A (classes S1-S10); test-author stages 1320-C. Then
parent scratch dry runs, 1320-D review, 1320-E apply, recorded broad gates, attribution
against 1316/1317, 1319-K closure. Open: D-1312-1, D-1312-2; retained 1316/1317 clusters.

## CURRENT — R2/R3 closed LOGIC VERIFIED (1311-K); sweep 1309 landed; casting RED next

The 1309 pin sweep converged at r5 (146 test files, 671 rows; 1309-D2 ACCEPT) and landed
as cd79e85b with the 1308 neighbor change. Recorded broad core gate 1316 on cd79e85b: 151
failed, 4496 passed, guards exact, collection equal to the 417-file allowlist; no failing
identity is new against 1302 (347 of its 498 are gone; 1316-I). Recorded UI gate 1317: 33
failed, 2659 passed; six rows new against 1303 fail the same way on the 1303 source today
(A/B), and runway and mount-time probes match across sources, so they sit with the C1
test time-budget family (1317-I). 1316-J (REFINE, two wording fixes applied) reviewed both;
type gates pass at HEAD; 1311-K closes R2/R3/Save41/projection 56 as LOGIC VERIFIED ·
UNITY NOT VERIFIED. Not GREEN: 151 core and 33 UI
failures stay open with their 1302/1303 causes (C1, C6, C7, C8, C15-C17, C20, UNRESOLVED,
inherited, C12 generator pins). Disk: the parent removed its own scratch copies (1309-X5).

Next, per 1315-F: apply the casting RED (1315-stage5, five files) to tests/, recorded RED
on unchanged production (expect 21 failed, 13 passed, 1 skipped), land the reviewed Save42
draft (1315-X-production-draft.patch, byte-verified against the dry-run tree), GREEN,
implementation review, then the Save42 pin sweep (about 136 toBe(41), 196 validateSaveV41
calls in 68 files, 47 convertV41ToV40 uses, 20 "1 through 41"). Owner decisions open:
D-1312-1, D-1312-2. Two specialists, parent writer, one heavy process; Unity/native deferred.

## CURRENT — sweep review REFINE applied as 1309-F; Save41 casting inputs minted; casting RED staging

1311-J (REFINE) found no code defect in R2/R3/Save41/projection 56; the increment stays
IN PROGRESS until the 1309 sweep is applied and one broad core and UI rerun is attributed.
The staged sweep (1309-C, 115 files) type-checks root-clean in scratch (1309-X) with three
Bridge errors. 1309-D (REFINE) confirmed items 1-7, disproved item 8's swap (no wire-valid
draft reaches "not offered in this slice"), and found about 23 more files that feed live
saves to validateSaveV40. 1309-F adopts all changes and rules on item 8 (retitled to P3
law, measured ok:true), item 8b (two UNRESOLVED 1302 rows with the same stale directing
refusal, measured text), item 9 (rival-authoring expectation computed in-test from
authorRivalPromise, no literals) and item 10. IN PROGRESS: 1309-C2 revision (test-author).

Casting drivers: 1313-B (REFINE) reviewed 1313-A; 1313-F adopts it with the seam inside
applyGreenlight, one competition per pair per admitted production (ref = production id),
re-greenlight after cancel counts again, and the expiry note built from edges. 1314-P
measured a public-action route through a real casting session to release. Producer 1314
(r2 after 1314-B) ran once on acb2d472 under the bounded recorder (exit 0, all guards
exact); tests/fixtures/p14/genuine-v41-pre-casting-drivers holds the acknowledged (week 10)
and released (week 19) inputs; closure 1314-K. IN PROGRESS: 1315-C RED staging
(test-author). Owner decisions open: D-1312-1 (conflict record), D-1312-2 (romance end).

Next: parent scratch dry run of 1309-C2, 1309-D2 review, 1309-E apply with the 1308
neighbor (applies over the sweep, offset 3), broad core (417-file allowlist, collection
proof re-checked at HEAD: 423 tracked, 6 excluded) and UI gates, attribution, 1311-K;
then the 1315 RED recorded run, Save42 production, GREEN, Save42 pin sweep. Two
specialists, parent writer, one heavy process; Unity/native/Owner deferred.

## CURRENT — R2/R3 production landed (Save41, projection 56); GREEN 46/46; sweep 1309 next

Production commit f3f8c209 lands R2 (release refused during the founding draft and for
a person seated on an active production, engine and Bridge, codes `foundingDraft` and
`seatedOnActiveProduction`; the release copy states the charge's two branches), R3 (a
rival releases unretained non-Scientist surplus under the player's termination law, new
rival money kind `termination`, same-pass free agency, R1 floor on its re-hire) and
Save41 (live validator reconciles rival termination per period; frozen readers keep the
old law; 41→40 refuses a real release). Projection 56 registers genuine outgoing55
(1307) as a prior. RED 1310 on unchanged production failed 32 exactly as predicted;
GREEN 1311 passed 46 with 2 honest skips; contract check 1311b passes. The measured
scientist deficit probe (1308-Q) does not witness under-hiring; no correction follows.
IN PROGRESS: 1311-J implementation review; 1309 pin sweep (1309-A plan, test-author
staging) including 15 test-side type errors (1311-T), then 1309-D review, 1309-E apply
with the p14b6 neighbor change, one broad core and UI rerun attributed against
1302-I/1303-I. Open: premise clusters C6/C7/C8/C15/C16/C17/C20, rival material policy,
R3 skipped leaves (promise, cash). Two specialists, parent writer, one heavy process.

## CURRENT — 1302/1303 attributed; R2+R3 production increment next

Broad core gate 1302 on 993e6b01: 411 files, 96 failed files, 498 failed, 4102
passed, 11 todo, exact collection proof. UI gate 1303 on 42f216e8: 10 failed
files, 31 failed, 2661 passed, 5 skipped. 1302-I/J (KEEP) and 1303-I attribute
every case by identity; parent 1302-K closes 1302. No production defect is
established. Most failures are stale test infrastructure from the Save39/40 and
projection-55 bumps that 1301 missed: tests/helpers saveVersion 38 literals,
validateSaveV38 selection on live saves, namespaced live pins. The two flagged
rival-authoring failures (trust-chooser :620, cast-class-policy :452) trace to
the P3 and opportunity candidate widening (969fb459, ef38cf9a) landing without a
neighbor sweep; their test update becomes the RED witness. 1303-J review runs.

Genuine outgoing Save40 inputs are minted (1306/1306b, 1306-K; the r2 premise
failure is preserved in 1306-C). R2 (1304-A..D) and R3 (1305-A..D) are reviewed.
The parent lands them as one production increment with Save41 and projection 56,
then one combined 41/56 pin sweep (1301 rows, 1302-I class a, the 1305-D gap,
the widened rival-authoring sequence), then one broad rerun attributed against
1302-I/1303-I. Scientist under-hiring stays a hypothesis until its witness runs.
Deviation: three specialists ran briefly at once while resuming 1306-B; no
writes overlapped. IN PROGRESS: R2, R3, rival material policy. Two specialists,
parent live writer, one heavy process; Unity/native/Owner deferred.

## CURRENT — 1301 live-pin maintenance applied; broad gates 1302/1303 next

Parent applied the reviewed 1301 final patch (1301-C/C2, independent 1301-D KEEP,
parent 1301-E): 74 test files, 188 lines, digit-only changes of stale live
literals (save 40, projection 55, first unknown save version 41) with historical
readers, provenance, downgrade targets and receipts kept. Retained for broad-run
attribution: the scientist-runtime validator selection (test defect), the C#
generator hash pin and unpatterned pin forms. Next, no commit until both posts of
a gate close: 1302 collection proof pre, bounded pre (advanceCap -1 label), the
411-path core command, bounded post, collection proof post; then 1303 UI.
IN PROGRESS: R2 busy-set release refusal (a Core requirement never implemented,
tests/p14a1-firing.test.ts:59) is drafted for after the baseline; R3 rival release
and rival material policy remain open. Same two specialists, parent live writer,
one heavy process; Unity/native/Owner deferred.

## CURRENT — 1300 Save30 compatibility qualified; 1301 maintenance staging

Gate 1300 on published 52c95a3f: 36 passed (36), zero filtered, child0, fixed
source, 79.96s. Bounded and 1299-C companion pre/post closed (28 manual rows,
nine decoded generated inputs). 1299-I attribution, independent 1299-J KEEP and
parent 1299-K close it. Only the corrected test differs from the 1294b compiler
source over the consumed roots; no compiler rerun. Classless historical promises
keep original receipts through strict29, 29→30 and live migration. Not qualified:
a 40→39 loss discriminator, modern material behavior, deferred Bridge-waiver leaves.

1301-A/B/F adopt a cause-scoped live-pin maintenance increment (three-class
inventory: 56 direct, 26 projection-form, 118 derived saveVersion candidates in
86 files) before one broad core gate 1302 (411 files, six 1296-A exclusions,
pre/post collection proof) and UI gate 1303 (204 files). Test-author stages
1301-C; contract-auditor reviews D; parent applies E. IN PROGRESS: rival material
policy and R3 rival early release remain open. Same two specialists, parent live
writer, one heavy process; Unity/native/Owner deferred.

## CURRENT — 1299 Save30 correction applied; gate1300 next

Parent applied reviewed 1299-C/D (KEEP) on published 2bb5326e: one hunk in
tests/p14b4-save-v30-compatibility.test.ts, title literal37→40 and toBe(38)→
toBe(40), 25,226 bytes / f7f97c67. 1299-E records the rehashed manifest, inverse
proof and companion checks the read-only reviewer could not run. Next, with no
commit until both posts close: bounded pre cap0, companion 1299-C pre
(P14_SAVE30_EXPECTED_HEAD = this published HEAD, P14_SAVE30_GUARD_SHA256 =
97d5695b...), the exact 36-case command, bounded post, companion post. The 1297
companion stays frozen to 1298. IN PROGRESS: a source sweep found about 58
direct live-constant pins (saveVersion 38/39, projection 53/54 against live
40/55) in about 40 other tests; a cause-scoped reviewed maintenance increment
precedes one broad core(411 files, six 1296-A exclusions)/UI(204) regression.
Rival material policy and R3 rival early release remain open. Same two
specialists, parent live writer, one heavy process; Unity/native/Owner deferred.

## CURRENT — 1298 legacy neighbors closed; 1299 Save30 correction adopted

Claude parent took over after Codex exhausted its allowance. 1297-K records the
ownership check: Codex pid71871 idle, no child process or open repository file;
recheck ps before any recorded run. 1298 PASS on ea46f8b8: two files, 13 passed,
one filtered winning-freeze leaf, child0, fixed source, bounded and companion
pre/post closed. 1297-I attribution and independent 1297-J KEEP; parent 1297-K
rejoined every record and the 1294b inventory (1139 source/555 excluded). The
pasted Codex TypeError was a parser defect, not a test result.

1299-A/B/F adopt one hunk in the Save30 compatibility test: title literal37→40 and
toBe(38)→toBe(40). Historical readers, receipts and frozen fixtures keep their
original versions. Next: test-author 1299-C stage plus an exclusive gate1300
companion, contract-auditor 1299-D, parent E and publication, then 1300 (36
selected/0 filtered, cap0). No compiler for two literals (1299-F). IN PROGRESS:
broader core/Bridge/UI and rival material policy remain open. Same two specialists,
parent live writer, one heavy process; 1296 access boundaries stand. Unity/native/
Owner deferred.

## CURRENT — Q25 published; legacy-neighbor gate released

Q25 I/J/K closure is published39082d35a537c26d9d8352b1c5076098f15fdf99.
1297-C/D/E companion is reviewed/adopted for the next1298 gate only: two exact
existing files, expected13 selected/one filtered, zero advances by source-route
accounting. Publish this checkpoint, then bounded pre0 → companion pre → exact
manifest command → actual bounded post exit → companion post. Bind the companion
to this published HEAD and its reviewed4a7e9467 hash. All17 manual files/three
explicit generated inputs stay exact. Source inventory must equal1294b before
attributing that compiler; no extra types run for documentation alone.

1299 source-only planning found a stale live-version38 assertion in the existing
Save30 compatibility test (actual live40). A narrow reviewed correction and full
historical compatibility selection are next; historical reader expectations stay
literal. No1299 edit or runtime yet. Broader core/Bridge/UI and rival material
policy remain open. Same two specialists, parent live writer, one heavy process;
corrected access boundaries remain. Continue program; Unity/native/Owner deferred.

## CURRENT — Post capacity qualified; bounded legacy neighbors next

Executed/published a30f86f2fead8b3f7d9e6b9e3e9cfd5bd10ce323 matched GitHub.
1294b root types PASS35.601s;1295 Q25 PASS1/zero filtered22.078s recorder,
17.113s leaf. Original1294 compiler FAIL39.704s and reviewed local-const G/H
correction remain preserved.1293-I/J/K close two ordinary312→314 advances,
five public actions/two identical pure P4crime quotes. Both held films take313
and enter post at returned314 (wrap/events stamped313). Cancellation frees post0;
FRAGILE becomes RA while all other facilities stay free. Full111 old/two new
player takes,69 promise authorities, six relationship changes and studio trust
fallback remain joined. Ordinary unrelated lifecycle/industry changes are retained.
Twenty-five core leaves passed across seventeen separate selections, not a
combined/full suite. No player release or completion of the locked finishing crew.

Both successful gates used the corrected bounded helpers:1139 automatic source
files,555 excluded payload paths,295 explicit manual pins/nine decoded inputs.
Recorded source/index/stage and all in-scope pins remained exact.1296-B's historical
Owner-fixture hash error and six runtime collection exclusions/holds still stand;
never rerun the old broad inventory guards.

Publish closure plus reviewed1297 companion, then1298 legacy neighbors(cap0):
two fixed files,13 selected/one filtered. Use bounded pre, companion pre, exact
recorder command, actual bounded post exit, companion post. Cap0 is source-route
accounting, not a new measured counter. Attribute1294b compiler only after proving
unchanged code. Parent owns live integration/production and one heavy lane; same
two retained specialists own test/review separately. P15 ordering inventory remains
source preparation. Continue the authorized program; Unity/native/Owner deferred.

Evidence cutoff: 2026-09-28, after Q25 / 1295. This is a navigation summary of recorded results, not a new contract, execution budget or full-suite pass. Save40, projection55 and evaluator7 are implemented. The outstanding verification below keeps the wider P14 task open.

The twenty-five core leaves Q01–Q25 passed across **seventeen separate selections**: 1234b (four), 1238 (two), 1253 (four), 1256 (one), 1259 (one), 1262 (two), 1265b (one), 1268 (one), 1271 (one), 1274 (one), 1277 (one), 1280 (one), 1283 (one), 1286 (one), 1289 (one), 1292 (one), and1295 (one). There was no same-run twenty-five-leaf qualification. Three new Bridge leaves and one new UI leaf passed separately. Prior compiler/runtime failures and the Bridge synchronous timeout overrun remain in their original records.

| Area | Actual qualified evidence | Remaining limit or next task |
|---|---|---|
| Predicate and save authority | Tagged singular classes/targets, retained links, strict current validation and legacy compatibility controls in 1234b/1238/1253. | 1298 (1297-I/J/K) separately qualifies13 legacy neighbors: D3 age/class matching and B3 evaluator1 root/receipt/digest preservation plus a fresh generic attachment; the winning-freeze leaf stays filtered. 1300 (1299-I/J/K) qualifies the corrected Save30 file: 36/36, zero filtered, classless historical promises keep original receipts through strict29, 29→30 and live migration. Neither is a full-suite pass. |
| Material take facts | Actual managed player and rival subjects, ordered post-cutover suffix, owner-local material joins, cancellation and release retention. See 1239 and 1249 closures. | Q15 /1265b adds actual stock c00/comedy/null take61/event24 and full retention through returned65/film-stamp64, all20 old receipts/eight new mixed facts. Original1265 stamp-oracle FAIL remains; no new material obligation was created. |
| Exclusive physical deadline and slack | Q11 / 1256: eight real drafting, Review, Ready, rewriting and casting snapshots; due at first possible take is IMPOSSIBLE, seven weeks of slack FRAGILE, eight RA. | These states had spare resources. They do not isolate congestion or the reservation exemption. |
| Isolated facts-only downgrade refusal | Q11 / 1256 reached a genuine new rival fact with no promises, admitted current40 and refused40→39 for recorded subject authority. | The earlier 1253 refusal combined material tags and facts; keep the two claims distinct. |
| Active writing and permanent screenplay credit | Q13 /1262: real Actor commission at45 moves the other Ready target from fresh45/take50 to fresh46/take51, with exact physical/slack outcomes; own screenplay credit independently refuses cast admission. Five pure quotes. | Actual state remains45; the admission query46 does not observe drafting completion. |
| Resource congestion and own reservation | Q14 /1262: second real commission fills both development slots. Identical Ready request becomes FRAGILE for capacity; identical drafting target stays RA with only its own due46 slot exempted and unrelated hold retained. | Q20 /1280 independently qualifies casting-session exemption under actual congestion: three public actions/four pure P5 queries/hard0advances; unrelated Ready target becomes capacity-FRAGILE, own audition target stays RA while unrelated same-due draft remains held. No actual46 arrival or completion occurred; Q22 /1286 now qualifies existing soundstage first cause: two identical P4crime quotes around one public cancellation, zero ticks, full11→7claims and unchanged five crime candidates. FRAGILE becomes RA after stage07/scenery0 release; retained technology/lifecycle/111takes/69roots stay exact. Q24 /1292 separately qualifies isolated scenery: four public strike/commission actions and two identical Ready crime quotes at actual45, zero ticks. RA becomes exact scenery-capacity FRAGILE while other facilities stay free; full set/cash/ledger/claim bodies preserved. Q25 /1295 now qualifies post capacity: two actual312→314 advances/five public actions/two pure P4crime quotes; two held films take313 and occupy post0/1, then post-take cancellation frees0 and changes FRAGILE to RA. Full claims11→11→5→4, other facilities free,111 old/two new takes and69 authorities retained. Six relationship deltas and public studio trust fallback are observed.1296-B retains the historical guard-access error;1295 uses the corrected bounded policy. |
| Reservation membership and committed witness | Complete person-or-issuer union, self and scope controls; Q10 / 1253 observed one actual nonempty successful committed-seat witness. | Q19 /1277 qualifies two genuine P1 roots sharing one production: public waivers move the common take/release and same-person fresh clock, isolate slack7/8, then create individually feasible windows with no common take; unchanged idle control becomes witness-FRAGILE. Eight quotes/six actions/eight52→60 advances. No actual later take/release, retirement readmission or general solver claim. |
| Mixed stored version and receipt version | Q12 / 1259: actual Director root6/RA6 remained unchanged when another same-player material attachment scoped a quote into7; first actual freeze52 RA7 was committed on root6, with real52→156 employment and exact price/payment. | Freeze and ranking calls had identical receipt values. This run does not distinguish unequal alternative receipts. Later material offer was declined, not a P4 recruitment win. |
| Legacy quote preservation | Full1,226-byte legacy baseline remains literal through 1256; Q12 separately retains the actual attached Director6 receipt. | Q12 did not rerun the complete legacy baseline. |
| Public waiver | Actual accepted genre/class/project narrowing, three sequential successors, forward windows, remaining obligations, trust and current link negatives in Q09 / 1253. | Natural VOIDED evidence is still absent from its prior bounded search; do not extend that search or invent a witness. |
| Wrong-seat and cancellation outcomes | Real player wrong-seat commit, pre-take cancellation and post-take earned evidence retention in 1238; strict and idempotent controls in 1253. | Q23 /1289 now qualifies refused and queued player requests: eight45→53 advances, six attempts (five accepted/one expected duplicate-seat refusal), one pure quote. Both refused/queued52 preserve OPEN; ordinary53 delivery/dequeue starts the named film and records one wrong-lead BROKEN outcome with beneficiary in support. No player take/release; rival wrong-seat callback remains open. |
| Rival material policy and staffing | Implemented bounded fallback and subject-aware staffing; actual rival subject appends are qualified. | Actual material candidate order, accepted policy offer and matching staffing remain open. Failed1169 is not a positive witness and authorizes no rescue/retry. [Read-only scope notes](P4P5-RIVAL-POLICY-RECONNAISSANCE.md) record constraints without a new runtime route. |
| Retirement and cross-owner availability | Q16 /1268: actual retired Actors now primary Director/Writer retain requested-Actor refusal, while current-profession admission is allowed; active Actor control RA. Three pure quotes, all59 old roots/85 takes retained; two unbound same-person roots excluded. | Q17 /1271 separately qualifies six pure cross-owner P5 queries: rival Actor company floor52/take57 versus Writer draft due46/take51, exact exclusive and seven/eight-week slack boundaries. Zero actions/advances; contracts unchanged. Q18 /1274 adds current Director-only retirement refusal and actual held Actor finishing work: five pure quotes, two accepted existing-task actions, one312→313 take/c00 drama/null. All111 old receipts/69 roots and both finishing records retained; no release/completed retirement. Q21 /1283 now qualifies delayed-release readmission:59 actual45→104 advances/five accepted mutations/four pure quotes; actual104 announcement/effective156 and a public waiver delay common release109→148, changing identical P5 RA to timing-FRAGILE despite27 weeks of uncapped slack and spare resources. Query147 allowed/query148 refused; no later arrival or player take. Historical V37 provenance/parity FAIL remains. |
| Bridge and UI disclosure | New Bridge3/3 and isolated UI1/1 passed; own targets and rival UNKNOWN privacy, current-save replay/duplicates and genuine previous54 migration covered. | One Bridge leaf took228.867s despite a60s declaration; no timeout enforcement/performance claim. No disk coordinator, native consumer or full-UI qualification follows. |

Primary closure records are in [the evidence directory](evidence/p14b4-20260919/): 1234-A/B, 1239-A/B/C, 1236-J/K/L, 1249-I/J/K, 1254-I/J/K, 1257-I/J/K 1260-I/J/K, 1263-I/J/K 1266-I/J/K, 1269-I/J/K 1272-I/J/K 1275-I/J/K 1278-I/J/K 1281-I/J/K 1284-I/J/K 1287-I/J/K 1290-I/J/K, 1293-I/J/K, 1297-I/J/K and1299-I/J/K. The frozen detailed requirements remain [1226-A](evidence/p14b4-20260919/1226-A-p4p5-initial-test-requirements.md); their original candidate wording is historical, not a statement that current versions are still only proposed.

Current next work is adopted1301: staged cause-scoped live-pin maintenance (1301-C),
independent 1301-D, parent application and publication, then broad gates1302 core
(411 files, six 1296-A exclusions) and1303 UI under bounded pre/post guards.
Historical readers, receipts and frozen inputs keep their original versions. Actual rival material policy,
staffing and callback coverage and broader core/Bridge/UI remain open. Same two
specialists, parent live writer, one heavy process. Continue the program with the
recorded P15/P17 choices and P18 limits; Unity/native and Owner campaigns deferred.
