# 678-C — independent review of the week-260 measurement (contract-auditor)

Scope: one bounded READ-ONLY pass over `676-b5-week260-probe.ts`, `676-T-report.md`,
`677-week260-measurement.txt/.json/.patch`, `676-P-reachability-analysis.md` and the draft record
`679-p14b5-week260-measurement.md`, against source `ddf58e87`. I ran nothing. Every value below is
either read from the committed artifacts or derived on paper from the source lines cited. The B.5
landing, its RED, its sweep and its regression evidence were not re-audited (brief instruction).

## VERDICT — QUALIFIED WITH RECORD-ONLY ITEMS

The RUN is sound. `677` is a fixed-source, exit-0 execution of the handed-back harness; every
figure I recomputed reconciles; the probe calls the real owner module and re-implements no band or
drift arithmetic. Nothing requires a rerun of the probe or of the B.5 cycle.

The INTERPRETATION is not yet publishable. Two load-bearing numbers in `676-P` and the draft `679`
are demonstrably wrong (D1, D2). Both are text corrections against already-verified source. The
Owner-facing CONCLUSION — no B.5-minted edge can read Strained — survives every attack I could
construct, so this is a record amendment, not a refutation. **Amend D1–D5 before the packet goes to
the Owner.**

## DEMONSTRATED defects

**D1 (blocking) — the proven floor is 45, not 46; the margin is one point, not two.**
`676-P-reachability-analysis.md:74-77` ("**46 is the floor**, two points above the Strained ceiling
of 44") and `679:93,:101-103,:134` are wrong. The note's own five facts, applied one step further,
reach 45. Lawful sequence, all low proximity, one pending penalty at a time (facts 4–5 respected):

1. Player greenlights P seating a,b as director–support. First take w13 → `newEdge`
   (`relationships.ts:185-196`) mints `50 + RELATIONSHIP_PROXIMITY_LOW` = **52**, `sharedProductions`=1.
2. Player holds P at releaseReady (`releaseAuthority.ts:5-6,:12-14`). a,b stay busy, so nothing else
   can touch this edge — the dormancy is guaranteed by the same fact 5 the note relies on.
3. w326 commit and flop. `writeEdge` materializes drift first (`:170`): dormant 313, span
   `min(261,260)=260`, `52 + trunc(-2·260/260)` = **50**; then `−4` → **46**.
4. P has now left `activeProductions` (`tick.ts:158`); a,b are free. Player greenlights P2 with the
   same pair, same low proximity, take w330 (inside the 52-week grace window, no drift):
   `46 + 2` = 48, then `accelerator = min(sharedProductions−1, 3) = min(2−1,3) = 1`
   (`relationships.ts:283-285`) → **49**.
5. P2 flops w342 → **45**.

45 is a fixed point: production 3 nets 0 (`+2+2−4`), production 4 onward nets `+1`, and any further
full drift returns exactly to 50 (integer identity `v + trunc((50−v)·260/260) = 50`). `bandOf(45)`
returns `Acquaintances` (`:51-53`, floor 45), so the conclusion holds — **with the floor sitting
exactly ON the band boundary.** The note missed that a drifted flop re-enters the ordinary chain one
point lower, where the second production's accelerator is still 1.

Consequence for the Owner sentence at `676-P:84-86`: the sensitivity is not "4 to 7". With
`RELATIONSHIP_FAILURE_DELTA = 5` the trajectory is 52 → drift 50 → 45 → take 48 → **43 = Strained**.
The band opens at **5**, one step away. (Even under the note's own `50 − F` model the minimum is 6,
not 7, since 44 is inside the Strained band.) This is the finding the Owner actually needs.

**D2 (blocking) — "the full drift horizon sits inside the window" is false.**
`676-b5-week260-probe.ts:33-35` ("260 … is the drift return horizon, so the whole §5.5 drift window
sits inside the run") and `679:22-23`. Full drift needs `RELATIONSHIP_DRIFT_GRACE_WEEKS +
RELATIONSHIP_DRIFT_RETURN_WEEKS` = 312 dormant weeks (`relationships.ts:82-83,:116-118`) — `676-P:70`
states 312 correctly, so the two documents contradict each other. The first edge mints at w8/w9
(`677:20,:39,:58,:77`), so maximum reachable dormancy at w260 is 252 → `span = 200` → **77% of the
return, never 100%**. The measured effect confirms it: the deepest drift possible is
`100 + trunc(−50·200/260)` = 62, and p13a's drifted histogram bottoms at Friends=1 / CloseFriends=12
(`677:11`). The run exercises a partial drift only; no campaign in it completed one.

**D3 — "every picture a rival ever makes seats the IDENTICAL quartet" is contradicted by this run.**
`676-P:90-95` and `679:106-107`. If true there would be exactly 24 edges forever; the run reads 27,
27, 36, 24 (`677:6,:25,:44,:63`), and `679` finding 4 (`:111-113`) explains the excess by roster
churn — the same record asserts both. Source: `hollywoodTick.ts:129-138` replaces an unavailable
role-holder with any available person of that role and mints a new one at `:137-138`, so "the same
three actors" is not a property of the payroll; `:167-170` puts eligible PROMISED people into the
triple ahead of the historical first-three rule, and `:182` takes `candidate.cast` from the package
chooser. The weaker claim — heavy repetition drives most edges to the clamp — is fully supported
(Inseparable 11/24/27/24; `maxSharedProductionsOnOneEdge` 17–28) and should be the published form.

**D4 — citation errors in the load-bearing facts.**
(a) `676-P:42-43` and `679:83-84`: "`hollywoodTick.ts:160` `decide()` returns early while
`b.productions.length !== 0`". The line is **:161**, and it is `break` out of the ready-project loop
opened at `:160`; `decide()` continues to the commissioning block at `:197+`. The substance (one
production at a time per rival) is correct. (b) `676-P:36-38` cites
"`employment.ts:125-127` `activeProductionCompanyTalentIds(state.studio.activeProductions)`". The
function at `employment.ts:125` takes `state`; the array-taking function is
`productionCompanyTalentIds` (`productionPeople.ts:4-14`).

**D5 — "no player action of any kind" is not accurate as written.**
Probe `:10-11`, `676-T-report.md:66`, `679:21`. `p13aGeneratedStudio`
(`src/harness/p13a/fixtures.ts:9-12`) sets `economyEngagedEver: true` directly on the generated
world and applies one player action, `activateStudioOperations`, before `initializeHollywood(…,
'fresh')`. The bootstrap is lawful and is the recorded standard entry point, but it is undisclosed.
Correct wording: "no player action during the 260 ticks; the fixture bootstrap is
`generateWorld` + `economyEngagedEver` + `activateStudioOperations` + `initializeHollywood('fresh')`."

## What I verified and what survived (Q1–Q8)

**Q1 harness lawful — MET WITH EVIDENCE.** `677-*.json:3,:16` `testedDiffSha256` =
`e3b0c442…b855` (the empty-string digest) at both ends, `untrackedSource: []`, `fixedSource: true`,
`exitCode: 0`; `677-*.patch` is empty. The probe imports no `vitest`, writes no file (only
`readFileSync` of itself at `:208,:216` for the self-sha), and reads `currentTier` /
`currentCloseness` / the exported constants from `src/core/relationships.ts` — no local band or
drift arithmetic. `STRAINED_CEILING` is derived at `:39`, never typed as 44.

**Q2 campaigns — MET, with D5.** The four seeds are `654-T-ledger.md` §B rows `:31-34`. Worlds are
minted in-process and advanced one `tick` per week (`:70-71`), never `advanceTo`. No staged edge, no
fixture load, no save read. Final states pass `requireRelationshipsRoot` + `validateRelationshipsRoot`
(`:101-102`) and `makeSave` (`:129`).

**Q3 numbers — MET WITH EVIDENCE; I recomputed all four seeds, not two.**
Derived = `ΣP + (ΣP − edges) + S + F + C`: 300+273+18+84=**675**; 588+561+24+168=**1341**;
672+636+72+72=**1452**; 516+492+30+42=**1080** — all equal the reported derived AND observed.
Folded = derived − retained: 480 / 1146 / 1206 / 888 ✓. Retained decomposes exactly against the cap:
24·8+3=195, 24·8+3=195, 30·8+6=246, 24·8=192 ✓, and the below-cap edge counts match the
Acquaintances/Colleagues rows of each histogram. `S+F ≤ P` on all four. Every counter divides by six
(brief item A) ✓. `rootMarginalSaveBytes` = root bytes − 2 on all four (the `[]`) ✓.
Bytes/edge 894.6–993.6 → `679:65`'s "895 to 994" ✓; 1.34–2.06% uncompressed → "1.3–2.1%" ✓;
0.474–0.780% gzip-9 → "0.5–0.8%" ✓. **Note: the brief's appendix C figures ("1.4–2.1%", "0.5–0.7%")
are wrong on three of four seeds; `679:65` already carries the corrected bands. Publish `679`'s.**

**Q4 drift read honest — MET.** Every histogram entry comes from `currentTier(e, WEEK_BOUND)`
(`:121`); the stored-band comparator (`:51,:122`) calls the same real `currentTier` with the anchor
at the week rather than re-deriving `bandOf`. Final-week and ever-observed sets are separate fields
(`:156-158`) and separately labelled in `679:45,:52`. `676-T-report.md:118-123,:185-194` and
`679:125-130` state plainly that a finite run cannot prove impossibility. No conflation found.

**Q5 reachability proof — the conclusion is SOUND; the floor number is not (D1).**
Facts 1, 2, 3, 5 verified as stated. Fact 3 is in fact STRONGER than the note claims:
`appendFirstTakes` (`promises.ts:120-143`) and `advanceRelationshipsWeek` (`relationships.ts:263-266`)
consume the SAME `takeEntries` array with the SAME two early-return guards (`tick.ts:1103-1121`), so
a receipt cannot exist without its own six `sharedProduction` credits stamped at the same week. I
found **no** route to a negative driver on an edge its own production never credited.
Fact 4 is WEAKER than stated: `actions.ts:337-338` builds `busy` from
`activeProductionCompanyTalentIds` ∪ `activeWritingAssignmentIds` and DELIBERATELY excludes
`industryBusyTalentIds` (comment `:335-336`), so the player's greenlight does not refuse someone
seated in a live RIVAL picture. That hole does not break the bound: a rival cannot hold a picture,
because `decide()` (`hollywoodTick.ts:157`) uses the full `busyTalentIds`, which includes the
player's `activeProductions` and every rival production (`employment.ts:160-163`;
`hollywood.ts:89-101`), and `:161` caps a rival at one production. The 42/44 route (two penalties
pending across one drift window) is therefore genuinely closed, and Enemies/Nemeses are closed by
rule at `relationships.ts:131-134`. Rival saturation: directionally right, absolute form refuted (D3).

**Q6 overclaim — mostly clean.** `679:3,:67-69,:125-130` disclaim century scale ("260 weeks is not
6,240"), native/visual/performance results, bounds clearance and acceptance. Strike or soften:
`679:22-23` (D2); `679:91` "`676-P` shows it cannot" and `:135` "is now proved rather than argued" —
an arithmetic note with a demonstrated error is an argument, not a proof, and after D1 it should read
"argued, and the argument is corrected here to a floor of 45"; `679:118` "closes record 675 item 3"
→ "found no counterexample to". No all-green, Unity, Owner-acceptance or recommendation-as-law claim
found.

**Q7 privacy — one item.** `676-T-report.md:28` carries `cd /Users/zacheryspector/The-Movies-headless-program`.
It names the worktree root only — nothing outside it, no credential, no personal save, no non-project
material — but it leaks the account name if that file publishes. `677-*.json/.txt` use a
repo-relative command. Recommend replacing with `cd <worktree root>`.

**Q8 correction to record 675 — correct in direction, wrong in value, and plainly recorded.**
`675:95-97` does omit drift, so its 47 is not the floor; `679:132-137` records the correction in its
own section rather than burying it. Apply the newer correction over the older: the floor is **45**,
the margin is **one** point, and `675` item 1's "flop trajectory bottoms at 47" is right only for the
no-drift schedule. `675` item 2 is discharged for exactly what it asked (week-260 counts and whether
Strained is read on the standard seeds); `679:136-137` correctly keeps the endurance half open.

## REFINE (not defects)

1. `679:111` "24 edges is 4 producing rivals × 6 pairs" is an inference — the probe reports no rival
   count. Label it, or cite the roster.
2. `679:83-87` / brief item A: the mid-band attribution is arithmetic, not measurement (no
   `criticScore` is read). State the bound instead: at most one in-flight picture per producing
   rival, so ≥29 of p13a's 33 are neutral-band. `676-T-report.md:133-137` already says this correctly.
3. Brief appendix C's "root gzip-9 bytes" column is `rootMarginalGzip9Bytes` — a difference of two
   gzip sizes, not the root compressed alone. `679:58` labels it correctly; keep that label.
4. `679:65` "0.5–0.8%" rounds a 0.474% floor up. Say 0.47–0.78%.
5. `676-T-report.md:37` quotes a 24,907-byte JSON line from the author's run; the archived run's line
   will differ (elapsed ms). Harmless, but the record should not quote it as identity.

## What I could not check, and why

- I have Read/Glob/Grep only. **I executed nothing.** D1's sequence is paper arithmetic over the
  cited source, exactly the same evidence class as `676-P` itself — it is not a measured result and
  must not be recorded as one.
- Whether the queued-greenlight admission path (`actions.ts:291-296`) recomputes `busy` per admission
  or once per tick. Sequential application makes a same-week double-seat implausible, but I did not
  read the admission loop. If it batches, the 42 route reopens.
- Whether the player can sign talent seated in a live rival picture (the `actions.ts:335-336` hole).
  Not needed for the bound, but it is the one place fact 4 is narrower than `676-P` states.
- Whether every rival release reaches `delta.releases` via `industry.growth` (`tick.ts:1119`). If any
  path misses, the neutral-band attribution in `679:86` gains a third bucket.
- Nothing here is native, visual, or Owner acceptance; a fixed-source exit-0 probe is not a playtest.

## Smallest rerun that settles D1

None for `677` — the run stands. To convert D1 from paper to evidence: one new ~30-line standalone
vite-node probe beside `676-*`, no seed and no campaign, driving `advanceRelationshipsWeek` /
`driveTake` over a minimal state: mint one low-proximity edge, jump the clock 313 weeks, apply one
`sharedFailure`, then a second take plus a second `sharedFailure`, asserting 52 / 50 / 46 / 49 / **45**
and `currentTier(...) === 'Acquaintances'`. Seconds, no source touched. Do NOT re-run the B.5 cycle,
the regression set, or `677`.

---

## Parent disposition (added by the parent, 2026-09-22; not the auditor's text)

ACCEPTED IN FULL. D1–D5 and REFINE 1–5 are applied to `676-P-reachability-analysis.md`, record 679
and the Owner packet 680; the two false comments D2 and D5 name are corrected in the harness itself
(`681-T` handback) and the corrected harness is re-run as `682`, which reproduces every measured
value. The parent independently CLOSED the auditor's first open item: `applyGreenlight` computes
`busy` from the evolving state on every call, player action or queue admission alike
(`actions.ts:337-339`, comment `:284-286` "may already reflect earlier actions in this call"), so no
same-week double-seat exists and the 42 route stays closed. The floor is 45.

Q7 NOTED AND DECLINED: the worktree path already appears in the published `654-T-ledger.md`, in this
folder's briefs and in every commit's author identity, so redacting one instance changes no exposure.
Nothing outside the worktree, no credential and no personal save appears in any published artifact.
