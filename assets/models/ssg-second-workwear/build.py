"""Build the OURSELVES Gangnam display in metres. Local front is -Y."""
from pathlib import Path
from math import sin, cos, pi, sqrt, radians, asin, copysign
import bpy
import numpy as np
from mathutils import Vector, Matrix

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("SSG_7F_OURSELVES")
bpy.context.scene.collection.children.link(collection)
bpy.context.preferences.filepaths.save_version = 0

# One original material atlas, packed into the native file. Each swatch has
# a four-pixel bleed. The plaid is woven in UV space over the curved pattern pieces.
N = 256
rng = np.random.default_rng(809)
yy, xx = np.mgrid[0:N, 0:N] / N
noise = rng.normal(0, 1, (N, N))
def rgb(v):
    return np.repeat(v[:,:,None], 3, axis=2)
twill = .90 + .045*np.sin((xx*64-yy*80)*2*pi) + .026*noise
wood = (.92 + .032*np.sin(2*pi*(xx*17+.24*np.sin(yy*4+xx*8)))
        + .031*np.sin(2*pi*(xx*57+.55*np.sin(yy*4+xx*13))) + .017*noise)
# Shell, open-grain walnut, mottled pile and ribbed ombre wool share one atlas.
fur=.78+.12*np.sin((xx*57+.4*np.sin(yy*6))*2*pi)+.055*noise
rib=.81+.12*np.cos(xx*2*pi*40)+.05*np.sin(yy*2*pi*60)+.027*noise
ombre=.60+.32*(.5+.5*np.cos(yy*2*pi))+.055*np.sin(xx*2*pi*54)+.027*noise
swatches=[rgb(np.full_like(xx,.98)),rgb(twill),rgb(wood),rgb(fur),rgb(rib),rgb(ombre),rgb(.97+.012*noise)]
atlas = np.ones((N*4,N*4,4), dtype=np.float32)
for n,s in enumerate(swatches):
    row,col=divmod(n,4)
    atlas[row*N:(row+1)*N,col*N:(col+1)*N,:3]=np.clip(s,0,1)
im=bpy.data.images.new("직조와 재목 · 원본 UV 견본",N*4,N*4,alpha=False)
im.pixels.foreach_set(atlas.ravel())
im.pack()

def make_material(name, metallic, roughness):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Metallic"].default_value=metallic
    p.inputs["Roughness"].default_value=roughness
    tex=m.node_tree.nodes.new("ShaderNodeTexImage"); tex.image=im
    # glTF exporter handles COLOR_0 separately. This node combination also
    # displays both the tint and the weave when the source is opened in Blender.
    tint=m.node_tree.nodes.new("ShaderNodeVertexColor"); tint.layer_name="색"
    mix=m.node_tree.nodes.new("ShaderNodeMixRGB"); mix.blend_type='MULTIPLY'; mix.inputs[0].default_value=1
    for a,b in [(tex.outputs['Color'],mix.inputs[1]),(tint.outputs['Color'],mix.inputs[2]),(mix.outputs[0],p.inputs["Base Color"])]:
        m.node_tree.links.new(a,b)
    return m

materials=[make_material("무광 · 직물 목재 석재",0,.82),make_material("새틴 금속",.53,.31)]
names=["OurselvesGangnamWalnut","OurselvesGangnamMilParka","OurselvesGangnamHardware"]
groups=[[],[],[]]
group=0
pose=Matrix.Identity(4)
def place(x=0,y=0,z=0,angle=0):
    global pose
    pose=Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(angle),4,'Z')
def linear(c):
    c=int(c,16)/255
    return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
def tint(c):
    return [linear(c[k:k+2]) for k in (0,2,4)]
def mesh(name,verts,faces,color,sw=0,smooth=False,uv=None,wash=None,metal=False):
    batch=2 if metal else group
    me=bpy.data.meshes.new(name)
    me.from_pydata(verts,[],faces); me.update()
    ob=bpy.data.objects.new(name,me); collection.objects.link(ob)
    ob.matrix_world=pose.copy(); groups[batch].append(ob)
    me.materials.append(materials[int(metal)])
    colors=me.color_attributes.new(name='색',type='FLOAT_COLOR',domain='POINT')
    rgb0=tint(color)
    for i,c in enumerate(colors.data):
        shade=wash[i] if wash else 1
        c.color=(*[min(1,k*shade) for k in rgb0],1)
    uvmap=me.uv_layers.new(name='재단 UV')
    arr=np.array(verts); ranges=np.maximum(np.ptp(arr,axis=0),.001)
    norm=(arr-arr.min(axis=0))/ranges
    for face in me.polygons:
        face.use_smooth=smooth and len(face.vertices)<=4
        axis=max(range(3),key=lambda k:abs(face.normal[k]))
        corners=(1,2) if axis==0 else (0,2) if axis==1 else (0,1)
        for li in face.loop_indices:
            vi=me.loops[li].vertex_index
            a,b=uv[vi] if uv else (norm[vi,corners[0]],norm[vi,corners[1]])
            uvmap.data[li].uv=((sw%4+.016+.968*a)/4,(sw//4+.016+.968*b)/4)
    return ob

def block(name,x,y,z,w,d,h,col,sw=0,metal=False):
    v=[(x+i*w/2,y+j*d/2,z+k*h/2) for k in (-1,1) for j in (-1,1) for i in (-1,1)]
    return mesh(name,v,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],col,sw,metal=metal)
def rounded(name,x,y,z,w,d,h,r,col,sw=0,metal=False):
    out=[]
    for sx,sy,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for i in range(7):
            a=radians(start+90*i/6)
            out.append((sx*(w/2-r)+r*cos(a),sy*(d/2-r)+r*sin(a)))
    L=len(out);v=[];f=[]
    lip=min(.011,h*.18)
    for zz,inset in [(0,.009),(lip,0),(h-lip,0),(h,.009)]:
        v.extend((x+ox*(1-2*inset/w),y+oy*(1-2*inset/d),z+zz) for ox,oy in out)
    for i in range(3):
        for j in range(L):
            k=(j+1)%L;f.append((i*L+j,i*L+k,(i+1)*L+k,(i+1)*L+j))
    f.extend([tuple(reversed(range(L))),tuple(range(3*L,4*L))])
    return mesh(name,v,f,col,sw,metal=metal)
def tube(name,points,r,col,metal=False,n=8):
    p=[Vector(a) for a in points]; verts=[];faces=[];previous=None
    for i,a in enumerate(p):
        tangent=(p[min(i+1,len(p)-1)]-p[max(0,i-1)]).normalized()
        if previous is None:
            previous=tangent.cross(Vector((0,1,0)) if abs(tangent.y)<.9 else Vector((1,0,0))).normalized()
        normal=(previous-previous.dot(tangent)*tangent).normalized(); side=tangent.cross(normal);previous=normal
        for j in range(n):verts.append(tuple(a+r*(cos(j*2*pi/n)*normal+sin(j*2*pi/n)*side)))
    for i in range(len(p)-1):
        for j in range(n):
            k=(j+1)%n; a=i*n;faces.append((a+j,a+k,a+n+k,a+n+j))
    faces.extend([tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))])
    return mesh(name,verts,faces,col,smooth=True,metal=metal)
def interp(rows,z):
    if z<=rows[0][0]:return rows[0][1:]
    for a,b in zip(rows,rows[1:]):
        if z<=b[0]:
            t=(z-a[0])/(b[0]-a[0])
            return tuple(q+(r-q)*t for q,r in zip(a[1:],b[1:]))
    return rows[-1][1:]
def signedpow(x,k):return copysign(abs(x)**k,x)
# The same surface drives the cut pieces and their appliques. Folds follow
# the hanging direction, with displaced hem and elbow rings.
def clothpoint(row,z,a,phase,amp,exponent=.85):
    cx,cy,w,d=interp(row,z)
    fold=amp*(.65*sin(6*a+1.4*z+phase)+.37*sin(11*a-4*z+phase)+.21*sin(17*a+6*z))
    shape=1+fold
    return (cx+w*signedpow(cos(a),exponent)*shape,cy+d*signedpow(sin(a),exponent)*shape,
            z+amp*.052*sin(4*a+7*z+phase))
def loft(name,rows,col,sw=1,n=28,amp=.06,phase=0,opening=None,sub=1,exponent=.85):
    verts=[];faces=[];uv=[];wash=[]
    zs=[a[0]+(b[0]-a[0])*j/sub for a,b in zip(rows,rows[1:]) for j in range(sub)]+[rows[-1][0]]
    for i,z in enumerate(zs):
        gap=opening(z) if opening else 0
        for j in range(n+1):
            a=-pi/2+gap+(2*pi-2*gap)*j/n
            verts.append(clothpoint(rows,z,a,phase,amp,exponent))
            uv.append((j/n,(z-zs[0])/max(.001,zs[-1]-zs[0])))
            # Broad alternating highlights and occlusion sit in the long cloth folds.
            ripple = 6*a+1.4*z+phase
            shadow = max(0,-sin(ripple))**3
            wash.append(1+amp*(1.70*sin(ripple)+1.01*sin(11*a-4*z+phase)-2.85*shadow))
        if i:
            for j in range(n):
                k=(i-1)*(n+1)+j;faces.append((k,k+1,k+n+2,k+n+1))
    if not opening:faces += [tuple(reversed(range(n))),tuple(range(len(verts)-n-1,len(verts)-1))]
    return mesh(name,verts,faces,col,sw,True,uv,wash)

def label(name,phrase,x,y,z,size,color):
    cv=bpy.data.curves.new(name,'FONT');cv.body=phrase;cv.size=size; cv.space_character=1.17
    cv.align_x='CENTER';cv.align_y='CENTER';cv.resolution_u=5
    system_font=Path('/System/Library/Fonts/Supplemental/Arial Narrow.ttf')
    if system_font.exists():cv.font=bpy.data.fonts.load(str(system_font),check_existing=True)
    ob=bpy.data.objects.new(name,cv);collection.objects.link(ob)
    bpy.context.view_layer.update()
    ev=ob.evaluated_get(bpy.context.evaluated_depsgraph_get())
    me=ev.to_mesh()
    mesh(name,[(x+v.co.x,y,z+v.co.y) for v in me.vertices],[tuple(p.vertices) for p in me.polygons],color)
    ev.to_mesh_clear();bpy.data.objects.remove(ob,do_unlink=True)

def hanger(height):
    tube('옷걸이 철사 고리',[(.037*cos(t),0,height+.037*sin(t)) for t in np.linspace(.15,pi*1.53,11)]+[(0,0,height-.093)],.0034,'9d9c94',True)
    v=[(-.228,0,height-.166),(-.202,0,height-.124),(-.056,0,height-.065),(0,0,height-.069),
       (.056,0,height-.065),(.202,0,height-.124),(.228,0,height-.166),(.198,0,height-.171),
       (0,0,height-.111),(-.198,0,height-.171)]
    # closed wooden shoulder, triangular return bar below
    pts=[(x,y+d,z) for d in [-.011,.011] for x,y,z in v];l=len(v)
    mesh('원목 옷걸이 어깨',pts,[tuple(range(l)),tuple(reversed(range(l,2*l)))]+[(i,(i+1)%l,(i+1)%l+l,i+l) for i in range(l)],'c59e71',2)
    tube('옷걸이 가로대',[(-.205,0,height-.155),(.205,0,height-.155)],.006,'bfa07d')

def garment(vest=False,black=False,trim=True):
    shell='383a3d' if vest else '343437' if black else '74745a'
    binding='454648' if vest or black else '808168'
    H=.69 if vest else .91
    # Height profiles retain the low slouch of the shell and compress
    # the sides of the vest above the deep openings for the arms.
    dims=[(0,.262,.139),(.024,.264,.141),(.10,.268,.149),(.26,.274,.159),
          (.46,.264,.169),(.62,.247,.168),(.74,.249,.157),(.84,.258,.136),
          (.89,.236,.121),(.94,.176,.100),(1,.098,.074)]
    if vest:dims=[(z,w*(.80 if .61<z<.90 else .98),d*.83) for z,w,d in dims]
    rows=[(z*H,.005*sin(z*6),.009*sin(z*5),w,d) for z,w,d in dims]
    amp=.068 if vest else .076
    loft('차콜 베스트 몸판' if vest else '다운 파카 몸판',rows,shell,n=44,amp=amp,sub=2)
    def surface(x,z,offset):
        cx,cy,w,d=interp(rows,z)
        t=signedpow(max(-.999,min(.999,(x-cx)/w)),1/.85)
        px,py,pz=clothpoint(rows,z,asin(t)-pi/2,0,amp)
        return (px,py-offset,pz)
    def patch(name,outline,color,depth):
        # Tessellate between centre and hem so the pocket sits on the coat.
        cx=sum(x for x,z in outline)/len(outline);cz=sum(z for x,z in outline)/len(outline)
        v=[surface(cx,cz,depth+.003)];f=[];L=len(outline)
        for k in (0.35,.67,1.0):
            v.extend(surface(cx+(x-cx)*k,cz+(z-cz)*k,depth) for x,z in outline)
        for j in range(L):
            q=(j+1)%L;f.append((0,j+1,q+1))
            for a in (1,L+1):f.append((a+j,a+L+j,a+L+q,a+q))
        mesh(name,v,f,color,1,True)
        tube(name+' 박음선',[surface(x,z,depth+.0015) for x,z in outline+[outline[0]]],.0017,binding,n=5)
    flapx=-.043
    patch('바람막이 앞섶',[(flapx,.014),(.042,.014),(.042,H*.99),(flapx,H*.99)],binding,.008)
    for s in (-1,1):
        if not vest:
            arm=[(.095,s*.339,.004,.072,.080),(.116,s*.34,.003,.077,.088),
                 (.19,s*.337,.007,.081,.089),(.31,s*.318,.021,.092,.102),
                 (.39,s*.305,.006,.088,.097),(.48,s*.298,.015,.101,.106),
                 (.61,s*.274,.012,.102,.113),(.72,s*.248,.012,.096,.106),
                 (.79,s*.223,.009,.085,.095),(.84,s*.195,.010,.062,.066)]
            loft('접힌 래글런 소매',arm,shell,n=26,amp=.087,phase=s*1.4,sub=2)
            loft('소맷단 접어박기',arm[:2],binding,n=24,amp=.050)
            # Off-centre upper pocket flap, semicircular with angled opening.
            outline=[(s*x,z) for x,z in [(.220,.595),(.233,.56),(.222,.49),(.193,.426),(.144,.397),(.127,.408),(.155,.507),(.191,.583)]]
            patch('비스듬한 가슴 주머니 덮개',outline,binding,.010)
            outline=[(s*x,z) for x,z in [(.086,.283),(.242,.292),(.245,.253),(.223,.223),(.182,.206),(.125,.207),(.092,.226)]]
        else:
            outline=[(s*x,z) for x,z in [(.229,.316),(.24,.269),(.237,.158),(.203,.089),(.159,.060),(.090,.062),(.073,.083),(.082,.192),(.134,.273)]]
        patch('곡선 주머니',outline,shell,.012)
        if not vest:
            a=surface(s*.183,.237,.014)
            tube('주머니 스냅',[a,(a[0],a[1]-.007,a[2])],.007,'595746',True,n=10)
    for z in np.linspace(.055,H*.855,5):
        a=surface(-.071 if not vest else -.044,z,.013)
        tube('무광 네 구멍 단추',[a,(a[0],a[1]-.005,a[2])],.012,'302f2e',n=12)
        if not vest:
            loop=[surface(x,z+dz,.016) for x,dz in [(-.024,.008),(-.046,.009),(-.070,.008),(-.079,0),(-.070,-.007),(-.043,-.003),(-.024,-.004)]]
            tube('단추를 감싸는 루프',loop,.0032,'504f43',n=6)
    if vest:
        loft('겹쳐 여미는 스탠드 칼라',[(H-.027,0,0,.119,.095),(H+.007,0,.004,.11,.084),
             (H+.068,0,.013,.094,.075)],'424245',4,n=30,amp=.025,opening=lambda z:.32+.21*(H+.068-z)/.095)
        return
    # Tilted oval around the face: outer shell wraps all the way to the back;
    # its concave inner pile is a separate dark surface.
    L=52
    rim=[(.155*cos(t),-.065+.063*sin(t),H+.038+.127*sin(t)) for t in np.arange(L)*2*pi/L]
    def hood(name,rings,color,sw):
        verts=[pt for ring in rings for pt in ring]
        faces=[(k*L+j,k*L+(j+1)%L,(k+1)*L+(j+1)%L,(k+1)*L+j) for k in range(len(rings)-1) for j in range(L)]
        mesh(name,verts,faces,color,sw,True)
    crown=[(.134*cos(t),.062+.046*sin(t),H+.044+.124*sin(t)) for t in np.arange(L)*2*pi/L]
    cap=[(.085*cos(t),.119+.02*sin(t),H+.035+.087*sin(t)) for t in np.arange(L)*2*pi/L]
    hood('후드 뒷판과 옆판',[rim,crown,cap,[(x*.04,.145,H+.041+(z-H-.041)*.04) for x,y,z in cap]],shell,1)
    inner=[(x*.76,y+.049,H+.036+(z-H-.036)*.74) for x,y,z in rim]
    hood('파일 안감의 오목한 안쪽',[rim,inner,[(x*.07,.072,H+.026+(z-H-.026)*.05) for x,y,z in inner]],'2d2e2c',3)
    if trim:
        # Dense tapered tufts break up the silhouette on both lips of the fur.
        v=[];f=[];wash=[];gen=np.random.default_rng(1763)
        tube('후드 퍼 밑단',rim+[rim[0]],.024,'a5997c',n=10)
        for i in range(1650):
            t=gen.uniform(0,2*pi);a=gen.uniform(0,2*pi);edge=Vector((cos(t),0,sin(t)))
            tangent=Vector((-sin(t),0,cos(t)));forward=Vector((0,-1,0))
            radial=edge*cos(a)+forward*sin(a)
            centre=Vector((.155*cos(t),-.065+.063*sin(t),H+.038+.127*sin(t)))+.014*radial
            tip=centre+radial*gen.uniform(.016,.040)+tangent*gen.uniform(-.01,.012)+Vector((0,0,-.009))
            width=gen.uniform(.0024,.0052); start=len(v)
            v.extend([tuple(centre-width*tangent),tuple(centre+width*tangent),tuple(tip),tuple(centre+.004*radial)])
            f.extend([(start,start+1,start+2),(start+1,start+3,start+2),(start+3,start,start+2)])
            q=gen.uniform(.38,1.14);wash.extend([q*.69,q*.85,q*1.32,q])
        mesh('분리형 퍼 트림 털 다발',v,f,'c5b59b',3,False,wash=wash)
    else:tube('후드 접힌 가장자리',rim+[rim[0]],.009,binding,n=8)

def scarf(x,y,z,angle):
    place(x,y,z,angle)
    # A loose folded rib-knit scarf, both tails wrapping over the shelf edge.
    path=[(.20,.035),(.12,.058),(.01,.067),(-.15,.057),(-.27,.029),
          (-.30,-.026),(-.305,-.105),(-.313,-.175),(-.326,-.234)]
    for k in range(2):
        v=[];uv=[];f=[]
        for i,(w,h) in enumerate(path):
            for j in range(17):
                t=j/16;v.append(((t-.5)*.186+k*.105+.015*sin(i*.7),w+.02*k+.006*cos(t*pi*8)+.014*sin(i*.7+t*5),h+.013*k+.007*sin(t*pi*14)+.007*cos(i*.63+t*3)))
                uv.append((t,i/(len(path)-1)))
                if i and j:
                    a=i*17+j;f.append((a-18,a-17,a,a-1))
        # A thin reverse face gives the turned-over ends an opaque underside.
        count=len(v)
        v += [(x,y+.0015,z-.0015) for x,y,z in v]
        f += [tuple(i+count for i in reversed(face)) for face in f]
        mesh('워시드 울 스카프 골지와 늘어진 끝',v,f,'a29f96' if k==0 else '777676',5,True,uv+uv)

# Twin open walnut box frames with suspended inset panels, documented at the
# Gangnam public exhibition. Merchandise sits forward of each panel.
place()
block('전시 구역 회갈색 직조 카펫',0,0,.004,4.24,2.79,.008,'a0998c',6)
for cx in (-1.22,-.30):
    place(cx,.24)
    for side in (-1,1):
        for depth in (-.26,.26):block('원목 진열틀 기둥',side*.442,depth,.994,.044,.048,1.988,'75523e',2)
        for h in (.035,1.959):block('깊이 방향 장부목',side*.442,0,h,.044,.54,.056,'805c43',2)
    for h in (.035,1.959):
        for depth in (-.26,.26):block('원목 가로틀',0,depth,h,.90,.051,.058,'845c43',2)
    block('회전 전시판',0,.025,.976,.78,.042,1.79,'795640',2)
    for h in (.069,1.907):tube('전시판 회전축',[(0,.025,h-.021),(0,.025,h+.022)],.016,'94846c',True)
    tube('앞쪽 전시 걸쇠',[(0,.035,1.723),(0,-.105,1.723),(0,-.111,1.74)],.010,'8c8677',True)
    place(cx,.177);hanger(1.729)
    group=1
    place(cx,.045,.77 if cx<-.5 else .76)
    garment(black=cx<-.5,trim=cx>-.5)
    group=0
# Sign above the pair, at the wall position visible in the exhibition photo.
place()
block('상호 표기 벽면',-.76,.70,1.28,2.30,.09,2.54,'d7d0be',0)
label('매장 상호','OURSELVES',-.76,.65,2.22,.177,'332f2b')
# Two-tier walnut counter, charcoal vest on the adjacent brass-ended rail.
place(1.04,-.33,0,-12)
for dx in (-.61,.61):
    for dy in (-.255,.255):block('진열대 네모 다리',dx,dy,.412,.046,.046,.824,'754e38',2)
for h in (.20,.80):
    rounded('진열대 선반',0,0,h,1.29,.57,.033,.019,'936b50',2)
    block('선반 앞턱',0,-.275,h-.034,1.28,.025,.062,'79553e',2)
# Lower shelf holds folded wool, as seen below the exhibition counter.
for dx in (-.32,.24):
    for layer in range(2):
        rounded('접힌 워시드 울 스카프',dx+.009*layer,.025,.233+.034*layer,.37,.29,.035,.017,'72716d' if layer else '575653',5)
scarf(.88,-.37,.837,-12)
scarf(1.28,-.32,.837,-5)
place(1.06,.88)
for dx in (-.60,.60):
    block('행거 받침',dx,0,.027,.10,.49,.054,'79563c',2)
    block('행거 원목 기둥',dx,0,.84,.050,.062,1.65,'8c6249',2)
tube('행거 봉',[(-.623,0,1.65),(.623,0,1.65)],.015,'a69a84',True)
for dx,angle in [(-.30,-12),(.075,58),(.32,64)]:
    place(1.06+dx,.88,0,angle);hanger(1.662)
    place(1.06+dx,.88,.862,angle)
    group=1;garment(vest=True);group=0

place()
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
print("EDITABLE",len(collection.objects))
# Join only after saving the native parts. Keep the exporter on its explicit
# vertex-color path so it doesn't bake the color attribute into an image.
for mat in materials:
    tree=mat.node_tree
    tree.links.new(next(n for n in tree.nodes if n.type=='TEX_IMAGE').outputs['Color'],
                   tree.nodes.get('Principled BSDF').inputs['Base Color'])
for name,objects in zip(names,groups):
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
    bpy.context.object.name=name
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',
    export_animations=False, **({'export_vertex_color':'ACTIVE'} if bpy.app.version >= (4,2,0) else {}))
