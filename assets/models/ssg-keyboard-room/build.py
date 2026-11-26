"""Build the editable Snoopy Place gift display and its single vertex-colour draw."""
import bpy
from math import cos, sin, pi, sqrt
from pathlib import Path
from mathutils import Vector, Matrix

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_10F_SnoopyPlace')
scene.collection.children.link(collection)
colors = dict(white='fff9e9', ink='242128', grout='aea99d', tile='f5efde',
              red='de3338', scarlet='eb393d', shadow='862932', yellow='ffcd28',
              blue='50b6df', lip='86d0eb', deep='288cb5', aqua='63c8c6',
              pink='f1a8bc', lilac='af9ed6', beige='dcc6a6', steel='b5ae9e',
              wood='e8d7ba', gold='f1ac36', jacket='57929e', scarf='c93642')
materials = {}
for key, value in colors.items():
    srgb = [int(value[i:i+2],16)/255 for i in (0,2,4)]
    rgba = tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in srgb)+(1,)
    mat = bpy.data.materials.new(key)
    mat.diffuse_color = rgba
    materials[key] = mat

def part(name, vertices, faces, color):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name,mesh)
    collection.objects.link(obj)
    mesh.materials.append(materials[color])
    return obj

def rings(name, rows, color, cap=True):
    width=len(rows[0])
    faces=[(j*width+i,j*width+(i+1)%width,(j+1)*width+(i+1)%width,(j+1)*width+i)
           for j in range(len(rows)-1) for i in range(width)]
    if cap:
        faces += [tuple(reversed(range(width))),tuple(range((len(rows)-1)*width,len(rows)*width))]
    return part(name,[v for row in rows for v in row],faces,color)

def box(name,x,y,z,w,d,h,color,ch=.002):
    r=min(ch,w*.2,d*.2,h*.2)
    outline=[(-w/2+r,-d/2),(w/2-r,-d/2),(w/2,-d/2+r),(w/2,d/2-r),
             (w/2-r,d/2),(-w/2+r,d/2),(-w/2,d/2-r),(-w/2,-d/2+r)]
    return rings(name,[[(x+a,y+b,z+c) for a,b in outline] for c in [0,h]],color)

def tube(name, points, radius, color, n=10):
    points=list(map(Vector,points))
    rows=[]
    for i,p in enumerate(points):
        tangent=(points[min(i+1,len(points)-1)]-points[max(i-1,0)]).normalized()
        u=tangent.cross(Vector((0,1,0)) if abs(tangent.y)<.9 else Vector((0,0,1))).normalized()
        v=tangent.cross(u)
        rows.append([tuple(p+radius*(u*cos(2*pi*k/n)+v*sin(2*pi*k/n))) for k in range(n)])
    return rings(name,rows,color)

def label(body,x,y,z,size,color):
    curve=bpy.data.curves.new(body,'FONT')
    curve.body=body
    curve.size=size
    curve.align_x='CENTER'
    curve.resolution_u=4
    obj=bpy.data.objects.new(body,curve)
    collection.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    text=bpy.data.objects.new(body,mesh)
    collection.objects.link(text)
    text.matrix_world=obj.matrix_world.copy()
    mesh.materials.append(materials[color])
    bpy.data.objects.remove(obj,do_unlink=True)
    return text

# Sculpt cross-sections in the vertical plane so the sleeper's brow, projecting
# muzzle, round belly and drooping ear keep their profile from the gable ends.
oval_sources=[]
def oval(name,x,y,z,rx,ry,rz,color,tilt=0,quality=None):
    rows=[]
    segs, parallels = (24,12) if max(rx,ry,rz) >= .19 else (16,8) if max(rx,ry,rz) >= .07 else (10,6)
    if quality:segs,parallels=quality
    for j in range(parallels+1):
        lat=-pi/2+.002+(pi-.004)*j/parallels
        row=[]
        for k in range(segs):
            t=k*2*pi/segs
            a=rx*cos(t)*cos(lat)
            b=rz*sin(lat)
            row.append((x+a*cos(tilt)-b*sin(tilt),y+ry*sin(t)*cos(lat),z+b*cos(tilt)+a*sin(tilt)))
        rows.append(row)
    obj=rings(name,rows,color)
    for face in obj.data.polygons:face.use_smooth=True
    if quality is None:
        oval_sources.append((obj,(name,x,y,z,rx,ry,rz,color,tilt)))
    return obj

def prism_x(name,x0,x1,section,color):
    return rings(name,[[(x,y,z) for y,z in section] for x in (x0,x1)],color)

def front_panel(name,y0,y1,outline,color):
    return rings(name,[[(x,y,z) for x,z in outline] for y in (y1,y0)],color)

# Mosaic inlay is a packed repeating texture, including the black perimeter
# band. UVs are metric so the floor and upright tiled fascia share tile pitch.
def tiled(name,verts,w,h):
    obj=part(name,verts,[(0,1,2,3)],'tile')
    mesh=obj.data
    uv=mesh.uv_layers.new()
    for i,coord in enumerate([(0,0),(w/.24,0),(w/.24,h/.24),(0,h/.24)]):
        uv.data[i].uv=coord
    return obj

tiles=[]
tiles.append(tiled('Mosaic floor',[(-4.2,-2.7,.012),(4.2,-2.7,.012),(4.2,2.85,.012),(-4.2,2.85,.012)],8.4,5.55))
for y in [-2.55,2.68]:box('Inlaid border',0,y,.013,8.10,.050,.004,'ink')
for x in [-4.04,4.04]:box('Inlaid border',x,.065,.013,.050,5.28,.004,'ink')

# Red plank kennel. The opening is a real arched cutout with a deep, shaded
# interior. Both gables, the underside of the eaves and roof boards are editable.
pre_kennel=set(collection.objects)
cx=-1.49
left,right=cx-.96,cx+.96
box('Kennel floor',cx,0,.017,1.92,1.11,.045,'shadow')
for side in [-1,1]:
    for i in range(5):
        box('Horizontal siding',cx,side*.535,.062+i*.166,1.92,.065,.163,'red' if i%2 else 'scarlet')
def gable(x0,x1):
    for i in range(16):
        t0=i*pi/16;t1=(i+1)*pi/16
        y0=-.345*cos(t0);y1=-.345*cos(t1)
        z0=.427+.345*sin(t0);z1=.427+.345*sin(t1)
        prism_x('Arch voussoir',x0,x1,[(y0,z0),(y1,z1),(y1,1.62-abs(y1)*1.25),(y0,1.62-abs(y0)*1.25)],'red')
    for side in [-1,1]:
        ya,yb=sorted([side*.345,side*.57])
        prism_x('Gable jamb',x0,x1,[(ya,.02),(yb,.02),(yb,1.62-abs(yb)*1.25),(ya,1.62-abs(ya)*1.25)],'red')
gable(left,left+.045)
gable(right-.045,right)
for sign in [-1,1]:
    for i in range(5):
        a=i*.145;b=(i+1)*.145-.003
        section=[(sign*a,1.67-a*1.14),(sign*b,1.67-b*1.14),(sign*b,1.75-b*1.14),(sign*a,1.75-a*1.14)]
        prism_x('Overlapping painted roof board',left-.14,right+.14,section if sign>0 else section[::-1],'red' if i%2 else 'scarlet')
        for j in range(2):
            sx=left+.13+j*.99+.12*sin(i+j)
            points=[]
            for n in range(11):
                off=a+.068+.011*sin(n*.72+i*1.4)+.004*sin(n*.91+j)
                points.append((sx+n*.050,sign*off,1.754-off*1.14))
            tube('Brush stroke on roof',points,.004,'shadow',6)
box('Kennel interior shade',cx,0,.03,.04,1.07,.91,'ink')

# Photograph viewed broadside: feet at the right end, nose straight up and
# black ear hanging over the near eave. An asymmetric egg-shaped head is
# continuous across muzzle and brow, with closed eyes and a curved smile.
def sleeper_head(x):
    rows=[]
    for h,rx,ry,shift in [(0,.04,.07,0),(.035,.22,.22,0),(.09,.285,.245,-.015),
             (.19,.30,.26,-.015),(.28,.277,.237,.003),(.38,.246,.211,.043),
             (.50,.243,.205,.055),(.61,.217,.186,.058),(.70,.151,.148,.056),(.745,.065,.071,.055)]:
        rows.append([(x+shift+rx*cos(k*pi/16),ry*sin(k*pi/16),1.753+h) for k in range(32)])
    obj=rings('Reclining beagle sculpted muzzle',rows,'white')
    for p in obj.data.polygons:p.use_smooth=True
    oval('Upturned black nose',x+.055,0,2.508,.075,.067,.056,'ink')
    for side in [-1,1]:
        oval('Long folded ear',x-.043,side*.243,1.667,.075,.044,.245,'ink',-.055)
        tube('Closed eyelid',[(x-.19,side*.208,2.045),(x-.16,side*.228,2.036),(x-.13,side*.239,2.042)],.009,'ink')
        tube('Curved smile',[(x+.075,side*.249,1.916),(x+.144,side*.228,1.895),(x+.202,side*.188,1.901),(x+.235,side*.151,1.942)],.008,'ink')
sleeper_head(cx-.32)
oval('Sleeping torso',cx+.25,0,1.878,.425,.181,.142,'white')
oval('Rounded belly',cx+.35,0,1.957,.213,.175,.207,'white')
oval('Scarlet collar',cx-.037,0,1.876,.038,.180,.145,'red')
for side in [-1,1]:
    oval('Resting foreleg',cx+.141,side*.148,1.853,.235,.065,.068,'white',-.04)
    oval('Forepaw',cx+.34,side*.155,1.829,.069,.069,.088,'white',-.19)
    oval('Hind leg',cx+.653,side*.101,1.839,.209,.085,.080,'white')
    oval('Upturned paw',cx+.82,side*.106,1.995,.113,.093,.231,'white',-.128)
    for k in [-.029,.024]:
        tube('Toe stitching',[(cx+.916,side*.106+k,1.976),(cx+.925,side*.106+k,2.019),(cx+.916,side*.106+k,2.059)],.004,'ink',6)
# Yellow bird nestled at the head end, with tapered crest and beak.
bx=cx-.77
oval('Woodstock body',bx,0,1.786,.118,.065,.064,'yellow')
oval('Woodstock head',bx-.060,-.004,1.848,.071,.065,.073,'yellow')
oval('Small beak',bx-.125,-.003,1.832,.06,.035,.021,'gold')
for i in range(3):
    oval('Feather crest',bx-.008+i*.022,0,1.90-i*.007,.056,.019,.015,'yellow',.65)
for side in [-1,1]:oval('Bird eye',bx-.081,side*.061,1.858,.009,.005,.012,'ink')

# Gable lettering arcs over the doorway as in the opening photograph.
for side in [-1,1]:
    for i,letter in enumerate('SNOOPY'):
        t=(i-2.5)*.246
        obj=label(letter,cx+side*.965,side*.41*sin(t),.810+.21*cos(t),.105,'white')
        obj.rotation_euler=(pi/2,0,side*pi/2)
        obj.rotation_euler.rotate_axis('Z',-t*.65)
# Turn the end opening towards the aisle while preserving each editable object.
bpy.context.view_layer.update()
pivot=Matrix.Translation((cx,0,0))
turn=pivot @ Matrix.Rotation(-.34,4,'Z') @ pivot.inverted()
for obj in set(collection.objects)-pre_kennel:obj.matrix_world=turn @ obj.matrix_world

# Seated plush has a separate pear-shaped head and snout, dropped ears,
# projecting feet with toe embroidery, and scarf or blue padded jacket.
def plush(x,y,z,s,coat='scarf'):
    def egg(n,a,b,c,r,d,h,col,tilt=0):
        return oval(n,x+a*s,y+b*s,z+c*s,r*s,d*s,h*s,col,tilt)
    egg('Stuffed body',0,.018,.245,.16,.132,.195,'white')
    if coat=='jacket':
        for i in range(3):egg('Puffer baffle',0,.013,.19+i*.057,.172,.145,.055,'jacket')
    egg('Soft crown',0,0,.485,.183,.147,.18,'white')
    egg('Stuffed muzzle',0,-.106,.458,.155,.148,.114,'white')
    egg('Velvet nose',0,-.246,.486,.049,.033,.038,'ink')
    for side in [-1,1]:
        egg('Drooping plush ear',side*.165,.00,.45,.048,.088,.142,'ink',side*.16)
        egg('Embroidered eye',side*.072,-.132,.555,.011,.009,.016,'ink')
        egg('Stuffed arm',side*.142,-.002,.252,.052,.082,.11,'white' if coat=='scarf' else coat,side*.18)
        egg('Stuffed foot',side*.09,-.082,.077,.087,.13,.077,'white')
        for k in [-.021,.021]:
            tube('Paw embroidery',[(x+(side*.09+k)*s,y-.197*s,z+.084*s),(x+(side*.09+k)*s,y-.185*s,z+.119*s)],.004*s,'ink',6)
    if coat=='scarf':
        egg('Knitted scarf',0,-.002,.351,.154,.136,.041,'scarf')
        egg('Scarf end',-.065,-.114,.278,.042,.027,.09,'scarf',-.25)

# Fitted goods wall with a dark open frame, individually recessed compartments,
# cubby stock, handles on totes and ceramic handles on the mugs.
wallY=2.42
box('Back of shop display',0,wallY+.19,.02,7.88,.11,2.83,'wood')
for x in [-3.94,3.94]:box('Tiled end pier',x,wallY,.02,.12,.55,2.84,'tile')
for x in [-3.75,-2.32,-.76,.76,2.32,3.75]:box('Dark shelf standard',x,wallY-.13,.02,.036,.55,2.38,'ink')
for z in [.52,1.04,1.66,2.37]:
    start=-2.32 if z==1.04 else -3.76
    box('Shadowline',(3.76+start)/2,wallY-.13,z,3.76-start,.56,.034,'ink')
    box('Shelf surface',(3.76+start)/2,wallY-.135,z+.034,3.76-start,.55,.018,'beige')
for i in range(10):box('Lower cabinet',-3.39+i*.753,wallY-.26,.029,.737,.31,.46,'steel')
tiles.append(tiled('Mosaic header',[(-3.93,wallY-.405,2.427),(3.93,wallY-.405,2.427),(3.93,wallY-.405,2.858),(-3.93,wallY-.405,2.858)],7.86,.431))
label('SNOOPY PLACE',0,wallY-.420,2.509,.29,'ink')
for i in range(8):
    plush(-.61+i*.573,wallY-.17,.572,.57,'jacket' if i%3==0 else 'scarf')
for i in range(6):
    plush(.99+i*.493,wallY-.17,1.712,.76,'scarf' if i%2 else 'jacket')
for i in range(5):
    x=-3.36+i*.51
    box('Canvas tote',x,wallY-.14,1.712,.37,.15,.296,'ink' if i<3 else 'red',.025)
    tube('Stitched handle',[(x+.095*cos(k*pi/16),wallY-.155,2.003+.106*sin(k*pi/16)) for k in range(17)],.012,'ink')
    label('PEANUTS',x,wallY-.219,1.801,.051,'white')
for i in range(7):
    x=-2.13+i*.41
    rows=[]
    for radius,h in [(.062,0),(.083,.014),(.093,.174),(.084,.174),(.076,.032)]:
        rows.append([(x+radius*cos(k*pi/12),wallY-.18+radius*sin(k*pi/12),1.092+h) for k in range(24)])
    rings('Glazed mug with hollow rim',rows,'white' if i%2 else 'yellow')
    tube('Ceramic mug handle',[(x+.077+.057*sin(k*pi/16),wallY-.18,1.179+.059*cos(k*pi/16)) for k in range(17)],.013,'white' if i%2 else 'yellow')
    oval('Black ear motif',x-.017,wallY-.269,1.173,.016,.006,.027,'ink')
for i in range(8):
    x=.94+i*.366
    box('Windowed plush carton',x,wallY-.13,1.092,.286,.217,.341,['yellow','blue','pink'][i%3])
    box('Carton window',x,wallY-.241,1.146,.21,.008,.214,'wood')
    oval('Plush in carton',x,wallY-.246,1.249,.083,.028,.075,'white')
    for side in [-1,1]:oval('Plush ear behind window',x+side*.074,wallY-.26,1.24,.021,.013,.053,'ink')

# Blue stepped island photographed in the gift section. Each inclined tray
# has its own lip, boxed stationery and loose animal charms.
ix=1.57
section=[(-.67,.02),(.58,.02),(.58,1.15),(.17,1.08),(.17,.84),(-.26,.77),(-.26,.54),(-.67,.47)]
prism_x('Blue stepped case',ix-1.14,ix+1.14,section,'blue')
for r,(y,z) in enumerate([(-.47,.507),(-.045,.811),(.385,1.117)]):
    box('Tray front rim',ix,y-.186,z-.015,2.26,.035,.088,'lip')
    box('Shadow under ledge',ix,y-.194,z-.065,2.18,.012,.022,'deep')
    for side in [-1,1]:
        box('Raised blue tray cheek',ix+side*1.115,y,z-.018,.051,.425,.111,'blue')
    for i in range(1,8):
        box('Acrylic pocket divider',ix-1.075+i*.268,y,z+.028,.011,.28,.044,'lip')
    for i in range(8):
        x=ix-.944+i*.267
        if (i+r)%4<2:
            box('Printed stationery pack',x,y,z+.024,.202,.261,.024,['pink','lilac','aqua'][r])
            oval('Printed beagle muzzle',x,y-.02,z+.05,.064,.047,.003,'white')
            oval('Printed floppy ear',x+.043,y+.009,z+.052,.022,.028,.003,'ink')
            oval('Printed black nose',x-.061,y-.029,z+.052,.013,.010,.003,'ink')
        else:
            if i%2:
                oval('Bird charm body',x,y,z+.097,.058,.055,.072,'yellow')
                oval('Bird charm cheek',x,y-.018,z+.169,.058,.050,.047,'yellow')
                oval('Bird charm bill',x,y-.065,z+.162,.026,.041,.015,'gold')
                for side in [-1,1]:oval('Bird charm eye',x+side*.031,y-.057,z+.177,.006,.006,.009,'ink')
                for j in range(3):oval('Crest',x+(j-1)*.014,y+.002,z+.217,.010,.022,.025,'yellow',-.22)
            else:
                plush(x,y,z+.035,.28,'scarf')

# Representative house-shaped niche with an arched opening and dressed plush.
nx=-2.94;ny=wallY-.2
prism_x('Niche shelf',nx-.48,nx+.48,[(ny-.22,.575),(ny+.2,.575),(ny+.2,.616),(ny-.22,.616)],'wood')
for side in [-1,1]:
    xa,xb=sorted([nx+side*.25,nx+side*.46])
    front_panel('Niche side',ny-.18,ny+.17,[(xa,.616),(xb,.616),(xb,1.584-abs(xb-nx)),(xa,1.584-abs(xa-nx))],'beige')
for k in range(16):
    xa=-.25*cos(k*pi/16);xb=-.25*cos((k+1)*pi/16)
    front_panel('Arched niche lintel',ny-.18,ny+.17,[(nx+xa,.92+.25*sin(k*pi/16)),(nx+xb,.92+.25*sin((k+1)*pi/16)),(nx+xb,1.584-abs(xb)),(nx+xa,1.584-abs(xa))],'beige')
for side in [-1,1]:
    tube('Niche roof edging',[(nx,ny-.19,1.586),(nx+side*.473,ny-.19,1.114)],.016,'ink')
plush(nx,ny-.13,.616,.68)

# Keep the inlay on top of the existing timber retail finish.
for obj in list(collection.objects):
    if obj in tiles and obj.name=='Mosaic floor' or obj.name.startswith('Inlaid border'):
        obj.location.z+=.044

# Three outlined comic portraits on the pale back panels, interpreted in ink.
# Use filled silhouette plus varied-width strokes for a clean distant read.
for ax in [-.39,.16,.67]:
    zz=2.09; yy=wallY+.125
    silhouette=[(-.174,.009),(-.201,.057),(-.174,.108),(-.105,.126),(-.062,.14),
                (-.036,.211),(.015,.231),(.079,.219),(.116,.177),(.131,.091),
                (.108,.040),(.056,.011),(.031,-.037),(-.028,-.044),(-.048,-.003)]
    front_panel('Comic beagle profile',yy-.006,yy,[(ax+a,zz+b) for a,b in silhouette],'white')
    line=[(ax+a,yy-.011,zz+b) for a,b in silhouette]
    tube('Comic outline',line+[line[0]],.005,'ink',6)
    oval('Comic nose',ax-.19,yy-.012,zz+.064,.023,.007,.017,'ink')
    oval('Comic ear',ax+.093,yy-.014,zz+.064,.034,.008,.067,'ink',-.13)
    tube('Comic eye',[(ax-.046,yy-.016,zz+.145),(ax-.035,yy-.017,zz+.156),(ax-.025,yy-.017,zz+.149)],.005,'ink',6)

# A seamless eight-tile square. Keep the same packed image in the editable
# collection and the runtime, with mipmaps supplied by the renderer.
image=bpy.data.images.new('Ivory mosaic and grout',width=128,height=128)
pixels=[]
for row in range(128):
    for col in range(128):
        tone=.77 if min(col%16,row%16)==0 else .94 if min(col%16,row%16)==1 else .979-.006*((col//16+row//16*3)%4)
        pixels.extend((tone,tone*.986,tone*.95,1))
image.pixels[:]=pixels
image.pack()
tilemat=bpy.data.materials.new('Glazed mosaic')
tilemat.use_nodes=True
texture=tilemat.node_tree.nodes.new('ShaderNodeTexImage')
texture.image=image
tilemat.node_tree.links.new(texture.outputs['Color'],tilemat.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
for obj in tiles:obj.data.materials[0]=tilemat

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'snoopy-place.blend'),compress=True)
print('Editable mesh pieces:',len(collection.objects))
# Re-tessellate only the small stuffed and printed ellipsoids for the game.
# Preserve the large kennel sculpture, type, arched lintels and trim profiles.
for obj,args in oval_sources:
    radius=max(args[4:7])
    if radius>=.19:continue
    resolution=(12,7) if radius>=.09 else (10,5) if radius>=.035 else (8,4)
    reduced=oval(*args,quality=resolution)
    obj.data=reduced.data
    bpy.data.objects.remove(reduced,do_unlink=True)
objects=list(collection.objects)
runtime=bpy.data.materials.new('Paint, cloth and printed goods')
runtime.use_nodes=True
shader=runtime.node_tree.nodes['Principled BSDF']
shader.inputs['Roughness'].default_value=.65
node=runtime.node_tree.nodes.new('ShaderNodeVertexColor')
node.layer_name='Paint'
runtime.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
def batch(parts,name):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts:obj.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join()
    bpy.context.object.name=name
painted=[o for o in objects if o not in tiles]
for obj in painted:
    mesh=obj.data
    attr=mesh.color_attributes.new(name='Paint',type='BYTE_COLOR',domain='CORNER')
    rgba=mesh.materials[0].diffuse_color
    for elt in attr.data:elt.color=rgba
    mesh.materials.clear()
    mesh.materials.append(runtime)
batch(painted,'GangnamSnoopyPlaceDoghouseAndGoods')
batch(tiles,'GangnamSnoopyPlaceMosaic')
bpy.ops.export_scene.gltf(filepath=str(OUT/'snoopy-place.glb'),export_format='GLB',export_animations=False)
