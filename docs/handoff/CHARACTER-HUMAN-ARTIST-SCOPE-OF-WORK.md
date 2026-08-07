# Project: Studio — Human Artist Scope of Work

> **Governing packet identity**
>
> - Packet: **Project: Studio Human-Artist Character Handoff**
> - Version: **CHH-2026-08-07-R2**
> - Revision date: **2026-08-07**
> - Governing branch: `asset-lab-character-human-artist-handoff`
> - Supersedes Git tip: `7603b2f234dfdb11ad6a0691315942c4b16cffac`
> - Packet content SHA-256: `dbe7c8c31d80ae1218c8a01fe6326a37eb20511274d2e42eb32bd70d2fd9869e`
>
> A copied page is current only when its packet name, version, revision date, governing branch, and
> packet-content SHA-256 match the other seven packet documents at the governing branch tip. The Git commit
> cannot safely embed its own future SHA, so the packet-content SHA-256 is the in-document immutable identity;
> the **live governing Git tip is a separate check** and must be verified against the remote, not against this page.
>
> **Verify mechanically — do not trust a pasted digest.** The digest method is governed repository content, and a
> committed validator reproduces it: `npm run handoff:verify` (`node tools/validate-handoff-packet.mjs`) re-derives
> the digest from all eight pages and exits non-zero on any mismatch, mixed version or missing page. After any packet
> edit, regenerate with `npm run handoff:update`. **Hand-editing a digest without regenerating is prohibited**, and a
> packet with mixed versions or mixed digests is **invalid**. Method: `CHARACTER-TECHNICAL-CONTRACT.md` →
> *Packet identity and the packet-content digest*. Validator: `tools/validate-handoff-packet.mjs`.
>
> This packet is a commissioning specification only. It is not permission to begin work, produce a character,
> integrate a character, or begin D1-B.

## Owner ruling — status of this asset (read before estimating)

This document is written to be accurate **on its own**. If you received only this page, the following is the
governing status.

- **05H provenance was accepted** — the CC0 source chain is verified and commit-safe
  (`CHARACTER-SOURCE-AND-PROVENANCE.md`).
- **The authored-base workflow was accepted** as useful **pipeline research**.
- **The 05H visual build was rejected** as a production character.
- **05I was the authorized bounded corrective milestone.** It contained **two owner-reviewed iterations**
  (Iteration 1 and Iteration 2), the limit established by the 05I brief.
- **05I is rejected as a production character foundation.**
- **Further autonomous procedural correction is stopped.**
- **A qualified human character artist is required.**
- **A qualified rigging and weight-paint specialist is required.**
- **No production or Studio Lot integration is authorized.** **D1-A** — a completed, closed internal art
  milestone that shipped the studio's visual identity, with no characters — **is merged, closed and tagged and
  is not unstarted**; its record is in the **production** repository on `main` (`docs/art/D1-A-CLOSURE.md`,
  merged as `af7c238`, closed and tagged at `e87c34f`), not in this handoff branch. It did **not** integrate
  this character and does **not** authorize character production, human-artist commissioning, or integration.
  **D1-B** — a possible later Studio Lot phase — **is unstarted and is not authorized**; it is separately
  governed, is not assumed to include characters, and any character integration proposed under it requires
  separate authorization and acceptance evidence. This document **specifies** a commission that has **not**
  been authorized — it is not permission to begin work.
- The work runs through **staged, repeatable review gates** (`CHARACTER-ACCEPTANCE-TESTS.md`). **No fixed number
  of correction loops is promised or capped, and no single contract pass is guaranteed to reach production
  approval.**

Full ruling and context: `CHARACTER-ARTIST-HANDOFF-BRIEF.md`.

## Client-furnished dependency (read before pricing — this is not a specialist deliverable)

`public/assets/animation/UAL1_Standard.glb` — the Quaternius **Universal Animation Library** (CC0 1.0), carrying the
approved **65-joint rig** and the **43-clip** library from which this track's **six** clips come — **is not delivered
by this repository.** It is **intentionally gitignored** (`.gitignore` ignores `public/assets/*`, re-including only
`public/assets/studio/`), so **`public/assets/animation/` does not exist in a clean checkout**. It is a
**client-furnished, Owner-provisioned local dependency**.

**Client / Owner responsibility**
- **Provision** the approved, provenance-verified UAL package — or the derived approved local runtime file — at
  `public/assets/animation/UAL1_Standard.glb`.
- **Do so before the dependent validation and acceptance gates can complete.** Until then those gates are blocked.
- **Retain responsibility for the package's provenance identity and authorization.** The repository records that
  identity (`docs/PROVENANCE-REGISTER.md` §2, `manifests/source-archives.json`) and documents no download or
  redistribution procedure.

**Specialist responsibility**
- **Do not independently download, procure or substitute another rig or animation library**, and do not swap in the
  `_RM` root-motion variant.
- **Do not commit or redistribute the provisioned local file.**
- **Identify this dependency explicitly in your schedule and bid assumptions**, including its effect on the gates
  and deliverables named below.
- **Perform only authorized work before provisioning** — as far as the technical contract and the staged gates
  allow, and no further.
- **Execute the dependent rigging, weighting, deformation, animation, evidence and acceptance work once the
  approved dependency is present.**

**Effect on gates and deliverables** (staged review gates per `CHARACTER-ACCEPTANCE-TESTS.md`)
- **Blocked from passing/completion:** **gate 5** (hands, wrists, forearms), **gate 8** (rig compatibility),
  **gate 9** (manual weight painting), **gate 11** (animation and deformation).
- **Blocked from closure**, though preparable and provisionally reviewable: **gates 6 and 7** (garment refit; hair
  and headwear — both owe six-clip anchoring evidence) and **gates 10, 12 and 13** (materials and lighting
  response; human-scale final review; management-camera final review — their in-repo runtime views are captured
  through the review harness, which loads the clip library unconditionally). Conditional **gate 14** is separately
  authorized and is not authorized now.
- **Not blocked — may proceed on Blender-side evidence:** **gates 1–4**. The 65-joint skeleton is embedded in the
  committed character GLBs and is independently re-derivable from them.
- **Deliverables that cannot be produced until provisioning:** the **stable six-clip deformation** evidence and its
  **joint-by-joint reporting**, the **animated deformation evidence**, and any **matched before/after** pair drawn
  from a runtime capture.

**A missing client-furnished dependency may require schedule adjustment. It does not silently transfer provisioning
responsibility to the specialist, and it is not a character-quality failure by the specialist.** Report an affected
gate as **`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT AVAILABLE`**; it may not be satisfied by substitution.
Nothing here reduces the sculpt, retopology, manual weight-painting, garment-refit, repeated-gated-review or
no-iteration-cap requirements below.

**Gate result states — BLOCKED is not FAILED, and provisioning is not PASSED.** This matters commercially, so it is
stated here as well as in the acceptance document:

- **`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT AVAILABLE`** — the required evidence could not be produced or
  evaluated **at all**, **solely** because the approved Owner-provisioned dependency was unavailable. It **must not**
  be recorded as FAILED on that basis. It is a missing client input, not defective workmanship.
- **`FAILED`** — the required work or evidence **was actually available for evaluation** and **did not satisfy** the
  applicable acceptance requirement.
- **`PASSED`** — the required evidence **was available** and **affirmatively satisfied** the requirement.

**Provisioning the dependency removes the block only.** It does **not** itself produce evidence, does **not** mark
any gate PASSED, and does **not** authorize integration. Once provisioned, a previously blocked gate becomes *not
yet evaluated*: the dependent evidence must still be produced, submitted and reviewed before it can be recorded
PASSED or FAILED. Governing definitions: `CHARACTER-ACCEPTANCE-TESTS.md` →
*Gate result states — BLOCKED vs FAILED vs PASSED*.

**No integration authorization follows automatically** once the dependency is supplied or the blocked gates pass.
Passing every gate does **not** authorize Studio Lot character integration — that requires **both** final
human-scale (gate 12) and final management-camera (gate 13) approval **and** a **separate** owner authorization.

## Assignment
Bring the character to production quality through **substantial specialist correction**, **preserving the technical
contract** (`CHARACTER-TECHNICAL-CONTRACT.md`). The current 05I model is **rejected as a production foundation**.
Assume a hand-authored **face and cranium sculpt**, **hand and forearm topology correction**, a **manual rigging and
weight-paint pass**, **garment refitting where required**, and a **real reduction in body mass** — **not a polish
pass**. Start from the exported LOD0 GLB (`public/assets/studio/characters/electric_hero_05i.glb`); reference the
CC0 base + rig (`CHARACTER-SOURCE-AND-PROVENANCE.md`).

This is **not** a new character concept and **not** a replacement base mesh — but it is substantially more than
finishing.

## Required work
1. **Face & cranial sculpt** — approachable stylized management-game worker. Address **forehead and brow balance**,
   **cheek and jaw mass**, **cranial / skull proportion**, **crown height**, **back-of-head volume**, **silhouette
   beneath the hard hat**, the **neck-to-head transition**, and the **side and rear head silhouette**; softer
   brow/jaw/nose/cheeks/ears/neck; no ogre/superhero/mannequin/photoreal read.
2. **Hands, wrists, forearms — topology correction *and* manual weight painting (both required).** Correct
   **topology and edge flow** (retopology where needed) **and** perform a **manual weight-paint pass** on the
   `lowerarm_*` → `hand_*` → finger chain. The committed evidence supports requiring **both disciplines**; neither
   is optional, and neither alone has resolved this failure. Preserve palm/thumb/grouped-fingers/wrist/forearm
   volume; eliminate melting/stretching/tendrils/collapse/joint-pinch; validate across all six clips. *The
   specialist proposes the exact implementation — but must price and deliver both disciplines.*
3. **Body mass and human-scale proportions** — the body remains **too bulky** for the intended ordinary
   working-adult result. The 05I slimming was **partial**, and the hi-vis vest masks part of the underlying body
   mass. Reduce **upper-body and shoulder mass** meaningfully at human scale. This is **more than a minor
   proportional nudge**; it does **not** necessarily require discarding the accepted CC0 base mesh.
4. **Manual rigging and weight painting** — repaint the hand/wrist/forearm chain and any joint the sculpt or
   retopology invalidates, to the requirements in `CHARACTER-TECHNICAL-CONTRACT.md`; report joint-by-joint results.
5. **Garment construction and refit** — refit garments where the sculpt or retopology moves the body beneath them;
   keep garments and accessories anchored; resolve garment/body clipping introduced by manual corrections.
6. **Close-range surface defects** — the **residual boot toe seam**, the **close-range neck fold**, the
   **close-range facial lumpiness**, and the **vest V-opening**. These are the individually evidenced close-range
   defects; each is graded, evidenced and assigned a discipline in `CHARACTER-KNOWN-DEFECTS.md`. **No further
   garment seam is claimed** — if the specialist's own corrections introduce one, it is handled under item 5
   (garment/body clipping introduced by manual corrections).

## Required deliverables (the specialist must return)
- Corrected **source Blender file** (`.blend`) with the working scene.
- Corrected **LOD0**, **LOD1**, **LOD2** meshes.
- **Preserved 65-joint skeleton compatibility** (bone names/hierarchy/orientation/scale/ground unchanged).
- Corrected **face and cranial form**; corrected **hand/wrist/forearm** topology **and** weighting; **reduced body
  mass**.
- **Stable six-clip deformation** (Idle/Walk/Talk/Kneeling/Pickup/Sitting) with **joint-by-joint reporting**.
- **Complete material assignments**; **no exposed body geometry through clothing**; **no new accessory instability**.
- **Neutral-pose renders** + **animated deformation evidence** + **matched before/after evidence** (vs the current
  05I "before" in `proof/lab05i/iteration-02/`), at the coverage required per gate in
  `CHARACTER-ACCEPTANCE-TESTS.md`.
- **Export-ready GLBs** matching the export conventions (`CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md`).
- **Documentation of any topology, weights, shape-key, or material change** (any topology change must be explicit).

## Acceptance
Per `CHARACTER-ACCEPTANCE-TESTS.md`: the **staged review gates**, the visual tests, the hard technical gates, and
all four specialist reviews (Character Art, Rigging, Technical Art, real-GPU runtime) + owner visual approval. A
validator pass alone is not acceptance.

Gates are reviewed independently and **may repeat as many times as the evidence requires**. Approval of one gate
does not waive later gates. **No fixed number of review loops is promised**; the Owner's planning expectation is
that **ten or more may reasonably occur**, and fewer or more may occur based on evidence. **A single contract pass
is not guaranteed to reach production approval.** Integration remains unauthorized until **both** final human-scale
approval **and** final management-camera approval have passed.

## Non-goals (do NOT)
New character concept · new base mesh · new final skeleton · new animations / new animation library · role-wide
propagation · named-talent use · production integration · live-3D renderer proof · sprite-derived proof · D1 /
D1-A / D1-B / Engine changes · the texture-disposal leak · modifying 05G/05H or prior evidence · opening a PR /
merging / force push. New geometry must be CC0 or owner-owned with documented provenance.

## Handoff note (for whoever commissions this)
This scope is written so a professional character artist + rigging/technical-art specialist can execute and
**estimate** without reverse-engineering the repo. The procedural pipeline produced a usable **rig, garment system,
LOD chain, materials and runtime** — those are accepted and must not regress. It did **not** produce an acceptable
**face and cranium**, **hand/wrist/forearm chain**, or **body mass**, and the skin-weighting behind the hand
deformation is a base-mesh limit rather than a tuning problem. Price the sculpt, the retopology, the manual
weight-paint pass, the garment refit, and **repeated gated review** — not a polish pass.
