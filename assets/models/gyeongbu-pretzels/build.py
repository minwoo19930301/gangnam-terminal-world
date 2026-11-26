"""Bake a terminal pretzel counter with an editable stainless warmer and independently editable stock."""
from math import cos, exp, pi, sin
from pathlib import Path
from random import Random
import runpy
import json
import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
TAU=2*pi
rng=Random(19425)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['branch_reference']='2025-10-24 guest photographs of the warmer and sleeve, https://polle.com/solubleblue/posts/1467'
scene['food_reference']='https://auntieannes.co.kr/brandstory/ and official bakery menu'


def material(name,h):
    rgb=[int(h[i:i+2],16)/255 for i in [0,2,4]]
    m=bpy.data.materials.new(name)
    m.diffuse_color=tuple(c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4 for c in rgb)+(1,)
    return m


chrome=material('스테인리스 · 반사광','caced0');silver=material('스테인리스 · 새틴','9ba9ab')
edge=material('걸이·금속 테두리','d7d8cc');dark=material('스테인리스 · 그늘','546164')
black=material('워머 통풍구','333739');white=material('메뉴 카드 · 아이보리','fcf4dd')
gold=material('앤티앤스 · 노랑','f3b62d');blue=material('진열 수납장 · 파랑','005689')
navy=material('앤티앤스 · 짙은 청색','093c5a');butter=material('버터빛 상판','f3dbb4')
maple=material('메이플 · 진열 상판','bc8f63');rose=material('프로모션 소매 · 진자주','8b3c44')
orange=material('종이컵 · 살구','da8d49');paper=material('종이컵 · 크림색 안감','efc98f')
bread=material('버터 브라운 반죽','b97137');crust=material('진하게 구운 겉면','a05b2c')
honey=material('버터 코팅된 껍질','d5944f');crumb=material('밝은 빵가장자리','e8b77b')
salt=material('굵은 소금','fcf4de');almond=material('구운 아몬드','cf995e')
cheese=material('녹은 체다','e4ab46');sweet=material('고구마 크림','e8cd67')
bacon=material('베이컨 · 붉은 살','a95550');fat=material('베이컨 · 지방결','d98473')
sausage=material('핫도그 소시지','9c523e');olive=material('할라피뇨 껍질','69783a')
pepper=material('고추 단면','9ea24d');seed=material('고추씨','dec477')
lemon=material('자른 레몬','edd164');pack=material('흰 포장지','f5ead2')
glass=material('쇼케이스 유리','b4e2e5')
glass.diffuse_color=(*glass.diffuse_color[:3],.13)
glass.surface_render_method='DITHERED'
rubber=material('댐퍼·발판','45443f')


def group(name):
    c=bpy.data.collections.new(name);scene.collection.children.link(c)
    c['bundle']='pretzel-warmer';c['origin']=[0,0,0]
    return c


body=group('Warmer'); glazing=group('Glass')


def model(name,points,faces,mats,indices=None,collection=body):
    if not isinstance(mats,list):mats=[mats]
    data=bpy.data.meshes.new(name);data.from_pydata([(x,-d,z) for x,d,z in points],[],faces);data.update()
    for m in mats:data.materials.append(m)
    if indices:
        for f,i in zip(data.polygons,indices):f.material_index=i
    o=bpy.data.objects.new(name,data);collection.objects.link(o)
    return o


def prism(name,section,mats,axis='z',layers=(0,1)):
    def point(a,b,height):
        return (a,b,height) if axis=='z' else (a,height,b)
    n=len(section);coords=[point(a,b,h) for h in layers for a,b in section]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces+= [(k,(k+1)%n,n+(k+1)%n,n+k) for k in range(n)]
    return model(name,coords,faces,mats)


def box(name,x,d,z,w,depth,h,mat):
    a=w/2;b=depth/2
    return prism(name,[(x-a,d-b),(x+a,d-b),(x+a,d+b),(x-a,d+b)],mat,layers=(z,z+h))


def rounded(name,x,d,z,w,h,depth,mat,r=.014):
    pts=[]
    for i,(sx,sz) in enumerate([(1,1),(-1,1),(-1,-1),(1,-1)]):
        for j in range(4):
            a=(i+j/3)*pi/2;pts.append((x+sx*(w/2-r)+r*cos(a),z+sz*(h/2-r)+r*sin(a)))
    return prism(name,pts,mat,axis='d',layers=(d-depth/2,d+depth/2))


def rings(name,rows,mats,indices=None):
    n=len(rows[0]);m=len(rows)
    faces=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(m-1) for j in range(n)]
    faces.extend([tuple(reversed(range(n))),tuple(range((m-1)*n,m*n))])
    if indices:indices += [0,0]
    model(name,[p for row in rows for p in row],faces,mats,indices)


def pipe(name,path,r,mat,n=7):
    path=[Vector(p) for p in path];rows=[]
    for i,point in enumerate(path):
        v=(path[min(i+1,len(path)-1)]-path[max(i-1,0)]).normalized()
        axis=Vector((0,0,1)) if abs(v.z)<.81 else Vector((0,1,0))
        a=v.cross(axis).normalized();b=v.cross(a)
        rows.append([point+r*(a*cos(k*TAU/n)+b*sin(k*TAU/n)) for k in range(n)])
    rings(name,rows,mat)


def turn(name,x,d,levels,mat,n=18):
    rows=[[(x+r*cos(k*TAU/n),d+r*sin(k*TAU/n),z) for k in range(n)] for z,r in levels]
    rings(name,rows,mat)


def angled_plate(name,points,mat):
    model(name,points,[tuple(range(len(points)))],mat)


def crumb_chip(name,x,d,z,r,mat):
    # An irregular triangular flake has a lit top and three darker sides.
    a=rng.uniform(0,TAU);px=[(x+r*cos(a+k*TAU/3),d+r*.66*sin(a+k*TAU/3),z) for k in range(3)]
    px.append((x+.001,d-.0005,z+r*.6))
    model(name,px,[(0,1,2),(0,1,3),(1,2,3),(2,0,3)],mat)


def catmull(points,subdiv=5):
    points=[Vector(p) for p in points];curve=[]
    for i in range(len(points)-1):
        a,b,c,d=points[max(0,i-1)],points[i],points[i+1],points[min(len(points)-1,i+2)]
        for j in range(subdiv):
            t=j/subdiv;curve.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
    return curve+[points[-1]]


def knot(x,d,z,size,style=0,display_angle=0,tilt=.45):
    # Trace a single dough rope. The centre crosses at different heights above the tilted tray.
    xy=[(-.44,-.38,.10),(-.06,.05,.16),(.37,.56,.04),(.72,.51,0),(.83,.15,0),(.64,-.25,0),
        (.26,-.56,0),(0,-.62,0),(-.29,-.56,0),(-.65,-.25,0),(-.83,.14,0),(-.72,.49,0),
        (-.39,.56,.02),(-.03,.12,.22),(.19,-.16,.20),(.47,-.38,.10)]
    points=catmull(xy);rows=[];indices=[];n=9
    v1=Vector((cos(display_angle),sin(display_angle),0))
    v2=Vector((-sin(display_angle)*cos(tilt),cos(display_angle)*cos(tilt),-sin(tilt)))
    up=v1.cross(v2);origin=Vector((x,d,z));rough=rng.uniform(0,2)
    for i,pt in enumerate(points):
        along=(points[min(i+1,len(points)-1)]-points[max(i-1,0)]).normalized()
        normal=v1*(-along.y)+v2*along.x;normal.normalize()
        p=origin+size*(v1*pt.x+v2*pt.y+up*pt.z)
        # Rounded tips and slight thickness variation distinguish the hand-rolled shape.
        t=i/(len(points)-1);r=size*(.117+.013*sin(t*17+rough))*(.45+.55*min(1,t*34,(1-t)*34))
        rows.append([p+r*(normal*cos(k*TAU/n)+up*sin(k*TAU/n)*.88) for k in range(n)])
        if i<len(points)-1:
            for k in range(n):
                shade=2 if k in [6,7] else (0 if k in [1,2,3] else 1)
                if k in [2,3] and sin(t*24+rough)>.6:shade=3
                indices.append(shade)
        if i%3==1 and style!=2:
            q=p+up*(r*.90)+normal*rng.uniform(-.45,.45)*r
            crumb_chip('프레즐 · 굵은 소금' if style==0 else '프레즐 · 아몬드',*q,.0028 if style==0 else .0048,salt if style==0 else almond)
    rings('클래식 프레즐 · 한 줄을 비틀어 구운 매듭',rows,[honey,bread,crumb,crust],indices)


def sleeve(x,d,z,r=.073,tint=rose):
    # Asymmetric high back, shallow scallop at front, overlap seam and visible paper interior.
    n=32;levels=[(z,.73*r),(z+.014,.77*r),(z+.121,r),(z+.135,r*1.03)]
    rows=[];ids=[]
    for j,(h,rad) in enumerate(levels):
        row=[]
        for k in range(n):
            a=TAU*k/n
            height=h if j<2 else h+.025*(-sin(a))-.013*max(0,sin(a))**3
            row.append((x+rad*cos(a),d+rad*sin(a),height))
            if j<3:ids.append(1 if ((k//6+j//2)%3==0 or j==0) else 0)
        rows.append(row)
    # The top remains open around the exposed bread tips.
    faces=[(i*n+k,i*n+(k+1)%n,(i+1)*n+(k+1)%n,(i+1)*n+k) for i in range(3) for k in range(n)]
    objpts=[p for row in rows for p in row]
    inner=[(x+(px-x)*.955,d+(pd-d)*.955,pz-.006) for px,pd,pz in rows[-1]]
    of=len(objpts);objpts+=inner
    for k in range(n):
        faces.append((3*n+k,3*n+(k+1)%n,of+(k+1)%n,of+k));ids.append(2)
    model('스틱 포장 · 접힌 종이 소매',objpts,faces,[tint,gold if tint==rose else paper,paper],ids)
    a=.75
    pipe('컵 · 접착된 세로 겹단',[(x+r*.77*cos(a),d+r*.77*sin(a),z+.015),
        (x+r*1.02*cos(a),d+r*1.02*sin(a),z+.123)],.0015,pack,5)
    # Golden pretzel mark in two joined loops follows the cup's customer-facing panel.
    for s in [-1,1]:
        ring=[(x+s*.012+.015*cos(k*TAU/10),d+.94*r,z+.061+.011*sin(k*TAU/10)) for k in range(11)]
        pipe('종이 소매 · 프레즐 심볼',ring,.0021,gold if tint==rose else orange,5)


def stick(x,d,z,h,r,angle,lean,style):
    n=9;rows=[];idx=[];cx,sd=cos(angle),sin(angle)
    for j,(t,scale) in enumerate([(0,.65),(.05,.89),(.22,1),(.79,1),(.94,.97),(.99,.73),(1,.32)]):
        rr=r*scale*(1+.04*sin(t*5+angle));a=x+lean*cx*t;b=d+lean*sd*t
        rows.append([(a+rr*cos(k*TAU/n),b+rr*.8*sin(k*TAU/n),z+h*t+.003*cos(k*2+angle)*scale) for k in range(n)])
        if j<6:
            for k in range(n):idx.append(0 if j>3 else (1 if (k+j)%5 else 2))
    rings('스틱 프레즐 · 구운 빵',rows,[crust,honey,bread],idx)
    cx2=x+lean*cx;sd2=d+lean*sd
    if style in [0,1]:
        for k in range(4):
            h2=rng.uniform(.59,.98);a=rng.uniform(0,TAU)
            crumb_chip('아몬드 알갱이' if style==1 else '소금 알갱이',x+lean*cx*h2+r*.87*cos(a),
                       d+lean*sd*h2+r*.72*sin(a),z+h*h2,.0038 if style==1 else .0022,almond if style==1 else salt)
    if style==2:
        box('크림치즈 · 밝은 속',cx2,sd2,z+h-.001,.018,.012,.004,cream_fill)
    if style==3:
        for i in range(2):
            crumb_chip('체다·고구마 크림 덩이',cx2+rng.uniform(-.012,.012),sd2+rng.uniform(-.01,.01),z+h-.003,.009,cheese if i==0 else sweet)
        p=[(cx2-.012,sd2+.009,z+h-.03),(cx2-.007,sd2+.022,z+h-.010),(cx2+.010,sd2+.019,z+h+.005),
           (cx2+.019,sd2+.016,z+h-.001),(cx2+.008,sd2+.017,z+h-.023)]
        angled_plate('베이컨 · 가느다란 띠',p,bacon)
        pipe('베이컨 · 지방결',[p[0],p[1],p[2]],.0017,fat,5)


cream_fill=material('크림치즈','f4e2b6')

def dog(x,d,z,style):
    # A real exposed sausage end contrasts with the oval baked sheath and distinct toppings.
    n=12
    for label,levels,mats in [('소시지',[(-.133,.011),(-.126,.022),(.129,.022),(.134,.011)],[sausage]),
                           ('구운 반죽',[(-.111,.023),(-.096,.033),(-.065,.036),(.061,.037),(.093,.032),(.107,.021)],[honey,bread,crumb])]:
        rows=[]
        for depth,r in levels:
            rows.append([(x+r*cos(k*TAU/n),d+depth,z-.19*depth+r*.79*sin(k*TAU/n)) for k in range(n)])
        ids=[(0 if k<5 else 1 if k<8 else 2)%len(mats) for _ in levels[:-1] for k in range(n)]
        rings('핫도그 · '+label,rows,mats,ids)
    for i in range(3):
        cy=d-.061+i*.052;zz=z+.027-(cy-d)*.19
        if style=='jalapeno':
            # Sliced ring with an open centre and a narrow yellow-green cut face.
            pts=[];faces=[]
            for k in range(14):
                a=k*TAU/14
                for rr,dh in [(1,.01),(.56,.01),(1,0)]:
                    pts.append((x+.022*rr*cos(a),cy+.024*rr*sin(a),zz+dh))
            for k in range(14):
                m=k*3;j=((k+1)%14)*3
                faces.extend([(m,j,j+1,m+1),(m+2,j+2,j,m)])
            model('핫도그 · 슬라이스 할라피뇨',pts,faces,[pepper,olive],[0,1]*14)
            crumb_chip('할라피뇨 씨',x+.011,cy+.008,zz+.011,.004,seed)
        else:
            for j in range(5):
                crumb_chip('블랙페퍼 · 후추',x+rng.uniform(-.019,.019),cy+rng.uniform(-.016,.016),zz+.003,.0031,charcoal)
            pipe('블랙페퍼 · 그을린 치즈',[ (x-.021,cy-.007,zz+.003),(x-.004,cy,zz+.006),(x+.016,cy+.005,zz+.003)],.0035,cheese,6)


charcoal=material('통후추','5c5044')
# Continuous casework takes the place of the existing flat retail stock graphic.
box('진열 하부장 · 걸레받이',0,0,.012,5.9,.65,.121,navy)
box('진열 하부장 · 수납함',0,0,.13,6.02,.74,.72,blue)
box('진열 상판 · 원목 가장자리',0,0,.85,6.08,.775,.042,maple)
box('진열 상판 · 크림색 작업면',0,0,.893,6.08,.785,.022,butter)
for column in range(6):
    x0=-2.50+column*1.00
    rounded('전면장 · 인셋 도어',x0,.376,.476,.987,.666,.009,navy,.028)
    rounded('전면장 · 도장 패널',x0,.383,.477,.972,.653,.007,blue,.025)
    box('하부장 · 황동 손잡이',x0+.354,.398,.705,.144,.025,.013,gold)
# Trace the published two-colour identity, preserving the separate counters inside the letters.
outlines=json.loads((HERE/'wordmark.json').read_text())
brand_blue=material('워드마크 · 본사 파랑','11169b')
brand_gold=material('워드마크 · 본사 금색','ffa122')
def wordmark(x,d,z,width):
    scale=width/407
    for ink,outline in outlines.items():
        curves=bpy.data.curves.new('앤티앤스 · 금빛 매듭과 글자','CURVE')
        curves.dimensions='2D';curves.fill_mode='BOTH';curves.extrude=.0018
        curves.materials.append(brand_gold if ink=='gold' else brand_blue)
        for ring in outline:
            line=curves.splines.new('POLY');line.points.add(len(ring)-1);line.use_cyclic_u=True
            for vertex,(a,b) in zip(line.points,ring):vertex.co=((a-203.5)*scale,(b-39)*scale,0,1)
        o=bpy.data.objects.new('앤티앤스 · '+ink,curves);body.objects.link(o)
        o.location=(x,-d,z);o.rotation_euler.x=pi/2
        bpy.context.view_layer.objects.active=o;o.select_set(True)
        bpy.ops.object.convert(target='MESH');o.select_set(False)

rounded('하부장 · 아이보리 상호판',-1.84,.395,.49,1.76,.424,.014,white,.035)
wordmark(-1.84,.405,.49,1.55)
wordmark(.04,-5.39,2.31,2.50)
# Left side holds paper bags and wood-handled dough tools, as suggested by the brand's open-kitchen photographs.
for i in range(3):
    x=-2.37+i*.174
    for j in range(5):
        angled_plate('포장대 · 종이봉투',[ (x-.076,-.055,.918+j*.008),(x+.072,-.05,.918+j*.008),
            (x+.065,.18,.924+j*.008),(x-.070,.173,.924+j*.008) ],pack if j%2 else paper)
    box('포장대 · 접어 세운 봉투',x,-.19,.918,.13,.036,.167+.023*i,paper)
    box('포장대 · 노란 접힘',x,-.17,1.004,.063,.01,.055,gold)
# The long customer photo shows a single deck of warming trays, a reflective rear, glass front and polished rim.
cx=-.22;half=1.18
box('워머 · 본체',cx,0,.917,half*2,.679,.092,dark)
box('워머 · 은색 받침띠',cx,.016,.985,half*2+.025,.702,.035,chrome)
box('워머 · 안쪽 보온 바닥',cx,-.005,1.019,half*2-.042,.62,.019,silver)
box('워머 · 후면 반사판',cx,-.303,1.04,half*2-.03,.015,.533,silver)
for side in [-1,1]:
    x=cx+side*half
    box('워머 · 세로틀',x,-.308,1.017,.031,.045,.61,dark)
    pipe('워머 · 전면 경사틀',[(x,.343,1.019),(x,.338,1.338),(x,.25,1.561),(x,.204,1.614)],.013,chrome)
    model('쇼케이스 측면 · 사다리꼴 유리',[(x,-.29,1.04),(x,.328,1.04),(x,.327,1.338),(x,.199,1.598),(x,-.29,1.598)],[(0,1,2,3,4)],glass,collection=glazing)
# Editable native glazing is kept separate for a transparent runtime material.
model('쇼케이스 전면 · 굽힌 투명 유리',[(cx+sx*half,d,z) for d,z in [(.338,1.028),(.336,1.338),(.201,1.606)] for sx in [-1,1]],
      [(0,1,3,2),(2,3,5,4)],glass,collection=glazing)
box('워머 · 조명 덮개',cx,-.007,1.605,2*half+.045,.518,.052,chrome)
box('워머 · 열원과 노란 확산판',cx,.155,1.588,2*half-.06,.08,.022,butter)
for z,depth in [(1.027,.346),(1.601,.205)]:
    pipe('워머 · 전면 이음 금속',[(cx-half,depth,z),(cx+half,depth,z)],.010,chrome)
# An orange printed strip continuing around the warmer base is visible in the branch photograph.
rounded('워머 하단 · 계절 메뉴 띠',cx,.365,.973,half*2-.09,.071,.008,gold,.009)
for i in range(10):
    x=cx-half+.16+i*.225
    angled_plate('홍보 띠 · 컵 그림',[(x-.026,.371,.987),(x+.026,.371,.987),(x+.018,.371,.95),(x-.019,.371,.95)],rose)
    for j in [-1,0,1]:box('홍보 띠 · 빵 그림',x+j*.013,.372,.982,.009,.002,.016+.004*(j%2),crust)
# Single-level stainless racks with perforated drains between pans.
for center,width in [(-1.008,.72),(-.288,.59),(.25,.42),(.667,.38)]:
    box('워머 · 평철 팬',center,0,1.042,width,.56,.012,chrome)
    for side in [-1,1]:
        box('워머 팬 · 접어 올린 림',center+side*width/2,0,1.048,.008,.57,.018,edge)
    for j in range(12):
        d=-.242+j*.0435;pipe('워머 팬 · 철망',[(center-width*.486,d,1.058),(center+width*.486,d,1.058)],.0032,dark,5)
for x in [-.62,.029,.47]:
    for row in range(2):
        for j in range(6):
            box('워머 · 타공 배수구',x-.015+row*.024,-.206+j*.082,1.059,.012,.050,.0018,black)
for row in range(2):
    for i in range(7):
        xx=-1.219+i*.190+(row%2)*.017;dd=-.128+.263*row
        style=[3,3,1,2,0,1,0][i]
        sleeve(xx,dd,1.069,.078,rose if i<2 else orange if i>3 else paper)
        for k in range(6):
            a=(k+.17*i)*TAU/6;rr=.037 if k<5 else .007
            stick(xx+rr*cos(a),dd+rr*sin(a),1.104,.145+.051*rng.random(),.0215+.003*rng.random(),a,.026+.030*rng.random(),style)
for i in range(3):
    for row in range(2):
        xx=.20+i*.073+.013*(row%2);dd=-.125+.261*row
        dog(xx,dd,1.091,'jalapeno')
for i in range(3):
    for row in range(2):
        xx=.583+i*.076+.012*(row%2);dd=-.125+.26*row
        dog(xx,dd,1.091,'pepper')
# Upper/lower cards in the visit photo sit on clear clips. The game draws the Korean type on these faces.
cards=[(-1.18,1.427),(-.92,1.427),(-.66,1.427),(-.40,1.427),(-.14,1.427),(.12,1.427),(.375,1.13),(.736,1.13)]
for x,h in cards:
    d=.308 if h>1.20 else .345
    box('메뉴 카드 · 받침',x,d-.012,h-.126,.016,.020,.077,dark)
    rounded('메뉴 카드 · 테두리',x,d,h,.244,.132,.008,dark,.018)
    rounded('메뉴 카드 · 백색지',x,d+.005,h,.238,.126,.004,white,.015)
    if h>1.20:
        angled_plate('메뉴 카드 · 컵 마크',[(x-.010,d+.009,h+.041),(x+.010,d+.009,h+.041),
                        (x+.006,d+.009,h+.026),(x-.006,d+.009,h+.026)],gold)
# Classic pretzels on an adjacent, tilted removable tray. The menu photo establishes product shape.
box('보조 트레이 · 발',1.56,-.06,.917,1.01,.43,.039,dark)
for side in [-1,1]:pipe('보조 트레이 · 스테인리스 받침',[(1.56+side*.44,-.236,.954),(1.56+side*.44,-.19,1.13)],.012,chrome)
d1,d2=-.265,.259;z1,z2=1.19,.975
angled_plate('진열 팬 · 경사지게 세운 철판',[(1.01,d1,z1),(2.11,d1,z1),(2.11,d2,z2),(1.01,d2,z2)],silver)
for k in range(8):
    dd=d1+(d2-d1)*k/7;hh=z1+(z2-z1)*k/7
    pipe('진열 망 · 가로살',[(1.01,dd,hh+.003),(2.11,dd,hh+.003)],.005,chrome,6)
for i in range(3):
    for j in range(2):
        x=1.23+i*.337;dd=-.116+j*.228;hh=z1+(z2-z1)*(dd-d1)/(d2-d1)+.030
        knot(x,dd,hh,.163,style=(i+j)%2,display_angle=-.14+.11*j+.06*i,tilt=.39)
# Metal service tongs and an off-centre small customer terminal at the pickup end.
for side in [-1,1]:
    pipe('집게 · 탄성 손잡이',[(2.19+side*.027,-.02,.929),(2.27+side*.017,.046,.936),(2.36,.11,.934)],
         .005,silver)
    angled_plate('집게 · 집는 주걱',[(2.135+side*.029,-.084,.927),(2.154+side*.041,-.093,.926),
                (2.205+side*.020,-.02,.937),(2.184+side*.011,-.004,.936)],chrome)
box('결제 단말 · 받침',2.63,-.09,.916,.365,.29,.038,dark)
pipe('결제 단말 · 지주',[(2.63,-.09,.95),(2.63,-.11,1.14)],.047,black,12)
rounded('결제 단말 · 고객 화면',2.63,-.07,1.241,.39,.247,.036,black,.018)
rounded('결제 단말 · 화면 점등',2.63,-.048,1.24,.352,.206,.003,blue,.012)
for i in range(3):box('결제 단말 · 버튼',2.535+i*.09,-.045,1.163,.067,.002,.021,[gold,white,white][i])
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=5.8
        area.spaces.active.region_3d.view_location=(0,0,1)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'seoul-warmer.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'))
