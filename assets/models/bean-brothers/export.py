"""Bake the editable cafe as one vertex-coloured draw for the close view."""
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import bpy

here = Path(__file__).resolve().parent
src = bpy.data.collections['빈브라더스 · FP203 커피바와 좌석']
graph = bpy.context.evaluated_depsgraph_get()
v, f, colors = [], [], []
for source in sorted(src.all_objects,key=lambda o:o.name):
    if source.type != 'MESH':
        continue
    o = source.evaluated_get(graph)
    mesh = o.to_mesh()
    try:
        n = len(v)
        v.extend(o.matrix_world @ pt.co for pt in mesh.vertices)
        for poly in mesh.polygons:
            f.append(tuple(n+j for j in poly.vertices))
            colors.append(mesh.materials[poly.material_index].diffuse_color[:])
    finally:
        o.to_mesh_clear()
mesh = bpy.data.meshes.new('BeanBrothersFP203')
mesh.from_pydata(v, [], f)
mesh.update()
tint=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
for poly, col in zip(mesh.polygons,colors):
    for loop in poly.loop_indices:
        tint.data[loop].color=col
item=bpy.data.objects.new('BeanBrothersFP203',mesh)
bpy.context.scene.collection.objects.link(item)
bpy.ops.object.select_all(action='DESELECT')
item.select_set(True)
with TemporaryDirectory() as temp:
    out=Path(temp)/'fp203.glb'
    bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,
                              export_normals=True,export_texcoords=False,export_materials='NONE',
                              export_vertex_color='ACTIVE',export_yup=True)
    scripts=here.parents[2]/'tools'
    subprocess.run(['node',str(scripts/'pack_display.mjs'),str(out)],check=True)
    subprocess.run(['node',str(scripts/'optimize_model.mjs'),str(out),str(here/out.name)],check=True)
