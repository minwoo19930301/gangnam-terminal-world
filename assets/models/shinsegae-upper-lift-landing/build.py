"""Build two editable main-wing lift lobbies at independent, registered floor origins."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import runpy
import subprocess

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
capture = runpy.run_path(str(here.parent / 'geometry-capture' / 'mesh.py'))
bpy.ops.wm.read_factory_settings(use_empty=True)
with TemporaryDirectory() as tmp:
    path = Path(tmp) / 'faces.json'
    subprocess.run(['node', here / 'capture.mjs', path], check=True)
    packet = json.loads(path.read_text())
    images = capture['load_images'](packet['images'], tmp)
for floor, data in packet['floors'].items():
    scene = bpy.context.scene if floor == '7F' else bpy.data.scenes.new('8F')
    scene.name = floor + ' · 신세계 본관 승강장'
    scene.unit_settings.system = 'METRIC'
    collection = bpy.data.collections.new('MainLiftLanding' + floor)
    scene.collection.children.link(collection)
    capture['add_meshes'](data['pieces'], data['frame'], images, collection)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            space = area.spaces.active
            space.shading.type = 'MATERIAL'
            space.region_3d.view_distance = 13
            space.region_3d.view_location = (0, 0, 1.55)
            space.region_3d.view_rotation = Vector((.92, .38, -.20)).to_track_quat('-Z', 'Y')
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / 'landings.blend'), compress=True)
