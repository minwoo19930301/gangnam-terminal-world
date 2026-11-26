"""Editable picnic rug rack from Visit Seoul's photo of the Gangnam store."""
from math import cos, sin, pi, tau
from pathlib import Path
from random import Random
import runpy
import sys
import bpy

here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as mesh

bpy.ops.wm.read_factory_settings(use_empty=True)
root = bpy.data.collections.new('모던하우스 · 딸기와 데이지 러그')
bpy.context.scene.collection.children.link(root)
root['preview_origin'] = (0,0,0)
random = Random(81851)
for name,tone in {
    'steel':'484c4d','chrome':'a9adab','birch':'c39c74','wood':'a27a54',
    'green':'b5ce71','sage':'91ad53','blue':'88c9f4','lake':'6baacf',
    'white':'fff6de','cream':'e8dcc7','gold':'eabb59','red':'cb413e',
    'leaf':'487f53','pink':'e9bbc0','wicker':'bc996f','linen':'e3c495'
}.items():
    mesh.palette[name] = mesh.material(name,tone)
block,rod=mesh.block,mesh.rod

def group(name):
    group=bpy.data.collections.new(name)
    root.children.link(group)
    mesh.group=group

def oval(name,x,d,z,rx,rz,color,a=0,tip=0,n=22):
    pts=[]
    for i in range(n):
        t=tau*i/n
        h=sin(t)
        u=rx*cos(t)*(1+tip*h)
        v=rz*h
        pts.append((x+u*cos(a)-v*sin(a),d,z+u*sin(a)+v*cos(a)))
    return mesh.piece(name,pts,[tuple(range(n))],color)

def berry(x,d,z,scale):
    oval('도톰한 딸기 자수',x,d,z,.071*scale,.085*scale,'red',.18,.48)
    for k in range(3):
        oval('딸기 꼭지',x+(.025-k*.021)*scale,d-.001,z+.067*scale,
             .034*scale,.014*scale,'leaf',.6-k*.54,n=12)
    for u,v in [(-.037,.032),(.012,.031),(.041,-.003),(-.015,-.008),(.003,-.046)]:
        oval('딸기씨 매듭',x+u*scale,d-.002,z+v*scale,.004*scale,.006*scale,'gold',.22,n=7)

def daisy(x,d,z,scale):
    for k in range(5):
        a=k*tau/5+.31
        oval('데이지 꽃잎',x+.036*scale*cos(a),d,z+.036*scale*sin(a),
             .042*scale,.028*scale,'white',a,n=15)
    oval('꽃술',x,d-.002,z,.022*scale,.020*scale,'gold',n=14)

def hanging_mat(x,d,z,body,rim,mirror):
    w,h=.345,.603
    def point(a):
        # Rounded top and bottom with a scalloped inward sweep at each side.
        sx,sy=cos(a),sin(a)
        u=w*(1 if sx>=0 else -1)*abs(sx)**.68*(.84+.12*cos(2*pi*sy)+.13*sy**2)
        v=h*(1 if sy>=0 else -1)*abs(sy)**.79
        return x+u+mirror*.024*sy,d+.010*cos(3*a),z+v
    N=112
    outline=[point(tau*i/N) for i in range(N)]
    pts=[(u,dd+back,v) for back in [0,.024] for u,dd,v in outline]
    faces=[tuple(range(N)),tuple(reversed(range(N,2*N)))]+[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)]
    mesh.piece('곡선으로 오려낸 두꺼운 파일 러그',pts,faces,body)
    rod('둘레의 감침질 테',outline+[outline[0]],.007,rim,5)
    # Low, individually oriented loops catch the light above the flat ground.
    verts=[];faces=[]
    for i in range(1150):
        dx=random.uniform(-.33,.33); dz=random.uniform(-.59,.59)
        t=abs(dz/h)**(1/.79)
        width=w*(max(0,1-t*t)**.34)*(.84+.12*cos(2*pi*t)+.13*t*t)
        if abs(dx-mirror*.024*dz/h)>width-.018:continue
        u=x+dx;v=z+dz;step=random.uniform(.002,.005)
        k=len(verts)
        verts.extend([(u-step,d-.011,v),(u,d-.014,v+step),(u+step,d-.011,v+.001)])
        faces.append((k,k+1,k+2))
    mesh.piece('바탕에 솟은 짧은 고리실',verts,faces,rim)
    for j,(du,dz,size) in enumerate([(-.15,.37,1.05),(.13,.24,1.14),(-.11,.09,1),
                                     (.13,-.08,.93),(-.10,-.21,.94),(.09,-.40,1.02)]):
        (daisy if (j+mirror)%3 else berry)(x+du*mirror,d-.018,z+dz,size)
    block('천을 물린 강철 집게',x,d-.018,z+.557,.064,.032,.102,'chrome')
    rod('집게 걸이',[(x,d,z+.63),(x,d,z+.67),(x,d+.073,z+.71),(x,d+.105,z+.68)],.008,'chrome',8)

def basket(x,d,z,r):
    mesh.profile('바구니 짜임의 따뜻한 속면',x,d,z,[(r*.65,0),(r*.9,.031),(r,.085),(r*.93,.091),(r*.79,.038),(r*.5,.015)],'wicker',32)
    for i in range(36):
        a=tau*i/36
        rod('비스듬히 감은 왕골',[(x+rr*cos(a+b),d+rr*sin(a+b),z+h) for rr,b,h in
            [(r*.70,-.08,.010),(r*.92,.017,.048),(r,.09,.081)]],.003,'linen',4)
    rod('돌려 마감한 바구니 아가리',[(x+r*cos(tau*i/36),d+r*sin(tau*i/36),z+.087) for i in range(37)],.006,'linen',6)

def picnic_cloth():
    # A broad cotton sample droops between the rod clips. Its printed scene
    # follows the same folds as the cloth, including the turned lower hem.
    def depth(x,z):
        return .25+.032*sin(x*33)+.016*sin(x*18+z*3)
    left,right=-1.17,-.47
    pts=[];faces=[]
    for j in range(9):
        for i in range(31):
            x=left+(right-left)*i/30
            z=.93+j*.133+.017*cos(i*.42)*(1-j/8)
            pts.append((x,depth(x,z),z))
    for j in range(8):
        for i in range(30):
            n=31*j+i
            faces.append((n,n+1,n+32,n+31))
    mesh.piece('주름을 따라 드리운 피크닉 면포',pts,faces,'cream')
    rod('면포 아랫단의 두 줄 박음질',[(x,depth(x,.944)-.003,.944+.017*cos(i*.42)) for i,x in enumerate([left+(right-left)*j/30 for j in range(31)])],.002,'linen',4)
    def print_patch(name,coords,tone):
        mesh.piece(name,[(x,depth(x,z)-.007,z) for x,z in coords],[tuple(range(len(coords)))],tone)
    # The printed folding camp chair and foliage are simplified from the photo.
    print_patch('피크닉 천의 의자 등판',[(-.81,1.53),(-.68,1.55),(-.66,1.42),(-.78,1.40)],'wood')
    print_patch('피크닉 천의 의자 좌판',[(-.86,1.39),(-.78,1.41),(-.67,1.41),(-.72,1.37)],'birch')
    for a,b in [((-.84,1.37),(-.71,1.28)),((-.72,1.38),(-.83,1.26))]:
        rod('접의자의 가는 다리',[(x,depth(x,z)-.009,z) for x,z in [a,b]],.004,'wood',5)
    for j in range(22):
        a=random.random()*tau
        x=-1.05+.085*cos(a)*random.random();z=1.66+.048*sin(a)*random.random()
        print_patch('천에 인쇄된 나뭇잎',[(x-.019,z),(x,z+.012),(x+.030,z+.007),(x+.004,z-.010)],'green' if j%3 else 'sage')
    for x in [left+.04,right-.04]:
        block('면포용 나무 집게',x,.20,1.94,.029,.066,.115,'birch')
group('캠핑 의자를 인쇄한 면포')
picnic_cloth()
group('숯빛 철제 매대와 집게봉')
for x in [-1.22,0,1.22]:
    for d in [-.37,.34]:block('사각 철제 다리',x,d,0,.038,.038,.80,'steel')
for z in [.14,.77]:
    block('낮은 진열 선반판',0,-.016,z,2.48,.79,.034,'birch' if z<.2 else 'steel')
    block('짙은 선반 앞턱',0,-.414,z-.015,2.51,.028,.066,'steel')
for x in [-1.20,1.20]:block('뒤 프레임',x,.32,.80,.045,.047,1.35,'wood')
rod('긴 크롬 걸이봉',[(-1.2,.19,2.08),(1.2,.19,2.08)],.018,'chrome',12)
group('연두색과 파란색 파일 러그')
hanging_mat(-.08,.105,1.405,'green','sage',-1)
hanging_mat(.72,.105,1.405,'blue','lake',1)
group('아랫칸의 분홍색 여분 매트')
for x in [-.13,.65]:
    for i in range(4):
        o=mesh.profile('납작하게 포갠 분홍 매트',x,-.06,.175+i*.033,
                       [(.23,0),(.25,.010),(.25,.022),(.23,.031)],'pink',40,.83)
    for a in range(5):
        rad=.046; ang=a*tau/5
        mesh.profile('맨 위 매트의 크림 꽃잎',x+.040*cos(ang),-.06+.040*sin(ang),.308,[(rad,0),(rad,.002)],'cream',12)
group('소품을 담은 왕골 바구니')
for x,d,r in [(-.94,-.15,.175),(-.55,-.13,.15),(-.82,.16,.15)]:
    basket(x,d,.805,r)
    for j in range(3):
        block('바구니에 접어 넣은 작은 천',x-.039+j*.026,d-.008,.83+j*.018,.18,.12,.024,['cream','sage','blue'][j])
# Face the open aisle with the baskets at the left, as in the source photo.
for obj in root.all_objects:
    for point in obj.data.vertices:
        point.co.x *= -1
    obj.data.flip_normals()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'picnic.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
