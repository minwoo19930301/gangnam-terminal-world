"""Author the Gangnam New Balance display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_8F_NewBalance')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
batch = 'NBMegaGangnamFixtures'
palette = dict(ink='202125', outsole='303139', charcoal='525559', suede='959699',
    slate='777B80', mesh='919699', silver='BEC2C2', steel='92999D', ivory='EDEBE0',
    white='FAF8EF', foam='DEDCD8', heel='A0A5A7', oat='D8CBB0', wood='BDA078',
    blue='879EAA', cream='FAEAD2', pink='E8C7CC', orange='DF713A', gold='DBAB37',
    marble='ECECE8', linen='C7C5B9', shadow='55565B', stone='AAA397')
metal_colors={'silver','steel'}
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
        node.inputs['Roughness'].default_value=.29 if name in metal_colors else .82
        node.inputs['Metallic'].default_value=.58 if name in metal_colors else 0
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
    pieces.setdefault('NBMegaGangnamHardware' if color in metal_colors else batch,[]).append(ob)
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
    return skins(name,[[(x+i,y+j,k) for i,j in loop] for k in [z,z+h]],col,min(.004,h*.14))

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

def smooth(ob):
    for face in ob.data.polygons:
        face.use_smooth=True
    return ob

def tubing(name,points,r,col,n=8):
    # Parallel ring sections follow the path, including bends at lugs.
    return smooth(pipe(name,points,r,col,n))

def label(txt,x,y,z,size,col):
    curve=bpy.data.curves.new(txt,'FONT');curve.body=txt;curve.align_x='CENTER';curve.size=size
    curve.extrude=.0008;curve.resolution_u=3
    ob=bpy.data.objects.new(txt,curve);gallery.objects.link(ob)
    ob.location=(x,y,z);ob.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    final=bpy.data.objects.new(txt,mesh);gallery.objects.link(final);final.matrix_world=ob.matrix_world.copy()
    mesh.materials.append(finish(col));pieces.setdefault(batch,[]).append(final);bpy.data.objects.remove(ob,do_unlink=True)

# Cloth panels carry a physical repeat, so their weave follows each bent panel.
import struct, zlib, tempfile
def fabric_image():
    n=64
    def chunk(kind,data):
        return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
    scan=bytearray()
    for y in range(n):
        scan.append(0)
        for x in range(n):
            value=round(218+17*cos((x+y)*pi/4)+15*cos((x-y)*pi/4))
            scan.extend([value]*3)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',n,n,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(scan))+chunk(b'IEND',b'')
    with tempfile.TemporaryDirectory() as directory:
        path=Path(directory)/'canvas-weave.png';path.write_bytes(png)
        image=bpy.data.images.load(str(path));image.pack();image.filepath='//canvas-weave.png'
    return image

weave=fabric_image()

def knit(obj,repeat):
    uv=obj.data.uv_layers.new(name='편직')
    for face in obj.data.polygons:
        axis=max(range(3),key=lambda i:abs(face.normal[i]))
        for i in face.loop_indices:
            p=obj.data.vertices[obj.data.loops[i].vertex_index].co
            uv.data[i].uv=(p.x*repeat if axis!=0 else p.y*repeat,
                           p.z*repeat if axis!=2 else p.y*repeat)
    return obj

def ellipse(x,y,z,rx,ry,n=16):
    return [(x+rx*cos(2*pi*j/n),y+ry*sin(2*pi*j/n),z) for j in range(n)]

def form(name,sections,col,knitted=False):
    obj=smooth(skins(name,[ellipse(*s) for s in sections],col))
    return knit(obj,11) if knitted else obj

# The M990GL6 lateral profile is sampled heel to toe. Each station carries
# half-width, ground clearance, foam height and height of the mesh upper.
profile=[
    (-.153,.014,.012,.047,.088),(-.145,.037,.005,.049,.104),
    (-.126,.046,.002,.050,.117),(-.100,.047,.001,.048,.106),
    (-.071,.044,.002,.045,.090),(-.047,.041,.004,.042,.085),
    (-.022,.042,.003,.040,.127),(.005,.046,.002,.037,.111),
    (.032,.051,.001,.034,.091),(.059,.055,.001,.030,.073),
    (.088,.056,.002,.028,.063),(.112,.052,.004,.029,.058),
    (.133,.040,.009,.032,.054),(.147,.023,.015,.035,.050),
    (.152,.006,.024,.038,.044)]
def sole(name,bottom,top,col):
    rings=[]
    for x,w,b,s,h in profile:
        lo,hi=bottom(b,s),top(b,s)
        rings.append([(x,-w*.96,lo),(x,-w,(lo+hi)/2),(x,-w*.97,hi),
                      (x,w*.97,hi),(x,w,(lo+hi)/2),(x,w*.96,lo)])
    return skins(name,rings,col)

def shoe_template(light):
    global batch
    batch='NBMegaGangnamFootwear'
    start={k:len(v) for k,v in pieces.items()}
    sole('분할 고무 밑창',lambda b,s:b,lambda b,s:b+.007,'outsole')
    sole('곡면 폼 중창',lambda b,s:b+.006,lambda b,s:s,'foam' if not light else 'ivory')
    rings=[]
    for x,w,b,s,h in profile:
        rings.append([(x,w*.96*cos(pi*j/12),s+(h-s)*sin(pi*j/12)**.70) for j in range(13)])
    knit(smooth(skins('통기성 메시 갑피',rings,'mesh' if not light else 'linen')),30)
    def panel(name,pts,sg,col):
        verts=[(x,sg*y,z) for x,y,z in pts]
        return part(name,verts,[tuple(range(len(pts)))],col)
    for sg in [-1,1]:
        # Independent strips wrap each face of the two-tone midsole and upper.
        panel('뒤꿈치 ENCAP 지지대',[(-.146,.039,.046),(-.124,.047,.050),
              (-.084,.046,.047),(-.043,.042,.025),(-.026,.043,.009),
              (-.060,.044,.015),(-.109,.048,.031),(-.144,.041,.035)],sg,'heel')
        for sl in [(0,7),(6,14)]:
            edge=profile[sl[0]:sl[1]+1]
            panel('발끝과 뒤꿈치 스웨이드 띠',[(x,w*.977,s+.001) for x,w,b,s,h in edge]+
                  [(x,w*.94,s+min(.016,(h-s)*.7)) for x,w,b,s,h in reversed(edge)],sg,'suede' if not light else 'oat')
        panel('은회색 안장 패널',[(-.093,.042,.070),(-.039,.040,.084),(-.016,.029,.108),
             (.066,.047,.061),(.103,.052,.046),(.055,.049,.050),(-.018,.044,.053)],sg,'slate')
        # The slanted low N sits between the eyestay and the raised sole.
        shape=[(-.055,.051),(-.038,.085),(-.029,.086),(-.016,.063),
               (-.004,.089),(.007,.088),(-.011,.049),(-.020,.050),(-.032,.074),(-.043,.050)]
        for scale,depth,col in [(1.12,.048,'white'),(.92,.049,'silver')]:
            panel('반사 N 테두리', [(-.024+(x+.024)*scale,depth,.068+(z-.068)*scale) for x,z in shape],sg,col)
    form('검은 깔창이 보이는 입구',[(-.088,0,.085,.045,.032),(-.088,0,.087,.043,.030)],'ink')
    collar=[(-.088+.049*cos(2*pi*j/24),.032*sin(2*pi*j/24),
             .092+.013*max(0,-cos(2*pi*j/24))+.005*cos(4*pi*j/24)) for j in range(25)]
    tubing('발목 패딩 테두리',collar,.005,'suede')
    tongue=[(-.046,.094),(-.031,.123),(-.018,.133),(.005,.113),(.032,.093),(.059,.074)]
    smooth(skins('패딩 설포',[[(x,-.020,z-.006),(x,-.017,z),(x,.017,z),(x,.020,z-.006)] for x,z in tongue],'slate'))
    for side in [-1,1]:
        tubing('아이렛 스웨이드 패널',[(x,side*.022,z-.006) for x,z in tongue[1:]],.0048,'suede')
    for j in range(4):
        x=-.015+j*.017
        z=.132-(x+.018)*.78
        for side in [-1,1]:
            tubing('평끈 교차',[(x,side*.021,z-.010),(x+.006,0,z+.001),
                 (x+.013,-side*.021,z-.020)],.0023,'white',5)
    for x,w,b,s,h in profile[1:-1:2]:
        for side in [-1,1]:
            skins('밑창 고무 러그',[[(x+dx,side*w*.54+dy,k) for dx,dy in
                  [(-.007,-w*.32),(.007,-w*.25),(.007,w*.32),(-.007,w*.25)]]
                  for k in [b-.001,b+.003]],'charcoal')
    result=[(key,obj) for key,items in pieces.items() for obj in items[start.get(key,0):]]
    for key,obj in result:pieces[key].remove(obj)
    batch='NBMegaGangnamFixtures'
    return result

templates=[shoe_template(False),shoe_template(True)]
def shoe(x,y,z,angle=0,light=False):
    matrix=Matrix.Translation((x,y,z))@Matrix.Rotation(radians(angle),4,'Z')
    for key,src in templates[int(light)]:
        obj=src.copy();gallery.objects.link(obj)
        obj.matrix_world=matrix
        pieces[key].append(obj)

# Ivory panels, pin-mounted shelves and the dark ceiling track line from the
# branch photo. Shelves have a pale top and an independently editable bracket.
place()
for i in range(5):
    x=(i-2)*1.05
    plate('분할 진열벽',x,2.58,.05,1.038,.11,2.54,.012,'cream')
    for side in [-1,1]:
        plate('선반 레일',x+side*.41,2.511,.32,.015,.016,1.86,.001,'steel')
    for j in range(3):
        z=.69+j*.48
        plate('벽걸이 선반',x,2.38,z,.85,.29,.031,.012,'white')
        for side in [-1,1]:
            rod('선반 경사 지지대',(x+side*.32,2.50,z-.12),(x+side*.32,2.29,z),.007,'steel')
        shoe(x-.16,2.35,z+.032,8 if j%2 else -7,(i+j)%3==1)
        if j==0:shoe(x+.18,2.38,z+.032,-24,True)
plate('상단 검정 띠',0,2.54,2.60,5.26,.23,.35,.015,'ink')
label('new balance',0,2.41,2.68,.24,'white')
label('Made in USA',-1.51,2.513,2.28,.133,'charcoal')
label('990v6',1.76,2.513,2.28,.16,'charcoal')

# The photographed island is a pale wood slab with a shadow gap and white
# square-tube staging. Leave open gaps both underneath and between the frames.
plate('검정 걸레받이',1.21,-.12,.015,2.09,1.14,.080,.035,'ink')
plate('단상 목재 상판',1.21,-.12,.096,2.18,1.23,.063,.045,'wood')
for x,h in [(.70,.20),(1.65,.54)]:
    for dx in [-.29,.29]:
        for dy in [-.28,.28]:
            plate('백색 각관 다리',x+dx,-.12+dy,.159,.027,.027,h,.002,'ivory')
        plate('깊이 방향 각관',x+dx,-.12,h+.13,.027,.59,.029,.002,'ivory')
    for dy in [-.28,.28]:plate('단상 테두리',x,-.12+dy,h+.13,.59,.027,.029,.002,'ivory')
    plate('단상 상판',x,-.12,h+.159,.62,.61,.025,.012,'ivory')

def limb(name,points,col):
    rings=[]
    for i,(x,y,z,r) in enumerate(points):
        a=Vector(points[min(i+1,len(points)-1)][:3])-Vector(points[max(0,i-1)][:3])
        q=a.to_track_quat('Z','Y')
        rings.append([Vector((x,y,z))+q@Vector((r*cos(j*pi/7),r*.86*sin(j*pi/7),0)) for j in range(14)])
    return smooth(skins(name,rings,col))

def mannequin(x,y,z,turn,shirt,shorts,bent):
    place(x,y,z,turn)
    for side in [-1,1]:
        dx=.108*side
        knee=dx+side*.025
        foot=dx+side*.042
        fy=-.075 if side==-1 else .075
        limb('무광 마네킹 다리',[(dx,0,.86,.102),(dx,0,.74,.094),(knee,fy*.45,.51,.064),
             (knee,fy*.55,.46,.059),(foot,fy*.76,.34,.065),(foot,fy,.125,.039),(foot,fy,.074,.037)],'marble')
        form('러닝 반바지 밑단',[(dx,0,.655,.117,.127),(dx,0,.687,.120,.129),(dx*.83,0,.903,.128,.131)],shorts,True)
        p=transform@Vector((foot,fy-.035,.002))
        shoe(*p,-90+turn,side==1 and bent)
    form('러닝 셔츠 몸판',[(0,0,.89,.225,.146),(0,.005,.92,.229,.147),
         (0,.014,1.04,.194,.125),(0,.01,1.25,.227,.143),(0,.01,1.36,.238,.129),
         (0,.015,1.42,.145,.091),(0,.016,1.43,.083,.065)],shirt,True)
    for side in [-1,1]:
        # Side panels and curved flatlock seams run from armpit to hem.
        pts=[(side*.174,-.089,.907),(side*.183,-.082,.98),(side*.167,-.078,1.07),
             (side*.206,-.077,1.255),(side*.224,-.066,1.292)]
        tubing('몸판 플랫록 솔기',pts,.003,'slate' if shirt=='blue' else 'oat',5)
        for j in range(2):
            dx=side*(.087+j*.040)
            tubing('옆구리 주름',[(dx,-.132,.909),(dx*.88,-.134,.942),(dx*.65,-.132,.972+j*.026)],
                   .0038,'blue' if shirt=='blue' else 'gold',5)
        tubing('반바지 옆선',[(side*.210,-.018,.866),(side*.222,-.035,.763),(side*.217,-.039,.666)],
               .0045,'ivory' if shorts=='slate' else 'linen',5)
    # A small reflective N on the left chest sits tangent to the fabric.
    for a,b in [((.073,1.265),(.083,1.287)),((.083,1.287),(.093,1.265)),((.093,1.265),(.104,1.287))]:
        rod('가슴 반사 마크',(a[0],-.120,a[1]),(b[0],-.120,b[1]),.0026,'white')
    form('셔츠 둥근 목둘레',[(0,.015,1.418,.096,.078),(0,.015,1.437,.088,.071)],'ivory')
    form('마네킹 목',[(0,.016,1.428,.067,.059),(0,.012,1.52,.061,.058)],'marble')
    form('마네킹 얼굴',[(0,-.008,1.485,.041,.052),(0,-.012,1.51,.069,.079),
         (0,0,1.57,.088,.097),(0,.005,1.65,.092,.096),(0,.014,1.704,.079,.085),
         (0,.016,1.739,.041,.053),(0,.016,1.746,.012,.010)],'marble')
    for side in [-1,1]:
        form('마네킹 귀',[(side*.086,0,1.563,.008,.012),(side*.090,0,1.586,.010,.017),
             (side*.086,0,1.612,.006,.012)],'marble')
    form('마네킹 코',[(0,-.084,1.566,.017,.015),(0,-.098,1.583,.015,.018),
         (0,-.086,1.605,.008,.011)],'marble')
    for side in [-1,1]:
        elbow=(side*.31,.014,1.12)
        wrist=(side*(.19 if bent else .29),-.17 if bent else -.042,1.23 if bent else .925)
        limb('마네킹 팔',[(side*.197,0,1.338,.074),(side*.253,0,1.286,.068),
             (*elbow,.047),(*wrist,.033),(wrist[0],wrist[1]-.027,wrist[2]-.055,.041),
             (wrist[0],wrist[1]-.028,wrist[2]-.097,.020)],'marble')
        limb('반소매',[(side*.175,.007,1.356,.089),(side*.228,.005,1.329,.095),
             (side*.276,.002,1.222,.084)],shirt)
    if bent:
        form('러닝 캡 크라운',[(0,.008,1.636,.098,.105),(0,.009,1.686,.095,.098),
            (0,.014,1.748,.051,.058),(0,.014,1.754,.013,.012)],'ivory')
        form('러닝 캡 챙',[(0,-.097,1.642,.085,.076),(0,-.096,1.65,.086,.076)],'ivory')
    place()
mannequin(.70,-.12,.384,-11,'blue','slate',False)
mannequin(1.65,-.12,.724,12,'gold','ivory',True)

# The photo shows exposed black rails and rows of small directional heads
# over the mezzanine-height sales floor, rather than a continuous fascia.
for tx in [-2.18,0,2.18]:
    plate('검정 조명 레일',tx,1.12,2.99,.044,2.98,.054,.006,'ink')
    for ty in [.03,1.23,2.50]:
        rod('스포트 요크',(tx,ty,2.99),(tx,ty,2.91),.014,'steel')
        rod('조명 헤드',(tx,ty,2.92),(tx,ty+.046,2.819),.049,'charcoal')
        rod('조명 렌즈',(tx,ty+.046,2.818),(tx,ty+.05,2.811),.043,'white')
for ty in [-.32,2.55]:
    plate('조명 가로 보',0,ty,3.044,5.22,.056,.046,.006,'charcoal')
# The small suspended brand mark faces the customer as at the branch.
plate('상호 행잉 패널',1.08,-.29,2.64,.76,.043,.36,.024,'ink')
for tx in [.81,1.35]:rod('행잉 와이어',(tx,-.29,2.994),(tx,-.29,3.05),.004,'steel')
label('NB',1.08,-.314,2.692,.32,'white')

# A rail of short-sleeved tees. Fold channels continue around the rear faces.
def tee(x,y,z,col,angle):
    place(x,y,z,angle)
    def loop(w,d,h):
        return [(w*cos(2*pi*k/32),d*sin(2*pi*k/32)+.008*sin(8*pi*k/32),h+.007*cos(10*pi*k/32)) for k in range(32)]
    knit(smooth(skins('행거 티셔츠', [loop(w,d,h) for w,d,h in
        [(.236,.052,0),(.241,.053,.025),(.219,.047,.26),(.243,.045,.46),
         (.236,.037,.51),(.087,.021,.57)]],col)),9)
    for side in [-1,1]:
        limb('늘어뜨린 반소매',[(side*.19,0,.49,.065),(side*.243,0,.448,.069),(side*.288,0,.352,.078)],col)
    form('시보리 목둘레',[(0,0,.561,.078,.029),(0,0,.577,.073,.023)],col)
    tubing('옷걸이 고리',[(0,0,.57),(0,0,.63),(.018,0,.65),(.041,0,.638),(.042,0,.621)],.0038,'steel')
    place()
for x in [-2.26,-1.06]:
    plate('행거 발판',x,.05,.035,.115,.66,.037,.015,'steel')
    rod('의류 행거 기둥',(x,.05,.073),(x,.05,1.55),.016,'steel')
rod('브러시드 행거 봉',(-2.29,.05,1.55),(-1.03,.05,1.55),.019,'silver')
for i,col in enumerate(['orange','cream','cream','ivory','blue','ivory','pink','pink']):
    tee(-2.20+i*.149,.05,.914,col,-56 if i<7 else -28)

# Angled feature sample with space to look at both sides and the toe.
plate('견본 테이블 받침',-.48,-.93,.014,.66,.53,.045,.035,'ink')
plate('견본 테이블 몸체',-.48,-.93,.059,.57,.45,.79,.022,'wood')
plate('견본 테이블 상판',-.48,-.93,.849,.73,.56,.047,.028,'cream')
shoe(-.48,-.95,.898,-17)
label('990v6',-.48,-1.161,.65,.096,'ink')
for tpl in templates:
    for _,obj in tpl:bpy.data.objects.remove(obj,do_unlink=True)

textiles=[]
for key,objects in list(pieces.items()):
    textiles.extend(o for o in objects if o.data.uv_layers)
    pieces[key]=[o for o in objects if not o.data.uv_layers]
pieces['NBMegaGangnamKnit']=textiles
# Preserve the per-piece tint in the editable source and bake it to vertex
# colour only for the export. The rough knit has its own packed image.
fabric_mats={}
for obj in textiles:
    mesh=obj.data
    mat=mesh.materials[0]
    if mat.name.endswith(' 편직'):continue
    if mat.name not in fabric_mats:
        m=mat.copy();m.name=mat.name+' 편직';fabric_mats[mat.name]=m
        tree=m.node_tree;tex=tree.nodes.new('ShaderNodeTexImage');tex.image=weave
        mix=tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY'
        mix.inputs[0].default_value=1;mix.inputs[1].default_value=m.diffuse_color
        tree.links.new(tex.outputs['Color'],mix.inputs[2])
        tree.links.new(mix.outputs[0],tree.nodes.get('Principled BSDF').inputs['Base Color'])
    mesh.materials[0]=fabric_mats[mat.name]
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
print('Editable mesh pieces',len(gallery.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
for key,objects in pieces.items():
    merged=bpy.data.materials.new(key);merged.use_nodes=True
    tree=merged.node_tree;shader=tree.nodes.get('Principled BSDF')
    metal=key.endswith('Hardware');shader.inputs['Roughness'].default_value=.33 if metal else .82
    shader.inputs['Metallic'].default_value=.51 if metal else 0
    if key.endswith('Knit'):
        node=tree.nodes.new('ShaderNodeTexImage');node.image=weave
    else:
        node=tree.nodes.new('ShaderNodeVertexColor');node.layer_name='Finish'
    tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        mesh=obj.data
        if not mesh.color_attributes.get('Finish'):
            rgba=mesh.materials[0].diffuse_color[:]
            attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for item in attr.data:item.color=rgba
            mesh.materials.clear();mesh.materials.append(merged)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join();bpy.context.object.name=key
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',
    export_animations=False,**({'export_vertex_color':'ACTIVE'} if bpy.app.version >= (4,2,0) else {}))
