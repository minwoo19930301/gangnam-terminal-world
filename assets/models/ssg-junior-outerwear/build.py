"""Editable Patagonia Kids Gangnam opening display. Metres; customers face +Y."""
from pathlib import Path
from math import pi, sin, cos, radians
import tempfile
import bpy
import numpy as np
from mathutils import Vector, Matrix

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
gallery = bpy.data.collections.new('SSG_10F_PatagoniaKids')
scene.collection.children.link(gallery)
scene.unit_settings.system = 'METRIC'
parts = {}
materials = {}
group = 'PatagoniaKidsGangnamFixtures'
frame = Matrix.Identity(4)
palette = dict(walnut='935E3D', edge='BC8257', darkwood='69432E', chalk='FFEDD5',
               metal='39404A', blue='233654', gold='E5AC57', berry='B82E51',
               rose='EAA9BD', pink='DF559F', aqua='83D2D1', teal='447E7C',
               spice='C38542', cream='F0E7D4', black='292A2B', khaki='BE936B',
               red='D45043', indigo='34547B', grey='A49E94', sole='FFFAE8', moss='5B7960')

def material(color):
    if color not in materials:
        rgb = bytes.fromhex(palette[color])
        rgba = [((v/255+.055)/1.055)**2.4 if v>10 else v/3294.6 for v in rgb]+[1]
        m = bpy.data.materials.new(color)
        m.use_nodes = True
        m.diffuse_color = rgba
        shader = m.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Base Color'].default_value = rgba
        shader.inputs['Roughness'].default_value = .47 if group.endswith('Outerwear') else .69
        materials[color] = m
    return materials[color]

def mesh(name, verts, faces, color, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    gallery.objects.link(obj)
    obj.matrix_world = frame.copy()
    data.materials.append(material(color))
    if smooth:
        for f in data.polygons: f.use_smooth = True
    parts.setdefault(group, []).append(obj)
    return obj

def skin(name, rings, color, smooth=True, cap=True):
    n = len(rings[0])
    faces = [tuple(reversed(range(n)))] if cap else []
    for j in range(len(rings)-1):
        for i in range(n):
            a=j*n+i; b=j*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    if cap: faces.append(tuple(range(n*(len(rings)-1),n*len(rings))))
    return mesh(name,[v for r in rings for v in r],faces,color,smooth)

def oval(x,y,z,rx,ry,n=20):
    return [(x+rx*cos(2*pi*i/n),y+ry*sin(2*pi*i/n),z) for i in range(n)]

def loft(name, sections, color,n=20):
    return skin(name,[oval(*section,n) for section in sections],color)

def rod(name,a,b,r,col):
    a,b=Vector(a),Vector(b)
    q=(b-a).to_track_quat('Z','Y')
    ring=[q@Vector((r*cos(i*pi/4),r*sin(i*pi/4),0)) for i in range(8)]
    return skin(name,[[p+v for v in ring] for p in (a,b)],col)

def path(name, points, radius, col):
    pts=list(map(Vector,points))
    rings=[]
    for i,p in enumerate(pts):
        v=pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)]
        axis=v.normalized()
        ref=Vector((0,1,0)) if abs(axis.y)<.95 else Vector((1,0,0))
        u=axis.cross(ref).normalized(); w=axis.cross(u)
        rings.append([p+radius*(u*cos(a*pi/3)+w*sin(a*pi/3)) for a in range(6)])
    return skin(name,rings,col)

def rounded(w,d,r,n=5):
    r=min(r,w*.499,d*.499)
    return [(sx*(w/2-r)+r*cos(a+i*pi/2/n),sy*(d/2-r)+r*sin(a+i*pi/2/n))
            for sx,sy,a in ((1,1,0),(-1,1,pi/2),(-1,-1,pi),(1,-1,3*pi/2)) for i in range(n+1)]

def board(name,x,y,z,w,d,h,col,r=.012):
    pts=rounded(w,d,r)
    return skin(name,[[(x+a,y+b,t) for a,b in pts] for t in (z,z+h)],col,False)

def pose(x,y,z,ang=0,s=1):
    return Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(ang),4,'Z') @ Matrix.Scale(s,4)

def lettering(body,x,y,z,size,col):
    font=bpy.data.curves.new(body,'FONT')
    font.body=body; font.align_x='CENTER'; font.size=size; font.resolution_u=5
    fp=Path('/System/Library/Fonts/Supplemental/Georgia Bold.ttf')
    if fp.exists(): font.font=bpy.data.fonts.load(str(fp),check_existing=True)
    obj=bpy.data.objects.new(body,font); gallery.objects.link(obj)
    dg=bpy.context.evaluated_depsgraph_get()
    geo=bpy.data.meshes.new_from_object(obj.evaluated_get(dg))
    out=bpy.data.objects.new(body,geo); gallery.objects.link(out)
    out.matrix_world=pose(x,y,z) @ Matrix.Rotation(pi/2,4,'X')
    geo.materials.append(material(col)); parts.setdefault(group,[]).append(out)
    bpy.data.objects.remove(obj,do_unlink=True)

# Quilt lofts follow a changing torso/sleeve section. Each sewn channel has
# a pinched boundary, a softly inflated middle and a lower droop at centre front.
def quilt(name, stations, colors, n):
    for j,(a,b) in enumerate(zip(stations,stations[1:])):
        rings=[]
        for k,bulge in ((0,.94),(.19,1.025),(.53,1.075),(.84,1.025),(1,.94)):
            x,y,z,rx,ry=[p+(q-p)*k for p,q in zip(a,b)]
            ring=[]
            for i in range(n):
                ang=2*pi*i/n
                sag=.007*(sin(ang)**2)
                ring.append((x+rx*bulge*cos(ang),y+ry*bulge*sin(ang),z-sag))
            rings.append(ring)
        # Adjacent channels share an envelope and meet at the seam.
        skin(name+' %02d'%(j+1),rings,colors[j],True,cap=j in (0,len(stations)-2))

def jacket(colors,hood=False,full=True):
    torso=[(0,0,z,w,d) for z,w,d in [(0,.184,.104),(.083,.194,.115),
          (.172,.201,.118),(.26,.203,.119),(.35,.202,.111),(.432,.182,.100),(.492,.097,.082)]]
    quilt('몸판 다운 격실',torso,colors,24 if full else 14)
    for side in (-1,1):
        stations=[(side*x,y,z,w,d) for x,y,z,w,d in
                  [(.243,-.036,.032,.049,.055),(.246,-.029,.11,.057,.063),
                   (.239,-.017,.19,.063,.068),(.225,-.003,.268,.066,.071),
                   (.209,0,.35,.073,.079),(.184,.002,.409,.071,.078),(.153,.005,.446,.05,.062)]]
        quilt('소매 다운 격실',stations,[colors[-2]]*6,14 if full else 10)
        loft('소매 밴딩',[(side*.243,-.036,.022,.046,.049),(side*.243,-.036,.044,.05,.056)],colors[-1],12)
        if full:
            pts=[(side*.149,-.077,.197),(side*.137,-.097,.159),(side*.118,-.105,.122),(side*.106,-.108,.091)]
            path('사선 주머니 입구',pts,.005,colors[-1])
            rod('포켓 지퍼 손잡이',pts[0],(side*.153,-.082,.178),.003,'metal')
    path('앞여밈 지퍼 테이프',[(0,-d*1.09,z-.003) for _,_,z,_,d in torso],.008,'metal')
    rod('지퍼 슬라이더',(0,-.085,.483),(.013,-.099,.453),.004,'grey')
    # Folded stand collar; open hood is a shell with recessed contrasting lining.
    loft('스탠드 칼라',[(0,.003,.466,.111,.086),(0,.008,.513,.108,.087)],colors[-1],18)
    board('직조 가슴 라벨',.105,-.098,.353,.049,.008,.020,'blue',.002)
    board('라벨 산 능선',.105,-.103,.364,.042,.002,.004,'rose',.001)
    if hood:
        def loop(ry,rx,rz,cz):
            return [(rx*cos(2*pi*i/28),ry,cz+rz*sin(2*pi*i/28)) for i in range(28)]
        # Rings run from the back crown round the mouth and into the lining.
        rings=[loop(.141,.045,.075,.579),loop(.107,.113,.130,.582),
               loop(.025,.142,.153,.589),loop(-.070,.134,.150,.589),loop(-.102,.117,.132,.589)]
        skin('입체 삼판 후드 겉감',rings,colors[-1],cap=False)
        skin('후드 입구 밝은 바인딩',[loop(-.104,.121,.135,.589),loop(-.110,.112,.125,.589)],'cream',cap=False)
        # Open curved bowl from rim to recessed nape; no front cap.
        shell=[loop(-.112,.111,.125,.589),loop(-.062,.101,.113,.589),loop(.051,.071,.080,.589)]
        n=28
        mesh('후드 안감',sum(shell,[]),[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(2) for i in range(n)],'darkwood',True)

def sphere(name,x,y,z,rx,ry,rz,col,n=20):
    vals=[-.999,-.86,-.53,0,.53,.86,.999]
    return loft(name,[(x,y,z+rz*t,rx*(1-t*t)**.5,ry*(1-t*t)**.5) for t in vals],col,n)

def mannequin(x,y,base,ang,colors,hood):
    global frame,group
    group='PatagoniaKidsGangnamOuterwear'
    frame=pose(x,y,base,ang)
    board('마네킹 금속 받침',0,.012,0,.39,.32,.022,'grey',.026)
    for side in (-1,1):
        xx=side*.109
        loft('바지 다리',[(xx,.014,.105,.055,.059),(xx,-.004,.147,.075,.078),
             (xx+.008,.002,.196,.062,.074),(xx+.009,.011,.244,.08,.083),
             (xx*.90,.012,.355,.087,.095),(xx*.77,.019,.489,.099,.108),
             (xx*.73,.023,.611,.103,.106)],'khaki' if not hood else 'cream',18)
        if hood:
            for j in range(7):
                zz=.17+j*.055
                for k in range(3):
                    a=(k*2.09+j*.77)
                    sphere('플리스 얼룩무늬',xx*.92+.071*cos(a),.012+.074*sin(a),zz,
                           .026,.022,.020,'khaki',8)
        loft('운동화 밑창',[(xx,-.029,.023,.062,.112),(xx,-.029,.048,.065,.116)],'sole',18)
        loft('운동화 갑피',[(xx,-.029,.048,.064,.112),(xx,-.033,.074,.061,.108),
             (xx,-.006,.102,.055,.082),(xx,.018,.139,.045,.055)],'cream',18)
        for j in range(3): rod('신발 끈',(xx-.035,-.050+j*.015,.096+j*.008),(xx+.035,-.050+j*.015,.096+j*.008),.004,'sole')
    local=frame; frame=local @ pose(0,0,.542)
    jacket(colors,hood)
    for s in (-1,1):
        sphere('무광 손',s*.244,-.040,-.002,.035,.033,.060,'black',14)
    sphere('무광 얼굴',0,-.068 if hood else -.038,.587,.084,.080,.113,'black')
    if not hood:
        loft('니트 비니',[(0,-.029,.614,.096,.090),(0,-.026,.658,.105,.096),
             (0,-.016,.712,.093,.087),(.012,-.006,.761,.065,.068),(.027,.001,.786,.034,.032)],'cream',28)
        for i in range(32):
            a=2*pi*i/32
            path('비니 접단 골지',[(.097*cos(a),-.029+.091*sin(a),.612),
                  (.103*cos(a),-.027+.096*sin(a),.639),(.105*cos(a),-.025+.096*sin(a),.665)],.0045,'sole')
        sphere('비니 방울',.027,.001,.791,.037,.037,.038,'cream',14)
    frame=Matrix.Identity(4)

def folded(x,y,z,col,angle):
    global frame
    frame=pose(x,y,z,angle)
    pts=rounded(.40,.30,.045)
    skin('접은 재킷', [[(a*s,b*s,h) for a,b in pts] for h,s in
         [(0,.91),(.014,1),(.047,1.02),(.064,.93)]],col)
    # A shallow tuck reads along the side where the sleeves fold underneath.
    path('접힌 소매 끝',[(-.16,-.15,.028),(-.045,-.156,.025),(.132,-.15,.032)],.004,col)
    board('접힌 앞지퍼',0,-.003,.064,.009,.263,.003,'metal',.003)
    frame=Matrix.Identity(4)

# Native wood with directional UVs. Bake a repeatable small veneer sample;
# subtle longitudinal pores and bending growth lines survive the WebGL export.
wood='PatagoniaKidsGangnamWood'
group=wood
board('세로결 브랜드 벽',0,1.91,.03,3.80,.11,2.49,'walnut')
board('카운터 상판',0,1.55,.905,3.13,.57,.055,'darkwood')
board('카운터 목재 몸체',0,1.56,.04,3.03,.50,.865,'walnut')
for i in range(4):
    xx=(i-1.5)*.738
    board('카운터 액자 속판',xx,1.298,.135,.670,.025,.619,'edge')
    board('카운터 홈 안쪽',xx,1.282,.17,.602,.014,.548,'walnut')
# Capsule-shaped shelving island has open cubbies, shared bottom, two heights.
for x,z,w,d in [(-.10,.07,1.82,.84),(-.10,.53,1.82,.84),(-.68,.77,.76,.77)]:
    board('월넛 곡선 진열 상판',x,-.12,z,w,d,.042,'walnut',d*.49)
for xx in [-.85,-.17,.64]:
    board('열린 수납 칸막이',xx,-.12,.108,.052,.62,.423,'walnut')
board('상단 받침',-.65,-.09,.568,.055,.56,.206,'walnut')
for z in [.035]:
    board('둥근 행거 바닥' if z<.1 else '옷걸이 보강목',1.26,.94,z,.82,.63,.038,'walnut',.30)
group='PatagoniaKidsGangnamFixtures'
lettering('patagonia',0,1.826,2.029,.35,'chalk')
for i in range(45):
    board('목재 벽 세로 줄눈',(i-22)*.083,1.850,1.04,.003,.008,1.44,'darkwood',.001)
for xx in [.89,1.64]:
    rod('행거 프레임',(xx,.94,.068),(xx,.94,1.50),.016,'metal')
rod('옷걸이 봉',(.89,.94,1.50),(1.64,.94,1.50),.017,'metal')
# A second face-out rail matches the dark teal jacket at the left of the island.
board('왼쪽 행거 타원형 기단',-1.29,1.00,.03,.86,.54,.065,'walnut',.26)
for xx in [-1.64,-.94]:
    rod('옆 행거 기둥',(xx,1.00,.09),(xx,1.00,1.41),.012,'metal')
rod('옆 행거 봉',(-1.64,1.00,1.41),(-.94,1.00,1.41),.014,'metal')
group='PatagoniaKidsGangnamOuterwear'
frame=pose(-1.29,.98,.748,11,.98)
jacket(['teal']*6,False,False)
path('굽은 옷걸이 목',[(-.17,.02,.43),(0,.02,.55),(0,.02,.65),(0,.050,.68),(0,.08,.65)],.008,'edge')
frame=Matrix.Identity(4)
# One face-out garment with four staggered side-on pieces on real hangers.
for j,(xx,yy,ang,col) in enumerate([(1.25,.74,-8,'aqua'),(1.01,1.01,69,'rose'),
        (1.17,1.00,72,'gold'),(1.35,1.01,70,'blue'),(1.53,1.01,72,'teal')]):
    frame=pose(xx,yy,.843,ang,.96)
    jacket([col]*6,False,False)
    path('원목 옷걸이 어깨',[(-.169,.023,.435),(0,.023,.559),(.169,.023,.435)],.012,'edge')
    path('행거 고리',[(0,.023,.555),(0,.023,.64),(0,.064,.694),(0,.096,.676)],.006,'metal')
    frame=Matrix.Identity(4)
# Rounded plinth, rug, and two dressed child forms match the opening photograph.
mannequin(-.70,-.09,.812,9,['rose']*6,True)
mannequin(.95,-.38,.027,-10,['berry','berry','gold','gold','blue','blue'],False)
for x,y,z,cols in [(-.37,-.23,.572,['pink']*3),(.43,-.21,.572,['aqua']*3),
                    (-.57,-.24,.112,['khaki']*3),(.21,-.22,.112,['indigo']*3)]:
    for i,c in enumerate(cols): folded(x+.009*sin(i),y,z+.065*i,c,3*cos(i))
# Thin speckled stone inserts on the wooden display, as in the branch close-up.
group='PatagoniaKidsGangnamFixtures'
board('진열대 밝은 상감',-.10,-.12,.571,1.79,.809,.006,'khaki',.40)
board('높은 받침 상감',-.68,-.12,.811,.73,.736,.004,'khaki',.36)
# Small landscape sign in a timber frame behind the folded goods.
board('산 그림 액자',.27,.155,.578,.41,.038,.42,'darkwood')
board('산 그림 하늘',.27,.133,.603,.365,.010,.366,'aqua')
def ridge(name,coords,col,y):
    mesh(name,[(x,y,z) for x,z in coords],[tuple(range(len(coords)))],col)
ridge('원경 설산',[(.09,.61),(.45,.61),(.45,.81),(.39,.85),(.36,.83),(.29,.92),(.21,.82),(.18,.855),(.09,.78)],'sole',.126)
ridge('산 능선',[(.09,.61),(.45,.61),(.45,.75),(.38,.82),(.33,.77),(.28,.82),(.23,.75),(.16,.80),(.09,.72)],'indigo',.123)
for i in range(5):
    xx=.101+i*.071; ht=.07+(i%3)*.025
    ridge('침엽수 실루엣',[(xx,.611),(xx+.032,.611),(xx+.017,.611+ht)],'moss',.120)
group='PatagoniaKidsGangnamOuterwear'
# A small colour-block backpack has a curved gusset, front pocket and carry loop.
frame=pose(.06,-.02,.572,-12)
loft('아동 배낭 몸통',[(0,0,.0,.121,.080),(0,0,.039,.141,.088),(0,.007,.19,.13,.085),
     (0,.013,.245,.105,.074),(0,.018,.275,.072,.055)],'khaki')
sphere('배낭 겉 포켓',0,-.068,.096,.116,.051,.076,'berry')
path('배낭 손잡이',[(-.049,.022,.262),(-.046,.024,.308),(0,.025,.331),(.046,.024,.308),(.049,.022,.262)],.009,'berry')
for s in [-1,1]:
    path('배낭 등끈',[(s*.071,.068,.238),(s*.094,.107,.172),(s*.098,.101,.075),(s*.093,.071,.043)],.013,'blue')
frame=Matrix.Identity(4)

# Four woven panels with forest, mountain, monarch and stars motifs.
group='PatagoniaKidsGangnamFixtures'
board('러그 크림색 바인딩',0,-.15,.017,2.98,1.73,.009,'cream',.025)
board('러그 바탕',0,-.15,.026,2.93,1.68,.002,'red',.018)
def print_shape(name,pts,col,z=.030):
    mesh(name,[(x,y,z) for x,y in pts],[tuple(range(len(pts)))],col)
for i in range(4):
    xx=(i-1.5)*.70
    for yy in [-.72,.41]:
        board('러그 직조 외곽선',xx,yy,.029,.675,.018,.001,'cream')
    for dx in [-.33,.33]: board('러그 세로 테두리',xx+dx,-.155,.029,.014,1.15,.001,'cream')
    for j in range(3):
        x=xx+(j-1)*.15; y=-.55+(j%2)*.06
        if i==0:
            for k in range(3):
                h=.09*k
                print_shape('전나무 무늬',[(x-.08+k*.015,y+h),(x+.08-k*.015,y+h),(x,y+h+.12)],'blue',.032+k*.0004)
        elif i==1:
            print_shape('산맥 무늬',[(x-.10,y),(x+.10,y),(x+.014,y+.19)],'indigo')
            print_shape('설산 무늬',[(x-.021,y+.13),(x+.049,y+.13),(x+.014,y+.19)],'cream',.031)
        elif i==2:
            for s in [-1,1]:
                print_shape('나비 날개',[(x,y+.06),(x+s*.07,y+.14),(x+s*.085,y+.089),(x+s*.041,y+.055),(x+s*.063,y+.016),(x,y+.04)],'blue')
        else:
            print_shape('별 무늬',[(x+(.050 if k%2==0 else .020)*cos(k*pi/5),
                      y+.08+(.050 if k%2==0 else .020)*sin(k*pi/5)) for k in range(10)],'cream')
# Preserve the directional grain in editable and exported wood with the same UV map.
rng=np.random.default_rng(43)
v,u=np.mgrid[0:128,0:512]
t=2*pi*u/512; s=2*pi*v/128
grain=.055*np.sin(29*s+2.4*np.sin(t)+.9*np.sin(3*t))+.034*np.sin(63*s+2*np.cos(2*t))
grain+=.025*rng.standard_normal(v.shape)
rgb=np.clip((np.array([.65,.43,.29])[None,None,:]+grain[:,:,None]),0,1)
pixels=np.concatenate((rgb,np.ones((*u.shape,1))),axis=2).astype('float32')
im=bpy.data.images.new('호두나무 무늬목',512,128)
im.pixels.foreach_set(pixels.ravel())
with tempfile.TemporaryDirectory() as td:
    im.filepath_raw=str(Path(td)/'veneer.png'); im.file_format='PNG'; im.save(); im.pack()
for ob in parts[wood]:
    geo=ob.data; uv=geo.uv_layers.new(name='목재 결 방향')
    for face in geo.polygons:
        for li in face.loop_indices:
            x,y,z=geo.vertices[geo.loops[li].vertex_index].co
            coords=(x/.88,y/.27) if abs(face.normal.z)>.5 else ((z/.88,x/.27) if '브랜드 벽' in ob.name else (x/.88+y/.88,z/.27))
            uv.data[li].uv=coords
    mat=geo.materials[0].copy(); geo.materials[0]=mat
    tex=mat.node_tree.nodes.new('ShaderNodeTexImage'); tex.image=im
    mat.node_tree.links.new(tex.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
print('Editable pieces:',sum(map(len,parts.values())))
# Leave every original garment part editable. Join only the transient export scene.
for batch,objects in parts.items():
    mat=bpy.data.materials.new(batch); mat.use_nodes=True
    nd=mat.node_tree.nodes; shader=nd.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=.44 if batch.endswith('Outerwear') else .68
    if batch==wood:
        tex=nd.new('ShaderNodeTexImage'); tex.image=im
    else:
        tex=nd.new('ShaderNodeVertexColor'); tex.layer_name='Finish'
    mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:
        geo=ob.data
        if batch!=wood:
            rgba=geo.materials[0].diffuse_color[:]
            attr=geo.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for vi,item in enumerate(attr.data):
                gain=1
                if '다운 격실' in ob.name:
                    # Bake soft contact at sewn channels; keep grazing highlights on puffed fabric.
                    n=len(geo.vertices)//5
                    gain=(.68,.96,1.07,.98,.77)[vi//n]
                item.color=(*[min(1,c*gain) for c in rgba[:3]],1)
        geo.materials.clear(); geo.materials.append(mat)
        ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join(); bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
