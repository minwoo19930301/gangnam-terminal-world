"""Build the takeaway frontage and covered ice cream wells of Famille Station shop 22."""
from pathlib import Path
from math import cos,sin,tau,pi,atan2
from random import Random
from mathutils import Vector
import bpy,json,os,runpy,sys
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='파미에 1층 · 젤라띠젤라띠';scene.unit_settings.system='METRIC'
B,C,T=m.block,m.profile,m.rod
palette={'black':'272926','shadow':'43372f','ebony':'302d28','walnut':'635043','wood':'806a58',
 'rosewood':'967c6a','grain':'9d8976','chest':'6c5745','tan':'b79b77','beige':'dfd2b1','grout':'9c8870',
 'tile':'a58b70','clay':'ac9177','coffee':'775b45','caramel':'b29268','ivory':'f1eddf','sheet':'f6efe3',
 'white':'f7f6e9','stone':'c5ada3','palerock':'d7c2b6','vein':'aa8e83','steel':'a6aea8','metal':'adb5af',
 'shine':'e3e6da','reflect':'747c70','graphite':'525b54','brass':'bc9961','gold':'c6a464','rim':'ccb082',
 'cream':'e5d888','wafer':'c89c55','waferDeep':'ae7f40','waferLight':'dbb970','navy':'19314b',
 'teal':'40c0e0','cyan':'79dff3','pink':'e3a2b2','lime':'bacd4f','jade':'548f65','fruit':'c56f60',
 'yellow':'e0ba50','rice':'f1e6c7','berry':'d78b9e','berryDark':'a85774','nut':'9eba78','nutDark':'74874c',
 'choco':'6f4b3c','leaf':'71815d','steelBlue':'9aaea8','ceramic':'dad0bc','label':'f6edce',
 'lamp':'fff7df','tileFoot':'7d7773','tileCream':'ded6c1','ice':'e7dac3','glassEdge':'718f86',
 'screen':'354445','foam':'f5eddb','straw':'d7b88b','coral':'d99180','lemon':'daca59','vanilla':'ecdeb0'}
for key,col in palette.items():m.palette[key]=m.material(key,col,.42 if key in ['metal','steel','brass','shine','reflect'] else 0)
rng=Random(22110)
def group(label,parent):
    c=bpy.data.collections.new(label);parent.children.link(c);m.group=c;return c
roots=[]
def native(label,x):
    c=group('젤라띠 · '+label,scene.collection);c['preview_origin']=(x,0,0)
    c['출처']='신세계 센트럴 매장 소개·1층 22번 도면, 2024·2025 지점 방문 사진. 치수·수량·날짜별 메뉴는 재구성.'
    roots.append(c);return c
def prism(name,pts,d,th,tone):
    n=len(pts);vs=[(x,d+dz,z) for dz in [0,th] for x,z in pts]
    return m.piece(name,vs,[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,i+n,(i+1)%n+n,(i+1)%n) for i in range(n)],tone)
def front(name,points,d,tone):
    return m.piece(name,[(x,d,z) for x,z in points],[tuple(range(len(points)))],tone)
def rect(name,x,d,z,w,h,tone):
    return front(name,[(x-w/2,z),(x+w/2,z),(x+w/2,z+h),(x-w/2,z+h)],d,tone)
def ellipse(name,x,d,z,rx,rz,tone):
    return front(name,[(x+rx*cos(j*tau/24),z+rz*sin(j*tau/24)) for j in range(24)],d,tone)
def roundcap(name,x,d,z,rx,rd,h,tone,n=24,levels=9):
    me=C(name,x,d,z,[(max(.0002,rx*sin(pi*j/levels)),h*(1-cos(pi*j/levels))/2) for j in range(levels+1)],tone,n,rd/rx)
    for p in me.data.polygons:p.use_smooth=True
    return me
ko_path=next((p for p in [os.getenv('GTW_KOREAN_FONT',''),'/System/Library/Fonts/Supplemental/AppleGothic.ttf',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/nanum/NanumGothic.ttf'] if p and Path(p).is_file()),None)
if not ko_path:raise RuntimeError('Set GTW_KOREAN_FONT to a Korean OTF or TTF to regenerate the flavor cards.')
ko=bpy.data.fonts.load(ko_path)
def text(name,words,x,d,z,width,height,tone,useko=False):
    cu=bpy.data.curves.new(name,'FONT');cu.body=words;cu.align_x='CENTER';cu.align_y='CENTER';cu.resolution_u=2
    if useko:cu.font=ko
    ob=bpy.data.objects.new(name,cu);m.group.objects.link(ob);cu.materials.append(m.palette[tone])
    ob.location=(x,-d,z);ob.rotation_euler=(pi/2,0,pi);bpy.context.view_layer.update()
    xx=[v[0] for v in ob.bound_box];zz=[v[1] for v in ob.bound_box]
    sz=min(width/max(.0001,max(xx)-min(xx)),height/max(.0001,max(zz)-min(zz)));ob.scale=(sz,sz,sz)
    bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob.select_set(False)
    return ob
def trim(name,x,d,z,w,dep,h,skin,rail):
    B(name+' 바탕',x,d,z,w,dep,h,skin)
    for xx in [-1,1]:B(name+' 옆 몰딩',x+xx*(w/2-.027),d-dep*.53,z+.035,.044,.032,h-.07,rail,.004)
    for zz in [z+.038,z+h-.065]:B(name+' 가로 몰딩',x,d-dep*.53,zz,w-.072,.032,.030,rail,.005)
def waffle(name,x,d,z,r,h,tip_up=True,n=14):
    if tip_up:rings=[(r,0),(r*.985,.013),(r*.87,.034),(r*.045,h-.005),(.001,h)]
    else:rings=[(.002,0),(r*.16,h*.16),(r*.95,h-.012),(r,h-.005),(r*.97,h+.002)]
    ob=C(name,x,d,z,rings,'wafer',n)
    # Diamond markings sit just proud of the knitted waffle, alternating diagonal strips.
    verts=[];faces=[]
    for k in range(n):
        for flip in [-1,1]:
            start=len(verts)
            for j in range(8):
                t=.08+.85*j/7;rr=r*((1-t) if tip_up else t)+.0008
                a=k*tau/n+flip*(.71*t)
                for delta in [-.018,.018]:
                    verts.append((x+rr*cos(a+delta),d+rr*sin(a+delta),z+t*h))
            faces.extend((start+j*2,start+j*2+1,start+j*2+3,start+j*2+2) for j in range(7))
    return m.piece('와플 격자',verts,faces,'waferDeep')

shell=native('검은 액자와 원형 펜던트',0)
group('쇼윈도 외곽과 흰 천장',shell)
W,D=7.416,5.031
for x in [-W/2+.072,W/2-.072]:
    B('흑갈색 모서리 프레임',x,0,.028,.144,.305,3.17,'black')
    B('측면 하부 짙은 패널',x,1.99,.03,.138,4.0,.98,'ebony')
    B('측면 놋쇠 띠',x,1.99,1.02,.153,3.96,.021,'brass')
B('글자를 가리지 않는 상부 인방',0,0,3.08,W,.29,.288,'ebony')
B('흰색 매장 천장',0,2.51,3.13,W-.16,4.98,.12,'sheet')
B('정면보다 안으로 들어간 천장 마감',0,.31,3.073,W-.22,.30,.066,'ivory')
for i in range(3):
    for j in range(2):
        x=(i-1)*1.93;d=.75+j*2.7
        B('매입 조명 사각 테두리',x,d,3.104,.151,.151,.027,'graphite')
        C('백색 매입등',x,d,3.101,[(.044,0),(.047,.008)],'lamp',16)
for i in range(6):
    x=(i-2.5)*1.04;d=2.27
    C('천장 고정 원반',x,d,3.098,[(.054,0),(.056,.031)],'brass',18)
    T('황동 펜던트 봉',[(x,d,2.74),(x,d,3.11)],.009,'brass',8)
    C('유백 갓 목',x,d,2.74,[(.039,0),(.043,.026)],'gold',12)

group('후면의 갈색 타일과 상부 진열장 목부',shell)
B('타일 바탕',0,D-.01,.018,W-.18,.054,3.11,'grout')
for i in range(27):
    for j in range(9):
        B('다갈색 유약 타일',(i-13)*.266,D-.048,.03+j*.227,.258,.026,.219,rng.choice(['tile','tile','clay','tan','clay']))
for bay in range(10):
    x=(bay-4.5)*.683
    B('어두운 콘 진열장',x,D-.179,1.76,.68,.18,1.267,'walnut')
    for xx in [-.321,.321]:B('체리색 수직 문틀',x+xx,D-.284,1.79,.042,.085,1.218,'chest',.005)
    for z in [1.79,2.388,2.956]:B('다단 문틀',x,D-.284,z,.642,.077,.034,'chest',.004)
group('포장 대기 바닥',shell)
for i in range(20):
    for j in range(6):
        x=(i-9.5)*.29;d=.31+j*.275;z=.044
        B('주문대 앞 타일',x,d,z,.287,.270,.008,'tileCream' if (i+j)%2 else 'ivory')
        points=[]
        for dx,dd in [(-.104,0),(0,.111),(.104,0),(0,-.111)]:
            points.extend([(x+dx*.16,d+dd*.16,z+.009),(x+dx*.63-dd*.17,d+dd*.63+dx*.17,z+.009),
                           (x+dx,d+dd,z+.009),(x+dx*.63+dd*.17,d+dd*.63-dx*.17,z+.009)])
        m.piece('회색 네 잎 타일 무늬',points,[tuple(range(k,k+4)) for k in range(0,16,4)],'tileFoot')

lights=native('유백 구형 펜던트의 빛',6)
group('따뜻하게 빛나는 둥근 유리 갓',lights)
for i in range(6):roundcap('유백색 구형 펜던트',(i-2.5)*1.04,0,0,.163,.163,.332,'lamp',22,10)
shader=m.palette['lamp'].node_tree.nodes.get('Principled BSDF');shader.inputs['Emission Color'].default_value=m.palette['lamp'].diffuse_color
shader.inputs['Emission Strength'].default_value=.65

stock=native('목제 유리장 속 겹친 와플콘',9)
group('서로 포개 세운 콘',stock)
# The stack looks pointed from above and shows the rounded rims of the cones below it.
rr=.049;rings=[(.037,0)]
for q in range(6):rings.extend([(rr-.008,.018+q*.039),(rr,.027+q*.039),(rr-.002,.033+q*.039)])
rings.extend([(rr*.86,.253),(.004,.493),(.001,.502)])
master=C('첨탑처럼 보이는 포갠 콘',0,0,0,rings,'cream',12)
master.data.materials.append(m.palette['wafer'])
for face in master.data.polygons:
    if face.index//12%3==1:face.material_index=1
vs=[];fs=[]
for q in range(6):
    y=.052+q*.039
    for i in range(5):
        aa=pi+(i+.24)*pi/5;bb=aa+.19;nn=len(vs)
        for a,dy in [(aa,0),(bb,.014),(bb,.018),(aa,.004)]:vs.append((rr*cos(a),rr*sin(a),y+dy))
        fs.append(tuple(range(nn,nn+4)))
mark=m.piece('콘 표면에 새겨진 짧은 체크',vs,fs,'waferLight')
for bay in range(10):
    for tier in range(2):
        for sub in range(5):
            number=(bay*2+tier)*5+sub
            x=(bay-4.5)*.683+(sub-2)*.113;z=.021+tier*.579
            for template,kind in [(master,'cones'),(mark,'waffle')]:
                ob=template if number==0 else bpy.data.objects.new(template.name,template.data)
                if number:m.group.objects.link(ob)
                ob.location=(x,0,z);ob['stock_unit']=number;ob['stock_part']=kind

bar=native('돌상판과 황동 난간 주문대',18)
group('몰딩과 석재 접수대',bar)
B('전체 주문대 받침',0,0,.02,5.96,.99,.086,'shadow')
B('체리색 전면 판재',0,0,.101,6.02,1.025,.794,'walnut')
for j in range(8):
    x=(j-3.5)*.741
    trim('목재 사각 프레임',x,-.533,.158,.682,.062,.560,'rosewood','wood')
    for k in range(4):
        z=.236+k*.097;w=.495-(k%3)*.049
        rect('얇은 목리',x+(k%2-.5)*.051,-.5681,z,w,.004,'grain')
B('상부 목대',0,-.02,.849,6.06,1.056,.075,'wood',.007)
B('분홍빛 석재 앞막이',0,-.022,.912,6.08,1.101,.121,'stone',.009)
B('상판 가공 모서리',0,-.022,1.027,6.095,1.115,.039,'palerock',.006)
for i in range(25):
    x=(i-12)*.233;z=.927+(i%7)*.012
    front('상판 앞면 석재 결',[(x,z),(x+.10,z+.015),(x+.19,z+.012),(x+.09,z+.020)],-.573,'vein')
for y in [.541,.559]:
    T('황동 파이프 대기 난간',[(-2.77,-.696,y),(2.77,-.696,y)],.018 if y<.55 else .006,'brass',12)
for x in [-2.64,-1.34,0,1.34,2.64]:
    T('난간 지지대',[(x,-.555,.485),(x,-.614,.485),(x,-.677,.541)],.011,'gold',8)
    B('놋쇠 지지대 바탕',x,-.568,.461,.083,.011,.047,'brass')
group('유리 전면과 청록색 모서리',bar)
for x in [-2.73,1.58]:
    T('유리 옆판 지지대',[(x,-.218,1.07),(x,-.218,1.584)],.009,'steel',8)
B('강화유리 위쪽 연마 단면',-.575,-.235,1.581,4.47,.014,.014,'glassEdge')
B('강화유리 아래쪽 연마 단면',-.575,-.235,1.108,4.47,.012,.010,'glassEdge')
glass=native('주문대 보호유리',26)
group('유리판',glass);glassmat=m.material('회색 유리','bdd5cb');m.palette['glass']=glassmat;glassmat.diffuse_color=(.66,.82,.77,.105)
m.piece('상부 판유리',[(-2.81,-.231,1.581),(1.66,-.231,1.581),(1.66,.371,1.581),(-2.81,.371,1.581)],[(0,1,2,3)],'glass')
m.piece('전면 판유리',[(-2.81,-.231,1.113),(1.66,-.231,1.113),(1.66,-.231,1.581),(-2.81,-.231,1.581)],[(0,1,2,3)],'glass')
for x in [-2.81,1.66]:m.piece('끝 유리',[(x,-.231,1.113),(x,.371,1.113),(x,.371,1.581),(x,-.231,1.581)],[(0,1,2,3)],'glass')

wells=native('스테인리스 뚜껑과 맛 이름표',34)
group('간접 반사가 맺히는 밀폐식 젤라또 통',wells)
flavors=['이천쌀','바닐라빈','초당 옥수수','오레오쿠키','레몬셔벗','이태리 꿀밤','레드벨벳','스트라치아텔라',
 '하이볼','딸기셔벗','피스타치오','초콜렛','밀라노 커피','리코타 피스타치오','믹스베리','제주 녹차','민트초콜렛칩',
 '둘체 카라멜','애플망고','감귤']
for row in range(2):
    for i in range(10):
        x=(4.5-i)*.425;d=(row-.5)*.39;r=.165;z=.009
        C('금속 원통 가장자리',x,d,z,[(.154,0),(.169,.006),(.171,.018),(.165,.024)],'metal',24)
        ob=C('솟아오른 뚜껑',x,d,z+.021,[(.163,0),(.163,.009),(.153,.018),(.132,.023),(.105,.034),(.068,.039),(.042,.061),(.014,.064)],'steel',28)
        for key in ['shine','reflect','metal','graphite']:ob.data.materials.append(m.palette[key])
        for f in ob.data.polygons:
            band=f.index//28;theta=f.index%28
            if band==0:f.material_index=3
            elif theta in [4,5,6,7,17,18]:f.material_index=1
            elif theta in [12,13,24,25]:f.material_index=2
            elif band==2 and theta%3==0:f.material_index=3
            f.use_smooth=band>0
        # A bright window, the darker cabinet and a second highlight move continuously around the dome.
        # Bake these broad reflections per corner, retaining editable metal geometry without requiring a reflection pass.
        tint=ob.data.color_attributes.new(name='reflections',type='BYTE_COLOR',domain='CORNER')
        for face in ob.data.polygons:
            for idx in face.loop_indices:
                vertex=ob.data.vertices[ob.data.loops[idx].vertex_index].co
                a=atan2(-vertex.y-d,vertex.x-x);hh=vertex.z-(z+.021)
                def band(a0,width):
                    dist=min(abs(a-a0+k*tau) for k in [-1,0,1]);return max(0,1-dist/width)**1.2
                brightness=.38+.37*band(-2.48,.69)+.34*band(-.83,.67)+.29*band(.80,.92)-.20*band(-1.75,.41)
                if hh<.013:brightness-=.11
                if .019<hh<.030:brightness+=.11
                brightness=max(.08,min(.96,brightness))
                tint.data[idx].color=(brightness*1.01,brightness*.996,brightness*.94,1)
        C('덮개 손잡이 밑동',x,d,z+.082,[(.019,0),(.016,.015),(.026,.020)],'reflect',12)
        roundcap('금속 손잡이',x,d,z+.099,.035,.035,.022,'shine',14,5)
        if row:continue
        for j in range(2):
            sx=x+(.109 if j else -.098);sz=.045
            B('작은 황동 맛표 받침',sx,-.419,.009,.17,.087,.016,'brass',.003)
            # Visitor-facing card above the rim. The top leans toward the tubs.
            ob=B('크림색 맛표',sx,-.411,.024,.174,.008,.114,'label',.003)
            tone=['rice','choco','fruit','jade','lemon'][(i+j)%5]
            ellipse('풍미 재료의 색상 표식',sx,-.416,.094,.020,.017,tone)
            text('젤라또 맛 표기',flavors[i+j*10],sx,-.417,.057,.157,.023,'shadow',True)

menu=native('황동 고정 메뉴와 스무 맛',43)
group('나무틀과 맛 표지 스무 장',menu)
B('갈색 메뉴판',0,0,0,3.20,.083,.790,'shadow',.008)
for xx in [-1.579,1.579]:B('액자 옆 몰딩',xx,-.049,.021,.029,.023,.750,'wood',.004)
for zz in [.022,.743]:B('액자 길이 몰딩',0,-.049,zz,3.14,.023,.030,'wood',.004)
for i,flavor in enumerate(flavors):
    col=i%5;row=i//5;x=(2-col)*.617;z=.577-row*.167
    B('크림 도자기 메뉴 이름표',x,-.059,z,.581,.018,.117,'label',.005)
    for a in [-.267,.267]:ellipse('둥근 놋쇠 고정쇠',x+a,-.072,z+.060,.013,.013,'brass')
    text('표지에서 읽는 맛',flavor,x,-.073,z+.061,.490,.061,'coffee',True)
    if i in [0,6,9,19]:
        ellipse('인기 메뉴 원형 표식',x+.265,-.077,z+.064,.049,.049,'pink' if i!=6 else 'yellow')
        text('원형 메뉴 표시','BEST' if i!=6 else 'NEW',x+.265,-.078,z+.065,.077,.022,'choco')
for x in [-.82,.82]:T('검은 매달림 봉',[(x,0,.784),(x,0,1.11)],.009,'ebony',8)

brand=native('청록 상호와 두 색 콘 심벌',50)
group('두 번 쓰인 Gelati 입체 로고',brand)
data=json.loads((here/'wordmark.json').read_text())
def word(x,d,z,w):
    cu=bpy.data.curves.new('Gelati 입체 곡선','CURVE');cu.dimensions='2D';cu.fill_mode='BOTH';cu.extrude=.009
    for outline in data['loops']:
        sp=cu.splines.new('POLY');sp.points.add(len(outline)-1);sp.use_cyclic_u=True
        for p,(a,b) in zip(sp.points,outline):p.co=((a-data['width']/2)*w/data['width'],(data['height']/2-b)*w/data['width'],0,1)
    cu.materials.append(m.palette['cyan']);ob=bpy.data.objects.new('Gelati 입체 글자',cu);m.group.objects.link(ob)
    ob.rotation_euler=(pi/2,0,pi);ob.location=(x,-d,z);bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob.select_set(False)
word(.78,0,.202,1.21);word(-.78,0,.202,1.21)
prism('와플 콘 심벌',[(.145,.232),(-.145,.232),(0,-.109)],-.018,.034,'vanilla')
ellipse('연두색 작은 젤라또',.035,-.006,.436,.109,.103,'lime')
ellipse('분홍 젤라또',0,-.020,.320,.142,.112,'pink')
rect('두 색 사이 짧은 남색 띠',0,-.021,.231,.277,.012,'navy')
prism('심벌의 작은 파란 스푼',[(-.130,.392),(-.174,.437),(-.157,.450),(-.111,.409)],-.013,.020,'cyan')
for x in [-1.08,1.08]:T('로고의 가는 걸이',[(x,.021,.321),(x,.021,.690)],.007,'brass',8)

back=native('에스프레소 머신과 뒤 작업대',57)
group('뒤 작업대와 에스프레소 장비',back)
B('나무 뒤 작업장',0,0,.019,6.64,.72,.906,'chest')
B('스테인리스 작업면',0,-.007,.919,6.72,.755,.044,'steel')
for i in range(8):trim('하부 수납장',(i-3.5)*.82,-.37,.10,.77,.034,.696,'wood','chest')
B('커피 머신 바탕',1.91,-.033,.967,.91,.478,.098,'graphite',.025)
B('크롬 전면 커피 머신',1.91,.018,1.050,.90,.43,.424,'metal',.037)
B('커피머신 조작부',1.91,-.204,1.293,.823,.028,.107,'graphite',.008)
for xx in [1.65,1.90,2.15]:
    ellipse('원형 머신 압력 눈금',xx,-.220,1.348,.031,.031,'cream')
    T('커피 추출 헤드',[(xx,-.176,1.286),(xx,-.225,1.242),(xx,-.307,1.243)],.015,'reflect')
    C('받침 위 에스프레소 잔',xx,-.209,1.057,[(.028,0),(.035,.049),(.037,.056)],'white',12)
for k in range(2):
    for j in range(3):
        C('흰 커피 잔 더미',1.73+k*.348,-.016,1.476+j*.032,[(.031,0),(.041,.050),(.043,.055)],'ivory',14)
B('검은 그라인더',1.185,-.06,.963,.212,.267,.28,'black',.016)
C('커피콩 호퍼',1.185,-.06,1.232,[(.054,0),(.085,.019),(.103,.175),(.107,.188)],'coffee',18)
C('호퍼 뚜껑',1.185,-.06,1.416,[(.109,0),(.110,.013),(.10,.020)],'black',16)
for j in range(2):
    for i in range(4):
        x=.29+i*.175;z=.968+j*.084
        B('흰 보냉 포장 상자',x,.014,z,.167,.255,.076,'white',.009)
        B('포장 상자 맞물림 단',x,.013,z+.066,.172,.26,.013,'ivory',.003)
for x in [-.50,-.83,-1.15]:
    for j in range(2):
        C('와플콘 받침 금속 원반',x,.002,.966,[(.058,0),(.06,.012)],'shine',14)
        T('금속 콘 거치대',[(x,.002,.975),(x,.002,1.24)],.006,'brass')
        waffle('세워 놓은 공와플콘',x,.002,1.155+j*.073,.038,.142,False,10)
for i in range(4):
    x=-1.52-i*.17
    C('부재료 병',x,-.07,.965,[(.047,0),(.054,.012),(.054,.142),(.041,.151),(.039,.174)],['tan','cream','coffee','ice'][i],14)
    C('재료병 금속마개',x,-.07,1.137,[(.043,0),(.043,.014)],'steel',14)
for x in [-2.28,-2.49]:
    C('스쿱과 스푼 금속통',x,-.081,.965,[(.051,0),(.058,.130),(.060,.142)],'steel',16)
    for j in range(4):
        xx=x+(j-1.5)*.016
        T('젤라또 주걱의 손잡이',[(xx,-.078,1.055),(xx+(j-1.5)*.023,-.087,1.234+.019*(j%2))],.007,'reflect')
        roundcap('타원 주걱',xx+(j-1.5)*.023,-.087,1.224+.019*(j%2),.024,.006,.045,'metal',10,4)
packs=native('포장 컵·보냉 상자와 계산대',62)
group('줄무늬 컵과 두 색 보냉 상자',packs)
for end,x in enumerate([-2.61,-2.44]):
    for j in range(14):
        c='navy' if end else 'sheet';z=.014+j*.016
        C('줄무늬 아이스크림 컵',x,.16,z,[(.051,0),(.068,.100),(.071,.103)],c,16)
        C('컵의 흰 입술',x,.16,z+.101,[(.070,0),(.072,.006),(.069,.009)],'sheet',16)
for j in range(4):
    x=.78+(.013 if j%2 else 0);z=.014+j*.095
    B('메뉴 옆 보냉 포장 상자',x,.27,z,.258,.172,.095,'white',.018)
    B('상자 중앙 띠',x,.179,z+.013,.113,.006,.073,'navy' if j%2 else 'coral')
    text('포장 상자 상호','Gelati Gelati',x,.175,z+.049,.107,.015,'white')
group('흰색 결제 단말과 오늘의 안내',packs)
B('계산대의 낮은 받침',2.39,.16,.012,.36,.28,.034,'ivory',.013)
prism('타원형 모서리의 터미널 지주',[(2.23,.048),(2.56,.048),(2.52,.080),(2.45,.105),(2.45,.24),(2.36,.24),(2.35,.105),(2.25,.088)],.101,.109,'ceramic')
prism('비스듬한 흰 단말기 테두리',[(2.21,.226),(2.25,.204),(2.56,.204),(2.59,.227),(2.59,.446),(2.56,.465),(2.24,.465),(2.21,.435)],.063,.061,'ivory')
rect('주문 확인 모니터',2.40,.061,.236,.315,.186,'screen')
text('작은 결제 확인 안내','Gelati Gelati',2.40,.060,.341,.234,.042,'ivory')
B('카드 단말의 짙은 투입구',2.40,.070,.176,.201,.032,.022,'graphite')
B('메뉴 받침',-.52,.296,.016,.326,.163,.022,'brass')
B('메뉴판의 크림색 종이',-.52,.306,.039,.314,.018,.374,'label')
text('젤라또 콘·컵 안내','CONE & CUP',-.52,.295,.332,.242,.036,'navy')
for n in range(3):
    x=-.52+(n-1)*.081
    prism('인쇄한 콘 실루엣',[(x-.027,.234),(x+.027,.234),(x,.153)],.294,.002,'wafer')
    ellipse('인쇄한 젤라또 색',x,.293,.243,.031,.026,['nut','berry','rice'][n])
    rect('메뉴의 작은 설명',x,.293,.112,.062,.007,'chest')

serve=native('두 맛 컵과 와플콘·젤라또라떼',65)
group('진한 남색 컵과 두 맛 젤라또',serve)
def scoop(name,x,d,z,rx,rd,h,tone,seed):
    r=Random(seed);ns=29;nr=13
    phase=r.random()*tau;verts=[];faces=[]
    for j in range(nr):
        t=j/(nr-1);phi=-.61+2.155*t
        for i in range(ns):
            a=tau*i/ns
            # A spatula leaves broad folds along the upper surface, with a softer broken edge near the rim.
            wave=1+.072*sin(4*a+2.4*t+phase)+.042*cos(7*a-3.90*t)+.025*sin(12*a+phase)
            cx=.19*rx*t*t;cz=.084*h*cos(3.0*a+phase)*sin(t*pi)
            vx=x+cx+rx*wave*cos(phi)*cos(a);vd=d+rd*wave*cos(phi)*sin(a)
            vz=z+h*(.38+.65*sin(phi))+cz+.037*h*cos(7*a+3*t)*sin(pi*t)**2
            verts.append((vx,vd,vz))
    for j in range(nr-1):
        for i in range(ns):faces.append((j*ns+i,j*ns+(i+1)%ns,(j+1)*ns+(i+1)%ns,(j+1)*ns+i))
    faces.append(tuple(reversed(range(ns))));faces.append(tuple(range((nr-1)*ns,nr*ns)))
    ob=m.piece(name,verts,faces,tone)
    for p in ob.data.polygons:p.use_smooth=True
    return ob
cx=.035;cd=-.033
C('남색 종이 젤라또 컵',cx,cd,.012,[(.047,0),(.060,.087),(.066,.11),(.066,.113)],'navy',28)
C('컵 가장자리 종이 말림',cx,cd,.118,[(.065,0),(.067,.004),(.066,.007)],'sheet',28)
rect('종이컵의 작은 상호 바탕',cx,-.096,.054,.085,.023,'navy')
text('컵의 Gelati 상호','Gelati Gelati',cx,-.097,.065,.083,.014,'ivory')
scoop('연두 피스타치오 젤라또',cx+.028,cd,.110,.048,.058,.079,'nut',12)
scoop('분홍 베리 젤라또',cx-.026,cd,.110,.049,.061,.087,'berry',23)
for q in range(12):
    a=tau*q/12;x=cx+.030+.030*cos(a);d=cd+.039*sin(a)
    roundcap('피스타치오와 베리 조각',x,d,.164+(q%3)*.003,.0024,.0017,.0024,'nutDark',6,3)
T('작은 젤라또 스푼',[(cx+.032,cd+.022,.160),(cx+.053,cd+.038,.195),(cx+.07,cd+.052,.250)],.003,'sheet')
roundcap('흰 스푼의 손잡이 끝',cx+.069,cd+.052,.232,.007,.003,.019,'sheet',10,4)
group('와플콘 받침과 이천쌀 젤라또',serve)
x=-.197;d=.007
C('판매 콘을 받치는 원형 금속 받침',x,d,.008,[(.065,0),(.069,.008),(.056,.014)],'reflect',18)
T('콘 거치대 지주',[(x+.044,d,.017),(x+.044,d,.135)],.004,'brass')
# Closed ring around the handoff cone, with a clear hole through it.
T('콘 거치대의 금속 고리',[(x+.044*cos(tau*i/24),d+.044*sin(tau*i/24),.132) for i in range(25)],.003,'brass',6)
waffle('과자 와플콘',x,d,.040,.053,.171,False,24)
scoop('이천쌀 맛 젤라또',x+.014,d,.200,.052,.060,.084,'rice',31)
scoop('카카오 맛 젤라또',x-.019,d+.002,.198,.046,.054,.070,'choco',14)
for q in range(14):
    a=tau*q/14;tx=x+.023+.031*cos(a);td=d+.037*sin(a)
    roundcap('쌀알이 보이는 표면',tx,td,.257+(q%3)*.003,.0025,.0015,.0028,'ivory',6,3)
group('바닐라 젤라또를 올린 음료',serve)
x=.240;d=.027
C('테이크아웃 라떼 컵',x,d,.008,[(.040,0),(.055,.117),(.061,.137)],'coffee',24)
C('커피와 우유 층',x,d,.030,[(.045,0),(.047,.016),(.050,.054),(.050,.057)],'tan',24)
C('투명 뚜껑의 연한 외곽',x,d,.142,[(.060,0),(.064,.003),(.063,.007),(.057,.009)],'shine',24)
scoop('우유 거품과 젤라또',x,d,.150,.051,.049,.061,'foam',20)
T('갈색 빨대',[(x+.008,d+.011,.153),(x+.031,d+.036,.291)],.004,'straw')

# Separate assembly origins keep the authoring file easy to inspect and the game able to stream each sightline.
for c in roots:
    offset=Vector(c['preview_origin'])
    for ob in c.all_objects:ob.location+=offset
bpy.data.fonts.remove(ko,do_unlink=True)
for workspace in bpy.data.workspaces:
    for screen in workspace.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                area.spaces.active.region_3d.view_location=(31,-1,1.5)
                area.spaces.active.region_3d.view_distance=39
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'gelateria.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
