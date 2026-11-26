"""Native reconstruction of the public Seoul Gyeongbu ticket counter, AD-Gangnam 2024, p. 100."""
from math import cos, pi, sin
from pathlib import Path
from random import Random
import runpy

import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
TAU=2*pi
rng=Random(194100)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene;sc.unit_settings.system='METRIC'
sc['reference']='AD-Gangnam Seoul Bus Media Proposal 2024, page 100. Six 42-inch info TVs. Passenger-facing detail.'
sc['layout']='Counter width and number of service positions reconstructed for the game. Screen contents are examples.'

def group(name):
    c=bpy.data.collections.new(name);sc.collection.children.link(c)
    c['bundle']='ticket-counter';c['origin']=[0,0,0]
    return c

case=group('TicketOffice');windows=group('Glass');live=group('Lit')

def mat(name,h):
    m=bpy.data.materials.new(name);ch=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    m.diffuse_color=tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in ch)+(1,)
    return m

ivory=mat('상부 띠 · 따뜻한 백색','eeeae0');glow=mat('조명 · 따뜻한 백색','fff6dc')
dark=mat('리브 월 · 진한 남회색','252933');ridge=mat('리브 · 마루 하이라이트','343741')
black=mat('베젤 및 받침 · 고무','191e25');stone=mat('조리석 · 진회색 인조석','49504f')
slate=mat('창구 전면 · 회색 스테인리스','929995');lightsteel=mat('결 무늬 · 은빛','a0a69e')
bronze=mat('메탈 플린스 · 브론즈','928167');silver=mat('칸막이 고정 금속','ccd4d0')
smoke=mat('보호 칸막이 · 무색 유리','c2e3e8');smoke.diffuse_color=(*smoke.diffuse_color[:3],.12)
smoke.surface_render_method='DITHERED'
blue=mat('운행표 · 남색','173f67');azure=mat('출발 행 · 청색','28618f');yellow=mat('정보표 · 노랑','f1ce5d')
cream=mat('안내지','f8f1dd');white=mat('무인 결제 영수증','fffdfa')
leaf=mat('녹색 스킨답서스 잎','4e8057');mid=mat('무늬 스킨답서스 잎','91aa67');deep=mat('그늘진 잎','365e49')
purple=mat('자주빛 야경','514061');violet=mat('밤 여행 · 라벤더','9782ae')
aqua=mat('바다색','68b5b6');peach=mat('노을','e99b8a');mint=mat('도시광 · 옅은 민트','cde6bb')
navy=mat('짙은 밤하늘','223553');sand=mat('여행 포스터 · 크림','f7dfa1')
cyan=mat('서울시각 · 푸른 LED','d7efff');vermilion=mat('표시 · 주황','d2765f')

def mesh(name,pts,faces,materials,coll=case,ids=None):
    data=bpy.data.meshes.new(name);data.from_pydata([(x,-d,z) for x,d,z in pts],[],[tuple(reversed(f)) for f in faces]);data.update()
    for m in (materials if isinstance(materials,(list,tuple)) else [materials]):data.materials.append(m)
    if ids:
        for f,i in zip(data.polygons,ids):f.material_index=i
    o=bpy.data.objects.new(name,data);coll.objects.link(o)
    return o

def quad(name,pts,m,coll=case):
    return mesh(name,pts,[tuple(range(len(pts)))],m,coll)

def box(name,x,d,z,w,depth,h,m,coll=case):
    return mesh(name,[(x+sx*w/2,d+sd*depth/2,z+t*h) for t in [0,1] for sx,sd in [(-1,-1),(1,-1),(1,1),(-1,1)]],
                [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],m,coll)

def face(name,x,d,z,xy,m,coll=case):
    return quad(name,[(x+dx,d,z+dz) for dx,dz in xy],m,coll)

def disk(name,x,d,z,r,m,coll=case,n=18):
    return face(name,x,d,z,[(r*cos(k*TAU/n),r*sin(k*TAU/n)) for k in range(n)],m,coll)

def tube(name,path,r,m,n=6,coll=case):
    path=[Vector(pt) for pt in path];rows=[]
    for i,p in enumerate(path):
        t=(path[min(i+1,len(path)-1)]-path[max(0,i-1)]).normalized()
        a=t.cross(Vector((1,0,0)) if abs(t.x)<.83 else Vector((0,1,0))).normalized();b=t.cross(a)
        rows.append([p+r*(a*cos(k*TAU/n)+b*sin(k*TAU/n)) for k in range(n)])
    return loft(name,rows,m,coll)

def loft(name,rows,m,coll=case):
    n=len(rows[0])
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rows)-1) for i in range(n)]
    faces.extend([tuple(range(n-1,-1,-1)),tuple(range((len(rows)-1)*n,len(rows)*n))])
    return mesh(name,[p for row in rows for p in row],faces,m,coll)

def lathe(name,x,d,levels,m,n=18):
    return loft(name,[[(x+r*cos(k*TAU/n),d+r*sin(k*TAU/n),z) for k in range(n)] for z,r in levels],m)

def text(name,s,x,d,z,size,m,coll=case):
    f=bpy.data.curves.new(name,'FONT');f.body=s;f.align_x='CENTER';f.align_y='CENTER';f.resolution_u=4
    f.size=size;f.materials.append(m)
    a=bpy.data.objects.new(name,f);coll.objects.link(a)
    a.location=(x,-d,z);a.rotation_euler.x=pi/2
    dep=bpy.context.evaluated_depsgraph_get()
    obj=bpy.data.objects.new(name,bpy.data.meshes.new_from_object(a.evaluated_get(dep)));coll.objects.link(obj)
    obj.matrix_world=a.matrix_world.copy()
    bpy.data.objects.remove(a,do_unlink=True)

def panel(x,d,h,w,height,m,coll=case):
    return face('면 패널',x,d,h,[(-w/2,-height/2),(w/2,-height/2),(w/2,height/2),(-w/2,height/2)],m,coll)

# Counter and the fluted acoustic wall filmed behind it. End with a curved opening at each end.
width=9.62
box('창구 벽 · 수직 흡음 리브 바탕',0,-.038,.08,width,.11,2.81,dark)
for i in range(241):
    x=-4.79+i*.04
    box('수직 흡음 루버 · 가는 마루',x,.021,.08,.013,.014,2.67,ridge)
box('상부 파사드 · 아이보리',0,-.02,2.82,width+.21,.63,2.78,ivory)
box('상부 전면 · 무광 띠',0,.323,2.78,width+.22,.07,.50,ivory)
for i in range(11):
    box('상부 벽 · 이음',-4.7+i*.94,.300,3.38,.005,.005,2.15,slate)
for side in [-1,1]:
    x=side*(width/2-.065);radius=.22
    for k in range(8):
        a=k*pi/16;b=(k+1)*pi/16
        def q(t,r):
            return (x+side*r*cos(t),.357,2.58+r*sin(t))
        quad('상단 · 둥근 안쪽 반환 모서리',[q(a,radius),q(b,radius),q(b,radius+.13),q(a,radius+.13)],ivory)
    box('끝 기둥 · 흰색 덮개',side*(width/2+.18),-.02,.0,.21,.64,2.60,ivory)
box('하부 · 그림자 받침',0,.42,.02,width,.56,.092,black)
box('하부 · 청동색 걸레받이',0,.43,.072,width,.59,.095,bronze)
box('카운터 · 새틴 스테인리스 정면',0,.427,.167,width,.60,.773,slate)
for i in range(6):
    box('브러시 판 · 세로 결합선',-width/2+(i+1)*width/7,.731,.18,.008,.004,.75,stone)
# Two subdued strokes per plate, not a high-contrast striped texture.
for i in range(165):
    x=rng.uniform(-4.77,4.77);z=rng.uniform(.20,.72)
    box('재질 · 가는 금속 연마결',x,.729,z,.0018,.002,rng.uniform(.036,.15),lightsteel)
box('상판 아래 매입 조명',0,.74,.925,width-.10,.015,.018,glow,live)
box('상부 · 짙은 인조석 전면 턱',0,.432,.944,width+.028,.68,.077,stone)
box('상부 · 얇은 상판',0,.420,1.021,width+.044,.77,.029,stone)
# Six 42-inch info/ad panels alongside four sample departure-table panels, all with a separate bezel.
screen_w=.930;screen_h=.523;step=.947
ad_indices={0,1,4,7,8,9}
def travel_poster(i,x):
    ink=[violet,purple,aqua,peach,navy,mint][i%6]
    sky=[purple,navy,blue,purple,azure,navy][i%6]
    panel(x,.339,2.50,screen_w,screen_h,sky,live)
    disk('여행 그래픽 · 해',x+.22,.344,2.60,.082,sand,live,20)
    face('여행 그래픽 · 먼 능선',x,.345,2.50,[(-.462,-.16),(-.462,-.035),(-.30,.079),(-.21,.014),(-.12,.087),(.05,-.024),(.18,.048),(.28,.005),(.46,.056),(.46,-.16)],ink,live)
    if i%2==0:
        for k in range(9):
            sx=x-.43+k*.102;hh=.065+.024*((k*5+i)%5)
            box('여행 그래픽 · 도시 실루엣',sx,.348,2.346,.05,.004,hh,navy,live)
        for sx in [-.16,.16]:
            box('여행 그래픽 · 교각',x+sx,.351,2.34,.010,.001,.114,peach,live)
            for xx in [-.085,.085]:
                tube('여행 그래픽 · 교량 케이블',[(x+sx,.351,2.455),(x+sx+xx,.351,2.365)],.002,peach,4,live)
        box('여행 그래픽 · 교량 상판',x,.352,2.36,.53,.002,.009,peach,live)
    else:
        for k in range(4):
            face('여행 그래픽 · 물결',x,.349+k*.001,2.33+k*.018,[(-.45,0),(-.16,.009),(.03,.001),(.30,.012),(.45,.005),(.45,-.002),(.10,-.007),(-.20,0),(-.45,-.006)],ink,live)
    text('여행 그래픽 · 원본 일러스트','SEOUL  /  EXPRESS',x-.12,.353,2.675,.036,cream,live)
for i in range(10):
    x=(i-4.5)*step
    box('상단 인포 디스플레이 · 프레임',x,.267,2.225,.944,.116,.55,black)
    if i in ad_indices:
        travel_poster(i,x)
    else:
        panel(x,.337,2.50,screen_w,screen_h,blue,live)
        panel(x,.342,2.721,.91,.052,navy,live)
        panel(x,.344,2.659,.88,.040,yellow,live)
        text('안내 화면 · 헤더','DEPARTURES',x,.347,2.725,.032,sand,live)
        for j in range(5):
            panel(x,.344,2.59-j*.064,.88,.055,[blue,azure][j%2],live)
            for k in range(4):panel(x-.33+k*.21,.346,2.59-j*.064,.10,.012,cyan,live)
# The photographed fascia is a backlit circular T symbol with white TICKETS and dark Korean lettering.
tx=-.64;tz=3.03
tube('상호 · 원형 T 픽토그램',[(tx-.69+.107*cos(k*TAU/30),.372,tz+.107*sin(k*TAU/30)) for k in range(31)],.012,glow,7,live)
text('상호 · T','T',tx-.69,.374,tz,.165,glow,live)
text('상호 · 영문','TICKETS',tx-.05,.371,tz,.244,glow,live)
# Two small wall clocks below the TV line; game replaces their editable digits with Seoul's game time.
for x in [-2.75,1.65]:
    box('LED 시계 · 흑색 금속함',x,.051,1.75,.405,.079,.16,black)
    panel(x,.094,1.831,.375,.125,navy,live)
    text('네이티브 시계 표본','13:54',x,.119,1.83,.106,cyan,live)

def screen_frame(x,d,z):
    # Staff monitor angled back, alongside a much smaller low customer card terminal.
    box('업무 모니터 · 납작한 받침',x,d,z,.29,.18,.025,black)
    box('업무 모니터 · 타원 지주',x,d-.037,z+.025,.067,.052,.10,ridge)
    cy=z+.245
    pts=[(x-.224,d+.011,cy-.116),(x+.224,d+.011,cy-.116),(x+.224,d-.053,cy+.116),(x-.224,d-.053,cy+.116)]
    quad('모니터 · 얇은 검정 외함',pts,black)
    quad('모니터 · 푸른 회색 표면',[(x-.209,d+.013,cy-.100),(x+.209,d+.013,cy-.100),(x+.209,d-.046,cy+.100),(x-.209,d-.046,cy+.100)],dark)
    box('발권 프린터 · 본체',x-.36,d+.03,z,.192,.149,.079,silver)
    box('발권 프린터 · 출구',x-.36,d+.109,z+.043,.138,.006,.013,black)
    quad('승차권 · 밝은 용지 모서리',[(x-.413,d+.108,z+.048),(x-.311,d+.108,z+.048),(x-.312,d+.158,z+.041),(x-.414,d+.158,z+.041)],white)

def card_reader(x,d,z):
    w=.151;depth=.183
    pts=[(x+sx*w/2,d+sd*depth/2,z) for sx,sd in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    pts+= [(px,pd,z+(.072 if pd<d else .025)) for px,pd,_ in pts]
    mesh('고객 카드 단말 · 경사형 몸체',pts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(0,3,7,4)],dark)
    def top(pd):return z+.072-(pd-d+depth/2)*.047/depth
    def key(label,sx,sd,w,dt,m):
        quad(label,[(x+sx+ax*w/2,d+sd+ad*dt/2,top(d+sd+ad*dt/2)+.002) for ax,ad in [(-1,-1),(1,-1),(1,1),(-1,1)]],m)
    key('카드 단말 · 작은 고객 화면',0,-.039,.123,.071,azure)
    for j in range(3):
        for k in range(3):
            key('카드 단말 · 개별 숫자키',(k-1)*.042,.010+j*.025,.033,.018,[slate,slate,mint if j==2 else silver][k])
    box('카드 단말 · 삽입구',x,d+.093,z+.012,.10,.002,.006,black)

def partition(x):
    # The photo has two clear supports, a tubular crosspiece and an open handover gap below.
    for sx in [-.369,.369]:
        box('칸막이 · 나사 받침',x+sx,.40,1.05,.063,.105,.015,silver)
        tube('칸막이 · 금속 고정봉',[(x+sx,.40,1.065),(x+sx,.40,1.79)],.010,lightsteel,8)
    tube('칸막이 · 하단 가로봉',[(x-.369,.40,1.24),(x+.369,.40,1.24)],.010,silver,8)
    quad('창구 공용 · 투명 보호판',[(x-.366,.402,1.243),(x+.366,.402,1.243),(x+.366,.402,1.805),(x-.366,.402,1.805)],smoke,windows)
    box('유리 · 광택 나는 상단',x,.405,1.806,.734,.009,.009,lightsteel)
    for sx in [-.32,.32]:disk('유리 · 원형 체결구',x+sx,.411,1.275,.014,silver,n=10)

def plant(x,d,z):
    lathe('창구 화분 · 은색 원통',x,d,[(z,.075),(z+.013,.082),(z+.14,.095),(z+.15,.093)],slate)
    lathe('화분 · 흙',x,d,[(z+.148,.081),(z+.153,.081)],bronze)
    for j in range(17):
        a=rng.uniform(0,TAU);sz=rng.uniform(.075,.25);reach=rng.uniform(.044,.175)
        start=Vector((x,d,z+.148));tip=start+Vector((cos(a)*reach,sin(a)*reach,sz))
        middle=start+(tip-start)*.63+Vector((0,0,.027))
        tube('창구 식물 · 줄기',[start,middle],.0027,leaf,4)
        side=Vector((-sin(a)*.042,cos(a)*.042,0));crest=middle+Vector((0,0,.012))
        mesh('창구 식물 · 결이 접힌 잎',[tuple(middle-side*.83),tuple(tip),tuple(middle+side),tuple(start+(tip-start)*.38),tuple(crest)],
             [(0,1,4),(1,2,4),(2,3,4),(3,0,4)],[leaf,mid,deep],ids=[j%3,0,2,j%3])

def clerk(x,other=False):
    # Generic seated desk staff, reconstructed from the visitor-facing part of the reference.
    skin=skin2 if other else skin1
    d=.102; n=14
    def torso(name,levels,m):
        return loft(name,[[(x+rx*cos(k*TAU/n),d+rd*sin(k*TAU/n),z) for k in range(n)]
                           for z,rx,rd in levels],m)
    torso('직원 · 흰 셔츠',[(.82,.13,.080),(1.13,.137,.078),(1.35,.186,.083),(1.405,.121,.067)],ivory)
    torso('직원 · 남색 조끼',[(.88,.139,.082),(1.15,.144,.08),(1.350,.160,.085),(1.393,.096,.074)],navy)
    face('직원 · 셔츠 칼라',x,d+.083,1.369,[(-.065,.014),(0,-.073),(.058,.016)],ivory)
    face('직원 · 명찰',x+.074,d+.086,1.316,[(-.026,-.009),(.026,-.009),(.026,.009),(-.026,.009)],silver)
    torso('직원 · 목',[(1.381,.044,.040),(1.464,.045,.042)],skin)
    torso('직원 · 얼굴',[(1.423,.047,.050),(1.454,.081,.062),(1.51,.100,.074),(1.59,.102,.078),(1.63,.073,.065)],skin)
    torso('직원 · 머리',[(1.564,.099,.078),(1.601,.105,.081),(1.653,.081,.067),(1.675,.022,.02)],hair)
    # A separate hair silhouette and the pale face covering visible in the source photo.
    for side in [-1,1]:
        yy=1.493 if not other else 1.545
        tube('직원 · 옆머리',[(x+side*.086,d-.002,1.604),(x+side*.088,d-.013,yy)],.020,hair)
    face('직원 · 마스크',x,d+.076,1.508,[(-.091,.019),(0,.035),(.090,.014),(.070,-.051),(.009,-.067),(-.069,-.053)],white)
    for side in [-1,1]:
        disk('직원 · 눈',x+side*.038,d+.072,1.553,.0048,black,n=8)
        start=(x+side*.143,d+.005,1.343);elbow=(x+side*.202,d+.138,1.174)
        wrist=(x+side*(.155 if other else .195),d+.262,1.098)
        tube('직원 · 셔츠 소매',[start,elbow,wrist],.040,ivory,8)
        tube('직원 · 손',[(wrist[0],wrist[1],wrist[2]),(wrist[0]-.022,wrist[1]+.055,1.072)],.027,skin,8)

skin1=mat('직원 · 살구색','dca98d');skin2=mat('직원 · 구릿빛','bc8f73');hair=mat('직원 · 짙은 갈색 머리','353033')
clerk(-1.74);clerk(1.99,True)
for i,x in enumerate([-3.76,-1.88,0,1.88,3.76]):
    screen_frame(x-.08,.21,1.051);card_reader(x+.25,.65,1.052);partition(x+.30)
    # Acrylic number plaques sit against dark fluting behind the opening.
    box('창구 번호 · 검정 돌출판',x-.53,.06,1.35,.128,.068,.185,black)
    text('창구 번호',str(i+1),x-.53,.102,1.441,.107,ivory)
    if i in [0,2,4]:plant(x+.77,.205,1.05)
# Free-standing notice on two slim rods, plus a pump dispenser and A5 counter card.
x=-1.0;d=1.43
box('안내문 · 납작한 바닥 철판',x,d,.015,.26,.27,.021,stone)
for sx in [-.111,.111]:
    tube('안내문 · 두 지주',[(x+sx,d,.035),(x+sx,d,1.22)],.007,stone,6)
box('안내문 · 얇은 틀',x,d,1.03,.276,.025,.401,bronze)
panel(x,d+.014,1.231,.252,.377,cream)
box('상판 안내문 · 투명 받침',-4.42,.57,1.053,.25,.104,.010,silver)
box('상판 안내문 · 세운 카드',-4.42,.555,1.064,.24,.017,.263,ivory)
for j in range(5):box('상판 안내문 · 청색 줄',-4.42,.565,1.29-j*.035,.15+.015*(j%2),.002,.006,azure)
lathe('손 소독제 · 반투명 병',-4.08,.59,[(1.052,.035),(1.06,.046),(1.151,.046),(1.177,.02),(1.19,.015)],ivory)
tube('소독제 펌프', [(-4.08,.59,1.18),(-4.08,.59,1.223),(-4.122,.59,1.223)],.008,silver)
disk('소독제 라벨',-4.08,.636,1.107,.015,vermilion,n=8)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=9
        area.spaces.active.region_3d.view_location=(0,-.4,1.8)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'gyeongbu-ticket-office.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'))
