"""Build the publicly photographed mural-side benches, lights and mall promotion screen."""
from pathlib import Path
from math import sin,cos,pi,tau,radians
from mathutils import Matrix,Vector
import bpy,runpy,sys
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='피카소 벽화길 · 공공 집기';scene.unit_settings.system='METRIC'
colors={'blue':'277bb3','blueInk':'174d85','blueEdge':'3889bb','white':'ecebe4','whiteInk':'7794ad',
    'felt':'595b58','bronze':'bf956c','bronzeInk':'74563b','nickel':'999c98','matte':'24282c',
    'charcoal':'34383c','black':'101216','blackGlass':'0e1015','gasket':'222634','graphite':'42474d',
    'vent':'13191b','steel':'a2a6aa','darkMetal':'515859','aluminum':'b5b9b6','ivory':'e5e3d8',
    'lens':'f3efd5','reflector':'c2bda5','cable':'4b4c4d','blueGlow':'7be6eb','skyGlow':'7099f4'}
for key,code in colors.items():m.palette[key]=m.material(key,code,.48 if key in ('nickel','aluminum','darkMetal','steel') else 0)
B,C,T=m.block,m.profile,m.rod
subjects={}
def part(key,label,origin):
    c=bpy.data.collections.new('피카소 벽화길 · '+label);scene.collection.children.link(c)
    c['preview_origin']=origin;c['game_part']=key;subjects[key]=c;m.group=c;return c
def child(root,label):
    c=bpy.data.collections.new(label);root.children.link(c);m.group=c;return c
def shade(name,pts,w,color):
    # A flat, printed ribbon following an original line, including the folded ends.
    vertices=[];faces=[]
    for i,(x,d,z,nx,nz) in enumerate(pts):
        before=pts[max(0,i-1)];after=pts[min(len(pts)-1,i+1)]
        tangent=Vector((after[0]-before[0],after[1]-before[1],after[2]-before[2])).normalized()
        side=Vector((nx,0,nz)).cross(tangent).normalized()*w/2
        for sign in [-1,1]:vertices.append(tuple(Vector((x,d,z))+side*sign))
        if i:faces.append((2*i-2,2*i-1,2*i+1,2*i))
    return m.piece(name,vertices,faces,color)
def bench(key,label,origin,tone,ink):
    parent=part(key,label,origin);child(parent,'일체형 절곡 좌판과 양끝 다리')
    # One continuous, rounded U-section. The middle underneath is open, as in the district photograph.
    length,width,height,thick,outer=1.98,.455,.466,.055,.034
    half=length/2;shape=[(-half,.019),(-half,height-outer)]
    for j in range(1,8):
        a=pi-j*pi/14;shape.append((-half+outer+outer*cos(a),height-outer+outer*sin(a)))
    shape.append((half-outer,height))
    for j in range(1,8):
        a=pi/2-j*pi/14;shape.append((half-outer+outer*cos(a),height-outer+outer*sin(a)))
    shape.extend([(half,.019),(half-thick,.019),(half-thick,height-thick-.012)])
    for j in range(1,6):
        a=j*pi/10;shape.append((half-thick-.012+.012*cos(a),height-thick-.012+.012*sin(a)))
    shape.append((-half+thick+.012,height-thick))
    for j in range(1,6):
        a=pi/2+j*pi/10;shape.append((-half+thick+.012+.012*cos(a),height-thick-.012+.012*sin(a)))
    shape.extend([(-half+thick,.019)])
    verts=[(x,d,z) for d in [-width/2,width/2] for x,z in shape];n=len(shape)
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    m.piece('좌판에서 수직 다리로 이어지는 한 장',verts,faces,tone,.0025)
    for x in [-half+thick/2,half-thick/2]:
        B('양끝 다리 밑 고무 슈',x,0,.003,.050,.442,.017,'felt',.004)
        for d in [-.137,.137]:
            C('낮은 고정발',x,d,0,[(.017,0),(.020,.007)],'felt',12)
    for d in [-.156,.156]:
        B('안쪽 강성 보강 접힘',0,d,height-thick-.025,1.84,.023,.024,tone,.0035)
    child(parent,'좌판과 측면을 잇는 인쇄 선과 기념 표지')
    # Original curving linework on the evidenced blue/white finish, without copying mural artwork.
    for row,start,end in [(0,-.99,.52),(1,-.48,.99),(2,.12,.97)]:
        curve=[]
        if row==0:
            for i in range(9):
                t=i/8;curve.append((-half-.0008,-.09+.066*sin(t*pi*1.3),.105+(height-outer-.105)*t,-1,0))
            for j in range(1,8):
                a=pi-j*pi/14;curve.append((-half+outer+(outer+.0008)*cos(a),-.1411,height-outer+(outer+.0008)*sin(a),cos(a),sin(a)))
        for i in range(38):
            t=i/37;x=max(-half+outer,start)+(min(half-outer,end)-max(-half+outer,start))*t
            d=(-.1411+.07*sin(2.04*pi*t)+.081*t) if row==0 else ((-.015 if row==1 else .147)+.059*sin(2.31*pi*t+.55)*(.55+.45*sin(pi*t)))
            curve.append((x,d,height+.0008,0,1))
        if row==1:
            last=curve[-1][1]
            for j in range(1,8):
                a=pi/2-j*pi/14;curve.append((half-outer+(outer+.0008)*cos(a),last,height-outer+(outer+.0008)*sin(a),cos(a),sin(a)))
            for i in range(1,15):
                t=i/14;curve.append((half+.0008,last+.068*sin(t*pi*1.6),height-outer-(height-.11)*t,1,0))
        shade('이어지는 인쇄 선 '+str(row+1),curve,.015 if row!=1 else .021,ink)
    B('좌판 끝 작은 금속 표지',-.782,.125,height+.0013,.228,.081,.0024,'bronze',.003)
    for x in [-.881,-.681]:
        for d in [.095,.155]:C('표지 체결점',x,d,height+.004,[(.002,0),(.0022,.0006)],'bronzeInk',8)
    for j,w in enumerate([.085,.121,.087]):
        B('표지의 작은 인쇄 줄',-.791,.107+j*.014,height+.004,w,.0024,.0004,'bronzeInk')
bench('blue','파란 절곡 벤치',(-1.45,0,0),'blue','blueInk')
bench('white','흰 절곡 벤치',(1.45,0,0),'white','whiteInk')

body=part('screen-body','홍보 모니터 프레임',(0,-4.2,0))
child(body,'무광 흑색 모듈과 매입 부분')
B('화면 위아래의 무광 외장 패널',0,.073,.009,4.69,.099,3.59,'charcoal',.002)
B('짙은 상부 처마와 하단 선',0,.003,3.298,4.69,.220,.137,'matte',.005)
B('바닥의 얇은 걸레받이',0,-.002,.008,4.69,.089,.094,'graphite',.003)
B('벽체 매입 받침',0,.046,.163,4.69,.195,2.78,'graphite',.018)
B('곡면으로 마감한 전면 테두리',0,-.043,.202,4.64,.152,2.697,'matte',.022)
B('패널 안쪽 검은 홈',0,-.122,.300,4.50,.016,2.484,'black',.012)
# Physical black side panels around the portrait programme. A shallow seam divides only the non-image areas.
B('전면 LED 검은 표시 면',0,-.133,.331,4.444,.009,2.422,'blackGlass',.007)
for x in [-1.69,-1.15,1.15,1.69]:
    B('측면 LED 타일 사이의 수직 줄',x,-.1382,.336,.0035,.001,2.406,'gasket')
for side in [-1,1]:
    for z in [.93,1.54,2.14]:
        B('블랙 바 쪽 타일 줄',side*1.52,-.1384,z,1.395,.001,.003,'gasket')
child(body,'아래 유지관리 띠와 모서리')
for x in [-1.69,-.57,.57,1.69]:
    B('무광 하단 덮개',x,-.125,.206,1.107,.012,.086,'charcoal',.004)
    for dx in [-.49,.49]:
        B('하단 덮개 체결점',x+dx,-.134,.238,.009,.003,.009,'steel',.001)
for side in [-1,1]:
    B('모니터 옆 단차',side*2.306,-.038,.235,.039,.16,2.61,'darkMetal',.003)
    for j in range(12):
        B('프레임 아래 통풍구',side*1.887+j*.019*(1 if side<0 else -1),-.135,.243,.011,.002,.029,'vent',.002)
B('패널 하부 세로 센서',2.027,-.135,.248,.013,.003,.019,'black',.002)

# Individual extruded aluminium channels and capsule-shaped diffusers.
def capsule(name,x,z,width,height,depth,d,tone):
    r=width/2;pts=[]
    for j in range(11):
        a=j*pi/10;pts.append((x+r*cos(a),z+height-r+r*sin(a)))
    for j in range(11):
        a=pi+j*pi/10;pts.append((x+r*cos(a),z+r+r*sin(a)))
    n=len(pts);verts=[(xx,d+dd,zz) for dd in [-depth/2,depth/2] for xx,zz in pts]
    return m.piece(name,verts,[tuple(reversed(range(n))),tuple(range(n,n*2))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)],tone)
# A continuous vertex gradient is generated from this row of adjoining colored faces in the exporter.
stops=[(0,'75f3e8'),(.16,'72edea'),(.32,'7eb7f4'),(.49,'a88cf4'),(.62,'f1a2dc'),(.74,'f0cdce'),(.86,'f3eaa9'),(1,'f4f2c3')]
def grad(t):
    for (a,lo),(b,hi) in zip(stops,stops[1:]):
        if t<=b:
            n=(t-a)/(b-a);return ''.join(f'{round(int(lo[j:j+2],16)*(1-n)+int(hi[j:j+2],16)*n):02x}' for j in [0,2,4])
for j in range(28):m.palette['sky'+str(j)]=m.material('투광 색 '+str(j),grad(j/27))
channel=part('channel','선형 LED 받침',(6,-3.8,0))
child(channel,'도장 벽판과 양극산화 고정틀')
# Reused on both flanks. Two full-height wall seams instead of an additional full-wall billboard.
B('흑연색 벽판',0,.025,.009,.75,.12,3.59,'charcoal',.004)
B('상단 도장 차양',0,.003,3.298,.75,.220,.137,'matte',.004)
B('바닥의 얇은 걸레받이',0,-.014,.008,.75,.073,.094,'graphite',.002)
B('좁은 수직 이음',-.371,-.038,.157,.006,.004,2.785,'vent')
capsule('은색 채널 외곽',0,.349,.133,2.367,.041,-.047,'darkMetal')
capsule('선형등 짙은 내측 가스켓',0,.357,.117,2.352,.021,-.071,'gasket')
for z in [.257,2.796]:B('채널 상하 고정 덮개',0,-.042,z,.18,.011,.045,'graphite',.004)
lamp=part('striplamp','청록·보라·연황색 선형등',(7,-3.8,0))
child(lamp,'둥근 끝을 맺는 연속 확산판')
h=2.338;wid=.101;r=wid/2;start=.366
# Vary the physical height and width near both hemispherical tips.
for j in range(28):
    lo,hi=h*j/28,h*(j+1)/28
    steps=[lo,hi]
    if j==0:steps=[0,.004,.015,.029,.050,hi]
    if j==27:steps=[lo,h-.05,h-.029,h-.015,h-.004,h]
    levels=[]
    for z in steps:
        dz=min(z,h-z);half=r if dz>=r else max(.001,(r*r-(r-dz)**2)**.5)
        levels.append([(half*sin(a*pi/8),-.074-.022*cos(a*pi/8),start+z) for a in range(-4,5)])
    verts=sum(levels,[]);faces=[(i*9+k,i*9+k+1,(i+1)*9+k+1,(i+1)*9+k) for i in range(len(levels)-1) for k in range(8)]
    source=m.piece('유백색 렌즈의 높이별 발광',verts,faces,'sky'+str(j))
    tint=source.data.color_attributes.new(name='확산판 연속 색',type='BYTE_COLOR',domain='CORNER')
    for loop in source.data.loops:
        v=source.data.vertices[loop.vertex_index].co
        t=max(0,min(1,(v.z-start)/h));u=t*27;a=int(u);b=min(27,a+1)
        base=m.palette['sky'+str(a)].diffuse_color;other=m.palette['sky'+str(b)].diffuse_color
        # A light falloff toward each side keeps the round cover distinct from the flat wall.
        factor=.84+.16*max(0,1-(abs(v.x)/r)**3)
        tint.data[loop.index].color=tuple((base[k]*(1-u+a)+other[k]*(u-a))*factor for k in range(3))+(1,)
track=part('track','벽화 조명 레일과 회전등',(0,3.8,0))
child(track,'천장 행거와 긴 전원 레일')
B('접속부가 있는 흰 레일',0,0,3.283,7.998,.066,.074,'ivory',.004)
B('레일 아래 절연 슬롯',0,0,3.279,7.998,.025,.0048,'charcoal')
for x in [-3.14,-.09,2.96]:
    C('천장 원형 로제트',x,0,3.754,[(.056,0),(.061,.023),(.050,.031)],'steel',20)
    C('장력 조절 너트',x,0,3.343,[(.024,0),(.024,.034)],'darkMetal',6)
    T('천장 매달림봉',[(x,0,3.37),(x,0,3.766)],.0075,'steel',8)
for x in [-3.92,0,3.92]:
    B('레일 연결 브라켓',x,0,3.304,.088,.073,.04,'aluminum',.003)
child(track,'각도 조절식 투광등과 렌즈')
for n,x in enumerate([-3.05,-1.55,.02,1.63,3.24]):
    aim=Vector(((-.23,.08,-.10,.15,-.04)[n],-.70,-.77)).normalized()
    anchor=Vector((x,-.025,3.194));base=anchor+aim*.038
    B('레일 접촉 어댑터',x,0,3.227,.15,.072,.054,'ivory',.005)
    C('상부 회전 목',x,0,3.180,[(.024,0),(.029,.022),(.022,.053)],'aluminum',14)
    for side in [-1,1]:
        T('U자 암과 회전축',[(x+side*.058,0,3.201),(x+side*.058,-.017,3.164),(x+side*.057,-.047,3.144)],.009,'ivory',8)
        T('회전축 체결 나사',[(x+side*.052,-.045,3.147),(x+side*.073,-.045,3.147)],.015,'darkMetal',8)
    # Rings are perpendicular to the aiming vector, including the perforated rim and lens.
    a=aim.cross(Vector((0,0,1))).normalized();b=aim.cross(a).normalized()
    def ringed(label,levels,tone):
        pts=[tuple(base+aim*distance+a*(rad*cos(tau*j/20))+b*(rad*sin(tau*j/20))) for distance,rad in levels for j in range(20)]
        faces=[(q*20+j,q*20+(j+1)%20,(q+1)*20+(j+1)%20,(q+1)*20+j) for q in range(len(levels)-1) for j in range(20)]
        faces.extend([tuple(reversed(range(20))),tuple((len(levels)-1)*20+j for j in range(20))])
        return m.piece(label,pts,faces,tone)
    ringed('분체 도장 원통 하우징',[(0,.037),(.014,.061),(.148,.070),(.175,.072)],'ivory')
    ringed('전면 금속 띠',[(.175,.072),(.184,.071),(.192,.063)],'aluminum')
    ringed('렌즈 안 검은 빛막이',[(.192,.061),(.196,.058)],'charcoal')
    ringed('표시되는 반사경',[(.196,.058),(.198,.051)],'reflector')
    ringed('따뜻한 투광 원형 렌즈',[(.198,.049),(.202,.047),(.206,.032)],'lens')
    for j in range(6):
        ang=tau*j/6;ext=(a*cos(ang)+b*sin(ang))*.063
        T('후면 하우징 리브',[tuple(base+aim*.027+ext),tuple(base+aim*.069+ext*1.04)],.0027,'aluminum',5)

screen=part('film','홍보 모니터 표시 면',(0,-4.2,0))
# This native UV quad carries the packed slide atlas, so editing the shop in the world keeps its display.
w,h=1.48,2.397;z=.343;d=-.140
panel=m.piece('세로 홍보 영상 영역',[(-w/2,d,z),(w/2,d,z),(w/2,d,z+h),(-w/2,d,z+h)],[(0,3,2,1)],'ivory')
uv=panel.data.uv_layers.new(name='매장 홍보 화면')
for loop in panel.data.loops:
    uv.data[loop.index].uv=[(1,0),(0,0),(0,1),(1,1)][loop.vertex_index]
panel['screen_source']='서울시 사진에 보이는 고투몰 홍보 화면을 본뜬 자체 그림 세 장'
screen['game_part']='film'

bpy.context.view_layer.update()
for key,c in subjects.items():
    offset=Matrix.Translation(Vector(c['preview_origin']))
    for ob in c.all_objects:
        center=sum((Vector(p) for p in ob.bound_box),Vector())/8
        ob.data.transform(Matrix.Translation(-center));ob.matrix_world=offset@ob.matrix_world@Matrix.Translation(center);ob.select_set(False)
    c['reference']='2026년 1월 서울시·10월 서초구 사진. 현장 치수, 제어·홍보 프로그램과 세부 마감은 추정.'
bpy.context.view_layer.update()
# Illustrations for the mall promotion are authored as editable geometry in the second Blender scene.
runpy.run_path(str(here/'program.py'))['make_program'](here,scene,panel)
bpy.context.window.scene=scene
view_target=Vector((0,-.3,1.1))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        sp=area.spaces.active;sp.shading.color_type='MATERIAL';sp.region_3d.view_distance=13;sp.region_3d.view_location=view_target
        sp.region_3d.view_rotation=(view_target-Vector((6.2,9.6,5.4))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'gallery.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
