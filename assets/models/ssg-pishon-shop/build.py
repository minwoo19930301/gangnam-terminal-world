"""Author the Pishon gift gallery in metres. Blender +Y points behind the shelf."""
from pathlib import Path
import math
from math import sin, cos, pi
import bpy
import numpy as np
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
collection = bpy.data.collections.new("SSG_9F_Pishon")
bpy.context.scene.collection.children.link(collection)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[collection.name]

def material(name, rough, metal=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    vertex = m.node_tree.nodes.new('ShaderNodeVertexColor')
    vertex.layer_name = 'Finish'
    m.node_tree.links.new(vertex.outputs['Color'], bs.inputs['Base Color'])
    return m

matte = material('PishonPaper', .69)
glaze = material('PishonPorcelain', .24)
metal = material('PishonSilver', .2, .58)
glass = material('PishonPrism', .14, .14)
glass.blend_method = 'BLEND'
glass.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = .83
stone = material('PishonTravertine', .51)
# Horizontally bedded travertine with fine pores, packed inside the native library.
rng = np.random.default_rng(49)
H,W=128,256
yy,xx=np.mgrid[:H,:W]
warp=yy+2.4*np.sin(xx/94+yy/43)+.9*np.sin(xx/23+yy/18)
n=rng.normal(0,1,(H,W))
bands=np.interp(warp%H,np.arange(H),rng.normal(0,.7,H))
tone=.017*bands+.012*n+.019*np.sin(warp/10)+.018*np.sin(warp/30)
tone-=.055*((n< -1.15)&(np.sin(warp/4)>.45))
rgba=np.ones((H,W,4),np.float32)
for i,c in enumerate([.89,.832,.732]):rgba[:,:,i]=np.clip(tone+c,0,1)
im=bpy.data.images.new('석회암 층리',W,H)
im.pixels.foreach_set(rgba.flatten())
im.pack()
tex=stone.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=im
stone.node_tree.links.new(tex.outputs['Color'],stone.node_tree.nodes['Principled BSDF'].inputs['Base Color'])

def linear(c):
    s=c/255
    return s/12.92 if s<=.04045 else ((s+.055)/1.055)**2.4

def paint(o,name,m,color,facet=None):
    o.name=name
    o.data.materials.append(m)
    attr=o.data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
    base=tuple(linear(int(color[k:k+2],16)) for k in (0,2,4))
    rgba=np.empty((len(o.data.loops),4),np.float32)
    rgba[:]=(*base,1)
    if facet:
        for p in o.data.polygons:
            rgb=facet(p)
            rgba[list(p.loop_indices),:3]=np.clip(np.array(base)*rgb,0,1)
    attr.data.foreach_set('color',rgba.ravel())
    return o

def box(name,x,y,z,w,d,h,col,m=matte,edge=.002):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z+h/2))
    o=bpy.context.object
    o.dimensions=(w,d,h)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if edge:
        mod=o.modifiers.new('연마한 모서리','BEVEL')
        mod.width=min(edge,h*.19,d*.19,w*.19)
        mod.segments=1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if m == stone:
        uv=o.data.uv_layers.active.data
        for face in o.data.polygons:
            normal=face.normal
            for index in face.loop_indices:
                v=o.data.vertices[o.data.loops[index].vertex_index].co
                a=v.y if abs(normal.x)>.7 else v.x
                b=v.y if abs(normal.z)>.7 else v.z
                uv[index].uv=(a/1.6,b/.70)
    return paint(o,name,m,col)

def mesh(name,verts,faces,loc,m,col,smooth=False,facet=None):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    data.update()
    o=bpy.data.objects.new(name,data)
    collection.objects.link(o)
    o.location=loc
    for p in data.polygons:p.use_smooth=smooth
    return paint(o,name,m,col,facet)

def vessel(name,x,y,z,profile,m,col,n=32,flute=0,facet=None):
    vs=[];fs=[]
    for j,(radius,height) in enumerate(profile):
        for i in range(n):
            t=2*pi*i/n
            r=radius*(1-flute*(i%2)) if 1<=j<len(profile)-2 else radius
            vs.append((r*cos(t),r*sin(t),height))
        if j:
            for i in range(n):
                a=(j-1)*n+i;b=(j-1)*n+(i+1)%n
                fs.append((a,b,b+n,a+n))
    return mesh(name,vs,fs,(x,y,z),m,col,not flute,facet)

def pipe(name,points,radii,m,col,n=12):
    # Section rings perpendicular to the tangent; spout lips turn back inward.
    vs=[];fs=[]
    for j,pt in enumerate(points):
        tangent=Vector(points[min(j+1,len(points)-1)])-Vector(points[max(0,j-1)])
        tangent.normalize()
        side=Vector((0,1,0));up=tangent.cross(side).normalized()
        for i in range(n):
            t=2*pi*i/n
            vs.append(Vector(pt)+radii[j]*(side*cos(t)+up*sin(t)))
            if j:
                a=(j-1)*n+i;b=(j-1)*n+(i+1)%n
                fs.append((a,b,b+n,a+n))
    def reflection(p):
        a=(p.index%n+.5)*2*pi/n
        return .32+.54*(.5+.5*cos(a))+.58*max(0,cos(2*a+.8))**7
    return mesh(name,vs,fs,(0,0,0),m,col,True,reflection if m==metal else None)

def lettering(word,x,y,z,size,color,m=matte):
    bpy.ops.object.text_add(location=(x,y,z),rotation=(pi/2,0,0))
    o=bpy.context.object
    o.data.body=word
    o.data.align_x='CENTER'
    o.data.size=size
    o.data.resolution_u=4
    o.data.extrude=0
    o.data.bevel_depth=0
    font=Path('/System/Library/Fonts/Supplemental/Times New Roman.ttf')
    if font.exists():o.data.font=bpy.data.fonts.load(str(font),check_existing=True)
    bpy.ops.object.convert(target='MESH')
    return paint(bpy.context.object,word,m,color)

# Rear shelving follows the stone, narrow champagne rails and spaced lettering.
box('석재 뒷판',0,.27,0,3.25,.16,2.43,'ffffff',stone)
for x in [-1.61,1.61]:
    box('측판',x,.04,0,.055,.58,2.43,'ffffff',stone)
box('하부 수납장',0,.035,.06,3.22,.54,.77,'cfbda1')
for x in [-1.19,-.395,.395,1.19]:box('수납장 문',x,-.244,.1,.778,.024,.69,'e2d2b9')
for h in [.83,1.38,1.91]:
    box('석재 선반',0,-.008,h-.043,3.23,.57,.043,'ffffff',stone)
    box('샴페인 금속 선반 테두리',0,-.3,h-.042,3.22,.014,.036,'b89e73',metal)
    box('선반 밑 조명 확산판',0,-.28,h-.047,3.17,.016,.008,'fff6d8',glaze)
lettering('PISHON',0,.174,2.097,.257,'20252d')
lettering('ART OF GIFTING',0,.173,2.014,.051,'33323b')

def gift(x,y,z,w,d,h):
    box('파란 선물 상자',x,y,z,w,d,h,'597b9f')
    box('뚜껑',x,y,z+h-.023,w+.006,d+.005,.024,'7796b9')
    box('세로 리본',x,y,z+.001,.036,d+.009,h+.001,'f2e4c9')
    box('가로 리본',x,y,z+.002,w+.009,.034,h+.002,'eddfbe')

for x,z,w,h in [(-1.26,1.91,.32,.18),(-.96,1.91,.27,.12),(1.15,1.91,.39,.19),(1.29,2.1,.20,.10),(.79,1.38,.36,.13),(1.23,1.38,.43,.18),(-1.2,.83,.54,.20),(-1.19,1.03,.37,.11)]:
    gift(x,-.012,z,w,.224,h)

# Norm II, parallel offset towers and the narrow stepped passage.
def norm(x,y,z):
    c='513e33'
    box('Norm II 왼쪽 벽',x-.053,y-.019,z,.043,.091,.30,c)
    box('Norm II 오른쪽 벽',x+.047,y+.018,z,.055,.092,.30,c)
    for i in range(18):
        depth=.12/18
        box('Norm II 계단',x-.005,y-.070+i*depth,z,.054,depth+.0002,.048+.0056*i,c,edge=.0004)

def book(x,y,z,w,h,col):
    box('미색 책등 단면',x,y,z+.004,w-.007,.144,h-.008,'ebddb9')
    for k in [-1,1]:box('양장 표지',x+k*(w-.003)/2,y,z,.003,.153,h,col,edge=.0005)
    box('양장 책등',x,y-.077,z,w,.007,h,col)
    for k in [.14,.82,.86]:
        box('금박 책등 띠',x,y-.081,z+h*k,w*.75,.002,.0028,'dec99e',metal)

for start,shelf in [(-1.11,1.38),(.18,.83)]:
    norm(start-.09,-.10,shelf)
    cur=start
    for i,c in enumerate(['d7cab3','bd4938','273f50','497a74','d49832','392c2a']):
        w=.026+.008*(i%3)
        book(cur+w/2,-.072,shelf,w,.22+.023*(i%4),c)
        cur+=w+.001
    norm(cur+.083,-.10,shelf)

# Two offset presentation islands. The glass set sits closest to the visitor.
def table(x,y,w,d,h):
    box('걸레받이',x,y,.025,w-.13,d-.12,.08,'9e886a',metal)
    box('진열대',x,y,.105,w-.055,d-.05,h-.156,'ded1ba',stone)
    box('금속 띠',x,y,h-.051,w,d,.019,'af9569',metal)
    box('연마한 상판',x,y,h-.032,w+.012,d+.012,.032,'ffffff',stone)
table(-.60,-1.46,1.14,.59,.94)
table(.83,-.83,1.19,.64,1.03)

def prism(x,y,z,col):
    # Dark teal mouth and alternating bright/dark cut facets on clear heavy base.
    prof=[(.001,0),(.034,0),(.036,.006),(.037,.014),(.0446,.105),(.045,.116),
          (.045,.12),(.042,.12),(.0418,.111),(.034,.018),(.029,.012),(.001,.012)]
    def tint(p):
        j,i=divmod(p.index,48)
        if j in [5,6,7]:return (.53,.72,.76)
        stripe=.61+.60*(i%2)+.52*max(0,cos(i*.53))**12
        return (stripe*1.12,stripe,stripe*.83) if j<5 else (.50,.69,.70)
    o=vessel('L’OBJET 프리즘 하이볼',x,y,z,prof,glass,col,48,.058,tint)
    # Reflected light from strip-lit shelves: coloured mouth, caustic ridges
    # and narrow pale glints along cuts, baked per corner to preserve gradients.
    base=np.array([linear(int(col[k:k+2],16)) for k in (0,2,4)])
    edge=np.array([.013,.15,.14]) if col in ['8eb429','87a83b','94b943'] else base*.32
    attr=o.data.color_attributes['Finish']
    for face in o.data.polygons:
        row,i=divmod(face.index,48)
        for k in face.loop_indices:
            ring=o.data.loops[k].vertex_index//48
            t=2*pi*(i+.5)/48
            bright=(i%2)*.55+.20
            stripe=max(0,cos(t*3+.12))**32
            rgb=base*(bright+.55*stripe)*(1.25 if ring in [2,3,4] else .50)
            if ring in [0,1,5,6,7,8,10]:rgb=edge*(.9+bright)
            rgb+=np.array([.45,.49,.45])*stripe*(.62 if i%2 else .17)
            attr.data[k].color=(*np.clip(rgb,0,1),1)

for x,y,col in [(-.98,-1.62,'8eb429'),(-.78,-1.62,'b36b29'),(-.57,-1.62,'97485e'),(-.97,-1.37,'ab6e26'),(-.75,-1.37,'87a83b'),(-.53,-1.37,'883c5e')]:
    prism(x,y,.94,col)
gift(-.31,-1.33,.94,.26,.20,.115)
prism(-.31,-1.34,1.057,'94b943')
for i,col in enumerate(['94b943','9b463c','996329']):
    prism(.17+i*.14,-.09,1.38,col)

def rim(x,y,z,r):
    vessel('백금 테두리',x,y,z,[(r-.001,0),(r,.0007),(r,.002),(r-.001,.0024)],metal,'bdc1c0')

def plate(x,y,z,r):
    vessel('백자 접시',x,y,z,[(.001,.002),(r*.42,.002),(r*.50,.006),(r*.91,.014),(r,.020),(r,.023),(r*.95,.024),(r*.70,.015),(r*.52,.011),(.001,.011)],glaze,'f8f4e9')
    rim(x,y,z+.022,r*.968)

def cup(x,y,z):
    profile=[(.001,.001),(.026,0),(.031,.004),(.033,.011),(.042,.054),(.043,.064),(.041,.065),(.039,.060),(.029,.010),(.001,.008)]
    vessel('백자 찻잔',x,y,z,profile,glaze,'f9f7ee')
    rim(x,y,z+.064,.042)
    pts=[(x+.033+.032*sin(t*pi/18),y,z+.034+.021*cos(t*pi/18)) for t in range(19)]
    pipe('찻잔 은색 고리 손잡이',pts,[.0038]*19,metal,'c5c3be')

def teapot(x,y,z):
    body=vessel('백자 티포트 몸체',x,y,z,[(.001,0),(.070,0),(.074,.008),(.078,.012),(.084,.021),(.091,.115),(.089,.137),(.083,.147),(.064,.15),(.061,.143)],glaze,'f8f5ec')
    # The editorial close-up shows a lightly hammered white body.
    for face in body.data.polygons:
        j,i=divmod(face.index,32)
        tone=.91+.07*cos(i*.95+j*2.4)+.025*sin(i*1.94-j)
        for k in face.loop_indices:
            body.data.color_attributes['Finish'].data[k].color=(tone*.95,tone*.92,tone*.85,1)
    vessel('분리형 뚜껑',x,y,z+.145,[(.001,0),(.065,.001),(.068,.004),(.061,.009),(.024,.013),(.013,.014),(.013,.022),(.010,.026),(.001,.026)],glaze,'f5f3ee')
    pts=[(x+a,y,z+b) for a,b in [(.075,.057),(.10,.061),(.121,.076),(.14,.101),(.159,.126),(.177,.140),(.186,.143)]]
    pipe('은색 주둥이',pts,[.029,.024,.019,.015,.013,.012,.013],metal,'d6d5d0',20)
    pipe('주둥이 안쪽',pts[-2:][::-1],[.010,.009],matte,'514c45',20)
    pts=[(x+a,y,z+b) for a,b in [(-.083,.125),(-.109,.130),(-.127,.127),(-.135,.116),(-.137,.048),(-.134,.030),(-.12,.023),(-.078,.026)]]
    pipe('은색 각고리 손잡이',pts,[.006]*len(pts),metal,'d2cfc6',14)

for x,y,z in [(.72,-.73,1.03),(-.16,-.04,1.38)]:teapot(x,y,z)
for x,y,z in [(.53,-.99,1.03),(.90,-1.0,1.03),(1.15,-.82,1.03),(.11,-.08,.83),(-.42,-.08,1.38)]:
    plate(x,y,z,.075)
    cup(x,y,z+.011)
for x,y,z in [(1.22,-.65,1.03),(-.48,-.08,.83)]:
    for i in range(4):plate(x,y,z+.008*i,.106)
for x,y,z in [(-.62,-.10,1.91),(1.02,-.12,.83),(-1.2,.00,2.09)]:
    vessel('선물용 얕은 볼',x,y,z,[(.001,0),(.041,0),(.045,.008),(.069,.019),(.104,.055),(.110,.071),(.109,.075),(.105,.074),(.098,.055),(.064,.023),(.032,.011),(.001,.011)],metal,'c2ab84')

# Save editable pieces first. Join only the transient export scene by finish.
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
for m in [matte,glaze,metal,glass,stone]:
    parts=[o for o in collection.objects if o.type=='MESH' and o.data.materials[0]==m]
    for o in parts:
        if m != stone:
            for uv in list(o.data.uv_layers):o.data.uv_layers.remove(uv)
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join()
    bpy.context.object.name=m.name
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_yup=True)
