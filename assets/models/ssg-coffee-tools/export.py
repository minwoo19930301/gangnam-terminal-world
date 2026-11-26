"""Export the editable gallery from the active Blender file, without saving over it."""
from pathlib import Path
import bpy
OUT = Path(__file__).resolve().parent
gallery = bpy.data.collections['SSG_9F_JURA']
# Batch evaluated pieces for delivery, preserving individual parts in the saved native file.
for category in ('Enamel','Steel','Wood','Light','Crystal'):
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
            for vertex,item in zip(o.data.vertices,colors.data):
                if o.get('crystal_facets'):
                    value=(.13,.53,.30,.72,.21)[(vertex.index*7+vertex.index//16)%5]
                    item.color=(value*.91,value*.97,value,1)
                elif o.get('satin_black'):
                    value=(.021,.035,.070,.031,.016)[vertex.index%5]
                    item.color=(value*.96,value,value*1.03,1)
                else:
                    item.color=color
        o.data.materials.clear();o.data.materials.append(mat);o.select_set(True)
    bpy.context.view_layer.objects.active=group[0]
    if len(group)>1:bpy.ops.object.join()
    joined=bpy.context.object;joined.name='JuraBar'+category
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_yup=True,export_animations=False)
