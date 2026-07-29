"""Build the reusable Blender Asset Browser library: blender/libraries/studio_assets.blend.

Every crew character (as a rig+mesh collection), architecture module, and prop is marked as an
asset and filed under a catalog (Characters / Architecture / Props). Point Blender's Asset
Browser at blender/libraries/ to drag any of them straight into a scene. Deterministic; run via
`npm run blender:library`.
"""
import sys
from pathlib import Path

BLENDER_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BLENDER_DIR))

import bpy
from studio_pipeline import config, core, rig, character, architecture, props

CATS = {
    "Characters":   "a5f0c0c0-0000-4000-8000-000000000001",
    "Architecture": "a5f0c0c0-0000-4000-8000-000000000002",
    "Props":        "a5f0c0c0-0000-4000-8000-000000000003",
}


def _catalog(asset, cat, desc=""):
    asset.asset_mark()
    ad = asset.asset_data
    ad.catalog_id = CATS[cat]
    ad.description = desc
    ad.tags.new("project-studio")
    ad.tags.new("asset-lab-05")


core.reset_scene()
marked = {"Characters": 0, "Architecture": 0, "Props": 0}

# --- characters: each rig+mesh in its own collection, mark the collection ---
base = rig.load_canonical_rig(keep_actions=False)
for i, role in enumerate(character.ROLES):
    arm = base.copy(); arm.data = base.data.copy()
    bpy.context.scene.collection.objects.link(arm)
    body = character.build_character(role, arm, seed=i + 1)
    arm.location.x = i * 2.0
    coll = bpy.data.collections.new(body.name)
    bpy.context.scene.collection.children.link(coll)
    for o in (arm, body):
        for c in list(o.users_collection):
            c.objects.unlink(o)
        coll.objects.link(o)
    _catalog(coll, "Characters", f"{role} crew character, rigged to the 65-bone UAL Mannequin (43 CC0 clips).")
    marked["Characters"] += 1

# --- architecture modules ---
mats, maps = architecture.kit_materials()
arch_objs = [
    architecture.stage_wall(mats, maps), architecture.elephant_door(mats), architecture.barrel_roof(mats),
    architecture.stage_corner(mats), architecture.ground_tile(mats), architecture.boundary_wall(mats),
    architecture.marquee_gate(mats), architecture.water_tower(mats),
]
for j, o in enumerate(arch_objs):
    o.location = (j * 6.0, 20.0, 0)
    _catalog(o, "Architecture", f"{o.get('studio_role','module')} — 2 m grid studio kit module.")
    marked["Architecture"] += 1

# --- props ---
for k, o in enumerate(props.build_all_props()):
    o.location = (k * 2.0, 40.0, 0)
    tag = o.get("studio_attach")
    _catalog(o, "Props", f"{o.get('studio_role','prop')}" + (f" — hand-attachable ({tag})." if tag else "."))
    marked["Props"] += 1

# --- catalog definition file (Asset Browser reads this from the library dir) ---
libdir = config.LIBRARIES
libdir.mkdir(parents=True, exist_ok=True)
cats = "# Anonymous catalog definitions for Project: Studio Asset Lab 05\nVERSION 1\n"
for name, cid in CATS.items():
    cats += f"{cid}:{name}:{name}\n"
(libdir / "blender_assets.cats.txt").write_text(cats)

blend = libdir / "studio_assets.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
print(f"ASSET LIBRARY: {sum(marked.values())} assets marked "
      f"(Characters {marked['Characters']}, Architecture {marked['Architecture']}, Props {marked['Props']})")
print(f"saved {blend}")
print("MAKE_LIBRARY_OK")
