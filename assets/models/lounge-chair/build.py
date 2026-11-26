"""Model the open cane frame and the loose upholstered cushion of the lounge chair."""
import math
import runpy
from pathlib import Path

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
TAU = math.tau
sin, cos = math.sin, math.cos
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
chair = bpy.data.collections.new('피콕 암체어 · JW 8층 더 라운지')
scene.collection.children.link(chair)
chair['export_model'] = 'peacock'
chair['preview_origin'] = [0, 0, 0]


def material(name, color):
    m = bpy.data.materials.new(name)
    srgb = [int(color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    m.diffuse_color = [v / 12.92 if v < .04045 else ((v + .055) / 1.055)**2.4 for v in srgb] + [1]
    m.roughness = .74
    return m


cane = material('허니 라탄 · 골조', 'bf9d6e')
pale = material('크림 등심 · 무늬', 'dcbd8d')
binding = material('가는 결속용 등심', 'af885d')
seat = material('좌판 · 크림 리넨', 'd9c4a3')
pillow = material('등쿠션 · 탁한 장밋빛', 'ab7785')
welt = material('등쿠션 파이핑', '925f72')


def mesh(name, verts, faces, finish, smooth=True):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    chair.objects.link(obj)
    data.materials.append(finish)
    for f in data.polygons:
        f.use_smooth = smooth
    return obj


def paths(name, lines, radius, finish, cyclic=False):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 1
    data.bevel_depth = radius
    data.bevel_resolution = 0
    data.resolution_v = 1
    data.use_fill_caps = True
    for line in lines:
        spline = data.splines.new('POLY')
        spline.points.add(len(line) - 1)
        for p, xyz in zip(spline.points, line):
            p.co = (*xyz, 1)
        spline.use_cyclic_u = cyclic
        spline.use_smooth = True
    obj = bpy.data.objects.new(name, data)
    chair.objects.link(obj)
    data.materials.append(finish)


def around(n, curve):
    return [curve(i * TAU / n) for i in range(n)]


def between(n, curve):
    return [curve(i / n) for i in range(n + 1)]


def ring(z, rx, ry, offset=0):
    return around(32, lambda t: (offset + rx * cos(t), ry * sin(t), z))


def sweep(name, rows, finish):
    n = len(rows[0])
    fs = [(j*n+i, j*n+(i+1)%n, (j+1)*n+(i+1)%n, (j+1)*n+i)
          for j in range(len(rows)-1) for i in range(n)]
    fs.extend([tuple(reversed(range(n))), tuple(range((len(rows)-1)*n, len(rows)*n))])
    return mesh(name, [v for row in rows for v in row], fs, finish)


def back(a, z, front=0):
    return (-.31 + .28*(a/.65)**2 + .055*(z-1.24)**2 + front, a, z)


def rim(t, inset=0):
    return back((.635-inset)*cos(t)*(1+.10*sin(t)), 1.24+(.82-inset)*sin(t))


paths('등받이 · 둥글게 말아 묶은 이중 테', [around(64, rim)], .016, cane, True)
paths('등받이 · 안쪽 테', [around(56, lambda t: rim(t, .039))], .009, pale, True)
stays = []
for i in range(21):
    # The fan follows the curve of the back, instead of stretching straight across its bowl.
    t = -.40 + i*(math.pi+.80)/20
    _, a, z = rim(t, .05)
    stays.append(between(8, lambda s: back(.19*cos(t)*(1-s)+a*s, .49+(z-.49)*s, -.010)))
paths('등받이 · 펼친 세로 등살', stays, .007, binding)

flowers = []
for cy, cz, rad in [(-.27,1.08,.17),(.27,1.08,.17),(0,1.30,.20),
                     (-.29,1.53,.195),(.29,1.53,.195),(0,1.82,.14),(0,.832,.112)]:
    def petal(t):
        r = rad*(.74+.26*cos(6*t))
        return back(cy+r*sin(t), cz+r*cos(t), .016+.004*sin(6*t))
    flowers.append(around(36, petal))
    flowers.append(around(12, lambda t: back(cy+.032*sin(t),cz+.032*cos(t),.012)))
paths('등받이 · 여섯 잎 꽃살과 고리', flowers, .009, pale, True)

scrolls = []
for side in (-1, 1):
    # The top edge of the open arm meets a continuous spiral at the front post.
    def arm(t):
        a = .4+.06*sin(t*math.pi)
        return (-.20+.47*t,side*a,.92-.21*sin(t*math.pi/2))
    top = between(12, arm)
    start = top[-1]
    for i in range(1, 24):
        t = i/23; angle=TAU*t*1.14; r=.095*(1-.81*t)
        top.append((start[0]+r*sin(angle), start[1]-.028*side*t, start[2]-.095+r*cos(angle)))
    scrolls.append(top)
    scrolls.append([(-.17,.28*side,.47),(-.05,.37*side,.57),(.16,.425*side,.69)])
paths('팔걸이 · 앞쪽 나선과 경사진 버팀대', scrolls, .016, cane)

rings = [(0.03,.33),(.058,.335),(.20,.245),(.32,.226),(.435,.345)]
paths('받침 · 고리', [ring(z,r,r) for z,r in rings], .014, cane, True)
lattice=[]
for i in range(18):
    angle=TAU*i/18
    for shift in (-.51,.51):
        lattice.append([(r*cos(angle+shift*j/4),r*sin(angle+shift*j/4),z) for j,(z,r) in enumerate(rings)])
paths('받침 · 교차한 등심', lattice, .008, pale)
for z,r in [(0.066,.33),(.208,.244),(.36,.266)]:
    paths('받침 · 등심 감기', [ring(z,r,r),ring(z+.013,r,r)], .006, binding, True)

sweep('좌판 · 두툼한 둥근 리넨 방석',
      [ring(z,rx,ry,.035) for z,rx,ry in [(.422,.324,.329),(.45,.405,.421),
       (.484,.411,.426),(.534,.39,.413),(.553,.31,.33),(.561,.08,.09)]], seat)
paths('좌판 · 이음 테두리', [ring(.489,.410,.427,.035)], .006, pale, True)


def power(x,p):
    return math.copysign(abs(x)**p,x)


def pillow_point(lon, lat):
    # Superellipse cross-sections give the loose pillow four soft corners. Lean it back against the cane.
    width = .295 * power(cos(lat),.49)*power(sin(lon),.57)
    dz = .219 * power(sin(lat),.52)
    depth = .119 * power(cos(lat),.49)*power(cos(lon),.57)
    if depth > 0:
        depth -= .022*math.exp(-((width/.10)**2+(dz/.07)**2))
    return (-.065+depth-.26*dz, width, .745+dz)


rows = [[pillow_point(-TAU*i/24, -math.pi/2+.016+(math.pi-.032)*j/12) for i in range(24)] for j in range(13)]
# Viewed from above, the right side of the cushion is local +Y.
rows = [list(reversed(row)) for row in rows]
sweep('등쿠션 · 오목한 중심과 네 귀', rows, pillow)
seam = []
for sign, t0, t1 in [(1,-math.pi/2,math.pi/2),(-1,math.pi/2,-math.pi/2)]:
    seam.extend(pillow_point(sign*math.pi/2,t0+(t1-t0)*i/24) for i in range(24))
paths('등쿠션 · 봉제 파이핑', [seam], .005, welt, True)

for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces.active.shading.color_type = 'MATERIAL'
        view = area.spaces.active.region_3d
        view.view_location = (0,0,1)
        view.view_rotation = Vector((-3,2,-1)).to_track_quat('-Z','Y')
        view.view_distance = 3.3
scene.view_settings.view_transform='Standard'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'lounge-chair.blend'), compress=True)
runpy.run_path(str(HERE/'export.py'),run_name='__main__')
