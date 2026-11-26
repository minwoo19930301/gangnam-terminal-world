"""Build the public dining-room table and export its nearby place setting."""
from pathlib import Path
import json
import math
import runpy
import subprocess

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
model = bpy.data.collections.new('옥소반 · 1관 5F 식탁')
base = bpy.data.collections.new('식탁과 의자')
meal = bpy.data.collections.new('샤브샤브 상차림')
scene.collection.children.link(model)
model.children.link(base)
model.children.link(meal)
meal['export_model'] = 'oksoban-setting'
meal['preview_origin'] = [0, 0, 0]
part = base
materials = {}
sin, cos, tau = math.sin, math.cos, math.tau


def mesh(name, points, faces, color, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(points, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    part.objects.link(obj)
    if color not in materials:
        m = bpy.data.materials.new(f'{name} · {color:06X}')
        rgb = [((color >> shift) & 255) / 255 for shift in (16, 8, 0)]
        m.diffuse_color = [v / 12.92 if v <= .04045 else ((v + .055)/1.055)**2.4 for v in rgb] + [1]
        m['srgb'] = color
        materials[color] = m
    data.materials.append(materials[color])
    for face in data.polygons:
        face.use_smooth = smooth
    return obj


def sweep(name, rings, color, smooth=False, caps=True):
    n = len(rings[0])
    faces = [(j*n+i, j*n+(i+1)%n, (j+1)*n+(i+1)%n, (j+1)*n+i)
             for j in range(len(rings)-1) for i in range(n)]
    if caps:
        faces += [tuple(reversed(range(n))), tuple(range((len(rings)-1)*n, len(rings)*n))]
    return mesh(name, [p for ring in rings for p in ring], faces, color, smooth)


def block(name, center, size, color, bevel=0):
    x, y, z = center
    a, b, c = (v/2 for v in size)
    k = min(bevel, a, b)
    edge = [(-a+k,-b),(a-k,-b),(a,-b+k),(a,b-k),(a-k,b),(-a+k,b),(-a,b-k),(-a,-b+k)] if k else [(-a,-b),(a,-b),(a,b),(-a,b)]
    obj = sweep(name, [[(x+i,y+j,z+h) for i,j in edge] for h in (-c,c)], color)
    if part == base:
        obj['runtime_box_mm'] = [round(v*1000) for v in (x,z-c,-y,2*a,2*c,2*b,k)]
    return obj


def lathe(name, x, y, profile, color, n=24, scale=(1,1), smooth=True, caps=True):
    rings = [[(x+scale[0]*r*cos(tau*i/n), y+scale[1]*r*sin(tau*i/n), z)
              for i in range(n)] for r,z in profile]
    return sweep(name,rings,color,smooth,caps)


def tube(name, path, r, color, sides=6):
    pts=list(map(Vector,path))
    rings=[]
    for i, p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        guide=Vector((0,0,1)) if abs(tangent.z)<.85 else Vector((0,1,0))
        u=tangent.cross(guide).normalized()*r
        v=tangent.cross(u)
        rings.append([p+u*cos(tau*j/sides)+v*sin(tau*j/sides) for j in range(sides)])
    return sweep(name,rings,color,True)


# Near-black stained wood ladder-back chairs and a wood grain laminate tabletop.
WOOD=0x795132
DARK=0x49372d
SEAT=0x644c3d
TOP=.80
block('원목 식탁 · 가장자리', (0,0,.757), (1.80,.95,.074), DARK,.022)
block('호두색 상판', (0,0,.793), (1.795,.945,.014), WOOD,.020)
for x in [-.77,.77]:
    for y in [-.36,.36]:
        block('식탁 다리', (x,y,.37), (.065,.065,.74), DARK)
for x in [-.49,.49]:
    for side in [-1,1]:
        y=side*.72
        block('방석', (x,y,.458), (.445,.445,.063), SEAT,.035)
        block('좌판 프레임', (x,y,.416), (.452,.448,.044), DARK,.012)
        for dx in [-.176,.176]:
            block('앞다리', (x+dx,y-side*.164,.208), (.039,.040,.416), DARK)
            block('등받이 기둥', (x+dx,y+side*.196,.47), (.039,.045,.94), DARK)
        for z in [.725,.865]:
            block('가로 등받이', (x,y+side*.196,z), (.376,.040,.082), DARK,.012)

part=meal
# Shallow timber figure. The cutout rim and the cookware sit above these marks.
for row in range(16):
    y=-.437+row*.056
    x=-.84+.12*((row*3)%6)
    length=.18+.07*(row%5)
    grain=[(x+t*length/5,y+.003*sin(t*.72+.6*row),TOP+.0008) for t in range(6)]
    mesh('상판의 잔 나뭇결', grain+[(a,b+.002,c) for a,b,c in grain],
         [(i,i+1,7+i,6+i) for i in range(5)], 0x866242)

# Stainless lip and circular black glass hob, both shown in the branch photos.
px,py=.115,-.005
block('매립 인덕션 · 스테인리스 테', (px,py,TOP+.006), (.415,.416,.012), 0xbcc2be,.013)
block('인덕션 · 검은 유리', (px,py,TOP+.014), (.390,.391,.009), 0x24272a,.010)
for i in range(4):
    block('조작부 눈금', (px+.083+i*.016,py-.168,TOP+.019), (.008,.003,.0015), 0xb5bebb)
hot=TOP+.020
lathe('양수 냄비 · 브러시드 스테인리스 외벽',px,py,
      [(.108,hot),(.132,hot+.007),(.163,hot+.073),(.164,hot+.10),(.161,hot+.105),
       (.155,hot+.104),(.150,hot+.073),(.130,hot+.024)],0xb4babc,32)
lathe('말아 접은 냄비 테두리',px,py,
      [(.159,hot+.099),(.166,hot+.100),(.167,hot+.104),(.163,hot+.109),(.157,hot+.106)],0xe0e2dd,32,caps=False)
lathe('냄비 벽에 비친 어두운 띠',px,py,
      [(.150,hot+.045),(.154,hot+.052),(.154,hot+.054)],0x929da0,32,caps=False)
lathe('맑은 호박빛 육수',px,py,[(.147,hot+.066),(.151,hot+.072)],0xdba144,32,smooth=False)
for side in [-1,1]:
    path=[(px+side*(.153+.048*cos(t)),py+.057*sin(t),hot+.079+.008*cos(t))
          for t in [-math.pi/2+i*math.pi/10 for i in range(11)]]
    tube('스테인리스 루프 손잡이',path,.007,0xc5cdcb,8)
    for j in [-1,1]:
        lathe('손잡이 리벳',px+side*.148,py+.043*j,[(.006,hot+.084),(.005,hot+.091)],0xd7dddb,8)

# A raised wooden platter with rolled beef slices. The ends and light seams follow the folds.
bx,by=-.18,.330
block('소고기 나무 쟁반', (bx,by,TOP+.018), (1.055,.174,.036), 0xc69558,.025)
block('쟁반 안쪽', (bx,by,TOP+.036), (1.009,.142,.006), 0xdcb57c,.020)
for i in range(9):
    x=bx-.435+i*.109
    y=by+.006*sin(i*2.2)
    z=TOP+.050
    skew=(-.20+.065*(i%3))
    def slice_point(across,angle,r=1):
        return (x+across+skew*.044*cos(angle)*r,
                y+across*.34+.049*cos(angle)*r,
                z+.034*(1+.12*cos(across*45+i))*sin(angle)*r)
    rings=[[slice_point(a,t) for t in [-.30+j*3.82/10 for j in range(11)]]
           for a in [-.037,0,.035]]
    verts=[v for ring in rings for v in ring]
    faces=[(k*11+j,k*11+j+1,(k+1)*11+j+1,(k+1)*11+j) for k in range(2) for j in range(10)]
    mesh('차돌박이 · 말아 접은 결',verts,faces,[0xb64949,0xc65c5c,0xc15353][i%3])
    for sign in [-1,1]:
        cut=sign*.036
        outline=[slice_point(cut,-.30+3.82*j/12,.99) for j in range(13)]
        face=tuple(range(len(outline)))
        mesh('차돌박이 · 접힌 단면',outline,[face],0xbb6660)
        spiral=[slice_point(cut+sign*.0008,-.12+.29*j,1-.064*j) for j in range(13)]
        tube('차돌박이 · 단면의 지방층',spiral,.0016,0xe4b5a1,5)
    for s in range(2):
        a=-.023+s*.036
        points=[]
        for j in range(9):
            t=.2+3.03*j/8
            mid=a+.008*sin(2.8*t+i+s)
            points.extend([slice_point(mid+d,t,1.017) for d in [-.0028,.0028]])
        fs=[(2*j,2*j+1,2*j+3,2*j+2) for j in range(8)]
        mesh('차돌박이 · 가는 마블링',points,fs,0xecd5bc)

def bowl(name,x,y,r,h,color):
    return lathe(name,x,y,[(r*.45,TOP+.003),(r*.52,TOP+.009),(r*.82,TOP+h*.42),
        (r,TOP+h*.94),(r*.985,TOP+h),(r*.925,TOP+h),(r*.855,TOP+h*.76),
        (r*.51,TOP+h*.25)],color,24)


# Vegetables in a cream bowl. Each leaf has a central rib and two cupped halves.
vx,vy=-.49,-.08
bowl('채소용 백자 대접',vx,vy,.158,.073,0xe8ddc4)
def leaf(x,y,z,a,length,width,rise,leaf_color,vein_color,ruffle):
    along=Vector((cos(a),sin(a),0));side=Vector((-sin(a),cos(a),0))
    verts=[];centers=[]
    for j in range(7):
        s=j/6
        center=Vector((x,y,z))+along*(s*length)
        center.z+=rise*(s+.48*sin(math.pi*s))
        w=width*(.05+.95*sin(math.pi*s)**.7)
        centers.append(tuple(center))
        for lateral in [-1,-.42,0,.42,1]:
            p=center+lateral*w*side
            p.z+=abs(lateral)*(-.012*sin(math.pi*s)+ruffle*cos(2.8*j+lateral))
            verts.append(tuple(p))
    fs=[(j*5+k,j*5+k+5,j*5+k+6,j*5+k+1) for j in range(6) for k in range(4)]
    mesh('잎채소 · 주름',verts,fs,leaf_color)
    tube('채소 잎맥',centers[:-1],.0027,vein_color,5)
for i in range(11):
    a=i*tau/11+.55
    color=[0x507849,0xa7b76c,0x6b8c42,0xe7d99b,0x809a4c,0x405d37][i%6]
    leaf(vx+.033*cos(a),vy+.023*sin(a),TOP+.056+.008*(i%3),a,.106+(i%3)*.009,
         .030+(i%4)*.004,.057+.018*(i%3),color,0xc6d29a if i%6!=3 else 0xf5e9bb,.0035)
for i in range(13):
    x=vx-.051+.009*(i%4);y=vy-.02+.01*(i//4);z=TOP+.066
    xt=x-.052+.005*(i%3);yt=y-.021;zt=z+.085+.006*(i%4)
    tube('팽이버섯 줄기',[(x,y,z),(x-.018,y-.009,z+.034),(xt,yt,zt)],.0034,0xefe3c7,5)
    lathe('팽이버섯 갓',xt,yt,[(.007,zt-.002),(.008,zt+.002),(.004,zt+.007)],0xf3e4bb,8)

# Pale, cupped napa leaves with splayed ribs overlap the darker bok choy.
for i in range(3):
    a=-2.25+i*.54
    x=vx+.018*cos(a); y=vy+.018*sin(a); z=TOP+.085+i*.002
    leaf(x,y,z,a,.113,.052,.032,0xd7d592+i*0x030200,0xf4ebce,.006)
    side=Vector((-sin(a),cos(a),0))
    direction=Vector((cos(a),sin(a),0))
    start=Vector((x,y,z))
    for j in [-1,1]:
        tube('배추 · 흰 주맥', [start+direction*t+side*j*w+Vector((0,0,dz))
            for t,w,dz in [(.004,.005,.002),(.041,.005,.024),(.073,.010,.032),(.097,.017,.030)]],.002,0xece9c9,5)

# Paired dark condiment dishes and stainless chopsticks.
for s in [-1,1]:
    xx,yy=.589,s*.187
    for i,col in enumerate([0x925133,0x44382d]):
        xx1=xx+i*.093
        bowl('검은 이절 소스 종지',xx1,yy,.051,.034,0x343b3d)
        lathe('소스',xx1,yy,[(.038,TOP+.019),(.041,TOP+.023)],col,16)
    for j in range(2):
        tube('스테인리스 젓가락',[(xx-.21,yy+s*(.10+.010*j),TOP+.004),
             (xx+.035,yy+s*(.128+.010*j),TOP+.006)],.0024,0xc1c3b8,6)
    block('젓가락 받침', (xx-.078,yy+s*.12,TOP+.005), (.020,.042,.009), 0x716a61,.004)

for i in range(3):
    x=px-.064+i*.044;y=py+.022+.013*(i%2)
    lathe('육수 표면의 파',x,y,[(.009,hot+.073),(.009,hot+.075),(.005,hot+.0755)],0x899344,10,
          scale=(1,.72),caps=False)

# The reusable fixture writer consumes the coarse furniture synchronously; the place
# setting is a single vertex-colour GLB requested only near its table.
def write_base():
    boxes = [list(o['runtime_box_mm']) + [o.data.materials[0]['srgb']] for o in base.objects]
    body = json.dumps(boxes, separators=(',', ':'))
    (HERE/'oksoban-base.js').write_text('// Generated from 식탁과 의자 in millimetres. Each row is x, bottom, z, width, height, depth, chamfer, colour.\nexport const boxes = '+body+';\n')

scene['근거']='이랜드리테일 1관 5층 식당 안내, 방문기 사진 08·18~22. 식탁 크기, 음식 수와 매장 안 배치는 예시.'
bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
write_base()
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'oksoban-table.blend'), compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')

subprocess.run(['node', str(HERE/'oksoban-pack.mjs')], check=True)
