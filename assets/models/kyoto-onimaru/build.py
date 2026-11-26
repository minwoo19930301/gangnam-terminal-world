"""Editable Kyoto Onimaru Gangnam cabinet and musubi."""
from math import sin,cos,pi,exp
from pathlib import Path
import random,subprocess,tempfile
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
rng=random.Random(1963)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('KyotoOnimaru')
bpy.context.scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)/'Onimaru print.png'
    subprocess.run(['node',str(here/'art.mjs'),str(path)],check=True)
    image=bpy.data.images.load(str(path));image.pack()
image.name='Onimaru print'
mat=bpy.data.materials.new('Onimaru finish');mat.use_nodes=True
nt=mat.node_tree;bsdf=nt.nodes.get('Principled BSDF')
tex=nt.nodes.new('ShaderNodeTexImage');tex.image=image
vcol=nt.nodes.new('ShaderNodeVertexColor');vcol.layer_name='Finish'
mix=nt.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
nt.links.new(tex.outputs['Color'],mix.inputs[1]);nt.links.new(vcol.outputs['Color'],mix.inputs[2])
nt.links.new(mix.outputs[0],bsdf.inputs['Base Color']);bsdf.inputs['Roughness'].default_value=.46
white=(739,473,740,474);lid=(2,2,317,192);bag=(329,2,500,207)
wood=(3,222,315,356);linen=(330,223,605,370);paper=(331,386,604,500)
marble=(2,383,317,507);iron=(518,151,754,206)
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
marble=(2,256,349,374);wood=(363,255,599,375);rice=(170,389,319,503)
nori=(2,389,157,502);crumb=(333,389,479,502);sign=(2,2,507,91)
crest=(528,2,752,122);brush=(2,101,508,171);scroll=(1,192,507,246)
box(0,.015,0,5.35,.90,.77,'ffffff',marble)
for x in [-1.98,-.66,.66,1.98]:
    box(x,-.449,.10,1.22,.035,.53,'ffffff',marble)
    for zz in [.10,.60]:box(x,-.474,zz,1.22,.04,.035,'464444')
    for side in [-1,1]:box(x+side*.60,-.47,.10,.032,.04,.53,'585453')
box(0,0,.765,5.39,.94,.065,'d7d5cb')
box(0,-.47,.78,5.34,.018,.022,'fff6db')
box(0,.015,.83,5.28,.86,.042,'ffffff',wood)
for x in [i*.033-2.62 for i in range(160)]:box(x,-.406,.874,.011,.071,.009,'655b4f')
part('Veined charcoal panelled plinth and refrigerated grille')
box(0,.398,.88,5.24,.05,.52,'e7e1cd')
for x in [-2,-.69,.64,1.96]:front(x,.369,.91,1.25,.39,brush)
part('Printed case backing')
for x in [-2.59,2.59]:
    box(x,.37,1.37,.11,.11,1.19,'302f2c')
box(0,.035,2.50,5.42,1.03,.09,'242323')
box(0,.035,2.59,5.35,.97,.42,'272625')
box(0,.035,3.01,5.43,1.02,.059,'343331')
for x in [-1.84,1.84]:
    front(x,-.455,2.64,1.45,.30,scroll,'c0b9a7')
front(0,-.456,2.625,2.13,.336,sign)
for x in [-2.60,-1.085,1.085,2.60]:
    box(x,-.45,2.60,.064,.06,.4,'3d3832')
    for z in [2.64,2.94]:rod((x,-.493,z),(x,-.506,z),.026,'9c7857',8)
for x in [i*.11-2.59 for i in range(48)]:rod((x,-.456,2.601),(x,-.469,2.601),.026,'534b3b',6)
part('Cornice, patterned inserts, bronze studs and rice crest')
# Bent glass and its curved muntins follow the silhouette of the photographed counter.
profile=[(-.474,.85),(-.474,1.15),(-.456,1.25),(-.417,1.34),(-.355,1.408),(-.269,1.453),(-.175,1.47),(.426,1.47)]
for x in [-2.66,0,2.66]:
    for (y,z),(v,h) in zip(profile,profile[1:]):rod((x,y,z),(x,v,h),.021,'bcac90',8)
for y,z in [profile[0],profile[-1]]:rod((-2.66,y,z),(2.66,y,z),.02,'bfb59e')
part('Curved bronze glass mullions')
for x0,x1 in [(-2.64,-.018),(.018,2.64)]:
    for (y,z),(v,h) in zip(profile,profile[1:]):face([(x0,y,z),(x1,y,z),(x1,v,h),(x0,v,h)],soft=True)
pane=part('Glass')
glass=bpy.data.materials.new('Curved clear glass');glass.use_nodes=True
g=glass.node_tree.nodes.get('Principled BSDF');g.inputs['Alpha'].default_value=.075
pane.data.materials.clear();pane.data.materials.append(glass)
def basket(x,y,h,r):
    # Slatted drum supports and shallow woven basket lips, without runtime instances.
    rod((x,y,.874),(x,y,.874+h),r*.74,'a77945',16)
    for i in range(16):
        a=i*pi/8
        rod((x+r*.73*cos(a),y+r*.73*sin(a),.881),(x+r*.73*cos(a),y+r*.73*sin(a),.868+h),.008,'cca675',5)
    z=.874+h;rod((x,y,z),(x,y,z+.025),r,'dec088',24)
    for row in range(3):
        for i in range(24):
            a=i*pi/12;b=(i+1)*pi/12
            rod((x+r*cos(a),y+r*sin(a),z+.023+row*.009),(x+r*cos(b),y+r*sin(b),z+.023+row*.009),.006,'c39a62' if (i+row)%2 else 'e8cb96',5)
for i,x in enumerate([-2.14,-1.48,-.85,-.22,.57,1.30,2.05]):basket(x,.105,.10+(i%3)*.065,.205)
part('Honey beech drums and shallow woven rice baskets')
def musubi(x,y,z,wrapped=True):
    outline=[(-.107,.0),(.098,0),(.113,.022),(.026,.174),(.003,.187),(-.025,.177),(-.114,.025)]
    for side in [-1,1]:
        poly=[(x+a,y+side*.066,z+b)for a,b in outline]
        face(poly if side==-1 else poly[::-1],'fffaf0',rice,[(a/.24+.5,b/.19)for a,b in outline][::1 if side==-1 else -1])
    for i,(a,b) in enumerate(outline):
        c,d=outline[(i+1)%len(outline)];face([(x+a,y-.066,z+b),(x+c,y-.066,z+d),(x+c,y+.066,z+d),(x+a,y+.066,z+b)],'ffffff',rice)
    front(x,y-.068,z+.006,.126,.085,nori)
    if wrapped:
        for side in [-1,1]:
            face([(x+side*.117,y-.075,z+.003),(x+side*.03,y-.076,z+.008),(x+side*.01,y-.076,z+.112)],'f5ead8')
        front(x,y-.078,z+.019,.045,.044,crest)
def oval_food(x,y,z,w,d,h,tone,texture=white,power=.7,tilt=0):
    # Superellipse sections give the rice mound, rolled omelet and seared meat different edges.
    rings=[]
    for k,(scale,level) in enumerate([(.79,.03),(.96,.15),(1,.48),(.91,.85),(.69,1)]):
        ring=[]
        for j in range(16):
            a=2*pi*j/16
            cub=lambda t:(1 if t>=0 else -1)*abs(t)**power
            dx=cub(cos(a))*w*.5*scale;dy=cub(sin(a))*d*.5*scale
            ring.append((x+dx,y+dy,z+h*level+tilt*dx))
        rings.append(ring)
    for lo,hi in zip(rings,rings[1:]):
        for i in range(16):
            q=(i+1)%16;face([lo[i],lo[q],hi[q],hi[i]],tone,texture,soft=True)
    for ring in [rings[0][::-1],rings[-1]]:
        face(ring,tone,texture,[(.5+(a-x)/w,.5+(b-y)/d)for a,b,c in ring])
def stacked(x,y,z,kind):
    oval_food(x,y,z,.248,.16,.077,'ffffff',rice,.58)
    oval_food(x,y,z+.067,.249,.156,.052,'f1bd52',white,.52,.023)
    for j in range(8):
        xx=x-.102+j*.028
        face([(xx-.022,y-.076,z+.112),(xx+.018,y-.084,z+.104),(xx+.025,y-.04,z+.125),(xx-.017,y-.031,z+.123)],'739044' if j%2 else '669555')
    if kind=='shrimp':
        for side in [-1,1]:
            for k in range(6):
                u=k/5
                oval_food(x+side*(.046+.023*sin(pi*u)),y-.057+k*.025,z+.113+.029*sin(pi*u),
                          .073-.024*u,.052,.062-.023*u,'ffffff',crumb,.86)
            face([(x+side*.041,y+.045,z+.142),(x+side*.063,y+.093,z+.183),(x+side*.023,y+.087,z+.155)],'cd6e39')
    else:
        oval_food(x,y,z+.112,.238,.15,.053,'b87b5d' if kind=='pork' else 'ad612e',white,.63)
        for j in range(6):
            xx=x-.08+j*.031
            rod((xx-.015,y-.041,z+.163),(xx+.009,y+.044,z+.164),.003,'74432b',5)
        front(x,y-.081,z+.009,.074,.054,nori)
for j in range(3):
    for i in range(5):
        x=-2.37+i*.91+j*.232;musubi(x,-.238,.877)
for i,x in enumerate([-2.14,-1.48,-.85,-.22,.57,1.30,2.05]):
    z=.925+.10+(i%3)*.065
    if i in [0,3]:musubi(x,.105,z,False)
    else:stacked(x,.103,z,['pork','shrimp','eel'][i%3])
for i in range(6):
    x=-2.35+i*.89
    box(x,.014,.88,.12,.037,.013,'9c8c6a');front(x,-.012,.89,.117,.121,crest,slope=.027)
part('Wrapped triangular musubi, omelet pork, glazed eel and shrimp samples')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
