"""Build the customer-facing Gangnam Hasselblad island. Metres, +Z up, -Y forward."""
import bpy
import numpy as np
import tempfile
from contextlib import contextmanager
from math import sin, cos, pi, radians
from pathlib import Path
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
gallery = bpy.data.collections.new("SSG_6F_Hasselblad")
scene.collection.children.link(gallery)
scene.unit_settings.system = 'METRIC'
bpy.context.preferences.filepaths.save_version = 0
prefix, placement = '', Matrix.Identity(4)
MATTE, METAL, SKIN, SCREEN = ('GangnamHasselbladCabinet', 'GangnamHasselbladMetalwork',
                              'GangnamHasselbladOptics', 'GangnamHasselbladScreen')
pieces = {key: [] for key in [MATTE, METAL, SKIN, SCREEN]}

def linear(x):
    s = int(x, 16)/255
    return s/12.92 if s < .04045 else ((s+.055)/1.055)**2.4

def color_material(code, metal=False):
    name = ('새틴 금속 ' if metal else '무광 마감 ') + code
    if name in bpy.data.materials: return bpy.data.materials[name]
    rgb = [linear(code[i:i+2]) for i in (0, 2, 4)]
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    shader = m.node_tree.nodes['Principled BSDF']
    shader.inputs['Base Color'].default_value = m.diffuse_color
    shader.inputs['Roughness'].default_value = .35 if metal else .68
    shader.inputs['Metallic'].default_value = .41 if metal else 0
    return m

def printed_material(name, path, roughness, emission=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    shader = m.node_tree.nodes['Principled BSDF']
    tex = m.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(str(path))
    tex.image.pack()
    m.node_tree.links.new(tex.outputs['Color'], shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value = roughness
    if emission:
        m.node_tree.links.new(tex.outputs['Color'], shader.inputs['Emission'])
        shader.inputs['Emission Strength'].default_value = emission
    return m

atlas = printed_material('가죽 · 광학 코팅 · 거리 눈금', OUT/'finishes.png', .43)
tiles = dict(grip=(512,128,256,128), knurl=(512,0,256,128), glass=(768,0,256,256),
             lcd=(512,256,256,128), status=(512,384,256,128), hood=(768,256,256,128),
             stone=(768,384,256,128))
for i in range(4):
    tiles['scale'+str(i)] = (0,64*i,512,64)
    tiles['name'+str(i)] = (0,256+64*i,512,64)

def remap(tile, u, v):
    x,y,w,h = tiles[tile]
    return ((x+1+u*(w-2))/1024, 1-(y+1+(1-v)*(h-2))/512)

def mesh(name, vertices, faces, color, metal=False, tile=None, uvs=None, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    ob = bpy.data.objects.new(prefix+name, data)
    gallery.objects.link(ob)
    ob.matrix_world = placement.copy()
    key = SKIN if tile else METAL if metal else MATTE
    data.materials.append(atlas if tile else color_material(color, metal))
    if tile or uvs:
        uv = data.uv_layers.new(name='전개도')
        for p, coords in zip(data.polygons, uvs):
            for li,(u,v) in zip(p.loop_indices, coords):
                uv.data[li].uv = remap(tile,u,v) if tile else (u,v)
    if smooth:
        for p in data.polygons: p.use_smooth = True
    pieces[key].append(ob)
    return ob

@contextmanager
def at(x=0,y=0,z=0,rz=0,rx=0,ry=0,title=None):
    global placement, prefix
    prior, old = placement, prefix
    placement = prior @ Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(rz),4,'Z') @ Matrix.Rotation(radians(ry),4,'Y') @ Matrix.Rotation(radians(rx),4,'X')
    if title is not None: prefix = title+' · '
    try: yield
    finally: placement,prefix = prior,old

# Curved stacks share radial vertices; seams duplicate UVs only.
def skin(name, rings, color, metal=False, tile=None, caps=True, smooth=False, rows=None):
    n, k = len(rings[0]), len(rings)
    faces, uvs = [], []
    if rows is None: rows = [j/(k-1) for j in range(k)]
    for j in range(k-1):
        for i in range(n):
            a,b = j*n+i,j*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
            uvs.append(((i/n,rows[j]),((i+1)/n,rows[j]),((i+1)/n,rows[j+1]),(i/n,rows[j+1])))
    if caps:
        for base,order in [(0,reversed(range(n))),((k-1)*n,range(n))]:
            ids=list(order)
            faces.append([base+i for i in ids])
            uvs.append([(.5+.48*cos(2*pi*i/n),.5+.48*sin(2*pi*i/n)) for i in ids])
    ob=mesh(name,[p for ring in rings for p in ring],faces,color,metal,tile,uvs if tile else None,smooth)
    if caps and smooth:
        for p in list(ob.data.polygons)[-2:]: p.use_smooth=False
    return ob

def outline(w,d,r,n=5):
    r=min(r,w/2,d/2)
    pts=[]
    for sx,sy,deg in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for i in range(n+1):
            t=radians(deg+90*i/n)
            pts.append((sx*(w/2-r)+r*cos(t),sy*(d/2-r)+r*sin(t)))
    return pts

def plate(name,x,y,z,w,d,h,color,r=.002,edge=.0007,metal=False,tile=None):
    e=min(edge,h*.24,r*.8)
    sizes=[(z,e),(z+e,0),(z+h-e,0),(z+h,e)] if e else [(z,0),(z+h,0)]
    rings=[[(x+u,y+v,zz) for u,v in outline(w-2*s,d-2*s,max(.00005,r-s),4)] for zz,s in sizes]
    return skin(name,rings,color,metal,tile,smooth=False)

def barrel(name,profile,color,metal=False,tile=None,n=40,caps=True,ripple=0):
    rings=[[(cos(2*pi*i/n-pi)*(r+(ripple if i%2 else 0)),sin(2*pi*i/n-pi)*(r+(ripple if i%2 else 0)),h) for i in range(n)] for h,r in profile]
    return skin(name,rings,color,metal,tile,caps,smooth=not ripple)

def disc(name,x,y,z,r,h,color,metal=False,n=28):
    with at(x,y,z):return barrel(name,[(0,r*.96),(.14*h,r),(.90*h,r),(h,r*.96)],color,metal,n=n)

def quad(name,points,tile):
    return mesh(name,points,[(0,1,2,3)],None,tile=tile,uvs=[[(0,0),(1,0),(1,1),(0,1)]])

def front(name,x,y,z,w,h,tile):
    return quad(name,[(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y,z+h),(x-w/2,y,z+h)],tile)

def top(name,x,y,z,w,d,tile):
    return quad(name,[(x-w/2,y-d/2,z),(x+w/2,y-d/2,z),(x+w/2,y+d/2,z),(x-w/2,y+d/2,z)],tile)

def text(name,body,x,y,z,size,color,rx=90,rz=0,shear=0,spacing=1,metal=False):
    curve = bpy.data.curves.new(name,'FONT')
    curve.body=body
    curve.size=size
    curve.align_x='CENTER'
    curve.resolution_u=3
    curve.space_character=spacing
    curve.shear=shear
    if name=='흰색 벽면 상호':
        curve.offset=.003
        curve.extrude=.002
    ob=bpy.data.objects.new(name,curve)
    gallery.objects.link(ob)
    ob.matrix_world=placement @ Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(rz),4,'Z') @ Matrix.Rotation(radians(rx),4,'X')
    bpy.context.view_layer.update()
    data=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    letters=bpy.data.objects.new(prefix+name,data)
    gallery.objects.link(letters)
    letters.matrix_world=ob.matrix_world.copy()
    data.materials.append(color_material(color,metal))
    pieces[METAL if metal else MATTE].append(letters)
    bpy.data.objects.remove(ob,do_unlink=True)
    bpy.data.curves.remove(curve)
    return letters

BLACK='242527'
GUN='4E4F50'
SILVER='C4C7C8'
EDGE='878C8F'
RUBBER='303133'
ORANGE='F7892F'

def glass(radius,z):
    # Convex coating above a recessed aperture, with a continuous polar texture.
    n=48
    verts=[(0,0,z+.0045)]
    uv=[(.5,.5)]
    faces=[]
    for k in range(1,7):
        r=k/6
        for i in range(n):
            a=2*pi*i/n
            verts.append((radius*r*cos(a),radius*r*sin(a),z+.0045*(1-r*r)))
            uv.append((.5+.494*r*cos(a),.5+.494*r*sin(a)))
            j=1+(k-1)*n+i; jj=1+(k-1)*n+(i+1)%n
            faces.append((0,j,jj) if k==1 else (j-n,j,jj,jj-n))
    mesh('볼록 전면 소자와 조리개',verts,faces,None,tile='glass',uvs=[[uv[i] for i in f] for f in faces],smooth=True)

def lens(idx,length=.09,r=.038,hood=None,vintage=False):
    # Optical axis points upwards here. Body mounts rotate this assembly as a unit.
    h=length
    barrel('마운트 베이오넷',[(0,r*.83),(.003,r*.97),(.006,r*.97)],SILVER,True)
    barrel('경통 절삭 몸체',[(.005,r*.92),(.011,r*.95),(h*.26,r*.95),(h*.30,r),(h*.94,r),(h,r*.96)],BLACK,True,caps=False)
    barrel('조리개 조작 링',[(.009,r*.98),(.013,r*.99),(.020,r*.99)],GUN,tile='knurl',caps=False)
    barrel('거리와 심도 눈금',[(h*.28,r*1.012),(h*.51,r*1.012)],GUN,tile='scale'+str(idx),caps=False)
    barrel('초점 조절 링',[(h*.52,r*1.025),(h*.69,r*1.025)],GUN,tile='knurl',caps=False)
    if vintage:
        # Alternating raised castellations distinguish the older lens's scalloped ring.
        barrel('물결형 초점 노브',[(h*.50,r),(h*.52,r*1.02),(h*.65,r*1.02),(h*.67,r)],GUN,True,n=48,ripple=.002)
    else:
        barrel('초점거리 각인 밴드',[(h*.70,r*1.008),(h*.965,r*1.008)],GUN,tile='name'+str(idx),caps=False)
    # Travel inward down the threaded lip. Do not close the front with a flat disk.
    barrel('필터 나사 안쪽 경사',[(h-.001,r),(h+.001,r),(h+.0012,r*.94),(h-.001,r*.92),(h-.0018,r*.86),(h-.006,r*.79),(h-.009,r*.73)],'28292B',True,caps=False,n=48)
    for j,rr in enumerate([.91,.86,.81]):
        hh=h-.0012-j*.0017
        barrel('필터 가공선',[(hh,r*rr),(hh+.00045,r*rr),(hh+.00045,r*(rr-.012))],GUN,True,caps=False,n=40)
    glass(r*.735,h-.009)
    if hood:
        # Petal notches cut both the inner and outer wall surfaces.
        n=56
        def crown(a):
            return (.018+.020*(.5+.5*cos(2*a))**1.5+.010*(.5+.5*cos(4*a))**2) if hood=='petal' else .031
        rings=[]
        for radius,hh,cut in [(r*1.015,h-.014,False),(r*1.11,h+.001,False),(r*1.14,h,True),(r*1.09,h,True),(r*1.055,h+.001,False),(r*.98,h-.012,False)]:
            rings.append([(radius*cos(a),radius*sin(a),hh+(crown(a) if cut else 0)) for a in [2*pi*j/n for j in range(n)]])
        # The manufacturer's pale signature sits on the outside. The projecting
        # front lip and stepped flocked inside remain separately editable.
        for j in range(len(rings)):
            rings[j]=rings[j][n//2:]+rings[j][:n//2]
        skin('꽃잎형 후드' if hood=='petal' else '원통형 차광 후드',rings[:3],BLACK,tile='hood',caps=False,smooth=True)
        skin('후드 단면 테두리',rings[2:4],'55565A',True,caps=False,smooth=True)
        skin('후드 무광 내면',rings[3:],RUBBER,caps=False,smooth=True)
        for j in range(3):
            station=h+.002+j*.0035
            rr=r*(1.056+j*.005)
            barrel('후드 내벽 반사 억제 홈',[(station,rr),(station+.0007,rr*.98),(station+.0014,rr)],'494A4C',caps=False,n=40)

def angular_prism(name,section,y0,y1,color,metal=False):
    # x/z cross-section runs counterclockwise when viewed from the front.
    n=len(section)
    v=[(x,y,z) for y in [y0,y1] for x,z in section]
    f=[list(range(n)),list(reversed(range(n,n*2)))]
    f += [(i,i+n,(i+1)%n+n,(i+1)%n) for i in range(n)]
    return mesh(name,v,f,color,metal)

def x2d():
    # Wide machined body; grip curls into a deep forward lobe under the shutter.
    plate('하부 금속 틀',0,0,0,.151,.045,.008,GUN,.008,.0015,True)
    plate('일체형 몸통',0,0,.005,.150,.045,.082,'414244',.007,.002,True)
    plate('앞판 무광 삽입부',.011,-.023,.006,.119,.007,.074,BLACK,.003,.0008)
    grip=[]
    for z,dx,dy,scale in [(.003,.001,.002,.89),(.007,0,0,.98),(.017,-.001,-.002,1),(.048,-.001,-.005,.97),(.070,.001,-.002,.91),(.077,.002,0,.96)]:
        ring=[]
        for i in range(36):
            a=2*pi*i/36
            # A wider palm and narrower neck, with a slope into the index-finger recess.
            ring.append((-.058+dx+.0174*scale*cos(a),-.018+dy+.035*scale*sin(a)*(1-.20*cos(a)),z))
        grip.append(ring)
    skin('곡면 가죽 그립',grip,'353438',tile='grip',smooth=True)
    plate('그립 상부 핑거 레스트',-.057,-.017,.076,.038,.069,.010,GUN,.016,.002,True)
    disc('셔터 매입 칼라',-.058,-.039,.084,.009,.0032,BLACK,True)
    disc('주황 셔터',-.058,-.039,.087,.0069,.0025,ORANGE,True)
    disc('후면 엄지 다이얼',-.058,.019,.075,.011,.008,GUN,True)
    with at(-.058,.019,.078):barrel('다이얼 옆면 널링',[(0,.0112),(.004,.0112)],GUN,tile='knurl',caps=False)
    plate('상판 상태창 테두리',-.036,.000,.087,.021,.031,.0018,BLACK,.0025)
    top('상판 노출 정보',-.036,.000,.089,.017,.027,'status')
    for px in [-.022,-.013]:disc('상판 제어 버튼',px,-.010,.087,.003,.002,'3D3D3E',True)
    # Finder housing is a low sloping shoulder, not the pyramid of an SLR.
    angular_prism('전자식 파인더 상부 하우징',[(-.026,.084),(.058,.084),(.054,.091),(.047,.099),(-.013,.099),(-.020,.094)],-.022,.023,GUN,True)
    plate('핫슈 베이스',.017,.004,.098,.030,.024,.0028,BLACK,.002)
    for px in [.005,.029]:plate('핫슈 레일',px,.002,.100,.0028,.023,.0017,EDGE,.0007,.0002,True)
    text('파인더 상호','HASSELBLAD',.016,-.0225,.089,.0066,'F3F1EC',shear=.16,spacing=1.23)
    # Eyecup and recessed glass aimed towards the back.
    plate('고무 아이컵',.017,.030,.073,.054,.023,.024,'262729',.006,.002)
    with at(.017,.0422,.078,rz=180): front('접안부 유리',0,0,0,.028,.013,'glass')
    # Rear LCD tilts away from the camera; paired hinges visible from the side.
    for px in [-.035,.039]:
        with at(px,.030,.031,rx=-24):plate('후면 모니터 힌지',0,0,0,.004,.004,.042,'74797C',.001)
    with at(.007,.027,.070,rx=24):
        plate('기울인 후면 모니터',0,.009,-.062,.112,.006,.061,BLACK,.003,.001)
        with at(0,.0125,-.057,rz=180):front('후면 액정',0,0,0,.098,.048,'lcd')
    text('상판 모델명','X2D',-.038,-.014,.0885,.0059,'D4D4D3',rx=0)
    with at(.0752,0,.018,rz=90):
        front('포트 덮개 마감',0,0,0,.032,.049,'grip')
        text('측면 H','H',0,-.0003,.009,.009,'808184',shear=.14)
    with at(.019,-.026,.046,rx=90):lens(0,.070,.036)
    for px in [-.074,.074]:
        with at(px,.006,.069,ry=90):barrel('스트랩 연결 핀',[(-.003,.0035),(.004,.0035)],EDGE,True,n=16)
    with at(.065,-.025,.014,rx=90):disc('렌즈 탈착 버튼',0,0,0,.004,.004,EDGE,True)

def side_patch(name,side,y,z,w,h):
    # Wrap the camera shell with a leatherette insert between the chrome rims.
    with at(side,y,z,rz=90 if side>0 else -90):
        front(name,0,0,0,w,h,'grip')

def front_shell(name,y,z,w,d,h,color,r,metal=False):
    # Rounded rectangle seen along the optical axis. This is the characteristic
    # chrome rim around each square, including the top and bottom front corners.
    with at(0,y+d/2,z+h/2,rx=90):
        return plate(name,0,0,0,w,h,d,color,r,.0009,metal)

def range_body():
    # The 907X is a shallow square, with a separate digital back and a low shutter.
    w,h=.103,.091
    for y,d,col in [(.010,.050,BLACK),(-.022,.016,'313234')]:
        front_shell('모듈 외피',y,0,w,d,h,SILVER,.009,True)
        front_shell('가죽 씌운 몸체',y,.002,w+.0006,d-.005,h-.004,col,.008)
        for side in [-1,1]:side_patch('가죽 측판',side*(w/2+.00045),y,.008,d-.009,h-.016)
        top('상단 가죽',0,y,h+.0002,w-.012,d-.009,'grip')
    # The black front insert leaves a fine chrome bezel around the mount.
    front_shell('전면 검은 세공판',-.0308,.003,.099,.002,.084,'292A2B',.008)
    front('전면 가죽 커버',0,-.032,.010,.090,.072,'grip')
    # Thin exposed chrome joint between body and back.
    plate('분리 접합선',0,-.014,.001,.104,.002,.088,'ADB0B1',.001,.0003,True)
    with at(0,-.031,.045,rx=90):lens(1,.075,.037,hood='round')
    with at(.042,-.030,.013,rx=90):
        disc('전면 하부 셔터 테두리',0,0,0,.006,.003,SILVER,True)
        disc('릴리스',0,0,.003,.004,.002,'505558',True)
    with at(0,.036,.017,rz=180):
        front('디지털 백 액정',0,-.001,.001,.085,.058,'lcd')
    for i in range(5):
        with at(-.033+.016*i,.037,.010,rx=-90):disc('후면 키',0,0,0,.0028,.001,'505051',True,n=14)
    with at(.052,.010,.035,rz=90):text('측면 표식','H',0,-.0008,.001,.021,SILVER,shear=.15,metal=True)
    text('상부 상호','HASSELBLAD',0,.009,h+.0006,.0067,'D2D2CA',rx=0,shear=.16,spacing=1.23)

def classic():
    # Front, hood, interchangeable magazine and winding arm are distinct pieces.
    plate('필름 매거진 하부 슈',0,0,0,.079,.098,.007,GUN,.004,.001,True)
    for y,d in [(-.013,.064),(.040,.041)]:
        front_shell('은색 가장자리',y,.006,.098,d,.091,SILVER,.006,True)
        front_shell('검은 모로코 가죽',y,.009,.0986,d-.006,.084,BLACK,.005)
        for side in [-1,1]:side_patch('가죽 옆판',side*.0495,y,.014,d-.010,.072)
    with at(0,.061,.015,rz=180):front('필름 백 뒷덮개',0,-.0005,0,.085,.073,'grip')
    plate('필름 백 걸쇠',0,.039,.098,.035,.013,.003,EDGE,.002,.0008,True)
    plate('전면 검은 렌즈 보드',0,-.0456,.010,.090,.002,.083,BLACK,.004,.0006)
    front('렌즈 보드 가죽',0,-.0468,.013,.086,.076,'grip')
    for px in [-.042,.042]:
        with at(px,-.047,.087,rx=90):disc('전면 고정 나사',0,0,0,.0017,.0008,EDGE,True,n=12)
    with at(0,-.047,.050,rx=90):
        barrel('렌즈 잠금 링',[(0,.040),(.005,.041),(.008,.039)],SILVER,True)
        lens(1,.061,.033,vintage=True)
    # Blackened steel folding panels surrounding the ground glass.
    with at(0,-.010,.098):
        plate('파인더 크롬 밑틀',0,0,0,.082,.065,.004,SILVER,.0018,.0006,True)
        top('초점 스크린',0,0,.0044,.063,.048,'glass')
        for side in [-1,1]:
            vs=[(side*.037,-.027,.003),(side*.037,.027,.003),
                (side*.042,.030,.047),(side*.041,.010,.055),(side*.041,-.030,.053)]
            mesh('접이식 파인더 측판',vs,[(0,1,2,3,4)],RUBBER)
            with at(side*.039,0,.018,rz=90 if side>0 else -90):
                front('파인더 옆면 가죽',0,0,0,.048,.024,'grip')
        for side,hh in [(-1,.056),(1,.047)]:
            with at(0,side*.028,.003,rx=-side*6):
                plate('파인더 접이식 차광판',0,0,0,.083,.002,hh,BLACK,.0008,.0002)
                plate('파인더 금속 테두리',0,0,hh-.001,.083,.0023,.0013,EDGE,.00035,.0001,True)
        text('파인더 앞판 상호','HASSELBLAD',0,-.0338,.038,.0063,'C6C7C4',shear=.13,spacing=1.12)
    # Metal side dial, lever and knurled finger pin.
    with at(.050,-.014,.050,ry=90):
        barrel('필름 감기 다이얼',[(0,.019),(.002,.021),(.006,.021),(.007,.019)],SILVER,True)
        disc('다이얼 검은 베젤',0,0,.007,.017,.002,BLACK)
        with at(0,0,.009,rz=-32):
            plate('필름 감기 크랭크',0,.013,0,.006,.031,.003,EDGE,.002,.0006,True)
            disc('크랭크 손잡이',0,.025,.002,.0034,.008,BLACK)
    with at(-.049,.039,.049,ry=-90):disc('매거진 다이얼',0,0,0,.012,.004,EDGE,True)
    with at(-.040,-.045,.017,rx=90):disc('케이블 릴리스',0,0,0,.004,.005,SILVER,True)

# Objects are individually editable and can be found by product prefix.
PAD=1.129
with at(-.31,-.108,PAD,rz=-15,title='X2D 100C'):x2d()
with at(.015,-.080,PAD,rz=19,title='V 시스템'):classic()
with at(.322,-.100,PAD,rz=25,title='907X'):range_body()
for x,y,index,h,r,hood in [(-.47,.146,3,.128,.043,None),(-.18,.143,2,.100,.039,'petal'),
                             (.117,.145,1,.079,.037,'round'),(.43,.137,3,.111,.039,'round')]:
    with at(x,y,PAD,title='교환 렌즈'):
        if x<-.4:
            # Long telephoto shown without a readable focal-length mark in the opening photo.
            barrel('장초점 경통',[(0,.034),(.006,.036),(.019,.036),(.035,.039),(.120,.042),(.129,.042)],BLACK,True,caps=False)
            barrel('장초점 포커싱 링',[(.025,.0385),(.058,.0395)],RUBBER,tile='knurl',caps=False)
            barrel('긴 차광통',[(.083,.043),(.155,.0455),(.155,.0432),(.118,.041)],BLACK,True,caps=False)
            glass(.036,.118)
        else:lens(index,h,r,hood)

def aim(ob,point):
    ob.rotation_euler=(Vector(point)-ob.location).to_track_quat('-Z','Y').to_euler()

def render_screen(path):
    # An original still of the physical meshes, lit separately for the dark retail screen.
    studio=bpy.data.scenes.new('제품 촬영')
    studio.render.engine='CYCLES'
    studio.cycles.samples=12
    studio.cycles.seed=19
    studio.render.resolution_x,studio.render.resolution_y=640,360
    studio.render.resolution_percentage=100
    studio.render.threads_mode='FIXED'
    studio.render.threads=4
    studio.view_settings.view_transform='Standard'
    studio.world=bpy.data.worlds.new('촬영 주변광')
    studio.world.use_nodes=True
    studio.world.node_tree.nodes['Background'].inputs[0].default_value=(.018,.022,.038,1)
    studio.world.node_tree.nodes['Background'].inputs[1].default_value=.4
    def studio_ob(name,data):
        ob=bpy.data.objects.new(name,data)
        studio.collection.objects.link(ob)
        return ob
    for original in gallery.objects:
        target=None
        if original.name.startswith('907X · '):target=(.099,.03,0)
        if original.name.startswith('V 시스템 · '):target=(-.097,.018,0)
        if target is None:continue
        ob=original.copy()
        studio.collection.objects.link(ob)
        # Retain the assembled product in local model space.
        cx,cy,angle=(.322,-.100,25) if target[0]>0 else (.015,-.080,19)
        anchor=Matrix.Translation((cx,cy,PAD))
        ob.matrix_world=Matrix.Translation(target) @ Matrix.Rotation(radians(-32 if target[0]>0 else 3),4,'Z') @ anchor.inverted() @ original.matrix_world
    deck=studio_ob('스튜디오 바닥',bpy.data.meshes.new('바닥'))
    deck.data.from_pydata([(-3,-3,-.001),(3,-3,-.001),(3,3,-.001),(-3,3,-.001)],[],[(0,1,2,3)])
    deck.data.materials.append(color_material('17202E'))
    cam=studio_ob('제품 촬영 카메라',bpy.data.cameras.new('정사영'))
    cam.location=(.22,-.78,.30)
    aim(cam,(0,0,.077))
    cam.data.type='ORTHO'
    cam.data.ortho_scale=.465
    studio.camera=cam
    for loc,power,size,rgb in [((-.28,-.25,.48),7,.29,(.86,.91,1)),((.29,.24,.27),10,.22,(.64,.77,1)),((.24,-.27,.16),3,.13,(1,.91,.78))]:
        lamp=bpy.data.lights.new('소프트박스','AREA')
        lamp.energy, lamp.size, lamp.color=power,size,rgb
        ob=studio_ob('소프트박스',lamp)
        ob.location=loc
        aim(ob,(0,0,.055))
    studio.render.image_settings.file_format='JPEG'
    studio.render.image_settings.quality=88
    studio.render.filepath=str(path)
    bpy.ops.render.render(write_still=True,scene=studio.name)
    for ob in list(studio.objects):bpy.data.objects.remove(ob,do_unlink=True)
    bpy.data.scenes.remove(studio)

def prepare_showroom_atlas():
    # Bake contact shadows from the actual seven silhouettes. The cameras only
    # disappear to the orthographic camera ray; they still shade the pad.
    with tempfile.TemporaryDirectory() as directory:
        directory=Path(directory)
        render_screen(directory/'screen.jpg')
        studio=bpy.data.scenes.new('매대 그림자 굽기')
        studio.render.engine='CYCLES'
        studio.cycles.samples=20
        studio.cycles.seed=2208
        studio.render.threads_mode='FIXED'
        studio.render.threads=4
        studio.view_settings.view_transform='Standard'
        studio.render.resolution_x,studio.render.resolution_y=768,336
        studio.render.resolution_percentage=100
        studio.world=bpy.data.worlds.new('매장 확산광')
        studio.world.use_nodes=True
        studio.world.node_tree.nodes['Background'].inputs[0].default_value=(1,1,1,1)
        studio.world.node_tree.nodes['Background'].inputs[1].default_value=.50
        for original in gallery.objects:
            ob=original.copy()
            ob.visible_camera=False
            studio.collection.objects.link(ob)
        plane=bpy.data.meshes.new('그림자 수광면')
        plane.from_pydata([(-2,-2,PAD-.0001),(2,-2,PAD-.0001),(2,2,PAD-.0001),(-2,2,PAD-.0001)],[],[(0,1,2,3)])
        floor=bpy.data.objects.new('수광면',plane)
        studio.collection.objects.link(floor)
        plane.materials.append(color_material('A0A0A0'))
        light=bpy.data.lights.new('확산등','AREA')
        light.size=.72
        light.energy=55
        lamp=bpy.data.objects.new('확산등',light)
        studio.collection.objects.link(lamp)
        lamp.location=(-.48,.65,PAD+1.25)
        aim(lamp,(0,0,PAD))
        camera=bpy.data.objects.new('매대 정사영',bpy.data.cameras.new('수직 촬영'))
        studio.collection.objects.link(camera)
        camera.location=(0,0,PAD+1)
        camera.data.type='ORTHO'
        camera.data.ortho_scale=1.50
        studio.camera=camera
        studio.render.image_settings.file_format='PNG'
        studio.render.filepath=str(directory/'pad.png')
        bpy.ops.render.render(write_still=True,scene=studio.name)
        for ob in list(studio.objects):bpy.data.objects.remove(ob,do_unlink=True)
        bpy.data.scenes.remove(studio)
        def read_rgb(path):
            im=bpy.data.images.load(str(path))
            w,h=im.size
            rgba=np.empty(w*h*4,dtype=np.float32)
            im.pixels.foreach_get(rgba)
            bpy.data.images.remove(im)
            return rgba.reshape(h,w,4)[:,:,:3]
        screen=read_rgb(directory/'screen.jpg')
        lighting=read_rgb(directory/'pad.png').mean(axis=2)
        # Remove broad irradiance falloff. Keep the shaped shadow under each
        # barrel, plus two neutral leather grain frequencies in the gray pad.
        base=np.percentile(lighting,96)
        rng=np.random.default_rng(812)
        grain=rng.normal(1,.021,lighting.shape)
        pad=np.clip(lighting/base,.14,1.04)[:,:,None]*grain[:,:,None]*np.array([.75,.73,.70])
        image=bpy.data.images.new('전시 화면 및 매트',768,704,alpha=False)
        combined=np.ones((704,768,4),dtype=np.float32)
        combined[:360,:640,:3]=screen
        combined[364:700,:,:3]=pad
        image.pixels.foreach_set(combined.ravel())
        image.filepath_raw=str(OUT/'display.jpg')
        image.file_format='JPEG'
        image.save()
        bpy.data.images.remove(image)
    return printed_material('시연대와 전시 화면',OUT/'display.jpg',.55)

showroom=prepare_showroom_atlas()

def showroom_print(name,vertices,faces,uvs,is_screen):
    # One texture and one draw for the shadowed pad and the camera still.
    coords=[[((.5+u*639)/768,(.5+v*359)/704) if is_screen else
              ((.5+u*767)/768,(364.5+v*335)/704) for u,v in face] for face in uvs]
    ob=mesh(name,vertices,faces,BLACK,uvs=coords)
    ob.data.materials.clear()
    ob.data.materials.append(showroom)
    pieces[MATTE].remove(ob)
    pieces[SCREEN].append(ob)
    return ob

# Rear wall in jointed warm-gray panels. A single black island carries a removable grey mat.
with at(title='강남점 시연대'):
    plate('안으로 물린 걸레받이',0,0,.008,1.44,.616,.085,'202022',.012,.002)
    plate('검은 진열대',0,0,.085,1.56,.706,1.015,'303031',.011,.003)
    plate('상판 하부 음영선',0,0,1.091,1.571,.715,.010,'171719',.009,.001)
    plate('흑색 석재 상판',0,0,1.100,1.60,.753,.021,'3B3A3A',.009,.002)
    plate('펠트 패드 테두리',0,0,1.121,1.51,.665,.007,'817970',.032,.0013)
    # Keep corners rounded in the actual printed working surface.
    loop=outline(1.50,.655,.031)
    showroom_print('회색 작업 패드',[(x,y,PAD) for x,y in loop],[list(range(len(loop)))],
                   [[(x/1.50+.5,y/.655+.5) for x,y in loop]],False)
    text('패드 압인','HASSELBLAD',.564,-.265,PAD+.0004,.014,'746E68',rx=0,shear=.18,spacing=1.12)
    # Pinstripe inset (subtle, directly on the rounded mat).
    a,b=outline(1.48,.636,.026),outline(1.477,.633,.0245)
    n=len(a)
    mesh('패드 가장자리 눌림선',[(x,y,PAD+.0002) for ring in (a,b) for x,y in ring],
         [(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)],'A29990')
with at(title='강남점 전시벽'):
    plate('패널 조인트 바탕',0,3.35,.015,6.10,.12,3.25,'3B3938',.003,.001)
    # Narrow dark reveals outline the large mineral-faced panels.
    for j in range(4):
        x=(j-1.5)*1.522
        for k,h in enumerate([.67,1.88,.67]):
            z=[.017,.694,2.581][k]
            plate('회색 전시벽 패널',x,3.275,z,1.512,.04,h,'65615F',.0015,.0005)
            coords=[(x-.7535,3.2547,z+.001),(x+.7535,3.2547,z+.001),
                    (x+.7535,3.2547,z+h-.002),(x-.7535,3.2547,z+h-.002)]
            mesh('패널 표면',coords,[(0,1,2,3)],None,tile='stone',
                 uvs=[[(px/6.10+.5,pz/3.265) for px,py,pz in coords]])
    text('흰색 벽면 상호','HASSELBLAD',.69,3.226,1.97,.282,'FDFBF1',shear=.18,spacing=1.3)
    sx,sz=-1.70,1.43
    plate('제품 영상 모니터',sx,3.213,sz,1.81,.075,1.02,'202124',.007,.0017)
    w,h=1.785,1.004
    z=sz+.008
    showroom_print('매장 화면',[(sx-w/2,3.174,z),(sx+w/2,3.174,z),(sx+w/2,3.174,z+h),(sx-w/2,3.174,z+h)],
                   [(0,1,2,3)],[[(0,0),(1,0),(1,1),(0,1)]],True)
    text('영상 상단 표식','HASSELBLAD',sx,3.173,z+.887,.074,'EEEFF4',shear=.16,spacing=1.25)

# Preserve the individual native components before merging by finish at runtime.
scene.render.engine='CYCLES'
scene['매장']='신세계 강남점 6층 핫셀블라드'
scene['단위']='미터 · Blender -Y 고객 방향, +Z 위'
bpy.context.view_layer.update()
print('EDITABLE_OBJECTS',len(gallery.objects))
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
for key,parts in pieces.items():
    if key in (MATTE,METAL):
        mat=bpy.data.materials.new(key)
        mat.use_nodes=True
        shader=mat.node_tree.nodes['Principled BSDF']
        attr=mat.node_tree.nodes.new('ShaderNodeVertexColor')
        attr.layer_name='Finish'
        mat.node_tree.links.new(attr.outputs['Color'],shader.inputs['Base Color'])
        shader.inputs['Roughness'].default_value=.35 if key==METAL else .68
        shader.inputs['Metallic'].default_value=.41 if key==METAL else 0
        for ob in parts:
            data=ob.data
            rgba=data.materials[0].diffuse_color[:]
            data.materials.clear()
            data.materials.append(mat)
            if key==MATTE:
                colors=data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
                colors.data.foreach_set('color',list(rgba)*len(colors.data))
            else:
                # The interior has no live reflection probe. Preserve a soft,
                # directional reflection on curved black anodised parts in the
                # static runtime batch without a texture or an extra draw.
                data.calc_normals_split()
                colors=data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
                normal_matrix=ob.matrix_world.to_3x3().inverted().transposed()
                eye=Vector((.1,-.78,.62)).normalized()
                lights=[Vector((-.68,-.15,.72)).normalized(),Vector((.8,.32,.48)).normalized()]
                samples=[]
                for loop in data.loops:
                    normal=(normal_matrix@loop.normal).normalized()
                    reflected=2*normal.dot(eye)*normal-eye
                    sheen=sum(max(0,reflected.dot(light))**10*power for light,power in zip(lights,[.22,.13]))
                    samples.extend([min(1,c+sheen*(1-c)) for c in rgba[:3]]+[1])
                colors.data.foreach_set('color',samples)
    bpy.ops.object.select_all(action='DESELECT')
    for ob in parts:ob.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    if len(parts)>1:bpy.ops.object.join()
    parts[0].name=key
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
