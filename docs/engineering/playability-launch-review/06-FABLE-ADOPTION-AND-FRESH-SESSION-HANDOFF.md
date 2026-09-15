# R3-N1 native correction record — 2026-09-15 · OPS-R3-N1-NATIVE-CORRECTION-20260915-01

Status: **N1 NATIVE CORRECTION — SOURCE-CORRECTED AND RENDERED-VERIFIED (209/209 on Unity 74c2141 / Build50), NATIVE PROOF NOT EXERCISED (four guarded attempts blocked by an unacknowledged HID injection / owner activity on this desktop session) — STILL A LABELLED PARTIAL; NOT OWNER-ACCEPTED; N1 RESERVE EXHAUSTED AT THIS RECORD**
This section sits above the continuation record (C1–C7), the execution record (R1–R8) and the successor record (S1–S7), all unchanged.
It is the one evidence-linked record of the correction's acceptance, the F7–F15 before/fix/test/native-result matrix, the exact new
candidate pins, the bounded fixture attempt, charges and residuals. Nothing here starts P13B, a PR/merge or a protected promotion.
Build46 is the Current Ops-qualified engineering checkpoint (not Owner-accepted); P13A remains the accepted product. Private identifiers
stay in the Git-private `fable-local-transfer-20260914-01/r3n1-ledger-local.json`.

## K9. Build50 native runs under the Owner's three-week directive — 2026-09-15 20:05Z–20:27Z (unattended, guard-admitted)
Authority: Owner directive (`docs/operations/fable-team/OWNER-DIRECTIVE-THREE-WEEK-AUTONOMOUS-20260915.md`); the desktop became idle after
Howard left; every run admitted by the unchanged guard (console unlocked, owner idle ≥ 60 s, listen-only witness, bound Build50 manifest
`319fb167…`, synthetic fixture provenance) and driven through the supervised direct-pipe wrapper (`native-supervised.sh`, caffeinate tied to
the driver pid, 30-s first-progress bound). Analyzer v3 (`check-run-v3.py`, aligns by the driver's own mapPath; v2 retained) — both in
`coordinator-scratch/r3n1e/` on the private mirror. No Owner campaign touched; player exited by its own UI Quit in A6, by the driver's finish
in A5 (UI quit skipped by a script toggle — see F19 withdrawn).
| Run | Evidence (`Evidence/Playability-Interaction-01/`) | Steps | Result |
|---|---|---|---|
| Preflight PF | `early-2026-09-15T20-09-57-345Z` | 9 | PASS — first scripted input acknowledged 2 s after ready; clean owned shutdown |
| A5 (1440×900, dense-01, 100 % then 200 %) | `early-2026-09-15T20-11-58-338Z` | 139 (15 attempt-failed, all script-sequence) | complete; input clean |
| A6 (corrected script) | `early-2026-09-15T20-19-22-804Z` | 87 (8 attempt-failed, script) | complete; UI quit; input clean |
| B1 / B2 (1280×720, dense-02) | `early-2026-09-15T20-15-…` binding refused / `…T20-22-…` | 0 / 0 | NOT RUN — B1: coordinator env path case (`Evidence` vs the manifest's `evidence`), fixed; B2: **stale-source guard** (the N2 writer's edits made the Unity tree newer than Build50 — the guard is right); Run B moves to Build51 |
**F7–F15 native disposition on Build50 (K2's native columns):** F7 **PASS** (pointer overlay: one Escape closes only the overlay; menu stays
closed) · F8 **PASS (Production excursion)** — people offset retained across Production workspace and back (56 → 56); the Profile excursion
was NOT EXERCISED (script targeted an off-screen row twice) · F9 **PASS typing / FAIL after Tab-out** (see F17) · F10 **PASS** — with the lot
selection active after Locate, one click opened the person overlay and, after Back, one click opened the picture overlay; the receipt survived
Back · F11 **PASS** ('h' then 'q' typed into Find; list narrowed then emptied) · F12 **PASS (no menu)** but see F18 · F13 **PASS at 1440×900/200 %**
(headers on their own rows, toolbar stacked, portrait/stage image stacked above text; capture `107-fix-130-rails-200.png`) · F14 **PASS at
1440×900/200 %** for both overlays (person: panel [366,12,680,490], Open profile [380,26,529,68], Locate [380,100,274,68], Back [822,438,210,52],
body [380,186,652,184]; picture: Open production [380,26,652,68], same Locate/Back/body) · F15 **PASS** (opaque body plate in captures 107/116
and `v2-150`). The 1280×720/200 % cell, dense-02 picture overflow and the Schedule-take route stay **NOT EXERCISED** (Run B → Build51).
**New native findings (Build50):** F16 (check, low) after a pointer-opened overlay closes, the next Escape opens the menu (invoking focus not
held on the pointer route); **F17 (defect, medium)** keyboard row activation opens no inspection (Tab×3→Down→Return; Tab-out→Down×2→Return)
in both runs; **F18 (defect, medium)** Escape in Find releases nothing visible and never closes Find (three presses; menu stays closed);
F19 withdrawn (script toggled the open menu closed; Quit is visible at 200 %, capture 133); F20 (minor) monogram glyphs draw above their slot at
200 % (row + overlay header). F16–F18/F20 were added to the N2 writer's assignment (IMPL-12 items 6–9).
**Charges (reserve, session clock):** 20:05:00Z–20:27:00Z ≈ 22 min (preflight, runs, analysis, this record); N1 reserve ≈ 372.5 of 420 min.
Plan/state/directive writing 20:00–20:05 and 20:11–20:13 ≈ 7 min capability (program management).

## K8. Input recovery — OPS-R3-N1-INPUT-RECOVERY-20260915-02 (pointer; the additive record is published, not repeated here)
Order verified (blob `f28ab598` at `0b620524`). Findings that CORRECT K4: the sleep attribution is withdrawn; in both blocked runs the guard's
startup events (six helpers) WERE acknowledged like the good 06:25Z run, the driver logged no command at all (its stdin command loop idled until
witness expiry), and the un-acknowledged token was the finish-stage stop marker written after expiry — the block was the coordinator's FIFO
command harness (the morning's runs used the direct `run-native.sh` pipe); no missing permission was identified and no Owner permission action
was requested. Bounded coordinator-side supervision (direct pipe, explicit run paths from the driver's "ready" line, 30-s first-progress bound,
SIGTERM to the owned driver's own finish handler) was TESTED on an inert owned blocked child: abort at 30 s, clean exit. Preflight, Run A and
Run B: **NOT RUN** — Howard answered "Not now" to the current desktop-availability question. Per-defect native disposition and every K7
residual unchanged. Charges: ≈ 14 productive reserve minutes (19:51:58Z–≈20:06Z), N1 reserve ≈ 351.5 of the amended 420 min; the K6 closing
estimate is superseded by the stamped ledger (correction reserve 115.25 min; 337.45 before this recovery). Record + evidence:
`docs/evidence/r3n1-native-correction-20260915-01/reports/INPUT-RECOVERY-01.md` and `evidence/Unity/r3n1-20/` on the private review branch
at `c80743db4e3624f5c007ddcc5bfb74c88f393a0a` (92 files). Next: with a current desktop statement, preflight through `native-supervised.sh`,
then A and B with fresh admissions.

## K1. Acceptance, desktop basis, ownership
- Order verified: packet `R3-N1-NATIVE-CORRECTION` (SHA256SUMS 5/5 OK) == Git blob `ac0a3d9295c636be1ee2615d225032c20551fbd4` at
  `3cf828a9` (`docs/engineering/playability-launch-review/10-R3-N1-NATIVE-DEFECT-CORRECTION.md`, on
  `origin/docs/playability-r3-hybrid-execution-01`). Same Fable coordinator session as C1 (no restart, no new team, no Workflow tool);
  same registered unity-ui production writer (opus), independent test-author (sonnet by profile) and design continuation owner
  (uiux-designer, opus); ≤ 2 specialists concurrently on disjoint paths; the coordinator remained integration/native-input owner.
  Correction charged from `2026-09-15T10:19:46Z` (packet unpack); the prior publication tail 06:54:21Z–06:59:00Z (4.65 min, reserve)
  is deducted first.
- **Desktop basis:** Howard's continuation statement of 2026-09-14 ("The desktop is available now for the authorized R3-N1 rendered
  PlayMode and native tests. Keep the existing guard and all build/fixture checks.") was re-affirmed for this correction by the
  order's own instruction in this session ("then reverify the actual failing routes … Return the corrected connected native
  candidate"); no new verbatim sentence was given and none was solicited — recorded as the basis, not as perpetual access. The
  unchanged guard (console unlocked + HID idle ≥ 60 s + listen-only witness + bound manifest + fixture provenance + stale-source check)
  stayed mandatory for every rendered and native run and was never taken by foreground input.
- Every specialist assignment, its allowed paths and its evidence root are in the coordinator scratch briefs (IMPL-09/09b/10, DATA-02,
  DESIGN-02, TEST-06/07); the writer listed exact files before editing in `r3n1-12/writer-report-09.md` and
  `r3n1-14/writer-report-10.md` (Unity `Evidence/Playability-Interaction-01/`, gitignored, retained locally).
- Coordinator scope decision recorded: the compact entry cards' geometry in `StudioWorkspaceHost` was treated as the same F10 cause
  (order §2 "related consumers … minimal client-only helpers") and corrected by the writer (IMPL-09b); no other StudioWorkspaceHost
  change was made.

## K2. F7–F15 matrix — original failing run/step/setting · source fix · independent regression · native action/capture · outcome
| ID | Original failing run · step · setting (Build49) | Cause (file, mechanism) | Source fix (Unity commit) | Independent regression (test-author) | Native action · capture (Build50) | Outcome |
|---|---|---|---|---|---|---|
| F7 | R-A `early-2026-09-15T06-25-20-387Z` steps 020–023 / 050–051, 1440×900 @100: Escape on the open compact overlay also opened the Studio Menu | two Escape pipelines: IMGUI ladder in OnGUI vs polled `StudioCameraInput.CancelPressed` consumed in Update() by `StudioSelectionManager.HandleCancel → StudioSystemMenuHud.OpenMenu()` and `StudioCameraDirector`; Update runs first | `dff08b9` + `e05b218`: shared fact `StudioInputFocusGate.GuiConsumesCancel/PolledCancelAllowed`, rails + overlay publish `CancelOwner`, polled consumers defer; menu stays the top rung | EditMode `StudioInputFocusGateEscapeTests` (21); PlayMode `StudioNativeInputAndReturnRegressionTests.Escape_ClosesTheOpenOverlayOrFind…` (rendered PASS, r3n1-15) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F12 | R-A steps 07x (Find open, Escape opened the menu), 1440×900 @100 | same pipelines + missing ladder rung: an open-but-unfocused Find matched no rule | `dff08b9`: rung 3b `CloseTopTransientLayer()` peels filter list / Find before rail focus | same tests as F7 (Find branch) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F8 | R-A steps 020–023: overlay → OPEN PROFILE → Escape reset the employees offset to 0 | return context sound; callers then set `revealFocusedPerson`/`revealAfterTextChange` and the next draw re-scrolled to reveal the invoking row (clipped at the top) → offset 0 | `6d9d530`: restore the saved offset and the invoking focus as a target WITHOUT a reveal; shrink clamp / session / missing-id rules untouched | PlayMode `…ExcursionRestoresTheSavedOffsetAndInvokingFocus_WithoutArmingAReveal_BothRails` (rendered PASS, r3n1-15); Production excursion in the same test | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F9 | R-A steps 04x: after Tab out of the employees search, arrows/Enter still typed until Escape | Tab cleared only the focused control NAME; `GUIUtility.keyboardControl` stayed on the editor (logical focus ≠ GUI ownership) | `dff08b9`: `StudioRailKeyboardFocus.ReleaseTextEntry()` moves name + keyboardControl together on Tab-out/Escape; rails publish `TextEntryOwnsKeyboard` | PlayMode `…FindFocusesItsFieldTheFrameItIsDrawn_AndReleasesBothKeyboardFactsOnTabOut` (re-derived to the published fact in TEST-07) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F11 | R-A step 07x: `pictures-find` gave the field no focus; typing "a" panned the camera | pointer route `TryConsumeToolbarClick` opened Find without `FocusControl`; camera read W/A/S/D unconditionally (`StudioCameraInput.cs:222-232`) | `dff08b9`: one `ToggleFind()` for both routes with a focus request spent at the field in `DrawToolbar`; `CameraMovementAllowed` withholds all movement keys while a rail field owns the keyboard | same PlayMode test + EditMode `CameraMovementAllowed` cases | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F10 | R-A steps 030–032: after Locate (world selection + receipt), a rail row click was dead | (1) a lawful Locate selects a body → compact entry card raised; both rails treated `ProductionEntryDisplayed/CastingEntryDisplayed` as a workspace and retired; (2) `TryOpenLaneInspector` answered "opened" while unhostable and `Update()` closed it (activation swallowed); (3) the entry cards were anchored inside the pictures rail's band (`StudioWorkspaceHost.cs:2288-2292`) | `2b84a2b` (employees rail yields only to a real workspace; hostability refusal) + `1861c49` (entry cards dodge the pictures rail, one card at one depth) + `40b4e5c` (pictures rail yields only to `WorkspaceOpen`) | EditMode `StudioLegacySuppressionTests.RailHudSource_YieldsOnlyToARealWorkspaceOnBothRails` (re-derived pin; failed on the unfixed rail, green after `40b4e5c`); PlayMode `…EmployeeRowActivationOpensExactlyOneInspection…` (rendered PASS, r3n1-15) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F13 | R-A after `studio-menu-text-200`, 1440×900 @200: headers clipped/overlapped, card title/stage broke mid-word beside the 144-px slot, LOCATE over the state line | fixed `− 96·w` header rect and fixed `18·s` row; card text column 129 px beside the image; screenplay LOCATE drawn full-card-height | `7b5ae6e` (measured full-inner-width header row stacks; bottom-anchored measured action zones reserved in measure and draw) + `3a0ef0d` (card/row stack image above text below a ten-character specimen) | EditMode `StudioR3N1Impl10LayoutContractsTests` (R3/R4 cases); PlayMode R3 pairwise-disjoint header/toolbar rects at 1440×900/200 % | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F14 | R-A 1440×900 @200 picture overlay: unclamped 3-line 40-px title consumed the 490-px overlay; `inspector-open-production`/`inspector-locate` at y −138/−64; body 1 px | `MeasureLaneHeader` sized the header from unclamped `CalcHeight(title)` | `d15a16b`: bounded header rows + R1 ladder against `min(0.40·envelope, envelope − footer − bodyMin)`, rect floored at header+footer+bodyMin, action rects from the FINAL rect gated by `LaneInspectorActionPublishable`, clamped title/sub-line reflowed into the body | EditMode R1 six-cell table + publishability boundaries; PlayMode R1 panel containment + bodyMin at 1440×900/200 % | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| F15 | every overlay capture: body text over the lot | only `GUI.skin.box` behind the rect + `SurfaceContainer` α 0.86 | `9d63aac`: `SurfacePlate` α 1.0 under the whole body, drawn before `BeginScrollView`, keylines outside the scroll view, opaque header/footer stock | EditMode R5 plate/keyline rect laws (component evidence only) | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |
| §3 cell | R-D `early-2026-09-15T06-45-52-043Z`, 1280×720 @200: `inspector-fallback` (full workspace) | sheet §C.9 needed 484 px in a 310-px envelope | addendum R2 (TS `43b3a6b1`) + `d15a16b`: header N=0 (title in the body) 92 + footer 94 + bodyMin 120 = 306 ≤ 310; `inspector-fallback` only where no lane is composed | three withdrawn-fallback pins re-derived (TEST-07 item 00); PlayMode R2 person+picture compact hosting at 1280×720/200 % | Run A script `run-A-1440-dense1.jsonl` prepared (steps recorded) — not executed | **FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED** |

## K3. Candidate pins — source, build, seal, admission, fixtures
| Identity | Value |
|---|---|
| Unity source | `18b893a6` → **`74c2141a241a11e43affd9dee909a74b4b1b9e2e`** (13 commits: IMPL-09 `dff08b9`,`6d9d530`,`2b84a2b`,`e05b218`; IMPL-09b `1861c49`; TEST-06 `c3207c0`; IMPL-09c/10 `40b4e5c`,`9d63aac`,`d15a16b`,`7b5ae6e`,`3a0ef0d`; TEST-07 `c06e419`; IMPL-11 `44cddab`; settings restore `ae3695b`; TEST-08 `74c2141`); pushed fast-forward, remote == local |
| TS source | `ccc49ae9` → **`43b3a6b1da3360feed31e5c5be421817a5d003aa`** (DATA-02 test `e11933b2`, design addendum `43b3a6b1`; this record follows as a docs commit — not a new build); production TS unchanged since `31f6e70d` (engine bundle `af1e8897…`, worker `807f28a6…` unchanged from Build49) |
| **Build50** | executable sha256 **`c9816921214127a74b93033b424fea191205e24d7be05cc05c88b3a11f31c177`**, Assembly-CSharp `73ac20c00fb60290f6cd206217ca99780ee9c6f1bccd7e844d080a67ce94128c`, built 2026-09-15T13:03:06Z, manifest sha256 `319fb167eaffc4e163ed25e6dde26fd45a2714be432e7d811aee5dbad3778189` (`Builds/macOS/build-manifest.json`; evidence `interaction-build-50/`, log `interaction-build-50.log` "Build Finished, Result: Success"); Build49 (`53742268…`) and its manifest/evidence retained unchanged as the recoverable partial |
| Seal | `entry/paired-verifier-interaction-45.json` **PASS** — TS `43b3a6b1` / Unity `74c2141a`, DTO blob `9420d5ef5e5b7db5d9c18d2300f22a3d94074eb2` both sides, schema `sha256:e64a3b65…` (Save V20 / protocol4 / projection30; no wire change) |
| Admission | `interaction-native-admission-41.json` **PASS** (Build50 ↔ pair 45; meshes 128, dependencies 240) |
| Fixtures | `r3n1-dense-01` sha256 `2e0ede0b…` (unchanged, byte-verified); **`r3n1-dense-02`** sha256 `bd64bbeb1dce2f39455e20ee1b562f1d16c464bd76d907624fe7774e8d251005` (126 547 bytes, week 21); `f2-set-blocker-01` unchanged |
| Design | sheet `R3-N1-COMPACT-INSPECTOR-MEMO-SHEET.md` (12 REV02 edits) + **`R3-N1-SHEET-REVISION-02.md`** (R1–R5; §C.9 fallback withdrawn) at TS `43b3a6b1` |
| Guard / desktop | `entry/desktop-and-guard-admission-r3n1-02.json`: guard modules byte-identical to the 2026-09-14 record (hid-guard, witness, coherent map, startup, console-state, driver) |
Changed Unity paths (13 commits, +1 899/−201 lines incl. tests): `Runtime/Infrastructure/{StudioInputFocusGate, StudioRailReturnContracts,
StudioPeopleRailContracts}.cs`; `Runtime/Presentation/{StudioCameraInput, StudioCameraDirector, StudioSelectionManager, StudioHud,
StudioLaneInspectorHud, StudioPeopleRailHud, StudioProductionRailHud}.cs`; `Runtime/Presentation/UI/StudioWorkspaceHost.cs` (entry-card
geometry + one-card-at-one-depth yield only); tests `Tests/EditMode/{StudioInputFocusGateEscapeTests (new), StudioR3N1Impl10LayoutContractsTests
(new), StudioLegacySuppressionTests}.cs`, `Tests/PlayMode/{StudioNativeInputAndReturnRegressionTests (new), StudioProductionAndCampaignLayoutTests}.cs`.
Not changed: DTOs, schema, System Menu (its polled Escape path was inspected; the consumer that opened it — `StudioSelectionManager.HandleCancel` —
is the one gated), scenes, campaigns, launcher, Tools, hid-guard, package roots, Build49 evidence.

## K4. Verification actually run — rendered PlayMode, EditMode, TS, native runs (counts and applicability)
| Check | Source | Discovered/executed | Passed | Failed | Skipped | Evidence |
|---|---|---|---|---|---|---|
| EditMode (batch, whole platform) | Unity `e05b218` → `1861c49` (writer) | 1676 | 1676 | 0 | 0 | `r3n1-12/editmode-writer-01..04.xml` (+ `-04-railyield-blocked.xml`: 1675/1676, the deliberate pin) |
| EditMode | `c3207c0` (TEST-06) | 1697 | 1696 | 1 | 0 | `r3n1-13/editmode-tests-01.xml` — the one failure is the re-derived F10 pin against the not-yet-narrowed pictures rail |
| EditMode | `3a0ef0d` (IMPL-10) | 1697 | 1697 | 0 | 0 | `r3n1-14/editmode-writer-03.xml` |
| EditMode | `c06e419` (TEST-07) / `44cddab` (IMPL-11) / `74c2141` (TEST-08) | 1751 | 1751 | 0 | 0 | `r3n1-16/editmode-tests-03.xml`, `r3n1-14/editmode-writer-04.xml`, `r3n1-18/editmode-tests-01.xml` |
| Rendered PlayMode, class (Editor GameView) | `c3207c0` | 4 | 3 | 1 | 0 | `r3n1-15/playmode-rendered-test06-class-01.xml` — F11 read outside OnGUI (test), re-derived in TEST-07 |
| **Rendered PlayMode, full** | `c06e419` | 209 | 203 | 6 | 0 | `r3n1-17/playmode-rendered-correction-01.xml` — 1 product regression (DETAILS reserved the old fixed zone width above 100 %, fixed `44cddab`), 2 harness defects (registry publishing switched off by the host's first Update; `hud-open-build` publisher absent), 1 un-composed lane, 1 outside-OnGUI Tab release, 1 stale rail-yield pin — all re-derived in TEST-08 without weakening |
| **Rendered PlayMode, full** | **`74c2141`** | **209** | **209** | **0** | **0** | `r3n1-17/playmode-rendered-correction-02.xml` |
| Broken-candidate proof | `c3207c0` Runtime + TEST-07 tests | — | — | compile: 235 × CS0117 | — | `r3n1-16/playmode-broken-01.log` (the new laws do not exist on the broken candidate; the F10 pin failed on it, above) |
| TypeScript full suite | TS `43b3a6b1` | 5282 | 5277 | 0 | 5 | `entry/full-typescript-suite-06.{json,log}` (production TS unchanged since `31f6e70d`) |
| Command-owner stale tests | TS `e11933b2` | 4 | 4 | 0 | 0 | `entry/r3n1-dense-02-test-run.log` |
Batch PlayMode runs by the test owner (`r3n1-13/16/18/playmode-tests-*.xml`, 10/22 etc.) are retained as headless artifacts only
("No graphic device" / zero-rect); the rendered runs above are the applicable evidence. The rendered run's antiAliasing side effect was
committed once by mistake (`44cddab`) and restored byte-for-byte in `ae3695b`; Build50 is built from the restored settings.
**Native attempts on Build50 (each its own identity, admission and evidence; failed attempts preserved; none combined):**
| Attempt | Evidence (Unity `Evidence/Playability-Interaction-01/`) | Guard outcome | Steps | Finding |
|---|---|---|---|---|
| Run A (interrupted) | `early-2026-09-15T13-03-49-308Z` | admitted 13:03:53Z (unlocked, owner idle 7 281 s); player `c9816921…` launched, `000-lot.png` + `initial-map.json` captured 13:04:00Z; the driver's FIRST injected HID event (null token `67917745056450`) never received an ordered acknowledgement ("ownerinput: posted event was not acknowledged; no retry"); the driver then waited until the listen-only witness EXPIRED at its 7 200-s lifetime (15:03:54Z, `witness-end reason=expired`, 72 732 heartbeat records, no foreign input) and stopped: `WitnessUnavailable … Witness ended before the drive finished`; input state clean at start and end, owned events 0 | 0 | **clock-discontinuity finding**: the coordinator's shell clock advanced 13:03:48Z → 15:04:01Z across a ≤ 7.5-min wait loop. **Sleep is NOT supported as the cause**: `pmset -g log` shows powerd's 15-minute assertion summaries and the lid-open counter advancing continuously through the gap (`r3n1-19/sleep-and-desktop-evidence.txt`). Cause on the evidence: the unacknowledged injection blocked the driver for the witness lifetime; why the acknowledgement never arrived is not established (candidates: an event-tap/permission change for the freshly compiled `ownerinput` helper, or another desktop automation holding the event path — Codex Computer Use assertions were logged later at 16:18:53Z) |
| Run A2 (retry) | `early-2026-09-15T15-04-35-523Z` (`console-admission.json` only) | **refused at admission**: "No unlocked 60-second owner-idle admission" (owner idle < 60 s — the desktop was in use) | 0 | no player launched |
| Run A3 (retry, caffeinated) | `early-2026-09-15T16-20-04-515Z` | admitted 16:20:08Z after a read-only wait for owner idle ≥ 90 s; `/usr/bin/caffeinate -d -i -s -w <driverPid>` tied to the driver (recorded in `native-A3.log`, exited with the driver); player launched, `000-lot.png` + `initial-map.json` captured; stopped 16:21:36Z: `HumanInputDetected: foreign input detected — automation suspended` (physical `mouseMoved`, sourcePid 0) | 0 | the guard worked as designed; Howard confirmed in-session ("Sorry keep going") that the movement was his — desktop availability re-established for the next attempt |
| Run A4 (retry after Howard's "keep going", caffeinated, watchdog armed) | `early-2026-09-15T16-23-33-578Z` | admitted 16:23:33Z (owner idle 96 s); player `c9816921…` launched, `000-lot.png` + `initial-map.json` captured; **identical failure to the first run**: "ownerinput: posted event was not acknowledged; no retry" → `No ordered acknowledgement for null token 18956271512613` → the driver waited for the witness lifetime and stopped at 18:23:38Z (`witness-end reason=expired`, 72 732 heartbeats, no foreign input, owned events 0); the coordinator's watchdog did not fire (its evidence-directory glob failed under zsh nomatch) and the shell clock again advanced exactly 7 200 s | 0 | **specific blocker (native HOLD)**: on this desktop session the witness records the ownership-establishing null event of the FIRST helper (seq 1, `sourceStateId 0`) but never the ordered acknowledgement (`sourceStateId 1`) that the 06:25Z run recorded (`early-2026-09-15T06-25-20-387Z/hid-witness.jsonl` seq 3), and the token the driver waits for belongs to the LAST helper (pid 27204 / 92260), whose events the witness never sees at all. Guard/driver bytes are unchanged since the successful runs; the environment changed: a competing desktop automation (SkyComputerUseService "Codex Computer Use") holds event/assertion state since 16:18Z, and the `ownerinput` helper is recompiled at each start (a fresh binary may lack the Accessibility / Input Monitoring grant). Desktop-owner action needed before any further attempt: verify System Settings › Privacy & Security › Accessibility and Input Monitoring for the ownerinput helper and node, end the competing computer-use service during runs (or log out/in to reset event taps). No further retry was made (four attempts; no indefinite loop). |
| Run B (1280×720, dense-02) | script `run-B-1280-dense2.jsonl` prepared (101 steps: pictures overflow, Schedule-take route, the 200 % compact cell) | not started — the Run A blocker stands and the N1 reserve is exhausted at this record | 0 | NOT EXERCISED |
Pre-existing power assertions not started by this coordinator and left untouched: `caffeinate -dims` (pid 2372, since 2026-09-12) and
short `caffeinate -i -t 300` processes (pids 2893/4016, 16:18Z/16:22Z). Analyzer: `r3n1-19/analyzer-version.json` — the coordinator-side
map reader `check-run.py` v2 (sha256 `850ca1be…`) counts visible elements only, matching `mapsum.py`; the driver's capture/guard tools were
not changed (byte-identical hashes in `desktop-and-guard-admission-r3n1-02.json`); analysis outputs are named `<run>-check-v2.txt`.

## K5. DATA-1 / UX-STALE-NATIVE-01 — the bounded managed-mode attempt
- DATA-02 (test-author, 12 min): a read-only probe of all 17 existing checkpoint fixtures
  (`entry/r3n1-dense-02-source-probe.md`) found `native-post-start-run16` already in `scriptDevelopment.mode === "managed"` with one
  active production `prod-0015` carrying a live offered decision — so `activateScriptDevelopment` was never needed or attempted. From
  it, `entry/generate-r3n1-dense-02.ts` applied 3 × `commissionScript` (writer `t-dir-00`, the source's one spare contracted talent —
  lawful under `requireCommissionableWriter`) + 2 × engine `tick`, every step N=4-gated (cash $12,206,459 → $12,113,655, never
  negative, `productionQueue` empty at every evaluation), and wrote the immutable fixture `fixtures/r3n1-dense-02` (sha256
  `bd64bbeb1dce2f39455e20ee1b562f1d16c464bd76d907624fe7774e8d251005`, 126 547 bytes, week 21, digest `c5f13827…`; `wx`, mode 0600;
  r3n1-dense-01 byte-identical after the run). Wire counts: roster employed 2 / freelancer 10 / known 72; productionOperations 1
  (`ready-to-schedule`); development managed, 4 projects (1 inProduction, 2 review, 1 drafting); 0 released. **Pictures-rail overflow
  lawful: 4 cards** (1 production + 3 non-inProduction script cards — script cards counted only where the rail genuinely displays them,
  never relabelled as filming). Offered decision: `resolveProductionBlocker` / `scheduleShootingTake` on `prod-0015` ("Schedule the
  shooting take"), preserved untouched.
- Command-owner test `tests/r3n1-stale-schedule-take-02.test.ts` (TS `e11933b2`): STALE_REVISION and INTENT_NOT_AVAILABLE refusal on
  THAT decision (staleness induced by the unrelated lawful `acceptScreenplay` intent) and fresh-intent accepted-once idempotence — 4/4
  with the first test (`entry/r3n1-dense-02-test-run.log`). The first test's "nearest offered decision" wording stays as recorded; this
  second fixture's decision IS the literal Schedule-take route.
- Different immutable fixtures prove different things and are named as such: r3n1-dense-01 (people overflow, legacy mode), r3n1-dense-02
  (pictures overflow + the Schedule-take decision, managed mode), f2-set-blocker-01 (ordinary waiting). None occurred in one campaign.
- **Native (Build50):** NOT EXERCISED — Run B was never admitted (K4). UX-STALE-NATIVE-01 therefore stays at: server refusal proved by two
  command-owner tests (8 assertions across both fixtures); client-side prevention documented from source — `StudioWorkspaceHost.
  DisplayedProductionOperation.cs` re-derives the displayed decision from the CURRENT snapshot at submission (`StillDisplayed()`: same
  intent JSON, same `currentCommand`, same session/runtime/replacement) and refuses to send otherwise, and the deferred path re-validates
  against `displayedIntentRefresh` ("Confirming the action with the current studio state…"); the single-actor native client always submits
  the current `stateRevision` (`StudioBridgeClient.cs:620`), so a genuine stale submission is not constructible natively without a second
  actor — the visible-invalidation capture (accept a screenplay, return, re-derived Schedule take, accepted once, no duplicate dispatch) is
  scripted in `run-B-1280-dense2.jsonl` and remains owed. Residual unchanged in kind: "no native capture of a refused or visibly
  invalidated Schedule-take yet".

## K6. Charges — this correction, cumulative N1, whole program
| Counter | This correction (productive, session clock once) | Windows |
|---|---|---|
| Prior publication tail (reserve) | 4.65 min | 06:54:21Z–06:59:00Z (closing commit/push/read-back/reply of the continuation) |
| Capability | **63.98 min** | 10:19:46–11:03:00 (packet, briefs, IMPL-09/09b, DATA-02, DESIGN-02) · 11:26:30–11:47:15 (IMPL-10) |
| Reserve (verification/correction/delivery) | **≈ 131 min** = 109.25 + closing ≈ 22 (stamped in the private ledger) | 11:03:00–11:26:30 (TEST-06, rendered class run) · 11:47:15–12:14:38 (TEST-07, TS suite/push) · 12:14:38–13:05:00 (rendered suite ×2, IMPL-11, settings restore, TEST-08, push, Build50, seal 45, admission 41, Run A start) · 15:04:00–15:05:30 (A2) · 16:18:00–16:24:30 (clarification, evidence, A3, A4 start) · 18:24:00–close (A4 outcome, record, publication, ledger) |
| Excluded — documented inactive latency, no productive activity (no tool call, no file change) | 13:05:00–15:04:00 (119.0) · 15:05:30–16:18:00 (72.5) · 16:24:30–18:24:00 (119.5) = 311 min | the driver was blocked waiting for an acknowledgement that never came (twice, each exactly the 7 200-s witness lifetime) and the coordinator sat idle between A2 and the clarification; NOT sleep (`r3n1-19/sleep-and-desktop-evidence.txt`); listed as latency, separate from productive charges |
| **N1 cumulative** | capability **224.58 / 1 200 min** (3.74 h of 20) · reserve **≈ 353 / 360 min** (≈ 5.9 h of 6; ≈ 7 min remaining at the close — effectively exhausted) | prior 160.60 / 217.55 + this correction |
| Whole program (provisional) | capability remaining ≈ 44.66 h · reserve remaining ≈ 11.4 h (last 6 h protected, untouched) | from C5's 45.729 / 13.652 |
Classification rule: identical to C5 (specialist wall-clock never summed; regression authoring, corrections found by verification, builds,
seals, admissions, native attempts and the record charged to the reserve; feature/correction implementation, fixture and design to
capability). The alternative reading (TEST-06/07 regression authoring as capability, ≈ 51 min) is stated for Current Ops only, not
applied. Unattributed setup/smoke time remains NOT REPORTED, not zero. Balances PROVISIONAL.

## K7. Residuals, remaining coverage, stop state, publication
**Residuals (honest labels):**
1. **Native proof of F7–F15, the 1280×720/200 % cell, DATA-1 pictures overflow and UX-STALE-NATIVE-01 — NOT EXERCISED** (hold). Blocker
   and the desktop-owner action are in K4. Both run scripts are ready; cost when admitted ≈ 15 min of reserve — which N1 no longer has:
   Current Ops must either allocate from the whole-program reserve (11.4 h, last 6 h protected) or accept the candidate as
   source-corrected/rendered-verified only.
2. The rendered 209/209 does not close the nine defects natively; every F row above is FIX LANDED · RENDERED PASS · NATIVE NOT EXERCISED.
3. Addendum R3.3 (tab strip capped at 2 scrolling rows, pictures footer abbreviations) not implemented → the pictures list at 1280×720/200 %
   keeps a ≈ 10 px shortfall against its floor (a scroll cost, declared). R1.5 "More actions ▸" not implemented (no 3-action footer exists
   in the shipped variants).
4. Unity `Evidence/` is gitignored: all writer/test reports, xml/logs and native attempt directories are retained locally and indexed by the
   private review publication (below); originals untouched.
5. Carried from C6 unchanged: remaining screens/workflows, portrait/icon/font/stage art, lawful dragging, help/history, text acceptance;
   S6 fit conclusion stands. No Owner acceptance is claimed; Build46 = Current Ops-qualified engineering checkpoint; P13A accepted product.
**Cleanup and ownership at this record:** no driver, player, ownerinput, witness, FIFO holder or coordinator caffeinate process remains
(verified by process listing after A4); pre-existing `caffeinate -dims` (pid 2372) and the desktop's own automation are not mine and were
not touched; ProjectSettings restored (`ae3695b`); both worktrees clean and pushed; Build49 evidence/manifest untouched; Owner campaigns
untouched (only disposable synthetic fixtures were bound). Fable remains integration/native-input owner; actual new input still requires
admission and the desktop-owner action above.
**Publication:** private Unity review branch `docs/playability-delivery-review-20260913-01`, new folder
`docs/evidence/r3n1-native-correction-20260915-01/` (index `00-START-HERE.md`, this record, the matrix, essential text evidence,
representative captures, `manifest.json` + `SHA256SUMS.txt`; machine paths and private session links sanitized in copies only; witness
JSONL, player bytes, checkpoints and the 190-map archives withheld with locators). Fast-forward pushes of owned WIP/docs refs only; no PR,
merge or protected promotion; no P13B/P14/P15/P16.
**Next action:** desktop owner clears the acknowledgement blocker (K4); then, with a Current Ops reserve disposition, the two prepared
runs (A then B) under the unchanged guard with caffeinate tied to the driver, followed by the K2 native columns and Owner review.

---

# R3-N1 continuation record — 2026-09-14/15 · OPS-R3-N1-CONTINUE-20260914-02

**N1 CONNECTED NATIVE REVIEW REACHED ON BUILD49 — DELIVERED AS A PARTIAL WITH NINE NATIVE DEFECTS DECLARED, ONE DECLARED FALLBACK CELL AND ONE LAWFUL-DATA LIMIT. NOT OWNER-ACCEPTED. NO P13B, PR, MERGE OR PROTECTED PROMOTION.**
This section sits above the R3-N1 execution record (R1–R8), the successor record (S1–S7) and the historical text, all unchanged.
It is the one evidence-linked record of the continuation's acceptance, the desktop statement, the design-owner resolution,
the delivered design/source/test/fixture increment, the rendered and native verification actually run, charges, and the
remaining full-overhaul coverage. Private identifiers stay in the Git-private `fable-local-transfer-20260914-01/
r3n1-continuation-acceptance-local.json` and `r3n1-ledger-local.json`.

## C1. Acceptance, desktop statement, design-owner resolution
- Order verified: packet `R3-N1-CONTINUATION` (SHA256SUMS 4/4) == Git blob `9b4760cd00ccad20b04dc1e07ee789a504e2f7a8` at
  `3b64da61` (on `origin/docs/playability-r3-hybrid-execution-01`). Same coordinator session as R1 (Fable 5.1, bypass
  permissions, hooks disabled by flag, `--add-dir` Unity); registry unchanged; Workflow tool not used (coordinator contract);
  every specialist ran Opus or lower (uiux-designer/unity-ui = opus, test-author = sonnet by profile). Continuation charged
  from `2026-09-14T19:13:42Z`; the session was idle `2026-09-14T23:02Z → 2026-09-15T06:10Z` (excluded from every counter).
- **Desktop:** Howard's statement — "The desktop is available now for the authorized R3-N1 rendered PlayMode and native tests. Keep
  the existing guard and all build/fixture checks." — recorded verbatim in TS `Evidence/Playability-Interaction-01/entry/
  desktop-and-guard-admission-r3n1-01.json` with the guard-module hashes (byte-identical to the 2026-09-12 record). The guard
  (console lock, 60-s HID idle, listen-only witness, owned window binding, bound manifest, fixture provenance, stale-source check)
  stayed mandatory and admitted every run; zero suspensions; no human input witnessed.
- **Design owner:** the R3 design session is inactive (last design commit `b56088d6`, 2026-09-12; no worktree holds
  `docs/uiux-whole-game-review-01`; no writer evidenced) → the registered uiux-designer was assigned sole continuation owner of the
  ONE missing sheet on the disjoint path `docs/engineering/playability-launch-review/r3-n1-design/` (TS `504add39`). R3 files
  untouched; the hybrid selection was not reopened; no second designer.

## C2. Rendered PlayMode — actual counts (Editor GameView via `ConfigureEditorViewportForVerification`, never `-batchmode`)
| Run | Source | Executed | Passed | Failed | Skipped | Findings |
|---|---|---|---|---|---|---|
| `r3n1-01/playmode-rendered-baseline-01` | Unity `7471d24` (preserved checkpoint) | 202 | 200 | 2 | 0 | F1 stale threshold (test): LOCATE height is exactly `max(24·band, 22·text)`; F2 (production): receipt overlapped the slid memo at 1280×720/150 % |
| `r3n1-04/playmode-rendered-final-01` | Unity `ea451a39` | 202 | 200 | 2 | 0 | F3 route identity (test); F4 IMGUI Layout/Repaint mismatch (production, fixed `3d58d16`) |
| `r3n1-07/playmode-rendered-final-02` | Unity `c6161ce4` | 202 | 201 | 1 | 0 | F4 gone; F5 focus-restore race in the test's zero-yield sequence (test) |
| `r3n1-09/playmode-rendered-final-03` | Unity `d2f3f12d` | 202 | 201 | 1 | 0 | F6: picture card LOCATE never published above 100 % — zone law `22·s` under the `24·s` publication floor (production, fixed `e474f6e`) |
| `r3n1-10/playmode-rendered-class-01..04` (one class) | `e474f6e` + tests | 15 | 14/14/14/**15** | 1/1/1/**0** | 0 | diagnostic dump: at 1280×720/200 % the pictures list viewport is 144 px (four 60-px chrome rows) so the fixture's 477-px card keeps its LOCATE zone off-screen; test now reveals it through the product's own route |
| **`r3n1-10/playmode-rendered-final-04`** | **Unity `18b893a6`** | **202** | **202** | **0** | **0** | clean |
All ten batch-only failures and F1–F6 are closed (F1/F3/F5/F6-test re-derived by the test owner, never weakened; F2/F4/F6-law fixed by
the writer). Batch records are retained beside the rendered ones; batch PlayMode still cannot render IMGUI (environment).

## C3. Delivered — exact identities and changed paths
| Identity | Value |
|---|---|
| Design sheet | `r3-n1-design/R3-N1-COMPACT-INSPECTOR-MEMO-SHEET.md` + 4 SVG (TS `504add39`): lot-centre lane, tools row (BUILD + `memo-details-open`), compact next-action band, explicitly opened Studio-next-steps sheet, compact inspector overlay with both rails alive, occlusion order, Escape ladder, text rules, keys 1/2/3; the 1280×720/200 % inspector cell declared a full-screen fallback |
| Unity | `7471d24` → **`18b893a6`** (23 commits: IMPL-03 `1af1e4b..f57599b`, IMPL-04 `bfc61dd..25a2882`, IMPL-05 `fc16267..72a02a8`, IMPL-06 `3d58d16`, IMPL-08 `e474f6e`; tests `ea451a39`, `c6161ce4`, `d2f3f12d`, `18b893a6`); pushed fast-forward, no force |
| TS | `afad4137` → **`2f16c22e`** (design sheet `504add39` + stale-route test `2f16c22e`; production TS unchanged = `31f6e70d`; `dist/studio/engine.mjs` `af1e8897…` unchanged) → this record; pushed fast-forward |
| Fixture (DATA-1) | `Evidence/…/fixtures/r3n1-dense-01/generated-r3n1-dense-01.checkpoint.json` sha256 `2e0ede0b699994970d04cf3de8678c61cf2b4fd9562c69c8e9625eb0a8924f5b`, 448 724 bytes, week 316, digest `7f7a4eab…`; generator `entry/generate-r3n1-dense-01.ts` from native-performance-316-01; 4 lawful `signContract` actions, each N=4-gated (`weeklyPayroll` + tuning overhead + `weeklyPlacementOperatingCost` + `weeklyResearchSpend`, due commitments 0, cash ≥ 0 throughout); wire counts employed **11** / freelancer 6 / known 68, productions 1 (`prod-0315` development-working), development projects 0 (campaign in `legacy` script mode), released 0 |
| Seal / Build49 | `entry/paired-verifier-interaction-44.json` PASS (TS `2f16c22e` ↔ Unity `18b893a6` from `origin`, DTO blob `9420d5ef` both sides); **Build49** built `2026-09-15T06:24:52Z`, executable sha256 `5374226871edfb14e770d4bdbb92ad26e75ddaeb5b62fb9a405e63a1652351cd`, Assembly-CSharp `f5ac1c42…`, manifest sha256 `173b80a2b11c98eb2d332d51f82e6f018880347fb5399de2134b34da7d86bf13`, engine/worker/worker-source unchanged, cold-import + scene validation clean, `interaction-native-admission-40.json` PASS. Build48 (`8b83d164…`, seal 43, admission 39) superseded and retained; Build47/Build46 preserved |
| TS test | `tests/r3n1-stale-schedule-take.test.ts` 2/2: STALE_REVISION / `state-stale` with unchanged digest, and INTENT_NOT_AVAILABLE / `intent-unavailable` for the old intent id at the current revision (the fresh intent then accepted once) — **server refusal**; full TS suite 5275 passed / 5 skipped / 0 failed (`entry/full-typescript-suite-05`) |
Changed Unity paths: `Runtime/Infrastructure/{StudioInputFocusGate (new), StudioRailReturnContracts (+StudioLayoutPassLatch, lane/band/sheet/overlay/inspector-content laws, PublishedControlMinHeight), StudioMovieRailContracts, StudioBridgeClient (+ReleaseMemo, +ResearchMemo)}.cs`; `Runtime/Presentation/{StudioCameraInput, StudioProductionRailHud (LocateZoneHeight/Rect), StudioPeopleRailHud, StudioDevelopmentCardHud, StudioHud (partial), StudioLaneInspectorHud (new), StudioBuildCommandHud}.cs`; `Runtime/Presentation/UI/StudioWorkspaceHost.cs` (+8, read-only seam); tests `Tests/EditMode/{StudioInputFocusGateTests, StudioScreenplayInspectionContractsTests, StudioLaneLayoutContractsTests, StudioLaneInspectorContractsTests}.cs` (new), `{StudioPictureCardContractsTests, StudioMovieRailContractsTests, StudioProductionRailTests}.cs` (extended), `Tests/PlayMode/StudioProductionAndCampaignLayoutTests.cs` (F1/F3/F5/F6 re-derived, memo assertions re-derived to the band/sheet). EditMode whole platform **1676/1676**. Not changed: DTOs, schema, camera director/controller, System Menu, scenes, campaigns, launcher, package roots, historical evidence.

**DATA-1 actual result:** people-rail overflow reached lawfully (11 employed); pictures-rail overflow **not lawfully reachable** from the
admitted source — `commissionScript` and its siblings require managed script development, and `activateScriptDevelopment` lawfully
refuses while `prod-0315` is active (reproduced and asserted, not routed around). No cash injected, no relabelling; the waiting picture
stays `f2-set-blocker-01` (`prod-0327`, resource-wait). Side finding for its owner: `tests/_m5Fixtures.ts` `studioTheWeekBeforeWrap`
throws under the current engine (used only by `_m5PlaytestSave.ts`).

## C4. Native tasks, captures, critique
Driver direct mode, Build49, guard admitted; text sizes set in-run via `studio-menu-text-*`; every run ended by the game's own UI Quit
(`campaign-leave-discard` on the disposable synthetic fixture), input finalization **clean**, player exit 0.

| Run | Viewport · fixture | Evidence (Unity `Evidence/Playability-Interaction-01/`) | Steps | Performance |
|---|---|---|---|---|
| R-A | 1440×900 · r3n1-dense-01 · 100/150/200 % | `early-2026-09-15T06-25-20-387Z` (report.json, steps.json, 190+ maps, screenshots `r3n1-*.png`) | 194 | 30-s sample 3 408 frames, captured through quit |
| R-D | 1280×720 · r3n1-dense-01 · 100/150/200 % | `early-2026-09-15T06-45-52-043Z` | 55 | 30-s sample 3 227 frames, captured through quit |
| R-W | 1280×720 · f2-set-blocker-01 (waiting) · 100 % | `early-2026-09-15T06-50-12-704Z` | 25 | not sampled |

**Demonstrated natively (element map + screenshots):** lane composition (lane 836 px at 1440×900, 716 px at 1280×720; employees rail
18..264 / 18..242, pictures rail 1142..1428 / 1000..1268; tools row BUILD + `memo-details-open`; band 94/124/218 px); compact inspector
overlay bottom-anchored 680 wide for person (311 @100, 536 @150 = ceiling, 490 @200) and picture (390 @100) with **both rail plates
published, band yielding, chip/BUILD/MENU present**; the declared fallback at 1280×720/200 % (`inspector-fallback` published, person →
full Profile workspace, picture → full Production workspace, Escape returns to the lot); memo sheet at every cell incl. 1280×720/200 %
(680×190) with `memo-scroll`, `memo-intent-*` and `memo-research-*` routes; Back control retains both offsets, filters and selection;
row cursor Up/Down without any camera movement (world anchors byte-equal) and Enter inspecting the cursor row two rows down; Locate from
the picture overlay frames the worksite with the camera's own `world-back-to-studio` while overlay and rails stay alive; Waiting/Active
filter and library toggle reset only the pictures list, the People tab resets only the employees list; BUILD reachable and its Escape
closes it without the menu; wheel over the pictures list never changed the camera; waiting picture `prod-0327` shows the wire's cause
"Held for a set check" + detail + consequence, remedy labels as text, company members with exact ids; a person's withheld Locate carries
the wire's reason ("On the lot this week; no body to locate right now.").

**UX-STALE-NATIVE-01:** server refusal proved by the TS command-owner test (STALE_REVISION / INTENT_NOT_AVAILABLE); client-side
prevention observed only as the full workspace re-deriving its displayed commands from the fresh snapshot on reopen (no production in a
Schedule-take state exists in any lawful fixture: the dense fixture's picture is in development, the waiting fixture's in resource-wait).
Still not a PASS; the exact residual is "no lawful actionable Schedule-take route reachable natively yet".

**Native defects found (all real, none hidden; fixes are the next stage):**
- **F7** Escape on an open compact overlay pops it **and** opens the Studio Menu (the polled Escape owner is not gated by the overlay).
- **F8** overlay → OPEN PROFILE → Escape resets the employees rail offset to 0 (the Production-workspace route retains it).
- **F9** after the Tab ring leaves the employees search field, arrows/Enter still behave as text entry until Escape (IMGUI keyboard
  control not released).
- **F10** while a lot selection is active (after Locate), a rail row click neither opens the overlay nor a workspace (dead click;
  Escape clearing the selection restores the route).
- **F11** activating Find gives the field no keyboard focus — typing "a" panned the camera; **F12** Escape in Find opened the menu.
- **F13** at 200 % (1440×900) the rail headers clip/overlap ("EMPLOYEES 11" → "S 11", "ROSTER ▸" wraps over it, "PICTURES" over
  "No decisions"), the card title and stage word break mid-word beside the 144-px image slot, and LOCATE overlaps the wrapped state
  line — the fixed 286-px rail does not pass the text rule at 200 % without stacking the image above the text.
- **F14** at 1440×900/200 % the overlay header (unclamped 3-line 40-px title) consumes the 490-px overlay; `inspector-open-production` /
  `inspector-locate` publish off-screen (y −138 / −64) and the body is 1 px — the explicit route is unreachable at that cell.
- **F15** the compact inspector's scrolling body has no opaque background; cause/detail/consequence/remedy/company lines draw over
  the lot and are hard to read at every size (header/footer have stock).
- Observations: the pictures list viewport is 102/186/144 px at 1280×720 and ~250/186/284 px at 1440×900 across 100/150/200 % because
  the rail chrome rows scale with text and stack (F6's rendered root); `inspector-fallback` is published whenever the full workspace
  path is used (marker semantics); the driver's `text` action cannot type into rail fields, so Find was exercised with a letter key.

**Native product critique (from the captures, replacing R5's paper critique):**
1. The composition is right and the lot is back: 836/716 px of clickable centre with rails, tools row and band, matching R3's
   people-left / pictures-right / useful-centre grammar and its 03-selected inspector placement (x 366..1046 at 1440×900).
2. Escape is the weakest control: three owners (overlay, Find, menu) still answer the same key (F7/F12); one shared ladder is needed.
3. 200 % is not yet a supported reading size on either viewport: chrome rows scale, headers overlap, cards break words, the overlay
   header eats the body (F13/F14) — the sheet's §E rules must be applied to headers/chrome and the overlay header clamped to the body.
4. The overlay body needs its cardstock (F15) — a one-line style fix but it defeats every inspection until done.
5. Focus/selection interplay (F8/F9/F10) breaks the "Back restores everything" promise on three routes; the return-context law is
   right, its callers are not.
6. Density remains thin: with lawful fixtures only the employees rail scrolls; the pictures rail shows one card everywhere.
7. Unchanged from R5: placeholder monogram portraits; no screenplay overflow; typography at 100 % reads well.

## C5. Charges — this continuation and cumulative (charged once; session clock; idle gap excluded)
| Item | Value |
|---|---|
| Continuation capability | `19:13:42Z → 20:41:40Z` = **87.967 min = 1.466 h** (designer, IMPL-03/04/05, DATA-01, coordination) |
| Continuation verification/correction/delivery | `20:41:40Z → 23:02:00Z` = 140.333 min + `06:10:00Z → 06:54:21Z` = 44.350 min + prior closing tail 0.5 min carried once = **185.183 min = 3.086 h**; this record's own commit/push/read-back tail is charged once in the final reply and carried by the next session |
| N1 cumulative (caps 20 h / 6 h) | capability **160.600 min = 2.677 h**; verification **217.550 min = 3.626 h** — both inside their caps; 12/16/20 h checkpoints never reached; no reserve was spent on unbuilt capability |
| Whole program, known cumulative | capability **1 576.266 min = 26.271 h**; reserve **1 340.873 min = 22.348 h** |
| Remaining in the issued 72 / 36 envelope | capability **45.729 h**; reserve **13.652 h** (last 6 h protected → 7.652 h usable) — PROVISIONAL |
| Specialist usage (informational) | uiux-designer ≈25 min / 238k; unity-ui IMPL-03 20 min / 208k, IMPL-04 26 min / 261k, IMPL-05 20 min / 236k, IMPL-06 17 min / 188k, IMPL-07 10 min / 104k, IMPL-08 7 min / 79k; test-author DATA-01 15 min / 179k, TEST-02 24 min / 334k, TEST-03 20 min / 222k, TEST-04 6 min / 75k, TEST-05 ~50 min / 248k |
| Unattributed setup/smoke/helper sessions | **NOT REPORTED, not zero** (unchanged) |
Lead/session vs productive: this record, like R6, charges one overlapping session clock (specialist wall-clock never summed) and does not
compare it with the earlier distinct reviewer counters; the idle gap is the only excluded interval and is stamped in the private ledger.

## C6. Remaining full-overhaul coverage and costed later-stage update (deduplicated)
- **N1-close (next stage, not authorized here):** F7–F15 fixes ≈ 4 h capability (Escape ladder in the polled owner 1 h; F8/F9/F10 focus
  callers 1 h; 200 % chrome/header/overlay-header rules 1.5 h; F15 0.25 h; Find focus 0.25 h) + one rendered rerun and a native
  re-pass ≈ 1.5 h verification; a lawful Schedule-take fixture for UX-STALE-NATIVE-01 (requires a managed-mode source) ≈ 1 h.
- **Delivered shared work to deduct once from S2/S6:** list-level keyboard model incl. row cursor and camera gate, lane composition,
  next-action band + memo sheet (the memo/journey disposition), compact inspector overlay, explicit lifecycle mappings, LOCATE
  publication law, rendered PlayMode discipline ≈ 9 h capability delivered → S2 remainder ≈ 3 h / 2 h; memo/journey strip 0.
- S3–S7 unchanged from S6 (24/6, 10/3, 8/2, 5/2, 0/12). Remaining program ≈ **55.5 h capability / 27.5 h reserve** against
  45.7 h / 13.7 h remaining — the S6 fit conclusion stands; staged authorization still required; no art, dragging, help or screen
  coverage made optional.

## C7. Stop state
Stopped at N1's connected native review with declared defects. Preserved: Build46 package on the Desktop, Build47/48 records, P13A, all
campaigns, old evidence, both worktrees clean (Unity `18b893a6`, TS at this record). Publication: fast-forward of the two owned WIP
branches only. No PR, merge, protected-ref promotion, hook/goal activation, P13B/P14/P15/P16 coding, global configuration change.
Rollback source: Unity `7471d24` (Build47), TS `31f6e70d`.

---

# R3-N1 execution record — 2026-09-14 · OPS-R3-N1-EXECUTE-20260914-01

**R3-N1 IMPLEMENTED AS A LABELLED PARTIAL ENGINEERING INCREMENT — NOT N1 COMPLETION. CANDIDATE REVIEW READY; NATIVE INPUT NOT ADMITTED.**
This section sits above the successor readiness record (S1–S7, unchanged) and the historical text. It is the one
evidence-linked record of the restarted coordinator's acceptance, the released increment, its actual verification,
charges, remaining coverage and the next-stage recommendation. Nothing here starts a later package, native input, a
PR/merge or a protected promotion. Private identifiers stay in this worktree's Git-private
`fable-local-transfer-20260914-01/r3n1-session-acceptance-local.json` and `r3n1-ledger-local.json`.

## R1. Acceptance, actual session and registry

- Continuation accepted from the S1–S7 header (TS `31f6e70d558c16be17d547f316adbea84e4a765e`) and the private successor
  acceptance of `2026-09-14T17:02:49Z`; that home-launched session is superseded. Order packet `FABLE-R3-N1-EXECUTION`
  verified (SHA256SUMS 5/5; packet 01 == Git blob `a521b6345e4bdf71aa5810458ad2ca3087fd7818` at `0728477a`).
- **Actual session:** started `2026-09-14T17:18:41Z` from the TS worktree with
  `claude --dangerously-skip-permissions --settings '{"disableAllHooks":true}' --add-dir <Unity>`; CLI 2.1.270;
  runtime model **`claude-fable-5-1` (Fable 5.1)** = the Owner's saved default, no override, no Opus/manual substitution;
  bypass permissions as the Owner selected; hooks disabled by flag and absent by configuration; effort set to ultracode by the
  Owner but **the Workflow tool was not used** (FABLE-COORDINATOR forbids dynamic workflows; the order caps two named
  specialists; no swarm). Owner direction received mid-session and applied: every subagent runs Opus or lower; Fable only
  orchestrates.
- **Registry:** the harness listed all six custom roles at start (contract-auditor, instrumentation, sim-core, test-author,
  uiux-designer, unity-ui); profiles on disk unchanged; validator/probe/smoke and F-A/F-B/F-C not repeated. Actual specialist
  models remain CONFIGURED ALIAS / NOT EXPOSED (unity-ui = opus, test-author = sonnet by profile).
- **Ownership:** coordinator/integration owner = this session; production writer = unity-ui (two dispatches, sequential);
  test owner = test-author (disjoint test paths); native-input slot held by the coordinator, **not admitted** (no explicit
  current desktop availability exists in the order or the prompt); existing designer retains ownership (no uiux-designer
  dispatched). At most one specialist ran at a time (Unity holds a project lock).

## R2. Source uptake completed (exact files, HYBRID confirmed)

R3 archive (Desktop verified root): README, DESIGN, REVIEW, WALKTHROUGH, PROVENANCE, package-manifest.json,
source-reuse.json, evidence/candidate-repairs.json, evidence/candidate-controls.json, index.html, backlot.js,
movie-cards.js, lot.js/data.js (partial); previews 01-mature-annotated, 02-early, 03-selected, 04-waiting, 05-busy,
06-small-enlarged, 07-small-waiting, rail-hybrid. Back/focus repair inspected in `movie-cards.js` (`snap()`, `go()`,
`back()`, `restoreUI()`: trail of both rail offsets, body offset, filters, Find text and invoking focus; a missing record
never substitutes a neighbour). Authority read: FABLE-COORDINATOR, SOURCE-INDEX, TASK-TEMPLATE, setup/smoke receipts,
06 S1–S7 + continuation update, issued04 §3–§7, later05 §5–§6, Owner selection, Owner clarification (memo grep).

## R3. Gates and checks — facts

| Gate | Finding |
|---|---|
| WIRE-1 | Satisfied by existing DTO fields: roster rows/counts (`population`, `nameShared`, `canLocate`, `currentWork`, `availability`), presence (`talentId` join, `activity`/`workTitle`/facility), `productionOperations` (`operationalState`, `attention`, `stateLabel`, `facilityLabel`, `locationBuildingId`, `companyMembers`, `blocker`/`blockerAnatomy` headline+detail+remedies, `stateWeeksRemaining`), development projects, `releaseResults`. **No wire delta proposed.** DTO blob `9420d5ef…` identical on both sides; schema `sha256:e64a3b65…`; `dist/studio/engine.mjs` `af1e8897…` unchanged; `npm run check:bridge-contract` verified. |
| DATA-1 | Measured on the admitted fixtures through the wire roster: early wk12 0 employed; native-casting-clean-run13 wk15 2/0; native-performance-316-01 wk316 **7 employed / 1 production** (development-working); f2-set-blocker-01 wk330 **7 employed / 1 production** (`resource-wait`, `warning` — a genuine waiting picture); native-performance-6240-01 0 employed. No duplicate employed names, no employed-without-presence rows. A lawful `signContract` loop from wk316 reaches 50 employed in 13 weeks at −$3.0M cash (no-hard-bankruptcy law lets it continue); with a $1.5M signing floor 39 employed, still negative within 13 weeks under payroll. **40+/20+ is not available lawfully and solvently from existing fixtures; nothing was generated or mutated.** Bounded generator proposal in R7. |
| D-1 | R3 supplies the compact inspector at 1440×900/100 % (03/04) and 1280×720/Enlarged (07) only; missing the 150 % state, 1280×720/100 %, 1440×900/200 % and the corner-tool/global-tool occlusion rule (REVIEW.md names it open). **The compact overlay was not implemented**; inspection reuses the existing full-screen Profile/Production/Result workspaces with retained-context Back — a labelled partial. |
| Layout | The current left edge is the full-height journey memo (`WorkflowPanelRect` 18..418 base, default visible) with real next-step intents; R3 never shows it. Coexistence law implemented: the employees rail owns the left edge, the memo slides right keeping 400·s where room exists, the BUILD chip follows. Lot centre (paper): **≈316 px @1280×720, ≈436 px @1440×900 at every text size** (716 @1720×1045, 882 @1920×1080). First critique item. |
| Native | Not admitted (no explicit desktop availability). Proof plan drafted (`r3n1-native-plan.jsonl`, scratchpad copy in the Git-private dir) — not executed. UX-STALE-NATIVE-01 remains a declared residual. |
| PlayMode | Headless batch editor has no graphics device: `StudioProductionAndCampaignLayoutTests` class run 9/15 twice (6 failures all `No graphic device is available`, including 5 untouched tests). Full batch suite: 192/202 passed, 10 failed — every failure environment-bound (the four memo-geometry tests state "Run this real IMGUI test with a rendered GameView, without -batchmode or -nographics"; the layout tests report "No rendered rect …" / no Repaint; one SetUp "No graphic device"); `r3n1-01/playmode-full-batch-01.{xml,log}` (pre-increment batch baseline 77/79 with two known batch-only failures). The 195-test GUI PlayMode pass needs the Editor window = desktop → **held with the native gate**. |
| HUD marque | The native HUD has no studio-name/timeline marque (living-time chip only) → nothing to overlap in N1; R3-7 stays S2. |

## R4. Delivered increment — exact identities and changed paths

| Identity | Value |
|---|---|
| TS | `31f6e70d558c16be17d547f316adbea84e4a765e` (no production edits; engine bundle unchanged) → documentation descendant the commit that carries this record (see Git) (this record) |
| Unity | base `e8c59d8672b6e32de73ed10628abeff49bc1a95e` → **`7471d243ba8fb688858f5658580d2a0b39600d7d`** on `wip/playability-interaction-01-client` (12 commits: 8 production by unity-ui `54f729f..ddeb11b`, 4 tests by test-author `9a94080..7471d24`); pushed fast-forward to `origin` (no force; no protected ref) for handoff/seal |
| Paired contract seal | **PASS** — TS `Evidence/Playability-Interaction-01/entry/paired-verifier-interaction-42.json`: seal mode, protocol 4 / projection 30 / schema `sha256:e64a3b65…`, generated contract `ad7d522f…`, DTO blob `9420d5ef…` on both sides, TS `31f6e70d` ↔ Unity `7471d24` (both refs read from `origin`) |
| Build47 | **Build47** — `Builds/macOS/Project Studio Visual Spike.app` built `2026-09-14T19:01:53Z` by `StudioPlayabilityBuildAdmission.VerifyAndBuildMacOS` (log `interaction-build-47.log`, evidence `interaction-build-47/`); executable sha256 `efbaafc95c99ca4242c9d498e1cc2cefaa391936e51c37f5a3396e08ba7e65d4`; Assembly-CSharp `9da422a33fcf71de6e40c5c88192ef6fb438778e87975adc9b5ad74fe66c2b09`; manifest sha256 `ec9504229cb7cb9c15c01ae57de253812399e7a02e00e513c472d64e1054d13b` binding Unity `7471d24` / TS `31f6e70d` / engine `af1e8897…` / worker `807f28a6…` / worker-source `81c8323b…`; cold-import admission clean (128 meshes, empty failed-dependency intersection), scene validation clean; admission record `interaction-native-admission-38.json` PASS (build 47, pair 42). **Not launched; no native input.** As with every prior increment the player bytes in `Builds/macOS` now belong to Build47; Build46 stays preserved in the Desktop package `Playability-Candidate-20260913-01` and its own admission/manifest records |
| Assets | six 2D stage-object sprites `Assets/Studio/UI/Resources/StageObjects/{writing,casting,shooting,post,release,library}.png` (156×156, rsvg-convert 2.62.3 from R3 `art/*.svg`; PROVENANCE.md with SVG sha256s; no Lionhead pixels/fonts; separate from 3D lot geometry; S5's `Art/StageObjects` locator resolved to Resources because IMGUI loads by `Resources.Load`) |

Changed Unity paths: `Runtime/Infrastructure/{StudioPeopleRailContracts, StudioMovieRailContracts (additive), StudioMovieSlateContracts (additive), StudioRailReturnContracts (new), StudioBridgeClient (WorkflowPanelRect only)}.cs`;
`Runtime/Presentation/{StudioPeopleRailHud, StudioProductionRailHud, StudioRailReturnContext (new), StudioBuildCommandHud (chip left/width), StudioHud (one direction-aware line in the receipt's Avoid law)}.cs`;
`Runtime/Presentation/UI/StudioProfileWorkspaceContext.cs` (`ProfileOrigin.PeopleRail`); stage sprites + metas + PROVENANCE; tests
`Tests/EditMode/{StudioRailReturnContractsTests, StudioPictureCardContractsTests, StudioEmployeesRailContractsTests}.cs` (new) and
`{StudioProductionRailTests, StudioMovieRailContractsTests, StudioMovieSlateContractsTests, StudioRailScrollOwnerTests}.cs` (extended);
`Tests/PlayMode/StudioProductionAndCampaignLayoutTests.cs` (one method: superseded Tab-order assertions + roster fixture rows).
Not changed: `StudioWorkspaceHost*.cs`, camera/input owners, DTOs, schema, campaigns, launcher, package roots, historical evidence.

**Behaviour delivered (source-level; EditMode-proved; not natively observed):** employees rail LEFT from `roster.rows` where
`population == employed` in wire order, header = `counts.employed`, profession tabs + name/label/id search, placeholder
monogram portrait slot (labelled), status = the wire's own `currentWork`/`availability` words with optional same-snapshot
presence activity, no cap (bounded drawing, per-snapshot profile/presence index), no Locate on rows; pictures rail RIGHT as
HYBRID cards (stage sprite + wrapping title + stage word from the existing lifecycle vocabulary + `stateLabel`/attention
state; waiting shows the wire blocker headline; unknown lifecycle → explicit "UNKNOWN STAGE" card, never Writing); phase
track and section bands removed; filter (Active/Decisions/Waiting/stages/Library), Find (title or id), visible range,
inert boundary paging, library toggle; body click/Enter = inspect through the existing owners, Locate only via the explicit
zone; both-rail return context (offsets, filter, search, selection, invoking focus) captured on hide and restored on show
when the owner (client/session/runtime/replacement) matches, clamping only on shrink, dropping missing targets, never a
neighbour; `ProfileOrigin.PeopleRail` closes to the lot; keyboard Tab/Shift+Tab/Enter/Space/PageUp/PageDown/Home/End/
Escape/Left-Right; rail widths fixed to the viewport (R3 258/236 and 286/268 × viewport scale), type/rows/cards reflow at
100/150/200 %; element-map names for every control; memo/BUILD coexistence; selection receipt dodge made direction-aware.

**Verification actually run:** EditMode whole platform 1428/1428 at `ddeb11b` (writer run 07) and **1515/1515** at `7471d24`
(test-author full run; +87 requirement-derived tests, 0 production defects found); targeted runs 104/104 and 130/130; zero
`error CS` in every log. Logs/xml under Unity `Evidence/Playability-Interaction-01/r3n1-01/` (gitignored; writer-report.md,
test-report.md). PlayMode: see R3. TS suite not rerun (no TS change; contract sync verified).

## R5. First product critique — R3-N1 against the connected task (from committed laws and paper geometry; not a native observation)
1. **The journey memo squeezes the lot.** Employees (236/258) + memo (400) + pictures (268/286) leave ≈316 px of lot at
   1280×720 and ≈436 px at 1440×900. "The studio lot is the primary game surface" is not honoured on the 1280 class. The memo
   is the film-journey family's surface (S3/designer); R3 shows no memo. Needs a designer disposition (fold notices/next-step
   intents into the HUD or a collapsible strip) or a minimum-viewport statement. Not hidden, not resolved in N1.
2. **Inspection still hides both rails** (full-screen workspaces with scrim). The selected experience is a compact overlay
   with both rails alive — held on D-1. N1 is PARTIAL by the order's own definition.
3. **Screenplay cards have no inspector**; they only select/Locate Development/Casting. Film-journey family (S3).
4. **Placeholder portraits** (initial monograms, labelled). Portrait proof (S6) unchanged.
5. **UNKNOWN STAGE cards** replace the old withhold-status-unavailable presentation (vocabulary is closed on the TS side, so it
   should never occur in a paired build); confirm intent.
6. **Density.** No lawful admitted fixture lets the pictures rail scroll; "both rails at nonzero offsets" is satisfiable only
   for employees (7 rows scroll at 1280×720 and at 150/200 %). DATA-1 (R7).
7. **Keyboard.** Up/Down row navigation absent: the camera owns the arrows; needs an input focus gate (S2 R3-1).
8. **Typography.** 14 px bold card titles (R3) are smaller than the pre-R3 18 px; no letter tracking in IMGUI; at 200 % in a
   236/268 px rail names wrap to 2–3 lines and titles ellipsise after ~12 characters (tooltip carries the full title).
   One token change if the Owner prefers the larger title.
Native watch items from the writer: one-frame memo geometry staleness on rail show/hide (OnGUI ordering); possible focus
flicker on the Find toggle frame; wheel/camera containment, click-through, repeated input, live updates while scrolled.

## R6. Charges — this increment, charged once, and cumulative
| Item | Value |
|---|---|
| Session clock (charged once; specialist wall-clock overlapped, never summed) | start `2026-09-14T17:18:41Z` → capability/reserve boundary `2026-09-14T18:31:19Z` (production writing complete at `ddeb11b`) → ledger stamp `2026-09-14T19:03:41Z` |
| This increment — capability | **72.633 min = 1.211 h** (target 16 h, hard cap 20 h; 12 h / 16 h fit checks never reached) |
| This increment — reserve | **32.367 min = 0.539 h** through the ledger stamp (cap 5 h); the closing docs commit/push/read-back tail (≈3 min) is charged once in the final reply and carried by the next session, as S6 did |
| Readiness charge carried once (order §5) | 5.0 min capability + 11.05 min reserve (S6 14.050 + ≈2.0 tail) |
| Known cumulative before this increment | capability 1415.666 min; reserve 1123.323 min |
| Known cumulative after this increment | capability **1488.299 min = 24.805 h**; reserve **1155.689 min = 19.261 h** |
| Remaining in the issued 72 / 36 envelope | capability **47.195 h**; reserve **16.739 h** (last 6 h protected; below-18 escalation disposed for this increment only) |
| Remaining in the original 48 / 24 envelope | capability 23.195 h; reserve 4.739 h |
| Unattributed setup/smoke/helper sessions | **NOT REPORTED, not zero** — separate outstanding line; must be attributed or dispositioned before any final program-fit claim |
| Specialist usage (informational, not hours) | unity-ui IMPL-01 ≈40.6 min wall / 394k tokens, IMPL-02 ≈8.3 min / 448k cumulative; test-author ≈23.6 min / 269k |

## R7. Remaining coverage, designer delivery, DATA-1 proposal, next stage (deduplicated)
- **Remaining for N1 itself:** compact overlay inspector (D-1), native pass at 1280×720/1440×900 × 100/150/200 % on
  f2-set-blocker-01 (waiting picture) and native-performance-316-01, GUI PlayMode (195), UX-STALE-NATIVE-01 on the
  Schedule-take route, memo disposition, screenplay inspection route, arrow row navigation.
- **Designer (existing owner, separate from native):** D-1 sheets at the missing states + occlusion rule; film-journey/memo
  sheet; remaining seven families; portrait/icon/font inventory; the 200 % title-room question.
- **DATA-1 bounded generator proposal (not executed):** `TS/Evidence/Playability-Interaction-01/entry/generate-r3n1-dense-01.ts`
  after the `generate-f2-blocker-01.ts` precedent: start from native-performance-316-01, weekly `signContract` on hiring-market
  candidates only while projected cash stays ≥ N weeks of commitments (solvency rule for Current Ops to dispose), commission
  screenplays through existing actions up to existing development capacity, stop when capacity or solvency binds, record
  actual density (expected well under 40/20 while solvent); immutable checkpoint + manifest under `fixtures/r3n1-dense-01`.
  ≈1.5 h capability. No gameplay-limit change.
- **Deduct from S2/S6 (delivered by N1):** list-level Tab/Enter/Page keys, filter/find/paging/library controls, both-rail return
  context, rail text reflow at three sizes, six stage sprites, employee/picture card vocabulary ≈ 5 h capability delivered.
- **Costed next stage (recommendation, not authorization):** N1-close = D-1 compact inspector 6 h + memo/journey strip 3 h +
  arrow focus gate 2 h + DATA-1 1.5 h = **12.5 h capability**; verification = native six-run pass + GUI PlayMode + stale-route
  proof + comparison + critique **5 h reserve**. S2 remainder after deduction ≈ 9 h / 3 h; S3–S7 unchanged from S6
  (24/6, 10/3, 8/2, 5/2, 0/12). Remaining program ≈ 68.5 h capability / 33 h reserve against the post-N1 remainder
  in R6 — the S6 fit conclusion (does not fit 72/36) stands; staged authorization still required. The last six reserve hours
  stay protected.

## R8. Stop state
Stopped at N1 candidate-review readiness with a real native/design/data block: PARTIAL. Preserved: Build46 package on the
Desktop, P13A, all campaigns, old evidence, both worktrees (Unity clean at `7471d24`; TS clean at the commit that carries this record (see Git)). No PR,
merge, protected-ref promotion, hook/goal activation, P13B/P14/P15/P16 coding, global configuration change, or native input.
Rollback source: Unity `e8c59d86`, TS `31f6e70d`.

---

# Successor readiness record — 2026-09-14 · OPS-FABLE-SUCCESSOR-START-20260914-01

**SUCCESSOR ACCEPTED. READINESS HANDOFF DELIVERED — PARTIAL: SPECIALIST REGISTRY GATE OPEN; IMPLEMENTATION HELD.**
This section sits above the outgoing local continuation update (below, unchanged) and the historical handoff.
It is the one evidence-linked successor acceptance/registration/mode/coverage/usage/next-task record the
launch note ([07 successor launch](https://github.com/HSpector1/The-Movies/blob/8c98eb6cd172b28a43857015381e66627fd011e5/docs/engineering/playability-launch-review/07-FABLE-SUCCESSOR-LAUNCH-01.md))
required. Nothing here starts implementation, native input, a specialist, a build or a later package.

## S1. Acceptance and actual session observations

- **Successor acceptance recorded at `2026-09-14T17:02:49Z`** by the fresh Fable coordinator session (this is the
  newly started coordinator, not the outgoing "Read P13A source packet" task, which stays STOPPED). The outgoing
  writer/native yields of `2026-09-14T15:27:03.274046+00:00` are accepted. Fable is now the sole coordinator/
  integration owner and custodian of the yielded native-input slot; **no native input was taken and custody is
  not permission to take desktop input.** Private identifiers stay in this worktree's Git-private
  `fable-local-transfer-20260914-01/successor-acceptance-local.json`.
- Packet `FABLE-SUCCESSOR-LAUNCH` verified: six SHA-256 entries OK; both repository documents match their listed blobs.
- Worktrees observed clean at acceptance: TS `7dfe508bbf6b07d87811be2c48728703e01c0ce0` on `wip/playability-interaction-01-ts`;
  Unity `e8c59d8672b6e32de73ed10628abeff49bc1a95e` on `wip/playability-interaction-01-client`; documentation
  `3e04634d41c243d548317b863950e4e5f4f59b26`. `git diff 6e2c2ca1..7dfe508b` names only the 13 configuration/instruction/handoff
  paths; no gameplay path changed. `Builds/macOS/build-manifest.json` (generated `2026-09-13T21:45:52Z`) still binds Build46 to
  exactly this TS/Unity pair, executable SHA-256 `caa2bcb6…fd18c`. No index lock, no open handle on the TS worktree, no player or
  Unity editor process; nine long-running VS Code-extension Claude processes (2.1.269, ≈2.7 days old) exist and were not signalled —
  no competing writer is evidenced, idleness is not proven.
- **Actual mode/model/launch — deviations from the launch note, recorded, not hidden.** This session's own process is
  `claude --dangerously-skip-permissions`, started from **`/Users/bruce`** (harness-reported startup directory), i.e. **bypass
  permissions, not `--permission-mode manual`**; runtime model **`claude-fable-5-1` (Fable 5.1)**, selected by the Owner with
  `/model` in this session (which also saved it as the user default, replacing the previously recorded `sonnet`) — the launch note
  requested alias `opus`; effort set to ultracode by the Owner; no `--settings '{"disableAllHooks":true}'` (no hooks are configured
  anywhere inspected, so hooks are inactive by absence, not by flag); no `--add-dir` for the Unity counterpart (it was reachable
  because bypass mode does not enforce directory scope). The TS `CLAUDE.md` preamble (blob `39ce8d1b`) was not auto-loaded and was
  read manually. Installed CLI `2.1.270` at `/Users/bruce/.local/bin/claude`. The Owner directed reuse of this session; every write
  below is limited to this handoff path and the Git-private metadata.
- Not used, by the adopted coordinator contract: dynamic workflows, agent teams, hooks, nested delegation, model substitution.

## S2. Six-role registry — NOT REGISTERED IN THIS SESSION (diagnosed, not fixed)

| Check | Observation |
|---|---|
| Runtime registry (Agent tool types listed by the harness at start) | `claude, claude-code-guide, Explore, general-purpose, Plan, statusline-setup` — none of the six |
| One probe, then stopped | `Agent(subagent_type=contract-auditor)` → `Agent type 'contract-auditor' not found. Available agents: claude, claude-code-guide, Explore, general-purpose, Plan, statusline-setup` |
| Files at `/Users/bruce/The Movies - Playability Interaction TS/.claude/agents/` | all six present and readable; first line `---`, closing `---` at line 7; `name:` equals file name; models sonnet ×3 / opus ×3; `permissionMode: default` ×6 |
| Byte identity | each of the six is blob-identical to `a51ebff8…` and to source `22584539…` (e8639772, d97a43f1, 57582a4f, 743ccc77, 6741a4b5, 13c3d74b) |
| `claude plugin validate "<TS>/.claude/agents"` | `✔ Validation passed` (2.1.270) |
| Suppression flags | no `safeMode`/`bare`/agent keys in user or local settings; no managed settings file; `~/.claude/agents` does not exist |
| **Observed cause** | project-local agents are discovered from the session's **startup** project directory; this session started at `/Users/bruce`, whose tree has no `.claude/agents/`; a later shell `cd` does not rescan |

Consequence: **delegation to contract-auditor / instrumentation / sim-core / test-author / uiux-designer / unity-ui is blocked in
this session; coordinator reading is not.** No general-purpose substitute was used or labelled as a specialist. Effective models
remain **CONFIGURED ALIAS / ACTUAL MODEL NOT EXPOSED** for all six (the single historical setup invocation is the only runtime
evidence). Registration is not reported fixed until a runtime actually lists the six names.

**Smallest supported next action (Owner runs once, in a NEW terminal; no second coordinator is spawned by this session):**

```bash
cd "/Users/bruce/The Movies - Playability Interaction TS" &&
/Users/bruce/.local/bin/claude --model opus --permission-mode manual \
  --settings '{"disableAllHooks":true}' \
  --add-dir "/Users/bruce/The Movies - Playability Interaction Unity"
```

Then confirm the six names appear in that session's agent-type listing before any delegation. `--model opus` is the launch
note's requested alias; omitting it now resolves to the user default `claude-fable-5-1[1m]` — the Owner's choice, not the
coordinator's. This record is already committed, so that session resumes from files, not from this chat.

## S3. F-A / F-B / F-C disposition — coordinator reading, no specialist dispatched

- **F-A (authority/transfer) — answered by coordinator reading.** Received and read: 07 launch note, FABLE-COORDINATOR, SOURCE-INDEX,
  SETUP/SMOKE receipts, TASK-TEMPLATE, this 06 (all sections), transfer receipt + `transfer-record.json`, review03 §6, plan 00 → 05 →
  issued 04 → 02 §3/§6, Owner clarification `f2921730` (incl. §8 1A/2B/3A/4B), Owner selection `3aa4bad9`, corrected advisory
  `ba385410`, R3 README/DESIGN/REVIEW/WALKTHROUGH, previews `01-mature-annotated.png` and `03-selected.png` (opened read-only — the
  mandatory render uptake is **started, not complete**: index.html/prototype interaction, early/waiting/busy/small views not yet opened).
  Order, one-writer/one-input-slot, no automatic later coding, adoption mapping, preserved local instructions and the ledger are
  consistent across these sources. No fabricated yield, model or time.
- **F-B (employee rail / Back scout) — answered by coordinator read-only source scout at frozen Unity `e8c59d86` / TS `6e2c2ca1`:**
  - `Assets/Studio/Runtime/Presentation/StudioPeopleRailHud.cs:64-78` still reads `snapshot.people.presence.people`, hides whenever a
    card/inspection/workspace is open (`Wanted`), passes `StudioPeopleRailContracts.MaximumRows` (=5); it is drawn on the **right**
    edge under the movie rail (`ComputeRect`), not left. The published presence-gap is unchanged locally; no newer local work implements R3-N1.
  - **The complete roster already travels on the wire — no new wire contract is needed for the left employee rail.** TS
    `bridge/people.ts` exports `BridgeRosterSnapshot { rows[], counts{employed,freelancer,known,withAttention} }` with
    `BridgeRosterRowSnapshot { talentId, name, nameShared, profession, currentWork, availability, status, contractLine,
    attentionTier, canLocate, population: employed|freelancer|known }`; Unity `Assets/Studio/Runtime/Data/StudioLotSnapshot.cs`
    already deserializes `StudioRosterSnapshot`/`StudioRosterRowSnapshot`, and the rail HUD reads `snapshot.talent.talent.roster`.
    `StudioRosterContracts` (Filter{Profession,Availability,AttentionOnly,ContractWithinWeeks,Search,Specialty}, Sort, Apply, Matches)
    and `StudioRosterWorkspaceContext` (ActiveView, Filter, Sort, SelectedTalentId, ScrollOffset) are reusable owners.
  - Exact inspection/Back owners: `StudioWorkspaceHost.OpenProfile(talentId[, ProfileOrigin])`, `OpenRoster()`, `OpenProduction(id)`,
    `CloseWorkspace()/RequestCloseWorkspace()`, `SuspendForLocate(stableId, focus)`; `ProfileOrigin` has World/Roster/History/Commission/
    TalentMarket/Finance/Industry (no rail origin yet). Rail focus/offset state: `StudioRailKeyboardFocus.Target`, `peopleScroll`,
    `focusedTarget`; movie rail `selectedAction/focusedAction`, `ItemRects`, `StudioProductionRailContracts.MaximumRows` (=4).
    Existing tests: EditMode `StudioPeopleRailContractsTests` (10), `StudioProductionRailTests` (4), `StudioRailScrollOwnerTests`,
    `StudioProductionNavigationTests`, `StudioP10AW3RosterContractsTests`, `StudioRosterOwnerUxWorkspaceTests`, `StudioWorkspaceHostTests` (14);
    TS `bridge-p10a-w0-people-projection`, `presence-*`, `roster-wall-*`. Text preference already scales rails
    (`LayoutScale = CurrentScale × StudioTextSizePreference.Multiplier`); HUD/corner scaling unverified.
- **F-C (native proof plan) — drafted by coordinator from `Tools/playability-native-preview.md/.mjs`:** JSON-line actions observe / shot /
  click(name) / tap(key) / scroll(name,ticks) / text / finish against **published, enabled** targets (rail targets today:
  `people-roster-open`, `people-rail-scroll`, `people-profile-<talentId>`, `people-talent-locate`); direct mode admits only
  `P13_VIEWPORT` `1280x720` / `1440x900` with a bound `build-manifest.json`; larger/Retina/package admission stays governed separately.
  Assertions for R3-N1: both offsets nonzero before and equal after Back; filter/search text retained; invoking focus target string equal;
  exact IDs (duplicate-name control); repeat Enter produces one effect; waiting picture shows real cause and no manufactured remedy; centre
  and global tools clickable after each return; screenshots at both viewports × 100/150/200 %. Requires a newly admitted build, a lawful
  dense fixture, an explicitly available desktop and HID-guard admission — **all HELD; no test was executed.**

## S4. Coverage register continuation — §7 rows updated (all eight domains remain)

| Domain / J,C | Established now (source-level, frozen pair) | Native / design evidence | Dependency (owner) | Remaining (coordinator ESTIMATE) |
|---|---|---|---|---|
| Home/HUD/tracking — J1/J2/J7 | Roster DTO on wire; people rail right/presence/5-cap; movie rail 4-cap, five-icon phase track (`DrawPhaseTrack`); both rails hidden under workspaces; keyboard focus registry shared | R3 previews viewed (2 of 9); native R3-N1 not proved | Compact inspector overlay vs full workspace (existing designer, D-1); stage-art atlas (A-1) | R3-N1 stage S1 below |
| Film journey — J1/J5 | F1–F3 delivered per 02; waiting-cause/attention fields for pictures to verify on wire at task time | Build46 tests/ACK retained (5273+5 / 1428 / 202) | Per-family rendered layouts (designer); possible one exact wire delta for wait cause (Current Ops disposes) | S3 |
| People/casting/contracts — J1/J2 | F3/F6 delivered; Roster workspace + Profile origins exist; `nameShared` on wire | none new | Portrait proof (designer/art) | S3, S6 |
| Buildings/tools/Lab — J3/J4 | F8 delivered; no P13B mechanics | none new | Layout sheets (designer) | S3 |
| Finance/Industry/records/outcomes — J5 | `StudioHistorySnapshot{timeline,films,people}` and `BridgePeopleAttentionSnapshot` on wire = existing retrievable-history/attention sources for 4B | none new | Inventory outcomes lacking a source (data dependency list) | S5 |
| Menu/campaigns/settings/help — J6/J7 | F4/F5 delivered; text preference client-session only | Run74/76/78 persistence retained | Per-screen help copy (designer/copy deck P-13) | S5 |
| Shared controls — J7/C1–C5 | Rail keyboard model exists (Tab/arrows/Enter); 2B routes not started; UX-STALE-NATIVE-01 residual unpassed | none new | Legal-command check per drag route (read-only auditor/sim-core after registry); Current Ops disposes route list | S4 |
| Visual system/art/readability — all J | Rails scale with text preference; HUD/corner unverified (advisory R3-5); XAG 101 rendered target adopted by 05 | none native | Font/icon availability + fallback tests; portrait finishing (designer); no paid assets | S2, S6 |

Preserved unchanged: R3 HYBRID, people-left/pictures-right/useful-centre, 1A/2B/3A/4B, corrected advisory withdrawals (R3-2 withdrawn;
R3-3/4/8/9/10 optional), XAG 101 rendered target, no tutorial, attention ≠ history, existing designer ownership, stopped advisory
reviewer, all eight P13B obligations, P14/P15/P16 gates. **Exact live screen inventory is still not established; this is domain coverage.**

## S5. Costed next task — R3-N1 (proposed, NOT dispatched; needs registry + Current Ops release)

**Outcome:** selected main screen on the native build — employees left (complete employment roster, scrolled), hybrid picture cards right
(scrolled), useful centre; inspect exact employee → Back; inspect actionable picture → worksite/company person → Back; inspect a genuine
waiting picture; both offsets, filters/search and invoking focus retained; global tools usable. Mode IMPLEMENT (unity-ui, configured
Opus) + VERIFY (test-author, configured Sonnet), one production writer, Fable integration owner, native slot held by Fable.

**Exact proposed writable paths (Unity worktree `/Users/bruce/The Movies - Playability Interaction Unity`, branch
`wip/playability-interaction-01-client`, base `e8c59d86`):**
`Assets/Studio/Runtime/Infrastructure/StudioPeopleRailContracts.cs` (roster-backed assembly: rows where `population=="employed"`, header from
`roster.counts.employed`, optional presence join by `talentId` for On set/Writing/Waiting words, remove `MaximumRows` cap, profession tabs +
name/role/ID search via `StudioRosterContracts.Filter`); `Assets/Studio/Runtime/Presentation/StudioPeopleRailHud.cs` (left edge, full height
under HUD, portrait slot, tabs/search, scroll with visible range); `Assets/Studio/Runtime/Presentation/StudioProductionRailHud.cs` (hybrid card:
stage image + title + stage word + state line, remove phase track, Active/Decisions/Waiting/stage filter + Find + range/paging footer + library
link, remove 4-row cap); `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs` + `.ProductionNavigation.cs` +
`Assets/Studio/Runtime/Presentation/UI/StudioProfileWorkspaceContext.cs` (add `ProfileOrigin.PeopleRail`; carry a rail return context);
new `Assets/Studio/Runtime/Presentation/StudioRailReturnContext.cs` (both offsets, filters/search, selected IDs, invoking focus target);
new sprite assets under `Assets/Studio/Art/StageObjects/` rasterised from R3 `art/*.svg` (original source-native SVG per PROVENANCE).
**TS:** no production writes expected (roster on wire); `dist/studio/engine.mjs` unchanged unless a wait-cause delta is disposed.
**Excluded:** simulation law, schema/DTO, campaigns, settings, launcher, candidate/evidence roots, other designer work.

**Tests (writable):** update `Assets/Studio/Tests/EditMode/StudioPeopleRailContractsTests.cs` (employed-only rows, honest counts, no cap,
filter/search, duplicate names distinct by ID), `StudioProductionRailTests.cs` (card state words, filters, range), `StudioRailScrollOwnerTests.cs`
and `StudioProductionNavigationTests.cs` (both offsets + focus retained through profile/production/worksite excursions and Back); new
`StudioRailReturnContextTests.cs`. Existing suites must stay green (EditMode 103 files / PlayMode 17 files; TS `npm test`). Native proof per S3-F-C.

**Dependencies before dispatch:** D-1 designer's native compact-inspector layout at 1280×720/1440×900 × 100/150/200 % (first slice may reuse
the existing Profile/Production workspaces with retained-context Back and record that as a gap); A-1 stage-art rasterisation + font/icon
fallback check (no paid assets); DATA-1 lawful mature fixture at 40+ employees / 20+ active pictures (existing generated mature layout to be
checked for density; no gameplay-limit change); WIRE-1 verify picture wait-cause/attention on wire, else one exact delta for disposition;
NATIVE-1 admitted fresh build via `Studio.Editor.Automation.StudioAutomation.BuildMacOS`, explicitly available desktop, HID guard.

**Effort (coordinator ESTIMATE, charged once): capability ≈ 16 h (range 14–20): rail relocation/roster binding/filters 6 h; hybrid cards/art/
filters/range 6 h; return context 4 h. Reserve ≈ 5 h: EditMode/TS regression 1.5 h; build + native proof at 2 viewports × 3 text sizes +
R3 comparison + first product critique 3.5 h.** Within 04 §7 the R3-N1 review is due inside the first 20 further capability hours; this
fits. **Protected reserve: the last 6 h of reserve are untouched by this task; below-18 h escalation remains active.**

## S6. Cumulative usage — this interval charged once; no reset

| Item | Value |
|---|---|
| Prior known at outgoing final tail (`2026-09-14T15:29:14Z`) | capability used 1410.666 min (23.5111 h); reserve used 1112.272787 min; R3 remainder 48.4889 h capability / 17.46212 h reserve; original-envelope reserve 5.462 h |
| This readiness interval | first stamped observation `2026-09-14T16:54:48Z` → record snapshot `2026-09-14T17:06:51Z`, plus a conservative 2.0 min unstamped packet unpack/verify debit = **14.050 productive min** of the 150-min ceiling (9.4 %) |
| Split (ESTIMATE) | source/preparation capability **5.0 min** (R3 design/preview uptake, Unity/TS R3-N1 source scout, costing) ≤ 60-min cap; verification/administration reserve **9.050 min** ≤ 90-min cap |
| Known remainder after this snapshot (R3 72/36 envelope) | capability **2904.334 min = 48.4056 h**; reserve **1038.677 min = 17.3113 h**; original-envelope reserve 318.677 min |
| Closing tail | this record's commit/push/read-back is charged once in the final reply, not here |
| Unresolved accounting | separately run setup/smoke/helper sessions: **NOT REPORTED, not zero** (no productive-hour ledger exists for them); the displayed balance is provisional and cannot support a final full-overhaul fit claim until attributed or dispositioned |

**Full-remainder pricing by stage (coordinator ESTIMATE; designer inventory not yet supplied; do not shrink scope to fit):**

| Stage | Capability | Reserve |
|---|---:|---:|
| S1 R3-N1 selected main screen (S5) | 16 | 5 |
| S2 shared system: list-level keyboard focus (R3-1), target-aware inspector (R3-6/NEW-1), HUD marque/timeline (R3-7), full 100/150/200 % incl. HUD/tools (R3-5), shared Backlot components | 14 | 4 |
| S3 full-domain adaptation of the seven remaining families (film journey, people/casting/contracts, build/Lab, finance/industry/records, menu/campaigns/settings, shared controls, results) | 24 | 6 |
| S4 2B lawful drag routes: inventory 2 h + implement only routes with an existing lawful command (candidate→comparison slot, script→stage schedule, catalogue→lot placement; person→facility/picture pending command check) | 10 | 3 |
| S5 3A contextual help + 4B attention cues/retrievable history from existing history/attention snapshots | 8 | 2 |
| S6 art: six-person portrait proof at rail/dossier sizes, icon set, font availability/fallback tests, stage atlas | 6 | 2 |
| S7 integrated verification/delivery: critiques 2–3, C1–C5, matched performance (Save/load ≤1.05×, 20-rep ACK), packaging, last-6-h delivery | 0 | 12 |
| **Total remaining** | **78 h** | **34 h** |
| Known remainder (before unattributed setup/smoke) | ≈ 48.4 h | ≈ 17.4 h |
| **Shortfall** | **≈ 30 h** | **≈ 17 h** |

**Fit conclusion: the full R3 HYBRID whole-game overhaul does NOT fit the issued 72/36 envelope.** Recommended for Current Ops disposition:
(a) release S1 (R3-N1) now under existing authority once the registry gate clears — it fits and is due first; (b) issue a staged amendment
raising the cumulative ceiling by ≈ 30 h capability and ≈ 17 h reserve (108 → ≈ 155 cumulative), or authorise stages S2–S7 one at a time
with per-stage reserve, after the existing designer supplies the rendered-layout inventory that turns these estimates into measurements.
No art, dragging, help or screen coverage is made optional; no reserve is spent on unbuilt capability.

## S7. Remaining gates (exact) and status

1. **Registry gate (blocking delegation, not reading):** six roles unregistered here — Owner restart from the TS worktree per S2; confirm names in that session's listing.
2. **Mode gate:** this session is bypass-permissions/Fable 5.1 by Owner direction; the launch note's `manual`/`opus` spelling is unverified in any session until the S2 restart is observed. No mode was silently substituted.
3. **Budget/fit gate:** S6 shortfall needs Current Ops disposition before capability beyond R3-N1; unattributed setup/smoke time still NOT REPORTED.
4. **Design gate:** D-1 compact inspector, remaining-family sheets, portrait/icon/font deliverables — existing designer, no competing designer.
5. **Native gate:** admitted fresh build, lawful dense fixture, explicitly available desktop, HID guard; UX-STALE-NATIVE-01 remains a declared residual to prove on the changed commitment route (Schedule take) with the mechanism labelled exactly; no race hunt.
6. **Data gate:** WIRE-1 picture wait-cause/attention fields; roster and history confirmed on wire.
7. **Render-uptake gate:** open R3 `index.html`, early/waiting/busy/small views and the documented Back/focus repairs before any visual mutation (started: two previews viewed).

Status: **PARTIAL — readiness handoff delivered; implementation and specialist dispatch HELD** pending gates 1–3. Candidate, campaigns,
launcher, evidence, P13B/P14/P15/P16 boundaries and protected refs untouched. No PR, merge or protected promotion.

---

# Local continuation update — 2026-09-14

This updates the existing handoff below, whose source is The-Movies
`751d38f4312d99baa876b92f8ff74295516f579d`. The original text remains intact as historical
preparation. Its older working pins, unknown local adoption/usage cells and prepared launch
command do **not** override this update or the [Current Ops disposition](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/dc4f49fc3f63f7c8dd217877cff37b3744988457/docs/evidence/playability-delivery-20260913-01/CURRENT-OPS-DISPOSITION-01.md).

**Outgoing completion only. No replacement session, native run or specialist assignment.**
The [existing private transfer receipt](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/docs/playability-delivery-review-20260913-01/docs/evidence/playability-delivery-20260913-01/FABLE-LOCAL-TRANSFER-RECEIPT-01.md) records the final dated writer/native yields,
this handoff's actual commit, final accounting and successor gates. This branch link is a
continuation locator; Current Ops receives a commit-pinned receipt separately. Do not infer
successor acceptance from the outgoing yield or file availability.

## Frozen reviewed foundation and actual adoption

- Reviewed gameplay stays TS `6e2c2ca10ce70f43f58e99193e052d4afa59bcfb` / Unity
  `e8c59d8672b6e32de73ed10628abeff49bc1a95e`, on the existing Playability worktrees/branches.
  Both were clean at the safe checkpoint; there was no newer dirty gameplay to discard.
- Configuration-only adoption: `a51ebff89edb0f1830adf090e4673947954f7acb`; all eleven files exactly match the authorized
  `225845395f85f3e47d398687953931556a18c16b` blobs. Four legacy profiles refreshed, seven
  missing paths added; originals backed up in Git-private metadata outside agent discovery.
- Separate instruction commit: `0fbb9fce30bf663761776711c3a7d836c3e6a6ea`; only a current-scope CLAUDE.md preamble.
  Historical root text is preserved byte-for-byte. No Unity source or global settings changed.
- Build46 remains the player, built `2026-09-13T21:44:56Z`, paired seal41; Save20 / protocol4 /
  projection30 and DTO blob `9420d5ef5e5b7db5d9c18d2300f22a3d94074eb2`. Configuration and
  handoff descendants are not newly tested or built gameplay.
- Existing [evidence entry](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/2790ffaf44b41eb6ae685bc9555a8800dd739a6e/docs/evidence/playability-delivery-20260913-01/00-START-HERE.md)
  retains exact executable/schema/DTO/source hashes, tests (5273+5 skips /1428 /202), all80 ACK
  records and their qualifications, matched performance, packaged six-record preservation,
  J1–J7/C1–C5 coverage and critiques. No broad checks were repeated for adoption.

## Received authority, remaining work and next task

Now received: this existing06 handoff and its eleven config/source files; Owner full-overhaul
clarification with 1A/2B/3A/4B; issued04 R3 HYBRID order; later05 coverage/advisory reconciliation;
corrected advisory RECONCILIATION-01; and Current Ops review03 above. Earlier delivery's
non-receipt statement remains historically true. R3 HYBRID is closed, the existing designer
retains ownership, and the independent advisory reviewer stays stopped.

Continue the existing §7 eight-domain / J1–J7 register and05 rows. Delivered bounded navigation,
text, displayed-command, campaign/persistence work is retained. Selected complete employee-left /
pictures-right / useful-center R3 integration, all remaining screen/state treatments, full scaling,
portrait/icon/font/stage-art finishing, lawful optional drag routes, contextual help and retrievable
outcomes still need scoped reconciliation and their own native evidence. No new board, inventory,
estimate, visual layout or full-overhaul completion claim was created by this administrative update.

**UX-STALE-NATIVE-01 is an accepted declared residual of this engineering checkpoint, NOT PASSED.**
Do not hunt timing races. For the changed overhaul commitment route, plan and later prove visible
invalidation/fresh review or a genuine lawful refusal, with independent command-owner rejection;
label prevention and native server refusal separately. Whole-overhaul/Owner acceptance stays open.

Next: successor handoff acceptance, actual custom-role registration and authority/remaining-work
reconciliation; then the existing F-A/F-B/F-C preparation, within real authority and allowance.
R3-N1 remains the first connected future native task: both rails already scrolled; exact employee
inspection/Back, actionable picture → worksite/person → Back, genuine waiting picture; retain both
filters/search/offsets/invoking focus and useful center/global tools. No fabricated density or wire
change. Nothing here dispatches those tasks or admits native input. Preserve remaining P13B and
separate P14/P15/P16 gates and all eight P13B obligations.

## Local access and instruction/settings review

Confirmed coordination directory: `/Users/bruce/The Movies - Playability Interaction TS`;
readable/writable counterpart: `/Users/bruce/The Movies - Playability Interaction Unity`.
Installed executable: `/Users/bruce/.local/bin/claude`, version2.1.270. Model default in existing
user settings is Sonnet; the prospective coordinator command requests Opus. No forced model
environment override was observed. Actual alias resolution, six-role registry, Read-image/render
capability and effective permissions remain fresh-session observations, never inferred here.

No project/local settings, nested scoped instructions, root Unity CLAUDE.md, or managed policy file
was found in the inspected applicable locations. User CLAUDE.md's general Fable orchestration/
reverification advice is subordinate to the explicit no-audit/no-specialist administrative order.
User settings retain existing allow rules and unrelated additional directories; these are not
new task scope or a filesystem sandbox. No global permission/model/hooks change was made. No
configured hook events were observed; the prepared session still requires `disableAllHooks:true`.

**Launch compatibility gate:** installed help lists permission modes `acceptEdits`, `auto`,
`bypassPermissions`, `manual`, `dontAsk`, `plan`; it does not advertise the older packet's `default`.
A help-only invocation with that flag exits0 but does not validate session behavior. Resolve the
normal-prompt equivalent before launch; do not infer permission bypass or silently substitute a
mode/client/model. No session was launched to test it. Keep ordinary prompts and only the approved
counterpart grant; the old sample command is preparation, not verified execution.

Existing native driver/capture instructions and BuildMacOS owner are readable; Unity version is
6000.3.22f1. Current portrait presentation source is accessible, but final art/font/icon availability
and render-dependent readiness are not certified. Exact R3 (47files) and original plan (34files)
archives are verified/materialized under `/Users/bruce/Desktop/Fable-Verified-Sources-20260914-01`;
its MATERIALIZATION-RECEIPT binds hashes and member checks. No prototype or preview was opened;
mandatory actual R3 render uptake remains before visual mutation. Generated fixture/evidence roots
stay those in the existing handoff/driver; no campaign/profile payload was opened here.

## Cumulative usage — no reset

At `2026-09-14T15:23:16.644484+00:00`: prior delivered capability1410.666min; reserve1051.84min plus
publication44.837132min (the previously reported44.84min, including its disclosed initial reading
debit). This adoption interval has consumed 9.627408min of the separately capped30 productive
minutes, all reserve, zero capability. This is a pre-publication snapshot; the compact receipt and
final reply charge the closing commit/push/read-back tail once.

Known totals at this snapshot: capability23.5111h; reserve18.438409h.
Against the original48/24 envelope: capability24.4889h and reserve5.561591h remain.
Against the already-issued72/36 envelope: capability48.4889h and reserve17.561591h remain.
The attached separate setup/smoke/helper receipts provide no productive-hour ledger; their charges
are **NOT REPORTED**, not zero and not silently debited twice. These are the outgoing lead's known
charges; reconcile any separately attributable prior setup charge before treating cumulative
remaining allowance as fully closed. Below18 reserve escalation already applies; discretionary
polish stays stopped. Before capability, price the actual whole remainder under05/06 and preserve
the last-six-hours delivery protection. No unused P13A time transfers and no scope is cut to fit.

---

# Current Ops — Fable adoption and fresh-session handoff

**2026-09-13 · OPS-FABLE-ADOPTION-HANDOFF-20260913-01 · PREPARATION / CONFIGURATION ADOPTION ONLY.** Continue the existing Playability plan and existing implementation. No fresh Fable coordinator, specialist, build or native session is started by this publication. No program-wide coding order or budget reset.

## 1. Disposition and exact unresolved gate

The configuration at **225845395f85f3e47d398687953931556a18c16b** is accepted as the source for configuration-only adoption. Its published smoke evidence is sufficient; do not repeat a six-agent benchmark. It proves six names were discovered in the **setup worktree** and one restricted contract-auditor invocation passed. Actual executing model identity was not exposed. It does not prove adoption, discovery or tool availability in the coordination worktree.

**Owner transfer: NOT YET VERIFIED. Actual coordination adoption commit: NOT YET RECORDED.** The outgoing owner remains the existing VS Code task **Read P13A source packet** until it explicitly yields. Its terminal was reported working; no later yield acknowledgement is available in the inspected records. Fresh-session launch is prepared, not released. Do not infer clean/idle local worktrees, test completion, actual allowance or ownership from published commits.

**Specific checkpoint needed:** the outgoing owner reaches its next coherent source/test checkpoint, finishes or safely closes any admitted native run, preserves all uncommitted work and evidence, performs the bounded local adoption/instruction review below, and writes its exact source/build/remaining-work/usage receipt plus explicit writer and native-input yield. It need not finish the whole overhaul to hand over. Never force a live interruption, clear another owner's lock, discard work, or start a competing native session.

This entry extends the existing `docs/engineering/playability-launch-review/` plan. Branch searches and the inspected plan directory found no published Fable transition entry; a local-only handoff may exist. Reuse and link that handoff/task board at the checkpoint rather than create a second PM hierarchy. A new terminal does not inherit live child sessions or reset account usage.

## 2. Authority and source uptake

Read in this order: this handoff; the actual adopted **docs/operations/fable-team/FABLE-COORDINATOR.md**; SOURCE-INDEX.md; existing plan **00 → 05 → issued 04 → relevant 02 sections**. Later corrections govern earlier reports. The five Fable source documents and six profiles are supplied as exact verified bytes in the accompanying packet. Owner clarification and corrected advisory are also included. The materializer supplies the existing plan and R3 archive from pinned local Git objects; it is not an installer or an instruction to run the prototype.

| Source | Exact repository identity / path |
|---|---|
| Configuration only | The-Movies `225845395f85f3e47d398687953931556a18c16b`, `.claude/agents/` six named profiles and `docs/operations/fable-team/` five documents |
| Existing plan before this administrative addition | The-Movies `06a852acdf58e2e02404efdfc980b0bf32ec54a9`, `docs/engineering/playability-launch-review/`; published branch checked at that commit |
| Issued runtime scope | `04-R3-HYBRID-EXECUTION-ORDER.md`, OPS-PLAYABILITY-R3-HYBRID-20260913-02; 05 is a later scope/design reconciliation, not a blanket additional runtime order |
| Full outcome / 1A, 2B, 3A, 4B | `f2921730a6ff6cb5f0b8e952995978a8ecb8407f`, `docs/operations/UIUX-WHOLE-GAME-OVERHAUL-OWNER-CLARIFICATION.md` |
| Selected R3 | `b56088d63e5b8eb66c78584c7b0f40f915c08d8b`, `docs/operations/uiux-visual-blueprint/r3-picture-cards/`; archived design content `509bd4d76b23ec9faed9c743620208fa77cee332` |
| Corrected advisory only | `ba3854108bfe86b81f0ed4d5259c96101d89c887`, `docs/operations/uiux-opus-advisory-20260913/RECONCILIATION-01.md`; 05 resolves its residual navigation/undo/hint/history language |
| Accepted P13A closeout | `45a3916862a6e98fcb7e9c6908cb2b31f1e8b588`, receipt, final addendum, P13A→P13B handoff |
| Corrected P13B/Playability preparation | document `673f49835404e262ea651b4fcb8fda5e259d80a6`; packaging/handoff `9db31137662afe9d6ef9eb44b6390f611feeadf6` |

All abbreviated repository names above mean **HSpector1/The-Movies**. Unity is **HSpector1/project-studio-unity-visual-spike**. Check for a newer published Current Ops order at actual launch; do not substitute an unrelated newer research commit as authority. Preserve selected HYBRID; no repeated vote, new survey, reviewer revival or duplicate designer.

## 3. Accepted product versus working source versus playable build

| Item | Verified or source-recorded value | Boundary |
|---|---|---|
| Last verified accepted TS / Unity pair | TS `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`; Unity `6420a4d91de52db1bffca2988f2c995672e7d53e` | Qualified P13A Core KEEP, not acceptance of this overhaul |
| Historical accepted player | P13A Candidate03; build `2026-09-11T22:26:25Z`; executable SHA-256 `f67fbdf693c96809be8f60bd5a34e858179c220b5edd771920e73e828973629c` | Recorded in accepted receipt; not rehashed here |
| Incoming contracts | Save V20, protocol 4, projection 30; schema `sha256:e64a3b659e4247b98631f1caa1f0e9eb0b6016aac92b0f46be590360ff9cee48`; DTO Git blob `9420d5ef5e5b7db5d9c18d2300f22a3d94074eb2` | Inherited baseline; actual working pair and build must be bound locally |
| Working TS remote | `wip/playability-interaction-01-ts` at **459ae6c9dc0f5b8c06be31a038e052153472f500** | Ref read this review; newer lawful local/remote work must be preserved |
| Working Unity remote | `wip/playability-interaction-01-client` at **7e22f7a43940b1d0e73fd49f9f980fbfb8be55dc** | Ref read this review; not a verified paired executable |
| Planned actual coordination directory | `/Users/bruce/The Movies - Playability Interaction TS` | Exact path enforced by the published native driver; local existence/ownership still to confirm |
| Permitted Unity counterpart | `/Users/bruce/The Movies - Playability Interaction Unity` | Same restriction; never grant the home directory or all repositories |
| Working player/manifest | Unity `Builds/macOS/Project Studio Visual Spike.app` and `Builds/macOS/build-manifest.json`; TS `dist/studio/engine.mjs` | Driver locators, not an assertion these files are current or present |
| Generated fixture/evidence roots | TS `artifacts/playability-interaction-01/`; Unity `Evidence/Playability-Interaction-01/` | Existing authorized disposable roots, not general profile access |
| Unfinished changes, current tests, paired seal, candidate hashes, usage | **LOCAL CHECKPOINT REQUIRED** | No invented clean tree, passing suite, build or zero usage |

Source comparisons show **four more TS and twenty-five more Unity commits** beyond the earlier observed `6bfb275…` / `101e55f…` checkpoints. They include truthful set-check wording, financial/cancellation copy, shared text preference, person/production navigation, campaign status/continuation, displayed-command protections and tests. Preserve them. Added tests are not proof of a run. No remote adoption or gameplay write is made here.

A concrete remaining source gap is established at current published Unity: `StudioPeopleRailHud.cs:58–81` still reads `snapshot.people.presence.people`, hides for deeper inspection/workspace and passes `MaximumRows` to the compact presence assembler. It is not evidence of the selected complete left employment rail. R3 complete-roster/inspection integration is therefore a justified next task, unless newer local work has already implemented it. Reconcile that delta instead of duplicating it.

Current native evidence is not published in those source diffs. The outgoing owner must identify its existing board/log, last actual tests (including failures), last built pair and raw-run paths. Preserve P13A's historical full-suite/recovery/performance evidence with its source qualifications; do not apply those passes to working Playability sources. Open defects include only defects the actual log still marks open; unverified coverage is not automatically a bug.

## 4. Local adoption, instruction review and safe transfer

The **existing outgoing owner**, at its natural safe checkpoint, is authorized for this configuration/documentation adoption only:

1. Locate any existing Fable adoption receipt/handoff. Reuse it. Record exact current worktrees/branches/HEADs, ongoing operations and unfinished paths. Preserve coherent work in a recovery commit or a named, verified local backup plus changed-path record; never auto-stash, reset or drop changes. Separate WIP source from tested/build identity.
2. Reconcile the eleven configuration-source paths only. Compare the actual local versions with the source and their legacy ancestors. If identical, keep them; if unchanged legacy, refresh; if locally newer/different, preserve and resolve individually. Backup outside every auto-loaded agents folder. **Do not merge/cherry-pick the setup branch wholesale, switch to its old gameplay, replace `.claude/` wholesale, or adopt unrelated settings/hooks.** The packet helper defaults to inspection and refuses divergent files; it does not commit or establish ownership.
3. Commit the exact adopted six profiles plus five docs on the continuing TS coordination branch. Verify the staged path set, parent, resulting commit and source/blob mapping. Report the **actual adoption commit**. A prepared ZIP or this documentation commit is not that commit.
4. Inspect applicable root/parent/nested CLAUDE.md and .claude rules for both worktrees, project/local/user/managed settings, relevant model overrides, existing tools and hooks, without publishing secrets or private session logs. Remote TS CLAUDE.md blob `329ae54092327e999abdcf5eacfb19aafb9e0ee9` retains branch-specific marathon/M0A authority and an unconditional old build-contract rule. Preserve history and useful invariants, but add a narrow current-scope preamble making FABLE-COORDINATOR and the actual active order required. No whole-file replacement. The packet supplies proposed wording; reconcile newer local text. Unity's published root tree contains no CLAUDE.md; that says nothing about parent/local/nested instructions. No global configuration changes.
5. Record installed Claude version and actual executable path; the setup receipt's 2.1.270 and user-model setting are historical environment observations, not the current worktree audit. Preserve normal prompts. Session `disableAllHooks:true` leaves hooks inactive; do not install or activate hooks. Inspect restrictive policy conflicts and return them rather than disable protections or silently switch models. Check Unity file access, existing editor/build command, capture/Read-image capability, renderer, selected design archives, font/portrait/icon availability and approved fixture roots. Missing render access blocks render-dependent tasks only.
6. Complete the existing coverage/usage/continuation records described below. Append a two-part transfer receipt: **outgoing writer yields** with time and frozen/preserved source/evidence state; **outgoing native owner yields** with owned run/process/guard cleanup status. These are separate from merely committing. Record the successor's explicit acceptance at fresh-session startup; do not forge a successor acknowledgement beforehand. Private task/session IDs and process details stay in local operational metadata; publish only sanitized role/status and necessary source pins.

The outgoing writer may finish its currently authorized coherent increment while this handoff is prepared. Independent published-source reconciliation/materialization can continue without a native slot. If another actual writer exists, stop only overlapping work and name the owner/checkpoint. Never force a lock, kill a worker, launch a second input session or read mutable files it is editing.

### Narrow CLAUDE.md preamble to adapt, not a blanket replacement

> Current Fable continuation: read `docs/operations/fable-team/FABLE-COORDINATOR.md` and the adopted Current Ops handoff/issued order before tasks. Follow the recorded full UI/UX → remaining P13B → P14 → P15 → P16 gates. Historical M0A/marathon scope below does not override current explicit Owner/Current Ops authority. Preserve deterministic state, strict contracts, existing protections and normal permissions. No later package is authorized by its research document. Update the existing handoff/task board; do not start until the recorded writer/input transfer and applicable execution gates are satisfied.

Record before/after instruction hashes and diff separately from the eleven-path configuration adoption. A conflicting parent/managed instruction is an explicit local gate, not proof of permission to edit the parent or global file.

## 5. Launch command, registration and initial coordinator prompt

**Run only after the local configuration, instruction and outgoing-yield gates are recorded.** Reuse the current TS worktree; do not use `~/The Movies`, the setup worktree, Downloads, `--worktree`, `--continue` or an old session resume to masquerade as a fresh context. The setup receipt's quoted `"~/…"` command is historical; use the exact absolute directory below.

```bash
cd "/Users/bruce/The Movies - Playability Interaction TS" &&
claude --model opus --permission-mode default \
  --settings '{"disableAllHooks":true}' \
  --add-dir "/Users/bruce/The Movies - Playability Interaction Unity"
```

**Fable is the coordinator role, not the requested model name.** `opus` is the requested coordinator alias for this command, not a claim of actual runtime identity. The six specialists retain their own configured Opus/Sonnet defaults. If the alias is unavailable, stop that launch and report; do not buy credits or silently substitute a model/client. Inspect local CLI support before use, without installing/upgrading. Official CLI/subagent/settings references were checked for this preparation; installed behavior governs the final local receipt. `--add-dir` grants counterpart file access, not automatic adoption of its instructions or profiles. It is not a filesystem security sandbox.

At the actual fresh session's first response, record the six custom roles from the runtime's available agent registry/installed-version discovery mechanism: contract-auditor, instrumentation, sim-core, test-author, uiux-designer, unity-ui. Do not mistake file existence or `claude agents` background-session listing for custom-role discovery. This check happens **after start, before delegation**; it is not an impossible pre-start requirement. Retain the one successful setup invocation as evidence; no new blanket smoke/benchmark campaign. Missing registration blocks the affected role, not independent coordinator reading. Actual model unavailable = **CONFIGURED ALIAS / ACTUAL MODEL NOT EXPOSED**; do not mine private logs.

Initial prompt (also supplied as `FABLE-INITIAL-PROMPT.txt`):

```text
You are Fable, the coordinator role for the existing Project: Studio work.
Read docs/operations/fable-team/FABLE-COORDINATOR.md first, then SOURCE-INDEX.md
and the adopted Current Ops Fable handoff. Read the current plan 00 → 05 →
issued 04 → relevant companion sections, applying later Owner corrections.

Begin in PREPARATION / HANDOFF-ACCEPTANCE mode. Confirm the outgoing writer
and native-input yield, your exact current paired worktrees and adoption
commit, instructions/settings review, source/build distinction, six actual
custom-agent registrations and cumulative usage. Read the existing task
board/coverage/evidence/continuation record; do not create a duplicate.
Do not treat this startup as production or native authorization. Missing
handoff fields block overlapping implementation, not independent source work.

Keep R3 HYBRID and 1A/2B/3A/4B. All delivered screens, workflows, interface
art, scaling, lawful drag/drop, contextual help and retrievable outcomes
remain in the overhaul. A main screen is not completion. No generic undo,
forced tutorial, false scroll defect or invented history/command.

Prepare the bounded assignments in this handoff from the exact local
remainder. Default maximum two concurrent specialists, one production
writer, you as integration owner, one native-input owner. Specialists may
not redelegate. Keep the existing designer; do not commission new mockups.
Persist read-only returns yourself and update the handoff before compaction.

Return a compact ready/blocked gate record and the next R3-N1 task. Proceed
with routine work only under its actual applicable execution/ownership and
budget authority; this adoption does not expand it. Later P13B/P14/P15/P16
need their own refresh and execution gates. No hooks, bypass permissions,
current campaigns, paid resources, PR/merge or protected promotion.
```

## 6. First three bounded assignments — prepared, not dispatched

These use TASK-TEMPLATE fields. Each task is **READ_ONLY initially**, allows **no writes**, and is a real launch-readiness investigation, not an agent benchmark. The parent persists returns into the existing board's evidence paths. Use immutable exports of the exact transferred candidate, not moving files. At most A and B concurrently; C follows B. Render-dependent observations require accessible actual artifacts; absence is recorded, not fabricated. Once preparation is complete, changing a task to IMPLEMENT/VERIFY requires its explicit paths, checks, allowance and applicable existing execution authority, not inference from the role name.

### F-A — authority and transfer contract
- **Role/model:** contract-auditor / configured Sonnet, actual identity when exposed.
- **Outcome/mode:** reconcile local transfer/adoption/instruction receipt and task authority; READ_ONLY.
- **Sources:** this handoff, FABLE-COORDINATOR, exact adopted six profiles, issued 04, later 05 and sanitized local instruction/yield/usage record. Read only this bounded set.
- **Repositories/base:** transferred coordination snapshot; remote reference TS 459ae6c9… and Unity 7e22f7a4… are comparisons, not a forced reset.
- **Write paths:** none; no Bash, processes, settings edits, builds or native input.
- **Preserve/check:** correct order, one writer/input slot, no automatic later coding, actual adoption/path mapping, newer local instructions retained, no fabricated yield/model/remaining time. This is not a rerun of the setup smoke test.
- **Output:** requirement-to-evidence table and precise unresolved gates to Fable; parent links it under existing continuation record.
- **Allowance/stop:** at most 45 minutes from available administrative/verification allocation, not additional program hours; stop at specific blocking fact; independent permitted reads may continue.

### F-B — complete employee rail and exact Back integration scout
- **Role/model:** unity-ui / configured Opus, actual when exposed.
- **Outcome/mode:** identify the smallest remaining native implementation slice for R3-N1; READ_ONLY, not design ownership.
- **Sources:** selected R3 README/DESIGN/REVIEW and actual supplied previews; current frozen StudioPeopleRailHud.cs, StudioPeopleRailContracts.cs, StudioProductionRailHud.cs, StudioWorkspaceHost context/navigation owners, existing `bridge/people.ts` roster and schema, relevant rail/Back tests; current owner’s delta and captures.
- **Write paths:** none. Exclude all simulation, settings, user data, other designer’s mutable work and extra research.
- **Dependency/preserve:** Fable provides real file/image access; compare the confirmed presence-based published gap to newer local work. Reuse existing roster DTO where sufficient; absent data is a named exact wire dependency, not client-authored truth. Preserve prior navigation/text/command fixes.
- **Acceptance/output:** exact source locators, proposed minimal writable paths, current data owner, return-context fields for both rails/focus, tests already present, missing native evidence and a finite implementation estimate. No claim that images prove actions. Parent persists report and updates existing J/C coverage.
- **Native slot:** none. **Allowance:** at most 60 minutes of remaining preparation/capability allowance; stop for missing lawful command/wire authority or inaccessible render, not all unrelated tasks.

### F-C — first native proof plan and evidence applicability
- **Role/model:** test-author / configured Sonnet, actual when exposed.
- **Outcome/mode:** after F-B, specify the connected R3-N1 regression/native task using existing capture/build owners; READ_ONLY.
- **Sources:** F-B return; existing tests, Tools/playability-native-preview.md and driver; frozen paired manifest and actual run/capture records supplied by outgoing owner; relevant J1/J2/J7/C1/C2/C5 and 05 corrections.
- **Write paths:** none; no test execution or native input during this assignment.
- **Preserve/check:** no same-name substitution, no presence-as-employment, both rails' scroll/focus retained, ordinary wait not false action, lawful single-effect dispatch, accessible global tools, rendered text and portrait status, honest build identity. Driver intentional settle times are not input latency.
- **Output:** exact repeatable task/assertions, legal fixture requirements, capture/viewport/scale fields, evidence gaps and available test command names from current manifests. Parent writes the result; no fictional suite PASS.
- **Allowance/stop:** at most 45 minutes from remaining verification allocation, no new hours; missing old proof remains NOT VERIFIED. Do not invent a new full-game audit or instrumentation subsystem.

These caps total **2h30m maximum if all are needed** and must fit the existing reconciled allowance before dispatch. Do not spend time merely because a cap exists. The existing designer supplies missing views/assets under its own ownership; uiux-designer is available for bounded delegation only after that owner agrees to a disjoint task or yields it. Sim-core and instrumentation wait for a concrete authorized seam or measurement.

## 7. Coverage register continuation — all domains remain

Append exact screen/state rows to the existing 05/J1–J7 register, retaining original IDs. Fields: screen/state; source/owner; selected visual pin; redesign/refine/retain-with-evidence; legal command/data; completed source; actual native/design evidence; defect/gap; dependency; remaining effort; acceptance task. **Exact live inventory and completion are not established remotely.** This table completes domain coverage, not a false screen-level acceptance claim.

| Domain / existing J mapping | Published work to preserve | Outstanding acceptance / next evidence |
|---|---|---|
| Home/HUD/tracking — J1/J2/J7 | Rails, HUD, text/navigation edits; selected R3 source | Full employment left vs current compact presence rail, hybrid pictures right, usable center, counts/filter/search, live updates, inspector/tool separation, name/timeline, both-list return; R3-N1 not proved by current source |
| Film journey — J1/J5 | Script/development, displayed action, production remedy/profile, set-check, release memo changes | Complete script→casting/greenlight→schedule/worksite→film→Post→release/result; current/wait/stale states; exact source-bound native tasks and retained drafts |
| People/casting/contracts/assignments — J1/J2 | Profile/casting comparisons, acknowledgement/signing guards, text changes | Exact identity/no-location/duplicate names; employment vs assignment; complete person/contract states; approved final portrait standard and population coverage |
| Buildings/tools/Lab — J3/J4 | Build navigation/text, Lab funding/cancellation explanations | Actual placement/quote/outage/cancel-preview vs submitted work; knowledge vs physical/operational truth; delivered one Scientist, no P13B mechanics |
| Finance/Industry/records/outcomes — J5 | Finance/Industry/history/result text and navigation edits | Period/estimate/unknown/public-private/return context; important outcomes retrievable after current badge clears; no invented journal or history |
| Menu/campaigns/settings/help — J6/J7 | Save As leave continuation, operation-specific pending/status, shared text preference | Naming/overwrite/draft-loss, same-request unresolved retry, explicit continuation, Save As isolation and relaunch; contextual/on-demand help, no automatic first-visit tutorial |
| Shared controls — J7/C1–C5 | Keyboard/context/displayed-command protections | 1A mouse/trackpad and complete efficient keyboard; existing controller compatibility; optional 2B legal dragging with full non-drag routes and meaningful reviews, no universal undo; no wheel-camera or modal leaks |
| Visual system/art/readability — all J | Shared text source and selected Backlot/R3 design | All remaining families redesign/refine/retain-with-evidence; full HUD/rails/dialogs/tools 100/150/200%; XAG rendered target under 05; fonts/icons/stage art/portrait finishing. Samples establish standard, not finished population art; no incompatible legacy islands |

Keep corrected advisory status: withdrawn scrolling defect stays withdrawn; shelf symmetry, compression, genre tint and visible filters are optional design alternatives. Default PC text target is 05's rendered output, not CSS sizes or a new Owner vote. 3A excludes guided/automatic tutorial; 4B current attention and event/operation history are different. Preserve safe spending/legality with 2B, not every menu step.

First native review once ownership, design/source access, actual build and budget gates permit: **R3-N1** on a lawful disposable studio, both rails already scrolled; inspect an exact employee → Back; inspect an actionable picture → worksite/company person → Back; inspect a genuine waiting picture; verify both offsets/filter/search/invoking focus and usable center/global tools throughout. Record native actions/receipts plus screenshots at supported small/normal/enlarged settings. No invented 40-person or 20-picture rows to force density. A strip-only or main-screen result does not finish the overhaul. The driver currently admits only 1280×720/1440×900 direct builds; larger/Retina/package admission requires its already-governed exact verification, not bypassing that guard.

## 8. Program readiness — no automatic advancement

Use FABLE SOURCE-INDEX on demand. These are inspected references and gates, not a new research campaign or all-program task.

| Phase | Accepted prerequisite / present status | Material decisions and refresh | Execution gate |
|---|---|---|---|
| Whole UI/UX overhaul | P13A qualified Core accepted; current Playability source in progress | Complete local inventory/yield/build/evidence/usage; render access and existing designer deliveries; legal drag/data/history dependencies and whole-outcome budget fit | Applicable issued 04 scope plus later 05/Owner direction; transition does not authorize out-of-scope work. Whole-game integrated Owner verdict remains required |
| Remaining P13B | Preserved corrected preparation at 673f4983 / 9db31137; not an accepted implementation | Accepted post-UX pair; R07 useful production recipe/content gap, concrete candidate values, office recommendations, governed schema/versions and budget/gates need explicit disposition | Targeted post-UX refresh + reviewed finite order. Preserve all eight: staffing; multi-Lab cooperation/splitting; queues; direct conversion/purchase; forecast/replacement; cancellation; inventor/prototype pricing; symmetric rival research |
| P14 | Preparation index at `8ef5246aec115cc32d01d9fb8c916e3538342dca`, `docs/engineering/P14-PREPARATION-REVIEW-INDEX.md`; not launch-ready without upstream | Post-P13/post-UX touched-contract refresh; current employment/retained work/first-filming versus first-take distinctions; preparation Q/decision recommendations and first-slice budget disposition | Accepted predecessor contracts, Future Ops recommendation, separate Current Ops order; do not import P14 law into UI |
| P15 | Corrected research at `c5b52b4d8147d9de7d1478d12397cdface08bf70`, INDEX then RECONCILIATION-02 | Not implementation-ready. Public financial-strength/disclosure and ranking evidence choices remain for later disposition; current finance/settlement/production contracts must replace old P12-only reconnaissance | Finite launch preparation and separate order after predecessors; **P15 does not execute purchases; P15D purchase recommendation withdrawn** |
| P16 | Corrected research at `084713980ef884ac4b7be44f22e97fcaaec13683`, review index then reconciliation/register | Initial full absorption is selected, no autonomous acquired label/second studio; current P15 disposal/claims/rights and P14 employment producers required. Do not treat older P15 list as reopening P16's resolved product direction | Separate readiness/order after real upstream producers. Apply later P15 correction over P16's older cited estate text: **14-week maximum is withdrawn**, not a proven bound |

The P14 index still describes a P12 reconnaissance base and incomplete post-P13 refresh; preserve its useful preparation rather than treat that stale runtime as today's. The P16 register says no genuine product choice blocks a slice; producer readiness/tuning are still required. P15's frozen Legacy/Endless and full-absorption directions are not a reason to execute them during the UI pass.

## 9. Allowance, stages and durable continuation

Latest issued UI allowance is **108 cumulative productive lead hours = 72 capability + 36 protected verification/correction/delivery**. All prior Playability work counts once. Actual consumed capability `C_used` and reserve `V_used` are **not reported in accessible current records**. Remaining is `72 − C_used` and `36 − V_used`, not 108 fresh hours. P13A's 22h30m historical remaining reserve does not transfer. Fable setup/smoke/adoption times must be identified, not silently mixed with native capability or counted twice. Account quota and context size are not hours remaining.

At the local checkpoint, reconcile each stage: selected studio/roster and connected inspection; remaining rendered layouts/shared controls/art; all-domain integration; native/correctness/performance/delivery. Show already completed reusable work, current defects, dependency owners, remaining capability and verification effort, and contingency. Keep 04's cumulative 48/60/72 capability stops, 24/18 reserve alerts and last six reserve hours for reverify/package/delivery. Full-overhaul fit remains OPEN under 05; a new terminal is not its resolution. If the whole remainder exceeds the issued envelope, return a priced staged amendment, never drop required portraits/drag/help/screens or spend reserve to finish features.

| Phase | Capability allowance | Verification reserve | Status |
|---|---:|---:|---|
| Current overhaul | 72 total, subtract actual prior C_used | 36 total, subtract V_used | Issued; whole remaining fit still to reconcile |
| P13B | 84 | 36 | 120-hour **proposal**, not activated or borrowed now |
| P14 / P15 / P16 | Not issued by this handoff | Not issued | Define phase/slice-specific allowances at their own readiness gates; no promise the program fits one account window |

After meaningful increments and before compaction/exit, Fable updates the **existing** board/handoff with: order/phase; current candidate and build pins; actual changed paths and dirty/WIP preservation; requirement→result; raw checks/failures; three critique statuses; open coverage/defects; budget used/remaining; exact next task; production and native-input ownership. Read-only specialists return findings; Fable persists them. Do not put credentials, personal campaign data or private session links in Git. A concise sanitized public continuation may point to protected local metadata, but essential source/next-task facts must be recoverable without the old chat.

## 10. Required return from the safe local checkpoint

Update this existing entry or its already-owned continuation record with: exact adopted configuration commit and any separate narrow instruction commit; old-owner yield times/status and later successor acceptance; actual source/build/schema/DTO bindings and preserved unfinished paths; linked test/native evidence and failures; completed screen/state register and finite remaining estimate; first assignments' frozen inputs/path permissions; installed CLI/access/asset check; initial registry observation after fresh start.

Until those facts exist, report **PREPARED — LOCAL TRANSFER/ADOPTION/USAGE GATES OPEN**, not launch complete. In particular: no fresh Fable session started, no specialists dispatched, no native work here, no protected refs promoted. Documentation preparation can proceed independently; an unrelated future P15/P16 question cannot block it or an already-authorized nonconflicting current task.

Official command references checked 2026-09-13: https://code.claude.com/docs/en/cli-reference ; https://code.claude.com/docs/en/sub-agents ; https://code.claude.com/docs/en/settings . Local installed-version behavior and actual runtime metadata remain to verify; do not modify account/global configuration to match this documentation.
