"""Retail exhibit, in metres. X right, Y toward rear, Z up."""
from pathlib import Path
from math import sin, cos, pi, sqrt, radians
import bpy
from mathutils import Vector

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
collection = bpy.data.collections.new('SSG_9F_Gatevision')
scene.collection.children.link(collection)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[collection.name]
tau = 2*pi

def paint(name, rgb, rough=.42, batch='Cabinet'):
    def linear(c):
        c = int(c,16)/255
        return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
    rgba = tuple(linear(rgb[k:k+2]) for k in (0,2,4))+(1,)
    m=bpy.data.materials.new(name)
    m.diffuse_color=rgba
    m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=rgba
    bs.inputs['Roughness'].default_value=rough
    m['batch']=batch
    return m

ivory=paint('Warm lacquer','f2eee3')
edge=paint('Cabinet reveals','a49f95')
stone=paint('Pebble grey insert','d7d3c9')
paper=paint('Leaflet ivory','fffbee')
blue=paint('Display blue','427ba2')
pale=paint('Screen accent','aacbdc')
graphite=paint('Satin graphite','2b2d30',.32,'Shell')
white=paint('Warm appliance white','f5f3ec',.32,'Shell')
trim=paint('Graphite bezel','222326',.31,'Shell')
pearl=paint('Porcelain bezel','e4e3de',.31,'Shell')
dark=paint('Black elastomer','232427',.72,'Liner')
liner=paint('Globe lining','3c3d3e',.70,'Liner')
sieve=paint('Sieve graphite','505152',.7,'Liner')
lens=paint('Smoked optical glass','0d161c',.21,'Shell')
led=paint('Cobalt indicator','426cff',.28,'Shell')
ginger=paint('Calico ginger','bf8d56')
grey=paint('Calico smoke','736b62')
steel=paint('Nickel','9da0a1')
ink=paint('Sign graphite','292b2c')
def mesh(name,verts,faces,mat,smooth=False):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces); data.update()
    o=bpy.data.objects.new(name,data); collection.objects.link(o)
    data.materials.append(mat)
    if smooth:
        for p in data.polygons:p.use_smooth=True
    return o

def bevel(o,r):
    if r<=0:return
    bpy.context.view_layer.objects.active=o
    m=o.modifiers.new('Moulded edge','BEVEL');m.width=r;m.segments=3
    bpy.ops.object.modifier_apply(modifier=m.name)
    if hasattr(o.data,'use_auto_smooth'):o.data.use_auto_smooth=True
    m=o.modifiers.new('Corner normals','WEIGHTED_NORMAL')
    bpy.ops.object.modifier_apply(modifier=m.name)

def box(name,p,size,mat,r=.005):
    bpy.ops.mesh.primitive_cube_add(size=1,location=p)
    o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(mat);bevel(o,r)
    return o

def ell(name,p,scale,mat):
    segments=12 if max(scale)<.035 else 20
    rows=segments//2
    verts=[(0,0,-1)]
    for j in range(1,rows):
        latitude=pi*j/rows-pi/2
        for i in range(segments):
            angle=tau*i/segments
            verts.append((cos(latitude)*cos(angle),cos(latitude)*sin(angle),sin(latitude)))
    top=len(verts);verts.append((0,0,1))
    faces=[]
    for i in range(segments):
        a=1+i;b=1+(i+1)%segments
        faces.append((0,b,a))
        for j in range(rows-2):
            lo=a+j*segments;hi=b+j*segments
            faces.append((lo,hi,hi+segments,lo+segments))
        faces.append((a+(rows-2)*segments,b+(rows-2)*segments,top))
    o=mesh(name,verts,faces,mat,True)
    o.location=p;o.scale=scale
    return o

def outline(w,d,r,n=9):
    pts=[]
    for a,x,y in [(0,w/2-r,d/2-r),(pi/2,-w/2+r,d/2-r),(pi,-w/2+r,-d/2+r),(1.5*pi,w/2-r,-d/2+r)]:
        for i in range(n):
            t=a+i*pi/2/(n-1);pts.append((x+r*cos(t),y+r*sin(t)))
    return pts

def tier(name,cx,cy,profiles,mat):
    rings=[[(cx+x,cy+y,z) for x,y in outline(w,d,r)] for z,w,d,r in profiles]
    n=len(rings[0]);verts=sum(rings,[])
    faces=[tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))]
    for k in range(len(rings)-1):
        for j in range(n):
            i=k*n+j;q=k*n+(j+1)%n;faces.append((i,q,q+n,i+n))
    o=mesh(name,verts,faces,mat)
    for f in list(o.data.polygons)[2:]:f.use_smooth=True
    return o

def slab(name,x,y,z,w,d,h,r,mat):
    return tier(name,x,y,[(z,w-.006,d-.006,r-.003),(z+.003,w,d,r),(z+h-.003,w,d,r),(z+h,w-.006,d-.006,r-.003)],mat)

def line(name,pts,r,mat):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=1;c.bevel_depth=r;c.bevel_resolution=1
    spl=c.splines.new('POLY');spl.points.add(len(pts)-1)
    for p,v in zip(spl.points,pts):p.co=(*v,1)
    o=bpy.data.objects.new(name,c);collection.objects.link(o);o.data.materials.append(mat)
    return o

font_path=Path('/System/Library/Fonts/AppleSDGothicNeo.ttc')
font=bpy.data.fonts.load(str(font_path)) if font_path.exists() else bpy.data.fonts.get('Bfont')
def label(name,body,x,y,z,width,mat,korean=False):
    c=bpy.data.curves.new(name,'FONT');c.body=body;c.size=1;c.align_x='CENTER';c.align_y='CENTER'
    c.resolution_u=4
    if korean:c.font=font
    o=bpy.data.objects.new(name,c);collection.objects.link(o);o.location=(x,y,z);o.rotation_euler.x=pi/2
    bpy.context.view_layer.update();s=width/max(o.dimensions.x,.001);o.scale=(s,s,s);c.materials.append(mat)
    return o

# Double shelf with an open left bay, right hand doors and an inset demonstration tray.
slab('Plinth toe',0,.02,.015,1.63,.66,.056,.28,edge)
slab('Rounded lower shelf',0,0,.068,1.91,.85,.055,.31,ivory)
slab('Sliding cabinet carcass',.30,0,.12,1.31,.82,.33,.27,ivory)
ell('Shelf pedestal',(-.66,.11,.282),(.108,.115,.18),ivory)
for i in range(2):
    box('Door reveal',(.10+i*.385,-.411,.286),(.381,.009,.30),edge,.008)
    box('Flush cupboard door',(.10+i*.385,-.418,.286),(.376,.009,.295),ivory,.008)
ell('Cabinet lock',(.325,-.426,.335),(.007,.003,.007),steel)
slab('Capsule counter',0,0,.448,1.96,.89,.061,.32,ivory)
slab('Robot demonstration tray',-.20,-.007,.509,1.42,.80,.021,.27,stone)
slab('Literature tray',.695,-.025,.509,.43,.68,.018,.046,paper)

base=.53
def appliance(cx,body,rim):
    # Traverse the profile from the back cap to the entrance, then back along the
    # inside wall. The nose of the globe tips forward under the entrance.
    zc=base+.449
    def ring(name,profile,mat,N=72):
        verts=[];faces=[]
        for depth,radius,height in profile:
            for j in range(N):
                a=tau*j/N
                verts.append((cx+radius*cos(a),depth+.27*height*sin(a),zc+height*sin(a)))
        for k in range(len(profile)-1):
            for j in range(N):
                q=k*N+j;n=k*N+(j+1)%N;faces.append((q,n,n+N,q+N))
        # rings advance towards customer (-Y); outward winding in XZ plane
        return mesh(name,verts,faces,mat,True)
    ring('Rear moulded hood',[(.316,.002,.002),(.308,.078,.08),(.28,.147,.14),(.237,.202,.19),(.162,.251,.243),(.068,.275,.275),(.002,.279,.286),(-.035,.278,.286)],body)
    ring('Hood joint',[(-.035,.278,.286),(-.039,.277,.285),(-.043,.278,.286)],dark)
    ring('Front bonnet',[(-.043,.278,.286),(-.124,.273,.279),(-.19,.264,.273),(-.222,.259,.267)],body)
    ring('Rolled bezel',[(-.222,.259,.267),(-.232,.256,.265),(-.242,.248,.258),(-.246,.216,.221),(-.244,.205,.21),(-.234,.201,.207)],rim)
    ring('Entry seal',[(-.234,.201,.207),(-.223,.20,.205),(-.211,.203,.209)],dark)
    ring('Concave rotating globe',[(-.211,.203,.209),(-.15,.218,.218),(-.07,.232,.228),(.023,.23,.225),(.112,.208,.20),(.178,.168,.164),(.218,.119,.114),(.246,.065,.063),(.252,.001,.001)],liner)
    # Litter surface and a black perforated screen curved over the left inside wall.
    # Empty demonstration globe. The soft liner meets the septum across the back.
    line('Septum moulding',[(cx-.11,.131,zc+.162),(cx-.055,.181,zc+.105),
         (cx+.014,.223,zc+.037),(cx+.048,.216,zc-.013)],.0045,liner)
    verts=[];faces=[]
    def grid(u,v):
        return (cx-.180+.167*u,.057+.112*u-.019*v,zc+.060-.096*u+.083*v)
    for row in range(8):
        for col in range(30):
            u,v=col/30,row/8
            if col<abs(row-4) or col>29-abs(row-4):continue
            k=len(verts)
            for a,b in [(0,0),(1,0),(1,1),(0,1),(.18,.17),(.82,.17),(.82,.83),(.18,.83)]:
                verts.append(grid(u+a/30,v+b/8))
            for j in range(4):faces.append(tuple(k+i for i in (j,(j+1)%4,4+(j+1)%4,4+j)))
    mesh('Perforated sifting grille',verts,faces,sieve)
    ell('Globe rear hub',(cx+.047,.217,zc-.055),(.042,.022,.042),liner)
    # Curved snap-on lower fence, following the bezel in X and rising at each end.
    verts=[];faces=[]
    for i in range(41):
        t=-1+i/20;x=.184*t;bottom=-.205*sqrt(1-(x/.205)**2)
        for depth,h in [(-.245,bottom),(-.252,-.133+.049*t*t),(-.245,-.130+.049*t*t),(-.237,bottom)]:
            verts.append((cx+x,depth+.27*h,zc+h))
        if i:
            for j in range(4):
                a=(i-1)*4+j;b=(i-1)*4+(j+1)%4;faces.append((a,b,b+4,a+4))
    mesh('Curved litter fence',verts,faces,rim,True)
    tier('Waste drawer',cx,.02,[(base,.351,.416,.10),(base+.017,.37,.432,.105),(base+.095,.394,.479,.119),(base+.176,.417,.492,.13)],body)
    tier('Base split line',cx,.021,[(base+.174,.417,.493,.13),(base+.18,.419,.494,.13)],dark)
    tier('Globe saddle',cx,.02,[(base+.18,.42,.494,.13),(base+.201,.436,.50,.13),(base+.211,.445,.48,.14)],body)
    slab('Step carrier',cx,-.205,base+.107,.315,.247,.047,.084,body)
    slab('Elastomer step',cx,-.211,base+.15,.31,.245,.018,.083,dark)
    for j in range(11):
        yy=-.302+.016*j
        half=.14-.035*((j-5)/5)**2
        pts=[(cx+half*t,yy+.010*(1-t*t),base+.169) for t in [-1,-.7,-.35,0,.35,.7,1]]
        line('Curved step tread',pts,.0024,liner)
    for j in [-1,0,1]:
        a=pi/2+j*.146
        ell('Recessed curtain sensor',(cx+.214*cos(a),-.247+.27*.216*sin(a),zc+.216*sin(a)),(.009,.005,.004),lens)
    # Control pad follows upper-right crown, visible from the side and from above.
    ang=radians(51)
    p=Vector((cx+.275*cos(ang),-.061,zc+.285*sin(ang)))
    pad=box('Control membrane',p,(.058,.112,.0045),trim,.002)
    pad.rotation_euler.y=pi/2-ang
    for i in range(5):
        py=p.y-.041+.02*i
        mark=ell('Control key',(p.x+.002,py,p.z+.002),(.004,.004,.002),pearl)
        mark.rotation_euler.y=pad.rotation_euler.y
    for i in range(5):
        bar=box('Segmented status light',(p.x+.016,p.y-.038+.019*i,p.z-.007),(.006,.016,.004),led,.001)
        bar.rotation_euler.y=pad.rotation_euler.y
    # The bonnet hinge is a round, stepped black boss on the rear.
    ell('Rear hinge cover',(cx,.274,zc-.125),(.092,.042,.087),body)
    ell('Hinge centre',(cx,.308,zc-.125),(.054,.026,.047),trim)
    box('Rear hinge catch',(cx,.333,zc-.13),(.055,.009,.011),rim,.002)
    # Rear bezel latch and hood seam on each side.
    for side in (-1,1):
        ell('Side latch',(cx+side*.271,.036,zc),(.005,.026,.013),rim)

appliance(-.578,graphite,trim)
appliance(.047,white,pearl)

# Small seated calico counter figurine between the two units.
cx,cy=-.264,-.316
ell('Figurine haunch',(cx,cy+.014,.57),(.035,.034,.048),white)
ell('Figurine chest',(cx,cy-.005,.593),(.025,.023,.045),white)
ell('Figurine head',(cx,cy-.012,.627),(.029,.024,.025),white)
for side in (-1,1):
    x=cx+side*.018
    mesh('Figurine pointed ear',[(x-.009,cy-.025,.640),(x+.009,cy-.025,.640),(x+side*.004,cy-.012,.659),(x,cy+.001,.638)],[(0,1,2),(2,1,3),(0,2,3),(0,3,1)],ginger if side>0 else grey)
    ell('Figurine eyes',(cx+side*.011,cy-.034,.629),(.003,.0016,.002),lens)
    ell('Figurine front paw',(cx+side*.014,cy-.018,.549),(.010,.016,.016),white)
ell('Calico flank',(cx-.024,cy+.007,.576),(.012,.019,.025),ginger)
line('Curled tail',[(cx+.016,cy+.015,.56),(cx+.046,cy+.013,.545),(cx+.052,cy-.008,.546),(cx+.044,cy-.019,.55)],.007,grey)

# Framed vertical screen: a drawn miniature of the front bezel on the blue panel.
box('Screen foot',(.682,.082,.539),(.351,.27,.028),ivory)
box('Portrait screen enclosure',(.682,.113,.834),(.346,.085,.586),white,.012)
box('Portrait screen glass',(.682,.068,.845),(.269,.007,.453),lens,.002)
box('Product blue field',(.682,.062,.829),(.24,.003,.302),blue,.001)
label('Display headline','고양이 자동 화장실',.682,.058,1.038,.223,pale,True)
label('Display maker','Litter-Robot',.682,.058,.652,.143,paper)
ell('Screen illustration pedestal',(.682,.058,.79),(.043,.004,.058),pale)
ell('Screen illustration globe',(.682,.053,.85),(.067,.004,.071),paper)
ell('Screen illustration entry',(.682,.049,.85),(.050,.004,.052),ink)
box('Screen illustration step',(.682,.05,.775),(.077,.008,.015),ink,.004)
for i,mat in enumerate((paper,pale,paper)):
    yy=-.23+.044*i
    h=.109+.048*i
    box('Folded product brochure',(.695,yy,.533+h/2),(.179,.015,h),mat,.002)
    box('Brochure blue illustration',(.695,yy-.009,.543+h*.40),(.153,.002,h*.54),blue,.001)
    label('Brochure mark','Litter-Robot',.695,yy-.0105,.53+h*.88,.11,ink)
for x in (.595,.795):
    line('Literature holder side',[(x,-.256,.545),(x,-.256,.59),(x,-.160,.677)],.0028,steel)
box('Literature rack lip',(.695,-.257,.555),(.209,.012,.035),stone,.003)

# Light tile with dark square inlays around the opening-event demonstration stand.
tile=paint('Honed limestone','e3ddcf')
inlay=paint('Dark stone inlay','746e66')
def square(name,x,y,z,size,material):
    d=size/2
    mesh(name,[(x-d,y-d,z),(x+d,y-d,z),(x+d,y+d,z),(x-d,y+d,z)],[(0,1,2,3)],material)
for i in range(7):
    for j in range(5):
        x=(i-3)*.38;y=(j-2)*.38
        square('Limestone tile',x,y,.046,.378,tile)
        if (i+j)%2==0:
            square('Stone inlay',x+.070,y+.070,.047,.128,inlay)

# The branch opening photo shows a pale back panel carrying this wordmark.
box('Exhibit back panel',(0,.81,.74),(2.17,.075,1.48),stone,.022)
box('Raised ivory facing',(0,.767,.95),(2.14,.019,.99),ivory,.007)
label('Branch fascia','litter-robot',0,.753,1.314,.75,ink)
label('Branch co-brand','LAURASTAR',-.79,.754,1.32,.36,ink)
# All native components stay separate. Consolidate only in the runtime copy.
for o in list(collection.objects):
    if o.type in ('FONT','CURVE'):
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True);bpy.context.view_layer.objects.active=o
        bpy.ops.object.convert(target='MESH')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/'boutique.blend'),compress=True)
exporter=out/'export.py'
exec(compile(exporter.read_text(),str(exporter),'exec'),{'__file__':str(exporter)})
