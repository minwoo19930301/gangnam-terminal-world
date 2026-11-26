"""Build the editable passenger cabin and bake its two original window views."""
import math
import os
import subprocess
import tempfile
from pathlib import Path

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 20
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = 1600, 216
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.view_settings.view_transform = 'AgX'
scene.world = bpy.data.worlds.new('Soft overcast at the platform')
scene.world.color = (.22, .26, .30)
scene.unit_settings.system = 'METRIC'
bpy.context.preferences.filepaths.save_version = 0


def collection(name):
    group = bpy.data.collections.new(name)
    scene.collection.children.link(group)
    return group


cabin = collection('Passenger cabin · 28 seats')
studio = collection('Window bake · cameras and lights')


def material(name, rgb, roughness=.55, metallic=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*rgb, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*rgb, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    return mat


camel = material('Cognac leather bolsters', (.36, .17, .077), .45)
linen = material('Warm ivory headrest cover', (.77, .63, .45), .72)
espresso = material('Espresso seat leather', (.105, .055, .043), .48)
seam = material('Leather topstitch cord', (.48, .32, .18), .70)
steel = material('Brushed aluminium', (.27, .32, .34), .33, .60)
shell = material('Graphite seat back', (.085, .095, .10))
curtain = material('Pleated stone-colour curtain', (.32, .26, .205), .86)
shadow = material('Window beyond opposite aisle', (.038, .064, .074), .45)
valance = material('Luggage shelf and parcels', (.12, .135, .14))


def mesh(name, verts, faces, mat, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    data.materials.append(mat)
    cabin.objects.link(obj)
    if smooth:
        for poly in data.polygons:
            poly.use_smooth = True
    return obj


def rounded(name, pos, size, mat, bevel=.025, tilt=0):
    x, y, z = (v/2 for v in size)
    obj = mesh(name, [(-x,-y,-z),(x,-y,-z),(x,y,-z),(-x,y,-z),
                      (-x,-y,z),(x,-y,z),(x,y,z),(-x,y,z)],
               [(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)], mat)
    obj.location = pos
    obj.rotation_euler.x = math.radians(tilt)
    mod = obj.modifiers.new('Stitched and rounded edges', 'BEVEL')
    mod.width, mod.segments = bevel, 4
    obj.modifiers.new('Weighted upholstery normals', 'WEIGHTED_NORMAL')
    return obj


def cord(name, points, thickness, mat):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.bevel_depth, data.bevel_resolution = thickness, 2
    poly = data.splines.new('POLY')
    poly.points.add(len(points)-1)
    for pt, xyz in zip(poly.points, points):
        pt.co = (*xyz, 1)
    obj = bpy.data.objects.new(name, data)
    data.materials.append(mat)
    cabin.objects.link(obj)
    return obj


def upholstery(name, cross_sections, mat):
    # Each (z, y, width, depth) section rounds a panel in both horizontal axes.
    verts, faces = [], []
    n = 24
    for z, centre, width, depth in cross_sections:
        for i in range(n):
            a = 2*math.pi*i/n
            c, s = math.cos(a), math.sin(a)
            verts.append((width*.5*math.copysign(abs(c)**.58,c),
                          centre+depth*.5*math.copysign(abs(s)**.66,s),z))
    for level in range(len(cross_sections)-1):
        for i in range(n):
            j=(i+1)%n
            faces.append((level*n+i,level*n+j,(level+1)*n+j,(level+1)*n+i))
    faces += [tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))]
    return mesh(name, verts, faces, mat, True)


# A single editable master supplies every row by linked mesh data.
seat = [
    rounded('Seat pedestal', (0,.08,1.42), (.20,.26,.50), shell, .037),
    rounded('Cushion · main bolster', (0,-.12,1.73), (.54,.64,.16), camel, .069),
    rounded('Cushion · inset', (0,-.175,1.807), (.38,.44,.06), espresso,.029),
    upholstery('Reclining seat back', [(1.73,.13,.45,.12),(1.82,.14,.54,.17),
            (2.17,.21,.52,.19),(2.35,.24,.46,.17),(2.48,.26,.36,.15)],camel),
    upholstery('Back · trapezoidal centre insert', [(1.80,.048,.32,.07),(1.94,.064,.38,.09),
            (2.17,.119,.36,.08),(2.32,.154,.25,.07)],espresso),
    upholstery('Ivory headrest slipcover', [(2.34,.223,.30,.16),(2.39,.225,.42,.19),
            (2.52,.248,.43,.19),(2.57,.256,.34,.15)],linen),
    rounded('Tray table in stowed position', (0,.317,2.055),(.31,.033,.29),shell,.015,-9),
]
for side in (-1,1):
    seat.append(rounded('Armrest · support', (side*.264,.10,1.79),(.038,.065,.33),steel,.016,-9))
    seat.append(rounded('Armrest · pad', (side*.27,-.115,1.945),(.067,.50,.077),espresso,.03))
    seat.append(cord('Front panel piping',[(side*x,y,z) for x,y,z in [
        (.16,.031,1.82),(.19,.038,1.95),(.18,.087,2.16),(.13,.121,2.31)]],.005,seam))
for z in (1.9,1.96,2.02,2.08):
    centre=.018+(z-1.80)*.17
    seat.append(cord('Seat insert cross-stitch', [(-.154,centre+.008,z),(0,centre,z-.018),(.154,centre+.008,z)],.0025,seam))

def linked(obj, delta):
    copy=obj.copy()
    cabin.objects.link(copy)
    copy.location = obj.location + Vector(delta)
    return copy


# A 2+1 layout leaves a continuous walking aisle beside the paired seats.
# The last row runs across the back wall and has no through aisle.
positions=[(x,-4.10+row*1.02) for row in range(8) for x in (-.885,-.305,.795)]
positions.extend((x,4.06) for x in (-.875,-.295,.295,.875))
for obj in seat:
    for x,y in positions[1:]:
        linked(obj,(x,y,0))
    obj.location+=Vector((*positions[0],0))

rounded('Carpet on the upper passenger deck',(0,0,1.21),(2.42,10.66,.12),espresso)
for side in (-1,1):
    rounded('Overhead luggage rack · lower skin',(side*.91,0,2.98),(.59,10.65,.14),valance,.04)
    rounded('Parallel overhead handrail',(side*.59,0,2.91),(.043,10.63,.045),steel,.019)
    for row in range(8):
        y=-4.87+1.38*row
        # Each drape fans below the track and pinches inward at its tie.
        rings=[(1.79,.135),(1.84,.145),(2.15,.063),(2.20,.065),(2.68,.130),(3.10,.155)]
        verts,faces=[],[]
        n=24
        for z,w in rings:
            for i in range(n+1):
                t=i/n
                verts.append((side*(1.12+.042*math.cos(t*math.pi*10)),y+(t-.5)*2*w,z-.015*math.cos(t*math.pi*10)))
        for j in range(len(rings)-1):
            for i in range(n):
                v=j*(n+1)+i
                faces.append((v,v+1,v+n+2,v+n+1))
        mesh('Pleated curtain · gathered at sill',verts,faces,curtain,True)
        rounded('Woven curtain tie',(side*1.135,y,2.175),(.07,.141,.038),camel,.011)
rounded('Rear bulkhead', (0,5.18,2.1),(2.37,.12,1.82),valance,.025)
rounded('Roof liner', (0,.10,3.15),(2.36,10.63,.10),valance)
# Opposite glazing provides a tinted backdrop to each view. Hide the nearer
# background sheet during its own render, so both cameras see the upholstery.
backgrounds={s:rounded('Opposite smoked glazing', (s*1.19,0,2.36),(.008,11.1,1.56),shadow,.002) for s in (-1,1)}


def aim(obj, target):
    obj.rotation_euler = (Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()


for side in (-1,1):
    light=bpy.data.lights.new('Light through the platform windows','AREA')
    light.shape='RECTANGLE'
    light.size, light.size_y, light.energy=9.8,2.5,930
    obj=bpy.data.objects.new(light.name,light)
    studio.objects.link(obj)
    obj.location=(side*4.3,-1.70,3.9)
    aim(obj,(0,0,2.08))

cameras={}
for side in (-1,1):
    data=bpy.data.cameras.new('Side window camera')
    data.type, data.ortho_scale='ORTHO',10.77
    obj=bpy.data.objects.new('Window '+('right' if side==1 else 'left'),data)
    studio.objects.link(obj)
    obj.location=(side*20.0,-4.0,2.88)
    aim(obj,(0,-.03,2.37))
    cameras[side]=obj
scene.camera=cameras[1]
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'cabin.blend'),compress=True)
with tempfile.TemporaryDirectory() as tmp:
    for side, label in [(1,'right'),(-1,'left')]:
        scene.camera=cameras[side]
        for s,bg in backgrounds.items():
            bg.hide_render=(s==side)
        scene.render.filepath=os.path.join(tmp,label+'.png')
        bpy.ops.render.render(write_still=True)
    # Pack the two Blender views into a shared GPU texture without recompression stages.
    join = """from PIL import Image
import sys
with Image.open(sys.argv[1]) as right, Image.open(sys.argv[2]) as left:
    atlas = Image.new('RGB', (right.width, right.height*2))
    atlas.paste(right, (0, 0))
    atlas.paste(left, (0, right.height))
    atlas.save(sys.argv[3], quality=84, method=6)
"""
    subprocess.run(['uv','run','--with','pillow','python','-c',join,
                    os.path.join(tmp,'right.png'),os.path.join(tmp,'left.png'),
                    str(HERE/'windows.webp')],check=True)
