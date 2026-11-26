"""Gangnam GUO griddle, takeaway packaging and fried dumpling racks."""
from math import sin,cos,pi,exp
from pathlib import Path
import random,subprocess,tempfile
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
rng=random.Random(1963)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('GuoDumpling')
bpy.context.scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)/'GUO print.png'
    subprocess.run(['node',str(here/'art.mjs'),str(path)],check=True)
    image=bpy.data.images.load(str(path));image.pack()
image.name='GUO print'
mat=bpy.data.materials.new('GUO finish');mat.use_nodes=True
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
from math import atan2
import json
sign=(2,3,489,121);paper=(502,4,763,121);gift=(3,135,333,243);band=(349,136,466,243)
wood=(482,136,761,243);pale=(2,260,223,377);toast=(238,260,468,377);herbs=(484,260,757,376)
iron=(3,393,367,504);steel=(382,393,632,504)
def horizontal_ring(x,y,z,radius,tube,tone,n=48):
    for i in range(n):
        a,b=2*pi*i/n,2*pi*(i+1)/n
        rod((x+radius*cos(a),y+radius*sin(a),z),(x+radius*cos(b),y+radius*sin(b),z),tube,tone,6)
def disc(x,y,z,r,tone,texture=white,n=48):
    face([(x+r*cos(i*2*pi/n),y+r*sin(i*2*pi/n),z)for i in range(n)],tone,texture,
         [(.5+.49*cos(i*2*pi/n),.5+.49*sin(i*2*pi/n))for i in range(n)])
def pan(x,y,z,r):
    disc(x,y,z,r,'ffffff',iron)
    for i in range(60):
        a,b=i*pi/30,(i+1)*pi/30
        def v(q,rr,h):return (x+rr*cos(q),y+rr*sin(q),z+h)
        face([v(a,r,0),v(b,r,0),v(b,r+.013,.069),v(a,r+.013,.069)],'414244',soft=True)
    horizontal_ring(x,y,z+.071,r+.012,.009,'615f60',56)
    for xx in [x-r-.013,x+r+.013]:rod((xx,y-.040,z+.033),(xx,y+.04,z+.033),.012,'625f5b')
def rack(x,y,z,w,d):
    box(x,y,z,w,d,.026,'464342')
    for i in range(19):rod((x-w*.48,y-d*.44+d*.86*i/18,z+.040),(x+w*.48,y-d*.44+d*.86*i/18,z+.040),.0035,'81807a',5)
def bun(x,y,z,r,phase):
    # Knotted pleats descend into the bulged skin before meeting the pan-browned base.
    levels=[(0,.52),(.08,.76),(.23,.92),(.53,1),(.76,.92),(.90,.64),(.965,.34),(1,.12)]
    rings=[]
    for h,size in levels:
        ring=[]
        for k in range(30):
            a=k*2*pi/30;flute=(.016+.10*h**2)*cos(10*a+phase+1.7*h)
            rr=r*size*(1+flute);ring.append((x+rr*cos(a)*1.10+.14*r*h*h*cos(phase),y+rr*sin(a)*.91+.13*r*h*h*sin(phase),z+h*r*1.31+.007*r*cos(5*a+phase)))
        rings.append(ring)
    for j,(lo,hi) in enumerate(zip(rings,rings[1:])):
        for k in range(30):
            n=(k+1)%30;a=k*2*pi/30
            light=.5+.5*cos(10*a+phase+1.7*levels[j][0])
            shade=blend('ede2cd','fffff7',.43+.49*light)
            # Scattered golden patches left by contact with the hot plate.
            toasted=j==0 or (j in (1,2) and cos(a-phase)>.72+.11*j)
            face([lo[k],lo[n],hi[n],hi[k]],shade,toast if toasted else pale,soft=True)
    face(rings[-1],'e9d0a5')
    for i in range(12):
        a=phase*.7+i*2.4;r0=r*(.17+.55*((i*17)%11)/11)
        height=.988-.096*(r0/r/.72)**1.7
        xx=x+cos(a)*r0*1.10+.14*r*height*height*cos(phase)
        yy=y+sin(a)*r0*.91+.13*r*height*height*sin(phase)
        zz=z+r*height*1.31+.0014;eye=.008*r
        face([(xx-r*.048,yy,zz),(xx,yy-r*.016,zz+eye),(xx+r*.051,yy,zz),(xx,yy+r*.024,zz)],['352f28','5c7b46','bd853b'][i%3])
def seared(x,y,z,size,rotation,tri):
    shape=[(-.92,-.65),(.91,-.68),(.13,.95)] if tri else [(-1,-.27),(-.78,-.62),(-.32,-.77),(.32,-.78),(.78,-.54),(.99,-.22),(.76,.38),(.48,.63),(.03,.71),(-.53,.58),(-.83,.29)]
    def ring(k,h):
        out=[]
        for i,(u,v) in enumerate(shape):
            dx,dy=size*k*u,size*k*v*.83
            out.append((x+dx*cos(rotation)-dy*sin(rotation),y+dx*sin(rotation)+dy*cos(rotation),z+h+.008*sin(i*3.3+rotation)))
        return out
    lo,hi,top=ring(.95,.006),ring(1,.026),ring(.84,.040)
    for a,b in [(lo,hi),(hi,top)]:
        for i in range(len(a)):
            k=(i+1)%len(a);face([a[i],a[k],b[k],b[i]],'ecddb4',herbs if tri else pale)
    face(top,'ffffff',herbs if tri else toast,[(u*.46+.5,v*.46+.5)for u,v in shape])
# Customer rack left, worktop and griddle right. The press photograph shows this same west frontage.
box(0,0,0,5.32,.90,.76,'604a3c')
for xx in [-1.99,-.67,.67,1.99]:
    box(xx,-.455,.07,1.23,.04,.60,'584a42')
    for zz in [.09,.63]:box(xx,-.479,zz,1.21,.018,.024,'aa9677')
box(0,0,.76,5.38,.94,.061,'ffffff',steel)
box(-1.50,.015,.83,2.13,.78,.06,'b68b4c')
for xx in [-2.49,-1.53,-.55]:box(xx,.016,.885,.038,.71,.369,'bc9358')
box(-1.51,.03,1.23,2.03,.73,.034,'c89d60')
box(-1.50,.372,.87,2.01,.033,.72,'ffffff',paper)
for xx in [-2.09,-1.14,-.72]:front(xx,.350,1.30,.38,.20,paper)
for xx in [-2.03,-1.01]:
    for yy,zz in [(.0,.899),(.015,1.27)]:rack(xx,yy,zz,.89,.59)
part('Bronze rack, printed back and steel cooking deck')
for level in range(2):
    for tray_i,cx in enumerate([-2.03,-1.01]):
        for row in range(2):
            for col in range(3):
                xx=cx-.26+col*.265;yy=-.13+row*.235
                seared(xx,yy,(.944 if level==0 else 1.315)+.013*(col%2),.128,.35*(col+row),tri=(level==0 and tray_i==1))
part('Racked, pan-seared semicircular and triangular dumplings')
box(1.28,.01,.822,1.02,.897,.072,'ffffff',steel);pan(1.28,-.001,.911,.411)
for row,(num,rad) in enumerate([(14,.312),(6,.205)]):
    for i in range(num):
        a=(i+.25)*2*pi/num
        if row and i<3:continue
        bun(1.28+rad*cos(a),-.001+rad*sin(a),.916,.064+(i%3)*.004,i*.7)
bun(1.27,-.01,.916,.066,.18)
part('Round black griddle with scallion flecks and pleated shengjianbao')
# Bamboo lid and its two cross straps appear immediately beside the steel griddle.
rod((.24,.028,.826),(.24,.028,.898),.338,'ccaa75',36)
disc(.24,.028,.90,.337,'fff9e7',wood)
for yy in [-.112,.166]:box(.24,yy,.901,.59,.038,.019,'b78a51')
for xx in [.085,.395]:box(xx,.028,.918,.041,.31,.049,'b2854e')
for zz in [.841,.887]:horizontal_ring(.24,.028,zz,.338,.009,'b89159',32)
# Source packaging, folded ivory card box and recessed clamshell sleeve.
box(2.13,.05,.823,.58,.28,.099,'f1e9d4',gift);box(2.13,.05,.922,.59,.286,.028,'ffffff',gift)
box(2.15,.05,.951,.55,.27,.094,'fff7e1',gift)
box(2.12,-.22,.825,.29,.193,.088,'e5dac1')
box(2.12,-.22,.914,.297,.199,.02,'f1e9d8')
box(2.12,-.22,.935,.116,.202,.002,'ffffff',band)
part('Bamboo lid, cross straps and takeaway boxes')
# Fascia and glass-screen backs are kept inside the old guide-fit footprint.
for xx in [-2.63,2.63]:box(xx,.36,.821,.08,.075,1.96,'332e28')
box(0,.03,2.60,5.37,.81,.28,'262320')
for xx in [-1.87,1.87]:
    box(xx,-.382,2.636,1.38,.018,.195,'827d72')
    for z in [2.636,2.822]:box(xx,-.395,z,1.37,.015,.012,'c3b59b')
front(0,-.382,2.62,2.02,.229,sign)
for xx in [-.48,2.61]:
    box(xx,-.398,.83,.026,.028,.91,'b29467')
box(1.07,-.397,1.733,3.11,.034,.036,'ab8b64')
part('Framed sign and glass counter rails')
# Native ink is actual open contour geometry on the transparent sneeze screen.
def printed_curve(curve,name,x,y,z,w,h):
    curve.dimensions='2D';curve.resolution_u=4
    owner=bpy.data.objects.new(name,curve);collection.objects.link(owner)
    dg=bpy.context.evaluated_depsgraph_get();ev=owner.evaluated_get(dg);m=ev.to_mesh();m.calc_loop_triangles()
    pts=[v.co.copy() for v in m.vertices]
    if pts:
        xmin,xmax=min(p.x for p in pts),max(p.x for p in pts);ymin,ymax=min(p.y for p in pts),max(p.y for p in pts)
        for tri in m.loop_triangles:face([(x+(pts[i].x-xmin)*w/(xmax-xmin),y,z+(pts[i].y-ymin)*h/(ymax-ymin)) for i in tri.vertices],'882f29')
    ev.to_mesh_clear();bpy.data.objects.remove(owner,do_unlink=True)
paths=json.loads((here/'mark.json').read_text());ink=bpy.data.curves.new('GUO shop mark','CURVE')
for ring in paths:
    if len(ring)<3:continue
    line=ink.splines.new('POLY');line.points.add(len(ring)-1)
    for pt,(xx,yy) in zip(line.points,ring):pt.co=(xx,-yy+.082*xx,0,1)
    line.use_cyclic_u=True
printed_curve(ink,'GUO ink guide',-.25,-.409,1.15,.298,.344)
def lettering(word,x,z,w,h):
    data=bpy.data.curves.new('Ink lettering','FONT');data.body=word;data.offset=.007
    data.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/AppleMyungjo.ttf')
    printed_curve(data,'Printed shop lettering',x,-.409,z,w,h)
lettering('×',.132,1.277,.08,.087);lettering('국제 중식 마스터',.37,1.402,.86,.107)
lettering('여경래 셰프',.34,1.152,1.25,.202)
part('Burgundy GUO and chef lettering printed directly on the glass')
face([(-.48,-.40,.832),(2.61,-.40,.832),(2.61,-.40,1.732),(-.48,-.40,1.732)])
for x in [-.48,2.61]:face([(x,-.4,.832),(x,.388,.832),(x,.388,1.732),(x,-.4,1.732)])
pane=part('Glass');glass=bpy.data.materials.new('Clear guard');glass.use_nodes=True
glass.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.075
pane.data.materials.clear();pane.data.materials.append(glass)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
