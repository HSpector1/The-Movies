# R3-N2-TEXT-RULES-ADDENDUM — §E generalised to every workspace and dialog (REV03)

**Task** R3-N2-DESIGN-03 under the Owner directive of 2026-09-15 and `plans/R3-OVERHAUL-PLAN.md` (TS `282b138c`) phase **N2** upstream item
"short designer addendum generalising §E text rules to workspaces/dialogs". **Mode** DESIGN_PROTOTYPE — documentation only; no source, test,
build, capture or native input was produced. **Status** addendum to `R3-N1-COMPACT-INSPECTOR-MEMO-SHEET.md` §E (DESIGN-01) and
`R3-N1-SHEET-REVISION-02.md` (DESIGN-02). §E keeps jurisdiction over the two rails, the band, the memo sheet and the compact lane inspector;
**this file governs everything else the player can read** — the UI-Toolkit workspaces and the IMGUI System-Menu dialogs.

**Labels.** `[NAT]` = read from Unity source (worktree `…-Playability-Interaction Unity`, READ ONLY) and evaluated by hand — a *paper* reading of
committed code, never a runtime observation. `[R3]` = the R3 hybrid archive laws already selected. `[REC]` = recommendation. Nothing here is a
measurement of the revised design; every number is arithmetic the N4–N6 writers must re-measure with the styles that actually draw.

**Constants reused** (§A.4, `[NAT]`): `m` = `StudioTextSizePreference.Multiplier` (1 / 1.5 / 2); `s` = `StudioLegacyUiMetrics.CurrentScale` = **1**
at both target viewports; `scale` (Toolkit) = `Screen.height / panelRoot.worldBound.height`; workspace top band = **94 / 166 / 190** — see §2.

## 1. Which surfaces this governs, and who owns each

| Family | Surfaces | Unity owner files (N-phase) |
|---|---|---|
| **Film journey (N4)** | development card, production workspace + remedies, production entry card, casting workspace + compare/greenlight/review partials, release-result workspace, screenplay inspection | `StudioDevelopmentCardHud`, `StudioDevelopmentPresentation`, `StudioProductionWorkspace{,.Navigation,.Remedies}`, `StudioProductionEntryCard`, `StudioCastingWorkspace{,.CompareNavigation,.DisplayedGreenlight,.ReviewAcknowledgement}`, `StudioReleaseResultWorkspace` |
| **People / build / lab (N5)** | profile (incl. the contract-review sheet), roster, person & casting inspector cards, talent-market controls, build workspace + placement, laboratory | `StudioProfileWorkspace`, `StudioRosterWorkspace`, `StudioPersonInspectorCard`, `StudioCastingInspectorCard`, `StudioTalentMarketControls`, `StudioPeopleWorkspaceLayout`, `StudioBuildWorkspace`, `StudioBuildCommandHud`, `StudioBuildPlacementDriver`, `StudioLaboratoryWorkspace` |
| **Records / menu (N6)** | finance + chart + consequence card, industry, history, System Menu and its campaigns / status / leave / text-size dialogs | `StudioFinanceWorkspace{,.Extensions}`, `StudioFinanceChart`, `StudioFinancialConsequenceCard`, `StudioIndustryWorkspace`, `StudioHistoryWorkspace{,Context,Contracts}`, `StudioSystemMenuHud{,.Campaigns,.CampaignStatus,.CampaignStatusBand,.CampaignLeave,.TextSize}` |
| **Shared (N2, builds these)** | tokens, type scale, scroll ownership, registry | `StudioUiTokens.uss`, `StudioUiTokens`, `StudioPeopleWorkspaceLayout`, `StudioWorkspaceHost`, `StudioUiElementRegistry` |

The System Menu family is **IMGUI**, not UI Toolkit `[NAT]`. Every rule below therefore states its IMGUI form (`Mathf.Max(24f * scale, …)`
floors, `CalcHeight` measurement) as well as its USS form; a rule that cannot be expressed in both is marked as such.

## 2. The six geometry laws, generalised

**W1 — Type scale is one law, in one place.** `StudioPeopleWorkspaceLayout.ScaleText` already is that law `[NAT]`:
`size = max(authored, minimumPixels / scale) × m`. Keep it. Two `[REC]` deltas: (a) the rendered floor is currently **14 px** for casting,
production, history, release-result and the entry card and **0 px** for profile, roster, the inspector card and the laboratory `[NAT]` — publish
one named constant (XAG 101 target: **18 screen px**) and pass it everywhere, so no workspace has a lower rendered floor than another;
(b) the floor is stricter at 1280x720 than a proportional reading would be — the writer must confirm at 1280x720 / 100 % that raising it breaks
no measured row before adopting it. **Never** scale type by anything but `m`; **never** shrink a face to make a row fit (§E rule 1).

**W2 — Chrome follows the viewport; type, controls and hit targets follow the text preference.** REVISION-02's one new law, unchanged:
paddings, gaps, keylines and separator widths use `·s` / `scale`; font sizes, control min-heights and touch targets use `·m`. Fixed panel widths
are lawful **only** because content wraps, stacks and scrolls inside them.

**W3 — Minimum hit height.** Toolkit: `--ps-control-min-height` is a **fixed 44px** today `[NAT]` and does not follow the preference — at 200 %
an inline 36 px face sits in a 44 px box with no room for padding. `[REC]` redeclare it under the two shared classes that already exist and are
currently used by exactly one Finance dropdown rule `[NAT]`: `.ps-shared-text-150 { --ps-control-min-height: 66px }`,
`.ps-shared-text-200 { --ps-control-min-height: 88px }`. IMGUI dialogs keep the shipped floors: `24·s` minimum box dimension and `34·m` button
hit height (**34 / 51 / 68**). A control never falls below its floor; it grows.

**W4 — Body scroll ownership.** Exactly one scrolling body per surface owns the overflow; headers, footers and pinned decisions never scroll.
`StudioPeopleWorkspaceLayout.ConstrainScroll` is the shipped helper and is already used by casting, finance, history, industry, laboratory,
production, profile (including both nested contract scrolls), release-result and roster `[NAT]` — **retain, with evidence**. `StudioBuildWorkspace`
creates `ScrollView`s without it `[NAT]` — one named gap for N5. `horizontalScrollerVisibility` stays `Hidden` `[NAT]`: horizontal overflow is a
defect, wrapping is the remedy. A nested scroll is lawful only where the shipped contract-review pattern already uses one (a bounded explanation
that must not push Confirm/Cancel off-screen); a nested scroll may never be the only route to a cost, a refusal or a decision control.

**W5 — Header / footer clamp against the ACTUAL rect (the REVISION-02 §R1 pattern, generalised).** Every workspace and dialog computes
`header + body + footer` **from the final rect, never as an unbounded content-sized block**:
`body = rect.height − header − footer`, `bodyMin = 3 × 18·m + 12·s = 66 / 93 / 120`; the title clamps down a ladder (`N` = 3 / 2 / 1 header lines)
and, at `N = 0`, the **complete** title becomes the first block of the scrolling body. Every action rect is derived after the clamp and published
only if the final rect contains it; a frame that cannot satisfy the clamp publishes **no** rect rather than a negative one.
Top band `[NAT]`: `StudioWorkspaceHost.ApplySharedTextSize` already sets `surface.style.top = max(90 | 110 industry, (occupiedBottom + 12·s)/scale)`
= **94 / 166 / 190**, i.e. workspaces already share the lane's `T` by construction — **retain, with evidence**. Bottom is the gap: only the profile
hard-codes `28 / 170` `[REC]` → give every workspace the same `bottom = 12·s` floor plus a measured footer, and clamp against the receipt rect the
same way the production entry card already does.

**W6 — Opaque backing and focus.** The full body rect (viewport **and** scrollbar gutter) is filled with a **full-alpha** plate drawn before the
scroll view, so no lot pixel reads through mid-scroll (REVISION-02 §R5). `--ps-color-surface` is already 0.97 `[NAT]` — raise the panel plate to
1.0 where it abuts a scrolling body. **Focus, selection and attention are three different things** `[R3]` and must stay distinguishable at all
three sizes; today `.focus-visible` (2 px brass border) and `.selected` (3 px brass left border) are the **same hue** `[NAT]` — `[REC]` make the
focus ring the blue `StudioUiTokens.Focus` at `3·s`, keep selection brass, keep attention the amber mark **plus a word**. Colour alone never
carries "decision needed", "waiting" or "refused".

## 3. Per element class — 100 / 150 / 200 %

| Element class | 100 % | 150 % | 200 % | Owner |
|---|---|---|---|---|
| **Workspace title** | one line, 32 px authored, wraps | wraps to 2, header grows | wraps; clamps down the W5 ladder, complete title moves into the body | per-surface root + W5 |
| **Section header** | own row, wraps | wraps | wraps; sticky only if it does not steal `bodyMin` | per-surface, `.meta`/section style |
| **Label / value pair** | label and value side by side | side by side while the value column is ≥ 10 characters wide | **stack: label own row, value own row, full width** | `StudioProfileWorkspace`, `StudioFinanceWorkspace`, `StudioIndustryWorkspace`, `StudioHistoryWorkspace` |
| **Table row** (roster, history, finance ledger) | columns as authored | narrowest column wraps first; row height grows from measurement | **row becomes a stacked record**: each column a labelled line, full width | `StudioRosterWorkspace`, `StudioHistoryWorkspace{,Contracts}`, `StudioFinanceWorkspace.Extensions` |
| **Button row** | one row | one row while measured widths fit | **each action its own full-width row**, order preserved | every surface; Toolkit `flex-wrap: wrap` + W3 |
| **Long copy** (contract terms, laboratory copy, help) | wraps, scrolls with the body | wraps | wraps; never truncated, never a "…" with no full rendering | `StudioLaboratoryWorkspace`, `StudioProfileWorkspace` contract sheet |
| **Refusal / cost / reason strip** | wraps, own block, adjacent to the control it refuses | wraps | wraps, own block; if it must scroll it scrolls **with** its control in view | all — see §4 invariant (3) |
| **Dialog buttons** (campaigns, leave, text size) | one row, right-aligned, confirm outermost | one row if measured; else own rows | **own rows**, destructive action separated by a full gap and never the focus default | `StudioSystemMenuHud.{Campaigns,CampaignLeave,TextSize}` |
| **Chart / figure** | drawn at authored size | axis labels grow, figure keeps its box | figure keeps its box; **the same numbers exist as a labelled text list** below it | `StudioFinanceChart`, `StudioFinancialConsequenceCard` |
| **Empty / unknown state** | one sentence + the lawful next control | wraps | wraps; the sentence is never replaced by an icon | all; C6 "UNKNOWN STAGE" stays the explicit word |
| **Status / period chip** | full sentence | may wrap to 2 lines inside its floor | may abbreviate **only** with the complete sentence published as the element's registry text | `StudioUiElementRegistry` + the abbreviating surface |

## 4. The invariants (these never yield)

1. **Never tooltip-only.** Every truncated or abbreviated string has a non-hover, keyboard-reachable complete rendering — in the body, in an
   inspector header, or as the element's published registry text. A tooltip is a convenience, never the only copy.
2. **Never shrink.** A cost, a refusal reason, a waiting cause, a period label or a `Back` label is never reduced below the W1 floor to fit.
   The remedies, in order: wrap → stack → grow the row → scroll the body → abbreviate **with** the complete text published. Then stop and report.
3. **Never clip a cause.** A `Waiting · <cause>`, a refusal reason and the cost of a commitment are readable in full at every cell, with the
   control they belong to visible at the same time. This is the R3 regression that was repaired once already `[R3]`.
4. **Never rebuild the composition to escape a text size.** Employees left, hybrid picture cards right, operable lot; no surface may switch to a
   different form at one text size to dodge a measurement — if a cell cannot satisfy the W5 assertion, it is **reported**, not silently re-formed.
5. **Never compress rows into clipping and never force symmetry.** Panels may differ in width; rows may differ in height.

## 5. Acceptance checks these rules imply (for the N4–N6 writers and the test author)

* EditMode: one contract per law per surface — W3 floors at 100/150/200 %; W4 single-owner scroll (and Build's gap closed); W5 `header + bodyMin +
  footer ≤ rect.height` asserted at both viewports × three sizes, plus "no published action rect outside the final rect".
* Rendered PlayMode 1280x720 and 1440x900 × 100/150/200 %, per surface, including one refusal state, one waiting state and one long-title record.
* Glyph-height check against the XAG 101 target on the captures; opaque-backing capture taken **mid-scroll** over a bright lot region.
* Focus-vs-selection distinguishability captured at 200 %, not merely asserted in code.

## 6. Defects found while deriving this (paper, `[NAT]` — hand to the N2/N5 writers)

1. `.focus-visible` and `.selected` are both brass in `StudioUiTokens.uss` — focus and selection are not visually distinct (W6).
2. `--ps-control-min-height` is a fixed 44 px that ignores the text preference (W3).
3. `ps-shared-text-150` / `ps-shared-text-200` are toggled on the panel root by `StudioWorkspaceHost` but are read by exactly one rule in
   `StudioFinanceWorkspace.uss` — the shared responsive hook exists and is unused (W1/W3 land here).
4. `StudioBuildWorkspace` builds `ScrollView`s without `ConstrainScroll`, so it does not share the scroll-ownership law (W4).
5. The rendered-text floor passed to `ScaleText` differs per surface (14 px / 0 px) with no stated reason (W1).

## 7. Evidence limits

Paper only. No capture, no runtime measurement, no native input. Every per-cell number above is inherited from DESIGN-01 §A.4 / REVISION-02 and
re-used, not re-derived from a render. The six defects in §6 are readings of committed source, not observed failures. Nothing here changes the
hybrid selection, the rails, the band, the memo sheet, the lane inspector, `MinimumLot`, route preservation or any G-number.
