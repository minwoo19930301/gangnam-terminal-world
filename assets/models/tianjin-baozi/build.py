"""Build the public Famille number-eight dumpling shop in separate editable collections."""
from math import pi,tau,sin,cos,sqrt
from mathutils import Vector,Matrix
from pathlib import Path
from random import Random
import subprocess,runpy,sys,json,os
import bpy

here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='파미에 116호 · 천진포자';scene.unit_settings.system='METRIC'
layout=json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import * as l from './layout.js';console.log(JSON.stringify(l));"],cwd=here));names=layout['names'];anchors=layout['anchors']
colors={'black':'182727','fascia':'233738','ink':'2c2f29','graphite':'343630','glass':'a6bcb4','steel':'adb4ae','shiny':'d5d9cc','darkmetal':'676c68','chrome':'c3c3ae',
 'bronze':'987b47','brass':'b28a44','gold':'d1a955','goldDark':'937033','halo':'ffebc3','red':'ad5343','cream':'eee4ce','light':'fff4d6',
 'ceiling':'e4d9c2','stone':'ae9e86','stoneDark':'817462','sand':'b4a68d','plinth':'303a39','floor':'a7937e','tileA':'baab94','tileB':'b4a38c','tileC':'b6a68e',
 'wall':'e5dfc9','reliefA':'e8e2d0','reliefB':'e0dac6','recess':'bdb8a7','seat':'d4c9ad','piping':'b4a98c','oak':'a8794a','oakLight':'b48655','oakDark':'785536','grain':'946a43',
 'endgrain':'83633e','beech':'ba9362','stool':'aa8154','benchDark':'725437','tissue':'38433c','paper':'e9e6d9','porcelain':'eee8d9','plateShade':'c9c4b6',
 'bamboo':'d6b98a','bamboo2':'c7a375','rattan':'b49161','knot':'8e6c44','linen':'e2d7b8','dough':'e6d7ad','fold':'d9c897','doughLit':'ede1c3','gyoza':'e1c795',
 'toast':'bd9159','crisp':'b17e49','paleToast':'d7b77a','noodle':'b18a48','noodle2':'b99555','bean':'d1bd8e','carrot':'c9794c','chive':'6b8053','leaf':'677d4e',
 'soy':'493626','chilli':'894636','water':'d5e5df','white':'f0ece4','tea':'beaa76','tray':'747d78'}
for k,val in colors.items():m.palette[k]=m.material(k,val,.64 if k in ('steel','shiny','darkmetal','chrome','bronze','brass','gold','goldDark') else 0)
for key,alpha,transmission in [('glass',.18,.84),('water',.28,.78)]:
    surface=m.palette[key];shader=surface.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Alpha'].default_value=alpha;shader.inputs['Transmission Weight'].default_value=transmission
    shader.inputs['Roughness'].default_value=.095;shader.inputs['IOR'].default_value=1.33 if key=='water' else 1.46
B,C,T=m.block,m.profile,m.rod
subjects={};rng=Random(11608)
def part(key):
    c=bpy.data.collections.new('천진포자 · '+names[key]);scene.collection.children.link(c);subjects[key]=c
    c['preview_origin']=(len(subjects)%5*16,(len(subjects)//5)*14,0);m.group=c;return c
def child(root,name):
    c=bpy.data.collections.new(name);root.children.link(c);m.group=c;return c
def smooth(o):
    for f in o.data.polygons:
        if len(f.vertices)<=4:f.use_smooth=True
    return o
def tube(name,points,r,c,seg=8):return smooth(T(name,points,r,c,seg))
def side_face(name,pts,depth,color):return m.piece(name,[(x,depth,z) for x,z in pts],[tuple(range(len(pts)))],color)
def ell(name,x,d,z,rx,rd,rz,col,n=16,k=10,rough=0,seed=0):
    rr=Random(seed);vs=[];fs=[]
    for j in range(k+1):
        t=-pi/2+pi*j/k
        for i in range(n):
            p=tau*i/n;f=1+rr.uniform(-rough,rough);vs.append((x+rx*cos(t)*cos(p)*f,d+rd*cos(t)*sin(p)*f,z+rz*sin(t)*f))
    for j in range(k):
        for i in range(n):fs.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
    return smooth(m.piece(name,vs,fs,col))
def ring(name,x,d,z,r,h,th,col,n=36):
    levels=[(r-th,0),(r,0),(r+.001,h*.15),(r,h),(r-th,h),(r-th,0)]
    verts=[(x+rad*cos(i*tau/n),d+rad*sin(i*tau/n),z+hh) for rad,hh in levels for i in range(n)]
    return smooth(m.piece(name,verts,[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(levels)-1) for i in range(n)],col))
def front_text(name,body,x,d,z,size,shade,ko=False,extrude=.0016):
    cu=bpy.data.curves.new(name,'FONT');cu.body=body;cu.align_x='CENTER';cu.align_y='CENTER';cu.size=size;cu.extrude=extrude;cu.resolution_u=4
    if ko:cu.font=font
    ob=bpy.data.objects.new(name,cu);m.group.objects.link(ob);cu.materials.append(m.palette[shade]);ob.location=(x,-d,z);ob.rotation_euler=(pi/2,0,pi)
    ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH');ob.select_set(False);return ob
font_file=next((p for p in [os.getenv('GTW_KOREAN_FONT'),'/System/Library/Fonts/Supplemental/AppleGothic.ttf',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/nanum/NanumGothic.ttf'] if p and Path(p).is_file()),None)
if not font_file:raise RuntimeError('Set GTW_KOREAN_FONT to a Korean font')
font=bpy.data.fonts.load(font_file)

shell=part('shell')
child(shell,'손님 홀 바닥과 천장')
W,D=12.06,9.63
B('줄눈이 있는 홀 바탕',0,D/2,.020,W,D,.020,'floor')
for i in range(12):
    for j in range(10):
        B('따뜻한 회갈색 정방형 바닥',(i-5.5)*1.0,(j+.5)*.960,.039,.998,.958,.009,('tileA','tileB','tileC')[(i+3*j)%3])
B('매입등을 위한 크림색 천장',0,D/2,3.532,W,.999*D,.115,'ceiling')
B('측면 마감 벽',5.755,D/2,.045,.105,D,3.50,'wall');B('벤치 쪽 벽',-5.985,D/2,.045,.074,D,3.50,'recess')
B('후면 흰 벽',0,9.56,.045,W,.098,3.5,'wall')
child(shell,'좌석 뒤 엇갈려 쌓은 입체 백색 벽돌')
for row in range(14):
    offset=.1725 if row%2 else 0
    for col in range(30):
        near=max(.09,col*.345-offset);far=min(D-.08,(col+1)*.345-offset)
        if far<=near+.015:continue
        # Offset alternating brick faces exactly where the seated customer's wall catches the downlights.
        depth=.057 if (row+col)%2 else .028
        B('번갈아 돌출한 백색 전돌',-5.935+depth/2,(near+far)/2,.84+row*.180,depth,far-near-.007,.174,
          'reliefA' if (row+col)%3 else 'reliefB')
child(shell,'벽면 긴 크림색 고정 소파')
for d,l in [(2.34,2.674),(5.02,2.674),(7.70,2.674)]:
    B('긴 의자의 목재 하중 받침',-5.546,d,.047,.795,l,.335,'oakDark',.012)
    B('긴 의자의 부드러운 좌판',-5.493,d,.365,.798,l-.022,.112,'seat',.034)
    B('벽에 붙은 크림색 등쿠션',-5.836,d,.454,.157,l-.019,.473,'seat',.033)
    tube('좌판 앞 가는 테두리',[(-5.094,d-l/2+.03,.435),(-5.094,d+l/2-.03,.435)],.005,'piping',7)

entry=part('entry')
child(entry,'짙은 전면 마감과 통창 테두리')
B('상부 짙은 청록 외장',0,.016,2.677,12.04,.237,.902,'fascia',.008)
B('상호 아래 목재 띠',0,-.081,2.614,12.05,.114,.073,'oak',.004)
for x in [-6.00,-.99,.99,6.00]:
    B('수직 목제 문틀',x,.032,.047,.075,.116,2.58,'oakDark',.004)
for side in [-1,1]:
    B('통창 하단 나무틀',side*3.50,0,.042,5.02,.124,.083,'oak',.004)
    for j in range(1,5):
        x=side*(.99+j);B('유리 사이 얇은 나무뼈',x,.026,.106,.044,.09,2.506,'oak',.002)
B('가운데 현관 하부 문턱',0,-.005,.045,1.92,.22,.009,'darkmetal',.002)
B('입구 발 매트',0,.392,.047,1.68,.46,.008,'graphite',.007)
for j in range(38):
    B('매트의 짧은 고무 돌기',(j-18.5)*.043,.39,.055,.007,.403,.003,'darkmetal')
for x in [-1.03,1.03]:
    B('문선 위 세로 손잡이 몸체',x,-.031,.393,.032,.057,1.25,'bronze',.006)
    for h in [.73,1.35]:B('손잡이 고정좌',x,-.013,h,.062,.057,.046,'goldDark',.004)
brand=part('brand');child(brand,'공식 전면 사진을 따른 금빛 획과 후광')
B('엷게 경사진 검은 상호 판',0,.024,-.02,2.65,.115,.75,'black',.020)
data=json.loads((here/'wordmark.json').read_text())
for key,tone,offset in [('halo','halo',.056),('gold','gold',.066),('seal','red',.070)]:
    cu=bpy.data.curves.new('상호 윤곽 '+key,'CURVE');cu.dimensions='2D';cu.fill_mode='BOTH';cu.extrude=.0024
    for ring_ in data[key]:
        spline=cu.splines.new('POLY');spline.points.add(len(ring_)-1);spline.use_cyclic_u=True
        for pt,(x,y) in zip(spline.points,ring_):pt.co=((x-222.5)*.00500,(108-y)*.00435,0,1)
    ob=bpy.data.objects.new('天津包子 '+key,cu);m.group.objects.link(ob);cu.materials.append(m.palette[tone])
    ob.rotation_euler=(pi/2,0,pi);ob.location=(0,offset,.342);ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH');ob.select_set(False)
front_text('한글 상호','천진포자',-.508,-.069,.075,.107,'cream',True)

grille=part('grille');child(grille,'유리 안쪽에 붙인 각진 회문 장식')
# Photo shows separate horizontal key-pattern registers and a tall rectangular central meander.
def fret(points,w=.017):
    # Mitered orthogonal turns are cut from one metal strip. Adjacent rectangles would hide faces at every joint.
    dirs=[]
    for (x,z),(xx,zz) in zip(points,points[1:]):
        direction=Vector((xx-x,zz-z)).normalized();dirs.append(Vector((-direction.y,direction.x)))
    v=[];faces=[]
    for i,(x,z) in enumerate(points):
        lo=dirs[max(0,i-1)];hi=dirs[min(i,len(dirs)-1)];normal=(lo+hi)/(1+lo.dot(hi))
        for depth in [-.035,-.023]:
            for side in [-1,1]:v.append((x+normal.x*w*.5*side,depth,z+normal.y*w*.5*side))
        if i:
            k=(i-1)*4;faces.extend([(k,k+1,k+5,k+4),(k+2,k+6,k+7,k+3),(k,k+4,k+6,k+2),(k+1,k+3,k+7,k+5)])
    n=len(v);faces.extend([(0,2,3,1),(n-4,n-3,n-1,n-2)])
    m.piece('모서리를 맞댄 금속 회문 띠',v,faces,'bronze')
for sign in [-1,1]:
    def trace(points,width=.017):fret([(x*sign,z) for x,z in points],width)
    trace([(.018,2.54),(.43,2.54),(.43,2.39),(.073,2.39),(.073,2.46),(.354,2.46)])
    trace([(.022,2.32),(.43,2.32),(.43,2.06),(.279,2.06),(.279,2.20),(.095,2.20),(.095,2.025),(.203,2.025),(.203,1.915),(.098,1.915)])
    trace([(.43,1.976),(.335,1.976),(.335,1.813),(.206,1.813),(.206,1.630),(.075,1.630),(.075,1.51),(.335,1.51),(.335,1.612),(.432,1.612)])
    trace([(.433,1.44),(.249,1.44),(.249,1.30),(.095,1.30),(.095,1.161),(.206,1.161),(.206,1.060),(.395,1.060),(.395,.897),(.28,.897),(.28,.976),(.085,.976)])
    trace([(.431,.824),(.431,.679),(.066,.679),(.066,.77),(.319,.77)])
    trace([(.43,.607),(.43,.17),(.218,.17),(.218,.504),(.073,.504),(.073,.227),(.146,.227)])
for z in [2.575,.627,.115]:B('横방향 창살 띠',0,-.027,z,.904,.015,.013,'bronze',.002)
glass=part('glass');m.piece('출입구 옆 투명 통창',[(-.482,.002,.126),(.482,.002,.126),(.482,.002,2.596),(-.482,.002,2.596)],[(0,1,2,3)],'glass')

# Independent procedural models keep the substantial files editable in the source collection.
env=dict(globals());runpy.run_path(str(here/'stone.py'),init_globals=env)
runpy.run_path(str(here/'fixtures.py'),init_globals=env)
runpy.run_path(str(here/'food.py'),init_globals=env)
bpy.data.fonts.remove(font)
bpy.context.view_layer.update()
for c in subjects.values():
    start=Vector(c['preview_origin'])
    for obj in c.all_objects:obj.location+=start;obj.select_set(False)
    c['reference']='신세계 센트럴·지점 방문 사진. 가게 치수와 부분별 배치·수량은 추정.'
bpy.context.view_layer.update()
runpy.run_path(str(here/'assembly.py'),init_globals=dict(globals()))
bpy.context.window.scene=bpy.data.scenes['116호 · 손님 홀과 조명']
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'restaurant.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
