"""Public Goteo-Sebit lounge furniture, from Seoul's January 2026 photograph."""
import math
from pathlib import Path
from random import Random
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
scene.name = '고터·세빛 관광특구 라운지'
scene.unit_settings.system = 'METRIC'
for key, value, metal in [
    ('granite','bcb7ad',0), ('shadow','9d9b95',0), ('seam','999891',0),
    ('sky','a4bacb',0),('light','f5e3c5',0),('path','d39c73',0),('water','779cae',0),('park','738b73',0),('bridge','a97166',0),('white','f3f1e9',.10), ('red','bf2445',.20), ('red-edge','911f38',.12),
    ('alloy','acb1b4',.7), ('rubber','64655e',0), ('pot','eeece5',.14),
    ('soil','4e4638',0), ('grass','627547',0), ('blade','84915a',0),
    ('stalk','9c996d',0), ('cream','e4dac2',0), ('ivory','f0e3d0',0),
    ('pink','dfa7b2',0), ('blush','e7c2ba',0)]:
    m.palette[key] = m.material(key, value, metal)

def group(name, parent=None, offset=None):
    c = bpy.data.collections.new(name)
    (parent or scene.collection).children.link(c)
    if offset is not None:
        c['preview_origin'] = offset
    m.group = c
    return c

B, C, T = m.block, m.profile, m.rod
rng = Random(16771)
terrace = group('고터·세빛 라운지 · 계단식 휴게 좌석', offset=(0, 0, 0))
group('화강석 디딤단과 줄눈', terrace)
for n, (near, far) in enumerate([(0,.45),(.45,.90),(.90,2.68)]):
    h = (n+1)*.16
    B('석재 단 몸체',0,(near+far)/2,0,5.64,far-near,h-.016,'shadow')
    # Individual cut stones leave narrow recessed joints across the tread.
    for k in range(6):
        x = (k-2.5)*.94
        B('모서리를 연마한 디딤판',x,(near+far)/2,h-.017,.937,far-near-.002,.017,'granite',.003)
    if n < 2:
        for k in range(2):
            B('디딤단 앞 미끄럼방지 줄',0,near+.052+k*.018,h,5.58,.006,.0013,'seam')

group('곡면 일체형 의자와 낮은 붉은 좌석',terrace)
# One closed cross-section for the rolled front rim, scooped seat and folded back.
profile = [(-.37,.075),(-.37,.28),(-.355,.335),(-.33,.35),(-.304,.347),
           (-.268,.294),(-.208,.261),(-.08,.247),(.15,.245),(.235,.257),
           (.284,.30),(.302,.47),(.323,.545),(.36,.574),(.396,.571),
           (.426,.544),(.435,.50),(.435,.075),(.395,.045),(-.315,.045)]
def molded_seat(x, d, width):
    verts=[(x+sx*width/2,d+dd,.48+h) for sx in [-1,1] for dd,h in profile]
    n=len(profile)
    faces=[tuple(range(n)),tuple(reversed(range(n,2*n)))]
    faces.extend((j,n+j,n+(j+1)%n,(j+1)%n) for j in range(n))
    m.piece('백색 성형 좌석 · 말린 모서리와 등받이',verts,faces,'white',.013)
    B('그림자가 생기는 하부 받침',x,d+.015,.48,width*.89,.69,.062,'rubber',.014)

for x in [-1.44, 1.45]:
    molded_seat(x,1.56,.88)
B('붉은 벤치 하부 받침',-.405,1.57,.48,.93,.71,.085,'red-edge',.027)
B('붉은색 일체형 낮은 좌석',-.405,1.56,.54,1.00,.79,.221,'red',.045)

group('원형 탁자와 막대 다리',terrace)
for x,d in [(-.90,2.30),(1.78,2.35)]:
    C('원형 바닥 고정판',x,d,.48,[(.112,0),(.124,.013),(.102,.022)],'alloy',18)
    C('탁자받침과 흰 기둥',x,d,.495,[(.060,0),(.041,.05),(.025,.09),(.025,.64),(.073,.67)],'white',14)
    C('얕게 말린 원형 탁상',x,d,1.16,[(.072,0),(.217,.017),(.245,.027),(.247,.04),(.230,.047)],'white',26)

group('옆 난간과 받침',terrace)
for d,z in [(.29,.16),(1.15,.48),(2.47,.48)]:
    C('난간 바닥 플랜지',2.77,d,z,[(.071,0),(.069,.014)],'alloy',12)
    end=.78+min(d/1.15,1)*.48
    T('난간 원형 기둥',[(2.77,d,z),(2.77,d,end)],.022,'alloy',8)
for h in [.78,.48]:
    T('양단을 말아 마감한 손잡이',[(2.77,.16,h+.063),(2.77,.18,h+.073),(2.77,1.15,h+.48),
                               (2.77,2.51,h+.48),(2.77,2.55,h+.465)],.024,'alloy',9)

plant = group('고터·세빛 라운지 · 꽃이삭 화분',offset=(5.2,0,0))
group('흰 장방형 플랜터',plant)
B('낮은 그림자 받침',0,0,0,.98,.56,.046,'rubber',.014)
B('플랜터 바닥',0,0,.037,1.11,.67,.047,'pot',.009)
for side in [-1,1]:
    B('광택이 있는 긴 측면',0,side*.323,.069,1.11,.027,.205,'pot',.008)
    B('플랜터 짧은 측면',side*.542,0,.069,.027,.63,.205,'pot',.008)
B('상토',0,0,.20,1.058,.616,.044,'soil',.005)

def ribbon(name,points,widths,theta,color):
    # A triangular fold gives slender leaves a highlight at grazing angles.
    c,s=math.cos(theta),math.sin(theta)
    vert=[]
    for (x,d,z),w in zip(points,widths):
        vert.extend([(x-c*w,d-s*w,z),(x-s*w*.27,d+c*w*.27,z+.002),(x+c*w,d+s*w,z)])
    faces=[]
    for i in range(len(points)-1):
        a=i*3
        faces += [(a,a+1,a+4,a+3),(a+1,a+2,a+5,a+4)]
    return m.piece(name,vert,faces,color)

group('관상풀 잎과 이삭',plant)
for cluster in range(13):
    cx=(cluster%5-2)*.19+rng.uniform(-.043,.043)
    cd=(cluster//5-1)*.17+rng.uniform(-.04,.04)
    for i in range(13):
        theta=rng.random()*math.tau
        c,s=math.cos(theta),math.sin(theta)
        span=rng.uniform(.15,.33); h=rng.uniform(.31,.67)
        pts=[(cx+span*c*t**1.65,cd+span*s*t**1.65,.244+h*t*(1-.19*t)) for t in [0,.45,.76,1]]
        ribbon('활처럼 휜 좁은 풀잎',pts,[.009,.023,.017,.0005],theta+math.pi/2,'grass' if i%3 else 'blade')
    for spike in range(3):
        theta=rng.random()*math.tau; c,s=math.cos(theta),math.sin(theta)
        height=rng.uniform(.34,.58)
        side=rng.uniform(.08,.20)
        x,d,z=cx+side*c,cd+side*s,.244+height
        T('가는 이삭 줄기',[(cx,cd,.242),(cx+side*.4*c,cd+side*.4*s,.24+height*.61),(x,d,z)],.004,'stalk',4)
        length=rng.uniform(.20,.34); spread=rng.uniform(.028,.047)
        tone=rng.choice(['ivory','cream','blush','pink'])
        # A closed tapered panicle reads from across the passage; short, open
        # side-bracts catch the light individually when inspecting a planter.
        levels=[(0,.10),(.18,.59),(.43,.82),(.66,.69),(.85,.43),(1,.02)]
        v=[]; faces=[]; seg=7; lean=rng.uniform(.075,.16)
        for j,(t,r) in enumerate(levels):
            for k in range(seg):
                az=k*math.tau/seg+j*.21
                v.append((x+c*lean*t**1.25+math.cos(az)*r*spread,
                          d+s*lean*t**1.25+math.sin(az)*r*spread,z+t*length))
        faces=[(j*seg+k,j*seg+(k+1)%seg,(j+1)*seg+(k+1)%seg,(j+1)*seg+k)
               for j in range(len(levels)-1) for k in range(seg)]
        m.piece('부드럽게 휘어진 원뿔형 꽃이삭',v,faces,tone)
        for k in range(11):
            az=k*2.4+theta; dx,dd=math.cos(az),math.sin(az)
            t=.06+(k%5)*.124
            points=[(x+c*lean*(t+h)**1.25+dx*spread*dist,d+s*lean*(t+h)**1.25+dd*spread*dist,
                     z+length*(t+h)) for h,dist in [(0,.18),(.17,.79),(.28,1.04),(.38,1.10)]]
            ribbon('이삭 끝으로 퍼지는 가는 까락',points,[.002,.006,.003,.0003],az+math.pi/2,tone)

media=group('고터·세빛 라운지 · 벽면 투사와 조명 레일',offset=(11.5,0,0))
group('원화 · 해질 무렵의 한강',media)
# The press shows a portrait projection, but the event programme changes.
# These original editable colour fields evoke the adjacent riverside at sunset.
B('세로로 투사한 밝은 하늘',0,0,1.06,.90,.008,1.49,'sky')
def shape(name,profile,depth,color):
    m.piece(name,[(xx,depth,zz) for xx,zz in profile],[tuple(range(len(profile)))],color)
shape('진한 나무와 강변의 실루엣',[(-.45,1.74),(-.45,1.90),(-.35,1.87),(-.29,1.95),(-.18,1.90),
      (-.10,1.94),(.03,1.88),(.12,1.92),(.25,1.85),(.32,1.88),(.45,1.83),(.45,1.74)],-.007,'park')
shape('수면',[(-.45,1.07),(.45,1.07),(.45,1.795),(-.45,1.745)],-.011,'water')
shape('강변 산책로',[(-.45,1.07),(.45,1.07),(.45,1.36),(.25,1.49),(.14,1.56),(.28,1.62),
     (.45,1.65),(.45,1.70),(.24,1.68),(.08,1.61),(.04,1.53),(.13,1.43),(.23,1.32),(.06,1.23),(-.31,1.17)],-.015,'path')
sun=[(.22+.115*math.cos(i*math.tau/26),2.196+.115*math.sin(i*math.tau/26)) for i in range(26)]
shape('낮게 뜬 해',sun,-.008,'light')
for yy,x0,x1 in [(1.24,-.41,-.24),(1.32,-.40,-.22),(1.45,-.22,-.09),(1.65,-.34,-.14)]:
    B('수면 위 햇빛', (x0+x1)/2,-.020,yy,x1-x0,.003,.008,'light')
B('교량 상판',0,-.018,1.792,.90,.005,.013,'bridge')
for x in [-.30,.02,.32]:
    B('교각',x,-.017,1.71,.016,.005,.085,'bridge')
    T('다리 아치',[(x-.16,-.018,1.801),(x-.12,-.018,1.839),(x-.062,-.018,1.874),(x,-.018,1.882),
                    (x+.07,-.018,1.868),(x+.12,-.018,1.837),(x+.15,-.018,1.801)],.005,'bridge',4)
group('천장 매달림과 백색 조명통',media)
B('레일',0,-.77,3.29,5.68,.046,.052,'white')
for xx in [-2.19,0,2.19]:
    T('레일 현수봉',[(xx,-.77,3.34),(xx,-.77,3.78)],.009,'alloy',7)
for xx in [-2.36,-1.16,.06,1.28,2.46]:
    B('레일 어댑터',xx,-.77,3.244,.12,.068,.05,'alloy',.006)
    C('원통형 조명과 하부 광원',xx,-.77,3.043,[(.047,0),(.065,.014),(.065,.17),(.045,.19)],'white',16)
    C('따뜻한 확산판',xx,-.77,3.041,[(.049,0),(.059,.003)],'light',16)

bpy.context.view_layer.update()
for subject in [terrace, plant, media]:
    offset=Matrix.Translation(Vector(subject['preview_origin']))
    for obj in subject.all_objects:
        center=sum((Vector(p) for p in obj.bound_box),Vector())/8
        obj.data.transform(Matrix.Translation(-center))
        obj.matrix_world=offset @ obj.matrix_world @ Matrix.Translation(center)
        obj.select_set(False)
    subject['reference']='서울시 2026년 1월 라운지 사진. 개별 점의 좌표·치수·식물 종은 미실측.'
target=Vector((.6,-1,.52))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        view=area.spaces.active
        view.shading.color_type='MATERIAL'
        view.region_3d.view_distance=10
        view.region_3d.view_location=target
        view.region_3d.view_rotation=(target-Vector((5.5,8.2,4.1))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(here/'lounge.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
