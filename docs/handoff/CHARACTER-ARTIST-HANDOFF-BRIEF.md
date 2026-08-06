# Project: Studio — Character Artist Handoff Brief

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

**Read this first — status before scope.** The current character (05I) is **rejected as a production character
foundation**. **No production or Studio Lot integration is authorized.** The work required is **substantial
specialist correction, not a polish pass.**

The commission preserves the accepted parts of the procedural pipeline. The current model is rejected as a
production character foundation under the Owner ruling below. This is **not** a new character concept or a
replacement base mesh, but it requires substantial specialist correction rather than a polish pass — a
hand-authored **face and cranium sculpt**, **hand / wrist / forearm topology correction**, a **manual rigging and
weight-paint pass**, **garment refitting** where required, and a **real reduction in body mass**.

This package hands the Project: Studio "Electric" worker to a professional **character artist** + **rigging /
weight-paint specialist**. The work proceeds through **staged, independently reviewable gates**
(`CHARACTER-ACCEPTANCE-TESTS.md`), not one end-of-job delivery. **No fixed number of correction loops is promised
or capped.**

Frozen checkpoint (do not modify): branch `asset-lab-character-human-artist-handoff`, cut from 05I Iteration-2 HEAD
`8903b1e8bbbc166aa1b74a33167aea964502a1f6` (branch `asset-lab-05i-corrective-character-pass`).

## ⚠ Client-furnished dependency — read before you estimate, schedule, accept or begin

**One required file is NOT delivered by this repository.** It is a **client-furnished (Owner-provisioned) local
dependency**, and a bid or schedule built on the assumption that everything needed ships in the repo will be wrong.

| | |
|---|---|
| **File** | `public/assets/animation/UAL1_Standard.glb` |
| **Package** | Quaternius **Universal Animation Library** (UAL) — **CC0 1.0** |
| **Contents** | the approved **65-joint rig** and the **43-clip** animation library; **six** of those clips are the ones this character track uses and every acceptance test names |
| **Delivery status** | **intentionally gitignored** (`.gitignore` ignores `public/assets/*` and re-includes only `public/assets/studio/`) — **the `public/assets/animation/` directory does not exist in a clean checkout** |
| **Who provides it** | the **Owner or an authorized Asset Lab operator**, from the previously approved, provenance-verified package. The repository documents **no download or redistribution procedure** for it |

**What this means for the specialist**

- **Do not procure, download or substitute a different rig or animation library**, and do not swap in the
  `UAL1_Standard_RM.glb` root-motion variant. The approved provenance recorded in the repository governs
  (`docs/PROVENANCE-REGISTER.md` §2, `manifests/source-archives.json`); confirm it before use.
- **Do not commit or redistribute the provisioned local file.** It is a local runtime dependency, never a new
  committed production asset.
- **Provisioning is a client-side schedule dependency, not an unpriced specialist deliverable.** Obtaining this
  file is not your responsibility and must not be absorbed into your price.
- **Any schedule, bid or estimate must identify this dependency explicitly** and state its effect on the gates and
  deliverables listed below — including what you will do while it is outstanding.

**What is blocked, and what is not** (gate numbers are the staged review gates in `CHARACTER-ACCEPTANCE-TESTS.md`)

- **Cannot pass or be marked complete before provisioning:** **gate 5** (hands, wrists, forearms), **gate 8** (rig
  compatibility), **gate 9** (manual weight painting), **gate 11** (animation and deformation). Each requires
  six-clip playback or clip retargeting as its own core evidence.
- **Cannot be closed before provisioning** (may be prepared and provisionally reviewed): **gate 6** (garment
  construction and refit) and **gate 7** (hair and headwear) — both owe "stays anchored through all six clips"
  evidence; **gate 10** (materials and lighting response), **gate 12** (human-scale final review) and **gate 13**
  (management-camera final review) — their required in-repo runtime views are captured through the review harness,
  whose 05I hero component loads the clip library unconditionally, so **even the static runtime views cannot be
  captured** until the file is present. Conditional **gate 14** is separately authorized and is not authorized now.
- **May proceed now, on Blender-side evidence:** **gates 1–4** — art-direction and proportion target, face and
  cranial sculpt, body sculpt and silhouette, and topology and edge flow. The **65-joint skeleton is embedded in
  the committed character GLBs** and is independently re-derivable from them, so the structural rig check at gate 4
  needs no external dependency. Proceed only as far as the technical contract and the staged gates allow.
- **The six-clip deformation evidence, the joint-by-joint per-clip reporting, and the console-error-free runtime
  capture cannot be produced at all** until the file is provisioned. **A gate blocked this way is not a
  character-quality failure by the specialist** — report it as
  **`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT AVAILABLE`**, and do not satisfy it by substitution.

Full terms and the recorded package identity (archive name, size, SHA-256, expected file shape):
[`CHARACTER-TECHNICAL-CONTRACT.md`](./CHARACTER-TECHNICAL-CONTRACT.md) → *Rig and clip-library delivery status*.
Source and provenance chain: [`CHARACTER-SOURCE-AND-PROVENANCE.md`](./CHARACTER-SOURCE-AND-PROVENANCE.md).
Gate preconditions and blocked-state rules: [`CHARACTER-ACCEPTANCE-TESTS.md`](./CHARACTER-ACCEPTANCE-TESTS.md).

## Owner ruling — the authoritative status of this track

- The **authored-base technical workflow** is accepted as useful **pipeline research**, and the **CC0 provenance
  is accepted** (`CHARACTER-SOURCE-AND-PROVENANCE.md`).
- The **05H character build is rejected** as a production character and is **not authorized for Studio Lot
  integration**. Its blocker-grade defects are already documented in the 05H final owner-review package.
- **05I** was the **authorized bounded corrective milestone**. It contained **two owner-reviewed iterations**
  (Iteration 1 and Iteration 2) — the limit established by the 05I brief — after which further autonomous
  correction stopped. 05I did **not** resolve the human-scale **face and cranial form**, **body mass and
  proportions**, **hands, wrists and forearms**, or **the skin-weighting chain that drives their deformation**, and
  is **rejected as the production character foundation**. Read the pipeline-capability framing below as *what the
  procedural pipeline demonstrated*, **not** as an approved production foundation.
- **No further autonomous or procedural character iteration is authorized.** A qualified human **character
  artist** and a **rigging / weight-paint specialist** are required. This handoff package is the **active**
  character-track artifact.
- **Character integration remains unauthorized.** Acceptance of a specialist deliverable does **not** authorize
  production integration. Asset Lab character work remains separate from production `main` — no Asset Lab
  character commit has ever entered it.
- **D1-A / D1-B status.** **D1-A is a completed, merged, closed and tagged studio-identity milestone — it is
  not unstarted.** Its record lives in the **production** repository on `main`, not in this branch's history:
  `docs/art/D1-A-CLOSURE.md`, merged as `af7c238`, closed and tagged at `e87c34f` (annotated tag
  `d1a-studio-identity-package`), with a later ordinary-player enablement phase closed at `9303560` (tag
  `d1a-concept-a-player-enablement`). D1-A **did not integrate this character**, and it does **not** authorize
  human-artist commissioning, character production, or Studio Lot character integration. **D1-B is unstarted
  and is not authorized.** It is separately governed, is not assumed to include characters, and does not begin
  automatically after this handoff; any character integration proposed under it requires **separate
  authorization and acceptance evidence**. This package **specifies** a commission that has **not** been
  authorized — it is not permission to begin work.
- **Management-camera evidence does not substitute for human-scale inspection.** The 05H management framing
  concealed defects that were blocker-grade at close range; judge this asset at human scale (see
  `CHARACTER-KNOWN-DEFECTS.md`). The converse also holds — **human-scale approval does not waive management-camera
  readability**; both final gates must pass.

### What remains accepted — do not regress
The **65-joint skeleton** and its **animation compatibility**; **all six clips execute**; **garments and
accessories stay anchored**; the **boot attachment target (D) that 05I passed**; the **3-step LOD chain**; the
**correct warm-tan skin material**; the **console-error-free runtime**. The failure is **localized** — face and
cranium, body mass, and the hand / wrist / forearm chain with its skin weighting. The rig as a whole, and the
animation system as a whole, are **not** written off.

Nothing in this package authorizes integration, propagation, merging, or renderer work.

## The situation in one paragraph
The 05I corrective milestone (two owner-reviewed iterations, Iter 1 + Iter 2) proved that the Blender procedural
pipeline reliably produces a **dressed, rigged worker body shell**: a CC0 authored base bound to the shared 65-joint
skeleton, complete fitted garments (hi-vis vest, hard hat, boots, tool belt, radio), a working 3-step LOD chain,
correct materials, and a console-error-free runtime that retargets six shared animation clips. That is **what the
pipeline demonstrated — not an approved character.**

What the autonomous procedural effort **did not finish**:
- **Face and cranial form** — vertex-smoothing this realistic CC0 head does not reach an approachable stylized
  read, and pushing harder produced a "melting" face. Cranial proportion, crown height and back-of-head volume were
  never addressed at all.
- **Hands, wrists and forearms** — the base-mesh inverse-distance hand skinning collapses fingers/forearms into
  tendrils on the posed, decimated export.
- **Body mass and human-scale proportions** — slimmed from 05H's bodybuilder build, but only **partly** resolved;
  the body still reads **too bulky**, and the hi-vis vest masks part of the remaining mass.
- **The skin-weighting chain that drives hand and forearm deformation** — a base-mesh skinning limit, not a tuning
  problem (reverting the muscularity settings did not fix it).

The **deepest specialist tasks** are the **face and cranial sculpt**, the **body-mass and silhouette correction**,
the **hand / wrist / forearm topology**, and the **manual weight painting of the hand chain**. **Body mass is major
and blocking, not a secondary adjustment** — it requires a real human-scale reduction in upper-body and shoulder
mass, not a proportional nudge (`CHARACTER-KNOWN-DEFECTS.md` BLOCKER 3). General animation execution is **not** a
failure: all six clips run and garments stay anchored — see the do-not-regress list above.

## What we are asking the specialist to do (primary work)
1. **Face and cranial sculpt** → approachable stylized management-game worker. Address **forehead and brow
   balance**, **cheek and jaw mass**, **cranial / skull proportion**, **crown height**, **back-of-head volume**,
   **silhouette beneath the hard hat**, the **neck-to-head transition**, and the **side and rear head silhouette**;
   softer brow/jaw/nose/cheeks/ears/neck; no ogre / superhero / mannequin / photoreal read.
2. **Hands, wrists, forearms** → correct **topology and edge flow**; repair weighting and deformation; preserve
   palm, thumb, grouped fingers, wrist and forearm volume; eliminate melting / stretching / tendrils / collapse /
   joint pinch; **validate across all six existing clips**.
3. **Body mass and human-scale proportions** → the body still reads **too bulky** for the intended ordinary
   working-adult result. The 05I slimming was **partial**, and the vest masks part of the underlying body mass.
   Reduce **upper-body and shoulder mass** meaningfully at human scale. This requires **more than a minor
   proportional nudge**; it does **not** necessarily require discarding the accepted CC0 base mesh.
4. **Manual rigging and weight painting** → repaint the hand/wrist/forearm chain, and any joint the sculpt or
   retopology invalidates, to `CHARACTER-TECHNICAL-CONTRACT.md`; report joint-by-joint results across all six clips.
5. **Garment construction and refit** → refit garments where the sculpt or retopology moves the body beneath them;
   resolve garment/body clipping introduced by manual corrections; keep garments anchored.
6. **Close-range surface defects** → the **residual boot toe seam**, the **close-range neck fold**, the
   **close-range facial lumpiness**, and the **vest V-opening**. Each is graded, evidenced and assigned in
   `CHARACTER-KNOWN-DEFECTS.md`. **No further garment seam is claimed.**

This is **not** a new character concept and **not** a replacement base mesh. It **is** substantial specialist
correction — not a polish pass — on a model currently **rejected as a production foundation**.

## The rest of the package
- `CHARACTER-TECHNICAL-CONTRACT.md` — the hard contracts to preserve (skeleton, bone names, orientation, scale,
  ground, six clips, GLB/LOD/material conventions, runtime compatibility) **and the rigging / weight-paint
  requirements**.
- `CHARACTER-KNOWN-DEFECTS.md` — annotated defects with severity, discipline, blocking status, and exact evidence
  image paths.
- `CHARACTER-ACCEPTANCE-TESTS.md` — the **staged review gates**, the visual acceptance tests, and the required
  specialist reviews.
- `CHARACTER-SOURCE-AND-PROVENANCE.md` — source assets, the procedural generator, and the CC0 provenance chain.
- `CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md` — how to export, validate, and review in the runtime.
- `CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md` — exact required deliverables + non-goals.
- `EVIDENCE-INDEX.md` — pointers to the existing 05H and 05I proof, and the notice that supersedes their status
  language.

## Ground rules
Preserve the accepted pipeline (skeleton, animation compatibility, LOD chain, materials, runtime); correct the named
areas. Any **topology, weight, shape-key, or material change must be explicitly documented**. No new final skeleton
or animation library without separate owner authorization. A validator pass alone is **not** acceptance — the work
proceeds through the **staged review gates** in `CHARACTER-ACCEPTANCE-TESTS.md`, each of which the Art PM and Owner
may approve, reject, or send back for rework, and each of which may repeat as many times as the evidence requires.
**No fixed number of correction loops is promised or capped.** The Owner's planning expectation is that **ten or
more review loops may reasonably occur**; fewer or more may occur based on the evidence. Integration remains
unauthorized until **both** final human-scale approval **and** final management-camera approval have passed.
