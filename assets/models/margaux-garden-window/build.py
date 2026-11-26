"""Editable public dining-room window, eave and hanging glass at JW Seoul."""
from math import cos, pi, sin
from pathlib import Path
import sys
import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(HERE))
from floor import floor_finish
from settings import add_settings
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0


def linear(n):
    n /= 255
    return n / 12.92 if n < .04045 else ((n + .055) / 1.055) ** 2.4


def rgb(value):
    return tuple(linear(int(value[i:i + 2], 16)) for i in (0, 2, 4)) + (1,)


def material(name, metallic=0, rough=.44, alpha=1, emit=False):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    attr = m.node_tree.nodes.new('ShaderNodeVertexColor')
    attr.layer_name = 'Color'
    m.node_tree.links.new(attr.outputs['Color'], p.inputs['Base Color'])
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = rough
    p.inputs['Alpha'].default_value = alpha
    if alpha < 1:
        m.surface_render_method = 'DITHERED'
    if emit:
        m.node_tree.links.new(attr.outputs['Color'], p.inputs['Emission Color'])
        p.inputs['Emission Strength'].default_value = 1.15
    return m


def group(name, mat):
    c = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(c)
    return c, mat


FRAME = group('GardenSteel', material('Painted steel, wood and brushed bronze', .24))
GLASS = group('GardenGlass', material('Fluted glass and canopy glazing', .05, .13, .27))
LIGHT = group('GardenLight', material('Warm lamp filaments', emit=True))


class Part:
    def __init__(self, name, group):
        self.name, self.group = name, group
        self.vertices, self.faces, self.colors = [], [], []

    def face(self, vertices, color):
        start = len(self.vertices)
        # Source coordinates follow game x/elevation/z. Blender's Y points north.
        self.vertices.extend((x, -z, y) for x, y, z in vertices)
        self.faces.append(tuple(range(start, len(self.vertices))))
        self.colors.extend([rgb(color)] * len(vertices))

    def box(self, x, y, z, w, h, d, color):
        p = [(x + a*w/2, y + b*h/2, z + c*d/2)
             for a,b,c in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),
                           (-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
        for indices in [(3,2,1,0),(4,5,6,7),(0,1,5,4),(2,3,7,6),(1,2,6,5),(0,4,7,3)]:
            self.face([p[i] for i in indices],color)

    def beam(self, a, b, width, depth, color):
        a, b = Vector(a), Vector(b)
        axis = (b-a).normalized()
        side = axis.cross(Vector((0,1,0)))
        if side.length < .001:
            side = Vector((1,0,0))
        side.normalize()
        up = axis.cross(side).normalized()
        pa = [a + side*s*width/2 + up*t*depth/2 for s,t in [(-1,-1),(1,-1),(1,1),(-1,1)]]
        pb = [p+b-a for p in pa]
        self.face(pa[::-1],color)
        self.face(pb,color)
        for i in range(4):
            j=(i+1)%4
            self.face([pa[i],pa[j],pb[j],pb[i]],color)

    def turn(self, x, z, profile, count, color, flute=0):
        rings=[]
        for height, radius in profile:
            ring=[]
            for i in range(count):
                a=2*pi*i/count
                r=radius*(1+flute*cos(a*24))
                ring.append((x+r*cos(a),height,z+r*sin(a)))
            rings.append(ring)
        for lo,hi in zip(rings,rings[1:]):
            for i in range(count):
                j=(i+1)%count
                self.face([lo[j],lo[i],hi[i],hi[j]],color)
        self.face(rings[0],color)
        self.face(rings[-1][::-1],color)

    def finish(self):
        mesh=bpy.data.meshes.new(self.name)
        mesh.from_pydata(self.vertices,[],self.faces)
        mesh.update()
        attr=mesh.color_attributes.new(name='Color',type='BYTE_COLOR',domain='POINT')
        attr.data.foreach_set('color',[n for color in self.colors for n in color])
        obj=bpy.data.objects.new(self.name,mesh)
        collection,mat=self.group
        collection.objects.link(obj)
        mesh.materials.append(mat)


# The central band in the operator's wide photograph is opaque. The dining
# room sits below the 8F lobby in this reconstruction; retain that upper floor.
soffit=Part('Dark dining-room soffit and thin shadow joints',FRAME)
soffit.box(0,4.688,0,23.85,.025,17.74,'3e3630')
for i in range(14):
    z=-8.87+(i+.5)*17.74/14
    soffit.box(0,4.625,z,23.85,.10,17.74/14-.009,
               ['66574e','695a50','67584e','69594f'][i%4])
for x in [-8.05,-1.15,6.45]:
    soffit.box(x,4.54,0,.102,.1,17.74,'3d342e')
    for z in [-6.4,-2.35,1.85,5.95]:
        soffit.box(x,4.475,z,.076,.04,.195,'8b7257')
soffit.finish()

# Window heads, transoms, recessed gaskets and projecting stop mouldings.
# Break both transoms and base around the same doors used by the game.
def facade(name, wall, fixed, bays, opening):
    p=Part(name,FRAME)
    def box(along,height,span,thick,h,color):
        if wall in ('west','east'):p.box(fixed,height,along,thick,h,span,color)
        else:p.box(along,height,fixed,span,h,thick,color)
    lo,hi=bays[0],bays[-1]
    for u in bays:
        box(u,2.24,.095,.15,4.48,'3b3935')
        box(u,2.24,.038,.18,4.48,'68645b')
    for a,b in zip(bays,bays[1:]):
        mid=(a+b)/2
        if not opening[0]<mid<opening[1]:
            for h,w,c in [(.12,.15,'45423b'),(1.02,.053,'545149'),(2.64,.083,'403e39')]:
                box(mid,h,b-a,w,.066,c)
        box(mid,3.61,b-a,.083,.067,'504d46')
    box((lo+hi)/2,4.44,hi-lo,.23,.20,'353530')
    box((lo+hi)/2,4.335,hi-lo,.205,.023,'837b6c')
    p.finish()


west=[-8.85,-6.64,-4.43,-2.22,-.20,2.20,4.41,6.62,8.85]
south=[-11.92,-9.83,-7.74,-5.65,-3.56,-1.62,1.62,3.67,5.72,7.77,9.82,11.92]
facade('Garden window mullions with open door', 'west',-11.94,west,(-.20,2.20))
# The game already has a glazed east wall and a matching 2.4 m door. Carry
# the dining-room frame profile along the existing glass beside the hearth.
facade('Hearth side glazing with clear door', 'east',11.94,west,(-.20,2.20))
facade('Dining room end window with open door', 'south',8.935,south,(-1.62,1.62))

# True transparent sloping roof bays outside the solid overhead slab;
# the existing garden path and the 7F west door remain open beneath.
rafters=Part('Projecting garden rafters and glazing caps',FRAME)
panes=Part('Laminated roof panes',GLASS)
outer,inner=-13.87,-11.94
low,high=3.70,4.43
for z in west:
    rafters.beam((outer,low,z),(inner,high,z),.095,.15,'393a35')
    rafters.beam((outer,low+.075,z),(inner,high+.075,z),.045,.025,'7e7c72')
rafters.box(outer,low,0,.13,.14,17.82,'484741')
rafters.box((inner+outer)/2,(low+high)/2,0,.075,.065,17.7,'5d5d54')
for a,b in zip(west,west[1:]):
    panes.face([(outer,low+.05,a+.046),(outer,low+.05,b-.046),
                (inner,high+.05,b-.046),(inner,high+.05,a+.046)],'b9d6d8')
rafters.finish()
panes.finish()

for i,(x,z,bottom) in enumerate([(-4.30,7.63,2.54),(-3.85,7.42,2.81),(-3.43,7.60,2.64)]):
    hardware=Part('Pendant %d - braid, ferrule and lamp holder'%(i+1),FRAME)
    lens=Part('Pendant %d - twenty-four glass flutes'%(i+1),GLASS)
    wick=Part('Pendant %d - amber lamps'%(i+1),LIGHT)
    top=bottom+.69
    # Two offset twists wind around a dark core; quiet at a distance.
    hardware.turn(x,z,[(top+.095,.012),(4.56,.012)],12,'393632')
    for k in range(2):
        a=top+.10
        points=[]
        for n in range(37):
            t=n/36; ang=t*14*pi+k*pi
            points.append((x+.009*cos(ang),a+t*(4.54-a),z+.009*sin(ang)))
        for a,b in zip(points,points[1:]):
            hardware.beam(a,b,.009,.009,'514e47')
    hardware.turn(x,z,[(top-.035,.028),(top-.022,.037),(top+.007,.036),
                       (top+.012,.022),(top+.105,.021)],32,'a0825f')
    hardware.turn(x,z,[(4.53,.042),(4.56,.051),(4.575,.05)],24,'6f5b46')
    lens.turn(x,z,[(bottom,.060),(bottom+.012,.084),(bottom+.046,.099),
                   (bottom+.09,.104),(top-.17,.104),(top-.12,.10),
                   (top-.078,.081),(top-.04,.054),(top,.033)],96,'ebead8',.034)
    for j in range(5):
        ang=2*pi*j/5
        px,pz=x+.037*cos(ang),z+.037*sin(ang)
        wick.turn(px,pz,[(top-.190,.008),(top-.180,.013),(top-.153,.013),
                         (top-.145,.008)],12,'ffe1a3')
    # Reflected edge highlights at the ends of individual ribs leave the
    # central lower glass clear when viewed from below.
    for j in range(24):
        a=2*pi*j/24
        wick.beam((x+.077*cos(a),bottom+.013,z+.077*sin(a)),
                  (x+.086*cos(a),bottom+.032,z+.086*sin(a)),
                  .005,.004,'e7c288')
    hardware.finish()
    lens.finish()
    wick.finish()

add_settings(Part,FRAME,GLASS)
floor_finish(HERE,group,material,rgb)
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'window.blend'),compress=True)
