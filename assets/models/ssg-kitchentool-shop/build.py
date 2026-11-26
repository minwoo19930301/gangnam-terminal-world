"""Editable Hasami porcelain and the Gangnam display cabinet. Metres, Z up."""
from pathlib import Path
from math import pi, sin, cos, radians, exp
from mathutils import Vector
import bpy
import numpy as np
import runpy

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_9F_KitchenTool')
scene.collection.children.link(collection)

def linear(rgb):
    return tuple(((int(rgb[i:i+2],16)/255+.055)/1.055)**2.4 for i in (0,2,4))

def material(name, rgb, group, rough, metal=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat['batch'] = group
    mat.diffuse_color = (*linear(rgb),1)
    p = mat.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = mat.diffuse_color
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    return mat

glazes = [material(name, rgb, 'Glaze',.21) for name,rgb in [
    ('다홍','BA1D17'),('쑥색','ADAF8E'),('물빛','729EB9'),('먹회색','58504B'),
    ('청록','388C90'),('겨자','E9BA1A'),('감청','212E57'),('분홍','E9B2A6'),
    ('밤색','844123'),('백자','E9E4CE')]]
cream = material('크림 도장','E8D6B7','Case',.44)
trim = material('샴페인 테두리','AF8761','Case',.32,.18)
shadow = material('음각 이음매','63442F','Case',.45)
foot = material('무유 굽','DDD0B5','Case',.72)
contact = material('접지 음영','BEAC90','Case',.75)
ink = material('명패 글자','352D26','Case',.55)
stone = material('입자 상판','F2E5CE','Stone',.46)
# A seamless, packed aggregate pattern, UV mapped in physical metres.
rng=np.random.default_rng(52)
grains=rng.normal(.90,.027,(192,192))
for _ in range(1100):
    u,v=rng.integers(0,191,2)
    grains[u:u+2,v:v+1]*=rng.uniform(.60,.90)
pixels=np.ones((192,192,4),dtype=np.float32)
pixels[:,:,:3]=np.clip(grains[:,:,None]*np.array([1,.946,.856]),0,1)
img=bpy.data.images.new('미세 골재',192,192)
img.pixels.foreach_set(pixels.ravel())
img.pack()
tex=stone.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=img
stone.node_tree.links.new(tex.outputs['Color'],stone.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

def mesh(name, verts, faces, mat, smooth=False):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    data.update()
    o=bpy.data.objects.new(name,data)
    collection.objects.link(o)
    data.materials.append(mat)
    for f in data.polygons: f.use_smooth=smooth
    return o

def slab(name,x,y,z,w,d,h,r,mat):
    outline=[]
    for cx,cy,a in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)]:
        for j in range(7):
            t=radians(a+90*j/6)
            outline.append((cx+r*cos(t),cy+r*sin(t)))
    n=len(outline)
    edge=min(.008,h*.19,r*.25)
    rings=[(edge,0),(0,edge),(0,h-edge),(edge,h)]
    vs=[(x+u*(1-2*e/w),y+v*(1-2*e/d),z+b) for e,b in rings for u,v in outline]
    faces=[tuple(reversed(range(n)))]
    faces.extend((k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i) for k in range(3) for i in range(n))
    faces.append(tuple(range(3*n,4*n)))
    o=mesh(name,vs,faces,mat)
    if mat==stone:
        uv=o.data.uv_layers.new(name='골재 축척')
        for f in o.data.polygons:
            for li in f.loop_indices:
                p=o.data.vertices[o.data.loops[li].vertex_index].co
                uv.data[li].uv=((p.x if abs(f.normal.x)<.7 else p.y)/.18,(p.y if abs(f.normal.z)>.7 else p.z)/.18)
    return o

def lathe(name,x,y,z,profile,mat,n=48,tilt=0,oval=1,cap=True):
    # Profile runs from the recessed underside, over the lip, into the well.
    verts=[]
    for r,h in profile:
        for j in range(n):
            a=2*pi*j/n
            verts.append((max(r,.00012)*cos(a)*oval,max(r,.00012)*sin(a),h))
    faces=[tuple(reversed(range(n)))] if cap else []
    for k in range(len(profile)-1):
        faces.extend((k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j) for j in range(n))
    if cap: faces.append(tuple(range((len(profile)-1)*n,len(profile)*n)))
    o=mesh(name,verts,faces,mat,True)
    o['segments']=n
    o['rings']=len(profile)
    o['caps']=cap
    o['radius']=max(r for r,h in profile)*oval
    o.location=(x,y,z)
    o.rotation_euler.x=radians(tilt)
    if mat in glazes:
        # Softbox reflections and pooling under the rim remain legible in flat mall lighting.
        attr=o.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
        base=mat.diffuse_color
        for k,(r,h) in enumerate(profile):
            for j in range(n):
                a=2*pi*j/n
                light=.82+.18*cos(a+2)+.08*sin(k*.63)
                gleam=(max(0,cos(a+1.05))**42+.55*max(0,cos(a-2.48))**32)*(.055+.035*cos(k*.72))
                if r>=.965*max(pair[0] for pair in profile):
                    gleam+=.045+.08*max(0,cos(a+1.1))
                attr.data[k*n+j].color=(*[min(1,c*light+gleam) for c in base[:3]],1)
    return o

def scaled(profile,r,h):
    return [(a*r,b*h) for a,b in profile]

plate_shape=[(.02,.23),(.58,.23),(.60,.03),(.67,.03),(.69,.22),(.88,.31),(.96,.49),(1,.91),(.995,1),(.972,.99),(.93,.64),(.84,.48),(.66,.43),(.02,.43)]
bowl_shape=[(.02,.10),(.55,.10),(.58,0),(.67,0),(.72,.10),(.77,.32),(.82,.35),(.86,.43),(.97,.82),(1,.94),(.99,1),(.945,.99),(.92,.84),(.79,.45),(.65,.27),(.48,.22),(.02,.22)]
def plate(x,y,z,r,mat,tilt=0,oval=1):
    return lathe('하사미 접시',x,y,z,scaled(plate_shape,r,.019),mat,tilt=tilt,oval=oval)
def bowl(x,y,z,r,mat):
    return lathe('블록 볼',x,y,z,scaled(bowl_shape,r,r*.58),mat)

def handle(x,y,z,mat,flip):
    # Broad, angular strap with a rounded rectangular section, fused at both ends.
    path=[(.038,.057),(.049,.058),(.066,.058),(.07,.055),(.07,.030),(.067,.026),(.049,.020),(.039,.020)]
    verts=[]
    for i,(a,b) in enumerate(path):
        direction=Vector(path[min(i+1,len(path)-1)])-Vector(path[max(0,i-1)])
        direction.normalize()
        for j in range(8):
            t=j*2*pi/8
            verts.append((x+flip*(a-direction.y*.0042*cos(t)),y+.008*sin(t),z+b+direction.x*.0042*cos(t)))
    faces=[(i*8+j,i*8+(j+1)%8,(i+1)*8+(j+1)%8,(i+1)*8+j) for i in range(len(path)-1) for j in range(8)]
    if flip<0:faces=[tuple(reversed(f)) for f in faces]
    mesh('블록 머그 도자 손잡이',verts,faces,mat,True)

def mug(x,y,z,mat,flip):
    profile=[(.02,.10),(.63,.10),(.65,0),(.74,0),(.78,.09),(.82,.29),(.96,.31),(.99,.37),(1,.94),(.99,1),(.92,1),(.90,.90),(.88,.44),(.75,.32),(.65,.20),(.02,.20)]
    lathe('블록 머그',x,y,z,scaled(profile,.0425,.065),mat)
    handle(x,y,z,mat,flip)

def canister(x,y,z,mat):
    profile=[(.01,.01),(.68,.01),(.91,0),(.95,.018),(.94,.045),(.78,.082),(.72,.13),(.75,.16),(.97,.22),(1,.24),(.98,.27),(.94,.28),(.94,.83),(1,.85),(1,.97),(.98,1),(.90,1),(.89,.30),(.72,.23),(.01,.23)]
    lathe('스낵 캐니스터 몸통',x,y,z,scaled(profile,.057,.189),mat)
    lid=[(.01,0),(.89,0),(1,.05),(1,.12),(.94,.18),(.32,.70),(.14,.76),(.12,.83),(.22,.93),(.20,1),(.01,1)]
    lathe('캐니스터 뚜껑과 꼭지',x,y,z+.189,scaled(lid,.059,.052),mat)

def label(name,body,x,y,z,size,mat,font=None):
    data=bpy.data.curves.new(name,'FONT')
    data.body=body
    data.align_x='CENTER'
    data.align_y='CENTER'
    data.space_line=.87
    data.size=size
    if font:data.font=font
    o=bpy.data.objects.new(name,data)
    collection.objects.link(o)
    o.location=(x,y,z)
    o.rotation_euler.x=pi/2
    data.materials.append(mat)
    bpy.context.view_layer.objects.active=o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.select_all(action='DESELECT')

# Rounded stone edge and separate recessed panels wrap the four faces.
slab('받침대',0,0,.012,1.92,.79,.10,.085,cream)
slab('하부 음영',0,0,.112,1.87,.755,.035,.07,shadow)
slab('모서리 기둥 일체 프레임',0,0,.147,1.96,.83,.685,.085,trim)
for side in [-1,1]:
    for x,w in [(-.644,.38),(0,.87),(.644,.38)]:
        slab('앞뒤 도장 패널',x,side*.413,.19,w,.019,.55,.008,cream)
    slab('짧은 면 패널',side*.977,0,.19,.020,.60,.55,.009,cream)
slab('상판 밑 홈',0,0,.77,2,.86,.043,.092,shadow)
slab('몰딩 아래 단',0,0,.811,2.035,.89,.041,.102,cream)
slab('몰딩 줄눈',0,0,.852,2.025,.88,.009,.10,trim)
slab('상판 둥근 입술',0,0,.861,2.05,.91,.054,.105,cream)
slab('매입 골재 상판',0,0,.914,2.012,.873,.008,.094,stone)
top=.922

# Tabletop follows the three-quarter and front-on opening photographs.
for i,(x,y,color) in enumerate([(-.66,-.10,0),(-.34,-.085,1),(-.17,-.306,2),(.13,-.30,3),(.02,-.08,4),(.54,-.11,8),(.80,-.19,8)]):
    oval=1.18 if i>4 else 1
    lathe('접시 밑 접지음영',x,y,top+.0003,[(.001,0),(.085*oval,0),(.092*oval,.0002),(.001,.0002)],contact,n=28)
    plate(x,y,top,.112,glazes[color],oval=oval)
    plate(x,y,top+.013,.090,glazes[color],oval=oval)
    if i<5:
        # Inverted samples in the branch photograph expose the unglazed foot ring.
        r=.069
        o=bowl(x,y,top+.024+r*.58,r,glazes[color])
        o.rotation_euler.x=pi
        lathe('노출된 굽 테두리',x,y,top+.024+r*.58,[(r*.575,0),(r*.58,.0016),(r*.66,.0016),(r*.67,0)],foot,n=40,cap=False)
    else:bowl(x+.015,y,top+.025,.060,glazes[8 if i==5 else 7])

for i,col in enumerate([8,4,9]):canister(-.73+i*.158,.245,top,glazes[col])
for x,c,ov in [(-.12,5,1.0),(.08,6,1.0),(.53,7,1.02),(.80,7,1.21)]:
    # The lower edge rests on the riser while the rear easel supports the rim.
    stand=.055 if x<.3 else .030
    slab('전시 깔판',x,.198,top,.238,.24,stand,.013,cream)
    plate(x,.266,top+stand+.105,.111,glazes[c],tilt=73,oval=ov)
    slab('접시 받침',x,.322,top+stand,.075,.035,.118,.008,trim)
    if x<.3:bowl(x,.12,top+stand,.058,glazes[c])
for x,c,f in [(.23,3,-1),(.39,8,1),(.59,7,1)]:mug(x,.033,top,glazes[c],f)

slab('상품 명패',-.77,-.32,top,.299,.072,.104,.016,trim)
slab('상품 명패 앞면',-.77,-.357,top+.005,.281,.006,.092,.002,cream)
label('사진 속 마루히로 명패','MARUHIRO\nHASAMI',-.77,-.361,top+.051,.040,ink)

# Rear brand column visible behind the featured island in the branch photographs.
slab('후면 진열대',0,1.03,.02,1.22,.41,.80,.055,cream)
slab('후면 진열대 상판',0,1.03,.82,1.27,.46,.044,.06,trim)
slab('브랜드 패널',0,1.12,.865,.69,.105,1.27,.027,trim)
slab('간판 음각',0,1.054,1.80,.68,.040,.217,.016,shadow)
slab('간판 앞면',0,1.030,1.81,.65,.014,.194,.006,trim)
# Shallow built-in cubby, as seen directly beneath the shop name.
slab('선반 안쪽',0,1.046,1.19,.58,.032,.33,.012,shadow)
for level in [1.18,1.355,1.50]:
    slab('견본 선반',0,1.002,level,.58,.13,.019,.009,cream)
for level in [1.20,1.375]:
    for i,c in enumerate([9,1,9,4,9]):
        mug((i-2)*.108,.988,level,glazes[c],1)
font_paths=[Path('/System/Library/Fonts/Supplemental/AppleGothic.ttf'),Path('/usr/share/fonts/truetype/nanum/NanumGothic.ttf')]
font=bpy.data.fonts.load(str(next(p for p in font_paths if p.exists())))
label('키친툴 한글 간판','키 친 툴',0,1.020,1.914,.105,cream,font)
for i,c in enumerate([5,6,4,9,8]):
    x=(i-2)*.205
    plate(x,1.048,.958,.095,glazes[c],tilt=76)
    mug(x,.91,.865,glazes[c],1)

scene['배치']='단위 m, +X 고객의 오른쪽, +Y 진열대 뒤, +Z 위'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'display.blend'),compress=True)
runpy.run_path(str(OUT/'export.py'))
