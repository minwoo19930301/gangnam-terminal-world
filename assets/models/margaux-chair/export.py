from pathlib import Path
import bpy
out=Path(bpy.data.filepath).parent
objs=list(bpy.data.collections['MargauxDiningChair'].objects)
bpy.ops.object.select_all(action='DESELECT')
for obj in objs:obj.select_set(True)
bpy.context.view_layer.objects.active=objs[0]
bpy.ops.object.join()
bpy.context.object.name='DiningChair'
bpy.ops.export_scene.gltf(filepath=str(out/'chair.glb'),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
