"""Editable Gangnam spring roll cold counter, lidded boxes and cut fillings."""
from math import sin,cos,pi,exp
from pathlib import Path
import random,subprocess,tempfile
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
rng=random.Random(1963)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('BlueButterfly')
bpy.context.scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)/'Spring roll print.png'
    subprocess.run(['node',str(here/'art.mjs'),str(path)],check=True)
    image=bpy.data.images.load(str(path));image.pack()
image.name='Spring roll print'
mat=bpy.data.materials.new('Spring roll finish');mat.use_nodes=True
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
oak=(2,284,326,375);walnut=(344,284,759,375);logo=(2,2,458,98);menu=(2,113,760,264);wing=(464,2,762,98)
skins=[(i*165+2,393,i*165+153,503) for i in range(4)]
# Approximate the branch's built-in counter within the original solids.
box(0,.0,0,2.45,.90,.72,'ffffff',walnut)
for x in [-.79,0,.79]:
    box(x,-.456,.085,.72,.026,.56,'ffffff',walnut)
    for zz in [.095,.607]:box(x,-.478,zz,.705,.016,.022,'ba9b70')
    for side in [-1,1]:box(x+side*.343,-.478,.10,.019,.016,.52,'ba9b70')
box(0,-.008,.72,2.48,.92,.057,'464541');box(0,-.01,.778,2.43,.90,.043,'c2c0b9')
for i in range(81):box(-1.19+i*.0295,-.378,.819,.007,.092,.006,'737472')
box(0,.015,.835,2.37,.59,.039,'ffffff',oak)
box(0,.062,1.059,2.35,.52,.023,'cccebf')
box(0,.061,1.089,2.35,.51,.023,'e4ddc9')
box(0,.01,1.403,2.47,.85,.040,'aaaba6')
for x in [-1.21,1.21]:
    for y in [-.405,.411]:rod((x,y,.812),(x,y,1.404),.009,'9eaaa7')
part('Walnut inset panels, steel deck and two chilled shelves')
# The photograph shows blue swallowtail-shaped board clips, a separate blue shop
# nameplate and a white board depicting different spring rolls above this case.
for x in [-.91,-.53]:rod((x,.22,1.445),(x,.22,1.858),.007,'535c95',8)
box(-.72,.218,1.855,.56,.021,.133,'515c9c');front(-.72,.205,1.860,.549,.121,logo)
for x in [-.93,-.515]:
    for k in [-1,1]:
        face([(x,.201,1.765),(x+k*.051,.201,1.804),(x+k*.056,.201,1.779),(x+k*.018,.201,1.750),(x+k*.042,.201,1.742),(x+k*.028,.201,1.726)],'6375b5')
box(.074,.22,1.435,.83,.028,.326,'e9e5da');front(.074,.203,1.439,.823,.318,menu)
part('Cobalt butterfly rack and illustrated Spring Roll board')
def rounded_roll(x,y,z,w,length,kind):
    # Cylindrical translucent rice skin, closed rounded rear, exposed cut end at the front.
    rings=[]
    for fraction,size in [(0,.86),(.065,.97),(.18,1),(.73,1),(.91,.94),(1,.70)]:
        ring=[]
        for j in range(16):
            a=2*pi*j/16;ring.append((x+w*.5*size*cos(a),y+length*fraction,z+w*.45*(1+size*sin(a))))
        rings.append(ring)
    for j,(lo,hi) in enumerate(zip(rings,rings[1:])):
        for i in range(16):
            q=(i+1)%16
            face([lo[i],hi[i],hi[q],lo[q]],'ffffff',skins[kind],[(j/5,i/16),((j+1)/5,i/16),((j+1)/5,(i+1)/16),(j/5,(i+1)/16)],True)
    face(rings[-1][::-1],'d8d9c0')
    cap=rings[0];face(cap,'e6e1c7')
    # Small edible ingredients are actual coloured cut surfaces, not rectangular cubes.
    rng2=random.Random(kind*19+7);cz=z+w*.45
    for k in range(23):
        a=rng2.random()*2*pi;r=rng2.random()**.55
        cx=x+cos(a)*r*w*.337;h=cz+sin(a)*r*w*.31;rx=w*(.026+.037*rng2.random());rz=w*.036
        tone=['d7dbbd','e5e0ca','79a778','93b675','eee5cd','ebbc81'][k%6]
        face([(cx+rx*cos(i*pi/3),y-.0007,h+rz*sin(i*pi/3)) for i in range(6)],tone)
    for side in [-1,1]:
        cx=x+side*.107*w
        face([(cx+.105*w*cos(i*pi/5),y-.0012,cz+.115*w*sin(i*pi/5))for i in range(10)],['e8987b','e99576','a8815c','d88776'][kind])
def tray(x,y,z,w,d,shade):
    box(x,y,z,w,d,.014,shade)
    for side in [-1,1]:
        box(x+side*(w-.011)/2,y,z+.014,.011,d,.034,shade)
        box(x,y+side*(d-.011)/2,z+.014,w,.011,.033,shade)
for k,x in enumerate([-.92,-.46,0,.46,.92]):
    tray(x,.002,1.113,.426,.352,'b78862')
    box(x,-.016,1.127,.384,.279,.021,'f6f0df')
    for row in range(2):
        for side in [-1,1]:rounded_roll(x+side*.085,-.137+row*.135,1.147,.120,.119,(k+row)%4)
    front(x,-.179,1.135,.113,.032,wing)
for k,x in enumerate([-.82,-.29,.28,.83]):
    tray(x,-.10,.878,.414,.267,'353637')
    for side in [-1,1]:rounded_roll(x+side*.077,-.22,.903,.10,.133,(k+1)%4)
    box(x+.123,-.034,.898,.103,.081,.025,'e6d8b6')
part('Cut rice paper rolls, clear-wrap fillings, chilled wooden trays and takeaway packs')
def arc_hood(x):
    # Small clear rounded lids on wooden trays; all join the same transparent draw as the main glass.
    path=[(-.175,1.152),(-.175,1.226),(-.162,1.252),(-.130,1.270),(.122,1.270),(.161,1.253),(.174,1.223),(.174,1.153)]
    for (y,z),(v,h) in zip(path,path[1:]):
        face([(x-.202,y,z),(x+.202,y,z),(x+.202,v,h),(x-.202,v,h)],soft=True)
for x in [-.92,-.46,0,.46,.92]:arc_hood(x)
face([(-1.216,-.408,.82),(1.216,-.408,.82),(1.216,-.408,1.399),(-1.216,-.408,1.399)])
for x in [-1.216,1.216]:face([(x,-.405,.82),(x,.409,.82),(x,.409,1.399),(x,-.405,1.399)])
pane=part('Glass');glass=bpy.data.materials.new('Glass cabinet and cloches');glass.use_nodes=True
glass.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.075
pane.data.materials.clear();pane.data.materials.append(glass)
# A narrow blue bowl with green fruit and a small mortar are visible at the right end.
def turned(x,y,z,rings,shade,n=20):
    profiles=[[(x+r*cos(2*pi*i/n),y+r*sin(2*pi*i/n),z+h) for i in range(n)] for h,r in rings]
    for a,b in zip(profiles,profiles[1:]):
        for i in range(n):j=(i+1)%n;face([a[i],a[j],b[j],b[i]],shade,soft=True)
turned(.74,.20,1.445,[(0,.052),(.018,.072),(.072,.127),(.078,.125),(.067,.116),(.022,.055)],'6a8495')
for i in range(4):
    x=.74+.051*cos(i*2.3);y=.20+.046*sin(i*2.3);turned(x,y,1.491,[(0,.022),(.022,.049),(.051,.047),(.076,.029),(.083,.003)],['78854d','627449','989b61','75894d'][i],12)
turned(1.008,-.18,.876,[(0,.053),(.018,.059),(.11,.10),(.118,.094),(.103,.083),(.053,.033)],'785b4c')
rod((1.00,-.18,.937),(.959,-.15,1.066),.018,'ab8562')
part('Blue fruit bowl and counter mortar')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
