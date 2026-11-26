"""Frisbee Gangnam customer demo furniture. Native X right, Y rear, Z up."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_8F_Frisbee')
scene.collection.children.link(collection)
identity = Matrix.Identity(4)
frame = identity
T = lambda x,y,z: Matrix.Translation((x,y,z))
Rx = lambda a: Matrix.Rotation(radians(a),4,'X')
Rz = lambda a: Matrix.Rotation(radians(a),4,'Z')
parts = {}
paints = {}
graphics = bpy.data.images.load(str(OUT/'graphics.jpg'))
graphics.pack()
WHITE='eeeae5'
DARK='232327'
SILVER='b9b9ba'
METAL='FrisbeeGangnamAluminium'
BODY='FrisbeeGangnamFixtures'
ART='FrisbeeGangnamGraphics'
def linear(v):
    v=int(v,16)/255
    return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4

def material(batch, color):
    key=batch,color
    if key in paints: return paints[key]
    mat=bpy.data.materials.new(batch+' '+color)
    mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF')
    rgba=tuple(linear(color[i:i+2]) for i in (0,2,4))+(1,)
    shader.inputs['Base Color'].default_value=rgba
    shader.inputs['Roughness'].default_value=.32 if batch==METAL else .48
    shader.inputs['Metallic'].default_value=.48 if batch==METAL else 0
    mat.diffuse_color=rgba
    if batch==ART:
        tex=mat.node_tree.nodes.new('ShaderNodeTexImage')
        tex.image=graphics
        mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
        mat.node_tree.links.new(tex.outputs['Color'],(shader.inputs.get('Emission Color') or shader.inputs['Emission']))
        shader.inputs['Emission Strength'].default_value=.21
    paints[key]=mat
    return mat

def mesh(name,verts,faces,col,batch=BODY,uv=None):
    data=bpy.data.meshes.new(name)
    data.from_pydata([frame @ Vector(v) for v in verts],[],faces)
    data.update()
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    data.materials.append(material(batch,col))
    if uv:
        layer=data.uv_layers.new(name='도안')
        for loop in data.loops: layer.data[loop.index].uv=uv[loop.vertex_index]
    parts.setdefault(batch,[]).append(obj)
    return obj

def outline(w,d,r,n=4):
    r=min(r,w*.49,d*.49)
    pts=[]
    for cx,cy,start in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)]:
        for j in range(n+1):
            a=radians(start+90*j/n)
            pts.append((cx+r*cos(a),cy+r*sin(a)))
    return pts

def plate(name,x,y,z,w,d,h,r,col,batch=BODY,n=4):
    stock=name in {'소매 포장','케이스 견본','카메라 개구부'}
    pts=outline(w,d,r,2 if stock else n)
    # Slight shoulders along the edge catch the light at the palm rest and rim.
    edge=min(.0018,h*.2,r*.25)
    rings=[(z,edge),(z+edge,0),(z+h-edge,0),(z+h,edge)]
    if stock: rings=[(z,0),(z+h,0)]
    verts=[(x+a*(1-2*offset/w),y+b*(1-2*offset/d),hh) for hh,offset in rings for a,b in pts]
    m=len(pts)
    faces=[tuple(reversed(range(m))),tuple(range((len(rings)-1)*m,len(rings)*m))]
    faces.extend((k*m+i,k*m+(i+1)%m,(k+1)*m+(i+1)%m,(k+1)*m+i) for k in range(len(rings)-1) for i in range(m))
    return mesh(name,verts,faces,col,batch)

def print_face(name,x,y,z,w,d,r,tile,bounds=(0,0,1,1)):
    pts=outline(w,d,r)
    tx,ty=tile%2,tile//2
    u,v,du,dv=bounds
    uv=[((tx+.003+.994*(u+(a/w+.5)*du))/2,1-(ty+.004+.992*(v+(.5-b/d)*dv))/5) for a,b in pts]
    mesh(name,[(x+a,y+b,z) for a,b in pts],[tuple(range(len(pts)))],'ffffff',ART,uv)

def tube(name,points,r,col,batch=BODY,steps=8):
    verts=[]
    for i,p in enumerate(points):
        t=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)])).normalized()
        side=t.cross(Vector((0,0,1)) if abs(t.z)<.88 else Vector((0,1,0))).normalized()
        up=t.cross(side)
        verts.extend(tuple(Vector(p)+r*(side*cos(j*2*pi/steps)+up*sin(j*2*pi/steps))) for j in range(steps))
    faces=[tuple(reversed(range(steps))), tuple(range(len(verts)-steps,len(verts)))]
    faces.extend((k*steps+j,k*steps+(j+1)%steps,(k+1)*steps+(j+1)%steps,(k+1)*steps+j)
                 for k in range(len(points)-1) for j in range(steps))
    mesh(name,verts,faces,col,batch)

def table(x,y,w,d):
    global frame
    frame=T(x,y,0)
    plate('백색 일체형 가장자리',0,0,.806,w,d,.094,.085,WHITE)
    print_face('단풍나무 무늬 상판',0,0,.9004,w-.022,d-.022,.076,5)
    # Inner arch in the apron flares into the legs, as on the opening photograph.
    for side in [-1,1]:
        for end in [-1,1]:
            lx=side*(w/2-.055); ly=end*(d/2-.055)
            plate('모서리 기둥',lx,ly,.02,.10,.10,.79,.037,WHITE)
            for direction in [0,1]:
                coords=[(0,.806),(.19,.806)]
                for j in range(9):
                    a=(90+j*90/8)*pi/180
                    coords.append((.19+.147*cos(a),.66+.146*sin(a)))
                verts=[]
                for offset in [-.032,.032]:
                    verts.extend((lx-side*(s if direction==0 else offset),ly-end*(offset if direction==0 else s),z) for s,z in coords)
                n=len(coords)
                faces=[tuple(range(n)),tuple(reversed(range(n,n*2)))]+[(j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n)]
                # Profile orientation depends on which corner is mirrored.
                obj=mesh('기둥 안쪽 곡면',verts,faces,WHITE)
                bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(obj.data);bm.free()
    frame=identity

def keys(w,d,z,white=False):
    rows=[14,14,14,13,12,10]
    for r,n in enumerate(rows):
        widths=[5.4 if r==5 and i==4 else 1.7 if r==4 and i in (0,n-1) else 1 for i in range(n)]
        pos=0
        for extent in widths:
            f=extent/sum(widths);cx=(pos+f/2-.5)*w
            cy=(.5-(r+.5)/6)*d
            # Low rectangular key islands have individual faces with matching legends.
            kw=w*f-.002;kd=d/6-.002
            pts=outline(kw,kd,.0015,1);m=len(pts)
            verts=[(cx+a,cy+b,z+dz) for dz in (0,.0015) for a,b in pts]
            uv=[(((1 if white else 0)+.003+.994*((x/w)+.5))/2,1-(3+.004+.992*(.5-y/d))/5) for x,y,_ in verts]
            mesh('독립 키캡',verts,[tuple(range(m,2*m))]+[(j,(j+1)%m,(j+1)%m+m,j+m) for j in range(m)],'ffffff',ART,uv)
            pos+=f

def laptop(x,y,angle,size,finish,art):
    global frame
    base=T(x,y,.901)@Rz(angle)
    frame=base
    w=size;d=w*.696
    for a in (-1,1):
        for b in (-1,1):plate('검정 받침발',a*w*.38,b*d*.37,0,.025,.025,.003,.012,DARK)
    plate('하부 섀시',0,0,.0028,w-.002,d-.001,.009,.011,finish,METAL)
    plate('절삭 팜레스트',0,0,.0117,w,d,.004,.010,finish,METAL)
    plate('트랙패드 틈',0,-d*.272,.0158,w*.43,d*.368,.001,.004,'787877',METAL)
    plate('유리 트랙패드',0,-d*.272,.0167,w*.43-.002,d*.368-.002,.0008,.0035,finish,METAL)
    plate('개폐 홈',0,-d/2+.001,.014,w*.18,.002,.002,.0008,'858482')
    for sy in [-1,1]:
        for dy in [.03,.054]:
            plate('측면 포트',sy*(w/2-.0001),dy,.006,.0015,.009,.003,.0007,'333438')
    frame=base@T(0,d*.164,.0158)
    plate('키보드 홈',0,0,0,w*.868,d*.47,.001,.004,'343436' if art==0 else finish)
    keys(w*.852,d*.448,.001)
    frame=base
    tube('힌지 배럴',[(-w*.42,d*.43,.019),(w*.42,d*.43,.019)],.005,'525459',METAL,12)
    for a in [-1,1]:
        tube('힌지 캡',[(a*w*.40,d*.43,.019),(a*w*.446,d*.43,.019)],.0054,finish,METAL,12)
    h=w*.663
    frame=base@T(0,d*.43,.019)@Rx(71)
    plate('디스플레이 후면판',0,h/2,0,w,h,.004,.009,finish,METAL)
    # Shallow inset, drawn from the visible rear casing in the shop photograph.
    body=[(-.001,.008),(-.006,.010),(-.011,.008),(-.014,.003),(-.014,-.003),(-.012,-.009),(-.008,-.015),(-.005,-.017),(.000,-.016),(.004,-.017),(.008,-.015),(.012,-.010),(.014,-.005),(.010,-.002),(.009,.001),(.010,.004),(.013,.006),(.010,.009),(.006,.010)]
    leaf=[(.000,.010),(.002,.015),(.007,.018),(.008,.018),(.007,.014),(.004,.011)]
    for shape in (body,leaf):
        marking=mesh('후면 금속 각인',[(a,h*.51+b,-.00022) for a,b in shape],[tuple(reversed(range(len(shape))))],'77767a',METAL)
    plate('유리 베젤',0,h/2,.0039,w-.0014,h-.0014,.0019,.008,'151519')
    print_face('시연 화면',0,h*.512,.0059,w-.009,h-.013,.0045,art)
    plate('카메라 노치',0,h-.0064,.0061,.025,.0054,.0006,.0013,'17171a')
    frame=base
    lead=[(-w*.50,.052,.009),(-w*.57,.052,.008),(-w*.63,.069,.004),(-w*.65,.10,.002),(-w*.61,.14,.002),(-w*.47,.18,.002),(-w*.25,.20,.002)]
    tube('충전선',lead,.0016,'e1ded7')
    frame=identity

def card(x,y,angle=0,standing=False,tile=3):
    global frame
    frame=T(x,y,.902)@Rz(angle)@Rx(76 if standing else 5)
    h=.22 if standing else .096; w=.155
    plate('아크릴 안내판',0,h/2,0,w,h,.004,.004,'c7cbcb')
    print_face('제품 안내 인쇄면',0,h/2,.0041,w-.004,h-.005,.002,tile)
    frame=identity

def desktop(x,y,angle,tone):
    global frame
    base=T(x,y,.901)@Rz(angle)
    frame=base
    plate('일체형 스탠드 발',0,0,0,.157,.145,.006,.012,tone,METAL)
    frame=base@T(0,.044,.003)@Rx(78)
    plate('경사진 알루미늄 지지대',0,.098,0,.088,.196,.009,.007,tone,METAL)
    frame=base@T(0,.045,.117)@Rx(83)
    plate('iMac 후면 외장',0,.162,0,.544,.323,.011,.012,tone,METAL)
    plate('흰색 패널 테두리',0,.180,.0108,.542,.28,.0015,.009,'f6f3f0')
    print_face('iMac 화면',0,.180,.0124,.519,.256,.004,2)
    frame=base@T(-.015,-.185,0)
    plate('무선 키보드 하우징',0,0,0,.275,.103,.008,.006,tone,METAL)
    keys(.261,.092,.008,True)
    frame=base
    # Low continuous dome and aluminum underside of the mouse.
    verts=[];faces=[];n=20
    for h,scale in [(0,.88),(.004,1),(.013,.93),(.020,.65),(.021,.3)]:
        for j in range(n):
            a=2*pi*j/n;verts.append((.182+.029*cos(a)*scale,-.184+.055*sin(a)*scale,h))
    for k in range(4):
        for j in range(n):faces.append((k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j))
    faces+= [tuple(range(4*n,5*n)),tuple(reversed(range(n)))]
    mesh('곡면 마우스',verts,faces,'f1eeea')
    frame=identity

table(0,0,2.16,1.13)
for x,w,col,art in [(-.72,.356,'a9a7ab',0),(-.05,.32,'67666c',0),(.64,.314,'cfcbbe',1)]:
    laptop(x,-.19,0,w,col,art);card(x+.224,-.43,tile=3 if art==1 else 8)
for x,w,col,art in [(-.54,.344,'b5b4b6',0),(.38,.313,'d1c3ad',1)]:
    laptop(x,.23,180,w,col,art)
card(.16,.032,0,True)
table(-2.84,1.45,2.14,1.14)
desktop(-3.37,1.35,0,'90afc1');desktop(-2.46,1.36,0,'a9c7b3')
card(-3.08,1.08,tile=9);card(-2.17,1.09,tile=9)
# Wall alcoves and centre MacBook Air graphic in the branch photograph.
frame=identity
for mid in [-2.80,2.80]:
    plate('액세서리 벽체',mid,4.38,.10,2.50,.14,2.58,.057,'ded9d2')
    for h in [.73,1.16,1.59,2.02]:
        plate('선반',mid,4.215,h,2.36,.31,.038,.015,WHITE)
        for j in range(8):
            xx=mid+(j-3.5)*.278
            frame=T(xx,4.212,h+.043)@Rx(90)
            plate('소매 포장',0,.132,0,.174,.252,.034,.009,'f2efeb')
            tint=['434853','b1b9c2','aaa58a','9b6865','d69d80','899c91','66819b','dbd6cd'][(j+int(h*5))%8]
            plate('케이스 견본',0,.135,.034,.096,.177,.006,.014,tint)
            plate('카메라 개구부',-.027,.195,.040,.026,.033,.001,.005,'edeae5')
            frame=identity
frame=identity
plate('벽면 하부 진열장',0,4.08,.035,2.82,.53,.69,.044,WHITE)
plate('하부 진열장 상판',0,4.08,.723,2.86,.55,.036,.046,'e1d5c6')
frame=T(0,4.27,.92)@Rx(90)
plate('후면 광고 프레임',0,.81,0,2.88,1.60,.057,.047,'8b8a87',METAL)
print_face('MacBook Air 벽면 그래픽',0,.81,.058,2.85,1.57,.038,4)
frame=identity
# Centre each editable component's pivot on its bounds without moving the assembly.
for objects in parts.values():
    for obj in objects:
        low=Vector(obj.bound_box[0]); high=Vector(obj.bound_box[6])
        centre=(low+high)/2
        obj.data.transform(Matrix.Translation(-centre));obj.location=centre
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
for batch,objects in parts.items():
    bpy.ops.object.select_all(action='DESELECT')
    merged=material(batch,'ffffff')
    if batch!=ART:
        nodes=merged.node_tree.nodes
        vc=nodes.new('ShaderNodeVertexColor');vc.layer_name='Finish'
        merged.node_tree.links.new(vc.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
    for obj in objects:
        data=obj.data
        if batch!=ART:
            rgba=data.materials[0].diffuse_color[:]
            attr=data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for item in attr.data:item.color=rgba
        data.materials.clear();data.materials.append(merged)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
