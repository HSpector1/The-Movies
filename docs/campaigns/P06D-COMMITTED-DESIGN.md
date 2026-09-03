# P06D — Committed Design (grounded in the surface investigation)

> Every decision below cites an authoritative fact found in the read-only investigation. No improvement is
> claimed from source alone — each surface is captured + reviewed in pixels before keep/revise/revert (§5).
> Money is **absent** from rail/card DTOs; §26 amounts are NOT renderable without a wire change (§29 forbids
> wire changes for presentation) → **no money on rows/cards; documented, never fabricated.**

## A. Movie rail row anatomy (§6-9) — PRIMARY

**Baseline (StudioProductionRailHud.DrawProductionRow, RowHeight 84f):** draws state-**chip first** (y+8),
title below (y+28), 6-seg track (y+54), a time/waiting line (y+62), LOCATE zone. It draws **no location**
and **no plain-language state** — although `facilityLabel`, `stateLabel`, `nextMilestone`, `weeksRemaining`,
`stateWeeksRemaining`, `primaryWorkTarget.label`, `blockerAnatomy.headline` are all authoritative.

**Decision — title-first hierarchy (2-second read):**
1. PRIMARY = **title**, drawn first + largest (dominant weight). Ellipsis via existing `FitTitle`; identity
   never bound to truncated text (rows keyed by `productionId`) — §7.
2. SECONDARY = **plain-language state** from `stateLabel` (a short chip word retained as the attention marker).
3. TERTIARY = **location + time** — `facilityLabel` (or `primaryWorkTarget.label`) + `weeksRemaining` /
   `stateWeeksRemaining` / waiting condition, only where authoritative (worksiteResolution=exact).
4. ATTENTION = one restrained marker (word + shape/glyph, never color-only — already the case; refined).
5. AFFORDANCES = **Locate** (exists) + **Details** (new; opens the owning workspace/card).
- Row grows ~84f → ~100f to fit title-first + state + location/time without shrinking type (§10 no shrink).

**Attention states (§8)** map operationalState → six distinct treatments, never color-only:
autonomous (calm) · waiting (`· WAITING`, amber, not red) · blocked (distinct glyph + Blocked color) ·
action-required (`▸`, Action color) · release-ready (strong, Action) · committed (resolved green, "releases
next week"). `attention` DTO field (normal/active/warning/decision-required/…) corroborates the mapping.

**Lifecycle track (§9):** keep the 6-seg discrete track (DEV/CASTING/PROD/POST/RELEASE READY/COMMITTED).
Add completed/current/future shading + a waiting/blocked overlay + action-required overlay if review supports.
No %, no Released/Theaters/Reviews/Earnings segment (P07). Architectural future-proofing documented (§25).

## B. Rail scale + one scroll owner + cap law (§10-11)

**Baseline:** no ScrollView anywhere; height is bounded by `MaximumMovieRows = 6` → overflow rows drop into
`hidden` and a "+N more" line the player **cannot reach** (the real §10 gap).

**Decision — one scroll owner:** wrap the single shared slate (draw in OnGUI + hit-test in TryConsumeClick,
both reading `LayoutSlate`) in ONE vertical scroll offset clamped to a fixed visible viewport. `CurrentRailRect`
keeps returning the fixed visible rect so the People-strip anchor (`railRect.yMax`), camera guard, and
system-menu guard stay stable. Mouse wheel + keyboard (arrows/PageUp/Down) drive one offset. **Cap law:**
with a scroll owner every row is reachable, so no active/attention/selected row is ever silently lost;
"+N more" survives only for an explicitly collapsed group (collapse state lives in the HUD MonoBehaviour,
**never serialized to GameState** — §10). Selected row auto-scrolls into view (§10 "selected row does not
disappear"). Prove 0/1/3/6/8/10/15 via the hero fixture + counts.

## C. Title / identity stress (§7)
`FitTitle` ellipsizes; add full-title tooltip (GUIContent.tooltip) + selected-row shows exact identity.
Duplicate + same-suffix titles are safe (keyed by `productionId`; render is per-id). EditMode tests for
8/30/60-char, duplicate, same-end-differ.

## D. Building-card convergence (§13-18) — bounded to truthful, provable wins

**Reality:** Development = IMGUI card (full anatomy). Casting = UI-Toolkit entry card + workspace. Stage =
UI-Toolkit entry card + workspace. **Post = NO card** (world presenter, single word). Talent = a panel inside
Casting, not a building.

**Decisions (bounded):**
1. **§17 truth agreement (highest value):** the Stage **entry card reads `presentationState`**, a *different*
   vocabulary from the rail's `operationalState`. Verify whether they can disagree for the same production; if
   so, make the entry card's state derive from / agree with `operationalState` (same discipline as Priority
   Zero). Add a regression test. "SHOOTING vs POST must remain impossible" (§18).
2. **§13/§15 STATUS sentence:** the Casting entry card speaks only a phase chip — add a plain-language STATUS
   sentence. Preserve CASTING SHORTAGE → FIND AN ACTOR verbatim (`StudioCastingShortageContracts.FindActorLabel`).
3. **§13 PLACE eyebrow grammar:** converge the five PLACE grammars toward one shared "IN THE LOT · <PLACE>" form.
4. **§13 action ranking:** ensure forward action outranks Back and there is one primary CTA (see §E for the
   worst offender in the Casting *workspace*).
- **Post interactive card (§18) + Release commit** are the largest gaps; scoped honestly (see §F) — a new
  interactive surface + read-model wiring is a build, gated on not risking the mandatory closers.

## E. Workspace convergence (§19) — materially-obvious only

Two workspaces (Casting + Production, UI-Toolkit/USS). **Real, provable defects:**
1. **Production CTA scrolls off** (inline in the detail ScrollView, `align-self:flex-start`) while Casting pins
   a persistent bottom action strip → add a persistent Production action strip (one primary CTA always visible).
2. **Casting Back styled `.primary-action`** (ranks EQUAL to every forward action, many primary buttons) →
   demote Back so forward outranks (§13/§30 "Back visually outranks action" is a reject condition).
3. **Blocker panel shape** diverges (Casting = left-rule danger callout; Production = neutral rounded card) →
   converge to the left-rule danger callout.
4. **Production has no disabled-button styling** → add it (disabled CTA must not look enabled).
Shared grammar HEADER/SUBJECT/STATUS STRIP/BODY/ACTION STRIP/SECONDARY. No workflow-logic rewrite.

## F. Guidance de-emphasis (§20) — conservative; do not orphan truth

**Critical finding:** de-emphasis is SAFE for Development/Casting/Talent (facts duplicated in owners), but the
memo is the **only** owner of: the Release **commit/hold** control (`commitPictureToRelease` is not ceded and
has no live workspace), **critical reception** (memo-only), and **all Post-phase text** (Post building has no
text). §20: move truth to its owner BEFORE reducing prominence.
**Decision:** (a) verify Dev/Casting/Talent/Production routes work without the memo and reduce redundant
prominence there only; (b) do **not** de-emphasize guidance for Release/Post (still the owner); (c) STRETCH,
gated on cleanliness + tests + no closer risk: surface the existing `commitPictureToRelease` intent as a
primary CTA in the Production workspace when `operationalState==release-ready`, de-orphaning the commit. This
is UX plumbing of an EXISTING P06 intent — **not** P07, **not** new reception state. If it threatens truth or
the closers, revert and document as backlog.

## G. Accessibility / visible focus (§21) — smallest shared mechanism, no parallel framework

**Baseline:** zero focus system; rails don't even show the selected row; selected-vs-hover differ by hue only.
**Decision:** add `StudioUiTokens.Focus` + one static `DrawFocusRing(Rect, scale)` (IMGUI). Movie rail + People
strip each hold `int focusedRow` (Tab/arrow traversal in their existing event block) and a visible `selectedRow`
ring **distinct** from focus; Enter/Space routes to the same Locate/Select path as the mouse. Give the world
selection ring a shape difference from hover (fix the hue-only violation). UI-Toolkit workspaces: add a visible
`:focus` outline in USS (buttons are natively focusable) covering primary action / Back / Locate. Min click
target respected. No user text-size control exists (viewport-density scaling only) — documented as bounded.

## H. People strip (§23) + economic clarity (§26)
Refine only if image review shows value: stronger profession hierarchy (RoleLabel/Assemble ordering),
availability emphasis, existing "+N more", one "Open Talent" affordance (footer → actionable). No ratings/
needs/mood/candidate-as-employee (DTO has none). **§26:** money is absent from rail/card DTOs — render nothing
monetary on rows/cards; documented finding, never fabricated.

## I. Mixed-slate hero fixture (§12)
Fixtures are **digest-bound** (built by `scripts/gen-p06-visual-oracle-fixtures.mts`; IDs minted via public
seams; hand-editing breaks importSave invariants + checkpoint digests). **Decision:** add a 7th generator
scenario cloning `s6-multi-picture-contention` (richest, 4-way), extended to 6-8 productions spanning
Development, Casting (needs a `castingSessions` build — none exist today), Shooting, blocked-Production,
Post/waiting-Post, ReleaseReady + Committed → all three rail groups at once. Presentation/proof only; no law
change. Regenerate; capture at 1280×800 / 1440×900 / 1720×1045 / native (oracle hard-codes windowed →
native-fullscreen comes from the HID proof `PROOF_FULLSCREEN=1`, documented).

## J. Docs (§24 adaptation, §25 future seam, §27 perf)
- §24: adaptation review of the final mixed slate vs original *The Movies* (principles adopted/rejected).
- §25: document `MovieRailFutureExtension` (authoritativeLifecycle / optionalStoryAttentionId /
  optionalResultAvailability) as CONCEPTUAL architecture only — no schema fields, no wire dep, no P07 render.
- §27: rail perf at 1/5/10/15/25 — slate assembles from already-projected rows (no per-frame scene search
  confirmed); with the scroll owner only visible rows draw. Measure allocations / layout rebuild / hit-test.

## Tooling (verified commands, P06D paths)
- Build: Unity `-executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS -quit` → manifest
  `Tools/p04a1-build-manifest.sh` (CLIENT_REPO/TS_REPO override).
- Oracle: `P06_TS_REPO=<P06D TS> Tools/p06-run-visual-oracle.sh <scenario>` (viewport via
  `P06_ORACLE_WIDTH/HEIGHT`; fullscreen not supported → HID proof for native fullscreen).
- EditMode: Unity `-runTests -testPlatform EditMode` (no `-quit`); focused via `-testFilter`.
- Real HID: `Tools/p04a1-run-owner-input-proof.sh` (PROOF_WIDTH/HEIGHT/FULLSCREEN/JOURNEYS).
- Real-profile journey: `node_modules/.bin/vite-node scripts/p06-real-profile-journey.mts` (original read-only by construction).
- Engine bundle rebuild (if src/ui changed): `npm run build:studio`.
