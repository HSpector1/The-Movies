# Authored Environment Pipeline — Standard

**Status: ACTIVE STANDARD.** Governs *future* authored environment buildings.
Established at production authority `5e75b8e896d2706e3fa2c21c84b3e8c1e0f3954d`.

This file is the reusable value and reproducibility contract for offline-authored lot
buildings. Everything in **Part 1** is the standard. Everything in **Part 2** is Stage B's
historical record, kept here as a worked example — Stage B's numbers are *evidence*, not
rules, and Part 2 exists so nobody has to guess which is which again.

**What this is not.** Not an Art Factory, not render automation, not a building generator,
not a Blender orchestration layer, and not an authorization to convert any building. Each
authored building still needs its own Art Director authorization.

**Companion documents.**
[`AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-CLOSURE.md`](AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-CLOSURE.md)
(Stage B closure) ·
[`AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-PROVENANCE.md`](AUTHORED-SOUNDSTAGE-PIPELINE-PROOF-PROVENANCE.md)
(Stage B runtime-art provenance) · lessons **AU** and **AV** in
[`../LESSONS-LEARNED.md`](../LESSONS-LEARNED.md). The *camera* half of the pipeline
(projection, ortho scale, axis mapping, anchor, sun rig) is governed by
`calib/CAMERA-CONTRACT.json` in the out-of-repo art quarantine; this file governs the
*value* and *export* halves and does not restate it.

---

# PART 1 — THE REUSABLE STANDARD

## 1. Canonical displayed-value measurement space

> **Every governed value relationship is measured as Rec.601 luma over 8-bit ENCODED sRGB
> channel values, on the final optimized / quantised asset.**

```
displayedLuma(R, G, B) = 0.299·R + 0.587·G + 0.114·B        R,G,B ∈ [0,255], sRGB-encoded
```

| | |
|---|---|
| Coefficients | Rec.601 — `0.299 / 0.587 / 0.114` |
| Channel space | **encoded sRGB**, as stored in the PNG. **Never linearised.** |
| Measurement authority | the **final optimized / quantised asset** (the shipped PNG) |
| Not the authority | Blender irradiance · source material constants · pre-quantisation render · `dull()` inputs · any authoring parameter |

### Why this formula and not another

The choice was made against the four criteria the Art Director set, not by convenience.

- **Current production convention.** Every Art-measurement implementation *inside this
  repository* already computes Rec.601 over encoded values — `assets.test.ts` does it twice,
  and it is the formula the shipped palette relationships were designed to. Canonicalising
  Rec.601 therefore requires **no production code change**; it ratifies what production
  already asserts under test.
- **Reproduces the accepted evidence exactly.** Rec.601-over-encoded regenerates every
  figure in the Stage B closure table to four decimal places — `0.8687`, `0.8614`, `0.8737`,
  `0.8746`, `36`, `230`, `1.72 %`, `2.73 %`. Rec.709 does not: it returns `0.8594` where the
  record says `0.859`, so adopting it would silently re-grade history.
- **Clarity.** "Luma" (Y′) is by definition the gamma-encoded quantity; "luminance" (Y) is
  the linear one. Naming the encoded quantity Rec.601 *luma* keeps the standard's own
  vocabulary honest.
- **Determinism.** Integers in, one multiply-add, no colour-management dependency, no
  profile, no rounding policy to argue about. Two tools written years apart agree bit for bit.

**Rec.709 was seriously considered and rejected.** Rec.709's primaries are sRGB's primaries,
so on colorimetric grounds it is the better-matched pair. It was not chosen because the
standard governs a *ratio between two tones of the same material*, where the two formulas
agree to **< 0.001 across every wall family in the lot** (asserted in
`authoredValueStandard.test.ts` test 3) — an accuracy difference far below any tolerance the
standard sets — while the reproducibility difference is real and one-way. When a tie is that
close, the tiebreak is "reproduces the accepted record", and that is Rec.601.

### The encoded-vs-linear rule (lesson AU, as an executable rule)

**A relational threshold is only meaningful in the representation space it was defined in.**
The governed ratios describe how an asset *reads on screen*, and the on-screen value is the
encoded byte.

Linearising first does not refine the number — it produces a **different quantity wearing the
same name**. For the cream family the encoded relationship is `0.8737`; linearised it is
`0.7408`. That 0.13 gap is exactly the error that shipped: `0.8735` was fed to the Blender
rig as a *linear* fill ratio, sRGB encoding compressed it, and the asset measured `0.949` on
screen while every membership check passed.

Consequently:

- **Measure encoded. Always.** No linearisation, no tonemap, no view transform other than
  Blender's `Standard`.
- **A rig input is not the standard.** If a renderer needs a linear value to *land* on the
  governed displayed ratio, that linear value is a derived, per-render, per-finish input —
  never a governed constant and never quotable as one. (Stage B needed `0.7345` linear for
  the normal finish and a different value for worn, because the worn pass compresses the
  encoded gap differently.)
- **Close the loop on the shipped file.** The rig input is correct if and only if the final
  quantised PNG measures inside the band. Nothing upstream may be treated as proof.

---

## 2. The relational rule: family-derived targets, bounded

> **A building's governed lit/shadow relationship is derived from the palette constants of
> the colour family it is painted in, and must be met within ±0.015 on the shipped asset.**

```
target(family)  = displayedLuma(family shadow tone) / displayedLuma(family lit tone)
accept(asset)   = | measured(asset) − target(family) | ≤ 0.015
measured(asset) = displayedLuma(modal shadow-face tone) / displayedLuma(modal lit-face tone)
```

**Face convention — read this before measuring.** The palette keys are named the opposite way
round from where the faces land on screen:

| | palette key | game axis | **screen position** |
|---|---|---|---|
| **lit** face | `*Right` | `+gy`, the face at `gy = fd` | the **LEFT** half of the texture |
| **shadow** face | `*Left` | `+gx`, the face at `gx = fw` | the **RIGHT** half of the texture |

### The families used by current lot architecture

Computed from `ui/src/lot/scene/palette.ts` under §1. Reproduced on every test run by
`ui/src/lot/scene/authoredValueStandard.test.ts`.

| family | buildings | lit tone (`*Right`) | lit luma | shadow tone (`*Left`) | shadow luma | **target** |
|---|---|---|---|---|---|---|
| **buff** | Stage A | `#cab98d` | 185.067 | `#b09f72` | 158.953 | **0.8589** |
| **cream** | Writers · Casting · Theater · Stage B | `#e1d2ad` | 210.267 | `#c9b78e` | 183.708 | **0.8737** |
| **taupe** | Administration · the gate | `#bea886` | 170.702 | `#a48f6c` | 145.289 | **0.8511** |
| **slate** | Post-production | `#a7afb4` | 173.178 | `#8b9499` | 145.879 | **0.8424** |
| **wallStucco** | perimeter wall (also Stage B's roof fascia) | `#d3c19c` | 194.164 | `#bba982` | 169.936 | **0.8752** |

### Why this form, and not a universal ratio

The rule is **form B — a bounded tolerance around a family-derived target.** The alternatives
were tested against the data and fail:

- **Form A (exact family-derived target, no tolerance) — rejected.** No accepted asset hits
  its family constant exactly. The shipped authored Stage B measures `0.8687` against cream's
  `0.8737`; its worn finish measures `0.8614`. Quantisation, anti-aliasing and the worn
  material pass all move the modal tone. A zero-tolerance rule would fail production art that
  a reviewer passed, which makes it a rule nobody can ship under.
- **A single universal ratio (i.e. reusing Stage B's `0.859–0.876` everywhere) — rejected,
  and this is the trap the Administration preflight caught.** The families genuinely disagree
  by **0.0328** end to end. **Taupe (0.8511) and slate (0.8424) both sit BELOW the whole
  Stage B band.** Holding an authored Administration building (taupe) to `0.859–0.876` would
  demand a corner separation its own palette constants cannot produce — the building would
  have to be painted out of family to pass its coherence check. That is the exact
  metric-transplant failure lesson AU is about, one level up.

### Where the ±0.015 comes from

Derived from accepted evidence, not chosen:

| measurement | family | target | deviation |
|---|---|---|---|
| procedural Stage B, normal (control) | cream | 0.8737 | 0.0000 |
| procedural Stage B, worn (control) | cream | 0.8737 | 0.0009 |
| procedural Stage A, normal | buff | 0.8589 | 0.0000 |
| procedural Stage A, worn | buff | 0.8589 | 0.0000 |
| **authored Stage B, normal (shipped)** | cream | 0.8737 | **0.0050** |
| **authored Stage B, worn (shipped)** | cream | 0.8737 | **0.0123** |
| the defect that was caught (`0.949`) | cream | 0.8737 | 0.0753 |

`0.015` is the first round bound above the largest accepted deviation (`0.0123`, the authored
worn finish), leaving ~22 % headroom; it rejects the caught defect by more than 5×. Procedural
art — which is painted directly from the constants — sits at deviation 0.000, so the entire
tolerance exists to absorb *authoring* drift, which is what it is for.

**The tolerance is not a family discriminator, and must not be used as one.** Buff and cream
sit 0.0148 apart, inside 2 × 0.015 — a ±0.015 window around cream would also admit a
buff-painted building. The protection is structural rather than numeric: the target is
computed from *the building's own* `StagePalette`, so cream's number is never the yardstick a
buff building is held to. Both facts are pinned by tests 6 and 9 of
`authoredValueStandard.test.ts`.

### The worn / under-dressed finish

The same family target and the same tolerance. `underDressed` is a *finish*, never an
architectural change (`dull()` blends the field toward `COLORS.shadow`), so it stays in
family. It does drift further than the normal finish — every accepted worn measurement is
below its target — because darkening compresses the encoded gap. That drift is inside the
tolerance and is the single largest contributor to it.

---

## 3. Deterministic final-output quantisation

> **The shipped PNG-8 pair is produced by one recorded, runnable command, and the accepted
> production bytes must be reproducible from the pre-quantisation renders byte-for-byte.**

"PNG-8" and "use a shared palette" are **not** a sufficient record. The full contract:

| | |
|---|---|
| Tool | Pillow `Image.quantize` (no external quantiser) |
| Palette size | **128** requested colours |
| Method | **`Image.Quantize.FASTOCTREE`** (method 2) |
| Palette construction | **shared** — the normal and worn renders are pasted into ONE tall RGBA strip (**normal on top, worn below**), the strip is quantised **once**, and each finish is `crop`ped out of the quantised strip |
| Colour mode | source RGBA → PNG colour type **3** (palette), bit depth 8 |
| Alpha handling | alpha is quantised as a **4th channel** — not thresholded, not flattened, not premultiplied. Per-entry alpha is written as `tRNS`. |
| Dithering | **none.** `FASTOCTREE` assigns nearest-colour with no error diffusion; Pillow's `dither=` argument governs only the `palette=`-mapping path, which this pipeline does not use. |
| Optimization | `optimize=True` |
| Compression | `compress_level=9` (IDAT zlib header `0x78da`) |
| Ancillary chunks | none — the output carries `IHDR PLTE tRNS IDAT IEND` only |
| Deterministic ordering | the stack order above is load-bearing: it is the quantiser's input order and changing it changes the palette, hence the bytes |
| `libimagequant` | **must NOT be installed.** Pillow selects a different quantiser when it is present, producing a different palette. |

**Why one shared palette.** Two independently quantised finishes can differ by a stray alpha
pixel even when the geometry is byte-identical by construction, and that difference reads
downstream as a false geometry delta between the finishes. Quantising the pair together makes
the palette and `tRNS` **identical** in both files — verifiable, and verified.

**Byte-identical reproduction is environment-dependent.** It requires the same Pillow
quantiser and the same zlib. Reference environment, recorded by the tool on every run:
Pillow **12.3.0** (linked against zlib-ng 2.3.3, `libimagequant` absent), Python **3.14**,
zlib runtime **1.2.12**, numpy 2.5.1, macOS arm64. A future Pillow may change `FASTOCTREE` or
its PNG encoder; if reproduction then fails, that is a **provenance event to record**, not a
licence to re-export the accepted asset.

> **Supersession note (Option D, `fdfdfea`).** The Stage B pair this section's "shipped pair"
> language originally described was replaced on `main` by the Option D adoption of the Fable
> Candidate A art. The **current** production pair is not PNG-8: it is an RGBA colour-quantised,
> **alpha-lossless** encoding (true PNG-8 was evaluated and rejected for visible rim averaging
> and tonal posterisation — art fidelity wins), deterministically reproducible from the
> adoption-pack build scripts recorded in the strike-team quarantine, with as-committed SHA-256
> digests in the `fdfdfea` commit message. This section remains the standard for future exports
> produced with this instrument; the instrument's `verify` against-production baseline refers to
> the superseded pair and re-baselining is a decision for the next authored-building cycle.

---

## 4. The measurement window is a per-building input, not a constant

The face ratio is read as the **modal tone inside a wall band** — the wall planes are large
flat fields, so the mode is exactly the governed surface and is immune to doors, cornice,
mullions, signage and every anti-aliased edge. That requires four inputs, and **all four are
per-building**:

| input | Stage B's value | why it cannot be inherited |
|---|---|---|
| lit-face x-range | `0,232` | depends on footprint and facade geometry |
| shadow-face x-range | `280,512` | as above |
| wall band y-range | `280,360` | must sit between cornice and base, which move with wall height |
| luma floor | `140` | separates the stucco field from doors/trim **for that family and finish** |

The luma floor is the sharpest trap. Stage B's `140` is correct for cream; applied to the
**buff** Stage A worn finish it excludes the entire wall, because worn buff sits below it.
The tool **fails loudly** ("no pixels above luma floor") rather than returning a mode from
whatever survived — a silent wrong tone here is precisely how a relational defect ships. Pick
the floor by inspecting the target family's own tones, and record it beside the result.

---

## 5. The instrument

`scripts/art/authored-asset-pipeline.py` — narrow by design: deterministic final-output
quantisation and canonical measurement, nothing else. It does not model, render, bake,
generate or batch.

```bash
# export the shipped pair from a pre-quantisation render pair
python3 scripts/art/authored-asset-pipeline.py quantize \
  --normal <render>.png --worn <render>-ud.png --out-dir <dir> --stem <key>

# prove run-to-run and against-production byte identity (nothing under VCS is written)
python3 scripts/art/authored-asset-pipeline.py verify \
  --normal <render>.png --worn <render>-ud.png --stem <key> \
  --expect-normal <sha256> --expect-worn <sha256> --runs 3

# measure a FINAL asset against its family target
python3 scripts/art/authored-asset-pipeline.py measure <final>.png \
  --lit-tone <hex> --shadow-tone <hex> \
  --lit-x 0,232 --shadow-x 280,512 --band-y 280,360 --luma-floor 140
```

`measure` prints the distinct-colour census at **every** alpha threshold, so that figure can
never again be quoted without the definition that produced it (see Part 2 §B).

---

## 6. Acceptance checklist for the next authored building

1. Camera, scale, axis mapping and anchor per `CAMERA-CONTRACT.json`. View transform
   `Standard`; no tonemap.
2. Target ratio derived from the building's **own** family (§2), never inherited.
3. Rig input solved *per finish*, then confirmed by measuring the **shipped PNG** (§1).
4. Export via §3, with the exact command recorded in the building's provenance file.
5. `verify --runs 3` passes: run-to-run identical and matching the committed bytes.
6. `measure` inside ±0.015 for both finishes; window inputs recorded (§4).
7. Distinct-colour and soft-edge figures quoted **with** their definitions.
8. Reviewed at the management camera first (lesson **AV**: detail must collapse cleanly).

---

# PART 2 — STAGE B: PROJECT-SPECIFIC HISTORICAL EXAMPLE

**These numbers are evidence about one building. They are not rules.** Stage B is
production-adopted and closed; nothing in Part 1 re-opens, re-grades or re-gates it.

> **Supersession note (Option D, `fdfdfea`).** Everything below measures the procedural-lane
> Stage B pair as committed through `4a3025e`. Those files were replaced on `main` at `fdfdfea`
> by the Option D adoption of the Fable Candidate A art (which passes the Part 1 §2 relational
> rule at 0.8763/0.8732 against cream's 0.8737 ± 0.015). The measurements below stand unchanged
> as historical evidence about the superseded files and are not re-graded.

## A. Stage B's historical band, and its disposition

Stage B was accepted against a band of **0.859–0.876**. That band was never a universal
constant: it is the *interval spanned by the two soundstages' own families* —
`0.859` is buff (Stage A) and the upper end is cream (Stage B), as recorded in
`CAMERA-CONTRACT.json > lighting > front_to_side_luma_ratio`, whose `computed_from` field
already derives both ends from `palette.ts`.

**Disposition: historical, and left standing.** Stage B was accepted under its historical
measurement contract and is not re-graded here. Under the now-canonical formula its figures
are **numerically unchanged** — Rec.601-over-encoded is the formula its evidence was produced
with — so canonicalisation creates no delta, no re-review and **no new adoption gate**. Under
the Part 1 rule Stage B would also pass (deviations 0.0050 and 0.0123 against cream's 0.8737,
inside ±0.015); that is stated **for reference only**.

Future authored buildings use Part 1 §2. The `0.859–0.876` interval is retired as a
forward-looking acceptance rule.

## B. Stage B's measured values, with their definitions

Measured by `scripts/art/authored-asset-pipeline.py measure` on the committed assets
`ui/public/lot/b-stage-b.png` and `ui/public/lot/b-stage-b-ud.png`.

| metric | authored normal | authored worn | procedural control (normal / worn) |
|---|---|---|---|
| front-to-side displayed luma ratio | 0.8687 | 0.8614 | 0.8737 / 0.8746 |
| distinct colours — **distinct RGB triples over pixels with alpha > 200** | **36** | 28 | 230 / 167 |
| true soft edge — **alpha 1–249, as a share of non-zero-alpha pixels** | 1.72 % | 1.72 % | 2.73 % |
| palette entries (`PLTE` / `tRNS`) | 128 / 128 | 128 / 128 | — |

Window: lit `x 0–232`, shadow `x 280–512`, band `y 280–360`, alpha floor 200, luma floor 140.

The **distinct-colour figure is meaningless without its alpha threshold.** On the same shipped
normal asset the census reads 73 (alpha > 0), 52 (alpha > 128), **36** (alpha > 200) and 30
(alpha > 250). The governed figure is the one at alpha > 200 — the same opacity mask the face
measurement uses.

## C. Stage B's image-production chain

**Source-input authority: located and confirmed.** The pre-quantisation renders survive in
the out-of-repo art quarantine at
`/Users/bruce/Project Studio - Art Source Quarantine/render/`.

| stage | file | sha256 |
|---|---|---|
| pre-quantisation render, normal | `render/s-stage-b.png` (512×374 RGBA, 122,708 B) | `112bb4498250ec6a986e725202e74f563075f1ceec97c1426f56d81de5094735` |
| pre-quantisation render, worn | `render/s-stage-b-ud.png` (512×374 RGBA, 117,211 B) | `4bb3e95b6c0ed17de66b96cff2281d176cfc08292dc9479ad8794af29ed59b21` |
| shipped, normal | `ui/public/lot/b-stage-b.png` (10,254 B) | `adf413c8f88fb9aa040bcc5cdbdcdf83451d25ca74b183272b47d8064c2daa35` |
| shipped, worn | `ui/public/lot/b-stage-b-ud.png` (9,032 B) | `3f3dc5544f6cf4cfbe40097fa28c107d66d7739807399015988f67e09bdf4347` |

**1 — render** (Blender 5.2.0 LTS, generator `blend/stage_b7.py`, run from `$Q/blend`):

```bash
Q="/Users/bruce/Project Studio - Art Source Quarantine"
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python stage_b7.py -- "$Q/render/s-stage-b.png"    normal
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python stage_b7.py -- "$Q/render/s-stage-b-ud.png" worn
```

**2 — quantise.** The original command, recovered verbatim from the proof session's own
tool call and re-proven byte-identical:

```python
from PIL import Image
Q = "/Users/bruce/Project Studio - Art Source Quarantine"
n = Image.open(f"{Q}/render/s-stage-b.png").convert("RGBA")
w = Image.open(f"{Q}/render/s-stage-b-ud.png").convert("RGBA")
st = Image.new("RGBA", (n.width, n.height * 2)); st.paste(n, (0, 0)); st.paste(w, (0, n.height))
q = st.quantize(colors=128, method=Image.FASTOCTREE)
for nm, bx in (("s-stage-b", (0, 0, n.width, n.height)),
               ("s-stage-b-ud", (0, n.height, n.width, n.height * 2))):
    q.crop(bx).save(f"{Q}/render/{nm}.final.png", "PNG", optimize=True, compress_level=9)
```

**3 — the runnable form**, which is the gap this standard closes. Reproduces both files
byte-for-byte and proves determinism across repeated clean runs:

```bash
Q="/Users/bruce/Project Studio - Art Source Quarantine"
python3 scripts/art/authored-asset-pipeline.py verify \
  --normal "$Q/render/s-stage-b.png" --worn "$Q/render/s-stage-b-ud.png" \
  --stem b-stage-b --runs 3 \
  --expect-normal adf413c8f88fb9aa040bcc5cdbdcdf83451d25ca74b183272b47d8064c2daa35 \
  --expect-worn   3f3dc5544f6cf4cfbe40097fa28c107d66d7739807399015988f67e09bdf4347
```

**Result: PASS.** Three runs into clean temporary directories; identical SHA-256, byte count
(10,254 / 9,032), dimensions (512×374), `PLTE` and `tRNS` on every run, and identical to the
committed production objects. The palette and `tRNS` hashes are the same across *both*
finishes, which is the shared-palette property proved rather than asserted. The production
copies were read for comparison only and were not written to.

## D. The `.blend` sources

The `.blend` files, render intermediates and every acquired source archive stay **outside**
this repository, in the art quarantine. Blender audit of the final source scene: 0 image
datablocks, 0 linked libraries, 0 texture nodes. See the Stage B provenance document.
