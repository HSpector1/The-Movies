# Fable Authored Environment Spike

**An experiment, not production.** One question: can offline Blender-authored environment art,
built from legally usable donor sources, replace the lot's procedural building art and make the
actual game frame dramatically better — without touching Engine truth?

**Answer: yes — proven on Stage B, behind a default-OFF dev flag, with zero corrective passes.**

## Provenance

| | |
|---|---|
| Mandate | Director: Authored Environment Strike Team (Fable PM + Opus builders) |
| Baseline | `9c4d060` (frozen D1-B closure; deliberately NOT the moved branch tip) |
| Branch / worktree | `art-fable-authored-environment-spike` · `/Users/bruce/Project Studio - Fable Authored Environment Spike` |
| Checkpoint F3 | `ba42ea7` — authored Stage B proof (this commit's parent chain is the whole story) |
| Quarantine | `/Users/bruce/Project Studio - Art Source Quarantine/Fable-Authored-Proof/` (raw donors, calib, evidence, PM decisions — never committed) |
| Known baseline gap | `35ace76` (stage-presentation reset across loads) is downstream of our baseline; any such symptom here is that known fix, not a spike regression |

## Pipeline actually exercised

donor acquisition (anonymous, licence-captured) → quarantine + SHA-256 ledger → Blender 5.2
normalization/authoring (deterministic `build.py`) → locked measured camera → offline EEVEE render
(alpha PNG, no ground shadow, no signage text) → Vite-imported PNG behind
`project-studio.flags.studio-lot-authored-stage-proof` → existing identity/state/shadow/signage/
hit-test/depth systems unchanged.

## Camera contract (measured, not asserted)

Ortho; euler (60°, 0°, 135°); elevation 30°; `ortho_scale = W·√2/128`; 128×64 px/tile exact;
1 BU vertical = 78.4 px; Blender +X = game +gy (LIT, renders screen-LEFT), +Y = +gx (shadow);
anchor = footprint ground centre at (texW/2, texH−128). Verified 4/4 gates vs the game's own
`gridToScreen` (`ui/src/lot/scene/iso.ts`) by `Fable-Authored-Proof/calib/measure_gates.py` —
note the D1-B calib scripts only *render*; the measuring layer plus an axis-discriminating 4×2
probe were written here. `CAMERA-CONTRACT.json` is the single source of truth for re-renders.

## Render segmentation

**One sprite suffices — no slices, no slicing engine.** Buildings sort as one container depth
keyed on the front corner; characters already pass behind/in front. Slices would only be needed
for lateral overhangs or walk-through geometry; the Soundstage has neither. (Mandate §7 answered
with evidence.)

## Integration facts the next artist/engineer must know

- **No other asset-file loader exists**; all other art is `generateTexture`'d at scene create.
  This flag-gated loader is the deliberate first exception (the D1-B closure had listed it as
  not-yet-authorized for production; this branch is the bounded authorization).
- **Alpha IS the hit area** (pixel-perfect, tolerance 1) — renders must carry clean silhouette
  alpha: no ground shadow, no fringe, no glow.
- **The game draws ground shadow and stage signage itself** — never bake either into the PNG.
- Metadata `{anchorX, anchorY, fwTiles, fdTiles, pxPerTile}` lives beside the PNG import and is
  validated against the loaded file (IHDR read in test); mismatch refuses the swap and falls
  back to procedural art. `layout.ts` derives footprints from it — wrong values move the lot.
- `wallRight` is the LIT face and renders LEFT (+gy). The comment claiming otherwise is wrong.
- The idle tint (`0xece4d2` multiply) flattens authored colour separation somewhat — designed
  against flat procedural fields; acceptable on this asset, but future authored art should keep
  identity in VALUE (light/dark), not only hue.

## Visual verdict (PM, real frames, OLD vs NEW same camera)

Evidence: `Fable-Authored-Proof/evidence-integration/FINAL-*` (12 legs + crops + JSON).
The authored "Ridge-Monitor Stage" (competition winner, Candidate A) reads as a designed
movie-studio building — glazed ridge monitor, stepped Deco facade, oxblood elephant door,
office annex — inside the lot's flat warm language. Old Stage B reads as a striped box beside
it. Measured, not vibes: edge sharpness 1.47 px vs Stage A's 2.23 px at the closer preset;
lit/shadow ratio 0.876 in the governed band; identity survives signage masking and the
underDressed finish. **Initial attempt accepted; corrective budget unspent (0 of 2).**
The rejected Candidate B ("Facade-Forward Deco") and both artists' full self-assessments are
retained in `art/candidate-{A,B}/RESULT.md`.

## Performance

displayObjects 143 → 143 (delta 0, budget was +1); FPS unchanged within headless jitter;
PNG ships as its own 122.8 kB asset (never fetched flag-off); decoded RGBA +0.74 MB
(budget ≤4 MB); JS +1.66 kB; flag-off pixel-stable vs baseline at 0.097 % (noise floor).
Suite: typecheck ✓ · 1082 unit tests ✓ · build ✓ · lot e2e 22/22 ✓.

## Sources used (full ledger: quarantine `provenance/LEDGER.md`)

| Source | Licence | Actually used |
|---|---|---|
| Blendkit Arched Hangar (A. Samusenko) | Royalty Free (renders sellable; raw non-redistributable) | visor canopy only — shell REJECTED (ground-springing Quonset, photoreal steel) |
| Blendkit Industrial Building (Abobla O.S) | CC0 | rejected (texture-baked slab) |
| Poly Haven ×7 models + ×5 textures | CC0 | crates, ducts, utility box, pipe run (decimated ≤500 tris, re-materialled flat); textures unused in final (lot has none) |
| ambientCG (4 approved materials) | — | BLOCKED at network layer (TLS drop, retired); Poly Haven CC0 substitutes stood in |

Acquisition note for Director ratification: the hangar came via Blendkit's public API
anonymously (no account/login/payment; asset flagged free/anonymous-downloadable). PM ruling
CLEARED WITH DISCLOSURE — fallback documented (CC0 building / clean rebuild) if read stricter.

**Finding that shapes future acquisition:** BOTH artists independently rejected the donor shell
and rebuilt clean, harvesting only small components. Marketplace "building-shaped" donors fought
the style; commodity PROPS (CC0) adapted well. Donor value concentrates in dressing, not shells.

## Track B / C status

Southeastern University family: **BLOCKED — source bytes not on this machine** (full-disk sweep
documented). Intake dir + a one-paragraph dual-rights permission request are ready at
`Fable-Authored-Proof/southeastern-intake/`. No audit was faked with substitute geometry.
Administration concept: blocked on the same bytes. Dekogon/Fab: DEFERRED (bot wall + Epic login).

## What should happen next (PM recommendation, Director decides)

- **Adopt-candidate**: the flag-gated authored-stage mechanism + this Stage B render, via the
  main Art Director's normal review.
- **Retain experimental**: competition workflow; Candidate B; 2× closer-asset contingency
  (measured unnecessary today).
- **Park**: any generalized pipeline/tooling (spritesheet renderers, batch converters) until a
  THIRD building shows repetition worth automating.
- **Reject**: donor building shells as a default strategy; slicing infrastructure.

## Final production outcome (added after closure)

The Director approved **Option D — selective combination**: Candidate A's art was adopted onto
PRODUCTION's authored-stage integration path (not this branch's mechanism), with a
strike-team-authored worn variant preserving the lot's authoritative underDressed semantics and
four regression guards (anchor invariant, IHDR guard, real negative alpha hit-test,
registration lock). Merged to production `main` as `fdfdfea` (ff-only) with Owner
authorization. **This experimental branch itself was never merged** and remains frozen as
evidence. Durable lessons: `docs/LESSONS-LEARNED.md` §AW–BB (production docs lineage).
