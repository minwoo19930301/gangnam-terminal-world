"""Build the editable public crossing from the two January street views."""
from pathlib import Path
from math import cos, sin, pi, tau, hypot
from mathutils import Vector
import json
import subprocess
import sys
import bpy

here=Path(__file__).resolve().parent
tools=here.parents[2]/'tools'
sys.path.insert(0,str(tools))
import blender_shop_mesh as m
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='고터사거리 · 2026년 1월 거리'
scene.unit_settings.system='METRIC'
layout=json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {parts,prefix,rows,apron} from './layout.js';import {tiles} from './tactile.js';console.log(JSON.stringify({parts,prefix,rows,apron,tiles}));"],cwd=here))
palette={'brown':'514644','base':'59504b','shade':'1a1e20','rim':'303335','rubber':'222527','edge':'646968',
         'zinc':'a8aeaa','bolt':'bec3be','optic':'232d2d','blue':'204496','ivory':'f0f2eb','sun':'e4ae3e',
         'road':'787975','joint':'656664','stone1':'adaea7','stone2':'a5a6a1','stone3':'a2a39e',
         'curb':'bdbdb3','warn':'dbab43','summit':'e4b44d','red':'ff4136','redlow':'b62f27',
         'greenoff':'263c36','amberoff':'4c3d2b','redoff':'402c2b','white':'d8dcd6','letter':'e1e5d8'}
m.palette={k:m.material(k,v,.51 if k in ('zinc','bolt','edge') else .14 if k in ('brown','base','shade') else 0) for k,v in palette.items()}
bs=m.palette['red'].node_tree.nodes['Principled BSDF']
bs.inputs['Emission Color'].default_value=m.palette['red'].diffuse_color
bs.inputs['Emission Strength'].default_value=1.2
B=m.block;P=m.profile;R=m.rod
parts={}
def group(key):
    c=bpy.data.collections.new(layout['prefix']+layout['parts'][key][0]);scene.collection.children.link(c)
    parts[key]=c;m.group=c;return c

def prism(label,xy,z0,z1,material):
    n=len(xy)
    return m.piece(label,[(x,d,z) for z in [z0,z1] for x,d in xy],
        [tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],material)
def front(label,face,back,poly,material):
    n=len(poly)
    return m.piece(label,[(x,d,z) for d in (face,back) for x,z in poly],
        [tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,n+i,n+(i+1)%n,(i+1)%n) for i in range(n)],material)
def face_disc(name,x,d,z,r,depth,mat,segments=20):
    return R(name,[(x,d+depth,z),(x,d,z)],r,mat,segments)

group('mast')
P('앵커 플랜지와 검은 고무 하단',0,0,0,[(.204,0),(.205,.041),(.178,.064),(.173,.097),(.158,.119),(.155,.218)],'base',32)
P('도장된 원형 신호주',0,0,0,[(.142,.13),(.141,.47),(.133,2.65),(.122,4.85),(.106,6.94),(.092,7.016),(.077,7.034)],'brown',36)
for h in [.41,2.49,2.66,3.24,3.49,3.89,4.03,4.22,4.61,4.83,6.39,6.61,6.89]:
    r=.143-.033*(h/7)
    P('이음 쌍쇠 띠',0,0,h,[(r,0),(r+.004,.005),(r+.004,.029),(r,.034)],'zinc' if h<4.6 else 'base',28)
    B('밴드 래치',r*.70,r*.69,h+.009,.037,.027,.019,'edge',.004)
for i in range(8):
    a=i*tau/8;P('기단 너트',.172*cos(a),.172*sin(a),.039,[(.015,0),(.014,.017)],'zinc',6)
group('booms')
def boomrod(name,points,r,col,seg=12):
    return R(name,[(x+5.71,d+5.10,z-4.61) for x,d,z in points],r,col,seg)
for side,length,heads in [(0,11.70,[4.29,7.23,10.67]),(1,10.2,[3.05,8.08])]:
    def rail(t,h):return (-t,.012,h) if side==0 else (.012,-t,h)
    boomrod('주강 가로암', [rail(.05,6.71),rail(length*.28,6.75),rail(length*.71,6.71),rail(length,6.65)],.083,'brown',16)
    boomrod('밑단 사재',[rail(.115,4.69),rail(1.59,6.70)],.043,'brown')
    boomrod('상부 인장선',[rail(.09,6.98),rail(length*.47,6.81),rail(length*.91,6.69)],.014,'edge',8)
    for t in [1.58,length*.47,length*.91]:
        boomrod('강관 연결 소켓',[rail(t-.076,6.72),rail(t+.076,6.72)],.095,'base')
    for t in heads:
        for delta in [-.44,.44]:
            boomrod('신호기 수직 행거',[rail(t+delta,6.72),rail(t+delta,6.40)],.028,'shade')
        boomrod('신호기 승강 프레임',[rail(t-.57,6.40),rail(t+.57,6.40)],.029,'edge')

def visor(label,x,d,z,r,l):
    n=14;angles=[(-14+208*i/n)*pi/180 for i in range(n+1)]
    verts=[]
    for side in [0,1]:
        for rim in [0,1]:
            for a in angles:
                rr=r+.009*rim
                verts.append((x+rr*cos(a),d-side*l*(.49+.51*max(0,sin(a))),z+rr*sin(a)))
    s=n+1;faces=[]
    for j,k in [(0,1),(1,3),(3,2),(2,0)]:
        faces.extend([(j*s+i,j*s+i+1,k*s+i+1,k*s+i) for i in range(n)])
    faces.extend([(0,s,3*s,2*s),(n,2*s+n,3*s+n,s+n)])
    m.piece(label,verts,faces,'shade')
def head(label,x,z,sz):
    B(label+' · 뒷덮개',x,.016,z-sz*.50,sz, .196,sz,'shade',.025)
    B(label+' · 빗물 고무링',x,-.089,z-sz*.455,sz*.91,.035,sz*.91,'rubber',.015)
    face_disc(label+' · 렌즈 둘레',x,-.117,z,sz*.414,.032,'rim',30)
    visor(label+' · 원호형 차광판',x,-.113,z,sz*.428,sz*.70)
    for u in [-1,1]:
        for v in [-1,1]:
            face_disc('힌지 나사',x+u*sz*.414,-.111,z+v*sz*.387,.007,.009,'edge',6)
group('walker')
for i,z in enumerate([.189,.530,.871]):
    head('보행등 '+str(i+1)+'단',0,z,.342)
B('후면 행거',0,.135,.15,.109,.121,.74,'edge',.015)
for h in [.27,.80]:R('주물 받침',[(0,.087,h),(0,.192,h),(0,.201,h+.058)],.034,'shade')
group('four')
for i in range(4):head('차량등 '+str(i+1)+'구',(i-1.5)*.368,.222,.358)
B('후면 연결대',0,.154,.135,1.51,.056,.122,'shade',.013)
for x in [-.45,.45]:B('수평 장착 귀',x,.151,.19,.081,.092,.239,'edge',.011)

# Lenses carry an actual dot matrix. Each dot is an editable mesh island.
def stroke(x,y,x1,y1,x2,y2,width):
    vx=x2-x1;vy=y2-y1
    t=max(0,min(1,((x-x1)*vx+(y-y1)*vy)/(vx*vx+vy*vy or 1)))
    return hypot(x-x1-vx*t,y-y1-vy*t)<width
def person(x,y,moving):
    if hypot(x-(.13 if moving else .02),y-.58)<.16:return True
    segments=[(.01,.30,-.036,-.15,.159),(-.09,.21,-.19,-.10,.069),(.07,.22,.21,-.10,.067),
              (-.076,-.14,-.114,-.72,.080),(.041,-.14,.100,-.72,.079)]
    if moving:segments=[(.08,.29,-.05,-.15,.13),(.09,.23,.32,.02,.065),(-.01,.16,-.34,.03,.066),
        (-.05,-.12,-.35,-.65,.077),(-.04,-.15,.18,-.34,.082),(.18,-.34,.41,-.61,.074)]
    return any(stroke(x,y,*p) for p in segments)
def numbers(x,y):
    for c in [-.31,.31]:
        if any(stroke(x,y,*p,.042) for p in [(c-.15,.56,c+.15,.56),(c-.15,0,c+.15,0),(c-.15,-.56,c+.15,-.56),
            (c-.19,.50,c-.19,.07),(c+.19,.50,c+.19,.07),(c-.19,-.07,c-.19,-.50),(c+.19,-.07,c+.19,-.50)]):return True
    return False
def matrix_face(label,x,z,r,predicate,ink):
    face_disc(label+' · 검은 다공 렌즈',x,-.002,z,r,.010,'optic',40)
    verts=[];faces=[];glow=[]
    for i in range(-14,15):
        for j in range(-14,15):
            xx=i/14; yy=j/14
            if xx*xx+yy*yy>.927 or not predicate(xx,yy):continue
            n=len(verts);size=r*(.031 if ink=='red' else .0254)
            for k in range(6):
                a=tau*k/6;verts.append((x+r*xx+size*cos(a),-.0041,z+r*yy+size*sin(a)))
                if ink=='red':glow.append((x+r*xx+r*.044*cos(a),-.00275,z+r*yy+r*.044*sin(a)))
            faces.append(tuple(n+k for k in range(6)))
    if glow:m.piece(label+' · 렌즈에 번지는 빛',glow,faces,'redlow')
    if faces:m.piece(label+' · 육각 LED 군',verts,faces,ink)
group('pixels')
matrix_face('서 있는 사람',0,.816,.135,lambda x,y:person(x,y,False),'red')
matrix_face('걷는 사람',0,.475,.135,lambda x,y:person(x,y,True),'greenoff')
matrix_face('잔여 시간',0,.134,.135,numbers,'greenoff')
group('lens')
for i in range(4):
    x=(i-1.5)*.368
    if i==2:
        mask=lambda u,v:abs(v)<.105 and -.57<u<.57 or stroke(u,v,-.59,0,-.27,.32,.093) or stroke(u,v,-.59,0,-.27,-.32,.093)
    else:mask=lambda u,v:True
    matrix_face('등면 '+str(i+1),x,.153,.143,mask,['red','amberoff','greenoff','greenoff'][i])
group('sound')
B('음향 안내기 · 후면 고정 레일',0,.045,.035,.106,.059,.415,'edge',.011)
B('진회색 금속 몸통',0,0,0,.147,.101,.478,'rim',.018)
B('비가림 뚜껑',0,-.022,.447,.162,.137,.032,'shade',.012)
B('앞쪽 조작면',0,-.058,.035,.128,.021,.379,'edge',.009)
for j in range(6):
    for i in range(5):
        face_disc('안내 음성 구멍',(i-2)*.017,-.071,.301+j*.014,.0043,.003,'rubber',8)
face_disc('버튼 테두리',0,-.077,.185,.048,.011,'shade')
face_disc('황색 누름단추',0,-.087,.185,.038,.011,'sun')
for j,n in enumerate([3,4,3]):
    for i in range(n):face_disc('점자 돌기',(i-(n-1)/2)*.010,-.071,.071+j*.012,.0031,.004,'ivory',6)
for x in [-.049,.049]:
    for h in [.055,.389]:face_disc('덮개 작은 나사',x,-.071,h,.0045,.005,'zinc',6)
group('bollard')
P('매립 원판',0,0,0,[(.071,0),(.071,.027),(.059,.032)],'rim')
P('검은 탄성 볼라드',0,0,.014,[(.059,0),(.060,.080),(.054,.10),(.052,.759),(.050,.794),(.043,.814),(.025,.833),(0,.839)],'shade',24)
for h in [.543,.673]:P('백색 반사 시트',0,0,h,[(.053,0),(.054,.004),(.054,.062),(.053,.066)],'white',24)

def sign(key,width,height,hangul,roman,left,right):
    group(key)
    tip=.069
    def outline(w,h):
        return [(-w/2+tip,0),(w/2-tip,0),(w/2,h*.41),(w/2,h*.57),(w/2-tip,h),(-w/2+tip,h),(-w/2,h*.57),(-w/2,h*.41)]
    front('도로명판 절곡 몸체',-.027,.027,outline(width,height),'zinc')
    for side,d in [('back',.033),('front',-.032)]:
        facing=1 if side=='back' else -1
        front('알루미늄 테두리 '+side,d,d+.007,outline(width,height),'zinc')
        front('반사 백색 둘레 '+side,d+facing*.009,d+facing*.008,outline(width-.008,height-.006),'ivory')
        front('청색 반사 필름 '+side,d+facing*.011,d+facing*.010,[(x,z+.008) for x,z in outline(width-.020,height-.022)],'blue')
    font_path=Path('/System/Library/Fonts/AppleSDGothicNeo.ttc')
    if not font_path.exists():font_path=Path('/usr/share/fonts/truetype/nanum/NanumGothic.ttf')
    font=bpy.data.fonts.load(str(font_path),check_existing=True) if font_path.exists() else None
    def letters(text,x,h,max_w,size,reverse=False):
        curve=bpy.data.curves.new(text,'FONT');curve.body=text;curve.align_x='CENTER';curve.align_y='CENTER';curve.size=size;curve.resolution_u=4
        if font:curve.font=font
        ob=bpy.data.objects.new(text,curve);m.group.objects.link(ob)
        ob.rotation_euler=(pi/2,0,0 if reverse else pi);ob.location=(x,-.049 if reverse else .048,h)
        curve.materials.append(m.palette['ivory']);bpy.context.view_layer.update()
        if ob.dimensions.x>max_w:ob.scale.x*=max_w/ob.dimensions.x
        bpy.context.view_layer.update()
        mesh=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
        res=bpy.data.objects.new(text+' · 표시 면',mesh);m.group.objects.link(res);res.matrix_world=ob.matrix_world.copy()
        res['editable inscription']=text
        bpy.data.objects.remove(ob,do_unlink=True)
    for rev in [False,True]:
        letters(hangul,0,height*.644,width*.60,height*.61,rev)
        letters(roman,0,height*.268,width*.56,height*.328,rev)
        for s,txt in [(-1,left),(1,right)]:
            letters(txt,s*(1 if rev else -1)*width*.356,height*.519,width*.163,height*.336,rev)
    B('상단 고정 리브',0,0,height-.015,width*.92,.042,.020,'zinc',.002)
sign('sinbanpo',1.095,.306,'신반포로','Sinbanpo-ro','228','232')
sign('jamwon',.932,.285,'잠원로','Jamwon-ro','34','30')

# Clip each paving unit to the surveyed corner polygon in its road axes.
group('stone')
poly=[tuple(p) for p in layout['apron']]
def shift(poly,x,d):return [(a-x,b-d) for a,b in poly]
prism('모르타르 기층',shift(poly,4.65,4.95),0,.131,'joint')
def clipped(coords,axis,limit,keep):
    out=[]
    for a,b in zip(coords,coords[1:]+coords[:1]):
        da=(a[axis]-limit)*keep;db=(b[axis]-limit)*keep
        if da>=0:out.append(a)
        if (da<0)!=(db<0):
            t=da/(da-db);out.append(tuple(v+t*(w-v) for v,w in zip(a,b)))
    return out
for j in range(31):
    d=-.34+j*.36
    for i in range(-4,19):
        x=i*.62+(j%2)*.31
        pts=poly[:]
        for ax,b,k in [(0,x+.002,1),(0,x+.617,-1),(1,d+.002,1),(1,d+.357,-1)]:
            if pts:pts=clipped(pts,ax,b,k)
        if len(pts)>=3:prism('엇갈린 화강석 보도판',shift(pts,4.65,4.95),.128,.144,'stone'+str((i+j*j)%3+1))
for a,b in zip(poly,poly[1:]+poly[:1]):
    vx=b[0]-a[0];vd=b[1]-a[1];length=hypot(vx,vd);n=max(1,round(length/.68));delta=(-vd*.155/length,vx*.155/length)
    for i in range(n):
        q=[(a[0]+vx*t,a[1]+vd*t) for t in [(i+.008)/n,(i+.992)/n]]
        pts=q+[(x+delta[0],d+delta[1]) for x,d in reversed(q)]
        prism('둥근 모서리 경계석',shift(pts,4.65,4.95),.007,.148,'curb')
group('tactile')
def tile(x,d,dots,rot=False):
    x-=.82;d-=1.32
    B('점형 주의 블록' if dots else '선형 유도 블록',x,d,0,.295,.295,.011,'warn',.003)
    if dots:
        for i in [-1.5,-.5,.5,1.5]:
            for j in [-1.5,-.5,.5,1.5]:
                P('경사 마감된 촉지도 돌기',x+i*.067,d+j*.067,.009,[(.017,0),(.015,.005),(.011,.008)],'summit',12)
    else:
        for u in [-1.5,-.5,.5,1.5]:
            B('장형 유도 돌기',x+(0 if rot else u*.067),d+(u*.067 if rot else 0),.009,.257 if rot else .028,.028 if rot else .257,.008,'summit',.005)
for t in layout['tiles']:tile(t['x'],t['d'],t['kind']=='dot',t['kind']=='across')

# Use collection instances in the editing scene so changing one head updates all arms.
for part in parts.values():scene.collection.children.unlink(part)
for row in layout['rows']:
    ob=bpy.data.objects.new(layout['parts'][row['key']][0],None);scene.collection.objects.link(ob)
    ob.instance_type='COLLECTION';ob.instance_collection=parts[row['key']];ob.empty_display_size=.11
    ob.location=(row['x'],-row['d'],row['y']);ob.rotation_euler.z=row['yaw']
for ar in bpy.context.screen.areas:
    if ar.type=='VIEW_3D':
        ar.spaces.active.region_3d.view_distance=16
        ar.spaces.active.region_3d.view_location=(-2,1.5,3.4)
        ar.spaces.active.shading.color_type='MATERIAL'
scene.world=bpy.data.worlds.new('거리의 간접광');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.54,.65,.82,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.68
def area(xyz,power,size,color,target):
    light=bpy.data.lights.new('거리 촬영 반사판','AREA');light.energy=power;light.shape='DISK';light.size=size;light.color=color
    obj=bpy.data.objects.new(light.name,light);scene.collection.objects.link(obj);obj.location=xyz
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
area((-6,1,11),1700,7,(1,.86,.70),(-2,1,3))
area((3,8,7),1100,6,(.75,.87,1),(0,0,3))
cam=bpy.data.cameras.new('거리 하드웨어');ob=bpy.data.objects.new('편집 장면 카메라',cam);scene.collection.objects.link(ob);scene.camera=ob
views=[((-15,14,7),(-3.5,3,3.4),34),((-3.9,4.6,3.1),(0,0,3.37),62),((-.95,1.45,1.16),(0,-.01,1.14),70),((2.9,-4.7,4.4),(.7,-1.4,0),51)]
def camera(view):
    xyz,target,lens=view;ob.location=xyz;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();cam.lens=lens
camera(views[0]);scene.view_settings.view_transform='AgX'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'signals.blend'),compress=True)
# Link individual originals only during export so font inscription matrices evaluate in local space.
for key,col in parts.items():
    scene.collection.children.link(col);bpy.context.view_layer.update()
    if key=='tactile':
        for stem,label in [('dot','경사 마감된 촉지도 돌기'),('guide','장형 유도 돌기')]:
            islands=sorted((o for o in col.objects if o.name.startswith(label)),key=lambda o:o.name)
            template=bpy.data.collections.new('웹용 유도블록 단위')
            scene.collection.children.link(template)
            point=islands[0];template.objects.link(point)
            xs=[p.co.x for p in point.data.vertices];ys=[p.co.y for p in point.data.vertices]
            template['preview_origin']=((min(xs)+max(xs))/2,(min(ys)+max(ys))/2,.009)
            for ob in islands:col.objects.unlink(ob)
            bpy.context.view_layer.update()
            bake_collection(template,stem,here/(stem+'.glb'))
            bpy.data.collections.remove(template)
        slabs=list(col.objects)
        for ob in slabs:
            for mod in ob.modifiers:mod.show_viewport=False
        bake_collection(col,key,here/'tactile.glb')
        for ob in slabs:
            for mod in ob.modifiers:mod.show_viewport=True
        for ob in bpy.data.objects:
            if not ob.users_collection and any(ob.name.startswith(k) for k in ['경사 마감된 촉지도 돌기','장형 유도 돌기']):col.objects.link(ob)
    else:bake_collection(col,key,here/(key+'.glb'),preserve_smoothing=True)
    scene.collection.children.unlink(col)
if '--render' in sys.argv:
    scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True
    scene.render.resolution_x=900;scene.render.resolution_y=575;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=88
    for i,v in enumerate(views):
        camera(v);scene.render.filepath='/tmp/gtw-signal-studio-'+str(i)+'.jpg';bpy.ops.render.render(write_still=True)
