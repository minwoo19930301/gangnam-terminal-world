"""Export the editable mesh with its painted-panel UVs; the game shares one material."""
from pathlib import Path
import bpy
out=Path(bpy.data.filepath).parent
bpy.ops.object.select_all(action='DESELECT')
objects=list(bpy.data.collections['MarketProduceCeiling'].objects)
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.join()
bpy.context.object.name='Surface'
bpy.ops.export_scene.gltf(filepath=str(out/'ceiling.glb'),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
