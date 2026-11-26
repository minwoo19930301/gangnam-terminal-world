"""Editable refrigerated aging cabinet in Shinsegae Market."""
from math import sin,cos,pi,exp
from pathlib import Path
import random,subprocess,tempfile
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
rng=random.Random(1963)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('ShinsegaeAgingCase')
bpy.context.scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)/'Aging cuts print.png'
    subprocess.run(['node',str(here/'art.mjs'),str(path)],check=True)
    image=bpy.data.images.load(str(path));image.pack()
image.name='Aging cuts print'
mat=bpy.data.materials.new('Aging cuts finish');mat.use_nodes=True
nt=mat.node_tree;bsdf=nt.nodes.get('Principled BSDF')
tex=nt.nodes.new('ShaderNodeTexImage');tex.image=image
vcol=nt.nodes.new('ShaderNodeVertexColor');vcol.layer_name='Finish'
mix=nt.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
nt.links.new(tex.outputs['Color'],mix.inputs[1]);nt.links.new(vcol.outputs['Color'],mix.inputs[2])
nt.links.new(mix.outputs[0],bsdf.inputs['Base Color']);bsdf.inputs['Roughness'].default_value=.46
white=(739,473,740,474)
vertex_index={};vertices=[];faces=[];colors=[];coords=[];smooth=[]
def uv(region,u,v):
    l,t,r,b=region
    return ((l+(r-l)*u+.5)/768,1-(b+(t-b)*v+.5)/512)
def face(poly,tone='ffffff',region=white,uvs=None,soft=False):
    indices=[]
    for point in poly:
        key=tuple(round(c,7) for c in point)
        if key not in vertex_index:
            vertex_index[key]=len(vertices);vertices.append(point)
        indices.append(vertex_index[key])
    faces.append(tuple(indices))
    colors.append(tone);smooth.append(soft)
    if uvs is None:uvs=[(0,0),(1,0),(1,1),(0,1)] if region!=white and len(poly)==4 else [(0,0)]*len(poly)
    coords.extend([uv(region,u,v) for u,v in uvs])
def part(name):
    me=bpy.data.meshes.new(name);me.from_pydata(vertices,[],faces);me.update()
    me.materials.append(mat);me.uv_layers.new(name='Shop finish')
    me.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
    texcoords=me.uv_layers['Shop finish'];col=me.color_attributes['Finish']
    for p,shade,s in zip(me.polygons,colors,smooth):
        p.use_smooth=s
        shades=[shade]*len(p.loop_indices) if isinstance(shade,str) else shade
        for i,value in zip(p.loop_indices,shades):
            col.data[i].color_srgb=tuple(int(value[k:k+2],16)/255 for k in (0,2,4))+(1,)
            texcoords.data[i].uv=coords[i]
    ob=bpy.data.objects.new(name,me);collection.objects.link(ob)
    vertex_index.clear();vertices.clear();faces.clear();colors.clear();coords.clear();smooth.clear()
    return ob
def box(x,y,z,w,d,h,tone='ffffff',side=white,top=None):
    lower=[(x+a*w/2,y+b*d/2,z) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    upper=[(px,py,z+h) for px,py,pz in lower]
    face(upper,tone,top or side);face(lower[::-1],tone)
    for i in range(4):
        k=(i+1)%4;face([lower[i],lower[k],upper[k],upper[i]],tone,side)
def front(x,y,z,w,h,region,tone='ffffff',slope=0):
    face([(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y+slope,z+h),(x-w/2,y+slope,z+h)],tone,region)
def rod(a,b,r,tone,n=8):
    a,b=Vector(a),Vector(b);d=(b-a).normalized();ref=Vector((0,0,1)) if abs(d.z)<.9 else Vector((0,1,0))
    t=d.cross(ref).normalized();v=d.cross(t)
    lo,hi=[[tuple(p+r*(cos(2*pi*i/n)*t+sin(2*pi*i/n)*v))for i in range(n)]for p in (a,b)]
    face(lo[::-1],tone);face(hi,tone)
    for i in range(n):
        k=(i+1)%n;face([lo[i],lo[k],hi[k],hi[i]],tone,soft=True)
def blend(a,b,t):
    return ''.join(f'{round(int(a[i:i+2],16)*(1-t)+int(b[i:i+2],16)*t):02x}'for i in (0,2,4))
cuts=[(i*256+2,2,i*256+248,205) for i in range(3)]
bark=(3,222,345,381);ribs=(356,222,761,381);brass=(382,398,630,499)
def turned(x,y,z,profile,shade,n=24):
    rings=[[(x+r*cos(i*2*pi/n),y+r*sin(i*2*pi/n),z+h)for i in range(n)]for h,r in profile]
    for j,(lo,hi) in enumerate(zip(rings,rings[1:])):
        for i in range(n):
            k=(i+1)%n
            face([lo[i],lo[k],hi[k],hi[i]],shade[j%len(shade)]if isinstance(shade,list) else shade,soft=True)
    face(rings[0][::-1],'675c44');face(rings[-1],'b59b66')
def meat(x,y,z,w,d,h,kind,phase):
    # An asymmetric primal cut has a broad base, shoulders, a fatty cap, a
    # marbled face, and a tapering darker rind toward the back.
    outline=[(-.45,.035),(-.50,.23),(-.45,.47),(-.40,.69),(-.27,.84),(-.11,.97),
      (.05,1),(.23,.91),(.43,.80),(.49,.60),(.50,.40),(.41,.22),(.38,.07),(.23,.02),(-.13,.014)]
    rings=[]
    for level,scale in [(0,.91),(.055,1),(.26,.97),(.68,.91),(1,.69)]:
        ring=[]
        for i,(u,v) in enumerate(outline):
            du=.029*sin(phase+1.8*i);dv=.041*cos(phase*.9+i*2)
            dx=(u+du)*w*scale+.07*level*w;dy=-d/2+level*d+v*.16*d
            angle=.41*sin(phase+.36)
            ring.append((x+dx*cos(angle)-dy*sin(angle),y+dx*sin(angle)+dy*cos(angle),z+.012+h*(v+dv)*scale))
        rings.append(ring)
    # Puckered edge of fat and a thin dark perimeter around freshly cut muscle.
    for j,(lo,hi) in enumerate(zip(rings,rings[1:])):
        for i in range(len(lo)):
            k=(i+1)%len(lo)
            if j==0:
                tint='e0bfa3' if 3<=i<=8 else 'ad7f70'
                face([lo[i],hi[i],hi[k],lo[k]],tint)
            else:
                n=len(lo);face([lo[i],hi[i],hi[k],lo[k]],'fff8e9' if kind else 'ffebdd',bark,
                    [(i/n,(j-1)/3),(i/n,j/3),((i+1)/n,j/3),((i+1)/n,(j-1)/3)],soft=True)
    face(rings[0],'ffffff',cuts[kind],[(u+.5,v)for u,v in outline])
    face(rings[-1][::-1],'b28876',bark,[(u+.5,v)for u,v in outline[::-1]])
def hanging(x,y,z,w,h,mirror=False):
    contour=[(-.35,.99),(-.15,.95),(.10,1.0),(.38,.96),(.46,.84),(.47,.56),(.40,.30),
             (.28,.12),(.11,.02),(-.08,0),(-.24,.06),(-.34,.26),(-.46,.53),(-.50,.77)]
    sign=-1 if mirror else 1
    frontpts=[(x+sign*u*w,y-.03-.04*sin(v*pi),z+v*h)for u,v in contour]
    backpts=[(px+.018,py+.105+.024*sin(i),pz)for i,(px,py,pz)in enumerate(frontpts)]
    face(frontpts,'ffffff',ribs,[(u+.5,v)for u,v in contour]);face(backpts[::-1],'a46d62',bark,[(u+.5,v)for u,v in contour[::-1]])
    for i in range(len(contour)):
        j=(i+1)%len(contour);face([frontpts[i],frontpts[j],backpts[j],backpts[i]],'d3aa96' if i%4<2 else 'b47b72',bark)
    # Pale rib ridges follow the taper of each hanging side; the irregular cut
    # edge and a short row of exposed bone distinguish them from boxed steaks.
    for j in range(8):
        v=.20+j*.082;ll=.21 if j<2 else .34;rr=.25 if j<2 else .39
        strip=[]
        for k in range(9):
            t=k/8;u=-ll+(ll+rr)*t
            q=v+.073*(t-.4)+.015*sin(t*pi)-.014*cos(j*.8)
            yy=y-.037-.04*sin(q*pi);th=(.003+.013*sin(pi*t)**.75)*h
            strip.append(((x+sign*u*w,yy,z+q*h),(x+sign*u*w,yy-.005,z+q*h+th)))
        for (a,b),(c,d) in zip(strip,strip[1:]):face([a,c,d,b],'d6b5a2' if j%3 else 'e5cdb7')
    hook=[(x+.04,y,z+h-.04),(x+.058,y,z+h+.027),(x+.04,y,z+h+.061),(x-.011,y,z+h+.079),(x-.013,y,z+h+.157),(x+.014,y,z+h+.172)]
    for a,b in zip(hook,hook[1:]):rod(a,b,.009,'bdc5bd',8)
# Same 4.4 m by 1.1 m display envelope as the existing market cabinet.
box(0,0,0,4.40,1.10,.185,'272b29');box(0,.48,.185,4.39,.115,2.365,'2e312f')
for xx in [-2.155,2.155]:
    box(xx,0,.18,.09,1.10,2.405,'252927')
box(0,.003,2.544,4.40,1.10,.105,'30312d')
for xx in [-2.147,-.704,.705,2.147]:
    box(xx,-.54,.173,.045,.052,2.392,'3f3b32')
    box(xx+.012,-.57,.18,.010,.013,2.37,'8b7d63')
for zz in [.183,2.527]:
    box(0,-.55,zz,4.36,.044,.032,'70624b')
for x in [-1.43,0,1.43]:
    box(x,.425,2.295,1.34,.033,.145,'282924')
for x,region in [(-1.43,(4,431,178,466)),(1.43,(184,431,361,466))]:front(x,.406,2.303,.95,.135,region)
for x in [-2.0,-1.06,-.31,.34,1.05,1.95]:
    box(x,.08,2.52,.138,.115,.018,'5e5e54')
    box(x,.077,2.514,.075,.065,.010,'f4e4ba')
part('Dark bronze cabinet doors, recessed lights and aging labels')
for x in [-1.43,0,1.43]:
    for zz in [.42,1.18]:
        box(x,.015,zz,1.392,.792,.035,'383a35')
        box(x,-.385,zz,1.394,.019,.032,'7b786b')
        box(x,-.379,zz-.008,1.33,.014,.009,'e6d9b7')
        for side in [-1,1]:box(x+side*.65,.25,zz-.07,.031,.25,.066,'474941')
for x in [-.68,.72]:
    rod((x+.038,-.584,1.00),(x+.038,-.584,1.31),.012,'625e52',8)
    for zz in [1.00,1.31]:rod((x+.038,-.584,zz),(x+.038,-.554,zz),.009,'8c8779',8)
part('Two low display ledges, gaskets and door pulls')
# The April operator photo shows individual cuts on brass-footed display cups.
for i,(x,y,w,h) in enumerate([(-1.38,.07,.45,.28),(-.48,.055,.59,.35),(.31,-.03,.53,.30),(1.18,.13,.48,.21)]):
    if i<3:
        turned(x,y,1.217,[(0,.17),(.018,.175),(.035,.109),(.069,.076),(.13,.062),(.18,.076),(.24,.124),(.258,.194),(.277,.205)],['a18a5d','c0a373','998055','c5ac78'])
        turned(x,y,1.49,[(0,.19),(.012,.20)],'73674f');base=1.5
    else:
        turned(x,y,1.217,[(0,.18),(.031,.19)],'625b4f');base=1.25
    meat(x,y,base,w,.38,h,i%3,2.1*i)
for i,(x,y,w,h) in enumerate([(-1.86,.12,.53,.22),(-1.10,-.03,.62,.187),(-.46,.10,.41,.235),(.19,.037,.53,.201),(.80,.14,.48,.26),(1.62,-.02,.59,.225)]):
    turned(x,y,.456,[(0,.185),(.011,.185)],'494a40',20)
    meat(x,y,.47,w,.36+.035*(i%3),h,(i+1)%3,i*.99+2.3)
part('Marbled primal cuts, dark rind and turned brass presentation stands')
for x in [-1.91,1.81]:
    rod((x-.13,.1,2.445),(x+.13,.1,2.445),.009,'989c8d')
    hanging(x,.105,1.14 if x<0 else .82,.38 if x<0 else .49,1.14 if x<0 else 1.46,x<0)
part('Bone-in hanging sides with pale rib bands and hooks')
for x0,x1 in [(-2.12,-.73),(-.677,.681),(.73,2.12)]:
    face([(x0,-.548,.214),(x1,-.548,.214),(x1,-.548,2.522),(x0,-.548,2.522)])
pane=part('Glass');glass=bpy.data.materials.new('Clear glazed cabinet doors');glass.use_nodes=True
glass.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.075
pane.data.materials.clear();pane.data.materials.append(glass)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
