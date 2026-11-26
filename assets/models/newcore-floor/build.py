"""Build three editable retail floor samples. Run with Blender in background."""
import random
from pathlib import Path

import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "뉴코아 바닥 마감"
scene.unit_settings.system = "METRIC"


def linear(hex_value):
    def channel(value):
        value = int(value, 16) / 255
        return value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4
    return tuple(channel(hex_value[i:i + 2]) for i in (0, 2, 4)) + (1,)


def stone(name, shades, coarse, fine):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = linear(shades[1])
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    shader = nodes.get("Principled BSDF")
    shader.inputs["Roughness"].default_value = .35
    coord = nodes.new("ShaderNodeTexCoord")
    coord.location = (-720, 160)
    # World-scale veining and mineral grain follow the UVs of the complete tile
    # even where the repeating sample cuts through one along an edge.
    mix = nodes.new("ShaderNodeMixRGB")
    mix.location = (-240, 140)
    mix.inputs[0].default_value = .42
    for i, (scale, label) in enumerate(((coarse, "석재 색 변화"), (fine, "미세 골재"))):
        noise = nodes.new("ShaderNodeTexNoise")
        noise.label = label
        noise.location = (-500, 200 - i * 240)
        noise.inputs["Scale"].default_value = scale
        noise.inputs["Detail"].default_value = 2.5
        links.new(coord.outputs["UV"], noise.inputs["Vector"])
        links.new(noise.outputs["Fac"], mix.inputs[i + 1])
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.label = "바닥 색상"
    ramp.location = (-30, 140)
    stops = ramp.color_ramp.elements
    stops[0].position, stops[0].color = .24, linear(shades[0])
    stops[1].position, stops[1].color = .76, linear(shades[2])
    stops.new(.5).color = linear(shades[1])
    links.new(mix.outputs["Color"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], shader.inputs["Base Color"])
    shader.location = (230, 140)
    nodes.get("Material Output").location = (520, 140)
    return mat


def block(group, name, bounds, material, bevel=0, uv_origin=(0, 0)):
    x0, y0, z0, x1, y1, z1 = bounds
    points = [(x, y, z) for z in (z0, z1) for x, y in
              ((x0, y0), (x1, y0), (x1, y1), (x0, y1))]
    faces = [(3, 2, 1, 0), (4, 5, 6, 7), (0, 1, 5, 4),
             (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(points, [], faces)
    mesh.update()
    uv = mesh.uv_layers.new(name="석재 좌표")
    for lp in mesh.loops:
        x, y, _ = points[lp.vertex_index]
        uv.data[lp.index].uv = (x - uv_origin[0], y - uv_origin[1])
    mesh.materials.append(material)
    obj = bpy.data.objects.new(name, mesh)
    group.objects.link(obj)
    if bevel:
        mod = obj.modifiers.new("모서리 연마", "BEVEL")
        mod.width = bevel
        mod.segments = 2
    return obj


def sample(name, key, origin, side, joint, layout, variants, gap):
    group = bpy.data.collections.new(name)
    scene.collection.children.link(group)
    group["surface_key"] = key
    group.instance_offset.x = origin
    group.instance_offset.y = .5 * side
    x0 = origin - .5 * side
    base = block(group, name + " · 줄눈 바탕", (x0, 0, -.28, x0 + side, side, -.004), joint)
    base["sample_base"] = True
    for i, (x, y, width, height, variant) in enumerate(layout):
        l, r = max(0, x + gap / 2), min(side, x + width - gap / 2)
        b, t = max(0, y + gap / 2), min(side, y + height - gap / 2)
        if r <= l or t <= b:
            continue
        block(group, name + " · 타일 %02d" % (i + 1),
              (x0 + l, b, -.02, x0 + r, t, 0), variants[variant],
              .0008, (x0 + x, y))


def squares(count, size):
    return [(c * size, r * size, size, size, (r + c) % 2)
            for r in range(count) for c in range(count)]


joint = stone("줄눈 · 웜 그레이", ["78746c", "928c82", "aba49a"], 12, 180)
porcelain = [
    stone("아이보리 포세린", ["d0c9bb", "e1dbcf", "f5efe3"], 2.2, 90),
    stone("담황색 포세린", ["d1cbbf", "dfd9ce", "efeadd"], 3, 95)]
sample("매장층 · 포세린", "newcore-sales-porcelain", 0, 1.2, joint,
       squares(2, .6), porcelain, .0035)

grey = [stone("델리 · 회갈색 연마석", ["605d56", "78726b", "968f83"], 4.8, 150),
        stone("델리 · 회색 연마석", ["65605b", "78756e", "969188"], 4.4, 140)]
sample("킴스클럽 · 연마석", "newcore-market-floor", 2.2, 1.2, joint,
       squares(2, .6), grey, .003)

brick = [stone("헤링본 · " + label, colors, 20, 230) for label, colors in [
    ("이끼색", ["676b61", "828579", "9b9f91"]), ("베이지", ["817d6f", "9e998a", "b1aa97"]),
    ("회색", ["636861", "777d72", "909488"]), ("사암색", ["777568", "928e7f", "aaa593"])]]
dark_joint = stone("헤링본 · 줄눈", ["43423c", "55544d", "66635a"], 18, 180)
# At integer cells whose (column - row) % 4 == 0, pair each horizontal
# brick with the upright brick to its lower right. The palette repeats at 8 cells.
rng = random.Random(933)
palette = {(i, j, k): rng.randrange(4) for i in range(8) for j in range(8) for k in range(2)}
layout = []
for row in range(-2, 10):
    for col in range(-3, 10):
        if (col - row) % 4 == 0:
            for k, (x, y, w, h) in enumerate(((col, row, 2, 1), (col + 2, row - 1, 1, 2))):
                if x < 8 and x + w > 0 and y < 8 and y + h > 0:
                    layout.append((x * .1, y * .1, w * .1, h * .1, palette[col % 8, row % 8, k]))
sample("푸드스트리트 · 헤링본", "newcore-pavers", 4.2, .8, dark_joint,
       layout, brick, .004)

for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == "VIEW_3D":
            region = area.spaces.active.region_3d
            region.view_distance = 6.5
            region.view_location = (2, .5, -.05)
            area.spaces.active.shading.color_type = "MATERIAL"
            area.spaces.active.overlay.show_floor = False
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / "floor-finishes.blend"), compress=True)
