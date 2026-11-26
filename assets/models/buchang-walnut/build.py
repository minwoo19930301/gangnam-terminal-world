"""Editable Gangnam walnut cake counter, package, lace cabinet and open iron."""
from math import sin,cos,pi,exp
from pathlib import Path
import random,subprocess,tempfile
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
rng=random.Random(1963)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('BuchangWalnutCounter')
bpy.context.scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)/'Buchang shop print.png'
    subprocess.run(['node',str(here/'art.mjs'),str(path)],check=True)
    image=bpy.data.images.load(str(path));image.pack()
image.name='부창제과 · 포장과 판매대 마감'
mat=bpy.data.materials.new('부창제과 · 인쇄와 목재');mat.use_nodes=True
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
# Branch photograph: wood panelwork below a pale veined top and fine metal nosing.
box(0,.065,0,4.30,.91,.88,'ffffff',wood)
for x in [-1.64,-.55,.55,1.64]:
    box(x,-.396,.095,.99,.035,.675,'cfb79e',wood)
    for j in [-1,1]:box(x+j*.472,-.425,.095,.028,.027,.675,'dcc6aa',wood)
    for zz in [.096,.742]:box(x,-.425,zz,.967,.027,.026,'dcc6aa',wood)
box(0,.04,.851,4.44,.99,.085,'ffffff',marble)
box(0,-.466,.827,4.42,.016,.023,'c4ac80')
part('Walnut panelwork and pale stone')
# Framed counter-top display and a branded board stand on the left case in the
# operator's cabinet photograph. Printed packaging supplies the branch's brush lettering.
box(-1.40,.18,1.647,1.08,.060,.52,'ffffff',wood)
front(-1.40,.147,1.677,1.02,.456,lid)
box(-.69,.20,1.645,.24,.21,.28,'e9dfc6',paper)
front(-.69,.090,1.658,.225,.248,bag)
part('Framed maker card and cream branded packet')
# Tall left sample cabinet with a directly visible lace back and glass-edge reflections.
cx=-1.255
box(cx,.075,.94,1.58,.61,.055,'ffffff',wood)
box(cx,.33,.984,1.51,.032,.63,'fffbf0')
front(cx,.308,.995,1.47,.604,linen)
for xx in [cx-.772,cx+.772]:
    for yy in [-.22,.36]:box(xx,yy,.979,.039,.037,.653,'ffffff',wood)
for zz in [1.00,1.612]:
    box(cx,-.22,zz,1.58,.039,.037,'ffffff',wood)
    box(cx,.36,zz,1.58,.039,.037,'ffffff',wood)
    for xx in [cx-.772,cx+.772]:box(xx,.07,zz,.039,.56,.037,'ffffff',wood)
for xx in [cx-.748,cx+.748]:
    rod((xx,-.224,1.035),(xx,-.224,1.604),.005,'d0d7cd',6)
part('Glazed sample cabinet with crocheted backing')
def tray(x,y,z,w,d):
    box(x,y,z,w,d,.036,'cab99c')
    for side in [-1,1]:
        box(x,y+side*(d-.016)/2,z+.026,w,.016,.040,'ffffff',wood)
        box(x+side*(w-.016)/2,y,z+.026,.016,d,.040,'ffffff',wood)
def walnut(x,y,z,r,seed,flour=False,half=False):
    # Irregular shell on the cast iron's thin baked brim. The seam and toasted
    # valleys run longitudinally like the pressed walnuts in FG's product photo.
    tone0,tone1=('d3ac78','f0d7a0') if flour else ('a25628','e4a853')
    phase=seed*4.27
    def surface(u,v):
        theta=u*pi if half else u*2*pi
        ring=cos(v*pi/2)
        ridge=.54*cos(6*theta+.8*sin(v*6+phase))+.17*sin(11*theta-v*5+phase)+.22*cos(3*theta+v*8)
        groove=exp(-((sin(theta+.15*sin(v*5+phase)))/.16)**2)*max(0,sin(.09+v*pi))**.6
        rad=r*ring*(.95+.12*ridge-.19*groove)
        h=r*(.30+.91*sin(v*pi/2)+.087*ridge*(1-v)-.15*groove)
        tone=blend(tone0,tone1,min(.96,max(.06,.43+.39*ridge+.19*v-.30*groove+.07*sin(theta*13+v*16+phase))))
        return (x+rad*cos(theta),y+rad*sin(theta)*.9,z+h),tone
    cols=12 if half else 20;levels=6
    for k in range(levels):
        for j in range(cols):
            pts=[surface(a/cols,b/levels)for a,b in [(j,k),(j+1,k),(j+1,k+1),(j,k+1)]]
            face([v for v,c in pts],[c for v,c in pts],soft=True)
    n=cols
    for j in range(n):
        a=(pi if half else 2*pi)*j/n;b=(pi if half else 2*pi)*(j+1)/n
        def base(ang,scale,h):return (x+r*scale*cos(ang),y+.90*r*scale*sin(ang),z+h*r)
        face([base(a,1.06,.115),base(b,1.06,.115),base(b,1.03,.22),base(a,1.03,.22)],blend(tone0,tone1,.32))
        face([base(a,1.03,.22),base(b,1.03,.22),surface((j+1)/cols,0)[0],surface(j/cols,0)[0]],tone0)
    if half:
        outer=[surface(0,v/levels)[0]for v in range(levels+1)]+[surface(1,v/levels)[0]for v in reversed(range(levels))]
        crumb=[(a,y-.001,b)for a,_,b in outer]
        face(crumb,'e8bd72')
        # Dense sweet bean cross-section bounded by a pale ring of baked dough.
        face([(x+(a-x)*.78,y-.0025,z+.35*r+(b-z-.30*r)*.72)for a,_,b in crumb],'844d43')
for i in range(3):
    x=cx+(i-1)*.475
    tray(x,.055,1.005,.44,.36)
    for k in range(8):
        walnut(x+(k%3-1)*.107+(k//6)*.04,.004+(k//3)*.088,1.059,.053+.004*(k%2),i*10+k,i==1)
    front(x,-.213,1.023,.243,.091,(516,11,755,66) if i!=1 else (516,81,755,135),slope=.025)
    part('Wood sample tray '+str(i+1))
# Gift boxes, open drawer with wrapped pieces, printed lid, folded carrier and cord handles.
def carton(x,y,z,w,d,h,cover=False):
    box(x,y,z,w,d,h,'ede3d0',paper)
    box(x,y,z+h-.030,w+.008,d+.008,.032,'f2ebdc')
    if cover:
        face([(x-w*.47,y-d*.46,z+h+.003),(x+w*.47,y-d*.46,z+h+.003),
              (x+w*.47,y+d*.46,z+h+.003),(x-w*.47,y+d*.46,z+h+.003)],'ffffff',lid)
    front(x,y-d*.5-.0008,z+.016,w*.96,h*.59,bag)
for i in range(4):carton(-.14,.235,.939+i*.095,.49,.39,.092,i==3)
part('Cream printed gift cartons')
def wrapped_piece(x,y,z,r,seed):
    count=9;offset=.32*seed
    rings=[[(x+r*sc*(1+.12*sin(j*5+seed))*cos(j*2*pi/count+offset+rot),
               y+r*sc*(1+.08*cos(j*3+seed))*sin(j*2*pi/count+offset+rot),
               z+r*(height+.15*sin(j*4+seed)))for j in range(count)]
           for sc,height,rot in [(.74,.14,0),(1.03,.85,.20),(.78,1.55,.06),(.35,1.66,.44)]]
    for a,b in zip(rings,rings[1:]):
        for j in range(count):
            k=(j+1)%count;face([a[j],a[k],b[k],b[j]],['f3ecdf','dad4ca','e4e0d6','f8f2e9'][(j+seed)%4],paper)
    face(rings[-1],'ece7dd',paper)
    a=offset+.73
    left=(x+r*.54*cos(a-.8),y+r*.54*sin(a-.8),z+r*1.50)
    tip=(x+r*1.12*cos(a),y+r*1.12*sin(a),z+r*1.68)
    right=(x+r*.68*cos(a+.6),y+r*.68*sin(a+.6),z+r*1.19)
    ridge=(x+r*.57*cos(a),y+r*.57*sin(a),z+r*1.83)
    face([left,ridge,tip],'f7f3eb',paper);face([ridge,right,tip],'e5ded3',paper)
tray(.25,-.168,.940,.73,.44)
for row in range(2):
    for col in range(4):wrapped_piece(.005+col*.15,-.249+row*.16,1.002,.072,1+row*4+col)
part('Open drawer with individually wrapped walnuts')
# The printed lid leans against the gift stack, like the branded box fronts in the reference.
box(-.13,-.073,.955,.52,.036,.32,'ede2ca')
front(-.13,-.093,.968,.50,.292,lid)
x,y=.51,.28
bottom=[(x-.22,y-.115, .94),(x+.22,y-.115,.94),(x+.22,y+.115,.94),(x-.22,y+.115,.94)]
rim=[(x-.235,y-.102,1.55),(x+.235,y-.102,1.55),(x+.235,y+.102,1.55),(x-.235,y+.102,1.55)]
for j in range(4):
    k=(j+1)%4;face([bottom[j],bottom[k],rim[k],rim[j]],'ffffff',bag if j==0 else paper)
face(rim,'b6a990')
for dy in [-.097,.097]:
    pts=[(x+.115*cos(pi*j/14),y+dy,1.535+.14*sin(pi*j/14))for j in range(15)]
    for a,b in zip(pts,pts[1:]):rod(a,b,.007,'977b52',6)
part('Printed lid and cord-handled paper carrier')
# The curved guard ends at the forward lip, matching the right-hand case in the Gangnam press photo.
for xx in [.86,2.035]:
    path=[(xx,-.33,.949),(xx,-.33,1.203)]+[(xx,-.11-.22*cos(t*pi/2/10),1.20+.21*sin(t*pi/2/10))for t in range(1,11)]+[(xx,.30,1.41)]
    for a,b in zip(path,path[1:]):rod(a,b,.011,'b1a890',8)
rod((.86,-.109,1.41),(2.035,-.109,1.41),.008,'d2d8cb',6)
box(1.45,.0,.948,1.14,.58,.036,'f6ecd8',marble)
part('Curved customer-side guard and stone pastry deck')
box(1.44,.035,.983,.98,.435,.065,'ffffff',iron)
for side in [-1,1]:box(1.44+side*.477,.035,1.042,.019,.427,.025,'68665d')
for row in range(2):
    for j in range(6):
        wx=1.046+j*.154;wy=-.075+row*.192
        # Dark oiled well and bevel of its collar remain visible after a cake is lifted.
        for k in range(20):
            lo,hi=2*pi*k/20,2*pi*(k+1)/20
            def ring(a,r,h):return (wx+r*cos(a),wy+.91*r*sin(a),1.049+h)
            face([ring(lo,.071,.002),ring(hi,.071,.002),ring(hi,.058,.004),ring(lo,.058,.004)],'69645a')
            face([ring(lo,.058,.004),ring(hi,.058,.004),ring(hi,.048,.001),ring(lo,.048,.001)],'393837')
            if (row,j) in [(0,4),(0,5),(1,5)]:
                face([ring(lo,.048,.001),ring(hi,.048,.001),(wx,wy,1.050)],'252522')
        if (row,j) not in [(0,4),(0,5),(1,5)]:
            walnut(wx,wy,1.052,.061,32+row*6+j)
for xx in [.987,1.893]:
    rod((xx,-.177,1.039),(xx,-.177,.978),.018,'423d35')
    rod((xx-.018,-.177,1.037),(xx+.018,-.177,1.037),.013,'a7a299')
rod((.988,-.175,.981),(.988,-.273,.981),.013,'373330')
rod((.988,-.265,.981),(.988,-.334,.981),.019,'262524')
part('Cast iron, open browned wells and freshly baked walnut shells')
tray(.83,-.266,.983,.34,.21)
for j in range(8):
    a=2*pi*j/8;b=2*pi*(j+1)/8
    face([(.801,-.278,1.031),(.801+.151*cos(a),-.278+.082*sin(a),1.031+.014*(j%3)),
          (.801+.151*cos(b),-.278+.082*sin(b),1.031+.014*((j+1)%3))],'f7f1e5',paper)
walnut(.801,-.278,1.043,.090,4,half=True)
part('Cut walnut with bean filling')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
