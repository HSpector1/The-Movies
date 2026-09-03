# P06B — Authorities & Inventory Synthesis (full, machine-generated plan-of-record)

> Produced by the P06B authorities+inventory workflow (8 agents). This is the raw synthesis; the
> curated reference delta + lead decisions live in P06B-LIVING-STUDIO-UX-REFERENCE-DELTA.md.

# P06B — Living Studio UI/UX Convergence: Plan of Record

**Synthesis of 7 authority/inventory digests. This is the durable reference a lead executes against.**

**Repo legend** (paths below are relative to one of these two roots):
- `UNITY` = `/Users/bruce/The Movies - P06B Impl Unity` (branch `wip/p06b-living-studio-ux-convergence-01-client`) — **all on-screen presentation lives here (C# / Unity).**
- `TS` = `/Users/bruce/The Movies - P06B Impl TS` (branch `wip/p06b-living-studio-ux-convergence-01-ts`) — engine + bridge + browser projection; **frozen and green**, authority for all data.
- Unity presentation folders: `Assets/Studio/Runtime/Presentation/` (compiles into `Assembly-CSharp`) and `Assets/Studio/Runtime/Infrastructure/` (assembly `Studio.Runtime.Infrastructure`).

**One-line test for any P06B change:** *Does it re-present truth the engine already owns, on the lot, without adding a post-release result, a new mechanic, a rolled-back shipped surface, or a silent answer to an open Owner question?* If any clause fails — **stop and report**, do not fill the gap.

---

# PART 1 — REFERENCE-DELTA + AUTHORITY SUMMARY

## 1. Product law — the one flow (source: `TS:docs/design/CODEX-POST-RELEASE-PACKAGE-06.md` + `-BUILDER-ANNEX.md`)

> wrap frees the Stage → same picture identity auto-transfers to Post → Post capacity + named attendance visible → finishing advances on ONE authoritative clock → **Release Ready** asks for deliberate review → **`Commit <title> to Release`** is a stale-safe commitment → lot acknowledges dispatch → next authoritative week resolves committed pictures through the existing ordered pipeline.

**Release-commitment / hold law (central mechanic):**
- Uncommitted ready pictures **hold at remaining tick 1 forever** (baseline auto-release is REPLACED).
- **Commit advances NO time**; it persists one irreversible authorization. Irreversible in P06A — no cancel/withdraw/second commit. Stale/duplicate commits **fail closed** (never a second commitment/FilmResult/RNG draw/ledger entry/run).
- Only committed ready pictures enter the next-week ID-sorted batch. **Click order changes no release math.**
- **No release-time debit exists** → no insufficient-funds gate; never disable Commit for a fictional release fee.
- Selecting / opening / closing / holding **never** commits or mutates. Only the title-bearing intent commits.

**Exact lifecycle labels (quote verbatim):** `AVAILABLE` (Idle) · `WAITING FOR POST` (wrapped) · `POST-PRODUCTION` / activity `Finishing` (active) · `RELEASE READY` · `COMMITTED TO RELEASE · NEXT STUDIO WEEK` (settled `Committed to Release`) · Released = not an active Post row. HUD scale: `POST: 1 active`. Progress: `2 weeks remaining` / `1 week remaining`; capacity `Post Building · 1 of 1`.

**Prohibited labels (never render):** `Editing`, `Sound mix`, `VFX`, `Final cut 73%`, `Scene 14/23`, `Still shooting` (for a waiter), `Cast in Post`, `Quality improved`, `Release cost`, `Now showing`/critic/audience result at commit.

**Exact button strings:** `Review release` → `Commit <title> to Release` (+ `This cannot be undone.`) · `Hold for now` (mutates nothing) · `Inspect holder` / `Open Post capacity` / `Locate Post` / `Build Post` (only if a legal construction intent is published) · `Open picture` / `Open Post` / `Focus` / `More`. Confirmation repeats title + `releases on the next studio week` + irreversible boundary.

## 2. Visual language tokens (source: `TS:docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01.md` @ `728781dc` — REFERENCE CANDIDATE, pending Owner acceptance; token names contract-frozen, **additive only**)

**Typography** (`--ps-font-*`, one ladder, both stacks; **reflow, never shrink**): meta 15 · body 18 · section 22 · title 32 · numeric 30 *(proposed)* · display 44 *(proposed, replaces orphan 64px IMGUI BigNumber)* · world 17 *(proposed)*. Rules: ≤1 display per surface; numeric outranks prose; warnings are body (never <18 — current `.refusal` at 15px is flagged); buttons are body.

**Spacing** (`--ps-space-*`): 6 / 10 / 16 / 24 (section = boundary between two answers) / 40 *(proposed, major band separation)*. Compact padding `-2` (rhythm 60–72px); expanded `-3` (96–152px). Every surface reserves `-space-3` bottom margin.

**Surfaces** (dark; 7 of 8 already exist as literals): surface `rgba(20,18,15,0.97)` · surface-raised `rgb(27,25,22)` · surface-sunken `rgb(16,15,12)` · surface-selected `rgb(45,39,27)` · surface-band `rgb(24,22,19)` · control `rgb(39,37,34)` · keyline `rgb(60,54,44)` · ink-on-brass `rgb(24,20,14)`. Six surface **types**: Persistent HUD (band, ≤72px occlusion) · Compact world card (≤30%) · Retained workspace (55–65%) · Modal review (+40% scrim) · Project/Person token · Blocker receipt (tinted inset **inside its owner**, never free-floating).

**Color / semantic states — color is NEVER the sole carrier** (every state = hue + icon + shape + text; must survive greyscale): ink `rgb(238,232,218)` · ink-muted `rgb(178,170,152)` · brass/selection `rgb(198,166,100)` (filled shape+bold OR 3–4px left border) · attention `rgb(214,168,78)` (`!` in circle + `NEEDS YOU`) · blocked `rgb(196,92,78)` (crossed-square + `HELD`/`CANNOT…`) · refusal `rgb(206,96,96)` · success `rgb(168,196,122)` *(proposed)* · info `rgb(150,170,180)` *(proposed)* · queue = reuse ink-muted + `WILL QUEUE · N WK` · estimated = **dashed rule + word "estimated," never a color**.

**Controls:** Primary = brass, 48px, **exactly one per surface, always the forward action**. Secondary = control fill + 1px keyline, 44px. Destructive = 1.5px blocked, requires arming. Disabled = `rgb(42,39,35)` + `rgb(110,102,88)` ink, **must sit adjacent to its reason — never ship a mute disabled control**. Armed confirm = blocked fill, second press, states what will happen. Selected role = surface-selected + 4px left brass, 60px. Hover = +6% lightness, **must not move layout**. **Focus = 2px brass ring offset 2px (`.focus-visible` — declared + tested, currently NEVER applied).** Min targets: rail/card 32×32 min (44 preferred), transport 42×38 min, primary 44–48px.

**Iconography (reference shapes, no assets):** Development = folded-corner sheet · Casting = two masks · Production = camera body+lens · Post = film reel · Release = ticket stub (never $) · Locate = crosshair (never magnifier) · Blocked = square+diagonal bar · Queued = three stacked rules · Info = italic `i` in a square (never `?`). One weight (2px @ 24px); **every glyph carries text at first use on a surface**; lifecycle five share one silhouette width.

## 3. North-star principles (source: `TS:docs/ux/P03A3_UX_ACCEPTANCE_AND_UI_NORTH_STAR.md`)

- **World-first, peripheral command.** The lot is the default surface and stays the largest thing (~67% width on 1600px; no panel over the lot at rest). Player feels *"I run this place,"* never *"I run the UI."*
- **Default lot answers at a glance:** top strip = when / how-fast / how-much-money; world = where work happens; right edge = Production Rail lifecycle tracker; left edge (later) = important people (no babysitting chores).
- **Compact edge UI + progressive disclosure** via a predictable `[i]` / `Open details`. Retained workspaces only when the decision earns them; open workspaces suppress competing rails but **keep the lot edge visible/lit** (the ≈63%-cover/blur pattern is the named anti-pattern).
- **One interaction grammar, predictable Back:** click = select/open; `[i]`/Details = deeper workspace; **Locate = the only camera move**; **Back restores the exact origin** (position/zoom/mode/selected stable ID/scroll/focus) via one `StudioNavigationOrigin` stack. **Home ≠ Back.** No single click may select + move camera + commit gameplay. Camera uses **unscaled** time; pan speed scales with zoom height, never with sim 1×/2×/4×.
- **Forward action outranks Back** (today's build inverts this — Back is brass). **One Back, never two.** Information order fixed per component, never varies by state. Every component names its authority source — **omit a row rather than invent a number**. One component, three densities (rail row / token / full card). **Rails never commit gameplay — they select/Locate/open only.**
- **Legibility floor** (validate at real fullscreen): body 16–18 · meta 14–16 · section 20–24 · title 28–34 · CTA label 17–20 · **min control height 40–44px (NOT ≥44px — L-17)** · target ≥40×40 · line-height 1.25–1.4×. When room is short: grow → reflow → one contained scroll region → defer detail → **never shrink type**.

## 4. P06A current state (source: `TS:docs/campaigns/P06-FIVE-DAY-AUTONOMOUS-HANDOFF.md` + `CODEX-P06A-*`)

**Terminal state: KEEP CANDIDATE — OWNER ACCEPTANCE PENDING.** Impl tips TS `465ab45` / Unity `7d6d974`; sealed exe `aabc41f8…`. Floors green: TS 4903/0, Unity EditMode 730/730, CF-09 two-repo consumer verify pinned. Six-scene Visual Oracle passes (63 assertions, `visualReviewStatus: pending` — human sign-off owed). Real-Owner-profile journey 25/25. Hostile review = ACCEPT (0 blocking). **No P07 gameplay implemented.**

**What shipped, wave-mapped:** W0 release-authority design freeze (docs). W1 TS release authority (`TS:src/core/releaseAuthority.ts`, save V15→V16, uncommitted holds at tick 1). W2 projection 13→14 (`release-committed` 15th operationalState, `commitPictureToRelease` intent; adapter maps releaseReady + committed → `'post'`, never `'theater'`). W3/W4 Post world owner + cues (Unity). W5 Release workspace contract + Advance-one-week button. **LSCL movie rail** (the only genuinely new surface): full-lifecycle rows keyed by exact productionId, Ready and Committed distinct chips.

**Live threads P06B must decide:** **F2** (first-film card says "shooting" for a wrapped-waiting picture — see §5). **F3** (optionally cede the release commit from the workflow memo to a Production/Post world surface — non-blocking observation, `#16` did not fire). **F4** (HID synthetic-input proof owed on an interactive/unlocked GUI session — environmental, not a product defect). Human visual sign-off of the oracle.

## 5. Scope boundaries (source: `TS:CODEX-P06A-READINESS-GATE-00.md`, project `CLAUDE.md`, `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md`, `NEXT-HIGHEST-LEVERAGE.md`)

**P07 hard line — the UI must NOT show/scaffold** (criterion 19 = automatic hostile-review reject): critic/reception scores, box-office/earnings/takings, chart-rank/performance badges, released/theatrical/result rows in the rail (rail is **active-lifecycle only**), awards/franchise/IP economy, rival studios. Committed state shows only `releases on the next studio week`. **Do NOT roll back** the already-shipped standalone chain (Newspaper/ReleaseResult/Autopsy/Film Chronicle) — but do not **extend** it with new reporting.

**Not current scope — do not build/scaffold/TODO/abstract-for:** chemistry · readable memories · production incidents · contract negotiation · scene composition · screenplay generation · SimulationFlags · cultural drift · aging/career progression · onboarding/**tutorial** (enhance guidance legibility, do not scriptify) · LLM integration · dedicated mobile layout (responsive narrow/wide is fine) · a second production clock / UI-owned scheduler / facility ledger · financing/loans/bailouts/hard bankruptcy.

**Engine-authority hard line:** No P06B change may touch Core / GameState / SaveFile(V16) / schema / migration / economy-TUNING / RNG / production / facility / reservation / release law. **UI/world projection over existing authority only.** Criterion 15 (rail becomes gameplay authority), 20 (P05 Casting/Talent/Production regresses), 21 (economy retuned) are rejects.

**Do NOT roll back (shipped by later authority):** the Studio Lot (primary surface) · visual output (no renderer/HDRP/DOTS/global-reskin migration) · the studio economy (ships PARTIAL, **D-17B macro residuals OPEN** — keep HUD truthful, add no fix) · accessibility (D-16/D-17 governed suite, 176 tests, must stay green) · the world-first management chain · P06A itself.

**Open Owner decisions — surfacing them pre-decides them; stop and report:** audience-taste movement vs "cultural drift" (due before C4) · genre vocabulary six-vs-five (C4) · **time model ruling A/B/C (C2) — do NOT bake a date/season/era progression into the HUD** · concurrency/slot cap (do not imply a cap) · D-17B residuals · **F2 scope ruling** · the pre-existing mis-scoped cash-warning defect (do not silently fix; but any warning P06B touches must be scoped to its exact picture or labeled studio-wide).

## 6. Unity code-reality map (source: `UNITY` `git ls-files`; edit-planning authority)

**Two governing facts:** (1) Presentation files have **no asmdef** → they compile into `Assembly-CSharp` (namespace `ProjectStudio.UnitySpike.Presentation`); EditMode tests reach them by **reflection on the fully-qualified type name or source-text read** — **renaming a Presentation class/namespace silently breaks tests** (no compile error). (2) The **element map** is exported by `StudioWorkspaceHost` each Nth frame: UITK elements auto-register via the visual-tree walk (free); IMGUI surfaces register **only** if they call `StudioUiElementRegistry.Publish`.

| Surface | File (under `UNITY:Assets/Studio/Runtime/`) | Kind | Element-map | Guard tests |
|---|---|---|---|---|
| Top HUD / clock | `Presentation/StudioLivingTimeHud.cs` (+ `StudioLivingTime.cs`) | IMGUI | **no** | `StudioLivingTimeTests` (reflection + source-text) |
| Selection receipt band | `Presentation/StudioHud.cs` | IMGUI | no | (geometry consumed by others) |
| Workflow memo (commit dispatch today) | `Infrastructure/StudioBridgeClient.cs` (OnGUI @1447) | IMGUI | no (intentional) | `StudioBridgePlayerWorkflowTests` etc |
| Movie rail | `Presentation/StudioProductionRailHud.cs` (+ `Infrastructure/StudioMovieRailContracts.cs`, `Max=6`) | IMGUI | **partial** (only `rail-locate-casting`) | `StudioProductionRailTests`, `StudioMovieRailContractsTests` |
| System menu | `Presentation/StudioSystemMenuHud.cs` (+ `StudioSystemMenuContracts.cs`) | IMGUI modal | **most registered** | `StudioSystemMenuTests` |
| Development card | `Presentation/StudioDevelopmentCardHud.cs` (+ `StudioDevelopmentPresentation.cs`) | IMGUI | partial (`development-go-to-casting`) | `StudioDevelopmentCardTests` |
| Casting workspace | `Presentation/UI/StudioCastingWorkspace.cs` (+ `…InspectorCard.cs`, `…Context.cs`) | UITK | auto (tree) | `StudioCastingWorkspaceTests`, `…P04A1/P04A2`, casting-domain |
| Production workspace | `Presentation/UI/StudioProductionWorkspace.cs` (+ `…EntryCard.cs`, `Infrastructure/StudioProductionWorkspaceContracts.cs`) | UITK | auto | `StudioProductionWorkspaceTests`, `…ContractsTests` |
| UITK host / PanelSettings / Esc / element-map export | `Presentation/UI/StudioWorkspaceHost.cs` | UITK host | — | `StudioWorkspaceHostTests` (pins tokens `:276–302`, `-unity-text-align` `:314–338`) |
| Post world owner | `Presentation/StudioPostBuildingPresentation.cs` (+ `Infrastructure/StudioPostWorldContracts.cs`, `…PresentationContracts.cs`, `…Registry.cs`) | world | no | `StudioPostPresentationRegistryTests`, `…WorldContractsTests` |
| Release decision contract | `Infrastructure/StudioReleaseContracts.cs` (`ReleaseDecisionState`; **no on-screen HUD consumes it** — only the oracle + memo line) | pure | — | `StudioReleaseContractsTests` |
| Camera / Back control | `Presentation/StudioCameraDirector.cs` | IMGUI overlay | registered (`BackControlElementName`) | `StudioCameraPresentationTests`, `…Recovery` |
| Selection raycast | `Presentation/StudioSelectionManager.cs` | Mono | registered (world rects) | `StudioSelectionSemanticsTests` |
| Lot life (decorative) | `Presentation/StudioLotLifePresentation.cs`, `…ShootingDayLotPresentation.cs`, `…StageDoorCrewPresentation.cs`, `…PublicStreetTraffic.cs` | world | no | — |
| Stage world beats | `Presentation/StudioStageProductionPresentation.cs` (+ `Infrastructure/StudioStagePresentationRegistry.cs`, `…StagePlacardContracts.cs`) | world | — | — |
| Founding / Administration card | `Presentation/StudioFoundingCardHud.cs`, `…FoundingBeaconHud.cs` | IMGUI | no | `StudioFoundingPresentationTests` |
| IMGUI global scale + workflow inset | `Infrastructure/StudioLegacyUiMetrics.cs` (`ScaleFor`/`CurrentScale`, 1× at ≤1720×1045) | pure | — | `StudioLegacyUiMetricsTests` |
| Element-map registry | `Presentation/UI/StudioUiElementRegistry.cs` (`Publish`/`Withdraw`/`Entries`/`GeometryPublishingEnabled`) | static | — | — |

**Cheatsheet:** restyle all IMGUI proportionally → `StudioLegacyUiMetrics.cs`. Any IMGUI HUD → its `OnGUI` (watch reflection/source-text tests). The two real interactive panels → UITK under `Presentation/UI/`, hosted by `StudioWorkspaceHost.cs`. Add to element map → UITK name the element (free); IMGUI call `Publish/Withdraw`. **Two-stage isolation is architecturally impossible today** (`if (onStage.Length > 1) return withheld`); a per-stage presenter replacing the `stage-a` compile-time singleton in `StudioStagePresentationRegistry.cs` is a **prerequisite, not a visual task**.

## 7. Authoritative data fields (source: `UNITY:Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs`)

Root `StudioBridgeSnapshotResponse`: scalar `.gameWeek`, `.treasury`, `.snapshot`. Bundle fan-out: `snapshot.{productions | people | casting | release | releaseResults | development | construction | lot | journeyNotices}`. **If a value is not listed here, it is not in the snapshot — withhold it, do not invent it.**

- **Rail (per picture)** `snapshot.productions.productionOperations[i]`: `.title` · `.productionId`/`.directorId`/`.leadId` · `.phase` (+`.phaseLabel`) · `.operationalState` (15 values incl. `wrapped-waiting-for-post`, `release-ready`, `release-committed`; +`.stateLabel`/`.statusLabel`/`.nextMilestone`) · `.facilityLabel`/`.locationBuildingId`/`.stageBuildingId?`/`.stageFacilityId?` · `.weeksRemaining` (whole-phase) / `.stateWeeksRemaining?` / `.progress01` · `.attention` (8 values) · `.taskStatus?` / `.blocker?{headline,detail,kind}` / `.blockerAnatomy?{…,remedies[]{kind,label,freesInWeeks?}}` · `.companyMembers[]{talentId,name,presentationRole,productionRole,slotIndex}` + `.directorName`/`.leadName` · `.worksiteResolution` (`exact`/`none`/`withheld` — **`withheld` = deliberate hide, honor it**). Thin list `activeProductions[]{id,title,genre,progress01,weeksRemaining,stageId,stageState?}`.
- **Top HUD** `treasury`: `.cash` · `.netWeeklyCash` (signed) · `.weeklyPayroll` · `.weeklyBurn` (=payroll+overhead; overhead not surfaced separately) · `.runwayWeeks?` / `.runwayInfinite` (show `∞`). Week = root `gameWeek` (int). **DOES NOT EXIST: any date/year/month/season; `paused`; `speed`** — pause/speed are client-local, never sim data. "Why stopped" line = compose from `snapshot.release.release.automaticWeekRollEligible` (false ⇒ decision stop live) + `.nextDecisionKind` (`scriptReview`/`castingReview`/`productionOperation`/`releaseReview`/null) + per-object blockers.
- **People** — roster `snapshot.people.people[]{id,name,role(director|talent),authority,productionId?,productionTitle?}` (**no salary/term/availability/skill here**); presence `snapshot.people.presence{week,…,people[]{talentId,name,creativeRole,engagement,activity?,facilityName?,blockedReason?}, withheldTalentIds[]}`; hiring/availability truth `snapshot.casting.casting.board`: `.hiringCandidates[]{…,kind(free-agent|hiring-market),offers[]{weeklySalary,…}}`, per-project `board.projects[].candidates[]{talentId,name,contractBadge(studio|freelancer),available(bool),availabilityLabel,returnWeek?,currentWorkLabel?,ovr,starPower,fit}`.
- **Release** `snapshot.release.release{decisions[],automaticWeekRollEligible,nextDecisionKind?}`; per `decisions[i]`: `.authorityState`(`ready-uncommitted`/`committed`) · `.legalCommit`(bool; true only when uncommitted AND `.refusal===null`) · `.refusal?` · `.commitmentId?`/`.committedAtWeek?` · `.productionId`/`.title`/`.genreLabel` · `.expectedCriticScore`/`.expectedOpening`/`.expectedTotal` (**FROZEN greenlight forecast — label "projected," never actual**) · `.alreadyPaidProduction`/`.alreadyPaidMarketing` (the only per-picture finance the UI may show) · `.holdBusyTalentIds[]`/`.holdBusyTalentNames[]`. **"Committed batch" = filter `authorityState==='committed'` — there is NO batch object/id/count/scheduled-week.** Post-release history `snapshot.releaseResults.releasedFilms[]{id,title,reception,weeksAgo}` — **P07, do not surface at the decision stage.**

**Cross-cutting withhold rules:** finance only in `treasury.*` + `alreadyPaid*` + hiring offers — nowhere else. Time = integer weeks only; render "N weeks", never a date. Pause/speed not in data. Scores pre-release = frozen expectations (label projected); post-release = `reception` band (P07). `worksiteResolution:'withheld'` and `withheldTalentIds` are deliberate — never backfill.

---

# PART 2 — WAVE-MAPPED UX OPPORTUNITY LIST

Format: `[Wave][Severity] item — file(s) → data field(s) — flag`. Severity: **P0** blocks/lies · **P1** cannot-understand · **P2** prototype-looking · **P3** polish.

**W0 — Visual system**
- [W0][P2] Apply token type/spacing/surface ladder to all IMGUI chrome via one scale law — `Infrastructure/StudioLegacyUiMetrics.cs` + each `*Hud.cs` `OnGUI` → n/a (presentation constants). **FLAG:** token names additive-only (`StudioWorkspaceHostTests.cs:276–302,314–338` pin them); global reskin was NOT P05 — confirm P06B convergence authority before a sweep; renaming a Presentation class silently breaks reflection tests.
- [W0][P1] Fix inverted primary — make the **forward** action brass, Back never primary — `Presentation/StudioCameraDirector.cs` (Back control), `Presentation/UI/StudioWorkspaceHost.cs` → n/a. **FLAG:** exactly one brass primary/surface.
- [W0][P2] Collapse duplicate Backs (IMGUI band + panel) to one — `StudioCameraDirector.cs`, `StudioWorkspaceHost.cs`.
- [W0][P2] One number-formatting policy (today 5 currency formats, 3 "week" abbreviations); state each fact once — all `*Hud.cs` → `treasury.*`, `weeksRemaining`.

**W1 — Top HUD**
- [W1][P0] **Do NOT render date/season/era progression** ("SPRING 1920" in Mockup A implies a calendar that does not exist and pre-decides the C2 time-model ruling) — render `Week N` only — `Presentation/StudioLivingTimeHud.cs` → root `gameWeek`. **FLAG:** scope (open Owner decision); year 1920 is hard-set presentation truth, keep it inert.
- [W1][P1] Compose a truthful "why the clock is stopped / can I advance" line — `StudioLivingTimeHud.cs` → `snapshot.release.release.automaticWeekRollEligible` + `.nextDecisionKind` + per-object blockers. **FLAG:** no single reason field exists — compose, do not fabricate one.
- [W1][P2] Unmistakable active-speed state (filled brass chip) + cash/burn/runway band (burn amber, `∞` when infinite) — `StudioLivingTimeHud.cs` → `treasury.cash/netWeeklyCash/weeklyBurn/weeklyPayroll/runwayWeeks/runwayInfinite`; pause/speed **client-local**. **FLAG:** never present pause/speed as sim data.

**W2 — Movie rail [PRIMARY]**
- [W2][P0] Preserve exact-ID isolation: selected row pinned on refresh, new attention badges but never reorders under the pointer, released picture disappears by exact ID (never "next row") — `Presentation/StudioProductionRailHud.cs`, `Infrastructure/StudioMovieRailContracts.cs` → `productionOperations[].productionId`. **REGRESSION TRAP:** never resolve identity by title/`projects[0]`/first-match/geometry.
- [W2][P0] Keep a rail-free world route into every surface; rail selects/Locates only, commits nothing — `StudioProductionRailHud.cs`, `StudioMovieRailContracts.cs`. **REGRESSION TRAP:** criterion 15 (rail as gameplay authority) + world-first law (L-03).
- [W2][P1] Keep font-safe badges (F1 tofu fix) — action `▸`, block "· WAITING" word+amber chip; word+shape, never colour alone — `StudioProductionRailHud.cs` → `attention`, `taskStatus`, `blocker`.
- [W2][P2] Six-segment phase rail per row (freezes + `Held N weeks`, never naked %) — `StudioMovieRailContracts.cs` → `phase` (6 `ProductionPhase` values), `blockerAnatomy.projectedWeeks`.
- [W2][—] **FLAG P07:** rail is active-lifecycle only — no released/theatrical/result rows, no earning/rank/critic badges; no per-picture finance (withhold — none on the rail).

**W3 — Talent**
- [W3][P0] Remove any `projects[0]`/FirstOrDefault binding in the casting inspector route; key by exact projectId — `Presentation/UI/StudioCastingInspectorCard.cs`, `StudioCastingWorkspace.cs`. **REGRESSION TRAP:** array-position binding (L-03; owner had 3 ready screenplays, 2 unreachable).
- [W3][P0] Preserve/measure real ScrollView range in the candidate list ("I don't know how to select my cast" = `vRange 0..0`) — `StudioCastingWorkspace.cs`, `StudioWorkspaceHost.cs` PanelSettings. **REGRESSION TRAP:** themeless PanelSettings / bare `VisualElement{flex-shrink:0}` zeroes scroll; keep one scroll owner; measure, don't assert "scrollable."
- [W3][P0] The two open **ActionsEnabled latch** sites — `StudioCastingWorkspace.cs:2038` (`casting-slate-start`) and `:2199` (`casting-review-continue`) still carry raw `client.ActionsEnabled`. Re-gate **per frame**, do NOT copy the latch into new rail/workspace enablement. **REGRESSION TRAP:** do not remove the term (host dispatch needs it — dropping it silently refuses).
- [W3][P1] Disabled Greenlight must name the **blocking** term (not a satisfied one); one decision function owns headline+detail+both labels+both enabled states — `StudioCastingWorkspace.cs`, `Infrastructure/StudioProductionWorkspaceContracts.cs` → casting board blockers. **REGRESSION TRAP:** L-05 "5 OF 5 beside a dead button."
- [W3][P2] Candidate cards: OVERALL/FIT numerics (30px), contractBadge, availability — `StudioCastingWorkspace.cs` → `board.projects[].candidates[].{ovr,fit,contractBadge,available,availabilityLabel,returnWeek}`. **FLAG:** never show a candidate available-now falsely; withhold ETA when `returnWeek` null.
- [W3][P3] Left People rail is "Reserved — later package / Not built in P05" — building a full roster rail is likely a later package, not P06B — `snapshot.people.people[]`. **FLAG:** scope.

**W4 — Building cards**
- [W4][P1] Compact card: fixed information order, exactly one primary, blocker receipt adjacent to its control (never detached, never a dash for an absent fact — say `No production assigned`) — `Presentation/UI/StudioCastingInspectorCard.cs`, `StudioProductionEntryCard.cs` → `operationalState`, `blocker`. **REGRESSION TRAP:** L-04 (enabled control must act or state a reason, never silent `return`).
- [W4][P2] Post building world cues idle/waiting/active/ready/committed, text+shape (dedup by `releaseCommitted` event id) — `Presentation/StudioPostBuildingPresentation.cs`, `Infrastructure/StudioPostWorldContracts.cs` → post-family `operationalState` + release board. **FLAG P07:** no Theater cue before actual next-week release; show only Director+craft, never headcount from bodies.

**W5 — Workspace convergence**
- [W5][P2] (F3) Cede release commit from the workflow memo to a Production/Post world retained workspace: `Review release` → `Commit <title> to Release` (+`This cannot be undone.`) → `Hold for now`; layout rail 18–22 / evidence 46–50 / readiness 28–34 — `Presentation/UI/StudioProductionWorkspace.cs`, `Infrastructure/StudioReleaseContracts.cs`, memo `Infrastructure/StudioBridgeClient.cs` → `release.decisions[].{authorityState,legalCommit,refusal,commitmentId,title}`. **REGRESSION TRAP:** preserve per-frame re-gate + single-flight + fail-closed (do NOT reintroduce poll latch); trust `.legalCommit`/`.refusal`, don't re-derive; no insufficient-funds gate.
- [W5][P1] Studio-outlook block: `Studio outlook — locked at Greenlight`, ≤3 strengths + ≤3 concerns, every driver carries provenance, action is only Release/Hold (no invented Polish) — `StudioProductionWorkspace.cs` → `decisions[].{expectedCriticScore,expectedOpening,expectedTotal}`. **FLAG P07:** label "projected," never actual; no reception/box-office.
- [W5][P0] Retained workspace keeps the lot edge visible/lit (~38%) — `StudioWorkspaceHost.cs`. **REGRESSION TRAP:** the ≈63%-cover/blur is the named anti-pattern; one scroll owner; pinned headers must stay inside/anchored, not scroll away.
- [W5][P3] Remove dead `ReasonStaleRow` constant — `Infrastructure/StudioReleaseContracts.cs`.

**W6 — Lot life**
- [W6][P2] Six-state stage world language (doors as primary differentiator; each state legible three ways, survives greyscale; evaluation order Idle→Shooting→Load-In→Blocked→Wrap→Rehearsal) — `Presentation/StudioStageProductionPresentation.cs`, `Infrastructure/StudioStagePresentationRegistry.cs`, `…StagePlacardContracts.cs` → `types.ts` `phase`/`blocker`/`task`. **FLAG:** the per-stage presenter (replacing the `stage-a` compile-time singleton) is a **prerequisite, not a visual task** — two-stage isolation is impossible today (`if (onStage.Length>1) return withheld`); this may exceed a UI-only P06B slice — confirm authority.
- [W6][P2] Billboarded world nameplates (never floor/ground text) — `…StagePlacardContracts.cs`. **REGRESSION TRAP:** crew must NOT be re-posed per state (Visual Oracle seal: 12 roles stationary ≤0.05 m/s); no auto-camera on state change; period props withheld behind the confirmed era-safety profile.

**W7 — Guidance**
- [W7][P1] (F2) First-film card reads "SHOOTING" for a wrapped-waiting picture — make phase-based guidance key on `operationalState` (wrapped-waiting/release-ready families) so card, rail, building agree — `TS:src/core/firstFilmJourney.ts` → `operationalState`. **FLAG (must not silent-edit):** `firstFilmJourney.ts` is the C1 onboarding module, on `CLAUDE.md` "not current scope," and sits in `src/core` (engine hard line) — **needs an explicit F2 Owner scope ruling** before touching.
- [W7][P1] Development card answers four questions in hierarchy with one primary CTA; time copy speaks the real control ("Draft due in 1 week — run the studio clock") — `Presentation/StudioDevelopmentCardHud.cs` → `productionOperations[].{operationalState,weeksRemaining,nextMilestone}`. **FLAG:** enhance legibility only — do not turn guidance into a scripted tutorial (out of scope).

**W8 — Economy clarity**
- [W8][P1] Scope every financial warning to its exact picture (or label studio-wide) — `StudioCastingWorkspace.cs`, any Release warning → `alreadyPaid*`, `treasury.*`. **FLAG:** a pre-existing mis-scoped cash warning exists (a warning about a different picture inside another's casting workspace) — do not silently fix that one, but any warning P06B touches must be correctly scoped.
- [W8][P2] Truthful burn/runway on HUD + Administration card — `StudioLivingTimeHud.cs`, `Presentation/StudioFoundingCardHud.cs` → `treasury.*`. **FLAG:** D-17B macro residuals OPEN — keep truthful, add no fix/no warning-implying-a-fix/no reclassification.
- [W8][—] **REGRESSION TRAP:** no release-time debit exists — never disable Commit for a fictional release fee; per-picture finance only from `alreadyPaidProduction/alreadyPaidMarketing`.

**W9 — Accessibility**
- [W9][P1] Apply the declared-but-never-used focus ring (2px brass, offset 2px `.focus-visible`) + deterministic focus order header→rail→evidence→actions — `StudioWorkspaceHost.cs` + USS. **REGRESSION TRAP:** D-16/D-17 governed suite (176 tests) must stay green.
- [W9][P1] Enforce color-never-sole-carrier across all new/edited states (hue+icon+shape+text, survives greyscale) — all `*Hud.cs` + Post/stage presenters.
- [W9][P1] Honor legibility floor: body ≥16px, targets 40–44px (**NOT ≥44px — L-17**), warnings at body (fix `.refusal` 15px), ≤2 primaries before `More`; solve overflow by reflow/scroll/defer, never by shrinking — `StudioLegacyUiMetrics.cs`, all `*Hud.cs`. **REGRESSION TRAP:** shrinking below the floor re-creates BLOCKER C.
- [W9][P2] Register rail rows + unregistered IMGUI HUDs into the element map (today only `rail-locate-casting`, dev/menu partials) for automation/accessibility proofs — `StudioProductionRailHud.cs`, `StudioLivingTimeHud.cs`, `StudioHud.cs` → `StudioUiElementRegistry.Publish/Withdraw`. **FLAG:** no ARIA/screen-reader claim in Unity 6 — keep claims honestly scoped.
- [W9][P0] Camera reversibility: any new Locate/Focus/Details surface must push a recoverable origin (Back restores exact context; zoom-out works after Locate) — `StudioCameraDirector.cs`, shared origin stack. **REGRESSION TRAP:** no second camera controller, no teleport-to-default on Back, no camera move from a sim refresh, no mode inferred from screen position.

**Cross-wave verification discipline:** assert state **and** the sentence beside it; mutation-check every new guard (revert the fix → test must fail); no proof helper defaults to pass; prove player routes by the path the Owner uses; never rebuild UI every frame (an element created this frame has no resolved layout — cache signatures must cover everything the cached thing renders); report **"KEEP CANDIDATE — Owner acceptance pending,"** never "done because the floor is green."