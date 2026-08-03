# Asset Lab 05I — Iteration 1 Report (owner return)

**Recommendation: ITERATION 2 REQUIRED** (specialist + adversarial panel unanimous). Iteration 1 fixed the
wardrobe/coverage blockers with no regressions to the rig; the owner-named anatomy defects (face, proportions)
remain, so a second targeted pass is warranted. Iteration 2 is **not** authorized without a new owner instruction
(2-iteration limit). Do not treat this as production approval.

1. **Verified starting branch & HEAD** — `asset-lab-05h-final-owner-review-package` @ `ddfd69fbc22be313f9dbb548c2b16032c9802daa` (== approved source; verified HEAD, clean tree, local==backup, 05G/05H unchanged before branching).
2. **05I branch & final HEAD** — `asset-lab-05i-corrective-character-pass` (final HEAD recorded at commit, below).
3. **Initial clean-worktree** — clean (empty porcelain) at branch creation.
4. **Implementation structure** — thin additive layer `blender/studio_pipeline/authored05i.py` importing the accepted 05H base + garment helpers (05H generator unchanged); export `blender/build_hero_export_05i.py` → `electric_hero_05i{,_LOD1,_LOD2,_COL}.glb`. A full fork was not needed (composition was technically safe).
5. **Garment changes** — SHIRT thickened (0.013→0.024) to read as cloth; VEST rebuilt as a COMPLETE open-front hi-viz arc-loft shell + reflective bands (replaces 05H's fragmented offset vest), front opening narrowed so it covers the chest; TROUSERS reused (sound).
6. **Body-proportion changes** — reduced muscularity via per-region girth scaling (arms 0.74, chest/back 0.76–0.82, thighs 0.87, shoulders narrowed). Slimmer than 05H, though the panel judges arms/shoulders still read bulky.
7. **Face changes** — structural eases (brow/nose/ears) + strong even smoothing + eye-socket fill → softer, rounder than 05H. **The panel judges the face essentially unchanged / still heavy — the primary remaining defect.**
8. **Boot changes** — replaced 05H's thin foot-hugging shell (which left feet bare) with a fitted enclosing boot + ankle shaft weighted to the calf. Feet fully covered; a skinning-weight split (sole vs toe) appears on the moving foot in motion — an Iteration-2 cleanup.
9. **Hard-hat & hair changes** — closed hard-hat dome sized/placed from the head's actual bounds, brim at the brow (no exposed scalp); hair restricted to the nape. (A pass-5 over-sized "balloon" hat was a self-introduced regression, corrected to a snug cap in pass 6 — see the iteration log.)
10. **Material & lighting findings** — GLB material dump (`proof/lab05i/iteration-01/root-cause/materials.json`) confirms the SKIN material is correct warm tan (#e8b58f, unchanged from the 05H foundation); garments are distinct `mat_i_*` materials. Added a neutral evaluation-light mode (§7); under it the residual "blue" on arms/neck is the blue work-shirt reading as skin, not a skin-material bug.
11. **Matched 05H↔05I evidence** — `proof/lab05i/iteration-01/runtime/` (24 views + wireframe + 3 neutral) + `real-gpu/` (6 Metal close-ups), identical camera/light/scale/pose per pair.
12. **Six-clip results** — all six clips deform; the closed hat, solid vest, and belt stay anchored and deform with the body across walk/talk/kneel/pickup/sit. One defect: the boot splits (sole/toe) on the moving foot.
13. **LOD results** — LOD0 **22,772** / LOD1 **10,247** / LOD2 **4,553** tris; 65 joints each; silhouette preserved. Leaner than 05H (24,509).
14. **Human-scale findings** — clear improvement: reads unambiguously as a utility worker (hi-viz vest + hard hat + tool belt + boots) vs 05H's "shirtless ogre in a torn headband." Remaining majors: heavy face; still-bulky arms; blue arms/neck reading as bare skin.
15. **Management-distance findings** — reads cleanly as a hard-hatted hi-viz worker; NOT used to excuse the human-scale face/proportion defects.
16. **Reviewer findings** — 3-panel (Character Art, Rigging/Animation, Adversarial), all **ITERATION 2 REQUIRED**. Fixed (confirmed): vest, boots (coverage), hat, scalp, worker legibility, rig preserved. Remaining majors: face unchanged, proportions still bulky, arm/neck skin read, boot skinning-split. Minors: oversized boots + ankle gap, bowler-ish hat, ragged vest hem/PFD collar, no explicit "Electric" cue.
17. **Known remaining defects** — see 14/16. Adversarial flags the boot foot-deformation split as a mild regression vs 05H's clean bare foot (on new boot geometry, not the preserved rig).
18. **Validation** — `validate-05i.mjs` PASS (65 joints, budgets, additive integrity, evidence, harness wired).
19. **TypeScript & build** — `tsc --noEmit` clean; `vite build` clean.
20. **Console-error result** — runtime capture console-error-free (errorCount=0).
21. **Accepted commit** — recorded below (additive on the 05I branch).
22. **Reverted experiments** — box+sphere+cylinder boots; bone-guess placement; over-smoothing nudges; the pass-5 balloon hat (all in the iteration log).
23–27. **SHAs & integrity** — recorded below; local==remote confirmed; **05G and 05H GLBs byte-UNCHANGED** (05H sha256 `86971e47…` re-verified).
27. **No production or Engine repository modified** — confirmed (all work in the Asset Lab repo on the isolated branch).
28. **Recommendation — ITERATION 2 REQUIRED.** (Not ACCEPT: two owner-named anatomy defects remain. Not STOP: the wardrobe fixes prove the procedural approach can reach the target; the remaining work is a targeted face + proportion + arm-cloth + boot-weighting pass.)
29. **Exact local review URL** — `file:///Users/bruce/Project Studio - Asset Lab/proof/lab05i/iteration-01/index.html` (or via the app: `http://localhost:4321/proof/lab05i/iteration-01/index.html`).

No integration, propagation, named talent, renderer work, or D1/D1-A/Engine changes occurred. No PR, no merge; the isolated branch is pushed to `backup` only.
