"""Re-export an edited retail.blend with blender -b retail.blend -P export.py."""
import bpy
import subprocess
from tempfile import TemporaryDirectory
from mathutils import Vector
from pathlib import Path

directory=Path(__file__).resolve().parent
deps=bpy.context.evaluated_depsgraph_get()
bundles={}
# Merge each editable collection into one draw call, retaining per-face colours.
for coll in list(bpy.data.collections):
    if not coll.get('fixture'): continue
    coords,faces,colours=[],[],[]
    origin=Vector(coll['origin'])
    for source in sorted(coll.all_objects,key=lambda o:o.name):
        if source.type!='MESH': continue
        obj=source.evaluated_get(deps)
        data=obj.to_mesh()
        try:
            start=len(coords)
            coords.extend(obj.matrix_world @ v.co-origin for v in data.vertices)
            for p in data.polygons:
                faces.append(tuple(start+i for i in p.vertices))
                colours.append(tuple(data.materials[p.material_index].diffuse_color))
        finally:
            obj.to_mesh_clear()
    baked=bpy.data.meshes.new(coll.name)
    baked.from_pydata(coords,[],faces)
    baked.update()
    attr=baked.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for face,color in zip(baked.polygons,colours):
        for loop in face.loop_indices: attr.data[loop].color=color
    obj=bpy.data.objects.new(coll.name,baked)
    bpy.context.scene.collection.objects.link(obj)
    bundles.setdefault(coll.get('bundle','retail'),[]).append(obj)
with TemporaryDirectory() as temp:
    for name,meshes in bundles.items():
        source = Path(temp) / (name + '.glb')
        bpy.ops.object.select_all(action='DESELECT')
        for obj in meshes: obj.select_set(True)
        bpy.ops.export_scene.gltf(filepath=str(source),export_format='GLB',use_selection=True,
            export_normals=False, export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
        subprocess.run(['node', str(directory.parents[2]/'tools'/'optimize_model.mjs'),
                        str(source), str(directory/source.name)], check=True)
