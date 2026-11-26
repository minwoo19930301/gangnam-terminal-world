"""Bake the fluorescent ceiling and the two shopfronts from each native aisle."""
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

import bpy
import numpy as np
from mathutils import Matrix, Vector

HERE = Path(__file__).resolve().parent
HEIGHT = 672  # 20 pixels per metre along the 33.6 m aisle
CEILING_WIDTH = 98
WALL_WIDTH = 60
GUTTER = 4
MODELS = [
    ('childrens-aisle', 'children'),
    ('suiting-aisle', 'tailoring'),
    ('womens-aisle', 'womenswear'),
]


def camera_basis(location, right, up):
    back = Vector(right).cross(Vector(up))
    matrix = Matrix((Vector(right), Vector(up), back)).transposed().to_4x4()
    matrix.translation = Vector(location)
    return matrix


def blur_tile_reflection(pixels):
    """A separable five-tap blur softens the edges of threads and diffusers."""
    for axis in (0, 1):
        padding = [(0, 0)] * 3
        padding[axis] = (2, 2)
        extended = np.pad(pixels, padding, mode='edge')
        row = np.arange(pixels.shape[axis])
        taps = [np.take(extended, row + i, axis=axis) for i in range(5)]
        pixels = (taps[0] + 4*taps[1] + 6*taps[2] + 4*taps[3] + taps[4]) / 16
    return pixels


def capture(model, code, directory):
    source = HERE.parent / ('gyeongbu-' + model) / (model + '.blend')
    bpy.ops.wm.open_mainfile(filepath=str(source))
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 10
    scene.cycles.use_denoising = True
    scene.cycles.seed = 6108
    scene.cycles.max_bounces = 3
    scene.render.resolution_percentage = 100
    scene.render.resolution_y = HEIGHT
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.exposure = 0
    if not scene.world:
        scene.world = bpy.data.worlds.new('Interior diffuse fill')
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get('Background')
    background.inputs['Color'].default_value = (.23, .26, .25, 1)
    background.inputs['Strength'].default_value = .53

    camera = scene.camera
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 33.6
    camera.data.clip_start = .01
    camera.data.clip_end = 18
    # The editable mesh already includes these distant ceiling diffusers.
    # Give the corridor extension their diffuse bounce in the offline capture.
    for depth in (-10, -7.1, 5.7, 8.6, 11.5, 14.4, 17.3, 20.1):
        data = bpy.data.lights.new('Long run of shop diffusers', 'AREA')
        data.energy = 37
        data.shape = 'RECTANGLE'
        data.size = .40
        data.size_y = 1.15
        light = bpy.data.objects.new('Distant diffuser bounce', data)
        scene.collection.objects.link(light)
        light.location = (-.08, -depth, 2.81)

    atlas_width = CEILING_WIDTH + 2*WALL_WIDTH + 6*GUTTER
    atlas = np.zeros((HEIGHT, atlas_width, 4), dtype='f')
    atlas[:, :, 3] = 1
    offset = GUTTER
    for name, width, position, right in [
        ('ceiling', CEILING_WIDTH, (0, -4, .17), (1, 0, 0)),
        ('left', WALL_WIDTH, (.03, -4, 1.50), (0, 0, 1)),
        ('right', WALL_WIDTH, (-.03, -4, 1.50), (0, 0, -1)),
    ]:
        camera.matrix_world = camera_basis(position, right, (0, -1, 0))
        scene.render.resolution_x = width
        path = directory / f'{code}-{name}.png'
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        image = bpy.data.images.load(str(path))
        pixels = np.empty(width * HEIGHT * 4, dtype='f')
        image.pixels.foreach_get(pixels)
        bpy.data.images.remove(image)
        pixels = blur_tile_reflection(pixels.reshape(HEIGHT, width, 4))
        atlas[:, offset:offset + width] = pixels
        atlas[:, offset - GUTTER:offset] = pixels[:, :1]
        atlas[:, offset + width:offset + width + GUTTER] = pixels[:, -1:]
        offset += width + 2*GUTTER

    image = bpy.data.images.new(f'Baked {code} ceiling and merchandise',
                                width=atlas_width, height=HEIGHT, alpha=False)
    image.pixels.foreach_set(atlas.ravel())
    image.file_format = 'WEBP'
    image.filepath_raw = str(HERE / (code + '.webp'))
    image.save()


selected = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
with TemporaryDirectory(prefix='gyeongbu-aisle-reflection-') as temp:
    for model, code in MODELS:
        if not selected or code in selected:
            capture(model, code, Path(temp))
