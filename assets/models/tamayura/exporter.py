"""Write one UV-mapped Blender mesh to the compressed game part."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import bpy

def packed(here,mesh,key):
    tools=here.parents[2]/"tools"
    scene=bpy.context.scene
    obj=bpy.data.objects.new('Tamayura_'+key,mesh);scene.collection.objects.link(obj)
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
    with TemporaryDirectory() as tmp:
        glb=Path(tmp)/(key+'.glb')
        bpy.ops.export_scene.gltf(filepath=str(glb),use_selection=True,export_format='GLB',export_yup=True,
            export_materials='NONE',export_vertex_color='ACTIVE',export_texcoords=True,export_animations=False)
        subprocess.run(['node',str(tools/'pack_display.mjs'),str(glb),'.76','.00032'],check=True)
        subprocess.run(['node',str(tools/'optimize_model.mjs'),str(glb),str(here/(key+'.glb'))],check=True)
    bpy.data.objects.remove(obj,do_unlink=True);bpy.data.meshes.remove(mesh)
