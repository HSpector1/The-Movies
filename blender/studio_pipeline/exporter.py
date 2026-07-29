"""GLB export — one wrapper so every asset exports with identical, glTF-valid settings.

Version-tolerant: filters kwargs to the properties the installed glTF operator actually
exposes (Blender's export flags drift between releases), so the pipeline survives upgrades.
"""
import bpy
from . import config, core


def _supported(kwargs):
    rna = bpy.ops.export_scene.gltf.get_rna_type()
    props = set(rna.properties.keys())
    return {k: v for k, v in kwargs.items() if k in props}


def export_glb(filepath, objects, with_animations=False, extras=None):
    """Export exactly `objects` (and their armature/children) to a self-contained GLB."""
    filepath = str(filepath)
    from pathlib import Path
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)

    core.select_only(objects)

    kwargs = dict(config.GLTF_EXPORT)
    kwargs.update(
        filepath=filepath,
        use_selection=True,
        export_animations=with_animations,
        export_skins=True,
        # Export the ACTIVE color attribute ("Col") as a single COLOR_0 (empirically the only
        # setting that yields exactly one attribute — "MATERIAL" misses generic Attribute nodes,
        # and combining flags duplicated it as COLOR_1). Meshes without a Col attribute get none.
        # "Col" defaults to white (paint.ensure_col), so untinted regions multiply as a no-op.
        export_vertex_color="ACTIVE",
        export_all_vertex_colors=False,
    )
    bpy.ops.export_scene.gltf(**_supported(kwargs))
    return filepath
