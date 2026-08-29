# PROJECT: STUDIO — VISUAL DIRECTION PACKAGE 01
## The 2026 successor visual language

**Status: REFERENCE AUTHORITY CANDIDATE — NOT IMPLEMENTATION AUTHORIZATION**

| Field | Value |
|---|---|
| Document | `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01.md` |
| Companion | `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01-BUILDER-ANNEX.md` |
| Mockups | `docs/design/mockups/visual-direction-01/` (A–D, SVG, non-production) |
| Branch | `docs/visual-direction-package-01` |
| Written against | TypeScript `codex/p05a-implementation-recon-01` @ `9b72981`; Unity client `wip/p04a3-real-campaign-greenlight-client-20260829`, observed read-only at `3ed7510` and re-checked at `9363fe2` (**it advanced during authoring — see §11**) |
| Unity | `6000.3.22f1` (rev `1c726e1fb402`), URP `17.3.0`, Input System `1.19.0` |
| Nature of this document | Design and reference-mockup work only. No production code, UXML, USS, scene, prefab, material, shader, camera or lighting was created or modified. Unity was never launched. |

> **This document does not authorize implementation.** It proposes a visual language and records
> evidence. Every ruling below is a candidate for Owner acceptance. Where it touches a frozen
> contract it says so and defers; where the evidence runs out it says so and stops.

---

## 0. Executive summary — the one finding that reframes the rest

Project: Studio does not have a styling problem. It has **three render stacks**.

Exactly one surface in the shipped product is UI Toolkit: the Casting workspace and its world-entry
inspector card, hosted by `StudioWorkspaceHost` on a code-created `PanelSettings`. **Everything else
the player sees is legacy IMGUI `OnGUI`** — the `PROJECT: STUDIO` memo, the time/cash chip, the
`LOT SELECTION` receipt, the Production Rail, the Development card, the Founding card, the beacon,
the system menu and the camera Back band.

The two stacks have separate scaling policies, separate reference resolutions, separate type scales,
separate colour vocabularies and separate input paths — and a third, unstyled world-space text
layer (the ground decals in §8) that obeys neither:

| | UI Toolkit | Legacy IMGUI |
|---|---|---|
| Scaling | `ScaleWithScreenSize`, ref 1920×1080, match 0.5 | `StudioLegacyUiMetrics.CurrentScale`, ref 1720×1045, clamp 1.0–2.6 |
| Type scale | 15 / 18 / 22 / 32, control 44px | cards 16/17/18/20/24/30/64; HUDs 11/12/13/14/15/16/17/20 |
| Surface | `rgba(20,18,15,0.97)` dark | cream `0.95` / `0.96` / `0.97` |
| Tokens | 7 `--ps-*` colours, 4 sizes, 4 spaces | none — cannot read a token at all |

The visible symptom the brief calls *"opaque white-card dominance"* and *"visual conflict between
workspace and lot"* is this split, rendered. The dark Casting panel is hardcoded to `right:28 /
top:90 / bottom:170` **specifically to dodge** the cream memo column, the IMGUI Back band and the
IMGUI selection receipt. Selecting the Casting building produces one grey-default light card and one
dark-brass card, adjacent, in two render stacks.

**Therefore the highest-leverage visual decision available is not a reskin. It is choosing one
surface language and one type scale, and making the IMGUI surfaces obey them** — which can be done
by centralising IMGUI's constants against the same numbers, without migrating a single surface to
UI Toolkit. That is a Package-11-scale programme, and §10 classifies it accordingly. It is
deliberately **not** required for P05.

The second finding, and the one that *is* P05-critical, is in §6: **the Stage lifecycle is not
visually separable today.** Rehearsal, scenery-load-in and shooting differ by 2.97%–5.98% of pixels;
the twelve crew are bit-identical across all three; and five distinct authority conditions collapse
into one identical tableau.

---

## 1. Authority read, and what binds this document

Read in full, read-only, before writing:

| Source | Status here |
|---|---|
| P03A.3 UX Acceptance & UI North Star | **Binding.** §6.3 metrics, §8 composition, §9 HUD, §10 rail adopted verbatim. ⚠ **Out of repo on the declared ref** — `docs/ux/…` does not resolve at `9b72981`; read from branch `hspector-github/docs/p03a3-ux-north-star`. |
| `CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01.md` | **Binding** for selection, Locate/Back and lot dominance. |
| Package 03 + Builder Annex (Development / Screenwriting) | **Binding** for Development surfaces. ⚠ Out of repo — branch `codex/development-screenwriting-research-03`. |
| Package 04 + Builder Annex (Casting, Auditions, Package & Greenlight) | **Binding** for Mockup B and C. |
| Package 05 + Builder Annex (Production, Soundstages & Shooting) | **Binding** for §6 and Mockup D. Its §C1/§D/§E/§F anatomy is *not* restated or contradicted here — this document supplies the visual layer over it. ⚠ Out of repo — branch `codex/production-shooting-research-05`. |
| P05A Implementation Reconnaissance (`9b72981`) | **Provisional.** Used for file ownership only. |
| P05A Readiness Gate 00 | Used for sequencing. |
| Unity Production Architecture Audit 01 + Annex | **Binding** for engine constraints. |
| P04A / P04A.2 evidence screenshots | Evidence, read-only, at 100% scale. |
| Any P04A.3 branch | **UNSEALED FORWARD EVIDENCE — not accepted authority.** Cited only in the collision map (§11). |

> ⚠ **Five of the eight authorities above live on other branches and do not resolve on this one.**
> Every quotation was taken from a read-only `git show` extraction of the named branch, but a reader
> of this repo alone cannot check them. Package 04 and the P05A Recon are the only two that resolve here.

**TypeScript is authority.** Every state name in this document is a literal from
`src/core/types.ts`. This document invents no lifecycle state, no blocker kind and no status value.

---

## 2. Method

Four read-only evidence lanes, reconciled by one lead direction. No lane was allowed to dictate.

- **Lane A — the actual original.** 23 provenance-tagged frames from the official Activision/Lionhead
  PC manual and the Prima Official Game Guide. All 23 are tabled in Annex §D; **20 carry binding
  rulings** — one is REJECT, one is PROVENANCE UNVERIFIED, one is LATER (§12.2). Base game / *Stunts & Effects* /
  Superstar / modded / fan-recreation distinguished on every frame.
- **Lane B — current Project: Studio.** 12,218 lines of committed authority; ~72k lines of Unity C#;
  the two USS sheets; 10 evidence screenshots opened and viewed at 100%; a pixel-diff and
  proof-JSON cross-check of the five committed Stage frames.
- **Lane C — modern commercial comparators.** Six games (§14).
- **Lane D — open source and official Unity.** Six third-party repositories plus official Unity
  documentation and Unity-maintained samples (§15), every one license-checked live via the GitHub API.

**A provenance correction against my own brief.** In commissioning Lane C I offered as a model
finding: *"Planet Zoo puts a small amber exclamation billboard over the exact habitat and the alert
list row Locates to it."* Only the second half survived verification — Planet Zoo's locator pin is
documented in the 1.9 patch notes; the specific "amber exclamation billboard over the exact habitat"
was not substantiated from a primary source. It is not used as evidence anywhere below. Recording
this because a design document that launders its own assumptions through a research pass is worse
than one that never researched.

---

## 3. Current visual assessment

Assessed against the brief's list. **Every item is classified.** The three classes are strictly
separated because they have different owners and different fixes.

- **FUNCTIONAL DEFECT (F)** — the surface says or does something untrue. Owned by the feature package.
- **VISUAL DEFECT (V)** — the surface is correct but reads badly. Owned by visual direction.
- **CONTENT LIMITATION (C)** — art or data that does not exist yet. Owned by an art/content package.

### 3.1 The brief's checklist, adjudicated

| Brief item | Class | Verdict and evidence |
|---|---|---|
| Opaque white-card dominance | **V** | Confirmed, and it is architectural (§0). Cream `0.95/0.96/0.97` across six IMGUI surfaces; dark `rgba(20,18,15,0.97)` in UI Toolkit. Both on screen simultaneously in `casting-greenlight-review.png`. |
| Weak information hierarchy | **V** | Confirmed. `--ps-font-section` (22px) is referenced 4 times in the entire design system; `--ps-font-title` (32px) twice. The mid and upper tiers of the type scale are effectively unused, so almost everything renders at body weight. |
| Generic system-button appearance | **V** | Confirmed, and it is the strongest "test harness" signal in the set. IMGUI uses raw `GUI.skin.button` with only `textColor` swapped; UI Toolkit authors its own fills; the Production Rail and Camera Director use bare `GUI.Label` text *as* controls. **Three different ideas of what a button is, and no primary tier anywhere on any light surface.** |
| Insufficient separation of title / state / explanation / action | **V** | Confirmed. `" · "` (U+00B7) is the product's de-facto layout primitive — it is used as the universal field separator in both render stacks *and* inside `StudioBridgePresentation`'s status strings, doing the job that spacing, weight and grouping should do. |
| Rails read like spreadsheets | **V** | Confirmed. Rail rows are text with no lifecycle glyph, no phase rail and no numeric emphasis. |
| Limited lifecycle iconography | **V/C** | Confirmed. There is no icon family. V because none is specified; C because the assets do not exist. |
| Buildings do not communicate state at management distance | **V + F** | **The critical one.** See §6. Partly V (no visual language), partly F (Stage B carries a hardcoded status string that is permanently false). |
| Characters blend together | **C** | Six `StudioWardrobeClass` values map 1:1 from role and drive model choice and recolour. The system exists; the art does not. Not a design defect. |
| Insufficient production activity language | **F + C** | No animator parameter anywhere in `Assets/Studio` reads production state. The animation graph has 3 states and 2 bools, both written only from NavMesh path state. This is not a styling gap — the wiring does not exist. |
| HUD zones lack identity | **V** | Confirmed. Fixed in Mockup A by three keyline-separated zones. |
| Excessive prose | **V** | Confirmed. Permanent manual-style footnotes ("Time runs from the studio clock above…", "Save Game and Load Game are in the Studio Menu…") occupy the bottom of the left panel on **every** screen. |
| Inconsistent labels | **V** | Confirmed and systematic. `WEEK 0 · READY` immediately followed by `Ready · Week 0` — ten screenshots out of ten. `DOUBLE-CLICK TO FOCUS` silently becomes `DOUBLE-CLICK TO INSPECT` on one screen with no state difference to justify it. Number formatting has no policy: `$20M`, `$20,000,000`, `$54,317/wk`, `$78k/wk`, `$5,967 / week`, `104-week term` — one currency, five formats, three abbreviations of "week". |
| Inconsistent spacing | **V** | Confirmed. Panels anchor to screen edges rather than a grid; the `LOT SELECTION` card is clipped by the bottom screen edge in every lot shot; no bottom margin is reserved anywhere. |
| Absent/weak hover, selected, attention states | **V + F** | `.focus-visible` is declared in `StudioUiTokens.uss` **and asserted by `StudioWorkspaceHostTests.cs:295`** — but is never applied by any runtime code path. **Keyboard and controller focus has no visual representation in either UI system.** A passing test currently guards a rule nothing obeys. |
| Visual conflict between workspace and lot | **V** | Confirmed; root cause is §0. |
| Weak era / film-studio identity | **V** | Partly. The brass/ink/oxblood vocabulary is a real start; it is undermined by four competing accent literals. |
| Surfaces look like test harnesses | **V** | Confirmed, and the cause is enumerable: unstyled default buttons, raw scalars with no legend (`Est. 27.3`, `Fit 62`, `OVR 7`), permanent keyboard hints pinned in a card, and status text triplicated across four regions. |

### 3.2 Functional defects found while assessing visuals — routed, not fixed

These are **not** visual-direction work. They are recorded because a visual pass must not paint over
them, and because two of them will read to a player as truth.

1. **Stage B ships a permanently false status.** `StudioLotArchitectureAuthoring.cs:612` bakes
   `"SHOOTING · Legend of the Smuggler"` into Stage B's selectable at author time. There is no
   lifecycle behind it. Stage A carries an equivalent authored placeholder at `:533`. → **P05 owner.**
2. **The "N people on the lot" counter contradicts the render** — `0 people` with figures drawn,
   `1 person` with five drawn. → Feature owner.
3. **Within one Development run, the same person is labelled "writer" and "Actor"**
   (`development-drafting.png` vs `review-workspace.png`). → Feature owner.
4. **`NEXT STEPS` is unreliable as a label** — on Founding screens it contains no next step, only a
   save/load footnote. → Feature owner.
5. **`hire-consequence.png` has no consequence UI at all**, and the instruction toast still tells the
   player to do the thing they just did. → Feature owner.

**NOT VISUALLY VERIFIED.** No screenshot exists for: a second Stage under live simulation; the
People rail; any release or box-office surface; controller focus; 200% text scale. Every statement
about those is marked in place below and none is used to justify a P05-required ruling.

---

## 4. The visual system

### 4.1 The governing rule

> **Extend the frozen token layer. Do not replace it.**

`StudioUiTokens.uss` freezes custom-property and semantic-class **names** under the P04A contract
freeze §3 (restated in the sheet's own header). A test at `StudioWorkspaceHostTests.cs:314–338` pins
the `-unity-text-align: middle-center` declaration on `Button` and `.primary-action` via
`AssertUssRuleContains`; a separate test around `:276–302` pins the existence of the token names,
including `.focus-visible`.

**Precisely stated:** the *names* are frozen by contract, and *one declaration* is pinned by a test.
Token *values* are not individually test-pinned — but they are contract-frozen, and re-tuning a frozen
palette is not a visual package's authority. Everything below therefore **adds** tokens and **assigns
meaning** to existing ones.

### 4.2 Typography

The existing ladder already satisfies the UX North Star §6.3 floors. It is adopted as **the** scale,
for both render stacks, with two additions.

| Token | Value | Role | North Star §6.3 floor | Status |
|---|---|---|---|---|
| `--ps-font-meta` | 15px | metadata, captions, badge text | 14–16 ✓ | existing |
| `--ps-font-body` | 18px | body, button labels, row text | 16–18 ✓ | existing |
| `--ps-font-section` | 22px | section headings, phase/now line | 20–24 ✓ | existing, **under-used (4 refs)** |
| `--ps-font-title` | 32px | workspace and card titles | 28–34 ✓ | existing, **under-used (2 refs)** |
| `--ps-font-numeric` | 30px | numeric emphasis in rows and bands | — | **proposed** |
| `--ps-font-display` | 44px | the single headline number on a surface | — | **proposed** (replaces the IMGUI cards' orphan 64px `BigNumber`) |
| `--ps-font-world` | 17px | world nameplates and world labels | — | **proposed** |

Rules:

- **A surface has at most one `--ps-font-display` value.** In Mockup B it is `2 / 5`. In Mockup C it
  is the same figure in the commit band.
- **Numeric emphasis outranks descriptive prose** (North Star §6.3, final bullet). Where a card today
  writes a number at body weight inside a sentence, the number is promoted and the sentence demoted.
- **Warning text is `--ps-font-body`, never smaller.** A blocker the player must act on may not be
  rendered at metadata size. The current `.refusal` rule sets `--ps-font-meta`; §9 flags this.
- **Buttons are `--ps-font-body`.** Never `--ps-font-meta`.
- **Responsive behaviour is reflow, never shrink** (North Star §6.6). Grow within the safe area →
  reflow columns → one contained scroll region → defer low-priority detail. Never scale type down.
  Lane C confirms this from the other direction: Football Manager 26 ships font-size-only scaling and
  its own bug tracker records overlapping menus and *missing* contract controls at 1366×768.

### 4.3 Spacing

The 6 / 10 / 16 / 24 ladder is kept. `--ps-space-2` and `--ps-space-3` currently carry almost all
layout (57 and 61 references) while `--ps-space-4` is used 6 times — which is why sections do not
separate from one another.

| Token | Value | Assigned role |
|---|---|---|
| `--ps-space-1` | 6px | intra-line gaps; icon-to-label |
| `--ps-space-2` | 10px | row padding; chip padding |
| `--ps-space-3` | 16px | card padding; control gaps |
| `--ps-space-4` | 24px | **section separation** — the boundary between two answers |
| `--ps-space-5` | 40px | **proposed** — major band separation (header ↔ body ↔ commit band) |

- Compact components (rail row, person token, nameplate): padding `--ps-space-2`, rhythm 60–72px.
- Expanded components (candidate card, blocker panel): padding `--ps-space-3`, rhythm 96–152px.
- **Every surface reserves `--ps-space-3` bottom margin from the screen edge.** The current
  `LOT SELECTION` card violates this in every lot screenshot.

### 4.4 Surfaces

One surface family. The direction is **dark**, not cream — three independent reasons:

1. It is the language the world already sits in, and it lets the lot stay bright and dominant.
2. Package 05 explicitly prohibits *"sepia/paper styling hard-coded into production components"* and
   *"no new white-paper style."* A cream HUD cannot be extended into P05 without violating that.
3. Lane C: Against the Storm darkened every panel, tooltip and window and deleted decorative elements
   explicitly for legibility, and named contrast definition as an accessibility pillar.

| Surface | Fill | Proposed token | Use |
|---|---|---|---|
| Panel root | `rgba(20,18,15,0.97)` | `--ps-color-surface` (existing) | workspace root, card root |
| Raised row | `rgb(27,25,22)` | `--ps-color-surface-raised` | list rows, sub-panels |
| Sunken well | `rgb(16,15,12)` | `--ps-color-surface-sunken` | scroll regions, insets |
| Selected row | `rgb(45,39,27)` | `--ps-color-surface-selected` | current selection |
| Band | `rgb(24,22,19)` | `--ps-color-surface-band` | header and sticky footer |
| Control | `rgb(39,37,34)` | `--ps-color-control` | secondary button fill |
| Keyline | `rgb(60,54,44)` | `--ps-color-keyline` | 1px separators |
| On-brass ink | `rgb(24,20,14)` | `--ps-color-ink-on-brass` | label on a primary button |

**Seven of the eight values above already exist in `StudioCastingWorkspace.uss` as hardcoded
literals**; the eighth (panel root) is the existing `--ps-color-surface`. Naming the seven is not a
redesign; it is giving names to decisions already made. The sheet carries **19 distinct hardcoded
colour literals across 33 declaration sites**, against 7 colour tokens.

Surface anatomy, all six required types:

| Surface | Elevation | Occlusion of lot | Dismissal |
|---|---|---|---|
| Persistent HUD | band, top edge, full width | ≤ 72px | never |
| Compact world card | panel, edge-anchored | ≤ 30% | Esc / click-away |
| Retained workspace | panel, side-anchored | 55–65% (Package 05 §E1) | Back / Esc |
| Modal consequence review | panel + 40% scrim | full | explicit confirm or cancel |
| Project token (rail row) | raised row | none | n/a |
| Person token | raised row | none | n/a |
| Blocker / attention receipt | tinted inset inside its owner | none | n/a — never free-floating |

### 4.5 Colour

**Colour is never the sole carrier.** Every state below pairs a hue with an icon *and* a shape *and*
a text token. Remove all colour from Mockup D and the six states still separate.

| Role | Value | Token | Non-colour partner |
|---|---|---|---|
| Ink | `rgb(238,232,218)` | `--ps-color-ink` | — |
| Ink muted | `rgb(178,170,152)` | `--ps-color-ink-muted` | smaller size |
| Primary action | `rgb(198,166,100)` | `--ps-color-brass` | filled shape + bold + only one per surface |
| Selection | `rgb(198,166,100)` | `--ps-color-brass` | 3–4px left border (existing `.selected`) |
| Attention | `rgb(214,168,78)` | `--ps-color-attention` | `!` in a circle + `NEEDS YOU` |
| Blocked | `rgb(196,92,78)` | `--ps-color-blocked` | crossed-square glyph + `HELD` / `CANNOT …` |
| Refusal | `rgb(206,96,96)` | `--ps-color-refusal` | **see §9 — this token needs a rule or retirement** |
| Success / cast | `rgb(168,196,122)` | `--ps-color-success` *(proposed)* | check disc |
| Informational | `rgb(150,170,180)` | `--ps-color-info` *(proposed)* | `i` glyph |
| Queue / waiting | `rgb(178,170,152)` | reuse `--ps-color-ink-muted` | `WILL QUEUE · N WK` text |
| Estimated / uncertain | — | no colour | **dashed rule + the word "estimated"** — never a colour |

Two existing tokens, `--ps-color-blocked` and `--ps-color-refusal`, differ by roughly 10/4/18 per
channel and **no rule anywhere states when to use which.** Proposal in §9.

### 4.6 Controls

| Control | Fill | Border | Ink | Height | Rule |
|---|---|---|---|---|---|
| Primary | `--ps-color-brass` | none | `--ps-color-ink-on-brass` | 48px | **exactly one per surface, and it must be the forward action** |
| Secondary | `--ps-color-control` | 1px `--ps-color-keyline` | `--ps-color-ink` | 44px | Back, Locate, details |
| Destructive | `--ps-color-control` | 1.5px `--ps-color-blocked` | `--ps-color-blocked` | 44px | requires arming |
| Disabled | `rgb(42,39,35)` | 1.5px `--ps-color-keyline` | `rgb(110,102,88)` | as base | **must be adjacent to its reason** |
| Armed confirmation | `--ps-color-blocked` | none | `--ps-color-ink` | 48px | second press; states what will happen |
| Selected role | `--ps-color-surface-selected` | 4px left `--ps-color-brass` | `--ps-color-ink` | 60px | |
| Hover | +6% surface lightness | unchanged | unchanged | unchanged | must not move layout |
| Keyboard / controller focus | unchanged | **2px `--ps-color-brass` ring, offset 2px** | unchanged | unchanged | `.focus-visible` — **declared, tested, never applied** |

**The single most concrete control ruling: today's build inverts the action hierarchy.** In
`004-click-casting-inspector-open.png`, `Back` is rendered as brass — the primary treatment — while
the forward action `Plan camera tests` is a dark secondary and `Continue without tests` is bare text.
Back is never primary.

Lane C, Crusader Kings III, supplies the disabled-control contract, and it is a data contract rather
than a view rule. CK3 declares availability in three fields: `is_shown` (irrelevant conditions never
render at all), `is_valid` (the full checklist renders permanently under a *Requirements* heading, so
the gate is readable *before* attempting it), and `is_valid_showing_failures_only` (noise shown only
in the confirm tooltip when it fails). **Never ship a mute disabled control.**

### 4.7 Iconography

Reference shapes and semantic meaning only. **No production-ready or copyrighted icon assets are
specified or supplied**, and no comparator's icon set is reproduced.

| Concept | Reference shape | Never |
|---|---|---|
| Development | sheet with a folded corner and two rules | a pencil (means "edit") |
| Casting | two theatre masks, outline | a person (means "person") |
| Production | film camera body with lens circles | a clapperboard (reserved for *take*) |
| Post | film reel, two spokes | scissors |
| Release | ticket stub with a notch | a dollar sign (reserved for finance) |
| Person | shoulders-and-head, outline | a filled dot |
| Building | pitched-roof block | a house |
| Information / details | lowercase italic `i` in a square | `?` |
| Locate | crosshair with four ticks | a magnifier (means "search") |
| Decision | diamond outline | `!` (reserved for attention) |
| Blocked | square with a diagonal bar | a red circle alone |
| Queued | three stacked horizontal rules | an hourglass (implies a countdown we may not have) |
| Time | clock face, one hand | a calendar |
| Finance | banknote rectangle with a centre oval | a coin stack |

Rules: one weight (2px at 24px nominal); glyphs read at 16px; **every glyph is accompanied by text
at its first use on a surface**; the lifecycle five (Development → Casting → Production → Post →
Release) share one silhouette width so they align in a rail.

---

## 5. Lot composition

Adopted verbatim from UX North Star §8, with zone widths from Mockup A.

```
+----------------------------------------------------------------------+
| DATE / ERA │ TRANSPORT │ CASH / BURN / RUNWAY            MENU        |  72px band
+----------------------------------------------------------------------+
| PEOPLE  |                                              | PRODUCTION  |
| RAIL    |            S T U D I O   L O T               | RAIL        |
| 212px   |          (largest area, always)              | 310px       |
| (later) |                                              |             |
|         |                                              |             |
| BUILD / LOT TOOLS                          contextual receipt        |
+----------------------------------------------------------------------+
```

On a 1600px frame the world holds ~1078px of width (67%) and the entire vertical centre. **No panel
sits over the lot at rest.**

Lane A validates this empirically rather than by assertion: the original game held roughly 90% of its
frame as world — a thin top strip plus two narrow icon rails jammed against the extreme margins — and
still shipped a legible management loop at 1024×768. The lot *was* the interface, not a diorama
behind one.

### 5.1 Rail behaviour

| Condition | People rail | Production rail |
|---|---|---|
| Default lot | visible, compact | visible, compact |
| Building/person selected | visible | visible; the owning row shows `.selected` |
| Compact world card open | visible | visible |
| Retained workspace open | **yields** (hidden) | **yields** (hidden) |
| Modal review open | yields | yields |
| Attention raised | row badge; **the world marker is the primary signal** | row badge + `!` glyph + text |

Rails never commit. They select, they Locate, and they open. They never calculate gameplay state
(North Star §10.1).

### 5.2 Attention marker hierarchy

Two tiers, and **the top tier is a closed enumerated list defined before any alert code is written**
— Lane C's clearest warning, since Planet Zoo had to retrofit per-category alert muting in update 1.1
and still draws complaints about alerts re-firing.

- **Tier 1 — quiet, persistent, world-anchored.** A badge on the building that owns it. No sound, no
  pause, no camera move. This is the default and it covers almost everything.
- **Tier 2 — the player must act now.** Reserved for a currently legal decision that TypeScript has
  published. On the current state model that list is plausibly two entries: a production in
  `shooting` whose `shootingTask.status` is `blocked`, and a `releaseReady` picture with no release
  action available. **Owner decision — this document proposes the list, it does not settle it.**

Marker rules, from Lane D's strongest architectural finding: **a marker is never addressable without
its owner.** OpenRA (GPL-3.0, study only) has no marker registry that can go stale — decorations are
cached on the entity itself, so a marker cannot outlive or migrate off its owner. Project: Studio
cannot copy that for free, because Unity is a presenter holding no authority and the sim is
out-of-process; the guarantee has to be manufactured by reconciling presenters against each snapshot
and making markers strictly owned children. The design rule transfers exactly, and it is the rule
that prevents Stage B's current baked-lie class of defect from recurring.

Never: a corner alert list detached from place; collapsed `Stage issue (2)` counters; auto-camera on
any alert.

---

## 6. P05 world-state language

### 6.1 The authority, stated exactly

From `src/core/types.ts`:

- `ProductionPhase` = `development` | `preProduction` | `rehearsal` | `shooting` | `postProduction` | `releaseReady` — **six, and only six.**
- `ProductionBlocker.kind` = `facility-capacity` | `scenery-load-in` | `set-unavailable` — **three persisted arms.**
- `ShootingTaskStatus` = `unassigned` | `blocked` | `ready` | `scheduled` | `completed`.
- `WorkflowBindings.stageFacilityId` is the stage-occupancy truth. `setId`, `heldSinceWeek` accompany it.

**The brief asked for six Stage variants. Three of them are not phases, and this document will not
pretend otherwise.** Package 05 states it directly: *"`Load-in` and `wrap clearing` are operational
substates/presentation beats, not new persisted phases."*

| Requested variant | What it actually is | Derived from |
|---|---|---|
| Idle | absence of occupancy | no `bindings.stageFacilityId` names this stage |
| Rehearsal | a phase | `phase === 'rehearsal'` |
| Load-In | **a beat inside `shooting`** | `phase === 'shooting'` ∧ `blocker.kind === 'scenery-load-in'` |
| Blocked / Waiting | **a condition, not a state** | `blocker !== null` ∨ `shootingTask.status ∈ {unassigned, blocked, ready}` |
| Shooting | a phase, unblocked, take live | `phase === 'shooting'` ∧ `blocker === null` ∧ `status === 'scheduled'` |
| Wrap | **a one-shot transition beat** | `status === 'completed'` → `postProduction`; stage released |

**These predicates are not independent — they overlap, and order matters.** `scenery-load-in` is
itself a blocker, so Load-In would otherwise match Blocked too. Resolve top-down, stop at first match:

> **Idle → Shooting → Load-In → Blocked → Wrap → Rehearsal.**

Two precisions the raw table hides:

- `shootingTask.status ∈ {unassigned, ready}` carries **`blocker === null`**. These are *awaiting your
  decision*, not *held*. They must not get the red hold treatment — §6.3's BLOCKED language is for
  `blocker !== null` only, and §5.2's tier-2 marker is the right affordance for them.
- **A stage-anchored hold requires `bindings.stageFacilityId !== null`.** Not every blocker is held by
  a picture that owns a stage: `set-unavailable` is raised at rehearsal *entry*, so the picture is
  still in `preProduction`, holds `['development-casting']` only, and has `stageFacilityId === null`
  and `heldSinceWeek === null`. **Such a picture has no stage to mark and must surface on its owning
  building — never on an idle soundstage.** (Verified against `src/core/operations.ts` `deriveBindings`,
  the `set-unavailable` target-phase invariant, and `tests/c2a-m2-set-binding.test.ts:233–245`.)

### 6.2 What the world does today — measured, not asserted

Verified three independent ways: source code, the proof runner's own recorded measurements, and a
pixel diff of the committed frames in `Evidence/S/Stage-landscape-20260828T230615Z/`.

| Pair | Pixels differing > 12/255 |
|---|---|
| rehearsal ↔ scenery-load-in | **2.97%** |
| rehearsal ↔ shooting | **4.28%** |
| load-in ↔ shooting | **5.98%** |
| any ↔ stage-dark | **77.4%** |

**Dark is the only state the eye can name.**

- The twelve crew are **positionally identical** across Waiting / LoadIn / Shooting. Per-role centroids
  in the committed proof JSON agree to under one pixel (`t-dir-04` at 536.1/536.0/536.0).
- The cause is structural: the twelve people are **not children of any `STATE_` root**. They are
  parented to a sibling group, so state activation cannot touch a single body.
- **No animation varies with production state.** The graph has 3 states and 2 bools, written only
  from NavMesh path state. All twelve work loops are stationary idles. There is no clapper slap, no
  camera crank, no boom swing, no flat carried.
- **Nine props exist for the entire lifecycle**, and three of them are asserted out of frame.
- **~90% of the shooting payload is where the stage camera cannot see it** — five indicators and the
  beacon sit on the facade *behind* the camera; the 40-vehicle basecamp is authored south of the
  camera plane.
- **Five distinct authority conditions render one identical Waiting tableau**: rehearsal,
  director-dispatch, take-scheduling, facility-capacity/set-unavailable, and set-mounting-paused.
  Only the status string differs. *A player cannot see the difference between "we are rehearsing"
  and "we are blocked and losing money."*
- **LoadIn, Waiting and Clearing are lighting-identical by construction** — one shared `occupied`
  boolean drives all three, and the proof's own luma contract gives them a single shared envelope
  (measured means 0.242 / 0.236 / 0.235).

### 6.3 The proposed language

Mockup D is the reference. Full state table there; the design reasoning is here.

**Doors are the primary differentiator, and they are free.** A hot set is a sealed set: during
`shooting` the doors are **shut**, the red door lamps and roof beacon are **lit**, and the interior
blazes through the roofline and windows. During `scenery-load-in` the doors are **wide open** with
freight backed into them. This single channel separates the two states that today differ by 5.98% of
pixels, it reads at any zoom, it needs no text, and it survives greyscale. It is also authentic
studio practice rather than invented iconography.

Per state:

**IDLE.** Stage quiet, doors shut, no interior light, equipment parked and cold, no company, colour
desaturated. Stage identity remains readable — nameplate reads `Stage A · AVAILABLE`. **No false
crew.** *(Today this state already works — it is the 77.4% outlier.)*

**REHEARSAL.** Doors ajar. Interior at low warm work-light — never the shooting key. Company visibly
present and arriving, blocking marks on the apron. Beacon **off**, `SHOOTING` sign **unlit**.
Movement without pretending to shoot.

**LOAD-IN.** Doors wide, work light spilling onto the apron. **Freight backed into the door with
flats coming off it**, stacked flats on the apron, craft crew hauling. Source and destination legible
from the vehicle's position and heading. Beacon off; the stage is never shown as shooting.
*Constraint: the cosmetic vehicle path is not simulation truth and must not be presented as a route.*

**BLOCKED / WAITING.** **The company stays on screen.** They are still assigned and still costing
money; deleting them would be a lie. They are grouped and still rather than dispersed. Interior
stays at held-low *only while the stage is still held*. An amber hold marker is **anchored to the
stage** — never a detached corner warning — and carries `HELD N WEEKS` plus the exact cause. Beacon
off. This is where the current build fails hardest: five conditions, one tableau.

> **This treatment applies only when `bindings.stageFacilityId !== null`.** A blocked picture holding
> no stage has no stage to mark; it surfaces on its owning building. The one hold that is both
> stage-anchored and duration-derivable is `phase === 'rehearsal'` with
> `blocker = { kind: 'facility-capacity', capability: 'set-scenery', targetPhase: 'shooting' }` —
> which is exactly what Mockup D variant 4 depicts.

**SHOOTING.** Beacon on and pulsing, door lamps lit, `SHOOTING` sign lit, doors shut, interior
blazing, cabled basecamp on the apron. Unmistakable at management distance with no film playback and
no detailed take animation. **One project cannot leak into another Stage** — see §6.4.

**WRAP.** Shooting language ends completely: beacon off, sign unlit, interior down to teardown light.
Doors open, flat cart out, crew departing *away* from the door. Stage resources visibly released;
the nameplate reverts to `Stage A · WRAPPED`. **A historical wrap never overrides a new current
holder** — if another picture takes the stage in the same authoritative week, the new holder paints
immediately and the wrap survives only as a one-shot receipt.

### 6.4 Two-stage isolation — the blocking finding

**There is no isolation mechanism, because there is architecturally only one lifecycle-capable stage.**

- `StudioStageProductionPresentation.StageBuildingId` is the **compile-time constant `"stage-a"`**.
- `Resolve()` hard-requires exactly one property building with that id, exactly one `lot.stages` row
  matching it, and **at most one** `productionOperations` row located there. Two productions on the
  stage do not get separated — `if (onStage.Length > 1) return withheld;` **annihilates the entire
  display**.
- `StudioSceneValidation` requires exactly one `StudioStageProductionPresentation` and exactly one
  `StageActivityEffects` in the whole scene and errors otherwise.
- **Stage B is inert static geometry** with no presentation component, no state roots, no responsive
  lights — and a hardcoded status string that always claims it is shooting.

**Consequence for P05 acceptance:** Visual Oracle scene 5 ("Shooting with two-Stage isolation
variant") **cannot be produced today at all**, and no visual-direction change can produce it. It
requires rewriting the scene-level singleton contracts first. This is flagged in §9 and §10 as a
**P05 prerequisite, not a visual task.**

### 6.5 The constraint that governs how any of this can be built

The existing Visual Oracle seal is a design constraint, not just a test. The proof contractually
requires the twelve roles to be **stationary at authored marks** (≤ 0.05 m/s for three consecutive
frames) before capture, and pins per-state luma envelopes.

> **Any direction that re-poses or moves crew per state, or changes the LoadIn/Waiting/Clearing
> lighting split, invalidates the existing seal and both the landscape and portrait evidence runs
> with it.**

This is why §8 classifies "crew re-blocking per state" as **C — post-P05 visual checkpoint** rather
than P05 polish, and why the P05-required set is deliberately built from **doors, lights, beacon,
signage, freight and markers** — channels that are already state-driven or trivially made so, and
none of which move a single body.

---

## 7. Component specifications

Full anatomy — information order, weight, responsive behaviour, target size, states, prohibitions
and expected authority source — is in the **Builder Annex §A**, one table per component, covering all
thirteen required components: top HUD, Production Rail row, People Rail row, building attention
marker, world nameplate, compact person card, compact building card, retained workspace header, role
summary, candidate card, consequence panel, blocker/remedy panel, and project detail affordance.

Three rules govern all thirteen and are stated here because they are the ones most often broken today:

1. **Information order is fixed per component and never varies by state.** A card that reorders
   itself when blocked forces re-reading.
2. **Every component names its authority source.** A component with no named source is a component
   that will eventually invent a number. Package 05: *"No `Unknown` placeholder or invented number —
   omit the row instead."*
3. **One component, three densities.** The rail row, the token and the full card are one component at
   three densities, so "a person" never changes visual language as the player drills in. (Lane C —
   Football Manager 26's tile-expands-into-card.)

---

## 8. Current-to-target gap matrix

Classification: **A** required for P05 · **B** safe P05 polish · **C** post-P05 visual checkpoint ·
**D** later package · **E** reject.

| Surface | Current visual state | Target state | Player benefit | Class | Likely owner files | Risk |
|---|---|---|---|---|---|---|
| Stage: shooting vs rehearsal vs load-in | 2.97–5.98% pixel delta; crew bit-identical | Doors/beacon/sign/interior separate all three; ≥25% pixel delta target | Player can read the lot instead of clicking every stage | **A** | `StageActivityEffects.cs`, `StudioStageProductionPresentation.cs`, `StudioLotArchitectureAuthoring.cs` | Med — must not move crew (§6.5) |
| Stage: blocked is invisible | 5 conditions → 1 tableau; blocker never drives a pixel | Stage-anchored hold marker: cause + `HELD N WEEKS`; company stays, grouped | Player sees money burning | **A** | `StudioStageProductionPresentation.cs`, new marker presenter | Med |
| Stage nameplate | `"Stage A"` header vs `"Soundstage 7 dark"` body; picture identity dropped | One label per active stage: title + phase/state, its own holder only | Answers "which picture is there" without a click | **A** | `StudioBridgePresentation.cs` status sink | Low |
| Stage B lies | Baked `"SHOOTING · Legend of the Smuggler"` | Truth or withheld | Removes a falsehood | **A** *(functional)* | `StudioLotArchitectureAuthoring.cs:612` | Low |
| Two-stage isolation | **Impossible** — `stage-a` compile-time constant; 2 productions ⇒ Withheld | Per-stage presenter registry keyed by exact stage id | Scene 5 becomes producible | **A** *(prerequisite, not visual)* | `StudioStagePresentationRegistry.cs` (new), `StudioSceneValidation.cs` | **High** — rewrites singleton contracts |
| Load-in freight | Truck asserted out of frame; never seen | Freight at the door, flats moving, legible origin/destination | Load-in becomes self-explanatory | **A** | `StudioLotDeliveryContracts.cs`, `StudioLotActivityAuthoring.cs` | Low |
| Production Rail row | Text rows, no glyph, no phase rail | Project token: glyph · title · phase line · truth line · six-segment rail · [i] [Locate] | Kills the spreadsheet read | **B** | `StudioProductionRailHud.cs` | Low |
| Locate on every rail row | Partial | Every row of every rail locates its subject | Single highest-leverage rail fix (Lane C) | **B** | `StudioProductionRailHud.cs` | Low |
| Six-segment phase rail | Absent | 6 segments = 6 `ProductionPhase`s; freezes and appends `Held N weeks` | Honest progress with no invented % | **B** | rail + card components | Low |
| Disabled primary with no reason | `Review Greenlight` inert, reason is a comma run-on elsewhere | Structured reason adjacent; CK3 three-tier availability | Player knows what to do next | **B** | `StudioCastingWorkspace.cs` ⚠ **P04A.3 DIRTY** | **Blocked until P04A.3 seals** |
| Action hierarchy inverted | `Back` is brass; forward action is grey | Exactly one brass primary, always forward | Removes a real misdirection | **B** | `StudioCastingWorkspace.uss` ⚠ **P04A.3 DIRTY** | **Blocked until P04A.3 seals** |
| Candidate list starved | ~1 card visible; summary eats the fold | 632×152 cards; 2.5 above the fold; only the list scrolls | The decision surface gets the room | **B** | `StudioCastingWorkspace.cs` ⚠ **DIRTY** | **Blocked** |
| Keyboard/controller focus | `.focus-visible` declared + test-asserted, **never applied** | Applied on every focusable element | Controller and keyboard become usable | **B** | `StudioWorkspaceHost.cs` ⚠ **DIRTY** | **Blocked**; also see §9 |
| 19 hardcoded colour literals (33 sites) | Bypass the token layer | 7 surface/keyline tokens **added**, values unchanged | Makes any later reskin one-file | **B** | `StudioUiTokens.uss` (additive only) | Low — must not alter pinned rules |
| `WEEK 0 · READY` / `Ready · Week 0` | Duplicated on 10/10 screenshots | Stated once | Removes visible sloppiness | **B** | `StudioBridgeClient.cs` | Low |
| Number formatting | 5 currency formats, 3 "week" abbreviations | One formatting policy | Legibility and polish | **B** | shared formatter | Low |
| Permanent tutorial footnotes | Manual text pinned on every screen | Removed or deferred behind help | Reclaims the card | **B** | `StudioBridgeClient.cs` | Low |
| Cream vs dark render split | Two stacks, two type scales, two palettes | One surface language and one type scale | The largest single "shipped game" gain available | **C** | 9 IMGUI HUDs + `StudioLegacyUiMetrics` | **High** — broad, and P05 does not need it |
| Crew re-blocking per state | Frozen diorama, 12 pinned marks | Company re-stages per beat | The stage would feel alive | **C** | `PurposefulAgent.cs`, `StudioAnimationLibrary.cs`, proof runner | **High — breaks the sealed proof (§6.5)** |
| Lifecycle icon assets | None | Semantic family per §4.7 | Rails and cards become scannable | **C** | new art | Med — content |
| Portraits in casting | None; text-only cast selection | Portrait per candidate | "A studio game where cast selection shows no one" | **C/D** | art package | Med — content |
| Ground-decal world labels | Skewed, low contrast, detached, one renders mirror-reversed | Billboarded nameplates, leader line to owner | Names attach to people | **C** | world label presenter | Med |
| People rail | Does not exist | Person tokens with role, state, Locate | Left edge becomes useful | **D** | later package | — |
| Overlay/heat-map modes | None | Closed set keyed to the 3 persisted blockers | Answer "where is everything stuck" | **D** | later package | — |
| Lot overlay for every sim value | — | — | — | **E** | — | Rejected: an overlay whose only outcome is knowing is decoration (Lane C) |
| Global reskin as P05 scope | — | — | — | **E** | — | Rejected: broad global reskinning is explicitly not a P05 requirement |
| HDRP / renderer migration / DOTS | — | — | — | **E** | — | Rejected: §10 |
| Nine-tab entity inspector | — | — | — | **E** | — | Rejected: a database record wearing a costume (Lane C, Planet Zoo) |
| Free-floating window manager | — | — | — | **E** | — | Rejected: unbounded draggable panels occlude the lot (Lane C, Software Inc.) |
| Job-assignment tick-box grid | — | — | — | **E** | — | Rejected: literally a spreadsheet in a management game (Lane C, Two Point) |
| Repeating / re-firing alerts | — | — | — | **E** | — | Rejected: Planet Zoo retrofitted muting in 1.1 and still draws complaints |

**No broad global reskinning is classified A.** The P05-required set is six rows, all of them Stage
world-state, and one of them is a prerequisite rather than a visual change.

---

## 9. P05 visual acceptance — the Visual Oracle questions

For each of the six scenes, at **management distance**, on the captured frame alone:

| # | Question | Pass condition |
|---|---|---|
| 1 | Which Stage is active? | A single stage carries occupancy language; every other stage reads idle. Answerable in greyscale. |
| 2 | Which picture is there? | Exactly one nameplate, carrying the exact title from the snapshot. |
| 3 | What phase is it in? | The phase token is present and matches `productionOperations[].phase`. |
| 4 | Is meaningful activity visible? | The frame shows the activity the state claims — freight for load-in, sealed-and-hot for shooting. Not merely "people are present". |
| 5 | Is it blocked? | If `blocker !== null` **and** `bindings.stageFacilityId !== null`, a stage-anchored marker names the cause and the hold duration. If `blocker !== null` but no stage is held, the stage stays idle and the marker appears on the owning building. If `blocker === null`, **no hold marker** — a take at `unassigned`/`ready` is a tier-2 decision prompt, not a hold. |
| 6 | Is player action required? | A tier-2 marker appears **iff** TypeScript publishes a currently legal decision. |
| 7 | Can the player locate/open it? | A Locate affordance exists in the rail row and the card, both resolving to this exact stage id. |
| 8 | Does the scene contradict TypeScript state? | Every rendered token is diffed against the JSON sidecar. Any disagreement fails. |
| 9 | Does another production leak in? | Each stage renders only its own current holder. **Currently unprovable — see §6.4.** |
| 10 | Does it look like a game, not debug evidence? | No developer hint text, no bare scalars without legend, no default control chrome, no duplicated state lines in frame. |

### 9.1 Two oracle upgrades this research produced

**(a) Tolerance is three axes, not one.** Three independent, mutually unaware codebases — Unity's
Graphics Tests Framework, reg-suit and Playwright — each decomposed image tolerance into *perceptual
per-pixel difference*, *absolute count of failing pixels*, and *ratio of failing pixels*. Three-way
convergence is the strongest signal in the survey. It matters here specifically: a mis-anchored
status marker is a few catastrophically wrong pixels, while a lighting regression is low per-pixel
error across the whole frame, and one threshold cannot catch both without drowning in false positives.

**(b) The assertion the oracle is missing, and it is exactly this project's weak point.** All three
tools compare an image **only to its own baseline**. Six states can each match their own baseline
perfectly while being indistinguishable *from each other* — which is precisely today's situation at
2.97%. The needed assertion is **mutual distinctness**:

> Every pair of lifecycle-state captures must differ by **more than a floor**, not merely match its
> own baseline.

A proposed starting floor of **≥ 25% differing pixels** between any two of {idle, rehearsal, load-in,
blocked, shooting, wrap} is offered as a **candidate for Owner tuning**, not as a settled number.
It is roughly a third of the dark↔occupied delta (77.4%) and roughly four times today's worst pair.

Also worth adopting from reg-suit: **four-way classification** (passed / changed / new / deleted).
For an oracle whose job is proving six states look distinct, the most dangerous silent failure is not
"a diff regressed" — it is *"a capture stopped being produced"*, which a pass/fail harness reports as
all-green.

### 9.2 Two open contradictions this document will not resolve itself

1. **`--ps-color-blocked` vs `--ps-color-refusal`** differ by ~10/4/18 per channel with no rule.
   Proposal, for Owner ruling: `blocked` = a state of the world the player did not cause;
   `refusal` = the system declining an action the player just attempted. If that distinction is not
   wanted, retire `refusal`.
2. **`.refusal` renders at `--ps-font-meta` (15px).** A refusal the player must read is being drawn
   at metadata size, which conflicts with North Star §6.3's rule that important status outranks
   prose. Flagged rather than changed, because the token is frozen.

---

## 10. Implementation boundaries

**Preserved, without exception:** TypeScript gameplay authority · exact IDs (`stage-a`, `casting`,
`writers`, facility and person ids — never matched by title, array order or nearest building) ·
UI Toolkit for retained workspaces · the current camera / Locate / Back stack and its captured origin
· URP `17.3.0` · the GameObject architecture · current Input System contexts · all P03/P04 behaviour.

**Not recommended, explicitly:** HDRP · any renderer-pipeline migration · DOTS · wholesale UI
replacement · new simulation in Unity · asset-store theme packs · one giant HUD cockpit · decorative
Hollywood chrome that reduces readability.

**Not recommended, added by this research:** no new dependency of any kind — not reg-cli, not
Playwright, not `com.unity.testframework.graphics`, not any third-party outline package. The only
thing recommended for adoption is URP's built-in **Render Objects** renderer feature for selection
highlighting, which is already inside URP `17.3.0` and therefore adds nothing.

**One conditional resolved.** Lane D flagged its ruling on Unity's world-space UI Toolkit sample as
conditional on the project being Unity 6.2+. `ProjectVersion.txt` reads `6000.3.22f1` — Unity 6.3.
**The version gate is satisfied**, so world-space UI Toolkit is technically available for world
markers. This document nonetheless recommends **screen-space-projected markers owned by a per-stage
presenter** as the primary route (§5.2), because ownership — not rendering technique — is what
prevents stale markers. World-space UI Toolkit is recorded as unblocked, not as recommended.

---

## 11. Collision map

> **⚠ THIS IS A MOVING TARGET, AND IT MOVED WHILE THIS DOCUMENT WAS BEING WRITTEN.**
>
> Three observations of the same branch during authoring:
>
> | Observed | Unity client HEAD | Commits since the P04A.2 base |
> |---|---|---|
> | first | `3ed7510` | **0** — entire surface uncommitted |
> | second | `9363fe2` | **7** |
> | third | `9bcce41` | **8** |
>
> **The file table below is exact as of `9363fe2` and was re-verified there.** The set of files has
> been stable across all three observations; only the deltas grow. The DO-NOT-TOUCH ruling is
> unchanged and, if anything, stronger: this is live, actively-moving work.
>
> **Do not act on this section without re-running:**
> `git -C "<unity>" diff --stat wip/p04a2-final-convergence-client-secondary-20260828..HEAD`
> `git -C "<ts>"    diff --name-only wip/p04a2-final-convergence-ts-secondary-20260828..HEAD`

### 🔴 DO NOT TOUCH UNTIL P04A.3 SEALS

Unity — `/Users/bruce/Project Studio - Unity Production Convergence 80H`, branch
`wip/p04a3-real-campaign-greenlight-client-20260829`, verified at `9363fe2` against the P04A.2 base:

| File | Δ |
|---|---|
| `Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspace.cs` | +529 |
| `Assets/Studio/Runtime/Presentation/UI/StudioCastingInspectorCard.cs` | +255 |
| `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs` | +21 — **the single stylesheet-loading + element-map host** |
| `Assets/Studio/Runtime/Presentation/UI/StudioUiElementRegistry.cs` | +21 |
| `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs` | +60 — **outside the `UI/` subfolder** |
| `Assets/Studio/UI/Resources/StudioCastingWorkspace.uss` | +25 |
| `Assets/Studio/Tests/EditMode/StudioCastingGreenlightTests.cs` | +66 |
| `Assets/Studio/Tests/EditMode/StudioCastingOfficeEntryP04A3Tests.cs` (+ `.meta`) | +360 new |
| `Assets/Studio/Tests/EditMode/StudioGreenlightReadinessP04A3Tests.cs` (+ `.meta`) | +428 new |
| `Assets/Studio/Tests/EditMode/StudioCastingPackageDraftTests.cs` | +5 |
| `Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A1Tests.cs` | +7 |
| `Tools/p04a1-proof-launch.sh` | +23 (`PROOF_RUNTIME_SEED`) |
| `Tools/p04a3-proof-journey.mjs` | +1546 new, **currently dirty in the working tree** |

**Note that `StudioSelectionManager.cs` joining the P04A.3 surface widens the collision beyond the
`UI/` subfolder** — it sits in `Runtime/Presentation/` alongside the Stage files. It is *selection*,
not stage presentation, so §H's "P05 Stage work can start now" ruling still holds; but the boundary
is no longer a clean folder split and must be checked per-file rather than assumed.

TypeScript — `/Users/bruce/The Movies - Unity Production Convergence 80H`, branch
`wip/p04a3-real-campaign-greenlight-ts-20260829`, head `c649a88`, **2 commits** measured against
`wip/p04a2-final-convergence-ts-secondary-20260828`. Thirteen files, working tree clean:

`src/core/actions.ts` · `src/core/scriptReadModel.ts` · `tests/c2a-m4-queue-admission.test.ts` ·
`tests/d17a-adv-cliff.test.ts` · `tests/p04a2-writer-credit-law.test.ts` ·
`tests/p04a3-greenlight-law.test.ts` · `tests/script-projects-actions.test.ts` ·
`tests/script-read-model.test.ts` · `ui/src/engine/adapter.ts` ·
`ui/src/lot/WorldFirstLotNativeCastingReviewApp.test.tsx` ·
`ui/src/lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx` ·
`ui/src/lot/snapshot/castingReview.test.ts` · `ui/src/screens/script-projects-edge-ui.test.tsx`

**`src/core/actions.ts` and `src/core/scriptReadModel.ts` are named P05 Wave-1 owners in the P05A
recon and are on the P04A.3 surface.** Different functions, same files — mergeable, but not
conflict-free if both land concurrently. `ui/src/engine/adapter.ts` is likewise shared.

### Ownership by concern

| Concern | Likely owner | Collision |
|---|---|---|
| Shared UI tokens | `StudioUiTokens.uss` | **CLEAN today, most contested file in the project.** Its `-unity-text-align` declaration on `Button` / `.primary-action` is pinned at `StudioWorkspaceHostTests.cs:314–338`, and the token *names* around `:276–302`. Additive tokens only. |
| Top HUD | `StudioLivingTimeHud.cs` (IMGUI) | Clean |
| Production Rail | `StudioProductionRailHud.cs` (IMGUI) | Clean |
| Casting workspace | `StudioCastingWorkspace.cs/.uss` | 🔴 **DIRTY** |
| Stage presentation | `StudioStageProductionPresentation.cs`, `StageActivityEffects.cs` | **Clean — safe today** |
| World labels | `StudioBridgePresentation.cs` (status sink) | Clean |
| Building attention | `StudioStagePresentationRegistry.cs` | **Does not exist — greenfield, zero collision** |
| Materials / lighting | `StageActivityEffects.cs`, `StudioArtFactory.cs` | Clean |
| Icons | none | Greenfield |
| Camera composition | `StudioCameraProofRunner.cs`, Cinemachine profiles | Clean |
| Visual Oracle screenshots | `StudioStageVisualProofRunner.cs` + `Tools/p04a1-proof-launch.sh` | Launcher 🔴 **DIRTY** |

**Sequencing consequence:** the P05-required rows in §8 span `Runtime/Presentation/` **and**
`Editor/Authoring/` (lighting, props and stage geometry live in `StudioLotActivityAuthoring.cs` and
`StudioLotArchitectureAuthoring.cs`), plus `Editor/Automation/StudioSceneValidation.cs` for the
two-stage prerequisite. **All of those files were clean at both observations, so P05 Stage work can
begin without waiting for P04A.3** — but verify per-file, not per-folder: `StudioSelectionManager.cs`
now sits on the P04A.3 surface *outside* `UI/`, so the folder split is no longer a safe proxy.
Every casting/workspace row is blocked. Scene files (`StudioLot.unity`) merge badly — treat as an
exclusive lock. The bridge contract chain is regenerated wholesale, so any schema change serialises
against P05.

---

## 12. Original *The Movies* Visual Atlas

23 frames tabled in Annex §D; **20 carry binding rulings** (one REJECT, one PROVENANCE UNVERIFIED,
one LATER — all three excluded from every ruling in §8). Sources: the official Activision/Lionhead PC manual (print date
9/27/05, distributed by Valve) and the Prima Official Game Guide (2005, ISBN 0-7615-4445-3, via
Internet Archive), plus contemporary reviews. **Provenance is recorded per frame; base game vs
*Stunts & Effects* vs Superstar vs modded vs fan-recreation is distinguished throughout, and no
mechanical claim is made from imagery alone.** Full per-frame tables in **Builder Annex §D**.

The rulings that matter:

| Subject | Ruling | Why |
|---|---|---|
| Default lot view | **ADOPT** | ~90% of frame as world, thin top strip, two narrow edge rails, and it shipped a playable management loop. This is Project: Studio's product law, already proven. |
| Top HUD | **ADAPT** | Structure adopted — time+transport left, **forward-looking timeline centre**, cash+standing right, both right items clickable doors. Rendering adapted: label the events, rank severity, make it fluid. |
| Left Star rail | **ADAPT** | Portrait + chart position + mood + **activity glyph** (lightning = directed activity, Zz = autonomous, camera = assigned but not shooting). The glyph vocabulary is the transferable part. Reject drag-the-star-off-their-job. |
| Right movie pipeline | **ADAPT** | Cards carried production state through **distinct icons** — script → camera → film can.¹ Adopt the icon-carries-lifecycle idea; reject the carry-the-token verb. |
| Room state painted on the floor | **ADAPT** | `Crew 3/3`, `Extras 1/1` written in the room they describe, read from the management camera. Adopt the *principle* (state lives where the work is); reject world-space floor text, which stopped being legible above 1024×768. |
| Drag validity shown on the **target**, not the cursor | **ADOPT** | The drop target itself turned green or red. Adopt it — and **add the third state the original lacked**: "legal but blocked until X", which is exactly what all three persisted blockers describe. |
| Shooting at management distance | **ADAPT — and finish the job** | **See §12.1. The original never solved this.** |
| Information bubbles on right-click | **ADAPT** | Progressive disclosure, hover-summoned. Adapt to a persistent `[i]`, because hover-only fails controller and accessibility. |
| Construction / path tools | **LATER** | Package 09 territory. Must not be obstructed by rail geometry. |
| Triage | **REJECT the original's answer** | A PA line, a sparkling stream and Tab-to-next-priority. There was **no persistent "what needs me" surface**. Project: Studio must add what the original never had. |

**What aged well:** the lot *is* the interface; state written where the work happens; a
forward-looking timeline as the widest HUD element; lifecycle carried by icon.
**What aged poorly:** nothing tells you where to look; unlabelled ~16px pictograms with hover-only
disclosure and no severity coding; world-space floor text that dies above 1024×768; no saved camera
viewpoints; cash as a bare number with no burn rate.

### 12.1 The atlas's most important finding — and it inverts one of my own assumptions

> **The Movies never solved "is this stage hot" at management distance, and it knew it. It routed
> around the problem** — pushing the player to the Movie card rail on the right, then flying them to
> the set.

Every shooting signal the original had — the dark dressed interior against bright lot green, the
backdrop wall, the equipment — was **a property of the SET, not of the STATE**. *A set that had been
built and dressed but was standing idle looked exactly the same as one mid-take.*

I drafted §12 expecting to find an ancestor for Mockup D. There is none. This changes two things:

1. **Mockup D is not a restoration.** It is work the original never did, and Project: Studio cannot
   copy its way to a solution here.
2. **The current build has independently reproduced the original's exact failure.** Today's
   rehearsal, load-in and shooting frames differ by 2.97–5.98% *because every difference is set
   dressing rather than state* — the same category error, twenty-one years later. The doors / beacon
   / signage / interior channel in §6.3 exists precisely because neither the original nor the current
   build has a state channel at all.

The original also bequeathed the problem this document opens with: its role-assignment panel
(Prima p. 99) was **"a large opaque white lozenge that blots out the 3D scene behind it."** The cream
card is **inherited, not invented** — and its provenance is not a defence.

### 12.2 Coverage gaps and one disputed claim

- Two of the twelve requested subjects — *completed-script handoff* and *building attention/state
  communication* — have evidence for the interaction but not for a confident reconstruction of the
  exact treatment. Marked **PROVENANCE-LIMITED**; no §8 ruling depends on either.
- **Exact HUD colour values, typefaces and pixel metrics are not established.** Manual figures are
  greyscale print; Prima screenshots are small in-page inserts. Layout and hierarchy are described;
  **palette is not claimed, and no palette ruling in this document cites the original.**
- **The default camera framing at new-game start is not established.** My critique of the current
  build's road-centred composition rests on the current build's own screenshots and North Star §8.
- **No Superstar Edition material was located at all.** No claim is made about it.
- ¹ **Disputed.** Package 05 — accepted authority, rated *Very high*, citing official manual
  pp. 6–7, 12 and Prima p. 42 — states the movie card changed from a script/ready icon to a
  camera/filming icon. One user-uploaded capture found in this survey suggests no camera glyph
  appears on the card. **The accepted authority stands; the dispute is recorded rather than silently
  resolved, and the unverified frame is excluded from every binding ruling.**

---

## 13. Current Project: Studio Visual Audit

Ten evidence screenshots opened and viewed at 100% at 1440×900 and 3456×2234, plus the five Stage
frames. Per-surface findings, split F/V/C, are in **Builder Annex §E**. Surfaces covered: default
lot, Development department card, Development rail, drafting, review workspace, Casting inspector
card, Casting package draft, Greenlight review, Founding admin review, applicant card, hire
consequence, and Stage idle/rehearsal/load-in/shooting/wrap.

**What is already good and must be preserved:**

- The dark brass-on-ink token surface itself. It is a real visual identity; it should be extended,
  not replaced.
- `.selected` as a 3px brass left border — quiet, effective, already correct.
- `--ps-control-min-height: 44px` is the most consistently honoured token in the system (22
  references) and already meets the North Star floor.
- The `Package draft · not committed` state line — exactly the right kind of honest metadata.
- `0 OF 5 ROLES FILLED` as a numeric headline. The instinct is right; it needs the type scale behind it.
- The Stage **dark** state. It is the one state that is visually unmistakable, and it is the proof
  that this engine can express state clearly when the channels are actually driven.

**NOT VISUALLY VERIFIED** — no screenshot exists, so no ruling depends on these: two live stages;
the People rail; controller focus; 200% text; any release surface.

---

## 14. Modern Comparator Atlas

Six games. Patterns only — **no branding, trade dress, icon or asset from any of them is reproduced
or recommended for reproduction.** Full entries in **Builder Annex §F**.

| Game | Pattern retained | Borrow | Reject |
|---|---|---|---|
| **Planet Zoo** | Heat-map view modes that recolour *the world*, one key in/out | A closed overlay set keyed to the three persisted blockers | Per-entity modes disguised as global; nine-tab inspectors |
| **Planet Zoo** | Two-tier alerts with first-class per-category muting | Exactly two tiers; enumerate tier 2 **before** writing alert code | Repeating alerts — retrofitted muting in 1.1, still complained about |
| **Planet Zoo** | The locator pin on list rows | Locate on **every row of every rail** — the highest-leverage fix for spreadsheet rails | — |
| **Two Point Museum** | Expeditions: a long project tracked by *the world*, output arriving somewhere physical | The model for the `shooting` phase: occupies a building, consumes named crew, output arrives at Post | The black box — a launched expedition cannot be intervened in |
| **Two Point Museum** | Zone colour painted on the world and repeated as a chip on the staff row | One shared colour key spanning world and list | The job-assignment tick-box grid |
| **Two Point Museum** | Dual-entry remediation — same verb from the world and from one list | Every blocker resolvable from the building **and** the rail, identical verb. *A rail row that only reports is a table cell.* | Per-object decay meters |
| **Software Inc.** | Work items that collapse and pin to the room doing the work | Pinnable production cards; **nothing self-pins** | The free-floating resizable window manager |
| **Software Inc.** | Deliberately flat, low-detail buildings so overlays read | Quieten building surface detail so state overlays win | — |
| **Software Inc.** | Explicit player-pressed gate at every stage transition | Named decisions rather than a timer | The Delay stage; progress decay |
| **Football Manager 26** | Tab-per-question comparison; persistent shortlist | Casting comparison as tabs, not a mega-table; pin set as real state | Pinning as a *precondition* for comparing |
| **Crusader Kings III** | `is_shown` / `is_valid` / `is_valid_showing_failures_only` | The three-tier availability contract for the Greenlight gate, declared as data | CK3's own candidate browsers as a casting template |
| **Against the Storm** | Consequence stated **in the slot** | Role slots state the concrete deltas this candidate causes — shoot-days, quality, cost | Assuming PC density transfers to pad or TV |

**The cross-cutting lesson all three world-first comparators agree on:** the world is the readout and
the panel is only an index into it. And: **a building advertises state through three stacked channels
— occupancy, a world-tethered progress indicator, and whether the people who should be there visibly
are — and Project: Studio currently uses none of them.**

---

## 15. Open-Source and Official Unity Pattern Register

Six third-party repositories plus official Unity sources. **Every licence verified live via the
GitHub API during the survey.** Full register in **Builder Annex §G**.

| Repository | Ref | Licence | Value | Ruling |
|---|---|---|---|---|
| **OpenRA** | `64ff8851` (`bleed`, 2026-08-29) | **GPL-3.0 — STUDY ONLY** | Architecture | INDEPENDENTLY REIMPLEMENT |
| **OpenTTD** | tag `15.3` | **GPL-2.0 — STUDY ONLY** | Architecture | INDEPENDENTLY REIMPLEMENT |
| **OpenRCT2** | current | **GPL-3.0-or-later — STUDY ONLY** | Architecture | INDEPENDENTLY REIMPLEMENT |
| **Unciv** | current | MPL-2.0 | Architecture | INDEPENDENTLY REIMPLEMENT |
| **reg-suit** | `v0.14.6` / `5c09c8eb` | MIT | Testing | EXTEND CURRENT SEAM |
| **Playwright** | `v1.62.1` | Apache-2.0 | Testing | EXTEND CURRENT SEAM |
| *Unity: Render Objects (URP manual)* | Unity 6 | Unity docs | Visual | EXTEND CURRENT SEAM |
| *Unity: BagelGame sample* | — | **Unity Companion Licence** | Visual | DEFER → **gate now satisfied (§10)** |
| *Unity: Graphics Tests Framework* | 8.9 / 7.17 | Unity package licence | Testing | EXTEND CURRENT SEAM |
| *Unity: UI Toolkit manual + best-practice guide* | Unity 6 | Unity docs | Architecture | EXTEND CURRENT SEAM |
| *Unity: ui-toolkit-manual-code-examples* | — | **NO LICENCE DECLARED** | Architecture | **DEFER — unlicensed** |
| **ProjectPorcupine** | — | GPL-3.0 | — | **REJECT — documented rejection** |

The single most important architectural lesson: **mature projects do not solve stale markers — they
dissolve the problem.** OpenRA has no marker registry that can go stale because decorations are
cached on the entity itself and are not independently addressable. The lookup table keyed by stage id
— the thing that produces leaked markers — never exists. Project: Studio cannot copy this for free
(its authority is out-of-process), but the rule transfers exactly: **never let a marker be addressable
without its owner.** The same discipline must cover the Render Objects highlight recipe, because that
mechanism filters by GameObject layer, and a layer set but not reverted is a stale marker in
different clothes.

---

## 16. Cross-source synthesis matrix

The final ruling in every row is **Project: Studio-specific**. No design is chosen merely because
several other games use it.

| Goal | Original *The Movies* principle | Modern comparator pattern | Open-source / official lesson | Current seam | Proposed visual ruling | Class |
|---|---|---|---|---|---|---|
| Top executive HUD | One strip: time+transport left, forward-looking timeline centre, cash+rank right, both clickable | FM26: text-only scaling breaks layouts — reflow instead | Unity UI Toolkit best-practice: one tokenised sheet ahead of per-surface sheets | `StudioLivingTimeHud.cs` (IMGUI, 11–20px, cream) | One dark band, three keyline zones, value outranks label. Timeline deferred to a later package. | C (B for metrics) |
| Production Rail | Right-edge cards carrying lifecycle by **icon** (script → camera → can) | Planet Zoo locator pin on every row; Software Inc. collapse-and-pin | OpenTTD: dense lists stay readable via strict column discipline | `StudioProductionRailHud.cs` | Project token: glyph · title · phase line · truth line · six-segment rail · [i] [Locate] | **B** |
| Building attention | Sparkling streams, PA lines, Tab-to-next — **no persistent surface** | Two tiers, muting first-class, closed tier-2 list | OpenRA: markers are owned children, never independently addressable | none | Tier-1 world-anchored badge owned by a per-stage presenter; tier-2 list enumerated before code | **A** |
| World labels | Room state painted on the floor, read from the management camera | Two Point: world colour repeated as a list chip | BagelGame world-space UI Toolkit (Unity 6.2+; gate satisfied) | ground decals — skewed, detached, one mirror-reversed | Billboarded nameplate, leader line to owner, one per active stage | A (stage) / C (people) |
| Casting workspace | Casting Office interior with named rooms and `n/n` counters | FM26 tab-per-question; ATS consequence-in-the-slot | UI Toolkit: header/list/footer scroll ownership | `StudioCastingWorkspace.cs` 🔴 dirty | Retain 35–45% lot; only the list scrolls; role slots state consequence | B — **blocked** |
| Candidate cards | Star cards: portrait + rank + mood + activity glyph | ATS: put the consequence in the slot; FM26 one component three densities | — | text-only, ~1 visible | 632×152, portrait, two headline numerics, cost line, one action | B — **blocked** |
| Blocker / remedy | Right-click bubbles could state what held work up | CK3 three-tier availability; Two Point dual-entry remediation | — | comma run-on, detached from control | Effect → cause → consequence → narrowest remedy → Locate, adjacent to its control | **A** (stage) / B (casting) |
| Stage state language | **No principle to inherit — the original never solved it (§12.1)** | Differentiate look-alike phases by **what the world contains**, not what the HUD says | — | 2.97–5.98% pixel delta; signals are set dressing, not state | Doors + beacon + sign + interior + freight; company truthful when blocked | **A** |
| Two-stage isolation | Multiple stages, each its own picture | Every comparator: per-entity presenter | OpenRA: no addressable-without-owner marker | **impossible** — `stage-a` compile-time constant | Per-stage presenter registry, keyed by exact id | **A — prerequisite** |
| Retained world context | The lot *is* the interface | ATS: dark panel over a still-live settlement | — | cream memo overlaps the dark workspace | Workspace 55–65% right; origin stays lit and ringed; one Back | B |
| Visual proof | — | — | Three-way convergence: tolerance is 3 axes; reg-suit's 4-way classification | single-threshold diff; PNG + id-mask + JSON | Three-axis tolerance, four-way classification, **and a mutual-distinctness floor** | **A** |

---

## 17. Source and licence register

**Original game.** Official Activision/Lionhead PC manual (print 9/27/05) — Valve-hosted PDF; Prima
Official Game Guide (2005, ISBN 0-7615-4445-3) — Internet Archive; contemporary 2005–06 reviews.
Reference only; no asset reproduced.

**Comparators.** Planet Zoo, Two Point Museum, Software Inc., Football Manager 26, Crusader Kings III,
Against the Storm — publisher patch notes, developer devlogs/wikis, official documentation.
Behavioural patterns only; **no branding, trade dress, icon or asset reproduced or recommended.**

**Code.** Copyleft — OpenRA (GPL-3.0), OpenTTD (GPL-2.0), OpenRCT2 (GPL-3.0-or-later),
ProjectPorcupine (GPL-3.0): **study only; must never be a code source for this proprietary game.**
Weak-copyleft — Unciv (MPL-2.0): study only pending Owner ruling. Permissive — reg-suit (MIT),
Playwright (Apache-2.0): attribution **and** an explicit Owner decision required before any reuse; no
reuse is proposed. Unity — Companion Licence (BagelGame) and Unity package licences: Unity-dependent
use, AS-IS, not permissive. `Unity-Technologies/ui-toolkit-manual-code-examples` carries **no
declared licence** and is therefore DEFER regardless of its usefulness.

**Standing ruling: LEARN THE PATTERN, DO NOT COPY THE IMPLEMENTATION.**

**Open-source code reuse — stated explicitly:**
- Was any code copied? **No.**
- Was any dependency added? **No.**
- Was any licence obligation created? **No.**

---

## 18. Final visual judgment

> *How would The Movies' lot-centred studio fantasy be presented if designed today?*

**The lot stays the interface.** The original held ~90% of the frame as world and still shipped a
working management loop; the 2026 version keeps that geometry and spends its modern budget on the
thing the original never had — **telling the player where to look.** The original's triage was a
spoken line and a sparkle. Ours is a persistent, world-anchored, two-tier attention system whose
markers are owned by the thing they describe.

**Buildings do the talking.** The original wrote room state on the floor of the room. We keep the
principle and change the medium: doors, lights, beacons, signage, freight and one restrained
billboarded nameplate — legible at management distance, legible in greyscale, legible at 200% text.
A soundstage that is shooting seals its doors and lights its beacon. A soundstage that is loading in
throws its doors open and has a truck in them. Those two facts are worth more than any panel.

**Numbers get weight; prose gets cut.** The current build states the same fact four times in four
places and renders the most important number at body size. The successor states it once, large, where
the decision is made.

**Every disabled thing explains itself, in place.** Cause, consequence, narrowest remedy, and a
Locate that goes to the exact place. No mute grey button anywhere.

**Colour never carries meaning alone**, era flavour stays restrained, and nothing on screen claims
something the simulation did not say.

What it must **not** become: a generic modern dashboard; a spreadsheet; a mobile HUD; a copy of
Planet Zoo, Two Point, or the 2005 UI; an asset-store theme. The identity is brass and ink over a
lit lot, quiet chrome, and a world that is legible because it is *behaving*, not because a panel is
narrating it.

That is recognisably **Project: Studio**.

---

## 19. What this document deliberately does not do

- It does not authorize implementation.
- It does not change a single frozen token value. The names are contract-frozen and one declaration
  is test-pinned (`StudioWorkspaceHostTests.cs:314–338`); re-tuning a frozen palette is not a visual
  package's authority either way.
- It does not resolve the two contradictions in §9.2 — both are Owner rulings.
- It does not settle the tier-2 alert list, or the ≥25% mutual-distinctness floor. Both are proposals.
- It does not classify global reskinning as P05 work.
- It does not touch, and recommends nobody touch, the thirteen P04A.3 Unity files (eleven under
  `Assets/`, two proof tools) or the thirteen P04A.3 TypeScript files in §11, until that work seals.

---

## 20. Verification record

This package was put through an adversarial verification pass before being presented. Four
independent read-only reviewers were instructed to **refute rather than confirm**, and to default to
"refuted" on anything they could not demonstrate. They checked the TypeScript authority claims, the
Unity code claims, the collision map, and the mockups plus cross-document consistency.

**34 findings were returned. All were adjudicated; the substantive ones are fixed in this revision.**

The three that mattered:

1. **Mockup D variant 4 depicted a state the engine cannot produce.** It showed
   `SHOOTING · held · waiting for a set` with `HELD 2 WEEKS` on an occupied soundstage. But
   `set-unavailable` targets the *next* phase, so its holder sits in `preProduction`, holds
   `['development-casting']` only, and `deriveBindings` forces `stageFacilityId = null` and
   `heldSinceWeek = null` — the stage would render **Idle** by this document's own predicate, and the
   hold duration is not derivable. Confirmed against `src/core/operations.ts` and the committed test
   `tests/c2a-m2-set-binding.test.ts:233–245`. **The mockup failed this document's own Visual Oracle
   question 8.** Repainted as `rehearsal` + `facility-capacity`/`set-scenery` — the one stage-anchored
   hold that is both real and duration-derivable — and §6.1/§6.3/§9 now carry the
   `stageFacilityId !== null` qualification that was missing.
2. **The six Stage variants were presented as independent predicates. They overlap.** `scenery-load-in`
   is itself a blocker, so Load-In matched Blocked as well — which also made §9.1's mutual-distinctness
   floor ill-defined for that pair. §6.1 and Mockup D now state the evaluation order explicitly.
3. **The token-freeze claim was overstated.** The contract freezes the *names*; a test pins *one
   declaration* (`-unity-text-align`), at `:314–338`, not the whole rule block at `:279–358`. §4.1,
   §19 and Annex §B now say exactly what is pinned and by what.

Also corrected: "bit-identical" crew → *positionally* identical (the centroids agree to under a pixel;
the pixels do not); 20 hardcoded colour literals → **19 distinct across 33 sites**; 8 added tokens →
**7** surface/keyline plus 2 semantic; the IMGUI HUD scale has **eight** distinct sizes, not seven;
"two user interfaces" → **three render stacks**; "ten P04A.3 files" → thirteen Unity and thirteen
TypeScript; the stale TypeScript collision list; the P04A.3 commit count (it moved twice more during
authoring — see §11); the North Star and Package 03/05 citations, which do **not** resolve on this
branch and are now marked out-of-repo; Mockup A's stale rail widths; Mockup B's overlapping phase-rail
labels and its misquotation of the North Star control-height rule (**40–44px**, not ≥44px); and
Mockup C's 42px display figure and sub-14px text.

**What survived unchanged:** every `ProductionPhase`, `ProductionBlocker.kind`, `ShootingTaskStatus`
and `WorkflowBindings` literal (a mechanical sweep found **zero invented state names**); all sixteen
`--ps-*` token values; every reference count quoted from the USS; every Unity file:line citation
spot-checked; the entire §11 DO-NOT-TOUCH file table, reproduced delta-for-delta; the four pixel-diff
percentages and the arithmetic derived from them; the A–E classification; and the negative scope —
the documents never claim a visual state is implemented or accepted, and never recommend HDRP, a
renderer migration, DOTS, wholesale UI replacement, new simulation in Unity, or asset-store themes.

Findings deliberately **not** actioned, recorded so the omission is a decision: the mockups still use
a handful of sizes off the declared ladder (12–13px labels in B and D's table chrome). They are
reference diagrams, not specimens; Mockup C's authority line was softened to say so rather than
asserting a conformance the frames do not have. Bringing all four fully onto the ladder is worth doing
if these are ever promoted beyond reference status.
