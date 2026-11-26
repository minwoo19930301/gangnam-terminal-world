"""Bake the edited entrance plaque and export the two ordinary in-game render slots."""

from pathlib import Path
import sys, struct, json, zlib
import bpy
import numpy as np

OUT = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(OUT))
import finishes
import mosaic

collection = bpy.data.collections["SSG_10F_SnoopyPlace"]
plaque = next(o for o in collection.objects if o.get("tileGrid"))
stamp = hex(zlib.crc32(mosaic.native_colors(plaque).astype("<f4").tobytes()))
if plaque.get("bakedTileColors") != stamp:
    # Repainted native ceramic cells take effect in the same single game quad.
    finishes.images(plaque)
mosaic.proxy(plaque, finishes.TILE_UV)
mat = bpy.data.materials["Paint, cloth and printed goods"]


def downsample(obj):
    src = obj.data
    n, m, n_out, m_out = obj["ovalResolution"]
    if len(src.vertices) != n * (m + 1):
        # Keep hand-altered topology rather than reconstructing the old ellipsoid.
        return
    uv = np.arange(n_out) * n / n_out
    i0 = uv.astype(int)
    u = (uv - i0)[:, None]
    i1 = (i0 + 1) % n
    xyz = np.array([v.co[:] for v in src.vertices]).reshape(m + 1, n, 3)
    attr = src.color_attributes.get("Paint")
    tint = np.array([item.color[:] for item in attr.data]).reshape(m + 1, n, 4)

    def rows(arr):
        points = []
        for j in range(m_out + 1):
            v = j * m / m_out
            lo = int(v)
            hi = min(m, lo + 1)
            f = v - lo
            a = arr[lo] * (1 - f) + arr[hi] * f
            points.extend(a[i0] * (1 - u) + a[i1] * u)
        return np.asarray(points)

    points = rows(xyz)
    colors = rows(tint)
    faces = [
        (
            j * n_out + i,
            j * n_out + (i + 1) % n_out,
            (j + 1) * n_out + (i + 1) % n_out,
            (j + 1) * n_out + i,
        )
        for j in range(m_out)
        for i in range(n_out)
    ]
    faces.extend(
        [
            tuple(range(n_out - 1, -1, -1)),
            tuple(range(m_out * n_out, (m_out + 1) * n_out)),
        ]
    )
    dest = bpy.data.meshes.new(src.name + " · 작은 상품")
    dest.from_pydata(points, [], faces)
    dest.update()
    obj.data = dest
    if not src.users:
        bpy.data.meshes.remove(src)
    for face in dest.polygons:
        face.use_smooth = True
    finishes.color_and_uv(obj, (1, 1, 1, 1), "plain")
    out = dest.color_attributes["Paint"]
    for item, col in zip(out.data, colors):
        item.color = col


for obj in collection.objects:
    if obj.get("ovalResolution"):
        downsample(obj)

for batch, shader in [
    ("GangnamSnoopyPlaceDoghouseAndGoods", mat),
    ("GangnamSnoopyPlaceMosaic", bpy.data.materials["Glazed mosaic"]),
]:
    parts = [o for o in collection.objects if o.get("snoopyBatch") == batch]
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        obj.data.materials.clear()
        obj.data.materials.append(shader)
        obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    bpy.context.object.name = batch
file = OUT / "snoopy-place.glb"
bpy.ops.export_scene.gltf(
    filepath=str(file), export_format="GLB", export_animations=False
)
# Embed the original packed G-channel roughness when the Blender 3.6 exporter
# combines scalar channels into a temporary image.
raw = file.read_bytes()
size = struct.unpack_from("<I", raw, 12)[0]
doc = json.loads(raw[20 : 20 + size])
binary = bytearray(raw[28 + size :])
paint = next(m for m in doc["materials"] if m["name"] == mat.name)
ti = paint["pbrMetallicRoughness"]["metallicRoughnessTexture"]["index"]
im = doc["images"][doc["textures"][ti]["source"]]
src = bpy.data.images[finishes.IMAGE_NAMES[2]].packed_file.data
doc["bufferViews"][im["bufferView"]].update(byteOffset=len(binary), byteLength=len(src))
binary.extend(src)
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
