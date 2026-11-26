"""Build a removable suspended ceiling sample with the finish facing downward."""
from pathlib import Path
from math import cos, pi, sin
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


def formed_part(name, vertices, faces, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    group.objects.link(ob)
    mesh.materials.append(mat)
    return ob


def folded_rim(name, x, y, outer, inner, mat):
    # Open centre: looking up through the lip, the deeper sheet remains visible.
    verts = []
    for w, d, z in (outer, inner):
        for sx, sy in ((-1,-1), (-1,1), (1,1), (1,-1)):
            verts.append((x+sx*w/2, y+sy*d/2, z))
    return formed_part(name, verts, [(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)], mat)


def bowed_lens(y, mat):
    # The bent opal extrusion has a shallow crown, visible between the end caps.
    arc = [(y+.072*sin(a*pi/12), -.029-.018*cos(a*pi/12)) for a in range(-6,7)]
    vertices = [(x,cy,z) for x in (-.528,.528) for cy,z in arc]
    n = len(arc)
    faces = [(i,i+1,i+1+n,i+n) for i in range(n-1)]
    return formed_part('볼록한 유백 확산 렌즈', vertices, faces, mat)


panels = [material('흡음보드 · ' + name, color) for name, color in (
    ('아이보리', 'e9e7e2'), ('밝은 아이보리', 'ebe9e4'), ('웜 그레이', 'e7e5df'))]
steel = material('T바 섀도', 'b9b7b1')
trim = material('알루미늄 프레임', 'dad8d1')
edge = material('접힌 반사판', 'e9e8e0')
lens = material('오팔 렌즈', 'fffdf4')
opening = material('깊은 섀도 틈', '8d9190')
louvre = material('네 방향 디퓨저 날개', 'd5d6d2')
for mat in (edge, lens, louvre):
    mat['bake_fold_shading'] = True

carrier = box('2.4m 반복 패널 바탕', (0, 0, .060), (2.4, 2.4, .070), steel)
carrier['repeat_bounds'] = True
for row in range(4):
    for col in range(4):
        if (row == 1 and col in (1, 2)) or (row == 2 and col == 3):
            continue
        x, y = (col - 1.5) * .6, (row - 1.5) * .6
        index = 1 if (row, col) in ((0, 2), (3, 0)) else 2 if (row, col) == (3, 2) else 0
        box('탈착식 흡음 패널', (x, y, .014), (.584, .584, .036), panels[index], .003)
for i in range(3):
    k = (i - 1) * .6
    box('T바 · 레일', (k, 0, .005), (.007, 2.4, .014), trim)
    box('T바 · 가로대', (0, k, .006), (2.4, .007, .014), trim)

box('매입등 · 반사판 받이', (0, -.3, .006), (1.182, .581, .018), opening, .003)
folded_rim('매입등 · 테두리', 0, -.3, (1.182,.581,-.016), (1.140,.539,-.019), trim)
folded_rim('매입등 · 경사 반사판', 0, -.3, (1.125,.524,-.016), (1.063,.453,.000), edge)
for y in (-.414, -.186):
    folded_rim('확산 렌즈 · 매입 홈', 0,y, (1.063,.223,-.002), (1.010,.146,-.020), edge)
    bowed_lens(y, lens)
    for x in (-.535,.535):
        box('렌즈 끝마개', (x,y,-.022), (.018,.152,.028), trim, .003)
box('매입등 · 중앙 격벽', (0,-.3,-.018), (1.068,.025,.038), trim, .003)

# A three-cone supply diffuser fills one acoustic tile. Successive square
# vanes stand forward of the dark plenum, leaving open slots between them.
box('사각 급기구 · 안쪽 플리넘', (.9,.3,.014), (.582,.582,.016), opening)
folded_rim('사각 급기구 · 외곽 테두리', .9,.3, (.582,.582,-.010), (.527,.527,.000), trim)
for width, z in ((.492,-.022), (.360,-.038), (.229,-.054)):
    folded_rim('급기구 · 절곡 콘', .9,.3, (width,width,z), (width-.076,width-.076,z+.039), louvre)
box('급기구 · 중앙판', (.9,.3,-.051), (.119,.119,.018), trim, .004)
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
