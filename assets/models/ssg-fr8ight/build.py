"""Author the Gangnam FR8IGHT display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_7F_FR8IGHT')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
batch = 'FR8IGHTGangnamFixtures'
palette = dict(steel='AAA69A', dark='383938', edge='736C5E', oak='BD8860', stone='DAD6C8',
    clay='A96C53', black='292827', leather='333334', piping='474542', rib='292929',
    brass='A88C59', fleece='D5B482', furshadow='A38C68', hood='202527', green='36453E',
    blue='303842', ink='25292D', slate='677278', cream='ECE8DC', khaki='998B72',
    sand='C0B5A1', grey='8F9291', denim='65788B', white='F5F1E8', sole='524F4A',
    tan='967452', oxblood='593D34', thread='8B8478')
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

def surface(name,rings,col,closed=True):
    count=len(rings[0])
    faces=[(j*count+i,j*count+(i+1)%count,(j+1)*count+(i+1)%count,(j+1)*count+i)
           for j in range(len(rings)-1) for i in range(count if closed else count-1)]
    ob=part(name,[p for r in rings for p in r],faces,col)
    for f in ob.data.polygons:f.use_smooth=True
    return ob

def hull(name,levels,col,n=24,fold=.012,seed=0,quilt=False):
    # Elliptical garment sections shift and pinch along the bias of the cloth.
    rings=[]
    for k,(cx,cy,z,w,d) in enumerate(levels):
        ring=[]
        for j in range(n):
            t=2*pi*j/n
            ripple=fold*(.55*cos(6*t+z*4+seed)+.45*sin(9*t-z*7+seed))
            ring.append((cx+(w+ripple)*cos(t),cy+(d+ripple)*sin(t),
                         z+fold*.75*sin(3*t+seed+k*.31)))
        rings.append(ring)
    ob=skins(name,rings,col)
    for f in ob.data.polygons:f.use_smooth=len(f.vertices)==4
    if col=='leather':
        # Broad soft highlights shift with the pinched elbow and torso sections.
        data=ob.data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        for index,item in enumerate(data.data):
            k,j=divmod(index,n);t=j*2*pi/n;z=levels[k][2]
            streak=(.5+.5*cos(5*t+2.1*sin(z*13)+.3*seed))**4
            shoulder=max(0,(z-1.59)/.24)
            crease=.5+.5*cos(33*z+2.7*sin(2*t))
            value=(48+17*streak+13*crease+12*shoulder)/255
            linear_value=((value+.055)/1.055)**2.4
            item.color=(linear_value*1.035,linear_value,linear_value*.984,1)
        m=finish('leather')
        if not m.node_tree.nodes.get('가죽 명암'):
            c=m.node_tree.nodes.new('ShaderNodeVertexColor');c.name='가죽 명암';c.layer_name='Finish'
            m.node_tree.links.new(c.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
        # Every leather piece uses a color layer, including the flap cut pieces below.
    if quilt:plaid_uv(ob)
    return ob

def plaid_uv(ob):
    uv=ob.data.uv_layers.new(name='체크 재단')
    for f in ob.data.polygons:
        for i in f.loop_indices:
            v=ob.data.vertices[ob.data.loops[i].vertex_index].co
            uv.data[i].uv=((v.x+.42*v.y)/.163,v.z/.163)

def setup_plaid():
    import tempfile
    # Small repeating dyed warp/weft tile, packed inside both native and glTF.
    img=bpy.data.images.new('블랙워치 평직',width=64,height=64)
    pixels=[]
    for j in range(64):
        for i in range(64):
            def dye(t):
                if t%32 in (6,7,22,23):return (32,36,39)
                return (52,68,57) if t<32 else (42,49,65)
            a,b=dye(i),dye(j)
            mix=.65 if (i+j)%4<2 else .35
            pixels.extend([((mix*a[k]+(1-mix)*b[k])/255) for k in range(3)]+[1])
    img.pixels.foreach_set(pixels)
    with tempfile.TemporaryDirectory() as tmp:
        img.filepath_raw=tmp+'/blackwatch.png'; img.file_format='PNG';img.save();img.pack()
    m=finish('green')
    nodes=m.node_tree.nodes
    tex=nodes.new('ShaderNodeTexImage');tex.image=img
    m.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
    return m

def panel(name,outline,col,thick=.006):
    return skins(name,[outline,[(x,y+thick,z) for x,y,z in outline]],col)

def snap(x,y,z):
    rod('스냅 단추',(x,y,z),(x,y-.005,z),.012,'brass' if batch.endswith('Leather') else 'dark')

def hanger():
    pipe('옷걸이 어깨',[(-.23,0,1.75),(-.21,0,1.78),(-.048,0,1.86),(0,0,1.88),
                      (.048,0,1.86),(.21,0,1.78),(.23,0,1.75),(0,0,1.73),(-.23,0,1.75)],.014,'dark')
    pipe('옷걸이 갈고리',[(0,0,1.875),(0,0,1.924),(.024,0,1.953),(.022,0,1.982),
                        (0,0,1.994),(-.021,0,1.985),(-.024,0,1.963)],.004,'steel')

def jumper(parka=False):
    global batch
    hanger()
    col='green' if parka else 'leather'
    batch='FR8IGHTGangnamBlackwatch' if parka else 'FR8IGHTGangnamLeather'
    hem=.886 if parka else 1.06
    if parka:
        rows=[(hem,.246,.116),(.916,.267,.12),(.99,.278,.137),(1.104,.277,.142),(1.18,.268,.128),
              (1.205,.272,.14),(1.30,.283,.156),(1.35,.278,.136),(1.37,.284,.15),
              (1.47,.29,.157),(1.52,.28,.132),(1.54,.28,.147),(1.63,.277,.15),
              (1.69,.267,.128),(1.71,.261,.14),(1.776,.215,.118),(1.82,.123,.083)]
    else:
        rows=[(hem,.212,.086),(1.114,.215,.088),(1.125,.224,.099),(1.139,.239,.122),
              (1.16,.25,.116),(1.19,.25,.127),(1.224,.244,.112),(1.248,.257,.120),
              (1.31,.252,.127),(1.402,.253,.121),(1.5,.26,.132),(1.556,.262,.128),
              (1.59,.261,.12),(1.617,.269,.133),(1.69,.269,.129),(1.75,.247,.113),
              (1.795,.184,.094),(1.823,.102,.074)]
    hull('몸판',[(0,0,z,w,d) for z,w,d in rows],col,36,.009,1,parka)
    if not parka:
        hull('신축 허릿단',[(0,0,z,w,d) for z,w,d in rows[:2]],'rib',36,.004)
    for s in (-1,1):
        # Wrist-to-shoulder profiles include compressed folds at elbow and cuff.
        sleeve=[(.33,hem+.003,.055,.061),(.33,hem+.052,.055,.063),(.331,hem+.067,.073,.083),
                (.337,hem+.092,.082,.086),(.332,hem+.12,.074,.076),(.335,hem+.15,.083,.083),
                (.330,1.33,.089,.084),(.318,1.406,.094,.087),(.31,1.426,.086,.080),
                (.308,1.449,.094,.093),(.304,1.48,.086,.083),(.297,1.514,.097,.092),
                (.285,1.608,.101,.101),(.269,1.684,.105,.102),(.244,1.737,.092,.089),
                (.215,1.773,.062,.061),(.205,1.788,.026,.034)]
        hull('입체 소매',[(s*x,-.027*(1.78-z),z,w,d) for x,z,w,d in sleeve],col,20,.006,s,parka)
        if not parka:
            hull('소매 시보리',[(s*x,-.026,z,w+.004,d+.004) for x,z,w,d in sleeve[:2]],'rib',20,.004)
        # Outer arm seam continues around the rear shoulder.
        pipe('소매 바깥 봉제선',[(s*(x+w-.001),-.014,z) for x,z,w,d in sleeve[2:]],.0025,'ink')
        # Pockets sit proud of the torso, with bellows, snap flaps and topstitching.
        x=s*.144; z=hem+.103; w=.151 if not parka else .173; h=.197 if not parka else .211
        def patch(name,shape,depth,material):
            pts=[(x+dx,depth+.027*(abs(x+dx)/.25)**2,z+dz) for dx,dz in shape]
            ob=panel(name,pts,material,.019)
            if material=='green':plaid_uv(ob)
            return pts
        shape=[(-w/2,h),(-w/2,.022),(-w/2+.018,0),(w/2-.026,.001),(w/2,.024),(w/2,h)]
        edges=patch('덧주머니',shape,-.154,col)
        pipe('주머니 둘레 상침',[(a,b-.001,c) for a,b,c in edges],.0025,'piping')
        edges=patch('스냅 주머니 덮개',[(-w*.54,h+.015),(-w*.52,h-.034),(0,h-.052),(w*.52,h-.034),(w*.54,h+.015)],-.169,col)
        pipe('덮개 가장자리',edges,.002,'ink')
        snap(x,-.164,z+h-.031)
    if parka:
        # Open hood: outer/inner shells share a forward-facing lip.
        rim=[(-.111,-.126,1.776),(-.134,-.132,1.85),(-.132,-.12,1.946),(-.103,-.11,2.008),
             (-.052,-.105,2.037),(0,-.104,2.047),(.052,-.105,2.037),(.103,-.11,2.008),
             (.132,-.12,1.946),(.134,-.132,1.85),(.111,-.126,1.776),(0,-.142,1.75)]
        rings=[rim]+[[(x*a,y*.12+back,1.875+(z-1.875)*a) for x,y,z in rim] for a,back in [(1.10,.01),(.98,.095),(.69,.143),(.07,.161)]]
        ob=surface('왁스 코튼 후드',rings,'green');plaid_uv(ob)
        batch='FR8IGHTGangnamFixtures'
        surface('후드 안감',[rim,[(x*.77,-.043,1.875+(z-1.875)*.79) for x,y,z in rim],
                                 [(x*.06,-.034,1.875+(z-1.875)*.06) for x,y,z in rim]],'hood')
        pipe('후드 입구 바인딩',rim+[rim[0]],.007,'ink')
        outline=[(-.023,-d-.017,z) for z,w,d in rows]+[(.026,-d-.017,z) for z,w,d in reversed(rows)]
        panel('앞여밈 바람막이',outline,'ink')
        for z in [.98,1.17,1.37,1.56,1.73]:snap(.002,-.169 if z<1.67 else -.152,z)
        for s in [-1,1]:
            pipe('허리 조임끈',[(s*.04,-.153,1.211),(s*.132,-.142,1.216),(s*.238,-.088,1.222)],.004,'ink')
            pipe('겨드랑이 절개',[(s*.245,-.066,1.626),(s*.185,-.115,1.51),(s*.181,-.126,1.405)],.003,'ink')
    else:
        # Fur collar wraps the nape, widens into a pair of tapered front tips.
        rings=[]
        for i in range(39):
            t=2*pi*i/38
            x=.111*sin(t); y=.072*cos(t)
            front=(1-cos(t))/2
            side=abs(sin(t))
            w=.032+.041*front+.024*side
            z=1.828+.018*cos(t)-.084*(front**4)+.006*sin(3*t)
            ring=[]
            for j in range(14):
                a=2*pi*j/14; grain=.0022*sin(i*7+j*1.92)
                ring.append((x+(w+grain)*sin(t)*cos(a),y+(w+grain)*cos(t)*cos(a),
                             z+.033*sin(a)-.024*cos(a)+grain))
            rings.append(ring)
        # Open at centre front to reveal the zipper and lining.
        for half in [rings[:19],rings[20:]]:
            ob=skins('양털 칼라',half,'fleece')
            for f in ob.data.polygons:f.use_smooth=True
            attr=ob.data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for i,c in enumerate(attr.data):
                tone=.80+.19*(.5+.5*sin(i*13.07))
                c.color=tuple(v*tone for v in finish('fleece').diffuse_color[:3])+(1,)
        # The broad shearling points lie flat on the chest below the neck roll.
        for s in [-1,1]:
            collar_rows=[(.088,-.017,1.847,.024),(.11,-.054,1.829,.038),
                  (.118,-.088,1.802,.045),(.113,-.115,1.773,.051),
                  (.102,-.137,1.745,.055),(.085,-.145,1.727,.052),
                  (.048,-.148,1.718,.014)]
            rings=[]
            for i,(x,y,z,w) in enumerate(collar_rows):
                rings.append([(s*(x+w*cos(j*pi/7)),y+.012*sin(j*pi/7),
                               z+.014*cos(j*pi/7)+.002*cos(i+j*2.3)) for j in range(14)])
            tip=skins('양털 칼라 앞자락',rings,'fleece')
            for face in tip.data.polygons:face.use_smooth=True
        for s in [-1,1]:
            pipe('앞 지퍼 테이프',[(s*.009,-d-.009,z) for z,w,d in rows],.005,'rib')
            pipe('금속 지퍼 이',[(s*.003,-d-.014,z) for z,w,d in rows],.0024,'brass')
            pipe('뒤 어깨 요크',[(0,.13,1.638),(s*.102,.117,1.638),(s*.19,.087,1.67),(s*.23,.064,1.72)],.003,'piping')
        pipe('지퍼 손잡이',[(0,-.113,1.775),(.012,-.132,1.764),(.008,-.14,1.733),(-.004,-.139,1.738),(0,-.113,1.775)],.0036,'brass')
    batch='FR8IGHTGangnamFixtures'
def rail(cx,cy,width):
    place(cx,cy)
    for h,d,col in [(.028,.61,'dark'),(.053,.62,'oak'),(.085,.59,'steel')]:
        plate('구두 선반 받침',0,0,h,width,d,.025,.072,col)
    for s in [-1,1]:
        x=s*(width*.5-.065)
        plate('행거 기둥',x,0,.108,.053,.072,1.89,.009,'steel')
        plate('기둥 발판',x,0,.108,.132,.126,.011,.014,'edge')
    rod('옷걸이 봉',(-width*.5+.028,0,1.967),(width*.5-.028,0,1.967),.016,'dark')

def shirt(x,y,a,col,tee=False):
    place(x,y,0,a)
    hanger()
    hem=1.085 if tee else 1.022
    hull('티셔츠 몸판' if tee else '셔츠 몸판',[(0,0,hem,.225,.071),(0,0,hem+.026,.223,.074),
        (0,0,1.31,.216,.059),(0,0,1.56,.234,.078),(0,0,1.716,.242,.068),
        (0,0,1.762,.212,.061),(0,0,1.819,.083,.048)],col,16,.008,x)
    for s in [-1,1]:
        arm=[(.288,1.52 if tee else 1.064,.061),(.289,1.555 if tee else 1.13,.074),
             (.27,1.615 if tee else 1.40,.082),(.253,1.699,.086),(.222,1.754,.075),(.19,1.778,.046)]
        hull('셔츠 소매',[(s*dx,0,z,w,w*.82) for dx,z,w in arm],col,12,.004,s)
        if not tee:
            panel('셔츠 깃',[(s*.03,-.063,1.795),(s*.085,-.034,1.821),(s*.127,-.072,1.759),(s*.067,-.084,1.72)],col)
    if tee:
        pipe('목둘레',[(.075*cos(t*pi/12),.05*sin(t*pi/12),1.807+.016*sin(t*pi/12)) for t in range(25)],.008,'sand')
    else:
        pipe('셔츠 앞여밈',[(0,-.074,hem+.008),(0,-.066,1.31),(0,-.082,1.57),(0,-.057,1.80)],.005,col)
        for j in range(5):rod('셔츠 단추',(0,-.077,1.14+.128*j),(0,-.08,1.14+.128*j),.006,'cream')

def shoe(x,y,base,angle,upper,trainer):
    place(x,y,base,angle)
    # Transverse sections from rounded toe to heel; upper, welt and outsole are distinct.
    sections=[(-.151,.021,.034),(-.142,.047,.042),(-.113,.053,.049),(-.071,.055,.061),
              (-.015,.050,.081),(.033,.044,.115),(.081,.039,.104),(.124,.039,.094),(.139,.029,.083)]
    perimeter=[(w,d) for d,w,h in sections]+[(-w,d) for d,w,h in reversed(sections)]
    for z,h,col,fac in [(0,.016,'sole',1.04),(.016,.009,'cream' if trainer else 'tan',1.025)]:
        skins('고무 밑창' if trainer else '가죽창', [[(w*fac,d*fac,k) for w,d in perimeter] for k in (z,z+h)],col)
    rings=[]
    for d,w,h in sections:
        rings.append([(w*cos(j*pi/10),d,.024+(h-.024)*sin(j*pi/10)**.63) for j in range(11)])
    surface('운동화 갑피' if trainer else '구두 갑피',rings,upper,False)
    hull('신발 입구',[(0,.087,.086,.035,.047),(0,.087,.096,.031,.043)],'ink',16,0)
    for s in [-1,1]:
        pipe('뒤꿈치 테두리',[(s*.029,.123,.075),(s*.038,.101,.093),(s*.037,.074,.099),(s*.027,.047,.105)],.004,upper)
        if trainer:
            panel('운동화 옆 보강재',[(s*.049,-.088,.032),(s*.052,-.071,.051),(s*.045,-.018,.046),
                                     (s*.037,.04,.084),(s*.041,.067,.057),(s*.047,-.01,.03)],'slate')
    for j in range(4):
        d=-.042+j*.018;z=.067+j*.008
        pipe('신발끈',[(-.026,d,z),(-.014,d+.005,z+.007),(.014,d+.012,z+.011),(.027,d+.016,z+.002)],.0028,'cream' if trainer else 'sole')

def pedestal(cx,cy):
    place(cx,cy)
    # Profile of the photograph's faceted pale pedestal with a contrasting rust band.
    levels=[(.022,1.12,.52,'dark'),(.17,1.41,.69,'dark'),(.278,1.41,.69,'clay'),
            (.448,1.24,.58,'stone'),(.54,1.30,.62,'stone'),(.568,1.48,.72,'stone'),(.626,1.48,.72,'stone')]
    def ring(z,w,d):
        return [(x,y,z) for x,y in outline(w,d,.035)]
    for (z,w,d,_),(h,a,b,col) in zip(levels,levels[1:]):
        skins('운동화 진열대', [ring(z,w,d),ring(h,a,b)],col)
    for i,col in enumerate(['denim','cream','slate','sand']):
        shoe(cx-.49+i*.319,cy,.628,[-19,9,-14,17][i],col,True)

def wordmark():
    place()
    plate('상호 뒷판',0,.88,.12,2.36,.14,2.40,.027,'steel')
    font=bpy.data.curves.new('상호','FONT');font.body='F R 8 I G H T'
    font.align_x='CENTER';font.size=.185;font.extrude=.004;font.resolution_u=4
    ob=bpy.data.objects.new('상호',font);gallery.objects.link(ob)
    ob.location=(0,.794,2.177);ob.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    label=bpy.data.objects.new('프레이트 입체 상호',mesh);gallery.objects.link(label);label.matrix_world=ob.matrix_world.copy()
    mesh.materials.append(finish('white'));pieces[batch].append(label)
    bpy.data.objects.remove(ob,do_unlink=True)

plaid=setup_plaid()
wordmark()
rail(0,0,2.43)
place(-.49,-.024,0,-7);jumper()
place(.51,-.021,0,8);jumper(True)
for x,ang,col in [(-.77,-19,'oxblood'),(-.63,7,'tan'),(.08,-9,'black'),(.22,14,'khaki'),(.70,-15,'oxblood')]:
    shoe(x,-.042,.112,ang,col,False)
for side in [-1,1]:
    cx=side*2.65;cy=.21
    rail(cx,cy,2.28)
    for i,col in enumerate(['denim','cream','sand','slate','khaki','ink','grey','cream']):
        shirt(cx-.841+i*.237,cy,55+(i%3)*6,col,i in (1,4,7))
    for i,col in enumerate(['tan','black','oxblood']):
        shoe(cx-.63+i*.55,cy,.112,-14+11*i,col,False)
pedestal(1.39,-.98)
for ob in gallery.objects:
    mesh=ob.data
    if mesh.materials[0]==finish('leather') and not mesh.color_attributes.get('Finish'):
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        for item in attr.data:item.color=finish('leather').diffuse_color
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)

# Keep all editable pieces in the library. Batch a transient export copy by surface finish.
for group,objects in list(pieces.items()):
    if group=='FR8IGHTGangnamBlackwatch':
        for ob in list(objects):
            if ob.data.materials[0]!=plaid:
                objects.remove(ob);pieces['FR8IGHTGangnamFixtures'].append(ob)
for group,objects in pieces.items():
    bpy.ops.object.select_all(action='DESELECT')
    if group!='FR8IGHTGangnamBlackwatch':
        m=bpy.data.materials.new(group);m.use_nodes=True
        nodes=m.node_tree.nodes
        colors=nodes.new('ShaderNodeVertexColor');colors.layer_name='Finish'
        shader=nodes.get('Principled BSDF')
        shader.inputs['Roughness'].default_value=.46 if group.endswith('Leather') else .72
        m.node_tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    for ob in objects:
        if group!='FR8IGHTGangnamBlackwatch':
            mesh=ob.data;rgba=mesh.materials[0].diffuse_color[:]
            if not mesh.color_attributes.get('Finish'):
                attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
                for item in attr.data:item.color=rgba
            mesh.materials.clear();mesh.materials.append(m)
        ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join();bpy.context.object.name=group
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
