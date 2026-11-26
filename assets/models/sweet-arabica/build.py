"""Model the branch photo's public entrance, counter and coffee equipment."""
from pathlib import Path
from math import cos, sin, pi
import bpy
from mathutils import Matrix

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('ArabicaGangnamFront')
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

def tube(name,points,r,color,closed=False):
    curve=bpy.data.curves.new(name,'CURVE')
    curve.dimensions='3D'
    curve.bevel_depth=r
    curve.bevel_resolution=1
    curve.resolution_u=1
    path=curve.splines.new('POLY')
    path.points.add(len(points)-1)
    for pt,v in zip(path.points,points):
        pt.co=(*v,1)
    path.use_cyclic_u=closed
    obj=bpy.data.objects.new(name,curve)
    collection.objects.link(obj)
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    finish(obj,name,color)

def outline(w,h,r):
    pts=[]
    for cx,cz,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for i in range(11):
            a=(start+i*9)*pi/180
            pts.append((cx+r*cos(a),cz+r*sin(a)))
    return pts

def ring(name,x,y,z,w,h,r,border,d,color):
    outer=outline(w,h,r);inner=outline(w-2*border,h-2*border,max(.004,r-border))
    n=len(outer)
    verts=[(x+u,y+v,z+q) for v,arr in [(-d/2,outer),(-d/2,inner),(d/2,inner),(d/2,outer)] for u,q in arr]
    faces=[]
    for layer in range(4):
        for i in range(n):
            j=(i+1)%n
            faces.append((layer*n+i,layer*n+j,((layer+1)%4)*n+j,((layer+1)%4)*n+i))
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    obj=bpy.data.objects.new(name,mesh)
    finish(obj,name,color)

def cone(name,x,y,z,r1,r2,h,col):
    bpy.ops.mesh.primitive_cone_add(vertices=14,radius1=r1,radius2=r2,depth=h,location=(x,y,z))
    return finish(bpy.context.object,name,col)

def percent(name,x,y,z,size,col):
    tube(name+' slash',[(x-.28*size,y,z-.40*size),(x+.28*size,y,z+.40*size)],.045*size,col)
    for k in [-1,1]:
        tube(name+' circle',[(x-k*.21*size+.13*size*cos(i*pi/16),y,z+k*.22*size+.13*size*sin(i*pi/16)) for i in range(32)],.045*size,col,True)

oak='AA8054';trim='795539';dark='403731';white='F6F5F0';chrome='B9BDBB'
# Local -Y looks out to the public aisle. The oak sidelights flank a deep white reveal.
for side in (-1,1):
    x=side*3.04
    box('Oak window bay',x,.28,1.53,1.33,.50,3.06,oak,.035)
    box('Dark base',x,.255,.075,1.39,.55,.15,dark,.025)
    box('Tall arched sidelight recess',x,.008,1.48,.89,.038,2.45,trim,.16)
    box('Bronze-tinted sidelight',x,-.02,1.47,.74,.024,2.27,'978671',.17)
    ring('Sidelight bead',x,-.046,1.48,.80,2.31,.24,.026,.022,'E5CAB0')
    for dx,span,tone in [(-.23,1.87,'C6B59B'),(-.18,1.94,'D3C2A7'),(.24,1.70,'AE997C')]:
        box('Narrow sidelight reflection',x+dx,-.045,1.53,.014,.007,span,tone)
    percent('Sidelight percent',x,-.07,1.47,.52,'FFF3C6')
    box('Sidelight lower panel',x,-.04,.18,.89,.04,.20,trim,.025)
box('Oak head across entrance',0,.25,3.04,7.51,.57,.53,oak,.035)
box('Upper projecting cornice',0,.23,3.32,7.62,.61,.065,'946B49',.018)
for x,w in [(-2.55,1.9),(0,2.93),(2.55,1.9)]:
    ring('Inset oak sign moulding',x,-.065,3.055,w,.37,.028,.036,.04,trim)
    ring('Bronze inner bead',x,-.087,3.055,w-.092,.27,.014,.012,.015,'CEA57C')
# Three stepped rings define the passage without closing the opening with a polygon.
for y,w,h,r,edge,depth,col in [(.23,4.94,2.82,.43,.22,.44,'DFE0DB'),(.49,4.55,2.45,.37,.085,.13,white),(.62,4.42,2.32,.32,.04,.09,'E1E3E0')]:
    ring('Tubular white entrance reveal',0,y,1.43,w,h,r,edge,depth,col)
for x in [-1.07,1.07]:
    box('Clear pane edge',x,.08,1.43,.012,.015,2.68,'B8D5CB')
    tube('Circular door pull',[(x+.115*cos(i*pi/16),.033,1.37+.115*sin(i*pi/16)) for i in range(32)],.011,chrome,True)
# Letter outlines follow the sign in the branch's straight-on photograph.
percent('Sign percent',-.98,-.117,3.055,.255,'FFFCDF')
for i,letter in enumerate('ΔRΔBICΔ'):
    x=-.68+i*.256
    if letter=='Δ':
        tube('Triangular A',[(x-.091,-.116,2.955),(x,-.116,3.15),(x+.092,-.116,2.955)],.014,'FFFCDF',True)
    else:
        bpy.ops.object.text_add(location=(x,-.12,3.05),rotation=(pi/2,0,0))
        o=bpy.context.object;o.data.body=letter;o.data.align_x='CENTER';o.data.align_y='CENTER';o.data.size=.29
        o.data.resolution_u=4
        bpy.ops.object.convert(target='MESH')
        finish(o,'Sign '+letter,'FFFCDF')
# The photographed white counter has a curved leading edge and a central espresso machine.
width=4.50
curve=[(-width/2+i*width/32,1.59+.30*((i-16)/16)**2) for i in range(33)]
poly=curve+[(width/2,2.30),(-width/2,2.30)]
def counter(name,z,h,shape,color):
    n=len(shape);v=[(x,y,k) for k in (z,z+h) for x,y in shape]
    f=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    m=bpy.data.meshes.new(name);m.from_pydata(v,[],f);finish(bpy.data.objects.new(name,m),name,color)
counter('Curved ivory counter face',.05,.95,poly,'E4E5DF')
counter('White polished counter rim',1,.065,poly,white)
box('Machine dark inset',0,1.94,1.31,1.00,.31,.45,'363735',.04)
box('Espresso machine fascia',0,1.76,1.32,.91,.09,.34,'C8C7C0',.035)
box('White control strip',0,1.697,1.33,.67,.025,.095,'EDECE3',.01)
for i in range(8):
    cone('Stacked demitasse',-.39+i*.11,1.95,1.565,.037,.049,.073,'CCAE82')
for x in [-1.39,1.39]:
    box('Grinder body',x,2.0,1.25,.18,.21,.35,'C8C8C1',.022)
    cone('Bean hopper',x,2.01,1.52,.051,.11,.20,'755A45')
    cone('Grinder cap',x,2.01,1.633,.114,.114,.024,dark)
    box('Countertop cup tray',x*.72,1.74,1.085,.37,.19,.03,chrome,.006)
    for i in [-1,0,1]:cone('Service cup',x*.72+i*.091,1.74,1.146,.031,.043,.09,white)
    # Chemex-inspired pendant forms on the branch designer's published concept.
    tube('Pendant cable',[(x,2.02,2.64),(x,2.02,2.93)],.008,chrome)
    cone('Pendant upper funnel',x,2.02,2.57,.045,.12,.14,white)
    cone('Pendant lower bell',x,2.02,2.41,.15,.044,.18,'E8E6D9')
# Backlit merchandise niches flank the central percent panel in the branch view.
for side in [-1,1]:
    x=side*1.45
    box('Light shelf surround',x,2.77,1.69,1.19,.10,1.16,'CFD0C8',.04)
    box('Warm white shelf interior',x,2.70,1.70,1.09,.04,1.05,'F6F1DF')
    for level in [1.23,1.55,1.88]:
        box('Illuminated shelf edge',x,2.54,level,1.09,.32,.037,'F4F2E9')
        for i in range(5):
            u=x+(i-2)*.183
            if level==1.88:
                cone('Stoneware retail cup',u,2.57,level+.085,.044,.056,.13,'EAE8DF')
            else:
                bag=box('Folded coffee pouch',u,2.59,level+.136,.13,.085,.22,'BC9A70' if i%2 else 'DDD4BF',.012)
                box('Bag seal',u,2.59,level+.249,.115,.055,.018,'957858')
                box('Bag label',u,2.545,level+.13,.062,.008,.07,'F4EFE4')
box('White rear logo panel',0,2.68,1.89,1.17,.11,1.62,'DCDDD7',.03)
percent('Counter backdrop percent',0,2.602,2.08,.60,'FFFFF4')
# Match the existing guide bay's shallower counter depth in the editable source.
fit=Matrix.Diagonal((1,.82,1,1))
bpy.context.view_layer.update()
for obj in collection.objects:
    obj.matrix_world=fit @ obj.matrix_world
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'entrance.blend'),compress=True)
