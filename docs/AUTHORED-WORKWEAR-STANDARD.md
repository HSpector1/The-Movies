# Authored Workwear Standard (Asset Lab 05H)

Workwear is authored by Studio over the authored base (no imported clothing). It reuses the
`SkinnedBuilder` garment primitives (`loft`, `arc_loft`, `tube`) weighted to the same deform
bones, so garments deform with the body under the six clips.

**Target (Electric role):** fitted work shirt, thin fitted safety vest, continuous trousers,
restrained belt, one small hip radio, work boots, hard hat.

Rules (carried forward from the 05F/05G corrections so we do not reintroduce rejected tells):
- **Shirt** — collar/neckline, shoulder seam, fitted torso, sleeve cap + sleeve + cuff, hem; sits
  ~2–4 mm off the body; covers the shoulder→armpit transition.
- **Vest** — a genuine thin shell (left/right front panels, back panel, yoke, armholes, side
  wrap, hem, restrained reflective strips) that hugs the ribs. NOT chest pods, rings, capsules,
  or inflated blocks (the explicit 05F/05G rejections).
- **Trousers** — one coherent garment: waistband, restrained fly, crotch, rear rise, seat, hips,
  thighs, cuffs. NO front box, belt shelf, diaper band, or detached seat block.
- **Belt/radio** — a slim belt line (not a shelf); at most one small radio against the hip, not
  spanning the crotch.
- **Boots** — toe box, vamp, sole, heel, ankle, L/R distinction, trouser break; not floor slabs.
- **Thickness & clearance** — garment-thin; follows the body; never floats or pierces.

**Current status:** NOT yet authored (Iteration 2). The base body is built and skinned so
garments can be fitted to real anatomical topology rather than to primitives.
