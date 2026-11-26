"""Public dining entrance and tables photographed at the Gangnam terminal branch."""
from pathlib import Path
import math
import runpy
import sys
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parents[2] / 'tools'))
import blender_shop_mesh as G

bpy.ops.wm.read_factory_settings(use_empty=True)
G.group = bpy.data.collections.new('GB_HyodoDiningFront')
bpy.context.scene.collection.children.link(G.group)
tones = {
    'Black enamel':'262c2d','Black return':'34393b','Folded edge':'58605e','Rubber':'24292b',
    'Forest ink':'16614a','Mint diffuser':'e2ffef','Pale paper':'e0decb','Almond':'e5c994',
    'Amber strip':'fff0b4','Walnut':'805e3b','Oak top':'b78955','Gold':'bc9865','Ivory tile':'dedaca',
    'Mortar':'a98f72','Red brick':'995b43','Brick ochre':'aa654a','Brick smoke':'8a5543',
    'Brushed metal':'949d97','Flat plaster':'e4e1d4','Glass grey':'657b76','Glass light':'8fa5a0',
    'Cool grey':'677675','Table base':'373e39','Seat':'65503a','Speckled base':'918b7c',
    'Menu charcoal':'2f3735','Menu green':'477b60','Food gold':'c99245','Food brick':'af5d40',
    'Cream sauce':'e6dba1','Lettuce':'648952','Handrail shadow':'454641'}
for key, value in tones.items():
    mat = G.material(key, value, .36 if key in ('Brushed metal','Folded edge','Gold') else 0)
    if key in ('Mint diffuser','Amber strip'):
        shader=mat.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Emission Color'].default_value=mat.diffuse_color
        shader.inputs['Emission Strength'].default_value=1.25 if key=='Mint diffuser' else .82
    G.palette[key]=mat


# The view from the sidewalk uses Blender +X to the visitor's right, +Y into the shop.
def block(name,x,d,z,w,depth,h,col,bevel=0):
    return G.block(name,x,-d,z,w,depth,h,col,bevel)


def rod(name,pts,r,col,seg=8):
    return G.rod(name,[(x,-d,z) for x,d,z in pts],r,col,seg)


def shape(name,points,faces,col):
    return G.piece(name,[(x,-d,z) for x,d,z in points],[tuple(reversed(f)) for f in faces],col)


def strip(name,path,thickness,col):
    return rod(name,path,thickness,col,6)


def sign_plate(name,cx,d,z,width,height,radius,depth,col):
    points=[]
    for dx,dz,start in ((1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)):
        for k in range(6):
            a=math.radians(start+k*18)
            points.append((cx+dx*(width/2-radius)+radius*math.cos(a),
                           z+dz*(height/2-radius)+radius*math.sin(a)))
    ring=len(points)
    vv=[(x,d+off,zz) for off in (0,depth) for x,zz in points]
    return shape(name,vv,[tuple(range(ring)),tuple(reversed(range(ring,ring*2)))]+
                 [(i,(i+1)%ring,(i+1)%ring+ring,i+ring) for i in range(ring)],col)


def letters(label,font,cx,d,z,width,height,col,depth=.012,side=0):
    curve=bpy.data.curves.new(label,'FONT')
    curve.body=label;curve.font=font;curve.extrude=depth/2;curve.resolution_u=4
    obj=bpy.data.objects.new(label,curve);G.group.objects.link(obj);curve.materials.append(G.palette[col])
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH')
    axes=[(min(axis),max(axis)) for axis in zip(*(v.co for v in obj.data.vertices))]
    for v in obj.data.vertices:
        for axis,extent in ((0,width),(1,height)):
            lo,hi=axes[axis];v.co[axis]=(v.co[axis]-(lo+hi)/2)*extent/max(.001,hi-lo)
    obj.rotation_euler=(math.pi/2,0,side);obj.location=(cx,d,z)
    return obj


def flower(name,cx,d,z,r,col,side=0,scallop=.085):
    points=[]
    for k in range(80):
        angle=math.tau*k/80
        rr=r*(1-scallop/2+scallop*math.cos(angle*8)/2)
        dx=rr*math.cos(angle)
        points.append((cx+math.cos(side)*dx,d+math.sin(side)*dx,z+rr*math.sin(angle)))
    return shape(name,points,[tuple(range(len(points)))],col)


def round_sign(cx,d,z,r,rot):
    # Portrait photo shows a milky round projecting sign, with a green scalloped seal.
    direction=(math.sin(rot),-math.cos(rot))
    def forward(dist):
        return cx+direction[0]*dist,d+direction[1]*dist
    ax,ad=forward(-.06);bx,bd=forward(.045)
    rod('Projecting sign · folded edge',[(ax,ad,z),(bx,bd,z)],r,'Black return',40)
    for off,norm in ((.048,rot),(-.064,rot+math.pi)):
        side_dir=(math.sin(norm),-math.cos(norm))
        x,y=forward(off)
        flower('Opal round sign',x,y,z,r*.975,'Mint diffuser',norm,0)
        flower('Scalloped green line',x+side_dir[0]*.003,y+side_dir[1]*.003,z,r*.79,'Forest ink',norm)
        flower('Printed seal centre',x+side_dir[0]*.005,y+side_dir[1]*.005,z,r*.74,'Mint diffuser',norm)
        for txt,dy in [('효도',.21),('치킨',-.21)]:
            letters(txt,korean,x+side_dir[0]*.009,y+side_dir[1]*.009,z+dy*r,r*.95,r*.34,'Forest ink',.002,norm)


korean=bpy.data.fonts.load('/System/Library/Fonts/AppleSDGothicNeo.ttc')
latin=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
# Exterior black soffit and its small aimed fixtures, all in the shop bay.
block('Forecourt soffit',0,-1.38,3.13,6.44,2.94,.105,'Black enamel')
for i in range(25):
    block('Soffit · folded joint',0,-2.80+i*.117,3.111,6.44,.015,.013,'Folded edge')
for x in (-2.85,-1.45,-.05,1.35,2.75):
    rod('Downlight stem',[(x,-.55,3.13),(x,-.55,3.035)],.026,'Black return')
    rod('Tilted dark spotlight',[(x,-.55,3.04),(x,-.47,2.92)],.058,'Black enamel',14)
    rod('Spotlight lens',[(x,-.47,2.919),(x,-.463,2.91)],.05,'Amber strip',14)
block('Street entrance lintel',-.73,-.035,2.44,4.73,.18,.55,'Black return',.012)
sign_plate('Enamel sign · rounded end',-.80,-.185,2.75,2.58,.53,.16,.095,'Black enamel')
flower('Main sign · opal seal',-1.67,-.192,2.75,.188,'Mint diffuser')
flower('Main sign · green keyline',-1.67,-.195,2.75,.145,'Forest ink')
flower('Main sign · hand lettered inset',-1.67,-.197,2.75,.122,'Mint diffuser')
for label,dz in [('효도',.044),('치킨',-.044)]:
    letters(label,korean,-1.67,-.202,2.75+dz,.138,.071,'Forest ink',.003)
letters('효도치킨',korean,-.66,-.209,2.75,1.42,.252,'Mint diffuser',.025)
# The round projecting blade reads from the side, unlike a flat fascia decal.
rod('Bracket · upper lug',[(-2.98,.01,2.98),(-2.98,-.55,2.98)],.034,'Black enamel')
rod('Bracket · lower lug',[(-2.98,.01,2.68),(-2.98,-.55,2.68)],.034,'Black enamel')
round_sign(-2.98,-.62,2.79,.275,-math.pi/2)
block('Canopy · front folded edge',0,-2.84,3.09,6.44,.055,.16,'Black return')
for x in (-3.20,3.20):block('Canopy · side folded edge',x,-1.36,3.09,.055,2.98,.16,'Black return')
# Large glass opening is maintained by the game's door and static glazing.
for x in (-3.06,-2.83,-1.46,-.06,1.61,3.15):
    block('Shopfront frame · upright',x,.015,.035,.049,.133,2.42,'Black enamel')
    block('Upright · folded silver edge',x-.018,-.054,.045,.012,.012,2.39,'Folded edge')
block('Entrance head',-.72,.011,2.39,4.75,.145,.085,'Black enamel')
block('Floor mat',-2.15,.12,.022,1.15,.61,.025,'Handrail shadow',.008)
for x in (-2.83,-1.46):
    rod('Entrance pull',[(x,.05,.86),(x,-.02,.86),(x,-.02,1.16),(x,.05,1.16)],.016,'Brushed metal')
for x,w in [(-2.99,.28),(-.05,2.57),(2.35,1.48)]:
    block('Fixed window sill',x,.01,.034,w,.14,.056,'Brushed metal')
# A narrow illuminated takeaway case occupies the viewer's left, clear of the threshold.
block('Lit display base',-2.96,.19,.085,.45,.35,.73,'Menu charcoal',.012)
for z in (.85,1.12,1.37):
    block('Case · rim',-2.96,.18,z,.44,.32,.025,'Gold')
    block('Case · light strip',-2.96,.023,z+.03,.42,.017,.013,'Amber strip')
for x in (-3.15,-2.77):
    block('Case · upright',x,.09,.83,.017,.017,.57,'Gold')
for z in (.90,1.16):
    for i in range(3):
        x=-3.10+i*.126
        G.profile('Little display platter',x,-.13,z,[(.053,0),(.060,.013),(.054,.019)],'Ivory tile',12,.66)
        G.profile('Fried chicken in the case',x,-.13,z+.016,[(.025,0),(.032,.020),(.016,.034)],['Food gold','Food brick','Food gold'][i],8,.71)
# Ochre-finished entrance piers with visible masonry joints.
def brickwork(x0,x1,d,z0,z1,tall,wide,tones,thickness=.027):
    row=0
    while z0+row*tall<z1-.012:
        z=z0+row*tall;xx=x0-(wide*.50 if row%2 else 0);j=0
        while xx<x1-.006:
            a=max(x0,xx);b=min(x1,xx+wide)
            if b-a>.022:
                block('Bonded brick facing',(a+b)/2,d,z+.006,b-a-.012,thickness,min(tall,z1-z)-.012,tones[(row*3+j)%len(tones)])
            j+=1;xx+=wide
        row+=1

for x in (-3.17,1.67):
    block('Entrance pier',x,.04,.015,.25,.20,2.98,'Mortar')
    brickwork(x-.12,x+.12,-.073,.03,2.99,.085,.265,['Brick ochre','Mortar','Brick ochre'])
# The stair enclosure abuts this pane in the game. Fit the photograph's brick
# and window lettering on the shop side; the original stair wall stays in place.
block('Fixed shop window · mortar lining',-.42,.292,.08,2.05,.037,2.30,'Mortar')
brickwork(-1.445,.605,.264,.08,2.38,.097,.285,['Brick smoke','Red brick','Red brick','Brick ochre'],.022)
block('Window head · warm strip',-.42,.201,2.30,2.04,.031,.021,'Amber strip')
letters('효도치킨',korean,-.76,-.068,1.23,.48,.095,'Pale paper',.004)
letters('HYODO CHICKEN',latin,.13,-.068,1.23,.65,.055,'Pale paper',.004)
# Behind the front glass, the shallow fixed bay has a walnut liner and a menu card.
block('Window display · wood lining',1.86,.265,.05,2.45,.08,2.42,'Walnut')
for i in range(11):
    block('Liner · panel joints',.71+i*.222,.22,.075,.009,.008,2.35,'Walnut' if i%2 else 'Oak top')
block('Display ledge',1.86,.13,.61,2.43,.24,.047,'Oak top')
block('Window display · warm cove',1.86,.184,2.29,2.40,.017,.02,'Amber strip')
# Menu facings: the documented illuminated posters show food, not verified current prices.
def menu_board(x,d,z,w,h):
    block('Menu screen · frame',x,d,z,w,.052,h,'Black enamel',.015)
    block('Menu screen · face',x,d-.029,z+.023,w-.041,.017,h-.046,'Menu charcoal')
    for i in range(2):
        cx=x+w*(.035+i*.24)
        for j in range(3):
            flower('Dish illustration',cx+.047*math.cos(j*2.1),d-.042,z+h*(.63-i*.23)+.032*math.sin(j*2.1),
                   w*(.079+j*.008),['Food gold','Food brick','Cream sauce'][j],scallop=.13)
    block('Menu type · cream',x-w*.19,d-.046,z+h*.6,w*.27,.009,.023,'Almond')
    block('Menu type · green',x-w*.2,d-.045,z+h*.48,w*.22,.009,.026,'Menu green')
menu_board(.35,.085,.60,.58,.52)
block('Menu · floor stand',.35,.13,.055,.27,.23,.044,'Brushed metal')
rod('Menu · support',[(.35,.15,.10),(.35,.15,.66)],.021,'Brushed metal')
# Customer room behind the existing stair enclosure: warm brick, cove and track lights.
block('Dining wall · warm mortar',.21,8.05,.035,6.82,.09,2.93,'Mortar')
brickwork(-3.14,3.55,7.993,.04,2.91,.119,.295,['Red brick','Brick ochre','Red brick','Brick smoke'])
block('Rear wall · cove',.18,7.94,2.87,6.66,.10,.075,'Ivory tile')
block('Rear wall · continuous strip',.18,7.878,2.95,6.66,.027,.024,'Amber strip')
block('Entrance passage ceiling',-2.65,2.73,3.12,1.65,5.44,.055,'Flat plaster')
block('Dining ceiling',.15,6.73,3.12,6.80,2.64,.055,'Flat plaster')
for x in (-2.61,-1.04,1.31):
    d0=.32 if x< -2 else 5.53
    block('Lighting track',x,(d0+7.84)/2,3.068,.033,7.84-d0,.038,'Ivory tile')
    for d in ([1.12,3.18,5.83,7.33] if x< -2 else [6.05,7.43]):
        rod('Track pendant · stem',[(x,d,3.09),(x,d,2.985)],.019,'Brushed metal')
        rod('Track head · cylinder',[(x,d,3.005),(x+.036,d-.009,2.85)],.054,'Ivory tile',14)
        rod('Track head · diffuser',[(x+.036,d-.009,2.853),(x+.038,d-.010,2.843)],.045,'Amber strip',14)

def table(x,d):
    block('Table · oak edge',x,d,.707,1.18,.64,.062,'Walnut',.008)
    for k in range(3):block('Table · timber top',x,d+(k-1)*.207,.760,1.16,.200,.023,['Oak top','Walnut','Oak top'][k],.004)
    for side in (-1,1):
        for end in (-1,1):
            rod('Table · black metal leg',[(x+side*.47,d+end*.20,.02),(x+side*.47,d+end*.20,.71)],.021,'Table base')
    block('Order tablet · base',x+.34,d+.07,.79,.15,.12,.018,'Table base')
    rod('Order tablet · stem',[(x+.34,d+.08,.80),(x+.34,d+.1,.94)],.012,'Table base')
    block('Order tablet · frame',x+.34,d+.10,.925,.25,.032,.15,'Black enamel',.007)
    block('Order tablet · display',x+.34,d+.08,.94,.224,.006,.12,'Menu green')
    for side in (-1,1):
        yy=d+side*.57
        block('Chair · wood seat',x,yy,.42,.39,.37,.038,'Seat',.012)
        for xx in (-.155,.155):
            for dd in (-.14,.14):
                rod('Chair · tubular leg',[(x+xx*1.18,yy+dd*1.12,.012),(x+xx,yy+dd,.426)],.013,'Table base')
        points=[(x-.17,yy+side*.13,.445),(x-.185,yy+side*.17,.70),(x-.14,yy+side*.19,.78),
                (x+.14,yy+side*.19,.78),(x+.185,yy+side*.17,.70),(x+.17,yy+side*.13,.445)]
        rod('Chair · curved steel back',points,.018,'Table base')

for x in (-.70,1.28,2.86):table(x,6.94)
# The street photo looks past the door into a brick wall lit along its upper edge.
# Align this thin finish with the solid stair separator on the restaurant side.
block('Entry passage · wall backing',-1.592,2.72,.035,.04,4.76,2.92,'Mortar')
for row in range(23):
    start=.36-(.147 if row%2 else 0)
    for k in range(18):
        a=max(.36,start+k*.294);b=min(5.08,start+(k+1)*.294)
        if b-a<.025:continue
        z=.04+.123*row
        x=-1.617
        shape('Dining passage brick',[(x,a+.006,z+.004),(x,a+.006,z+.120),
              (x,b-.006,z+.120),(x,b-.006,z+.004)],[(0,1,2,3)],
              ['Red brick','Brick smoke','Brick ochre','Red brick'][(row*2+k)%4])
block('Entry cove · top shelf',-1.68,2.72,2.88,.18,4.75,.11,'Ivory tile')
block('Entry cove · warm lens',-1.77,2.72,2.986,.022,4.73,.025,'Amber strip')
block('Customer entrance · timber panel lining',-3.426,2.71,.06,.039,4.91,2.85,'Walnut')
for k in range(12):block('Timber lining · groove',-3.404,.49+k*.39,.08,.008,.018,2.81,'Oak top')
# Branch dining photograph: a suspended projector faces the rear brick wall.
block('Projector · bracket plate',-.20,6.10,3.075,.19,.17,.026,'Brushed metal')
rod('Projector · downrod',[(-.20,6.10,3.075),(-.20,6.10,2.76)],.031,'Brushed metal')
block('Projector · cream body',-.20,6.10,2.68,.39,.26,.105,'Ivory tile',.020)
for i in range(7):
    block('Projector · cooling slot',-.35+i*.035,5.964,2.703,.019,.007,.043,'Black return')
rod('Projector · rearward lens',[(-.10,6.20,2.74),(-.10,6.26,2.74)],.038,'Glass grey',14)
block('Projection · frame',-.15,7.955,1.47,2.47,.027,1.22,'Black return')
block('Projection · dark screen',-.15,7.934,1.50,2.40,.009,1.16,'Cool grey')
# Existing physical floor receives a thin terrazzo finish; the stairwell stays open.
block('Dining floor',.14,6.73,.029,6.79,2.65,.017,'Speckled base')
block('Entrance floor',-2.62,2.74,.029,1.61,5.45,.017,'Speckled base')
# Chips from the documented salt-and-pepper surface, deterministic without a raster texture.
import random
rng=random.Random(1103)
for i in range(545):
    if i<385:x=rng.uniform(-3.17,3.45);d=rng.uniform(5.44,8.02)
    else:x=rng.uniform(-3.38,-1.83);d=rng.uniform(.09,5.38)
    scale=rng.uniform(.009,.032);offset=rng.uniform(-.009,.009)
    shape('Terrazzo · stone chip',[(x-scale,d,.048),(x,d-scale*.68,.048),(x+scale,d+offset,.048),(x,d+scale*.59,.048)],
          [(0,1,2,3)],['Ivory tile','Handrail shadow','Mortar'][i%3])
# Loose chips and brick solids stay editable, without a separate Blender object per chip.
for prefix in ('Terrazzo · stone chip','Bonded brick facing','Dining passage brick'):
    groups={}
    for obj in list(G.group.objects):
        if obj.name.startswith(prefix):
            groups.setdefault(obj.data.materials[0].name,[]).append(obj)
    for tone,objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        if len(objects)>1:bpy.ops.object.join()
        objects[0].name=prefix+' · '+tone
# Native display camera and studio lights are outside the linked shop collection.
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
camera=bpy.data.cameras.new('Customer approach')
cam=bpy.data.objects.new('Customer approach',camera);scene.collection.objects.link(cam)
cam.location=(-3.07,-6.28,1.62);cam.rotation_euler=(Vector((-.75,.1,1.83))-cam.location).to_track_quat('-Z','Y').to_euler()
camera.lens=36;scene.camera=cam
for name,pos,energy,size in [('Soft daylight',(-4,-5,6),500,5),('Dining fill',(0,5.6,2.98),95,3)]:
    light=bpy.data.lights.new(name,'AREA');light.energy=energy;light.shape='DISK';light.size=size
    obj=bpy.data.objects.new(name,light);scene.collection.objects.link(obj);obj.location=pos
    target=Vector((-.1,0,1.5)) if name=='Soft daylight' else Vector((0,6.6,.5))
    obj.rotation_euler=(target-obj.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Street ambience');scene.world.color=(.12,.12,.12)
scene.render.engine='CYCLES';scene.cycles.samples=8
scene.render.resolution_x=820;scene.render.resolution_y=500;scene.render.resolution_percentage=100
bpy.ops.object.select_all(action='DESELECT')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'shop.blend'),compress=True)
runpy.run_path(str(ROOT/'export.py'))
