"""Construct the editable public-interior architectural motifs in Blender."""
from pathlib import Path
from math import cos, sin, pi
import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
materials = {}


def pigment(color, light=False):
    key = (color, light)
    if key not in materials:
        m = bpy.data.materials.new(('빛 ' if light else '') + color)
        rgb = [int(color[i:i+2], 16)/255 for i in (0, 2, 4)]
        m.diffuse_color = [c/12.92 if c < .04045 else ((c+.055)/1.055)**2.4 for c in rgb] + [1]
        m['lit_face'] = light
        materials[key] = m
    return materials[key]


def group(name):
    coll = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(coll)
    coll['export_model'] = name
    return coll


def mesh(name, verts, faces, color, lit=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    section.objects.link(obj)
    obj.data.materials.append(pigment(color, lit))
    return obj


def box(name, x, y, z, w, d, h, color, lit=False):
    pts = [(x+a*w/2,y+b*d/2,z+c*h/2) for c in (-1,1) for b in (-1,1) for a in (-1,1)]
    return mesh(name,pts,[(2,3,1,0),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],color,lit)


def rod(name, a, b, rad, color, sides=10, lit=False):
    start,end = Vector(a),Vector(b)
    direction = (end-start).normalized()
    axis = Vector((0,0,1)) if abs(direction.z) < .85 else Vector((1,0,0))
    right = direction.cross(axis).normalized()
    up = direction.cross(right)
    ring = [right*(rad*cos(2*pi*i/sides))+up*(rad*sin(2*pi*i/sides)) for i in range(sides)]
    verts = [center+v for center in (start,end) for v in ring]
    faces = [tuple(reversed(range(sides))),tuple(range(sides,2*sides))]
    faces += [(i,(i+1)%sides,sides+(i+1)%sides,sides+i) for i in range(sides)]
    return mesh(name,verts,faces,color,lit)


def annulus(name, profile, color, origin=(0,0,0), sides=32, lit=False):
    ox,oy,oz=origin
    verts=[]
    for h,r in profile:
        for i in range(sides):
            a=i*2*pi/sides
            verts.append((ox+r*cos(a),oy+r*sin(a),oz+h))
    faces=[(i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+(j+1)%sides,(i+1)*sides+j)
           for i in range(len(profile)-1) for j in range(sides)]
    return mesh(name,verts,faces,color,lit)


# Editable 1.8 m module. Each half-lap has a projecting lower bead and a satin arris.
section=group('hotel-lattice')
wood=['765138','735035','805b3e','6b492f','815d40','674832']
for row in range(3):
    for col in range(3):
        cx,cy=(col-1)*.6,(row-1)*.6
        for j in range(2):
            x=cx+(j*.30-.15)
            y=cy+(j*.30-.15)
            # Slot the cross-member into the long rail; the two shoulders end at the rail.
            box('월넛 가로살',cx,y,.100,.60,.078,.20,wood[(row+col+j)%6])
            box('가로살 하부 모서리',cx,y,-.001,.60,.067,.012,'ad815c')
            for offs in (-.15,.15):
                box('월넛 세로살',x,cy+offs,.105,.066,.224,.20,wood[(row*2+col+j+1)%6])
                box('세로살 홈 테두리',x,cy+offs,.002,.059,.224,.009,'936644')


# Seoul's photograph shows transverse white baffles above a raspberry strip and down-facing lettering.
section=group('mall-ceiling')
for n in range(15):
    x=(n-7)*.41
    box('흰색 접은 알루미늄 횡살',x,0,.077,.11,3.45,.132,'dddcd4')
    box('횡살 밑단',x-.013,0,.013,.083,3.45,.022,'f4f2e9')
for off in (-1.18,1.18):
    box('횡살 속의 따뜻한 등',0,off,.17,6.02,.062,.025,'fff1c6',True)
box('분홍 안내띠',0,0,-.014,5.79,.49,.057,'b12858',True)
# Centreline glyphs are original monoline outlines. X is the length of the strip.
glyphs={
'반':[((.11,.12),(.11,.50),(.48,.50),(.48,.12)),((.11,.29),(.48,.29)),((.70,.09),(.70,.60)),((.70,.33),(.92,.33)),((.18,.67),(.18,.90),(.75,.90))],
'포':[((.12,.13),(.86,.13)),((.14,.52),(.84,.52)),((.30,.14),(.30,.51)),((.68,.14),(.68,.51)),((.50,.56),(.50,.85)),((.09,.85),(.90,.85))],
'한':[((.21,.10),(.42,.10)),((.08,.22),(.55,.22)),((.27,.29),(.17,.34),(.15,.44),(.24,.50),(.37,.51),(.45,.44),(.43,.35),(.34,.30),(.27,.29)),((.69,.12),(.69,.61)),((.69,.34),(.90,.34)),((.20,.64),(.20,.88),(.78,.88))],
'강':[((.13,.14),(.46,.14),(.46,.30),(.38,.47),(.12,.56)),((.69,.10),(.69,.57)),((.69,.32),(.88,.32)),((.48,.61),(.32,.65),(.26,.76),(.32,.86),(.49,.91),(.64,.86),(.70,.76),(.64,.66),(.48,.61))],
'공':[((.14,.10),(.79,.10),(.79,.34)),((.46,.26),(.46,.49)),((.09,.49),(.89,.49)),((.49,.60),(.34,.63),(.26,.74),(.32,.86),(.49,.90),(.64,.85),(.71,.74),(.65,.64),(.49,.60))],
'원':[((.31,.09),(.18,.13),(.14,.24),(.20,.32),(.33,.35),(.45,.30),(.48,.20),(.42,.12),(.31,.09)),((.07,.45),(.58,.45)),((.33,.45),(.33,.68)),((.55,.56),(.74,.56)),((.75,.09),(.75,.69)),((.20,.70),(.20,.89),(.78,.89))]}
for i,char in enumerate('반포한강공원'):
    for stroke in glyphs[char]:
        points=[(1.47-i*.47-d*.34,(w-.5)*.39,-.048) for w,d in stroke]
        for a,b in zip(points,points[1:]): rod(char+' 흰 획',a,b,.011,'fff8f0',8,True)
for offset in (-2.40,2.12):
    for dx in (-.13,.07):
        points=[(offset+dx+.13,-.16,-.049),(offset+dx,0,-.049),(offset+dx+.13,.16,-.049)]
        for a,b in zip(points,points[1:]):rod('연속 꺾쇠',a,b,.020,'fff8f0',8,True)


# The visible face and the small beveled returns follow the existing barrel-vault section.
section=group('gallery-rib')
for part,(across,zoff,rise,color) in enumerate([(.24,-.11,.10,'e8e5dc'),(.18,-.18,.09,'f8f6ec'),(.115,-.218,.045,'e0ddd2')]):
    verts=[]; faces=[]
    for i in range(49):
        a=i*pi/48
        for x,h in [(-across/2,0),(across/2,0),(across/2,rise),(-across/2,rise)]:
            verts.append((x,5.75*cos(a),3*sin(a)+zoff+h))
    for i in range(48):
        for j in range(4):
            faces.append((i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j))
    faces.extend([(3,2,1,0),(192,193,194,195)])
    mesh('회반죽 아치 몰딩 '+str(part+1),verts,faces,color)
for side in (-1,1):
    p=side*5.50
    box('아치 받침',0,p,-.23,.44,.30,.30,'ded9cb')
    box('받침 상단',0,p,-.09,.55,.38,.09,'f8f5e8')
    # Black wall brackets and bell-shaped lamps appear on the gallery piers in IDBR's photo.
    oy=side*5.38
    box('벽등 고정판',0,oy,-1.62,.11,.14,.52,'333432')
    points=[(0,oy-side*.03,-1.58),(0,oy-side*.04,-1.31)]
    for i in range(13):
        a=pi*i/12
        points.append((0,oy-side*(.24-.20*cos(a)),-1.31+.21*sin(a)))
    points.append((0,oy-side*.44,-1.45))
    for a,b in zip(points,points[1:]): rod('철제 굽은 벽등 팔',a,b,.023,'343635')
    org=(0,oy-side*.44,-1.56)
    annulus('흑철 벽등 갓',[(0,.16),(.015,.165),(.04,.11),(.10,.073),(.11,.035)],'353735',origin=org)
    annulus('유백색 전등',[(-.032,.011),(-.026,.059),(.005,.095)],'fff4d9',origin=org,lit=True)

# Match the concave, 20 m wide existing screen. The abstract artwork is original.
section=group('terminal-led')
def skin(name,x0,x1,z0,z1,depth,color,lit=False):
    def v(x,z): return (x,-.011*x*x+depth,z)
    return mesh(name,[v(x0,z0),v(x0,z1),v(x1,z1),v(x1,z0)],[(0,1,2,3)],color,lit)
for n in range(40):
    a=-10+n*.5;b=a+.5
    skin('화면 케이스',a,b,0,3.17,.0,'292e33')
    for row in range(6):
        lo=.145+row*.479;hi=lo+.476
        skin('LED 패널',a+.005,b-.005,lo,hi,.020,'90b6ca',True)
        # Curved pale bands cross cabinet seams; split each band at the cabinet boundary.
        for k,(phase,col) in enumerate([(0,'b6ccd0'),(.86,'a9bdc9'),(1.67,'a4b0c3')]):
            def ht(x):return .18+phase+.30*sin(x*.30+phase)+.15*sin(x*.55-phase)
            l0,h0=max(lo,ht(a)),min(hi,ht(a)+.56)
            l1,h1=max(lo,ht(b)),min(hi,ht(b)+.56)
            if max(h0-l0,h1-l1)<=0:continue
            l0,h0=[min(hi,max(lo,v)) for v in (l0,h0)];l1,h1=[min(hi,max(lo,v)) for v in (l1,h1)]
            pts=[(a+.006,-.011*a*a+.024,l0),(a+.006,-.011*a*a+.024,h0),(b-.006,-.011*b*b+.024,h1),(b-.006,-.011*b*b+.024,l1)]
            mesh('패널 위 색면',pts,[(0,1,2,3)],col,True)
    for z in (.07,3.09):
        rod('양극 산화 알루미늄 테두리',(a,-.011*a*a+.032,z),(b,-.011*b*b+.032,z),.047,'555e63',8)
for n in range(-10,11,2):
    y=-.011*n*n-.11
    rod('배면 각관',(n,y,0),(n,y,3.57),.055,'444c50',6)
    if n<10:
        nxt=-.011*(n+2)**2-.11
        rod('상단 연결 트러스',(n,y,3.45),(n+2,nxt,3.45),.045,'62686b',8)
        rod('교차 보강',(n,y,3.12),(n+1,(y+nxt)/2,3.45),.032,'697074',8)
        rod('교차 보강',(n+1,(y+nxt)/2,3.45),(n+2,nxt,3.12),.032,'697074',8)

# Space the studies out in the editable overview. Export restores each local origin.
layout={'hotel-lattice':(-14,5,2),'mall-ceiling':(-6,5,2),'gallery-rib':(5,4,4),'terminal-led':(5,-7,0)}
for name,offset in layout.items():
    coll=bpy.data.collections[name]
    coll['preview_origin']=offset
    for obj in coll.all_objects:
        centre=sum((Vector(corner) for corner in obj.bound_box),Vector())/8
        obj.data.transform(Matrix.Translation(-centre))
        obj.location=centre+Vector(offset)
bpy.context.view_layer.update()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'interiors.blend'),compress=True)
