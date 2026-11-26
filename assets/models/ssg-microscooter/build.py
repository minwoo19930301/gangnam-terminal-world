"""Build in metres. The customer approaches along Blender -Y."""
import bpy
import math
from mathutils import Vector, Matrix
from pathlib import Path

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('SSG_10F_MicroKickboard')
bpy.context.scene.collection.children.link(collection)
batches = {}
palette = {}
transform = Matrix.Identity(4)
group = 'MicroGangnamScooters'
white, pearl, black, steel = 'f5efe6', 'd8e0e0', '23292e', 'bac7c9'
aqua, pink, blue = '12bcc3', 'ee5986', '135c90'

def rgb(code):
    def linear(n):
        s = int(n, 16)/255
        return s/12.92 if s <= .04045 else ((s+.055)/1.055)**2.4
    return tuple(linear(code[i:i+2]) for i in (0,2,4))+(1,)

def material(c):
    key = (group,c)
    if key not in palette:
        mat = bpy.data.materials.new(group+' '+c)
        mat.diffuse_color = rgb(c)
        mat.metallic = .62 if group.endswith('Hardware') else .03
        mat.roughness = .28 if group.endswith('Hardware') else .44
        palette[key] = mat
    return palette[key]

def piece(name, vertices, faces, c, smooth=False):
    coords = [transform @ Vector(p) for p in vertices]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(coords, [], faces)
    mesh.materials.append(material(c))
    for poly in mesh.polygons: poly.use_smooth = smooth
    obj = bpy.data.objects.new(name,mesh)
    collection.objects.link(obj)
    batches.setdefault(group,[]).append((obj,c))
    return obj

def tube(name, a,b, profile,c,n=20):
    # A revolved section can include tyre shoulders, grip collars and hub grooves.
    a,b=Vector(a),Vector(b)
    axis=(b-a).normalized()
    u=axis.cross(Vector((0,0,1)) if abs(axis.z)<.9 else Vector((0,1,0))).normalized()
    v=axis.cross(u)
    verts=[a+(b-a)*t+r*(u*math.cos(i*math.tau/n)+v*math.sin(i*math.tau/n))
           for t,r in profile for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i)
           for j in range(len(profile)-1) for i in range(n)]
    return piece(name,verts,faces,c,True)

def rod(name,a,b,r,c,n=14):
    if r <= .016:
        # Tiny spokes, bolts and ribs have no visible shoulder at game scale.
        return tube(name,a,b,[(0,0),(0,r),(1,r),(1,0)],c,min(n,10))
    return tube(name,a,b,[(0,0),(0,r*.99),(.025,r),(.975,r),(1,r*.99),(1,0)],c,n)

def slab(name,outline,z0,z1,c):
    n=len(outline)
    # Counterclockwise viewed from above.
    area=sum(x*outline[(i+1)%n][1]-y*outline[(i+1)%n][0] for i,(x,y) in enumerate(outline))
    if area<0: outline=list(reversed(outline))
    return piece(name,[(x,y,z) for z in (z0,z1) for x,y in outline],
                 [tuple(reversed(range(n))),tuple(range(n,2*n))]+
                 [(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)],c)

def box(name,x,y,z,w,d,h,c):
    return slab(name,[(x-w/2,y-d/2),(x+w/2,y-d/2),(x+w/2,y+d/2),(x-w/2,y+d/2)],z,z+h,c)

def place(x,y,z,angle=0):
    return Matrix.Translation((x,y,z))@Matrix.Rotation(math.radians(angle),4,'Z')

def wheel(x,y,r,width):
    a=(x,y-width/2,r); b=(x,y+width/2,r)
    tube('PU 바퀴와 둥근 숄더',a,b,[(0,r*.72),(0,r*.87),(.16,r*.97),(.37,r),(.69,r),(.88,r*.97),(1,r*.87),(1,r*.72),(0,r*.72)],'a9c3c9')
    face=y  # The same eight open spokes are visible from both wheel faces.
    for i in range(8):
        t=i*math.tau/8
        rod('사출 휠 스포크',(x+r*.22*math.cos(t),face,r+r*.22*math.sin(t)),
            (x+r*.75*math.cos(t+.24),face,r+r*.75*math.sin(t+.24)),r*.065,'59646a',6)
    rod('허브 베어링',(x,y-width*.58,r),(x,y+width*.58,r),r*.27,black)
    rod('축 볼트',(x,y-width*.62,r),(x,y+width*.62,r),r*.14,steel,8)

def scooter(c,mode='up'):
    global group
    group='MicroGangnamScooters'
    # Deck flares into the steering head before tapering over the brake.
    sections=[(-.225,.019),(-.216,.058),(-.19,.081),(-.161,.082),(-.127,.061),(-.089,.052),(.015,.054),(.117,.052),(.16,.046),(.19,.030),(.196,.015)]
    hull=[(x,w) for x,w in sections]+[(x,-w) for x,w in reversed(sections)]
    slab('삼륜 조향 섀시',[(x,y*.91) for x,y in hull],.046,.063,black)
    slab('성형 데크',hull,.062,.085,c)
    for y in [-.032,-.023,.023,.032]:
        rod('길이방향 미끄럼 방지 리브',(-.090,y,.086),(.147,y,.086),.0024,pearl,6)
    for i in range(8):
        x=-.066+i*.026
        rod('실리콘 사선 패턴',(x,-.015,.085),(x+.014,.014,.085),.0034,pearl,6)
    rod('앞바퀴 조향축',(-.176,-.116,.060),(-.176,.116,.060),.014,black)
    for y in [-.105,.105]: wheel(-.176,y,.06,.025)
    wheel(.197,0,.04,.023)
    # Curved brake follows the rear tyre down from the step.
    profile=[(.145,.074),(.157,.087),(.18,.095),(.205,.097),(.227,.087),(.24,.071)]
    verts=[(x,y,z+t) for x,z in profile for y,t in [(-.022,0),(-.018,.006),(.018,.006),(.022,0)]]
    piece('후륜 곡면 풋브레이크',verts,[(i*4+j,(i+1)*4+j,(i+1)*4+j+1,i*4+j+1) for i in range(5) for j in range(3)],c,True)
    if mode=='deck': return
    pivot=Vector((-.169,0,.117))
    rod('접이식 힌지 축',(-.169,-.036,.117),(-.169,.036,.117),.032,black)
    rod('힌지 핀',(-.169,-.038,.117),(-.169,.038,.117),.013,steel)
    axis=Vector((.08,0,.997) if mode=='up' else (.994,0,.11))
    def pt(t): return pivot+axis*t
    top=.544 if mode=='up' else .349
    rod('도장 하부 스템',pt(.016),pt(.323),.017,c)
    rod('퀵 릴리스 클램프',pt(.301),pt(.329),.022,black)
    rod('클램프 레버',pt(.315)+Vector((0,-.023,0)),pt(.278)+Vector((.007,-.023,0)),.005,steel,8)
    group='MicroGangnamHardware'
    rod('텔레스코픽 내관',pt(.325),pt(top),.012,steel)
    group='MicroGangnamScooters'
    hub=pt(top)
    rod('T자 핸들',hub+Vector((0,-.133,0)),hub+Vector((0,.133,0)),.012,steel)
    for sign in [-1,1]:
        start=hub+Vector((0,.038*sign,0)); end=hub+Vector((0,.137*sign,0))
        profile=[(0,.020),(.04,.022),(.10,.019)]
        for i in range(7): profile.extend([(.13+i*.102,.018),(.16+i*.102,.020),(.19+i*.102,.018)])
        profile.extend([(.87,.019),(.90,.025),(.98,.025),(1,.020),(1,0)])
        tube('리브 손잡이와 낙하 방지 단부',start,end,profile,c,16)

def helmet(x,y,z,c):
    global transform
    transform=place(x,y,z,-12)
    rod('헬멧 받침', (0,0,-.058),(0,0,.065),.055,'c4beb4')
    n=32
    def point(i,j,scale=1):
        t=(i+.5)*math.tau/n
        p=.08+j*.162
        return (.115*scale*math.cos(t)*math.sin(p),.148*scale*math.sin(t)*math.sin(p),.151*math.cos(p)+.014)
    verts=[point(i,j) for j in range(11) for i in range(n)]
    faces=[]
    for j in range(10):
        for i in range(n):
            if j in (3,4,7,8) and i%8 in (1,2): continue
            k=(i+1)%n
            faces.append((j*n+i,(j+1)*n+i,(j+1)*n+k,j*n+k))
    faces.append(tuple(range(n)))
    piece('통풍구가 열린 곡면 헬멧 셸',verts,faces,c,True)
    piece('충격 흡수 내피',[point(i,j,.949) for j in range(11) for i in range(n)],
          [(j*n+i,(j+1)*n+i,(j+1)*n+(i+1)%n,j*n+(i+1)%n) for j in range(10) for i in range(n)],black,True)
    for side in [-1,1]:
        for end in [-.083,.067]:
            rod('턱끈',(.098*side,end,.026),(.074*side,-.008,-.060),.005,black,6)
    transform=Matrix.Identity(4)

def lettering(body,loc,size):
    font=bpy.data.curves.new('상표 레터링','FONT')
    font.body=body; font.align_x='CENTER'; font.align_y='CENTER'; font.size=size
    font.extrude=.0015
    obj=bpy.data.objects.new(body,font); collection.objects.link(obj)
    obj.location=loc; obj.rotation_euler.x=math.pi/2
    bpy.context.view_layer.objects.active=obj; obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.data.transform(obj.matrix_world); obj.matrix_world=Matrix.Identity(4)
    obj.data.materials.append(material(white));batches[group].append((obj,white))
    obj.select_set(False)

# Public branch photograph: a warm white drum with a continuous blue belt.
group='MicroGangnamFixtures'
for lo,hi,r,c in [(.012,.054,.704,black),(.054,.296,.735,white),(.296,.342,.737,blue),(.342,.555,.735,white)]:
    rod('원형 전시대',(0,0,lo),(0,0,hi),r,c,72)
# Back wall and illuminated blue returns frame the radial cutaway and helmet shelf.
box('진열 벽체',0,1.94,.012,4.05,.17,2.52,'e9e4db')
for x in [-1.98,-.65, .67,1.98]:
    box('청록색 프레임',x,1.833,.13,.035,.060,2.32,'55d7ed')
for x in [-1.31,1.32]:
    box('상단 띠',x,1.83,2.42,1.34,.060,.030,'55d7ed')
for z in [.42,1.12]:
    box('헬멧 선반',1.30,1.63,z,1.30,.48,.042,white)
for x in [-1.38,-.99]:
    box('벽 선반 받침',x,1.56,.32,.68,.54,.12,white)
box('중앙 상표판',0,1.823,2.10,1.12,.038,.265,black)
lettering('micro',(0,1.797,2.24),.232)
for x,y,ang,c in [(-.31,.078,-35,aqua),(.267,-.028,69,'85aedd')]:
    transform=place(x,y,.556,ang);scooter(c)
# Six deck assemblies hang nose-out around a central mounting rosette.
for i,c in enumerate(['ed5e85','75bfaf','313e43','447aca','ad72aa','eab842']):
    angle=math.radians(28+i*60)
    transform=(Matrix.Translation((.345*math.cos(angle),1.71,1.47+.345*math.sin(angle)))@
               Matrix.Rotation(-angle+math.pi,4,'Y')@Matrix.Rotation(math.pi/2,4,'X'))
    scooter(c,'deck')
transform=Matrix.Identity(4)
rod('중앙 벽걸이 허브',(0,1.69,1.47),(0,1.63,1.47),.096,white,32)
for i,c in enumerate([pink,aqua,'544976']):
    transform=Matrix.Translation((-1.32,1.71,.89+i*.52))@Matrix.Rotation(-.31,4,'Y')@Matrix.Rotation(math.pi/2,4,'X')
    scooter(c,'fold')
for i,c in enumerate([aqua,black,'efb5bd','e3ddce','e86678','64b8c2']):
    helmet(.94+i%3*.37,1.53,.52+(i//3)*.7,c)

# Preserve native components. The two-sided finish covers moulded shells and open-ended trim.
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/'gallery.blend'),compress=True)
for name,parts in batches.items():
    vertices=[]; faces=[]; colors=[]; smoothing=[]
    for obj,c in parts:
        offset=len(vertices)
        vertices.extend([v.co[:] for v in obj.data.vertices])
        colors.extend([rgb(c)]*len(obj.data.vertices))
        for p in obj.data.polygons:
            faces.append(tuple(i+offset for i in p.vertices)); smoothing.append(p.use_smooth)
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces)
    attr=mesh.color_attributes.new(name='Col',type='BYTE_COLOR',domain='POINT')
    for pt,color in zip(attr.data,colors):pt.color=color
    for p,s in zip(mesh.polygons,smoothing):p.use_smooth=s
    obj=bpy.data.objects.new(name,mesh);bpy.context.scene.collection.objects.link(obj)
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF')
    color=mat.node_tree.nodes.new('ShaderNodeVertexColor');color.layer_name='Col'
    mat.node_tree.links.new(color.outputs['Color'],shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value=.28 if name.endswith('Hardware') else .47
    shader.inputs['Metallic'].default_value=.62 if name.endswith('Hardware') else .035
    obj.data.materials.append(mat);obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out/'gallery.glb'),export_format='GLB',use_selection=True,export_yup=True)
