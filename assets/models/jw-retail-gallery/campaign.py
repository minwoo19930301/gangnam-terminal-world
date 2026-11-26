"""Render the original jewellery still life shown on the gallery's portrait displays."""
from math import cos, sin, pi, tau
from pathlib import Path
import bpy
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
def surface(name,rgb,metal,roughness):
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    bsdf=mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=(*rgb,1)
    bsdf.inputs['Metallic'].default_value=metal
    bsdf.inputs['Roughness'].default_value=roughness
    return mat,bsdf

cloth,bsdf=surface('Petrol silk',(.007,.102,.146),.10,.30)
bsdf.inputs['Sheen Weight'].default_value=.55
bsdf.inputs['Sheen Tint'].default_value=(.12,.30,.40,1)
bsdf.inputs['Anisotropic'].default_value=.40
pearl,p=surface('Nacre',(.92,.84,.75),.25,.16)
p.inputs['Coat Weight'].default_value=.45
p.inputs['Thin Film Thickness'].default_value=340
gold,g=surface('Polished warm gold',(.82,.57,.235),.92,.145)
jewel,g=surface('Blue-green stone',(.003,.19,.25),.27,.09)
g.inputs['Coat Weight'].default_value=.76

def height(x,y):
    return .060*sin(9*x-2*y+.64*sin(4*y))+.025*cos(15*x+3*y)+.025*sin(3.5*y+x)+.032*(x*x+y*y)
nx,ny=119,143;verts=[];faces=[]
for iy in range(ny):
    y=-1.4+2.8*iy/(ny-1)
    for ix in range(nx):
        x=-1.15+2.3*ix/(nx-1)
        verts.append((x,y,height(x,y)))
        if ix and iy:
            i=iy*nx+ix;faces.append((i-nx-1,i-nx,i,i-1))
mesh=bpy.data.meshes.new('Diagonal silk folds');mesh.from_pydata(verts,[],faces);mesh.materials.append(cloth)
for poly in mesh.polygons:poly.use_smooth=True
fabric=bpy.data.objects.new('Folded silk',mesh);scene.collection.objects.link(fabric)
def sphere(name,at,size,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=at)
    obj=bpy.context.object;obj.name=name;obj.scale=size;obj.data.materials.append(mat)
    for poly in obj.data.polygons:poly.use_smooth=True
    return obj

def path(name,coords,r,mat):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.bevel_resolution=3;curve.bevel_depth=r
    s=curve.splines.new('POLY');s.points.add(len(coords)-1)
    for p,coord in zip(s.points,coords):p.co=(*coord,1)
    obj=bpy.data.objects.new(name,curve);obj.data.materials.append(mat);scene.collection.objects.link(obj)

# A single strand is draped in an open U, with a fluted gold pendant and an oval stone.
coords=[]
for i in range(71):
    t=i/70*pi
    x=-.03-.51*cos(t)+.14*sin(2*t);y=.77-1.17*sin(t)+.13*cos(t)
    r=.014+.008*sin(t)
    z=height(x,y)+r+.006
    coords.append((x,y,z))
    if i%2==0:sphere('Cultured pearl',(x,y,z),(r,r*.96,r*1.03),pearl)
path('Fine gold chain',coords,.0057,gold)
ix=min(range(len(coords)),key=lambda i:coords[i][1]);x,y,z=coords[ix]
for j in range(3):
    yy=y-j*.026
    ring=[(x+.019*cos(k*tau/30),yy+.029*sin(k*tau/30),height(x,yy)+.025) for k in range(31)]
    path('Pendant link',ring,.0053,gold)
cy=y-.193;cz=height(x,cy)+.028
for r in (.095,.101):
    ring=[(x+r*cos(j*tau/80),cy+r*1.26*sin(j*tau/80),cz+.003*cos(j*tau/80)) for j in range(81)]
    path('Double gold bezel',ring,.009,gold)
for i in range(28):
    a=i*tau/28
    xx=x+.088*cos(a);yy=cy+.113*sin(a)
    sphere('Milled bead',(xx,yy,cz+.009),(.0068,.0068,.0068),gold)
# The faceted stone sits above each of its girdle points.
stoneVerts=[(x,cy,cz-.011)]
for rr,hh in [(1,.008),(.82,.042),(.42,.060)]:
    for i in range(14):
        a=tau*i/14
        stoneVerts.append((x+.080*rr*cos(a),cy+.103*rr*sin(a),cz+hh))
stoneFaces=[tuple(range(29,43))]
for i in range(14):
    j=(i+1)%14;stoneFaces.append((0,1+j,1+i))
    for k in (1,15):stoneFaces.extend([(k+i,k+j,k+14+j),(k+i,k+14+j,k+14+i)])
stoneMesh=bpy.data.meshes.new('Oval cut');stoneMesh.from_pydata(stoneVerts,[],stoneFaces);stoneMesh.materials.append(jewel)
stone=bpy.data.objects.new('Teal stone',stoneMesh);scene.collection.objects.link(stone)
def studio_light(name,xyz,aim,energy,size,color):
    lamp=bpy.data.lights.new(name,'AREA');lamp.shape='DISK';lamp.size=size;lamp.energy=energy;lamp.color=color
    obj=bpy.data.objects.new(name,lamp);scene.collection.objects.link(obj);obj.location=xyz
    obj.rotation_euler=(Vector(aim)-obj.location).to_track_quat('-Z','Y').to_euler()
studio_light('Long softbox',(-1.0,-.62,1.35),(0,0,0),55,1.10,(1,.87,.72))
studio_light('Blue bounce',(.84,.42,.76),(0,-.20,0),38,.84,(.59,.81,1))
studio_light('Jewellery edge',(-.05,1.19,1.05),(0,-.2,0),29,.62,(.96,.97,1))
cam=bpy.data.cameras.new('Editorial portrait');obj=bpy.data.objects.new('Editorial portrait',cam)
scene.collection.objects.link(obj);scene.camera=obj;obj.location=(.17,-.30,2.55)
obj.rotation_euler=(Vector((-.03,0,0))-obj.location).to_track_quat('-Z','Y').to_euler()
cam.type='ORTHO';cam.ortho_scale=1.75
world=bpy.data.worlds.new('Jewellery studio');scene.world=world;world.use_nodes=True
world.node_tree.nodes.get('Background').inputs[0].default_value=(.18,.22,.28,1)
world.node_tree.nodes.get('Background').inputs[1].default_value=.33
scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True
scene.render.resolution_x=384;scene.render.resolution_y=588;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='WEBP';scene.render.image_settings.quality=91
scene.render.filepath=str(Path(__file__).resolve().parent/'pearl-silk.webp')
bpy.ops.render.render(write_still=True)
