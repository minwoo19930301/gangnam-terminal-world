"""Author the Gangnam Leica display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_6F_Leica')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
batch = 'GangnamLeicaFixtures'
palette = dict(white='F5F4F1', grey='B6B9B9', black='17181B', trim='36383B',
    red='B61C30', accent='DF182C', silver='C5C6C6', bright='E5E4DF', gun='5A6060',
    rubber='292B2B', teal='1D3C42', blue='547675', violet='35394B', gold='D6AB63',
    leather='765341', seam='AB8362', paper='FAF9F4', shadow='555250')
materials = {}
def linear(c):
    s = int(c,16)/255
    return s/12.92 if s < .04045 else ((s+.055)/1.055)**2.4

def finish(name):
    if name not in materials:
        rgb = palette[name]
        m = bpy.data.materials.new(name)
        m.diffuse_color = (*[linear(rgb[i:i+2]) for i in (0,2,4)],1)
        m.use_nodes = True
        node=m.node_tree.nodes.get('Principled BSDF')
        node.inputs['Base Color'].default_value=m.diffuse_color
        node.inputs['Roughness'].default_value={'sand':.76,'lapel':.76,'suede':.89,'hood':.94,'navy':.98,'rib':.98,'metal':.30}.get(name,.57)
        materials[name]=m
    return materials[name]

def part(name, vertices, faces, color, bevel=0):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    bm=bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    if bevel:
        edges=[e for e in bm.edges if e.is_manifold and e.calc_face_angle()>.4]
        bmesh.ops.bevel(bm,geom=edges,offset=bevel,segments=2,affect='EDGES',clamp_overlap=True)
    bm.to_mesh(mesh)
    bm.free()
    ob=bpy.data.objects.new(prefix+name,mesh)
    gallery.objects.link(ob)
    mesh.materials.append(finish(color))
    ob.matrix_world=transform.copy()
    pieces.setdefault(batch,[]).append(ob)
    return ob

def skins(name, rings, color, bevel=0, cap=True):
    n=len(rings[0])
    faces=[list(reversed(range(n)))] if cap else []
    for k in range(len(rings)-1):
        for i in range(n):
            a=k*n+i
            b=k*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    if cap:
        faces.append([n*(len(rings)-1)+i for i in range(n)])
    return part(name,[p for ring in rings for p in ring],faces,color,bevel)

def outline(w,d,r):
    pts=[]
    for x,y,a in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        steps=2
        for j in range(steps+1):
            t=radians(a+90*j/steps)
            pts.append((x*(w/2-r)+r*cos(t),y*(d/2-r)+r*sin(t)))
    return pts

def plate(name,x,y,z,w,d,h,r,col):
    loop=outline(w,d,r)
    return skins(name,[[(x+i,y+j,k) for i,j in loop] for k in [z,z+h]],col,min(.0015,h*.10,r*.3))

def rod(name,a,b,r,col):
    a,b=Vector(a),Vector(b)
    q=(b-a).to_track_quat('Z','Y')
    ring=[q@Vector((r*cos(t*pi/4),r*sin(t*pi/4),0)) for t in range(8)]
    return skins(name,[[p+v for v in ring] for p in [a,b]],col)


def place(x=0,y=0,z=0,angle=0):
    global transform
    transform=Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(angle),4,'Z')

def pipe(name,pts,r,col,n=6):
    rings=[]
    for i,p in enumerate(pts):
        axis=Vector(pts[min(i+1,len(pts)-1)])-Vector(pts[max(i-1,0)])
        normal=axis.normalized()
        base=normal.cross(Vector((0,1,0)))
        if base.length<.01: base=normal.cross(Vector((1,0,0)))
        base.normalize()
        other=normal.cross(base)
        rings.append([Vector(p)+r*(base*cos(j*2*pi/n)+other*sin(j*2*pi/n)) for j in range(n)])
    return skins(name,rings,col)

def box(name,x,y,z,w,d,h,col):
    return plate(name,x,y,z,w,d,h,min(.006,w*.08,d*.08),col)

def dial(name,x,y,z,r,h,col,n=24):
    return skins(name,[[(x+r*cos(i*2*pi/n),y+r*sin(i*2*pi/n),zz) for i in range(n)]
                       for zz in [z,z+h]],col)

def profile(name,x,z,stations,col,n=32,ribs=0,cap=True):
    # Lathe along the optical axis (-Y). Reversed stations describe a recessed rim.
    rings=[]
    for y,r in stations:
        rings.append([(x+(r+(ribs if i%2 else 0))*cos(i*2*pi/n),y,
                       z+(r+(ribs if i%2 else 0))*sin(i*2*pi/n)) for i in range(n)])
    return skins(name,rings,col,cap=cap)

def lettering(text,x,y,z,size,color,front=True):
    data=bpy.data.curves.new(text,'FONT')
    data.body=text
    data.size=size
    data.align_x='CENTER'
    data.resolution_u=3
    ob=bpy.data.objects.new(text,data)
    gallery.objects.link(ob)
    local=Matrix.Translation((x,y,z))
    if front:local=local @ Matrix.Rotation(pi/2,4,'X')
    ob.matrix_world=transform @ local
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    label=bpy.data.objects.new(text,mesh)
    gallery.objects.link(label)
    label.matrix_world=ob.matrix_world.copy()
    mesh.materials.append(finish(color))
    pieces[batch].append(label)
    bpy.data.objects.remove(ob,do_unlink=True)

def optics(x,z,front,r):
    # Dark retaining lip, concave coated elements, aperture and a small off-axis glint.
    front-=.005
    profile('렌즈 안쪽 단차',x,z,[(front,r),(front-.002,r),(front-.002,r*.89),(front+.004,r*.85)],'gun',cap=False)
    for i,(ratio,col) in enumerate([(.86,'violet'),(.73,'blue'),(.52,'teal'),(.32,'black')]):
        profile('광학 코팅과 개구',x,z,[(front+.003-i*.0005,r*ratio),(front+.0027-i*.0005,r*ratio)],col,8 if i==3 else 32)
    profile('반사 하이라이트',x-r*.30,z+r*.38,[(front+.0006,r*.13),(front+.0003,r*.13)],'grey',12)

def lens(x,z,kind):
    r={'M':.029,'Q':.031,'SL':.039}[kind]
    y=-.022
    for name,length,rad,col,knurl in [
        ('마운트 플랜지',.005,r*1.07,'silver',False),('경통',.013,r,'trim',False),
        ('거리 눈금',.013,r*1.02,'silver' if kind=='M' else 'gun',False),
        ('초점 링',.021 if kind!='SL' else .051,r*1.06,'grey' if kind=='M' else 'rubber',True),
        ('조리개 링',.011,r*1.04,'silver' if kind=='M' else 'black',True),
        ('필터 나사 테두리',.005,r*1.04,'trim',False)]:
        profile(name,x,z,[(y,rad*.98),(y-.001,rad),(y-length,rad)],col,64 if knurl else 32,.0009 if knurl else 0)
        if name=='거리 눈금':
            for j in range(11):
                a=pi*(.10+j*.08)
                rod('피사계 심도 눈금',(x+rad*cos(a),y-.004,z+rad*sin(a)),
                    (x+rad*cos(a),y-.009,z+rad*sin(a)),.00065,'gold' if j%3==0 else 'black')
        y-=length
    optics(x,z,y,r*.97)
    if kind=='Q':
        # Q's angular hood flares from the filter thread; open centre reveals the element.
        def ring(h,d,depth):
            return [(x+a,depth,z+b) for a,b in outline(h,d,.007)]
        skins('개방형 사각 렌즈 후드',[ring(.067,.065,y),ring(.078,.073,y-.022),
              ring(.072,.067,y-.022),ring(.059,.057,y)],'trim',cap=False)
    if kind=='SL':
        n=48
        def petals(rad,base,wave):
            return [(x+rad*cos(i*2*pi/n),base-wave*(.5+.5*cos(i*4*pi/n))**2,z+rad*sin(i*2*pi/n)) for i in range(n)]
        skins('튤립형 줌 후드',[petals(r*1.05,y,0),petals(r*1.2,y-.014,.018),
            petals(r*1.13,y-.014,.018),petals(r*.99,y,0)],'black',cap=False)

def strap(width,col):
    # Flat leather strip, turned on edge at the lug and resting on the plinth.
    x=-width/2
    loop=[(x,0,.051),(x-.016,.004,.044),(x-.027,-.016,.012),
          (x-.061,-.046,.004),(x-.096,-.041,.003),(x-.112,-.018,.003),
          (x-.102,.009,.003),(x-.070,.018,.003),(x-.038,-.001,.006),(x-.017,-.009,.030),(x,0,.049)]
    rings=[]
    for i,(a,b,c) in enumerate(loop):
        p=Vector(loop[max(0,i-1)]);q=Vector(loop[min(len(loop)-1,i+1)])
        side=Vector((q.y-p.y,p.x-q.x,0)).normalized()*.0045
        rings.append([Vector((a,b,c))+side*s+Vector((0,0,d)) for s,d in [(-1,0),(1,0),(1,.002),(-1,.002)]])
    skins('가죽 손목 스트랩',rings,col)
    box('스트랩 고리',x-.037,-.004,.007,.011,.014,.005,'gun')

def camera(kind,x,y,z,angle,with_strap=True):
    global prefix
    prefix=kind+' · '
    place(x,y,z,angle)
    w={'M':.139,'Q':.130,'SL':.151}[kind]; h=.074 if kind!='SL' else .083
    shell='silver' if kind=='M' else 'black'
    plate('하판',0,0,0,w,.043,.005,.013,shell)
    plate('가죽 바디',0,0,.004,w,.044,h-.021,.014,'rubber')
    plate('상판',0,0,h-.017,w,.043,.017,.013,shell)
    if kind=='SL':
        skins('전자 뷰파인더 하우징', [[(a,b,c) for a,b in outline(ww,dd,.003)]
              for c,ww,dd in [(h,.064,.05),(h+.020,.034,.043)]],'black')
        plate('전면 그립',-.057,-.018,.004,.039,.050,.078,.014,'trim')
        lettering('LEICA',.002,-.0257,h+.002,.009,'white')
    else:
        for a,ww in ([(.046,.030),(-.026,.012)] if kind=='M' else [(.047,.020)]):
            box('창 테두리',a,-.0216,h-.017,ww,.0025,.014,'gun')
            box('뷰파인더 유리',a,-.0231,h-.015,ww-.003,.001,.010,'teal')
        profile('붉은 상표',.007,h-.010,[(-.022,.0052),(-.0238,.0052)],'accent',20)
    for a,r in [(-w*.33,.009),(.035,.0095)]:
        dial('상판 조작 다이얼',a,.002,h,r,.004,'gun' if kind!='M' else 'silver')
        box('조작 눈금',a,.007,h+.004,.001,.004,.0005,'white')
    dial('셔터 릴리스',-w*.33,.002,h+.004,.0038,.002,'bright')
    box('핫슈 접점',0,.004,h+(.021 if kind=='SL' else 0),.017,.013,.002,'gun')
    box('후면 모니터 테두리',.007,.022,.010,.084,.004,.050,'black')
    box('후면 모니터 유리',.007,.0245,.014,.076,.001,.041,'teal')
    for hh in [.023,.035,.047]:box('후면 버튼',-.049,.022,hh,.006,.003,.004,'gun')
    lens(.011,.036 if kind!='SL' else .042,kind)
    if with_strap:strap(w,'leather' if kind=='M' else 'rubber')
    prefix=''

def mount_demo(x,y,z):
    place(x,y,z,-12)
    plate('마운트 견본 하판',0,0,0,.14,.044,.072,.013,'rubber')
    plate('마운트 견본 상판',0,0,.054,.14,.045,.020,.013,'silver')
    profile('베이어닛 외륜',.008,.036,[(-.022,.033),(-.027,.033),(-.027,.0255),(-.023,.0255)],'silver',cap=False)
    profile('노출된 마운트 내부',.008,.036,[(-.023,.025),(-.024,.025)],'black')
    box('이미지 센서',.008,-.0248,.025,.032,.001,.021,'teal')
    for i in range(3):
        a=2*pi*i/3+.28
        profile('플랜지 나사',.008+.029*cos(a),.036+.029*sin(a),[(-.0271,.0016),(-.0275,.0016)],'gun',10)
    box('거리계 창',.046,-.023,.056,.027,.002,.012,'teal')
    dial('셔터 다이얼',-.044,0,.074,.010,.005,'silver')

batch='GangnamLeicaFixtures'
place()
# White demo counter with recessed toe kick and two drawer seams, like the branch vitrines.
box('하부 받침',0,0,.03,1.52,.65,.09,'gun')
for i,(z,h) in enumerate([(.12,.28),(.41,.28),(.70,.24)]):
    box('흰 진열 서랍',0,0,z,1.62,.74,h,'white')
box('전시대 테두리',0,0,.94,1.65,.76,.045,'grey')
box('시연 상판',0,0,.981,1.64,.75,.029,'paper')
for x,code in [(-.51,'M11'),(-.01,'Q3'),(.49,'SL3-S')]:
    box('전시 패드',x,0,1.01,.39,.28,.020,'grey')
    box('제품 카드',x,-.249,1.010,.18,.076,.003,'paper')
    lettering(code,x,-.258,1.014,.021,'black',False)
# Rear red illuminated niches and white photographic gallery panel form a single island backing.
place()
box('갤러리 벽',0,2.08,.015,5.72,.16,2.73,'white')
box('전시장 걸레받이',0,1.984,.02,5.7,.035,.105,'grey')
box('검은 수납 진열장',-1.53,1.82,.10,2.46,.42,2.55,'black')
for cx in [-2.10,-.97]:
    for level in [.64,1.18,1.72]:
        box('붉은 진열칸',cx,1.598,level,1.046,.026,.438,'red')
        box('진열 선반',cx,1.48,level,1.068,.28,.039,'trim')
        box('선반 전면 엣지',cx,1.331,level+.004,1.07,.017,.024,'gun')
    box('하부 손잡이',cx,1.597,.47,.17,.022,.013,'grey')
# Lettering beneath a small red medallion on the public-facing gallery panel.
place()
profile('상호 원판',.08,2.38,[(1.987,.142),(1.951,.142)],'accent',48)
lettering('Leica',.08,1.947,2.355,.084,'white')
lettering('Leica Camera',1.39,1.983,2.36,.120,'trim')

atlas=bpy.data.images.load(str(OUT/'prints.jpg'))
atlas.pack()
photos=bpy.data.materials.new('인화지')
photos.use_nodes=True
shader=photos.node_tree.nodes.get('Principled BSDF')
tex=photos.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=atlas
photos.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
shader.inputs['Roughness'].default_value=.85
for i,x in enumerate([.26,1.19,2.12]):
    box('흑연색 사진 액자',x,1.966,1.35,.755,.052,.81,'trim')
    box('아이보리 매트 보드',x,1.936,1.364,.730,.012,.78,'paper')
    w=.54; z=1.56;hh=w*224/256
    batch='GangnamLeicaPhotographs'
    ob=part('실사진 인화',[(x-w/2,1.928,z),(x+w/2,1.928,z),(x+w/2,1.928,z+hh),(x-w/2,1.928,z+hh)],[(0,1,2,3)],'white')
    ob.data.materials.clear()
    ob.data.materials.append(photos)
    uv=ob.data.uv_layers.new(name='사진')
    for loop in ob.data.loops:
        j=loop.vertex_index
        uv.data[loop.index].uv=((i+(1 if j in [1,2] else 0))/3,1 if j>=2 else 0)
    batch='GangnamLeicaFixtures'

# Separate white consultation table with open ends, paired bent-metal stools.
place()
box('상담 테이블 상판',1.57,.9,.91,1.83,.60,.10,'white')
for x in [.70,2.44]:box('폭포형 측판',x,.9,.03,.09,.60,.89,'white')
for x in [1.18,1.89]:
    dial('스툴 원반 받침',x,.42,.025,.168,.027,'grey')
    dial('스툴 기둥',x,.42,.05,.028,.55,'gun')
    plate('스툴 좌판',x,.42,.60,.31,.28,.049,.044,'shadow')
    for s in [-1,1]:
        pipe('스툴 등받이 프레임',[(x+s*.13,.48,.60),(x+s*.13,.54,.67),(x+s*.13,.55,.80)],.008,'grey')
    box('스툴 등받이',x,.55,.747,.29,.032,.074,'shadow')
batch='GangnamLeicaCameras'
for kind,x,a in [('M',-.51,12),('Q',-.01,-12),('SL',.49,-22)]:
    camera(kind,x,-.028,1.031,a,kind!='SL')
# Rear shelves: mount demonstration bodies next to detached prime and zoom optics.
for ci,cx in enumerate([-2.10,-.97]):
    for j,h in enumerate([.679,1.219,1.759]):
        mount_demo(cx-.21,1.44,h)
        for k in range(2):
            place(cx+.06+.19*k,1.44,h)
            r=.032+.009*k
            dial('교환 렌즈 마운트',0,0,0,r*.92,.008,'silver')
            dial('교환 렌즈 경통',0,0,.008,r,.059+.043*k,'black')
            dial('분리 렌즈 초점 링',0,0,.024,r*1.04,.025,'gun')
            dial('전면 필터 림',0,0,.067+.043*k,r,.004,'grey')
            dial('상향 렌즈 유리',0,0,.071+.043*k,r*.83,.001,'teal')

bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# Bake per-object finish into vertex colour after preserving the editable library.
for name,objects in pieces.items():
    bpy.ops.object.select_all(action='DESELECT')
    if name!='GangnamLeicaPhotographs':
        m=bpy.data.materials.new(name)
        m.use_nodes=True
        nodes=m.node_tree.nodes
        shader=nodes.get('Principled BSDF')
        colors=nodes.new('ShaderNodeVertexColor')
        colors.layer_name='Finish'
        m.node_tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
        shader.inputs['Roughness'].default_value=.40 if name.endswith('Cameras') else .64
        for ob in objects:
            me=ob.data
            rgba=me.materials[0].diffuse_color[:]
            attr=me.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for value in attr.data:value.color=rgba
            me.materials.clear()
            me.materials.append(m)
    for ob in objects:ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name=name
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
