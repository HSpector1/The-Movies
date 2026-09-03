# P06D — Living Studio UX Convergence II — FINAL REPORT (§33)

## P06D STATUS: **COMPARISON CANDIDATE READY** — isolated, NOT integrated · hostile review **ACCEPT (0 blocking)**

An isolated successor to P06C addressing its four deferred areas (rail row anatomy/lifecycle/attention/scale,
building-card & workspace convergence, accessibility/responsive, mixed-slate hero). Nothing merged; both
control candidates byte-preserved; campaign branches unmoved; no P07; no Hollywood Wire in runtime.

## P06C CONTROL (byte-preserved)
- Candidate: `~/Desktop/P06C-Comparison-Candidate-d66b7ab-438feb2/`
- TS engine-binding `d66b7ab` (engine bundle `c00cbfd5…`) · Unity `438feb2` · player exe `2c235c390ae7fc8d…` ✅ · asmC# `12478c05…`
- P06B also intact: `~/Desktop/P06B-Owner-Candidate-48c419d-18a2887/` exe `130a13a0…` ✅

## P06D CANDIDATE (isolated WIP; campaign untouched)
- TS `wip/p06d-living-studio-ux-convergence-02-ts` (build-bound `050b98e`; docs tip advances) · engine bundle
  `c00cbfd5…` (UNCHANGED from P06C — P06D changed no engine source; it is presentation + fixtures + tests + docs)
- Unity `wip/p06d-living-studio-ux-convergence-02-client` (`23c000a`; +.meta `b0c780b`)
- **Player exe `076e8c62906de5d7…`** · asmC# `2328c855…` · schema/protocol/save unchanged (V16, protocol 4)

## MOVIE RAIL (§6–13, §17–18)
- **Row anatomy (title-first):** each row leads with the **title** (dominant, FontCardTitle bold Ink), then a
  plain-language SECONDARY state (`stateLabel`), a discrete 6-segment lifecycle track, and a TERTIARY
  `facilityLabel · N weeks` line — all authoritative (never fabricated). One restrained attention marker.
- **Attention (§8):** six distinct states via `AttentionOf` — autonomous (calm) · **waiting** (slate, not a
  red alert) · **blocked** (amber, distinct from waiting) · **action-required** (▸, oxblood) · **release-ready**
  (▸, thicker accent — earns strong attention) · **committed** (green, resolved). Colour always rides a word + a
  shape (accent + track), never colour alone.
- **Lifecycle track (§9):** discrete DEV/CASTING/PROD/POST/RELEASE READY/COMMITTED — never a percentage; stops
  at COMMITTED (no P07 Released/Theaters/Reviews/Earnings row).
- **Scale + ONE scroll owner (§10–11):** no silent cap — the whole slate enters a single `BeginScrollView` and
  scrolls (wheel + PageUp/Down/End) inside a bounded viewport, so the rail never overruns the lot and no
  action-required/blocked/release-ready/selected row is ever hidden. Proven 0→14 rows (scale-stress fixture +
  viewport-law EditMode tests).
- **Interaction:** world-first preserved — a row selects/Locates only, commits nothing (real-HID calibration
  clicked the reworked rail-locate-casting at real pixels).
- **Identity (§7):** long titles ellipsise with a full-title tooltip; identity is keyed to the exact
  productionId/projectId — duplicate + same-suffix titles proven distinct-by-id (never bound to visible text).

## MIXED-SLATE HERO (§12)
New deterministic oracle scenario `mixed-slate-hero` (week 37): SCRIPTS (2 screenplays) + MAKING MOVIES
(shooting + director-required) + POST & RELEASE (release-ready + post-handoff) — all three groups at once,
captured at 1280×800 / 1440×900 / 1720×1045 / 1728×1117 (native-logical). Presentation/proof only; no
simulation law changed. Machine-proven live (§29 mixed-slate machine proof, playerExit 0).

## BUILDING CARDS (§13–18) — truth first
- **Truth convergence (the priority):** rail (`operationalState`) ↔ world Stage card (`presentationState`) ↔
  Production workspace (`operationalState`) ↔ guidance card all agree for the same exact subject + revision —
  a wrapped-waiting picture is never "SHOOTING" on one surface and "POST" on another (P06C Priority Zero kept;
  extended by a new contract test). Raw `phase` stays `shooting` (engine truth) while every live surface reads
  the closed `operationalState`.
- **Casting entry STATUS sentence:** SKIPPED honestly — no authoritative sentence field exists on the casting
  snapshot; composing one would fabricate state (forbidden). Documented as backlog.

## WORKSPACES (§19) + GUIDANCE (§20)
- **Casting Back de-emphasised** (`.workspace-back`, no longer `.primary-action`): the forward action outranks
  Back — confirmed in the HID Casting-workspace capture.
- **Production:** primary CTA pinned in a persistent action strip (never scrolls off); blocker → left-rule amber
  danger callout; disabled CTA no longer reads as enabled. (Code + USS + EditMode verified; live pixel capture
  is the one documented gap — the HID fixture is pre-production.)
- **Guidance (§20):** conservative — de-emphasis only where truth is duplicated; Release/Post remain memo-owned
  (no orphaned truth). No route was made to depend on the memo that wasn't already.

## PEOPLE / TALENT (§23) + ECONOMY (§26)
- People footer is now an actionable affordance ("Hire more at the Casting building ▸" → Locates Casting) +
  keyboard-focusable. Bounded: presence data only — no ratings/needs/mood/return-week, no roster/finance system.
- **§26 economy:** money is ABSENT from the rail/card DTOs; rendering any amount would fabricate state — so
  nothing monetary appears on rows/cards. Documented, never invented.

## ACCESSIBILITY (§21) — runtime-confirmed
Smallest shared mechanism, no parallel framework: rail Tab/Shift+Tab blue **focus** ring (wrapping, visible
order) + brass **selection** ring (selected != focused; both outline shapes); Enter/Space Locates; focused/
selected auto-scroll into view. UI-Toolkit workspaces gained a `Button:focus` outline. People strip focus-able.
**Runtime-proven (item 4):** the real-HID capture shows the focus ring on the clicked rail row; Tab moves focus
only (no camera move, no activation — code + EditMode); arrows/Home stay with the camera.

## RESPONSIVE (§22)
Rail proven at 1280×800 / 1440×900 / 1720×1045 / 1728×1117: bounded (scrolls when tight), full-size type, lot
dominant, no overlap/clip. HID proof ran real input at 1440×900.

## ORIGINAL THE MOVIES ADAPTATION (§24) · HOLLYWOOD WIRE / P07 SEAM (§25) · PERFORMANCE (§27)
Documented: `P06D-ORIGINAL-THE-MOVIES-ADAPTATION.md` (principles adopted/rejected), `P06D-HOLLYWOOD-WIRE-P07-
FUTURE-SEAM.md` (conceptual `MovieRailFutureExtension` only — no schema/wire/runtime dep), `P06D-RAIL-
PERFORMANCE.md` (no per-frame scene search; O(rows) slate; honest note that BeginScrollView clips but does not
virtualize → drawn work is O(total rows), virtualization recommended if 25+ ever common).

## TEST FLOOR (§29) — ALL GREEN (exe `076e8c62`)
- **TypeScript 4905 / 0** (+item-2 truth agreement) · **Unity EditMode 762 / 762** (+12 new: §6/§8 rail, scroll
  viewport law, focus-advance law, §7 identity) · **Visual Oracle 8 / 8** playerExit 0 (incl. s7 hero, s8 scale)
  · **real-profile-copy journey 25 / 25** (durable original untouched + read-only) · **real owner-input HID
  OVERALL PASS** (calibration on the reworked rail control; A 24/24 attempted / 5 state-gated BLOCKED = not
  regressions; E 4/4; F 1/1) · bridge/CF-09 unaffected (no wire change).

## BEFORE / AFTER (§28)
`P06D-BEFORE-AFTER-MATRIX.md` — P06D "after" frames catalogued + reviewed in-loop (§5); the definitive
side-by-side is the Owner's live comparison of both launchers.

## HOSTILE REVIEW (§30)
**ACCEPT — 0 blocking.** A fresh adversarial reviewer verified all 26 reject-list items against source, tests,
and image pixels; re-ran the item-2 test (12/12), re-hashed both controls (byte-exact), confirmed campaign refs
unmoved, read the HID report (PASS). Five NON-blocking observations (Production-workspace pixel-capture gap;
People footer wording; click coincides selection+focus; the 5 state-gated HID BLOCKED steps; EditMode not
re-run headless by the reviewer). None require a change.

## CANDIDATE (§31) · CAMPAIGN (§31) · WORKTREES · PROCESSES
- Candidate: `~/Desktop/P06D-Comparison-Candidate-050b98e-23c000a/` (player + launcher + manifest + evidence +
  proof + docs + comparison script). P06B/P06C NOT overwritten.
- Campaign branches UNCHANGED: `campaign/living-lot-ts`=`04b67ec`, `campaign/living-lot-client`=`18a2887`
  (local == remote). No fast-forward, no merge, no P06D integration.
- Worktrees clean; caffeinate stopped at seal; no owned processes; no P07 gameplay.

## NEXT ACTION
Owner compares P06C and P06D (`P06D-OWNER-COMPARISON-PLAYTEST.md`) and chooses the replacement candidate.
Then STOP. Only a later explicit Owner ruling authorizes P06D integration.
