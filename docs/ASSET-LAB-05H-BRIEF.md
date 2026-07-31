# Asset Lab 05H — Brief

**Goal:** prove Project: Studio can build a convincing human-scale character on a
professionally authored base, preserving the accepted 65-bone skeleton, six clips, GLB
export, LOD pipeline, and Three.js runtime — one additive Electric hero, no role-wide
propagation, no production integration.

**Why:** owner review ruled the 05E–05G procedural primitive construction at its human-scale
ceiling (`ASSET LAB 05G — REVISE`). 05H tests a fundamentally different foundation.

**Chosen workflow:** Path A — a verified CC0 authored base mesh (Blender Studio Human Base
Meshes v1.0.0, CC0 1.0). See WORKFLOW-DECISION and PROVENANCE-AUDIT.

**Locked foundation (unchanged from 05E–05G):** 65-bone UAL armature; clips Idle_Loop,
Walk_Loop, Idle_Talking_Loop, Sitting_Idle_Loop, PickUp_Table, Fixing_Kneeling; 1 u = 1 m;
+Y-up GLB; Decimate LODs; R3F Scene-G harness.

**Additive & isolated:** new files `electric_hero_05h*.glb`; 05E/05F/05G assets untouched;
Scenes A–F and Scene G production composition unchanged; no propagation; no production
integration; branch `asset-lab-05h-authored-base-character-proof` off 05G `ee83d0e`.

**Scope of this milestone (brief §10):** up to four iterations — (1) authored base body,
(2) fitted workwear, (3) skinning & deformation, (4) style/face/LODs — each reviewed, scored,
committed. Stop for owner real-GPU review; a legitimate outcome is REQUIRES HUMAN ARTIST.
