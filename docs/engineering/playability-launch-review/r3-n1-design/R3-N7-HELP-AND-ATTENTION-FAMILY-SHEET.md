# R3-N7-DESIGN-09 — 3A contextual help + 4B selective attention / retrievable history (family sheet)

**Task** R3-N7-DESIGN-09 under the Owner directive of 2026-09-15 and `plans/R3-OVERHAUL-PLAN.md` phase **N7** upstream item. **Mode** DESIGN_PROTOTYPE — this file is the whole change. No source, test, build,
capture or native input was produced; the Unity worktree was read only (HEAD `46e0fae7`) and the Editor was never launched. TS worktree `277276f0`, branch `wip/playability-interaction-01-ts`.
**Binding** Owner clarification `f2921730:docs/operations/UIUX-WHOLE-GAME-OVERHAUL-OWNER-CLARIFICATION.md` **§8 — 3A contextual explanations only** (labels, blocker reasons, contextual tooltips/focus information,
on-demand help; **no** guided first-film introduction, **no** forced step-by-step tutorial; costs/risks/safe commitment reviews stay visible) and **4B selective attention** (routine progress quiet; genuine
decisions get prominent persistent cues with the exact destination; important information retrievable; no new pauses, no changed simulation time or deadlines, no mandatory interruption). Also binding:
`R3-N2-TEXT-RULES-ADDENDUM.md` W1–W6 and §4, `R3-N1-SHEET-REVISION-02.md` R1/R1.5, `R3-N3-VISUAL-STANDARD-SHEET.md`, the N4 More-actions law (§4) as generalised by N5 §4 and N6 §5, the N4/N5/N6 attention rows, and
`plans/N7-N8-LEGALITY-AND-RETRIEVABILITY-INVENTORY.md` **Part 2** — every cue routes to a durable row; the one new read-only projection is `operationsEventsProjection`; **contract-lifecycle rows and casting-review
completion are named dependencies, never an invented journal.** No P13B mechanics. No universal undo. No auto-pause.

**Labels** `[NAT]` hand reading of committed source (paper, never a runtime observation) · `[REN]` read off an existing rendered element map · `[R3]` an already-selected law · `[REC]` this sheet's recommendation ·
`[GAP]` named dependency.
**Constants** `m` = `StudioTextSizePreference.Multiplier` (1 / 1.5 / 2); `s` = `StudioLegacyUiMetrics.CurrentScale` = **1** at both targets; `T` = 94 / 166 / 190; `bodyMin` = `3 × 18·m + 12·s` = **66 / 93 / 120**;
`envelope` = `viewportH − T − 12·s` = 614/542/518 (1280x720) and 794/722/698 (1440x900) — all inherited from N5 §2 / N6 §2 unchanged, not re-derived here.
**Rendered basis** `[REN]`: element maps of `Evidence/Playability-Interaction-01/early-2026-09-16T02-13-05-779Z` (Build55-era, 1440x900 / 100 %, 638 distinct element names) plus the maps cited by N4–N6. **Two facts
read off those maps and used below:** the only element name in the whole corpus containing "attention" is `roster-attention-only` (a roster *filter*), and **no element name contains "help"** — confirming N6 G10
`[NAT]` that no help surface exists anywhere in the client.

## 0. Executive summary — disposition per screen family

| # | Screen family (owner) | Disposition | Why |
|---|---|---|---|
| H1 | Lot lane / HUD rails / next-action band (`StudioPeopleRailHud`, `StudioProductionRailHud`, `StudioHud`, `memo-next-band`) | **refine** | Composition, routes and rail laws all stand (REVISION-02 R3/R4). N7 adds the focus-information line and one `lot-help` sheet, and makes the band the single prominent-cue owner (§2.5). |
| H2 | Compact lane inspector (`StudioLaneInspectorHud`) | **refine** | R1's clamp already owns the rect; help is one more body block and `inspector-help` is one more chrome control, both inside the existing law. |
| H3 | Development card (`StudioDevelopmentCardHud`) | **refine** | `board.projects[].attention` now exists on the wire (R3-N4-SIM-20) `[NAT]`; the card renders it instead of re-deriving from `status`. |
| H4 | Production workspace (`StudioProductionWorkspace{,.Remedies}`) | **refine** | N4's footer redesign already pins the refusal; the focus line sits in that same pinned strip and needs no further re-form. |
| H5 | Casting workspace (`StudioCastingWorkspace{,.ReviewAcknowledgement}`) | **refine** | `packageReadiness.blockers[]` is already the model inline-refusal source. One tooltip-only string must move into copy (§1.2). |
| H6 | Release result (`StudioReleaseResultWorkspace`) | **retain with evidence** | Disclosure is complete and periodised; it gains only `release-result-help` and the shared focus line. |
| H7 | Profile / Roster (`StudioProfileWorkspace`, `StudioRosterWorkspace`) | **refine** | `renewReason` / `releaseReason` / `locateReason` already render beside their controls; help adds the standing cohort vocabulary. The renewal cue is a **named dependency** for history (§2.4). |
| H8 | Build (`StudioBuildWorkspace`, `StudioBuildPlacementDriver`) | **refine** | N5 §5 already pins `primaryReason`; `build-help` folds first under the chrome law (§1.3). |
| H9 | Laboratory (`StudioLaboratoryWorkspace`) | **retain with evidence** | `actions[].detail` **is** the contextual help, verbatim `[NAT]`; the help sheet only names the terms, it never paraphrases the copy. |
| H10 | Finance (`StudioFinanceWorkspace{,.Extensions}`) | **refine** | `attention: {id,message,route}[]` landed at projection 31 `[NAT]`; each line now renders with its destination control (plan C11 Alt A for the two null-route ids). |
| H11 | Industry (`StudioIndustryWorkspace`) | **refine** | Withholding copy is retained verbatim; help states the public/private law once, on demand. |
| H12 | History (`StudioHistoryWorkspace{,Context,Contracts}`) | **refine (extend, do not fork)** | The Timeline tab becomes the retrievable destination for `operationsEventsProjection` rows (§3). Tabs, the 4 significance chips, contracts and the retained context are unchanged. |
| H13 | System Menu incl. campaigns / text size (`StudioSystemMenuHud.*`) | **refine** | IMGUI help form (§1.2); `SaveOrLoadDisabledReason` is already the model refusal. Text-size persistence stays the N6 `[GAP]`. |

**Refused here:** no tutorial, no first-film walkthrough, no guided sequence, no auto-pause, no new interruption, no journal, no universal undo, no new SVG, no colour-only cue, no tooltip-only fact, no new wire
field beyond the one projection named in §5.

## 1. The 3A help owner

### 1.1 One mechanism, three parts — and only these three

| Part | What it is | Where it lives | Never |
|---|---|---|---|
| **(a) Focus-information line** | ONE wrapped line, updated on focus **and** on hover, reading *what this control does · what blocks it · what it costs* — assembled only from fields the surface already publishes | the pinned strip, directly **above** the footer action row, inside the final rect (R1.3) | never the only rendering of a cost or a refusal; never carries a fact absent from the wire |
| **(b) On-demand help sheet** | `<surface>-help`: a `?`-labelled toggle that opens a 2–6 sentence block **inside the existing body scroll**, at the top | chrome group, tab-order last within it; **F1** toggles it for the focused surface | never a modal, never a layer, never input-owning, never unprompted, never sequenced, never gating a control |
| **(c) Inline blocker reason** | the refusal sentence rendered **beside** the disabled control it refuses — already the law | wherever the control draws | never behind hover, never collapsed, never summarised |

(c) is not new. It exists today as `disabledReason` (`bridge/laboratory.ts:23-24, 232`), `refusalReason` (`bridge/schema/bridge-schema.ts:1265` contract sheet, `:1615` set commission, `:1656` contract),
`primaryReason` (`:1584` placement), `renewReason` / `releaseReason` (`:1785,1788`), `locateReason` (`:1828`), `blockedReason` (`:496,1826`), `release.decisions[].refusal` (`:2093`) and casting
`packageReadiness.blockers[]` (`bridge/casting.ts:261-264`). **N7 adds no refusal source; it requires that every disabled control has one and that a disabled control keeps its tab stop and reads it** (N4 §7, N5 §7
— unchanged).

**F1 is free** `[NAT]`: `grep KeyCode.F1` over `Assets/Studio/Runtime` returns nothing, and F1 is not consumed by a focused text field, so it does not collide with `people-search`, `roster-search`, `pictures-find`
or `campaign-name-input`. `?` (Shift+/) is **not** used, precisely because it does collide with those fields.

### 1.2 The three tooltip-only strings that must move — the whole existing "contextual help" surface `[NAT]`

`grep -i tooltip` over `Assets/Studio/Runtime/Presentation/UI` returns exactly three live assignments, and N2 §4(1) forbids all three as the only rendering: `StudioTalentMarketControls.cs:75` `"Search person names
only. Genre and specialty have separate controls."`; `StudioTalentMarketControls.cs:223-225` the cycle-button tooltips (the cycle order N5 already flagged); `StudioCastingWorkspace.cs:2885` `"Waiting for the
original review confirmation."`. `[REC]` each becomes a **focus-information line** (a) for its control and, where it explains a term rather than a control, a line of that screen's help sheet (b). The tooltip
attribute may remain as a convenience; it is never the only copy.

### 1.3 Geometry per cell (W1–W6, 1280x720 / 1440x900 × 100 / 150 / 200 %)

**The help sheet (b).**
```
control   <surface>-help : 34·m square = 34 / 51 / 68, chrome group, tab-order last (W3). Close = second press, or Escape rung 2c (§1.4). State is per-surface.
block     the FIRST block of the scrolling body — directly BELOW the complete-title block when R1.2's ladder has already moved a title there.
width     the body's content width; every sentence wraps, never truncates (W1, §3 Long copy). Paddings 6·s; a 1·s Keyline beneath, drawn INSIDE the scroll.
clamp     helpMax = body — the block MAY fill the body; it NEVER gets its own scroll (W4).
bodyMin   unchanged: help is INSIDE body, not a term of the clamp — `header + footer + bodyMin <= rect.height` is evaluated identically open or closed (W5, R1.3).
```
Because help is a body block, **no cell changes its clamp**: the six cells of R1.4 / N4 §2 / N5 §2 / N6 §2 are re-used unaltered. The honest cost is stated instead of hidden: at **1280x720 / 200 %** the body is
`120` px and a 4-sentence block at `18·m` = 36 px per drawn line is ≈ 8 lines ≈ **290 px**, so help fills the body and the surface's own content is reached by scrolling or by closing help — one key away, with the
`?` control pinned in the chrome. That is a scroll cost, not a lost route, and it is the correct trade for never making help a layer.

**The focus-information line (a).**
```
height  1 line = 18·m + 4·s = 22 / 31 / 40 at footer.yMin − height, inside the pinned strip;  2 lines = 2 × 18·m + 4·s = 40 / 58 / 76 (wrap is the FIRST remedy, N2 §4(2))
footer  footerCtl becomes 12·s + line + max(34·m, measured action row) + 14·s = 82 / 108 / 134 at one line
```
Re-checked against the tightest published cells: Production 1280x720 / 200 % (N4 §2) — `envelope 518 − header 85 − identity 42 − footer 134` leaves **257** for body + context, clearing `bodyMin` 120 with the
context block ceiling falling 177 → **137** `[REC]`. Lane inspector 1280x720 / 200 % (R1.4) — the 310 px ceiling is `96 + 94 + 120` with **zero** margin, so the line cannot be added there as a fourth term: `[REC]`
**in the compact inspector the focus line is the first body line, not a pinned strip term**, which costs nothing in the clamp and keeps R2.3's honest margin intact. Every other surface in N4/N5/N6 clears `bodyMin`
with the pinned line at all six cells.

**How the focus line yields under the More-actions law** (N4 §4 as generalised). Order, and only this order: (1) the footer wraps to a second row; (2) the footer sheds to `<surface>-more-actions`, primary action
kept; (3) **only then** does the focus line clamp from two rendered lines to one, with the complete sentence published as the element's registry text — lawful **only** because the inline blocker reason (c) is the
non-hover complete rendering of the same fact (N2 §4(1)); (4) the line is never removed, and the inline reason never clamps at all.
**Chrome fold order** `[REC]`: when a chrome group cannot fit (N5 §4.1's five-control profile is the flagship), `<surface>-help` folds **first** — it is the only chrome control that carries no cost, no route to a
decision and no state — and it keeps its name, its registry text and its F1 key while folded, so no route is lost.

### 1.4 Escape ladder position

The §C.8 ladder is unchanged; rung 2 gains a stated internal order so the behaviour is deterministic: **(2a)** an open More-actions list closes; **(2b)** an expanded group / open compare closes; **(2c)** the help
block closes. Help is last because opening it **does not move focus** (N6 §5 change 3): the control the player is actually in closes first, and a keyboard player never has to escape *out of* help.

### 1.5 Per-screen help copy (≤ 6 lines each; player language, present tense, Backlot vocabulary; every line names the exact wire field it explains)

| Screen | Help lines |
|---|---|
| **Lot lane / rails / band** | 1 "The left rail is your people; the right rail is your pictures." (`people.roster.counts`, `productions[]`) · 2 "A picture's stage word is its state, not its progress." (`operationalState`, `stateLabel`) · 3 "Amber plus a word means a decision is waiting for you." (`StudioBuildingSnapshot.attention`, `attentionReason`) · 4 "The band names the one next step and where it happens." (`board.worldStatus`, `attentionPennant`) · 5 "LOCATE moves the camera. It changes nothing." (`locatable`, `reason`) |
| **Compact inspector** | 1 "This card is the same record the rail row shows." (`projectId` / `productionId`) · 2 "UNKNOWN STAGE means this client cannot name the stage — not that one is hidden." (`operationalState='status-unavailable'`) · 3 "More actions holds the rest of this record's routes, never a different form of it." (`LaneInspectorFooterMode`) |
| **Development** | 1 "A screenplay in review is waiting on your decision." (`projects[].attention`) · 2 "Rewriting spends weeks; the preview names what changes." (`rewrite.preview`) · 3 "The due week is when the decision expires, not when the script does." (`dueWeek`, `weeksUntilDecision`) · 4 "Commissioning a screenplay holds a writer." (`commission.blockers[]`) |
| **Production** | 1 "One command is published per picture per week." (`currentCommand.label`) · 2 "Blocked means something else holds what this picture needs, and for how long." (`blockerAnatomy.occupants[].freesInWeeks`) · 3 "Waiting is time passing; there is no action to take." (`operationalState`, `stateWeeksRemaining`) · 4 "A remedy opens the place where the blocker can be cleared. It commits nothing." (`blockerAnatomy.remedies[]`) |
| **Casting** | 1 "A screen test is free, holds nobody, and takes one week." (`consequence`) · 2 "Comparing changes nothing. It is a view." (`ComparePins`, cap 4) · 3 "A blocker names the role and the person holding it." (`packageReadiness.blockers[]{role,message,remedy}`) · 4 "Queued means the studio will act when a seat opens." (`willQueue`, `greenlightQueued`) · 5 "Greenlight prices the package as it stands now; changing it re-prices it." (`IsGreenlightQuoteDisplayed`) |
| **Release result** | 1 "Projected figures are a run in progress, not a final result." (`projected`, `runStatus`) · 2 "Credited weeks are the weeks already paid." (`weeksCredited`, `totalWeeks`) · 3 "The release week is fixed; 'weeks ago' moves with the calendar." (`releaseWeek`, `weeksAgo`) |
| **Profile / Roster** | 1 "Employment and assignment are two different facts." (`employment.statusLabel`, `work.label`) · 2 "The renewal window opens 26 weeks before a contract ends." (`contract.renewalOpen`, `endWeekExclusive`) · 3 "Early release pays half the compensation still guaranteed." (`terminationCost`) · 4 "A monogram means no body exists for this person on the lot." (portrait rig availability) · 5 "Counts describe who is shown, not who exists." (`roster.counts`) |
| **Build** | 1 "A preview commits nothing; the studio re-checks the site and the price when you build." (`placementQuote`, commit revalidation) · 2 "Each cell is judged separately." (`cellLegality[]`) · 3 "Capital cost is charged now; weekly cost starts when the building opens." (`cost`, `weeklyOperatingCost`, `completesOnWeek`) · 4 "A set is commissioned onto a stage, not onto the lot." (set `refusalReason`) |
| **Laboratory** | 1 "A ceiling is what you allow, not what is charged." (`budgetLabel`) · 2 "One scientist can use only so much per week." (`actions[].detail`) · 3 "An estimate moves with the bottleneck." (`bottleneckLabel`, `estimateLabel`) · 4 "Payroll is separate from research spend." (`budgetLabel`) |
| **Finance** | 1 "Cash is what you hold now." (`cash`) · 2 "Net cashflow is what the next advance is already committed to move." (`netWeeklyCashflow`) · 3 "Runway is an estimate at the current pace, not a forecast." (`runwayState`, `paceBasis`) · 4 "Not recorded is not zero." (`coverage`, `Available()`) · 5 "Each attention line names where to go." (`attention[]{id,message,route}`) |
| **Industry** | 1 "Industry shows only what is public." (`businessNotice`) · 2 "Rankings are separate lanes; there is no combined score." (per-lane `meaning`) · 3 "Authored starting history is labelled as such." (`provenance`) · 4 "Your own studio is the only route into private figures." (`player`) |
| **History** | 1 "Landmarks are kept permanently." (Tier D kinds) · 2 "Routine operating detail is kept in full for <routineWindowWeeks> weeks, then folded into one exact summary." (`standing.routineWindowWeeks`) · 3 "Operating events are kept for <windowWeeks> weeks." (`operationsEventsProjection.windowWeeks`) · 4 "Nothing before the recording week is reconstructed." (`notRecordedNotice`) · 5 "A row routes back to its subject when that subject still exists." (`subjectLocation`) |
| **System Menu / campaigns / text size** | 1 "Save keeps this campaign under its name; Save As makes a named copy and opens the copy." (`CampaignLibrary`, `activeCampaignId`) · 2 "Leaving without saving is always reviewed first, and the review names what is not included." (`unsavedDisposition`) · 3 "Text size applies immediately." (`StudioTextSizePreference.Percent`) · 4 "Text size returns to 100 % when the studio restarts." (`[GAP]`, N6 §3 — state the limit, do not hide it) |

## 2. The 4B attention model

### 2.1 The two-tier law

**Tier 1 — ordinary waiting is quiet.** Time passing, work in progress, a queue position, a contract with a year to run: a **state word in the row** and nothing else. No mark, no count, no colour change, no sound,
no movement, no interruption. Sources that are Tier 1 by construction: record attention `active` / `waiting` / `ready` / `none` (`bridge/schema/bridge-schema.ts:59-61` `recordAttention`), production/building
attention `normal` / `active` / `positive` / `future` / `recently-completed` (`:84-94`, `:406-414`), person attention tier `info`.

**Tier 2 — a genuine decision is prominent and persistent.** Only these qualify: record attention `decisionRequired` (Development `board.projects[].attention`, Casting `projects[].attention`); production/building
attention `decision-required`; `release.decisions[].legalCommit === true`; person attention `tier === 'decision'` (cohort `renewal-open`); Finance `attention` id `contract-renewals`. Every Tier-2 cue carries **its
exact destination** (the control that resolves it), stays until the authoritative fact leaves the wire, and never pauses, never re-times, never blocks input.

**Deliberately Tier 1, with the reason.** `blocked` is **not** a decision — the player cannot act on it this week — so it is a quiet state word plus its inline reason. `cash-in-red` (`runwayState === 'inRed'`) is a
**condition**, not a decision: `[REC]` it is prominent **once per transition** of `runwayState` and then demotes to a pinned quiet Finance row, so a long campaign in the red is not a permanent alarm.
`recording-coverage` is never prominent; it is a disclosure line.

### 2.2 The cue vocabulary — word + colour + glyph, never colour alone

| Tier | Word (always drawn) | Colour token | Glyph | Where the identical cue appears |
|---|---|---|---|---|
| Decision (Tier 2) | **"Decision"** + the destination, e.g. `Decision · Review renewal ▸` | `Action` `#75291A` | `assets/icons/attention.svg` (N3 §2.3; `◆` until it is adopted) | rail row · picture card · workspace header · lot next-action band |
| Blocked | **"Blocked"** + the inline reason | `Blocked` `#8C590F` | none | the row and its inspector only |
| Waiting | **"Waiting · <cause>"** | `Waiting` `#576675` | `waiting.svg` | the row and its inspector only |
| Confirmed / done | **"Done"** / the engine's own word | `Committed` `#296638` | `confirmed.svg` | the row, then History |

One cue, one vocabulary, four surfaces. The rail row, the picture card, the workspace header and the band draw the **same word, the same colour token and the same glyph** for the same fact — never a dot in one
place and a sentence in another. Colour never carries the state alone (N2 W6 / P09-REQ-015), and **focus (blue `Focus` at `3·s`) ≠ selection (brass) ≠ attention (amber + word)** stays true at all three text sizes.

### 2.3 Badge clears, history persists

Two different objects, and conflating them is the bug this law exists to prevent.

* **The row's own cue** (§2.2) is *authoritative state*. It clears **only** when the authoritative fact leaves the wire — never on viewing, never on a timer, never on acknowledgement. This is N4 §6 unchanged.
* **The aggregate badge** — the count/mark on the rail header, the lot band and a workspace chip that says *come here* — is the flood-prone object, and it **is** acknowledgeable.

```
owner      CLIENT state: StudioAttentionAcknowledgement, a host-level session store beside the retained workspace contexts in StudioWorkspaceHost — NOT inside
           any one workspace context, which is exactly why it survives a workspace switch and a Back.
key        cueId = "<family>:<stableId>"  e.g. "casting:script-0001", "person:t-dir-00", "production:prod-0015", "finance:contract-renewals"
value      factStamp = the EXACT authoritative discriminator already on the wire, never a clock: records -> attention (+ sessionId where published);
           production -> attention + currentCommand.label; person -> attention.cohort + contract.endWeekExclusive; release -> legalCommit + productionId;
           finance -> attention[].id + runwayState
cleared    by activating the cue's destination control (an explicit route), or by the fact leaving the wire.
NOT by     hovering, focusing, scrolling past, opening help, or a week advancing.
re-arms    ONLY when factStamp differs from the stored stamp — a new sessionId, a renewed endWeekExclusive, a changed attention value, a new currentCommand.
lifetime   the session. A client preference, not campaign state, and deliberately NOT persisted: an unacknowledged decision returning after a restart fails safe.
```
**And the outcome stays retrievable after the cue is gone** — that is §3's whole purpose. The cue is the pointer; History is the record.

### 2.4 Every current cue → its authoritative source → its durable destination

Rows follow the inventory's Part 2 table; `[DEP]` marks the two named dependencies, which this sheet does **not** design around by inventing a journal.

| Cue | Authoritative source field | Durable destination row |
|---|---|---|
| Screenplay awaits review | `board.projects[].attention === 'decisionRequired'` (`bridge/development.ts:229`) | `operationsEventsProjection` `phaseEntered`; narrative `filmReleased` (`bridge/history.ts`) |
| Development board pennant | `board.attentionPennant` (`bridge/development.ts:408`) | same as above |
| Casting review ready | `projects[].attention === 'decisionRequired'` (`bridge/casting.ts:250`) | **`[DEP]` casting-review completion has no history kind** — the cue routes to the project, and the *outcome* becomes retrievable only when the sim dependency lands |
| Queued intent expired | `expiryNotices[]{eventSeq,queueOrdinal,projectId,reason}` (`bridge/casting.ts:270-298`) | `queueIntentExpired` (Tier W) — **already durable**; the projection slices to 8, History shows all inside the window |
| Queue admitted | `state.studioEvents` `queueAdmitted{entryKind,ordinal}` (`src/core/studioEvents.ts:101`) | `operationsEventsProjection` — stored today, published by nothing |
| Picture needs a decision | `StudioProductionRowSnapshot.attention === 'decision-required'` + `currentCommand` (`bridge-schema.ts:406-415`) | `phaseEntered`, `sceneryArrived`, `wrapped` |
| Lot building attention | `StudioBuildingSnapshot.attention` + `attentionReason` (`bridge-schema.ts:84-94`) | same |
| Release can be committed | `release.decisions[].legalCommit` (`bridge-schema.ts:2092`) | `releaseCommitted` + `premiere` (Tier D, permanent) + narrative `filmReleased` |
| Renewal window open | `profiles[].attention.tier === 'decision'`, cohort `renewal-open` (`bridge/people.ts:699-704`) | **`[DEP]` contract-lifecycle rows** (signed / renewed / expired / released). `StudioHistoryEvent` has no contract kind (`src/core/types.ts:1637-1691`) |
| Contract ends in 26 / 52 weeks | cohorts `contract-ends-26` / `-52` (`bridge/people.ts:705-716`) | same `[DEP]` |
| Blocked on the lot this week | cohort `presence-blocked` (`bridge/people.ts:694-696`) | `reservationGranted` / `reservationReleased` via `operationsEventsProjection` (26-week window, stated) |
| Finance renewals | `attention[]` id `contract-renewals`, `route.kind='profile'` (`bridge/finance.ts:112-118`) | the profile route today; the durable row is the same `[DEP]` |
| Finance in the red / coverage | ids `cash-in-red`, `recording-coverage`, `route: null` (`bridge/finance.ts:109,119`) | in-screen: the current period card and the recording-boundary line — plan **C11 Alt A**, routed client-side off the stable id, no new wire kind |
| Construction / set outcomes | — | `constructionCompleted`, `setBuilt`, `setRetired` (Tier D) + narrative `facilityCommitted/Completed/Demolished/Moved` |
| Journey narration | `firstFilmJourney` `whatHappened` / `waiting.reason` | **none, by construction — and none is added.** The cue points at `phaseEntered` / `filmReleased`. *Do not add a journey log.* |

### 2.5 The alert-flood guard

**Cap: 3 simultaneous prominent cues on screen** `[REC]`, one per persistent surface — the lot next-action band (1), the people rail header (1), the pictures rail header (1). The cap is a property of the
composition, not an arbitrary number: those are exactly the three always-visible attention owners, and §C.4 priority already gives the band one next step.

Beyond the cap nothing is dropped — it is **counted**: each rail header publishes `<rail>-attention-more` reading `"+N more decisions ▸"`, routing to a list that already exists (`people.attention.cohorts[]` for the
people rail; the `pictures-filter` decisions filter for the pictures rail). A workspace header shows only its own surface's cue and is not counted against the cap.

**Ordering when the cap is exceeded — deterministic, and never by recency:** (1) Tier 2 only; (2) within Tier 2, the wire's own published order — `COHORT_LABEL[].order` for people (`bridge/people.ts:785-791`:
`work-ambiguous` 0, `presence-blocked` 1, `renewal-open` 2, `contract-ends-26` 3, `contract-ends-52` 4), and array order for the record projections, which are already deterministic; (3) tie-break by ascending
stable id (`talentId`, `projectId`, `productionId`). Never by week, never by amount, never by "newest".

## 3. The retrievable-history route — `operationsEventsProjection` in `StudioHistoryWorkspace`

**Extend, do not fork.** N6 G5 places History; §3 adds rows to its **Timeline** tab list (`history-list`), merged with the narrative rows and ordered by `week` then by the row's own monotonic id. No new tab, no new
workspace, no second list, no new chip.

**The projection (TS sim-core item; the DTO name is stated, the implementation is not this sheet's).**
```
BridgeOperationsEventSnapshot = {
  seq, week, kind,                          // kind = StudioEventKind, the 12 kinds in src/core/studioEvents.ts:88-113
  tier: 'permanent' | 'windowed',           // isTierDStudioEventKind(kind)
  significance: 'major' | 'standard',       // Tier D -> 'major'; Tier W -> 'standard'  <- reuses the EXISTING 4 chips
  headline, detail, subjectId, subjectLabel,
  subjectKind: 'film' | 'production' | 'facility' | 'set' | 'queue' | 'resource',
  filmId, personId, buildingId }            // the SAME route triple as BridgeHistoryEventSnapshot (bridge/history.ts:73-80)
BridgeOperationsEventsProjection = { currentWeek, windowWeeks: 26, oldestWindowedWeek, coverageNotice, rows[] }
```
**Row anatomy** (identical to the shipped event row, so one renderer serves both): `history-event-when` (week) · `history-event-what` (headline) · `history-event-subject` (subjectLabel) · `history-event-detail` ·
the route control. Operations rows take the id prefix **`op-<seq>`**, distinct from the narrative `ev-<eventId>` namespace seen in the captures (`history-locate-ev-12` `[REN]`), so no id collides.

**Week ordering.** Ascending `week`; within a week, narrative rows first (they are the landmarks), then operations rows by ascending `seq`. `nextSeq` never rewinds and compaction never renumbers
(`src/core/studioEvents.ts:196-215`), so a stable order survives compaction.

**Coverage sentences, rendered from the wire, never written by hand.** Tier W: *"Operating events are kept in full for the last `<windowWeeks>` weeks — Week `<oldestWindowedWeek>` to Week `<currentWeek>`. Earlier
operating detail is not kept."* Tier D: *"Wrapped, premiere, release, construction and set records are kept permanently."* Both sit above the list, beside History's existing `notRecordedNotice` and the standing
fold sentence.

**Permanent (Tier D) rows** — `wrapped`, `premiere`, `releaseCommitted`, `constructionCompleted`, `setBuilt`, `setRetired` (`src/core/studioEvents.ts:64-71`). **Windowed (Tier W, 26 weeks)** — `reservationGranted`,
`reservationReleased`, `phaseEntered`, `sceneryArrived`, `queueAdmitted`, `queueIntentExpired`.

**Filter chips — still four, unchanged** `[REN]`: `history-filter-all`, `-landmark`, `-major`, `-standard`. Operations rows publish `significance` so the existing chips govern both lists; `landmark` stays
narrative-only and no fifth chip is added. (N6's `[REC]` to fold the chip strip behind `history-filters-more` at 200 % applies unchanged.)

**Route back to the subject**, using only routes that exist: `filmId` → the P07 result (`history-film-open-<productionId>` `[REN]`); `buildingId` → `placed-<placementId>`, the exact form `bridge/finance.ts` already
publishes, driving `history-locate-op-<seq>`; `personId` → `history-open-profile-<talentId>` — **always null for these twelve kinds**, because none of them carries a talent id, and that absence is stated rather
than guessed. A route whose subject no longer exists renders the shipped absence sentence (`NoCurrentLocationReason` / `NoBodyRightNowReason`) and keeps its tab stop; a missing result **never** falls back to
another result (`ResultUnavailableReason`) — `StudioHistoryWorkspaceContracts` is retained verbatim.

## 4. Acceptance checks the test owner can write (none run here)

**EditMode — help availability, per screen.** (1) Every surface in §0 publishes a `<surface>-help` control, `34·m` square at 100/150/200 %, tab-order last in its chrome group. (2) Every control published as
disabled has a non-empty reason string bound to it, and keeps its tab stop (enumerate `disabledReason` / `refusalReason` / `primaryReason` / `renewReason` / `releaseReason` / `locateReason` / `blockers[].message`).
(3) Every help sheet has between 2 and 6 lines and each line's named field exists in the current schema — a field rename breaks the test. (4) No tooltip is the only rendering of any string (the three §1.2 sites
asserted by name).
**EditMode — "badge clears, history persists."** Acknowledge a cue → the aggregate badge clears, the row's own cue does **not**; advance a week with the fact unchanged → the badge stays clear; change the
`factStamp` → the badge re-arms; switch workspace and return → acknowledgement survives; the durable row for the same subject is present in the History list in every one of those states.
**EditMode — alert-flood cap.** With ≥ 6 Tier-2 facts live, exactly 3 prominent cues draw, `<rail>-attention-more` publishes the exact remainder count, and the drawn three are the §2.5 ordering's first three —
asserted twice with the input order reversed, to prove ordering is not recency.
**EditMode — no tutorial.** No surface opens help unprompted; no help block advances, sequences, pauses, or gates a control; help state never changes `Time.timeScale` or any week counter.
**Rendered PlayMode**, 1280x720 and 1440x900 × 100/150/200 %: the essential route (commission → casting → greenlight → schedule → release) completed with **help only** — no narration — capturing help open at the
tightest cell (1280x720 / 200 %), one focus line at two rendered lines, one clamped focus line beside its un-clamped inline reason, and the three-cue cap with its remainder count.
**TS (sim-core item, not this sheet's):** `operationsEventsProjection` — week/seq ordering stable across a compaction; Tier D rows survive a compaction at `week + 40` and Tier W rows outside the window do not;
`significance` is `major` for exactly the six Tier D kinds; `personId` is null for all twelve kinds; the coverage sentence's numbers equal `TUNING.STUDIO_EVENT_WINDOW_WEEKS` and the live week.

## 5. Disposition per screen, and the exact delta

Dispositions are the §0 table. **Exact deltas: one, and it is the one already named by the plan** — **`operationsEventsProjection` / `BridgeOperationsEventsProjection`** (§3), read-only, over
`state.studioEvents.rows`, no new stored state, no sim behaviour change. `grep operationsEvents` over `bridge/`, `src/` and `ui/src` returns **nothing** today `[NAT]`, so it is a genuine addition and it carries a
schema/projection bump with the usual paired-adoption and fixture-regeneration consequences (plan C11's precedent).
**No other wire field is missing.** Attention vocabularies (`recordAttention`, the 8-value row/building enum), refusal strings, costs, periods, routes (`FinanceRoute`), cohorts and the durable-row triple all exist.
The two `[DEP]` rows in §2.4 — **contract-lifecycle rows** and **casting-review completion** — remain named sim dependencies; N7 designs the cue and the route **around** them honestly (the cue points at the
subject, and the sheet says plainly that the *outcome* is not yet retrievable) rather than inventing a journal to hide the gap.

## 6. Tradeoffs recorded, and what this sheet cannot claim

* **Help fills the body at 1280x720 / 200 %.** Chosen over a modal, an overlay or a smaller face. A layer would own input and break the Escape ladder; a smaller face breaks N2 §4(2). The cost is a scroll and one
  key to close, and it is stated rather than designed around.
* **Acknowledgement does not persist across a session.** A player who acknowledged everything sees the decisions again after a restart. That is the safe failure, and it avoids minting a new persisted preference
  store (the same `[GAP]` text size already has).
* **The cap is 3, not a tuned number.** It is the count of always-visible attention owners. If a native pass shows the remainder counter is reached constantly, the fix is fewer Tier-2 sources, not a larger cap.
* **`blocked` and `cash-in-red` are deliberately quiet.** Both are consequential and neither is actionable in the week it appears; making them prominent is precisely the alert flood the clarification §8 forbids.
  Recorded so a later reviewer sees the exclusion was deliberate.
* **F1 rests on a negative grep.** `KeyCode.F1` appears nowhere in `Assets/Studio/Runtime` `[NAT]`; that a focused `TextField` does not consume it is a reading of UI Toolkit behaviour, **not** an observation, and
  the rendered pass must confirm it.

**Evidence limits.** Paper. Nothing here was built, rendered, captured, measured on a device or played. The `[REN]` facts are three readings of existing element maps (no `*help*` element name exists; the only
`*attention*` name is `roster-attention-only`; the four History chips are `all/landmark/major/standard` and the row id form is `ev-<n>`). Every pixel figure re-uses N4/N5/N6 arithmetic and is not re-measured. The
per-cell footer figures in §1.3 are arithmetic on the recommended law and must be re-measured against the styles that actually draw. No Unity or TS source was changed, no Editor launched, no native input performed.
Nothing in this sheet alters the hybrid selection, employees-left / pictures-right, the operable lot, `MinimumLot`, route preservation or any G-number.
