"""Batch by surface finish for the game. The on-disk editable file stays intact."""
from pathlib import Path
import bpy
OUT=Path(__file__).resolve().parent
collection=bpy.data.collections['SSG_9F_TWL']
for finish in ('Oak','Timber','Glaze','Stoneware','Metal'):
    group=[o for o in collection.objects if o.data.materials[0].get('finish')==finish]
    mat=group[0].data.materials[0].copy()
    mat.name='TWL '+finish
    attr=mat.node_tree.nodes.new('ShaderNodeVertexColor')
    attr.layer_name='Tint'
    if finish=='Oak':
        # glTF multiplies COLOR_0 into the baseColorTexture automatically.
        tex=next(n for n in mat.node_tree.nodes if n.type=='TEX_IMAGE')
        mat.node_tree.links.new(tex.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    else:
        mat.node_tree.links.new(attr.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for o in group:
        color=o.data.materials[0].diffuse_color[:]
        tint=o.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
        for item in tint.data:item.color=color
        o.data.materials.clear()
        o.data.materials.append(mat)
        o.select_set(True)
    bpy.context.view_layer.objects.active=group[0]
    bpy.ops.object.join()
    bpy.context.object.name='TWL'+finish
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_yup=True,export_animations=False)
