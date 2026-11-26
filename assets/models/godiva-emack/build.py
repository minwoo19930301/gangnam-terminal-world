"""Emack and Godiva Gangnam service counters and their open bronze canopy."""
from math import sin,cos,pi,exp
from pathlib import Path
import random,subprocess,tempfile
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
rng=random.Random(1963)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('GangnamCrepeAndWaffle')
bpy.context.scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)/'Crepe and waffle print.png'
    subprocess.run(['node',str(here/'art.mjs'),str(path)],check=True)
    image=bpy.data.images.load(str(path));image.pack()
image.name='Crepe and waffle print'
mat=bpy.data.materials.new('Crepe and waffle finish');mat.use_nodes=True
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
emack=(2,3,371,95);godiva=(386,3,758,95);sleeve=(2,110,256,229);menu=(274,110,620,230)
paper=(634,111,758,228);stone=(3,248,258,365);crepe=(273,248,490,364)
filigree=(504,248,758,365);griddle=(3,383,300,502);waffle=(315,383,591,501)
def turned(x,y,z,rings,tone,n=24):
    profiles=[[(x+r*cos(2*pi*i/n),y+r*sin(2*pi*i/n),z+h)for i in range(n)]for h,r in rings]
    for j,(a,b) in enumerate(zip(profiles,profiles[1:])):
        for i in range(n):
            k=(i+1)%n
            color=tone(j,i,n) if callable(tone) else tone
            face([a[i],a[k],b[k],b[i]],color,soft=True)
    if profiles[0][0]!=profiles[-1][0]:face(profiles[-1],tone(len(rings)-1,0,n) if callable(tone) else tone)
def chrome(x,y,z,r):
    # The shop uses covered pozzetti. The mirrored lids reflect the broad lamps
    # overhead; bands baked into the radial profiles retain that read at low GPU settings.
    profile=[(0,.93),(.010,1),(.019,1.03),(.031,.98),(.035,.91),(.052,.77),(.073,.48),(.070,.38),(.054,.26),(.057,.16)]
    tones=['575c5d','979d9b','dbdcd5','8c9392','c1c5bd','b3b9b5','babeb8','848b8a','b8bfb8','8b9291']
    def paint(j,i,n):
        a=i*2*pi/n;shine=.5+.5*cos(3*a+.43*j+.6);blendto='fff9e5' if shine>.53 else '555f62'
        return blend(tones[j%len(tones)],blendto,abs(shine-.5)*1.25)
    turned(x,y,z,[(h,r*s)for h,s in profile],paint,36)
    turned(x,y,z+.055,[(0,r*.13),(.023,r*.14),(.030,r*.19),(.041,r*.19),(.044,r*.13)],paint,18)
def cap(x,y,z,r,region,shade='ffffff'):
    n=48;face([(x+r*cos(i*2*pi/n),y+r*sin(i*2*pi/n),z)for i in range(n)],shade,region,[(.5+.495*cos(i*2*pi/n),.5+.495*sin(i*2*pi/n))for i in range(n)])
# Black vertical rectangular tiles and the polished, pale-veined stone nosing are visible on both sides.
box(0,0,0,4.78,.946,.810,'292927')
for j in range(2):
    for i in range(28):
        x=-2.305+i*.171;box(x,-.475,.045+j*.361,.163,.018,.352,['353633','393936','302f2d','3a3a36'][(i*13+j)%4])
box(0,-.005,.799,4.84,.99,.081,'ffffff',stone)
box(0,-.501,.801,4.81,.019,.030,'6f6a5e')
part('Gloss black tile and veined stone counter')
# Far enough back from the serving counter to leave both short public ends open.
for x in [-2.62,2.62]:
    for y in [-.678,2.19]:box(x,y,.87,.060,.064,1.74,'42372f')
# Four perimeter beams leave the centre open to the existing illuminated retail ceiling.
for y in [-.68,2.19]:
    box(0,y,2.55,5.34,.12,.43,'48392d')
    for z in [2.55,2.94]:box(0,y-.004,z,5.40,.15,.043,'8c7454')
for x in [-2.62,2.62]:
    box(x,.755,2.55,.13,2.80,.43,'48392d')
    for z in [2.55,2.94]:box(x,.755,z,.16,2.85,.04,'8c7454')
for x in [-2.33,0,2.33]:
    front(x,-.744,2.635,.45,.24,filigree)
for x in [-1.23,1.22]:
    box(x,-.746,2.595,1.75,.022,.32,'44382e')
    front(x,-.761,2.605,1.73,.30,emack if x<0 else godiva)
for x in [-2.57,-2.13,-.32,.32,2.13,2.57]:
    for z in [2.61,2.917]:rod((x,-.748,z),(x,-.77,z),.025,'b89b68',10)
part('Open bronze sign frame, lit branch wordmarks and patterned inserts')
box(-1.17,.058,.880,2.16,.75,.069,'b5b9b4')
for row in range(2):
    for k in range(5):
        x=-2.035+k*.421;y=-.099+row*.313
        turned(x,y,.947,[(0,.143),(.006,.148),(.012,.147)],'4e524f',28)
        chrome(x,y,.957,.139)
for i in range(5):
    x=-2.02+i*.418;box(x,-.348,.882,.194,.052,.126,'986f52');front(x,-.377,.896,.17,.095,paper)
part('Two rows of closed steel ice cream wells, knobs and wooden flavour cards')
def lattice_cup(x,y,z):
    # Crossed baked waffle strands remain genuinely open along the irregular upper rim.
    def surface(a,t):
        top=.130+.019*sin(7*a+.4)+.008*sin(13*a)
        radius=.046+.066*t+.008*t*t*sin(7*a+.4)
        return (x+radius*cos(a),y+radius*sin(a),z+.044*t+top*t*t)
    for direction in [-1,1]:
        for i in range(16):
            a=i*2*pi/16
            for k in range(7):
                t=k/7;v=(k+1)/7;aa=a+direction*.96*t;bb=a+direction*.96*v
                rod(surface(aa,t),surface(bb,v),.0067+.0013*sin(i+.9*k),['c99251','d7a66b','ae7240'][(i+k)%3],5)
    for i in range(32):
        a=i*pi/16;b=(i+1)*pi/16;upper=.48+.15*sin(a*7+.3)
        face([surface(a,.14),surface(b,.14),surface(b,upper),surface(a,upper)],'fff0cc',waffle,
             [(i/32,0),((i+1)/32,0),((i+1)/32,1),(i/32,1)])
    turned(x,y,z-.015,[(0,.044),(.007,.048),(.074,.072),(.079,.074)],'e3c9a0')
    for i in range(6):
        a=i*2*pi/6
        turned(x+.031*cos(a),y+.027*sin(a),z+.105,[(0,.035),(.017,.043),(.047,.035),(.065,.014)],'edd2a0',14)
    turned(x,y,z+.11,[(0,.066),(.03,.078),(.055,.074),(.085,.050),(.093,.013)],'efd3a1',24)
    for i in range(63):
        a=2.39996*i;rr=.069*(i/63)**.55
        xx=x+rr*cos(a);yy=y+rr*sin(a)
        hh=.093 if rr<.013 else (.093-(rr-.013)*.008/.037 if rr<.05 else .085-(rr-.05)*.030/.024)
        zz=z+.110+hh+.002
        tone=['e6785c','eab73e','e9dfca','8eaa6a','d78696'][i%5]
        if i%8==0:
            w=.019+.004*(i%3);box(xx,yy,zz,w,.89*w,.84*w,['fff0d8','eddda5','eea991'][i%3])
        elif i%9==0:turned(xx,yy,zz,[(0,.007),(.009,.012),(.021,.009),(.024,.005)],['d84234','e68d26'][i%2],8)
        else:turned(xx,yy,zz,[(0,.0048),(.004,.0061),(.009,.0025)],tone,8)
    for side in [-1,1]:
        xx=x+side*.075;yy=y+.027
        rod((x+side*.023,y+.020,z+.172),(xx,yy,z+.308),.0062,'b53983',8)
        turned(xx,yy,z+.306,[(0,.008),(.009,.013),(.027,.013),(.04,.007)],'c44a94',12)
lattice_cup(-.36,-.24,.888)
part('Hand-baked lattice waffle cup with vanilla scoop, candy and plum spoon')
# The live crepe surface in the store photo is a large round dark disk on
# a stainless base. Thin cocoa batter, nibs and a wooden T-spreader sit on the disk.
box(1.08,.07,.885,.76,.70,.10,'b4b8b3')
turned(1.08,.07,.985,[(0,.307),(.016,.326),(.044,.329),(.052,.320)],'464442',48)
cap(1.08,.07,1.038,.319,griddle)
cap(1.08,.07,1.040,.295,crepe,'e4cbb7')
for j in range(9):
    radius=.051+j*.027;start=j*.73
    for k in range(19):
        a=start+k*.073;b=a+.073
        def arc(q,rad):return (1.08+rad*cos(q),.07+rad*sin(q),1.041)
        face([arc(a,radius),arc(b,radius),arc(b,radius+.0018),arc(a,radius+.0018)],'ab795c' if j%2 else '93705b')
for i in range(120):
    a=i*2.40;r=.230*(i/120)**.62
    xx=1.08+r*cos(a);yy=.07+r*sin(a);w=.003+rng.random()*.005
    face([(xx-w,yy-w,1.042),(xx+w,yy-.4*w,1.044),(xx+.45*w,yy+w,1.046)],['503328','634035','774c38'][i%3])
rod((.938,.120,1.052),(1.20,.26,1.10),.009,'bc976b',8)
rod((.898,.183,1.051),(.985,.054,1.051),.011,'c3a177',8)
for i in range(4):
    x=1.67+.122*i;turned(x,.238,.884,[(0,.048),(.09,.049),(.117,.046),(.123,.036)],['745e4e','655343','54483d','8d7256'][i])
box(.342,.239,.888,.56,.04,.40,'50483e');front(.342,.214,.90,.544,.376,menu)
part('Cocoa crepe griddle, chocolate pieces, T-spreader and actual menu layout')
def folded_crepe(x,y,z,banana):
    # Several thin warm folds widen into a fan above the branded paper sleeve.
    for j in range(3):
        r=.260+j*.008;center=(x,y+j*.008,z)
        curve=[]
        for i in range(19):
            a=(-.59+1.18*i/18);curve.append((x+r*sin(a),y+j*.008+.012*cos(i*.69+j),z+r*cos(a)+.008*sin(i*.7+j)))
        poly=[center]+curve;uvs=[(.5,.02)]+[(.5+(xx-x)/.36,(zz-z)/.32)for xx,_,zz in curve]
        face(poly,'ffffff' if j else 'f2dcc2',crepe,uvs)
        for i in range(18):
            a,b=curve[i],curve[i+1];face([a,b,(b[0],b[1]+.008,b[2]-.004),(a[0],a[1]+.008,a[2]-.004)],'bc8c68')
    pts=[(x-.021,y-.012,z-.021),(x+.021,y-.012,z-.021),(x+.115,y-.014,z+.163),(x-.115,y-.014,z+.163)]
    face(pts,'ffffff',sleeve,[(.42,0),(.58,0),(1,1),(0,1)])
    if banana:
        for k in range(7):
            xx=x-.09+k*.03;zz=z+.259-.025*((k-3)/3)**2
            turned(xx,y+.010,zz,[(0,.018),(.007,.024),(.010,.016)],['e6c483','caa66a','dab980'][k%3],12)
# One finished order rests beside its window, with a small support beneath the paper.
box(1.92,-.185,.885,.34,.17,.018,'b4b1a5')
for xx in [1.85,1.99]:rod((xx,-.120,.89),(xx,-.166,.98),.006,'bab7a4',6)
folded_crepe(1.92,-.19,.916,True)
part('Mint paper sleeve, thin folded cocoa crepe and brûléed banana')
for xx in [.01,2.36]:
    box(xx,-.411,.88,.024,.027,.57,'9a907d')
box(1.19,-.411,1.44,2.38,.029,.021,'a9a392')
box(1.19,-.414,.881,2.36,.018,.108,'acaaa3')
box(1.19,-.426,.882,2.36,.013,.017,'bea271')
part('Kitchen window mullions')
face([(.022,-.409,.888),(2.348,-.409,.888),(2.348,-.409,1.44),(.022,-.409,1.44)])
face([(2.356,-.404,.888),(2.356,.406,.888),(2.356,.406,1.44),(2.356,-.404,1.44)])
# Low service-side guard around the ice cream wells, leaving their lids visible.
face([(-2.36,-.411,.886),(-.025,-.411,.886),(-.025,-.411,1.259),(-2.36,-.411,1.259)])
pane=part('Glass');glass=bpy.data.materials.new('Kitchen window and ice cream guard');glass.use_nodes=True
glass.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.075
pane.data.materials.clear();pane.data.materials.append(glass)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
