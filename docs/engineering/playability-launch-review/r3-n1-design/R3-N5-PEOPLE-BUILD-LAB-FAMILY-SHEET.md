# R3-N5-DESIGN-06 — people / casting-contracts / build-lot-tools / laboratory family sheet (filled)

**Task** R3-N5-DESIGN-06 under the Owner directive of 2026-09-15 and `plans/R3-OVERHAUL-PLAN.md` (TS `efbf9ab2`) phase **N5** upstream item "designer family sheet". **Mode**
DESIGN_PROTOTYPE — documentation only. No source, test, build, capture or native input was produced; the Unity worktree was read only (HEAD `0703ed7a`), the Editor was never launched.
**Fills** `R3-N5-FAMILY-SHEET-SKELETON.md` (retained beside this file). **Binding** R3 HYBRID cards, Backlot language, 1A/2B/3A/4B, `R3-N1-COMPACT-INSPECTOR-MEMO-SHEET.md` §E.1/§F/§C.8,
`R3-N1-SHEET-REVISION-02.md` §R1/§R3/§R4.4/§R5, `R3-N2-TEXT-RULES-ADDENDUM.md` W1–W6, `R3-N3-VISUAL-STANDARD-SHEET.md` (portrait law, monogram fallback, six-person proof),
`R3-N4-FILM-JOURNEY-FAMILY-SHEET.md` §4 (generalised More-actions), `plans/N7-N8-LEGALITY-AND-RETRIEVABILITY-INVENTORY.md`. No P13B mechanics.

**Labels.** `[NAT]` hand reading of committed Unity/TS source (paper, never a runtime observation). `[REN]` read off an existing rendered element map on the private evidence branch.
`[R3]` an already-selected R3 law. `[REC]` this sheet's recommendation. `[GAP]` named dependency. **Constants** `m` = `StudioTextSizePreference.Multiplier` (1/1.5/2); `s` =
`StudioLegacyUiMetrics.CurrentScale` = 1 at both targets; panel `scale` ≈ 0.794 at 1440x900, so an authored 170 panel-unit bottom renders **135 screen px** `[REN]`. **R3 reference for
every surface in this family**: `R3/DESIGN.md`, `R3/movie-cards.css`, `R3/previews/03-selected.png` (1440x900) and `07-small-waiting.png` (1280x720), archive root
`/Users/bruce/Desktop/Fable-Verified-Sources-20260914-01/`; sha256 list inherited from DESIGN-01 §H.1, **not re-hashed here**. Rows below name which preview each surface answers to.

## 0. Executive summary — disposition per surface

| # | Surface (Unity owner) | Disposition | Why | R3 ref |
|---|---|---|---|---|
| N1 | `StudioProfileWorkspace(+Context)` | **refine** | The dossier is the best-composed surface in the family: exact identity, employment **and** assignment as separate lines, the locate refusal rendered *beside* LOCATE, and the contract sheet already keeps title/Confirm/Cancel pinned while only the explanation scrolls — the one nested scroll W4 blesses. Refine is (a) the **five-control chrome** (§4.1), (b) the `bottom` that jumps `170 → 28` the instant a sheet opens (§2), (c) `name · talentId` disambiguation (§1). | `03-selected` |
| N2 | `StudioRosterWorkspace(+Context)` | **refine** | Population split (employed / freelancer / known), the labelled-OVR rule ("a row never shows one OVR while sorting by another"), `nameShared`, filter chips and the 3-action footer are correct and stay. Refine is the **seven-row filter block at 200 %** (§2) and 24 px chips against W3. | `03-selected` |
| N3 | `StudioPersonInspectorCard` | **redesign (anchor + scale only)** | Content contract (`StudioPersonInspectorContracts`) is retained verbatim — it is the cleanest absence vocabulary for people. But the card is anchored `right = 28f`, `width = 360f` **fixed**, and is *not* passed through the F10 clearance law that `productionEntryCard` and `inspectorCard` already get in `ApplySharedTextSize` `[NAT]`. It therefore sits inside the published pictures-rail band and reproduces F10 (the rail retires, every picture row goes dead) whenever a person is selected, and its box never follows `·m`. | `07-small-waiting` |
| N4 | `StudioCastingInspectorCard` | **retain with evidence** | Measured 285x214 with two 35 px actions and a truthful empty headline ("NO SCREENPLAY READY FOR CASTING" + "Find talent here, then commission a screenplay…") `[REN]`; it is already inside the F10 width/right clamp `[NAT]`. Apply only the family clamp (§2) and W3. Two actions — deliberately **not** a More-actions case. | `07-small-waiting` |
| N5 | `StudioTalentMarketControls` | **refine** | One reusable, prefixed, context-bound control block shared by roster and profile routes — exactly the component reuse R3 asks for; keep it. Refine: the cycle semantics ("Cycles All, Actor, Writer, Director, Craft…") live **only** in `tooltip` `[NAT]`, breaking N2 §4(1); `search.style.fontSize = 13` and `height = 30` are hard-coded below the W1/W3 floors. | `03-selected` |
| N6 | `StudioPeopleWorkspaceLayout` | **retain with evidence** | `ScaleText` *is* the W1 law and `ConstrainScroll` *is* the W4 helper; profile, roster and laboratory all use it `[NAT]`. Only change: pass one named `minimumRenderedPixels` constant instead of the per-surface 14 / 0 (N2 W1a, N3 F-N3-1). | shared |
| N7 | `StudioBuildWorkspace` | **redesign (preview footer + scroll ownership)** | The route — parcel → catalogue → nudge → commit, with per-cell legality from the engine and the engine's own price — is the strongest command path in the codebase (N7/N8 inventory) and is retained whole. The **preview pane is redesigned**: `build-quote` (SITE refusal + CAPITAL COST) and the nested `build-reasons` ScrollView live *inside* `build-consequence-scroll` `[NAT/REN]`, so the reason and the cost scroll away while `build-commit` stays pinned — N2 §4(3) and W4 both broken; and `build-commit` (356) + `build-cancel` (77) already measure **433 of a 439 px pane at 100 %** `[REN]`. | `03-selected` |
| N8 | `StudioBuildCommandHud` | **retain with evidence** | 265 lines; one chip (`build-chip` / `hud-open-build`) opening one route, no cost, no refusal, no state of its own. No re-form. | lot |
| N9 | `StudioBuildPlacementDriver` | **refine** | Click-to-place **and** arrow-key nudge with key repeat both already exist `[NAT]` — 2B's "every drag completes by click and keyboard" is true by construction here. Refine: the world reason is a `TextMesh` at a fixed `fontSize 36` / `characterSize 0.5` that never follows `·m`, and the same sentence must also render in the pinned strip (§5). | lot |
| N10 | `StudioLaboratoryWorkspace` | **retain with evidence** (copy) + **refine** (geometry) | **The ceiling-vs-spend copy is law and is retained verbatim** (§6). Refine: it is the only surface in the family with `bottom = 28` (all others 170) `[NAT]`, and its action rows measure 100–126 px each at 100 % `[REN]`, so at 200 % roughly one decision fills the body — the existing pager must become the answer (§2). | `03-selected` |

**Refused here:** no universal undo; no auto-pause; no guided first-film tutorial (3A); no pane-stacking or symmetry-forcing (N2 §4(4)/(5)); no new SVG; no hiding of a cost, refusal or
active filter behind a disclosure — only *controls* may fold.

## 1. Identity: one person, three renderings

Rail row → inspector card → profile workspace must read as **one** person: same name form, same portrait crop (N3 §3.2 sizes), same role word, and employment kept distinct from
assignment. The shipped joins are already id-exact: `StudioPersonInspectorCard.boundTalentId = profile.talentId`; `StudioProfileWorkspace` refuses any snapshot whose `talentId` differs
(`:354`) and re-checks `sheet.talentId == profile.talentId` before rendering a contract sheet (`:875`); the roster resolves by `UniqueById(..., row => row.talentId)` and refuses an
ambiguous match `[NAT]`. **Retain all of that verbatim.**

**Employment ≠ assignment, as three separate lines** — measured on the R-A Profile `[REN]`: `profile-employment` "Under contract · Working" (`statusLabel` + `availability`),
`profile-task` "Under the Meridian" (`work.label`), `profile-presence` "At Development & Casting" (`presence.facilityName`). Three wire families, three lines, never one badge; the
roster keeps the same split (`contractLine`/`currentWork`/`availability`).

**Duplicate names — the one real disagreement with the shipped code.** `IdentityLine` and `roster-name` both disambiguate as `"<name> · <talentId>"` `[NAT]`, and a capture shows it in
the wild: `roster-name` = **"Douglas Sable · t-cra-03"** beside plain "Hedy Rourke" `[REN]`. The skeleton's law is "a stable fact, never an internal id". `[REC]`: when `nameShared` is
true, disambiguate with the first **already published** fact that differs, in this order — `professionLabel` → `contractLine` (or `availability` for a non-employee) → `age` →
`careerIdentityLabel`; e.g. "Douglas Sable · Craft · under contract to Week 364". Only when every one of those ties does the id appear, and the complete `"<name> · <talentId>"` string
is *always* the element's published registry text, so proof and tests keep an exact handle. **No wire delta is needed** — every field above is already on `BridgeRosterRowSnapshot` /
`BridgePersonProfileSnapshot`.

**Portraits (N3 law).** The rendered capture appears at the rail row (≤ 44x55 / 66x82 / 70.8x88.5), the lane-inspector overlay header, and the **Profile/dossier header** at the rig's
native 256x320 downscaled (128x160 / 192x240 / 256x320). The labelled **monogram** appears wherever `capture.talentId != row.talentId`, no capture exists, the entry is stale, or the
person is in neither `SeatedPersonTalentIds()` nor `TryGetApplicantBody` `[NAT]` — never a neighbour, never array position, never the last portrait held. The Profile header is text-only
today; adding the dossier portrait is N5 work, and the coverage sentence (N3 §3.6) is recomputed, never hand-written.

## 2. The family geometry contract (W1–W6 per cell)

`envelope = viewportH − T − bottom`, `T` = **94 / 166 / 190** `[NAT]` (94 confirmed by measurement: `profile-workspace-root` 887x671 at top 94 / bottom 135 `[REN]`). `bodyMin = 3 × 18·m
+ 12·s = 66 / 93 / 120`. `chrome = 11·s + max(34·m, 19·m) + 6·s = 51 / 68 / 85` (measured 35 at 100 % — **9 px under `--ps-control-min-height` 44**, W3). `line = 19·m + 4·s = 23 / 33 /
42`. `actionRow = 12·s + max(34·m, measured) + 14·s = 60 / 77 / 94`, `+34·m + 6·s` per WRAPPED extra row.

**Bottom is the one family-wide defect.** Three different values ship today `[NAT]`: 170 (profile, roster, build, production, history, release-result), 190 (both inspector cards, the
entry card), 28 (laboratory) — and the Profile *switches* `170 → 28` the moment a contract sheet opens, so the workspace grows 142 px under the player's eyes mid-decision. `[REC]` **one
law: `bottom = 12·s` at every surface, always**; it is strictly better than both Profile values and removes the jump. The table below is arithmetic on that law, not a measurement of the
revised design.

| Surface | term stack | 1280/100 | 1280/150 | 1280/200 | 1440/100 | 1440/150 | 1440/200 |
|---|---|---:|---:|---:|---:|---:|---:|
| envelope | `viewportH − T − 12` | 614 | 542 | 518 | 794 | 722 | 698 |
| **Profile** (sheet closed) | header = chrome + identity + profession = 97/134/169; footer 0 | body 517 | 408 | **349** ✓ | 697 | 588 | 529 ✓ |
| **Profile** (sheet open) | + footer = sheet title + Confirm/Cancel row = 83/110/136 | 434 | 298 | **213** ✓ | 614 | 478 | 393 ✓ |
| **Roster** | header = chrome + tabs(40/57/74) + filters(elastic) ; footer = name+notice+3 actions = 106/143/178 | list 468−F | 342−F | **266−F** | 648−F | 522−F | 446−F |
| **Build** preview | header = chrome + context + title = 97/134/169 ; footer = nudge(46/63/**154**) + actions(60/**137**/**174**) | 411 | 208 | **21 ✗** | 591 | 388 | 201 ✓ |
| **Build** preview, nudge folded (§4) | footer = actions only | 457 | 271 | **175** ✓ | 637 | 451 | 355 ✓ |
| **Laboratory** | header = chrome + calendar + locate row + status = 143/197/249 ; footer = pager 60/77/94 | 411 | 268 | **175** ✓ | 591 | 448 | 355 ✓ |

`F` = the roster filter block. Measured 193 px at 100 % (search 53 + profession chips 27 + availability chips 27 + toggles 27 + active-filters 19 + gaps) `[REN]`. Its chip rows already
measure 613 of an 865 px body at 100 % (availability) and 499 (toggles), so at 200 % both exceed any body width at either viewport and wrap. One full-width row per control (§3
button-row law) is ≈ 7 × 68 = **476 px**, which alone eats the 518 px envelope at 1280/200 %. `[REC]` the filter block is the **elastic** term: it grows with its measured wrapped rows
until `list < bodyMin`, then collapses behind **`roster-filters-more`** ("Filters · <n> active ▸") inside the list's own scroll. `roster-active-filters` — the *sentence* saying what is
filtering — is pinned and never folds. A fact never hides; a control may.

**W2** paddings/gaps/keylines `·s`; fonts, control min-heights, hit targets `·m`. **W3**: every measured control in this family is under the 44 px floor today — `roster-profession-*`
chips **24**, `build-nudge-*` **27**, `build-actions` **34**, `profile-*` chrome **35**, `laboratory-action-*` **33** `[REN]`; they grow, never shrink. **W4**: one scrolling body per
surface — `profile-detail`, `roster-list`, `build-consequence-scroll`, `laboratory-scroll`; the **only** lawful nested scroll is the contract sheet's
`profile-contract-consequence-scroll` (bounded explanation that must not push Confirm/Cancel away). `build-reasons` nested inside `build-consequence-scroll` is **not** lawful — it is
the only route to "Why not here?" (§5). **W5**: every rect derives from the final rect; an action rect outside it is not published. **W6**: full-alpha body plate drawn before the
scroll, covering viewport *and* scrollbar gutter; `1·s` keylines outside the scroll; focus = blue `StudioUiTokens.Focus` at `3·s`, selection = brass, attention = amber mark **plus a
word**. **Pane rule:** Profile/Roster are single-pane (887 wide at 1440 `[REN]`); Build is a 461 px right-hand pane; Laboratory is full-bleed (1396x784 `[REN]`). All three forms are
**retained** — panels may differ in width (N2 §4(5)); none may stack or merge at any text size. Both rails are suppressed while a workspace is open (`workspaceOpen: true` in all four
maps `[REN]`, G13) — the hybrid composition is the **lot's**, and `◄ Back` restores it unchanged.

## 3. States × the exact wire fields that drive them

| # | State | Surface | Exact wire fields | Rendered cell `[REN]` |
|---|---|---|---|---|
| P1 | **Employed, unassigned** | roster, rail, profile | `employment.status='contracted'` + `statusLabel` + `availability`; `work.kind='available'` + `work.reason`; roster `contractLine` + `contractEndWeek` + `currentWork` | owed |
| P2 | **Employed, assigned** | profile, production | `work.kind='assigned'`, `assignmentKind ∈ {production,script,research}`, `assignmentId`, `label`; `presence.{engagement, credit, facilityId, facilityName}`; contract `endWeekExclusive` + `remainingWeeks` answer "until when" | `009-map.json` (R-A run): "Under contract · Working" / "Under the Meridian" / "At Development & Casting" |
| P3 | **Candidate, affordable** | talent market, casting inspector | `hiringCandidates[]{talentId,name,professionLabel,role,ovr,starPower,genreExperienceLabel,kind,availabilityLabel}` + `offers[]{termWeeks,termLabel,annualSalary,weeklySalary,signingBonus,guaranteedComp,totalObligation}`; the quote adds `totalImmediate/cashBefore/cashAfter/affordable` | owed |
| P4 | **Candidate, refused** | talent market | founding open → `"Complete studio founding before opening the talent market."`; not signable → `"…is not currently signable — not a free agent or hiring-market candidate."`; no term → `"Choose a published contract term before signing."` (all `bridge/casting.ts` `signActorConversion`). **Funds are not published per row** → **D1** (§7) | owed |
| P5 | **Duplicate / ambiguous name** | roster, comparison | `nameShared` (the only flag); the disambiguating facts are `professionLabel` / `contractLine` / `availability` / `age` / `careerIdentityLabel` (§1). Ambiguous *work* is separate: `work.kind='ambiguous'` + `work.reason`, which fails closed by law | `015-map.json` "Douglas Sable · t-cra-03" |
| P6 | **Portrait missing** | all | no wire field — rig availability only (`SeatedPersonTalentIds()`, `TryGetApplicantBody`) `[NAT]`; monogram = first + last initial, `?` when blank, clipped to the slot (N3 §3.5 F20 fix) | owed, N3 §5.5 |
| P7 | **Contract review open** | profile contract sheet | `contract.actions{renewAvailable, renewReason, renewalTerms[]{termWeeks,termLabel,annualSalary,weeklySalary,signingBonus,endWeekExclusive}, releaseAvailable, releaseReason}`; sheet `{ok, verb, consequence, refusal, refusalReason, refusalRemedy, cost, cashBefore, cashAfter, affordable, guaranteedRemaining, terminationCost, newEndWeekExclusive}` | owed at 1280/200 %, Confirm/Cancel pinned |
| P8 | **Build: placement valid** | build workspace/driver | `placementQuote{ok, cost, weeklyOperatingCost, buildWeeks, completesOnWeek, capability, capacityDelta, cells[], footprint, instanceCount, maxInstances, cashBefore, cashAfter, affordable, consequence, financial}` | `013-map.json` strip rows: CAPITAL COST $780,000 · COMPLETES Week 27 (13 weeks) · WEEKLY COST $3,500/wk · EFFECT +1 Development & Casting capacity |
| P9 | **Build: invalid / occupied** | placement driver + preview | `cellLegality[]{cell,ok,rejection}` (**per cell** — the only true per-cell preview in the codebase), `primary`, `primaryReason`, `rejections[]`, `unmetRequirements[]{kind,reason,notYetAttainable}`; 12 codes incl. `occupied`, `clearanceRing`, `groundReserved`, `noRoadAccess`, `seversLot`, `instanceLimit`, `insufficientFunds` | `013-map.json`: `build-commit` = **"NOT A VALID SITE"**, `build-quote-site` = "Construction needs road access." |
| P10 | **Build: cancel before commit** | build | nothing to read — `placementDraftToEngine` mutates nothing, the intent is *minted* but **registered only when `ok`**, and `build-cancel` is client state `[NAT]`. Nothing spent, nothing recorded, by construction | owed |
| P11 | **Laboratory: copy law** | laboratory | `laboratory.{statusLabel, seatLabel, scientistId, scientistLabel, budgetLabel, bottleneckLabel, estimateLabel, progressLabel, provenanceLabel, commercialLabel, installationLabel, actions[]{id,label,detail,enabled,disabledReason,intent}}` — rendered **verbatim** (§6) | `008-map.json` |
| P12 | **Empty roster / empty market** | roster, market | `roster.counts{employed,freelancer,known,withAttention}` + `roster-counts` sentence ("14 of 84 known people shown · employment is labelled…" `[REN]`); `hiringCandidates.length === 0` + `freelancerMarketRefreshWeek` gives the *lawful next route* ("the market rotates in week N") | `015-map.json` |

**Per-viewport reflow, all twelve rows.** Label/value pairs stack at 200 % (`profile-contract-basis`, every `build-quote-*-row` — note the value is right-aligned at x1348 while the
label sits at x968 `[REN]`, so at 200 % the pair must stack rather than collide). Roster rows become stacked records at 200 % (REVISION-02 §R4.4 form). Button rows become one full-width
row per action, order preserved. The refusal / cost / waiting strip is its own wrapped block **adjacent to the control it refuses** and is never the thing that scrolls away.

## 4. The three-or-more-action records (R1.5 / N4 §4 generalised to this family)

Law, unchanged: below 3 actions nothing changes; at ≥ 3 the footer wraps to a second row (`+34·m + 6·s`); only where the wrapped footer would push the body under `bodyMin` does the
footer keep the **primary** action and move the rest behind `<surface>-more-actions` ("More actions ▸") into the body's own scroll, headed with the count. Never a popup layer, never a
lost route, never a second form of the surface.

1. **Profile chrome — the flagship case.** `profile-history` (137) + `profile-locate` (131) + `profile-contract-renew` (147) + `profile-contract-release` (191) + `profile-back` (61) =
   **5 controls, 667 px + gaps in an 865 px chrome at 100 %** `[REN]`. At 150 % ≈ 1000 and at 200 % ≈ 1334 — it cannot be one row at either size. `[REC]` order: `profile-back` and the
   **contract** actions are primary (they are the only ones that commit anything); `profile-history` and `profile-locate` fold first. At 1280/200 % the chrome keeps `◄ Back` + `REVIEW
   RENEWAL` and publishes `profile-more-actions`. A disabled contract button **keeps its tab stop and reads `renewReason` / `releaseReason`** — it is never skipped. A sixth action,
   `profile-review-hiring-offers` (35 px, with `profile-hiring-reason` beneath it `[REN]`), lives in the body and stays there.
2. **Roster footer** — `roster-footer-profile` + `roster-footer-locate` + `roster-footer-offers` = **3**, plus `roster-footer-name` and `roster-footer-notice` in the same band, plus
   `roster-back` in the chrome. Wraps at 150 %; at 1280/200 % OPEN PROFILE stays primary.
3. **Build preview footer** — `build-nudge-{n,s,w,e}` (44/44/42/38) + `build-orientation` (104) + `build-commit` (356) + `build-cancel` (77) = **7 controls in a 439 px pane** `[REN]`.
   Commit + cancel alone are 433 of 439 at 100 %, so they cannot share a row at 150 %. `[REC]` fold the four nudge buttons and the orientation note behind `build-more-actions` ("Move the
   site ▸") at 1280/200 % — this costs **no route**, because `StudioBuildPlacementDriver.HandleKeys` already nudges by arrow key with repeat, and pointer click already re-origins the
   footprint `[NAT]`. That fold is what turns the 1280/200 % body from **21 px (fails `bodyMin`)** into 175 px (§2).
4. **Laboratory chrome** — `laboratory-back` + `laboratory-refresh` + `laboratory-text-100/150/200` + `laboratory-locate` = **6** `[NAT]` (the capture renders only 100 % and 200 %; why
   `laboratory-text-150` did not draw is a question for the writer, not a fact established here). `[REC]` the three text-size buttons are one labelled group that folds as a unit, never
   individually.
5. **Contract sheet** — `profile-contract-confirm` + `profile-contract-cancel` + one `profile-contract-term-{weeks}` chip per `TUNING.CONTRACT_TERM_OPTIONS` = **2 + n**. The two
   decision buttons are pinned by law and **never** fold; the term chips are a selection row inside the sheet and wrap.
6. **Person / casting inspector cards** — 2 actions each. Listed to record that they are deliberately *not* More-actions cases.

**Fixture the phase requires** (test-author owned, not written here): a checkpoint containing (a) two people with the **same full name** so `nameShared` is true on both — N3's
adversarial pairs in `r3n1-dense-01` share only a *first* name (Ingrid Blackwood / Ingrid Underwood), so P5 is **not** exercised by that fixture as it stands; (b) one contracted person
inside the renewal window **and** one blocked by `onScreenplayTask`; (c) an illegal build origin whose `primary` is `occupied` and a second whose primary is `insufficientFunds`. Confirm
or extend `r3n1-dense-01` / `-02` before the rendered pass.

## 5. Build: invalid placement, cancel-before-commit, occupancy

**Invalid, at the cursor and in text.** `StudioBuildPlacementDriver` already draws a world `reasonLabel` at the ghost `[NAT]`; the same sentence — `primaryReason` =
`placementRejectionHeadline(primary, quote)` with its filled fact ("Reserved ground: <purpose>.", "Requirement not met: <exact requirement>.", "The studio cannot cover $X this week.") —
must **also** render in the pinned strip, because the world label is neither keyboard-reachable nor persistent. Per-cell `cellLegality[]` colours the ghost cells and P09-REQ-015 forbids
colour alone: shape + mark + text. `[REC]` the world label follows `·m` (fixed `fontSize 36` today `[NAT]`). **The redesign, exactly.** Move `build-quote` (SITE / CAPITAL COST /
COMPLETES / WEEKLY COST / EFFECT / CASH AFTER BUILD / ORIGIN) **out** of `build-consequence-scroll` into a pinned block directly above `build-actions`; leave only the
financial-consequence card and the "Why not here?" reasons in the body scroll; **delete the nested `build-reasons` ScrollView** and let its rows flow in the one body scroll (W4). The
refusal and the price are then visible at the same moment as `build-commit`, at every cell — N2 §4(3). **Cancel before commit.** `build-cancel` returns to the catalogue with the parcel
selection retained and **nothing spent** — guaranteed by the bridge, not the client: an illegal preview's intent id is minted but never registered, and a legal commit re-asks
`queryPlacement` against live state (`bridge/session.ts:1572-1578`) `[NAT]`. Copy: "Nothing has been built and nothing has been charged." Escape does exactly what `build-cancel` does.
**Occupancy.** `occupied` ("Overlaps an existing structure or facility.") and `clearanceRing` ("Needs clearance from a neighboring facility.") are distinct codes and read as distinct
sentences, never "invalid"; for **Sets** the occupancy case is `stageAlreadyDressed`, whose remedy route already exists (`build-set-remedy`, `build-set-inspection-notice`) — retain.
**Staleness**: Build uses `QuoteFresh(quote, liveRevision)` and re-asks ("Re-asking (the week moved on)…") rather than `StillDisplayed()` `[NAT]` — a different, equally lawful
mechanism; N8 must name both (inventory correction 4).

## 6. Copy — action, refusal, help (Backlot; 3A contextual only)

| Element | Label | Refusal (why + lawful route) | Contextual help, on demand |
|---|---|---|---|
| `profile-contract-renew` | "REVIEW RENEWAL" | `actions.renewReason` verbatim — e.g. "…renewal window is not open yet — it opens N weeks from now (Week W), 26 weeks before the contract ends in Week E." + remedy "Review the renewal again from Week W." | "Reviewing costs nothing. The signing bonus is charged only when you confirm." |
| `profile-contract-release` | "REVIEW EARLY RELEASE" | `actions.releaseReason` — "…is <task> and must finish that screenplay task first." + "Release after the draft closes, or reassign the screenplay." | "Early release pays half the compensation still guaranteed. Credits and career history stay on the record." |
| `profile-contract-confirm` | the wire's `commitLabel` ("RENEW <NAME> — 4 YEARS · $X BONUS NOW") | `refusalReason` + `refusalRemedy`, both verbatim; insufficient funds names the exact bonus and the live solvency reason | the sheet's `consequence` string **is** the explanation — add no prose beside it |
| `profile-locate` | "LOCATE ON LOT" | `presence.locateReason` rendered beside the button — measured live: "On the lot this week; no body to locate right…" `[REN]` | "Locate moves the camera. It changes nothing." |
| talent-market sign | "Sign <name> — <termLabel>" | the four `signActorConversion` sentences verbatim; funds → **D1** | `signWeeklySalary` / `signGuaranteedComp` / `totalImmediate` are the explanation |
| `roster-*` filters | as shipped | — | the tooltip text moves into `roster-search-hint` / the `guidance` label so it is readable without hover (N2 §4(1)) |
| `build-commit` | the engine's `commitLabel` ("BUILD <NAME> — $X"); **"NOT A VALID SITE"** when refused `[REN]` | `primaryReason` in the pinned strip + every `unmetRequirements[].reason` in the body | "A preview commits nothing. The studio re-checks the site and the price when you build." |
| `build-cancel` | "CANCEL" | — | "Nothing has been built and nothing has been charged." |
| `laboratory-action-*` | the wire's `label` | the wire's `disabledReason`, or "Refresh this Laboratory to review the current decision." when the intent is no longer offered | the wire's `detail` |
| empty market | — | — | "<n> people are signable this week. The freelancer market rotates in Week <freelancerMarketRefreshWeek>." |

**Laboratory ceiling-vs-spend — unchanged in law, quoted so no one paraphrases it.** `budgetLabel`: "$X/week requested ceiling · $Y/week currently usable R&D · $Z/week of the ceiling is
not currently charged · $E spent on this project. Payroll and employment overhead are separate. A $0 ceiling allows baseline work while active and prerequisites are met." Each `Set R&D
ceiling` action's `detail`: "One Scientist can use at most $U/week; money above that is not charged. Payroll is separate." `[NAT]` These strings render **verbatim**; N5 may re-wrap and
re-size them and may not re-word, truncate, summarise or replace them with a meter. The same holds for `bottleneckLabel`, `estimateLabel`, `progressLabel` and `provenanceLabel`. At 200
% the long `detail` blocks are the reason a Laboratory decision fills the body: `[REC]` the client's `pageSize` argument drops with the text preference, is **fixed for the session at
open time**, and a mid-session text-size change re-anchors to the page holding the focused action — the page number is never silently re-based under the player.

## 7. Keyboard, focus, drag candidates

**Tab ring, every surface, in DOM order**: `<surface>-back` → any view-tab / category strip (arrow keys move within, Tab leaves) → the filter or chooser block → the one scrolling body
(focusable; PgUp/PgDn/Home/End) → the pinned footer, primary action first, `<surface>-more-actions` last. Enter/Space activates. **A disabled control keeps its tab stop and reads its
refusal** — that is how `renewReason`, `releaseReason`, `locateReason` and `disabledReason` become keyboard-reachable. Focus (blue, `3·s`) is never selection (brass) — REVISION-02 §R5 /
N2 defect 1; `roster-row--selected` and `.focus-visible` must be distinguishable at 200 % **in a capture**, not only in code (memo §F: focus ≠ selection). **Escape ladder, unchanged
(§C.8), first true wins:** (1) `roster-search` / market search clears its own focus; (2) an open More-actions list, an expanded `roster-filters-more`, or an open contract sheet
collapses (Cancel's exact effect, including the restored reading position — `CancelContractScrollRestoration` already preserves it `[NAT]`); (3) one route level pops (contract sheet →
profile → roster → lot; build preview → catalogue → parcels → lot); (4) focus releases to the lot; (5) the Studio Menu opens. `◄ Back` pops the same stack as (3). **Drag — N8 candidates
only, per the inventory, nothing added.** Lawful and already click/keyboard-complete: **scientist → Research Laboratory** (`assignResearchScientist`; the best enumerated preview in the
codebase — one intent per (lab, person) with `enabled`/`disabledReason`; ordinary route `laboratory-action-assign-{lab}-{person}`) and **catalogue item → lot placement**
(`placeFacility`; per-cell `cellLegality[]`; ordinary route parcel → catalogue → nudge → `build-commit`, plus arrow-key nudge). `set blueprint → stage` (`commissionSet`) is the third
lawful route and belongs to this family's Sets mode. **`person → facility` in any other pairing, and `existing building → new cell`, are named dependencies, not candidates** `[GAP]`.
Drop-time recheck: `QuoteFresh` + the TS commit revalidation for Build; the lab intent list for the scientist route. No drag exists in the client today; the regression to protect is
that every ordinary control above stays present and enabled.

## 8. Acceptance checks this sheet implies

* **EditMode identity / duplicate-name / employment-vs-assignment** — `IdentityLine`/`roster-name` disambiguate by the §1 ladder and publish the complete `name · talentId` as registry
  text; a profile refuses a snapshot with a different `talentId` and a contract sheet refuses a `talentId` mismatch; `UniqueById` refuses an ambiguous id; with two talents sharing a full
  name both rows disambiguate, differ, and neither shows the other's contract, portrait or assignment; `statusLabel`/`availability`, `work.label` and `presence.facilityName` render as
  three separate elements, and `work.kind='ambiguous'` renders `work.reason` and offers no assignment action.
* **Geometry (EditMode)** — `header + footer + bodyMin ≤ envelope` at both viewports × 100/150/200 % for all ten surfaces; one scrolling body per surface (`build-reasons` gone, the
  contract-sheet scroll the single blessed exception); no published action rect outside the final rect; `--ps-control-min-height` follows `·m`.
* **Rendered PlayMode, six cells** (1280x720 and 1440x900 × 100/150/200 %) per surface: P1–P12 with at least one refusal, one waiting and one long-name record, plus one 3+-action record
  showing the wrapped footer and — at 1280/200 % — `profile-more-actions` and `build-more-actions`.
* **Rendered Build** — invalid placement (reason at the cursor **and** in the pinned strip), occupied vs clearance-ring as distinct sentences, cancel-before-commit leaving cash and the
  facility list unchanged.
* **Rendered portraits** — the N3 six-person set at rail and dossier sizes; the monogram's ink bbox inside its slot; the drawn portrait's `talentId` equal to the row's. **Mid-scroll
  opaque-backing** capture over a bright lot region; focus vs selection distinguishable at 200 % in the capture.
* **TS command-owner refusal tests** (read-only): the server refuses a stale/duplicate displayed intent; a `placeFacility` intent minted for an illegal preview is refused as not
  available; `contractDraftToEngine.apply` re-refuses when the live window closed between quote and commit.

## 9. Exact delta, routing, provenance, evidence limits

**D1 (one exact delta, for disposition — not adopted here).** P4 cannot be satisfied from the wire: `StudioHiringCandidateSnapshot` publishes `availabilityLabel` (a label, not a
refusal) and `StudioContractOfferSnapshot` publishes six money/term fields but **no affordability and no reason**, so a talent-market row cannot show "why you cannot sign this person at
this term" beside the control — it is discoverable only by asking for a quote. Delta: **add `affordable: boolean` and `refusalReason: text|null` to `StudioContractOfferSnapshot`**,
computed from the authorities `signActorConversion` / `liveRefusal` already ask (`canAfford(state, offer.signingBonus)`, the founding gate, hiring-market membership) — the shape the
Laboratory already publishes per action (`enabled`/`disabledReason`) and casting per candidate (`available`/`availabilityLabel`). DTO name stated; schema, adapter, paired seal and
bridge-contract check are the writer's. If it is **not** adopted, Unity must not invent the mapping: the row shows the published terms only and the refusal appears at quote time, where
it is authoritative. **No other field is missing** — identity, employment, assignment, presence, attention, contract and renewal terms, termination cost, per-cell placement legality,
the twelve rejection codes, unmet requirements, cost/opex/completion/capacity and every Laboratory label are already on the wire.

**Routing.** §2 bottom law → `StudioWorkspaceHost.ApplySharedTextSize` (the `170f`/`28f`/`190f` block, ~:365-375, ~:2129-2322) + `StudioLaboratoryWorkspace:41`. §0 N3 anchor fix → the
same method: pass `personInspectorCard` through the existing F10 `entryRight`/`entryMaxWidth` clamp and multiply its width by `StudioTextSizePreference.Multiplier`, exactly as
`inspectorCard` already is (~:2205-2214 authored, ~:377-384 clamped). §2 filters → `StudioRosterWorkspace` (`roster-controls`). §4 → one shared footer helper generalised from
`StudioRailReturnContracts.LaneInspector*`, publishing `<surface>-more-actions`/`-more-list`. §5 → `StudioBuildWorkspace` (~:205-266: move `strip` out of `details`, drop `reasonList`'s
own ScrollView) + `StudioBuildPlacementDriver` (~:128-140 reason label). §6 pageSize → `StudioLaboratoryWorkspace` page request. §7 → `StudioRailKeyboardFocus` + each surface's tab
order. W1 constant → `StudioPeopleWorkspaceLayout.ScaleText`.

**Provenance (read only, no writes).** Unity `0703ed7a`: `StudioProfileWorkspace.cs` (+`Context`), `StudioRosterWorkspace.cs` (+`Context`), `StudioPersonInspectorCard.cs`,
`StudioCastingInspectorCard.cs`, `StudioTalentMarketControls.cs`, `StudioPeopleWorkspaceLayout.cs`, `StudioBuildWorkspace.cs`, `StudioBuildWorkspaceContracts.cs`,
`StudioBuildCommandHud.cs`, `StudioBuildPlacementDriver.cs`, `StudioLaboratoryWorkspace.cs`, `StudioWorkspaceHost.cs`, `StudioPersonInspectorContracts.cs`. TS `efbf9ab2`:
`bridge/people.ts`, `bridge/contract.ts`, `bridge/casting.ts` (hiring market + sign conversion), `bridge/placement.ts`, `bridge/laboratory.ts`, `bridge/schema/bridge-schema.ts`
(:1218-1263), `src/core/employment.ts`.

**Evidence limits — what was rendered and what is paper.** `[REN]` is **six element maps, all 1440x900 / 100 %**, on the private evidence branch: Profile
`early-2026-09-13T05-56-56-475Z/019-map.json` and `early-2026-09-15T06-25-20-387Z/009-map.json` (the R-A run named in the brief); Roster `early-2026-09-12T17-59-58-223Z/015-map.json`;
Build preview `early-2026-09-12T16-36-55-588Z/013-map.json` and parcel chooser `011-map.json`; Laboratory `early-2026-09-12T16-52-23-347Z/008-map.json`; casting inspector card
`early-2026-09-12T15-49-12-323Z/006-map.json`. **Correction to the brief's pointer:** `early-2026-09-15T20-19-22-804Z/008-v2-081-full-profile.png` exists, but its sibling `008-map.json`
publishes **no visible `profile-*` element** — no map in that run does — so no measurement was taken from it. Every 1280 column and every 150 %/200 % row in §2 is **arithmetic**, not a
measurement, and must be re-measured by the writer against the styles that draw; the Roster/Build/Laboratory body widths at 1280 are unknown here. No capture was taken, no Editor
launched, no native input performed, no Unity or TS source changed. Every defect in §0 — the person-inspector anchor, the `170 → 28` bottom jump, the id-as-disambiguator, the
tooltip-only filter semantics, the build quote strip inside the body scroll, the nested `build-reasons`, the 433-of-439 action row — is a reading of committed source and of those six
maps, **not an observed runtime failure**. Nothing here changes the hybrid selection, the rails, the band, the memo sheet, the lane inspector, `MinimumLot`, route preservation, any
G-number, or the Laboratory copy law.
