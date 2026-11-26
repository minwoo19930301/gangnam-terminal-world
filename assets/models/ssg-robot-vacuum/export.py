"""Bake the showroom parts into material batches. Do not overwrite the native source."""
from pathlib import Path
import bpy

out=Path(__file__).resolve().parent
collection=bpy.data.collections['SSG_9F_Roborock']
for category in ('Display','Optics','Oak'):
    objects=[o for o in collection.objects if o.data.materials[0]['batch']==category]
    material=objects[0].data.materials[0].copy()
    if category!='Oak':
        color=material.node_tree.nodes.new('ShaderNodeVertexColor')
        color.layer_name='Tint'
        bs=material.node_tree.nodes.get('Principled BSDF')
        material.node_tree.links.new(color.outputs['Color'],bs.inputs['Base Color'])
        material.diffuse_color=(1,1,1,1)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        if category!='Oak':
            tint=obj.data.materials[0].diffuse_color[:]
            attr=obj.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
            for item in attr.data: item.color=tint
        obj.data.materials.clear()
        obj.data.materials.append(material)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1: bpy.ops.object.join()
    bpy.context.object.name='Roborock'+category
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(out/'gallery.glb'),export_format='GLB',export_animations=False)
