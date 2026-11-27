"""Rebuild both single-draw web surfaces from the editable collection transforms."""
from pathlib import Path
import sys
import bpy

here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
graph=bpy.context.evaluated_depsgraph_get()
for ident,file in [('OutbackCentralGallery','gallery'),('OutbackCentralReception','reception')]:
    collection=bpy.data.collections[ident]
    generated=[]
    for obj in list(collection.objects):
        if obj.type=='CURVE':
            mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(graph))
            meshobj=bpy.data.objects.new(obj.name+' export',mesh)
            meshobj.matrix_world=obj.matrix_world.copy()
            collection.objects.link(meshobj)
            generated.append(meshobj)
    bake_collection(collection,ident,here/(file+'.glb'))
    for obj in generated:
        bpy.data.objects.remove(obj,do_unlink=True)
