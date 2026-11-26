"""Rebuild each playable shop independently from shop-interiors.blend."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess

import bpy
from mathutils import Vector


here = Path(__file__).resolve().parent
optimizer = here.parents[2] / 'tools' / 'optimize_model.mjs'
with TemporaryDirectory() as workspace:
    for name in ('apparel', 'junior', 'kitchen', 'linen', 'flowers', 'tarot'):
        collection = bpy.data.collections[name]
        offset = Vector((collection['display_offset_x'], collection['display_offset_y'], 0))
        vertices, faces, colors = [], [], []
        for obj in sorted(collection.objects, key=lambda o: o.name):
            if obj.type != 'MESH':
                continue
            mesh = obj.data
            start = len(vertices)
            vertices.extend(obj.matrix_world @ v.co - offset for v in mesh.vertices)
            for polygon in mesh.polygons:
                faces.append(tuple(start + v for v in polygon.vertices))
                srgb = mesh.materials[polygon.material_index]['srgb']
                colors.append(tuple(int(srgb[i:i+2], 16) / 255 for i in (0, 2, 4)) + (1,))
        baked = bpy.data.meshes.new(name)
        baked.from_pydata(vertices, [], faces)
        baked.update()
        attr = baked.color_attributes.new(name='COLOR_0', type='BYTE_COLOR', domain='CORNER')
        for polygon, color in zip(baked.polygons, colors):
            for loop in polygon.loop_indices:
                attr.data[loop].color_srgb = color
        export = bpy.data.objects.new(name, baked)
        bpy.context.scene.collection.objects.link(export)
        bpy.ops.object.select_all(action='DESELECT')
        export.select_set(True)
        path = Path(workspace) / (name + '.glb')
        bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', use_selection=True,
                                  export_normals=True, export_texcoords=False, export_materials='NONE',
                                  export_vertex_color='ACTIVE', export_yup=True)
        bpy.data.objects.remove(export, do_unlink=True)
        bpy.data.meshes.remove(baked)
        subprocess.run(['node', str(optimizer.with_name('pack_display.mjs')), str(path)], check=True)
        subprocess.run(['node', str(optimizer), str(path), str(here / path.name)], check=True)
