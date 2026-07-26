# Pass 4 — Visual Review

Outcome of the owner first-open visual-polish milestone. Honest summary: the
Stage-A authored-asset pipeline proof was built and independently reviewed, and it
**did not clear the bar**. Per the directive's gate, Stage B/C (hero environment,
owner-facing mode) were **not** begun, and the frozen scene was preserved.

## Baseline

See `PASS-4-BASELINE-VISUAL-ASSESSMENT.md`. In short: the lot is a technically
successful prototype whose flat, two-tone procedural world-art reads a fidelity
tier below its polished UI. The gate is not a hero; active production leans on
labels; struggling-state transparency is unacceptable.

## Stage A result — FAIL (independent review)

- Built an authored **SVG → transparent-PNG** pipeline (`rsvg-convert`) and a
  sample **hero gate** (two iterations to a cohesive Deco arch with gradients,
  brass, deco crown, bulb trim, soft contact shadow).
- Integrated it into the scene (Phaser `preload` + per-building texture override
  with procedural fallback). Technically clean: selectable (pixel-perfect),
  depth-sorted, both regression suites green, no console errors.
- **Independent reviewer verdict: FAIL — "more detailed but not visually better."**
  Root causes: oversized/broke the iso grid, projection + grounding mismatch, and —
  decisively — a lone gradient asset **clashes with the flat-shaded neighbors** and
  reads as "from a different game." Full verdict:
  `PASS-4-STAGE-A-INDEPENDENT-REVIEW.md`.

## The key finding

Proving the authored-sprite upgrade **one asset at a time is structurally
unsound**: a single high-fidelity building among flat neighbors always looks
foreign, regardless of how good it is in isolation. A fair proof — and any real
"make it look like a game" pass — requires restyling a **coherent cluster or the
whole scene** to the new material language at once. That is a substantially larger
effort than a three-asset Stage A dropped into an otherwise-flat lot, and it should
be scoped and authorized as such rather than smuggled in through a spike.

## Decision (Stage C not reached)

- Stopped at the Stage-A gate, as the directive requires on a failed review.
- **Reverted** the mixed-style integration; `LotScene.ts` is byte-identical to the
  frozen `34cebff`. The scene renders exactly as approved Pass 3.
- Retained the pipeline tooling, the sample asset, and this findings set as the
  research record.

## Retained vs rejected

- **Retained:** `tools/build-assets.mjs` (pipeline), `src/assets/authored/a-gate.png`
  (sample), all Pass-4 docs, `shots/pass-4/` evidence.
- **Rejected / reverted:** shipping the authored gate into the runtime scene; any
  Stage-B environment work; the owner-facing launch mode (gated behind Stage-A
  approval, which did not occur).

## Beauty / recognition tests

Not applicable this pass — they gate on a Stage-B scene that was not built. The
existing Pass-2/3 evidence remains the current visual bar.

## Limitations / honest state

- The owner first-open experience (clean branded launch, curated camera, hidden
  prototype language) was **not** delivered — it was correctly gated behind a
  Stage-A pass.
- The struggling-state transparency issue flagged in the baseline **remains** in the
  frozen build (not addressed, since implementation stayed frozen).

## Recommendation

Keep the lot **frozen at its Pass-3 visual state**. If the owner wants the
first-open polish, authorize a **dedicated art milestone** scoped to restyle the
whole scene (or a coherent hero cluster) to one consistent material language —
not a single-asset spike. The pipeline proof shows the tooling is viable; the
blocker is cohesion, which only a whole-scene commitment resolves.
