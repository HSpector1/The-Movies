# R3 full UI/UX overhaul — bounded execution plan (phases N2–N9) · published 2026-09-15 by the Fable coordinator (PM)

Authority: Owner directive of 2026-09-15 (three-week autonomous window). Definition of "the full selected R3 overhaul": Owner selection
`3aa4bad9:docs/operations/UIUX-R3-HYBRID-OWNER-SELECTION.md` §1 (R3 HYBRID cards) + Owner clarification
`f2921730:docs/operations/UIUX-WHOLE-GAME-OVERHAUL-OWNER-CLARIFICATION.md` (§1 full overhaul, §2 eight coverage domains and the
"every player-facing surface gets an explicit disposition" rule, §3 interface art in scope, §5 completion conditions, §8 selections
1A desktop-first / 2B optional lawful drag / 3A contextual help only / 4B selective attention with retrievable outcomes) + Current Ops
execution order `06a852ac:…/04-R3-HYBRID-EXECUTION-ORDER.md` §4/§6/§7 and advisory reconciliation `05-…` §2–§5 (XAG 101 rendered-text
target; four-stage staging). Binding = those selections. NOT binding = Opus R2 research superseded by RECONCILIATION-01 (R3-2 withdrawn;
R3-3/4/8/9/10 optional). No P13B mechanics inside R3.

## Team shape and rules (unchanged)
One production writer per repo (unity-ui / sim-core), independent test-author, uiux-designer for sheets, contract-auditor read-only for
legality inventories, coordinator = integration + native-input owner; ≤ 2 specialists concurrently; Opus or lower; no Workflow tool.
Every phase: plan (this file's section) → implementation → independent tests → rendered PlayMode (Editor GameView) → record in the
handoff → push. Native proof is labelled separately and only when the guard admits (unattended runs authorized by the directive).

## Phases (order, scope, dependencies, acceptance, budget)
| Phase | Scope (owners) | Upstream | Acceptance checks | Budget cap/res (h) | Native needed to build? |
|---|---|---|---|---|---|
| **N1 close-out** | Runs A/B on Build50 (prepared scripts), K9 record; fixes for any native defect found | preflight PASS 20:10Z | native matrix rows PASS/FAIL per defect; captures in the review folder | 0 / 1.5 | yes (guard-admitted) |
| **N2 responsive/text close-out + shared components** | Unity: `StudioPeopleRailHud`, `StudioProductionRailHud`, `StudioProductionRailContracts` (R3.2 list floors; R3.3 abbreviation yield then 2-row tab-strip cap), `StudioLaneInspectorHud` (R1.5 "More actions ▸"), `StudioHud`, `StudioBuildCommandHud`, `StudioSystemMenuHud.*`, `StudioUiTokens`, `StudioTextSizePreference`; extract header-row / plate / keyline / measured-action-zone laws into shared helpers for workspaces | REVISION-02 R1.5/R3.2/R3.3 exist; short designer addendum generalising §E text rules to workspaces/dialogs | EditMode contracts per law; rendered PlayMode 1280×720 + 1440×900 × 100/150/200 %; glyph-height check vs XAG 101 (18 px @1080p) on captures; TS suite untouched | 6 / 3.5 | no |
| **N3 visual/art standard** | fonts (system stack + fallback/atlas tests), icon set, six-person portrait proof (rendered capture via `StudioApplicantPortraitCamera`), six stage sprites; designer asset sheet + PROVENANCE | C1/C2 dispositions below | EditMode font/atlas/fallback tests; rendered captures at rail + dossier sizes; PROVENANCE hashes; honest finished-vs-remaining art statement | 6 / 2 | no |
| **N4 film-journey family** (sheet filled: `R3-N4-FILM-JOURNEY-FAMILY-SHEET.md` 95ec9a3d — dispositions F1 refine, F2 redesign footer only, F3/F5 retain-with-evidence, F4 refine, F6 geometry; PM decision on the one delta: ADOPT `attention` on `StudioDevelopmentProjectSnapshot` reusing the casting enum as a TS read-model delta (sim-core) with schema/DTO regen and a paired seal — no gameplay change; the 3-action fixture is a test-author item before the rendered pass) | `StudioDevelopmentCardHud`, `StudioDevelopmentPresentation`, `StudioProductionWorkspace(+Navigation,+Remedies)`, `StudioProductionEntryCard`, `StudioCastingWorkspace(+partials)`, `StudioReleaseResultWorkspace`, screenplay inspection route; TS read-only unless a wait-cause/attention field is absent (one exact delta) | N2 components; designer family sheet; a fixture with a genuine 3-action record | EditMode per-state contracts; rendered PlayMode available/occupied/waiting/actionable/missing/stale; TS command-owner refusal tests; bridge-contract check + paired seal if any DTO moves | 10 / 3 | no |
| **N5 people/casting/contracts + build/lot tools + laboratory** (sheet filled: `R3-N5-PEOPLE-BUILD-LAB-FAMILY-SHEET.md` 4d041fb7 — 10 dispositions; PM decision on delta D1: ADOPT `affordable` + `refusalReason` on `StudioContractOfferSnapshot` as a TS read-model delta (sim-core) with schema/DTO regen and a paired seal, batched with N4's delta; a same-full-name fixture is a test-author dependency; first implementation items: `bottom = 12·s` law, `personInspectorCard` F10 clearance, Build preview footer) | `StudioProfileWorkspace`, `StudioRosterWorkspace`, `StudioPersonInspectorCard`, `StudioCastingInspectorCard`, `StudioTalentMarketControls`, `StudioPeopleWorkspaceLayout`; `StudioBuildWorkspace`, `StudioBuildCommandHud`, `StudioBuildPlacementDriver`, `StudioLaboratoryWorkspace` | N3 portrait standard; N2 | EditMode identity/duplicate-name/employment-vs-assignment; rendered six cells; invalid placement / cancel-before-commit / occupancy; Laboratory copy law unchanged | 8 / 2.5 | no |
| **N6 finance/industry/records + menu/campaigns/settings/help shells** (sheet filled: `R3-N6-FINANCE-RECORDS-MENU-FAMILY-SHEET.md` 0ad64fa6 — 10 dispositions; PM decisions: ADOPT the finance `attention` route delta (`{id,message,route}` replacing `string[]`) as a TS read-model delta batched with N4/N5; text-size persistence = Unity-local client preference store (no wire); `operationsEventsProjection` stays N7; measured findings: IMGUI campaign rows 44→53 px vs `34·m`, MENU chip fixed 96×40, ~27 % of the campaign menu below the fold at 1280×720/200 %, destructive-confirm registered before cancel in `DrawCampaignDialog`) | `StudioFinanceWorkspace(+Extensions)`, `StudioFinanceChart`, `StudioFinancialConsequenceCard`, `StudioIndustryWorkspace`, `StudioHistoryWorkspace(+Context,+Contracts)`, `StudioSystemMenuHud.{Campaigns,CampaignStatus,CampaignStatusBand,CampaignLeave,TextSize}` | N2; designer sheets for period/estimate/unknown-vs-zero, public-vs-private | EditMode disclosure/period contracts; rendered; campaign Save-As/leave regressions green | 7 / 2 | no |
| **N7 3A contextual help + 4B attention/retrievable history** (amended: one read-only `operationsEventsProjection` over `state.studioEvents` closes most retrievability gaps — queue admitted, phase entered, scenery arrived, reservation granted/released, wrapped/premiere/release/construction/set events — publish it; contract-lifecycle rows and casting-review completion are the two genuine sim dependencies, never an invented journal) | new Unity help/tooltip owner + per-screen copy; attention cues from `BridgePeopleAttentionSnapshot`/`StudioHistorySnapshot`; outcomes without a retrievable source become named data dependencies (never an invented journal) | N4–N6; TS read-model audit (contract-auditor) | EditMode help-availability per screen; rendered essential routes with help only, no tutorial; "badge clears, history persists" test; TS tests for any new read-only projection | 8 / 2 | no |
| **N8 2B optional lawful drag** | legality inventory (contract-auditor) then only routes with an existing lawful command (candidate→comparison slot, script→stage schedule, catalogue→lot placement); drop-time recheck reuses `StillDisplayed()`; every drag action completable without dragging | N4/N5; inventory | EditMode legality/preview/stale-drop; rendered synthetic drag; TS refusal tests; ordinary-route regressions | 8 / 3 | no (native pointer pass owed) |
| **N9 integrated verification + delivery** | product critiques 2 and 3, C1–C5 correctness, matched Save/load p95 ≤ 1.05× P13A control (3 warm-ups + 20 pairs), ≥ 20-rep ACK p95 ≤ 100 ms incl. Save overlap, asset integrity + paired packaging, art-coverage statement, playtest list | N2–N8 | full native pass; Owner verdict DEFERRED | 0 / 12 | yes |
Totals N2–N9 ≈ 53 h capability / 30 h reserve versus the C6/K6 remainder (≈ 44.7 h / ≈ 11.4 h, last 6 h protected). Under the directive the
caps are planning checkpoints: each phase record restates actual usage; overruns are reported, never hidden.

## Open product choices — PM dispositions for this window (isolated; Owner may overturn on return)
- C1 portrait standard → **(b)** rendered head-and-shoulders captures from the in-game rig via `StudioApplicantPortraitCamera`; fall back to
  labelled monograms where a rig is missing; population coverage stated honestly. No paid assets.
- C2 fonts → system-font stack with measured fallback/atlas tests against XAG 101; a licensed face is a later Owner choice.
- C3 card title size → technical: raise to the measured value that clears the 18 px-at-1080p rendered body-height floor; re-run R4's stack
  predicate.
- C4 1280×720/200 % pictures-list shortfall → accept the ≈ 10 px scroll cost, measure natively; never raise the minimum viewport or disable
  200 %.
- C5 drag routes → AMENDED 2026-09-15 by the legality inventory (`N7-N8-LEGALITY-AND-RETRIEVABILITY-INVENTORY.md`): lawful today are
  set blueprint → stage (`commissionSet`), catalogue item → lot placement (`placeFacility`, per-cell preview), scientist → Research
  Laboratory (`assignResearchScientist`, enumerated intents), casting candidate → comparison slot (client view state) and the pre-greenlight
  role-slot / screen-test slate drafts; NOT lawful (named dependencies): script → stage as a drag target, facility move, other person →
  facility, recasting a live picture; writer → screenplay-in-draft has a command but no bridge intent (named dependency). Build uses
  `QuoteFresh` + TS commit revalidation instead of `StillDisplayed()` — N8 acceptance names both.
- C6 "UNKNOWN STAGE" → keep the explicit unknown label (never "Writing"); unreachable in a paired build.
- C8 (added 2026-09-15, N2) rendered-text floor vs list floors → the XAG 101 18-px rendered floor (Current Ops-adopted target) applied to the
  rails' meta/section/body faces collapses the R3.2 list viewports at 1280×720 on paper (pictures 27 px, employees 19 px at 200 %). Ruling:
  the floor law stays wired but NEUTRAL for those three faces until N3 measures real rendered heights at 1280×720; the card title keeps its
  18-px floor (C3). Options for N3: (a) accept a 16-px floor at the 1280 class with an explicit XAG deviation; (b) yield chrome further (tab
  strip → 1 row, footer abbreviations) to buy list height; (c) treat 1280×720 as a "compact" class with its own type scale. Recommendation:
  measure first, then (b) before (a); never (c) without an Owner ruling. Handed-on N2 tail items: the lane inspector faces are double-scaled
  (fixing it moves the natively confirmed F14 geometry — schedule with the N4 overlay work), and the pictures footer refusal line can clip.
- C9 (added 2026-09-16, N2) the 1280×720/200 % compact overlay body viewport → after the overlay font fix and the body-band law, the
  envelope (310 px) binds: header 92 (0 title lines) + footer 94 + band 132 = 318 > 310, so the body viewport is 112 px against bodyMin 120
  (8 px short) while every route stays reachable (More-actions disclosure, reveal-on-focus, scroll). Ruling: DECLARED limitation for this
  window — not a full-screen fallback, not hidden; the remaining lever is chrome (pad 6·s → 4·s, +4 px) which N3's measured typography pass
  may take; the Owner may later choose a compact-class type scale (C8 option c). Also open from N2: `StudioPeopleRailHud.ValidateFocus`
  nulls instead of parking when a foreign ring owner holds the target (asymmetry with the pictures rail) — N2 tail item.
- C7 authorization at the revised budget → the directive delegates settled technically-ready work: proceed, report actuals each phase.

## Budget checkpoint — 2026-09-16 02:20Z (revised stage budgets, published per the directive)
Actuals to date in this window: N1 close-out + N2 ≈ 4.7 h capability / 4.3 h reserve. Whole-program ledger (`budget-ledger.json`):
capability remaining ≈ 40.0 h; reserve remaining ≈ 7.2 h of which the last 6 h are protected → ≈ 1.2 h unprotected reserve. The directive
makes the caps planning checkpoints, not stops, and forbids hiding overruns: from here every phase's verification/delivery time is charged
and reported against the reserve as an **overrun beyond the unprotected balance**, the protected 6 h are never drawn, and the Owner
decides on return whether the program reserve is re-based. Revised stage budgets (capability / verification, hours): N3 5 / 2.5 ·
N4 9 / 3 · N5 7 / 2.5 · N6 6 / 2 · N7 7 / 2 · N8 7 / 3 · N9 0 / 10 (all N9 is verification) — total ≈ 41 / 25. Capability fits the
remaining 40 h only if N7/N8 stay lean; verification cannot fit 1.2 h and will be reported as overrun phase by phase. Efficiency measures
adopted now: one rendered full-suite run per phase (class runs for iteration), one build/seal/admission per phase, native runs only on the
phase's changed routes, no harness-only test churn (harness defects are fixed once with the sibling scaffold), TS deltas batched per phase.

## Recovery points
Every phase ends with: Unity + TS commits pushed on the working branches; a handoff record (K-numbered) with pinned links; evidence indexed
on the private review branch; `CONTINUATION-STATE.md` rewritten; `OWNER-PLAYTEST-LIST.md` grown. Merge to main: coordinator's call after
independent review + gates for the paired candidate (Owner addendum), never by force.
