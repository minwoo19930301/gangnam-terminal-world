"""Editable Gangnam Salt House public shopfront, sandwich counter and curing display."""
from math import sin,cos,pi,exp
from pathlib import Path
import random,subprocess,tempfile
import bpy
from mathutils import Vector,Matrix
here=Path(__file__).resolve().parent
rng=random.Random(1963)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('SaltHouseGangnam')
bpy.context.scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as tmp:
    path=Path(tmp)/'Salt House shop finish.png'
    subprocess.run(['node',str(here/'art.mjs'),str(path)],check=True)
    image=bpy.data.images.load(str(path));image.pack()
image.name='소금집 강남 · 포장과 매장 마감'
mat=bpy.data.materials.new('소금집 · 나무와 샤퀴테리');mat.use_nodes=True
nt=mat.node_tree;bsdf=nt.nodes.get('Principled BSDF')
tex=nt.nodes.new('ShaderNodeTexImage');tex.image=image
vcol=nt.nodes.new('ShaderNodeVertexColor');vcol.layer_name='Finish'
mix=nt.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
nt.links.new(tex.outputs['Color'],mix.inputs[1]);nt.links.new(vcol.outputs['Color'],mix.inputs[2])
nt.links.new(mix.outputs[0],bsdf.inputs['Base Color']);bsdf.inputs['Roughness'].default_value=.46
white=(728,726,728,726)
wood=(3,317,277,454);metal=(293,315,501,454);white_tile=(517,315,758,454)
paper=(460,3,603,211);sign=(2,225,602,301);board=(614,2,762,211)
pale_skin=(3,469,180,603);dark_skin=(193,469,370,603);belly=(380,469,558,603)
cut_meat=(570,469,758,603);crust=(3,616,248,760);crumb=(260,617,507,760)
vertex_index={};vertices=[];faces=[];colors=[];coords=[];smooth=[]
def uv(region,u,v):
    l,t,r,b=region
    return ((l+(r-l)*u+.5)/768,1-(b+(t-b)*v+.5)/768)
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
# Local +Y looks into the business from the public aisle. The guide-fit room is
# skewed, so the rear counter stops inside the back and side guide edges.
def profile(name,x,y,levels,region=white,n=16):
    # (offset x, offset y, z, radius x, radius y, colour); UV follows the object.
    rings=[]
    for dx,dy,z,rx,ry,tone in levels:
        rings.append([(x+dx+rx*cos(2*pi*i/n),y+dy+ry*sin(2*pi*i/n),z)for i in range(n)])
    for k,(a,b)in enumerate(zip(rings,rings[1:])):
        for j in range(n):
            nxt=(j+1)%n
            face([a[j],a[nxt],b[nxt],b[j]],[levels[k][-1]]*2+[levels[k+1][-1]]*2,region,
                 [(j/n,k/(len(rings)-1)),((j+1)/n,k/(len(rings)-1)),
                  ((j+1)/n,(k+1)/(len(rings)-1)),(j/n,(k+1)/(len(rings)-1))],soft=True)
    face(rings[0][::-1],levels[0][-1]);face(rings[-1],levels[-1][-1])
def horizontal_ring(name,x,y,z,r,tone):
    pts=[(x+r*cos(i*pi/8),y+r*sin(i*pi/8),z)for i in range(17)]
    for a,b in zip(pts,pts[1:]):rod(a,b,.004,tone,5)
def finish(name):return part(name)

# Portal: dark stepped joinery, routed flutes, clipped glass panes and the
# brass-inlaid transom photographed at the Gangnam branch. The middle is open.
top=3.48
for s in [-1,1]:
    x=s*3.55
    box(x,.15,0,2.63,.18,.83,'b09a88',wood)
    for j in [-1,1]:
        box(x+j*1.23,.15,.80,.17,.18,2.01,'baa495',wood)
    box(x,.16,2.74,2.64,.21,.15,'baa797',wood)
    for j in [-1,1]:
        box(x+j*.568,.047,.13,1.04,.05,.57,'85736b',wood)
        for h in [.14,.67]:box(x+j*.568,.011,h,1.02,.055,.032,'bba89b',wood)
    # Brass perimeter of the high narrow display light. Each corner has a stepped curve.
    for j in [-1,1]:
        px=x+j*.55;w=.91;lo=.92;hi=2.63
        q=[(px-w/2+.11,lo),(px+w/2-.11,lo),(px+w/2-.035,lo+.045),(px+w/2,lo+.13),
           (px+w/2,hi-.13),(px+w/2-.035,hi-.045),(px+w/2-.11,hi),
           (px-w/2+.11,hi),(px-w/2+.035,hi-.045),(px-w/2,hi-.13),
           (px-w/2,lo+.13),(px-w/2+.035,lo+.045)]
        for i,(xx,zz) in enumerate(q):
            nx,nz=q[(i+1)%len(q)];rod((xx,.08,zz),(nx,.08,nz),.015,'bba176',6)
        box(px,.16,lo-.065,w+.064,.205,.065,'a28c7e',wood)
    box(s*2.28,.03,0,.235,.24,2.95,'9f8f83',wood)
    for j in range(4):box(s*2.28+(j-1.5)*.043,-.099,.31,.014,.020,2.44,'8d7d70',wood)
    box(s*2.28,.00,2.74,.29,.28,.145,'b6a294',wood)
    # Golden wall lamp and its mounting disc on the transom's end block.
    for d,rad,tone in [(.00,.105,'9c7650'),(-.03,.071,'e7b965'),(-.055,.046,'fff1ae')]:
        rod((s*2.52,d,3.135),(s*2.52,d-.035,3.135),rad,tone,14)
box(0,.16,2.89,9.58,.24,.57,'b3a293',wood)
for zz,h,d in [(2.85,.059,.30),(3.425,.055,.32),(3.489,.040,.39)]:
    box(0,.13,zz,9.61,d,h,'b6a496',wood)
# Solid west and east transom panels; light-coloured lettering occupies the central field.
front(0,.030,2.954,4.54,.404,sign)
for s in [-1,1]:
    x=s*3.60
    for j in [-1,1]:box(x+j*.91,.030,2.947,.014,.012,.415,'b19a73')
    for zz in [2.944,3.346]:box(x,.030,zz,1.83,.012,.014,'b19a73')
finish('Entrance joinery, bevelled brass glass beads and illuminated name')

# Standing Jambon Fromage display on the photographed left side of the opening.
box(-1.94,.52,.035,.46,.40,.045,'776f62')
box(-1.94,.52,.078,.40,.071,1.13,'b2ad9f')
front(-1.94,.477,.244,.37,.889,board)
finish('Threshold sandwich display')

# Viewed from the entrance the ordering counter runs down the left-hand wall.
order_start=set(collection.objects)
# Pale subway tiles behind the service counter, stainless working strip and hung menu boards.
box(-1.66,4.14,.01,2.99,.09,2.92,'fffdf6',white_tile)
for k in range(12):box(-3.14+k*.263,4.088,.32,.006,.010,2.60,'b2b0a5')
for j in range(11):box(-1.66,4.086,.35+j*.238,2.98,.012,.006,'aaa99f')
box(-1.58,4.078,1.195,2.82,.017,.58,'faf6eb',metal)
for j in range(6):
    x=-2.89+j*.474
    box(x,3.98,2.045,.446,.065,.35,'8c877c')
    reg=(j%3*152+2,j//3*108+2,j%3*152+146,j//3*108+102)
    front(x,3.943,2.053,.428,.331,reg)
finish('Six photographed sandwich varieties on the tile wall')

# Display counter: dark timber planks, recessed base and the wrapped hand-held baguettes.
box(-1.65,2.61,.075,2.74,.81,.865,'d1b6a1',wood)
for j in range(17):box(-2.95+j*.165,2.201,.105,.009,.010,.775,'735f56')
box(-1.65,2.58,.934,2.83,.91,.075,'c5b9a5')
box(-1.65,2.58,1.007,2.83,.91,.025,'8b7564',wood)
for j in range(4):
    x=-2.64+.66*j
    box(x,2.53,1.034,.615,.54,.025,'b79a77',wood)
    for side in [-1,1]:
        box(x,2.53+side*.267,1.047,.62,.017,.049,'9a8065')
        box(x+side*.302,2.53,1.047,.017,.54,.049,'9a8065')
finish('Public sandwich counter and four wooden trays')
def baguette(x,y,z,w,d,h,region,seed=1,tone='ffffff'):
    segments=9;cross=10
    def p(k,j):
        u=k/segments;a=2*pi*j/cross;scale=max(.08,sin(pi*u)**.48)
        return(x+(u-.5)*w,y+scale*d*.5*cos(a),z+scale*h*.5*sin(a)+h*.51)
    for i in range(segments):
        for j in range(cross):
            n=j+1
            face([p(i,j),p(i,n),p(i+1,n),p(i+1,j)],tone,region,
                 [(i/segments,j/cross),(i/segments,n/cross),((i+1)/segments,n/cross),((i+1)/segments,j/cross)],soft=True)
def cut_baguette(x,y,z,w,d,h,seed=1):
    # A cut half has a flat crumb face at one end and a porous pale front edge.
    # Its lower edge stays aligned with the filling instead of closing to a point.
    profile=[(-.50,0),(-.49,.34),(-.38,.75),(-.18,.94),(.08,1.0),(.34,.83),(.48,.48),(.50,.07),(.50,0)]
    def v(i,j):
        u=i/10;p,q=profile[j];sc=.56+.44*sin(.22+u*2.40)**.65
        xcut=(u-.5)*w+(u**4)*d*.22*p
        return(x+xcut,y+p*d*sc,z+q*h*sc)
    for i in range(10):
        for j in range(len(profile)-1):
            region=crumb if j==0 or j==7 else crust
            face([v(i,j),v(i,j+1),v(i+1,j+1),v(i+1,j)],'ffffff',region,
                 [(i/10,j/8),(i/10,(j+1)/8),((i+1)/10,(j+1)/8),((i+1)/10,j/8)],soft=j not in (0,7))
        face([v(i,0),v(i+1,0),v(i+1,8),v(i,8)],'f6dcb0',crumb)
    for i in [0,10]:
        poly=[v(i,j) for j in range(9)]
        if i==0:poly=poly[::-1]
        face(poly,'fff6e3',crumb,[(.5+.89*(b-y)/d,.15+.74*(c-z)/h)for a,b,c in poly])
    for i in range(3):
        xx=x+(i-1)*w*.24
        face([(xx-w*.06,y-d*.13,z+h*.91),(xx+w*.018,y+d*.15,z+h*.95),
              (xx+w*.080,y+d*.18,z+h*.91),(xx+w*.012,y-d*.14,z+h*.88)],'edc593',crust)
def sandwich(x,y,z,scale=1,leaf=True):
    w=.48*scale;d=.175*scale
    cut_baguette(x,y,z,w,d,.055*scale)
    # Sliced bread, rumpled ham and pale butter show through the front seam.
    for layer in range(3):
        zz=z+(.047+.013*layer)*scale
        for i in range(11):
            def f(j,k):
                xx=x+(j/11-.5)*w*.91
                halfwidth=.090*scale*(.35+.65*sin(pi*j/11)**.50)
                return(xx,y+(k-.5)*2*halfwidth+.019*scale*sin(j*.98+layer),
                       zz+.014*scale*sin(j*1.57+layer)+.004*k*scale)
            face([f(i,0),f(i+1,0),f(i+1,1),f(i,1)],('e9b9a1','cd8f83','e9c0ac')[layer],cut_meat)
    if leaf:
        for i in range(5):
            xx=x+(i-2)*.070*scale
            face([(xx-.046*scale,y-.068*scale,z+.101*scale),(xx,y-.080*scale,z+.118*scale),
                  (xx+.047*scale,y-.061*scale,z+.103*scale),(xx,y+.010*scale,z+.117*scale)],'6d8652')
    else:
        face([(x-w*.43,y-.011*scale,z+.108*scale),(x-w*.31,y-.061*scale,z+.106*scale),
              (x+w*.31,y-.059*scale,z+.109*scale),(x+w*.42,y+.006*scale,z+.107*scale),
              (x+w*.28,y+.055*scale,z+.115*scale),(x-w*.28,y+.061*scale,z+.111*scale)],'ecd79d')
    cut_baguette(x,y,z+.101*scale,w*.99,d,.082*scale)
    for j in range(3):
        xx=x+(j-1)*.092*scale
        rod((xx-.025*scale,y-.045*scale,z+.160*scale),(xx+.025*scale,y+.043*scale,z+.174*scale),.006*scale,'f0cf99',5)
for j in range(4):
    x=-2.65+j*.66
    for i in range(3):
        a=x+(i-1)*.150
        baguette(a,2.57+i%2*.055,1.073,.263,.159,.132,paper,i,'fffaf6')
    if j<2:baguette(x+.041,2.59,1.156,.245,.14,.12,paper,j,'f6e9e5')
    elif j==2:sandwich(x,2.39,1.078,.90,False)
    else:sandwich(x,2.39,1.075,.94,True)
    reg=(j%3*152+2,j//3*108+2,j%3*152+146,j//3*108+102)
    front(x,2.28,1.057,.152,.095,reg,slope=.035)
finish('Paper-wrapped stock, jambon beurre and fromage with baguette crust')

# Red slicer and a narrow porcelain utensil holder visible at the left of the counter photo.
box(-2.77,3.02,1.052,.34,.21,.055,'9c403c')
rod((-2.85,2.995,1.245),(-2.85,3.045,1.245),.136,'9a3835',18)
rod((-2.85,2.984,1.245),(-2.85,2.991,1.245),.112,'c0b7a9',18)
box(-2.71,2.989,1.128,.19,.115,.041,'bcb6a7')
profile('holder',-3.03,2.49,[(0,0,1.03,.068,.066,'384c53'),(0,0,1.24,.077,.071,'4c6063')],n=12)
for i in range(3):
    rod((-3.06+i*.028,2.49,1.21),(-3.12+i*.08,2.50,1.51+i*.032),.018,'dbb879',7)
finish('Red meat slicer and baguette holder')

# Clipped notices, stainless cross-bracing and raised presentation rail from
# the branch counter photograph. Menu cards carry only photographed varieties.
for j in range(5):
    x=-2.88+j*.155
    rod((x,3.86,1.28),(x+.15,3.86,1.61),.012,'b9b8ae')
    rod((x,3.86,1.61),(x+.15,3.86,1.28),.012,'b9b8ae')
for zz in [1.275,1.614]:box(-2.57,3.86,zz,.84,.044,.029,'cecdc2')
for x in [-1.79,-.30]:box(x,3.62,1.13,.042,.12,.88,'b49e84',wood)
box(-1.045,3.63,1.964,1.55,.13,.058,'a89479',wood)
for i,x in enumerate([-2.24,-1.21]):
    box(x,2.883,1.03,.30,.035,.455,'a79782',wood)
    reg=(i*152+2,2,i*152+146,102)
    front(x,2.862,1.058,.274,.385,reg)
    box(x,2.851,1.42,.085,.024,.031,'49483f')
finish('Counter rail, clipped menu cards and crossed steel lattice')
order_pose=Matrix.Translation((1.04,4.40,0))@Matrix.Rotation(pi/2,4,'Z')
# A further inset on the back of the order display keeps the menu and tiles
# on the customer-visible side of the building's oblique shared wall.
for ob in set(collection.objects)-order_start:
    shift=.70 if ob.name.startswith('Six photographed') else .35 if ob.name.startswith('Counter rail') else 0
    ob.matrix_world=Matrix.Translation((shift,0,0))@order_pose@ob.matrix_world

# A short pale tiled back wall and the blue-lit beverage case are both visible
# from the photographed entrance, immediately left of the taller drying cabinet.
box(-.55,4.97,.04,3.14,.12,2.96,'f4f2e7',white_tile)
for j in range(12):box(-2.05+j*.275,4.902,.14,.005,.008,2.84,'bdbdb2')
for j in range(13):box(-.55,4.900,.10+j*.23,3.13,.009,.005,'bfbfb2')
box(-.83,4.41,.032,1.11,.65,.39,'dadbd1',metal)
box(-.83,4.71,.42,1.11,.043,.88,'bad1cf')
for xx in [-1.37,-.29]:
    box(xx,4.40,.42,.045,.64,.94,'cccec3',metal)
    box(xx,4.09,.46,.015,.018,.86,'bef2ed')
box(-.83,4.40,1.31,1.11,.67,.075,'d9dfd4',metal)
for row in range(3):
    zz=.451+row*.268
    box(-.83,4.37,zz,1.04,.47,.028,'c1c6bb',metal)
    for col in range(7):
        xx=-1.256+col*.140
        tint=['7ba8a6','a8b98c','91aaba','d4ad88','b28679','b0c3ac','a3b8bd'][(col+row*2)%7]
        profile('bottle',xx,4.20,[(0,0,zz+.03,.036,.034,tint),(0,0,zz+.12,.040,.036,tint),
            (0,0,zz+.155,.027,.025,tint),(0,0,zz+.176,.020,.019,'d6d4c4')],n=8)
        box(xx,4.163,zz+.066,.048,.005,.052,'efe6ce')
finish('Pale back tiles and three-level chilled drink cabinet')

# Three-door illuminated curing cabinet. The visitor photograph shows unevenly
# spaced hanging cured meats, twine loops, lower wooden slats and whole hams.
fx=1.31;cy=4.42
box(fx,cy,.04,2.85,.72,.19,'a19074',wood)
box(fx,cy+.36,.225,2.85,.09,2.10,'ffffff',metal)
for k in range(3):
    cx=fx+(k-1)*.927
    box(cx,cy+.295,.35,.89,.035,1.85,'ffffff',metal)
    box(cx,cy-.358,.295,.905,.033,.042,'4b4141')
    box(cx,cy-.352,2.243,.907,.045,.045,'776961')
    box(cx,cy+.16,2.193,.82,.065,.033,'fff6c8')
    for j in range(3):box(cx,cy-.20,.244+j*.074,.88,.25,.055,'d2b28e',wood)
    rod((cx-.42,cy-.03,2.12),(cx+.42,cy-.03,2.12),.011,'c5c2ad',7)
for j in range(4):
    xx=fx-1.408+j*.938
    box(xx,cy-.36,.24,.049,.093,2.06,'62584e',wood)
    box(xx+.033,cy-.398,.343,.013,.014,1.83,'fff5c9')
    if j in [1,2]:box(xx-.043,cy-.424,1.13,.020,.035,.22,'565148')
box(fx,cy-.02,2.28,2.86,.83,.22,'b09b8b',wood)
box(fx+.99,cy-.444,2.34,.25,.018,.067,'353833')
finish('Three illuminated curing doors, shelves, glass edge strips and slatted crates')
def hanging(x,y,h,w,seed,mode):
    rng=random.Random(seed)
    bottom=2.01-h
    rod((x-.022,y,2.12),(x,y,2.04),.005,'ccbda3',5)
    rod((x+.020,y,2.12),(x,y,2.04),.005,'cbbb9d',5)
    reg=[pale_skin,dark_skin,belly][mode]
    levels=[]
    for i,sz in enumerate([.16,.69,1.0,.91,.99,.86,.89,.67,.18]):
        u=i/8;dx=.03*sin(seed*.51+u*4.0)+.02*sin(u*7)
        levels.append((dx,.022*cos(u*4+seed),bottom+u*h,w*sz,w*(.52 if mode==2 else .78)*sz,'fffaf0'))
    profile('casing',x,y,levels,reg,12)
    for j in range(3 if mode==0 else 1):
        t=(.18+j*.28) if mode==0 else .12
        z=bottom+h*t;cx=x+.03*sin(seed*.51+t*4)+.02*sin(t*7)
        pts=[(cx+w*(.99 if mode==0 else .86)*cos(k*pi/6),y+.022*cos(t*4+seed)+w*.79*sin(k*pi/6),z+.006*sin(k*pi/3))for k in range(13)]
        for a,b in zip(pts,pts[1:]):rod(a,b,.0027,'b9a98a',5)
    rod((x+.014,y,2.015),(x,y,2.055),.005,'c2b19a',5)
for k in range(3):
    cx=fx+(k-1)*.926
    for i in range(5):
        x=cx+(i-2)*.164+(.027 if i%2 else 0);y=cy-.02+(-.075 if i%2 else .083)
        hanging(x,y,.70+.21*((i*3+k)%4),.053+.013*((i+k)%3),k*11+i,(k*2+i)%3)
    finish('Suspended charcuterie in bay '+str(k+1))
# Looped natural casings, a striped belly and a bone-in cured ham break the rows
# of single hanging salami. Their different silhouettes are visible at the door.
def tube(path,radii,region,tone,n=10):
    path=[Vector(p)for p in path];rings=[]
    for i,p in enumerate(path):
        tangent=(path[min(i+1,len(path)-1)]-path[max(0,i-1)]).normalized()
        ref=Vector((0,1,0)) if abs(tangent.y)<.80 else Vector((1,0,0))
        u=tangent.cross(ref).normalized();v=tangent.cross(u)
        rings.append([tuple(p+radii[i]*(u*cos(2*pi*j/n)+v*sin(2*pi*j/n)))for j in range(n)])
    for i,(a,b) in enumerate(zip(rings,rings[1:])):
        for j in range(n):
            k=(j+1)%n
            face([a[j],a[k],b[k],b[j]],tone,region,[(j/n,i/(len(path)-1)),((j+1)/n,i/(len(path)-1)),
                 ((j+1)/n,(i+1)/(len(path)-1)),(j/n,(i+1)/(len(path)-1))],soft=True)
    face(rings[0][::-1],tone);face(rings[-1],tone)
for x,zmin,span in [(2.21,.80,.204),(.49,1.10,.144)]:
    path=[(x-span,4.20,2.04),(x-span-.014,4.18,1.78),(x-span+.015,4.19,zmin+.22)]
    path.extend((x-span*cos(i*pi/8),4.20+.012*sin(i*pi/8),zmin+.17-.17*sin(i*pi/8))for i in range(9))
    path.extend([(x+span-.020,4.19,1.72),(x+span*.79,4.21,1.94),(x+span*.71,4.20,2.03)])
    radii=[.015]+[.033 if i%3 else .039 for i in range(1,len(path)-1)]+[.012]
    tube(path,radii,pale_skin,'fbf2d5')
    for xx in [x-span,x+span*.71]:rod((xx,4.20,2.03),(xx+.025,4.37,2.12),.005,'cdbb97',5)
# Slab-shaped cured belly with alternating fat and lean bands.
profile('belly',1.36,4.19,[(0,0,.87,.105,.034,'faf0df'),(.01,0,1.05,.136,.058,'fff4df'),
    (-.03,.01,1.34,.124,.071,'fbf3df'),(-.06,.02,1.67,.104,.052,'fff0ce'),
    (-.095,.01,1.91,.052,.038,'eedabb')],belly,10)
rod((1.27,4.20,1.9),(1.28,4.35,2.12),.006,'c5ac88',6)
for j in range(23):
    box(.15+j*.070,4.56,2.53,.036,.26,.061,'41423b')
finish('Curved sausage loops, cured belly and cabinet vent')
for j,(xx,yy,sz) in enumerate([(.27,4.25,.82),(.72,4.26,.69),(1.14,4.23,.98),(1.77,4.27,.82),(2.25,4.34,1.04)]):
    # Rounded haunch, long shank and small exposed bone end on the slatted shelf.
    p=[(xx-.185*sz,yy,.54),(xx-.11*sz,yy,.60),(xx+.025*sz,yy,.62),
       (xx+.13*sz,yy+.024,.66),(xx+.24*sz,yy+.053,.72),(xx+.32*sz,yy+.057,.75)]
    tube(p,[.057*sz,.130*sz,.154*sz,.098*sz,.043*sz,.023*sz],dark_skin,'f8d09f',13)
    tube([p[-1],(p[-1][0]+.044,yy+.065,.763),(p[-1][0]+.063,yy+.064,.770)],
        [.019,.025,.016],white,'dfc7a1',9)
finish('Whole cured hams with shanks and exposed bone tips')

# Two small dining tables on the right-hand side of the customer entrance.
# Leave the central approach from the doorway to the curing case clear.
for row,(x,y) in enumerate([(3.08,1.42),(3.25,3.05)]):
    box(x,y,.741,1.06,.68,.048,'d1b396',wood)
    for sx in [-1,1]:
        for sy in [-1,1]:rod((x+sx*.43,y+sy*.245,.035),(x+sx*.39,y+sy*.21,.746),.020,'777a73',7)
    for sy in [-1,1]:
        px,py=x,y+sy*.58
        box(px,py,.425,.40,.36,.043,'b39880',wood)
        for xx in [-.151,.151]:
            rod((px+xx,py+sy*.145,.035),(px+xx,py+sy*.132,.78),.014,'747670',7)
            rod((px+xx,py-sy*.146,.031),(px+xx,py-sy*.125,.438),.014,'747670',7)
        box(px,py+sy*.140,.644,.397,.030,.152,'bca791',wood)
finish('Two timber tables with metal chairs')
# Actual plated meal: brushed steel round plate, pink branded sandwich paper,
# jambon sandwich, carrot ribbons in steel cups and orange juice.
def plate(x,y,z,r):
    profile('steel plate',x,y,[(0,0,z,r*.85,r*.85,'6f756f'),(0,0,z+.010,r,r,'afb3a9'),
      (0,0,z+.018,r,r,'ece6d5'),(0,0,z+.015,r*.93,r*.93,'bfbcb0')],n=32)
    face([(x-r*.91,y-r*.61,z+.019),(x+r*.64,y-r*.79,z+.019),
          (x+r*.90,y+r*.48,z+.019),(x-r*.61,y+r*.76,z+.019)],'ffffff',paper)
def carrot(x,y,z,r):
    profile('steel carrot cup',x,y,[(0,0,z,.60*r,.60*r,'b0a998'),(0,0,z+.049,r,r,'c9c3b2'),
      (0,0,z+.054,.96*r,.96*r,'e6dfc9'),(0,0,z+.048,.85*r,.85*r,'8f8570')],n=16)
    for j in range(24):
        a=rng.random()*2*pi;rr=r*.63*rng.random();xx=x+rr*cos(a);yy=y+rr*sin(a);h=z+.052+.016*rng.random()
        pts=[(xx-.014*cos(a),yy-.014*sin(a),h),(xx,yy,h+.006),(xx+.012*cos(a+.55),yy+.012*sin(a+.55),h)]
        for u,v in zip(pts,pts[1:]):rod(u,v,.0032,['df8c30','ed9c37','cd7426'][j%3],5)
for i,(xx,yy,scale) in enumerate([(2.89,1.36,.78),(3.31,1.48,.66),(3.22,3.01,.69)]):
    z=.794;plate(xx,yy,z,.182)
    sandwich(xx,yy+.015,z+.022,scale,True)
    carrot(xx-.112,yy-.085,z+.023,.041)
    ob=finish('Plated jambon sandwich and carrot ribbons '+str(i+1))
    centre=Vector((xx,yy,z))
    ob.matrix_world=Matrix.Translation(centre)@Matrix.Rotation([.64,-.58,.35][i],4,'Z')@Matrix.Translation(-centre)
profile('juice glass',3.35,1.22,[(0,0,.793,.034,.034,'b4b5a7'),(0,0,.802,.041,.041,'e8d8a9'),
    (0,0,.817,.037,.037,'e6a72d'),(0,0,.964,.048,.048,'f5bd3c'),
    (0,0,.989,.048,.048,'f1d69d')],n=16)
rod((3.35,1.22,.972),(3.385,1.22,1.137),.005,'eee9d8',6)
finish('Jambon sandwich, carrot cups, metal plates and orange juice')
# Dark pendants above the order counter and suspended linear lights in the public shop photo.
for i in range(5):
    xx=-2.81+i*.57
    rod((xx,3.11,2.98),(xx,3.11,3.50),.008,'5d5b53',5)
    profile('shade',xx,3.11,[(0,0,2.786,.192,.192,'52564e'),(0,0,2.812,.197,.197,'64675e'),
        (0,0,2.904,.080,.080,'62645a'),(0,0,3.009,.041,.041,'4b514a')],n=16)
    rod((xx,3.11,2.78),(xx,3.11,2.787),.165,'fff5c8',16)
pendants=finish('Five dark pendant shades above the sandwich counter')
pendants.matrix_world=order_pose@pendants.matrix_world
for depth in [1.10,2.71,4.18]:
    for x in [-.34,2.29]:
        box(x,depth,3.523,1.95,.104,.052,'9b9b8d')
        box(x,depth,3.512,1.91,.084,.017,'fff6cc')
        for xx in [-.96,.96]:
            for dy in [-.088,.088]:
                rod((x+xx,depth+dy,3.55),(x+xx,depth+dy,3.65),.006,'787b72',5)
        for dy in [-.088,.088]:
            rod((x-.96,depth+dy,3.65),(x+.96,depth+dy,3.65),.006,'888b80',5)
        for xx in [-.96,-.48,0,.48,.96]:
            rod((x+xx,depth-.088,3.64),(x+xx,depth+.088,3.64),.005,'888b80',5)
        for dx in [-.73,.73]:rod((x+dx,depth,3.572),(x+dx,depth,4.23),.005,'8b8a7f',5)
finish('Suspended white strip lights')
# A neutral grey-brown plank floor is visible from the shop entrance. Its
# outer limits follow the projected guide; the continuous collider is in model.js.
for j in range(30):
    v0=j*.18+.045;v1=v0+.177
    l0=-4.81+.272*v0;r0=4.81+.276*v0
    l1=-4.81+.272*v1;r1=4.81+.276*v1
    stops=[l0]+[i*1.08+(j%3)*.359 for i in range(-5,7) if l0+.05<i*1.08+(j%3)*.359<r0-.05]+[r0]
    for i,(a,b) in enumerate(zip(stops,stops[1:])):
        upper_a=l1 if i==0 else a;upper_b=r1 if i==len(stops)-2 else b
        shade=['e5dfd4','eee6db','ded8ce','f2eadd','e3dcd1'][(j*7+i*3)%5]
        face([(a+.004,v0,.024),(b-.004,v0,.024),(upper_b-.004,v1,.024),(upper_a+.004,v1,.024)],shade,(521,617,754,690))
finish('Neutral grey oak plank floor')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'shop.blend'),compress=True)
