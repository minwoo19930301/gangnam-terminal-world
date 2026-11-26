"""Public restaurant threshold beside Poseokjeong on the Gyeongbu rooftop."""
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
G.group = bpy.data.collections.new('GB_YukgakRooftopRestaurant')
bpy.context.scene.collection.children.link(G.group)

colors={
    'Masonry mortar':'999083','Dusky brick':'796e66','Ash brick':'8e8278','Tan brick':'ac9481',
    'Wet brick':'665c59','Cream fascia':'ebe9db','Linen ceiling':'d9d6c8','Coffee tiles':'726964',
    'Charcoal aluminium':'323432','Window glint':'60716e','Crimson mat':'8c3932','Red pipe wrap':'ca5138',
    'Copper duct':'9d6341','Chrome rim':'a6a9a1','Black grate':'343633','Wood table':'a07350',
    'Wood edge':'795038','Cushion':'403d35','White diffuser':'fff5d5','Ink':'262827',
    'Blue stool':'3264a3','Red chair':'b34036','Serving dish':'d2d1bf','Green scallion':'647b48',
    'Grilled pork':'b87f57','Pork fat':'d4b89b'}
for name,hex_color in colors.items():
    mat=G.material(name,hex_color,.4 if name in ('Chrome rim','Copper duct','Charcoal aluminium') else 0)
    if name=='White diffuser':
        n=mat.node_tree.nodes.get('Principled BSDF')
        n.inputs['Emission Color'].default_value=mat.diffuse_color
        n.inputs['Emission Strength'].default_value=.9
    G.palette[name]=mat

# Native +X runs to the right when approaching the entrance. G's depth points toward the terrace.
B=G.block
R=G.rod
def turned(name,x,depth,z,height_radius,color,segments):
    G.profile(name,x,depth,z,[(r,h) for h,r in height_radius],color,segments)

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



font=bpy.data.fonts.load('/System/Library/Fonts/AppleSDGothicNeo.ttc')
# Folded glass-door bay and projecting bilingual-style lightbox visible in the 2026 photograph.
for side,x in enumerate([-1.58,1.57]):
    B('Recessed brick pier',x,-.075,0,.40,.26,2.65,'Masonry mortar')
    for row in range(24):
        edges=[-.20,-.01,.20] if row%2==0 else [-.20,-.105,.105,.20]
        for col,(a,b) in enumerate(zip(edges,edges[1:])):
            B('Brick veneer',x+(a+b)/2,.062,row*.108+.013,b-a-.012,.028,.092,
              ['Dusky brick','Ash brick','Tan brick','Wet brick'][(row*23+col*7+side)%4])
B('Ecru fascia',0,-.9,2.66,3.58,2.05,.34,'Cream fascia')
B('Soffit',0,-1.46,2.59,3.52,3.06,.068,'Linen ceiling')
B('Recessed back wall',0,-3.02,.015,3.54,.10,2.6,'Linen ceiling')
for x in [-1.73,1.73]:B('Side wall',x,-1.52,.015,.09,3.03,2.6,'Linen ceiling')
for x in [-1.35,-.98,.23,1.32]:B('Dark door jamb',x,.026,.025,.05,.09,2.5,'Charcoal aluminium')
B('Door head',0,.026,2.50,2.75,.09,.095,'Charcoal aluminium')
B('Window bottom rail',.79,.021,.13,1.06,.08,.05,'Charcoal aluminium')
B('Folded door pack',1.23,-.11,.04,.15,.31,2.43,'Charcoal aluminium')
for x in [1.19,1.24,1.29]:B('Folded glass edge',x,.056,.14,.016,.018,2.22,'Window glint')
B('Dining room tile',0,-1.50,.006,3.51,3.08,.012,'Coffee tiles')
for i in range(6):B('Tile seam',-1.54+i*.62,-1.50,.019,.007,3.08,.002,'Ash brick')
for i in range(5):B('Tile cross joint',0,-.25-i*.61,.019,3.51,.007,.002,'Ash brick')
B('Counter threshold mat',-.40,.29,.022,1.15,.67,.015,'Crimson mat')
for i in range(7):B('Threshold tile joint',-1.74+i*.57,.19,.018,.008,.53,.009,'Coffee tiles')
B('Metal sign box',-1.56,.19,1.88,.47,.38,.37,'Charcoal aluminium',.015)
B('Front sign diffuser',-1.56,.389,1.90,.44,.014,.33,'White diffuser')
letters('육각고기',font,-1.56,-.403,2.078,.38,.115,'Ink',.002)
letters('참숯직화구이전문점',font,-1.56,-.403,1.970,.35,.052,'Ink',.002)
B('Returning pale drain',-1.43,.121,.11,.065,.082,2.52,'Cream fascia')
R('Drain below the brick pier',[(-1.43,.13,.23),(-1.43,.14,.11),(-1.40,.19,.064),(-1.35,.30,.040)],.048,'Red pipe wrap',10)
for z in [.49,1.32,2.35]:B('Pipe bracket',-1.43,.161,z,.1,.012,.016,'Chrome rim')
for x in [-1.08,.85]:
    B('Downlight surround',x,.08,2.628,.175,.14,.02,'Chrome rim',.009)
    B('Downlight face',x,.08,2.620,.133,.102,.012,'White diffuser',.008)
# Public dining bay with metal-rimmed circular grate and ribbed copper extractor.
for tx,td in [(.90,-1.08),(-.89,-2.24)]:
    B('Dining table edge',tx,td,.707,.93,.70,.068,'Wood edge',.025)
    B('Table top',tx,td,.768,.92,.69,.015,'Wood table',.025)
    B('Table pedestal',tx,td,.06,.16,.17,.65,'Charcoal aluminium')
    B('Footplate',tx,td,.018,.55,.38,.054,'Charcoal aluminium',.01)
    turned('Stainless fire bowl',tx,td,.779,[(0,.165),(.016,.185),(.023,.175)],'Chrome rim',40)
    turned('Recessed charcoal grate',tx,td,.801,[(0,.159),(.004,.159)],'Black grate',40)
    for i in range(-5,6):
        x=i*.024;reach=math.sqrt(.150**2-x**2)
        R('Grate bars',[(tx+x,td-reach,.811),(tx+x,td+reach,.811)],.0035,'Chrome rim',5)
    for j,(dx,dd) in enumerate([(-.055,.025),(.035,-.046),(.046,.036)]):
        B('Grilled pork',tx+dx,td+dd,.812,.057,.041,.035,'Grilled pork',.008)
        B('Fat cap',tx+dx+.012,td+dd,.843,.012,.032,.004,'Pork fat',.002)
    for sign in [-1,1]:
        turned('Side dish',tx+sign*.32,td+.19,.786,[(0,.057),(.020,.078),(.025,.076)],'Serving dish',16)
        B('Scallions',tx+sign*.32,td+.19,.81,.063,.045,.016,'Green scallion',.006)
        B('Dining stool',tx,td+sign*.51,.415,.34,.31,.074,'Cushion',.024)
        for dx in [-.12,.12]:
            for dd in [-.10,.10]:B('Stool leg',tx+dx,td+sign*.51+dd,.02,.032,.032,.41,'Charcoal aluminium')
    turned('Extractor hood',tx,td,1.37,[(0,.140),(.035,.141),(.08,.095),(.13,.061)],'Copper duct',30)
    turned('Extractor riser',tx,td,1.5,[(0,.055),(.91,.055),(.92,.085),(1.09,.085)],'Copper duct',24)
    for i in range(24):
        turned('Flexible duct bead',tx,td,2.02+i*.018,[(0,.057),(.005,.065),(.010,.057)],'Copper duct',14)

# Keep the approach mat and the two neighbouring garden passages free.
# A blue plastic stool and red slatted chair sit beside the glazing in the 2026 front view.
def patio_seat(x,d,color,back):
    B('Moulded pan',x,d,.40,.38,.36,.065,color,.025)
    for dx in [-.13,.13]:
        for dd in [-.12,.12]:
            R('Splayed leg',[(x+dx*1.23,d+dd*1.23,.025),(x+dx,d+dd,.409)],.024,color,8)
    if back:
        for dx in [-.15,-.075,0,.075,.15]:
            R('Chair back slat',[(x+dx,d-.12,.464),(x+dx,d-.18,.80)],.017,color,8)
        R('Curved chair rim',[(x-.163,d-.17,.77),(x-.14,d-.19,.825),(x,d-.20,.847),(x+.14,d-.19,.825),(x+.163,d-.17,.77)],.023,color,9)
patio_seat(1.41,.40,'Blue stool',False)
patio_seat(.94,.46,'Red chair',True)
for x in [-1.45,.94]:
    R('Bent copper extractor manifold',[(x,-2.94,2.49),(x,-2.62,2.47),(x+.20,-2.48,2.39),(x+.48,-2.39,2.44),(x+.62,-2.31,2.59)],.064,'Copper duct',12)
B('Rear half-height timber panelling',0,-2.947,.01,3.40,.050,.91,'Wood edge')
for i in range(17):B('Panel seam',-1.61+i*.20,-2.911,.03,.012,.012,.86,'Coffee tiles')
B('Wall-hung order sheet frame',-1.15,-2.90,1.56,.53,.042,.69,'Charcoal aluminium')
B('Order sheet',-1.15,-2.868,1.58,.49,.014,.65,'Linen ceiling')
for row in range(6):
    B('Printed menu row',-1.20,-2.849,2.08-row*.073,.23,.004,.010,'Ink')
    B('Price column',-.98,-2.849,2.08-row*.073,.048,.004,.010,'Ink')
# Every masonry colour and small repetitive metal part remains a separate editable material group.
for prefix in ['Brick veneer','Grate bars','Flexible duct bead','Stool leg']:
    by_color={}
    for ob in list(G.group.objects):
        if ob.name.startswith(prefix):by_color.setdefault(ob.data.materials[0].name,[]).append(ob)
    for color,objects in by_color.items():
        bpy.ops.object.select_all(action='DESELECT')
        for ob in objects:ob.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
        objects[0].name=prefix+' · '+color
# Native display camera and studio lights are outside the linked shop collection.
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
camera=bpy.data.cameras.new('Customer approach')
cam=bpy.data.objects.new('Customer approach',camera);scene.collection.objects.link(cam)
cam.location=(-2.4,-5.1,1.68);cam.rotation_euler=(Vector((0,.25,1.39))-cam.location).to_track_quat('-Z','Y').to_euler()
camera.lens=36;scene.camera=cam
for name,pos,energy,size in [('Soft daylight',(-4,-5,6),500,5),('Dining fill',(0,1.5,2.3),95,3)]:
    light=bpy.data.lights.new(name,'AREA');light.energy=energy;light.shape='DISK';light.size=size
    obj=bpy.data.objects.new(name,light);scene.collection.objects.link(obj);obj.location=pos
    target=Vector((-.1,0,1.5)) if name=='Soft daylight' else Vector((0,2,.6))
    obj.rotation_euler=(target-obj.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Street ambience');scene.world.color=(.12,.12,.12)
scene.render.engine='CYCLES';scene.cycles.samples=8
scene.render.resolution_x=820;scene.render.resolution_y=500;scene.render.resolution_percentage=100
bpy.ops.object.select_all(action='DESELECT')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'shop.blend'),compress=True)
runpy.run_path(str(ROOT/'export.py'))
