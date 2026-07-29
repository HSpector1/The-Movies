"""Headless render + thumbnail helpers — the warm golden-hour studio look, EEVEE/Cycles.

Matches the house style established in Labs 02-04: warm key sun, soft sky fill, AgX view
transform, gentle contrast. Auto-frames any object set for per-asset thumbnails, and renders
composed hero shots for the proof sheet.
"""
import math
import bpy
from mathutils import Vector
from . import config, core


def set_look(scene, exposure=0.0):
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = exposure
    scene.display_settings.display_device = "sRGB"


def warm_world(strength=0.9, top=(0.42, 0.55, 0.85), horizon=(1.0, 0.86, 0.66)):
    """Version-independent gradient sky: blue zenith -> warm golden-hour horizon."""
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = strength
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (*horizon, 1)
    ramp.color_ramp.elements[1].position = 0.55
    ramp.color_ramp.elements[1].color = (*top, 1)
    grad = nt.nodes.new("ShaderNodeTexGradient")
    grad.gradient_type = "SPHERICAL"
    tex = nt.nodes.new("ShaderNodeTexCoord")
    # map world Z (generated up) into the ramp via a spherical gradient off the horizon
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY_ADD"
    mul.inputs[1].default_value = 0.5
    mul.inputs[2].default_value = 0.5
    nt.links.new(tex.outputs["Generated"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Z"], mul.inputs[0])
    nt.links.new(mul.outputs["Value"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return world


def sun(strength=3.2, angle_deg=(52, 0, 40), color=(1.0, 0.93, 0.82)):
    d = bpy.data.lights.new("KeySun", "SUN")
    d.energy = strength
    d.color = color
    d.angle = math.radians(2.0)   # soft shadow edge
    o = bpy.data.objects.new("KeySun", d)
    o.rotation_euler = tuple(math.radians(a) for a in angle_deg)
    bpy.context.scene.collection.objects.link(o)
    return o


def fill(strength=0.8):
    d = bpy.data.lights.new("Fill", "SUN")
    d.energy = strength
    d.color = (0.7, 0.8, 1.0)
    o = bpy.data.objects.new("Fill", d)
    o.rotation_euler = tuple(math.radians(a) for a in (60, 0, -120))
    bpy.context.scene.collection.objects.link(o)
    return o


def ground(size=40, color=(0.34, 0.32, 0.29)):
    me = bpy.data.meshes.new("Ground")
    from .meshgen import MeshBuilder, T
    mb = MeshBuilder()
    mb.add_box(size=(size, size, 0.1), matrix=T(0, 0, -0.05), mat=0)
    mat = bpy.data.materials.new("mat_ground")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = 0.95
    obj = mb.finish("Ground", materials=[mat])
    bpy.context.scene.collection.objects.link(obj)
    return obj


def camera(location, target, lens=50):
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = lens
    cam = bpy.data.objects.new("Cam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    cam.location = Vector(location)
    direction = Vector(target) - Vector(location)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return cam


def frame_objects(objs, cam, target=None, margin=1.35):
    """Point cam at the centre of objs and back off to fit their bounds."""
    mn, mx, size = core.world_bounds(objs)
    center = (mn + mx) * 0.5 if target is None else Vector(target)
    radius = max(size.length * 0.5, 0.5)
    direction = (cam.location - center).normalized()
    cam.location = center + direction * radius * margin * 2.0
    d = center - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return cam


def setup(engine="BLENDER_EEVEE", res=(1024, 1024), samples=64, transparent=False):
    scene = bpy.context.scene
    scene.render.engine = engine
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = transparent
    if engine == "CYCLES":
        scene.cycles.samples = samples
        scene.cycles.device = "CPU"
    else:
        try:
            scene.eevee.taa_render_samples = samples
        except Exception:
            pass
    set_look(scene)
    return scene


def render_to(filepath):
    from pathlib import Path
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.filepath = str(filepath)
    bpy.ops.render.render(write_still=True)
    return str(filepath)
