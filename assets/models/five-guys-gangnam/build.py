"""The timber portal, arched milkshake window and drinks equipment in the operator photograph."""
from math import pi, sin, cos
from pathlib import Path
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("FiveGuysGangnamFront")
bpy.context.scene.collection.children.link(collection)
materials = {}
def finish(hexcode):
    if hexcode not in materials:
        m = bpy.data.materials.new(hexcode)
        rgb = [int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
        m.diffuse_color = [c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4 for c in rgb]+[1]
        materials[hexcode] = m
    return materials[hexcode]
def mesh(name,verts,faces,tint):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    data.materials.append(finish(tint))
    return obj
def box(name,x,y,z,w,d,h,tint):
    verts=[(x+a*w/2,y+b*d/2,z+k*h) for k in (0,1) for a,b in ((-1,-1),(1,-1),(1,1),(-1,1))]
    return mesh(name,verts,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],tint)
font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
def lettering(label,x,y,z,width,height,tint):
    c=bpy.data.curves.new(label,'FONT');c.body=label;c.font=font;c.align_x='CENTER';c.align_y='CENTER';c.resolution_u=4
    o=bpy.data.objects.new(label,c);collection.objects.link(o);c.materials.append(finish(tint))
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');o.select_set(False)
    o.scale=(width/max(.001,o.dimensions.x),height/max(.001,o.dimensions.y),1)
    o.rotation_euler.x=pi/2;o.location=(x,y,z)
def strip(name,x,y,z,points,half,col):
    for (a,b),(c,d) in zip(points,points[1:]):
        length=((a-c)**2+(b-d)**2)**.5
        nx,nz=(b-d)*half/length,(c-a)*half/length
        mesh(name,[(x+u,y,z+v) for u,v in [(a+nx,b+nz),(a-nx,b-nz),(c-nx,d-nz),(c+nx,d+nz)]],[(0,1,2,3)],col)
timber='9c662e';dark='302a27';white='fff5e9'
# A broad black portal, and a much narrower timber side light with an awning.
# Wide cream tile returns and the shallow, warm-lit vault bind the shop
# fascia to the arcade rather than leaving its black sign free-standing.
for side in [-1,1]:
    x=2.79*side
    box('아이보리 타일 기둥',x,.26,0,.35,.64,3.12,'d4c4a9')
    box('짙은 기둥 걸레받이',x,.25,0,.40,.68,.065,'645749')
    for j in range(15):
        box('타일 수평 줄눈',x,-.065,.2*j,.344,.006,.006,'bcad95')
for i in range(24):
    a,b=pi*i/24,pi*(i+1)/24
    xx0,xx1=3.0*cos(a),3.0*cos(b)
    z0,z1=2.96+.57*sin(a),2.96+.57*sin(b)
    mesh('얕은 아치 상인방',[(xx0,-.03,z0),(xx1,-.03,z1),(xx1,-.03,3.68),(xx0,-.03,3.68)],[(0,1,2,3)],'d8c7a9')
    mesh('아치의 줄눈',[(xx0,-.036,z0),(xx0-.008,-.036,z0),(xx0-.008,-.036,3.68),(xx0,-.036,3.68)],[(0,1,2,3)],'bdab8f')
    mesh('아치 프레임 측면',[(xx0,-.03,z0),(xx1,-.03,z1),(xx1,.51,z1),(xx0,.51,z0)],[(0,1,2,3)],'bcaa8d')
    mesh('아치의 간접조명',[(xx0,-.035,z0+.005),(xx1,-.035,z1+.005),(xx1,-.035,z1+.023),(xx0,-.035,z0+.023)],[(0,1,2,3)],'fff0cd')
box('검은 왼쪽 문설주',-2.52,.11,0,.135,.33,2.95,dark)
box('검은 오른쪽 문설주',1.14,.11,0,.14,.33,2.95,dark)
box('검은 간판',-.69,.10,2.52,3.80,.34,.48,dark)
lettering('FIVE GUYS',-.69,-.081,2.78,2.57,.27,white)
cx=1.88
for x in [1.23,2.53]:
    box('원목 창틀',x,.14,0,.125,.34,2.90,timber)
box('원목 걸레받이',cx,.16,0,1.37,.37,.18,'99602d')
for y in [.104,.139]:
    strip('아치형 창틀',cx,y,2.18,[(.57*cos(i*pi/24),.40*sin(i*pi/24)) for i in range(25)],.047,timber)
for x in [1.31,2.45]:box('창틀 세로 몰딩',x,.10,.17,.058,.068,2.02,'bb8647')
box('차양 상부',cx,.19,2.72,1.44,.37,.32,'292525')
mesh('기울인 검은 차양',[(1.16,-.24,2.58),(2.60,-.24,2.58),(2.60,.035,2.99),(1.16,.035,2.99)],[(0,1,2,3)],'292525')
lettering('FIVE',cx,-.15,2.84,.38,.096,white)
lettering('GUYS',cx,-.19,2.73,.42,.096,white)
for h,s,w,hh in [(2.05,'MILK',.65,.14),(1.87,'SHAKES',.90,.15),(1.28,'FIVE GUYS',.87,.115),(.86,'OPEN 7 DAYS',.82,.081)]:
    lettering(s,cx,.054,h,w,hh,white)
for y in [1.56,1.10]:strip('점자형 체크무늬 띠',cx,.052,y,[(-.40,0),(.40,0)],.009,white)
# Stainless drink station against the painted tiled wall, beneath red pendants.
box('흰 타일 벽',-.57,2.40,0,3.63,.12,2.64,'e4ded3')
for i in range(17):
    for j in range(3):
        if(i+j)%2==0:box('붉은 체크 타일',-2.24+.205*i,2.334,.68+j*.185,.203,.012,.182,'b83a35')
box('음료대 붉은 하부',-.76,1.87,0,2.72,.69,.80,'a93b38')
box('금속 상판',-.76,1.87,.80,2.83,.76,.07,'a4a6a0')
for x in [-1.48,-.68]:
    box('음료 디스펜서',x,1.99,.87,.64,.44,.86,'999992')
    box('검은 음료 배출부',x,1.76,1.02,.57,.032,.33,'342f2b')
    box('붉은 전면',x,1.76,1.42,.58,.034,.22,'b83530')
    for j in range(4):
        box('음료 탭',x+(j-1.5)*.118,1.723,1.26,.055,.084,.09,'cbc6b9')
for x in [-1.62,.02]:
    box('전등 줄',x,1.36,2.39,.021,.021,.53,'4f423a')
    n=16
    pts=[(x+r*cos(k*2*pi/n),1.36+r*sin(k*2*pi/n),h) for h,r in [(2.34,.15),(2.48,.061)] for k in range(n)]
    mesh('붉은 펜던트',pts,[(j,(j+1)%n,(j+1)%n+n,j+n)for j in range(n)],'ab342f')
    mesh('램프 하부',pts[:n],[tuple(range(n))],'ffe4a8')

# The visitor's counter photograph shows a red checkout beside the dispensers.
box('붉은 주문 카운터',.71,1.72,0,1.05,.63,.87,'ac3031')
box('주문 카운터 상판',.71,1.72,.87,1.13,.70,.055,'d94238')
box('단말기 하부',.70,1.61,.925,.28,.20,.040,'403d37')
box('검은 단말기',.70,1.63,.965,.32,.08,.19,'46433f')
for j in range(5):
    box('체커 타일',.27+.207*j,1.396,.44,.17,.009,.145,'efe9db')
for j,heading in enumerate(['BURGERS','FRIES','MILKSHAKES']):
    x=-1.15+j*.73
    box('붉은 테두리 메뉴판',x,2.309,1.88,.69,.03,.44,'ae3a37')
    box('크림색 메뉴판',x,2.29,1.90,.66,.014,.40,'f0e6c9')
    lettering(heading,x,2.28,2.19,.52,.053,'9a3834')
# Place one wrapped meal on the original nearest dining table. Its baked position
# follows the fixed guide bay and its tabletop at 0.79 m in the game.
import random
rng=random.Random(5)
x,y,z=.975,3.04,.756
def turned(name,x,y,z,rings,col,n=20):
    vs=[(x+r*cos(j*2*pi/n),y+r*sin(j*2*pi/n),z+h)for h,r in rings for j in range(n)]
    faces=[(k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j) for k in range(len(rings)-1) for j in range(n)]
    return mesh(name,vs,faces+[tuple(range((len(rings)-1)*n,len(rings)*n))],col)
for j in range(16):
    a,b=j*pi/8,(j+1)*pi/8
    def foil(r,a,h):return [x+r*cos(a),y+r*sin(a)*.81,z+h]
    mesh('펼친 포일', [foil(.072,a,.003),foil(.072,b,.003),foil(.137+rng.random()*.014,b,.009+rng.random()*.013),foil(.137+rng.random()*.014,a,.008)],[(0,1,2,3)],['d7d9d2','a8aba7','f4f1e7','c7c9c2'][j%4])
for h,rad,thick,col in [(.009,.076,.016,'bf8349'),(.025,.083,.016,'62433a'),(.038,.080,.008,'edb144'),(.044,.084,.012,'4c6d3c')]:
    turned('번과 패티',x,y,z+h,[(0,rad), (thick,rad)],col)
turned('참깨 번',x,y,z+.056,[(0,.084),(.017,.080),(.031,.060),(.038,.028)],'cb8b4b')
for j in range(17):
    a=j*2.4;r=.058*(j/17)**.5
    box('참깨',x+r*cos(a),y+r*sin(a),z+.094-.013*(r/.06)**2,.007,.003,.002,'ead19e')
xx=x+.20
turned('흰 음료 컵',xx,y+.06,z,[(.002,.040),(.135,.053)],'ece9df')
turned('붉은 컵 띠',xx,y+.06,z+.07,[(0,.048),(.028,.050)],'b13d36')
turned('컵 뚜껑',xx,y+.06,z+.136,[(0,.054),(.008,.053)],'e2e1d8')
box('종이 포장백',x-.20,y+.10,z,.16,.079,.20,'be9b6c')
lettering('FIVE GUYS',x-.20,y+.058,z+.09,.135,.021,'974038')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'front.blend'),compress=True)
