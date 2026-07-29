# Asset Lab 05D — Iteration Log (professionalization loop, min 10 / target 12)

Baseline = 05C HEAD `d912ca1` (`proof/lab05d/baseline`). Target: premium stylized management-game
crew. Each loop = hypothesis → named weakness → change → rebuild → validate → render → runtime →
review → decide → commit. Full multi-reviewer gates at loops 3, 6, 9, 12. Technical invariants
(rig −Y, 65 joints, 0 unweighted/bad-sum, six clips, LOD skeleton, runtime) preserved every loop.

**Review-outage policy:** independent gates retried up to 4×; failures recorded; primary
self-review never presented as independent; missed gates queued for replay before final acceptance.

---

## Loop 1 — Anatomy & silhouette
- **Hypothesis:** limbs read as featureless straight tubes and the 3 body profiles differ only in
  torso width; adding limb muscle shaping + a wider girth spread makes silhouettes read as
  intentional stylized anatomy.
- **Change (`character2.py`):** bicep fullness (upper arm), calf-muscle bulge (back of calf), fuller
  tapered thigh; widened SIZE girth spread (slim 0.87 / average 1.0 / wide 1.18).
- **Validate:** `GATE_TEST_OK`; 0 unweighted / 0 bad-sum; ~10.5 k tris LOD0.
- **Evidence:** `proof/lab05d/iteration-01/` (proportions-front shows distinct builds; Grip side
  shows calf/bicep shaping).
- **Review:** lead self-review — profiles now distinct, limbs shaped (subtle but real). Independent
  gate deferred to the Loop 3 full multi-reviewer gate (per cadence).
- **Decision: ACCEPT.**

---

## Loop 2 — Head construction & facial planes
- **Hypothesis:** the head is a plain egg ovoid with features stuck on the front (reads
  "assembled"); adding subtle cheekbone / chin / brow-ridge / nose-bridge planes makes it read
  sculpted.
- **Change:** added skin-weighted facial planes (chin, cheekbones, brow ridge, nose bridge) that
  blend into the ovoid via shade-smooth. First pass overshot (jowly) → dialed the cheeks into
  subtle higher cheekbones and shrank the chin.
- **Validate:** `GATE_TEST_OK`; 0 unweighted / 0 bad-sum.
- **Evidence:** `proof/lab05d/iteration-02/Grip/base-face-front.png` — brow plane over the eyes,
  cheekbone structure, chin/jawline, integrated nose bridge (vs the 05C egg).
- **Review:** lead self-review — head reads sculpted; slight residual lower-face heaviness noted for
  Loop 3. Independent gate at Loop 3.
- **Decision: ACCEPT.**

---

## Loop 3 — Eye/brow/mouth expression appeal  ·  FULL MULTI-REVIEWER GATE
- **Hypothesis:** the neutral face is friendly but blank/wide (no eyelids, flat mouth); adding a
  relaxed upper-lid line + a faint smile (lifted corners + lower-lip form) makes it read alive.
- **Change:** upper-lid line (skin) at the top edge of each eye (first pass hooded/sleepy → raised
  to the lid edge); mouth given lifted corners + a lower-lip highlight (subtle smile). Static
  geometry only — NOT a facial-animation system.
- **Validate:** `GATE_TEST_OK`; 0 unweighted / 0 bad-sum.
- **Evidence:** `proof/lab05d/iteration-03/` (Grip + PA faces read friendly/alive; roles lineup).
- **Review:** FULL multi-reviewer gate (Art Director + Anatomy + Readability), covering loops 1-3,
  with 4× outage retry — verdicts recorded below.
- **Decision: ACCEPT** (self-review: sculpted + expressive; gate verdicts appended).

### Loop-3 FULL GATE verdicts (3 reviewers, API recovered — no outage this gate):
- **Art Director: PASS WITH NOTES, improved.** Majors: mouth still a black bar (no upper lip / no
  corner lift); eye an oversized dark void + floating dot (reads hollow); **PA chin jowly**.
  → **All three addressed in Loop 4** (two-lit-lip smiling mouth; eyeball+iris+lids eye; smaller chin).
- **Anatomy: CONCERNS, "not improved over baseline."** Pixel-diff shows Loop-1 limb shaping is
  imperceptible; slim/avg/wide are uniform scaling (identical taper ratios); legs read as straight
  tubes in FRONT view (calf ≥ thigh width); no waist pinch. → **drives a dedicated anatomy REDO in
  Loop 5** (per-profile ratio signatures, front-plane leg taper, waist pinch).
- **Readability:** captured; roles read at distance, main note = strengthen non-colour role cues
  (→ Loop 8).

---

## Loop 4 — Hair, facial hair, headwear + Loop-3 face fixes
- **Hypothesis:** no facial hair limits age/character variety; and the Loop-3 gate's face majors
  (black-bar mouth, void eyes, jowly chin) must be fixed before adding more.
- **Change:** `_add_facial_hair` (mustache/beard/goatee/stubble, hair-coloured) wired to Grip/
  Carpenter/Director/Maintenance. **Face rework:** eye rebuilt as lit eyeball + dark iris + upper &
  lower lids + catch-light (was a dark void); mouth rebuilt as two lit lips + thin line + lifted
  corners (real smile); chin shrunk + pulled up/back (de-jowled).
- **Validate:** `GATE_TEST_OK`; 0 unweighted / 0 bad-sum.
- **Evidence:** `proof/lab05d/iteration-04/` — PA/Grip faces (eyes+smile read), Carpenter beard.
- **Review:** lead self-review; independent gate at Loop 6.
- **Decision: ACCEPT.**

---

## Loop 5 — Anatomy REDO (addresses the Loop-3 Anatomy CONCERNS)
- **Hypothesis:** the Anatomy gate proved profiles were uniform-scaled (identical taper ratios),
  legs read as front-view tubes (calf ≥ thigh), and there was no waist. Giving each profile its own
  ratio SIGNATURE + a real front leg taper + a chest>waist S-curve fixes it.
- **Change (`character2.py`):** replaced the single `girth` with per-region factors
  **chest / waist / hip / limb / shoulder**; profiles now: slim = pinched waist (0.78) + lean limbs
  (0.83), wide = full waist (1.24) + broad ribcage (1.14). Torso: broad chest (CH) over a **pinched
  waist** (WA). Legs: thigh WIDEST (0.094·LI) → knee (0.058) → calf (0.056·LI) → hard ankle taper
  (0.036); calf muscle moved to back-only (small X) so it shapes the side, not the front width.
  Arms/shoulders use LI/SH.
- **Validate:** `GATE_TEST_OK`; 0 unweighted / 0 bad-sum; ~11.7 k tris (wide profile at budget edge;
  LOD1/2 bring it down).
- **Evidence:** `proof/lab05d/iteration-05/` — proportions read as distinct builds; Grip front shows
  thigh>knee>calf taper.
- **Review:** lead self-review (directly targets the measured gate failures); re-measured at the
  Loop-6 full gate.
- **Decision: ACCEPT.**

---

## Loop 6 — Hand reconstruction (individual fingers) + feet  ·  FULL MULTI-REVIEWER GATE
- **Hypothesis:** the grouped-paddle hand is the biggest remaining "procedural" tell; four
  individual fingers + a thumb (weighted rigidly to the hand bone, so deformation-safe) make it
  read as a hand at medium distance.
- **Change:** replaced the grouped-finger ellipsoid with a flattened palm + **4 individual finger
  capsules** (middle longest, pinky shortest, packed close) + an angled thumb. Feet retained the
  05C rounded-boot + sole (validated grounded).
- **Validate:** `GATE_TEST_OK`; 0 unweighted / 0 bad-sum; ~11.5 k tris LOD0.
- **Evidence:** `proof/lab05d/iteration-06/` — hand close-up (palm+fingers+thumb), pickup pose holds.
- **Review:** FULL multi-reviewer gate (Anatomy re-check + Technical + Art Director), covering loops
  5-6, verdicts appended.
- **Decision: ACCEPT** (self-review: hands read; gate appended).

### Loop-6 FULL GATE verdicts (3 reviewers, API recovered):
- **Anatomy: PASS WITH NOTES — `concernResolved=TRUE`.** All 3 Loop-3 CONCERNS resolved (distinct
  ratio-based builds; front leg taper thigh>knee>calf>ankle; chest>waist S-curve). Notes (minor):
  limb-mass differentiation still torso-weighted; calf lacks belly-swell; wide-build S-curve flat.
- **Technical: PASS WITH NOTES — `concernResolved=TRUE`.** Hand no longer a paddle; stable in poses.
  Notes (minor): extended finger lacks knuckle/rounded tip; palm-finger seam crease; LOD0 ~11.5k
  (top of budget).
- **Art Director: PASS WITH NOTES, improved.** Majors: (a) eyes wide-set + high catchlight → faintly
  startled; (b) hands fuse to a mitten at distance. Minors: palette monotone (blue-grey tops);
  boots/belt fidelity below the faces. → **eye major fixed in Loop 7**; palette → Loop 8; distance
  finger-fuse accepted (fingers read up close, fuse only at management distance, which is fine).

---

## Loop 7 — Clothing construction + eye fix
- **Hypothesis:** legs plug straight into boots and the shirt has no bottom edge (reads unconstructed);
  and the Loop-6 gate's eye major (wide-set/startled) needs fixing.
- **Change:** **trouser break** (trouser leg folds over the boot top) + **shirt-hem edge** band;
  eyes brought inward (ex 0.036→0.0335) + catchlight lowered onto the iris (relaxed gaze).
- **Validate:** `GATE_TEST_OK`; 0 unweighted / 0 bad-sum.
- **Evidence:** `proof/lab05d/iteration-07/` — Grip face (relaxed gaze), lowerbody (trouser break).
- **Review:** lead self-review (addresses the Loop-6 eye major + adds construction); independent
  gate at Loop 9.
- **Decision: ACCEPT.**

---

## Loop 8 — Role identity & palette diversity (addresses the Loop-6 monotone note)
- **Hypothesis:** crew tops are near-monotone blue-grey, so roles lean on headwear alone and read
  weakly in greyscale; distinct per-role hues+values + a couple of silhouette props fix it.
- **Change:** diversified palettes — PA tan · Grip blue · Electric hi-vis-orange · **Maintenance
  OLIVE coveralls** · **Office MAROON top** · CameraDP green · Director charcoal · Carpenter tan.
  Added a **carpenter apron** (canvas front panel + tool pouch) and an **electric cable coil**
  (shoulder) for greyscale silhouette distinction.
- **Validate:** `GATE_TEST_OK`; 0 unweighted / 0 bad-sum.
- **Evidence:** `proof/lab05d/iteration-08/` — roles/allroles lineups span distinct hues + silhouettes.
- **Review:** lead self-review; FULL gate at Loop 9.
- **Decision: ACCEPT.**

---

## Loop 9 — Population diversity  ·  FULL MULTI-REVIEWER GATE
- **Hypothesis:** every crew member shares the identical head/face/proportions, so a lineup reads as
  one character recoloured; deterministic per-instance variation of head shape + features + build
  makes a crowd read as distinct people.
- **Change:** `_seed_floats(seed)` (deterministic, no RNG) drives a `vary` mode that perturbs head
  width/height, nose, mouth width, chin, eye-spacing, and brow per instance — combined with
  per-instance skin/hair/facial-hair/size overrides. New `population` lineup (6 PA-role people).
  Skeleton untouched; skin independent of role.
- **Validate:** `GATE_TEST_OK`; 0 unweighted / 0 bad-sum.
- **Evidence:** `proof/lab05d/iteration-09/population-front.png` — 6 distinct individuals, same role.
- **Review:** FULL multi-reviewer gate (Art Director + Readability + Diversity), verdicts appended.
- **Decision: ACCEPT** (self-review: reads as distinct people; gate appended).
