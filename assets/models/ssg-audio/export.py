"""Export the reopened editable collection into its two retail render slots."""

from pathlib import Path
import bpy

out = Path(__file__).resolve().parent
gallery = bpy.data.collections["SSG_9F_Scheherazade"]
for name in ["SchezadeDisplay", "SchezadeHeadphones"]:
    objects = [obj for obj in gallery.objects if obj.get("audioBatch") == name]
    if not objects:
        raise ValueError("Missing audio batch " + name)
    mat = bpy.data.materials[name]
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    bpy.context.object.name = name
bpy.ops.export_scene.gltf(
    filepath=str(out / "gallery.glb"), export_format="GLB", export_animations=False
)

# Blender 3.6 exports a white image when it recombines G/B channels of this
# generated, packed ORM. The editable material already contains the complete
# glTF-compatible image; embed those exact bytes in the exported buffer.
import json
import struct

file = out / "gallery.glb"
raw = file.read_bytes()
json_size = struct.unpack_from("<I", raw, 12)[0]
doc = json.loads(raw[20 : 20 + json_size])
binary = bytearray(raw[28 + json_size :])
material = next(m for m in doc["materials"] if m["name"] == "SchezadeHeadphones")
texture = material["pbrMetallicRoughness"]["metallicRoughnessTexture"]["index"]
image = doc["images"][doc["textures"][texture]["source"]]
source = bpy.data.images["청음대 · 거칠기와 금속성"].packed_file.data
view = doc["bufferViews"][image["bufferView"]]
view.update(byteOffset=len(binary), byteLength=len(source))
binary.extend(source)
binary.extend(b"\0" * (-len(binary) % 4))
doc["buffers"][0]["byteLength"] = len(binary)
encoded = json.dumps(doc, ensure_ascii=False, separators=(",", ":")).encode()
encoded += b" " * (-len(encoded) % 4)
file.write_bytes(
    struct.pack("<4sII", b"glTF", 2, 28 + len(encoded) + len(binary))
    + struct.pack("<I4s", len(encoded), b"JSON")
    + encoded
    + struct.pack("<I4s", len(binary), b"BIN\0")
    + binary
)
