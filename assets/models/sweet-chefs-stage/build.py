"""Create the two editable counter signs and display-case facing in the official store photo."""
from pathlib import Path
from math import pi
from random import Random
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("SweetPark_ChefsStage")
bpy.context.scene.collection.children.link(collection)

def finish(obj, name, color):
    obj.name = name
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    collection.objects.link(obj)
    mat = bpy.data.materials.get(color)
    if mat is None:
        mat = bpy.data.materials.new(color)
        rgb = [int(color[i:i+2], 16) / 255 for i in (0,2,4)]
        mat.diffuse_color = (*[((x+.055)/1.055)**2.4 if x>.04045 else x/12.92 for x in rgb],1)
    obj.data.materials.append(mat)
    return obj

def box(name, x, y, z, w, d, h, col, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x,y,z))
    obj = finish(bpy.context.object,name,col)
    obj.dimensions = (w,d,h)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        edge = obj.modifiers.new("Moulded edges","BEVEL")
        edge.width, edge.segments = bevel, 2
    return obj

font_path = Path("/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf")
font = bpy.data.fonts.load(str(font_path)) if font_path.exists() else bpy.data.fonts[0] if bpy.data.fonts else None
def letters(title, x,y,z, w,h, col):
    bpy.ops.object.text_add(location=(x,y,z),rotation=(pi/2,0,0))
    obj = bpy.context.object
    obj.data.body = title
    obj.data.align_x, obj.data.align_y = 'CENTER', 'CENTER'
    obj.data.fill_mode = 'FRONT'
    obj.data.extrude, obj.data.resolution_u = 0, 3
    if font: obj.data.font = font
    bpy.context.view_layer.update()
    bounds = [Vector(q) for q in obj.bound_box]
    width = max(v.x for v in bounds)-min(v.x for v in bounds)
    height = max(v.y for v in bounds)-min(v.y for v in bounds)
    obj.scale = (w/width,h/height,1)
    bpy.ops.object.convert(target='MESH')
    finish(obj,title,col)

def panel(name,x,y,z,w,h,depth,edge):
    box(name+" · brass frame",x,y,z,w,depth,h,'A87C47',edge)
    box(name+" · inner bead",x,y-depth*.5,z,w-.045,.012,h-.042,'DBB576',edge*.65)
    box(name+" · black face",x,y-depth*.5-.008,z,w-.078,.012,h-.072,'292521',edge*.5)

# Relative to the existing 4.55 x 1.43 m glass vitrine, local -Y faces the aisle.
for x in [-.47,.47]:
    box("Stage sign · foot",x,.35,1.167,.115,.15,.025,'A17649',.008)
    box("Stage sign · upright",x,.35,1.32,.044,.045,.30,'735134',.004)
panel("CHEF'S STAGE",0,.35,1.62,1.29,.33,.075,.022)
letters("CHEF'S STAGE",0,.296,1.62,1.075,.145,'F4DCAD')

for x in [-.275,.275]:
    box("Le Soleil · brass foot",x,-.37,1.158,.11,.15,.025,'BF985E',.006)
    box("Le Soleil · short leg",x,-.37,1.205,.032,.038,.085,'C8A569',.004)
panel("Le Soleil",0,-.37,1.347,.70,.265,.04,.038)
letters("LE",0,-.406,1.412,.068,.036,'ECDAB9')
letters("SOLEIL",0,-.406,1.329,.482,.084,'ECDAB9')

# The photograph shows green-streaked marble, a rolled brass lip and inset reflective panels.
box("Veined counter edge",0,-.791,.758,4.12,.052,.085,'73866E',.008)
box("Rolled brass lip",0,-.799,.705,4.10,.052,.038,'BD945D',.012)
rng=Random(205)
for index in range(66):
    x=rng.uniform(-2.02,1.95)
    lean=rng.uniform(.012,.14)
    thickness=rng.uniform(.0015,.007)
    vertices=[]
    for step in range(7):
        t=step/6
        offset=x+lean*t+rng.uniform(-.006,.006)
        width=thickness*rng.uniform(.45,1.55)
        for side in [-1,1]:
            vertices.append((offset+side*width,-.819,.720+t*.073))
    mesh=bpy.data.meshes.new("Marble vein")
    mesh.from_pydata(vertices,[],[(j,j+1,j+3,j+2) for j in range(0,12,2)])
    vein=bpy.data.objects.new("Marble vein",mesh)
    finish(vein,"Marble vein",rng.choice(['71806F','ADB5A0','526A56','8D9B86']))
for x in [-1.39,-.46,.46,1.39]:
    box("Inset oak moulding",x,-.719,.374,.89,.025,.46,'855538',.032)
    box("Bronze mirror bezel",x,-.736,.374,.836,.017,.413,'C09F73',.028)
    box("Smoked reflective panel",x,-.75,.374,.804,.012,.382,'8A8379',.024)

# White trays, cream-topped petits fours, pink glazes, and the inclined cards
# along the glass are visible in the store image. The individual recipes are unknown.
def pastry(name,x,y,z,r,h,col,taper=1):
    bpy.ops.mesh.primitive_cone_add(vertices=10,radius1=r,radius2=r*taper,depth=h,location=(x,y,z+h/2))
    finish(bpy.context.object,name,col)
for row in range(2):
    shelf=.825+.158*row
    y=-.33+.58*row
    for k in range(5):
        x=(k-2)*.70
        box("Porcelain serving tray",x,y,shelf,.62,.33,.016,'EDE2CC',.014)
        for j in range(3):
            a=x+(j-1)*.182
            if k in (0,3):
                pastry("Fluted tart shell",a,y,shelf+.012,.066,.035,'C17F44',1.2)
                pastry("Cream",a,y,shelf+.047,.055,.033,'F1DCAA',.65)
                pastry("Red garnish",a+.01,y,shelf+.080,.025,.019,'A14547',.68)
            elif k in (1,4):
                pastry("Biscuit base",a,y,shelf+.012,.077,.015,'BC854D')
                pastry("Raspberry glaze",a,y,shelf+.027,.065,.054,'C95F68',.9)
                pastry("Garnish",a-.014,y,shelf+.081,.025,.014,'F3D7BA',.55)
            else:
                box("Chocolate pastry",a,y,shelf+.050,.115,.195,.073,'754331',.02)
                box("Icing stripe",a,y-.006,shelf+.09,.014,.14,.007,'D7B790',.003)
for k in range(5):
    x=(k-2)*.70
    obj=box("Price card in acrylic holder",x,-.60,.874,.163,.012,.091,'F5ECDD',.003)
    obj.rotation_euler.x=-.32
    box("Card base",x,-.595,.829,.173,.063,.008,'C4B6A6')
bpy.context.scene.unit_settings.system='METRIC'
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            view=area.spaces.active
            view.shading.color_type='MATERIAL'
            view.region_3d.view_location=(0,0,.85)
            view.region_3d.view_distance=5.3
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'counter.blend'),compress=True)
