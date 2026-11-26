"""Build a removable suspended ceiling sample with the finish facing downward."""
from pathlib import Path
from mathutils import Vector

import bpy
import runpy

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
group = bpy.data.collections.new('공용 천장 · 600mm 모듈')
scene.collection.children.link(group)


def material(name, rgb):
    color = [int(rgb[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in color] + [1]
    return mat


def box(name, xyz, dims, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz)
    ob = bpy.context.object
    for vertex in ob.data.vertices:
        for axis in range(3):
            vertex.co[axis] *= dims[axis]
    ob.name = name
    for existing in list(ob.users_collection):
        existing.objects.unlink(ob)
    group.objects.link(ob)
    ob.data.materials.append(mat)
    if bevel:
        modifier = ob.modifiers.new('접힌 모서리', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 2
    return ob


panels = [material('흡음보드 · ' + name, color) for name, color in (
    ('아이보리', 'e9e7e2'), ('밝은 아이보리', 'ebe9e4'), ('웜 그레이', 'e7e5df'))]
steel = material('T바 섀도', 'cbc8c2')
trim = material('알루미늄 프레임', 'dad8d1')
edge = material('유백색 베젤', 'e9e7e1')
lens = material('오팔 렌즈', 'fffdf4')
rib = material('프리즘 리브', 'f8f5eb')
opening = material('환기구 안쪽', 'b6b5ae')
louvre = material('환기 날개', 'd2d1cb')

carrier = box('2.4m 반복 패널 바탕', (0, 0, .060), (2.4, 2.4, .070), steel)
carrier['repeat_bounds'] = True
for row in range(4):
    for col in range(4):
        if row == 1 and col in (1, 2):
            continue
        x, y = (col - 1.5) * .6, (row - 1.5) * .6
        index = 1 if (row, col) in ((0, 2), (3, 0)) else 2 if (row, col) == (3, 2) else 0
        box('탈착식 흡음 패널', (x, y, .014), (.584, .584, .036), panels[index], .003)
for i in range(3):
    k = (i - 1) * .6
    box('T바 · 레일', (k, 0, .005), (.007, 2.4, .014), trim)
    box('T바 · 가로대', (0, k, .006), (2.4, .007, .014), trim)

box('매입등 하우징', (0, -.3, .004), (1.182, .581, .066), trim, .005)
box('경사형 베젤', (0, -.3, -.031), (1.151, .550, .012), edge, .005)
box('프리즘 확산 렌즈', (0, -.3, -.040), (1.123, .521, .014), lens, .003)
for i in range(1, 16):
    x = -.56 + i * .070
    box('프리즘 렌즈 리브', (x, -.3, -.047), (.010, .510, .006), rib)
box('환기구 외곽', (.89, .34, -.010), (.435, .260, .020), trim, .006)
box('환기구 안쪽', (.89, .34, -.023), (.405, .230, .012), opening)
for i in range(7):
    ob = box('경사진 환기 날개', (.89, .34 + (i - 3) * .032, -.036), (.397, .021, .011), louvre)
    ob.rotation_euler.x = .25
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            space = area.spaces.active
            space.shading.color_type = 'MATERIAL'
            space.region_3d.view_rotation = Vector((.85, -.6, -1.3)).to_track_quat('Z', 'Y')
            space.region_3d.view_distance = 4.3
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE / 'suspended-ceiling.blend'), compress=True)
runpy.run_path(str(HERE / 'export.py'), run_name='__main__')
