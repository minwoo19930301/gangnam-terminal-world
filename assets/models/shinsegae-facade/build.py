"""Create the two non-figurative advertising cases on Shinsegae's north towers."""
from math import pi
from pathlib import Path

import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "신세계 북측 외벽 간판"
scene.unit_settings.system = "METRIC"


def material(name, srgb, metallic=0, roughness=.55):
    rgb = [int(srgb[n:n + 2], 16) / 255 for n in (0, 2, 4)]
    linear = tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb)
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*linear, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = mat.diffuse_color
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return mat


def board(brand, offset, station, height, finish, edge, letters, fonts):
    collection = bpy.data.collections.new(brand)
    scene.collection.children.link(collection)
    collection["bundle"] = "signs"
    collection["origin"] = (offset, 0, 0)
    collection.instance_offset = (offset, 0, 0)
    collection["tower_u"] = station
    collection["base_height"] = height

    def move(obj, name, mat):
        for link in list(obj.users_collection):
            link.objects.unlink(obj)
        collection.objects.link(obj)
        obj.name = brand + " · " + name
        obj.data.materials.append(mat)

    def box(name, x, y, z, width, depth, tall, mat):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(offset + x, -y, z))
        obj = bpy.context.object
        for v in obj.data.vertices:
            v.co.x *= width
            v.co.y *= depth
            v.co.z *= tall
        move(obj, name, mat)

    width, tall = 9.1, 14.4
    box("후면 지지판", 0, .115, tall/2, width+.42, .18, tall+.42, shadow)
    box("알루미늄 카세트", 0, .228, tall/2, width+.22, .11, tall+.22, edge)
    box("광고 면판", 0, .28, tall/2, width, .08, tall, finish)
    # Folded metal reveals frame the sign face. The finish and logotype can be edited separately.
    for side in (-1, 1):
        box("좌우 프레임", side*(width/2+.05), .316, tall/2, .095, .075, tall+.17, edge)
        box("상하 프레임", 0, .316, tall/2+side*(tall/2+.048), width+.19, .075, .095, edge)
    font = next((bpy.data.fonts.load(str(p), check_existing=True) for p in fonts if p.is_file()), None)
    bpy.ops.object.text_add(location=(offset, -.328, tall * .50), rotation=(pi/2, 0, 0))
    obj = bpy.context.object
    curve = obj.data
    curve.body = brand
    if font:
        curve.font = font
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    curve.space_character = 1.20 if brand == "CHANEL" else 1.10
    curve.resolution_u = 4
    bpy.context.view_layer.update()
    curve.size *= (width * .76) / obj.dimensions.x
    # Ship the outlines so edits and exports never require a particular system font.
    bpy.ops.object.convert(target="MESH")
    move(bpy.context.object, "입체 상호", letters)


shadow = material("고정대 · 흑철", "484847", .45)
silver = material("밝은 알루미늄", "c1c1ba", .66)
bronze = material("샴페인 알루미늄", "a4937a", .60)
ebony = material("차콜 매트", "222420")
ivory = material("라이트 스톤", "dbd4c4")
charcoal = material("흑갈색 문자", "292722")
white = material("백색 문자", "f3f1e9")
system_fonts = Path("/System/Library/Fonts/Supplemental")
linux_fonts = Path("/usr/share/fonts/truetype")
board("PIAGET", 0, 9.25, 12.8, ivory, bronze, charcoal,
      [system_fonts / "Times New Roman.ttf", linux_fonts / "liberation2/LiberationSerif-Regular.ttf"])
board("CHANEL", 12, 57.75, 16.2, ebony, silver, white,
      [system_fonts / "Arial Bold.ttf", linux_fonts / "liberation2/LiberationSans-Bold.ttf"])
for font in list(bpy.data.fonts):
    if font.filepath and not font.users:
        bpy.data.fonts.remove(font)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == "VIEW_3D":
            from mathutils import Euler
            space = area.spaces.active
            space.shading.color_type = "MATERIAL"
            space.overlay.show_overlays = False
            space.region_3d.view_rotation = Euler((pi/2, 0, 0)).to_quaternion()
            space.region_3d.view_location = (6, 0, 7)
            space.region_3d.view_distance = 31
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / "north-signs.blend"), compress=True)
