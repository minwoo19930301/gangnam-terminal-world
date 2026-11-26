"""Ferragamo Shinsegae Gangnam men's display, based on the operator photograph."""
from pathlib import Path
from math import cos, sin, pi
import bpy
from mathutils import Matrix

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('FerragamoGangnamMens')
bpy.context.scene.collection.children.link(collection)

def finish(obj, name, color):
    obj.name = name
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    collection.objects.link(obj)
    material = bpy.data.materials.get(color)
    if not material:
        material = bpy.data.materials.new(color)
        rgb = [int(color[i:i+2],16)/255 for i in (0,2,4)]
        material.diffuse_color = (*[((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in rgb],1)
    obj.data.materials.append(material)
    return obj

def box(name,x,y,z,w,d,h,color,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    obj=finish(bpy.context.object,name,color)
    obj.dimensions=(w,d,h)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        edge=obj.modifiers.new('Soft edges','BEVEL')
        edge.width,edge.segments=bevel,(2 if bevel>=.02 else 1)
    return obj

from mathutils import Matrix, Vector

def oval(name,x,y,z,w,d,h,color):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=(x,y,z))
    obj=finish(bpy.context.object,name,color)
    obj.scale=(w/2,d/2,h/2)
    for poly in obj.data.polygons:
        poly.use_smooth=True
    return obj

def mesh(name,points,faces,color):
    data=bpy.data.meshes.new(name)
    data.from_pydata(points,[],faces)
    obj=bpy.data.objects.new(name,data)
    return finish(obj,name,color)

def label(text,x,y,z,height,color):
    bpy.ops.object.text_add(location=(x,y,z),rotation=(pi/2,0,0))
    obj=bpy.context.object
    obj.data.body=text
    obj.data.align_x='CENTER'
    obj.data.size=height
    obj.data.extrude=.0006
    obj.data.resolution_u=3
    bpy.ops.object.convert(target='MESH')
    return finish(obj,text,color)

def rod(name,a,b,r,color):
    v=Vector(b)-Vector(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=r,depth=v.length,location=(Vector(a)+Vector(b))/2)
    obj=finish(bpy.context.object,name,color)
    obj.rotation_euler=v.to_track_quat('Z','Y').to_euler()
    return obj

import random
rng=random.Random(610)

stone='E2D7C8'
box('Ivory plaster left wall',-1.80,.15,1.49,2.70,.18,2.98,'F3ECDF')
box('Dark metal surround',1.24,.12,1.50,3.05,.16,3.00,'453D36')
box('Veined stone tablet',1.24,.025,1.50,2.985,.06,2.93,stone)
# Narrow ribbons are editable, following the nearly upright brown and gold veins.
for i in range(63):
    cluster=rng.choice([-.02,.34,.90,1.56,2.27]);start=cluster+rng.uniform(-.18,.18);low=rng.uniform(.045,2.0);height=rng.uniform(.32,1.65)
    width=rng.uniform(.003,.025);steps=8;pts=[];offset=rng.uniform(-.09,.09)
    for j in range(steps):
        t=j/(steps-1);z=low+t*min(height,2.95-low)
        x=start+.16*t+offset*sin(t*7+i)+.029*sin(t*17+i*.8)
        w=width*(.28+.72*sin(pi*t))
        if -.235<x-w and x+w<2.72:pts.append((x,z,w))
    if len(pts)<2:continue
    pairs=[(x+side*w,-.007-i*.00005,z)for x,z,w in pts for side in [-1,1]]
    mesh('Calcite and ochre vein',pairs,[(j,j+1,j+3,j+2)for j in range(0,len(pairs)-2,2)],rng.choice(['866845','B49564','BEAD90','A68450','EADCC7','D1B78E']))
for x,w in [(-1.80,2.55),(1.24,2.76)]:
    for z in [.57,1.22,1.87,2.5]:
        box('Ivory cantilever shelf',x,-.193,z,w,.38,.042,'F7EEE0',.012)
        box('Warm shelf underside',x,-.346,z-.023,w-.06,.033,.011,'FAE3AF')
def satchel(x,y,z,w,col,short=False):
    height=w*(.58 if short else .75);depth=w*.39
    profile=[(-.49,0),(.49,0),(.5,.18),(.42,.94),(.27,1),(-.28,1),(-.43,.92),(-.5,.14)]
    def ring(v):return [(x+a*w,y+v,z+b*height)for a,b in profile]
    n=len(profile)
    body=mesh('Leather satchel',ring(-depth/2)+ring(depth/2),[tuple(range(n)),tuple(reversed(range(n,n*2)))]+[(i,i+n,(i+1)%n+n,(i+1)%n)for i in range(n)],col)
    bevel=body.modifiers.new('Leather piping radius','BEVEL');bevel.width=.012;bevel.segments=2
    for v in [-depth*.38,depth*.38]:
        chain=[(x+.228*w*cos(pi*i/10),y+v,z+height+.33*w*sin(pi*i/10))for i in range(11)]
        for a,b in zip(chain,chain[1:]):rod('Curved leather handle',a,b,.009,col)
    front=y-depth/2-.002
    piping={'373536':'504B47','35323C':'49434E','625D45':'77715D','857653':'9B8C6A','30333B':'444750','332E2E':'4B413E','555337':'6B694A'}[col]
    for side in [-1,1]:
        points=[(x+side*.47*w,front,z+.025),(x+side*.47*w,front,z+.18*height),(x+side*.40*w,front,z+.88*height)]
        for a,b in zip(points,points[1:]):rod('Piped leather seam',a,b,.0035,piping)
        rod('Handle anchor',(x+side*.22*w,front,z+height*.88),(x+side*.24*w,front,z+height),.009,piping)
    if short:
        rod('Zipped top',(x-.36*w,y,z+height+.004),(x+.35*w,y,z+height+.004),.0028,'B0A58A')
        rod('Leather zipper pull',(x+.34*w,y,z+height+.01),(x+.40*w,front,z+height*.90),.006,col)
    else:
        # The foreground satchel has an envelope seam and a small central clasp.
        for side in [-1,1]:rod('Flap stitching',(x+side*.40*w,front,z+height*.88),(x,front-.001,z+height*.70),.0025,piping)
    box('Brass clasp',x,front-.004,z+height*.72,.028,.009,.013,'C3AD78')
def shoe(x,y,z,w,col):
    points=[(-.42,-.23),(.25,-.31),(.49,-.17),(.5,.05),(.35,.23),(-.42,.21),(-.5,.10),(-.5,-.12)]
    for base,h,scale,tone in [(0,.045,1,'332E2B'),(.043,.058,.96,col)]:
        n=len(points)
        rings=[(x+a*w*scale,y+b*w*scale,z+base+dh)for dh in [0,h]for a,b in points]
        mesh('Leather shoe sole' if not base else 'Loafer upper',rings,[tuple(reversed(range(n))),tuple(range(n,n*2))]+[(k,(k+1)%n,(k+1)%n+n,k+n)for k in range(n)],tone)
    oval('Loafer vamp',x-.05*w,y,z+.095,w*.69,w*.44,.10,col)
    box('Metal bit',x-.02*w,y-.06*w,z+.141,.055,.017,.009,'AA996F',.003)
for row,z in enumerate([.595,1.245,1.895,2.525]):
    for j,x in enumerate([-2.39,-1.22,.60,1.84]):
        if (row+j)%5==2:shoe(x,-.18,z,.40,'393337')
        else:satchel(x,-.19,z,.36+(.09 if (row+j)%3==1 else 0),['373536','35323C','625D45','857653','30333B'][(row*2+j)%5],row==3)
# Olive rug, with the interrupted cream loop visible beside the display table.
box('Sage wool rug',-.46,-1.70,.021,4.30,2.65,.025,'9A9C75',.012)
curve=[(-2.49,-2.92),(-1.94,-2.71),(-1.58,-2.51),(-1.47,-2.32),(-1.60,-2.12),(-1.47,-1.85),(-1.08,-1.65),(-.51,-1.39)]
pts=[(x+d,y,.035)for x,y in curve for d in [-.062,.062]]
mesh('Ivory woven curve',pts,[(j,j+1,j+3,j+2)for j in range(0,len(pts)-2,2)],'DED8C3')
for x,y,z,w,d in [(1.01,-2.13,.93,.64,.69),(1.72,-2.45,.72,.69,.69),(2.18,-1.75,1.10,.72,.63)]:
    box('Oxblood display pedestal',x,y,z/2,w,d,z,'73383C',.012)
for x,y,z,col in [(1.72,-2.45,.72,'332E2E'),(2.18,-1.75,1.10,'555337')]:
    satchel(x,y,z,.49,col)
shoe(1.01,-2.13,.93,.43,'2F2B2C')
for x in [-1.94,-.55]:
    for y in [-2.23,-1.28]:box('Bronzed vitrine upright',x,y,.54,.034,.035,1.01,'706455')
for z in [.12,.51,1.02]:
    for y in [-2.23,-1.28]:box('Metal frame long rail',-1.245,y,z,1.43,.035,.039,'796E5D')
    for x in [-1.94,-.55]:box('Metal frame side rail',x,-1.755,z,.035,.95,.039,'796E5D')
for z in [.15,.52]:
    box('Ivory vitrine tray',-1.245,-1.755,z,1.35,.89,.028,'E6DDD0',.01)
for n in range(6):
    x=-1.68+n*.17
    box('Folded leather small goods',x,-1.77,.555,.14,.23,.027,['615753','34463F','473E38','8B6A4B'][n%4],.01)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'display.blend'),compress=True)
