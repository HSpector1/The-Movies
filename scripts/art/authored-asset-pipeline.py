#!/usr/bin/env python3
"""Deterministic final-output quantisation and value measurement for authored
environment art.

This is the *export and acceptance* instrument for the authored-building pipeline
(`docs/art/AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md`). It is deliberately narrow:

  * it does NOT model, render, bake or orchestrate Blender;
  * it does NOT generate buildings or batch art;
  * it owns exactly two things — turning a pre-quantisation render pair into the
    shipped PNG-8 pair *reproducibly*, and measuring the shipped pair in the one
    canonical representation space the standard is defined in.

Every acceptance number the standard governs is measured on the FINAL OPTIMIZED /
QUANTIZED asset — never on a Blender light value, a source material constant or a
pre-quantisation render. See lesson **AU**.

Subcommands
-----------
  quantize   pre-quantisation render pair -> shipped PNG-8 pair (shared palette)
  verify     quantize repeatedly into clean temp dirs; prove run-to-run and
             against-production byte identity
  measure    canonical displayed-luma face ratio + distinct-colour census on a
             final optimized asset

Requires Pillow. Reference environment is recorded by every command in its
manifest, because byte-identical output depends on it.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import shutil
import struct
import sys
import tempfile
import zlib

try:
    import numpy as np
    from PIL import Image
except ImportError as exc:  # pragma: no cover - environment problem, not logic
    sys.exit(f"authored-asset-pipeline: missing dependency ({exc}). Needs Pillow and numpy.")

import PIL

# ── the quantisation contract ────────────────────────────────────────────────
# These are not tunables. They are the settings the accepted production Stage B
# pair was exported with, recovered from the proof session's own commands and
# re-proven byte-identical. Changing any of them changes the shipped bytes.
QUANT_COLORS = 128                       # palette size requested of the quantiser
QUANT_METHOD_NAME = "FASTOCTREE"         # PIL.Image.Quantize.FASTOCTREE (method 2)
QUANT_COMPRESS_LEVEL = 9                 # zlib level -> IDAT zlib header 0x78da
QUANT_OPTIMIZE = True                    # Pillow PNG optimize pass
STACK_ORDER = ("normal", "worn")         # normal on top, worn below — palette input order

# The environment the accepted production bytes were produced under, and under
# which this tool has been proven to reproduce them.
REFERENCE_ENV = {
    "pillow": "12.3.0",
    "python": "3.14",
    "zlib_runtime": "1.2.12",
    "pillow_zlib": "zlib-ng 2.3.3",
    "libimagequant": False,  # NOT installed, and must not be — it would change the palette
}

# Rec.601 luma coefficients, applied to 8-bit ENCODED (non-linear) sRGB values.
# This is the canonical displayed-value space for authored environment acceptance.
# Rationale, alternatives considered and the linear-light trap are in the standard.
LUMA_601 = (0.299, 0.587, 0.114)


def displayed_luma(r: float, g: float, b: float) -> float:
    """Canonical displayed luma: Rec.601 over encoded sRGB, 0..255.

    NOT linearised. The governed relationships describe how the asset *reads on
    screen*, and the screen values are the encoded values. Linearising first
    changes a 0.8737 relationship into 0.7408 — a different quantity wearing the
    same number, which is exactly the failure lesson AU records.
    """
    return LUMA_601[0] * r + LUMA_601[1] * g + LUMA_601[2] * b


def _env() -> dict:
    return {
        "pillow": PIL.__version__,
        "python": platform.python_version(),
        "zlib_runtime": zlib.ZLIB_RUNTIME_VERSION,
        "numpy": np.__version__,
        "platform": platform.platform(),
        "libimagequant": _has_libimagequant(),
    }


def _has_libimagequant() -> bool:
    try:
        from PIL import features

        return bool(features.check_feature("libimagequant"))
    except Exception:
        return False


def _sha256(path: str) -> str:
    with open(path, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def _png_chunks(path: str) -> dict:
    """Concatenated chunk payloads by type — enough to prove palette identity."""
    data = open(path, "rb").read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG")
    out: dict[str, bytes] = {}
    i = 8
    while i < len(data):
        (length,) = struct.unpack(">I", data[i : i + 4])
        typ = data[i + 4 : i + 8].decode("latin1")
        out[typ] = out.get(typ, b"") + data[i + 8 : i + 8 + length]
        i += 8 + length + 4
    return out


def _describe(path: str) -> dict:
    im = Image.open(path)
    chunks = _png_chunks(path)
    plte = chunks.get("PLTE", b"")
    trns = chunks.get("tRNS", b"")
    alpha = np.array(im.convert("RGBA"))[:, :, 3]
    return {
        "path": path,
        "bytes": os.path.getsize(path),
        "sha256": _sha256(path),
        "size": list(im.size),
        "mode": im.mode,
        "png_color_type": "3 (palette)" if im.mode == "P" else im.mode,
        "palette_entries": len(plte) // 3,
        "trns_entries": len(trns),
        "palette_sha256": hashlib.sha256(plte).hexdigest(),
        "trns_sha256": hashlib.sha256(trns).hexdigest(),
        "chunks": sorted(set(_chunk_types(path))),
        "alpha_zero_px": int((alpha == 0).sum()),
        "alpha_opaque_px": int((alpha == 255).sum()),
        "alpha_soft_px": int(((alpha >= 1) & (alpha <= 249)).sum()),
    }


def _chunk_types(path: str) -> list[str]:
    data = open(path, "rb").read()
    types, i = [], 8
    while i < len(data):
        (length,) = struct.unpack(">I", data[i : i + 4])
        types.append(data[i + 4 : i + 8].decode("latin1"))
        i += 8 + length + 4
    return types


# ── quantize ─────────────────────────────────────────────────────────────────
def quantize(normal_src: str, worn_src: str, out_dir: str, stem: str) -> dict:
    """Export the shipped PNG-8 pair from a pre-quantisation RGBA render pair.

    ONE palette is derived from BOTH finishes at once. The two renders are stacked
    into a single tall RGBA strip (normal on top, worn below), the strip is
    quantised once, and each finish is cropped back out of the quantised strip. The
    pair therefore cannot differ by a stray alpha pixel — a difference that would
    otherwise read as a geometry delta between the two finishes when the geometry
    is byte-identical by construction.

    Alpha is quantised as a fourth channel, not thresholded or flattened: the
    palette carries per-entry alpha and the encoder writes it as tRNS. No dithering
    is applied — Pillow's `dither` argument governs only the `palette=` mapping
    path, which this pipeline does not use; FASTOCTREE assigns nearest-colour with
    no error diffusion. Dithering would scatter isolated palette indices through
    flat fields and break the flat-shaded look the destination art requires.
    """
    normal = Image.open(normal_src).convert("RGBA")
    worn = Image.open(worn_src).convert("RGBA")
    if normal.size != worn.size:
        raise SystemExit(
            f"source pair differs in size: {normal.size} vs {worn.size} — the shared-palette "
            "strip requires an identical canvas for both finishes"
        )
    w, h = normal.size

    strip = Image.new("RGBA", (w, h * 2))
    strip.paste(normal, (0, 0))
    strip.paste(worn, (0, h))
    quantised = strip.quantize(colors=QUANT_COLORS, method=Image.Quantize.FASTOCTREE)

    os.makedirs(out_dir, exist_ok=True)
    written = {}
    for finish, box in (
        ("normal", (0, 0, w, h)),
        ("worn", (0, h, w, h * 2)),
    ):
        name = f"{stem}.png" if finish == "normal" else f"{stem}-ud.png"
        path = os.path.join(out_dir, name)
        quantised.crop(box).save(
            path, "PNG", optimize=QUANT_OPTIMIZE, compress_level=QUANT_COMPRESS_LEVEL
        )
        written[finish] = _describe(path)

    return {
        "tool": "scripts/art/authored-asset-pipeline.py quantize",
        "contract": {
            "colors": QUANT_COLORS,
            "method": QUANT_METHOD_NAME,
            "palette": "shared — one palette derived from both finishes stacked into one strip",
            "stack_order": list(STACK_ORDER),
            "color_mode": "source RGBA -> PNG-8 palette (PNG colour type 3) + tRNS",
            "alpha": "quantised as a 4th channel; per-entry alpha written as tRNS; not thresholded",
            "dither": "none (FASTOCTREE nearest-colour; Pillow's dither= applies only to palette= mapping)",
            "optimize": QUANT_OPTIMIZE,
            "compress_level": QUANT_COMPRESS_LEVEL,
        },
        "sources": {
            "normal": {"path": normal_src, "sha256": _sha256(normal_src), "size": [w, h]},
            "worn": {"path": worn_src, "sha256": _sha256(worn_src), "size": list(worn.size)},
        },
        "outputs": written,
        "environment": _env(),
        "reference_environment": REFERENCE_ENV,
    }


# ── measure ──────────────────────────────────────────────────────────────────
def measure(
    path: str,
    lit_x: tuple[int, int],
    shadow_x: tuple[int, int],
    band_y: tuple[int, int],
    alpha_floor: int,
    luma_floor: float,
) -> dict:
    """Canonical displayed-value measurement of a FINAL OPTIMIZED asset.

    The two wall planes are large flat fields, so the *modal* tone inside each
    face's wall band is exactly the governed surface — immune to doors, cornice,
    mullions, signage and every anti-aliased edge. A luma floor keeps the door,
    trim and glazing (which sit far below the stucco) from ever winning the mode.
    """
    rgba = np.array(Image.open(path).convert("RGBA"))
    opaque = rgba[:, :, 3] > alpha_floor
    rgb = rgba[:, :, :3].astype(int)

    faces = {}
    for name, (x0, x1) in (("lit", lit_x), ("shadow", shadow_x)):
        region = rgb[band_y[0] : band_y[1], x0:x1]
        mask = opaque[band_y[0] : band_y[1], x0:x1]
        values = region[mask]
        lum = displayed_luma(values[:, 0], values[:, 1], values[:, 2])
        values = values[lum >= luma_floor]
        if len(values) == 0:
            raise SystemExit(f"{path}: no pixels above luma floor {luma_floor} in the {name} band")
        colours, counts = np.unique(values, axis=0, return_counts=True)
        tone = colours[np.argmax(counts)]
        faces[name] = {
            "hex": "#%02x%02x%02x" % tuple(int(c) for c in tone),
            "rgb": [int(c) for c in tone],
            "displayed_luma": round(float(displayed_luma(*[float(c) for c in tone])), 4),
            "modal_px": int(counts.max()),
        }

    ratio = faces["shadow"]["displayed_luma"] / faces["lit"]["displayed_luma"]

    # distinct-colour census — reported at every threshold, so the figure can never
    # again be quoted without the definition that produced it. The standard's
    # headline number is the one at the alpha floor this run measured with.
    census = {"definition": f"distinct RGB triples over pixels with alpha > N, on this asset"}
    for threshold in sorted({0, 128, 200, 250, alpha_floor}):
        sel = rgb[rgba[:, :, 3] > threshold]
        census[f"alpha_gt_{threshold}"] = int(len(np.unique(sel, axis=0)))
    census["headline_alpha_floor"] = alpha_floor

    alpha = rgba[:, :, 3]
    non_zero = int((alpha > 0).sum())
    soft = int(((alpha >= 1) & (alpha <= 249)).sum())

    return {
        "tool": "scripts/art/authored-asset-pipeline.py measure",
        "asset": _describe(path),
        "measurement_space": {
            "formula": "Rec.601 luma over 8-bit ENCODED sRGB",
            "coefficients": list(LUMA_601),
            "linearised": False,
            "authority": "final optimized / quantised asset",
        },
        "window": {
            "lit_x": list(lit_x),
            "shadow_x": list(shadow_x),
            "band_y": list(band_y),
            "alpha_floor": alpha_floor,
            "luma_floor": luma_floor,
            "statistic": "modal tone within the wall band",
        },
        "faces": faces,
        "shadow_to_lit_ratio": round(ratio, 4),
        "distinct_colours": census,
        "soft_edge": {
            "alpha_1_to_249_px": soft,
            "non_zero_alpha_px": non_zero,
            "percent_of_non_zero": round(100.0 * soft / non_zero, 2) if non_zero else None,
            "percent_of_canvas": round(100.0 * soft / alpha.size, 2),
        },
    }


def family_target(lit_hex: str, shadow_hex: str) -> dict:
    """The family-derived relational target, from the two palette constants."""
    lit = tuple(int(lit_hex.lstrip("#")[i : i + 2], 16) for i in (0, 2, 4))
    shadow = tuple(int(shadow_hex.lstrip("#")[i : i + 2], 16) for i in (0, 2, 4))
    ll, ls = displayed_luma(*lit), displayed_luma(*shadow)
    return {
        "lit": {"hex": "#%02x%02x%02x" % lit, "displayed_luma": round(ll, 4)},
        "shadow": {"hex": "#%02x%02x%02x" % shadow, "displayed_luma": round(ls, 4)},
        "target_ratio": round(ls / ll, 4),
    }


# ── verify ───────────────────────────────────────────────────────────────────
def verify(normal_src: str, worn_src: str, stem: str, expect: dict, runs: int) -> dict:
    """Quantise `runs` times into clean temporary directories and compare.

    Nothing under version control is written or touched. Production copies are read
    only if `expect` was supplied as file paths by the caller.
    """
    results = []
    for run in range(runs):
        tmp = tempfile.mkdtemp(prefix=f"authored-asset-verify-{run}-")
        try:
            manifest = quantize(normal_src, worn_src, tmp, stem)
            results.append(
                {
                    "run": run + 1,
                    "normal": manifest["outputs"]["normal"],
                    "worn": manifest["outputs"]["worn"],
                }
            )
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    checks = {}
    for finish in ("normal", "worn"):
        hashes = {r[finish]["sha256"] for r in results}
        sizes = {r[finish]["bytes"] for r in results}
        dims = {tuple(r[finish]["size"]) for r in results}
        palettes = {r[finish]["palette_sha256"] for r in results}
        trns = {r[finish]["trns_sha256"] for r in results}
        checks[finish] = {
            "runs": runs,
            "sha256": sorted(hashes),
            "run_to_run_identical": len(hashes) == 1
            and len(sizes) == 1
            and len(dims) == 1
            and len(palettes) == 1
            and len(trns) == 1,
            "bytes": sorted(sizes),
            "dimensions": [list(d) for d in sorted(dims)],
            "palette_sha256": sorted(palettes),
            "trns_sha256": sorted(trns),
            "expected_sha256": expect.get(finish),
            "matches_production": (expect.get(finish) in hashes) if expect.get(finish) else None,
        }

    ok = all(c["run_to_run_identical"] for c in checks.values()) and all(
        c["matches_production"] is not False for c in checks.values()
    )
    return {
        "tool": "scripts/art/authored-asset-pipeline.py verify",
        "sources": {"normal": normal_src, "worn": worn_src},
        "checks": checks,
        "environment": _env(),
        "reference_environment": REFERENCE_ENV,
        "result": "PASS" if ok else "FAIL",
    }


# ── rgba-export — THE CURRENT PRODUCTION AUTHORED-ART EXPORT ─────────────────
#
# Recovered from the adoption pack that produced the shipped Stage B pair at `fdfdfea`,
# and re-proven byte-identical against the committed production objects. This is the
# FORWARD path for authored environment art. The PNG-8 `quantize` above is retained for
# diagnostics, measurement and historical reproduction only.
#
# The shape of it: cluster the RGB channel of the OPAQUE-ish pixels to K colours, write
# the result back into a TRUECOLOUR RGBA PNG (colour type 6), and never touch alpha.
# Because the image is not indexed, alpha is not forced through a shared palette, so it
# survives byte-exactly — which is the whole reason production moved here. True PNG-8
# has to encode RGB and alpha jointly in one 256-entry table, and that is what averaged
# the 1-px silhouette rim and posterised tonal ramps.
#
# Each finish is exported INDEPENDENTLY. The finishes do not share a palette, and they do
# not need to: alpha is carried losslessly, so the pair's hit area cannot drift apart the
# way the PNG-8 pair's did.
RGBA_COLORS = 128            # target unique RGB values among alpha>0 pixels
RGBA_KMEANS_SEED = 7         # fixed — the k-means++ seeding draw is what makes this deterministic
RGBA_KMEANS_ITERS = 60
RGBA_COMPRESS_LEVEL = 9
RGBA_OPTIMIZE = True
RGBA_PROTECT_MINPX = 250     # a field must cover this many px to be protectable
RGBA_PROTECT_TOL = 3.0       # ...and land within this of an authored target tone
RGBA_REPAIR_ROUNDS = 4
RGBA_SOOT = (13, 12, 11)     # the worn pass blends toward this
RGBA_DULL_STEPS = (0.18, 0.30)  # large fields / glazing, mirroring assets.ts D() and G()


def _rgba_load(path: str):
    return np.array(Image.open(path).convert("RGBA")).astype(int)


def _dull_toward_soot(rgb, amount: float):
    return [int(round(v + (s - v) * amount)) for v, s in zip(rgb, RGBA_SOOT)]


def _protected_colours(cols, counts, protect_hex: list[str]):
    """Rendered colours that ARE an authored field rather than an anti-aliased blend.

    Two authored fields merging into one entry is a VISIBLE defect; a blend pixel
    drifting is not. Both finishes are covered, because a worn field is its normal
    colour dulled toward soot. Returns an empty (0,3) array when nothing qualifies.
    """
    if not protect_hex:
        return np.zeros((0, 3))
    tgt = []
    for h in protect_hex:
        v = int(h.lstrip("#"), 16)
        c = [(v >> 16) & 255, (v >> 8) & 255, v & 255]
        tgt.append(c)
        tgt += [_dull_toward_soot(c, d) for d in RGBA_DULL_STEPS]
    tgt = np.array(tgt, float)
    keep: list = []
    for i in np.argsort(-counts):
        if counts[i] < RGBA_PROTECT_MINPX:
            break
        c = cols[i].astype(float)
        if np.abs(c - tgt).max(1).min() > RGBA_PROTECT_TOL:
            continue
        if any(np.abs(c - k).max() <= 2 for k in keep):
            continue
        keep.append(c)
    return np.array(keep, float).reshape(-1, 3)


def _kmeans(colours, counts, k: int):
    """Count-weighted k-means with k-means++ seeding on a FIXED rng draw."""
    rng = np.random.default_rng(RGBA_KMEANS_SEED)
    n = len(colours)
    if k >= n:
        return colours.copy(), np.arange(n)
    cent = [colours[int(np.argmax(counts))]]
    d2 = ((colours - cent[0]) ** 2).sum(1)
    for _ in range(k - 1):
        p = d2 * counts
        s = p.sum()
        cent.append(colours[int(rng.integers(n))] if s <= 0 else
                    colours[int(np.searchsorted(np.cumsum(p / s), rng.random()))])
        d2 = np.minimum(d2, ((colours - cent[-1]) ** 2).sum(1))
    cent = np.array(cent, float)
    for _ in range(RGBA_KMEANS_ITERS):
        lab = ((colours[:, None, :] - cent[None]) ** 2).sum(2).argmin(1)
        new = cent.copy()
        for j in range(k):
            mk = lab == j
            if counts[mk].sum() > 0:
                new[j] = (colours[mk] * counts[mk, None]).sum(0) / counts[mk].sum()
        if np.allclose(new, cent):
            cent = new
            break
        cent = new
    cent = np.round(cent)
    return cent, ((colours[:, None, :] - cent[None]) ** 2).sum(2).argmin(1)


def _fit(cols, counts, pin, k: int):
    p = len(pin)
    if p == 0:
        return _kmeans(cols, counts, k)
    free, _ = _kmeans(cols, counts, k - p)
    cent = np.vstack([pin, free])
    for _ in range(RGBA_KMEANS_ITERS):
        lab = ((cols[:, None, :] - cent[None]) ** 2).sum(2).argmin(1)
        new = cent.copy()
        for j in range(p, k):
            m = lab == j
            if counts[m].sum() > 0:
                new[j] = (cols[m] * counts[m, None]).sum(0) / counts[m].sum()
        if np.allclose(new, cent):
            break
        cent = new
    cent = np.round(cent)
    return cent, ((cols[:, None, :] - cent[None]) ** 2).sum(2).argmin(1)


def _palette_for(cols, counts, k: int, protect_hex: list[str]):
    """Adaptive repair, not blanket pinning.

    Fit normally, then pin ONLY the authored fields that are actually damaged — displaced
    beyond tolerance, or two distinct fields collapsed onto one entry — and refit. Blanket
    pinning every named field spends the budget and makes everything else noisier.
    """
    prot = _protected_colours(cols, counts, protect_hex)
    pin = np.zeros((0, 3))
    for _ in range(RGBA_REPAIR_ROUNDS):
        cent, lab = _fit(cols, counts, pin, k)
        if len(prot) == 0:
            return cent, lab, 0
        pl = ((prot[:, None, :] - cent[None]) ** 2).sum(2).argmin(1)
        err = np.sqrt(((prot - cent[pl]) ** 2).sum(1))
        bad = set(np.where(err > RGBA_PROTECT_TOL)[0].tolist())
        for e in set(pl.tolist()):
            grp = np.where(pl == e)[0]
            if len(grp) > 1:
                spread = np.sqrt(((prot[grp][:, None, :] - prot[grp][None]) ** 2).sum(2)).max()
                if spread > RGBA_PROTECT_TOL:
                    bad |= set(grp.tolist()[1:])
        want = sorted(bad)
        if not want or len(want) + len(pin) > k // 2:
            return cent, lab, len(pin)
        pin = np.unique(np.vstack([pin, prot[want]]), axis=0)
    return cent, lab, len(pin)


def rgba_export_one(src: str, dst: str, colours: int, protect_hex: list[str]) -> dict:
    """Truecolour RGBA (colour type 6), RGB reduced to `colours`, alpha untouched."""
    im = _rgba_load(src)
    a, rgb = im[..., 3], im[..., :3]
    m = a > 0
    cols, counts = np.unique(rgb[m].reshape(-1, 3), axis=0, return_counts=True)
    cent, lab, pins = _palette_for(cols.astype(float), counts.astype(float), colours, protect_hex)
    cent = np.clip(cent, 0, 255).astype(np.uint8)
    lut = {tuple(c): int(l) for c, l in zip(cols.tolist(), lab.tolist())}
    out = im.astype(np.uint8).copy()
    out[..., :3][~m] = 0          # transparent RGB normalised, so it cannot cost palette entries
    out[..., :3][m] = cent[np.array([lut[tuple(c)] for c in rgb[m].tolist()])]
    Image.fromarray(out, "RGBA").save(dst, "PNG", optimize=RGBA_OPTIMIZE,
                                      compress_level=RGBA_COMPRESS_LEVEL)
    back = np.array(Image.open(dst).convert("RGBA")).astype(int)
    err = np.sqrt(((back[..., :3] - rgb) ** 2).sum(2))[a == 255]
    d = _describe(dst)
    d.update({
        "source_sha256": _sha256(src),
        "colours_requested": colours,
        "distinct_rgb_alpha_gt_0": int(len(np.unique(back[..., :3][m].reshape(-1, 3), axis=0))),
        "alpha_bit_exact_vs_source": bool((back[..., 3] == a).all()),
        "protected_fields_found": int(len(_protected_colours(
            cols.astype(float), counts.astype(float), protect_hex))),
        "pins_applied": int(pins),
        "colour_err_mean": round(float(err.mean()), 3) if err.size else 0.0,
        "colour_err_max": round(float(err.max()), 2) if err.size else 0.0,
    })
    return d


def rgba_export(normal_src: str, worn_src: str, out_dir: str, stem: str,
                colours: int, protect_hex: list[str]) -> dict:
    """Export a finish pair. Each finish is reduced INDEPENDENTLY — see the note above."""
    os.makedirs(out_dir, exist_ok=True)
    n = rgba_export_one(normal_src, os.path.join(out_dir, f"{stem}.png"), colours, protect_hex)
    w = rgba_export_one(worn_src, os.path.join(out_dir, f"{stem}-ud.png"), colours, protect_hex)
    an = np.array(Image.open(os.path.join(out_dir, f"{stem}.png")).convert("RGBA"))[..., 3]
    aw = np.array(Image.open(os.path.join(out_dir, f"{stem}-ud.png")).convert("RGBA"))[..., 3]
    clickable = int((((an > 0) != (aw > 0)).sum()))
    return {
        "tool": "scripts/art/authored-asset-pipeline.py rgba-export",
        "contract": {
            "png_colour_type": "6 (truecolour RGBA) — NOT indexed, no PLTE, no tRNS",
            "rgb_reduction": f"count-weighted k-means to {colours} colours, k-means++ seeding, "
                             f"fixed seed {RGBA_KMEANS_SEED}, {RGBA_KMEANS_ITERS} iterations, "
                             "centroids rounded",
            "rgb_space": "8-bit ENCODED sRGB — clustering is done on stored byte values",
            "clustered_pixels": "alpha > 0 only",
            "transparent_rgb": "normalised to 0",
            "pair_processing": "INDEPENDENT — the finishes do not share a palette",
            "alpha": "UNTOUCHED — never clustered, thresholded, remapped or averaged",
            "dither": "none",
            "optimize": RGBA_OPTIMIZE,
            "compress_level": RGBA_COMPRESS_LEVEL,
            "protected_fields": "adaptive repair only; pins authored tones that the fit "
                                "displaced or collapsed. Inert when nothing is damaged.",
        },
        "outputs": {"normal": n, "worn": w},
        "pair": {
            "alpha_value_delta_px": int((an.astype(int) != aw.astype(int)).sum()),
            "clickable_mask_delta_px": clickable,
            "clickable_rule": "alpha > 0 — exactly what setInteractive alphaTolerance:1 selects",
        },
        "environment": _env(),
    }


def rgba_verify(normal_src: str, worn_src: str, stem: str, expect: dict,
                runs: int, colours: int, protect_hex: list[str]) -> dict:
    """Repeat the export into clean temp dirs. Writes nothing under version control."""
    seen: dict[str, list] = {"normal": [], "worn": []}
    for _ in range(max(1, runs)):
        tmp = tempfile.mkdtemp(prefix="rgba-export-verify-")
        try:
            rep = rgba_export(normal_src, worn_src, tmp, stem, colours, protect_hex)
            for key in ("normal", "worn"):
                o = rep["outputs"][key]
                seen[key].append((o["sha256"], o["bytes"], tuple(o["size"]),
                                  o["alpha_bit_exact_vs_source"]))
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
    checks, ok = {}, True
    for key in ("normal", "worn"):
        uniq = sorted(set(seen[key]))
        identical = len(uniq) == 1
        want = expect.get(key)
        matches = None if not want else uniq[0][0] == want
        ok = ok and identical and (matches is not False) and uniq[0][3]
        checks[key] = {
            "runs": len(seen[key]),
            "sha256": sorted({s for s, _, _, _ in seen[key]}),
            "run_to_run_identical": identical,
            "bytes": sorted({b for _, b, _, _ in seen[key]}),
            "dimensions": [list(d) for d in sorted({d for _, _, d, _ in seen[key]})],
            "alpha_bit_exact_vs_source": all(x[3] for x in seen[key]),
            "expected_sha256": want,
            "matches_production": matches,
        }
    return {
        "tool": "scripts/art/authored-asset-pipeline.py rgba-verify",
        "sources": {"normal": normal_src, "worn": worn_src},
        "checks": checks,
        "environment": _env(),
        "result": "PASS" if ok else "FAIL",
    }


# ── cli ──────────────────────────────────────────────────────────────────────
def _pair(text: str) -> tuple[int, int]:
    a, b = text.split(",")
    return int(a), int(b)


def _protect_list(text: str | None) -> list[str]:
    return [t.strip() for t in text.split(",") if t.strip()] if text else []


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="authored-asset-pipeline",
        description="Deterministic final-output quantisation and value measurement for authored environment art.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    q = sub.add_parser("quantize", help="export the shipped PNG-8 pair from a render pair")
    q.add_argument("--normal", required=True, help="pre-quantisation RGBA render, normal finish")
    q.add_argument("--worn", required=True, help="pre-quantisation RGBA render, worn finish")
    q.add_argument("--out-dir", required=True)
    q.add_argument("--stem", required=True, help="output stem, e.g. b-stage-b (worn becomes <stem>-ud)")

    v = sub.add_parser("verify", help="prove run-to-run and against-production byte identity")
    v.add_argument("--normal", required=True)
    v.add_argument("--worn", required=True)
    v.add_argument("--stem", required=True)
    v.add_argument("--expect-normal", help="sha256 the normal finish must reproduce")
    v.add_argument("--expect-worn", help="sha256 the worn finish must reproduce")
    v.add_argument("--runs", type=int, default=2)

    r = sub.add_parser(
        "rgba-export",
        help="CURRENT production path: truecolour RGBA, RGB reduced, alpha lossless",
    )
    r.add_argument("--normal", required=True, help="raw RGBA render, normal finish")
    r.add_argument("--worn", required=True, help="raw RGBA render, worn finish")
    r.add_argument("--out-dir", required=True)
    r.add_argument("--stem", required=True, help="output stem (worn becomes <stem>-ud)")
    r.add_argument("--colours", type=int, default=RGBA_COLORS)
    r.add_argument("--protect", help="comma-separated authored tones, e.g. e1d2ad,d3c19c — "
                                     "adaptive repair only; inert unless a field is damaged")

    rv = sub.add_parser("rgba-verify", help="prove rgba-export determinism and byte identity")
    rv.add_argument("--normal", required=True)
    rv.add_argument("--worn", required=True)
    rv.add_argument("--stem", required=True)
    rv.add_argument("--expect-normal", help="sha256 the normal finish must reproduce")
    rv.add_argument("--expect-worn", help="sha256 the worn finish must reproduce")
    rv.add_argument("--runs", type=int, default=3)
    rv.add_argument("--colours", type=int, default=RGBA_COLORS)
    rv.add_argument("--protect")

    m = sub.add_parser("measure", help="canonical displayed-luma measurement of a final asset")
    m.add_argument("png", help="the FINAL optimized / quantised asset")
    m.add_argument("--lit-x", type=_pair, default=(0, 232), help="x0,x1 of the lit wall band")
    m.add_argument("--shadow-x", type=_pair, default=(280, 512), help="x0,x1 of the shadow wall band")
    m.add_argument("--band-y", type=_pair, default=(280, 360), help="y0,y1 between cornice and base")
    m.add_argument("--alpha-floor", type=int, default=200)
    m.add_argument("--luma-floor", type=float, default=140.0)
    m.add_argument("--lit-tone", help="family lit palette constant, e.g. e1d2ad")
    m.add_argument("--shadow-tone", help="family shadow palette constant, e.g. c9b78e")
    m.add_argument("--tolerance", type=float, default=0.015, help="allowed |measured - family target|")

    args = parser.parse_args(argv)

    if args.cmd == "quantize":
        print(json.dumps(quantize(args.normal, args.worn, args.out_dir, args.stem), indent=2))
        return 0

    if args.cmd == "verify":
        expect = {"normal": args.expect_normal, "worn": args.expect_worn}
        report = verify(args.normal, args.worn, args.stem, expect, args.runs)
        print(json.dumps(report, indent=2))
        return 0 if report["result"] == "PASS" else 1

    if args.cmd == "rgba-export":
        print(json.dumps(rgba_export(args.normal, args.worn, args.out_dir, args.stem,
                                     args.colours, _protect_list(args.protect)), indent=2))
        return 0

    if args.cmd == "rgba-verify":
        expect = {"normal": args.expect_normal, "worn": args.expect_worn}
        report = rgba_verify(args.normal, args.worn, args.stem, expect, args.runs,
                             args.colours, _protect_list(args.protect))
        print(json.dumps(report, indent=2))
        return 0 if report["result"] == "PASS" else 1

    report = measure(
        args.png, args.lit_x, args.shadow_x, args.band_y, args.alpha_floor, args.luma_floor
    )
    if args.lit_tone and args.shadow_tone:
        target = family_target(args.lit_tone, args.shadow_tone)
        deviation = abs(report["shadow_to_lit_ratio"] - target["target_ratio"])
        report["family_target"] = target
        report["family_check"] = {
            "tolerance": args.tolerance,
            "deviation": round(deviation, 4),
            "result": "PASS" if deviation <= args.tolerance else "FAIL",
        }
    print(json.dumps(report, indent=2))
    if "family_check" in report and report["family_check"]["result"] == "FAIL":
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
