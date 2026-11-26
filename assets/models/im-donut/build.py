"""I'm donut? Shinsegae Gangnam. Publicly visible sales counter and window finishes, July 2026."""
from pathlib import Path
from math import cos, sin, pi
import bpy, subprocess, tempfile
from mathutils import Matrix

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('ImDonutGangnam')
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
image.name='Shop package and facade typography'
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

import random
rng=random.Random(127)
def mixed(color,factor):
    return ''.join(f'{min(255,round(int(color[i:i+2],16)*factor)):02X}' for i in (0,2,4))

# Positive local width is toward the neighbouring sandwich shop, -Y is the customer aisle.
def rail(name,x,y,z,w,d,h,color):
    box(name,x,y,z,w,d,h,color,.009)
def frame(name,x,y,z,w,h):
    box(name,x,y,z,w,.17,h,'AD7F50',.016)
    for side in [-1,1]:
        rail('Router-cut inset',x+side*(w/2-.09),y-.10,z,.06,.05,h-.12,'775333')
        rail('Router-cut inset',x,y-.10,z+side*(h/2-.09),w-.12,.05,.06,'775333')
for side in [-1,1]:
    frame('Upper oak panel',side*3.06,0,2.91,2.39,.48)
    frame('Entrance post',side*4.13,0,1.39,.33,2.78)
box('Cornice',0,.01,3.22,8.65,.28,.17,'995F39',.03)
box('Cream shop soffit',0,1.19,3.15,8.22,2.32,.11,'F3E4C8')
box('Dark sign board',0,-.02,2.92,3.44,.16,.53,'29282B',.016)
paper('Light store wordmark',0,-.103,2.72,2.16,.41,(5,4,506,98))
box('Pale back wall',0,2.31,1.56,8.20,.14,3.13,'EEE3BD')
bpy.ops.object.text_add(location=(-1.68,2.228,1.76),rotation=(pi/2,0,0))
letters=bpy.context.object;letters.data.body="I'm donut ?";letters.data.align_x='CENTER'
letters.data.size=.65;letters.data.extrude=.008;letters.data.resolution_u=3
for font in [Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf'),Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')]:
    if font.is_file():
        letters.data.font=bpy.data.fonts.load(str(font));break
bpy.ops.object.convert(target='MESH');finish(letters,'Raised white letters on ivory panels','FFFAED')
for i in [-3,-2,-1,0]:
    rail('Back panel joint',i*.91,2.222,1.64,.012,.012,2.87,'D1C6A9')
# The shop photograph shows a stainless open prep window, clean white worktop,
# nested mixer bowls and low square prep bins visible alongside the public bakery.
box('Steel prep window',2.49,2.17,1.70,2.95,.13,2.42,'87949B')
box('Dark opening under hood',2.49,2.081,1.71,2.80,.07,.78,'647B87')
box('Brushed stainless hood',2.49,1.90,2.34,2.87,.47,.35,'A9B4B7',.015)
box('Light beneath hood',2.49,1.65,2.168,2.78,.035,.021,'FFF8DC')
box('Prep cabinets',2.52,1.83,.56,2.82,.69,1.08,'B5BCBA',.025)
box('White worktop',2.52,1.78,1.12,2.90,.79,.065,'EFE7D0',.018)
def bowl(name,x,y,z,r,h,mat):
    count=24;profile=[(.40*r,0),(.70*r,h*.20),(r,h),(.89*r,h),(.63*r,h*.25),(.37*r,.03)]
    vs=[(x+rr*cos(i*2*pi/count),y+rr*sin(i*2*pi/count),z+hh) for rr,hh in profile for i in range(count)]
    fs=[(j*count+i,j*count+(i+1)%count,(j+1)*count+(i+1)%count,(j+1)*count+i) for j in range(len(profile)-1) for i in range(count)]
    o=mesh(name,vs,fs,mat)
    for p in o.data.polygons:p.use_smooth=True
bowl('Polished mixing bowl',2.17,1.69,1.16,.23,.16,'CBD0CE');bowl('Second mixing bowl',2.73,1.70,1.16,.26,.19,'B9C7C8')
for k in range(5):
    rail('Prep pan stack',3.50,1.70,1.18+.035*k,.54,.43,.035,'D5DBD9')
for k in range(4):
    rail('Question-mark bakery trays',1.47,1.77,1.19+.067*k,.46,.43,.065,'F6EFDF')
    paper('Tray stamp',1.47,1.548,1.165+.067*k,.125,.057,(176,323,335,416))
# White logo cartons and large plates are shown with the actual July assortment.
box('Counter with amber front',0,.37,.51,6.41,.95,1.02,'AC754E',.043)
box('Counter cap',0,.33,1.038,6.57,1.05,.10,'E5D0B2',.023)
def carton(x,y,z,w,d,h):
    box('White paper carton',x,y,z+h/2,w,d,h,'FBF7F2',.007)
    box('Lid lip',x,y,z+h-.015,w+.016,d+.016,.023,'EEE8DF',.005)
    paper('Black carton print',x,y-d/2-.005,z+h*.14,w*.86,h*.70,(5,110,506,203))
for center in [-2.27,.0,2.15]:
    for row in range(2):
        carton(center,.58,1.088+row*.17,1.10,.38,.17)
# Cross sections have an actual hole, irregular fried shell and independent glaze.
def ring(name,x,y,z,r,style,glaze,tilt):
    n=40;bands=12
    def point(i,j,layer):
        a=2*pi*i/n;t=2*pi*j/bands
        if style=='square':outer=((abs(cos(a))**5+abs(sin(a))**5)**(-1/5))*.90
        elif style=='lobes':outer=.92+.13*cos(a*5)
        else:outer=1+.036*sin(3*a+.2)
        body=r*(.327+.016*sin(7*a+.68))*(1+.03*sin(3*t+2*a))
        radius=r*.65*outer+(body+layer)*cos(t)
        dy=radius*sin(a);dz=(body+layer)*.88*sin(t)
        return(x+radius*cos(a),y+dy*cos(tilt)-dz*sin(tilt),z+dy*sin(tilt)+dz*cos(tilt))
    for layer,mat,rows in [(0,'BD803D',list(range(bands))),(.0017,glaze,list(range(7)))]:
        vs=[point(i,j,layer) for j in rows for i in range(n)]
        fs=[(j*n+i,j*n+(i+1)%n,((j+1)%len(rows))*n+(i+1)%n,((j+1)%len(rows))*n+i) for j in range(len(rows) if not layer else len(rows)-1) for i in range(n)]
        o=mesh(name,vs,fs,mat)
        for scale in [.87,.94,1.04]:
            code=mixed(mat,scale)
            if not bpy.data.materials.get(code):
                m=bpy.data.materials.new(code);rgb=[int(code[i:i+2],16)/255 for i in (0,2,4)]
                m.diffuse_color=(*[((v+.055)/1.055)**2.4 for v in rgb],1)
            o.data.materials.append(bpy.data.materials[code])
        for idx,poly in enumerate(o.data.polygons):
            poly.use_smooth=True
            a=2*pi*(idx%n)/n;t=2*pi*(idx//n)/bands
            grain=.34*sin(3*a+.42)+.22*sin(7*a+2*t)+.14*sin(12*a-3*t)+.14*cos(3*t)
            poly.material_index=1 if grain<-.48 else 2 if grain<-.14 else 3 if grain>.30 else 0
def plate(x,y,z,r):
    oval('Oval cream serving plate',x,y,z,2*r,1.67*r,.035,'E8DDC3')
for row,(cx,style,shade) in enumerate([(-2.31,'round','D69A56'),(-1.18,'square','DD94A1'),(-.02,'lobes','617347'),(1.09,'round','945840'),(2.26,'round','D9AB64')]):
    plate(cx,.02,1.105,.50)
    for j,(dx,dy,size) in enumerate([(-.195,-.075,.169),(.15,-.07,.166),(0,.135,.17)]):
        tilt=.96 if j==2 else .12*(-1 if j==1 else 1)
        center_z=1.13+size*(.28*cos(tilt)+.78*abs(sin(tilt)))
        ring('Hand-glazed '+style,cx+dx,.02+dy,center_z,size,style,shade,tilt)
        if row in [3,4] and j!=2:
            for k in range(6):
                a=rng.uniform(0,2*pi);radius=size*.67
                oval('Chocolate fleck',cx+dx+radius*cos(a),.02+dy+radius*sin(a),1.125+size*.526,.020,.016,.008,'62442E')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'display.blend'),compress=True)
