"""Gangnam Shinsegae Chipotle customer counter, from the October 2026 opening photos."""
from math import pi, sin, cos
from pathlib import Path
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("ChipotleGangnamOrderBar")
bpy.context.scene.collection.children.link(collection)
materials = {}
def finish(hexcode):
    if hexcode not in materials:
        m = bpy.data.materials.new(hexcode)
        rgb = [int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
        m.diffuse_color = [c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4 for c in rgb]+[1]
        materials[hexcode] = m
    return materials[hexcode]
def mesh(name,verts,faces,tint):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    data.materials.append(finish(tint))
    return obj
def box(name,x,y,z,w,d,h,tint):
    verts=[(x+a*w/2,y+b*d/2,z+k*h) for k in (0,1) for a,b in ((-1,-1),(1,-1),(1,1),(-1,1))]
    return mesh(name,verts,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],tint)
font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
def lettering(label,x,y,z,width,height,tint):
    c=bpy.data.curves.new(label,'FONT');c.body=label;c.font=font;c.align_x='CENTER';c.align_y='CENTER';c.resolution_u=4
    o=bpy.data.objects.new(label,c);collection.objects.link(o);c.materials.append(finish(tint))
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');o.select_set(False)
    o.scale=(width/max(.001,o.dimensions.x),height/max(.001,o.dimensions.y),1)
    o.rotation_euler.x=pi/2;o.location=(x,y,z)
import random
rng=random.Random(205)
def plate(name,x,y,z,r,ratio,tone):
    pts=[(x+r*cos(i*pi/16),y,z+r*ratio*sin(i*pi/16)) for i in range(32)]
    return mesh(name,pts,[tuple(range(32))],tone)
def line(name,x,y,z,points,w,tone):
    for (a,b),(c,d) in zip(points,points[1:]):
        length=((c-a)**2+(d-b)**2)**.5;nx,nz=-(d-b)*w/length,(c-a)*w/length
        vs=[(x+p,y,z+q) for p,q in [(a+nx,b+nz),(a-nx,b-nz),(c-nx,d-nz),(c+nx,d+nz)]]
        mesh(name,vs,[(0,1,2,3)],tone)
def ellipseBand(name,rx,rz,z,depth,tint):
    for i in range(40):
        a,b=i*pi/40,(i+1)*pi/40
        vs=[(r*cos(t),depth,z+h*sin(t)) for t,r,h in [(a,rx,rz),(b,rx,rz),(b,rx-.075,rz-.075),(a,rx-.075,rz-.075)]]
        mesh(name,vs,[(0,1,2,3)],tint)
# The lit arch and the long menu hang above one open stainless service line.
for x in [-3.48,3.48]:
    box('아치 기둥',x,.65,0,.10,.14,2.00,'a29785')
ellipseBand('타원 금속 아치',3.53,1.47,1.97,.64,'b29a80')
ellipseBand('따뜻한 아치 조명',3.45,1.40,1.97,.625,'fff0d4')
box('후면 금속 패널',0,1.77,0,6.88,.10,2.69,'938c7c')
for i in range(13):
    x=-3.21+i*.534
    box('솔기',x,1.713,.96,.009,.009,1.68,'706f67')
box('흰색 후광',-.04,.39,2.75,2.84,.17,.47,'f2f6eb')
box('적갈색 간판',.18,.29,2.77,2.31,.09,.418,'722b26')
lettering('CHIPOTLE',.17,.24,2.986,2.05,.252,'fff5e8')
box('칠리 엠블럼 바탕',-1.177,.28,2.77,.38,.09,.418,'4d2721')
line('고추의 외곽',-1.18,.231,2.98,[(.057,.101),(.030,.125),(-.018,.119),(-.043,.094),(-.082,.077),(-.099,.04),(-.070,-.015),(-.03,-.081),(.042,-.107),(.09,-.087),(.035,-.045),(.011,.013),(.036,.074),(.057,.101)],.010,'fff7eb')
line('고추의 줄기',-1.18,.229,2.98,[(-.021,.105),(.007,.147),(.04,.160),(.062,.14)],.009,'fff7eb')
for x in [-2.64,-.82,.99,2.64]:box('화면 걸이',x,.50,2.55,.035,.04,.58,'383733')
box('메뉴 화면 테두리',0,.49,1.99,6.39,.105,.70,'262725')
menus=[('1 CHOOSE ONE',['BOWL','BURRITO','TACOS','SALAD']),('2 CHOOSE YOUR PROTEIN',['CHICKEN','STEAK','BARBACOA','CARNITAS']),('3 TOPPINGS',['RICE','BEANS','SALSA','GUACAMOLE']),('ADD ONS',['CHIPS','GUACAMOLE','SALSA']),('DRINKS',[])]
for i,(heading,items) in enumerate(menus):
    x=(i-2)*1.255
    box('밝은 메뉴 화면',x,.429,2.025,1.245,.018,.627,'d6e4e7')
    lettering(heading,x,.416,2.54,1.03,.062,'293735')
    for j,item in enumerate(items):lettering(item,x+.10,.415,2.413-j*.092,.70,.047,'465452')
    for k in range(2 if i in [0,2,4] else 0):
        xx=x-.44+k*.14;zz=2.15+k*.08
        plate('메뉴 화면의 볼',xx,.411,zz,.125,.94,'f6e5be')
        plate('메뉴 화면의 식재료',xx,.406,zz,.099,.91,'789447')
        for j in range(15):
            px,py=rng.uniform(-.062,.062),rng.uniform(-.061,.061)
            plate('볼 재료',xx+px,.402,zz+py,.016,.84,['c67943','d8b663','618447','f0e4b4'][j%4])
box('스테인리스 조리대',-.17,0,0,6.13,.80,.89,'999791')
box('상판',-.17,.0,.89,6.23,.90,.055,'ccc9bf')
for j in range(15):box('스테인리스 패널 이음',-3.04+j*.42,-.402,.08,.006,.006,.75,'777775')
# Two rows of inset hotel pans show the ordering sequence under the service glass.
ingredients=[('라이스','f0dfb3'),('빈','614939'),('치킨','b67848'),('스테이크','855642'),('살사','bd5040'),('과카몰레','819447')]
for row in range(2):
    for i,(name,col) in enumerate(ingredients):
        x=-2.73+i*.66;y=-.185+row*.37
        box('팬 테두리',x,y,.943,.61,.337,.019,'e0dfd6')
        box('팬 안쪽',x,y,.963,.558,.287,.010,'696a61')
        box(name,x,y,.975,.525,.254,.009,col)
        for j in range(26):
            xx=x+rng.uniform(-.232,.232);yy=y+rng.uniform(-.098,.098)
            box(name+' 조각',xx,yy,.985+rng.random()*.006,.020+rng.random()*.023,.018+rng.random()*.018,.009+rng.random()*.015,[col,'eadbb3' if i==0 else ['967555','a78258','d0935b','955f50','ed7957','a3ad59'][i]][j%2])
        box('집게 손잡이',x+.19,y+.057,.997,.17,.018,.012,'c8c7bd')
for x in [-3.17,-1.18,.8,1.49]:box('가림막 기둥',x,-.38,.944,.030,.034,.46,'999b94')
box('가림막 상단 금속 테두리',-.84,-.379,1.396,4.69,.032,.026,'bcbbb2')
# A narrow polished rim gives the transparent screen an edge without a second draw.
for j in range(4):
    x=1.72+j*.28
    box('크라프트 주문 봉투',x,.08,.946,.24,.13,.31,'b89468')
    lettering('CHIPOTLE',x,.012,1.09,.203,.041,'5a4431')
box('계산 단말기 받침',2.73,-.16,.947,.30,.22,.038,'343634')
box('계산 단말기',2.73,-.18,.984,.38,.065,.24,'373937')
box('단말기 화면',2.73,-.216,1.015,.317,.009,.17,'9daeb2')
for x in [2.23,2.82]:
    for level in range(3):
        y=1.22;z=.33+level*.40
        box('봉투 선반',x,y,z,.59,.32,.026,'79796f')
        for dx in [-.14,.14]:
            box('포장재',x+dx,y,z+.026,.25,.16,.30,'b79263')
            lettering('CHIPOTLE',x+dx,y-.083,z+.17,.216,.033,'51412d')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
