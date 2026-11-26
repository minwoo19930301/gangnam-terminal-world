"""Gangnam fresh-food island. Dimensions are fitted to the existing game counter."""
from pathlib import Path
from math import pi, cos, sin, hypot
import random
import bpy
import bmesh

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
coll=bpy.data.collections.new('MarketProduceIsland')
bpy.context.scene.collection.children.link(coll)
rng=random.Random(228)
verts=[]; faces=[]; colors=[]

def face(points,colour):
    start=len(verts)
    verts.extend(points)
    faces.append(tuple(range(start,start+len(points))))
    colors.append(colour)

def finish(name,smooth=False):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces); mesh.update()
    attr=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for p,c in zip(mesh.polygons,colors):
        rgb=tuple(int(c[i:i+2],16)/255 for i in (0,2,4))
        for i in p.loop_indices:attr.data[i].color_srgb=(*rgb,1)
    if smooth:
        bm=bmesh.new();bm.from_mesh(mesh)
        bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
        for polygon in bm.faces:polygon.smooth=True
        bm.to_mesh(mesh);bm.free()
    obj=bpy.data.objects.new(name,mesh);coll.objects.link(obj)
    faces.clear();verts.clear();colors.clear()

def perimeter(scale=1):
    return [(x*scale,y*scale) for x,y in [(-.76,-.675),(.76,-.675),(1,-.44),(1,.44),(.76,.675),(-.76,.675),(-1,.44),(-1,-.44)]]

def band(profile):
    for (s,z,col),(s2,z2,_) in zip(profile,profile[1:]):
        a,b=perimeter(s),perimeter(s2)
        for i in range(8):
            j=(i+1)%8
            face([(*a[i],z),(*a[j],z),(*b[j],z2),(*b[i],z2)],col)
    s,z,_=profile[-1]
    face([(*p,z) for p in perimeter(s)],'382719')

band([(.87,.018,'35271f'),(.87,.11,'5f4331'),(.96,.138,'956941'),(.98,.164,'684a34'),
      (.955,.19,'70503a'),(.955,.643,'523627'),(.995,.665,'966f46'),(1,.683,'63442d'),
      (1,.701,'b79057'),(.977,.711,'422f24')])
finish('팔각 월넛 진열대와 층진 몰딩')
# Raised brass rail and its floor shoes follow the clipped corners.
def rod(a,b,r,col,n=8):
    from mathutils import Vector
    a,b=Vector(a),Vector(b); axis=(b-a).normalized()
    u=axis.cross(Vector((0,0,1)) if abs(axis.z)<.9 else Vector((0,1,0))).normalized()
    v=axis.cross(u)
    ring=[r*(u*cos(2*pi*i/n)+v*sin(2*pi*i/n)) for i in range(n)]
    for i,p in enumerate(ring):
        q=ring[(i+1)%n];face([a+p,a+q,b+q,b+p],col)
    face([b+p for p in ring],col)
a=perimeter(1)
for i,(x,y) in enumerate(a):
    x2,y2=a[(i+1)%8]
    rod((x,y,.093),(x2,y2,.093),.014,'b09359')
    rod((x,y,.02),(x,y,.142),.019,'b29358')
    rod((x,y,.012),(x,y,.036),.031,'8d703d')
finish('모서리를 감싸는 황동 발받침')
# Square framed, marquetry-like botanical panels repeat on every face.
a=perimeter(.955)
for i,(x,y) in enumerate(a):
    x2,y2=a[(i+1)%8]; dx,dy=x2-x,y2-y; length=hypot(dx,dy)
    ax,ay=dx/length,dy/length
    def panel(t,h,depth):
        return (x+ax*t+ay*depth,y+ay*t-ax*depth,h)
    count=max(1,round(length/.45))
    for j in range(count):
        mid=length*(j+.5)/count; half=length/count*.465
        def frame(width,h,d):return [panel(mid+t,.416+v,d) for t,v in [(-width,-h),(width,-h),(width,h),(-width,h)]]
        last=frame(half,.207,.002)
        for w,h,d,c in [(half-.012,.195,.012,'ad7d4a'),(half-.024,.183,.014,'61432a'),(half-.031,.175,.007,'8e6746')]:
            ring=frame(w,h,d)
            for k in range(4):face([last[k],last[(k+1)%4],ring[(k+1)%4],ring[k]],c)
            last=ring
        face(last,'75543b')
        for angle in range(8):
            theta=angle*pi/4
            shape=[]
            for rad,tan in [(0,0),(.52,.19),(.94,0),(.52,-.19)]:
                st=rad*cos(theta)-tan*sin(theta);sz=rad*sin(theta)+tan*cos(theta)
                shape.append(panel(mid+st*(half-.042),.416+sz*.15,.008))
            face(shape,'886849' if angle%2 else '584331')
finish('패널 액자와 목재 꽃잎 상감')
# Low stepped produce banks: apples have a cupped crown, pears taper, citrus is round.
palettes=[('apple',['ab2835','be3440','9c2130','c4433e']),('pear',['c0aa47','c6ae53','b1ad4d']),
          ('citrus',['e59c31','dd8028','ebad3c']),('plum',['694460','794d6d','513853'])]
for bank,(kind,palette) in enumerate(palettes):
    for layer in range(4):
        for row in range(18-layer):
            for col in range(4-layer):
                if layer<3 and 0<row<17-layer and 0<col<3-layer:continue
                x=-.84+row*.097+layer*.0485+rng.uniform(-.007,.007)
                yy=-.57+bank*.31+col*.082+layer*.041+rng.uniform(-.009,.009)
                if abs(x)>.81 and abs(yy)>.38:continue
                z=.747+layer*.069
                radius=rng.uniform(.043,.052)
                if kind=='pear':profile=[(.26,-.85),(.90,-.55),(1.04,-.05),(.75,.63),(.38,1.03),(.16,1.32)]
                elif kind=='apple':profile=[(.24,-.73),(.79,-.60),(1.03,-.06),(.95,.48),(.66,.78),(.20,.60)]
                else:profile=[(.22,-.88),(.84,-.56),(1,.03),(.81,.62),(.22,.91)]
                color=rng.choice(palette);twist=rng.random()*2*pi;n=7
                rings=[[(x+radius*r*cos(twist+2*pi*k/n),yy+radius*r*sin(twist+2*pi*k/n),z+radius*h) for k in range(n)] for r,h in profile]
                for low,high in zip(rings,rings[1:]):
                    for k in range(n):face([low[k],low[(k+1)%n],high[(k+1)%n],high[k]],color)
                face(rings[-1],color)
                if kind in ('apple','pear') and layer==3:
                    zz=rings[-1][0][2];rod((x,yy,zz),(x+.006,yy+.001,zz+.016),.0021,'564331',4)
    finish(['붉은 사과','연둣빛 배','황금빛 감귤','자두'][bank],smooth=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'fruit-island.blend'),compress=True)
