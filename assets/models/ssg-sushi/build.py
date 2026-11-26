"""키사라 강남점 손님상. Blender +Y points away from the sushi plate."""
from pathlib import Path
from math import pi, sin, cos, exp, sqrt
from random import Random
import bpy
import numpy as np
from mathutils import Vector

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.data.collections.new('SSG_11F_Kisara')
bpy.context.scene.collection.children.link(col)
rng = Random(422)
tau = 2*pi
top = .758

import sys
sys.dont_write_bytecode=True
sys.path.insert(0,str(out))
import food_surfaces
import plating
images=food_surfaces.generate()

def finish(name,hexcolor,batch='KisaraDining',rough=.42,metal=0):
    rgb=[int(hexcolor[i:i+2],16)/255 for i in (0,2,4)]
    rgba=tuple(t/12.92 if t<.04045 else ((t+.055)/1.055)**2.4 for t in rgb)+(1,)
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=rgba
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=rgba;p.inputs['Roughness'].default_value=rough
    p.inputs['Metallic'].default_value=metal;m['batch']=batch
    return m
skin=finish('옻칠 · 유약 · 생선살','ffffff','KisaraGlazedServing',.27)
food_surfaces.set_shader(skin,images)
dark=finish('주전자 손잡이 · 칠기','292523')
leg=finish('가구 다리','613721')
leather=finish('먹빛 가죽','383330')
gold=finish('금빛 상감','dcaf5c')
iron=finish('보온병 무광 은빛','e0d8ca','KisaraBrushedSteel',.29,.32)
pottery=finish('사기 테','997758')
black=finish('검은 사각 접시','302c2a')
ivory=finish('찻잔 유백색','f1eadd')
rice=[finish('초밥 쌀알 '+str(j),c) for j,c in enumerate(['e6d4b3','f0dfbd','e9d4ac','f1e1bf'])]
nori=finish('김 띠','34342a'); leaf=finish('들깻잎','67983b'); vein=finish('잎맥','a5bf65')
radish=finish('무채','f4ebd4');ginger=finish('초생강','f4d38e')
wasabi=finish('고추냉이','a2ad54');tea=finish('녹차','c8ac52')
broth=finish('미소장국','8f5f2d');soy=finish('간장','381e16',rough=.22)
service=finish('검정 옻칠 쟁반','211e1c',rough=.27);liner=finish('쟁반 속지','e6e1d8')
tail_rib=finish('새우 꼬리 껍질','de8b36')
lemon=finish('레몬 껍질','e7c53a');pulp=finish('레몬 과육','f7e38a')
cil=finish('송송 썬 파','75954a')

def mesh(name,vs,faces,mat,smooth=False,strip=None,uv=None):
    me=bpy.data.meshes.new(name);me.from_pydata(vs,[],faces);me.materials.append(mat)
    if strip is not None:
        layer=me.uv_layers.new(name='표면')
        for loop in me.loops:
            a,b=uv[loop.vertex_index];layer.data[loop.index].uv=food_surfaces.uv(strip,a,b)
    for f in me.polygons:f.use_smooth=smooth
    ob=bpy.data.objects.new(name,me);col.objects.link(ob);return ob

def rings(name,rows,mat,smooth=True,strip=None,uv=None):
    n=len(rows[0]);k=len(rows)
    fs=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(k-1) for j in range(n)]
    fs+= [tuple(reversed(range(n))),tuple(range((k-1)*n,k*n))]
    vs=[p for row in rows for p in row]
    return mesh(name,vs,fs,mat,smooth,strip,uv)

def outline(w,d,r,n=4):
    return [(sx*(w/2-r)+r*cos((j+i/n)*pi/2),sy*(d/2-r)+r*sin((j+i/n)*pi/2))
            for j,(sx,sy) in enumerate([(1,1),(-1,1),(-1,-1),(1,-1)]) for i in range(n+1)]
def tray(name,x,y,z,w,d,profile,mat,strip=None,r=.018):
    rows=[];uv=[]
    for inset,h in profile:
        pts=outline(w-2*inset,d-2*inset,min(r,w/2-inset-.0001,d/2-inset-.0001))
        rows.append([(x+a,y+b,z+h) for a,b in pts]);uv.extend((.5+b/d,.5+a/w) for a,b in pts)
    return rings(name,rows,mat,False,strip,uv)
def block(name,x,y,z,w,d,h,mat,r=.006,strip=None):
    b=min(h*.18,.003,r*.45)
    return tray(name,x,y,z,w,d,[(b,0),(0,b),(0,h-b),(b,h)],mat,strip,r)
def lathe(name,x,y,z,profile,mat,n=32,open_ends=False):
    rows=[[(x+r*cos(j*tau/n),y+r*sin(j*tau/n),z+h) for j in range(n)] for r,h in profile]
    if open_ends:
        faces=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j)
               for i in range(len(rows)-1) for j in range(n)]
        return mesh(name,sum(rows,[]),faces,mat,True)
    return rings(name,rows,mat)
def rod(name,pts,r,mat,n=7):
    rows=[]
    for i,p in enumerate(pts):
        t=(Vector(pts[min(len(pts)-1,i+1)])-Vector(pts[max(0,i-1)])).normalized()
        a=t.cross(Vector((0,0,1)) if abs(t.z)<.8 else Vector((1,0,0))).normalized(); b=t.cross(a)
        rows.append([Vector(p)+r*(a*cos(j*tau/n)+b*sin(j*tau/n)) for j in range(n)])
    return rings(name,rows,mat)
def oval(name,x,y,z,rx,ry,rz,mat,n=12):
    return rings(name,[[(x+rx*cos(t)*cos(j*tau/n),y+ry*cos(t)*sin(j*tau/n),z+rz*sin(t))
                        for j in range(n)] for t in [-1.50,-.85,-.35,.30,.88,1.50]],mat)

# The photographed red polished table has a narrow quarter-round return in
# the inlay at each corner. Place the chairs on the two occupied long edges.
block('적갈색 옻칠 상판',0,0,top-.042,1.02,1.28,.042,skin,.013,0)
outline_pts=outline(.964,1.22,.033,8)
rod('금빛 상감선',[(a,b,top+.00015) for a,b in outline_pts+[outline_pts[0]]],.0018,gold,5)
block('상판 하부 테',0,0,.666,.96,1.21,.055,leg)
for side in [-1,1]:
    for end in [-1,1]:
        block('식탁 다리',side*.451,end*.574,0,.056,.056,.69,leg)
    cx=side*.715
    for i in [-1,1]:
        for j in [-1,1]:
            rod('각진 의자 다리',[(cx+i*.188,j*.187,.014),(cx+i*.158,j*.16,.426)],.027,leg,4)
    block('의자 좌판',cx,0,.397,.422,.452,.050,leg,.027)
    block('가죽 방석',cx,0,.440,.427,.452,.040,leather,.040)
    for j in [-1,1]:
        rod('등받이 기둥',[(cx+side*.164,j*.181,.424),(cx+side*.219,j*.192,.861)],.022,leg,6)
    # Bow the broad upholstered back around the sitter.
    rows=[]
    for h,wide in [(.554,.211),(.562,.222),(.806,.224),(.854,.203)]:
        rows.append([(cx+side*(.189+.051*(1-(yy/.23)**2)+delta),yy,h+.010*(1-(yy/.23)**2))
                    for delta,ys in [(-.017,range(9)),(.017,reversed(range(9)))] for k in ys for yy in [(k/4-1)*wide]])
    if side>0: rows=[list(reversed(row)) for row in rows]
    rings('휘어진 가죽 등판',rows,leather)
    rod('등판 뒤 목재 가로대',[(cx+side*(.211+.047*(1-(j/4)**2)),j*.052,.629) for j in range(-4,5)],.023,leg,6)

# Raised rectangular stoneware with a shallow well and a dark fired edge.
tray('검은 서빙 쟁반',.015,-.298,top,.732,.566,
     [(.018,0),(.008,.006),(0,.016),(.001,.020),(.007,.021),(.012,.016),(.018,.008)],service,r=.014)
block('쟁반의 밝은 속지',.015,-.298,top+.008,.698,.533,.0014,liner,.006)
top+=.0095
sx,sy=-.07,-.304
tray('모둠초밥 사각 도기',sx,sy,top,.413,.378,[(.026,0),(.009,.010),(0,.033),(.002,.036),(.009,.035),(.024,.013),(.031,.010)],skin,5)
# The fired iron oxide is pooled on the outer corners and on the return of
# the square lip, not an added round wire. Keep the colour inside the glaze.
points=outline(.411,.376,.016,8)
edge=[];edge_uv=[]
for j,(a,b) in enumerate(points+[points[0]]):
    for k,(scale,h) in enumerate([(1.003,.0338),(.997,.0366),(.985,.0361)]):
        edge.append((sx+a*scale,sy+b*scale,top+h))
        edge_uv.append(((j%9)/9,k/2))
mesh('사각 도기의 철유 테',edge,plating.grid(len(points)+1,3),skin,True,13,edge_uv)
points=outline(.393,.358,.016,8);edge=[];edge_uv=[]
for j,(a,b) in enumerate(points+[points[0]]):
    for k,(scale,h) in enumerate([(1.003,.0352),(1.000,.0345),(.997,.0337)]):
        edge.append((sx+a*scale,sy+b*scale,top+h));edge_uv.append(((j%9)/9,k/2))
mesh('안쪽 입술의 흐른 철유',edge,plating.grid(len(points)+1,3),skin,True,13,edge_uv)

# A cut of fish is a bent surface with tapered free ends. Its sides hang over
# the rice. Texture coordinates follow the cut, including the red skin edge.
def cut(name,x,y,z,length,width,height,angle,strip,bend=.004):
    vs=[];uv=[];fs=[];nx,ny=13,9
    for layer in range(2):
        for i in range(nx):
            u=i/(nx-1);t=2*u-1
            for j in range(ny):
                v=j/(ny-1);s=2*v-1
                w=width*(.58+.42*(1-t*t))*(1-.11*t)
                a=t*length/2+.002*s; b=s*w/2+.005*sin(pi*u)
                h=height*(.51+.49*(1-t*t))*(1-.47*s*s)-bend*(abs(t)**3+.4*abs(s)**3)
                if layer==0:h-=.005+.002*(1-t*t)
                vs.append((x+a*cos(angle)-b*sin(angle),y+a*sin(angle)+b*cos(angle),z+h))
                uv.append((u,v))
    count=nx*ny
    for i in range(nx-1):
        for j in range(ny-1):
            a=i*ny+j; q=(a,a+ny,a+ny+1,a+1)
            fs.append(tuple(reversed(q)));fs.append(tuple(k+count for k in q))
    edge=list(range(0,count,ny))+list(range(count-ny+1,count))+list(range(count-ny-1,ny-2,-ny))+list(range(ny-2,0,-1))
    for a,b in zip(edge,edge[1:]+edge[:1]):fs.append((a,b,b+count,a+count))
    return mesh(name,vs,fs,skin,True,strip,uv)

for j,row in enumerate([['흰살','껍질 흰살','분홍살','끝 흰살'],['연어','참치','문어'],['새우','그을린 흰살','김으로 감싼 와규']]):
    for i,kind in enumerate(row):
        x=sx+(i-(len(row)-1)/2)*(.086 if j==0 else .108)-(.018 if j==2 else .004)
        y=sy+(j-1)*.103+ .003*sin(i*3+j)
        angle=-1.14+.08*sin(i*3+j)
        def at(a,b,h):
            return x+a*cos(angle)-b*sin(angle),y+a*sin(angle)+b*cos(angle),top+.011+h
        def rib(name,points,radius):
            return rod(name,points,radius,tail_rib,5)
        plating.nigiri(mesh,skin,rice,rib,at,kind,422+j*10+i)

def garnish(x,y,z):
    plating.garnish(mesh,skin,wasabi,x,y,z,422)
garnish(sx+.154,sy+.131,top+.014)
top-=.0095

# Dark sashimi plate, shiso, shredded daikon and a thin lemon wedge, from
# the branch's eel set. Leave room on the guest-facing edge for dipping ware.
cx,cy=.010,.213
tray('사시미 검은 사각 접시',cx,cy,top,.291,.208,[(.018,0),(.007,.009),(0,.022),(.004,.024),(.019,.012)],black)
for i in range(31):
    a=rng.uniform(0,tau);l=rng.uniform(.030,.075);ox=cx+rng.uniform(.005,.045);oy=cy+rng.uniform(-.02,.035)
    rod('무채',[(ox+l*t*cos(a),oy+l*t*sin(a)+.006*sin(t*3+i),top+.019+.012*cos(t*pi/2)+.001*(i%4)) for t in [-1,-.5,0,.5,1]],.00125,radish,5)
def shiso(x,y,z):
    pts=[(x,y,z+.002)];fs=[]
    for i in range(44):
        a=tau*i/44;s=sin(a);radius=1-.08*(i%2)
        pts.append((x+.048*cos(a)*(1-.42*s)*radius,y+.060*s*radius,z+.003+.009*s*s+.003*cos(4*a)))
        fs.append((0,i+1,(i+1)%44+1))
    mesh('톱니 깻잎',pts,fs,leaf,True)
    for s in [-1,1]:
        for k in range(3):
            yy=y-.027+k*.019
            rod('잎맥',[(x,yy,z+.005),(x+s*.032,yy+.016,z+.006)],.0008,vein,5)
shiso(cx+.049,cy+.021,top+.029)
for i,(strip,w) in enumerate([(3,.041),(3,.039),(1,.043),(2,.045),(2,.044)]):
    cut('도톰하게 썬 회',cx-.077+i*.034,cy+.004+i*.003,top+.027+i*.001,.087,w,.018,-1.78+.10*i,strip,.003)
for i,mat in enumerate([lemon,pulp]):
    r=.030-i*.002; yy=cy+.008
    pts=[(cx+.015,yy,top+.041)]+[(cx+.015+.009*cos(k*pi/20),yy+r*cos(k*pi/20),top+.041+r*sin(k*pi/20)) for k in range(21)]
    mesh('레몬 반달',[(x+i*.001,y,z) for x,y,z in pts],[(0,j+1,j+2) for j in range(20)],mat)
garnish(cx-.104,cy+.071,top+.014)

def bowl(name,x,y,r,h,mat):
    return lathe(name,x,y,top,[(r*.50,0),(r*.52,.006),(r*.74,h*.25),(r*.96,h*.78),(r,h*.96),(r*.99,h),(r*.94,h),(r*.92,h*.82),(r*.66,h*.22),(r*.42,h*.16)],mat)
top+=.0095
bowl('검은 미소 장국 그릇',.270,-.116,.070,.077,dark)
lathe('미소 장국 국물',.270,-.116,top+.063,[(.0651,0),(.0655,.0012)],broth)
for j in range(5):
    px=.270+rng.uniform(-.028,.018);py=-.115+rng.uniform(-.026,.005)
    ribbon=[];uv=[]
    for i in range(11):
        u=i/10
        for side in [-1,1]:
            ribbon.append((px+.023*u+.0034*sin(8*u+j*.81),py+.014*u+side*(.003+.001*sin(6*u)),top+.065+.0015*sin(6*u+j)))
            uv.append((u,(side+1)/2))
    mesh('국물에 뜬 유부 채',ribbon,plating.grid(11,2),skin,True,12,uv)
for j in range(13):
    px=.270+rng.uniform(-.037,.033);py=-.116+rng.uniform(-.030,.029)
    lathe('속이 빈 송송 썬 파',px,py,top+.0643,[(.0034,0),(.0035,.0018),(.002,.0023),(.0019,.0002)],cil,9,True)
bowl('절임 곁들임 종지',.270,-.295,.061,.031,ivory)
lathe('절임 종지 철유 테',.270,-.295,top+.029,[(.0600,0),(.061,.001),(.0608,.0025),(.0583,.003),(.0575,.001)],pottery,44,True)
def small_oval(name,x,y,z,rx,ry,rz,index):
    return oval(name,x,y,z,rx,ry,rz,ivory,9)
plating.accompaniments(mesh,skin,small_oval,422,.270,-.295,top+.015)
tray('간장 종지',.270,-.453,top,.098,.085,[(.013,0),(.003,.021),(0,.026),(.004,.026),(.014,.009)],skin,5,.016)
block('종지 속 간장',.270,-.453,top+.010,.073,.061,.001,soy,.014)
top-=.0095

# The silver insulated jug has a thumb-operated black lid, hooked spout,
# tapered belly and a handle with actual open clearance.
jx,jy=-.314,.388
jug=lathe('보온 주전자 몸통',jx,jy,top,[(.052,0),(.061,.005),(.064,.016),(.066,.082),(.063,.154),(.057,.194),(.053,.204)],iron,48)
# Long soft reflection bands observed on the brushed stainless shell.
jugmat=iron.copy();jugmat.name='보온병 헤어라인';jug.data.materials[0]=jugmat
band=jug.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
for vertex,c in zip(jug.data.vertices,band.data):
    dx=(vertex.co.x-jx)/.063;dy=(vertex.co.y-jy)/.063
    f=.48+.37*exp(-((dx+.38)/.19)**2)+.28*exp(-((dy+.62)/.24)**2)+.16*(1+dx)/2
    c.color=tuple(min(1,value*f) for value in iron.diffuse_color[:3])+(1,)
node=jugmat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='Tint'
jugmat.node_tree.links.new(node.outputs['Color'],jugmat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
lathe('주전자 밑굽',jx,jy,top,[(.054,0),(.063,.002),(.064,.009),(.063,.011)],dark)
lathe('뚜껑과 회전 마개',jx,jy,top+.199,[(.053,0),(.059,.003),(.060,.030),(.069,.038),(.070,.044),(.063,.049),(.048,.050),(.044,.061),(.035,.065)],dark,40)
rod('검은 손잡이',[(jx-.049,jy,top+.218),(jx-.085,jy,top+.222),(jx-.100,jy,top+.204),(jx-.105,jy,top+.170),(jx-.099,jy,top+.126),(jx-.081,jy,top+.091),(jx-.060,jy,top+.085)],.010,dark,10)
cut_pts=[(jx+.045,jy-.024,top+.223),(jx+.089,jy-.014,top+.230),(jx+.093,jy+.013,top+.238),(jx+.045,jy+.024,top+.244)]
rings('주전자 따름구',[cut_pts,[(x,y,z+.006) for x,y,z in cut_pts]],dark,False)
for x,y in [(-.322,.229),(.257,.346)]:
    bowl('유백색 찻잔',x,y,.036,.070,ivory)
    lathe('찻물',x,y,top+.059,[(.0336,0),(.0336,.001)],tea)
for x,y in [(.413,-.443),(-.205,.454)]:
    block('검은 수저받침',x,y+.056,top,.095,.019,.012,dark,.003)
    for k in range(2):
        rod('옻칠 젓가락',[(x+.009*k,y-.054,top+.006),(x+.009*k,y+.064,top+.015),(x+.009*k,y+.149,top+.018)],.0026,dark,6)
    rod('쇠숟가락 자루',[(x-.029,y-.06,top+.005),(x-.029,y+.057,top+.015),(x-.029,y+.112,top+.015)],.0035,iron)
    oval('쇠숟가락 술',x-.029,y+.13,top+.017,.012,.022,.0035,iron)

bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
print('EDITABLE',len(col.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(out/'kisara.blend'),compress=True)
file=out/'export.py'
exec(compile(file.read_text(),str(file),'exec'),{'__file__':str(file)})
