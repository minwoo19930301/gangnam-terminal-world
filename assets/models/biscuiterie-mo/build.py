"""Reconstruct the public Sweet Park M.O counter, including its numbered tins and shell cakes."""
from math import cos, sin, pi, tau, sqrt
from pathlib import Path
import runpy
import sys
import bpy

here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(here.parents[2] / 'tools'))
import blender_shop_mesh as shop

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene['reference'] = 'Shinsegae Gangnam B1 November 2026 customer plan; customer views of M.O, Wirbel, August 2024.'
body = bpy.data.collections.new('BiscuiterieMO')
panes = bpy.data.collections.new('MO glazing')
channels = bpy.data.collections.new('MO lit fittings')
for coll in (body, panes, channels):
    scene.collection.children.link(coll)
shop.group = body
colours = {'oak':'A77745','walnut':'745130','moulding':'C09459','oak shadow':'60432B',
           'dark sign':'302D2A','letters':'FCEAB0','plaster':'ECE7DF','cream':'E9E1CA',
           'orange':'C55223','inox':'A7A6A2','steel edge':'C8C4BC','dark steel':'736E68',
           'charcoal tin':'282523','number':'F3EBD8','cool glass':'BDE0E4','LED':'FFFAED',
           'biscuit crust':'A5642D','ridge':'DF9C4D','shell':'C8833F','paper':'E9DFBF',
           'dark nib':'523325','purple':'514783','stool':'A78052','rack':'AAA59C','mint':'A9CABA','cacao':'5D3529','glaze':'AF6D2D','sugar':'F4EADD'}
for key, color in colours.items():
    shop.palette[key] = shop.material(key, color, .48 if key in ('inox','steel edge','rack') else 0)
glass = shop.palette['cool glass']
nodes=glass.node_tree.nodes;links=glass.node_tree.links
glass_shader=nodes.get('Principled BSDF')
glass_shader.inputs['Base Color'].default_value=(.93,.97,.985,1)
glass_shader.inputs['Transmission Weight'].default_value=1
glass_shader.inputs['Roughness'].default_value=.055
mix=nodes.new('ShaderNodeMixShader');mix.inputs[0].default_value=.20
links.new(nodes.new('ShaderNodeBsdfTransparent').outputs[0],mix.inputs[1])
links.new(glass_shader.outputs['BSDF'],mix.inputs[2])
links.new(mix.outputs[0],nodes.get('Material Output').inputs['Surface'])
for key, strength in [('LED', 2.1), ('letters', .6)]:
    mat=shop.palette[key]; shader=mat.node_tree.nodes['Principled BSDF']
    shader.inputs['Emission Color'].default_value=mat.diffuse_color
    shader.inputs['Emission Strength'].default_value=strength

# Doorway at y=0. Positive depth faces into the operator's unit.
def box(name,x,depth,z,w,d,h,mat,bevel=0):
    return shop.block(name,x,-depth,z,w,d,h,mat,bevel)

def rod(name, points, rad, mat, sides=8):
    return shop.rod(name, [(x,-d,z) for x,d,z in points],rad,mat,sides)

def profile(name, x, d, z, rings, mat, n=16, aspect=1):
    return shop.profile(name,x,-d,z,rings,mat,n,aspect)

def glaze(name,x,d,z,w,depth,h):
    shop.group=panes
    box(name,x,d,z,w,depth,h,'cool glass')
    shop.group=body

# The transom continues the vaulted public arcade. Its fixed panes sit over the timber fascia.
half=3.80
box('Orange shop floor',0,2.88,.032,7.63,5.78,.020,'orange')
box('Pale shop ceiling',0,3.01,3.15,7.58,5.80,.09,'plaster')
box('Back plaster',0,5.78,.04,7.57,.07,3.12,'plaster')
for side in (-1,1):
    box('Side plaster',side*3.77,3.14,.05,.09,5.33,3.11,'plaster')
    box('Oak doorway jamb',side*3.72,.09,.05,.17,.27,2.44,'oak')
box('Oak lintel',0,.095,2.48,7.58,.25,.67,'oak')
for x,w in [(-3.09,1.12),(-1.92,1.03),(0,2.57),(1.92,1.03),(3.09,1.12)]:
    box('Inset panel shadow',x,-.042,2.535,w,.031,.53,'oak shadow')
    box('Panel moulding',x,-.064,2.56,w-.055,.022,.476,'moulding')
    box('Sign plate' if x==0 else 'Joinery panel',x,-.083,2.581,w-.10,.018,.435,
        'dark sign' if x==0 else 'oak')
box('Upper cornice',0,.05,3.107,7.65,.34,.059,'walnut')
arch_pts=[(half*cos(pi*i/32),.092,3.16+1.085*sin(pi*i/32)) for i in range(33)]
rod('Oak transom arch',arch_pts,.063,'oak')
shop.group=panes
vertices=[(x,-d,z) for x,d,z in arch_pts]
shop.piece('Fixed upper arched glazing',vertices,[(0,i,i+1) for i in range(1,len(vertices)-1)],'cool glass')
shop.group=body
for i in range(-5,6):
    x=i*.655
    box('Oak transom mullion',x,.086,3.15,.046,.097,1.085*sqrt(1-(x/half)**2),'oak')

# Sign silhouette traced from the shop's photographed white pavement placard.
def logo(name,width,x,d,z,mat):
    points=[(x+px*width,-d,z+pz*width) for px,pz in mark_points]
    return shop.piece(name,points,mark_faces,mat)

before=set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=str(here/'shop-sign.svg'))
for curve in [o for o in bpy.data.objects if o not in before and o.type=='CURVE']:
    bpy.ops.object.select_all(action='DESELECT');curve.select_set(True);bpy.context.view_layer.objects.active=curve
    bpy.ops.object.convert(target='MESH')
    obj=bpy.context.object
    coords=[obj.matrix_world@v.co for v in obj.data.vertices]
    lo,hi=min(v.x for v in coords),max(v.x for v in coords); base=min(v.y for v in coords)
    mark_points=[((v.x-(lo+hi)/2)/(hi-lo),(v.y-base)/(hi-lo)) for v in coords]
    mark_faces=[tuple(poly.vertices) for poly in obj.data.polygons]
    shop.group=channels
    logo('Raised wave logo and Biscuiterie M.O wordmark',.70,0,-.097,2.617,'letters')
    shop.group=body
    bpy.data.objects.remove(obj,do_unlink=True)

# The cabinets in the visitor photograph run down both sides of the front till.
case_front,case_back=1.99,2.82
for x,w,open_shelf in [(-1.57,3.88,True),(1.25,1.70,False)]:
    box('Recessed toe kick',x,2.445,.06,w-.11,.58,.09,'dark steel')
    box('Rear of sales cabinet',x,2.77,.15,w,.08,.77,'cream')
    box('Base rail',x,2.40,.15,w,.83,.055,'oak')
    box('Steel display deck',x,2.40,.90,w+.01,.85,.047,'inox')
    for off in [-w/2+.027,w/2-.027]:
        box('Oak edge upright',x+off,2.40,.18,.055,.80,.72,'oak')
    if open_shelf:
        box('Front sill',x,case_front,.15,w,.043,.068,'oak')
        for j in range(1,9):
            box('Thin steel cubby divider',x-w/2+w*j/9,2.34,.215,.016,.62,.685,'dark steel')
    else:
        box('Cream counter face',x,case_front,.20,w-.09,.046,.666,'plaster')
    for off in (-w/2+.024,w/2-.024):
        box('Fine case upright',x+off,case_front,.94,.025,.028,.51,'steel edge')
    glaze('Clear customer-side glass',x,case_front+.01,.946,w-.052,.012,.517)
    glaze('Upper display shelf',x,2.39,1.197,w-.025,.70,.013)
    glaze('Glass case lid',x,2.402,1.46,w-.014,.839,.012)
    for depth in (case_front,case_back):
        box('Polished case edge',x,depth,1.454,w,.026,.019,'steel edge')
    for off in (-w/2+.02,w/2-.02):
        glaze('Glass case return',x+off,2.406,.943,.012,.823,.52)

def numeral(value,x,d,z):
    text=bpy.data.curves.new('Tin size','FONT');text.body=str(value);text.align_x='CENTER';text.size=.076
    o=bpy.data.objects.new('Tin number '+str(value),text);body.objects.link(o)
    o.location=(x,d,z);o.rotation_euler.x=pi/2;text.materials.append(shop.palette['number'])
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH')

for col in range(9):
    x=-3.51+(col+.5)*3.88/9
    if col<3:
        for k in range(3):
            box('Biscuit gift carton',x,2.21,.218+.101*k,.31,.26,.092,'purple',.005)
            box('Gift carton cream band',x,2.077,.24+.101*k,.18,.006,.023,'cream')
    else:
        for k in range(3):
            r=.175-.014*k
            profile('Black round numbered tin',x,2.20,.217+.155*k,[(r,0),(r,.126),(r*1.02,.13),(r*1.02,.152)],'charcoal tin',20,.85)
            numeral(5-k,x,2.20-r*.85-.006,.244+.155*k)

def shell(x,depth,z,angle,size):
    # Six longitudinal mould flutes broaden toward the scalloped end of each madeleine.
    verts=[];faces=[];rings=7;segs=16
    for i in range(rings+1):
        lat=-pi/2+pi*i/rings
        for j in range(segs):
            lon=tau*j/segs
            a=.076*sin(lat);b=.045*cos(lat)*cos(lon)*(1+.14*sin(lat))
            top=sin(lon)
            ridge=.006*cos(5*pi*cos(lon)) if top>0 else 0
            c=.021*cos(lat)*top+ridge*max(0,top)*cos(lat)
            verts.append((x+size*(a*cos(angle)-b*sin(angle)),-depth-size*(a*sin(angle)+b*cos(angle)),z+size*c))
    for i in range(rings):
        for j in range(segs):
            q=i*segs+j;n=i*segs+(j+1)%segs
            faces.append((q,n,n+segs,q+segs))
    ob=shop.piece('Fluted madeleine',verts,faces,'shell')
    for key in ('ridge','biscuit crust'):ob.data.materials.append(shop.palette[key])
    for idx,f in enumerate(ob.data.polygons):
        j=idx%segs
        f.material_index=1 if j in (2,4,6) else 2 if j in (1,7,9,11) else 0
        f.use_smooth=True

def pouch(x,depth,z,variant):
    # The photographed bag is heat-sealed at the top and stands on a gusset.
    w=.088;d=.045
    corners=[(-w,-d,0),(w,-d,0),(w,d,0),(-w,d,0),
             (-w*1.13,-d*.62,.165),(w*1.13,-d*.62,.165),(w*1.13,d*.62,.165),(-w*1.13,d*.62,.165),
             (-w*1.21,-.009,.224),(w*1.21,-.009,.224),(w*1.21,.009,.224),(-w*1.21,.009,.224)]
    pts=[(x+a,-depth-b,z+c) for a,b,c in corners]
    faces=[(4*j+k,4*j+(k+1)%4,4*j+4+(k+1)%4,4*j+4+k) for j in range(2) for k in range(4)]
    shop.group=panes
    shop.piece('Clear gusseted biscuit pouch',pts,faces,'cool glass')
    shop.group=body
    box('Sealed upper edge',x,depth,z+.214,.205,.014,.009,'steel edge')
    for k in range(5):
        px=x+(-.041 if k%2==0 else .033)
        ob=profile('Baked bite in pouch',px,depth+(k%3-1)*.015,z+.012+(k//2)*.049,
                   [(.024,0),(.037,.014),(.031,.043),(.018,.051)],'shell' if (k+variant)%3 else 'dark nib',9,.8)
    box('Mint M.O pouch label',x,depth-.047,z+.046,.125,.004,.084,'mint')
    logo('M.O pouch print',.093,x,depth-.050,z+.061,'charcoal tin')

def scored_tart(x,depth,z):
    profile('Pithiviers puff pastry',x,depth,z,
            [(.157,0),(.184,.013),(.184,.029),(.169,.045),(.09,.061),(.020,.067)],'glaze',44)
    for j in range(23):
        pts=[]
        for k in range(7):
            t=k/6;r=.021+.145*t;a=tau*j/23+.78*(1-t)**1.45
            pts.append((x+r*cos(a),depth+r*sin(a),z+.066-.022*t*t))
        rod('Curved score on the pastry crust',pts,.0028,'ridge',4)

def wrapped_biscuit(x,d,z,flavor):
    box('Cream backing in a clear biscuit sleeve',x,d,z,.096,.117,.006,'paper')
    profile('Individually wrapped biscuit',x,d,z+.006,
            [(.039,0),(.044,.008),(.041,.021),(.031,.024)],flavor,12)
    glaze('Clear sleeve over biscuit',x,d,z+.031,.098,.118,.0016)
    box('Crimped sleeve edge',x,d-.055,z+.031,.096,.006,.003,'sugar')

for shelf,height in enumerate([.957,1.213]):
    for tray,(x,depth) in enumerate([(-3.03,2.31),(-2.37,2.32),(-1.71,2.32),(-1.04,2.31),(-.37,2.31),(.80,2.32),(1.50,2.32)]):
        box('Stainless baking tray',x,depth,height,.60,.46,.021,'inox',.006)
        for i in range(7):
            rod('Baking rack wire',[(x-.25,depth-.162+i*.055,height+.027),(x+.25,depth-.162+i*.055,height+.027)],.0038,'rack',5)
        if shelf and tray==2:
            for j in range(3):pouch(x+(j-1)*.185,depth,height+.031,j)
        elif shelf and tray==1:
            scored_tart(x,depth,height+.031)
        elif not shelf and tray in (0,1,2,3):
            for j in range(4):
                for k in range(2):
                    wrapped_biscuit(x+(j-1.5)*.136,depth+(k-.5)*.145,height+.032,
                                   ['cacao','cream','shell','biscuit crust'][(j+tray)%4])
        else:
            for j in range(4):
                for k in range(2 if tray!=5 else 3):
                    dx=(j-1.5)*.115;dd=(k-.5)*.11
                    if tray in (0,3,6) and shelf==1:
                        profile('Small financier',x+dx,depth+dd,height+.031,
                                [(.035,0),(.049,.037),(.046,.052),(.032,.058)],'biscuit crust',10)
                    else:
                        shell(x+dx,depth+dd,height+.061,.62+.21*((j+tray)%3),.96)
        box('Ivory product tab',x,depth-.201,height+.026,.116,.016,.049,'paper')

# Back service wall: stainless panels and dark handles, with lit display recess at the left.
for i in range(6):
    x=-.91+i*.56
    box('Back kitchen stainless facing',x,5.68,.89,.545,.050,2.16,'inox')
    box('Kitchen panel joint',x-.269,5.644,.89,.012,.024,2.17,'dark steel')
    box('Kitchen cabinet handle',x+.20,5.61,1.46,.021,.032,.21,'dark steel')
for i in range(8):
    x=-3.34+i*.90
    box('Rear lower cabinetry',x,5.35,.05,.885,.73,.78,'plaster')
    box('Pull on rear drawer',x,4.973,.65,.09,.018,.027,'dark steel')
box('Rear stainless worktop',0,5.35,.83,7.46,.77,.065,'inox')
for level in range(3):
    z=1.2+level*.398
    box('Left wall sales shelf',-3.60,3.83,z,.28,2.64,.028,'plaster')
    for i in range(6):
        d=2.79+i*.37
        c='purple' if i<3 else 'charcoal tin'
        if i<3:box('Purple biscuit boxed stock',-3.56,d,z+.034,.18,.28,.17,c)
        else:profile('Black shelf tin',-3.56,d,z+.033,[(.107,0),(.107,.15),(.11,.166)],c)
    shop.group=channels
    box('Under-shelf LED',-3.49,3.83,z-.016,.014,2.63,.015,'LED')
    shop.group=body
for x,w in [(-2.30,2.36),(.22,2.29),(2.64,1.75)]:
    for off in [-.40,.40]:
        rod('Lamp suspension wire',[(x+off*w,2.55,2.60),(x+off*w,2.55,3.145)],.006,'dark steel',6)
    box('Slim suspended bar',x,2.55,2.57,w,.047,.044,'steel edge')
    shop.group=channels
    box('Diffuser',x,2.55,2.563,w-.026,.037,.009,'LED')

    shop.group=body

# A short standing bar is visible at the right-hand end of the counter.
box('Wall-facing bar top',2.94,2.46,1.02,1.59,.65,.069,'oak')
for x in [2.43,3.19]:
    profile('Bar stool round seat',x,1.98,.68,[(.18,0),(.19,.027),(.17,.047)],'stool')
    for sx in (-1,1):
        for sd in (-1,1):
            rod('Stool leg',[(x+sx*.127,1.98+sd*.126,.058),(x+sx*.108,1.98+sd*.108,.68)],.018,'oak')
    rod('Stool foot rest',[(x-.125,1.85,.28),(x+.125,1.85,.28)],.012,'steel edge')
scene['dimensions']='Frontage fitted to the mapped unit. Counter depth, furnishings and stock are photo-proportioned.'
runpy.run_path(str(here/'lighting.py'))['install'](scene)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'biscuiterie.blend'),compress=True)
