"""Batch the saved display by finish in memory. Keep all source pieces editable."""
from pathlib import Path
import bpy

out=Path(__file__).resolve().parent
collection=bpy.data.collections['SSG_9F_KitchenTool']
# Reduce angular sampling only on small rotational parts; retain the complete
# radial profile, distinct foot, lip and well and all vertices of the handles.
for o in collection.objects:
    if o.get('segments')!=48 or o['radius']>.115:
        continue
    src=o.data
    n=24 if o['radius']<.082 else 32
    indices=[k*48+round(j*48/n) for k in range(o['rings']) for j in range(n)]
    faces=[tuple(reversed(range(n)))] if o['caps'] else []
    for k in range(o['rings']-1):
        faces.extend((k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j) for j in range(n))
    if o['caps']:faces.append(tuple(range((o['rings']-1)*n,o['rings']*n)))
    data=bpy.data.meshes.new(src.name+' 전송용')
    data.from_pydata([src.vertices[i].co[:] for i in indices],[],faces)
    data.materials.append(src.materials[0])
    for f in data.polygons:f.use_smooth=True
    attr=src.color_attributes.get('Tint')
    if attr:
        tint=data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
        for j,i in enumerate(indices):tint.data[j].color=attr.data[i].color
    o.data=data
for finish in ('Case','Glaze','Stone'):
    group=[o for o in collection.objects if o.data.materials[0]['batch']==finish]
    mat=group[0].data.materials[0].copy()
    if finish!='Stone':
        attr=mat.node_tree.nodes.new('ShaderNodeVertexColor')
        attr.layer_name='Tint'
        p=mat.node_tree.nodes.get('Principled BSDF')
        mat.node_tree.links.new(attr.outputs['Color'],p.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for o in group:
        if finish!='Stone' and not o.data.color_attributes.get('Tint'):
            color=o.data.materials[0].diffuse_color[:]
            layer=o.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
            for item in layer.data:item.color=color
        o.data.materials.clear()
        o.data.materials.append(mat)
        o.select_set(True)
    bpy.context.view_layer.objects.active=group[0]
    if len(group)>1:bpy.ops.object.join()
    bpy.context.object.name='KitchenToolHasami'+finish
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(out/'gallery.glb'),export_format='GLB',export_yup=True,export_animations=False)
