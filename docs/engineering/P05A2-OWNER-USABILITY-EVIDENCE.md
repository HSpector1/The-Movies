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

## Post-unlock re-runs

4H and the WriterCredit journey re-ran green after the session unlocked
(hid-20260831T143439Z complete failures=0; WriterCredit complete with
save/load + writer-credit laws intact at exe `20569ec7…`). The
`-castingJourneyNavigation` variant still failed on the unlocked session and
was BISECTED at the preserved P05A.1 binary (exe `5ef97f1f…`): byte-identical
failure ("Timed out waiting for the auditionee's live world anchor",
navTalentId t-act-02) — **pre-existing, not caused by P05A.2**; carried
forward as a known non-blocker (likely the W7-ratified exact-zone body law;
the round-1 hostile reviewer independently corroborated the exe/asm pair
against the P05A.1 manifests). Provenance-hygiene note (hostile F5): the
bisect run's regenerated build-manifest recorded the LIVE checkout rather
than the swapped binary's source — the reviewer's independent corroboration,
not that manifest, is the binding evidence; manifest regeneration after an
app swap is now a recorded anti-pattern.

## Visual / responsive review (§19)

Oracle s2–s6 re-run; the casting flow captured at 1280×800 / 1440×900 /
1720×1045 / 3456×2234-fullscreen; the clarity walk at 1280×800 / 1440×900 /
3456×2234. Key frames inspected at the extremes: the OPTIONAL offer fits
cleanly at 1280×800; the queued underway panel at 3456 fullscreen carries the
six reads + the amber next-action; the review at 1280 shows every
expected-vs-observed pair, WHAT THE TEST CHANGED, and "Continue to final
casting". Scrollbar discoverability: content reachable by wheel — recorded
as polish per the Owner's §19 instruction, not fixed.

## Hostile review round 1 — REJECT (F1–F5), all corrected at root

The fresh reviewer verified the whole floor and journeys, confirmed the
lie-removal is real (projectFit provably never reads audition evidence),
found NO criterion tripped among 1–9/11–16/18 — and REJECTED on:

- **F1 (blocking)**: `NowSentence` used `row.facilityLabel` — the JOINED
  reserved-facility list — so the checkpoint's own frames read "on their way
  to Soundstage 7 + Scenery Shop 2" (the scenery's ORIGIN named as its
  destination) and "Cameras are rolling on Soundstage 7 + Scenery Shop",
  each contradicted by the rows beneath. Fixed (Unity `89bd882`): the
  sentence takes the RESOLVED single stage label (StageRowByFacilityId — the
  same resolution STAGE & SET and WrapHandoffLine use); the unit fixture now
  carries the real joined wire value.
- **F2 (blocking)**: `ActionNextLine` ("Once submitted — {nextMilestone}")
  asserted an unpublished temporal claim that was tautological in all three
  reachable states. DELETED; a reflection pin keeps the method gone.
- **F3**: criterion 17 was unenforced at the row level (an additive
  fabrication passed 673/673). The review-row assertions are now EXACT
  equality.
- **F4**: the planner week-law line rendered below the fold at 1280×800 and
  1720×1045. Moved above the fold (top region, planner-gated); the
  owner-tests journey now asserts on-screen GEOMETRY, not just text.
- **F5**: the bisect-manifest provenance note above.

## Hostile review round 2 — ACCEPT (inheriting verifier; round-1 transcript lost)

The round-2 verifier (fresh context, explicitly inheriting the round-1
verdict per the campaign's established precedent) re-ran the full floor
(673/673 measured), verified every fix at root and IN PIXELS at the new
binary, ran five mutations (the headline re-introduction of the joined label
KILLED by the fixture), and returned **ACCEPT** with non-blocking findings —
all closed before seal (Unity `31d3800`):

- **F6**: the clarity journey now pins the workspace sentence to the
  stage-resolved expectation (a call-site regression of F1 fails the
  packaged journey, not just the unit fixture).
- **F7**: exact-equality evidence pins extended to ALL THREE roles plus the
  Fit label.
- **F8 (ruled acceptable by the reviewer)**: the name-based F2 pin does not
  bar a renamed tautology; the shipped section contains only published
  facts, and absence-of-arbitrary-invention is not pinnable by name.
  Recorded.
- **F9**: this document completed (this revision).
- **F10**: the F4 fix re-proved at 1720×1045 (a round-1 defect viewport);
  the 3456 fullscreen equivalent is the same ~1720-logical layout at the
  ratified 2.009 scale and its earlier capture stands.
- **R5** stale comment fixed; **R6** the oracle set re-unified at the seal
  binary (rehearsal/blocked-waiting/wrap re-captured); **R2/R3/R7**
  recorded: the pre-existing "Package draft · not committed" badge beside a
  formed receipt; the deliberately quiet skip-button styling; the
  root-relative (not viewport-relative) geometry gate.

## FINAL floors — seal binary `7e418c0542fc74a19066268ea4aac1c7c71bd6ecd5654111f6703d43324fd48b` (Unity `31d3800` / TS `694aae9`+docs)

EditMode 673/673 (after the last code change). At the seal binary: oracle
rehearsal/scenery-load-in/blocked-waiting/shooting/wrap; owner-tests journey
at 1440×900, 1280×800, AND 1720×1045 (geometry-asserted week-law); clarity
walk (F6 pin live, single-stage sentences); 4M; P05A.1 owner-repro — all
PASS. 4H at the seal binary recorded on the next unlocked session (it passed
at the two predecessor binaries of this range; the seal delta is
tests/comment/runner only).
