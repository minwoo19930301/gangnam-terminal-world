"""Author Hessed's editable bag patterns and the two entrance displays in metres."""
from math import cos, sin, pi
from pathlib import Path
from mathutils import Vector, Euler
import bpy
import runpy

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.preferences.filepaths.save_version = 0

# Front of the shop faces -Y in Blender. A shopper looking in from the passage sees +X to their right.
palette = {
    'ink':'#292832','carbon':'#38373f','navy':'#35445a','denim':'#50637a','port':'#703e52',
    'oxblood':'#733c3d','forest':'#476054','sand':'#b19a83','camel':'#a47754','tobacco':'#815341',
    'cream':'#e2d3b6','plum':'#8c657d','rose':'#b78b86','brick':'#a44b4c','blue':'#637890',
    'lining':'#494149','edge':'#54454a','stitch':'#ad9f91','zip':'#a89f91','brass':'#bd9a61',
    'glint':'#dfc896','satin':'#a0a4a7','wire':'#55585c','shelf':'#4c474b','rail':'#47424a',
    'wall':'#ddcbb4','warm':'#b49c7d','card':'#ece8d9','accent':'#bc7591',
}
materials = {}
for name, hex_code in palette.items():
    srgb = [int(hex_code[k:k+2],16)/255 for k in (1,3,5)]
    rgb = [v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in srgb]
    mat=bpy.data.materials.new(name);mat.diffuse_color=(*rgb,1)
    mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=(*rgb,1)
    metal=name in ('brass','glint','satin','wire','zip')
    shader.inputs['Metallic'].default_value=.77 if metal else 0
    shader.inputs['Roughness'].default_value=.32 if metal else (.56 if name in ('ink','tobacco','port','forest') else .72)
    materials[name]=mat

root=bpy.data.collections.new('HessedShop')
bpy.context.scene.collection.children.link(root)
root['origin']=[0,0,0]
def group(name):
    c=bpy.data.collections.new(name);root.children.link(c);return c
frames,foreground,upper,interior=[group(n) for n in ['Steel rails and shelves','Street-facing displays','Bags over the entrance','Interior bag shelves']]


class Form:
    def __init__(self):
        self.vertices=[];self.faces=[];self.colors=[];self.coarse=[]
        self.keep=True

    def add(self, verts, faces, color):
        start=len(self.vertices);self.vertices.extend(tuple(p) for p in verts)
        for face in faces:
            self.faces.append(tuple(start+i for i in face))
            self.colors.append(color);self.coarse.append(self.keep)

    def box(self,x,d,z,w,l,h,color):
        a,b,c=w/2,l/2,h/2
        vs=[(x+i*a,d+j*b,z+k*c) for k in (-1,1) for j in (-1,1) for i in (-1,1)]
        self.add(vs,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)],color)

    def panel(self,poly,d,thick,color):
        n=len(poly)
        if not thick:
            self.add([(x,d,z) for x,z in poly],[tuple(range(n))],color);return
        vs=[(x,d,z) for x,z in poly]+[(x,d+thick,z) for x,z in poly]
        self.add(vs,[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,n+i,n+(i+1)%n,(i+1)%n) for i in range(n)],color)

    def pipe(self,points,r,color,sides=6):
        xs=[Vector(p) for p in points]
        vs=[];previous=None
        for i,p in enumerate(xs):
            axis=(xs[min(i+1,len(xs)-1)]-xs[max(0,i-1)]).normalized()
            u=(previous-axis*axis.dot(previous)).normalized() if previous is not None else axis.cross(Vector((0,1,0)) if abs(axis.y)<.85 else Vector((1,0,0))).normalized()
            v=axis.cross(u);previous=u
            for j in range(sides):
                t=j*2*pi/sides;vs.append(p+r*(cos(t)*u+sin(t)*v))
        n=len(xs);faces=[tuple(reversed(range(sides))),tuple(range((n-1)*sides,n*sides))]
        faces += [(i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+(j+1)%sides,(i+1)*sides+j) for i in range(n-1) for j in range(sides)]
        self.add(vs,faces,color)

    def band(self,points,width,thickness,color):
        vs=[]
        for i,(x,d,z) in enumerate(points):
            a,b=points[max(0,i-1)],points[min(i+1,len(points)-1)]
            tangent=Vector((b[0]-a[0],b[2]-a[2])).normalized()
            nx,nz=-tangent[1]*width/2,tangent[0]*width/2
            vs.extend([(x+nx,d,z+nz),(x-nx,d,z-nz),(x-nx,d+thickness,z-nz),(x+nx,d+thickness,z+nz)])
        faces=[(3,2,1,0),tuple(range(len(vs)-4,len(vs)))]
        for i in range(len(points)-1):
            faces.extend((4*i+j,4*i+(j+1)%4,4*(i+1)+(j+1)%4,4*(i+1)+j) for j in range(4))
        self.add(vs,faces,color)

    def loop(self,x,d,z,rx,rz,r,color,n=12):
        self.pipe([(x+rx*cos(2*pi*i/n),d,z+rz*sin(2*pi*i/n)) for i in range(n+1)],r,color,5)

    def stitches(self,points,color):
        # Thin strips sit on the face of the raised seam so no back faces are required.
        for a,b in zip(points,points[1:]):
            a=Vector(a);b=Vector(b);dist=(b-a).length
            steps=max(1,round(dist/.018))
            for i in range(steps):
                p=a.lerp(b,(i+.15)/steps);q=a.lerp(b,(i+.75)/steps)
                dx,dz=q.x-p.x,q.z-p.z;mag=(dx*dx+dz*dz)**.5
                if mag<.0001:continue
                nx,nz=-dz*.0012/mag,dx*.0012/mag
                self.add([(p.x+nx,p.y,p.z+nz),(p.x-nx,p.y,p.z-nz),(q.x-nx,q.y,q.z-nz),(q.x+nx,q.y,q.z+nz)],[(0,1,2,3)],color)

    def mesh(self,name):
        data=bpy.data.meshes.new(name)
        data.from_pydata(self.vertices,[],self.faces)
        colors=list(dict.fromkeys(self.colors))
        for color in colors:data.materials.append(materials[color])
        for poly,color in zip(data.polygons,self.colors):
            poly.material_index=colors.index(color)
        lod=data.attributes.new(name='distant',type='BOOLEAN',domain='FACE')
        lod.data.foreach_set('value',self.coarse)
        data.update();return data


def place(mesh,collection,name,x,d,z,scale=1,angle=0):
    o=bpy.data.objects.new(name,mesh);collection.objects.link(o)
    o.location=(x,d,z);o.rotation_euler[2]=angle
    o.scale=(scale,)*3 if isinstance(scale,(int,float)) else scale
    return o


def signed(value,power):
    return (1 if value>=0 else -1)*abs(value)**power


def bag_body(s,profile,color,open_top=False,n=18):
    # Every horizontal section has its own width, depth and centre: a filled tuck at the
    # bottom, rounded gussets at the side and shoulders narrowing above the zip.
    rings=[]
    for z,w,depth,centre in profile:
        ring=[(w*signed(cos(t*2*pi/n),.62)/2,centre+depth*signed(sin(t*2*pi/n),.62)/2,z) for t in range(n)]
        rings.append(ring)
    verts=[p for ring in rings for p in ring]
    faces=[tuple(reversed(range(n)))]
    for j in range(len(rings)-1):
        faces.extend((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n))
    if not open_top:faces.append(tuple(range((len(rings)-1)*n,len(rings)*n)))
    s.add(verts,faces,color)
    if open_top:
        lip=rings[-1];well=[(x*.93,d*.8,z-.047) for x,d,z in lip]
        s.add(lip+well,[tuple(range(n,2*n))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)],'lining')
        s.pipe(lip+[lip[0]],.0038,'edge',5)


def zip_line(s,points):
    s.band(points,.009,.002,'edge')
    s.stitches([(x,d-.001,z) for x,d,z in points],'zip')
    x,d,z=points[-1];s.loop(x,d-.004,z-.012,.0045,.011,.0018,'brass',8)
    s.band([(x,d-.004,z-.019),(x+.009,d-.007,z-.047)],.006,.002,'edge')


def buckle(s,x,d,z,w,h):
    outline=[(x-w/2,d,z-h/2),(x+w/2,d,z-h/2),(x+w/2,d,z+h/2),(x-w/2,d,z+h/2),(x-w/2,d,z-h/2)]
    s.pipe(outline,.0026,'brass',5)
    s.pipe([(x,d-.001,z-h/2),(x+.002,d-.003,z+h*.18)],.0017,'glint',5)


def backpack(color):
    s=Form()
    bag_body(s,[(0,.205,.095,0),(.024,.263,.132,0),(.11,.285,.152,0),(.247,.272,.147,.003),(.318,.224,.117,.008),(.366,.125,.068,.018),(.375,.071,.043,.021)],color)
    s.pipe([(-.041,.011,.346),(-.045,.018,.388),(-.029,.024,.41),(0,.026,.417),(.032,.024,.406),(.046,.021,.385),(.04,.016,.347)],.009,'edge')
    s.keep=False
    # Convex stitched front pocket with its own depth.
    pocket=[(-.105,.044),(-.115,.063),(-.11,.137),(-.086,.155),(.075,.159),(.105,.145),(.113,.071),(.101,.044)]
    s.panel(list(reversed(pocket)),-.089,.034,color)
    seam=[(x,-.092,z) for x,z in pocket+[pocket[0]]];s.pipe(seam,.0028,'edge',5)
    zip_line(s,[(-.095,-.092,.138),(-.033,-.095,.143),(.038,-.095,.144),(.095,-.091,.138)])
    zip_line(s,[(-.122,-.055,.190),(-.108,-.06,.271),(-.072,-.056,.315),(0,-.047,.337),(.066,-.056,.32),(.103,-.06,.278),(.119,-.06,.211)])
    s.stitches([(x,-.091,z+.005) for x,z in pocket[:3]],'stitch')
    s.box(0,-.069,.237,.034,.004,.012,'brass')
    if color in ('navy','port','denim'):
        # Removable leather luggage tab with a punched eyelet, attached to the front zip.
        s.loop(.085,-.093,.130,.0065,.010,.002,'brass',8)
        s.panel([(.076,.117),(.087,.122),(.098,.114),(.099,.070),(.089,.065),(.078,.073)],-.094,.005,'tobacco' if color=='denim' else 'sand')
        s.loop(.087,-.095,.114,.0025,.0025,.0013,'glint',7)
        s.stitches([(.079,-.096,.107),(.081,-.096,.079),(.094,-.096,.075)],'cream')
    for side in [-1,1]:
        s.band([(side*.056,.051,.338),(side*.085,.093,.288),(side*.102,.11,.173),(side*.104,.08,.074)],.021,.008,color)
    return s


def tote(color,pattern=False):
    s=Form()
    bag_body(s,[(0,.249,.099,0),(.020,.307,.126,0),(.115,.326,.136,0),(.212,.335,.12,0),(.287,.351,.083,0)],color,True)
    for d in [.038,-.052]:
        handle=[(-.100,d,.25),(-.10,d,.321),(-.086,d,.392),(-.061,d,.437),(-.029,d,.458),(0,d,.465),(.037,d,.456),(.069,d,.432),(.091,d,.39),(.101,d,.324),(.100,d,.25)]
        s.band(handle,.016,.006,'edge' if pattern else color)
    s.keep=False
    for x in [-.102,.102]:
        s.box(x,-.054,.256,.024,.008,.059,'edge')
        s.loop(x,-.059,.235,.003,.003,.0018,'brass',7)
    if pattern:
        for row in range(3):
            for col in range(5):
                x=-.116+col*.058+(row%2)*.008;z=.068+row*.063
                d=-.068 if row<2 else -.062
                s.panel([(x,z-.025),(x+.020,z),(x,z+.025),(x-.020,z)],d-.002,0,'cream' if (col+row)%2==0 else 'rose')
    else:
        s.stitches([(-.136,-.052,.035),(-.146,-.066,.12),(-.148,-.056,.22)],'stitch')
        s.stitches([(.136,-.052,.035),(.146,-.066,.12),(.148,-.056,.22)],'stitch')
        s.panel([(-.033,.148),(.032,.148),(.032,.163),(-.033,.163)],-.07,0,'edge')
    return s


def shoulder(color):
    s=Form()
    bag_body(s,[(0,.190,.075,0),(.019,.238,.106,0),(.057,.282,.122,0),(.135,.292,.122,0),(.201,.27,.082,.004),(.211,.240,.066,.004)],color)
    path=[(-.126,-.016,.203),(-.139,-.018,.263),(-.132,-.008,.36),(-.110,-.001,.455),(-.071,.002,.515),(-.027,.005,.551),(.010,.007,.559),(.054,.008,.544),(.094,.01,.499),(.122,.009,.421),(.143,.008,.308),(.132,.006,.215)]
    s.band(path,.016,.005,color)
    s.keep=False
    for x in [-.13,.13]:
        s.loop(x,-.013,.215,.009,.013,.0026,'brass',9)
    flap=[(-.127,.197),(-.129,.155),(-.117,.125),(-.083,.105),(-.032,.091),(0,.087),(.049,.096),(.098,.115),(.119,.137),(.131,.158),(.128,.197)]
    s.panel(flap,-.064,.015,color)
    s.pipe([(x,-.066,z) for x,z in flap],.003,'edge',5)
    s.stitches([(x*.964,-.068,z+.006) for x,z in flap[1:-1]],'stitch')
    s.band([(0,-.071,.139),(0,-.074,.063)],.023,.005,'edge')
    buckle(s,0,-.078,.093,.031,.024)
    buckle(s,-.134,-.021,.313,.022,.033)
    for z in [.265,.279,.293]:
        s.box(-.137,-.022,z,.003,.002,.003,'lining')
    return s


def hobo(color):
    s=Form()
    # The sides sweep up into the strap, leaving a scooped neckline over a soft body.
    outline=[(-.158,.218),(-.155,.070),(-.135,.027),(-.080,.005),
             (.034,0),(.115,.022),(.154,.068),(.163,.222),(.145,.236),
             (.124,.184),(.084,.154),(.028,.14),(-.039,.139),(-.09,.155),(-.126,.184),(-.145,.236)]
    n=len(outline)
    front=[(x,-.054*(1-.65*(abs(x)/.17)**2),z) for x,z in outline]
    back=[(x,.054*(1-.65*(abs(x)/.17)**2),z) for x,z in outline]
    # Front and rear panels belly outward near the centre of the bag.
    vs=front+back+[(0,-.073,.083),(0,.073,.083)]
    faces=[(i,(i+1)%n,2*n) for i in range(n)]+[(n+(i+1)%n,n+i,2*n+1) for i in range(n)]
    faces += [(i,n+i,n+(i+1)%n,(i+1)%n) for i in range(n)]
    s.add(vs,faces,color)
    path=[(-.151,-.018,.207),(-.157,-.016,.267),(-.140,-.006,.351),(-.091,.001,.422),
          (-.03,.005,.46),(.028,.006,.459),(.086,.006,.424),(.131,.005,.354),(.153,0,.267),(.153,-.006,.215)]
    s.band(path,.025,.006,color)
    s.keep=False
    for side in [-1,1]:
        s.loop(side*.152,-.018,.224,.012,.014,.0025,'brass',10)
        s.stitches([(side*.137,-.026,.184),(side*.115,-.045,.104),(side*.086,-.051,.051)],'stitch')
    s.pipe(front[8:]+[front[0]],.0028,'edge',6)
    buckle(s,-.144,-.018,.303,.031,.025)
    return s


def clutch(color):
    s=Form()
    bag_body(s,[(0,.178,.056,0),(.014,.216,.08,0),(.098,.227,.067,.004),(.148,.192,.042,.003),(.154,.174,.024,.002)],color)
    s.keep=False
    zip_line(s,[(-.099,-.018,.146),(-.060,-.019,.157),(.008,-.018,.159),(.069,-.016,.157),(.098,-.017,.147)])
    s.band([(.091,0,.135),(.123,.004,.145),(.144,.006,.134),(.151,.007,.108),(.143,.006,.085),(.131,.003,.086),(.104,0,.127)],.005,.002,'edge')
    s.box(-.004,-.036,.08,.030,.003,.01,'brass')
    if color in ('navy','forest','rose'):
        # Several front-row pouches in the public photograph have a light circular swing tag.
        s.pipe([(.078,-.019,.146),(.067,-.048,.128),(.042,-.050,.109)],.0018,'stitch',5)
        cx,d,z=.039,-.051,.094
        shape=[(cx+.020*cos(k*2*pi/14),z+.019*sin(k*2*pi/14)) for k in range(14)]
        s.panel(shape,d,.0015,'card')
        s.panel([(cx-.011,z-.003),(cx+.009,z-.003),(cx+.009,z+.001),(cx-.011,z+.001)],d-.001,0,'brick')
        s.panel([(cx-.008,z+.003),(cx+.006,z+.003),(cx+.006,z+.005),(cx-.008,z+.005)],d-.001,0,'wire')
    return s


def shop_frame():
    s=Form()
    # Two mobile display rails leave a continuous passage between them.
    for x in [-.91,.91]:
        for dx in [-.385,.385]:
            for d in [.16,.64]:
                s.pipe([(x+dx,d,.082),(x+dx,d,.883)],.013,'wire',7)
                s.pipe([(x+dx-.013,d,.043),(x+dx+.013,d,.043)],.040,'ink',9)
            s.pipe([(x+dx,.15,.105),(x+dx,.65,.105)],.012,'satin',6)
        s.box(x,.400,.851,.794,.515,.039,'shelf')
        s.pipe([(x-.413,.13,.741),(x+.413,.13,.741)],.012,'satin',8)
        s.pipe([(x-.405,.14,.129),(x+.405,.14,.129)],.014,'rail',6)
        s.pipe([(x-.405,.63,.129),(x+.405,.63,.129)],.014,'rail',6)
    for side in [-1,1]:
        s.pipe([(side*1.28,.43,1.82),(side*.58,.43,1.82)],.009,'satin',7)
    for x in [-1.283,1.283]:
        for d in [.28,1.75,3.53]:
            s.box(x,d,1.23,.029,.041,2.46,'satin')
        for h in [.70,1.42,2.06]:
            s.box(x*.91,2.02,h,.205,2.95,.023,'shelf')
            s.pipe([(x*.855,.62,h+.16),(x*.855,3.46,h+.16)],.008,'satin',6)
    for h in [.31,1.04,1.76]:
        s.box(0,3.56,h,2.53,.35,.025,'shelf')
        s.pipe([(-1.23,3.37,h+.39),(1.23,3.37,h+.39)],.009,'satin',6)
    s.pipe([(-1.29,.23,2.52),(1.29,.23,2.52)],.022,'satin',8)
    for x in [-1.26,1.26]:
        s.pipe([(x,.23,2.52),(x,.23,2.65)],.015,'satin',7)
    return s.mesh('Painted display rails and wall shelves')


geometry={}
def stock(style,col,where,x,d,z,scale=1,angle=0,pattern=False):
    key=(style,col,pattern)
    if key not in geometry:
        design=tote(col,pattern) if style=='tote' else {'backpack':backpack,'shoulder':shoulder,'hobo':hobo,'clutch':clutch}[style](col)
        geometry[key]=design.mesh(style.title()+' · '+col+(' diamond' if pattern else ''))
    obj=place(geometry[key],where,geometry[key].name,x,d,z,scale,angle)
    obj['pattern']=style
    return obj


place(shop_frame(),frames,'Pair of wheeled entrance rails and stepped wall shelves',0,0,0)
hooks=Form()
def hook(x,d,z,drop):
    # Lower hook opens upward and supports the stock by its handle or adjustable shoulder strap.
    hooks.pipe([(x,d,z+.007),(x-.012,d-.01,z+.016),(x-.022,d-.012,z+.002),
                (x-.013,d-.013,z-.023),(x,d-.014,z-.03),(x,d-.030,z-drop+.008),
                (x+.013,d-.045,z-drop),(x+.022,d-.052,z-drop+.012)],.0033,'satin',5)

for i,(col,h) in enumerate([('port',.015),('navy',.004),('denim',.016)]):
    x=-1.188+i*.273
    stock('backpack',col,foreground,x,.094,.23+h,.85,(-.06,.04,-.08)[i])
    hook(x,.13,.741,.741-(.23+h+.417*.85))
for i,col in enumerate(['forest','ink','tobacco']):
    x=.626+i*.266
    style='hobo' if i==1 else 'shoulder'
    height=.46 if style=='hobo' else .558
    z=.697-height*.89
    stock(style,col,foreground,x,.094,z,.89,(-.08,.10,-.06)[i])
    hook(x,.13,.741,.741-(z+height*.89))
for side in [-1,1]:
    for i,col in enumerate((['navy','rose','ink'] if side==-1 else ['tobacco','denim','forest'])):
        stock('clutch',col,foreground,side*.91+(i-1)*.242,.22,.878,1.03,[-.09,.04,.11][i])
stock('tote','sand',foreground,-1.17,.56,.881,.80,-.21)
stock('hobo','tobacco',foreground,1.02,.56,.876,.87,.15)
stock('tote','brick',foreground,-.92,.66,1.285,.93,.08,pattern=True)
for x,style,col in [(-1.12,'shoulder','navy'),(-.635,'clutch','forest'),(.61,'clutch','port'),(.92,'hobo','tobacco'),(1.19,'clutch','navy')]:
    scale=.77 if style=='shoulder' else .83
    h={'shoulder':.558,'hobo':.46,'clutch':.154}[style]
    drop=.12 if style=='clutch' else .036
    stock(style,col,foreground,x,.401,1.82-drop-h*scale,scale,(x+.05)*.10)
    hook(x,.43,1.82,drop)
accent=Form()
accent.pipe([(-1.28,.68,1.747),(-.93,.68,1.747)],.009,'satin',6)
place(accent.mesh('Cantilever'),frames,'Wall arm for the patterned tote',0,0,0)
hook(-.92,.68,1.747,.028)

# The public shop photograph shows a line of dark backpacks hung high above the entrance.
for x,style,col,scale in [(-1.13,'tote','ink',.94),(-.68,'backpack','denim',.93),(-.28,'backpack','port',.91),
                          (.10,'backpack','ink',.95),(.48,'backpack','navy',.90),(.83,'backpack','forest',.89),(1.15,'tote','ink',.78)]:
    height=.465 if style=='tote' else .417
    z=2.48-height*scale
    stock(style,col,upper,x,.22,z,scale,.05 if x>0 else -.07)
    hook(x,.23,2.52,2.52-(z+height*scale))

# The exact arrangement deeper into the store is illustrative. The source confirms shelves on both sides.
for j,h in enumerate([.325,1.055,1.775]):
    for i in range(7):
        x=-1.085+i*.36
        style=['shoulder','tote','backpack','clutch'][(i+2*j)%4]
        col=['ink','tobacco','navy','sand','forest','port'][(i+3*j)%6]
        stock(style,col,interior,x,3.55,h,.84 if style=='shoulder' else .91,(i%3-1)*.06)
for side in [-1,1]:
    for j,h in enumerate([.716,1.436]):
        for i in range(5):
            d=.97+i*.53
            style=['tote','shoulder','hobo','clutch','backpack'][(j+i+(side>0))%5]
            col=['navy','brick','ink','sand','rose','forest'][(i+2*j+(side>0))%6]
            stock(style,col,interior,side*1.19,d,h,.84,side*-pi/2)
place(hooks.mesh('Individual S-hooks'),frames,'S-hooks supporting handles and straps',0,0,0)
for screen in bpy.data.screens:
    for a in screen.areas:
        if a.type=='VIEW_3D':
            s=a.spaces.active;s.region_3d.view_distance=5.6;s.region_3d.view_location=(0,1.20,1.35)
            s.region_3d.view_rotation=Euler((pi*.49,0,0)).to_quaternion()
            s.shading.color_type='MATERIAL';s.overlay.show_overlays=False
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'hessed.blend'),compress=True)
runpy.run_path(str(directory/'export.py'),run_name='__main__')
