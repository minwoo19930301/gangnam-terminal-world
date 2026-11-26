"""Native public visitor desk, paper guides and tourist reader photographed at Goto–Sebit."""
from pathlib import Path
from math import cos, sin, pi, tau
from random import Random
import bpy
from mathutils import Vector
import os, runpy, sys

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='고터·세빛 관광안내센터 · 방문자 공간'
scene.unit_settings.system='METRIC'
B,C,T=m.block,m.profile,m.rod
palette={'white':'f5f3eb','ivory':'e9e6db','sill':'d2cfc5','shadow':'a9a79f','paper':'eeeade','cream':'ede2c1',
         'edge':'c3bfb0','glow':'fff2cc','sand':'d7bc8d','ochre':'bd9053','deep':'424b48','char':'353937',
         'navy':'315066','blue':'5799b8','water':'80bfc6','sky':'add6dc','pale':'dbe6d1','green':'71a37d',
         'leaf':'466e55','lime':'b5bd75','coral':'d57762','brick':'af6355','rose':'cf8093','purple':'9284aa',
         'stone':'a7a29c','steel':'b4b6af','warm':'c5bfb4','screen':'152534','ui':'256aab','tint':'d4eaf1',
         'steelblue':'476172','black':'272929','silver':'c0c3c0','magenta':'c53486','yellow':'f1d51f',
         'cyan':'0094bd','peat':'62534b','tile':'e7e4da','vein':'b8b7b2','light':'faf7e6'}
for key,color in palette.items():m.palette[key]=m.material(key,color,.25 if key in ['steel','silver'] else 0)
rng=Random(20240710)
def group(name,parent):
    c=bpy.data.collections.new(name);parent.children.link(c);m.group=c;return c
def native(name,origin):
    c=group('세빛 안내 · '+name,scene.collection);c['preview_origin']=origin
    c['출처']='서울관광재단 지점 전경, 서울시 현장기사 2011692. 치수와 현재 책자 수량은 근사.'
    return c
def poly(name,xz,d,color):
    return m.piece(name,[(x,d,z) for x,z in xz],[tuple(range(len(xz)))],color)
def rounded(name,x,d,z,w,dep,h,r,color):
    pts=[]
    for hx,hd,a in [(1,1,0),(-1,1,pi/2),(-1,-1,pi),(1,-1,pi*1.5)]:
        for j in range(6):
            t=a+j*pi/10;pts.append((x+hx*(w/2-r)+r*cos(t),d+hd*(dep/2-r)+r*sin(t)))
    n=len(pts);vs=[(xx,dd,z+zz) for zz in (0,h) for xx,dd in pts]
    fs=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return m.piece(name,vs,fs,color)
def front_rect(name,x,d,z,w,h,tone):
    return poly(name,[(x-w/2,z),(x+w/2,z),(x+w/2,z+h),(x-w/2,z+h)],d,tone)
def inset_text(name,txt,x,d,z,width,height,mat,ko=False):
    curve=bpy.data.curves.new(name,'FONT');curve.body=txt;curve.align_x='CENTER';curve.align_y='CENTER'
    curve.size=1;curve.resolution_u=2
    if ko:curve.font=font
    ob=bpy.data.objects.new(name,curve);m.group.objects.link(ob);curve.materials.append(m.palette[mat])
    ob.rotation_euler=(pi/2,0,pi);ob.location=(x,-d,z)
    bpy.context.view_layer.update()
    xs=[q[0] for q in ob.bound_box];ys=[q[1] for q in ob.bound_box]
    k=min(width/max(.0001,max(xs)-min(xs)),height/max(.0001,max(ys)-min(ys)));ob.scale=(k,k,k)
    bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob.select_set(False)
    return ob
candidates=[os.getenv('GTW_KOREAN_FONT',''),'/System/Library/Fonts/Supplemental/AppleGothic.ttf',
            '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/nanum/NanumGothic.ttf']
font_file=next((p for p in candidates if p and Path(p).is_file()),None)
if not font_file:raise RuntimeError('Set GTW_KOREAN_FONT to a Korean OTF or TTF to rebuild the editable lettering.')
font=bpy.data.fonts.load(font_file)
def skyline(name,x,d,z,w,h,ink,kind,slope=.19):
    # Original illustrations on the paper covers. Every layer is flat against a sloping sheet.
    def shape(points,col,off=0):
        pts=[(x+(u-.5)*w,d-.00055-off+v*h*slope,z+v*h) for u,v in points]
        return m.piece(name,pts,[tuple(range(len(pts)))],col)
    if kind in [0,1]:
        shape([(0,.04),(1,.04),(1,.60),(0,.60)],'sky')
        shape([(0,.34),(.16,.47),(.27,.42),(.47,.56),(.62,.4),(.85,.50),(1,.42),(1,.06),(0,.06)],'green',.0006)
        shape([(.08,.18),(.64,.18),(.78,.07),(0,.07)],'sand',.0013)
        shape([(.44,.39),(.67,.39),(.67,.23),(.44,.23)],'cream',.0016)
        shape([(.30,.37),(.43,.41),(.54,.51),(.64,.43),(.79,.40),(.73,.35),(.40,.35)],ink,.0021)
        shape([(.32,.385),(.53,.47),(.75,.393),(.75,.402),(.54,.49)],'stone',.00219)
        for tx,ty,r in [(.18,.34,.057),(.24,.30,.062),(.815,.34,.052),(.86,.32,.05)]:
            pts=[(tx+r*cos(k*tau/8),ty+r*sin(k*tau/8)) for k in range(8)]
            shape(pts,'leaf',.00198)
        for px in [.456,.525,.596,.659]:shape([(px,.34),(px+.015,.34),(px+.014,.21),(px,.21)],'brick',.0024)
        shape([(.19,.13),(.54,.24),(.62,.22),(.28,.10)],'stone',.0026)
    elif kind in [2,3]:
        shape([(0,.04),(1,.04),(1,.57),(0,.57)],'sky')
        shape([(0,.36),(.13,.33),(.3,.48),(.48,.37),(.67,.43),(.9,.32),(1,.35),(1,.13),(0,.13)],'leaf',.0008)
        shape([(0,.19),(.31,.24),(.53,.19),(.80,.24),(1,.19),(1,.04),(0,.04)],'water',.0014)
        for i in range(5):
            u=.10+.17*i;shape([(u,.15),(u+.019,.15),(u+.019,.29),(u,.29)],'ivory',.0019)
        shape([(.04,.31),(.94,.31),(.94,.29),(.04,.29)],'ochre',.0021)
        for k in range(4):
            sx=.12+k*.20;vy=.092+.038*(k%2)
            shape([(sx,vy),(sx+.105,vy+.012),(sx+.132,vy+.009),(sx+.021,vy-.003)],'sky',.0026)
        if kind==3:
            shape([(.46,.41),(.49,.41),(.52,.57),(.47,.57)],'cream',.0023)
            shape([(.46,.56),(.55,.56),(.55,.60),(.46,.60)],ink,.0028)
    elif kind in [4,5]:
        shape([(0,.06),(1,.06),(1,.60),(0,.60)],'pale')
        for i in range(3):
            u=.10+.29*i
            shape([(u,.07),(u+.03,.07),(u+.12,.41),(u+.105,.43)],'leaf',.001)
            shape([(u+.12,.28),(u+.22,.36),(u+.23,.40),(u+.14,.37)],'green',.0011)
            shape([(u-.016,.41),(u+.075,.44),(u+.10,.55),(u+.16,.47),(u+.25,.49),(u+.21,.40),(u+.105,.36)],'rose' if kind==4 else 'ochre',.0017)
    else:
        shape([(0,.06),(1,.06),(1,.62),(0,.62)],'cream')
        shape([(0,.15),(.28,.4),(.42,.34),(.72,.60),(.88,.58),(.50,.26),(.32,.32),(.13,.13)],'water',.0011)
        for i in range(4):
            u=.13+.2*i
            shape([(u,.08),(u+.032,.08),(u+.14,.61),(u+.11,.61)],'ochre',.0015)
        for i in range(2):
            v=.24+i*.18;shape([(.02,v),(.95,v+.078),(.95,v+.10),(.02,v+.022)],'paper',.0019)
def booklet(x,d,z,w,h,kind,main,accent,title=None):
    # The front cover leans back into a second folded copy; the block has a visible spine and page edge.
    def sheet(name,dx,dd,zz,ww,hh,th,tone):
        x0,x1=dx-ww/2,dx+ww/2
        vs=[(x0,dd,zz),(x1,dd,zz),(x1,dd+hh*.19,zz+hh),(x0,dd+hh*.19,zz+hh)]
        return m.piece(name,vs+[(u,v+th,w) for u,v,w in vs],[(0,1,2,3),(7,6,5,4),(0,4,5,1),(3,2,6,7),(0,3,7,4),(1,5,6,2)],tone)
    sheet('접힌 여분 안내책자',x+.006,d+.022,z+.006,w*.997,h,.020,'paper')
    sheet('낱장 가장자리',x,d+.002,z,w,h,.019,'edge')
    sheet('책자 표지와 접힌 책등',x,d-.001,z,w,h,.002,main)
    skyline('직접 그린 표지 삽화',x,d-.002,z,w,h,accent,kind)
    for v,ww in [(.89,.48),(.82,.31)]:
        # Small title/subtitle bars on the copies with no legible name in the reference.
        if title and v==.89:continue
        m.piece('인쇄된 소제목',[(x-w*ww*.5,d+h*v*.19-.003,z+h*v),(x+w*ww*.5,d+h*v*.19-.003,z+h*v),
          (x+w*ww*.5,d+h*(v+.018)*.19-.003,z+h*(v+.018)),(x-w*ww*.5,d+h*(v+.018)*.19-.003,z+h*(v+.018))],[(0,1,2,3)],accent)
    if title:
        tx=inset_text('관광책자의 지명',title,x,d+h*.89*.19-.004,z+h*.89,w*.80,h*.11,accent,ko=not title.isascii())
        tx.rotation_euler.x-=.188
def cabinet(width,bays,h=2.41):
    B('책장 뒤 패널',0,.228,.05,width,.062,h,'ivory')
    B('하단 받침',0,.023,.035,width-.08,.386,.081,'sill')
    B('하부 수납장',0,.035,.11,width,.392,.382,'white',.008)
    for i in range(bays+1):
        x=(i/bays-.5)*width
        if i not in [0,bays]:B('아래 문 이음선',x,-.164,.121,.008,.008,.345,'shadow')
        B('세로 칸막이',x,.047,.476,.036,.352,h-.43,'white')
    for level in range(6):
        z=.485+level*.378
        B('흰 가로 선반',0,.045,z,width+.036,.372,.033,'white')
        if level>0:B('선반 아래 따뜻한 띠 조명',0,-.038,z-.012,width-.045,.113,.010,'glow')
    for j in range(5):
        z=.525+j*.378;B('책 낙하 방지 투명턱 상단',0,-.139,z+.041,width,.012,.009,'steel')
        B('책자 받침 하단',0,-.130,z-.008,width,.026,.017,'ivory')

shelf=native('흰 다섯 단 서가와 여행 책자',(0,0,0))
group('흰 서가와 간접등',shelf);cabinet(5.05,5)
group('관광 책자 · 다섯 단',shelf)
style=[('white','navy'),('cream','ochre'),('pale','leaf'),('sky','navy'),('paper','brick'),('pale','coral'),('rose','navy'),('cream','leaf')]
for j in range(5):
    for i in range(5):
        for k in range(4):
            x=(i-2)*1.01+(k-1.5)*.225
            kind=(i*3+j*2+(k//2))%8 if i>0 else (0 if j%2 else 1)
            main,ink=(('white','navy') if i==0 else style[(i+j+k//2)%len(style)])
            label=(['서울','Seoul','ソウル','首爾'][j%4] if i==0 else ['SEOUL','HAN RIVER','SEOCHO','SEOUL MAP'][kind%4]) if k%2==0 else None
            booklet(x,-.117,.529+j*.378,.17+rng.random()*.036,.238+rng.random()*.050,kind,main,ink,label)

reader=native('다국어 책장과 세로 열람 화면',(7,0,0))
group('다국어 지도 선반',reader);cabinet(1.32,1)
group('네 언어 서울 안내책자',reader)
for j,language in enumerate(['서울','Seoul','ソウル','首爾','서울']):
    for k in range(4):
        booklet((k-1.5)*.273,-.115,.529+j*.378,.205,.276,0,'white','ochre' if j==1 else 'navy',language)
group('벽에 들어간 디지털 열람기',reader)
B('화면 흰 빌트인 패널',-1.18,.062,.035,1.03,.384,2.423,'white',.009)
B('짙은 모니터 베젤',-1.18,-.146,.632,.82,.043,1.550,'char',.008)
front_rect('청색 터치 화면',-1.18,-.169,.664,.758,1.481,'ui')
front_rect('키보드가 올라온 상단',-1.18,-.17,1.804,.758,.340,'screen')
for j in range(4):
    for i in range(11):
        xx=-1.18+(i-5)*.065+(j%2)*.009
        front_rect('각진 키와 자판',xx,-.172,1.845+j*.073,.059,.060,'steelblue')
        if i%3==0:front_rect('키 레전드',xx,-.173,1.863+j*.073,.016,.006,'tint')
inset_text('디지털 관광안내 제목','서울 여행 안내',-1.18,-.173,1.762,.42,.049,'white',True)
for i,title in enumerate(['지도','미술관','체험','공연','축제']):
    xx=-1.18+(2-i)*.145
    front_rect('상단 메뉴 열',xx,-.171,1.619,.138,.107,'navy')
    inset_text('열람 항목',title,xx,-.174,1.700,.107,.025,'white',True)
    for xp,zp in [(-.026,1.648),(0,1.655),(.026,1.648)]:
        front_rect('메뉴 윤곽 아이콘',xx+xp,-.174,zp,.005,.029,'tint')
    front_rect('메뉴 픽토그램의 테두리',xx,-.174,1.644,.059,.005,'tint')
for i in range(4):
    xx=-1.18+(1.5-i)*.179
    for j in range(3):
        z=1.346-j*.268
        front_rect('화면의 종이 가이드',xx,-.172,z,.140,.224,['tint','sky','pale','cream'][(i+j)%4])
        if j==0:
            front_rect('서울 관광지도 머리띠',xx,-.174,z+.079,.138,.141,'ui')
            inset_text('디지털 지도 영문 표기','SEOUL',xx,-.176,z+.188,.114,.03,'white')
            inset_text('디지털 지도 영문 표기','TOUR MAP',xx,-.176,z+.153,.123,.023,'white')
            inset_text('디지털 가이드 언어',['한국어','English','日本語','中文'][i],xx,-.175,z+.052,.12,.022,'navy',i!=1)
        else:
            skyline('화면 표지 미리보기',xx,-.174,z,.123,.154,'navy',(i+j)%6,0)
            inset_text('화면의 지역 책자',['서울','Seoul','지도','SEOUL'][i],xx,-.175,z+.166,.095,.031,'navy',i%2==0)
        front_rect('화면 카드 아래 라벨',xx,-.178,z,.14,.024,'steelblue')
front_rect('하단 설정 띠',-1.18,-.17,.67,.758,.052,'steelblue')
for i in range(3):front_rect('탐색 버튼',-1.18+(i-1)*.095,-.172,.686,.051,.010,'white')

desk=native('곡면 방문 안내대와 상담 집기',(13,0,0))
group('곡면 전면과 상담 자리',desk)
rounded('안쪽으로 들어간 걸레받이',0,.03,.015,5.03,.99,.081,.16,'sill')
rounded('아이보리 곡면 안내대',0,0,.088,5.18,1.06,.849,.205,'ivory')
rounded('두터운 상판',0,0,.936,5.23,1.095,.080,.212,'white')
rounded('낮춘 업무 테이블',0,.62,.692,4.78,.56,.048,.075,'white')
for i in [0,1,2]:
    x=(i-1)*1.59
    B('모니터 받침',x,.34,1.018,.234,.178,.015,'black',.004)
    B('화면 지주',x,.34,1.03,.052,.042,.104,'char')
    B('직원 모니터의 뒤판',x,.37,1.115,.52,.046,.283,'char',.011)
    for j in range(5):B('등판 방열선',x+.133,.344,1.155+j*.014,.111,.004,.004,'deep')
    B('사무용 의자 좌판',x,.92,.407,.48,.466,.074,'steelblue',.024)
    B('높이 조절 봉',x,.92,.10,.048,.051,.337,'silver')
    B('등받이',x,1.115,.506,.48,.060,.412,'shadow',.022)
    for j in range(5):
        aa=j*tau/5;tip=(x+.245*cos(aa),.92+.245*sin(aa),.075)
        T('별 모양 의자 다리',[(x,.92,.122),tip],.011,'char')
        B('작은 가구 바퀴',tip[0],tip[1],.025,.052,.046,.05,'char',.006)
    B('관광 통역 안내 명패',x-.44,-.16,1.018,.245,.095,.012,'sill')
    B('안내 명패',x-.44,-.135,1.034,.238,.014,.087,'paper',.009)
    inset_text('안내대 언어 표시',['한국어','English','日本語'][i],x-.44,-.144,1.077,.191,.042,'navy',ko=i!=1)

sign=native('삼색 상호와 은색 안내 벽',(20,0,0))
group('안내대 뒤 타공판과 기관 상호',sign)
B('안내판 바탕',0,.02,.033,5.68,.135,2.66,'ivory')
B('하부 흰장',0,-.07,.088,5.68,.147,.676,'white')
for i in range(7):B('하부장 세로 이음',-2.78+i*.927,-.145,.093,.008,.008,.644,'sill')
B('타공판 어두운 하부',0,-.071,.787,5.63,.054,1.836,'warm')
# Fine perforations remain a single plane, grouped into one hue in the game buffer.
pts=[];fs=[]
for i in range(138):
    for j in range(43):
        x=-2.775+i*.0405;z=.806+j*.042;n=len(pts);r=.0077
        pts.extend([(x-r,-.100,z-r),(x+r,-.100,z-r),(x+r,-.100,z+r),(x-r,-.100,z+r)])
        fs.append((n,n+1,n+2,n+3))
m.piece('금속 타공판의 어두운 구멍',pts,fs,'shadow')
def bloom(x,z,r,tone,depth):
    pts=[]
    for i in range(5):
        a=pi/10+i*tau/5
        for rad,shift in [(.17,-.45),(.55,-.21),(1.0,-.13),(1.03,.10),(.89,.21),(.19,.4)]:
            pts.append((x+r*rad*cos(a+shift),z+r*rad*sin(a+shift)))
    # The pale motif ends at the metal frame as in the frontal photo.
    for edge,signum in [(-2.806,1),(2.806,-1)]:
        result=[];last=pts[-1]
        for cur in pts:
            inside=(cur[0]-edge)*signum>=0;before=(last[0]-edge)*signum>=0
            if inside!=before:
                t=(edge-last[0])/(cur[0]-last[0]);result.append((edge,last[1]+t*(cur[1]-last[1])))
            if inside:result.append(cur)
            last=cur
        pts=result
    poly('서초의 다섯 갈래 꽃 심벌',pts,depth,tone)
for x,z,r,c in [(2.22,2.09,.305,'magenta'),(1.95,1.925,.230,'yellow'),(2.28,1.64,.30,'cyan')]:bloom(x,z,r,c,-.103)
for x,z,r in [(-2.52,1.43,.64),(-2.07,1.05,.55)]:bloom(x,z,r,'sill',-.102)
inset_text('고터·세빛 관광안내센터 상호','고터·세빛 관광안내센터',.02,-.112,1.877,3.20,.275,'char',True)
inset_text('영문 관광안내센터 상호','Goteo · Sebit Tourist Information Center',.02,-.111,1.665,3.15,.10,'char')
arrival=native('천장 매입등과 입구 문턱',(29,0,0))
group('흰 천장과 원형 냉방기',arrival)
B('흰 천장 바탕',.005,0,2.799,12.99,9.30,.105,'white')
for px in [-3.93,-1.28,2.05,4.70]:
    for pd in [-3.01,.72,3.27]:
        C('매입등 테두리',px,pd,2.774,[(.068,0),(.074,.012),(.074,.024)],'sill',16)
        C('매입등 확산판',px,pd,2.772,[(.052,0),(.056,.009)],'light',16)
for px,pd in [(0,-.21),(3.65,1.92)]:
    B('냉방기 사각 마감',px,pd,2.776,1.18,1.18,.027,'ivory',.018)
    C('원형 송풍구 바깥',px,pd,2.739,[(.497,0),(.507,.025),(.497,.040)],'sill',42)
    C('검은 유입 틈',px,pd,2.733,[(.465,0),(.473,.012)],'char',42)
    C('원형 천장 카세트',px,pd,2.719,[(.400,0),(.445,.016),(.450,.028)],'ivory',42)
    vs=[];fs=[]
    for k in range(1,8):
        for q in range(k*6):
            a=tau*(q+(k%2)*.5)/(k*6);rr=k*.041;x=px+rr*cos(a);d=pd+rr*sin(a);r=.0095;n=len(vs)
            vs.extend([(x+r*cos(tau*j/5), d+r*sin(tau*j/5),2.717) for j in range(5)]);fs.append(tuple(range(n,n+5)))
    m.piece('원판의 오각 흡기공',vs,fs,'shadow')
for px,pd in [(2.15,-.85),(-2.12,2.25)]:
    B('천장 점검구의 테두리',px,pd,2.787,.558,.55,.012,'sill')
    B('천장과 같은 색인 점검구 덮개',px,pd,2.785,.546,.538,.007,'white')
group('검정 줄무늬의 노란 문턱',arrival)
B('문턱 앞 황색 시인성 띠',2.20,-4.684,-.110,2.01,.044,.109,'yellow')
for i in range(12):
    x=1.208+i*.169
    poly('문턱 위 비스듬한 검은 띠',[(x,-.037),(x+.061,-.037),(x+.115,-.002),(x+.055,-.002)],-4.708,'char')
inset_text('문턱에 적힌 영문 표시','WATCH YOUR STEP',2.18,-4.709,-.077,.49,.025,'char')
for root in [shelf,reader,desk,sign,arrival]:
    # Native collections are arranged beside each other for editing; the game places them independently.
    offset=Vector(root['preview_origin'])
    for obj in root.all_objects:obj.location+=offset
for f in list(bpy.data.fonts):
    if f==font or f.users==0:bpy.data.fonts.remove(f,do_unlink=True)
scene.render.engine='CYCLES'
for workspace in bpy.data.workspaces:
    for screen in workspace.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                area.spaces.active.region_3d.view_location=(8,0,1.3)
                area.spaces.active.region_3d.view_distance=15
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'visitor-desk.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
