"""Blender-side structural validation — asserts each built asset meets the Lab 05 standard
BEFORE export: scale sanity (1 u = 1 m), triangle budget, bone-name compatibility for
characters (all 65 UAL bones present as vertex groups), material presence. Returns per-asset
dicts that build_all folds into the manifest; any failure is surfaced (never silently passed).
"""
from . import config, core


def check_bone_compat(obj):
    """Every canonical UAL bone that a character weights must exist as a vertex group."""
    groups = {vg.name for vg in obj.vertex_groups}
    missing = [b for b in config.RIG_CORE_BONES if b not in groups]
    return {"vgroups": len(groups), "core_bones_present": len(missing) == 0, "missing_core_bones": missing}


def check_asset(obj, cls, tri_budget=None, expect_bones=False, max_dim=None):
    tris = core.triangle_count(obj)
    mn, mx, size = core.world_bounds([obj])
    issues = []
    if tri_budget and tris > tri_budget:
        issues.append(f"tris {tris} > budget {tri_budget}")
    if max_dim and max(size) > max_dim:
        issues.append(f"max dim {max(size):.1f}m > {max_dim}m")
    if size.z < 0.02 and cls != "architecture_ground":
        issues.append("degenerate height")
    if len(obj.data.materials) == 0:
        issues.append("no materials")
    rec = {
        "name": obj.name, "class": cls, "tris": tris,
        "dims_m": [round(size.x, 3), round(size.y, 3), round(size.z, 3)],
        "materials": len(obj.data.materials),
    }
    if expect_bones:
        bc = check_bone_compat(obj)
        rec.update(bc)
        if not bc["core_bones_present"]:
            issues.append(f"missing bones: {bc['missing_core_bones']}")
    rec["ok"] = len(issues) == 0
    rec["issues"] = issues
    return rec
