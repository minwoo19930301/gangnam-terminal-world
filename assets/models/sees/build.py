"""Model the public See's Candies FP-104 corner and its chocolate samples in Blender."""
from pathlib import Path
from math import cos,sin,tau,pi,sqrt
from random import Random
import bpy
from mathutils import Matrix,Vector
import json,runpy,sys
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='파미에 FP-104 · 씨즈캔디';scene.unit_settings.system='METRIC'
B,C,T=m.block,m.profile,m.rod
colors={'floorPale':'e7e4da','floorWhite':'edece3','floorLight':'e3ded0','floorBlack':'27272a','floorInk':'202024',
 'floorBlue':'292b31','grout':'75746e','ivory':'e7e1d5','off':'eee9dc','white':'f5f2e9','trim':'d4cfc1','bone':'d7cbb5',
 'black':'262421','rim':'393630','edge':'514d45','logo':'f7f0da','shadow':'b6ac98','film':'3e403e','print':'656660',
 'silver':'b2b7b3','steel':'848a88','dark':'373733','paper':'ebe6d9','card':'f6f2e9','gold':'c9a960','foil':'d5b747',
 'blue':'779cd0','glow':'96bbeb','bluegrey':'8396a2','rose':'cba6a6','red':'ad4237','amber':'c79746',
 'cocoa':'594333','milk':'6f4f3a','bitter':'483831','caramel':'bc8e56','cream':'e7ca95','nut':'bf996b',
 'almond':'d6b17e','pistachio':'a6ad81','toffee':'b5773d','mocha':'8b6247','whiteChoc':'e3d3a8',
 'mint':'a4baba','plum':'a58da5','yellow':'d5c387','sky':'9aadbf','lilac':'b4a1b1','pearl':'ddd9c8','bag':'e3dfd1',
 'lamp':'fff4d7','redCard':'ba5143','honey':'c6a467'}
for name,h in colors.items():m.palette[name]=m.material(name,h,.35 if name in ('gold','foil','silver','steel') else 0)
rng=Random(10467);roots=[]
def section(name,parent):
    c=bpy.data.collections.new(name);parent.children.link(c);m.group=c;return c
def native(label,offset):
    c=section('씨즈캔디 · '+label,scene.collection);c['preview_origin']=offset;roots.append(c);return c
def slab(name,outline,y,height,tone):
    n=len(outline);v=[(x,d,y+h) for h in (0,height) for x,d in outline]
    f=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return m.piece(name,v,f,tone)
def boxrim(name,x,d,y,w,depth,h,r,tone):
    pts=[]
    for ix,id,a in [(1,1,0),(-1,1,pi/2),(-1,-1,pi),(1,-1,pi*1.5)]:
        for j in range(5):
            v=a+pi/8*j;pts.append((x+ix*(w/2-r)+r*cos(v),d+id*(depth/2-r)+r*sin(v)))
    return slab(name,pts,y,h,tone)
def front_shape(name,outline,d,thick,tone):
    n=len(outline);v=[(x,d+k,z) for k in (-thick/2,thick/2) for x,z in outline]
    f=[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,n+i,n+(i+1)%n,(i+1)%n) for i in range(n)]
    return m.piece(name,v,f,tone)

shell=native('체크 바닥과 검은 상호 외벽',(0,0,0))
section('흑백 바닥 타일과 문턱',shell)
x0,x1=-4.24,3.64;d0,d1=.015,7.22
B('줄눈 바탕',(x0+x1)/2,(d1+d0)/2,.031,x1-x0,d1-d0,.011,'grout')
cell=.475
for i in range(17):
    a=x0+i*cell;b=min(a+cell,x1)
    for j in range(16):
        c=d0+j*cell;e=min(c+cell,d1)
        if b-a<.012 or e-c<.012:continue
        B('자기질 정사각 타일', (a+b)/2,(c+e)/2,.041,b-a-.005,e-c-.005,.006,
          rng.choice(['floorBlack','floorBlack','floorBlue','floorInk'] if (i+j)%2 else ['floorPale','floorWhite','floorPale','floorLight']))
B('얇은 금속 문턱',1.435,0,.048,2.18,.038,.008,'silver')
section('둥근 모서리의 쇼윈도와 출입문',shell)
for lo,hi in [(x0,-3.72),(-.02,.35),(2.52,2.77),(3.46,x1)]:
    B('아이보리 전면 벽체',(lo+hi)/2,0,.018,hi-lo,.155,2.90,'ivory')
    B('흑색 바닥 굽',(lo+hi)/2,-.016,.035,hi-lo+.005,.167,.098,'black')
for a,b in [(-3.72,-.02),(2.77,3.46)]:
    radius=min(.23,(b-a)*.23);spring=2.45;top=2.82
    left=[(a+radius-radius*cos(q*pi/16),spring+radius*sin(q*pi/16)) for q in range(9)]
    right=[(b-radius+radius*sin(q*pi/16),spring+radius*cos(q*pi/16)) for q in range(9)]
    front_shape('쇼윈도 둥근 인방',left+right+[(b,top),(a,top)],0,.155,'ivory')
    for xx in (a,b):B('금속 창틀',xx+.002,0,.068,.024,.09,spring-.07,'shadow')
    B('창 하부 가는 레일',(a+b)/2,0,.048,b-a,.11,.035,'silver')
    T('곡면 창틀',[(xx,-.034,zz) for xx,zz in left+right],.013,'shadow',6)
B('열린 출입구 인방',1.435,0,2.70,2.17,.16,.209,'ivory')
for xx in [.35,2.52]:B('입구 문선',xx,.001,.035,.045,.17,2.67,'silver')
for lo,hi in [(0,.64),(6.67,7.22)]:
    B('열린 판매창의 모서리 기둥',x0,(lo+hi)/2,0,.15,hi-lo,2.90,'ivory')
    B('검은 기단',x0-.012,(lo+hi)/2,.035,.168,hi-lo,.098,'black')
section('전면과 회랑 측 입체 워드마크',shell)
B('차콜 전면 프리즈',(x0+x1)*.5,0,2.82,x1-x0+.11,.226,.82,'black')
B('회랑 상호띠',x0,3.65,2.82,.238,7.32,.82,'black')
for h in [2.844,3.589]:
    B('전면 상호 테두리',(x0+x1)*.5,-.126,h,x1-x0+.092,.035,.026,'rim')
    B('회랑 상호 테두리',x0-.13,3.65,h,.027,7.31,.026,'rim')
for xx in [x0+.11,-1.33,2.84,x1-.08]:B('상호띠 세로 몰딩',xx,-.126,2.884,.027,.026,.673,'rim')
outlines=json.loads((here/'wordmark.json').read_text())
def wordmark(name,x,d,z,width,side=False):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='2D';curve.fill_mode='BOTH';curve.extrude=.006
    for ring in outlines:
        spline=curve.splines.new('POLY');spline.points.add(len(ring)-1);spline.use_cyclic_u=True
        for p,(xx,yy) in zip(spline.points,ring):p.co=((xx-358)*width/716,(51-yy)*width/716,0,1)
    curve.materials.append(m.palette['logo']);obj=bpy.data.objects.new(name,curve);m.group.objects.link(obj)
    obj.rotation_euler=(pi/2,0,-pi/2 if side else pi);obj.location=(x,-d,z)
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj.select_set(False)
wordmark('정면의 See’s CANDIES 입체 글자',.78,-.158,3.227,3.46)
wordmark('회랑의 See’s CANDIES 입체 글자',x0-.157,3.68,3.227,3.47,True)
section('회랑 판매창 상부의 금속 조명',shell)
for d in [1.38,2.58,3.78,4.98,6.18]:
    B('짧은 천장 브래킷',x0+.17,d,2.66,.06,.045,.17,'silver')
    C('작은 원통 조명',x0+.17,d,2.603,[(.052,0),(.057,.015),(.054,.085)],'silver',12)
    C('등기구 확산판',x0+.17,d,2.602,[(.041,0),(.042,.004)],'lamp',12)

section('출입문 옆 판촉 포스터와 뒷벽의 집기',shell)
B('검은 발판',-2.69,-.11,.041,.46,.319,.023,'black')
T('높이조절 기둥',[(-2.69,-.11,.064),(-2.69,-.11,1.28)],.016,'steel',8)
B('광고 스탠드 은색 테두리',-2.69,-.115,.81,.534,.038,.699,'silver')
B('리본 선물 안내 도안',-2.69,-.137,.823,.507,.008,.67,'off')
B('붉은 포장지 가로띠',-2.69,-.145,1.292,.499,.005,.031,'red')
for side in [-1,1]:
    T('리본 고리', [(-2.69,-.148,1.30),(-2.69+side*.096,-.148,1.432),(-2.69+side*.163,-.148,1.413),
        (-2.69+side*.177,-.148,1.363),(-2.69+side*.131,-.148,1.329),(-2.69,-.148,1.30)],.009,'red',6)
    T('매듭 아래 리본', [(-2.69,-.149,1.31),(-2.69+side*.05,-.149,1.229),(-2.69+side*.12,-.149,1.202)],.012,'red',6)
B('포스터의 짙은 선물 상자',-2.715,-.147,.914,.345,.004,.195,'bitter')
for i in range(6):
    xx=-2.849+(i%3)*.118;hh=.933+(i//3)*.078
    B('포스터 안의 초콜릿 도안',xx,-.151,hh,.096,.003,.051,['caramel','cream','honey','mocha'][i%4])
B('포스터 하단 브랜드 표시',-2.68,-.148,.843,.184,.004,.026,'film')
B('뒷벽의 흰 문',.72,7.135,.051,1.01,.056,2.14,'ivory')
for xx in [.19,1.25]:B('뒷문 금속 문선',xx,7.092,.049,.028,.040,2.18,'trim')
B('뒷문 상단 문선',.72,7.092,2.208,1.09,.04,.03,'trim')
T('문 수평 핸들',[(.34,7.097,.96),(.34,7.057,.96),(.47,7.057,.96)],.014,'steel',8)
B('벽걸이 케이스 프레임',-1.91,7.093,1.37,.73,.050,.87,'gold')
B('프레임 안의 인쇄 바탕',-1.91,7.062,1.393,.682,.014,.812,'paper')
for i in range(4):
    for j in range(3):
        B('초콜릿 형상을 담은 작은 벽면 도안',-2.129+i*.146,7.051,1.476+j*.153,.101,.004,.077,
          ['milk','honey','bitter','caramel'][(i+j)%4])
B('벽면 도안의 제목',-1.91,7.050,2.024,.394,.005,.047,'film')

rack=native('물결 선반과 선물 상자',(10,0,0))
section('푸른 배경의 하부 칸과 물결형 선반 옆판',rack)
B('벽장 바닥장',0,.025,.045,5.68,.69,.126,'off')
B('아래칸 푸른 뒤판',0,.303,.17,5.58,.039,.65,'blue')
B('상자 진열 카운터',0,.018,.812,5.72,.70,.086,'white',.014)
B('상부장 바탕',0,.291,.90,5.64,.055,1.45,'off')
for k in range(5):
    xx=(k-2)*1.12
    B('하부 상자의 옅은 푸른 바탕',xx,.278,.181,1.033,.019,.604,'blue' if k%2 else 'glow')
for k in range(6):
    xx=(k-2.5)*1.12
    B('아래 진열칸 세로대',xx,.018,.151,.058,.656,.67,'off')
    # The two flowing returns rise from the worktop toward the high shelf at the wall.
    outline=[(-.25,.895),(-.166,1.016),(-.14,1.15),(-.168,1.292),(-.151,1.452),(-.07,1.523),
             (.047,1.577),(.10,1.666),(.115,1.929),(.16,2.042),(.24,2.128),(.295,2.156),
             (.295,.895)]
    v=[(xx+w,d,z) for w in [-.026,.026] for d,z in outline];n=len(outline)
    f=[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    m.piece('물결 모양 흰 지지대',v,f,'off')
    T('물결 가장자리 짙은 선',[(xx-.029,d-.007,z) for d,z in outline[:-2]],.007,'edge',5)
for h,dd,depth in [(1.614,.095,.397),(2.153,.146,.283)]:
    B('상부 긴 선반',0,dd,h,5.65,depth,.047,'white')
    B('간접조명 홈',0,dd-depth/2+.047,h-.013,5.51,.018,.017,'glow')
section('흑백 상점 기록을 가리키는 작은 프레임',rack)
for j in range(7):
    xx=(j-3)*.785
    B('은색 사진 프레임',xx,.245,2.221,.748,.058,.38,'edge')
    B('흑백 도안 종이',xx,.21,2.241,.715,.010,.34,'shadow')
    if j%2:
        B('가게 처마 형상',xx,.202,2.421,.56,.005,.065,'film')
        for v in [-.235,-.116,.04,.202]:B('옛 쇼윈도 창살',xx+v,.202,2.29,.021,.005,.13,'film')
        B('창대',xx,.202,2.279,.57,.004,.027,'print')
    else:
        for k in range(5):B('포장 공정 그림의 병렬 윤곽',xx-.25+k*.125,.202,2.274,.06,.005,.10+(k%3)*.042,'print')
        T('포장대 그림의 선반',[(xx-.28,.200,2.267),(xx+.28,.200,2.267)],.009,'film',5)

def face_quads(name,rects,d,tone):
    vs=[];fs=[]
    for x0,z0,x1,z1 in rects:
        n=len(vs);vs.extend([(x0,d,z0),(x1,d,z0),(x1,d,z1),(x0,d,z1)]);fs.append((n,n+1,n+2,n+3))
    if fs:m.piece(name,vs,fs,tone)

def mark(x,d,z,w):
    B('작은 납품 상표',x,d,z,w,.0025,w*.174,'film')
    B('밝은 워드마크 자획',x,d-.0017,z+w*.069,w*.72,.0018,w*.025,'off')
def gift(x,d,z,w,dep,h,style):
    back=['off','off','yellow','plum','red','gold','black','paper'][style%8]
    B('선물 상자 본체',x,d,z,w,dep,h,back,.0045)
    f=d-dep/2-.001
    if style%8 in (0,1):
        n=8;cell=w/n
        squares=[]
        for j in range(max(1,int(h/cell))):
            for i in range(n):
                if (i+j)%2==0:squares.append((x-w*.5+i*cell,z+j*cell,x-w*.5+(i+1)*cell,z+min((j+1)*cell,h)))
        face_quads('검고 흰 선물지 체크',squares,f,'black')
        B('누운 상자의 가운데 띠',x,f-.002,z+h*.36,w*.95,.004,h*.31,'paper')
        mark(x,f-.0045,z+h*.45,w*.37)
    elif style%8 in (4,5):
        B('선물 상자 금박 리본',x+w*.18,f-.002,z,w*.066,.004,h,'foil')
        B('교차 리본',x,f-.0026,z+h*.56,w,.003,h*.074,'foil')
        mark(x-w*.091,f-.0048,z+h*.25,w*.42)
    else:
        B('상자 인쇄 띠',x,f-.0015,z+h*.16,w*.84,.003,h*.62,'paper')
        mark(x,f-.0035,z+h*.61,w*.47)
        for i in range(2):B('초콜릿 상품 일러스트',x+(.13 if i else -.10)*w,f-.0053,z+h*.32,w*.17,.002,h*.12,'milk' if i else 'bitter')
    B('상자 뚜껑의 가는 띠',x,d,z+h*.87,w+.004,dep+.004,.006,'bone' if style%8!=6 else 'edge')

def placard(x,d,z,w=.14,h=.092):
    B('상품 설명 종이',x,d,z,w,.008,h,'paper')
    lines=[(x-w*.24,z+h*.67,x+w*.24,z+h*.72),(x-w*.31,z+h*.42,x+w*.32,z+h*.46),(x-w*.17,z+h*.27,x+w*.18,z+h*.30)]
    face_quads('요약 표기의 인쇄선',lines,d-.005,'print')
    B('표찰 받침',x,d,z,w+.007,.044,.011,'silver')
section('가격 표찰과 겹쳐 놓은 포장 박스',rack)
for j in range(5):
    cx=(j-2)*1.12
    for i in range(3):
        xx=cx+(i-1)*.268
        for r in range([2,3,2][(i+j)%3]):
            gift(xx,.026,.178+r*.117,.244,.28,.116,(j+i+r//2)%8)
    for i in range(3):
        xx=cx+(i-1)*.285;h=.18 if i%2 else .218
        for r in range(1+(i+j)%2):gift(xx,.055,.903+r*h,.252,.19,h,(j*2+i)%8)
        if i!=1:placard(xx,-.278,.9,.13,.082)
    for i in range(3):
        xx=cx+(i-1)*.242;gift(xx,.071,1.661,.212,.147,.211,(j+i+2)%8)
    if j in (1,3):
        gift(cx+.09,.115,1.872,.208,.14,.188,(j+4)%8)
for i in range(7):
    xx=(i-3)*.722
    gift(xx,.172,2.20,.36,.105,.156,(i+1)%8)

counter=native('둥근 주문대와 사선 견본장',(0,-10,0))
section('흰 곡면 판매대와 금속 걸레받이',counter)
boxrim('후퇴한 받침',0,.0,.048,4.31,.88,.095,.10,'shadow')
boxrim('손님 쪽으로 둥근 카운터',0,0,.141,4.43,.974,.794,.135,'ivory')
boxrim('흰색 카운터 상판',0,0,.935,4.48,1.0,.079,.152,'white')
for h in [.157,.868]:
    B('전면 장식 가로줄',0,-.491,h,4.14,.01,.016,'trim')
for x in [-1.46,-.49,.49,1.46]:
    B('전면 패널의 가는 세로홈',x,-.491,.16,.009,.008,.70,'trim')
section('사선 유리를 받치는 금속 견본장',counter)
case_x=-.515;case_w=3.13
B('견본장 바닥 카세트',case_x,0,1.015,case_w+.037,.854,.053,'silver')
B('흰 에나멜 내부',case_x,0,1.061,case_w,.809,.023,'white')
for x in [case_x-case_w/2,case_x+case_w/2]:
    T('앞쪽 사선 유리 프레임',[(x,-.428,1.068),(x,-.313,1.522),(x,.38,1.522)],.014,'silver',7)
    B('뒤쪽 유리 기둥',x,.38,1.07,.025,.029,.45,'steel')
for d,h in [(-.433,1.071),(-.311,1.517),(.379,1.517)]:
    B('알루미늄 가로 몰딩',case_x,d,h,case_w+.035,.026,.024,'silver')
for x in [-1.29,.23]:T('상부 유리 연결부',[(x,-.305,1.531),(x,.378,1.531)],.0048,'silver',5)
B('결제 단말기 받침',.90,.30,1.023,.249,.207,.039,'black')
T('POS 받침 다리',[(.90,.30,1.037),(.90,.355,1.175)],.029,'edge',8)
pay=B('POS 화면 모서리',.90,.351,1.148,.30,.026,.157,'black',.009)
B('결제 화면',.90,.334,1.164,.276,.004,.12,'bluegrey')
for i in range(3):B('단말기 입력 버튼',.799+i*.065,.331,1.181,.046,.003,.022,['pearl','blue','gold'][i])
section('프레임 안의 낮은 흰 견본 단',counter)
for i,h in enumerate([0,.06,.114]):
    B('단면을 받친 전시 층판',case_x,-.24+i*.245,1.084,case_w-.076,.23,max(.012,h),'white' if i%2==0 else 'off')

samples=native('통초콜릿과 잘라 보인 단면',(8,-10,0))
section('흰 접시 위 통초콜릿과 반쪽 초콜릿',samples)
def contour_z(x,z,rx,rz,shape,n=22):
    p=.65 if shape in ('square','bar') else 1
    return [(x+rx*(1 if cos(i*tau/n)>=0 else -1)*abs(cos(i*tau/n))**p,
              z+rz*(1 if sin(i*tau/n)>=0 else -1)*abs(sin(i*tau/n))**p) for i in range(n)]
def bonbon(x,d,z,tone,inside,shape,cut):
    radius={'round':.031,'square':.0315,'bar':.040,'nut':.033,'swirl':.032}[shape]
    height=.047 if shape!='bar' else .037
    layers=[(.66,.0),(1,.003),(1.035,.28),(.95,.66),(.72,.91),(.38,1)]
    nx=12 if cut else 20;v=[];f=[]
    for r,h in layers:
        for j in range(nx+1):
            a=j*(pi if cut else tau)/nx
            xx,dd=cos(a),sin(a);exp=.48 if shape in ('square','bar') else 1
            k=1+.045*sin(4*a+.9) if shape=='nut' else 1
            xx=(1 if xx>=0 else -1)*abs(xx)**exp;dd=(1 if dd>=0 else -1)*abs(dd)**exp
            v.append((x+radius*r*xx*k,d+radius*r*dd*(.65 if shape=='bar' else 1)*k,z+h*height))
    for i in range(len(layers)-1):
        for j in range(nx):
            n=i*(nx+1)+j;f.append((n,n+1,n+nx+2,n+nx+1))
    start=(len(layers)-1)*(nx+1);f.append(tuple(range(start,start+nx+1)));f.append(tuple(reversed(range(nx+1))))
    if cut:
        f.append(tuple(i*(nx+1) for i in range(len(layers)))+tuple(i*(nx+1)+nx for i in reversed(range(len(layers)))))
    obj=m.piece('반쪽 코팅' if cut else '통초콜릿의 코팅',v,f,tone)
    for p in obj.data.polygons[:-2]:p.use_smooth=True
    if cut:
        xs=[(x-radius*r,z+height*h) for r,h in layers]+[(x+radius*r,z+height*h) for r,h in reversed(layers)]
        midz=z+height*.47
        core=[(x+(xx-x)*.875,midz+(zz-midz)*.84) for xx,zz in xs]
        front_shape('노출된 크림·캐러멜 단면',core,d-.0014,.0014,inside)
        if shape in ('bar','nut','square'):
            for i,delta in enumerate([-.011,.008]):
                ring=contour_z(x+delta,midz+(i-.5)*.008,.009,.0054,'round',12)
                front_shape('단면에 보이는 아몬드 조각',ring,d-.0026,.0011,'almond' if inside!='almond' else 'cream')
                front_shape('아몬드 눈금',contour_z(x+delta,midz+(i-.5)*.008,.0046,.0025,'round',9),d-.0032,.0008,'cream')
    elif shape in ('swirl','round'):
        path=[]
        for j in range(21):
            a=j*tau/16;r=radius*(.50-.015*j);path.append((x+r*cos(a),d+r*sin(a),z+height*(.94+.005*j)))
        T('윗면에 짜 올린 초콜릿 소용돌이',path,.0028,tone,5)
    else:
        for j in range(3):
            xx=x+(j-1)*radius*.35
            T('초콜릿 윗면의 얇은 줄',[(xx-.004,d-.012,z+height*.902),(xx,d,z+height*1.03),
                (xx+.006,d+.013,z+height*.91)],.0019,'mocha' if tone=='bitter' else tone,5)
pairings=[('milk','cream','round'),('bitter','caramel','square'),('cocoa','almond','bar'),('milk','pistachio','nut'),
          ('bitter','cream','swirl'),('milk','toffee','square'),('mocha','cream','bar'),('bitter','caramel','nut')]
# Models share the case centre and deck; three low risers keep the back row visible.
for row,(d,base) in enumerate([(-.238,.017),(.003,.064),(.252,.118)]):
    for i in range(9):
        xx=(i-4)*.315;z=base+.001
        C('희고 얕은 원형 견본 접시',xx,d,z,[(.068,0),(.074,.003),(.076,.006),(.069,.007)],'paper',18,.69)
        tone,fill,shape=pairings[(i+row*3)%len(pairings)]
        bonbon(xx-.031,d,z+.007,tone,fill,shape,False)
        bonbon(xx+.041,d-.004,z+.007,tone,fill,shape,True)
        # Restaurant photos show small printed captions on the clear front rail of each row.
        placard(xx,d-.079,z+.001,.099,.035)

pops=native('개별 포장 롤리팝과 사탕',(12,-10,0))
section('맛별로 구분한 투명 상자의 롤리팝',pops)
B('아크릴 정리함의 받침',0,0,.004,.654,.287,.016,'pearl')
for x in [-.328,-.163,0,.163,.328]:
    B('투명칸 모서리의 반사선',x,0,.017,.006,.287,.131,'silver')
B('낮은 앞 테두리',0,-.145,.015,.66,.008,.055,'pearl')
def label_text(words,x,d,z,size,material):
    curve=bpy.data.curves.new('영문 상품 표기','FONT');curve.body=words;curve.align_x='CENTER';curve.size=size
    curve.resolution_u=3;curve.materials.append(m.palette[material])
    obj=bpy.data.objects.new('맛 표찰 · '+words,curve);m.group.objects.link(obj)
    obj.location=(x,-d,z);obj.rotation_euler=(pi/2,0,pi)
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj.select_set(False)
for i in range(4):
    xx=(i-1.5)*.162
    B('맛을 적은 개별 표찰',xx,-.147,.023,.145,.008,.057,'paper')
    label_text(['Butterscotch','Chocolate','Café Latte','Vanilla'][i],xx,-.152,.046,.016,'film')
    for row in range(3):
        for j in range(3):
            x=xx+(j-1)*.045+rng.uniform(-.005,.005);d=-.061+row*.069+rng.uniform(-.008,.008)
            z=.033+row*.017;dx=rng.uniform(-.037,.037);dd=rng.uniform(-.027,.027)
            tone=['foil','bitter','mocha','cream'][i]
            # Wrapped rectangular sugar heads sit down in the separated clear bins.
            boxrim('은박·호일 개별 포장',x,d,z,.044,.032,.061,.006,tone)
            B('포장지 가운데 인쇄',x,d-.018,z+.017,.031,.002,.022,'paper' if i in (0,1) else 'rose')
            for hh in [.012,.057]:T('접어 넣은 포장지 끝',[(x-.022,d,z+hh),(x-.012,d-.019,z+hh+.005),
                (x+.018,d-.018,z+hh)],.0023,'honey' if i==0 else 'pearl',4)
            T('위로 기운 롤리팝 막대',[(x,d,z+.061),(x+dx*.3,d+dd*.3,z+.135),
                (x+dx,d+dd,z+.237+(.021 if row==2 else 0))],.0037,'off',6)
section('작은 사탕 통과 횡으로 담은 포장',pops)
for i,col in enumerate(['mint','yellow','rose','sky']):
    xx=-.52+(i%2)*.10;dd=-.055+(i//2)*.111
    C('캔디 원형 통',xx,dd,.023,[(.033,0),(.04,.012),(.04,.047),(.035,.054)],col,16)
    C('원형 통의 흰 표찰',xx,dd,.077,[(.026,0),(.026,.002)],'paper',14)
for i in range(4):
    gift(.446+(i%2)*.129,-.05+(i//2)*.113,.013,.114,.092,.048,(i+1)%8)

stand=native('둥근 전시대의 포장 선물',(15,-10,0))
section('둥근 두 단 진열장',stand)
C('흰색 원형 받침',0,0,.051,[(.43,0),(.453,.018),(.453,.094),(.436,.101)],'off',48)
C('원통 장 하부',0,0,.147,[(.426,0),(.429,.24),(.421,.27)],'ivory',40)
for z,r in [(.389,.497),(.783,.534)]:
    C('검은 모서리가 보이는 선반',0,0,z,[(r-.02,0),(r,.009),(r,.021),(r-.004,.025)],'edge',48)
    C('흰 선반 판',0,0,z+.021,[(r,0),(r,.019),(r-.009,.029)],'off',48)
C('두 선반 사이 짧은 중심 기둥',0,0,.414,[(.152,0),(.163,.04),(.149,.362)],'ivory',24)
section('포장지 사이로 보이는 금색 사탕',stand)
def gift_bag(x,d,z,scale,tone):
    rr=.052*scale
    for i,(xx,dd,hh) in enumerate([(-.022,-.016,0),(.022,-.009,.002),(-.011,.023,.009),(.013,.006,.031),(-.014,-.014,.050)]):
        foil=C('은박을 씌운 초콜릿 알',x+xx*scale,d+dd*scale,z+hh*scale,
            [(rr*.32,0),(rr*.48,.010*scale),(rr*.52,.023*scale),(rr*.37,.038*scale),(rr*.14,.043*scale)],tone,9)
        for p in foil.data.polygons[:-2]:p.use_smooth=True
    for i in range(6):
        a=tau*i/6;dx=cos(a);dd=sin(a)
        if i%2==0:
            fan=[(x+rr*.58*dx,d+rr*.58*dd,z+.003*scale),(x+rr*1.19*dx,d+rr*1.19*dd,z+.049*scale),
                 (x+rr*1.02*cos(a+.27),d+rr*1.02*sin(a+.27),z+.073*scale),(x+rr*.23*dx,d+rr*.23*dd,z+.113*scale),
                 (x+rr*.40*cos(a+.30),d+rr*.40*sin(a+.30),z+.152*scale)]
            m.piece('투명 봉지에 비친 얇은 삼각 접힘',fan,[(0,1,2),(2,3,4)],'pearl')
        T('접힌 투명 봉지의 능선',[(x+rr*.49*dx,d+rr*.49*dd,z+.006*scale),
            (x+rr*1.05*dx,d+rr*dd,z+.063*scale),(x+rr*.22*dx,d+rr*.22*dd,z+.115*scale),
            (x+rr*.43*dx,d+rr*.43*dd,z+(.145+(i%2)*.02)*scale)],.0016*scale,'pearl',4)
    B('흰 리본과 아랫면이 접힌 종이표',x,d-rr*.68,z+.055*scale,rr*1.15,.005,.043*scale,'paper')
    T('리본 매듭',[(x-rr*.45,d,z+.125*scale),(x,d-.01,z+.112*scale),
        (x+rr*.47,d,z+.134*scale)],.0045*scale,'film',5)
for j,(h,r,n) in enumerate([(.441,.314,6),(.835,.330,5)]):
    for i in range(n):
        a=i*tau/n+j*.31
        gift_bag(r*cos(a),r*sin(a),h,1.58 if j else 1.19,(['foil','silver','foil','pearl','silver'] if j else ['mint','silver','sky','rose','pearl','mint'])[i])
placard(.04,-.408,.837,.152,.191)

glass_front=native('둥근 정면 쇼윈도 유리',(0,-15,0))
section('흰 벽체 안쪽의 매장 유리',glass_front)
m.palette['glass']=m.material('저반사 쇼윈도 유리','d0e0dc')
m.palette['glass'].diffuse_color=(.62,.76,.77,.14)
sh=m.palette['glass'].node_tree.nodes.get('Principled BSDF');sh.inputs['Alpha'].default_value=.14
sh.inputs['Roughness'].default_value=.12
for a,b in [(-3.72,-.02),(2.77,3.46)]:
    radius=min(.23,(b-a)*.23);spring=2.45
    pts=[(a,.08,.08),(b,.08,.08)]
    pts.extend((b-radius+radius*cos(i*pi/16),.08,spring+radius*sin(i*pi/16)) for i in range(9))
    pts.extend((a+radius-radius*sin(i*pi/16),.08,spring+radius*cos(i*pi/16)) for i in range(9))
    m.piece('위 모서리가 둥근 통유리',pts,[tuple(range(len(pts)))],'glass')
glass_case=native('견본장의 사선 보호유리',(11,-15,0))
section('사선 보호유리와 상부 유리',glass_case)
a,b=case_x-case_w/2+.014,case_x+case_w/2-.014
for name,pts in [('손님 쪽 사선 유리',[(a,-.425,1.081),(b,-.425,1.081),(b,-.307,1.517),(a,-.307,1.517)]),
                 ('윗면 통유리',[(a,-.307,1.517),(b,-.307,1.517),(b,.369,1.517),(a,.369,1.517)])]:
    m.piece(name,pts,[(0,1,2,3)],'glass')
for xx in [a,b]:
    m.piece('끝판 유리',[(xx,-.425,1.081),(xx,-.307,1.517),(xx,.369,1.517),(xx,.369,1.081)],[(0,1,2,3)],'glass')

bpy.context.view_layer.update()
for root in roots:
    offset=Matrix.Translation(Vector(root['preview_origin']))
    for obj in root.all_objects:
        center=sum((Vector(v) for v in obj.bound_box),Vector())/8
        obj.data.transform(Matrix.Translation(-center))
        obj.matrix_world=offset @ obj.matrix_world @ Matrix.Translation(center)
        obj.select_set(False)
    root['reference']='씨즈캔디 코리아 FP-104 안내, 2024·2025 지점 방문 사진. 제품의 수량·정확한 유리 각도·실측 치수는 재구성.'
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        sp=area.spaces.active;sp.shading.color_type='MATERIAL';target=Vector((4,-4,1))
        sp.region_3d.view_location=target;sp.region_3d.view_distance=18
        sp.region_3d.view_rotation=(target-Vector((8,15,7))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(here/'fp104.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
