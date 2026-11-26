"""Rebuild the framed ceiling above the main 10F escalator landing."""
from pathlib import Path
import sys
import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
import blender_shop_mesh as mesh
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
group = bpy.data.collections.new("본관 에스컬레이터 · 천장 프레임")
scene.collection.children.link(group)
mesh.group = group
mesh.palette = {name: mesh.material(name, color) for name, color in {
    '따뜻한 회백색 패널': 'e3e0d5',
    '금속 프레임': 'a4a49b',
    '모서리 반사면': 'c8c7bc',
    '매입 하우징': '68645e',
    '무광 반사갓': 'c5c0ae',
    '확산 렌즈': 'fff2d8',
}.items()}
lens_material = mesh.palette['확산 렌즈']
lamp = lens_material.node_tree.nodes.get('Principled BSDF')
lamp.inputs['Emission Color'].default_value = lens_material.diffuse_color
lamp.inputs['Emission Strength'].default_value = 1.1
# The top of the fixture is flush with the structural soffit. It projects
# down into the hall, leaving all walking headroom and the roof terrace intact.
width, depth = 17.35, 11.90
x_bays, y_bays = 11, 8
bay_x, bay_d = width / x_bays, depth / y_bays
mesh.block('패널 뒷판', 0, 0, -.028, width, depth, .027, '따뜻한 회백색 패널')
for i in range(x_bays + 1):
    x = -width / 2 + bay_x * i
    mesh.block('세로 프레임', x, 0, -.085, .042, depth, .057, '금속 프레임')
    mesh.block('세로 하단 절곡면', x, 0, -.094, .058, depth, .009, '모서리 반사면')
for j in range(y_bays + 1):
    d = -depth / 2 + bay_d * j
    mesh.block('가로 프레임', 0, d, -.08, width, .041, .052, '금속 프레임')
    mesh.block('가로 하단 절곡면', 0, d, -.089, width, .055, .009, '모서리 반사면')

# Keep the recess and its seated lens separately editable. The former model
# used small lit squares at alternate intersections of the atrium grid.
for col in range(1, x_bays, 2):
    for row in range(1, y_bays, 2):
        x = -width / 2 + col * bay_x
        d = -depth / 2 + row * bay_d
        mesh.block('매입 사각 등테', x, d, -.119, .21, .21, .042, '매입 하우징')
        mesh.block('은색 반사갓', x, d, -.126, .164, .164, .008, '무광 반사갓')
        lens = mesh.block('오팔 확산 렌즈', x, d, -.13, .127, .127, .005, '확산 렌즈')
        colors = lens.data.color_attributes.new(name='Ceiling lens', type='BYTE_COLOR', domain='POINT')
        for vertex in colors.data:
            vertex.color = (*lens_material.diffuse_color[:3], 0)


scene.world = bpy.data.worlds.new('편집용 배경')
# Open the editable collection from below, as a shopper would see the frame.
eye = Vector((-5, -9, -7))
target = Vector((0, 0, -.04))
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        space = area.spaces.active
        space.region_3d.view_rotation = (target - eye).to_track_quat('-Z', 'Y')
        space.region_3d.view_location = target
        space.region_3d.view_distance = (target - eye).length
        space.shading.color_type = 'MATERIAL'
        space.overlay.show_floor = False
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / 'atrium-ceiling.blend'), compress=True)
bake_collection(group, 'FramedAtriumCeiling', here / 'ceiling.glb', color_attribute='Ceiling lens')
