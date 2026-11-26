"""Batch the saveable native pieces while retaining their edited positions and colours."""

from pathlib import Path
import json
import struct
import sys
import bpy

OUT=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
import leathers
import game_lod

gallery=bpy.data.collections["SSG_6F_Berwick"]
imgs=[bpy.data.images[name] for name in leathers.NAMES]
groups={}
for obj in gallery.objects:
    if obj.get("stitchSection") and game_lod.simplify_threads(obj):
        uv=obj.data.uv_layers.new(name="Product surface")
        for loop in uv.data:loop.uv=leathers.sample_uv("thread",.5,.5)
    elif obj.get("flatTread"):
        game_lod.simplify_tread(obj)
    groups.setdefault(obj["retailDrawGroup"],[]).append(obj)
for batch,objects in groups.items():
    mat=bpy.data.materials.new(batch);mat.use_nodes=True
    p=mat.node_tree.nodes["Principled BSDF"]
    if batch=="BerwickGoodyearCalf":
        leathers.shader(mat,imgs)
    elif batch=="BerwickWool":
        tex=mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image=bpy.data.images["버윅 격자 직조"]
        mat.node_tree.links.new(tex.outputs["Color"],p.inputs["Base Color"])
        p.inputs["Roughness"].default_value=.68
    else:
        vc=mat.node_tree.nodes.new("ShaderNodeVertexColor");vc.layer_name="Finish"
        mat.node_tree.links.new(vc.outputs["Color"],p.inputs["Base Color"])
        p.inputs["Roughness"].default_value=.36 if batch=="BerwickFittings" else .68
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        leathers.vertex_tint(obj)
        obj.data.materials.clear();obj.data.materials.append(mat);obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    bpy.context.object.name=batch
file=OUT/"gallery.glb"
bpy.ops.export_scene.gltf(filepath=str(file),export_format="GLB",export_animations=False)
# Blender's generated combined-data image resamples scalar channels; the
# packed original retains the plateaus for polished calf, suede and metal.
raw=file.read_bytes();sz=struct.unpack_from("<I",raw,12)[0]
doc=json.loads(raw[20:20+sz]);binary=bytearray(raw[28+sz:])
mat=next(m for m in doc["materials"] if m["name"]=="BerwickGoodyearCalf")
tex=mat["pbrMetallicRoughness"]["metallicRoughnessTexture"]["index"]
im=doc["images"][doc["textures"][tex]["source"]]
data=imgs[2].packed_file.data
doc["bufferViews"][im["bufferView"]].update(byteOffset=len(binary),byteLength=len(data))
binary.extend(data);binary.extend(b"\0"*(-len(binary)%4))
doc["buffers"][0]["byteLength"]=len(binary)
encoded=json.dumps(doc,separators=(",",":"),ensure_ascii=False).encode()
encoded+=b" "*(-len(encoded)%4)
file.write_bytes(struct.pack("<4sII",b"glTF",2,28+len(encoded)+len(binary))
                 +struct.pack("<I4s",len(encoded),b"JSON")+encoded
                 +struct.pack("<I4s",len(binary),b"BIN\0")+binary)
