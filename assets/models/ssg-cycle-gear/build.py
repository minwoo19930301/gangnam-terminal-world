"""Author the Gangnam Brompton display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
import sys
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
import drivetrain as drive
import bag_counter
import surfaces
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_8F_Brompton')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
batch = 'BromptonGangnamFixtures'
palette = dict(steel='9DA5A6', chrome='DCE0DC', ink='212526', rubber='252726', charcoal='3C4241',
    silver='A9AFAD', ivory='E7DBC8', white='F7F2E4', oak='BE9B70', shadow='877962', brass='BD9954',
    tan='C29D74', leaf='92AE66', orange='E26E3F', red='AB3438', green='38624E', blue='687A86',
    cream='DFD4B6', navy='333943', olive='6E7461', brown='4D423B')
palette.update(strapBlack='252726',strapEdge='5A5449',nickel='DFE1D9',alloy='C6C8C2',
    chainSteel='89908F',darkChain='555B5C',pedalGrey='6C7270',reflectAmber='E69A32',
    treadBlack='141715',bagTan='B99A71',flapTan='CEAF85',stitchTan='B29B78',wovenGreen='2A372E',
    oakLight='DBBC98',oakHoney='DEAB78',ceramic='EAE7DE',twig='CEBFA8')
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

def hoop(name,x,y,z,major,minor,col,segments=36,sides=6,arc=None):
    start,end=arc or (0,2*pi)
    rings=[]
    for i in range(segments+1):
        t=start+(end-start)*i/segments
        rings.append([(x+(major+minor*cos(j*2*pi/sides))*cos(t),y+minor*sin(j*2*pi/sides),
                       z+(major+minor*cos(j*2*pi/sides))*sin(t)) for j in range(sides)])
    return smooth(skins(name,rings,col,cap=bool(arc)))

def wheel(x,y,z,folded):
    hoop('공기 타이어',x,y,z,.197,.017,'rubber',28 if folded else 40)
    hoop('알루미늄 림',x,y,z,.177,.009,'chrome',24 if folded else 36,5)
    hoop('반사 사이드월',x,y-.012,z,.193,.0026,'tan' if folded else 'silver',24 if folded else 36,4)
    rod('허브 셸',(x,y-.034,z),(x,y+.034,z),.020,'silver')
    # Cross-laced spoke set is one editable mesh per wheel.
    verts=[];faces=[]
    for i in range(20):
        t=2*pi*i/20
        a=Vector((x+.018*cos(t+.62*(-1)**i),y+.029*(-1)**i,z+.018*sin(t+.62*(-1)**i)))
        b=Vector((x+.174*cos(t),y,z+.174*sin(t)))
        v=(b-a).normalized().cross(Vector((0,1,0)))*.00165
        first=len(verts)
        for p in (a,b):
            verts.extend([p+v,p-v*.5+Vector((0,.0014,0)),p-v*.5-Vector((0,.0014,0))])
        faces.extend([(first+j,first+(j+1)%3,first+3+(j+1)%3,first+3+j) for j in range(3)])
    part('교차 스포크',verts,faces,'silver')
    rod('공기 밸브',(x,y,z+.15),(x,y,z+.177),.003,'ink')
    # Rolled mudguard is a thin crowned strip wider than the tyre.
    rings=[]
    steps=16 if folded else 24
    for i in range(steps+1):
        t=(-8+i*198/steps)*pi/180
        rings.append([(x+r*cos(t),y+side,z+r*sin(t)) for side,r in
                      [(-.022,.226),(-.015,.231),(.015,.231),(.022,.226),(.020,.224),(-.020,.224)]])
    smooth(skins('흙받이',rings,'charcoal'))
    for side in [-1,1]:
        rod('흙받이 지지봉',(x,y+side*.032,z),(x-.222,y+side*.022,z+.04),.0026,'steel')

def saddle(x,y,z):
    # Tapered nose, broad split rear cushion and arched steel rails.
    rings=[]
    for off,w,h in [(-.117,.055,-.001),(-.104,.074,.004),(-.068,.082,.001),
                    (-.025,.068,-.005),(.027,.034,-.012),(.097,.019,-.014),(.13,.012,-.012)]:
        rings.append([(x+off,y+w*cos(t*pi/5),z+h+.018*sin(t*pi/5)) for t in range(10)])
    smooth(skins('안장 가죽 상판',rings,'ink'))
    for sign in [-1,1]:
        tubing('안장 레일',[(x-.082,y+sign*.049,z-.012),(x-.042,y+sign*.022,z-.052),
                          (x+.042,y+sign*.022,z-.055),(x+.085,y+sign*.012,z-.014)],.004,'chrome',6)

def clamp(x,y,z):
    plate('경첩 맞물림',x,y,z-.025,.055,.057,.054,.006,'charcoal')
    rod('경첩 핀',(x,y+.028,z-.034),(x,y+.028,z+.036),.010,'chrome')
    rod('클램프 나사',(x,y-.028,z),(x,y-.064,z),.007,'chrome')
    tubing('클램프 손잡이',[(x-.025,y-.065,z-.004),(x-.012,y-.061,z+.005),
                           (x+.014,y-.061,z+.005),(x+.026,y-.066,z+.011)],.007,'ink',6)

def drivetrain(cx,cy,cz,rear,folded):
    if not folded:
        return drive.model(part,skins,tubing,rod,plate,smooth,cx,cy,cz,rear)
    rx,ry,rz=rear
    y=cy-.056
    hoop('체인링 외륜',cx,y,cz,.092,.007,'ink',40)
    # Cast five-arm spider with visible cut-outs.
    for i in range(5):
        t=i*2*pi/5
        tubing('체인링 스파이더',[(cx+.014*cos(t),y,cz+.014*sin(t)),
               (cx+.06*cos(t+.10),y,cz+.06*sin(t+.10)),
               (cx+.089*cos(t+.26),y,cz+.089*sin(t+.26))],.009,'charcoal',6)
    hoop('체인링 절삭면',cx,y-.006,cz,.093,.0028,'silver',40,4)
    gear_y=ry-.05
    hoop('뒤 스프로킷',rx,gear_y,rz,.037,.006,'steel',20)
    for s in [-1,1]:
        start=(cx,y,cz+s*.094); end=(rx,gear_y,rz+s*.039)
        tubing('체인 윗줄' if s>0 else '체인 하부', [start,end] if s>0 else
               [start,(rx+.042,gear_y,rz-.095),end],.0044,'charcoal',5)
    hoop('체인 텐셔너 풀리',rx+.042,gear_y,rz-.083,.016,.005,'ink',12)
    for sign in [-1,1]:
        side=cy+.068*sign
        px=cx+sign*(.079 if folded else .116);pz=cz+sign*(.11 if folded else .080)
        rod('크랭크 암',(cx,side,cz),(px,side,pz),.012,'silver')
        plate('접이 페달',px,side+sign*.032,pz-.009,.063,.067,.021,.007,'ink')
        plate('페달 반사판',px-.032,side+sign*.033,pz-.006,.004,.038,.011,.001,'brass')

def bicycle(folded,col,low=False):
    # X points forwards, -Y is the drive side. Folded wheels nest side by side.
    rear=(-.055,.055,.222) if folded else (-.506,0,.216)
    front=(.05,-.089,.216) if folded else (.527,0,.216)
    bb=(-.155,.049,.185) if folded else (-.099,0,.283)
    seat=(-.127,.049,.443) if folded else (-.123,0,.492)
    head=(.139,-.066,.473) if folded else (.413,0,.582)
    rx,ry,rz=rear; fx,fy,fz=front; bx,by,bz=bb;sx,sy,sz=seat; hx,hy,hz=head
    wheel(*rear,folded);wheel(*front,folded)
    if not folded:
        for center in (rear,front):
            drive.tyre_marks(part,*center)
    # Compact rear swingarm and suspension block under the seat cluster.
    for sign in [-1,1]:
        tubing('뒷삼각 체인스테이',[(bx+.023,by+sign*.032,bz+.02),(rx+.12,ry+sign*.065,rz-.014),
                                    (rx,ry+sign*.057,rz)],.011,col)
        tubing('시트스테이',[(rx,ry+sign*.056,rz),(sx-.03,sy+sign*.03,sz-.052)],.009,col)
        tubing('포크 블레이드',[(hx,hy+sign*.018,hz-.071),((hx+fx)/2,fy+sign*.044,(hz+fz)/2-.025),
                                 (fx,fy+sign*.046,fz)],.014,col)
    tubing('서스펜션 블록',[(sx-.059,sy,sz-.073),(sx-.025,sy,sz-.035)],.022,'rubber')
    tubing('시트 튜브',[(bx,by,bz),(sx,sy,sz)],.025,col)
    hinge=(.011,-.015,.427) if folded else (.204,0,.502)
    path=[(bx+.009,by,bz+.036),(bx+.028,by,bz+.091),
          (sx+.09,sy,sz-.085),hinge,((hinge[0]+hx)/2,(hinge[1]+hy)/2,(hinge[2]+hz)/2+.008),(hx,hy,hz)]
    tubing('곡선 메인 프레임',path,.027,col,12)
    if not folded:
        a=Vector(path[2]);b=Vector(path[3]);axis=(b-a).normalized()
        drive.frame_decal(part, a+.022*axis, b, .027)
    tubing('헤드 튜브',[(hx+.014,hy,hz-.078),(hx-.010,hy,hz+.046)],.023,col,10)
    clamp(*hinge)
    post_z=.527 if folded else .917
    post_x=sx-(post_z-sz)*.14
    tubing('인출 시트포스트',[(sx,sy,sz),(post_x,sy,post_z-.018)],.015,'silver')
    rod('시트 클램프',(sx,sy,sz-.009),(sx,sy,sz+.009),.030,'ink')
    saddle(post_x,sy,post_z+.024)
    # Folded stem drops beside the front wheel; raised bar has the signature M bends.
    if folded:
        stem=[(hx-.01,hy,hz+.035),(hx+.019,hy-.037,hz+.018),
              (hx+.064,hy-.064,.37),(hx+.018,hy-.075,.13)]
        stemend=stem[-1]
        bars=[(stemend[0]-.098,stemend[1],.047),(stemend[0]-.061,stemend[1],.059),
              stemend,(stemend[0]+.056,stemend[1],.18),(stemend[0]+.075,stemend[1],.246)]
    else:
        stem=[(hx-.009,hy,hz+.038),(hx-.018,hy,.666),(hx-.033,hy,.727),(hx-.042,hy,.854),
              (hx-.035,hy,.928 if low else .963)]
        tx,ty,tz=stem[-1]
        bars=[(tx-.028,ty-.252,tz+.078),(tx-.008,ty-.132,tz+.073),(tx,ty-.095,tz+.056),
              (tx,ty-.077,tz+.015),(tx,ty-.051,tz),(tx,ty+.051,tz),(tx,ty+.077,tz+.015),
              (tx,ty+.095,tz+.056),(tx-.008,ty+.132,tz+.073),(tx-.028,ty+.252,tz+.078)]
    tubing('폴딩 핸들 스템',stem,.019,col,10)
    clamp(hx-.010,hy,hz+.048)
    tubing('핸들바',bars,.010,'silver',8)
    for a,b in [(bars[0],bars[1]),(bars[-1],bars[-2])]:
        tubing('고무 그립',[a,b],.015,'rubber')
        p=Vector(a).lerp(Vector(b),.8);q=Vector(a)+Vector((.030,0,-.034))
        tubing('브레이크 레버',[p,p+Vector((.025,0,-.008)),q],.0045,'silver',6)
    cable_start=Vector(bars[1])
    bend=(hx+.069,hy-.098,.305 if folded else .70)
    tubing('브레이크 케이블',[cable_start,cable_start+Vector((.035,-.015,-.05)),bend,
           (hx+.018,hy-.038,hz-.037),(fx-.018,fy-.033,fz+.212)],.0035,'ink',6)
    tubing('변속 케이블',[Vector(bars[-2]),(hx+.065,hy+.079,hz+.053),
           (hinge[0],hinge[1]+.022,hinge[2]-.031),(bx,by+.022,bz+.01),(rx,ry+.046,rz)],.003,'ink',5)
    drivetrain(*bb,rear,folded)
    # Bridge to the easy-wheel axles and the side-pull brake on the fork crown.
    for sign in [-1,1]:
        tubing('롤러 브리지',[(rx,ry+sign*.055,rz),(rx+.087,ry+sign*.042,rz+.183),
                            (sx-.054,sy+sign*.025,sz-.058)],.007,'charcoal',6)
        tubing('앞 브레이크 암',[(fx+.013,fy+sign*.017,fz+.215),(fx+.012,fy+sign*.042,fz+.206),
                            (fx+.008,fy+sign*.026,fz+.175)],.0065,'silver',6)
        plate('앞 브레이크 패드',fx+.008,fy+sign*.022,fz+.17,.031,.010,.011,.002,'ink')
        rod('롤러 축',(rx+.087,ry+sign*.032,rz+.183),(rx+.087,ry+sign*.072,rz+.183),.005,'steel')
        hoop('접이 이동 롤러',rx+.087,ry+sign*.070,rz+.183,.018,.006,'ink',14)

def label(txt,x,y,z,size,col):
    curve=bpy.data.curves.new(txt,'FONT');curve.body=txt;curve.align_x='CENTER';curve.size=size
    curve.extrude=.0008;curve.resolution_u=3
    ob=bpy.data.objects.new(txt,curve);gallery.objects.link(ob)
    ob.location=(x,y,z);ob.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    final=bpy.data.objects.new(txt,mesh);gallery.objects.link(final);final.matrix_world=ob.matrix_world.copy()
    mesh.materials.append(finish(col));pieces.setdefault(batch,[]).append(final);bpy.data.objects.remove(ob,do_unlink=True)

# Two rows of three open cubbies, inset warm backs and a framed brand plaque.
plate('벽장 등판',0,.71,.025,3.30,.09,2.46,.018,'ivory')
plate('하부 수납장',0,.45,.025,3.30,.48,.52,.015,'ivory')
for x in [-1.62,-.54,.54,1.62]:
    plate('진열장 세로 칸막이',x,.45,.54,.06,.52,1.62,.009,'white')
for h in [.53,1.34,2.15]:
    plate('진열장 선반',0,.45,h,3.30,.52,.045,.008,'white')
for x in [-1.08,0,1.08]:
    for h in [.576,1.386]:
        plate('매입 조명',x,.30,h+.730,.69,.06,.012,.006,'white')
plate('상호 패널',0,.43,2.195,3.30,.48,.285,.012,'white')
for x in [-.52,.52]:plate('상호 테두리',x,.183,2.28,.012,.007,.14,.001,'ink')
for h in [2.28,2.414]:plate('상호 테두리',0,.183,h,1.05,.007,.009,.001,'ink')
label('BROMPTON',0,.177,2.294,.143,'ink')
label('L O N D O N',0,.176,2.219,.054,'ink')

batch='BromptonGangnamCycles'
for i,col in enumerate(['brown','red','blue','charcoal','green','orange']):
    place((i%3-1)*1.08,.458,.579+(i//3)*.81,[-10,-6,-12][i%3])
    bicycle(True,col)
# Full-size green example on a small footed wheel support.
place(.12,-1.13,.034,-14)
bicycle(False,'leaf')
batch='BromptonGangnamFixtures'
plate('전시 받침',0,0,-.03,1.67,.61,.03,.05,'ivory')
for y in [-.054,.054]:
    tubing('앞바퀴 지지대',[(.36,y,0),(.393,y,.036),(.50,y,.081),(.612,y,.074),(.679,y,0)],.008,'steel')

# The opening photo shows hanging collared clothing to the right of the bikes.
place()
for x in [1.91,4.01]:
    plate('행거 발판',x,.41,.02,.20,.47,.026,.025,'charcoal')
    rod('행거 기둥',(x,.41,.05),(x,.41,1.80),.014,'ink')
rod('행거 봉',(1.91,.41,1.79),(4.01,.41,1.79),.016,'ink')
for i,col in enumerate(['navy','cream','tan','olive','ivory','brown','navy','cream']):
    place(2.72+i*.171,.41,0,63+(i%3)*5)
    tubing('옷걸이 후크',[(0,0,1.72),(0,0,1.793),(.018,0,1.812),(.032,0,1.798)],.004,'steel')
    tubing('옷걸이 어깨',[(0,0,1.72),(-.19,0,1.583),(.19,0,1.583),(0,0,1.72)],.008,'oak',6)
    rings=[]
    for z,w,d in [(.88,.23,.069),(.92,.228,.067),(1.17,.221,.061),(1.44,.234,.080),
                  (1.55,.23,.064),(1.62,.16,.046),(1.657,.072,.044)]:
        rings.append([(w*cos(j*pi/8),d*sin(j*pi/8)+.009*cos(j*pi/2),z+.008*cos(j*pi/4)) for j in range(16)])
    smooth(skins('커뮤터 셔츠 몸판',rings,col))
    for sign in [-1,1]:
        rings=[]
        for z,x,w,d in [(1.56,.203,.065,.063),(1.41,.244,.063,.061),(1.23,.263,.055,.052),(.987,.275,.052,.047)]:
            rings.append([(sign*x+w*cos(j*pi/5),d*sin(j*pi/5),z) for j in range(10)])
        smooth(skins('소매',rings,col))
        part('접힌 칼라',[(0,-.042,1.64),(sign*.069,-.009,1.67),(sign*.106,-.054,1.602),
                         (sign*.048,-.074,1.559)],[(0,1,2,3)],col)
    tubing('앞 단작',[(0,-.072,.91),(0,-.067,1.18),(0,-.082,1.44),(0,-.061,1.60)],.003,col,5)

# The photographed bag counter occupies the left end of the garment furniture.
bag_counter.add_counter(part,skins,tubing,plate,place,smooth)
images=surfaces.make_images()
for name,objects in pieces.items():
    shared=surfaces.material(name,images)
    for ob in objects:
        ob['cycleBatch']=name
        surfaces.unwrap(ob,shared)
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.outliner.orphans_purge(do_recursive=True)
print('EDITABLE', len(gallery.objects), 'CHAINS', [(o.name,o['chainJoints']) for o in gallery.objects if o.get('chainJoints')])
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
exec(compile((OUT/'export.py').read_text(),str(OUT/'export.py'),'exec'))
