"""Editable hair accessories and household brushes from the B1 Daiso branch visit."""
from math import cos,sin,pi,tau
from pathlib import Path
from random import Random
import runpy
import sys
import bpy
from mathutils import Vector,Matrix

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='다이소 · 헤어 액세서리와 청소용품';scene.unit_settings.system='METRIC'
colors={'white':'eceee8','wall':'dcdfd9','seam':'b3b7ae','shade':'c9cfc8','edge':'888f89','steel':'aab1ac',
        'bright':'d3d8d3','ink':'393e40','black':'34373a','navy':'454853','charcoal':'575b59',
        'pink':'d3a9ae','rose':'ba9093','lavender':'aba6bf','cream':'e5dbb8','tan':'b89a75',
        'dirt':'796652','tortoise':'89684b','honey':'c49b63','gold':'a89363','brown':'685246',
        'aqua':'a8c6be','mint':'9cb5a4','grey':'b7b8af','card':'f2efe6','red':'ca5145',
        'pale':'d7c8b8','yellow':'eed877','blue':'7194af','lilac':'b6b2d3','lav':'b79eb5',
        'set':'d6adbd','off':'efefe6','bristle':'bec6c2','filament':'dce0d7','graphite':'6b706f',
        'brass':'b4a16c','pblue':'a4b5c7','sky':'a3bdc5','pack':'d2d7cf','slate':'626d76'}
for k,h in colors.items():m.palette[k]=m.material(k,h,.45 if k in ('steel','bright','gold','brass') else 0)
B,C,T=m.block,m.profile,m.rod
rng=Random(73042)
def child(name,parent):
    c=bpy.data.collections.new(name);parent.children.link(c);m.group=c;return c
def native(name,offset):
    c=child('다이소 · '+name,scene.collection);c['preview_origin']=offset;return c
def shaped(name,outline,d,depth,tone):
    n=len(outline);v=[(x,dd,z) for dd in (d-depth/2,d+depth/2) for x,z in outline]
    f=[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    return m.piece(name,v,f,tone)
def corners(x,z,w,h,r):
    pts=[]
    for cx,cz,start in [(x+w/2-r,z+h/2-r,0),(x-w/2+r,z+h/2-r,pi/2),
                        (x-w/2+r,z-h/2+r,pi),(x+w/2-r,z-h/2+r,1.5*pi)]:
        for i in range(4):
            a=start+i*pi/6;pts.append((cx+r*cos(a),cz+r*sin(a)))
    return pts
def rim(name,outer,inner,d,depth,tone):
    n=len(outer);v=[(x,dd,z) for dd in (d-depth/2,d+depth/2) for ring in (outer,inner) for x,z in ring];faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,n+j,n+i),(2*n+i,3*n+i,3*n+j,2*n+j),
                      (i,2*n+i,2*n+j,j),(n+i,n+j,3*n+j,3*n+i)])
    return m.piece(name,v,faces,tone)
def ellipse(x,z,rx,rz,n=20):
    return [(x+rx*cos(i*tau/n),z+rz*sin(i*tau/n)) for i in range(n)]
def meshify(name,items,tone):
    v=[];f=[]
    for pts,faces in items:
        a=len(v);v.extend(pts);f.extend(tuple(a+j for j in face) for face in faces)
    if f:m.piece(name,v,f,tone)
def title_card(x,z,w,h,d=-.11,tone='card'):
    B('상품 종이카드',x,d,z,w,.014,h,tone)
    B('걸이 구멍의 안쪽',x,d-.009,z+h*.85,.033,.003,.009,'edge')
    B('다이소 빨간 작은 표식',x-w*.33,d-.011,z+h*.74,w*.12,.004,h*.055,'red')
    for i,k in enumerate([.60,.43]):B('카드의 짧은 품명',x+w*.06,d-.010,z+h*(.61-i*.14),w*k,.003,.007,'ink')
def peg(x,z,d0=.142,d1=-.103):
    T('철망 걸이와 솟은 끝',[(x,d0,z),(x,d1+.016,z),(x,d1,z+.020)],.0047,'steel',5)
def frame(parent,width):
    child('흰 철제 매대 · 타공판과 하부 서랍',parent)
    B('바닥 가림판',0,.025,.021,width-.045,.54,.123,'shade')
    B('흰 하단 진열 서랍',0,.024,.127,width,.54,.175,'white')
    B('손잡이 홈',0,-.250,.220,.29,.009,.032,'ink')
    B('흰색 타공 등판',0,.151,.272,width-.043,.023,1.51,'white')
    for x in [-width/2+.018,width/2-.018]:B('옆 기둥',x,.01,.133,.037,.327,1.73,'shade')
    B('밑 진열판',0,-.031,.297,width+.023,.48,.035,'white')
    holes=[]
    for i in range(int(width/.059)-1):
        for j in range(24):
            x=-width/2+.076+i*.059;z=.353+j*.058;r=.0044
            holes.append(([(x-r,.1385,z-r),(x+r,.1385,z-r),(x+r,.1385,z+r),(x-r,.1385,z+r)],[(0,1,2,3)]))
    meshify('타공 등판의 걸이 구멍',holes,'grey')
    B('흰 코너 간판',0,.082,1.79,width,.061,.215,'off')
    B('상부 금속 코너',0,.086,2.005,width+.012,.088,.026,'shade')
    for x in [-.48,0,.48]:B('하부 가격표 레일',x,-.273,.307,.47,.016,.042,'shade')

hair=native('머리띠와 집게핀·헤어롤 진열',(0,0,0))
frame(hair,1.54)
child('원형 진열봉 · 쿠션 머리띠와 얇은 밴드',hair)
def headband(x,d,z,thick,tone,pattern=None):
    # A cushioned horseshoe sits over the long horizontal rod. The two open tips hang below.
    n=17;vertices=[];faces=[]
    for i in range(n+1):
        a=(-.34+i*(pi+.68)/n)
        dd=d+.109*cos(a);hh=z+.158*sin(a)
        for w,r in [(-thick/2,-.005),(thick/2,-.005),(thick/2,.008),(-thick/2,.008)]:
            vertices.append((x+w,dd+r*cos(a),hh+r*sin(a)))
    for i in range(n):
        for k in range(4):
            p=4*i+k;q=4*i+(k+1)%4;faces.append((p,q,q+4,p+4))
    faces.extend([(0,3,2,1),tuple(range(4*n,4*n+4))]);m.piece('열린 곡선의 머리띠',vertices,faces,tone)
    if pattern:
        for i in range(3,17,3):
            a=-.34+i*(pi+.68)/n;dd=d+.119*cos(a);hh=z+.169*sin(a)
            T('머리띠 천의 가는 줄',[(x-thick*.46,dd,hh),(x+thick*.46,dd,hh)],.0019,pattern,4)
for x in [-.714,.714]:
    B('진열봉 양끝 받침',x,.036,1.398,.024,.21,.065,'steel')
T('머리띠용 긴 둥근 진열봉',[(-.714,-.083,1.46),(.714,-.083,1.46)],.046,'grey',14)
for i in range(24):
    x=-.65+i*.056
    tone=['ink','tan','cream','navy','grey','pink','tortoise','black'][i%8]
    headband(x,-.080,1.416,.037 if i%4 else .046,tone,'card' if i%4==2 else None)
    if i%3==0:B('작은 밴드용 꼬리표',x,-.184,1.347,.029,.014,.061,'card')
child('흰 카드에 걸린 반달 집게핀',hair)
def claw(x,d,z,tone):
    # Open comb teeth, two curved jaws and the contrasting pivot read even in silhouette.
    for side in [-1,1]:
        outline=[(x-.072,z+.012),(x-.059,z+.052),(x-.025,z+.073),(x+.03,z+.071),
                 (x+.067,z+.052),(x+.073,z+.023),(x+.057,z+.025),(x+.032,z+.042),
                 (x-.033,z+.040),(x-.060,z+.011)]
        shaped('집게핀의 둥근 양쪽 턱',outline,d+side*.019,.016,tone)
        for j in range(7):
            xx=x-.055+j*.0175+(side>0)*.005
            pts=[(xx-.004,d+side*.021,z+.028),(xx+.004,d+side*.021,z+.028),
                 (xx+.003,d+side*.014,z-.025),(xx,d+side*.005,z-.035),(xx-.002,d+side*.014,z-.025)]
            m.piece('서로 맞물리는 집게 살',pts,[(0,1,2,3,4)],tone)
    for sd in [-1,1]:
        T('닫는 손잡이',[(x-.023,d+sd*.022,z+.054),(x-.035,d+sd*.038,z+.091),
                    (x+.007,d+sd*.041,z+.101),(x+.027,d+sd*.025,z+.062)],.006,tone,6)
    T('집게핀 금속 축',[(x-.045,d,z+.056),(x+.043,d,z+.056)],.0054,'gold',7)
for i in range(6):
    x=-.603+i*.24;peg(x,1.31);title_card(x,1.055,.17,.238)
    claw(x,-.130,1.115,['tortoise','black','honey','brown','cream','tortoise'][i])
    if i%2==0:
        for dx in [-.041,.008,.039]:B('거북무늬 반점',x+dx,-.158,1.15,.018,.005,.012,'brown')
child('주름 잡힌 패브릭 곱창밴드',hair)
def scrunchie(x,d,z,tone,phase):
    n=36;k=7;v=[];f=[]
    for i in range(n):
        a=i*tau/n;radius=.059+.008*cos(a*9+phase);tube=.021+.007*sin(a*9+phase)
        for j in range(k):
            turn=tau*j/k;r=radius+tube*cos(turn)
            v.append((x+r*cos(a),d+tube*sin(turn)+.005*cos(a*9+phase),z+r*sin(a)))
    for i in range(n):
        for j in range(k):
            f.append((i*k+j,((i+1)%n)*k+j,((i+1)%n)*k+(j+1)%k,i*k+(j+1)%k))
    obj=m.piece('주름 잡힌 천 밴드',v,f,tone)
    for p in obj.data.polygons:p.use_smooth=True
for i in range(7):
    x=-.64+i*.213
    peg(x,.950);title_card(x,.789,.14,.137,tone='off')
    scrunchie(x,-.137,.792,['rose','cream','lav','navy','tan','black','pink'][i],i*.7)
child('속이 보이는 분홍·보라 원통형 헤어롤',hair)
def roller(x,d,z,r,length,tone,lean):
    # End rings, axial cage ribs and spiral rows leave genuine openings through the hollow roll.
    ux,uz=cos(lean),sin(lean);px,pz=-uz,ux;k=14
    def pt(along,turn,rad):
        return (x+along*ux+rad*px*cos(turn),d+rad*sin(turn),z+along*uz+rad*pz*cos(turn))
    bands=[]
    for j in range(5):
        a=-length/2+j*length/4;v=[pt(a+w,tau*i/k,r) for w in [-.004,.004] for i in range(k)]
        bands.append((v,[(i,(i+1)%k,k+(i+1)%k,k+i) for i in range(k)]))
    for i in range(k):
        a=tau*i/k;v=[pt(-length/2,a-.029,r),pt(-length/2,a+.029,r),pt(length/2,a+.029,r),pt(length/2,a-.029,r)]
        bands.append((v,[(0,1,2,3)]))
    meshify('헤어롤의 열린 격자와 중간 링',bands,tone)
for i in range(5):
    x=-.575+i*.287
    B('헤어롤 투명 포장 뒤 카드',x,.005,.355,.225,.017,.297,'card')
    for j in range(2):roller(x,-.102,.424+j*.1,.042+.007*(i%2),.175,['pink','lilac','cream'][i%3],(.06 if j else -.04))
    B('헤어롤 포장 컬러 띠',x,-.151,.345,.229,.008,.048,['rose','lav','tan'][i%3])

clean=native('손잡이 청소솔과 틈새 브러시 진열',(2.35,0,0))
frame(clean,1.50)
child('손잡이 구멍이 열린 다용도 청소솔',clean)

def tufts(name,roots,dx,dd,dz,tone):
    # Tuft clusters end in a lighter, splayed comb. Keep the spaces between the bundles.
    bundles=[]
    direction=Vector((dx,dd,dz))
    forward=direction.normalized()
    transverse=forward.cross(Vector((0,1,0)) if abs(forward.y)<.86 else Vector((1,0,0))).normalized()
    lateral=forward.cross(transverse)
    for x,d,z,r in roots:
        base=Vector((x,d,z))
        tip=base+direction*(.90+.16*rng.random())
        v=[tuple(center+(transverse*cos(tau*i/5)+lateral*sin(tau*i/5))*radius)
           for center,radius in [(base,r*.70),(tip,r*1.15)] for i in range(5)]
        bundles.append((v,[(i,(i+1)%5,5+(i+1)%5,5+i) for i in range(5)]+[(5,6,7,8,9)]))
    meshify(name,bundles,tone)

def hand_brush(x,z,tone,bristles,width=.26,tilt=0):
    d=-.136
    # Side-on bridges give a clean view through a real handle opening, even against pale card.
    def shape(out):
        return [(x+xx*cos(tilt)-zz*sin(tilt),z+xx*sin(tilt)+zz*cos(tilt)) for xx,zz in out]
    shaped('둥근 솔 바닥날',shape(corners(0,0,width,.052,.022)),d,.081,tone)
    rim('손을 끼우는 손잡이',shape(corners(0,.062,width*.84,.133,.056)),
        shape(corners(0,.067,width*.61,.073,.030)),d,.041,tone)
    rim('손잡이 안쪽의 사출 경사면',shape(corners(0,.067,width*.64,.078,.031)),
        shape(corners(0,.067,width*.590,.070,.029)),d-.021,.003,'edge' if tone in ('white','off','grey') else 'steel')
    for r in range(2):
        roots=[]
        for i in range(14):
            xx=(i/13-.5)*(width-.028)
            xx,zz=shape([(xx,-.016)])[0]
            roots.append((xx,d-.016+r*.03,zz,.0055))
        tufts('바닥을 쓸어내는 빗살',roots,.058*sin(tilt),-.005,-.058*cos(tilt),bristles if r==0 else 'bristle')

for i,(x,z,tilt,tone,bristles) in enumerate([
    (-.50,1.48,-.23,'white','graphite'),(-.17,1.45,.10,'grey','filament'),
    (.17,1.47,-.12,'off','bristle'),(.5,1.46,.17,'grey','graphite'),
    (-.5,1.057,.15,'pack','graphite'),(-.165,1.058,-.08,'pblue','bristle')]):
    peg(x,z+.263);title_card(x,z+.04,.256,.225,d=-.038)
    hand_brush(x,z,tone,bristles,.255 if i%2 else .28,tilt)
child('청·회색 손잡이와 세 개들이 좁은 솔',clean)

def slim_brush(x,z,handle,bristles,scale=1,tilt=0):
    def tr(xx,zz):
        return (x+scale*(xx*cos(tilt)-zz*sin(tilt)),z+scale*(xx*sin(tilt)+zz*cos(tilt)))
    path=[(-.022,.167),(-.019,.207),(-.010,.218),(.009,.218),(.021,.204),(.017,.138),
          (.011,.007),(.027,-.04),(.027,-.097),(-.016,-.102),(-.026,-.076),(-.013,-.027),(-.011,.011)]
    shaped('틈새솔의 길고 굽은 손잡이',[tr(xx,zz) for xx,zz in path],-.130,.021,handle)
    xx,zz=tr(0,.195)
    B('길쭉한 손잡이의 작은 걸이 홈',xx,-.142,zz,.010*scale,.003,.016*scale,'graphite')
    roots=[]
    for i in range(6):
        for j in range(2):
            xx,zz=tr(-.013+i*.006,-.04-.035*j)
            roots.append((xx,-.144,zz,.0038*scale))
    tufts('세로 솔몸에서 도드라진 칫솔형 모',roots,0,-.034*scale,-.009*scale,bristles)

for i,x in enumerate([.167,.503]):
    peg(x,1.30);title_card(x,1.032,.247,.225,d=-.030)
    for j,col in enumerate(['ink','blue','grey']):
        slim_brush(x+(j-1)*.065,1.021,col,'bristle' if j==0 else 'filament',.82,(j-1)*.11)
child('검은 틈새솔 · 금속모 원통 솔',clean)
for i,x in enumerate([-.53,-.23,.09,.45]):
    peg(x,.865);title_card(x,.587,.218,.24,d=-.024)
    if i<2:
        for j in range(2):slim_brush(x-.044+j*.085,.538,'slate' if i else 'black','graphite' if i==0 else 'filament',1.01,(j-.5)*.12)
    else:
        for j in range(2):
            xx=x-.045+j*.089;d=-.116
            C('금속 솔 손잡이',xx,d,.505,[(.018,0),(.023,.018),(.022,.122),(.013,.156)],'grey',10)
            C('금속 솔 심',xx,d,.386,[(.009,0),(.01,.125)],'steel',8)
            for r in range(4):
                angle=tau*r/4
                roots=[(xx+.008*cos(angle),d+.008*sin(angle),.40+n*.013,.0037) for n in range(7)]
                tufts('금속 솔을 감싸는 방사형 모',roots,.022*cos(angle),.022*sin(angle),-.002,'brass' if i==3 else 'graphite')

bpy.context.view_layer.update()
for root in [hair,clean]:
    offset=Matrix.Translation(Vector(root['preview_origin']))
    for obj in root.all_objects:
        center=sum((Vector(v) for v in obj.bound_box),Vector())/8
        obj.data.transform(Matrix.Translation(-center))
        obj.matrix_world=offset @ obj.matrix_world @ Matrix.Translation(center)
        obj.select_set(False)
    root['evidence']='2026-04-06 방문자가 공개한 이 지점의 진열 사진을 참고해 제작. 진열 순서·간격·수량·실측 치수는 확인되지 않음.'
target=Vector((1.14,0,.98))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        view=area.spaces.active;view.shading.color_type='MATERIAL'
        view.region_3d.view_distance=4.6;view.region_3d.view_location=target
        view.region_3d.view_rotation=(target-Vector((1.6,4.4,1.9))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(here/'accessories.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
