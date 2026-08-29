# PROJECT: STUDIO — VISUAL DIRECTION PACKAGE 01 — BUILDER ANNEX

**Status: REFERENCE AUTHORITY CANDIDATE — NOT IMPLEMENTATION AUTHORIZATION**

Companion to `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01.md`. Same branch, same
evidence base, same boundaries. **No production code, UXML, USS, scene, prefab, material, shader,
camera or lighting was created or modified. Unity was never launched.**

This annex holds the detail: component anatomy (§A), the additive token proposal (§B), open-source
and official-sample implementation lessons (§C), and the four research atlases (§D–§G).

---

## §A. Component specifications

Thirteen components. For each: information order, visual weight, responsive behaviour, minimum
target size, states, prohibitions, and the **exact authority source expected**.

Three global rules apply to all thirteen:

1. **Information order is fixed and never varies by state.**
2. **A component with no named authority source will eventually invent a number.** Package 05:
   *"No `Unknown` placeholder or invented number — omit the row instead."*
3. **One component, three densities** — rail row, token, full card are one component, so "a person"
   never changes visual language as the player drills in.

---

### A1. Top HUD (executive heartbeat)

| | |
|---|---|
| **Information order** | ① era + week ② transport ③ cash ④ weekly burn ⑤ runway ⑥ menu |
| **Visual weight** | Values `--ps-font-numeric` (30px); labels `--ps-font-meta` (15px) letterspaced caps. **Value always outranks label.** |
| **Zones** | Three, separated by 1px `--ps-color-keyline` verticals with `--ps-space-4` on each side. Grouping is structural, not decorative. |
| **Responsive** | Band height fixed 72px. Below ~1280px logical, runway drops first, then burn. **Era and transport never drop.** Never scale type down. |
| **Min target** | Transport buttons 42×38 minimum, 44×44 preferred. Menu 106×40. |
| **States** | Active speed = filled `--ps-color-brass` chip with `--ps-color-ink-on-brass` label — not a pressed grey box. Paused adds a `Paused` caption below the transport group. Hover +6% lightness. Focus = 2px brass ring. |
| **Prohibited** | Tiny buttons embedded in a long light strip (North Star §9). Cash without a burn figure. Colour-only speed indication. More than one accent hue in the band. |
| **Authority** | Week/era: `lot.week` + era mapping. Cash/burn: finance read model. **Runway is derived — if it is not published, omit the zone; do not compute it in C#.** |
| **Current owner** | `StudioLivingTimeHud.cs` (IMGUI). Clean of P04A.3. |
| **Note** | The original game's HUD gave its **entire centre span to a forward-looking timeline** — the widest element on screen was a calendar of things that had not happened yet. Recommended as a later addition, not P05. |

---

### A2. Production Rail row (project token)

| | |
|---|---|
| **Information order** | ① lifecycle glyph ② picture title ③ phase line (`PHASE · location`) ④ one truth line ⑤ six-segment phase rail ⑥ `[i]` + `[Locate]` |
| **Visual weight** | Title `--ps-font-body` (18px) ink. Phase line `--ps-font-meta` caps in the state hue. Truth line `--ps-font-meta` muted, or state hue when it is a blocker. |
| **Row height** | 116px at 310px rail width. Selected row: `--ps-color-surface-selected` + 4px brass left border. |
| **Responsive** | Below 1280px the rail narrows to 260px and the truth line truncates with an ellipsis — **the phase line never truncates.** Title truncates last. |
| **Min target** | Row 310×116; `[i]` and `[Locate]` 32×32 minimum, 44×44 preferred. |
| **States** | Default / hover (+6%) / selected (brass border) / attention (amber left border + `!` glyph + text) / blocked (red left border + crossed-square glyph + cause text). |
| **Prohibited** | Naked percentages. Invented scene or shot counts. A phase rail that creeps during a hold — **it freezes and appends `Held N weeks`**. Colour-only state. A row with no Locate. Material commit from the rail (North Star §10.1). |
| **Authority** | Title: production identity. Phase: `productionOperations[].phase`. Truth line: `blocker.headline` verbatim when blocked, else authoritative weeks remaining. **The rail never calculates gameplay state.** |
| **Current owner** | `StudioProductionRailHud.cs` (IMGUI). Clean. |
| **Six-segment rail** | Exactly six segments = the six `ProductionPhase` values. Completed solid; current outlined; future quiet `rgb(58,53,43)`. Two-week shooting/post segments may carry two notches. **Labels must fit their pitch** — at a 480px card the six labels sit on a ~72px pitch, which `REHEARSAL` overruns at 12px; abbreviate rather than overlap. |

---

### A3. People Rail row (person token) — **later package, specified so it is not designed twice**

| | |
|---|---|
| **Information order** | ① portrait ② name ③ role ④ current activity ⑤ `[Locate]` |
| **Visual weight** | Name `--ps-font-body`; role and activity `--ps-font-meta` muted. |
| **Row height** | 68px at 212px rail width. |
| **Responsive** | Below 1280px the rail collapses to portraits only, with name on hover **and on focus**. |
| **Min target** | 212×68. |
| **States** | Default / hover / selected / assigned-and-working / assigned-but-idle / unavailable. |
| **Prohibited** | Drag-a-person-off-their-job (the original allowed it; it is explicitly out of scope). Proximity-as-assignment. Decorative crew appearing as roster headcount. |
| **Authority** | `studioPresence` for attendance. **A nearby body is not an assignment** (Package 05). |
| **Activity glyph vocabulary** | Adapted from the original's Star cards, which carried lightning = directed activity, `Zz` = autonomous, camera = assigned but not shooting. The *idea* — one glyph for "what is this person doing to me right now" — transfers; the specific glyphs are re-specified in main §4.7. **Every glyph carries text at first use**; the original's vocabulary was learnable but not guessable. |
| **Known scaling failure to avoid** | A contemporary 2005 review records that past roughly ten people the rail's overflow behaviour became the loudest thing about it, and role was encoded as a **geometric transform of the same artwork** — unreadable at a glance and inaccessible by any measure. Do not encode a categorical attribute as a transform. |

---

### A4. Building attention marker

| | |
|---|---|
| **Information order** | ① the marker ② its tether to the building ③ (tier 2 only) the cause chip |
| **Visual weight** | 42–46px disc, 3px `--ps-color-attention` border on `--ps-color-surface`, glyph in attention hue, with a triangular tail pointing at the building. |
| **Responsive** | Constant screen size across camera distance, clamped so it never exceeds ~8% of the building's screen height. Markers within 40px merge into one counted marker **that expands on hover/focus** — never a permanent collapsed `Stage issue (2)`. |
| **Min target** | 44×44. |
| **States** | Tier 1 (quiet, persistent, no sound, no pause, no camera move) / tier 2 (currently legal decision published by TypeScript) / suppressed while its workspace is open. |
| **Prohibited** | Free-floating corner alert lists. Auto-camera on any alert. Repeating or re-firing alerts. Colour-only severity. A marker that can outlive its owner. |
| **Authority** | Tier 1: `blocker !== null` — anchored to the **stage** only when `bindings.stageFacilityId !== null`, otherwise to the owning building. Tier 2: a published legal decision **only** (which includes `shootingTask.status ∈ {unassigned, ready}`, where `blocker === null` and the red hold language must **not** be used). |
| **Ownership rule (the important one)** | **A marker is never addressable without its owner.** It is a child of the per-stage presenter, reconciled against every snapshot (add / update / destroy). This is what prevents the current Stage B class of defect. It must also cover any Render Objects highlight, because that mechanism filters by GameObject layer and a layer set-but-not-reverted is a stale marker in different clothes. |
| **Current owner** | `StudioStagePresentationRegistry.cs` — **does not exist. Greenfield, zero collision.** |

---

### A5. World nameplate

| | |
|---|---|
| **Information order** | ① picture title (or building name when unoccupied) ② phase/state token |
| **Visual weight** | Title `--ps-font-world` (17px) ink; state `--ps-font-meta` caps in the state hue. 4px left border in the state hue. |
| **Responsive** | Billboarded, constant screen size, with a 1.5px leader line to its anchor. Fades below a minimum zoom rather than shrinking. **One nameplate per active or attention stage** (Package 05). |
| **Min target** | Not a control. If it becomes clickable it inherits 44px height. |
| **States** | Idle (muted, building name) / occupied (brass) / blocked (red) / shooting (hot). |
| **Prohibited** | Ground-plane decals — the current implementation skews them to the camera, renders them low-contrast tan-on-tan, detaches them from their subject and in one Development frame renders one **mirror-reversed**. Two labels on one stage. A historical wrap surviving a new holder. |
| **Authority** | Title and state from the same resolved snapshot that drives the world. **Never a C# literal.** Today seven of nine status strings are C# literals concatenated with a title; only `subject.reason` and `blocker.headline` pass through verbatim. |
| **Lesson from the original** | The original painted room state **on the floor of the room it described**, so diagnosis was read from the management camera. The principle is right and is adopted. The medium is not: perspective floor type dissolved at oblique angles and above 1024×768. Billboarded nameplates keep the principle and fix the medium. |

---

### A6. Compact person card

| | |
|---|---|
| **Information order** | ① portrait ② name ③ role + availability ④ two headline numerics ⑤ cost line ⑥ one primary action ⑦ Locate |
| **Visual weight** | Name `--ps-font-section` (22px). Numerics `--ps-font-numeric` (30px) with `--ps-font-meta` caps labels. Cost `--ps-font-meta`. |
| **Responsive** | 360–420px logical target width. Below that, portrait shrinks to 64px and numerics stack. |
| **Min target** | 44px controls; portrait ≥ 94×116. |
| **States** | Default / hover / selected / cast (check disc) / unavailable (`WILL QUEUE · N WK` chip stating the delay in words). |
| **Prohibited** | A bare scalar with no legend (`OVR 7`, `Fit 62`, `Est. 27.3` all appear today with no unit or scale anywhere on screen). Four restatements of one assessment (the current applicant card states the same judgement four times in four styles). A card whose only action is to accept. |
| **Authority** | Person read model. Ratings only where published; **omit the row otherwise.** |

---

### A7. Compact building card

Reference: **Mockup B.**

| | |
|---|---|
| **Information order** | ① `BUILDING` + name + state badge ② `PICTURE HERE` + title + genre/writer ③ `PHASE · NOW` + six-segment rail ④ role/completion numeric ⑤ exact blocker ⑥ **max one** primary action ⑦ Locate + details |
| **Visual weight** | Name `--ps-font-title` (32px). Picture title `--ps-font-section`+ (24px). Completion figure `--ps-font-display` (44px). Blocker headline `--ps-font-meta` caps in blocked hue; blocker body `--ps-font-body`. |
| **Responsive** | 480px at desktop (= the 360–420px inspector target plus padding). Header and picture identity stay pinned while the body scrolls. |
| **Min target** | Primary 424×48; secondary 200×40 (44px preferred). |
| **States** | Neutral / attention (`NEEDS YOU` chip) / blocked / no-production (`No production assigned` — **never a dash**). |
| **Prohibited** | More than one primary. A blocker detached from its control. A dash standing in for an absent fact. Order changing by state. |
| **Authority** | Building identity is the **stable id** (`casting`, `writers`, `stage-a`) — never matched by title, array order or nearest building. |
| **Anatomy source** | Package 05 Builder Annex §C1. This document supplies weight and treatment only; it does not restate or alter that order. |

---

### A8. Retained workspace header

Reference: **Mockup C.**

| | |
|---|---|
| **Information order** | ① Back ② breadcrumb naming the world origin ③ workspace title ④ commitment state line |
| **Visual weight** | Title `--ps-font-title` (32px). Breadcrumb `--ps-font-meta` caps muted. State line `--ps-font-body`, with the state token in brass. |
| **Responsive** | Header band fixed 104px, pinned. Breadcrumb truncates from the left, preserving the most specific segment. |
| **Min target** | Back 128×46. |
| **States** | Default / focus ring on Back. |
| **Prohibited** | **Two Backs.** Today the build shows an IMGUI `◀ BACK TO STUDIO` band *and* a brass `Back` inside the panel, in two render stacks. Back styled as primary. A workspace that hides which world object opened it. |
| **Authority** | Breadcrumb from the captured `StudioNavigationOrigin`. Back is a **stack pop restoring the exact captured origin** — not a history step, and distinct from Home. |
| **Retention** | Workspace occupies 55–65% from the right; **35–45% of the lot stays visible** (Package 05 §E1), and the origin object stays lit and ringed inside it. |

---

### A9. Role summary

| | |
|---|---|
| **Information order** | ① `ROLES` + `n / total` ② current role (selected) ③ cast roles with names ④ open roles with candidate counts ⑤ `BUDGETS` |
| **Visual weight** | Role name `--ps-font-body`. Current role: selected surface + 4px brass border + `CASTING NOW` in brass caps. Cast: check disc. Open: muted. |
| **Responsive** | 248px column at desktop; becomes a horizontal stepper (`Role 1 of 5`) in narrow/controller layouts. |
| **Min target** | Row 248×60. |
| **States** | Current / cast / open / blocked (budgets not set). |
| **Prohibited** | A count that disagrees with the list beside it — today `0 OF 5 ROLES FILLED` sits above a `Missing:` list naming **seven** items (five roles + two budgets). Sort captions that contradict the adjacent list. |
| **Authority** | Casting read model. |

---

### A10. Candidate card

Reference: **Mockup C.**

| | |
|---|---|
| **Information order** | ① portrait ② name ③ availability ④ two headline numerics ⑤ cost + buyout line ⑥ status badge ⑦ one action |
| **Visual weight** | Name `--ps-font-section`. Numerics `--ps-font-numeric`; **fit-for-this-role is the brass one** because it is the number the decision turns on. |
| **Card size** | 632×152 — at least 2.5 visible above the fold. Today ~1 is visible. |
| **Responsive** | Single column below ~1100px. Compare view uses one column at narrow width. |
| **Min target** | Action 158×34 (44px preferred); card is itself a click target. |
| **States** | Default / hover / selected (`SELECTED` brass outline chip) / cast / pinned-for-compare / will-queue (`WILL QUEUE · N WK`). |
| **Prohibited** | A control sliced by an overlapping panel — today `Remove from Craft` is physically cut by the `NOW CASTING` footer. Pinning as a **precondition** for comparing. A rating with no legend. |
| **Authority** | Candidate read model; fit is engine-published, never computed in C#. |
| **Borrowed rule** | **Put the consequence in the slot** (Against the Storm). The slot should state the concrete deltas *this* candidate causes to *this* production — shoot-days, quality, cost. If the slot states the consequence, most comparisons never need a compare view. |

---

### A11. Consequence panel (modal review)

| | |
|---|---|
| **Information order** | ① what is being committed ② what changes ③ what it costs ④ what becomes irreversible ⑤ confirm / cancel |
| **Visual weight** | Title `--ps-font-title`. Deltas `--ps-font-numeric`. Irreversibility `--ps-font-body` in attention hue. |
| **Responsive** | Max readable content width; **never stretch rows.** Bottom sheet at 72–92% height in narrow/controller layouts. |
| **Min target** | Confirm 48px; cancel 44px. |
| **States** | Reviewable / armed / committing. |
| **Prohibited** | A scrim so light the lot reads through the content (this exact defect was fixed once already, at Wave 7B, by raising surface alpha from 0.92 to 0.97 — do not reintroduce it). A confirm whose label does not say what will happen. Two mechanisms of modality. |
| **Authority** | Engine-published consequence projection. **No forecast that the DTO does not name.** |

---

### A12. Blocker / remedy panel

| | |
|---|---|
| **Information order** | ① effect ② cause ③ consequence ④ narrowest remedy ⑤ explicit Locate |
| **Visual weight** | Effect `--ps-font-meta` caps in blocked hue with a crossed-square glyph. **Cause and consequence are full sentences at `--ps-font-body`, not tooltips.** Remedy is a control. |
| **Responsive** | The top two lines fit without expansion. `Other remedies (N)` expands exact engine rows. Sticky above the safe area in narrow layouts while the body scrolls. |
| **Min target** | Remedy control 44px. |
| **States** | One blocker / multiple (**each stays a separate exact subject** — never `Stage issue (2)`). |
| **Prohibited** | Colour-only severity. Hover-only cause. A generic `Fix` that guesses the remedy. A comma run-on — today: *"Missing: Choose Director, Choose Lead, Choose Antagonist, Choose Support, Choose Craft, Choose negative budget, Choose marketing budget."* Locate offered for a withheld location. |
| **Authority** | `blocker.kind` ∈ `facility-capacity` \| `scenery-load-in` \| `set-unavailable`, plus read-model operation states `director-dispatch` and `take-scheduling`. Headline and reason strings pass through **verbatim**. |
| **Where it anchors** | On the **stage** only when `bindings.stageFacilityId !== null`. `set-unavailable` is raised at rehearsal entry, so its holder is in `preProduction` with no stage — that blocker anchors to its **owning building**, never to an idle soundstage. |
| **Availability contract** | Three tiers (Crusader Kings III, declared as data not view logic): **shown** — irrelevant conditions never render; **valid** — the full checklist renders permanently under a Requirements heading so the gate is readable *before* attempting it; **failures-only** — noisy conditions appear only in the confirm tooltip when they fail. |
| **Two warnings from the original** | (1) Red was **catastrophically overloaded** — one colour covered "needs repair", "you don't own it" and "another film has it", three entirely different player actions. (2) Its drag-validity feedback was **binary** green/red with **no third state for "legal but blocked until X"** — which is precisely what all three of Project: Studio's persisted blockers describe. That third state must exist in this vocabulary. |

---

### A13. Project detail / info affordance

| | |
|---|---|
| **Information order** | ① the `[i]` glyph ② on activation, the retained detail surface |
| **Visual weight** | 32×32 square, 1px keyline, italic `i` in muted ink. Never competes with `[Locate]`. |
| **Responsive** | Always present on a rail row and a card; never hover-only. |
| **Min target** | 32×32 minimum, 44×44 preferred. |
| **States** | Default / hover / focus / active-while-open. |
| **Prohibited** | **Hover-only disclosure.** The original's information bubbles were right-click/hover-summoned; that fails controller, touch and every accessibility requirement. Progressive disclosure is right; hover-as-the-only-route is not. |
| **Authority** | Opens a retained surface bound by stable id. |

---

## §B. Additive token proposal

**Additive only.** No existing value changes. `StudioUiTokens.uss` freezes custom-property and
semantic-class **names** under the P04A contract freeze §3. A test at
`StudioWorkspaceHostTests.cs:314–338` pins the `-unity-text-align: middle-center` declaration on
`Button` and `.primary-action` via `AssertUssRuleContains`; a separate test around `:276–302` pins
the token *names*, including `.focus-visible`. **Changing those two rules breaks a passing test.
Token values are contract-frozen rather than test-pinned — re-tuning them is outside a visual
package's authority either way.**

**Every *colour* value in the surface/keyline group below already exists in
`StudioCastingWorkspace.uss` as a hardcoded literal** — naming those is not a redesign, it gives
names to decisions already made. The sheet carries **19 distinct hardcoded colour literals across 33
declaration sites**, against 7 colour tokens. **The four size/space tokens and the two semantic
colours (`--ps-color-success`, `--ps-color-info`) are genuinely new** and are marked *proposed* in
main §4.2, §4.3 and §4.5.

```
/* PROPOSED ADDITIONS — declared on BOTH :root and .ps-app-root, matching the
   existing file's pattern. Not applied. Not authorized. */

--ps-font-numeric:          30px;   /* numeric emphasis in rows and bands   */
--ps-font-display:          44px;   /* the ONE headline number per surface  */
--ps-font-world:            17px;   /* world nameplates                     */
--ps-space-5:               40px;   /* major band separation                */

--ps-color-surface-raised:  rgb(27,25,22);
--ps-color-surface-sunken:  rgb(16,15,12);
--ps-color-surface-selected:rgb(45,39,27);
--ps-color-surface-band:    rgb(24,22,19);
--ps-color-control:         rgb(39,37,34);
--ps-color-keyline:         rgb(60,54,44);
--ps-color-ink-on-brass:    rgb(24,20,14);
--ps-color-success:         rgb(168,196,122);
--ps-color-info:            rgb(150,170,180);
```

**Housekeeping observed, not performed** (all inside the 🔴 P04A.3-dirty
`StudioCastingWorkspace.uss` — do not touch until it seals):

- `.casting-slate-role-row` and `.casting-slate-role-row Button` (lines 644–655) are **never applied**
  — the code sets `name="casting-slate-role-{key}"` and no id rule exists. Slate chip sizing and row
  spacing silently do nothing.
- `#casting-readiness` is **declared twice** (line 381 and line 902) with conflicting background and
  margin. Later wins by source order; the earlier is misleading dead code.
- `.focus-visible` is declared in the tokens sheet **and asserted by a test**, but applied by no
  runtime path. Either wire it or the test is guarding a fiction.
- `.disabled` is applied exactly once, to a permanently hidden element; real disabled work is done by
  Unity's own `.unity-disabled`.
- **112 named UI Toolkit elements exist in code; only 67 id selectors exist in USS**, and the
  workspace's most-read Labels are unnamed entirely — candidate row identity/stats/cost, nine dossier
  lines, ten compare-column lines, the header phase line, the `Sorted by Fit` label. **Unnamed
  elements cannot be verified by the element map that already exists.** Naming them is the cheapest
  possible precondition for visual acceptance.

**The themeless-panel tax, recorded for whoever owns the next UI pass.** `PanelSettings.themeStyleSheet`
is deliberately null, so the design system hand-authors what a theme would supply: an explicit
built-in font on the root, `-unity-text-align: middle-center` on `Button` in **two** stylesheets,
`Label { min-height: 24px }` as a measurement workaround, `VisualElement { flex-shrink: 0 }` as an
overlap guard plus two id-scoped counter-rules to undo it, the ScrollView's entire internal box model,
and the full Scroller chrome. **Roughly 200 of the 976 USS lines are theme-replacement plumbing,
almost all in hardcoded greys.** This is not waste to be deleted — it is load-bearing — but it is the
reason the sheet has 20 unnamed colours.

---

## §C. Open-Source and Official-Sample Implementation Lessons

Rulings: **REUSE CURRENT SEAM · EXTEND CURRENT SEAM · INDEPENDENTLY REIMPLEMENT PATTERN · DEFER · REJECT.**
Standing default: **LEARN THE PATTERN, DO NOT COPY THE IMPLEMENTATION.**

| # | Pattern | Ruling | Project: Studio ownership | Collision |
|---|---|---|---|---|
| C1 | **Markers are owned children of their subject, never independently addressable** (OpenRA, GPL-3.0, study only) | **INDEPENDENTLY REIMPLEMENT** | `StudioStagePresentationRegistry.cs` — new | **None — greenfield** |
| C2 | **Selection highlight via URP's built-in Render Objects renderer feature** (official Unity docs) | **EXTEND CURRENT SEAM** | URP renderer asset + a layer convention | Low — but the layer must be **reverted**, or it is a stale marker in different clothes |
| C3 | **Per-stage presenter replaces the `stage-a` compile-time singleton** | **INDEPENDENTLY REIMPLEMENT** | `StudioStageProductionPresentation.cs`, `StageActivityEffects.cs`, `StudioSceneValidation.cs:829–856` | **High** — rewrites scene singleton contracts; **P05 prerequisite** |
| C4 | **Three-axis image tolerance**: perceptual per-pixel + absolute count + ratio (Unity GTF ∧ reg-suit ∧ Playwright, three-way convergence) | **EXTEND CURRENT SEAM** | `StudioStageVisualProofRunner.cs` | Low |
| C5 | **Four-way classification**: passed / changed / **new** / **deleted** (reg-suit, MIT) | **EXTEND CURRENT SEAM** | proof-runner manifest | Low — catches "a capture stopped being produced", which pass/fail reports as all-green |
| C6 | **Environment is part of the baseline key** — graphics API, colour space, resolution, MSAA, URP asset identity belong in the key, not in trivia (Unity GTF) | **EXTEND CURRENT SEAM** | JSON sidecar schema | Low |
| C7 | **Baseline resolved from the git graph**, not a checked-in folder; fail loudly when unresolvable (reg-suit key-generator) | **EXTEND CURRENT SEAM** | sidecar + `Tools/p04a1-proof-launch.sh` | 🔴 **launcher is P04A.3-dirty** |
| C8 | **Capture stability as a loop, not a sleep** — re-capture until two consecutive frames match, with a bounded retry budget, then compare (Playwright) | **EXTEND CURRENT SEAM** | proof runner | Med — real GPU cost against a URP scene; needs a retry cap |
| C9 | **Baselines change only under an explicit human act** (all three tools) | **REUSE CURRENT SEAM** | existing evidence discipline | None — already the practice |
| C10 | **Mutual-distinctness assertion across the state set** — every pair of lifecycle captures must differ by more than a floor | **INDEPENDENTLY REIMPLEMENT** | proof runner + `StudioStageVisualProofContracts` | Med — **this is the gap none of the three surveyed tools fills, and it is exactly this project's failure mode** |
| C11 | **Tokenised USS: one shared sheet loaded ahead of per-workspace sheets** (official Unity UI Toolkit guidance) | **REUSE CURRENT SEAM** | `StudioUiTokens.uss` + `StudioWorkspaceHost.cs` | 🔴 host is P04A.3-dirty; tokens sheet is clean but pinned |
| C12 | **World-space UI Toolkit for world markers** (Unity BagelGame, Unity Companion Licence) | **DEFER** *(gate satisfied, not recommended)* | — | Version gate 6.2+ **is met** at `6000.3.22f1`; deferred on ownership grounds, not capability |
| C13 | **Strict column discipline keeps dense lists readable** (OpenTTD GPL-2.0 / OpenRCT2 GPL-3.0-or-later, study only) | **INDEPENDENTLY REIMPLEMENT** | `StudioProductionRailHud.cs` | Low |
| C14 | ProjectPorcupine as an architecture model | **REJECT** | — | Documented rejection: GPL-3.0 and not a coherent maintained architecture to learn from |
| C15 | `Unity-Technologies/ui-toolkit-manual-code-examples` | **DEFER** | — | **No licence declared.** Useful ≠ usable. |

**No dependency is recommended.** Not reg-cli, not Playwright, not `com.unity.testframework.graphics`,
not any third-party outline package. The only adoption recommended is **Render Objects**, which is
already inside URP `17.3.0` and adds nothing.

---

## §D. Original *The Movies* Visual Atlas

**23 frames tabled below. 20 carry binding rulings.** The three excluded from every ruling in main
§8 are marked ⊘: **3b** (REJECT — a scaling failure, retained as a warning), **10b** (PROVENANCE
UNVERIFIED — user-uploaded capture), and **9b** (LATER — a negative finding about what the original
*failed* to do, which informs §12.1 but authorises nothing). Provenance is tagged per frame, and
**no mechanical claim is made from a screenshot alone.**

| # | Subject | Provenance | Source | Ruling |
|---|---|---|---|---|
| 1 | Default studio-lot view | base game | Official PC manual pp. 5, 8, 10 | **ADOPT** |
| 2 | Top date/time/cash/status HUD | base game | Official PC manual pp. 5, 6, 22 | **ADAPT** |
| 3 | Left Star/person rail | base game | Prima pp. 6, 10; manual p. 6 | **ADAPT** |
| 3b ⊘ | Star rail scaling failure | base game | Hooked Gamers review, 4 Dec 2005 | **REJECT** |
| 3c | S&E extension of the rail | *Stunts & Effects* | S&E manual (print 4/14/06) p. 6 | **ADOPT** *(the contract, not the chrome)* |
| 4 | Right movie-card pipeline | base game | Official PC manual p. 7 | **ADOPT** |
| 4b | In-world pipeline rooms (`Crew 3/3`, `Extras 1/1`) | base game | Prima p. 42 | **ADOPT** |
| 5 | Script Office at management distance | base game | Prima p. 41 | **ADOPT** |
| 5b | Script Office interior as ground-painted zones | base game | Prima p. 40 | **ADAPT** |
| 6 | Completed-script handoff | base game | Prima p. 41 | **ADAPT** |
| 7 | Casting Office | base game | Prima p. 41 | **ADOPT** |
| 8 | Role slot as a world object | base game | Prima p. 42 | **ADAPT** |
| 8b | Role identity persisting into the UI surface | base game | Prima p. 99 | **ADOPT** |
| 8c | Drag validity shown on the **target**, not the cursor | base game | Prima p. 13 | **ADOPT** |
| 9 | Active shooting at management distance | base game | Prima p. 42 | **ADAPT** |
| 9b ⊘ | How the player actually **found** the hot stage | base game | Prima p. 42 | **LATER** — negative finding only |
| 10 | Movie-card rail and its place in the loop | base game | Prima p. 42 | **ADAPT** |
| 10b ⊘ | Card glyph vocabulary at legible resolution | **PROVENANCE UNVERIFIED** | user-uploaded 1024×768 capture | **LATER** — excluded from all binding rulings |
| 10c | Right-click inspect and the info-bubble grammar | base game | Prima p. 6 | **ADAPT** |
| 11 | Construction / path / landscaping tools | base game | Official PC manual pp. 6, 11 | **ADAPT** |
| 11b | Paving economy + attractiveness overlay | base game | Prima pp. 14, 38, 40 | **ADOPT** |
| 12 | Building maintenance/occupancy communication | base game | Prima p. 15 | **ADAPT** |
| 12b | Blocked-production signalling | base game | Official PC manual pp. 8, 12 | **ADAPT** |

### D1. The atlas's most important finding

> **The Movies never solved "is this stage hot" at management distance — and it knew it. It routed
> around the problem** by pushing the player to the Movie card rail on the right, then flying them to
> the set.

Every shooting signal the original had — the dark dressed interior against bright lot green, the
backdrop wall, the equipment — was **a property of the SET, not of the STATE**. A set that had been
built and dressed but was standing idle looked exactly the same as one mid-take.

This matters twice over. It means Mockup D is **not a restoration** — it is work the original never
did, and Project: Studio cannot copy its way to a solution. And it means the current build has
**independently reproduced the original's exact failure**: today's rehearsal, load-in and shooting
frames differ by 2.97–5.98% because the differences are all set dressing, not state. The doors /
beacon / signage / interior channel proposed in main §6.3 exists precisely because neither the
original nor the current build has a state channel at all.

### D2. Inherited, and rejected

The original's role-assignment panel (Prima p. 99) was **"a large opaque white lozenge that blots out
the 3D scene behind it."** That is, precisely, the opaque-card-over-dark-world problem this document
opens with. **The cream card is inherited, not invented.** It is rejected on its merits, and its
provenance is not a defence.

### D3. Coverage gaps — stated, not papered over

- **The default camera framing at new-game start is not established.** No verified figure depicts the
  opening frame. My critique of the current build's road-centred composition rests on the current
  build's own screenshots and on North Star §8, not on the original.
- **Exact HUD colour values, typefaces and pixel metrics are not established** — manual figures are
  greyscale print, Prima screenshots are small in-page inserts. Layout and hierarchy are described;
  **palette is not claimed.** This matters given the cream-vs-dark question, so no palette ruling in
  this document cites the original.
- **No Superstar Edition material was located at all.** No claim is made about it.
- **No unmodified gameplay footage was usable as evidence.** All motion behaviour — how bubbles
  animate in, how pips arrive — is unverified.
- **Two of the twelve requested subjects are PROVENANCE-LIMITED**: *completed-script handoff* and
  *building attention/state communication* have evidence for the interaction but not for a confident
  reconstruction of the exact treatment. **No §8 ruling depends on either.**
- **The Movie-card glyph chain is disputed.** Package 05 — accepted authority, rated *Very high*,
  citing official manual pp. 6–7, 12 and Prima p. 42 — states the card changed from a script/ready
  icon to a camera/filming icon. One user-uploaded capture in this survey suggests no camera glyph
  appears. **The accepted authority stands; the dispute is recorded rather than silently resolved,
  and the unverified frame is excluded from every binding ruling.**
- Contemporary reviews from IGN, GameSpot, Eurogamer and others were unreachable (403 / blocked /
  archive rate-limited). The "aged poorly" side rests on a single contemporary outlet, which is
  thinner than it should be.

---

## §E. Current Project: Studio Visual Audit

Ten evidence screenshots opened and viewed at 100%, plus the five committed Stage frames and a
pixel-diff cross-check. Every quoted string is transcribed verbatim from rendered pixels.

### E1. Cross-cutting

| Finding | Class | Detail |
|---|---|---|
| No primary button tier exists anywhere on a light surface | **V** | One grey gradient sprite serves primary, secondary and tertiary across every cream surface. Strongest "test harness" signal in the set. |
| Two incompatible themes on screen simultaneously | **V** | Cream IMGUI + dark UI Toolkit, no bridging treatment, visible together in the Greenlight review. |
| Four accent hues with no assigned meaning | **V** | Maroon headers, amber, one lone green, red — no consistent semantics. |
| Panels are flat rectangles | **V** | Hard 90° corners, no borders, shadows, elevation or header chrome. They read as text pasted over a render. |
| `WEEK n · READY` / `Ready · Week n` | **V** | Ten screenshots out of ten. |
| Same fact stated 3–4× per screen | **V** | Left panel + toast + focus panel + `LOT SELECTION` card, often in three phrasings. |
| `NEXT STEPS` unreliable | **F** | Holds a non-next-step on Development; holds no action at all on all three Founding screens. |
| Five currency formats, three "week" abbreviations | **V** | `$20M`, `$20,000,000`, `$5,491,596`, `$54,317/wk`, `$78k/wk`, `$5,967 / week`, `104-week term`. |
| Bare scalars with no legend | **V** | `Est. 27.3`, `Fit 62`, `OVR 57`, `OVR 7`, `52 OVERALL`, `Fit 24/100` — several are the most important number on their screen. |
| Permanent developer-hint chrome | **V** | `DOUBLE-CLICK TO FOCUS │ ESC TO CLEAR` pinned on every lot screen — silently becoming `DOUBLE-CLICK TO INSPECT` on one, with no state difference. |
| `N people on the lot` contradicts the render | **F** | `0 people` with figures drawn; `1 person` with five drawn. |
| World-space text used as a UI layer | **V** | Ground decals skewed to camera, tan-on-tan, detached from subjects, overlapping geometry; one renders **mirror-reversed**. |
| `LOT SELECTION` clipped by the screen edge | **V** | In every lot shot. No bottom margin reserved anywhere. |
| Panels anchor to edges, not a grid | **V** | The clock bar spans an arbitrary x≈430–1050 aligning to nothing. |
| No faces anywhere except one applicant portrait | **C** | Casting, greenlight and the founding roster are pure text lists. |
| The lot is never dominant when it matters | **V** | Panels occlude ~55% on decision screens; where the lot fills ~70% it carries no state and no action. |

### E2. Highest-severity shortlist

1. Disabled `Greenlight picture` primary with **no explanation attached to it**.
2. `Remove from Craft` **physically sliced** by the `NOW CASTING` footer.
3. `hire-consequence.png` has **no consequence UI at all**, and the stale toast still instructs the
   player to do what they just did.
4. The **universal absence of a primary button tier**.
5. The **light/dark theme collision** on the Casting surfaces.

### E3. Preserve — this is not a teardown

The dark brass-on-ink token surface; `.selected` as a 3px brass left border; `--ps-control-min-height:
44px` (22 references, the most consistently honoured token in the system, already meeting the North
Star floor); `Package draft · not committed` as honest state metadata; `0 OF 5 ROLES FILLED` as a
numeric headline instinct; and the **Stage dark state**, which is the one state the eye can name and
therefore the proof that this engine expresses state clearly when the channels are actually driven.

### E4. NOT VISUALLY VERIFIED

Two live stages · the People rail · controller focus · 200% text scale · any release or box-office
surface. **No ruling in either document depends on these.**

---

## §F. Modern Comparator Atlas

Six games. Patterns only. No branding, trade dress, icon or asset reproduced or recommended for
reproduction. Sources: publisher patch notes, developer devlogs and wikis, official documentation.

Full borrow/reject table is in main §14. Recorded here: the three cross-cutting conclusions that
survived all six.

**F1. The world is the readout; the panel is only an index into it.** Planet Zoo's locator pin, Two
Point Museum's Exhibit List with in-row remediation, and Software Inc.'s work items pinned to rooms
are three implementations of one idea. **Corollary, adopted as a rule: a rail row that only reports
is a table cell and belongs behind an inspector, not on the primary surface.**

**F2. A building advertises state through three stacked channels — and Project: Studio uses none of
them.** ① occupancy — is anything happening inside; ② a world-tethered progress indicator physically
attached to the structure; ③ whether the people who should be there visibly are.

**F3. Differentiate look-alike phases by what the world *contains*, not by what the HUD *says*.**
Staging and occupancy first, iconography second. This is the direct comparator answer to the 2.97%
problem.

**F4. Reducing building detail is a legitimate, under-used move.** Software Inc.'s developer states
outright that heavy textures would clutter a screen already full of windows, and chose a flat look so
the overview stayed readable. Project: Studio's blockout geometry is currently treated as a
deficiency; some of it is an asset.

**Provenance correction, repeated here because it is about my own brief.** The commissioning prompt
offered as a model finding: *"Planet Zoo puts a small amber exclamation billboard over the exact
habitat and the alert list row Locates to it."* Only the locator-pin half is documented (1.9 patch
notes). The billboard half was not substantiated and **is used nowhere.**

---

## §G. Open-Source / Official Unity Pattern Register

Licences verified live via the GitHub API during the survey.

| Repository / source | Ref inspected | Licence | Maintenance | Engine / language | Value | Ruling |
|---|---|---|---|---|---|---|
| **OpenRA** | `64ff8851`, `bleed`, 2026-08-29; traits docs at `release-20250330` | **GPL-3.0** | Active | C# / custom | Architecture | **INDEPENDENTLY REIMPLEMENT** |
| **OpenTTD** | tag `15.3`, 2026-04-04 | **GPL-2.0** (no "or later" grant) | Active | C++ | Architecture | **INDEPENDENTLY REIMPLEMENT** |
| **OpenRCT2** | current | **GPL-3.0-or-later** | Active | C++ | Architecture | **INDEPENDENTLY REIMPLEMENT** |
| **Unciv** | current | **MPL-2.0** | Active | Kotlin / libGDX | Architecture | **INDEPENDENTLY REIMPLEMENT** |
| **reg-suit** | `v0.14.6` / `5c09c8eb`; push 2026-08-26 | **MIT** | Active, 1,287★ | TypeScript / Node | Testing | **EXTEND CURRENT SEAM** |
| **Playwright** | `v1.62.1`; `main` `de214f44`, 2026-08-29 | **Apache-2.0** | Very active, 95,348★ | TypeScript / Node | Testing | **EXTEND CURRENT SEAM** |
| *Unity — URP Render Objects (manual)* | Unity 6 | Unity docs | Current | URP 17.3 | Visual | **EXTEND CURRENT SEAM** |
| *Unity — BagelGame sample* | current | **Unity Companion Licence** | Unity-maintained | Unity 6.3 | Visual | **DEFER** *(6.2+ gate satisfied)* |
| *Unity — Graphics Tests Framework* | manual 8.9 / API 7.17 | Unity package licence, prerelease | Unity-internal CI | C# | Testing | **EXTEND CURRENT SEAM** |
| *Unity — UI Toolkit manual + best-practice guide* | Unity 6 | Unity docs | Current | UI Toolkit | Architecture | **EXTEND CURRENT SEAM** |
| *Unity — ui-toolkit-manual-code-examples* | current | **NO LICENCE DECLARED** | Unity-maintained | C# | Architecture | **DEFER — unlicensed** |
| **ProjectPorcupine** | — | **GPL-3.0** | Dormant | C# / Unity | — | **REJECT — documented rejection** |

### G1. Relevant symbols worth studying (study only; nothing copied)

- **OpenRA** — `SelectionDecorationsBase.Created()` runs `self.TraitsImplementing<IDecoration>()` and
  caches the marker set **on the entity itself**. There is no marker registry keyed by id, so there
  is nothing that can go stale. This is the C1 lesson in one call site.
- **Unity Graphics Tests Framework** — `ImageComparisonSettings`: `AverageCorrectnessThreshold`,
  `RMSEThreshold`, `PerPixelCorrectnessThreshold`, `IncorrectPixelsThreshold`, `ActiveImageTests` /
  `ActivePixelTests`. Reference images keyed by `ColorSpace/Platform/GraphicsAPI`. A `TargetWidth`
  mismatch **fails rather than resizes** — a rule worth copying verbatim: never silently rescale
  evidence.
- **reg-suit** — `reg-keygen-git-hash-plugin` walks the branch graph to resolve *which commit's*
  snapshot set this run compares against; four-way item classification passed / changed / new /
  deleted.
- **Playwright** — `toHaveScreenshot()` *"took a bunch of screenshots until two consecutive
  screenshots matched"*; `animations: 'disabled'`; `mask` with a `#FF00FF` sentinel; `stylePath` as a
  capture-only override neutralising nondeterminism at source; `threshold` / `maxDiffPixels` /
  `maxDiffPixelRatio`.

### G2. Rejected candidates, named so the search is auditable

Tutorial-grade Unity health-bar repositories (`health-bar-controller`, `HealthBarSystem`,
`UnityHealthBar`, `unity-health-bar`, Brackeys' `Health-Bar`, `create-healthbar-ui-toolkit`) — all
single-purpose demos with no pooling, no ID binding, no state model. A cluster of hobby URP outline
packages (`Unity-URP-Outline`, `URP-Render-Features`, `Unity-outline`, `URP-Outline`,
`UnityFx.Outline`, `Unity-URP-Outlines`, `URPHullOutlineHighlight`) — all custom renderer features,
and the brief asked specifically for highlighting **without** a renderer migration; the built-in
Render Objects feature answers it with zero third-party code.
`Unity-Technologies/Per-Object_Outline_RenderGraph_RendererFeature_Example` is first-party and
genuinely relevant but *is* a custom RenderGraph feature — the correct next stop **if** Render Objects
proves insufficient. `UIToolkitUnityRoyaleRuntimeDemo` — superseded by BagelGame, pre-dates
world-space UI Toolkit. Percy and Chromatic — hosted commercial SaaS with no inspectable
implementation; their public design ideas are already covered with real evidence by reg-suit.

### G3. Budget accounting

Third-party repositories retained: **six** (OpenRA, OpenTTD, OpenRCT2, Unciv, reg-suit, Playwright) —
at the cap. Official Unity sources: five, distributed across the world-state and UI Toolkit and
visual-test categories, within the two-per-category allowance; one deliberately unused slot is
recorded in the source data as a decision rather than an oversight. Comparator games: **six** — at
the cap. Original-game frames: 23 tabled, **20 carrying binding rulings** — at the cap.

### G4. Open-source code reuse — explicit statement

- Was any code copied? **No.**
- Was any dependency added? **No.**
- Was any licence obligation created? **No.**
- Was any GPL/AGPL code used as a code source? **No** — OpenRA, OpenTTD, OpenRCT2 and
  ProjectPorcupine were read as design references only, and every ruling on them is
  INDEPENDENTLY REIMPLEMENT or REJECT.
- Do the permissive entries (reg-suit MIT, Playwright Apache-2.0) create an obligation? **No** — no
  reuse is proposed. Any future direct reuse would require attribution **and** an explicit Owner
  decision.

---

## §H. Sequencing note for whoever implements this

0. **Re-check the collision map before acting on it.** It moved three times during authoring:
   `3ed7510` (0 commits) → `9363fe2` (7) → `9bcce41` (8). The *file set* was stable across all three;
   only deltas grew. Run both, and trust them over this document:
   `git -C "<unity>" diff --stat wip/p04a2-final-convergence-client-secondary-20260828..HEAD`
   `git -C "<ts>"    diff --name-only wip/p04a2-final-convergence-ts-secondary-20260828..HEAD`
1. **P05 Stage work can start now** — but verify per-file, not per-folder. The P05-required rows span
   `Runtime/Presentation/`, `Editor/Authoring/` (`StudioLotActivityAuthoring.cs`,
   `StudioLotArchitectureAuthoring.cs`) and `Editor/Automation/StudioSceneValidation.cs`. Most of the
   `UI/` subfolder is P04A.3's, **and `StudioSelectionManager.cs` sits on the P04A.3 surface *outside*
   `UI/`**, so neither folder is a safe proxy in either direction. The specific Stage files
   (`StudioStageProductionPresentation.cs`, `StageActivityEffects.cs`,
   `StudioProductionRolePresentation.cs`, `StudioBridgePresentation.cs`,
   `StudioLotDeliveryContracts.cs`, `StudioShootingDayLotPresentation.cs`,
   `StudioStageDoorCrewPresentation.cs`, `StudioVehicleRoute.cs`) were clean at both checks.
   `StudioStagePresentationRegistry.cs` does not exist yet — greenfield.
2. **Everything touching the Casting workspace is blocked** until P04A.3 seals — eleven Unity files
   under `Assets/`, two proof tools, and thirteen TypeScript files (including `src/core/actions.ts`
   and `src/core/scriptReadModel.ts`, which the P05A recon also names as P05 Wave-1 owners).
3. **The two-stage prerequisite (C3) comes before the two-stage acceptance scene.** Visual Oracle
   scene 5 cannot be produced until the scene-level singleton contracts are rewritten. No visual
   change can substitute.
4. **Do not re-pose crew for state.** The existing seal contractually requires the twelve roles
   stationary at authored marks (≤ 0.05 m/s over three frames) and pins per-state luma envelopes.
   Re-posing invalidates the seal and both committed evidence runs with it. The P05-required set is
   deliberately built from doors, lights, beacon, signage, freight and markers — none of which moves
   a body.
5. **Token changes are additive only.** `StudioWorkspaceHostTests.cs:314–338` pins the
   `-unity-text-align` declaration; `:276–302` pins the token names.
6. **Name the unnamed elements first.** 112 named elements vs 67 id selectors, with the most-read
   labels unnamed, means visual acceptance cannot currently be verified by the element map that
   already exists. This is the cheapest precondition for everything else.
