"""Seoul Express Bus Terminal staffed baggage counter, public customer-facing furniture only."""
from math import cos,pi,sin
from pathlib import Path
import json
import runpy
import sys
import bpy
from mathutils import Vector

here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene;sc.unit_settings.system='METRIC'
sc['reference']='Zimcarry Seoul Express Bus Terminal official branch interior DSC09660 and DSC09699, plus April 2025 visit.'
sc['layout']='Passenger side adjoining the ticket office. Counter width, sign height, bag materials, count and colour are reconstructed.'
def group(name):
    c=bpy.data.collections.new(name);sc.collection.children.link(c);c['bundle']='luggage-counter';c['origin']=[0,0,0];return c
case=group('LuggageCounter');glass=group('Glass');lit=group('Lit');m.group=case
tones={'벽':'f2f0e6','상판':'f5f2e7','무광백':'e8e5d9','그늘':'c9c6b7','검은철':'292c2b','몸체':'383e40','고무':'26282a',
       '밝은검정':'555b5a','프레임':'494e51','황토':'a98955','은빛':'c4cecb','회색':'929b9d','모서리':'6c7779','아크릴':'c7e1e3',
       '하늘':'b4d4df','투명빛':'e6edef','온백색':'fff8df','주광색':'ecf5f3','인쇄':'555858','노랑':'edb830','선명노랑':'f8d54c',
       '밝은청':'78c4d5','흐린파랑':'afc2ce','바다':'417f99','남색':'3a5166','민트':'65a197','장미':'c99382','붉은색':'b7564f',
       '황동':'ae9872','포장지':'e4deca','천':'6d737a','어두운천':'3a454c','옆천':'525f68','아이보리':'ebe0c4','지도':'dae2e2',
       '화면':'91bbcd','박스':'aa9171','갈색':'875f47','흰종이':'f6f3e7'}
for n,col in tones.items():m.palette[n]=m.material(n,col)
m.palette['아크릴'].diffuse_color=(*m.palette['아크릴'].diffuse_color[:3],.12)
block=m.block;rod=m.rod;piece=m.piece;profile=m.profile
def face(name,pts,mat):return piece(name,pts,[tuple(range(len(pts)))],mat)
def flat(name,x,d,z,w,h,tone):
    return face(name,[(x-w/2,d,z-h/2),(x+w/2,d,z-h/2),(x+w/2,d,z+h/2),(x-w/2,d,z+h/2)],tone)
def oval(name,x,d,z,rx,rz,tone,n=18):
    return face(name,[(x+rx*cos(2*pi*k/n),d,z+rz*sin(2*pi*k/n)) for k in range(n)],tone)
def extrude_plan(name,points,z,h,mat):
    n=len(points);coords=[(x,d,z+v) for v in [0,h] for x,d in points]
    return piece(name,coords,[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(k,(k+1)%n,n+(k+1)%n,n+k) for k in range(n)],mat)
def roundrect(x0,d0,x1,d1,r):
    pts=[]
    for cx,cd,start in [(x1-r,d1-r,0),(x0+r,d1-r,pi/2),(x0+r,d0+r,pi),(x1-r,d0+r,3*pi/2)]:
        for k in range(7):
            a=start+k*pi/12;pts.append((cx+r*cos(a),cd+r*sin(a)))
    return pts
def caption(name,value,x,d,z,size,color):
    font=bpy.data.curves.new(name,'FONT');font.body=value;font.align_x='CENTER';font.align_y='CENTER';font.size=size;font.resolution_u=4;font.extrude=.0012
    font.materials.append(m.palette[color]);o=bpy.data.objects.new(name,font);m.group.objects.link(o);o.location=(x,-d,z);o.rotation_euler.x=pi/2
    bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
    mesh=bpy.data.objects.new(name,bpy.data.meshes.new_from_object(o.evaluated_get(dg)));m.group.objects.link(mesh);mesh.matrix_world=o.matrix_world.copy();bpy.data.objects.remove(o,do_unlink=True)
# Off-white wrapped shell, recessed sill and black curved hanging frame in the operator's branch photograph.
extrude_plan('수하물 접수 · 흰 카운터 하부',roundrect(-2.10,-.69,.83,.445,.105),.021,.893,'벽')
extrude_plan('접수대 · 얇게 튀어나온 상판',roundrect(-2.13,-.713,.855,.47,.12),.905,.042,'상판')
block('접수대 · 바닥 걸레받이',-.625,.425,.016,2.73,.018,.063,'그늘')
block('사진 속 오른쪽 벽 · 안내판 받침',1.47,-.07,.01,1.23,.23,2.97,'벽')
block('벽면 가장자리 · 걸레받이',1.46,.046,.012,1.196,.018,.058,'모서리')
block('매장 · 뒷벽',-.02,-1.80,.018,4.15,.11,2.92,'무광백')
block('접수 창구 · 좌측 돌출 측판',-2.06,-.64,.01,.105,1.21,2.92,'벽')
extrude_plan('입구 · 둥근 처마 코너',roundrect(-2.15,-1.76,2.12,.46,.20),2.57,.405,'벽')
extrude_plan('처마 · 얇은 검정 상단선',roundrect(-2.16,-1.77,2.13,.472,.207),2.973,.038,'검은철')
for x in [-1.74,-.69,.34,1.34]:
    profile('처마 하부 · 원형 조명 가장자리',x,.23,2.557,[(.054,0),(.055,.016)],'회색',16)
    m.group=lit;profile('처마 하부 · 원형 광원',x,.23,2.555,[(.046,0),(.047,.004)],'온백색',16);m.group=case
# The U-shaped rod is open behind the backlit trade name.
pts=[(-1.69,.098,2.57),(-1.69,.098,2.33)]
for k in range(1,9):
    a=pi+k*pi/16;pts.append((-1.49+.20*cos(a),.098,2.33+.20*sin(a)))
pts.append((.45,.098,2.13))
for k in range(1,9):
    a=-pi/2+k*pi/16;pts.append((.45+.20*cos(a),.098,2.33+.20*sin(a)))
pts.append((.65,.098,2.57));rod('상호 · U자형으로 절곡한 검정 간판틀',pts,.020,'검은철',10)
block('상호 · 투명 글자 지지대',-.52,.102,2.144,1.12,.038,.042,'프레임')
# The suitcase pictogram sits next to the Korean branch name.
block('상호 · 여행 가방 아이콘 본체',-1.038,.127,2.172,.181,.032,.196,'노랑',.016)
rod('상호 · 미니 가방 손잡이',[(-1.083,.143,2.365),(-1.083,.143,2.389),(-1.005,.143,2.389),(-1.005,.143,2.365)],.008,'은빛')
for xx in [-1.096,-.983]:oval('상호 · 가방 바퀴',xx,.148,2.166,.013,.014,'검은철',10)
face('상호 · 대각선 흰색 띠',[(-1.119,.148,2.26),(-.947,.148,2.326),(-.947,.148,2.289),(-1.119,.148,2.222)],'흰종이')
# Aluminium baggage trolley left of the window. A yellow strap crosses its lower load.
for d in [-.73,-1.30]:
    for side in [-1,1]:
        x=-1.24+side*.61
        rod('수하물 랙 · 사각 파이프',[(x,d,.11),(x,d,1.49),(x-side*.015,d,1.551),(x-side*.075,d,1.581),
            (x-side*.22,d,1.581)],.026,'검은철',10)
    rod('수하물 랙 · 상단 레일',[(-1.68,d,1.581),(-.81,d,1.581)],.024,'검은철',10)
    for k in range(4):rod('수하물 랙 · 세로 선재',[(-1.71+k*.31,d,.18),(-1.71+k*.31,d,1.56)],.012,'몸체',8)
block('수하물 랙 · 선반',-1.24,-1.01,.162,1.22,.60,.027,'프레임')
for x in [-1.23,-.70]:
    rod('수하물 랙 · 가로 이동 손잡이',[(x,-1.29,1.40),(x,-.73,1.40)],.018,'검은철',8)
block('짐 고정 · 노란 직물 스트랩',-1.24,-.696,.995,1.22,.014,.055,'노랑')
# A display facing the passenger, a second cashier monitor, and two slanted service placards.
def monitor(x,d,z,w,h,passenger):
    block('모니터 · 납작한 받침',x,d,z,w*.65,.17,.019,'검은철')
    block('모니터 · 목',x,d-.026,z+.014,.085,.062,.12,'몸체')
    block('모니터 · 본체',x,d,z+.115,w,.060,h,'검은철',.008)
    panel=d+.033
    if not passenger:
        block('후면 모니터 · 돌출 허브',x,d+.045,z+.17,w*.60,.057,h*.51,'몸체')
        for k in range(12):flat('후면 모니터 · 환기선',x-w*.33+k*w*.058,panel+.006,z+.115+h*.84,w*.035,.008,'그늘')
        return
    m.group=lit
    flat('고객 안내 · 화면 바탕',x,panel,z+.115+h*.51,w*.927,h*.883,'화면')
    flat('고객 안내 · 대합실 안내 도면',x-.012,panel+.0015,z+.115+h*.56,w*.858,h*.45,'지도')
    for k in range(11):
        flat('표시창 · 축소 승차홈',x-w*.36+k*w*.068,panel+.003,z+.115+h*.505,w*.032,h*.044,'회색')
        if k%2:flat('표시창 · 일반 구역',x-w*.35+k*w*.067,panel+.003,z+.115+h*.65,w*.039,h*.04,'모서리')
    for j in range(3):flat('표시창 · 안내 문장 표시',x-.054,panel+.002,z+.135+j*.014,w*.55,.006,'남색')
    m.group=case
monitor(.472,-.093,.949,.56,.34,True);monitor(-.38,-.12,.949,.38,.302,False)
for x in [-.04,.152]:
    block('안내판 · 아크릴 발',x,.204,.948,.165,.116,.014,'아크릴')
    pts=[(x-.079,.239,.959),(x+.079,.239,.959),(x+.079,.181,1.192),(x-.079,.181,1.192)]
    face('접수 안내 · 흰 종이',pts,'흰종이')
    for j in range(6):
        z=.996+j*.026;d=.244-(z-.959)*.25
        flat('접수 안내 · 단락',x,d,z,.108 if j!=5 else .066,.0055,'남색' if j==5 else '회색')
    m.group=glass;face('안내판 · 투명 전면',[(a,b+.005,c) for a,b,c in pts],'아크릴');m.group=case
block('접수대 · 작은 기록판',-1.38,.194,.950,.32,.18,.009,'몸체')
block('기록판 · 흰색 양식',-1.38,.191,.960,.302,.160,.002,'흰종이')
rod('기록판 · 느슨한 펜끈',[(-1.51,.19,.964),(-1.56,.23,.964),(-1.59,.27,.964),(-1.56,.30,.964),(-1.49,.285,.964)],.002,'몸체',5)
rod('고객용 볼펜',[(-1.49,.285,.968),(-1.39,.26,.968)],.0038,'남색',6)
# Suitcase shells have two rounded halves separated by a black welt.
# Flat ribs terminate before the zipper, spinner wheels stay clear of the lower shell.
def suitcase(x,d,z,w,depth,h,col,extended=0):
    r=w*.182;corner=roundrect(x-w/2,d-depth/2,x+w/2,d+depth/2,r)
    def shell(name,z0,z1,tint):
        rows=[]
        for elevation,f in [(z0,.88),(z0+.024,.97),(z0+.056,1),(z1-.058,1),(z1-.025,.975),(z1,.90)]:
            rows.append([(x+(a-x)*f,d+(b-d)*f,elevation) for a,b in corner])
        n=len(corner);verts=[p for row in rows for p in row]
        fs=[(j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k) for j in range(len(rows)-1) for k in range(n)]
        fs.extend([tuple(range(n-1,-1,-1)),tuple(range((len(rows)-1)*n,len(rows)*n))]);piece(name,verts,fs,tint)
    shell('캐리어 · 성형된 하드셸',z+.065,z+h,col)
    for side in [-1,1]:
        for j in range(7):
            ax=x+(j-3)*w*.101;dd=d+side*(depth/2-.002)
            rod('캐리어 · 눌러 만든 세로 골',[(ax,dd,z+.16),(ax,dd+side*.007,z+.18),(ax,dd+side*.010,z+h-.12),
                                            (ax,dd+side*.003,z+h-.093)],.007,'모서리',7)
    # Wrapped zipper around the two hard shell halves: long sides and arched cap.
    for side in [-1,1]:
        path=[(x+side*(w/2-.032),d,z+.083),(x+side*(w/2-.008),d,z+.115),(x+side*w/2,d,z+h-.073),
              (x+side*(w/2-.019),d,z+h-.028),(x+side*(w/2-.068),d,z+h-.008),(x,d,z+h-.007)]
        rod('캐리어 · 중간 지퍼 파이핑',path,.006,'검은철',6)
    for side in [-1,1]:
        for row in [-1,1]:
            xx=x+side*(w/2-.064);dd=d+row*(depth/2-.045)
            block('회전 바퀴 · 요크',xx,dd,z+.036,.049,.043,.050,'몸체',.005)
            for q in [-1,1]:
                p=(xx+q*.023,dd,z+.031)
                rod('스피너 · 고무 바퀴',[(p[0]-.008,p[1],p[2]),(p[0]+.008,p[1],p[2])],.028,'고무',12)
    for side in [-1,1]:
        xx=x+side*.088
        block('손잡이 · 고무 삽입부',xx,d-.028,z+h-.009,.046,.036,.017,'고무')
        if extended:
            block('손잡이 · 은색 텔레스코프',xx,d-.028,z+h,.021,.019,extended,'은빛')
            block('손잡이 · 짧은 검정 부싱',xx,d-.028,z+h+extended*.52,.025,.022,.012,'몸체')
    if extended:
        rod('손잡이 · 둥근 검정 그립',[(x-.089,d-.028,z+h+extended-.015),(x-.082,d-.028,z+h+extended+.01),
            (x+.082,d-.028,z+h+extended+.01),(x+.089,d-.028,z+h+extended-.015)],.015,'검은철',10)
    rod('상단 · 접히는 손잡이',[(x-.091,d+.043,z+h-.004),(x-.079,d+.043,z+h+.021),(x+.070,d+.043,z+h+.021),
        (x+.085,d+.043,z+h-.004)],.010,'검은철',8)
    rod('측면 · 접힌 손잡이',[(x+w/2,d+.028,z+h*.41),(x+w/2+.025,d+.028,z+h*.45),(x+w/2+.022,d+.028,z+h*.60),
        (x+w/2,d+.028,z+h*.64)],.011,'검은철',8)
    for k in range(2):
        rod('지퍼 · 작은 금속 슬라이더',[(x+w*.49,d,z+h*.77+k*.028),(x+w*.53,d+.008,z+h*.72+k*.026)],.005,'은빛',7)
    flat('캐리어 · 손글씨 없는 수하물 태그',x+.082,d+depth/2+.009,z+h-.13,.066,.090,'흰종이')
    for i in range(7):flat('태그 · 접수 라벨 도형',x+.061+i*.006,d+depth/2+.0105,z+h-.151,.003,.022,'프레임')
# The branch photo shows a dark duffel and bright soft bag on the left rack.
def softbag(x,d,z,w,depth,h,base,piping):
    pts=roundrect(x-w/2,d-depth/2,x+w/2,d+depth/2,w*.13);n=len(pts)
    rows=[]
    for height,f in [(0,.82),(.04,.96),(.13,1),(.76,.96),(.94,.82),(1,.63)]:
        rows.append([(x+(a-x)*f,d+(b-d)*f,z+height*h+.012*sin((i*1.73+x))*sin(height*pi)) for i,(a,b) in enumerate(pts)])
    fs=[(j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k) for j in range(len(rows)-1) for k in range(n)]
    fs.append(tuple(range((len(rows)-1)*n,len(rows)*n)));piece('연질 여행 가방 · 부풀은 천',sum(rows,[]),fs,base)
    for side in [-1,1]:
        b=d+side*depth*.465
        for ax in [-.26,.26]:
            xx=x+ax*w;rod('연질 가방 · 상단까지 이어지는 웨빙',[(xx,b,z+.03),(xx,b+.006*side,z+h*.65),(xx,d+side*depth*.337,z+h*.96)],.009,piping,7)
        rod('연질 가방 · 휜 손잡이',[(x-.26*w,d+side*depth*.33,z+h*.96),(x-.19*w,d+side*depth*.245,z+h+.093),
            (x+.17*w,d+side*depth*.245,z+h+.093),(x+.26*w,d+side*depth*.33,z+h*.96)],.011,piping,8)
    rod('연질 가방 · 여밈 지퍼',[(x-w*.37,d,z+h-.02),(x,d,z+h+.002),(x+w*.38,d,z+h-.021)],.006,'검은철',7)
suitcase(-1.54,-.945,.196,.442,.31,.905,'남색',.14)
softbag(-1.60,-.982,1.10,.48,.32,.33,'어두운천','밝은검정')
softbag(-.98,-.96,.987,.48,.33,.39,'선명노랑','몸체')
suitcase(-.99,-1.10,.196,.46,.32,.75,'회색',.04)
# One passenger's case stands close to the side of the service opening.
suitcase(-1.60,.86,.04,.42,.28,.636,'민트',.294)
# Narrow floor guide and two printed display posters beside the white wall.
for i,(ax,w) in enumerate([(1.072,.339),(1.50,.335),(1.895,.317)]):
    block('측벽 · 얇은 안내 포스터 틀',ax,.061,1.069,w,.025,.71,'황토' if i==0 else '검은철')
    flat('측벽 · 안내 포스터 용지',ax,.076,1.426,w-.018,.672,'흰종이' if i!=2 else '붉은색')
    if i==0:
        for row in range(3):
            for k in range(6):
                block('층별안내 · 단순 도면',ax-.116+k*.046,.079,1.23+row*.101,.026,.002,.047,'흐린파랑')
        caption('층별 지도 상단 영문','FLOOR MAP',ax,.079,1.706,.041,'인쇄')
    else:
        oval('전시 포스터 · 원형 그래픽',ax,.079,1.49,.111,.125,'밝은청' if i==1 else '흰종이',22)
        for k in range(5):
            flat('포스터 · 줄 표시',ax,.079,1.158+k*.033,.151 if k%2 else .198,.007,'남색' if i==1 else '상판')
# Distinct external front sign printed on the photographed desk.
caption('수하물보관 · 영문','LUGGAGE STORAGE & DELIVERY',-.35,.450,.523,.069,'검은철')
# Editable outlines of the photographed Korean labels, typeset in Nanum Gothic.
signs=json.loads((here/'signs.json').read_text())
for value,x,d,z,w,height,palette,coll in [('짐캐리',-.530,.150,2.273,.707,.196,'밝은청',lit),
                                        ('수하물보관 & 운송',-.350,.450,.651,.992,.121,'검은철',case)]:
    data=signs[value];x0,y0,x1,y1=data['bounds'];curve=bpy.data.curves.new('양각 안내 · '+value,'CURVE')
    curve.dimensions='2D';curve.fill_mode='BOTH';curve.extrude=.003;curve.materials.append(m.palette[palette])
    for ring in data['rings']:
        spline=curve.splines.new('POLY');spline.points.add(len(ring)-1);spline.use_cyclic_u=True
        for pt,(a,b) in zip(spline.points,ring):pt.co=(((a-x0)/(x1-x0)-.5)*w,((b-y0)/(y1-y0)-.5)*height,0,1)
    obj=bpy.data.objects.new('안내 · '+value,curve);coll.objects.link(obj);obj.location=(x,-d,z);obj.rotation_euler.x=pi/2
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj.select_set(False)
# Rear printed service placard: representative headings only.
block('주황 띠 안내판',-.025,-1.725,1.348,1.00,.035,.67,'흰종이')
flat('안내판 · 노란 표 머리글',-.025,-1.703,1.921,.95,.060,'노랑')
for j in range(6):
    flat('안내판 · 옅은 행 구분선',-.025,-1.703,1.544+j*.057,.94,.004,'회색')
    flat('안내판 · 안내 도형',-.248,-1.701,1.558+j*.057,.33,.009,'인쇄')
m.group=glass
flat('고객 모니터 · 얇은 전면 유리',.472,-.054,1.232,.49,.285,'아크릴')
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        view=area.spaces.active;view.shading.color_type='MATERIAL';view.region_3d.view_distance=6.3
        view.region_3d.view_location=(0,.25,1.45)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'zimcarry-counter.blend'),compress=True)
runpy.run_path(str(here/'export.py'))
