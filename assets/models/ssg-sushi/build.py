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

# An original UV atlas. Each horizontal strip follows the long grain of
# a different physical surface. The source and GLB both embed this image.
N, H = 512, 64
u,v = np.meshgrid(np.linspace(0,1,N), np.linspace(0,1,H))
noise=np.random.default_rng(422)
def pigment(base, detail):
    return np.clip(np.array(base)+detail[:,:,None],0,255)
def mix(a,b,mask):
    return a*(1-mask[:,:,None])+np.array(b)*mask[:,:,None]
grain=v*145+1.6*np.sin(7*u+v*3)+.6*np.sin(18*u+v*12)
wood=pigment([139,58,33],6*np.sin(grain)+3*np.sin(6*grain)+6*np.sin(14*v+u*4)+noise.normal(0,1.1,u.shape))
salmon=pigment([245,133,54],7*np.sin(15*u+v*2))
phase=5.3*u+.32*np.abs(2*v-1)**1.6+.08*np.sin(13*u)
salmon=mix(salmon,[255,216,160],np.exp(-(np.sin(pi*phase)/.22)**2)*.88)
tuna=pigment([180,40,61],8*np.sin(29*u+v*2)+noise.normal(0,1.8,u.shape))
tuna=mix(tuna,[226,108,114],np.exp(-(np.sin(pi*(5*u+.21*v))/.11)**2)*.54)
white=pigment([247,225,209],4*np.sin(u*43+v*2))
white=mix(white,[145,52,69],np.exp(-((v-.93-.035*np.sin(u*9))/.085)**2)*.90)
eel=pigment([177,99,41],19*np.sin(u*34+v*3)+8*np.sin(v*35)+noise.normal(0,6,u.shape))
eel=mix(eel,[77,41,26],np.clip((np.sin(16*pi*u+.8*np.sin(v*8))-.75)*3,0,1)*.75)
clay=pigment([226,214,192],noise.normal(0,2,u.shape))
clay[noise.uniform(size=u.shape)>.986]=[145,120,96]
prawn=pigment([250,214,178],3*np.sin(u*15))
prawn=mix(prawn,[234,139,72],np.exp(-(np.sin(pi*(6*u+.3*abs(v-.5)))/.34)**2)*.85)
rose=mix(tuna,[239,178,172],.47+.10*np.sin(u*17+v*2))
atlas=np.concatenate([wood,salmon,tuna,white,eel,clay,prawn,rose])
rgba=np.ones((8*H,N,4),np.float32);rgba[:,:,:3]=atlas/255
im=bpy.data.images.new('키사라 표면 견본',width=N,height=8*H)
im.pixels.foreach_set(rgba.ravel()); im.pack()

def finish(name,hexcolor,batch='KisaraDining',rough=.42,metal=0):
    rgb=[int(hexcolor[i:i+2],16)/255 for i in (0,2,4)]
    rgba=tuple(t/12.92 if t<.04045 else ((t+.055)/1.055)**2.4 for t in rgb)+(1,)
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=rgba
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=rgba;p.inputs['Roughness'].default_value=rough
    p.inputs['Metallic'].default_value=metal;m['batch']=batch
    return m
skin=finish('옻칠 · 유약 · 생선살','ffffff','KisaraGlazedServing',.27)
tex=skin.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im
skin.node_tree.links.new(tex.outputs['Color'],skin.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
dark=finish('주전자 손잡이 · 칠기','292523')
leg=finish('가구 다리','613721')
leather=finish('먹빛 가죽','383330')
gold=finish('금빛 상감','dcaf5c')
iron=finish('보온병 무광 은빛','e0d8ca','KisaraBrushedSteel',.29,.32)
pottery=finish('사기 테','997758')
black=finish('검은 사각 접시','302c2a')
ivory=finish('찻잔 유백색','f1eadd')
rice=[finish('초밥 쌀알 '+str(j),c) for j,c in enumerate(['f4e5ce','fff1d9','ead4b4','f8e8cb'])]
nori=finish('김 띠','34342a'); leaf=finish('들깻잎','67983b'); vein=finish('잎맥','a5bf65')
radish=finish('무채','f4ebd4');ginger=finish('초생강','f4d38e')
wasabi=finish('고추냉이','a2ad54');tea=finish('녹차','c8ac52')
broth=finish('미소장국','c78d41');soy=finish('간장','613019')
lemon=finish('레몬 껍질','e7c53a');pulp=finish('레몬 과육','f7e38a')
cil=finish('송송 썬 파','75954a')

def mesh(name,vs,faces,mat,smooth=False,strip=None,uv=None):
    me=bpy.data.meshes.new(name);me.from_pydata(vs,[],faces);me.materials.append(mat)
    if strip is not None:
        layer=me.uv_layers.new(name='표면')
        for loop in me.loops:
            a,b=uv[loop.vertex_index];layer.data[loop.index].uv=(.004+.992*a,(strip+.04+.92*b)/8)
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
def lathe(name,x,y,z,profile,mat,n=32):
    return rings(name,[[(x+r*cos(j*tau/n),y+r*sin(j*tau/n),z+h) for j in range(n)] for r,h in profile],mat)
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
sx,sy=-.07,-.304
tray('모둠초밥 사각 도기',sx,sy,top,.413,.378,[(.026,0),(.009,.010),(0,.033),(.002,.036),(.009,.035),(.024,.013),(.031,.010)],skin,5)
pts=outline(.408,.373,.016,7)
rod('도기 가장자리 철유',[(sx+a,sy+b,top+.0352) for a,b in pts+[pts[0]]],.0013,pottery,6)

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

def nigiri(x,y,angle,strip,kind):
    z=top+.011
    def at(a,b):return x+a*cos(angle)-b*sin(angle),y+a*sin(angle)+b*cos(angle)
    o=oval('한입 쥔 밥',0,0,0,.037,.0185,.014,rice[0])
    o.location=(x,y,z+.013);o.rotation_euler.z=angle
    # Each grain is a separate small lobe, grouped into one editable mesh
    # per piece. Generate only the exposed outer rows.
    vs=[];fs=[]
    for j in range(36):
        th=j*tau/18+rng.uniform(-.08,.08);upper=j//18
        a=(.0335-.003*upper)*cos(th);b=(.0148+.001*upper)*sin(th)
        cx,cy=at(a,b); cz=z+.009+.010*upper+rng.uniform(-.002,.002)
        spin=angle+rng.uniform(-.8,.8);base=len(vs);n=6
        for h,rad in [(-.0031,.34),(0,1),(.0033,.36)]:
            for k in range(n):
                ha=.0054*rad*cos(tau*k/n);hb=.0030*rad*sin(tau*k/n)
                vs.append((cx+ha*cos(spin)-hb*sin(spin),cy+ha*sin(spin)+hb*cos(spin),cz+h))
        for l in range(2):
            for k in range(n):fs.append((base+l*n+k,base+l*n+(k+1)%n,base+(l+1)*n+(k+1)%n,base+(l+1)*n+k))
        fs.append(tuple(base+2*n+k for k in range(n)))
    mesh('드러난 쌀알',vs,fs,rice[rng.randrange(4)],True)
    cut(kind,x,y,z+.021,.097,.042,.015,angle,strip,.009)
    if kind=='장어':
        for i in range(1):
            path=[(*at(0,b),z+h) for b,h in [(-.023,.010),(-.021,.024),(-.016,.033),(0,.037),(.016,.033),(.021,.024),(.023,.010)]]
            v=[(px+off*cos(angle),py+off*sin(angle),pz) for px,py,pz in path for off in [-.006,.006]]
            mesh('장어 김 띠',v,[(k+1,k,k+2,k+3) for k in range(0,len(v)-2,2)],nori)
    if kind=='새우':
        tx,ty=at(.047,0)
        for side in [-1,1]:
            pts=[(tx,ty,z+.023),(*at(.064,side*.012),z+.014),(*at(.069,side*.003),z+.013)]
            mesh('새우 꼬리 부채',pts,[(0,1,2),(2,1,0)],ginger)
for j,row in enumerate([[(3,'흰살'),(3,'껍질 흰살'),(7,'분홍살'),(3,'흰살')],[(1,'연어'),(2,'참치'),(3,'문어')],[(6,'새우'),(4,'구운 생선'),(4,'장어')]]):
    for i,(strip,kind) in enumerate(row):
        nigiri(sx+(i-(len(row)-1)/2)*(.091 if j==0 else .112),sy+(j-1)*.109,-1.18+.07*sin(i*3+j),strip,kind)

def garnish(x,y,z):
    for i in range(6):
        cx=x+.009*sin(i*2);cy=y+.007*cos(i*2)
        o=oval('얇게 접은 초생강',0,0,0,.017,.012,.0028,ginger)
        o.location=(cx,cy,z+.003*i)
        o.rotation_euler.z=i*.9;o.rotation_euler.x=.27*sin(i)
    for i in range(14):
        a=i*2.4;r=.011*sqrt(i/14)
        oval('고추냉이 입자',x+.013+r*cos(a),y-.037+r*sin(a),z+.007+.007*(1-i/14),.006,.005,.0045,wasabi,7)
garnish(sx+.157,sy+.136,top+.014)

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
bowl('검은 미소 장국 그릇',.286,-.175,.073,.082,dark)
lathe('장국 국물',.286,-.175,top+.066,[(.067,0),(.068,.0015)],broth)
for j in range(3):
    rod('유부 채',[(.265+.011*j+.004*sin(i),-.195+i*.010,top+.068+.0005*j) for i in range(5)],.003,ginger)
for j in range(9):
    x=.286+rng.uniform(-.037,.037);y=-.175+rng.uniform(-.028,.032)
    oval('파 고명',x,y,top+.068,.0035,.0024,.0013,cil,8)
tray('간장 종지',.277,-.370,top,.098,.085,[(.013,0),(.003,.021),(0,.026),(.004,.026),(.014,.009)],skin,5,.016)
block('종지 속 간장',.277,-.370,top+.010,.073,.061,.001,soy,.014)

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
for batch in ['KisaraDining','KisaraBrushedSteel','KisaraGlazedServing']:
    parts=[ob for ob in col.objects if ob.data.materials[0]['batch']==batch]
    bpy.ops.object.select_all(action='DESELECT')
    if batch!='KisaraGlazedServing':
        mat=(iron if batch=='KisaraBrushedSteel' else dark).copy()
        tint=mat.node_tree.nodes.new('ShaderNodeVertexColor');tint.layer_name='Tint'
        mat.node_tree.links.new(tint.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
        for ob in parts:
            color=ob.data.materials[0].diffuse_color[:]
            if not ob.data.color_attributes.get('Tint'):
                attr=ob.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
                for c in attr.data:c.color=color
            ob.data.materials.clear();ob.data.materials.append(mat)
    for ob in parts:ob.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(out/'gallery.glb'),export_format='GLB',export_animations=False,export_image_format='JPEG',export_jpeg_quality=88)
