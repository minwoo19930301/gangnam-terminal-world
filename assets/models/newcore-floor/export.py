"""Export edited samples in a background Blender process. No changes are saved to the source."""
import json
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

import bpy
from mathutils import Vector


def without_blender_comments(data):
    # Blender stores wall-clock render timings and local paths as JPEG COM markers.
    clean = bytearray(data[:2])
    offset = 2
    while data[offset:offset + 2] != b"\xff\xda":  # start of entropy-coded scan
        if data[offset] != 0xff:
            raise ValueError("Unexpected JPEG header in Blender swatch")
        end = offset + 2 + int.from_bytes(data[offset + 2:offset + 4], "big")
        if data[offset + 1] != 0xfe:
            clean.extend(data[offset:end])
        offset = end
    return clean + data[offset:]


def render_surfaces(directory):
    directory.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    samples = [g for g in scene.collection.children if g.get("surface_key")]
    # Bake only the authored base colour; existing game lighting supplies reflections.
    for material in bpy.data.materials:
        if not material.use_nodes:
            continue
        nodes = material.node_tree.nodes
        output = next((node for node in nodes if node.type == "OUTPUT_MATERIAL"
                       and node.is_active_output), None)
        if output is None or not output.inputs["Surface"].is_linked:
            continue
        shader = output.inputs["Surface"].links[0].from_node
        if shader.type == "EMISSION":
            continue
        if shader.type != "BSDF_PRINCIPLED":
            raise ValueError(f"{material.name}: connect Principled BSDF or Emission to Surface")
        color = shader.inputs["Base Color"]
        emit = nodes.new("ShaderNodeEmission")
        if color.is_linked:
            material.node_tree.links.new(color.links[0].from_socket, emit.inputs["Color"])
        else:
            emit.inputs["Color"].default_value = color.default_value
        material.node_tree.links.new(emit.outputs[0], output.inputs["Surface"])

    camera_data = bpy.data.cameras.new("마감 정사영")
    camera_data.type = "ORTHO"
    camera = bpy.data.objects.new(camera_data.name, camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.render.threads_mode = "FIXED"
    scene.render.threads = 1
    scene.cycles.use_adaptive_sampling = False
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
        if min(width, length, top - bottom) <= 0:
            raise ValueError(f"{group.name}: the sample needs a positive width, length and thickness")
        camera.location = ((x0 + x1) / 2, (y0 + y1) / 2, top + 3)
        camera_data.ortho_scale = max(width, length)
        sizes = [max(1, round(512 * m / camera_data.ortho_scale)) for m in (width, length)]
        scene.render.resolution_x, scene.render.resolution_y = sizes
        key = group["surface_key"]
        image_path = directory / (key + ".jpg")
        scene.render.filepath = str(image_path)
        bpy.ops.render.render(write_still=True)
        image_path.write_bytes(without_blender_comments(image_path.read_bytes()))
        manifest[key] = {"size": sizes, "meters": [round(m, 5) for m in (width, length)],
                         "thickness": round(top - bottom, 5)}
    (directory / "samples.js").write_text(
        "// Generated from floor-finishes.blend by export.py.\nexport const samples = " +
        json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n")


args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
output_dir = Path(args[0]).resolve() if args else Path(bpy.data.filepath).resolve().parent
output_dir.mkdir(parents=True, exist_ok=True)
with TemporaryDirectory(dir=output_dir) as work:
    staging = Path(work)
    render_surfaces(staging)
    for path in sorted(staging.iterdir()):
        path.replace(output_dir / path.name)
