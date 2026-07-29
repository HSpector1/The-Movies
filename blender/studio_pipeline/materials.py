"""Coherent PBR material library — export-safe by construction.

glTF only carries the metallic-roughness model (constant factors + image maps + a vertex
COLOR_0 attribute). So every material here is a Principled BSDF wired ONLY with things that
survive glTF export:
  * constant base_color / metallic / roughness            -> pbrMetallicRoughness factors
  * an optional "Col" vertex-colour multiply              -> COLOR_0 attribute
  * optional tileable image maps (base / roughness / normal), generated procedurally with
    numpy (deterministic, tileable via sine-sum fields) and saved as PNG. No bake step.
"""
import numpy as np
import bpy
from . import config

_TEX_SEED = 20260729  # fixed -> deterministic maps


# ---------------------------------------------------------------- image maps
def _new_image(name, arr, non_color=False):
    """arr: float HxWx4 in 0..1. Returns a saved bpy image under STUDIO_OUT/textures/."""
    h, w, _ = arr.shape
    img = bpy.data.images.get(name)
    if img is None:
        img = bpy.data.images.new(name, width=w, height=h, alpha=False)
    # Blender image rows are bottom-up; author arrays top-row-first -> flip so they land upright.
    img.pixels.foreach_set(arr[::-1].reshape(-1).astype("float32"))
    if non_color:
        img.colorspace_settings.name = "Non-Color"
    tex_dir = config.STUDIO_OUT / "textures"
    tex_dir.mkdir(parents=True, exist_ok=True)
    img.filepath_raw = str(tex_dir / f"{name}.png")
    img.file_format = "PNG"
    img.save()
    return img


def _grid(size):
    xs = np.linspace(0.0, 1.0, size, endpoint=False)
    return np.meshgrid(xs, xs)


def _tileable_noise(size, octaves=4, seed=_TEX_SEED):
    """Deterministic tileable scalar field in 0..1 built from integer-frequency sine waves."""
    rng = np.random.default_rng(seed)
    u, v = _grid(size)
    acc = np.zeros((size, size))
    amp = 1.0
    total = 0.0
    for o in range(octaves):
        freq = 2 ** (o + 1)
        px = rng.uniform(0, 2 * np.pi)
        py = rng.uniform(0, 2 * np.pi)
        acc += amp * (np.sin(2 * np.pi * freq * u + px) * np.sin(2 * np.pi * freq * v + py))
        total += amp
        amp *= 0.55
    acc = acc / total
    return (acc - acc.min()) / (acc.max() - acc.min() + 1e-9)


def _normal_from_height(height, strength=1.0):
    """Tangent-space normal map (0..1 RGBA) from a tileable height field via wrap gradients."""
    gy, gx = np.gradient(height)
    gx = np.roll(gx, 0, axis=1) * strength
    gy = gy * strength
    nz = np.ones_like(height)
    length = np.sqrt(gx * gx + gy * gy + nz * nz)
    nx, ny, nz = -gx / length, -gy / length, nz / length
    out = np.stack([nx * 0.5 + 0.5, ny * 0.5 + 0.5, nz * 0.5 + 0.5, np.ones_like(nx)], axis=-1)
    return out


def _scalar_rgba(field):
    return np.stack([field, field, field, np.ones_like(field)], axis=-1)


def gen_texture_maps(size=256):
    """Generate the shared tileable map set once. Returns {name: {kind: image}}."""
    maps = {}
    # corrugated metal: vertical ridges -> strong directional normal + mid roughness
    u, v = _grid(size)
    ridges = 0.5 + 0.5 * np.sin(2 * np.pi * 16 * u)
    maps["corrugated_metal"] = {
        "normal": _new_image("corrugated_metal_n", _normal_from_height(ridges, 3.0), non_color=True),
        "rough": _new_image("corrugated_metal_r", _scalar_rgba(0.35 + 0.25 * ridges), non_color=True),
    }
    # concrete apron: fine tileable noise
    cn = _tileable_noise(size, octaves=5, seed=_TEX_SEED + 1)
    maps["concrete"] = {
        "normal": _new_image("concrete_n", _normal_from_height(cn, 1.2), non_color=True),
        "rough": _new_image("concrete_r", _scalar_rgba(0.7 + 0.25 * cn), non_color=True),
    }
    # stucco: very fine noise, subtle
    sn = _tileable_noise(size, octaves=6, seed=_TEX_SEED + 2)
    maps["stucco"] = {
        "normal": _new_image("stucco_n", _normal_from_height(sn, 0.7), non_color=True),
        "rough": _new_image("stucco_r", _scalar_rgba(0.8 + 0.15 * sn), non_color=True),
    }
    # brick: running-bond albedo + normal (mortar recessed)
    brick = _brick_fields(size)
    maps["brick"] = {
        "color": _new_image("brick_c", brick["color"]),
        "normal": _new_image("brick_n", _normal_from_height(brick["height"], 2.0), non_color=True),
        "rough": _new_image("brick_r", _scalar_rgba(0.75 + 0.15 * brick["mortar"]), non_color=True),
    }
    return maps


def face_texture(name, skin, hair, seed=1, mustache=False, brow_h=0.62, size=256):
    """A small painted crew face (skin base + hairline + brows + eye almonds + nose/mouth).

    Deterministic (seeded). Planar-projected onto the head front card. Reads at sim distance;
    no eyeball/lid geometry. Returns a saved sRGB image.
    """
    rng = np.random.default_rng(seed)
    img = np.ones((size, size, 4))
    skin = np.array(skin)
    img[..., :3] = skin
    yy, xx = np.mgrid[0:size, 0:size] / size          # y=0 top .. 1 bottom, x=0 left..1 right
    # subtle vertical shading (forehead lighter, jaw warmer)
    img[..., :3] *= (1.02 - 0.10 * yy)[..., None]
    def band(cx, cy, rx, ry, col, soft=0.02):
        d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
        m = np.clip(1.0 - (d - 1.0) / (soft * 8 + 1e-6), 0, 1)
        m = (d < 1.0).astype(float) * 0.85 + m * 0.15
        for i in range(3):
            img[..., i] = img[..., i] * (1 - m) + col[i] * m
    hair = np.array(hair)
    # hair: top block + sideburns
    hair_line = 0.30 + rng.uniform(-0.03, 0.05)
    top = (yy < hair_line)
    for i in range(3):
        img[..., i] = np.where(top, hair[i], img[..., i])
    # brows (dark, clear)
    band(0.35, brow_h - 0.15, 0.11, 0.028, hair * 0.5)
    band(0.65, brow_h - 0.15, 0.11, 0.028, hair * 0.5)
    # eye almonds (whites + dark pupil dot)
    for cx in (0.35, 0.65):
        band(cx, brow_h - 0.075, 0.085, 0.045, (0.93, 0.91, 0.87))
        band(cx, brow_h - 0.075, 0.034, 0.036, (0.09, 0.06, 0.05))
    # nose shadow
    band(0.50, brow_h + 0.03, 0.040, 0.085, skin * 0.70)
    # mouth (clear)
    band(0.50, brow_h + 0.17, 0.10, 0.026, (0.44, 0.19, 0.19))
    if mustache:
        band(0.50, brow_h + 0.12, 0.13, 0.032, hair * 0.65)
    img = np.clip(img, 0, 1)
    return _new_image(name, img)


def _brick_fields(size, rows=8, cols=4):
    u, v = _grid(size)
    row = np.floor(v * rows)
    offset = (row % 2) * 0.5
    uu = (u * cols + offset) % 1.0
    vv = (v * rows) % 1.0
    mortar_w = 0.06
    mortar = ((uu < mortar_w) | (uu > 1 - mortar_w) | (vv < mortar_w) | (vv > 1 - mortar_w)).astype(float)
    # brick colour variation per brick id
    rng = np.random.default_rng(_TEX_SEED + 3)
    brick_id = (np.floor(u * cols + offset).astype(int) * 131 + row.astype(int) * 17)
    tint = 0.85 + 0.3 * ((brick_id * 2654435761) % 1000) / 1000.0
    base = np.array(config.PALETTE["brick_studio"])
    col = np.stack([base[0] * tint, base[1] * tint, base[2] * tint], axis=-1)
    mortar_col = np.array([0.72, 0.70, 0.66])
    m3 = mortar[..., None]
    rgb = col * (1 - m3) + mortar_col * m3
    color = np.concatenate([rgb, np.ones((size, size, 1))], axis=-1)
    height = 1.0 - mortar  # bricks proud, mortar recessed
    return {"color": color, "normal": None, "height": height, "mortar": mortar}


# ---------------------------------------------------------------- materials
def _principled(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return nt, bsdf


def solid(name, base_color, metallic=0.0, roughness=0.85, use_vcol=False):
    """Constant-factor PBR (+ optional vertex-colour multiply). The workhorse material."""
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    nt, bsdf = _principled(mat)
    c = (*base_color, 1.0) if len(base_color) == 3 else base_color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if use_vcol:
        vc = nt.nodes.new("ShaderNodeAttribute")   # stable across Blender versions
        vc.attribute_type = "GEOMETRY"
        vc.attribute_name = "Col"
        mix = nt.nodes.new("ShaderNodeMixRGB")
        mix.blend_type = "MULTIPLY"
        mix.inputs["Fac"].default_value = 1.0
        mix.inputs["Color1"].default_value = c
        nt.links.new(vc.outputs["Color"], mix.inputs["Color2"])
        nt.links.new(mix.outputs["Color"], bsdf.inputs["Base Color"])
        mat["studio_use_vcol"] = 1
    else:
        bsdf.inputs["Base Color"].default_value = c
    return mat


def textured(name, base_color, maps, kind, metallic=0.0, roughness=0.85, uv_scale=1.0):
    """Principled wired with tileable image maps (color/rough/normal) for a hero surface."""
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    nt, bsdf = _principled(mat)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    c = (*base_color, 1.0) if len(base_color) == 3 else base_color
    bsdf.inputs["Base Color"].default_value = c
    m = maps.get(kind, {})
    if m.get("color"):
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = m["color"]
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    if m.get("rough"):
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = m["rough"]
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Roughness"])
    if m.get("normal"):
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = m["normal"]
        nmap = nt.nodes.new("ShaderNodeNormalMap")
        nt.links.new(tex.outputs["Color"], nmap.inputs["Color"])
        nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    mat["studio_textured"] = kind
    return mat


def library():
    """The shared, coherent material set. Solid + vertex-colour variants for the whole kit."""
    P = config.PALETTE
    lib = {
        "stucco": solid("mat_stucco", P["stucco_warm"], roughness=0.9, use_vcol=True),
        "brick": solid("mat_brick", P["brick_studio"], roughness=0.85, use_vcol=True),
        "concrete": solid("mat_concrete", P["concrete_apron"], roughness=0.92, use_vcol=True),
        "metal": solid("mat_metal", P["metal_corrugate"], metallic=0.85, roughness=0.45),
        "steel_dark": solid("mat_steel_dark", P["steel_dark"], metallic=0.9, roughness=0.4),
        "wood": solid("mat_wood", P["wood_scaffold"], roughness=0.8, use_vcol=True),
        "roof": solid("mat_roof", P["roof_tile"], roughness=0.8, use_vcol=True),
        "paint_green": solid("mat_paint_green", P["paint_studio_green"], roughness=0.6),
        "paint_maroon": solid("mat_paint_maroon", P["paint_meridian_maroon"], roughness=0.55),
        "canvas": solid("mat_canvas", P["canvas_offwhite"], roughness=0.95),
        "glass": solid("mat_glass", (0.5, 0.6, 0.65), metallic=0.0, roughness=0.1),
    }
    return lib
