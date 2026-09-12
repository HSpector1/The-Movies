# 00-HANDOFF — Opus independent R2 game UI/UX and art-direction review

**Status:** `IN PROGRESS` — initial checkpoint only. No verdict has been reached yet.

**Read order for a successor:** this file → `ASSIGNMENT.md` → `SOURCES.md` →
`FINDINGS.md` → `PROGRESS.md` → `assets/`. Verify ownership (below) and preserve
any newer work on this branch before continuing. Attribute observations below
as Opus observations; mark your own subsequent checks separately.

## Ownership and identities

| Item | Value |
| --- | --- |
| Current owner | Opus review terminal (Claude Opus, dispatched by the Owner 2026-09-12) |
| Review branch | `docs/uiux-opus-r2-independent-review-01` |
| Documentation parent (exact) | `234a36ef38bd08000dae38246a4d1bf292a0d347` on `docs/uiux-playability-priority-01` (brief `05e9902e` + Owner addendum `234a36ef`) |
| Reviewed Codex R2 (exact, unchanged) | `e564d236407cb3616ebc597713d5b9fa7d60b38a` on `docs/uiux-whole-game-review-01`; design-content commit `1fab1a3abc297b4533739e2ba7f95e8e13de08b5` |
| R2 root | `docs/operations/uiux-visual-blueprint/r2/` (entry `README.md`, archive `delivery/UIUX-VISUAL-BLUEPRINT-R2.zip`) |
| Newer Codex work check | `git fetch` at 2026-09-12: `docs/uiux-whole-game-review-01` head is still `e564d236`. No delta beyond the reviewed baseline. |
| Existing Opus-review assignment check | No branch matching `docs/uiux-opus-*` existed before this one was created. No equivalent records elsewhere. |
| Last verified published checkpoint | `44cec258` (skeleton); second checkpoint = the commit containing this line (see `git log`) |
| Working package | `docs/operations/uiux-opus-r2-independent-review/` (this directory) |
| Worktree | `~/The Movies - UIUX Opus R2 Review` (isolated; no other worker's worktree was switched or reset) |

## Authority boundaries (unchanged)

- Codex remains the author of R2. This branch never edits `docs/uiux-whole-game-review-01`.
- Current Ops owns the planning/implementation handoff; the selected sequence
  (Playability & Interaction before the targeted P13B refresh) is not changed here.
- Nothing here is an execution order. Pending **design approval** by the Owner is
  distinct from **implementation authority**, which this review does not grant.
- No gameplay edits, game launches, bridge connections, campaign/profile access,
  builds, hooks, dependencies, PRs, merges or protected-ref promotion.

## Deliverables — completed vs remaining

| Deliverable | State |
| --- | --- |
| Isolated branch + initial checkpoint (this package skeleton) | done |
| R2 archive retrieved from git, bytes/SHA-256 verified, PNGs viewed, prototype exercised in an isolated browser | **done** (see PROGRESS 2026-09-12) |
| Original *The Movies* reconstruction (manual pages 4–9, retail footage, ≥3 continuous workflows), evidence table | **in progress** — manual pp.4–9 viewed by Opus (SOURCES S1-01); footage/stills/behaviour research running in a background workflow |
| Comparator evidence atlas (~4–6 titles, several observations each) | remaining |
| Annotated R2 findings + KEEP/REFINE/REDESIGN register | **done (draft)** — `FINDINGS.md`, `assets/r2-evidence/` |
| Two art-direction explorations (same layout/data/viewport) | remaining |
| Recommended direction: four rendered key screens, clean + annotated, editable source | remaining |
| Component/art-direction sheet (type, spacing, palette roles, states, motion/audio intent) | remaining |
| Small linked prototype (overview → person → production → Back) | remaining |
| R2-vs-proposed comparison board at identical scale/content | remaining |
| Heuristic/cognitive walkthrough + prototype task observations; future human-test list | remaining |
| One bounded independent Sonnet checker pass | remaining (deferred if the allowance margin requires it) |
| Handoff to Codex (presentation, interaction, read-model deps, P13B boundaries, native gaps) | remaining |
| Visual index + one ZIP + manifest + checksums, remote bytes verified | remaining |

## Blockers / access limitations

- None yet. Owner-supplied reference screenshots referenced by R2's
  `reference-manifest.json` will be inspected only if the files are actually
  accessible in the repository or archive; metadata alone will not be counted.
- The original game will not be installed or run.

## Next 3–5 concrete actions

1. Fold the background research results (footage frames, stills, behaviour docs, comparators) into `SOURCES.md` S1/S2 and write the original-game reconstruction + comparator atlas (`RESEARCH-ORIGINAL-GAME.md`, `RESEARCH-COMPARATORS.md`) with limited illustrative frame excerpts under `assets/original-game/` and `assets/comparators/`.
2. Build the two art-direction explorations of V01 (same 1440×900 viewport, same fixture data as R2) as editable HTML/CSS/SVG under `assets/design/`, render with the same Playwright harness, and record the choice.
3. Develop the recommended direction into the four key screens (overview, person, production, casting compare), clean + annotated, plus the component sheet and the small linked prototype (`assets/design/index.html`).
4. Render the R2-vs-proposed comparison board at identical scale/data; run the heuristic walkthrough script; run one bounded Sonnet checker.
5. Write `00-INDEX.md` (visual index), `HANDOFF-TO-CODEX.md`, build the ZIP + manifest + checksums, push, verify remote bytes.
