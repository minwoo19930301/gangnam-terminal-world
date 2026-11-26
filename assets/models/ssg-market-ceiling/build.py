"""Localised produce-hall ceiling, Blender +X toward the public entrance."""
from pathlib import Path
from math import sin, cos, tau
import bpy

OUT=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('MarketProduceCeiling')
bpy.context.scene.collection.children.link(collection)
image=bpy.data.images.load(str(OUT/'panel.jpg'))
image.pack()
paint=bpy.data.materials.new('회벽 몰딩과 장식화')
paint.use_nodes=True
nodes=paint.node_tree.nodes
texture=nodes.new('ShaderNodeTexImage')
texture.image=image
vcol=nodes.new('ShaderNodeVertexColor')
vcol.layer_name='COLOR_0'
multiply=nodes.new('ShaderNodeMixRGB')
multiply.blend_type='MULTIPLY'
multiply.inputs[0].default_value=1
for src,dest in [(texture.outputs['Color'],multiply.inputs[1]),(vcol.outputs['Color'],multiply.inputs[2]),(multiply.outputs[0],nodes['Principled BSDF'].inputs['Base Color'])]:
    paint.node_tree.links.new(src,dest)
vertices,faces,uvs,colors=[],[],[],[]
white=(.018,.023)

def face(points,color,uv=None):
    start=len(vertices)
    vertices.extend(points)
    faces.append(tuple(range(start,len(vertices))))
    colors.append(color)
    uvs.extend(uv or [white]*len(points))

def finish(name):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    layer=mesh.uv_layers.new(name='장식화')
    for loop,uv in zip(layer.data,uvs):
        loop.uv=uv
    attr=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for poly,color in zip(mesh.polygons,colors):
        rgb=[int(color[k:k+2],16)/255 for k in (0,2,4)]
        for loop in poly.loop_indices:attr.data[loop].color_srgb=(*rgb,1)
    mesh.materials.append(paint)
    collection.objects.link(bpy.data.objects.new(name,mesh))
    vertices.clear();faces.clear();colors.clear();uvs.clear()

# The outer corners clip short, as on the press photograph. Each panel terminates
# at an octagonal collar rather than eight triangles meeting at a single pixel.
w,d,c=4.0,3.65,1.13
outline=[(-w,-d+c),(-w+c,-d),(w-c,-d),(w,-d+c),(w,d-c),(w-c,d),(-w+c,d),(-w,d-c)]

def ring(a,b,z1,z2,color):
    for i,(x,y) in enumerate(outline):
        u,v=outline[(i+1)%8]
        face([(x*a,y*a,z1),(x*b,y*b,z2),(u*b,v*b,z2),(u*a,v*a,z1)],color)

for i,(x,y) in enumerate(outline):
    u,v=outline[(i+1)%8]
    face([(x*.143,y*.143,4.232),(x*.964,y*.964,4.232),(u*.964,v*.964,4.232),(u*.143,v*.143,4.232)],
         'ffffff',[(.445,.10),(.035,.97),(.965,.97),(.555,.10)])
    finish('장식화 부채꼴 '+str(i+1))
for i,(x,y) in enumerate(outline):
    length=(x*x+y*y)**.5
    nx,ny=-y/length,x/length
    # Sloping sides catch the interior lights along the edges of the plaster ribs.
    for a,b,z1,z2,color in [(-.083,-.060,4.229,4.184,'cfc1a5'),(-.060,.060,4.184,4.184,'f3e4c7'),(.060,.083,4.184,4.229,'e2d1b4')]:
        face([(x*s+nx*off,y*s+ny*off,z) for s,off,z in [(.13,a,z1),(.967,a,z1),(.967,b,z2),(.13,b,z2)]],color)
finish('여덟 갈래 회벽 리브')
for a,b,h1,h2,color in [(.959,.970,4.229,4.184,'e4cfac'),(.970,.976,4.184,4.175,'fff0d0'),
                         (.976,.984,4.175,4.156,'f9edcf'),(.984,1,4.156,4.156,'eee2ca'),
                         (1,1.009,4.156,4.202,'c6bba6'),(1.009,1.023,4.202,4.202,'ffefcf'),
                         (1.023,1.027,4.202,4.272,'cec4b0')]:
    ring(a,b,h1,h2,color)
finish('모서리가 깎인 간접조명과 테두리')
for r1,r2,h1,h2,color in [(.62,.65,4.187,4.215,'c0af91'),(.61,.62,4.166,4.187,'ead8b7'),(.49,.61,4.166,4.166,'f3e6cc'),(.47,.49,4.136,4.166,'cbb99b'),(0,.47,4.136,4.136,'ebddbc')]:
    for i in range(48):
        a=tau*i/48;b=tau*(i+1)/48
        p=[(r*cos(t),r*sin(t),z) for r,t,z in [(r1,a,h1),(r2,a,h2),(r2,b,h2),(r1,b,h1)]]
        face(p[:3] if r1==0 else p,color)
finish('중앙 석고 원형 몰딩')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'ceiling.blend'),compress=True)
