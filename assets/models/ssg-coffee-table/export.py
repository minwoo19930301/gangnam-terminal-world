"""Run after authoring or open the editable .blend and run this script."""
import bpy
from pathlib import Path
OUT=Path(__file__).resolve().parent
collection=bpy.data.collections['SSG_9F_Molteni']
for name in sorted({o.data.materials[0]['batch'] for o in collection.objects}):
    group=[o for o in collection.objects if o.data.materials[0]['batch']==name]
    mat=group[0].data.materials[0]
    if name=='MolteniGallery':
        mat=mat.copy()
        tint=mat.node_tree.nodes.new('ShaderNodeVertexColor'); tint.layer_name='Tint'
        mat.node_tree.links.new(tint.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for o in group:
        if name=='MolteniGallery':
            color=o.data.materials[0].diffuse_color[:]
            tint=o.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
            for c in tint.data:c.color=color
            o.data.materials[0]=mat
        o.select_set(True)
    bpy.context.view_layer.objects.active=group[0]
    if len(group)>1:bpy.ops.object.join()
    bpy.context.object.name=name
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'lounge.glb'),export_format='GLB',export_yup=True,export_animations=False)
