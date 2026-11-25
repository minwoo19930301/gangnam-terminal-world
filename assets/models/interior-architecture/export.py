"""Batch-export edited Blender collections and apply the project's lossless meshoptimizer pipeline."""
import bpy
import subprocess
import tempfile
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[2]
deps=bpy.context.evaluated_depsgraph_get()
with tempfile.TemporaryDirectory() as tmp:
    for coll in sorted([c for c in bpy.data.collections if c.get('export_model')],key=lambda c:c.name):
        file=coll['export_model']
        origin=Vector(coll['preview_origin'])
        selected=[]
        for lit in (False,True):
            verts,faces,colors=[],[],[]
            for source in sorted(coll.all_objects,key=lambda o:o.name):
                if source.type != 'MESH': continue
                ev=source.evaluated_get(deps)
                data=ev.to_mesh()
                try:
                    remap={}
                    for face in data.polygons:
                        m=data.materials[face.material_index]
                        if bool(m.get('lit_face')) != lit: continue
                        indices=[]
                        for idx in face.vertices:
                            if idx not in remap:
                                remap[idx]=len(verts)
                                verts.append((ev.matrix_world @ data.vertices[idx].co)-origin)
                            indices.append(remap[idx])
                        faces.append(indices)
                        colors.append(tuple(m.diffuse_color))
                finally: ev.to_mesh_clear()
            if not faces:continue
            name='Diffuser' if lit else 'Surface'
            data=bpy.data.meshes.new(name)
            data.from_pydata(verts,[],faces)
            data.update()
            attr=data.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
            for face,color in zip(data.polygons,colors):
                for idx in face.loop_indices:attr.data[idx].color=color
            item=bpy.data.objects.new(name,data)
            bpy.context.scene.collection.objects.link(item)
            selected.append(item)
        bpy.ops.object.select_all(action='DESELECT')
        for item in selected:item.select_set(True)
        raw=Path(tmp)/(file+'.glb')
        bpy.ops.export_scene.gltf(filepath=str(raw),export_format='GLB',use_selection=True,
            export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
        subprocess.run(['node',str(REPO/'tools/optimize_model.mjs'),str(raw),str(ROOT/(file+'.glb'))],check=True,cwd=REPO)
        for item in selected:bpy.data.objects.remove(item,do_unlink=True)
