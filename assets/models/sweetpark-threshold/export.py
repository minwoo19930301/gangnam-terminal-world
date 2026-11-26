"""Export editable wood, light grid, and native raised letters as one vertex-coloured surface."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import bpy

folder=Path(bpy.data.filepath).parent
graph=bpy.context.evaluated_depsgraph_get()
objects=bpy.data.collections['SweetParkCoffeeThreshold'].all_objects
vertices=[];faces=[];shades=[]
for source in sorted(objects,key=lambda o:o.name):
    if source.type not in ['MESH','CURVE']:continue
    ob=source.evaluated_get(graph);me=ob.to_mesh()
    try:
        n=len(vertices);vertices.extend(ob.matrix_world@v.co for v in me.vertices)
        color=me.color_attributes.get('Finish')
        for face in me.polygons:
            faces.append([n+i for i in face.vertices])
            shades.extend(color.data[l].color_srgb[:] if color else (1,.984,.934,1) for l in face.loop_indices)
    finally:ob.to_mesh_clear()
mesh=bpy.data.meshes.new('Threshold surface');mesh.from_pydata(vertices,[],faces);mesh.update()
attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
for entry,shade in zip(attr.data,shades):entry.color_srgb=shade
mesh.color_attributes.active_color=attr
surface=bpy.data.objects.new('Surface',mesh);bpy.context.scene.collection.objects.link(surface)
bpy.ops.object.select_all(action='DESELECT');surface.select_set(True)
with TemporaryDirectory() as tmp:
    dest=Path(tmp)/'threshold.glb'
    bpy.ops.export_scene.gltf(filepath=str(dest),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True,export_animations=False)
    subprocess.run(['node',str(folder.parent/'ssg-market-entrance/pack.mjs'),str(dest),str(folder/'threshold.glb')],check=True)
