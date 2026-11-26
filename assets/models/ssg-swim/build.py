"""Author the Gangnam Barrel display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_8F_Barrel')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
batch = 'BarrelGangnamDisplay'
palette = dict(ivory='F3F0E9', chalk='E5E8E7', shadow='C7CECC', navy='152640',
    deep='183D70', blue='1561A3', cyan='32ADC6', ice='A8E1EE', foam='E7FAF8',
    graphite='202A32', black='141A22', seam='46515E', white='FCFAF2', silver='AAB7C0',
    orange='F87A28', tangerine='DA5520', sand='C3A779', leaf='507C4A', leaflight='769345',
    lime='C7DE6C', blush='EAA3AD', red='CC5665')
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

# Horizontal sections for molded forms and sewn garments. Negative Y faces the aisle.
def loft(name, sections, color, n=16):
    rings=[[(x+w*cos(2*pi*i/n),y+d*sin(2*pi*i/n),z) for i in range(n)]
           for x,y,z,w,d in sections]
    return smooth(skins(name,rings,color))

def egg(name,x,y,z,w,d,h,color):
    return loft(name,[(x,y,z+h*sin(t*pi/12),max(.002,w*cos(t*pi/12)),max(.002,d*cos(t*pi/12)))
                      for t in [-6,-4,-2,0,2,4,6]],color)

def limb(name, sections, color):
    return loft(name,sections,color,12)

def ellipse_trim(name,x,y,z,w,h,r,color):
    tubing(name,[(x+w*cos(i*pi/12),y,z+h*sin(i*pi/12)) for i in range(25)],r,color)

def mask(color):
    # Skirt, clear-front silhouette, separate breathing pocket, head straps and dry top.
    egg('실리콘 스커트',0,-.079,1.652,.107,.079,.135,color)
    egg('일안식 차광 바이저',0,-.124,1.67,.088,.047,.096,'blue' if color=='white' else 'graphite')
    ellipse_trim('렌즈 베젤',0,-.153,1.668,.088,.095,.009,color)
    egg('코와 입 호흡실',0,-.148,1.604,.052,.03,.043,'cyan' if color=='white' else 'seam')
    for s in [-1,1]:
        tubing('밴드',[(s*.089,-.097,1.68),(s*.105,-.025,1.68),(s*.097,.055,1.65),(s*.036,.10,1.63)],.012,'graphite')
    tubing('상단 호흡관',[(0,-.072,1.76),(.027,-.06,1.80),(.052,-.045,1.93)],.022,color)
    rod('드라이 탑',(.048,-.046,1.906),(.061,-.044,1.959),.024,'cyan' if color=='white' else 'seam')
    tubing('바이저 반사', [(-.065,-.156,1.69),(-.043,-.162,1.721),(-.018,-.16,1.736)],.0035,'ice')

def figure(x,y,z,angle,style,scale=1):
    global transform
    place(x,y,z,angle)
    transform=transform @ Matrix.Scale(scale,4)
    surf=style=='surf'
    top={'surf':'graphite','adult':'white','child':'navy'}[style]
    pant={'surf':'navy','adult':'orange','child':'deep'}[style]
    # Unequal ankle and knee offsets produce the crouched board stance.
    hip= .90 if surf else .96
    for s in [-1,1]:
        foot=s*(.279 if surf else .118)
        knee=s*(.222 if surf else .116)
        knee_y=-.112 if surf else -.018
        limb('발목과 장딴지',[(foot,.018,.085,.037,.041),(foot,.026,.18,.046,.049),
             ((foot+knee)/2,.026,.31,.066,.065),(knee,knee_y,.49,.054,.06),
             (s*.12,0,.77,.085,.084)],'chalk' if style!='child' else 'navy')
        limb('보드 쇼츠 바짓단',[(s*.118,0,.60,.109,.114),(s*.118,.003,.65,.11,.112),
            (s*.106,0,hip-.04,.115,.128),(s*.09,0,hip,.103,.118)],pant)
        tubing('옆선',[(s*.212,-.02,.618),(s*.221,-.02,.74),(s*.197,-.02,hip-.015)],.004,'seam' if surf else 'ivory')
        egg('아쿠아 슈즈 밑창',foot,-.043,.047,.056,.124,.022,'graphite' if style!='adult' else 'ivory')
        egg('발등',foot,-.038,.078,.055,.117,.039,'black' if style!='adult' else 'chalk')
    waist=hip+.055
    loft('허리밴드',[(0,0,hip-.08,.198,.119),(0,0,waist,.16,.107)],pant)
    loft('상의 몸판',[(0,0,hip-.016,.183,.12),(0,0,waist,.17,.111),(0,0,1.18,.161,.103),
         (0,0,1.34,.215,.135),(0,0,1.416,.218,.106),(0,0,1.467,.092,.069)],top)
    for s in [-1,1]:
        end=s*(.37 if surf else .17)
        elbow=s*(.34 if surf else .31)
        limb('팔과 손목',[(end,-.126,.928,.034,.035),(s*(.36 if surf else .245),-.10,1.042,.054,.053),
             (elbow,-.015,1.15,.05,.052),(s*.269,0,1.275,.071,.072),
             (s*.212,0,1.395,.072,.077)],'chalk' if surf else top)
        egg('마네킹 손',end,-.127,.909,.036,.036,.073,'chalk')
        egg('엄지',end-s*.031,-.143,.927,.014,.021,.031,'chalk')
    loft('목',[(0,0,1.421,.068,.060),(0,0,1.556,.057,.055)],'chalk')
    loft('얼굴',[(0,-.019,1.526,.042,.057),(0,-.016,1.554,.074,.075),
         (0,0,1.63,.091,.099),(0,.004,1.70,.095,.098),
         (0,.008,1.756,.078,.079),(0,.008,1.787,.037,.041)],'chalk')
    if surf:
        egg('코',0,-.094,1.629,.019,.025,.032,'chalk')
        for s in [-1,1]:
            egg('귀',s*.09,0,1.642,.015,.025,.037,'chalk')
            tubing('암홀 바인딩',[(s*.164,-.071,1.443),(s*.188,-.103,1.383),
                  (s*.206,-.091,1.303),(s*.196,.045,1.303)],.009,'black')
            part('파란 네오프렌 배색',[(s*.018,-.121,1.002),(s*.161,-.067,1.032),
                 (s*.172,-.066,1.155),(s*.039,-.114,1.103)],[(0,1,2,3)],'blue')
        tubing('전면 지퍼',[(0,-.127,.923),(0,-.118,1.014),(0,-.108,1.18),(0,-.138,1.342),(0,-.092,1.441)],.005,'silver')
        rod('지퍼 손잡이',(0,-.141,1.355),(0,-.145,1.393),.007,'silver')
    else:
        mask('black' if style=='adult' else 'white')
        if style=='adult':
            for s in [-1,1]:
                tubing('어깨끈',[(s*.134,-.086,1.14),(s*.161,-.104,1.33),(s*.162,0,1.436),(s*.144,.117,1.29)],.016,'black')
        else:
            ellipse_trim('아동 래시가드 가슴 배색',0,-.127,1.32,.078,.049,.008,'ice')

def wave_point(t):
    return (.27-1.13*cos(t), .073,1.32+1.16*sin(t))

# Blue exhibition plinth, tubes rolled to a crest, and independent PET bottles.
place(0,-.27,0)
plate('파도 전시 기단',0,0,.015,2.14,.96,.12,.028,'deep')
plate('기단 상판',0,0,.129,2.11,.94,.018,.025,'blue')
start,end=radians(-104),radians(94)
for y in [-.35,.35]:
    tubing('굽힌 파도 프레임',[(wave_point(start+(end-start)*i/32)[0]+y*.67,y,wave_point(start+(end-start)*i/32)[2])
          for i in range(33)],.023,'blue')
    rod('하부 지주',(-.66+y*.67,y,.144),(-.66+y*.67,y,.66),.017,'deep')
batch='BarrelGangnamPET'
# Each bottle has a molded foot, two grip grooves, shoulder, neck and closure.
for row in range(25):
    t=start+(end-start)*row/24
    x,_,z=wave_point(t)
    for lane in range(5):
        y=(lane-2)*.143-.27
        place(x+(y+.27)*.67,y,z)
        transform=transform @ Matrix.Rotation(pi/2+t,4,'Y')
        shade=('ice','cyan','ice','blue','ice')[(row//4+lane)%5] if row>15 else ('silver','ice','blue','ice')[(row+lane)%4]
        loft('재활용 페트병',[(0,0,h,r,r) for h,r in [(-.10,.046),(-.09,.061),(-.073,.062),
                (-.058,.056),(-.046,.060),(.016,.060),(.026,.056),(.037,.059),(.059,.055),(.087,.024),(.100,.021)]],shade,9)
        loft('병뚜껑',[(0,0,.097,.023,.023),(0,0,.12,.023,.023)],'white' if row>16 else 'deep',9)
batch='BarrelGangnamDisplay'
place(.21,-.34,.265,-13)
sections=[(-.84,.025,.071),(-.74,.136,.035),(-.46,.213,.010),(0,.234,0),(.49,.19,.014),(.76,.10,.052),(.84,.008,.09)]
rings=[[(x,w,z+.014),(x,.74*w,z+.024),(x,-.74*w,z+.024),(x,-w,z+.014),(x,-w*.99,z-.009),(x,0,z-.025),(x,w*.99,z-.009)] for x,w,z in sections]
smooth(skins('서프보드 레일과 데크',rings,'cyan'))
tubing('데크 스트링어',[(x,0,z+.026) for x,w,z in sections],.005,'white')
figure(.20,-.34,.298,-13,'surf')
for x,style,size,angle in [(-2.45,'adult',1.02,9),(2.37,'child',.77,-11)]:
    place(x,-.12,0)
    plate('마네킹 전시대',0,0,.018,.87,.72,.075,.075,'ivory')
    figure(x,-.12,.098,angle,style,size)
# Photo's turquoise wave-graphic side panels, with individual sea-foam contours.
for x in [-2.50,2.49]:
    place(x,.55,0)
    plate('파도 그래픽 패널',0,0,.02,1.39,.09,2.32,.018,'ice')
    for k,col in enumerate(['cyan','blue','deep']):
        points=[(-.678+i*1.356/24,-.051-k*.003,.62+.21*(2-k)+.28*sin(i*pi/24-.63)+.12*sin(i*pi/12+.6)) for i in range(25)]
        part('인쇄 파도 띠',points+[(.678,points[0][1],.033),(-.678,points[0][1],.033)],
             [tuple(range(27))],col)
        tubing('물결선',points,.007,'foam',4)
    label('BARREL',x,.489,1.95,.174,'white')
place()
# Two low rear swimwear rails, with contoured rash guards and separate hanger hooks.
for x in [-1.28,1.24]:
    for dx in [-.59,.59]:
        plate('행거 발',x+dx,.76,.03,.10,.49,.035,.025,'silver')
        rod('행거 기둥',(x+dx,.76,.06),(x+dx,.76,1.74),.014,'silver')
    rod('행거 봉',(x-.59,.76,1.735),(x+.59,.76,1.735),.015,'silver')
    for i,col in enumerate(['white','red','blush','ivory','navy','orange']):
        place(x-.48+i*.185,.76,0,57)
        tubing('옷걸이 고리',[(0,0,1.658),(0,0,1.739),(.025,0,1.756),(.043,0,1.737)],.006,'silver')
        rod('옷걸이 어깨',(-.168,0,1.549),(0,0,1.66),.010,'sand')
        rod('옷걸이 어깨',(0,0,1.66),(.168,0,1.549),.010,'sand')
        loft('래시가드',[(0,0,.98,.18,.054),(0,0,1.09,.168,.050),(0,0,1.23,.154,.046),
             (0,0,1.46,.185,.06),(0,0,1.55,.175,.055),(0,0,1.612,.062,.037)],col)
        for s in [-1,1]:
            loft('래시가드 소매',[(s*.206,0,1.07,.039,.035),(s*.209,0,1.28,.05,.047),
                 (s*.19,0,1.46,.057,.049),(s*.156,0,1.534,.051,.046)],col,10)
            tubing('라글란 봉제선',[(s*.062,-.026,1.60),(s*.11,-.047,1.53),(s*.168,-.036,1.44)],.003,'shadow')
    place()

# Distant surf print behind the open fixtures, as in the exhibition photograph.
place()
plate('바다 배경',0,1.10,.025,6.27,.065,2.68,.02,'foam')
for k,col in enumerate(['ice','cyan','blue']):
    points=[(-3.10+i*6.20/52,1.060-k*.003,1.18-k*.13+.08*sin(i*.25)+.035*cos(i*.64))
            for i in range(53)]
    part('바다 수평선',points+[(3.10,points[0][1],.032),(-3.10,points[0][1],.032)],
         [tuple(range(55))],col)
label('BARREL',-.73,-.754,.052,.082,'white')
# A potted palm beside the junior presentation. Folded leaflets on arching fronds.
place(1.89,.16,0)
loft('화분',[(0,0,.02,.142,.142),(0,0,.30,.192,.192),(0,0,.338,.19,.19)],'sand')
for i in range(9):
    theta=i*2.399
    dx,dy=cos(theta),sin(theta)
    L=.44+.10*(i%3)
    def stalk(f):
        return Vector((dx*L*f,dy*L*f,.31+(1.20+.14*(i%3))*f-.48*f*f))
    tubing('야자 잎줄기',[stalk(n/8) for n in range(9)],.007,'leaf',5)
    for j in range(3,13):
        f=j/13
        a=stalk(f)
        length=.14*sin(f*pi)**.6+.025
        for sign in [-1,1]:
            end=a+Vector((dx*.068-sign*dy*length,dy*.068+sign*dx*length,.024-.10*f))
            mid=(a+end)*.5
            part('야자 소엽',[a,mid+Vector((dx*.016,dy*.016,.024)),end,mid-Vector((dx*.012,dy*.012,.004))],
                 [(0,1,2),(0,2,3)],'leaflight' if (i+j)%4==0 else 'leaf')
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
for group,objects in pieces.items():
    bpy.ops.object.select_all(action='DESELECT')
    material=bpy.data.materials.new(group);material.use_nodes=True
    shader=material.node_tree.nodes.get('Principled BSDF')
    colors=material.node_tree.nodes.new('ShaderNodeVertexColor');colors.layer_name='Finish'
    material.node_tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value=.22 if group.endswith('PET') else .70
    for ob in objects:
        mesh=ob.data;rgba=mesh.materials[0].diffuse_color[:]
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        for item in attr.data:item.color=rgba
        mesh.materials.clear();mesh.materials.append(material);ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join();bpy.context.object.name=group
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False,export_texcoords=False)
