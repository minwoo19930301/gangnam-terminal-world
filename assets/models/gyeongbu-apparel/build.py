"""Create close-view clothing stock inside the existing upper-floor shop frame."""
from math import pi, sin, cos, sqrt, radians
from pathlib import Path
import runpy

import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
TAU=2*pi
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['research']='Operator photographs floor06.jpg, floor07.jpg and floor08.jpg, https://exterminal.co.kr/floor.asp'


def fabric(name,hex_value):
    value=[int(hex_value[i:i+2],16)/255 for i in (0,2,4)]
    m=bpy.data.materials.new(name)
    m.diffuse_color=tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in value)+(1,)
    return m


navy=fabric('짙은 감청 서지','293646')
slate=fabric('남회색 모직','4f5e6a')
navylapel=fabric('감청 라펠 · 결 방향','394b60')
graystitch=fabric('퀼트 · 누빔 실','788783')
shadowsuit=fabric('검정 라펠 · 결 방향','424954')
charcoal=fabric('먹색 능직','30343a')
black=fabric('흑색 소모직','26282c')
burgundy=fabric('포도주색 모직','793d4b')
camel=fabric('낙타색 울','b48756')
grey=fabric('회갈색 다운 외피','8d9693')
deepgrey=fabric('짙은 회록색 외피','687774')
blue=fabric('푸른 패딩','3f80a4')
rust=fabric('붉은 오렌지','c45e3e')
orange=fabric('감귤색 니트','de8336')
blush=fabric('연분홍 면','e8acb3')
pearl=fabric('크림 면','f2e9dd')
white=fabric('흰 포플린','f3f1e9')
lilac=fabric('라일락색 망사','bda2c8')
aqua=fabric('민트 면','86b5b2')
scarlet=fabric('붉은 넥타이','c9443d')
silk=fabric('은회색 실크','bec2bb')
ochre=fabric('꿀빛 실','d3b06b')
wine=fabric('자주색 실크','8a4e70')
moss=fabric('잎무늬 녹색','466a59')
wood=fabric('옷걸이 · 너도밤나무','b59874')
steel=fabric('크롬 · 밝은 부재','c0c4c2')
nickel=fabric('금속 · 그림자','919795')
button=fabric('검은 뿔 단추','414044')
mannequin=fabric('몸판 · 리넨','d8c3a7')
furcolors=[fabric('회색 털 · '+str(i),c) for i,c in enumerate(['5c6464','727b7b','919998','a2aba7','646d70'])]
rails={'점포 후면','측벽','전면 문선','상부 돌림띠','밝은 천장','등기구','광확산판','이동식 행거 발','행거 기둥','옷걸이 봉','진열 상판','상 받침','마네킹 원형 받침','마네킹 축','마네킹 목'}

with bpy.data.libraries.load(str(HERE.parent/'gyeongbu'/'market.blend'),link=False) as (available,load):
    load.collections=['Children','Suits','Womenswear']
stores={c.name:c for c in load.collections}
for c in stores.values():scene.collection.children.link(c)
bpy.context.view_layer.update()
turn=0; model_scale=1;x0=d0=h0=0


def frame(x=0,d=0,h=0,rotation=0,scale=1):
    global x0,d0,h0,turn,model_scale
    x0,d0,h0,turn,model_scale=x,d,h,rotation,scale


def world(x,d,h):
    return (origin+x0+model_scale*(x*cos(turn)-d*sin(turn)),
            -(d0+model_scale*(x*sin(turn)+d*cos(turn))),h0+h*model_scale)


def mesh(name,points,faces,mats,ids=None,smooth=False):
    if not isinstance(mats,list):mats=[mats]
    data=bpy.data.meshes.new(name)
    data.from_pydata([world(*p) for p in points],[],faces);data.update()
    for mat in mats:data.materials.append(mat)
    for i,f in enumerate(data.polygons):
        f.use_smooth=smooth
        if ids:f.material_index=ids[i]
    o=bpy.data.objects.new(name,data)
    display.objects.link(o)
    return o


def loft(name,rows,mat,close=True,cap=True):
    n=len(rows[0]);m=len(rows)
    faces=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(m-1) for j in range(n if close else n-1)]
    if cap and close:faces.extend([tuple(reversed(range(n))),tuple(range((m-1)*n,m*n))])
    return mesh(name,[p for row in rows for p in row],faces,mat)


def rod(name,path,radius,mat,n=7):
    path=[Vector(v) for v in path];rings=[]
    for i,p in enumerate(path):
        tangent=(path[min(i+1,len(path)-1)]-path[max(0,i-1)]).normalized()
        a=tangent.cross(Vector((1,0,0)) if abs(tangent.x)<.84 else Vector((0,1,0))).normalized();b=tangent.cross(a)
        rings.append([p+radius*(a*cos(k*TAU/n)+b*sin(k*TAU/n)) for k in range(n)])
    return loft(name,rings,mat)


def ellipse(name,sections,mat,n=20,folds=0):
    rows=[]
    for j,(h,w,d,cx,cd) in enumerate(sections):
        points=[]
        for k in range(n):
            a=k*TAU/n
            fold=1+folds*sin(7*a+j*.24)*(1+.25*cos(3*a))
            points.append((cx+w*cos(a)*fold,cd+d*sin(a)*fold,h))
        rows.append(points)
    return loft(name,rows,mat)


def panel(name,xyz,mat):
    return mesh(name,xyz,[tuple(range(len(xyz)))],mat)


def patch(name,x,d,z,w,h,mat,tip=0):
    points=[(x-w/2,d,z),(x+w/2,d,z),(x+w/2,d+.001,z-h+.005),(x+tip,d+.002,z-h),(x-w/2,d+.001,z-h+.005)]
    panel(name,points,mat)


def disc(name,x,d,z,r,mat,n=8):
    front=[(x+r*cos(i*TAU/n),d+.002,z+r*sin(i*TAU/n)) for i in range(n)]
    rear=[(a,d-.003,b) for a,_,b in front]
    loft(name,[rear,front],mat)


def hanger(z,w=.19):
    # Hook, broad hanger shoulders and tie bar form one continuous support.
    rod('행거 · 열린 고리',[(0,0,z-.054),(.001,0,z-.012),(.024,0,z+.01),(.023,0,z+.032),
        (.010,0,z+.044),(-.008,0,z+.042),(-.021,0,z+.029)],.0055,steel)
    rod('옷걸이 · 어깨', [(-w,0,z-.147),(-w*.77,0,z-.113),(-.040,0,z-.057),
        (0,0,z-.047),(.045,0,z-.058),(w*.77,0,z-.115),(w,0,z-.147)],.012,wood)
    rod('옷걸이 · 옆단 잇는 봉',[(-w,0,z-.146),(w,0,z-.146)],.0055,nickel)


def sleeve(side,h,w,length,mat,puff=False):
    shoulder=side*w
    secs=[]
    for f,dr,th in [(0,0,.068),(.11,.037,.086),(.40,.080,.070),(.65,.103,.064),(.86,.122,.058),(1,.116,.049)]:
        if puff:th*=1.14
        secs.append((h-f*length,th,th*1.23,shoulder+side*dr,.008+.027*f))
    ellipse('소매 · 굽힌 팔꿈치와 좁아진 손목',secs,mat,12,.032)
    _,radius,depth,cx,cd=secs[-1]
    ellipse('소매 끝단',[(h-length+.020,radius+.002,depth+.002,cx,cd),(h-length,radius+.002,depth+.002,cx,cd)],mat,12)


def jacket(color,h=1.52,hero=False,length=.76,puffer=False):
    width=.209 if not puffer else .236
    levels=[(h-length,.20,.104),(h-length+.09,.208,.108),(h-length*.50,.177,.105),
            (h-.215,width+.008,.123),(h-.105,width+.014,.116),(h-.046,.152,.1),(h-.015,.08,.073)]
    ellipse('몸판 · 가슴과 허리곡선',[(z,w,d,0,0) for z,w,d in levels],color,24,.018)
    for side in [-1,1]:sleeve(side,h-.091,width,.57 if not puffer else .61,color,puffer)
    # Bend every seam to the chest instead of burying lettering or flat patches in the cloth.
    def chest(x,z):
        for (h1,w1,d1),(h2,w2,d2) in zip(levels,levels[1:]):
            if z<=h2:
                t=max(0,min(1,(z-h1)/(h2-h1)))
                w=w1+(w2-w1)*t;d=d1+(d2-d1)*t
                return d*sqrt(max(.02,1-(x/w)**2))+.005
        return .077
    def overlay(name,xz,material,gap=.006):
        panel(name,[(x,chest(x,z)+gap,z) for x,z in xz],material)
    tiecolor=scarlet if hero else [navy,wine,ochre][int(h*21)%3]
    lapel=navylapel if color==navy else shadowsuit if color in (charcoal,black) else color
    overlay('셔츠 · 열린 앞섶',[(-.087,h-.015),(.087,h-.015),(.110,h-.15),(.012,h-.38),(-.109,h-.15)],white if hero else pearl)
    overlay('실크 넥타이',[(-.014,h-.040),(.016,h-.04),(.036,h-.19),(.013,h-.354),(-.032,h-.23)],tiecolor,.014)
    overlay('타이 매듭',[(-.030,h-.027),(.028,h-.027),(.013,h-.066),(-.013,h-.066)],tiecolor,.016)
    for sign in [-1,1]:
        overlay('셔츠 깃',[(sign*.078,h-.002),(sign*.009,h-.024),(sign*.043,h-.09),(sign*.099,h-.038)],white,.020)
        overlay('접힌 노치 라펠',[(sign*.08,h-.006),(sign*.178,h-.087),(sign*.125,h-.114),
            (sign*.163,h-.141),(sign*.034,h-.331),(0,h-.38),(sign*.081,h-.065)],lapel,.020)
        overlay('포켓 · 덮개',[(sign*.097,h-length+.212),(sign*.190,h-length+.200),
            (sign*.187,h-length+.169),(sign*.099,h-length+.176)],lapel,.007)
    if hero:
        overlay('흰색 포켓치프',[(.073,h-.21),(.095,h-.169),(.111,h-.184),(.141,h-.160),(.153,h-.190),(.145,h-.202)],white,.023)
        rod('가슴 포켓 · 웰트',[(.073,chest(.073,h-.216)+.024,h-.216),(.155,chest(.155,h-.197)+.024,h-.197)],.006,navylapel)
    for z in [h-.377,h-.469]:
        depth=chest(-.010,z)+.017
        disc('뿔단추',-.010,depth,z,.012,button)
        if hero:rod('단추의 실', [(-.013,depth+.004,z-.003),(-.007,depth+.004,z+.003)],.0014,grey,4)
    rod('겹친 앞섶 · 스티치',[(x,chest(x,z)+.010,z) for x,z in [(0,h-.377),(-.014,h-.53),(-.026,h-length+.018)]],.0021,lapel,4)


def tie(x,depth,top,length,width,color,stripe=None,flip=0):
    pts=[(x-.025,depth,top),(x+.025,depth,top),(x+.020,depth+.006,top-.048),
         (x+width/2,depth+.030,top-length+.07),(x+flip,depth+.031,top-length),
         (x-width/2,depth+.030,top-length+.07),(x-.018,depth+.005,top-.046)]
    panel('실크 넥타이 · 뾰족한 끝',pts,color)
    if stripe:
        for k in range(5):
            z=top-.082-k*length*.145
            w=width*(.48+.38*k/4)
            d=depth+.010+(top-z)/length*.026
            panel('바이어스 짜임 · 사선',[(x-w/2,d,z),(x+w/2,d,z+.021),(x+w/2,d+.001,z+.030),(x-w/2,d+.001,z+.008)],stripe)

def dress(color,h=1.54,shape=0):
    # The operator's low children's rail has small bodices, gathered waists and a bell-shaped hem.
    waist=h-.27
    ellipse('아동 드레스 · 몸판',[(waist,.105,.057,0,0),(waist+.12,.13,.062,0,0),
          (h-.075,.138,.059,0,0),(h-.033,.095,.045,0,0),(h-.020,.056,.036,0,0)],color,20,.020)
    for side in [-1,1]:
        ellipse('퍼프 소매',[(h-.174,.040,.052,side*.148,.003),(h-.120,.060,.062,side*.156,.003),
            (h-.07,.053,.055,side*.139,0),(h-.046,.026,.034,side*.108,0)],color,12,.08)
    levels=[(waist+.01,.101,.052),(waist-.08,.137,.077),(waist-.17,.181,.10),
            (waist-.27,.216,.124),(waist-.31,.226,.128)]
    rows=[]
    for i,(z,w,d) in enumerate(levels):
        row=[]
        for k in range(40):
            a=k*TAU/40;fold=1+(.10+i*.015)*cos(10*a+.18*shape)
            row.append((w*fold*cos(a),d*fold*sin(a),z+(.005*i/4)*cos(10*a)))
        rows.append(row)
    loft('치마 · 열 갈래 주름',rows,color)
    last=rows[-1]
    loft('밑단 · 스캘럽', [[(x,y,z+.022) for x,y,z in last],[(x*1.005,y*1.005,z+(i%2)*.006) for i,(x,y,z) in enumerate(last)]],
         pearl if color!=pearl else white)
    ellipse('허리 리본 띠',[(waist-.004,.110,.060,0,0),(waist+.027,.108,.061,0,0)],white,20)
    for s in [-1,1]:
        panel('허리 나비 리본',[(0,.068,waist+.012),(s*.056,.057,waist+.044),(s*.072,.059,waist+.021),
              (s*.059,.065,waist-.006)],pearl if color==white else white)
        # Petal-shaped Peter Pan collar.
        panel('둥근 칼라',[(s*.014,.036,h-.027),(s*.071,.036,h-.030),(s*.093,.047,h-.059),
              (s*.080,.060,h-.083),(s*.050,.067,h-.086),(s*.017,.062,h-.066)],white)
    disc('중앙 매듭',0,.073,waist+.015,.013,color)


def sweatshirt(color,contrast,h=1.51):
    ellipse('아동 맨투맨 · 두툼한 몸통',[(h-.42,.146,.066,0,0),(h-.378,.154,.077,0,0),
        (h-.22,.146,.076,0,0),(h-.065,.141,.066,0,0),(h-.022,.071,.049,0,0)],color,18,.034)
    for s in [-1,1]:
        ellipse('래글런 색동 소매',[(h-.393,.046,.061,s*.196,.03),(h-.30,.054,.060,s*.183,.014),
              (h-.15,.069,.071,s*.166,0),(h-.075,.058,.063,s*.126,0)],contrast,12,.035)
    ellipse('목둘레 시보리',[(h-.038,.062,.052,0,0),(h-.018,.061,.052,0,0)],contrast,16)
    ellipse('아랫단 시보리',[(h-.43,.141,.067,0,0),(h-.395,.15,.072,0,0)],contrast,18)
    # The pattern is a simple unbranded screenprint, photographed shirts have colourful graphics.
    disc('가슴 그래픽 · 해',.033,.078,h-.174,.040,ochre,12)
    panel('가슴 그래픽 · 겹친 봉우리',[(-.090,.081,h-.262),(-.018,.083,h-.171),(.032,.083,h-.232),
        (.071,.077,h-.194),(.114,.067,h-.266)],contrast)


def folded(x,d,z,w,mat,detail):
    frame(x,d,z)
    rows=[]
    for h,sw,sd in [(0,.46,.45),(.012,.5,.50),(.070,.50,.50),(.083,.46,.45)]:
        rows.append([(w*sw*(1 if cos(a*TAU/20)>=0 else -1)*abs(cos(a*TAU/20))**.31,
             .49*sd*(1 if sin(a*TAU/20)>=0 else -1)*abs(sin(a*TAU/20))**.33,h) for a in range(20)])
    loft('개어 놓은 의류 · 접힌 모서리',rows,mat)
    rod('옷단 · 접힌 가장자리',[(-w*.42,.218,.037),(0,.242,.041),(w*.42,.216,.035)],.0045,detail)
    if z>1:
        panel('접은 옷의 배색 단', [(-.07,.20,.085),(-.081,-.19,.086),(-.035,-.19,.086),(-.025,.20,.085)],detail)


def stripe_band(h,w,d,color):
    pts=[]
    for k in range(10):
        x=-w+2*w*k/9
        pd=d*sqrt(max(0,1-(x/(w*1.07))**2))+.003
        pts.extend([(x,pd,h+.006*sin(2*x/w)),(x,pd,h-.014+.006*sin(2*x/w))])
    mesh('누빔 봉제선',pts,[(2*k,2*k+1,2*k+3,2*k+2) for k in range(9)],color)


def coat(mat,lining,h=1.69,hood=False,long=True):
    bottom=h-(1.08 if long else .80)
    sections=[(bottom,.234,.129),(bottom+.085,.234,.127),(h-.58,.206,.118),
          (h-.36,.199,.119),(h-.21,.222,.128),(h-.14,.237,.122),(h-.065,.177,.102),(h-.006,.10,.086)]
    ellipse('외투 · 완만하게 퍼지는 몸판',[(z,w,d,0,0) for z,w,d in sections],mat,28,.033)
    for s in [-1,1]:sleeve(s,h-.117,.217,.603,mat,True)
    if hood:
        for k in range(4):
            z=bottom+.14+k*.18
            stripe_band(z,.217 if k<2 else .198,.124,graystitch)
        # The official photo shows a thick charcoal fur collar around the grey outer coat.
        ellipse('후드 안 · 골지 터틀넥',[(h-.070,.095,.090,0,.014),(h+.026,.089,.081,0,.011)],pearl,20)
        # A thick collar runs over the shoulders, down to the open V on each side.
        for side in [-1,1]:
            samples=[(side*.042,.143,h-.33),(side*.095,.141,h-.23),(side*.162,.099,h-.112),
                     (side*.144,.031,h-.056),(side*.094,-.040,h-.019),(side*.031,-.067,h-.01)]
            rod('두꺼운 후드 칼라 · 바탕',samples,.047,furcolors[0],9)
            for k in range(28):
                t=k/27*(len(samples)-1)
                j=min(int(t),len(samples)-2);f=t-j
                po=Vector(samples[j]).lerp(Vector(samples[j+1]),f)
                cx,cd,ch=po
                jag=.007*sin(k*2.06)
                pts=[(cx-side*.012,cd+.033,ch+.039),(cx+side*.021,cd+.041,ch+.010),
                     (cx+side*(.041+jag),cd+.051,ch-.052-jag),(cx+side*.031,cd+.016,ch-.017),
                     (cx+side*.010,cd-.011,ch)]
                mesh('퍼 트리밍 · 겹친 털 다발',pts,[(0,1,4),(1,2,4),(2,3,4),(3,0,4)],furcolors,
                     [(k+2)%5,(k+1)%5,(k+3)%5,k%5])
    else:
        for s in [-1,1]:
            panel('접힌 코트 칼라',[(s*.085,.089,h+.005),(s*.174,.077,h-.091),
                (s*.109,.123,h-.145),(s*.130,.11,h-.157),(s*.035,.138,h-.31)],lining)
    rod('앞 지퍼의 테이프',[(-.016,.109,bottom+.01),(-.013,.133,bottom+.12),
       (.004,.123,h-.48),(.018,.142,h-.24),(.028,.113,h-.09)],.007,lining)
    for s in [-1,1]:
        rod('손주머니 입구',[(s*.106,.116,h-.61),(s*.169,.084,h-.498)],.009,lining)
        disc('누름 단추',s*.116,.112,h-.605,.0085,steel)
    disc('지퍼 손잡이',.024,.143,h-.25,.013,nickel)


def trousers(color,h=1.44):
    for side in [-1,1]:
        ellipse('바지 · 별도 다리',[(h-.80,.065,.055,side*.091,.014),(h-.73,.071,.061,side*.088,.013),
            (h-.46,.070,.065,side*.083,.012),(h-.18,.09,.074,side*.079,0),(h-.042,.089,.078,side*.075,0)],color,14,.05)
        rod('프레스 주름선',[(side*.090,.064,h-.79),(side*.078,.076,h-.45),(side*.080,.082,h-.185)],.0018,nickel,4)
        rod('허리 집게',[(side*.12,.001,h+.015),(side*.12,.017,h-.063)],.009,steel)
    ellipse('허리단',[(h-.08,.16,.077,0,0),(h-.015,.148,.072,0,0)],color,16)
    for side in [-1,1]:
        panel('바지의 사선 주머니',[(side*.074,.077,h-.064),(side*.143,.040,h-.108),(side*.138,.046,h-.117),(side*.071,.082,h-.072)],slate)
    patch('허리 택',.100,.070,h-.037,.039,.064,pearl)
    rod('클립 행거', [(-.16,0,h+.015),(.16,0,h+.015)],.007,nickel)
    rod('행거 갈고리',[(0,0,h+.015),(0,0,h+.080),(.023,0,h+.102),(.003,0,h+.130),(-.012,0,h+.114)],.005,steel)


def cardigan():
    coat(orange,orange,h=2.11,long=False)
    panel('스카프 · 프린트 바탕',[(-.087,.093,2.10),(.082,.094,2.10),(.103,.115,1.88),
        (.070,.143,1.52),(-.056,.144,1.44),(-.091,.121,1.84)],moss)
    for k in range(25):
        x=.055*sin(k*2.392);z=2.06-.021*k
        dep=.111+.039*(2.06-z)/.55
        for side in [-1,1]:
            panel('잎사귀와 꽃무늬',[(x,dep,z),(x+.017*side,dep+.002,z+.014),
                (x+.024*side,dep,z+.012),(x+.017*side,dep,z-.003)],pearl if k%4 else blush)


def use_store(key,model,offset):
    global display,origin
    origin=offset;display=bpy.data.collections.new(model)
    scene.collection.children.link(display)
    display['origin']=[origin,0,0];display['bundle']=model
    source=stores[key]
    base={'Children':14,'Suits':21,'Womenswear':28}[key]
    for item in source.objects:
        label=item.name.split('.')[0]
        if label not in rails:continue
        o=item.copy()
        # The circular tie stand replaces the original front-right straight rail.
        coords=[item.matrix_world@Vector(p) for p in item.bound_box]
        center=sum(coords,Vector())/8
        if key=='Suits' and label in {'이동식 행거 발','행거 기둥','옷걸이 봉'} and center.x>base+.35 and center.y<0:
            bpy.data.objects.remove(o);continue
        display.objects.link(o)
        o.location.x+=offset-base
    frame()


use_store('Children','childrenswear',0)
for i,x in enumerate([-1.80,-1.14,-.48,.18,.84]):
    frame(x,-.80,.02,radians(.7*(i-3)))
    hanger(2.37,.135)
    if i in [0,3,4]:dress([pearl,blush,lilac][i%3],2.26,i)
    else:sweatshirt([aqua,white,blush][i%3],[blue,rust,navy][i%3],2.26)
for i,x in enumerate([-2.02,-1.75,-1.48,-1.21,-.94,-.62,-.31]):
    frame(x,.57,0,radians(18 if i==0 else 54 if i<5 else 12 if i==6 else 42))
    hanger(1.65,.13)
    if i<4:sweatshirt([blue,aqua,blush,pearl][i],[pearl,scarlet,white,blue][i],1.54)
    else:dress([pearl,lilac,blush][i-4],1.54,i)
for c in range(3):
    for j in range(5):
        folded(.67+c*.54,.22+.014*cos(j),.70+j*.082,.43,[pearl,blush,aqua,lilac,blue][(c+j)%5],white)

# Shelves of tightly folded bright merchandise occupy the right background of floor06.jpg.
frame(1.76,-1.00,0)
def cube(name,x,d,z,w,depth,high,mat):
    loft(name,[[(x+sx*w/2,d+sd*depth/2,zh) for sx,sd in [(1,1),(-1,1),(-1,-1),(1,-1)]]
               for zh in [z,z+high]],mat)
for side in [-1,1]:cube('벽 선반 · 세로틀',side*.63,0,.34,.038,.32,2.35,steel)
for i in range(5):
    level=.42+.46*i
    cube('벽 선반 · 얇은 단',0,0,level,1.29,.36,.032,nickel)
    for col in range(4):
        for layer in range(3):
            frame(1.29+col*.29,-.99-.012*(layer%2),level+.04+layer*.087)
            mat=[blush,blue,pearl,lilac,aqua,rust][(col*2+layer+i)%6]
            ellipse('밴드로 묶은 접은 상품',[(0,.126,.145,0,0),(.018,.140,.158,0,0),(.055,.140,.158,0,0),(.077,.129,.149,0,0)],mat,12)
            panel('상품 묶음 띠',[(-.021,.156,.012),(.022,.156,.012),(.023,.156,.058),(-.023,.156,.058)],white)
    frame(1.76,-1,0)

use_store('Suits','tailoring',7)
for i in range(14):
    x=-2.04+i*.31
    frame(x,-.80,0,radians((-1 if i<8 else 1)*(54 if i%4 else 26)))
    hanger(2.36,.196)
    jacket([navy,slate,charcoal,black,camel][i%5],h=2.23,length=.83)
for i,x in enumerate([-1.97,-1.73,-1.48,-1.24,-1.00,-.77,-.46]):
    frame(x,.552,0,radians(65 if i<5 else 50 if i==5 else -9))
    hanger(1.646,.19)
    jacket([slate,navy,charcoal,camel,black,slate,navy][i],1.52,hero=i==6)
frame(1.34,.48,0)
ellipse('회전 넥타이 행거 · 중심 기둥',[(.075,.026,.026,0,0),(1.57,.026,.026,0,0)],steel,12)
for k in range(5):
    a=k*TAU/5
    fx=.48*cos(a);fd=.195*sin(a)
    rod('회전 행거의 발',[(0,0,.114),(.46*fx,.46*fd,.09),(fx,fd,.050)],.017,nickel)
    ellipse('미끄럼 방지 받침',[(.015,.047,.032,fx,fd),(.046,.041,.028,fx,fd)],black,10)
points=[(.60*cos(k*TAU/36),.182*sin(k*TAU/36),1.59) for k in range(37)]
rod('광택 크롬 · 타원형 진열관',points,.016,steel)
for k in range(6):
    a=k*TAU/6
    rod('걸이 지지 살',[(0,0,1.65),(.60*cos(a),.18*sin(a),1.59)],.009,steel)
for k in range(18):
    a=(k+.45)*TAU/18
    x=.572*cos(a);d=.176*sin(a);z=1.596
    mat=[navy,scarlet,wine,ochre,slate,burgundy,aqua,rust][k%8]
    rod('넥타이 개별 고리',[(x,d-.017,z-.038),(x,d-.011,z+.017),(x,d+.014,z+.019),(x,d+.024,z-.032)],.004,nickel,5)
    tie(x,d+(.020 if sin(a)>0 else -.023),z-.027,.54+.08*(k%3),.079,mat,[pearl,ochre,slate][k%3] if k%4!=0 else None,.006*sin(a))

use_store('Womenswear','outerwear',14)
for i,x in enumerate([-1.82,-1.12,-.42,.28,.98,1.68]):
    frame(x,-.79,0,radians(-9+3*(i%3)))
    hanger(2.36)
    if i==2:
        frame(x,-.79,.13,radians(-3));cardigan()
    elif i in [1,3,5]:coat([burgundy,rust,camel][i%3],pearl,h=2.24,long=i!=5)
    else:jacket([deepgrey,slate][i%2],h=2.24,length=.84)
for i,x in enumerate([-2.04,-1.78,-1.52,-1.25,-.98,-.71,-.43]):
    frame(x,.555,0,radians(60 if i<5 else 31 if i==5 else 6))
    trousers([charcoal,camel,burgundy,slate,deepgrey,navy,camel][i],1.529)
frame(.68,.45,0,radians(-9));coat(burgundy,pearl,h=1.59)
frame(1.69,.11,0,radians(-18));coat(grey,deepgrey,h=1.59,hood=True)

for c in stores.values():
    scene.collection.children.unlink(c)
    bpy.data.collections.remove(c)
bpy.data.orphans_purge(do_recursive=True)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=13
        area.spaces.active.region_3d.view_location=(7,0,1.4)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'apparel.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'))
