"""Editable grocery display with fresh Tartuflanghe truffles, red counter stone and chilled shelf."""
from math import sin,cos,pi,exp
from pathlib import Path
import random,subprocess,tempfile
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
rng=random.Random(1963)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('TruffleMarketCase')
bpy.context.scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)/'Truffle print.png'
    subprocess.run(['node',str(here/'art.mjs'),str(path)],check=True)
    image=bpy.data.images.load(str(path));image.pack()
image.name='Truffle print'
mat=bpy.data.materials.new('Truffle counter finish');mat.use_nodes=True
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
def profile(x,y,z,levels,paint,n=24):
    rings=[[(x+r*cos(i*2*pi/n),y+r*sin(i*2*pi/n),z+h)for i in range(n)]for h,r in levels]
    for j,(lo,hi) in enumerate(zip(rings,rings[1:])):
        for i in range(n):
            q=(i+1)%n;shade=paint(j,i,n) if callable(paint) else paint
            face([lo[i],lo[q],hi[q],hi[i]],[paint(j,i,n),paint(j,q,n),paint(j+1,q,n),paint(j+1,i,n)] if callable(paint) else shade,soft=True)
    face(rings[-1],paint(len(levels)-1,0,n)if callable(paint)else paint)
stone=(2,2,391,191);skin=(412,2,751,185);cream=(3,209,192,316);chips=(208,210,366,315)
blue=(383,209,549,315);oil=(565,210,746,315);timber=(8,340,192,490);tablet=(214,342,390,487);label=(413,341,511,484)
# A single existing 2.55m timber grocery bay, built with a shallow fridge on the right.
box(0,.294,.12,2.53,.07,2.74,'ffffff',timber)
for side in [-1,1]:
    box(side*1.20,.016,.12,.135,.61,2.82,'ffffff',timber)
    for i in range(4):
        box(side*1.20-.049+i*.033,-.30,.12,.013,.021,2.80,'987541')
box(0,0,.12,2.25,.60,.70,'ffffff',timber)
box(0,-.01,.82,2.37,.65,.068,'ffffff',stone)
box(0,-.327,.735,2.34,.023,.091,'ffffff',stone)
for z in [1.94,2.41,2.84]:
    box(0,.04,z,2.27,.48,.048,'76624b')
    box(0,-.212,z+.002,2.27,.038,.066,'453e35')
    box(0,-.231,z+.044,2.23,.008,.008,'d4b98c')
for z in [1.30,1.64]:
    box(-.656,.045,z,.95,.48,.049,'624e3e')
    box(-.656,-.211,z,.95,.035,.058,'3d3931')
    box(-.656,-.17,z-.017,.88,.022,.016,'fde8b9')
part('Walnut grocery bay and veined red stone worktop')
# Front-open refrigerator. Source picture has the glass door open toward the right.
cx=.56;floor=.892;width=.94;height=1.001
box(cx,.02,floor,width,.53,.055,'3d4140')
box(cx,.258,floor+.055,width,.040,height-.10,'aebbc4')
face([(cx-.42,.236,.96),(cx+.42,.236,.96),(cx+.42,.236,1.84),(cx-.42,.236,1.84)],
     ['c5cdd0','d0d9df','96b5d0','8aaac6'])
for dx in [-.457,.457]:
    box(cx+dx,.013,floor+.052,.04,.52,height-.053,'b9c4ca')
    box(cx+dx,-.246,floor+.024,.043,.031,height-.018,'575b5d')
box(cx,.012,floor+height-.033,width,.54,.048,'565b5c')
for z,d in [(.958,.44),(1.425,.41)]:
    box(cx,.015,z,.865,d,.019,'c8dbe2')
    box(cx,-d/2+.012,z-.012,.856,.018,.021,'8aa3b7')
box(cx,.045,1.839,.365,.17,.021,'94d9eb')
box(cx,.027,1.83,.268,.072,.016,'acfcff')
# Keep the opened door wholly inside the display width/depth; approximate opening angle.
hinge=1.013;end=(1.20,-.32)
for z in [floor+.068,floor+height-.076]:
    rod((hinge,-.218,z),(*end,z),.017,'505354',8)
rod((*end,floor+.068),(*end,floor+height-.076),.018,'555657',8)
part('Compact blue-lit truffle refrigerator and open door frame')
def truffle(x,y,z,size,seed):
    n,rings=16,10;rand=random.Random(seed);p,q,stretch=rand.random()*6,rand.random()*6,.80+.28*rand.random()
    def point(j,i):
        theta=i*2*pi/n;lat=-pi/2+j*pi/rings;cc=cos(lat)
        ripple=1+.095*sin(3*theta+p)*cc+.065*cos(2*theta+q+3*lat)*cc+.055*sin(5*lat+p)
        rr=size*ripple
        return(x+rr*cc*cos(theta),y+rr*cc*sin(theta)*stretch,z+rr*sin(lat)*.85)
    for j in range(rings):
        for i in range(n):
            k=i+1
            poly=[point(j,i),point(j,k),point(j+1,k),point(j+1,i)]
            coords=[(i/n,j/rings),(k/n,j/rings),(k/n,(j+1)/rings),(i/n,(j+1)/rings)]
            if j==0:poly.pop(1);coords.pop(1)
            if j==rings-1:poly.pop(2);coords.pop(2)
            face(poly,'ffffff',skin,coords,True)
for i,x in enumerate([.32,.765]):
    box(x,-.059,.986,.395,.29,.030,'b58a52')
    for side in [-1,1]:
        box(x+side*.190,-.058,1.006,.023,.29,.040,'ba945e')
        box(x,-.058+side*.137,1.006,.38,.021,.040,'c8a26d')
    for j,(dx,dy,s) in enumerate([(-.080,-.058,.068),(.060,-.063,.062),(-.102,.048,.060),(.05,.04,.067),(0,.001,.051)]):
        truffle(x+dx,-.051+dy,1.051+(j==4)*.064,s,46+i*7+j)
    part('Oak tray of knobbly fresh black truffles '+str(i+1))
for i,cx in enumerate([.284,.555,.813]):
    truffle(cx,-.04,1.502,.070,514+i)
    # The public photo shows a transparent pouch: the fruit remains visible,
    # while the sealed edges and folded film carry cold reflected streaks.
    y=-.125;L=cx-.117;R=cx+.117
    pts=[(L+.017,y,1.445),(R-.02,y-.01,1.445),(R,y+.03,1.69),(L,y+.024,1.697)]
    for j in range(4):rod(pts[j],pts[(j+1)%4],.003,'d1e3ee',5)
    rod((L+.007,y+.01,1.468),(cx-.051,y,1.488),.002,'b8d1dc',5)
    front(cx+.025,y+.013,1.622,.128,.052,label,'ffffff',.005)
    part('Labelled individual fresh truffle pouch '+str(i+1))
def package(x,y,z,w,h,region):
    box(x,y,z,w,.115,h,'f2eddc')
    front(x,y-.058,z+.002,w-.004,h-.004,region)
for i in range(10):
    x=-1.00+i*.217;kind=chips if i>3 else blue
    w=.189;z=2.465;h=.28 if i<4 else .34;midpoint=.11;d=.118
    # Flexible snack pouches with a crimped top seam and pinched shoulders.
    lookup=[(w*.84,0,.014),(w,h*.12,0),(w*.94,h*.72,.003),(w*.79,h*.92,.013),(w*.89,h,.022)]
    for j in range(len(lookup)-1):
        a,az,ay=lookup[j];b,bz,by=lookup[j+1]
        face([(x-a/2,midpoint-d/2+ay,z+az),(x+a/2,midpoint-d/2+ay,z+az),
              (x+b/2,midpoint-d/2+by,z+bz),(x-b/2,midpoint-d/2+by,z+bz)],'ffffff',kind,
             [(0,az/h),(1,az/h),(1,bz/h),(0,bz/h)])
        for side in [-1,1]:
            face([(x+side*a/2,midpoint-d/2+ay,z+az),(x+side*a/2,midpoint+d/2-ay,z+az),
                  (x+side*b/2,midpoint+d/2-by,z+bz),(x+side*b/2,midpoint-d/2+by,z+bz)],'b7b5d3' if i<4 else'e1dbc1')
    box(x,midpoint,z+h,w*.91,.082,.016,'c3b7a1' if i>3 else 'a3a3c2')
part('Blue TRIFULÒT boxes and cream snack bags')
for i in range(9):
    x=-.98+i*.238
    if i%3==2:
        profile(x,.015,1.995,[(0,.048),(.025,.072),(.105,.070),(.115,.062)],'a48850')
        front(x,-.058,2.014,.104,.072,cream)
        profile(x,.015,2.103,[(0,.071),(.015,.072),(.024,.063)],'b4a16b')
    else:
        package(x,.045,1.99,.197,.15,cream)
        if i in [0,3,7]:package(x,.04,2.14,.189,.14,cream)
part('Truffle jars, boxed sauces and cream packaging')
for i in range(4):
    x=-1.0+i*.235;package(x,.102,1.354,.190,.202,cream)
    package(x,.105,1.696,.183,.183,cream)
for i in range(3):
    x=-.96+i*.306
    profile(x,-.122,1.355,[(0,.049),(.013,.059),(.131,.058),(.15,.026),(.194,.018)],'edcf60',20)
    profile(x,-.122,1.543,[(0,.023),(.038,.023)],'a48a51')
    front(x,-.182,1.383,.072,.082,oil)
    profile(x,-.122,1.349,[(0,.091),(.008,.093)],'ead7ad')
part('Golden oil bottles in front of printed cartons')
box(-.62,-.11,.893,.23,.16,.016,'aaa8a1')
rod((-.62,-.10,.901),(-.62,-.03,1.057),.022,'aaa8a1')
box(-.62,-.037,1.019,.38,.030,.236,'393b3b')
front(-.62,-.056,1.032,.347,.205,tablet,'ffffff',.004)
part('Counter tablet and alloy pedestal')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
