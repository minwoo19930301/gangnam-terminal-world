"""Batch a disposable copy of the editable scene by surface finish."""
from pathlib import Path
import bpy
OUT=Path(__file__).resolve().parent
collection=bpy.data.collections['SSG_9F_Kwangjuyo']
for obj in list(collection.objects):
    if obj.type!='MESH':
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.convert(target='MESH')
for finish in ('Glaze','Bronze','Fixture'):
    group=[o for o in collection.objects if o.data.materials[0]['batch']==finish]
    mat=group[0].data.materials[0].copy()
    shader=mat.node_tree.nodes.get('Principled BSDF')
    attr=mat.node_tree.nodes.new('ShaderNodeVertexColor')
    attr.layer_name='Tint'
    mat.node_tree.links.new(attr.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for obj in group:
        m=obj.data.materials[0]
        if not obj.data.color_attributes.get('Tint'):
            tint=obj.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
            for item in tint.data:item.color=m.diffuse_color
        obj.data.materials.clear()
        obj.data.materials.append(mat)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=group[0]
    bpy.ops.object.join()
    bpy.context.object.name='Kwangjuyo'+finish
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'showroom.glb'),export_format='GLB',export_yup=True,export_animations=False)
