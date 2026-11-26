"""The Margaux Grill's public wine display. Editable rack, case and brick barrel vault."""
from math import atan2, cos, sin, pi, tau
from pathlib import Path
import random
import runpy
import subprocess
import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
rng=random.Random(7176)
coll=None
offset=0
materials={}


def mat(name,code,rough=.48):
    c=tuple(int(code[i:i+2],16)/255 for i in (0,2,4))
    c=tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in c)
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*c,1);m.use_nodes=True
    bsdf=m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=(*c,1)
    bsdf.inputs['Roughness'].default_value=rough
    materials[name]=m
    return m


ash=mat('검은 물푸레나무','39302E')
edge=mat('선반의 연마한 단면','56423A')
shade=mat('장 안쪽','211C1D')
glass=[mat('올리브 병유리','45503B',.19),mat('갈색 병유리','47392F',.19),
       mat('짙은 녹색 병유리','263B32',.17),mat('흑자색 병유리','30292F',.18)]
foils=[mat('납박 · 진홍','A83241',.29),mat('납박 · 와인','672D44',.3),mat('납박 · 황금','B8994E',.31),
       mat('납박 · 은','BBB8AB',.26),mat('납박 · 회청','667A76',.33)]
paper=mat('병 레이블 미색지','D5CAA8')
ivory=mat('병 레이블 인쇄','A69779')
cork=mat('접촉 마개 코르크','997850')
oak=mat('나무 와인 상자','B98E65')
sidewood=mat('옆판과 띠장','A77B53')
nail=mat('작은 철제 못','74675C')
brand=mat('상자 소인','725039')
mortar=mat('석회 줄눈','AD9B8E')
bricks=[mat('곡면 벽돌 %02d'%i,c) for i,c in enumerate(['B39788','BFA598','B99D91','C1A79A','AF9589','B9A093'])]
slate=[mat('점판암 %02d'%i,c) for i,c in enumerate(['555457','5B595A','555456','605D5A','575856'])]
stone=mat('타일 줄눈','787572')
warm=mat('벽돌을 비추는 선 조명','FFDFB6')


def group(name,file,x):
    global coll,offset
    coll=bpy.data.collections.new(name)
    scene.collection.children.link(coll)
    coll['export_model']=file
    coll['preview_origin']=(x,0,0)
    offset=x


def mesh(name,verts,faces,m,smooth=False):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces);data.update()
    ob=bpy.data.objects.new(name,data)
    coll.objects.link(ob)
    ob.location.x=offset
    data.materials.append(m)
    if smooth:
        for f in data.polygons:f.use_smooth=True
    return ob


def block(name,x,y,z,w,d,h,m):
    return mesh(name,[(x+i*w/2,y+j*d/2,z+k*h) for k in (0,1) for j in (-1,1) for i in (-1,1)],
                [(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)],m)


def beam(name,start,end,thickness,depth,m):
    a,b=Vector(start),Vector(end)
    g=block(name,0,0,-(b-a).length/2,thickness,depth,(b-a).length,m)
    g.rotation_euler[1]=atan2(b.x-a.x,b.z-a.z)
    g.location=(a+b)/2+Vector((offset,0,0))
    return g


def font(name,x,y,z,height,m):
    data=bpy.data.curves.new(name,'FONT');data.body=name;data.size=height
    data.align_x='CENTER';data.align_y='CENTER';data.resolution_u=4
    blob=bpy.data.objects.new(name,data);coll.objects.link(blob)
    blob.location=(x+offset,y,z);blob.rotation_euler[0]=pi/2
    bpy.context.view_layer.update()
    converted=bpy.data.meshes.new_from_object(blob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    dest=bpy.data.objects.new('상자 소인 · '+name,converted);coll.objects.link(dest)
    dest.matrix_world=blob.matrix_world.copy();converted.materials.append(m)
    bpy.data.objects.remove(blob,do_unlink=True)


# Shared native meshes keep the individually movable bottles light in the .blend.
bottle_meshes={}
def bottle(name,x,y,z,variant,cap,sideways=True,rolled=0):
    key=(variant,cap)
    if key not in bottle_meshes:
        r=[.044,.046,.040,.048][variant]
        shoulder=[.193,.175,.201,.159][variant]
        layers=[(.64*r,0),(.89*r,.004),(r,.016),(r,.064),(r+.0006,.065),(r+.0006,.134),(r,.135),
                (r,shoulder),(.88*r,shoulder+.016),(.49*r,.234),(.016,.248),(.015,.270),(.0168,.274),
                (.0168,.296),(.0182,.298),(.0182,.304),(.015,.308),(.011,.308)]
        n=13
        verts=[(rr*cos(tau*i/n),rr*sin(tau*i/n),h) for rr,h in layers for i in range(n)]
        faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(layers)-1) for i in range(n)]
        faces.extend([tuple(reversed(range(n))),tuple(range((len(layers)-1)*n,len(layers)*n))])
        data=bpy.data.meshes.new('와인 병형 · %d · 납박 %d'%key)
        data.from_pydata(verts,[],faces);data.update()
        for m in [glass[variant],foils[cap],paper,ivory]:data.materials.append(m)
        for f in data.polygons:
            j=f.index//n
            if 12<=j<=16 or f.index==len(faces)-1:f.material_index=1
            if j==4 and f.index%n<9:f.material_index=2 if variant%2 else 3
            f.use_smooth=j not in (3,5,14,16)
        bottle_meshes[key]=data
    ob=bpy.data.objects.new(name,bottle_meshes[key]);coll.objects.link(ob)
    ob.location=(x+offset,y,z)
    # Horizontal bottles point their capped necks toward customers.
    ob.rotation_euler=(pi/2 if sideways else 0,0,rolled) if sideways else (0,0,rolled)
    return ob


group('더 마고 그릴 · 병 선반','rack',0)
w=1.96;d=.515;h=2.43
block('선반 뒷판',0,.251,.06,w,.040,h-.06,shade)
for x in [-w/2+.018,0,w/2-.018]:
    block('세로 칸막이',x,0,.047,.041,d,h-.047,ash)
    block('칸막이 전면 모서리',x,-.256,.057,.043,.012,h-.064,edge)
for level in [.065,.408,.752,1.096,1.442,2.385]:
    block('가로 선반',0,0,level,w,.522,.038,ash)
    block('가로 선반 엣지',0,-.262,level,.999*w,.01,.030,edge)
for side in [-1,1]:
    cx=side*.49
    for sign in [-1,1]:
        beam('상단 X자 칸막이',(cx-sign*.446,-.006,1.478),(cx+sign*.446,-.006,2.386),.031,.46,edge)
for row,height in enumerate([.104,.447,.791,1.135]):
    for side in [-1,1]:
        cap=(row+(2 if side>0 else 0))%len(foils)
        for layer in range(2 if row!=1 else 1):
            count=(7+(1 if (side>0)^(row%2==1) else 0))-layer
            first=side*.49-.35+layer*.049
            for k in range(count):
                if k==count-1 and (row+layer+side)%3==0:continue
                bottle('저장 와인 · 가로',first+k*.097,.084+rng.uniform(-.016,.016),
                       height+.049+layer*.082,(k//4+row+(side>0))%4,cap,True,rng.uniform(-.024,.024))
for side in (-1,1):
    cx=side*.49
    for layer in range(3):
        for k in range(6-2*layer):
            bottle('상단 X칸 · 와인',cx+(k-(5-2*layer)/2)*.099,.087,1.534+layer*.084,
                   (k+layer)%4,(0 if side<0 else 2),True)
    for sx in (-1,1):
        for a in range(3):
            bottle('상단 X칸 · 측면 와인',cx+sx*(.341-.045*a),.091,1.895+.086*a,
                   3 if side<0 else 2,1 if side<0 else 4,True)
block('진열장 걸레받이',0,.012,.012,w-.02,d-.034,.051,ash)

group('더 마고 그릴 · 나무 와인 상자','cases',6)
def crate(x,y,z,w,d,h,open_):
    block('상자 밑판',x,y,z,w,d,.031,oak)
    for side in (-1,1):
        for j in range(2):
            hh=(h-.042)/2
            block('결이 보이는 상자 앞뒤 판재',x,y+side*(d/2-.012),z+.035+j*hh,w,.024,hh-.004,oak if j else sidewood)
        block('상자 측판',x+side*(w/2-.012),y,z+.032,.024,d-.019,h-.033,sidewood)
        for sy in (-1,1):
            block('상자 모서리 보강재',x+side*(w/2-.023),y+sy*(d/2-.023),z+.03,.042,.042,h-.03,oak)
            for zz in [.06,h-.042]:
                block('상자 못대가리',x+side*(w/2-.04),y+sy*(d/2+.001),z+zz,.009,.003,.009,nail)
    font('MARGAUX',x,y-d/2-.002,z+h*.61,.067,brand)
    font('S É L E C T I O N',x,y-d/2-.003,z+h*.39,.032,brand)
    if not open_:
        for i in range(4):block('나무 상자 뚜껑 판재',x+(i-1.5)*w/4,y,z+h-.008,w/4-.003,d,.023,oak)
        return
    # The top of an open case shows complete glass shoulders and paper labels.
    for k in range(4):
        xx=x+(k-1.5)*w/4
        block('병을 받치는 종이 패킹',xx,y,z+.049,.118,d-.07,.077,ivory)
        bottle('선물 상자의 와인',xx,y+.146,z+.160,k,(k+1)%5,True)
for col in [-1,1]:
    crate(col*.295,0,0,.566,.44,.235,False)
    crate(col*.295,0,.247,.566,.44,.235,col<0)
    if col>0:crate(col*.295,0,.494,.566,.44,.235,True)
group('더 마고 그릴 · 와인 진열 카트','trolley',10)
bronze=mat('카트의 낡은 황동','89724E',.28)
wheel=mat('고무 바퀴','393535')
linen=mat('나무 트레이 안감','E3D5B5')
for x in [-.54,.54]:
    for y_ in [-.274,.274]:
        block('황동 기둥',x,y_,.096,.024,.024,.793,bronze)
        # Keep the axle and tyre visible from either side of the freestanding cart.
        n=14
        verts=[(x+sign*.018,y_+.052*cos(tau*i/n),.066+.052*sin(tau*i/n)) for sign in [-1,1] for i in range(n)]
        faces=[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
        faces+=[tuple(reversed(range(n))),tuple(range(n,n*2))]
        mesh('황동 캐스터의 고무 바퀴',verts,faces,wheel,True)
        block('캐스터 포크',x,y_,.059,.044,.048,.065,bronze)
for z in [.176,.725]:
    block('이동식 진열 카트 선반',0,0,z,1.14,.61,.032,sidewood)
    block('밝은 목재 트레이',0,0,z+.032,1.106,.579,.012,linen)
    for sign in [-1,1]:
        block('트레이 황동 테두리',0,sign*.3,z+.026,1.14,.013,.055,bronze)
for x in [-.39,-.14,.12,.39]:
    bottle('진열 카트 · 세운 와인',x,.109,.775,int((x+.42)*6)%4,2 if x<0 else 0,False)
for x in [-.32,0,.32]:
    bottle('진열 카트 · 유리병',x,-.103,.775,2 if x<0 else 0,1 if x==0 else 3,False)
# A small menu card and a wine cradle sit beside the upright bottles.
board=block('셀렉션 스탠드',-.46,-.162,.768,.126,.038,.14,oak)
block('카트 위 테이스팅 카드',-.46,-.183,.792,.103,.004,.10,ivory)
for x in [-.30,.30]:
    crate(x,0,.222,.55,.411,.213,True)
group('더 마고 그릴 · 벽돌 궁륭과 석재 바닥','vault',14)
# Elliptical barrel vault, supplied to the game as a single draw. Brick joints
# follow the radial curve; the thin stone base follows the existing walk surface.
rr=3.34;spring=2.53;rise=1.17;half=6.83
def arch(t,y,rad=0):
    return ((rr+rad)*cos(t),y,spring+(rise+rad)*sin(t))
def panel(name,t0,t1,y0,y1,rad,m):
    return mesh(name,[arch(t0,y0,rad),arch(t1,y0,rad),arch(t1,y1,rad),arch(t0,y1,rad)],[(0,1,2,3)],m)
for row in range(64):
    t0=pi*row/64;t1=pi*(row+1)/64
    for band in range(14):
        panel('곡면 조적 바탕',t0,t1,-half+2*half*band/14,-half+2*half*(band+1)/14,.007,mortar)
    start=-half-(.25 if row%2 else 0)
    while start<half:
        lo=max(-half,start)+.004;hi=min(half,start+.50)-.004
        if hi>lo:
            panel('엇갈린 벽돌',t0+.00125,t1-.00125,lo,hi,0,rng.choice(bricks))
        start+=.5
for y in [-half+.11,-3.54,0,3.54,half-.11]:
    for k in range(34):
        t0=k*pi/34+.002;t1=(k+1)*pi/34-.002
        panel('천장 아치의 띠 벽돌',t0,t1,y-.087,y+.087,-.043,bricks[(k+4)%6])
        for side in (-1,1):
            mesh('띠 벽돌 마구리',[arch(t0,y+side*.087),arch(t1,y+side*.087),
                    arch(t1,y+side*.087,-.043),arch(t0,y+side*.087,-.043)],[(0,1,2,3)],bricks[(k+2)%6])
# The photographed far end has a glazed transom over the wine cabinets. Place
# the opaque architectural backing against the existing closed return wall.
for yf in [-half+.025,half-.025]:
    endglass=mat('스모크 유리 반사 '+str(yf),'655E5B',.19)
    for k in range(22):
        t0=pi*k/22;t1=pi*(k+1)/22
        a,b=arch(t0,yf),arch(t1,yf)
        mesh('아치 끝의 고정 유리',[(a[0],yf,2.38),(b[0],yf,2.38),b,a],[(0,1,2,3)],endglass)
    block('유리 상부의 가로 창틀',0,yf,2.421,rr*2,.04,.036,edge)
    for xx in [-2.15,-1.08,0,1.08,2.15]:
        hh=rise*(1-(xx/rr)**2)**.5
        block('끝창 세로 금속틀',xx,yf,2.45,.026,.043,spring+hh-2.45,edge)
for xx in [-rr+.05,rr-.05]:
    block('궁륭 하부 간접 조명',xx,0,spring-.043,.06,half*2,.035,warm)
block('점판암 바탕',0,0,.010,rr*2,half*2,.012,stone)
for row in range(15):
    for col in range(8):
        ww=rr*2/8;dd=half*2/15
        block('큰 점판암 타일',(col-3.5)*ww,(row-7)*dd,.021,ww-.004,dd-.004,.008,rng.choice(slate))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=22
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'cellar.blend'),compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')
for key in ['rack','cases','trolley','vault']:
    detail=['.34','.0016'] if key=='rack' else []
    subprocess.run(['node',str(HERE.parents[2]/'tools'/'pack_display.mjs'),str(HERE/(key+'.glb')),*detail],check=True)

# The original .blend stays editable; only the web copies receive baked lighting and the distant panel.
runpy.run_path(str(HERE/'bake-light.py'),run_name='__main__')
runpy.run_path(str(HERE/'bake.py'),run_name='__main__')
