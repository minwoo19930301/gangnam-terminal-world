"""Model the public FP216 pastry case, hanging mosaics and table service in Blender."""
from math import cos,sin,pi,tau,sqrt
from pathlib import Path
from random import Random
import runpy
import sys
import bpy
from mathutils import Vector, Matrix

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.name='파미에 동관 2층 · 케르반'
bpy.context.scene.unit_settings.system='METRIC'
for name,code,metal in [
    ('oak','996943',0),('grain','76513b',0),('edge','ba9763',.36),('base','333033',.15),
    ('bread','c79046',0),('toast','a16437',0),('crumb','e8c182',0),('sesame','51412e',0),
    ('pistachio','819347',0),('nut','ac9a58',0),('honey','d79b4c',0),('rose','bd7b72',0),
    ('lemon','e8d386',0),('milk','eee4cd',0),('red','96534f',0),('green','4a7564',0),
    ('paper','ede1c5',0),('steel','bcbec0',.59),('glass','d6e6e4',0),('blue','539b9b',.26),
    ('tomato','ab4637',0),('leaf','71864e',0),('meat','81513b',0),('glaze','e1dbbe',.17),
    ('tea','9c4634',0),('brass','ab8151',.53),('gold','e0b55c',.26),
    ('ruby','b64e57',.15),('turquoise','48a6aa',.15),('cobalt','456b93',.15),('cream','edcb8d',.15)]:
    m.palette[name]=m.material(name,code,metal)

m.palette['clear']=m.material('진열장 유리와 포장 뚜껑','eaf6f5')
glazing=m.palette['clear']
glazing.diffuse_color=(*glazing.diffuse_color[:3],.14)
shader=glazing.node_tree.nodes.get('Principled BSDF')
shader.inputs['Transmission Weight'].default_value=.78
shader.inputs['Alpha'].default_value=.14
shader.inputs['Roughness'].default_value=.13

def collection(name,offset=(0,0,0),parent=None):
    c=bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(c)
    c['preview_origin']=offset
    m.group=c
    return c

B,C,T=m.block,m.profile,m.rod
rng=Random(216)
case=collection('케르반 · 제과와 포장 진열')
body=collection('제과 진열대 · 목재와 상품',parent=case)
B('단부 걸레받이',0,0,.04,3.40,.90,.11,'base')
# Keep the turquoise glazing trim from the east-gallery photos, with the wood and brass case below.
B('나무 몸체',0,0,.125,3.45,1.00,.49,'oak',.018)
for i in range(5):
    B('하부 목재 판재 줄눈',0,-.50,.16+i*.081,3.38,.012,.008,'grain')
B('포장상품 진열 상판',-1.02,0,.60,1.40,1.03,.066,'oak',.012)
B('원형 식기 진열장 받침',.78,0,.60,1.91,1.03,.079,'oak',.013)
for x in [-.17,1.71]:
    for d in [-.48,.48]:B('모서리 황동 앵글',x,d,.67,.031,.03,1.0,'edge')
for z in [.74,1.077,1.47]:
    B('착탈식 선반',.77,0,z,1.84,.93,.024,'steel' if z<1.4 else 'glass',.003)
    B('선반 아래 시인성 띠',.77,-.463,z-.005,1.85,.026,.023,'edge')
for x in [-.15,1.69]: B('청록색 유리 프레임',x,0,1.66,.046,1.02,.04,'blue')
for d in [-.49,.49]: B('청록색 유리틀 긴 변',.77,d,1.66,1.91,.044,.04,'blue')
for x in [-.12,1.68]: B('진열장 탈착식 맨 위 손잡이',x,.48,1.49,.035,.042,.11,'brass')

def lip(name,x,d,z,r,t,color):
    seg=24
    v=[(x+rr*cos(tau*i/seg),d+rr*sin(tau*i/seg),z+zz)
       for rr,zz in [(r-t,0),(r,0),(r,t),(r-t,t)] for i in range(seg)]
    f=[(k*seg+i,k*seg+(i+1)%seg,((k+1)%4)*seg+(i+1)%seg,((k+1)%4)*seg+i)
       for k in range(4) for i in range(seg)]
    return m.piece(name,v,f,color)

# Nested gift boxes, gathered candy bags and individual takeaway cups.
for i,(d,col) in enumerate([(-.06,'red'),(-.03,'green'),(-.08,'red')]):
    z=.666+i*.111
    B('피슈마니예 선물 상자',-1.33,d,z,.63,.55,.10,col,.009)
    B('포장 금선',-1.33,d-.278,z+.012,.59,.005,.012,'gold')
    B('상자 금선 테두리',-1.33,d-.278,z+.079,.59,.005,.007,'gold')
    for dx in [-.265,.265]: B('선물 상자 모서리',-1.33+dx,d,z+.101,.017,.50,.003,'gold')
C('상자 타원 라벨',-1.33,-.09,1.00,[(.142,0),(.143,.002)],'paper',28,.77)
for j in range(3):
    C('상자 그림 속 솜사탕',-1.4+.058*j,-.09,1.009,[(.025,0),(.027,.005),(.016,.010)],'milk',12)
B('바클라바 포장 트레이',-1.30,.325,.671,.56,.205,.018,'edge',.005)
for i in range(4):
    B('트레이 속 작은 바클라바',-1.50+i*.12,.326,.69,.093,.147,.055,'honey',.009)

cup_centers=[]
for j in range(3):
    for i in range(3):
        x=-.86+i*.205+.018*(j%2);d=-.291+j*.266
        cup_centers.append((x,d))
        C('포장 컵 발',x,d,.664,[(.066,0),(.073,.012),(.077,.024)],'glass',18)
        C('포장 컵 앞 라벨',x,d,.698,[(.076,0),(.084,.049),(.085,.055)],'rose' if (i+j)%3 else 'green',20)
        lip('투명컵 가장자리',x,d,.823,.097,.005,'glass')
        for n in range(6):
            ang=tau*n/5 if n<5 else 0
            xx=x+(0 if n==5 else .040*cos(ang));dd=d+(0 if n==5 else .040*sin(ang))
            candy=['milk','rose','lemon','nut'][(n+i+2*j)%4]
            B('로쿰 조각',xx,dd,.756+(.058 if n==5 else .011*(n%2)),.046,.043,.050,candy,.009)
            for k in range(3):
                C('분당 알갱이',xx+rng.uniform(-.014,.014),dd+rng.uniform(-.011,.011),.807+(.058 if n==5 else .011*(n%2)),[(.003,0),(.005,.002)],'milk',6)
# Small tabletop signs in clamp stands, as photographed at the takeaway display.
for x,side in [(-1.49,.37),(-.98,.37),(-.45,.40)]:
    C('카드 받침',x,side,.67,[(.058,0),(.058,.009),(.012,.014),(.008,.218)],'brass',14)
    B('상품 소개 카드',x,side,.88,.303,.014,.188,'paper',.006)
    B('소개 카드 헤더',x,side-.009,1.017,.252,.004,.018,'green')

def plate(x,d,z,r):
    C('진열 접시',x,d,z,[(r*.62,0),(r*.91,.012),(r,.028),(r*.985,.039),(r*.87,.036),(r*.65,.019)],'glaze',30,.85)

def lavas(x,d,z,w):
    h=w*.74
    C('속이 빈 풍선 라바시',x,d,z,[(w*.65,0),(w*.9,h*.13),(w,h*.35),(w*.90,h*.61),(w*.62,h*.85),(w*.23,h*.99),(.001,h)],'crumb',30,.8)
    for k in range(31):
        a=rng.random()*tau;rr=w*rng.uniform(.03,.83)
        fraction=rr/w
        dome=[(0,1),(.23,.99),(.62,.85),(.90,.61),(1,.35)]
        for (r0,h0),(r1,h1) in zip(dome,dome[1:]):
            if fraction<=r1:
                hh=h*(h0+(h1-h0)*(fraction-r0)/(r1-r0))
                break
        C('구운 점과 검은깨',x+rr*cos(a),d+.8*rr*sin(a),z+hh,[(rng.uniform(.003,.010),0),(.003,.003)],'sesame' if k%4 else 'toast',5,.64)

def baklava(x,d,z,n=3):
    # Diamond cut with distinct flaky layers and a pistachio-filled middle.
    for j in range(n):
        xx=x+(j-(n-1)/2)*.109
        for zz,h,col in [(0,.015,'bread'),(.015,.010,'crumb'),(.025,.016,'pistachio'),(.041,.015,'honey'),(.056,.008,'crumb')]:
            coords=[(xx-.053,d),(xx,d-.063),(xx+.053,d),(xx,d+.063)]
            v=[(a,b,z+height) for height in [zz,zz+h] for a,b in coords]
            m.piece('마름모 바클라바 층',v,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],col)
        for k in range(5):
            C('다진 피스타치오',xx+rng.uniform(-.018,.018),d+rng.uniform(-.02,.02),z+.064,[(.006,0),(.008,.006),(.002,.01)],'nut' if k%3 else 'pistachio',6)

def pide(x,d,z):
    # Boat-shaped rim surrounds cheese, tomato and parsley.
    points=[(-.166,0),(-.108,-.064),(-.015,-.087),(.102,-.067),(.173,0),(.105,.058),(.005,.081),(-.102,.061)]
    verts=[(x+xx*r,d+dd*r,z+h) for r,h in [(1,0),(1,.035),(.79,.042),(.76,.027)] for xx,dd in points]
    faces=[tuple(reversed(range(8))),tuple(range(24,32))]+[(8*k+i,8*k+(i+1)%8,8*(k+1)+(i+1)%8,8*(k+1)+i) for k in range(3) for i in range(8)]
    m.piece('치즈 피데의 접힌 가장자리',verts,faces,'bread')
    for j in range(5):
        C('치즈와 토마토 토핑',x-.094+j*.046,d+(.011 if j%2 else -.013),z+.041,[(.019,0),(.022,.009),(.015,.015)],['tomato','milk','leaf'][j%3],8,.8)

for level,placings in [(1.10,[(.13,'lavas'),(.75,'baklava'),(1.36,'pide')]),(.766,[(.11,'baklava'),(.76,'pide'),(1.37,'lavas')])]:
    for x,kind in placings:
        plate(x,-.093,level,.254)
        if kind=='lavas': lavas(x,-.09,level+.035,.208)
        elif kind=='baklava':
            for dd in [-.14,-.025]:baklava(x,dd,level+.037)
        else:pide(x,-.09,level+.04)
        B('요리 카드',x,-.40,level+.023,.112,.014,.061,'paper',.005)
covers=collection('제과 진열대 · 투명 덮개',parent=case)
for d in [-.476,.469]:
    B('진열장 투명 판',.77,d,.700,1.82,.008,.958,'clear')
for x in [-.135,1.675]:
    B('옆면 투시창',x,0,.70,.008,.93,.958,'clear')
for x,d in cup_centers:
    C('돔 뚜껑과 플라스틱 컵',x,d,.680,[(.068,0),(.094,.142),(.094,.160),(.084,.190),(.060,.216),(.027,.232),(.002,.237)],'clear',14)

lamp=collection('케르반 · 모자이크 등',(2.44,0,0))
C('하단 장식 추',0,0,0,[(.006,0),(.025,.034),(.027,.06),(.016,.08),(.047,.11)],'brass',16)
C('납선 바탕 유리',0,0,.103,[(.037,0),(.122,.055),(.174,.13),(.184,.19),(.164,.25),(.107,.31),(.042,.35)],'cream',24)
# Each tessera follows a curved section of the shade and retains its own editable mesh.
bands=[(.158,.122),(.228,.173),(.292,.185),(.354,.163),(.411,.109)]
for j,((z0,r0),(z1,r1)) in enumerate(zip(bands,bands[1:])):
    mid=(z0+z1)/2
    for i in range(18):
        a=tau*(i+(j%2)*.5)/18
        def surface(angle,z,r):
            return (r*cos(angle),r*sin(angle),z)
        w=pi/18*.88;rc=(r0+r1)/2+.004
        points=[surface(a,z0+.002,r0+.003),surface(a+w,mid,rc),surface(a,z1-.002,r1+.003),surface(a-w,mid,rc)]
        m.piece('색유리 모자이크 마름모',points,[(0,1,2),(0,2,3)],
                ['turquoise','ruby','gold','cobalt','milk','green'][(i+j*2)%6])
C('펜던트 황동 캡',0,0,.446,[(.045,0),(.056,.009),(.057,.025),(.041,.035),(.036,.074),(.022,.085)],'brass',20)
for j in range(3):
    a=j*tau/3
    T('걸쇠와 사슬',[(.045*cos(a),.045*sin(a),.51),(.065*cos(a),.065*sin(a),.536),(.015*cos(a),.015*sin(a),.67)],.005,'brass')
C('천장 연결봉',0,0,.659,[(.018,0),(.023,.018),(.009,.029),(.009,.252),(.061,.262),(.066,.282)],'brass',18)

meal=collection('케르반 · 라바시와 차 한 상',(3.34,0,0))
plate(-.119,.016,.001,.182)
lavas(-.119,.016,.039,.153)
C('차 받침',.158,.091,.001,[(.039,0),(.075,.008),(.076,.015),(.062,.017),(.04,.009)],'glaze',24)
C('튤립 잔 바닥',.158,.091,.013,[(.024,0),(.035,.010),(.034,.015)],'glass',22)
T('유리잔 표면 빛',[(.181,.079,.038),(.177,.079,.062),(.176,.079,.075),(.188,.079,.103)],.002,'glass',5)
C('차가 담긴 홍차 잔',.158,.091,.025,[(.032,0),(.029,.017),(.022,.037),(.023,.051),(.033,.077)],'tea',22)
C('잔 가장자리',.158,.091,.110,[(.035,0),(.038,.0025),(.035,.005)],'glass',22)
plate(.094,-.135,.004,.111)
baklava(.094,-.135,.043,2)
C('소스 종지',-.03,.222,.002,[(.041,0),(.057,.014),(.062,.050),(.059,.055),(.051,.047)],'glaze',18)
C('요거트 딥과 허브',-.03,.222,.046,[(.049,0),(.048,.007),(.018,.014)],'milk',16)
for i in range(6):
    a=i*2.42
    B('허브 잎',-.03+.03*cos(a),.222+.024*sin(a),.056,.008,.004,.002,'leaf')
B('접은 냅킨',.282,-.007,.003,.088,.178,.011,'paper',.003)
T('티스푼 손잡이',[(.270,-.056,.017),(.269,.012,.019),(.272,.051,.020)],.005,'steel',6)
C('타원 티스푼',.272,.072,.019,[(.016,0),(.019,.005),(.016,.007)],'steel',14,1.40)

# The public kitchen window photographed behind the pastry case. The dome and
# counter are shallow to fit the existing back wall and service-window footprint.
window=collection('케르반 · 청록색 주방창',(6.36,0,0))
B('창 아래 나무판',0,-.16,.025,4.15,.20,.89,'grain')
for j in range(8):
    for i in range(7):
        left=-2.07+(i-.4*(j%2))*.72
        a,b=max(-2.07,left),min(2.07,left+.70)
        if b>a:B('엇갈린 나무 판재',(a+b)/2,-.268,.046+j*.105,b-a,.012,.099,['oak','grain','toast'][(i+2*j)%3])
B('조리대 뒷벽',0,.19,.92,4.15,.08,1.21,'base')
B('주방 바닥 작업대',0,-.005,.904,4.17,.44,.068,'steel')
for x in [-2.074,-.926,.125,2.074]:
    B('청록색 창 중간틀',x,-.25,.914,.045,.065,1.21,'blue',.005)
for z in [.912,2.116]:
    B('청록색 수평틀',0,-.25,z,4.20,.067,.047,'blue',.004)
for x,w in [(-1.40,.75),(-.61,.67)]:
    B('주방 금속 선반',x,.068,1.494,w,.23,.021,'steel')
    for j in range(3):
        cx=x+(j-1)*w*.26
        C('조리기물',cx,.062,1.522,[(.076,0),(.069,.118),(.047,.128)],'steel',15)
        lip('스텐 통 입술',cx,.062,1.640,.068,.006,'steel')
# The curved oven is visible above the frosted band of the window.
cx,dd=.95,-.015
C('피데 화덕 밑판',cx,dd,.974,[(.76,0),(.75,.21)],'paper',32,.26)
C('화덕 줄눈',cx,dd,1.165,[(.74,0),(.72,.11),(.62,.28),(.43,.44),(.16,.54)],'edge',32,.26)
height=.545
for row in range(5):
    a,b=row/5,(row+1)/5
    r0=.74*sqrt(max(0,1-a*a));r1=.74*sqrt(max(.015,1-b*b))
    segments=16
    for j in range(segments):
        t0=tau*(j+.45*(row%2)+.015)/segments;t1=t0+tau*.95/segments;v=[]
        for r,h in [(r0+.004,1.167+a*height),(r1+.004,1.167+b*height-.006)]:
            for t in [t0,(t0+t1)/2,t1]:v.append((cx+r*cos(t),dd+.26*r*sin(t),h))
        m.piece('오븐의 굽은 내화벽돌',v,[(0,1,4,3),(1,2,5,4)],'milk' if (row+j)%4 else 'paper')
C('동판 배기 덕트',cx,.063,1.687,[(.15,0),(.15,.12),(.193,.15),(.193,.18),(.145,.21),(.145,.39)],'brass',24,.60)
# Opaque frosted lower strips keep the upper portion visibly open.
for a,b in [(-2.052,-.951),(-.903,.102),(.149,2.05)]:
    B('유리 하부 반투명 띠',(a+b)/2,-.248,.963,b-a,.009,.145,'glass')
B('상단 검정 안내 패널',0,-.158,2.154,4.15,.18,.454,'base')
# Independent linework recalls the skyline and three white dish drawings in the photograph.
for x,r in [(-1.48,.184),(-.84,.185),(-.21,.23)]:
    pts=[(x+r*cos(tau*i/28),-.255,2.44+.074*sin(tau*i/28)) for i in range(29)]
    T('백색 접시 도안',pts,.006,'milk',5)
    for i in range(3):
        dx=(i-1)*.055
        T('음식 선 그림',[(x+dx-.017,-.255,2.422),(x+dx-.024,-.255,2.447),(x+dx,-.255,2.473),(x+dx+.019,-.255,2.445)],.004,'milk',5)
for i in range(13):
    x=.29+i*.133;h=.05+.04*((i*5)%4)
    B('도시 윤곽',x,-.255,2.250,.114,.009,h,'paper')
    if i%4==0:
        m.piece('돔 지붕',[(x-.06,-.262,2.25+h),(x-.04,-.262,2.275+h),(x,-.262,2.307+h),
                    (x+.04,-.262,2.275+h),(x+.06,-.262,2.25+h)],[(0,1,2,3,4)],'paper')
    if i%5==0:B('첨탑 표식',x+.057,-.255,2.25,.013,.011,h+.102,'milk')

bpy.context.view_layer.update()
for root in [case,lamp,meal,window]:
    offset=Matrix.Translation(Vector(root['preview_origin']))
    for item in root.all_objects:
        center=sum((Vector(v) for v in item.bound_box),Vector())/8
        item.data.transform(Matrix.Translation(-center))
        item.matrix_world=offset @ item.matrix_world @ Matrix.Translation(center)
        item.select_set(False)
    root['source']='2024년 1월 방문자 사진과 파미에 2층 동관 보행 사진. 음식 수량과 치수는 공개 자료를 참고한 게임 배치.'
target=Vector((2.9,0,1.0))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        a=area.spaces.active
        a.shading.color_type='MATERIAL'
        a.region_3d.view_distance=11
        a.region_3d.view_location=target
        a.region_3d.view_rotation=(target-Vector((3.6,7.3,3.5))).to_track_quat('-Z','Y')
bpy.context.view_layer.update()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'fp216.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
