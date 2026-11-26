"""Build the editable Halff Coffee FP212 storefront, coffee bar and merchandise."""
from math import cos, sin, pi, tau
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
scene.name = '파미에스테이션 · 하프커피 FP212'
scene.unit_settings.system = 'METRIC'
colors = {
    'rust':'99542f','rustLight':'a96138','arch':'252c38','cedar':'ae6b47','blue':'1d465c',
    'blueTop':'2f5969','back':'173846','white':'eeeae2','shade':'ccc9c0','terra':'c39063',
    'seam':'64574e','oak1':'986f4e','oak2':'916d51','oak3':'846450','oak4':'a07b59',
    'grain':'785d49','cobalt':'244779','teal':'186568','deep':'154950','night':'182e41',
    'paint':'323b41','base':'333b3d','steel':'b6bdba','chrome':'d2d3c6','gold':'b19b6f',
    'lit':'fff4bb','ink':'27342f','ice':'e8dfc9','milk':'e6d6bb','coffee':'986f54',
    'crema':'c29c6a','foam':'ecd7a7','matcha':'79884f','glass':'b9ccc4','bag':'d5ba89',
    'amber':'c39151','bake':'bd8e5b','edge':'966b47','filling':'c7aa75','nut':'97795b',
    'pistachio':'a7ac70','cocoa':'674c3f','black':'343738','paper':'f5eedc',
    'pink':'e8ccc0','periwinkle':'7289b2','screen':'6fadc3','menu':'d3dfde',
}
for name, code in colors.items():
    m.palette[name] = m.material(name, code, .46 if name in ('chrome','steel','gold') else 0)
B,C,T = m.block,m.profile,m.rod
rng = Random(212)

def child(label,parent):
    c=bpy.data.collections.new(label);parent.children.link(c);m.group=c
    return c

def root(label,position):
    c=child('하프커피 · '+label,scene.collection);c['preview_origin']=position
    return c

def make_shape(name, outline, z, height, tone):
    n=len(outline); v=[(x,d,zz) for zz in (z,z+height) for x,d in outline]
    return m.piece(name,v,[tuple(reversed(range(n))),tuple(range(n,2*n))]+[
        (i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)],tone)

def capsule(name,x,d,z,width,depth,height,tone):
    rad=depth/2; half=width/2-rad; pts=[]
    for offset,a0 in [(half,-pi/2),(-half,pi/2)]:
        pts += [(x+offset+rad*cos(a0+j*pi/16),d+rad*sin(a0+j*pi/16)) for j in range(17)]
    obj=make_shape(name,pts,z,height,tone)
    for p in obj.data.polygons:
        p.use_smooth=p.index>1
    return obj

def smooth(obj):
    for p in obj.data.polygons:
        if len(p.vertices)==4:p.use_smooth=True
    return obj

def cup(name,x,d,z,height,radius,tone):
    return C(name,x,d,z,[(radius*.76,0),(radius*.80,.012),(radius*.96,height*.85),
                          (radius,height*.94),(radius*.99,height),(radius*.86,height+.001)],tone,18)

# The facade opens in broad and narrow arches. Keep the void below the actual curved soffit.
shell=root('갈색 아치와 청색 커피 벽',(0,0,0))
child('개방 아치 · 갈색 도장과 짙은 안쪽 마감',shell)
fronts=[(-5.78,-1.72),(-.97,.52),(1.20,2.66),(3.36,4.81)]
edges=[-5.93]+[v for span in fronts for v in span]+[5.93]
for x0,x1 in zip(edges[::2],edges[1::2]):
    B('갈색 정면 기둥',(x0+x1)/2,.025,0,x1-x0,.25,3.42,'rust')
for x0,x1 in fronts:
    radius=(x1-x0)/2;mid=(x0+x1)/2;rise=min(.66,radius);spring=2.34
    n=24; arc=[(mid-radius*cos(j*pi/n),spring+rise*sin(j*pi/n)) for j in range(n+1)]
    # Closed mesh for each spandrel: no seam across the visible copper-colored header.
    verts=[(x,d,z) for d in (-.10,.15) for x,z in arc+[(x1,3.42),(x0,3.42)]]
    k=len(arc)+2
    m.piece('갈색 아치 인방',verts,[tuple(range(k)),tuple(reversed(range(k,k*2)))]+[
        (j,(j+1)%k,k+(j+1)%k,k+j) for j in range(len(arc)-1,k)],'rust')
    inset_arc=[(mid+(x-mid)*.993,z-.009) for x,z in arc]
    path=[(inset_arc[0][0],0)]+inset_arc+[(inset_arc[-1][0],0)]
    verts=[(x,d,z) for x,z in path for d in (-.105,.155)]
    m.piece('둥근 문틀 안쪽 짙은 금속',verts,[(j,j+1,j+3,j+2) for j in range(0,len(verts)-2,2)],'arch')
    for x in [x0,x1]:
        B('문설주 금속 모서리',x,.020,0,.025,.272,2.34,'arch')
B('아치 위 상부 띠',0,.018,3.425,11.86,.29,.085,'rustLight')
child('후벽 사인 · 선반과 잔',shell)
B('뒤쪽 짙은 청색 벽',0,7.185,0,11.88,.15,3.43,'blue')
# Colour the permanent downlight pools at the vertices. This adds no point lights in the game.
from math import exp
def linear(v):
    c=min(255,max(0,v))/255
    return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
def illuminated(obj,tones):
    attr=obj.data.color_attributes.new(name='ShopLight',type='BYTE_COLOR',domain='POINT')
    for rec,channels in zip(attr.data,tones):
        rec.color=(*[linear(v) for v in channels],1)
    obj.data.color_attributes.active_color=attr
    shader=obj.data.materials[0].copy()
    color=shader.node_tree.nodes.new('ShaderNodeVertexColor');color.layer_name='ShopLight'
    shader.node_tree.links.new(color.outputs['Color'],shader.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    obj.data.materials[0]=shader
cols=46;rows=16;verts=[];tones=[]
for j in range(rows+1):
    h=3.43*j/rows
    for i in range(cols+1):
        x=(i/cols-.5)*11.87;verts.append((x,7.105,h))
        distance=3.44-h
        glow=max(exp(-((x-p)/(.25+.52*distance))**2/2-(distance-.75)**2/1.63) for p in [-4.55,-1.64,1.43,4.52])
        halo=exp(-((x/.98)**2+((h-2.76)/.39)**2)*2)
        tones.append((22+31*glow+34*halo,53+39*glow+29*halo,71+51*glow+16*halo))
faces=[]
for j in range(rows):
    for i in range(cols):
        a=j*(cols+1)+i;faces.append((a,a+1,a+cols+2,a+cols+1))
illuminated(m.piece('다운라이트가 비친 후벽',verts,faces,'blue'),tones)

B('긴 잔 선반 안쪽',.1,7.09,1.73,8.52,.065,.445,'back')
B('선반 윗면 청록 띠',.1,6.985,2.144,8.55,.227,.046,'teal')
B('선반 아래 잔 받침',.1,6.973,1.70,8.55,.240,.043,'blueTop')
for i in range(34):
    x=-3.89+i*.23;rr=.047+(i%3)*.005
    if i%5==0:
        C('잔 선반의 흰 잔',x,6.987,1.744,[(rr,0),(rr*.72,.117)],'white',10)
    else:
        # A narrow transparent-glass silhouette reads against the dark recess at walking distance.
        for h,fac in [(0,1),(.113,.73)]:
            n=10;v=[(x+rr*fac*cos(j*tau/n),6.987+rr*fac*sin(j*tau/n),1.744+h+dy) for dy in (0,.005) for j in range(n)]
            m.piece('엎은 유리잔 빛나는 테',v,[(j,(j+1)%n,n+(j+1)%n,n+j) for j in range(n)],'glass')
        for direction in [-1,1]:
            px=x+direction*rr
            v=[(px,6.987,1.748),(px-direction*.007,6.982,1.748),(x+rr*.72*direction-direction*.004,6.983,1.858),(x+rr*.72*direction,6.987,1.858)]
            m.piece('투명한 잔 옆 반사',v,[(0,1,2,3)],'glass')
# Stylized open-stroke lowercase lettering based on the physical backlit Halff wordmark.
paths = [
    [(0,0),(0,.99)],[(0,.34),(.03,.53),(.14,.64),(.28,.63),(.38,.53),(.38,0)],
    [(.99,.60),(.87,.65),(.70,.61),(.59,.48),(.55,.30),(.59,.13),(.71,.04),(.82,.06),(.93,.16),(.98,.33),(.99,.65),(.99,0)],
    [(1.24,.03),(1.24,1)],[(1.53,.02),(1.53,.75),(1.58,.91),(1.68,.97),(1.85,.98)],[(1.48,.57),(1.78,.57)],
    [(1.95,.02),(1.95,.75),(2,.91),(2.10,.97),(2.27,.98)],[(1.9,.57),(2.20,.57)],
]
def mark(name,x,d,z,scale,tone,thickness):
    for part in paths:
        T(name,[(x+(px-1.10)*scale,d,z+pz*scale) for px,pz in part],thickness*scale,tone,4 if scale<.1 else 7)
mark('금색 간접조명 테두리',0,7.091,2.48,.58,'lit',.096)
mark('검은 입체 상호',0,7.042,2.48,.58,'ink',.056)
child('창가 검은 격자 · 객석 천장과 조명',shell)
# Clear area between the rails is true glazing with the adjoining game environment visible.
for xx in [5.90]:
    for d in [.13,1.24,2.35,3.46,4.57,5.68,6.79,7.15]:
        B('창가 검은 세로틀',xx,d,.09,.09,.053,3.19,'arch')
    for h in [.10,1.04,2.55,3.27]:
        B('창가 가로틀',xx,3.64,h,.086,7.1,.047,'arch')
# The side opposite the window is the photographed rust wall with an arch to the gallery.
for lo,hi in [(.12,3.87),(5.53,7.18)]:
    B('곁면 갈색 벽',-5.90,(lo+hi)/2,0,.15,hi-lo,3.44,'rust')
arc=[(4.70-.83*cos(j*pi/20),2.16+.78*sin(j*pi/20)) for j in range(21)]
k=len(arc)+2;verts=[(xx,dd,h) for xx in [-5.975,-5.825] for dd,h in arc+[(5.53,3.44),(3.87,3.44)]]
m.piece('옆 출입구 아치 인방',verts,[tuple(range(k)),tuple(reversed(range(k,2*k)))]+[(j,(j+1)%k,k+(j+1)%k,k+j) for j in range(k)],'rust')
B('백색 천장',0,3.59,3.44,11.9,7.37,.09,'white')
for x in [-4.8,-2.6,-.4,1.8,4.0]:
    for d in [2.1,5.6]:
        C('매입 조명 테',x,d,3.421,[(.096,0),(.103,.015)],'chrome',14)
        C('매입 조명 면',x,d,3.415,[(.077,0),(.077,.007)],'lit',14)
for x in [-3.05,-.25,2.63]:
    for dx in [-.22,0,.22]:
        C('황동색 직부 스폿',x+dx,4.59,3.26,[(.044,0),(.047,.178)],'gold',12)
        C('스폿 발광면',x+dx,4.59,3.253,[(.040,0),(.041,.008)],'lit',12)
# Hardwood rhombi compose hexagonal parquet. Each polygon is clipped to the worn shop threshold.
child('마름모 쪽매의 목재 바닥',shell)
groups={tone:([],[]) for tone in ['oak1','oak2','oak3','oak4','grain']}
def clip(points,axis,v,less):
    out=[]
    for p,q in zip(points,points[1:]+points[:1]):
        aa=p[axis]-v;bb=q[axis]-v;ap=aa<=0 if less else aa>=0;bp=bb<=0 if less else bb>=0
        if ap:out.append(p)
        if ap!=bp:
            f=aa/(aa-bb);out.append((p[0]+f*(q[0]-p[0]),p[1]+f*(q[1]-p[1])))
    return out
def floorface(tone,poly,h):
    for axis,v,less in [(0,-5.93,False),(0,5.93,True),(1,-.11,False),(1,7.18,True)]:
        poly=clip(poly,axis,v,less) if poly else []
    if len(poly)<3:return
    ver,faces=groups[tone];n=len(ver);ver.extend((x,d,h) for x,d in poly);faces.append(tuple(range(n,n+len(poly))))
rr=.37;hh=rr*3**.5/2
for j in range(-13,14):
    for k in range(-2,15):
        x=j*1.5*rr;d=k*2*hh+(j%2)*hh
        edges=[(x+rr*cos(n*pi/3),d+rr*sin(n*pi/3)) for n in range(6)]
        for i in [0,2,4]:
            raw=[(x,d),edges[i],edges[(i+1)%6],edges[(i+2)%6]]
            cx=sum(p[0] for p in raw)/4;cd=sum(p[1] for p in raw)/4
            shape=[(cx+(px-cx)*.986,cd+(pd-cd)*.986) for px,pd in raw]
            floorface(rng.choice(['oak1','oak2','oak3','oak4']),shape,.034)
            for stroke in range(rng.randrange(3,5)):
                # Fine timber grain runs with the parallelogram. A broken run keeps the floor matte.
                a,b=shape[0],shape[1];q=rng.uniform(.16,.70);px=a[0]+q*(shape[3][0]-a[0]);pd=a[1]+q*(shape[3][1]-a[1])
                dx=b[0]-a[0];dd=b[1]-a[1];f=rng.uniform(.31,.87)
                floorface('grain',[(px+.08*dx,pd+.08*dd),(px+dx*f,pd+dd*f),(px+dx*f+.002,pd+dd*f+.0018)],.0346)
for tone,(v,f) in groups.items():
    if v:m.piece('쪽매 마루 '+tone,v,f,tone)

# The actual branch windows overlook brick arcades with pale stone archivolts.
# Use two bays on the game's existing gallery wall. There is no surveyed height for the court beyond.
child('창 맞은편 회랑의 벽돌 아치와 석재 띠',shell)
gallery_x=17.667
for d in [1.42,4.94]:
    radius=1.42; spring=1.64; outer=1.61; depth=.14
    for sign in [-1,1]:
        for n in range(4):
            B('맞은편 회랑 쌓은 석재 옆틀',gallery_x-.14,d+sign*(radius+.092),.44+n*.294,.24,.182,.287,'white' if n%2 else 'shade')
        B('회랑 사각 기둥 머리',gallery_x-.175,d+sign*(radius+.085),1.53,.29,.28,.15,'white')
    for j in range(19):
        lo=pi*j/19+.0025;hi=pi*(j+1)/19-.0025
        cross=[(d+radius*cos(lo),spring+radius*sin(lo)),(d+outer*cos(lo),spring+outer*sin(lo)),
               (d+outer*cos(hi),spring+outer*sin(hi)),(d+radius*cos(hi),spring+radius*sin(hi))]
        v=[(gallery_x+xx,dd,h) for xx in [-.24,-.10] for dd,h in cross]
        m.piece('밝은 석재 아치 쐐기돌',v,[(0,1,2,3),(7,6,5,4)]+[(k,(k+1)%4,(k+1)%4+4,k+4) for k in range(4)],'paper' if j%3 else 'white')
    # A dark glazing rail crosses a genuine opening, so the view can continue into the adjoining game space.
    B('맞은편 창 금속 띠',gallery_x-.019,d,1.41,.048,radius*1.98,.057,'arch')
    for off in [-.63,0,.63]:
        B('회랑 유리창 세로틀',gallery_x-.015,d+off,.58,.044,.047,1.60,'arch')
B('맞은편 회랑 상부 돌림띠',gallery_x-.11,3.39,3.37,.30,8.64,.094,'white')
B('맞은편 하단 돌림띠',gallery_x-.12,3.39,.43,.29,8.64,.13,'shade')

bar=root('흰 곡면 커피바와 추출 장비',(0,-9.6,0))
child('둥근 테라조 주문대와 공용 작업대',bar)
# The fixtures are centered on the coffee-bar line; d=0 is the island center.
islands=[(-3.42,.29,2.59),(-.57,0,2.36),(2.72,-.12,2.96)]
for x,d,w in islands:
    capsule('곡면 주문대 어두운 걸레받이',x,d,.016,w-.14,1.12,.11,'base')
    capsule('백색 테라조 곡면 주문대',x,d,.10,w,1.30,.85,'shade')
    capsule('인조석 둥근 상판',x,d,.944,w+.012,1.313,.067,'white')
    # Fine aggregate sits flush on the off-white worktop, visible at a customer's distance.
    grains={tone:([],[]) for tone in ['shade','terra','grain']}
    for i in range(460):
        fx=rng.uniform(-w/2+.03,w/2-.03);fd=rng.uniform(-.617,.617)
        if max(0,abs(fx)-(w/2-.65))**2+fd**2>.624**2:continue
        tone=rng.choices(['shade','terra','grain'],weights=(7,2,1))[0]
        v,f=grains[tone];n=len(v);r=rng.uniform(.0018,.0046)
        v.extend((x+fx+r*cos(q*tau/3),d+fd+r*.7*sin(q*tau/3),1.0113) for q in range(3))
        f.append((n,n+1,n+2))
    for tone,(v,f) in grains.items():
        if v:m.piece('백색 상판에 박힌 석재 입자',v,f,tone)
    for i in range(7):
        B('뒤 수납문 손잡이',x-w*.32+i*w*.104,d+.641,.68,.11,.018,.023,'steel')
B('뒤편 캐비닛 흰 상판',0,1.76,.913,10.06,.73,.071,'white',.025)
B('뒤편 캐비닛',0,1.78,.03,9.94,.65,.89,'back')
for i in range(13):
    x=-4.59+i*.76
    B('뒤 수납장 문짝',x,1.446,.13,.741,.036,.73,'blue')
    B('수납문 스테인리스 손잡이',x,1.419,.76,.19,.024,.022,'chrome')
for x in [2.18,3.16]:
    B('싱크의 넓은 테',x,1.75,.979,.47,.39,.012,'steel',.028)
    B('싱크의 안쪽 음영',x,1.74,.986,.39,.31,.014,'shade',.02)
    T('목이 긴 수도꼭지',[(x+.16,1.91,.996),(x+.16,1.91,1.23),(x+.16,1.88,1.31),
                        (x+.13,1.83,1.33),(x+.07,1.75,1.31),(x+.065,1.745,1.26)],.018,'chrome',8)
child('에스프레소 머신 · 호퍼, 보일러와 포터필터',bar)
def espresso(x,d):
    B('머신 고무발',x,d,1.016,.87,.51,.047,'base',.008)
    B('광택 스테인리스 몸체',x,d+.06,1.059,.93,.43,.35,'steel',.03)
    B('상아색 측면 몸체',x,d+.103,1.102,.98,.39,.31,'white',.035)
    B('머신 머리 가로대',x,d-.162,1.322,.95,.18,.103,'chrome',.021)
    B('머신 물받이',x,d-.212,1.086,.82,.249,.035,'steel',.016)
    for i in range(18):
        B('드립 트레이 슬롯',x-.38+i*.044,d-.21,1.122,.014,.178,.006,'paint')
    for side in [-1,1]:
        xx=x+side*.251
        C('크롬 그룹 헤드',xx,d-.183,1.233,[(.067,0),(.072,.024),(.059,.087)],'chrome',16)
        T('길게 뻗은 포터필터',[(xx,d-.186,1.246),(xx+.042,d-.264,1.225),
                           (xx+.092,d-.359,1.209)],.015,'base')
        C('잔 받침',xx,d-.20,1.124,[(.066,0),(.073,.012)],'white',15)
        cup('흰 에스프레소 잔',xx,d-.20,1.136,.065,.043,'white')
        T('잔 손잡이',[(xx+.033,d-.196,1.178),(xx+.052,d-.197,1.186),
                    (xx+.064,d-.197,1.173),(xx+.053,d-.197,1.156),(xx+.034,d-.197,1.158)],.006,'white')
        T('옆면 크롬 물관',[(xx,d-.115,1.393),(xx+.090,d-.13,1.47),
                         (xx+.14,d-.08,1.477),(xx+.175,d-.025,1.38)],.014,'chrome')
        for i in range(3):B('커피머신 조작 단추',xx+(i-1)*.04,d-.261,1.358,.020,.008,.021,'base')
    for i in range(3):
        xx=x-.32+i*.26
        for k in range(4+(i%2)):
            n=12;bottom=1.41 if k==0 else 1.507+k*.026
            heights=[(bottom,.044 if k==0 else .052),(1.536+k*.026,.057)]
            v=[(xx+rr*cos(j*tau/n),d+.11+rr*sin(j*tau/n),hh) for hh,rr in heights for j in range(n)]
            f=[(j,(j+1)%n,n+(j+1)%n,n+j) for j in range(n)]
            m.piece('상부에 쌓인 종이컵',v,f,'night' if i%2==0 else 'paper')
            hh=1.536+k*.026;v=[(xx+.057*cos(j*tau/n),d+.11+.057*sin(j*tau/n),hh+rise) for rise in [0,.009] for j in range(n)]
            if k==3+i%2:f=f+[tuple(range(n,n*2))]
            m.piece('겹친 종이컵의 흰 테두리',v,f,'paper')
    gx=x+.83
    B('그라인더 받침',gx,d+.08,1.017,.28,.37,.044,'base',.019)
    C('모터와 원두 배출구',gx,d+.10,1.046,[(.096,0),(.135,.08),(.115,.29)],'paint',16)
    C('그라인더 호퍼',gx,d+.10,1.339,[(.071,0),(.133,.09),(.139,.254)],'cocoa',20)
    C('호퍼 뚜껑',gx,d+.10,1.589,[(.142,0),(.138,.024)],'base',20)
    T('우유 스팀 피처 손잡이',[(gx-.195,d-.21,1.116),(gx-.15,d-.21,1.17),(gx-.166,d-.21,1.186),(gx-.207,d-.21,1.181)],.008,'steel')
    C('스테인리스 우유 피처',gx-.236,d-.21,1.014,[(.056,0),(.065,.122),(.056,.168)],'chrome',14)
espresso(-3.59,.22);espresso(-.76,-.03)
child('바 앞 계산대 · 화면과 소모품',bar)
B('POS 단말 발판',3.63,-.17,1.017,.26,.22,.026,'base',.011)
T('단말 거치대',[(3.63,-.15,1.036),(3.63,-.16,1.22)],.039,'steel')
for i,(x,d,w,dep,h,col) in enumerate([(3.63,-.186,.37,.063,.26,'paper'),(3.63,-.225,.321,.014,.194,'screen')]):
    B('계산용 터치스크린',x,d,1.19+(i*.031),w,dep,h,col,.007)
B('메뉴 거치대',3.87,-.38,1.016,.22,.12,.016,'base')
B('탁상 메뉴판',3.87,-.39,1.038,.21,.022,.259,'paper')
for j in range(5):B('메뉴 줄',3.87,-.403,1.09+j*.032,.13-(j%3)*.035,.003,.006,'ink')
for j in range(12):
    xx=1.65+j%4*.039;dd=.04+j//4*.039
    T('검은 빨대',[(xx,dd,1.13),(xx+.012*(j%3-1),dd+.012*(j%2),1.28+.011*(j%4))],.005,'base',5)
B('빨대 통',1.708,.081,1.018,.19,.16,.145,'white',.008)
for i in range(5):
    xx=-4.30+i*.24
    C('시럽 병',xx,1.76,.985,[(.049,0),(.056,.014),(.055,.234),(.03,.27),(.024,.30)],'amber' if i%2 else 'glass',12)
    B('시럽병 종이 라벨',xx,1.705,1.034,.07,.008,.13,'paper')
    T('시럽 펌프',[(xx,1.76,1.286),(xx,1.76,1.339),(xx+.074,1.76,1.339)],.008,'base',6)

seating=root('각진 스툴과 창가 금속 벤치',(13.2,0,0))
child('창가와 아치 앞 접은 금속 벤치',seating)
def bench(name,x,d,angle,tone,length):
    before=set(m.group.objects)
    # Profile follows the rounded folds on both long edges of the single metal seat.
    pts=[(-.242,.425),(-.242,.455),(-.227,.48),(-.19,.493),(.189,.493),(.221,.482),
         (.24,.454),(.24,.423),(.222,.421),(.222,.448),(.207,.463),(.188,.473),
         (-.19,.473),(-.211,.465),(-.223,.447),(-.223,.424)]
    n=len(pts);v=[(xx,dd,h) for xx in (-length/2,length/2) for dd,h in pts]
    m.piece(name,v,[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)],tone)
    for sign in [-1,1]:
        xx=sign*(length/2-.11)
        for dd in [-.172,.173]:
            C('저상 벤치 강관 다리',xx,dd,.012,[(.019,0),(.020,.455)],'deep',9)
            C('금속 다리 고무발',xx,dd,0,[(.030,0),(.025,.015)],'base',8)
    for obj in set(m.group.objects)-before:
        obj.matrix_world=Matrix.Translation((x,-d,0))@Matrix.Rotation(-angle,4,'Z')@obj.matrix_world
for x in [-.16,2.03,4.22]:bench('아치 안팎 남색 벤치',x,-.32,0,'cobalt',2.09)
for d in [1.42,3.63,5.92]:bench('창가에 둥글게 접어 만든 청록 벤치',5.54,d,pi/2,'teal',2.05)
child('팔각 스툴과 작은 원탁',seating)
stools=[(-.57,-1.43,'teal'),(1.20,-1.42,'teal'),(3.08,-1.40,'teal'),(4.53,-1.40,'teal'),
        (3.52,1.78,'cobalt'),(3.12,2.88,'teal'),(3.83,6.00,'cobalt'),(-3.85,2.60,'teal'),(-2.90,2.09,'cobalt')]
tables=[(.36,-.92),(2.35,-.91),(4.63,2.58),(4.48,5.53),(-3.54,1.92)]
for x,d,tone in stools:
    C('팔각 테이퍼 스툴',x,d,.014,[(.266,0),(.281,.018),(.224,.451),(.208,.466)],tone,8)
    C('낮은 걸레받이',x,d,.003,[(.231,0),(.232,.019)],'base',8)
for x,d in tables:
    # Low tables in the branch photo have a cross base above the tile.
    B('원탁 받침 날개',x,d,.018,.48,.036,.389,'base')
    B('겹쳐 끼운 십자 받침',x,d,.018,.036,.48,.389,'base')
    smooth(C('낮은 원형 상판',x,d,.392,[(.34,0),(.348,.009),(.346,.025)],'night',28))

sweets=root('버터바와 약과 쿠키 진열장',(13.0,-10.5,0))
child('원목 쇼케이스와 금속 바구니',sweets)
B('밝은 진열 받침',0,0,0,1.34,.50,.069,'white',.012)
B('상부 선반 목재판',0,0,.545,1.34,.50,.041,'oak2',.009)
for x in [-.645,.645]:
    for d in [-.225,.225]:
        B('원목 진열장 가는 기둥',x,d,.048,.031,.031,.503,'oak2',.003)
for d in [-.231,.231]:
    B('전후면 원목 가로대',0,d,.073,1.31,.034,.032,'oak1')
    B('상부 바구니 테두리',.328,d,.71,.51,.009,.011,'chrome')
for x in [.078,.58]:
    B('바구니 측면 철선',x,0,.711,.008,.46,.009,'chrome')
for i in range(10):
    x=.089+i*.053
    for d in [-.213,.212]:
        T('스테인리스 바구니 철사',[(x,d,.704),(x,d*.8,.596),(x,-d*.8,.596)],.0035,'chrome',5)
for i in range(4):
    d=-.20+i*.13
    T('철망 바구니 세로띠',[(.077,d,.705),(.105,d,.60),(.557,d,.60),(.580,d,.705)],.004,'chrome',5)
child('자른 버터바와 꽈배기 무늬 약과',sweets)
for k,tone in enumerate(['filling','bake','cocoa','amber','pistachio']):
    x=-.54+.207*k
    # The pale trays, split layers, decorative paper bands and small labels are individually editable.
    B('버터바 종이 트레이',x,-.024,.076,.179,.304,.012,'paper',.005)
    for j in range(2):
        dd=-.080+j*.119
        B('버터바 진한 쿠키 바닥',x,dd,.089,.166,.103,.025,'edge',.005)
        B('버터바 속 층',x,dd,.111,.164,.103,.027,tone,.004)
        B('윗면에 구운 크러스트',x,dd,.136,.164,.102,.013,'bake' if k!=4 else 'pistachio',.004)
        B('버터바 포장 종이띠',x,dd,.149,.045,.104,.004,['bag','paper','periwinkle','amber','pistachio'][k])
        for n in range(8):
            jx=x+rng.choice([-1,1])*rng.uniform(.033,.076);jd=dd+rng.uniform(-.041,.041)
            m.piece('구운 표면의 작은 크럼',[(jx-.0038,jd-.002,.150),(jx+.003,jd-.002,.150),
                (jx+.002,jd+.0027,.1505),(jx-.002,jd+.0025,.15)],[(0,1,2,3)],rng.choice(['nut','filling']))
# Yakgwa's petal profile is built around a central dimple, with spiral scoring on the glazed surface.
def yakgwa(x,d,h,r):
    n=32;v=[]
    for fac,z in [(.78,0),(1,.011),(.96,.024),(.78,.030),(.45,.027),(.26,.023)]:
        for i in range(n):
            a=tau*i/n;rr=r*(.93+.07*cos(8*a))*fac
            v.append((x+rr*cos(a),d+rr*sin(a),h+z))
    f=[(k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i) for k in range(5) for i in range(n)]
    f += [tuple(reversed(range(n))),tuple(range(5*n,6*n))]
    m.piece('물결 꽃무늬 약과',v,f,'amber')
    for a in range(8):
        p=a*pi/4
        T('약과 윗면 골',[(x+cos(p+.1)*r*.45,d+sin(p+.1)*r*.45,h+.027),
                      (x+cos(p)*r*.66,d+sin(p)*r*.66,h+.031)],.0017,'edge',5)
for i in range(3):
    xx=.493+(i%2)*.067;dd=-.073+(i//2)*.12
    C('약과 밑 쿠키',xx,dd,.087,[(.058,0),(.076,.020),(.068,.033)],'bake',16)
    yakgwa(xx,dd,.117,.060)
for i in range(3):
    xx=.144+i*.144
    B('개별 포장 쿠키 바닥',xx,.045,.583,.132,.11,.026,'bag',.004)
    C('진열 바구니 쿠키',xx,.024,.604,[(.043,0),(.054,.064),(.050,.09)],'cocoa' if i==2 else 'bake',12)
    B('개별 포장 종이 머리',xx,.090,.676,.14,.011,.065,'white')
    for z in [.69,.716]:B('쿠키 포장 인쇄',xx,.082,z,.077,.003,.006,'paint')
for i in range(5):
    xx=-.521+i*.236;B('버터바 품목 카드',xx,-.220,.08,.205,.014,.087,'paper')
    B('카드 상호',xx,-.229,.137,.124,.003,.010,'ink')
    B('카드 맛과 금액',xx,-.229,.104,.093,.003,.005,'ink')
for x in [-.516,-.330]:
    B('금박 포장 상자',x,-.045,.59,.176,.193,.132,'bag',.005)
    B('상자 접힘선',x,-.143,.641,.11,.002,.004,'filling')
B('진열장 위 안내 카드',-.354,.12,.59,.363,.022,.33,'pink')
B('쿠키 안내 그림자',-.354,.107,.69,.17,.003,.042,'edge')
for i in range(4):B('안내 카드 제목',-.354,.105,.82+i*.014,.175-(i%2)*.047,.002,.004,'ink')
# Keep true renderable glass outside the opaque merchandise draw. The game supplies its translucent panes.
drinks=root('버터크림라떼와 바통 휘낭시에',(15.6,-10.5,0))
child('테이블 코스터 · 버터크림라떼와 말차',drinks)
for x,d,body,top in [(-.114,.026,'coffee','foam'),(.114,.020,'matcha','pistachio')]:
    B('코르크 컵받침',x,d,.001,.142,.142,.006,'bag',.004)
    smooth(C('유리잔 두꺼운 굽',x,d,.007,[(.042,0),(.049,.003),(.049,.018),(.043,.021)],'glass',24))
    smooth(C('잔에 비치는 우유',x,d,.022,[(.044,0),(.049,.025),(.050,.053)],'milk' if body=='coffee' else 'coffee',26))
    smooth(C('라떼의 음료층',x,d,.073,[(.050,0),(.051,.052),(.050,.062)],body,26))
    smooth(C('흘러내린 크림',x,d,.125,[(.050,0),(.050,.015),(.051,.031),(.050,.037)],top,28))
    for j in range(15):
        dx=rng.uniform(-.031,.031);dd=rng.uniform(-.028,.028)
        m.piece('크림 표면 미세 기포',[(x+dx+.0017*cos(a*tau/5),d+dd+.0017*sin(a*tau/5),.1624) for a in range(5)],[tuple(range(5))],'milk' if top=='foam' else 'matcha')
    profile=[(.051,0),(.053,.011),(.053,.017),(.050,.019),(.049,.017),(.050,0)]
    n=22;verts=[(x+rad*cos(tau*i/n),d+rad*sin(tau*i/n),.157+h) for rad,h in profile for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,((j+1)%len(profile))*n+(i+1)%n,((j+1)%len(profile))*n+i)
           for j in range(len(profile)) for i in range(n)]
    smooth(m.piece('크림이 보이는 열린 유리잔 윗테',verts,faces,'glass'))
    mark('잔에 인쇄된 하프커피 로고',x,d-.050,.077,.023,'ink',.046)
child('종이에 놓인 긴 바통 휘낭시에',drinks)
B('종이 받침',0,-.130,.004,.232,.095,.004,'paper',.003)
capsule('휘낭시에 짙은 구운 면',0,-.130,.008,.198,.058,.025,'edge')
capsule('바통의 갈라진 황금색 표면',0,-.130,.033,.195,.057,.012,'bake')
T('구운 반죽의 가느다란 균열',[(-.071,-.13,.046),(-.045,-.127,.048),(-.018,-.133,.046),
                         (.012,-.129,.048),(.049,-.132,.047),(.071,-.127,.047)],.0022,'filling',5)
roots=[shell,bar,seating,sweets,drinks]
bpy.context.view_layer.update()
for g in roots:
    offset=Matrix.Translation(Vector(g['preview_origin']))
    for obj in g.all_objects:
        if g in (sweets,drinks):
            for modifier in obj.modifiers:
                if modifier.type=='BEVEL' and modifier.width<.009:modifier.segments=1
        # x increases towards the customer's right. Seen from the entrance the game looks
        # along local +Z; mirror x once here so the fascia and the wordmark read correctly.
        mirror=Matrix.Diagonal((-1,1,1,1))
        obj.data.transform(mirror@obj.matrix_world)
        obj.data.flip_normals()
        points=[v.co for v in obj.data.vertices]
        center=Vector([(min(v[i] for v in points)+max(v[i] for v in points))/2 for i in range(3)])
        obj.data.transform(Matrix.Translation(-center))
        obj.matrix_world=offset@Matrix.Translation(center)
        obj.select_set(False)
    g['reference']='네이버 지점·방문 사진과 하프커피 메뉴. 집기 수량, 치수, 실내 배치는 게임에 맞춘 근사.'
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        space=a.spaces.active;space.shading.color_type='MATERIAL';target=Vector((2.9,-3,1.0))
        space.region_3d.view_location=target;space.region_3d.view_distance=24
        space.region_3d.view_rotation=(target-Vector((10,13,9))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(here/'fp212.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
