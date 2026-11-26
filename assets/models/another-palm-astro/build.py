"""Another Palm November 2026 collectable display, based on the operator photograph."""
from pathlib import Path
from math import cos, sin, pi
import bpy
from mathutils import Matrix

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('AnotherPalmAstro')
bpy.context.scene.collection.children.link(collection)

def finish(obj, name, color):
    obj.name = name
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    collection.objects.link(obj)
    material = bpy.data.materials.get(color)
    if not material:
        material = bpy.data.materials.new(color)
        rgb = [int(color[i:i+2],16)/255 for i in (0,2,4)]
        material.diffuse_color = (*[((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in rgb],1)
    obj.data.materials.append(material)
    return obj

def box(name,x,y,z,w,d,h,color,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    obj=finish(bpy.context.object,name,color)
    obj.dimensions=(w,d,h)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        edge=obj.modifiers.new('Soft edges','BEVEL')
        edge.width,edge.segments=bevel,(2 if bevel>=.02 else 1)
    return obj

from mathutils import Matrix, Vector

def oval(name,x,y,z,w,d,h,color):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=(x,y,z))
    obj=finish(bpy.context.object,name,color)
    obj.scale=(w/2,d/2,h/2)
    for poly in obj.data.polygons:
        poly.use_smooth=True
    return obj

def figure(x,y,z,scale,pose):
    # The white/red and black editions in the press photo have plain vinyl heads.
    red='BA2731' if pose!='black' else '282B2E'
    body='E5E5E2' if pose!='original' else 'F0C7A1'
    def part(name,dx,dy,dz,w,d,h,col):
        return oval(pose+' · '+name,x+dx*scale,y+dy*scale,z+dz*scale,w*scale,d*scale,h*scale,col)
    for side in (-1,1):
        part('boot toe',side*.082,-.034,.06,.142,.208,.115,red)
        part('boot shaft',side*.076,0,.135,.124,.122,.192,red)
        part('leg',side*.073,0,.236,.080,.082,.108,body)
        arm=part('forearm',side*.129,-.003,.316,.064,.074,.151,body)
        arm.rotation_euler.y=-side*.15
        part('hand',side*.145,-.009,.263,.072,.079,.084,body)
    part('body',0,0,.326,.209,.125,.188,body)
    part('waist',0,0,.262,.191,.126,.060,'25282B' if pose=='original' else body)
    if pose=='original':
        part('green belt',0,-.001,.277,.195,.13,.025,'43875C')
    part('head',0,-.003,.473,.232,.174,.205,body)
    cap='27292A' if pose=='original' else body
    part('crown',0,.008,.524,.227,.173,.12,cap)
    for side,dz in [(-1,.554),(1,.513)]:
        bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.055*scale,radius2=.002*scale,depth=.115*scale,
                                        location=(x+side*.086*scale,y+.020*scale,z+dz*scale))
        spike=finish(bpy.context.object,pose+' · swept hair',cap)
        spike.rotation_euler.y=side*.83
    if pose=='original':
        for side in (-1,1):
            part('eye',side*.045,-.084,.478,.033,.015,.055,'302C2D')
            part('eye glint',side*.044,-.092,.488,.010,.009,.011,'F8F4E8')

def title(text,x,y,z,size,colour):
    curve=bpy.data.curves.new(text,'FONT')
    curve.body=text;curve.align_x='CENTER';curve.size=size;curve.extrude=.0005
    obj=bpy.data.objects.new(text,curve);collection.objects.link(obj)
    obj.location=(x,y,z);obj.rotation_euler.x=pi/2
    bpy.context.view_layer.objects.active=obj;bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
    bpy.ops.object.convert(target='MESH');finish(obj,text,colour)

# Three open black foam cases facing the public aisle on a single countertop.
for col,edition in enumerate(['black','original','white']):
    case_start=set(collection.objects)
    x=(col-1)*.76
    box('Case '+edition,x,0,.025,.70,.48,.050,'202325',.024)
    box('Charcoal inset '+edition,x,0,.06,.66,.44,.025,'373B3D',.012)
    # Raised foam surround and the scalloped finger wells visible on the open cases.
    for side in (-1,1):
        box('Foam lip',x+side*.327,0,.085,.032,.44,.065,'424548',.012)
        box('Foam lip',x,side*.206,.085,.65,.03,.065,'424548',.012)
    for offset in (-.25,-.07,.11,.25):
        oval('Finger well',x+offset,.136,.079,.087,.10,.018,'151718')
    box('Edition booklet',x+.157,.119,.082,.141,.103,.012,'8B8E8E',.004)
    figure_start=set(collection.objects)
    pivot=Vector((x-.105,-.155,.089))
    figure(*pivot,.68,edition)
    bpy.context.view_layer.update()
    lay_flat=Matrix.Translation(pivot) @ Matrix.Rotation(-pi/2,4,'X') @ Matrix.Translation(-pivot)
    for part in set(collection.objects)-figure_start:
        part.matrix_world=lay_flat @ part.matrix_world
    # The case at the right of each figure contains a boot-shaped accessory.
    c='C23137' if edition!='black' else '303335'
    oval('Accessory ankle',x+.175,.018,.146,.112,.126,.145,c)
    oval('Accessory toe',x+.175,-.031,.102,.138,.187,.094,c)
    bpy.context.view_layer.update()
    hinge=Vector((x,-.24,.025))
    open_tray=Matrix.Translation(hinge) @ Matrix.Rotation(.49,4,'X') @ Matrix.Translation(-hinge)
    for part in set(collection.objects)-case_start:
        part.matrix_world=open_tray @ part.matrix_world
box('Rear printed pack',-.44,.235,.55,.68,.095,.79,'232324',.009)
title('ASTRO',-.44,.183,.63,.144,'F4F1ED')
title('BOY',-.44,.183,.44,.158,'F4F1ED')
box('Front printed pack',-.75,.185,.32,.50,.09,.385,'262427',.008)
title('ASTRO',-.75,.137,.36,.102,'BA3136')
title('BOY',-.75,.137,.255,.112,'BA3136')
figure(.83,.180,.08,1,'hero white')
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'display.blend'),compress=True)
