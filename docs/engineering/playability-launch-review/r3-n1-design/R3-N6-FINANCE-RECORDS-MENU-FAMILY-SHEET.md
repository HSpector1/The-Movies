# R3-N6-DESIGN-07 — finance / industry / records + menu·campaigns·settings·help-shell family sheet (filled)

**Task** R3-N6-DESIGN-07 under the Owner directive of 2026-09-15 and `plans/R3-OVERHAUL-PLAN.md` phase **N6** upstream item "designer sheets for period/estimate/unknown-vs-zero, public-vs-private".
**Mode** DESIGN_PROTOTYPE — documentation only. No source, test, build, capture or native input was produced; the Unity worktree was read only and the Editor was never launched.
**Fills** `R3-N6-FAMILY-SHEET-SKELETON.md` (retained beside this file). **Binding** R3 HYBRID cards, Backlot language, 1A/2B/3A/4B, `R3-N2-TEXT-RULES-ADDENDUM.md` W1–W6 and §3/§4,
`R3-N3-VISUAL-STANDARD-SHEET.md`, `R3-N4-FILM-JOURNEY-FAMILY-SHEET.md` §4 (generalised More-actions), `R3-N5-PEOPLE-BUILD-LAB-FAMILY-SHEET.md` §2 (the family geometry terms, reused verbatim so
the two sheets agree), `plans/N7-N8-LEGALITY-AND-RETRIEVABILITY-INVENTORY.md`. No P13B mechanics. No universal undo, no auto-pause, no guided first-film tutorial.

**Source identity (read, not run).** Unity worktree HEAD **`c25848b9`** on `wip/playability-interaction-01-client` (the brief named `0703ed7a`; that commit is HEAD~1 here — recorded, not resolved).
TS worktree `d28173ed` on `wip/playability-interaction-01-ts`.
**Labels** `[NAT]` hand reading of committed source (paper, never a runtime observation) · `[REN]` read off an existing rendered element map · `[R3]` an already-selected R3 law · `[REC]` this
sheet's recommendation · `[GAP]` named dependency. **Constants** `m` = `StudioTextSizePreference.Multiplier` (1 / 1.5 / 2); `s` = `StudioLegacyUiMetrics.CurrentScale` = **1** at both targets
(both are below the 1720x1045 reference) `[NAT]`; Toolkit panel `scale` ≈ **0.794** at 1440x900 — confirmed three ways here: `.ps-finance-button { min-height: 44 }` renders **35**, Industry's
`minHeight = 42` renders **33**, Industry's authored `bottom = 28` renders **22** `[REN]`.
**Rendered cells actually available** (1440x900 / 100 % unless stated): Finance `early-2026-09-12T16-36-55-588Z/025-map.json` · History `…/031-map.json` and 1280x720
`early-2026-09-13T02-17-16-826Z/021-map.json` · Industry `…/034-map.json` · System Menu 100 % `early-2026-09-15T20-11-58-338Z/103-map.json` (`103-studio-menu-open.png`) and **200 %**
`104-map.json` / `133-map.json` (`104-studio-menu-text-200.png`, `133-fix-160-memo-200.png`). **No cell exists for Finance, Industry or the Consequence card at 150 % or 200 %, or at 1280x720** —
every 200 % figure for those three below is arithmetic on the law, not a measurement. That is this sheet's principal evidence limit (§6).

## 0. Executive summary — disposition per surface

| # | Surface (Unity owner) | Disposition | Why | Cell |
|---|---|---|---|---|
| G1 | `StudioFinanceWorkspace(+Extensions)` | **redesign (header ladder + pinned pulse)** | The disclosure vocabulary is the best in the product and is retained whole (§1). The *form* is not: `Render()` runs `if (textSize == "100%") Root.Insert(1, pulse); else content.Add(pulse)` and `Resize()` sets width `68 % → 96 %` on the same test `[NAT]` — the workspace **changes composition because of a text size**, and Cash / net cashflow / runway (the three facts a player opens Finance for) stop being persistent and scroll away at 150 % and 200 %. That is addendum §4 invariant (4) broken by construction. Header measured **272 px** at 1440/100 % `[REN]`; `×m` it cannot satisfy W5 at 1280x720 / 200 % (§2) — so it clamps down the W5 ladder instead of re-forming. | `025-map` |
| G2 | `StudioFinanceChart` | **retain with evidence** | 80 lines that already obey the hardest rule in this family: `if (!points[i].Value.HasValue) continue` with "missing runs are never bridged", `minimum/maximum` computed only from `known`, `RangeDescription` naming the week span **and** the axis money range, every plotted value repeated in the `finance-history-values` foldout, and Left/Right + `NavigationMoveEvent` week selection `[NAT]`. Addendum §3 "chart/figure" is already satisfied. Two refines only: the focus border is cream `rgb(238,232,218)`, not the blue `StudioUiTokens.Focus` W6 requires, and the 180 px box is authored `·s` (correct — a figure keeps its box) while nothing publishes the **count of unplotted weeks**. | paper |
| G3 | `StudioFinancialConsequenceCard` | **refine (naming only)** | 56 lines, and `.ps-consequence-row { flex-direction: column }` already stacks label over value at **every** size `[NAT]` — the addendum's 200 % form applied uniformly, which is better than a breakpoint. "If you commit" / "When the new facility is operational" already separate now from later, and `exclusions` is the pinned last row. Refine: only 3 of 8 rows carry an element name (`consequence-cash-after`, `consequence-payroll-change`, `consequence-last-row`) — an unnamed cost row cannot be asserted, so every `Pair` takes `consequence-<key>`. | paper |
| G4 | `StudioIndustryWorkspace` | **redesign (header) + retain (disclosure copy)** | The public/private copy is law and is retained verbatim (§1b) — it is the only place in the product that names what is *withheld* on the same card as the fact. But the header is the worst in the family: **203 px** of chrome at 1440/100 % `[REN]` carrying 5 chrome buttons, a title, a subtitle, 3 tabs, up to 9 lane/period chips and a status line, all above a 528 px scroll with a 38 px pager below. Every control is a raw inline `b.style.minHeight = 42` that renders **33 px** and never follows `m` `[NAT/REN]`, and three of them (`industry-text-100/150/200`) are a **third** rendering of one setting (§3). | `034-map` |
| G5 | `StudioHistoryWorkspace(+Context,+Contracts)` | **retain with evidence (contracts) + refine (filters + list floor)** | `StudioHistoryWorkspaceContracts` is the model absence vocabulary for this whole overhaul and changes **nothing**: `NoCurrentLocationReason` vs `NoBodyRightNowReason` (two different absences, told apart in words after an HID run caught them merged), `ResultUnavailableReason` ("a missing result may never fall back to another result"), `TabsFor()` admitting RECORDS **only** when `recordsAvailable`, `ReceiptDetailCap = 25` / `OverviewMilestoneCap = 6` as stated bounds `[NAT]`. `StudioHistoryWorkspaceContext` retaining tab/filter/selection/scroll across Back, Locate and the Film-Result detour is exactly 4B and is retained. Refine: the 4-chip `history-filters` strip (35 px chips, `[REN]`) and the list column's missing floor (§2). | `031-map`, `021-map` |
| G6 | `StudioSystemMenuHud.Campaigns` | **refine (hit heights + destructive focus order)** | The transactional model is the strongest in the client and is retained whole: `expectedStateRevision`/`expectedCatalogueRevision`/`expectedActiveCampaignId` on every request, `SaveOrLoadTerminallyUnavailable` separating a terminal blocker from a once-a-second transport blink, `CampaignPublishedRect` refusing to publish a rect that is clipped by its own scroll, keyboard Tab with reveal-scroll `[NAT]`. Two defects: at 200 % the rows measure **53 px** against the W3 IMGUI floor of `34·m` = **68** `[REN]`, and in the delete/overwrite dialog `campaign-destructive-confirm` is registered **before** `campaign-cancel`, so the destructive control is Tab target 0 `[NAT]` — addendum §3 forbids exactly this. | `103/104-map` |
| G7 | `StudioSystemMenuHud.{CampaignStatus,CampaignStatusBand}` | **retain with evidence** | The band is a genuine achievement: `Heading` = operation · stage, `Message` = subject + stage sentence, six honest stages (`waiting` / `retry-waiting` / `working` / `confirmed` / `not-started` / attention), an `IdentityOnly` constructor for the case where labels are unrecoverable, its own bounded scroll capped at `min(160·s, (panelH − top − retry − 120·s)/2)` so a long diagnostic can never eat the campaign controls, and its own Up/Down/PageUp/PageDown/Home/End handler `[NAT]`. No re-form. | paper |
| G8 | `StudioSystemMenuHud.CampaignLeave` | **retain with evidence** | `CampaignLeavePlan` + `SavedCopyLeaveReview` re-verify **eleven** identity facts (`sessionId`, `stateRevision`, `stateDigest`, `gameWeek`, `activeCampaignId`, `catalogueRevision`, `durable`, `!dirty`, runtime instance, replacement count, and the load target's label/revision/week/date/studio) before a saved copy is allowed to continue into Quit/Load/New `[NAT]`. This is the "same consequential safeguards" standard the directive asks for. Retained verbatim; only the dialog's button geometry follows §2/§5. | paper |
| G9 | `StudioSystemMenuHud.TextSize` | **refine → promote** | Three `studio-menu-text-{100,150,200}` buttons measuring **41.8 px** at 200 % `[REN]` against a 68 floor, drawn above the status band rather than in a settings group; and `StudioTextSizePreference` is `RuntimeInitializeOnLoadMethod`-reset to 100 % on every player session `[NAT]` — the one setting this product has **does not persist**. §3 makes the menu the single owner and names the persistence gap. | `104-map` |
| G10 | **Help shell (3A)** | **new, minimal** | `grep -i help` over the whole `Runtime/Presentation` tree returns two code comments and zero UI `[NAT]`. There is no help surface at all. §3 defines the smallest lawful one: contextual, on demand, no tutorial, no new auto-pause. | none |

**Refused here:** no universal undo; no auto-pause; no guided first-film tutorial; no new SVG; no pane stacking, symmetry-forcing or row compression; no combined "Power" score in Industry;
no hiding of a cost, a refusal, a period label or an active filter behind a disclosure — only **controls** may fold, and only with their active-state sentence pinned.

## 1. The two disclosure questions this family exists to settle

### (a) Period, estimate, unknown and zero are four different things

The wire already tells all four apart; the presentation's only job is to never collapse them. The exact fields `[NAT]`:

| State | Wire fact | Rendered as | Never |
|---|---|---|---|
| **R1 actual** | `FinancePeriod.complete = true`, `coverage = 'complete'`, `openingCash`/`closingCash` non-null | the money, the unit, and `period.label` ("Week 14 · completed") on the same card | never without its period |
| **R2 estimate** | `runwayLabel` + `paceBasis`; `studioRevenueRemaining`; `contributionLabel` = `'Projected Film Contribution'` vs `'Final Film Contribution'`; `phaseWeeksRemaining` | the word **projected / estimate / at current pace** inside the **label**, e.g. "Studio Revenue · remaining projected" | never estimate-ness only in a trailing basis paragraph |
| **R3 unknown** | `null` — `theatricalGross`, `directCommitment`, `contribution`, `openingCash`, `FinanceCostPoint.amount`, `coverage = 'unavailable'` | `Available()` → **"Not recorded / unavailable"**; portfolio `Revenue()` → "Not recorded" (completed/in-theaters) or **"Not released"** (earlier phase); chart: the point is skipped and the run is not bridged | **never `$0.00`, never blank, never an icon** |
| **R4 genuine zero** | a real `0` — `financeReport.ts:235` `?? (period?.complete ? 0 : null)` is the exact fork: a *complete* period with no entry of that kind is **0**, an incomplete one is **null** | `Money(0)` → **"$0.00"**, and on a period card the zero carries its period word | never merged with R3 |

`[REC]` **The presentation law.** (1) R3 and R4 must differ in **words**, not weight — they already do; keep `Available()` and never widen `Money()` to accept `null`. (2) Every money row
carries its unit in the label (`/ week`) and its period on the card, never in a tooltip. (3) One shared coverage mark: a period card whose `coverage != 'complete'` shows
`period.notice` as a pinned `ps-finance-notice` **above** its rows, not below them — today `RenderPeriod` prints the notice before the rows `[NAT]`: retain. (4) The Trends text equivalent
prints `"Week N · " + point.coverage` as a heading `[NAT]` — retain; it is the only place a player can read coverage per week. (5) `[REC]` add one derived line under each chart:
`"<k> of <n> weeks in this window have no recorded value and are not plotted."` — the chart already knows `known.Length`; today a gap is silent unless the player opens the foldout.
(6) **Fold/retention window, said once and exactly:** `state.studioEvents` Tier W is `TUNING.STUDIO_EVENT_WINDOW_WEEKS = 26` weeks and Tier D is permanent `[NAT]`;
`bridge/history.ts` publishes `standing.routineWindowWeeks` and folds routine settling into one row whose `reasonLines` read `"<count> weekly settling receipts folded into one exact summary."`
`[NAT]`. Both numbers are rendered as a sentence on the surface that folds, never assumed: History says how many weeks it keeps in full; Finance Trends says `history.calendarNotice`
("History uses recorded weeks. Calendar years and eras are not available…") `[NAT]` — retain verbatim.

### (b) Public vs private — the Industry law

Industry's shipped copy already draws the line, and it is retained **verbatim** `[NAT]`: `'Public facts only. … there is no combined Power score.'`; a live rival run says
`'…future receipts, costs and studio revenue remain private.'`; employment says `'Recorded employment transition. Contract terms remain private.'`; an announced production says
`'Announced at actual greenlight. Scheduling and unrevealed development remain private.'`; an empty studio slate says `'No announced production is currently active. Private development is
not disclosed.'`; tendencies say `'…this is observation, not a strategy forecast.'`

`[REC]` **The four-part card.** Every Industry record renders, in this order: **the fact** → **its provenance** (`provenance === 'authored-start/v1'` → "Authored starting history", else
"Recorded campaign release") → **its period or comparison date** (`snapshotLabel` = "Comparison: <date> · <n> studios"; `fromLabel – throughLabel · <n> films`) → **what is withheld**, in words,
on the same card. Withholding is never expressed as an empty cell, a dash or a zero. The player's own studio is the **only** route out of Industry into private data, it is marked twice
(`player` brass left border + "· Your studio"), and the route says where it goes: "Open your film result for private finances." `[NAT]` A rival's private figure is never displayed,
never estimated and never rendered as `0`. `[REC]` one addition: the three per-lane `meaning` strings are suppressed on the `studios` list view (`if (context.view != "studios")`) `[NAT]` —
so the lane the player is ranked by is the one lane whose meaning is hidden. Publish `meaning` on the selected lane in the pinned status line at every view.

## 1c. The fourteen states, their exact wire fields, and their cell

| # | State | Exact wire fact `[NAT]` | Rendered cell | Reflow at 200 % |
|---|---|---|---|---|
| R1 | figure known, actual | `FinancePeriod.complete`, `openingCash`/`closingCash`, `netCash`, `label` | `025-map` `finance-opening/-movement/-closing` | `.ps-finance--large .ps-finance-row` stacks label over value — already shipped |
| R2 | figure is an estimate | `runwayLabel` + `paceBasis`; `contributionLabel`; `studioRevenueRemaining`; `FinancePortfolioRow.phaseWeeksRemaining` | `025-map` `finance-runway` | word stays in the label; the basis sentence wraps, never truncates |
| R3 | figure unknown | any `null` above; `coverage === 'unavailable'` | **no cell yet** | sentence wraps; never becomes an icon |
| R4 | figure genuinely zero | `financeReport.ts:235` `?? (complete ? 0 : null)` | `025-map` `finance-category-*` | zero keeps its period word on the same card |
| R5 | empty period / no records | `lastPeriod === null`; `portfolio.rows.length === 0` → `finance-portfolio-empty`; `history-empty` | `014-map` `history-empty` (rects zero) | one sentence + the lawful next control |
| R6 | long ledger | `capitalContributors.rows` + `remainingEntries`/`remainingAmount`; `FINANCE_UPCOMING_LIMIT = 64`; `window.remainingRows`; `PortfolioPageSize = 20`; `ReceiptDetailCap = 25` | `025-map` (capital rows) | table row → stacked record (addendum §3); the remainder row is a **fact** and never folds |
| R7 | chart present | `FinanceCostPoint.amount` + `coverage`; `chart.RangeDescription` | **no cell yet** | figure keeps its 180·s box; `finance-history-values` carries every number |
| R8 | consequence card open | `StudioFinancialConsequence.{cashBefore, immediateCashChange, cashAfter, weeklyPayrollChange, runwayAfter, laterOperatingCost, guaranteesAfter, exclusions}` | **no cell yet** | already column-stacked at every size; `consequence-last-row` stays last |
| R9 | industry public fact | `provenance`, `snapshotLabel`, `fromLabel`/`throughLabel`/`sampleCount`/`basis`, `businessNotice` | `034-map` `industry-status`, `industry-studio-*` | four-part card (§1b) stacks; `industry-status` enters the body at ladder rung 0 |
| R10 | menu open | `Layer`, `GUI.depth = -1000`, `CurrentButtonGuiRect.Contains` | `103/104-map` | panel is `·s` only — it does **not** grow; body scrolls (§2) |
| R11 | campaign list / Save-As | `CampaignLibrary.{campaigns[].id,label,dateLabel,revision,gameWeek}, activeCampaignId, dirty, durable, sessionId, stateRevision, catalogueRevision` | `103/104-map` `campaign-list-scroll` | rows measure by `CampaignTextHeight`; a clipped row is **not published** |
| R12 | leave-campaign confirm | `unsavedDisposition` ∈ requireClean/save/discard; `HasUncommittedDraft`; `SavedCopyLeaveReview.Matches` | **no cell yet** | own rows; destructive separated by a full gap and **never** Tab target 0 (§5) |
| R13 | text-size dialog | `StudioTextSizePreference.{Percent,Revision,Multiplier}` | `104-map` `studio-menu-text-*` | applies live (`MaintainTextSize`); survives the panel; **does not survive the session** `[GAP]` |
| R14 | campaign status band | `CampaignOperationView.{Heading,Message,Stage,Detail}`; `client.CampaignUnresolved` | **no cell yet** | own capped scroll; wraps; never clipped; releases focus when it stops overflowing |

## 2. Geometry — W1–W6 per cell

Terms reused from N5 §2 unchanged: `envelope = viewportH − T − bottom`; `T` = 94 / 166 / 190; `bottom = 12·s` `[REC]`; `bodyMin = 3 × 18·m + 12·s` = **66 / 93 / 120**; `line = 19·m + 4·s`
= 23 / 33 / 42; `actionRow = 12·s + max(34·m, measured) + 14·s`. **`T` is not uniform today** — measured at 1440x900 / 100 %: Finance **94**, Industry **87**, History **71** `[REN]`
(`ApplySharedTextSize`'s `max(90 | 110, …)` is in *panel* units, so an unoccupied lane band yields 90 pu = 71 px). One `T` per viewport/size, as N5 recommends.

| Surface | header term stack `[REC]` | 1280/100 | 1280/150 | 1280/200 | 1440/100 | 1440/150 | 1440/200 |
|---|---|---:|---:|---:|---:|---:|---:|
| envelope | `viewportH − T − 12` | 614 | 542 | 518 | 794 | 722 | 698 |
| **Finance**, full header | identity 84·m + pulse(row 98 / col 189 / col 252) + tabs 35·m×rows + controls 45·m | body 342 | 57 ✗ | **−128 ✗** | 522 | 237 | **52 ✗** |
| **Finance**, W5 ladder rung 0 | tabs (2 wrapped rows, 146 at 200 %) + controls only; identity + pulse + `attention` become the body's **first, always-first** block | 342 | 268 | **282 ✓** | 522 | 448 | 462 ✓ |
| **Industry**, today `×m` | 203·m + pager 38·m | 373 | 208 | **38 ✗** | 553 | 388 | 218 |
| **Industry**, §4 header | back/refresh 33·m + title 32·m-ladder + tabs 34·m + `industry-filters-more` 34·m; `industry-status` enters the body at rung 0; pager pinned | 370 | 262 | **168 ✓** | 550 | 442 | 348 ✓ |
| **History**, today | chrome 35·m + tabs 38·m×2 + notice 21·m + filters 38·m×2 | 406 | 214 | **102 ✗** | 586 | 394 | 282 |
| **History**, filters folded | filters → pinned active-filter sentence + `history-filters-more` | 406 | 268 | **144 ✓** | 586 | 448 | 324 ✓ |
| **System Menu** (IMGUI, `·s` only) | panel `min(780·s, W−32) × min(840·s, H−36)`; header 109 (100 %) / 126.4 (200 %) `[REN]`; footer 16·s | body 559 | — | **541.6** | 715 `[REN]` | — | 697.6 `[REN]` |

**The IMGUI menu's one real number.** Measured content bottom at 1440x900: **≈ 635 px** at 100 % (no scrollbar published `[REN]`) and **≈ 692–728 px** at 200 % (`campaign-body-scrollbar` **is**
published `[REN]`). The panel height is `min(840·s, H−36)`, so at **1280x720** it is **684** and the body viewport is **541.6** at 200 % — roughly **27 %** of the campaign menu, i.e.
`campaign-rename`, `campaign-delete` and the status message, sits below the fold and is reachable only by scrolling or by Tab's reveal-scroll. It is lawful (nothing clips, `CampaignPublishedRect`
refuses to publish a clipped rect, Tab reveals) but it is the family's tightest cell and the one the rendered pass must photograph first.

**W1** `ScaleText` unchanged; pass N5's single named `minimumRenderedPixels`. **W2** paddings/gaps/keylines `·s`; fonts, control min-heights, hit targets `·m` — the IMGUI menu inverts this:
`StudioLegacyUiMetrics.ScaledFont` **does** multiply by `m`, but every `Rect` uses `44f*s` / `40f*s` / `840f*s` and ignores `m` `[NAT]`, which is why 200 % grew the rows only 44 → **53** (font
`CalcHeight`, not a floor) `[REN]`. **W3 — the family-wide failure.** Every measured control here is under its floor: Finance tabs and the period dropdown **35**, Finance chrome **64** (passes),
Industry chrome **33**, History tabs/filters/BACK **35**, campaign rows **44 → 53** vs `34·m` = 34/51/**68**, text-size buttons 40 → **41.8**, and the persistent `MENU` chip a fixed **96x40** at
every size `[REN]`. They grow, never shrink: Toolkit gets `.ps-shared-text-150 { --ps-control-min-height: 66px }` / `-200 { 88px }` (the addendum's own `[REC]`, and `StudioFinanceWorkspace.uss`
already owns the only rule that uses those classes today); IMGUI gets `row = max(34·m·s, style.CalcHeight(...))` in place of `max(44f*s, …)`, and `StudioSystemMenuContracts.ButtonHeight` becomes
`40f * uiScale * m`. **W4** one scrolling body per surface: `finance-scroll`, `industry-scroll`, `history-list` + `history-detail` (two panes, one owner each — lawful, they are siblings, not
nested), `campaign-body-scroll`. Two nested scrolls are lawful and retained because each is a bounded explanation that must not push a decision away: `campaign-status-scroll` (capped, §G7) and
`campaign-list-scroll` (the record list inside the menu body). `finance-history-values` is a `Foldout`, not a scroll — retain. **W5** every rect derives from the final rect; the campaign menu
already refuses to publish a clipped one `[NAT]` — generalise that refusal to the Toolkit surfaces. **W6** full-alpha plate over viewport **and** scrollbar gutter; focus = blue
`StudioUiTokens.Focus` at `3·s` (the chart's cream `:focus` border and the IMGUI 2 px ring both move to it), selection brass, attention amber **plus a word**.

## 3. Settings and the help shell

**The complete settings inventory is one setting: text size.** It exists in **three** renderings `[NAT]` — `finance-text-size` (a labelled `DropdownField`), `industry-text-{100,150,200}`
(three raw buttons in the workspace header), and `studio-menu-text-{100,150,200}` (three IMGUI buttons). `[REC]` **the System Menu is the single owner**; Finance and Industry drop theirs and
gain nothing (the preference is global and applies live via `MaintainTextSize` / `Maintain`). `[GAP]` **`StudioTextSizePreference` does not persist**: `[RuntimeInitializeOnLoadMethod]
StartPlayerSession()` resets `Percent = 100` every launch, and the class comment says "Campaign authority never owns it" `[NAT]`. A player who needs 200 % must set it again every session.
Persisting it is a **client-preference** store, not campaign state, and is a named dependency for the builder — not invented here.

**The help shell (3A).** No help surface exists anywhere in `Runtime/Presentation` `[NAT]`. `[REC]` the smallest lawful one, and nothing more:
one persistent `?`-labelled control in each workspace's chrome, named `<surface>-help`, `34·m` square, tab-order **last** in the chrome group; it toggles a block that opens **inside the existing
body scroll** at the top (never a modal, never a layer, never an overlay that owns input); it contains 2–5 sentences already written in §4, each naming one term this screen uses; Escape or a
second press closes it; its open/closed state is per-surface and lives beside scroll offset in the retained context (`StudioHistoryWorkspaceContext`, `StudioFinanceWorkspace.offsets`). It never
appears unprompted, never advances, never pauses, never gates a control, and never explains an action the player has not reached. **No tutorial. No first-film walkthrough. No new auto-pause.**

## 4. Copy — action, refusal, help and money (Backlot)

| Where | Copy `[REC]` unless marked | Note |
|---|---|---|
| Finance help | "This is your studio's recorded cash. **Cash** is what you hold now. **Net cashflow** is what the next advance is already committed to move. **Runway** is an estimate at the current pace — it is not a forecast, and it assumes no new decisions." | last sentence adapted from the shipped `paceBasis` `[NAT]` |
| Finance, unknown | "Not recorded / unavailable" | shipped `Available()` — **retain verbatim** |
| Finance, unreleased | "Not released" / "Not recorded" | shipped `Revenue()` — retain |
| Finance, empty period | "No completed week yet. Current week so far shows actions already recorded." | shipped — retain |
| Finance, attention | "<the sentence>  ·  **Review Payroll →**" | today `attention` is a bare `string[]` with **no route** (§6 delta) |
| Finance, chart gap | "<k> of <n> weeks in this window have no recorded value and are not plotted." | new, derived |
| Industry help | "Industry shows only what is public. Rival studios' money, schedules and unannounced pictures are not disclosed — not hidden by a die roll, simply not public. Rankings are separate lanes; there is no combined score." | grounded in the shipped `notice` |
| Industry, withheld | "Contract terms remain private." / "…remain private." / "Private development is not disclosed." | shipped — retain verbatim |
| History help | "Studio History keeps every landmark permanently. Routine weekly settling is kept in full for <routineWindowWeeks> weeks, then folded into one exact summary that still names how many receipts it stands for." | numbers read from the wire, never written |
| History, absence | "No current location." / "No body to locate right now." / "Result record not available." | shipped contracts — **retain verbatim, three different absences** |
| Menu help | "Save keeps this campaign under its name. **Save As** makes a named copy and opens the copy. Leaving without saving is always reviewed first, and the review names exactly what is not included." | grounded in the shipped leave copy |
| Menu, refusal | "The studio connection failed and cannot recover this session — restart the studio to reconnect." / "A command is still being confirmed — try again in a moment." | shipped `SaveOrLoadDisabledReason` — retain; it is the model refusal (**why + route**) |
| Menu, delete | "Only this selected named record will be deleted. If it is active, the current world remains open as an unnamed draft." | shipped — retain |
| Menu, overwrite-active | "Save As cannot overwrite your active campaign. Cancel, then use Save active campaign to update it, or choose a different name for a copy." | shipped — the exact why+route form; retain |
| Money everywhere | `$#,##0.00` / `+$…;−$…` with `/ week` in the **label**, and the period on the card | shipped `Money()` — retain; never accept `null` |

## 5. Keyboard, focus and dialog behaviour

**Shipped and retained** `[NAT]`: Finance focuses `finance-back` on open, re-focuses a dropdown after its own value change, and `NavigateTrendRows` walks the six named Trends stops
(`finance-history-point → finance-cash-chart → finance-movement-chart → finance-cost-kind → finance-cost-chart → finance-history-values`) calling `content.ScrollTo(target)` **before** `Focus()`
because "UI Toolkit's spatial graph skips fully clipped siblings"; the chart takes Left/Right and `NavigationMoveEvent` for week selection. History owns `OnTabStripKeyDown` and `OnListKeyDown`
and cancels scroll restoration on any key that is not Escape/Return. Industry restores focus by `context.focusName`, falling back to `industry-back`. The IMGUI menu cycles
`campaignFocusTargets` on Tab/Shift-Tab with a reveal-scroll through **both** the body and the list viewport, activates on Enter/Space except inside `campaign-name-input`, draws its own 2 px
focus ring, and peels **one layer per Escape**: dialog → menu → closed (`CancelCampaignNavigation` first, then `SetLayer`). The status band owns Up/Down/PageUp/PageDown/Space/Home/End **only
while it overflows**, and releases focus when it stops overflowing. All of that is retained.

**Three changes** `[REC]`: (1) **destructive is never the focus default** — in `DrawCampaignDialog`'s delete/overwrite branch `campaign-destructive-confirm` is registered before
`campaign-cancel`, so it is Tab target 0; swap the registration order and separate the destructive control by a full `row` gap, matching `DrawConfirmPanel`, which already draws Cancel first
`[NAT]`. (2) Industry gains no new keys but its lane/period chips become a labelled group so Tab does not walk nine unlabelled buttons. (3) `<surface>-help` is tab-order last in chrome, and
opening it does not move focus into the block (focus stays on the control, the block is read by scrolling) — so a keyboard player never has to escape out of help.

**The 3+-action record, generalised (N4 §4).** Records in this family that genuinely carry ≥ 3 actions `[NAT]`: **Industry person view** — `industry-person-<id>` + `industry-employer-<id>` +
`industry-full-profile-<id>` + `industry-employment-history-<id>` = **4**; **Industry studio block** off the list view — name + `industry-history-<id>` + `industry-roster-<id>` = **3**;
**Industry activity block** — `industry-event-studio-<id>` + `industry-event-film-<id>`/`-project-<id>` + `industry-event-person-<id>` = **3**; **Finance portfolio detail (released)** —
`finance-film-result-<id>` + `finance-film-route-filmHistory-<id>` + `finance-portfolio-film-<id>` = **3** (`finance-portfolio.ts` gives a released row two routes, an unreleased one, and a
development project up to two); **Finance Films controls** — `finance-portfolio-filter` + `finance-portfolio-sort` + `finance-film-choice` (+ pager) = **3–5**; **History detail pane** —
event: `history-event-open-film-<rowId>` + `history-locate-<rowId>` + `history-back` = **3**; person: `history-open-profile-<talentId>` + `history-locate-<talentId>` +
`history-back` = **3**, each Locate carrying its own `history-locate-reason` line when disabled. Each takes the N4 rule unchanged: wrap to a second row; only where the wrapped row would push the body under
`bodyMin` does the primary stay and the rest move behind `<surface>-more-actions` ("More actions ▸") into that body's own scroll. **Deliberately exempt, with a reason:** the campaign menu's
twelve controls. A menu *is* a list of routes, not a record footer; folding Load or Delete behind "More actions" would hide the very routes the menu exists to expose. It scrolls instead —
which is what it already does (§2). **Deliberately not a case:** Finance chrome (`finance-text-size` + `finance-back` = 2) and the consequence card (0 actions; it is evidence, not a decision).

## 6. Routing, provenance, deltas, acceptance checks, evidence limits

**Number → owner.** Cash / net / runway / periods / categories / coverage → `src/core/financeReport.ts` (`financeOverview`, `recordedFinancePeriod`, `financeRecordingBoundary`,
`financeHistory`). Employees / facilities / films / attention → `bridge/finance.ts`. Dated commitments → `bridge/finance-upcoming.ts` (`FINANCE_UPCOMING_LIMIT = 64`). Portfolio rows and their
routes → `bridge/finance-portfolio.ts`. Destinations → `bridge/finance-route.ts` (`FinanceRoute.kind` ∈ profile · facilityHistory · casting · production · releaseResult · filmHistory ·
development — presentation destinations that "never authorize or execute an action"). Public records → `bridge/industry.ts`. Timeline / standing / receipts / fold window →
`bridge/history.ts` + `src/core/studioEvents.ts` (`TUNING.STUDIO_EVENT_WINDOW_WEEKS = 26`). Campaign identity → `StudioCampaignRequest` / `StudioCampaignLibraryResponse` /
`StudioCampaignAcceptedResponse`. **The Unity side invents no figure in any of these.**

**Exact deltas for disposition** — named, *not* adopted here:
1. **`attention` carries no route.** `bridge/finance.ts` publishes `attention: string[]`, rendered as a bare `ps-finance-notice` Label with no control `[NAT]`. The brief's law ("attention lines
   each linked to a durable row") cannot be satisfied from the current wire. **One exact delta:** `attention: { id: string; message: string; route: FinanceRoute | null }[]` on the finance
   projection — the three existing producers already know their targets (`inRed` → the current period card, `renewalOpen` → the Payroll tab, `coverageNotice` → the recording-boundary line).
   Unity then renders `finance-attention-<id>` with an adjacent `RouteButton`, reusing the shipped `RouteButton` helper unchanged. **This is the one delta this sheet recommends adopting.**
2. **`operationsEventsProjection` does not exist.** The N7/N8 inventory names it as the retrievable-outcome route; `grep` confirms **no such symbol in the TS tree** `[NAT]`. `state.studioEvents`
   (Tier D permanent + Tier W 26 weeks) is stored and never published; `bridge/history.ts` reads the other log (`state.studioHistory`). Recorded here as the standing N7 dependency, unchanged.
3. **Text-size persistence** (§3) — a client-preference store, not campaign state. `[GAP]`, not designed here.

**Acceptance checks this sheet implies** (test-author owned; none run here). *EditMode, disclosure/period:* (a) a `null` money field never renders a `0`-bearing string — assert
`Available(null)` and `Revenue(null, phase)` over every Finance row name; (b) a complete period with no entry of a kind renders `$0.00` while an incomplete one renders "Not recorded" — pin the
`financeReport.ts:235` fork from both sides; (c) `StudioFinanceChart` with an interior `null` produces no bridging segment and a `RangeDescription` naming the real span; (d) every estimate row's
**label** contains projected/estimate/at-current-pace; (e) `TabsFor()` yields RECORDS only when `recordsAvailable`; (f) the three History absence strings stay three distinct constants; (g)
Industry: no rival row publishes a private field, and the pinned notice names what is withheld on every view. *IMGUI/W3:* every campaign control's published height ≥ `34·m·s` at 100/150/200 %;
`campaign-cancel` is Tab target 0 in the delete and overwrite dialogs. *Rendered, six cells:* Finance Overview, Finance Trends (chart + foldout), Industry studio view, History timeline, the
campaign menu, and the delete dialog — each at 1280x720 and 1440x900 × 100/150/200 %, with the 1280x720 / 200 % campaign-menu fold photographed explicitly. *Continuation regressions that must
stay green, unchanged:* `StudioCampaignLeaveContinuationTests` (19), `StudioCampaignOperationStatusTests` (23), `StudioSystemMenuTests` (894 lines, incl.
`QuitClicked_ShowsDiscardWordingOnlyWhenAnUncommittedDraftExists`, `LoadClicked_WithDraft_ConfirmsThenDiscardsAndClosesTheWorkspaceOnAccept`,
`WorkspaceCloseRequest_RoutesThroughTheMenusOwnConfirmationWithDiscardAndCloseWording`, `QuitConfirmation_WithdrawsHiddenCampaignTargetsImmediately`),
`StudioP08AHistoryWorkspaceTests` (21), `StudioP08AHistoryHostTests`, PlayMode `StudioFinanceGamepadNavigationTests` and `StudioProductionAndCampaignLayoutTests`.

**Evidence limits, stated plainly.** Only four rendered cells ground this sheet: Finance / History / Industry at **1440x900 / 100 %** and the System Menu at **1440x900 / 100 % and 200 %**, plus
History at 1280x720 / 100 %. `early-2026-09-13T10-31-28-752Z/014-map.json` is a 1280x720 / 200 % History map whose rects are **all zero** (layout unresolved at capture) and is therefore not used.
**Every 150 % and 200 % figure for Finance, Industry, History and the Consequence card in §2 is arithmetic on the recommended law, not a measurement**, and the four `✗` cells are predictions the
rendered pass must confirm or refute before any of them is treated as a defect. The Unity worktree HEAD read here (`c25848b9`) is one commit ahead of the identity named in the brief. Nothing in
this sheet was executed, rendered or natively played; it is paper.
