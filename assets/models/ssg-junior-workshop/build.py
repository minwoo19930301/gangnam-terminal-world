"""Build the editable IQBOX play corner and its single vertex-colour draw."""
import bpy
from math import cos, sin, pi, sqrt
from pathlib import Path
from mathutils import Vector
import sys

OUT = Path(__file__).resolve().parent
sys.dont_write_bytecode=True;sys.path.insert(0,str(OUT))
import print_surfaces as surface
import velocita
import kitchen_details
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_10F_IQBOX')
scene.collection.children.link(collection)
colors = dict(cream='fff6e3', ivory='f7f6ef', ply='e1b983', honey='bc8854',
              groove='ad774b', forest='146448', grass='8dc759', leaf='4aab5d',
              pond='53b9ce', red='de332d', wine='94362b', amber='ffb825',
              black='293236', steel='8e9695', glass='385866', gold='b79956',
              blue='33759e', sky='b9d9df', orange='f59042', skin='f4c797',
              lorenzoBlue='075F9F',paintWhite='F3F1E9',rubber='26272B',hub='D9DEDC',chrome='B9C2CC',
              visor='202329',air='111B28', turquoise='37999F', enamel='E6E9E2',softRed='D4353F', kitchenGlass='A4BDC1', print='FFFFFF')
materials = {}
for key, value in colors.items():
    srgb = [int(value[i:i+2],16)/255 for i in (0,2,4)]
    rgba = tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in srgb)+(1,)
    mat = bpy.data.materials.new(key)
    mat.diffuse_color = rgba
    mat.use_nodes=True
    bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=rgba
    kind='plated' if key in ('hub','chrome','steel') else ('paint' if key in ('lorenzoBlue','paintWhite','visor','turquoise','enamel','softRed') else ('rubber' if key in ('rubber','black') else 'matte'))
    mat['surfaceKind']=kind
    bs.inputs['Metallic'].default_value=.67 if kind=='plated' else 0
    bs.inputs['Roughness'].default_value={'plated':.20,'paint':.23,'rubber':.69,'matte':.50}[kind]
    if key=='chrome':
        bs.inputs['Metallic'].default_value=.94;bs.inputs['Roughness'].default_value=.11
    if kind=='paint':bs.inputs['Clearcoat'].default_value=.23
    materials[key] = mat
images=surface.construct(OUT)
surface.mapped(materials['print'],images)

def part(name, vertices, faces, color):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name,mesh)
    collection.objects.link(obj)
    mesh.materials.append(materials[color])
    return obj

def rings(name, rows, color, cap=True):
    width=len(rows[0])
    faces=[(j*width+i,j*width+(i+1)%width,(j+1)*width+(i+1)%width,(j+1)*width+i)
           for j in range(len(rows)-1) for i in range(width)]
    if cap:
        faces += [tuple(reversed(range(width))),tuple(range((len(rows)-1)*width,len(rows)*width))]
    return part(name,[v for row in rows for v in row],faces,color)

def box(name,x,y,z,w,d,h,color,ch=.002):
    r=min(ch,w*.2,d*.2,h*.2)
    outline=[(-w/2+r,-d/2),(w/2-r,-d/2),(w/2,-d/2+r),(w/2,d/2-r),
             (w/2-r,d/2),(-w/2+r,d/2),(-w/2,d/2-r),(-w/2,-d/2+r)]
    return rings(name,[[(x+a,y+b,z+c) for a,b in outline] for c in [0,h]],color)

def tube(name, points, radius, color, n=10):
    points=list(map(Vector,points))
    rows=[]
    for i,p in enumerate(points):
        tangent=(points[min(i+1,len(points)-1)]-points[max(i-1,0)]).normalized()
        u=tangent.cross(Vector((0,1,0)) if abs(tangent.y)<.9 else Vector((0,0,1))).normalized()
        v=tangent.cross(u)
        rows.append([tuple(p+radius*(u*cos(2*pi*k/n)+v*sin(2*pi*k/n))) for k in range(n)])
    return rings(name,rows,color)

def label(body,x,y,z,size,color):
    curve=bpy.data.curves.new(body,'FONT')
    curve.body=body
    curve.size=size
    curve.align_x='CENTER'
    curve.resolution_u=4
    obj=bpy.data.objects.new(body,curve)
    collection.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    text=bpy.data.objects.new(body,mesh)
    collection.objects.link(text)
    text.matrix_world=obj.matrix_world.copy()
    mesh.materials.append(materials[color])
    bpy.data.objects.remove(obj,do_unlink=True)

# Green tubular sled legs, shelf and printed landscape under the railway.
for x in [-.64,.64]:
    tube('Bent trestle',[(x,-.36,.635),(x,-.42,.07),(x,-.40,.035),
                        (x,.40,.035),(x,.42,.07),(x,.36,.635)],.020,'forest')
box('Play table apron',0,0,.56,1.52,.96,.085,'ivory',.025)
box('Landscape mat',0,0,.645,1.485,.928,.009,'grass')
surface.board('Branch railway landscape print',(0,0,.6547),(1,0,0),(0,1,0),1.481,.927,'ground',part)
for y in [-.473,.473]:
    box('Raised white rim',0,y,.645,1.51,.015,.018,'ivory')
for x in [-.747,.747]:
    box('Raised white rim',x,0,.645,.015,.94,.018,'ivory')
box('Storage bin',0,0,.24,.89,.54,.19,'forest',.04)
label('BRIO',0,-.271,.30,.112,'ivory')

# A swept beech roadbed. Two recessed channels are cut into its cross-section.
def track(name,points):
    profile=[(-.039,0),(.039,0),(.039,.016),(.026,.016),(.024,.011),
             (.018,.011),(.016,.016),(-.016,.016),(-.018,.011),(-.024,.011),
             (-.026,.016),(-.039,.016)]
    rows=[]
    for i,(x,y,z) in enumerate(points):
        a=points[max(0,i-1)];b=points[min(len(points)-1,i+1)]
        dx,dy=b[0]-a[0],b[1]-a[1];s=sqrt(dx*dx+dy*dy)
        rows.append([(x-dy/s*w,y+dx/s*w,z+h) for w,h in profile])
    obj=rings(name,rows,'ply')
    obj.data.materials.append(materials['groove'])
    for face in obj.data.polygons:
        if face.index<(len(rows)-1)*len(profile) and face.index%len(profile) in (3,4,8,9):
            face.material_index=1

base=.656
def straight(x1,y1,x2,y2,z1,z2):
    for i in range(4):
        ts=[(i+.003)/4,(i+.997)/4]
        track('Straight beech section',[(x1+(x2-x1)*t,y1+(y2-y1)*t,z1+(z2-z1)*t) for t in ts])
def turn(cx, start, z1,z2):
    for j in range(4):
        ts=[(j+.005+(k/8)*.99)/4 for k in range(9)]
        track('Curved beech section',[(cx+.21*cos(start+t*pi),.30*sin(start+t*pi),
              z1+(z2-z1)*(1-cos(t*pi))/2) for t in ts])
straight(-.436,-.30,.436,-.30,base,base)
turn(.436,-pi/2,base,base+.095)
straight(.436,.30,-.436,.30,base+.095,base+.095)
turn(-.436,pi/2,base+.095,base)
for x in [-.44,-.19,.19,.44]:
    box('Bridge pier',x,.30,base,.042,.09,.095,'honey')
for y in [.251,.349]:
    points=[(-.235+i*.47/20,y,base+.108+.14*sin(pi*i/20)) for i in range(21)]
    tube('Red bridge bow',points,.010,'red')
    tube('Bridge side girder',[(-.24,y,base+.106),(.24,y,base+.106)],.008,'wine')
    for i in [4,7,10,13,16]:
        x,_,z=points[i];tube('Arch upright',[(x,y,base+.109),(x,y,z)],.005,'red',8)
# Inner branch line bends toward the freight shed.
track('Branch line',[(t*.77-.48,-.30+.40*(1-cos(pi*t))/2,base+.001) for t in [i/28 for i in range(29)]])

def coach(x,y,z,paint,engine=False):
    # Rounded nose, transversely arched roof and separate magnetic buffers.
    for dx in [-.041,.041]:
        for side in [-1,1]:
            a=y+side*.026;b=y+side*.041
            tube('Running wheel',[(x+dx,a,z+.020),(x+dx,b,z+.020)],.019,'black',16)
            tube('Axle cap',[(x+dx,b,z+.020),(x+dx,b+side*.002,z+.020)],.008,'steel')
    box('Carriage underframe',x,y,z+.020,.133,.057,.015,'black')
    rows=[]
    for dx,k,h in [(-.071,.66,.76),(-.062,.93,.95),(-.047,1,1),(.048,1,1),(.065,.95,.91),(.071,.70,.74)]:
        section=[(-.034,0),(.034,0),(.034,.028),(.029,.045),(.017,.054),
                 (-.017,.054),(-.029,.045),(-.034,.028)]
        rows.append([(x+dx,y+v*k,z+.032+w*h) for v,w in section])
    rings('Rounded passenger body',rows,paint)
    for side in [-1,1]:
        for dx in [-.043,-.018,.020,.045]:
            box('Passenger window',x+dx,y+side*.034,z+.052,.020,.002,.021,'glass')
        box('Waist stripe',x,y+side*.035,z+.039,.116,.0015,.005,'cream')
    for end in [-1,1]:
        tube('Magnetic coupling',[(x+end*.069,y,z+.030),(x+end*.079,y,z+.030)],.009,'steel')
        if engine:
            for yy in [-.014,.014]:
                box('Cab lamp',x+end*.071,y+yy,z+.039,.002,.007,.006,'cream')
for i in range(3):coach(-.35+i*.161,-.30,base+.017,'amber',i!=1)
for i in range(2):coach(-.34+i*.158,.30,base+.112,'red',i==0)

def canopy(name,x,y,z,length,r,color):
    # Bent shell stays open at both ends so the running track passes through it.
    profile=[(r*cos(i*pi/16),r*sin(i*pi/16)) for i in range(17)]
    profile += [((r-.008)*cos(i*pi/16),(r-.008)*sin(i*pi/16)) for i in reversed(range(17))]
    rings(name,[[(x+dx,y+dy,z+h) for dy,h in profile] for dx in [-length/2,length/2]],color)
for y in [-.398,-.201]:
    for x in [.16,.34]:
        box('Station column',x,y,base,.018,.019,.12,'honey')
canopy('Green station roof',.25,-.30,base+.12,.24,.107,'forest')
box('Station platform',.25,-.392,base,.28,.065,.023,'cream')
for x in [.11,.39]:box('Station fascia',x,-.30,base+.115,.012,.20,.022,'forest')
box('Signal base',-.52,-.15,base,.055,.04,.014,'steel')
tube('Signal mast',[(-.52,-.15,base),(-.52,-.15,base+.13)],.007,'honey')
box('Signal head',-.52,-.15,base+.095,.037,.019,.058,'black')
for h,c in [(.109,'grass'),(.137,'red')]:
    tube('Signal aspect',[(-.52,-.16,base+h),(-.52,-.164,base+h)],.009,c)

# Retail cartons and original miniature train illustrations on the sloped gold display island.
box('Gold island toe',0,.86,0,1.49,.53,.10,'honey')
box('Gold display island',0,.86,.10,1.69,.62,.49,'gold',.04)
def carton(x,y,z,w,d,h):
    box('Printed set carton',x,y,z,w,d,h,'forest')
    surface.board('Central Station Set front panel',(x,y-d/2-.0007,z+h*.50),(1,0,0),(0,0,1),w*.994,h*.992,'brio',part)
    surface.board('Central Station Set side panel',(x+w/2+.0007,y,z+h*.50),(0,1,0),(0,0,1),d*.989,h*.992,'brio',part)
for x in [-.48,0,.48]:
    carton(x,.77,.59,.45,.21,.39)
for x in [-.46,.02]:carton(x,.79,.98,.29,.16,.22)

# Adjacent wooden role-play kitchen from the same branch photograph.
kx=-1.39; ky=.65
def cabinet(name,x,y,z,w,d,h,color):
    return box(name,kx+x,ky+y,z,w,d,h,color)
cabinet('Kitchen kickboard',0,0,.03,.84,.36,.07,'honey')
cabinet('Cabinet carcass',0,0,.10,.89,.40,.51,'ply')
cabinet('Oven door',.209,-.211,.13,.39,.028,.405,'ivory')
cabinet('Oven window',.209,-.229,.19,.30,.012,.19,'glass')
cabinet('Washer door',-.207,-.212,.13,.39,.026,.405,'ivory')
for r,c,dy in [(.132,'black',-.233),(.10,'steel',-.240),(.077,'glass',-.245)]:
    tube('Washer porthole',[(kx-.207,ky+dy+.006,.32),(kx-.207,ky+dy,.32)],r,c,28)
cabinet('Countertop',0,0,.61,.94,.44,.033,'cream')
for x in [-.39,.39]:
    cabinet('Hutch upright',x,.171,.644,.035,.056,.47,'ply')
cabinet('Hutch top shelf',0,.09,1.10,.85,.23,.026,'ply')
cabinet('Tile back',0,.178,.646,.76,.025,.32,'ivory')
cabinet('Microwave',-.205,.07,.89,.35,.19,.208,'ivory')
cabinet('Microwave glass',-.239,-.029,.928,.221,.012,.128,'black')
for row in range(3):
    for col in range(3):
        cabinet('Keypad',-.101+col*.016,-.032,.941+row*.022,.009,.005,.010,'steel')
for x in [-.32,-.18,.18,.32]:
    tube('Control knob',[(kx+x,ky-.222,.55),(kx+x,ky-.247,.55)],.023,'black',16)
for x in [.12,.31]:
    tube('Hob',[(kx+x,ky-.04,.644),(kx+x,ky-.04,.65)],.070,'black',24)
    tube('Burner cap',[(kx+x,ky-.04,.650),(kx+x,ky-.04,.653)],.043,'steel',24)
cabinet('Sink rim',-.225,-.042,.642,.27,.21,.011,'steel')
cabinet('Sink bowl',-.225,-.042,.652,.229,.167,.003,'glass')
tube('Gooseneck tap',[(kx-.305,ky+.078,.65),(kx-.305,ky+.078,.746),
     (kx-.297,ky+.065,.770),(kx-.279,ky+.036,.778),(kx-.266,ky+.014,.766),
     (kx-.265,ky+.008,.743)],.011,'black')
tube('Oven pull',[(kx+.06,ky-.232,.457),(kx+.06,ky-.256,.457),
     (kx+.353,ky-.256,.457),(kx+.353,ky-.232,.457)],.011,'steel')

# Freight siding and hand-cranked magnetic crane at the inner terminus.
box('Cargo platform',.29,.126,base,.18,.16,.018,'honey')
box('Crane foundation',.32,.175,base+.017,.065,.067,.022,'steel')
tower=base+.039
box('Crane mast',.32,.175,tower,.034,.041,.135,'amber')
box('Crane jib',.269,.175,tower+.130,.152,.036,.025,'amber')
tube('Cable',[(.210,.175,tower+.131),(.210,.175,tower+.075)],.003,'black',8)
box('Magnetic cargo block',.21,.175,tower+.045,.045,.042,.032,'red')
box('Buffer stop',.293,.099,base+.017,.013,.068,.037,'wine')

# The Gangnam worktop photo shows the blue number-three car, with closed boxes
# either side. The shell and printing are built at the published 150 mm length.
box('Racing toy display base',1.22,.48,0,.62,.53,.11,'honey')
box('Satin gold counter',1.22,.48,.11,.72,.59,.68,'gold')
box('Counter cap',1.22,.48,.79,.74,.60,.035,'cream')
for px,py,pz in [(1.16,.43,.825),(1.42,.65,.825),(.99,.64,.825)]:
    box('Playforever presentation carton',px,py,pz,.222,.152,.097,'ivory')
    surface.board('Velocita carton illustration',(px,py-.0765,pz+.0485),(1,0,0),(0,0,1),.220,.094,'carton',part)
    surface.board('Playforever carton lid',(px,py,pz+.0975),(1,0,0),(0,1,0),.220,.149,'cartonTop',part)
velocita.make((1.16,.43,.9234),part,materials)
kitchen_details.make(kx,ky,part,box,rings,tube,surface.board)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'workshop.blend'),compress=True)
print('Editable mesh objects:',len(collection.objects))
exporter=OUT/'export.py'
exec(compile(exporter.read_text(),str(exporter),'exec'),{'__file__':str(exporter)})
