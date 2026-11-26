"""Editable Sweet Park counter stock, based on the Gangnam branch photographs."""
from math import pi, sin, cos
from pathlib import Path
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
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
font=bpy.data.fonts.load('/System/Library/Fonts/AppleSDGothicNeo.ttc')
def lettering(label,x,y,z,width,height,tint):
    c=bpy.data.curves.new(label,'FONT');c.body=label;c.font=font;c.align_x='CENTER';c.align_y='CENTER';c.resolution_u=4
    o=bpy.data.objects.new(label,c);collection.objects.link(o);c.materials.append(finish(tint))
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');o.select_set(False)
    o.scale=(width/max(.001,o.dimensions.x),height/max(.001,o.dimensions.y),1)
    o.rotation_euler.x=pi/2;o.location=(x,y,z)
def disk(name,x,y,z,rx,ry,height,color,n=24):
    pts=[(x+rx*cos(i*2*pi/n),y+ry*sin(i*2*pi/n),z+h) for h in [0,height] for i in range(n)]
    return mesh(name,pts,[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],color)

def fruit(name,x,y,z,r,h,color):
    # An asymmetric strawberry shoulder narrows towards the tip.
    rings=[(.0,.30),(.16,.78),(.48,1),(.77,.82),(1,.17)]
    pts=[(x+r*rad*cos(i*pi/5),y+r*rad*sin(i*pi/5),z+h*level) for level,rad in rings for i in range(10)]
    faces=[(j*10+i,j*10+(i+1)%10,(j+1)*10+(i+1)%10,(j+1)*10+i) for j in range(4) for i in range(10)]
    body=mesh(name,pts,faces+[tuple(range(40,50))],color)
    if name!='검푸른 베리':
        body.data.materials.append(finish('ee6650'))
        body.data.materials.append(finish('b42b2d'))
        for i,poly in enumerate(body.data.polygons):
            poly.material_index=1 if 20<=i<40 and i%10 in [6,7] else 2 if i<10 else 0
    # Small, recessed-looking achenes on the visible forward shoulder.
    for i in [-1,0,1]:
        a=-pi/2+i*.55
        cx,cy=x+r*.95*cos(a),y+r*.95*sin(a)
        mesh('딸기 씨',[(cx-.0007,cy,z+h*.47),(cx+.0007,cy,z+h*.47),(cx,cy,z+h*.57)],[(0,1,2)],'f3bf78')

def faceBerry(x,y,z,w,h,color,pale):
    def section(w,h,color,y):
        pts=[(x+w*cos(i*pi/8),y,z+h*sin(i*pi/8)) for i in range(16)]
        mesh('딸기 절단면',pts,[tuple(range(16))],color)
    section(w,h,color,y)
    section(w*.55,h*.72,pale,y-.0006)

def kitchenCake(x,y,z,r):
    disk('원형 금색 받침',x,y,z,r*1.15,r*1.15,.008,'bb9557')
    for dz,h,col in [(.009,.021,'e5bb85'),(.030,.069,'fff2d8'),(.099,.012,'ebcc92'),(.111,.056,'fff4df')]:
        disk('스펀지와 생크림',x,y,z+dz,r,r,h,col,32)
    for i in range(18):
        a=2*pi*i/18
        for row in range(2):
            # Flattened fruit follows the curvature of the cut cream wall.
            ang=a+row*.12;xx,yy=x+r*cos(ang),y+r*sin(ang)
            pts=[(xx-r*.15*cos(j*pi/8)*sin(ang),yy+r*.15*cos(j*pi/8)*cos(ang),z+.061+row*.07+.025*sin(j*pi/8)) for j in range(16)]
            mesh('생크림 속 딸기 단면',pts,[tuple(range(16))],['ec846a','f59e85','e97460'][i%3])
    for i in range(11):
        a=i*2*pi/11;fruit('딸기밭 케이크 테두리',x+r*.75*cos(a),y+r*.75*sin(a),z+.161,r*.234,.062,['ce322b','ed4532','dc3929'][i%3])
    for i in range(4):
        a=i*pi/2;fruit('가운데 딸기',x+r*.27*cos(a),y+r*.27*sin(a),z+.164,r*.21,.055,'df3d2b')
    box('원형 픽 지지',x,y,z+.17,.008,.005,.061,'d8ba87')
    logo(x,y-.004,z+.253,.038)

def logo(x,y,z,r):
    for rad,col,yy in [(r,'ba955e',y),(r*.90,'fff3df',y-.001)]:
        pts=[(x+rad*cos(j*pi/16),yy,z+rad*1.08*sin(j*pi/16)) for j in range(32)]
        mesh('205 타원 메달',pts,[tuple(range(32))],col)
    lettering('KITCHEN',x,y-.003,z+r*.26,r*1.20,r*.17,'936c47')
    lettering('205',x,y-.003,z-r*.11,r*1.10,r*.47,'936c47')

def pinkBox(x,y,z):
    box('분홍 손잡이 상자',x,y,z,.295,.235,.16,'dc918c')
    # The branch's box has a die-cut rectangular roof window and a raised tab.
    for dy in [-.086,.086]:box('창 가장자리',x,y+dy,z+.16,.30,.064,.009,'efafab')
    for dx in [-.122,.122]:box('창 가장자리',x+dx,y,z+.16,.054,.113,.009,'efafab')
    box('상자 안쪽',x,y,z+.151,.192,.108,.005,'ad6e61')
    for dx in [-.102,.102]:box('접은 손잡이',x+dx,y+.059,z+.169,.032,.012,.060,'db928c')
    box('손잡이 상단',x,y+.059,z+.220,.236,.012,.021,'e59b93')
    logo(x,y-.119,z+.087,.041)

def strawberryHalf(x,y,z):
    # Each cut half leans back from its narrower tip at the front of the cake.
    levels=[(-.034,-.022),(-.024,-.006),(-.010,.019),(.008,.035),(.025,.025),(.032,.010)]
    outline=[(-.007,)+levels[0],(-.020,)+levels[1],(-.028,)+levels[2],(-.024,)+levels[3],
             (-.014,)+levels[4],(.002,)+levels[5],(.018,)+levels[4],(.026,)+levels[3],
             (.027,)+levels[2],(.020,)+levels[1],(.007,)+levels[0]]
    def cap(scale,raiseZ,col):
        points=[(x+a*scale,y+b*scale,z+h*scale+raiseZ) for a,b,h in outline]
        mesh('기울인 딸기 단면',points,[tuple(range(len(points)))],col)
    cap(1,0,'b5362f')
    cap(.87,.001,'f08873')
    cap(.38,.002,'f7cc9f')

def shotoCake(x,y,z,chocolate):
    w,d=.257,.226
    box('흰 정사각 받침',x,y,z,w+.055,d+.055,.009,'f6f3e8')
    sponge='594038' if chocolate else 'e3c695';cream='ad8878' if chocolate else 'fff3dd'
    for off,h,col in [(.01,.026,sponge),(.036,.041,cream),(.077,.018,sponge),(.095,.044,cream),(.139,.018,sponge),(.157,.035,cream)]:
        box('단면 스펀지와 크림',x,y,z+off,w,d,h,col)
    for j in range(2):
        for i in range(4):faceBerry(x+(i-1.5)*.056,y-d/2-.001,z+.054+j*.063,.018,.016,'dc7660','eea189')
    for dx,dy,r,h in [(-.075,-.028,.033,.067),(-.024,.039,.031,.062),(.080,.028,.025,.054)]:
        fruit('쇼토 딸기',x+dx,y+dy,z+.19,r,h,'e15141')
    strawberryHalf(x+.029,y-.02,z+.217)
    for dx,dy in [(-.032,-.062),(.075,-.042)]:
        fruit('검푸른 베리',x+dx,y+dy,z+.192,.018,.031,'36394c')
    mesh('토핑 잎',[(x+.02,y+.02,z+.198),(x+.052,y+.05,z+.213),(x+.065,y+.04,z+.20)],[(0,1,2)],'648049')

def shotoBox(x,y,z):
    box('쇼토 흰 포장',x,y,z,.25,.20,.155,'f4f0e5')
    box('남색 리본',x,y,z+.155,.016,.204,.004,'293952')
    for side in [-1,1]:
        mesh('남색 리본 매듭',[(x,y,z+.161),(x+.055*side,y,z+.198),(x+.069*side,y,z+.177),(x,y,z+.160)],[(0,1,2,3)],'263951')
    lettering('SHOTO',x,y-.101,z+.077,.124,.027,'5e564c')

for key,title in [('kitchen205','SweetKitchen205'),('shoto','SweetShoto')]:
    collection=bpy.data.collections.new(title)
    bpy.context.scene.collection.children.link(collection)
    if key=='kitchen205':
        for i,x in enumerate([-.69,-.24,.24,.69]):
            kitchenCake(x,-.25,.014,.17 if i%2 else .145)
            pinkBox(x,.24,.014)
        logo(.68,.25,.53,.093)
        box('상호판 지주',.68,.26,.337,.014,.014,.13,'af8b5a')
    else:
        for row in range(2):
            for i in range(5):
                shotoCake((i-2)*.38,-.29+row*.36,.014,bool(row and i%2))
        for x in [-.60,-.31]:shotoBox(x,.48,.014)
        box('황동 테두리',.43,.37,.34,.54,.031,.21,'bf9b65')
        box('작은 검은 상호판',.43,.349,.347,.522,.012,.196,'282722')
        lettering('SHOTO',.43,.341,.449,.39,.086,'d2af70')
        box('상호판 지주',.43,.375,.005,.018,.018,.335,'a68759')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'cakes.blend'),compress=True)
