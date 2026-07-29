"""studio_pipeline — Project: Studio (Meridian Pictures) Blender production-art pipeline.

Pure asset authoring: procedural mesh generation, PBR materials, rigging to the canonical
UAL Mannequin skeleton, LOD + collision, GLB export, structural validation, and headless
rendering. This package owns NO game logic — it produces visual assets only (Asset Lab 05).

All modules are import-safe under Blender's bundled Python (`bpy`). Nothing here runs the
simulation, and nothing here is authoritative game state.
"""
