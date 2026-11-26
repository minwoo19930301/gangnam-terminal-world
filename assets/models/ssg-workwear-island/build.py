"""Build the Rough Side Gangnam display in metres. Local front is -Y."""
from pathlib import Path
from math import sin, cos, pi, sqrt, radians, asin, copysign
import bpy
import numpy as np
from mathutils import Vector, Matrix

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("SSG_7F_ROUGH_SIDE")
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
def gridline(a, count, width):
    return np.abs((a*count+.5)%1-.5)<width
plaid = np.ones((N,N,3))*[.98,.965,.89]
for coord in (xx,yy):
    plaid *= np.where(gridline(coord,15,.19)[:,:,None], [.71,.73,.68], [1,1,1])
    plaid *= np.where(gridline(coord+.027,15,.058)[:,:,None], [.77,.77,.74], [1,1,1])
plaid *= (.96+.025*noise)[:,:,None]
vein = np.sin(2*pi*(yy*2+.55*np.sin(xx*6)+.14*np.sin(yy*16+xx*8)))
stone = .93+.04*vein+.025*np.sin(vein*12)+.014*noise
holes = ((xx*30)%1-.5)**2+((yy*5)%1-.5)**2 < .123
denim = .78+.11*np.cos((xx-.50)*2*pi)+.08*np.sin((xx*64-yy*56)*2*pi)+.033*noise
swatches = [rgb(np.full_like(xx,.98)), rgb(twill), rgb(wood), plaid,
            rgb(stone), rgb(np.where(holes,.29,.93)+.016*noise), rgb(denim),
            rgb(.91+.046*np.sin(xx*2*pi*80)+.025*np.sin(yy*2*pi*48)+.018*noise),
            rgb(.92+.045*noise),rgb(.91+.045*np.sin(yy*2*pi*104)+.012*noise)]
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
names=["RoughSideGangnamJoinery","RoughSideGangnamTailoring","RoughSideGangnamHardware"]
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
            wash.append(1+amp*(1.15*sin(ripple)+.65*sin(11*a-4*z+phase)-2.2*shadow))
        if i:
            for j in range(n):
                k=(i-1)*(n+1)+j;faces.append((k,k+1,k+n+2,k+n+1))
    if not opening:faces += [tuple(reversed(range(n))),tuple(range(len(verts)-n-1,len(verts)-1))]
    return mesh(name,verts,faces,col,sw,True,uv,wash)

def label(name,phrase,x,y,z,size,color):
    cv=bpy.data.curves.new(name,'FONT');cv.body=phrase;cv.size=size
    cv.align_x='CENTER';cv.align_y='CENTER';cv.resolution_u=5
    system_font=Path('/System/Library/Fonts/Supplemental/Georgia Bold.ttf')
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
def top(kind='재킷',opened=False,full=True):
    jacket=kind=='재킷'
    knit=kind=='풀오버'
    col,sw=('4e5051',1) if jacket else ('a99f89',3) if not knit else ('686952',7)
    seam='5e6060' if jacket else '989582' if not knit else '747460'
    dims=[(0,.239,.118),(.019,.242,.119),(.093,.238,.123),(.195,.229,.125),
          (.30,.231,.139),(.44,.248,.145),(.54,.25,.147),(.598,.257,.135),
          (.635,.237,.119),(.668,.167,.088),(.703,.085,.069)]
    if not jacket:dims=[(z,w*.99,d*.91) for z,w,d in dims]
    body=[(z,.008*sin(z*7),.008*sin(z*5),w,d) for z,w,d in dims]
    gap=lambda z:(.20+.40*(1-z/.705)**2+.2*(z/.705)**5 if opened else .018+.19*(z/.705)**10)
    amp=.081
    loft(kind+' 몸판',body,col,sw,40 if full else 22,amp,opening=None if knit else gap,sub=2 if full else 1)
    def front(x,z,depth=.002,back=False):
        cx,cy,w,d=interp(body,z)
        t=signedpow(min(.995,max(-.995,(x-cx)/w)),1/.85)
        a=asin(t)-pi/2
        if back:a=- (asin(t)-pi/2)
        px,py,pz=clothpoint(body,z,a,0,amp)
        return (px,py+(depth if back else -depth),pz)
    def pattern(name,outline,color,offset=.004,back=False):
        # Curved subdivisions conform to the changing chest depth.
        left,right,bottom,upper=outline
        v=[];uv=[];faces=[]
        for i in range(5):
            for j in range(8):
                u=j/7;t=i/4;x=left+(right-left)*u
                zz=bottom(u)*(1-t)+upper(u)*t
                p=front(x,zz,offset+.003*sin(pi*t)*sin(pi*u),back)
                v.append(p);uv.append((u,t))
                if i and j:
                    k=i*8+j;faces.append((k-9,k-8,k,k-1))
        mesh(name,v,faces,color,sw,True,uv)
    for side in (-1,1):
        sr=[(.008,.301,-.030,.058,.063),(.026,.300,-.030,.064,.066),
            (.073,.303,-.023,.064,.068),(.092,.305,-.019,.074,.076),
            (.122,.305,-.018,.070,.070),(.18,.306,-.015,.084,.078),
            (.259,.306,.000,.093,.087),(.289,.300,.007,.087,.082),
            (.314,.300,.011,.095,.094),(.368,.293,.012,.094,.095),
            (.454,.278,.008,.10,.097),(.520,.257,.006,.113,.106),
            (.574,.229,.007,.114,.106),(.611,.211,.009,.095,.090),(.649,.198,.004,.061,.060)]
        sleeves=[(z,side*x,y,w,d) for z,x,y,w,d in sr]
        phase=side*1.8
        loft(kind+' 굽은 소매',sleeves,col,sw,20 if full else 14,.10,phase,sub=1)
        cuff=[(z,x,y,w+.002,d+.002) for z,x,y,w,d in sleeves[:3]]
        loft('소맷단',cuff,col,7 if knit else sw,20,.08,phase)
        if full:
            tube('소매 겹솔기',[clothpoint(sleeves,z,pi*.20 if side>0 else pi*.80,phase,.11) for z in [.022,.08,.18,.28,.37,.45,.53,.58]],.0019,seam,n=5)
        if not knit:
            tube('소매 여밈 단추',[ (side*.346,-.064,.037),(side*.347,-.069,.037)],.008,'514e48',n=9)
        if jacket or (kind=='셔츠' and side<0):
            for bottom,upper in ([(.335,.492),(.072,.248)] if jacket else [(.338,.482)]):
                lo,hi=sorted((side*.061,side*.203))
                if opened:lo,hi=sorted((side*.09,side*.215))
                zl=lambda u:bottom+.014*(2*u-1)**4
                zt=lambda u:upper-.010*(1-(2*u-1)**2)
                pattern('곡면 덧주머니',(lo,hi,zl,zt),col,.008)
                if jacket:
                    flap=lambda u:upper-.035-.012*(1-abs(2*u-1))
                    pattern('주머니 덮개',(lo-.004,hi+.004,flap,lambda u:upper+.008),'565756',.016)
                    tube('덮개 가장자리',[front(lo+(hi-lo)*t,flap(t),.014) for t in np.linspace(0,1,7)],.0018,seam,n=5)
                if full:
                    path=[front(lo+.003,upper-.025,.010),front(lo+.003,bottom+.024,.010)]
                    path += [front(lo+(hi-lo)*t,zl(t)+.004,.010) for t in np.linspace(.03,.97,6)]
                    path.append(front(hi-.003,upper-.025,.010))
                    tube('포켓 상침',path,.0015,seam,n=5)
        if not knit:
            # Left and right curved fronts are trimmed independently around the opening.
            edge=[]
            for z,w,d in dims:
                a=-pi/2+side*gap(z)
                edge.append(clothpoint(body,z,a,0,amp))
            tube('앞여밈 솔기',edge,.0034,seam,n=6)
            if side>0:
                for z in [.088,.215,.344,.477,.591]:
                    e=clothpoint(body,z,-pi/2+gap(z)+.058,0,amp)
                    tube('네 구멍 단추',[e,(e[0],e[1]-.007,e[2])],.008 if jacket else .005,'4b4844' if jacket else 'cdc6b2',n=10)
                    if full and jacket:
                        tube('단추 실밥',[(e[0]-.003,e[1]-.008,e[2]),(e[0]+.003,e[1]-.008,e[2])],.0011,'a09b8e',n=4)
    if not knit:
        # Roll of the collar. The points dip on each side of the throat,
        # rise over the shoulders and turn into a folded stand at the nape.
        v=[];uv=[];faces=[]
        for i in range(4):
            t=i/3
            for j in range(33):
                u=j/32;a=-pi/2+.23+(2*pi-.46)*u
                frontness=max(0,-sin(a))
                end=min(u,1-u)
                tip=np.exp(-((end-.065)/.052)**2)
                w=.081+(.056+.012*frontness)*t;d=.064+(.040+.030*frontness)*t
                z=.723-.018*frontness-.037*t-.060*t*tip+.009*sin(pi*t)
                v.append((w*cos(a),d*sin(a),z));uv.append((u,t))
                if i and j:
                    k=i*33+j;faces.append((k-34,k-33,k,k-1))
        mesh('접혀 내려오는 셔츠칼라',v,[tuple(reversed(f)) for f in faces],'5a5b59' if jacket else col,sw,True,uv)
        tube('칼라 끝 스티치',[(x,y,z+.001) for x,y,z in v[-33:]],.002,seam,n=5)
        if not opened:
            # Fabric behind the narrow button stand closes the front.
            pattern('안단',(-.027,.027,lambda u:.002,lambda u:.669),col,-.004)
            block('목 뒤 직조 라벨',0,.042,.691,.065,.004,.026,'d8ccb6')
    else:
        loft('크루넥 리브',[(.674,0,0,.103,.075),(.690,0,0,.098,.072),(.709,0,0,.082,.062)],col,7,32,.015)
    if full:
        tube('뒤판 어깨 요크',[front(x,.558+.018*(abs(x)/.20)**2,.003,True) for x in np.linspace(-.20,.20,19)],.002,seam,n=5)

def trousers(jeans=False):
    col='617c92' if jeans else '8c8775'; sw=6 if jeans else 1
    for s in (-1,1):
        leg=[(.035,.146,-.011,.095,.102),(.051,.145,-.014,.098,.104),(.092,.145,-.006,.091,.094),
             (.173,.138,.008,.098,.092),(.303,.131,.006,.096,.096),(.432,.127,-.018,.096,.103),
             (.469,.126,-.023,.092,.098),(.504,.123,-.019,.104,.106),(.561,.120,.002,.108,.11),
             (.671,.108,.006,.115,.124),(.775,.098,.004,.120,.140),(.866,.084,0,.115,.134),(.912,.081,0,.107,.127)]
        rows=[(z,x*s,y,w,d) for z,x,y,w,d in leg]
        loft('데님 바짓가랑이' if jeans else '퍼티그 바짓가랑이',rows,col,sw,24,.098,s*1.3)
        tube('바지 옆선',[clothpoint(rows,z,0 if s>0 else pi,s*1.3,.098) for z,*_ in rows],.0019,'796c56' if jeans else 'a29c87',n=5)
    rows=[(.745,0,0,.195,.12),(.822,0,.005,.214,.136),(.925,0,.004,.202,.124),(1.014,0,0,.179,.104)]
    loft('바지 허리와 엉덩이',rows,col,sw,32,.037)
    loft('허릿단',[(.972,0,0,.190,.113),(.994,0,0,.183,.11),(1.022,0,0,.177,.106)],col,sw,32,.033)
    for side in (-1,1):
        for back in (-1,1):
            v=[]
            for x,z in [(.062,.938),(.180,.96),(.194,.84),(.158,.806),(.085,.795)]:
                cx,cy,w,d=interp(rows,z)
                y=back*(d*sqrt(max(.03,1-(x/w)**2))+.009)
                v.append((side*x,y,z))
            mesh('바지 아웃 포켓',v,[(0,1,2,3,4)],col,sw)
            tube('포켓 이중 박음선',v+[v[0]],.002,'a09070',n=5)
    tube('바지 앞여밈',[(.038,-.110,.985),(.039,-.129,.895),(.027,-.138,.865),(0,-.142,.858)],.0022,'9c927b',n=6)

def boot(side):
    x=side*.144
    rows=[(.006,x,-.050,.08,.146),(.022,x,-.050,.082,.147),(.028,x,-.052,.080,.144),
          (.051,x,-.058,.078,.143),(.072,x,-.059,.075,.140),(.092,x,-.025,.071,.103),(.122,x,.003,.069,.077)]
    loft('마네킹 검은 구두',rows,'383635',0,22,.016)
    for j in range(3):
        tube('구두 끈',[(x-.029,-.097+j*.014,.084+j*.009),(x+.028,-.097+j*.014,.085+j*.009)],.0023,'585550',n=5)

# Store photograph 2: two separate presentation bases and a projecting blade
# sign. The brand's own shop portrait supplies the open checkerwork behind them.
place()
# The photograph shows cream triangular stone inlays around the islands.
# Clip the display apron to the public bay; it is a flush, non-colliding finish.
for ix in range(4):
    for iy in range(5):
        x=-1.77+ix*.885;y=-1.48+iy*.70;w=.883;d=.698
        q=[(x,y,.027),(x+w,y,.027),(x+w,y+d,.027),(x,y+d,.027)]
        faces=((0,1,2),(0,2,3)) if (ix+iy)%2 else ((0,1,3),(1,2,3))
        for k,face in enumerate(faces):
            mesh('삼각 석재 바닥 무늬',[q[i] for i in face],[(0,1,2)],
                 ['d1c7b9','e9dfce','cbc4b7','eee5d7','dfd5c4'][(ix*7+iy*3+k)%5],4)
rounded('짙은 받침대',.60,-.31,.029,1.42,.52,.215,.104,'735e50',8)
rounded('둥근 석재 상판',.60,-.31,.244,1.72,.62,.063,.145,'d8c9ab',4)
rounded('목재 마네킹 단상',-.91,.32,.028,1.35,.93,.147,.028,'79503b',2)
for x in [-1.565,-.255]:
    tube('단상 모서리 몰딩',[(x,-.128,.174),(x,.764,.174)],.004,'926e4e')
# Thin return rail bent through both corners, with rod sockets on the stone.
for x in [-.06,1.26]:
    rounded('행거 고정 소켓',x,-.27,.307,.062,.065,.014,.016,'b3a389',metal=True)
rail=[(-.06,-.27,.318),(-.06,-.27,1.886)]
rail += [(.004-.064*cos(t),-.27,1.886+.064*sin(t)) for t in np.linspace(.12,pi/2,7)]
rail += [(1.196+.064*sin(t),-.27,1.886+.064*cos(t)) for t in np.linspace(0,pi/2,8)]
rail += [(1.26,-.27,.318)]
tube('새틴 니켈 라운드 행거',rail,.0155,'b2a795',True,12)
# A front display arm presents the jacket broadside, and supports the denim clips.
tube('행거 돌출 봉',[(.265,-.27,1.95),(.265,-.58,1.95)],.011,'b5ad9f',True)
tube('바지걸이 단차 봉',[(.265,-.28,1.946),(.265,-.28,1.486),(.265,-.48,1.486)],.008,'978b79',True)
# Rear niche, walnut pilasters with closely spaced reeding along the header.
for x in [-1.48,1.28]:
    block('호두나무 측판',x,1.676,1.276,.31,.36,2.51,'684a39',2)
block('호두나무 상부 인방',-.10,1.68,2.43,3.09,.35,.27,'74533e',2)
for i in range(53):
    block('세로 홈 목재 살',-1.37+i*.049,1.492,2.43,.029,.031,.205,'7c5941' if i%3 else '684933',2)
block('전시 니치 어두운 배면',-.10,1.861,1.19,2.51,.045,2.28,'63564b',2)
# Thin onyx plaques with genuinely open cells in both directions.
tw=.267
for i in range(9):
    for j in range(8):
        if i%2==1 and j%2==1:continue
        block('반투명 석재 격자 판',-.10+(i-4)*tw,1.524,.187+(j+.5)*tw,tw-.0025,.100,tw-.0025,
              ['eee8da','deded4','e8e8dc','f4eee1','ddd9d2'][(i*7+j*11)%5],4)
# Perforated metal display ledge and its narrow support, signed on two faces.
block('타공 금속 전시대',-.19,1.275,.895,1.70,.35,.12,'b4ada2',5,True)
block('전시대 다리',-.72,1.30,.466,.065,.10,.755,'a7a092',9,True)
rounded('전시대 바닥판',-.72,1.30,.033,.34,.21,.020,.03,'aaa294',9,True)
# Stone-clad side pier and polished kick plate. Lettering is separate editable geometry.
block('기둥 하부 스테인리스',1.473,.61,.374,.53,.63,.70,'a9a69c',9,True)
block('석재 기둥 하부 줄눈',1.473,.61,1.14,.53,.63,.827,'c0b39c',8)
block('석재 기둥 상부',1.473,.61,1.994,.53,.63,.872,'c0b39c',8)
block('석재 기둥 두겁',1.473,.61,2.61,.53,.63,.35,'ded3bc',8)
block('돌출형 간판',1.269,.247,2.17,.79,.13,.161,'d6c8aa',9,True)
label('기둥 간판 활자','rough side',1.269,.176,2.169,.115,'322b25')
# A narrow slatted header runs continuously in the manufacturer's image.
block('니치 바닥 직조 카펫',-.16,1.30,.032,2.47,.73,.008,'968d7d',7)
# Moss and rock assemblage under the perforated table in the store portrait.
for i,(x,y,w,h,col) in enumerate([(-.73,1.16,.22,.094,'65704a'),(-.47,1.17,.19,.115,'69754a'),
    (-.61,1.04,.105,.19,'b4ab90'),(-.82,1.11,.106,.12,'817e65'),(-.41,1.08,.080,.080,'98937d')]):
    loft('니치 조경석과 이끼',[(.032,x,y,w*.81,w*.58),(.052,x,y,w,w*.71),(.032+h*.65,x+.014,y,w*.74,w*.51),
                         (.032+h,x-.009,y+.018,w*.23,w*.18)],col,8,11,.19,i)
for j in range(23):
    a=j*2.399
    tube('전시대 아래 잎',[(-.64,1.22,.08),(-.64+.08*cos(a),1.22+.065*sin(a),.22),
         (-.64+.16*cos(a),1.22+.11*sin(a),.22+.08*sin(j*.71))],.0035,'64714b',n=4)
# Each item remains a set of editable pattern pieces in the source collection.
group=1
place(-.91,.32,.174,-9)
trousers()
for side in (-1,1):boot(side)
# An open BDU over the plaid button-down. Only the exposed center of the
# inner shirt is needed, leaving the inner layer independently editable.
rows=[(.884,0,0,.19,.106),(.966,0,0,.195,.111),(1.17,0,0,.193,.115),
      (1.41,0,0,.199,.115),(1.53,0,0,.171,.092),(1.606,0,0,.067,.055)]
loft('마네킹 이너 체크 셔츠',rows,'c6bda4',3,28,.03)
for s in (-1,1):
    v=[(s*.017,-.066,1.617),(s*.064,-.032,1.627),(s*.099,-.044,1.593),
       (s*.073,-.090,1.554),(s*.035,-.085,1.581)]
    mesh('이너 셔츠 칼라 깃',v,[(0,1,2),(0,2,4),(4,2,3)],'c1b6a1',3)

for z in [1.02,1.14,1.26,1.38,1.49]:
    tube('셔츠 진주빛 단추',[(0,-.117,z),(0,-.122,z)],.005,'ebe2c9',n=8)
loft('머리 없는 린넨 목형',[(1.556,0,0,.071,.065),(1.633,0,0,.072,.065),
     (1.732,0,0,.061,.059),(1.747,0,0,.058,.058)],'d7c5a4',1,28,.012)
loft('목형 마감 원판',[(1.744,0,0,.061,.059),(1.756,0,0,.060,.058)],'ab8b62',2,28,.008)
place(-.91,.32,.174+.922,-9)
top(opened=True)
# The customer-facing jacket and the jeans behind it follow the photograph's
# stacked silhouettes. Trouser clips have a separate rail to carry their load.
place(.265,-.447,.422,5)
trousers(True)
group=0
block('바지걸이 가로목',0,0,1.042,.38,.030,.031,'c9a57c',2)
for x in [-.142,.142]:
    block('바지 집게',x,0,1.024,.036,.043,.063,'b8b3a3',9,True)
tube('바지걸이 고리',[(0,0,1.053),(0,0,1.067),(.010,0,1.08),(.020,0,1.079),(.028,0,1.068)],.0035,'aaa795',True)
for x,y,angle,kind in [(.265,-.555,6,'재킷'),(.563,-.27,66,'셔츠'),(.748,-.27,69,'풀오버'),
                      (.934,-.27,71,'셔츠'),(1.11,-.27,75,'풀오버')]:
    place(x,y,0,angle)
    group=0;hanger(1.937)
    place(x,y,1.937-.077-.703,angle)
    group=1;top(kind,full=angle<10)

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
