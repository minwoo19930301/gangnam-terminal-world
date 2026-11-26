"""Build editable retail ceiling fittings. Local Z is up; fixtures are viewed from below."""
from math import cos, pi, sin
from pathlib import Path
import runpy

import bmesh
import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'CYCLES'
scene['설명'] = '등기구의 마감, 조립 단면과 치수는 게임에 맞춰 재구성한 디자인입니다.'


def material(name, hex_value, lit=False):
    rgb = [int(hex_value[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb]
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*linear, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = mat.diffuse_color
    shader.inputs['Roughness'].default_value = .61
    if lit:
        mat['lit_face'] = True
        shader.inputs['Emission Color'].default_value = mat.diffuse_color
        shader.inputs['Emission Strength'].default_value = 1.1
    return mat


charcoal = material('분체도장 · 차콜', '373a3b')
dark = material('홈 안쪽 · 무광 흑색', '202322')
bronze = material('외곽 링 · 새틴 브론즈', '9e8a73')
steel = material('압출 알루미늄', '949b9f')
enamel = material('화이트 에나멜', 'dad8cf')
warm = material('오팔 확산판 · 온백색', 'fff0d3', True)
cool = material('오팔 확산판 · 주백색', 'eff5fa', True)


def collection(name, key, x):
    group = bpy.data.collections.new(name)
    scene.collection.children.link(group)
    group['export_model'] = key
    group['preview_origin'] = [x, 0, 0]
    return group


def mesh(group, name, vertices, faces, mat):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    bm = bmesh.new()
    bm.from_mesh(data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(data)
    bm.free()
    item = bpy.data.objects.new(name, data)
    group.objects.link(item)
    item.location = Vector(group['preview_origin'])
    data.materials.append(mat)
    return item


def sweep(group, name, section, length, mat, along_x=False):
    # A closed extrusion from a measured-in-metres 2D cross-section.
    vertices = [(q, pos, h) if not along_x else (pos, q, h)
                for pos in (-length / 2, length / 2) for q, h in section]
    n = len(section)
    faces = [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    faces.extend([tuple(range(n)), tuple(range(n, 2 * n))])
    return mesh(group, name, vertices, faces, mat)


def strip(group, name, x0, x1, bottom, top, length, mat):
    return sweep(group, name, [(x0, bottom), (x1, bottom), (x1, top), (x0, top)], length, mat)


def lathe(group, name, profile, mat, sides=16):
    verts = [(r * cos(2 * pi * i / sides), r * sin(2 * pi * i / sides), z)
             for r, z in profile for i in range(sides)]
    faces = []
    for j in range(len(profile)):
        row = j * sides
        upper = ((j + 1) % len(profile)) * sides
        faces.extend((row + i, row + (i + 1) % sides, upper + (i + 1) % sides, upper + i)
                     for i in range(sides))
    return mesh(group, name, verts, faces, mat)


slot = collection('매입 슬롯 · 온백색 라인', 'warm-slot', 0)
strip(slot, '타공면 안쪽 섀도', -.047, .047, -.006, .020, 1.80, dark)
for side in (-1, 1):
    strip(slot, '홈의 접힌 날개', side * .045 - .006, side * .045 + .006, -.017, .018, 1.80, charcoal)
strip(slot, '매입 라인 몸체', .293, .347, -.015, .015, 1.705, steel)
sweep(slot, '미세 돌출 오팔 렌즈',
      [(.299, -.016), (.303, -.023), (.337, -.023), (.341, -.016), (.341, -.012), (.299, -.012)],
      1.68, warm)

spot = collection('천장 다운라이트 · 반사갓', 'warm-pinspot', 1.1)
lathe(spot, '말아 넣은 브론즈 베젤',
      [(.125, 0), (.125, -.021), (.121, -.026), (.101, -.026), (.094, -.020), (.094, -.009)], bronze)
lathe(spot, '오목한 반사갓',
      [(.101, -.021), (.097, -.024), (.066, -.010), (.057, -.004), (.059, .002), (.097, -.011)], charcoal)
n = 16
verts = [(0, 0, -.010)] + [(.071 * cos(2 * pi * i / n), .071 * sin(2 * pi * i / n), -.006) for i in range(n)]
mesh(spot, '눈부심 방지 렌즈', verts, [(0, 1 + (i + 1) % n, 1 + i) for i in range(n)], warm)

blade = collection('오픈셀 천장 · 절곡 블레이드', 'cell-blade', 2)
sweep(blade, '접힌 하단과 가는 상부 턱',
      [(-.020, .002), (-.020, .214), (-.026, .214), (-.026, .220), (.026, .220),
       (.026, .214), (.020, .214), (.020, .002), (.016, 0), (-.016, 0)], 1, charcoal, along_x=True)

batten = collection('스포츠 매장 · 선형 조명', 'cool-batten', 3)
sweep(batten, '압출형 방열 케이스',
      [(-.046, .072), (-.052, .081), (-.052, .125), (-.045, .139),
       (.045, .139), (.052, .125), (.052, .081), (.046, .072)], 1.18, steel)
for side in (-1, 1):
    strip(batten, '렌즈 고정 날개', side * .044 - .004, side * .044 + .004, .065, .084, 1.17, enamel)
sweep(batten, '주백색 확산 렌즈',
      [(-.041, .077), (-.041, .069), (-.035, .060), (.035, .060), (.041, .069), (.041, .077)], 1.16, cool)
strip(batten, '옆 배선 덮개', .078, .120, .05, .15, 1.18, enamel)

for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            space = area.spaces.active
            space.shading.color_type = 'MATERIAL'
            space.region_3d.view_rotation = Vector((1, -2, -2)).to_track_quat('Z', 'Y')
            space.region_3d.view_location = (1.5, 0, .06)
            space.region_3d.view_distance = 5
scene.view_settings.view_transform = 'Standard'
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE / 'upper-retail-finish.blend'), compress=True)
runpy.run_path(str(HERE.parent / 'interior-architecture' / 'export.py'), run_name='__main__')
