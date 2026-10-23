# HANDOFF

Last writer: Claude (Fable 5.1), 2026-10-22, sole coordinator for the stabilization order below.

## Stabilization order 2026-10-22 — current order and ownership (read first)

- **Owner order (2026-10-22, "IMPLEMENT CODE REVIEW FINDINGS"):** a bounded code-quality and stabilization phase on this working branch based on the 2026-10-22 comprehensive audit. Fix confirmed defects, add regression tests, verify through the existing lane, independent read-only review of consequential changes, commit incrementally, keep a findings ledger, no `main` merge (the Owner authorizes that separately). This order supersedes the 2026-10-18 workflow-setup order below for the phase. It does NOT resume gameplay development, P16 generation, P17/P18 or canonical-62.
- **Audit and ledger:** `docs/engineering/audits/2026-10-22-codebase-review/` (AUDIT.md, EXECUTIVE-SUMMARY.md, LEDGER.md: FIXED / VERIFIED / DEFERRED / NOT REPRODUCED / BLOCKED per finding, with the lane log for every runtime claim). The same files plus lane logs and the domain reports live in `S/1370-codebase-review-20261022-r1/`.
- **Toolchain this phase:** Node 20.20.2 (`/usr/local/bin/node`; `.nvmrc`; `package.json` engines), `npm ci` from the lockfile (205 packages), preflight receipt `S/1370-codebase-review-20261022-r1/preflight-20261022-r1.LOCAL.json` (launchAllowed). Every heavy command runs through `S/1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh` with a script that exports PATH (an expanded PATH as a lane argument breaks on the space in "Application Support"); logs under `S/1370-codebase-review-20261022-r1/lane-logs/`. Do not edit `src/` while a lane vitest run is in progress (forks import source fresh per file).
- **LANDED this phase:** Batch 1 `473983de` (CI static job on Node 20, hygiene audit ENOBUFS fix, lane-guard classifier, .gitignore anchors, dependabot target), Batch 2 `5f074483` (core shared laws L-01..L-05), Batch 3 `11f62a7a` (L-14 cancel after commit refused, L-15 money and term admission), Batch 4 `53a9b4d6` (facilities cancellation seam L-06, L-07, L-08, L-30, L-31; the frozen eras read a cancelled job's stop week from its `constructionRefund` row). Batch 2 follow-up `5f5fa738` (the casting-slate law threaded into every frozen save walker, the closed-business straddle bound, test budgets, a natural save-path witness) answers the independent review of Batch 2. Batches 3 and 4 were independently reviewed; their follow-up `250d9e30` (R1 past the cancelled job's completion week, one receipt per restoration, owned copies of shape and promise, the shared term guard) and the Batch 2 part-2 follow-up `843a492d` (the dropped assertion, one shared anchor-guarded reader, the strict-law case) are landed. Batch 5 `7582897f` (persistence: the sequence law over the unstripped event log, a whole-state finite-number walk, live-version sentinels) is landed. A third follow-up `be45f16b` (restorations never work to order, failing tests for the one-receipt law, the save-path chain assertion, the queue's owned copies, the renew guard) is landed. Batch 6 `490b4c0e` (UI/Lot; LOT-13 withdrawn after four adopted contract tests refused it; ui rerun equals the parent's 13 failures) and Batch 7 `0bc642f3` (Bridge quote responses through the contract; the Unity contract manifest regenerated because it hashes package.json, which Batch 1 changed) are landed. The Batch 5 follow-up `d624fb30` (the retention-window clause over the unstripped log, the setup-route and probe-found witnesses, the finite walk's path built only on failure) is landed; the validator's measured cost is +16% on the save-heaviest bridge file alone and the 20 s-budget test passes at 14.8 s (`lane-logs/measure-prepared-reuse.log`), so the bridge reruns' timeouts were lane load. The independent review of `490b4c0e`, `0bc642f3` and `d624fb30` returned five blockers (the L-38 click had no effect; four construction handlers lacked the L-27 guard; the Bridge parse could not catch int32 overflow and a parse failure escaped as a runtime fatal; the BRIDGE-09 comment stated the wrong rule); follow-up 4 `ba238f30` answers them and is landed (`lane-logs/focused-batch8-r1.log` and `focused-batch8b-r1.log`; the L-38 case is red at the parent). Owner decisions 2026-10-23 (execution record; the full table is the ledger's "Owner decisions, 2026-10-23" section in `docs/engineering/audits/2026-10-22-codebase-review/LEDGER.md`): DONE 1A (`main` fast-forwarded to `6a06dc53`, then to the records commit after this session's decision commits passed their focused lane runs), 2C (both four-case suites pass alone, `lane-logs/decisions-r1.log`; the 51 single-case entries accepted as timing), 21A (Pillow 13.0.0 and numpy 2.5.4 at user level for /usr/local/bin/python3; the exporter cases pass), 8A and 6A and the log half of 20A (`19c111ce`), 9A and 10A (`fbb17896`; lanes `decisions-r3` 520 of 528 with six recorded-baseline failures, `decisions-r4` 3 of 3), 13A confirmed. 5A is DONE at `2035e52b` in the audit's own direction (the Owner delegated it): a queue admission's studio-event rows now carry the arrived week t+1 like its ledger rows and `startTick`, through a sink view with a t+1 default week; no schedule or money change; `tests/stabilization-l18-tick-row-weeks.test.ts` pins the full rule (lane `decisions-r5`, 296 of 304, the rest recorded-baseline or missing fixtures).
- **Named, not done (from 10A):** no save-validator rule against early seats (player saves under the old law could hold one); the Bridge plan-companion row still treats a cancelled stage record as committed; the adopt-row change has no Bridge test.
- **SCHEDULED per the ledger table:** 3A (P16 rebase: branch from `main`, `git apply --3way` the candidate's PATCH.diff, resolve the seven paths by the ledger's merge rules, regenerate the Bridge manifest, run the candidate's own suites), 4A (typed refusals, its own phase after P16), 7A (inside P16), 11A (before any retune), 12A, 14B, 15A (Lot phase), 16C, 17A (browser), 18A (canonical-62), the projection-retirement half of 20A. 19A is DONE (`57305b24`, the design note beside the ledger; one assumption for the Owner: the commissioner's licence is granted at a zero licenceGrant transaction and the P18 agreement carries the money).
- **Next agent:** read the ledger's decisions table first; start with 3A.

Phase end (2026-10-22 night): the final gates ran at `ba238f30` (`~/studio-scratch/1370-codebase-review-20261022-r1/lane-logs/final-gates.log`): every static gate, both contract checks, the audits and the build exit 0; test:bridge 1,028/1,067 (34 recorded-baseline + 3 new: two `bridge-schema` wording cases and one load timeout green alone); test:ui 2,702/2,720 (exactly the parent's 13); test:core 5,749/5,869 (102 recorded-baseline + the same 3 + one environmental exporter needing the Python imaging library). Follow-up 5 `f75e76ce` corrects the two wording cases (a declared bound answers first) and is verified by the focused rerun `focused-batch9-r1.log` at the final head. The findings ledger and the stabilization report are in `docs/engineering/audits/2026-10-22-codebase-review/` (the commit that carries this HANDOFF); the evidence (lane logs, JSON reports, baselines) stays in the audit folder above.
- **Not done, by order:** no `main` merge (the Owner authorizes it separately). **Open for the Owner:** the ledger's Owner-decision rows (L-16/17/18/28/32–35/37/40, C-07, C-09, the Scientist-as-Craft-Lead rule, the plan-built-body demolition hold, LOT-13's plate copy), the 59 recorded failures that no longer reproduce (listed, not investigated), the P16 patch's seven conflicting paths (merge rules recorded), the Bridge money-width contract (int64 or `number`) at canonical-62.
- **Next agent:** read `LEDGER.md` and `STABILIZATION-REPORT.md` in the audit docs folder first; the phase's lane scripts and patch scripts were session-scratchpad files and are gone with the session, the ledger names every run by log file.
- **CANDIDATE unchanged:** `K/p16` current200 (PATCH `d59d331b…`, MANIFEST `7b16780a…`) untouched. Its patch now conflicts at `src/core/hollywoodValidation.ts` (`verifyParticipants`); the conflict is semantic and the merge rule is in the ledger's P16 section. The P16 lane re-bases that hunk together with its own C-01 fix.
- **Baseline:** the 162 recorded full-core failures (P15B-full-gate-r1) remain the comparison baseline for every focused run (`scratch/baseline-core-failures.txt` in the session scratchpad; the list is reproduced from `core-full.json.gz`), compared, never waived.
- **Exact next action:** read `lane-logs/focused-batch2b-r1.log`; if only recorded-baseline failures remain, commit the Batch 2 follow-up (`src/core/{castingSessions,actions,construction,save,professionHistory,tick}.ts`, `tests/stabilization-l0*.test.ts`, `tests/helpers/stabilization-staffing.ts`, `tests/stabilization-l02-casting-save-path.test.ts`), then apply Batch 5 (`save.ts` validateSaveP15B sequence law + plain-JSON walk, sentinel tests, `tests/stabilization-l19-save07-persistence.test.ts`), Batch 6 (UI/Lot) and Batch 7 (Bridge) from the session's prepared patch scripts, each with its focused lane run and a read-only reviewer for the consequential ones; then the full gates (`typecheck`, `typecheck:bridge`, both contract checks, `test:bridge`, full `test:core` ≈ 2 h, `test:ui`, `build`, hygiene audit) compared against the baseline; then the ledger's final section, this file, push, verify the remote, and the stabilization report with a `main`-readiness recommendation (no merge).
- **Open decisions for the Owner:** L-17 (engine refusal versus fault surfacing), L-18 (admission week of a queued greenlight), L-16 (recap label), L-28 (promise feasibility term), L-32/L-33/L-34 (facility rulings), L-35 (Legacy manifest week), L-37/L-40 (Lot rulings), C-07 (P16 rights model versus P18), C-09 (story-property minting versus P17 link), and the Scientist-as-Craft-Lead rule that L-04's one availability set now refuses.
- **Claims limits:** focused lane runs per batch at the core's 5,000 ms default; no full `test:core` / `test:ui` / `test:bridge` gate has run in this phase yet; no browser, native or Owner acceptance claims.

## Current order and ownership — read first

- **Owner order:** implement/publish the bounded shared Claude/Codex workflow only. This is the only active Studio terminal. No ownership blocker remains; the separate builder stays parked. GAMEPLAY IS PAUSED. No P16/P17/P18, canonical-62 generation, Unity, REA, polling, cleanup or runtime restoration is authorized here.
- **Where:** `https://github.com/HSpector1/The-Movies.git`, working ref `refs/heads/wip/headless-program-20260916-ts`, refreshed base `1e3e19161aaa4c57be4e0b2a94a6a3fc0654e862`. Workflow publication is a bounded branch/PR from that ref; see [validation](docs/development/WORKFLOW_VALIDATION.md) for publication/adoption state. Preserve newer commits and the hook-owned AUTO below.
- **LANDED:** production Save48 source at `2c3024e2`; production source tree `476b387d65a4c427dc0f6120724e946cf22d7969`. This setup changes no gameplay source.
- **CANDIDATE:** `K/p16`, base `2c3024e203abec74db95b8c01334723f10595ed2`, current200 `A/p16-stopped-drafting-bridge62-integration-r1`. Metadata refreshed for setup: 200 staged paths and only HANDOFF metadata unstaged. No candidate/index writes. Preserve PATCH `d59d331be952e608aa4da9f89f88d71212826adb62a1f54ebbaf0cd6c4e1a1c5`, MANIFEST `7b16780a9573185c443d4f153ead6f98795074064136031944a36d71f224039e`.
- **STATIC-UNRUN:** stopped-drafting source7/final3/refusal2 installed in current200; canonical-62 generation and qualification remain unrun. Retained-writing composition13 and final bound completion4/accept3/rewrite3 remain future, uninstalled, ten UNRUN tests. P17/P18 are inactive.
- **FAILED / REUSED:** original R24 failures/overruns and R25 seven reached passes remain preserved. R25 external-overlap supplement prevents exclusive runtime qualification; no assertion or timing waiver. Prior qualified settlement/save/replay evidence is reused only within its recorded identities and limits.
- **ACCEPTANCE OPEN:** P16, broader integration, historical timing fallout, native/browser/player journeys and Owner acceptance. The unchanged remaining-requirements table below governs; setup closes none of it.
- **Next permissible action:** workflow setup is complete; return control with gameplay PAUSED. Do not repeat setup. A future Owner gameplay-resume order is required before the preserved game sequence below. A future Owner gameplay-resume order is required before the preserved game sequence below. Do not rerun a preflight merely to report status.
- **Safe boundary observed:** recorded shared lane lock and R6 output directory absent at setup entry; no recorded Studio run awaiting audit was found. Old disk readings and PIDs in history are not current prerequisites. No generator, game compiler, runtime test or process termination performed by setup.
- **Workflow state:** entrypoints, eight instruction routes and setup helper implemented; 22 focused tooling tests PASS. Restricted fresh CLI discovery/routing checks and their failures/limits are recorded in WORKFLOW_VALIDATION; publication/adoption status is recorded there. Read AGENTS.md, one WORKFLOW route and matching LESSON_MAP entries; archives are on demand.

## Workflow checkpoint publication

**ADOPTED on the working ref:** [PR 18](https://github.com/HSpector1/The-Movies/pull/18),
reviewed head `33066c12aff569803e010728da9aa24b4cd36abf`, merged normally as
`84943cabbdae298a4a3acfbdc0a53435717e54c3` on 2026-10-18. Explicit remote advertisement
and PR merge state verified. Core implementation `c6cd29ee1c6c27c7f91a05e0889be0ce123b1593`.
This checkout was fast-forwarded without switching it. The containing receipt checkpoint adds
only HANDOFF/validation status. Main, gameplay source, K/p16 and runner bindings are unchanged.
All eight instruction routes are locally installed; restricted client observations and default
profile limits are in WORKFLOW_VALIDATION. Existing optional repository CI was pending at adoption,
not claimed passed or used to waive game gates. No admin/check bypass or automatic merge used.

## Where the work is

`R` = this production checkout (currently `/Users/zacheryspector/The-Movies-headless-program`).
`S` = sibling `studio-scratch`; `K` = sibling `studio-specialists`.
`A` = `S/1370-astra-takeover-20261012`.
`E` = `R/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-astra-takeover-20261012`.
These describe existing local evidence, not paths to invent on another machine. Resolve missing prerequisites from the current checkout before a separately authorized game continuation. Do not hydrate archives for routine status.

## Active ownership and exact next action

Workflow owner: this sole coordinator. Additional writers require explicit disjoint ownership;
independent test/review ownership and the one intensive execution lane remain intact.
**Gameplay is paused. The following preserved sequence is conditional on a later Owner resume.**

**Exact next implementation sequence:**

1. At actual resumption, reconcile the live lane/resource state and run `A/equipment-run-preflight-r3.py` against `A/p16-work-release61-generation-runner-r6/runner.sh`, recording a fresh LOCAL receipt. Do not run the generator unless the unchanged preflight passes and exclusivity holds. The runner's old `61` filename is intentional: it is the reviewed canonical **62** generation. All five PINS match at handoff.
2. Use the existing sole lane `S/1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh` with a fresh absolute log. Load `P16_BOOTSTRAP_SCRIPT_SHA256`, `P16_BOOTSTRAP_BINDINGS_SHA256`, `P16_BOOTSTRAP_SELECTION_SHA256`, and `P16_BOOTSTRAP_AUTO_HELPER_SHA256` from R6 `PINS.json` programmatically. Runner invocation is `bash <lane> 0 <fresh-absolute-log> bash <R6>/runner.sh`. After terminal completion, run `R/.venv/bin/python3 -I -B A/p16-generation-independent-audit-parent.py r6`. Freeze source/index/HANDOFF through that fresh independent audit; retain failures.
3. Stage only audited declared outputs and form an immutable successor to current200. Bind the **actual** 62 schema identity, then finish the prepared four-file current-consumer correction and 31-file literal companion. `bridge-schema.test.ts` current identity and generator F10/F11 declaration goldens still need actual output/independent render evidence; do not guess hashes. Qualify the root compiler and complete focused **16 = drafting3 + refusal2 + clean5 + rival3 + player3**, with original 5000ms including setup, independent audit/review and actual exclusivity. At this coherent actual62 boundary, also execute and qualify the affected complete Bridge consumer tests, affected UI/Bridge compilers and canonical generation checks; merely installing corrected literals/goldens is not consumer qualification. Preserve each original test budget and inherited failure.
4. Only after those dependencies qualify, compose and install the later retained-writing source/test increment with its actual canonical version/registry/generation. Exact final source layers: `p16-retained-drafting-continuation-source-r1` → `p16-carried-script-actions-r2` → `p16-carried-script-rewrite-r3` (13 unique final paths). Exact prospective tests: `p16-retained-drafting-continuation-tests-r3-bound` (4), `p16-carried-script-accept-tests-r5-rewrite-r3-bound` (3), `p16-carried-script-rewrite-tests-r3-bound` (3). Use `A/P16-RETAINED-WRITING-STATIC-COMPOSITION-RECEIPT.json` and `A/P16-RETAINED-WRITING-FINAL-TEST-BINDING-RECEIPT.json`; completion4's older manifest alone does not bind the final composition. All ten remain UNRUN, not reached assertions.


### Pending binding reconciliation

Setup modifies only production workflow instructions/metadata, not `K/p16`, its HANDOFF, index,
runner or pinned input artifacts. R6 `runner.sh`, `BINDINGS.json`, `SELECTION.json`, `PINS.json`
hashes were rechecked against the recorded identities. Its freeze captures K/p16 HANDOFF at
launch, not the production root's new handoff. Do not transplant these instructions into K or
rebase its candidate before generation without independent reconciliation. Any future runner
that binds production HEAD/index/HANDOFF, instructions or scripts must review the workflow
commit and refresh its prospective binding through the existing safe process. Never alter
historical bindings/receipts or substitute hashes in the old runner to make it pass.

### Existing P16 remaining requirements — update here, not another planning package

| Group | Closed evidence / remaining requirement |
|---|---|
| Closing-day settlement | Actual13M complete transaction/save/replay and hostile receipt/credit/debit/real publication rollback qualified coherent32/root; latest full ceremony/negative files qualify again in focused11/default5s. Still two-estate reservations/order; actual bidder change/loan atD; direct/player/6240 faultcomposition. Actualnegative/equal/excessclaims nowqualify3/default5s withexactpriority/caps/residual; originalpartialretained. |
| Closure/title/run handoffs | SellerC actual held-title/context/frozen48 qualified. Buyer actualC269 assertions pass, reviewedr3 measured5676ms remainsOPEN. R1/encumbrances/actualactive-run-afterD/multi-estate composition remain. |
| Historical compatibility | AuthenticR03 positiveclaim/run migration/downgrade qualified. Frozen19 zero-only repair now clears all54 original functional failures; exact current/historical Bridge controls pass but13 consumer timings stillOPEN. Actual132→134settlement/replay and separate134→144current49singlearchive nowqualify; originalboundaryassertionfailure retained. Complete154 companionR8 added two historical test-projection failures; R11 nowpasses both unchanged byte/RNG/digest/boundary assertions after guarded constructed-operand fixes, without changing genuine inputs/frozen readers. S5middeployment remainsover5s (latestR13 10051.038001ms; original10767.566ms retained). CurrentBridge consumer4 plus live-literal companion31 have static independentKEEP, uninstalled until actual62 generation/audit; frozen fixtures/budgets unchanged. Broader old-era/frozen fallout remain. |
| Healthy acquisition/absorption | Actual cleanR03 employment/cappedexits/fractionalcash/heldtitle/terminal/save/replay/publicationrollback and genuine268research cancellation qualify7/default5s. r6-r2installed; physicaldeadline2/publicAction3 qualify/default5s. Completedknowledge3 nowqualify realcommercialadoption and paidmarker/currentfield/frozen45 hostility. Ordinarypendingadoptiondeadline288 now qualifies through real seven-tick continuation; alreadyheld grant remains separate. Reviewedr7cancelRequired qualifies completepaidproduction2; r8actualfuture-run positive qualifies eightticks/lockedbuyerreceipts/originalcreator/settlement. Its completehostileleaf now qualifies with allmutants/purity reached in focused2/default5s after one-case expected-guard correction. Publicforeignrecipient and actual13tick stale-report controls also qualify. Late-post continuation positive/hostile journey now qualifies actual buyer hold/publiccommit/nativeprogress/creator/Standing/R2/futurecash/save/replay; full-reader hostile controls and actual publication rollback qualify in current183 focused12. Original181 duplicate identity failures preserved. Actual61 generation and all181 compilers pass. Manual late-post cancellation now qualifies actualcoreAction3: exact originalpaid source preserved, relationship consequences, staffing release, reader hostility/irreversiblecommit/refusal and actualpublicationrollback reached; originalown-onlybaseline2RED retained. Earlier SILENT genuinepre162baselineRED and R11 timingoverrun preserved. Actual191 R13 now qualifies all10 initial8/7/6 controls/default5s (max2833.490ms): real funded buyer acquisition/capacity, native firsttake/wrap/hold/publiccommit/release/title/run/save/replay, full-reader hostiles and realpublicationrollback. Manual3/latepost3 requalify on the same composition. Exactoriginalpre162R02 completedtake4 original192 R14root2 nullableguardRED/0runtime preserved; reviewed nullguards192-r2 root0/48s; R15fullpositive+rollback qualify but newnullhostile expectedfirstowner mismatch leaves latermutantsunreached. Exactone-row expectedowner correction192-r3 now qualifies complete3 in R16: genuine completedtake/sourceLock/paidcreator→buyerwrap/hold/publiccommit/release/save/replay, all missing/null/wrongowner/paid-snapshot hostiles and callerpurity, realpublicationrollback; max1798.851480ms/default5s. Initialshooting5 now qualifies R18 complete3 on coherent6files22: real buyer actions/take166, nativewrapinput166/observed167, hold/publiccommit170/release171, originalsourceLock164 and paidcreator preserved, fullreaderhostiles/purity/publicationrollback/save/replay; all22 pass default5s, max4646.669643ms. R17 diagnostic preserves actual prior refusal. R21 explicit nonretention alternative now qualifies complete3/default5s: all6 capped exits/exact ordered stoppedshooting5/body/script/lock/cash, no buyerwork/take, native stoppedthrough171/save/replay, fullreaderhostiles and realpublicationrollback. OriginalR20failed3 retained; test expectation corrected, productlaw unchanged. R23 now diagnoses genuine171 newdraft0014 alongsidefilm12 and actual funded163R02buyer→R01 explicit[] quote; both existingcapabilityrefusals/purity reached, no successfulnewfeature. R24 reaches real rivalexplicit[] debit/exits/title/paid-source/ordinarythrough166/save/replay, but positive5332ms and playerpositive8031ms remainOPEN; rivalpublicationrollback qualifies2177ms. Cashhostile+0.01 is belowexistingtolerance; laterhostilesunreached, reviewedaboveboundcorrection/harness3repeatreads nowinstalled198UNRUN. R25 measured successor rival3/player3 and funded171diagnostic1, all7withinoriginal5000ms/max3657.817ms; supplemental evidence shows external overlap, so serial execution qualification remains required. All rival cash/missingstop/inventedwork hostiles and actualrollback reached; playerthrough171/save/replay requalifies. Real171paidDD/publicask/cappedexits/affordability facts reached before currentdraft refusal. Current200 stopped-drafting source/final3/refusal2 installed; generation and runtime UNRUN. Relevant exclusive successor16 required. Separate future retained-drafting source13 and source-bound4 r3 now have independent conditionalKEEP; real activation171, native173 completion and174 once-only/full-reader/rollback controls are STATIC/UNRUN. Native public Accept successor9 also has conditionalKEEP; final accept3 is r5-rewrite-r3-bound, with original r1/import correction and later rewrite-compatibility predecessors preserved. Bounded native rewrite-r3 has conditionalKEEP after preserved r1/r2 consequential findings; final rewrite3/accept-compatible3 and unchanged completion4 compatibility also have conditionalKEEP, separately bound to the composed source. Broader competing-own/multiple-carried screenplay history and greenlight remain required OPEN. These remain uninstalled, future canonical grouping pending, and close no runtime requirement. OriginalR24failures/overruns retained. Remaining: setup/sound, drafting/rewriting and retained/default/partial handoffs, wider rivalbuyer retainedwork/runs, openpromise/market and completeAction/Bridge/native remain required. |
| Rights policy and financial presentation | F40 actual13M core and UI26 qualified; current59 generation/consumer assertions pass with timinglimits. Ownclosedplayer pending; actual fractional acquisition core/Bridge finance2 now qualify unchanged5s with exact category/period/cash reconciliation and no private target disclosure. F17 finiteversionedpolicy source/seven actual boundarycontrols PASS within5s; actualcarriedquote storedpair/close/reload and malformedage refusal now qualified. Complete quote-age7 requalifies actual12→13 route in2137.101ms; original10790ms overrun preserved. R19 genuinefixedpre162 R01film0→R03 rights purchase now qualifies3/default5s: actualpaidprivateDD, fixed1000willingness/reserve, direct/ordinaryanswercanonicalparity, exactrivalcash/titleonce/save, foreignauthorityrefusals and realcashowneratomicrollback. No playerledger pollution. Actual795/fulltickrights and wider rivalpolicy remain. |
| Coherent integration and acceptance | Current167-r2 exactroot0 reused, UI0/59s Bridge0/43s, complete25=24PASS1FAIL/all≤5s; sevenstrictchecks0errors/independent1610sources190inputs. Originalhostileleaf error mismatch preserved; onlythatcase corrected167-r3, focusedroot0/complete2PASS nowqualifyallmutants/default5s withfivechecks0errors. Actual181 threecompilers/generatorchecks0; coherent76=72PASS4FAIL with68budgetqualifiedpasses/fiveoverruns. Current183 root/Bridge0 and complete12 allbudgetqualified; independent1617sources277inputs/7checks0errors. Originalroot-wrapper97 remainsfailed. Original167 threecompiler2 preserved. Prior162 threecompilers0; original20=16budgetqualified4FAIL retained; narrowroot0/focused5allbudgetqualified reachesallfourformerlyblockedcases.  Prior39estate/history/F17 retained; original7titlefailures preservedandlaterqualified.  Earlier finance/UI168functional/154budgetqualified retained; projection60consumer/native notqualified. New29-path R9/reader/Bridge61 source composition+independent3 installed181 after exactpreimagechecks; canonical61 generation qualified; actual181 runtime72PASS4FAIL/68budgetqualified; native stillUNRUN. P16unlanded; broad core/UI/Bridge/generator/native/browser/player obligations and P15B limits retained. P17/P18 implementation inactive until actualdependencies qualify. |


## Operational details that will otherwise waste a session

- Every Git uses `-c gc.auto=0 -c maintenance.auto=0 --no-optional-locks`.
- Game execution only after Owner resume, fresh `A/equipment-run-preflight-r3.py` and actual exclusivity.
  Existing sole lane: `S/1370-c0-stage41-heavy-lane-recovery-proposal-r8/lane-run-r8.sh`, SHA256
  `aff8e9749cd3e33de874931dbf258fc13ceb79d2f7ea44fcc56816db85af3f2e`.
- Preserve launch floor 3,670,016 KiB and runtime floor 3,145,728 KiB. Historical headroom/PIDs
  are observations, not platform rules or current ownership. Never terminate another terminal.
- Game Node pin remains 20.20.2; existing project Python is `R/.venv/bin/python3 -I -B`, never `-O`.
  Detect this machine's tools; do not upgrade or copy native binaries to fix a version mismatch.
- `.claude/settings.json` and lane-guard hook chain are unchanged. Codex must honor the same
  lane manually. No active-run source/index/HANDOFF writes through its independent audit.
- Exact operational history, publication rules, input caps and interpreter evidence:
  [preserved operations](HANDOFF-through-workflow-20261018.md#operational-details-that-will-otherwise-waste-a-session).

### Protected historical anchors

These anchors locate the historical roles that must not be silently reassigned. Use actual source manifests and recorded authorities, not this table alone, for runtime grants.

| Historical role | Identity |
| --- | --- |
| M0 mirror | `S/1370-c0-m0-observer-mirrors-20261009-r2/20261009-m0-types-r2` |
| M0 source content | `fbbfed3ec13da5618a0194204e2f6c8a87eebb5ee22102707d466340fbe6e1e0` |
| M0 physical | `12c3dd50b99860c1c4e56ee98488d5f04613b37c93496d0257cc560a4fb83038` |
| M0 non-root identity | `0c9cfd7e1647b08f6ffb7835500044efeecfb2c13e58d4d8e8998e4837e75417` |
| M0 dependencies | `a06e929a60a5ede6ce0d72467d4d587e50d1c4fa3788bee3d07f1ea3388cd21d` |
| Historical AN types root adoption | `be632d535f6b037e705c4ead116887c6e0ca3aa66dfe9c72ee0a25c0a3dbee83` |
| Private R9 full baseline | `555867b2be0abf76728fc8b905c52a73512b5da31d24162d804e7e1b9d8c9347` |

The M0 source census was 1,740 files / 119,393,120 bytes / 1,853 entries. Dependency census was 348,223,802 bytes / 12,484 entries; some full-guard listings include the root entry and therefore count 12,485. Keep count semantics from each producer rather than relabeling them. Historical types actual 56426 and its preservation/readbacks remain separate from the corrected current operational helper.


## Major lessons to carry forward

Use [LESSON_MAP](docs/development/LESSON_MAP.md) to select canonical lessons and regressions.
Existing active lessons 1–77 remain byte-preserved in
[the exact entry handoff](HANDOFF-through-workflow-20261018.md#major-lessons-to-carry-forward).
Do not read the entire archive at startup or treat its old next action as current authority.

### P16 lessons 78–101

[Preserved lessons 78–101](HANDOFF-through-workflow-20261018.md#p16-lessons-78101), including
input-week, generated identities, reached assertions and execution freeze corrections.

### P16 lessons 102 onward

[Preserved lessons 102–128](HANDOFF-through-workflow-20261018.md#p16-lessons-102-onward).
129. Workflow setup must preserve current game bindings and pause separately from instruction
readiness. Exact entry archives, AUTO identity, selected instruction hashes and isolated tooling
checks support only the workflow claim. Fresh-client discovery and actual game smoke are separate;
see WORKFLOW_VALIDATION. No game requirement is closed by setup.

## Closed work: do not reopen or replay without a concrete affected-code reason

Cleanup, iCloud transfers, preview and historical archive reconciliation remain closed.
[Exact prior closure list](HANDOFF-through-workflow-20261018.md#closed-work-do-not-reopen-or-replay-without-a-concrete-affected-code-reason).

## History and source navigation

Exact pre-setup handoff: [HANDOFF-through-workflow-20261018.md](HANDOFF-through-workflow-20261018.md).
Exact prior Claude instructions: [CLAUDE-before-shared-workflow-20261018.md](CLAUDE-before-shared-workflow-20261018.md).
Both remain at root depth so old relative references retain their meaning. For any historical
root HANDOFF heading moved here, use the same fragment on the exact handoff archive; this is the
explicit old-anchor map. The live table, ownership, operational, protected-anchor and lesson
headings above retain their established names. History carries evidence, not current permission.

## Auto snapshot
<!-- AUTO:BEGIN (handoff_guard.py rewrites this block) -->
- Stamped: 2026-10-17 22:53 CDT by **claude** on SessionEnd (session cb9626c5-c417-4055-870c-4e5e5b5d09e9)
- Branch: `wip/headless-program-20260916-ts` @ `1e3e19161aaa4c57be4e0b2a94a6a3fc0654e862`
- Upstream: `none`, unpushed commits: ?
- Uncommitted files: 1
  - `M HANDOFF.md`
- Last commits:
  - 1e3e1916 Record end-of-day stop reading and resume command
  - 50cf6487 Ignore private .LOCAL. receipts in the public repo
  - 955f0442 Map program steps to skills in CLAUDE.md pointer
  - afad1ea0 Add Claude lane-guard hook for direct heavy commands
  - 5ee57b86 Archive superseded HANDOFF history verbatim
<!-- AUTO:END -->
