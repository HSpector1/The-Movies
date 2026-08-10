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


# ── cli ──────────────────────────────────────────────────────────────────────
def _pair(text: str) -> tuple[int, int]:
    a, b = text.split(",")
    return int(a), int(b)


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
