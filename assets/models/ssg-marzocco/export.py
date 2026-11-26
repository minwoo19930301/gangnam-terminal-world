"""Export the editable gallery from the active Blender file, without saving over it."""
from pathlib import Path
import bpy
OUT = Path(__file__).resolve().parent
gallery = bpy.data.collections['SSG_9F_LaMarzocco']
# Batch evaluated pieces for delivery, preserving individual parts in the saved native file.
for category in ('Enamel','Steel','Artwork','Lettering','Hopper'):
    group=[o for o in gallery.objects if o.data.materials[0].get('gallery_finish')==category]
    mat=group[0].data.materials[0]
    if category in ('Enamel','Steel'):
        mat=mat.copy();mat.name='Batch '+category
        mat.diffuse_color=(1,1,1,1)
    if category in ('Enamel','Steel'):
        tint=mat.node_tree.nodes.new('ShaderNodeVertexColor');tint.layer_name='Tint'
        mat.node_tree.links.new(tint.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for o in group:
        if category in ('Enamel','Steel'):
            color=o.data.materials[0].diffuse_color[:]
            colors=o.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
            for item in colors.data:item.color=color
        o.data.materials.clear();o.data.materials.append(mat);o.select_set(True)
    bpy.context.view_layer.objects.active=group[0]
    if len(group)>1:bpy.ops.object.join()
    joined=bpy.context.object;joined.name='Marzocco'+category
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_yup=True,export_animations=False)
