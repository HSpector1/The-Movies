# P05A.2 — Owner-usability closeout: Camera Test flow + Production state clarity

**Checkpoint:** the Owner KEPT the P05 foundation but could not confidently
answer basic questions: whether Camera Tests were optional, what the week
bought, what Back would discard, and what Rehearsal/Load-In/Blocked/Shooting/
Wrap mean. Narrow presentation/state closeout — no Production redesign, no
engine-law changes, no P06.

**Authority:** TS campaign tip `52b57bc6aed00d14542654dd855caf24121b6071`,
Unity campaign tip `e2ab80dd0ebef14a16aaef4b8a3ce7f8c9b48f11` (the prior
report's inconsistent abbreviation resolved: `e2ab80d` was correct; the other
string was a head/tail splice). Protocol 4 / projection 12 / schema
`a6f37459…` / save 15; P05A.1 player `5ef97f1f…`. Branches
`wip/p05a2-owner-usability-ts` / `wip/p05a2-owner-usability-client`.

## What the maps established before any edit (three parallel read-only mappers)

- The ONLY optionality signal was the button label "Continue without tests";
  no sentence anywhere explained tests are optional, what they cost, or what
  they produce. The readiness strip pushed package completion.
- The underway panel had NO next-action control or copy at all.
- The Back prompt was one generic constant ("Discard uncommitted Casting
  selections?") for every situation; the trigger logic was already correct
  (a committed session never counts as a draft), so only the WORDING lied.
- Engine truth (mapped, not changed): a submitted session can NEVER be
  cancelled by navigation (no such verb exists); one session per screenplay
  ever; no fee, no talent hold; the slot frees at review; results persist
  forever until acknowledged; evidence = observed estimate ±6 per read;
  nothing on any talent changes.
- ONE invented fact found: the white guidance card claimed "Role Fit updates
  for this screenplay" — `projectFit` never reads audition evidence. FIXED at
  source (TS `dc5ac66`) — the card now states only what is recorded.

## The changes (Unity `96032b5` + journeys `9ed9dd7`, TS `dc5ac66`)

**Camera Test flow (§3–11):**
- `casting-tests-offer` block in the notStarted base, ABOVE the package
  surfaces: "CAMERA TESTS — OPTIONAL · Test acting candidates before final
  casting. Takes one studio week. No role is assigned automatically. Weekly
  payroll and studio overhead continue." Plan/Skip act on it ("Skip camera
  tests" replaces "Continue without tests").
- Planner: `casting-slate-week-law` states the one-week economics BEFORE any
  quote, including "availability and greenlight affordability are re-checked
  afterward" (the exact surprise the Owner hit).
- Underway: `casting-underway-next` — auditioning: "Next: advance one studio
  week — time runs from the studio clock above."; queued: the slot-wait
  variant. (The consequence line — no fee, payroll continues — was already
  the wire's own sentence and remains.)
- Review: `casting-review-changed` ("WHAT THE TEST CHANGED" — evidence that
  did not exist before; assigned no role; use alongside Fit/Star Power/
  availability/cost), each row juxtaposes "expected {epLow}–{epHigh} ·
  observed ~{est} (range {low}–{high})" — both bands are published wire
  facts; the engine's own law (tests change no talent fact) makes the live
  expected band the pre-test band. No delta is fabricated. Route out:
  "Continue to final casting".
- Back/discard (§8): `StudioSystemMenuContracts.DiscardPromptFor` composes
  the EXACT truth from five separable facts — unsubmitted slate discarded /
  uncommitted package discarded / queued request stays queued / running
  tests continue / results are saved — threaded through all three confirm
  sites (Back-Esc, Load, Quit) via `StudioWorkspaceHost.CurrentDiscardPrompt`.
  When nothing discardable exists the host still never prompts (unchanged
  gate). One quit-prompt pin updated to the specific-truth law.

**Production clarity (§12–15):**
- `StudioProductionWorkspaceContracts.NowSentence` (workspace STATUS rail)
  and `StudioStagePlacardContracts.NowSentence` (stage entry card): one
  plain-English sentence per state from published facts (facility label,
  logistics arrived-flag, blocker anatomy detail verbatim behind "Production
  cannot continue."); withheld states say nothing.
- `ActionRequiredBanner` ("ACTION REQUIRED — {anatomy.headline}") +
  `ActionNextLine` ("Once submitted — {nextMilestone}") when a decision
  exists; explicit `NoActionLine` (advancing vs capacity-wait variants) when
  none does — the CURRENT DECISION section never silently vanishes.
- §14 audit: with the NOW sentence + banner/no-action + the existing header
  (movie·state), STAGE & SET, COMPANY, WHY IT WAITS, and next-milestone
  rows, the workspace independently answers movie/stage/state/people/
  blocker/action/next. The guidance card remains, unchanged except the
  invented-fact fix.
- §15: wrap states speak "Filming is complete… released… waiting for Post
  capacity" (waiting-for-post) vs "Post-production has taken over"
  (post-handoff); read-only; no P06 controls (unchanged).

## Floors

- Unity EditMode **673/673** (10 new P05A.2 tests: offer/skip/underway/
  queued/planner-law/review-value/discard-composition/NowSentence per state/
  stage sentences/action clarity).
- TS: journey-copy fix suite green; full floor + all three typechecks
  recorded below.

## Owner-profile packaged journeys (byte-copies only; real profile untouched)

- **Camera-test flow (`-castingJourneyOwnerTests`, week-5 copy — the state
  where a legal six-read slate exists; the CURRENT week-8 copy cannot form
  one: only two distinct actors for three roles, which the completeness gap
  states truthfully):** PASS at exe `46525882…` — offer visible with full
  law → planner week-law → slate → submit → queued/underway next-action →
  advance → WHAT THE TEST CHANGED + observed readings → "Continue to final
  casting" → final cast/budgets → truthful greenlight ("The Vanished
  Constellation greenlit — production formed · $4,415,429 committed").
- **Production clarity (`-studioP05A2Clarity`, the Owner's CURRENT week-8
  copy, two live stages):** PASS — Soundstage 7 (blocked): entry "Production
  cannot continue on Soundstage 7. Open the production for the exact cause
  and remedy." → workspace "Production cannot continue. The locked Director
  has not been dispatched to the stage." + "ACTION REQUIRED — Director call
  required"; Soundstage 12 (rehearsal): "The cast and director are preparing
  on Soundstage 12. Filming has not started." + "NO ACTION REQUIRED —
  production is advancing automatically."; the two stages speak different
  truths (isolation).

## Regressions

- P05A.1 owner-repro: PASS at the new exe. P04 casting direct: PASS.
  4M machine journey: PASS.
- Casting navigation journey + 4H: first attempts FAILED under a LOCKED
  macOS session (CGSSessionScreenIsLocked=true — the standing harness law;
  the failures began exactly when the session locked and the in-engine-
  capture journeys kept passing). Re-run after unlock, recorded below. The
  crash the lock exposed in the HID driver (screenshot helper threw instead
  of failing soft) is fixed.

<!-- unlock re-runs + visuals + hostile review recorded below -->
