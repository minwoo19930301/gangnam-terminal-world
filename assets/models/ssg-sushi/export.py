"""Generate a batched web copy of the edited Kisara source collection."""
from pathlib import Path
import json
import struct
import sys
import bpy

out=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(out))
import food_surfaces
col=bpy.data.collections['SSG_11F_Kisara']
for batch in ['KisaraDining','KisaraBrushedSteel','KisaraGlazedServing']:
    parts=[ob for ob in col.objects if ob.data.materials[0]['batch']==batch]
    bpy.ops.object.select_all(action='DESELECT')
    if batch!='KisaraGlazedServing':
        mat=bpy.data.materials['보온병 무광 은빛' if batch=='KisaraBrushedSteel' else '주전자 손잡이 · 칠기'].copy()
        tint=mat.node_tree.nodes.new('ShaderNodeVertexColor');tint.layer_name='Tint'
        mat.node_tree.links.new(tint.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
        for ob in parts:
            color=ob.data.materials[0].diffuse_color[:]
            if not ob.data.color_attributes.get('Tint'):
                attr=ob.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
                for c in attr.data:c.color=color
            ob.data.materials.clear();ob.data.materials.append(mat)
    mat=parts[0].data.materials[0];mat.name=batch
    for ob in parts:ob.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();bpy.context.object.name=batch
file=out/'gallery.glb'
bpy.ops.export_scene.gltf(filepath=str(file),export_format='GLB',export_animations=False)
# Blender's generated combined-data image resamples scalar channels; the
# packed original keeps glazes, lean fish, garnish and wood distinct.
raw=file.read_bytes();sz=struct.unpack_from("<I",raw,12)[0]
doc=json.loads(raw[20:20+sz]);binary=bytearray(raw[28+sz:])
mat=next(m for m in doc["materials"] if m["name"]=="KisaraGlazedServing")
tex=mat["pbrMetallicRoughness"]["metallicRoughnessTexture"]["index"]
im=doc["images"][doc["textures"][tex]["source"]]
data=bpy.data.images[food_surfaces.NAMES[2]].packed_file.data
doc["bufferViews"][im["bufferView"]].update(byteOffset=len(binary),byteLength=len(data))
binary.extend(data);binary.extend(b"\0"*(-len(binary)%4))
doc["buffers"][0]["byteLength"]=len(binary)
encoded=json.dumps(doc,separators=(",",":"),ensure_ascii=False).encode()
encoded+=b" "*(-len(encoded)%4)
file.write_bytes(struct.pack("<4sII",b"glTF",2,28+len(encoded)+len(binary))
                 +struct.pack("<I4s",len(encoded),b"JSON")+encoded
                 +struct.pack("<I4s",len(binary),b"BIN\0")+binary)
