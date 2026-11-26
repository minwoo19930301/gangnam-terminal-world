"""Miele Gangnam reopening display. Metres, +Y into the showroom, +Z up."""
import json
import math
import runpy
from pathlib import Path
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.context.scene.unit_settings.system = 'METRIC'
room = bpy.data.collections.new('SSG_9F_Miele')
bpy.context.scene.collection.children.link(room)

def surface(name, rgb, finish):
    mat = bpy.data.materials.new(name)
    values = [int(rgb[i:i+2],16)/255 for i in (0,2,4)]
    rgba = tuple(((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in values)+(1,)
    mat.diffuse_color = rgba
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = rgba
    shader.inputs['Metallic'].default_value = .45 if finish=='Steel' else 0
    shader.inputs['Roughness'].default_value = {'Glass':.18,'Steel':.32,'Cabinet':.57}[finish]
    mat['finish'] = finish
    return mat

graphite=surface('Graphite lacquer','353638','Cabinet')
shadow=surface('Charcoal reveals','18191A','Cabinet')
stone=surface('Pale work surface','F2F0EA','Cabinet')
wine=surface('Miele red','922234','Cabinet')
wood=surface('Oak rack','B98E62','Cabinet')
metal=surface('Brushed stainless','B8BDC0','Steel')
rim=surface('Polished edge','DFE1DE','Steel')
glass=surface('Ceramic black','202529','Glass')
blue=surface('Smoked glazing','36424C','Glass')
led=surface('Panel illumination','C5DDE2','Cabinet')

def mesh(name,vertices,faces,mat):
    data=bpy.data.meshes.new(name)
    data.from_pydata(vertices,[],faces)
    data.materials.append(mat)
    obj=bpy.data.objects.new(name,data)
    room.objects.link(obj)
    return obj

def box(name,x,y,z,w,d,h,mat,angle=0):
    # z is the centre; angle tilts a front panel about its horizontal axis.
    verts=[(a*w/2,b*d/2,c*h/2) for c in (-1,1) for b in (-1,1) for a in (-1,1)]
    obj=mesh(name,verts,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],mat)
    obj.location=(x,y,z)
    obj.rotation_euler.x=angle
    return obj

def turned(name,center,axis,profile,mat,n=40):
    # Revolved section, ordered from the rear toward the viewer.
    normal=Vector(axis).normalized()
    u=normal.orthogonal().normalized()
    v=normal.cross(u)
    verts=[Vector(center)+normal*t+r*(u*math.cos(i*math.tau/n)+v*math.sin(i*math.tau/n))
           for t,r in profile for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(profile)-1) for i in range(n)]
    faces += [tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))]
    return mesh(name,verts,faces,mat)

def rod(name,a,b,r,mat):
    vec=Vector(b)-Vector(a)
    return turned(name,a,vec,[(0,r),(vec.length,r)],mat,8)

def title(text,x,y,z,size,mat):
    font=bpy.data.curves.new(text,'FONT')
    font.body=text
    font.align_x='CENTER'
    font.align_y='CENTER'
    font.size=size
    font.extrude=.0006
    obj=bpy.data.objects.new(text,font)
    room.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=math.pi/2
    font.materials.append(mat)
    bpy.context.view_layer.objects.active=obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)

# Three customer-facing island surfaces with recessed plinth and separate fronts.
box('Island recessed foot',0,-.18,.055,2.75,.74,.11,shadow)
box('Island carcass',0,-.17,.48,2.86,.86,.78,graphite)
box('Porcelain worktop',0,-.17,.895,2.94,.94,.052,stone)
for x,w in [(-1.09,.63),(-.24,1.02),(.49,.39)]:
    for z,h in [(.29,.37),(.675,.365)]:
        box('Handleless drawer',x,-.611,z,w,.022,h,graphite)
box('Flush dishwasher',-1.09,-.625,.797,.59,.026,.118,metal)
box('Recessed pull',-1.09,-.642,.803,.36,.013,.059,glass)
for x in [-.93,0,.97]:
    box('Inset hob edge',x,-.16,.926,.79,.54,.009,metal)
    box('Ceramic cooking surface',x,-.16,.932,.78,.53,.009,glass)
    for side in [-1,1]:
        for y in [-.30,-.04]:
            for dx,dy in [(.035,.002),(.002,.034)]:
                box('Cooking zone cross',x+side*.23,y,.938,dx,dy,.001,metal)
    for i in range(5):
        box('Touch scale',x+(i-2)*.024,-.365,.938,.011,.003,.001,led)
box('Downdraft throat',0,-.16,.939,.12,.37,.005,shadow)
for i in range(6):
    box('Extractor vane',(i-2.5)*.017,-.16,.944,.006,.35,.009,metal)
# Two contrasting coffee machines sit along the rear edge of the island
# in Miele Korea's 2025 reopening photograph. Keep both behind the hob.
for x,finish in [(-1.10,graphite),(-.49,stone)]:
    tray=.927
    box('Coffee machine side housing',x,.153,tray+.22,.264,.255,.438,finish)
    box('Curved front control strip',x,.020,tray+.375,.269,.025,.123,glass)
    box('Soft-key display',x,.005,tray+.382,.105,.004,.036,blue)
    for k in [-1,1]:
        for i in range(2):
            box('Touch key',x+k*(.083+.021*i),.003,tray+.383,.012,.002,.005,led)
    box('Bean container lid',x,.166,tray+.442,.218,.189,.009,shadow)
    box('Dispenser inset',x,.016,tray+.187,.200,.014,.213,shadow)
    box('Adjustable central spout',x,-.011,tray+.26,.111,.064,.135,finish)
    for off in [-.034,.034]:
        turned('Twin outlet',(x+off,-.031,tray+.19),(0,0,-1),[(0,.011),(.024,.009)],metal,12)
    box('Projecting drip tray',x,-.042,tray+.024,.274,.235,.046,finish)
    box('Stainless cup rest',x,-.057,tray+.050,.238,.193,.009,metal)
    for i in range(7):
        box('Drip tray slot',x+(i-3)*.026,-.060,tray+.056,.008,.143,.002,glass)
# Pull the right-hand dishwasher forward with its door open, as in photo five.
dx=1.045
box('Stainless tub',dx,-.615,.48,.596,.035,.73,metal)
box('Tub recess',dx,-.638,.48,.54,.018,.64,shadow)
for z in [.26,.55]:
    for i in range(10):
        x=dx+(i-4.5)*.051
        rod('Rack tine',(x,-.88,z),(x,-.65,z),.004,rim)
        rod('Upturned basket tip',(x,-.88,z),(x,-.88,z+.07),.004,rim)
    for y in [-.885,-.78,-.673]:
        rod('Basket cross rail',(dx-.254,y,z+.01),(dx+.254,y,z+.01),.006,metal)
    rod('Basket guard',(dx-.254,-.882,z+.074),(dx+.254,-.882,z+.074),.006,rim)
for i in range(7):
    turned('Dinner plate',(dx-.183+i*.053,-.744,.399),(1,.08,.04),
           [(-.014,.074),(-.011,.092),(.005,.114),(.008,.114),(.005,.093),(-.004,.068)],stone,32)
for i in range(4):
    turned('Cup',(dx+(i-1.5)*.103,-.74,.57),(0,0,1),[(0,.031),(.071,.044),(.073,.04),(.015,.027)],stone,20)
tilt=.99
for name,y,z,d,h,mat in [('Door outer',-.945,.315,.054,.74,graphite),('Pressed steel liner',-.927,.343,.024,.68,metal),('Flush handle fascia',-1.242,.517,.055,.081,rim)]:
    box(name,dx,y,z,.584,d,h,mat,tilt)
box('Pull slot',dx,-1.267,.509,.39,.028,.037,glass,tilt)
for i in range(5):
    box('Toe vent',.1,-.608,.126+i*.012,.47,.014,.006,metal)

# Back bank: paired stainless refrigeration doors, lit wine racks and laundry.
box('Graphite portal',0,1.88,1.33,4.51,.65,2.66,graphite)
box('Red brand tablet',0,1.545,2.38,.88,.034,.30,wine)
logo=json.loads((OUT/'wordmark-mesh.json').read_text())
mesh('Miele official raised wordmark', [((x-50)*.0088,1.52,2.38+(19.15-z)*.0088)
     for x,z in logo['vertices']], [tuple(reversed(f)) for f in logo['faces']],stone)
for x in [-1.82,-1.14]:
    box('MasterCool brushed panel',x,1.531,1.12,.667,.056,2.12,metal)
    box('Panel edge',x-.309,1.496,1.12,.008,.013,2.07,rim)
    for z in [.87,1.57]:
        box('Return of pull',x+.25,1.47,z,.029,.08,.035,metal)
    box('Vertical pull',x+.25,1.421,1.22,.032,.033,.735,rim)
box('Wine tower frame',-.46,1.51,1.12,.66,.095,2.12,metal)
box('Wine tower glazing',-.46,1.454,1.12,.57,.023,1.98,blue)
for i in range(10):
    z=.30+i*.166
    box('Oak shelf front',-.46,1.433,z,.505,.023,.022,wood)
    for j in range(4):
        turned('Bottle shoulder',(-.65+j*.12,1.441,z+.057),(0,-1,0),[(0,.041),(.011,.039),(.022,.017),(.032,.014)],glass,12)
box('Wine display',-.46,1.428,1.57,.49,.025,.084,glass)
title('12°',-.46,1.412,1.57,.046,led)
box('Steel niche',.355,1.537,1.23,.89,.046,.69,metal)
box('Niche light',.355,1.505,1.56,.87,.03,.015,stone)
box('Niche counter',.355,1.38,.886,.89,.36,.045,stone)
for x in [1.18,1.84]:
    for level in range(2):
        z=.085+level*.848
        box('Laundry enamel',x,1.49,z+.42,.641,.32,.829,stone)
        box('Programme rail',x,1.321,z+.725,.61,.024,.163,stone)
        box('Detergent drawer',x-.21,1.299,z+.739,.139,.018,.084,metal)
        box('Programme display',x+.139,1.30,z+.739,.191,.022,.072,glass)
        title('1:49',x+.138,1.286,z+.739,.034,led)
        turned('Rotary selector',(x-.035,1.297,z+.735),(0,-1,0),[(0,.038),(.02,.035),(.026,.031)],rim,32)
        box('Selector index',x-.035,1.268,z+.754,.004,.004,.012,glass)
        center=(x,1.327,z+.391)
        turned('Porthole bezel',center,(0,-1,0),[(0,.245),(.026,.241),(.052,.222),(.056,.197)],metal)
        turned('Rubber gasket',(x,1.272,z+.391),(0,-1,0),[(0,.199),(.009,.194),(.014,.178)],glass)
        turned('Drum window',(x,1.261,z+.391),(0,-1,0),[(0,.178),(.018,.158),(.024,.111)],blue)
        rod('Door grip',(x+.183,1.258,z+.333),(x+.183,1.258,z+.448),.012,rim)
        box('Service flap',x+.213,1.32,z+.078,.121,.014,.093,metal)
# The branch photograph shows a glossy built-in oven bank turning the corner
# beside the white laundry pair. Keep the front and the central aisle open.
box('Right return cabinet',2.18,.59,1.24,.15,1.47,2.48,graphite)
for d in [.24,.935]:
    for z in [.64,1.24]:
        box('Black oven glass face',2.097,d,z,.023,.61,.53,glass)
        box('Oven door viewing window',2.082,d,z-.035,.013,.48,.34,blue)
        for i in range(3):
            box('Rack behind viewing window',2.074,d,z-.13+i*.065,.003,.405,.005,metal)
        box('Slim programme fascia',2.078,d,z+.17,.011,.54,.079,shadow)
        box('Oven display',2.071,d,z+.17,.007,.086,.034,led)
        for offset in [-.21,.21]:
            box('Handle foot',2.058,d+offset,z+.095,.067,.014,.021,metal)
        box('Oven handle',2.029,d,z+.095,.027,.476,.024,rim)
box('Oven bank reveal light',2.095,.59,2.42,.014,1.35,.014,stone)
# Low handled saucepan on the central extractor hob, forward of the inlet.
pan=(-.235,-.18,.939)
turned('Saucepan rolled rim',pan,(0,0,1),[(0,.071),(.009,.091),(.102,.102),(.109,.107),(.112,.099),(.014,.088)],metal)
turned('Pan interior',(-.235,-.18,.955),(0,0,1),[(0,.085),(.002,.086)],glass)
rod('Saucepan stem',(-.322,-.18,1.02),(-.376,-.18,1.028),.012,metal)
rod('Insulated handle',(-.37,-.18,1.028),(-.52,-.18,1.043),.017,glass)
# Public sink and mixer below the illuminated wall niche.
box('Sink lip',.49,1.38,.914,.44,.23,.009,metal)
box('Sink well',.49,1.38,.920,.394,.193,.004,blue)
for a,b in [((.58,1.476,.921),(.58,1.476,1.152)),((.58,1.476,1.152),(.58,1.37,1.152)),((.58,1.37,1.152),(.58,1.37,1.116))]:
    rod('Mixer spout',a,b,.012,rim)
for x in [1.18,1.84]:
    for z in [.476,1.324]:
        for angle in [0,2.094,4.189]:
            a=(x+.145*math.cos(angle),1.231,z+.145*math.sin(angle))
            b=(x+.096*math.cos(angle+.32),1.231,z+.096*math.sin(angle+.32))
            rod('Curved drum paddle behind smoked window',a,b,.009,metal)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'showroom.blend'),compress=True)
runpy.run_path(str(OUT/'export.py'))
