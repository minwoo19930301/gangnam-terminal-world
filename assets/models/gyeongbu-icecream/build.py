"""Rebuild the Gyeongbu branch scoop counter, cake freezer, order kiosks and seating."""
from math import cos, pi, sin, sqrt
from pathlib import Path
from random import Random
import runpy

import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
TAU=2*pi
rng=Random(19431)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['branch_photos']='https://m.blog.naver.com/nanine0516/224348409701 and https://m.blog.naver.com/tlsendud7/224327454997'
scene['layout']='Existing 1F storefront. Relative positions follow entry photos. Sizes, cake stock and kiosk screens are approximate.'

def material(name,hex_value):
    channel=[int(hex_value[i:i+2],16)/255 for i in (0,2,4)]
    mat=bpy.data.materials.new(name)
    mat.diffuse_color=tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in channel)+(1,)
    return mat

def collection(name):
    coll=bpy.data.collections.new(name);scene.collection.children.link(coll)
    coll['bundle']='scoop-parlor';coll['origin']=[0,0,0]
    return coll

solid=collection('Parlor');glass=collection('Glass');lit=collection('Lit');body=solid
oak=material('꿀빛 오크','ce9766');birch=material('밝은 자작나무','e6b981')
walnut=material('오크 홈의 그늘','925d42');rose=material('딸기 분홍','ee79ab')
hot=material('무인 결제 단말 분홍','d94392');shell=material('우유색 법랑','fcf2dd')
char=material('냉장고 검정 프레임','272a32');steel=material('새틴 스테인리스','a8b9bd')
chrome=material('은백색 압출물','e5e9dd');slate=material('냉장고 내부','697d88')
ice=material('냉장고 조명','e7faff');slat=material('핑크 벽 루버','d87c94')
sofa=material('회갈색 벤치 패드','aa9e8c');aqua=material('앱 하늘색','53d3ed')
blue=material('BR 청색','165595');amber=material('와플콘','d59a5c')
leaf=material('피스타치오','a8c98b');mint=material('민트','8ecab0')
berry=material('베리 리본','b74666');lilac=material('블루베리 크림','9e92c6')
pink=material('딸기 크림','f4acc2');vanilla=material('바닐라','f6e2aa')
cocoa=material('초콜릿','805541');crumb=material('쿠키 조각','4b3a38')
peel=material('감귤색','ffc75d');coral=material('다홍색 체리','e24b55')
pane=material('하부장 곡면 유리','d1ecf1')
pane.diffuse_color=(*pane.diffuse_color[:3],.12)
pane.surface_render_method='DITHERED'
offset=(0,0);angle=0

def point(x,d,h):
    ox,od=offset
    return (ox+x*cos(angle)-d*sin(angle),-(od+x*sin(angle)+d*cos(angle)),h)

def mesh(name,pts,faces,mats,ids=None,coll=None,smooth=False):
    coll=coll or body
    data=bpy.data.meshes.new(name);data.from_pydata([point(*p) for p in pts],[],faces);data.update()
    if not isinstance(mats,(list,tuple)):mats=[mats]
    for m in mats:data.materials.append(m)
    for i,f in enumerate(data.polygons):
        if ids:f.material_index=ids[i]
        f.use_smooth=smooth
    obj=bpy.data.objects.new(name,data);coll.objects.link(obj)
    return obj

def quad(name,pts,mat,coll=None):
    return mesh(name,pts,[tuple(range(len(pts)))],mat,coll=coll)

def box(name,x,d,z,w,depth,h,mat):
    pts=[(x+sx*w/2,d+sd*depth/2,z+top*h) for top in [0,1] for sx,sd in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return mesh(name,pts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat)

def loft(name,rows,mats,ids=None,cap=True,smooth=False):
    n=len(rows[0]);faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rows)-1) for i in range(n)]
    if cap:
        faces.extend([tuple(range(n-1,-1,-1)),tuple(range((len(rows)-1)*n,len(rows)*n))])
        if ids:ids=ids+[0,0]
    return mesh(name,[p for row in rows for p in row],faces,mats,ids,smooth=smooth)

def cylinder(name,x,d,levels,mat,n=16):
    return loft(name,[[(x+r*cos(k*TAU/n),d+r*sin(k*TAU/n),z) for k in range(n)] for z,r in levels],mat)

def rod(name,path,r,mat,n=6):
    p=[Vector(pt) for pt in path];rows=[]
    for i,v in enumerate(p):
        t=(p[min(i+1,len(p)-1)]-p[max(i-1,0)]).normalized()
        a=t.cross(Vector((1,0,0)) if abs(t.x)<.83 else Vector((0,1,0))).normalized();b=t.cross(a)
        rows.append([v+r*(a*cos(k*TAU/n)+b*sin(k*TAU/n)) for k in range(n)])
    return loft(name,rows,mat)

def plaque(name,x,d,z,w,h,background):
    return box(name,x,d,z-h/2,w,.014,h,background)

def disk(name,x,d,z,rx,rz,mat,n=16):
    return quad(name,[(x+rx*cos(k*TAU/n),d,z+rz*sin(k*TAU/n)) for k in range(n)],mat)

def text(name,words,x,d,h,size,mat):
    curve=bpy.data.curves.new(name,'FONT');curve.body=words;curve.align_x='CENTER';curve.align_y='CENTER'
    curve.size=size;curve.resolution_u=4;curve.materials.append(mat)
    obj=bpy.data.objects.new(name,curve);body.objects.link(obj)
    obj.location=point(x,d,h);obj.rotation_euler=(pi/2,0,-angle)
    deps=bpy.context.evaluated_depsgraph_get()
    data=bpy.data.meshes.new_from_object(obj.evaluated_get(deps))
    baked=bpy.data.objects.new(name,data);body.objects.link(baked);baked.matrix_world=obj.matrix_world.copy()
    bpy.data.objects.remove(obj,do_unlink=True)

def graphic(x,d,z,scale,flavour):
    quad('그래픽 · 와플콘',[(x-.11*scale,d,z),(x+.11*scale,d,z),(x-.008*scale,d,z-.30*scale)],amber)
    for i,(sx,sz,r) in enumerate([(-.046,.038,.075),(.037,.04,.081),(0,.095,.079)]):
        disk('그래픽 · 스쿱',x+sx*scale,d+.002+i*.001,z+sz*scale,r*scale,r*.91*scale,flavour)
    for j in [-1,1]:
        rod('그래픽 · 와플 선',[(x+j*.061*scale,d+.003,z-.013*scale),(x-j*.022*scale,d+.003,z-.17*scale)],.004*scale,vanilla,4)

def cream_tub(x,d,z,r,palette,phase,chips):
    # Build the recessed, circular surface in rings, with a scooped-out trough and two ribbons.
    n=26;rows=[];ids=[]
    def height(s,a):
        gouge=.026*(1+sin(a+phase))*.50*(1-s*.4)
        return z+.025*(1-s*s)-gouge+.008*sin(9*s+2*a+phase)*s
    for i,s in enumerate([.018,.22,.42,.58,.76,.93,1]):
        row=[]
        for k in range(n):
            a=k*TAU/n
            row.append((x+r*s*cos(a),d+r*s*sin(a),height(s,a)))
            if i<6:
                swirl=sin(11*s+2*a+phase)+.31*cos(a*3-phase)
                ids.append(1 if swirl>.65 else 2 if swirl<-.88 else 0)
        rows.append(row)
    loft('스쿱 통 · 퍼낸 아이스크림과 리본',rows,palette,ids,cap=False)
    ring=[(x+r*1.035*cos(k*TAU/n),d+r*1.035*sin(k*TAU/n),z+.021) for k in range(n+1)]
    rod('원통형 스테인리스 아이스크림 통 림',ring,.006,chrome,5)
    for j in range(chips):
        s=.85*sqrt(rng.random());a=rng.uniform(0,TAU);px=x+r*s*cos(a);pd=d+r*s*sin(a);pz=height(s,a)
        b=rng.uniform(0,TAU);r2=rng.uniform(.008,.014)
        pts=[(px+r2*cos(b+t*TAU/3),pd+r2*.75*sin(b+t*TAU/3),pz+.002) for t in range(3)]
        pts.append((px,pd,pz+.009));mesh('토핑 · 쿠키·견과 조각',pts,[(0,1,3),(1,2,3),(2,0,3)],crumb if j%3 else palette[1])

# A white rolled edge, curved guard, pink chevron and diagonal battens run along the right-hand display.
offset=(2.63,1.23);angle=pi/2
length=3.22
box('쇼케이스 · 검은 걸레받이',0,0,.02,length,.80,.11,char)
box('쇼케이스 · 우드 전면',0,.01,.11,length,.81,.71,oak)
for j in range(39):
    x=-length/2+j*.098
    x0=max(-length/2,x-.35);x1=min(length/2,x)
    if x1<=x0:continue
    z0=.13+(x0-(x-.35))/.35*.68;z1=.13+(x1-(x-.35))/.35*.68
    rod('전면 · 사선 목재 홈',[(x0,.42,z0),(x1,.42,z1)],.005,walnut,4)
quad('쇼케이스 · 핑크 사선 패널',[(-.51,.43,.12),(.22,.43,.12),(-.14,.43,.81),(-.88,.43,.81)],rose)
box('쇼케이스 · 백색 하단 턱',0,.05,.812,length+.035,.90,.065,shell)
box('쇼케이스 · 냉장 데크',0,0,.879,length-.06,.74,.025,steel)
curved=[(.454,.879),(.463,.974),(.441,1.081),(.403,1.194),(.348,1.292),(.280,1.364),(.189,1.413),(.089,1.438),(-.32,1.438)]
for x in [-length/2,0,length/2]:
    rod('쇼케이스 · 굽은 스테인리스 기둥',[(x,d,z) for d,z in curved],.016,chrome,8)
for (d1,z1),(d2,z2) in zip(curved,curved[1:]):
    quad('쇼케이스 · 곡면 강화유리',[(-length/2,d1,z1),(length/2,d1,z1),(length/2,d2,z2),(-length/2,d2,z2)],pane,glass)
for d,z in [curved[0],curved[-1]]:
    box('쇼케이스 · 긴 금속 가장자리',0,d,z,length+.03,.035,.033,chrome)
recipes=[(vanilla,shell,cocoa,12),(mint,leaf,shell,6),(pink,berry,shell,2),(lilac,berry,shell,0),(cocoa,vanilla,crumb,13),
         (leaf,shell,mint,4),(peel,vanilla,coral,0),(shell,pink,coral,9),(mint,crumb,leaf,11),(pink,vanilla,berry,1),
         (shell,crumb,cocoa,16),(vanilla,peel,shell,0),(lilac,pink,berry,2),(cocoa,shell,vanilla,6),(peel,shell,coral,2),(mint,shell,leaf,6)]
for i in range(8):
    for j,d in enumerate([-.187,.179]):
        x=-1.35+i*.385;z=.899+.012*j;p1,p2,p3,chips=recipes[2*i+j]
        box('아이스크림 통 · 사각 흰 거치틀',x,d,z,.378,.358,.016,shell)
        # A dark circular well isolates the lower ice surface from the white support.
        cylinder('통 안쪽 그늘',x,d,[(z+.017,.159),(z+.023,.159)],slate,26)
        cream_tub(x,d,z+.033,.152,[p1,p2,p3],rng.uniform(0,TAU),chips)
    plaque('눈금형 맛 카드',x,.45,.947,.241,.091,shell)
    disk('맛 카드 · 색상 견본',x-.082,.460,.947,.022,.023,recipes[2*i][1],12)
    for line,w in enumerate([.104,.075]):
        box('맛 카드 · 상품 표기',x+.018,.460,.952-line*.019,w,.001,.006,cocoa)
# Actual branch pictures show bright cyan boards over the long freezer and white backing below.
box('카운터 뒤 준비벽',0,-.69,.06,length+.12,.08,2.97,shell)
for i,label in enumerate(['ICE CREAM','SUNDAE','BLAST','BEVERAGE']):
    x=-1.20+i*.80
    box('메뉴 디스플레이 · 얇은 검정 베젤',x,-.61,2.07,.79,.045,.54,char)
    body=lit
    plaque('메뉴 디스플레이 · 파란 화면',x,-.582,2.34,.758,.503,aqua)
    text('메뉴 헤더',label,x,-.570,2.52,.065,shell)
    if i%2==0:
        graphic(x-.09,-.563,2.29,.65,[mint,pink][i//2])
        graphic(x+.13,-.563,2.32,.57,[pink,vanilla][i//2])
    else:
        for j,w in enumerate([.39,.31,.36,.28]):box('메뉴 글줄',x-.02,-.569,2.39-j*.055,w,.003,.015,ice)

    body=solid

# The pale preparation wall carries shallow cup shelves, menu cards and a pink lidded dispenser.
box('준비대 · 스테인리스 작업면',0,-.515,1.013,length,.32,.042,chrome)
for j in range(3):
    x=-1.19+j*.37
    plaque('메뉴 카드 · 받침',x,-.575,1.51,.30,.355,[shell,pink,shell][j])
    graphic(x,-.564,1.52,.58,[pink,leaf,cocoa][j])
    text('메뉴 카드 · 헤더',['SCOOP','CONE','COFFEE'][j],x,-.560,1.646,.032,blue)
box('벽 선반 · 컵 홀더',.49,-.522,1.163,.84,.24,.034,walnut)
for j in range(4):
    sx=.186+j*.202
    cylinder('쌓은 컵 · 테이퍼 몸체',sx,-.516,[(1.20,.055),(1.41+.04*(j%2),.078)],[pink,shell,aqua,shell][j],15)
    for k in range(5):
        r=.066+k*.003
        cylinder('컵 더미 · 포개진 림',sx,-.516,[(1.352+.012*k+.04*(j%2),r),(1.356+.012*k+.04*(j%2),r)],shell,15)
cylinder('핑크 디스펜서 · 둥근 하우징',1.20,-.51,[(1.056,.15),(1.070,.20),(1.21,.187),(1.285,.127),(1.302,.067)],rose,22)
for off in [-.043,-.015,.019,.040]:
    rod('디스펜서 · 스푼',[(1.18+off,-.51,1.27),(1.195+off,-.49,1.45+off)],.008,hot,6)
    disk('스푼 · 둥근 끝',1.195+off,-.48,1.465+off,.019,.032,rose,10)

# Left entry wall: four black fridge doors; boxed tubs on one side and decorated cakes on the other.
offset=(-2.99,1.27);angle=-pi/2
box('케이크장 · 분홍 배경판',0,-.36,.01,3.44,.10,2.84,rose)
for i in range(49):box('케이크장 · 분홍 루버',-1.67+i*.069,-.296,.01,.030,.026,2.84,slat)
box('냉장고 · 공통 뒷판',0,-.255,.07,3.0,.075,2.30,slate)
box('냉장고 · 압축기 걸레받이',0,.03,.03,3.09,.52,.24,char)
box('냉장고 · 상단 검정 프레임',0,.025,2.24,3.09,.53,.115,char)
for i in range(5):
    x=-1.51+i*.755
    box('냉장고 · 세로 문틀',x,.233,.23,.045,.085,2.06,char)
    box('냉장고 · 수직 흰 조명',x+.012,.18,.30,.016,.012,1.91,ice)
for i in range(4):
    x=-1.131+i*.755
    quad('냉장고 · 통유리문',[(x-.35,.24,.29),(x+.35,.24,.29),(x+.35,.24,2.24),(x-.35,.24,2.24)],pane,glass)
    rod('냉장고 문 · 손잡이',[(x+.30,.249,1.08),(x+.30,.28,1.11),(x+.30,.28,1.41),(x+.30,.249,1.44)],.012,char,7)
    for j in range(5):
        z=.29+j*.379
        box('냉장고 선반 · 회색 데크',x,-.01,z,.71,.40,.024,steel)
        box('냉장고 선반 · LED 라인',x,.179,z+.012,.70,.02,.012,ice)
        for k in range(2 if i<2 else 3):
            sx=x+((k-.5)*.31 if i<2 else (k-1)*.211)
            if i<2:
                mat=[pink,vanilla,mint,lilac][(i+j+k)%4]
                board=[rose,aqua,blue][(j+k)%3];wrap=[shell,pink,vanilla][(i+j+k)%3]
                box('케이크 · 사각 포장 받침',sx,-.015,z+.027,.283,.269,.018,board)
                cylinder('케이크 · 아이싱·크림띠',sx,-.015,[(z+.045,.09),(z+.054,.115),(z+.155,.116),(z+.17,.106)],mat,22)
                cylinder('케이크 · 가운데 얇은 크림띠',sx,-.015,[(z+.083,.117),(z+.093,.117)],wrap,22)
                for l in range(6):
                    a=l*TAU/6;px=sx+.077*cos(a);pd=-.015+.077*sin(a)
                    cylinder('케이크 · 짤주머니 크림',px,pd,[(z+.165,.026),(z+.179,.029),(z+.201,.015),(z+.213,.005)],shell,9)
                    if (j+l)%3==0:cylinder('케이크 · 체리',px,pd,[(z+.202,.009),(z+.216,.014),(z+.224,.004)],coral,8)
                if j%2==0:
                    disk('케이크 · 초콜릿 토퍼',sx,0,z+.227,.037,.043,cocoa)
                    box('케이크 · 토퍼 막대',sx,-.004,z+.167,.004,.006,.07,amber)
            else:
                color=[pink,vanilla,aqua,leaf][(j+k+i)%4]
                for stack in range(1+(j%2)):
                    ht=z+.029+stack*.095
                    cylinder('테이크아웃 · 아이스크림 종이컵',sx,0,[(ht,.072),(ht+.081,.080)],color,14)
                    cylinder('테이크아웃 · 흰 뚜껑',sx,0,[(ht+.081,.083),(ht+.092,.082)],shell,14)
                    disk('테이크아웃 · 표기',sx,.077,ht+.040,.027,.018,rose,10)
text('냉동고 상단 글자','WE MAKE PEOPLE HAPPY',0,-.255,2.60,.14,shell)

# The back wall in the two visits has narrow wood battens, a cone light, framed prints and upholstered corner seating.
offset=(0,0);angle=0
box('후면 · 연속 오크 패널',0,-.37,.02,6.64,.10,3.0,oak)
for i in range(85):box('후면 · 루버',-3.28+i*.078,-.302,.54,.038,.028,2.44,birch)
box('벤치 · 바닥 받침',-.01,-.045,.055,3.42,.55,.34,walnut)
box('벤치 · 붙박이 좌판',-.01,-.040,.393,3.46,.60,.104,sofa)
box('벤치 · 푹신한 등받이',-.01,-.25,.49,3.46,.13,.43,sofa)
# Tube cone from the reference. A tiny white core gives the pink tube definition at dusk.
outline=[(-.90,2.15),(-.76,2.04),(-.67,2.17),(-.57,2.26),(-.68,2.30),(-.71,2.36),(-.75,2.39),(-.75,2.50),(-.79,2.45),(-.83,2.40),(-.85,2.34),(-.91,2.31),(-.94,2.24),(-.90,2.15)]
body=lit
for mat,r,depth in [(rose,.015,-.270),(shell,.004,-.257)]:
    rod('벽 네온 · 아이스크림 콘',[(x,depth,h) for x,h in outline],r,mat,7)
for x0,z0,x1,z1 in [(-.88,2.225,-.65,2.225),(-.85,2.34,-.72,2.32),(-.88,2.17,-.74,2.11)]:
    rod('벽 네온 · 크림',[(x0,-.255,z0),(x1,-.255,z1)],.009,mint,7)
text('벽 네온 · 문구','MY ORIGINAL 31',-.77,-.25,1.96,.109,rose)
body=solid
for j in range(4):
    x=.19+j*.49
    plaque('매장 액자 · 얇은 검정 프레임',x,-.263,2.17,.405,.47,char)
    plaque('매장 액자 · 컬러 포스터',x,-.250,2.17,.38,.444,[pink,shell,peel,lilac][j])
    graphic(x,-.239,2.19,.77,[berry,mint,lilac,shell][j])

# Compact two-top tables and individual spindle chairs, kept against the rear bench.
def cafe_table(x,d):
    cylinder('티 테이블 · 흰 원형 주물 받침',x,d,[(.018,.227),(.03,.244),(.057,.216),(.078,.07)],chrome,22)
    cylinder('티 테이블 · 지주',x,d,[(.067,.042),(.688,.042)],steel,12)
    cylinder('티 테이블 · 연한 오크 상판',x,d,[(.688,.285),(.70,.306),(.729,.306),(.733,.295)],birch,28)

def chair(x,d):
    for sx in [-1,1]:
        for sd in [-1,1]:
            rod('의자 · 벌어진 다리',[(x+sx*.175,d+sd*.185,.024),(x+sx*.119,d+sd*.129,.441)],.015,oak,7)
    cylinder('의자 · 원형 좌면',x,d,[(.434,.175),(.459,.196),(.475,.18)],oak,24)
    for i in range(6):
        sx=(i-2.5)*.053
        rod('의자 · 곡선 등살',[(x+sx*.85,d+.126,.468),(x+sx*1.12,d+.183,.782)],.0085,oak,6)
    path=[(x+(k-6)*.030,d+.194-.053*((k-6)/6)**2,.790-.022*((k-6)/6)**2) for k in range(13)]
    rod('의자 · 파스텔색 활 등받이',path,.022,shell,8)

for x in [-.92,.72]:
    cafe_table(x,.41);chair(x+.24,.96)

# Pair of pink self-checkout terminals by the entrance, with separate scanner and payment slots.
for x in [-1.60,-.91]:
    d=2.38
    box('단말기 · 금속 바닥 받침',x,d,.014,.43,.43,.036,steel)
    for off in [-.181,.181]:
        box('단말기 · 슬림한 금속 다리',x+off,d,.05,.032,.060,.59,chrome)
    box('무인결제기 · 분홍 하우징',x,d,.62,.474,.16,1.06,hot)
    box('무인결제기 · 상단 안내판',x,d,1.69,.46,.038,.218,rose)
    body=lit
    plaque('무인결제기 · 터치스크린',x,d+.085,1.32,.396,.53,shell)
    plaque('무인결제기 · 앱 메뉴',x,d+.097,1.33,.344,.424,aqua)
    graphic(x,d+.106,1.32,.52,pink)
    text('무인결제기 · 주문 단추','ORDER',x,d+.109,1.178,.033,blue)
    body=solid
    box('무인결제기 · 영수증 출구',x-.111,d+.084,.933,.124,.018,.027,char)
    box('무인결제기 · 카드·바코드 리더',x+.106,d+.086,.907,.143,.039,.055,slate)
    text('무인결제기 · BR','baskin BR robbins',x,d+.085,.721,.033,shell)

# Central BR/31 channel letters. Shapes follow the blue and pink 2005 identity on the Korean brand-history page.
# The photographs show this older mark suspended between the two backlit words.
strokes=[
    (blue,[(63,43),(77,38),(120,39),(117,102),(111,211),(105,239),(76,235),(69,213)]),
    (rose,[(120,33),(140,30),(168,41),(192,55),(208,74),(215,95),(213,119),(204,133),(181,147),
           (198,154),(210,171),(211,192),(200,215),(182,232),(159,244),(136,248),(107,245),
           (101,239),(112,212),(133,213),(148,201),(151,185),(143,177),(115,170),(116,135),
           (141,128),(155,117),(157,107),(149,97),(119,87)]),
    (rose,[(232,53),(244,46),(282,55),(284,65),(267,146),(248,222),(235,260),(224,265),(200,256),(204,226)]),
    (blue,[(286,68),(310,71),(332,85),(348,102),(357,124),(356,146),(350,164),(335,182),(309,195),(303,207),
           (320,250),(314,264),(289,265),(269,248),(251,211),(259,170),(282,166),(294,157),(299,145),(296,134),(283,127),(272,126)])]
body=lit
for colour,outline in strokes:
    quad('발광 상호 · BR 31 채널 글자', [((x-210)*.00130,3.70,3.11+(149-z)*.00130) for x,z in outline],colour)
body=solid

for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=7.9
        area.spaces.active.region_3d.view_location=(0,-1,1.4)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'gyeongbu-scoop-parlor.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'))
