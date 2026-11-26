"""Build a native assembly from the game’s emitted tread profile, landing and fittings."""
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import subprocess

import bpy

here = Path(__file__).resolve().parent
with TemporaryDirectory() as tmp:
    packet = Path(tmp) / 'game-mesh.json'
    subprocess.run(['node', here / 'capture.mjs', packet], check=True)
    parts = json.loads(packet.read_text())['parts']

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = '파미에와 호남선 · 반계단'
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('FamilleHonamSteps')
scene.collection.children.link(collection)
materials = {}

def finish(rgb, label):
    key = tuple(rgb)
    if key not in materials:
        mat = bpy.data.materials.new(label)
        mat.diffuse_color = (*rgb, 1)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Base Color'].default_value = mat.diffuse_color
        bsdf.inputs['Roughness'].default_value = .64
        if '철물' in label:
            bsdf.inputs['Metallic'].default_value = .30
        materials[key] = mat
    return materials[key]

for part in parts:
    # The runtime duplicates vertices across its triangles. Weld equal positions to
    # support normal mesh editing and retain each original UV on the face corner.
    positions, indices, lookup = [], [], {}
    for xyz in part['positions']:
        key = tuple(round(c, 6) for c in xyz)
        if key not in lookup:
            lookup[key] = len(positions)
            positions.append(xyz)
        indices.append(lookup[key])
    mesh = bpy.data.meshes.new(part['name'])
    mesh.from_pydata(positions, [], [tuple(indices[j] for j in face) for face in part['faces']])
    mesh.update()
    uvmap = mesh.uv_layers.new(name='Game UV')
    slots = {}
    for poly, face, rgb in zip(mesh.polygons, part['faces'], part['colors']):
        key = tuple(rgb)
        if key not in slots:
            slots[key] = len(mesh.materials)
            mesh.materials.append(finish(rgb, part['name']+' '+str(len(slots))))
        poly.material_index = slots[key]
        for loop, vertex in zip(poly.loop_indices, face):
            uvmap.data[loop].uv = part['uvs'][vertex]
    obj = bpy.data.objects.new(part['name'], mesh)
    collection.objects.link(obj)

bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'steps.blend'), compress=True)
