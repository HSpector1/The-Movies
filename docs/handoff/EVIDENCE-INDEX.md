# Project: Studio — Character Evidence Index

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
