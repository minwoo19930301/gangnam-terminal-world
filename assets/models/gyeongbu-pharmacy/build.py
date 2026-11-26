"""Corner pharmacy, from the shop's Naver photograph and the April 2026 visitor walk."""
from math import cos,pi,sin
from pathlib import Path
from random import Random
import runpy
import sys
import bpy

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene['source']='Naver Map 1822188514 owner photo, and April 8 2026 Seoul Gyeongbu pharmacy walk joS_TjqngD8.'
scene['placement']='Public #24 pharmacy shell registered to the existing 1F hall. Aisles, fixture dimensions, stock and counts approximated.'
rng=Random(194024)
def group(name):
    g=bpy.data.collections.new(name);scene.collection.children.link(g)
    g['bundle']='corner-pharmacy';g['origin']=[0,0,0]
    return g
body=group('Pharmacy');glass=group('Glass');lit=group('Lit');m.group=body
palette={'도장':'f5f0e5','벽안':'ebe8db','몰딩':'2e3031','금속':'c0c8c8','유리':'b9d1d8','크롬':'a9b1ae',
         '창턱':'ebeddf','연청':'b9cedf','밝은녹':'39e4c8','측녹':'008b7b','청':'4087cf','포장':'faf8ed','베이지':'d0b396',
         '차콜':'414444','오렌지':'e88740','초록':'70ae74','남색':'324e76','노랑':'e0bc4f','자주':'a15d77',
         '청록':'49a6a6','바이올렛':'9e89b5','붉은색':'c64a46','분홍':'e3afc4','상앗빛':'fff8df','차광':'5d5e60',
         '투명병':'93bbb9','갈색병':'ac7950','투명창':'d5e0da','받침':'9a9281','푸른후광':'c3d4ff','문자':'f8fcff'}
for name,code in palette.items():m.palette[name]=m.material(name,code)
m.palette['유리'].diffuse_color=(*m.palette['유리'].diffuse_color[:3],.12)
block=m.block;piece=m.piece;rod=m.rod;profile=m.profile
def polygon_prism(name,points,z,h,mat):
    n=len(points);verts=[(x,d,z+dz) for dz in [0,h] for x,d in points]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    faces.extend((i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n))
    return piece(name,verts,faces,mat)
def rounded_outline(depth):
    # Clockwise frontage with two short tangent fillets into the return wall.
    xmin,xmax,back,r=-2.30,2.30,-4.46,.63
    points=[(xmin,back),(xmax,back),(xmax,depth-r)]
    for i in range(1,13):
        a=i*pi/24;points.append((xmax-r+r*cos(a),depth-r+r*sin(a)))
    for i in range(13):
        a=pi/2+i*pi/24;points.append((xmin+r+r*cos(a),depth-r+r*sin(a)))
    return points
def rectangle(name,x0,x1,d0,d1,y0,y1,color):
    return block(name,(x0+x1)/2,(d0+d1)/2,y0,x1-x0,d1-d0,y1-y0,color)
def pill_sign(name,x,d,z,span,thickness,orientation,color):
    # Horizontal and vertical arms share edges to give one unbroken sign face and twelve real sides.
    R=span/2;r=span*.152
    outline=[(-r,-R),(r,-R),(r,-r),(R,-r),(R,r),(r,r),(r,R),(-r,R),(-r,r),(-R,r),(-R,-r),(-r,-r)]
    n=len(outline)
    if orientation=='front':cv=lambda ax,by,out:(x+ax,d+out,z+by)
    else:cv=lambda ax,by,out:(x+out,d+ax,z+by)
    verts=[cv(a,b,t) for t in (0,thickness) for a,b in outline]
    fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    return piece(name,verts,fs,color)
def label(name,x,d,y,w,h,mat):
    block(name,x,d,y,w,.0026,h,mat)
# Rear service shelf, side glazing and the photographed white, black-edged curved crown.
polygon_prism('곡면 천장판 · 흰색',rounded_outline(.10),2.75,.417,'도장')
polygon_prism('검은 연속 천장 몰딩',rounded_outline(.113),3.166,.053,'몰딩')
polygon_prism('공개 매장 천장',rounded_outline(-.0),2.70,.060,'벽안')
rectangle('점포 뒷벽',-2.30,2.30,-4.48,-4.38,.012,2.76,'벽안')
rectangle('점포 측벽',-2.30,-2.18,-4.45,-.36,.012,2.76,'도장')
rectangle('출입구 왼쪽 벽',-2.30,-1.36,-.45,-.09,.012,2.76,'도장')
rectangle('출입구 오른쪽 벽',.34,1.69,-.36,.02,.012,2.76,'도장')
rectangle('출입구 왼쪽 걸레받이',-2.30,-1.36,-.45,-.082,.015,.073,'몰딩')
rectangle('출입구 오른쪽 걸레받이',.34,1.69,-.36,.025,.015,.073,'몰딩')
for z,h,mat in [(.018,.055,'몰딩'),(.073,2.676,'도장')]:
    q=[(1.68,-.63),(2.30,-.63)]+[(1.67+.63*cos(k*pi/24),-.63+.65*sin(k*pi/24)) for k in range(1,13)]+[(1.67,-.34)]
    polygon_prism('둥근 출입구 코너 기둥',q,z,h,mat)
rectangle('쇼윈도 뒤쪽 경계',2.20,2.30,-4.46,-4.21,.014,2.76,'도장')
rectangle('쇼윈도 · 측면 흰 인방',2.19,2.30,-4.30,-.55,2.37,2.76,'도장')
rectangle('쇼윈도 · 검은 바닥 틀',2.22,2.30,-4.30,-.55,.013,.095,'몰딩')
for d in [-4.20,-3.50,-2.78,-2.06,-1.34,-.65]:
    block('유리 프레임 · 세로 압출물',2.255,d,.089,.040,.027,2.302,'크롬')
m.group=glass
rectangle('쇼윈도 · 안이 보이는 통유리',2.256,2.266,-4.22,-.61,.10,2.38,'유리')
m.group=body
# Hanging plate and glowing letters hang from a fine black frame under the cove.
for x in [-1.47,1.13]:rod('간판 · 상부 매달기',[(x,.091,2.74),(x,.091,2.37)],.012,'몰딩')
rod('간판 · 하단 둥근 프레임',[(-1.53,.106,2.67),(-1.53,.106,2.42),(-1.49,.106,2.375),(-1.42,.106,2.35),(.98,.106,2.35),(1.10,.106,2.37),(1.14,.106,2.42),(1.14,.106,2.67)],.021,'몰딩')
block('화사인 · 얇은 글자 부착 레일',-.185,.085,2.439,2.65,.035,.047,'차콜')
block('입구 벽면 녹십자 · 작은 금속 고정대',.82,.04,1.79,.16,.10,.15,'차광')
pill_sign('앞 십자 · 깊은 측면',.82,.061,1.858,.618,.117,'front','측녹')
# The newer walk shows two projecting signs either side of the counter.
for x,dd in [(-2.23,-1.0),(2.29,-.91)]:
    block('돌출 약국 표지 · 벽 브래킷',x,dd,2.21,.20,.075,.075,'금속')
    pill_sign('돌출 십자 · 두꺼운 광원 회색 프레임',x,dd,2.29,.50,.127,'side','측녹')
m.group=lit
pill_sign('벽면 십자 · 발광 아크릴',.82,.18,1.858,.606,.008,'front','밝은녹')
for x,dd in [(-2.23,-1.0),(2.29,-.91)]:
    for tx in [x-.005,x+.129]:
        pill_sign('통로 십자 · 양면 발광 아크릴',tx,dd,2.29,.487,.003,'side','밝은녹')
for x,d in [(-1.64,-.08),(-.22,-.06),(1.29,-.11),(2.18,-1.69),(2.18,-3.1)]:
    profile('처마 · 다운라이트 렌즈',x,d,2.701,[(.047,-.004),(.051,.003)],'상앗빛',16)
block('입구 상부 연보라 간접등',-.19,-.04,2.738,2.80,.040,.009,'푸른후광')
m.group=body
# Keep the side window shelf open: five rows of products can also be seen from the hall.
for d in [-4.10,-3.32,-2.56,-1.81,-1.06]:
    block('측면 진열장 · 세로 프레임',1.80,d,.095,.375,.037,2.16,'금속')
for level in range(6):
    z=.185+level*.359;block('진열장 · 목재 선반',1.83,-2.53,z,.465,3.24,.027,'창턱')
    block('진열장 · 가격표 레일',2.06,-2.53,z+.009,.009,3.24,.052,'크롬')
for x in [-1.98,-1.04,-.08,.88,1.88]:block('안쪽 선반 · 흰 기둥',x,-4.11,.082,.034,.35,2.19,'금속')
for level in range(6):
    z=.185+level*.359;block('안쪽 선반 · 통째로 관통하는 선반',-.04,-4.11,z,3.86,.49,.028,'창턱')
    block('안쪽 선반 · 가격표 프레임',-.04,-3.858,z+.01,3.86,.018,.051,'크롬')
for x in [-1.33,-.64,.18,.99]:block('상단 상품분류 사인',x,-4.13,2.22,.62,.039,.16,'받침')
colors=['청','오렌지','초록','남색','노랑','자주','청록','바이올렛','붉은색','분홍']
def carton(x,d,z,w,h,dep,design,color,side=False):
    block('진열 · 접힌 종이 상자',x,d,z,w,dep,h,'포장' if design!=2 else color)
    accent='포장' if design==2 else color
    if side:
        p=x+w/2+.0016
        block('측면 쇼윈도 · 포장 띠',p,d,z+h*(.12 if design==0 else .61),.0028,dep*.93,h*.23,accent)
        block('측면 쇼윈도 · 글자 블록',p+.0009,d+dep*.04,z+h*.48,.003,dep*.51,h*.048,'차광')
    else:
        p=d+dep/2+.002
        label('상품 · 포장 띠',x,p,z+h*(.13 if design==0 else .61),w*.94,h*.22,accent)
        label('상품 · 표기 블록',x-w*.045,p+.001,z+h*.48,w*.5,h*.052,'차광')
for level in range(5):
    z=.214+level*.359
    for col in range(19):
        x=-1.85+col*.199
        style=(level*3+col//3)%3;tint=colors[(level*3+col//3)%len(colors)]
        if level==2 and col%4==1:
            profile('진열 · 갈색 원통 용기',x,-3.99,z,[(.041,0),(.047,.014),(.047,.129),(.033,.154),(.034,.167)],'갈색병',12)
            profile('진열 · 흰색 병마개',x,-3.99,z+.16,[(.035,0),(.035,.036)],'포장',12)
        else:carton(x,-3.99,z,.15+rng.random()*.027,.148+(col//3%3)*.046,.211,style,tint)
    for col in range(17):
        d=-4.01+col*.181;style=(level+col//2)%3;tint=colors[(level*2+col//2+3)%len(colors)]
        carton(1.91,d,z,.165,.139+(col//2%4)*.039,.146,style,tint,True)
# Smaller customer-facing fixtures and merchandise visible in the 2026 walk.
for x in [-1.31,-.61,.11,.90]:
    block('카운터 · 흰 하부 수납장',x,-2.87,.073,.74,.57,.77,'벽안')
    block('카운터 · 서랍 손잡이',x,-2.579,.69,.16,.019,.018,'크롬')
block('카운터 · 연한 석재 상판',-.19,-2.86,.84,3.04,.65,.046,'창턱',.009)
for x in [-1.08,.03,.72]:
    block('카운터 · 포장 묶음 바구니',x,-2.84,.895,.36,.25,.105,'베이지')
    for j in range(5):
        carton(x-.13+(j%3)*.114,-2.80-(j//3)*.10,.994,.092,.17+.023*(j%2),.054,(j+1)%3,colors[(j*3+2)%len(colors)])
block('카운터 · 작은 단말 받침',-.47,-2.66,.889,.234,.15,.027,'차콜')
block('카운터 · 작은 단말 지주',-.47,-2.69,.908,.04,.037,.13,'차광')
block('카운터 · 단말 화면',-.47,-2.65,1.019,.296,.037,.19,'차콜')
label('단말 · 하늘색 표시창',-.47,-2.628,1.037,.266,.153,'연청')

# A standing poster and the black low front display leave the diagonal entrance open.
for x in [-1.84,-1.38]:
    rod('홍보 안내 · 얇은 철제 지주',[(x,.56,.035),(x,.36,.78)],.013,'몰딩',8)
    rod('홍보 안내 · 뒷다리',[(x,.21,.035),(x,.33,.73)],.011,'몰딩',8)
poly=[(-1.85,.524,.14),(-1.37,.524,.14),(-1.37,.355,.81),(-1.85,.355,.81)]
piece('안내판 · 기울어진 인쇄면',poly,[(0,1,2,3)],'몰딩')
inner=[(-1.832,.52,.168),(-1.388,.52,.168),(-1.388,.364,.785),(-1.832,.364,.785)]
piece('안내판 · 회백색 포스터',inner,[(0,1,2,3)],'포장')
for j in range(4):
    hz=.26+j*.115;dd=.527-(hz-.14)*.25
    piece('안내판 · 안내문 인쇄',[(-1.77,dd,hz),(-1.45,dd,hz),(-1.45,dd-.003,hz+.013),(-1.77,dd-.003,hz+.013)],[(0,1,2,3)],['청','분홍','차콜','붉은색'][j])
for x in [.77,1.76]:
    for d in [.27,.62]:block('가판 · 검은 사각기둥',x,d,.045,.028,.03,.98,'몰딩')
for z in [.064,.441,.881]:
    block('가판 · 금속 테두리 선반',1.265,.453,z,1.035,.42,.046,'몰딩')
    for k in range(4):
        carton(.91+k*.237,.455,z+.051,.195,.182+(k%3)*.040,.255,k%3,colors[(k+round(z*10))%10])
for k in range(10):
    j=k//5;carton(.88+(k%5)*.194,.44,1.029+j*.172,.17,.148,.13,k%3,colors[(k//2+6)%10])
for z,color in [(.025,'창턱'),(.218,'초록'),(.39,'벽안')]:
    carton(1.98,.28,z,.37,.16,.40,1,color)
# Galvanized hooks, mask sleeves and hanging sachets on the rack under the glowing cross.
for x in [.48,.985]:
    block('벽면 약국 이동 진열대 · 흰 사각기둥',x,.171,.045,.023,.025,1.47,'창턱')
for row in range(13):block('진열대 · 수평 선재',.732,.177,.16+row*.095,.516,.011,.009,'크롬')
for col in range(7):block('진열대 · 세로 선재',.492+col*.081,.175,.158,.009,.010,1.16,'크롬')
for row in range(3):
    for col in range(3):
        x=.561+col*.161;z=.45+row*.348
        rod('진열대 · 구부린 상품 훅',[(x,.18,z+.13),(x,.278,z+.13),(x,.288,z+.146)],.006,'크롬',6)
        for depth in range(3):
            d=.222+depth*.021
            block('서로 포개진 비닐 파우치',x,d,z-.096,.141,.019,.218,'분홍' if row==2 else '포장')
        label('파우치 · 전면 색 띠',x,.276,z+.066,.132,.041,['청록','남색','바이올렛'][row])
        # The oval mask outline reads at eye level, without brand or dosage.
        pts=[(x+.048*cos(k*2*pi/18),.279,z+.010+.023*sin(k*2*pi/18)) for k in range(19)]
        rod('마스크 상품 · 앞면 그림',pts,.003,'차광',5)
m.group=body
block('이동 진열대 · 바퀴 달린 바닥판',.73,.20,.036,.56,.26,.046,'몰딩')
# Native English letters and the two Hangul glyphs in the front sign, plus lettering on the green cross.
def text(name,value,x,d,z,height,mat):
    curve=bpy.data.curves.new(name,'FONT');curve.body=value;curve.align_x='CENTER';curve.align_y='CENTER'
    curve.size=height;curve.extrude=.004;curve.resolution_u=4;curve.materials.append(m.palette[mat])
    obj=bpy.data.objects.new(name,curve);m.group.objects.link(obj);obj.location=(x,-d,z);obj.rotation_euler.x=pi/2
    bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
    out=bpy.data.objects.new(name,bpy.data.meshes.new_from_object(obj.evaluated_get(dg)));m.group.objects.link(out)
    out.matrix_world=obj.matrix_world.copy();bpy.data.objects.remove(obj,do_unlink=True)
def glyph(glyph_name,cx,d,z,h,color,angle=0):
    def pt(a,b):
        return (cx+a*h*cos(angle),d+a*h*sin(angle),z+b*h)
    def stroke(points):
        rod('간판 글자 · '+glyph_name,[pt(a,b) for a,b in points],h*.055,color,8)
    if glyph_name=='약':
        stroke([(-.17+.201*cos(k*2*pi/24),.206+.190*sin(k*2*pi/24)) for k in range(25)])
        stroke([(.19,.50),(.19,-.075)]);stroke([(.20,.334),(.378,.334)]);stroke([(.20,.134),(.378,.134)])
    else:
        stroke([(-.28,.428),(.274,.428),(.274,.175)])
        stroke([(-.419,.074),(.415,.074)]);stroke([(0,.067),(0,-.10)])
    stroke([(-.26,-.177),(.26,-.177),(.26,-.455)])
m.group=lit
glyph('약',-1.32,.131,2.501,.212,'문자');glyph('국',-1.104,.131,2.501,.212,'문자')
text('간판 · 입체 영문','PHARMACY',.117,.134,2.505,.344,'문자')
glyph('약',.82,.194,1.856,.238,'문자')
for x,d in [(-2.23,-1.0),(2.29,-.91)]:
    glyph('약',x+.136,d,2.29,.180,'문자',pi/2);glyph('약',x-.012,d,2.29,.180,'문자',-pi/2)
m.group=body
text('벽면 · 영문 약국 안내','PHARMACY',.825,.045,1.348,.141,'몰딩')
# The 2026 close-up shows a white mask board with two ear loops above the red label,
# dark hanging masks in tall cartons, and curved purple-to-blue sleeves beside the cross.
block('마스크 안내 · 작은 사각 폼보드',1.25,.091,.746,.468,.026,.531,'포장')
for signx in [-1,1]:
    pts=[(1.25+signx*(.148+.054*cos(k*pi/14)),.109,1.119+.062*sin(k*pi/14)) for k in range(-7,8)]
    rod('마스크 안내 · 귀걸이 그림',pts,.0043,'차콜',6)
outline=[(-.15,-.009),(-.127,.046),(-.06,.068),(0,.064),(.081,.047),(.144,.025),(.156,-.012),(.11,-.044),(.024,-.066),(-.096,-.044),(-.15,-.009)]
rod('마스크 안내 · 마스크 테두리',[(1.25+x,.110,1.116+z) for x,z in outline],.0052,'차콜',7)
rod('안내판 · 접힌 보호대 윗선',[(1.114,.111,1.128),(1.227,.111,1.166),(1.373,.111,1.135)],.0031,'차콜',6)
for i in range(4):
    x=1.118+i*.080
    rod('마스크 상자 · 벽면 상품 고리',[(x,.070,.742),(x,.171,.742),(x,.177,.765)],.006,'크롬',6)
    block('마스크 · 길쭉한 짙은 포장',x,.159,.405,.071,.044,.334,'차콜')
    for j in range(4):label('마스크 · 패키지 흰 표시',x,.183,.45+j*.060,.034,.018,'포장')
for i in range(9):
    x=.496+i*.041;d=.31+(8-i)*.007
    rod('지퍼 파우치 · 크롬 고리',[(x,.181,1.52),(x,d,1.52),(x,d+.008,1.539)],.005,'크롬',6)
    for j,(z,w,off,c) in enumerate([(1.125,.094,.063,'남색'),(1.235,.080,.044,'바이올렛'),(1.36,.071,.023,'자주')]):
        top=1.235 if j==0 else 1.36 if j==1 else 1.49
        piece('겹친 보라 파우치 · 접힌 원단',[(x-w/2,d+off,z),(x+w/2,d+off,z),(x+w*.39,d+off*.55,top),(x-w*.39,d+off*.55,top)],
              [(0,1,2,3)],c)
# Narrow merchandising strips and recessed customer lighting.
for x in [-1.42,-.43,.61,1.56]:
    block('선반등 · 검은 레일',x,-3.32,2.59,.43,.065,.034,'몰딩')
    for d in [-3.32,-1.91]:
        profile('레일등 · 금속 조절 헤드',x,d,2.50,[(.039,0),(.055,.017),(.051,.095)],'금속',12)
        m.group=lit
        profile('레일등 · 하부 확산 렌즈',x,d,2.498,[(.041,0),(.040,.012)],'상앗빛',12)
        m.group=body
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        view=area.spaces.active;view.shading.color_type='MATERIAL'
        view.region_3d.view_distance=8;view.region_3d.view_location=(0,1.4,1.4)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'gyeongbu-pharmacy.blend'),compress=True)
runpy.run_path(str(here/'export.py'))
