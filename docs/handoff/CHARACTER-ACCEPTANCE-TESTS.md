# Project: Studio — Character Acceptance Tests

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
  (including the residual boot toe seam and the vest V-opening).

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
