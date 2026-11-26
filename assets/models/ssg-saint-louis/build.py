"""Author the Bubble seating vignette. Local +Y points towards the rear."""
import bpy
import math
from pathlib import Path
from mathutils import Vector
from math import sin, cos, pi

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('SSG_9F_RocheBobois')
bpy.context.scene.collection.children.link(collection)

def linear(c):
    v = c / 255
    return ((v + .055) / 1.055) ** 2.4 if v > .04045 else v / 12.92

def mat(name, rough, metal=0, texture=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nodes, links = m.node_tree.nodes, m.node_tree.links
    bs = nodes.get('Principled BSDF')
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    colors = nodes.new('ShaderNodeVertexColor')
    colors.layer_name = 'Tint'
    color = colors.outputs['Color']
    if texture:
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = bpy.data.images.load(str(out / texture))
        tex.image.pack()
        mult = nodes.new('ShaderNodeMixRGB')
        mult.blend_type = 'MULTIPLY'
        mult.inputs[0].default_value = 1
        links.new(color, mult.inputs[1])
        links.new(tex.outputs['Color'], mult.inputs[2])
        color = mult.outputs[0]
    links.new(color, bs.inputs['Base Color'])
    return m

cloth = mat('RocheBubbleUpholstery', .94, texture='knit.png')
metal = mat('RocheSpunMetal', .28, .54)
printmat = mat('RochePrintedCushions', .89, texture='cushion.png')
rugmat = mat('RocheIllustratedRug', .98, texture='rug.png')
trim = mat('RocheShowroomTrim', .62)

def mesh(name,verts,faces,material,color,uv=None,smooth=True):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    ob = bpy.data.objects.new(name,data)
    collection.objects.link(ob)
    data.materials.append(material)
    tint = data.color_attributes.new(name='Tint', type='BYTE_COLOR', domain='POINT')
    rgb = tuple(linear(v) for v in color) + (1,)
    for item in tint.data:
        item.color = rgb
    if uv:
        layer = data.uv_layers.new(name='Fabric')
        for loop in data.loops:
            layer.data[loop.index].uv = uv[loop.vertex_index]
    for poly in data.polygons:
        poly.use_smooth = smooth
    return ob

def grid(name,n,m,fn,material,color):
    verts,uv,faces=[],[],[]
    for i in range(n+1):
        for j in range(m+1):
            pos,coords=fn(i/n,j/m)
            verts.append(pos)
            uv.append(coords)
    for i in range(n):
        for j in range(m):
            k=i*(m+1)+j
            faces.append((k,k+m+1,k+m+2,k+1))
    ob=mesh(name,verts,faces,material,color,uv)
    # Bake broad studio bounce and contact shading into the woven foam. The
    # game has no showroom environment map, especially noticeable at night.
    data=ob.data
    attr=data.color_attributes['Tint']
    rgb=tuple(linear(channel) for channel in color)
    for vertex in data.vertices:
        normal=vertex.normal
        key=normal.dot(Vector((-.40,-.46,.79)))
        shade=.51+.45*(.5+.5*key)
        if material==cloth:
            t=(vertex.index%(m+1))/m
            u=(vertex.index//(m+1))/n
            seam=abs(cos(pi*round(n/12)*u))**9
            shade*=1-.20*seam
            shade*=1-.22*math.exp(-((t-.40)/.075)**2)
        else:
            shade=.83+.17*(.5+.5*key)
        attr.data[vertex.index].color=tuple(c*shade for c in rgb)+(1,)
    return ob

def transform(ob,x,y,angle):
    ob.location.x=x
    ob.location.y=y
    ob.rotation_euler.z=math.radians(angle)

def profile(points,t):
    # Interpolating periodic spline along a transverse upholstery section.
    t=t*len(points)
    k=int(t)
    f=t-k
    a,b,c,d=[Vector(points[(k+j)%len(points)]) for j in (-1,0,1,2)]
    return (2*b+(-a+c)*f+(2*a-5*b+4*c-d)*f*f+(-a+3*b-3*c+d)*f*f*f)*.5

def bubble(name,w,depth,nr,x,y,angle,color):
    def surface(u,t):
        s=2*u-1
        # The outside baffles curl into arms. Their ends round over continuously.
        edge=abs(s)
        end=math.sqrt(max(.00001,1-max(0,(edge-.77)/.23)**2))
        arm=min(1,max(0,(edge-.53)/.31))
        arm=arm*arm*(3-2*arm)
        pinch=abs(cos(pi*nr*u))**8
        section=[(-.38,.049),(-.49,.12),(-.53,.29),(-.49,.398),
                 (-.37,.43),(-.25,.389),(-.13,.414),(-.015,.367),
                 (.09,.412),(.17,.545),(.23,.566),(.265,.684),
                 (.38,.769),(.48,.716),(.51,.54),(.485,.31),(.41,.105),(.26,.045)]
        q,h=profile(section,t)
        q*=depth
        if h>.32 and q<.24*depth:
            h+=arm*.19*min(1,(h-.32)/.10)
        h=.35+(h-.35)*end
        q*=end
        # Sewn channels compress the foam; only slight gathering at the bottom.
        q*=1-.095*pinch
        h=.29+(h-.29)*(1-.13*pinch)
        return ((s*w*.5,q-.07*edge**2,h),(u*w*19,t*40))
    ob=grid(name,nr*12,72,surface,cloth,color)
    transform(ob,x,y,angle)

bubble('회색 버블 소파',2.34,1.14,8,-.85,.20,12,(192,192,195))
bubble('시트론 버블 안락의자',1.26,1.06,5,1.38,-.54,-35,(202,191,38))

def spun(name,x,y,profile_points,color,material=metal):
    verts,faces=[],[]
    segments=64
    for radius,z in profile_points:
        for i in range(segments):
            a=2*pi*i/segments
            verts.append((x+radius*cos(a),y+radius*sin(a),z))
    for j in range(len(profile_points)-1):
        for i in range(segments):
            k=j*segments+i
            nxt=j*segments+(i+1)%segments
            faces.append((k,nxt,nxt+segments,k+segments))
    ob=mesh(name,verts,faces,material,color)
    # Broad reflections on brushed concave metal stay legible under the mall lights.
    tint=ob.data.color_attributes['Tint']
    for vertex in ob.data.vertices:
        a=math.atan2(vertex.co.y-y,vertex.co.x-x)
        streak=max(0,cos(a-.8))**7+.70*max(0,cos(a+2.45))**10
        base=.61+.22*(.5+.5*sin(2*a))
        for_color=[linear(channel)*base+.26*streak for channel in color]
        tint.data[vertex.index].color=tuple(min(1,c) for c in for_color)+(1,)
    return ob

for name,x,y,r,h,c in [('청록',-.50,-.89,.36,.33,(104,190,188)),('구리',.32,-.83,.44,.38,(214,151,120))]:
    spun(name+' 받침',x,y,[(.004,.018),(.16,.018),(.164,.032),(.091,.045),(.06,h*.63)],(71,62,65))
    spun(name+' 오목한 금속 상판',x,y,[(.01,h*.56),(.075,h*.58),(.16,h*.66),(r*.7,h*.85),(r,h-.008),(r,h),(r*.72,h*.89),(.15,h*.73),(.045,h*.68),(.001,h*.68)],c)

def pillow(name,x,y,z,angle,lean):
    def side(u,v):
        # A closed double-sided envelope with plump centre and pinched corners.
        a=(u-.5)*2
        b=sin(2*pi*v)
        d=-cos(2*pi*v)
        face=abs(d)**.42
        height=math.copysign(abs(b)**.48,b)*(.205+.021*a*a)
        thick=math.copysign(.082*face*(1-.73*abs(a)**3),d)
        return ((a*(.215+.011*b*b),thick+height*lean,height),(.5+.5*a,.5+height/.46))
    ob=grid(name,18,32,side,printmat,(255,255,255))
    transform(ob,x,y,angle)
    ob.location.z=z
    # Small end gussets close both sides.
    for i in (0,18):
        base=i*33
        data=ob.data
        import bmesh
        bm=bmesh.new()
        bm.from_mesh(data)
        bm.verts.ensure_lookup_table()
        ids=list(range(base,base+32))
        if i==0:ids.reverse()
        bm.faces.new([bm.verts[k] for k in ids])
        bm.to_mesh(data)
        bm.free()

pillow('소파 왼쪽 쿠션',-1.57,.29,.54,18,.44)
pillow('소파 오른쪽 쿠션',-.43,.49,.55,8,.45)
pillow('안락의자 쿠션',1.53,-.37,.54,-31,.45)

def carpet(u,v):
    a=2*pi*u
    r=1-.065*cos(5*a+.4)+.035*cos(8*a)
    x=1.93*r*v*cos(a)
    y=1.20*r*v*sin(a)
    return ((x,y-.47,.022),(x/4.25+.5,y/2.65+.5))
grid('곡선 무늬 러그',112,4,carpet,rugmat,(255,255,255))
# The photographer-facing disk lamp has a pleated silk reflector and brass hub.
def disk(u,v):
    a=2*pi*u
    r=.36*v*(1-.025*cos(24*a))
    y=.073*v+.026*cos(24*a)*v
    return ((-1.93+r*cos(a),1.04+y,1.67+r*sin(a)),(u,v))
grid('주름 반사갓',192,4,disk,trim,(248,229,194))
spun('황동 스탠드',-1.93,1.17,[(.001,.025),(.16,.025),(.16,.045),(.018,.06),(.014,1.68)],(186,150,99))
def hub(u,v):
    a=2*pi*u
    return ((-1.93+.076*v*cos(a),1.032-.02*(1-v*v),1.67+.076*v*sin(a)),(u,v))
grid('황동 중심 장식',48,3,hub,metal,(191,156,97))

# Slim, dark bronze-panel display backdrop visible behind the seating in Seoul.
def box(name,x,y,z,w,d,h,color):
    verts=[(x+i*w/2,y+j*d/2,z+k*h) for k in (0,1) for j in (-1,1) for i in (-1,1)]
    faces=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)]
    return mesh(name,verts,faces,trim,color,smooth=False)

for j in range(5):
    box('브론즈 진열 패널', (j-2)*.94,1.46,.035,.933,.045,2.42,
        [(73,72,72),(70,69,73),(65,64,67),(75,74,74),(66,66,68)][j])
for j in range(6):
    box('세로 금속 몰딩',(j-2.5)*.94,1.428,.035,.015,.022,2.42,(134,108,89))
box('상부 간접등',0,1.428,2.43,4.71,.035,.021,(238,197,148))
# In the source photograph the showroom wordmark is centred on the dark panel.
def lettering(text,z,size):
    curve=bpy.data.curves.new(text,'FONT')
    curve.body=text
    curve.align_x='CENTER'
    curve.size=size
    curve.extrude=.0007
    ob=bpy.data.objects.new(text,curve)
    collection.objects.link(ob)
    ob.location=(.10,1.421,z)
    ob.rotation_euler.x=pi/2
    bpy.context.view_layer.objects.active=ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    ob.data.materials.append(trim)
    tint=ob.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
    for item in tint.data: item.color=(.91,.86,.79,1)
    ob.select_set(False)
lettering('rochebobois',1.60,.222)
lettering('P A R I S',1.535,.052)

# Two-sided woven surfaces include narrow end seams and the rug's underside.
for m in (cloth,trim,rugmat,printmat,metal):
    m.use_backface_culling=False
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/'bubble.blend'),compress=True)
exec(compile((out/'export.py').read_text(),str(out/'export.py'),'exec'))
