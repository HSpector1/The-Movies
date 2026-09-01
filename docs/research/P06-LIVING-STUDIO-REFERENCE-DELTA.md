# P06 Living Studio — Reference Delta

**Bounded fresh reference pass authorized by the Owner's 2026-09-01 campaign
order §7. Elapsed research time: ≈1.5 working hours across four read-only lanes
(well inside the 12-hour cap). This document exists because the evidence
materially changes implementation choices in W3–W5b; it does not reopen the
Package 06 comparative program. Code or dependencies copied: NONE.**

Lanes: A — original *The Movies* (local official manual + Prima eGuide PDFs,
base game only); B — current Project: Studio (16 actual sealed-evidence
screenshots opened byte-level); C — six modern comparators (Two Point
Hospital/Campus, Frostpunk 2, Against the Storm, Cities: Skylines 2, Anno 1800,
RimWorld); D — six official Unity sources (UI Toolkit docs/samples family,
graphics test-framework mirror, Dragon Crashers).

---

## 1. Lane A — original-game delta (page-cited; base game only)

Facts NOT already settled by Package 06 research, with rulings:

1. **Movie cards carried a stage icon + a one-line plain-language status string
   — never a progress bar** (script → camera → film-can icons; "in the process
   of being filmed…"; Manual p.6). A genre glyph and, post-release, a chart-rank
   badge overlaid the card; a pulsing "$" marked active earning. **ADOPT:** the
   P06 rail row = lifecycle word + one human status line + genre glyph;
   confirms the no-percentage law. Earning/rank badges are P07 material.
2. **Card verbs:** right-click = instant info bubble (with blocked sets shown
   red), left-click = camera jump, drag = carry to a room (Manual pp.6,8,12).
   **ADAPT:** select/inspect + explicit Locate replace drag; the "blocked
   resource shown red inside the movie's own info" idea maps to the rail row's
   blocker line.
3. **The rail time-shared one category at a time** (Stars/Crew/… cycled by
   arrows; Prima pp.6-7). **ADAPT:** scale device if the P06 rail overcrowds —
   group/collapse rather than shrink.
4. **Building-exterior busy/idle signaling did not exist in the original**
   (targeted search; only the Attractiveness heatmap and in-bubble red set
   lists were distance-legible). **Finding:** building attention markers are
   genuinely NEW design surface — nothing to reconstruct, so the annex's
   restrained shaped-badge contract governs alone.
5. **Lot aliveness was real-state-driven, not decorative:** photographer count
   at the gate scaled with studio rating; unhappy/drunk Stars showed visible
   bubbles; attractiveness had an always-on ambient layer (flowers vs weeds)
   plus an opt-in heatmap; idle Stars pathed to need-satisfying facilities
   (Manual pp.14,18,20; Prima pp.7,48,76). **ADOPT principle:** ambient
   population density and micro-cues may derive from real aggregate stats;
   never from invented per-person state. (P06A applies this only within the
   §19 decorative-bodies law: no IDs, zero-safe.)
6. **Wrap had an animated punctuation** — the finished-movie icon visibly
   "whizzes away" to the Production Office (Prima p.43). **ADAPT (restrained):**
   one deduplicated wrap/dispatch cue is already chartered; this confirms the
   value of punctuating ownership transfer, not of camera movement.
7. **Star cards** carried a live 4-state activity icon and a transient
   "flash the changed stat" notification (Prima pp.6-7,73). **LATER:** a People
   strip is out of P06A scope; recorded for the production-quality backlog.
8. **Hiring was purely spatial** (queue outside building + drag; applicant info
   depth tiered by role; Manual pp.10-12,18). **REJECT the mechanism** (already
   law) but **ADOPT the tiering:** the P06 talent surface may show richer facts
   for Actors than for other roles without that being an inconsistency.

## 2. Lane B — current game (screenshot-cited); the three gaps P06 must not inherit

1. **Workspaces erase the lot.** Any open workspace covers ≈63% of the screen
   and dims the rest to an illegible blur (rehearsal-workspace.png,
   blocked-waiting-workspace.png). The annex's retained-workspace geometry
   (visible lot edge, `min(1180px, 78vw)`) is therefore a REAL change to
   current behavior, not a formality — W5 must not copy the existing casting/
   production panel geometry.
2. **No always-on portfolio exists.** The only multi-picture list is inside the
   Production workspace and omits Development/Casting pictures entirely
   (009-market-open.png). The LSCL movie rail is the FIRST full-portfolio
   surface in the product and must include all ACTIVE lifecycle stages.
   Scope note: Package 06 design §16.3 says P06A "must not build the whole
   portfolio"; the Owner campaign order §19 explicitly authorizes this bounded
   rail over existing truth and supersedes that restriction for this surface —
   the rail carries active-lifecycle rows only (no released/theatrical/result
   rows, which remain P07's), so the §16.3 future unified portfolio remains
   unbuilt.
3. **Building attention is rotated world-space roof text; roof color encodes
   TYPE, never STATE** (idle vs shooting stages are identical in a colorless
   read). W4/LSCL attention markers must be camera-angle-independent shaped
   badges + text, replacing reliance on painted-on text.

Also observed, feeding W5/quality-convergence:

- The Production workspace's labeled-box pattern (STATUS / WHY IT WAITS /
  COMPANY / STAGE & SET; one fact per line) is the strongest current legibility
  pattern — the Release workspace reuses it. The casting workspace is denser
  (five stacked blocks) and is the anti-pattern for density.
- **Scoping defect observed (evidence-backed, pre-existing accepted P05
  behavior):** an insufficient-cash warning about a DIFFERENT picture ("The
  Vanished Constellation") renders inside The Bitter Migration's casting
  workspace in 4 screenshots (006/007/009/013 of the P05A3 acquisition run).
  Not P06 scope to fix silently; recorded for the quality-convergence window /
  hostile-review disclosure, and a standing warning: the Release workspace must
  scope every financial warning to its exact picture or label it studio-wide.
- Current top HUD shows date/speed/cash/burn but never the "why act now"
  reason; attention lives in the left card + up to two floating top-right
  cards with no overflow law. LSCL keeps the HUD truthful (decision/pause
  reason) and the rail absorbs the floating-card role over time.
- Current state vocabulary is colored TEXT only (maroon=blocked, gold=
  actionable); it survives a colorless read only because the words differ.
  The chartered text+shape badges are additive, not redundant.

## 3. Lane C — modern comparator patterns (six comparators)

Adopted (mapped to owning waves):

1. **Badge-to-prefiltered-flow routing** (Two Point Hospital: room staffing
   badge opens Hire pre-filtered by role) → the P05 shortage→FIND AN ACTOR lane
   already embodies this; LSCL talent entry point and Post-waiting remedies
   follow the same one-click-into-scoped-context rule.
2. **Named-cause list + remedy button in one surface** (RimWorld itemized
   cause lists; Cities: Skylines 2's cause-without-remedy is the named
   anti-pattern) → blocker anatomy already carries cause/consequence/remedies;
   every rail/inspector blocker line pairs the cause with its one remedy route.
3. **Inline consequence deltas beside the commit control** (Frostpunk 2 law
   vote) → the Release Review consequence card (annex E2) renders adjacent to
   `Commit <title> to Release`, never on a separate screen.
4. **Small fixed badge vocabulary, worst-first, true-stoppages-only**
   (Against the Storm discipline + CS2 severity culling) → building attention
   and rail badges use one small closed set; informational states never badge.
5. **World-anchored management surfaces** (CS2 info-lens/Two Point docked
   panels keep the world live) → reinforces the retained-workspace lot-edge
   law against Lane B gap 1.
6. **Anti-spreadsheet rail devices** (grouping, caps, progressive disclosure;
   Two Point Campus's flat staff table is the named failure) → rail groups by
   lifecycle, attention-first within stable order, details on open — never
   more columns.

## 4. Lane D — Unity 6 technical constraints (official sources)

Binding on W3–W5b implementation choices:

1. **ListView** with `itemsSource/makeItem/bindItem/unbindItem` for the rail;
   row identity pinned by stashing the DTO's string id (`userData`) and gating
   rebind on it — index-keyed rebinding alone reorders under the pointer.
2. **World-space UI Toolkit is not production-ready in 6000.x** → building
   badges/labels use billboarded TextMeshPro (camera-facing component), not a
   world-space UIDocument.
3. **`ScreenCapture.CaptureScreenshot` + `WaitForEndOfFrame` is documented
   unreliable under `-batchmode`** → P06 oracle captures stay in the existing
   interactive-player pattern (already the P05 law; now doubly justified).
4. **No CSS-media-query equivalent** → narrow/wide adaptation via
   `GeometryChangedEvent` + USS class toggling; safe-area via `Screen.safeArea`
   → `RuntimePanelUtils.ScreenToPanel` padding.
5. **UI Toolkit has no screen-reader support in Unity 6** → P06 accessibility
   claims are scoped honestly to focus order/keyboard/text-scale/colorless
   legibility; no ARIA-style claims.
6. **State-driven presentation**: one state struct + one `Apply(next)`
   diff-and-mutate per presenter; the binding system's exclusion of `style`
   from bindable state is the precedent for animation-never-as-state.
7. Pixel-diff comparison: reimplement the `ImageAssert`-style pattern
   independently if needed; take no dependency on internal packages.

## 5. Source register

- Lane A: official *The Movies* manual (local PDF, printed pp.6-22 cited);
  Prima Official eGuide (local PDF, printed pp.6-8,14-15,41-49,60-61,73,76
  cited). Base game only; no expansion/mod material used.
- Lane B: sealed evidence trees `Evidence/P05A3-Journey/hid-20260901T081843Z/`,
  `Evidence/P05-Oracle-Final/*`, `Evidence/P05-Journey-Final/hid-20260830T225349Z/`
  (16 images opened).
- Lane C: official/dev-blog/reputable-press sources per comparator (six games;
  full per-question notes retained in campaign scratchpad lane file; no
  branding or art copied).
- Lane D: Unity Manual/Scripting API (UI Toolkit ListView, runtime bindings,
  world-space UI status, ScreenCapture, safe area, focus), Unity graphics
  test-framework mirror (pattern only, no dependency), Dragon Crashers sample.
  Rule applied throughout: learn the pattern, independently implement, copy no
  code. Dependencies added: none.
