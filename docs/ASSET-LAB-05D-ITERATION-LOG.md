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
