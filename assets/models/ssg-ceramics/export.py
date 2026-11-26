"""Keep the existing three runtime slots while retaining distinct physical finishes."""
from pathlib import Path
import sys
import struct
import json
import bpy

OUT=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
import finishes
collection=bpy.data.collections['SSG_9F_Kwangjuyo']
sample=next(m for m in bpy.data.materials if m.get('batch')=='Glaze' and
            any(getattr(n,'image',None) and n.image.name==finishes.NAMES[0] for n in m.node_tree.nodes))
for obj in list(collection.objects):
    if obj.type!='MESH':
        bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.convert(target='MESH')
groups={'KwangjuyoFixture':[],'KwangjuyoBronze':[],'KwangjuyoGlaze':[]}
for obj in collection.objects:
    mat=obj.data.materials[0];kind=mat['batch']
    if kind=='Bronze':
        # Frame and silver utensils share the craft atlas' metal channel.
        # Their native bronze material remains independently editable.
        # Frames use a repeated longitudinal grain. A minimum tile size keeps
        # joins smooth on the small supports and on the bent type.
        finishes.assign(obj,sample,lambda i,v:('frame',v.x%1,v.z%1))
        group='KwangjuyoGlaze'
    elif kind=='Glaze':
        group='KwangjuyoGlaze'
    elif kind=='ColoredGlass':
        # Preserve the pre-existing slot names in old and new game clients.
        # This independently sorted slot holds the glass bowls and glass shelf.
        group='KwangjuyoBronze'
    else:group='KwangjuyoFixture'
    groups[group].append(obj)
for group,objs in groups.items():
    if group=='KwangjuyoFixture':
        outmat=bpy.data.materials.new(group);outmat.use_nodes=True
        p=outmat.node_tree.nodes['Principled BSDF'];p.inputs['Roughness'].default_value=.56
        attr=outmat.node_tree.nodes.new('ShaderNodeVertexColor');attr.layer_name='Tint'
        outmat.node_tree.links.new(attr.outputs['Color'],p.inputs['Base Color'])
        for ob in objs:
            mat=ob.data.materials[0]
            if not ob.data.color_attributes.get('Tint'):
                tint=ob.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
                for c in tint.data:c.color=mat.diffuse_color
            ob.data.materials.clear();ob.data.materials.append(outmat)
    if group=='KwangjuyoGlaze':sample.name='KwangjuyoCraftSurfaces'
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objs:ob.select_set(True)
    bpy.context.view_layer.objects.active=objs[0]
    if len(objs)>1:bpy.ops.object.join()
    bpy.context.object.name=group
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
file=OUT/'showroom.glb'
bpy.ops.export_scene.gltf(filepath=str(file),export_format='GLB',export_yup=True,export_animations=False)
# Use the artist's actual packed roughness/metal response instead of the
# temporary channel-combination image written by Blender 3.6's exporter.
raw=file.read_bytes();sz=struct.unpack_from('<I',raw,12)[0]
doc=json.loads(raw[20:20+sz]);binary=bytearray(raw[28+sz:])
mat=next(m for m in doc['materials'] if m['name']=='KwangjuyoCraftSurfaces')
tex=mat['pbrMetallicRoughness']['metallicRoughnessTexture']['index'];im=doc['images'][doc['textures'][tex]['source']]
data=bpy.data.images[finishes.NAMES[2]].packed_file.data
doc['bufferViews'][im['bufferView']].update(byteOffset=len(binary),byteLength=len(data))
binary.extend(data);binary.extend(b'\0'*(-len(binary)%4));doc['buffers'][0]['byteLength']=len(binary)
encoded=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode();encoded+=b' '*(-len(encoded)%4)
file.write_bytes(struct.pack('<4sII',b'glTF',2,28+len(encoded)+len(binary))+
                 struct.pack('<I4s',len(encoded),b'JSON')+encoded+
                 struct.pack('<I4s',len(binary),b'BIN\0')+binary)
