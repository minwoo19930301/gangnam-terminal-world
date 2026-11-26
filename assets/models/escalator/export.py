"""Re-export an edited Blender parts library. Nodes retain their normalized game pivots."""
from pathlib import Path
import subprocess
import tempfile
import bpy
from mathutils import Vector

ROOT=Path(bpy.data.filepath).parent
selected=[]
for c in sorted((c for c in bpy.data.collections if c.get('part')),key=lambda c:c.name):
    vertices,faces,colors=[],[],[]
    origin=Vector(c['origin'])
    for o in sorted(c.all_objects,key=lambda o:o.name):
        if o.type!='MESH':continue
        evaluated=o.evaluated_get(bpy.context.evaluated_depsgraph_get());source=evaluated.to_mesh()
        try:
            offset=len(vertices)
            vertices.extend((evaluated.matrix_world @ v.co)-origin for v in source.vertices)
            for p in source.polygons:
                faces.append(tuple(offset+i for i in p.vertices))
                colors.append(tuple(source.materials[p.material_index].diffuse_color))
        finally:evaluated.to_mesh_clear()
    mesh=bpy.data.meshes.new(c['part'])
    mesh.from_pydata(vertices,[],faces);mesh.update()
    attr=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for poly,color in zip(mesh.polygons,colors):
        for i in poly.loop_indices:attr.data[i].color=color
    o=bpy.data.objects.new(c['part'],mesh);bpy.context.scene.collection.objects.link(o);selected.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in selected:o.select_set(True)
with tempfile.TemporaryDirectory() as tmp:
    raw=Path(tmp)/'parts.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),export_format='GLB',use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(ROOT.parents[2]/'tools/optimize_model.mjs'),str(raw),str(ROOT/'parts.glb')],check=True)
