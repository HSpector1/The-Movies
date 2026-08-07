# Project: Studio — Character Acceptance Tests

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

> **Status:** the 05I model is **rejected as a production character foundation**; the commission is **substantial
> specialist correction, not a polish pass**; **no production or Studio Lot integration is authorized** until the
> final gates below have passed. Governing ruling: `CHARACTER-ARTIST-HANDOFF-BRIEF.md`.

The corrected asset is accepted only after it passes ALL of the following. **A validator pass alone is insufficient.**
Judge primarily at **human-review distance**; management-distance readability does not cure human-scale defects.

## STAGED REVIEW GATES

The commission is **not** structured as one end-of-job delivery followed by one review. Work proceeds through
independently reviewable gates:

1. **Art direction and proportion target**
2. **Face and cranial sculpt**
3. **Body sculpt and silhouette**
4. **Topology and edge-flow correction**
5. **Hands, wrists, and forearms**
6. **Garment construction and refit**
7. **Hair and headwear**
8. **Rig compatibility**
9. **Manual weight painting**
10. **Materials and lighting response**
11. **Animation and deformation**
12. **Human-scale final review**
13. **Management-camera final review**
14. **Multi-character scalability proof** — *only when separately authorized*

For **every** gate:

- **Bounded evidence is required** — the views and lighting conditions named for that gate, nothing less.
- **The responsible specialist identifies the changes made** at that gate (topology, weights, shape keys,
  materials, garments).
- **The Art PM and Owner may approve, reject, or require rework.**
- **Technical reviewers participate where relevant** (Rigging, Technical Art, real-GPU runtime).
- **A gate may repeat as many times as necessary.**
- **Approval of one gate does not waive later gates.**
- **Approval at management distance does not waive human-scale inspection.**
- **Approval at human scale does not waive management-camera readability.**
- **No fixed iteration count is promised**, and none is capped. The Owner's planning expectation is that **ten or
  more total review loops may reasonably occur**; **fewer or more may occur based on the evidence**. This is
  iteration *capacity*, not an iteration *estimate*, and it is not a guarantee of acceptance after any number of
  rounds.
- **Integration remains unauthorized until BOTH final human-scale approval (gate 12) AND final management-camera
  approval (gate 13) have passed.**
- **Performance and multi-character claims require separately authorized measured evidence** — they are not
  established by any gate above.

### PRECONDITION — the Owner-provisioned UAL dependency, and the blocked-gate rule

**`public/assets/animation/UAL1_Standard.glb` is not delivered by this repository.** It is **intentionally
gitignored** (`.gitignore` ignores `public/assets/*` and re-includes only `public/assets/studio/`), so
**`public/assets/animation/` does not exist in a clean checkout**. It is a **client-furnished, Owner-provisioned**
local dependency supplied by the **Owner or an authorized Asset Lab operator** from the previously approved,
provenance-verified Quaternius **Universal Animation Library** (CC0 1.0) — the **65-joint rig** plus the **43-clip**
library that contains **the six clips every test below names**. The specialist **must not** substitute another rig or
animation library, and **must not** commit or redistribute the provisioned file
(`CHARACTER-TECHNICAL-CONTRACT.md` → *Rig and clip-library delivery status*).

**Gates that may be prepared and reviewed before provisioning**

- **Gate 1 (art direction and proportion target)**, **gate 2 (face and cranial sculpt)**, **gate 3 (body sculpt and
  silhouette)** and **gate 4 (topology and edge flow)** may proceed on Blender-side evidence. The **65-joint
  skeleton is embedded in the committed character GLBs** (`electric_hero_05i{,_LOD1,_LOD2}.glb`) and is
  independently re-derivable from them, so gate 4's "topology supports the existing 65-joint rig" check needs no
  external dependency. **Absence of the UAL package is a setup dependency — it is not evidence that the accepted
  skeleton accounting is invalid.**

**Gates that cannot pass or be marked complete before provisioning**

- **Gate 5 — Hands, wrists, and forearms.** Its evidence is per-clip volume across **all six clips**.
- **Gate 8 — Rig compatibility.** Clips retarget by bone name; the committed character skeleton and the provisioned
  clip library must be **validated together**.
- **Gate 9 — Manual weight painting.** Weights must be validated **on the exported asset across all six clips**,
  with joint-by-joint pass/fail per joint per clip.
- **Gate 11 — Animation and deformation.** The gate *is* the six clips.

**Gates that may be prepared but cannot be closed before provisioning**

- **Gate 6 (garment construction and refit)** and **gate 7 (hair and headwear)** — every garment and accessory owes
  "**stays anchored through all six clips**" evidence.
- **Gate 10 (materials and lighting response)**, **gate 12 (human-scale final review)** and **gate 13
  (management-camera final review)** — their required in-repo runtime views are captured through the review harness,
  whose 05I hero component loads the clip library unconditionally, so **the static runtime views are unavailable
  too**, not only the animated ones.
- Conditional **gate 14** is separately authorized and is **not** authorized now.

**Evidence that cannot be produced or validated at all before provisioning:** the **six-clip deformation
validation** (Idle · Walk · Talk · Kneeling · Pickup · Sitting), the **joint-by-joint per-clip reporting**, the
**animated deformation evidence**, any **matched before/after pair drawn from a runtime capture**, and the
**console-error-free runtime capture** in the hard technical gates below. The **static, Blender-side** hard gates —
65-joint count, bone names/hierarchy/orientation/scale/ground, LOD tri budgets, monotonic LODs, height, face on −Y,
feet grounded, 05G/05H byte-unchanged, `tsc --noEmit`, `vite build`, `node tools/validate-05i.mjs` — **do not**
depend on it.

### Gate result states — BLOCKED vs FAILED vs PASSED (governing definitions)

Every gate is recorded in exactly one of three states. **These are not interchangeable**, and recording a
dependency block as a failure misstates the specialist's workmanship. This is the governing definition for the whole
packet.

| State | Means | Required condition |
|---|---|---|
| **`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT AVAILABLE`** | The gate's required evidence **could not be produced or evaluated at all**, solely because the approved Owner-provisioned UAL dependency was unavailable. | The evidence was **never available for evaluation**, and the *only* reason is the absent dependency. |
| **`FAILED`** | The required specialist work or evidence **was actually available for evaluation** and **did not satisfy** the applicable acceptance requirement. | The evidence **existed and was judged**, and it fell short. |
| **`PASSED`** | The required evidence **was available** and **affirmatively satisfied** the acceptance requirement. | The evidence **existed, was judged, and met the bar**. |

- **BLOCKED is not FAILED.** A gate whose required evidence cannot be completed **solely** because the approved
  Owner-provisioned UAL dependency is unavailable **MUST** be recorded as
  **`BLOCKED — OWNER-PROVISIONED UAL DEPENDENCY NOT AVAILABLE`**. It **must NOT** be recorded as FAILED merely
  because the dependency is absent. A blocked gate is a **missing client input**, not a character-quality failure by
  the specialist.
- **FAILED requires an actual evaluation.** Do not record FAILED unless the work or evidence was genuinely in hand
  and was measured against the requirement. If a gate's evidence was partly producible and the producible part was
  evaluated and fell short, record **FAILED** for what was evaluated and **BLOCKED** for what could not be produced —
  say which is which.
- **PASSED requires evidence, not intent.** A gate is never PASSED by assertion, by a validator run alone, or by the
  absence of a complaint.
- **Provisioning the dependency is not itself a result.** Supplying `UAL1_Standard.glb`:
  - **removes the dependency block**;
  - **does not itself produce evidence**;
  - **does not itself mark any gate PASSED**;
  - **does not itself authorize integration**.

  After provisioning, a previously BLOCKED gate returns to **not yet evaluated** — the evidence still has to be
  produced, submitted and reviewed, and it may then be recorded PASSED or FAILED on its merits.
- **The block may not be cleared by substitution.** The specialist may not satisfy it by substituting another rig or
  animation library, by swapping in the `_RM` root-motion variant, or by downloading a replacement. Doing so does
  not clear the gate and does not convert BLOCKED into PASSED.
- **Provisioning is a client-side schedule dependency**, not an unpriced specialist deliverable; it may justify a
  schedule adjustment.
- **No integration authorization follows automatically** once the dependency is supplied or the gates pass.
  Integration still requires **both** gate 12 and gate 13 approval **and** separate authorization.

No additional acceptance states are defined. Where a gate is legitimately partial, report it against these three
states plus the specific evidence — do not invent a fourth label.

### Gate 1 — Art direction and proportion target: required evidence

This gate sets the target the later body work is judged against. It is approved **before** sculpting begins.

- The **approved proportion target** itself, stated explicitly (not implied by a render).
- Target views: **front · three-quarter · profile · rear**.
- The **ordinary working-adult silhouette standard** the target is measured against — explicitly **not** a
  bodybuilder, superhero, ogre or mannequin build.
- The **head-to-body ratio** and the **shoulder-mass target**, stated as figures or as an annotated reference.
- A **direct comparison against the current rejected body** (05I Iteration 2), at matched camera and scale, showing
  what changes.
- A recorded **Owner and Art PM ruling** on the target.

**Approval of gate 1 approves a target, not a sculpt.** No later gate may treat the target as evidence that the
delivered body meets it.

### Gate 4 — Topology and edge flow: required evidence

- **Topology views / wireframes** at the corrected areas.
- **Face and cranial edge flow.**
- **Shoulder, elbow, wrist, hand and finger topology.**
- **Deformation-sensitive loop placement** at each of those joints.
- **Garment interface areas** — where offset-shell garments derive from the body (mechanism 1 in
  `CHARACTER-TECHNICAL-CONTRACT.md`), since body topology order propagates into them.
- Evidence that the topology **supports the existing 65-joint rig** — no bone added, removed, renamed or
  reoriented, and the binding still valid.
- **Technical review before proceeding to final weighting** — gate 4 is reviewed by Rigging and Technical Art, and
  must pass before gate 9 (manual weight painting) begins.

**Approval of the sculpt does not automatically approve topology.** Gates 2 and 3 judge form; gate 4 judges the mesh
that has to deform. A sculpt may be approved and its topology still rejected, requiring rework before weighting.

## Visual acceptance tests (each must read correctly)
Static, neutral pose + neutral light AND runtime light:
- **Face and cranial form:** front · three-quarter · **profile** · **rear / back-of-head** — approachable stylized
  worker; correct forehead/brow balance, cheek and jaw mass, **skull proportion, crown height, back-of-head
  volume**, hard-hat-compatible silhouette, side and rear head silhouette; no ogre/superhero/mannequin/photoreal
  read. Required under **neutral lighting AND contrast-heavy lighting**, at **close human-scale inspection AND
  management-camera distance**. **A favourable front view is not sufficient evidence.**
- **Neck transition** — smooth from jaw to collar (no accordion fold).
- **Body mass and proportions:** **front · three-quarter · profile · rear**, **clothing on**, and **clothing
  removed or silhouette-isolated where the current pipeline supports it**, in a **neutral stance**, judged at
  **close human-scale inspection AND management-camera distance**. The body must read as an ordinary working adult
  — **not** bulky, not a bodybuilder build, and not merely masked by vest coverage.
- **Shoulders** — natural width; no collapse, no detached sleeve, no underarm sail.
- **Arms · wrists · palms · thumbs · grouped fingers** — correct volume; **no melting/stretching/tendrils/collapse**.
- **Boots · hard hat · hair · vest · shirt** — complete, fitted, no exposed body through clothing, no gaps/seams
  (including the residual boot toe seam and the vest V-opening). **Hair does not ship in 05I** — it is authored but
  culled before export (`CHARACTER-TECHNICAL-CONTRACT.md`); this test applies only if hair is present in the
  delivered asset, and whether it should be is an **owner decision**.

Animation — inspect the SAME items above under every clip:
- **Idle · Walk · Talk · Kneeling · Pickup · Sitting** — stable face/head; clean neck/shoulder/arm/wrist/hand
  deformation; no clipping, no accessory instability (belt/radio/hat/hair), correct foot/boot ground contact, clean
  loop continuity.

LOD + lighting + distance:
- **LOD0 / LOD1 / LOD2** — each preserves the corrected silhouette and materials (no LOD material swap, no collapse).
- **Neutral light** AND **runtime light** AND **contrast-heavy light** — material and form read correctly under all
  (skin warm, garments as fabric).
- **Human-review distance** AND **management distance** — legible; the human-review views are the binding ruling,
  and management-camera readability is still separately required at gate 13.

## Hard technical gates (must all pass)
- Skeleton exactly **65 joints**; bone names/hierarchy/orientation/scale/ground unchanged.
- Weighting meets `CHARACTER-TECHNICAL-CONTRACT.md` (influence cap, normalization, no unbound vertices,
  joint-by-joint reporting).
- All six clips deform with no explosion/collapse/regression; garments and accessories stay anchored; the boot
  attachment target (D) remains passed.
- Complete material assignments; no exposed body geometry through clothing; no new accessory instability.
- LOD0 ≤ 26,000 tris; monotonic LODs; height ∈ [1.70, 1.95] m; face on −Y; feet grounded.
- **05G and 05H assets remain byte-unchanged.**
- `tsc --noEmit` clean; `vite build` clean; runtime capture **console-error-free**; `node tools/validate-05i.mjs`
  (or a successor validator) passes.

## Required reviews (all four + owner)
These run **within** the gates above — they are review lanes, not a substitute for staged review.
1. **Character Art review** — facial and cranial appeal, worker proportions and body mass, silhouette, role
   readability, garment readability.
2. **Rigging review** — shoulders, neck, sleeves, hands/wrists/forearms, feet/boots, weighting contract, all six
   clips.
3. **Technical Art review** — skin/material assignment, normals, LOD material consistency, neutral-vs-runtime
   light, topology/weight change documentation.
4. **Real-GPU runtime review** — load on real hardware (Apple GPU / Metal), all six clips, three distances,
   console-error-free, no melting/clipping at human scale.
5. **Owner visual approval** — final human-scale decision (gate 12), then final management-camera decision
   (gate 13). Both are required before integration may be considered, and integration itself requires separate
   authorization.

## Deliver matched before/after evidence
For each acceptance view, provide a **before (current 05I) vs after (corrected)** matched pair (same camera,
lighting, pose, animation frame, scale, background, renderer). The current 05I "before" set is in
`proof/lab05i/iteration-02/` (see `EVIDENCE-INDEX.md`). Review-camera framings are specified in
`CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md`.
