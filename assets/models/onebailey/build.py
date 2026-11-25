"""Build individual, editable service counters and products for the One Bailey Square B1 shops."""
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


navy=material("Paik blue",0x173982)
yellow=material("Paik yellow",0xf6ca32)
steel=material("Steel",0xb9b8b2)
stone=material("Counter face grey",0xbebeb8)
cream=material("Warm white",0xf5ecde)
oak=material("Oiled oak",0xaf8051)
walnut=material("Dark walnut",0x674636)
dark=material("Graphite",0x34332e)
bread=material("Baked wheat",0xbf8652)
sugar=material("Bread scoring",0xeabf83)
berry=material("Strawberry",0xc84444)
pink=material("Blush",0xefaeac)
pistachio=material("Pistachio",0x97ab6c)
paper=material("Baking paper",0xe5d5b5)

def oval(name,p,scale,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=1,location=p)
    obj=part(bpy.context.object,name,mat)
    for vert in obj.data.vertices:
        for i in range(3): vert.co[i]*=scale[i]
    return obj

def baguette(x,y,z):
    obj=oval("Scored baguette",(x,y,z),(.088,.24,.066),bread)
    for d in [-.09,.03,.13]:
        line=box("Pale cut",(x,y+d,z+.057),(.085,.013,.009),sugar)
        line.rotation_euler.z=.52
    return obj

def cake(x,y,z,topping):
    rod("Individual cake",(x,y,z),(x,y,z+.074),.105,cream,18)
    rod("Fruit glaze",(x,y,z+.075),(x,y,z+.081),.102,topping,18)
    for dx,dy in [(-.05,0),(.035,.03),(.015,-.032)]:
        oval("Fruit garnish",(x+dx,y+dy,z+.09),(.026,.024,.033),berry)

def shelf_case(x,y,width):
    box("Refrigerator plinth",(x,y,.38),(width,.70,.76),stone,.018)
    for side in [-1,1]:
        for d in [-.30,.30]:
            box("Glazed case corner",(x+side*(width/2-.023),y+d,1.02),(.025,.025,.50),steel)
    for z in [.79,1.02,1.27]:
        box("Display shelf",(x,y,z),(width,.65,.025),cream)
    for z in [.81,1.04]:
        for n in range(4): cake(x-width*.35+n*width*.225,y-.06,z,[berry,pistachio,pink,cream][n])

start('PaikCounter',(0,0,0))
box("Fluted service counter",(.66,.10,.48),(2.15,.75,.96),stone,.02)
for n in range(34):
    box("Vertical rib",(-.38+n*.063,-.283,.48),(.022,.029,.88),cream)
box("Stone worktop",(.66,.10,.99),(2.22,.84,.074),cream,.021)
box("Yellow maker plaque",(.62,-.305,.55),(.70,.02,.21),yellow,.014)
shelf_case(-1.04,.10,1.12)
box("Espresso housing",(.29,.19,1.22),(.66,.32,.36),steel,.035)
for x in [.12,.32,.52]:
    rod("Group head",(x,.02,1.16),(x,.02,1.24),.043,dark)
    rod("Portafilter",(x,-.07,1.17),(x,.04,1.17),.015,dark)
for x in [1.21,1.37]:
    for i in range(3): rod("Paper cups",(x,.17,1.025+i*.045),(x,.17,1.13+i*.045),.062,cream,12)
for x in [-1.14,0,1.14]:
    box("Blue illuminated menu",(x,.98,1.92),(1.06,.075,.53),navy,.018)
    for n in range(4):
        box("Menu rule",(x-.16,.937,2.03-n*.075),(.54-.07*(n%2),.006,.012),cream)
    for n in [0,1]:
        rod("Menu cup image",(x+.31+n*.085,.932,1.94),(x+.31+n*.085,.925,1.94),.055,[yellow,cream][n],12)

start('BonCroissant',(6,0,0))
# A pâtisserie display with individual cakes and laminated pastry on paper.
shelf_case(-.44,.26,2.08)
box("Timber counter pedestal",(1.05,.26,.43),(.83,.68,.86),oak,.025)
box("Stone tray counter",(1.05,.26,.88),(.90,.74,.05),cream,.015)
for xx in [.84,1.19]:
    for yy in [.13,.37]:
        for i in range(5):
            t=(i-2)/2
            oval("Croissant laminated section",(xx+.051*(i-2),yy+.071*t*t,.947-.022*abs(t)),(.056,.076-.026*abs(t),.051-.018*abs(t)),bread if i%2 else sugar)
for z in [.49,.99,1.44,1.88]:
    box("Bread rack shelf",(0,1.54,z),(2.56,.48,.037),oak,.014)
    for i in range(7): baguette(-1.0+i*.34,1.52,z+.072)
for x in [-1.26,1.26]:
    box("Display upright",(x,1.55,1.11),(.055,.51,2.07),walnut)

start('BakedMulan',(12,0,0))
# Rounded walnut shelving and open trays face customers under the pink Bakery mark.
for x in [-1.38,1.38]:
    box("Walnut carcass side",(x,.34,.89),(.095,.69,1.78),walnut,.045)
box("Curved display base",(0,.34,.25),(2.82,.70,.50),walnut,.09)
for z in [.53,.94,1.35,1.75]:
    box("Rounded walnut shelf",(0,.34,z),(2.84,.75,.081),walnut,.036)
    for i in range(3):
        x=(i-1)*.85
        box("Baker tray",(x,.31,z+.048),(.75,.51,.022),paper,.01)
        for j in [-1,0,1]:
            if i!=1: baguette(x+j*.22,.31,z+.112)
            else: oval("Milk rolls",(x+j*.20,.31,z+.105),(.092,.14,.074),sugar)
for i in range(5):
    box("Price ticket",(-1.15+i*.57,-.052,.986),(.145,.012,.073),cream)


# Folds, handles and zipped bags use the two west mall tenants' actual photographs.
fabric=[material("Textile "+n,c) for n,c in [
 ("mustard",0xd7a93b),("sage",0x739a87),("plum",0x975d77),("azure",0x668fa7),
 ("red",0xaf5a54),("cream",0xe5dfcb),("graphite",0x69686b),("lavender",0xa999b9)]]

def cloth(name,x,y,z,width,height,mat,scallop=False):
    # A folded sheet with a drooping hem, backed by a second layer for two-sided viewing.
    nx,ny=12,5;verts=[];faces=[]
    for side in [0,1]:
        for row in range(ny+1):
            for col in range(nx+1):
                u,v=col/nx,row/ny;wave=sin(u*5*pi)
                verts.append((x+(u-.5)*width+.028*v*wave,y+.034*wave+.004*side,
                    z-height*v+(v*v)*(.048*cos(2*pi*u)+(.029*cos(6*pi*u) if scallop else .0))))
        for row in range(ny):
            for col in range(nx):
                n=side*(nx+1)*(ny+1)+row*(nx+1)+col;face=(n,n+1,n+nx+2,n+nx+1)
                faces.append(face if side==0 else face[::-1])
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);part(obj,name,mat)
    return obj

def bag(x,y,z,n):
    m=fabric[n%len(fabric)]
    obj=box("Fabric handbag",(x,y,z+.14),(.31,.115,.25),m,.04)
    for dx in [-.084,.084]:
        rod("Strap return",(x+dx,y-.02,z+.25),(x+dx*.65,y-.02,z+.38),.022,m)
    rod("Handle grip",(x-.056,y-.02,z+.38),(x+.056,y-.02,z+.38),.022,m)
    for dx in [-.07,.035]:
        oval("Appliqué flower",(x+dx,y-.064,z+.14+dx*.22),(.031,.009,.032),fabric[(n+3)%8])

start('Emet',(19,0,0))
group['bundle']='west'
for x in [-1.14,1.12]:
    box("Oak display bin",(x,.59,.46),(1.01,.79,.90),oak,.025)
    box("Display rim",(x,.59,.924),(1.07,.85,.050),walnut)
for i in range(5):
    bag(-1.47+i*.169,.41,.95,i)
for i in range(6):
    x=-1.4+i*.14
    bag(x,.16,.28,i+2)
for i in range(9):
    x=.69+i*.095
    cloth("Draped scarf",x,.17+.029*(i%3),1.19,.21+.03*(i%3),.47+.12*(i%4),fabric[(i+2)%8])
for yy in [.19,1.48]:
    rod("Hanging rail",(-1.65,yy,2.14),(1.65,yy,2.14),.018,steel)
    for i in range(9):
        x=-1.45+i*.36
        cloth("Looped printed scarf",x,yy,2.13,.31,.28+.065*(i%3),fabric[(i+(1 if yy>1 else 0))%8],True)
        for dx in [-.075,.055]:
            rod("Fold highlight",(x+dx,yy-.031,2.06),(x+dx*.5,yy-.031,1.91),.010,fabric[(i+3)%8],5)
for xx in [-1.53,1.53]:
    rod("Floor stand",(xx,1.00,.04),(xx,1.00,1.81),.027,steel)
    rod("Scarf rail",(xx,.20,1.76),(xx,1.76,1.76),.018,steel)
    for j in range(6):
        cloth("Side rack silk",xx,.23+j*.22,1.73,.23,.48+(j%3)*.11,fabric[(j+3)%8])
for yy in [2.15,2.65]:
    box("Rear display shelf",(0,yy,.75),(3.12,.32,.06),oak)
    for n in range(6):bag(-1.21+n*.48,yy,.79,n)

start('AnHouse',(25,0,0))
group['bundle']='west'
rod("Sheer curtain rod",(-1.66,.22,2.24),(1.66,.22,2.24),.024,steel)
for n in range(15):
    cloth("Sheer scalloped valance",-1.54+n*.219,.22,2.23,.245,.32+(n%3)*.036,cream,True)
for side in [-1,1]:
    for n in range(2):
        x=side*(.76+n*.64)
        for xx in [x-.286,x+.286]:
            for yy in [.19,1.03]:box("Open cart leg",(xx,yy,.43),(.036,.035,.83),steel)
        for zz in [.12,.54]:
            box("Trolley shelf",(x,.60,zz),(.63,.91,.05),cream)
        for j in range(8):
            m=fabric[(j*3+n+(2 if side==1 else 0))%8]
            box("Folded quilt",(x+sin(j)*.015,.61,.60+j*.087),(.63-.016*(j%3),.89-.031*(j%2),.097),m,.038)
        for j in range(3):
            box("Folded stock lower shelf",(x,.60,.20+j*.085),(.53,.72,.086),fabric[(j+n+2)%8],.03)
        for j in range(4):box("Stitched quilt seam",(x-.215+j*.14,.62,1.265),(.009,.76,.007),cream)
    for j in range(3):
        x=side*(.65+j*.44)
        cushion=box("Appliqué cushion",(x,1.36,1.30),(.45,.17,.43),fabric[(j+(0 if side>0 else 5))%8],.07)
        cushion.rotation_euler.x=-.14
        oval("Two-colour cushion motif",(x,1.26,1.31),(.089,.012,.07),cream)
for i in range(5):cloth("Hanging cover panel",-1.30+i*.65,2.64,2.13,.62,1.54,fabric[(i+4)%8],True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'retail.blend'),compress=True)
runpy.run_path(str(directory/'export.py'))
