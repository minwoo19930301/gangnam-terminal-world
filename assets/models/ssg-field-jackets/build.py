"""Barbour Gangnam. Metres. X right, -Y towards the customer, Z up."""
import math
import struct
import zlib
from pathlib import Path
import bpy
import bmesh
import numpy as np
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new("SSG_7F_Barbour")
bpy.context.scene.collection.children.link(gallery)
bpy.context.scene.unit_settings.system = 'METRIC'
pi, sin, cos = math.pi, math.sin, math.cos
transform = Matrix.Identity(4)
batch = 'BarbourGangnamFixtures'
parts = {}
# A shared, authored textile/wood atlas. Four-pixel gutters prevent mip bleed.
colors = dict(wax='66665a', sage='687461', navy='393e43', cord='5d483e',
              lining='777553', rug='857960', wood='98623c', brass='af8951',
              bone='dfd7c8', trim='807d68', iron='383738', panel='939986',
              cream='d7cebe', stitch='787461', black='333533', label='fff9e4',
              buff='be9673', suede='9e876c', rubber='42443a', pale='b3b4a9',
              moss='454b3c', indigo='393b43', placket='606054', pocket='707063')
keys = list(colors)
tile, cols, rows = 128, 6, 4
jy, ix = np.indices((tile,tile))
rng = np.random.default_rng(32)
atlas = np.zeros((rows*tile, cols*tile, 3), dtype=np.uint8)

def plaid_line(a):
    return ((a%64<22)*-.21+(a%64<7)*-.19+((a+7)%64<3)*.26+
            ((a+12)%64<2)*.31)

for i, key in enumerate(keys):
    base = np.array(list(bytes.fromhex(colors[key])))
    noise = rng.normal(0,1.7,(tile,tile))
    weave = np.where((ix+jy)%4==0,3,-1)
    grain = noise + weave
    rgb = np.broadcast_to(base,(tile,tile,3)).astype(float).copy()
    if key in ('lining','rug'):
        rgb *= (1+plaid_line(ix)[:,:,None]+plaid_line(jy)[:,:,None])
        red = ((ix+28)%64<2)|((jy+28)%64<2)
        rgb[red] = rgb[red]*.44 + np.array([140,57,48])*.56
    elif key == 'wood':
        grain += 6*np.sin(jy*.40 + 2*np.sin(ix*.041))+3*np.cos(jy*1.2+ix*.09)
    elif key == 'cord':
        grain += 12*np.cos(2*pi*ix/5)
    elif key in ('wax','placket','pocket','sage','moss','navy'):
        grain += 3*np.sin(ix*.12+np.sin(jy*.1))+3*np.sin(ix*.24-jy*.09)
    else:
        grain *= .35
    row,col=divmod(i,cols)
    atlas[row*tile:(row+1)*tile,col*tile:(col+1)*tile]=np.clip(rgb+grain[:,:,None],0,255)
# Encode PNG directly, then pack it so native and runtime are standalone.
def chunk(kind,data):
    return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
import tempfile
with tempfile.TemporaryDirectory() as directory:
    path=Path(directory)/'바버 원단과 집기.png'
    # Blender UV origin is bottom left.
    raw=b''.join(b'\0'+row.tobytes() for row in atlas[::-1])
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',cols*tile,rows*tile,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
    texture=bpy.data.images.load(str(path));texture.pack()
    texture.filepath='//바버 원단과 집기.png'

def material(name):
    mat=bpy.data.materials.get(name)
    if mat:return mat
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF')
    image=mat.node_tree.nodes.new('ShaderNodeTexImage');image.image=texture
    colors_node=mat.node_tree.nodes.new('ShaderNodeVertexColor');colors_node.layer_name='형태 음영'
    mix=mat.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
    mat.node_tree.links.new(image.outputs['Color'],mix.inputs[1])
    mat.node_tree.links.new(colors_node.outputs['Color'],mix.inputs[2])
    mat.node_tree.links.new(mix.outputs[0],shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value=.44 if name.endswith('Bedale') else .72
    if name.endswith('Hardware'):
        shader.inputs['Metallic'].default_value=.56
        shader.inputs['Roughness'].default_value=.34
    return mat

def place(x=0,y=0,z=0,deg=0):
    global transform
    transform=Matrix.Translation((x,y,z)) @ Matrix.Rotation(math.radians(deg),4,'Z')

def mesh(name,vs,fs,color,smooth=False,bevel=0):
    data=bpy.data.meshes.new(name);data.from_pydata(vs,[],fs);data.update()
    bm=bmesh.new();bm.from_mesh(data)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    if bevel:
        bmesh.ops.bevel(bm,geom=list(bm.edges),offset=bevel,segments=2,affect='EDGES',clamp_overlap=True)
    bm.to_mesh(data);bm.free()
    ob=bpy.data.objects.new(name,data);gallery.objects.link(ob);ob.matrix_world=transform.copy()
    group='BarbourGangnamHardware' if color=='brass' else batch
    parts.setdefault(group,[]).append(ob);data.materials.append(material(group))
    uv=data.uv_layers.new(name='재단')
    co=np.array([v.co[:] for v in data.vertices]);lo=co.min(axis=0);extent=np.maximum(co.max(axis=0)-lo,.00001)
    norm=(co-lo)/extent
    row,col=divmod(keys.index(color),cols)
    for f in data.polygons:
        f.use_smooth=smooth and len(f.vertices)==4
        n=f.normal;axis=max(range(3),key=lambda a:abs(n[a]))
        horizontal,vertical=((1,2),(0,2),(0,1))[axis]
        for li in f.loop_indices:
            v=norm[data.loops[li].vertex_index]
            uv.data[li].uv=((col+.025+.95*v[horizontal])/cols,(row+.025+.95*v[vertical])/rows)
    # Preserve soft directional modelling under the game's even indoor lighting.
    tint=data.color_attributes.new(name='형태 음영',type='BYTE_COLOR',domain='POINT')
    light=Vector((-.45,-.64,.62)).normalized()
    for vert in data.vertices:
        dot=vert.normal.dot(light)
        value=.77+.21*dot
        if color in ('wax','placket','pocket','navy','moss'):
            x,y,z=vert.co
            value += .055*sin(24*x+8*y+2*sin(z*15))+.026*cos(z*38+x*11)
        value=min(1,max(.42,value))
        tint.data[vert.index].color=(value,value,value,1)
    return ob

def rings(name,loops,color,smooth=False,cap=True):
    n=len(loops[0])
    faces=[(k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j) for k in range(len(loops)-1) for j in range(n)]
    if cap:faces += [list(reversed(range(n))),list(range((len(loops)-1)*n,len(loops)*n))]
    return mesh(name,[p for r in loops for p in r],faces,color,smooth)

def block(name,x,y,z,w,d,h,c,bevel=0):
    pts=[(x+i*w/2,y+j*d/2,z+k*h/2) for k in [-1,1] for i,j in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return mesh(name,pts,[(0,1,2,3),(4,5,6,7),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],c,bevel=bevel)

def tube(name,points,r,c,n=8,radii=None):
    pts=[Vector(p) for p in points];loops=[]
    for k,p in enumerate(pts):
        axis=(pts[min(k+1,len(pts)-1)]-pts[max(0,k-1)]).normalized()
        a=axis.cross(Vector((0,1,0)))
        if a.length<.01:a=axis.cross(Vector((0,0,1)))
        a.normalize();b=axis.cross(a);rad=radii[k] if radii else r
        loops.append([p+rad*(a*cos(j*2*pi/n)+b*sin(j*2*pi/n)) for j in range(n)])
    return rings(name,loops,c,True)

def profile(name,levels,c,n=24,fold=0):
    loops=[]
    for k,(x,y,z,w,d) in enumerate(levels):
        ring=[]
        for j in range(n):
            a=2*pi*j/n
            ripple=fold*(.52*sin(7*a+z*7)+.32*sin(10*a-z*9)+.16*cos(3*a+z*18))
            ring.append((x+(w+ripple)*cos(a),y+(d+ripple)*sin(a),z+fold*.5*sin(a*4+z*5)))
        loops.append(ring)
    ob=rings(name,loops,c,True)
    # Continuous wrap for the yarn and wax grain on curved sewn panels.
    data=ob.data;uv=data.uv_layers.active;row,col=divmod(keys.index(c),cols)
    h=levels[-1][2]-levels[0][2]
    if h>.025:
        for f in data.polygons:
            if len(f.vertices)!=4:continue
            seam=any(v%n==0 for v in f.vertices) and any(v%n==n-1 for v in f.vertices)
            for li in f.loop_indices:
                v=data.loops[li].vertex_index
                u=(v%n)/n
                if seam and u==0:u=1
                t=(levels[v//n][2]-levels[0][2])/h
                uv.data[li].uv=((col+.025+.95*u)/cols,(row+.025+.95*t)/rows)
    return ob

def cut(name,points,color,thick=.005):
    return rings(name,[points,[(x,y+thick,z) for x,y,z in points]],color)

def stud(x,y,z,rad=.009):
    tube('오목한 스냅 테두리',[(x,y,z),(x,y-.004,z)],rad,'iron',12)
    tube('스냅 중앙',[(x,y-.004,z),(x,y-.005,z)],rad*.58,'trim',10)

def hanger():
    tube('너도밤나무 옷걸이',[(-.25,0,1.65),(-.19,0,1.70),(-.04,0,1.78),(0,0,1.79),(.04,0,1.78),(.19,0,1.70),(.25,0,1.65)],.023,'buff')
    tube('옷걸이 갈고리',[(0,0,1.79),(0,0,1.85),(.022,0,1.87),(.021,0,1.89),(0,0,1.903),(-.018,0,1.894),(-.021,0,1.88)],.0037,'brass')

def coat(color='wax',hero=True):
    # An A-line shell with a lifted, narrowed neck and a soft rolled lower edge.
    body=[(.89,.257,.110),(.902,.269,.116),(.93,.272,.121),(1.02,.264,.126),
          (1.14,.261,.131),(1.24,.254,.121),(1.29,.251,.125),(1.32,.259,.134),
          (1.43,.256,.138),(1.55,.263,.141),(1.62,.250,.129),(1.68,.215,.109),
          (1.72,.157,.085),(1.755,.088,.066)]
    profile('왁스 코튼 몸판',[(0,0,z,w,d) for z,w,d in body],color,36 if hero else 18,.009)
    def front(x,z):
        for (za,wa,da),(zb,wb,db) in zip(body,body[1:]):
            if z<=zb:break
        t=max(0,min(1,(z-za)/(zb-za)));w=wa+(wb-wa)*t;d=da+(db-da)*t
        return -d*math.sqrt(max(.04,1-(x/w)**2))-.006
    for s in [-1,1]:
        arm=[(.331,.91,.061,.065),(.333,.925,.067,.071),(.334,.96,.069,.072),
             (.332,1.05,.073,.078),(.32,1.19,.081,.077),(.312,1.226,.079,.073),
             (.314,1.245,.091,.089),(.304,1.269,.081,.075),(.304,1.294,.093,.093),
             (.292,1.36,.09,.086),(.278,1.48,.096,.099),(.253,1.58,.107,.098),
             (.223,1.645,.097,.086),(.183,1.684,.079,.074),(.13,1.71,.046,.05)]
        profile('라글란 소매',[(s*x,-.035*(1.71-z),z,w,d) for x,z,w,d in arm],color,20 if hero else 12,.006)
        if not hero:continue
        for side in [-1,1]:
            tube('라글란 절개 봉제선',[(s*x,y*side,z) for x,y,z in [(.094,.057,1.736),(.14,.079,1.69),(.185,.094,1.63),(.218,.091,1.58),(.252,.085,1.51)]],.0023,'stitch')
        # Project the pocket across the curved shell. Separate gusset, face, lid and piping.
        shape=[(.052,.965),(.065,.947),(.197,.948),(.219,.966),(.225,1.15),(.052,1.15)]
        def pocket_pts(coords,offset):
            return [(s*x,front(s*x,z)-offset,z) for x,z in coords]
        rings('벨로즈 주머니 접힌 옆폭',[pocket_pts(shape,off) for off in [.002,.019,.037]],'placket')
        inset=[(.137+(x-.137)*.95,1.057+(z-1.057)*.96) for x,z in shape]
        rings('볼륨 있는 주머니 앞판',[pocket_pts(shape,.036),pocket_pts(inset,.043)],'pocket')
        tube('주머니 바닥 박음선',pocket_pts(inset[:4],.046),.002,'stitch',5)
        lid=[(.047,1.169),(.229,1.169),(.224,1.109),(.205,1.095),(.062,1.098),(.049,1.108)]
        cut('두 단추 주머니 덮개',pocket_pts(lid,.052),color,.009)
        tube('덮개 가장자리 상침',pocket_pts(lid[1:]+[lid[0]],.056),.0016,'stitch',5)
        for x in [.071,.206]:stud(s*x,front(s*x,1.125)-.057,1.125,.007)
        for dx,shade in [(0,'iron'),(.009,color)]:
            tube('몰스킨 손주머니 입술',pocket_pts([(.206+dx,1.466),(.198+dx,1.425),(.176+dx,1.377),(.153+dx,1.316)],.012),.007,shade)
        # Two overlapping riding vents visible from the rear.
        tube('뒷트임 겹단',[(s*.197,.070,.90),(s*.188,.092,1.036),(s*.176,.093,1.105)],.006,'placket')
    # The corduroy collar sweeps from pointed front leaves across the nape.
    for s in [-1,1]:
        cut('골덴 칼라 깃',[(s*.012,-.077,1.751),(s*.075,-.050,1.791),(s*.118,0,1.75),
            (s*.18,-.085,1.65),(s*.148,-.132,1.635),(s*.070,-.117,1.685)],'cord',.011)
    profile('코듀로이 뒷목 칼라',[(0,.027,1.717,.12,.08),(0,.03,1.76,.109,.077),(0,.025,1.784,.091,.063)],'cord',24)
    cut('타탄 안깃',[(-.071,-.096,1.754),(.074,-.096,1.754),(.055,-.132,1.686),(.013,-.158,1.585),(-.043,-.139,1.676)],'lining')
    if hero:
        cut('안깃 직조 라벨',[(-.042,-.103,1.746),(.044,-.103,1.746),(.044,-.112,1.727),(-.042,-.112,1.727)],'black')
    if not hero:
        strip=[(-.014,front(0,z)-.012,z) for z in (.91,1.29,1.54,1.70)]
        for a,b in zip(strip,strip[1:]):
            cut('재킷 앞여밈',[a,(a[0]+.024,a[1],a[2]),(b[0]+.024,b[1],b[2]),b],color)
        for z in (.99,1.24,1.48):stud(.002,front(0,z)-.016,z,.006)
    if hero:
        zs=[.90,1.05,1.23,1.39,1.55,1.60,1.68,1.73]
        left=[(.009-.069*max(0,(z-1.58)/.15),front(0,z)-.013,z) for z in zs]
        right=[(.045+.045*max(0,(z-1.58)/.15),front(0,z)-.016,z) for z in zs]
        for k in range(len(zs)-1):
            cut('방풍 앞섶',[left[k],right[k],right[k+1],left[k+1]],'placket',.008)
        for z in [.938,1.073,1.209,1.346,1.489,1.607]:stud(.027,front(0,z)-.022,z)
        tube('황동 양방향 지퍼',[(-.012,-.154,1.559),(-.012,-.154,1.582),(-.047,-.133,1.674),(-.062,-.099,1.724)],.0036,'brass')
        tube('황동 링 풀러',[(-.012+.014*cos(a*pi/8),-.161,1.55+.018*sin(a*pi/8)) for a in range(17)],.0036,'brass',7)
        tube('지퍼 슬라이더',[(-.012,-.15,1.57),(-.012,-.163,1.57)],.009,'brass',8)

def table(x,y,h,r):
    place(x,y)
    profile('원목 원형 상판',[(0,0,h-.045,r-.016,r-.016),(0,0,h-.035,r,r),(0,0,h-.008,r,r),(0,0,h,r-.009,r-.009)],'wood',48)
    for i in range(3):
        a=pi*(2*i/3+.14);sx,sy=cos(a),sin(a)
        tube('바깥으로 벌어진 원목 다리',[(sx*r*.91,sy*r*.91,.043),(sx*r*.84,sy*r*.84,h*.25),(sx*r*.62,sy*r*.62,h-.042)],.034,'wood',12,[.018,.026,.044])
        tube('다리 황동 발끝',[(sx*r*.93,sy*r*.93,.018),(sx*r*.89,sy*r*.89,.085)],.019,'brass',10)

def boot(x,y,z):
    place(x,y,z,-9)
    sole=[(-.063,-.113),(-.05,-.161),(-.024,-.183),(.029,-.183),(.059,-.157),(.071,-.099),(.054,.101),(-.05,.111)]
    rings('장화 밑창',[[(a,b,h) for a,b in sole] for h in [0,.022,.034]],'iron')
    profile('둥근 장화 발등',[(0,-.028,.034,.064,.143),(0,-.035,.063,.066,.14),
        (0,-.019,.084,.061,.13),(0,.009,.109,.053,.093),(0,.036,.141,.051,.065)],'rubber',24)
    profile('고무 장화 목',[(0,.037,.106,.051,.067),(0,.043,.150,.052,.066),(0,.043,.214,.056,.068),
        (0,.043,.254,.063,.071),(0,.043,.264,.064,.073),(0,.043,.269,.062,.070)],'moss',24)
    profile('장화 안쪽',[(0,.043,.2694,.052,.06),(0,.043,.270,.052,.06)],'iron')
    cut('장화 당김 고리',[(0,.105,.245),(.014,.105,.246),(.014,.108,.282),(0,.108,.283)],'brass')

def knit_cap(x,y,z):
    place(x,y,z,14)
    profile('접어 올린 모자',[(0,0,.008,.119,.106),(0,0,.035,.130,.12),(0,0,.071,.127,.119),
         (0,0,.095,.115,.109),(0,0,.141,.082,.083),(0,0,.16,.036,.043),(0,0,.164,.012,.014)],'suede')
    profile('모자 챙',[(0,-.086,.009,.113,.108),(0,-.091,.016,.108,.108),(0,-.075,.025,.104,.092)],'suede')

def folded(x,y,z,w,d,c,angle):
    place(x,y,z,angle)
    block('접은 원단',0,0,.027,w,d,.052,c,.018)
    block('겹친 소매',w*.10,-.01,.056,w*.71,d*.86,.025,c,.01)

def logo(x,y,z,size):
    place()
    font=bpy.data.curves.new('상호','FONT');font.body='Barbour';font.size=size
    serif=Path('/System/Library/Fonts/Supplemental/Georgia Bold.ttf')
    if serif.is_file():font.font=bpy.data.fonts.load(str(serif))
    font.align_x='CENTER';font.extrude=.002;font.resolution_u=5
    # The type is converted to editable mesh geometry before saving.
    text=bpy.data.objects.new('상호 원형',font);gallery.objects.link(text)
    text.location=(x,y,z);text.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    raw=bpy.data.meshes.new_from_object(text.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    vertices=[text.matrix_world @ v.co for v in raw.vertices]
    mesh('바버 입체 글자',vertices,[tuple(p.vertices) for p in raw.polygons],'label')
    bpy.data.objects.remove(text,do_unlink=True);bpy.data.meshes.remove(raw)
    bpy.data.curves.remove(font)

# The store photograph shows a sage panelled wall, brass fixtures and a plaid rug.
place()
block('세이지색 진열 벽',0,1.34,1.24,5.72,.13,2.48,'panel',.012)
for x in [-2.80,-1.04,-.08,.93,1.86,2.80]:
    block('몰딩 세로대',x,1.254,1.24,.035,.035,2.45,'trim',.005)
for z in [.09,2.42]:
    block('몰딩 가로대',0,1.249,z,5.68,.038,.048,'trim',.004)
logo(-1.90,1.203,2.088,.26)
block('쪽마루 바탕',0,.08,-.006,5.72,2.36,.014,'wood')
block('체크 러그',.19,-.012,.018,3.75,2.23,.025,'rug',.006)
# Chevron parquet clipped to a rectangular perimeter; the rug lies above it.
for i in range(10):
    for j in range(14):
        x0=-2.86+i*.572; y0=-1.29+j*.20+(.24 if i%2 else 0)
        slope=.24 if i%2==0 else -.24
        corners=[(x0,y0),(x0+.571,y0+slope),(x0+.571,y0+slope+.198),(x0,y0+.198)]
        for bound,sign in [(-1.10,1),(1.26,-1)]:
            clipped=[]
            for a,b in zip(corners,corners[1:]+corners[:1]):
                ina=(a[1]-bound)*sign>=0;inb=(b[1]-bound)*sign>=0
                if ina:clipped.append(a)
                if ina!=inb:
                    t=(bound-a[1])/(b[1]-a[1]);clipped.append((a[0]+t*(b[0]-a[0]),bound))
            corners=clipped
        if len(corners)>2:
            mesh('사선 쪽마루',[(x,y,.003) for x,y in corners],[tuple(range(len(corners)))],'wood')
place()
for x in [-2.62,-1.13]:
    block('행거 사각 발',x,.71,.103,.36,.40,.038,'brass',.008)
    tube('황동 행거 기둥',[(x,.71,.12),(x,.71,1.885)],.018,'brass')
tube('황동 옷봉',[(-2.66,.71,1.886),(-1.09,.71,1.886)],.018,'brass')
for i,color in enumerate(['navy','moss','pale','wax','navy','cream']):
    place(-2.48+i*.233,.71,.0,65+[3,-5,0][i%3]);hanger();coat(color,False)

# The primary freestanding hanger has a foot plate and a short forward cantilever.
place(-.81,-.22)
block('단독 행거 황동 받침',0,.104,.05,.55,.38,.045,'brass',.012)
tube('각진 황동 기둥',[(0,.19,.068),(0,.19,1.884),(0,-.025,1.884)],.019,'brass',4)
place(-.81,-.25,0,-7);hanger();batch='BarbourGangnamBedale';coat();batch='BarbourGangnamFixtures'

# A window mannequin wears a dark jacket and scarf as in the branch display.
place(.91,.69,0,-9)
block('마네킹 받침',0,0,.06,.45,.34,.055,'trim',.009)
for s in [-1,1]:
    profile('마네킹 바짓가랑이',[(s*.093,0,.13,.065,.074),(s*.093,0,.17,.071,.077),
        (s*.093,0,.49,.078,.081),(s*.087,0,.58,.074,.084),(s*.083,0,.89,.091,.099),(s*.072,0,.98,.097,.101)],'indigo')
    profile('마네킹 구두',[(s*.096,-.045,.078,.067,.13),(s*.096,-.05,.095,.07,.135),(s*.096,-.043,.136,.066,.119),(s*.096,-.014,.168,.056,.082)],'iron')
coat('navy',False)
profile('무광 마네킹 목과 머리',[(0,0,1.74,.052,.051),(0,0,1.80,.054,.049),
    (0,-.012,1.82,.065,.064),(0,-.012,1.87,.086,.088),(0,0,1.94,.096,.093),
    (0,.005,2.015,.095,.093),(0,.006,2.051,.068,.072),(0,.005,2.065,.033,.039)],'bone',28)
profile('타탄 목도리 감은 부분',[(0,0,1.718,.102,.091),(0,0,1.76,.113,.09),(0,0,1.799,.088,.068)],'lining')
cut('타탄 목도리 긴 끝',[(-.06,-.114,1.74),(.018,-.115,1.74),(-.018,-.157,1.33),(-.115,-.146,1.35)],'lining')
# The pale, cap-wearing mannequin is set half a step behind its companion.
place(.19,.83,-.035,4)
for side in (-1,1):
    profile('크림 재킷 마네킹 바지',[(side*.095,0,.10,.067,.08),(side*.095,0,.52,.083,.084),(side*.076,0,1.01,.09,.093)],'moss',16)
    profile('마네킹 신발',[(side*.095,-.04,.074,.069,.128),(side*.095,-.045,.102,.069,.13),(side*.095,0,.16,.055,.07)],'iron',16)
def padded(name,levels,c,n):
    expanded=[]
    for a,b in zip(levels,levels[1:]):
        expanded += [a,tuple((v+w)*.5 if i<3 else (v+w)*.535 for i,(v,w) in enumerate(zip(a,b)))]
    profile(name,expanded+[levels[-1]],c,n,.004)
padded('밝은 누빔 몸판',[(0,0,z,w,d) for z,w,d in [(.91,.225,.108),(1.05,.246,.13),(1.20,.245,.13),(1.35,.248,.135),(1.50,.25,.139),(1.62,.231,.122),(1.71,.145,.091),(1.75,.091,.073)]],'cream',24)
for side in [-1,1]:
    padded('누빔 소매',[(side*x,-.015,z,w,d) for x,z,w,d in [(.31,.98,.066,.066),(.303,1.11,.077,.077),(.296,1.26,.088,.083),(.286,1.4,.095,.087),(.261,1.54,.101,.101),(.218,1.64,.087,.083),(.167,1.69,.06,.06)]],'cream',16)
# Dark knit under the parted collar and the pale jacket's own bound edges.
neckline=[(1.773,.065,-.091),(1.737,.082,-.119),(1.68,.076,-.148),
          (1.59,.056,-.162),(1.49,.032,-.166),(1.38,.006,-.161)]
for (za,wa,ya),(zb,wb,yb) in zip(neckline,neckline[1:]):
    cut('니트 이너',[(-wa,ya,za),(wa,ya,za),(wb,yb,zb),(-wb,yb,zb)],'iron')
for side in [-1,1]:
    cut('높은 패딩 칼라',[(side*.059,-.060,1.78),(side*.123,-.041,1.78),(side*.161,-.083,1.70),(side*.075,-.141,1.56)],'pale',.016)
tube('패딩 지퍼',[(-.014,-.126,.923),(-.014,-.143,1.11),(-.015,-.141,1.36),(.056,-.150,1.57),(.097,-.106,1.723)],.004,'trim')
for side in [-1,1]:
    tube('패딩 손주머니',[(side*.194,-.086,1.21),(side*.158,-.112,1.10)],.005,'trim')
    for z in [1.08,1.23,1.38,1.53]:
        tube('패딩 몸판 퀼팅',[(side*.018,-.136,z),(side*.088,-.129,z-.005),(side*.16,-.105,z-.012),(side*.21,-.073,z-.016)],.0018,'pale')
tube('크로스백 어깨끈',[(-.17,-.094,.99),(-.12,-.137,1.14),(.03,-.159,1.44),(.16,-.104,1.68)],.019,'iron',6)
block('크로스백',-.17,-.113,1.06,.18,.065,.205,'suede',.025)
profile('마네킹 얼굴',[(0,0,1.74,.053,.053),(0,-.012,1.82,.061,.063),(0,0,1.91,.094,.094),(0,0,1.98,.09,.091),(0,0,2.01,.055,.059)],'bone',24)
profile('마네킹 볼캡',[(0,0,1.948,.099,.104),(0,0,1.984,.10,.105),(0,0,2.024,.087,.09),(0,0,2.052,.052,.061),(0,0,2.064,.012,.016)],'moss',24)
profile('볼캡 챙',[(0,-.080,1.948,.093,.084),(0,-.078,1.957,.093,.084)],'moss',24)
table(.19,-.26,.90,.53);table(1.08,-.48,.62,.389)
folded(.22,-.34,.903,.47,.28,'lining',-7);knit_cap(-.067,-.26,.907)
boot(.986,-.59,.622);boot(1.145,-.57,.622)
place(1.14,-.33,.625,-12)
profile('누빔 토트백',[(0,0,0,.152,.065),(0,0,.024,.167,.074),(0,0,.165,.184,.061),(0,0,.235,.187,.048),(0,0,.245,.184,.047)],'indigo',24)
for y in [-.042,.041]:
    tube('토트백 손잡이',[(-.10,y,.21),(-.083,y,.32),(-.050,y,.399),(0,y,.415),(.05,y,.399),(.085,y,.32),(.10,y,.21)],.010,'iron',8)
for j in range(5):
    start=-.143+j*.062
    tube('토트백 사선 누빔',[(start,-.066,.052),(start+.055,-.069,.111),(start+.10,-.057,.170)],.0018,'trim',5)
folded(.39,.01,.905,.27,.20,'suede',5)
place()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
print('EDITABLE',len(gallery.objects))
for group,obs in parts.items():
    bpy.ops.object.select_all(action='DESELECT')
    for ob in obs:ob.select_set(True)
    bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join()
    bpy.context.object.name=group
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
