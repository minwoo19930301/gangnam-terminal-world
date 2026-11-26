"""Underside of the four public Sweet Garden flights in their shared local frame."""
from math import cos, sin, pi
from pathlib import Path
import random
import bpy

here=Path(__file__).resolve().parent
rng=random.Random(128)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('SweetGardenBankSoffit')
bpy.context.scene.collection.children.link(collection)
materials={}
def finish(hexcode):
    if hexcode not in materials:
        m=bpy.data.materials.new(hexcode)
        cs=[int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
        m.diffuse_color=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in cs]+[1]
        materials[hexcode]=m
    return materials[hexcode]
def mesh(name,points,faces,tint):
    data=bpy.data.meshes.new(name)
    data.from_pydata(points,[],faces)
    obj=bpy.data.objects.new(name,data);collection.objects.link(obj);data.materials.append(finish(tint));return obj
def box(name,x,y,z,w,d,h,color):
    points=[(x+a*w/2,y+b*d/2,z+c*h) for c in (0,1) for a,b in ((-1,-1),(1,-1),(1,1),(-1,1))]
    return mesh(name,points,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],color)
# Origin is the middle of the B1 comb line, +Y ascends in the direction of 1F.
# Keep the finish below the existing ride, including at both return assemblies.
def height(y):return y*.5-.935
def profile(x):
    # A rolled corner joins the polished soffit to the narrower outer skirts.
    if abs(x)<2.78:return 0
    return .22*(max(0,(abs(x)-2.78)/.195)**2)
def sheet(index,x0,x1,y0,y1):
    # The slight crown of individual cassettes catches oblique light.
    xs=[x0+(x1-x0)*i/6 for i in range(7)]
    ys=[y0,(y0+y1)/2,y1];pts=[]
    for j,y in enumerate(ys):
        for i,x in enumerate(xs):
            off=-.009*sin(pi*i/6)*sin(pi*j/2)
            pts.append((x,y,height(y)+profile(x)+off))
    faces=[(j*7+i,j*7+i+7,j*7+i+8,j*7+i+1) for j in range(2) for i in range(6)]
    obj=mesh('절곡 스테인리스 하부 판',pts,faces,['bbc0b7','b5bcb4','c5c6bb','adb6ae'][index%4])
    for f in obj.data.polygons:f.use_smooth=True
for idx in range(6):
    y0=1.89+idx*1.677+.006;y1=1.89+(idx+1)*1.677-.006
    for i,(a,b) in enumerate([(-2.975,-2.50),(-2.50,-.84),(-.84,.84),(.84,2.50),(2.50,2.975)]):
        sheet(i+idx,a+.003,b-.003,y0,y1)
    for side in [-1,1]:
        x=side*2.974
        pts=[(x,y0,height(y0)+.205),(x,y1,height(y1)+.205),(x,y1,height(y1)+.895),(x,y0,height(y0)+.895)]
        mesh('바깥쪽 측면 패널',pts,[(0,1,2,3)],['a3aa9e','aeb4aa'][idx%2])
def inset(x,y,r,tint,offset):
    pts=[]
    for k in range(20):
        xx=x+r*cos(2*pi*k/20);yy=y+r*.89*sin(2*pi*k/20)
        pts.append((xx,yy,height(yy)-offset))
    mesh('매입 원형 등기구',pts,[tuple(range(19,-1,-1))],tint)
for y in [5.05,8.40,10.82]:
    for x in [-2.18,1.94]:
        inset(x,y,.099,'676b63',.017);inset(x,y,.075,'f5efcb',.019)
# The visit photograph shows a low copper-coloured planter edge and varied low
# foliage beneath the incline. Confine the bed to the bank's own footprint.
cx,cy=.15,7.21
box('청동색 낮은 식재대',cx,cy,.004,4.88,6.92,.235,'9a6e46')
box('위로 접어 마감한 테',cx,cy,.239,4.91,6.95,.025,'b18960')
box('식재 바닥',cx,cy,.264,4.80,6.84,.045,'414637')
leafColors=['455e3e','566f42','74864d','84925b','4e7756','597448','63744b']
for plant in range(150):
    x=cx+rng.uniform(-2.25,2.25);y=cy+rng.uniform(-3.22,3.22)
    size=rng.uniform(.23,.47);stem=.31+rng.uniform(.01,.24)
    count=rng.randrange(7,10);points=[];faces=[]
    if stem>.46:box('식물 줄기',x,y,.306,.018,.018,stem-.306,'546145')
    for i in range(count):
        a=i*2*pi/count+rng.uniform(-.17,.17);length=size*rng.uniform(.67,1.23);w=length*rng.uniform(.12,.27)
        rise=length*rng.uniform(.50,1.1);vx,vy=cos(a),sin(a);nx,ny=-vy,vx
        mx,my=x+vx*length*.50,y+vy*length*.50
        k=len(points);points.extend([(x,y,stem),(mx+nx*w,my+ny*w,stem+rise*.58),
          (mx,my,stem+rise*.70),(mx-nx*w,my-ny*w,stem+rise*.58),
          (x+vx*length,y+vy*length,stem+rise*.64)])
        faces.extend([(k,k+1,k+2),(k,k+2,k+3),(k+1,k+4,k+2),(k+2,k+4,k+3)])
    foliage=mesh('모듬 식재 잎',points,faces,leafColors[plant%len(leafColors)])
    for poly in foliage.data.polygons:poly.use_smooth=True
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'soffit.blend'),compress=True)
