"""Build the editable, metric parking ramp from the public game's rendered triangles."""
import runpy
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = '파미에주차장 · 차량 경사로'
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('FamilleParkingRamp')
scene.collection.children.link(collection)

with TemporaryDirectory() as tmp:
    path = Path(tmp) / 'street.json'
    subprocess.run(['node', here / 'capture.mjs', path], check=True)
    packet = json.loads(path.read_text())
    capture = runpy.run_path(str(here.parent / 'geometry-capture' / 'mesh.py'))
    images = capture['load_images'](packet['images'], tmp)

capture['add_meshes'](packet['pieces'], packet['frame'], images, collection, {'천장 등기구'})

# Open the independent source looking across both kerbs. No staging meshes or lights
# are part of the collection linked into the city.
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            space = area.spaces.active
            space.shading.type = 'MATERIAL'
            space.clip_end = 500
            space.region_3d.view_distance = 57
            space.region_3d.view_location = (0, 0, 5)
            space.region_3d.view_rotation = Vector((.70, .35, -.63)).to_track_quat('-Z', 'Y')
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / 'ramp.blend'), compress=True)
