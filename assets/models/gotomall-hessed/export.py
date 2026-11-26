"""Export an edited hessed.blend. Material colours and mesh instances are baked in metres."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess

import bpy

directory=Path(bpy.data.filepath).resolve().parent
collection=bpy.data.collections['HessedShop']
graph=bpy.context.evaluated_depsgraph_get()
with TemporaryDirectory() as temp:
    for distant in (False,True):
        points,faces,colors=[],[],[]
        for source in sorted(collection.all_objects,key=lambda o:o.name):
            if source.type!='MESH':continue
            obj=source.evaluated_get(graph);mesh=obj.to_mesh()
            try:
                marker=mesh.attributes.get('distant')
                remap={}
                for p in mesh.polygons:
                    if distant and marker and not marker.data[p.index].value:continue
                    face=[]
                    for n in p.vertices:
                        if n not in remap:
                            remap[n]=len(points);points.append(obj.matrix_world@mesh.vertices[n].co)
                        face.append(remap[n])
                    faces.append(face)
                    colors.append(tuple(mesh.materials[p.material_index].diffuse_color))
            finally:obj.to_mesh_clear()
        baked=bpy.data.meshes.new('HessedMesh')
        baked.from_pydata(points,[],faces);baked.update()
        attr=baked.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
        for p,col in zip(baked.polygons,colors):
            for i in p.loop_indices:attr.data[i].color=col
        mesh_obj=bpy.data.objects.new('Hessed',baked)
        bpy.context.scene.collection.objects.link(mesh_obj)
        bpy.ops.object.select_all(action='DESELECT');mesh_obj.select_set(True)
        path=Path(temp)/('distant.glb' if distant else 'hessed.glb')
        bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,
            export_normals=False,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
        bpy.data.objects.remove(mesh_obj,do_unlink=True)
    subprocess.run(['node',str(directory/'pack.mjs'),temp],check=True)
