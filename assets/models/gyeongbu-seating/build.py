"""Build the 1F boarding-hall seats in metres. Blender X spans the row and -Y points back."""
from math import cos, sin, pi
from pathlib import Path
import runpy

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene['reference'] = 'Passenger photograph IMG＿9027, 2026-05-18, https://m.blog.naver.com/biinuuuu/224289206124'
scene['dimensions'] = 'Lengths and hidden fixings are fitted to the existing 0.57 m seat pitch.'


def material(name, rgb, roughness, metal=0):
    mat = bpy.data.materials.new(name)
    vals = [int(rgb[i:i+2], 16)/255 for i in (0, 2, 4)]
    mat.diffuse_color = tuple(v/12.92 if v < .04045 else ((v+.055)/1.055)**2.4 for v in vals) + (1,)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = mat.diffuse_color
    shader.inputs['Metallic'].default_value = metal
    shader.inputs['Roughness'].default_value = roughness
    return mat


silver = material('성형 강판 · 무광 은색', 'acb4b7', .40, .30)
rim = material('압연 테두리 · 밝은 금속', 'c6cacc', .30, .45)
support = material('주조 받침대 · 회색', '939c9e', .42, .33)
shadow = material('하부 연결 보 · 흑연색', '555e60', .58)
rubber = material('고무발 · 흑색', '353737', .83)
maple = material('받침판 · 메이플색', 'be9974', .62)
edge = material('받침판 · 어두운 가장자리', '775e4c', .73)


def mesh(name, vertices, faces, mat, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata([(x,-d,h) for x,d,h in vertices], [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location.x = origin
    data.materials.append(mat)
    for face in data.polygons:
        face.use_smooth = smooth
    return obj


def sweep(name, rings, mat, smooth=False):
    n = len(rings[0])
    faces = [(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i)
             for j in range(len(rings)-1) for i in range(n)]
    faces.extend((tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))))
    return mesh(name,[p for ring in rings for p in ring],faces,mat,smooth)


def tube(name, path, radius, mat, sides=8):
    # Parallel frames keep bends in the armrests and feet continuous.
    pts = [Vector(p) for p in path]
    rings = []
    for i, p in enumerate(pts):
        tangent = (pts[min(i+1,len(pts)-1)] - pts[max(i-1,0)]).normalized()
        normal = tangent.cross(Vector((1,0,0)) if abs(tangent.x)<.85 else Vector((0,1,0))).normalized()
        second = tangent.cross(normal)
        rings.append([p + radius*(normal*cos(k*2*pi/sides)+second*sin(k*2*pi/sides)) for k in range(sides)])
    return sweep(name,rings,mat,True)


def block(name, x, d, z, w, depth, high, mat):
    return sweep(name, [[(x+sx*w/2,d+sd*depth/2,h) for sx,sd in [(1,1),(-1,1),(-1,-1),(1,-1)]]
                        for h in [z,z+high]], mat)


def foot(x, d):
    rings = [[(x+r*cos(k*pi/5),d+r*sin(k*pi/5),h) for k in range(10)]
             for h,r in [(0,.041),(.014,.041),(.024,.031)]]
    sweep('바닥 · 고무 조절발',rings,rubber)


def seat(x):
    # A single bent steel pan. Its stamped back and rolled edges read from either side.
    profile = [(-.247,.449),(-.251,.466),(-.227,.480),(-.15,.467),(-.045,.452),
               (.095,.451),(.144,.468),(.168,.501),(.177,.564),(.194,.673),(.217,.798),
               (.233,.879),(.232,.905),(.224,.916)]
    rings = []
    for lateral, taper, lift in [(-.255,.94,.009),(-.239,.99,.003),(-.17,1,0),(.17,1,0),(.239,.99,.003),(.255,.94,.009)]:
        upper = [(x+lateral,d*taper,z+lift) for d,z in profile]
        lower = [(px,pd+.008,ph-.013) for px,pd,ph in reversed(upper)]
        rings.append(upper+lower)
    sweep('일체형 좌판 · 등판',rings,silver)
    for side in [-1,1]:
        tube('말아 접은 측면 테',[(x+side*.248,d,z+.004) for d,z in profile],.010,rim)
    # The original photograph shows two paired horizontal embosses on the reverse of the panel.
    for z in [.652,.675,.807,.830]:
        d=.177 + (z-.564)*.175 + .011
        tube('등판 뒤 · 프레스 가로 비드',[(x-.193,d-.001,z),(x-.179,d+.003,z),
             (x+.179,d+.003,z),(x+.193,d-.001,z)],.0065,rim,6)
    block('걸림쇠 · 하부',x,0,.339,.074,.275,.040,support)


def feet(x):
    tube('받침 · 뒤로 벌어진 다리',[(x,.216,.026),(x,.178,.119),(x,.095,.277),(x,.014,.346)],.029,support)
    tube('받침 · 앞으로 벌어진 다리',[(x,-.216,.026),(x,-.172,.126),(x,-.085,.279),(x,.008,.346)],.029,support)
    for d in [-.216,.216]:
        foot(x,d)


def arm(x):
    tube('팔걸이 · 둥근 모서리',[(x,.101,.410),(x,.122,.484),(x,.128,.622),(x,.120,.662),
        (x,.091,.681),(x,-.104,.681),(x,-.145,.675),(x,-.161,.651),(x,-.161,.628)],.016,rim)


def shelf(x):
    # The thin timber end surface and its dark edge are visible from the concourse aisle.
    for h,hw,hd,r,mat in [(.474,.165,.189,.024,edge),(.486,.161,.185,.023,maple)]:
        def loop(z):
            vertices=[]
            for cx,cd,start in [(hw-r,hd-r,0),(-hw+r,hd-r,1),(-hw+r,-hd+r,2),(hw-r,-hd+r,3)]:
                for k in range(4):
                    a=(start+k/3)*pi/2
                    vertices.append((x+cx+r*cos(a),cd+r*sin(a),z))
            return vertices
        sweep('보조 선반 · 상판', [loop(h),loop(h+.012)], mat)
    tube('보조 선반 · 받침',[(x-.19,.01,.33),(x-.11,.01,.40),(x+.10,.01,.458)],.017,support)


for name,count,with_tray,origin in [('TerminalTwo',2,False,0),('TerminalFour',4,False,2.4),('WindowFour',4,True,6)]:
    collection = bpy.data.collections.new(name)
    collection['origin']=[origin,0,0]
    collection['bundle']='waiting-benches'
    scene.collection.children.link(collection)
    span=count*.57
    for i in range(count):
        seat((i-(count-1)/2)*.57)
    block('공통 보 · 좌판 연결',0,0,.299,span-.09,.081,.063,shadow)
    for x in [-span/2+.17,span/2-.17]:
        feet(x)
    for x in ([-span/2+.014,0,span/2-.014] if count==4 else [-span/2+.014,span/2-.014]):
        arm(x)
    if with_tray:
        shelf(span/2+.157)

# Face winding was constructed in the local seat frame, which changes handedness in Blender.
import bmesh
for obj in bpy.context.scene.objects:
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    bm.to_mesh(obj.data)
    bm.free()

for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces.active.shading.color_type = 'MATERIAL'
        area.spaces.active.region_3d.view_distance = 9
        area.spaces.active.region_3d.view_location = (3,0,.5)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'waiting-benches.blend'),compress=True)
runpy.run_path(str(ROOT/'export.py'))
