# Bounded Art Experiment: D1-A Studio Identity Visual Proof

*Read only research deliverable, 2026-08-01. Part of the Project Studio open source art and presentation audit. No production repository, code, or asset was modified to produce it. Full context and rulings are in ART-PRESENTATION-INTEGRATION-BLUEPRINT.md.*


Proposal only (spec §10). Nothing here is to be implemented. It targets the D1 studio
lot in the production repo (`/Users/bruce/The Movies`, `ui/src/lot/`), stays behind the
default OFF feature flag, and merges nothing without owner review. One experiment, one
product question.

## Decision: substitute D1-A for the default D1-B, and why

The default candidate for this slot was "D1-B Modular Soundstage Visual Proof." I am
substituting the "D1-A Studio Identity Visual Proof" instead. The substitution is not a
preference call; it follows the standing gate ruling and the corpus evidence.

1. The gate status already names D1-A as "the recommended first production-art
   integration slice unless the audit gives strong evidence to revise it." A bounded art
   experiment exists to de-risk the NEXT real integration. The next real integration is
   D1-A. A soundstage proof would de-risk work the gate sequences AFTER identity, which
   is premature.
2. The corpus gives no evidence to revise the D1-A-first order. It reinforces it. The
   identity surface is the single most explicitly unfinished production-art seam in the
   D1 code:
   - `assets.ts:501-503` draws the hero gate `p-gate` with a deliberately deep header
     beam but no lettering, with the comment that the studio name is "added by the scene
     as an overlay on the header (Graphics can't draw text)." The identity name and logo
     surface is a reserved empty slot by design.
   - `assets.ts:691-692` does the same for the production title easel `p-titleboard`.
   - The verified layout/assets audit states plainly: "There is no crest, wordmark, logo
     geometry, or configurable studio-name asset baked into these files," and the water
     tower landmark at `assets.ts:438-463` is a "generic silhouette ... not yet
     studio-branded."
   - `adapter.ts:3625,3809` fakes `studioName` as the product brand
     `STUDIO_LOT_BRAND = 'PROJECT: STUDIO'` because "D1 has no per-studio name field." The
     one identity fact the snapshot already carries is a placeholder.
3. The corpus's single actionable branding technique points straight at this surface.
   OpenTTD's recolour-by-palette-remap pattern is the one branding pattern in the entire
   corpus dispositioned `CLEAN_ROOM_REIMPLEMENT`, and its Project Studio mapping is
   explicit: "recolour signage, the gate marquee, banners, awnings ... from a SINGLE
   placeholder art set, no per-studio art duplication, fully deterministic." OpenTTD's
   manifest pattern names the target by name: "The D1-A Studio Identity Package should
   adopt the .obg lesson at small scale."
4. D1-A touches zero contract non-goals. The soundstage experiment's modular-kit and
   era-seam questions sit next to facilities, construction, and eras, all explicit
   non-goals. Identity is pure presentation and needs no contract change at all.
   For a two-person team that makes it the smaller, safer, higher-leverage slice.

D1-B remains the natural SECOND experiment. It is not discarded; it is sequenced. Once
identity proves that authored studio branding renders cleanly from snapshot facts, the
soundstage silhouette and dressing work inherits a proven identity-recolour path.

## Product question

Can original studio identity art render inside the existing D1 Phaser lot from snapshot
facts alone, at the fixed D1 camera, without changing the sim, without breaking the
determinism invariant or the `StudioLotSnapshot` contract, and while honoring the
never-colour-alone rule? Concretely: a wordmark treatment on the gate header, a
procedural studio crest, a branded water tower landmark, and a single-source brand
recolour of signage and premiere dressing, all driven by the authoritative `studioName`
and a presentation side brand identity input (a lot side identity config, not a snapshot
field), never by RNG and never re-derived by the renderer.

## Starting state (what exists today, cited)

- The gate `p-gate` header is a reserved text slot; `LotScene.applySnapshot()` already
  writes `studioName.toUpperCase()` into the gate lettering at `LotScene.ts:1070`. There
  is a live wordmark, but it is untreated plain text with no backing plate, frame, or
  logo.
- The water tower `p-tower` is placed at `layout.ts:200-201` (grid 21,5) and baked as a
  generic 110x190 silhouette at `assets.ts:439-463`. No crest, no wordmark band.
- Standing-driven dressing is authored, not tinted. `establishedDressing()` at
  `layout.ts:255-272` ADDS premiere banner poles, a studio flag, and cafe umbrellas when
  standing is established or prestige. These props (`p-banner`, `p-pennant`, `p-flag`)
  are the natural recolour targets.
- The palette already bridges to product design tokens: brass `0xc9a24a` is labelled
  "product --accent" at `palette.ts:49`, `brassDark` is "--accent-dim" at `:50`,
  banner and pennant golds resolve to product brass around `:98`, and the on-canvas label
  chrome aliases `--bg-panel`, `--text`, and the selection ring to product tokens at
  `:101-103`. The colour half of an identity system is in place; the wordmark, crest,
  branded landmark, and the per-studio recolour path are not.
- All D1 art is 100 percent procedural Phaser Graphics baked once through
  `bakeAllTextures()` at `assets.ts:828-838`. There are zero image imports. Any identity
  art added here must stay procedural to match the pipeline.
- `studioLotSnapshot()` at `adapter.ts:3682` carries `studioName` (faked) and `sceneSeed`
  (`state.seed`). It carries no brand colour. `StudioLotSnapshot.ts` is a leaf type module
  that imports nothing.
- The lot is gated by `studioLotOverviewEnabled()` in `flags.ts`, default OFF, via
  `VITE_STUDIO_LOT_OVERVIEW` or localStorage `project-studio.flags.studio-lot-overview`.

## Exact scope

Build, behind the default OFF flag, at the fixed D1 camera, using only procedural Phaser
Graphics:

1. Gate wordmark treatment. Upgrade the existing `studioName.toUpperCase()` gate overlay
   (`LotScene.ts:1070`) with a procedural backing plate and deco frame sized to the
   reserved header beam (`assets.ts:501-503`), so the name reads as a designed sign rather
   than floating text. Text stays a scene overlay, no image import.
2. Procedural studio crest. One new baked texture (for example `p-crest`) drawn from
   Graphics primitives, placed on the gate header and reused as a marquee blade emblem.
   Shape carries identity independent of colour.
3. Branded water tower. Extend `p-tower` (`assets.ts:439-463`) with a procedural crest
   decal and a wordmark band, replacing the generic silhouette with a studio-specific
   landmark. Same footprint and grid placement (`layout.ts:200-201`), no new massing.
4. Single-source brand recolour. A deterministic recolour helper in the lot scene that
   maps one brand colour, supplied by a presentation side identity config (not a snapshot
   field), to a Phaser tint or ramp and applies it to a fixed set of
   identity targets: gate lettering backing, the crest, the marquee, and the
   `establishedDressing()` premiere banners and pennants. This is the clean-room
   reimplementation of OpenTTD Pattern 2, one art source, many liveries, zero
   duplication. When no brand colour is configured it falls back to the existing product
   accent (brass, `palette.ts:49`), so the default studio is unchanged.

Everything derives from `studioName` (a real snapshot fact) and a presentation side brand
identity input (a lot side config, see the contract note below). Nothing derives from
`sceneSeed`, because identity is not ambient variation, and nothing is re-derived by the
renderer.

## Explicit exclusions

- No non-procedural or authored image assets. No sprite, texture, or GLB imports. The
  D1 pipeline is procedural (`assets.ts:1-8`) and stays that way for this slice, which
  also keeps license risk at zero.
- No real per-studio `studioName` GameState field. Phases 1-4 expose none
  (`adapter.ts:3625`). The experiment renders whatever `studioName` the snapshot carries
  and uses fixtures to feed alternate names. No sim change.
- No identity work on any other building (admin, writers, casting, stage-a, stage-b,
  post, theater, expansion). Gate, crest, and water tower only.
- No soundstage work. That is D1-B, the sequenced follow-on.
- No facility, construction, tier, or era mechanics or art. Those are contract non-goals.
- No renderer migration, no GLB character integration, no Asset Lab pipeline wiring.
- No change to `navigation.ts`. No lot action spends money, advances time, or mutates
  GameState. Identity is display only.

## Likely files

Real paths, all read in the audit:

- `ui/src/lot/scene/assets.ts`: new procedural `p-crest`; extend `p-tower`; extend the
  gate header treatment; register in `bakeAllTextures()`.
- `ui/src/lot/scene/LotScene.ts`: wordmark backing/frame overlay near the existing gate
  lettering write (`:1070`); the deterministic recolour helper; apply recolour to
  identity targets in `applySnapshot()`.
- `ui/src/lot/scene/layout.ts`: no new placement expected; the water tower and premiere
  dressing already exist (`:200-201`, `:255-272`). Touch only if a crest anchor is needed.
- `ui/src/lot/scene/palette.ts`: a small set of named identity ramps derived from the
  product tokens; no third-party ramp values.
- `ui/src/lot/snapshot/StudioLotSnapshot.ts`: UNCHANGED. This experiment adds no field to
  the leaf type; brand identity is presentation side (see the contract note below).
- `ui/src/engine/adapter.ts`: UNCHANGED. The D1 selector is not touched.
- `ui/src/lot/StudioLotView.ts`: passes the snapshot through unchanged; `getDebugState()`
  used for the displayObjects evidence.
- `ui/src/lot/studio-lot-snapshot.test.ts`, `ui/src/lot/determinism.test.tsx`,
  `ui/src/lot/StudioLotScreen.test.tsx`: test updates below.
- `ui/e2e/lot.spec.ts` and `scripts/gen-lot-fixtures.mts`: one new identity fixture and
  journey.

## Original placeholder assets required

All original, all procedural, no external source, so provenance is trivially clean and no
license class applies. This deliberately sidesteps the corpus lesson that "open" is not
"reusable": OpenTTD's OpenGFX is a famous free art set that is still GPL copyleft, and the
Asset Lab governing rule is "a free download is not a known production license." Staying
procedural keeps this slice off that hazard entirely.

- `p-crest`: one procedural studio emblem, Graphics primitives only.
- Gate wordmark chrome: a procedural backing plate and deco frame for the existing scene
  text overlay.
- Branded `p-tower`: crest decal plus wordmark band added to the existing silhouette.
- Recolour targets: the existing `p-banner`, `p-pennant`, marquee, and gate lettering
  backing, recoloured by the helper. No new banner geometry.

## Metadata and provenance

- Experiment id: D1-A. Track: Gate D1 production-art integration, first slice.
- Provenance: 100 percent original procedural Phaser Graphics, no image imports,
  consistent with `assets.ts`. No third-party art, no attribution or share-alike
  obligation, no `LICENSE-UNCLEAR` exposure.
- Feature flag: `studioLotOverviewEnabled()` (`flags.ts`), default OFF. When off there is
  no lot entry point, no Phaser fetched, no renderer mounted, nav unchanged.
- Determinism source: `sceneSeed` continues to drive ambient variation only. Identity art
  derives from `studioName` plus a presentation side brand colour, never from RNG, no `Math.random`.
- Forward-looking shape only, not built here: OpenTTD's manifest lesson (buildingId to
  {region, checksum, license, source}) is the shape a LATER authored-art slice would
  adopt. This experiment carries no manifest because it ships no authored files.

## Engine and Presentation contract: no change

This experiment does NOT widen `StudioLotSnapshot` and does NOT touch the selector. That
is a deliberate scope choice, and it keeps the slice strictly presentation only. The
renderer must not manufacture truth: it illustrates `studioName` (a real snapshot fact)
and a presentation side brand identity input, and nothing else about identity.

- `studioName`: unchanged. The D1 selector keeps mapping it to `STUDIO_LOT_BRAND`
  (`adapter.ts:3809`). The experiment renders whatever value the snapshot carries;
  fixtures supply alternate names to prove per-studio wordmark rendering. No selector or
  sim change.
- Brand colour: sourced presentation side, from a small lot side identity config (a named
  ramp set in `palette.ts` or an adjacent lot config consumed by `LotScene`), NOT from the
  snapshot. When no brand colour is configured it falls back to the existing product
  accent brass (`palette.ts:49`), so the default studio is unchanged. Because nothing is
  added to the snapshot, the leaf type stays a leaf type, the selector's serialized output
  is byte identical to today by construction, and the determinism and no-mutation
  guarantees (`studio-lot-snapshot.test.ts` Test 10 and Test 11) are untouched.
- Why not an optional snapshot field. An earlier framing considered a reserved optional
  `brandColor?: string` on the snapshot, mirroring how `decision-required` is renderer
  supported but never emitted by the D1 selector (`StudioLotSnapshot.ts:54-59`). That is
  technically byte safe, but Ruling (j) is explicit ("add nothing to the snapshot itself
  yet; do not widen the contract until authorized") and Section N makes any snapshot change
  joint (Art plus Engine) plus owner gated. So this proof deliberately needs no contract
  change. Real per-studio identity, whether a `studioName` field in GameState or a brand
  colour on the snapshot, is a separate, explicitly deferred, owner authorized decision,
  not part of this experiment. The experiment proves the rendering technique; it does not
  pre-commit the contract.

The experiment runs identically whether or not a brand colour is configured (brass
fallback) and still proves the wordmark, crest, and branded landmark. Configuring a brand
colour adds only the single-source recolour proof, giving the owner a clean two-step read.

## Tests

- Determinism (`determinism.test.tsx`). Same snapshot yields byte-identical identity
  render; assert frame-rate independence and animations-disabled byte equality for the
  identity layer specifically. The vignette and determinism audit flagged that frame-rate
  and animations-disabled byte equality "are NOT asserted in any of the five files
  reviewed." This slice is the right occasion to add that assertion for the identity
  layer, since identity must be perfectly stable across frame rates by construction.
- Snapshot unit (`studio-lot-snapshot.test.ts`). Assert the snapshot contract is unchanged:
  no `brandColor` or other per-studio field is added to the leaf type, and the selector's
  serialized output stays byte identical to current, in the spirit of Test 9 (never
  decision-required) and Test 13 (expansion carries exactly its display-only keys). Assert
  the renderer consumes the authoritative `studioName` rather than any recomputed value.
- Host lifecycle (`StudioLotScreen.test.tsx`). No nav or selection change. The hoisted
  `FakeInstance` mock accepts the unchanged snapshot and requires no new method, since
  identity art lives inside `LotScene` below the view boundary and the contract is untouched.
- Playwright (`ui/e2e/lot.spec.ts`). A new journey loads an identity fixture with a
  distinct `studioName` and a configured brand colour and asserts the gate wordmark shows that name,
  zero pageerror events across the five viewports plus 125 percent zoom (matching J1),
  and the flag-off path still renders no lot (matching J10). Regenerate fixtures via
  `scripts/gen-lot-fixtures.mts` with one new `identity` fixture, seeded through the
  session-recovery path (`project-studio.active-session.v4`).
- Screenshot fixtures. Written to the existing evidence directory
  `out/gate-d1-evidence/`. Each frame must show that colour is additive, never
  load-bearing alone: the wordmark carries identity as text, the crest as shape, the
  recolour on top. This is the direct render-side proof of the never-colour-alone rule
  that Augustus, CorsixTH, and IndustryIdle all model on the readability side.

## Screenshots plan

Fixed D1 camera. Capture at the overview preset plus the gate-framing view (`LotScene`
exposes an `entrance` camera preset targeting the gate grid; the publicly driven presets
are overview, production, wide).

1. Default studio: `studioName` = product brand, no brand colour configured, brass fallback. Baseline
   showing the treated gate wordmark and crest with the existing palette.
2. Alternate studio A: distinct `studioName` plus brand colour 1. Gate, crest, marquee,
   and premiere banners recoloured from one source.
3. Alternate studio B: distinct `studioName` plus brand colour 2. Same targets, different
   livery, proving one art source drives many studios.
4. Established-standing frame: standing established or prestige so `establishedDressing()`
   premiere banners and pennants are present and recoloured, showing identity reads
   through the authored dressing.
5. Branded water tower closeup at the gate-framing view, showing the crest decal and
   wordmark band replacing the generic silhouette.

## Performance evidence to capture

- `getDebugState().displayObjects` before and after. The identity layer adds a small,
  bounded set of baked objects (one crest texture plus a few recolour targets) baked once
  in `bakeAllTextures()`. Document the delta and confirm it is small and constant.
- Confirm no new per-frame cost: the crest and wordmark are static; the recolour is a
  one-time tint applied on snapshot change, not a per-frame recompute. Identity art must
  be baked at create time, with only the brand colour tint swap running in
  `applySnapshot()`, and that swap is O(number of identity targets).
- Confirm the bundle is unchanged: Phaser stays lazy loaded, no image imports added.
- Confirm `pause()` and `resume()` still sleep the Phaser RAF loop when the tab is hidden,
  so a backgrounded lot with identity art still costs no CPU.

## Stop conditions

Stop when the five screenshots are captured, the determinism, snapshot, host, and e2e
tests pass, and the displayObjects delta is documented and bounded. Do not continue into:

- authored (non-procedural) art import,
- a real per-studio `studioName` GameState field,
- identity for any other building,
- the soundstage (that is D1-B),
- any facility, construction, tier, or era mechanic or art,
- renderer migration or GLB integration.

Also stop and report a finding, rather than patching around it, if the recolour cannot
satisfy never-colour-alone, that is, if a studio reads as colour only without the wordmark
and crest carrying its identity. That is a design signal for the owner, not a thing to
force.

## Human review gate

Nothing merges without owner review. The deliverable of the experiment is a review
package: the five screenshots, the test output, and the displayObjects evidence, all
produced behind the default OFF flag on a branch the owner cuts. The owner verdict gates
two decisions: whether D1-A becomes the real identity integration slice (and thus whether
authored, non-procedural art intake is authorized as the next step), and, separately,
whether a per-studio identity is ever added to the model (a `studioName` field in GameState
or a brand colour on the snapshot), which is a joint plus owner gated contract decision
this experiment deliberately does not pre-commit. This experiment is a visual proof on the
existing, functionally approved D1
foundation. It does not begin phase 5 or phase 6, and it does not treat the D1 renderer as
disposable.
