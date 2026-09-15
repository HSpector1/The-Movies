# R3-N1-DESIGN-01 — compact inspector + journey-memo responsive state sheet

**Task** R3-N1-DESIGN-01 under Current Ops order OPS-R3-N1-CONTINUE-20260914-02 §2.
**Mode** DESIGN_PROTOTYPE (documentation + hand-authored SVG only). No source, test, build, native
input or game screenshot was produced. **This is a design specification, not a native measurement.**

**Scope** the one missing responsive state sheet that reconciles the SELECTED R3 hybrid composition
(employees rail left · hybrid picture cards right · useful lot centre · compact inspector) with the
REAL native journey memo ("Studio next steps", drawn by `StudioBridgeClient`) and the BUILD/global
controls, at **1280x720** and **1440x900** and **100 / 150 / 200 %** text.

**Not reopened** hybrid-vs-classic; people-left / pictures-right; "the studio lot is the primary game
surface"; 1A desktop-first; 3A contextual help only; 4B selective attention; fixed rail widths.
**Not introduced** guided tutorial, automatic popups, hidden mandatory commands, new simulation
behaviour, a raised minimum viewport, universal undo, portrait/font/icon work, or any other screen
family.

> **REV02 — read with `R3-N1-SHEET-REVISION-02.md`.** The connected native review of 2026-09-15
> (F13/F14/F15) contradicted four rows of this sheet. Under order OPS-R3-N1-NATIVE-CORRECTION-20260915-01
> §2/§3, task R3-N1-DESIGN-02 supplies the necessary responsive revision: the overlay header/footer
> clamp (R1), the 1280x720/200 % cell (R2 — it fits; the full-screen fallback is **withdrawn**), rail
> header rows and the list floor (R3), the stacked picture card and the action row (R4), and the opaque
> body plate (R5). Every row below marked **REV02** is superseded by that file; everything else stands.

Every number below is tagged **[R3]** (measured from the verified R3 archive), **[NAT]** (read from
Unity source at `7471d24` and evaluated by hand from the named function — a *paper* evaluation of
committed code, never a runtime observation) or **[REC]** (this designer's recommendation). Section H
lists the exact files and hashes. Where a native number is not present in the files I was given, the
sheet says **not established** rather than guessing.

---

## 0. Executive summary — what changes and why

### 0.1 The problem, restated from source (not from the old paper note)

At `7471d24` the journey memo is a **full-height left panel** that is **visible by default**
(`StudioBridgeClient.OnGUI` → `WorkflowPanelRect()` → `StudioRailReturnContracts.MemoEnvelope`). With
both rails shown the envelope slides to the right of the employees rail and keeps its full `400·s`
width. Evaluating the committed functions by hand: **[NAT]**

| Viewport | employees rail plate xMax | memo envelope | pictures rail plate xMin | `LotCentreWidth()` |
|---|---:|---:|---:|---:|
| 1280x720 | 254 | **x 266..666**, y 18..702 | 994 | **316** |
| 1440x900 | 276 | **x 288..688**, y 18..864 | 1136 | **436** |

Those reproduce the coordinator's paper figures exactly, so the risk is real and arithmetically
settled. Three further facts make "the memo simply shifts sideways" unacceptable as the finished
composition, and they are the reason this sheet does **not** propose a second full-height column:

1. **The memo now collides with the living-time chip.** `StudioLivingTimeHud.ChipMinimumLeft = 430`
   carries the comment *"Clears the 18px inset + 400px workflow envelope + 12px gap."* That assumption
   became stale when the memo slid right. Chip rect is x 430..1050, y 18..(82 / 154 / 178); the memo
   envelope now begins at x 266 (1280) / 288 (1440) and y 18. **Overlap: 236 px (1280) / 258 px (1440)
   of horizontal span in the top band.** **[NAT]** — a source-derived collision; the writer must
   confirm it natively, but no arrangement of a full-height left memo removes it.
2. **The memo does not widen with text size.** `MemoEnvelope` multiplies by `scale`
   (`StudioLegacyUiMetrics.CurrentScale`), which is **exactly 1** at both target viewports, while the
   memo's fonts multiply by `StudioTextSizePreference.Multiplier` (`ScaledFont`). At 200 % the memo's
   title renders at 40 px inside a 372 px content column — roughly nine characters per line. The
   panel is *least* readable exactly when the player asked for larger text. **[NAT]**
3. **The BUILD chip is crowded by the memo.** `StudioBuildCommandHud.CurrentChipRect` anchors to
   `max(memoRight, leftRailRight) + 12`. At 1280x720 / 200 % the chip's own comment already records
   the outcome: width is clamped from 352 to **304** to stay clear of the pictures rail. **[NAT]**

### 0.2 The recommended composition

Replace the permanent full-height memo column with **three surfaces inside one "lot centre lane"**:

* a permanent, tiny **Next-step chip** in the lane's top tools row (`memo-details-open`) — the route
  to everything the memo carries, in the same place in **every** state;
* a **compact next-action band** across the top of the lane (headline · one reason/cost/consequence
  line · the one lawful primary intent · the details control) that yields when the lane is short;
* one **lane overlay** at a time — the **compact inspector** or the explicitly opened **Studio next
  steps sheet** — bottom-anchored, 680 px wide, with **both rails alive underneath**.

The lot keeps the whole lane by default. Paper outcome, worst case (band at its cap): **[REC]**

| Viewport / text | lot centre width today | lot centre width proposed | clear centre rect today | clear centre rect proposed |
|---|---:|---:|---:|---:|
| 1280x720 / 100 % | 316 | **716** | 316 x 558 | **716 x 458** |
| 1280x720 / 150 % | 316 | **716** | 316 x 464 | **716 x 314** |
| 1280x720 / 200 % | 316 | **716** | 316 x 418 | **716 x 200** |
| 1440x900 / 100 % | 436 | **836** | 436 x 738 | **836 x 638** |
| 1440x900 / 150 % | 436 | **836** | 436 x 644 | **836 x 494** |
| 1440x900 / 200 % | 436 | **836** | 436 x 598 | **836 x 322** |

Width — the axis that actually decides whether a player can pick a worksite on an isometric lot —
improves by **2.27x at 1280** and **1.92x at 1440**, at every text size. Height is traded at the
worst corner (1280 / 200 %) and the sheet declares that trade openly in §D.5.

### 0.3 The two states this sheet cannot make work, stated up front

Per the stop rule, no memo route is dropped anywhere. Two states cost more than nothing:

* **1280x720 at 200 % text, compact inspector.** The lane is 418 px tall there. A compact inspector
  needs a fixed header (176) + fixed footer (108) + a readable body (≥ 200) = 484. **It does not
  fit.** Recommendation: at that **one** state the existing full-screen `StudioWorkspaceHost`
  workspace remains the inspection surface — already shipped, drops no route, adds no popup, raises
  no minimum viewport. The two smallest alternatives are in §C.9.
  **REV02 — withdrawn.** With the R1 header/footer clamp and viewport-scaled chrome padding the same
  cell needs 96 + 94 + 120 = 310 and fits the 310 px envelope; see `R3-N1-SHEET-REVISION-02.md` §R2.
* **Cast choice and the legacy Save/Load fallback.** `PlayerHasCastChoice` renders two or more
  54·s-tall choice buttons, and `systemOwnerPresent == false` renders Save/Load buttons. Neither fits
  a one-row band. They live in the sheet, one explicit control away. **One extra click, zero lost
  routes.** §B.6.

---

## A. State inventory and shared rules

Seven states x two viewports x three text sizes = 42 cells. They collapse to **five layout rules**
and **three text-reflow rules**; the SVGs draw one representative of each layout rule rather than six
duplicates, as the order permits.

### A.1 The states

| # | State | Trigger |
|---|---|---|
| S1 | **Main screen** — nothing selected, no overlay | default |
| S2 | **Person selected** | employees-rail row click / Enter / Space; selection receipt shown |
| S3 | **Picture selected, actionable** | picture-card body click on a card whose state offers a lawful action |
| S4 | **Picture inspected (actionable)** | inspection opened from S3 — compact inspector |
| S5 | **Picture inspected (waiting)** | inspection opened on a `Waiting · <cause>` card — compact inspector, no fabricated remedy |
| S6 | **Person inspected** | inspection opened from S2 — compact inspector |
| S7 | **Memo/details view opened** | explicit activation of `memo-details-open` (chip or band) |

### A.2 The five layout rules

| Rule | States | Lane occupancy | SVG |
|---|---|---|---|
| **L1 — open lane** | S1 | tools row + band; rest of the lane is lot | `01-lane-model-1280-100.svg` |
| **L2 — lane + receipt** | S2, S3 | tools row + band (when it fits, §B.4) + selection receipt bottom-right | `01` (receipt drawn) |
| **L3 — lane overlay** | S4, S5, S6 | tools row + compact inspector bottom-anchored; band yields to the chip | `02-inspector-1440-100.svg` |
| **L4 — lane overlay (sheet)** | S7 | tools row + Studio-next-steps sheet, identical geometry law to L3 | `04-memo-sheet-1440-150.svg` |
| **L5 — short-lane fallback** | any state where §B.4 predicate fails | band collapses to the chip. **REV02:** the §C.9 full-screen inspection branch is withdrawn (REVISION-02 §R2); L5 is now a band rule only | `03-text-200-1280.svg` |

**Pairs that share a rule, explicitly.** S2 ≡ S3 (a selection receipt is a selection receipt; the only
difference is which pinned controls the receipt offers, which is existing `StudioHud` behaviour).
S4 ≡ S5 ≡ S6 (identical geometry; only the body content and the footer's lawful action differ —
S5's footer never grows a fake remedy). S7 shares L3's geometry with a different fixed-header/no-fixed
-footer split (§B.5). 1440x900/100 % and 1440x900/150 % share every layout rule and differ only by
text reflow. 1280x720/100 % and 1440x900/100 % differ **only** in the two lane constants (§A.4).

### A.3 The three text-reflow rules

| Rule | Applies at | Summary (full detail in §E) |
|---|---|---|
| **T1** | 100 % | Band text column and controls side by side; picture toolbar filter beside Find; inspector facts in two columns. |
| **T2** | 150 % | Band text column and controls side by side while the lane is ≥ 640 px wide; toolbar still side by side; inspector facts in ONE column; rail rows grow taller. |
| **T3** | 200 % | Band controls take their own row; **picture toolbar filter stacks full width above Find**; inspector facts one column; inspector footer wraps; band reason column scrolls when capped. |

### A.4 Lane constants — the two numbers every rule reads

All of the following are **[NAT]** at `7471d24`, evaluated by hand. `StudioLegacyUiMetrics.CurrentScale`
is exactly **1** at both target viewports (both are at or below the 1720x1045 reference), so base px
== screen px throughout this sheet. Rail *widths* follow the viewport only (`BandScale`), never the
text preference — the already-shipped "R4 option (a)" law in both rail HUDs. **Do not change that.**

| Constant | 1280x720 | 1440x900 | Source |
|---|---:|---:|---|
| employees rail width | 236 | 258 | `StudioPeopleRailContracts.RailWidthFor` (< 1400 → narrow) |
| pictures rail width | 268 | 286 | `StudioProductionRailContracts.RailWidthFor` |
| rail edge gap / plate pad | 12 / 6 | 12 / 6 | `RailEdgeGap`, `pad = 6f * w` in both HUDs |
| `LeftRailRightEdge` | **254** | **276** | `StudioRailReservations.PublishLeftRail(rect.xMax + pad)` |
| `RightRailLeftEdge` | **994** | **1136** | `PublishRightRail(frame.x - pad)` |
| **lane left `L`** = LeftRailRightEdge + 12 | **266** | **288** | [REC] |
| **lane right `R`** = RightRailLeftEdge − 12 | **982** | **1124** | [REC] |
| **lane width `W`** | **716** | **836** | [REC] |
| **lane bottom `B`** = height − 12 | **708** | **888** | [REC] |
| living-time chip | x 430..1050, y 18..82 / 154 / 178 | x 430..1050, same y | `StudioLivingTimeHud.ChipRect` + `CurrentChipHeight` |
| MENU button | x 1172..1268, y 12..52 | x 1332..1428, y 12..52 | `StudioSystemMenuContracts.MenuButtonRect` (96x40, inset 12) |
| **lane top `T`** = chip.yMax + 12 | **94 / 166 / 190** | **94 / 166 / 190** | [REC]; identical to today's `TopBandReserve = 94` at 100 % |
| tools row | `T` .. `T` + 44·m → 94..138 / 166..232 / 190..278 | same | [REC], height from `StudioBuildCommandHud.ChipHeight = 44` x text multiplier |
| **band / overlay top floor** = toolsRow.yMax + 12 | **150 / 244 / 290** | **150 / 244 / 290** | [REC] |

`m` = `StudioTextSizePreference.Multiplier` (1 / 1.5 / 2). `s` = `CurrentScale` (1 at both targets).

> **Defect found while deriving `T` — hand it to the writer with the rest.** The rails' own top floor
> is `max(94·LayoutScale, menuButton.yMax + 8)` where `LayoutScale = CurrentScale × Multiplier`, i.e.
> 94 / **141** / 188. The living-time chip's bottom is 82 / **154** / 178. **At 150 % the chip's rect
> overlaps the pictures rail plate by 13 px vertically over a 56 px horizontal span at 1280x720**
> (chip x 430..1050 vs rail plate from x 994). **[NAT]** Fix, one line in each rail:
> `TopOffset/TopEdge = max(94·s_text, StudioLivingTimeHud.CurrentChipRect(...).yMax + 12·s, menu.yMax + 8·s)`.
> Adopting the lane's `T` above removes it by construction.

---

## B. The compact contextual next-action area

### B.1 Where it lives

**Two permanent pieces, never a second full-height column.**

**(a) The Next-step chip** — `memo-details-open`. It lives in the lane's **tools row**, right-aligned
at `R`, beside the BUILD chip. Geometry **[REC]**:

```
toolsRow    = Rect(L, T, W, 44·m)
buildChip   = Rect(L, T, min(176·m, W − 12), 44·m)                 // element hud-open-build, unchanged name
nextChip    = Rect(R − nw, T, nw, 44·m),  nw = min(240·m, W − buildChip.width − 12)
```

| Viewport / text | BUILD chip | Next-step chip |
|---|---|---|
| 1280 / 100 % | x 266..442, y 94..138 | x 742..982 |
| 1280 / 150 % | x 266..530, y 166..232 | x 622..982 (360 wide) |
| 1280 / 200 % | x 266..618, y 190..278 | x 630..982 (352 wide) |
| 1440 / 100 % | x 288..464, y 94..138 | x 884..1124 |
| 1440 / 150 % | x 288..552, y 166..232 | x 764..1124 |
| 1440 / 200 % | x 288..640, y 190..278 | x 644..1124 (480 wide) |

The chip is **always present, always in the same place, in all 42 cells.** Its label is
`Studio next steps` with a count (`Studio next steps · 3`) and, when
`journey.blocked != null` or `CurrentRejection != null`, a gold attention pip plus the word
`Attention` — selective persistent attention (4B), **no auto-pause, no popup, no colour-only signal.**

This also repairs a routing inconsistency that exists today: `StudioBuildCommandHud`'s chip anchors to
the memo, so **removing the memo would leave BUILD floating on a stale anchor**. Docking both chips in
the lane's tools row gives BUILD one stable home. **[REC]**

**(b) The next-action band** — `memo-next-band`, directly below the tools row, full lane width:

```
band = Rect(L, toolsRow.yMax + 12, W, H_band)
```

Band content, left to right at 100/150 %, stacked at 200 %:

| Slot | Content | Source string (unchanged) |
|---|---|---|
| pip | attention glyph **+ the word** `Attention` / `Next step` / `Waiting` | derived from `journey.blocked` / `CurrentRejection` / `journey.waiting` |
| eyebrow | `NEXT STEP` · `PICTURE <n>` · `ACTION NEEDS ATTENTION` | `journey.ordinal`, rejection notice |
| headline | one line, wraps to 2 | `journey.headline`, or `rejectedNotice.Happened` |
| reason | one line, wraps to 2 (3 at 100 % where the lane allows) | `journey.whatHappened` → `journey.waiting.reason` → `journey.blocked.reason` → `option.detail` → `rejectedNotice.Next`, first non-empty, in that order |
| primary action | the FIRST lawful rendered intent, as a button | element name **preserved**: `memo-intent-<intentId>` / `memo-research-<intentId>`; release label still from `MemoReleaseButtonLabel(option)` |
| details | `Studio next steps ▸ (+n more)` | `memo-details-open` |

**Nothing about submission changes.** The band submits through exactly the existing paths —
`SubmitPlayerWorkflowIntent` / `SubmitMemoResearchIntent` / `SubmitMemoReleaseIntent` — so pending
suppression, at-most-once, receipt identity and refusal retention are byte-identical. The band never
computes legality; `GUI.enabled` follows the same `ActionsEnabled` / `CanSubmitDisplayedIntent` law.

**Resting state.** When there is no next step the band still renders: eyebrow `STUDIO`, headline
`No decision is waiting.`, reason = the memo's existing lot summary line
(`N buildings · N stages · N sets · N people on the lot`), plus the details control. The route is
never absent, and the band never invents an action.

### B.2 Band height law **[REC]**

```
lineEyebrow = 14·m   lineHeadline = 19·m   lineReason = 17·m
padding     = 26·m   (12 top + 14 bottom, echoing the memo's own panelSurfaceStyle)
controls    = 34·m   (memoWorkflowButtonStyle's own minimum hit height) + 8·m gap when stacked

H_content(Lh, Lr) = padding + lineEyebrow + 4·m + lineHeadline·Lh + 3·m + lineReason·Lr
                    ( + 8·m + controls  when stacked, i.e. at 200 % )
H_band            = clamp( H_content, 83·m, laneBottom_eff − band.y − MinimumLot )
```

`MinimumLot = 200` (base px x viewport scale; **not** text-scaled — the lot must not shrink because
the player enlarged text). `laneBottom_eff` = `receipt.yMin − 12` when a selection receipt is on
screen, else `B`. When `H_content` exceeds the clamp, **the band's text column scrolls** inside the
band (`memo-next-scroll`); the headline never scrolls away, the reason does, and the complete reason
is also in the sheet. **No text is ever shrunk to fit.**

Resulting band heights **[REC]**:

| Viewport / text | typical content | H_band rendered | band rect |
|---|---:|---:|---|
| 1280 / 100 % | 100 | 100 | y 150..250 |
| 1280 / 150 % | 150 | 150 | y 244..394 |
| 1280 / 200 % | 276 | **218 (capped, reason scrolls)** | y 290..508 |
| 1440 / 100 % | 100 | 100 | y 150..250 |
| 1440 / 150 % | 150 | 150 | y 244..394 |
| 1440 / 200 % | 276 | 276 | y 290..566 |

### B.3 How the full memo/details view opens and closes

* **Opens only on an explicit user action**: click / Enter / Space on `memo-details-open` (chip or
  band), or the keyboard key `3` (§F). There is **no automatic popup and no timed reveal.** A new
  blocker or rejection changes the *chip's* pip and the *band's* words; it never opens the sheet.
* **Closes on**: the sheet's own `◄ Back` (`memo-details-close`), `Escape` (after collapsing an
  expanded fact group — §C.7), or activating `memo-details-open` again.
* **On close**: focus returns to the control that opened it (the chip or the band's details control),
  both rail offsets, both filters, Find text, selection and invoking focus restored through the
  existing `StudioRailReturnContracts.RailReturnContext` / `StudioRailReturnContext.cs` machinery.
  The sheet's own body offset is **not** retained across closes — a newly opened sheet starts at the
  top, matching R3's "new inspection starts its own body at the top". **[R3]**
* The sheet is **not** a modal: both rails stay drawn, scrollable and clickable underneath (§C.3).

### B.4 When the band yields — the one predicate **[REC]**

```
bandFits = (laneBottom_eff − band.y) ≥ (83·m + MinimumLot)
band renders  iff  bandFits AND no lane overlay is open
otherwise     the band is absent and the Next-step chip carries the route
```

Evaluated (`receipt.height` = `min(146·m, 0.4 × screenHeight)` from `StudioHud.CalculateSelectionReceiptGuiRect` **[NAT]**):

| State | 1280/100 | 1280/150 | 1280/200 | 1440/100 | 1440/150 | 1440/200 |
|---|---|---|---|---|---|---|
| S1 main | band | band | band (capped) | band | band | band |
| S2/S3 selected (receipt) | band | **chip only** | **chip only** | band | band | **chip only** |
| S4/S5/S6 inspected | chip only | chip only | chip only | chip only | chip only | chip only |
| S7 sheet open | chip only | chip only | chip only | chip only | chip only | chip only |

Rationale for "chip only" under a selection: the selection receipt **is** the contextual card for the
selected record, already carrying its identity, its pinned controls and `hud-open-laboratory`. Two
competing contextual bands is the clutter this pass exists to remove. The chip keeps the studio-level
route in its unchanging position.

### B.5 The Studio-next-steps sheet **[REC]**

Geometry is the **same lane-overlay law** as the compact inspector (§C.1), with one difference: the
sheet has a **fixed header and no fixed footer** (its actions are part of the ordered body, exactly as
the memo renders them today), which is what lets it fit at 1280x720 / 200 % where the inspector cannot.

```
sheet.width  = min(W, 680)                       // 680 at both viewports
sheet.x      = L + (W − sheet.width)/2           // 284 (1280) · 366 (1440)
sheet.bottom = B
sheet.height = min(contentHeight, B − overlayTopFloor − 12 − MinimumLotOverlay)
header       = 68 / 96 / 120     (title "STUDIO NEXT STEPS" + week/connection line + ◄ Back, fixed)
body         = the rest, scrolls          // element memo-scroll  (name preserved)
```

`MinimumLotOverlay = 96` (base px x viewport scale) — the clear lot strip that must remain above any
lane overlay. Worst case, 1280x720 / 200 %: `708 − 290 − 12 − 96 = 310`; header 120 → **body 190 px,
scrolling, 652 px of content width vs today's 372.** The memo route survives at every one of the 42
cells. That is the stop-rule answer: **no route is dropped at 1280x720 at any text size.**

Body order inside the sheet — the memo's own order, unchanged, so nothing is lost or re-ranked:

1. week + connection label; `feedback`; the paused/blocker notice when `!ActionsEnabled`
2. founding guidance block (`START A STUDIO`) when `PlayerHasFoundingWorkflow`
3. the journey block: `PICTURE n`, `pictureTitle`, `headline`, `whatHappened`, `whyItMatters`,
   `detail`, `waiting.reason`, `ATTENTION · blocked.reason`, `CRITICAL RECEPTION · …` + summary
4. the rejection notice: `ACTION NEEDS ATTENTION` / `WHAT HAPPENED` / `CURRENT HOLDER` / `HOW TO CONTINUE`
5. `NEXT STEPS`; the cast-choice group when `PlayerHasCastChoice`; every `memo-intent-*` button with
   its `detail`; every `memo-research-*` button with its detail line; `OTHER STUDIO ACTIONS` group
6. the ceded-time pointer line; the Studio-Menu save/load pointer line, **or** the fail-closed
   `Save Studio` / `Load Studio` buttons when `systemOwnerPresent == false`
7. the lot summary line

### B.6 Route preservation — the explicit statement

**No lawful next-step route, explanation or consequential review is dropped by this design.**

| Existing memo route | Where it lives now | Reachability |
|---|---|---|
| `memo-intent-<id>` (primary) | band's primary action | 0 extra clicks |
| `memo-intent-<id>` (all others) | sheet, `NEXT STEPS` group | 1 explicit control |
| `memo-research-<id>` + its `detail` label | sheet, same order, same enable law | 1 explicit control |
| release commit (`commitPictureToRelease`, `MemoReleaseButtonLabel`, `RecordMemoReleaseButton`) | band when it is the current step; always in the sheet | 0 or 1 |
| `memo-scroll` | the sheet's scrolling body | 1 |
| journey explanation (`whatHappened` / `whyItMatters` / `detail`) | band shows the first non-empty as the reason; all of them in the sheet | 0 / 1 |
| waiting cause (`waiting.reason`) | band reason; sheet; and the inspector's own body for that picture | 0 / 1 |
| blocker (`blocked.reason`) | band pip + reason; sheet | 0 / 1 |
| rejection notice (4 parts) | band shows `Happened` + `Next`; all four in the sheet | 0 / 1 |
| critical reception | sheet | 1 |
| cast choice (≥ 2 buttons) | **sheet only** — band shows the headline and labels its details control `Choose the cast` | **1 extra click** |
| ceded-time pointer, menu save/load pointer | sheet | 1 |
| `Save Studio` / `Load Studio` fail-closed buttons | **sheet only** | **1 extra click**, legacy-scene path only |
| lot summary line | band's resting reason; sheet | 0 / 1 |
| consequential review (Development Commission/Review, casting comparison, release review) | unchanged — they were never memo buttons (`PlayerIsDevelopmentOption`, `PlayerIsCededOption` already exclude them) and stay on the lot at their own buildings | unchanged |

Two states cost one extra explicit click. **Zero routes, explanations or reviews are removed, hidden
behind hover, or made conditional on a tutorial.** Review parity is preserved in the sense the order
requires: the same consequential safeguards, not the same click count.

---

## C. The compact inspector overlay

### C.1 Anchor and width **[REC]**, calibrated to **[R3]**

```
overlayTopFloor = toolsRow.yMax + 12                      // 150 / 244 / 290
inspector.width = min(W, 680)                             // 680 at both viewports
inspector.x     = L + (W − inspector.width)/2             // 284..964 (1280) · 366..1046 (1440)
inspector.bottom= B                                       // 708 (1280) · 888 (1440)
inspector.height= min(contentHeight,
                      B − overlayTopFloor − 12 − MinimumLotOverlay)
```

680 is **[R3]** — `movie-cards.css` `.inspector{width:min(680px, calc(100% − 590px))}`, and the R3
render `03-selected.png` places the panel at x ≈ 366..1046 at 1440x900, which this law reproduces
exactly. At 1280 R3 used `calc(100% − 550px)` = 730 px; the native lane is 716, so 680 is taken there
too for one law (18 px of lot remains each side; declared as marginal in §D.4).

Maximum inspector heights **[REC]**:

| Viewport / text | overlayTopFloor | max height | inspector top at max |
|---|---:|---:|---:|
| 1280 / 100 % | 150 | **450** | 258 |
| 1280 / 150 % | 244 | **356** | 352 |
| 1280 / 200 % | 290 | **310** | 398 — **REV02:** it DOES fit (96 + 94 + 120), REVISION-02 §R2 |
| 1440 / 100 % | 150 | **630** | 258 |
| 1440 / 150 % | 244 | **536** | 352 |
| 1440 / 200 % | 290 | **490** | 398 |

The inspector is **content-sized**; these are ceilings, not slabs. A short person card at 1440/100 %
typically renders ≈ 300 px tall (R3's own `03-selected.png` panel is 396 px at 1440x900 **[R3]**),
leaving far more lot than the ceiling row implies.

### C.2 Header / body / footer geometry **[REC]**, structure from **[R3]**

Three parts, R3's law: `header` and `footer` are `flex: none`; only `.inspector-content` scrolls.

```
header (fixed) = 16·s + max( stageImage , eyebrow + title(wraps, NO clamp) + subline ) + 12·s
footer (fixed) = 12·m + max(34·m, actionRowHeight) + 14·m        // wraps to two rows at 200 %
body           = inspector.height − header − footer              // scrolls; element *-scroll
```

| Element | 100 % | 150 % | 200 % |
|---|---:|---:|---:|
| header height | **104** | **140** | **176** |
| footer height | **60** | **82** | **108** |
| stage image in header | 78 (72 at 1280) | 78 (72) | 68 | *(image slot follows `BandScale`, not text — matches `StageImageFor` / `StageSlotWidth`)* |
| title face | 20 | 30 | 40 | *(`.inspector h2` 20 → `.text-200 .inspector h2` 28 **[R3]**; 40 = 20 x m, native `ScaledFont` law)* |
| facts columns | 2 | **1** | **1** | *(`.text-200 .facts{grid-template-columns:1fr}` **[R3]**)* |
| footer wraps | no | no | **yes** | *(`.inspector>footer{flex-wrap:wrap}` **[R3]**)* |
| body height, worst case | 450−164 = **286** | 356−222 = **134** | 310−284 = **26 → fails** |

Header content, top to bottom-right: stage art (or portrait slot) · eyebrow (`PICTURE · FILM-014` /
`PERSON · P-027`) · **complete title, wrapping to as many lines as it needs, never clamped, never
tooltip-only** · sub-line (`Shooting · Drama` / role) · **`◄ Back` pinned top-right of the header**, so
Back is on screen at every scroll position and every text size. **[R3]** — this is the arrangement in
`03-selected.png` and `07-small-waiting.png`.

> **REV02 — the header geometry above and its 104/140/176 · 60/82/108 table are superseded by
> `R3-N1-SHEET-REVISION-02.md` §R1.** "Never clamped" made the header an unbounded term in a bounded
> rect: natively at 1440x900/200 % it consumed the whole 490 px overlay, published `inspector-open-*`
> off-screen and left a 1 px body (F14). REV02 clamps the header title to N = 3/2/1 lines, scales
> chrome padding by the viewport rather than the text multiplier (header 160/186/148 → 96 at the
> 1280/200 % cell; footer 60/77/94), keeps a `bodyMin` of 66/93/120, and **renders the COMPLETE title
> unclamped as the first block of the scrolling body whenever the header clamps** — so §E rule (2)
> still holds with no tooltip. The body backing itself is REVISION-02 §R5 (F15).

### C.3 Both rails alive underneath — it is not a modal

* Neither rail hides. `StudioRailReservations` keeps publishing both edges; the lane overlay is sized
  *from* those edges and so can never paint across a rail plate.
* Both rails keep wheel/trackpad ownership, keyboard focus, filters, Find, paging and library while
  the overlay is open. Clicking a different row **re-targets the open inspector** to that record
  (the overlay does not close and reopen); the previous record's body offset is discarded and the new
  body starts at the top. **[R3]** control standard.
* Consequence for `StudioWorkspaceHost`: the scrim is **not** used for the compact inspector.
  `WorkspaceOpen` must stay **false** for it, because `StudioProductionRailHud` and `StudioHud` read
  that flag to suppress themselves. A lane overlay is a new, non-scrim presentation state.
* Click-through: the band, the chip, the inspector and the sheet must each answer the existing
  world-pick guard family (`ContainsScreenPoint` on the rails / build chip,
  `StudioBridgeClient.WorkflowPanelContainsScreenPoint` for the memo). Reuse that last name and
  semantics for the band + sheet + inspector so **no new click-through path is created**. Pointer
  space is owned only where content actually renders, exactly as `WorkflowPanelContainsScreenPoint`
  already clamps to `workflowPanelContentHeight`.

### C.4 Occlusion rule — who yields to whom **[REC]**

Yield order, lowest priority first. A higher-priority surface is **never** covered.

| Priority | Surface | May be covered by | Never covered |
|---|---|---|---|
| 1 (yields first) | next-action band | inspector, sheet | — |
| 2 | selection receipt (`StudioHud`) | compact inspector (which subsumes it — §C.5) | — |
| 3 | compact inspector / next-steps sheet | each other (one at a time, §C.6) | — |
| 4 | BUILD chip, Next-step chip (tools row) | nothing | **always visible and clickable** |
| 5 | employees rail, pictures rail plates | nothing | **always visible, scrollable, clickable** |
| 6 | living-time chip band, MENU button | nothing | **always visible and clickable** |

**Nothing essential is hidden.** Explicitly, for the surfaces the order names:

* **Studio Menu** (`studio-menu-open`, and `studio-menu-text-100/150/200` inside it) — top-right,
  x (W−108)..(W−12), y 12..52; outside the lane at every state. Never occluded. **[NAT]**
* **BUILD** (`hud-open-build`) — moves into the lane's tools row; never occluded; **gains** width at
  1280x720/200 % (352 instead of today's clamped 304) because the memo no longer pushes it right. **[NAT]** for the 304, **[REC]** for the move.
* **Laboratory** (`hud-open-laboratory`) — today published *inside* `SelectionReceiptGuiRect`. When
  the compact inspector subsumes the receipt (§C.5) the inspector's footer must **re-publish
  `hud-open-laboratory` at its own rect**, same name, same enablement. It must not silently vanish.
* **Living-time chip band** — `TopBandReserve` region; the lane starts strictly below it (§A.4), which
  also removes today's memo/chip overlap.
* **Selection receipt** (`world-selection-receipt-identity` / `-body`) — §C.5.
* **Memo intents** — §B.6.

### C.5 The receipt and the inspector are one card at two depths **[REC]**

Select → the existing selection receipt (bottom-right, 420 x 146·m, existing dodge law).
Inspect → the compact inspector **takes over the receipt's footprint and grows left and up into the
lane**; the receipt does not draw beneath it. The inspector's header repeats the receipt's identity
and its footer re-publishes the receipt's pinned controls (including Laboratory). Closing the
inspector returns to the receipt with the selection intact.

This avoids two stacked cards for one record, reuses `StudioHud`'s existing direction-aware `Avoid`
law rather than adding a second dodge, and keeps `Escape` meaning exactly one thing per level.

One consequent change in `StudioHud.CalculateSelectionReceiptGuiRect`: the `avoidLeftWorkflowPanel`
branch floors the receipt at `(18 + 400 + 12) = 430`. With the memo gone from the left band that floor
must become **the lane left `L`** (266 / 288), or the receipt is needlessly narrow. **[NAT]** for the
430, **[REC]** for the replacement.

### C.6 One lane overlay at a time, with a context stack **[REC]**

The inspector and the sheet occupy the same lane slot, so only one renders. Opening the sheet from an
open inspector **pushes** a level; `Escape` / `Back` **pops** back to that inspector with its body
offset, its subject and its footer state intact. The stack is at most two deep. Opening an inspector
while the sheet is open replaces the sheet (the sheet is a reading surface, not a task the player is
mid-way through) and the stack records that so Back returns to the sheet.

### C.7 Camera and centre rule **[REC]**

* **No lane surface ever moves the camera.** Opening or closing the band, the chip, the sheet or the
  inspector does **not** pan, zoom or re-frame. The only camera movers stay exactly what they are
  today: the explicit `LOCATE` zone on a picture card
  (`rail-production-locate-*`, `rail-script-locate-*`, `LOCATE CASTING`), the people rail's
  `people-talent-locate`, and direct camera input. Selection alone never pans. **[R3]/[NAT]**
* **The lot behind an overlay stays live.** The camera keeps rendering; no scrim, no dimming, no
  pause. Worksite selection remains possible in the clear regions listed in §D at every state.
* **Clear regions during inspection** (per §D.4): a full-lane strip of at least `MinimumLotOverlay`
  = 96 px above the overlay, plus the two side strips (18 px at 1280, 78 px at 1440). The 96 px strip
  is the region the native proof must demonstrate as clickable; the 18 px strips are **not** claimed
  as usable targets, only as spatial continuity.
* **Minimum clear lot the native proof must demonstrate** (§D.6) — stated as a design requirement, not
  a measurement.

### C.8 Back / Escape semantics **[R3]** control standard + the N1 additions

Ordered; the **first** condition that is true wins.

1. A rail text field owns the keyboard → `Escape` clears that field's focus and returns focus to that
   rail's filter/tab. The overlay does **not** close. *(already implemented at `7471d24`)*
2. An expanded fact group inside the open overlay (`More facts`, an expanded reason, an open filter
   popup) → `Escape` collapses it. Nothing else moves.
3. A lane overlay is open → `Escape` pops **one** level of the §C.6 stack (sheet → inspector → lot).
4. A rail holds keyboard focus → `Escape` releases rail focus back to the lot, and the arrow keys
   return to the camera (§F). *(partially implemented; see §F.4)*
5. Otherwise → `Escape` opens the Studio Menu, unchanged. *(existing; the memo's own line already
   promises "MENU, top right, or press Esc")*

`◄ Back` pops exactly the same context stack as rule 3. On any pop to the lot the following are
restored, from the already-shipped `RailReturnContext`: **both rail scroll offsets** (exact, clamped
only when the list genuinely shrank), **both filters**, **Find text**, **the selected record**, and
**the invoking focus**. A record that is no longer on the list is dropped, never replaced by a
neighbour (`RestoreTarget`). A newly opened inspector or sheet starts its own body at the top.

### C.9 The 1280x720 / 200 % inspector conflict — stated, not papered over

> **REV02 — this whole section's recommendation is WITHDRAWN.** Order
> OPS-R3-N1-NATIVE-CORRECTION-20260915-01 §3 rules that the full-screen fallback is an implementation
> limitation, not an exception to connected compact inspection. `R3-N1-SHEET-REVISION-02.md` §R2
> re-derives the cell under the R1 clamp: envelope 310 = header 96 + footer 94 + body 120, both rails
> visible and usable underneath, tools row not covered. The conflict statement below is retained as
> the record of why the fallback was proposed; **Alt 1 and Alt 2 are not adopted.**

**Conflict.** At 1280x720 with 200 % text the lane is 418 px tall (`708 − 290`). A compact inspector
needs a fixed header (176) + a fixed footer (108) + a body that can show one fact group without
scrolling twice per line (≈ 200) = **484 px**, before any clear-lot reserve. It does not fit, and no
horizontal change helps because the shortfall is vertical.

**Recommendation.** At that **one cell only**, inspection uses the **existing full-screen
`StudioWorkspaceHost` workspace** with its retained-context Back — already shipped, already proven for
context restoration, drops no route, adds no popup, and does not raise the minimum viewport. The
Next-step chip and the memo sheet still work at that cell (§B.5), so the memo's routes are unaffected.

**The two smallest alternatives**, if the Owner prefers not to have a per-cell form change:

* **Alt 1 — inspector covers the tools row at that cell.** `overlayTopFloor` drops to
  `livingTimeChip.yMax + 12` = 190, giving 518 − 12 − 64(reduced clear lot) = **442 px**. Still 42 px
  short of 484, and it costs the permanent visibility of BUILD and the Next-step chip. **Not
  recommended.** Would additionally require a temporary relocation of `hud-open-build`.
* **Alt 2 — cap the inspector's footer to one primary action at 200 %** (footer 108 → 64) and accept a
  160 px body: 310 − 176 − 64 = **70 px body**. Secondary actions would move behind a `More actions ▸`
  control — one extra explicit click on the inspection surface, and a second place where the 1280
  class behaves differently from 1440. **Not recommended** over the full-screen fallback, which costs
  no new control at all.

---

## D. Lot-centre proof table

**These are design expectations computed from the geometry laws in §A–§C. They are not native
measurements and must not be reported as such.** The last column states what the native proof must
demonstrate before this design is accepted.

Common: lane `L..R` = 266..982 (1280) / 288..1124 (1440); `W` = 716 / 836; `B` = 708 / 888.
"Clear centre" = the largest rectangle inside the lane occluded by no non-lot surface.

### D.1 S1 — main screen (no selection, no overlay)

| Viewport | Text | Band | Clear centre (W x H) | Side strips | Today, same state |
|---|---|---|---|---|---|
| 1280x720 | 100 % | 150..250 | **716 x 458** | — | 316 x 558 |
| 1280x720 | 150 % | 244..394 | **716 x 314** | — | 316 x 464 |
| 1280x720 | 200 % | 290..508 (capped) | **716 x 200** | — | 316 x 418 |
| 1440x900 | 100 % | 150..250 | **836 x 638** | — | 436 x 738 |
| 1440x900 | 150 % | 244..394 | **836 x 494** | — | 436 x 644 |
| 1440x900 | 200 % | 290..566 | **836 x 322** | — | 436 x 598 |

### D.2 S2 / S3 — person or picture selected (selection receipt on screen)

Receipt geometry **[NAT]**: width `min(420, …)` = 420, height `min(146·m, 0.4 x screenHeight)`,
right-aligned inside the lane after the existing rail dodge.

| Viewport | Text | Receipt rect | Band | Clear full-lane rect | Extra strip beside receipt |
|---|---|---|---|---|---|
| 1280x720 | 100 % | 562..982, y 562..708 | 150..250 | **716 x 300** (250..550) | 284 x 158 |
| 1280x720 | 150 % | 562..982, y 489..708 | yields | **716 x 245** (244..489) | 284 x 219 |
| 1280x720 | 200 % | 562..982, y 420..708 | yields | **716 x 130** (290..420) | 284 x 288 |
| 1440x900 | 100 % | 704..1124, y 730..888 | 150..250 | **836 x 468** (250..718) | 404 x 170 |
| 1440x900 | 150 % | 704..1124, y 657..888 | 244..394 | **836 x 251** (394..645) | 404 x 231 |
| 1440x900 | 200 % | 704..1124, y 584..888 | yields | **836 x 282** (290..572) | 404 x 304 |

Worst cell, 1280x720/200 %: total clear lot area = `716x130 + 284x288` ≈ **175,000 px²**. Today at the
same cell the lot lane is only 316 wide and the receipt covers all of it below y 420, leaving
`316 x 130` ≈ **41,000 px²**. **≈ 4.2x more clickable lot.**

### D.3 S4 / S5 / S6 — compact inspector open (worst case: inspector at its ceiling)

| Viewport | Text | Inspector rect | Clear strip above | Side strips | Rails |
|---|---|---|---|---|---|
| 1280x720 | 100 % | 284..964, y 258..708 | **716 x 108** | 18 x 450 (x2) | both alive |
| 1280x720 | 150 % | 284..964, y 352..708 | **716 x 108** | 18 x 356 (x2) | both alive |
| 1280x720 | 200 % | **REV02** 284..964, y 398..708 | **716 x 108** | 18 x 310 (x2) | both alive |
| 1440x900 | 100 % | 366..1046, y 258..888 | **836 x 108** | 78 x 630 (x2) | both alive |
| 1440x900 | 150 % | 366..1046, y 352..888 | **836 x 108** | 78 x 536 (x2) | both alive |
| 1440x900 | 200 % | 366..1046, y 398..888 | **836 x 108** | 78 x 490 (x2) | both alive |

Baseline for comparison: **today every one of these cells is a full-screen UI-Toolkit workspace with a
scrim — clear lot 0, both rails hidden.** **[NAT]** (`StudioWorkspaceHost`, `StudioPersonInspectorCard`,
`StudioCastingInspectorCard`).

Typical (content-sized) inspectors are shorter than the ceiling. Using R3's own rendered panel height
of 396 px at 1440x900/100 % **[R3]**, the clear strip at that cell is `836 x 342`, not `836 x 108`.

### D.4 S7 — Studio-next-steps sheet open

Identical geometry to D.3, with the sheet in place of the inspector, **including at 1280x720/200 %**
(sheet 284..964, y 398..708; header 120, body 190 scrolling; clear strip 716 x 108; side strips
18 x 310). The memo route therefore survives every cell.

### D.5 The honest trades

1. **1280x720 / 200 %, S1** gives 716 x 200 where today gives 316 x 418 — **+127 % width, −52 %
   height, −9 % area.** The design deliberately buys width, because worksite selection on an
   isometric lot fails on width first. If the Owner disagrees, the single lever is `MinimumLot`
   (raise it and the band caps harder, scrolling its reason sooner).
2. **S4–S6 side strips at 1280** are 18 px. They are spatial continuity, not click targets. The 96 px
   full-lane strip above the overlay is the region that must be clickable.
3. **The band disappears in three of the twelve selected-state cells** (§B.4). The chip never does.
4. ~~**1280x720 / 200 % inspection keeps the full-screen workspace** (§C.9).~~ **REV02 — withdrawn.**
   That cell now carries the compact overlay with both rails alive (REVISION-02 §R2); its remaining
   cost is a 0 px margin over `bodyMin` and a pictures-list viewport ≈ 10 px under one full card
   (REVISION-02 §R3.3), both declared rather than hidden.

### D.6 What the native proof must demonstrate (design requirement, not a claim)

For each of the 42 cells, with real fixtures:

* the clear-lot rectangle in §D.1–§D.4 is genuinely **clickable on the lot** (a worksite pick inside
  it selects a building/stage/set, and does **not** fall through from a lane surface);
* **no click-through** in the reverse direction: a click on the band, chip, inspector or sheet never
  reaches the world;
* `hud-open-build`, `memo-details-open`, `studio-menu-open` and both rail plates are **visible and
  hit-testable in every cell**, including with an overlay open;
* both rail scroll offsets, both filters, Find text, selection and invoking focus survive
  select → inspect → open sheet → Back → Back;
* the complete title, state word, cost, reason and `Back` are reachable at 200 % without a tooltip;
* a minimum clear-lot rectangle of **716 x 200 (1280x720) / 836 x 322 (1440x900)** on the main screen
  at every text size, and **716 x 96 / 836 x 96** with a lane overlay open.

---

## E. Text rules at 100 / 150 / 200 %

**Governing rules.** (1) Nothing required is ever shrunk to fit. (2) **A hover tooltip is never the
only place a full title, cost or reason exists** — every truncated string has a non-hover,
keyboard-reachable complete rendering. (3) Fixed rail widths are acceptable **only** because content
reflows, wraps, stacks and scrolls inside them; if a cell below fails the native check, the remedy is
reflow, not a narrower face. (4) Vertical rhythm follows the text preference; horizontal band geometry
follows the viewport only — the already-shipped "R4 option (a)" law. **Keep it.**

### E.1 Per element

| Element | 100 % | 150 % | 200 % | Owner file |
|---|---|---|---|---|
| **People rail** — name | wraps, own line | wraps | wraps | `StudioPeopleRailHud.RowHeight` (shipped) |
| — role line | wraps, own line | wraps | wraps | same |
| — status line | wraps, own line + chip | wraps | wraps | same |
| — row min height | 78 | grows from measurement | grows | `EmployeeRowMinHeight` x measured stack |
| — profession tabs | one row | **flow to 2 rows** | **REV02** flow, capped at 2 rows and scrolling when the list floor requires it | `LayoutTabs` → REVISION-02 §R3.2 |
| — search field | full width | grows taller | grows taller | `SearchHeight` |
| — list | scrolls | scrolls | scrolls | `people-rail-scroll` |
| **Pictures rail** — filter + Find | side by side | side by side | **STACK: filter full width above Find** | `FilterControlRect` / `FindControlRect` — **change** |
| — card title | wraps to 3 lines, then `…` | wraps to **4** lines, then `…` | wraps to **4** lines, then `…` | `TitleMaximumLines` — **change** (3 → 4 at m > 1) |
| — full title when clipped | **complete in the inspector header, and published as the row's registry text** | same | same | **change** (today it is tooltip-only) |
| — stage word | never truncated; own line | own line | own line | shipped |
| — state line (incl. `Waiting · cause`) | wraps | wraps | wraps | shipped |
| — card height | grows from measurement | grows | grows | `CardHeight` (shipped) |
| **REV02** — rail header row (both rails) | title+count and the auxiliary control share one row | share when measured | **own rows, measured** | REVISION-02 §R3.1 |
| **REV02** — picture card form | image left, text right | image left, text right | **stage image STACKED above the text** | REVISION-02 §R4.1–R4.2 |
| **REV02** — LOCATE / DETAILS zone | bottom-anchored own row, text reserves it | same | same, measured width | REVISION-02 §R4.3 |
| — visible range / paging | text grows; buttons keep `aria-disabled`-equivalent focus | same | same | shipped |
| **Band** — eyebrow | 1 line | 1 line | 1 line | §B.2 |
| — headline | wraps to 2 | wraps to 2 | wraps to 2 | §B.2 |
| — reason | wraps to 2–3 | wraps to 2 | wraps to 2, **then the band's text column scrolls** | §B.2 |
| — primary action button | 34 min height, wraps | 51, wraps | 68, wraps, **own row** | `memoWorkflowButtonStyle` law x m |
| — details control | beside the action | beside | own row | §B.1 |
| **Inspector** — title | 20 px, wraps, **REV02** clamped to 3 header lines | 30, **REV02** 2 lines | 40, **REV02** 1 line (0 at 1280) | §C.2 → REVISION-02 §R1 |
| — complete title when the header clamps | **REV02** first block of the scrolling body, unclamped, no tooltip | same | same | REVISION-02 §R1.2 |
| — facts grid | 2 columns | **1 column** | **1 column** | **[R3]** `.text-200 .facts` |
| — fact values | wrap (`overflow-wrap:anywhere`) | wrap | wrap | **[R3]** |
| — people-on-picture faces | wrap onto rows | wrap | wrap | **[R3]** `.who-row .faces{flex-wrap:wrap}` |
| — reason / cost strip | wraps in the scrolling body | wraps | wraps + scrolls | §C.2 |
| — footer actions | one row | one row | **wrap to 2 rows** | **[R3]** `.inspector>footer{flex-wrap:wrap}` |
| — `◄ Back` | fixed in header, never scrolls | same | same | §C.2 |
| — body | scrolls | scrolls | scrolls | `inspector-scroll` |
| **Sheet** — everything | wraps | wraps | wraps | §B.5 |
| — body | scrolls (`memo-scroll`) | scrolls | scrolls | §B.5 |
| — header (title + Back) | 68, fixed | 96, fixed | 120, fixed | §B.5 |
| **Tools row** — BUILD label | 176 wide | 264 | 352 | `ChipWidth` x m |
| — Next-step chip label | `Studio next steps · 3` | may wrap to 2 lines inside 44·m | may abbreviate to `Next steps · 3` **and** keep the full label in the registry text | §B.1 |
| **REV03** — every OTHER workspace and dialog (Profile, Roster, Production, Casting, Release result, Finance, Industry, History, Build, Laboratory, System Menu) | §E generalised — see `R3-N2-TEXT-RULES-ADDENDUM.md` (W1–W6, per-element table §3, invariants §4) | same | same | addendum §1 names the owner file per family |

### E.2 The tooltip repair, specifically

Today `StudioProductionRailHud` draws a clipped title as
`new GUIContent(shown, shown != data.Title ? data.Title : null)` and paints the full title only as a
`GUI.tooltip`. **[NAT]** That fails rule (2). Required remedy, in order of preference:

1. the **compact inspector header** renders the complete title, wrapped, unclamped — reachable by
   click, `Enter`, `Space` or the keyboard row cursor (no hover needed);
2. the card's own registry publication carries the **complete** title as its `text` (today
   `PublishProductionActionRect` publishes `"DETAILS"` / `"LOCATE"`, not the title) — so automation,
   proofs and any future accessibility surface can read it;
3. the tooltip stays as a convenience only.

### E.3 What must never be allowed to happen

* A cost, a refusal reason, a waiting cause or a `Back` label reduced in size to fit.
* A `Waiting · <cause>` state line clipped so the cause is lost (the R3 regression that was repaired
  once already — `06-small-enlarged.png` / `REVIEW.md`: Mara P-004 "On set" overflowed by 17.70 px
  before the separate-wrapping-lines fix). **[R3]**
* A rail row that clips its status rather than growing.
* Colour alone carrying "decision needed" or "waiting" — the word must be there too. **[R3]**

---

## F. Keyboard and focus mapping

### F.1 What already exists at working-tree HEAD `f57599b` — verified

**These laws are NOT in `7471d24`. They arrived with IMPL-03 (commits `1af1e4b..f57599b` on top of
`7471d24`), landing in the live Unity worktree while this sheet was being written; `1af1e4b`
("feat(input): give the focused rail the arrow keys without disabling the camera") is the one that
carries them.** The coordinator's critique item R5.7 was written against `7471d24` and was correct
there. At working-tree HEAD `f57599b` the gate exists and is wired: **[NAT, at f57599b]**

* `StudioInputFocusGate` implements `RailOwnsArrowKeys`, `CameraArrowsAllowed`, `NextRowCursor`
  (clamped, non-wrapping), `ArrowConsumed` (the boundary is inert **but owned**) and the published
  `RailOwnsArrows` flag.
* `StudioRailKeyboardFocus.HandleKeys` handles `Up`/`Down` on the focused rail and calls
  `MoveRowCursor`, consuming the event even at a boundary.
* Both rails call `PublishRailArrowOwnership(...)` and clear it when they stand down.
* `StudioCameraInput` reads `StudioInputFocusGate.RailOwnsArrows` in **both** input branches; in the
  legacy branch it substitutes explicit `WASD` reads for `GetAxisRaw("Horizontal"/"Vertical")` while a
  rail owns the arrows. This is the correct shape, because `Event.Use()` cannot suppress a *polled*
  axis.
* `Left`/`Right` switch People tabs; `PageUp`/`PageDown`/`Home`/`End` scroll the focused rail;
  `Escape` in a rail search field returns focus to the rail; `Tab`/`Shift+Tab` walk one combined ring.

**Do not re-implement any of that.** The N1 keyboard delta is small.

### F.2 The delta this design requires **[REC]**

| Key | Behaviour | Status |
|---|---|---|
| `1` | Focus the **employees** rail (claim its first/last-known row target, reveal it) | **missing — add** |
| `2` | Focus the **pictures** rail | **missing — add** |
| `3` | Open the **Studio next steps sheet** (equivalent to activating `memo-details-open`) | **new** |
| `Tab` / `Shift+Tab` | Existing combined ring, extended to include, in visual order: tools row (BUILD, Next-step chip) → band (primary action, details) → employees rail → lane overlay (when open) → pictures rail | extend |
| `Up` / `Down` | Adjacent row in the focused rail; **never pans the camera while a rail or the band owns focus**; inert-but-consumed at the list boundary | shipped |
| `Left` / `Right` | People tabs while the employees rail owns focus; cycles the filter option while the pictures rail's filter control owns focus; otherwise consumed with no camera pan | partly shipped |
| `Enter` / `Space` | Activate the focused target. On a rail row: select **and** open the compact inspector. Never submits an operation by itself. | shipped |
| `Escape` | The ordered ladder in §C.8 | extend (rule 4) |
| `W`/`A`/`S`/`D`, mouse drag, wheel zoom, `Home`/`H` recentre | Camera, always, unchanged | shipped |
| arrows with the **lot** focused | Camera pan, unchanged | shipped |

### F.3 Ownership statements

* **Text fields own their keys.** While a rail search/find field is focused every key but `Tab` and
  `Escape` belongs to the field (`TextEntryFocused()`), including the arrows.
* **The Studio Menu owns input** while its layer is not `Closed` (`modalOwnsInput`).
* **Full-screen workspaces own their input** (`workspaceOpen`) — **REV02:** no longer including any
  inspection cell; the §C.9 fallback is withdrawn (REVISION-02 §R2.5).
* **The lane overlay does NOT take modal ownership.** It owns only the keys inside its own rect and
  `Escape`; the rails keep their rings and their wheel.
* **Focus is never selection.** A blue 3 px focus ring, a gold selection edge and a gold attention
  mark are three different things and must remain visually distinct at all three text sizes. **[R3]**

### F.4 The one Escape gap to close

At working-tree HEAD `f57599b` (IMPL-03 commits `1af1e4b..f57599b` on top of `7471d24`), `Escape`
with a rail row focused (and no text field) still falls through
`StudioRailKeyboardFocus.HandleKeys` un-consumed. **[NAT]** Rule 4 of §C.8 requires it to release rail
focus (clear `Target`, clear `PublishRailArrowOwnership`, return the arrows to the camera) **before**
the camera's / menu's own Escape handling sees it.

---

## G. Implementation routing — which file gets which number

The writer receives geometry, not prose. All px are **base px** and, where noted, multiply by
`× viewport scale` (`StudioLegacyUiMetrics.CurrentScale`, = 1 at both target viewports) and/or
`× text multiplier` (`StudioTextSizePreference.Multiplier`).

| # | Rule | Owner file (Unity, `7471d24`) | Numbers / signature |
|---|---|---|---|
| G1 | Lane constants `L`,`R`,`W`,`T`,`B` | `Runtime/Infrastructure/StudioRailReturnContracts.cs` | add pure `LotLaneRect(screenW, screenH, s, leftRailRightEdge, rightRailLeftEdge, chipBottom, toolsRowHeight)`; gap 12·s; `T = chipBottom + 12·s`; `B = screenH − 12·s` |
| G2 | Tools row: BUILD + Next-step chip | `Runtime/Presentation/StudioBuildCommandHud.cs` | `CurrentChipRect` → `Rect(L, T, min(176·m, W−12), 44·m)`; **retire** the `max(memoRight, railRight)+12` anchor; keep element `hud-open-build` |
| G3 | Next-step chip | `Runtime/Presentation/StudioBuildCommandHud.cs` (or a new sibling HUD) | `Rect(R − nw, T, nw, 44·m)`, `nw = min(240·m, W − buildWidth − 12)`; publish `memo-details-open`; label + count + attention pip |
| G4 | Next-action band | `Runtime/Infrastructure/StudioBridgeClient.cs` + `.ResearchMemo.cs` | `Rect(L, T+44·m+12, W, H_band)`; `H_band = clamp(content, 83·m, laneBottom_eff − y − 200·s)`; publish `memo-next-band`, `memo-next-scroll`, and the primary `memo-intent-<id>` / `memo-research-<id>` at their existing names |
| G5 | Band visibility predicate | same | `bandFits = (laneBottom_eff − y) ≥ 83·m + 200·s`; `laneBottom_eff = receipt.yMin − 12` when a receipt draws |
| G6 | `WorkflowPanelRect` retired as a full-height envelope | `StudioBridgeClient.cs` (`WorkflowPanelRect`, l. 2309) and `StudioRailReturnContracts.MemoEnvelope` | replace with `MemoSheetRect(...)` = `Rect(L + (W−sw)/2, B − h, sw, h)`, `sw = min(W, 680·s)`, `h = min(content, B − overlayTopFloor − 12 − 96·s)`; `MemoEnvelope` may keep its historical branch for the both-rails-hidden case |
| G7 | Sheet header / body | `StudioBridgeClient.cs` OnGUI | header 68 / 96 / 120 (fixed, title + week/connection + `◄ Back` = `memo-details-close`); body = the rest, `GUILayout.BeginScrollView` → element `memo-scroll` |
| G8 | Memo button rect clipping | `StudioBridgeClient.ResearchMemo.cs` (`ClipMemoButton`, l. 68/82) and `.ReleaseMemo.cs` (l. 36) | clip against the **band rect or the sheet rect**, whichever rendered the button, instead of `WorkflowPanelRect()` |
| G9 | Memo render predicate | `StudioBridgeClient.cs` (`WorkflowPanelRendered`, l. 168) and `.ReleaseMemo.cs` (l. 48), `.ResearchMemo.cs` (l. 33/48/90/96) | becomes "band **or** sheet rendered this frame"; `LastRenderedWorkflowIntentKinds` must report the **union** of band + sheet kinds so the existing journey proof seam stays truthful |
| G10 | World-pick guard | `StudioBridgeClient.WorkflowPanelContainsScreenPoint` (l. 305) | keep the name and the content-height clamp; answer `true` for the band, the chip and the sheet where content actually renders |
| G11 | Receipt left floor | `Runtime/Presentation/StudioHud.cs` (`CalculateSelectionReceiptGuiRect`, l. 138 and the `Avoid` loop l. 52–108) | replace the `(18 + 400 + 12)` = 430 floor with lane `L`; add `minimumTop = max(existing, band.yMax + 12·s)`; keep the direction-aware `Avoid` |
> **Concurrent-edit notice, 2026-09-14 21:48.** While this sheet was being written, the unity-ui writer
> was landing IMPL-03 in the live Unity worktree. The `StudioHud.cs` change I observed is IMPL-03
> commit **`f57599b`** ("fix(hud): dodge the memo where it actually renders, not where it used to"),
> now working-tree HEAD; it replaces exactly the `(18 + 400 + 12)` receipt floor named in **G11** with a
> live read of `StudioRailReturnContracts.MemoEnvelope(...).xMax + ReceiptInset`. That change is **compatible
> with, and superseded by, G11**: once the memo leaves the left band, `MemoEnvelope`'s left-band branch
> no longer governs the receipt and the floor must become the lane `L`. Do not apply G11 as a revert;
> apply it as the next step on top of that edit, and reconcile ownership of `StudioHud.cs` before
> either lands. **I did not author, inspect further, or modify that change** — this sheet's author held
> no write authority in the Unity worktree.

| G12 | Compact inspector rect | new `Runtime/Presentation/UI/` sibling of `StudioPersonInspectorCard.cs` / `StudioCastingInspectorCard.cs`, hosted **without** the `StudioWorkspaceHost` scrim | `width = min(W, 680·s)`; `x = L + (W−width)/2`; `bottom = B`; `height = min(content, B − overlayTopFloor − 12 − 96·s)`; header 104/140/176; footer 60/82/108; body scrolls |
| G13 | Inspector must not set `WorkspaceOpen` | `Runtime/Presentation/UI/StudioWorkspaceHost.cs` | the lane overlay is a new non-scrim state; `WorkspaceOpen` stays false so `StudioProductionRailHud` and `StudioHud` do not suppress themselves |
| G14 | Laboratory re-publication | `StudioHud.cs` (l. 237–249) + the new inspector | while the inspector subsumes the receipt, publish `hud-open-laboratory` at the inspector's footer rect, same name, same enable law |
| G15 | **REV02** — no fallback; an assertion instead | the new inspector | assert `B − overlayTopFloor − 12·s − 96 ≥ header(N=0) + footer + bodyMin` at every supported cell and report a failure; never switch form silently (REVISION-02 §R2.5) |
| G16 | Back/Escape ladder | `StudioProductionRailHud.cs` (`StudioRailKeyboardFocus.HandleKeys`, l. 205) | add rule 4 of §C.8: `Escape` with a rail target and no text field clears `Target`, calls `PublishRailArrowOwnership(rail, false)`, `e.Use()` |
| G17 | `1` / `2` / `3` | `StudioProductionRailHud.cs` (`StudioRailKeyboardFocus.HandleKeys`) | `KeyCode.Alpha1`/`Keypad1` → claim the people rail's first target; `Alpha2` → the pictures rail's; `Alpha3` → activate `memo-details-open`; each `e.Use()` |
| G18 | Rails' top floor vs the living-time chip | `StudioPeopleRailHud.TopEdge` (l. 236) and `StudioProductionRailHud.TopOffset` (l. 655) | `max(94·s_text, StudioLivingTimeHud.CurrentChipRect(Screen.width, s).yMax + 12·s, menu.yMax + 8·s)` — closes the 13 px x 56 px overlap at 1280/150 % |
| G19 | Pictures toolbar stacks at 200 % | `StudioProductionRailHud.FilterControlRect` (l. 1006) / `FindControlRect` (l. 1010) / `ToolbarHeight` (l. 997) | at `Percent == 200`: filter = full `InnerWidth()` on its own row, Find below it; `ToolbarHeight += ToolsHeight(s) + 6·s` |
| G20 | Card title lines + full-title publication | `StudioProductionRailContracts.TitleMaximumLines` (l. 56), `StudioProductionRailHud` l. 1295–1300, `PublishProductionActionRect` (l. 1090) | `TitleMaximumLines = Percent == 100 ? 3 : 4`; publish the **complete** title as the card row's registry `text`; keep the tooltip as a convenience only |
| G21 | Camera never moves for a lane surface | `Runtime/Presentation/StudioCameraDirector.cs` / `StudioCameraInput.cs` | **no change** — assert it: opening/closing the band, chip, sheet or inspector issues no camera command |
| G22 | Rail widths stay viewport-only | both rail HUDs (`BandScale`) | **no change** — defend it; the lot must keep its centre at every text size |

### G.2 Dependencies and things the writer must NOT silently absorb

* **PlayMode memo-geometry tests will change identity.** The four memo-geometry PlayMode tests and
  `StudioProductionAndCampaignLayoutTests` assert against `WorkflowPanelRect()` and the memo's
  element rects. Moving the memo to a band + sheet **changes what those tests measure**. That is test
  ownership, not writer discretion: raise it, do not rewrite assertions to match new output.
* **`StudioBridgeClient.WorkflowPanelVisible`** is consumed by `StudioHud`. Define precisely what it
  means after the change (recommend: "the band or the sheet is rendering") before touching G11.
* **Not established** from the files I was given: the exact IMGUI script execution order between
  `StudioBridgeClient.OnGUI` and the two rail HUDs (which decides whether today's memo/chip overlap
  paints memo-over-chip or chip-over-memo); the native per-frame cost of a second scrolling IMGUI
  surface; whether `Screen.safeArea` is ever non-trivial on the target desktop builds. All three need
  native observation.

---

## H. Provenance

### H.1 R3 archive files measured (verified copy, `shasum -a 256`)

| File | sha256 |
|---|---|
| `R3/DESIGN.md` | `2df92f98a1b31520fb7c8ce9b952113733e4e5243bff699c42f89a059fc7496d` |
| `R3/REVIEW.md` | `f07222f3753de4f85da17deb390d364d54c86b4079304ecad98b250f9dfa815f` |
| `R3/movie-cards.css` | `c254e913e7faf76286611d2cd10ca41c4ce5f260bb7293a5cd8f7af8ed5880fa` |
| `R3/movie-cards.js` | `ea61e66d46c6452638b8d89dd5a2991f21e711a5e1d4ecbb3f7168cef95eb57a` |
| `R3/backlot.css` | `51a5191c23cb7fcf877eb4298c627a37a9a863242ee9ab20adc51fbc67a3c2d9` |
| `R3/index.html` | `5c383c2afacd36414e53b2ff45ce3a4248b6d4ab4f5b81fcc3baf1a5508aa415` |
| `R3/previews/03-selected.png` (1440x900) | `ce20bcd1374ac8c41d2017e5181c40e4eeae14cfddc059dafa07e5971becf62d` |
| `R3/previews/04-waiting.png` (1440x900) | `cb8ce174d2dc0cb5ff0802af2ed9cd30d6f133f61bf58375e0de2c4a5e2d847e` |
| `R3/previews/06-small-enlarged.png` (1280x720) | `23cf2d828baf4d91ecb3fa750b592f7c6be10c9613bc4660b88ec82dd0e4d2a6` |
| `R3/previews/07-small-waiting.png` (1280x720) | `95be6ac4932e54aea6fd015487eb1935c0c909e1f4d14a1f3d31c0113a3fd543` |
| `current-plan/04-R3-HYBRID-EXECUTION-ORDER.md` | `838d86fcd052e1ec06fcc050dd0d2cfec8f57c241cdaf2abd69b3a1f7ee5e13c` |
| `current-plan/02-SCOPE-AND-ACCEPTANCE.md` | `f8b2498d6087a22866db7fdff6ebd3167f6ad310041181cc88d7cc74210d8b7a` |

Archive root: `/Users/bruce/Desktop/Fable-Verified-Sources-20260914-01/`.
`03-selected.png` and `07-small-waiting.png` were opened and inspected as rendered images, not only
read as files; the R3 inspector's measured footprint in `03-selected.png` (x ≈ 366..1046, y ≈ 488..884)
and the near-total centre occupancy in `07-small-waiting.png` are the observations behind §C.1 and the
REVIEW.md open item "in very tall inspection, the panel can dominate the center and obscure part of
the lot or corner tools".

### H.2 Unity files read (worktree `/Users/bruce/The Movies - Playability Interaction Unity`, READ ONLY)

**Attribution correction.** I read the LIVE worktree while the unity-ui writer was landing IMPL-03, so
what I read is **working-tree HEAD `f57599b` (IMPL-03 commits `1af1e4b..f57599b` on top of
`7471d243ba8fb688858f5658580d2a0b39600d7d`)**, not `7471d24` alone. Every lane constant, memo-envelope,
BUILD-chip, living-time, receipt, rail-width and text-size number in this sheet comes from code that is
present and unchanged at `7471d24` (`RailEdgeGap`, `MemoEnvelope`, `BuildChipLeft`, `LotCentreWidth`,
`StudioRailReservations` are byte-identical at both commits), so no number moves. The facts that are
**only** true at `f57599b` are the §F.1 keyboard laws, `StudioInputFocusGate.cs` (added by `1af1e4b`;
it does not exist at `7471d24`), `StudioCameraInput`'s `RailOwnsArrows` read, and the §G11 `StudioHud.cs`
receipt floor.

`Assets/Studio/Runtime/Infrastructure/` — `StudioRailReturnContracts.cs` (`RailEdgeGap`,
`RailReturnContext`, `RestoreOffset`, `RestoreTarget`, `MemoEnvelope`, `BuildChipLeft`,
`LotCentreWidth`, `StudioRailReservations`), `StudioBridgeClient.cs` (ll. 98, 168, 300–330,
1828–2087, 2309–2430), `StudioBridgeClient.ReleaseMemo.cs`, `StudioBridgeClient.ResearchMemo.cs`,
`StudioLegacyUiMetrics.cs`, `StudioTextSizePreference.cs`, `StudioInputFocusGate.cs` (**exists only at
`f57599b`; added by `1af1e4b`**),
`StudioPeopleRailContracts.cs`.

`Assets/Studio/Runtime/Presentation/` — `StudioPeopleRailHud.cs`, `StudioProductionRailHud.cs`
(incl. `StudioProductionRailContracts` and `StudioRailKeyboardFocus`), `StudioBuildCommandHud.cs`,
`StudioHud.cs`, `StudioLivingTimeHud.cs`, `StudioSystemMenuHud.cs`,
`StudioSystemMenuHud.TextSize.cs`, `StudioSystemMenuContracts.cs`, `StudioDevelopmentCardHud.cs`
(incl. `StudioDevelopmentCardContracts`), `StudioCameraInput.cs`.

`Assets/Studio/Runtime/Presentation/UI/` — `StudioWorkspaceHost.cs`, `StudioPersonInspectorCard.cs`
(referenced), `StudioCastingInspectorCard.cs` (referenced).

TS worktree `@ afad4137`:
`docs/engineering/playability-launch-review/06-FABLE-ADOPTION-AND-FRESH-SESSION-HANDOFF.md` ll. 34–110.

### H.3 Label legend, restated

* **[NAT]** — read from Unity source at `7471d24` and, where a number is given, evaluated by hand from
  the named function at the stated viewport. **A paper evaluation of committed code. Never a runtime
  or native measurement.** Anything a native run contradicts, the native run wins.
* **[R3]** — measured from the verified R3 archive (CSS declarations and rendered PNGs). A browser
  prototype at fictional fixtures; not a native claim.
* **[REC]** — this designer's recommendation.
* **not established** — the number is not present in the files I was permitted to read, and I did not
  guess it (see §G.2).

### H.4 Evidence limits

No Unity build was launched, no PlayMode or EditMode test was run, no desktop input was taken, no
screenshot of the game was produced, and no bridge or campaign was contacted. No fonts, art or
packages were fetched or installed. The SVGs in `assets/` are hand-authored diagrams using generic
CSS font families only; they reference no external font, image or network resource. All fixture-like
labels in them are taken from the R3 previews or are neutral placeholders marked as such.

---

## SVG state mockups

| File | Cell drawn | Layout rule |
|---|---|---|
| `assets/01-lane-model-1280-100.svg` | 1280x720, 100 %, S1 main + S2/S3 receipt, with today's memo footprint ghosted for comparison | L1, L2 |
| `assets/02-inspector-1440-100.svg` | 1440x900, 100 %, S4 picture inspected (actionable), both rails alive | L3 |
| `assets/03-text-200-1280.svg` | 1280x720, 200 %, S1 with the capped scrolling band, and the S4 fallback annotated | L1 at T3, L5 |
| `assets/04-memo-sheet-1440-150.svg` | 1440x900, 150 %, S7 Studio-next-steps sheet open | L4 |
