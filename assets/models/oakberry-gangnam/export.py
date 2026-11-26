"""Bake the editable wordmark and counter into a single vertex-colour web surface."""
from pathlib import Path
import sys
import bpy

here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/"tools"))
from blender_display_export import bake_collection

collection=bpy.data.collections["GangnamOakberryCounter"]
graph=bpy.context.evaluated_depsgraph_get()
for obj in list(collection.objects):
    if obj.type == "FONT":
        mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(graph))
        copy=bpy.data.objects.new(obj.name+" · 웹",mesh)
        copy.matrix_world=obj.matrix_world.copy()
        collection.objects.link(copy)
bake_collection(collection,"GangnamOakberryCounter",here/"counter.glb",preserve_smoothing=True)
