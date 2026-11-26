"""Author the dining vignette in metres. Blender +Y is the rear of the display."""
import bpy
import math
import random
import runpy
import struct
import tempfile
import zlib
from pathlib import Path
import numpy as np
from mathutils import Vector, Matrix

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_9F_TimeStyle')
scene.collection.children.link(collection)
pi = math.pi
sin, cos = math.sin, math.cos
basis = Matrix.Identity(4)
rng = random.Random(61)


def material(name, rgb, roughness, batch, image=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    shader = m.node_tree.nodes.get('Principled BSDF')
    linear = tuple(((c/255+.055)/1.055)**2.4 for c in rgb)+(1,)
    shader.inputs['Base Color'].default_value = linear
    m.diffuse_color = linear
    shader.inputs['Roughness'].default_value = roughness
    if image:
        tex = m.node_tree.nodes.new('ShaderNodeTexImage')
        tex.image = image
        m.node_tree.links.new(tex.outputs['Color'], shader.inputs['Base Color'])
    m['batch'] = batch
    return m


def packed_image(name, pixels):
    """Write RGB PNG bytes, then embed them in the editable library."""
    def chunk(tag, data):
        return struct.pack('>I', len(data))+tag+data+struct.pack('>I', zlib.crc32(tag+data))
    h, w, _ = pixels.shape
    raw = b''.join(b'\0'+row.tobytes() for row in pixels.astype('uint8'))
    png = (b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR', struct.pack('>IIBBBBB',w,h,8,2,0,0,0))
           +chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp)/(name+'.png')
        path.write_bytes(png)
        im = bpy.data.images.load(str(path))
        im.pack()
        im.filepath = '//'+path.name
        return im


# Seamless hand-generated earlywood/latewood field with long pores and board variation.
yy, xx = np.mgrid[0:256,0:512]
u, v = xx/512, yy/256
wave = 22*v + .48*np.sin(2*pi*u)+.27*np.sin(2*pi*(2*u+3*v))+.12*np.sin(2*pi*5*v)
late = (.5+.5*np.cos(2*pi*wave))**6
pore = (.5+.5*np.sin(2*pi*(79*v+.44*np.sin(2*pi*u)+.18*np.cos(4*pi*u))))**12
tone = 6*np.sin(2*pi*(4*v+.19*np.cos(2*pi*u)))-13*late-8*pore+2*np.sin(2*pi*(103*v+u))
woodtex = packed_image('Oak',np.array([203,170,129])+tone[:,:,None])
yy, xx = np.mgrid[0:96,0:96]
clothtex = packed_image('Linen',np.array([194,177,151])+(4*np.cos(xx*pi/2)+5*np.cos(yy*pi/3)+
                        4*np.sin(xx*pi/4+yy*pi/6))[:,:,None])
oak = material('참나무 결',(193,152,103),.49,'TimeStyleOak',woodtex)
linen = material('직조 좌판',(194,177,151),.85,'TimeStyleLinen',clothtex)
def solid(name,rgb,rough=.55):
    return material(name,rgb,rough,'TimeStyleObjects')
cedar=solid('삼나무 살',(128,84,49))
end=solid('목심 단면',(150,114,76))
dark=solid('먹빛 도기',(58,54,49))
ivory=solid('회백 유약',(219,214,191))
ochre=solid('갈색 유약',(138,87,53))
charcoal=solid('검은 철물',(62,55,46))
ink=solid('짙은 쪽빛',(54,67,77))
import sys
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
import washi
paper=material('미노 화지',(239,220,184),.88,'TimeStyleSpacecraft',
               packed_image('MinoWashi',washi.paper_field()))
bs=paper.node_tree.nodes.get('Principled BSDF')
emission=bs.inputs.get('Emission Color') or bs.inputs.get('Emission')
tex=next(n for n in paper.node_tree.nodes if n.type=='TEX_IMAGE')
paper.node_tree.links.new(tex.outputs['Color'],emission)
bs.inputs['Emission Strength'].default_value=.33


def mesh(name, verts, faces, mat, smooth=False, grain='auto'):
    me=bpy.data.meshes.new(name)
    me.from_pydata(verts,[],faces)
    me.update()
    ob=bpy.data.objects.new(name,me)
    collection.objects.link(ob)
    ob.matrix_world=basis.copy()
    me.materials.append(mat)
    if smooth:
        for f in me.polygons:f.use_smooth=True
    if mat in (linen,oak):
        uv=me.uv_layers.new(name='결 방향')
        shift=rng.random()
        for f in me.polygons:
            n=f.normal
            for li in f.loop_indices:
                x,y,z=verts[me.loops[li].vertex_index]
                if grain=='up':a,b=z,x if abs(n.y)>abs(n.x) else y
                elif abs(n.z)>.55:a,b=x,y
                elif abs(n.y)>abs(n.x):a,b=x,z
                else:a,b=y,z
                scale=1.3 if mat==oak else .30
                uv.data[li].uv=(a/scale+shift,b/(scale*.48)+shift)
    return ob


def box(name,x,y,z,w,d,h,mat):
    v=[(x+sx*w/2,y+sy*d/2,z+sz*h/2) for sz in (-1,1) for sy in (-1,1) for sx in (-1,1)]
    return mesh(name,v,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],mat)


def skin(name,rings,mat,smooth=True,grain='auto',cap=True):
    n=len(rings[0]); k=len(rings)
    f=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(k-1) for i in range(n)]
    if cap:f.extend([tuple(reversed(range(n))),tuple(range((k-1)*n,k*n))])
    return mesh(name,[p for row in rings for p in row],f,mat,smooth,grain)


def turned(name,x,y,z,profile,mat,n=36,aspect=1,power=1):
    rings=[]
    for r,h in profile:
        row=[]
        for i in range(n):
            a=2*pi*i/n; c,s=cos(a),sin(a)
            row.append((x+r*math.copysign(abs(c)**power,c),
                        y+r*aspect*math.copysign(abs(s)**power,s),z+h))
        rings.append(row)
    return skin(name,rings,mat)


def rod(name,start,finish,r1,r2,mat,n=12):
    a,b=Vector(start),Vector(finish)
    tangent=(b-a).normalized()
    normal=tangent.cross(Vector((0,1,0)) if abs(tangent.y)<.9 else Vector((1,0,0))).normalized()
    side=tangent.cross(normal)
    return skin(name,[[tuple(p+r*(cos(2*pi*i/n)*normal+sin(2*pi*i/n)*side)) for i in range(n)]
                      for p,r in [(a,r1),(b,r2)]],mat,grain='up' if abs(tangent.z)>.55 else 'auto')


def tube(name,points,radii,mat,n=8):
    pts=list(map(Vector,points));rings=[]
    axis=Vector((0,1,0)) if abs((pts[-1]-pts[0]).normalized().y)<.8 else Vector((1,0,0))
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        normal=tangent.cross(axis).normalized()
        side=tangent.cross(normal)
        rings.append([tuple(p+radii[i]*(cos(2*pi*j/n)*normal+sin(2*pi*j/n)*side)) for j in range(n)])
    return skin(name,rings,mat)


# Oval top, relieved underside, aprons and four tapered legs.
turned('타원 식탁 · 면을 죽인 상판',0,0,0,[(1.25,.714),(1.31,.729),(1.32,.75),(1.314,.761)],oak,80,.435,.86)
for x in [-.98,.98]:
    for y in [-.31,.31]:
        rod('식탁 다리',(x*1.025,y*1.04,.022),(x,y,.731),.036,.047,oak,18)
    box('짧은 장부 apron',x,0,.687,.053,.63,.078,oak)
for y in [-.31,.31]:box('긴 장부',0,y,.687,1.96,.055,.078,oak)


def chair(x,y,rot):
    global basis
    basis=Matrix.Translation((x,y,0))@Matrix.Rotation(rot,4,'Z')
    for a in [-1,1]:
        for b in [-1,1]:
            top=(a*.205,b*.187,.432)
            rod('의자 · 가늘어지는 다리',(a*.227,b*.219,.016),top,.014,.0215,oak)
            if b==-1:rod('등받이 기둥',top,(a*.212,-.237,.817),.0215,.019,oak)
        rod('팔걸이 앞 기둥',(a*.205,.187,.43),(a*.205,.162,.612),.016,.014,oak)
        arm=[]
        for j in range(12):
            t=j/11
            ay=-.207+.398*t; az=.606+.025*math.sin(pi*t)-.012*t
            ax=a*(.205+.020*math.sin(pi*t))
            width=.022+.003*math.sin(pi*t)-.006*t**3
            arm.append([(ax+width*cos(2*pi*k/12),ay,az-.013*sin(2*pi*k/12)) for k in range(12)])
        skin('곡목 팔걸이',arm,oak)
        rod('의자 가로대',(a*.212,-.201,.248),(a*.212,.20,.248),.012,.012,oak)
    for b in [-1,1]:rod('촉 결합',( -.215,b*.203,.225),(.215,b*.203,.225),.012,.012,oak)
    turned('원목 좌판 테두리',0,0,0,[(.226,.397),(.237,.414),(.235,.437)],oak,32,.95,.31)
    turned('린넨 좌판',0,0,0,[(.226,.43),(.231,.441),(.225,.459),(.209,.463)],linen,40,.95,.35)
    # Curved back sweeps in plan; upper and lower edges follow different arcs.
    rings=[]
    for i in range(19):
        t=(i-9)/9
        cx=.225*t; cy=-.231+.061*t*t
        lo=.687+.023*t*t; hi=.82+.012*t*t
        rings.append([(cx,cy-.015,lo+.006),(cx,cy-.015,hi-.009),(cx,cy-.01,hi),
                      (cx,cy+.012,hi),(cx,cy+.016,hi-.007),(cx,cy+.016,lo+.004),(cx,cy+.01,lo)])
    # Section ordered around local X.
    skin('의자 · 휜 참나무 등판',rings,oak)
    for a in [-1,1]:
        rod('등판 목심',(a*.205,-.2,.752),(a*.205,-.195,.752),.005,.005,end)
    basis=Matrix.Identity(4)

for x in [-.62,.62]:
    chair(x,-.69,0)
    chair(x,.69,pi)


# Spacecraft: sixteen bent ribs, flat paper panels spanning each pair of ribs.
profile=[(.12,0),(.14,.006),(.161,.041),(.196,.072),(.254,.094),(.36,.101),
         (.408,.106),(.432,.125),(.439,.147),(.432,.20),(.421,.253),(.412,.275),
         (.389,.289),(.309,.299),(.255,.316),(.208,.349),(.172,.396),(.154,.438),(.143,.449)]
z0=1.78
washi.shade(profile,z0,paper,cedar,skin)
rod('조명 선', (0,0,2.221),(0,0,3.81),.0045,.0045,charcoal)
turned('천장 받침',0,0,3.79,[(.05,0),(.05,.045)],charcoal)

# Tea service on a rimmed wooden tray, matching the dark pot in the dining photo.
box('차반 바닥',-.22,.035,.773,.58,.32,.017,oak)
for k in [-1,1]:
    box('차반 · 손잡이',-.22+k*.28,.035,.788,.017,.32,.029,oak)
    box('차반 · 테두리',-.22,.035+k*.153,.784,.55,.012,.022,oak)
tx,ty=-.145,.04
turned('옆손잡이 다관',tx,ty,.784,[(.044,0),(.071,.017),(.082,.057),(.079,.079),(.057,.093)],dark)
turned('다관 뚜껑',tx,ty,.875,[(.059,0),(.06,.005),(.046,.015),(.012,.019),(.012,.027),(.008,.03)],dark)
tube('다관 주구',[(tx+.057,ty,.834),(tx+.084,ty,.849),(tx+.106,ty,.873),(tx+.12,ty,.884)],[.028,.022,.014,.015],dark)
loop=[(tx-.076-.046*cos(t*pi/16),ty,.848+.033*sin(t*pi/16)) for t in range(-12,13)]
tube('다관 고리 손잡이',loop,[.007]*len(loop),dark)
for i in range(2):
    turned('차탁',-.403,-.04,.785+i*.006,[(.034,0),(.057,.003),(.062,.009),(.054,.010),(.031,.005)],dark,30)
for i in range(2):
    turned('찻잔',-.38,.01+i*.103,.784,[(.022,0),(.028,.007),(.039,.044),(.041,.049),(.036,.05),(.03,.02),(.015,.015)],ivory,24)

# Two turned seats with splayed tripod supports, as seen beyond the front table.
for sx,sy in [(1.35,1.30),(1.78,1.63)]:
    turned('세발 스툴 · 접시형 좌판',sx,sy,.40,[(.135,0),(.163,.017),(.167,.035),(.155,.042),(.102,.034),(.048,.029)],oak,42)
    for i in range(3):
        a=2*pi*i/3+.25
        rod('스툴 · 벌어진 다리',(sx+.165*cos(a),sy+.165*sin(a),.014),
            (sx+.098*cos(a),sy+.098*sin(a),.417),.013,.021,oak)

# Two hinged kumiko leaves. Each small equilateral triangle is divided at its
# centroid; the three half-diamonds meeting on the shared edges form hemp leaves.
def screen(x,y,rot):
    global basis
    basis=Matrix.Translation((x,y,0))@Matrix.Rotation(rot,4,'Z')
    width,height=.95,1.43
    for side in [-1,1]:box('병풍 세로틀',side*width/2,0,.77,.036,.049,height+.02,cedar)
    for h in [.081,1.463]:box('병풍 가로틀',0,0,h,width,.049,.038,cedar)
    verts=[];faces=[]
    def slat(a,b,w):
        p,q=Vector(a),Vector(b)
        offset=(q-p).normalized(); offset=Vector((-offset.y,offset.x))*w/2
        base=len(verts)
        for depth in [-.008,.008]:
            for t in [p-offset,q-offset,q+offset,p+offset]:verts.append((t.x,depth,t.y))
        for f in [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]:
            faces.append(tuple(base+j for j in f))
    # Clip each lath at the inside of the frame.
    def clipped(a,b,w):
        lo,hi=0,1
        for start,delta,mn,mx in [(a[0],b[0]-a[0],-.457,.457),(a[1],b[1]-a[1],.098,1.445)]:
            if abs(delta)<1.e-8:
                if start<mn or start>mx:return
            else:
                t0,t1=sorted(((mn-start)/delta,(mx-start)/delta))
                lo,hi=max(lo,t0),min(hi,t1)
        if hi-lo>.005:
            a,b=Vector(a),Vector(b);slat(a.lerp(b,lo),a.lerp(b,hi),w)
    length=.167;rise=length*math.sqrt(3)/2
    for row in range(10):
        for col in range(-1,7):
            lx=-.46+(col+(row%2)*.5)*length; lz=.095+row*rise
            a=(lx,lz);b=(lx+length,lz);c=(lx+length/2,lz+rise);d=(lx+length*1.5,lz+rise)
            for p,q in [(a,b),(a,c),(b,c)]:clipped(p,q,.008)
            for triangle in [(a,b,c),(b,c,d)]:
                center=tuple(sum(p[i] for p in triangle)/3 for i in range(2))
                for p in triangle:clipped(p,center,.0045)
    mesh('병풍 · 삼각 짜맞춤 살',verts,faces,cedar)
    basis=Matrix.Identity(4)
screen(-.86,1.55,-.19)
screen(.064,1.55,.19)

# Open-backed solid-wood cabinet with independent vessels and turned woodware.
cy=2.85
for i in range(6):
    box('장식장 세로판',-1.58+i*.632,cy,1.09,.035,.34,2.10,oak)
for level in [0,.43,.89,1.32,1.76,2.10]:
    box('장식장 선반',0,cy,level+.056,3.2,.34,.031,oak)
for col in range(5):
    for row,h in enumerate([.503,.963,1.393,1.833]):
        x=-1.264+col*.632; k=(row+col*2)%5
        if k==0:
            for j in range(3):
                turned('겹친 목기',x,cy,h+j*.017,[(.045,0),(.085,.01),(.13,.047),(.132,.055),(.121,.056),(.091,.034),(.045,.021)],oak)
        elif k in [1,2,3]:
            tall=.31 if k==2 else .20
            pts=[(.047,0),(.056,.02),(.087,.20),(.105,.43),(.101,.62),(.084,.71),(.036,.86),(.032,.97),(.039,1),(.027,1),(.025,.90)]
            turned('목이 좁은 화병',x,cy,h,[(r*(.73 if k==2 else 1),z*tall) for r,z in pts],[ivory,ochre,dark][k-1])
            if k==2:
                turned('작은 백자 병',x+.145,cy-.05,h,[(.036,0),(.059,.043),(.054,.081),(.024,.116),(.025,.145),(.019,.145)],ivory)
        else:
            for j in range(4):
                box('제본 표본',x-.10+j*.048,cy,h+.103,.041,.18,.206+j*.007,[ink,ochre,ivory,dark][j])
# Baked contact tones on the warm mineral floor visible in the branch photograph.
# UV coordinates cover this island once, so shadows stay under the corresponding feet.
w,d=5.08,9.93
gy,gx=np.mgrid[0:384,0:256]
px=(gx+.5)*w/256-w/2
py=d/2-(gy+.5)*d/384
def shadow(cx,cy,rx,ry,strength):
    return strength*np.exp(-((px-cx)/rx)**2-((py-cy)/ry)**2)
shade=shadow(.03,.06,1.32,.65,30)+shadow(0,2.89,1.65,.28,25)
for x in (-.62,.62):
    for y in (-.69,.69):
        shade+=shadow(x+.03,y+.06,.30,.26,17)
        for a in [-1,1]:
            for b in [-1,1]:shade+=shadow(x+a*.225,y+b*.219,.065,.078,23)
for x in (-.98,.98):
    for y in (-.31,.31):shade+=shadow(x,y,.082,.12,27)
for x,y in [(1.35,1.30),(1.78,1.63),(-.86,1.55),(.064,1.55)]:
    shade+=shadow(x,y,.38,.13,16)
fleck=np.random.default_rng(61).normal(0,1.3,px.shape)
mottle=1.9*np.sin(px*3+.7*np.cos(py*4))+1.5*np.cos(py*5+.6*np.sin(px*7))
joint=(np.minimum((px+2.54)%1.27,1.27-(px+2.54)%1.27)<.009)|(np.minimum((py+4.965)%1.24,1.24-(py+4.965)%1.24)<.010)
surface=packed_image('Stone',np.array([178,161,137])+(fleck+mottle-shade-5*joint)[:,:,None])
stone=material('온회색 바닥과 접지 음영',(178,161,137),.44,'TimeStyleStone',surface)
floor=mesh('다이닝 전시 바닥', [(-w/2,-d/2,.023),(w/2,-d/2,.023),(w/2,d/2,.023),(-w/2,d/2,.023)],[(0,1,2,3)],stone)
uv=floor.data.uv_layers.new(name='전시 바닥')
for loop,coord in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]):loop.uv=coord
scene['nativeBasis']='metres: +X right, +Y rear toward cabinet, +Z up'
print('EDITABLE_MESHES',len(collection.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'dining.blend'),compress=True)
runpy.run_path(str(OUT/'export.py'))
