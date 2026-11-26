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
