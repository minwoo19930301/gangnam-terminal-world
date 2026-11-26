"""Author the Gangnam TOEBOX sales fixtures in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_10F_Toebox')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
palette = {
    'chalk':'F5EEE2','linen':'E6DCCB','shell':'D2ADA0','oak':'B28769',
    'walnut':'815C4F','ink':'39343D','steel':'777681','black':'282A30',
    'coral':'DB3C51','raspberry':'E83A81','blush':'F5A5B8','lemon':'DFC06C',
    'teal':'649C96','indigo':'414B72','cream':'EBDCC3','rubber':'E8E5D9',
    'sole':'8D2837','red':'BA2834','clay':'BF7659','mint':'C1D8C8','gold':'C59756',
    'orange':'F28535','white':'FBF8EC','shadow':'60383C','rose':'C98792'
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
    pieces.setdefault('ToeboxFootwear' if prefix else 'ToeboxFixtures',[]).append(ob)
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
    pieces.setdefault('ToeboxFixtures',[]).append(text)
    bpy.data.objects.remove(obj,do_unlink=True)

# Elliptical sections have a broad toe, narrow waist and slightly offset heel.
N=24
def foot_ring(rx,ry,cy,z):
    ring=[]
    for i in range(N):
        t=2*pi*i/N
        v=sin(t)
        width=1-.12*v-.09*(1-v*v)
        ring.append((rx*width*cos(t)+.003*v,cy+ry*v,z))
    return ring

def shell(name,sections,col,cap=True):
    return skins(name,[foot_ring(*s) for s in sections],col,cap=cap)

def disk(name,x,y,z,rx,ry,h,color):
    return skins(name,[[(x+rx*cos(i*pi/20),y+ry*sin(i*pi/20),k) for i in range(40)]
                       for k in (z,z+h)],color,min(.004,h*.12))

def bridge(name,cy,halfwidth,height,width,col):
    # A band with its own inner surface, thickness, and two visible edges.
    rings=[]
    for j in range(15):
        t=j*pi/14
        x=halfwidth*cos(t); z=.026+height*sin(t)
        rings.append([(x,cy-width/2,z),(x,cy+width/2,z),
                      (x*1.06,cy+width/2,z+.003),(x*1.06,cy-width/2,z+.003)])
    skins(name,rings,col,.0007)

def shoe(kind,x,y,z,length,width,angle,col):
    global transform,prefix
    prefix=['헌터 장화 · ','씨엔타 천 신발 · ','미니멜리사 젤리 샌들 · '][kind]
    transform=(Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(angle),4,'Z') @
               Matrix.Diagonal((width,length/.17,length/.17,1)))
    solecol=col if kind!=1 else 'rubber'
    shell('바닥창',[(.041,.081,0,.002),(.045,.085,0,.005),(.045,.085,0,.014),
                 (.044,.084,0,.018)],solecol)
    for j in range(8):
        w=.023+.004*cos(j); yy=-.061+j*.017
        skins('접지 무늬', [[(-w,yy,k),(w,yy+.001,k),(w,yy+.006,k),(-w,yy+.005,k)]
                         for k in (.0004,.0025)],solecol)
    if kind==0:
        shell('일체형 고무 몸통과 안감',[(.043,.084,0,.014),(.042,.082,0,.029),
            (.039,.074,.005,.040),(.033,.052,.019,.056),(.031,.037,.035,.078),
            (.033,.038,.035,.12),(.04,.043,.033,.18),(.036,.039,.033,.181),
            (.031,.035,.033,.115)],col)
        shell('윗단 테두리',[(.04,.043,.033,.173),(.041,.044,.033,.177),
            (.041,.044,.033,.183),(.037,.040,.033,.183),(.037,.040,.033,.177)],col,cap=False)
        disk('짙은 안감',.002,.033,.119,.030,.034,.001,'shadow')
        plate('앞면 직조 라벨',0,-.0097,.150,.031,.002,.013,.0007,'chalk')
        for xx in [-.009,-.005,-.001,.003,.007]:
            plate('라벨 직조선',xx,-.0109,.154,.002,.0005,.004,.0002,'ink')
        for side in [-1,1]:
            rod('복사뼈 보강선',(side*.037,-.034,.026),(side*.032,.016,.063),.0013,col)
    elif kind==1:
        shell('둥근 앞코와 열린 갑피',[(.044,.084,0,.016),(.043,.082,.001,.027),
             (.041,.074,.004,.034),(.037,.061,.015,.041),(.031,.052,.018,.044),
             (.029,.049,.018,.039),(.028,.047,.018,.023)],col)
        # U-shaped cut follows the instep. The rear quarter rises behind the heel.
        rings=[]
        for j in range(25):
            t=pi*j/24
            xx=.038*cos(t); yy=.012+.065*sin(t); hh=.046+.025*sin(t)
            rings.append([(xx,yy,.026),(xx*1.04,yy+.001,.027),(xx,yy,hh),(xx*.91,yy-.002,hh)])
        skins('뒤축과 옆면',rings,col)
        disk('깔창',0,.017,.025,.029,.047,.002,'cream')
        bridge('발등 찍찍이 스트랩',.005,.038,.035,.023,col)
        plate('찍찍이 끝 탭',-.038,.005,.033,.009,.027,.013,.004,col)
        for j in range(7):
            rod('스트랩 박음질',(-.027+j*.008,-.003,.030+.029*(1-((j-3)/4)**2)),
                (-.025+j*.008,-.003,.030+.029*(1-((j-3)/4)**2)),.00065,'shell')
        shell('고무 앞코',[(.032,.026,-.056,.018),(.031,.025,-.055,.025),
                           (.027,.020,-.056,.031)],'rubber')
    else:
        disk('깔창',0,.003,.017,.038,.074,.002,'blush')
        for j in range(7):
            t=pi*(j+.35)/7.7
            xx=.043*cos(t); yy=-.014-.069*sin(t)
            stations=[(xx,yy,.016),(xx*.97,yy+.004,.029),
                      (xx*.69,yy*.83,.042),(xx*.38,-.033,.047)]
            vector=Vector((cos(t)*.0028,-sin(t)*.0028,0))
            cross=Vector((sin(t)*.005,cos(t)*.005,0))
            skins('젤리 앞코 살',[[Vector(p)+a*vector+b*cross for a,b in
                  [(-1,-1),(1,-1),(1,1),(-1,1)]] for p in stations],col)
        for side in [-1,1]:
            rod('발목 옆 지지대',(side*.039,.023,.018),(side*.033,.035,.055),.005,col)
        rings=[]
        for j in range(27):
            t=2*pi*j/26
            xx=.035*cos(t); yy=.030+.039*sin(t); hh=.052+.013*sin(t)
            rings.append([(xx,yy,hh),(xx*1.07,.03+(yy-.03)*1.07,hh),
                          (xx*1.07,.03+(yy-.03)*1.07,hh+.012),(xx,yy,hh+.012)])
        skins('발목 띠',rings,col)
        for a,b in [((-.039,.014,.051),(-.039,.034,.051)),((-.039,.014,.066),(-.039,.034,.066)),
                    ((-.039,.014,.051),(-.039,.014,.066)),((-.039,.034,.051),(-.039,.034,.066))]:
            rod('버클',a,b,.0017,'gold')
        disk('고양이 얼굴',0,-.044,.045,.032,.022,.006,col)
        for side in [-1,1]:
            skins('고양이 귀',[[(side*.029,-.043,k),(side*.027,-.011,k),(side*.007,-.027,k)] for k in (.046,.051)],col)
            disk('눈 흰자',side*.013,-.048,.051,.008,.0055,.0016,'white')
            disk('눈동자',side*.013,-.048,.0526,.0024,.004,.001,'ink')
    prefix=''
    transform=Matrix.Identity(4)

# Each inset bay has three shelves, with a wider group on the right.
def niche(cx,title,kind,colors):
    radius=.78; spring=1.64
    profile=[(cx-radius,.12),(cx+radius,.12)]
    profile.extend((cx+radius*cos(pi*j/32),spring+radius*sin(pi*j/32)) for j in range(33))
    skins('아치 안쪽 판', [[(a,b,h) for a,h in profile] for b in (1.58,1.65)], 'chalk')
    path=[(cx-radius,.12,-1,0)]
    path.extend((cx+radius*cos(t),spring+radius*sin(t),cos(t),sin(t))
                for t in [pi-pi*j/40 for j in range(41)])
    path.append((cx+radius,.12,1,0))
    for inner,outer,depth,tint in [(0,.035,1.33,'gold'),(.035,.098,1.36,'shell')]:
        skins('아치 몰딩',[[(a+nx*r,b,h+nz*r) for r,b in
               [(inner,depth),(outer,depth),(outer,1.62),(inner,1.62)]] for a,h,nx,nz in path],tint)
    lettering(title,cx,1.574,1.94,.17,'ink')
    for row,h in enumerate((.46,.93,1.40)):
        plate('크기별 선반',cx,1.37,h,1.52,.42,.045,.024,'oak')
        plate('크림색 선반 윗판',cx,1.37,h+.045,1.52,.42,.012,.024,'chalk')
        lettering(str(130+row*20)+'  /  '+str(140+row*20),cx,1.154,h+.006,.049,'ink')
        for i in range(4):
            shoe(kind,cx+(-.57,-.32,.29,.54)[i],1.32,h+.057,
                 .13+.020*row+.01*(i%2),(.90 if i<2 else 1.11)*(1+.08*row),
                 (30,18,32,18)[i],colors[(row+i)%len(colors)])
    for side,label in [(-.40,'보통 폭'),(.40,'넓은 폭')]:
        lettering(label,cx+side,1.57,.255,.094,'walnut')

# The archived surround reads as a dense botanical print. These leaves are an
# original reduced pattern, in the spandrels and strips between the arches.
plate('진열 벽',0,1.69,.095,5.30,.065,2.63,.030,'shell')
leaves=[]; faces=[]
for row in range(15):
    for col in range(36):
        xx=-2.57+.147*col+.031*sin(row*2.3+col)
        hh=.18+row*.171+.039*sin(col*2.1+row)
        if any(abs(xx-mid)<.85 and (hh<1.64 or
                (xx-mid)**2+(hh-1.64)**2<.85**2) for mid in [-1.72,0,1.72]):
            continue
        for direction in [-1,1]:
            dx=.049*direction; dz=.059
            start=len(leaves)
            leaves.extend([(xx,1.653,hh),(xx+dx*.2-.017,1.653,hh+dz*.6),
                           (xx+dx,1.653,hh+dz),(xx+dx*.6+.014,1.653,hh+dz*.3)])
            faces.append(tuple(range(start,start+4)))
part('잎사귀 벽 무늬',leaves,faces,'walnut')
for cx,title,kind,colors in [(-1.72,'씨엔타',1,['coral','cream','indigo','mint']),
        (0,'미니멜리사',2,['raspberry','blush','lemon']),
        (1.72,'헌터',0,['red','teal','indigo','clay'])]:
    niche(cx,title,kind,colors)

# Low rounded islands and the dark hoop display echo the branch photograph.
for cx,cy,rx,ry,top in [(-.58,-.45,.83,.43,.57),(.57,-.36,.64,.40,.77)]:
    disk('진열대 걸레받이',cx,cy,.018,rx-.065,ry-.045,.086,'ink')
    disk('둥근 진열대',cx,cy,.104,rx,ry,top-.118,'steel')
    disk('진열대 상판',cx,cy,top-.014,rx,ry,.014,'linen')
for x,y,h,kind,col,angle in [(-1.02,-.46,.57,1,'coral',52),(-.65,-.55,.57,1,'cream',67),
        (-.30,-.36,.57,1,'indigo',46),(.28,-.43,.77,2,'raspberry',55),(.62,-.46,.77,2,'blush',61),
        (.92,-.27,.77,0,'red',53)]:
    shoe(kind,x,y,h,.17,1.12,angle,col)
for xx in (-.96,-.31):
    rod('검은 진열 프레임',(xx,-.24,.57),(xx,-.24,1.39),.013,'ink')
for j in range(22):
    def hoop(t): return (-.635+.325*cos(t),-.24,1.39+.325*sin(t))
    rod('둥근 프레임 상부',hoop(j*pi/22),hoop((j+1)*pi/22),.013,'ink')
plate('프레임 진열 선반',-.635,-.24,1.11,.68,.22,.022,.025,'ink')
shoe(0,-.70,-.24,1.132,.165,1.05,67,'red')
shoe(0,-.51,-.22,1.132,.15,.94,58,'teal')
plate('토박스 명패',.54,-.743,.46,.55,.042,.21,.012,'orange')
lettering('TOEBOX',.54,-.765,.515,.110,'white',True)

# A separate low fitting chair leaves the center passage open.
cx,cy=1.97,-.59
for sx in (-1,1):
    for sy in (-1,1):
        rod('의자 다리',(cx+sx*.255,cy+sy*.21,.025),(cx+sx*.21,cy+sy*.16,.35),.024,'oak')
plate('의자 좌판',cx,cy,.327,.59,.48,.055,.075,'walnut')
plate('의자 쿠션',cx,cy,.377,.60,.48,.085,.085,'rose')
for side in [-1,1]:
    rod('등받이 지지대',(cx+side*.22,cy+.18,.35),(cx+side*.22,cy+.22,.73),.018,'oak')
plate('등 쿠션',cx,cy+.22,.54,.56,.089,.24,.044,'rose')
# Foot gauge: recessed heel cup, metric ticks and a sliding transverse stop.
plate('발 측정판',cx,cy-.39,.024,.27,.34,.026,.034,'mint')
for j in range(14):
    plate('눈금',cx-.082,cy-.53+.016*j,.050,.031 if j%5==0 else .015,.002,.001,.0004,'ink')
plate('뒤꿈치 받침',cx,cy-.23,.05,.18,.032,.043,.014,'walnut')
plate('길이 조절자',cx,cy-.44,.051,.20,.015,.020,.005,'orange')
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# Copy per-part finishes into vertex colours before joining runtime draw batches.
for batch,objects in pieces.items():
    merged=bpy.data.materials.new(batch)
    merged.use_nodes=True
    nodes=merged.node_tree.nodes
    shader=nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=.34 if batch=='ToeboxFootwear' else .68
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
