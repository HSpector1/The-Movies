# P06A — known findings (surfaced during the six-scene Visual Oracle capture)

Honest register of issues found while inspecting the actual oracle image bytes. Each records
severity, whether it is a P06 regression or pre-existing, the owning seam, and the disposition.
Per the project law: a gap is reported, not silently filled.

## F1 — waiting-badge glyph rendered as tofu — **FIXED**

- **What:** the movie-rail POST-waiting badge used `⧗`, which the packaged player font lacks, so
  it rendered as a `□` box ("POST □ WAITING") in the wrapped-waiting and multi-picture-contention
  frames.
- **Regression?** New this wave (my LSCL rail badge). In scope.
- **Seam:** `StudioProductionRailHud.DrawProductionRow`.
- **Fix:** font-safe badges only — action shows `▸` (its word lives in the "your decision" time
  line); a block shows "· WAITING" (word + amber chip, never colour alone). Both glyphs are
  already used elsewhere in the shell. Rebuilt and re-captured to confirm.

## F2 — first-film-journey guidance card describes a wrapped picture as "shooting" — **DOCUMENTED (pre-existing, out of P06 scope)**

- **What:** in the `wrapped-waiting-for-post` scene, the top-left picture-guidance card reads
  "SHOOTING · Principal photography started · the director, cast, and crew are working on set ·
  N weeks remaining · Shooting continues · advance the week" for a picture that has wrapped and is
  waiting for a Post slot. The P06 surfaces are correct: the movie rail shows "POST · WAITING ·
  Waiting for Post" and the Production/Post building derives the WaitingForPost cue.
- **Root cause:** the copy originates in `src/core/firstFilmJourney.ts`. The engine keeps
  `phase === 'shooting'` for a wrapped picture whose transition to postProduction is
  capacity-blocked (the `wrapped-waiting-for-post` operationalState captures the block); the
  first-film-journey guidance keys on **phase**, not operationalState, so it shows shooting copy.
  The recommended *action* it gives ("advance the week") is correct — only the state
  *characterisation* is stale.
- **Regression?** No — pre-existing. Both the first-film journey and the `wrapped-waiting-for-post`
  operationalState predate this wave; P06 (W3/W4/W5 + the LSCL rail) added the
  operationalState-aware surfaces that now make the journey card's phase-based copy look
  inconsistent beside them.
- **Scope:** `firstFilmJourney.ts` is the C1 onboarding journey. Onboarding is on the CLAUDE.md
  "not current scope" list. Modifying a core, test-heavy C1 module to special-case
  wrapped-waiting is **not** P06 Post/Release work, and doing it silently mid-P06 would be exactly
  the kind of unbidden change the project law forbids.
- **Hostile criteria:** trips none of the 25 (it is neither an auto-release, a batch/economy
  fault, a Post-subphase invention, a disappearing/leaking movie, nor a code/report contradiction —
  it is a phase-vs-operationalState copy nuance on an onboarding card).
- **Disposition:** left for Owner/hostile-review judgment. If deemed in-scope, the fix is to make
  the first-film-journey guidance (and any phase-based picture card) read `operationalState` for
  the wrapped-waiting and release-ready families so the card, rail, and building speak with one
  voice. Tracked here so it is findable, not lost.

## F3 — the release-commit control is reachable, via the workflow memo (functional) — **VERIFIED, with a placement observation**

- **What:** an early literal search for `commitPictureToRelease` in Unity presentation found only the
  pure contract, which momentarily looked like the packaged player had no way to commit a release
  (the P04 lesson-4 defect). Re-checked: it is reachable and FUNCTIONAL. The workflow memo
  (`StudioBridgeClient.OnGUI`) renders every non-ceded available intent as a `PlayerWorkflowButton`
  and dispatches it through `SubmitPlayerWorkflowIntent` → `SubmitIntent` on click. The
  `commitPictureToRelease` intent is not ceded (unlike founding/development/time/casting, which the
  memo cedes to their world surfaces), so "Commit &lt;title&gt; to release" is a real, dispatching
  button — confirmed in the release-ready and multi-picture oracle frames, and the machine
  real-profile journey exercises the same core action end-to-end (25/25).
- **Observation (not a defect):** by the codebase's own principle (development/casting/founding/time
  are ceded from the memo to world surfaces), the release commitment could also be ceded to a world
  surface — the Production/Post building's retained workspace — rather than living in the workflow
  memo. W5 shipped the `StudioReleaseContracts.Decide` decision contract and the reachable-via-memo
  control; a bespoke world release-commit surface that cedes the memo button is a reasonable future
  refinement. Not blocking: the capability is reachable, visible, and dispatches (so hostile #16
  does not fire).

## F4 — HID (synthetic macOS input) journey is blocked by the session display, not by the product — **BLOCKER (documented), compensating proof at four levels**

- **What:** the required HID journey drives the P06 commit via real CGEventPost input on the
  packaged player. `Tools/ownerinput` builds and is accessibility-trusted (`AXIsProcessTrusted=true`),
  but the packaged player, launched in this autonomous session, creates **no on-screen window** the
  Window Server tracks (window enumeration lists only loginwindow / Chrome / Menubar; a full-screen
  `loginwindow` at layer 2004 indicates a locked/inactive display). `screencapture` captures the
  desktop, not the player. The Visual Oracle still works because it captures the app's INTERNAL
  framebuffer via `ScreenCapture.CaptureScreenshot`, which needs no window — but real HID clicks
  require an on-screen window to land on.
- **Why it is environmental, not product:** the same direct-exe launch renders the full game UI
  (seven real oracle frames inspected). The app renders; the session simply does not present its
  window for OS-level input. Resolving it needs an interactive GUI session / unlocked display —
  Owner/operator territory, not an autonomous code change.
- **Compensating proof that the commit flow is reachable and correct** (what the HID journey would
  have shown): (1) machine real-profile journey 25/25 — the full Wrap→Ready→Hold→Commit→dispatch→
  Save/Load walk on the real profile; (2) six-scene Visual Oracle — the commit button renders at
  Release Ready, the committed state renders, all image-inspected; (3) browser E2E (`App.test`)
  clicks `release-commit` and dispatches; (4) code-verified functional dispatch (F3).
- **Disposition:** SAFE-terminal-state environmental blocker. To run the HID journey, launch on an
  interactive/unlocked GUI session; the harness (`Tools/ownerinput`, the p05 HID pattern) is ready
  and the commit control is the memo's `PlayerWorkflowButton` for the `commitPictureToRelease`
  intent.
