# NEW-LAPTOP IMPLEMENTATION PLAN — from the Sprint 27 checkpoint to a playable native alpha

Status: PLAN FOR REVIEW (read-only planning, 2026-10-31). Nothing here is started. The incoming laptop is unavailable; every native step below is BLOCKED until it exists. Owner acceptance of the browser candidate is pending (the playtest is in progress at http://127.0.0.1:4180/ on 18c3e8cf); feedback-dependent items are marked **[FEEDBACK]** and are not filled in.

Note on provenance: no earlier "NEW-LAPTOP IMPLEMENTATION PLAN" text exists in the records, the handoff or the engine tree (grep over docs/engineering/audits and HANDOFF.md). This plan is written from the requirements in the Owner's /plan message of 2026-10-31, the handoff (items 21 to 24), sprint25/RESULTS.md (the route matrix), sprint27/RESULTS.md, p16-sprint15/RESULTS.md (the native setup list) and playtest-20261030/LAUNCH-RECEIPT.md.

## Context

The program has a browser game that runs (Sprint 26 candidate, byte-identical browser sources at the Sprint 27 checkpoint) and a Bridge that now carries every §7 minimum route (Sprint 27 added the rights and estate routes at projection 71). The native Unity client (HSpector1/project-studio-unity-visual-spike, branch sprint15-consumer-20261028 at 4c41676) has been adapted to the contract by source edits only; nothing of it has compiled, run or been tested since the program began, because this Mac (macOS 12, Intel) cannot run Unity 6000.3.22f1. The goal of this plan: on the new laptop, go from "paired source identity, STATIC-UNRUN" to a native alpha the Owner can play, in the order the Owner set: a compiling native baseline first, then the missing native screens and quote drivers, then real input, save/load and Bridge interaction verification. Nothing already implemented in the core or the Bridge is recreated; the native work is presentation and drivers over the existing wire.

## 0. Identities this plan starts from (verified 2026-10-30, 20:49 CDT local check, unchanged at planning time; refresh once on the new host)

| Repo | Branch | Commit | Role |
|---|---|---|---|
| HSpector1/The-Movies | p18-season-20261028 | 18c3e8cf (tag p18-sprint27-checkpoint-20261030) | engine, Bridge, browser client; projection 71 |
| HSpector1/The-Movies | tag p18-sprint26-candidate-20261030 | 6ddeeb00 | the immutable browser playtest candidate (same browser bytes as 18c3e8cf) |
| HSpector1/The-Movies | wip/headless-program-20260916-ts | 8686b420 | records (docs/engineering/audits/2026-10-22-codebase-review/…), HANDOFF.md |
| HSpector1/The-Movies | p16-retained-writing-20261026 | f18e6fe7 | HANDOFF mirror |
| HSpector1/project-studio-unity-visual-spike | sprint15-consumer-20261028 | 4c41676 | Unity client; DTOs at projection 71; CF09 seal PASS with b2b4bdd9 (18c3e8cf is test-only on top) |
| PR #20 | draft, auto-merge off | head 18c3e8cf | stays draft |

Unity pin: 6000.3.22f1 (1c726e1fb402), Packages/manifest.json: URP 17.3.0, Input System 1.19.0, Newtonsoft 3.2.2, test-framework 1.6.0, cinemachine 3.1.7, ai.navigation 2.0.14, gltfast 6.10.3, timeline 1.8.11, ugui 2.0.0, unity-mcp v10.1.2 (git URL dependency; needs network at first import). No git-LFS in either repo. Engine `engines.node >=20.20.2 <21`, .nvmrc 20.20.2; the packaged studio build targets node24 for its bundles (esbuild target only; it runs on the pinned Node).

## 1. One-time new-machine restoration and setup (the Owner installs; the coordinator never installs a toolchain, signs in, or creates an account)

Order matters: the engine side first (it reproduces the browser launch receipt and proves the clone), then Unity.

**A. Owner-performed installs (before any session)**
1. Xcode Command Line Tools (`git`), Google Chrome (Playwright runs in the installed Chrome, `channel: 'chrome'`).
2. nvm, then Node 20.20.2 (`.nvmrc`; `engines >=20.20.2 <21`). Note for M1 step 5: `scripts/build-studio.mjs` and `prepare-runtime-worker.mjs` bundle with esbuild `target: 'node24'` while the toolchain pin is Node 20; whether the emitted `dist/studio/studio.mjs` runs on Node 20 is tested in M1, not assumed.
3. Unity Hub, then Unity 6000.3.22f1 (revision 1c726e1fb402) with the **macOS Build Support (Mono/IL2CPP as the project uses)** module; sign in with the Owner's licence. Expected editor path: `/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity`.
4. Claude Code (or Codex) with the Owner's `~/.claude` carried over: `hooks/handoff_guard.py`, `skills/handoff`, `rules/`, `settings.json` hook entries, and a fresh `state/handoff_guard_projects.json` whose `roots` list every checkout path on the new machine (engine, records, Unity) and whose `writeBlockers` names the new HEAVY-LANE-LOCK path. Without that file the hook stamps HANDOFF.md during lanes, which is the Sprint 27 r2 failure. The `this-mac.md` and `CLAUDE.md` machine gotchas are for the old Mac; rewrite after the first session.

**B. Checkouts (the names the play command expects; `<parent>` is one folder, e.g. `~/`)**
```
cd <parent>
git clone https://github.com/HSpector1/The-Movies.git "The Movies - Unity Production Convergence 80H"     # full clone, ~449 MiB pack; no LFS
cd "The Movies - Unity Production Convergence 80H"
git checkout p18-season-20261028 && git rev-parse HEAD        # expect 18c3e8cfe11d0e294bef5e64aff362907ec2c627 or newer on the branch
git worktree add ../The-Movies-headless-program wip/headless-program-20260916-ts   # records + HANDOFF.md (sparse to docs/ and HANDOFF.md is fine for records; never sparse the engine checkout: CF09 needs a full clean one)
cd <parent>
git clone https://github.com/HSpector1/project-studio-unity-visual-spike.git "Project Studio - Unity Production Convergence 80H"   # ~52 MiB; no LFS
cd "Project Studio - Unity Production Convergence 80H" && git checkout sprint15-consumer-20261028 && git rev-parse HEAD   # expect 4c4167671360fdfa13bad06594e64be075dfa2b8 or newer
```
`PLAY_PROJECT_STUDIO.command` resolves the Unity project as `<engine parent>/Project Studio - Unity Production Convergence 80H` (sibling by exact name) and the app at `Builds/macOS/Project Studio Visual Spike.app`; `--unity-project` or `PROJECT_STUDIO_UNITY_PROJECT` override it (`bridge/supervisor/config.ts` 6-9, 318, 352-370). Use the exact names and skip the overrides.

**C. Engine checks (reproduce the launch receipt on the new host; this is the "recover once" of the first order)**
```
cd "<parent>/The Movies - Unity Production Convergence 80H"
nvm use && node -v                                  # v20.20.2
npm ci
npm run -s typecheck && npm run -s typecheck:bridge
npm run -s check:bridge-contract && npm run -s check:bridge-contract:fixtures
npm run -s build                                    # ui/dist; index.html sha256 4f3ec83d… at 18c3e8cf
node node_modules/@playwright/test/cli.js test --config ui/playwright.config.ts ui/e2e/smoke.spec.ts
```
Expected: four zeros, a build in about half a minute, smoke 1 of 1. Anything else is a new-host finding, recorded before Unity is opened.

**D. External inputs that are not in any repository (carry or declare MISSING-INPUT)**
- The genuine Save48 captures (`P16_JOIN_CLOSED48_PATH`, `P16_JOIN_PREC48_PATH` and their sha256 in the lane env file `studio-scratch/p16-c03-sprint1-20261025/p16-env.sh`; manifest `studio-scratch/1370-astra-takeover-20261012/p16-original48-closure-capture-r2-run/CAPTURE-MANIFEST.json`, sha256 cd11f369… / c17b7aa8… / 94fa74df…): needed by the Sprint 24 journeys and the P16 closure tests. Copy them to the new machine and re-point the env file; verify the sha256 before use. Without them those suites are MISSING-INPUT, as they already are on every baseline for the three r3n1 dense fixtures.
- The P13A review library that `scripts/gen-playmode-embedded-wire.mts` reads from `/Users/bruce/The Movies - P13A Synchronized Sound TS/artifacts/p13a/review-library/generated-review-library.json` (sha e65fe9c9…, 1,959,182 bytes): not present on this Mac either. Regenerating the PlayMode wire manifest (M7) needs it or a decision to re-source the manifest; declared MISSING-INPUT now.
- The lane tooling (bind.py, launch.sh, run.sh, compare-full.py, equipment-run-preflight-r3.py, lane-run-r8.sh) lives in `studio-scratch/astra-20261029/<lane>/` and is copied into the records under each sprint's `lane/`; restore it from the records (sprint27/lane/sprint27-r2/) and adjust the preflight's disk, power and lock paths for the new machine.
- The Sprint 26/27 baselines for classification: `full-tree-s26-r1/core-including-bridge.json`, `sprint20-r3/bridge-tests.json`, `sprint27-r2/bridge-tests.json` (all in the records under their sprint folders).

**E. Unity first open (Owner at the keyboard or the coordinator with the Owner's consent)**
- Open the project once in the editor at 4c41676: the package manager resolves the registry packages and the one git dependency (`com.coplaydev.unity-mcp` at `#v10.1.2`, needs network and `git`). Do not upgrade anything the manifest pins; do not accept an editor-version migration.
- The "Library" import takes minutes; `Assets/Studio/Generated/*` (lighting, navigation, collision, materials) is committed, so no bake is expected before compile. If the console shows the `BakeAll` prerequisites missing, that is an M1 finding, not something to run blind.

**Verification of the setup**: the step C outputs recorded in a new records folder `astra-sprints-22-26/new-host-20xx-xx-xx/SETUP-RECEIPT.md` with `node -v`, the four exit codes, the build sha, the smoke result, the Unity editor version from `ProjectVersion.txt` and the package resolution outcome. Nothing is pushed from this step except the receipt.

## 2. Current capability matrix (what exists at 18c3e8cf × 4c41676)

Classes: **VERIFIED** = executed on this Mac with recorded evidence; **STATIC-UNRUN** = source paired and reviewed, never compiled or run (the Owner has said this is not native qualification); **PARTIAL** = part of the route exists; **MISSING** = no source; **BLOCKED** = cannot proceed without the new host or an Owner decision.

| Capability | Core engine | Bridge wire | Browser client | Native client | Class (native) | Evidence |
|---|---|---|---|---|---|---|
| Found a studio, hire, commission, cast, greenlight, produce, release, autopsy | yes | yes (snapshot, displayed intents, casting/production quotes) | yes | workspaces exist (Founding, Casting, Production, ReleaseResult, Finance, History, Roster, Profile, Build) | STATIC-UNRUN since projection 32 → 71 retypes (Sprint 15 a010cd5) | sprint16 smoke, eight Sprint 26 journeys; p16-sprint15/RESULTS.md |
| Two-gesture confirmation bound to option identity (decision E) | n/a | projection 70+, `confirmation` on every option | browser already asks twice on cancel/commit | `StudioBridgeClient.ConfirmedIntent` / `.DisplayedIntent`; release memo arming | STATIC-UNRUN; ACCEPTANCE OPEN (classic memo one-click rendering of new destructive intents) | bridge-astra20 tests; Sprint 22 |
| Loan (quoted, shortcut confirmed) | yes | quote family `loan` | yes | `StudioLoanQuoteSnapshot`/request DTOs only; **no native quote driver** (the validator switch in StudioBridgeProtocol.cs 173-195 knows only commission, casting, placement, set-commission and contract; a loan quote would raise a protocol mismatch) | PARTIAL (DTOs) | p15b5-loan-choice; Explore report 2026-10-31 |

Correction to the record: sprint27/RESULTS.md ("What still needs native client implementation") and the §6 report of 2026-10-30 say the native client has "the quote drivers for the loan and the season". It does not; it has the DTOs. The five working native quote families are commission, casting, placement, set-commission and contract. The records fix is a one-line erratum in sprint27/RESULTS.md and a LEDGER note, to be written when plan mode ends (not in this plan).
| Release commit (confirmed) | yes | confirmation=required | yes | release memo arm + confirm | STATIC-UNRUN | Sprint 22 |
| Rights inspection (paid diligence) | yes | quote family `diligence`; view `diligence` | yes (Rights desk) | DTO kinds only; generic option rendering; no surface | PARTIAL | bridge-p16; astra18 journey |
| Acquisition (absorb a studio) | yes | quote family `absorption` | yes | DTO kinds only; generic rendering | PARTIAL | p16c-acquisition; astra24-acquisition |
| Estate inspection, bid, closed-estate disposition | yes | **view `estates`, quote `quoteEstateBid` → `submitEstateBid` (Sprint 27)** | yes | `QueryEstates` read method only (4c41676); no surface, no quote driver | PARTIAL (wire VERIFIED on the engine side: bridge-astra27 12/12, lanes r1/r2) | sprint27/RESULTS.md |
| Title sale: offer, accept, reject, withdraw, licences, decision B disclosure | yes | **view `rights`, quote `quoteRightsOffer` → `makeRightsOffer`/`acceptRightsOffer`; one-gesture reject/withdraw/purchase-accept (Sprint 27)** | yes | `QueryRights` read method only; no surface, no quote driver | PARTIAL (wire VERIFIED engine side) | sprint27/RESULTS.md |
| TV season commission, cancel, settle (P18) | yes | quote `tvCommission`; confirmation kinds for cancel/settle; view `television` | yes (Assembly; Dashboard season row) | `QueryTelevision` read method; DTO kinds; generic rendering; no commission driver | PARTIAL | p18 suites; p18-season journey |
| P17 continuation and featured guests | yes | casting draft fields; `cancelFeaturedBooking` confirmation | yes | continuation authority helpers; `QueryFeaturedAppearances`; no featured-booking surface | PARTIAL | p17 suites; p17-continuation journey |
| Decision B estate claims at closure | yes (Sprint 23 closure/v2, ratified Sprint 27) | `estates` view claims rows | yes (closed-studio history) | none | PARTIAL (read-only rows exist on the wire) | sprint23, sprint27 ENTRY §2 |
| Save/load, portable saves (Save51) | yes | runtime checkpoint; prior roster through outgoing70 | yes (export/import) | `StudioSavedSlotIntegrationTests`, snapshot loader | STATIC-UNRUN; two expected PlayMode failures (unreproducible projection-32 wire manifest) | sprint19; bridge-runtime-checkpoint tests |
| Native compile, EditMode, PlayMode, build, hands-on input | — | — | — | never run since Sprint 15 began | **BLOCKED** (host) | p16-sprint15/RESULTS.md "What a Unity-capable host must run" |
| CF09 attestation (`--attestation-output` with EditMode result and log) | — | script `scripts/verify-bridge-contract-consumer.ts` | — | — | **BLOCKED** (needs the EditMode run) | sprint27 PAIR-VERIFICATION (seal only) |
| Browser playtest verdict | — | — | running at 18c3e8cf | — | **BLOCKED on the Owner** | playtest-20261030/ |

Inherited test baseline (not repaired by any sprint, preserved): 95 core and 2 ui cases pre-program; the Bridge lane at b2b4bdd9 shows 33 INHERITED-SAME rows (p14b5 family 12, p12 timeouts, p06, p14b2, p14c2rm, p13, p14c3, owner-ux pins). The Owner has not accepted this baseline for release.

## 3. The first three milestones (detailed)

Each milestone is one bounded Owner order; this plan does not start any of them. Native files are under `Assets/Studio/` in the Unity worktree; engine files under the engine worktree. Every milestone ends with: a records entry (ENTRY, RESULTS, REVIEW), the LEDGER line, HANDOFF item, a CF09 pair seal when the contract or its consumer changed, both branches pushed and remote-verified, PR #20 still draft.

### Milestone 1 — a compiling, tested native baseline (no feature work)

Goal: turn STATIC-UNRUN into executed evidence for the client as it stands at 4c41676 × 18c3e8cf.

Inputs: the setup receipt; the Sprint 15 list "What a Unity-capable host must run" (p16-sprint15/RESULTS.md); the commands recorded in the Unity repo's `EXPERIMENT.md` 48-95 (paths there are `/Users/bruce/…`; substitute the new checkout). `P` = the Unity project path, `U` = the editor binary, `EV` = a non-symlinked evidence directory outside both repositories (the attestation verifier requires exactly that).

Steps:
1. **Compile**: `"$U" -batchmode -nographics -projectPath "$P" -quit -logFile "$EV/compile.log"`; zero `error CS` lines across Runtime Data, Infrastructure, Presentation, Editor, Tests.EditMode, Tests.PlayMode. Any compile error is a defect in the Sprints 15 to 27 static adaptations (code written without a compiler); repair the smallest demonstrated cause on sprint15-consumer-20261028, one commit per cause, with the error text in the commit message; never hand-edit `Assets/Studio/Runtime/Data/Generated/*` (regenerate from the engine instead and reseal).
2. **EditMode**: `"$U" -batchmode -nographics -projectPath "$P" -runTests -testPlatform EditMode -testResults "$EV/contract-gate-editmode.xml" -logFile "$EV/contract-gate-editmode.log"` (exact file names; no `-quit`). Expected from Sprint 15's static analysis: `StudioBridgeGeneratedUnionFixtureTests` all pass including the sentinel `F12_ProductionStateUnionRoundTripsAllMembers`; `StudioOwnerUxCommissionTests` four methods (lines 160, 255, 307, 369) fail because their hand-built profiles lack the five required blocks added since projection 32. Every other failure is NEW and is classified: a defect in the blind adaptations (repair, bounded), or an inherited pre-Sprint-15 failure (record, preserve; the old `editmode-wave7b.xml` of 2026-08-26 at 446/446 is the last known green native run, before the retypes). No list of expected native failures exists in either repo beyond Sprint 15's analysis; M1 writes that list from the actual run.
3. **PlayMode**: `-testPlatform PlayMode -testResults "$EV/playmode.xml"`. Expected: `StudioLaboratoryBootstrapOrderTests` and every suite that reflects on its embedded wire (about fifteen, e.g. `StudioDisplayedSigningHostTests` 65) fail at the schema check, because `Tests/PlayMode/generated-wire.manifest.json` pins projection 32 / schema b3a76d19… while the client is projection 71 / 3ce933d7…; `StudioDisplayedProductionOperationTests` 213 fails on a hand-built profile. Record counts; no repair in M1 (Owner decision 4; regeneration is M7 and needs the MISSING-INPUT review library).
4. **Build**: `"$U" -batchmode -nographics -projectPath "$P" -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS -logFile "$EV/build.log" -quit` → `Builds/macOS/Project Studio Visual Spike.app` (scene `Assets/Studio/Scenes/StudioLot.unity`, StandaloneOSX; `StudioAutomation.cs` 124-152). The admission variant `StudioPlayabilityBuildAdmission.VerifyAndBuildMacOS` needs `-studioFailedImports` with the 24 `Char_*.glb` paths; use the plain `BuildMacOS` unless the console demands the admission. Record the app's sha256 and size; builds are never committed.
5. **Run through the trusted launcher**: from the engine checkout `npm run play` (`PLAY_PROJECT_STUDIO.command`: `scripts/build-studio.mjs`, `scripts/audit-studio-packaged.mjs`, then `node dist/studio/studio.mjs --unity-project "$P"`). The supervisor spawns the Bridge on `127.0.0.1` with a random port and a 32-byte capability, then Unity with `PROJECT_STUDIO_BRIDGE_URL` and `PROJECT_STUDIO_BRIDGE_CAPABILITY` (`supervisor.ts` 512-722); logs land in `~/Library/Application Support/Project Studio/`. First checks: the engine ready line `[bridge] live http://127.0.0.1:<port> protocol=4 schema=sha256:3ce933d7…`; the client does not show "Studio data is incompatible. Restart it from the trusted launcher." (protocol mismatch, `StudioBridgeClient.cs` 1899-1909); if `dist/studio/studio.mjs` fails to parse on Node 20 because of the `node24` esbuild target, that is the first demonstrated engine-side blocker of the native alpha (repair: align the target with the pin, engine commit, lane).
6. **Hands-on minimum (Sprint 15 item 5 and the Sprint 20/22 ACCEPTANCE OPEN items)**: found a studio; advance a week; open Industry people activity rows (no "Open studio" for null ids); a casting or contract quote with fractional cash renders; which intent kinds the classic memo shows as one-click buttons (list them; decision 2); the release memo two-gesture arm and confirm on a Release Ready picture; a save slot write, quit, relaunch, continue (durable profile); text-size and gamepad focus suites as PlayMode covers them. Screenshots and the three logs into `EV`.
7. **Attestation (the first real one)**: after the EditMode run and an independent hostile review of the client at its M1 commit (the one focused review; verdict ACCEPT required by the script), from the engine checkout at the sealed commit:
   `vite-node scripts/verify-bridge-contract-consumer.ts --typescript-root "<engine>" --typescript-commit <sha> --typescript-ref refs/heads/p18-season-20261028 --typescript-remote origin --unity-root "$P" --unity-commit <sha> --unity-ref refs/heads/sprint15-consumer-20261028 --unity-remote origin --editmode-result "$EV/contract-gate-editmode.xml" --editmode-log "$EV/contract-gate-editmode.log" --hostile-review-verdict ACCEPT --attestation-output <path outside both roots>`; then `--verify-attestation` on the written file with `--evidence-root "$EV"`. The XML must be NUnit with `Studio.Tests.EditMode.StudioBridgeGeneratedUnionFixtureTests` Passed and the F12 sentinel (`bridge-contract-consumer-lock.ts` 36-40, 1608+). Attestation version 2 records no save version (Owner decision 8b of 2026-10-28), so Sprint 15's "19 vs Save51" question is moot for the record and stays open only for the UI copy.
8. **Records**: `new-host/M1/RESULTS.md` with the compile result, the EditMode and PlayMode counts with the classified failure list (expected-by-Sprint-15, NEW-repaired, inherited), the build receipt, the run log excerpts, the attestation path and sha, and the exact native findings for decision 2. Any Unity commit → CF09 seal rerun; any engine commit → the Bridge lane with classification against sprint27-r2 and full-tree-s26-r1 (and that lane is the first chance to observe the handoff-freeze configuration under a lock; §6).

Exit: compile 0; EditMode failures all classified with the Sprint 15 four as the only expected ones unless the run says otherwise; a built app; one supervised run reaching a saved and reloaded campaign; the attestation written and verified. Anything short of that is reported as PARTIAL with the exact missing item, never rounded up.

### Milestone 2 — the Rights desk on the native client (the first missing screen and quote driver)

Goal: the native player can open a Rights page, read held titles with the sale law, see offers with the close law, reject or withdraw with one gesture, accept a purchase with the two-gesture confirmation, and sell a held title through the quoted, disclosed route. Everything shown comes from the `rights` Industry view and the `quoteRightsOffer` family that Sprint 27 put on the wire; no native rule.

Reuse (the client's existing pattern; no new architecture):
- The quote path template is the contract family: `Runtime/Infrastructure/StudioBridgeClient.cs` 842-927 (`RequestContractQuote`, `PostContractQuote`, the three events and the in-flight flag) and `StudioBridgeClient.DisplayedIntent.cs` 58-101 (`RememberDisplayedContractQuote`, `IsCurrentDisplayedContractQuote`, `SubmitDisplayedContractQuote`) with the typed slot on `DeferredDisplayedIntent` (22-38) and the branch in `TryTakeDeferredDisplayedIntent` (279-297). Casting's inline request build (605-633) is the model for a family without a `StudioBridgeJson` helper; casting also shows a snapshot with several `kind` values, as rights has (`makeRightsOffer`, `acceptRightsOffer`).
- The view read is already there: `StudioBridgeClient.IndustryViews.cs` `QueryRights` (26) through `QueryNullTargetView` (33-55); `StudioIndustryResponse.rights` (Generated 8211).
- The review-then-confirm surface is the Laboratory pattern: `Runtime/Presentation/UI/StudioLaboratoryWorkspace.cs` 145-249 (`Maintain` re-queries and re-checks `MatchesAuthority`; a "Review decision" section; `Confirm` mints a command id and calls `client.SubmitDisplayedIntent(action.intent, …)`; `TryBack` cancels a deferred intent). The host side is `StudioWorkspaceHost.Laboratory.cs` 8-59 (`OpenLaboratory`, `ResetWorkspaceRouteFlags`) and `StudioWorkspaceHost.DisplayedContract.cs` (the `Maintain…`, `Abandon…`, `Clear…Tracking` trio called from `Update` at `StudioWorkspaceHost.cs` 216-228).
- The DTOs exist at projection 71: `StudioRightsPage` (Generated 13218), `StudioQuoteRightsOfferRequest` (12377) with the `StudioRightsOfferDraftPayload` union (13048, plan `offer`/`accept`), `StudioRightsOfferQuoteSnapshot` (13054), discriminator `StudioBridgeQuoteRequestTypeValues.QuoteRightsOffer` (590-604).

Work, in order:
1. **Validator**: a `case StudioRightsOfferQuoteSnapshot` in `Runtime/Data/StudioBridgeProtocol.cs` 173-195 and its partial `NormalizeAndValidate()` beside the five existing ones (197-343): required `intentId`, `commitLabel`, `kind` in {makeRightsOffer, acceptRightsOffer}, `plan` consistent with `offerId` (accept) or `subject`+`counterpartyId`+`price` (offer), `consequence.digest` present when `playerSells`.
2. **Client family**: `RequestRightsOfferQuote(draft)` / `PostRightsOfferQuote` and the three events in `StudioBridgeClient.cs`; the displayed-quote trio and the deferred slot in `StudioBridgeClient.DisplayedIntent.cs`. The quote's `intentId` is committed through the ordinary `SubmitIntent` path (928-944), exactly as contract quotes are; the Bridge refuses a stale disclosure itself (`rightsOfferDraftApply`), so the client only has to show `consequence` before enabling the confirm.
3. **Rights page**: a `rights` branch in `StudioIndustryWorkspace.Render` (131-208) plus a tab beside studios/films/pulse (62-64), or a `StudioRightsWorkspace` opened from the Finance or Industry host the way `OpenLaboratory` is; sections mirror the browser `ui/src/screens/RightsDesk.tsx` (Titles you hold 328, Offers 334, Licences you hold 341, Other studios 351): title rows show `saleRefusal` voiced from the wire's token (the Bridge already sends the browser's sentences), `value`, `encumbrance`, `resaleHoldback`, `licencesOut`, `liveSeasonIds`; offer rows show `refusal`/`closing`, and render `acceptIntent`, `rejectIntent`, `withdrawIntent` only when non-null (the Bridge omits the accept intent when `saleReviewRequired`); a purchase accept carries `confirmation=required` and goes through the two-gesture arm (`StudioBridgeClient.ConfirmedIntent.cs` 27-129 for IMGUI memos, or the Laboratory review step for UI Toolkit).
4. **Sell and disclosed accept**: an "Offer for sale" form (counterparty from `counterparties`, price) → `quoteRightsOffer` plan `offer`; an "Accept with review" on a buy offer of a held title → plan `accept`. Render the snapshot: `willingness`, `expiresWeek`, `licences`, and the `consequence` block (`seasons` before/after, `answer`, `reachesWeek`) with the exact browser sentence for no live season. Confirm enabled only on `ok && IsCurrentDisplayedRightsOfferQuote`.
5. **Host wiring**: wrappers near `StudioWorkspaceHost.cs` 1351-1375, subscribe/unsubscribe near 2750-2790, a `StudioWorkspaceHost.DisplayedRightsOffer.cs` partial modelled on `DisplayedContract.cs`, `Maintain…` in `Update`, route flag in `ResetWorkspaceRouteFlags`.
6. **Tests (EditMode)**: a rights wire fixture captured from the engine (bridge-astra27 world; recorded by a small engine script in tests/helpers, not hand-written) under `Tests/EditMode/Fixtures/` with an accessor in `StudioCurrentBridgeTestFixtures.cs`; `StudioBridgeProtocolTests` `QuoteEnvelope` cases for both kinds and the historical-payload rejection; `StudioBridgeGeneratedUnionFixtureTests` round trip of the new request and snapshot members (today only commission and casting); `StudioDisplayedIntentTests` changed-authority matrix for the rights quote (session, revision, digest, week, replaced quote); a `StudioConfirmedIntentTests` case that `acceptRightsOffer` with confirmation=required arms and does not send.
7. **Verification**: compile 0; EditMode suite with the new tests green and the known expected failures unchanged; a hands-on run against the Bridge on the Sprint 27 test world (the engine's `tests/helpers/p18-season-world.ts` builder or the owner-saves p18 world imported through the supervisor's campaign path) walking: open Rights → offer the live-season property to the rival at valuation → read the disclosed cancellation → confirm → advance two weeks → the season row shows the cancellation the quote disclosed; and the refusal path (price above the rival's bid → `willing:false`, confirm disabled). Record screenshots and the Bridge log. Engine-side nothing changes, so no engine lane; CF09 seal rerun because the consumer changed.
8. **Not in M2**: licence offers, buy offers by the player (core-only, per coordinator reading 1), estates (M3), television (M4).

### Milestone 3 — Estates on the native client (second screen and quote driver)

Goal: the native player can inspect open estates (lots, subjects, minimum, encumbrances), place a sealed bid through the quoted route, and read the closed estate's disposition and claims.

Reuse: the same five-step family pattern as M2 (validator case for `StudioEstateBidQuoteSnapshot` Generated 5994; `RequestEstateBidQuote` with `StudioQuoteEstateBidRequest` 12229 and draft `StudioEstateBidDraftPayload` 5980 {estateId, lotId, amount}; displayed-quote trio; host partial `DisplayedEstateBid.cs`); the `estates` view through `QueryEstates` (IndustryViews.cs 30); `StudioEstatesPage` (6187). Browser mirror: `RightsDesk.tsx` 281-305 (`LotRow` with the bid input) and 357-370 (Estates, Closed estates).

Work: (1) validator case (`ok`, `refusalReason`, `minimumBid`, `closesWeek`, `spendableBefore/After`, `reserve`); (2) client family and displayed-quote trio; (3) an Estates section on the Rights page (or a second tab) listing `StudioEstateRow` with `lots[]` (`minimumBid`, `encumbrances`, `myBid` status sealed/won/lost/disqualified with `disqualification`, `bidRefusal` voiced, `sale` when closed) and `claims[]` (employment, tvRefund, tvCharge with count/paid/unpaid: the decision B rows); (4) a bid form (amount) → quote → render minimum, closes week, spendable after, refusal → confirm (`submitEstateBid` is one quoted commit; no second confirmation beyond the quote review, matching the browser's single Bid button); (5) tests as in M2 step 6 on an estate fixture captured from the actual R04 closure world (the `actualEstateClosure()` helper the Sprint 27 test uses; the genuine Save48 captures stay outside the repositories as before); (6) hands-on: bid on the Sprint 27 lot (`studio-closure-1:rights-lot:1`, minimum 9,528) in week 163 to 176, advance to the ceremony, read won/lost and the sale. CF09 seal rerun.

M2 and M3 together close the "no native surface" rows of the Sprint 25 matrix for §7's two gap routes; the engine side of both is already VERIFIED by Sprint 27.

## 4. Roadmap after milestone 3 (each needs its own Owner order; none is authorized by this plan)

| Later milestone | Content | Depends on |
|---|---|---|
| M4 Television on the native client | a season commission driver over `quoteTvCommission`, the `television` view surface (series and season rows with the cancel and settle previews, two-step cancel as the browser does) | M1 green baseline; **[FEEDBACK]** on whether the browser season flow reads well |
| M5 Acquisition and diligence surfaces | bespoke surfaces for the `diligence` and `absorption` quote families (today generic option rendering only) | M2 rights surface patterns |
| M6 P17 continuation and featured guests | the featured-booking surface and `cancelFeaturedBooking`; continuation and cameo inputs at greenlight | M1; p17 fixtures |
| M7 Native save/load parity | Save51 round trip native ↔ browser (export from Unity, import into Chrome and back); regenerate the PlayMode wire manifest with `scripts/gen-playmode-embedded-wire.mts` so `StudioLaboratoryBootstrapOrderTests` stops being an expected failure | M1; Owner decision 4 (attestation save-version semantics) |
| M8 Alpha hardening | the Sprint 15/20/22 ACCEPTANCE OPEN items closed by decision; text size, gamepad, focus and return regressions re-run (existing PlayMode suites); a native alpha build handed to the Owner with the same five-task route as the browser invitation | M1 to M7 |
| Release candidate | PR #20 out of draft only on the Owner's promotion order; inherited baseline accepted or repaired by a separate order | the Owner |

## 5. Owner decisions this plan needs (each one line; defaults stated so work is not blocked)

1. **Unity licence and install on the new laptop**: a Unity Hub install of 6000.3.22f1 with the macOS Build Support module is required; the Owner performs the install and sign-in (the coordinator never installs toolchains or creates accounts). Default if silent: M1 cannot start.
2. **Classic memo one-click rendering of destructive intents** (Sprint 15 ACCEPTANCE OPEN): the native memo lists every intent not withheld as a one-click button; projection 70+ marks `takeLoan`, `commitPictureToRelease`, `cancelPhysicalPlan`, `acceptRightsOffer`, `cancelTvSeason`, `settleTvObligations`, `cancelFeaturedBooking` as confirmation=required. Recommend: the native memo honours `confirmation` (two gestures) for every option the wire marks required; nothing else changes. Default: recommended reading.
3. **Native scope of the first alpha**: rights and estates (M2, M3) before television (M4) and acquisition (M5), as the Owner's order lists. **[FEEDBACK]** may reorder this; marked, not assumed.
4. **Attestation save-version semantics** (Sprint 15 ACCEPTANCE OPEN: 19 vs Save51 in the attestation record) and the unreproducible PlayMode wire manifest: regenerate the manifest from the current engine (M7) or keep the two expected failures as recorded. Default: keep as expected failures through M3, regenerate in M7.
5. **Where the native alpha binaries live**: the play command expects `<engine parent>/Project Studio - Unity Production Convergence 80H/Builds/macOS/Project Studio Visual Spike.app`; builds are not committed. Default: local only, never pushed; a build receipt (sha256, Unity version, source commits) goes to the records.
6. **Playtest verdict and promotion**: unchanged; KEEP, REVISE or REJECT after playing; PR #20 stays draft.

## 6. The handoff-freeze configuration change (recorded accurately)

During the browser launch preparation (2026-10-30, 20:49 to 20:57 CDT) the coordinator found that `~/.claude/state/handoff_guard_projects.json` listed the records root and the specialist roots but not the engine worktree `/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt`, so the HEAVY-LANE-LOCK write blocker never deferred the AUTO-block stamp for that worktree; that is the demonstrated cause of Sprint 27 lane r2's final-source-integrity exit 1. The worktree root was added to `roots` (the previous file kept as `.bak-20261030`; hook code untouched). This is a configuration change with a read cause, **not a proven protection**: no lane has run under it. It will be established, or not, by the first recorded lane after the change (M1's engine-side gate), whose integrity stage must show HANDOFF.md unchanged while the lock exists. Sprint 27's recorded integrity failure stays as written. Sprint 27 is not rerun to prove it. On the new laptop the same file must list the new engine worktree path, or the same failure recurs.

## 7. Feedback-dependent priorities (marked, not filled)

The Owner is playing the browser candidate now. Until a KEEP, REVISE or REJECT and the four requested observations arrive, these stay open and nothing here guesses them:
- **[FEEDBACK]** Whether the production loop is enjoyable decides whether M2/M3 (rights, estates) keep their place ahead of M4 (television) and M5 (acquisition), or whether a browser REVISE on the core loop comes first and the native alpha waits.
- **[FEEDBACK]** Where the Owner did not know what to do next names the copy and the "next action" surfaces the native client must present better than the browser does; today the native Dashboard analogue is the memo and rails (StudioHud, StudioProductionRailHud); no change is planned until the feedback names a place.
- **[FEEDBACK]** Unclear actions or consequences on the Rights desk (the reason sentences, the sale disclosure) feed M2's sentence set directly; the native page reuses the Bridge's wire sentences, so a browser copy fix propagates by itself and no native copy is authored separately.
- **[FEEDBACK]** Anything that failed, stalled or rendered wrongly in the browser becomes a repair candidate under its own bounded order before, not inside, M1.
- A REJECT reopens the plan at section 3; a REVISE edits the milestone it names; a KEEP changes nothing here except removing these markers.

## 8. The exact first action on the new host

After the Owner's installs (§1A) and nothing else: run §1B and §1C verbatim, write `SETUP-RECEIPT.md`, then open the Unity project once (§1E) and read the console. The first coordinator decision is made only on the actual compile output: zero errors → M1 step 2; errors → M1 step 1 repairs. No native work, no feature, no fixture regeneration happens before that receipt exists. Nothing in this plan starts without a new Owner order naming the milestone.

## 9. What this plan does not do

No installation, test campaign, framework, cleanup, implementation, main merge or automatic execution. Sprint 27 is not rerun. The browser preview, build, saves, branches and dependencies on this Mac stay as they are while the Owner plays. The records erratum (the loan/season driver sentence) and the §6 note are written to the records only after plan mode ends and under the existing records authorization.

## Rules carried into every milestone

- One coordinator writer; subagents Opus 5.5 at most, never a Fable fork; reviewers read-only; one focused independent review per consequential change.
- Git: `-c gc.auto=0 -c maintenance.auto=0 --no-optional-locks`; no reset, stash, clean, force push or squash; fresh run directories; restore the hook-stamped HANDOFF.md before commits; commits end with the Claude Fable 5.1 co-author line.
- Generated DTOs and fixtures only through `npm run generate:bridge-contract` and `generate:bridge-contract:fixtures`; pins read from the regenerated manifest and standalone measurements, never copied from failures.
- Preserve inherited failures, missing inputs and budgets; classify every lane against the Sprint 26 gate (full-tree-s26-r1) and the latest Sprint 27 lane by identity (compare-full.py).
- The Sprint 26 tag and the Sprint 27 checkpoint stay immutable; new work publishes to the candidate lineage (p18-season-20261028 and sprint15-consumer-20261028), never to main; PR #20 stays draft until the Owner says otherwise.
- Never claim Owner acceptance; a passing automated journey is not a verdict.
