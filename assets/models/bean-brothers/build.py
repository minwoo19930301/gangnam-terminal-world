"""Rebuild the editable Famille FP203 cafe. Furniture is fitted to the game's existing shallow bay."""
from pathlib import Path
from math import cos, sin, pi
import runpy
import sys
import bpy
from mathutils import Matrix, Vector

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = '파미에 2F · 빈브라더스 FP203'
scene.unit_settings.system = 'METRIC'
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as model
root = bpy.data.collections.new('빈브라더스 · FP203 커피바와 좌석')
scene.collection.children.link(root)
# Each furnishing remains individually selectable inside its native subgroup.
def section(name):
    c = bpy.data.collections.new(name)
    root.children.link(c)
    model.group = c


for name,code,metal in (
    ('basalt','303030',.12),('nosings','48423e',.25),('steel','b5bbba',.67),('chrome','dadecf',.7),
    ('black','27282a',.16),('linen','e0d9c9',0),('tile','cfae87',0),('walnut','78563e',0),
    ('ash','ad8963',0),('leather','3d3938',0),('choco','513a31',0),('sugar','ddbe8c',0),
    ('coffee','694b39',0),('kraft','b18e65',0),('ruby','c28881',0),('chalk','e9e8de',0),
    ('milk','f0e5cd',0),('brass','a88958',.48),('tint','8aabaf',.3),('greens','676f5e',0)):
    model.palette[name] = model.material(name,code,metal)
B,C,T = model.block,model.profile,model.rod

section('01 · 검은 중앙 바')
B('걸레받이',-1.7,1.70,.01,5.84,1.25,.11,'black')
B('손님 쪽 화산석 전면',-1.7,1.13,.08,5.96,.19,.94,'basalt',.018)
B('장비 작업대',-1.7,1.78,.12,5.78,1.02,.76,'nosings')
B('얇은 검은 작업대 상판',-1.7,1.69,.87,5.97,1.37,.09,'basalt',.019)
for x in [-4.62,1.22]:
    B('화산석 측면',x,1.72,.08,.13,1.34,.94,'basalt',.015)
for x in [-3.65,-2.58,-1.50,-.42,.65]:
    B('직원 측 수납문',x,2.29,.18,.94,.035,.65,'black')
    B('수납 손잡이',x,2.322,.7,.23,.025,.028,'steel')
B('벽체를 감싸는 흰 기둥',-.85,2.42,.02,.97,.75,3.27,'chalk',.012)
for z in [1.37,2.44]:
    B('흰 기둥 수평 줄눈',-.85,2.037,z,.965,.008,.011,'linen')
B('브랜드 명판',-.85,2.018,1.76,.52,.027,.25,'black',.006)
# The photographs show several thin dark columns at the open frontage.
for x in [-6.82,-4.75,1.45,6.88]:
    for dx in [-.055,.055]:
        B('쌍각 강철 기둥',x+dx,.06,0,.063,.106,3.46,'black',.006)

section('02 · 에스프레소와 드립')
B('2그룹 머신 받침',-3.16,1.65,.963,1.01,.55,.06,'black',.018)
B('열교환기 본체',-3.16,1.79,1.02,1.02,.35,.365,'steel',.045)
B('추출 헤드 브리지',-3.16,1.565,1.245,1.03,.17,.15,'chalk',.03)
B('잔 데움 난간 아래',-3.16,1.76,1.382,.94,.38,.031,'black',.012)
for x in [-3.40,-2.97]:
    C('그룹 실린더',x,1.52,1.19,[(.077,0),(.084,.023),(.073,.08)],'chrome')
    T('포터필터',[(x,1.51,1.197),(x+.08,1.43,1.18),(x+.15,1.37,1.185)],.018,'black')
    for i in range(3):
        B('추출 조작 버튼',x+(i-1)*.042,1.47,1.318,.023,.012,.026,'black',.003)
# Pressure dial and the illuminated status LEDs sit above the drip tray.
ring = C('압력계 베젤',-3.17,1.478,1.288,[(.043,0),(.045,.010)],'black',22)
def turn_face(obj,x,d,z):
    origin=Vector((x,-d,z))
    obj.matrix_world=Matrix.Translation(origin) @ Matrix.Rotation(-pi/2,4,'X') @ Matrix.Translation(-origin)
turn_face(ring,-3.17,1.478,1.288)
dial=C('압력계의 상아색 눈금판',-3.17,1.465,1.288,[(.035,0),(.035,.003)],'milk',20)
turn_face(dial,-3.17,1.465,1.288)
T('압력 지침',[(-3.17,1.461,1.288),(-3.184,1.461,1.308)],.0026,'black',6)
for k in range(12):
    B('잔받침 배수 그릴',-3.6+.08*k,1.494,1.026,.015,.23,.012,'chrome')
T('구부러진 스팀 완드',[(-3.62,1.58,1.27),(-3.72,1.51,1.17),(-3.70,1.44,1.06)],.012,'chrome')

def cup(x,d,z,size=.94,color='milk'):
    r=.047*size
    C('도자기 잔',x,d,z,[(r*.67,0),(r*.83,.018*size),(r,.08*size),(r*.9,.085*size),(r*.82,.07*size)],color,16)
    T('잔손잡이',[(x+r*.90,d,z+.063*size),(x+r*1.60,d,z+.07*size),(x+r*1.64,d,z+.032*size),(x+r*.84,d,z+.029*size)],.008*size,color)
for i in range(5):
    x=-3.54+i*.18
    cup(x,1.77,1.417,.92)
    C('잔 안쪽의 굽',x,1.77,1.417+.071,[(.032,0),(.033,.001)],'linen',14)
for idx,x in enumerate([-4.27,-3.92]):
    B('그라인더 받침',x,1.75,.965,.24,.3,.035,'black',.012)
    C('원두분쇄기 몸체',x,1.80,1.0,[(.095,0),(.098,.19),(.065,.25)],'black',18)
    C('원두가 보이는 호퍼',x,1.8,1.25,[(.057,0),(.119,.115),(.116,.217),(.112,.226)],'coffee',18)
    C('호퍼 덮개',x,1.80,1.47,[(.118,0),(.121,.02),(.09,.032)],'black',18)
    B('분쇄 배출구',x,1.692,1.15,.085,.095,.07,'steel',.012)
for i,x in enumerate([-.53,-.12,.29]):
    C('드립 서버',x,1.47,.964,[(.055,0),(.087,.018),(.095,.09),(.068,.135),(.045,.158)],'tint',20)
    C('V형 도자기 드리퍼',x,1.47,1.12,[(.083,0),(.083,.014),(.032,.023),(.104,.135),(.091,.143)],'chalk',24)
    for j in range(8):
        a=j*pi/4
        T('드리퍼 골',[(x+.040*cos(a),1.47+.040*sin(a),1.165),(x+.097*cos(a+.2),1.47+.097*sin(a+.2),1.248)],.0028,'linen',5)
C('드립 주전자',.76,1.71,.967,[(.082,0),(.113,.045),(.103,.16),(.075,.21),(.037,.218)],'black')
T('구즈넥',[(.68,1.69,1.05),(.59,1.66,1.04),(.54,1.65,1.115),(.50,1.64,1.165)],.012,'steel')
T('주전자 손잡이',[(.835,1.71,1.145),(.91,1.71,1.175),(.93,1.71,1.07),(.86,1.71,1.04)],.013,'black')
section('03 · 패스트리 진열과 원두')
# A shelf and thin metal edge strips leave the display readable through the glass.
B('쇼케이스 받침',-1.89,1.47,.965,1.37,.50,.065,'black',.009)
for z in [1.045,1.244]:
    B('진열장 선반',-1.89,1.48,z,1.29,.44,.018,'linen')
for x in [-2.54,-1.24]:
    for d in [1.25,1.69]: B('가느다란 쇼케이스 모서리',x,d,1.04,.015,.015,.405,'steel')
for d in [1.25,1.69]: B('상단 유리 테두리',-1.89,d,1.445,1.32,.02,.014,'tint')
for x in [-2.54,-1.24]: B('상단 유리 측면',x,1.47,1.445,.016,.44,.014,'tint')
for i in range(4):
    x=-2.36+i*.30
    B('금속 쟁반',x,1.49,1.064,.275,.325,.016,'steel',.007)
    for j in range(2):
        d=1.44+.12*j
        C('구움과자',x,d,1.086,[(.067,0),(.079,.014),(.065,.036),(.025,.044)],'sugar' if i%2 else 'choco',16,.73)
        for k in range(3):
            C('쿠키 초콜릿',x-.035+.026*k,d+(.014 if k==1 else -.01),1.124,[(.006,0),(.009,.006)],'coffee' if i%2 else 'kraft',7)
    # Layered wedges keep their three fillings visible from the counter.
    for dz,h,col,scale in [(0,.027,'sugar',1),(.027,.022,'milk',.98),(.049,.026,'ruby',.95)]:
        pts=[(x-.090*scale,1.36,1.265+dz),(x+.092*scale,1.38,1.265+dz),(x-.013,1.57,1.265+dz)]
        model.piece('케이크 단면',pts+[(xx,dd,hh+h) for xx,dd,hh in pts],[(2,1,0),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],col)
    for k in range(2):
        C('작은 베리 토핑',x-.026+.042*k,1.445+.016*k,1.34,[(.015,0),(.017,.012),(.006,.025)],'ruby' if i%2 else 'choco',10)
    B('작은 메뉴 카드',x,1.24,1.085,.085,.009,.041,'chalk')
for i,x in enumerate([-.45,-.18,.09,.36,.63]):
    d=1.94
    w=.145;h=.236
    verts=[(x+a*w,d+b*.065,.965+z*h) for z,ratio in [(0,1),(1,.71)]
           for a,b in [(-.5*ratio,-.5),(.5*ratio,-.5),(.5*ratio,.5),(-.5*ratio,.5)]]
    model.piece('스탠딩 원두 봉투',verts,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],'kraft' if i%2 else 'linen')
    B('원두 포대 접힌 띠',x,d,1.184,.117,.039,.017,'black')
    B('원두 품목 라벨',x,d-.033,1.025,.075,.004,.079,['chalk','greens','ruby'][i%3])

section('04 · 검은 벤치와 목재 의자')
def stool(x,d):
    C('검은 원형 바 스툴',x,d,.68,[(.186,0),(.197,.017),(.185,.056)],'black',20)
    for ax in [-1,1]:
        for ay in [-1,1]:
            T('스툴 경사 다리',[(x+.14*ax,d+.14*ay,.02),(x+.095*ax,d+.095*ay,.685)],.014,'black')
        T('스툴 발받침',[(x-.118,d+ax*.12,.255),(x+.118,d+ax*.12,.255)],.01,'steel')

for x in [-5.97,-5.12]: stool(x,1.44)
B('왼쪽 바 좌석 상판',-5.65,2.04,.96,1.78,.47,.064,'walnut',.013)
for x in [-6.43,-4.88]:
    B('바 좌석 다리',x,2.08,.03,.08,.37,.93,'black')

for left,right in [(1.75,4.06),(4.10,6.69)]:
    x=(left+right)/2; w=right-left
    B('붙박이 좌석 프레임',x,2.51,.07,w,.61,.36,'black',.015)
    B('가죽 좌방석',x,2.50,.428,w-.02,.65,.1,'leather',.04)
    B('가죽 등받이',x,2.78,.50,w-.02,.115,.42,'leather',.033)
B('ㄱ자 벤치 반환부',6.47,1.77,.074,.56,.90,.36,'black',.018)
B('ㄱ자 좌방석',6.47,1.77,.428,.60,.93,.10,'leather',.035)
B('ㄱ자 등받이',6.72,1.77,.5,.1,.90,.42,'leather',.025)

def woodchair(x,d):
    B('물푸레나무 좌판',x,d,.427,.42,.43,.054,'ash',.018)
    B('좌석 아래 앞가로대',x,d+.13,.345,.38,.043,.085,'walnut')
    for side in [-1,1]:
        T('의자 앞다리',[(x+.20*side,d+.205,.014),(x+.158*side,d+.15,.435)],.022,'ash')
        T('등받이 지지대',[(x+.19*side,d-.188,.014),(x+.164*side,d-.172,.44),(x+.178*side,d-.255,.785)],.022,'ash')
        T('의자 측면 가로대',[(x+.17*side,d-.16,.35),(x+.17*side,d+.16,.35)],.018,'walnut')
    B('편평한 나무 등판',x,d-.23,.686,.416,.05,.106,'ash',.012)

for i,(x,d) in enumerate([(2.49,1.83),(3.98,1.83),(5.47,1.83)]):
    C('탁자 원반 받침',x,d,.018,[(.216,0),(.22,.023),(.175,.042)],'black',26)
    C('탁자 쇠기둥',x,d,.052,[(.036,0),(.036,.64)],'black',16)
    C('원형 테이블',x,d,.692,[(.34,0),(.355,.012),(.35,.04)],'ash' if i==1 else 'chalk',40)
    woodchair(x,d-.69)
    if i!=1:
        C('테이블 받침접시',x+.06,d,.735,[(.07,0),(.078,.007)],'chalk',20)
        cup(x+.06,d,.742,.81)
        C('커피 표면',x+.06,d,.808,[(.031,0),(.032,.002)],'coffee',22)
        for j in range(3):
            T('라테 무늬',[(x+.052,d-.018+j*.012,.811),(x+.063,d-.009+j*.012,.811),(x+.072,d-.02+j*.012,.811)],.0018,'milk',5)
B('옆 벽 벤치 테이블',6.06,1.65,.688,.42,.44,.049,'walnut',.01)
C('벤치 테이블 받침',6.06,1.65,.02,[(.13,0),(.14,.026),(.028,.054),(.028,.67)],'black')

section('05 · 천장과 벽 마감')
# Tiny spots and the skinny mouldings in the reference give depth to the white planes.
for x in [-5.9,-3.8,-1.7,.4,2.5,4.6,6.4]:
    for d in [.8,2.46]:
        C('매립등 테두리',x,d,3.35,[(.057,0),(.061,.014),(.058,.029)],'linen',12)
        C('따뜻한 조명 유리',x,d,3.342,[(.042,0),(.044,.01)],'milk',12)
for z in [.11,2.98,3.22]:
    B('흰 뒷벽 몰딩',0,2.907,z,14.65,.041,.047,'chalk',.005)
    B('벽 끝 몰딩',7.29,1.51,z,.036,2.77,.047,'chalk',.005)
for x in [1.69,4.33,6.98]:
    for h in [.99,2.71]:
        B('프레임 상하단',x-1.15,2.911,h,2.29,.047,.035,'linen',.004)
    B('프레임 세로 몰딩',x,2.91,1,.039,.047,1.73,'linen',.004)
for i in range(25):
    x=-7.19+i*.60
    B('마루 타일 줄눈',x,1.49,.021,.006,2.911,.004,'ash')
    for d in [.30+(i%3)*.36,1.91+(i%2)*.34]:
        B('타일 맞댐줄',x+.29,d,.021,.586,.008,.004,'ash')
# A source origin is at the public threshold, on the finished floor.
root['preview_origin']=(0.,0.,0.)
root['source']='빈브라더스 FP203 공식 매장 사진 · INTERNI & Decor 2023.3'
root['fit']='게임 점포 전면 약 14.9m·깊이 3m, 가구 치수·배치 추정'
bpy.context.view_layer.update()
for ob in root.all_objects:
    # A barista can reposition or rotate a cup about itself in the native scene.
    center=sum((Vector(v) for v in ob.bound_box),Vector())/8
    ob.data.transform(Matrix.Translation(-center))
    ob.matrix_world=ob.matrix_world @ Matrix.Translation(center)
    ob.select_set(False)
target=Vector((0,-1.1,.96))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        space=area.spaces.active
        space.shading.color_type='MATERIAL'
        space.region_3d.view_distance=12
        space.region_3d.view_location=target
        space.region_3d.view_rotation=(target-Vector((7,8,4))).to_track_quat('-Z','Y')
bpy.context.view_layer.update()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'fp203.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
