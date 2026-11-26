"""Editable Gangnam Berluti shoe wall and leather display. Units are metres."""
from pathlib import Path
from math import sin, cos, pi, radians, copysign
import bpy
import numpy as np
from mathutils import Vector, Matrix
import sys

out = Path(__file__).resolve().parent
sys.dont_write_bytecode=True;sys.path.insert(0,str(out))
import frontage
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
collection = bpy.data.collections.new('SSG_6F_Berluti')
bpy.context.scene.collection.children.link(collection)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[collection.name]
frame = Matrix.Identity(4)

def place(x, y, z, angle=0):
    return Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(angle),4,'Z')

def material(name, roughness, metallic=0):
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    nodes=mat.node_tree.nodes
    bs=nodes.get('Principled BSDF')
    bs.inputs['Roughness'].default_value=roughness
    bs.inputs['Metallic'].default_value=metallic
    tint=nodes.new('ShaderNodeVertexColor')
    tint.layer_name='Tint'
    mat.node_tree.links.new(tint.outputs[0],bs.inputs['Base Color'])
    return mat

leather=material('BerlutiVeneziaPatina',.32)
wood=material('BerlutiWalnut',.41)
trim=material('BerlutiGalleryFinish',.61)
metal=material('BerlutiPalladium',.24,.72)
materials=[leather,wood,trim,metal]

def packed_image(name, rgb):
    h,w,_=rgb.shape
    im=bpy.data.images.new(name,width=w,height=h,alpha=False)
    im.colorspace_settings.name='Non-Color'
    rgba=np.ones((h,w,4),dtype=np.float32)
    rgba[:,:,:3]=rgb
    im.pixels.foreach_set(rgba.ravel())
    im.pack()
    return im

# Periodic figured walnut veneer, mapped per board along its longest axis.
t,s=np.mgrid[0:128,0:128]*2*pi/128
rng=np.random.default_rng(40)
wave=t+.115*np.sin(s)+.044*np.sin(2*s+3*t)+.038*np.sin(4*s-2*t)
grain=.72+.038*np.sin(9*wave)+.023*np.sin(32*wave+s)+.014*np.sin(53*wave)+.025*np.cos(3*t+s)+rng.normal(0,.006,s.shape)
nodes=wood.node_tree.nodes
tex=nodes.new('ShaderNodeTexImage')
tex.image=packed_image('호두나무 무늬목',np.stack((grain*1.13,grain*.95,grain*.81),axis=2))
mix=nodes.new('ShaderNodeMixRGB')
mix.blend_type='MULTIPLY'
mix.inputs[0].default_value=1
links=wood.node_tree.links
links.new(nodes.get('Color Attribute').outputs[0],mix.inputs[1])
links.new(tex.outputs[0],mix.inputs[2])
links.new(mix.outputs[0],nodes.get('Principled BSDF').inputs['Base Color'])

def mesh(name, verts, faces, tint, mat, smooth=False, shades=None):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    data.update()
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    obj.matrix_world=frame
    obj["shelf_sample"]=frame.translation.y > -.5
    data.materials.append(mat)
    attr=data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
    rgb=[int(tint[i:i+2],16)/255 for i in (0,2,4)]
    for i,c in enumerate(attr.data):
        f=1 if shades is None else shades[i]
        c.color_srgb=(*[min(1,v*f) for v in rgb],1)
    for p in data.polygons:p.use_smooth=smooth
    if mat==wood:
        uv=data.uv_layers.new(name='목리')
        for p in data.polygons:
            axis=max(range(3),key=lambda i:abs(p.normal[i]))
            axes=[i for i in range(3) if i!=axis]
            for k in p.loop_indices:
                v=data.vertices[data.loops[k].vertex_index].co
                uv.data[k].uv=(v[axes[0]]*.78,v[axes[1]]*2.3)
    return obj

def box(name,xyz,dimensions,tint,mat=trim):
    x,y,z=xyz
    w,d,h=(n/2 for n in dimensions)
    return mesh(name,[(x+a*w,y+b*d,z+c*h) for c in [-1,1] for b in [-1,1] for a in [-1,1]],
                [(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],tint,mat)

def tube(name,points,radius,tint,mat=leather,n=7):
    # Keep closed profiles and arcs smooth. Straight stitches and rolled edges
    # on shelf samples need fewer radial sides than the console pieces.
    if frame.translation.y > -.5 and radius <= .0033:n=4
    pts=list(map(Vector,points))
    verts=[]
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)]).normalized()
        if i==0:
            ref=Vector((0,0,1)) if abs(tangent.z)<.94 else Vector((0,1,0))
        else:ref=b
        a=tangent.cross(ref).normalized()
        b=a.cross(tangent).normalized()
        verts.extend(p+radius*(a*cos(j*2*pi/n)+b*sin(j*2*pi/n)) for j in range(n))
    faces=[(i*n+j,(i+1)*n+j,(i+1)*n+(j+1)%n,i*n+(j+1)%n) for i in range(len(pts)-1) for j in range(n)]
    return mesh(name,verts,faces,tint,mat,True)

def stitches(name,points,tint,r=.00085,spacing=.007):
    # Separate short raised stitches sharing a single editable mesh.
    verts=[]; faces=[]; residual=spacing/2
    for a,b in zip(points,points[1:]):
        a,b=Vector(a),Vector(b)
        d=b-a; length=d.length
        if not length:continue
        v=d/length
        cross=v.cross(Vector((0,0,1)))
        if cross.length<.001:cross=v.cross(Vector((0,1,0)))
        cross.normalize()
        normal=v.cross(cross)
        while residual<length:
            m=a+residual*v; base=len(verts)
            verts.extend([m-.0022*v,m+r*cross,m+r*normal,m-r*cross,m+.0022*v])
            faces.extend(tuple(base+j for j in row) for row in [(0,1,2),(0,2,3),(1,4,2),(2,4,3)])
            residual+=spacing
        residual-=length
    if faces:mesh(name,verts,faces,tint,trim)

def grid(name,rows,tint,mat,shades=None):
    n=len(rows[0])
    faces=[(i*n+j,i*n+j+1,(i+1)*n+j+1,(i+1)*n+j) for i in range(len(rows)-1) for j in range(n-1)]
    return mesh(name,[p for row in rows for p in row],faces,tint,mat,True,shades)

def ringmesh(name,rings,tint,mat,shades=None):
    n=len(rings[0])
    faces=[tuple(reversed(range(n)))] + [(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(len(rings)-1) for j in range(n)]
    faces.append(tuple(range((len(rings)-1)*n,len(rings)*n)))
    return mesh(name,sum(rings,[]),faces,tint,mat,True,shades)

def shoe(tint,hand,hero=False):
    # Cross sections from chisel toe to heel. Upper turns inward around the opening.
    shape=[(-.156,.015,.024),(-.15,.032,.031),(-.134,.040,.038),(-.097,.050,.045),
           (-.062,.055,.052),(-.027,.054,.064),(.009,.048,.081),(.029,.044,.088),
           (.049,.041,.083),(.085,.038,.073),(.118,.037,.075),(.139,.030,.078),(.148,.014,.075)]
    def mid(y):return hand*.008*(1-((y+.156)/.304))
    def half(y):return np.interp(y,[r[0] for r in shape],[r[1] for r in shape])
    def high(y):return np.interp(y,[r[0] for r in shape],[r[2] for r in shape])
    def surface(y,t):return (mid(y)+half(y)*sin(t),y,.017+(high(y)-.017)*max(0,cos(t))**.75)
    outline=[(mid(y)+w,y) for y,w,h in shape]+[(mid(y)-w,y) for y,w,h in reversed(shape)]
    ringmesh('가죽 홍창과 웰트',[[(x*f,y*f,.007+dz+max(0,-y-.105)*.12) for x,y in outline] for f,dz in [(1.01,0),(1.044,.004),(1.038,.008),(.998,.010)]],'382a27',trim)
    box('적층 굽',(0,.105,.008),(.057,.075,.016),'342621')
    rows=[]
    for i,(y,w,h) in enumerate(shape):
        gap=[0]*8+[.79,1,1,.82,.22]
        g=gap[i]
        section=[]
        # Two strips meet over the toe and part over the instep.
        for a in np.linspace(-pi/2,-g,9):section.append(surface(y,a))
        rows.append(section)
    for sign in [-1,1]:
        strips=rows if sign==-1 else [[(2*mid(p[1])-p[0],p[1],p[2]) for p in row[::-1]] for row in rows]
        vals=[.56+.51*cos((p[1]+.052)*11)*(.30+.70*(1-min(1,abs(p[0]-mid(p[1]))/half(p[1])))**.5)+.09*sin(p[1]*52+p[0]*40) for row in strips for p in row]
        grid('파티나 갑피',strips,tint,leather,vals)
    for row in (rows[0],rows[-1]):
        cap=row+[(2*mid(p[1])-p[0],p[1],p[2]) for p in reversed(row)]
        mesh('코와 뒤축 마감',cap,[tuple(range(len(cap)))],tint,leather)
    # Square free edge of the loafer tongue rises above the saddle at the throat.
    tongue=[]
    for y in [.001,.016,.029,.038]:
        tongue.append([(mid(y)+.033*t,y,.007+high(y)-.016*t*t) for t in np.linspace(-1,1,11)])
    grid('각진 로퍼 혀',tongue,tint,leather)
    tube('혀 안쪽 그린 라이닝',tongue[-1],.0016,'574e32')
    lip=[row[-1] for row in rows[7:]]+[(2*mid(row[-1][1])-row[-1][0],row[-1][1],row[-1][2]) for row in rows[:6:-1]]
    grid('안감 옆벽',[lip,[(x*.82,y,.029) for x,y,z in lip]],'635c3f',trim)
    grid('올리브색 안창', [[(-w*.80,y,.03),(w*.80,y,.03)] for y,w,h in shape[7:]],'737745',trim)
    tube('입구 가죽 바인딩',lip,.0018,'452e23')
    seam=[surface(y,-.85) for y,w,h in reversed(shape[1:7])]+[surface(-.15-.003*cos(k*pi/8),-.85+k*1.70/8) for k in range(9)]+[surface(y,.85) for y,w,h in shape[1:7]]
    tube('에이프런 모카 봉제선',seam,.0018,'513526')
    stitches('에이프런 손바느질',[(x,y,z+.0017) for x,y,z in seam],'d1a374')
    # Saddle cutout consists of two curved bands connected only at their ends.
    def strap(y,t):
        x,b,z=surface(y+.003*cos(t),t)
        return (x*1.03,b,z+.0075)
    for y0,y1 in [(-.030,-.015),(-.008,.008)]:
        grid('새들 가죽 띠',[[strap(y,t) for t in np.linspace(-1.39,1.39,17)] for y in [y0,y1]],'76503a' if tint!='514843' else '453b36',leather)
        tube('새들 절단면',[strap(y0,t) for t in np.linspace(-1.39,1.39,17)],.0014,'503626')
    for s in [-1,1]:
        grid('새들 슬롯 끝',[[strap(y,t*s) for t in np.linspace(.63,1.39,6)] for y in [-.015,-.008]],tint,leather)
    if hero:stitches('웰트 둘레 바늘땀',[(x*1.026,y*1.024,.016+max(0,-y-.105)*.12) for x,y in outline+outline[:1]],'947055')

def bag(tint):
    # Soft rectangular front and back panels share a rounded gusset.
    def edge(a,w,h):
        return (w*copysign(abs(cos(a))**.14,cos(a)),h*copysign(abs(sin(a))**.14,sin(a)))
    angles=[2*pi*j/64 for j in range(64)]
    def panel(y,scale):
        return [(x,y,.145+z) for x,z in (edge(a,.2025*scale,.145*scale) for a in angles)]
    rings=[panel(y,s) for y,s in [(.039,.12),(.039,.59),(.037,.95),(.032,1),(-.032,1),(-.037,.95),(-.040,.69),(-.041,.36),(-.041,.09)]]
    shades=[.71+.29*(1-(abs(x)/.213)**2)+.095*sin(x*41+z*23)+.035*sin(z*52-x*33) for row in rings for x,y,z in row]
    ringmesh('베네치아 가죽 몸판',rings,tint,leather,shades)
    for side in [-1,1]:
        e=panel(side*.034,.993)
        tube('새들 엣지 파이핑',e+e[:1],.0021,'493025')
        stitches('몸판 가장자리 봉제',panel(side*.038,.965)+panel(side*.038,.965)[:1],'ae815b')
        for x in [-.070,.070]:
            # Pointed leaf tab and the rectangular palladium handle link.
            verts=[(x+u,side*.042,.25+z) for u,z in [(0,-.046),(.016,-.029),(.018,-.002),(.012,.018),(-.012,.018),(-.018,-.002),(-.016,-.029)]]
            mesh('잎 모양 손잡이 받침',verts,[tuple(range(7))],'61412f',leather)
            stitches('손잡이 받침 박음질',verts+verts[:1],'c09265')
            ring=[(x+u,side*.045,.277+z) for u,z in [(-.014,-.01),(.014,-.01),(.017,-.006),(.017,.008),(.013,.011),(-.013,.011),(-.017,.008),(-.017,-.006),(-.014,-.01)]]
            tube('팔라듐 사각 고리',ring,.0022,'d4c5ae',metal)
        pts=[(.070*cos(i*pi/28),side*(.044-.021*sin(i*pi/28)),.286+.118*sin(i*pi/28)**.76) for i in range(29)]
        tube('둥글게 말아 쥔 손잡이',pts,.0074,tint)
        stitches('손잡이 안쪽 솔기',[(x,y+side*.0056,z-.0038) for x,y,z in pts],'ba956e')
    box('앞주머니 지퍼 테이프',(.084,-.0415,.169),(.155,.004,.010),'40332c')
    tube('앞주머니 금속 지퍼',[(.008,-.044,.169),(.162,-.044,.169)],.00165,'c2b9a3',metal)
    tube('지퍼 가죽 손잡이',[(.016,-.046,.169),(.012,-.052,.163),(.012,-.053,.139)],.0032,'513325')
    box('후면 트롤리 띠',(0,.043,.143),(.325,.009,.032),tint,leather)
    path=[(-.203,0,.195),(-.201,0,.259),(-.194,0,.283),(-.177,0,.291),(.178,0,.291),(.194,0,.283),(.201,0,.259),(.203,0,.195)]
    tube('상단 지퍼 심',path,.0032,'40312a')
    tube('맞물린 금속 이',[(x,y,z+.002) for x,y,z in path],.0016,'b7ac94',metal)

walnut='85553e'
cream='ede0d2'
# Two recessed bays, different shelf widths as in the branch interior photographs.
for centre,width in [(-.99,2.98),(1.55,1.91)]:
    box('밝은 진열장 뒷판',(centre,.22,1.47),(width,.075,2.72),cream)
    # Warm shelf wash, gently shaded into the pale back panels.
    for bottom,top in [(.52,1.04),(1.04,1.55),(1.55,2.09),(2.09,2.70)]:
        rows=[[(centre+q*width,.180,z) for q in [-.49,-.36,0,.36,.49]]
              for z in [bottom,bottom+.085,top-.13,top-.04,top]]
        grid('선반 조명이 비치는 뒷판',rows,cream,trim,
             [a*b for a in [.88,.96,1,1.06,1.03] for b in [.92,.98,1,.98,.92]])
    box('서랍장',(centre,-.005,.238),(width,.48,.435),walnut,wood)
    for x in [centre-width*.25,centre+width*.25]:
        box('서랍 무늬목 앞판',(x,-.253,.25),(width*.49,.026,.343),'8c6048',wood)
    for h in [.52,1.04,1.55,2.09]:
        box('벽 선반',(centre,-.025,h-.022),(width-.06,.429,.044),'8e654f',wood)
        box('선반 밝은 상판',(centre,-.025,h+.001),(width-.065,.426,.002),'d9c5ae')
        box('선반 하부 조명',(centre,-.161,h-.048),(width-.14,.017,.008),'fff0c9')
    box('캐노피',(centre,0,2.75),(width,.53,.11),walnut,wood)
for x in [-2.53,.55,2.55]:
    box('호두나무 세로 프레임',(x,.002,1.412),(.11,.54,2.825),walnut,wood)

# Faceted walnut console. Long diagonal reveal is visible from the front and both ends.
box('진열 콘솔 상판',(0,-1.50,.906),(1.88,.65,.071),'986849',wood)
for x in [-.89,.89]:
    box('진열 콘솔 측판',(x,-1.50,.445),(.09,.64,.89),walnut,wood)
box('콘솔 안쪽 판',(0,-1.30,.477),(1.80,.095,.80),'654331',wood)
verts=[(-.89,-1.82,.05),(.89,-1.82,.85),(.89,-1.82,.884),(-.89,-1.82,.884)]
mesh('사선으로 잘린 무늬목 앞판',verts+[(x,y+.045,z) for x,y,z in verts],[(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],'87573c',wood)
# A separate brand cartouche, using the manufacturer's store lettering as text.
def lettering(words,xyz,size):
    bpy.ops.object.text_add(location=xyz,rotation=(pi/2,0,0))
    ob=bpy.context.object
    ob.data.body=words
    ob.data.align_x='CENTER'
    ob.data.size=size
    ob.data.space_character=1.12
    ob.data.resolution_u=4
    bpy.ops.object.convert(target='MESH')
    ob=bpy.context.object
    ob.name='매장 표기 '+words
    ob.data.materials.append(trim)
    col=ob.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
    for v in col.data:v.color_srgb=(.97,.90,.80,1)
box('상호 패널',(0,.113,2.43),(1.16,.062,.333),'664636',wood)
lettering('BERLUTI',(0,.080,2.405),.148)
lettering('PARIS',(0,.080,2.353),.043)

for h in [.52,1.04,1.55]:
    for i in range(4):
        frame=place(-2.10+i*.73,-.04,h,[-54,-61,-47,-60][i])
        shoe(['966444','654d41','77523e','504947'][(i+int(h*2))%4],1)
for x,y,z,a,tint in [(-1.0,-.03,2.09,0,'b58252'),(1.16,-.03,.52,3,'896047'),(1.92,-.03,.52,-4,'514944'),
                      (1.11,-.03,1.04,-12,'645248'),(1.90,-.03,1.04,8,'9c603e'),
                      (1.52,-.06,1.55,6,'a77950'),(1.48,-.02,2.09,-4,'594d48'),
                      (.43,-1.45,.942,-12,'a66c43')]:
    frame=place(x,y,z,a)
    bag(tint)
for x,y,a,hand,tint in [(-.55,-1.55,-45,1,'a26c47'),(-.40,-1.59,-50,-1,'a26c47'),(-.07,-1.53,-78,1,'514843')]:
    frame=place(x,y,.942,a)
    shoe(tint,hand,True)

frontage.make(collection)
print('EDITABLE MESHES:',len(collection.objects),'FRONTAGE:',sum(o.get('retailPackage')=='frontage' for o in collection.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(out/'gallery.blend'),compress=True)
exp=out/'export.py'
exec(compile(exp.read_text(),str(exp),'exec'),{'__file__':str(exp)})
