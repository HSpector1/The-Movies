# Project: Studio — Character Evidence Index

> **Governing packet identity**
>
> - Packet: **Project: Studio Human-Artist Character Handoff**
> - Version: **CHH-2026-08-06-R1**
> - Revision date: **2026-08-06**
> - Governing branch: `asset-lab-character-human-artist-handoff`
> - Supersedes Git tip: `9c0466d7678ad0b42bf2f91cefec2d8b9da32250`
> - Packet content SHA-256: `013b5b050d9f70698b74ec54e6c181818994c98729cdeb725e54686e9aa2a614`
>
> A copied page is current only when its packet name, version, revision date, governing branch, and
> packet-content SHA-256 match the other seven packet documents at the governing branch tip. The Git commit
> cannot safely embed its own future SHA, so the packet-content SHA-256 is the in-document immutable identity;
> verify the live governing Git tip separately.
>
> This packet is a commissioning specification only. It is not permission to begin work, produce a character,
> integrate a character, or begin D1-B.

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
  authorized. **D1-A is a completed, merged, closed and tagged studio-identity milestone — not unstarted**; its
  record is in the **production** repository on `main` (`docs/art/D1-A-CLOSURE.md`, merged as `af7c238`, closed
  and tagged at `e87c34f`), not in this handoff branch. It did **not** integrate this character and does
  **not** authorize character production, human-artist commissioning, or integration. Historical statements
  that **D1-A was not started, not designed, or not scaffolded** — for example in
  `docs/ASSET-LAB-05H-FINAL-ART-PM-RECOMMENDATION.md` — are **superseded**. **D1-B is unstarted and is not
  authorized**; it is separately governed, is not assumed to include characters, and any character integration
  proposed under it requires separate authorization and acceptance evidence. This index is a historical pointer
  set, not permission to execute the commission.

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
- 05I Iter 1 — **note the layout differs from Iter 2: there is no `iteration-01/blender/` directory.**
  - `proof/lab05i/iteration-01/runtime/`
  - `proof/lab05i/iteration-01/real-gpu/`
  - the twelve Blender fast-iteration renders are stored **directly under** `proof/lab05i/iteration-01/`:
    `3q.png` · `back.png` · `boots.png` · `face.png` · `front.png` · `hat.png` · `kneel.png` · `pickup.png` ·
    `side.png` · `sit.png` · `vest.png` · `walk.png`
  - `proof/lab05i/iteration-01/root-cause/` (`materials.json`, `materials.mjs`) where relevant
- 05I Iter 2: `proof/lab05i/iteration-02/{runtime,real-gpu,blender}/` (runtime = 24 views + wireframe + 3 neutral;
  real-gpu = Metal close-ups; blender = fast iteration renders — the same twelve filenames as the Iter-1 set above,
  nested one level down)
- Same filenames across `iteration-01/` and `iteration-02/` at the same framing = the Iter-1↔Iter-2 before/after
  (05H is the shared left-hand reference in every pair). `runtime/` and `real-gpu/` pair directory-to-directory;
  the Blender set pairs `iteration-01/<name>.png` against `iteration-02/blender/<name>.png`.

## Material root-cause dumps
- `proof/lab05i/iteration-02/root-cause-materials.json` (05I), `proof/lab05h/final-owner-review/root-cause/materials.json`
  (05H) — GLB material assignments; both confirm skin = warm tan `#e8b58f`.

## Animation evidence
- 05H clip WebMs + contact sheets: `proof/lab05h/final-owner-review/animation/<clip>/{motion.webm,contact-sheet.png}`.
- 05I per-clip runtime stills: `proof/lab05i/iteration-0{1,2}/runtime/16-walk.png`…`20-sitting.png`.

## Documentation

**This package (8 documents, `docs/handoff/`):** `CHARACTER-ARTIST-HANDOFF-BRIEF.md` ·
`CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md` · `CHARACTER-TECHNICAL-CONTRACT.md` · `CHARACTER-KNOWN-DEFECTS.md` ·
`CHARACTER-ACCEPTANCE-TESTS.md` · `CHARACTER-SOURCE-AND-PROVENANCE.md` · `CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md` ·
`EVIDENCE-INDEX.md` (this file).

**05I history — all 6 reports** (`docs/`, preserved, superseded on status):
`ASSET-LAB-05I-BRIEF.md` · `ASSET-LAB-05I-ITERATION-LOG.md` · `ASSET-LAB-05I-ITERATION-1-REPORT.md` ·
`ASSET-LAB-05I-ITERATION-2-REPORT.md` · `ASSET-LAB-05I-FINAL-REPORT.md` · `ASSET-LAB-05I-OWNER-REVIEW-GUIDE.md`.

**05H history — all 14 reports** (`docs/`, preserved, superseded on status):
`ASSET-LAB-05H-BRIEF.md` · `ASSET-LAB-05H-ITERATION-LOG.md` · `ASSET-LAB-05H-VISUAL-BASELINE.md` ·
`ASSET-LAB-05H-FINAL-REPORT.md` · `ASSET-LAB-05H-FINAL-OWNER-REVIEW.md` ·
`ASSET-LAB-05H-FINAL-ART-PM-RECOMMENDATION.md` · `ASSET-LAB-05H-MANAGEMENT-CAMERA-ASSESSMENT.md` ·
`ASSET-LAB-05H-OWNER-REVIEW-GUIDE.md` · `ASSET-LAB-05H-PERFORMANCE.md` ·
`ASSET-LAB-05H-REAL-GPU-PERFORMANCE.md` · `ASSET-LAB-05H-PROVENANCE-AUDIT.md` ·
`ASSET-LAB-05H-FALLBACK-ASSESSMENT.md` · `ASSET-LAB-05H-INTEGRATION-RECOMMENDATION.md` ·
`ASSET-LAB-05H-WORKFLOW-DECISION.md`.

> All 05H and 05I reports above are governed by the status notice at the top of this file. Where any of them
> conflicts with the current ruling on status, readiness or integration, **the ruling governs.**

**Character standards** (pre-existing, useful reference, not part of this ruling):
`docs/AUTHORED-{BASE-CHARACTER,CHARACTER-RIGGING,CHARACTER-TOPOLOGY,WORKWEAR}-STANDARD.md` ·
`docs/CHARACTER-{CLOTHING-ART,CLOTHING,COORDINATE,FACE-AND-HAIR,FACE,HANDS-AND-FEET,LOD,MATERIAL-AND-PALETTE,MESH-AND-TOPOLOGY,PROPORTION-AND-SILHOUETTE}-STANDARD.md` ·
`docs/CHARACTER-{DEFORMATION-REFINEMENT,RIGGING-AND-WEIGHTS,ROLE-VARIANTS}.md` ·
`docs/HERO-CHARACTER-{DEFORMATION,FITTED-VEST,PELVIS-AND-TROUSER,SHOULDER-AND-HAND,WORK-BOOT}-STANDARD.md`.

## Provenance
- `licenses/asset-lab-05h/PROVENANCE.json`, `CC0-1.0.txt`, `human_base_male_stylized_cc0.glb`,
  `thumbnail_stylized_body_male.png`.
