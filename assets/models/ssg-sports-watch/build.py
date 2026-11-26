"""Author the Gangnam Garmin display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_8F_Garmin')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
pieces = {}
batch = 'GarminGangnamFixtures'
palette = dict(lime='DCF040', cyan='4ACCDD', glass='101C28', paper='F2F1ED',
    cement='BBBAB4', basalt='545458', slate='787B80', steel='9DA5A6', ink='212526',
    charcoal='34383A', silver='B8C1C6', ivory='E7DBC8', white='F7F2E4',
    grout='99958C', tile='C6C2B6', tile2='C9C5B9')
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
        node.inputs['Roughness'].default_value={'glass':.19,'steel':.30,'silver':.29}.get(name,.57)
        node.inputs['Metallic'].default_value=.52 if name in ['silver','steel'] else 0
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
    ob=bpy.data.objects.new(name,mesh)
    gallery.objects.link(ob)
    mesh.materials.append(finish(color))
    offset = Matrix.Translation(transform.translation)
    mesh.transform(offset.inverted() @ transform)
    ob.matrix_world=offset
    metal = batch=='GarminGangnamWatches' and name.startswith(('티타늄','버클','측면 버튼','러그 나사','러그 핀'))
    pieces.setdefault('GarminGangnamMetal' if metal else batch,[]).append(ob)
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

def disk(name,x,y,z,profile,col,n=40):
    # Turn a stepped case profile about the dial normal, in the XZ plane.
    rings=[[(x+r*cos(i*2*pi/n),y+dep,z+r*sin(i*2*pi/n)) for i in range(n)] for r,dep in profile]
    return skins(name,rings,col)

def textplate(word,x,y,z,size,col):
    curve=bpy.data.curves.new(word,'FONT')
    curve.body=word
    curve.align_x='CENTER'
    curve.size=size
    curve.resolution_u=3
    ob=bpy.data.objects.new(word,curve)
    gallery.objects.link(ob)
    mesh=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    obj=bpy.data.objects.new(word,mesh)
    gallery.objects.link(obj)
    matrix=transform @ Matrix.Translation((x,y,z)) @ Matrix.Rotation(pi/2,4,'X')
    offset=Matrix.Translation(matrix.translation)
    mesh.transform(offset.inverted() @ matrix)
    obj.matrix_world=offset
    mesh.materials.append(finish(col))
    pieces.setdefault(batch,[]).append(obj)
    bpy.data.objects.remove(ob,do_unlink=True)

def band_point(t,x,r):
    return (x,-(.031+r)*cos(t),(.034+r)*sin(t))

def strap(col,lining):
    # Solid strips with through-slots and a second colour on the wrist side.
    for side in [-1,1]:
        angles=[side*radians(43+i*3.425) for i in range(41)]
        vertices=[]
        faces=[]
        colors=[]
        for i,t in enumerate(angles):
            for r in [0,.0021]:
                for x in [-.011,-.0047,.0047,.011]:
                    vertices.append(band_point(t,x,r))
        cells={(i,j) for i in range(40) for j in range(3)
               if not (side<0 and j==1 and 3<=i<=34 and i%4 in [2,3])}
        def face(ids,col):
            faces.append(ids);colors.append(col)
        for i,j in sorted(cells):
            a=i*8+j
            for offset,c in [(0,lining),(4,col)]:
                face([a+offset,a+1+offset,a+9+offset,a+8+offset],c)
            for di,dj,b,c in [(0,-1,a,a+8),(0,1,a+1,a+9),(-1,0,a,a+1),(1,0,a+8,a+9)]:
                if (i+di,j+dj) not in cells:face([b,c,c+4,b+4],col)
        obj=part('실리콘 밴드 · 관통 조절구',vertices,faces,col)
        obj.data.materials.append(finish(lining))
        for poly,shade in zip(obj.data.polygons,colors):poly.material_index=int(shade==lining)
    for t in [radians(s*a) for s in [-1,1] for a in range(49,88,5)]:
        for side in [-1,1]:
            points=[band_point(t+dt,side*x,.00218) for dt,x in
                    [(0,.0062),(.012,.0062),(.018,.0104),(.006,.0104)]]
            part('밴드 미세 사선 홈',points,[(0,1,2,3)],'slate' if col=='white' else 'charcoal')
    for x in [-.012,.012]:rod('버클 측면',(x,.031,-.008),(x,.034,.006),.0013,'silver')
    for z,y in [(-.008,.031),(.006,.034)]:rod('버클 가로핀',(-.012,y,z),(.012,y,z),.0013,'silver')
    rod('버클 혀',(0,.034,.006),(0,.033,-.006),.00085,'steel')

def dial_arc(radius,start,end,width,col):
    angle=[radians(start+(end-start)*i/16) for i in range(17)]
    pts=[(r*cos(t),-.03755,r*sin(t)) for t in angle for r in [radius-width,radius]]
    part('화면 예시 · 구간',pts,[(i,i+1,i+3,i+2) for i in range(0,32,2)],col)

def watch(fenix,col):
    strap(col,'slate' if col!='lime' else 'ink')
    housing='ivory' if col=='white' else 'charcoal'
    disk('폴리머 케이스',0,0,0,[(.020,-.021),(.0234,-.023),(.0234,-.032)],housing)
    for sign in [-1,1]:
        for side in [-1,1]:
            x=side*.0136
            rings=[[(x+dx,y,sign*z) for dx,y in [(-w,-.032),(w,-.032),(w,-.020),(-w,-.020)]]
                   for w,z in [(.004,.013),(.0027,.026)]]
            skins('스트랩 러그',rings,housing)
            if fenix:disk('러그 나사',x,-.0325,sign*.021,[(.0015,0),(.0013,-.0005)],'silver',10)
        rod('러그 핀',(-.016,-.022,sign*.025),(.016,-.022,sign*.025),.0011,'steel')
    disk('티타늄 베젤',0,0,0,[(.0233,-.031),(.0238,-.033),(.0231,-.0357),(.020,-.0368)],
         'slate' if fenix or col!='white' else 'silver')
    disk('글라스 가장자리',0,0,0,[(.0204,-.0366),(.0199,-.0372),(.0191,-.0374)],'glass')
    for i in range(24):
        t=i*pi/12
        pts=[(r*cos(t+d),-.03748,r*sin(t+d)) for r,d in
             [(.0195,-.009),(.0195,.009),(.0185,.009),(.0185,-.009)]]
        part('베젤 눈금',pts,[(0,1,2,3)],'silver')
    for side,heights in [(-1,[-.011,0,.011]),(1,[-.010,.010])]:
        for h in heights:
            x=(.023**2-h*h)**.5
            a=(side*(x-.0005),-.027,h);b=(side*(x+.0021),-.027,h*1.09)
            rod('측면 버튼 몸통',a,b,.0025 if fenix else .002,'steel')
            rod('푸셔 캡',b,(b[0]+side*.0006,b[1],b[2]),.00225,'charcoal')
    if fenix:
        dial_arc(.015,32,145,.0011,'silver')
        dial_arc(.015,210,294,.0011,'silver')
        textplate('FENIX PRO',0,-.0377,.004,.0040,'paper')
        for i in range(8):
            h=(2+(i*5)%7)*.0008
            xx=-.008+i*.0022
            part('고도 예시',[(xx,-.0378,-.008),(xx+.0014,-.0378,-.008),(xx+.0014,-.0378,h-.008),(xx,-.0378,h-.008)],[(0,1,2,3)],'silver')
    else:
        dial_arc(.016,40,176,.0018,'cyan')
        dial_arc(.016,190,290,.0018,'lime')
        textplate('965',0,-.0377,-.0045,.0125,'cyan')
    textplate('GARMIN',0,-.0377,-.0139,.0026,'paper')

# The photographed concession is paved in warm grey stone with narrow joints.
for ix in range(5):
    for iy in range(7):
        x=(ix-2)*1.02
        y=1.03-iy*1.01
        plate('체험 공간 바닥 타일',x,y,.024,1.017,1.007,.006,.003,'tile' if (ix+iy)%3 else 'tile2')

# Textured cast-panel island, divisible into family-specific trays.
plate('진열대 금속 걸레받이',.38,-1.89,.026,2.74,.65,.11,.025,'slate')
plate('체험대',.38,-1.89,.136,2.84,.72,.89,.025,'cement')
plate('밝은 상판',.38,-1.89,1.026,2.88,.75,.045,.025,'paper')
for x in [-.59,.36,1.32]:
    for dx in [-.37,.37]:
        for h in [.31,.86]:
            disk('거푸집 원형 자국',x+dx,-2.252,h,[(.011,0),(.009,-.001)],'slate',12)
plate('전면 검정 상호 패널',1.39,-2.256,.136,.80,.013,.89,.010,'charcoal')
textplate('GARMIN',1.39,-2.265,.69,.144,'paper')
for x in [-.10,.85]:plate('패널 줄눈',x,-2.251,.14,.004,.003,.88,.001,'slate')
for x,word in [(-.34,'FORERUNNER 965'),(1.08,'FENIX 7 PRO')]:
    plate('제품군 전시 트레이',x,-1.87,1.071,1.30,.42,.032,.018,'charcoal')
    plate('상품 안내판',x,-1.66,1.102,.52,.018,.115,.006,'basalt')
    textplate(word,x,-1.671,1.14,.045,'paper')
for i,(x,col) in enumerate([(-.78,'lime'),(-.35,'white'),(.08,'ink'),(.67,'ink'),(1.08,'ink'),(1.49,'ink')]):
    plate('개별 체험대',x,-1.91,1.104,.17,.14,.019,.014,'basalt')
    rod('진열 홀더 목',(x,-1.9,1.122),(x,-1.91,1.176),.009,'silver')
    batch='GarminGangnamWatches'
    place(x,-1.918,1.19,[-18,4,20,-24,0,24][i])
    transform=transform @ Matrix.Rotation(radians(-27),4,'X')
    watch(i>=3,col)
    place()
    batch='GarminGangnamFixtures'

# Stepped topographic podium and standing portrait display in the branch photo.
cx,cy=-1.65,-2.23
for k,(scale,h,shade) in enumerate([(1,.075,'paper'),(.91,.064,'cement'),(.77,.064,'slate'),(.60,.064,'basalt')]):
    z=.025+sum([.075,.064,.064,.064][:k])
    rings=[]
    for height in [z,z+h]:
        loop=[]
        for j in range(64):
            t=j*pi/32
            r=1+.115*cos(3*t+.4)+.10*sin(5*t)+.045*cos(7*t)
            loop.append((cx+.76*scale*r*cos(t),cy+.57*scale*r*sin(t),height))
        rings.append(loop)
    skins('등고선 받침',rings,shade)
plate('세로형 전시 화면',cx,cy,.292,.72,.16,1.54,.021,'charcoal')
plate('화면 패널',cx,cy-.084,.442,.637,.013,1.23,.018,'glass')
textplate('GARMIN',cx,cy-.092,.335,.081,'white')
textplate('FORERUNNER 965',cx,cy-.094,1.556,.065,'paper')
# Printed product image represented by a flattened sculptural relief.
batch='GarminGangnamWatches'
place(cx,cy-.12,1.02)
transform=transform @ Matrix.Diagonal((9.1,.65,10,1)) @ Matrix.Rotation(radians(15),4,'Y') @ Matrix.Rotation(radians(-16),4,'Z')
watch(False,'lime')
place()
batch='GarminGangnamFixtures'
# Dark two-tier illuminated back display and a side wordmark on cement panels.
plate('벽면 하부장',.05,1.23,.025,4.74,.46,.60,.018,'basalt')
plate('매장 뒷벽',.05,1.40,.625,4.74,.12,1.51,.012,'charcoal')
for h in [.628,1.22,1.79]:
    plate('벽선반',.70,1.17,h,3.18,.4,.043,.009,'paper')
for i in range(3):
    plate('콘크리트 사인 모듈',-2.03+i*.39,1.08,.63,.388,.16,1.48,.008,'cement')
textplate('GARMIN',-1.64,.991,1.65,.256,'paper')
for j,h in enumerate([.673,1.265]):
    for i in range(5):
        x=-.54+i*.61
        plate('벽면 받침',x,1.1,h,.15,.16,.033,.013,'basalt')
        rod('견본 홀더',(x,1.1,h+.033),(x,1.1,h+.079),.008,'steel')
        place(x,1.10,h+.088,(-1)**i*12)
        transform=transform @ Matrix.Rotation(radians(-21),4,'X')
        batch='GarminGangnamWatches'
        watch(i>=3,['white','lime','ink'][i%3] if i<3 else 'ink')
        place()
        batch='GarminGangnamFixtures'

bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
for group,objects in pieces.items():
    bpy.ops.object.select_all(action='DESELECT')
    material=bpy.data.materials.new(group)
    material.use_nodes=True
    shader=material.node_tree.nodes.get('Principled BSDF')
    colors=material.node_tree.nodes.new('ShaderNodeVertexColor')
    colors.layer_name='Finish'
    material.node_tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value=.28 if group.endswith('Metal') else .56
    shader.inputs['Metallic'].default_value=.46 if group.endswith('Metal') else 0
    for ob in objects:
        mesh=ob.data
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
        for poly in mesh.polygons:
            rgba=mesh.materials[poly.material_index].diffuse_color
            for i in poly.loop_indices:attr.data[i].color=rgba
        mesh.materials.clear();mesh.materials.append(material)
        ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join();bpy.context.object.name=group
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False,export_texcoords=False)
