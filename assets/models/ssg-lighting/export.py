"""Derive three draw batches from the editable showroom without altering its saved file."""

from pathlib import Path
import json
import struct
import sys

import bmesh
import bpy

OUT = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(OUT))
import surfaces

collection = bpy.data.collections["SSG_9F_Lightnow"]
images = [bpy.data.images[k] for k in (surfaces.COLOR, surfaces.NORMAL, surfaces.ORM)]


def material(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree.nodes["Principled BSDF"]


def set_tint(obj):
    source = obj.data.materials[0].diffuse_color[:]
    if obj.get("atlasSurface"):
        source = (1,1,1,1)
    tint = obj.data.color_attributes.new(name="Tint", type="BYTE_COLOR", domain="POINT")
    for index, point in enumerate(tint.data):
        relief = .72 if obj.get("pleat_segments") and index%2 else 1
        point.color = tuple(x*relief for x in source[:3])+(1,)


def remove_inner_walls(obj):
    mesh=obj.data
    mask=mesh.attributes.get("outerAndLip")
    if not mask:
        return
    hidden=[face.index for face,tag in zip(mesh.polygons,mask.data) if not tag.value]
    bm=bmesh.new();bm.from_mesh(mesh);bm.faces.ensure_lookup_table()
    bmesh.ops.delete(bm,geom=[bm.faces[i] for i in hidden],context="FACES")
    bm.to_mesh(mesh);bm.free();mesh.update()
    carried=mesh.attributes.get("outerAndLip")
    if carried:
        mesh.attributes.remove(carried)


opaque, node = material("Lightnow · paint, anodised metal and whitewashed timber")
surfaces.textured(opaque, images, tint=True)
glass, node = material("Lightnow · thin clear glass")
glass["lightnowBlownGlass"] = True
glass.blend_method="BLEND"
glass.use_backface_culling=True
node.inputs["Metallic"].default_value=.10
node.inputs["Roughness"].default_value=.09
values=glass.node_tree.nodes.new("ShaderNodeVertexColor")
values.layer_name="Window"
glass.node_tree.links.new(values.outputs["Color"],node.inputs["Base Color"])
glass.node_tree.links.new(values.outputs["Alpha"],node.inputs["Alpha"])
diffuser, node = material("Lightnow · opaline shades and powered silicone")
node.inputs["Roughness"].default_value=.32
tint=diffuser.node_tree.nodes.new("ShaderNodeVertexColor");tint.layer_name="Tint"
diffuser.node_tree.links.new(tint.outputs["Color"],node.inputs["Base Color"])
light=bpy.data.images.new("Lightnow · two optical intensities",width=16,height=4,alpha=False)
light.pixels.foreach_set([v for _ in range(4) for x in range(16)
                         for v in ((.423,.381,.306,1) if x<8 else (.98,.86,.67,1))])
light.pack()
tex=diffuser.node_tree.nodes.new("ShaderNodeTexImage");tex.image=light
diffuser.node_tree.links.new(tex.outputs["Color"], node.inputs["Emission"])
node.inputs["Emission Strength"].default_value=2.2

outputs = {
    "LightnowFinish": (opaque, []),
    # Keep the existing slot name so live callers and the single-draw coarse
    # fixture continue to work. All opaque metals now use the finish atlas.
    "LightnowMetal": (glass, []),
    "LightnowDiffuser": (diffuser, []),
}
for obj in list(collection.objects):
    src=obj.data.materials[0];group=src["batch"]
    if group=="Glass":
        name="LightnowMetal";remove_inner_walls(obj)
        obj.data.color_attributes.active_color=obj.data.color_attributes["Window"]
    elif group=="Diffuser":
        name="LightnowDiffuser";set_tint(obj)
        uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name="Light intensity")
        uv.name="Light intensity"
        coord=(.75,.50) if src.get("ledRing") else (.25,.50)
        for loop in uv.data:
            loop.uv=coord
    else:
        name="LightnowFinish";set_tint(obj)
        if not obj.get("atlasSurface"):
            surfaces.uv_for(obj)
    mat,objs=outputs[name];obj.data.materials.clear();obj.data.materials.append(mat);objs.append(obj)

for name,(mat,objs) in outputs.items():
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active=objs[0]
    bpy.ops.object.join();obj=bpy.context.object;obj.name=name
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)

file=OUT/"lightnow.glb"
bpy.ops.export_scene.gltf(filepath=str(file),export_format="GLB",export_yup=True,export_animations=False,export_extras=True)
# Blender 3.6 repacks scalar channels when exporting a shader. Carry over the
# exact baked RGB channels (including the metal LUT) from the editable atlas.
raw=file.read_bytes();jsize=struct.unpack_from("<I",raw,12)[0]
doc=json.loads(raw[20:20+jsize]);payload=bytearray(raw[28+jsize:])
mat=next(m for m in doc["materials"] if m["name"]==opaque.name)
ti=mat["pbrMetallicRoughness"]["metallicRoughnessTexture"]["index"]
image=doc["images"][doc["textures"][ti]["source"]]
source=images[2].packed_file.data
doc["bufferViews"][image["bufferView"]].update(byteOffset=len(payload),byteLength=len(source))
payload.extend(source);payload.extend(b"\0"*(-len(payload)%4))
doc["buffers"][0]["byteLength"]=len(payload)
encoded=json.dumps(doc,separators=(",",":"),ensure_ascii=False).encode()
encoded+=b" "*(-len(encoded)%4)
file.write_bytes(struct.pack("<4sII",b"glTF",2,28+len(encoded)+len(payload))
                 +struct.pack("<I4s",len(encoded),b"JSON")+encoded
                 +struct.pack("<I4s",len(payload),b"BIN\0")+payload)
