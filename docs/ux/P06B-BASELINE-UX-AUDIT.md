# P06B — Baseline UX Audit (§9)

Ranked audit of the **current P06A candidate** (byte-identical worktree build, exe `aabc41f8…`),
from direct inspection of actual screenshots at 1440×900 and 1280×800. Evidence:
`docs/campaigns/evidence/p06b-baseline-ux/` (s4 release-ready, s5 committed, s6 multi-picture ×2
viewports, s6 building-card). Severity: **P0** blocks/lies · **P1** cannot-understand action/state ·
**P2** materially prototype-looking/inefficient · **P3** polish. Implementation targets P0/P1 + the
highest-value P2s; P3 only if cheap.

## What already works (do NOT regress)

- The **3D lot genuinely dominates** and looks alive: labeled buildings (Sound Stage, Casting/Talent,
  Production/Post, Development, Theater, Administration, Gate), named talent bodies on the lot
  (Basil Marsh, Irene Ostrow, …), vehicles, crew. World presence is a real asset.
- The **movie rail lists every active movie** with phase + LOCATE (s6 shows all 4).
- The **hold law reads correctly**: commit is gated behind an explicit button; copy is honest
  ("nothing happens until you commit", "Irreversible. Advances no time…").
- **Exact-ID isolation** appears intact (distinct titles per row; commit names the exact title).
- The **top HUD (at wide width)** shows week, cash, weekly burn, speed, pause — the right facts.

## P1 — cannot understand action/state

1. **HUD disappears entirely at 1280×800** (`s6-lot-1280.png`). At narrow width the whole top bar is
   gone — **no cash, no 1×/2×/4× speed, no date/pause**. Only the time *verb* falls back into the
   memo ("Hold … advance the week"); **cash and speed have no fallback surface**. §12 requires the HUD
   to preserve date/week/pause/speed/cash; §20 requires legibility at 1280×800. → **W1 + W9.**
2. **Movie-rail titles truncate** (`s6-lot-1440.png`: "The Hollow Inheritanc"; earlier "Rumors of
   Constellati"). A picture's **identity** — the most important rail fact — clips. → **W2.**

## P2 — materially prototype-looking / inefficient

3. **The rail is a stack of detached floating boxes** with gaps and inconsistent heights → it reads
   as tooltips, not a professional portfolio rail. No unified container, no lifecycle iconography,
   **no time-remaining on rows** (memo has "1 week remaining"; rail doesn't), **weak attention
   hierarchy** (the action-required RELEASE-READY row is only marginally emphasized vs POST rows; the
   `▸` marker is tiny), and rows signpost only LOCATE (no explicit Details/open affordance). → **W2 (primary).**
4. **The left memo is an over-dominant text panel** occupying ~28% (1440) → ~32% (1280) of the screen,
   reading as a debug/proof panel and functioning as the *primary* surface — contra §10/§18 (world
   dominates; memo *reinforces*). It **duplicates** rail/world facts (title, phase) and is dense with
   low typographic hierarchy. → **W7 + W0 (+ W1 once HUD carries the heartbeat).**
5. **Building-card grammar is split across two inconsistent surfaces** (`s6-building-card-1440.png`):
   a dark hover/entry card *and* a separate bottom "LOT SELECTION" panel, different styling,
   overlapping content. → **W4.**
6. **No shared visual token system**: memo (light beige), building card (dark), rail (light), HUD
   (light) use different surfaces/type; overall flat IMGUI + system font reads prototype, not the
   2026 visual language. → **W0.**
7. **Forward action does not visually outrank** secondary/tertiary: Commit (forward), Annex
   (secondary), Hold (time) are equal-weight full-width flat buttons; no clear primary-CTA styling.
   §11 requires the forward action to outrank Back/secondary. → **W0 + W5.**
8. **Top HUD hierarchy/targets (wide)**: thin bar, small pause glyph, tiny 1×/2×/4× tabs, active
   speed not clearly indicated, "$…M ▼ $…k/wk" trend-glyph semantics ambiguous. → **W1.**

## P3 — polish

9. Rail card bottom text ("Ready — your decision", "Waiting for Post") slightly clipped at narrow.
10. Cash "▼" glyph meaning is unexplained (trend? overhead direction?). Clarify or drop. → W1/W8.

## Regression traps to respect (from P04 lessons + observed)

- The **ActionsEnabled latch**: selecting a building briefly flips the memo to "LAST STUDIO VIEW ·
  ACTIONS PAUSED WHILE YOUR STUDIO REFRESHES" and greys the buttons (observed in
  `s6-building-card-1440.png`). Any change to shared enablement/input must audit sibling consumers and
  must not make a visible enabled button silently return (§15/§16 material-action law).
- **World works without rail priming** — must stay true; the rail is a shortcut, never a prerequisite.

## Wave priority (from this audit)

- **W0** shared visual system (unblocks 6, 7; underpins everything).
- **W1** top HUD — fix the narrow-width disappearance (P1 #1) + hierarchy (#8).
- **W2** movie rail (PRIMARY) — title truncation (P1 #2) + unified rail, icons, time, attention (#3).
- **W4** building cards — converge the double surface (#5).
- **W3** talent access · **W5** workspace convergence · **W7** guidance/memo de-emphasis (#4).
- **W6** lot life (already strong; incremental) · **W8** economy clarity · **W9** accessibility/responsive (#1, focus).

No P0 found: nothing currently lies or blocks play. The work is elevating a functional-but-prototype
surface to a professional 2026 studio-management UI without disturbing the correct simulation beneath.
