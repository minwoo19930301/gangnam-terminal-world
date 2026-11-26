"""Batch the editable native collection in memory, without resaving the blend."""
from pathlib import Path
import bpy
out=Path(__file__).resolve().parent
gallery=bpy.data.collections['SSG_9F_Baccarat']
for mat in list(bpy.data.materials):
    pieces=[obj for obj in gallery.objects if obj.data.materials[0]==mat]
    if not pieces:continue
    bpy.ops.object.select_all(action='DESELECT')
    for piece in pieces:piece.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0]
    if len(pieces)>1:bpy.ops.object.join()
    bpy.context.object.name=mat.name
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(out/'gallery.glb'),export_format='GLB',export_yup=True,export_animations=False)
