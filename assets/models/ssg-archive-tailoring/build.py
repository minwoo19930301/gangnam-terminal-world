"""Build the Paul Smith Gangnam menswear vignette. Metres, customer side -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery=bpy.data.collections.new('SSG_6F_PAUL_SMITH')
bpy.context.scene.collection.children.link(gallery)
transform=Matrix.Identity(4)
prefix=''
pieces={}
materials={}
fixtures='PaulSmithGangnamScreens'
tailoring='PaulSmithGangnamTailoring'
batch=fixtures
def linear(c):
    s = int(c,16)/255
    return s/12.92 if s < .04045 else ((s+.055)/1.055)**2.4

def finish(name):
    if name not in materials:
        rgb = name
        m = bpy.data.materials.new(name)
        m.diffuse_color = (*[linear(rgb[i:i+2]) for i in (0,2,4)],1)
        m.use_nodes = True
        node=m.node_tree.nodes.get('Principled BSDF')
        node.inputs['Base Color'].default_value=m.diffuse_color
        node.inputs['Roughness'].default_value=.65
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

navy='26304B'
ink='20242C'
brass='B08D58'
walnut='6E493B'
ivory='F3E7C6'
cobalt='172858'
mustard='E3BB45'
teal='07594E'
wine='8E1735'
orange='D26139'
cream='E8DFC7'
stripe=['CA5E36','D4A947','40956C','80BACA','C48197','4D3037']

def round_body(name, sections, col, segments=20, pleat=0):
    rings=[]
    for x,y,z,rx,ry in sections:
        ring=[]
        for i in range(segments):
            t=2*pi*i/segments
            amount=1+pleat*cos(6*t+.6*z)
            ring.append((x+rx*cos(t)*amount,y+ry*sin(t)*amount,z))
        rings.append(ring)
    ob=skins(name,rings,col)
    for face in ob.data.polygons:
        face.use_smooth=len(face.vertices)==4
    return ob

def patch(name,points,col):
    # Two faces and a narrow edge let lapels and pockets read from profile.
    return skins(name,[points,[(x,y-.003,z) for x,y,z in points]],col)

def jacket(x,y,z,angle,col,shirt,serial):
    global batch,prefix
    prefix='재킷 %02d · '%serial
    place(x,y,z,angle)
    batch=fixtures
    pipe('황동 고리',[(0,0,.84),(0,0,.92),(.016,0,.95),(.039,0,.954),(.054,0,.936),(.054,0,.919)],.004,brass)
    pipe('옷걸이',[(-.213,0,.75),(-.08,0,.807),(0,0,.844),(.08,0,.807),(.213,0,.75)],.014,walnut)
    batch=tailoring
    # Narrow waist, sloped shoulder, cutaway quarters and a raised collar.
    round_body('재킷 몸판',[(0,0,.04,.187,.073),(0,0,.065,.204,.081),
      (0,.004,.19,.205,.076),(0,.004,.38,.18,.08),(0,0,.59,.20,.099),
      (0,.004,.70,.218,.094),(0,.007,.757,.219,.067),
      (0,.009,.788,.148,.058),(0,.003,.817,.074,.045)],col,26,.025)
    patch('셔츠 앞섶',[(-.085,-.034,.805),(.078,-.036,.807),(.103,-.085,.703),
      (.019,-.115,.479),(-.095,-.084,.699)],shirt)
    for side in [-1,1]:
        s=side
        sleeve=round_body('두 장 소매',[(s*.219,-.034,.076,.054,.048),
            (s*.224,-.032,.111,.056,.05),(s*.237,-.022,.33,.06,.064),
            (s*.236,-.016,.39,.061,.064),(s*.225,.004,.51,.068,.071),
            (s*.207,.015,.661,.081,.082),(s*.198,.014,.726,.069,.074),
            (s*.184,.012,.755,.043,.045)],col,14,.04)
        lapel=[(.062,-.039,.811),(.141,-.060,.767),(.107,-.076,.72),
               (.159,-.078,.727),(.127,-.092,.669),(.021,-.104,.448),(.058,-.103,.644)]
        lapel_color=''.join(f'{min(255,int(col[i:i+2],16)+10):02X}' for i in (0,2,4))
        patch('노치 라펠',[(s*a,b-.008,c) for a,b,c in lapel],lapel_color)
        pocket=[(.095,-.069,.31),(.185,-.044,.32),(.183,-.050,.286),(.091,-.078,.275)]
        patch('플랩 포켓',[(s*a,b-.012,c) for a,b,c in pocket],col)
        for j in range(4):
            rod('소맷단 단추',(s*.263,-.045,.105+j*.014),(s*.268,-.047,.105+j*.014),.0065,ink)
    for h in [.375,.475]:
        rod('앞단추',(.018,-.082,h),(.018,-.102,h),.009,ink)
    pipe('뒷솔기',[(0,.079,.05),(0,.087,.38),(0,.101,.61),(0,.063,.775)],.0028,col)
    patch('가슴 웰트',[(-.17,-.064,.598),(-.086,-.088,.613),(-.086,-.089,.624),(-.17,-.068,.61)],col)
    prefix=''
    batch=fixtures
    place()

# Folding display photographed in the branch window. Offset each hinged leaf.
def screen(x,y,angle,w,col):
    place(x,y,0,angle)
    plate('병풍 면',0,0,.085,w,.072,2.30,.012,col)
    for dx in [-w/2,w/2]:
        plate('호두나무 세로틀',dx,-.005,.035,.047,.099,2.40,.009,walnut)
        for h in [.27,1.96]:
            rod('경첩',(dx,-.055,h),(dx,-.055,h+.10),.013,brass)
    for h in [.073,2.347]:
        plate('병풍 가로틀',0,-.012,h,w,.094,.054,.008,walnut)
    place()

screen(-2.32,-.23,16,.98,mustard)
screen(-1.30,-.24,-16,1.15,ivory)
screen(-.24,-.27,16,1.05,'EBE2CC')
# The timber frame carries a face-out garment between the cream leaves.
for x in [-.66,.12]:
    rod('독립 행거 기둥',(x,-.65,.02),(x,-.65,2.15),.018,brass)
    plate('행거 받침',x,-.65,.015,.17,.37,.025,.014,brass)
rod('정면 행거',(-.67,-.65,2.14),(.13,-.65,2.14),.018,brass)
jacket(-.28,-.66,1.205,-6,navy,'ADC4D3',1)

# Pale textile runner, inset bands as in the entrance photograph.
plate('회백색 줄무늬 러그',0,-1.61,.025,6.03,3.98,.014,.018,'CCC7C3')
for i in range(33):
    x=-2.91+.182*i
    half_width=.032 if i%3 else .0485
    part('러그 직조 띠',[(x-half_width,-3.595,.041),(x+half_width,-3.595,.041),
         (x+half_width,.375,.041),(x-half_width,.375,.041)],[(0,1,2,3)],
         'BAB7B7' if i%3 else 'E1DDDA')

# Lacquered returns and the right-hand wall rail.
for x,col in [(-3.05,teal),(3.05,wine)]:
    plate('옻칠 색면',x,-.80,.012,.14,2.12,2.94,.018,col)
plate('남색 상부 띠',0,.04,2.64,6.15,.50,.36,.014,cobalt)
plate('황동 몰딩',0,-.22,2.985,6.16,.023,.027,.006,brass)
# A small, slanted brand inscription on the navy fascia.
font=bpy.data.curves.new('상호 글자','FONT')
font.body='Paul Smith'
font.resolution_u=5
font.align_x='CENTER'
font.align_y='CENTER'
font.size=.238
font.shear=.20
font.extrude=.0015
label=bpy.data.objects.new('남색 띠 상호',font)
gallery.objects.link(label)
label.location=(0,-.22,2.81)
label.rotation_euler.x=pi/2
bpy.context.view_layer.objects.active=label
label.select_set(True)
bpy.ops.object.convert(target='MESH')
label=bpy.context.object
label.data.materials.append(finish('FFF2D9'))
pieces[fixtures].append(label)
label.select_set(False)
for dx in [-2.49,-.90,.90,2.49]:
    round_body('매입등 테두리',[(dx,-.12,2.627,.074,.074),(dx,-.12,2.642,.08,.08)],brass)
    round_body('매입등 렌즈',[(dx,-.12,2.624,.056,.056),(dx,-.12,2.628,.061,.061)],'FFF5E0')
plate('행거 뒤 청록 패널',1.68,.17,.02,2.55,.10,2.64,.018,teal)
for x in [.62,2.76]:
    rod('행거 수직 지주',(x,-.42,.08),(x,-.42,2.11),.022,brass)
    plate('지주 받침',x,-.42,.018,.22,.41,.055,.012,walnut)
rod('의류 봉',(.61,-.42,2.095),(2.77,-.42,2.095),.021,brass)
plate('상부 선반',1.69,-.18,2.19,2.29,.56,.065,.012,walnut)
for i,col in enumerate(['586575','B7A898','3C3C45','34415D','65594D','9C8875',navy]):
    jacket(.78+.294*i,-.42,1.16,45+i%3*6,col,['CBD2CD','C0CFD4','E7DFCC'][i%3],i+2)

# An orange pedestal beneath the mustard leaf and a rounded display bag.
def pedestal():
    x,y=-2.32,-.94
    round_body('주황 받침',[(x,y,.018,.20,.16),(x,y,.036,.215,.173),(x,y,.057,.195,.155)],orange)
    rod('기둥',(x,y,.048),(x,y,.57),.037,orange)
    round_body('주황 타원 상판',[(x,y,.546,.34,.218),(x,y,.562,.367,.234),(x,y,.60,.365,.235),(x,y,.61,.35,.223)],orange,32)
    place(x,y,.612,-12)
    col='275F48'
    round_body('손가방 몸판',[(0,0,0,.135,.06),(0,0,.025,.153,.072),
        (0,0,.133,.14,.063),(0,0,.182,.12,.048),(0,0,.19,.108,.031)],col,24)
    for yy in [-.042,.042]:
        pipe('손잡이',[(-.075,yy,.164),(-.078,yy,.225),(-.047,yy,.258),(0,yy,.27),(.048,yy,.258),(.077,yy,.225),(.075,yy,.164)],.008,col)
        for xx in [-.076,.076]:
            rod('손잡이 고리',(xx,yy-.003,.165),(xx,yy-.008,.165),.012,brass)
    place()
pedestal()

# Upholstered racetrack bench, with individual shallow flutes wrapping the ends.
def bench():
    x,y=-.53,-1.85
    round_body('오토만 하부',[(x,y,.025,.77,.31),(x,y,.095,.82,.34)],walnut,48)
    n=144
    rings=[]
    for z,rx,ry,depth in [(.08,.78,.31,.005),(.12,.835,.355,.015),(.18,.845,.37,.019),
                          (.46,.84,.37,.021),(.50,.82,.355,.012),(.535,.77,.317,.003),
                          (.548,.65,.27,0)]:
        ring=[]
        for j in range(n):
            t=2*pi*j/n
            def superellipse(v):return (1 if v>=0 else -1)*abs(v)**.70
            flute=depth*(1+cos(36*t))/2
            ring.append((x+(rx-flute)*superellipse(cos(t)),y+(ry-flute)*superellipse(sin(t)),z))
        rings.append(ring)
    ob=skins('세로 골 아이보리 오토만',rings,cream)
    for f in ob.data.polygons:f.use_smooth=len(f.vertices)==4
bench()

# Display table with dark blue legs, brass collars and folded V-neck merino.
x,y=1.55,-2.11
plate('진열대 테두리',x,y,.804,1.71,.79,.074,.025,ink)
plate('진열대 상판',x,y,.877,1.64,.73,.016,.013,'52443D')
for dx in [-.78,.78]:
    for dy in [-.315,.315]:
        plate('원색 테이블 다리',x+dx,y+dy,.023,.068,.068,.79,.01,cobalt)
        for z in [.023,.73]:
            plate('황동 다리띠',x+dx,y+dy,z,.071,.071,.048,.008,brass)

def knit(x,y,z,angle,col):
    global batch
    batch=tailoring
    place(x,y,z,angle)
    for h,w,d in [(0,.43,.319),(.025,.448,.328),(.050,.443,.33)]:
        plate('접힌 니트',0,0,h,w,d,.032,.029,col)
    # Recessed neck, knitted edging and narrow stripes along the inside back neck.
    patch('목둘레 안쪽',[(-.114,.122,.083),(.114,.122,.083),(0,-.016,.083)],'373947')
    for i,c in enumerate(stripe):
        pipe('목 안쪽 배색',[(-.107,.109+i*.003,.086),(-.052,.091+i*.003,.087),(0,.086+i*.003,.087),(.052,.092+i*.003,.087),(.107,.109+i*.003,.086)],.002,c)
    pipe('브이넥 시보리',[(-.115,.124,.088),(-.09,.08,.088),(0,-.025,.088),(.09,.08,.088),(.115,.124,.088)],.009,col)
    plate('목 라벨',0,.081,.088,.039,.022,.002,.002,'EEE8D7')
    place()
    batch=fixtures

for i,col in enumerate(['9B6559',navy,'8B8170']):
    for j in range(2 if i!=1 else 3):
        knit(.99+i*.555,-2.14,.895+j*.082,[5,-7,2][i]+j*2,col)

# Fine two-direction twill packed in the library and exported with metre-based UVs.
size=128
grain=bpy.data.images.new('소모사 능직',width=size,height=size)
pixels=[]
for j in range(size):
    for i in range(size):
        v=.92+.034*sin(2*pi*(i+j)/8)+.021*cos(2*pi*i/4)+.01*sin(2*pi*j/4)
        pixels.extend((v,v,v,1))
grain.pixels.foreach_set(pixels)
grain.pack()
for group,objects in pieces.items():
    mat=bpy.data.materials.new(group)
    mat.use_nodes=True
    nodes=mat.node_tree.nodes
    link=mat.node_tree.links.new
    surf=nodes.get('Principled BSDF')
    surf.inputs['Roughness'].default_value=.91 if group==tailoring else .46
    vc=nodes.new('ShaderNodeVertexColor')
    vc.layer_name='색'
    if group==tailoring:
        tex=nodes.new('ShaderNodeTexImage')
        tex.image=grain
        mix=nodes.new('ShaderNodeMixRGB')
        mix.blend_type='MULTIPLY'
        mix.inputs[0].default_value=1
        link(vc.outputs['Color'],mix.inputs[1])
        link(tex.outputs['Color'],mix.inputs[2])
        link(mix.outputs[0],surf.inputs['Base Color'])
    else:
        link(vc.outputs['Color'],surf.inputs['Base Color'])
    for ob in objects:
        me=ob.data
        rgb=me.materials[0].diffuse_color[:3]
        attr=me.color_attributes.new(name='색',type='BYTE_COLOR',domain='POINT')
        for i,v in enumerate(me.vertices):
            shade=1 if group!=tailoring else .98+.04*sin(v.co.x*65+v.co.z*13)
            if '세로 골' in ob.name:
                shade=.85+.14*(1-cos(36*2*pi*(i%144)/144))/2
            attr.data[i].color=(*[min(1,val*shade) for val in rgb],1)
        if group==tailoring:
            uv=me.uv_layers.new(name='직조 방향')
            for f in me.polygons:
                for idx in f.loop_indices:
                    a,b,c=me.vertices[me.loops[idx].vertex_index].co
                    uv.data[idx].uv=((a if abs(f.normal.x)<.75 else b)/.16,(b if abs(f.normal.z)>.72 else c)/.16)
        me.materials.clear()
        me.materials.append(mat)
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
print('EDITABLE PIECES',sum(map(len,pieces.values())))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
for name,objects in pieces.items():
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name=name
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
