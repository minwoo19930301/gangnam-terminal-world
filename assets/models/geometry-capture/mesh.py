"""Load captured, packed game surfaces and construct editable per-corner mesh attributes."""
import base64
from pathlib import Path
import bpy
from mathutils import Vector

def load_images(data, tmp):
    images = {}
    for key, uri in data.items():
        file = Path(tmp) / (key + '.png')
        file.write_bytes(base64.b64decode(uri.split(',', 1)[1]))
        image = bpy.data.images.load(str(file))
        image.pack()
        images[key] = image

    return images


def add_meshes(pieces, frame, images, collection, emissive=()):
    x, y, z = frame[12:15]
    origin = Vector((x, -z, y))
    for part in pieces:
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
        if name in emissive:
            tree.links.new(surface, bsdf.inputs['Emission Color'])
            bsdf.inputs['Emission Strength'].default_value = 1
        mesh.materials.append(material)
        ob = bpy.data.objects.new(name, mesh)
        collection.objects.link(ob)

