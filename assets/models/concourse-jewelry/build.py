"""Seed two editable furniture collections in metres. Blender uses Z up."""
import bpy
import math
from mathutils import Vector
from pathlib import Path

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'


def material(name, hex_color):
    rgb = tuple(int(hex_color[i:i+2], 16)/255 for i in (0, 2, 4))
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,)
    return mat


def collection(name, origin, bundle):
    group = bpy.data.collections.new(name)
    scene.collection.children.link(group)
    group['origin'] = origin
    group['bundle'] = bundle
    return group


def finish(obj, name, mat, bevel=0):
    obj.name = name
    for old in list(obj.users_collection): old.objects.unlink(obj)
    group.objects.link(obj)
    obj.location += Vector(group['origin'])
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Rolled edge','BEVEL')
        mod.width = bevel
        mod.segments = 2
    return obj


def box(name, pos, size, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    for v in obj.data.vertices:
        for i in range(3): v.co[i] *= size[i]
    return finish(obj,name,mat,bevel)


def rod(name, start, end, radius, mat, sides=10):
    a,b = Vector(start),Vector(end)
    bpy.ops.mesh.primitive_cylinder_add(vertices=sides, radius=radius, depth=(b-a).length, location=(a+b)/2)
    obj = bpy.context.object
    obj.rotation_euler = (b-a).to_track_quat('Z','Y').to_euler()
    return finish(obj,name,mat)


def skin(name, rows, mat):
    w = len(rows[0])
    mesh = bpy.data.meshes.new(name)
    faces = [(i*w+j,i*w+j+1,(i+1)*w+j+1,(i+1)*w+j) for i in range(len(rows)-1) for j in range(w-1)]
    mesh.from_pydata([p for row in rows for p in row],[],faces)
    obj = bpy.data.objects.new(name,mesh)
    finish(obj,name,mat)
    thickness = obj.modifiers.new('Pressed sheet','SOLIDIFY')
    thickness.thickness = .012
    bevel = obj.modifiers.new('Hemmed rim','BEVEL')
    bevel.width = .008
    bevel.segments = 2


steel = material('Brushed steel','A6B3BA')
rim = material('Polished edge','CCD8DA')
iron = material('Powder coated underframe','414E56')
group = collection('StationSeat',[0,0,0],'station-seat')
# Individual pressed shells share the bearer. The back faces negative local Y.
for col in range(5):
    x = (col-2)*.69
    profile = [(.30,.44),(.29,.48),(.24,.505),(.10,.49),(-.05,.47),(-.17,.49),(-.23,.56),(-.25,.68),(-.29,.88),(-.30,1.01),(-.27,1.035)]
    skin('Pressed shell '+str(col+1),[[(x+t*.322,y,z+.034*t*t) for t in (-1,-.60,0,.60,1)] for y,z in profile],steel)
    for detail in range(3):
        z=.69+detail*.078
        rod('Pressed back rib',(x-.235,-.237-detail*.018,z),(x+.235,-.237-detail*.018,z),.0085,rim)
for x in (-1.70,-.69,.69,1.70):
    path=[(x,.175,.46),(x,.165,.58),(x,.12,.65),(x,-.12,.66),(x,-.205,.565)]
    for a,b in zip(path,path[1:]): rod('Bent arm tube',a,b,.020,rim)
box('Seat bearer',(0,-.025,.365),(3.25,.11,.11),iron,.018)
for x in (-1.30,1.30):
    rod('Cast pedestal',(x,0,.06),(x,-.035,.375),.064,iron)
    box('Pedestal spreader',(x,0,.044),(.16,.54,.065),steel,.025)
    for y in (-.21,.21): box('Foot pad',(x,y,.015),(.137,.095,.03),iron,.008)

velvet=material('Midnight velvet','232735')
silk=material('Ivory display stock','E3D7C2')
gold=material('Warm yellow gold','D9A64D')
highlight=material('Polished silver','D9E5EA')
garnet=material('Cut garnet','A83F59')
group=collection('JewelryTray',[0,3,0],'jewelry-tray')
box('Burgundy piping',(0,0,.015),(1.52,.61,.03),material('Oxblood piping','913749'),.014)
box('Flocked inset',(0,0,.033),(1.49,.585,.028),velvet,.014)
# A faceted display bust and a chain draped around its shoulders.
for x in (-.51,.51):
    rows=[]
    for z,rx,ry in [(0.044,.135,.083),(.069,.145,.092),(.11,.12,.07),(.154,.077,.047),(.205,.057,.044),(.23,.055,.041)]:
        rows.append([(x+rx*math.cos(i*math.tau/16),.076+ry*math.sin(i*math.tau/16),z) for i in range(17)])
    skin('Necklace stand',rows,silk)
    chain=[(x+a,.076+b,z) for a,b,z in [(-.057,.00,.217),(-.069,-.028,.18),(-.069,-.043,.155),(-.039,-.062,.125),(0,-.073,.101),(.039,-.062,.125),(.069,-.043,.155),(.069,-.028,.18),(.057,0,.217)]]
    for a,b in zip(chain,chain[1:]): rod('Necklace',a,b,.0038,gold,7)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.015,location=chain[4])
    finish(bpy.context.object,'Pendant',garnet)
for y in (-.13,.035,.17):
    for i in range(5):
        x=(i-2)*.143; z=.074
        box('Ring cushion',(x,y,.058),(.118,.088,.025),silk,.009)
        bpy.ops.mesh.primitive_torus_add(major_segments=14,minor_segments=6,location=(x,y,z+.019),rotation=(.92,0,0),major_radius=.032,minor_radius=.005)
        finish(bpy.context.object,'Ring shank',gold if i%2==0 else highlight)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.012,location=(x,y-.017,z+.047))
        finish(bpy.context.object,'Stone setting',garnet if i%3==0 else highlight)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'display-and-seating.blend'),compress=True)
