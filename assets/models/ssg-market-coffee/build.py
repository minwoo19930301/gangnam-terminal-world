"""Editable geometry of the Gangnam Market Lane whole-bean cabinet, facing -Y."""
import json
import math
from pathlib import Path
import subprocess
import tempfile
import bpy
from mathutils import Vector

here=Path(__file__).resolve().parent
finish=json.loads((here/'finish.json').read_text())
regions=finish['regions']
for index,key in enumerate(finish['palette']):
    x=16+27*index
    regions[key]=(x,490,x,490)
for index in range(6):
    regions[f'bag{index}']=(208+93*index,145,298+93*index,256)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
collection=bpy.data.collections.new('MarketLaneBeanCase')
scene.collection.children.link(collection)
with tempfile.TemporaryDirectory() as folder:
    imagepath=Path(folder)/'Whole bean coffee.png'
    subprocess.run(['node',str(here/'art.mjs'),str(imagepath)],check=True)
    image=bpy.data.images.load(str(imagepath))
    image.pack()
image.name='마켓레인 · 원두와 포장 인쇄'
material=bpy.data.materials.new('목공·황동·원두·종이 포장')
material.use_nodes=True
shader=material.node_tree.nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value=.49
tex=material.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=image
material.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])

vertices=[]
faces=[]
coords=[]
smoothing=[]
lookup={}
def face(points,finish,uv=None,smooth=False):
    indices=[]
    for point in points:
        key=tuple(round(c,6) for c in point)
        if key not in lookup:
            lookup[key]=len(vertices)
            vertices.append(key)
        indices.append(lookup[key])
    faces.append(indices)
    smoothing.append(smooth)
    l,t,r,b=regions[finish]
    if uv is None:
        uv=([(0,0),(1,0),(1,1),(0,1)] if len(points)==4 else [(0,0)]*len(points))
    coords.extend([((l+(r-l)*u+.5)/768,1-(b+(t-b)*v+.5)/512) for u,v in uv])

def object_done(name):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    for polygon,smooth in zip(mesh.polygons,smoothing):
        polygon.use_smooth=smooth
    layer=mesh.uv_layers.new(name='인쇄와 표면')
    for loop,value in zip(layer.data,coords):
        loop.uv=value
    obj=bpy.data.objects.new(name,mesh)
    collection.objects.link(obj)
    mesh.materials.append(material)
    vertices.clear();faces.clear();coords.clear();smoothing.clear();lookup.clear()

def box(x,y,z,w,d,h,finish,front=None):
    bottom=[(x+a*w/2,y+b*d/2,z) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    top=[(vx,vy,z+h) for vx,vy,_ in bottom]
    face(bottom[::-1],finish)
    face(top,finish)
    for i in range(4):
        j=(i+1)%4
        face([bottom[i],bottom[j],top[j],top[i]],front if i==0 and front else finish)

def placard(x,y,z,w,h,finish,top_offset=0):
    face([(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y+top_offset,z+h),(x-w/2,y+top_offset,z+h)],finish)

def lit_shelf(height):
    box(0,.018,height,2.30,.465,.045,'walnut')
    box(0,-.210,height+.026,2.29,.032,.038,'edge')
    box(0,-.180,height-.013,2.21,.030,.013,'lamp')

# Existing rectangular cabinet width, retained customer aisle and open lower shelf.
box(0,.205,.10,2.46,.095,2.70,'wood')
box(0,.015,.015,2.46,.50,.11,'edge')
for sign in [-1,1]:
    x=1.19*sign
    box(x,.008,.10,.12,.51,2.71,'wood')
    for j in range(5):
        box(x-.043+j*.021,-.251,.14,.012,.015,2.61,'oak')
    box(x,-.256,.18,.012,.012,.45,'brass')
box(0,.032,2.785,2.51,.56,.09,'wood')
box(0,-.235,2.786,2.45,.047,.028,'edge')
box(0,.03,.18,2.30,.48,.05,'wood')
box(0,-.006,.798,2.37,.554,.077,'stone')
box(0,-.276,.766,2.36,.026,.048,'stone')
lit_shelf(1.192)
lit_shelf(2.019)
lit_shelf(2.597)
box(0,-.231,2.639,.90,.07,.134,'walnut',front='heading')
object_done('세로 홈 목공장 · 대리석과 조명 선반')

def round_outline(x,z,width,height,radius):
    points=[]
    for sx,sz,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        steps=3 if radius>.018 else 1
        for k in range(steps+1):
            a=math.radians(start+90*k/steps)
            points.append((x+sx*(width/2-radius)+radius*math.cos(a),
                           z+sz*(height/2-radius)+radius*math.sin(a)))
    return points

def front_plate(x,y,z,w,h,depth,radius,side,front):
    outline=round_outline(x,z,w,h,radius)
    back=[(vx,y+depth,vz) for vx,vz in outline]
    near=[(vx,y,vz) for vx,vz in outline]
    # The back of each mounted face is enclosed by its hopper or timber casing.
    uv=[(.5+(vx-x)/w,.5+(vz-z)/h) for vx,vz in outline]
    face(near,front,uv)
    for i in range(len(outline)):
        j=(i+1)%len(outline)
        face([back[i],back[j],near[j],near[i]],side,smooth=True)

def rod(start,end,r,finish,n=8):
    a,b=Vector(start),Vector(end)
    axis=(b-a).normalized()
    fixed=Vector((0,0,1)) if abs(axis.z)<.9 else Vector((0,1,0))
    t=axis.cross(fixed).normalized()
    q=axis.cross(t)
    rings=[[tuple(point+r*(t*math.cos(2*math.pi*i/n)+q*math.sin(2*math.pi*i/n))) for i in range(n)] for point in (a,b)]
    lo,hi=rings
    face(lo[::-1],finish);face(hi,finish)
    for i in range(n):
        j=(i+1)%n
        face([lo[i],lo[j],hi[j],hi[i]],finish,smooth=True)

def valve(x,y,z):
    # The circular gold outlet projects from the flat-front glazed bean bin.
    rings=[]
    n=16
    for reach,r in [(0,.097),(.016,.110),(.036,.105),(.052,.087),(.062,.053),(.071,.042)]:
        rings.append([(x+r*math.cos(i*2*math.pi/n),y-reach,z+r*math.sin(i*2*math.pi/n)) for i in range(n)])
    def dial_uv(points):
        return [(.5+(p[0]-x)/.222,.5+(p[2]-z)/.222) for p in points]
    for level,(back,front) in enumerate(zip(rings,rings[1:])):
        for i in range(n):
            j=(i+1)%n
            quad=[back[i],back[j],front[j],front[i]]
            face(quad,'dial',dial_uv(quad),smooth=True)
    face(rings[-1],'dial',dial_uv(rings[-1]))
    rod((x,y-.070,z),(x,y-.074,z),.035,'black',16)
    rod((x,y-.074,z),(x,y-.079,z),.025,'brass',16)
    rod((x,y-.070,z),(x+.030,y-.091,z+.036),.014,'highlight',10)
    rod((x+.030,y-.091,z+.036),(x+.046,y-.091,z+.060),.020,'brass',10)

for i in range(7):
    x=(i-3)*.309
    # The right-hand press photo shows a row of metal-capped transparent chambers.
    front_plate(x,-.135,1.615,.288,.731,.20,.034,'brassDark','bronze')
    front_plate(x,-.162,1.741,.267,.420,.022,.031,'highlight','beans')
    funnel=[(x-.121,-.161,1.543),(x-.055,-.153,1.488),(x+.055,-.153,1.488),(x+.121,-.161,1.543)]
    face(funnel,'beans',[(.07,.26),(.26,.04),(.73,.04),(.93,.26)])
    front_plate(x,-.171,1.963,.281,.045,.054,.014,'brass','bronze')
    rod((x,.00,1.985),(x,.00,2.009),.018,'highlight',10)
    rod((x,.00,2.004),(x,.00,2.017),.027,'gold',10)
    front_plate(x,-.175,1.598,.111,.042,.008,.006,'brass','hopperTag')
    valve(x,-.149,1.407)
    rod((x,-.137,1.348),(x,-.16,1.277),.038,'gold',10)
    rod((x,-.16,1.278),(x,-.16,1.267),.038,'black',10)
    box(x,-.215,1.231,.144,.045,.040,'silver',front='price')
    object_done(f'원두 디스펜서 {i+1:02d} · 유리창과 황동 정량 밸브')

def bag(x,y,z,width,depth,height,design,kraft=False):
    # Side gussets fold toward a narrow heat-sealed top; keep the printed panel flat.
    levels=[(0,.86,.90),(.045,1,1),(.68,.96,.87),(.89,.91,.30),(1,.90,.09)]
    rings=[]
    for hz,wx,dy in levels:
        w,d=width*wx/2,depth*dy/2
        ring=[(-w*.86,-d),(w*.86,-d),(w,-d*.58),(w*.91,0),(w,d*.62),
              (w*.85,d),(-w*.85,d),(-w,d*.62),(-w*.91,0),(-w,-d*.58)]
        rings.append([(x+u,y+v,z+height*hz) for u,v in ring])
    body='kraft' if kraft else 'paper'
    face(rings[0][::-1],body);face(rings[-1],body)
    for i,(lo,hi) in enumerate(zip(rings,rings[1:])):
        for k in range(10):
            j=(k+1)%10
            finish='crease' if not kraft and k in (2,7) else body
            if k==0 and not kraft:
                a,b=levels[i][0],levels[i+1][0]
                face([lo[k],lo[j],hi[j],hi[k]],f'bag{design}',[(0,a),(1,a),(1,b),(0,b)])
            else:
                face([lo[k],lo[j],hi[j],hi[k]],finish)
    box(x,y,z+height-.012,width*.91,.012,.012,body)
    if kraft:
        placard(x,y-depth*.52,z+height*.30,width*.56,height*.41,f'bag{design}',.013)
    object_done('접어 봉한 크라프트 원두' if kraft else '접어 봉한 원두 · 색띠 인쇄')

for i in range(10):
    x=-.990+i*.218
    if i in (2,3):
        box(x,.005,2.066,.194,.180,.337,'paper',front='bag1')
        object_done('상단 크림색 원두 상자')
    else:
        bag(x,-.012,2.066,.197,.15,.325+(i%3)*.015,i%6)
for i in range(7):
    x=-.96+i*.317
    if i in (1,4,5):
        box(x,-.012,.876,.236,.16,.234,'maroon',front='drip')
        object_done('아일라 드립백 포장 상자')
    else:
        bag(x,-.020,.876,.217,.15,.294,i%6)
for i in range(7):
    bag(-.964+i*.320,-.016,.232,.262,.190,.400+(i%2)*.032,i%6,kraft=i<4)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'coffee.blend'),compress=True)
