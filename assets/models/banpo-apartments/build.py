"""Create the editable exterior library from the three uncompressed elevation-map GLBs."""
import bpy
import hashlib
import json
import struct
import subprocess
import sys
from pathlib import Path
from mathutils import Euler
from math import radians

here = Path(__file__).resolve().parent
source = Path(sys.argv[sys.argv.index("--") + 1])
catalog = json.loads((here.parents[2] / "js/places/_re_models.json").read_text())["models"]
files = {
    "apt-a13790828": ("신반포4차", "39a634e9dad79cfc9654cc52c9ab9f43d5853365c4a94d53b3b7f00278c8dd8f"),
    "apt-a10023673": ("반포르엘", "a4b287631cc5b6f1f2d5080a0f613a7d5bfbf6f8e5a3073a62c8e93939df5ec5"),
    "apt-a10024913": ("반포센트럴자이", "002c9fe4e6a19c2bd1c4787278de042b2301eb71b4351d957118b93238e6bcd4"),
}
def preserve_linear_colours(mesh, raw):
    # Blender 4.5 imports vertex colours into display-encoded bytes. These three
    # source GLBs use *linear* UNORM8 colours, so that conversion loses palette
    # entries. Keep their exact source values in an editable float colour layer.
    json_size = struct.unpack_from("<I", raw, 12)[0]
    gltf = json.loads(raw[20:20 + json_size])
    payload = memoryview(raw)[28 + json_size:]

    def unpack_attribute(index, fmt):
        accessor = gltf["accessors"][index]
        view = gltf["bufferViews"][accessor["bufferView"]]
        offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
        layout = struct.Struct(fmt)
        stride = view.get("byteStride", layout.size)
        return [layout.unpack_from(payload, offset + i * stride) for i in range(accessor["count"])]

    palette = {}
    for primitive in gltf["meshes"][0]["primitives"]:
        attributes = primitive["attributes"]
        positions = unpack_attribute(attributes["POSITION"], "<3f")
        colours = unpack_attribute(attributes["COLOR_0"], "<4B")
        for (east, up, south), value in zip(positions, colours, strict=True):
            key = (primitive["material"], east, -south, up)
            assert palette.setdefault(key, value) == value

    prior = mesh.color_attributes.active_color
    name = prior.name
    mesh.color_attributes.remove(prior)
    layer = mesh.color_attributes.new(name, "FLOAT_COLOR", "CORNER")
    for face in mesh.polygons:
        for index in face.loop_indices:
            point = mesh.vertices[mesh.loops[index].vertex_index].co
            value = palette[(face.material_index, *point)]
            layer.data[index].color = tuple(c / 255 for c in value)
    mesh.color_attributes.active_color = layer
    mesh.color_attributes.render_color_index = mesh.color_attributes.find(name)


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "신반포로 · 아파트 외관"
scene.unit_settings.system = "METRIC"
objects = {}
points = {}
for model_id, (name, expected) in files.items():
    row = next(m for m in catalog if m["id"] == model_id)
    asset = source / (model_id + ".glb")
    raw = asset.read_bytes()
    if hashlib.sha256(raw).hexdigest() != expected:
        raise ValueError(f"Expected the original elevation-map file for {model_id}")
    original = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(asset), merge_vertices=False)
    mesh_object, = [obj for obj in set(bpy.data.objects) - original if obj.type == "MESH"]
    preserve_linear_colours(mesh_object.data, raw)
    mesh_object.name = name
    mesh_object.data.name = name + " · 외벽과 창"
    mesh_object["estate_id"] = model_id
    mesh_object["source_sha256"] = expected
    mesh_object["claimed_footprints"] = row["claims"]
    mesh_object.location = (row["x"], -row["z"], row["y"])
    coll = bpy.data.collections.new(name + " · 외관")
    coll["estate_id"] = model_id
    scene.collection.children.link(coll)
    for old in list(mesh_object.users_collection):
        old.objects.unlink(mesh_object)
    coll.objects.link(mesh_object)
    objects[model_id] = mesh_object
    points[model_id] = [list(v.co[:2]) for v in mesh_object.data.vertices]

levels = json.loads(subprocess.run(
    ["node", str(here / "ground-levels.mjs")], input=json.dumps(points),
    text=True, capture_output=True, check=True
).stdout)
for model_id, obj in objects.items():
    obj.shape_key_add(name="Basis")
    city = obj.shape_key_add(name="게임 지형 높이")
    for vertex, dz in zip(city.data, levels[model_id], strict=True):
        vertex.co.z += dz
    city.value = 1.0

# Material preview uses the source's vertex colours on walls and glazing.
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == "VIEW_3D":
            view = area.spaces.active
            view.shading.color_type = "VERTEX"
            view.clip_end = 4000
            view.region_3d.view_location = (-60, 309, 42)
            view.region_3d.view_distance = 620
            view.region_3d.view_rotation = Euler((radians(64), 0, radians(-18))).to_quaternion()
bpy.ops.object.select_all(action="DESELECT")
bpy.context.view_layer.objects.active = None
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / "banpo-apartments.blend"), compress=True)
