"""Sweet Park chocolate shop from the Gangnam branch photograph, in Blender metres."""
from math import cos, pi, sin
from pathlib import Path
import json
import runpy
import subprocess
import sys
import bpy
from mathutils import Matrix, Vector

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as shop
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['reference']='Shinsegae Group newsroom, Sweet Park opening, February 2024, photograph of the Pierre Marcolini shop.'
scene['dimensions']='Interpretive fit within the public customer guide. No measured survey of the shop furniture.'
body,glass,light=[bpy.data.collections.new(name) for name in ('GangnamChocolatier','Glass','Lit')]
for coll in (body,glass,light):
    scene.collection.children.link(coll)
    coll['bundle']='chocolatier'
    coll['origin']=(0,0,0)
shop.group=body
for name,code in {
    'copper':'D98363','rose':'ECA98A','joint':'A75C46','shadow':'7F4435','polished':'A65E47',
    'glint':'E2A589','stone':'F2E2D1','cream':'FBF0D7','gold':'C49869','iron':'342A29',
    'steel':'ABA396','mirror':'C9B6AC','cocoa':'483731','dark':'2C2525','praline':'885336',
    'ivory':'F5E6BD','berry':'BC3043','red':'DB3840','lemon':'E5C655','foil':'BA9959',
    'display':'67616C','paper':'F0DDCB','white':'FFF5E5','glass':'D5E6E4','pink':'ECA3A0',
}.items():
    shop.palette[name]=shop.material(name,code, .46 if name in ('copper','polished','gold','steel') else 0)
trans=shop.palette['glass']
trans.diffuse_color=(.72,.86,.86,.09)
trans.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value=.09

def box(name,x,depth,z,w,d,h,finish,bevel=0):
    return shop.block(name,x,-depth,z,w,d,h,finish,bevel)

def prism(name,outline,base,top,finish):
    n=len(outline)
    coords=[(x,-d,z) for z in (base,top) for x,d in outline]
    faces=[tuple(range(n)),tuple(reversed(range(n,2*n)))]
    faces.extend((i,n+i,n+(i+1)%n,(i+1)%n) for i in range(n))
    return shop.piece(name,coords,faces,finish)

def rod(name,points,r,finish,seg=8):
    return shop.rod(name,[(x,-d,z) for x,d,z in points],r,finish,seg)

def round_box_outline(x0,d0,x1,d1,r):
    points=[]
    for cx,cy,start in [(x1-r,d0+r,-90),(x1-r,d1-r,0),(x0+r,d1-r,90),(x0+r,d0+r,180)]:
        for j in range(7):
            a=(start+15*j)*pi/180
            points.append((cx+r*cos(a),cy+r*sin(a)))
    return points

# The cream floor and salmon lining stop inside the existing public tile piers.
box('Pale stone floor inside the threshold',0,2.95,.024,7.57,5.79,.018,'stone')
box('Blush rear wall',0,5.67,.04,7.55,.075,3.78,'rose')
box('North wall in copper-coloured plaster',3.72,2.94,.04,.071,5.55,3.78,'copper')
box('Warm lining above the glass cases',0,2.99,3.75,7.54,5.66,.10,'copper')
for j in range(5):
    box('Fine ceiling panel joint',-2.5+j*1.25,2.99,3.744,.009,5.62,.006,'joint')
outline=json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {counterOutline} from './layout.js';console.log(JSON.stringify(counterOutline))"],cwd=here))
for low,high,material,label in [(.042,.114,'shadow','Recessed foot'),(.114,.131,'gold','Toe strip'),
        (.131,.924,'copper','Continuous curved copper counter'),(.924,.949,'gold','Thin brass edge'),
        (.949,.988,'cream','Stone display shelf')]:
    prism(label,outline,low,high,material)
shop.group=light
prism('Warm light below the curved case',outline,.093,.114,'cream')
shop.group=glass
outer=[(2.82,.66),*reversed(outline[8:]),(-2.86,1.44),(-2.86,4.46)]
for a,b in zip(outer,outer[1:]):
    shop.piece('Clear curved display glass',[(a[0],-a[1],.99),(b[0],-b[1],.99),
        (b[0],-b[1],1.38),(a[0],-a[1],1.38)],[(0,1,2,3)],'glass')
prism('Glass cover over the chocolates',outline,1.374,1.382,'glass')
shop.group=body
rod('Polished glass cap rail',[(x,d,1.38) for x,d in outer],.009,'steel')
for x,d in [(2.8,.66),(1.18,.66),(-.45,.66),(-2.08,.66),(-2.86,1.44),(-2.86,2.93)]:
    rod('Fine case upright',[(x,d,.99),(x,d,1.38)],.008,'steel')
# A reflective machine housing carries the white Maison wordmark behind the counter.
housing=round_box_outline(-1.43,3.62,1.52,5.46,.34)
prism('Rounded copper cabinet',housing,.044,3.44,'polished')
prism('Copper cabinet crown',housing,3.44,3.50,'glint')
box('Service worktop',-.03,3.27,1.08,3.12,.68,.068,'stone',.025)
for x in (-.97,-.69):
    box('Twin coffee machine body',x,3.29,1.15,.25,.31,.43,'steel',.035)
    box('Espresso spout',x,3.12,1.28,.08,.09,.10,'iron',.012)
for x in (.38,.60,.82):
    shop.profile('Stacked service cups',x,-3.24,1.15,[(.070,0),(.089,.13),(.092,.137)],'cream',12)
# Import the actual Korean brand site's SVG. Normalize its bounds after conversion
# so its lettering and the smaller BRUXELLES line keep their original proportions.
previous=set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=str(here/'wordmark.svg'))
for src in [o for o in bpy.data.objects if o not in previous and o.type=='CURVE']:
    bpy.ops.object.select_all(action='DESELECT')
    src.select_set(True);bpy.context.view_layer.objects.active=src
    bpy.ops.object.convert(target='MESH')
    obj=bpy.context.object
    vertices=[obj.matrix_world @ v.co for v in obj.data.vertices]
    xmin,xmax=min(p.x for p in vertices),max(p.x for p in vertices)
    ymin,ymax=min(p.y for p in vertices),max(p.y for p in vertices)
    scale=1.78/(xmax-xmin);xmin=(xmin+xmax)/2;ymin=(ymin+ymax)/2
    points=[((p.x-xmin)*scale,-3.595,2.42+(p.y-ymin)*scale) for p in vertices]
    shop.group=light
    shop.piece('PIERRE MARCOLINI / BRUXELLES official wordmark',points,[tuple(p.vertices) for p in obj.data.polygons],'white')
    bpy.data.objects.remove(obj,do_unlink=True)
shop.group=body
# The real shop has suspended luminous tubes, and small tilted customer screens.
for a,b in [((-2.50,1.42),(2.64,1.42)),((-2.50,1.42),(-2.50,4.20))]:
    for fraction in (.17,.81):
        x=a[0]+(b[0]-a[0])*fraction;d=a[1]+(b[1]-a[1])*fraction
        rod('Suspension stem',[(x,d,2.91),(x,d,3.75)],.014,'polished')
    shop.group=light
    rod('Opal tubular fixture',[(a[0],a[1],2.88),(b[0],b[1],2.88)],.037,'white',12)
    shop.group=body
    for f in (0,.5,1):
        x=a[0]+(b[0]-a[0])*f;d=a[1]+(b[1]-a[1])*f
        for z in (2.85,2.906):
            box('Copper lamp clasp',x,d,z,.041,.090,.009,'gold')
# The two front menus and the side return hang at a shallow downward angle.
# Graphics convey assortment and contrast without attributing historic prices.
for idx,(x,d,turn) in enumerate([(-2.50,2.48,-.55),(-.76,1.42,0),(1.59,1.42,0)]):
    rod('Monitor suspension',[(x,d,2.86),(x,d,2.74)],.014,'iron')
    start=set(body.objects)
    box('Menu alloy frame',x,d,2.30,.69,.055,.434,'iron',.012)
    face=d-.035
    box('Menu screen',x,face,2.32,.654,.008,.39,('display','cream','display')[idx])
    if idx<2:
        box('Dessert panel artwork',x-.134,face-.009,2.354,.335,.005,.305,('pink','paper')[idx])
        for j in range(3):
            box('Praline silhouette on artwork',x-.23+j*.089,face-.014,2.431+(j%2)*.039,
                .067,.004,.071,('cocoa','berry','praline')[j],.005)
        for row in range(4):
            box('Menu description block',x+.161,face-.009,2.376+row*.064,
                .182-.025*(row%2),.005,.008,('paper','iron')[idx])
    else:
        for row in range(2):
            for col in range(3):
                cx=x-.196+col*.195;z=2.355+row*.157
                box('Menu photograph',cx,face-.009,z,.167,.005,.126,('paper','pink','steel')[(col+row)%3])
                box('Menu chocolate',cx-.016,face-.013,z+.030,.071,.003,.048,('cocoa','berry','ivory')[col],.003)
    pivot=Vector((x,d,2.734))
    tilt=Matrix.Translation(pivot)@Matrix.Rotation(turn,4,'Z')@Matrix.Rotation(.36,4,'X')@Matrix.Translation(-pivot)
    for obj in set(body.objects)-start:
        obj.data.transform(tilt)
# Framed confection study visible on the right hand wall in the branch photo.
box('Right wall display frame',3.655,3.96,1.50,.060,1.42,1.05,'iron',.014)
box('Print inside frame',3.617,3.96,1.535,.015,1.36,.98,'display')
for row in range(4):
    for col in range(6):
        d=3.43+col*.211;z=1.62+row*.219
        box('Right wall print tile',3.606,d,z,.008,.170,.162,('paper','pink','steel')[(row+col)%3])
        box('Praline on print',3.599,d+.01,z+.034,.006,.095,.078,('cocoa','dark','praline')[(row*2+col)%3])
for x in (-2.83,-.6,1.7,3.18):
    for d in (1.03,4.82):
        shop.group=light
        shop.profile('Downlight trim',x,-d,3.728,[(.039,0),(.051,.008)],'white',12)
shop.group=body
# The confectioner's signature raspberry hearts and ganaches sit in individual wells.
heart=[(.0018*16*sin(2*pi*i/24)**3,.0018*(13*cos(2*pi*i/24)-5*cos(4*pi*i/24)-
          2*cos(6*pi*i/24)-cos(8*pi*i/24))) for i in range(24)]
for ix in range(6):
    x=-1.65+.75*ix;d=1.10
    box('Dark presentation tray',x,d,.989,.64,.53,.025,'dark',.014)
    box('Gold tray liner',x,d,1.014,.603,.49,.009,'foil')
    for j in range(3):
        for k in range(4):
            cx=x+(k-1.5)*.134;cy=d+(j-1)*.13
            box('Paper well',cx,cy,1.023,.105,.103,.009,'cocoa')
            if ix==0 or (ix==4 and j==1):
                shape=[(cx+1.23*u,cy+1.23*v) for u,v in reversed(heart)]
                prism('Raspberry heart ganache',shape,1.032,1.066,'berry')
            elif ix in (1,4):
                shop.profile('Rounded praline',cx,-cy,1.032,[(.034,0),(.043,.012),(.032,.035),(.016,.042)],'praline' if ix==1 else 'lemon',10)
            else:
                box('Square dark ganache',cx,cy,1.032,.075,.07,.035,'ivory' if ix==3 else 'cocoa',.007)
    box('Counter card',x,1.39,1.017,.18,.047,.11,'paper',.005)
for i in range(4):
    d=1.85+i*.66
    box('Gift selection box',-2.39,d,.99,.64,.54,.065,'dark',.016)
    box('Box gold inner lip',-2.39,d,1.055,.59,.49,.009,'gold')
    for k in range(3):
        for j in range(3):
            box('Gift assortment',-2.39+(k-1)*.148,d+(j-1)*.128,1.064,.093,.09,.04,('cocoa','praline','ivory')[(j+k+i)%3],.008)
for x in (2.23,2.69):
    box('Upright copper gift carton',x,1.46,1.38,.31,.15,.22,'polished',.012)
    box('Gift carton ribbon',x,1.38,1.38,.031,.012,.22,'cream')
runpy.run_path(str(here/'lighting.py'))['install'](scene)
scene['native_axes']='Blender X across the counter, positive Y into the shop, Z up.'
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            view=area.spaces.active.region_3d
            view.view_location=(0,2.5,1.65);view.view_distance=9.2
            view.view_rotation=Vector((.72,.95,-.34)).to_track_quat('-Z','Y')
            area.spaces.active.shading.color_type='MATERIAL'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'chocolatier.blend'),compress=True)
runpy.run_path(str(here/'export.py'))
