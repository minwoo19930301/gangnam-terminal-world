"""Build the Gangnam RIMOWA oak gallery. Units are metres, visitors face +Y."""
import bpy
import numpy as np
import math
from math import sin, cos, pi, sqrt
from pathlib import Path
from mathutils import Vector, Matrix
import tempfile

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('SSG_6F_RIMOWA_GALLERY')
bpy.context.scene.collection.children.link(collection)
bpy.context.preferences.filepaths.save_version = 0
frame = Matrix.Identity(4)
def rgb(h):
    a = [int(h[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in a)+(1,)

def material(name, metal, rough, colored=True):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Metallic'].default_value=metal
    bs.inputs['Roughness'].default_value=rough
    if colored:
        c=m.node_tree.nodes.new('ShaderNodeVertexColor')
        c.layer_name='Color'
        m.node_tree.links.new(c.outputs['Color'],bs.inputs['Base Color'])
    return m

al=material('RimowaGangnamAluminium',.50,.26)
cloth=material('RimowaGangnamTextiles',.03,.72)
trim=material('RimowaGangnamFittings',.18,.35)
oak=material('RimowaGangnamOak',0,.62,False)
groups=[al,cloth,trim,oak]

def mesh(name,pts,faces,mat,color,smooth=False,colors=None):
    data=bpy.data.meshes.new(name)
    data.from_pydata([frame @ Vector(p) for p in pts],[],faces)
    data.update()
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    data.materials.append(mat)
    if mat!=oak:
        layer=data.color_attributes.new(name='Color',type='BYTE_COLOR',domain='POINT')
        for i,v in enumerate(layer.data):
            v.color=rgb(colors[i] if colors else color)
    for p in data.polygons:p.use_smooth=smooth
    return obj

def box(name,p,size,mat,c,r=0):
    v=[tuple(p[j]+size[j]*s[j]/2 for j in range(3)) for s in
       [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    o=mesh(name,v,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat,c)
    if r:
        b=o.modifiers.new('모서리 성형','BEVEL');b.width=r;b.segments=1 if r<=.004 else (2 if r<=.013 else 3)
        if hasattr(o.data,'use_auto_smooth'):o.data.use_auto_smooth=True
        n=o.modifiers.new('면 법선','WEIGHTED_NORMAL')
    return o

def sweep(name,points,radii,mat,c,guide=(0,1,0),sides=7):
    pts=[Vector(p) for p in points]
    verts=[]; faces=[]
    for i,p in enumerate(pts):
        t=(pts[min(len(pts)-1,i+1)]-pts[max(0,i-1)]).normalized()
        g=Vector(guide)
        if abs(t.dot(g))>.96:g=Vector((1,0,0)) if abs(t.x)<.9 else Vector((0,0,1))
        n=(g-t*t.dot(g)).normalized(); b=t.cross(n)
        for j in range(sides):
            a=2*pi*j/sides;verts.append(p+n*radii[0]*cos(a)+b*radii[1]*sin(a))
        if i:
            for j in range(sides):
                k=(i-1)*sides+j; l=(i-1)*sides+(j+1)%sides
                faces.append((k,l,l+sides,k+sides))
    faces.extend([tuple(reversed(range(sides))),tuple(range(len(verts)-sides,len(verts)))])
    return mesh(name,verts,faces,mat,c,True)

def rounded(w,d,r,n=5):
    points=[]
    for cx,cy,start in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)]:
        for j in range(n+1):
            a=math.radians(start+90*j/n);points.append((cx+r*cos(a),cy+r*sin(a)))
    return points

def ringmesh(name,rings,mat,c,smooth=True,colors=None):
    n=len(rings[0]);faces=[tuple(reversed(range(n)))]
    for i in range(len(rings)-1):
        for j in range(n):
            a=i*n+j;b=i*n+(j+1)%n;faces.append((a,b,b+n,a+n))
    faces.append(tuple(range((len(rings)-1)*n,len(rings)*n)))
    return mesh(name,[v for ring in rings for v in ring],faces,mat,c,smooth,colors)

def uv_oak():
    # Non-repeating quarter-cut and cathedral grain, narrow veneer joints,
    # warm grazing light immediately above the three floating shelves.
    w,h=1024,768
    y,x=np.mgrid[0:h,0:w]/np.array([[[h-1]],[[w-1]]])
    rng=np.random.default_rng(56)
    board=np.floor(x*5);u=(x*5)%1
    wave=u+.011*np.sin(y*12+board*3)+.017*np.sin(y*5+u*3)
    cathedral=np.sqrt(((u-.47)*1.7)**2+((y-.28-.08*np.sin(board*6))*.55)**2)
    grain=.016*np.sin(cathedral*130+2*np.sin(wave*24))+.012*np.sin(wave*340)+.016*rng.normal(size=(h,w))
    grain+=.006*np.sin(wave*1200+y*4)+.014*np.sin(board*2)+.017*np.sin(u*12+y*7)
    shadow=np.zeros_like(x)
    for level in [.15,.83,1.50]:
        dz=y*2.86-level
        gate=np.clip((.184-x)*-160,0,1)*np.clip((.561-x)*160,0,1)
        shadow+=gate*(.25*np.exp(-abs(dz-.025)/.058)-.16*np.exp(-abs(dz+.045)/.035))
    # Broad shadows from the bodies and thinner shadows at the shelf returns.
    for cx,level,rx,rz in [(-.84,1.50,.19,.44),(-.18,1.5,.29,.35),
                            (-.83,.83,.29,.35),(-.18,.83,.19,.44),
                            (-.83,.15,.22,.40),(-.18,.15,.29,.35),
                            (1.18,.10,.44,.32),(1.18,.50,.44,.35),(1.18,.93,.37,.29),
                            (1.18,1.29,.32,.25),(1.15,1.63,.20,.51)]:
        dx=(x*4.02-2.01-cx-.075)/rx;dz=(y*2.86-level-rz*.42)/rz
        shadow-=.115*np.exp(-1.6*abs(dx)**4-13*abs(dz)**4)
    pixels=np.ones((h,w,4),dtype=np.float32)
    for k,base in enumerate([.67,.49,.31]):
        pixels[:,:,k]=np.clip(base+grain+shadow*(1-.18*k)-.07*(u<.002),0,1)
    img=bpy.data.images.new('오크 무늬목',width=w,height=h,alpha=False)
    img.pixels.foreach_set(pixels.ravel());img.update()
    with tempfile.TemporaryDirectory() as td:
        img.filepath_raw=str(Path(td)/'oak.jpg');img.file_format='JPEG';img.save()
        img=bpy.data.images.load(img.filepath_raw);img.pack();img.filepath='//oak.jpg'
    nt=oak.node_tree;tex=nt.nodes.new('ShaderNodeTexImage');tex.image=img
    nt.links.new(tex.outputs['Color'],nt.nodes.get('Principled BSDF').inputs['Base Color'])
    o=box('오크 무늬목 벽',(0,.055,1.43),(4.02,.12,2.86),oak,'')
    uv=o.data.uv_layers.new(name='Veneer')
    for p in o.data.polygons:
        for l in p.loop_indices:
            v=o.data.vertices[o.data.loops[l].vertex_index].co
            uv.data[l].uv=((v.x+2.01)/4.02,v.z/2.86)

uv_oak()
# Shallow curved metal fascia visible from the public aisle in photo one.
fascia=[]
for i in range(41):
    x=-2.04+i*.102
    bulge=.055*(1-(x/2.04)**2)
    fascia.append([(x,-.24-bulge,2.78),(x,.113,2.78),(x,.113,3.01),(x,-.24-bulge,3.01)])
faces=[]
for i in range(40):
    for j in range(4):
        a=4*i+j;b=4*i+(j+1)%4;faces.append((a,b,b+4,a+4))
mesh('헤어라인 금속 상인방',[p for row in fascia for p in row],faces,al,'727f82')
def wordmark():
    data=bpy.data.curves.new('RIMOWA','FONT');data.body='RIMOWA'
    data.size=.13;data.space_character=1.16;data.align_x='CENTER';data.align_y='CENTER'
    obj=bpy.data.objects.new('상인방 리모와 글자',data);collection.objects.link(obj)
    obj.location=(1.14,-.292,2.89);obj.rotation_euler.x=pi/2
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target='MESH')
    obj.data.materials.append(trim)
    layer=obj.data.color_attributes.new(name='Color',type='BYTE_COLOR',domain='POINT')
    for v in layer.data:v.color=rgb('f5f7f4')
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
wordmark()
box('하단 그림자 줄눈',(0,.035,.023),(4.04,.15,.046),trim,'45392e',.009)
for z in [.15,.83,1.50]:
    box('선반 아래 접힌 알루미늄',(-.515,-.19,z-.024),(1.50,.415,.049),al,'b8bdbe',.014)
    box('선반 상판',(-.515,-.19,z+.003),(1.49,.41,.012),trim,'e1e2dd',.005)
    box('후면 조명 확산판',(-.515,-.016,z+.025),(1.45,.019,.029),trim,'fff1c9',.004)

# Racetrack mirror with a slender metal return and a vertical sky/floor gradient.
def mirror():
    x=-1.67;mid=1.18; r=.25; straight=.74
    border=rounded(.52,1.99,.249,14)
    path=[(x+a,-.104,mid+b) for a,b in border]
    sweep('타원 거울 테두리',path+[path[0]],(.020,.012),al,'bcc4c4',sides=8)
    rings=[];colors=[]
    for i in range(33):
        t=-.9999+i*1.9998/32; h=t*(straight+r);half=sqrt(max(.0001,r*r-max(0,abs(h)-straight)**2))
        rings.extend([(x-half,-.119,mid+h),(x+half,-.119,mid+h)])
        for s in [-1,1]:
            v=(1-t)/2
            colors.append(''.join('%02x'%int(a+(b-a)*v+s*2) for a,b in zip((91,113,123),(199,213,213))))
    mesh('연마 거울 반사면',rings,[(i,i+1,i+3,i+2) for i in range(0,64,2)],trim,'',colors=colors)
    for h in [mid-.98,mid+.98]:box('거울 고정 탭',(x,-.063,h),(.052,.08,.075),al,'a8afb0',.013)
mirror()

# Build the grooved deep-drawn shell from its profile. Each groove has a
# shallow crown, a narrow shadow flank and an unbroken smooth corner radius.
def shell_profile(w,d,r):
    corners=rounded(w,d,r)
    result=[]
    for i,p in enumerate(corners):
        q=corners[(i+1)%len(corners)]
        dx=q[0]-p[0];dy=q[1]-p[1];length=math.hypot(dx,dy)
        result.append((*p,0,'bfc4c6'))
        if length<.065:continue
        n=max(2,round(length/.029))
        for j in range(n):
            for f,off,col in [(.10,.001,'849096'),(.28,.005,'b8c2c5'),(.60,.005,'dee4e5'),(.83,.0005,'949ea2')]:
                s=(j+f)/n;result.append((p[0]+s*dx,p[1]+s*dy,off,col))
    return result

def wheel(x,y,z,r):
    for a in [-1,1]:
        xx=x+a*.012
        for name,off,rad,col in [('회전 휠 타이어',0,r,'26292b'),('허브 캡',a*.006,r*.62,'9ba4a8'),('축 중심',a*.008,r*.25,'444b50')]:
            sweep(name,[(xx+off-.005,y,z),(xx+off+.005,y,z)],(rad,rad),trim,col,guide=(0,0,1),sides=14)
    box('캐스터 포크',(x,y,z+.017),(.013,.037,.044),al,'adb2b4',.005)

def suitcase(w,d,h,variant):
    r=min(.055,w*.14);prof=shell_profile(w,d,r)
    rings=[];cols=[]
    for z,k,amp in [(0,.80,0),(.007,.89,0),(.017,.95,0),(.034,.985,0),(.050,1,0),(.060,1,1),(h-.060,1,1),(h-.050,1,0),(h-.034,.985,0),(h-.017,.95,0),(h-.007,.89,0),(h,.80,0)]:
        ring=[]
        for x,y,off,c in prof:
            # Only planar parts of the perimeter carry pressed beads.
            ox=math.copysign(off*amp,x) if abs(x)>=w/2-.00001 else 0
            oy=math.copysign(off*amp,y) if abs(y)>=d/2-.00001 else 0
            ring.append((x*k+ox,y*k+oy,z))
            base=c if amp else ('c2ccce' if z>h/2 else '919b9f')
            # Broad fronts and brushed side panels catch different light.
            grain=.87+.07*cos(2*pi*y/d)+.065*sin(x/w*4+z/h*.8)
            cols.append(''.join('%02x'%min(255,int(int(base[k:k+2],16)*grain)) for k in (0,2,4)))
        rings.append(ring)
    ringmesh('프레스 알루미늄 홈 외피',rings,al,'',True,cols)
    # Clamshell seam wraps the lid perimeter in the X/Z plane.
    for y,width,c in [(-.012,.006,'576269'),(-.020,.005,'dce0de'),(-.004,.004,'e4e8e5')]:
        path=[(a,y,b+h/2) for a,b in rounded(w+.005,h+.006,r,6)]
        sweep('뚜껑 접합 비드',path+[path[0]],(width,.0035),al,c)
    for side in [-1,1]:
        for end in [0,h]:
            z=.023 if end==0 else h-.023
            for sy in [-1,1]:
                # A drawn corner plate follows the shell's rounded end, returning
                # onto each adjoining face; its central rivet sits on that plate.
                verts=[];faces=[]
                for iz,(height,k) in enumerate([(.004,.86),(.008,.90),(.017,.95),(.034,.985),(.048,.999)]):
                    for ia in range(11):
                        a=pi/2*ia/10
                        px=(w/2-r+r*cos(a))*k+.0025*cos(a)
                        py=(d/2-r+r*sin(a))*k+.0025*sin(a)
                        zz=height*(.84+.16*sin(2*a))
                        verts.append((side*px,sy*py,zz if end==0 else h-zz))
                        if ia and iz:
                            k0=iz*11+ia;faces.append((k0-12,k0-11,k0,k0-1))
                if (side*sy<0) != (end!=0):faces=[f[::-1] for f in faces]
                mesh('프레스 모서리 보호판',verts,faces,al,'c1cbd1',True)
                px=side*(w/2-r+r*.707)*.99;py=sy*(d/2-r+r*.707)*.99
                z=.036 if end==0 else h-.036
                sweep('보강 리벳',[(px,py,z),(px+side*.004,py+sy*.004,z)],
                      (.0045,.0045),al,'96a2a7',guide=(0,0,1),sides=8)
    for z in [h*.21,h*.79]:
        x=-w/2-.009
        box('잠금쇠 고무 좌대',(x,0,z),(.017,.100,.058),trim,'2b3032',.010)
        box('매립 잠금쇠',(x-.010,0,z),(.011,.082,.044),al,'babfc0',.006)
        for j in range(3):
            box('조합 다이얼',(x-.016,-.020+j*.018,z),(.004,.009,.023),trim,'3e4449',.002)
        box('슬라이드 버튼',(x-.017,.030,z),(.004,.011,.027),al,'e0e2e1',.002)
        for sy in [-1,1]:
            box('경첩 날개',(w/2+.003,sy*.021,z),(.011,.041,.055),al,'a9afb0',.004)
        sweep('경첩 핀',[(w/2+.009,0,z-.029),(w/2+.009,0,z+.029)],(.007,.007),al,'d9dedd')
    # On the side, the two spring pivots and arched grip fold against the seam.
    inset=[.025,.047,.031,.019,.024][variant]
    for zz in [h*.39,h*.61]:
        box('측면 손잡이 받침',(-w/2-.011,0,zz),(.022,.044,.036),al,'969da0',.008)
    sweep('측면 접이식 손잡이',[(-w/2-.019,0,h*.38),(-w/2-.045,-.015,h*.395),(-w/2-.050,-inset,h*.42),(-w/2-.05,-inset,h*.58),(-w/2-.045,-.015,h*.605),(-w/2-.019,0,h*.62)],(.010,.010),al,'cdd2d3')
    if variant in (1,2):
        sweep('손잡이 중앙 완충 그립',[(-w/2-.050,-inset,h*.425),(-w/2-.050,-inset,h*.575)],
              (.012,.012),trim,'747f84' if variant==2 else '9ca7aa')
    if variant==4:
        # Telescopic rail mouth and flush pull grip behind the carry handle.
        box('인입 손잡이 포켓',(0,d*.32,h-.002),(w*.50,.039,.015),trim,'626e73',.007)
        box('인입 손잡이 바',(0,d*.32,h+.007),(w*.45,.027,.015),al,'afb9bd',.006)
    sweep('상단 운반 손잡이',[(-w*.18,0,h),(-w*.15,0,h+.031),(-w*.10,0,h+.037),(w*.14,0,h+.037),(w*.18,0,h+.014),(w*.18,0,h)],(.014,.008),al,'b6bcbf')
    for x in [-w*.39,w*.39]:
        for y in [-d*.35,d*.35]:wheel(x,y,-.019,.028)

def at(x,y,z):return Matrix.Translation((x,y,z))
# Rotate a standing case onto its broad back: wheels on the left, latches forward.
sideways=Matrix(((0,0,1,0),(1,0,0,0),(0,1,0,0),(0,0,0,1)))
for i,(w,d,h,bottom) in enumerate([(.48,.33,.84,.097),(.49,.35,.84,.503),(.435,.285,.73,.933),(.38,.25,.62,1.294)]):
    cx=1.18
    frame=Matrix.Identity(4)
    box('케이스 벽걸이 받침',(cx,-.19,bottom-.024),(h*.80,.40,.046),trim,'575955',.010)
    frame=at(cx-h/2,-.25,bottom+d/2+.006) @ sideways
    suitcase(w,d,h,i)
frame=Matrix.Identity(4)
box('캐빈 받침',(1.15,-.17,1.573),(.43,.35,.032),al,'aeb5b8',.009)
frame=at(1.15,-.21,1.632) @ Matrix.Rotation(.09,4,'Z')
suitcase(.39,.235,.51,4)
frame=Matrix.Identity(4)

def tint(c,f):
    return ''.join('%02x'%max(0,min(255,round(int(c[i:i+2],16)*f))) for i in (0,2,4))

def strap(name,pts,width,col):
    # Flat woven webbing; the first axis describes its thickness.
    return sweep(name,pts,(.0034,width/2),cloth,col,sides=8)

def softbag(kind,x,z,color,angle,seed):
    global frame
    frame=at(x,-.228,z) @ Matrix.Rotation(math.radians(angle),4,'Z')
    backpack=kind=='백팩'; tote=kind=='토트'
    w,d,h=(.35,.217,.438) if backpack else ((.420,.191,.387) if tote else (.562,.252,.354))
    seam=tint(color,.73); highlight=tint(color,1.16)
    def scales(v):
        if backpack:
            return (.88+.13*sin(pi*v)**.6-.105*v**4,.79+.23*sin(pi*v)**.65-.16*v**5)
        if tote:return (.95+.05*v-.035*sin(2*pi*v),.88+.16*sin(pi*v)-.08*v)
        return (.92+.10*sin(pi*v)**.65-.14*v**4,.82+.19*sin(pi*v)**.65-.36*v**5)
    def surface(a,v):
        sx,sy=scales(v); ca,sa=cos(a),sin(a)
        # Angular folds converge towards the sewn base and carry strap loads.
        fold=.008*sin(7*a+v*7+seed)*sin(pi*v)**.65+.004*sin(13*a-v*11+seed*.7)*sin(pi*v)
        return (w*.5*sx*math.copysign(abs(ca)**.59,ca)*(1+fold*3)+.005*v*sin(seed),
                d*.5*sy*math.copysign(abs(sa)**.6,sa)+fold,
                h*v+.006*sin(a*3+seed)*v**4)
    rings=[]; colors=[];segments=56
    for j in range(19):
        v=j/18;rings.append([surface(2*pi*i/segments,v) for i in range(segments)])
        for i in range(segments):
            a=2*pi*i/segments
            colors.append(tint(color,.99+.13*sin(a*9+v*8+seed)+.055*cos(a*6-v*12)+.040*sin(a*15+v*9)))
    body=ringmesh(kind+' 직물 몸판',rings,cloth,color,True,colors)
    # Continuous cylindrical mapping for a small repeating jacquard weave.
    uv=body.data.uv_layers.new(name='Fabric')
    for face in body.data.polygons:
        indices=[body.data.loops[l].vertex_index%segments for l in face.loop_indices]
        wrap=0 in indices and segments-1 in indices
        for l,index in zip(face.loop_indices,indices):
            vi=body.data.loops[l].vertex_index
            u=(segments if wrap and index==0 else index)/segments
            uv.data[l].uv=(u*(w+d)*2/.052,(vi//segments)/18*h/.052)
    def front(xx,v,clear=.004):
        sx,_=scales(v)
        u=max(-.998,min(.998,xx/(w*.5*sx)))
        a=-math.acos(math.copysign(abs(u)**(1/.59),u))
        px,py,pz=surface(a,v)
        return (px,py-clear,pz)
    for v in [.020,.065]:
        p=[surface(2*pi*i/56,v) for i in range(57)]
        sweep('하단 파이핑',p,(.002,.002),cloth,seam)
    # Embossed oblongs in the fabric of the signature bags.
    for center in [-.22,.22]:
        for inset in [0,.016,.032]:
            pts=[]
            for i in range(49):
                a=2*pi*i/48
                xx=w*(center+(.210-inset)*cos(a))+.016*sin(a)
                v=.49+(.409-inset*2)*sin(a)
                pts.append(front(xx,v,.002))
            sweep('직물 타원 자카드 무늬',pts,(.0012,.0021),cloth,tint(color,1.095),sides=4)
    for s in [-1,1]:
        for a in [-.64, .61]:
            path=[surface((a if s==1 else pi-a),j/16) for j in range(17)]
            sweep('옆판 봉제선',path,(.0024,.0024),cloth,highlight)
    if backpack:
        # The lid folds from the back over the gathered neck and front panel.
        pts=[];faces=[]
        rows=[(.055,.98,.78),(.030,1.015,.88),(-.031,1.015,.93),(-.076,.983,.97),(-.098,.936,1),(-.105,.839,.96),(-.106,.800,.86)]
        edge=[]
        for j,(yy,v,ww) in enumerate(rows):
            for i in range(13):
                t=(i-6)/6;pts.append((t*w*.47*ww,yy+.008*t*t,h*v+.009*t*t+.002*sin(t*5+seed)))
                if i and j:
                    a=j*13+i;faces.append((a-14,a-13,a,a-1))
        mesh('접힌 덮개',pts,faces,cloth,highlight,True)
        for i in [0,12]:
            sweep('덮개 옆 테두리',[pts[j*13+i] for j in range(len(rows))],(.0028,.0028),cloth,seam)
        sweep('덮개 하단 말아박기',pts[-13:],(.003,.003),cloth,seam)
        for s in [-1,1]:
            xx=s*w*.29
            strap('덮개 조임끈',[front(xx,.58),front(xx,.66,.009),front(xx,.79,.010)],.021,seam)
            box('조임쇠',(xx,-.114,h*.748),(.024,.009,.022),al,'92958a',.004)
            sweep('후면 어깨끈',[(s*.064,.062,h*.93),(s*.089,.113,h*.88),(s*.103,.154,h*.62),(s*.105,.158,h*.42),(s*.111,.106,h*.18)],(.010,.021),cloth,seam)
    else:
        path=[(-w*.395+w*.79*j/20,-.010+.003*cos(pi*j/20),h*(1+.009*sin(pi*j/20))) for j in range(21)]
        sweep('상단 지퍼 테이프',path,(.008,.004),cloth,seam)
        sweep('지퍼 코일',[(a,b-.001,c+.003) for a,b,c in path],(.0018,.0018),al,'8c8e86')
        box('지퍼 슬라이더',(w*.32,-.013,h+.005),(.019,.012,.008),al,'a8a8a1',.002)
        if not tote:
            # Crossbody strap sweeps diagonally over the front and doubles
            # around the right gusset, as in the branch photograph.
            path=[front(w*(-.39+.81*j/20),.91-.80*j/20-.045*sin(pi*j/20),.010) for j in range(21)]
            strap('대각선 어깨끈',path,.035,seam)
            mx,my,mz=path[8]
            pts=[(mx+a*.75+b*.66,my-.004,mz-a*.66+b*.75) for a,b in rounded(.047,.029,.005,3)]
            sweep('어깨끈 길이 조절쇠',pts+[pts[0]],(.0025,.0025),al,'babbb1')
            for s in [-1,1]:
                xx=s*w*.48
                arc=[(xx+s*.009*cos(a*pi/12),-.012,.65*h+.025*sin(a*pi/12)) for a in range(25)]
                sweep('측면 D링',arc,(.0035,.0035),al,'93988e')
    # Two carry handles, with shaped webbing tabs sewn onto both faces.
    spread=w*(.195 if not backpack else .125);rise=.19 if tote else (.098 if not backpack else .063)
    for s in ([1] if backpack else [-1,1]):
        yy=s*d*(.24 if backpack else .28)
        path=[(spread*cos(j*pi/24),yy+.008*sin(j*pi/24),h+rise*sin(j*pi/24)) for j in range(25)]
        strap('상단 손잡이',path,.023 if not backpack else .017,seam)
        for side in [-1,1]:
            xx=side*spread
            path=[(xx,yy,h+.006),(xx*1.05,s*d*.32,h-.006),(xx*1.16,s*d*.45,h*.88),(xx*1.20,s*d*.49,h*.79)]
            strap('손잡이 보강 탭',path,.028,seam)
    frame=Matrix.Identity(4)

for args in [('백팩',-.84,1.515,'526043',-5,1),('더플',-.18,1.515,'50583d',5,2),
             ('더플',-.83,.845,'73838d',-5,3),('백팩',-.182,.845,'748490',5,4),
             ('토트',-.83,.165,'242b40',-4,5),('더플',-.18,.165,'252d43',4,6)]:
    softbag(*args)

# A periodic warp/weft normal tile gives the nylon a close-range weave.
def fabric_normal():
    n=64
    y,x=np.mgrid[0:n,0:n]
    warp=np.sin(2*pi*x/8);weft=np.sin(2*pi*y/8)
    over=np.sin(pi*(x+2)/8)*np.sin(pi*(y+2)/8)
    height=.4*((1+over)*warp+(1-over)*weft)
    dx=(np.roll(height,-1,1)-np.roll(height,1,1))*.5
    dy=(np.roll(height,-1,0)-np.roll(height,1,0))*.5
    pixels=np.ones((n,n,4),dtype=np.float32)
    length=np.sqrt(1+dx**2+dy**2)
    pixels[:,:,0]=.5-dx/length*.5;pixels[:,:,1]=.5-dy/length*.5;pixels[:,:,2]=.5+.5/length
    img=bpy.data.images.new('나일론 직조',width=n,height=n,alpha=False)
    img.colorspace_settings.name='Non-Color';img.pixels.foreach_set(pixels.ravel());img.update()
    with tempfile.TemporaryDirectory() as td:
        img.filepath_raw=str(Path(td)/'weave.png');img.file_format='PNG';img.save()
        img=bpy.data.images.load(img.filepath_raw);img.colorspace_settings.name='Non-Color'
        img.pack();img.filepath='//weave.png'
    nt=cloth.node_tree;tex=nt.nodes.new('ShaderNodeTexImage');tex.image=img
    normal=nt.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.46
    nt.links.new(tex.outputs['Color'],normal.inputs['Color'])
    nt.links.new(normal.outputs['Normal'],nt.nodes.get('Principled BSDF').inputs['Normal'])
fabric_normal()

# Preserve modifiers and independently editable parts before joining by finish.
print('EDITABLE_MESHES',len(collection.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(out/'gallery.blend'),compress=True)
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active=collection.objects[0]
bpy.ops.object.convert(target='MESH')
for m in groups:
    pieces=[o for o in collection.objects if o.data.materials[0]==m]
    bpy.ops.object.select_all(action='DESELECT')
    for o in pieces:o.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0]
    if len(pieces)>1:bpy.ops.object.join()
    bpy.context.object.name=m.name
bpy.ops.export_scene.gltf(filepath=str(out/'gallery.glb'),export_yup=True,export_animations=False)
