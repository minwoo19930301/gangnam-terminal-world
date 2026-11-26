"""Daiso Express Bus Terminal B1 gardening shelf, based on the April 2026 store photograph."""
from math import cos, sin, tau
from pathlib import Path
from random import Random
import runpy
import sys
import bpy
from mathutils import Matrix, Vector

here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='강남고속버스터미널점 · 홈가드닝 원예용품'
scene.unit_settings.system='METRIC'
colors={
 'case':'e6e8e5','steel':'bcc4c5','lip':'ced4d4','shadow':'aaaead','white':'eeeae2',
 'cream':'dfd5bb','sand':'c5b49b','paper':'f6f3e7','ink':'526255','header':'8c9f74',
 'terracotta':'b6835d','umber':'90624c','amber':'b89c4c','brown':'766455','yellow':'dcca69',
 'sage':'a9b59d','moss':'7f926e','jade':'779581','lightblue':'aabac0','blue':'647b96',
 'pink':'d8bbb9','rose':'cba3a2','stone':'cccac3','slate':'7d817f','navy':'596170',
 'black':'515653','tray':'826454','gold':'c8b787','ochre':'b4a677','clay':'dfa779'}
for name,color in colors.items():
    m.palette[name]=m.material(name,color,.24 if name in ['steel','lip'] else .04)
rng=Random(931234931)
def section(name,parent=None):
    group=bpy.data.collections.new(name)
    (parent or scene.collection).children.link(group)
    m.group=group
    return group
store=section('다이소 · 홈가드닝 화분 진열')
store['preview_origin']=(0,0,0)
B,C,T=m.block,m.profile,m.rod

section('진열장과 단별 가격표 레일',store)
B('흰 받침장',0,.015,.025,3.02,.545,.177,'case',.009)
B('받침장 하단의 그림자',0,.02,0,2.95,.51,.027,'shadow')
for x in [-.75,.75]:
    B('받침장 앞면',x,-.261,.039,1.486,.018,.145,'white')
    B('앞면의 손잡이 홈',x+.41,-.276,.155,.13,.008,.014,'shadow')
B('닫힌 선반 뒷면',0,.294,.198,3.02,.025,1.792,'case')
for x in [-1.50,0,1.50]:
    B('선반을 받치는 각철',x,.251,.202,.024,.037,1.784,'steel')
for z in [.21,.58,.86,1.14,1.42,1.68,1.93]:
    B('흰 철판 선반',0,.004,z,3.04,.584,.026,'white')
    B('가격표를 끼우는 앞 레일',0,-.298,z-.006,3.04,.024,.046,'lip',.003)
    for x in [i*.365 for i in range(-4,5)]:
        B('인쇄 라벨 용지',x,-.312,z+.003,.129,.003,.027,'paper')
        B('가격 인쇄',x+.022,-.314,z+.011,.041,.0015,.007,'ink')
    for x in [-1.43,-.70,.70,1.43]:
        m.piece('선반 하부 삼각 지지대',[(x,.25,z-.081),(x,.25,z),(x,-.13,z)],
                [(0,1,2)],'steel')
B('연두색 홈가드닝 간판',0,.099,2.218,3.02,.048,.254,'header',.003)
for x in [-1.45,1.45]:
    B('간판 다리',x,.125,1.944,.032,.045,.286,'steel')

def pot(name,x,d,z,r,h,color,style='rolled',rib=0,facets=22):
    # Each cross-section returns along the inside wall to the visible well floor.
    if style=='wide':
        rings=[(.62,0),(.66,.055),(.78,.10),(.93,.80),(1,.86),(1,.96),(.95,1),(.86,.96),(.77,.26),(.61,.12)]
    elif style=='vase':
        rings=[(.54,0),(.60,.05),(.86,.21),(1,.47),(.98,.65),(.75,.78),(.46,.89),(.39,.97),(.40,1),(.28,.99),(.26,.88),(.51,.62)]
    elif style=='cylinder':
        rings=[(.80,0),(.86,.035),(.94,.11),(.99,.86),(1,.966),(.978,1),(.89,.991),(.86,.19),(.75,.12)]
    elif style=='cap':
        rings=[(.65,0),(.67,.09),(.78,.19),(.89,.71),(.91,.82),(1,.84),(1,.978),(.96,1),(.88,.98),(.80,.23),(.63,.14)]
    else:
        rings=[(.62,0),(.67,.052),(.70,.11),(.84,.64),(.94,.86),(1,.88),(1,.966),(.97,1),(.87,.956),(.78,.36),(.64,.125)]
    pts=[]
    for rr,zz in rings:
        for k in range(facets):
            theta=tau*k/facets
            radius=r*rr*(1+rib*cos(theta*max(3,facets//2))) if zz>.10 else r*rr
            pts.append((x+radius*cos(theta),d+radius*sin(theta),z+h*zz))
    n=facets
    faces=[tuple(reversed(range(n))), tuple(range((len(rings)-1)*n,len(rings)*n))]
    faces.extend((i*n+k,i*n+(k+1)%n,(i+1)*n+(k+1)%n,(i+1)*n+k) for i in range(len(rings)-1) for k in range(n))
    obj=m.piece(name,pts,faces,color)
    obj['stack_profile']=f'{style} {r:.4f} {h:.4f} {rib:.3f} {facets}'
    # This face-domain flag survives object edits in Blender and permits removing
    # enclosed wells from the web model when this pot actually has a matching pot above it.
    inside=obj.data.attributes.new('inside_well','BOOLEAN','FACE')
    high=max(range(len(rings)),key=lambda j:rings[j][1])
    for face in obj.data.polygons:
        inside.data[face.index].value=face.index==1 or face.index>=2+high*n
def label(x,d,z,r,h):
    # Printed tags observed on individual pots. A short folded paper face follows their slight taper.
    m.piece('모서리가 접힌 작은 상품표',[(x-r*.21,d-r*.994,z+h*.44),(x+r*.21,d-r*.994,z+h*.44),
       (x+r*.21,d-r*1.008,z+h*.72),(x-r*.21,d-r*1.008,z+h*.72)],[(0,1,2,3)],'paper')
def pattern(x,d,z,r,h,tone):
    # Sparse hand-painted foliage mottles, individually selectable in the source.
    for i in range(8):
        a=tau*i/8+.2
        for k in range(2):
            aa=a+k*.14
            def p(t,y,offset):
                rr=r*(.91+.077*y)+offset
                return x+rr*cos(t),d+rr*sin(t),z+h*y
            m.piece('도기의 손그림 잎무늬',[p(aa,.30+.05*k,.002),p(aa+.113,.38+.05*k,.003),
                    p(aa+.142,.49+.05*k,.003),p(aa+.032,.429+.05*k,.003)],[(0,1,2,3)],tone)
def stack(x,d,z,r,h,count,color,style,step=.032,facets=20,rib=0):
    for n in range(count):
        pot('포개 놓은 빈 화분',x,d,z+n*step,r,h,color,style,rib,facets)
def tray(name,x,d,z,w,depth,h,color):
    def corners(sx,sd):
        a,b=sx/2,sd/2; q=.014
        return [(-a+q,-b),(a-q,-b),(a,-b+q),(a,b-q),(a-q,b),(-a+q,b),(-a,b-q),(-a,-b+q)]
    bands=[(.91,.89,0),(.91,.89,.14),(1,1,.88),(1,1,1),(.96,.93,1),(.87,.82,.25)]
    v=[(x+xx,d+dd,z+h*hh) for sw,sd,hh in bands for xx,dd in corners(w*sw,depth*sd)]
    n=8
    faces=[tuple(reversed(range(n))),tuple(range((len(bands)-1)*n,len(bands)*n))]
    faces.extend((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i)for j in range(len(bands)-1) for i in range(n))
    obj=m.piece(name,v,faces,color)
    obj['stack_profile']=f'tray {w:.3f} {depth:.3f} {h:.3f}'
    inside=obj.data.attributes.new('inside_well','BOOLEAN','FACE')
    for face in obj.data.polygons:
        inside.data[face.index].value=face.index==1 or face.index>=2+3*n

section('하단 · 사각 받침과 큰 화분',store)
for i,(x,c) in enumerate([(-1.26,'white'),(-.86,'stone'),(.83,'cream'),(1.23,'white')]):
    stack(x,-.035,.237,.171,.194,3+(i%2),c,'cap',.034)
for x,c,w,depth,count in [(-.39,'black',.46,.39,8),(.125,'tray',.49,.37,9),(.50,'moss',.207,.35,6)]:
    for i in range(count):
        tray('포개진 장방형 화분받침',x,-.015,.237+i*.023,w,depth,.052,c)
    B('받침 묶음의 종이띠',x+.054,-depth/2-.018,.245+(count-1)*.023,.075,.006,.046,'paper')
section('올리브·노랑·테라코타와 깊은 원형 화분',store)
for i,c in enumerate(['umber','terracotta','brown','amber','yellow','moss','jade','rose','pink']):
    x=(i-4)*.322
    stack(x,.07,.606,.147,.155,2,c,'rolled',.038)
    if i%3!=2:pot('앞줄 낮은 화분',x-.015,-.169,.607,.085,.094,c,'wide',0,18)
section('다육 식기형 화분과 청자색 유약',store)
for i,c in enumerate(['moss','moss','stone','sage','sand','blue','navy','pink','terracotta','brown']):
    x=(i-4.5)*.288
    pot('다육식물용 낮은 유약 화분',x,.050,.886,.130,.151,c,'cylinder',.016 if i%3==0 else 0,20)
    if i in [2,3,4]:pattern(x,.050,.886,.130,.151,'slate')
    if i%3==1:label(x,.050,.886,.130,.151)
    pot('낮은 접시형 화분받침',x,-.163,.887,.093,.053,['sage','cream','stone'][i%3],'wide',0,18)
section('분홍·상아색 겹화분과 항아리형 백자',store)
for i,c in enumerate(['white','white','navy','pink','pink','rose','white','terracotta','umber','clay']):
    x=(i-4.5)*.289
    if i<2:
        pot('목이 가늘고 배가 부른 흰 화병',x,-.007,1.166,.126,.233,c,'vase',0,24)
    elif i in [3,4,5,7]:
        stack(x,-.011,1.166,.124,.144,3,c,'cylinder',.031)
    else:
        pot('원통형 무광 화분',x,-.03,1.166,.13,.194,c,'cylinder')
        label(x,-.03,1.166,.13,.194)
section('홈이 파인 돌빛 화분과 작은 병',store)
for i,c in enumerate(['white','white','white','cream','sand','stone','cream','sage','sage','lightblue']):
    x=(i-4.5)*.293
    if i<3:
        for k in [-1,1]:pot('작은 도자기 일륜 화병',x+k*.061,-.05,1.446,.054,.172+(i%2)*.024,c,'vase',0,20)
    else:
        pot('사선 홈 또는 잎무늬가 있는 도기 화분',x,-.013,1.446,.125,.18,c,'cylinder',.048 if i>6 else 0,28)
        if 3<=i<=6:pattern(x,-.013,1.446,.125,.18,'ochre')
section('작은 파스텔 화분과 윗단 플라스틱 화분',store)
for i,c in enumerate(['blue','lightblue','rose','pink','sage','white','sand','cream','sand','cream','stone','blue']):
    x=(i-5.5)*.246
    for j,d in enumerate([.120,-.098]):
        stack(x,d,1.706,.095,.117,2 if i%3 else 3,c,'cap',.020,18,.025 if j==1 else 0)
for i,c in enumerate(['white','blue','white','lightblue','rose','white','sand','clay','white','slate']):
    x=(i-4.5)*.286
    stack(x,.006,1.956,.130,.144,2 if i in [2,5,8] else 1,c,'rolled',.032)
    if i%3==2:label(x,.006,1.956,.130,.144)

flowers=section('다이소 · 화분 옆 조화 진열')
flowers['preview_origin']=(4.3,0,0)
for key,color in [('kraft','c5aa7d'),('bamboo','ad8e65'),('weave','bfa27a'),('weaveLight','d1b88e'),
                  ('leaf','527343'),('bud','739556'),('stem','708358'),('daisy','f4eee0'),('sun','efc44f'),
                  ('ochreBloom','deb13e'),('core','7d5e3b'),('maize','ddbb5c'),('blush','dbb0bc'),('violet','a496b4')]:
    m.palette[key]=m.material(key,color)
section('나무 단과 철망 행거',flowers)
B('목제 낮은 진열 단',0,-.037,.02,1.16,.65,.19,'bamboo',.006)
B('앞판의 세로 홈',0,-.365,.052,1.12,.012,.017,'weave')
B('뒤쪽 한 단 높은 나무 단',0,.165,.211,1.16,.23,.19,'weave',.004)
for x in [-.51,.51]:
    B('백색 철망 프레임 세로대',x,.233,.405,.018,.019,1.52,'case',.003)
for h in [.414,1.91]:
    B('철망 프레임 테두리',0,.233,h,1.037,.019,.02,'case',.003)
for i in range(-5,6):
    T('철망의 세로선',[(i*.093,.234,.424),(i*.093,.234,1.906)],.004,'case',5)
for i in range(18):
    T('철망의 가로선',[(-.503,.228,.437+i*.085),(.503,.228,.437+i*.085)],.004,'case',5)
section('바구니와 세로 종이 포장',flowers)
def basket(x,d,z,r,h):
    C('바구니 안쪽',x,d,z,[(.77*r,0),(.92*r,.10*h),(r,h),(.94*r,h),(.72*r,.11*h)],'bamboo',21)
    for j in range(9):
        pts=[]
        for k in range(33):
            a=k*tau/32
            radius=r*(.91+.088*j/8)+(.0027 if j%2 else 0)*cos(a*12)
            pts.append((x+radius*cos(a),d+radius*sin(a),z+h*(.09+j*.108)))
        T('가로로 엮은 바구니 띠',pts,.0048,'weaveLight' if j%3==0 else 'weave',4)
    for k in range(17):
        a=k*tau/17
        T('바구니의 세로 살',[(x+.91*r*cos(a),d+.91*r*sin(a),z+.03),
           (x+r*cos(a),d+r*sin(a),z+h)],.0033,'weave',4)
def sleeve(x,d,z,r,h):
    C('각지게 접은 크라프트 슬리브',x,d,z,[(r*.65,0),(.70*r,.06*h),(r,h),(r*.94,h),(.68*r,.11*h)],'kraft',8)
    T('종이 화병의 눌러 접은 선',[(x-r*.40,d-r*.63,z+.02),(x-r*.56,d-r*.89,z+h-.008)],.0028,'bamboo',4)
for x,d,z,r,h,kind in [(-.421,-.147,.212,.082,.26,'sleeve'),(-.152,-.126,.212,.113,.23,'basket'),
                         (.137,-.161,.212,.093,.28,'sleeve'),(.422,-.123,.212,.106,.235,'basket'),
                         (-.39,.137,.401,.09,.16,'pot'),(.08,.137,.401,.09,.17,'pot'),(.39,.137,.401,.094,.17,'pot')]:
    if kind=='sleeve':sleeve(x,d,z,r,h)
    elif kind=='basket':basket(x,d,z,r,h)
    else:C('흰 무광 꽂이',x,d,z,[(r*.72,0),(r*.74,.018),(r,h),(r*.89,h),(r*.69,.036)],'white',16)
def leaf(a,b,wide,tone):
    av,bv=Vector(a),Vector(b)
    direction=(bv-av).normalized()
    cross=direction.cross(Vector((0,0,1)))
    if cross.length<.02:cross=Vector((1,0,0))
    cross.normalize()
    middle=av.lerp(bv,.55)
    vs=[tuple(av),tuple(middle+cross*wide),tuple(middle+Vector((0,0,.008))),tuple(middle-cross*wide),tuple(bv)]
    m.piece('접힌 잎사귀',vs,[(0,1,2),(0,2,3),(1,4,2),(2,4,3)],tone)
def bloom(center,aim,r,n,tone,core):
    # Tilt flower faces independently; the heads should read from the public aisle as well as above.
    c=Vector(center); normal=Vector(aim).normalized(); ax=normal.cross(Vector((1,0,0))).normalized(); ay=normal.cross(ax)
    verts=[]; faces=[]
    for layer in range(2):
        for i in range(n):
            a=tau*(i/n+.5*layer/n)
            radial=ax*cos(a)+ay*sin(a);side=-ax*sin(a)+ay*cos(a)
            width=r*(.16 if n>12 else .22)*(1.03-layer*.19)
            length=r*(1-.25*layer)*rng.uniform(.91,1.07)
            start=len(verts)
            verts += [tuple(c+radial*length*t+side*width*w+normal*r*h) for t,w,h in [
                (.17,0,.02+layer*.05),(.53,-.75,.06),(.57,0,.14),(.53,.75,.06),(.86,-.61,.14),(.86,.61,.14),(1,0,.18)]]
            faces.extend(tuple(start+j for j in f) for f in [(0,1,2),(0,2,3),(1,4,2),(2,4,6),(2,6,5),(3,2,5)])
    m.piece('포개진 조화 꽃잎',verts,faces,tone)
    # A shallow domed disc, triangulated around the real tilted face axis.
    seg=14
    verts=[tuple(c+normal*r*h+(ax*cos(i*tau/seg)+ay*sin(i*tau/seg))*r*rr) for rr,h in [(.27,.03),(.32,.11),(.23,.24)] for i in range(seg)]
    verts += [tuple(c+normal*r*.27)]
    faces=[(j*seg+i,j*seg+(i+1)%seg,(j+1)*seg+(i+1)%seg,(j+1)*seg+i) for j in range(2) for i in range(seg)]
    faces.extend((2*seg+i,2*seg+(i+1)%seg,3*seg) for i in range(seg))
    m.piece('볼록한 꽃 중심',verts,faces,core)
def bunch(x,d,z,length,spread,count,r,tone,core):
    for i in range(count):
        a=tau*i/count+rng.uniform(-.2,.22)
        xx=x+spread*cos(a)*rng.uniform(.35,1.0);dd=d+spread*sin(a)*rng.uniform(.35,1)
        top=z+length*rng.uniform(.72,1.15)
        T('조화의 철심 줄기',[(x,d,z),(x*.33+xx*.67,d*.33+dd*.67,z+(top-z)*.57),(xx,dd,top)],.0039,'stem',5)
        for k in [0,1]:
            h=.30+.27*k;mid=(x+(xx-x)*h,d+(dd-d)*h,z+(top-z)*h)
            sign=1 if (i+k)%2 else -1
            leaf(mid,(mid[0]+.063*cos(a)*sign,mid[1]+.063*sin(a)*sign,mid[2]+.042),.018,'leaf' if k else 'bud')
        bloom((xx,dd,top),(rng.uniform(-.65,.65),rng.uniform(-.96,-.35),rng.uniform(.23,1.0)),r,
              14 if tone in ['sun','ochreBloom'] else 10,tone,core)
section('판매대 앞의 국화와 해바라기 다발',flowers)
for x,d,z,length,n,r,tone,core in [(-.421,-.147,.428,.36,5,.054,'daisy','maize'),
    (-.152,-.126,.409,.28,6,.048,'daisy','maize'),(.137,-.161,.451,.30,5,.064,'sun','core'),
    (.422,-.123,.427,.31,6,.063,'sun','core'),(-.39,.137,.536,.32,4,.046,'blush','maize'),
    (.08,.137,.541,.34,4,.044,'violet','maize'),(.39,.137,.54,.37,4,.047,'ochreBloom','core')]:
    bunch(x,d,z,length,.101,n+2,r*1.07,tone,core)
section('철망에 매단 조화 묶음과 초록 표찰',flowers)
for x,z,tone,core in [(-.33,1.05,'blush','maize'),(.03,1.06,'sun','core'),(.34,1.04,'daisy','maize'),
                        (-.32,1.38,'daisy','maize'),(.01,1.39,'ochreBloom','core'),(.35,1.40,'blush','maize')]:
    T('걸이용 구부린 철사',[(x,.234,z+.15),(x,.222,z+.165),(x,.158,z+.145),(x,.140,z+.072)],.005,'steel',6)
    bunch(x,.137,z,.185,.061,4,.050,tone,core)
    B('다발에 달린 작은 초록색 태그',x+.015,.113,z+.017,.082,.006,.039,'moss')
    B('태그의 인쇄선',x+.014,.109,z+.033,.054,.002,.005,'paper')

section('격자 상단에 걸친 초록 가지',flowers)
for n,(x,drop) in enumerate([(-.42,.25),(-.22,.15),(.38,.21)]):
    pts=[(x+.027*sin(t*7+n),.164-.022*t,1.923-drop*t) for t in [0,.27,.53,.77,1]]
    T('철망을 타고 늘어진 줄기',pts,.0036,'stem',5)
    for j in range(7):
        t=.10+j*.122
        a=(x+.027*sin(t*7+n),.164-.022*t,1.923-drop*t)
        sign=1 if j%2 else -1
        leaf(a,(a[0]+sign*.058,a[1]-.024,a[2]-.035),.019,'bud' if j%3==0 else 'leaf')

bpy.context.view_layer.update()
for root in [store,flowers]:
  offset=Matrix.Translation(Vector(root['preview_origin']))
  for obj in root.all_objects:
    center=sum((Vector(v) for v in obj.bound_box),Vector())/8
    obj.data.transform(Matrix.Translation(-center))
    obj.matrix_world=offset @ obj.matrix_world @ Matrix.Translation(center)
    obj.select_set(False)
store['evidence']='2026-04-06 지점 방문 사진의 연두색 사인, 빈 화분과 쌓은 받침. 개별 치수·수량·색 배치는 재구성.'
target=Vector((0,0,1.19))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        view=area.spaces.active
        view.shading.color_type='MATERIAL'
        view.region_3d.view_distance=5.1
        view.region_3d.view_location=target
        view.region_3d.view_rotation=(target-Vector((1.5,5.1,2.3))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(here/'garden.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
