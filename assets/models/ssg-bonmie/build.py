"""Editable pastry trays for the existing BO&MIE Gangnam sales counter."""
from pathlib import Path
from math import cos,sin,pi
import random
import bpy
OUT=Path(__file__).resolve().parent
rng=random.Random(20250228)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('BOandMIE_B1');bpy.context.scene.collection.children.link(collection)
material=bpy.data.materials.new('구움색과 단면');material.use_nodes=True
node=material.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='COLOR_0'
material.node_tree.links.new(node.outputs['Color'],material.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
verts=[];faces=[];colors=[]
def face(v,color):
    n=len(verts);verts.extend(v);faces.append(tuple(range(n,n+len(v))));colors.append(color)
def store(name):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    attr=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for polygon,color in zip(mesh.polygons,colors):
        rgb=[int(color[i:i+2],16)/255 for i in (0,2,4)]
        for i in polygon.loop_indices:attr.data[i].color_srgb=(*rgb,1)
    mesh.materials.append(material);obj=bpy.data.objects.new(name,mesh);collection.objects.link(obj)
    verts.clear();faces.clear();colors.clear()
def sweep(rings,tones):
    for j,(a,b) in enumerate(zip(rings,rings[1:])):
        for k in range(len(a)):
            l=(k+1)%len(a);face([a[k],a[l],b[l],b[k]],tones[j%len(tones)])
def tray(x,y,z):
    rings=[]
    for w,d,h in [(.42,.32,-z),(.42,.32,0),(.45,.35,0),(.46,.36,.014),(.445,.345,.026),(.424,.324,.017)]:
        rings.append([(x+a*w,y+b*d,z+h) for a,b in [(-.94,-1),(.94,-1),(1,-.92),(1,.92),(.94,1),(-.94,1),(-1,.92),(-1,-.92)]])
    sweep(rings,['b49a73','e2c99d','ac8e64']);face(rings[-1],'e6d7ba')
def ringbread(x,y,z,seed):
    rings=[]
    for r,h in [(.040,.015),(.106,.012),(.128,.048),(.107,.089),(.068,.102),(.035,.064),(.040,.015)]:
        row=[]
        for i in range(16):
            a=2*pi*i/16;n=1+.047*cos(5*a+seed)
            row.append((x+r*n*cos(a),y+r*n*sin(a)*.88,z+h*(1+.045*sin(a*4+seed))))
        rings.append(row)
    sweep(rings,['a46a33','bc8045','ce9155','dcab6a','e3bd83','ab703a'])
    for i in range(9):
        a=2*pi*i/9+seed;r=.082+rng.uniform(-.007,.007);xx=x+r*cos(a);yy=y+.88*r*sin(a)
        face([(xx-.005,yy-.004,z+.100),(xx+.006,yy-.004,z+.100),(xx+.004,yy+.005,z+.100),(xx-.005,yy+.002,z+.100)],'694329')
def cookie(x,y,z,flavour):
    rings=[]
    for r,h in [(.066,.012),(.079,.14),(.067,.151),(.059,.132)]:
        rings.append([(x+r*cos(i*pi/6),y+r*sin(i*pi/6),z+h) for i in range(12)])
    sweep(rings,['9f6038','d49a5b','754e35']);face(rings[-1],['5a3429','90934f','b78359'][flavour])
    for j in range(2):
        h=.046+j*.044;r=.069+j*.005
        for i in range(10):
            a=2*pi*(i+.4*j)/10
            face([(x+(r+.002)*cos(a-.055),y+(r+.002)*sin(a-.055),z+h),
                  (x+(r+.002)*cos(a+.065),y+(r+.002)*sin(a+.065),z+h+.004),
                  (x+(r+.004)*cos(a+.025),y+(r+.004)*sin(a+.025),z+h+.014)],'5b3728')
    for i in range(9):
        t=rng.random()*2*pi;r=.052*rng.random()**.5;a=x+r*cos(t);b=y+r*sin(t)
        face([(a-.010,b,z+.134),(a,b-.009,z+.135),(a+.010,b,z+.134),(a,b+.006,z+.140)],['c2ac69','766d3d','ded0a2'][i%3])
def levain(x,y,z):
    rings=[]
    for r,h in [(.65,.015),(1,.048),(.94,.096),(.73,.129),(.20,.145)]:
        rings.append([(x+.15*r*cos(i*pi/9),y+.113*r*sin(i*pi/9),z+h) for i in range(18)])
    sweep(rings,['976034','ab723e','bf8d54','b27d47']);face(rings[-1],'c99e63')
    # Deep diagonal scoring exposes a pale crumb directly beneath the brown crust.
    for k in [-1,0,1]:
        dx=.055*k;h=z+.141-abs(k)*.008
        face([(x+dx-.026,y-.055,h-.01),(x+dx+.009,y-.01,h+.002),(x+dx+.032,y+.052,h-.006),(x+dx-.006,y+.006,h+.003)],'ead5a1')
for row in range(3):
    for col in range(5):tray((col-2)*.98,(row-1)*.78,.02+row*.043)
store('빵 진열용 얕은 나무 트레이')
for kind,fn,name in [(0,ringbread,'구운 고리형 비엔누아즈'),(1,cookie,'크림을 채운 쿠키 샷'),(2,levain,'칼집을 낸 르방')]:
    for row in range(3):
        for col in range(5):
            if (col+row)%3!=kind:continue
            for j in range(2):
                for i in range(3):
                    x=(col-2)*.98+(i-1)*.274+rng.uniform(-.009,.009)
                    y=(row-1)*.78+(j-.5)*.295+rng.uniform(-.012,.012);z=.043+row*.043
                    if kind==0:fn(x,y,z,rng.random()*6)
                    elif kind==1:fn(x,y,z,(j+i)%3)
                    else:fn(x,y,z)
    store(name)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='VERTEX'
        area.spaces.active.region_3d.view_distance=6
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'pastries.blend'),compress=True)
