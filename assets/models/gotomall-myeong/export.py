"""Bake the editable display into a single colour mesh."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import bpy

directory=Path(bpy.data.filepath).parent
points,faces,colors=[],[],[]
for obj in bpy.data.collections['MyeongFlower'].all_objects:
    if obj.type!='MESH': continue
    start=len(points)
    points.extend(obj.matrix_world@v.co for v in obj.data.vertices)
    for face in obj.data.polygons:
        faces.append(tuple(start+i for i in face.vertices))
        colors.append(tuple(obj.data.materials[face.material_index].diffuse_color))
mesh=bpy.data.meshes.new('flowers')
mesh.from_pydata(points,[],faces)
attr=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
for face,color in zip(mesh.polygons,colors):
    for index in face.loop_indices: attr.data[index].color=color
item=bpy.data.objects.new('flowers',mesh)
bpy.context.scene.collection.objects.link(item)
bpy.ops.object.select_all(action='DESELECT')
item.select_set(True)
tools=directory.parents[2]/'tools'
with TemporaryDirectory() as tmp:
    raw=Path(tmp)/'myeong.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='NONE',
        export_vertex_color='ACTIVE',export_normals=False,export_texcoords=False)
    subprocess.run(['node',str(tools/'pack_display.mjs'),str(raw)],check=True)
    subprocess.run(['node',str(tools/'optimize_model.mjs'),str(raw),str(directory/raw.name)],check=True)
bpy.data.objects.remove(item,do_unlink=True)
