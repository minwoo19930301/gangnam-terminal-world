"""Export edited samples in a background Blender process. No changes are saved to the source."""
import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def render_surfaces(directory):
    directory.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    samples = [g for g in scene.collection.children if g.get("surface_key")]
    # Bake only the authored base colour; existing game lighting supplies reflections.
    for material in bpy.data.materials:
        if not material.use_nodes:
            continue
        nodes = material.node_tree.nodes
        shader = nodes.get("Principled BSDF")
        if not shader:
            continue
        color = shader.inputs["Base Color"]
        emit = nodes.new("ShaderNodeEmission")
        if color.is_linked:
            material.node_tree.links.new(color.links[0].from_socket, emit.inputs["Color"])
        else:
            emit.inputs["Color"].default_value = color.default_value
        material.node_tree.links.new(emit.outputs[0], nodes.get("Material Output").inputs["Surface"])

    camera_data = bpy.data.cameras.new("마감 정사영")
    camera_data.type = "ORTHO"
    camera = bpy.data.objects.new(camera_data.name, camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 4
    scene.cycles.use_denoising = False
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 92
    scene.render.image_settings.color_mode = "RGB"
    scene.render.image_settings.color_depth = "8"
    scene.render.dither_intensity = 0
    scene.view_settings.view_transform = "Standard"
    manifest = {}
    for group in sorted(samples, key=lambda g: g["surface_key"]):
        for other in samples:
            other.hide_render = other != group
        base, = [obj for obj in group.all_objects if obj.get("sample_base")]
        corners = [base.matrix_world @ Vector(v) for v in base.bound_box]
        bottom = min(p.z for p in corners)
        x0, y0 = (min(p[i] for p in corners) for i in (0, 1))
        x1, y1 = (max(p[i] for p in corners) for i in (0, 1))
        top = max((obj.matrix_world @ Vector(v)).z for obj in group.all_objects
                  if obj.type == "MESH" for v in obj.bound_box)
        width, length = x1 - x0, y1 - y0
        camera.location = ((x0 + x1) / 2, (y0 + y1) / 2, top + 3)
        camera_data.ortho_scale = max(width, length)
        sizes = [max(1, round(512 * m / camera_data.ortho_scale)) for m in (width, length)]
        scene.render.resolution_x, scene.render.resolution_y = sizes
        key = group["surface_key"]
        scene.render.filepath = str(directory / (key + ".jpg"))
        bpy.ops.render.render(write_still=True)
        manifest[key] = {"size": sizes, "meters": [round(m, 5) for m in (width, length)],
                         "thickness": round(top - bottom, 5)}
    (directory / "samples.js").write_text(
        "// Generated from floor-finishes.blend by export.py.\nexport const samples = " +
        json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n")


args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
render_surfaces(Path(args[0]).resolve() if args else Path(bpy.data.filepath).resolve().parent)
