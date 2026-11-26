"""Public Gyeongbu rooftop barbecue terrace, referenced to the restaurant and Seocho visitor photographs."""
from math import ceil,cos,pi,sin,sqrt
from random import Random
from pathlib import Path
import bpy
import runpy
import sys

HERE=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(HERE.parents[2]/'tools'))
import blender_shop_mesh as m

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene['reference']='https://exterminal.co.kr/images/floor10.jpg, Seocho January 2025 pp. 10-11 and https://polle.com/yong/posts/1179'
scene['placement']='The sign faces the bus yard; terrace dimensions, furniture counts and facade openings are adapted to the existing game.'
ta=2*pi;rng=Random(19410)
def new_group(name):
    c=bpy.data.collections.new(name);scene.collection.children.link(c);return c
patio=new_group('포석정 · 옥상 점포와 좌석')
meal=new_group('포석정 · 불판과 상차림')
prototype=new_group('포석정 · 공용 4인 식탁과 의자')
copies=new_group('포석정 · 동일 식탁 배치 원본')
sign=new_group('청색 옥상 대형 간판')
sign['preview_origin']=[14.7,.15,0]
# Collection origins are independent of the edit scene. The meal sits on the centre-right table.
food_x=1.85;food_d=1.25
meal['preview_origin']=[food_x,-food_d,0]
prototype['preview_origin']=[food_x,-food_d,0]
m.group=patio
for name,color,metallic in [
    ('바닥','777b75',0),('회벽','e4e0cc',0),('목탄색','363d3b',.12),('그늘','242e30',0),('밤색','63452f',0),
    ('조리대','8f938c',.32),('석재','7c8074',0),('줄눈','b0b1a6',0),('벽돌','746f62',0),
    ('담갈색','b57d51',0),('의자오크','aa7145',0),('가로대','855f42',0),('방석','353533',0),
    ('회양목','506e43',0),('새잎','839156',0),('이파리','638344',0),('가지','715744',0),
    ('주철','454d4c',.5),('스테인리스','b9c0b8',.55),('은빛','dce1d7',.55),('안쪽금속','939d98',.55),
    ('녹회색','87958d',0),('유리문','384e51',.16),('유리빛','86918b',.12),('프레임','5b655e',.20),
    ('유약','f0eee0',.12),('음식그릇','fdf7e8',.08),('연초록','b6c89d',0),
    ('나뭇결','6e6150',0),('진한결','4a463d',0),('목재상판','655b4a',0),('황토','b88b5c',0),
    ('숯','393633',0),('숯불','9e573a',0),('치마살','bb7d66',0),('구운면','ad754e',0),
    ('삼겹지방','e5c99d',0),('겉살','c99b72',0),('그릴자국','855639',0),('배추잎','e1ad7e',0),
    ('김치양념','c75b3e',0),('고춧가루','9b4738',0),('마늘','ece3ba',0),('쌈장','9b5434',0),
    ('콩나물','d9ca91',0),('고추','649149',0),('갈색채반','986543',0),('물병','91ab98',.08),
    ('인쇄색','f7f1ca',0),('병라벨','5e8873',0),('간판바탕','ece8d7',0),('공용고무','323c3d',0),
    ('풀적색','bb5149',0),('희색','f0ead1',0),('전구','ffe4a9',0),('노랑','e8bf66',0)]:
    m.palette[name]=m.material(name,color,metallic)
block=m.block;rod=m.rod;piece=m.piece

def profile(name,x,d,levels,color,seg=20,scale_d=1):
    return m.profile(name,x,d,0,levels,color,seg,scale_d)

def face(name,points,color):
    return piece(name,points,[tuple(range(len(points)))],color)

def xy_profile(name,x,d,levels,color,n=18):
    return profile(name,x,d,[(r,h) for h,r in levels],color,n)

def top_ring(name,x,d,z,ri,ro,color,n=36):
    verts=[(x+r*cos(j*ta/n),d+r*sin(j*ta/n),z) for r in [ri,ro] for j in range(n)]
    f=[(j,(j+1)%n,n+(j+1)%n,n+j) for j in range(n)]
    return piece(name,verts,f,color)

def curved(name,rows,color,cap=True):
    n=len(rows[0]);f=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rows)-1) for i in range(n)]
    if cap:f.extend([tuple(range(n-1,-1,-1)),tuple(range((len(rows)-1)*n,len(rows)*n))])
    return piece(name,[p for row in rows for p in row],f,color)

def box_at(name,x,d,z,w,depth,h,tint,ang=0):
    local=[(sx*w/2,sd*depth/2,l*h) for l in (0,1) for sx,sd in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return piece(name,[(x+a*cos(ang)-b*sin(ang),d+a*sin(ang)+b*cos(ang),z+c) for a,b,c in local],
                 [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],tint)

# The same grey roof finish receives the six small pools of light.
face('회색 옥상 바닥 · 구등 아래',
     [(-12.58,-.54,.009),(14.28,-.54,.009),(14.28,7.24,.009),(-12.58,7.24,.009)], '바닥')

# Match the linked city's Seoul night timeline. The standalone asset opens at night.
scene['Seoul apartment night']=1.0
def fixture(name,x,d,h,watts,radius):
    data=bpy.data.lights.new(name,'POINT')
    data.energy=watts;data.color=(1.0,.768,.523);data.shadow_soft_size=radius
    curve=data.driver_add('energy')
    v=curve.driver.variables.new();v.name='night';v.type='CONTEXT_PROP'
    target=v.targets[0];target.context_property='ACTIVE_SCENE';target.data_path='["Seoul apartment night"]'
    target.use_fallback_value=True;target.fallback_value=1.0
    curve.driver.expression=f'{watts}*night'
    obj=bpy.data.objects.new(name,data);patio.objects.link(obj);obj.location=(x,-d,h)

# Shallow brick frontage and the opening under the large painted terminal sign.
block('점포 뒷벽 · 처마 아래',0,-.67,.03,12.6,.14,2.65,'벽돌')
for row in range(8):
    z=.15+row*.302
    block('석재 · 가로 줄눈',0,-.594,z,12.57,.016,.012,'줄눈')
    for j in range(18):
        xx=-6.04+j*.71+.31*(row%2)
        if xx<6.22:block('석재 · 세로 줄눈',xx,-.595,z+.01,.012,.014,.291,'줄눈')
for x in [-3.8,-.1,3.53]:
    block('식당 출입문 · 깊은 프레임',x,-.54,.02,2.23,.14,2.18,'목탄색')
    block('출입문 · 어두운 유리',x,-.45,.04,2.09,.018,2.05,'유리문')
    for sx in [-1.03,0,1.03]:
        block('문틀 · 세로 바',x+sx,-.427,.03,.038,.030,2.10,'프레임')
    block('문틀 · 가로 바',x,-.423,.88,2.09,.034,.033,'프레임')
    for sx in [-.074,.074]:
        rod('문 손잡이',[(x+sx,-.413,.88),(x+sx,-.373,.91),(x+sx,-.373,1.17),(x+sx,-.413,1.20)],.011,'스테인리스')
    # A dim reflection under the awning breaks the uninterrupted dark glazing.
    for sx in [-.71,.43]:block('문 · 잔잔한 반사',x+sx,-.433,.99,.018,.009,.99,'유리빛')
for x in [-5.80,-2.10,1.73,5.86]:
    block('처마 · 얇은 철제 지주',x,-.07,.02,.108,.16,2.58,'석재')
block('처마 · 얇은 판',0,-.10,2.56,12.7,1.32,.12,'회벽')
block('처마 · 금속 앞단',0,.567,2.53,12.78,.055,.137,'석재')
for x in [-4.95,-1.22,2.44,5.40]:
    block('픽처 램프 · 받침',x,.41,2.665,.12,.11,.056,'프레임')
    rod('픽처 램프 · ㄱ자 목',[(x,.413,2.705),(x,.58,2.822),(x,.624,2.792)],.015,'프레임',7)
    profile('차양 · 발광부 덮개',x,.622,[(.043,2.741),(.055,2.750),(.026,2.79)],'석재',12)
    profile('차양 · 작은 온백색 램프',x,.622,[(.039,2.739),(.042,2.745)],'전구',12)
    fixture('차양에서 식탁을 비추는 조명',x,.64,2.731,42,.045)
block('점포 안내 · 밝은 상호판',-.18,-.407,2.08,1.84,.07,.37,'간판바탕')
# Reference shows dark wooden tables with a round insert, four wooden ladder backs, and a black seat pad.
def chair(x,d,yaw):
    def pt(a,b,z):return x+a*cos(yaw)-b*sin(yaw),d+a*sin(yaw)+b*cos(yaw),z
    for a in [-.18,.18]:
        for b in [-.17,.17]:
            rod('의자 · 네모난 다리',[pt(a,b,.023),pt(a*.84,b*.88,.438)],.023,'의자오크',4)
    for a in [-.17,.17]:
        rod('옆 흔들림 방지대',[pt(a,-.17,.204),pt(a,.17,.204)],.014,'가로대',4)
    box_at('의자 · 목재 좌판틀',x,d,.413,.395,.385,.047,'의자오크',yaw)
    box_at('의자 · 검은 방석',x,d,.455,.381,.369,.031,'방석',yaw)
    for a in [-.177,.177]:
        rod('의자 · 뒤로 굽는 등기둥',[pt(a,.160,.455),pt(a*1.06,.191,.64),pt(a*1.10,.223,.857)],.021,'가로대',6)
    for z,b in [(.61,.188),(.712,.206),(.830,.225)]:
        path=[pt(k*.032,b+.016*(1-(k/6)**2),z+.011*(1-(k/6)**2)) for k in range(-6,7)]
        rod('의자 · 세 단 휘어진 등판',path,.025 if z>.71 else .019,'의자오크',6)

def table(x,d,full):
    w=1.44;depth=.98;r=.307
    for sx in [-.58,.58]:
        for sd in [-.365,.365]:
            block('테이블 · 철제 각관 다리',x+sx,d+sd,.014,.047,.049,.702,'목탄색')
        block('테이블 · 금속 하단 가로대',x+sx,d,.21,.028,.731,.026,'주철')
    block('테이블 · 하부 앞치마',x,d,.671,1.40,.95,.058,'진한결')
    # An actual hole through the rectangular tabletop. The grill is flush inside it.
    n=48;pts=[]
    for kind in [0,1,2]:
        for j in range(n):
            a=j*ta/n;c=cos(a);s=sin(a)
            rad=(w/2/max(abs(c),1e-8) if abs(c)*depth>abs(s)*w else depth/2/max(abs(s),1e-8)) if kind<2 else r
            pts.append((x+rad*c,d+rad*s,.724 if kind==0 else .752))
    f=[(j,(j+1)%n,n+(j+1)%n,n+j) for j in range(n)]+[(n+j,n+(j+1)%n,2*n+(j+1)%n,2*n+j) for j in range(n)]
    piece('나뭇결 상판 · 원형 매립부',pts,f,'목재상판')
    for j in range(9):
        dd=-.44+j*.11
        for sx in [-1,1]:
            gap=sqrt(max(0,r*r-dd*dd))+.01 if abs(dd)<r else 0
            end=.703
            pts=[(x+sx*(gap+(end-gap)*k/4),d+dd+.003*sin(j+k*2),.7535) for k in range(5)]
            if end>gap:rod('목재 · 잔결',pts,.0016,'나뭇결',4)
    xy_profile('화로 · 매립된 화덕',x,d,[(.61,.262),(.747,.306)],'주철',30)
    top_ring('화로 · 넓은 스테인리스 림',x,d,.758,.259,.307,'스테인리스',48)
    if not full:
        current=m.group;m.group=patio
        xy_profile('불판 · 멀리 보이는 덮개',x,d,[(.725,.239),(.748,.253)],'안쪽금속',28)
        for i in range(16):
            a=i*ta/16
            x0=x+.219*cos(a);d0=d+.219*sin(a)
            rod('불판 · 외곽 슬롯',[(x0-.011*cos(a),d0-.011*sin(a),.750),(x0+.015*cos(a),d0+.015*sin(a),.750)],.006,'주철',5)
    if not full:m.group=current
    for sx in [-.39,.39]:
        for sd in [-.72,.72]:chair(x+sx,d+sd,0 if sd>0 else pi)

# Two rows flank the existing public aisle. The central place setting gets its own close-distance mesh.
tables=[(-3.80,1.25),(-.98,1.25),(food_x,food_d),(4.61,1.25),(-2.39,4.00),(.43,4.00),(3.25,4.00)]
for x,d in tables:
    full=x==food_x and d==food_d
    m.group=prototype if full else copies
    table(x,d,full)
m.group=patio

def bowl(x,d,z,r,tint='유약',shallow=False):
    h=.022 if shallow else .045
    rings=[(r*.58,z),(r*.76,z+.006),(r,z+h),(r*.95,z+h+.004),(r*.79,z+.015),(r*.52,z+.009)]
    profile('식탁 · 오목한 도기 접시',x,d,rings,tint,24,scale_d=.89)

def bottle(x,d):
    profile('식탁 · 녹색 음료병',x,d,[(.025,.754),(.035,.763),(.035,.869),(.024,.892),(.013,.913),(.013,.966)],'물병',14)
    profile('음료병 · 상표',x,d,[(.0355,.784),(.0355,.849)],'병라벨',14)
    profile('음료병 · 병마개',x,d,[(.014,.965),(.014,.976)],'스테인리스',12)

for i,(x,d) in enumerate(tables):
    if x==food_x and d==food_d:continue
    if i%3!=0: bottle(x+.53,d+.30)
    for sx,sd in [(-.48,-.27),(.45,.205)]:bowl(x+sx,d+sd,.754,.078,'유약',True)
    if i%2:profile('물컵 · 수저통',x-.51,d+.31,[(.033,.754),(.039,.844),(.036,.845),(.032,.765)],'스테인리스',16)
# A low planter and clipped bushes stand between the dining group and the promenade, as in the official floor photograph.
for x in [-4.25,3.45]:
    block('화단 · 낮은 콘크리트 턱',x,5.35,.012,2.62,.68,.275,'석재')
    block('화단 · 흙',x,5.35,.287,2.49,.56,.014,'진한결')
    for k in range(7):
        sx=x-1.01+k*.335;sd=5.36+rng.uniform(-.085,.085);h=rng.uniform(.48,.67)
        rows=[]
        for z,r in [(.29,.10),(.35,.225),(h,.275),(h+.13,.19),(h+.19,.024)]:
            rows.append([(sx+r*(1+.10*sin(3*a+k))*cos(a),sd+r*.93*sin(a),z+.025*sin(a*3+k)) for a in [j*ta/11 for j in range(11)]])
        curved('회양목 · 겹치는 포기',rows,['회양목','새잎','이파리'][k%3])
        for j in range(12):
            a=rng.uniform(0,ta);rad=rng.uniform(.10,.20);px=sx+rad*cos(a);pd=sd+rad*sin(a);z=h+.086+.04*rng.random()
            face('잎 · 작은 새순',[(px-.016,pd,z),(px+.01,pd-.016,z+.023),(px+.021,pd,z+.004)],'새잎')
# Slender guard pickets sit between the permanent curb, posts and top rail.
# Repeat the same panel bays as the game's simplified perimeter at long range.
for x0,d0,x1,d1 in [(14.3,-.57,14.3,7.25),(14.3,7.25,-12.6,7.25),(-12.6,7.25,-12.6,-.57)]:
    panels=ceil((abs(x1-x0)+abs(d1-d0))/1.5)
    for k in range(panels):
        for j in range(1,7):
            t=(k+j/7)/panels
            block('산책로 · 가느다란 수직 난간살',x0+(x1-x0)*t,d0+(d1-d0)*t,.30,.018,.018,.81,'프레임')
# Globe lights seen along the public rooftop promenade.
for x in [-5.7,5.48]:
    profile('산책로 조명 · 앵커와 등주',x,5.67,[(.10,.02),(.105,.047),(.05,.08),(.037,1.94),(.086,1.98),(.099,2.04)],'프레임',18)
    glass=profile('산책로 조명 · 유백색 구',x,5.67,[(.051,2.025),(.124,2.062),(.160,2.146),(.160,2.232),(.107,2.303),(.025,2.334)],'유약',20)
    glass.visible_shadow=False
    fixture('유백 구등의 산책로 조명',x,5.67,2.185,63,.15)

m.group=meal
# A true slotted circular Korean grill. Dark gaps reveal the charcoal below.
xy_profile('화덕 내부 · 검은 바닥',0,0,[(.724,.246),(.730,.254)],'숯',44)
for j in range(15):
    a=j*ta/15+.12;r=.147+.056*sin(j*3)
    x=r*cos(a);d=r*sin(a)
    face('숯 사이의 잔불',[(x-.018,d,.733),(x+.005,d-.014,.737),(x+.016,d+.008,.738),(x,d+.012,.733)],'숯불')
top_ring('불판 · 바깥쪽 둥근 원테',0,0,.765,.240,.257,'은빛',72)
top_ring('불판 · 안쪽 원테',0,0,.768,.162,.187,'스테인리스',72)
edges=32
for j in range(edges):
    a=j*ta/edges
    pts=[]
    for r,theta in [(.184,a+.023),(.242,a+.053),(.242,a+.121),(.184,a+.110)]:
        pts.append((r*cos(theta),r*sin(theta),.766))
    face('불판 · 사선 통풍구 사이 금속',pts,'스테인리스')
    # Folded, darker inner lip gives each punched hole visible thickness.
    x1,d1,z1=pts[0];x2,d2,z2=pts[1]
    face('불판 · 슬롯의 절단면',[(x1,d1,z1),(x2,d2,z2),(x2,d2,z2-.009),(x1,d1,z1-.009)],'안쪽금속')
for j in range(9):
    d=-.148+j*.037
    dd1=max(-.164,d-.009);dd2=min(.164,d+.012)
    a=sqrt(max(0,.165**2-dd1**2));b=sqrt(max(0,.165**2-dd2**2))
    face('불판 · 가운데 장슬릿 사이 평판',[(-a,dd1,.768),(a,dd1,.768),(b,dd2,.768),(-b,dd2,.768)],'안쪽금속' if j%3==0 else '스테인리스')
# Pork belly with irregular edges, rendered fat strata and a few grill marks.
def belly(x,d,yaw,size,tone):
    section=[(-.69,-.50),(.27,-.60),(.65,-.38),(.73,.11),(.48,.47),(-.24,.58),(-.70,.32),(-.83,-.15)]
    def v(a,b,z):
        return (x+size*(a*cos(yaw)-b*sin(yaw)),d+size*(a*sin(yaw)+b*cos(yaw)),z)
    rows=[]
    for k,(z,scale) in enumerate([(.770,.77),(.775,.94),(.786,1.00),(.798,.92),(.801,.82)]):
        rows.append([v(a*scale,b*scale,z+.002*sin(i*2+k)) for i,(a,b) in enumerate(section)])
    curved('삼겹살 · 오그라든 구운 고기',rows,tone)
    face('삼겹살 · 지방 띠',[v(-.49,-.40,.801),v(.28,-.42,.801),v(.53,-.23,.802),v(.25,-.13,.804),v(-.43,-.18,.803)],'삼겹지방')
    for a in [-.18,.23]:
        rod('삼겹살 · 눌린 그릴 자국',[v(a,-.13,.8043),v(a+.07,.20,.8032)],.0018,'그릴자국',5)
for x,d,a,s,c in [(-.10,-.084,.55,.073,'겉살'),(.024,-.10,-.25,.09,'치마살'),(.093,-.014,.23,.066,'겉살'),
                    (-.098,.010,-.62,.073,'치마살'),(-.095,.111,.74,.070,'구운면'),(.023,.112,-.87,.083,'겉살'),(.003,.018,.41,.061,'구운면')]:
    belly(x,d,a,s,c)
# Oval side dishes, kimchi folds, bean sprouts and a split garlic/ssamjang tray from the close-up.
bowl(.47,.031,.754,.113);bowl(.49,-.25,.754,.097);bowl(-.46,-.29,.754,.078)
for j in range(7):
    x=.47+rng.uniform(-.051,.05);d=.02+rng.uniform(-.044,.042);h=.781+j*.002
    verts=[(x-.030,d-.013,h),(x-.006,d-.025,h+.008),(x+.033,d-.015,h+.009),(x+.025,d+.009,h+.023),(x-.022,d+.016,h+.009)]
    face('김치 · 버무린 배춧잎',verts,'배추잎' if j%3 else '김치양념')
    rod('김치 · 양념과 섬유',[(x-.022,d-.008,h+.005),(x,d,h+.012),(x+.020,d+.007,h+.017)],.003,'김치양념',5)
for j in range(17):
    x=.48+rng.uniform(-.05,.049);d=-.26+rng.uniform(-.045,.045)
    rod('콩나물 · 가늘게 휘어진 줄기',[(x-.015,d-.009,.781),(x+.006,d,.791),(x+.020,d+.012,.786)],.0023,'콩나물',5)
    xy_profile('콩나물 · 노란 콩머리',x+.02,d+.012,[(.786,.004),(.791,.005),(.795,.002)],'노랑',7)
def tray(x,d):
    block('반찬 종지 · 도자기 바닥',x,d,.756,.18,.10,.013,'음식그릇',.004)
    for sx in [-.087,0,.087]:block('반찬 종지 · 칸막이',x+sx,d,.764,.008,.10,.027,'유약',.002)
    for sd in [-.046,.046]:block('반찬 종지 · 긴 가장자리',x,d+sd,.764,.174,.008,.027,'유약',.002)
    for i in range(5):
        sx=x+.04+rng.uniform(-.017,.015);sd=d+rng.uniform(-.024,.021)
        profile('깐 마늘 · 뾰족한 쪽',sx,sd,[(.007,.771),(.013,.777),(.014,.786),(.008,.795),(.003,.799)],'마늘',9,scale_d=.72)
    for i in range(6):
        profile('쌈장 · 작은 덩어리',x-.041+rng.uniform(-.023,.017),d+rng.uniform(-.019,.020),
                [(.006,.770),(.014,.778),(.011,.786),(.003,.790)],'쌈장',8)
tray(-.42,.17);tray(.31,.36)
bowl(-.38,.371,.754,.091)
for j in range(9):
    a=j*ta/9;px=-.38+.049*cos(a);pd=.368+.046*sin(a);z=.783+.004*(j%3)
    side=(.022*-sin(a),.022*cos(a))
    p0=(-.38,.368,z);p1=(px+side[0],pd+side[1],z+.02)
    p2=(px+.024*cos(a),pd+.024*sin(a),z+.025+.013*sin(j*3));p3=(px-side[0],pd-side[1],z+.019)
    face('쌈 채소 · 굴곡진 잎',[p0,p1,p2,p3],['이파리','연초록','새잎'][j%3])
    rod('쌈 채소 · 잎맥',[p0,(px,pd,z+.023),p2],.0014,'연초록',4)
# A pair of metal chopsticks, a spoon and open tongs sit separately on the table.
for off in [-.007,.007]:
    rod('식사 도구 · 쇠젓가락',[(.35+off,-.40,.761),(.25+off,-.18,.764)],.0023,'스테인리스',7)
rod('식사 도구 · 숟가락 자루',[(-.63,-.36,.762),(-.51,-.175,.764)],.004,'스테인리스',7)
bowl(-.49,-.148,.763,.020,'은빛',True)
for side in [-1,1]:
    path=[(-.58,-.007,.765),(-.55+side*.014,-.039,.779),(-.46+side*.032,-.15,.776)]
    rod('고기 집게 · 탄성 집게 팔',path,.005,'스테인리스',7)
    x,d,h=path[-1];face('고기 집게 · 넓은 끝',[(x-.012,d+.006,h),(x+.010,d-.006,h),(x+.018,d-.036,h-.005),(x-.006,d-.027,h-.008)],'은빛')
bottle(-.602,.325)
for x,d in [(.60,.315),(-.61,-.293)]:
    profile('물잔 · 비어 있는 안쪽',x,d,[(.031,.754),(.040,.824),(.037,.827),(.030,.765)],'유약',16)
# Move the close-up objects as a group for the editable native scene, preserving their independent runtime origin.
for o in meal.objects:
    o.location.x+=food_x;o.location.y-=food_d
runpy.run_path(str(HERE/'sign.py'))['build'](m,sign)
for o in sign.objects:
    o.location.x+=14.7;o.location.y+=.15
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=14
        area.spaces.active.region_3d.view_location=(0,-2,1.2)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'poseokjeong-rooftop.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'))
