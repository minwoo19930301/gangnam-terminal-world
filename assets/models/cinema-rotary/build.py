"""Build the customer-facing Camel Coffee bay from the operator's branch photograph."""
from math import cos,sin,pi
from pathlib import Path
import bpy

here=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
coll=bpy.data.collections.new("CamelCoffeeRotaryFront")
bpy.context.scene.collection.children.link(coll)
materials={}
def pigment(tint):
    if tint not in materials:
        m=bpy.data.materials.new(tint)
        c=[int(tint[i:i+2],16)/255 for i in (0,2,4)]
        m.diffuse_color=[v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in c]+[1]
        materials[tint]=m
    return materials[tint]
def mesh(name,verts,faces,tint):
    geo=bpy.data.meshes.new(name);geo.from_pydata(verts,[],faces);geo.update()
    item=bpy.data.objects.new(name,geo);coll.objects.link(item);geo.materials.append(pigment(tint))
    return item
def box(name,x,y,z,w,d,h,tint):
    vs=[(x+a*w/2,y+b*d/2,z+k*h) for k in [0,1] for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return mesh(name,vs,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,4+(i+1)%4,4+i) for i in range(4)],tint)
def turn(name,x,y,z,profile,tint,n=24):
    vs=[(x+r*cos(i*2*pi/n),y+r*sin(i*2*pi/n),z+h) for h,r in profile for i in range(n)]
    fs=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(profile)-1) for i in range(n)]
    return mesh(name,vs,fs,tint)
def letter(name,word,x,y,z,size,tint):
    curve=bpy.data.curves.new(name,'FONT');curve.body=word;curve.align_x='CENTER';curve.size=size
    curve.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Brush Script.ttf')
    curve.extrude=.006;curve.resolution_u=7
    obj=bpy.data.objects.new(name,curve);coll.objects.link(obj);obj.location=(x,y,z)
    obj.rotation_euler.x=pi/2;obj.data.materials.append(pigment(tint))
    bpy.context.view_layer.objects.active=obj;obj.select_set(True)
    bpy.ops.object.convert(target='MESH');obj.select_set(False)
woods=['c79356','ca995f','c08c51','ce9e65','c69558']
for i in range(11):
    x=(i-5)*.57
    box('합판 뒤판',x,2.11,.03,.566,.095,2.97,woods[i%5])
    for j in range(3):
        h=.26+((i*5+j*7)%11)*.21
        turn('합판 옹이',x+.055*((i+j)%4-2),2.050,h,[(0,.018),(.048,.011),(.085,.001)],'966b44',6)
for x in [-3.1,3.1]: box('석재 문설주',x,.13,0,.13,.27,4.39,'a69d90')
# Grey brick fascia is gently bowed above the open shop. Courses overlap at the joints.
box('회색 줄눈 바탕',0,.08,2.95,6.25,.16,1.46,'73766e')
for r in range(10):
    offset=(r%2)*.24
    for i in range(-7,8):
        a=max(-3.12,i*.48+offset);b=min(3.12,(i+1)*.48+offset-.016)
        if b<=a: continue
        middle=(a+b)/2
        box('밝은 벽돌',middle,-.04-.07*(1-(middle/3.12)**2),2.99+r*.14,b-a,.07,.123,
            ['c2c0b4','c7c6bc','b9bab1','c8c7bd'][(i*3+r)%4])
box('금속 상인방',0,-.125,2.89,6.26,.18,.075,'504b42')
letter('입구 레터링','Camel',0,-.25,3.24,.68,'fff8dd')
letter('카페 뒤판의 글자','Camel',1.25,2.043,1.68,1.1,'342f2b')
# The tall, black, ribbed pendant and two-tone communal ledge appear in both photographs.
for k,(z,h,width,profile_type) in enumerate([(1.21,.45,.31,0),(1.66,.48,.41,1),(2.14,.47,.31,0),(2.61,.43,.27,0)]):
    rings=[]
    for j in range(15):
        t=j/14
        r=width*(sin(pi*t)**(.6 if profile_type==0 else 1.05))*(.98 if j%2 else 1)
        rings.append((t*h,max(.028,r)))
    turn('검은 주름 갓 '+str(k+1),-1.76,1.22,z,rings,'1e1c22')
box('등 지지선',-1.76,1.22,3.025,.021,.021,1.31,'373430')
for x in [-2.25,-1.20]:
    box('붙박이 테이블',x,1.34,.77,1.045,.72,.085,'b27e43' if x<-2 else '4c443b')
    box('테이블 받침',x,1.34,0,.15,.60,.77,'916538')
for x in [-2.46,-1.02]:
    turn('나무 스툴',x,.69,0,[(0,.21),(.12,.18),(.31,.132),(.40,.19),(.46,.22),(.48,.21)],'9c744d')
box('주문대',1.17,1.01,0,2.63,.72,.99,'323332')
box('나무 카운터 옆면',-.26,1.01,0,.27,.72,.99,'bb894d')
box('주문대 상판',1.03,1.01,.99,2.95,.80,.065,'494139')
box('주문 단말기',1.50,1.04,1.05,.42,.19,.27,'323332')
box('검정 트랙',.22,.52,2.80,4.60,.047,.045,'302e2b')
for x in [-1.49,-.95,.14,.65,1.74]:
    turn('트랙 조명',x,.52,2.64,[(0,.056),(.15,.056)],'30302e',10)
bpy.context.view_layer.update()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'front.blend'),compress=True)
