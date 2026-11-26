"""Build three rendering surfaces from the artist's editable Garmin collection."""
from pathlib import Path
import sys
import bpy

OUT=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
import screens

gallery=bpy.data.collections['SSG_8F_Garmin']
groups={}
for ob in list(gallery.objects):
    # At the rear wall a 1-2 mm groove or bolt is generally subpixel. Keep
    # those editable on every native copy and on the prominent front samples.
    if ob.get('watchView')=='wall' and ob.name.startswith(('밴드 미세 사선 홈','버클','실리콘 고정 고리','러그 핀','러그 나사','푸셔 캡','티타늄 각인 베젤')):
        bpy.data.objects.remove(ob,do_unlink=True)
        continue
    groups.setdefault(ob['retailDrawGroup'],[]).append(ob)
for group,objects in groups.items():
    mat=bpy.data.materials.new(group);mat.use_nodes=True;p=mat.node_tree.nodes['Principled BSDF']
    if group in ('GarminGangnamWatches','GarminGangnamMetal'):
        screens.shade(mat,[bpy.data.images[screens.COLOUR],bpy.data.images[screens.EMISSION]],True,group=='GarminGangnamWatches')
        if group=='GarminGangnamMetal':
            p.inputs['Metallic'].default_value=.58;p.inputs['Roughness'].default_value=.30
    else:
        vc=mat.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='Finish'
        mat.node_tree.links.new(vc.outputs['Color'],p.inputs['Base Color'])
        p.inputs['Metallic'].default_value=.46 if group.endswith('Metal') else 0
        p.inputs['Roughness'].default_value=.30 if group.endswith('Metal') else .56
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:
        me=ob.data;attr=me.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
        original=ob.get('displayPanel')
        for poly in me.polygons:
            color=(1,1,1,1) if original else me.materials[poly.material_index].diffuse_color[:]
            for i in poly.loop_indices:attr.data[i].color=color
        if group in ('GarminGangnamWatches','GarminGangnamMetal') and not me.uv_layers:
            # Non-screen meshes sample a neutral texel in the same draw.
            layer=me.uv_layers.new(name='Display')
            for loop in layer.data:loop.uv=(.923,.053)
        me.materials.clear();me.materials.append(mat);ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name=group
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
