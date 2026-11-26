"""HAZ bakery bags, cut bagels and cake stands, based on the operator photograph."""
from pathlib import Path
from math import cos, sin, pi
import bpy
from mathutils import Matrix

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('HazBakeryCounter')
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

def bag(x,y,w,h,blue,floral=False):
    d=.135
    box('Folded paper carrier',x,y,h/2,w,d,h,'376CB8' if blue else 'FFF5E4',.008)
    ink='FCF1D9' if blue else '202128'
    if not blue:
        for dy in [-d*.37,d*.37]:
            points=[(x-w*.25,y+dy,h-.015),(x-w*.21,y+dy,h+.095),(x+w*.2,y+dy,h+.095),(x+w*.25,y+dy,h-.015)]
            for a,b in zip(points,points[1:]):rod('Paper handle',a,b,.009,'EAE1CA')
    label('HAZ',x,y-d/2-.002,h-.11,.12 if blue else .105,ink)
    if not blue:label('BAKERY',x,y-d/2-.002,h-.225,.085,ink)
    if floral:
        for j in range(4):
            for i in range(6):
                u=x+(i-2.5)*w/6;z=.035+j*(h-.07)/4
                if abs(u-x)<.13 and .07<z<.29:continue
                for k in range(4):
                    a=k*pi/2
                    px=u+.01*cos(a);pz=z+.008*sin(a);py=y-d/2-.003
                    mesh('Printed indigo petal',[(px-.006,py,pz),(px,py,pz-.004),(px+.006,py,pz),(px,py,pz+.004)],[(0,1,2,3)],'526A99')

def stand(x):
    bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=.146,radius2=.077,depth=.105,location=(x,-.145,.106))
    finish(bpy.context.object,'Cream ceramic pedestal','E7D3A6')
    oval('Glazed ivory plate',x,-.145,.174,.58,.40,.043,'F8EBD0')

def slice_face(name,x,y,z,w,h,depth,color):
    # Flat cut face and curved crown. Rear of the sliced loaf remains rounded.
    outline=[(-w/2,0),(w/2,0)]+[(w/2*cos(i*pi/12),h*.37+h*.63*sin(i*pi/12))for i in range(13)]
    n=len(outline);vertices=[(x+u,y+v,z+q)for v in [0,depth]for u,q in outline]
    return mesh(name,vertices,[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,i+n,(i+1)%n+n,(i+1)%n)for i in range(n)],color)

def sandwich(x,y,berry):
    z=.195;w=.40
    slice_face('Baked bagel crust',x,y,z,w,.27,.13,'DFA860')
    slice_face('Sliced crumb',x,y-.002,z+.014,w-.018,.247,.004,'F5DDAD')
    slice_face('Strawberry cream' if berry else 'Taro cream',x,y-.007,z+.067,w-.04,.177,.005,'FFF0DA' if berry else 'BC9BAC')
    for i in range(29):
        # Visible crumb holes in the cut dough along the base and crown.
        dx=(((i*31)%59)/58-.5)*.32
        dz=(.025+.012*((i*11)%7)/6) if i%2 else (.178+.054*(1-(dx/.19)**2)**.5)
        radius=.0025+.0015*(i%3)
        mesh('Toasted crumb fleck',[(x+dx+radius*cos(k*pi/3),y-.009,z+dz+radius*sin(k*pi/3))for k in range(6)],
             [tuple(range(6))],['DCA573','D6B78D','E8C8A2'][i%3])
    if berry:
        for dx in [-.102,.015,.112]:
            cx=x+dx;cy=y-.014
            contour=[(-.04,.172),(-.036,.191),(-.022,.202),(0,.194),(.022,.200),(.039,.187),(.044,.169),(.034,.135),(.012,.101),(0,.091),(-.014,.103),(-.033,.134)]
            mesh('Strawberry cut through the centre',[(cx+u,cy,z+h)for u,h in contour],[tuple(reversed(range(len(contour))))],'DA5552')
            for i,(sx,sz) in enumerate([(-.022,.085),(.020,.113),(-.012,.157)]):
                oval('Strawberry seed',x+dx+sx,y-.016,z+sz,.005,.002,.009,'F1BF85')
            oval('Pale strawberry core',x+dx,y-.016,z+.139,.036,.006,.079,'F6B6A2')
    else:
        contour=[(-.16,.091),(-.12,.102),(-.067,.095),(.005,.104),(.058,.097),(.12,.104),(.16,.099),
                 (.16,.128),(.103,.131),(.046,.123),(.005,.137),(-.065,.123),(-.125,.133),(-.16,.123)]
        mesh('Dark filling ribbon',[(x+u,y-.013,z+h)for u,h in contour],[tuple(range(len(contour)))],'443238')
        for k in range(14):
            dx=-.138+k*.021
            oval('Pistachio crumb in chocolate',x+dx,y-.015,z+.114+.006*sin(k*1.8),.011,.002,.004,'BFAB79')
        box('Lower cream seam',x,y-.015,z+.079,.29,.008,.011,'F6E4D6',.002)

for x in [-.64,.64]:
    box('Bronze table edge',x,0,-.012,1.276,.77,.058,'B4936A',.025)
    box('Rounded cream sales table',x,0,.012,1.276,.77,.045,'F1DEBE',.033)
    for dx in [-.46,.46]:
        rod('Bronze column foot',(x+dx,0,-.79),(x+dx,0,-.027),.047,'775239')
for x in [-.78,0,.78]:stand(x)
for x,y,w,h,blue,floral in [(-1,.22,.34,.34,False,True),(-.48,.23,.48,.58,False,False),(-.12,.23,.34,.36,True,False),(.43,.21,.4,.43,False,True),(.99,.22,.46,.56,False,False),(-.81,.07,.28,.25,True,False),(.74,.08,.32,.26,True,False)]:bag(x,y,w,h,blue,floral)
sandwich(-.79,-.23,True)
sandwich(.75,-.23,False)
oval('Low sugar red bean bun',-.115,-.13,.266,.32,.24,.16,'A4542C')
oval('Dark bean paste in cut bun',.114,-.199,.252,.21,.13,.112,'603631')
oval('Baked rim on second bun',.13,-.145,.26,.235,.15,.12,'AD6839')
loaf=oval('Glazed elongated loaf',.81,-.289,.236,.43,.112,.097,'A95327')
for k in range(7):
    x=.67+.043*k
    rod('Diagonal score',(x,-.314,.268),(x+.017,-.276,.28),.003,'D58B4C')
for i in range(9):
    a=i*2.4;oval('Toasted sesame',-.115+.037*cos(a),-.13+.025*sin(a),.343,.011,.005,.003,'DBB977')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'display.blend'),compress=True)
