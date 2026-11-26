"""Seed the exterior and asset library scenes; edit the saved blend, then run export.py."""

import bpy
import json
import math
import sys
import runpy
from pathlib import Path
from mathutils import Vector


here = Path(__file__).resolve().parent
seed_dir = Path(sys.argv[sys.argv.index("--") + 1])
seed = json.loads((seed_dir / "seed.json").read_text())
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "반포 · 도시 전경"
scene.unit_settings.system = "METRIC"
scene.world = bpy.data.worlds.new("Seoul daylight")
scene.world.color = (0.4, 0.5, 0.62)
scene["source"] = (
    "© OpenStreetMap contributors. Contains modified Copernicus Sentinel data (2025). Canopy: Meta and WRI, 2026; source imagery © 2016 Vantor. See data/research/parcel-cover.md and js/banpo_dem.js."
)
scene["axis"] = "Blender X east, Y north, Z up; metres"


def collection(parent, name):
    coll = bpy.data.collections.new(name)
    parent.children.link(coll)
    return coll


def material(name, rgb, texture=None):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*rgb, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*rgb, 1)
    shader.inputs["Roughness"].default_value = 0.78
    if texture:
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(
            str(seed_dir / (texture + ".png")), check_existing=True
        )
        tex.image.pack()
        mat.node_tree.links.new(tex.outputs["Color"], shader.inputs["Base Color"])
        mat["game_texture"] = texture
        mask = seed_dir / (texture + "-windows.png")
        if mask.is_file():
            nodes = mat.node_tree.nodes

            def link(a, out, b, inp):
                mat.node_tree.links.new(a.outputs[out], b.inputs[inp])

            image = nodes.new("ShaderNodeTexImage")
            image.image = bpy.data.images.load(str(mask))
            image.image.pack()
            uv = nodes.new("ShaderNodeTexCoord")
            tile = nodes.new("ShaderNodeVectorMath")
            tile.operation = "FLOOR"
            link(uv, "UV", tile, 0)
            noise = nodes.new("ShaderNodeTexWhiteNoise")
            link(tile, 0, noise, 0)
            occupied = nodes.new("ShaderNodeMath")
            occupied.operation = "GREATER_THAN"
            occupied.inputs[1].default_value = 0.61
            link(noise, "Value", occupied, 0)
            lit = nodes.new("ShaderNodeMath")
            lit.operation = "MULTIPLY"
            link(image, "Color", lit, 0)
            link(occupied, 0, lit, 1)
            night = nodes.new("ShaderNodeValue")
            night.name = "Seoul window illumination"
            output = nodes.new("ShaderNodeMath")
            output.operation = "MULTIPLY"
            link(night, 0, output, 0)
            link(lit, 0, output, 1)
            shader.inputs["Emission Color"].default_value = (
                (1, 0.70, 0.42, 1) if texture != "office" else (0.76, 0.86, 1, 1)
            )
            link(output, 0, shader, "Emission Strength")
    return mat


def mesh_object(coll, name, verts, faces, materials):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    for mat in materials:
        mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    coll.objects.link(obj)
    return obj


def facade(b):
    kind = b["type"]
    if kind in ("apartments", "residential"):
        return "apt"
    if kind == "hotel":
        return "hotel"
    if kind in ("school", "university", "kindergarten"):
        return "school"
    if b["height"] < 30 and any(
        n in (b["name"] or "")
        for n in ["상가", "쇼핑", "빌딩", "센터", "프라자", "아케이드"]
    ):
        return "oldshop"
    if b["height"] >= 30:
        return "office"
    return "oldshop" if b["id"] % 3 == 0 else "shop"


def coping_geometry(ring, height, cx, cz, verts, faces, uv, material_ids):
    # A closed, mitred parapet with a slightly projecting stone cap.
    outline = [Vector((x - cx, cz - z)) for x, z in ring]
    winding = sum(
        a.x * b.y - a.y * b.x for a, b in zip(outline, outline[1:] + outline[:1])
    )
    if winding < 0:
        outline.reverse()
    start = len(verts)
    count = len(outline)
    for offset, z in [
        (-0.125, height),
        (-0.125, height + 0.82),
        (-0.165, height + 0.82),
        (-0.165, height + 0.9),
        (0.165, height + 0.9),
        (0.165, height + 0.82),
        (0.125, height + 0.82),
        (0.125, height),
    ]:
        for i, point in enumerate(outline):
            prev = (point - outline[i - 1]).normalized()
            nxt = (outline[(i + 1) % count] - point).normalized()
            n1 = Vector((prev.y, -prev.x))
            n2 = Vector((nxt.y, -nxt.x))
            normal = (n1 + n2).normalized()
            p = point + normal * (offset / max(0.45, normal.dot(n2)))
            verts.append((p.x, p.y, z))
    for level in range(7):
        for i in range(count):
            j = (i + 1) % count
            faces.append(
                (
                    start + level * count + j,
                    start + level * count + i,
                    start + (level + 1) * count + i,
                    start + (level + 1) * count + j,
                )
            )
            uv.append([(0, 0)] * 4)
            material_ids.append(2)


exterior = collection(scene.collection, "건축 · 외관")
context = collection(scene.collection, "지형 · 수면 · 공개 도로")
districts = {k: collection(exterior, v) for k, v in seed["sites"].items()}
city = collection(exterior, "주변 건물")
colors = {
    "apt": (0.76, 0.72, 0.61),
    "office": (0.56, 0.67, 0.73),
    "school": (0.75, 0.53, 0.42),
    "hotel": (0.49, 0.59, 0.66),
    "oldshop": (0.65, 0.56, 0.48),
    "shop": (0.72, 0.66, 0.55),
    "roofgravel": (0.43, 0.46, 0.45),
}
mats = {k: material(k, c, k) for k, c in colors.items()}
cap = material("옥상 코핑", (0.687, 0.672, 0.631))
enhance = runpy.run_path(str(here / "landmarks.py"))["enhance_landmark"]
for b in seed["buildings"]:
    ring = b["poly"]
    cx, cz, level = b["origin"]
    base, top = b["minHeight"], b["height"]
    if top <= base:
        continue
    style = facade(b)
    floor = max(
        2.6, (top - base) / (b["levels"] or max(1, math.floor(top / 3.3 + 0.5)))
    )
    rings = [ring] + b.get("holes", [])
    coords = sum(rings, [])
    verts = [(x - cx, cz - z, h) for h in [base, top] for x, z in coords]
    faces = []
    uv = []
    material_ids = []
    n = len(coords)
    first = 0
    for j, points in enumerate(rings):
        area = sum(
            a[0] * -c[1] - c[0] * -a[1] for a, c in zip(points, points[1:] + points[:1])
        )
        reverse = (area < 0) != (j > 0)
        u = 0
        su = seed["scales"][style][0]
        for i, a in enumerate(points):
            ii = (i + 1) % len(points)
            c = points[ii]
            du = math.dist(a, c) / su
            indices = [first + i, first + ii, n + first + ii, n + first + i]
            coords_uv = [
                (u, 0),
                (u + du, 0),
                (u + du, (top - base) / floor),
                (u, (top - base) / floor),
            ]
            faces.append(indices[::-1] if reverse else indices)
            uv.append(coords_uv[::-1] if reverse else coords_uv)
            material_ids.append(0)
            u += du
        first += len(points)
    for face in b["roof"]:
        a, c, d = [coords[k] for k in face]
        if (c[0] - a[0]) * (a[1] - d[1]) - (a[1] - c[1]) * (d[0] - a[0]) < 0:
            face = face[::-1]
        faces.append([n + k for k in face])
        uv.append(
            [
                (
                    coords[k][0] / seed["scales"]["roofgravel"][0],
                    -coords[k][1] / seed["scales"]["roofgravel"][1],
                )
                for k in face
            ]
        )
        material_ids.append(1)
    if top > 8:
        coping_geometry(ring, top, cx, cz, verts, faces, uv, material_ids)
    name = (b["name"] or b["type"]) + " · " + str(b["id"])
    obj = mesh_object(
        districts.get(b["owner"], city),
        name,
        verts,
        faces,
        [mats[style], mats["roofgravel"], cap],
    )
    obj.location = (cx, -cz, level)
    obj["osm_id"] = str(b["id"])
    obj["shell_key"] = b["key"]
    obj["terrain_datum"] = level
    if b["owner"] == "city" and b["id"] != 412970176 and b["type"] != "roof":
        obj["game_shell"] = "city"
    elif b["owner"] != "city":
        obj["game_shell"] = "landmark"
    uv_layer = obj.data.uv_layers.new(name="FacadeUV")
    for face, coords_uv, material_id in zip(obj.data.polygons, uv, material_ids):
        face.material_index = material_id
        for loop, coord in zip(face.loop_indices, coords_uv):
            uv_layer.data[loop].uv = coord
    enhance(obj, b)
    if obj.get("landmark_duplicate"):
        obj["game_shell"] = "omit"
terrain_mat = material("대지", (0.57, 0.56, 0.51))
grass = material("수변과 공원 식재", (0.29, 0.45, 0.26))
water = material("한강", (0.13, 0.37, 0.46))
road_mats = [
    material("간선 포장", (0.21, 0.24, 0.25)),
    material("생활 도로", (0.32, 0.33, 0.33)),
    material("보행로", (0.51, 0.48, 0.41)),
    material("자전거도로", (0.46, 0.22, 0.18)),
]
ground = seed["ground"]
w = ground["width"]
h = ground["height"]
step = ground["step"]
ground_vertices, ground_faces = json.loads((seed_dir / "landscape.json").read_text())
landscape = mesh_object(
    context,
    "반포·잠원 지형과 녹지",
    [(x, -z, y) for x, z, y in ground_vertices],
    [face[1:] for face in ground_faces],
    [terrain_mat, grass],
)
for polygon, face in zip(landscape.data.polygons, ground_faces):
    polygon.material_index = face[0]
for area in seed["land"]:
    if area["kind"] != "natural:water" or not area["faces"]:
        continue
    vertices = [(x, -z, y) for x, z, y in area["xyz"]]
    faces = [
        tuple(f)
        if (Vector(vertices[f[1]]) - Vector(vertices[f[0]]))
        .cross(Vector(vertices[f[2]]) - Vector(vertices[f[0]]))
        .z
        > 0
        else tuple(reversed(f))
        for f in area["faces"]
    ]
    mesh_object(context, area.get("name") or "한강 수면", vertices, faces, [water])

runpy.run_path(str(here / "height-controls.py"))["build_controls"](
    scene, seed["groundGrids"]
)
runpy.run_path(str(here / "road-axes.py"))["build_axes"](scene, seed["roads"])
runpy.run_path(str(here / "roads.py"))["build_roads"](
    context, seed, mesh_object, material, road_mats
)


def setup_view(s):
    s.render.engine = "CYCLES"
    s.cycles.samples = 6
    s.render.resolution_x = 1440
    s.render.resolution_y = 900
    s.render.resolution_percentage = 100
    camera_data = bpy.data.cameras.new("도시 전경")
    camera = bpy.data.objects.new("도시 전경 카메라", camera_data)
    s.collection.objects.link(camera)
    target = Vector((-245, 190, 0))
    camera.location = target + Vector((1700, -2200, 1850))
    camera.rotation_euler = (
        (target - camera.location).to_track_quat("-Z", "Y").to_euler()
    )
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = 1740
    camera_data.clip_end = 16000
    s.camera = camera
    light_data = bpy.data.lights.new("오후 햇빛", "SUN")
    light_data.energy = 3.5
    light_data.angle = 0.12
    light = bpy.data.objects.new("서울 태양", light_data)
    s.collection.objects.link(light)
    light.rotation_euler = (0.55, -0.65, -0.4)
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == "VIEW_3D":
                sp = area.spaces.active
                sp.clip_end = 20000
                sp.shading.color_type = "MATERIAL"
                sp.overlay.show_overlays = False
                sp.region_3d.view_rotation = camera.rotation_euler.to_quaternion()
                sp.region_3d.view_distance = 1350
                sp.region_3d.view_location = target


setup_view(scene)
runpy.run_path(str(here / "lighting.py"))["apply_sky"](scene, seed["lighting"])
# Establish Blender's file-relative root before requesting linked collections.
bpy.context.preferences.filepaths.save_version = 0
target = str(here / "gangnam-terminal.blend")
bpy.ops.wm.save_as_mainfile(filepath=target, compress=True)
runpy.run_path(str(here / "libraries.py"))["link_asset_gallery"](here)
runpy.run_path(str(here / "indoor-layout.py"))["sync_layout"](here)
runpy.run_path(str(here.parent / "shinsegae-facade/mount.py"))["mount_signs"](scene)
runpy.run_path(str(here.parent / "banpo-apartments/mount.py"))["mount_apartments"](scene)
runpy.run_path(str(here / "river-landmarks.py"))["build_river_landmarks"](
    scene, seed, here
)
runpy.run_path(str(here.parent / "banpo-stream-bridge/mount.py"))["mount"](scene, here.parent, seed["streamBridge"])
runpy.run_path(str(here / "street-layout.py"))["build_street_layout"](
    scene, seed_dir, here
)
runpy.run_path(str(here / "lighting.py"))["shade_street_lenses"](scene)
# Packed bytes travel with the master. A future unpack uses project-local names.
for image in bpy.data.images:
    if image.library is None and image.packed_file:
        location = "//textures/" + image.name
        image.filepath_raw = location
        for packed in image.packed_files:
            packed.filepath = location
bpy.ops.wm.save_as_mainfile(filepath=target, compress=True)
