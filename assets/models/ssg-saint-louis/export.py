"""Export joined copies in memory. The library on disk stays individually editable."""
from pathlib import Path
import bpy
out=Path(__file__).resolve().parent
collection=bpy.data.collections['SSG_9F_RocheBobois']
for material in list(bpy.data.materials):
    parts=[o for o in collection.objects if o.data.materials[0]==material]
    if not parts: continue
    bpy.ops.object.select_all(action='DESELECT')
    for ob in parts: ob.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    if len(parts)>1: bpy.ops.object.join()
    bpy.context.object.name=material.name
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(out/'gallery.glb'),export_format='GLB',export_yup=True,
                          export_animations=False,export_colors=True)
