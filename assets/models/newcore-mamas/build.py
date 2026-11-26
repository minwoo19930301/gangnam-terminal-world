"""Build the street-facing cafe bay shown in the April 2025 Gangnam visit photo."""
import math
from pathlib import Path
import runpy
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('NC_MamasStreetFront')
bpy.context.scene.collection.children.link(collection)
materials = {}


def finish(tone):
    if tone not in materials:
        material = bpy.data.materials.new(tone)
        rgb = [int(tone[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        material.diffuse_color = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb] + [1]
        materials[tone] = material
    return materials[tone]


def mesh(name, vertices, faces, tone):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    data.materials.append(finish(tone))
    return obj


def bar(name, x, y, z, width, depth, height, tone):
    vertices = [(x + i * width / 2, y + j * depth / 2, z + k * height)
                for k in (0, 1) for i, j in ((-1,-1),(1,-1),(1,1),(-1,1))]
    return mesh(name, vertices, [(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)], tone)


def letters(label, font, width, height, y, center_z, tone, depth):
    curve = bpy.data.curves.new(label, 'FONT')
    curve.body, curve.font = label, font
    curve.align_x, curve.align_y = 'CENTER', 'CENTER'
    curve.resolution_u = 4
    curve.extrude = depth / 2
    obj = bpy.data.objects.new(label, curve)
    collection.objects.link(obj)
    curve.materials.append(finish(tone))
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    bounds = [(min(axis), max(axis)) for axis in zip(*(v.co for v in obj.data.vertices))]
    for vert in obj.data.vertices:
        for axis, extent in ((0, width), (1, height)):
            low, high = bounds[axis]
            vert.co[axis] = (vert.co[axis] - (low + high) / 2) * extent / (high - low)
    obj.rotation_euler.x = math.pi / 2
    obj.location = (0, y, center_z)
    return obj


def half_round(name, radius, width, y, tone):
    # The three parallel grooves lie inside the lighter stone arch.
    count = 52
    vertices = [(r * math.cos(i * math.pi / count), y, 6.05 + r * math.sin(i * math.pi / count))
                for i in range(count + 1) for r in (radius, radius + width)]
    return mesh(name, vertices, [(2*i,2*i+1,2*i+3,2*i+2) for i in range(count)], tone)


for r in (3.30,3.39,3.48):
    half_round('Arched reveal · recessed edge',r,.026,-.295,'575d5e')
    half_round('Arched reveal · stone lip',r+.026,.015,-.302,'c2c1b7')

font_dir = Path('/System/Library/Fonts/Supplemental')
numeral = bpy.data.fonts.load(str(font_dir / 'Arial.ttf'))
hangul = bpy.data.fonts.load(str(font_dir / 'Arial Unicode.ttf'))
serif = bpy.data.fonts.load(str(font_dir / 'Georgia Bold.ttf'))
# Separate letter shells and bronze returns stand proud of the grey arch.
for label, font, width, height, z in [('3',numeral,.95,1.32,8.16),('뉴코아3관',hangul,1.48,.248,7.05)]:
    letters(label, font, width, height, -.346, z, '8a795b', .105)
    letters(label, font, width, height, -.406, z + .004, 'ecdfbb', .018)
for z in (6.84,7.28):
    bar('Cast rule · folded bronze edge',0,-.346,z,1.52,.14,.052,'8e7958')
    bar('Cast rule · brushed face',0,-.425,z+.018,1.53,.027,.039,'e7d9b6')

# The black hood rises to the spring line, its sewn strips running down the slope.
width, rear, front, top, lip = 6.905, -.33, -2.03, 6.09, 2.98
tones = ['363535','393839','363536','383738','343434','393839']
for i,tone in enumerate(tones):
    left, right = -width/2 + width*i/len(tones), -width/2 + width*(i+1)/len(tones)
    mesh('Graphite canopy · fabric panel',
         [(left,front,lip),(right,front,lip),(right,rear,top),(left,rear,top)],[(0,1,2,3)],tone)
    if i:
        mesh('Canopy · stitched seam',
             [(left-.007,front-.006,lip+.002),(left+.007,front-.006,lip+.002),
              (left+.007,rear-.006,top+.002),(left-.007,rear-.006,top+.002)],[(0,1,2,3)],'4b4949')
for x in (-width/2,width/2):
    mesh('Canopy · folded side return',[(x,front,lip),(x,rear,lip),(x,rear,top)],[(0,1,2)],'28292a')
bar('Black valance',0,front-.044,2.67,width,.104,.31,'343536')
bar('Lower fabric hem',0,front-.105,2.67,width,.021,.025,'474747')
letters('café MAMAS',serif,1.96,.199,front-.104,2.832,'f2eee6',.020)

# Customer-facing fixed panels flank the existing opening. Nothing crosses the door.
bar('Glazed left sidelight · reveal',-2.59,-.161,.05,1.55,.105,2.57,'373d3a')
bar('Glazed left sidelight · glazing',-2.59,-.221,.10,1.41,.025,2.40,'63746e')
bar('Glazed left sidelight · frosted lower light',-2.59,-.243,.10,1.41,.016,.86,'c6d0c8')
for z in (.95,2.42):
    bar('Sidelight · horizontal stop',-2.59,-.254,z,1.43,.032,.038,'8d948a')
bar('Charcoal entrance side panel',2.61,-.159,.04,1.52,.115,2.57,'303233')
bar('Recessed transom',0,-.158,2.61,6.76,.125,.22,'303332')
for x in (-1.80,1.80):
    bar('Door surround · folded metal jamb',x,-.181,.05,.055,.18,2.62,'343833')
    bar('Door surround · edge',x-.016,-.278,.05,.014,.010,2.61,'8e948a')

bpy.ops.object.select_all(action='DESELECT')
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / 'front.blend'), compress=True)
runpy.run_path(str(here / 'export.py'))
