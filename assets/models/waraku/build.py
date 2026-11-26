"""Build the public frontage, two induction settings, and meals at Famille 114."""
from math import cos,sin,pi,tau,sqrt
from pathlib import Path
from random import Random
import json
import os
import runpy
import sys
import subprocess

import bpy
from mathutils import Vector

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='파미에 114호 · 와라쿠샤샤'
scene.unit_settings.system='METRIC'
B,C,T=m.block,m.profile,m.rod
colors={
    'black':'24292c','lacquer':'272627','charcoal':'3b4240','seam':'888984','steel':'9da5a3',
    'silver':'c5cbc7','shine':'edf0e6','tin':'797f7a','glassEdge':'889d97','teal':'304942','jade':'466254',
    'wood':'b38a5b','oak':'c8a371','honey':'c89c60','grain':'b48958','brown':'8b6244','deep':'614735',
    'gold':'caa251','beige':'d7c8aa','warm':'e8dac0','paper':'f0ead9','wall':'e7dfca','earth':'b9ab91',
    'leather':'777368','stitch':'8e8779','seat':'4a4941','tile':'585b52','concrete':'77756f','concrete2':'74746e','tile2':'676a61','grout':'c7c1ae',
    'cream':'ede6d4','light':'fff3cd','red':'b34638','seal':'e04c40','brand':'f5f4fb','maroon':'723f36',
    'broth':'705138','soy':'372d29','noodle':'e2d6ac','noodleLight':'f0e0b7','bamboo':'d1bf89',
    'pork':'c97972','beef':'b85950','lean':'b7534d','fat':'ead6c4','whiteFat':'f2e2ce','leaf':'80965e',
    'lime':'a8ba7c','cabbage':'c4cfa0','rib':'e4dec0','tofu':'e5d8b3','fungus':'957c60','mush':'ddd0ab',
    'carrot':'d78c47','orange':'da9b4e','tempura':'c89549','golden':'dbac5f','crumb':'e8c27a','shrimp':'bb7652',
    'herb':'68905a','scallion':'a5ad6c','egg':'c9a079','navy':'4b608b','blue':'5878a5','ivory':'e6dfcf','yellow':'d9b951'}
for key,code in colors.items():
    m.palette[key]=m.material(key,code,.22 if key in ('steel','silver','tin') else 0.)
rng=Random(11427)
roots=[]

def group(name,parent):
    c=bpy.data.collections.new(name)
    parent.children.link(c)
    m.group=c
    return c

def assembly(name,x):
    c=group('와라쿠 · '+name,scene.collection)
    c['preview_origin']=(x,0,0)
    c['자료']='신세계 센트럴 와라쿠샤샤, 네이버 지도 파미에 114호, 2022·2025년 방문 사진. 게임 치수·상품 위치는 추정.'
    roots.append(c)
    return c

def drawable(name,xyz,faces,initial,others=()):
    ob=m.piece(name,xyz,faces,initial)
    for key in others:ob.data.materials.append(m.palette[key])
    return ob

def front(name,poly,d,color):
    return m.piece(name,[(x,d,z) for x,z in poly],[tuple(range(len(poly)))],color)

def smooth(obj):
    count=len(obj.data.polygons)
    for p in obj.data.polygons:p.use_smooth=p.index<count-2
    return obj

def orb(name,x,d,z,rx,rd,h,color,seg=14,levels=7):
    rings=[(max(rx*.012,rx*sin(pi*k/levels)),h*(1-cos(pi*k/levels))*.5) for k in range(levels+1)]
    return smooth(C(name,x,d,z,rings,color,seg,rd/rx))

def dish(name,x,d,z,r,h,color,seg=24,scale=1):
    rings=[(.49*r,0),(.50*r,.075*h),(.46*r,.14*h),(.58*r,.22*h),(.82*r,.49*h),
           (.982*r,.855*h),(r,.949*h),(.987*r,h),(.939*r,h),(.913*r,.867*h),
           (.77*r,.51*h),(.51*r,.252*h),(.12*r,.22*h)]
    return smooth(C(name,x,d,z,rings,color,seg,scale))

def flat_circle(name,x,d,z,r,color,n=24):
    return m.piece(name,[(x+r*cos(tau*i/n),d+r*sin(tau*i/n),z) for i in range(n)],[tuple(range(n))],color)

def torus(name,x,d,z,r,thick,color,seg=36):
    steps=6
    verts=[(x+(r+thick*cos(tau*j/steps))*cos(tau*i/seg),
            d+(r+thick*cos(tau*j/steps))*sin(tau*i/seg),z+thick*sin(tau*j/steps))
           for i in range(seg) for j in range(steps)]
    faces=[(i*steps+j,((i+1)%seg)*steps+j,((i+1)%seg)*steps+(j+1)%steps,i*steps+(j+1)%steps)
           for i in range(seg) for j in range(steps)]
    ob=m.piece(name,verts,faces,color)
    for p in ob.data.polygons:p.use_smooth=True
    return ob

def panel_line(name,x,d,z,width,depth,height,skin,edge):
    B(name+' 앞판',x,d,z,width,depth,height,skin)
    for dx in [-width/2+.009,width/2-.009]:
        B(name+' 세로 모서리',x+dx,d-depth/2-.003,z,.017,.009,height,edge)

def slab(name,x,d,z,w,dep,col,edge):
    B(name,x,d,z,w,dep,.021,col)
    for side in [-1,1]:
        B(name+' 다듬은 모서리',x,d+side*(dep/2-.005),z+.002,w,.010,.021,edge)

font_path=next((n for n in [os.getenv('GTW_KOREAN_FONT'),'/System/Library/Fonts/Supplemental/AppleGothic.ttf',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/nanum/NanumGothic.ttf'] if n and Path(n).is_file()),None)
if not font_path:raise RuntimeError('Set GTW_KOREAN_FONT to a Korean font to regenerate the small display and menu labels.')
ko=bpy.data.fonts.load(font_path)
def text(name,words,x,d,z,width,height,color='black'):
    cu=bpy.data.curves.new(name,'FONT');cu.body=words;cu.align_x='CENTER';cu.align_y='CENTER';cu.resolution_u=2;cu.font=ko
    ob=bpy.data.objects.new(name,cu);m.group.objects.link(ob);cu.materials.append(m.palette[color])
    ob.location=(x,-d,z);ob.rotation_euler=(pi/2,0,pi);bpy.context.view_layer.update()
    a=[p[0] for p in ob.bound_box];b=[p[1] for p in ob.bound_box]
    factor=min(width/max(.0001,max(a)-min(a)),height/max(.0001,max(b)-min(b)))
    ob.scale=(factor,)*3
    bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob.select_set(False)
    return ob

W,D=4.36,2.76
entrance=assembly('목재 창살과 열린 현관',0)
group('검은 머리띠와 왼쪽 통창',entrance)
B('상단 검은 상호 띠',0,0,2.42,W,.195,.392,'black')
B('빛을 받는 상부 인방',0,.003,2.819,W,.184,.046,'brown')
B('스모크 고창과 가는 금속 프레임',0,.034,2.863,W-.046,.092,.378,'deep')
for x in [-1.58,-.52,.55,1.59]:
    B('고창 황갈색 유리 빛',x,-.017,2.891,1.01,.012,.326,'earth')
for x in [-2.149,-1.247,-.690,.489,.847,2.142]:
    B('검은 창틀',x,.006,.019,.056,.135,2.399,'black')
# Positive local X is the left-hand window when facing the shop.
B('연한 석재 창간벽',.682,.026,.019,.332,.104,2.397,'wall')
B('기둥 위 작은 조명 상호 받침',.68,-.038,1.69,.157,.052,.155,'black')
B('창 아래 옅은 나무벽',1.493,.028,.014,1.30,.089,.673,'wood')
B('왼쪽 창문의 아랫틀',1.495,-.006,.687,1.32,.094,.036,'black')
B('창 중앙 선틀',1.464,.007,.69,.034,.084,1.74,'black')
B('오른쪽 쇼케이스 위 벽',-1.51,.071,2.206,1.27,.102,.199,'wall')
B('출입문 옆 좁은 안내벽',-.95,.026,.018,.494,.119,2.383,'wall')
for x0,x1 in [(.49,2.14),(-1.221,-.699)]:
    for i in range(round((x1-x0)/.057)):
        x=x0+.022+i*.057
        B('외벽 세로 원목 살',x,-.042,.046,.024,.045,.641,'oak')
    B('원목 살 위 가로대',(x0+x1)/2,-.038,.666,x1-x0,.047,.029,'wood')
    B('원목 살 아래 가로대',(x0+x1)/2,-.038,.061,x1-x0,.044,.025,'brown')
for x in [-.639,.434]:
    B('열린 문설주',x,.119,.014,.036,.27,2.354,'oak')
B('열린 미닫이 옆틀',-.622,.31,.018,.040,.143,2.31,'brown')
for j in range(5):
    B('옆으로 접힌 원목 문살',-.601,.288+j*.036,.058,.025,.017,2.23,'wood')
B('평평한 출입구 어두운 석재',-.10,.074,.005,1.07,.386,.016,'tile')
group('입구 가장자리의 노렌과 금붕어',entrance)
for x0,x1 in [(-.581,-.430),(.266,.394)]:
    verts=[];faces=[]
    for i in range(7):
        x=x0+(x1-x0)*i/6
        for level in [0,1]:
            verts.append((x,.215+.012*cos(pi*i),2.052+.327*level+.012*sin(i*.7)*(1-level)))
    faces=[(i*2,i*2+1,i*2+3,i*2+2) for i in range(6)]
    m.piece('옆으로 거둔 남색 노렌',verts,faces,'teal')
for x,z in [(-.52,2.185),(.341,2.127)]:
    front('노렌에 수놓은 금색 금붕어',[(x-.037,z),(x-.017,z+.013),(x+.008,z+.013),(x+.016,z+.005),
      (x+.035,z+.019),(x+.032,z-.014),(x+.015,z-.004),(x-.004,z-.017),(x-.022,z-.011)],.193,'gold')

brand=assembly('붓글씨 상호와 붉은 낙관',5)
source=json.loads((here/'wordmark.json').read_text())
for key,color in [('light','brand'),('seal','seal')]:
    curve=bpy.data.curves.new('와라쿠의 입체 상호 획 '+key,'CURVE');curve.dimensions='2D';curve.fill_mode='BOTH';curve.extrude=.0034
    width=1.72
    for ring in source[key]:
        spline=curve.splines.new('POLY');spline.points.add(len(ring)-1);spline.use_cyclic_u=True
        for pt,(x,y) in zip(spline.points,ring):
            pt.co=((x-source['w']/2)*width/source['w'],(source['h']/2-y)*width/source['w'],0,1)
    obj=bpy.data.objects.new('검정 바탕의 '+('흰 붓글씨' if key=='light' else '붉은 낙관'),curve)
    m.group.objects.link(obj);curve.materials.append(m.palette[color])
    obj.location=(0,.006,.168);obj.rotation_euler=(pi/2,0,pi)
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj.select_set(False)

group('작은 등표에 켠 흰 상호',brand)
for xx in [.559,.703]:B('작은 인장 옆의 불빛',xx,.064,-.724,.006,.004,.145,'light')
for zz in [-.725,-.587]:B('작은 인장 위아래 불빛',.631,.064,zz,.15,.004,.005,'light')
text('작은 등표의 일본어 붓글씨','しゃしゃ',.631,.061,-.654,.130,.050,'brand')

room=assembly('회색 바닥과 짙은 타일 식사 공간',10)
group('콘크리트 바닥과 연한 벽',room)
B('고운 콘크리트 바탕',0,D/2,.004,W-.045,D,.014,'tile')
for j in range(4):
    for i in range(4):
        x=(i-1.5)*1.064
        d=.355+j*.67
        B('넓은 바닥 판석',x,d,.018,1.060,.666,.005,['concrete','concrete2','concrete2','concrete'][(i+j)%4])
B('왼쪽 식사벽',2.135,D/2,.02,.064,D,2.853,'warm')
B('뒤쪽 실내벽',0,D-.042,.02,W-.061,.07,2.853,'warm')
B('쇼케이스가 기대는 오른쪽 벽',-2.144,D/2,.02,.051,D,2.848,'earth')
# Shield the actual neighboring gate column inside the shop's right-hand return.
B('쇼케이스 옆 안쪽 마감',-.803,1.055,.019,.064,1.69,2.84,'wall')
B('실내 앞쪽 천장',0,D/2,2.86,W-.031,D,.075,'wall')
B('벽을 타고 비추는 간접등 홈',2.068,1.49,2.751,.074,2.27,.084,'beige')
for row in range(3):
    for j in range(14):
        d=.124+j*.192
        B('짙은 벽 타일',2.092,d,.691+row*.157,.026,.185,.147,['tile','tile2','tile'][(j+row)%3])
for row in range(3):
    for j in range(10):
        x=2.06-j*.178
        B('뒤쪽으로 이어지는 타일',x,D-.083,.691+row*.156,.172,.026,.148,['tile2','tile','tile'][(row+j)%3])
for x in [.28,.522,.764]:
    B('손님 공간 끝의 가는 원목 살',x,D-.106,1.53,.038,.045,1.283,'oak')
for x in [1.20,1.70]:
    panel_line('두루마리 메뉴 포스터',x,D-.093,1.323,.354,.011,1.02,'paper','beige')
    B('포스터 위 나무봉',x,D-.107,2.344,.373,.020,.021,'brown')
    for k in range(8):
        B('포스터 세로 음식 글씨',x+.104-k*.022,D-.106,1.433+.045*(k%2),.006,.002,.21+.023*(k%3),'brown')
    for j in range(12):
        rad=.038+.008*(j%3);xx=x+(j%4-1.5)*.051;zz=2.084+(j//4-1)*.069
        front('국물과 면을 그린 벽 그림',[(xx+rad*cos(k*tau/11),zz+rad*.61*sin(k*tau/11)) for k in range(11)],D-.104-j*.0003,['broth','noodle','bamboo','beef'][j%4])
group('천장 원형 매입등 테두리',room)
for x,d in [(.05,.63),(.05,1.59),(.05,2.48),(1.49,1.13),(1.49,2.37)]:
    C('천장 매입등 개구부',x,d,2.844,[(.036,0),(.053,.006),(.048,.013)],'tin',18)

lamps=assembly('상부 간접 조명과 매입등',15)
B('벤치 위 길게 켜진 간접등',2.041,1.51,2.832,.026,2.30,.009,'light')
for x,d in [(.05,.63),(.05,1.59),(.05,2.48),(1.49,1.13),(1.49,2.37)]:
    C('따뜻한 백색 매입등',x,d,2.842,[(.034,0),(.041,.005)],'light',18)

def heating(x,d,z):
    # The round induction hob is flush with the tabletop. Retain the metal bezel and gold dial marks.
    C('원형 인덕션 금속 베젤',x,d,z,[(.150,0),(.152,.0009),(.149,.0027)],'steel',40)
    C('검은 전기조리 상판',x,d,z+.0025,[(.139,0),(.140,.0012),(.138,.0025)],'black',40)
    torus('금색 원형 눈금',x,d,z+.0055,.104,.0013,'gold',40)
    for i in range(5):
        theta=-1.15+i*.17
        xx=x+.111*cos(theta);dd=d+.111*sin(theta)
        B('인덕션의 작동 눈금',xx,dd,z+.005,.004,.003,.0015,'tin')
    for j in range(3):
        B('인덕션의 금색 표기',x,d-.014+j*.006,z+.005,.033-j*.004,.0013,.0012,'gold')

table=assembly('맞은편 의자와 두 개별 인덕션',20)
group('골직 등받이와 길게 이어지는 벤치',table)
B('벤치 하부 목재',.597,.005,.06,.338,1.63,.331,'deep')
for j in [-1,0,1]:
    d=j*.530
    B('폭신한 낮은 좌판',.58,d,.382,.477,.524,.103,'seat',.016)
    B('회색 골직 벤치의 등',.796,d,.466,.104,.525,.394,'leather',.025)
    for k in range(19):
        B('직조된 가로 골',.737,d,.503+.015*k,.003,.495,.0019,'stitch')
    T('덮개 가장자리의 박음선',[(.735,d-.245,.482),(.737,d-.245,.812),(.742,d-.227,.836)],.0026,'stitch',5)
group('원목 테이블과 맞은편 목재 의자',table)
for dx in [-.338,.338]:
    for dd in [-.479,.479]:B('각진 식탁 다리',dx,dd,.024,.059,.061,.701,'deep')
B('원목 식탁의 하부 프레임',0,0,.663,.822,1.077,.061,'brown')
B('원목 식탁 한 판',0,0,.724,.888,1.154,.045,'oak',.008)
for j in range(12):
    points=[(-.404+i*.099,-.557+j*.096+.004*sin(8*i+.3*j),.7695) for i in range(9)]
    T('상판의 가는 나뭇결',points,.00068,'wood',4)
for x,d in [(-.214,-.193),(.214,.209)]:heating(x,d,.7693)
# The opposing oak chair has a curved back, tapered legs, and an open space below its backrest.
for dx in [-.142,.146]:
    for dd in [-.168,.167]:
        T('목재 의자의 비스듬한 다리',[(-.576+dx*1.14,.178+dd*1.14,.027),(-.575+dx,.178+dd,.437)],.019,'brown',8)
B('식탁 앞 나무 의자 좌판',-.575,.178,.423,.356,.376,.039,'wood',.014)
for dd in [-.164,.164]:
    T('등받이로 올라가는 뒷다리',[(-.744,.178+dd,.043),(-.739,.178+dd,.44),(-.791,.178+dd,.826)],.019,'brown',9)
verts=[];faces=[]
for i in range(17):
    f=(i-8)/8
    x=-.804+.046*f*f
    for dd,z in [(-.018,.62),(.018,.62),(.018,.801-.029*f*f),(-.018,.801-.029*f*f)]:
        verts.append((x+dd,.178+f*.183,z))
for i in range(16):
    for j in range(4):faces.append((i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j))
faces.extend([(0,1,2,3),(64,65,66,67)])
m.piece('몸을 받치는 굽은 목제 등받이',verts,faces,'wood')

def bottle(x,d,h,r,col,lid):
    smooth(C('간장과 양념 병',x,d,0,[(r*.7,0),(r,.012),(r*.93,h*.6),(r*.52,h*.80),(r*.50,h*.88)],col,16))
    C('양념통 뚜껑',x,d,h*.875,[(r*.54,0),(r*.57,h*.1)],lid,14)

service=assembly('냅킨·수저통·보온 물병',25)
group('냅킨과 수저통',service)
B('양념을 올려놓는 검은 쟁반',0,.032,.001,.293,.136,.013,'black',.003)
B('티슈를 꽂은 원목 상자',-.087,.031,.014,.073,.09,.098,'wood')
for k in range(7):
    dx=(k-3)*.006
    pts=[(-.113+dx,.013,.111),(-.102+dx,.010,.173+k%3*.005),(-.075+dx,.035,.163),(-.068+dx,.044,.115)]
    m.piece('하얀 티슈 한 장',pts,[(0,1,2,3)],'paper' if k%2 else 'shine')
for x in [.070,.13]:
    B('사각 수저함',x,.071,.014,.058,.058,.096,'charcoal')
    B('열린 수저함 안쪽',x,.071,.109,.048,.048,.003,'black')
    for j in range(4):
        xx=x+(j%2-.5)*.012;dd=.07+(j//2-.5)*.012
        T('젓가락' if x<.1 else '숟가락 자루',[(xx,dd,.080),(xx+.012*(j-1.5),dd+.011*(j%3-1),.215+.01*(j%2))],.0033,'black' if x<.1 else 'silver',6)
        if x>.1:orb('타원형 숟가락',xx+.012*(j-1.5),dd+.011*(j%3-1),.199+.01*(j%2),.012,.005,.031,'steel')
group('물병과 작은 소스 병',service)
bottle(-.017,.02,.126,.024,'soy','red')
smooth(C('엎어 둔 스테인리스 물컵',.035,-.017,.015,[(.022,0),(.031,.007),(.024,.076),(.021,.079)],'silver',18))
smooth(C('보온병의 어깨와 좁은 목',-.208,.041,.003,[(.028,0),(.037,.006),(.038,.022),(.034,.12),(.026,.166),(.025,.196),(.029,.201)],'steel',24))
C('하늘색 보온병 뚜껑',-.208,.041,.204,[(.030,0),(.030,.008),(.026,.010)],'glassEdge',20)

def napa(x,d,z,size,heading,tone):
    v=[];faces=[]
    for j in range(8):
        along=j/7
        span=.43*(sin(pi*along)**.61+.028)*size
        for i in range(5):
            side=(i-2)/2
            wiggle=.09*sin(3.2*i+1.8*j+heading)
            xx=side*span*(1+wiggle)
            dd=(along-.39)*size
            zz=z+size*(.04+along*.23+.12*side*side+.035*sin(j+i*.9))
            v.append((x+xx*cos(heading)-dd*sin(heading),d+xx*sin(heading)+dd*cos(heading),zz))
    for j in range(7):
        for i in range(4):
            q=j*5+i
            faces.append((q,q+1,q+6,q+5))
    ob=drawable('주름진 배추 잎과 흰 줄기',v,faces,tone,['rib','cabbage'])
    for j,p in enumerate(ob.data.polygons):
        p.use_smooth=True
        p.material_index=1 if j%4 in (1,2) and j<18 else (2 if j%7==0 else 0)
    T('배추의 흰 잎맥',[v[j*5+2] for j in range(7)],size*.021,'rib',5)

def curl(x,d,z,r,length,spin=0):
    # A sliced roll has a real helical cross section and two irregular pale ribbons of marbling.
    steps=28
    def point(t,line,offset=0):
        angle=spin+tau*(.09+1.41*t)
        rr=r*(.23+.77*t)*(1+.045*sin(angle*3))
        return (x+rr*cos(angle),d+length*line,z+r+rr*sin(angle)+offset)
    vs=[point(i/steps,j-.5) for i in range(steps+1) for j in [0,1]]
    ob=drawable('둥글게 만 얇은 쇠고기',vs,[(2*j,2*j+1,2*j+3,2*j+2) for j in range(steps)],'beef',['pork'])
    for j,p in enumerate(ob.data.polygons):p.material_index=int(j%9==3);p.use_smooth=True
    for stripe in [-.27,.25]:
        verts=[]
        for j in range(steps+1):
            t=j/steps;aa=spin+tau*(.09+1.41*t)
            for sign in [-1,1]:
                p=point(t,stripe+.07*sin(2.8*aa)+.025*sign)
                verts.append((p[0]+.00042*cos(aa),p[1],p[2]+.00042*sin(aa)))
        m.piece('고기에 난 옅은 지방 줄무늬',verts,[(2*k,2*k+1,2*k+3,2*k+2) for k in range(steps)],'fat')
    T('말린 고기의 단면 가장자리',[point(k/steps,-.501) for k in range(steps+1)],r*.046,'pork',5)

def wide_noodle(name,curve,width=.0067,thickness=.0036):
    vertices=[];faces=[]
    pts=[Vector(q) for q in curve]
    for j,p in enumerate(pts):
        tangent=(pts[min(j+1,len(pts)-1)]-pts[max(0,j-1)]).normalized()
        side=tangent.cross(Vector((0,0,1))).normalized()
        up=side.cross(tangent).normalized()
        for k in range(8):
            t=tau*k/8
            vertices.append(tuple(p+side*(width*.5*cos(t))+up*(thickness*.5*sin(t))))
    for j in range(len(pts)-1):
        for k in range(8):
            q=8*j+k
            faces.append((q,8*j+(k+1)%8,8*(j+1)+(k+1)%8,q+8))
    faces.extend((tuple(reversed(range(8))),tuple(range(len(vertices)-8,len(vertices)))))
    ob=m.piece(name,vertices,faces,'noodleLight' if len(pts)%2 else 'noodle')
    for face in ob.data.polygons:face.use_smooth=True

def cork(name,x,d,z,r,color):
    return smooth(C(name,x,d,z,[(r*.76,0),(r,.006),(r*.90,.017)],color,12))

hotpot=assembly('쇠고기와 채소를 담은 스키야키 냄비',30)
group('양쪽 손잡이 무쇠 냄비',hotpot)
smooth(C('낮은 무쇠 전골 냄비',0,0,.001,[(.068,0),(.082,.006),(.103,.045),(.108,.069),
    (.108,.076),(.105,.081),(.099,.080),(.096,.069),(.089,.044),(.071,.013)],'charcoal',40))
torus('검은 무쇠 전골 테두리',0,0,.078,.104,.0036,'tin',40)
for sign in [-1,1]:
    T('구멍이 있는 무쇠 냄비 손잡이',[(sign*.097,-.032,.061),(sign*.121,-.031,.075),
      (sign*.128,-.023,.077),(sign*.128,.023,.077),(sign*.122,.032,.075),(sign*.098,.035,.063)],.0052,'charcoal',8)
flat_circle('채소 사이로 비치는 국물',0,0,.050,.089,'broth',32)
group('배추와 버섯 대파 두부',hotpot)
for j in range(12):
    a=j*.61
    napa(.048*cos(a)-.017,.043*sin(a),.055+.004*(j%3),.076+.009*(j%3),a,['rib','cabbage','lime'][j%3])
for j in range(3):
    napa(-.035+j*.022,.029,.080+j*.003,.090,1+j*.38,'leaf')
for j in range(2):
    x=.025+j*.027;d=.031-j*.018
    B('도톰하게 썬 두부',x,d,.073,.032,.023,.044,'tofu',.0008)
    for k in range(7):
        xx=x+rng.uniform(-.013,.013);dd=d+rng.uniform(-.010,.010)
        flat_circle('두부 표면의 작은 기포',xx,dd,.1175,.0008,'mush',5)
for j in range(9):
    a=j*2.399
    x=-.040+cos(a)*.011;dd=.021+sin(a)*.010
    T('가느다란 팽이 줄기',[(x,dd,.067),(x+.008,dd+.002,.097),(x+.01,dd+.008,.126+(j%3)*.003)],.0022,'mush',6)
    orb('팽이 갓',x+.01,dd+.008,.122+(j%3)*.003,.0048,.0048,.010,'cream',12)
orb('표고 갓',-.042,-.026,.076,.025,.021,.031,'fungus',20)
for a in [-.68,.68]:
    T('표고의 별모양 칼집',[(-.042+t*cos(a),-.026+t*sin(a),.105-.5*abs(t)) for t in [-.016,-.008,0,.008,.016]],.0016,'rib',5)
for j in range(6):
    a=tau*j/6
    orb('꽃 모양 당근의 둥근 끝',.051+.0095*cos(a),-.030+.0095*sin(a),.069,.007,.006,.006,'carrot',10)
flat_circle('꽃당근 가운데',.051,-.030,.076,.010,'carrot',12)
group('둥글게 만 쇠고기와 대파',hotpot)
for i in range(4):curl(.029+(i%2)*.021,-.042+(i//2)*.023,.075+(i%2)*.006,.015,.027,.4*i)
for i in range(4):
    x=-.011+i*.007
    C('어슷하게 썬 대파',x,.054,.077,[(.006,0),(.007,.011),(.005,.012)],['leaf','lime','cabbage'][i%3],10)

zaru=assembly('대나무 발의 수타 우동과 별도 소고기',35)
group('칠기 쟁반과 대나무 발',zaru)
B('붉은 테두리 칠기 면판',0,0,.001,.177,.215,.014,'maroon',.003)
B('발 밑 검은 받침',0,0,.013,.164,.201,.007,'lacquer')
for i in range(24):
    x=(i-11.5)*.0065
    T('가는 대나무 물빠짐 발',[(x,-.095,.023),(x,.095,.023)],.0026,'bamboo',6)
for d in [-.098,.098]:B('발 가장자리의 붉은 칠',0,d,.019,.174,.006,.009,'red')
group('발 위에 얹은 넓은 수타 가락',zaru)
for j in range(17):
    phase=j*2.39996
    points=[]
    for k in range(30):
        t=k/29
        x=.047*sin(t*tau*(.9+j%3*.09)+phase)+.014*sin(t*7.5+phase*.35)
        d=.066*(2*t-1)+.017*cos(t*10+phase)
        z=.029+j*.0008+.004*sin(t*pi)+.0023*cos(t*12+phase)
        points.append((x,d,z))
    wide_noodle('접혀 포개진 우동 한 가락',points,.0059+.0003*(j%3),.0036)
group('고기 접시와 푸른 무늬 달걀 종지',zaru)
B('쇠고기용 검은 접시',-.153,.003,.002,.105,.186,.010,'black',.004)
for dx in [-.175,-.148,-.122]:curl(dx,-.002,.016,.015,.089,1.6+.6*dx)
dish('달걀 종지',-.161,-.105,.003,.035,.011,'ivory',20)
torus('달걀 종지의 푸른 띠',-.161,-.105,.013,.034,.0012,'blue',24)
orb('껍질이 있는 달걀',-.161,-.108,.011,.021,.024,.032,'egg',20)
smooth(C('푸른 무늬 양념 종지',.099,.069,.002,[(.013,0),(.026,.006),(.029,.018),(.027,.021),(.022,.019),(.013,.009)],'ivory',18))
for k in range(5):orb('잘게 썬 파',.094+(k%3)*.006,.066+(k//3)*.007,.012,.0047,.0045,.006,'scallion',10)

group('국자 주둥이의 다시 병과 세 가지 반찬',zaru)
cx,cd=-.311,-.155
jug=smooth(C('소스를 붓는 청화 다시 병',cx,cd,.002,[(.018,0),(.029,.004),(.031,.020),(.029,.037),(.018,.066),(.016,.081),(.027,.111),
    (.028,.121),(.024,.122),(.023,.114),(.016,.093)],'ivory',24))
for j in range(6):
    aa=tau*j/6
    pts=[(cx+(.030-.008*t)*cos(aa+.35*sin(t*pi)),cd+(.030-.008*t)*sin(aa+.35*sin(t*pi)),.020+.047*t) for t in [0,.25,.5,.75,1]]
    T('청화 병의 코발트 물결',pts,.0019,'blue',6)
torus('다시 병의 푸른 입술',cx,cd,.123,.026,.0013,'navy',28)
front('병 끝의 가는 주둥이',[(cx-.021,.118),(cx-.034,.119),(cx-.029,.126),(cx-.018,.125)],cd-.016,'ivory')
dish('간장과 다시를 덜어 먹는 흰 그릇',-.277,.016,.002,.043,.027,'ivory')
torus('국물 종지의 파란 띠',-.277,.016,.029,.042,.0011,'blue',24)
flat_circle('종지 바닥에 남은 간장',-.277,.016,.014,.028,'soy',18)
for j in range(2):
    xx=-.187+j*.069;dd=-.194
    dish('푸른 찬 접시',xx,dd,.002,.031,.012,'ivory',20,.83)
    torus('찬 접시의 푸른 가장자리',xx,dd,.015,.029,.00085,'blue',20)
    for i in range(4):
        a=i*2.4
        orb('단무지와 절임 반찬',xx+.012*cos(a),dd+.010*sin(a),.009,.009,.007,.006,'yellow' if j==0 else 'leaf',9,4)
for j in range(2):
    T('옻칠한 젓가락',[(.133+j*.011,-.240,.008),(.134+j*.011,-.123,.013),(.135+j*.012,-.037,.016)],.002,'deep',6)

tempura=assembly('새우 두 마리를 올린 에비텐 우동',40)
group('청화 덮밥그릇과 두툼한 국수',tempura)
dish('푸른 무늬의 깊은 우동 그릇',0,0,.002,.105,.068,'ivory',36)
torus('그릇의 파란 테두리',0,0,.069,.103,.0015,'navy',40)
for j in range(12):
    a=j*tau/12
    verts=[]
    for k in range(10):
        t=k/9
        zz=.026+.038*t
        rr=.071+.029*t
        angle=a+.13*sin(t*pi)
        for edge in [-1,1]:
            b=angle+edge*(.015+.037*sin(pi*t))
            verts.append((rr*cos(b),rr*sin(b),zz))
    m.piece('청화 덩굴 무늬의 한 잎',verts,[(2*k,2*k+1,2*k+3,2*k+2) for k in range(9)],'navy')
flat_circle('갈색 다시 국물',0,0,.048,.090,'broth',32)
for j in range(11):
    points=[]
    for k in range(22):
        t=k/21;phase=j*.59
        angle=phase+t*2.13
        rr=.058+.013*sin(phase+t*pi)+.009*cos(8*t+j)
        points.append((rr*cos(angle),rr*sin(angle),.051+.003*t+.003*sin(11*t+j)))
    wide_noodle('다시 국물에 보이는 굵은 가락',points,.0061,.0035)

def shrimp(x,d,heading,h):
    steps,segs=14,12
    def local(side,along,z):
        return(x+side*cos(heading)-along*sin(heading),d+side*sin(heading)+along*cos(heading),z)
    vertices=[]
    for j in range(steps+1):
        t=j/steps;radius=(.004+.013*(sin(pi*(.06+t*.87))**.72))*(1-.35*t)
        for k in range(segs):
            a=tau*k/segs
            variation=1+.16*sin(4*a+2*j)+.11*sin(j*2.1+a)
            vertices.append(local(.008*sin(5*t)+radius*variation*cos(a),(t-.5)*.138,
                .058+h*t+.015*sin(pi*t)+radius*variation*sin(a)))
    faces=[(j*segs+k,j*segs+(k+1)%segs,(j+1)*segs+(k+1)%segs,(j+1)*segs+k)
           for j in range(steps) for k in range(segs)]
    faces.extend((tuple(reversed(range(segs))),tuple(range(steps*segs,len(vertices)))))
    ob=drawable('튀김옷을 입힌 긴 새우',vertices,faces,'golden',['tempura','crumb'])
    for f in ob.data.polygons:
        n=rng.random();f.material_index=0 if n<.69 else (1 if n<.895 else 2)
    for j in range(45):
        t=rng.uniform(.05,.93);side=rng.uniform(-.012,.012)
        xx,dd,zz=local(.008*sin(5*t)+side,(t-.5)*.138,.058+h*t+.015*sin(pi*t)+.010)
        orb('바삭한 튀김 부스러기',xx,dd,zz,.0025+rng.random()*.0019,.0027,.0047,['tempura','crumb','golden'][j%3],7,3)
    for s in [-1,1]:
        vs=[local(-.001,.061,.059+h),local(s*.012,.071,.075+h),local(s*.017,.086,.084+h),local(s*.013,.091,.085+h),local(s*.002,.083,.073+h)]
        m.piece('주황색 새우 꼬리',vs,[(0,1,2,3,4)],'shrimp')
group('튀김옷과 붉은 새우 꼬리',tempura)
shrimp(-.015,-.006,.49,.060)
shrimp(.023,.005,-.35,.053)
for i in range(12):
    a=i*2.4;rr=(i%4)*.005
    xx=-.041+rr*cos(a);dd=.027+rr*sin(a)
    napa(xx,dd,.060,.025,.93*i,'herb' if i%2 else 'leaf')
for i in range(9):
    a=i*2.399;x=-.038+.019*cos(a);d=-.022+.023*sin(a)
    torus('송송 썬 파 단면',x,d,.057+(i%3)*.002,.0036,.0012,'scallion',12)

cab=assembly('오른쪽 유리 견본장의 틀과 선반',45)
group('입구 옆 음식 견본장',cab)
B('검은 견본장 바닥',0,.014,.015,.927,.341,.126,'black')
B('견본장 뒷판',0,.175,.14,.926,.030,1.975,'charcoal')
for x in [-.454,.454]:B('견본장 측면 검은 세로틀',x,-.004,.131,.027,.366,1.996,'black')
for z in [.268,.590,.922,1.266,1.676,2.095]:
    slab('얇은 견본 선반',0,-.005,z,.895,.342,'wood','black')
for z in [.291,.611,.944,1.291]:
    B('유리 선반의 옅은 단면',0,-.176,z,.875,.008,.004,'glassEdge')
B('음식을 안내하는 영상 화면 외곽',0,.111,1.352,.603,.044,.254,'black')
B('안내 영상의 남색 배경',0,.081,1.368,.571,.005,.22,'navy')
text('안내 화면의 상호','와라쿠 샤샤',0,.076,1.488,.419,.056,'paper')
group('맨 위의 밝은 안내와 그릇',cab)
for x in [-.253,.208]:
    dish('상단의 작은 취급 그릇',x,.012,1.698,.075,.046,'ivory',20)
    torus('상단 그릇의 줄무늬',x,.012,1.743,.074,.0016,'navy',24)
B('상단 흰색 매장안내',0,.112,1.80,.394,.009,.130,'black')
text('점포 번호','114',0,.105,1.867,.176,.083,'paper')

samples=assembly('쇼윈도의 미니어처 우동과 고기 견본',50)
def sample(x,d,z,r,kind,lean=.73):
    existing=set(m.group.objects)
    dish('쇼윈도 음식 견본 그릇',x,d,z,r,.031,'ivory' if kind%2 else 'black',20)
    flat_circle('음식 견본의 국물',x,d,z+.025,r*.78,'broth',22)
    for j in range(9):
        a=j*2.399;rr=r*.51
        if kind%2:
            points=[(x+rr*.68*sin(a+k*.5),d+rr*cos(.5*a+k*.47),z+.026+j*.0007) for k in range(12)]
            T('견본 우동의 노란 면',points,.0029,'noodle',5)
        else:
            xx=x+rr*.65*cos(a);dd=d+rr*.56*sin(a)
            orb('견본용 채소와 연어',xx,dd,z+.025,.009,.007,.010,['orange','leaf','cream'][j%3],8,4)
    if kind==0:
        for j in range(3):
            napa(x-.018+j*.013,d+.009,z+.034,.033,j*.93,'cabbage' if j==1 else 'leaf')
        for j in range(2):curl(x+.020,d-.014+j*.018,z+.033,.009,.017,.6*j)
    elif kind==1:
        for j in range(2):
            xx=x-.023+j*.037
            T('밝은 튀김옷의 견본용 새우',[(xx-.015,d-.030,z+.044),(xx,d-.009,z+.047),(xx+.009,d+.017,z+.055)],.0066,'golden',8)
            front('견본용 새우 꼬리',[(xx+.005,z+.05),(xx+.016,z+.071),(xx+.021,z+.070),(xx+.016,z+.050)],d+.018,'shrimp')
    else:
        orb('연어덮밥 견본의 밥',x,d,z+.027,.051,.031,.014,'noodleLight',16,4)
        for j in range(5):
            xx=x-.032+j*.014
            v=[(xx+.004*t,d+side*.014+.006*sin(t*pi),z+.049+.001*cos(t*pi)) for t in [-1,0,1] for side in [-1,1]]
            m.piece('도톰한 연어 견본',v,[(0,1,3,2),(2,3,5,4)],'carrot')
            T('연어의 흰 줄무늬',[(xx-.002,d-.012,z+.051),(xx+.003,d+.011,z+.051)],.0008,'whiteFat',4)
        napa(x-.034,d+.020,z+.042,.03,.35,'herb')
    torus('견본 접시의 유약 띠',x,d,z+.031,r*.97,.0020,'navy' if kind%2 else 'tin',24)
    from mathutils import Matrix
    pt=Vector((x,-d,z))
    transform=Matrix.Translation(pt)@Matrix.Rotation(-lean,4,'X')@Matrix.Translation(-pt)
    for ob in set(m.group.objects)-existing:ob.matrix_world=transform@ob.matrix_world
group('가운데 두 단의 음식 견본',samples)
for j in range(2):
    for i in range(3):
        sample((i-1)*.249,-.036,.294+j*.335+.039,.088,(i+j)%3,.80-.12*j)
group('고기 모형과 검은 전골 견본',samples)
B('육류 견본의 검은 접시',.122,-.038,.954,.217,.130,.012,'black',.003)
for i in range(5):curl(.044+i*.038,-.046,.970,.018,.083,.37*i)
sample(-.235,-.022,.993,.099,0,.36)
B('위쪽 견본 안내 카드',.332,-.102,.955,.126,.013,.062,'paper')
for j in range(4):B('견본 카드의 검은 줄',.330,-.111,.963+j*.010,.096-j*.008,.003,.0028,'charcoal')

menu=assembly('회랑 쪽의 메뉴 받침',55)
group('검은 메뉴 판독대와 접힌 인쇄물',menu)
B('메뉴 받침의 바닥 발판',0,.013,.004,.304,.239,.022,'black',.006)
T('메뉴 받침 기둥',[(0,.022,.024),(0,.022,.862)],.021,'charcoal',12)
from mathutils import Matrix
pivot=Vector((0,0,.88))
newobjs=set(m.group.objects)
B('검은 판독판 가장자리',0,0,.88,.367,.019,.298,'black',.001)
for s in [-1,1]:
    B('펼친 메뉴 종이',s*.086,-.015,.891,.164,.005,.274,'paper')
    for i in range(2):
        for j in range(2):
            xx=s*.086+(i-.5)*.066;zz=1.060-j*.097
            front('인쇄한 음식 그림',[(xx+.026*cos(tau*k/20),zz+.019*sin(tau*k/20)) for k in range(20)],-.020,'broth')
            for k in range(4):
                a=k*tau/4
                front('인쇄한 고명',[(xx+.011*cos(a)+.007*cos(tau*n/8),zz+.008*sin(a)+.005*sin(tau*n/8)) for n in range(8)],-.021,['leaf','noodle','pork','carrot'][k])
            for k in range(2):
                B('메뉴의 손님 안내 인쇄',xx,-.021,zz-.031-.006*k,.044-.005*k,.002,.002,'brown')
text('펼친 메뉴의 표제','우동 · 스키야키',0,-.025,1.139,.263,.027,'black')
transform=Matrix.Translation(pivot)@Matrix.Rotation(.50,4,'X')@Matrix.Translation(-pivot)
for ob in set(m.group.objects)-newobjs:ob.matrix_world=transform@ob.matrix_world

glass=assembly('현관 통창과 음식 견본장 유리',60)
group('투명 유리판',glass)
for name,x0,x1,d,z0,z1 in [('왼쪽 창유리',.864,1.445,-.013,.735,2.403),('왼쪽 창유리',1.483,2.109,-.013,.735,2.403),
                            ('오른쪽 검은 견본장 문',-2.079,-1.225,-.258,.153,2.102)]:
    m.piece(name,[(x0,d,z0),(x1,d,z0),(x1,d,z1),(x0,d,z1)],[(0,1,2,3)],'glassEdge')

for c in roots:
    for ob in c.all_objects:ob.location+=Vector(c['preview_origin'])
bpy.data.fonts.remove(ko,do_unlink=True)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_location=(29,-.65,1.12)
        area.spaces.active.region_3d.view_distance=37.6
# Keep a second, assembled scene with the same local origins the game uses.
config=json.loads(subprocess.check_output(['node','--input-type=module','-e',
    'import {names,anchors} from '+json.dumps((here/'layout.js').as_uri())+';console.log(JSON.stringify({names,anchors}))']))
preview=bpy.data.scenes.new('114호 · 조명과 앞쪽 두 자리')
preview.unit_settings.system='METRIC'
preview.world=bpy.data.worlds.new('회랑의 약한 실내광')
preview.world.use_nodes=True
preview.world.node_tree.nodes.get('Background').inputs[0].default_value=(.44,.41,.35,1)
preview.world.node_tree.nodes.get('Background').inputs[1].default_value=.16
for key,where in config['anchors'].items():
    c=bpy.data.collections['와라쿠 · '+config['names'][key]]
    x,d,z=where
    instance=bpy.data.objects.new('114호 배치 · '+config['names'][key],None)
    preview.collection.objects.link(instance)
    instance.instance_type='COLLECTION';instance.instance_collection=c
    instance.location=Vector((x,-d,z))-Vector(c['preview_origin'])
    instance['web_part']=key
    if key=='glass':instance.hide_render=True
def area_light(label,position,target,power,tint,size,other=None):
    data=bpy.data.lights.new(label,'AREA');data.energy=power;data.color=tint;data.size=size
    if other is not None:data.shape='RECTANGLE';data.size_y=other
    else:data.shape='DISK'
    obj=bpy.data.objects.new(label,data);preview.collection.objects.link(obj)
    x,d,z=position;xx,dd,zz=target;obj.location=(x,-d,z)
    obj.rotation_euler=(Vector((xx,-dd,zz))-obj.location).to_track_quat('-Z','Y').to_euler()
for x,d in [(.05,.63),(.05,1.59),(.05,2.48),(1.49,1.13),(1.49,2.37)]:
    area_light('매입등의 따뜻한 직접광',(x,d,2.815),(x,d,.1),14,(1,.83,.63),.076)
area_light('벤치 위 숨은 간접등',(2.007,1.48,2.793),(2.09,1.49,1.65),47,(1,.80,.52),.061,2.16)
area_light('회랑에서 들어오는 부드러운 빛',(0,-2.16,2.42),(.28,1.64,1.13),98,(.92,.94,1),2.17,1.38)
area_light('견본장의 작은 상부등',(-1.65,-.14,2.08),(-1.65,-.09,.50),2.3,(1,.86,.64),.26)
bpy.context.window.scene=preview
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        reg=a.spaces.active.region_3d;reg.view_location=(0,-1.04,1.12);reg.view_distance=6.7
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'dining.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
