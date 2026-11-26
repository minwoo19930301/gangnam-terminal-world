"""Build the editable Gangnam robot vacuum display. Units are metres."""
import bpy
from math import sin, cos, pi, radians, exp
from pathlib import Path
from mathutils import Matrix, Vector
import sys

OUT = Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
import surfaces
import demonstrator
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
gallery = bpy.data.collections.new("SSG_9F_Roborock")
bpy.context.scene.collection.children.link(gallery)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[gallery.name]


def finish(name, hexcode, rough=.42, metal=0, batch="Display"):
    m = bpy.data.materials.new(name)
    srgb = [int(hexcode[i:i+2], 16)/255 for i in (0, 2, 4)]
    m.diffuse_color = tuple(((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in srgb)+(1,)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = m.diffuse_color
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Metallic"].default_value = metal
    m['batch'] = batch
    return m

ivory = finish("따뜻한 백색 수지", "f6f4ed")
white = finish("백색 범퍼", "e1e2dd")
grey = finish("회색 이음매", "929491")
dark = finish("고무 차콜", "252831")
rubber = finish("타이어 트레드", "484c50")
silver = finish("새틴 알루미늄", "bfc1c2", .29, .65, "Optics")
glass = finish("광택 센서창", "171f2b", .22, .25, "Optics")
lens = finish("렌즈 코팅", "364864", .22, .3, "Optics")
red = finish("실리콘 롤러", "da2d39")
redlight = finish("실리콘 날", "ff6461")
pad = finish("걸레 직물", "b5bac2")
ink = finish("안내판 인쇄", "2e3033")
oak = finish("참나무 무늬목", "d5ad79", batch="Oak")


def assign(o,name,mat):
    o.name=name
    o.data.materials.append(mat)
    return o


def box(name, loc, dims, mat, radius=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=assign(bpy.context.object,name,mat)
    for v in o.data.vertices:
        for i in range(3): v.co[i]*=dims[i]
    if radius:
        mod=o.modifiers.new("둥근 모서리",'BEVEL')
        mod.width=radius
        mod.segments=4 if radius >= .01 else 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
        o.data.use_auto_smooth=True
        normal=o.modifiers.new("면 법선",'WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=normal.name)
    return o


def mesh(name, verts, faces, mat):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    data.update()
    o=bpy.data.objects.new(name,data)
    gallery.objects.link(o)
    return assign(o,name,mat)


def revolved(name,center,rings,mat,n=64):
    pts=[(r*cos(2*pi*j/n),r*sin(2*pi*j/n),z) for z,r in rings for j in range(n)]
    faces=[tuple(reversed(range(n)))]
    for i in range(len(rings)-1):
        for j in range(n):
            k=i*n+j
            faces.append((k,i*n+(j+1)%n,(i+1)*n+(j+1)%n,k+n))
    faces.append(tuple(range(len(pts)-n,len(pts))))
    o=mesh(name,pts,faces,mat)
    o.location=center
    for p in list(o.data.polygons)[1:-1]: p.use_smooth=True
    return o


def wheel(name, pos, r, length, mat):
    o=revolved(name,pos,[(-length/2,r*.94),(-length*.43,r),(length*.43,r),(length/2,r*.94)],mat,32)
    o.rotation_euler.y=pi/2
    return o


def bar(name, a,b,r,mat):
    a,b=Vector(a),Vector(b)
    o=revolved(name,(a+b)/2,[(-(b-a).length/2,r),((b-a).length/2,r)],mat,10)
    o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return o


def label(s,loc,size,mat=ink,tilt=pi/2):
    curve=bpy.data.curves.new(s,'FONT')
    curve.body=s
    curve.size=size
    curve.align_x='CENTER'
    curve.resolution_u=4
    if any(ord(c)>127 for c in s): curve.font=korean
    o=bpy.data.objects.new(s,curve)
    gallery.objects.link(o)
    o.location=loc
    o.rotation_euler.x=tilt
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active=o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    return assign(o,s,mat)


korean=bpy.data.fonts.load('/System/Library/Fonts/AppleSDGothicNeo.ttc')
# The same packed atlas serves the veneer, dealer cards and textile. These
# pieces can be exported as a single material while keeping separate editable objects.
surfaces.prepare(OUT,oak)
top=.77
box("후퇴한 받침",(0,0,.05),(2.25,.78,.10),grey,.025)
box("흰색 시연대",(0,0,.40),(2.43,.95,.68),ivory,.032)
board=box("참나무 시연판",(0,0,.74),(2.40,.93,.06),oak,.012)
board.data.uv_layers.active.name="Showroom"
uv=board.data.uv_layers.active.data
for poly in board.data.polygons:
    for k in poly.loop_indices:
        v=board.data.vertices[board.data.loops[k].vertex_index].co
        uv[k].uv=surfaces.uv("wood",v.x/2.4+.5,v.y/.93+.5)
box("뒤쪽 턱",(0,.455,.883),(2.43,.045,.285),ivory,.016)
for x in (-1.195,1.195):
    box("낮은 옆 턱",(x,0,.807),(.04,.94,.12),ivory,.016)
label("roborock",(0,-.477,.37),.142)
# The two adjacent white docks and underside sample can all be seen in the
# department store's Gangnam photograph. The left cover is lower and more reflective.
dx,dy=.46,.145
materials=dict(ivory=ivory,white=white,grey=grey,dark=dark,rubber=rubber,silver=silver,glass=glass,lens=lens,red=red,redlight=redlight,pad=pad,ink=ink,atlas=oak)
tools=dict(box=box,bar=bar,mesh=mesh,wheel=wheel,revolved=revolved,finish=finish,label=label)
demonstrator.showroom(top,dx,dy,tools,materials)

def robot(x,y,z):
    base=(x,y,z)
    revolved("범퍼 하단 고무",base,[(.007,.151),(.014,.169),(.030,.174)],dark)
    revolved("부유식 범퍼",base,[(.025,.171),(.029,.175),(.069,.175),(.077,.171)],white)
    revolved("상판 조립선",base,[(.075,.171),(.079,.170)],grey)
    revolved("둥근 상판",base,[(.078,.1705),(.082,.167),(.085,.158),(.087,.114)],ivory)
    rev=(x,y+.021,z+.086)
    revolved("라이다 검은 회전창",rev,[(0,.045),(.004,.047),(.015,.046)],glass,48)
    for i in range(4):
        a=i*pi/2+.22
        box("라이다 창 기둥",(rev[0]+.044*cos(a),rev[1]+.044*sin(a),rev[2]+.010),(.009,.009,.012),grey,.002)
    revolved("라이다 센서탑 덮개",rev,[(.014,.047),(.018,.049),(.023,.044),(.024,.037)],ivory,48)
    demonstrator.upper_details(x,y,z,tools,materials)
    box("전방 장애물 센서",(x,y-.170,z+.053),(.088,.017,.042),glass,.008)
    for i in (-1,0,1):
        o=revolved("전방 센서 렌즈",(x+i*.024,y-.179,z+.054),[(0,.008),(.002,.007)],lens,20)
        o.rotation_euler.x=pi/2
    for side in (-1,1):
        win=box("측면 거리 센서",(x+side*.153,y-.078,z+.052),(.036,.009,.025),glass,.004)
        win.rotation_euler.z=side*1.08
    for i in range(14):
        a=.48+i*.099
        vent=box("배기 슬롯",(x+.173*cos(a),y+.173*sin(a),z+.049),(.003,.005,.023),rubber,.001)
        vent.rotation_euler.z=a
robot(dx,dy-.267,top+.032)
# Underside demonstrator with the wheels, pad and silicone flights facing the shopper.
start=set(gallery.objects)
revolved("시연용 뒤집은 본체",(0,0,0),[(-.065,.159),(-.058,.172),(-.018,.174),(-.012,.17)],ivory)
revolved("나사 체결 하판",(0,0,0),[(-.016,.17),(-.008,.169),(0,.158)],dark)
for side in (-1,1):
    wheel("구동 바퀴",(side*.121,0,.008),.039,.026,dark)
    for j in range(14):
        a=j*2*pi/14
        tread=box("톱니 트레드",(side*.121,.038*cos(a),.008+.038*sin(a)),(.026,.008,.006),rubber)
        tread.rotation_euler.x=a-pi/2
box("분리형 브러시 카세트",(0,-.015,.008),(.20,.082,.023),rubber,.009)
for row in range(2):
    cy=-.037+.040*row
    wheel("롤러 심",(0,cy,.025),.014,.174,red if row==0 else dark)
    for phase in range(4):
        verts=[]
        for i in range(29):
            x=-.085+i*.17/28
            a=phase*pi/2+abs(x)*36*(1 if row==0 else -1)
            for delta,r in ((-.13,.014),(0,.018),(.12,.014)):
                verts.append((x,cy+r*cos(a+delta),.025+r*sin(a+delta)))
        faces=[(3*i+j,3*(i+1)+j,3*(i+1)+j+1,3*i+j+1) for i in range(28) for j in range(2)]
        mesh("나선형 고무 날",verts,faces,redlight if row==0 else rubber)
demonstrator.underbody(tools,materials)
for i in range(3):
    a=.65+i*2*pi/3
    ax,ay=-.10,-.092
    bar("사이드 브러시 팔",(ax,ay,.012),(ax+.042*cos(a),ay+.042*sin(a),.017),.003,grey)
    for j in range(-2,3):
        b=a+j*.042
        bar("브러시 솔",(ax+.037*cos(a),ay+.037*sin(a),.018),(ax+.069*cos(b),ay+.069*sin(b),.019),.0015,rubber)
revolved("브러시 허브",(-.10,-.092,.011),[(0,.009),(.006,.008)],grey,20)
for i in range(7):
    a=2*pi*i/7
    revolved("하판 나사",(.15*cos(a),.15*sin(a),.001),[(0,.003),(.001,.003)],silver,10)
tilt=Matrix.Translation((-.59,-.12,top+.134)) @ Matrix.Rotation(radians(28),4,'X')
bpy.context.view_layer.update()
for obj in set(gallery.objects)-start: obj.matrix_world=tilt @ obj.matrix_world
box("경사 견본 받침",(-.59,-.11,top+.05),(.25,.21,.1),dark,.015)
bpy.context.view_layer.update()
print('Editable pieces:',len(gallery.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
exec(compile((OUT/'export.py').read_text(),str(OUT/'export.py'),'exec'))
