# PROGRESS — dated log

## 2026-09-12

- Fetched `hspector-github`; confirmed reviewed R2 head `e564d236` is still the
  tip of `docs/uiux-whole-game-review-01` (no newer Codex work).
- Confirmed the published brief `05e9902e` is byte-identical to the Owner's
  Downloads copy; the addendum was appended in `234a36ef` on the same branch.
- Created worktree `~/The Movies - UIUX Opus R2 Review` on new branch
  `docs/uiux-opus-r2-independent-review-01` from `234a36ef`.
- Wrote the package skeleton (`00-HANDOFF.md`, `ASSIGNMENT.md`, `PROGRESS.md`,
  `SOURCES.md`, `FINDINGS.md`, `assets/`). Initial checkpoint commit follows.
- R2 retrieved via `git archive e564d236`; ZIP verified (21,736,950 B; SHA-256 match).
  Unpacked to scratch; all 8 families' PNGs viewed; `index.html` exercised in a fresh
  Playwright/Chromium 149 headless context with non-`file://` requests aborted
  (`assets/r2-evidence/r2-exercise.js`, log in `r2-exercise-log.json`): 0 page errors,
  0 console issues, 0 network attempts; 32 states captured (hover, search "Mara",
  person, right-click, Back, production, detail, Needs-me/Waiting filters, Post wait,
  casting building, compare, Leon, Back, Build catalogue/placement/invalid, Menu,
  Studio drawer, keyboard focus, early, 1280×720 @200 % ×3, alternatives, result,
  finance, Save As).
- Measured on the home board: 1 unique avatar shape of 12; 12 distinct border radii;
  9 distinct box-shadows; secondary rail text 10 px; single font family.
- Wrote `FINDINGS.md` (19 U- and 14 V- findings, executive diagnosis, disposition) and
  7 annotated evidence crops (`assets/r2-evidence/A01–A07`).
- Viewed the official manual spreads for printed pp.4–9 myself (HUD diagram, star
  cards, movie cards, bubbles, pips); first `SOURCES.md` batch S1-01 written; crops in
  `assets/original-game/`.
- Launched one background research workflow (4 original-game lenses + 7 comparators +
  frame verification + gap critic; Sonnet subagents). Results pending.
- Built the proposal prototype under `assets/design/` (data.js = R2 fixture, portraits.js,
  lot.js target-lot proof, app.js, design.css, explorations.css, index.html, render.cjs).
  Rendered with the same isolated harness: 33 boards, 0 page errors, 0 console issues,
  0 network attempts (`assets/design-renders/render-log.json`). Measured on the proposal
  home board: 3 radii (4 px, 8 px, 50 %), 2 shadows, 0 reading text under 12 px, 0 tracked
  micro-labels under 10 px, 12/12 distinct portraits, first person reachable 3 Tabs after
  the HUD (hotkeys 1/2 jump to the rails).
- Draft state: explorations A/B rendered; recommended K1–K4 clean + annotated rendered;
  R2-world comparison, early, long-name, waiting and 1280×720 (100 %/200 %) variants
  rendered; 14-step journey captured (J1–J14). Component sheet and comparison boards
  still to do.
