"""Rebuild the editable displays shown in the terminal operator's floor 2 and 4 photographs."""
from math import cos, exp, pi, sin, sqrt
from pathlib import Path
import runpy

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
TAU = 2*pi
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['reference']='https://exterminal.co.kr/images/n_floor02.jpg, n_floor04-new-1.jpg, n_floor04-new-2.jpg'


def textile(name, hex_color):
    rgb = [int(hex_color[i:i+2],16)/255 for i in [0,2,4]]
    mat=bpy.data.materials.new(name)
    mat.diffuse_color=tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,)
    return mat


cream=textile('아이보리 · 광목','f1ead9')
ivory=textile('표백 면','f6f1e8')
sky=textile('연한 청자색','b1d6d3')
aqua=textile('밝은 옥색','7db5ba')
teal=textile('청록색','44818c')
blue=textile('쪽빛','446984')
navy=textile('남색','334c59')
pearl=textile('진주색','d8d6c8')
lime=textile('올리브 · 연둣빛','a7b964')
sage=textile('잿빛 녹색','93a88a')
pink=textile('분홍 · 솜사탕','efb9be')
salmon=textile('연어색','dc9287')
rose=textile('장밋빛 프린트','c86f77')
wine=textile('자주빛','8a4153')
mustard=textile('황금빛 실','caac69')
charcoal=textile('먹색 실','424547')
wheat=textile('아마색','cfbaa0')
brown=textile('월넛','684530')
mahogany=textile('마감 원목','8d5f49')
gold=textile('황동','b58d4c')
brass=textile('광택 황동','d5b777')
silver=textile('백색 금속','bbbcb2')
porcelain=textile('연유리 · 비즈','e6d7b3')
flax=textile('잿빛 린넨','b0a397')
linen=textile('크림 린넨','d2c4ad')
darkblue=textile('문선 · 청록','355b61')
tealshade=textile('문선 · 홈','253f44')
tealedge=textile('문선 · 단면','57777a')
red=textile('줄무늬 · 심홍','b74a4f')
green=textile('줄무늬 · 녹청','628f82')
warm=textile('갓 · 호박빛','eac089')
amber=textile('갓 · 주름','cc985d')
shell={'점포 후면','측벽','전면 문선','상부 돌림띠','밝은 천장','등기구','광확산판','장 측판','진열 선반'}
with bpy.data.libraries.load(str(HERE.parent/'gyeongbu'/'market.blend'),link=False) as (_,source):
    source.collections=['Bedding','Curtains']
original={c.name:c for c in source.collections}
for c in original.values():scene.collection.children.link(c)
scene.view_layers[0].update()


def shop(group,key,offset,old):
    global display,origin
    origin=offset
    display=bpy.data.collections.new(group)
    display['bundle']=group
    display['origin']=[offset,0,0]
    scene.collection.children.link(display)
    for o in original[key].objects:
        label=o.name.split('.')[0]
        if label not in shell and not (key=='Bedding' and label in {'진열 상판','상 받침'}):continue
        child=o.copy();display.objects.link(child)
        child.location.x+=offset-old


def mesh(name, points, faces, materials, indices=None):
    if not isinstance(materials,list):materials=[materials]
    g=bpy.data.meshes.new(name)
    g.from_pydata([(origin+x,-d,z) for x,d,z in points],[],faces)
    g.update()
    for mat in materials:g.materials.append(mat)
    if indices:
        for face,idx in zip(g.polygons,indices):face.material_index=idx
    item=bpy.data.objects.new(name,g);display.objects.link(item)


def loft(name, rows, mat, wrap=True, caps=True):
    n=len(rows[0]);m=len(rows)
    f=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(m-1) for j in range(n if wrap else n-1)]
    if wrap and caps:f += [tuple(reversed(range(n))),tuple(range((m-1)*n,m*n))]
    mesh(name,[p for row in rows for p in row],f,mat)


def tube(name, points, rad, mat, n=6):
    points=[Vector(p) for p in points];rows=[]
    for i,p in enumerate(points):
        direction=(points[min(i+1,len(points)-1)]-points[max(0,i-1)]).normalized()
        guide=Vector((0,1,0)) if abs(direction.y)<.8 else Vector((0,0,1))
        a=direction.cross(guide).normalized()
        b=direction.cross(a)
        rows.append([p+rad*(a*cos(TAU*k/n)+b*sin(TAU*k/n)) for k in range(n)])
    loft(name,rows,mat)


def box(name,x,d,z,w,dep,h,mat):
    loft(name,[[(x+w*sx/2,d+dep*sd/2,level) for sx,sd in [(-1,1),(1,1),(1,-1),(-1,-1)]]
               for level in [z,z+h]],mat)


def lathe(name,x,d,profile,mat,n=18):
    loft(name,[[(x+r*cos(TAU*i/n),d+r*sin(TAU*i/n),z) for i in range(n)] for z,r in profile],mat)


def petal_print(name,point,u,v,s,flower,leaf):
    # A pair of lanceolate leaves and five overlapping petal lobes form a small stamped sprig.
    xy=[(-.10,-.80),(-.90,-.53),(-.91,-.21),(-.46,-.29),(-.02,-.66),(.06,-.56),(.43,-.27),(.85,-.32),(.94,-.55),(.57,-.65),(.17,-.64)]
    pts=[point(u+x*s,v+y*s) for x,y in xy];faces=[tuple(range(5)),tuple(range(5,11))]
    for t in range(5):
        a=t*TAU/5+.11
        start=len(pts)
        for k in range(7):
            b=k*TAU/7
            xx=.25*cos(a)+.27*cos(b);yy=.25*sin(a)+.24*sin(b)
            pts.append(point(u+xx*s,v+yy*s))
        faces.append(tuple(range(start,start+7)))
    mesh(name,pts,faces,[leaf,flower],[0,0,1,1,1,1,1])


def folded(x,d,z,w,depth,h,mat,trim):
    def outline(a,b):
        return [(-a,-b*.82),(-a*.91,-b),(a*.90,-b),(a,-.83*b),(a,b*.76),(a*.92,b),(-a*.86,b),(-a,b*.78)]
    rows=[[(x+u,d+v,level) for u,v in outline(w*.5*scale,depth*.5*scale)] for level,scale in [(z,.91),(z+.20*h,1),(z+.72*h,1),(z+h,.89)]]
    loft('접은 이불 · 둥글게 눌린 모서리',rows,mat)
    tube('접은 이불 · 말아 박은 겹단',[(x-w*.46,d+depth*.49,z+h*.55),(x-w*.26,d+depth*.514,z+h*.49),
                     (x+w*.24,d+depth*.516,z+h*.48),(x+w*.46,d+depth*.49,z+h*.58)],.008,trim,5)


def quilt(x,d,z,length,r,angle,body,flower,leaf,style):
    cv,sv=cos(angle),sin(angle)
    def pos(along,a,rr):
        radial=cos(a)*rr
        return (x+along*cv-radial*sv,d+along*sv+radial*cv,z+sin(a)*rr*.86)
    steps=24
    def ripple(along,a):
        # Small bulges read as quilt batting when adjacent diagonal stitching catches light.
        end=max(0,abs(along)/(length/2)-.86)
        return r*(1-.3*end+.020*cos(8*a+along*19)*cos(8*a-along*19))
    ax=[length*(i/16-.5) for i in range(17)]
    rows=[[pos(t,i*TAU/steps,ripple(t,i*TAU/steps)) for i in range(steps)] for t in ax]
    loft('통솜 이불 · 둥근 말림',rows,body)
    for sign in [-1,1]:
        t=length*.5*sign
        # Spiral on both ends is a continuous rolled hem, visible from an oblique aisle view.
        coil=[pos(t+.003*sign,.3+a*.25,r*(.11+.79*a/60)) for a in range(61)]
        tube('감긴 면 단면 · 나선',coil,.0105,leaf,5)
        ring=[pos(t+sign*.004,i*TAU/24,r*.94) for i in range(25)]
        tube('배색 끝 파이핑',ring,.009,flower,5)
    for k in range(4):
        along=length*(k/4-.37)
        for j in range(3):
            a=.04+(j+.5*(k%2))*.62
            def point(u,v):
                ang=a+v/r
                return pos(along+u,ang,ripple(along+u,ang)+.004)
            if style==0:petal_print('이불 잔꽃 · 꽃과 잎',point,0,0,.044,flower,leaf)
            elif style==1:
                ds=.015
                pts=[point(.002+ds*cos(i*TAU/7),ds*sin(i*TAU/7)) for i in range(7)]
                mesh('이불 · 둥근 프린트',pts,[tuple(range(7))],flower)
    if style==2:
        for k in range(8):
            t=length*(k/8-.45)
            # Short ribbons following the cylindrical surface make a diagonal stitched diamond.
            for sgn in [-1,1]:
                pts=[]
                for j in range(16):
                    a=-.35+j*.151;along=t+sgn*(a-.55)*.064
                    if abs(along)>length*.485:continue
                    for e in [-.003,.003]:pts.append(pos(along+e,a,ripple(along+e,a)+.002))
                mesh('다이아 누빔',pts,[(2*i,2*i+1,2*i+3,2*i+2) for i in range(len(pts)//2-1)],flower)


def cushion(x,d,z,w,h,depth,angle,colors,pattern=0):
    # Sewn front and back rise away from the piped perimeter. Curved stripes follow that volume.
    cv,sv=cos(angle),sin(angle)
    def point(u,v,front=1,raiseby=0):
        xx=(u-.5)*w*(1-.08*abs(2*v-1)**4)
        yy=(v-.5)*h*(1-.12*abs(2*u-1)**4)
        belly=(max(0,sin(pi*u)*sin(pi*v)))**.62
        face=front*(.018+depth*belly*.5)+raiseby-.10*yy
        return (x+xx*cv-face*sv,d+xx*sv+face*cv,z+yy)
    n=17;m=10
    pts=[];faces=[];ids=[]
    for side in [-1,1]:
        off=len(pts)
        pts+= [point(i/n,j/m,side) for j in range(m+1) for i in range(n+1)]
        for j in range(m):
            for i in range(n):
                a=off+j*(n+1)+i;faces.append((a,a+1,a+n+2,a+n+1))
                if side==-1:ids.append(0)
                elif pattern==1:ids.append([0,0,1,0,0,2,0,3,3,0,1,0,0,2,0,0,3][i]%len(colors))
                else:ids.append(0)
    mesh('쿠션 · 양면의 볼록한 속솜',pts,faces,colors,ids)
    perimeter=[(i/8,0) for i in range(8)]+[(1,i/6) for i in range(6)]+[(1-i/8,1) for i in range(8)]+[(0,1-i/6) for i in range(7)]
    tube('쿠션 · 테두리 파이핑',[point(u,v,0) for u,v in perimeter],.012,colors[-1],6)
    if pattern==2:
        for j in range(3):
            for i in range(5):
                a=.12+.173*i+.035*(j%2);b=.21+.27*j
                pleat=[point(a+.053*cos(k*TAU/12),b+.056*sin(k*TAU/12),1,.005) for k in range(12)]
                mesh('쿠션 · 쪽빛 물방울',pleat,[tuple(range(12))],colors[1+(i+j)%2])
    if pattern==3:
        for j in range(3):
            for i in range(3):
                a=.18+i*.29+.03*(j%2);b=.18+j*.32
                petal_print('쿠션 · 수놓은 잎과 꽃',lambda u,v:point(a+u/w,b+v/h,1,.006),0,0,.067,colors[1],colors[2])


shop('quilt-shop','Bedding',0,0)
for level in range(4):
    for col in range(7):
        low=[cream,sky,pink,pearl,salmon,ivory,aqua][(level*2+col)%7]
        for tier in range(2+(1 if col%3==0 and level!=3 else 0)):
            mat=[low,ivory,low][tier]
            folded(-1.97+col*.655+.016*sin(col+level+tier),-.99+.022*cos(col+tier),.24+level*.52+tier*.14,
                   .61 if tier<2 else .55,.42,.134,mat,cream if tier!=1 else wheat)
# The front group shows broad patterned faces, with spiral ends visible at either side.
for tier in range(2):
    for row in range(2):
        for col in range(3):
            if tier==1 and (row+col)%3==0:continue
            palette=[(sky,ivory,teal,0),(cream,rose,sage,0),(pink,rose,cream,2),(pearl,ivory,blue,2),
                     (lime,cream,sage,2),(ivory,aqua,blue,1),(salmon,ivory,rose,0)]
            b,f,l,style=palette[(tier*2+row+col*3)%len(palette)]
            rr=.162+.019*((tier+col+row)%3)
            quilt(-1.74+.88*col+.04*tier,.13+.57*row,.71+rr*.86+.285*tier,.85,rr,(-.15 if col%2 else .15),b,f,l,style)
# Additional folded comforters at the back left and tall white duvets seen beyond the rolls.
for col,x in enumerate([-1.62,-.70]):
    for j in range(7-col):
        folded(x,-.39, .70+j*.14,.91-.025*j,.46,.14,[sky,pearl,cream,pink,ivory][(col+j)%5],cream)
for j in range(7):
    folded(.57,-.73,.25+j*.17,.70-.009*j,.49,.169,ivory,pearl)
# Upright and reclining cushions overlap naturally on a stack of bound pads.
for i in range(4):folded(1.54,.13,.70+i*.135,1.20,.86,.134,[sky,pearl,cream,pink][i],teal if i==0 else cream)
for x,d,z,w,h,a,colors,patt in [
    (1.11,.03,1.53,.62,.57,.20,[ivory,navy,teal,aqua],2),(1.63,-.06,1.53,.61,.55,-.14,[sky,ivory,blue,teal],1),
    (1.94,.14,1.49,.48,.53,-.30,[cream,salmon,sage,wheat],3),(1.24,.39,1.44,.67,.46,.12,[cream,teal,navy,blue],2),
    (1.72,.43,1.42,.62,.53,-.20,[ivory,aqua,mustard,blue],1)]:
    cushion(x,d,z,w,h,.20,a,colors,patt)


def drapery(x,d,w,top,bottom,mat,trim,gather=0,side=1,lacy=False,printed=False):
    # Width and the position of each pleat vary through a real tie point.
    def surface(u,v,delta=0):
        tied=exp(-((v-.46)/.19)**2)*gather
        waves=2*pi*(7.0*u+.18*v+.08*sin(5*v+u))
        wave=.5+.5*cos(waves)
        width=w*(1-.75*tied)
        cx=x+side*w*.18*tied
        height=bottom+(top-bottom)*v
        spread=(1-v)**3
        return (cx+(u-.5)*width, d+.07*wave*(1-.78*tied)+.022*cos(3*pi*u)*spread+delta,
                height+.027*spread*(wave-.5)+.015*sin(1.7*pi*u)*spread)
    n=44;m=50 if lacy else 20
    pts=[surface(i/n,j/m) for j in range(m+1) for i in range(n+1)]
    faces=[];ids=[]
    for j in range(m):
        for i in range(n):
            # Open warp intervals make the rear curtain visible through the ivory sheers.
            if lacy and j not in [0,1,m-2,m-1] and (i+int(j/5)*2)%5 in [1,2] and j%5 in [1,2]:continue
            a=j*(n+1)+i;faces.append((a,a+1,a+n+2,a+n+1))
            ids.append(1 if (i+1)%6==0 else 0)
    mesh('창가 원단 · 묶은 주름' if gather else '길게 늘어뜨린 견본 원단',pts,faces,[mat,trim],ids)
    hem=[surface(i/30,.017,.004) for i in range(31)]
    tube('커튼 · 하단 말아 박기',hem,.008,trim,5)
    if lacy:
        for j in range(9):
            for i in range(3):
                u=.16+i*.30+.056*(j%2);v=.08+j*.104
                def eyelet(a,b):return surface(u+a/w,v+b/(top-bottom),.005)
                petal_print('자수 속커튼 · 꽃술',eyelet,0,0,.043,ivory,linen)
    if printed:
        for j in range(6):
            for i in range(3):
                cx=.17+i*.30+.025*(j%2);v=.10+j*.15
                def stamp(tx,ty):return surface(cx+tx/w,v+ty/(top-bottom),.006)
                petal_print('직물 · 꽃무늬 날염',stamp,0,0,.073,pink if mat==wine else wheat,sage)
    if gather:
        for j in range(2):
            band=[surface(u/20,.44+.027*j+.026*(u/20-.5)**2,.023) for u in range(21)]
            tube('묶음끈 · 땋은 두 줄',band,.011,brass if mat!=flax else linen)
        sx,sd,sh=surface(.77 if side>0 else .23,.45,.029)
        px=sx+.045*side
        tube('술 장식 · 두르는 끈',[(sx,sd,sh),(px+.02,sd+.018,sh-.055),(px,sd+.019,sh-.13)],.012,brass)
        lathe('술 장식 · 엮은 머리',px,sd+.02,[(sh-.18,.025),(sh-.157,.038),(sh-.13,.020)],gold,12)
        lathe('술 장식 · 밑단',px,sd+.022,[(sh-.30,.049),(sh-.285,.052),(sh-.177,.023)],wheat,15)
        for k in range(3):
            u=(k-1)*.018;tube('술 장식 · 끝실',[(px+u*.50,sd+.048,sh-.179),(px+u,sd+.062,sh-.3)],.0035,cream,5)


def chair(x,d):
    # Turned feet and bent wood arms sit inside the existing 0.66 m by 0.57 m display envelope.
    for side in [-1,1]:
        for depth in [-.19,.20]:
            lathe('상담 의자 · 앞·뒷다리',x+side*.264,d+depth,[(.013,.032),(.046,.048),(.083,.032),
                     (.17,.021),(.27,.034),(.38,.042),(.425,.032)],brown,10)
        # The wooden arm and its uprights curve around the striped upholstery.
        sx=x+side*.295
        tube('상담 의자 · 원목 팔걸이',[(sx,d-.22,.77),(sx,d-.15,.68),(sx,d+.08,.66),
               (sx,d+.22,.68),(sx,d+.25,.65),(sx,d+.223,.61)],.027,mahogany,9)
        tube('상담 의자 · 팔걸이 받침',[(sx,d+.18,.41),(sx,d+.18,.52),(sx,d+.22,.62)],.018,brown)
    box('상담 의자 · 목재 하부틀',x,d,.385,.60,.48,.058,brown)
    folded(x,d,.435,.58,.47,.104,red,wheat)
    # The front of the seat lip is striped to match the backrest.
    for j in range(9):
        x0=x-.255+j*.063
        box('상담 의자 · 방석 줄무늬',x0,d+.225,.458,.026,.018,.061,[cream,green,cream][j%3])
    cushion(x,d-.195,.835,.62,.63,.138,-.03,[green,cream,red,red],1)
    cushion(x-.11,d-.042,.687,.32,.27,.097,.19,[linen,rose,green,wine],3)


shop('drapery-shop','Curtains',7,7)
# In the showroom photo, honey-coloured stone continues from the front threshold to the display wall.
for i in range(9):
    for j in range(5):
        box('진열 바닥 · 옅은 석재',-2.19+i*.55,-1.12+j*.52,.004,.548,.518,.009,[wheat,linen,pearl,linen][(i+2*j)%4])
# The shopfront has deep teal fluted side piers framing an open display.
for side in [-1,1]:
    cx=side*2.37
    box('청록색 문선 · 넓은 측판',cx,1.23,.015,.28,.17,2.66,darkblue)
    box('청록색 문선 · 걸레받이',cx,1.26,.008,.31,.20,.13,tealshade)
    for j in range(3):
        sx=cx+(j-1)*.070
        box('문선 · 오목한 세로 홈',sx,1.318,.37,.011,.009,2.01,tealshade)
        box('문선 · 홈 모서리',sx+.007,1.319,.37,.003,.008,2.01,tealedge)
# At the back, rich printed cottons hang beside long, pale linen and sheers.
for i,(x,w,mat,edge,lace,print_) in enumerate([
    (-1.93,.91,cream,ivory,True,False),(-1.15,.91,wine,rose,False,True),(-.37,.96,linen,cream,False,False),
    (.50,.82,navy,teal,False,True),(1.04,.43,ivory,cream,True,False)]):
    drapery(x,-.82,w,2.70,.12,mat,edge,.32 if i in [1,3] else 0,1 if i%2 else -1,lace,print_)
for level in range(4):
    for row in range(3):
        folded(1.78,-1,.24+.52*level+row*.122,1.0-.025*row,.42,.119,
               [sage,pearl,cream,wheat,sky,flax][(level*2+row)%6],cream)
# Front: the photograph shows floral sheers to the left of double grey tied drapes.
drapery(-1.94,.34,.72,2.65,.11,cream,ivory,0,1,True)
drapery(-1.45,.35,.53,2.65,.10,wine,salmon,.76,-1,False,True)
drapery(-.99,.81,.60,2.68,.09,flax,linen,.92,-1)
drapery(-.53,.78,.53,2.68,.10,linen,pearl,.90,1)
drapery(.17,-.35,.64,2.66,.10,ivory,cream,0,1,True)
drapery(2.085,.81,.42,2.68,.11,flax,cream,.44,1)
tube('커튼 봉 · 황동 관', [(-2.20,.855,2.714),(2.19,.855,2.714)],.018,gold,10)
for x in [-2.21,2.20]:
    lathe('커튼 봉 · 장식 마구리',x,.855,[(2.676,.016),(2.690,.036),(2.717,.044),(2.741,.035),(2.753,.014)],brass,12)
for x in [-1.27,-1.16,-1.05,-.94,-.81,-.72,-.62,-.52,-.42,-.34,1.91,2.01,2.12,2.19]:
    ring=[(x,.85+.032*cos(k*TAU/10),2.70+.038*sin(k*TAU/10)) for k in range(11)]
    tube('핀 커튼 · 걸이 고리',ring,.0055,brass,5)
# A lit pleated floor lamp and the striped consultation armchair sit on the right.
chair(1.28,.44)
lx,ld=.69,-.145
lathe('플로어 스탠드 · 황동 받침',lx,ld,[(.006,.164),(.020,.174),(.038,.169),(.062,.103),(.079,.081)],gold,24)
lathe('플로어 스탠드 · 장식 기둥',lx,ld,[(.068,.045),(.12,.037),(.16,.020),(.63,.016),(.66,.042),
        (.691,.029),(.73,.044),(.79,.018),(1.15,.017),(1.21,.040),(1.24,.024),(1.38,.016)],brass,14)
n=48; shade=[]
for z,r in [(1.32,.185),(1.355,.188),(1.66,.145),(1.682,.145)]:
    shade.append([(lx+r*(1 if k%2 else .958)*cos(k*TAU/n),ld+r*(1 if k%2 else .958)*sin(k*TAU/n),
                  z-(.009 if k%2 and z<1.33 else 0)) for k in range(n)])
shadefaces=[(j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k) for j in range(3) for k in range(n)]
mesh('플로어 스탠드 · 주름 갓',[p for r in shade for p in r],shadefaces,[warm,amber],[k%2 for k in range(n)]*3)
for z,r in [(1.319,.183),(1.677,.145)]:
    tube('플로어 스탠드 · 갓 가장자리',[(lx+r*cos(k*TAU/32),ld+r*sin(k*TAU/32),z) for k in range(33)],.0075,amber,6)
# Small chandelier rims and glass drops above the left window are visible in the angled photo.
cx,cd=-1.75,.13
lathe('소형 창가 샹들리에 · 황동 고정구',cx,cd,[(2.65,.022),(2.71,.017),(2.77,.04),(2.792,.09)],brass,10)
for ring in range(2):
    rr=.13-ring*.047;level=2.65-ring*.085
    tube('소형 창가 샹들리에 · 둘레',[(cx+rr*cos(k*TAU/20),cd+rr*sin(k*TAU/20),level) for k in range(21)],.0065,brass,6)
    for q in range(8):
        xx=cx+rr*cos(q*TAU/8);dd=cd+rr*sin(q*TAU/8)
        lathe('소형 창가 샹들리에 · 유리 방울',xx,dd,[(level-.075,.006),(level-.058,.018),(level-.034,.015),(level,.003)],porcelain,7)
# Low sample cushions, visible behind the left-hand display in the operator's photo.
for x,d,angle,colors,pattern in [(-1.95,.40,-.06,[wine,pink,sage,cream],3),(-1.61,.22,.02,[linen,navy,teal,green],2),
                             (-1.84,.63,.22,[cream,rose,sage,wine],3)]:
    cushion(x,d,.27,.39,.39,.13,angle,colors,pattern)

for c in original.values():
    scene.collection.children.unlink(c)
    bpy.data.collections.remove(c)
bpy.data.orphans_purge(do_recursive=True)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=10
        area.spaces.active.region_3d.view_location=(3.5,0,1.3)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'homewares.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'))
