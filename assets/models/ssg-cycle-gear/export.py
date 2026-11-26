"""Export both render groups from a saved, editable Gangnam display."""

from pathlib import Path
import json
import struct
import bpy
import bmesh

out = Path(__file__).resolve().parent
col = bpy.data.collections["SSG_8F_Brompton"]
batches = ["BromptonGangnamCycles", "BromptonGangnamFixtures"]
# Retain the visible link faces on the two sides of the chain. The
# submillimetre plate edges and the sections of pins inside them are solid
# editable metalwork in the native model.
for ob in col.objects:
    if not ob.get("chainJoints"):
        continue
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    mid = ob["chainPlane"]
    if "플레이트" in ob.name:
        discard = [
            f
            for f in bm.faces
            if abs(f.normal.y) < 0.9
            or (f.calc_center_median().y - mid) * f.normal.y <= 0
        ]
    elif "리벳" in ob.name:
        discard = [f for f in bm.faces if abs(f.normal.y) < 0.9]
    else:
        discard = [f for f in bm.faces if abs(f.normal.y) > 0.9]
    bmesh.ops.delete(bm, geom=discard, context="FACES")
    bm.to_mesh(ob.data)
    bm.free()
for batch in batches:
    parts = [o for o in col.objects if o.get("cycleBatch") == batch]
    if not parts:
        raise ValueError("Missing display batch " + batch)
    mat = bpy.data.materials[batch]
    bpy.ops.object.select_all(action="DESELECT")
    for ob in parts:
        ob.data.materials.clear()
        ob.data.materials.append(mat)
        ob.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    bpy.context.object.name = batch
bpy.ops.export_scene.gltf(
    filepath=str(out / "gallery.glb"), export_format="GLB", export_animations=False
)
# Blender 3.6 combines roughness and metallic into a new image even if the
# generated source is already in the glTF channel layout. Embed its packed PNG.
file = out / "gallery.glb"
raw = file.read_bytes()
size = struct.unpack_from("<I", raw, 12)[0]
doc = json.loads(raw[20 : 20 + size])
binary = bytearray(raw[28 + size :])
source = bpy.data.images["브롬톤 · 거칠기와 금속성"].packed_file.data
views = set()
for mat in doc["materials"]:
    if mat.get("name") in batches:
        i = mat["pbrMetallicRoughness"]["metallicRoughnessTexture"]["index"]
        views.add(doc["images"][doc["textures"][i]["source"]]["bufferView"])
for i in views:
    doc["bufferViews"][i].update(byteOffset=len(binary), byteLength=len(source))
    binary.extend(source)
    binary.extend(b"\0" * (-len(binary) % 4))
doc["buffers"][0]["byteLength"] = len(binary)
encoded = json.dumps(doc, separators=(",", ":"), ensure_ascii=False).encode()
encoded += b" " * (-len(encoded) % 4)
file.write_bytes(
    struct.pack("<4sII", b"glTF", 2, 28 + len(encoded) + len(binary))
    + struct.pack("<I4s", len(encoded), b"JSON")
    + encoded
    + struct.pack("<I4s", len(binary), b"BIN\0")
    + binary
)
