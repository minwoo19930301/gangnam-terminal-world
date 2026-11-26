"""Van Leeuwen Gangnam serving counter and paper goods, photographed July 2026."""
from pathlib import Path
from math import cos, sin, pi
import bpy, subprocess, tempfile
from mathutils import Matrix

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('VanLeeuwen')
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

with tempfile.TemporaryDirectory() as tmp:
    texture=Path(tmp)/'Shop print.png'
    subprocess.run(['node',str(directory/'raster.mjs'),str(texture)],check=True)
    image=bpy.data.images.load(str(texture));image.pack()
image.name='Cup, bag and counter print'
print_material=bpy.data.materials.new('매장 포장 인쇄')
print_material.use_nodes=True
tree=print_material.node_tree
tex=tree.nodes.new('ShaderNodeTexImage');tex.image=image
tree.links.new(tex.outputs['Color'],tree.nodes.get('Principled BSDF').inputs['Base Color'])

def printed(name,points,region,tint='FFFFFF'):
    ob=mesh(name,points,[tuple(range(4))],tint)
    matte=print_material
    if tint!='FFFFFF':
        key='인쇄 · '+tint
        matte=bpy.data.materials.get(key)
        if not matte:
            matte=print_material.copy();matte.name=key
            nt=matte.node_tree;mix=nt.nodes.new('ShaderNodeMixRGB')
            mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
            mix.inputs[2].default_value=bpy.data.materials[tint].diffuse_color
            nt.links.new(nt.nodes.get('Image Texture').outputs['Color'],mix.inputs[1])
            nt.links.new(mix.outputs[0],nt.nodes.get('Principled BSDF').inputs['Base Color'])
    ob.data.materials.clear();ob.data.materials.append(matte)
    ob['paper_tint']=tint
    uv=ob.data.uv_layers.new(name='Artwork')
    l,t,r,b=region
    for i,(u,v) in enumerate([(l,b),(r,b),(r,t),(l,t)]):
        uv.data[i].uv=((u+.5)/512,1-(v+.5)/512)
    return ob

def paper(name,x,y,z,w,h,region):
    return printed(name,[(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y,z+h),(x-w/2,y,z+h)],region)

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
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=(x,y,z))
    obj=finish(bpy.context.object,name,color)
    obj.scale=(w/2,d/2,h/2)
    for poly in obj.data.polygons:
        poly.use_smooth=True
    return obj

def mesh(name,points,faces,color):
    data=bpy.data.meshes.new(name)
    data.from_pydata(points,[],faces)
    obj=bpy.data.objects.new(name,data)
    return finish(obj,name,color)

# The public aisle is Blender -Y. The storefront spans the guide bay; case depth
# and merchandise sizes reproduce the photographs by proportion.
logo=(0,0,273,82)
ivory='F8EFDA'
def word(name,x,y,z,w,h,tint='FFFFFF'):
    return printed(name,[(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y,z+h),(x-w/2,y,z+h)],logo,tint)
def tub(name,x,y,base,r1,r2,h,c,n=24):
    bpy.ops.mesh.primitive_cone_add(vertices=n,radius1=r1,radius2=r2,depth=h,location=(x,y,base+h/2))
    ob=finish(bpy.context.object,name,c)
    for face in ob.data.polygons:face.use_smooth=len(face.vertices)==4
    return ob
def rim(name,x,y,z,r,thick,c):
    bpy.ops.mesh.primitive_torus_add(major_segments=24,minor_segments=6,location=(x,y,z),major_radius=r,minor_radius=thick)
    return finish(bpy.context.object,name,c)
def hoop(name,path,r,color):
    from mathutils import Vector
    for a,b in zip(path,path[1:]):
        v=Vector(b)-Vector(a)
        bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=r,depth=v.length,location=(Vector(a)+Vector(b))/2)
        o=finish(bpy.context.object,name,color);o.rotation_euler=v.to_track_quat('Z','Y').to_euler()
def panel(name,x,y,z,w,h,base):
    box(name,x,y,z,w,.11,h,base,.025)
    for side in [-1,1]:
        box('Raised walnut surround',x+side*(w/2-.065),y-.065,z,.067,.045,h-.07,'8C572F',.008)
        box('Raised walnut surround',x,y-.065,z+side*(h/2-.065),w-.07,.045,.067,'8C572F',.008)
# Branch exterior photograph shows framed walnut panels surrounding an open serving bay.
for side in [-1,1]:
    panel('Oak side pier',side*3.08,.05,1.48,.75,2.96,'B17D4A')
    panel('Overhead oak panel',side*2.36,.05,2.83,1.53,.43,'AB7647')
box('Wood lintel',0,.05,3.14,6.95,.31,.16,'945F37',.02)
box('Warm cream shop soffit',0,1.18,3.12,6.52,2.20,.12,'FAECD0')
for side in [-1,1]:
    box('Pale side reveal',side*3.19,1.17,1.55,.11,2.18,3.10,'EDDFBF')
box('Cream tile back wall',0,2.24,1.48,6.48,.15,2.96,'F2E6C8')
box('Pastel menu wall frame',0,2.11,2.36,3.75,.12,.73,'A69D83',.018)
paper('Four photographed pastel menu headers',0,2.036,2.03,3.60,.65,(0,95,504,249))
box('Branch sign black field',0,-.005,2.83,2.36,.10,.43,'302C28',.014)
# On the exterior the photographed script is light on a dark field.
# A separate print keeps its correct polarity as well as the cups' dark ink.
paper('Cream script silhouette',0,-.062,2.68,1.32,.30,(4,272,269,346))
box('Low ivory counter',0,.40,.51,5.40,.91,1.02,'DEC7A3',.04)
box('Pale serving top',0,.37,1.035,5.48,1.02,.10,'FAF4E7',.027)
# Raised presentation of printed cups, pints, shakes and carriers, in the branch press photo.
box('Cream sample plinth',-.50,.21,1.12,3.15,.52,.07,'FCF4E3',.025)
box('Upright brand panel soft grey frame',-.68,.74,1.59,1.15,.105,.97,'AFB1A7',.034)
box('Upright pistachio brand panel',-.68,.68,1.59,1.06,.04,.88,'C9E6DB',.022)
word('Printed welcome panel',-.68,.656,1.48,.94,.22,'C9E6DB')
def carrier(name,x,y,z,w,h,c):
    box(name,x,y,z+h/2,w,.25,h,c,.018)
    word(name+' front ink',x,y-.129,z+h*.31,w*.91,w*.20,c)
    for k in [-1,1]:
        support=y+k*.085
        pts=[(x+w*.17*cos(pi*j/10),support,z+h+.15*sin(pi*j/10)) for j in range(11)]
        hoop('Twisted paper handles',pts,.008,'E3DCCA')
carrier('Mint handled bag',1.53,.46,1.09,.54,.72,'B6D7CA')
carrier('Printed lavender carry carton',.72,.55,1.09,.70,.58,'DBCCDD')
for dx,dz,r,c in [(-.22,.45,.073,'E7DFA1'),(.21,.35,.092,'E6D992'),(-.20,.15,.07,'B4D9CF')]:
    oval('Printed pastel spots',.72+dx,.419,1.09+dz,2*r,.008,2*r,c)
def serving(name,x,y,z,scale,c,scoop=None,lid=False):
    r=.133*scale;h=.188*scale
    tub(name,x,y,z,r*.78,r,h,c);rim('Rolled paper lip',x,y,z+h,r,.008*scale,'F7F0E3')
    # Curved brand print sits on the tapered front of the cup.
    strips=12;theta=.95
    for i in range(strips):
        a=-theta+2*theta*i/strips;b=-theta+2*theta*(i+1)/strips
        def corner(t,at):
            rr=r*(.78+.22*at)+.0008
            return(x+rr*sin(t),y-rr*cos(t),z+h*at)
        printed('Cup ink', [corner(a,.35),corner(b,.35),corner(b,.68),corner(a,.68)],
                (273*i/strips,0,273*(i+1)/strips,82),c)
    if lid:
        tub('Printed pint lid',x,y,z+h,r*1.035,r*1.035,.017*scale,c)
    if scoop:
        oval('Hand scooped ice cream',x,y,z+h+.028*scale,1.93*r,1.88*r,1.41*r,scoop)
        for i in range(6):
            a=i*pi/3
            oval('Scraped scoop edge',x+r*.63*cos(a),y+r*.63*sin(a),z+h+.012*scale,r*.75,r*.59,r*.49,scoop)
for i,(c,s) in enumerate([('E7D4D1','EEE4C6'),('E8D8A5','B5B599'),('BFDAD2','DFC5B0')]):
    serving('Portion cup',-1.45+i*.35,.075,1.155,.99,c,s)
for i,c in enumerate(['DFCCD9','BED8CE','EFE3AE']):
    serving('Pastel pint',-1.63+i*.39,.44,1.155,1.25,c,lid=True)
for i,c in enumerate(['C4907C','DDAEAF','E9D4AE']):
    x=.17+i*.31;serving('Exclusive baby shake',x,.07,1.155,.88,'F5EAD7')
    tub('Shake and cream',x,.07,1.315,.106,.103,.035,c)
    for j in range(3): oval('Whipped cream',x-.022*j,.07,1.36+j*.025,.13-j*.032,.12-j*.025,.066,'F7ECDB')
# Covered service freezer at the other end, seen in the source behind the press models.
box('Service freezer',2.17,.50,1.16,.85,.74,.21,'BCC3BD',.04)
for i in range(3):
    tub('Stainless well lids',1.90+.27*i,.46,1.27,.113,.117,.018,'DCE0DC')
    box('Recessed well handle',1.90+.27*i,.46,1.30,.066,.024,.019,'8F9590',.005)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'display.blend'),compress=True)
