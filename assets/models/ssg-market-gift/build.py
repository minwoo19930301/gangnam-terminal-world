"""Local X faces customers. Local Y runs along the existing concierge frontage."""
from pathlib import Path
from math import sin, cos, tau, pi
import random
import bpy

OUT=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('MarketGiftConcierge')
bpy.context.scene.collection.children.link(collection)
image=bpy.data.images.load(str(OUT/'garden.jpg'))
image.pack()
material=bpy.data.materials.new('진열대와 숲 그림')
material.use_nodes=True
nodes=material.node_tree.nodes
tex=nodes.new('ShaderNodeTexImage');tex.image=image
col=nodes.new('ShaderNodeVertexColor');col.layer_name='COLOR_0'
mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
for a,b in [(tex.outputs['Color'],mix.inputs[1]),(col.outputs['Color'],mix.inputs[2]),(mix.outputs[0],nodes['Principled BSDF'].inputs['Base Color'])]:
    material.node_tree.links.new(a,b)
verts=[];faces=[];colors=[];uvs=[]
rng=random.Random(641)

def face(points,color,uv=None):
    first=len(verts);verts.extend(points);faces.append(tuple(range(first,len(verts))))
    colors.append(color);uvs.extend(uv or [(.009,.021)]*len(points))

def finish(name):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    layer=mesh.uv_layers.new(name='그림 UV')
    for point,uv in zip(layer.data,uvs):point.uv=uv
    attr=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for poly,color in zip(mesh.polygons,colors):
        rgb=[int(color[k:k+2],16)/255 for k in (0,2,4)]
        for idx in poly.loop_indices:attr.data[idx].color_srgb=(*rgb,1)
    mesh.materials.append(material);collection.objects.link(bpy.data.objects.new(name,mesh))
    verts.clear();faces.clear();colors.clear();uvs.clear()

def block(x,y,z,d,w,h,c):
    p=[(x+a*d/2,y+b*w/2,z) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    q=[(a,b,c+h) for a,b,c in p]
    face(q,c);face(p[::-1],c)
    for i in range(4):
        j=(i+1)%4;face([p[i],p[j],q[j],q[i]],c)

def profile(x,y,z,r,h,color,segments=8):
    rings=[(.20,0),(.88,.19),(1,.59),(.72,.9),(.20,1)] if segments>=8 else [(.25,0),(.94,.28),(1,.63),(.24,1)]
    for (r1,z1),(r2,z2) in zip(rings,rings[1:]):
        for i in range(segments):
            a=tau*i/segments;b=tau*(i+1)/segments
            gain=.88+.17*z1+.10*max(0,cos(a+.6))**4
            tone=''.join(f'{min(255,round(int(color[k:k+2],16)*gain)):02x}' for k in (0,2,4))
            face([(x+rad*r*cos(t),y+rad*r*sin(t),z+zz*h) for rad,t,zz in [(r1,a,z1),(r1,b,z1),(r2,b,z2),(r2,a,z2)]],tone)

# The white fruit case has split doors, individual lit trays and slate price cards.
block(0,0,.032,.95,4.07,.13,'6d6b65')
block(0,0,.162,.95,4.07,.32,'c2bfb5')
block(.466,0,.20,.02,4.05,.22,'eeeee6')
block(.478,0,.42,.013,4.05,.022,'9c9f99')
block(0,0,.482,.948,4.07,.07,'ecece6')
for i in range(7):
    y=-1.72+i*.572
    block(.02,y,.552,.82,.556,.028,'f7f5ec')
    block(.372,y,.583,.118,.17,.074,'b4b3a8')
    block(.434,y,.597,.008,.15,.048,'68706d')
    if i in [0,3,6]:block(.45,y-.284,.553,.025,.018,.50,'9e9a90')
    for row in range(3):
        rise=[.205,.098,0][row]
        block(-.275+row*.238,y,.579,.226,.535,rise+.012,'f1f1eb')
        for k in range(4):
            x=-.275+row*.238;y0=y+(k-1.5)*.122+(row%2)*.013
            kind=i%7
            if kind==1:
                for j in range(7):
                    dx,dy=rng.uniform(-.052,.052),rng.uniform(-.043,.043)
                    profile(x+dx,y0+dy,.595+rise+rng.random()*.035,.033,.066,['adc446','bbcd60','acc55a'][j%3],6)
            else:
                cc=[['d88932','e69b39'],[],['a34543','bc5554'],['b19b60','bda869'],['b95544','cf7958'],['d79846','d99b42'],['c97c31','e18735']][kind]
                profile(x,y0,.593+rise,.060+(rng.random()-.5)*.009,.108+rng.random()*.014,cc[k%2])
finish('백색 과일 케이스 · 청포도 사과 배 감귤과 가격표')
for side in [-1,1]:
    block(0,side*2.024,.545,.95,.024,.56,'a8a9a3')
for x in [-.43,.465]:block(x,0,1.055,.024,4.07,.032,'b2afa2')
block(-.25,0,1.048,.44,4.07,.055,'47372f')
finish('진열 유리 테두리와 포장 작업대')
# The rear panel sits inside the same guide cell, immediately behind the case.
block(-.52,0,.04,.065,4.01,2.64,'473c34')
front=-.486
face([(front,-1.99,.84),(front,1.99,.84),(front,1.99,2.66),(front,-1.99,2.66)],'ffffff',[(.015,.05),(.99,.05),(.99,.99),(.015,.99)])
for h in [1.31,1.91,2.63]:
    block(-.342,0,h,.335,3.87,.035,'493830')
    block(-.344,0,h-.014,.30,3.82,.014,'ead5a5')
finish('숲 그림 배면과 짙은 목재 선반')

def wrapped(y,z,w,h):
    # Four pointed silk folds converge behind two looped ends and a hanging tassel.
    x=-.31;front=-.194
    edge=[(-.42,0),(.42,0),(.50,.10),(.49,.90),(.39,1),(-.39,1),(-.49,.90),(-.50,.10)]
    back=[(x-.10,y+dy*w,z+dz*h) for dy,dz in edge]
    rim=[(front-.016,y+dy*w,z+dz*h) for dy,dz in edge]
    face(back[::-1],'4d3036')
    for i in range(8):
        j=(i+1)%8
        face([back[i],back[j],rim[j],rim[i]],'603f45')
        face([rim[i],rim[j],(front+.004,y,z+h*.49)],['57333a','75494e','653c42','82585a','785154','674147','754c52','674248'][i])
    for sign in [-1,1]:
        for k in range(3):
            dy=sign*(.23+k*.07)
            face([(front-.011,y+dy*w,z+h*.98),(front-.008,y+(dy+.024)*w,z+h*.96),
                  (front+.017,y+sign*.028*w,z+h*.52)],'896163' if k==1 else '724a4e')
    for dy,dz,c in [(-1,0,'775256'),(1,0,'634145'),(-1,1,'825b5c'),(1,1,'745052')]:
        face([(front,y+dy*w*.48,z+.015+dz*(h-.03)),(front+.012,y+dy*w*.30,z+h*.5),
              (front+.027,y,z+h*.48),(front+.003,y+dy*w*.42,z+h*(.14+.68*dz))],c)
    for sign in [-1,1]:
        face([(front+.028,y,z+h*.49),(front+.043,y+sign*w*.14,z+h*.62),
              (front+.035,y+sign*w*.20,z+h*.57),(front+.029,y+sign*w*.13,z+h*.49)],'947072')
    block(front+.032,y,z+h*.40,.016,.032,.063,'9c7f58')
    block(front+.035,y,z+h*.24,.016,.016,h*.16,'d1af78')
for y in [-1.05,0,1.05]:wrapped(y,1.345,.49,.44)
finish('선반 중앙 · 자주색 보자기와 술 장식')
for i,(y,w,h,c) in enumerate([(-1.45,.34,.25,'806041'),(-1.09,.41,.33,'b58b50'),(-.64,.39,.39,'603f3c'),(-.20,.46,.32,'67413d'),(.28,.37,.42,'aa8150'),(.76,.41,.36,'69453e'),(1.22,.39,.31,'a38557')]):
    block(-.34,y,1.945,.19,w,h,c)
    block(-.241,y-w*.18,1.948,.008,.023,h-.006,'473431')
    block(-.241,y,1.945+h*.63,.009,w,.018,'523c34')
    block(-.239,y+w*.14,1.945+h*.42,.009,w*.24,.013,'c3ab7a')
finish('상단 · 리본을 두른 선물 상자와 포장')
for bank in [-1.57,-.55,.49,1.55]:
    for k in range(3):
        y=bank+(k-1)*.10
        profile(-.30,y,1.344,.037,.15,['8b8b6b','4c5046','9c9377'][k],8)
        block(-.295,y,1.49,.049,.049,.043,'796c56')
finish('보자기 사이에 놓인 소형 병')
face([(.465,-2.01,.548),(.465,2.01,.548),(.465,2.01,1.054),(.465,-2.01,1.054)],'ffffff')
face([(-.03,-2.01,1.054),(.465,-2.01,1.054),(.465,2.01,1.054),(-.03,2.01,1.054)],'ffffff')
finish('케이스 유리')
glass=bpy.data.materials.new('무색 쇼케이스 유리');glass.use_nodes=True
shader=glass.node_tree.nodes['Principled BSDF']
shader.inputs['Base Color'].default_value=(.77,.86,.86,1)
shader.inputs['Alpha'].default_value=.10
bpy.data.objects['케이스 유리'].data.materials[0]=glass
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'counter.blend'),compress=True)
