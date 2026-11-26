"""Granite seating, glazed planter columns and inlaid paving in Goto Mall's west rest area."""
from math import cos, sin, pi, tau
from random import Random
from pathlib import Path
import sys
import runpy
import bpy
from mathutils import Matrix,Vector

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='고투몰 · 서편광장 휴게석'
scene.unit_settings.system='METRIC'
for k,h in {
 'top':'504e4a','side':'494946','edge':'52534e','light':'aaa89f','under':'313431',
 'darkstone':'3d3e3b','greygrain':'6a6860','iron':'454742','quartz':'89867a','fine':'62625b',
 'palegrain':'c8c5b8','smoke':'929385','black':'333835','steel':'a2a8a1','trim':'aaa18b',
 'glass':'b9c6ac','gold':'9c8b66','green':'536b3d','stalk':'667c46','shade':'3e5535',
 'palea':'8b9553','lime':'798e53','earth':'615944','stoneband':'d4d0c2',
 'bandedge':'c1bdb2','seam':'6c6b65','pave1':'4c4d4a','pave2':'4f504e','pave3':'535451','pave4':'50514e','paper':'d8cfb8','web':'9b8b6e','bag':'a18c75'
}.items():
    m.palette[k]=m.material(k,h,.31 if k in ('steel','gold','trim') else 0)
B,C,T=m.block,m.profile,m.rod
rng=Random(227)
def collection(name,parent=None):
    c=bpy.data.collections.new(name)
    (parent or scene.collection).children.link(c);m.group=c
    return c
def root(name,offset):
    c=collection('고투몰 서편 · '+name);c['preview_origin']=offset
    return c

def seat_band(name,profile,tone):
    # One curved seat section repeated around independent column bases in the game.
    n=30;k=len(profile);v=[]
    for i in range(n+1):
        a=(-46+92*i/n)*pi/180
        v.extend((r*sin(a),r*cos(a),z) for r,z in profile)
    f=[(i*k+j,(i+1)*k+j,(i+1)*k+(j+1)%k,i*k+(j+1)%k) for i in range(n) for j in range(k)]
    f.extend([tuple(range(k)),tuple(reversed(range(n*k,(n+1)*k)))])
    return m.piece(name,v,f,tone)
seat=root('두 줄 석재의 곡선 벤치',(0,0,0))
collection('검은 화강석과 밝은 수평 띠',seat)
seat_band('안쪽 검정 걸레받이',[(1.46,.019),(2.04,.019),(2.06,.047),(2.06,.095),(1.46,.095)],'under')
seat_band('회색 화강석 한 줄',[(1.390,.073),(2.105,.073),(2.137,.091),(2.152,.108),
        (2.152,.177),(2.145,.189),(1.385,.189)],'light')
seat_band('짙은 화강석 측면',[(1.378,.185),(2.143,.185),(2.154,.194),(2.154,.411),
        (2.145,.428),(1.374,.428)],'side')
seat_band('광택을 낸 곡면 상판',[(1.372,.416),(2.145,.416),(2.150,.434),(2.143,.449),
        (2.132,.456),(1.386,.456),(1.373,.449)],'top')
collection('석재 단면에 나타난 잔입자의 색',seat)
def aggregate(n,location):
    # Colored stone chips are batched per material but remain separable from each slab in Blender.
    verts={};faces={}
    for i in range(n):
        a=rng.uniform(-.793,.793);rh=rng.uniform(1.392,2.131)
        tone=rng.choice(['darkstone','greygrain','quartz','fine']) if location!='stripe' else rng.choice(['palegrain','smoke','fine'])
        z=.4564
        if location=='face':rh=2.1545;z=rng.uniform(.205,.405)
        if location=='stripe':rh=2.1525;z=rng.uniform(.110,.170)
        x=rh*sin(a);d=rh*cos(a);rad=rng.uniform(.0024,.0064)
        vs=verts.setdefault(tone,[]);fs=faces.setdefault(tone,[]);start=len(vs)
        for j in range(4):
            b=tau*(j+.11*rng.random())/4;dr=rad*(.66+.64*rng.random())
            if location=='top':
                vs.append((x+dr*cos(b),d+.7*dr*sin(b),z))
            else:
                vs.append((x+dr*cos(a)*cos(b),d-dr*sin(a)*cos(b),z+.75*dr*sin(b)))
        fs.append((start,start+1,start+2,start+3))
    for tone,vs in verts.items():m.piece('화강석 '+{'top':'앉는 면','face':'전면','stripe':'회색 띠'}[location]+'의 작은 결정',vs,faces[tone],tone)
aggregate(315,'top');aggregate(240,'face');aggregate(85,'stripe')

column=root('기둥 금속틀과 식재',(4.75,0,0))
collection('투명 기둥의 금속 틀과 받침',column)
C('검은 기둥 발',0,0,.016,[(.343,0),(.400,.012),(.411,.037),(.411,.080),
       (.391,.096),(.318,.112)],'black',32)
C('얇은 하부 금속 띠',0,0,.102,[(.328,0),(.346,.013),(.345,.039),(.324,.049)],'steel',30)
C('새틴 금속 내부 축',0,0,.150,[(.136,0),(.153,.042),(.149,.37),(.125,1.36),(.146,1.78)],
  'trim',16)
for j in range(6):
    a=tau*j/6+.15;x=.311*sin(a);d=.311*cos(a)
    T('곡면 유리 이음의 금속대',[(x,d,.142),(x,d,1.876)],.010 if j%2 else .014,'steel',7)
    x=.155*sin(a);d=.155*cos(a)
    T('중앙 기둥의 세로 리브',[(x,d,.181),(x,d,1.848)],.009,'iron',5)
for z in [.151,1.844]:
    C('투명관 고정 링',0,0,z,[(.322,0),(.334,.009),(.336,.027),(.321,.042)],'gold',28)
C('윗화분 아래의 어두운 띠',0,0,1.881,[(.301,0),(.391,.026),(.438,.072),(.444,.13),(.428,.151)],'black',28)
C('항아리형 금속 화분',0,0,2.004,[(.306,0),(.332,.026),(.338,.132),
       (.339,.155),(.329,.162),(.31,.150)],'gold',25)
C('화분 속 흙',0,0,2.149,[(.295,0),(.306,.009)],'earth',24)
collection('화분 끝에서 쏟아지는 좁은 잎',column)
for j in range(102):
    a=j*2.399+.31*rng.random();rr=.26*(rng.random()**.55)
    x=rr*sin(a);d=rr*cos(a);h=rng.uniform(.13,.37);extent=rng.uniform(.105,.29);w=rng.uniform(.017,.041)
    ca,sa=cos(a),sin(a);u=(sa,ca);v=(ca,-sa)
    vertices=[]
    for f,width in [(0,.15),(.33,.74),(.65,1),(.85,.57),(1,.04)]:
        lift=h*sin(pi*f*.65)-f*f*.09
        for k in [-1,0,1]:
            vertices.append((x+u[0]*extent*f+v[0]*width*w*k,
                             d+u[1]*extent*f+v[1]*width*w*k,
                             2.152+lift+(.008*(1-abs(k)) if f not in (0,1) else 0)))
    obj=m.piece('갈라지는 화분 잎',vertices,
      [(n*3+i,n*3+i+1,(n+1)*3+i+1,(n+1)*3+i) for n in range(4) for i in range(2)],
      rng.choice(['green','shade','stalk','palea','lime']))
    for poly in obj.data.polygons:poly.use_smooth=True
for j in range(14):
    a=tau*j/14;r=rng.uniform(.08,.23)
    T('잎 사이의 줄기',[(r*sin(a),r*cos(a),2.16),((r+.027)*sin(a),(r+.027)*cos(a),2.30),
         ((r+.08)*sin(a),(r+.08)*cos(a),2.39)],.007,'stalk',5)

glass=root('기둥의 곡면 유리',(7.35,0,0))
collection('이음 틈으로 분리한 여섯 장의 곡유리',glass)
for j in range(6):
    a0=tau*j/6+.164;a1=tau*(j+1)/6+.136
    verts=[];n=8
    for k in range(n+1):
        a=a0+(a1-a0)*k/n
        verts.extend((.311*sin(a),.311*cos(a),z) for z in [.177,1.859])
    m.piece('무색에 가까운 연녹색 곡유리',verts,[(2*k,2*k+2,2*k+3,2*k+1) for k in range(n)],'glass')
m.palette['glass'].diffuse_color=(*m.palette['glass'].diffuse_color[:3],.36)
m.palette['glass'].node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.36
m.palette['glass'].surface_render_method='DITHERED'

floor=root('바닥의 밝은 석재 상감',(0,-5.0,0))
collection('줄눈이 보이는 짙은 석판 바닥',floor)
for j in range(7):
    d0=-3.70+j*1.13;d1=min(4.05,d0+1.13)
    for i in range(19):
        x0=-10.30+i*1.16;x1=min(11.50,x0+1.16)
        if x1<=x0+.02 or d1<=d0+.02:continue
        m.piece('잔줄눈이 있는 바닥 석판',[(x0+.006,d0+.006,.026),(x1-.006,d0+.006,.026),
            (x1-.006,d1-.006,.026),(x0+.006,d1-.006,.026)],[(0,1,2,3)],
            rng.choice(['pave1','pave2','pave2','pave3','pave4']))
        # Sparse mineral flecks interrupt the repeated slab colour at normal eye height.
        pts=[];faces=[]
        for q in range(11):
            cx=rng.uniform(x0+.018,x1-.018);dd=rng.uniform(d0+.018,d1-.018)
            r=rng.uniform(.002,.007);n=len(pts)
            pts.extend([(cx-r,dd,.0267),(cx+.14*r,dd-.48*r,.0267),(cx+r,dd+.17*r,.0267),
                        (cx+.17*r,dd+.61*r,.0267)])
            faces.append((n,n+1,n+2,n+3))
        m.piece('바닥 단면의 작은 결정',pts,faces,'fine')
collection('밝은 타원 인레이와 사선 띠',floor)
# The locations follow existing game geometry. All inlay strips end within the public rest pocket.
def stripe(name,pts,width,z,color):
    verts=[]
    for i,(x,d) in enumerate(pts):
        a=Vector(pts[max(i-1,0)]);b=Vector(pts[min(len(pts)-1,i+1)])
        dif=(b-a).normalized();sx=-dif.y*width*.5;sd=dif.x*width*.5
        verts.extend([(x+sx,d+sd,z),(x-sx,d-sd,z)])
    return m.piece(name,verts,[(2*i,2*i+1,2*i+3,2*i+2) for i in range(len(pts)-1)],color)
for cx,cd,rx,rd in [(-5.5,-.52,3.62,2.53),(2.5,.03,4.58,3.16),(7.75,-.86,3.19,2.31)]:
    pts=[]
    for j in range(73):
        a=tau*j/72;x=cx+rx*sin(a);d=cd+rd*cos(a)
        if x<=10.92 and -3.59<d<4.10:pts.append((x,d))
        elif len(pts)>1:
            stripe('굽은 흰 석재 상감',pts,.127,.03,'stoneband');pts=[]
        else:pts=[]
    if len(pts)>1:stripe('굽은 흰 석재 상감',pts,.127,.03,'stoneband')
for x1,d1,x2,d2 in [(-10.0,-2.91,-1.18,4.0),(-5.77,-3.41,4.68,4.00),(1.08,-3.40,10.73,3.37)]:
    stripe('검은 바닥을 가로지르는 사선 띠',[(x1,d1),(x2,d2)],.095,.034,'bandedge')

for g in [seat,column,glass,floor]:
    bpy.context.view_layer.update()
    shift=Matrix.Translation(Vector(g['preview_origin']))
    for obj in g.all_objects:
        center=sum((Vector(v) for v in obj.bound_box),Vector())/8
        obj.data.transform(Matrix.Translation(-center))
        obj.matrix_world=shift @ obj.matrix_world @ Matrix.Translation(center)
        obj.select_set(False)
    g['source']='JTB 2026년 8월 서편 휴게석 현장 사진. 석재 마감·밝은 띠와 곡면 유리 기둥을 관찰. 수량과 위치·치수는 게임 공간에 맞춤.'
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        v=area.spaces.active;v.shading.color_type='MATERIAL';target=Vector((1.6,-.5,.7))
        v.region_3d.view_location=target;v.region_3d.view_distance=17
        v.region_3d.view_rotation=(target-Vector((6,11,5))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(here/'west-lounge.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
