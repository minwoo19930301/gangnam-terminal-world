"""Small editable cookware profiles and ingredients in x, depth, height coordinates."""
from math import sin,cos,pi,tau
from pathlib import Path
from random import Random
import bpy
import blender_shop_mesh as m
B,P,R=m.block,m.profile,m.rod
rng=Random(20260629)
def sphere(name,x,d,z,rx,rd,rz,col,n=14,l=7):
    vs=[];fs=[]
    for k in range(l+1):
        a=-pi/2+.015+k*(pi-.03)/l
        vs.extend([(x+rx*cos(a)*cos(tau*i/n),d+rd*cos(a)*sin(tau*i/n),z+rz*sin(a)) for i in range(n)])
    for k in range(l):fs.extend([(k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i) for i in range(n)])
    fs.extend([tuple(reversed(range(n))),tuple(range(l*n,(l+1)*n))]);o=m.piece(name,vs,fs,col)
    for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
    return o
def ring(name,x,d,z,rad,pipe,col,segments=40,ds=1):
    return R(name,[(x+rad*cos(tau*k/segments),d+ds*rad*sin(tau*k/segments),z) for k in range(segments+1)],pipe,col,6)
def label(text,x,d,z,w,h,col='ink',tilt=pi/2):
    cu=bpy.data.curves.new(text,'FONT');cu.body=text;cu.align_x='CENTER';cu.align_y='CENTER';cu.size=h;cu.resolution_u=4
    for f in ['/System/Library/Fonts/AppleSDGothicNeo.ttc','/usr/share/fonts/truetype/nanum/NanumGothic.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if Path(f).exists():cu.font=bpy.data.fonts.load(f,check_existing=True);break
    o=bpy.data.objects.new(text,cu);m.group.objects.link(o);o.location=(x,-d,z);o.rotation_euler.x=tilt;cu.materials.append(m.palette[col]);bpy.context.view_layer.update()
    o.scale.x=min(1,w/max(.001,o.dimensions.x));bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(o.evaluated_get(bpy.context.evaluated_depsgraph_get()));mesh.transform(o.matrix_world)
    out=bpy.data.objects.new(text+' · 인쇄면',mesh);m.group.objects.link(out);out['caption']=text;bpy.data.objects.remove(o,do_unlink=True)
def platter(name,x,d,z,r,col='white',ds=1):
    return P(name,x,d,z,[(.55*r,0),(.75*r,.003),(.98*r,.016),(r,.021),(.92*r,.022),(.78*r,.013),(.50*r,.007)],col,40,ds)
def card(x,d,z,w,h,top,bottom,sub=False):
    B('금속 접이식 표찰',x,d,z,w,.018,h,'black',.003)
    B('인쇄된 카드 면',x,d+.011,z+.006,w-.013,.004,h-.014,'paper',.0007)
    label(top,x,d+.0141,z+h*.65,w-.022,h*(.21 if sub else .24))
    label(bottom,x,d+.0142,z+h*.32,w-.024,h*.18)
def kitchens(group):
    group('board')
    P('접시 아래 나무 원판',0,0,.001,[(.271,0),(.287,.004),(.291,.039),(.285,.046)],'oak',80)
    for i in range(21):
        d=(i-10)*.024;x=(.282**2-d**2)**.5
        R('도마에 이어지는 나뭇결',[(-x+2*x*j/11,d+.002*sin(i+j*.9),.047) for j in range(12)],.0007,'grain',5)
    group('pot')
    P('귀가 달린 검은 뚝배기 받침',0,0,.001,[(.125,0),(.139,.004),(.157,.015),(.181,.019),(.177,.025),(.146,.026)],'black',32)
    for side in [-1,1]:B('받침의 짧은 귀',side*.152,0,.009,.060,.107,.017,'black',.008)
    P('두꺼운 옹기 몸통',0,0,.024,[(.094,0),(.108,.004),(.125,.017),(.134,.036),(.140,.069),(.137,.093),(.148,.108),(.151,.127),(.146,.140),(.137,.139),(.128,.127),(.128,.113),(.111,.062),(.092,.028)],'clay',60)
    ring('검게 유약을 바른 테',0,0,.159,.142,.005,'glaze',66)
    for r,h in [(.134,.082),(.139,.105),(.143,.144)]:ring('물레가 남긴 띠',0,0,h,r,.0018,'oxide',60)
    group('stew')
    P('붉은 국물',0,0,-.008,[(.120,0),(.131,.002),(.132,.009),(.128,.011),(.072,.012),(.002,.012)],'broth',52)
    for k in range(39):
        a=rng.random()*tau;r=.111*rng.random()**.55;x=r*cos(a);d=r*sin(a)
        if k%5==0:B('잘라 넣은 두부',x,d,.002,.025,.018,.012,'tofu',.002)
        elif k%3==0:R('접힌 김치 줄기',[(x-.016,d,.004),(x-.005,d+.009,.010),(x+.014,d-.002,.010)],.0042,'kimchi')
        else:sphere('고추기름 방울',x,d,.005,.006+rng.random()*.006,.004+rng.random()*.005,.0018,'oil',10,4)
    for k in range(14):
        x=rng.uniform(-.071,.063);d=rng.uniform(-.046,.045)
        ring('얇게 썬 대파 단면',x,d,.017+rng.uniform(0,.009),.008+rng.random()*.007,.0024,'onion' if k%3 else 'green',17,.62)
    group('sign')
    card(-.138,0,.001,.257,.115,'FOR DISPLAY','시식용 전시 음식',True)
    card(.138,0,.001,.257,.115,'KIMCHI STEW','김치찌개')
    group('cooker')
    B('매립 인덕션 검은 바탕',0,0,.008,2.89,.786,.059,'steel',.019)
    for i in range(4):
        x=(i-1.5)*.710;B('검은 내열 유리',x,0,.066,.680,.727,.011,'black',.008)
        for r in [.191,.201]:ring('열원 표식',x,-.008,.078,r,.0014,'steel',38)
        B('작은 조작 점 표시',x,.299,.078,.055,.010,.0015,'paper')
    group('hot')
    for i in range(4):
        x=(i-1.5)*.71;r=.247 if i%2 else .268
        P('무쇠 팬',x,0,.004,[(.70*r,0),(.90*r,.022),(r,.098),(r,.122),(.95*r,.130),(.86*r,.063),(.74*r,.045)],'iron',38,.91)
        for side in [-1,1]:
            R('양옆 루프 손잡이',[(x+side*r*.94,-.082,.098),(x+side*(r+.045),-.070,.123),(x+side*(r+.050),.053,.123),(x+side*r*.95,.077,.100)],.013,'black',9)
        if i%2==0:
            P('무쇠 뚜껑',x,0,.124,[(r*.94,0),(r*.956,.01),(r*.78,.043),(r*.32,.067),(r*.01,.068)],'iron',40,.91)
            P('뚜껑 놋쇠 손잡이',x,0,.192,[(.025,0),(.015,.011),(.027,.019),(.021,.027)],'brass',20)
        else:
            P('팬 바닥의 양념',x,0,.040,[(r*.78,0),(r*.83,.011)],'braise',30,.9)
            for k in range(23):
                a=k*2.40;rr=r*.73*(k/23)**.55
                sphere('윤기를 낸 채소 조각',x+rr*cos(a),rr*sin(a)*.84,.072,.027,.021,.019,['pepper','carrot','green','tofu'][k%4])
