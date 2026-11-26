"""Rebuild the operator-guide café threshold from the signage designer's branch photograph."""
from pathlib import Path
from math import cos, sin, pi
import json, random
import bpy

here=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('SweetParkCoffeeThreshold')
bpy.context.scene.collection.children.link(collection)
paint=bpy.data.materials.new('목공 · 투광유리 · 도장 마감');paint.use_nodes=True
nodes=paint.node_tree.nodes
vcol=nodes.new('ShaderNodeVertexColor');vcol.layer_name='Finish'
bsdf=nodes.get('Principled BSDF');paint.node_tree.links.new(vcol.outputs['Color'],bsdf.inputs['Base Color'])
bsdf.inputs['Roughness'].default_value=.40
# The guide's two fitted storefront edges are slightly skewed. Local -Y points to
# the shopper; the roof runs toward the earlier point on the same public centreline.
shear=.259
verts=[];faces=[];shades=[]
def face(pts,tones):
    at=len(verts);verts.extend((x-shear*y,y,z)for x,y,z in pts)
    faces.append(tuple(range(at,len(verts))));shades.append(tones)
def part(name):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    mesh.materials.append(paint)
    attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
    for f,sh in zip(mesh.polygons,shades):
        sh=[sh]*len(f.loop_indices) if isinstance(sh,str) else sh
        for i,hexcode in zip(f.loop_indices,sh):
            attr.data[i].color_srgb=(*[int(hexcode[j:j+2],16)/255 for j in (0,2,4)],1)
    o=bpy.data.objects.new(name,mesh);collection.objects.link(o)
    verts.clear();faces.clear();shades.clear()
    return o
def box(x,y,z,w,d,h,c,bottom=None):
    lo=[(x+a*w/2,y+b*d/2,z)for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    hi=[(a,b,k+h)for a,b,k in lo]
    face(lo[::-1],bottom or c);face(hi,c)
    for i in range(4):
        j=(i+1)%4;face([lo[i],lo[j],hi[j],hi[i]],c)
def rectangle_frame(x,y,z,w,h,depth,edge,color):
    for side in [-1,1]:
        box(x+side*(w-edge)/2,y,z,edge,depth,h,color)
        box(x,y,z+(h-edge)*(side+1)/2,w-2*edge,depth,edge,color)

# Shallow kick, panelled posts and the framing over the open public aisle.
for side in [-1,1]:
    x=side*1.425
    box(x,0,.015,.105,.21,3.42,'342d29')
    box(x,-.114,.067,.104,.023,3.22,'514237')
    for flank in [-1,1]:
        box(x+.041*flank,-.132,.106,.012,.010,3.14,'786153')
    box(x,-.015,.018,.137,.241,.088,'52483f')
    box(x,-.015,.107,.128,.229,.013,'b5a17f')
    part('Photo threshold · '+('south' if side>0 else 'north')+' dark jamb')
# Min height 2.87 m, and posts sit outside the 2.74 m guide opening.
box(0,.005,2.885,2.995,.247,.455,'45372e')
box(0,-.004,2.866,3.006,.262,.033,'58483a')
box(0,-.011,2.899,2.98,.257,.021,'786456')
box(0,-.005,3.333,3.013,.269,.055,'4c3f34')
box(0,-.004,3.39,3.04,.278,.023,'6f5e4b')
part('Full-width dark walnut lintel with stepped mouldings')
# The central opaque sign is flanked by two panes on each side. Bake the broad
# reflected light and narrower highlights seen in the photo; no reflection probes.
for side in [-1,1]:
    for i,(offset,w) in enumerate([(.805,.445),(1.201,.279)]):
        x=side*offset;edge=.024;z=2.949;h=.337;yp=-.129
        rectangle_frame(x,yp,z,w,h,.038,edge,'3e352e')
        rectangle_frame(x,yp-.019,z+.024,w-.045,h-.047,.012,.009,'8a7e69')
        l,r=x-w/2+.036,x+w/2-.036;b,t=z+.036,z+h-.036
        face([(l,yp-.009,b),(r,yp-.009,b),(r,yp-.009,t),(l,yp-.009,t)],
             ['767267','ada99b','d8d1c4','94917e'] if i else ['817b6d','a39a86','d3c8b5','bcb39e'])
        face([(l,yp-.012,t-.018),(r,yp-.012,t-.006),(r,yp-.012,t-.067),(l,yp-.012,b+.041)],
             ['b0ac99','c4beaf','c6c3b8','a9a193'])
    part('Borrowed light · '+('right' if side>0 else 'left')+' glazed transom')
rectangle_frame(0,-.129,2.942,1.129,.350,.035,.020,'342b25')
box(0,-.151,2.966,1.077,.010,.3,'493930')
part('Inset central sign panel')
# The letter silhouette was traced from the commissioned signage photograph.
# Editable curve points preserve the distinctive capitals and letter spacing.
cur=bpy.data.curves.new('SWEET PARK · RMS 윤곽','CURVE');cur.dimensions='2D';cur.fill_mode='BOTH';cur.resolution_u=1;cur.extrude=.0015
for loop in json.loads((here/'wordmark.json').read_text()):
    sp=cur.splines.new('POLY');sp.points.add(len(loop)-1);sp.use_cyclic_u=True
    for p,(x,y)in zip(sp.points,loop):
        p.co=((x-124.5)*.665/249,(14.5-y)*.665/249,0,1)
letters=bpy.data.objects.new('SWEET PARK · 투광식 흰 글자',cur)
collection.objects.link(letters);letters.location=(.042,-.160,3.117);letters.rotation_euler.x=pi/2
# Keep a native curve in the .blend; export evaluates a disposable copy.
letter_mat=bpy.data.materials.new('발광 흰색');letter_mat.diffuse_color=(1,.98,.90,1);cur.materials.append(letter_mat)
# Luminous rectangular field in the axial shop approach. Recessed trim
# progresses from low outer mouldings to the inner grid as on the source.
yc=-3.26;length=5.24
for side in [-1,1]:
    box(side*1.31,yc,4.006,.225,length+.61,.12,'dbd0b9','d4c8b1')
    box(side*1.184,yc,4.083,.080,length+.42,.067,'b3a489','b9aa8c')
    box(side*1.13,yc,4.12,.045,length+.32,.067,'f2ddaf','fff0cb')
    box(side*1.081,yc,4.163,.048,length+.23,.051,'dbceae','efe2c6')
    box(side*1.046,yc,4.208,.051,length+.12,.043,'796a56','ac9c81')
    box(0,yc+side*(length+.36)/2,4.013,2.54,.25,.09,'ddd2ba','e5d8bf')
    box(0,yc+side*(length+.16)/2,4.111,2.26,.081,.08,'d9c8a9','f1e3bf')
    box(0,yc+side*(length+.06)/2,4.198,2.13,.048,.058,'b8a98f','c4b597')
part('Stepped cream plaster and warm cove surrounding the light grid')
cols,rows=4,8;wid=2.05;depth=length-.03
for j in range(rows):
    for i in range(cols):
        x=(i+.5-cols/2)*wid/cols;y=yc+(j+.5-rows/2)*depth/rows
        x0=x-wid/cols*.5+.009;x1=x+wid/cols*.5-.009;y0=y-depth/rows*.5+.012;y1=y+depth/rows*.5-.012
        face([(x0,y1,4.256),(x1,y1,4.256),(x1,y0,4.256),(x0,y0,4.256)],
             ['fff3dc','fff8ea','f5efdd','f9f2e3'])
box(0,yc,4.259,wid+.030,depth+.035,.025,'655747','5a5146')
for i in range(cols+1):box((i-cols/2)*wid/cols,yc,4.237,.021,depth+.032,.022,'625447','52493e')
for j in range(rows+1):box(0,yc+(j-rows/2)*depth/rows,4.234,wid+.022,.025,.025,'695b4b','534b41')
part('Rectangular diffusing glass and dark metal glazing bars')
# Thin fitted marble inlay on the existing continuous public floor plate.
rng=random.Random(35)
def tile(x0,x1,y0,y1,z,tones):
    face([(x0,y0,z),(x1,y0,z),(x1,y1,z),(x0,y1,z)],tones)
for row in range(18):
    y0=-8.04+row*.49;y1=y0+.49
    tile(-1.00,1.00,y0,y1,.023,'d9cebd')
    for col in range(4):
        x0=-.98+col*.49;x1=x0+.49
        tones=['9b8c7f','ada095','9e8e82','b2a39a']
        tile(x0+.024,x1-.024,y0+.024,y1-.024,.025,rng.sample(tones,4))
        for _ in range(7):
            a=rng.uniform(.045,.32);b=rng.uniform(.04,.31);dx=rng.uniform(.04,.12)
            face([(x0+a,y0+b,.026),(x0+a+dx,y0+b+.031,.026),
                  (x0+a+dx+.02,y0+b+.037,.026),(x0+a+.004,y0+b+.005,.026)],
                 rng.choice(['b9aa9e','99897d','c3b7aa']))
    for col in range(5):
        x=-.98+col*.49
        tile(x-.024,x+.024,y0-.024,y0+.024,.026,'312c28')
    for side in [-1,1]:
        for center,w,c in [(1.022,.042,'3b332e'),(1.093,.10,'e1d6c2'),(1.173,.06,'302c29'),(1.26,.114,'ded1bc')]:
            x=side*center
            tile(x-w/2,x+w/2,y0,y1,.024,c)
part('Warm marble squares, pale divider strips, dark intersection keys and borders')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'threshold.blend'),compress=True)
