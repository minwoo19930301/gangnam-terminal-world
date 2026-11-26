"""Author the Gangnam Arc'teryx outdoor fixtures in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_8F_Arcteryx')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
palette = {
    'chalk':'E8E5DE','basalt':'555554','granite':'928A82','steel':'A6A8A5',
    'ink':'202527','rubber':'2A2A2C','tread':'424449','cord':'464B49',
    'moss':'85856C','copper':'B65330','gold':'F7AB31','lime':'BECF48',
    'snow':'DFDDD1','ice':'C3D7F1','nylon':'3E4642','blue':'536B78',
    'oak':'B8A282','seam':'626969','silver':'C4C6C1','sand':'B7A693',
    'light':'F3F2E2','red':'A52D2E','stone0':'989086','stone1':'A59A8C',
    'stone2':'8C847A','stone3':'A09891'
}
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
        node.inputs['Roughness'].default_value=.49
        materials[name]=m
    return materials[name]

def part(name, vertices, faces, color, bevel=0):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    bm=bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    if bevel and not prefix:
        edges=[e for e in bm.edges if e.is_manifold and e.calc_face_angle()>.4]
        bmesh.ops.bevel(bm,geom=edges,offset=bevel,segments=2,affect='EDGES',clamp_overlap=True)
    bm.to_mesh(mesh)
    bm.free()
    ob=bpy.data.objects.new(prefix+name,mesh)
    gallery.objects.link(ob)
    mesh.materials.append(finish(color))
    ob.matrix_world=transform.copy()
    pieces.setdefault('ArcOutdoorEquipment' if prefix else 'ArcOutdoorFixtures',[]).append(ob)
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
        steps=2 if prefix else 4
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

def lettering(body,x,y,z,size,col,bold=False):
    font=bpy.data.curves.new(body,'FONT')
    font.body=body
    font.size=size
    font.align_x='CENTER'
    font.resolution_u=3
    fontfile='Arial Bold.ttf' if bold else 'AppleGothic.ttf'
    font.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/'+fontfile,check_existing=True)
    obj=bpy.data.objects.new(body,font)
    gallery.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    text=bpy.data.objects.new(body,mesh)
    gallery.objects.link(text)
    text.matrix_world=obj.matrix_world.copy()
    mesh.materials.append(finish(col))
    pieces.setdefault('ArcOutdoorFixtures',[]).append(text)
    bpy.data.objects.remove(obj,do_unlink=True)

# All product parts live in local coordinates so the source can be rearranged.
def pose(name,x=0,y=0,z=0,angle=0,tilt=0):
    global transform,prefix
    prefix=name
    transform=(Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(angle),4,'Z')
               @ Matrix.Rotation(radians(tilt),4,'X'))

def line(name,points,r,col):
    for a,b in zip(points,points[1:]):
        rod(name,a,b,r,col)

def ring(cx,cy,z,rx,ry,n=18):
    return [(cx+rx*cos(j*2*pi/n),cy+ry*sin(j*2*pi/n),z) for j in range(n)]

def ribbon(name,path,width,color):
    return skins(name,[[(x-width/2,y-.004,z),(x+width/2,y-.004,z),
                        (x+width/2,y+.004,z),(x-width/2,y+.004,z)] for x,y,z in path],color)

def pack(x,y,z,angle,col):
    pose('알파 배낭 · ',x,y,z,angle)
    body=[(.01,.133,.089),(.05,.158,.108),(.18,.174,.121),
          (.39,.174,.118),(.49,.161,.109),(.55,.145,.087)]
    skins('방수 원단 몸판',[ring(0,0,h,w,d) for h,w,d in body],col)
    skins('조임 덮개',[ring(0,.003,h,w,d) for h,w,d in
                      [(.529,.154,.102),(.553,.145,.092),(.574,.078,.054),(.568,.036,.026)]],col)
    ribbon('상단 압축 스트랩',[(0,.089,.52),(0,.06,.566),(0,-.04,.578),(0,-.105,.54),(0,-.119,.48)],.022,'ink')
    for side in (-1,1):
        ribbon('등판 어깨 패드',[(side*.064,.075,.538),(side*.09,.134,.51),
                  (side*.116,.197,.408),(side*.113,.215,.266),(side*.096,.177,.172)],.052,'ink')
        ribbon('길이 조절 끈',[(side*.096,.177,.174),(side*.139,.092,.082)],.019,'cord')
        line('측면 세로 봉제선',[(side*w*.84,-d*.53,h) for h,w,d in body],.0026,'seam')
        for k in range(3):
            xx=side*(.105+.009*k); zz=.115+k*.129
            line('번지 고정 고리',[(xx-side*.013,-.098,zz-.009),(xx,-.102,zz),(xx+side*.012,-.084,zz+.01)],.004,'silver')
        line('전면 탄성 코드',[(side*.106,-.097,.115),(0,-.123,.178),(-side*.113,-.093,.244),(0,-.122,.308),(side*.123,-.086,.373)],.0039,'ink')
        ribbon('허리 벨트',[(side*.13,.066,.09),(side*.174,.119,.082),(side*.145,.166,.07)],.025,'ink')
    line('손잡이',[(-.043,.063,.542),(-.045,.08,.605),(.042,.08,.609),(.045,.063,.542)],.009,'ink')
    line('포켓 지퍼',[(-.101,-.097,.445),(.011,-.121,.456),(.097,-.099,.465)],.004,'ink')
    line('지퍼 손잡이',[(.093,-.103,.463),(.111,-.12,.421)],.003,'silver')
    plate('압축 버클',0,-.12,.479,.033,.014,.024,.004,'ink')
    pose('')

def shoe(x,y,z,angle,col,tilt=0):
    pose('컨실 접근화 · ',x,y,z,angle,tilt)
    # Stations run from toe to heel. Rising toe spring and a narrower arch
    # change both the profile and the silhouette of the exposed lugged sole.
    stations=[(-.158,.021,.014,.037),(-.144,.049,.007,.055),(-.105,.055,0,.067),
              (-.06,.052,0,.079),(-.012,.045,.004,.099),(.04,.039,.011,.119),
              (.086,.044,.009,.113),(.132,.041,.004,.109),(.146,.024,.006,.098)]
    def section(y,w,lo,hi):
        return [(-w*.73,y,lo),(-w,y,lo+.008),(-w*.97,y,hi*.64+lo*.36),
                (-w*.70,y,hi-.004),(0,y,hi),(w*.70,y,hi-.004),
                (w*.97,y,hi*.64+lo*.36),(w,y,lo+.008),(w*.73,y,lo)]
    skins('고무 밑창',[section(t,w,b+.006,b+.030) for t,w,b,h in stations],'rubber')
    skins('감싸 올라오는 랜드',[section(t,w*.99,b+.025,max(.044,h*.60)) for t,w,b,h in stations],'ink')
    skins('누벅 갑피',[section(t,w*.89,max(.036,h*.51),h) for t,w,b,h in stations],col)
    skins('발목 입구',[ring(0,.095,.112,.031,.039),ring(0,.095,.116,.028,.036),
                      ring(0,.095,.109,.024,.032)],'rubber')
    skins('안창',[ring(0,.095,.111,.025,.033)],'ink')
    for i in range(5):
        t=-.086+i*.022;h=.073+i*.0074
        for side in (-1,1):
            line('교차 신끈',[(side*.028,t,h-.006),(-side*.021,t+.019,h+.005)],.0027,'snow')
    line('뒤축 당김 고리',[(-.014,.137,.099),(-.006,.153,.139),(.009,.147,.139),(.016,.133,.101)],.0033,'cord')
    for i in range(8):
        t=-.111+i*.032; base=.008 if i in (4,5) else .003
        for side in (-1,1):
            xx=side*(.027 if i<4 else .021)
            points=[(xx+side*dx,t+dy) for dx,dy in [(-.009,-.010),(.010,-.007),(.011,.009),(.002,.015),(-.008,.004)]]
            skins('갈고리형 접지 돌기',[[(a,b,h) for a,b in points] for h in [base,base+.010]],'tread')
    skins('밑창 중앙 표식',[ring(0,.032,.009,.010,.016,8),ring(0,.032,.012,.010,.016,8)],'gold')
    pose('')

def carabiner(x,y,z,angle,col):
    pose('장비 걸이 · ',x,y,z,angle)
    p=[(-.027,0,.025),(-.034,0,.064),(-.028,0,.085),(.006,0,.093),
       (.024,0,.084),(.024,0,.069)]
    line('비대칭 금속 프레임',p,.005,col)
    line('하단 곡선',[p[0],(-.019,0,.006),(-.002,0,.005),(.011,0,.017)],.005,col)
    rod('직선 게이트',(.011,0,.017),(.024,0,.069),.004,'silver')
    rod('잠금 나사',(.016,0,.036),(.021,0,.055),.0075,'ink')
    pose('')

# Irregular triangular quarry facets, with deterministic mineral variation.
import random
rng=random.Random(83)
def rock(name,cx,cy,z,w,d,h):
    n=18
    footprint=[(cos(i*2*pi/n)*(1+rng.uniform(-.08,.08)),sin(i*2*pi/n)*(1+rng.uniform(-.10,.10))) for i in range(n)]
    rings=[]
    for layer,(rise,width) in enumerate([(0,.64),(.35,.79),(.76,.98),(1,1)]):
        rings.append([(cx+a*w*.5*width+rng.uniform(-.023,.023),cy+b*d*.5*width,
                       z+h*rise+(rng.uniform(-.035,.035) if layer in (1,2) else 0)) for a,b in footprint])
    for k in range(3):
        for i in range(n):
            j=(i+1)%n;a,b,c,e=rings[k][i],rings[k][j],rings[k+1][j],rings[k+1][i]
            for tri in [(a,b,c),(a,c,e)]:
                part(name,tri,[(0,1,2)],'stone'+str(rng.randrange(4)))
    part('석재 상판',rings[-1],[list(range(n))],'sand')

# Back mount, its thin steel standards and two open-sided accessory shelves.
plate('암회색 후면',0,2.51,.02,4.74,.105,2.72,.03,'basalt')
plate('밑받침',0,2.30,.03,4.72,.42,.16,.03,'granite')
lettering("ARC'TERYX",-.50,2.449,2.35,.27,'light',True)
for x in [-2.02,-1.03,-.03,.90]:
    plate('수직 레일',x,2.435,.36,.030,.04,1.65,.003,'steel')
for z in [.72,1.52]:
    plate('배낭 선반',-.56,2.24,z,3.18,.40,.045,.017,'oak')
    for x in [-1.89,-.52,.78]:
        line('삼각 선반 받침',[(x,2.415,z-.19),(x,2.08,z),(x,2.415,z)],.012,'ink')
for i,col in enumerate(['nylon','moss','copper','blue','ink','lime']):
    pack(-1.70+(i%3)*.92,2.22,.765+(i//3)*.80,[-11,14,167,8,-13,17][i],col)
# Photographed pale blue recessed footwear panel with paired individual ledges.
plate('신발 벽 테두리',1.69,2.37,.19,1.24,.19,2.45,.026,'chalk')
plate('연청색 신발 패널',1.69,2.255,.24,1.13,.056,2.34,.017,'ice')
for row in range(5):
    for j in range(2):
        xx=1.4+j*.54;zz=.42+row*.41
        plate('개별 신발 받침',xx,2.125,zz,.39,.25,.026,.016,'chalk')
        shoe(xx,2.115,zz+.027,-70 if j==0 else -65,['ink','moss','blue','snow','nylon'][(row+j)%5])
# Stone island from the store photograph, with equipment on its top.
rock('중앙 석재 진열대',-.89,-.67,.025,1.47,1.71,.82)
pack(-1.04,-.36,.845,-23,'copper')
shoe(-.68,-1.07,.849,-52,'moss')
plate('밑창 견본 받침',-.96,-1.04,.846,.19,.15,.025,.02,'ink')
shoe(-.96,-1.04,1.004,16,'moss',-76)
# Small, open hardware standard with hanging slings and screwgate samples.
for x in [.09,.57]:
    rod('소품 진열 다리',(x,1.99,.77),(x,1.99,1.34),.014,'steel')
rod('소품 가로대',(.09,1.99,1.34),(.57,1.99,1.34),.014,'steel')
for i,col in enumerate(['gold','copper','silver','blue','lime']):
    x=.13+i*.099; drop=.15+.024*(i%3)
    line('봉제 슬링',[(x-.018,1.99,1.345),(x-.021,1.965,1.34-drop),
         (x,1.962,1.33-drop),(x+.016,1.963,1.34-drop),(x+.013,1.99,1.345)],.005,col)
    carabiner(x,1.958,1.247-drop,9-i*4,col)
# Slim side rail and saturated technical shells visible in the 2023 photograph.
for yy in [-.94,1.74]:
    line('옆 벽 진열 프레임',[(-2.43,yy,.10),(-2.43,yy,2.31),(-2.08,yy,2.31),(-2.08,yy,2.16)],.018,'ink')
rod('재킷 봉',(-2.08,-.94,2.16),(-2.08,1.74,2.16),.014,'steel')
for j,col in enumerate(['lime','ink','red','copper','sand','blue','lime','nylon']):
    pose('방수 재킷 · ',-2.08,-.66+j*.297,1.10,40)
    line('옷걸이',[(-.18,0,.90),(0,0,.985),(.18,0,.90)],.011,'oak')
    line('옷걸이 고리',[(0,0,.985),(0,0,1.047),(.012,0,1.076),(.031,0,1.077),(.042,0,1.058)],.005,'steel')
    skins('재킷 몸판',[ring(0,0,h,w,d,12) for h,w,d in
          [(.21,.171,.070),(.26,.177,.073),(.48,.156,.068),(.72,.187,.083),
           (.85,.206,.071),(.91,.13,.052),(.927,.072,.052)]],col)
    for side in (-1,1):
        skins('입체 소매',[ring(side*x,y,h,w,d,10) for x,y,h,w,d in
              [(.246,-.055,.277,.046,.041),(.262,-.038,.47,.051,.045),
               (.233,.006,.61,.066,.060),(.195,.003,.81,.075,.070),(.168,0,.855,.059,.058)]],col)
        line('옆 주머니 지퍼',[(side*.125,-.056,.45),(side*.096,-.063,.59)],.004,'cord')
    skins('후드',[ring(0,.024,h,w,d,12) for h,w,d in
          [(.86,.111,.077),(.93,.102,.077),(1.003,.086,.058),(1.025,.048,.031)]],col)
    line('재킷 앞지퍼',[(0,-.071,.218),(0,-.070,.47),(0,-.085,.73),(0,-.071,.85),(0,-.056,.92)],.004,'ink')
    pose('')

# Fitting bench: shaped ash slats on two bent steel sleds; inset lacing stool.
for x in [1.02,1.91]:
    line('벤치 썰매 다리',[(x,-.82,.43),(x,-.84,.055),(x,-.81,.034),(x,-.39,.034),(x,-.37,.055),(x,-.39,.43)],.022,'ink')
for i in range(5):
    plate('물푸레 좌판',1.466,-.825+i*.109,.414,1.22,.095,.047,.031,'oak')
plate('피팅 발받침',1.47,-1.12,.030,.46,.28,.079,.032,'basalt')
for i in range(7):
    plate('미끄럼 방지 골',1.47,-1.218+i*.031,.109,.39,.011,.008,.004,'rubber')
shoe(1.77,-.62,.462,-39,'blue')

bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# Copy per-part finishes into vertex colours before joining runtime draw batches.
for batch,objects in pieces.items():
    merged=bpy.data.materials.new(batch)
    merged.use_nodes=True
    nodes=merged.node_tree.nodes
    shader=nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=.34 if batch=='ArcOutdoorEquipment' else .68
    colors=nodes.new('ShaderNodeVertexColor'); colors.layer_name='Finish'
    merged.node_tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        mesh=obj.data
        rgba=mesh.materials[0].diffuse_color[:]
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        for item in attr.data: item.color=rgba
        mesh.materials.clear(); mesh.materials.append(merged)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
