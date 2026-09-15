# R3-N4-DESIGN-05 — film-journey family sheet (filled)

**Task** R3-N4-DESIGN-05 under the Owner directive of 2026-09-15 and `plans/R3-OVERHAUL-PLAN.md` (TS `b13179ac`) phase **N4** upstream item
"designer family sheet per materially different layout + risky states". **Mode** DESIGN_PROTOTYPE — documentation only. No source, test, build,
capture or native input was produced; the Unity worktree was read only (HEAD `0703ed7a`), the Editor was never launched.
**Fills** `R3-N4-FAMILY-SHEET-SKELETON.md` (retained). **Binding** R3 HYBRID cards, Backlot language, 1A/2B/3A/4B, `R3-N1-COMPACT-INSPECTOR-MEMO-
SHEET.md` §A/§B/§C/§E, `R3-N1-SHEET-REVISION-02.md` §R1–§R5, `R3-N2-TEXT-RULES-ADDENDUM.md` W1–W6, `R3-N3-VISUAL-STANDARD-SHEET.md`.

**Labels.** `[NAT]` = hand reading of committed Unity/TS source (paper, never a runtime observation). `[REN]` = read off an existing rendered
capture/element map on the private evidence branch. `[R3]` = an already-selected R3 law. `[REC]` = this sheet's recommendation.
**R3 reference for every surface in this family**: `R3/DESIGN.md`, `R3/movie-cards.css`, `R3/previews/03-selected.png` (1440x900) and
`R3/previews/07-small-waiting.png` (1280x720), archive root `/Users/bruce/Desktop/Fable-Verified-Sources-20260914-01/` — sha256 list inherited
from DESIGN-01 §H.1, **not re-hashed in this phase**. Per-surface rows below cite which of the four is the reference.

## 0. Executive summary — disposition per surface

| # | Surface (Unity owner) | Disposition | Why |
|---|---|---|---|
| F1 | `StudioDevelopmentCardHud` + `StudioDevelopmentPresentation` | **refine** | The commission → review → accept/rewrite route, the explicit-absence vocabulary and the `StillDisplayed` refusal are correct and stay. Refine is W5 (the card is an IMGUI content-sized block with no clamp against its own rect) + W3 hit heights + the 4-action review footer (§4). |
| F2 | `StudioProductionWorkspace{,.Navigation,.Remedies}` | **redesign (footer only)** | The two-pane body, the pure `DecideOperation`/`DecideLocate` layer and the remedy law are retained with evidence. The **action strip is redesigned**: it nests a second scroll (`production-action-context`, authored `style.height = 180` fixed `[NAT]`, rendered 142 px `[REN]`) that holds `production-operation-reason` — the refusal can scroll out of view while `production-operation-execute` stays visible. That breaks N2 §4(3) and W4. |
| F3 | `StudioProductionEntryCard` | **retain with evidence** | 111 lines, one control, fail-closed: `OffersOpenProduction(row)` gates the button on the same withheld-truth vocabulary the status line speaks, and a dark/wrapped/withheld stage renders its truthful line and no button `[NAT]`. Only W5's shared `bottom = 12·s` clamp and W3 apply. No re-form. |
| F4 | `StudioCastingWorkspace{,.CompareNavigation,.DisplayedGreenlight,.ReviewAcknowledgement}` | **refine** | Pools, pins ≤ 4, slate of exactly 2/role, the greenlight quote's field-by-field draft equality and the review acknowledgement are correct and stay. Refine is the candidate row's 3–5-action cluster (§4), the single-scroll law (`casting-scroll` owns overflow; compare columns must wrap, not add a scroll) and W3 on `casting-row-*`. |
| F5 | `StudioReleaseResultWorkspace` | **retain with evidence** | Disclosure is already complete and periodised on the wire (`releaseWeek`, `weeksAgo`, `projected`, `runStatus`, `weeksCredited`/`totalWeeks`). Apply only the family clamp (§2) and the W3/§3 "chart also exists as a labelled text list" rule to the per-segment scores. |
| F6 | Screenplay inspection route (`StudioLaneInspectorHud` script variant / `StudioScreenplayInspectionContracts`) | **refine** | The contract is the best absence vocabulary in the codebase (`UnavailableWord`, `UnavailableRecordLine`, identity by ordinal `projectId`) — retain verbatim. Refine only geometry: the lane faces are double-scaled (C8 hand-on) and this is the overlay scheduled to carry that fix, under R1's clamp. |

**Refused here:** no universal undo; no invented journal; no guided first-film tutorial (3A); no auto-pause; no pane-stacking at 200 %
(N2 §4(4) — a two-pane workspace stays two panes at every cell; only rows and button rows re-flow).

## 1. The journey, as one continuous route

| Step | Entry control | Surface that opens | Back/Escape target | Preserved across the step |
|---|---|---|---|---|
| idea → script | `development-commission-open` (lot Development building; also the band's primary) | Development card, commission mode | `development-back` → Development card; Esc ladder §C.8 rule 3 | rail scrolls, both filters, Find text, selected record, invoking focus (`RailReturnContext`) |
| script review | `development-review-open` / lane card `DETAILS` | Development card, review mode | `development-back` | as above + `reviewGeneration` identity (a changed review is refused, never re-targeted) |
| script → casting | `development-go-to-casting` | Casting workspace, role rail | `casting-back` → lot | casting `context` (`ProjectId`, `ComparePins`, `CompareOpen`, `TalentMarketOpen`) |
| casting → greenlight | `casting-review-greenlight` / `casting-primary-action` | greenlight review body (`casting-gl-*`) | `casting-gl-back` → casting base mode | the reserved quote + draft; any field change invalidates it (`IsGreenlightQuoteDisplayed`) |
| greenlight → schedule/shoot | `production-entry-open` (world stage) or picture card `DETAILS` → `inspector-open-production` | Production workspace | `production-workspace-back` → lot | `production-detail` scroll offset + selected `productionId` (`CancelViewRestoration` on a successful remedy) |
| shoot → post | no control — time (`weeksRemaining`, `progress01`) | — | — | — |
| release | `commitPictureToRelease` (band/memo, `release.decisions[].legalCommit`) | — (receipt) | — | — |
| result | `inspector-open-result` / picture card | Release-result workspace | `release-result-back` → lot | list selection |

Route-preservation law: §B.6, unchanged. Nothing in this sheet removes a route, hides one behind hover, or makes one conditional on help.

## 2. The family geometry contract (W5 for a two-pane workspace)

Measured basis `[REN]`, `018-map.json` of `Evidence/Playability-Interaction-01/early-2026-09-15T20-19-22-804Z` (1440x900 / 100 %, y bottom-up):
`production-workspace-root` 887x671 at top 94 / bottom **135**; `production-workspace-chrome` **35**; `production-detail-identity` **19**;
`production-detail` (the one body scroll) **432**; `production-detail-actionstrip` **149** containing `production-action-context` **142**;
`production-list` **260** wide; `production-detail-pane` **595** wide. The 94 top confirms W5's shared band by measurement.

```
envelope = viewportH − T − bottom      T = 94 / 166 / 190 [NAT]   bottom = 12·s  [REC], today 135 [REN]
header   = 11·s gap + max(34·m, 19·m titleLine) + 6·s gap = 51 / 68 / 85   (chrome alone measured 35 at 100 % [REN])
identity = 19·m + 4·s                                 = 23 / 33 / 42
footerCtl= 12·s + max(34·m, measured action row) + 14·s= 60 / 77 / 94    (+ 34·m + 6·s at a WRAPPED second row)
context  ≤ envelope − header − identity − footerCtl − bodyMin        ← DERIVED, never the authored fixed 180
body     = envelope − header − identity − footer          bodyMin = 3 × 18·m + 12·s = 66 / 93 / 120
```

| Cell | envelope (bottom 12·s) | header | identity | footerCtl | body at context = 0 | context ceiling | body at that ceiling |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1280x720 / 100 % | 614 | 51 | 23 | 60 | 480 | 414 | 66 = bodyMin ✓ |
| 1280x720 / 150 % | 542 | 68 | 33 | 77 | 364 | 271 | 93 = bodyMin ✓ |
| 1280x720 / 200 % | 518 | 85 | 42 | 94 | 297 | **177** | 120 = bodyMin ✓ (tightest cell) |
| 1440x900 / 100 % | 794 | 51 | 23 | 60 | 660 | 594 | 66 ✓ |
| 1440x900 / 150 % | 722 | 68 | 33 | 77 | 544 | 451 | 93 ✓ |
| 1440x900 / 200 % | 698 | 85 | 42 | 94 | 477 | **357** | 120 ✓ |

The context block is the only elastic term: it grows with its measured content until the body would fall below `bodyMin`, then it scrolls.
The body never falls below `bodyMin` at any cell, and no action rect is published outside the final rect (R1.3).

Retaining today's `bottom = 135` costs 123 px at every cell and still clears `bodyMin` (1280/200 %: envelope 395, body 174, context ceiling 54 — the
context degrades to two lines). **[REC]** adopt `bottom = 12·s`; if the writer measures a lower obstruction at 1280, report the number rather
than shrinking a face (N2 §4(2)).
**Pane split, every cell:** `list = clamp(0.30 × bodyWidth, 220·s, 300·s)`, detail = remainder; both follow `·s` only (W2). At 200 % the LIST
ROWS stack (R4.4 form: each column its own labelled full-width line); the two PANES never merge (N2 §4(4)). Horizontal overflow stays a defect.
**Opaque backing (W6/R5):** the full body rect *and* its scrollbar gutter carry a full-alpha plate drawn before the scroll; a `1·s` keyline at
`header.yMax` and `footer.yMin`, both outside the scroll. Focus = blue `StudioUiTokens.Focus` at `3·s`; selection = brass; attention = amber
mark **plus a word**.

## 3. States × wire fields (the fill-in grid; one rendered cell reference per row)

| # | State | Surface | Exact wire fields that drive it | Rendered cell reference |
|---|---|---|---|---|
| J1 | **Available** | production / development / casting / release | `StudioProductionOperationsSnapshot.currentCommand{label, productionId}` **and** a single published `resolveProductionBlocker` intent for the same `productionId` (`StudioProductionWorkspaceContracts.DecideOperation`); `board.review.accept.{label,lines}` / `board.review.rewrite.{available,label,preview}`; `packageReadiness.knownGatesClear` + `greenlightQueued=false`; `release.decisions[].legalCommit` | owed: 1280/200 % production detail with `production-operation-execute` enabled |
| J2 | **Occupied** | production workspace / entry card / casting pool | `blockerAnatomy.occupants[]{resourceId, ownerId, title, activity, freesInWeeks}`, `blockerAnatomy.projectedWeeks`, `ownedWorksites[]`, `worksiteResolution`; entry card `StudioStageProductionSnapshot.holderProductionId` via `StudioStagePlacardContracts.{SelectableStatusWithLot, NowSentenceWithLot, OffersOpenProduction}`; candidate `available=false` + `availabilityLabel` + `currentWorkLabel` + `returnWeek` | `018-map.json` `production-worksite-*` `[REN]` |
| J3 | **Waiting · cause** | all three | `operationalState` (15 values incl. `scenery-in-transit`, `resource-wait`, `wrapped-waiting-for-post`) + `stateLabel` + `stateWeeksRemaining` + `nextMilestone`; development `status`/`statusLabel` + `dueWeek`/`weeksUntilDecision` + `consequence`; casting `sessionStatus` + `attention='waiting'` | `018-map.json`: `production-now-sentence` "The screenplay is in development. No stage is needed yet.", `production-next-milestone` "Next: pre-production" `[REN]` |
| J4 | **Actionable, refused** | production / casting / release | `DecideOperation` → `ReasonNotPublished` \| `ReasonAmbiguousPublication` \| `ReasonStaleRow` \| `ReasonSettling`; `DecideLocate` + `StudioProductionTargetSnapshot.{locatable, reason}` → `ReasonNotLocatable`; `packageReadiness.blockers[]{code, role, talentId, message, currentHolderId, remedy}` + `willQueue`; `release.decisions[].refusal` | owed: the refusal strip **pinned**, not inside `production-action-context` |
| J5 | **Missing prerequisite** | development / casting | `commission.{canStart, canStartOriginal, canSubmitMarketIntent, canSubmitOriginalIntent, willQueueIntent, blockers[]}`; casting `casting-shortage-{headline,detail,remedy,consequence}` + `casting-find-actor` / `casting-shortage-roster` | `018-map.json` shows the shortage block authored `[REN]` |
| J6 | **Stale** | all | `StudioDevelopmentCardHud:760` `StillDisplayed()` (`client == originClient && generation == reviewGeneration`) → `LastRefusalReason = "review-changed"`; `StudioWorkspaceHost.Displayed{ProductionOperation, ScreenTests, Contract}`; `IsGreenlightQuoteDisplayed` (projectId + director + lead + antagonist + support + craftLead + both budgets must all still match the reserved draft); `IsReviewAcknowledgementDisplayed` (projectId + `sessionId`); `ExecuteRemedy` → `remedyNotice` | owed: one capture per surface |
| J7 | **In progress** | production workspace | `phase`/`phaseLabel`, `weeksRemaining`, `progress01`, `stateWeeksRemaining`, `taskStatus` | `018-map.json` `production-state-label` `[REN]` |
| J8 | **Result** | release-result workspace | `StudioFilmResultSnapshot{releaseWeek, weeksAgo, criticScore, criticStars, criticBand, criticTier, audienceAggregate, audienceTier, audiencePerSegment[], boxOfficeOpening, boxOfficeGrossTotal, studioRevenueTotal, studioRevenuePaidToDate, grossPaidToDate, committedCost, contribution, roi, projected, resultLabel, runStatus, totalWeeks, weeksCredited}` | owed |
| J9 | **Screenplay inspection** | inspection route | `StudioScreenplayInspectionContracts.{IdentityLine, StageWord, DecisionLine, GenreLine, WriterLine, FacilityLine, RewriteLine, AssessmentBand, ConsequenceLine, UnavailableRecordLine, ReviewUnavailableReason}` over `StudioDevelopmentProjectSnapshot` | owed at 1280/200 %, title complete in the body (R1.2) |
| J10 | **Empty / unknown** | all | `operationalState='status-unavailable'` → `StudioRailReturnContracts.UnknownStageWord = "UNKNOWN STAGE"` (line 719, C6 — never "Writing", never art); `worksiteResolution='withheld'`; `UnavailableWord = "unavailable"`; `production-empty` "No active productions this week."; `release-result-empty` "No released films yet." | owed |

**Per-viewport reflow, all ten rows:** the W5 clamp of §2 decides `body`; the title clamps down the R1.2 ladder (`N` = 3/2/1) and at `N = 0`
the complete title becomes the body's first block and the element's published registry text. Label/value pairs stack at 200 %; list rows become
stacked records at 200 %; button rows become one full-width row per action at 200 %, order preserved; the refusal/cost/waiting strip is its own
wrapped block adjacent to the control it refuses and **is never the thing that scrolls away** (N2 §4(3)).

## 4. The three-action record — where R1.5 becomes real

Law (already implemented for the lane overlay, `StudioRailReturnContracts.LaneInspectorFooterMode`, threshold **3** `[NAT]`): below 3 actions
nothing changes; at ≥ 3 the footer wraps to a second row (`+34·m + 6·s`); only where the wrapped footer would push the body under `bodyMin`
does the footer keep the PRIMARY action and move the rest behind `inspector-more-actions` ("More actions  ▸") into the body's own scroll,
headed `LaneInspectorMoreListHeading(n)`. **Generalise the identical rule to this family's workspace footers**, publishing under
`<surface>-more-actions` / `<surface>-more-list`. Never a popup layer, never a lost route, never a second form of the surface.

Records that genuinely carry 3+ actions `[NAT]`:

1. **Development review** — `development-review-accept` + `development-review-rewrite` + `development-back` (+ `development-locate-writer`) = **3–4**.
2. **Production detail (blocked row)** — `production-operation-execute` + `production-remedy-open-<kind>-<setId>-<holderId>` + one
   `production-worksite-locate-<i>` per target = **3+**; the observed unblocked row already carried `production-worksite-locate-0` +
   three `production-company-profile-*` = **4** action controls in one pane at 1440x900 / 100 % `[REN]`.
3. **Casting candidate — dossier action cluster** `casting-dossier-actions`: `casting-choose` + `casting-pin-compare` +
   `casting-slate-add-<talentId>` = **3** `[NAT]`; the in-list row cluster `casting-row-actions-<talentId>` carries `casting-row-choose-<id>`
   and, under a conflict, `casting-row-move-<id>` + `casting-row-move-cancel-<id>` (+ `casting-row-remove-<id>` / `casting-row-return-<id>`) = **3–5**.
4. **Lane picture record** — `inspector-back` + `inspector-locate` + `inspector-open-production` + `inspector-open-result` = **4** (R1.5's own case).
5. **Casting greenlight review** — `casting-gl-commit` + `casting-gl-back` + two budget menus; 2 actions, so the footer never sheds — listed to
   record that it is deliberately *not* a More-actions case.

**Fixture the phase requires** (test-author owned, not written here): a checkpoint in which ONE picture record simultaneously publishes ≥ 3
lawful actions at 1280x720 / 200 % — concretely a blocked production whose `blockerAnatomy.remedies` contains a non-`wait-for-holder` remedy,
whose `currentCommand` is published, and which owns ≥ 1 locatable worksite. `r3n1-dense-01` (development-working:1, 0 blockers `[NAT]`, per
`evidence/.../r3n1-dense-02-source-probe.md`) does **not** satisfy this; confirm or extend `r3n1-dense-02` before the rendered pass.

## 5. Copy — action, refusal, waiting, help (Backlot; 3A contextual only)

| Element | Label | Refusal text (the *why* + the lawful route) | Contextual help (on demand, never a tutorial) |
|---|---|---|---|
| `production-operation-execute` | the engine's own `currentCommand.label`, verb-first | `ReasonNotPublished` / `ReasonAmbiguousPublication` / `ReasonStaleRow` / `ReasonSettling` verbatim — the row's `stateLabel` + `blockerAnatomy` carry the engine's own why beside it | "This is the one decision this picture is waiting on this week." |
| `production-remedy-open-*` | "Open Build · Sets" / "Inspect this set" `[NAT]` | the exact `remedyUnavailableFor` string; after a changed board: "That guidance changed. Review the current blocker and destination again." | "A remedy opens the place where the blocker can be cleared. It commits nothing." |
| `production-worksite-locate-<i>` | "LOCATE" | `ReasonNotLocatable`, or the row's own `target.reason` when the ROW marked it unlocatable (never borrow the engine's advisory for a client-side failure) | "Locate moves the camera. It changes nothing." |
| `production-entry-open` | "OPEN PRODUCTION" | no button at all when `OffersOpenProduction` is false — the status line is the whole answer | — |
| `development-review-accept` / `-rewrite` | the wire's `accept.label` / `rewrite.label` | `rewrite.blockers[]` verbatim; stale: "review-changed" rendered as "This review moved on. Re-open it to see the current draft." | the `rewrite.preview` lines (`currentLine`, `projectedLine`, `directionLine`, `capacityLine`, `projectionNote`) are the explanation — no extra prose |
| `casting-slate-add-<id>` | "Add to screen test" | "<Role> already has 2 readers." `[NAT]` (remove one to change the slate) | "A screen test is free, holds nobody, and takes one week." (`consequence`, verbatim) |
| `casting-pin-compare` | "Pin to compare" | disabled at 4 pins: "Pinned to compare (4/4) — unpin one to add another." | "Comparing changes nothing. It is a view." |
| `casting-gl-commit` | the quote's own commit label | quote invalidated: "The package changed since this quote. Re-open the greenlight to price it again." | `casting-gl-queue-note` / `-queue-framing` already carry it |
| release commit | `MemoReleaseButtonLabel` | `release.decisions[].refusal` verbatim | "Committing a release starts the run and holds its company." |
| waiting, any surface | `Waiting · <stateLabel>` | — a waiting state offers **no** remedy it does not have | the `nextMilestone` sentence + `stateWeeksRemaining` when published |
| unknown, any surface | "UNKNOWN STAGE" / "unavailable" | — | "This client cannot name this record's stage. That is what it says, not what it hides." |

## 6. Attention and retrievable outcomes (4B)

Raise a persistent mark (amber + word) for: `attention='decision-required'` on a production row; `attention='decisionRequired'` on a casting
project; `board.attentionPennant != null` on Development; `release.decisions[].legalCommit=true`; `board.castingBoundaryLine != null`.
It clears **only** when the corresponding decision leaves the wire — never on mere viewing, never on a timer. After it clears the outcome stays
retrievable in: the `operationsEventsProjection` the N7 amendment publishes (queue admitted, phase entered, scenery arrived, reservation
granted/released, wrapped/premiere/release), `StudioFilmResultSnapshot` (durable, periodised), and `StudioCastingExpiryNoticeSnapshot`
(`eventSeq`, `queueOrdinal`, `reason`, `reviewActionLabel`). **Named data dependencies, not invented here:** casting-review completion and
contract-lifecycle rows have no retrievable source (already named by `N7-N8-LEGALITY-AND-RETRIEVABILITY-INVENTORY.md`). No journal is invented.

## 7. Keyboard, focus and drag

Tab ring, every surface in this family, in DOM order: `<surface>-back` → list pane (arrow keys move the selection inside it, Tab leaves it) →
detail body (`inspector-scroll` / `production-detail` / `casting-scroll`, focusable, PgUp/PgDn/Home/End) → the pinned footer, primary action
first, `<surface>-more-actions` last. Enter/Space activates; a disabled control keeps its tab stop and reads its refusal (never skipped).
Escape ladder, unchanged from §C.8 — first true wins: (1) a rail text field clears its own focus; (2) an expanded group / open More-actions list
/ open compare collapses (`CloseLaneMoreActions`); (3) one level of the overlay/context stack pops (greenlight → casting base → lot); (4) rail
focus releases to the lot; (5) the Studio Menu opens. `◄ Back` pops exactly the same stack as (3).
**Drag: N8 candidates only, nothing more** (C5 as amended) — casting candidate → comparison slot, and the pre-greenlight role-slot / screen-test
slate drafts. `script → stage` is **not** lawful. Every one of these already completes by click and by keyboard today.

## 8. Acceptance checks this sheet implies

* **EditMode, per state**: J1–J10 one contract each per surface — `DecideOperation` returns the exact reason string for each refusal branch;
  `DecideLocate` never substitutes a same-title target; `OffersOpenProduction` false ⇒ no button; slate cap 2/role; pin cap 4;
  `IsGreenlightQuoteDisplayed` false on any single changed draft field; `UnknownStageWord` reachable and rendered.
* **Geometry**: `header + identity + footerCtl + bodyMin ≤ envelope` at both viewports × 100/150/200 %; the context block's ceiling is DERIVED
  (assert it is not a literal 180); **no published action rect outside the final rect**; one scrolling body per surface.
* **Rendered PlayMode** 1280x720 and 1440x900 × 100/150/200 %: available, occupied, waiting, actionable-with-refusal, missing, stale — plus one
  long-title record (title complete in the body at `N = 0`) and one 3+-action record showing the wrapped footer and, at 1280/200 %, More actions.
* **Mid-scroll opaque-backing capture** over a bright lot region; focus-vs-selection distinguishable at 200 % in the capture, not only in code.
* **TS**: command-owner refusal tests (server refuses a stale/duplicate displayed intent) — read-only; no TS behaviour change is proposed except
  the single delta below, which is **for disposition, not adopted**.

## 9. Exact deltas, routing, provenance, evidence limits

**D1 (one exact delta, for disposition).** `StudioDevelopmentProjectSnapshot` publishes no per-record attention; only the Development *board*
does (`StudioDevelopmentAttentionSnapshot` + `attentionPennant`). `StudioCastingProjectSnapshot.attention` already exists with
`['none','ready','waiting','active','decisionRequired','blocked']`. Delta: **add `attention` to `StudioDevelopmentProjectSnapshot` with that same
enumeration**, so per-screenplay 4B attention is authored by the engine instead of re-derived in Unity from `status`. DTO name stated; schema,
adapter, paired seal and bridge-contract check are the writer's, not this sheet's. If it is not adopted, Unity must not invent the mapping —
per-screenplay attention is then simply not published, and the sheet's §6 row for Development stands on `attentionPennant` alone.
**No other field is missing.** Waiting causes, occupancy-until, refusals, costs, periods and result disclosure are all already on the wire
(`operationalState`, `stateWeeksRemaining`, `blockerAnatomy.occupants[].freesInWeeks`, `projectedWeeks`, `refusal`, `releaseWeek`, `weeksAgo`).

**Routing.** §2 → `StudioPeopleWorkspaceLayout` (shared clamp helper) + each workspace root; §2 footer redesign → `StudioProductionWorkspace.cs`
(the `actionContext.style.height = 180` block, ~line 162, and the `production-operation-reason` placement at ~line 390 — move it out of the
nested scroll into the pinned strip); §4 → `StudioRailReturnContracts.LaneInspector*` generalised to a shared footer helper;
§5 copy → per-surface labels + `StudioUiElementRegistry` published text; §6 → N7's projection, no N4 work; §7 → `StudioRailKeyboardFocus`.

**Provenance (read only, no writes).** Unity worktree HEAD `0703ed7a`: `StudioProductionWorkspace{,.Navigation,.Remedies}.cs`,
`StudioProductionWorkspaceContracts.cs`, `StudioProductionEntryCard.cs`, `StudioCastingWorkspace{,.CompareNavigation,.DisplayedGreenlight,
.ReviewAcknowledgement,Context}.cs`, `StudioReleaseResultWorkspace.cs`, `StudioDevelopmentCardHud.cs`, `StudioLaneInspectorHud.cs`,
`StudioRailReturnContracts.cs`. TS `b13179ac`: `bridge/schema/bridge-schema.ts`, `bridge/development.ts`, `bridge/casting.ts`,
`bridge/release.ts`, `ui/src/engine/productionOperationsProjection.ts`.

**Evidence limits — what was rendered and what is paper.** Rendered `[REN]`: exactly one cell, 1440x900 / 100 %, read from the element map
`018-map.json` of run `early-2026-09-15T20-19-22-804Z` (the Production workspace). Every other number in §2 is **arithmetic**, not a measurement:
the 1280 column, all 150 %/200 % rows and every casting/development/release/inspection cell are unmeasured and must be re-measured by the writer
against the styles that actually draw. No capture was taken, no Editor launched, no native input performed, no Unity or TS source changed. The
defects named in §0 (F2's nested-scroll refusal, the fixed 180, the 35 px header control below `--ps-control-min-height`) are readings of
committed source and one element map, not observed failures.
