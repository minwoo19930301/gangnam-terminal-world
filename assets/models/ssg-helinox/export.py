"""Export the edited Snow Peak showroom in three draws with original cloth, paint and metal finishes."""
from pathlib import Path
import bpy
import sys
out=Path(__file__).resolve().parent
sys.dont_write_bytecode=True;sys.path.insert(0,str(out))
from vessels import NEUTRAL
collection=bpy.data.collections['SSG_8F_SnowPeak']
existing=bpy.data.materials['Snow Peak · steel and titanium']
batches=['SnowPeakGangnamCanvas','SnowPeakGangnamHardware','SnowPeakGangnamWeave']
joined=[]
for group in batches:
    objects=[ob for ob in collection.objects if ob.get('retailBatch')==group]
    metal=group.endswith('Hardware');fabric=group.endswith('Weave')
    if metal:
        material=existing.copy();material.name=group
    else:
        material=bpy.data.materials.new(group);material.use_nodes=True
        tree=material.node_tree;shader=tree.nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=.80
        if fabric:
            tex=tree.nodes.new('ShaderNodeTexImage');tex.image=next(im for im in bpy.data.images if 'weave' in im.name)
            tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
        else:
            colors=tree.nodes.new('ShaderNodeVertexColor');colors.layer_name='Finish'
            tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:
        mesh=ob.data;rgba=mesh.materials[0].diffuse_color[:]
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        painted=ob.get('vesselPaint')
        if metal and not mesh.uv_layers:
            uv=mesh.uv_layers.new(name='Metal finish')
            for loop in uv.data:loop.uv=NEUTRAL
        for vertex,item in zip(mesh.vertices,attr.data):
            normal=vertex.normal
            if painted:
                item.color=(1,1,1,1);continue
            if metal:
                streak=max(0,normal.x*.78-normal.y*.62)**7
                shade=.72+.22*max(0,normal.z)+.50*streak
            elif fabric:shade=.85+.12*max(0,normal.z)+.10*max(0,-normal.x)
            else:shade=.96+.04*max(0,normal.z)
            item.color=tuple(min(1,c*shade) for c in rgba[:3])+(1,)
        mesh.materials.clear();mesh.materials.append(material);ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();joined.append(bpy.context.object);joined[-1].name=group
bpy.ops.object.select_all(action='DESELECT')
for ob in joined:ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out/'gallery.glb'),export_format='GLB',use_selection=True,export_animations=False)
# Blender 3.6 combines the two image channels into a white placeholder on
# export. Preserve the packed G/B values edited in the native master.
import json
import struct
file=out/'gallery.glb'
raw=file.read_bytes();json_size=struct.unpack_from('<I',raw,12)[0]
doc=json.loads(raw[20:20+json_size]);binary=bytearray(raw[28+json_size:])
response=next(image for image in doc['images'] if 'vessel-response' in image['name'])
packed=bpy.data.images['vessel-response.png'].packed_file.data
view=doc['bufferViews'][response['bufferView']];view['byteOffset']=len(binary);view['byteLength']=len(packed)
binary.extend(packed);binary.extend(bytes((-len(binary))%4));doc['buffers'][0]['byteLength']=len(binary)
header=json.dumps(doc,ensure_ascii=False,separators=(',',':')).encode();header+=b' '*((-len(header))%4)
length=28+len(header)+len(binary)
file.write_bytes(struct.pack('<4sIII4s',b'glTF',2,length,len(header),b'JSON')+header+struct.pack('<I4s',len(binary),b'BIN\0')+binary)
