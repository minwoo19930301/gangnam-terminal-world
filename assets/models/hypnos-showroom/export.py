"""Export four joined material batches with editable Blender shading and vertex tint."""
import bpy
import subprocess
import tempfile
from pathlib import Path

here=Path(bpy.data.filepath).resolve().parent
deps=bpy.context.evaluated_depsgraph_get()
root=bpy.data.collections['히프노스 · 신세계 강남 9층']
parts=[]
for finish in ('cloth','wood','metal','light'):
    verts,faces,tints,smoothing=[],[],[],[]
    for ob in sorted(root.all_objects,key=lambda obj:obj.name):
        ev=ob.evaluated_get(deps)
        if not ob.data.materials or ob.data.materials[0].get('finish')!=finish: continue
        data=ev.to_mesh()
        try:
            offset=len(verts)
            verts.extend([ob.matrix_world@v.co for v in data.vertices])
            shade=data.color_attributes.get('Shade')
            for p in data.polygons:
                faces.append(tuple(i+offset for i in p.vertices))
                color=tuple(data.materials[p.material_index].diffuse_color)
                tints.append([tuple(shade.data[i].color) for i in p.vertices] if shade else [color]*len(p.vertices))
                smoothing.append(p.use_smooth)
        finally:
            ev.to_mesh_clear()
    if not faces: continue
    data=bpy.data.meshes.new(finish)
    data.from_pydata(verts,[],faces)
    data.update()
    tint=data.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for p,rgba,smooth in zip(data.polygons,tints,smoothing):
        p.use_smooth=smooth
        for i,color in zip(p.loop_indices,rgba): tint.data[i].color=color
    item=bpy.data.objects.new(finish,data)
    bpy.context.scene.collection.objects.link(item)
    parts.append(item)
bpy.ops.object.select_all(action='DESELECT')
for o in parts: o.select_set(True)
with tempfile.TemporaryDirectory() as tmp:
    raw=Path(tmp)/'showroom.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),export_format='GLB',use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(here/'pack.mjs'),str(raw)],check=True)
