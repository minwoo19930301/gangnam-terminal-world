"""House of Shinsegae, Central City 1F inner vestibule. Blender Z is up."""
import math
from pathlib import Path
import random
import sys

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / 'tools'))
import blender_shop_mesh as mesh

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
body = bpy.data.collections.new('HouseEntryGallery')
scene.collection.children.link(body)
mesh.group = body
colors = {
    'bronze A': ('9b7661', .29), 'bronze B': ('92705d', .31), 'bronze C': ('a37e67', .31),
    'bronze reveal': ('513f36', .27), 'brass': ('a28b67', .58), 'skirting': ('655b50', .48),
    'lacquered ceiling': ('e2d3bc', .14), 'slot': ('38332d', .15), 'baffle': ('695d52', .32),
    'opal': ('ffefd1', .06), 'planter': ('625b49', .29), 'soil': ('39382b', 0),
    'green': ('547044', .01), 'new leaf': ('8e9c54', .01), 'shade leaf': ('40543b', .01),
    'fern': ('697e4b', 0), 'stalk': ('74774c', 0), 'wall inset': ('554a40', .06),
    'limestone A': ('dfceb7', .04), 'limestone B': ('e3d3be', .04), 'limestone C': ('dfcfba', .04)
}
for name, (rgb, metal) in colors.items():
    mesh.palette[name] = mesh.material(name, rgb, metal)
opal = mesh.palette['opal'].node_tree.nodes.get('Principled BSDF')
opal.inputs['Emission Color'].default_value = mesh.palette['opal'].diffuse_color
opal.inputs['Emission Strength'].default_value = 2.1

# s runs into the long public passage, t across it, in the existing hall frame.
s0, t0 = 34.5, 25.6

def block(name, s, t, bottom, ds, dt, h, color, bevel=0):
    return mesh.block(name, t-t0, s-s0, bottom, dt, ds, h, color, bevel)

# Inside faces of the original wall solids. Leave both turns and the lift landing clear.
# Bronze leaves, shadow joints and a brushed metal foot give the dark panels a readable edge.
walls = [(40.57,23.03,40.57,25.49), (40.58,25.48,35.79,25.48),
         (38.00,23.32,33.45,23.32), (33.43,23.30,33.43,28.80),
         (33.45,28.82,37.90,28.82), (35.79,25.71,35.79,26.12),
         (35.81,26.38,37.96,26.38)]
rng = random.Random(936)
for a,b,c,d in walls:
    length = math.hypot(c-a,d-b)
    n = max(1,round(length/.94))
    along_s = abs(c-a)>abs(d-b)
    for i in range(n):
        t=(i+.5)/n
        ds,dt=(length/n-.012,.022) if along_s else (.022,length/n-.012)
        block('Folded bronze wall panel',a+(c-a)*t,b+(d-b)*t,.107,ds,dt,3.003,
              rng.choice(('bronze A','bronze B','bronze C')), .004)
    ds,dt=(length,.032) if along_s else (.032,length)
    block('Satin skirting', (a+c)/2,(b+d)/2,.016,ds,dt,.083,'skirting')
    block('Upper bronze return',(a+c)/2,(b+d)/2,3.101,ds,dt,.041,'bronze reveal')

# Light stone paving with narrow joints; reverse the clockwise depth axis in mesh.piece.
# At the small turn the final row already meets the foot of the incline.
def paving(name, x0, d0, x1, d1, get_height, tint):
    verts=[(x,d,get_height(d)+.004) for x,d in [(x0,d0),(x1,d0),(x1,d1),(x0,d1)]]
    return mesh.piece(name, verts, [(0,1,2,3)], tint)

stone_rng=random.Random(342)
stones=('limestone A','limestone B','limestone C')
grade=(2.1-.008)/(69.08-35.7)
for a,b,c,d in [(33.40,23.32,40.58,25.47),(33.40,25.47,35.60,28.80),(35.60,26.38,38.10,28.80)]:
    ns=math.ceil((c-a)/1.40);nt=math.ceil((d-b)/.95)
    for j in range(nt):
        for i in range(ns):
            s1=a+(c-a)*i/ns;s2=a+(c-a)*(i+1)/ns
            t1=b+(d-b)*j/nt;t2=b+(d-b)*(j+1)/nt
            get_h=(lambda sd:max(0,s0+sd-35.7)*grade) if a>35.5 else (lambda sd:0)
            paving('Honed stone · entrance',t1-t0+.002,s1-s0+.002,t2-t0-.002,s2-s0-.002,get_h,stone_rng.choice(stones))

# Pale inset ceiling and twin black shadow slots, visible in the restaurant's public film.
for a,b,c,d in [(33.40,23.32,40.58,25.47),(33.40,25.47,35.60,28.80),(35.60,26.38,38.03,28.80)]:
    block('Champagne soffit', (a+c)/2,(b+d)/2,3.107,c-a,d-b,.027,'lacquered ceiling')
for a,b,c,d in [(33.75,23.51,40.27,23.51),(34.97,25.23,40.28,25.23),
                (33.62,23.60,33.62,28.52),(35.35,25.45,35.35,26.58),
                (35.34,26.60,37.92,26.60),(33.65,28.60,37.92,28.60)]:
    ds,dt=(abs(c-a),.033) if abs(c-a)>abs(d-b) else (.033,abs(d-b))
    block('Recessed dark ceiling slot',(a+c)/2,(b+d)/2,3.097,ds,dt,.010,'slot')
for s,t in [(39.84,24.38),(37.66,24.38),(35.52,24.38),(34.46,26.22),(36.77,27.59)]:
    mesh.profile('Round recessed baffle',t-t0,s-s0,3.086,[(.067,0),(.076,.012),(.067,.019)],'baffle',16)
    mesh.profile('Opal lens',t-t0,s-s0,3.080,[(.036,0),(.044,.005),(.041,.009)],'opal',16)
# The short vertical tube marks the inner turn in the same film.
mesh.profile('Pencil pendant · collar',1.64,-.06,3.063,[(.042,0),(.042,.035)],'brass',16)
mesh.rod('Pencil pendant · stem',[(1.64,-.06,3.08),(1.64,-.06,2.86)],.007,'brass',8)
mesh.profile('Pencil pendant · glass',1.64,-.06,2.66,[(.013,0),(.014,.198)],'opal',12)

# The planting is recessed against the facing wall of the first turn. Its fine
# leaves all belong to the near detail, with no texture or individual draw calls.
block('Recessed planting backdrop',33.447,24.39,.15,.025,1.79,2.57,'wall inset')
block('Niche planter',33.566,24.39,.021,.246,1.76,.38,'planter',.017)
block('Dark soil',33.566,24.39,.393,.220,1.70,.015,'soil')
for t in (23.52,25.26):block('Niche side trim',33.485,t,.38,.083,.018,2.34,'brass')
# Broad, cupped leaves sit above the fine clusters. Each leaf has two slopes
# either side of its midrib, so the upper face catches the concealed light.
for root_t, tall in [(23.74,1.06),(24.0,.77),(24.25,1.46),(24.56,.87),(24.83,1.24),(25.00,.67)]:
    base=(root_t-t0,33.58-s0,.407)
    for j in range(7):
        az=rng.uniform(0,math.tau)
        sideways=math.cos(az)*rng.uniform(.15,.43)
        forward=.09+abs(math.sin(az))*.17
        height=tall*rng.uniform(.63,1.10)
        start=(base[0]+.27*sideways,base[1]+.23*forward,base[2]+.55*height)
        mesh.rod('Upright stem',[base,start],.005,'stalk',5)
        blade=[];width=rng.uniform(.058,.111)
        # Use mostly sideways spread; the back of the recessed bed is a solid wall.
        for k in range(7):
            u=k/6;w=width*math.sin(math.pi*u)**.85
            cx=start[0]+sideways*u;cd=start[1]+forward*u
            h=start[2]+height*(.34*u+.25*math.sin(math.pi*u))
            blade.extend([(cx-w*.65,cd-w*.48,h-.30*w), (cx,cd,h+.19*w),
                          (cx+w*.65,cd+w*.48,h-.30*w)])
        faces=[(3*k+j,3*(k+1)+j,3*(k+1)+j+1,3*k+j+1) for k in range(6) for j in range(2)]
        mesh.piece('Cupped lance leaf',blade,faces,rng.choice(('green','new leaf','shade leaf')))
    for direction in [-1,1]:
        length=rng.uniform(.30,.60);rise=rng.uniform(.34,.72)
        midpoints=[]
        for k in range(10):
            u=k/9;midpoints.append((base[0]+direction*length*u,base[1]+.16*u,
                               base[2]+rise*math.sin(1.90*u)+.09))
        mesh.rod('Palm frond rachis',midpoints,.004,'stalk',5)
        for k in range(1,9):
            x,d,z=midpoints[k];w=.105*math.sin(math.pi*k/10)
            for side in (-1,1):
                # Individually folded paired leaflets, with a tapered tip.
                mesh.piece('Palm leaflet',[(x,d,z),(x+direction*.035,d+side*w*.63,z+.025),
                       (x+direction*.090,d+side*w,z+.012),(x+direction*.041,d+side*w*.47,z+.004)],
                       [(0,1,2),(0,2,3)],rng.choice(('fern','green','new leaf')))

# A repeated inclined bay spans the already registered ramp. Horizontal seams
# at the walls and the soffit follow the floor grade continuously from bay to bay.
bay = bpy.data.collections.new('HouseEntryRampBay')
scene.collection.children.link(bay)
mesh.group = bay
length = (69.08-38.1)/6
grade = (2.1-.008)/(69.08-35.7)

def sloped(name, x0, x1, d0, d1, z0, z1, finish):
    vertices=[(x,d,z+d*grade) for z in (z0,z1) for d in (d0,d1) for x in (x0,x1)]
    return mesh.piece(name,vertices,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)],finish)

low,high=-length/2,length/2
for j in range(4):
    for i in range(3):
        xa=-1.30+i*2.60/3; da=low+length*j/4
        paving('Honed stone · inclined bay',xa+.002,da+.002,xa+2.60/3-.002,da+length/4-.002,
               lambda d:d*grade,stone_rng.choice(stones))
for side in (-1,1):
    for i in range(6):
        d0=low+length*i/6;d1=low+length*(i+1)/6
        x=side*1.266
        sloped('Bronze lining leaf',x-.008,x+.008,d0+.005,d1-.005,.115,3.015,
               ('bronze A','bronze B','bronze C','bronze B','bronze A','bronze C')[i])
    x=side*1.260
    sloped('Brushed plinth return',x-.016,x+.016,low,high,.008,.103,'skirting')
sloped('Inclined ivory soffit',-1.277,1.277,low,high,3.00,3.032,'lacquered ceiling')
for x in (-1.03,1.03):
    sloped('Continuous black ceiling reveal',x-.022,x+.022,low,high,2.994,3.001,'slot')
for d in (-length*.25,length*.25):
    ceiling=grade*d+3
    mesh.profile('Bypass lamp baffle',0,d,ceiling-.021,[(.061,0),(.071,.014),(.061,.020)],'baffle',16)
    mesh.profile('Bypass lamp lens',0,d,ceiling-.025,[(.038,0),(.044,.005)],'opal',16)
# Place this collection beside the vestibule in the asset browser preview.
# The exporter subtracts its authoring offset from every mesh.
bay['preview_origin']=(7,0,0)
for obj in bay.objects: obj.location.x += 7

scene['source_note']='Central City 1F House of Shinsegae. Public restaurant film, 1:43–1:57. Original game floor registration, photo-proportioned finishes.'
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'vestibule.blend'),compress=True)
