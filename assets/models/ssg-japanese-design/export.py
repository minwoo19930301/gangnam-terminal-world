"""Batch a loaded library for glTF, keeping the saved Blender source editable."""
import bpy
from pathlib import Path
out=Path(__file__).resolve().parent
collection=bpy.data.collections['SSG_9F_TimeStyle']
for batch in sorted({o.data.materials[0]['batch'] for o in collection.objects}):
    items=[o for o in collection.objects if o.data.materials[0]['batch']==batch]
    bpy.ops.object.select_all(action='DESELECT')
    mat=items[0].data.materials[0]
    if batch=='TimeStyleObjects':
        mat=mat.copy()
        vertex=mat.node_tree.nodes.new('ShaderNodeVertexColor')
        vertex.layer_name='Tint'
        mat.node_tree.links.new(vertex.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    for ob in items:
        if batch=='TimeStyleObjects':
            tint=ob.data.materials[0].diffuse_color[:]
            attr=ob.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
            for c in attr.data:c.color=tint
            ob.data.materials[0]=mat
        ob.select_set(True)
    bpy.context.view_layer.objects.active=items[0]
    if len(items)>1:bpy.ops.object.join()
    bpy.context.object.name=batch
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(out/'dining.glb'),export_format='GLB',export_animations=False,export_yup=True)
