"""Model the public display at Damccot FP204 from the operator's shop and visitor photos."""
from math import sin,cos,tau,pi
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
bpy.context.scene.name='담꽃 파미에점 · 2층 204호'
bpy.context.scene.unit_settings.system='METRIC'
for key,color,metal in [
    ('wood','9e7757',0),('edge','775a45',0),('side','503f36',0),('bronze','8c7254',.50),
    ('black','373634',.12),('steel','a4a4a1',.50),('aluminum','c9c9c0',.58),('ceramic','e4e1d4',.04),
    ('milk','f5f1dd',0),('celadon','9ba99b',.10),('cream','cdbd97',.08),('brass','ab8b55',.55),
    ('rose','cd9a8d',0),('darkrose','a27b70',0),('sage','999f84',0),('grass','78806b',0),
    ('paper','eae3cf',0),('band','a98b57',.20),('back','eceae2',0),('glow','efd5aa',0),
    ('tea','a87345',0),('ice','f4f0e4',0),('iceShade','ddd8c8',0),('bean','632e35',0),
    ('beanLit','75444b',0),('jujube','8e4234',0),('jujubeFlesh','c09352',0),('chestnut','d8b64f',0),
    ('rice','c79356',0),('crust','9f7749',0),('walnut','82623f',0),('mugwort','8b936b',0),
    ('ink','484138',0),('box','cbb89b',0),('white','f2f1e8',0),('grey','666965',0),('seat','49443d',0)]:
    m.palette[key]=m.material(key,color,metal)

B,C,T=m.block,m.profile,m.rod
rng=Random(204)

def group(name,parent=None):
    c=bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(c)
    m.group=c
    return c

def root(name,offset):
    c=group(name)
    c['preview_origin']=offset
    return c

def ring(name,x,d,z,radius,thick,color,seg=18):
    vert=[(x+r*cos(tau*i/seg),d+r*sin(tau*i/seg),z+h) for r,h in
          [(radius-thick,0),(radius,0),(radius,thick),(radius-thick,thick)] for i in range(seg)]
    faces=[(k*seg+i,k*seg+(i+1)%seg,(k+1)%4*seg+(i+1)%seg,(k+1)%4*seg+i) for k in range(4) for i in range(seg)]
    return m.piece(name,vert,faces,color)

def saucer(x,d,z,r,color='ceramic'):
    C('잔 받침',x,d,z,[(.58*r,0),(.79*r,.006),(r,.012),(r,.018),(.90*r,.018),(.62*r,.010)],color,16)

def mug(x,d,z,r=.075,color='ceramic',handle=True):
    C('오목한 찻잔',x,d,z,[(r*.58,0),(r*.66,.012),(r*.89,r*.65),(r,r*1.03),(r*.94,r*1.05),(r*.83,r*.90),(r*.39,r*.40)],color,16)
    if handle:
        T('찻잔 손잡이',[(x+r*.85,d,z+r*.87),(x+r*1.23,d,z+r*.90),(x+r*1.40,d,z+r*.61),
                           (x+r*1.27,d,z+r*.40),(x+r*.84,d,z+r*.37)],.007,color,6)

def spout(name,x,d,z,r,h,color):
    T(name,[(x+.61*r,d,z+.2*h),(x+.93*r,d,z+.35*h),(x+1.28*r,d,z+.72*h),(x+1.49*r,d,z+.90*h)],r*.12,color,7)
    T('주전자 손잡이',[(x-.71*r,d,z+h*.70),(x-1.27*r,d,z+h*.74),(x-1.45*r,d,z+h*.48),(x-1.42*r,d,z+h*.24),(x-.75*r,d,z+h*.20)],r*.105,color,7)

def teapot(x,d,z,r,color):
    h=1.35*r
    C('다관 몸체',x,d,z,[(r*.44,0),(r*.72,h*.07),(r,h*.35),(r*.97,h*.59),(r*.70,h*.77),(r*.50,h*.83)],color,17)
    C('다관 뚜껑과 손잡이',x,d,z+.82*h,[(r*.48,0),(r*.56,.012),(r*.40,.022),(r*.15,.026),(r*.10,.042)],color,16)
    spout('다관 부리',x,d,z,r,h,color)

def moka(x,d,z,r,h):
    C('팔각 모카포트',x,d,z,[(r*.90,0),(r,.012),(r*.65,h*.41),(r*.64,h*.45),(r*.95,h*.80),(r*1.02,h*.85),(r*.26,h*.98)],'aluminum',8)
    C('뚜껑 손잡이',x,d,z+h*.96,[(r*.24,0),(r*.27,.023)],'black',8)
    T('모카포트 손잡이',[(x-.82*r,d,z+h*.78),(x-1.40*r,d,z+h*.82),(x-1.45*r,d,z+h*.56),(x-1.26*r,d,z+h*.48)],.010,'black',6)

def grinder(x,d,z,size=.11):
    B('손분쇄기 나무통',x,d,z,size,size,.11,'wood',.004)
    B('서랍 면',x,d-size*.51,z+.014,size*.75,.012,.045,'edge')
    C('원두 투입구',x,d,z+.11,[(.04,0),(.051,.019),(.038,.035),(.017,.04)],'steel',12)
    C('분쇄축',x,d,z+.149,[(.007,0),(.007,.044)],'steel',10)
    T('크랭크 손잡이',[(x,d,z+.188),(x+.043,d,z+.188),(x+.064,d-.005,z+.206)],.004,'black',5)
    C('손잡이 노브',x+.064,d-.005,z+.200,[(.010,0),(.014,.014),(.010,.029)],'wood',9)

def wrapped(x,d,z,col,crease,spin=0):
    # Tied bojagi form a soft folded square with overlapping corners and a knotted top.
    rings=[(.158,.12,.012),(.183,.137,.085),(.174,.132,.144),(.122,.108,.181),(.046,.049,.206)]
    v=[];n=16
    for j,(rx,rd,h) in enumerate(rings):
        for i in range(n):
            a=tau*i/n+spin; c=cos(a);s=sin(a)
            xx=rx*(1 if c>=0 else -1)*abs(c)**.46
            dd=rd*(1 if s>=0 else -1)*abs(s)**.46
            v.append((x+xx,d+dd,z+h+(.007*cos(3*a+.5*j) if j else 0)))
    f=[tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))]
    f.extend((k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i) for k in range(len(rings)-1) for i in range(n))
    m.piece('양갱 선물 보자기의 몸체',v,f,col)
    for j,a in enumerate([spin+.5,spin+2.2,spin+3.8,spin+5.4]):
        aa=a+.21;v=[(x+.16*cos(a),d+.113*sin(a),z+.105),(x+.166*cos(aa),d+.121*sin(aa),z+.142),
                     (x+.094*cos(aa+.22),d+.092*sin(aa+.22),z+.186),(x+.021*cos(a),d+.019*sin(a),z+.216)]
        m.piece('접힌 천의 모서리',v,[(0,1,2),(0,2,3),(2,1,0),(3,2,0)],crease if j%2 else col)
    for sign in [-1,1]:
        v=[(x,d,z+.205),(x+sign*.087,d+.045,z+.229),(x+sign*.128,d+.01,z+.217),
           (x+sign*.105,d-.043,z+.209),(x+sign*.048,d-.015,z+.226)]
        m.piece('매듭의 두 날개',v,[(0,1,4),(1,2,4),(2,3,4),(4,1,0),(4,2,1),(4,3,2)],col)
    C('중앙 매듭',x,d,z+.200,[(.034,0),(.039,.016),(.027,.029)],crease,12,.68)

cabinet=root('담꽃 · 다기와 보자기 진열장',(0,0,0))
group('오단 진열장과 간접조명',cabinet)
B('은은한 후면',0,.179,.10,3.06,.035,2.72,'back')
for x in [-1.55,-.936,-.312,.312,.936,1.55]:
    B('가구의 수직 틀',x,0,.08,.033,.40,2.77,'edge')
for z in [.32,.84,1.35,1.87,2.39,2.82]:
    B('목재 선반',0,-.018,z,3.11,.418,.032,'wood')
    B('선반 벼림',0,-.222,z-.016,3.12,.019,.039,'edge')
    B('선반 하부 간접조명',0,.01,z-.012,3.03,.011,.014,'glow')
# Cut the fine metal diamond screen to the backing rather than overlapping adjacent shelves.
for sign in [-1,1]:
    for i in range(-68,69):
        offset=i*.055
        low=max(.11,( -1.51-offset)/(.48*sign) if sign>0 else (1.51-offset)/(.48*sign))
        high=min(2.80,(1.51-offset)/(.48*sign) if sign>0 else (-1.51-offset)/(.48*sign))
        if high-low>.026:
            T('후면 마름모 스크린',[(offset+low*.48*sign,.149,low),(offset+high*.48*sign,.149,high)],.0011,'steel',4)
group('전시용 도자기와 금속 조리도구',cabinet)
for j,cx in enumerate([-1.248,-.624,0,.624,1.248]):
    for i in range(3):
        x=cx+(i-1)*.17
        mug(x,.0,2.424,.064,'black',False);saucer(x,0,2.423,.076,'black')
    for i in range(2):
        x=cx+(i-.5)*.218
        saucer(x,-.01,1.903,.087)
        mug(x,-.015,1.925,.068,'ceramic' if j!=2 else 'celadon')
for j in range(3):
    x=-1.25+(j-1)*.145
    C('드립 포트',x,-.015,1.386,[(.055,0),(.062,.019),(.047,.121),(.038,.134)],'steel',14)
    spout('가는 드립 포트 부리',x,-.015,1.392,.049,.11,'steel')
for x in [-.73,-.5]:mug(x,-.024,1.385,.081,'brass',False)
for x in [-.15,0,.15]:grinder(x,.0,1.386)
for x,r,h in [(.47,.079,.18),(.65,.060,.145),(.8,.05,.118)]:moka(x,-.011,1.386,r,h)
for x in [1.15,1.36]:teapot(x,.005,1.386,.068,'ceramic')
for j,(x,col) in enumerate([(-1.26,'black'),(-.62,'brown'),(0,'celadon'),(.62,'ceramic'),(1.24,'rose')]):
    if j in (0,1,3):
        B('찻상 상판',x,-.014,.922,.38,.215,.021,'side',.004)
        for xx in [x-.154,x+.154]:
            for dd in [-.09,.067]:B('찻상 다리',xx,dd,.875,.021,.022,.052,'edge')
        teapot(x,-.008,.948,.087,'ceramic' if j==3 else 'black')
        if j==3:mug(x+.145,-.03,.946,.035,'ceramic')
    elif j==2:
        for dx in [-.082,.08]:
            C('외송이 화병',x+dx,-.018,.874,[(.023,0),(.028,.065),(.015,.134),(.012,.171)],'celadon',11)
            T('가는 나뭇가지',[(x+dx,-.018,1.04),(x+dx+.017,-.019,1.14),(x+dx-.004,-.019,1.183)],.003,'grass',5)
    else:
        teapot(x,-.021,.875,.095,'rose')
group('보자기 선물과 전통 찻상',cabinet)
wrapped(.96,-.025,.356,'rose','darkrose',.18)
wrapped(1.35,-.015,.356,'sage','grass',-.23)
for j,x in enumerate([-1.26,-.68,-.07,.58]):
    if j<2:
        for k in range(2):
            B('포장 양갱 함',x,.006,.356+k*.056,.43,.225,.054,'paper' if j==0 else 'sage',.004)
            B('선물 함 띠',x-.094,.006,.412+k*.056,.048,.23,.003,'rose' if j==0 else 'paper')
    else:
        B('다과 나무 쟁반',x,-.01,.36,.42,.24,.023,'edge',.007)
        teapot(x-.045,-.012,.389,.072,'celadon' if j==2 else 'ceramic')
        mug(x+.092,-.067,.390,.040,'ceramic')

room=root('담꽃 · 백색 주문대와 검은 의자',(6.1,0,0))
group('주문대와 선물 차림',room)
# Shop coordinates are centred on the open front. x points toward the display wall.
B('계산대 받침',-2.21,1.73,.035,1.50,2.13,.095,'black')
B('짙은 하부장',-2.21,1.73,.125,1.55,2.17,.77,'side',.011)
B('밝은 상판',-2.21,1.73,.896,1.66,2.27,.064,'white',.005)
for dx in [-.62,-.22,.22,.62]:
    B('하부장 문짝',-2.21+dx,.639,.16,.35,.018,.68,'side',.006)
    B('장 손잡이',-2.21+dx+.115,.62,.53,.012,.018,.152,'aluminum',.002)
for d in [1.06,1.73,2.40]:
    B('측면 문',-1.426,d,.16,.02,.63,.68,'edge',.005)
    T('측면 손잡이',[(-1.394,d-.17,.62),(-1.377,d-.17,.60),(-1.377,d-.17,.505),(-1.394,d-.17,.493)],.004,'steel',6)
B('주문기 바닥',-2.07,1.21,.966,.28,.24,.025,'black',.003)
B('주문기 지지대',-2.07,1.198,.987,.08,.065,.12,'steel')
B('주문 화면',-2.07,1.218,1.104,.41,.054,.255,'black',.007)
B('고객측 안내 화면',-2.07,1.186,1.139,.355,.004,.187,'paper')
for j in range(3):
    B('주문 화면 메뉴',-2.15,1.182,1.17+j*.042,.12,.004,.013,'sage')
    B('패널 상품',-1.964,1.182,1.178+j*.038,.043,.004,.021,'rose')
for j,(x,d) in enumerate([(-2.64,.84),(-2.55,1.20),(-1.97,.83)]):
    for k in range(2 if j<2 else 1):
        B('보자기 곁 포장 상자',x,d,.966+k*.076,.31,.19,.072,'paper' if k%2 else 'box',.005)
        B('띠지',x-.056,d,1.039+k*.076,.046,.194,.003,'rose' if j%2 else 'sage')
for j in range(3):
    x=-2.64+j*.23;d=1.75+j*.052
    B('차를 담는 종이봉투',x,d,.966,.18,.092,.265,'white',.006)
    B('차 포장 띠지',x,d-.048,1.004,.16,.005,.072,['sage','rose','paper'][j])
    for dd in [-.023,.028]:
        T('꼬인 종이 손잡이',[(x-.045,d+dd,1.218),(x-.045,d+dd,1.264),(x-.022,d+dd,1.292),
              (x+.018,d+dd,1.292),(x+.046,d+dd,1.264),(x+.046,d+dd,1.218)],.004,'edge',6)
for i in range(3):
    x=-2.59+i*.31;d=2.38
    C('시향 차 통',x,d,.968,[(.069,0),(.073,.015),(.071,.143),(.065,.155)],['ceramic','celadon','cream'][i],16)
    C('차 통 뚜껑',x,d,1.121,[(.073,0),(.077,.012),(.072,.022)],'steel',16)
    B('차 이름 띠',x,d-.071,1.007,.071,.004,.044,'paper')
B('메뉴 입간판 발',-1.68,2.55,.966,.34,.182,.024,'black')
B('메뉴 안내 카드',-1.68,2.56,.993,.295,.02,.365,'paper',.004)
for j in range(4):B('메뉴 표기',-1.68,2.548,1.061+j*.057,.19 if j%2 else .24,.004,.014,'edge')

group('곡목 의자와 나무 원탁',room)
def bentchair(x,d,direction):
    # Curved back and joined legs match the black bentwood chairs in the store photos.
    C('좌방석',x,d,.427,[(.177,0),(.201,.021),(.204,.039),(.188,.052)],'black',20)
    for sx in [-1,1]:
        for sd in [-1,1]:
            T('가늘어지는 의자 다리',[(x+sx*.162,d+sd*.16,.014),(x+sx*.147,d+sd*.134,.25),
              (x+sx*.123,d+sd*.119,.44)],.016,'black',7)
    hoop=[(x-.168,d+.119*direction,.449),(x-.17,d+.151*direction,.63),
          (x-.153,d+.183*direction,.755),(x-.112,d+.202*direction,.803),
          (x-.045,d+.215*direction,.829),(x+.045,d+.215*direction,.829),
          (x+.112,d+.202*direction,.803),(x+.153,d+.183*direction,.755),
          (x+.17,d+.151*direction,.63),(x+.168,d+.119*direction,.449)]
    T('곡목 등받이 바깥 고리',hoop,.017,'black',8)
    T('등받이 안쪽 곡선',[(x-.125,d+.119*direction,.487),(x-.095,d+.175*direction,.662),
               (x,d+.19*direction,.70),(x+.095,d+.175*direction,.662),(x+.125,d+.119*direction,.487)],.014,'black',7)
    ring('의자 하부 가로대',x,d,.23,.151,.013,'black',16)
def seating(x,d):
    C('원형 식탁의 받침',x,d,.021,[(.231,0),(.235,.016),(.173,.040),(.069,.073),(.048,.093),(.045,.678),(.168,.695)],'black',20)
    C('둥근 나무 상판',x,d,.711,[(.407,0),(.421,.014),(.421,.041),(.408,.047)],'wood',28)
    for dd in [-.612,.612]:bentchair(x,d+dd,1 if dd>0 else -1)
seating(-.035,1.21)
seating(1.48,2.17)
group('창가 프레임과 조명',room)
# Café windows look through the simulation's own 2F/1F gallery, as the branch
# photo shows. Frames, a rounded counter edge and a low black rail define the sill.
for x in [-1.633,-.378,.875,2.126,3.32]:
    B('창가 기둥',x,3.18,.10,.066,.155,2.75,'black')
    B('창틀 안쪽 홈',x-.044,3.166,1.10,.024,.118,1.65,'grey')
B('창 아래 허리판',.84,3.21,.04,4.97,.076,.99,'side')
B('긴 창가 목재 상판',.84,3.01,1.008,4.96,.47,.059,'wood',.006)
for level in [1.104,1.257,2.807]:
    B('창가 난간 수평대',.84,3.143,level,4.96,.036,.037,'black')
for i in range(30):
    x=-1.62+i*.17
    for direction in [-1,1]:
        T('난간의 교차 철망',[(x,3.143,1.112),(x+.070*direction,3.143,1.249)],.0027,'black',4)
for x in [-1.64,1.52]:
    for d in [.65,2.32]:
        C('천장 매입등 틀',x,d,3.17,[(.082,0),(.082,.035)],'black',16)
        C('매입등 원판',x,d,3.167,[(.061,0),(.062,.003)],'glow',16)

meal=root('담꽃 · 밤대추팥빙수 한 상',(10.2,0,0))
group('밤과 대추를 얹은 팥빙수',meal)
saucer(-.068,.018,.004,.143)
C('빙수 그릇',-.068,.018,.024,[(.065,0),(.072,.016),(.082,.025),(.111,.044),(.136,.074),
  (.141,.084),(.139,.090),(.128,.092)],'ceramic',26)
ring('유기색 그릇 입술',-.068,.018,.111,.138,.0035,'brass',26)
# Uneven rings of shaved milk ice are capped by a boisterous pile of red beans.
v=[];faces=[];n=23
for j,(r,h) in enumerate([(.116,.079),(.143,.094),(.152,.134),(.139,.159),(.111,.191),(.075,.21)]):
    for i in range(n):
        a=tau*i/n;rr=r*(1+.023*cos(5*a+j)+.014*sin(8*a))
        v.append((-.068+rr*cos(a),.018+rr*sin(a),h+.003*sin(i*2.4+j)))
faces=[tuple(reversed(range(n))),tuple(range(5*n,6*n))]
faces.extend((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(5) for i in range(n))
m.piece('불규칙한 우유 눈꽃 얼음',v,faces,'ice')
# Short flakes project from the irregular ice edge. Tiny beans sit in a
# continuous mound of red-bean paste, rather than forming a ring of balls.
for i in range(69):
    a=i*2.399;r=.140+rng.uniform(-.010,.008);z=.137+rng.uniform(-.023,.021)
    x=-.068+r*cos(a);d=.018+r*sin(a);w=rng.uniform(.002,.005);l=rng.uniform(.005,.012)
    points=[(x-w*sin(a),d+w*cos(a),z),(x+w*sin(a),d-w*cos(a),z+.002),
            (x+l*cos(a),d+l*sin(a),z+.005),(x+.004*cos(a),d+.004*sin(a),z-.002)]
    m.piece('깎인 눈꽃얼음의 면',points,[(0,1,2),(0,2,3),(2,1,0),(3,2,0)],'iceShade' if i%4==0 else 'milk')
C('부드러운 팥고물',-.068,.018,.161,[(.122,0),(.125,.012),(.104,.036),(.075,.061),(.041,.067)],'bean',21)
for row,(count,r,z) in enumerate([(30,.113,.172),(25,.094,.187),(18,.074,.198),(12,.048,.212),(5,.025,.220)]):
    for i in range(count):
        a=tau*(i+.39*row)/count;rr=r+rng.uniform(-.006,.005)
        C('통팥',-.068+rr*cos(a),.018+rr*sin(a),z+rng.uniform(-.004,.003),
          [(.006,0),(.012,.004),(.013,.010),(.006,.016)],'bean' if (i+row)%3 else 'beanLit',7,.77)
for i in range(8):
    a=tau*i/8;rr=.070 if i<6 else .033
    x=-.068+rr*cos(a);d=.018+rr*sin(a)
    C('노란 밤 조각',x,d,.210+rng.uniform(-.008,.012),[(.017,0),(.029,.009),(.028,.023),(.013,.036)],'chestnut',7,.86)
# Torn jujube strips expose contrasting russet skin and yellow flesh.
for i in range(19):
    a=i*2.399;rad=.067*(i/19)**.55;c=cos(a);ss=sin(a)
    x=-.068+rad*c;d=.018+rad*ss;z=.235+rng.uniform(-.016,.020)
    length=rng.uniform(.031,.058);w=rng.uniform(.009,.017)
    v=[(x+shift*c+side*ss,d+shift*ss-side*c,z+h)
       for shift,h in [(-length*.46,0),(-length*.09,.018),(length*.32,.028),(length*.54,.044)] for side in [-w,w]]
    v += [(x+shift*c+side*ss,d+shift*ss-side*c,z+h+.0016)
       for shift,h in [(-length*.46,0),(-length*.09,.018),(length*.32,.028),(length*.54,.044)] for side in [-w*.61,w*.73]]
    m.piece('말린 대추 껍질',v[:8],[(0,1,3,2),(2,3,5,4),(4,5,7,6),(2,3,1,0),(4,5,3,2),(6,7,5,4)],'jujube')
    m.piece('말린 대추 단면',v[8:],[(0,1,3,2),(2,3,5,4),(4,5,7,6),(2,3,1,0),(4,5,3,2),(6,7,5,4)],'jujubeFlesh')
group('구움찰떡과 차',meal)
saucer(.141,-.099,.004,.108)
for j,(x,d) in enumerate([(.101,-.120),(.186,-.078)]):
    C('오븐 구움찰떡',x,d,.021,[(.029,0),(.043,.008),(.045,.032),(.035,.041)],
      'rice' if not j else 'mugwort',12,.74)
    for k in range(3):
        T('구운 쌀눈',[(x-.017+k*.011,d-.012,.061),(x-.012+k*.011,d+.007,.065)],.002,'crust',5)
saucer(.134,.129,.004,.071)
mug(.131,.13,.021,.048,'celadon')
C('찻잔 속 차',.131,.13,.059,[(.038,0),(.042,.002)],'tea',17)
B('종이 냅킨',-.281,-.021,.006,.077,.169,.004,'paper')
T('빙수용 긴 숟가락', [(-.281,-.111,.015),(-.281,-.019,.015),(-.282,.042,.017)],.005,'steel',6)
C('숟가락 머리',-.282,.063,.016,[(.016,0),(.022,.006),(.019,.008)],'steel',14,1.4)

bpy.context.view_layer.update()
for subject in [cabinet,room,meal]:
    offset=Matrix.Translation(Vector(subject['preview_origin']))
    for item in subject.all_objects:
        center=sum((Vector(v) for v in item.bound_box),Vector())/8
        item.data.transform(Matrix.Translation(-center))
        item.matrix_world=offset @ item.matrix_world @ Matrix.Translation(center)
        item.select_set(False)
    subject['fit']='파미에 204호 운영사와 방문자 사진. 게임 점포 6.75 × 3.40m에 맞춘 재구성.'
target=Vector((3.8,-.75,1.3))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        a=area.spaces.active
        a.shading.color_type='MATERIAL'
        a.region_3d.view_distance=15
        a.region_3d.view_location=target
        a.region_3d.view_rotation=(target-Vector((7.7,10.2,4.1))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(here/'fp204.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
