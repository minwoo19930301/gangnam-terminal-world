"""Haenyeo Seafood, a prepared seafood counter in the Shinsegae Gangnam market."""
from pathlib import Path
from math import cos, sin, pi, tau
from random import Random
import os
import sys

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2]/'tools'))
import blender_shop_mesh as m

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
counter=bpy.data.collections.new('MarketHaenyeoSeafood')
scene.collection.children.link(counter)
case=bpy.data.collections.new('SeafoodCase')
goods=bpy.data.collections.new('SeafoodPacks')
counter.children.link(case);counter.children.link(goods)
m.group=case
palette={
    'black stone':('2c2c2a',.21),'stone vein':('59605c',.12),'eased granite':('464642',.22),
    'black lacquer':('333638',.31),'shelf':('363a39',.37),'shadow':('1b1b19',.08),
    'smoked steel':('666961',.57),'stainless':('b5bbb3',.68),'brass':('b99a59',.48),'nickel':('7f8b87',.59),
    'pearl 1':('a59f8f',.41),'pearl 2':('888c7d',.45),'pearl 3':('b6ae9e',.48),
    'pearl 4':('929788',.44),'grout':('747669',.10),'shoal light':('dbdccc',.60),
    'shoal dim':('bac0ae',.54),'paper':('f1ecde',.02),'ink':('494740',.02),
    'purple':('484056',.09),'box grain':('c39c71',.09),'box ledge':('e8c79e',.06),
    'red box':('893d2f',.10),'black tray':('303732',.15),'film rim':('d9ddd0',.50),
    'rice':('f0e6cc',.04),'rice tint':('ded1af',.03),'salmon':('e78854',.11),
    'salmon fat':('f4c0a1',.08),'roe':('e59428',.16),'roe dark':('ba6b20',.13),
    'egg':('e2b146',.07),'nori':('3e4635',.10),'perilla':('697b4b',.06),
    'clam':('ad8962',.12),'seaweed':('565a40',.12),'herb':('9caa65',.06)
}
for name,(hexcode,metal) in palette.items():
    m.palette[name]=m.material(name,hexcode,metal)
box=m.block;part=m.piece;rod=m.rod
rng=Random(149)

font_paths=[os.getenv('GTW_KOREAN_FONT'),'/System/Library/Fonts/AppleSDGothicNeo.ttc',
            '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc']
font_path=next((Path(p) for p in font_paths if p and Path(p).exists()),None)
if not font_path:
    raise RuntimeError('Set GTW_KOREAN_FONT to a Korean TrueType or OpenType font')
korean_font=bpy.data.fonts.load(str(font_path))
def letters(label,x,d,z,width,height,color='paper',flat=False):
    curve=bpy.data.curves.new(label,'FONT')
    curve.body=label;curve.font=korean_font;curve.align_x='CENTER';curve.align_y='CENTER';curve.resolution_u=3
    obj=bpy.data.objects.new(label,curve);case.objects.link(obj);curve.materials.append(m.palette[color])
    bpy.context.view_layer.update()
    bounds=obj.dimensions.copy()
    obj.scale=(width/max(.001,bounds.x),height/max(.001,bounds.y),1)
    obj.rotation_euler.x=0 if flat else pi/2
    obj.location=(x,-d,z)
    g=bpy.context.evaluated_depsgraph_get()
    mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(g))
    pose=obj.matrix_world.copy()
    bpy.data.objects.remove(obj,do_unlink=True)
    result=bpy.data.objects.new(label,mesh);case.objects.link(result)
    result.matrix_world=pose
    return result

# The frontage has three stepped black display tiers, a stainless return, then the sign rail.
box('Dark plinth',0,0,.018,4.34,.99,.42,'black stone',.014)
for d,depth,height in [(.33,.34,.56),(.00,.31,.78),(-.26,.25,1.00)]:
    box('Stepped display',0,d,.40,4.32,depth,height-.40,'black lacquer',.008)
    box('Polished shelf',0,d,height,4.32,depth,.017,'shelf',.005)
    box('Nickel shelf lip',0,d+depth/2,height-.018,4.31,.009,.032,'nickel')
for x in (-2.15,2.15):
    box('Stepped end',x,-.08,.33,.045,.79,.63,'black stone',.004)
box('Brushed steel counter return',0,-.346,1.015,4.34,.26,.31,'smoked steel',.009)
box('Black granite working top',0,-.339,1.315,4.36,.31,.038,'black stone',.008)
box('Air grille',0,-.136,1.005,4.31,.084,.017,'nickel')
for i in range(88):
    xx=-2.12+i*.048
    box('Vent slot',xx,-.136,1.023,.021,.058,.002,'shadow')
# The news photograph shows overlapping mother-of-pearl scales and a silvery school of fish.
box('Wall behind the fish mosaic',0,-.474,1.27,4.34,.056,1.19,'grout')
for j in range(8):
    for i in range(26):
        x=-2.08+i*.169+(j%2)*.084
        if x>2.12: continue
        z=1.35+j*.144;d=-.439-(7-j)*.0006
        rim=[(-.083,.064),(.083,.064),(.083,-.037),(.071,-.058),(.048,-.078),(0,-.095),(-.048,-.078),(-.071,-.058),(-.083,-.037)]
        part('Scalloped shell tile',[(x+dx,d,z+dz) for dx,dz in rim], [tuple(range(len(rim)))],
             rng.choice(('pearl 1','pearl 2','pearl 3','pearl 4')))
for row in range(5):
    for i in range(27):
        x=-2.07+i*.158+rng.uniform(-.015,.015)
        if x>2.095: continue
        z=1.98+.18*sin(2.55*x+.3)+.073*(row-2)+rng.uniform(-.013,.013)
        half=rng.uniform(.058,.073);rise=.18*2.55*cos(2.55*x+.3)*half
        d=-.418+row*.0004
        part('Shoal · folded silver leaves',[(x-half,d,z-rise),(x-.012,d+.009,z+.014),
                (x+half,d,z+rise),(x+.012,d+.009,z-.012),(x,d+.019,z)],
             [(0,1,4),(1,2,4),(2,3,4),(3,0,4)],rng.choice(('shoal light','shoal light','shoal dim')))
box('Black brushed front edge',0,-.207,1.298,4.32,.018,.014,'eased granite')
for edge in (1.103,1.267):
    box('Brushed highlights',0,-.209,edge,4.29,.006,.002,'nickel')
# Granite name block, white printed leaflets and the gilt-framed purple information card.
box('Name block',-.81,-.235,1.352,1.26,.09,.41,'black stone',.008)
box('Brass rail',-.81,-.184,1.354,1.26,.014,.018,'brass')
letters('해녀의 신세계',-.81,-.182,1.605,.96,.128)
letters('HAENYEO SEAFOOD',-.81,-.182,1.447,.79,.063)
for x,z,w in [(-1.30,1.42,.14),(-.32,1.73,.068),(-1.14,1.685,.034)]:
    rod('Faint mineral vein',[(x,-.185,z),(x+w*.5,-.185,z+.023),(x+w,-.185,z+.032)],.0018,'stone vein',4)
for n in range(6):
    box('Leaflet paper',.04,-.284-n*.009,1.353,.265,.006,.390+n*.0015,'paper')
box('Leaflet holder',.04,-.245,1.354,.31,.013,.063,'film rim')
box('Information card stand',.46,-.236,1.353,.35,.11,.025,'brass',.004)
box('Gilt frame',.46,-.237,1.374,.336,.023,.468,'brass')
box('Purple insert',.46,-.221,1.392,.307,.006,.433,'purple')
letters('해녀의 신세계',.46,-.215,1.732,.244,.043)
for j,w in enumerate((.166,.232,.209,.225,.172)):
    box('Printed line',.46,-.217,1.64-j*.026,w,.002,.004,'paper')


def oval(name,x,d,z,rx,rd,h,color):
    steps=7
    return m.profile(name,x,d,z,[(rx*.72,0),(rx,.29*h),(rx*.93,.73*h),(rx*.62,h)],color,steps,rd/rx)

def salmon(x,d,z):
    oval('Nigiri rice',x,d,z,.040,.021,.021,'rice')
    # A shaped slice with three pale oblique bands.
    oval('Sliced salmon',x,d-.002,z+.019,.044,.024,.012,'salmon')
    for dx in (-.022,0,.022):
        rod('Salmon marbling',[(x+dx-.005,d-.017,z+.028),(x+dx+.002,d,z+.032),
                               (x+dx+.007,d+.013,z+.029)],.0018,'salmon fat',4)

def leaflet(name,x,d,z,length,width,color,angle):
    ax,ad=cos(angle)*length/2,sin(angle)*length/2
    bx,bd=-sin(angle)*width/2,cos(angle)*width/2
    part(name,[(x-ax,d-ad,z),(x+bx,d+bd,z+.004),(x+ax,d+ad,z+.007),(x-bx,d-bd,z+.004),(x,d,z+.014)],
         [(0,1,4),(1,2,4),(2,3,4),(3,0,4)],color)

def maki(x,d,z):
    m.profile('Nori roll',x,d,z,[(.034,0),(.036,.027)],'nori',10)
    m.profile('Rice cutting face',x,d,z+.027,[(.031,0),(.030,.002)],'rice',10)
    oval('Egg and roe centre',x,d,z+.029,.013,.011,.004,'egg')

def tray(x,d,z,kind):
    w=.34;depth=.23
    box('Bentwood bento',x,d,z,w,depth,.051,'red box' if kind==1 else 'box grain',.005)
    box('Tray base',x,d,z+.049,w-.009,depth-.009,.004,'black tray')
    for side in (-1,1):
        box('Lacquer board edge',x+side*(w/2-.003),d,z+.05,.0055,depth,.027,'box ledge')
        box('Lacquer board edge',x,d+side*(depth/2-.003),z+.05,w,.0055,.027,'box ledge')
    if kind==0:
        for n in range(4):salmon(x-.095+.063*(n%2),d-.049+.073*(n//2),z+.053)
        for n in range(3):maki(x+.071+.061*(n%2),d-.040+.069*(n//2),z+.054)
        leaflet('Garnish',x+.091,d+.052,z+.064,.074,.032,'perilla',.83)
    elif kind==1:
        box('Vinegared rice',x,d,z+.054,.306,.19,.020,'rice tint',.006)
        for k in range(37):
            xx=x-.13+rng.random()*.178;dd=d-.080+rng.random()*.150
            rr=.010;cz=z+.077
            ring=[(xx+rr*cos(i*tau/6),dd+rr*sin(i*tau/6),cz) for i in range(6)]
            part('Ikura',ring+[(xx-.002,dd-.001,cz+.009)],[(i,(i+1)%6,6) for i in range(6)],
                 rng.choice(('roe','roe dark')))
        for n in range(3):
            leaflet('Perilla leaf',x+.093,d-.030+n*.031,z+.077,.081,.040,'perilla',.44+n*.38)
    else:
        for n in range(6):
            xx=x-.090+(n%3)*.088;dd=d-.052+(n//3)*.087
            oval('Shellfish and rice',xx,dd,z+.053,.034,.027,.017,'rice')
            oval('Abalone slice',xx+.001,dd,z+.067,.032,.019,.008,'clam')
            for i in (-1,0,1):rod('Abalone ridges',[(xx+i*.008-.003,dd-.008,z+.074),(xx+i*.008+.004,dd+.012,z+.074)],.0014,'box grain',4)
    # The narrow white paper sleeve wraps the lid. The clear film shows just its edges.
    stripx=x-.065 if kind==2 else x+.045
    box('Paper belly band',stripx,d,z+.098,.057,depth+.001,.0019,'paper')
    for k in range(4):
        box('Band print',stripx,d-.037+k*.025,z+.100,.027-k*.002,.002,.001,'ink')
    for side in (-1,1):
        box('Clear lip',x+side*(w/2-.004),d,z+.093,.002,depth-.007,.002,'film rim')
        box('Clear lip',x,d+side*(depth/2-.004),z+.093,w-.008,.002,.002,'film rim')
def pot(x,d,z):
    m.profile('Conch and seaweed bowl',x,d,z,[(.055,0),(.082,.045),(.085,.061)],'paper',16)
    m.profile('Seaweed through lid',x,d,z+.060,[(.077,0),(.074,.003)],'seaweed',16)
    for i in range(5):
        angle=i*tau/5+.53
        leaflet('Seaweed',x+.031*cos(angle),d+.032*sin(angle),z+.065,.047,.013,'herb',angle)
    box('Printed ivory wrapper',x,d,z+.082,.047,.164,.002,'paper')

# The same four products repeat across the case. Each pack can be moved or
# rotated in Blender while its food, printed sleeve and lid remain editable.
recipes = []
for kind, label in enumerate(('Nigiri', 'Ikura', 'Abalone', 'Seaweed')):
    recipe = bpy.data.collections.new(label)
    m.group = recipe
    if kind == 3:
        pot(0, 0, 0)
    else:
        tray(0, 0, 0, kind)
    recipes.append(recipe)

def stock(kind, x, depth, height):
    item = bpy.data.objects.new(recipes[kind].name, None)
    goods.objects.link(item)
    item.instance_type = 'COLLECTION'
    item.instance_collection = recipes[kind]
    item.empty_display_size = .06
    item.location = (x, -depth, height)
    item.rotation_euler.z = rng.uniform(-.035, .035)

for row, (depth, height) in enumerate(((.32, .579), (.006, .799), (-.253, 1.019))):
    for col in range(10):
        x = -1.85 + col * .407
        if (row == 2 and col % 3 == 1) or (row == 0 and col == 8):
            for offset in (-.082, .082):
                stock(3, x + offset, depth, height)
        else:
            stock((row + col) % 3, x, depth, height)

scene['reference']='Shinsegae Gangnam Haenyeo Seafood. Operator film 5BW2sr8C0LU at 1:28–1:32, on-site photograph by Oh Jin-ju for Dnews on 2025-02-28. Counter dimensions and assortment are reconstructed.'
# Keep the studio rig in the standalone edit file, outside the linked city asset.
studio = bpy.data.collections.new('Studio')
scene.collection.children.link(studio)
focus = Vector((-.15, 0, 1.18))
camera = bpy.data.cameras.new('Market counter')
shot = bpy.data.objects.new('해녀의 신세계 · 진열대', camera)
studio.objects.link(shot)
shot.location = (1.96, -4.48, 2.24)
shot.rotation_euler = (focus - shot.location).to_track_quat('-Z','Y').to_euler()
camera.lens = 36
scene.camera = shot
for label, position, energy, size in [
    ('Counter strip', (-1.75,-2.0,3.8), 125, 3.5),
    ('Aisle', (2.3,-1.4,3.4), 95, 2.5),
    ('Top rail', (0,1.4,3.2), 105, 2.7),
]:
    light = bpy.data.lights.new(label, 'AREA')
    lamp = bpy.data.objects.new(label, light)
    studio.objects.link(lamp)
    lamp.location = position
    lamp.rotation_euler = (focus - lamp.location).to_track_quat('-Z','Y').to_euler()
    light.energy = energy
    light.shape = 'DISK'
    light.size = size
world = bpy.data.worlds.new('Seafood counter studio')
scene.world = world
world.use_nodes = True
world.node_tree.nodes.get('Background').inputs[0].default_value = (.22, .22, .20, 1)
world.node_tree.nodes.get('Background').inputs[1].default_value = .45
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_perspective = 'CAMERA'
scene.render.resolution_x = 960
scene.render.resolution_y = 600
scene.render.resolution_percentage = 100
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.engine='CYCLES'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
