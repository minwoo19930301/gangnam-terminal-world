"""Build the editable, metric parking ramp from the public game's rendered triangles."""
import base64
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
    images = {}
    for key, uri in packet['images'].items():
        file = Path(tmp) / (key + '.png')
        file.write_bytes(base64.b64decode(uri.split(',', 1)[1]))
        image = bpy.data.images.load(str(file))
        image.pack()
        images[key] = image

x, y, z = packet['frame'][12:15]
origin = Vector((x, -z, y))
for part in packet['pieces']:
    name = part['name']
    points, remap, unique = [], [], {}
    for v in part['vertices']:
        key = tuple(v)
        if key not in unique:
            unique[key] = len(points)
            points.append(Vector(v) - origin)
        remap.append(unique[key])
    index = part['indices']
    faces = [tuple(remap[v] for v in index[i:i + 3]) for i in range(0, len(index), 3)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(points, [], faces)
    mesh.update()
    mesh.uv_layers.new(name='Game UV')
    colors = mesh.color_attributes.new(name='Game tint', type='FLOAT_COLOR', domain='CORNER')
    # Creating a second corner attribute can reallocate the first RNA layer.
    uv = mesh.uv_layers['Game UV']
    for loop, vertex in enumerate(index):
        uv.data[loop].uv = part['uvs'][vertex]
        colors.data[loop].color = (*part['colors'][vertex], 1)
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    tree = material.node_tree
    bsdf = tree.nodes.get('Principled BSDF')
    tint = tree.nodes.new('ShaderNodeVertexColor')
    tint.layer_name = colors.name
    surface = tint.outputs['Color']
    if part['texture']:
        img = tree.nodes.new('ShaderNodeTexImage')
        img.image = images[part['texture']]
        multiply = tree.nodes.new('ShaderNodeMixRGB')
        multiply.blend_type = 'MULTIPLY'
        multiply.inputs[0].default_value = 1
        tree.links.new(surface, multiply.inputs[1])
        tree.links.new(img.outputs['Color'], multiply.inputs[2])
        surface = multiply.outputs[0]
    tree.links.new(surface, bsdf.inputs['Base Color'])
    if name == '천장 등기구':
        tree.links.new(surface, bsdf.inputs['Emission Color'])
        bsdf.inputs['Emission Strength'].default_value = 1
    mesh.materials.append(material)
    ob = bpy.data.objects.new(name, mesh)
    collection.objects.link(ob)

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
