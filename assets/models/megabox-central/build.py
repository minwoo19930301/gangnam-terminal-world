import math
from pathlib import Path

import bpy

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('MegaboxBoutiquePublicFront')
bpy.context.scene.collection.children.link(collection)
paint = bpy.data.materials.new('석재와 유리 · 정점색')
paint.use_nodes = True
vertex = paint.node_tree.nodes.new('ShaderNodeVertexColor')
vertex.layer_name = 'COLOR_0'
bsdf = paint.node_tree.nodes.get('Principled BSDF')
paint.node_tree.links.new(vertex.outputs['Color'], bsdf.inputs['Base Color'])
bsdf.inputs['Roughness'].default_value = .3

vertices, faces, colors = [], [], []


def face(points, color):
    first = len(vertices)
    vertices.extend(points)
    faces.append(tuple(range(first, len(vertices))))
    colors.append(color)


def finish(name):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    attr = mesh.color_attributes.new(name='COLOR_0', type='BYTE_COLOR', domain='CORNER')
    for poly, color in zip(mesh.polygons, colors):
        rgb = [int(color[i:i+2], 16)/255 for i in (0, 2, 4)]
        for idx in poly.loop_indices:
            attr.data[idx].color_srgb = (*rgb, 1)
    mesh.materials.append(paint)
    collection.objects.link(bpy.data.objects.new(name, mesh))
    vertices.clear()
    faces.clear()
    colors.clear()


def block(x, y, z, width, length, height, color):
    low = [(x+a*width/2, y+b*length/2, z) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    high = [(a,b,c+height) for a,b,c in low]
    for i in range(4):
        j = (i+1)%4
        face([low[i], low[j], high[j], high[i]], color)
    face(high, color)
    face(low[::-1], color)

# The customer side is Blender -Y. Both secondary arches are glazed recesses.
def point(cx, radius, rise, angle, y):
    return (cx+radius*math.cos(angle),y,2.52+rise*math.sin(angle))

for cx,r,h in [(0,1.82,1.34),(-4.24,1.08,.98),(4.24,1.08,.98)]:
    for i in range(48):
        a,b=i*math.pi/48,(i+1)*math.pi/48
        p,q=point(cx,r,h,a,.015),point(cx,r,h,b,.015)
        face([(cx,.015,2.52),p,q],'%02x%02x%02x'%(171+i//7,181+i//7,171+i//7))
        outer=[point(cx,r+.065,h+.065,t,-.068) for t in (a,b)]
        inner=[point(cx,r,h,t,-.068) for t in (a,b)]
        face([inner[0],outer[0],outer[1],inner[1]],'353b3a')
        face([outer[0],point(cx,r+.065,h+.065,a,.15),point(cx,r+.065,h+.065,b,.15),outer[1]],'424643')
        p,q=[point(cx,r+.068,h+.068,t,.09) for t in (a,b)]
        face([p,q,(q[0],.09,4.38),(p[0],.09,4.38)],'d0c1b2')
    for offset in [-.60,.60]:
        block(cx+offset*r,-.004,2.52,.014,.018,h*math.sqrt(1-offset**2),'929a90')
    block(cx,-.03,2.41,r*2+.14,.22,.11,'252d30')
    for end in (-1,1):block(cx+end*(r+.033),-.015,0,.071,.21,2.41,'373d3b')
    if cx:
        block(cx,.16,.03,r*2,.14,2.37,'988976')
        for band in [0,.76,1.52,2.28]:block(cx,.079,band,r*2,.014,.021,'a79887')
    finish('반원형 유리와 금속 문틀 '+str(cx))
for left,right in [(-6.05,-5.385),(-3.095,-1.887),(1.887,3.095),(5.385,6.05)]:
    for base,top in [(0,.19),(.20,1.31),(1.32,2.50),(2.51,3.50),(3.51,4.38)]:
        block((left+right)/2,.19,base,right-left,.20,top-base,'cfc1b2' if base else 'bcae9e')
    finish('석재 판재 '+str(left))
for z,w,d,c in [(2.47,.065,.24,'4c4b47'),(4.19,.09,.34,'9e9587'),(4.30,.055,.41,'eddfbc'),(4.36,.03,.50,'f1e8d5')]:
    block(0,-.018,z,12.10,d,w,c)
finish('매장면 몰딩과 천장 간접등')
# A photograph of the public counter shows shallow black bowl lights with gold interiors.
def ring(cx, cy, z, radius, count=28):
    return [(cx+radius*math.cos(i*math.tau/count),cy+radius*math.sin(i*math.tau/count),z) for i in range(count)]
def lathe(cx,cy,profile):
    for (za,ra,_),(zb,rb,color) in zip(profile,profile[1:]):
        low,high=ring(cx,cy,za,ra),ring(cx,cy,zb,rb)
        for i in range(len(low)):
            j=(i+1)%len(low);face([low[i],low[j],high[j],high[i]],color)
for cx in [-3.25,-1.02,1.22,3.47]:
    for cy in [1.78,3.36]:
        lathe(cx,cy,[(4.44,.028,'33312e'),(3.86,.028,'35322e'),(3.81,.14,'413d37'),(3.74,.28,'514d46'),(3.61,.40,'46413c'),(3.58,.405,'93806a'),(3.60,.36,'f4d39b'),(3.69,.18,'ffdf9d'),(3.67,.075,'ffebbc'),(3.67,.001,'fff2ce')])
        finish('황동 안쪽 반사갓 '+str((cx,cy)))
# Two branch-photo Speed Order concession terminals with rounded illuminated bezels.
for cx in [3.15,4.00]:
    block(cx,2.90,0,.58,.48,.10,'373d43')
    block(cx,2.92,.10,.46,.34,.75,'525b60')
    block(cx,2.88,.82,.69,.20,.92,'415968')
    block(cx,2.767,.90,.57,.015,.72,'568bb0')
    for side in [-1,1]:
        block(cx+side*.34,2.755,.83,.029,.028,.88,'dfebdf')
    for i in range(20):
        a,b=i*math.pi/20,(i+1)*math.pi/20
        p,q=point(cx,.35,.15,a,2.75),point(cx,.35,.15,b,2.75)
        x1,_,z1=p;x2,_,z2=q
        face([(cx,2.76,1.70),(x1,2.76,z1-.82),(x2,2.76,z2-.82)],'536673')
        v=[(cx+r*math.cos(t),2.75,1.70+h*math.sin(t)) for r,h,t in [(.35,.15,a),(.35,.15,b),(.32,.12,b),(.32,.12,a)]]
        face(v,'e4eddf')
    for j in range(3):
        block(cx-.12+j*.12,2.754,1.04,.085,.015,.09,'9dc7d5')
    finish('무인 주문기 '+str(cx))
# Deep set panels on the customer-facing counter front.
for cx in [-3.20,-1.40,.40,2.20]:
    block(cx,3.479,.18,1.48,.038,.60,'403a34')
    block(cx,3.452,.22,1.38,.029,.52,'63594f')
    block(cx,3.425,.26,1.29,.025,.44,'4b4540')
    finish('매표 카운터 패널 '+str(cx))
# Mouldings over the counter and matching full-height vertical pilasters.
for cx in [-5.20,-3.76,-2.32,-.88,.56,2.00,3.44,4.88]:
    for off in [-.57,.57]:block(cx+off,4.838,2.78,.048,.085,1.50,'504c44')
    for level in [2.78,4.23]:block(cx,4.838,level,1.17,.085,.05,'59534a')
for level,depth,high,tone in [(2.32,.20,.07,'474540'),(2.38,.23,.27,'49443e'),(2.65,.28,.07,'685f54')]:
    block(0,4.77,level,12.02,depth,high,tone)
finish('매표 로비 목재 몰딩과 처마')
# The branch photo shows lit popcorn bays beneath the screens and a cool
# illuminated two-shelf drinks case beside them. Open faces reveal the stock.
import random
rng = random.Random(1371)
for cx in [-2.75, -.05]:
    cy = 4.00
    block(cx,cy,1.10,1.18,.55,.075,'79756b')
    block(cx,cy+.24,1.175,1.12,.045,.54,'8b7356')
    for side in [-1,1]:
        block(cx+side*.558,cy,1.17,.035,.51,.57,'a29c89')
        block(cx+side*.558,cy-.25,1.17,.030,.03,.57,'ddd4b6')
    block(cx,cy,1.71,1.20,.56,.09,'595852')
    block(cx,cy-.24,1.697,1.08,.035,.020,'fff0b3')
    # A continuous irregular bed keeps the popcorn readable at middle distance;
    # individual folded kernels interrupt the edge at close range.
    tones=['f8d58d','edbe6a','e4b361','ffe2a3','d9a556']
    rows=[]
    for j in range(5):
        row=[]
        for i in range(13):
            px=(i-6)/12; py=(j-2)/4
            z=1.21+.18*max(0,1-2.6*px*px-2.8*py*py)+rng.uniform(-.028,.028)
            row.append((cx+px*1.06,cy+py*.45,z))
        rows.append(row)
    for j in range(4):
        for i in range(12):
            face([rows[j][i],rows[j][i+1],rows[j+1][i+1],rows[j+1][i]],rng.choice(tones))
    for row in rows:
        for x,y,z in row:
            r=rng.uniform(.024,.042)
            crown=(x+.01,y,z+r*.85)
            rim=[(x+r*math.cos(i*math.tau/5),y+r*math.sin(i*math.tau/5),z+rng.uniform(-.012,.008)) for i in range(5)]
            for i in range(5):
                face([rim[i],rim[(i+1)%5],crown],rng.choice(tones))
    # Brushed steel lip, narrow viewing rail and a hanging popper kettle.
    block(cx,cy-.267,1.175,1.12,.023,.068,'c5b69a')
    block(cx-.18,cy+.06,1.57,.024,.025,.14,'b9b3a1')
    block(cx-.18,cy+.06,1.49,.235,.15,.09,'938d81')
    finish('매점 · 조명 팝콘 진열함 '+str(cx))
cx,cy=2.02,4.06
block(cx,cy+.17,1.10,1.26,.10,.75,'647773')
for side in [-1,1]:
    block(cx+side*.625,cy,1.10,.045,.46,.75,'9aa9a1')
for shelf in range(2):
    base=1.14+shelf*.31
    block(cx,cy,base,1.22,.46,.045,'a1b0a7')
    block(cx,cy-.226,base+.025,1.18,.012,.025,'def2da')
    for i in range(13):
        x=cx+(i-6)*.088
        shade=['c49a53','c7814b','679b74','aecaba','729ba2'][i//3]
        def bottle_ring(z,r):
            return [(x+r*math.cos(k*math.tau/7),cy+r*math.sin(k*math.tau/7),z+base) for k in range(7)]
        profile=[(.045,.034),(.08,.035),(.15,.035),(.20,.033),(.22,.019),(.24,.019)]
        for (za,ra),(zb,rb),tone in zip(profile,profile[1:],[shade,'d1d4ae',shade,'adbfa8','d6dbc7']):
            lo,hi=bottle_ring(za,ra),bottle_ring(zb,rb)
            for k in range(7):face([lo[k],lo[(k+1)%7],hi[(k+1)%7],hi[k]],tone)
block(cx,cy,1.805,1.30,.48,.063,'495759')
block(cx,cy-.23,1.785,1.19,.025,.022,'e4ffe6')
finish('매점 · 냉장 음료 진열장')

# In the branch photo a right-angle return above the order kiosks exposes
# timber armchairs behind a thin horizontal railing. Fit only the visible
# edge inside the existing room, keeping the public floor below unobstructed.
from mathutils import Vector
def strut(a,b,r,color):
    start,end=Vector(a),Vector(b)
    axis=(end-start).normalized()
    seed=Vector((0,0,1)) if abs(axis.z)<.85 else Vector((0,1,0))
    side=axis.cross(seed).normalized()*r
    up=axis.cross(side).normalized()*r
    ends=[[tuple(c+side*i+up*j) for i,j in [(-1,-1),(1,-1),(1,1),(-1,1)]] for c in [start,end]]
    for i in range(4):face([ends[0][i],ends[0][(i+1)%4],ends[1][(i+1)%4],ends[1][i]],color)
    face(ends[0][::-1],color)
    face(ends[1],color)

front=4.97
block(5.52,2.83,2.40,1.1,3.65,.43,'49443f')
block(5.52,2.83,2.825,1.1,3.67,.060,'6d5e4d')
block(5.52,2.83,2.37,1.13,3.67,.038,'3a3936')
for cy in [1.02,2.83,4.62]:
    block(front+.075,cy,2.88,.025,.025,.78,'67635a')
for high in [3.02,3.19,3.36,3.64]:
    block(front+.076,2.82,high,.018,3.63,.014 if high<3.6 else .030,'706d61')
for edge in [1.03,4.58]:
    strut((front+.085,edge,2.89),(front+.085,edge+(.63 if edge<2 else -.63),3.64),.008,'777368')
# The photo's dark full-height pilaster and recessed wall frame the kiosks.
block(5.45,.95,0,1.20,.16,4.36,'4e4740')
block(4.84,.95,.10,.055,.205,4.13,'61574b')
block(5.99,2.85,0,.075,3.67,2.41,'383936')
block(5.48,4.68,0,.92,.12,2.41,'45423e')
block(5.42,4.7,2.83,1.24,.14,1.54,'514941')
finish('중층 · 라운지 난간과 매표 로비 처마')

def chair(cx,cy,turn):
    def world(u,v,h):
        return (cx+u*math.cos(turn)-v*math.sin(turn),cy+u*math.sin(turn)+v*math.cos(turn),2.89+h)
    def frame(a,b,r,tone):strut(world(*a),world(*b),r,tone)
    for u in [-.23,.23]:
        for v in [-.22,.22]:
            frame((u*1.10,v*1.12,.01),(u,v,.44 if v<0 else .77),.025,'ad7642')
        frame((u,-.20,.62),(u,.22,.66),.029,'c18b4d')
        frame((u,-.18,.40),(u,-.18,.61),.018,'a57647')
        frame((u,-.24,.38),(u,.24,.38),.032,'a77545')
    for h in [.52,.66,.79]:
        frame((-.23,.21,h),(.23,.21,h),.027,'b48653')
    frame((-.23,.18,.40),(.23,.18,.40),.033,'ad7b4a')
    face([world(u,v,.415) for u,v in [(-.24,-.24),(.24,-.24),(.24,.24),(-.24,.24)]],'6e4931')
    finish('중층 · 목재 팔걸이 의자 '+str(cy))
chair(5.61,1.66,-1.06)
chair(5.56,3.72,-1.71)
block(5.61,2.71,3.57,.52,.72,.045,'896342')
block(5.61,2.71,2.89,.08,.12,.69,'615447')
finish('중층 · 카페 테이블')

# Preserve the channel lettering as its own editable mesh.
font_path=Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
if not font_path.exists():
    font_path=Path('/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf')
font=bpy.data.fonts.load(str(font_path)) if font_path.exists() else bpy.data.fonts.get('Bfont')
curve=bpy.data.curves.new('MEGABOX channel lettering','FONT')
curve.body='MEGABOX';curve.font=font;curve.align_x='CENTER';curve.size=.35;curve.resolution_u=5;curve.bevel_resolution=1;curve.extrude=.022;curve.bevel_depth=.003
obj=bpy.data.objects.new('입체 문자 · MEGABOX',curve);collection.objects.link(obj)
obj.rotation_euler.x=math.pi/2;obj.location=(0,-.19,2.56)
bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH')
obj=bpy.context.object;attr=obj.data.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
for el in attr.data:el.color_srgb=(.84,.95,1,1)
obj.data.materials.append(paint)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'entrance.blend'),compress=True)
