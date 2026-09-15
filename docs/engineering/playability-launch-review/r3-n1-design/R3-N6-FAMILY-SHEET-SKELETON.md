# R3-N6 family sheet — SKELETON (finance, industry, records, menu / campaigns / settings / help shells) · written by R3-N2-DESIGN-03

**Skeleton only.** Headings, the state list, the references. Every `TODO(N6)` is an in-phase decision by the N6 designer, labelled
`[REC]` / `[NAT]` / `[R3]` and made against rendered captures.

**Scope (plan N6 row).** `StudioFinanceWorkspace{,.Extensions}`, `StudioFinanceChart`, `StudioFinancialConsequenceCard`,
`StudioIndustryWorkspace`, `StudioHistoryWorkspace{,Context,Contracts}`,
`StudioSystemMenuHud{,.Campaigns,.CampaignStatus,.CampaignStatusBand,.CampaignLeave,.TextSize}` (IMGUI — see addendum §1).

**Must read first.** `R3-N2-TEXT-RULES-ADDENDUM.md` §3 (label/value pair, table row, chart/figure, dialog buttons) and §2 W3/W5 for the
IMGUI floors; `R3-N1-…-MEMO-SHEET.md` §E.3 (never shrink, never clip a cause), §F.3 (the menu owns input while open);
the plan's N6 row (period/estimate/unknown-vs-zero and public-vs-private are this phase's two designer questions).

## 0. Executive summary — disposition per surface
TODO(N6). Redesign / refine / retain-with-evidence for each surface, with reasons.

## 1. The two disclosure questions this family exists to settle
TODO(N6). (a) **Period, estimate, unknown and zero are four different things** — one visual and verbal law for each, applied identically in
finance, industry and history. (b) **Public vs private** — what the studio may know about itself versus about the industry, and how the UI
marks the difference without implying a simulation that does not exist.

## 2. States every section must cover (state × 1280x720 / 1440x900 × 100 / 150 / 200 %)

| # | State | Surface | Must show |
|---|---|---|---|
| R1 | **Figure known, actual** | finance, history | the number, its period, its unit |
| R2 | **Figure is an estimate** | finance, consequence card | that it is an estimate, and of what |
| R3 | **Figure unknown** (not zero) | finance, industry | the explicit word — never a `0`, never a blank |
| R4 | **Figure is genuinely zero** | finance | zero, distinguishable from R3 at a glance and in words |
| R5 | **Empty period / no records yet** | history, finance | the sentence and the period it covers |
| R6 | **Long ledger** | finance extensions, history | table row → stacked record at 200 % (addendum §3) |
| R7 | **Chart present** | `StudioFinanceChart` | the same values as labelled text beneath the figure |
| R8 | **Consequence card open** | `StudioFinancialConsequenceCard` | the cost, the cause, the lawful acknowledgement |
| R9 | **Industry: public fact** | industry | its source and its period |
| R10 | **Menu open** | System Menu | modal input ownership; Escape closes one layer |
| R11 | **Campaign list: save / load / Save-As** | `.Campaigns` | identity, date, and the exact refusal when one is unlawful |
| R12 | **Leave-campaign confirm** | `.CampaignLeave` | what is lost, what is kept; destructive never the focus default |
| R13 | **Text-size dialog** | `.TextSize` | the setting applies live and survives the dialog |
| R14 | **Campaign status band** | `.CampaignStatus{,Band}` | the current fact, wrapped, never clipped |

TODO(N6): per row, one rendered cell reference and the per-viewport reflow.

## 3. Settings and the help shell
TODO(N6). Which settings exist, where each lives, and the 3A contextual-help surface per screen — explanations on demand, no tutorial,
no new auto-pause. Help copy is written here, not improvised by the writer.

## 4. Copy — action, refusal, help, and money
TODO(N6). Backlot language; money always with period and unit; refusal = why + route; "unknown" said in words. One copy table.

## 5. Keyboard, focus and dialog behaviour
TODO(N6). Dialog focus order, Escape ladder, destructive-action separation, and the IMGUI `34·m` button floor.

## 6. Implementation routing, provenance, evidence limits
TODO(N6). Number → owner file; commits/hashes; paper-vs-rendered stated honestly; the campaign Save-As/leave regressions named as gates.
