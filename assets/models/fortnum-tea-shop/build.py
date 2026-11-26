"""Model the public Sweet Park tea-shop entrance from the photographed customer aisle."""
from math import cos, sin, tau
from pathlib import Path
import sys

import bpy

here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(here.parents[2] / 'tools'))
import blender_shop_mesh as shop

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene['reference'] = 'Gangnam Sweet Park visitor photograph, February 2026; Shinsegae B1 guide, November 25, 2026.'
shop.group = bpy.data.collections.new('FortnumSweetPark')
scene.collection.children.link(shop.group)
colors = {
    'oak': '997548', 'walnut': '67472B', 'recess': '705132', 'edge': 'B48A58',
    'gold': 'AA8C51', 'dark': '44392F', 'jamb': '7E623F', 'canopy': '494A3E',
    'cream': 'E9DECA', 'carpet': 'A8243C', 'label': 'FAE9C6', 'lit': 'FFFAE7',
    'soffit': 'DFD3BB', 'cream stone': 'ECE6DA', 'black marble': '302F2D', 'teal': '52AFA8', 'blue': '89B6C1', 'pink': 'DE939B', 'rose': 'B85B74',
    'mint': 'A5C6A2', 'ochre': 'DEA954', 'green': '64A888', 'screen': '53BBB7',
}
for name, rgb in colors.items():
    shop.palette[name] = shop.material(name, rgb, .35 if name == 'gold' else 0)
shop.palette['lit'].node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value = (1, .90, .68, 1)
shop.palette['lit'].node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = .55

# The opening faces native -Y. Depth here increases into the shop.
def box(name, x, depth, z, w, d, h, mat, bevel=0):
    return shop.block(name, x, -depth, z, w, d, h, mat, bevel)

def profile(name, x, depth, z, rings, mat, segments=16):
    return shop.profile(name, x, -depth, z, rings, mat, segments)

# The existing floor and fixed partitions retain the complete guide cell.
box('Cream entrance sill', 0, .26, .026, 2.92, .55, .018, 'cream')
box('Crimson sales carpet', 0, 2.26, .026, 2.91, 3.48, .018, 'carpet')
# The shopfront photograph shows the threshold meeting a small black-inset marble border.
box('Cream stone approach', 0, -.48, .026, 3.00, .98, .018, 'cream stone')
for i in range(-2,3):
    for j in range(2):
        x, depth, z = i*.60, -.2-j*.49, .046
        shop.piece('Black marble lozenge', [(x-.051,-depth,z),(x,-depth-.051,z),
                     (x+.051,-depth,z),(x,-depth+.051,z)], [(0,1,2,3)], 'black marble')
for depth in (-.82,-.915):
    box('Marble cross strip',0,depth,.044,3.0,.037,.003,'black marble')
# The canopy and lined side walls enclose the tea display behind the shallow oak surround.
for side in (-1,1):
    box('Panelled side wall',side*1.437,2.06,.045,.062,3.80,2.48,'oak')
    for bay in range(4):
        depth=.78+bay*.85
        box('Side wall frame',side*1.397,depth,.27,.024,.72,1.97,'recess')
        box('Side wall infill',side*1.378,depth,.31,.019,.65,1.89,'oak')
box('Pale underside of shop canopy',0,2.04,2.44,2.87,3.87,.105,'soffit')
for side in (-1,1):
    for depth in (.46,1.48,2.51,3.57):
        profile('Recessed shop downlight',side*.84,depth,2.427,[(.046,0),(.048,.016)],'lit',12)
for x in (-1.41, 1.41):
    box('Oak doorway upright', x, .10, .04, .13, .26, 2.38, 'oak')
    box('Foot of doorway upright', x, .10, .04, .16, .29, .16, 'recess')
    box('Inside edge of architrave', x * .948, .10, .19, .025, .18, 2.19, 'edge')
box('Panelled oak fascia', 0, .10, 2.38, 2.96, .27, .48, 'oak')
for x, w in [(-1.13, .56), (0, 1.58), (1.13, .56)]:
    box('Recessed fascia moulding', x, -.042, 2.44, w, .035, .31, 'recess')
    box('Inset oak panel', x, -.059, 2.46, w-.055, .018, .26, 'oak')
box('Dark cornice shadow', 0, .09, 2.86, 3.0, .3, .045, 'walnut')
box('Green-grey fascia cap', 0, .13, 2.905, 2.94, .24, .17, 'canopy')

# Only the large name is present on the entrance. The back wall carries the full brand mark.
initial_objects = set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=str(here/'wordmark.svg'))
source = next(o for o in bpy.data.objects if o not in initial_objects and o.type == 'CURVE')
source.data.resolution_u = 4
bpy.ops.object.select_all(action='DESELECT')
source.select_set(True)
bpy.context.view_layer.objects.active = source
bpy.ops.object.convert(target='MESH')
converted = bpy.context.object
vertices = [converted.matrix_world @ v.co for v in converted.data.vertices]
xmin, xmax = min(v.x for v in vertices), max(v.x for v in vertices)
ymin, ymax = min(v.y for v in vertices), max(v.y for v in vertices)
for front, width, depth, base, mat in [(True, 2.12, -.078, 2.52, 'lit'), (False, .92, 3.86, 1.72, 'teal')]:
    cutoff = ymin+(ymax-ymin)*.32 if front else ymin-1e-5
    ids = [v.index for v in converted.data.vertices if vertices[v.index].y >= cutoff]
    lookup = {v:i for i,v in enumerate(ids)}
    factor = width/(xmax-xmin)
    bottom = min(vertices[i].y for i in ids)
    pts = [((vertices[i].x-(xmin+xmax)/2)*factor, -depth, base+(vertices[i].y-bottom)*factor) for i in ids]
    faces = [tuple(lookup[i] for i in f.vertices) for f in converted.data.polygons if all(i in lookup for i in f.vertices)]
    shop.piece('Raised white Fortnum & Mason lettering' if front else 'Back wall brand mark', pts, faces, mat)
bpy.data.objects.remove(converted, do_unlink=True)

def tin(x, depth, base, radius, height, tint):
    # Continuous colour bands keep each tin editable without buried lids or concentric caps.
    rings=[(radius*.96,0),(radius,.012),(radius,height*.31),(radius,height*.61),
           (radius,height-.012),(radius*1.025,height-.01),(radius*1.025,height)]
    seg=10
    obj=profile('Printed tea caddy with foil lid',x,depth,base,rings,tint,seg)
    obj.data.materials.append(shop.palette['label'])
    obj.data.materials.append(shop.palette['gold'])
    for i,poly in enumerate(obj.data.polygons):
        band=i//seg
        if band==2:poly.material_index=1
        elif band in (4,5) or i==len(obj.data.polygons)-1:poly.material_index=2

for side, tints in [(-1,['pink','mint','ochre','green']), (1,['blue','pink','ochre','teal'])]:
    x = side*.99
    profile('Espresso-brown drum plinth', x, .56, .044, [(.225,0),(.225,.23),(.30,.27)], 'dark', 24)
    profile('Round display core', x, .56, .30, [(.15,0),(.15,1.25)], 'walnut')
    for level, tint in enumerate(tints):
        z = .30+.295*level
        profile('Circular walnut shelf', x, .56, z, [(.325,0),(.325,.036),(.312,.043)], 'walnut', 28)
        for i in range(11):
            a = tau*i/11
            tin(x+.245*cos(a), .56+.245*sin(a), z+.043, .064, .205, tint)
box('Rear sales wall', 0, 3.93, .045, 2.88, .10, 2.38, 'cream')
box('Rear screen in brass frame', 0, 3.84, 1.03, .84, .065, .52, 'gold')
box('Tea colour screen', 0, 3.80, 1.05, .79, .018, .475, 'screen')
for x in [-.99, .99]:
    box('Side cabinet backing', x, 3.79, .21, .72, .13, 1.37, 'walnut')
    for level in range(3):
        z=.39+.36*level
        box('Recessed cabinet shelf', x, 3.61, z, .72, .29, .035, 'oak')
        for i in range(4):
            tin(x+(i-1.5)*.143, 3.61, z+.04, .059, .168, ['teal','pink','green'][level])
for x in [-.54,.54]:
    for depth in [2.04,2.49]:
        box('Display table leg',x,depth,.045,.04,.04,.62,'walnut')
box('Low central oak table',0,2.27,.665,1.18,.57,.065,'oak',.012)
for i in range(5):
    x=(i-2)*.20
    box('Tea presentation carton',x,2.32,.73,.167,.22,.20+.04*(i%2),['teal','mint','cream'][i%3],.004)
    tin(x,2.08,.73,.062,.14,['pink','teal','ochre'][i%3])
scene['dimensions'] = 'Photo proportions fitted to the public guide. Customer doorway and display furniture are approximate.'
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'tea-shop.blend'),compress=True)
