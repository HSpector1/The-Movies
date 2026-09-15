# R3-N1-SHEET-REVISION-02 — necessary responsive revision (F13, F14, F15, and the 1280x720/200 % cell)

**Task** R3-N1-DESIGN-02 under Current Ops order **OPS-R3-N1-NATIVE-CORRECTION-20260915-01 §2 (F13/F14/F15) and §3**. **Mode** DESIGN_PROTOTYPE
— documentation only; no source, test, build, native input or screenshot was produced here. **Status** addendum to
`R3-N1-COMPACT-INSPECTOR-MEMO-SHEET.md` (DESIGN-01): it revises only the rows the connected native review contradicted; every unmentioned
section stands, and in-place rows that now conflict are marked **REV02**.

**Labels** `[NAT]` = read from Unity source (worktree `…-Playability-Interaction Unity`, `18b893a6`, READ ONLY) and evaluated by hand — a
*paper* evaluation of committed code, never a runtime observation. `[F13]/[F14]/[F15]` = the connected native run
`Evidence/Playability-Interaction-01/early-2026-09-15T06-25-20-387Z/`, 1440x900 (200 % captures follow `studio-menu-text-200`). `[REC]` =
recommendation. **Nothing below is a native measurement of the revised design; it is arithmetic the writer must re-measure with the styles that
draw.**

**Constants reused, unchanged** (DESIGN-01 §A.4, `[NAT]`): `s` = `CurrentScale` = **1** at both targets; `m` = text multiplier (1 / 1.5 / 2);
lane `T` = 94 / 166 / 190; tools row 44·m; overlay top floor `toolsRow.yMax + 12` = **150 / 244 / 290**; `B` = 708 / 888; `W` = 716 / 836;
overlay width `min(W, 680)`; clear-lot reserve `MinimumLotOverlay` = **96**; rail widths 236/258 (people), 268/286 (pictures) — viewport-only,
**still not text-scaled** (§E rule 4 stands).

**One new law behind three rules.** DESIGN-01 multiplied *chrome padding* by the text multiplier; padding is not text. **REV02 [REC]: inside the
compact inspector, paddings and separator gaps scale with the VIEWPORT (`·s`, = 1), never with `m`; type, controls and touch targets keep
`·m`.** Nothing textual shrinks, and this alone recovers 56 px of the 1440/200 % overlay.

## R1 — overlay header/footer/body clamp against the ACTUAL rect (fixes F14)

**F14 observed**: at 1440x900/200 % the unclamped 3-line 40 px title consumed the whole 490 px overlay; `inspector-open-production` /
`inspector-locate` published at y −138 / −64 (off-screen); body 1 px. **Cause in DESIGN-01**: §C.2 made the header a content-sized block with a
title "never clamped" and left footer/body the remainder — an unbounded term in a bounded rect.

**R1.1 Header is a bounded stack of fixed rows** `[REC]`, text column beside the stage art, all paddings `·s`:

```
row1 = max(eyebrowLine, backHeight)   = max(16·m, 34·m) = 34 / 51 / 68     // '◄ Back' pinned top-right shares row 1
row2 = N × titleLine, titleLine = 24·m = 24 / 36 / 48                      // N = header title lines, R1.2
row3 = subLine = 18·m = 18 / 27 / 0                                        // at 200 % the sub-line starts the BODY
column = row1 + 4·s + row2 + (row3 > 0 ? 4·s + row3 : 0)
header = 16·s + max(stageArt, column) + 12·s     stageArt = 78 (1440) / 72 (1280), 68 at 200 % (BandScale, not text)
footer = 12·s + max(34·m, actionRowHeight) + 14·s = 60 / 77 / 94           // ONE row at <= 2 actions
footer += 34·m + 6·s                                                       // a SECOND row only at 3+ actions
body   = rect.height - header - footer, scrolls, element `inspector-scroll`
bodyMin = 3 × 18·m + 12·s = 66 / 93 / 120                                  // three drawn body lines + padding
```

**R1.2 The clamp ladder.** Start `N` = **3 / 2 / 1** (100/150/200 %). While `header > min(0.40 × rect.height, rect.height − footer − bodyMin)`:
(a) move the sub-line into the body; (b) `N -= 1`; (c) at `N = 0` the header carries only row 1 and the **complete title becomes the first block
of the scrolling body**. Rule E(2) holds at every step **without a tooltip**: whenever the header clamps, the COMPLETE title renders unclamped
and wrapped as the body's first block and is the card's published registry text (G20). The header never clamps below row 1 (eyebrow + Back).

**R1.3 Rect order — the direct fix for the off-screen publishes.** `rect.height = clamp(header + contentBody + footer, header + footer +
bodyMin, ceiling)`, `ceiling = B − overlayTopFloor − 12·s − 96`; header/footer/body and **every** action rect are computed from the FINAL rect.
`inspector-open-*`, `inspector-locate`, `hud-open-laboratory` (G14) and `◄ Back` publish only after the clamp and only if
`rect.Contains(actionRect)`; a frame that cannot satisfy that publishes **no** rect rather than a negative one, and no action rect may have `y <
rect.y`, `yMax > rect.yMax` or `height <= 1`.

**R1.6 Routing** `[NAT]`: G12's "new sibling" already exists — R1 and R5 land in `StudioLaneInspectorHud` (`MeasureLaneHeader` /
`MeasureLaneFooter` / `DrawLaneHeader` / `DrawLaneFooter`) and `StudioRailReturnContracts.LaneInspectorHeaderHeight` / `…FooterHeight`; R3/R4 in
`StudioPeopleRailHud`, `StudioProductionRailHud` and `StudioProductionRailContracts`.

**R1.4 Per-cell result** `[REC]`, one-row footer, at the overlay ceiling (a content-sized overlay is shorter and clamps less):

| Cell | ceiling | N after ladder | header | footer | body | body ≥ bodyMin |
|---|---:|---:|---:|---:|---:|---|
| 1280x720 / 100 % | 450 | 3 | **160** | 60 | **230** | 230 ≥ 66 ✓ |
| 1280x720 / 150 % | 356 | 1 (sub-line to body) | **119** | 77 | **160** | 160 ≥ 93 ✓ |
| 1280x720 / 200 % | 310 | 0 (title to body) | **96** | 94 | **120** | 120 ≥ 120 ✓ (zero margin — R2.3) |
| 1440x900 / 100 % | 630 | 3 | **160** | 60 | **410** | ✓ |
| 1440x900 / 150 % | 536 | 2 | **186** | 77 | **273** | ✓ |
| 1440x900 / 200 % | 490 | 1 | **148** | 94 | **248** | ✓ — F14's failing cell |

**R1.5 Variants covered at both viewports × all three sizes** (the order names them): person, picture and screenplay records; a 3-line-plus
title; a one-action `Waiting · <cause>` record; a three-action record whose footer wraps to two rows (100 / 137 / 174), `bodyMin` still holding
everywhere except 1280/200 %, where a third action moves behind the existing `More actions ▸`.

## R2 — the 1280x720 / 200 % cell: it fits. §C.9's full-screen fallback is withdrawn.

**R2.1 Re-derivation** `[REC]`. Lane 418 px (`708 − 290`); overlay ceiling `708 − 290 − 12 − 96` = **310**. DESIGN-01 needed 176 + 108 + 200 =
484; under R1 the cell needs **96 + 94 + 120 = 310** and fits **exactly** — viewport-scaled padding saves 56 px (header) + 14 (footer) and the
clamp ladder moves title and sub-line into the scrolling body, complete and wrapped.

**R2.2 The top floor does NOT move at this cell** `[REC]`. Taking the tools-row band (`overlayTopFloor` → `T` = 190) yields a 410 px envelope
but covers `hud-open-build` and the Next-step chip, which §C.4 priority 4 keeps always visible; both chips fill the row there (BUILD 352 +
Next-step 352 of a 716 px lane `[NAT]`), so nothing survives underneath, and re-publishing them inside the overlay costs a pinned 88 px strip →
a **74–94 px** body, worse than the 310 px envelope's 120. **Keep the tools row.**

**R2.3 The honest margin, and the only lever.** The 120 px body clears `bodyMin` by **0 px**. If the measured body line exceeds 18·m (1.3 em on
a 28 px face = 36.4 → `bodyMin` 121), the only lever is chrome, never text or controls: top gap `12·s → 8·s` plus header padding `16/12 → 12/8`
returns **+12 px**. Never raise the minimum viewport, disable 200 %, shrink a face or restore the fallback.

**R2.4 Both rails stay visible and usable here, not merely retained.** The overlay is 680 wide at x 284..964; `LeftRailRightEdge` 254 and
`RightRailLeftEdge` 994 `[NAT]` are outside it by construction, so neither plate is covered; `WorkspaceOpen` stays **false** (G13) so neither
rail suppresses itself; both keep wheel, keyboard, filters, Find and paging (§C.3). Clear lot with the overlay open: **716 × 108** above it,
plus 18 × 310 either side.

**R2.5 What this replaces.** §C.9's recommendation, §0.3's first bullet, §A.2's L5 row for this cell, §D.3/§D.4's "full-screen workspace" rows
and **G15**'s fallback predicate are **withdrawn**. G15 becomes an **assertion**: `B − overlayTopFloor − 12·s − 96 ≥ header(N=0) + footer +
bodyMin` must hold at every supported cell, and a failure is reported, not silently switched to another form. `StudioWorkspaceHost` keeps its
own routes (roster, laboratory, casting), but is no inspection fallback at any cell.

## R3 — rail header chrome at 200 % (fixes F13's clipped/overlapping headers)

**F13 observed**: "EMPLOYEES 11" drew as "S 11"; "ROSTER ▸" wrapped over it; "PICTURES" drew over "No decisions". **Cause** `[NAT]`: both rails
draw two labels into ONE row. People: the title gets `headerRect.width − 96·w` at a fixed `18·s` height while "ROSTER ▸" is drawn at
`headerRect.xMax − 84·w` (`StudioPeopleRailHud`, header draw); pictures: `PICTURES n` (`headerStyle`, UpperLeft) and `DecisionLine`
(`decisionStyle`, UpperRight) are drawn into the *same* `HeadingRect`.

**R3.1 Header row law, both rails** `[REC]` — a measured vertical stack of full-inner-width rows:

1. **Title row** — `"EMPLOYEES  11"` / `"PICTURES  7"`: title and count are **one string**, wrapping together, never split across
   rows. Width = `InnerWidth()` (**212/234** people, **244/262** pictures `[NAT]`), height = `max(18·s, headerStyle.CalcHeight(label,
   InnerWidth()))`; the `− 96·w` and fixed-`18·s` title rect are **removed** — that pair is what produced "S 11".
2. **Auxiliary row** — `ROSTER ▸` / `DecisionLine`. It **shares the title row only when**
   `titleStyle.CalcSize(title).x + 8·w + auxStyle.CalcSize(aux).x ≤ InnerWidth()`; otherwise it takes its own row directly below,
   at its measured height, aligned to the edge it uses today.
3. **Sub-count row** — `"4 available"` (people): unchanged, always last.

`HeaderHeight` / `HeadingHeight` = the rows actually drawn + `8·s`. Paper evaluation of the predicate `[REC]`: 100 % 166 ≤ 262 → one row (**no
visual change at 100 %**); 150 % 245 vs 262/244 → one row at 1440, split at 1280; 200 % ≈ 324 > 262 → **split at both viewports**. People header
≈ 80 → **≈ 102** at 200 %; pictures heading ≈ 30 → **≈ 58**. Registry unchanged: `people-roster-open` still publishes the WHOLE header rect
(larger target, same name and text), and `pictures-filter` / `pictures-find` already derive from `HeadingRect.yMax`.

**R3.2 List viewport floor** `[REC]`. The list must scroll before the chrome eats it: pictures `ListViewportRect` floor `24·s` →
**`CardMinHeight·s` = 91 / 136 / 182**; people body floor `24·s` → **`EmployeeRowMinHeight·s` = 78 / 117 / 156**. When the measured chrome would
breach the floor, chrome yields in this **stated order**, never by removing a control: (1) at `m > 1` the sentence labels abbreviate while the
COMPLETE sentence is published as the element's registry text (the §E.1 Next-step-chip precedent) — `"Hire more at the Casting building ▸"` →
`"Hire · Casting ▸"`, `"Back to active pictures"` → `"◂ Active pictures"`, `"Scroll · 12 pictures"` → `"12 pictures"` (≈ **84 / 16 / 16 px**
back); (2) the profession tab strip caps at **2** flowed rows at 200 % and scrolls inside that cap, every tab keeping its rect and keyboard
order (≈ 44 px back); (3) nothing further — the rail keeps scrolling and reports the shortfall.

**R3.3 The declared remaining limitation at 1280x720 / 200 %** `[REC], paper`. Rail envelope `720 − 190 − 12` = **518**. People: chrome ≈ 102 +
96 + 52 + 48 + 32 = 330 → list ≈ **188** ≥ 156 ✓ (after both yields). Pictures: toolbar ≈ 230 + footer ≈ 116 → list ≈ **172** against a 182
floor — **≈ 10 px short**, and one stacked 200 % card (R4) is ≈ 400 px tall, so that cell shows part of a card and scrolls within it. No row
clips and no control is removed; every part stays reachable by the list's own scroll. A scroll cost, not a lost route — to be measured natively,
not assumed.

## R4 — picture card and people row at 200 % (fixes F13's mid-word breaks and the LOCATE overlap)

**F13 observed**: title and stage word break mid-word beside the 144 px image slot; LOCATE overlaps the wrapped state line. **Cause** `[NAT]`:
`StageSlotWidth` bounds the image only by `CardTextMinimumShare` = 0.45 of a FIXED card, so the text column is `cardWidth − slot − 30·w`; and
the screenplay LOCATE label draws into `Rect(card.xMax − 64·w, card.y, 54·w, card.height)` — the FULL card height — while the text column runs
to `card.xMax − 10·w`: they overlap whenever a line fills the column.

**R4.1 Stack predicate** `[REC]`. Stack the stage image ABOVE the text when `CardTextWidth(cardWidth) < titleStyle.CalcSize(new
GUIContent("Wellington")).x` — a ten-character specimen in the face that actually draws (≈ **70 / 105 / 140** px). Paper evaluation of the drawn
text column `[REC]`:

| Cell | card width (list not scrolling / scrolling) | stage slot | text column | vs threshold | form |
|---|---|---:|---:|---|---|
| 1440 / 100 % | 286 / 268 | 78 | **178 / 160** | ≥ 70 | side by side |
| 1440 / 150 % | 286 / 268 | 117 | **139 / 121** | ≥ 105 | side by side |
| 1440 / 200 % | 286 / 268 | 127 / 117 | **129 / 121** | < 140 | **STACK** |
| 1280 / 100 % | 268 / 250 | 72 | **166 / 148** | ≥ 70 | side by side |
| 1280 / 150 % | 268 / 250 | 108 | **130 / 112** | ≈ 105 | side by side |
| 1280 / 200 % | 268 / 250 | 117 / 108 | **121 / 113** | < 140 | **STACK** |

Stacking engages at **200 % only, at both viewports, with or without a scrollbar** — the form never flips as the scrollbar appears: the
predicate reads the same `cardWidth` the measure and draw passes already share, and stacking only makes a card **taller**, so it can never
remove the scrollbar that triggered it. No oscillation is possible.

**R4.2 Stacked anatomy** `[REC]`, inset `8·w`, text block full width `cardWidth − 16·w` = **270/252** (1440), **252/234** (1280): image row
`slot = min(baseImage·m, cardWidth − 16·w)` = 156 (1440), 144 wide × 156 tall (1280, aspect kept against the 72 base); `10·s`; **title, up to
`TitleLinesFor` = 4 wrapped lines, complete when focused or selected** (existing law); `3·s`; **stage word, own wrapped line**; `3·s`; **state
line, own wrapped line** (clock inset `16·w` when waiting); `6·s`; **action row** (R4.3); `10·s`. Worst-case stacked card ≈ **400–440 px** at
200 % — the height recorded as a cost in R3.3.

**R4.3 Action row — LOCATE / DETAILS / LOCATE CASTING never overlap text, at any size** `[REC]`. All three use the bottom-anchored
`StudioProductionRailContracts.LocateZoneRect` law (`card.yMax − height − 6·w`); the full-card-height screenplay variant is **removed**. Zone
width at `m > 1` is measured, not fixed: `max(LocateZoneWidth·w, style.CalcSize(word).x + 12·w)` ≈ **64 → 90** (LOCATE) and **78 → 105**
(DETAILS) at 200 %; both fit the 234–270 px row side by side, right-aligned, LOCATE outermost. `CardHeight` (measure) and `DrawCard` (draw) both
reserve `zoneHeight + 6·s` beneath the state line whenever a zone draws — the reservation the casting zone already gets — so no text line can
enter the band. Cost: **+30 / +45 / +54 px** on such cards.

**R4.4 People rows run the same check** `[REC]`. `PortraitWidthFor = min(44·m, max(16, rowWidth × 0.30))` `[NAT]` already caps the portrait —
which is why F13 named only the picture card. Paper: text column ≈ 234 − 70 − 12 = **152** (1440/200 %, ≥ 140 → side by side); 212 − 64 − 12 =
**136** (1280/200 %, < 140 → **stack the portrait above the name/role/status block**, full row width, each line wrapping). Row height grows from
measurement; no line clips, no face shrinks.

## R5 — opaque body backing throughout the scroll viewport (fixes F15)

**F15 observed**: the scrolling body has no opaque backing — body lines draw over the lot while header and footer have stock. **Cause** `[NAT]`:
the container stock in use is `StudioUiTokens.SurfaceContainer`, alpha **0.86**. **R5.1 The draw, exactly** `[REC]`, no new token:

1. **Body plate** — fill the ENTIRE body rect with `StudioUiTokens.Solid(new Color(SurfacePlate.r, SurfacePlate.g,
   SurfacePlate.b, **1f**))` (0.94/0.90/0.81 at full alpha; the shipped 0.97 and `SurfaceContainer`'s 0.86 both read through over
   a bright lot). Draw it **before** `GUI.BeginScrollView`, clipped to the body rect, so it backs the viewport and the scrollbar
   gutter — content scrolls, the plate does not.
2. **Header** keeps `SurfaceHeader`, **footer** keeps `SurfacePlate`; both at full alpha wherever they abut the body.
3. **Separation** — a `1·s` `Keyline` at `header.yMax` and at `footer.yMin`, drawn OUTSIDE the scroll view so it never scrolls
   away; the body's first and last `6·s` are padding, so text never touches a keyline.
4. **Clipping** — nothing in the body paints above `header.yMax` or below `footer.yMin`: focus rings and R1.2's title included.

**R5.2 The verification this requires** (writer/test owner; not a claim made here): capture the inspector over a **bright** and a **dark** lot
region, **mid-scroll** (not at rest, not on an empty panel), at both viewports × 100/150/200 %, and show that no lot pixel reads through the
body plate and that both keylines stay put while the body scrolls.

## What this addendum does NOT change

The hybrid composition, employees-left / pictures-right, fixed rail widths (§E rule 4), the lot as primary surface, `MinimumLot`, the band law
(§B), the memo sheet (§B.5), route preservation (§B.6), occlusion priorities (§C.4 — R2.2 confirms the tools row is never covered), the
receipt/inspector identity (§C.5), Back/Escape (§C.8), keyboard mapping (§F) and every G-number except **G15** (R2.5). The SVGs are not
re-rendered: `03-text-200-1280.svg` draws the withdrawn L5 fallback and is superseded in text by R1/R2.
