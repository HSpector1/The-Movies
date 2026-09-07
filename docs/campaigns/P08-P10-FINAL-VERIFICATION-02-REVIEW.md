<!-- Independent review of P08-P10-FINAL-VERIFICATION-02.md — produced verbatim by the phase-2 review workflow
     (wf_7957fa0e-1fc: four lenses → adversarial refutation of every BLOCKER/MAJOR → one synthesising final reviewer),
     inheriting the phase-1 lens reports (wf_b88d9a71-488). The implementing lead did not edit the text below; the lead's
     responses to the conditions in §5 are recorded in P08-P10-FINAL-VERIFICATION-02.md (§0 and the §4.1 disclosures)
     and in the handoff C11. Written 2026-09-07 ≈18:25Z. -->

# P08–P10 FINAL-VERIFICATION-02 — independent review disposition (final reviewer)

**Object under review:** `/Users/bruce/The Movies - P08-P10 Stack TS/docs/campaigns/P08-P10-FINAL-VERIFICATION-02.md` as committed at `22e82bb` (2026-09-07T17:42:28Z), the pair-2 evidence index `docs/campaigns/evidence/P08-P10-FINAL-VERIFICATION-02-evidence-index-pair2.json` (same commit), and the pair-2 evidence under `/Users/bruce/The Movies - P08-P10 Stack Unity/Evidence/*-FinalVerification02-Rebuild/`. Pair 2 = Unity `574339da31` / exe `f678cf539d067ab562d064458f6aef316fe61fabf0ba87cbf2c92e670ca9a9b0` / engine `189326b6…`. Every gate below is judged on pair-2 files only; pair-1 dirs are diagnosis history.

**Method (read-only, nothing launched):** file reads, `git` read-only in both worktrees (incl. live `ls-remote`), `shasum`, my own Python parses of all 46 sweep bindings + sidecars, all 7 pair-2 drive reports / run-bindings / `hid-witness.jsonl` logs, the pair-1 diagnosis runs cited by §3.5, the EditMode XMLs, `tabulate-fv02.py --pair 2`, and three screenshots opened as images. No Unity, player, launcher, `ownerinput` or `hidwitness` was started. Phase-1 lens reports and the phase-2 lens reports are inherited; the roof-correction geometry (Stage A / placed-body bands, navmesh tiles, semantic scene diff, oracle self-check) was re-derived by phase-1 lens 1 and again by phase-2 lens 1 and is **not** re-derived here.

**State of the record at review time (must be disclosed):** the TS working tree is dirty with two docs files — the handoff C11 entry and the record itself (`git diff --stat 22e82bb -- docs/` = +33/−2 on the record: a "Disclosures that belong with the table" block after §4.1 and two §5 rows). Those uncommitted lines respond to the phase-2 lenses; I verified their factual content where it matters (the whole-log witness counts equal my own parse exactly) but they are **not** the committed record and are treated below as corrections in flight. The Unity branch gained `3226130` (tools-only: `Tools/hid-guard.mjs` +35/−1, 18:09Z, pushed) after every pair-2 run; `git diff --stat 574339da31..HEAD -- Assets` is empty.

---

## 1. Identities and protections verified on disk

| Item | Verified value |
|---|---|
| Player exe | `f678cf539d067ab562d064458f6aef316fe61fabf0ba87cbf2c92e670ca9a9b0` (my `shasum` of `Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/…`) = manifest |
| Assembly-CSharp | `75217bf0b00da3b3d855a5205e8d03b93569346b09f60c0ddb3fe1f5c58b9110` = manifest |
| Engine bundle | `189326b6fbd769bc9650d0ed43b92c9ba75c78565958f3074f4d5645605d065e` at TS `dist/studio/engine.mjs` and at `~/Desktop/P08-P10-Combined-Candidate-f536308-574339d/engine/engine.mjs`; identical in all 46 sweep bindings, 7 drive bindings and the camera-proof binding |
| Scene | `1662991108a1b8cfabe00651c2e8f6be42a33af3313ecb76b058d1bcb08bc9c6` = every drive binding's `sceneSha256` |
| Manifest `Builds/macOS/build-manifest.json` | generated 17:10:32Z, `unity.sha 574339da31…` `dirty:false`, `typescript.sha f536308… dirty:true` (docs only — see MINOR 9) |
| Unity chain | `git diff --stat 75de360..HEAD -- Assets` = `StudioWorkspaceHost.cs` (+24/−2) + `StudioPlacedBodyOcclusionTests.cs` (+1) + `StudioSelectionOcclusionTests.cs` (+5/−3) + `StudioSystemMenuTests.cs` (+63); `574339da31` committed 17:10:16Z; `41d94eb` 17:33:09Z and `3226130` 20:09:07Z (+02:00 = 18:09Z) are Tools-only |
| Remotes (live) | TS `hspector-github`: `campaign/living-lot-ts` `2753e18b…`, `main` `c902a704…`, `wip/p08-p10-final-verification-02-ts` `22e82bb`; Unity `origin`: `campaign/living-lot-client` `c4c65db4…`, `wip/p08-p10-autonomous-stack-01-client` `039ece4`, `wip/p08-p10-final-verification-02-client` `3226130`; the Unity remote advertises no `main` |
| Owner profile | `~/Library/Application Support/Project Studio/bridge-runtime/bridge-runtime-v1.json` = `d949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b`, mtime 2026-09-01 21:46:56, mode 0600 |
| Control player | `Builds/control-ab1fa09b-f760d5d/…` = `ab1fa09bfd1b8da00aeab32bfc85c9208a53ae460f0c6c92ce70439439e212f1` |
| Pair-2 candidate | `~/Desktop/P08-P10-Combined-Candidate-f536308-574339d`: player `f678cf53…`, engine `189326b6…` (re-hashed) |
| Tool provenance per drive | driver hashes: `172023Z` `bafc5d9e…` and `172423Z` `ea9e5d83…` and `171809Z` `1b812645…` = blobs at `d849a43`/`574339da31`; `172822Z` `b116bece…`, `173250Z` `de1a375b…`, `173427Z` `464c0a4b…` = blobs at `41d94eb`; **`172645Z` `949aea92…` = no committed revision** (all 16 revisions of `Tools/p10-proof-contract.mjs` hashed); guard `f0a383c5…` (= `d849a43`…`41d94eb`) in all 7; witness source `0a46aaab…` in all 7; `driverSourceUnchangedDuringRun: true` in all 7; `hid-witness.jsonl` present in all 7 |

---

## 2. (a) The 33 prior findings — final disposition

All 33 lead dispositions are **AGREED**. Phase 1 disagreed with B/N14 (and lens 1 marked several as "not re-done"); those were time-bound and are superseded by the pair-2 files. My evidence per item:

| # | Lead's disposition | Final | Evidence I checked |
|---|---|---|---|
| A | CONFIRMED (doc), row corrected | AGREE | Inherited from phase-1 identities lens (P09-Placement-Final bindings `65dfe3a9/c71ffff` vs `ab1fa09b/f760d5d`); two-repairs record lines 178-179 read |
| B | CONFIRMED at review time; WITHDRAWN as a gap | AGREE (now) | PEOPLE `hid-20260907T172822Z` status complete 0/41; CONTRACT `hid-20260907T173250Z` complete 0/30; BUILD `hid-20260907T173427Z` complete 0/49 — each bound to `f678cf53…/574339da31/189326b6…` (my parse) |
| C | CONFIRMED + FIXED (`df79153`) | AGREE | Inherited geometry (phase-1 lens 1, phase-2 lens 1); `editmode-runA-oldcode-20260907T125501Z.xml` 17/11/6; `editmode-fixF-full-20260907T170930Z.xml` 900/900 (my XML parse) |
| D | CONFIRMED, limitation preserved, prospective capture | AGREE | `input-state-start.json` / `input-state-end.json` `{clean:true}` in all 7 pair-2 drive dirs |
| E | CONFIRMED + FIXED | AGREE | Inherited raytest/oracle reproduction; scene blob unchanged 75de360→574339da31; scene sha bound in every pair-2 drive |
| M1 | = D | AGREE | as D |
| M2 | CONFIRMED → launchers write engine sha | AGREE | 46/46 sweep bindings and 7/7 drive bindings carry `engineBundleSha256 189326b6…` (my parse) — phase-1's "hid launchers wrote no engine field" caveat is closed |
| M3 | CONFIRMED (doc) | AGREE | Stands; the class recurs a third time on pair 2 (MINOR 1 below) |
| N1 | CONFIRMED (doc) | AGREE | `git diff a2baa1d..HEAD` (TS) = docs only |
| N2 | CONFIRMED (doc) | AGREE | Inherited |
| N3 | CONFIRMED → 700 | AGREE | Inherited; pair-2 dirs 700 (lens 2) |
| N4 | CONFIRMED (doc) | AGREE | Pair-2 manifest carries `typescript.dirty:true` — MINOR 9 |
| M8 | CONFIRMED → fixed `74cef3b` | AGREE | Inherited |
| M9 | CONFIRMED → fixed | AGREE | Inherited |
| N5 | CONFIRMED (coverage) | AGREE | Inherited (Glass opaque; transparent users strip colliders) |
| N6 | CONFIRMED, out of scope | AGREE | — |
| M12 | CONFIRMED, NOT fixed, disclosed | AGREE | Disclosed; no pair-2 real-input case touches a hoarded site |
| M13 | CONFIRMED (no real-input placed-body occluder) | AGREE | Pair-2 facade case is the AUTHORED Post (`172822Z` step 14 `occluderIds ["post"]`); BUILD site is progress-0 (no occluder) → exception (e1) |
| M14 | CONFIRMED (by design) | AGREE | Camera auto-proof mask −261; orbit band unobserved (MINOR 4) |
| N7 | CONFIRMED → FIXED | AGREE | Inherited code check |
| N8 | CONFIRMED → FIXED | AGREE | Inherited |
| N9 | CONFIRMED, out of scope | AGREE | — |
| N10 | n/a | AGREE | — |
| M19 | CONFIRMED, wording kept | AGREE | Every pair-2 report `ownedInputAtEnd.keys []`, OS state clean |
| M20 | CONFIRMED (doc) | AGREE | Accurate restatement in FV02 §2.2; original sentence still at two-repairs record line 154 (NOTE 7) |
| M21 | CONFIRMED, accepted residual | AGREE | — |
| N11 | CONFIRMED → `buildCommit` written | AGREE | All 53 pair-2 runtime bindings carry `buildCommit 574339da31…` |
| M23 | CONFIRMED (class), disclosed | AGREE | Ceiling-grid addition present in the row (record line 122) |
| M24 | = C | AGREE | — |
| M25 | CONFIRMED (geometry), disclosed | AGREE | — |
| N12 | CONFIRMED (doc) | AGREE | — |
| N13 | CONFIRMED, disclosed | AGREE | `StudioSelectionManager.cs` unchanged since `f760d5d` |
| N14 | = B | AGREE | Closed on pair 2 |

---

## 3. (b) Gate table as verified from the files

| Gate | Verdict | Evidence (file / step) |
|---|---|---|
| G1 Real click on the world body → inspector → OPEN PROFILE exact | **PASS** | `Evidence/P10-Journey-FinalVerification02-Rebuild/hid-20260907T172822Z/p10-hid-people-report.json` step 6: still 405 ms, `binding.ok` (frontmost 67704 = appPid, window 720×478, `osHeld.clean`), `drawnVisibility.hidden=false` (target 89.04 m, no hit) consulted on the click frame, `cameraAtClick.pointerOverUi=false`, `missesBefore 0`, `selectionAfter t-cra-04`, `inspectorBound t-cra-04`; step 7 bound; step 9 `profileTalentId=t-cra-04`. Caveat: sim clock `Paused` on the frame (MINOR 5) |
| G2 Opaque facade over a hidden person → no hidden selection, oracle independent | **PASS** | same run step 14: `drawnVisibilityAtCandidate.hidden=true` (hit 89.14 < 100.15 m, `post`) and `drawnVisibility.hidden=true` on the click frame (89.76 < 100.85 m, group `batch:Combined Mesh (ARCHITECTURE)`), `probeAtClick.pickAtChest=post`, `selectionAfter=post`, `personInspector=false`, `probeDisagreements 0`, `stillHiddenAfterClick=true`; the oracle is `Tools/drawn-visibility.py` over the scene-bound dump, ok requires `freshVis.hidden===true` ≤150 ms before the click (`p10-proof-people.mjs:545,555`) |
| G3 Roster → filter → select → OPEN PROFILE → Back | **PASS** | same run steps 17 (60 people), 19, 21 (Miriam Grimaldi), 23, 25 (chip `… roster-chip selected`) |
| G4 Locate → exact body, Roster suspended, camera at rest, BACK TO STUDIO | **PASS** | steps 28 (poseDelta 1.39 mm / 0°, driftPx 1.1), 29 (`selection=t-cra-04 suspended=true`), 30, 32 (chip selected, footer Miriam Grimaldi) |
| G5 Save / Load → Studio Menu / Resume (people) | **PASS** | steps 36 (`Saved.` V18), 38 (`Studio loaded.` talent 60 week 2), 40 |
| G6 Bare-lot boot → BUILD chip → preview → commit → exact debit | **PASS** | `Evidence/P09-Journey-FinalVerification02-Rebuild/hid-20260907T173427Z/p09-hid-build-report.json` steps 6, 7 (cash 20,000,000, placements 0), 15 (`Valid site`, commit enabled), 16 (origin (11,14) gate-court-west, $1,500,000, completes week 14), 18 (placements 1 `placed-1` underConstruction, 20,000,000 → 18,500,000). Also `172423Z` step 18 |
| G7 Save / Load → site re-selected by a real click before and after | **PASS** | `173427Z`: step 24 Esc clear-before-select; 25/27/29 misses resolving `admin` (rootPicking `Ignore`, `pointerOverUi false`, yaw 38.5 → 55.78 → 73.06) with three witnessed right-drag orbits (`hid-witness.jsonl`: 3 rightMouseDown / 72 rightMouseDragged / 3 rightMouseUp); 31 `selection=placed-1` at yaw 90.34; 32 `diag.selectionStableId=placed-1`; 36 Saved V18; 38/40 Loaded, placements 1, cash 18,500,000; **42/43 CONTROL Administration selects after the Load**; 45 pan tap moves rects (site 368.9 → 433.1) with `pointerOverUi false`; **46/47 post-Load `placed-1` on the first click**. Same chain ok in `172423Z` steps 31/32/42/43/46/47. Pair 1 (`165745Z`) is diagnosis only |
| G8 Contract renewal once at quoted terms + neutral cancel, through Save/Load | **PASS** | `Evidence/P10-Contract-Journey-FinalVerification02-Rebuild/hid-20260907T173250Z/p10-hid-contract-report.json` steps 10, 12 (revision 0 → 0), 15 (bonus 37,375, newEnd 144), 17 (receipt `Renewed through Week 144 — $37.4K signing bonus paid.`, term 104, cash 18,196,000 → 18,158,625, ledger 1, revision 1), 18 (`renewEnabled=false`), 23, 26, 29; `engine.log` line 7 `submitIntent accepted revision=1` at 17:33:12.964Z. **The gate rests on `173250Z` alone**: the co-cited `172645Z` has an unretained driver (MINOR 3) |
| G9 Oracle sweep 46/46 | **PASS** | `Evidence/P10-Oracle-Sweep-FinalVerification02-Rebuild`: 46 run-bindings all `(f678cf53, 574339da31, 189326b6, exit 0)`; 46 sidecars `status complete`, empty `failure`, 0 failed machine assertions; `summary.tsv` 46 rows exit 0; tabulator agrees |
| G10 Stage-inspection camera under the new roof colliders | **PASS** (for what it measures) | `Evidence/P04A-Camera-Proof-FinalVerification02-Rebuild/camera-autoproof-20260907T171652Z/camera-proof.json`: status complete, 5 transitions, 4 shots `targetObscured false` / `cameraWasDisplaced false` / mask −261; stage-7 shot at the authored entry pose (46.2, 2.05, 22.8); `collisionRecovery` attempted+completed on a synthetic layer-0 obstacle (max displacement 5.719 m, recovered to 3.6e−6 m); binding `f678cf53/574339da31/189326b6`, exit 0. The §3.3 orbit band is **NOT RUN** (row below) |
| G11 MAJOR C / E selection repairs (EditMode chain) | **PASS** | pre-fix `editmode-runA-oldcode-20260907T125501Z.xml` 17/11/6; `editmode-fixF-full-20260907T170930Z.xml` 900/900 (17:09:41–45Z). Binding to `574339da31` is by timing only (MINOR 1) |
| G12 Defect F regression + pre-fix control | **PASS** | `editmode-menu-fix-20260907T170624Z.xml` 15/15 (17:06:37Z); `editmode-menu-prefix-control-20260907T170851Z.xml` 14/15 with exactly `PanelInputSuppression_RestoresTheRootsOwnPickingMode_NeverForcesPosition` failed, message "Resume must return a pass-through root to Ignore … But was: Position" (17:09:02Z); runtime controls G7 steps 42–47 vs pair-1 `165745Z` steps 42–82 |
| G13 TS floor / Owner-profile copy / compat (reused) | **PASS** (reuse legitimate) | engine byte-identical at TS dist, the launched candidate path and all 53 bindings; `git diff a2baa1d..HEAD` non-docs empty; the reused logs exist: `Evidence/_TWO-REPAIRS-PRESERVATION-20260907/logs/{ts-floor,owner-copy-inmemory,owner-copy-engine,compat-probe}-two-repairs.log` and TS `Evidence/P10-Compat-Boundary-20260906T202509Z/`; the committed G13 row names none of them (MINOR 8); Owner-copy ran inside G9 (`p10-owner-profile-copy-20260907T171411Z`, `…171419Z`). Logs not re-executed by rule |
| §3.5 root cause proven by the pair-1 controls | **PASS** | `Evidence/P09-Journey-FinalVerification02/hid-20260907T165745Z/p09-hid-build-report.json`: step 25 `rootPicking Ignore`, `pointerOverUi false`, selection `admin`; step 31 `placed-1`; after Save(36)/Load(38–40): steps 42/43/49 `rootPicking Position`, `pointerOverUi true`, selection `''`; step 52 pan tap moved the rects (site 357.9 → 398.5); steps 53–80 `''`; 82 FAIL. Binding `reconstructed:true` (disclosed), exe `3558ddd4`/`75de360` |
| §3.5 fix minimal and safe; symmetry test still protects P04A.1 | **PASS** | `git show 574339da31`: `StudioWorkspaceHost.cs:1365–1388` records `rootPickingBeforeSuppression`, restores it or `Ignore`; callers `StudioSystemMenuHud.cs:165–166` (Closed↔non-Closed only), `:415`, `:425`; `PickingMode.Position` declared only on `person-inspector-card:53`, `workspace-scrim:1601`, `casting-root:389`, `casting-inspector-card:91`; runtime: post-Load UI Toolkit workspaces driven in `173250Z` steps 27–29 and `172822Z` steps 38–40. `StudioSystemMenuTests.cs`: `Suppressed()` = `Ignore && !enabledSelf` still asserted after Open/Esc/ConfirmDiscard; discrimination of the defect lives in the new test only (NOTE 1) |
| §3.5 defect pre-existing (not `df79153`) | **PASS** | `git log -S PickingMode.Position` → `9e75b5f` (P04A.1); corroborated by the control player's own two-repairs BUILD `Evidence/P09-Journey-TwoRepairs/hid-20260906T211611Z` step 37 `ok:false selection=''` after three post-Load clicks (exe `ab1fa09b`/`f760d5d`) — which contradicts the record's "never caught before" sentence (MINOR 2) |
| Witness attribution soundness (when consulted) | **PASS** | `Tools/hidwitness/hidwitness.swift` listen-only tap, `sourcePid 0` = physical, keycode masked −1; `hid-guard.mjs attribute()` (bound `f0a383c5…`): benign only for `appPid && type=='null'`, physical always foreign, silence → suspend |
| Guard run-time guarantee "a physical-device event → suspend exactly as before" (§3.4) | **FAIL** (record claim) | `attribute()` runs only when `humanInputSeen` flags (`idle + 900 < sinceOurs`); demonstrated miss: `Evidence/P09-Journey-FinalVerification02/hid-20260907T162344Z/hid-witness.jsonl` 110 `sourcePid 0` events (57 type29 gesture + 53 mouseMoved, keycode −1) 16:24:19.167–19.637Z, 0.56 s after the driver's own click (18.551/18.604, pid 30931), next injection 22.103Z; report `foreignEvents 0`; drive continued. Corrected in `3226130` (tools-only, bound by no pair-2 run). MAJOR 2 |
| Pair-2 desk exclusivity (whole-log scan, mine) | **PASS** | 7/7 witness logs: `172423Z` 266 events, `173427Z` 261, `171809Z` 241, `172645Z` 118, `173250Z` 118, `172023Z` 190, `172822Z` 152 — **0 `sourcePid 0`, 0 keycode −1**; every event is the player pid (null only: 8/8/7/4/4/18/7) or a one-shot tool pid |
| Harness artifacts per order §5; no programmatic Select/Open | **PASS** | every drive dir: `input-state-start/end.json`, `run-binding.json`, `build-manifest.json`, `hid-witness.jsonl`, `app.log`, `engine.log`; every selection follows a `guard.click` at published bounds; inputs are taps, wheel, Esc, left clicks, right-drag orbits |
| Older runs not relabelled; pair-1 disclosures honest | **PASS** | pair-1 bindings still `3558ddd4/75de360`; `163708Z` `run-binding-correction.json`; `165745Z` `reconstructed:true` |
| §3.3 Stage-inspection ORBIT band (≥17 m, 22°–42°) under the roof collider | **NOT RUN** | no shot orbits there; camera-proof samples the entry pose and a synthetic obstacle only |
| Real-input PLACED-body occlusion case (M13) | **NOT RUN** | facade case = authored Post; BUILD site progress 0 |
| Real Builders | **NOT RUN — deferred** | P09-REQ-039, by order |

---

## 4. (c) Standing findings after refutation

### 4.1 Refuted (does not stand)

**"CONTRACT 171809Z: host displayed a receipt and closed the window while the authority never received the intent" — REFUTED as MAJOR.** I opened `Evidence/P10-Contract-Journey-FinalVerification02-Rebuild/hid-20260907T171809Z/019-renewal-receipt.png`: the RENEWAL — CONSEQUENCE sheet is still open, the CONFIRM button `RENEW ANNA LOEWENTHAL — 2 YEARS · $37,375 BONUS NOW` carries its focus ring, `Cash $18.2M → $18.2M`, CURRENT reads `Renewal window open — contract ends Week 52.`, header `WEEK 40 · READY`; there is no receipt band and no "Studio action completed." The real receipt (`hid-20260907T173250Z/017-renewal-receipt.png`) looks entirely different (receipt line at the top, sheet gone, REVIEW RENEWAL greyed, CURRENT `Available`). Report steps 19/20/25/28/31 read term 52 / ledger 0 / revision 0 → 0; `engine.log` has no `submitIntent` (save at 17:19:13.831Z rev 0, load rev 1). Host state, durable state and authority were consistent: a lost click, fail-safe. G8 is unaffected. What survives is MINOR 6.

### 4.2 MAJOR (record / harness; no gate re-opened)

**MAJOR 1 — The people driver's "clear of the HUD" predicate is blind to the unpublished IMGUI HUD panels; the 172023Z misses were real clicks posted into the PROJECT: STUDIO panel, mis-booked as walking-figure retries.**
`Tools/p10-proof-people.mjs:217–229` (`underUiAt`) iterates only `map.elements`; the workflow panel is IMGUI (`StudioBridgeClient`) and never published, while the product's own `StudioCameraInput.PointerOverUi` treats it as UI and the selection manager refuses picks over it. The build driver knows this (`Tools/p09-proof-build.mjs:324–328` comment + `frameStepZone`); the people driver (`:354–437`) has no such guard. Evidence: `Evidence/P10-Journey-FinalVerification02-Rebuild/hid-20260907T172023Z/p10-hid-people-report.json` steps 6/7 screenPoints (117,218)/(120,216) → Unity y-from-top ≈314/310, x 234/240; the host's next-sample diag reads `pointer [234,586]` / `[239,590]` with `pointerOverUi:true` while `probeAtChest='t-cra-04'` and the oracle said visible; `selectionAfter ''`; `observed.underUi 0`. `006-click-body-world-selectable-t-cra-04.png` (opened): that point lies inside the panel (capture x ≈22–414, y ≈78–428). The same signature sits in pair-1 `162724Z` steps 7/8/11. Record misstatements: §0 lines 41–42 ("the walking-figure click can need several retries"), §3.4 (4) line 245 ("missed a walking figure"), §4.0 rows 332 and 342. Risk: the panel is a live control surface (the `Start Development & Casting Annex` button submits a product intent); a "retry" can post an intent inside a governed journey. **G1 stands**: the gate run `172822Z` step 6 clicked at Unity (596, 240-from-top) with `pointerOverUi:false` and `missesBefore 0`; `172023Z`'s landing step 8 (y-from-top ≈392) is below the panel. Required: qualify the step label; add the HUD-free zone or the host's `pointerOverUi` at the aim as cover before any further people drive; correct §0, §3.4 (4) and the §4.0 16:19 / 16:27 / 17:20 rows. (The uncommitted working-tree block already concedes "the people driver does not" frame into a HUD-free zone; the narrative rows are still uncorrected.)

**MAJOR 2 — The human-input guard has a ≈0.9 s post-injection blind window; a real physical trackpad burst in pair-1 BUILD #5 went unflagged and undisclosed while §3.4 claims "suspend exactly as before".**
`Tools/hid-guard.mjs` at the bound revision `f0a383c5…` (= `git show d849a43:Tools/hid-guard.mjs`): `humanInputSeen(slackMs=900)` flags only when `idle + 900 < sinceOurs`; `attribute()` (the sole reader of `sourcePid`) runs only inside that branch, and `witnessed.foreignEvents` increments only there. Demonstrated: `Evidence/P09-Journey-FinalVerification02/hid-20260907T162344Z/hid-witness.jsonl` — 110 `sourcePid 0` events (57 type29 + 53 mouseMoved, keycode −1) at 16:24:19.167–19.637Z, 0.56 s after the driver's own click (18.551/18.604Z, pid 30931), before the next injection at 22.103Z; the report says `foreignEvents 0`; the drive continued injecting. Record: §3.4 lines 229–230 ("→ suspend exactly as before"), §4.0 16:23 row (line 331) discloses no human input; every "0 foreign" figure in §4.0/§4.1 is a guard counter, not a log scan. **Pair-2 gates are unaffected by my whole-log scan (0 physical events in all seven logs).** Correction in flight: `3226130` (`foreignSinceOurs()` on every assert + `auditWitness()` in the report; unexercised by any pair-2 run) and an uncommitted record paragraph whose counts (171+18, 144+7, 233+7, 113+4, 113+4, 257+8, 252+8) equal my parse — but the 16:23 row and the §3.4 sentence are still unamended. Required: disclose the slack window in §3.4, add the 16:24:19Z touch to the 16:23 row, restate every pair-2 "0 foreign" as a whole-log scan, and commit the disclosure block.

### 4.3 MINOR

1. **EditMode ↔ commit binding by timing only (third M3-class recurrence); wrong stamp; old-host procedure unrecorded.** `editmode-menu-fix` 17:06:37Z, `editmode-menu-prefix-control-20260907T170851Z.xml` 17:09:02Z, `editmode-fixF-full` 17:09:41–45Z; `574339da31` committed 17:10:16Z; no `HEAD`/dirty line in `editmode-fixF-full-20260907T170930Z.log` (grep 0). The §4.0 17:06–17:10 row (line 338) cites `editmode-menu-prefix-control-20260907T1707…Z.xml` — no such file. The build itself is bound (manifest 17:10:32Z `dirty:false`). The working tree adds "the pre-fix control ran with the host file stashed to its 75de360 content" — asserted, not verifiable from any artifact. Disclose the timing in G11/§3.5, fix the stamp, or re-run stamped when Unity may be used.
2. **§3.5 line 267 "never caught before because the two-repairs BUILD driver only asserted the site's rect was published" is wrong.** `Evidence/P09-Journey-TwoRepairs/hid-20260906T211611Z/p09-hid-build-report.json` step 37 "the restored site selects from the world by the same stable id (placed-1)" is `ok:false selection=''` after three post-Load clicks on the control player `ab1fa09b`/`f760d5d` (which carries the identical `Position` restore); `P08-P10-TWO-REPAIRS-2026-09-06.md` lines 248/271 attribute it to HUD cover. That driver had no `rootPicking`/`pointerOverUi` diag, so HUD cover and defect F are not separable there. Correct §3.5 and add an erratum note to the two-repairs rows.
3. **G8 co-cites `hid-20260907T172645Z` whose driver (`949aea92…`) matches no committed revision** of `Tools/p10-proof-contract.mjs` (16 revisions hashed) — the intermediate re-click text, undisclosed, unlike the disclosed `163708Z` case. Rest G8 on `173250Z` alone or disclose the unretained revision.
4. **§3.3 lines 204–205 ("the deoccluder pulls the camera under the roof so the interior stays in view … judged an improvement") is a judgement, not an observation.** `camera-proof.json` samples the entry pose (46.2, 2.05, 22.8) and a synthetic obstacle; no shot at ≥17 m / 22°–42° where the new `MeshCollider` intervenes; phase-1's collider-free Interior Grid Ceiling (y 14.55) point stands. Reduce to a disclosure or capture the orbit band before acceptance (exception e4).
5. **The studio clock stood `Paused` on every counted journey frame and the committed record does not say so** (`172822Z/006`, `172023Z/006`, `173427Z/047` all show `Paused`; no "pause" string in the record at `22e82bb`). Not disqualifying — no speed key was pressed, and the figure demonstrably walked under pause (`172822Z` feet z 26.93 → 43.64 between steps 6 and 14; `observed.moving 70`) — but the moving-target claim must cite that evidence, not "walking". The working tree adds the disclosure; it must be committed.
6. **CONTRACT 171809Z cause attribution is unevidenced and the CONFIRM re-click cannot surface a recurrence.** §4.0 line 341 "Harness: the sheet re-lays out under the pointer after the term click" has no artifact (015/016 are layout-identical; the term click was 1.8 s earlier); the host's per-second actions-paused gate is an equally plausible mechanism; 2 of 7 CONFIRM clicks across both pairs were dropped with cause not established (`171809Z`; pair-1 `155718Z`, whose foreign event came ≈11 s after the click). `Tools/p10-proof-contract.mjs:449–463` (`41d94eb`) records the retry step with no `ok`, so a fired retry never appears in `failedSteps` or the index. Reword the row to "cause not established; fail-safe: no receipt, no commit, sheet still open"; flag any fired retry for disposition.
7. **Guard / witness residuals (tools):** the launchers start the committed binary `Tools/hidwitness/hidwitness` (`da6d5652…`) but bind only the source hash (`0a46aaab…`); `attribute()` treats any non-physical, non-player pid inside `[lastOurs−1500, lastOurs+150]` as "ours" without checking it is the launcher's `ownerinput`; the 600 ms re-activation shortcut skips the witness; `3226130`'s `foreignSinceOurs()` scans only from `lastOurs + 150 ms`. Unaffected on pair 2 (raw logs scanned); bind the witness binary hash and tighten the "ours" test.
8. **G13 (line 305) names no evidence file** although the reused logs exist (listed in §3 above). The working tree adds the paths; commit them.
9. **Pair-2 manifest records `typescript.dirty:true` (TS `f536308`)**; order §10 asks for `dirty=false`. Reconstructible as docs-only only via the later commit `22e82bb` (2 docs files) — the product is bound by the engine hash `189326b6…` regardless; disclosed in §0 line 40 but not in §5. State it in §5 or regenerate the manifest from a clean docs tip (binaries unchanged).

### 4.4 NOTE

1. The fix is a safe superset of the minimal change (no code path sets the root to `Position`; `Ignore` on release would suffice); the updated symmetry test captures its baseline from the host, so it passes on the old host too (control reads 14/15, not 13/15) — the new test alone pins "never Position". Say so in §3.5 so a future edit does not weaken it.
2. §0 line 23 lumps G9–G13 under "PASS … by real OS input"; §5 omits `31f981d` (working tree adds it); `Tools/ownerinput/ownerinput` is git-ignored (`.gitignore:60`) so `ownerinputBinarySha256AtLaunch` binds a build not reproducible from source.
3. The clean BUILD report records no explicit orbit step; the three orbits are evidenced by the yaw progression and the witness (3/72/3 right-button events).
4. PEOPLE `172822Z`, CONTRACT `173250Z`, BUILD `173427Z` drove from then-uncommitted driver text later committed unchanged as `41d94eb` (hashes resolve); `unityCommit` in two of those bindings is `41d94eb`, `buildCommit` `574339da31` — provenance recoverable, say so in §4.0.
5. The report's `witnessed.playerNullEvents` is a per-check counter, not a whole-log count (`172023Z` 21 vs 18 null events in the log; `172822Z` 5 vs 7; `173427Z` 2 vs 8); `3226130`'s `audit` block is the whole-log figure.
6. The pair-1 player binary was overwritten in place (order §6 letter); disclosed in §0; hashes and manifests retained in every pair-1 dir.
7. M20 residual: the over-claim still stands at `P08-P10-TWO-REPAIRS-2026-09-06.md:154`; an erratum pointer is the append-only fix.
8. Pair-1 attempts (20 drives, 20 unbound sweep runs) have no committed machine-readable index (only §4.0 prose + TSVs); run the tabulator `--pair 1` and commit beside the pair-2 index.
9. Facade PASS requires the fresh-frame hidden verdict but not `stillHiddenAfterClick` (`p10-proof-people.mjs:555–556`); true in fact on pair 2.
10. §5 predates the pair-2 candidate `~/Desktop/P08-P10-Combined-Candidate-f536308-574339d` (assembled 17:43:36Z); the candidate is named only in the still-uncommitted handoff C11 entry (`git status` ` M`).
11. All pair-2 gates rest on the guard revision `f0a383c5…`; `3226130` is a forward correction and must not be described as having governed any counted run.

---

## 5. Conditions attached to the KEEP (record corrections; none re-opens a gate)

1. Commit the post-lens disclosure block (whole-log witness audit, paused clock, EditMode timing, 171809Z reclassification, unpublished HUD panels, G13 paths) — its facts are verified here — **and** amend what it still leaves wrong: §3.4 line 229–230 (retract "suspend exactly as before", state the ≈0.9 s slack), §4.0 line 331 (add the 16:24:19Z physical burst), line 338 (stamp `…170851Z`), line 341 ("cause not established"), §3.5 line 267 (the two-repairs step-37 failure), §0 lines 41–42 and §3.4 (4) (panel clicks, not walking-figure misses), §3.3 lines 204–205 (disclosure, not verified improvement), §5 (`typescript.dirty` basis, `31f981d`, the pair-2 candidate).
2. Before any further real-input drive: people driver HUD-zone / `pointerOverUi` cover; witness binary hash bound; the `3226130` guard exercised at least once and its `audit` block present in that report.
3. Commit the handoff C11 entry with this disposition filled in.

---

## 6. (e) Exceptions recommended for Current Ops to consider (not granted here)

- **e1 (M13):** accept EditMode-on-the-real-presenter + independent oracle + sweep proof for the PLACED-body occluder, with the real-input facade proof on the authored Post, in place of a real-input placed-facility click.
- **e2 (M3 class):** accept `editmode-fixF-full` 900/900, `menu-fix` 15/15 and `prefix-control` 14/15 as bound to `574339da31` by timing (≤4 min) and the 2-file/83-line commit content, rather than requiring a stamped re-run before Owner acceptance.
- **e3 (G13 / §10):** accept the `a2baa1d` TS-floor / Owner-copy / compat logs as carried for pair 2 on the byte-identical engine, and the docs-only `typescript.dirty:true` in the pair-2 manifest.
- **e4 (§3.3):** decide whether the Stage-inspection orbit band must be observed on pair 2 (one high-pitch StageSeven capture) before acceptance, or is left as a disclosure for the Owner playtest.
- **e5 (M12 / M23 / M25):** accept the disclosed collider-less authored/hoarding parts and squat-cylinder over-blockers as a separately scheduled authoring item.
- **e6 (guard):** accept the pair-2 real-input gates on the strength of the raw witness logs (0 physical events, scanned whole by this review) without re-running them under the witness-scanning guard of `3226130`.
- **e7 (CONFIRM drops):** disposition the two dropped CONFIRM clicks (`171809Z`; pair-1 `155718Z`) as an accepted intermittency with cause not established, or require a root cause (host per-poll actions-paused gate vs harness) before Owner acceptance; G8 itself is met.

---

## 7. (d) Verdict

Every mandatory gate G1–G13 is verified from the pair-2 files themselves: exe `f678cf53…` / Unity `574339da31` / engine `189326b6…` bound in all 53 runtime bindings; the three journeys complete with 0 failures by real OS input under the owned-input guard with 0 physical-device events in every witness log; 46/46 sweep; camera auto-proof; EditMode 900/900 with pre-fix controls; defect F's root cause proven by the pair-1 controls, its fix minimal, safe and pre-existing; campaign refs, `main`, the Owner profile and the controls untouched; older runs unrelabelled. The one MAJOR-severity claim that pointed at the product (171809Z) is refuted by the frames. The two standing MAJORs are harness/record defects whose corrections are tools-only and in flight; neither changes a gate verdict. The KEEP is conditioned on the record corrections in §5 and carries the exceptions in §6 for Current Ops.

COMBINED P08–P10 TECHNICAL KEEP FOR AUTHORIZED READY SCOPE — MANDATORY TECHNICAL GATES COMPLETE — OWNER ACCEPTANCE PENDING