"""Editable fittings for the public hotel/department store display passage."""
from pathlib import Path
from math import sin, cos, pi, tau
import sys

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / 'tools'))
import blender_shop_mesh as m

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
colors = {
    'dark bronze': ('3b3632', .57), 'steel edge': ('776e63', .72),
    'black joint': ('302d2c', .05), 'gold': ('c5a574', .7),
    'enamel': ('515258', .16), 'case backing': ('665f53', .1),
    'silk': ('3e3d3a', .10), 'stone': ('ddccac', .15), 'card': ('d4cebe', .12),
    'glass edge': ('b9c8be', .45), 'pale gold': ('edd69f', .55),
    'diamond': ('f1f3e6', .50), 'neck form': ('373739', .05),
    'lamp core': ('fff4cf', .02), 'lamp lip': ('b2a491', .53),
    'mahogany': ('5d4a40', .12), 'sensor': ('c5bdad', .08),
    'screen ink': ('123240', .1), 'petrol': ('164b5c', .18),
    'turquoise': ('3ba9a7', .13), 'blue': ('5b92bf', .17),
    'pale blue': ('92cbd6', .16), 'pearl': ('e6dcd3', .3),
}
for name,(color,metal) in colors.items():
    m.palette[name] = m.material(name, color, metal)
for name,power in [('lamp core',2.9),('screen ink',.31),('turquoise',.28),('blue',.24),('pale blue',.28)]:
    bsdf=m.palette[name].node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Emission Color'].default_value=m.palette[name].diffuse_color
    bsdf.inputs['Emission Strength'].default_value=power

def collection(name,origin):
    group=bpy.data.collections.new(name)
    scene.collection.children.link(group)
    group['preview_origin']=origin
    m.group=group
    return group

box=m.block
def bands(x,d,z,w,h,t,mat):
    for edge in (-1,1):
        box('Folded return',x+edge*(w-t)/2,d,z,t,.02,h,mat,.002)
        box('Folded return',x,d,z+(h-t)*(edge+1)/2,w-2*t,.02,t,mat,.002)

def gem(name,x,d,z,r,h,mat):
    upper=[(x+r*.57*cos(i*tau/8),d+r*.57*sin(i*tau/8),z+h) for i in range(8)]
    girdle=[(x+r*cos(i*tau/8),d+r*sin(i*tau/8),z+h*.49) for i in range(8)]
    pts=upper+girdle+[(x,d,z)]
    faces=[tuple(range(8))]
    for i in range(8):
        j=(i+1)%8
        faces.extend([(i,j,j+8,i+8),(i+8,j+8,16)])
    m.piece(name,pts,faces,mat)

# A shallow, dark-lined shop window. The sides taper towards the glass-side frame.
# The layered back, glass lip and shadow at the lip give depth without pushing the frame into the walkway.
case=collection('JewelryShadowbox',(0,0,0))
box('Flush dark window frame',0,0,.80,1.23,.12,.91,'dark bronze',.006)
box('Woven neutral back',0,.065,.85,1.13,.012,.81,'case backing')
box('Black silk plinth',0,.118,.85,1.105,.118,.045,'silk',.006)
bands(0,.137,.80,1.23,.91,.032,'steel edge')
for side in (-1,1):
    box('Interior chamfer',side*.561,.092,.855,.016,.047,.797,'enamel')
box('Concealed upper strip',0,.111,1.656,.95,.014,.008,'lamp core')
box('Glass lower edge',0,.142,.838,1.15,.003,.005,'glass edge')
# A half-round necklace form with a curved shoulder and flat dark collar.
centrex=-.10
rings=[(.165,.008),(.171,.062),(.163,.107),(.137,.151),(.089,.24),(.078,.35),(.084,.38)]
m.profile('Linen bust',centrex,.124,.915,rings,'neck form',24,.23)
for i in range(47):
    t=i/46
    x=centrex+(t-.5)*.181
    height=1.262-.167*(sin(pi*t)**.81)
    d=.151+.006*sin(pi*t)
    m.profile('Fine gold chain',x,d,height,[(.0016,0),(.0023,.0018),(.0016,.0031)],'pale gold',6,.56)
gem('Pear drop',centrex,.165,1.075,.016,.027,'diamond')
for i in range(3):
    x=.216+i*.084;z=.916+i*.016
    box('Folded ring pillow',x,.132,z,.077,.065,.034,'silk',.009)
    points=[(x+.019*cos(j*tau/20),.158,z+.046+.019*sin(j*tau/20)) for j in range(21)]
    m.rod('Ring band',points,.0026,'gold',6)
    gem('Brilliant cut',x,.159,z+.064,.008,.011,'diamond')
for x in (-.42,.40):
    box('Cream price card',x,.154,.902,.082,.008,.040,'card',.001)
    box('Foil inscription',x,.160,.922,.053,.001,.002,'dark bronze')

# Original silk-and-pearl artwork for the display. Campaign content changes at the site.
screen=collection('RetailPortrait',(0,0,0))
box('Vertical monitor',0,.005,.94,.97,.077,1.59,'dark bronze',.007)
box('Glass front',0,.050,.960,.932,.006,1.548,'screen ink')
bands(0,.058,.937,.977,1.595,.012,'steel edge')
# The portrait is an original Cycles still life rendered with campaign.py.
display = m.palette['screen ink']
nodes = display.node_tree.nodes
image = bpy.data.images.load(str(here / 'pearl-silk.webp'))
image.pack()
photo = nodes.new('ShaderNodeTexImage')
photo.image = image
coords = nodes.new('ShaderNodeTexCoord')
separate = nodes.new('ShaderNodeSeparateXYZ')
combine = nodes.new('ShaderNodeCombineXYZ')
graph = display.node_tree.links
graph.new(coords.outputs['Generated'], separate.inputs[0])
graph.new(separate.outputs['X'], combine.inputs['X'])
graph.new(separate.outputs['Z'], combine.inputs['Y'])
graph.new(combine.outputs[0], photo.inputs['Vector'])
bsdf=nodes.get('Principled BSDF')
graph.new(photo.outputs['Color'], bsdf.inputs['Base Color'])
graph.new(photo.outputs['Color'], bsdf.inputs['Emission Color'])
bsdf.inputs['Emission Strength'].default_value=.68
def print_text(label,body,z,width,height):
    curve=bpy.data.curves.new(label,'FONT');curve.body=body;curve.align_x='CENTER';curve.align_y='CENTER';curve.resolution_u=3
    text=bpy.data.objects.new(label,curve);screen.objects.link(text);curve.materials.append(m.palette['pearl'])
    bpy.context.view_layer.update();size=text.dimensions.copy()
    text.location=(0,-.066,z);text.rotation_euler.x=pi/2;text.scale=(width/size.x,height/size.y,1)
    bpy.context.view_layer.update();g=bpy.context.evaluated_depsgraph_get()
    mesh=bpy.data.meshes.new_from_object(text.evaluated_get(g));pose=text.matrix_world.copy()
    bpy.data.objects.remove(text,do_unlink=True)
    obj=bpy.data.objects.new(label,mesh);screen.objects.link(obj);obj.matrix_world=pose
print_text('Campaign signature','SHINSEGAE',1.11,.43,.046)

lights=collection('SquareDownlightPair',(0,0,0))
for side in (-1,1):
    x=side*.54
    box('Dark square reveal',x,0,-.030,.135,.135,.030,'black joint')
    box('Inset brushed trim',x,0,-.033,.111,.111,.012,'lamp lip')
    box('Warm opal diffuser',x,0,-.036,.083,.083,.009,'lamp core',.003)
# One fitting can be selected and moved independently while all lamps share the native mesh.
for collection_,shift in [(case,(-1.4,0,0)),(screen,(.25,0,0)),(lights,(0,0,3.0))]:
    for obj in collection_.objects:
        obj.location+=Vector(shift)
    collection_['preview_origin']=shift
scene['sources']='Visitor photograph of the public Shinsegae–JW Marriott display corridor (2020) and JW Marriott Seoul visitor information. Display content is original. Fitting sizes are reconstructed.'
# Keep the studio rig outside the three collections linked into the city.
studio=bpy.data.collections.new('Studio');scene.collection.children.link(studio)
camera=bpy.data.cameras.new('Gallery fittings');shot=bpy.data.objects.new('전시 창과 포스터',camera);studio.objects.link(shot)
scene.camera=shot;shot.location=(-.72,-5.0,1.77);aim=Vector((-.60,0,1.68))
shot.rotation_euler=(aim-shot.location).to_track_quat('-Z','Y').to_euler();camera.lens=46
for label,xyz,size,energy in [('Left softbox',(-1.8,-2,3.7),1.8,82),('Right softbox',(1,-1.4,3.3),1.6,72)]:
    light=bpy.data.lights.new(label,'AREA');light.energy=energy;light.size=size;light.shape='DISK'
    lamp=bpy.data.objects.new(label,light);studio.objects.link(lamp);lamp.location=xyz
    lamp.rotation_euler=(aim-lamp.location).to_track_quat('-Z','Y').to_euler()
world=bpy.data.worlds.new('Display studio');scene.world=world;world.use_nodes=True
world.node_tree.nodes.get('Background').inputs[0].default_value=(.27,.26,.23,1)
world.node_tree.nodes.get('Background').inputs[1].default_value=.55
scene.render.engine='CYCLES';scene.cycles.samples=36;scene.cycles.use_denoising=True
scene.render.resolution_x=960;scene.render.resolution_y=600;scene.render.resolution_percentage=100
for screen_space in bpy.data.screens:
    for area in screen_space.areas:
        if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'finishes.blend'),compress=True)
