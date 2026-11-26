"""Rebuild the editable JW garden surfaces from the regular indoor-layout manifest.

blender -b -P build-public-roof.py -- /path/to/indoor-layout.json
"""
import json
from pathlib import Path
import sys

import bpy

rows = json.loads(Path(sys.argv[sys.argv.index('--') + 1]).read_text())
garden = [row for row in rows if row['library'] == 'jwmarriott/public-roof.blend']
if len(garden) != 6:
    raise ValueError('Expected a terrace, three lawns, a path and a pool')
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = 'JW 메리어트 7층 · 공개 정원'
for row in garden:
    name = row['subject']
    collection = bpy.data.collections.new(name)
    scene.collection.children.link(collection)
    corners, = row['faces']
    # X/east, Y/north, Z/up; wind the single editable boundary upwards.
    area = sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(corners,corners[1:]+corners[:1]))
    if area < 0:
        corners = list(reversed(corners))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(corners,[],[list(range(len(corners)))])
    mesh.update()
    obj = bpy.data.objects.new(name,mesh)
    collection.objects.link(obj)
    matname = name.rsplit(' ',1)[0]
    material = bpy.data.materials.get(matname) or bpy.data.materials.new(matname)
    rgb = [(row['color'] >> shift & 255)/255 for shift in (16,8,0)]
    material.diffuse_color = [c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb]+[1]
    mesh.materials.append(material)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(Path(__file__).with_name('public-roof.blend')),compress=True)
