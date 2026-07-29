"""Central configuration for the Blender production-art pipeline.

Analogous to the sim's TUNING block: every named magic number lives here, never inlined.
Convention (matches the lab README + the frozen 3D spike): 1 Blender unit = 1 metre,
1.8 m adult reference, +Y up on glTF export.
"""
from pathlib import Path

# --- Paths ------------------------------------------------------------------
# config.py lives at  <repo>/blender/studio_pipeline/config.py
PKG_DIR = Path(__file__).resolve().parent
BLENDER_DIR = PKG_DIR.parent
ROOT = BLENDER_DIR.parent                         # repo root: "Project Studio - Asset Lab"

SOURCES = ROOT / "sources"
PUBLIC_ASSETS = ROOT / "public" / "assets"
STUDIO_OUT = PUBLIC_ASSETS / "studio"             # exported GLBs land here (committed for Lab 05)
MANIFESTS = ROOT / "manifests"
PROOF = ROOT / "proof" / "lab05"
LIBRARIES = BLENDER_DIR / "libraries"             # saved .blend Asset Browser libraries
BLEND_OUT = BLENDER_DIR / "out"                   # intermediate .blend files (gitignored)

# The canonical animation source: skinned Mannequin + 43 CC0 clips (Quaternius UAL, CC0).
RIG_SOURCE_GLB = PUBLIC_ASSETS / "animation" / "UAL1_Standard.glb"

# --- Scale ------------------------------------------------------------------
UNIT_METERS = 1.0
ADULT_HEIGHT_M = 1.8

# --- The canonical skeleton (Unreal / Quaternius UAL "Mannequin", 65 bones) --
# Authoritative list probed from UAL1_Standard.glb. Characters MUST skin to exactly this
# armature so all 43 CC0 clips bind by bone-name for free.
RIG_ARMATURE_OBJ = "Armature"
RIG_MANNEQUIN_MESH = "Mannequin"     # the reference mesh we delete after isolating the rig
RIG_BONE_COUNT = 65
RIG_CORE_BONES = [
    "root", "pelvis", "spine_01", "spine_02", "spine_03", "neck_01", "Head",
    "clavicle_l", "upperarm_l", "lowerarm_l", "hand_l",
    "clavicle_r", "upperarm_r", "lowerarm_r", "hand_r",
    "thigh_l", "calf_l", "foot_l", "ball_l",
    "thigh_r", "calf_r", "foot_r", "ball_r",
]
# A verification clip guaranteed present in the library; used to prove characters deform.
PROOF_CLIP = "Walk_Loop"

# --- Triangle budgets (stylized / low-poly house style) ---------------------
TRI_BUDGET = {
    "character_lod0": 6000,
    "prop": 2500,
    "architecture_module": 1200,
    "soundstage_assembled": 9000,
}

# --- LOD + collision standard ----------------------------------------------
LOD_RATIOS = [1.0, 0.5, 0.25]        # LOD0 (as-authored), LOD1, LOD2 decimate ratios
LOD_SUFFIX = ["_LOD0", "_LOD1", "_LOD2"]
COLLISION_SUFFIX = "_COL"
# Assets small/uniform enough to use a box collider; everything else gets a convex-hull proxy.
COLLISION_BOX_CLASSES = {"prop_small", "architecture_module"}

# --- glTF export settings (single source of truth for every export) ---------
GLTF_EXPORT = dict(
    export_format="GLB",
    export_yup=True,
    export_apply=True,            # apply modifiers (except armature) on export
    export_materials="EXPORT",
    export_normals=True,
    export_texcoords=True,
    export_extras=True,           # carry custom props (asset role, class, license)
    export_cameras=False,
    export_lights=False,
)

# --- Provenance stamp (every asset carries this) ----------------------------
PROVENANCE = {
    "author": "Project Studio Asset Lab",
    "license": "original-CC0-equivalent",   # 100% original geometry, owner-owned
    "pipeline": "blender-studio_pipeline",
    "milestone": "asset-lab-05",
}

# --- Warm mid-century studio palette (linear-ish sRGB triples, 0..1) --------
# Named so no colour is inlined; function-coded material tints reference these.
PALETTE = {
    "stucco_warm":     (0.82, 0.74, 0.60),
    "brick_studio":    (0.55, 0.28, 0.22),
    "concrete_apron":  (0.55, 0.54, 0.51),
    "metal_corrugate": (0.60, 0.62, 0.64),
    "wood_scaffold":   (0.62, 0.44, 0.26),
    "roof_tile":       (0.45, 0.30, 0.24),
    "paint_studio_green": (0.24, 0.34, 0.30),
    "paint_meridian_maroon": (0.42, 0.13, 0.16),
    "canvas_offwhite": (0.86, 0.84, 0.78),
    "steel_dark":      (0.18, 0.19, 0.21),
    # crew skin tones (stylized, warm)
    "skin_01": (0.86, 0.66, 0.53),
    "skin_02": (0.74, 0.52, 0.40),
    "skin_03": (0.55, 0.37, 0.28),
    "skin_04": (0.92, 0.76, 0.66),
    # crew costume + hair (function-coded by department)
    "work_shirt_blue": (0.28, 0.36, 0.46),
    "work_shirt_tan":  (0.60, 0.52, 0.38),
    "vest_olive":      (0.34, 0.36, 0.24),
    "coat_charcoal":   (0.20, 0.20, 0.23),
    "apron_canvas":    (0.66, 0.56, 0.40),
    "trousers_grey":   (0.28, 0.28, 0.30),
    "trousers_brown":  (0.34, 0.26, 0.19),
    "leather_brown":   (0.30, 0.19, 0.12),
    "satchel_tan":     (0.52, 0.40, 0.26),
    "felt_brown":      (0.26, 0.19, 0.14),
    "felt_grey":       (0.30, 0.30, 0.32),
    "hardhat_amber":   (0.85, 0.55, 0.12),
    "hair_dark":       (0.12, 0.09, 0.07),
    "hair_brown":      (0.28, 0.18, 0.10),
    "hair_grey":       (0.55, 0.53, 0.50),
}
