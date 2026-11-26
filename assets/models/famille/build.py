"""Create the editable Famille Station gallery clock and Wafille customer furnishings."""
from pathlib import Path
from math import cos, sin, tau, pi
import bpy
from mathutils import Vector
import runpy

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)

def material(name, rgb):
    m=bpy.data.materials.new(name)
    vals=[(rgb >> shift & 255)/255 for shift in (16,8,0)]
    m.diffuse_color=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in vals]+[1]
    return m

mint=material("Mint enamel",0xb0d7cc)
seat=material("Mint upholstery",0xa8c7bb)
oak=material("Walnut cabinet",0x7a503b)
iron=material("Bronze black",0x332f2b)
rim=material("Antique brass",0xa68f6c)
steel=material("Brushed steel",0xb3b6ad)
ivory=material("Clock enamel",0xeeeadd)
waffle=material("Golden waffle",0xd09a62)
crust=material("Baked edge",0xb57646)
red=material("Menu board red",0xad4841)
pink=material("Blush",0xe4bab0)

def start(name, origin):
    global group,offset
    group=bpy.data.collections.new(name)
    group["fixture"]=True
    group["origin"]=list(origin)
    offset=Vector(origin)
    bpy.context.scene.collection.children.link(group)

def part(obj,name,mat):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    group.objects.link(obj)
    obj.name=name
    obj.location+=offset
    obj.data.materials.append(mat)
    return obj

def box(name,p,size,mat,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=p)
    obj=part(bpy.context.object,name,mat)
    for vertex in obj.data.vertices:
        for i in range(3): vertex.co[i]*=size[i]
    if bevel:
        mod=obj.modifiers.new("Rounded edge",'BEVEL')
        mod.width,mod.segments=bevel,2
    return obj

def rod(name,a,b,r,mat,sides=8):
    a,b=Vector(a),Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(vertices=sides,radius=r,depth=(b-a).length,location=(a+b)/2)
    obj=part(bpy.context.object,name,mat)
    obj.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return obj

start('GalleryClock',(0,0,0))
box("Clock housing",(0,0,0),(.26,.84,.90),iron,.026)
box("Moulded upper cap",(0,0,.46),(.31,.88,.045),rim,.01)
box("Mounting arm",(0,.77,.27),(.12,.74,.095),iron)
box("Mounting plate",(0,1.09,.20),(.22,.065,.46),iron)
for face in [-1,1]:
    rod("Outside bezel",(.14*face,0,0),(.165*face,0,0),.385,rim,40)
    rod("Dial",(.165*face,0,0),(.17*face,0,0),.355,ivory,40)
    for i in range(12):
        a=i*tau/12
        rod("Hour baton",(.175*face,sin(a)*.266,cos(a)*.266),
            (.175*face,sin(a)*.318,cos(a)*.318),.011,iron,6)
    # A fixed dial, independent of virtual or local time.
    for angle,length,radius in [(pi/3,.26,.012),(-pi/3,.18,.018)]:
        rod("Clock hand",(.183*face,0,0),(.183*face,face*sin(angle)*length,cos(angle)*length),radius,iron)
    rod("Arbor",(.17*face,0,0),(.195*face,0,0),.026,iron)

start('Wafille',(5,0,0))
# Looking from the concourse, the service counter is on the left and seating on the right.
box("Counter plinth",(-.9,.55,.055),(2.43,.8,.11),oak)
box("Mint counter front",(-.9,.55,.55),(2.43,.80,.91),mint,.018)
box("Counter top",(-.9,.55,1.035),(2.48,.86,.075),ivory,.012)
for x in [-1.93,-1.37]:
    for y in [.27,.76]:rod("Case upright",(x,y,1.08),(x,y,1.48),.014,rim)
for y in [.27,.76]:
    box("Case rails",(-1.65,y,1.48),(.59,.03,.026),rim)
box("Case base",(-1.65,.515,1.10),(.58,.54,.055),steel)
for n in range(4):
    x=-1.82+(n%2)*.23;y=.38+(n//2)*.23
    box("Liege waffle",(x,y,1.157),(.165,.165,.069),waffle,.022)
    for k in [-.045,0,.045]:
        box("Waffle lattice",(x+k,y,1.196),(.010,.14,.008),crust)
        box("Waffle lattice",(x,y+k,1.196),(.14,.010,.008),crust)
for x in [-1.1,-.8,-.5]:
    box("Counter menu",(x,.26,1.205),(.22,.025,.28),red,.008)
    box("Menu paper",(x,.244,1.21),(.188,.008,.236),ivory)
    for i in range(4):box("Menu lines",(x,.238,1.16+i*.027),(.145,.005,.008),oak)
box("Banquette base",(2.32,.84,.21),(.44,2.65,.42),oak)
box("Banquette seat",(2.29,.84,.48),(.51,2.68,.16),seat,.035)
for j in range(9):
    box("Vertical backrest channel",(2.50,-.34+j*.29,.76),(.12,.284,.59),seat,.025)
for y in [.03,1.32]:
    box("Mint table",(1.70,y,.734),(.74,.76,.060),mint,.018)
    rod("Table column",(1.70,y,.045),(1.70,y,.713),.042,steel)
    box("Table foot",(1.70,y,.03),(.44,.42,.042),steel,.006)
    box("Seat",(1.13,y,.46),(.38,.41,.066),seat,.022)
    box("Chair back",(.955,y,.70),(.06,.38,.40),seat,.030)
    for dx in [-.145,.145]:
        for dy in [-.155,.155]:
            rod("Chromed chair leg",(1.13+dx*1.21,y+dy*1.14,0),(1.13+dx,y+dy,.43),.016,steel)
# Framed waffle prints recall the cafe's gallery wall. Original artwork is not copied.
for j in range(3):
    y=-.11+j*.87
    box("Walnut picture frame",(2.54,y,2.16),(.09,.62,.80),oak)
    box("Print stock",(2.487,y,2.16),(.012,.535,.72),ivory if j%2 else pink)
    disk=rod("Waffle illustration",(2.469,y,2.16),(2.48,y,2.16),.15,waffle,16)
    for k in [-.08,0,.08]:
        box("Illustration grid",(2.462,y+k,2.16),(.007,.012,.215),crust)
        box("Illustration grid",(2.462,y,2.16+k),(.007,.215,.012),crust)

# Preserve a customer aisle between the counter's right end and the nearest dining chair.
for obj in group.objects:
    if obj.location.x-offset.x < 0:
        obj.location.x -= .24

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'gallery.blend'),compress=True)
runpy.run_path(str(directory/'export.py'),run_name='__main__')
