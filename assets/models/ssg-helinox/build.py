"""Author the Gangnam Snow Peak display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_8F_SnowPeak')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
batch = 'SnowPeakGangnamCanvas'
palette = dict(khaki='AD9962', edge='867646', thread='CAAF79', sand='C09C70', roof='B18864',
    fly='D5B98A', darkfly='896C53', shadow='614A3C', canvas='E8DCC5', bronze='635344',
    pearl='D5D4C8', silver='BCC4C4', steel='888F90', tin='9F9995', graphite='444647',
    rubber='343333', birch='CEA674', honey='BE8D54', endgrain='A97747', light='FFF1CA',
    ivory='F5EDDB', white='F4F1E7', ink='332F2B', bark='6E4E39', coal='524A41')
metal_colors={'bronze','silver','steel','tin','graphite','pearl'}
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
    pieces.setdefault('SnowPeakGangnamHardware' if color in metal_colors else batch,[]).append(ob)
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
            warp=(x//4+y//4)%2
            value=round(234+10*cos((x if warp else y)*pi/2)+4*sin((y if warp else x)*pi/4))
            scan.extend([value]*3)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',n,n,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(scan))+chunk(b'IEND',b'')
    with tempfile.TemporaryDirectory() as directory:
        path=Path(directory)/'canvas-weave.png';path.write_bytes(png)
        image=bpy.data.images.load(str(path));image.pack();image.filepath='//canvas-weave.png'
    return image

weave=fabric_image()
def cloth(name,rows,col):
    width=len(rows[0])
    faces=[(i*width+j,i*width+j+1,(i+1)*width+j+1,(i+1)*width+j)
           for i in range(len(rows)-1) for j in range(width-1)]
    ob=smooth(part(name,[p for row in rows for p in row],faces,col))
    uv=ob.data.uv_layers.new(name='직조')
    lengths=[0]
    for a,b in zip(rows,rows[1:]):
        lengths.append(lengths[-1]+(Vector(a[width//2])-Vector(b[width//2])).length)
    for loop in ob.data.loops:
        row,j=divmod(loop.vertex_index,width)
        along=sum((Vector(b)-Vector(a)).length for a,b in zip(rows[row][:j],rows[row][1:j+1]))
        uv.data[loop.index].uv=(along/.095,lengths[row]/.095)
    return ob

def lathe(name,x,y,z,profile,col,n=32):
    rings=[[(x+r*cos(j*2*pi/n),y+r*sin(j*2*pi/n),z+h) for j in range(n)] for r,h in profile]
    return smooth(skins(name,rings,col))

def chair(x,y,angle):
    place(x,y,.03,angle)
    # Continuous sag across the seat and back. Binding follows both free edges.
    rows=[]
    for depth,h,half,sag in [(-.255,.36,.254,.012),(-.235,.362,.252,.016),(-.15,.342,.25,.029),
        (.005,.325,.25,.042),(.135,.338,.246,.034),(.157,.385,.247,.023),
        (.19,.50,.249,.016),(.238,.69,.253,.012),(.295,.875,.254,.012),(.312,.928,.257,.008)]:
        row=[]
        for j in range(17):
            t=j/8-1; drape=1-t*t
            row.append((half*t,depth+(.039*drape if h>.38 else .005*drape),
                        h-sag*drape+.004*sin(3*pi*t)*drape))
        rows.append(row)
    cloth('등판과 좌판의 처진 캔버스',rows,'khaki')
    for row in [rows[0],rows[-1]]:tubing('말아 박은 가로 바인딩',row,.007,'edge')
    for side in [-1,1]:
        k=0 if side<0 else -1
        tubing('옆단 바인딩',[row[k] for row in rows],.008,'edge')
        tubing('옆단 박음선',[(row[k][0]-side*.008,row[k][1]-.002,row[k][2]+.003) for row in rows],.002,'thread',5)
        s=side*.255
        tubing('등판 지지관',[(s,-.245,.035),(s,-.233,.065),(s,.15,.37),(s,.315,.923)],.014,'silver')
        tubing('팔걸이 지지관',[(s,.27,.035),(s,.25,.064),(s,-.18,.46),(s,-.194,.502)],.013,'silver')
        plate('대나무 팔걸이',s,-.007,.50,.053,.416,.031,.022,'birch')
        for xoff in [-.015,.012]:
            tubing('대나무 결',[(s+xoff,-.182,.532),(s+xoff+.002,.06,.532),(s+xoff,.17,.532)],.0009,'honey',4)
        for depth,h in [(-.015,.263),(-.155,.478),(.175,.508)]:
            rod('축받이',(s-side*.016,depth,h),(s+side*.017,depth,h),.022,'graphite')
            rod('리벳',(s+side*.018,depth,h),(s+side*.024,depth,h),.011,'silver')
        for depth in [-.245,.27]:plate('미끄럼 방지 발',s,depth,.004,.047,.063,.042,.012,'rubber')
        tubing('가로 접힘 가새',[(s,-.215,.061),(-s,-.19,.329)],.010,'silver')
    tubing('좌판 앞 가로대',[(-.26,-.247,.349),(.26,-.247,.349)],.012,'silver')
    tubing('등판 뒤 포켓 테두리',[(-.19,.26,.63),(-.17,.248,.479),(0,.27,.45),(.17,.248,.479),(.19,.26,.63)],.005,'edge')
    cloth('등판 뒤 포켓',[[(-.18,.251,.485),(0,.29,.467),(.18,.251,.485)],
         [(-.195,.275,.632),(0,.319,.625),(.195,.275,.632)]],'khaki')

# Arched shelter viewed through its open front. Fly bows span the fabric;
# the inner zipped wall is set back so the lamp and two chairs read in depth.
place()
def arch(t,depth,w,h):
    return (w*cos(t),depth,.035+h*max(0,sin(t))**.83)
ribs=[(.00,1.22,1.71),(.33,1.30,1.90),(1.05,1.39,2.08),(1.82,1.30,1.94),(2.22,1.13,1.68)]
for i,((a,w,h),(b,w2,h2)) in enumerate(zip(ribs,ribs[1:])):
    rows=[]
    for k in range(6):
        f=k/5
        rows.append([arch(pi*j/30,a+(b-a)*f,(1-f)*w+f*w2-.025*sin(pi*f),
                       (1-f)*h+f*h2-.045*sin(pi*f)) for j in range(31)])
    cloth('아치 사이 플라이',rows,'fly' if i%2==0 else 'sand')
for i,(depth,w,h) in enumerate(ribs):
    points=[arch(j*pi/38,depth,w+.012,h+.009) for j in range(39)]
    tubing('외부 폴 슬리브',points,.024,'darkfly',8)
    for j in [5,12,26,33]:
        tubing('폴 이음쇠',points[j:j+2],.026,'bronze',8)
for side in [-1,1]:
    tubing('대각선 폴',[arch(pi*(.04+.91*k/44) if side==1 else pi*(.96-.91*k/44),
          2.22*k/44,1.32,1.97+.13*sin(pi*k/44)) for k in range(45)],.014,'bronze')
    cloth('접힌 입구 날개',[[ (side*.92,.045,.055),(side*1.22,.005,.055)],
         [(side*1.00,.12,.53),(side*1.15,.014,.67)],[(side*.80,.09,1.12),(side*.93,.02,1.23)],
         [(side*.48,.06,1.55),(side*.55,.004,1.58)]],'sand')
plate('텐트 바닥',0,1.09,.013,2.40,2.15,.027,.10,'shadow')
back=[arch(j*pi/32,2.20,1.13,1.68) for j in range(33)]
part('안쪽 텐트 벽',back, [tuple(range(len(back)))],'sand')
tubing('안쪽 출입구 지퍼',[arch(j*pi/32,2.18,.85,1.41) for j in range(33)],.017,'shadow')
# Rolled flap folds hang just below the front hoop.
tubing('말아 올린 출입구 천',[(-.84,.012,1.39),(-.58,-.015,1.54),(-.27,-.047,1.585),
    (0,-.055,1.59),(.27,-.03,1.58),(.57,-.024,1.54),(.84,.013,1.39)],.051,'sand',10)
for x in [-.53,.52]:rod('출입구 고정끈',(x,-.049,1.51),(x,-.035,1.61),.011,'shadow')
place(0,-.35,-.18)
tubing('랜턴 연결 코드',[(0,.30,2.04),(-.027,.25,1.84)],.003,'shadow')
tubing('랜턴 걸이',[(-.027,.25,1.84),(0,.25,1.76),(.034,.25,1.71),(0,.25,1.67)],.004,'bronze')
lathe('랜턴 갓',0,.25,1.62,[(.043,0),(.095,.004),(.079,.019),(.043,.03),(.035,.045)],'honey')
lathe('랜턴 확산통',0,.25,1.47,[(.045,0),(.061,.021),(.063,.142),(.055,.151)],'light')
lathe('랜턴 하단',0,.25,1.408,[(.036,0),(.040,.006),(.04,.052),(.053,.064)],'honey')
chair(-.86,-.39,16);chair(.83,-.36,-18)
def mug(x,y,z):
    lathe('티타늄 머그와 안쪽 벽',x,y,z,[(.036,0),(.041,.005),(.043,.088),(.044,.092),(.0415,.094),
          (.040,.09),(.038,.009)],'tin')
    for shift in [-.009,.009]:
        tubing('접이식 머그 손잡이',[(x+.04,y+shift,z+.073),(x+.058,y+shift,z+.077),
               (x+.072,y+shift,z+.070),(x+.071,y+shift,z+.043),(x+.055,y+shift,z+.023),(x+.040,y+shift,z+.024)],.0027,'silver')
        rod('손잡이 고정쇠',(x+.041,y+shift,z+.02),(x+.041,y+shift,z+.077),.0035,'steel')

def kettle(x,y,z):
    lathe('스테인리스 주전자',x,y,z,[(.071,0),(.081,.01),(.082,.204),(.085,.211),(.079,.217),
       (.075,.218),(.074,.224),(.027,.234)],'silver')
    tubing('뚜껑 손잡이',[(x-.021,y,z+.233),(x-.018,y,z+.254),(x+.018,y,z+.254),(x+.021,y,z+.233)],.004,'steel')
    for offset in [-.009,.009]:
        tubing('주전자 접이식 손잡이',[(x+.078,y+offset,z+.173),(x+.136,y+offset,z+.174),
            (x+.143,y+offset,z+.166),(x+.14,y+offset,z+.077),(x+.078,y+offset,z+.059)],.0038,'steel')
    rings=[]
    for dx,h,r in [(-.063,.090,.031),(-.085,.125,.027),(-.108,.165,.019),(-.132,.184,.019)]:
        rings.append([(x+dx+r*.65*cos(j*pi/10),y+r*sin(j*pi/10),z+h+r*.65*cos(j*pi/10)) for j in range(20)])
    smooth(skins('주전자 주둥이',rings,'silver',cap=False))
    for side in [-1,1]:rod('들손 경첩',(x,y+side*.08,z+.18),(x,y+side*.086,z+.18),.009,'graphite')
    tubing('세운 들손',[(x,y+.084*cos(j*pi/22),z+.18+.128*sin(j*pi/22)) for j in range(23)],.0033,'steel')

place(0,-1.09,.025,0)
for x in [-.60,.60]:
    for y in [-.233,.233]:
        tubing('테이블 다리',[(x*1.12,y*1.22,.012),(x*1.105,y*1.19,.040),(x,y,.412)],.014,'graphite')
        rod('높이 조절 발',(x*1.12,y*1.22,.004),(x*1.12,y*1.22,.033),.019,'rubber')
    rod('테이블 끝 가로대',(x,-.25,.411),(x,.25,.411),.017,'silver')
for y in [-.25,.25]:
    plate('알루미늄 레일',0,y,.405,1.35,.031,.041,.005,'silver')
for x in [-.50,-.34,.34,.50]:
    plate('대나무 상판',x,0,.416,.153,.47,.033,.012,'birch')
    for j in [-.041,.017,.049]:
        tubing('상판 결',[(x+j,-.217,.450),(x+j+.001,.025,.450),(x+j-.001,.195,.450)],.0009,'honey',4)
plate('가운데 스테인리스 트레이',0,0,.413,.504,.47,.030,.009,'steel')
mug(-.47,-.09,.450);mug(.52,.05,.450)
kettle(-.035,.015,.444)
for i in range(2):
    lathe('겹친 식기',.34,-.07,.45+i*.013,[(.044,0),(.065,.012),(.089,.048),(.092,.053),
          (.088,.054),(.085,.048),(.060,.016),(.042,.004)],'pearl')
# Folding stainless fire pit with four pressed panels and wire grill.
place(1.21,-1.34,.035,-13)
for s in [-1,1]:
    tubing('접은 선재 받침',[(s*.19,-.18,.23),(s*.18,-.15,.178),(-s*.12,-.16,.02),
           (-s*.14,-.12,.009),(-s*.14,.12,.009),(-s*.12,.16,.02),(s*.18,.15,.178),(s*.19,.18,.23)],.006,'steel')
def square(w,h):return [(-w,-w,h),(w,-w,h),(w,w,h),(-w,w,h)]
for j in range(4):
    n=(j+1)%4
    a,b,c,d=square(.083,.091)[j],square(.083,.091)[n],square(.218,.301)[n],square(.218,.301)[j]
    part('화로 접이식 스테인리스 판',[a,b,c,d],[(0,1,2,3)],'silver' if j%2 else 'pearl')
    tubing('접힌 모서리',[a,d,c],.0045,'steel')
    for f in [.20,.35,.50,.65,.80]:
        p=Vector(d).lerp(Vector(c),f).lerp(Vector(a).lerp(Vector(b),f),.16)
        p.x*=1.012;p.y*=1.012
        rod('화로 통기구',p,p+Vector((.0001,.0001,.003)),.007,'graphite')
for j in range(14):rod('석쇠',(-.214,-.195+j*.030,.323),(.214,-.195+j*.030,.323),.0028,'silver')
for y in [-.21,.21]:rod('석쇠 테두리',(-.22,y,.321),(.22,y,.321),.005,'steel')
for x in [-.21,.21]:rod('석쇠 테두리',(x,-.21,.321),(x,.21,.321),.005,'steel')
for i in range(3):
    outline_log=[(-.036,0),(.033,.005),(.047,.029),(.011,.059),(-.039,.047)]
    rings=[[(x-.10+i*.085,y,z+.18) for x,z in outline_log] for y in [-.135,.129]]
    skins('쪼갠 장작',rings,'bark' if i%2 else 'endgrain')

# Split firewood stacked on the black rack at the right edge of the photo.
place(1.65,.42,.032,-8)
for x in [-.32,.32]:
    tubing('장작대 강관',[(x,-.18,.04),(x,-.18,.90),(x,.18,.90),(x,.18,.04)],.012,'graphite')
for y in [-.18,.18]:
    rod('장작대 하부 가로대',(-.32,y,.11),(.32,y,.11),.018,'graphite')
for row in range(7):
    count=5 if row%2==0 else 4
    for j in range(count):
        x=(j-(count-1)/2)*.116
        h=.126+row*.086
        angle=(j*19+row*31)*pi/180
        profile=[(.062*cos(angle+k*2*pi/5),.052*sin(angle+k*2*pi/5)) for k in range(5)]
        front=-.184-.031*cos(j+row)
        rings=[[(x+dx,y,h+dz) for dx,dz in profile] for y in [front,.17+.02*sin(j)]]
        skins('쪼갠 장작 껍질',rings,'bark')
        face=[(a,front-.001,c) for a,b,c in rings[0]]
        part('장작 절단면',face,[tuple(range(5))],['birch','honey','endgrain'][(row+j)%3])
        rod('절단면 갈라짐',(x,front-.002,h),(x+profile[0][0]*.77,front-.002,h+profile[0][1]*.77),.0014,'bark')
# Inner room: overlapping, partly open zipped door panels and a low camp table.
place()
for side in [-1,1]:
    rows=[]
    for k in range(12):
        t=k/11
        w=.82*cos(t*pi*.46)
        rows.append([(side*w*q,2.14-.039*sin(q*pi)-.09*(1-q)*sin(t*pi),
                      .05+1.34*sin(t*pi*.48)-.015*(1-q)*sin(t*pi)) for q in [.12,.28,.48,.70,1]])
    cloth('안쪽 출입문 원단',rows,'darkfly' if side==1 else 'roof')
    tubing('안쪽 문 여밈 테이프',[row[0] for row in rows],.008,'shadow')
place(-.08,.89,.04)
plate('텐트 안 접이식 테이블',0,0,.32,.82,.46,.031,.018,'birch')
for side in [-1,1]:
    for y in [-.17,.17]:
        rod('안쪽 테이블 가새',(side*.31,y,0),(-side*.24,y,.325),.011,'silver')
mug(-.21,-.035,.352)
lathe('안쪽 작은 식기',.14,.026,.353,[(.039,0),(.071,.038),(.069,.041),(.04,.005)],'pearl')

# Stacked metal containers with formed ribs, corner guards and wire latches.
place(-1.53,-.92,.024,5)
for h in [0,.227]:
    plate('알루미늄 수납 상자',0,0,h+.013,.50,.35,.206,.020,'pearl')
    for side in [-1,1]:
        for k in [.052,.14]:
            plate('성형 보강 리브',0,side*.175,h+k,.40,.006,.009,.003,'silver')
        for x in [-.223,.223]:
            plate('모서리 덧댐',x,side*.152,h+.005,.051,.054,.040,.007,'graphite')
        x=side*.251
        tubing('와이어 래치',[(x,-.041,h+.16),(x+side*.007,-.041,h+.213),
               (x+side*.007,.041,h+.213),(x,.041,h+.16)],.003,'steel')
    plate('상자 테두리',0,0,h+.209,.51,.357,.018,.019,'silver')
plate('수납 상자 대나무 덮개',0,0,.453,.50,.35,.019,.015,'birch')
mug(-.115,-.058,.473);kettle(.057,.043,.473)
# A tall triangular canvas sign is visible on the left in the branch photograph.
place()
part('삼각 패브릭 사인',[(-2.11,.12,.042),(-1.41,.12,.042),(-1.69,.12,1.99)],[(0,1,2)],'canvas')
rod('사인 지주',(-1.69,.14,.025),(-1.69,.14,1.99),.010,'bronze')
plate('사인 받침',-1.73,.14,.018,.64,.22,.037,.014,'shadow')
label('snow peak',-1.758,.113,.47,.089,'ink')
# Rear brand sign on oak, as seen above the shelving in the event photo.
plate('목재 상호 패널',1.47,1.47,1.63,1.27,.068,.43,.015,'honey')
for x in [1.00,1.93]:
    rod('상호 패널 기둥',(x,1.50,.03),(x,1.50,1.72),.016,'bronze')
label('snow peak',1.49,1.429,1.79,.178,'white')
plate('전시 나무 바닥',0,.23,.002,4.56,4.12,.018,.027,'birch')
for j in range(15):
    x=-2.25+j*.316
    if x>2.25:break
    rod('바닥 판재 줄눈',(x,-1.82,.019),(x,2.28,.019),.0018,'honey')
    y=-1.27+(j%4)*.67
    rod('판재 마구리',(x,y,.020),(min(x+.316,2.28),y,.020),.0016,'honey')

def texture_node(material):
    tree=material.node_tree
    tex=tree.nodes.new('ShaderNodeTexImage');tex.image=weave
    tree.links.new(tex.outputs['Color'],tree.nodes.get('Principled BSDF').inputs['Base Color'])

cloth_parts=[ob for ob in pieces[batch] if ob.data.uv_layers]
for ob in cloth_parts:
    m=ob.data.materials[0]
    if not m.node_tree.nodes.get('Weave'):
        nodes=m.node_tree.nodes
        tex=nodes.new('ShaderNodeTexImage');tex.image=weave;tex.name='Weave'
        mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY'
        mix.inputs[0].default_value=1;mix.inputs[1].default_value=m.diffuse_color
        m.node_tree.links.new(tex.outputs['Color'],mix.inputs[2])
        m.node_tree.links.new(mix.outputs[0],nodes.get('Principled BSDF').inputs['Base Color'])
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
pieces[batch]=[ob for ob in pieces[batch] if ob not in cloth_parts]
pieces['SnowPeakGangnamWeave']=cloth_parts
for group,objects in pieces.items():
    bpy.ops.object.select_all(action='DESELECT')
    material=bpy.data.materials.new(group);material.use_nodes=True
    tree=material.node_tree;shader=tree.nodes.get('Principled BSDF')
    metal=group.endswith('Hardware')
    shader.inputs['Roughness'].default_value=.29 if metal else .80
    shader.inputs['Metallic'].default_value=.58 if metal else 0
    if group.endswith('Weave'):texture_node(material)
    else:
        colors=tree.nodes.new('ShaderNodeVertexColor');colors.layer_name='Finish'
        tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    for ob in objects:
        mesh=ob.data;rgba=mesh.materials[0].diffuse_color[:]
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        # Broad reflection bands remain legible under the game's diffuse mall lights.
        # Directional values are baked on the unchanged editable surface normals.
        for vertex,item in zip(mesh.vertices,attr.data):
            normal=vertex.normal
            if metal:
                streak=max(0,normal.x*.78-normal.y*.62)**7
                shade=.72+.22*max(0,normal.z)+.50*streak
            elif group.endswith('Weave'):
                shade=.85+.12*max(0,normal.z)+.10*max(0,-normal.x)
            else:
                shade=.96+.04*max(0,normal.z)
            item.color=tuple(min(1,c*shade) for c in rgba[:3])+(1,)
        mesh.materials.clear();mesh.materials.append(material);ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name=group
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
