"""Rebuild the editable hotel pendant and the millinery shop's ribbon hat."""
from math import cos, pi, sin
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


ROOT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)


def collection(name, label, origin):
    group = bpy.data.collections.new(label)
    bpy.context.scene.collection.children.link(group)
    group['export_model'] = name
    group['preview_origin'] = origin
    return group


def material(name, hex_code, metallic=0.0, roughness=.45, lit=False):
    rgb = bytes.fromhex(hex_code)
    linear = [v / 3294.6 if v < 11 else ((v / 255 + .055) / 1.055) ** 2.4 for v in rgb] + [1.]
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = linear
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = linear
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    if lit:
        mat['lit_face'] = True
        shader.inputs['Emission Color'].default_value = linear
        shader.inputs['Emission Strength'].default_value = .75
    return mat


def mesh(group, name, vertices, faces, finish, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.materials.append(finish)
    data.update()
    if smooth:
        for face in data.polygons:
            face.use_smooth = True
    obj = bpy.data.objects.new(name, data)
    center = sum((Vector(v) for v in vertices), Vector()) / len(vertices)
    data.transform(Matrix.Translation(-center))
    obj.location = Vector(group['preview_origin']) + center
    group.objects.link(obj)
    return obj


def rings(group, name, profiles, finish, sides, sample, smooth=False, caps=True):
    vertices = [sample(radius, z, j * 2 * pi / sides)
                for radius, z in profiles for j in range(sides)]
    faces = []
    for row in range(len(profiles) - 1):
        for j in range(sides):
            k = (j + 1) % sides
            low, high = row * sides, (row + 1) * sides
            faces.append((low + j, low + k, high + k, high + j))
    if caps:
        last = len(vertices) - sides
        faces.extend([tuple(reversed(range(sides))), tuple(range(last, last + sides))])
    return mesh(group, name, vertices, faces, finish, smooth)


hotel = collection('hotel-pendant', '현관 샹들리에 · 유리 드롭', (0, 0, 3.6))
walnut = material('호두나무 천장 받침', '573e31')
bronze = material('브러시드 브론즈', 'a27b4b', .65, .27)
brass = material('전구 소켓 황동', 'c69f62', .62, .3)
opal = material('아이보리 유백 유리', 'fff1dc', roughness=.25, lit=True)
amber = material('호박색 유리', 'f3d3a3', roughness=.28, lit=True)
opal_shadow = material('유백 유리 홈', 'f4dfc1', roughness=.26, lit=True)
amber_shadow = material('호박 유리 홈', 'ddba8b', roughness=.29, lit=True)


def oval(radius, z, t):
    return (1.435 * radius * cos(t), 1.025 * radius * sin(t), z)


rings(hotel, '천장 타원형 덮개', [(.961, -.105), (1, -.087), (1, -.022), (.978, 0)],
      walnut, 48, oval)
rings(hotel, '덮개 밑면 황동 테두리', [(.953, -.106), (.973, -.105), (.984, -.097)],
      bronze, 48, oval, caps=False)
for i in range(20):
    angle = i * pi / 10
    x, y = 1.28 * cos(angle), -.88 * sin(angle)
    drop = 2.1 + 1.05 * (1 + sin(2 * angle)) / 2

    def round_section(radius, z, t):
        return (x + radius * cos(t), y + radius * sin(t), z)

    def glass_section(radius, z, t):
        # Shallow vertical flutes are molded in the glass.
        return round_section(radius * (1 + .038 * cos(8 * t)), z, t)

    rings(hotel, f'천장 슬리브 {i + 1:02}', [(.031, -.132), (.044, -.111), (.043, -.090)],
          brass, 12, round_section)
    rings(hotel, f'매달림 와이어 {i + 1:02}', [(.008, -drop + .075), (.008, -.12)],
          bronze, 6, round_section)
    rings(hotel, f'홈 소켓 {i + 1:02}', [(.044, -drop - .012), (.051, -drop),
          (.036, -drop + .025), (.036, -drop + .061), (.020, -drop + .083)],
          brass, 12, round_section)
    glass = rings(hotel, f'플루트 유리 드롭 {i + 1:02}', [(.010, -drop - .276), (.056, -drop - .250),
          (.089, -drop - .192), (.100, -drop - .130), (.095, -drop - .077),
          (.071, -drop - .035), (.042, -drop - .007)], opal if i % 3 else amber,
          24, glass_section, smooth=True)
    # The unlit game material still shows the subtly darker glass inside each flute.
    glass.data.materials.append(opal_shadow if i % 3 else amber_shadow)
    for face in glass.data.polygons:
        if face.index < 24 * 6 and face.index % 3 == 1:
            face.material_index = 1

hat = collection('millinery-hat', '고투몰 진열용 리본 모자', (2.6, 0, .02))
body = material('모자 원단 · 매장에서 색상 적용', 'fffaf3', roughness=.79)
seam = material('챙 바인딩', 'e4dccb', roughness=.72)
band = material('그로그랭 리본', '766857', roughness=.80)
ribbon_edge = material('리본 가장자리', '998875', roughness=.74)


def straw(radius, z, t):
    # Brim droops away from the oval crown and lifts slightly on the bow side.
    brim = max(0, (radius - .135) / .125)
    fall = brim * (.019 + .012 * sin(t) + .006 * cos(3 * t))
    return (radius * (1 + .015 * sin(3 * t)) * cos(t),
            radius * .9 * sin(t), z - fall)


rings(hat, '넓은 챙과 눌린 크라운', [(.126, .035), (.209, .035), (.258, .034), (.26, .041),
      (.218, .044), (.145, .050), (.133, .060), (.128, .122), (.113, .149),
      (.088, .159), (.038, .155)], body, 28, straw, smooth=True)
rings(hat, '둘레 감침', [(.258, .034), (.261, .036), (.261, .039), (.258, .041)],
      seam, 28, straw, smooth=True, caps=False)
rings(hat, '크라운 리본', [(.1338, .059), (.1323, .077), (.1310, .090)],
      band, 28, straw, smooth=True, caps=False)
rings(hat, '리본 이음선', [(.1315, .087), (.1314, .090)], ribbon_edge,
      28, straw, caps=False)
for side in (-1, 1):
    # A folded bow sits tangent to the front of the crown.
    mesh(hat, '리본 고리', [(side * x, -.121 - depth, z) for x, depth, z in [
        (.005, .005, .075), (.045, .012, .097), (.061, .006, .091),
        (.059, .011, .056), (.034, .015, .061), (.006, .009, .070),
        (.041, .020, .077)]],
        [(0, 1, 6), (1, 2, 6), (2, 3, 6), (3, 4, 6), (4, 5, 6), (5, 0, 6)], band)
mesh(hat, '리본 중앙 매듭', [(-.007,-.139,.066),(.007,-.139,.066),
    (.008,-.139,.082),(-.008,-.139,.082),(-.006,-.132,.067),(.006,-.132,.067),
    (.006,-.132,.081),(-.006,-.132,.081)],
    [(0,1,2,3),(3,2,6,7),(0,4,5,1),(1,5,6,2),(0,3,7,4)], ribbon_edge)

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
bpy.context.view_layer.update()
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            space = area.spaces.active
            space.shading.color_type = 'MATERIAL'
            space.region_3d.view_distance = 6
            space.region_3d.view_location = (0, 0, 2)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'interior-finish.blend'), compress=True)
