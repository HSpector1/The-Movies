# Project: Studio — Character Evidence Index

## ⚠️ STATUS NOTICE — historical records are superseded on status

Everything indexed below is a **preserved historical record**. These reports **predate the final Owner ruling** in
[`CHARACTER-ARTIST-HANDOFF-BRIEF.md`](./CHARACTER-ARTIST-HANDOFF-BRIEF.md)
(repo-root path: `docs/handoff/CHARACTER-ARTIST-HANDOFF-BRIEF.md`).

- **Historical records must not be rewritten.** They are the audit trail of how the track reached its current state.
- **Their provenance and technical findings remain valid** unless specifically retracted inside the record itself.
- **Commissioning and production status are controlled by the current Owner ruling — not by any report below.**
- Historical **"all viable"**, **"production-directionally sound"**, **"finishing correction"**, **"adopt the
  authored-base BODY pipeline"** and other polish-only or near-ready framing is **superseded**. In particular,
  `docs/ASSET-LAB-05I-FINAL-REPORT.md` lists proportions among items it calls "all viable"; the current ruling
  records **body mass and proportions as unresolved and blocking** (`CHARACTER-KNOWN-DEFECTS.md`, BLOCKER 3).
- Any **implication of visual approval** in a historical report is **superseded**. The 05I model is **rejected as a
  production character foundation**.
- **No historical report authorizes production integration.** No production or Studio Lot integration is
  authorized; D1-A and any subsequent D1-B Studio Lot character phase remain unstarted and separately governed.

Where a historical report and the current ruling conflict, **the ruling governs**.

---

Pointers to the existing 05H and 05I proof. **No large binaries are duplicated** — everything below already lives in
the repo; open the paths directly. Paths are relative to the repo root.

## Fastest visual entry points (open in a browser)
- `proof/lab05i/iteration-02/index.html` — 05I Iteration-2 (final) owner review (the "before" state for the handoff).
- `proof/lab05i/iteration-01/index.html` — 05I Iteration-1 checkpoint (for the Iter-1↔Iter-2 comparison).
- `proof/lab05h/final-owner-review/index.html` — the original 05H defect review (why 05I was commissioned).

## Character defect evidence (annotated in `CHARACTER-KNOWN-DEFECTS.md`)
- **Face:** `proof/lab05i/iteration-02/runtime/09-face.png`, `.../real-gpu/front.png`, `.../runtime/neutral-face.png`.
- **Hands/wrists/forearms:** `proof/lab05i/iteration-02/real-gpu/{front,walk}.png`,
  `.../runtime/16-walk.png`…`20-sitting.png`, `.../runtime/neutral-side-by-side-front.png`.
- **Proportions:** `proof/lab05i/iteration-02/real-gpu/side-by-side.png`, `.../runtime/07-front-three-quarter.png`.
- **Boots (toe seam):** `proof/lab05i/iteration-02/real-gpu/boots.png`, `.../runtime/14-boots-feet.png`.
- **What is sound:** `proof/lab05i/iteration-02/runtime/{15-hard-hat,12-vest-side-wrap,21-lod,25-wireframe,24-management-distance}.png`.

## Matched comparison sets (same camera framings)
- 05I Iter 1: `proof/lab05i/iteration-01/{runtime,real-gpu,blender}/`
- 05I Iter 2: `proof/lab05i/iteration-02/{runtime,real-gpu,blender}/` (runtime = 24 views + wireframe + 3 neutral;
  real-gpu = Metal close-ups; blender = fast iteration renders)
- Same filenames across `iteration-01/` and `iteration-02/` at the same framing = the Iter-1↔Iter-2 before/after
  (05H is the shared left-hand reference in every pair).

## Material root-cause dumps
- `proof/lab05i/iteration-02/root-cause-materials.json` (05I), `proof/lab05h/final-owner-review/root-cause/materials.json`
  (05H) — GLB material assignments; both confirm skin = warm tan `#e8b58f`.

## Animation evidence
- 05H clip WebMs + contact sheets: `proof/lab05h/final-owner-review/animation/<clip>/{motion.webm,contact-sheet.png}`.
- 05I per-clip runtime stills: `proof/lab05i/iteration-0{1,2}/runtime/16-walk.png`…`20-sitting.png`.

## Documentation
- Handoff docs: `docs/handoff/*` (this package).
- 05I history: `docs/ASSET-LAB-05I-{BRIEF,ITERATION-LOG,ITERATION-1-REPORT,ITERATION-2-REPORT,FINAL-REPORT,OWNER-REVIEW-GUIDE}.md`.
- 05H history: `docs/ASSET-LAB-05H-{FINAL-OWNER-REVIEW,FINAL-ART-PM-RECOMMENDATION,MANAGEMENT-CAMERA-ASSESSMENT,REAL-GPU-PERFORMANCE,FALLBACK-ASSESSMENT}.md` and the pre-existing `ASSET-LAB-05H-*` standards.
- Character standards (pre-existing, useful reference): `docs/CHARACTER-*.md`, `docs/HERO-CHARACTER-*.md`,
  `docs/AUTHORED-*-STANDARD.md`.

## Provenance
- `licenses/asset-lab-05h/PROVENANCE.json`, `CC0-1.0.txt`, `human_base_male_stylized_cc0.glb`,
  `thumbnail_stylized_body_male.png`.
