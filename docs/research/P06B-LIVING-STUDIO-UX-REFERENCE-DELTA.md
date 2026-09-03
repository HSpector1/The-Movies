# P06B — Living Studio UX Reference Delta (§6/§8)

Curated from the controlling authorities (P06 design @8ccd8ac, Visual Direction Package 01 @728781d,
UX north star @39cdef7, P04 lessons, P06A handoff/findings, scope law) + a full Unity/TS code-and-data
inventory. Full machine synthesis: `P06B-AUTHORITIES-SYNTHESIS.md`. Baseline audit:
`docs/ux/P06B-BASELINE-UX-AUDIT.md`.

## Lead decision — how P06B uses the Visual Direction Package

The Visual Direction Package 01 specifies a **dark brass/ink** surface theme. It is an explicit
**REFERENCE CANDIDATE pending Owner acceptance**, and §21/§28-#30 forbid a **broad reskin**. Decision:

- **Adopt its STRUCTURE** on the surfaces P06B already touches for functional reasons (rail, HUD,
  building cards, and the memo where guidance is de-emphasized): the typography ladder, spacing
  rhythm, the semantic-state model (**hue + icon/shape + text — never colour alone, must survive
  greyscale**), lifecycle iconography (reference shapes, no assets), the focus-visible ring, minimum
  target sizes, one-primary-per-surface, and **forward-action-outranks-Back**.
- **Do NOT** repaint untouched surfaces (casting/production UITK workspaces interiors, development
  card) purely for looks — that is the broad-reskin trap. Keep the accepted **light** surface family
  as the base; introduce depth/hierarchy/brass-accent *within* it on touched surfaces so they become
  a **coherent set** (fixing audit #6 "no shared token system"). A full dark-theme adoption is a
  larger, Owner-acceptance-gated follow-on, noted for the Owner, not done here.

## Tokens (from Visual Direction Package 01 — names are contract-frozen, additive only)

- **Type ladder** (logical px): meta 15 · body 18 · section 22 · title 32 · numeric 30 · display 44
  (≤1/surface) · world 17. Rules: **numeric outranks prose**; warnings ≥18; buttons = body.
- **Spacing:** 6 / 10 / 16 / 24 (section boundary) / 40 (band separation). Every surface reserves a
  bottom margin. Compact row rhythm 60–72px.
- **Semantic states** (greyscale-safe): ink `#EEE8DA` · ink-muted `#B2AA98` · brass/selection
  `#C6A664` (filled shape + bold OR 3–4px left border) · attention `#D6A84E` (`!`-in-circle + word)
  · blocked `#C45C4E` (crossed-square + `WAITING`/`HELD`) · success `#A8C47A` · queue = ink-muted +
  `WILL QUEUE · N WK` · estimated = **dashed rule + word "estimated", never a colour**.
- **Controls:** primary = brass, 48px, **exactly one/surface, always the forward action**; secondary
  = control fill + 1px keyline, 44px; **disabled control must sit adjacent to its reason**; hover =
  +6% lightness, **must not move layout**; **focus = 2px brass ring offset 2px (declared+tested but
  currently NEVER applied — apply it)**; min targets rail/card 32×32 (44 pref), transport 42×38.
- **Lifecycle icons (reference shapes):** Development = folded-corner sheet · Casting = two masks ·
  Production = camera body+lens · Post = film reel · Release = ticket stub (never $) · Locate =
  crosshair (never magnifier). One 2px weight; **every glyph carries text at first use**; the five
  lifecycle glyphs share one silhouette width.

## Code-reality map (edit-planning authority — all presentation is Unity C#)

- Presentation files have **no asmdef** → compile into `Assembly-CSharp`, namespace
  `ProjectStudio.UnitySpike.Presentation`. **Guard tests use reflection on the fully-qualified type
  name + source-text reads** → **renaming a Presentation class/namespace silently breaks tests** (no
  compile error). Keep names stable; run EditMode after every touch.
- Restyle all IMGUI proportionally → `Infrastructure/StudioLegacyUiMetrics.cs` (scale 1× at ≤1720×1045).
- **Movie rail (W2):** `Presentation/StudioProductionRailHud.cs` + `Infrastructure/StudioMovieRailContracts.cs` (Max=6). Guards: `StudioProductionRailTests`, `StudioMovieRailContractsTests`.
- **Top HUD (W1):** `Presentation/StudioLivingTimeHud.cs`. Guard: `StudioLivingTimeTests`.
- **Building cards (W4):** `Presentation/UI/StudioProductionEntryCard.cs`, `StudioCastingInspectorCard.cs` (UITK); world cues `Presentation/StudioPostBuildingPresentation.cs` + `Infrastructure/StudioPostWorldContracts.cs`.
- **Talent/casting (W3):** `Presentation/UI/StudioCastingWorkspace.cs` (UITK, hosted by `StudioWorkspaceHost.cs`).
- Memo (commit dispatch today): `Infrastructure/StudioBridgeClient.cs` OnGUI @1447 (IMGUI, not element-mapped).
- Element map: UITK auto-registers via tree; IMGUI must call `StudioUiElementRegistry.Publish`.

## Data fields the UI may show (verify each against the generated DTO before use)

- **Rail per picture:** `productionOperations[].{productionId, title, operationalState, phase (6 ProductionPhase values), attention, taskStatus, blocker, timeline/weeksRemaining}`. Identity = **productionId only**.
- **HUD:** root `gameWeek`; `treasury.{cash, netWeeklyCash, weeklyBurn?, weeklyPayroll?, runwayWeeks?, runwayInfinite?}`; pause/speed are **client-local** (never sim data). Compose the clock-stopped line from `release.automaticWeekRollEligible` + `nextDecisionKind` + blockers (**no single reason field — compose, don't fabricate**).
- **Release:** `authorityState` (ready-uncommitted/committed), `legalCommit`; committed shows only "releases on the next studio week".

## Hard lines (any breach = STOP & report, or an automatic hostile reject)

- **Engine-authority:** no P06B change touches Core / GameState / SaveFile(V16) / schema / migration /
  economy-TUNING / RNG / production / facility / reservation / release law. **UI/world projection over
  existing authority ONLY.** (Criteria 15, 20, 21.)
- **P07 (criterion 19):** rail + all surfaces are **active-lifecycle only** — no released/theatrical/
  result rows, no critic/box-office/rank/awards/franchise/rival, no per-picture finance on the rail.
  Committed shows only "releases on the next studio week."
- **Do NOT bake date/season/era progression into the HUD** (pre-decides the C2 time-model ruling);
  render `Week N` + the inert `1920` masthead only.
- **Do NOT** roll back shipped surfaces (lot, visual output, economy, the D-16/D-17 accessibility
  suite — 176 tests must stay green, the world-first chain, P06A).
- **Open Owner decisions — do NOT silently resolve:** audience-taste vs cultural drift; genre 6-vs-5;
  concurrency/slot cap (don't imply a cap); **F2** scope ruling; the mis-scoped cash-warning defect
  (don't silently fix — any warning P06B touches must be scoped to its exact picture or labeled
  studio-wide).

## Wave plan (severity · regression traps · P07 flags)

- **W0 visual system:** token ladder + one number/format policy via `StudioLegacyUiMetrics` + each
  `*Hud.OnGUI`; forward-action brass; **token names additive-only; don't rename Presentation classes.**
- **W1 top HUD:** [P1] **fix the narrow-viewport disappearance** (chip height-suppressed by a
  *founding*-sheet threshold that doesn't apply post-founding → executive HUD vanishes at 1280×800);
  keep the founding-time promise. [P2] unmistakable active-speed (filled brass), cash/burn band. **Do
  NOT** add era/date progression; pause/speed are client-local, never sim data.
- **W2 movie rail [PRIMARY]:** [P1] **fix title truncation**; [P2] unified rail container, lifecycle
  icons, six-phase indicator (authoritative `phase`, **never naked %**, freezes + "Held N weeks"),
  time-remaining where authoritative, stronger attention hierarchy. **REGRESSION TRAPS:** exact-ID
  isolation (selected row pinned on refresh, never reorder under pointer, released disappears by exact
  ID — never by title/`projects[0]`/geometry); rail selects/Locates only, **commits nothing**, world
  route stays rail-free. **P07:** active-lifecycle only.
- **W3 talent:** compact persistent Talent entry point (a full left roster rail is a later package —
  scope); preserve the Casting shortage→Find-an-Actor route; disabled Greenlight must name the
  **blocking** term; the two open **ActionsEnabled latch** sites (`StudioCastingWorkspace.cs:2038`,
  `:2199`) re-gate **per frame** (don't remove the term; don't copy the latch into new code). Categories:
  STUDIO-CONTRACTED / FREELANCER / HIRING CANDIDATE / BUSY / UNAVAILABLE (no blur; withhold ETA when null).
- **W4 building cards:** compact card, fixed order, exactly one primary, blocker receipt **adjacent**
  (never detached, never a dash for an absent fact — say "No production assigned"); converge the
  double-surface (entry card + LOT SELECTION panel). **REGRESSION TRAP:** a visible enabled control
  must act or state a reason, never silently return (L-04).
- **W5–W9:** workspace header/Back/CTA/scroll/focus convergence; lot life (already strong); guidance
  de-emphasis after world/card truth is complete; economy **visibility** only (no retune); accessibility
  focus-visible + 1280×800 legibility. F3 (cede commit to a world workspace) optional, aids §25 HID.
