# Asset Lab 05I — Iteration 2 Report (owner return)

**Final recommendation: REJECT CURRENT 05I — HUMAN ARTIST REQUIRED.** Panel unanimous. This is the final authorized
05I iteration; no further iteration is undertaken. See `ASSET-LAB-05I-FINAL-REPORT.md`.

1. **Verified starting branch & HEAD** — `asset-lab-05i-corrective-character-pass` @ `92968e328317e85629b9b40c83917e442308790f` (Iteration-1 HEAD; verified branch/HEAD/clean-tree/local==backup/05G-05H-unchanged before edits).
2. **Final branch & HEAD** — `asset-lab-05i-corrective-character-pass` (final HEAD at commit, below); same branch.
3. **Initial clean-worktree** — confirmed clean at start.
4. **Face corrections** — reshaped the CC0 features (flatten profile, narrow jaw, ease brow/nose/chin/jowls, tame ears, fill eye sockets) + smoothing. Result: softer/simpler than 05H but still heavy at close range; a harder push (aggressive reshape + 9× smooth) produced a melting-fold face that read **worse** than 05H and was reverted to a gentler version. **Target A NOT reached — the face is not procedurally appealing.**
5. **Proportion corrections** — per-region girth reduction (arms/chest/back/thighs/shoulders/neck). Slimmer than 05H's bodybuilder build. **Target B partially met** (panel: still reads broad in places / partly masked by the vest).
6. **Shirt/arm/neck material-read corrections** — the shirt is now a SHORT-SLEEVE crew shirt (bare warm-tan forearms + a clean blue collar); GLB dump confirms skin = warm tan (unchanged), shirt a distinct fabric. **Target C met at rest**, but clothing/animating the arms exposed a hand-skinning collapse (below).
7. **Boot-deformation corrections** — rebuilt as a thick OFFSET SHELL of the foot that inherits the foot's exact skin weights, so it deforms with the foot and stays attached in motion. **Target D (detach/split at the attachment level) met**; a residual toe seam remains on the GPU close-up.
8. **Preserved Iteration-1 improvements** — complete hi-vis vest, closed hard hat, covered scalp, belt/radio, six-clip compatibility, LODs, runtime, neutral-light mode — all held (confirmed by the panel).
9. **Matched Iter1↔Iter2 evidence** — `proof/lab05i/iteration-01/` vs `proof/lab05i/iteration-02/` at identical view framings (05H is the shared left reference); runtime (24 views + wireframe + 3 neutral), real-GPU (Metal) close-ups, Blender renders.
10. **Six-animation results** — all six clips deform; garments/hat/belt/boots anchored. **The forearms/hands collapse into dripping "wax-drip" tendrils in every clip** (idle/walk/talk/kneel/pickup/sit) — a base-mesh hand-skinning failure that manifests on the posed/decimated export.
11. **LOD results** — LOD0 **22,856** / LOD1 **10,285** / LOD2 **4,570** tris; 65 joints each; height 1.845.
12. **Neutral-light findings** — the melting hands appear in the neutral-material renders too → geometry/skin-weights, not lighting. Skin renders as warm tan under neutral light (correct material).
13. **Material-assignment findings** — GLB dump: `mat_authored_skin` = warm tan (unchanged); short-sleeve shirt, offset-shell boots, hi-viz vest + bands all distinct materials. No material leakage; the arm/neck "blue" at rest is fabric where the shirt is and warm skin where it isn't.
14. **Human-scale findings** — the worker BODY (dressed, rigged, proportioned) reads as a clear utility worker, but the **face** (heavy/lumpy, target A) and the **hands** (melting tendrils) are blockers at human scale.
15. **Management-distance findings** — reads as a hi-vis hard-hatted worker; **not** used to excuse the human-scale face/hand blockers.
16. **Character Art review** — HUMAN ARTIST REQUIRED (two blockers: hand melt; heavy face + accordion neck; targets A/C-arms unmet).
17. **Rigging review** — HUMAN ARTIST REQUIRED (garment rig passes; forearm/hand skin-weight failure worse than 05H).
18. **Materials review** — skin material correct/unchanged; the residual "blue" is the shirt fabric, not a skin bug.
19. **Adversarial review** — HUMAN ARTIST REQUIRED (wardrobe wins retained; hand-clothing produced a catastrophic skin-weight explosion; face not procedurally reachable; management distance does not excuse either).
20. **Known remaining defects** — forearm/hand melt (base-mesh skinning limit); face not appealing (procedural ceiling); toe seam; proportions partly masked; neck fold at close range.
21. **Validation** — `validate-05i.mjs` PASS (65 joints, budgets, additive integrity, evidence, harness wired).
22. **TypeScript & production build** — `tsc --noEmit` clean; `vite build` clean.
23. **Console-error result** — runtime capture console-error-free (errorCount=0).
24. **Accepted commit** — recorded at push (additive on the 05I branch).
25. **Reverted experiments** — aggressive-reshape + 9× smooth "melting" face; over-sized "balloon" hat; `[foot,calf]` boot weighting that floated; hand-vert muscularity scaling (guarded) — all in the iteration log.
26–28. **SHAs & integrity** — local/remote recorded at push; local==remote confirmed; **05G & 05H byte-UNCHANGED** (05H sha256 `86971e47…`).
29. **05G & 05H byte-unchanged** — confirmed.
30. **No production or Engine repository modified** — confirmed (all work isolated in the Asset Lab repo).
31. **Final recommendation** — **REJECT CURRENT 05I — HUMAN ARTIST REQUIRED.** Adopt the authored-base BODY pipeline; hand the face and hands to a human artist.
32. **Exact local owner-review URL** — `file:///Users/bruce/Project Studio - Asset Lab/proof/lab05i/iteration-02/index.html`.

No integration, propagation, named talent, renderer, D1, or D1-A work occurred. No PR, no merge; the isolated branch is pushed to `backup` only.
