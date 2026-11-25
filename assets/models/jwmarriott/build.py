"""Build editable hotel fixtures from the HAEAHN and hotel photographs listed in jwmarriott.json."""
import bpy
import math
import runpy
from mathutils import Vector
from pathlib import Path

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)

def material(name, rgb, texture=None, gloss=None):
    mat = bpy.data.materials.new(name)
    def srgb(v):
        s = v / 255
        return s / 12.92 if s <= .04045 else ((s + .055) / 1.055) ** 2.4
    mat.diffuse_color = [srgb((rgb >> n) & 255) for n in [16, 8, 0]] + [1]
    if texture:
        mat["world_texture"] = texture
    if gloss:
        mat["world_gloss"] = gloss
    return mat

bronze = material("Brushed champagne bronze",0xad9677,gloss=.35)
light = material("Warm opal diffuser",0xffe4b7,"emit")
iron = material("Dark bronze frame",0x423b34)
glass = material("Blue curtain glass",0x47758a,gloss=.12)
grey = material("Pewter",0x828989,gloss=.5)
silver = material("Table silver",0xc1beb2,gloss=.6)
oak = material("European oak",0xad8059)
walnut = material("Walnut",0x664a3a)
ivory = material("Ivory upholstery",0xd6c9b5)
piping = material("Upholstery welt",0xb0a290)
porcelain = material("Ivory china",0xeee9db,gloss=.35)
dough = material("Pastry",0xb68355)
berry = material("Rose confection",0xb6605e)
green = material("Pistachio",0x859361)
soil = material("Planter soil",0x473b30)
reed = material("Herb foliage",0x77875b)
stone = material("Pink-grey granite",0xa39384)

def group(key, label, origin):
    global collection, offset
    offset = Vector(origin)
    collection = bpy.data.collections.new(label)
    collection["hotel_asset"] = key
    collection["origin"] = list(origin)
    bpy.context.scene.collection.children.link(collection)

def part(obj, name, mat):
    obj.name = name
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    collection.objects.link(obj)
    obj.location += offset
    obj.data.materials.append(mat)
    return obj

def block(name, p, size, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=p)
    obj = part(bpy.context.object, name, mat)
    for v in obj.data.vertices:
        for i in range(3): v.co[i] *= size[i]
    if bevel:
        mod = obj.modifiers.new("Soft corners","BEVEL")
        mod.width, mod.segments = bevel, 2
    return obj

def tube(name, a, b, radius, mat, sides=8, top=None):
    a,b = Vector(a),Vector(b)
    bpy.ops.mesh.primitive_cone_add(vertices=sides,radius1=radius,radius2=radius if top is None else top,depth=(b-a).length,location=(a+b)/2)
    obj = part(bpy.context.object,name,mat)
    obj.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return obj

def curved_strip(name, lower, upper, depth, mat):
    vertices=[]
    for a,b in zip(lower,upper):
        vertices.extend([(a[0],-depth/2,a[1]),(a[0],depth/2,a[1]),(b[0],depth/2,b[1]),(b[0],-depth/2,b[1])])
    faces=[(3,2,1,0)]
    for i in range(len(lower)-1):
        for j in range(4):
            faces.append((4*i+j,4*i+(j+1)%4,4*i+4+(j+1)%4,4*i+4+j))
    faces.append(tuple(range(len(vertices)-4,len(vertices))))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);collection.objects.link(obj);obj.location=offset;obj.data.materials.append(mat)

# HAEAHN south elevation: the light follows the underside of each bronze arch.
group("canopy","Arrival · rolled bronze arch",(-15,0,0))
curve=[(-3.5*math.cos(i*math.pi/24),2.15*math.sin(i*math.pi/24)) for i in range(25)]
def rise(d): return [(x,z+d) for x,z in curve]
curved_strip("Box rib",rise(-.11),rise(.10),.18,bronze)
curved_strip("Upper flange",rise(.10),rise(.13),.25,grey)
curved_strip("Lower flange",rise(-.14),rise(-.11),.25,bronze)
curved_strip("Continuous lamp",rise(-.158),rise(-.14),.062,light)
for x in [-3.49,3.49]:
    block("Split bearing",(x,0,-.06),(.32,.38,.13),bronze,.014)

# The front bow is wider at its centre. Panels and rails share the curved face.
group("bow","Arrival · bowed blue-glass elevation",(0,0,0))
for i in range(12):
    x0,x1=-6+i,-5+i
    f=lambda x:.85*(1-(x/6)**2)
    d=f((x0+x1)/2)
    angle=math.atan2(f(x1)-f(x0),x1-x0)
    for j in range(6):
        panel=block("Curtain panel",((x0+x1)/2,-d,j*1.88+.925),(1.025,.09,1.83),glass)
        panel.rotation_euler.z=-angle
        rail=block("Spandrel cap",((x0+x1)/2,-d-.085,j*1.88+.025),(1.035,.12,.054),silver)
        rail.rotation_euler.z=-angle
    block("Vertical glazing cap",(x0,-f(x0)-.055,5.60),(.034,.062,11.2),grey)

# The two HAEAHN entrance wings use regular stone courses and groups of four
# small rectangular windows. Build the panel gaps so the reveals are recessed.
group("frontage","Arrival · stone wing and recessed glazing",(0,11,0))
granite = material("Rose grey granite",0x9c9290)
trim = material("Granite course joint",0x8d8381)
dark_window = material("Recessed blue glazing",0x394d57,gloss=.15)
for row in range(7):
    z=row*1.24
    if row in [1,5]:
        for i in range(4):
            x=-3.3+i*1.65
            block("Window lower sill",(x+.825,0,z+.13),(1.65,.19,.25),granite)
            block("Window head",(x+.825,0,z+1.14),(1.65,.19,.18),granite)
            for edge in [-.62,.62]:
                block("Stone jamb",(x+.825+edge,0,z+.65),(.40,.19,.85),granite)
            block("Recessed pane",(x+.825,.075,z+.65),(.86,.05,.81),dark_window)
    else:
        block("Granite band",(0,0,z+.605),(6.6,.19,1.21),granite)
    block("Horizontal stone joint",(0,-.097,z+.008),(6.6,.012,.016),trim)

group("booth","Margaux Grill · booth and opal lantern",(12,0,0))
block("Oak plinth",(0,0,.20),(2.38,.85,.40),oak,.035)
block("Seat cushion",(0,-.08,.49),(2.30,.68,.19),ivory,.06)
block("Upholstered back",(0,.30,.86),(2.30,.21,.77),ivory,.065)
for x in [-1.15,1.15]:
    block("Timber end return",(x,0,.59),(.11,.86,1.15),oak,.018)
block("Seat seam",(0,-.420,.47),(2.15,.012,.012),piping)
block("Back seam",(0,.187,.88),(.012,.01,.56),piping)
tube("Lamp foot",(1.12,0,1.17),(1.12,0,1.21),.16,bronze,16)
tube("Lamp stem",(1.12,0,1.21),(1.12,0,1.31),.035,bronze)
tube("Glass shade",(1.12,0,1.31),(1.12,0,1.61),.105,light,18,.085)
for i in range(6):
    a=i*math.tau/6
    tube("Lamp cage",(1.12+.105*math.cos(a),.105*math.sin(a),1.31),(1.12+.086*math.cos(a),.086*math.sin(a),1.61),.007,bronze,5)
tube("Lamp cap",(1.12,0,1.61),(1.12,0,1.635),.089,bronze,16)

group("display","Margaux Grill · framed tableware exhibit",(18,0,0))
w,h=3.6,2.05
block("Dark case body",(0,.06,h/2),(w,.24,h),iron)
block("Pale illuminated backing",(0,-.074,h/2),(w-.09,.035,h-.1),ivory)
for i in range(11):
    block("Case upright",(-w/2+i*w/10,-.11,h/2),(.027,.13,h),iron)
for j in range(7):
    block("Case shelf",(0,-.11,j*h/6),(w,.13,.027),iron)
for i in range(10):
    for j in range(6):
        x,z=-w/2+(i+.5)*w/10,(j+.5)*h/6
        # Abstract silhouettes of the restaurant's exhibited table cutlery.
        block("Mount",(x,-.12,z-.05),(.013,.022,.09),grey)
        block("Tableware",(x,-.14,z+.018),(.20,.018,.027),silver if (i+j)%3 else walnut)

group("tea","The Lounge · tea service",(23,0,0))
for z,r in [(.045,.205),(.226,.175),(.407,.14)]:
    tube("Porcelain plate",(0,0,z-.009),(0,0,z+.006),r,porcelain,24,r+.007)
    for k in range(4):
        a=k*math.pi/2+.3
        x,y=r*.58*math.cos(a),r*.58*math.sin(a)
        tube("Tea cake",(x,y,z+.007),(x,y,z+.052),.036,dough,10)
        tube("Glaze",(x,y,z+.052),(x,y,z+.060),.036,berry if k%2 else green,10,.033)
tube("Central stem",(0,0,0),(0,0,.49),.012,bronze)
for i in range(14):
    a=i*math.tau/14;b=(i+1)*math.tau/14
    tube("Handle",(.043*math.cos(a),0,.525+.043*math.sin(a)),(.043*math.cos(b),0,.525+.043*math.sin(b)),.006,bronze,5)
for x in [-.31,.32]:
    tube("Saucer",(x,-.10,0),(x,-.10,.014),.095,porcelain,16)
    tube("Tea cup",(x,-.10,.014),(x,-.10,.105),.040,porcelain,16,.066)
    tube("Tea surface",(x,-.10,.105),(x,-.10,.106),.059,walnut,16)

group("herbs","JW Garden · herb trough",(27,0,0))
block("Raised planting bed",(0,0,.24),(1.50,.56,.48),stone,.035)
block("Soil",(0,0,.488),(1.40,.47,.025),soil)
for i in range(18):
    x=-.58+(i%6)*.23;y=-.14+(i//6)*.145
    height=.22+.06*math.sin(i*1.6)
    tube("Stem",(x,y,.49),(x,y,.49+height),.008,reed,5)
    for j in range(4):
        a=(i+j)*2.4
        obj=block("Leaves",(x+.052*math.sin(a),y+.052*math.cos(a),.54+j*.036),(.046,.134,.012),green if j%2 else reed)
        obj.rotation_euler=(.30,0,-a)

group("cakes","Pâtisserie · entremets on cake boards",(30,0,0))
for x, glaze in [(-.26,berry),(.26,porcelain)]:
    tube("Cake board",(x,0,0),(x,0,.008),.162,bronze,24)
    tube("Genoise base",(x,0,.008),(x,0,.027),.149,dough,24)
    tube("Glazed entremets",(x,0,.027),(x,0,.136),.148,glaze,24,.144)
    for k in range(5):
        a=k*1.25
        tube("Coulis dome",(x+.075*math.cos(a),.072*math.sin(a),.137),
             (x+.075*math.cos(a),.072*math.sin(a),.166),.030,berry,10,.016)
    block("Chocolate wafer",(x+.022,0,.154),(.095,.023,.017),walnut,.002)

for a in bpy.context.screen.areas:
    if a.type=="VIEW_3D":
        a.spaces.active.region_3d.view_distance=38
        a.spaces.active.region_3d.view_location=(4,0,2)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/"hotel-details.blend"),compress=True)
runpy.run_path(str(out/"export.py"),run_name="__main__")
