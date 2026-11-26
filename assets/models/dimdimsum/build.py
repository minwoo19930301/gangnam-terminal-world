"""Public dining room and table service, DimDimSum Central City."""
from math import cos, pi, sin, sqrt, tau
from pathlib import Path
import runpy
import sys
import bpy
from mathutils import Matrix, Vector

here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(here.parents[2] / 'tools'))
import blender_shop_mesh as m

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = '딤딤섬 · 파미에 중층'
scene.unit_settings.system = 'METRIC'
for key, color in {
    'ink':'303331', 'iron':'494c47', 'steel':'a7aca6', 'brass':'b38e55',
    'oak':'af8259', 'bark':'77573e', 'edge':'956a43', 'honey':'ae7947',
    'mustard':'b28b54', 'weave':'bd915e', 'lightreed':'d6b17a', 'cream':'e7d8bd',
    'green':'9cae9e', 'frost':'c4cdc0', 'pearl':'d0ddcb', 'mortar':'92897c',
    'brick':'b7ada0', 'red':'9d4938', 'plum':'663d35', 'pale':'f1e8d3',
    'paper':'e6dfcb', 'teal':'588881', 'black':'262927', 'wh':'f3f0e1',
    'meal':'eadcbf', 'bao':'f4ead5', 'shrimp':'dbac8d', 'prawn':'e9cbb2',
    'egg':'e6bb6b', 'roe':'de773e', 'soy':'4c372b', 'tea':'ad7940', 'ginger':'c59b5c',
    'lamp':'f6dfad', 'shadow':'a3957d', 'blush':'dccaac', 'char':'594636'
}.items():
    m.palette[key] = m.material(key, color, .32 if key in ('brass','steel') else 0)
B, C, T = m.block, m.profile, m.rod

def group(name, parent=None):
    g = bpy.data.collections.new(name)
    (parent or scene.collection).children.link(g)
    m.group = g
    return g

def root(name, origin):
    g = group('딤딤섬 · '+name)
    g['preview_origin'] = origin
    return g

def hoop(name, x,d,z, r,depth, h, gauge, color, count=20):
    rings = [(r,0),(r,h),(r-gauge,h),(r-gauge,0)]
    vertices = [(x+rr*cos(tau*i/count), d+rr*depth*sin(tau*i/count), z+zz)
                for rr,zz in rings for i in range(count)]
    faces = [(j*count+i,j*count+(i+1)%count,((j+1)%4)*count+(i+1)%count,((j+1)%4)*count+i)
             for j in range(4) for i in range(count)]
    m.piece(name, vertices, faces, color)

def ellipsoid(name,x,d,z,rx,rd,h,color,seg=14):
    C(name,x,d,z,[(.23*rx,0),(.77*rx,.14*h),(rx,.43*h),(.92*rx,.68*h),
                  (.64*rx,.88*h),(.22*rx,h)],color,seg,rd/rx)

host = root('대기 접수대와 유아의자',(0,0,0))
group('검정 접수대와 대기 등록 화면',host)
B('대기 접수대 기단',-3.12,.66,.035,1.67,.67,.10,'ink')
B('접수대 검정 하부',-3.12,.66,.125,1.75,.72,.85,'ink',.018)
B('금속 카운터 테두리',-3.12,.66,.975,1.81,.78,.052,'iron',.012)
B('검정 상판',-3.12,.66,1.017,1.80,.775,.025,'black')
for i in range(24):
    B('세로 골',-3.946+i*.072,.292,.17,.014,.014,.74,'iron')
B('이동식 대기 명부장',-1.91,.65,.14,.56,.57,.71,'oak',.015)
B('명부장 상판',-1.91,.65,.84,.61,.63,.055,'bark',.008)
for x in [-2.11,-1.71]:
    for d in [.45,.85]:
        C('캐스터 바퀴',x,d,.039,[(.040,0),(.046,.067)],'ink',8)
        B('바퀴 포크',x,d,.095,.042,.048,.060,'steel')
def tablet(x,d,z,size=1):
    B('태블릿 받침',x,d,z,.255*size,.21*size,.018,'iron',.004)
    T('표시기 목',[(x,d+.057,z+.017),(x,d+.027,z+.101),(x,d,z+.116)],.019,'steel')
    def plane(label,w,h,front,color):
        points=[(x+ww*size,d+dd*.45+front,z+.124+(dd+h*.5)*size)
                for ww,dd in [(-w/2,-h/2),(w/2,-h/2),(w/2,h/2),(-w/2,h/2)]]
        m.piece(label,points,[(0,1,2,3),(3,2,1,0)],color)
    plane('비스듬한 예약 태블릿',.34,.22,0,'black')
    plane('밝은 등록 화면',.301,.177,-.004,'pale')
    for i,c in enumerate(['teal','red']):
        dx = -.063 if i==0 else .065
        B('예약 화면 버튼',x+dx*size,d-.015,z+.161*size,.083*size,.009,.026*size,c)
tablet(-3.07,.48,1.046)
tablet(-1.91,.65,.90,.84)
group('안내 입간판과 유아용 의자',host)
for x in [-4.77,-4.23]:
    for delta in [-.22,.22]:
        T('메뉴판의 접이식 다리',[(x,.42+delta,.035),(x,.50,.93),(x,.51,1.20)],.018,'ink',6)
B('입간판 목재 프레임',-4.5,.485,.48,.60,.044,.78,'bark',.008)
B('흰 메뉴 속지',-4.5,.457,.508,.55,.012,.721,'paper')
for j in range(3):
    for i in range(2):
        xx=-4.64+i*.27; zz=.59+j*.194
        B('메뉴 사진의 테두리',xx,.449,zz,.225,.008,.115,'weave')
        B('메뉴 사진 하단',xx,.444,zz-.024,.163,.006,.014,'iron')
        C('메뉴 카드 고정 핀',xx,.444,zz+.115,[(.008,0),(.008,.009)],'brass',7)
for level in range(3):
    x,d,z=2.90,.70,.12*level
    for i in [-1,1]:
        for j in [-1,1]:
            T('적층 유아의자 다리',[(x+i*.29,d+j*.26,z+.035),(x+i*.21,d+j*.18,z+.45),
                 (x+i*.17,d+j*.135,z+.64)],.025,'steel',7)
    B('유아의자 좌판',x,d,z+.62,.41,.34,.058,'cream',.022)
    B('유아의자 등받이',x,d+.14,z+.66,.40,.065,.19,'cream',.022)
    for i in [-1,1]:
        T('유아의자 팔걸이',[(x+i*.174,d+.12,z+.77),(x+i*.19,d-.123,z+.74),
                              (x+i*.18,d-.14,z+.65)],.027,'cream',8)
    B('유아의자 앞 안전바',x,d-.149,z+.704,.381,.047,.062,'cream',.011)
for x in [4.45,5.10,5.75]:
    for xx in [-.18,.18]:
        for dd in [-.16,.16]:
            T('대기 의자의 목재 다리',[(x+xx*1.1,.65+dd*1.1,.02),(x+xx*.90,.65+dd*.86,.43)],.023,'bark',7)
    B('대기 의자 좌석',x,.65,.425,.47,.43,.07,'oak',.017)
    B('대기 의자 등판',x,.83,.481,.44,.062,.31,'oak',.021)

inside = root('유리블록과 대나무 조명',(0,-12,0))
group('긴 소파와 반투명 가림막',inside)
for x,sign in [(1.91,1),(-7.06,-1),(6.50,1)]:
    B('소파 목제 기단',x,4.63,.045,.66,5.27,.36,'bark')
    for i in range(7):
        d=2.40+i*.744
        B('긴 좌방석의 봉제선',x,d,.410,.68,.727,.12,'mustard',.026)
        B('등받이 쿠션',x+sign*.264,d,.527,.161,.726,.41,'honey',.026)
    B('등받이 상부의 나무 몰딩',x+sign*.288,4.63,.924,.12,5.29,.076,'edge',.010)
    if x==1.91:
        for i in range(7):
            d=2.36+i*.752
            B('반투명 가림 유리',x+.286,d,1.015,.047,.695,.37,'frost')
        for i in range(8):
            B('가림막 프레임',x+.286,1.992+i*.752,.94,.082,.040,.47,'ink')
        B('가림막 상부 검정 프레임',x+.286,4.63,1.389,.083,5.32,.043,'ink')
group('주방 앞 유리블록과 서빙 카운터',inside)
B('주방 하부의 짙은 타일',-.60,8.57,.035,10.47,.26,1.04,'iron')
B('주방 서빙 창 턱',-.60,8.29,1.04,10.46,.60,.071,'ink')
B('조리실 후면 벽',-.60,8.90,1.11,10.44,.09,2.24,'pearl')
for j in range(3):
    for i in range(18):
        x=-5.54+i*.578
        B('패스 안의 밝은 벽타일',x,8.837,1.16+j*.28,.565,.015,.267,'pale' if j%2 else 'cream')
B('패스 안의 금속 선반',-.60,8.70,1.71,10.19,.23,.036,'steel')
for x in [-4.32,-.05,2.83]:
    B('금속 조리대 정면',x,8.72,1.120,1.42,.24,.30,'steel')
    B('조리대의 앞 턱',x,8.58,1.39,1.45,.07,.042,'iron')
    for n in range(3):
        d=8.65
        C('패스에 쌓인 금속 용기',x-.33,d,1.43+n*.055,
          [(.102,0),(.125,.025),(.132,.048),(.132,.055)],'steel',12)
    for n in range(4):
        C('패스의 찜통 더미',x+.35,8.66,1.431+n*.058,
          [(.14,0),(.144,.010),(.143,.055),(.145,.058)],'weave' if n%2 else 'lightreed',15)
        C('위쪽 선반 접시',x-.18,8.69,1.747+n*.017,
          [(.08,0),(.12,.012),(.12,.018)],'wh',12)
for x in [-5.80,-2.34,1.14,4.60]:
    B('조리창 프레임',x,8.51,1.105,.084,.18,2.24,'ink')
B('조리창 검정 문선',-.60,8.51,2.025,10.47,.18,.077,'ink')
B('유리 블록 줄눈',-.60,8.535,2.15,10.48,.18,.93,'green')
for j in range(3):
    for i in range(33):
        x=-5.64+i*.315
        z=2.185+j*.275
        # A cut rim and recessed front catch the light without rounding all twelve hidden edges.
        vertices=[(x+xx*w,dd,z+.125+zz*h) for w,h,dd in [(.148,.125,8.49),(.148,.125,8.412),
            (.129,.107,8.399),(.112,.089,8.409)] for xx,zz in [(-1,-1),(1,-1),(1,1),(-1,1)]]
        faces=[(k*4+i,k*4+(i+1)%4,(k+1)*4+(i+1)%4,(k+1)*4+i) for k in range(3) for i in range(4)]
        m.piece('벽돌형 유리블록',vertices,faces+[(12,13,14,15)],'frost' if (i+j)%3 else 'pearl')
B('조리창 상부 간판 띠',-.60,8.49,3.0,10.48,.17,.30,'ink')
for x in [-4.19,-1.55,1.05,3.50]:
    B('주방 상판의 접시 받침',x,8.39,1.116,.44,.28,.05,'oak')
    for j in range(3):
        C('서빙 흰 접시',x,8.38,1.165+j*.017,[(.13,0),(.173,.012),(.17,.018)],'wh',15,.74)
group('천장 설비와 엮은 대나무등',inside)
for x in [-5.88,.85,5.44]:
    B('천장 등기구 레일',x,4.66,3.234,.044,5.95,.046,'iron')
    for d in [2.10,3.79,5.47,7.23]:
        C('스포트라이트 원통',x,d,3.077,[(.068,0),(.068,.12)],'black',10)
        C('스포트라이트 렌즈',x,d,3.073,[(.055,0),(.055,.007)],'lamp',10)
for x in [-2.30,3.52]:
    B('노출 천장 배관',x,4.83,3.275,.32,6.43,.16,'iron')
    for d in [2.20,4.65,6.93]:
        B('배관 조임띠',x,d,3.265,.34,.045,.18,'steel')
for x,d in [(3.8,3.12),(-4.68,5.97)]:
    B('천장형 냉방기',x,d,3.206,.83,.83,.10,'paper',.020)
    for j in range(7):
        B('토출 그릴',x,d-.252+j*.083,3.195,.59,.024,.012,'mortar')
def pendant(x,d,drop=0):
    z=2.16+drop
    T('펜던트 줄',[(x,d,z+.59),(x,d,3.31)],.009,'ink',6)
    C('등 소켓',x,d,z+.42,[(.049,0),(.045,.093),(.022,.18)],'bark',10)
    ellipsoid('대나무갓 안쪽의 전구',x,d,z+.12,.072,.072,.186,'lamp')
    shape=[(.268,0),(.312,.075),(.345,.181),(.296,.31),(.188,.404),(.063,.485)]
    for i in range(23):
        a=tau*i/23
        T('휘어진 대나무살',[(x+r*cos(a+h*.18),d+r*sin(a+h*.18),z+h) for r,h in shape],.009,'weave',5)
    for r,h in shape[:-1]:
        hoop('갓의 수평 엮음',x,d,z+h,r,1,.012,.010,'lightreed',24)
for x,d in [(-2.8,2.85),(-2.8,5.95),(4.24,4.86)]:
    pendant(x,d,.10 if d>5 else 0)
group('벽돌 벽과 붉은색 추상 패널',inside)
B('회갈색 벽돌 줄눈',-7.87,5.01,.095,.10,7.34,3.05,'mortar')
for j in range(10):
    for i in range(13):
        d=1.61+i*.54+(j%2)*.24
        if d<8.56:B('벽돌 면',-7.801,d,.15+j*.283,.039,.52,.267,'brick')
for d in [2.95,5.84]:
    B('진홍색 벽 장식',-7.759,d,1.37,.061,1.52,1.28,'red',.015)
    for j in range(7):
        T('목조 패널의 곡선 음영',[(-7.72,d-.62+j*.15,1.67),(-7.71,d-.50+j*.16,1.89),
                   (-7.705,d-.44+j*.155,2.03),(-7.72,d-.48+j*.14,2.29)],.025,'plum',6)

table = root('목제 식탁과 곡목 의자',(10,0,0))
group('목리와 모서리가 있는 식탁',table)
B('검정 받침대',0,0,.025,.62,.52,.040,'ink',.015)
B('식탁 중앙 다리',0,0,.06,.129,.138,.653,'iron')
B('상판 아래 가로틀',0,0,.686,.96,.62,.049,'bark')
B('식탁의 두꺼운 모서리',0,0,.72,1.24,.82,.054,'edge',.015)
B('참나무 상판',0,0,.772,1.232,.812,.017,'oak',.006)
for j in range(5):
    B('상판 판재 이음',0,-.337+j*.167,.7891,1.19,.0014,.0008,'edge')
group('검은 곡목 의자',table)
for d in [-.239,.239]:
    x=-.889
    for i in [-1,1]:
        for j in [-1,1]:
            foot=(x+i*.207,d+j*.185,.015)
            T('의자 다리의 황동 신발',[foot,(x+i*.198,d+j*.177,.092)],.019,'brass',7)
            T('바깥으로 벌어진 의자 다리',[(x+i*.198,d+j*.177,.088),(x+i*.155,d+j*.151,.429)],.018,'ink',7)
    B('방석',x,d,.42,.405,.372,.060,'black',.026)
    for j in [-1,1]:
        T('등받이 지지대',[(x-.136,d+j*.145,.458),(x-.184,d+j*.148,.62),
                        (x-.210,d+j*.139,.749)],.017,'ink',7)
    T('곡목 등받이 윗선',[(x-.163,d-.179,.716),(x-.207,d-.148,.759),(x-.225,d-.071,.783),
                        (x-.227,d+.071,.783),(x-.207,d+.148,.759),(x-.163,d+.179,.716)],.027,'bark',8)
    T('등받이 안쪽 고리',[(x-.146,d-.052,.469),(x-.191,d-.046,.627),(x-.216,d,.721),
                        (x-.191,d+.046,.627),(x-.146,d+.052,.469)],.012,'ink',6)

def basket(x,d,r,z=.013,liner=True):
    # The open top and narrow double binding expose the slats and food inside.
    hoop('대나무 찜통의 열린 벽',x,d,z,r,1,.065,.007,'weave',26)
    for h in [.002,.015,.055]:
        hoop('대나무 테의 겹죽',x,d,z+h,r+.0015,1,.005,.005,'lightreed' if h>.015 else 'bark',26)
    for i in range(-4,5):
        dy=r*i*.182
        width=2*sqrt(max(0,(r*.95)**2-dy**2))
        B('찜기 안 바닥살',x,d+dy,z+.012,width,r*.157,.006,'lightreed')
    if liner:
        C('찜기 안 둥근 종이',x,d,z+.022,[(r*.885,0),(r*.885,.002)],'pale',24)
        for i in range(12):
            angle=tau*i/12
            C('종이 통기 무늬',x+r*.735*cos(angle),d+r*.735*sin(angle),z+.0242,
              [(.0035,0),(.0035,.0005)],'shadow',7)
    for i in range(3):
        angle=tau*i/3+.31
        T('찜통의 매듭',[(x+(r+.002)*cos(angle),d+(r+.002)*sin(angle),z+.014),
                        (x+(r+.002)*cos(angle+.045),d+(r+.002)*sin(angle+.045),z+.052)],.0018,'bark',5)

def pleated(x,d,z,rx,rd,height,colour,shape):
    n=30
    rings={'bao':[(.52,0,.012),(.90,.14,.015),(1,.42,.025),(.84,.67,.052),
                  (.55,.83,.088),(.24,.94,.16),(.135,.92,.18),(.045,.85,.04)],
           'har':[(.67,0,.01),(.95,.15,.015),(1,.42,.03),(.86,.64,.052),
                  (.54,.82,.10),(.19,.93,.12),(.035,1,.015)],
           'siu':[(.74,0,.01),(.84,.11,.035),(.83,.54,.09),(1,.90,.15),
                  (.78,1,.15),(.65,.85,.12)]}[shape]
    vert=[]
    for j,(radius,h,pinch) in enumerate(rings):
        for i in range(n):
            a=tau*i/n
            ripple=radius*(1+pinch*cos(10*a+j*.19))
            vert.append((x+rx*ripple*cos(a),d+rd*ripple*sin(a),z+height*(h+.016*sin(3*a+j*.28))))
    faces=[tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))]
    faces += [(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rings)-1) for i in range(n)]
    m.piece({'bao':'샤오롱바오의 모아쥔 만두피','har':'하가우의 접힌 반달 피','siu':'시우마이의 열린 피'}[shape],vert,faces,colour)
    if shape=='har':
        for k in range(5):
            dx=(k-2)*.013
            T('하가우 세로주름',[(x+dx-.008,d-rd*.91,z+height*.25),(x+dx,d-rd*.71,z+height*.58),
                 (x+dx+.004,d-rd*.28,z+height*.86),(x+dx+.002,d,z+height*.93)],.00165,'bao',5)
    if shape=='siu':
        ellipsoid('시우마이의 새우 속',x,d,z+height*.77,.72*rx,.72*rd,height*.22,'shrimp',12)
        for k in range(6):
            a=tau*k/6
            ellipsoid('주황색 날치알',x+.009*cos(a),d+.009*sin(a),z+height*.958,.0038,.0035,.004,'roe',7)

def tea_service(x,d):
    C('작은 차 도자기 잔',x,d,.006,[(.029,0),(.030,.009),(.038,.038),(.042,.059),(.039,.060),(.030,.045)],'wh',17)
    C('잔 안 호박색 차',x,d,.053,[(.035,0),(.036,.001)],'tea',17)
def sauce(x,d):
    C('간장용 작은 접시',x,d,.006,[(.030,0),(.047,.007),(.056,.019),(.055,.024),(.048,.024),(.031,.014)],'wh',18)
    C('검은 간장',x,d,.020,[(.042,0),(.044,.001)],'soy',17)
    for j in range(4):
        T('간장 위의 채 썬 생강',[(x-.018+j*.008,d-.010,.022),(x-.003+j*.006,d+.015,.024)],.0014,'ginger',5)
def utensils(x,d):
    B('종이 수저 받침',x,d,.004,.095,.239,.002,'paper')
    for dx in [-.018,-.002]:
        T('검은 젓가락',[(x+dx,d-.128,.010),(x+dx,d+.126,.010)],.0035,'ink',6)
    T('중식 숟가락의 굽은 손잡이',[(x+.025,d-.103,.021),(x+.024,d-.08,.029),
          (x+.021,d+.012,.018),(x+.020,d+.047,.017)],.006,'wh',8)
    C('중식 숟가락의 오목한 술',x+.020,d+.074,.009,[(.009,0),(.020,.006),(.024,.019),
          (.021,.020),(.016,.012),(.007,.008)],'wh',14,1.50)

meal=root('찜기 세 가지와 차',(10,-4,0))
group('대나무 찜기에 담은 하가우와 샤오롱바오',meal)
# Place whole baskets toward the aisle side of the table, with a setting clear on either side.
for j,(x,d,r,kind,col) in enumerate([(-.206,-.025,.143,'bao','meal'),(.067,.157,.136,'har','prawn'),(.106,-.142,.132,'siu','egg')]):
    basket(x,d,r)
    for k in range(3):
        a=tau*k/3+j*.32
        xx=x+.064*cos(a);dd=d+.061*sin(a)
        pleated(xx,dd,.038,.043 if j!=1 else .055,.044 if j!=1 else .032,.058 if j!=1 else .047,col,kind)
group('차와 간장 및 젓가락',meal)
tea_service(-.358,.241);tea_service(.345,-.249)
sauce(-.268,-.246);utensils(.368,.121)
dessert=root('피기 커스터드 번',(10,-7,0))
group('돼지코 커스터드 찐빵과 찜통 뚜껑',dessert)
basket(-.028,-.03,.183)
def snout(x,d,z):
    # Each half of the tilted nose carries a recessed nostril with its own inner wall.
    def pos(w,h,n):
        return (x-.065+.72*h-.69*n,d+w,z+.057+.69*h+.72*n)
    W,H=.0275,.022
    rings=[[(W*scale*cos(tau*j/20),H*scale*sin(tau*j/20),n) for j in range(20)]
           for scale,n in [(.69,0),(1,.006),(1,.013),(.88,.018)]]
    vertices=[pos(*pt) for ring in rings for pt in ring]
    face=[(k*20+j,k*20+(j+1)%20,(k+1)*20+(j+1)%20,(k+1)*20+j) for k in range(3) for j in range(20)]
    m.piece('살짝 들린 타원형 돼지코',vertices,face,'meal')
    for side in [-1,1]:
        hole=side*.0094; section=[]
        for j in range(18):
            a=tau*j/18;cw,sh=cos(a),sin(a)
            aa=(cw/(W*.88))**2+(sh/(H*.88))**2
            bb=2*hole*cw/(W*.88)**2
            cc=(hole/(W*.88))**2-1
            distance=(-bb+sqrt(bb*bb-4*aa*cc))/(2*aa)
            if cw*side<0:
                distance=min(distance,-hole/cw)
            section.append((hole+distance*cw,distance*sh))
        verts=[pos(w,h,.018) for w,h in section]
        for n,scale in [(.0183,1),(.013,.66)]:
            verts.extend(pos(hole+.0048*scale*cos(tau*j/18),.0062*scale*sin(tau*j/18),n) for j in range(18))
        patches=[(j,(j+1)%18,18+(j+1)%18,18+j) for j in range(18)]
        m.piece('코끝과 콧구멍의 테',verts[:36],patches+[(d,c,b,a) for a,b,c,d in patches],'meal')
        m.piece('오목한 콧구멍',verts[18:],patches+[(d,c,b,a) for a,b,c,d in patches]+[tuple(range(18,36))],'ginger')
def pig(x,d,z,yaw):
    before=set(m.group.objects)
    dome=[(.036,0),(.054,.005),(.061,.011)]
    for j in range(15):
        a=-.25+(pi/2+.25)*j/14
        dome.append((max(.002,.066*cos(a)),.035+.061*sin(a)))
    C('커스터드 번의 둥근 몸통',x,d,z,dome,'bao',27,.94)
    snout(x,d,z)
    for i in [-1,1]:
        ellipsoid('노란색 눈',x-.038,d+i*.027,z+.077,.009,.008,.007,'egg',10)
        ellipsoid('눈 가운데 작은 점',x-.039,d+i*.027,z+.082,.0045,.0037,.0028,'roe',8)
        ear=[(x-.023,d+i*.034,z+.070),(x+.007,d+i*.035,z+.071),
             (x+.003,d+i*.059,z+.096),(x-.014,d+i*.047,z+.087)]
        m.piece('접힌 흰 귀',ear,[(0,2,1),(0,3,2),(3,1,2),(0,1,3)],'bao')
    center=Vector((x,-d,z))
    spin=Matrix.Translation(center) @ Matrix.Rotation(-yaw,4,'Z') @ Matrix.Translation(-center)
    for obj in set(m.group.objects)-before:
        obj.data.transform(spin)
for x,d,a in [(-.103,-.056,1.02),(.034,-.080,1.54),(-.021,.054,.82)]:pig(x,d,.038,a)
# An open woven lid sits at the rear of the plate, leaving every bun visible.
cx,cd=.252,.112
C('찜기 뚜껑의 둥근 등',cx,cd,.018,[(.145,0),(.153,.012),(.144,.026),(.101,.040),(.032,.048)],'weave',24)
for j in range(-5,6):
    offset=j*.024;span=sqrt(max(0,.143**2-offset**2))
    for sign in [-1,1]:
        pts=[]
        for idx in range(9):
            axis=-span+idx*span/4
            xx,dd=(axis,offset) if sign==1 else (offset,axis)
            radius=sqrt(xx*xx+dd*dd)
            zz=.022+(.049 if radius<.032 else .049-(radius-.032)*.12 if radius<.101 else .040-(radius-.101)*.34)
            zz+=.0017 if idx%2 else 0
            pts.append((cx+xx,cd+dd,zz))
        T('뚜껑의 교차 대오리',pts,.0026,'lightreed' if sign>0 else 'edge',5)
hoop('뚜껑 바깥 테',cx,cd,.016,.154,1,.018,.004,'bark',25)
T('뚜껑 손잡이 고리',[(cx-.031,cd,.068),(cx-.023,cd,.090),(cx+.018,cd,.090),(cx+.031,cd,.068)],.007,'lightreed',8)
tea_service(-.269,.197);sauce(.175,-.239);utensils(-.344,-.011)

roots=[host,inside,table,meal,dessert]
bpy.context.view_layer.update()
for g in roots:
    offset=Matrix.Translation(Vector(g['preview_origin']))
    for obj in g.all_objects:
        center=sum((Vector(v) for v in obj.bound_box),Vector())/8
        obj.data.transform(Matrix.Translation(-center))
        obj.matrix_world=offset @ obj.matrix_world @ Matrix.Translation(center)
        obj.select_set(False)
    g['reference']='신세계센트럴시티 실내와 음식 사진 및 지점 방문 사진. 집기의 위치와 크기는 게임 점포에 맞춘 추정.'
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        space=a.spaces.active
        space.shading.color_type='MATERIAL'
        target=Vector((1.4,-10,1.05))
        space.region_3d.view_location=target
        space.region_3d.view_distance=27
        space.region_3d.view_rotation=(target-Vector((12,8,8))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(here/'restaurant.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
