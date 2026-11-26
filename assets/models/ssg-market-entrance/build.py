"""Build the east portal in its existing metre-scale opening. Blender local +X faces the lobby."""
import math
import random
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('MarketEastPortal')
bpy.context.scene.collection.children.link(collection)
paint = bpy.data.materials.new('석재와 주물 · 정점색')
paint.use_nodes = True
vertex = paint.node_tree.nodes.new('ShaderNodeVertexColor')
vertex.layer_name = 'COLOR_0'
bsdf = paint.node_tree.nodes.get('Principled BSDF')
paint.node_tree.links.new(vertex.outputs['Color'], bsdf.inputs['Base Color'])
bsdf.inputs['Roughness'].default_value = .3

vertices, faces, colors = [], [], []
rng = random.Random(552)
tau = math.tau


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


def lathe(x, y, rings, count=32, stone=False):
    for (r,z,col), (r2,z2,_) in zip(rings,rings[1:]):
        for i in range(count):
            a, b = tau*i/count, tau*(i+1)/count
            tone=col
            if stone:
                glint=17*max(0,math.cos(3*(a+b)/2+.65))**12+7*max(0,math.cos((a+b)/2))
                tone=''.join(f'{min(255,round(int(col[k:k+2],16)+glint)):02x}' for k in (0,2,4))
            face([(x+rad*math.cos(t), y+rad*math.sin(t), h)
                  for rad,t,h in [(r,a,z),(r,b,z),(r2,b,z2),(r2,a,z2)]], tone)


for side in [-1,1]:
    cy = side*2.90
    name = '좌측' if side<0 else '우측'
    block(0,cy,0,.93,.77,.09,'c7c4b7')
    block(0,cy,.09,.89,.73,.12,'eee9d7')
    finish(name+' · 하얀 석재 기단')
    for depth in [-.227,.227]:
        x,y = depth,cy
        lathe(x,y,[(.22,.21,'77502b'),(.225,.232,'d5a45f'),(.224,.248,'936032'),
                   (.208,.262,'f3c580'),(.214,.282,'9c713e'),(.204,.308,'d6ac6c'),(.195,.325,'a48050')])
        finish(name+' · 황동 기단 돌림띠')
        lathe(x,y,[(.194,.322,'1b1c20'),(.195,.55,'1d1c20'),(.187,2.05,'201e23'),(.175,3.036,'18181c')],stone=True)
        # The diagonal calcite seams lie on the surface and taper to a fine point.
        for vein in range(19):
            a = rng.uniform(0,tau)
            h = rng.uniform(.33,2.81)
            rise = min(3.02-h,rng.uniform(.22,.85))
            arc = rng.uniform(.25,1.55)
            prev = None
            for j in range(12):
                t=j/11
                angle=a+arc*t+.048*math.sin(17*t+vein)+.015*math.sin(37*t)
                z=h+rise*t
                if z<.55:
                    radius=.1965
                elif z<2.05:
                    radius=.1965-(z-.55)*.008/1.50
                else:
                    radius=.1885-(z-2.05)*.012/.986
                width=(.005+.037*math.sin(math.pi*t)**1.3)
                row=[(x+radius*math.cos(angle+offset),y+radius*math.sin(angle+offset),z) for offset in [-width,width]]
                if prev:
                    face([prev[0],prev[1],row[1],row[0]],['8c8988','b8b3aa','69696b'][vein%3])
                prev=row
        finish(name+' · 방해석 맥이 있는 검은 대리석 원주')
        lathe(x,y,[(.177,3.015,'916531'),(.197,3.035,'d4a55f'),(.193,3.075,'7b542f'),
                   (.217,3.18,'a57943'),(.258,3.335,'785331'),(.265,3.365,'d7ae6e')])
        for tier in range(2):
            for i in range(9):
                a=tau*(i+tier*.5)/9
                z0=3.048+tier*.119
                rows=[]
                for j,(rad,dz,width) in enumerate([(.19,0,.012),(.208,.047,.06),(.224,.099,.068),(.245,.148,.045),(.257,.16,.004)]):
                    rad+=tier*.014
                    def pt(offset,bulge):
                        return (x+(rad+bulge)*math.cos(a)-offset*math.sin(a),y+(rad+bulge)*math.sin(a)+offset*math.cos(a),z0+dz)
                    rows.append([pt(-width,0),pt(0,.017),pt(width,0)])
                for lo,hi in zip(rows,rows[1:]):
                    face([lo[0],lo[1],hi[1],hi[0]],'ad834b')
                    face([lo[1],lo[2],hi[2],hi[1]],'d1a765')
        block(x,y,3.354,.51,.51,.085,'ac844e')
        finish(name+' · 두 겹 잎무늬 주두와 받침판')

# Shallow spanning lintel. Only its underside occupies the space above the doorway.
block(0,0,3.44,.88,6.58,.39,'45403d')
block(.008,0,3.439,.907,6.6,.025,'776858')
block(.008,0,3.81,.91,6.62,.022,'705f50')
finish('암석 인방과 가는 가장자리')
for i in range(10):
    block(0,(i-4.5)*.627,3.425,.861,.621,.014,['958b7b','a09788','8d8478'][i%3])
finish('광택 소핏 · 맞댄 패널')

# The documented seasonal greenery is confined to short sprigs under the outer ends.
for side in [-1,1]:
    for i in range(16):
        y=side*(2.48+i*.035)
        x=.385
        z=3.414-.046*math.sin(i*math.pi/15)
        for j in range(4):
            off=(j-1.5)*.019
            face([(x,y,z),(x+.033,y+off+.029,z-.029),(x+.025,y+off,z-.088-rng.random()*.026)],['354536','526149'][j%2])
    for i in (2,8,13):
        x,y,z=.428,side*(2.48+i*.035),3.365
        lathe(x,y,[(.001,z-.022,'853b34'),(.023,z,'b94d3d'),(.001,z+.022,'b94d3d')],8)
finish('시즌 장식 · 양 끝의 솔잎과 열매')

def letters(name, string, font, y, height, max_width):
    curve=bpy.data.curves.new(name,'FONT')
    curve.body=string
    curve.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/'+font)
    curve.align_x='CENTER'
    curve.align_y='CENTER'
    curve.space_character=1.15
    curve.resolution_u=4
    obj=bpy.data.objects.new(name,curve)
    collection.objects.link(obj)
    bpy.context.view_layer.update()
    bounds=[Vector(p) for p in obj.bound_box]
    w=max(p.x for p in bounds)-min(p.x for p in bounds)
    h=max(p.y for p in bounds)-min(p.y for p in bounds)
    scale=min(max_width/w,height/h)
    obj.matrix_world=Matrix(((0,0,1,.445),(scale,0,0,y),(0,scale,0,3.634),(0,0,0,1)))
    gold=bpy.data.materials.get('글자 · 금박') or bpy.data.materials.new('글자 · 금박')
    gold.diffuse_color=(.91,.69,.33,1)
    curve.materials.append(gold)
    # Store editable glyph outlines without redistributing the commercial font.
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target='MESH')
    attr=obj.data.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for loop in attr.data:
        loop.color_srgb=(.97,.82,.56,1)

letters('중앙 금박 한자','新世界食品館','Songti.ttc',0,.227,2.07)
letters('우측 영문 명칭','SHINSEGAE MARKET','Georgia.ttf',2.12,.105,1.36)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'entrance.blend'),compress=True)
