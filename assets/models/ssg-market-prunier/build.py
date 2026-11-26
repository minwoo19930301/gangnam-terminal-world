"""Editable Caviar Prunier grocery cabinet, silver service, chilled roe and tins."""
from math import sin,cos,pi,exp
from pathlib import Path
import random,subprocess,tempfile
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
rng=random.Random(1963)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('PrunierMarketCase')
bpy.context.scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)/'Prunier print.png'
    subprocess.run(['node',str(here/'art.mjs'),str(path)],check=True)
    image=bpy.data.images.load(str(path));image.pack()
image.name='Prunier print'
mat=bpy.data.materials.new('Prunier finish');mat.use_nodes=True
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
tins=[(i*177+3,3,i*177+172,171)for i in range(3)]
mosaic=(537,3,758,170);header=(3,182,759,257);wood=(3,273,343,376)
roe=(361,273,558,376);roe_label=(575,275,759,374);felt=(3,392,255,501);metal=(275,391,457,501);card=(474,391,624,501)
def profile(x,y,z,levels,paint,n=24):
    rings=[[(x+r*cos(i*2*pi/n),y+r*sin(i*2*pi/n),z+h)for i in range(n)]for h,r in levels]
    for j,(lo,hi) in enumerate(zip(rings,rings[1:])):
        for i in range(n):
            q=(i+1)%n;shade=paint(j,i,n) if callable(paint) else paint
            face([lo[i],lo[q],hi[q],hi[i]],[paint(j,i,n),paint(j,q,n),paint(j+1,q,n),paint(j+1,i,n)] if callable(paint) else shade,soft=True)
    face(rings[-1],paint(len(levels)-1,0,n)if callable(paint)else paint)
def silver(j,i,n):
    a=i*2*pi/n
    stripe=(.50+.29*cos(2*a+.85*j)+.16*cos(4*a-.8)+.05*sin(7*a+j))
    return blend('736c5f','fffbe9',max(0,min(1,stripe)))
def disc_tin(x,y,z,r,kind,incline=0):
    # Incline is from vertical: zero faces the shopper, 90 degrees lies flat.
    theta=incline*pi/180;co,si=cos(theta),sin(theta)
    def point(a,scale,depth):
        dx=r*scale*cos(a);h=r*scale*sin(a)
        return(x+dx,y+h*si+depth*co,z+h*co-depth*si)
    profiles=[(.93,.025),(.995,.022),(1,.016),(.985,0),(.94,-.0007)]
    n=30
    for j,((s0,d0),(s1,d1)) in enumerate(zip(profiles,profiles[1:])):
        for i in range(n):
            a,b=2*pi*i/n,2*pi*(i+1)/n;t=(.5+.5*cos(a-.8))
            face([point(a,s0,d0),point(b,s0,d0),point(b,s1,d1),point(a,s1,d1)],blend('907442','f0da92',t),soft=True)
    face([point(2*pi*i/n,.939,-.001)for i in range(n)],'ffffff',tins[kind],
         [(.5+.49*cos(2*pi*i/n),.5+.49*sin(2*pi*i/n))for i in range(n)])
def tray(x,y,z,w,d):
    box(x,y,z,w,d,.037,'ffffff',felt)
    for side in [-1,1]:box(x+side*(w-.012)/2,y,z+.03,.012,d,.041,'53534b')
def spoon(x,y,z,ang):
    # Shallow mother-of-pearl oval spoon, set at an angle in the service display.
    dx,dy=.092*cos(ang),.092*sin(ang)
    rod((x,y,z),(x+dx,y+dy,z+.011),.0034,'e9e7d8',7)
    face([(x+dx+.015*cos(i*pi/10)*cos(ang)-.009*sin(i*pi/10)*sin(ang),
           y+dy+.015*cos(i*pi/10)*sin(ang)+.009*sin(i*pi/10)*cos(ang),z+.011+.003*cos(i*pi/10)**2)for i in range(20)],'f5edda')
# Dark timber, grooved brass pilasters and a cream half-round pediment surround the branch bay.
box(0,.302,.0,2.54,.046,2.92,'ffffff',wood)
box(0,.241,.30,2.12,.046,2.045,'3d3d39')
front(0,.214,.39,2.075,1.79,mosaic)
front(0,.209,1.63,2.075,.56,(636,393,720,499))
for x in [-1.096,1.096]:box(x,.00,.29,.043,.56,1.98,'4b4539')
box(0,.02,2.206,2.16,.52,.073,'46453e')
for x in [-1.17,1.17]:
    box(x,-.188,.04,.201,.267,2.83,'ffffff',wood)
    box(x,-.323,.025,.207,.029,.41,'65513d')
    for dx in [-.065,-.035,0,.035,.065]:
        rod((x+dx,-.328,.51),(x+dx,-.328,2.62),.008,'a38955',6)
    for z in [.45,.50,2.63,2.69]:
        box(x,-.205,z,.220,.27,.025,'6c543d')
box(0,-.214,.12,2.17,.251,.225,'ffffff',wood)
for x in [-1.045,1.045]:box(x,-.348,.144,.018,.014,.158,'aa8c59')
for z in [.144,.294]:box(0,-.348,z,2.10,.014,.014,'aa8c59')
box(0,-.209,2.258,2.13,.24,.304,'7b6a53')
front(0,-.333,2.272,2.075,.277,header)
# Stepped arched fanlight above the plaque: an open native contour, not an image of the branch.
def arch(rx,height,base,y,shade):
    curve=[(rx*cos(i*pi/32),y,base+height*sin(i*pi/32))for i in range(33)]
    face(curve,shade)
    for a,b in zip(curve,curve[1:]):rod(a,b,.012,'bd9b5a',7)
arch(.76,.269,2.645,-.248,'e2d4b6')
for side in [-1,1]:
    for j in range(4):
        a=j*.50;rod((side*.02,-.270,2.708),(side*(.05+.055*a),-.270,2.712+.025*sin(2*a)),.009,'b69661',6)
box(0,-.204,2.585,2.46,.276,.063,'4b392b')
part('Fluted shop surround, caviar plaque and cream fanlight')
for z in [.375,.661,.975,1.299,1.626,2.191]:
    box(0,-.021,z,2.11,.493,.029,'a0a394')
    box(0,-.272,z-.004,2.11,.03,.036,'797a71')
    box(0,-.286,z+.021,2.08,.013,.008,'e6f0df')
for x in [-1.043,1.043]:box(x,-.091,.36,.024,.37,1.88,'b09d74')
for x in [-.79,-.24,.24,.79]:box(x,.15,2.140,.29,.053,.019,'eee8cf')
part('Open refrigerated shelves and polished shelf edges')
# Shop photo shows silver plates standing on the high shelf and lidded serving dishes.
def charger(x,y,z,r):
    n=40
    def ring(radius,dep,a):return(x+radius*cos(a),y+dep+.12*radius*sin(a),z+radius*sin(a))
    settings=[(.17,.046),(.53,.044),(.66,.025),(.77,.015),(.81,.022),(.91,.011),(.98,0),(1,.007)]
    for j,(a,b) in enumerate(zip(settings,settings[1:])):
        for i in range(n):
            t,q=2*pi*i/n,2*pi*(i+1)/n
            face([ring(r*a[0],a[1],t),ring(r*a[0],a[1],q),ring(r*b[0],b[1],q),ring(r*b[0],b[1],t)],[silver(j,i,n),silver(j,i+1,n),silver(j+1,i+1,n),silver(j+1,i,n)],soft=True)
    face([ring(r*.17,.046,i*2*pi/n)for i in range(n)],'dedfd5')
    for dx in [-.04,.04]:rod((x+dx,y-.021,z-r),(x+dx,y+.047,z-r+.071),.004,'a7a38e',6)
for x,z,r in [(-.87,1.78,.105),(-.58,1.844,.155),(-.17,1.814,.128),(.16,1.88,.175),(.69,1.833,.144)]:
    charger(x,.146,z,r)
for x in [-.37,.43]:
    profile(x,-.006,1.655,[(0,.056),(.010,.055),(.023,.013),(.075,.011),(.091,.024),(.124,.049),(.165,.059),(.168,.056)],silver,24)
def serving(x,y,z,r):
    profile(x,y,z,[(0,r*.60),(.013,r),(.023,r*.98),(.027,r*.81),(.036,r*.72),(.050,r*.77),(.078,r*.75),(.112,r*.64),(.136,r*.45),(.147,r*.17)],silver,32)
    # Small sturgeon-shaped finial on the manufacturer's silver caviar service.
    fish=[(-.052,0),(-.035,.011),(-.016,.014),(.011,.014),(.022,.023),(.027,.012),(.047,.007),(.064,.015),(.055,.001),(.063,-.007),(.045,-.001),(.018,.000),(-.018,-.001)]
    face([(x+a,y-.005,z+.154+b)for a,b in fish],'626561');face([(x+a,y+.005,z+.154+b)for a,b in fish[::-1]],'a4a59b')
    for k in range(len(fish)):
        a,b=fish[k],fish[(k+1)%len(fish)]
        face([(x+a[0],y-.005,z+.154+a[1]),(x+b[0],y-.005,z+.154+b[1]),(x+b[0],y+.005,z+.154+b[1]),(x+a[0],y+.005,z+.154+a[1])],'b7b6a9')
serving(-.60,-.085,1.659,.12);serving(.49,-.081,1.659,.107);serving(.09,-.032,1.331,.145)
spoon(.36,-.170,1.34,.24)
part('Silver chargers, caviar services with sturgeon finials and pearl spoon')
# Stacked presentation tins and black inclined sample stands.
for x in [-.82,-.62,.64,.82]:
    for i in range(2):disc_tin(x+.017*i,.11,1.342+i*.024,.083,(i+1)%3,90)
    disc_tin(x,.11,1.435,.095,0,8)
for i,x in enumerate([-.86,-.52,-.18,.16,.50,.84]):
    tray(x,-.026,1.004,.298,.243)
    for j in range(2):
        disc_tin(x+(-.057 if j==0 else .058),-.009,1.094,.062,(i+j)%3,24)
    box(x,-.166,1.013,.103,.022,.040,'c6c2ae')
def roe_jar(x,y,z):
    n=20;r=.059
    for i in range(n):
        a=2*pi*i/n-pi;b=2*pi*(i+1)/n-pi
        # The front of the jar corresponds to UV .5; the label wraps the glass.
        def v(q,h,rad):return(x+rad*sin(q),y-rad*cos(q),z+h)
        for low,high,region,rr in [(0,.031,roe,r),(.032,.086,roe_label,r+.0008),(.087,.115,roe,r)]:
            face([v(a,low,rr),v(b,low,rr),v(b,high,rr),v(a,high,rr)],'ffffff',region,
                 [(i/n,0),((i+1)/n,0),((i+1)/n,1),(i/n,1)],True)
    profile(x,y,z+.115,[(0,.057),(.005,.064),(.016,.064),(.019,.053)],'c4ae72',20)
for i,x in enumerate([-.82,-.60,-.39,-.18,.05]):
    for row in range(2):roe_jar(x,-.119+.167*row,.692)
for x in [.32,.56,.80]:
    box(x,-.02,.694,.211,.184,.058,'383839');front(x,-.117,.694,.16,.045,card)
    disc_tin(x,.025,.78,.063,1,23)
for i,x in enumerate([-.80,-.4,0,.4,.8]):
    tray(x,-.025,.405,.35,.25)
    box(x,.090,.433,.32,.026,.16,'353636');front(x,.073,.45,.29,.12,card)
    disc_tin(x,-.07,.453,.071,i%3,66)
part('Oscietra and Saint-James tins, trout roe jars and open gift boxes')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
