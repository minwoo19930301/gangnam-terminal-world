"""Build the tiled pier below the dessert hall's intersecting vaults."""
from pathlib import Path
from math import cos, sin, pi
import bpy
from mathutils import Vector

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('SweetParkArcadePier')
bpy.context.scene.collection.children.link(collection)

def finish(obj, name, hexcolor):
    obj.name = name
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    collection.objects.link(obj)
    mat = bpy.data.materials.get(hexcolor)
    if not mat:
        mat = bpy.data.materials.new(hexcolor)
        values = [int(hexcolor[i:i+2],16)/255 for i in (0,2,4)]
        mat.diffuse_color = (*[((c+.055)/1.055)**2.4 for c in values],1)
    obj.data.materials.append(mat)

def box(name,x,y,z,w,d,h,col):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    obj = bpy.context.object
    obj.dimensions = (w,d,h)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    finish(obj,name,col)

def disk(name,x,y,z,r,h,col):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=r,depth=h,location=(x,y,z))
    finish(bpy.context.object,name,col)

# Four inset channels separate the tiled faces where two vault axes meet.
box('Tiled pier core',0,0,1.79,.74,.74,3.45,'CCBFA4')
for side in range(4):
    a=side*pi/2
    outward=Vector((cos(a),sin(a)))
    across=Vector((-sin(a),cos(a)))
    def face(name,u,v,z,w,d,h,color):
        x,y=across*u+outward*v
        box(name,x,y,z,d if side%2==0 else w,w if side%2==0 else d,h,color)
    face('Recessed brass reveal',0,.375,1.78,.046,.015,3.15,'866C45')
    def tile(u,z,width,color):
        # The shaft already supplies the bedding. Only the exposed glaze face
        # needs triangles, including in the exported instanced game mesh.
        points=[]
        for offset,height in [(-width/2,-.076),(width/2,-.076),(width/2,.076),(-width/2,.076)]:
            xy=across*(u+offset)+outward*.431
            points.append((xy.x,xy.y,z+height))
        mesh=bpy.data.meshes.new('Tile face')
        mesh.from_pydata(points,[],[(0,1,2,3)])
        obj=bpy.data.objects.new('Glazed block',mesh)
        finish(obj,'Glazed block',color)
    for half in [-1,1]:
        face('Projecting ceramic pilaster',half*.215,.39,1.79,.36,.066,3.45,'D1BEA2')
        # Shallow mortar joints and variation in the glazed cream tiles.
        for row in range(19):
            widths=[.18,.18] if row%2==0 else [.09,.18,.09]
            left=half*.215-.18
            for j,w in enumerate(widths):
                tile(left+w/2,.32+(row+.5)*.158,w-.006,['F3E5D1','F1E1CA','EEDCC3'][(row+side+j)%3])
                left+=w
for z,w,h,col in [(.14,.87,.28,'776041'),(.296,.90,.033,'AA8755'),
                    (3.326,.88,.08,'92714B'),(3.39,.94,.048,'AF905D'),
                    (3.438,1.00,.055,'846440'),(3.48,1.05,.034,'C7A36E')]:
    box('Bronze plinth and stepped cornice',0,0,z,w,w,h,col)
# Public photo shows a shallow, twin-disc wall light and rectangular mount.
box('Bronze sconce backplate',0,-.438,2.73,.10,.042,.36,'634932')
box('Sconce arm',0,-.52,2.76,.048,.18,.037,'A18351')
for z in [2.72,2.81]:
    disk('Opal wall-light diffuser',0,-.62,z,.104,.033,'FFF4D6')
    disk('Spun bronze shade',0,-.62,z+.025,.115,.018,'987341')
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/'pier.blend'),compress=True)
