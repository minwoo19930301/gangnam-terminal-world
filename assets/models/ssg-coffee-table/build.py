"""Molteni&C Gangnam lounge. Blender metres, +Y toward the display wall."""
from pathlib import Path
from math import pi, sin, cos, radians, exp
import bpy
import numpy as np
import random, struct, tempfile, zlib

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_9F_Molteni')
scene.collection.children.link(collection)
rng = random.Random(912)

def linear(v):
    return ((v + .055) / 1.055)**2.4 if v > .04045 else v / 12.92

def finish(name, hexcode, batch='MolteniGallery', rough=.65, metal=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    color = tuple(linear(int(hexcode[i:i+2],16)/255) for i in (0,2,4)) + (1,)
    m.diffuse_color = color
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = color
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    m['batch'] = batch
    return m

def patterned(name, batch, rgb, variation, scale, rough):
    """Pack a small seamless, authored sRGB tile for native and glTF materials."""
    m = finish(name, 'ffffff',batch,rough)
    pixels = np.uint8(np.clip(np.array(rgb) + variation[:,:,None],0,255))
    h,w = pixels.shape[:2]
    def chunk(tag, payload):
        return struct.pack('>I',len(payload))+tag+payload+struct.pack('>I',zlib.crc32(tag+payload))
    png = (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR',struct.pack('>2I5B',w,h,8,2,0,0,0)) +
           chunk(b'IDAT',zlib.compress(b''.join(b'\x00'+r.tobytes() for r in pixels),9))+chunk(b'IEND',b''))
    with tempfile.TemporaryDirectory() as folder:
        file = Path(folder)/(batch+'.png')
        file.write_bytes(png)
        img = bpy.data.images.load(str(file))
        img.pack()
        img.filepath = '//'+file.name
    tex = m.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image = img
    m.node_tree.links.new(tex.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    m['scale_m'] = scale
    return m

v,u = np.mgrid[:192,:192] * (2*pi/192)
noise = np.random.default_rng(62).normal(0,1,u.shape)
weave = 5*np.cos(32*u+.48*np.sin(24*v)) + 6*np.sin(24*v)*np.cos(16*u)+3*noise
cloth = patterned('에밀 · 크림 직조','MolteniEmile',(218,207,190),weave,.23,.91)
drift = .60*np.sin(u-2*v)+.38*np.cos(3*u+v)+.12*np.cos(7*v-u)+.044*np.sin(15*u-11*v)
marbling = np.sin(u+v+drift)
branch = np.sin(u+v+drift+.17*np.cos(4*u+v)+.06*np.sin(7*v))
veins = (20+8*np.cos(2*v))*np.exp(-(marbling/.042)**2) + 12*np.exp(-(branch/.026)**2)
stone = patterned('메이리스 · 백색 무늬석','MolteniMaylis',(236,231,222),
                  -veins-9*np.exp(-(marbling/.21)**2)+2*np.cos(3*u-v)+1.6*noise,1.7,.28)
cloud = np.sin(u+1.8*np.sin(2*v)) + .52*np.sin(4*u-3*v+np.cos(5*v))+.34*np.cos(7*u+3*v)
rug = patterned('회갈색 파일 러그','MolteniRug',(157,146,140),cloud*6+7*np.sin(40*u)*np.cos(24*v)+6*noise,1.43,.98)
ivory = finish('석회색 전시 벽','ded9cf')
shelf = finish('샴페인색 선반','c1ae96')
oak = finish('오일 마감 참나무','99613e')
leather = finish('안장 가죽','c49468')
shadow = finish('매입 받침','463933')
green = finish('숲색 래커','375b50',rough=.29)
dark = finish('흑유','403a34')
aluminium = finish('광택 알루미늄','c5c9c7','MolteniMetal',.25,.58)
seam = finish('봉제선','baab96')
paper = [finish('표지 '+str(i),c) for i,c in enumerate(['baa585','ebddc4','b8aaa3','8b7159','4e5954','b27661'])]

def mesh(name, verts, faces, mat, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    data.update()
    o = bpy.data.objects.new(name,data)
    collection.objects.link(o)
    data.materials.append(mat)
    for p in data.polygons: p.use_smooth = smooth
    return o

def bevel(o,r,segments=3):
    mod=o.modifiers.new('모서리 가공','BEVEL')
    mod.width=r
    mod.segments=segments
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.modifier_apply(modifier=mod.name)
    mod=o.modifiers.new('면 법선','WEIGHTED_NORMAL')
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def prism(name,xy,z,h,mat,r=0):
    n=len(xy)
    verts=[(x,y,level) for level in (z,z+h) for x,y in xy]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    o=mesh(name,verts,faces,mat)
    return bevel(o,r) if r else o

def box(name,x,y,z,w,d,h,mat,r=0,angle=0):
    corners=[(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2)]
    return prism(name,[(x+a*cos(angle)-b*sin(angle),y+a*sin(angle)+b*cos(angle)) for a,b in corners],z,h,mat,r)

def lathe(name,x,y,profile,mat,n=32):
    verts=[(x+r*cos(2*pi*i/n),y+r*sin(2*pi*i/n),z) for r,z in profile for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i)
           for j in range(len(profile)-1) for i in range(n)]
    faces += [tuple(reversed(range(n))),tuple(range((len(profile)-1)*n,len(verts)))]
    return mesh(name,verts,faces,mat,True)

def rounded(w,d,r):
    result=[]
    for cx,cy,start in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)]:
        for i in range(7):
            a=radians(start+90*i/6)
            result.append((cx+r*cos(a),cy+r*sin(a)))
        # Sample the flat run too, so the bent front and rear faces curve continuously.
        ex,ey=result[-1]
        nx,ny=[(-w/2+r,d/2),(-w/2,-d/2+r),(w/2-r,-d/2),(w/2,d/2-r)][start//90]
        for i in range(1,7):
            result.append((ex+(nx-ex)*i/7,ey+(ny-ey)*i/7))
    return result

def pad(name,x,y,z,w,d,h,angle=0,bend=0,lean=0,mat=cloth):
    # An upholstered envelope with a recessed underside and crowned shoulder.
    rings=[(0,.79),(.04,.90),(.12,.975),(.28,1),(.64,1),(.83,.986),(.95,.94),(1,.78),(1.008,.47)]
    verts=[]
    for t,s in rings:
        for a,b in rounded(w,d,min(.23,d*.43,w*.23)):
            a*=s; b=b*s + bend*(2*a/w)**2 + lean*t
            verts.append((x+a*cos(angle)-b*sin(angle),y+a*sin(angle)+b*cos(angle),z+h*t))
    n=len(verts)//len(rings)
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i)
           for j in range(len(rings)-1) for i in range(n)]
    faces += [tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))]
    return mesh(name,verts,faces,mat,True)

def piping(name,points,mat,r=.0035):
    curve=bpy.data.curves.new(name,'CURVE')
    curve.dimensions='3D'; curve.resolution_u=1; curve.bevel_depth=r; curve.bevel_resolution=1
    spline=curve.splines.new('POLY'); spline.points.add(len(points)-1)
    for p,co in zip(spline.points,points): p.co=(*co,1)
    spline.use_cyclic_u=True
    o=bpy.data.objects.new(name,curve);collection.objects.link(o);curve.materials.append(mat)
    bpy.context.view_layer.objects.active=o
    o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)

box('러그 · 짙은 단면',0,-.04,.026,5.12,3.05,.017,shadow,.007)
box('러그 · 파일',0,-.04,.041,5.11,3.04,.013,rug,.005)
# The three Emile elements sweep forward at the left end of the showroom photo.
for i,(x,y,w,a,bend) in enumerate([(-1.37,.31,1.46,.31,-.055),(.03,.55,1.39,.025,-.035),(1.19,.56,.94,-.06,-.02)]):
    def loc(dx,dy):
        return x+dx*cos(a)-dy*sin(a), y+dx*sin(a)+dy*cos(a)
    box('에밀 · 들어간 하부',x,y,.068,w-.14,.79,.094,shadow,.032,a)
    pad('에밀 · 좌판 '+str(i+1),x,y,.144,w,1.04,.34,a,bend)
    bx,by=loc(0,.355)
    pad('에밀 · 등받이 '+str(i+1),bx,by,.44,w-.012,.345,.37,a,bend,.055)
    outline=[]
    for dx,dy in rounded(w*.981,1.04*.981,.215):
        xx,yy=loc(dx,dy+bend*(2*dx/w)**2)
        outline.append((xx,yy,.194))
    piping('에밀 · 좌판 둘레 봉제',outline,seam)
pad('에밀 · 오른팔',1.60,.48,.44,.25,.74,.345,-.06,0,.018)
for i,(x,y,a) in enumerate([(.81,.66,-.11),(1.24,.66,.07)]):
    pad('에밀 · 사각 쿠션 '+str(i+1),x,y,.475,.42,.175,.415,a,0,.105)

# Rounded asymmetric six-sided plan and polished legs land just inside the edge.
def maylis(name,x,y,w,d,h,angle,mat):
    corners=[(-.53,-.17),(-.32,-.50),(.30,-.47),(.54,-.13),(.41,.39),(-.19,.52),(-.48,.32)]
    # A short quadratic arc at each change of direction retains the faceted outline.
    pts=[]
    for i,c in enumerate(corners):
        p=corners[i-1];q=corners[(i+1)%len(corners)]
        l=[.75*c[j]+.25*p[j] for j in (0,1)];r=[.75*c[j]+.25*q[j] for j in (0,1)]
        for k in range(6):
            t=k/5
            pts.append(tuple((1-t)**2*l[j]+2*t*(1-t)*c[j]+t*t*r[j] for j in (0,1)))
    def place(a,b):
        a*=w;b*=d
        return x+a*cos(angle)-b*sin(angle),y+a*sin(angle)+b*cos(angle)
    prism('메이리스 · '+name,[place(*p) for p in pts],h-.033,.033,mat,.009)
    for a,b in [(-.40,-.12),(.32,-.30),(.22,.32)]:
        px,py=place(a,b)
        lathe('메이리스 · 미끄럼 방지 글라이드',px,py,[(.028,.055),(.031,.067)],shadow)
        lathe('메이리스 · 다리와 상판 연결부',px,py,[(.030,.067),(.037,.075),(.038,h-.055),(.049,h-.050),(.049,h-.033)],aluminium)
maylis('백색 석재 상판',.04,-.52,1.35,.90,.386,.11,stone)
maylis('녹색 래커 상판',-.78,-.92,.62,.52,.432,-.27,green)
lathe('녹색 도자기 볼',.12,-.52,[(.10,.387),(.14,.392),(.152,.449),(.143,.454),(.13,.414),(.088,.408)],green)
lathe('호박색 잔',-.19,-.39,[(.039,.387),(.043,.478),(.036,.478),(.034,.398)],oak)

# Dark nesting end table at the outside of the curved chaise.
for px,py,rad,h in [(-2.25,-.56,.176,.48),(-2.38,-.37,.142,.53)]:
    lathe('보조 탁자 · 짙은 목재',px,py,[(rad*.88,.054),(rad,.068),(rad,h-.015),(rad*.96,h)],shadow)

# Two saddle leather seats at the right of the photographed setting.
for i,cy in enumerate([-.82,.06]):
    cx=1.97; angle=-1.36
    def chairxy(dx,dy):
        return cx+dx*cos(angle)-dy*sin(angle),cy+dx*sin(angle)+dy*cos(angle)
    for dx in [-.215,.215]:
        for dy in [-.20,.20]:
            box('의자 · 목재 다리',*chairxy(dx,dy),.054,.069,.088,.405,oak,.009,angle)
        box('의자 · 가로 장부',*chairxy(dx,0),.402,.075,.50,.053,oak,.008,angle)
    pad('의자 · 가죽 좌판',cx,cy,.443,.50,.485,.044,angle,mat=leather)
    # Bent leather sling; fixings appear on the reverse and both stiles.
    coords=[]; faces=[]
    for k in range(7):
        t=k/6
        for j in range(13):
            s=(j-6)/6
            coords.append((*chairxy(.247*s,.183+.10*t+.052*(1-s*s)),.468+.31*t-.024*(1-s*s)))
    for k in range(6):
        for j in range(12):
            a=k*13+j;faces.append((a,a+1,a+14,a+13))
    sling=mesh('의자 · 휘어진 가죽 등판',coords,faces,leather,True)
    solid=sling.modifiers.new('가죽 두께','SOLIDIFY');solid.thickness=.011
    bpy.context.view_layer.objects.active=sling;bpy.ops.object.modifier_apply(modifier=solid.name)
    for dx in [-.215,.215]:
        box('의자 · 등판 결합목',*chairxy(dx,.217),.43,.043,.045,.33,oak,.007,angle)
        px,py=chairxy(dx,.212)
        lathe('의자 · 결합핀',px,py,[(.009,.758),(.009,.767)],aluminium,12)

# Pale open shelving, flat books and vessels visible behind the sofa.
box('전시 벽',0,1.86,.02,5.58,.11,2.78,ivory,.012)
for x in [-2.70,2.70]:
    box('책장 · 측판',x,1.71,.06,.075,.31,2.67,ivory,.008)
for h in [.25,.72,1.19,1.66,2.13,2.59]:
    box('책장 · 선반',0,1.64,h,5.35,.39,.028,shelf,.006)
for row,h in enumerate([.748,1.218,1.688,2.158]):
    for idx,x in enumerate([-2.05,-1.16,-.22,.84,1.82]):
        n=rng.randint(3,6)
        if (idx+row)%3==0:
            for k in range(n):
                box('도서 · 눕힌 표지',x+.012*cos(k),1.59,h+k*.037,.34-.012*k,.18,.036,paper[(idx+k)%6],.003,.025*sin(k))
        elif (idx+row)%3==1:
            for k in range(n):
                box('도서 · 세운 등',x+k*.053,1.61,h,.047,.155,.17+rng.random()*.095,paper[(idx+k//2)%6],.003)
        else:
            lathe('무광 화기',x,1.60,[(.052,h),(.095,h+.045),(.08,h+.135),(.039,h+.18),(.042,h+.195),(.033,h+.195),(.031,h+.16)],dark if idx%2 else ivory)
# Exact brand text on the right-hand end panel.
font=bpy.data.curves.new('브랜드 글자','FONT');font.body='Molteni&C';font.size=.192;font.extrude=.001
sign=bpy.data.objects.new('몰테니 · 브랜드 표기',font);collection.objects.link(sign)
sign.location=(1.37,1.795,2.435);sign.rotation_euler.x=pi/2;font.materials.append(dark)
bpy.context.view_layer.objects.active=sign;sign.select_set(True);bpy.ops.object.convert(target='MESH');sign.select_set(False)

# Object-space planar UVs with dominant-face projection keep fabric density consistent.
for o in collection.objects:
    m=o.data.materials[0]
    if 'scale_m' not in m: continue
    uv=o.data.uv_layers.new(name='Surface')
    for face in o.data.polygons:
        axis=max(range(3),key=lambda i:abs(face.normal[i]))
        axes=((1,2),(0,2),(0,1))[axis]
        for li in face.loop_indices:
            co=o.data.vertices[o.data.loops[li].vertex_index].co
            uv.data[li].uv=(co[axes[0]]/m['scale_m'],co[axes[1]]/m['scale_m'])

print('Native editable meshes:',len(collection.objects),flush=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'lounge.blend'),compress=True)
exec(compile((OUT/'export.py').read_text(),str(OUT/'export.py'),'exec'))
