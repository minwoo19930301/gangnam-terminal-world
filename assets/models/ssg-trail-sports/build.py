"""Author the Gangnam Salomon trail fixtures in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_8F_Salomon')
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
        if name=='diffuser':
            node.inputs['Emission Color'].default_value=m.diffuse_color
            node.inputs['Emission Strength'].default_value=.8
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
    batch = 'SalomonTrailEquipment' if prefix else 'SalomonTrailFixtures'
    if color=='diffuser': batch='SalomonTrailDiffusers'
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
    # The laces and sole lugs project to only a few pixels even at the shoe wall.
    segments = 5 if prefix and r < .007 else 8
    ring = [q @ Vector((r*cos(2*pi*t/segments), r*sin(2*pi*t/segments), 0))
            for t in range(segments)]
    tube = skins(name, [[p+v for v in ring] for p in (a, b)], col)
    for face in tube.data.polygons:
        if len(face.vertices) == 4:
            face.use_smooth = True
    return tube

def lettering(body,x,y,z,size,col,bold=False):
    font=bpy.data.curves.new(body,'FONT')
    font.body=body
    font.size=size
    font.align_x='CENTER'
    font.resolution_u=3
    font.shear=.18
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
    pieces.setdefault('SalomonTrailFixtures',[]).append(text)
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

palette.update(diffuser='F7FAF6',cream='F7F1E5',wood='B27E49',darkwood='805333',mint='B6C3A6',flask='82BBD3',cap='3B7292',berry='967F91',mesh='363B42')
# Mesh upper and chassis follow consecutive transverse foot sections.
def trail(x,y,z,ang,col):
    pose('XT-6 · ',x,y,z,ang)
    stations=[(-.165,.022,.021,.052),(-.143,.048,.008,.063),(-.103,.056,.003,.076),
              (-.055,.053,0,.087),(-.008,.046,.004,.111),(.041,.039,.009,.133),
              (.093,.044,.006,.122),(.135,.04,.005,.122),(.151,.025,.013,.115)]
    def loop(t,w,b,h):
        return [(w*a,t,b+(h-b)*v) for a,v in [(-.83,0),(-1,.22),(-.95,.55),(-.68,.84),(0,1),(.68,.84),(.95,.55),(1,.22),(.83,0)]]
    for name,lo,hi,fac,mat in [('고무 접지창',0,.18,1,'rubber'),('쿠션 중창',.13,.43,1,'chalk'),('망사 갑피',.37,1,.96,col)]:
        skins(name,[loop(t,w*fac,b+(h-b)*lo,b+(h-b)*hi) for t,w,b,h in stations],mat)
    for side in [-1,1]:
        for j in range(4):
            t=-.10+j*.05;h=.07+j*.011
            ribbon('측면 필름 보강',[(side*.045,t,.038),(side*.049,t+.013,.055),(side*.027,t+.034,h)],.008,'silver')
        for j in range(5):
            t=-.092+j*.024;h=.077+j*.008
            rod('퀵레이스', (side*.031,t,h-.008),(-side*.024,t+.023,h+.005),.0028,'ink')
        for k in range(7):
            t=-.123+k*.039
            rod('갈매기 접지 돌기',(side*.038,t,.012),(side*.019,t+.013,.009),.006,'rubber')
    plate('코드 잠금쇠',0,.036,.127,.020,.022,.012,.003,'ink')
    skins('발목 깃',[ring(0,.094,.116,.032,.041),ring(0,.095,.125,.030,.039),ring(0,.096,.119,.023,.032)],'mesh')
    skins('깔창',[ring(0,.096,.118,.023,.032)],'ink')
    pose('')
def vest(x,y,z,angle,col):
    pose('러닝 베스트 · ',x,y,z,angle)
    skins('등판',[ring(0,.068,h,w,d) for h,w,d in [(0,.145,.038),(.08,.178,.045),(.24,.172,.046),(.38,.185,.045),(.46,.14,.034)]],col)
    for s in (-1,1):
        path=[(s*.12,.082,.04),(s*.171,-.013,.045),(s*.132,-.097,.082),(s*.123,-.117,.24),
              (s*.117,-.089,.386),(s*.095,-.039,.479),(s*.099,.040,.49),(s*.113,.09,.435)]
        ribbon('가슴 포켓과 어깨 고리',path,.098,col)
        for k in range(2):
            line('바인딩',[(a+(.045 if k else -.045),b-.006,c) for a,b,c in path],.004,'seam')
        def flask(name,levels,mat):
            skins(name,[ring(s*.124,-.132,h,w,d,12) for h,w,d in levels],mat)
        flask('연질 플라스크',[(.12,.031,.017),(.17,.046,.027),(.286,.040,.025),(.314,.025,.018),(.33,.018,.016)],'flask')
        flask('나사 뚜껑',[(.324,.023,.021),(.343,.023,.021)],'cap')
        flask('바이트 밸브',[(.343,.010,.01),(.375,.008,.008)],'snow')
        flask('포켓',[(.094,.031,.018),(.157,.052,.033),(.243,.051,.034)],col)
        for j in range(6):
            rod('망사 조직',(s*.124-.031+j*.011,-.163,.16),(s*.124-.024+j*.011,-.161,.229),.0017,'seam')
    for s in (-1,1):
        line('가슴 탄성끈',[(s*.075,-.113,.31),(-s*.074,-.126,.208),(s*.073,-.12,.135)],.003,'silver')
    pose('')
# Back-wall footwear shelves with narrow metal lips and ivory centre pier.
plate('벽체',0,.50,0,5.84,.18,2.72,.06,'cream')
for x in [-1.86,-.29]:
    plate('신발 벽 패널',x,.37,.17,1.5,.09,2.27,.023,'granite')
    for j in range(1,15):
        plate('벽면 수평 줄눈',x,.321,.20+j*.148,1.48,.003,.006,.001,'stone2')
    for j in range(5):
        z=.35+.388*j
        plate('금속 선반',x,.16,z,1.47,.43,.029,.012,'steel')
        for i in range(3):
            trail(x+(i-1)*.47,.12,z+.031,-62+i*9,['snow','ink','mint','berry','sand'][(i+j)%5])
plate('흰 기둥',1.64,.32,0,1.88,.35,2.70,.14,'cream')
# The renewal photographs show a modest dark wordmark on a pale backlit face.
plate('워드마크 간접광 받침',1.64,.138,2.095,1.04,.026,.22,.012,'chalk')
plate('워드마크 흰 면',1.64,.122,2.102,1.015,.020,.204,.008,'diffuser')
lettering('SALOMON',1.64,.109,2.14,.195,'ink',True)

# Recessed curved ceiling trim in a single static fixture batch.
for offset,width,z,col in [(0,.14,2.925,'chalk'),(.015,.035,2.920,'diffuser')]:
    strips=[]
    for i in range(41):
        t=i*pi/40
        x=(i/40-.5)*5.52
        y=-.14-1.18*sin(t)+offset
        strips.append([(x,y-width/2,z),(x,y+width/2,z),(x,y+width/2,z+.012),(x,y-width/2,z+.012)])
    skins('곡면 천장 매입띠',strips,col)

for x in [1.08,2.18]:
    plate('목재 진열 기둥',x,-.05,.1,.065,.08,1.78,.012,'wood')
rod('행거 봉',(1.05,-.06,1.73),(2.22,-.06,1.73),.015,'steel')
for j,col in enumerate(['ink','blue','red']):
    x=1.22+.40*j
    line('옷걸이',[(x-.14,-.06,1.54),(x,-.06,1.74),(x+.14,-.06,1.54)],.009,'wood')
    vest(x,-.08,1.055,8-j*9,col)
plate('흰 곡면 진열대',1.65,-.32,0,1.66,.79,.78,.21,'cream')
trail(1.64,-.45,.78,-46,'mint')
for j in range(15):
    plate('벤치 목재 살',-1.12+j*.046,-1.25,.025,.042,1.36,.43,.009,'darkwood' if j%4==0 else 'wood')
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# Copy per-part finishes into vertex colours before joining runtime draw batches.
for batch,objects in pieces.items():
    merged=bpy.data.materials.new(batch)
    merged.use_nodes=True
    nodes=merged.node_tree.nodes
    shader=nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=.34 if batch=='SalomonTrailEquipment' else .68
    if batch=='SalomonTrailDiffusers':
        shader.inputs['Emission Color'].default_value=finish('diffuser').diffuse_color
        shader.inputs['Emission Strength'].default_value=.8
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
