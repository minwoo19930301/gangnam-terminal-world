"""Build the editable hotel flan and boxed macarons, in metres."""
from pathlib import Path
from math import cos, sin, pi, tau
import bpy
import runpy
import subprocess

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
case = bpy.data.collections.new('파티세리 · 플랑과 마카롱 선물 상자')
scene.collection.children.link(case)
case['export_model'] = 'desserts'
case['preview_origin'] = (0, 0, 0)
case['reference'] = 'JW Marriott Hotel Seoul Pâtisserie. Product types documented, display arrangement interpreted.'


def pigment(name, hex_color):
    rgb = [int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4)]
    linear = [c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4 for c in rgb]
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*linear, 1)
    return mat


porcelain = pigment('아이보리 유약', 'F2EADC')
brass = pigment('받침 금테', 'B89B62')
box = pigment('선물 상자 · 와인', '583B43')
lining = pigment('유산지', 'E2D1AE')
crust = pigment('겹 페이스트리', 'B56324')
edge = pigment('구운 페이스트리 끝', '8B4925')
custard = pigment('바닐라 커스터드 단면', 'F1C966')
surface = pigment('캐러멜 윗면', 'B86728')
toasted = [pigment('캐러멜 색상 '+str(i+1), c) for i, c in enumerate(
    ['DF9348','D9893D','CE7D34','C0722F','AE632B','9C562B','874A28','754228'])]
flaky = pigment('페이스트리 얇은 층', 'D18942')
fill = pigment('마카롱 크림', 'F5E6BA')
shells = [(pigment(n, col), pigment(n+' · 피에', lip)) for n, col, lip in [
    ('피스타치오', 'B6C486', '8B9F68'), ('라즈베리', 'DA8C96', 'B26D7F'),
    ('캐러멜', 'CD9D72', 'A87855'), ('코코아', '976959', '78503D')]]


def mesh(name, vertices, faces, materials, indices=None, smooth_faces=()):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    case.objects.link(obj)
    for mat in materials:
        data.materials.append(mat)
    for f, idx in zip(data.polygons, indices or []):
        f.material_index = idx
    for i in smooth_faces:
        data.polygons[i].use_smooth = True
    return obj


def block(name, x, y, z, w, d, h, material):
    points = [(x+i*w/2, y+j*d/2, z+k*h) for k in (0, 1) for j in (-1, 1) for i in (-1, 1)]
    faces = [(0,2,3,1), (4,5,7,6), (0,1,5,4), (1,3,7,5), (3,2,6,7), (2,0,4,6)]
    return mesh(name, points, faces, [material])


def turning(name, x, y, profile, mats, surfaces, n=32, start=0, end=tau, wall_mat=None):
    closed = abs(end-start-tau) < .0001
    count = n if closed else n+1
    verts = []
    for radius, z, scallop in profile:
        for i in range(count):
            a = start + (end-start)*i/n
            r = radius + scallop*cos(16*a)
            verts.append((x+r*cos(a), y+r*sin(a), z))
    faces, ids = [], []
    for level, index in enumerate(surfaces):
        for i in range(n):
            j = (i+1) % count
            lo, hi = level*count, (level+1)*count
            faces.append((lo+i, lo+j, hi+j, hi+i))
            ids.append(index)
    # Flat lids and separately editable cut faces; straight radial cuts expose the custard.
    bottom, top = list(range(count)), list(range(len(verts)-count, len(verts)))
    if not closed:
        bottom.append(len(verts))
        verts.append((x, y, profile[0][1]))
        top.append(len(verts))
        verts.append((x, y, profile[-1][1]))
    faces.extend([tuple(reversed(bottom)), tuple(top)])
    ids.extend([surfaces[0], surfaces[-1]])
    if not closed:
        for idx in (0, count-1):
            rings = []
            for radius, z, scallop in profile:
                rings.append(len(verts))
                verts.append((x, y, z))
            for lev in range(len(profile)-1):
                cut = (rings[lev], lev*count+idx, (lev+1)*count+idx, rings[lev+1])
                faces.append(cut if idx == 0 else tuple(reversed(cut)))
                ids.append(wall_mat[lev] if wall_mat else 0)
    return mesh(name, verts, faces, mats, ids)


def board(x, radius):
    turning('도기 받침과 금테', x, 0, [(radius*.91,.002,0),(radius,.009,0),
            (radius,.015,0),(radius*.96,.022,0)], [porcelain,brass], [0,1,0], 48)


def flan(name, x, y, start, end, size):
    heights = [(.145,0),(.156,.008),(.157,.028),(.155,.084),(.151,.091),(.143,.094)]
    profile = [(r*size, .022+z*size, .0028*size if i in (1,2,3) else 0)
               for i,(r,z) in enumerate(heights)]
    turning(name,x,y,profile,[crust,edge,custard,surface],[0,1,0,1,3],
            n=max(6, int(78*(end-start)/tau)),start=start,end=end,wall_mat=[0,0,2,2,3])
    # Patchy browning on a continuous gently domed top, rather than objects on the crust.
    span = end-start
    steps = max(8, round(64*span/tau))
    rings = 11
    verts = [(x, y, .022+.0964*size)]
    row_len = steps+1
    for ring in range(1, rings+1):
        r = .143*ring/rings
        for j in range(row_len):
            a = start+span*j/steps
            verts.append((x+r*size*cos(a), y+r*size*sin(a),
                          .022+size*(.0964-.0023*(ring/rings)**2)))
    faces, ids = [], []
    for ring in range(rings):
        for j in range(steps):
            outer = 1+ring*row_len+j
            if ring:
                faces.append((outer-row_len,outer,outer+1,outer-row_len+1))
            else:
                faces.append((0,outer,outer+1))
            a = start+span*(j+.5)/steps
            r = (ring+.5)/rings
            u,v = r*cos(a),r*sin(a)
            glow = (sin(10.2*u+2*sin(5.1*v))*cos(6.8*v-1.5*u)
                    + .51*sin(16*u+8*v)+.24*cos(23*v-11*u))
            ids.append(max(0,min(7,round(2.6+1.7*glow+1.8*r**6))))
    mesh('윗면 · 불규칙한 갈변',verts,faces,toasted,ids,range(len(faces)))

    # Faint laminated bands on the vertical case, with local breaks from the bake.
    for band in range(4):
        verts, faces = [], []
        outer = .1562 if band<2 else .1559
        for j in range(steps+1):
            a=start+span*j/steps
            rad=outer+.0028*cos(16*a)+.0007
            height=.032+band*.012+.0014*sin(11*a+band)
            for dz in [0,.0013]:
                verts.append((x+rad*size*cos(a),y+rad*size*sin(a),.022+(height+dz)*size))
            if j and sin(7*a+band*2.7) > -.35:
                n=j*2
                faces.append((n-2,n,n+1,n-1))
        mesh('부풀어 오른 페이스트리 결',verts,faces,[flaky])


board(-.53,.242)
flan('플랑 · 홀에서 조각을 덜어낸 단면',-.53,0,.57,tau-.36,1.24)
board(-.12,.137)
flan('바닐라 플랑 · 한 조각',-.21,-.01,0,1.04,1.13)

# Low open gift box with a folded-paper channel for each pair of macarons.
cx, w, d = .44,.62,.31
block('와인색 선물 상자',cx,0,0,w,d,.017,box)
block('상자 안쪽 유산지',cx,0,.017,w-.014,d-.014,.005,lining)
for y in [-d/2,d/2]:
    block('접은 상자 긴 변',cx,y,.016,w,.008,.054,box)
for x in [cx-w/2,cx+w/2]:
    block('접은 상자 짧은 변',x,0,.016,.008,d,.054,box)
for i in range(8):
    x = cx-w/2+.056+i*.073
    if i:
        block('종이 칸막이',x-.037,0,.022,.003,d-.014,.035,lining)
    for j,y in enumerate([-.069,.070]):
        top, foot = shells[(i+j)%len(shells)]
        rr = 1+(i%3-1)*.029
        profile=[(.019,.024,0),(.027,.027,0),(.032,.034,.0008),(.032,.040,.001),
                 (.028,.041,0),(.028,.047,0),(.032,.048,.001),(.033,.054,.0008),
                 (.031,.060,0),(.024,.065,0),(.013,.067,0)]
        turning('마카롱 · 윗껍질과 크림층',x,y,[(r*rr,z,s) for r,z,s in profile],
                [top,foot,fill],[0,0,1,1,2,2,1,1,0,0],n=20)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'patisserie.blend'),compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')
subprocess.run(['node', str(HERE/'pack.mjs'), str(HERE/'desserts.glb')], check=True)
