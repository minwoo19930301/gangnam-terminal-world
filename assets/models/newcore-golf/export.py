"""Export one UV and colour mesh for all three sweaters. Hangers sample the unprinted swatch."""
import bpy
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess

def sweater(here,group,key):
    v=[];f=[];uv=[];colors=[];smooth=[]
    graph=bpy.context.evaluated_depsgraph_get()
    for source in sorted(group.objects,key=lambda o:o.name):
        obj=source.evaluated_get(graph);mesh=obj.to_mesh()
        try:
            n=len(v);v.extend(obj.matrix_world@p.co for p in mesh.vertices)
            layer=mesh.uv_layers.active
            for face in mesh.polygons:
                f.append(tuple(n+j for j in face.vertices));smooth.append(face.use_smooth)
                cloth=layer is not None
                tone=(1,1,1,1) if cloth else mesh.materials[face.material_index].diffuse_color[:]
                for loop in face.loop_indices:
                    uv.extend(layer.data[loop].uv if cloth else (.98,.5));colors.extend(tone)
        finally:obj.to_mesh_clear()
    mesh=bpy.data.meshes.new('Jacquard');mesh.from_pydata(v,[],f);mesh.update()
    mesh.polygons.foreach_set('use_smooth',smooth)
    mesh.uv_layers.new(name='Fabric').uv.foreach_set('vector',uv)
    mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER').data.foreach_set('color',colors)
    packed(here,mesh,key)

def packed(here,mesh,key):
    ob=bpy.data.objects.new(key,mesh);bpy.context.scene.collection.objects.link(ob)
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
    with TemporaryDirectory() as tmp:
        dest=Path(tmp)/(key+'.glb');tools=here.parents[2]/'tools'
        bpy.ops.export_scene.gltf(filepath=str(dest),use_selection=True,export_format='GLB',export_yup=True,
            export_materials='NONE',export_vertex_color='ACTIVE',export_texcoords=True,export_animations=False)
        subprocess.run(['node',str(tools/'pack_display.mjs'),str(dest),'.84','.00023'],check=True)
        subprocess.run(['node',str(tools/'optimize_model.mjs'),str(dest),str(here/(key+'.glb'))],check=True)
    bpy.data.objects.remove(ob,do_unlink=True);bpy.data.meshes.remove(mesh)
