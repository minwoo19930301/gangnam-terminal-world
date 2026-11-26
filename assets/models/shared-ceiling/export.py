"""Bake the edited underside to colour spans for the existing synchronous canvas atlas."""
import json
import sys
from collections import Counter
from math import pi
from pathlib import Path

import bpy
from mathutils import Vector


def surface_rectangles(pixels, width, height):
    # Scan the actual swatch, then join identical horizontal runs across rows.
    # The background covers the entire tile; only other colours need spans.
    base = Counter(pixels).most_common(1)[0][0]
    boxes = []
    active = {}
    for y in range(height + 1):
        runs = {}
        if y < height:
            x = 0
            while x < width:
                color = pixels[y * width + x]
                end = x + 1
                while end < width and pixels[y * width + end] == color:
                    end += 1
                if color != base:
                    key = (color, x, end)
                    runs[key] = active.get(key, y)
                x = end
        for (color, x0, x1), y0 in active.items():
            if (color, x0, x1) not in runs:
                boxes.append((color, x0, y0, x1 - x0, y - y0))
        active = runs
    return base, boxes


BEGIN = '// BEGIN Blender suspended ceiling swatch'
END = '// END Blender suspended ceiling swatch'


def bake(out):
    scene = bpy.context.scene
    backing, = [o for o in scene.objects if o.get('repeat_bounds')]
    corners = [backing.matrix_world @ Vector(corner) for corner in backing.bound_box]
    lo, hi = ([f(p[i] for p in corners) for i in range(3)] for f in (min, max))
    width, depth = hi[0] - lo[0], hi[1] - lo[1]
    if width <= 0 or depth <= 0:
        raise ValueError('The panel backing needs positive width and depth.')
    camera_data = bpy.data.cameras.new('실내 · 천장 정사영')
    camera_data.type = 'ORTHO'
    camera_data.ortho_scale = max(width, depth)
    camera = bpy.data.objects.new(camera_data.name, camera_data)
    scene.collection.objects.link(camera)
    camera.location = ((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2] - 3)
    camera.rotation_euler = (pi, 0, 0)
    scene.camera = camera
    # Preserve the faces of the small folded sheet-metal parts in the diffuse
    # atlas. The game still supplies the full ceiling's time-of-day lighting.
    for mat in bpy.data.materials:
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        emit = nodes.new('ShaderNodeEmission')
        emit.inputs['Color'].default_value = mat.diffuse_color
        if mat.get('bake_fold_shading'):
            normal = nodes.new('ShaderNodeNewGeometry')
            dot = nodes.new('ShaderNodeVectorMath')
            dot.operation = 'DOT_PRODUCT'
            dot.inputs[1].default_value = (.56, -.42, -.71)
            mat.node_tree.links.new(normal.outputs['True Normal'], dot.inputs[0])
            fill = nodes.new('ShaderNodeMath')
            fill.operation = 'MULTIPLY_ADD'
            fill.inputs[1].default_value = .48
            fill.inputs[2].default_value = .63
            mat.node_tree.links.new(dot.outputs['Value'], fill.inputs[0])
            mat.node_tree.links.new(fill.outputs[0], emit.inputs['Strength'])
        mat.node_tree.links.new(emit.outputs[0], nodes.get('Material Output').inputs['Surface'])
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 1
    scene.cycles.use_denoising = False
    scene.cycles.pixel_filter_type = 'BOX'
    scene.cycles.filter_width = .01
    scene.render.pixel_aspect_x = max(1, width / depth)
    scene.render.pixel_aspect_y = max(1, depth / width)
    scene.render.resolution_percentage = 100
    # The image is nearest sampled at the same 256px resolution as the game atlas.
    size = 256
    scene.render.resolution_x = scene.render.resolution_y = size
    scene.render.dither_intensity = 0
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.image_settings.color_depth = '8'
    scene.view_settings.view_transform = 'Standard'
    import tempfile
    with tempfile.TemporaryDirectory() as temp:
        swatch = Path(temp) / 'swatch.png'
        scene.render.filepath = str(swatch)
        bpy.ops.render.render(write_still=True)
        # Load as raw sRGB bytes; Blender's pixel data is bottom-to-top.
        image = bpy.data.images.load(str(swatch), check_existing=False)
        image.colorspace_settings.name = 'Non-Color'
        rgba = list(image.pixels)
    rows = []
    for y in reversed(range(size)):
        for x in range(size):
            i = 4 * (y * size + x)
            rows.append(''.join(f'{round(255 * channel):02x}' for channel in rgba[i:i + 3]))
    base, boxes = surface_rectangles(rows, size, size)
    by_color = {}
    for color, *rect in boxes:
        by_color.setdefault(color, []).extend(rect)
    # Keep source dimensions and all baked colours available to Node without an image decoder.
    scale = [round(width, 5), round(depth, 5)]
    data = '// Rebuild with assets/models/shared-ceiling/export.py. Units are pixels in a 256px tile.\n'
    data += f'const ceilingScale = {json.dumps(scale)};\nconst ceilingBaseColor = "#{base}";\n'
    data += 'const ceilingSpans = [\n'
    for color, spans in sorted(by_color.items()):
        data += f'  ["#{color}", {json.dumps(spans, separators=(",", ":"))}],\n'
    data += '];\n'
    if out is None:
        textures = Path(__file__).resolve().parents[3] / 'js/textures.js'
        source = textures.read_text()
        if source.count(BEGIN) != 1 or source.count(END) != 1:
            raise ValueError('Expected exactly one generated ceiling swatch in js/textures.js.')
        before, _, rest = source.partition(BEGIN)
        _, _, after = rest.partition(END)
        textures.write_text(before + BEGIN + '\n' + data + END + after)
    else:
        out.mkdir(parents=True, exist_ok=True)
        (out / 'swatch.js').write_text(data + 'export { ceilingScale, ceilingBaseColor, ceilingSpans };\n')
    print(f'Shared ceiling bake: {len(by_color) + 1} colours, {len(boxes)} spans, {len(data)} bytes')


args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
bake(Path(args[0]) if args else None)
