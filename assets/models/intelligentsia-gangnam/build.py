"""Customer-facing details from the operator's three Gangnam Coffeebar photographs."""
from math import cos, pi, sin
from pathlib import Path
import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('GangnamCoffeebar')
bpy.context.scene.collection.children.link(collection)


def mesh(name, vertices, faces, tint):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    material = bpy.data.materials.get(tint)
    if material is None:
        material = bpy.data.materials.new(tint)
        rgb = [int(tint[i:i+2], 16)/255 for i in (0,2,4)]
        material.diffuse_color = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb]+[1]
    data.materials.append(material)
    return obj


def box(name, x, y, z, w, d, h, tint):
    verts = [(x+a*w/2, y+b*d/2, z+k*h) for k in (0,1) for a,b in ((-1,-1),(1,-1),(1,1),(-1,1))]
    return mesh(name,verts,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],tint)


def turned(name, x, y, outline, tint, steps=20):
    verts = [(x+radius*cos(2*pi*i/steps), y+radius*sin(2*pi*i/steps), height)
             for height,radius in outline for i in range(steps)]
    faces = [tuple(reversed(range(steps)))]
    for layer in range(len(outline)-1):
        for i in range(steps):
            j=(i+1)%steps
            faces.append((layer*steps+i,layer*steps+j,(layer+1)*steps+j,(layer+1)*steps+i))
    faces.append(tuple(range(len(verts)-steps,len(verts))))
    return mesh(name,verts,faces,tint)


def rod(name, a, b, radius, tint):
    a,b=Vector(a),Vector(b)
    part=turned(name,0,0,[(0,radius),((b-a).length,radius)],tint,8)
    part.location=a
    part.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()


def graphic(name,x,y,z,outline,tint):
    return mesh(name,[(x+u,y,z+v) for u,v in outline],[tuple(range(len(outline)))],tint)


orange='d34816'; carmine='b4381d'; ivory='f3eada'; charcoal='252927'; brass='997956'
# The counter, the white stools and the tasting setup share a single long sightline.
box('Red lacquer bar',-1.17,2.00,0,4.75,1.02,.99,carmine)
box('Orange front edge',-1.17,1.46,.93,4.85,.16,.14,orange)
box('Stone worktop',-1.17,2.04,1.01,4.80,1.03,.075,'eee7db')
for x in (-2.89,-1.99,-1.09,-.19):
    turned('Pressed ivory stool seat',x,.95,[(.69,.155),(.73,.235),(.755,.24),(.77,.21)],'e5e1d8')
    for side in (-1,1):
        for front in (-1,1):
            rod('Burnt-orange splayed leg',(x+side*.21,.95+front*.20,.015),(x+side*.115,.95+front*.12,.70),.018,'b64c29')
        rod('Stool foot rail',(x+side*.17,.95-.17,.29),(x+side*.17,.95+.17,.29),.013,orange)
for x in (-2.62,-2.17,-1.72,-1.27):
    box('Pour-over scale',x,1.88,1.085,.26,.25,.025,charcoal)
    turned('Glass server',x,1.88,[(1.11,.078),(1.146,.097),(1.23,.079),(1.25,.057)],'aeafb0')
    turned('Teal brew cone',x,1.88,[(1.245,.061),(1.26,.079),(1.28,.052),(1.39,.12),(1.402,.124)],'659b98')
for x in (-.45,.08):
    turned('Coffee urn',x,2.12,[(1.085,.15),(1.13,.18),(1.42,.18),(1.45,.17),(1.64,.17),(1.67,.11)],charcoal)
    turned('Stainless-steel collar',x,2.12,[(1.44,.182),(1.64,.182)],'c0bfad')
# Photographed wall motif, each pale wood / ivory panel has a round black or brown inset.
for i in range(9):
    x=-3.93+i*.94
    box('Wall panel',x,3.94,0,.929,.10,3.18,['c79d6d','e5d9c6','ded3c0'][i%3])
    if i%3!=1:
        graphic('Painted circular motif',x,3.88,1.77,[(.43*cos(n*pi/20),.43*sin(n*pi/20)) for n in range(40)],['302823','252b29'][i%2])
        if i%2==0:box('Dark stripe',x-.28,3.879,1.76,.28,.012,1.42,charcoal)
# Narrow strips and warm lit coffers above the public counter.
box('Coffer soffit',-.1,2.3,3.36,8.7,3.65,.11,'a78764')
for i in range(9):box('Dark coffer rib',-4.38+1.1*i,2.3,3.29,.042,3.64,.12,'463c32')
for i in range(5):box('Coffer cross rail',0,.49+i*.90,3.29,8.77,.044,.12,'463c32')
for x in (-2.84,-1.21,.40):
    rod('Pendant cable',(x,2.38,3.3),(x,2.38,2.55),.008,'403735')
    turned('Opal globe',x,2.38,[(2.43+.12*sin(a*pi/16),max(.004,.12*cos(a*pi/16))) for a in range(-8,9)],'fff4d9')
# The operator's other photo shows a two-by-three orange shelving unit by black mirrors.
for x in (1.62,2.84,4.06):box('Enamelled orange upright',x,1.74,0,.063,.48,2.38,orange)
for h in (0,.22,.925,1.625,2.32):box('Orange cubby shelf',2.84,1.74,h,2.51,.52,.060,orange)
box('Orange shelf base',2.84,1.74,0,2.49,.48,.22,orange)
for x in (2.23,3.45):
    box('Illuminated middle cubby back',x,1.99,.97,1.15,.022,.655,orange)
    turned('Demonstration brewer',x,1.69,[(.993,.11),(1.04,.13),(1.055,.065),(1.14,.068),(1.16,.115)],charcoal)
    turned('Brewer porcelain cone',x,1.69,[(1.15,.064),(1.32,.15),(1.335,.145)],'f1e3ce')
    for j in (-1,0,1):
        xx=x+j*.28
        turned('White enamel mug',xx,1.68,[(1.685,.064),(1.82,.077),(1.83,.071)],'f5e7d6')
        turned('Coffee carafe',xx,1.70,[(.28,.091),(.31,.092),(.52,.056),(.558,.061)],'e8e1d4')
for x in (1.04,1.94,2.84,3.74):
    box('Black framed wall panel',x,3.77,.12,.86,.12,2.95,charcoal)
    box('Reflective dark inset',x,3.69,.68,.67,.035,2.08,'514c43')
    for side in (-1,1):box('Bronze liner',x+side*.35,3.66,.72,.014,.012,1.99,brass)
# Small printed label on the counter as in the branch photograph.
box('Ivory counter card',.77,1.68,1.088,.74,.046,.35,'f5eddb')
label=bpy.data.curves.new('Counter card lettering','FONT');label.body='INTELLIGENTSIA';label.align_x='CENTER';label.align_y='CENTER';label.size=.069;label.space_character=1.17;label.resolution_u=3
obj=bpy.data.objects.new('Printed name',label);collection.objects.link(obj);obj.location=(.77,1.654,1.29);obj.rotation_euler.x=pi/2
bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj.data.materials.append(bpy.data.materials[carmine]);obj.select_set(False)
graphic('Cup silhouette',.77,1.652,1.168,[(-.034,.028),(.034,.028),(.02,-.002),(-.019,-.002)],carmine)
for side in (-1,1):graphic('Wing on cup',.77,1.652,1.183,[(side*x,z) for x,z in [(.025,.008),(.13,.035),(.113,.014),(.05,-.006)]],carmine)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'coffeebar.blend'),compress=True)
exec(compile((here/'export.py').read_text(),str(here/'export.py'),'exec'))
